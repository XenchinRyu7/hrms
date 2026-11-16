package database

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/ethereal-hrms/backend/internal/models"
)

type MemoryStore struct {
	mu            sync.RWMutex
	departments   map[string]models.Department
	jobTitles     map[string]models.JobTitle
	employees     map[string]models.Employee
	attendance    map[string]models.Attendance // key: employeeID:YYYY-MM-DD
	leaveTypes    map[string]models.LeaveType
	leaveBalances map[string]models.LeaveBalance // key: empID:typeID:year
	leaveRequests map[string]models.LeaveRequest
	salaryStructs map[string]models.SalaryStructure // key: empID
	payrollPer    map[string]models.PayrollPeriod
	payslips      map[string]models.Payslip
	jobPostings   map[string]models.JobPosting
	applicants    map[string]models.Applicant
	perfCycles    map[string]models.PerformanceCycle
	perfGoals     map[string]models.PerformanceGoal
	expenses      map[string]models.Expense
	auditLogs     []models.AuditLog
}

func NewMemoryStore() *MemoryStore {
	s := &MemoryStore{
		departments:   make(map[string]models.Department),
		jobTitles:     make(map[string]models.JobTitle),
		employees:     make(map[string]models.Employee),
		attendance:    make(map[string]models.Attendance),
		leaveTypes:    make(map[string]models.LeaveType),
		leaveBalances: make(map[string]models.LeaveBalance),
		leaveRequests: make(map[string]models.LeaveRequest),
		salaryStructs: make(map[string]models.SalaryStructure),
		payrollPer:    make(map[string]models.PayrollPeriod),
		payslips:      make(map[string]models.Payslip),
		jobPostings:   make(map[string]models.JobPosting),
		applicants:    make(map[string]models.Applicant),
		perfCycles:    make(map[string]models.PerformanceCycle),
		perfGoals:     make(map[string]models.PerformanceGoal),
		expenses:      make(map[string]models.Expense),
		auditLogs:     make([]models.AuditLog, 0),
	}

	s.seedData()
	return s
}

