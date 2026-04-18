package security

import "time"

// Event is stored in security_events for auditing and rule evaluation.
type Event struct {
	ID         string         `bson:"_id" json:"id"`
	UserID     *string        `bson:"userId,omitempty" json:"userId,omitempty"`
	IP         string         `bson:"ip" json:"ip"`
	Action     string         `bson:"action" json:"action"`
	Path       string         `bson:"path" json:"path"`
	Method     string         `bson:"method" json:"method"`
	StatusCode int            `bson:"statusCode" json:"statusCode"`
	Severity   string         `bson:"severity" json:"severity"` // info | critical
	Rule       string         `bson:"rule,omitempty" json:"rule,omitempty"`
	Message    string         `bson:"message,omitempty" json:"message,omitempty"`
	Meta       map[string]any `bson:"meta,omitempty" json:"meta,omitempty"`
	Timestamp  time.Time      `bson:"timestamp" json:"timestamp"`
}

// Block is an active IP or user lockout.
type Block struct {
	ID        string    `bson:"_id" json:"id"`
	Type      string    `bson:"type" json:"type"` // ip | user
	Value     string    `bson:"value" json:"value"`
	Reason    string    `bson:"reason" json:"reason"`
	Until     time.Time `bson:"until" json:"until"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}

// KnownIP tracks IPs that have successfully authenticated as a user.
type KnownIP struct {
	ID        string    `bson:"_id" json:"id"`
	UserID    string    `bson:"userId" json:"userId"`
	IP        string    `bson:"ip" json:"ip"`
	FirstSeen time.Time `bson:"firstSeen" json:"firstSeen"`
	LastSeen  time.Time `bson:"lastSeen" json:"lastSeen"`
}
