package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type ExpenseHandler struct {
	store database.Store
}

func NewExpenseHandler(store database.Store) *ExpenseHandler {
	return &ExpenseHandler{store: store}
}

func (h *ExpenseHandler) ListExpenses(c *gin.Context) {
	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	empID := c.Query("employee_id")
	// Separation of Duties: Employee only sees their own expenses
	if role == models.RoleEmployee {
		empID = currentUserID.(string)
	}
	status := c.Query("status")

	exps, err := h.store.ListExpenses(empID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if exps == nil {
		exps = []models.Expense{}
	}
	c.JSON(http.StatusOK, exps)
}

func (h *ExpenseHandler) CreateExpense(c *gin.Context) {
	currentUserID, _ := c.Get("user_id")
	var exp models.Expense
	if err := c.ShouldBindJSON(&exp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exp.EmployeeID = currentUserID.(string)
	if err := h.store.CreateExpense(&exp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, exp)
}

type UpdateExpenseStatusInput struct {
	Status string `json:"status" binding:"required"` // approved, rejected, reimbursed
	Reason string `json:"reason"`
}

func (h *ExpenseHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	currentUserID, _ := c.Get("user_id")
	userRole, _ := c.Get("role")

	// Separation of Duties: Reimbursement approval is an HR/Finance responsibility
	if userRole != models.RoleHRManager && userRole != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Separation of Duties violation: Persetujuan reimbursement adalah kewenangan HR / Finance. Team Lead / Manager hanya berwenang mengajukan dan memantau status.",
		})
		return
	}

	var input UpdateExpenseStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.store.GetExpenseByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense claim not found"})
		return
	}

	// Separation of Duties (SoD) Rule: Submitter cannot approve their own expense claim!
	if existing.EmployeeID == currentUserID.(string) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Separation of Duties (SoD) violation: Anda tidak dapat menyetujui klaim expense yang Anda ajukan sendiri. Persetujuan harus dilakukan oleh reviewer/auditor independen.",
		})
		return
	}

	updated, err := h.store.UpdateExpenseStatus(id, input.Status, currentUserID.(string), input.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Audit trail
	_ = h.store.LogAction(&models.AuditLog{
		UserID:   currentUserID.(string),
		Action:   "EXPENSE_" + strings.ToUpper(input.Status),
		Entity:   "expenses",
		EntityID: id,
		Details: map[string]interface{}{
			"claimant_id":   existing.EmployeeID,
			"expense_title": existing.Title,
			"amount":        existing.Amount,
			"status":        input.Status,
			"reason":        input.Reason,
		},
	})

	c.JSON(http.StatusOK, updated)
}
