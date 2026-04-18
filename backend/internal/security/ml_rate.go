package security

import (
	"time"
)

func (s *Service) rollingIPHits(ip string) int {
	if ip == "" {
		return 0
	}
	now := time.Now().UTC()
	cut := now.Add(-1 * time.Minute)
	s.mlHitsMu.Lock()
	defer s.mlHitsMu.Unlock()
	prev := s.mlHits[ip]
	var kept []time.Time
	for _, t := range prev {
		if t.After(cut) {
			kept = append(kept, t)
		}
	}
	kept = append(kept, now)
	if len(kept) > 2000 {
		kept = kept[len(kept)-800:]
	}
	s.mlHits[ip] = kept
	return len(kept)
}
