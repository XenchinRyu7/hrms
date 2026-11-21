package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type LeaveHandler struct {
	store database.Store
}

func NewLeaveHandler(store database.Store) *LeaveHandler {
	return &LeaveHandler{store: store}
}

func (h *LeaveHandler) ListTypes(c *gin.Context) {
	types, err := h.store.ListLeaveTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

func (h *LeaveHandler) GetBalances(c *gin.Context) {
	currentUserID, _ := c.Get("user_id")
	empID := c.Query("employee_id")
	if empID == "" {
		empID = currentUserID.(string)
	}

	balances, err := h.store.GetLeaveBalances(empID, 2026)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, balances)
}

func (h *LeaveHandler) ListRequests(c *gin.Context) {
	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	empID := c.Query("employee_id")
	if role == models.RoleEmployee {
		empID = currentUserID.(string)
	}
	status := c.Query("status")

	reqs, err := h.store.ListLeaveRequests(empID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reqs)
}

func (h *LeaveHandler) CreateRequest(c *gin.Context) {
	currentUserID, _ := c.Get("user_id")

	var input models.CreateLeaveRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req := models.LeaveRequest{
		EmployeeID:  currentUserID.(string),
		LeaveTypeID: input.LeaveTypeID,
		StartDate:   input.StartDate,
		EndDate:     input.EndDate,
		TotalDays:   input.TotalDays,
		Reason:      input.Reason,
	}

	if err := h.store.CreateLeaveRequest(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, req)
}

type UpdateLeaveStatusInput struct {
	Status string `json:"status" binding:"required"` // approved, rejected
	Reason string `json:"reason"`
}

func (h *LeaveHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	currentUserID, _ := c.Get("user_id")

	var input UpdateLeaveStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.store.GetLeaveRequestByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Permohonan cuti tidak ditemukan"})
		return
	}

	// Separation of Duties (SoD) Rule: Submitter cannot approve their own leave request
	if existing.EmployeeID == currentUserID.(string) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Separation of Duties (SoD) violation: Anda tidak dapat menyetujui permohonan cuti milik Anda sendiri.",
		})
		return
	}

	updated, err := h.store.UpdateLeaveRequestStatus(id, input.Status, currentUserID.(string), input.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_ = h.store.LogAction(&models.AuditLog{
		UserID:   currentUserID.(string),
		Action:   "LEAVE_" + input.Status,
		Entity:   "leave_requests",
		EntityID: id,
		Details: map[string]interface{}{
			"claimant_id": existing.EmployeeID,
			"start_date":  existing.StartDate,
			"end_date":    existing.EndDate,
			"status":      input.Status,
		},
	})

	c.JSON(http.StatusOK, updated)
}
