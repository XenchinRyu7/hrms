package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/config"
	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/handlers"
	"github.com/ethereal-hrms/backend/internal/middleware"
	"github.com/ethereal-hrms/backend/internal/models"
)

func SetupRouter(cfg *config.Config, store database.Store) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	authH := handlers.NewAuthHandler(store, cfg.JWTSecret)
	dashH := handlers.NewDashboardHandler(store)
	empH := handlers.NewEmployeeHandler(store)
	attH := handlers.NewAttendanceHandler(store)
	leaveH := handlers.NewLeaveHandler(store)
	payH := handlers.NewPayrollHandler(store)
	recH := handlers.NewRecruitmentHandler(store)
	perfH := handlers.NewPerformanceHandler(store)
	expH := handlers.NewExpenseHandler(store)
	auditH := handlers.NewAuditHandler(store)
	sysH := handlers.NewSystemHandler()

	api := r.Group("/api/v1")
	{
		// Health & System Keep-Alive
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":    "healthy",
				"system":    "Ethereal Enterprise HRMS API",
				"version":   "1.0.0",
				"ui_engine": "Ethereal UI v0.0.7",
			})
		})
		api.GET("/system/status", sysH.GetStatus)
		api.GET("/system/db-ping", sysH.TriggerPing)
		api.POST("/system/keepalive", sysH.TriggerPing)

		// Public Auth
		api.POST("/auth/login", authH.Login)

		// Protected endpoints
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Auth Profile
			protected.GET("/auth/me", authH.Me)
			protected.PUT("/auth/profile", authH.UpdateProfile)
			protected.PUT("/auth/password", authH.ChangePassword)

			// Executive Telemetry & Dashboard
			protected.GET("/dashboard/telemetry", dashH.GetTelemetry)

			// Employee Management & Org Directory
			protected.GET("/employees", empH.ListEmployees)
			protected.GET("/employees/:id", empH.GetEmployee)
			protected.POST("/employees", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), empH.CreateEmployee)
			protected.PUT("/employees/:id", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), empH.UpdateEmployee)
			protected.DELETE("/employees/:id", middleware.RequireRoles(models.RoleAdmin), empH.DeleteEmployee)
			protected.GET("/departments", empH.ListDepartments)
			protected.GET("/job-titles", empH.ListJobTitles)

			// Attendance & Time Tracking
			protected.GET("/attendance/today", attH.GetToday)
			protected.POST("/attendance/clock-in", attH.ClockIn)
			protected.POST("/attendance/clock-out", attH.ClockOut)
			protected.GET("/attendance/history", attH.ListAttendance)

			// Leave & Time-Off Management
			protected.GET("/leave/types", leaveH.ListTypes)
			protected.GET("/leave/balances", leaveH.GetBalances)
			protected.GET("/leave/requests", leaveH.ListRequests)
			protected.POST("/leave/requests", leaveH.CreateRequest)
			protected.PATCH("/leave/requests/:id/status", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager, models.RoleManager), leaveH.UpdateStatus)

			// Payroll & Compensation
			protected.GET("/payroll/periods", payH.ListPeriods)
			protected.POST("/payroll/periods", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), payH.CreatePeriod)
			protected.GET("/payroll/payslips", payH.ListPayslips)
			protected.POST("/payroll/periods/:period_id/generate", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), payH.GeneratePayslips)
			protected.GET("/payroll/salary-structure/:employee_id", payH.GetSalaryStructure)
			protected.POST("/payroll/salary-structure", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), payH.SaveSalaryStructure)

			// Recruitment (ATS)
			protected.GET("/recruitment/jobs", recH.ListJobs)
			protected.POST("/recruitment/jobs", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), recH.CreateJob)
			protected.GET("/recruitment/applicants", recH.ListApplicants)
			protected.POST("/recruitment/applicants", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), recH.CreateApplicant)
			protected.PATCH("/recruitment/applicants/:id/stage", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), recH.UpdateStage)

			// Performance & OKRs
			protected.GET("/performance/cycles", perfH.ListCycles)
			protected.GET("/performance/goals", perfH.ListGoals)
			protected.POST("/performance/goals", perfH.CreateGoal)
			protected.PUT("/performance/goals/:id", perfH.UpdateGoal)

			// Expenses & Claims
			protected.GET("/expenses", expH.ListExpenses)
			protected.POST("/expenses", expH.CreateExpense)
			protected.PATCH("/expenses/:id/status", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager, models.RoleManager), expH.UpdateStatus)

			// Audit Logs
			protected.GET("/audit/logs", middleware.RequireRoles(models.RoleAdmin, models.RoleHRManager), auditH.ListAuditLogs)
		}
	}

	return r
}
