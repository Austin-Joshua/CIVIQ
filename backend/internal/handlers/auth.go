package handlers

import (
	"net/http"
	"regexp"
	"strings"
	"time"

	"civiq/api/internal/auth"
	"civiq/api/internal/config"
	"civiq/api/internal/models"
	"civiq/api/internal/security"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var emailRe = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func RegisterAuth(r *gin.RouterGroup, db *mongo.Database, cfg *config.Config, secret []byte, sec *security.Service) {
	r.POST("/auth/signup", func(c *gin.Context) {
		var body struct {
			Email             string `json:"email"`
			Password          string `json:"password"`
			Name              string `json:"name"`
			Role              string `json:"role"`
			OrganizationName  string `json:"organizationName"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
			return
		}
		if !emailRe.MatchString(strings.TrimSpace(body.Email)) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Please provide a valid email address."})
			return
		}
		if len(body.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Password must be at least 8 characters long."})
			return
		}
		if len(strings.TrimSpace(body.Name)) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Please provide your full name."})
			return
		}
		email := strings.ToLower(strings.TrimSpace(body.Email))
		ctx := c.Request.Context()
		count, _ := db.Collection("users").CountDocuments(ctx, bson.M{"email": email})
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"message": "An account with this email already exists."})
			return
		}
		allowed := map[string]struct{}{"OPS_MANAGER": {}, "ANALYST": {}, "VIEWER": {}}
		role := "OPS_MANAGER"
		if _, ok := allowed[body.Role]; ok {
			role = body.Role
		}
		orgName := strings.TrimSpace(body.OrganizationName)
		if len(orgName) < 3 {
			orgName = strings.TrimSpace(body.Name) + "'s Organization"
		}
		now := time.Now().UTC()
		org := models.Organization{
			ID:               uuid.New().String(),
			Name:             orgName,
			Type:             "MUNICIPALITY",
			SubscriptionPlan: "FREE",
			CreatedAt:        now,
			UpdatedAt:        now,
		}
		if _, err := db.Collection("organizations").InsertOne(ctx, org); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not create organization"})
			return
		}
		hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
		u := models.User{
			ID:             uuid.New().String(),
			Email:          email,
			PasswordHash:   string(hash),
			Name:           strings.TrimSpace(body.Name),
			Role:           role,
			OrganizationID: org.ID,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		if _, err := db.Collection("users").InsertOne(ctx, u); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not create user"})
			return
		}
		tok, _ := auth.Sign(secret, u.ID, u.Role, u.OrganizationID, 24)
		if sec != nil {
			sec.RecordSuccessfulLogin(ctx, u.ID, security.ClientIP(c))
		}
		c.JSON(http.StatusCreated, gin.H{
			"token": tok,
			"user": gin.H{
				"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
				"organizationId": u.OrganizationID, "organizationName": org.Name,
			},
		})
	})

	r.POST("/auth/login", func(c *gin.Context) {
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
			return
		}
		if !emailRe.MatchString(strings.TrimSpace(body.Email)) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Please provide a valid email address."})
			return
		}
		if len(body.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Password must be at least 8 characters long."})
			return
		}
		email := strings.ToLower(strings.TrimSpace(body.Email))
		ctx := c.Request.Context()
		var u models.User
		err := db.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&u)
		if err != nil {
			if sec != nil {
				sec.RecordFailedLogin(ctx, security.ClientIP(c), email)
			}
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password."})
			return
		}
		if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(body.Password)) != nil {
			if sec != nil {
				sec.RecordFailedLogin(ctx, security.ClientIP(c), email)
			}
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password."})
			return
		}
		var org models.Organization
		_ = db.Collection("organizations").FindOne(ctx, bson.M{"_id": u.OrganizationID}).Decode(&org)
		orgName := org.Name
		if orgName == "" {
			orgName = "Unknown Organization"
		}
		tok, _ := auth.Sign(secret, u.ID, u.Role, u.OrganizationID, 24)
		if sec != nil {
			sec.RecordSuccessfulLogin(ctx, u.ID, security.ClientIP(c))
		}
		c.JSON(http.StatusOK, gin.H{
			"token": tok,
			"user": gin.H{
				"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
				"organizationId": u.OrganizationID, "organizationName": orgName,
			},
		})
	})

	r.POST("/auth/guest-login", func(c *gin.Context) {
		ctx := c.Request.Context()
		var u models.User
		err := db.Collection("users").FindOne(ctx, bson.M{"role": "SUPER_ADMIN"}, options.FindOne().SetSort(bson.D{{Key: "_id", Value: 1}})).Decode(&u)
		if err != nil {
			err = db.Collection("users").FindOne(ctx, bson.M{}, options.FindOne().SetSort(bson.D{{Key: "_id", Value: 1}})).Decode(&u)
		}
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"message": "No user is available yet. Please try again shortly."})
			return
		}
		var org models.Organization
		_ = db.Collection("organizations").FindOne(ctx, bson.M{"_id": u.OrganizationID}).Decode(&org)
		orgName := org.Name
		if orgName == "" {
			orgName = "Guest Organization"
		}
		tok, _ := auth.Sign(secret, u.ID, u.Role, u.OrganizationID, 24)
		if sec != nil {
			sec.RecordSuccessfulLogin(ctx, u.ID, security.ClientIP(c))
		}
		c.JSON(http.StatusOK, gin.H{
			"token": tok,
			"user": gin.H{
				"id": u.ID, "email": u.Email, "name": u.Name, "role": u.Role,
				"organizationId": u.OrganizationID, "organizationName": orgName,
			},
		})
	})
}
