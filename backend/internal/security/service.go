package security

import (
	"context"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"civiq/api/internal/auth"
	"civiq/api/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	colEvents   = "security_events"
	colBlocks   = "security_blocks"
	colKnownIPs = "security_known_ips"

	SeverityInfo     = "info"
	SeverityCritical = "critical"

	ActionLogin        = "login"
	ActionLoginFailed  = "login_failed"
	ActionSignup       = "signup"
	ActionAPIRead      = "api_read"
	ActionCreate       = "create"
	ActionUpdate       = "update"
	ActionDelete       = "delete"
	ActionUnauthorized = "unauthorized_route"
	ActionNewIP        = "new_ip"

	ruleFailedLoginFlood  = "failed_login_flood"
	ruleMutatingFlood     = "mutating_flood"
	ruleNewIP             = "new_ip_access"
	ruleUnauthorized      = "restricted_route_access"
	ruleUnauthorizedFlood = "unauthorized_flood"

	maxFailedLoginsPerMinute   = 5
	maxMutatingPerUserMinute   = 20
	maxUnauthorizedPerIPMinute = 5

	maxRequestsPerIPPerMinute = 100 // default; configurable via cfg

	ruleExcessiveRequests = "excessive_requests"
	reasonManual          = "manual_block"
)

// Service coordinates logging, rules, Telegram, and blocks.
type Service struct {
	db  *mongo.Database
	cfg *config.Config

	liveMonitoring atomic.Bool // runtime toggle from MongoDB (see settings.go)

	stopBG        context.CancelFunc
	stopDetection context.CancelFunc
	stopML        context.CancelFunc
	stopBackup    context.CancelFunc
	stopTelegram  context.CancelFunc
	mlCh          chan TrafficMLSample

	mlHitsMu sync.Mutex
	mlHits   map[string][]time.Time
}

func NewService(db *mongo.Database, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg, mlHits: make(map[string][]time.Time)}
}

// StartBackground runs prune job, detection sweep, and is started after BootstrapSettings.
func (s *Service) StartBackground(parent context.Context) {
	ctx, cancel := context.WithCancel(parent)
	s.stopBG = cancel
	dctx, dcancel := context.WithCancel(parent)
	s.stopDetection = dcancel

	go func() {
		t := time.NewTicker(5 * time.Minute)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				s.pruneOldEvents(ctx)
			}
		}
	}()

	go func() {
		interval := s.detectionTickerInterval()
		t := time.NewTicker(interval)
		defer t.Stop()
		for {
			select {
			case <-dctx.Done():
				return
			case <-t.C:
				if !s.monitoringOn() {
					continue
				}
				s.runDetectionSweep(context.Background())
			}
		}
	}()

	s.startMLWorker(parent)
	s.startBackupSyncWorker(parent)
	s.startTelegramCommandWorker(parent)
}

func (s *Service) detectionTickerInterval() time.Duration {
	sec := 10
	if s.cfg != nil && s.cfg.SecurityDetectionIntervalSec > 0 {
		sec = s.cfg.SecurityDetectionIntervalSec
	}
	return time.Duration(sec) * time.Second
}

func (s *Service) pruneOldEvents(ctx context.Context) {
	cutoff := time.Now().UTC().AddDate(0, -3, 0)
	_, err := s.db.Collection(colEvents).DeleteMany(ctx, bson.M{"timestamp": bson.M{"$lt": cutoff}})
	if err != nil {
		log.Println("security: prune events:", err)
	}
}

func (s *Service) blockIPMinutes() int {
	if s.cfg != nil && s.cfg.SecurityBlockIPMinutes > 0 {
		return s.cfg.SecurityBlockIPMinutes
	}
	return 30
}

func (s *Service) blockUserMinutes() int {
	if s.cfg != nil && s.cfg.SecurityBlockUserMinutes > 0 {
		return s.cfg.SecurityBlockUserMinutes
	}
	return 60
}

