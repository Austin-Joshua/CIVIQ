package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"civiq/api/internal/middleware"
	"civiq/api/internal/security"

	"github.com/gin-gonic/gin"
)

// RegisterSecurity exposes security logs, settings, manual blocks.
func RegisterSecurity(r *gin.RouterGroup, sec *security.Service) {
	if sec == nil {
		return
	}
	g := r.Group("/security")
	g.Use(middleware.RequireRoles(sec, "SUPER_ADMIN", "GOV_ADMIN"))

	g.GET("/settings", func(c *gin.Context) {
		c.JSON(http.StatusOK, sec.GetSettingsSnapshot())
	})

	g.GET("/events", func(c *gin.Context) {
		limit, _ := strconv.ParseInt(c.Query("limit"), 10, 64)
		sev := c.Query("severity")
		events, err := sec.ListEvents(c.Request.Context(), limit, sev)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load events"})
			return
		}
		c.JSON(http.StatusOK, events)
	})

	g.GET("/blocks", func(c *gin.Context) {
		blocks, err := sec.ListBlocks(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load blocks"})
			return
		}
		c.JSON(http.StatusOK, blocks)
	})

	g.GET("/ml-alerts", func(c *gin.Context) {
		limit, _ := strconv.ParseInt(c.Query("limit"), 10, 64)
		alerts, err := sec.ListMLAlerts(c.Request.Context(), limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load ML alerts"})
			return
		}
		c.JSON(http.StatusOK, alerts)
	})

	g.GET("/attack-logs", func(c *gin.Context) {
		limit, _ := strconv.ParseInt(c.Query("limit"), 10, 64)
		rows, err := sec.ListAttackLogs(c.Request.Context(), limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not load attack logs"})
			return
		}
		c.JSON(http.StatusOK, rows)
	})

	admin := g.Group("")
	admin.Use(middleware.RequireRoles(sec, "SUPER_ADMIN"))

	admin.PUT("/settings", func(c *gin.Context) {
		var body struct {
			MonitoringEnabled bool `json:"monitoringEnabled"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
			return
		}
		if err := sec.SetMonitoringEnabled(c.Request.Context(), body.MonitoringEnabled); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not update settings"})
			return
		}
		c.JSON(http.StatusOK, sec.GetSettingsSnapshot())
	})

	admin.POST("/blocks", func(c *gin.Context) {
		var body struct {
			Type    string `json:"type"`
			Value   string `json:"value"`
			Minutes int    `json:"minutes"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid JSON"})
			return
		}
		if err := sec.AddManualBlock(c.Request.Context(), body.Type, body.Value, body.Minutes); err != nil {
			if errors.Is(err, security.ErrInvalidManualBlock) {
				c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not create block"})
			return
		}
		blocks, _ := sec.ListBlocks(c.Request.Context())
		c.JSON(http.StatusCreated, gin.H{"ok": true, "blocks": blocks})
	})

	admin.DELETE("/blocks/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := sec.RemoveBlock(c.Request.Context(), id); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Block not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	admin.POST("/recovery/run", func(c *gin.Context) {
		stats, err := sec.RecoverMainFromBackup(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Recovery failed"})
			return
		}
		if err := sec.SyncBackupNow(c.Request.Context()); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Recovery completed but backup sync failed", "stats": stats})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true, "stats": stats})
	})
}
