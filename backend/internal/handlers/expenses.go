package handlers

import (
	"net/http"

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
	if role == models.RoleEmployee {
		empID = currentUserID.(string)
	}
	status := c.Query("status")

	exps, err := h.store.ListExpenses(empID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	var input UpdateExpenseStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.store.UpdateExpenseStatus(id, input.Status, currentUserID.(string), input.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}