func (s *MemoryStore) seedData() {
	// 1. Departments
	depts := []models.Department{
		{ID: "dept-1", Name: "Executive Management", Code: "EXEC", Description: "C-Suite leadership and corporate strategy", CreatedAt: time.Now()},
		{ID: "dept-2", Name: "Human Resources", Code: "HR", Description: "People operations, talent acquisition, and culture", CreatedAt: time.Now()},
		{ID: "dept-3", Name: "Software Engineering", Code: "ENG", Description: "Full-stack software engineering and AI systems", CreatedAt: time.Now()},
		{ID: "dept-4", Name: "Product & Design", Code: "PRD", Description: "Product management and UI/UX design systems", CreatedAt: time.Now()},
		{ID: "dept-5", Name: "Finance & Operations", Code: "FIN", Description: "Accounting, financial planning, and payroll", CreatedAt: time.Now()},
	}
	for _, d := range depts {
		s.departments[d.ID] = d
	}

	// 2. Job Titles
	jobs := []models.JobTitle{
		{ID: "title-1", Title: "Chief Executive Officer", Code: "EXEC-CEO", DepartmentID: "dept-1", Level: "executive", MinSalary: 40000000, MaxSalary: 70000000, CreatedAt: time.Now()},
		{ID: "title-2", Title: "Head of Human Resources", Code: "HR-HEAD", DepartmentID: "dept-2", Level: "lead", MinSalary: 20000000, MaxSalary: 35000000, CreatedAt: time.Now()},
		{ID: "title-3", Title: "Staff Software Engineer", Code: "ENG-STAFF", DepartmentID: "dept-3", Level: "lead", MinSalary: 22000000, MaxSalary: 38000000, CreatedAt: time.Now()},
		{ID: "title-4", Title: "Senior Fullstack Engineer", Code: "ENG-SR-FS", DepartmentID: "dept-3", Level: "senior", MinSalary: 16000000, MaxSalary: 28000000, CreatedAt: time.Now()},
		{ID: "title-5", Title: "Lead Product Designer", Code: "DES-LEAD", DepartmentID: "dept-4", Level: "lead", MinSalary: 18000000, MaxSalary: 30000000, CreatedAt: time.Now()},
	}
	for _, j := range jobs {
		s.jobTitles[j.ID] = j
	}

	// 3. Employees with hashed password: "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	passStr := string(hashedPassword)

	dept1, dept2, dept3, dept4 := "dept-1", "dept-2", "dept-3", "dept-4"
	title1, title2, title3, title4, title5 := "title-1", "title-2", "title-3", "title-4", "title-5"
	mgr3 := "emp-3"

	emps := []models.Employee{
		{
			ID: "emp-1", EmployeeCode: "EMP-001", Email: "admin@ethereal.hr", PasswordHash: passStr,
			FullName: "Alex Thorne", Role: models.RoleAdmin, DepartmentID: &dept1, DepartmentName: "Executive Management",
			JobTitleID: &title1, JobTitle: "Chief Executive Officer", Phone: "+62 811-2345-6789", Address: "SCBD Jakarta",
			HireDate: "2023-01-10", Status: "active", AvatarURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
			CreatedAt: time.Now(),
		},
		{
			ID: "emp-2", EmployeeCode: "EMP-002", Email: "hr@ethereal.hr", PasswordHash: passStr,
			FullName: "Elena Rostova", Role: models.RoleHRManager, DepartmentID: &dept2, DepartmentName: "Human Resources",
			JobTitleID: &title2, JobTitle: "Head of Human Resources", Phone: "+62 812-3456-7890", Address: "Kuningan Jakarta",
			HireDate: "2023-03-15", Status: "active", AvatarURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
			CreatedAt: time.Now(),
		},
		{
			ID: "emp-3", EmployeeCode: "EMP-003", Email: "devlead@ethereal.hr", PasswordHash: passStr,
			FullName: "Marcus Vance", Role: models.RoleManager, DepartmentID: &dept3, DepartmentName: "Software Engineering",
			JobTitleID: &title3, JobTitle: "Staff Software Engineer", Phone: "+62 813-4567-8901", Address: "BSD City Tangerang",
			HireDate: "2023-06-01", Status: "active", AvatarURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
			CreatedAt: time.Now(),
		},
		{
			ID: "emp-4", EmployeeCode: "EMP-004", Email: "employee@ethereal.hr", PasswordHash: passStr,
			FullName: "Sarah Jenkins", Role: models.RoleEmployee, DepartmentID: &dept3, DepartmentName: "Software Engineering",
			JobTitleID: &title4, JobTitle: "Senior Fullstack Engineer", ManagerID: &mgr3, ManagerName: "Marcus Vance",
			Phone: "+62 814-5678-9012", Address: "Kemang Jakarta", HireDate: "2024-01-15", Status: "active",
			AvatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
			CreatedAt: time.Now(),
		},
		{
			ID: "emp-5", EmployeeCode: "EMP-005", Email: "designer@ethereal.hr", PasswordHash: passStr,
			FullName: "Kenji Sato", Role: models.RoleEmployee, DepartmentID: &dept4, DepartmentName: "Product & Design",
			JobTitleID: &title5, JobTitle: "Lead Product Designer", ManagerID: &mgr3, ManagerName: "Marcus Vance",
			Phone: "+62 815-6789-0123", Address: "Menteng Jakarta", HireDate: "2024-02-01", Status: "active",
			AvatarURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
			CreatedAt: time.Now(),
		},
	}
	for _, e := range emps {
		s.employees[e.ID] = e
	}

	// 4. Leave Types
	ltypes := []models.LeaveType{
		{ID: "lt-1", Name: "Annual Paid Leave", Code: "ANNUAL", MaxDaysPerYear: 12, RequiresAttachment: false, IsPaid: true, CreatedAt: time.Now()},
		{ID: "lt-2", Name: "Sick Leave", Code: "SICK", MaxDaysPerYear: 14, RequiresAttachment: true, IsPaid: true, CreatedAt: time.Now()},
		{ID: "lt-3", Name: "Parental Leave", Code: "PARENTAL", MaxDaysPerYear: 90, RequiresAttachment: true, IsPaid: true, CreatedAt: time.Now()},
		{ID: "lt-4", Name: "Unpaid Leave", Code: "UNPAID", MaxDaysPerYear: 30, RequiresAttachment: false, IsPaid: false, CreatedAt: time.Now()},
	}
	for _, lt := range ltypes {
		s.leaveTypes[lt.ID] = lt
	}

	// 5. Leave Balances for 2026
	for _, e := range emps {
		for _, lt := range ltypes {
			key := fmt.Sprintf("%s:%s:2026", e.ID, lt.ID)
			s.leaveBalances[key] = models.LeaveBalance{
				ID:            "bal-" + key,
				EmployeeID:    e.ID,
				LeaveTypeID:   lt.ID,
				LeaveTypeName: lt.Name,
				Year:          2026,
				TotalDays:     lt.MaxDaysPerYear,
				UsedDays:      2,
				PendingDays:   1,
				RemainingDays: lt.MaxDaysPerYear - 3,
				CreatedAt:     time.Now(),
			}
		}
	}

	// 6. Leave Requests
	req1 := models.LeaveRequest{
		ID:             "lr-1",
		EmployeeID:     "emp-4",
		EmployeeName:   "Sarah Jenkins",
		DepartmentName: "Software Engineering",
		LeaveTypeID:    "lt-1",
		LeaveTypeName:  "Annual Paid Leave",
		StartDate:      "2026-11-20",
		EndDate:        "2026-11-21",
		TotalDays:      2,
		Reason:         "Attending family wedding ceremony",
		Status:         "pending",
		CreatedAt:      time.Now().Add(-24 * time.Hour),
	}
	s.leaveRequests[req1.ID] = req1

	// 7. Attendance for today
	today := time.Now().Format("2006-01-02")
	clockInTime := time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(), 8, 45, 0, 0, time.Local)
	s.attendance["emp-1:"+today] = models.Attendance{
		ID: "att-1", EmployeeID: "emp-1", EmployeeName: "Alex Thorne", Date: today,
		ClockIn: &clockInTime, TotalHours: 8.5, Status: "on_time", WorkLocation: "office", IPAddress: "127.0.0.1",
		CreatedAt: time.Now(),
	}
	s.attendance["emp-4:"+today] = models.Attendance{
		ID: "att-4", EmployeeID: "emp-4", EmployeeName: "Sarah Jenkins", Date: today,
		ClockIn: &clockInTime, TotalHours: 8.0, Status: "on_time", WorkLocation: "remote", IPAddress: "127.0.0.1",
		CreatedAt: time.Now(),
	}

	// 8. Salary Structures
	s.salaryStructs["emp-1"] = models.SalaryStructure{
		ID: "ss-1", EmployeeID: "emp-1", BasicSalary: 45000000, HousingAllowance: 5000000,
		TransportAllowance: 3000000, MealAllowance: 2000000, TaxRate: 15, InsuranceRate: 4,
		BankName: "BCA", BankAccountNumber: "8820192831", BankAccountHolder: "Alex Thorne", EffectiveDate: "2026-01-01",
	}
	s.salaryStructs["emp-4"] = models.SalaryStructure{
		ID: "ss-4", EmployeeID: "emp-4", BasicSalary: 18000000, HousingAllowance: 2000000,
		TransportAllowance: 1500000, MealAllowance: 1200000, TaxRate: 5, InsuranceRate: 4,
		BankName: "BNI", BankAccountNumber: "0928172635", BankAccountHolder: "Sarah Jenkins", EffectiveDate: "2026-01-01",
	}

	// 9. Payroll Period & Payslips
	payPeriod := models.PayrollPeriod{
		ID: "pp-1", Name: "October 2026 Cycle", StartDate: "2026-10-01", EndDate: "2026-10-31",
		PayDate: "2026-10-28", Status: "paid", TotalDisbursement: 65000000, CreatedAt: time.Now(),
	}
	s.payrollPer[payPeriod.ID] = payPeriod

	s.payslips["ps-1"] = models.Payslip{
		ID: "ps-1", PeriodID: "pp-1", PeriodName: "October 2026 Cycle", EmployeeID: "emp-4",
		EmployeeCode: "EMP-004", EmployeeName: "Sarah Jenkins", DepartmentName: "Software Engineering",
		JobTitle: "Senior Fullstack Engineer", BasicSalary: 18000000, TotalAllowances: 4700000, TotalDeductions: 1620000,
		NetSalary: 21080000, Status: "paid", CreatedAt: time.Now(),
	}

	// 10. Job Postings & Applicants
	job1 := models.JobPosting{
		ID: "jp-1", Title: "Senior AI / ML Platform Engineer", DepartmentID: "dept-3", DepartmentName: "Software Engineering",
		Location: "Hybrid (Jakarta)", EmploymentType: "Full-time", ExperienceLevel: "Senior",
		SalaryRange: "Rp 25.000.000 - Rp 40.000.000",
		Description: "Architecting autonomous agent workflows and telemetry pipelines.",
		Requirements: "5+ years with Go, Python, LLMs, and distributed systems.",
		Status: "published", ApplicantCount: 2, CreatedAt: time.Now(),
	}
	s.jobPostings[job1.ID] = job1

	app1 := models.Applicant{
		ID: "app-1", JobID: "jp-1", JobTitle: job1.Title, FullName: "Rian Pratama", Email: "rian.pratama@example.com",
		Phone: "+62 811-9988-7766", Stage: "interview", Rating: 5, Notes: "Stellar Go & distributed systems background.",
		CreatedAt: time.Now(),
	}
	app2 := models.Applicant{
		ID: "app-2", JobID: "jp-1", JobTitle: job1.Title, FullName: "Amira Zahra", Email: "amira.zahra@example.com",
		Phone: "+62 812-7766-5544", Stage: "screening", Rating: 4, Notes: "Solid machine learning and data pipelines.",
		CreatedAt: time.Now(),
	}
	s.applicants[app1.ID] = app1
	s.applicants[app2.ID] = app2

	// 11. Performance
	cycle := models.PerformanceCycle{
		ID: "pc-1", Title: "Q4 2026 Enterprise Growth", Quarter: "Q4", Year: 2026,
		StartDate: "2026-10-01", EndDate: "2026-12-31", Status: "active", CreatedAt: time.Now(),
	}
	s.perfCycles[cycle.ID] = cycle

	goal1 := models.PerformanceGoal{
		ID: "goal-1", CycleID: "pc-1", EmployeeID: "emp-4", EmployeeName: "Sarah Jenkins",
		Title: "Modernize Core Microservices to Go 1.25", Description: "Sub-15ms p99 latency target.",
		Category: "OKR", MetricType: "percentage", TargetValue: 100, CurrentValue: 85, Weight: 50,
		Status: "in_progress", Score: 4.5, CreatedAt: time.Now(),
	}
	s.perfGoals[goal1.ID] = goal1

	// 12. Expenses
	exp1 := models.Expense{
		ID: "exp-1", EmployeeID: "emp-4", EmployeeName: "Sarah Jenkins",
		Title: "Cloud Infrastructure Architecture Certification", Category: "Training", Amount: 3500000,
		ExpenseDate: "2026-11-10", Description: "AWS Solutions Architect Professional voucher", Status: "approved",
		CreatedAt: time.Now(),
	}
	s.expenses[exp1.ID] = exp1

	// 13. Audit logs
	s.auditLogs = append(s.auditLogs, models.AuditLog{
		ID: "al-1", UserID: "emp-1", UserName: "Alex Thorne", Action: "SYSTEM_INITIALIZED",
		Entity: "system", EntityID: "core", Details: map[string]interface{}{"status": "ready", "version": "2.0"},
		IPAddress: "127.0.0.1", CreatedAt: time.Now(),
	})
}

