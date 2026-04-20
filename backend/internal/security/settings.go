package security

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const colSettings = "security_settings"

// BootstrapSettings ensures the global settings document exists and loads monitoring flag into memory.
func (s *Service) BootstrapSettings(ctx context.Context) error {
	var doc bson.M
	err := s.db.Collection(colSettings).FindOne(ctx, bson.M{"_id": "global"}).Decode(&doc)
	if err == mongo.ErrNoDocuments {
		on := s.cfg != nil && s.cfg.SecurityMonitorEnabled
		tgOn := true
		_, insErr := s.db.Collection(colSettings).InsertOne(ctx, bson.M{
			"_id":                    "global",
			"monitoringEnabled":      on,
			"telegramCommandEnabled": tgOn,
			"updatedAt":              time.Now().UTC(),
		})
		s.liveMonitoring.Store(on)
		s.liveTelegram.Store(tgOn)
		return insErr
	}
	if err != nil {
		return err
	}
	if v, ok := doc["monitoringEnabled"].(bool); ok {
		s.liveMonitoring.Store(v)
	} else {
		s.liveMonitoring.Store(true)
	}
	if v, ok := doc["telegramCommandEnabled"].(bool); ok {
		s.liveTelegram.Store(v)
	} else {
		s.liveTelegram.Store(true)
	}
	return nil
}

// monitoringOn: env master (SECURITY_MONITOR_ENABLED) AND DB toggle must be true.
func (s *Service) monitoringOn() bool {
	if s.cfg == nil || !s.cfg.SecurityMonitorEnabled {
		return false
	}
	return s.liveMonitoring.Load()
}

func (s *Service) telegramCommandsOn() bool {
	return s.liveTelegram.Load()
}

// SetMonitoringEnabled updates DB and applies immediately (atomic).
func (s *Service) SetMonitoringEnabled(ctx context.Context, on bool) error {
	_, err := s.db.Collection(colSettings).UpdateOne(ctx,
		bson.M{"_id": "global"},
		bson.M{"$set": bson.M{"monitoringEnabled": on, "updatedAt": time.Now().UTC()}},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return err
	}
	s.liveMonitoring.Store(on)
	if on {
		go func() {
			// Recovery first, then refresh backup baseline.
			if _, err := s.RecoverMainFromBackup(context.Background()); err != nil {
				log.Println("security: recovery:", err)
			}
			if err := s.SyncBackupNow(context.Background()); err != nil {
				log.Println("security: backup sync:", err)
			}
		}()
	}
	return nil
}

// SetTelegramCommandEnabled updates whether Telegram attack commands are processed.
func (s *Service) SetTelegramCommandEnabled(ctx context.Context, on bool) error {
	_, err := s.db.Collection(colSettings).UpdateOne(
		ctx,
		bson.M{"_id": "global"},
		bson.M{"$set": bson.M{"telegramCommandEnabled": on, "updatedAt": time.Now().UTC()}},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return err
	}
	s.liveTelegram.Store(on)
	return nil
}

// GetSettingsSnapshot returns flags for the admin UI.
func (s *Service) GetSettingsSnapshot() map[string]interface{} {
	envOn := s.cfg != nil && s.cfg.SecurityMonitorEnabled
	sec := 10
	if s.cfg != nil && s.cfg.SecurityDetectionIntervalSec > 0 {
		sec = s.cfg.SecurityDetectionIntervalSec
	}
	maxR := maxRequestsPerIPPerMinute
	if s.cfg != nil && s.cfg.MaxRequestsPerIPPerMinute > 0 {
		maxR = s.cfg.MaxRequestsPerIPPerMinute
	}
	return map[string]interface{}{
		"monitoringEnabled":          s.liveMonitoring.Load(),
		"envSecurityMonitorEnabled":  envOn,
		"detectionIntervalSec":       sec,
		"maxRequestsPerIPPerMinute":  maxR,
		"maxFailedLoginsPerMinute":   maxFailedLoginsPerMinute,
		"maxMutatingPerUserMinute":   maxMutatingPerUserMinute,
		"maxUnauthorizedPerIPMinute": maxUnauthorizedPerIPMinute,
		"backupDatabaseName":         s.backupDB().Name(),
		"backupSyncIntervalSec":      s.backupSyncIntervalSec(),
		"telegramSecurityEnabled":    s.telegramCommandsOn(),
		"telegramBotReady":           s.telegramCommandPrereqs(),
		"telegramBotCommandEnabled":  s.telegramCommandBotEnabled(),
	}
}
