package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type EmployeeHandler struct {
	store database.Store
}

func NewEmployeeHandler(store database.Store) *EmployeeHandler {
	return &EmployeeHandler{store: store}
}

func (h *EmployeeHandler) ListEmployees(c *gin.Context) {
	role := c.Query("role")
	deptID := c.Query("department_id")
	search := c.Query("search")

	list, err := h.store.ListEmployees(role, deptID, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *EmployeeHandler) GetEmployee(c *gin.Context) {
	id := c.Param("id")
	emp, err := h.store.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	c.JSON(http.StatusOK, emp)
}

func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var emp models.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Use provided password or fallback to default
	passToHash := emp.Password
	if passToHash == "" {
		passToHash = "password123"
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(passToHash), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	emp.PasswordHash = string(hashed)
	emp.Password = "" // clear plain password before storing and returning

	if err := h.store.CreateEmployee(&emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Audit
	currentUserID, _ := c.Get("user_id")
	currentUserName, _ := c.Get("full_name")
	_ = h.store.LogAction(&models.AuditLog{
		UserID:    currentUserID.(string),
		UserName:  currentUserName.(string),
		Action:    "CREATE_EMPLOYEE",
		Entity:    "employees",
		EntityID:  emp.ID,
		Details:   map[string]interface{}{"name": emp.FullName, "role": emp.Role, "email": emp.Email},
		IPAddress: c.ClientIP(),
	})

	c.JSON(http.StatusCreated, emp)
}

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	var emp models.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	emp.ID = id

	if emp.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(emp.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		emp.PasswordHash = string(hashed)
		emp.Password = ""
	}

	if err := h.store.UpdateEmployee(&emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, emp)
}

func (h *EmployeeHandler) DeleteEmployee(c *gin.Context) {
	id := c.Param("id")
	if err := h.store.DeleteEmployee(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Employee removed successfully"})
}

func (h *EmployeeHandler) ListDepartments(c *gin.Context) {
	list, err := h.store.ListDepartments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *EmployeeHandler) ListJobTitles(c *gin.Context) {
	list, err := h.store.ListJobTitles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