// ----------------- Auth & Employee -----------------

func (s *MemoryStore) GetEmployeeByEmail(email string) (*models.Employee, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, emp := range s.employees {
		if strings.EqualFold(emp.Email, email) {
			copy := emp
			return &copy, nil
		}
	}
	return nil, errors.New("employee not found")
}

func (s *MemoryStore) GetEmployeeByID(id string) (*models.Employee, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	emp, ok := s.employees[id]
	if !ok {
		return nil, errors.New("employee not found")
	}
	return &emp, nil
}

func (s *MemoryStore) ListEmployees(role, departmentID, search string) ([]models.Employee, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Employee
	for _, emp := range s.employees {
		if role != "" && emp.Role != role {
			continue
		}
		if departmentID != "" && (emp.DepartmentID == nil || *emp.DepartmentID != departmentID) {
			continue
		}
		if search != "" {
			sLower := strings.ToLower(search)
			if !strings.Contains(strings.ToLower(emp.FullName), sLower) &&
				!strings.Contains(strings.ToLower(emp.Email), sLower) &&
				!strings.Contains(strings.ToLower(emp.EmployeeCode), sLower) {
				continue
			}
		}
		result = append(result, emp)
	}
	return result, nil
}

func (s *MemoryStore) CreateEmployee(emp *models.Employee) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if emp.ID == "" {
		emp.ID = uuid.New().String()
	}
	if emp.EmployeeCode == "" {
		emp.EmployeeCode = fmt.Sprintf("EMP-%03d", len(s.employees)+1)
	}
	emp.CreatedAt = time.Now()
	emp.UpdatedAt = time.Now()

	s.employees[emp.ID] = *emp
	return nil
}

