package handlers

import (
	"civiq/api/internal/config"
	"civiq/api/internal/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Mount(r *gin.Engine, db *mongo.Database, cfg *config.Config, secret []byte, bcast Broadcaster) {
	r.Use(middleware.RequestID())
	r.Use(middleware.CORS(cfg))

	api := r.Group("/api")
	RegisterAuth(api, db, cfg, secret)
	RegisterHealth(api, db)

	authed := api.Group("")
	authed.Use(middleware.JWT(secret))
	RegisterUsers(authed, db)
	RegisterZones(authed, db)
	RegisterBins(authed, db)
	RegisterIncidents(authed, db, bcast)
	RegisterAI(authed, db)
}
