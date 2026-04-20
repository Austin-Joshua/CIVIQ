package config

import (
	"os"
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
	return c
}

func get(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
