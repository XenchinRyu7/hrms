package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	CORSOrigins []string
}

func Load() *Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "ethereal-enterprise-hrms-secret-key-oklch-2026"
	}

	corsRaw := os.Getenv("CORS_ORIGIN")
	if corsRaw == "" {
		corsRaw = "http://localhost:4321,http://localhost:3000,http://127.0.0.1:4321"
	}
	origins := strings.Split(corsRaw, ",")

	return &Config{
		Port:        port,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTSecret:   jwtSecret,
		CORSOrigins: origins,
	}
}
