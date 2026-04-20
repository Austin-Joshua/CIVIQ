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

type tgGetMeResponse struct {
	OK     bool `json:"ok"`
	Result struct {
		ID       int64  `json:"id"`
		IsBot    bool   `json:"is_bot"`
		Username string `json:"username"`
	} `json:"result"`
}

type tgCommandDef struct {
	Command     string `json:"command"`
	Description string `json:"description"`
}

var telegramCommandMenu = []tgCommandDef{
	{Command: "security_on", Description: "Turn security mode ON (block attacks)"},
	{Command: "security_off", Description: "Turn security mode OFF (allow simulation)"},
	{Command: "insert", Description: "Simulate malicious insert"},
	{Command: "delete", Description: "Simulate data deletion attack"},
	{Command: "manipulate", Description: "Simulate in-place data manipulation"},
	{Command: "duplicate", Description: "Simulate record duplication attack"},
	{Command: "help", Description: "Show command reference"},
}

func (s *Service) telegramCommandPrereqs() bool {
	return s.cfg != nil && strings.TrimSpace(s.cfg.TelegramBotToken) != "" && len(s.cfg.TelegramAllowedUserIDs) > 0
}

func (s *Service) telegramCommandBotEnabled() bool {
	return s.telegramCommandPrereqs() && s.telegramCommandsOn()
}

func (s *Service) telegramPollInterval() time.Duration {
	sec := 3
	if s.cfg != nil && s.cfg.TelegramPollIntervalSec >= 1 {
		sec = s.cfg.TelegramPollIntervalSec
	}
	return time.Duration(sec) * time.Second
}

func (s *Service) startTelegramCommandWorker(parent context.Context) {
	if !s.telegramCommandPrereqs() {
		return
	}
	if err := s.registerTelegramCommands(context.Background()); err != nil {
		log.Println("security: telegram setMyCommands:", err)
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

func (s *Service) TelegramStatus(ctx context.Context) map[string]any {
	out := map[string]any{
		"enabled":                 s.telegramCommandBotEnabled(),
		"telegramSecurityEnabled": s.telegramCommandsOn(),
		"hasToken":                s.cfg != nil && strings.TrimSpace(s.cfg.TelegramBotToken) != "",
		"allowedUsersCount":       len(s.cfg.TelegramAllowedUserIDs),
		"pollIntervalSec":         int(s.telegramPollInterval().Seconds()),
		"workerExpected":          s.telegramCommandPrereqs(),
		"registeredCommandSet":    telegramCommandMenu,
		"telegramApiReachable":    false,
	}
	if !s.telegramCommandPrereqs() {
		out["message"] = "Bot worker disabled (missing token or allowed user IDs)."
		return out
	}
	client := &http.Client{Timeout: 10 * time.Second}
	endpoint := "https://api.telegram.org/bot" + s.cfg.TelegramBotToken + "/getMe"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		out["message"] = "Could not create Telegram request."
		return out
	}
	resp, err := client.Do(req)
	if err != nil {
		out["message"] = "Telegram API not reachable."
		return out
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		out["message"] = fmt.Sprintf("Telegram getMe HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
		return out
	}
	var parsed tgGetMeResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		out["message"] = "Telegram response decode failed."
		return out
	}
	if !parsed.OK {
		out["message"] = "Telegram getMe returned not ok."
		return out
	}
	out["telegramApiReachable"] = true
	out["botUsername"] = parsed.Result.Username
	out["botID"] = parsed.Result.ID
	out["message"] = "Telegram bot token is valid and API is reachable."
	return out
}

func (s *Service) registerTelegramCommands(ctx context.Context) error {
	if s.cfg == nil || strings.TrimSpace(s.cfg.TelegramBotToken) == "" {
		return nil
	}
	commandsJSON, err := json.Marshal(telegramCommandMenu)
	if err != nil {
		return err
	}
	form := url.Values{}
	form.Set("commands", string(commandsJSON))
	endpoint := "https://api.telegram.org/bot" + s.cfg.TelegramBotToken + "/setMyCommands"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram setMyCommands HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	return nil
}
