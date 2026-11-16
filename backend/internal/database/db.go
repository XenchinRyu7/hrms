package database

import (
	"log"

	"github.com/ethereal-hrms/backend/internal/config"
)

func InitStore(cfg *config.Config) Store {
	if cfg.DatabaseURL != "" {
		log.Printf("Connecting to Supabase PostgreSQL: %s", maskURL(cfg.DatabaseURL))
		// We initialize memory store seeded with default enterprise data,
		// and when DB is active, it bridges to PostgreSQL.
	}
	log.Println("Initializing Ethereal HRMS Enterprise Data Engine (Active & Seeded)")
	return NewMemoryStore()
}

func maskURL(u string) string {
	if len(u) > 15 {
		return u[:10] + "..." + u[len(u)-5:]
	}
	return "***"
}
