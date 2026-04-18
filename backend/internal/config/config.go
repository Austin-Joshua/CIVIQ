package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port           string
	MongoURI       string
	DatabaseName   string
	JWTSecret      string
	CORSOrigins    []string
	SocketEnabled  bool
	SocketPort     string
	Bootstrap      bool
	SeedOrgName    string
	SeedPassword   string

	SecurityMonitorEnabled   bool
	TelegramBotToken         string
	TelegramChatIDs          []string
	SecurityBlockIPMinutes   int
	SecurityBlockUserMinutes int
	SecurityDetectionIntervalSec int // background detection sweep (default 10)
	MaxRequestsPerIPPerMinute    int // excessive traffic threshold (default 100)

	MLSecurityURL     string
	MLBatchSize       int
	MLBatchWaitMs     int
	MLHTTPTimeoutMs   int
}

func Load() *Config {
	c := &Config{
		Port:          get("PORT", "5000"),
		MongoURI:      get("MONGODB_URI", "mongodb://127.0.0.1:27017"),
		DatabaseName:  get("MONGODB_DATABASE", "civiq"),
		JWTSecret:     get("JWT_SECRET", "change-me-to-a-long-random-secret-min-32-characters!!"),
		SocketEnabled: get("SOCKETIO_ENABLED", "true") == "true",
		SocketPort:    get("SOCKETIO_PORT", "5001"),
		Bootstrap:     get("BOOTSTRAP_LOGIN_USER", "true") == "true",
		SeedOrgName:   get("SEED_ORGANIZATION_NAME", "CIVIQ Demo City"),
		SeedPassword:  get("SEED_ADMIN_PASSWORD", "civiq2026"),
	}
	for _, o := range strings.Split(get("CORS_ORIGIN", "http://localhost:3000"), ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			c.CORSOrigins = append(c.CORSOrigins, o)
		}
	}
	c.SecurityMonitorEnabled = get("SECURITY_MONITOR_ENABLED", "true") == "true"
	c.TelegramBotToken = get("TELEGRAM_BOT_TOKEN", "")
	for _, id := range strings.Split(get("TELEGRAM_CHAT_IDS", ""), ",") {
		id = strings.TrimSpace(id)
		if id != "" {
			c.TelegramChatIDs = append(c.TelegramChatIDs, id)
		}
	}
	if v := get("SECURITY_BLOCK_IP_MINUTES", "30"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n > 0 {
			c.SecurityBlockIPMinutes = n
		}
	}
	if v := get("SECURITY_BLOCK_USER_MINUTES", "60"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n > 0 {
			c.SecurityBlockUserMinutes = n
		}
	}
	if v := get("SECURITY_DETECTION_INTERVAL_SEC", "10"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n >= 3 {
			c.SecurityDetectionIntervalSec = n
		}
	}
	if v := get("SECURITY_MAX_REQUESTS_PER_IP_PER_MIN", "100"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n > 0 {
			c.MaxRequestsPerIPPerMinute = n
		}
	}
	c.MLSecurityURL = strings.TrimSpace(get("SECURITY_ML_BASE_URL", ""))
	if v := get("SECURITY_ML_BATCH_SIZE", "8"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n > 0 && n <= 128 {
			c.MLBatchSize = n
		}
	}
	if v := get("SECURITY_ML_BATCH_WAIT_MS", "50"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n >= 5 {
			c.MLBatchWaitMs = n
		}
	}
	if v := get("SECURITY_ML_HTTP_TIMEOUT_MS", "1500"); v != "" {
		if n, err := strconv.Atoi(strings.TrimSpace(v)); err == nil && n >= 200 {
			c.MLHTTPTimeoutMs = n
		}
	}
	return c
}

func get(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
