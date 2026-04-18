package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return mongo.Connect(ctx, options.Client().ApplyURI(uri))
}

func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	_, err := db.Collection("users").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"email": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_events").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"timestamp": -1},
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_events").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"userId": 1, "timestamp": -1},
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_events").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"ip": 1, "timestamp": -1},
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_blocks").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"type": 1, "value": 1},
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_known_ips").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    map[string]int{"userId": 1, "ip": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("security_ml_alerts").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]int{"timestamp": -1},
	})
	return err
}
