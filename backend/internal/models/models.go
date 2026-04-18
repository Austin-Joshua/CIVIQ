package models

import "time"

type Organization struct {
	ID               string    `bson:"_id" json:"id"`
	Name             string    `bson:"name" json:"name"`
	Type             string    `bson:"type" json:"type"`
	ParentID         *string   `bson:"parentId,omitempty" json:"parentId,omitempty"`
	SubscriptionPlan string    `bson:"subscriptionPlan" json:"subscriptionPlan"`
	CreatedAt        time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt        time.Time `bson:"updatedAt" json:"updatedAt"`
}

type User struct {
	ID               string    `bson:"_id" json:"id"`
	Email            string    `bson:"email" json:"email"`
	PasswordHash     string    `bson:"passwordHash" json:"-"`
	Name             string    `bson:"name" json:"name"`
	Role             string    `bson:"role" json:"role"`
	OrganizationID   string    `bson:"organizationId" json:"organizationId"`
	CreatedAt        time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt        time.Time `bson:"updatedAt" json:"updatedAt"`
}

type AuditLog struct {
	ID               string    `bson:"_id" json:"id"`
	Action           string    `bson:"action" json:"action"`
	EntityType       string    `bson:"entityType" json:"entityType"`
	EntityID         *string   `bson:"entityId,omitempty" json:"entityId,omitempty"`
	Metadata         string    `bson:"metadata" json:"metadata"`
	Timestamp        time.Time `bson:"timestamp" json:"timestamp"`
	UserID           *string   `bson:"userId,omitempty" json:"userId,omitempty"`
	OrganizationID   string    `bson:"organizationId" json:"organizationId"`
}

type Zone struct {
	ID               string    `bson:"_id" json:"id"`
	Name             string    `bson:"name" json:"name"`
	Geometry         *string   `bson:"geometry,omitempty" json:"geometry,omitempty"`
	CleanlinessScore float64   `bson:"cleanlinessScore" json:"cleanlinessScore"`
	OrganizationID   string    `bson:"organizationId" json:"organizationId"`
}

type Bin struct {
	ID               string     `bson:"_id" json:"id"`
	LocationLat      float64    `bson:"locationLat" json:"locationLat"`
	LocationLng      float64    `bson:"locationLng" json:"locationLng"`
	Capacity         float64    `bson:"capacity" json:"capacity"`
	CurrentFillLevel float64    `bson:"currentFillLevel" json:"currentFillLevel"`
	Type             string     `bson:"type" json:"type"`
	LastCollected    *time.Time `bson:"lastCollected,omitempty" json:"lastCollected,omitempty"`
	ZoneID           string     `bson:"zoneId" json:"zoneId"`
}

type Vehicle struct {
	ID             string  `bson:"_id" json:"id"`
	Capacity       float64 `bson:"capacity" json:"capacity"`
	Status         string  `bson:"status" json:"status"`
	Lat            float64 `bson:"lat" json:"lat"`
	Lng            float64 `bson:"lng" json:"lng"`
	OrganizationID string  `bson:"organizationId" json:"organizationId"`
}

type Route struct {
	ID                string    `bson:"_id" json:"id"`
	Waypoints         string    `bson:"waypoints" json:"waypoints"`
	EstimatedDuration float64   `bson:"estimatedDuration" json:"estimatedDuration"`
	EmissionsSaved    float64   `bson:"emissionsSaved" json:"emissionsSaved"`
	CreatedAt         time.Time `bson:"createdAt" json:"createdAt"`
	VehicleID         string    `bson:"vehicleId" json:"vehicleId"`
}

type Alert struct {
	ID               string     `bson:"_id" json:"id"`
	Type             string     `bson:"type" json:"type"`
	Severity         string     `bson:"severity" json:"severity"`
	Status           string     `bson:"status" json:"status"`
	Message          string     `bson:"message" json:"message"`
	Timestamp        time.Time  `bson:"timestamp" json:"timestamp"`
	Resolved         bool       `bson:"resolved" json:"resolved"`
	ResolutionNotes  *string    `bson:"resolutionNotes,omitempty" json:"resolutionNotes,omitempty"`
	AssignedToID     *string    `bson:"assignedToId,omitempty" json:"assignedToId,omitempty"`
	OrganizationID   string     `bson:"organizationId" json:"organizationId"`
}

type UserBrief struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
