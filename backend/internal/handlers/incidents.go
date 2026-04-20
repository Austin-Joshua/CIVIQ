package handlers

import (
	"context"
	"net/http"
	"time"

	"civiq/api/internal/middleware"
	"civiq/api/internal/models"
	"civiq/api/internal/security"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Broadcaster func(tenantID, event string, payload interface{})

func RegisterIncidents(r *gin.RouterGroup, db *mongo.Database, bcast Broadcaster, sec *security.Service) {
	r.GET("/incidents", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		ctx := c.Request.Context()
		cur, err := db.Collection("alerts").Find(ctx, bson.M{"organizationId": orgID}, options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error"})
			return
		}
		defer cur.Close(ctx)
		var out []gin.H
		for cur.Next(ctx) {
			var a models.Alert
			cur.Decode(&a)
			out = append(out, alertToJSON(ctx, db, a))
		}
		c.JSON(http.StatusOK, out)
	})

	r.POST("/incidents", middleware.RequireRoles(sec, "SUPER_ADMIN", "GOV_ADMIN", "OPS_MANAGER", "FIELD_SUPERVISOR", "FIELD_OPERATOR"), func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		var body struct {
			Type     string `json:"type"`
			Severity string `json:"severity"`
			Message  string `json:"message"`
		}
		c.ShouldBindJSON(&body)
		if body.Type == "" || body.Severity == "" || body.Message == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Missing required fields."})
			return
		}
		ctx := c.Request.Context()
		a := models.Alert{
			ID:             uuid.New().String(),
			Type:           body.Type,
			Severity:       body.Severity,
			Message:        body.Message,
			Status:         "DETECTED",
			Timestamp:      time.Now().UTC(),
			Resolved:       false,
			OrganizationID: orgID,
		}
		db.Collection("alerts").InsertOne(ctx, a)
		j := alertToJSON(ctx, db, a)
		if bcast != nil {
			bcast(orgID, "incident_created", j)
		}
		c.JSON(http.StatusCreated, j)
	})

	r.PATCH("/incidents/:id", middleware.RequireRoles(sec, "SUPER_ADMIN", "GOV_ADMIN", "OPS_MANAGER", "FIELD_SUPERVISOR", "FIELD_OPERATOR"), func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		id := c.Param("id")
		var body map[string]interface{}
		c.ShouldBindJSON(&body)
		ctx := c.Request.Context()
		var a models.Alert
		if err := db.Collection("alerts").FindOne(ctx, bson.M{"_id": id, "organizationId": orgID}).Decode(&a); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Incident not found."})
			return
		}
		if s, ok := body["status"].(string); ok {
			a.Status = s
			if s == "RESOLVED" {
				a.Resolved = true
			}
		}
		if v, ok := body["assignedToId"]; ok {
			switch t := v.(type) {
			case string:
				a.AssignedToID = &t
			case nil:
				a.AssignedToID = nil
			}
		}
		if _, ok := body["resolutionNotes"]; ok {
			if v, ok := body["resolutionNotes"].(string); ok {
				a.ResolutionNotes = &v
			} else {
				a.ResolutionNotes = nil
			}
		}
		db.Collection("alerts").ReplaceOne(ctx, bson.M{"_id": id}, a)
		var updated models.Alert
		db.Collection("alerts").FindOne(ctx, bson.M{"_id": id}).Decode(&updated)
		j := alertToJSON(ctx, db, updated)
		if bcast != nil {
			bcast(orgID, "incident_updated", j)
		}
		c.JSON(http.StatusOK, j)
	})
}

func alertToJSON(ctx context.Context, db *mongo.Database, a models.Alert) gin.H {
	c := gin.H{
		"id": a.ID, "type": a.Type, "severity": a.Severity, "status": a.Status,
		"message": a.Message, "timestamp": a.Timestamp.Format(time.RFC3339Nano),
		"resolved": a.Resolved, "resolutionNotes": a.ResolutionNotes,
	}
	if a.AssignedToID != nil {
		c["assignedToId"] = *a.AssignedToID
		var u models.User
		if db.Collection("users").FindOne(ctx, bson.M{"_id": *a.AssignedToID}).Decode(&u) == nil {
			c["assignedTo"] = gin.H{"id": u.ID, "name": u.Name, "email": u.Email}
		}
	}
	return c
}
