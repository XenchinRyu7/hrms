package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
)

type DashboardHandler struct {
	store database.Store
}

func NewDashboardHandler(store database.Store) *DashboardHandler {
	return &DashboardHandler{store: store}
}

func (h *DashboardHandler) GetTelemetry(c *gin.Context) {
	telemetry, err := h.store.GetDashboardTelemetry()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch telemetry data"})
		return
	}
	c.JSON(http.StatusOK, telemetry)
}
