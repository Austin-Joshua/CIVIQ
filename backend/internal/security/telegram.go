package security

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func sendTelegramAlert(botToken, chatID, text string) error {
	if botToken == "" || chatID == "" {
		return nil
	}
	endpoint := "https://api.telegram.org/bot" + botToken + "/sendMessage"
	form := url.Values{}
	form.Set("chat_id", chatID)
	form.Set("text", text)
	form.Set("parse_mode", "HTML")
	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
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
		return fmt.Errorf("telegram HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	return nil
}

func formatCriticalAlert(userID, ip, action, at, reason string) string {
	u := userID
	if u == "" {
		u = "(anonymous)"
	}
	return fmt.Sprintf(
		"<b>CRITICAL — CIVIQ Security</b>\n"+
			"User: <code>%s</code>\n"+
			"IP: <code>%s</code>\n"+
			"Action: <code>%s</code>\n"+
			"Time: %s\n"+
			"Rule: %s",
		escapeHTML(u), escapeHTML(ip), escapeHTML(action), escapeHTML(at), escapeHTML(reason),
	)
}

func escapeHTML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}
