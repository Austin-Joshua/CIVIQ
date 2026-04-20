package security

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	colAttackLogs   = "security_attack_logs"
	colBackupAlerts = "security_backup_alerts"
)

var errUnsupportedAttackCommand = errors.New("unsupported command")

// ErrUnsupportedAttackCommand is returned for unknown simulation commands.
var ErrUnsupportedAttackCommand = errUnsupportedAttackCommand

// AttackLog stores executed attacks, blocked threats, and recovery/sync actions.
type AttackLog struct {
	ID           string         `bson:"_id" json:"id"`
	Command      string         `bson:"command" json:"command"`
	Status       string         `bson:"status" json:"status"` // executed | blocked | recovery | sync
	Message      string         `bson:"message" json:"message"`
	TelegramUser int64          `bson:"telegramUser,omitempty" json:"telegramUser,omitempty"`
	TelegramChat string         `bson:"telegramChat,omitempty" json:"telegramChat,omitempty"`
	AffectedIDs  []string       `bson:"affectedIds,omitempty" json:"affectedIds,omitempty"`
	Meta         map[string]any `bson:"meta,omitempty" json:"meta,omitempty"`
	Timestamp    time.Time      `bson:"timestamp" json:"timestamp"`
}

type backupAlertDoc struct {
	ID        string         `bson:"_id"`
	Doc       map[string]any `bson:"doc"`
	Checksum  string         `bson:"checksum"`
	UpdatedAt time.Time      `bson:"updatedAt"`
}

func (s *Service) backupDB() *mongo.Database {
	if s.cfg != nil && strings.TrimSpace(s.cfg.SecurityBackupDatabaseName) != "" {
		return s.db.Client().Database(strings.TrimSpace(s.cfg.SecurityBackupDatabaseName))
	}
	return s.db.Client().Database(s.db.Name() + "_backup")
}

func (s *Service) backupSyncIntervalSec() int {
	if s.cfg != nil && s.cfg.SecurityBackupSyncIntervalSec >= 5 {
		return s.cfg.SecurityBackupSyncIntervalSec
	}
	return 30
}

func (s *Service) startBackupSyncWorker(parent context.Context) {
	ctx, cancel := context.WithCancel(parent)
	s.stopBackup = cancel
	go func() {
		t := time.NewTicker(time.Duration(s.backupSyncIntervalSec()) * time.Second)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				if !s.monitoringOn() {
					continue
				}
				if err := s.SyncBackupNow(context.Background()); err != nil {
					log.Println("security: backup sync worker:", err)
				}
			}
		}
	}()
}

func (s *Service) logAttack(ctx context.Context, command, status, msg string, telegramUser int64, chatID string, affectedIDs []string, meta map[string]any) {
	row := AttackLog{
		ID:           uuid.New().String(),
		Command:      command,
		Status:       status,
		Message:      msg,
		TelegramUser: telegramUser,
		TelegramChat: chatID,
		AffectedIDs:  affectedIDs,
		Meta:         meta,
		Timestamp:    time.Now().UTC(),
	}
	_, _ = s.db.Collection(colAttackLogs).InsertOne(ctx, row)
}

func stableNormalize(v any) any {
	switch t := v.(type) {
	case map[string]any:
		keys := make([]string, 0, len(t))
		for k := range t {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		d := bson.D{}
		for _, k := range keys {
			d = append(d, bson.E{Key: k, Value: stableNormalize(t[k])})
		}
		return d
	case bson.M:
		m := map[string]any(t)
		return stableNormalize(m)
	case []any:
		out := make([]any, len(t))
		for i := range t {
			out[i] = stableNormalize(t[i])
		}
		return out
	default:
		return v
	}
}

func checksumDoc(m map[string]any) string {
	normalized := stableNormalize(m)
	raw, _ := bson.Marshal(normalized)
	h := sha256.Sum256(raw)
	return hex.EncodeToString(h[:])
}

func copyMap(src map[string]any) map[string]any {
	out := make(map[string]any, len(src))
	for k, v := range src {
		out[k] = v
	}
	return out
}

func (s *Service) SyncBackupNow(ctx context.Context) error {
	if !s.monitoringOn() {
		return nil
	}
	mainCol := s.db.Collection("alerts")
	backupCol := s.backupDB().Collection(colBackupAlerts)
	cur, err := mainCol.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	var ids []string
	upserts := 0
	for cur.Next(ctx) {
		doc := bson.M{}
		if err := cur.Decode(&doc); err != nil {
			continue
		}
		id, _ := doc["_id"].(string)
		if id == "" {
			continue
		}
		ids = append(ids, id)
		sum := checksumDoc(map[string]any(doc))
		_, err := backupCol.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
			"$set": bson.M{
				"doc":       doc,
				"checksum":  sum,
				"updatedAt": time.Now().UTC(),
			},
		}, options.Update().SetUpsert(true))
		if err == nil {
			upserts++
		}
	}
	if len(ids) > 0 {
		_, _ = backupCol.DeleteMany(ctx, bson.M{"_id": bson.M{"$nin": ids}})
	}
	s.logAttack(ctx, "sync_backup", "sync", fmt.Sprintf("backup synced (%d docs)", upserts), 0, "", nil, map[string]any{"upserts": upserts})
	return cur.Err()
}

