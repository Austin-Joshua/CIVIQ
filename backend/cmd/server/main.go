package main

import (
	"context"
	"log"
	"os"

	"civiq/api/internal/config"
	"civiq/api/internal/db"
	"civiq/api/internal/handlers"
	"civiq/api/internal/seed"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	for _, envFile := range []string{".env", "backend/.env"} {
		_ = godotenv.Load(envFile)
	}
	cfg := config.Load()

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	client, err := db.Connect(cfg.MongoURI)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	mdb := client.Database(cfg.DatabaseName)
	ctx := context.Background()
	if err := db.EnsureIndexes(ctx, mdb); err != nil {
		log.Println("index warning:", err)
	}
	if err := seed.Run(ctx, mdb, cfg); err != nil {
		log.Println("seed warning:", err)
	}

	r := gin.New()
	r.Use(gin.Recovery())

	secret := []byte(cfg.JWTSecret)
	handlers.Mount(r, mdb, cfg, secret, nil)

	addr := ":" + cfg.Port
	log.Printf("CIVIQ API (Go + MongoDB) listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
