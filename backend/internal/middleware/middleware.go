package middleware

import (
	"net/http"
	"strings"

	"civiq/api/internal/auth"
	"civiq/api/internal/config"
	"civiq/api/internal/security"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	CtxClaims = "claims"
	CtxOrgID  = "effectiveOrgId"
)

func CORS(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowed := ""
		for _, o := range cfg.CORSOrigins {
			if o == origin {
				allowed = origin
				break
			}
		}
		if allowed == "" && len(cfg.CORSOrigins) > 0 {
			allowed = cfg.CORSOrigins[0]
		}
		if allowed != "" {
			c.Header("Access-Control-Allow-Origin", allowed)
		}
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "*")
		c.Header("Access-Control-Expose-Headers", "x-request-id")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("x-request-id", uuid.New().String())
		c.Next()
	}
}

func JWT(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authentication token required"})
			c.Abort()
			return
		}
		token := strings.TrimPrefix(h, "Bearer ")
		claims, err := auth.Parse(secret, token)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "Invalid or expired token"})
			c.Abort()
			return
		}
		effectiveOrg := claims.OrganizationID
		if claims.Role == "SUPER_ADMIN" {
			if t := c.GetHeader("x-tenant-id"); t != "" {
				effectiveOrg = strings.TrimSpace(t)
			}
		}
		c.Set(CtxClaims, claims)
		c.Set(CtxOrgID, effectiveOrg)
		c.Next()
	}
}

func RequireRoles(sec *security.Service, roles ...string) gin.HandlerFunc {
	roleSet := map[string]struct{}{}
	for _, r := range roles {
		roleSet[r] = struct{}{}
	}
	return func(c *gin.Context) {
		cl := c.MustGet(CtxClaims).(*auth.Claims)
		if _, ok := roleSet[cl.Role]; !ok {
			if sec != nil {
				sec.RecordRoleViolation(c, cl, c.Request.URL.Path, roles)
			}
			c.JSON(http.StatusForbidden, gin.H{"message": "Insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}
