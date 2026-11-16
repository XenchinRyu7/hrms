package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
)

type SystemHandler struct{}

func NewSystemHandler() *SystemHandler {
	return &SystemHandler{}
}

// GetStatus returns the live health, database connectivity, and keep-alive metrics
func (h *SystemHandler) GetStatus(c *gin.Context) {
	keepalive := database.GetKeepAliveStatus()

	c.JSON(http.StatusOK, gin.H{
		"system":      "Ethereal Enterprise HRMS API",
		"version":     "1.0.0",
		"ui_engine":   "Ethereal UI v0.0.7",
		"server_time": time.Now().UTC().Format(time.RFC3339),
		"database": gin.H{
			"type":            "PostgreSQL (Supabase)",
			"keepalive":       keepalive,
			"auto_ping":       "active",
			"interval":        "6 hours",
			"pause_prevented": true,
		},
	})
}

// TriggerPing executes an immediate keep-alive ping against the database
func (h *SystemHandler) TriggerPing(c *gin.Context) {
	status, err := database.TriggerKeepAlivePing()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"error":   err.Error(),
			"message": "Database ping failed or keepalive worker is not initialized",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Supabase ping successful - Project activity refreshed",
		"telemetry": status,
	})
}
