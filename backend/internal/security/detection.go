package security

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// ErrInvalidManualBlock is returned when manual block parameters are invalid.
var ErrInvalidManualBlock = errors.New("invalid manual block: type must be ip or user and value non-empty")

// runDetectionSweep aggregates recent security_events and applies rules (Telegram + blocks).
// Called from a background ticker only when monitoringOn() is true.
func (s *Service) runDetectionSweep(ctx context.Context) {
	since := time.Now().UTC().Add(-1 * time.Minute)
	maxR := maxRequestsPerIPPerMinute
	if s.cfg != nil && s.cfg.MaxRequestsPerIPPerMinute > 0 {
		maxR = s.cfg.MaxRequestsPerIPPerMinute
	}

	// --- Failed logins per IP ---
	failByIP := map[string]int{}
	cur, err := s.db.Collection(colEvents).Find(ctx, bson.M{
		"action": ActionLoginFailed, "timestamp": bson.M{"$gte": since},
	})
	if err == nil {
		for cur.Next(ctx) {
			var e Event
			if cur.Decode(&e) != nil {
				continue
			}
			if e.IP != "" {
				failByIP[e.IP]++
			}
		}
		_ = cur.Close(ctx)
	}
	for ip, n := range failByIP {
		if n > maxFailedLoginsPerMinute {
			s.applyDetectionRule(ctx, ruleFailedLoginFlood, "Brute-force threshold exceeded", ip, nil, true, false)
		}
	}

	// --- Total requests per IP (excessive traffic) ---
	reqByIP := map[string]int{}
	cur2, err := s.db.Collection(colEvents).Find(ctx, bson.M{"timestamp": bson.M{"$gte": since}})
	if err == nil {
		for cur2.Next(ctx) {
			var e Event
			if cur2.Decode(&e) != nil {
				continue
			}
			if e.IP != "" {
				reqByIP[e.IP]++
			}
		}
		_ = cur2.Close(ctx)
	}
	for ip, n := range reqByIP {
		if n > maxR {
			s.applyDetectionRule(ctx, ruleExcessiveRequests, "Excessive request volume from this IP", ip, nil, true, false)
		}
	}

	// --- Mutations per user (2xx PUT/PATCH/DELETE) ---
	mutByUser := map[string]int{}
	cur3, err := s.db.Collection(colEvents).Find(ctx, bson.M{
		"action": bson.M{"$in": []string{ActionUpdate, ActionDelete}},
		"timestamp": bson.M{"$gte": since},
		"statusCode": bson.M{"$gte": 200, "$lt": 300},
	})
	if err == nil {
		for cur3.Next(ctx) {
			var e Event
			if cur3.Decode(&e) != nil {
				continue
			}
			if e.UserID != nil && *e.UserID != "" {
				mutByUser[*e.UserID]++
			}
		}
		_ = cur3.Close(ctx)
	}
	for uid, n := range mutByUser {
		if n > maxMutatingPerUserMinute {
			u := uid
			s.applyDetectionRule(ctx, ruleMutatingFlood, "Mass data change threshold exceeded", "", &u, false, true)
		}
	}

	// --- Unauthorized access per IP ---
	unauthByIP := map[string]int{}
	cur4, err := s.db.Collection(colEvents).Find(ctx, bson.M{
		"action": ActionUnauthorized, "timestamp": bson.M{"$gte": since},
	})
	if err == nil {
		for cur4.Next(ctx) {
			var e Event
			if cur4.Decode(&e) != nil {
				continue
			}
			if e.IP != "" {
				unauthByIP[e.IP]++
			}
		}
		_ = cur4.Close(ctx)
	}
	for ip, n := range unauthByIP {
		if n > maxUnauthorizedPerIPMinute {
			s.applyDetectionRule(ctx, ruleUnauthorizedFlood, "Repeated unauthorized route access", ip, nil, true, false)
		}
	}
}

func (s *Service) recentCritical(ctx context.Context, rule, ip string, userID *string) bool {
	since := time.Now().UTC().Add(-90 * time.Second)
	q := bson.M{
		"rule": rule, "severity": SeverityCritical,
		"timestamp": bson.M{"$gte": since},
	}
	if ip != "" {
		q["ip"] = ip
	}
	if userID != nil && *userID != "" {
		q["userId"] = *userID
	}
	n, err := s.db.Collection(colEvents).CountDocuments(ctx, q)
	if err != nil {
		return true
	}
	return n > 0
}

func (s *Service) applyDetectionRule(ctx context.Context, rule, msg string, ip string, userID *string, blockIP, blockUser bool) {
	if s.recentCritical(ctx, rule, ip, userID) {
		return
	}
	base := Event{
		IP:         ip,
		UserID:     userID,
		Action:     "detection_sweep",
		Path:       "/internal/security/detection",
		Method:     "INTERNAL",
		StatusCode: 200,
	}
	s.raiseCritical(ctx, rule, base, msg, blockIP, blockUser)
}

// AddManualBlock creates an immediate IP or user block (admin action).
func (s *Service) AddManualBlock(ctx context.Context, typ, value string, minutes int) error {
	if typ != "ip" && typ != "user" {
		return ErrInvalidManualBlock
	}
	if value == "" {
		return ErrInvalidManualBlock
	}
	if minutes <= 0 {
		if typ == "ip" {
			minutes = s.blockIPMinutes()
		} else {
			minutes = s.blockUserMinutes()
		}
	}
	until := time.Now().UTC().Add(time.Duration(minutes) * time.Minute)
	return s.addBlock(ctx, typ, value, reasonManual, until)
}
