package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Roles
const (
	RoleAdmin     = "admin"
	RoleHRManager = "hr_manager"
	RoleManager   = "manager"
	RoleEmployee  = "employee"
)

type JWTClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	DeptID   string `json:"department_id"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string    `json:"token"`
	User      *Employee `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

type UpdateProfileRequest struct {
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	AvatarURL string `json:"avatar_url"`
}

type Department struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	ManagerID   *string   `json:"manager_id,omitempty"`
	ParentID    *string   `json:"parent_id,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type JobTitle struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Code         string    `json:"code"`
	DepartmentID string    `json:"department_id"`
	Level        string    `json:"level"`
	MinSalary    float64   `json:"min_salary"`
	MaxSalary    float64   `json:"max_salary"`
	CreatedAt    time.Time `json:"created_at"`
}

type Employee struct {
	ID               string                 `json:"id"`
	EmployeeCode     string                 `json:"employee_code"`
	Email            string                 `json:"email"`
	Password         string                 `json:"password,omitempty"`
	PasswordHash     string                 `json:"-"`
	FullName         string                 `json:"full_name"`
	Role             string                 `json:"role"`
	DepartmentID     *string                `json:"department_id,omitempty"`
	DepartmentName   string                 `json:"department_name,omitempty"`
	JobTitleID       *string                `json:"job_title_id,omitempty"`
	JobTitle         string                 `json:"job_title,omitempty"`
	ManagerID        *string                `json:"manager_id,omitempty"`
	ManagerName      string                 `json:"manager_name,omitempty"`
	Phone            string                 `json:"phone"`
	Address          string                 `json:"address"`
	HireDate         string                 `json:"hire_date"`
	Status           string                 `json:"status"` // active, probation, on_leave, terminated
	AvatarURL        string                 `json:"avatar_url"`
	EmergencyContact map[string]interface{} `json:"emergency_contact,omitempty"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
}

type Attendance struct {
	ID           string     `json:"id"`
	EmployeeID   string     `json:"employee_id"`
	EmployeeName string     `json:"employee_name,omitempty"`
	Date         string     `json:"date"`
	ClockIn      *time.Time `json:"clock_in,omitempty"`
	ClockOut     *time.Time `json:"clock_out,omitempty"`
	TotalHours   float64    `json:"total_hours"`
	Status       string     `json:"status"`        // on_time, late, early_leave, absent
	WorkLocation string     `json:"work_location"` // office, remote, field
	IPAddress    string     `json:"ip_address,omitempty"`
	Notes        string     `json:"notes,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type ClockInRequest struct {
	WorkLocation string `json:"work_location"` // office, remote, field
	Notes        string `json:"notes"`
}

type LeaveType struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	Code               string    `json:"code"`
	MaxDaysPerYear     int       `json:"max_days_per_year"`
	RequiresAttachment bool      `json:"requires_attachment"`
	IsPaid             bool      `json:"is_paid"`
	CreatedAt          time.Time `json:"created_at"`
}

type LeaveBalance struct {
	ID            string    `json:"id"`
	EmployeeID    string    `json:"employee_id"`
	LeaveTypeID   string    `json:"leave_type_id"`
	LeaveTypeName string    `json:"leave_type_name,omitempty"`
	Year          int       `json:"year"`
	TotalDays     int       `json:"total_days"`
	UsedDays      int       `json:"used_days"`
	PendingDays   int       `json:"pending_days"`
	RemainingDays int       `json:"remaining_days"`
	CreatedAt     time.Time `json:"created_at"`
}

type LeaveRequest struct {
	ID              string     `json:"id"`
	EmployeeID      string     `json:"employee_id"`
	EmployeeName    string     `json:"employee_name,omitempty"`
	DepartmentName  string     `json:"department_name,omitempty"`
	LeaveTypeID     string     `json:"leave_type_id"`
	LeaveTypeName   string     `json:"leave_type_name,omitempty"`
	StartDate       string     `json:"start_date"`
	EndDate         string     `json:"end_date"`
	TotalDays       int        `json:"total_days"`
	Reason          string     `json:"reason"`
	AttachmentURL   string     `json:"attachment_url,omitempty"`
	Status          string     `json:"status"` // pending, approved, rejected, cancelled
	ApproverID      *string    `json:"approver_id,omitempty"`
	ApproverName    string     `json:"approver_name,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	RejectionReason string     `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type CreateLeaveRequest struct {
	LeaveTypeID string `json:"leave_type_id" binding:"required"`
	StartDate   string `json:"start_date" binding:"required"`
	EndDate     string `json:"end_date" binding:"required"`
	TotalDays   int    `json:"total_days" binding:"required"`
	Reason      string `json:"reason" binding:"required"`
}

type SalaryStructure struct {
	ID                 string    `json:"id"`
	EmployeeID         string    `json:"employee_id"`
	BasicSalary        float64   `json:"basic_salary"`
	HousingAllowance   float64   `json:"housing_allowance"`
	TransportAllowance float64   `json:"transport_allowance"`
	MealAllowance      float64   `json:"meal_allowance"`
	TaxRate            float64   `json:"tax_rate"`
	InsuranceRate      float64   `json:"insurance_rate"`
	BankName           string    `json:"bank_name"`
	BankAccountNumber  string    `json:"bank_account_number"`
	BankAccountHolder  string    `json:"bank_account_holder"`
	EffectiveDate      string    `json:"effective_date"`
	CreatedAt          time.Time `json:"created_at"`
}

