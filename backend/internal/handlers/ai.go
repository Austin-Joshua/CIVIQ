package handlers

import (
	"math/rand"
	"net/http"
	"time"

	"civiq/api/internal/middleware"
	"civiq/api/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterAI(r *gin.RouterGroup, db *mongo.Database) {
	r.GET("/ai/forecast/:zoneId", func(c *gin.Context) {
		_ = c.MustGet(middleware.CtxClaims)
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		zid := c.Param("zoneId")
		ctx := c.Request.Context()
		var z models.Zone
		if db.Collection("zones").FindOne(ctx, bson.M{"_id": zid, "organizationId": orgID}).Decode(&z) != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Zone not found"})
			return
		}
		h := time.Now().UTC().Hour()
		isPeak := h >= 9 && h <= 14
		base := 300.0
		if isPeak {
			base = 800
		}
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		c.JSON(http.StatusOK, gin.H{
			"zoneId":              zid,
			"predictedWaste":      base + r.Float64()*200,
			"probability":         0.85 + r.Float64()*0.1,
			"recommendedAction": map[bool]string{true: "Priority Pickup", false: "Standard Routine"}[isPeak],
		})
	})

	r.POST("/ai/optimize-routes", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		var body struct {
			VehicleIDs []string `json:"vehicleIds"`
		}
		c.ShouldBindJSON(&body)
		ctx := c.Request.Context()
		var out []gin.H
		rng := rand.New(rand.NewSource(time.Now().UnixNano()))
		for _, vid := range body.VehicleIDs {
			var v models.Vehicle
			if db.Collection("vehicles").FindOne(ctx, bson.M{"_id": vid, "organizationId": orgID}).Decode(&v) != nil {
				continue
			}
			out = append(out, gin.H{
				"vehicleId": v.ID,
				"waypoints": []gin.H{
					{"lat": 40.7128, "lng": -74.0060},
					{"lat": 40.7138, "lng": -74.0070, "binId": "bin-ref-1"},
					{"lat": 40.7148, "lng": -74.0080, "binId": "bin-ref-2"},
				},
				"distance":       12.4 + rng.Float64()*5,
				"duration":       45 + rng.Float64()*20,
				"emissionsSaved": 2.5 + rng.Float64()*3,
			})
		}
		c.JSON(http.StatusOK, out)
	})

	r.GET("/ai/risk/:zoneId", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		zid := c.Param("zoneId")
		ctx := c.Request.Context()
		var z models.Zone
		if db.Collection("zones").FindOne(ctx, bson.M{"_id": zid, "organizationId": orgID}).Decode(&z) != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Zone not found"})
			return
		}
		cur, _ := db.Collection("bins").Find(ctx, bson.M{"zoneId": zid})
		defer cur.Close(ctx)
		var sum float64
		var n int
		for cur.Next(ctx) {
			var b models.Bin
			cur.Decode(&b)
			sum += b.CurrentFillLevel
			n++
		}
		avg := 0.0
		if n > 0 {
			avg = sum / float64(n)
		}
		risk := "LOW"
		if avg > 80 {
			risk = "CRITICAL"
		} else if avg > 60 {
			risk = "HIGH"
		}
		c.JSON(http.StatusOK, gin.H{
			"riskScore":           risk,
			"overflowProbability": avg / 100.0,
			"lastCalculated":      time.Now().UTC().Format(time.RFC3339Nano),
		})
	})
}
