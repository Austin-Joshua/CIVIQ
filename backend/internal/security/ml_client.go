package security

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const colMLAlerts = "security_ml_alerts"

func (s *Service) mlEnabled() bool {
	return s.cfg != nil && strings.TrimSpace(s.cfg.MLSecurityURL) != ""
}

func (s *Service) startMLWorker(parent context.Context) {
	if !s.mlEnabled() {
		return
	}
	ctx, cancel := context.WithCancel(parent)
	s.stopML = cancel
	s.mlCh = make(chan TrafficMLSample, 2048)
	go s.mlWorkerLoop(ctx)
}

func (s *Service) mlWorkerLoop(ctx context.Context) {
	batchSize := s.cfg.MLBatchSize
	if batchSize <= 0 {
		batchSize = 8
	}
	wait := time.Duration(s.cfg.MLBatchWaitMs) * time.Millisecond
	if wait <= 0 {
		wait = 50 * time.Millisecond
	}
	timeout := time.Duration(s.cfg.MLHTTPTimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 1500 * time.Millisecond
	}
	client := &http.Client{Timeout: timeout}

	buf := make([]TrafficMLSample, 0, batchSize)
	tick := time.NewTicker(wait)
	defer tick.Stop()

	flush := func() {
		if len(buf) == 0 {
			return
		}
		batch := buf
		buf = make([]TrafficMLSample, 0, batchSize)
		s.postMLBatch(ctx, client, batch)
	}

	for {
		select {
		case <-ctx.Done():
			flush()
			return
		case ev := <-s.mlCh:
			buf = append(buf, ev)
			if len(buf) >= batchSize {
				flush()
			}
		case <-tick.C:
			flush()
		}
	}
}

func (s *Service) postMLBatch(ctx context.Context, client *http.Client, batch []TrafficMLSample) {
	if len(batch) == 0 || s.cfg == nil {
		return
	}
	url := strings.TrimRight(s.cfg.MLSecurityURL, "/") + "/api/security/ml/classify"
	body := map[string]any{"items": batch}
	raw, err := json.Marshal(body)
	if err != nil {
		log.Println("security ml: marshal:", err)
		return
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(raw))
	if err != nil {
		log.Println("security ml: request:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		log.Println("security ml: post:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		log.Println("security ml: status", resp.StatusCode)
		return
	}
	var parsed mlClassifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		log.Println("security ml: decode:", err)
		return
	}
	if len(parsed.Results) != len(batch) {
		return
	}
	for i := range batch {
		s.handleMLResult(context.Background(), batch[i], parsed.Results[i])
	}
}

func (s *Service) handleMLResult(ctx context.Context, sample TrafficMLSample, res MLClassifyResult) {
	if res.Label == "malicious" && res.Confidence >= 0.55 {
		s.persistMLAlert(ctx, sample, res, SeverityCritical, "ML: malicious traffic")
		s.raiseMLCritical(ctx, sample, res)
		return
	}
	if res.Label == "suspicious" && res.Confidence >= 0.5 {
		s.persistMLAlert(ctx, sample, res, SeverityInfo, "ML: suspicious traffic")
		if v, ok := res.AttackSignals["ddos"]; ok && v >= 0.45 {
			s.persistMLAlert(ctx, sample, res, SeverityCritical, "ML: unusual request spike / DDoS-like pattern")
			s.raiseMLCritical(ctx, sample, res)
		}
	}
}

func (s *Service) persistMLAlert(ctx context.Context, sample TrafficMLSample, res MLClassifyResult, severity, msg string) {
	al := MLThreatAlert{
		ID:         uuid.New().String(),
		Severity:   severity,
		Label:      res.Label,
		Confidence: res.Confidence,
		IP:         sample.ClientIP,
		UserID:     sample.UserID,
		Path:       sample.Path,
		Method:     sample.Method,
		Signals:    res.AttackSignals,
		Message:    msg,
		Timestamp:  time.Now().UTC(),
	}
	if _, err := s.db.Collection(colMLAlerts).InsertOne(ctx, al); err != nil {
		log.Println("security ml: insert alert:", err)
	}
}

func (s *Service) raiseMLCritical(ctx context.Context, sample TrafficMLSample, res MLClassifyResult) {
	base := Event{
		IP:         sample.ClientIP,
		UserID:     sample.UserID,
		Action:     "ml_threat",
		Path:       sample.Path,
		Method:     sample.Method,
		StatusCode: sample.StatusCode,
		Meta: map[string]any{
			"mlLabel":       res.Label,
			"confidence":    res.Confidence,
			"probabilities": res.Probabilities,
			"attackSignals": res.AttackSignals,
			"model":         res.Model,
		},
	}
	rule := "ml_malicious"
	if res.Label == "suspicious" {
		rule = "ml_suspicious_pattern"
	}
	blockIP := res.Label == "malicious" && res.Confidence >= 0.82
	s.raiseCritical(ctx, rule, base, "Automated ML security classification", blockIP, false)
}

func (s *Service) EnqueueTrafficML(sample TrafficMLSample) {
	if !s.mlEnabled() || s.mlCh == nil {
		return
	}
	select {
	case s.mlCh <- sample:
	default:
	}
}

func (s *Service) StopMLWorker() {
	if s.stopML != nil {
		s.stopML()
	}
}

// ListMLAlerts returns recent ML-driven threat notifications for dashboards.
func (s *Service) ListMLAlerts(ctx context.Context, limit int64) ([]MLThreatAlert, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	cur, err := s.db.Collection(colMLAlerts).Find(
		ctx,
		bson.M{},
		options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []MLThreatAlert
	for cur.Next(ctx) {
		var a MLThreatAlert
		if err := cur.Decode(&a); err != nil {
			continue
		}
		out = append(out, a)
	}
	return out, cur.Err()
}