func (s *Service) RecoverMainFromBackup(ctx context.Context) (map[string]int, error) {
	mainCol := s.db.Collection("alerts")
	backupCol := s.backupDB().Collection(colBackupAlerts)

	restored := 0
	cleaned := 0
	replaced := 0

	// Replace altered rows + remove simulated rows that have no backup reference.
	cur, err := mainCol.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	for cur.Next(ctx) {
		doc := bson.M{}
		if cur.Decode(&doc) != nil {
			continue
		}
		id, _ := doc["_id"].(string)
		if id == "" {
			continue
		}
		var b backupAlertDoc
		err := backupCol.FindOne(ctx, bson.M{"_id": id}).Decode(&b)
		if err == mongo.ErrNoDocuments {
			if sim, _ := doc["attackSim"].(bool); sim {
				if _, e := mainCol.DeleteOne(ctx, bson.M{"_id": id}); e == nil {
					cleaned++
				}
			}
			continue
		}
		if err != nil {
			continue
		}
		mainSum := checksumDoc(map[string]any(doc))
		if mainSum != b.Checksum {
			if _, e := mainCol.ReplaceOne(ctx, bson.M{"_id": id}, b.Doc); e == nil {
				replaced++
			}
		}
	}
	_ = cur.Close(ctx)

	// Restore missing rows from backup.
	bcur, err := backupCol.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	for bcur.Next(ctx) {
		var b backupAlertDoc
		if bcur.Decode(&b) != nil {
			continue
		}
		n, _ := mainCol.CountDocuments(ctx, bson.M{"_id": b.ID})
		if n == 0 {
			if _, e := mainCol.InsertOne(ctx, b.Doc); e == nil {
				restored++
			}
		}
	}
	_ = bcur.Close(ctx)

	s.logAttack(ctx, "recovery", "recovery", "main DB restored from backup", 0, "", nil, map[string]any{
		"restored": restored,
		"cleaned":  cleaned,
		"replaced": replaced,
	})
	return map[string]int{"restored": restored, "cleaned": cleaned, "replaced": replaced}, nil
}