func (s *MemoryStore) UpdateEmployee(emp *models.Employee) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.employees[emp.ID]
	if !ok {
		return errors.New("employee not found")
	}
	if emp.PasswordHash == "" {
		emp.PasswordHash = existing.PasswordHash
	}
	emp.UpdatedAt = time.Now()
	s.employees[emp.ID] = *emp
	return nil
}

func (s *MemoryStore) DeleteEmployee(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.employees, id)
	return nil
}

// ----------------- Departments & Job Titles -----------------

func (s *MemoryStore) ListDepartments() ([]models.Department, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.Department
	for _, d := range s.departments {
		list = append(list, d)
	}
	return list, nil
}

func (s *MemoryStore) CreateDepartment(dept *models.Department) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if dept.ID == "" {
		dept.ID = uuid.New().String()
	}
	dept.CreatedAt = time.Now()
	dept.UpdatedAt = time.Now()
	s.departments[dept.ID] = *dept
	return nil
}

func (s *MemoryStore) ListJobTitles() ([]models.JobTitle, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.JobTitle
	for _, j := range s.jobTitles {
		list = append(list, j)
	}
	return list, nil
}

// ----------------- Attendance -----------------

func (s *MemoryStore) GetTodayAttendance(employeeID string) (*models.Attendance, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	today := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("%s:%s", employeeID, today)
	att, ok := s.attendance[key]
	if !ok {
		return nil, nil
	}
	return &att, nil
}

