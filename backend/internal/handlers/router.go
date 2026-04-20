package handlers

import (
	"civiq/api/internal/config"
	"civiq/api/internal/middleware"
	"civiq/api/internal/security"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Mount(r *gin.Engine, db *mongo.Database, cfg *config.Config, secret []byte, bcast Broadcaster, sec *security.Service) {
	r.Use(middleware.RequestID())
	r.Use(middleware.CORS(cfg))

	api := r.Group("/api")
	if sec != nil {
		api.Use(sec.IPBlockMiddleware())
		api.Use(sec.BodyCaptureMiddleware())
		api.Use(sec.AuditMiddleware(secret))
	}
	RegisterAuth(api, db, cfg, secret, sec)
	RegisterHealth(api, db)

	authed := api.Group("")
	authed.Use(middleware.JWT(secret))
	if sec != nil {
		authed.Use(sec.UserBlockMiddleware())
	}
	RegisterUsers(authed, db, sec)
	RegisterZones(authed, db, sec)
	RegisterBins(authed, db, sec)
	RegisterIncidents(authed, db, bcast, sec)
	RegisterAI(authed, db)
	RegisterSecurity(authed, sec)
}
