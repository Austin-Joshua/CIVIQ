package security

import (
	"net"
	"strings"

	"github.com/gin-gonic/gin"
)

// ClientIP returns the best-effort client address (supports X-Forwarded-For behind proxies).
func ClientIP(c *gin.Context) string {
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		ip := strings.TrimSpace(parts[0])
		if ip != "" {
			return ip
		}
	}
	if xri := c.GetHeader("X-Real-IP"); xri != "" {
		xri = strings.TrimSpace(xri)
		if xri != "" {
			return xri
		}
	}
	host, _, err := net.SplitHostPort(strings.TrimSpace(c.Request.RemoteAddr))
	if err == nil && host != "" {
		return host
	}
	return c.ClientIP()
}

func isExemptPath(path string) bool {
	switch path {
	case "/api/health", "/api/ready":
		return true
	default:
		return false
	}
}
