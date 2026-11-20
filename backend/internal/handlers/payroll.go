package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type PayrollHandler struct {
	store database.Store
}

func NewPayrollHandler(store database.Store) *PayrollHandler {
	return &PayrollHandler{store: store}
}

func (h *PayrollHandler) ListPeriods(c *gin.Context) {
	periods, err := h.store.ListPayrollPeriods()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if periods == nil {
		periods = []models.PayrollPeriod{}
	}
	c.JSON(http.StatusOK, periods)
}

func (h *PayrollHandler) CreatePeriod(c *gin.Context) {
	var period models.PayrollPeriod
	if err := c.ShouldBindJSON(&period); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.CreatePayrollPeriod(&period); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, period)
}

func (h *PayrollHandler) ListPayslips(c *gin.Context) {
	periodID := c.Query("period_id")
	employeeID := c.Query("employee_id")

	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	// Regular employee can only view their own payslips
	if role == models.RoleEmployee {
		employeeID = currentUserID.(string)
	}

	slips, err := h.store.ListPayslips(periodID, employeeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if slips == nil {
		slips = []models.Payslip{}
	}
	c.JSON(http.StatusOK, slips)
}

func (h *PayrollHandler) GeneratePayslips(c *gin.Context) {
	periodID := c.Param("period_id")
	currentUserID, _ := c.Get("user_id")

	if err := h.store.GeneratePayslipsForPeriod(periodID, currentUserID.(string)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payslips successfully calculated and generated"})
}

func (h *PayrollHandler) GetSalaryStructure(c *gin.Context) {
	empID := c.Param("employee_id")
	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	if role == models.RoleEmployee && empID != currentUserID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	st, err := h.store.GetSalaryStructure(empID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salary structure not defined yet"})
		return
	}
	c.JSON(http.StatusOK, st)
}

func (h *PayrollHandler) SaveSalaryStructure(c *gin.Context) {
	var st models.SalaryStructure
	if err := c.ShouldBindJSON(&st); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.SaveSalaryStructure(&st); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, st)
}
