package database

import (
	"github.com/ethereal-hrms/backend/internal/models"
)

type Store interface {
	// Auth & Employee
	GetEmployeeByEmail(email string) (*models.Employee, error)
	GetEmployeeByID(id string) (*models.Employee, error)
	ListEmployees(role, departmentID, search string) ([]models.Employee, error)
	CreateEmployee(emp *models.Employee) error
	UpdateEmployee(emp *models.Employee) error
	DeleteEmployee(id string) error

	// Departments & Job Titles
	ListDepartments() ([]models.Department, error)
	CreateDepartment(dept *models.Department) error
	ListJobTitles() ([]models.JobTitle, error)

	// Attendance
	GetTodayAttendance(employeeID string) (*models.Attendance, error)
	ClockIn(employeeID, location, notes, ip string) (*models.Attendance, error)
	ClockOut(employeeID string) (*models.Attendance, error)
	ListAttendance(employeeID, startDate, endDate string) ([]models.Attendance, error)

	// Leave
	ListLeaveTypes() ([]models.LeaveType, error)
	GetLeaveBalances(employeeID string, year int) ([]models.LeaveBalance, error)
	ListLeaveRequests(employeeID, status string) ([]models.LeaveRequest, error)
	GetLeaveRequestByID(id string) (*models.LeaveRequest, error)
	CreateLeaveRequest(req *models.LeaveRequest) error
	UpdateLeaveRequestStatus(requestID, status, approverID, reason string) (*models.LeaveRequest, error)

	// Payroll
	ListPayrollPeriods() ([]models.PayrollPeriod, error)
	CreatePayrollPeriod(period *models.PayrollPeriod) error
	ListPayslips(periodID, employeeID string) ([]models.Payslip, error)
	GeneratePayslipsForPeriod(periodID, processedBy string) error
	GetSalaryStructure(employeeID string) (*models.SalaryStructure, error)
	SaveSalaryStructure(struct_ *models.SalaryStructure) error

	// Recruitment (ATS)
	ListJobPostings() ([]models.JobPosting, error)
	CreateJobPosting(job *models.JobPosting) error
	ListApplicants(jobID, stage string) ([]models.Applicant, error)
	CreateApplicant(app *models.Applicant) error
	UpdateApplicantStage(applicantID, stage string) error

	// Performance (OKRs)
	ListPerformanceCycles() ([]models.PerformanceCycle, error)
	ListPerformanceGoals(employeeID, cycleID string) ([]models.PerformanceGoal, error)
	CreatePerformanceGoal(goal *models.PerformanceGoal) error
	UpdatePerformanceGoal(goal *models.PerformanceGoal) error

	// Expenses
	ListExpenses(employeeID, status string) ([]models.Expense, error)
	GetExpenseByID(id string) (*models.Expense, error)
	CreateExpense(exp *models.Expense) error
	UpdateExpenseStatus(expenseID, status, approverID, reason string) (*models.Expense, error)

	// Audit Logs
	LogAction(log *models.AuditLog) error
	ListAuditLogs(limit int) ([]models.AuditLog, error)

	// Analytics & Telemetry
	GetDashboardTelemetry() (*models.DashboardTelemetry, error)
}
