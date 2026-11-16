package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type PerformanceHandler struct {
	store database.Store
}

func NewPerformanceHandler(store database.Store) *PerformanceHandler {
	return &PerformanceHandler{store: store}
}

func (h *PerformanceHandler) ListCycles(c *gin.Context) {
	cycles, err := h.store.ListPerformanceCycles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cycles)
}

func (h *PerformanceHandler) ListGoals(c *gin.Context) {
	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	empID := c.Query("employee_id")
	if role == models.RoleEmployee {
		empID = currentUserID.(string)
	}
	cycleID := c.Query("cycle_id")

	goals, err := h.store.ListPerformanceGoals(empID, cycleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, goals)
}

func (h *PerformanceHandler) CreateGoal(c *gin.Context) {
	var goal models.PerformanceGoal
	if err := c.ShouldBindJSON(&goal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.CreatePerformanceGoal(&goal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, goal)
}

func (h *PerformanceHandler) UpdateGoal(c *gin.Context) {
	id := c.Param("id")
	var goal models.PerformanceGoal
	if err := c.ShouldBindJSON(&goal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	goal.ID = id

	if err := h.store.UpdatePerformanceGoal(&goal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, goal)
}
