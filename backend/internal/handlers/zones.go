package handlers

import (
	"net/http"
	"time"

	"civiq/api/internal/middleware"
	"civiq/api/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func zoneRoles() gin.HandlerFunc {
	return middleware.RequireRoles("SUPER_ADMIN", "GOV_ADMIN", "OPS_MANAGER", "ANALYST", "AUDITOR", "VIEWER")
}

func RegisterZones(r *gin.RouterGroup, db *mongo.Database) {
	z := r.Group("/zones")
	z.Use(zoneRoles())

	z.GET("", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		ctx := c.Request.Context()
		cur, err := db.Collection("zones").Find(ctx, bson.M{"organizationId": orgID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error"})
			return
		}
		defer cur.Close(ctx)
		var out []gin.H
		for cur.Next(ctx) {
			var z models.Zone
			cur.Decode(&z)
			n, _ := db.Collection("bins").CountDocuments(ctx, bson.M{"zoneId": z.ID})
			out = append(out, gin.H{
				"id": z.ID, "name": z.Name, "geometry": z.Geometry,
				"cleanlinessScore": z.CleanlinessScore, "organizationId": z.OrganizationID,
				"_count": gin.H{"bins": n},
			})
		}
		c.JSON(http.StatusOK, out)
	})

	z.GET("/:id", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		id := c.Param("id")
		ctx := c.Request.Context()
		var z models.Zone
		if err := db.Collection("zones").FindOne(ctx, bson.M{"_id": id, "organizationId": orgID}).Decode(&z); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Zone not found."})
			return
		}
		cur, _ := db.Collection("bins").Find(ctx, bson.M{"zoneId": z.ID})
		defer cur.Close(ctx)
		var bins []gin.H
		for cur.Next(ctx) {
			var b models.Bin
			cur.Decode(&b)
			bh := gin.H{
				"id": b.ID, "locationLat": b.LocationLat, "locationLng": b.LocationLng,
				"capacity": b.Capacity, "currentFillLevel": b.CurrentFillLevel, "type": b.Type,
				"zoneId": b.ZoneID,
			}
			if b.LastCollected != nil {
				bh["lastCollected"] = b.LastCollected.Format(time.RFC3339Nano)
			} else {
				bh["lastCollected"] = nil
			}
			bins = append(bins, bh)
		}
		c.JSON(http.StatusOK, gin.H{
			"id": z.ID, "name": z.Name, "geometry": z.Geometry,
			"cleanlinessScore": z.CleanlinessScore, "organizationId": z.OrganizationID,
			"bins": bins,
		})
	})
}
