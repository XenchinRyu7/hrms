package main

import (
	"log"

	"github.com/ethereal-hrms/backend/internal/config"
	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/routes"
)

func main() {
	cfg := config.Load()

	store := database.InitStore(cfg)
	router := routes.SetupRouter(cfg, store)

	log.Printf("🌌 Ethereal HRMS Backend Server running on http://localhost:%s\n", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