func (s *MemoryStore) ClockIn(employeeID, location, notes, ip string) (*models.Attendance, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	today := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("%s:%s", employeeID, today)
	if existing, ok := s.attendance[key]; ok && existing.ClockIn != nil {
		return &existing, errors.New("already clocked in today")
	}

	now := time.Now()
	status := "on_time"
	if now.Hour() > 9 || (now.Hour() == 9 && now.Minute() > 15) {
		status = "late"
	}
	if location == "" {
		location = "office"
	}

	empName := ""
	if emp, ok := s.employees[employeeID]; ok {
		empName = emp.FullName
	}

	att := models.Attendance{
		ID:           uuid.New().String(),
		EmployeeID:   employeeID,
		EmployeeName: empName,
		Date:         today,
		ClockIn:      &now,
		Status:       status,
		WorkLocation: location,
		IPAddress:    ip,
		Notes:        notes,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	s.attendance[key] = att
	return &att, nil
}

func (s *MemoryStore) ClockOut(employeeID string) (*models.Attendance, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	today := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("%s:%s", employeeID, today)
	att, ok := s.attendance[key]
	if !ok || att.ClockIn == nil {
		return nil, errors.New("cannot clock out without clocking in first")
	}

	now := time.Now()
	att.ClockOut = &now
	diff := now.Sub(*att.ClockIn).Hours()
	att.TotalHours = float64(int(diff*100)) / 100.0
	att.UpdatedAt = now

	s.attendance[key] = att
	return &att, nil
}

func (s *MemoryStore) ListAttendance(employeeID, startDate, endDate string) ([]models.Attendance, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.Attendance
	for _, att := range s.attendance {
		if employeeID != "" && att.EmployeeID != employeeID {
			continue
		}
		if startDate != "" && att.Date < startDate {
			continue
		}
		if endDate != "" && att.Date > endDate {
			continue
		}
		result = append(result, att)
	}
	return result, nil
}

// ----------------- Leave -----------------

func (s *MemoryStore) ListLeaveTypes() ([]models.LeaveType, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.LeaveType
	for _, lt := range s.leaveTypes {
		list = append(list, lt)
	}
	return list, nil
}

func (s *MemoryStore) GetLeaveBalances(employeeID string, year int) ([]models.LeaveBalance, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.LeaveBalance
	for _, b := range s.leaveBalances {
		if b.EmployeeID == employeeID && (year == 0 || b.Year == year) {
			result = append(result, b)
		}
	}
	return result, nil
}

func (s *MemoryStore) ListLeaveRequests(employeeID, status string) ([]models.LeaveRequest, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.LeaveRequest
	for _, req := range s.leaveRequests {
		if employeeID != "" && req.EmployeeID != employeeID {
			continue
		}
		if status != "" && req.Status != status {
			continue
		}
		result = append(result, req)
	}
	return result, nil
}

func (s *MemoryStore) CreateLeaveRequest(req *models.LeaveRequest) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if req.ID == "" {
		req.ID = uuid.New().String()
	}
	req.Status = "pending"
	req.CreatedAt = time.Now()

	if emp, ok := s.employees[req.EmployeeID]; ok {
		req.EmployeeName = emp.FullName
		if emp.DepartmentName != "" {
			req.DepartmentName = emp.DepartmentName
		}
	}
	if lt, ok := s.leaveTypes[req.LeaveTypeID]; ok {
		req.LeaveTypeName = lt.Name
	}

	s.leaveRequests[req.ID] = *req
	return nil
}