// --- Blocks ---

func (s *Service) isIPBlocked(ctx context.Context, ip string) bool {
	if ip == "" {
		return false
	}
	now := time.Now().UTC()
	var b Block
	err := s.db.Collection(colBlocks).FindOne(ctx, bson.M{
		"type": "ip", "value": ip, "until": bson.M{"$gt": now},
	}).Decode(&b)
	return err == nil
}

func (s *Service) isUserBlocked(ctx context.Context, userID string) bool {
	if userID == "" {
		return false
	}
	now := time.Now().UTC()
	var b Block
	err := s.db.Collection(colBlocks).FindOne(ctx, bson.M{
		"type": "user", "value": userID, "until": bson.M{"$gt": now},
	}).Decode(&b)
	return err == nil
}

func (s *Service) addBlock(ctx context.Context, typ, value, reason string, until time.Time) error {
	b := Block{
		ID:        uuid.New().String(),
		Type:      typ,
		Value:     value,
		Reason:    reason,
		Until:     until.UTC(),
		CreatedAt: time.Now().UTC(),
	}
	_, err := s.db.Collection(colBlocks).InsertOne(ctx, b)
	return err
}

// IPBlockMiddleware rejects requests from temporarily blocked IPs (health routes exempt).
// Runs even when monitoring is OFF so existing blocks stay enforced.
func (s *Service) IPBlockMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if isExemptPath(path) {
			c.Next()
			return
		}
		ip := ClientIP(c)
		if s.isIPBlocked(c.Request.Context(), ip) {
			c.JSON(http.StatusForbidden, gin.H{
				"message":    "Access temporarily blocked for this network address.",
				"code":       "SECURITY_IP_BLOCKED",
				"retryAfter": s.blockIPMinutes() * 60,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// UserBlockMiddleware must run after JWT middleware. Enforced even when monitoring is OFF.
func (s *Service) UserBlockMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cl, ok := c.Get("claims")
		if !ok {
			c.Next()
			return
		}
		claims, ok := cl.(*auth.Claims)
		if !ok || claims == nil {
			c.Next()
			return
		}
		if s.isUserBlocked(c.Request.Context(), claims.ID) {
			c.JSON(http.StatusForbidden, gin.H{
				"message":    "Your account is temporarily locked due to security policy. Sign in again later.",
				"code":       "SECURITY_USER_BLOCKED",
				"retryAfter": s.blockUserMinutes() * 60,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// AuditMiddleware logs each API request after it completes (health/ready skipped).
func (s *Service) AuditMiddleware(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		mon := s.monitoringOn()
		mlOn := s.mlEnabled()
		if !mon && !mlOn {
			c.Next()
			return
		}
		path := c.Request.URL.Path
		if isExemptPath(path) {
			c.Next()
			return
		}
		method := c.Request.Method
		ip := ClientIP(c)
		var userID *string
		if h := c.GetHeader("Authorization"); strings.HasPrefix(h, "Bearer ") {
			tok := strings.TrimPrefix(h, "Bearer ")
			if claims, err := auth.Parse(secret, strings.TrimSpace(tok)); err == nil && claims != nil {
				uid := claims.ID
				userID = &uid
			}
		}
		c.Next()
		status := c.Writer.Status()
		if mon {
			action := classifyAction(method, path)
			if path == "/api/auth/login" && method == http.MethodPost {
				action = ActionLogin
			}
			if path == "/api/auth/signup" && method == http.MethodPost {
				action = ActionSignup
			}
			ev := Event{
				ID:         uuid.New().String(),
				UserID:     userID,
				IP:         ip,
				Action:     action,
				Path:       path,
				Method:     method,
				StatusCode: status,
				Severity:   SeverityInfo,
				Timestamp:  time.Now().UTC(),
			}
			go s.persistAndEvaluate(c.Request.Context(), ev)
		}
		if mlOn {
			rid := strings.TrimSpace(c.GetHeader("x-request-id"))
			if rid == "" {
				rid = uuid.New().String()
			}
			bodyPreview := ""
			if v, ok := c.Get(ctxSecBodyPreview); ok {
				if s2, ok2 := v.(string); ok2 {
					bodyPreview = s2
				}
			}
			headers := map[string]string{}
			if v, ok := c.Get(ctxSecHeaders); ok {
				if m2, ok2 := v.(map[string]string); ok2 {
					headers = m2
				}
			}
			sess := strings.TrimSpace(c.GetHeader("x-session-id"))
			if sess == "" && userID != nil {
				sess = *userID
			}
			n := s.rollingIPHits(ip)
			sample := TrafficMLSample{
				RequestID:            rid,
				Method:               method,
				Path:                 path,
				Headers:              headers,
				Payload:              bodyPreview,
				SessionID:            sess,
				UserID:               userID,
				ClientIP:             ip,
				StatusCode:           status,
				RecentRequestCount1m: n,
			}
			go s.EnqueueTrafficML(sample)
		}
	}
}

func classifyAction(method, path string) string {
	switch method {
	case http.MethodGet:
		return ActionAPIRead
	case http.MethodPost:
		return ActionCreate
	case http.MethodPut, http.MethodPatch:
		return ActionUpdate
	case http.MethodDelete:
		return ActionDelete
	default:
		return "api"
	}
}

func (s *Service) persistAndEvaluate(ctx context.Context, ev Event) {
	if _, err := s.db.Collection(colEvents).InsertOne(ctx, ev); err != nil {
		log.Println("security: insert event:", err)
	}
	// Threshold evaluation runs in the background detection sweep (runDetectionSweep).
}

// RecordFailedLogin records a failed login attempt (detection thread applies blocks).
func (s *Service) RecordFailedLogin(ctx context.Context, ip, email string) {
	if !s.monitoringOn() {
		return
	}
	ev := Event{
		ID:         uuid.New().String(),
		IP:         ip,
		Action:     ActionLoginFailed,
		Path:       "/api/auth/login",
		Method:     http.MethodPost,
		StatusCode: http.StatusUnauthorized,
		Severity:   SeverityInfo,
		Message:    "email=" + email,
		Timestamp:  time.Now().UTC(),
	}
	if _, err := s.db.Collection(colEvents).InsertOne(ctx, ev); err != nil {
		log.Println("security: insert failed login:", err)
	}
}

// RecordSuccessfulLogin registers known IP or detects new IP (alerts only if the user had other IPs before).
func (s *Service) RecordSuccessfulLogin(ctx context.Context, userID, ip string) {
	if !s.monitoringOn() || userID == "" || ip == "" {
		return
	}
	now := time.Now().UTC()
	prevCount, _ := s.db.Collection(colKnownIPs).CountDocuments(ctx, bson.M{"userId": userID})
	var k KnownIP
	err := s.db.Collection(colKnownIPs).FindOne(ctx, bson.M{"userId": userID, "ip": ip}).Decode(&k)
	if err != nil && err != mongo.ErrNoDocuments {
		return
	}
	if err == mongo.ErrNoDocuments {
		k = KnownIP{
			ID:        uuid.New().String(),
			UserID:    userID,
			IP:        ip,
			FirstSeen: now,
			LastSeen:  now,
		}
		_, _ = s.db.Collection(colKnownIPs).InsertOne(ctx, k)
		if prevCount > 0 {
			ev := Event{
				ID:         uuid.New().String(),
				UserID:     &userID,
				IP:         ip,
				Action:     ActionNewIP,
				Path:       "/api/auth/login",
				Method:     http.MethodPost,
				StatusCode: http.StatusOK,
				Severity:   SeverityCritical,
				Rule:       ruleNewIP,
				Message:    "Sign-in from a new IP for this account",
				Timestamp:  now,
			}
			_, _ = s.db.Collection(colEvents).InsertOne(ctx, ev)
			s.broadcastAlert(userID, ip, ActionNewIP, ruleNewIP)
		}
		return
	}
	_, _ = s.db.Collection(colKnownIPs).UpdateOne(ctx, bson.M{"_id": k.ID}, bson.M{
		"$set": bson.M{"lastSeen": now},
	})
}

// RecordRoleViolation is called when a user hits a route their role cannot access.
func (s *Service) RecordRoleViolation(c *gin.Context, claims *auth.Claims, path string, allowedRoles []string) {
	if !s.monitoringOn() || claims == nil {
		return
	}
	ctx := c.Request.Context()
	ip := ClientIP(c)
	uid := claims.ID
	ev := Event{
		ID:         uuid.New().String(),
		UserID:     &uid,
		IP:         ip,
		Action:     ActionUnauthorized,
		Path:       path,
		Method:     c.Request.Method,
		StatusCode: http.StatusForbidden,
		Severity:   SeverityInfo,
		Message:    "role=" + claims.Role,
		Meta: map[string]any{
			"allowedRoles": allowedRoles,
		},
		Timestamp: time.Now().UTC(),
	}
	_, _ = s.db.Collection(colEvents).InsertOne(ctx, ev)
}

func (s *Service) raiseCritical(ctx context.Context, rule string, base Event, message string, blockIP, blockUser bool) {
	base.ID = uuid.New().String()
	base.Severity = SeverityCritical
	base.Rule = rule
	base.Message = message
	base.Timestamp = time.Now().UTC()
	_, _ = s.db.Collection(colEvents).InsertOne(ctx, base)
	uid := ""
	if base.UserID != nil {
		uid = *base.UserID
	}
	s.broadcastAlert(uid, base.IP, base.Action, rule)
	if blockIP && base.IP != "" {
		until := time.Now().UTC().Add(time.Duration(s.blockIPMinutes()) * time.Minute)
		_ = s.addBlock(ctx, "ip", base.IP, rule, until)
	}
	if blockUser && base.UserID != nil {
		until := time.Now().UTC().Add(time.Duration(s.blockUserMinutes()) * time.Minute)
		_ = s.addBlock(ctx, "user", *base.UserID, rule, until)
	}
}

func (s *Service) broadcastAlert(userID, ip, action, reason string) {
	if !s.monitoringOn() || s.cfg == nil || s.cfg.TelegramBotToken == "" {
		return
	}
	text := formatCriticalAlert(userID, ip, action, time.Now().UTC().Format(time.RFC3339), reason)
	for _, chat := range s.cfg.TelegramChatIDs {
		chat = strings.TrimSpace(chat)
		if chat == "" {
			continue
		}
		if err := sendTelegramAlert(s.cfg.TelegramBotToken, chat, text); err != nil {
			log.Println("security: telegram:", err)
		}
	}
}

// --- Admin API helpers ---

func (s *Service) ListEvents(ctx context.Context, limit int64, severity string) ([]Event, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	filter := bson.M{}
	if severity != "" {
		filter["severity"] = severity
	}
	cur, err := s.db.Collection(colEvents).Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(limit))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []Event
	for cur.Next(ctx) {
		var e Event
		if err := cur.Decode(&e); err != nil {
			continue
		}
		out = append(out, e)
	}
	return out, cur.Err()
}

func (s *Service) ListBlocks(ctx context.Context) ([]Block, error) {
	now := time.Now().UTC()
	cur, err := s.db.Collection(colBlocks).Find(ctx, bson.M{"until": bson.M{"$gt": now}}, options.Find().SetSort(bson.D{{Key: "until", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []Block
	for cur.Next(ctx) {
		var b Block
		if err := cur.Decode(&b); err != nil {
			continue
		}
		out = append(out, b)
	}
	return out, cur.Err()
}

func (s *Service) RemoveBlock(ctx context.Context, id string) error {
	res, err := s.db.Collection(colBlocks).DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
