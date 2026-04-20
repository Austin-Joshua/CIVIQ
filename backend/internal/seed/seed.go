package seed

import (
	"context"
	"fmt"
	"time"

	"civiq/api/internal/config"
	"civiq/api/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	roleUserID := map[string]string{}
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
			roleUserID[s.role] = u.ID
		} else if err != nil {
			return err
		} else {
			existing.PasswordHash = string(hash)
			existing.Name = s.name
			existing.Role = s.role
			existing.OrganizationID = org.ID
			existing.UpdatedAt = now
			_, _ = userCol.ReplaceOne(ctx, bson.M{"_id": existing.ID}, existing)
			roleUserID[s.role] = existing.ID
		}
	}
	if err := seedOperationalData(ctx, db, org.ID, roleUserID); err != nil {
		return err
	}
	return nil
}

func seedOperationalData(ctx context.Context, db *mongo.Database, orgID string, roleUserID map[string]string) error {
	zoneCol := db.Collection("zones")
	binCol := db.Collection("bins")
	vehicleCol := db.Collection("vehicles")
	routeCol := db.Collection("routes")
	alertCol := db.Collection("alerts")

	zones := []models.Zone{
		{ID: "zone-a", Name: "Zone A - Central", Geometry: nil, CleanlinessScore: 92, OrganizationID: orgID},
		{ID: "zone-b", Name: "Zone B - Port Side", Geometry: nil, CleanlinessScore: 68, OrganizationID: orgID},
		{ID: "zone-c", Name: "Zone C - Industrial", Geometry: nil, CleanlinessScore: 45, OrganizationID: orgID},
		{ID: "zone-d", Name: "Zone D - Residential North", Geometry: nil, CleanlinessScore: 85, OrganizationID: orgID},
	}
	for _, z := range zones {
		if _, err := zoneCol.ReplaceOne(ctx, bson.M{"_id": z.ID}, z, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}

	now := time.Now().UTC()
	bins := make([]models.Bin, 0, 24)
	zoneIDs := []string{"zone-a", "zone-b", "zone-c", "zone-d"}
	binTypes := []string{"GENERAL", "RECYCLABLE", "ORGANIC"}
	for i := 0; i < 24; i++ {
		zoneID := zoneIDs[i%len(zoneIDs)]
		fill := float64((i*13 + 27) % 100)
		capacity := float64(120 + (i%5)*40)
		var last *time.Time
		if i%4 != 0 {
			t := now.Add(-time.Duration((i%9)+1) * time.Hour)
			last = &t
		}
		bins = append(bins, models.Bin{
			ID:               fmt.Sprintf("bin-%02d", i+1),
			LocationLat:      40.700 + float64(i%6)*0.006 + float64(i/6)*0.0025,
			LocationLng:      -74.020 + float64(i%6)*0.0035,
			Capacity:         capacity,
			CurrentFillLevel: fill,
			Type:             binTypes[i%len(binTypes)],
			LastCollected:    last,
			ZoneID:           zoneID,
		})
	}
	for _, b := range bins {
		if _, err := binCol.ReplaceOne(ctx, bson.M{"_id": b.ID}, b, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}

	vehicles := []models.Vehicle{
		{ID: "veh-01", Capacity: 88, Status: "ON_ROUTE", Lat: 40.7128, Lng: -74.0060, OrganizationID: orgID},
		{ID: "veh-02", Capacity: 52, Status: "ACTIVE", Lat: 40.7180, Lng: -74.0120, OrganizationID: orgID},
		{ID: "veh-03", Capacity: 34, Status: "IDLE", Lat: 40.7055, Lng: -74.0010, OrganizationID: orgID},
		{ID: "veh-04", Capacity: 73, Status: "ON_ROUTE", Lat: 40.7202, Lng: -74.0168, OrganizationID: orgID},
	}
	for _, v := range vehicles {
		if _, err := vehicleCol.ReplaceOne(ctx, bson.M{"_id": v.ID}, v, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}

	routes := []models.Route{
		{ID: "route-01", VehicleID: "veh-01", Waypoints: "[\"zone-a\",\"zone-b\",\"landfill\"]", EstimatedDuration: 47, EmissionsSaved: 2.1, CreatedAt: now.Add(-35 * time.Minute)},
		{ID: "route-02", VehicleID: "veh-02", Waypoints: "[\"zone-d\",\"zone-a\",\"landfill\"]", EstimatedDuration: 42, EmissionsSaved: 1.7, CreatedAt: now.Add(-80 * time.Minute)},
		{ID: "route-03", VehicleID: "veh-04", Waypoints: "[\"zone-c\",\"zone-b\",\"landfill\"]", EstimatedDuration: 58, EmissionsSaved: 2.9, CreatedAt: now.Add(-130 * time.Minute)},
	}
	for _, r := range routes {
		if _, err := routeCol.ReplaceOne(ctx, bson.M{"_id": r.ID}, r, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}

	assignOps := roleUserID["OPS_MANAGER"]
	assignSup := roleUserID["FIELD_SUPERVISOR"]
	assignAnalyst := roleUserID["ANALYST"]
	notesResolved := "Overflow cleared and route adjusted."
	alerts := []models.Alert{
		{
			ID: "al-001", Type: "OVERFLOW_RISK", Severity: "CRITICAL", Status: "DETECTED",
			Message: "Bin C-12 is at 96% fill capacity.", Timestamp: now.Add(-25 * time.Minute),
			Resolved: false, OrganizationID: orgID, AssignedToID: strPtr(assignSup),
		},
		{
			ID: "al-002", Type: "ROUTE_DELAY", Severity: "HIGH", Status: "RESPONDING",
			Message: "Truck veh-01 delayed by congestion near Port Side.", Timestamp: now.Add(-80 * time.Minute),
			Resolved: false, OrganizationID: orgID, AssignedToID: strPtr(assignOps),
		},
		{
			ID: "al-003", Type: "ILLEGAL_DUMP", Severity: "CRITICAL", Status: "ASSIGNED",
			Message: "Possible illegal dumping detected in Industrial corridor.", Timestamp: now.Add(-3 * time.Hour),
			Resolved: false, OrganizationID: orgID, AssignedToID: strPtr(assignOps),
		},
		{
			ID: "al-004", Type: "RECYCLING_CONTAMINATION", Severity: "MEDIUM", Status: "RESOLVED",
			Message: "Contamination in recycling lane was corrected by field operator.", Timestamp: now.Add(-9 * time.Hour),
			Resolved: true, ResolutionNotes: &notesResolved, OrganizationID: orgID, AssignedToID: strPtr(assignAnalyst),
		},
	}
	for i := 5; i <= 16; i++ {
		id := fmt.Sprintf("al-%03d", i)
		status := "DETECTED"
		resolved := false
		var assignee *string
		sev := "LOW"
		switch i % 4 {
		case 0:
			sev = "HIGH"
			status = "ASSIGNED"
			assignee = strPtr(assignSup)
		case 1:
			sev = "MEDIUM"
			status = "RESPONDING"
			assignee = strPtr(assignOps)
		case 2:
			sev = "CRITICAL"
			status = "DETECTED"
			assignee = strPtr(assignOps)
		default:
			sev = "LOW"
			status = "RESOLVED"
			resolved = true
			assignee = strPtr(assignAnalyst)
		}
		msg := fmt.Sprintf("Automated field anomaly #%d requires review.", i)
		a := models.Alert{
			ID:             id,
			Type:           "FIELD_ANOMALY",
			Severity:       sev,
			Status:         status,
			Message:        msg,
			Timestamp:      now.Add(-time.Duration(i*27) * time.Minute),
			Resolved:       resolved,
			OrganizationID: orgID,
			AssignedToID:   assignee,
		}
		if resolved {
			n := "Resolved automatically by schedule optimization."
			a.ResolutionNotes = &n
		}
		alerts = append(alerts, a)
	}
	for _, a := range alerts {
		if _, err := alertCol.ReplaceOne(ctx, bson.M{"_id": a.ID}, a, options.Replace().SetUpsert(true)); err != nil {
			return err
		}
	}
	return nil
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	v := s
	return &v
}