func (s *MemoryStore) UpdateLeaveRequestStatus(requestID, status, approverID, reason string) (*models.LeaveRequest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, ok := s.leaveRequests[requestID]
	if !ok {
		return nil, errors.New("leave request not found")
	}

	now := time.Now()
	req.Status = status
	req.ApproverID = &approverID
	req.ApprovedAt = &now
	req.RejectionReason = reason

	if approver, ok := s.employees[approverID]; ok {
		req.ApproverName = approver.FullName
	}

	// Update balance if approved
	if status == "approved" {
		balKey := fmt.Sprintf("%s:%s:2026", req.EmployeeID, req.LeaveTypeID)
		if bal, exists := s.leaveBalances[balKey]; exists {
			bal.UsedDays += req.TotalDays
			bal.RemainingDays -= req.TotalDays
			if bal.PendingDays >= req.TotalDays {
				bal.PendingDays -= req.TotalDays
			}
			s.leaveBalances[balKey] = bal
		}
	}

	s.leaveRequests[requestID] = req
	return &req, nil
}

// ----------------- Payroll -----------------

func (s *MemoryStore) ListPayrollPeriods() ([]models.PayrollPeriod, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.PayrollPeriod
	for _, p := range s.payrollPer {
		list = append(list, p)
	}
	return list, nil
}

func (s *MemoryStore) CreatePayrollPeriod(period *models.PayrollPeriod) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if period.ID == "" {
		period.ID = uuid.New().String()
	}
	period.CreatedAt = time.Now()
	s.payrollPer[period.ID] = *period
	return nil
}

func (s *MemoryStore) ListPayslips(periodID, employeeID string) ([]models.Payslip, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.Payslip
	for _, p := range s.payslips {
		if periodID != "" && p.PeriodID != periodID {
			continue
		}
		if employeeID != "" && p.EmployeeID != employeeID {
			continue
		}
		result = append(result, p)
	}
	return result, nil
}

func (s *MemoryStore) GeneratePayslipsForPeriod(periodID, processedBy string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	period, ok := s.payrollPer[periodID]
	if !ok {
		return errors.New("payroll period not found")
	}

	totalDisbursement := 0.0
	for _, emp := range s.employees {
		struct_, ok := s.salaryStructs[emp.ID]
		if !ok {
			// default fallback salary
			struct_ = models.SalaryStructure{
				BasicSalary: 15000000, HousingAllowance: 2000000, TransportAllowance: 1000000, MealAllowance: 1000000,
				TaxRate: 5, InsuranceRate: 4,
			}
		}

		totAllowances := struct_.HousingAllowance + struct_.TransportAllowance + struct_.MealAllowance
		taxAmt := struct_.BasicSalary * (struct_.TaxRate / 100.0)
		insAmt := struct_.BasicSalary * (struct_.InsuranceRate / 100.0)
		totDeductions := taxAmt + insAmt
		net := (struct_.BasicSalary + totAllowances) - totDeductions

		totalDisbursement += net

		ps := models.Payslip{
			ID:              uuid.New().String(),
			PeriodID:        periodID,
			PeriodName:      period.Name,
			EmployeeID:      emp.ID,
			EmployeeCode:    emp.EmployeeCode,
			EmployeeName:    emp.FullName,
			DepartmentName:  emp.DepartmentName,
			JobTitle:        emp.JobTitle,
			BasicSalary:     struct_.BasicSalary,
			TotalAllowances: totAllowances,
			TotalDeductions: totDeductions,
			NetSalary:       net,
			Breakdown: map[string]interface{}{
				"allowances": map[string]float64{
					"housing":   struct_.HousingAllowance,
					"transport": struct_.TransportAllowance,
					"meal":      struct_.MealAllowance,
				},
				"deductions": map[string]float64{
					"tax":       taxAmt,
					"insurance": insAmt,
				},
			},
			Status:    "issued",
			CreatedAt: time.Now(),
		}
		s.payslips[ps.ID] = ps
	}

	now := time.Now()
	period.Status = "processing"
	period.TotalDisbursement = totalDisbursement
	period.ProcessedBy = &processedBy
	period.ProcessedAt = &now
	s.payrollPer[periodID] = period

	return nil
}