type PayrollPeriod struct {
	ID                string     `json:"id"`
	Name              string     `json:"name"`
	StartDate         string     `json:"start_date"`
	EndDate           string     `json:"end_date"`
	PayDate           string     `json:"pay_date"`
	Status            string     `json:"status"` // draft, processing, approved, paid
	TotalDisbursement float64    `json:"total_disbursement"`
	ProcessedBy       *string    `json:"processed_by,omitempty"`
	ProcessedAt       *time.Time `json:"processed_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}

type Payslip struct {
	ID              string                 `json:"id"`
	PeriodID        string                 `json:"period_id"`
	PeriodName      string                 `json:"period_name,omitempty"`
	EmployeeID      string                 `json:"employee_id"`
	EmployeeCode    string                 `json:"employee_code,omitempty"`
	EmployeeName    string                 `json:"employee_name,omitempty"`
	DepartmentName  string                 `json:"department_name,omitempty"`
	JobTitle        string                 `json:"job_title,omitempty"`
	BasicSalary     float64                `json:"basic_salary"`
	TotalAllowances float64                `json:"total_allowances"`
	TotalDeductions float64                `json:"total_deductions"`
	NetSalary       float64                `json:"net_salary"`
	Breakdown       map[string]interface{} `json:"breakdown"`
	Status          string                 `json:"status"` // draft, issued, paid
	PaidAt          *time.Time             `json:"paid_at,omitempty"`
	CreatedAt       time.Time              `json:"created_at"`
}

type JobPosting struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	DepartmentID    string    `json:"department_id"`
	DepartmentName  string    `json:"department_name,omitempty"`
	Location        string    `json:"location"`
	EmploymentType  string    `json:"employment_type"`
	ExperienceLevel string    `json:"experience_level"`
	SalaryRange     string    `json:"salary_range"`
	Description     string    `json:"description"`
	Requirements    string    `json:"requirements"`
	Status          string    `json:"status"` // draft, published, closed
	ApplicantCount  int       `json:"applicant_count"`
	CreatedAt       time.Time `json:"created_at"`
}

type Applicant struct {
	ID           string    `json:"id"`
	JobID        string    `json:"job_id"`
	JobTitle     string    `json:"job_title,omitempty"`
	FullName     string    `json:"full_name"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	ResumeURL    string    `json:"resume_url"`
	PortfolioURL string    `json:"portfolio_url"`
	Stage        string    `json:"stage"` // applied, screening, interview, offer, hired, rejected
	Rating       int       `json:"rating"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type PerformanceCycle struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Quarter   string    `json:"quarter"`
	Year      int       `json:"year"`
	StartDate string    `json:"start_date"`
	EndDate   string    `json:"end_date"`
	Status    string    `json:"status"` // upcoming, active, evaluation, closed
	CreatedAt time.Time `json:"created_at"`
}

type PerformanceGoal struct {
	ID              string    `json:"id"`
	CycleID         string    `json:"cycle_id"`
	EmployeeID      string    `json:"employee_id"`
	EmployeeName    string    `json:"employee_name,omitempty"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Category        string    `json:"category"`
	MetricType      string    `json:"metric_type"`
	TargetValue     float64   `json:"target_value"`
	CurrentValue    float64   `json:"current_value"`
	Weight          int       `json:"weight"`
	Status          string    `json:"status"`
	ManagerFeedback string    `json:"manager_feedback,omitempty"`
	Score           float64   `json:"score"`
	CreatedAt       time.Time `json:"created_at"`
}

type Expense struct {
	ID              string     `json:"id"`
	EmployeeID      string     `json:"employee_id"`
	EmployeeName    string     `json:"employee_name,omitempty"`
	Title           string     `json:"title"`
	Category        string     `json:"category"`
	Amount          float64    `json:"amount"`
	ExpenseDate     string     `json:"expense_date"`
	Description     string     `json:"description"`
	ReceiptURL      string     `json:"receipt_url,omitempty"`
	Status          string     `json:"status"` // pending, approved, rejected, reimbursed
	ApproverID      *string    `json:"approver_id,omitempty"`
	ApproverName    string     `json:"approver_name,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	RejectionReason string     `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type AuditLog struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	UserName  string                 `json:"user_name,omitempty"`
	Action    string                 `json:"action"`
	Entity    string                 `json:"entity"`
	EntityID  string                 `json:"entity_id"`
	Details   map[string]interface{} `json:"details"`
	IPAddress string                 `json:"ip_address"`
	CreatedAt time.Time              `json:"created_at"`
}

type DashboardTelemetry struct {
	TotalEmployees   int                   `json:"total_employees"`
	ActiveToday      int                   `json:"active_today"`
	OnLeaveToday     int                   `json:"on_leave_today"`
	OpenJobs         int                   `json:"open_jobs"`
	MonthlyPayroll   float64               `json:"monthly_payroll"`
	PendingApprovals int                   `json:"pending_approvals"`
	AttendanceRate   float64               `json:"attendance_rate"`
	TurnoverRate     float64               `json:"turnover_rate"`
	DepartmentStats  []DepartmentHeadcount `json:"department_stats"`
	AttendanceTrend  []DailyAttendanceStat `json:"attendance_trend"`
	PayrollTrend     []MonthlyPayrollStat  `json:"payroll_trend"`
	RecentAuditLogs  []AuditLog            `json:"recent_audit_logs"`
}

type DepartmentHeadcount struct {
	Department string  `json:"department"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

type DailyAttendanceStat struct {
	Label   string `json:"label"`
	Present int    `json:"present"`
	Late    int    `json:"late"`
	Absent  int    `json:"absent"`
}

type MonthlyPayrollStat struct {
	Month        string  `json:"month"`
	Disbursement float64 `json:"disbursement"`
}
