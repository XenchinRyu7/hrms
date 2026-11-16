package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type AttendanceHandler struct {
	store database.Store
}

func NewAttendanceHandler(store database.Store) *AttendanceHandler {
	return &AttendanceHandler{store: store}
}

func (h *AttendanceHandler) GetToday(c *gin.Context) {
	userID, _ := c.Get("user_id")
	att, err := h.store.GetTodayAttendance(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, att)
}

func (h *AttendanceHandler) ClockIn(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.ClockInRequest
	_ = c.ShouldBindJSON(&req)

	att, err := h.store.ClockIn(userID.(string), req.WorkLocation, req.Notes, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "data": att})
		return
	}

	c.JSON(http.StatusOK, att)
}

func (h *AttendanceHandler) ClockOut(c *gin.Context) {
	userID, _ := c.Get("user_id")
	att, err := h.store.ClockOut(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, att)
}

func (h *AttendanceHandler) ListAttendance(c *gin.Context) {
	empID := c.Query("employee_id")
	userRole, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	// Regular employees can only view their own attendance
	if userRole == models.RoleEmployee {
		empID = currentUserID.(string)
	}

	start := c.Query("start_date")
	end := c.Query("end_date")

	list, err := h.store.ListAttendance(empID, start, end)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