func (s *MemoryStore) GetSalaryStructure(employeeID string) (*models.SalaryStructure, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	st, ok := s.salaryStructs[employeeID]
	if !ok {
		return nil, errors.New("salary structure not found")
	}
	return &st, nil
}

func (s *MemoryStore) SaveSalaryStructure(st *models.SalaryStructure) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if st.ID == "" {
		st.ID = uuid.New().String()
	}
	st.CreatedAt = time.Now()
	s.salaryStructs[st.EmployeeID] = *st
	return nil
}

// ----------------- Recruitment (ATS) -----------------

func (s *MemoryStore) ListJobPostings() ([]models.JobPosting, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.JobPosting
	for _, j := range s.jobPostings {
		// Calculate applicant count
		count := 0
		for _, a := range s.applicants {
			if a.JobID == j.ID {
				count++
			}
		}
		j.ApplicantCount = count
		list = append(list, j)
	}
	return list, nil
}

func (s *MemoryStore) CreateJobPosting(job *models.JobPosting) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if job.ID == "" {
		job.ID = uuid.New().String()
	}
	job.CreatedAt = time.Now()
	s.jobPostings[job.ID] = *job
	return nil
}

func (s *MemoryStore) ListApplicants(jobID, stage string) ([]models.Applicant, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.Applicant
	for _, a := range s.applicants {
		if jobID != "" && a.JobID != jobID {
			continue
		}
		if stage != "" && a.Stage != stage {
			continue
		}
		result = append(result, a)
	}
	return result, nil
}

func (s *MemoryStore) CreateApplicant(app *models.Applicant) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if app.ID == "" {
		app.ID = uuid.New().String()
	}
	app.CreatedAt = time.Now()
	app.UpdatedAt = time.Now()
	s.applicants[app.ID] = *app
	return nil
}

func (s *MemoryStore) UpdateApplicantStage(applicantID, stage string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	app, ok := s.applicants[applicantID]
	if !ok {
		return errors.New("applicant not found")
	}
	app.Stage = stage
	app.UpdatedAt = time.Now()
	s.applicants[applicantID] = app
	return nil
}

// ----------------- Performance (OKRs) -----------------

func (s *MemoryStore) ListPerformanceCycles() ([]models.PerformanceCycle, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var list []models.PerformanceCycle
	for _, c := range s.perfCycles {
		list = append(list, c)
	}
	return list, nil
}

func (s *MemoryStore) ListPerformanceGoals(employeeID, cycleID string) ([]models.PerformanceGoal, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.PerformanceGoal
	for _, g := range s.perfGoals {
		if employeeID != "" && g.EmployeeID != employeeID {
			continue
		}
		if cycleID != "" && g.CycleID != cycleID {
			continue
		}
		result = append(result, g)
	}
	return result, nil
}

func (s *MemoryStore) CreatePerformanceGoal(goal *models.PerformanceGoal) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if goal.ID == "" {
		goal.ID = uuid.New().String()
	}
	goal.CreatedAt = time.Now()
	s.perfGoals[goal.ID] = *goal
	return nil
}

func (s *MemoryStore) UpdatePerformanceGoal(goal *models.PerformanceGoal) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.perfGoals[goal.ID] = *goal
	return nil
}

// ----------------- Expenses -----------------

func (s *MemoryStore) ListExpenses(employeeID, status string) ([]models.Expense, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []models.Expense
	for _, e := range s.expenses {
		if employeeID != "" && e.EmployeeID != employeeID {
			continue
		}
		if status != "" && e.Status != status {
			continue
		}
		result = append(result, e)
	}
	return result, nil
}

