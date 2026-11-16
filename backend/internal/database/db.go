package database

import (
	"context"
	"database/sql"
	"log"
	"strings"
	"time"

	_ "github.com/lib/pq"

	"github.com/ethereal-hrms/backend/internal/config"
)

var GlobalDB *sql.DB

func InitStore(cfg *config.Config) Store {
	if cfg.DatabaseURL != "" {
		masked := maskURL(cfg.DatabaseURL)
		log.Printf("[Database] Connecting to Supabase PostgreSQL: %s", masked)

		db, err := sql.Open("postgres", cfg.DatabaseURL)
		if err != nil {
			log.Printf("[Database] ⚠️ Error opening Postgres connection: %v", err)
		} else {
			db.SetMaxOpenConns(10)
			db.SetMaxIdleConns(5)
			db.SetConnMaxLifetime(30 * time.Minute)

			ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
			defer cancel()

			if err := db.PingContext(ctx); err != nil {
				log.Printf("[Database] ⚠️ Could not ping Supabase database (%v). Ensure pooler connection string is used.", err)
			} else {
				GlobalDB = db
				host := extractHost(cfg.DatabaseURL)
				log.Printf("[Database] ✅ Supabase PostgreSQL connection verified on %s!", host)

				// Start automated background keep-alive worker to prevent free tier auto-pause
				StartKeepAliveWorker(db, host, 6*time.Hour)

				log.Println("[Database] 🚀 Real Enterprise PostgreSQL Engine Active (CRUD persisted to Supabase)")
				return NewPostgresStore(db)
			}
		}
	}

	log.Println("[Database] ℹ️ Using Seeded In-Memory Data Engine (Offline/Fallback Mode)")
	return NewMemoryStore()
}

func maskURL(u string) string {
	if len(u) > 25 {
		parts := strings.Split(u, "@")
		if len(parts) == 2 {
			return "postgres://***@" + parts[1]
		}
		return u[:10] + "..." + u[len(u)-6:]
	}
	return "***"
}

func extractHost(u string) string {
	parts := strings.Split(u, "@")
	if len(parts) == 2 {
		slash := strings.Index(parts[1], "/")
		if slash != -1 {
			return parts[1][:slash]
		}
		return parts[1]
	}
	return "supabase"
}
