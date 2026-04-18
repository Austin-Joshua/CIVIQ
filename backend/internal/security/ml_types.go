package security

import "time"

// TrafficMLSample is forwarded to the Python ML microservice (Phase A input).
type TrafficMLSample struct {
	RequestID               string            `json:"requestId"`
	Method                  string            `json:"method"`
	Path                    string            `json:"path"`
	Headers                 map[string]string `json:"headers"`
	Payload                 string            `json:"payload"`
	SessionID               string            `json:"sessionId"`
	UserID                  *string           `json:"userId,omitempty"`
	ClientIP                string            `json:"clientIp"`
	StatusCode              int               `json:"statusCode"`
	RecentRequestCount1m    int               `json:"recentRequestCount1m"`
}

// MLClassifyResult is one entry from /api/security/ml/classify.
type MLClassifyResult struct {
	Label           string             `json:"label"`
	Confidence      float64            `json:"confidence"`
	Probabilities   map[string]float64 `json:"probabilities"`
	AttackSignals   map[string]float64 `json:"attackSignals"`
	Phase           string             `json:"phase"`
	Model           string             `json:"model"`
}

type mlClassifyResponse struct {
	Status    string             `json:"status"`
	Results   []MLClassifyResult `json:"results"`
	Timestamp string             `json:"timestamp"`
}

// MLThreatAlert is persisted for dashboards / polling clients.
type MLThreatAlert struct {
	ID         string    `bson:"_id" json:"id"`
	Severity   string    `bson:"severity" json:"severity"` // info | critical
	Label      string    `bson:"label" json:"label"`
	Confidence float64   `bson:"confidence" json:"confidence"`
	IP         string    `bson:"ip" json:"ip"`
	UserID     *string   `bson:"userId,omitempty" json:"userId,omitempty"`
	Path       string    `bson:"path" json:"path"`
	Method     string    `bson:"method" json:"method"`
	Signals    any       `bson:"signals,omitempty" json:"signals,omitempty"`
	Message    string    `bson:"message,omitempty" json:"message,omitempty"`
	Timestamp  time.Time `bson:"timestamp" json:"timestamp"`
}