func (s *MemoryStore) CreateExpense(exp *models.Expense) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if exp.ID == "" {
		exp.ID = uuid.New().String()
	}
	exp.Status = "pending"
	exp.CreatedAt = time.Now()
	if emp, ok := s.employees[exp.EmployeeID]; ok {
		exp.EmployeeName = emp.FullName
	}
	s.expenses[exp.ID] = *exp
	return nil
}

func (s *MemoryStore) UpdateExpenseStatus(expenseID, status, approverID, reason string) (*models.Expense, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	exp, ok := s.expenses[expenseID]
	if !ok {
		return nil, errors.New("expense not found")
	}
	now := time.Now()
	exp.Status = status
	exp.ApproverID = &approverID
	exp.ApprovedAt = &now
	exp.RejectionReason = reason
	if approver, ok := s.employees[approverID]; ok {
		exp.ApproverName = approver.FullName
	}
	s.expenses[expenseID] = exp
	return &exp, nil
}

// ----------------- Audit Logs -----------------

func (s *MemoryStore) LogAction(log *models.AuditLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if log.ID == "" {
		log.ID = uuid.New().String()
	}
	log.CreatedAt = time.Now()
	s.auditLogs = append([]models.AuditLog{*log}, s.auditLogs...)
	return nil
}

func (s *MemoryStore) ListAuditLogs(limit int) ([]models.AuditLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if limit <= 0 || limit > len(s.auditLogs) {
		limit = len(s.auditLogs)
	}
	return s.auditLogs[:limit], nil
}

// ----------------- Analytics & Telemetry -----------------

func (s *MemoryStore) GetDashboardTelemetry() (*models.DashboardTelemetry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	totEmp := len(s.employees)
	today := time.Now().Format("2006-01-02")

	activeToday := 0
	for _, att := range s.attendance {
		if att.Date == today && att.ClockIn != nil {
			activeToday++
		}
	}

	onLeaveToday := 0
	pendingApprovals := 0
	for _, req := range s.leaveRequests {
		if req.Status == "pending" {
			pendingApprovals++
		}
		if req.Status == "approved" && req.StartDate <= today && req.EndDate >= today {
			onLeaveToday++
		}
	}
	for _, exp := range s.expenses {
		if exp.Status == "pending" {
			pendingApprovals++
		}
	}

	// Department headcount
	deptCounts := make(map[string]int)
	for _, emp := range s.employees {
		deptName := "General"
		if emp.DepartmentName != "" {
			deptName = emp.DepartmentName
		}
		deptCounts[deptName]++
	}

	var deptStats []models.DepartmentHeadcount
	for name, count := range deptCounts {
		pct := 0.0
		if totEmp > 0 {
			pct = float64(count) / float64(totEmp) * 100
		}
		deptStats = append(deptStats, models.DepartmentHeadcount{
			Department: name,
			Count:      count,
			Percentage: float64(int(pct*10)) / 10.0,
		})
	}

	// Attendance weekly trend
	trend := []models.DailyAttendanceStat{
		{Label: "Mon", Present: 4, Late: 1, Absent: 0},
		{Label: "Tue", Present: 5, Late: 0, Absent: 0},
		{Label: "Wed", Present: 4, Late: 0, Absent: 1},
		{Label: "Thu", Present: 5, Late: 0, Absent: 0},
		{Label: "Fri", Present: activeToday, Late: 1, Absent: 0},
	}

	// Payroll trend
	payTrend := []models.MonthlyPayrollStat{
		{Month: "Jul", Disbursement: 62000000},
		{Month: "Aug", Disbursement: 64500000},
		{Month: "Sep", Disbursement: 64500000},
		{Month: "Oct", Disbursement: 65000000},
	}

	audits := s.auditLogs
	if len(audits) > 10 {
		audits = audits[:10]
	}

	return &models.DashboardTelemetry{
		TotalEmployees:   totEmp,
		ActiveToday:      activeToday,
		OnLeaveToday:     onLeaveToday,
		OpenJobs:         len(s.jobPostings),
		MonthlyPayroll:   65000000,
		PendingApprovals: pendingApprovals,
		AttendanceRate:   94.5,
		TurnoverRate:     1.8,
		DepartmentStats:  deptStats,
		AttendanceTrend:  trend,
		PayrollTrend:     payTrend,
		RecentAuditLogs:  audits,
	}, nil
}
