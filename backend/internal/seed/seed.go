package seed

import (
	"context"
	"time"

	"civiq/api/internal/config"
	"civiq/api/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Run(ctx context.Context, db *mongo.Database, cfg *config.Config) error {
	if !cfg.Bootstrap {
		return nil
	}
	orgCol := db.Collection("organizations")
	userCol := db.Collection("users")

	var org models.Organization
	err := orgCol.FindOne(ctx, bson.M{"name": cfg.SeedOrgName}).Decode(&org)
	if err == mongo.ErrNoDocuments {
		org = models.Organization{
			ID:               uuid.New().String(),
			Name:             cfg.SeedOrgName,
			Type:             "MUNICIPALITY",
			SubscriptionPlan: "ENTERPRISE",
			CreatedAt:        time.Now().UTC(),
			UpdatedAt:        time.Now().UTC(),
		}
		if _, err := orgCol.InsertOne(ctx, org); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(cfg.SeedPassword), 10)
	seed := []struct{ email, name, role string }{
		{"admin@civiq.city", "CIVIQ Administrator", "SUPER_ADMIN"},
		{"gov@civiq.city", "Sarah Chen", "GOV_ADMIN"},
		{"ops@civiq.city", "Raj Patel", "OPS_MANAGER"},
		{"analyst@civiq.city", "Maya Torres", "ANALYST"},
		{"supervisor@civiq.city", "David Kim", "FIELD_SUPERVISOR"},
		{"operator@civiq.city", "Alex Johnson", "FIELD_OPERATOR"},
		{"auditor@civiq.city", "Priya Sharma", "AUDITOR"},
		{"viewer@civiq.city", "Jordan Lee", "VIEWER"},
	}
	for _, s := range seed {
		var existing models.User
		err := userCol.FindOne(ctx, bson.M{"email": s.email}).Decode(&existing)
		now := time.Now().UTC()
		if err == mongo.ErrNoDocuments {
			u := models.User{
				ID:             uuid.New().String(),
				Email:          s.email,
				PasswordHash:   string(hash),
				Name:           s.name,
				Role:           s.role,
				OrganizationID: org.ID,
				CreatedAt:      now,
				UpdatedAt:      now,
			}
			if _, err := userCol.InsertOne(ctx, u); err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			existing.PasswordHash = string(hash)
			existing.Name = s.name
			existing.Role = s.role
			existing.OrganizationID = org.ID
			existing.UpdatedAt = now
			_, _ = userCol.ReplaceOne(ctx, bson.M{"_id": existing.ID}, existing)
		}
	}
	return nil
}
