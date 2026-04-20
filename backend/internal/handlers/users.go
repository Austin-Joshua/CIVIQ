package handlers

import (
	"net/http"
	"strings"
	"time"

	"civiq/api/internal/auth"
	"civiq/api/internal/middleware"
	"civiq/api/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUsers(r *gin.RouterGroup, db *mongo.Database) {
	r.GET("/users/me", func(c *gin.Context) {
		cl := c.MustGet(middleware.CtxClaims).(*auth.Claims)
		ctx := c.Request.Context()
		var u models.User
		if err := db.Collection("users").FindOne(ctx, bson.M{"_id": cl.ID}).Decode(&u); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
			"organizationId": u.OrganizationID,
		})
	})

	r.PATCH("/users/me", func(c *gin.Context) {
		cl := c.MustGet(middleware.CtxClaims).(*auth.Claims)
		var body map[string]interface{}
		_ = c.ShouldBindJSON(&body)
		ctx := c.Request.Context()
		var u models.User
		if err := db.Collection("users").FindOne(ctx, bson.M{"_id": cl.ID}).Decode(&u); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
			return
		}
		if n, ok := body["name"].(string); ok && strings.TrimSpace(n) != "" {
			u.Name = strings.TrimSpace(n)
		}
		if e, ok := body["email"].(string); ok && strings.TrimSpace(e) != "" {
			u.Email = strings.ToLower(strings.TrimSpace(e))
		}
		if cur, ok := body["currentPassword"].(string); ok {
			if nw, ok := body["newPassword"].(string); ok {
				if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(cur)) != nil {
					c.JSON(http.StatusUnauthorized, gin.H{"message": "Current password is incorrect"})
					return
				}
				if len(nw) < 6 {
					c.JSON(http.StatusBadRequest, gin.H{"message": "New password must be at least 6 characters"})
					return
				}
				h, _ := bcrypt.GenerateFromPassword([]byte(nw), 10)
				u.PasswordHash = string(h)
			}
		}
		u.UpdatedAt = time.Now().UTC()
		_, _ = db.Collection("users").ReplaceOne(ctx, bson.M{"_id": u.ID}, u)
		c.JSON(http.StatusOK, gin.H{
			"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
			"organizationId": u.OrganizationID,
		})
	})

	admin := r.Group("/users")
	admin.Use(middleware.RequireRoles("SUPER_ADMIN", "GOV_ADMIN"))

	admin.GET("", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		ctx := c.Request.Context()
		opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		cur, err := db.Collection("users").Find(ctx, bson.M{"organizationId": orgID}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error"})
			return
		}
		defer cur.Close(ctx)
		var out []gin.H
		for cur.Next(ctx) {
			var u models.User
			cur.Decode(&u)
			out = append(out, gin.H{
				"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
				"createdAt": u.CreatedAt.Format(time.RFC3339Nano),
			})
		}
		c.JSON(http.StatusOK, out)
	})

	admin.POST("/invite", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		var body struct {
			Email             string `json:"email"`
			Name              string `json:"name"`
			Role              string `json:"role"`
			TemporaryPassword string `json:"temporaryPassword"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.Email == "" || body.Name == "" || body.Role == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Email, name, and role are required."})
			return
		}
		ctx := c.Request.Context()
		n, _ := db.Collection("users").CountDocuments(ctx, bson.M{"email": body.Email})
		if n > 0 {
			c.JSON(http.StatusConflict, gin.H{"message": "User with this email already exists."})
			return
		}
		raw := body.TemporaryPassword
		if raw == "" {
			raw = "Welcome123!"
		}
		hash, _ := bcrypt.GenerateFromPassword([]byte(raw), 10)
		now := time.Now().UTC()
		u := models.User{
			ID:             uuid.New().String(),
			Email:          body.Email,
			PasswordHash:   string(hash),
			Name:           body.Name,
			Role:           body.Role,
			OrganizationID: orgID,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		db.Collection("users").InsertOne(ctx, u)
		c.JSON(http.StatusCreated, gin.H{"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role})
	})

	admin.PATCH("/:id", func(c *gin.Context) {
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		id := c.Param("id")
		var body map[string]interface{}
		_ = c.ShouldBindJSON(&body)
		ctx := c.Request.Context()
		var target models.User
		if err := db.Collection("users").FindOne(ctx, bson.M{"_id": id, "organizationId": orgID}).Decode(&target); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found or access denied."})
			return
		}
		if r, ok := body["role"].(string); ok && target.Role == "GOV_ADMIN" && r != "GOV_ADMIN" {
			n, _ := db.Collection("users").CountDocuments(ctx, bson.M{"organizationId": orgID, "role": "GOV_ADMIN"})
			if n <= 1 {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Cannot demote the last Government Administrator."})
				return
			}
		}
		if n, ok := body["name"].(string); ok {
			target.Name = n
		}
		if r, ok := body["role"].(string); ok {
			target.Role = r
		}
		target.UpdatedAt = time.Now().UTC()
		db.Collection("users").ReplaceOne(ctx, bson.M{"_id": id}, target)
		c.JSON(http.StatusOK, gin.H{"id": target.ID, "email": target.Email, "name": target.Name, "role": target.Role})
	})

	admin.DELETE("/:id", func(c *gin.Context) {
		cl := c.MustGet(middleware.CtxClaims).(*auth.Claims)
		orgID := c.MustGet(middleware.CtxOrgID).(string)
		id := c.Param("id")
		if id == cl.ID {
			c.JSON(http.StatusBadRequest, gin.H{"message": "You cannot delete your own account. Ask another administrator."})
			return
		}
		ctx := c.Request.Context()
		var target models.User
		if err := db.Collection("users").FindOne(ctx, bson.M{"_id": id, "organizationId": orgID}).Decode(&target); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found or access denied."})
			return
		}
		if target.Role == "GOV_ADMIN" {
			n, _ := db.Collection("users").CountDocuments(ctx, bson.M{"organizationId": orgID, "role": "GOV_ADMIN"})
			if n <= 1 {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Cannot delete the last Government Administrator."})
				return
			}
		}
		db.Collection("users").DeleteOne(ctx, bson.M{"_id": id})
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "User deleted successfully."})
	})
}
