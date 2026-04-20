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
	return err
}
