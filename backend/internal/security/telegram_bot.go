package security

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type tgGetUpdatesResponse struct {
	OK     bool             `json:"ok"`
	Result []tgUpdateRecord `json:"result"`
}

type tgUpdateRecord struct {
	UpdateID int            `json:"update_id"`
	Message  *tgMessageItem `json:"message,omitempty"`
}

type tgMessageItem struct {
	Text string `json:"text"`
	Chat struct {
		ID int64 `json:"id"`
	} `json:"chat"`
	From struct {
		ID int64 `json:"id"`
	} `json:"from"`
}

func (s *Service) telegramCommandBotEnabled() bool {
	return s.cfg != nil && strings.TrimSpace(s.cfg.TelegramBotToken) != "" && len(s.cfg.TelegramAllowedUserIDs) > 0
}

func (s *Service) telegramPollInterval() time.Duration {
	sec := 3
	if s.cfg != nil && s.cfg.TelegramPollIntervalSec >= 1 {
		sec = s.cfg.TelegramPollIntervalSec
	}
	return time.Duration(sec) * time.Second
}

func (s *Service) startTelegramCommandWorker(parent context.Context) {
	if !s.telegramCommandBotEnabled() {
		return
	}
	ctx, cancel := context.WithCancel(parent)
	s.stopTelegram = cancel
	go s.pollTelegramCommands(ctx)
}

func (s *Service) pollTelegramCommands(ctx context.Context) {
	offset := 0
	client := &http.Client{Timeout: 65 * time.Second}
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}
		updates, nextOffset, err := s.getTelegramUpdates(ctx, client, offset)
		if err != nil {
			log.Println("security: telegram poll:", err)
			time.Sleep(s.telegramPollInterval())
			continue
		}
		offset = nextOffset
		for _, up := range updates {
			if up.Message == nil {
				continue
			}
			msg := strings.TrimSpace(up.Message.Text)
			if msg == "" || msg[0] != '/' {
				continue
			}
			reply, _ := s.ExecuteTelegramAttackCommand(
				context.Background(),
				msg,
				up.Message.From.ID,
				strconv.FormatInt(up.Message.Chat.ID, 10),
			)
			if reply != "" {
				_ = sendTelegramAlert(
					s.cfg.TelegramBotToken,
					strconv.FormatInt(up.Message.Chat.ID, 10),
					reply,
				)
			}
		}
		time.Sleep(250 * time.Millisecond)
	}
}

func (s *Service) getTelegramUpdates(ctx context.Context, client *http.Client, offset int) ([]tgUpdateRecord, int, error) {
	endpoint := "https://api.telegram.org/bot" + s.cfg.TelegramBotToken + "/getUpdates"
	q := url.Values{}
	q.Set("timeout", "50")
	q.Set("offset", strconv.Itoa(offset))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint+"?"+q.Encode(), nil)
	if err != nil {
		return nil, offset, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, offset, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, offset, fmt.Errorf("telegram getUpdates HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	var parsed tgGetUpdatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, offset, err
	}
	next := offset
	for _, u := range parsed.Result {
		if u.UpdateID >= next {
			next = u.UpdateID + 1
		}
	}
	return parsed.Result, next, nil
}
