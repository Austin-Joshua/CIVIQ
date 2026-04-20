package handlers

import (
	"net/http"
	"strconv"

	"civiq/api/internal/middleware"
	"civiq/api/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterBins(r *gin.RouterGroup, db *mongo.Database) {
	b := r.Group("/bins")
	b.GET("", binListRoles(), func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		zoneQ := c.Query("zoneId")
		ctx := c.Request.Context()

		zcur, err := db.Collection("zones").Find(ctx, bson.M{"organizationId": orgID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error"})
			return
		}
		var zoneIDs []string
		for zcur.Next(ctx) {
			var z models.Zone
			zcur.Decode(&z)
			if zoneQ == "" || z.ID == zoneQ {
				zoneIDs = append(zoneIDs, z.ID)
			}
		}
		zcur.Close(ctx)
		if len(zoneIDs) == 0 {
			c.JSON(http.StatusOK, []gin.H{})
			return
		}

		cur, err := db.Collection("bins").Find(ctx, bson.M{"zoneId": bson.M{"$in": zoneIDs}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error"})
			return
		}
		defer cur.Close(ctx)
		var out []gin.H
		for cur.Next(ctx) {
			var bin models.Bin
			cur.Decode(&bin)
			var z models.Zone
			db.Collection("zones").FindOne(ctx, bson.M{"_id": bin.ZoneID}).Decode(&z)
			h := gin.H{
				"id": bin.ID, "locationLat": bin.LocationLat, "locationLng": bin.LocationLng,
				"capacity": bin.Capacity, "currentFillLevel": bin.CurrentFillLevel, "type": bin.Type,
				"zoneId": bin.ZoneID,
				"zone":   gin.H{"name": z.Name},
			}
			if bin.LastCollected != nil {
				h["lastCollected"] = bin.LastCollected.Format("2006-01-02T15:04:05.000Z07:00")
			} else {
				h["lastCollected"] = nil
			}
			out = append(out, h)
		}
		c.JSON(http.StatusOK, out)
	})

	b.PATCH("/:id/fill", binFillRoles(), func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		id := c.Param("id")
		var body struct {
			FillLevel interface{} `json:"fillLevel"`
		}
		c.ShouldBindJSON(&body)
		var fl float64
		switch v := body.FillLevel.(type) {
		case float64:
			fl = v
		case int:
			fl = float64(v)
		case string:
			fl, _ = strconv.ParseFloat(v, 64)
		}
		if fl < 0 || fl > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Fill level must be a number between 0 and 100."})
			return
		}
		ctx := c.Request.Context()
		var bin models.Bin
		if err := db.Collection("bins").FindOne(ctx, bson.M{"_id": id}).Decode(&bin); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Bin not found."})
			return
		}
		var z models.Zone
		if db.Collection("zones").FindOne(ctx, bson.M{"_id": bin.ZoneID, "organizationId": orgID}).Decode(&z) != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Bin not found."})
			return
		}
		bin.CurrentFillLevel = fl
		db.Collection("bins").ReplaceOne(ctx, bson.M{"_id": id}, bin)
		resp := gin.H{
			"id": bin.ID, "locationLat": bin.LocationLat, "locationLng": bin.LocationLng,
			"capacity": bin.Capacity, "currentFillLevel": bin.CurrentFillLevel, "type": bin.Type,
			"zoneId": bin.ZoneID,
		}
		if bin.LastCollected != nil {
			resp["lastCollected"] = bin.LastCollected.Format("2006-01-02T15:04:05.000Z07:00")
		} else {
			resp["lastCollected"] = nil
		}
		c.JSON(http.StatusOK, resp)
	})
}

func binListRoles() gin.HandlerFunc {
	return middleware.RequireRoles("SUPER_ADMIN", "GOV_ADMIN", "OPS_MANAGER", "ANALYST", "AUDITOR", "FIELD_SUPERVISOR", "VIEWER")
}

func binFillRoles() gin.HandlerFunc {
	return middleware.RequireRoles("SUPER_ADMIN", "GOV_ADMIN", "OPS_MANAGER", "FIELD_SUPERVISOR", "FIELD_OPERATOR")
}