func (s *Service) ListAttackLogs(ctx context.Context, limit int64) ([]AttackLog, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	cur, err := s.db.Collection(colAttackLogs).Find(
		ctx,
		bson.M{},
		options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []AttackLog
	for cur.Next(ctx) {
		var row AttackLog
		if cur.Decode(&row) != nil {
			continue
		}
		out = append(out, row)
	}
	return out, cur.Err()
}

func (s *Service) authorizedTelegramUser(userID int64) bool {
	if s.cfg == nil || len(s.cfg.TelegramAllowedUserIDs) == 0 {
		return false
	}
	for _, id := range s.cfg.TelegramAllowedUserIDs {
		if id == userID {
			return true
		}
	}
	return false
}

func (s *Service) ExecuteTelegramAttackCommand(ctx context.Context, command string, telegramUser int64, chatID string) (string, error) {
	cmd := strings.ToLower(strings.TrimSpace(command))
	if cmd == "/help" || cmd == "/commands" {
		return "Available commands:\n/security_on\n/security_off\n/insert\n/delete\n/manipulate\n/duplicate\n/help", nil
	}
	if !s.authorizedTelegramUser(telegramUser) {
		s.logAttack(ctx, cmd, "blocked", "unauthorized telegram user", telegramUser, chatID, nil, nil)
		return "Unauthorized command source.", nil
	}
	if cmd == "/security_on" {
		if err := s.SetMonitoringEnabled(ctx, true); err != nil {
			return "Could not turn security ON.", err
		}
		return "Security mode turned ON. Threat attacks are now blocked.", nil
	}
	if cmd == "/security_off" {
		if err := s.SetMonitoringEnabled(ctx, false); err != nil {
			return "Could not turn security OFF.", err
		}
		return "Security mode turned OFF. Attack simulation commands are allowed.", nil
	}
	if !s.telegramCommandsOn() {
		s.logAttack(ctx, cmd, "blocked", "telegram security toggle is OFF", telegramUser, chatID, nil, nil)
		return "Telegram attack command processing is disabled by security settings.", nil
	}
	if s.monitoringOn() {
		s.logAttack(ctx, cmd, "blocked", "security mode is ON", telegramUser, chatID, nil, nil)
		return "Threat attack has been stopped by the security system.", nil
	}
	switch cmd {
	case "/insert":
		return s.attackInsert(ctx, telegramUser, chatID)
	case "/delete":
		return s.attackDelete(ctx, telegramUser, chatID)
	case "/manipulate":
		return s.attackManipulate(ctx, telegramUser, chatID)
	case "/duplicate":
		return s.attackDuplicate(ctx, telegramUser, chatID)
	default:
		return "Unknown command. Use /insert /delete /manipulate /duplicate", errUnsupportedAttackCommand
	}
}

// ExecuteAdminAttackCommand allows privileged API-based attack simulation.
// It still respects global security mode (monitoringOn), so tests can verify ON/OFF behavior.
func (s *Service) ExecuteAdminAttackCommand(ctx context.Context, command, actor string) (string, error) {
	cmd := strings.ToLower(strings.TrimSpace(command))
	if !strings.HasPrefix(cmd, "/") {
		cmd = "/" + cmd
	}
	if s.monitoringOn() {
		s.logAttack(ctx, cmd, "blocked", "security mode is ON (admin test)", 0, actor, nil, nil)
		return "Threat attack has been stopped by the security system.", nil
	}
	switch cmd {
	case "/insert":
		return s.attackInsert(ctx, 0, actor)
	case "/delete":
		return s.attackDelete(ctx, 0, actor)
	case "/manipulate":
		return s.attackManipulate(ctx, 0, actor)
	case "/duplicate":
		return s.attackDuplicate(ctx, 0, actor)
	default:
		return "Unknown command. Use insert/delete/manipulate/duplicate", errUnsupportedAttackCommand
	}
}

func (s *Service) pickAnyOrganizationID(ctx context.Context) string {
	doc := bson.M{}
	if s.db.Collection("organizations").FindOne(ctx, bson.M{}).Decode(&doc) == nil {
		if id, _ := doc["_id"].(string); id != "" {
			return id
		}
	}
	return "unknown-org"
}

func (s *Service) attackInsert(ctx context.Context, telegramUser int64, chatID string) (string, error) {
	id := uuid.New().String()
	doc := bson.M{
		"_id":            id,
		"type":           "THREAT_SIMULATED",
		"severity":       "CRITICAL",
		"status":         "DETECTED",
		"message":        "Simulated malicious insert from Telegram command",
		"timestamp":      time.Now().UTC(),
		"resolved":       false,
		"organizationId": s.pickAnyOrganizationID(ctx),
		"attackSim":      true,
		"attackCommand":  "/insert",
		"attackAt":       time.Now().UTC(),
	}
	_, err := s.db.Collection("alerts").InsertOne(ctx, doc)
	if err != nil {
		return "Insert attack failed.", err
	}
	s.logAttack(ctx, "/insert", "executed", "false data inserted into main DB", telegramUser, chatID, []string{id}, nil)
	return "Attack simulated: false data inserted.", nil
}

func (s *Service) attackDelete(ctx context.Context, telegramUser int64, chatID string) (string, error) {
	col := s.db.Collection("alerts")
	doc := bson.M{}
	if err := col.FindOne(ctx, bson.M{}, options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})).Decode(&doc); err != nil {
		return "No data available to delete.", nil
	}
	id, _ := doc["_id"].(string)
	if id == "" {
		return "No valid record found for delete simulation.", nil
	}
	if _, err := col.DeleteOne(ctx, bson.M{"_id": id}); err != nil {
		return "Delete attack failed.", err
	}
	s.logAttack(ctx, "/delete", "executed", "record deleted from main DB", telegramUser, chatID, []string{id}, nil)
	return "Attack simulated: record deleted.", nil
}

func (s *Service) attackManipulate(ctx context.Context, telegramUser int64, chatID string) (string, error) {
	col := s.db.Collection("alerts")
	doc := bson.M{}
	if err := col.FindOne(ctx, bson.M{}, options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})).Decode(&doc); err != nil {
		return "No data available to manipulate.", nil
	}
	id, _ := doc["_id"].(string)
	if id == "" {
		return "No valid record found for manipulate simulation.", nil
	}
	_, err := col.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"message":       "Simulated manipulated value from Telegram threat command",
			"attackSim":     true,
			"attackCommand": "/manipulate",
			"attackAt":      time.Now().UTC(),
		},
	})
	if err != nil {
		return "Manipulate attack failed.", err
	}
	s.logAttack(ctx, "/manipulate", "executed", "record message manipulated in main DB", telegramUser, chatID, []string{id}, nil)
	return "Attack simulated: existing data manipulated.", nil
}

func (s *Service) attackDuplicate(ctx context.Context, telegramUser int64, chatID string) (string, error) {
	col := s.db.Collection("alerts")
	doc := bson.M{}
	if err := col.FindOne(ctx, bson.M{}, options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})).Decode(&doc); err != nil {
		return "No data available to duplicate.", nil
	}
	delete(doc, "_id")
	newID := uuid.New().String()
	doc["_id"] = newID
	doc["attackSim"] = true
	doc["attackCommand"] = "/duplicate"
	doc["attackAt"] = time.Now().UTC()
	_, err := col.InsertOne(ctx, doc)
	if err != nil {
		return "Duplicate attack failed.", err
	}
	s.logAttack(ctx, "/duplicate", "executed", "record duplicated in main DB", telegramUser, chatID, []string{newID}, nil)
	return "Attack simulated: record duplicated.", nil
}
