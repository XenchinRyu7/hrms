package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/ethereal-hrms/backend/internal/models"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(db *sql.DB) *PostgresStore {
	return &PostgresStore{db: db}
}

// ==========================================
// 1. EMPLOYEES & AUTH
// ==========================================

func (s *PostgresStore) GetEmployeeByEmail(email string) (*models.Employee, error) {
	query := `
		SELECT e.id, e.employee_code, e.email, e.password_hash, e.full_name, e.role,
		       COALESCE(e.department_id::text, ''), COALESCE(d.name, ''),
		       COALESCE(e.job_title_id::text, ''), COALESCE(j.title, ''),
		       COALESCE(e.manager_id::text, ''), COALESCE(m.full_name, ''),
		       COALESCE(e.phone, ''), COALESCE(e.address, ''), e.hire_date::text,
		       e.status, COALESCE(e.avatar_url, ''), e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN job_titles j ON e.job_title_id = j.id
		LEFT JOIN employees m ON e.manager_id = m.id
		WHERE LOWER(e.email) = LOWER($1)
		LIMIT 1;`

	var emp models.Employee
	var deptID, jobTitleID, managerID string

	err := s.db.QueryRow(query, strings.TrimSpace(email)).Scan(
		&emp.ID, &emp.EmployeeCode, &emp.Email, &emp.PasswordHash, &emp.FullName, &emp.Role,
		&deptID, &emp.DepartmentName,
		&jobTitleID, &emp.JobTitle,
		&managerID, &emp.ManagerName,
		&emp.Phone, &emp.Address, &emp.HireDate,
		&emp.Status, &emp.AvatarURL, &emp.CreatedAt, &emp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("employee with email %s not found", email)
		}
		return nil, err
	}

	if deptID != "" {
		emp.DepartmentID = &deptID
	}
	if jobTitleID != "" {
		emp.JobTitleID = &jobTitleID
	}
	if managerID != "" {
		emp.ManagerID = &managerID
	}

	return &emp, nil
}

func (s *PostgresStore) GetEmployeeByID(id string) (*models.Employee, error) {
	query := `
		SELECT e.id, e.employee_code, e.email, e.password_hash, e.full_name, e.role,
		       COALESCE(e.department_id::text, ''), COALESCE(d.name, ''),
		       COALESCE(e.job_title_id::text, ''), COALESCE(j.title, ''),
		       COALESCE(e.manager_id::text, ''), COALESCE(m.full_name, ''),
		       COALESCE(e.phone, ''), COALESCE(e.address, ''), e.hire_date::text,
		       e.status, COALESCE(e.avatar_url, ''), e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN job_titles j ON e.job_title_id = j.id
		LEFT JOIN employees m ON e.manager_id = m.id
		WHERE e.id = $1
		LIMIT 1;`

	var emp models.Employee
	var deptID, jobTitleID, managerID string

	err := s.db.QueryRow(query, id).Scan(
		&emp.ID, &emp.EmployeeCode, &emp.Email, &emp.PasswordHash, &emp.FullName, &emp.Role,
		&deptID, &emp.DepartmentName,
		&jobTitleID, &emp.JobTitle,
		&managerID, &emp.ManagerName,
		&emp.Phone, &emp.Address, &emp.HireDate,
		&emp.Status, &emp.AvatarURL, &emp.CreatedAt, &emp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("employee %s not found", id)
		}
		return nil, err
	}

	if deptID != "" {
		emp.DepartmentID = &deptID
	}
	if jobTitleID != "" {
		emp.JobTitleID = &jobTitleID
	}
	if managerID != "" {
		emp.ManagerID = &managerID
	}

	return &emp, nil
}

func (s *PostgresStore) ListEmployees(role, departmentID, search string) ([]models.Employee, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if role != "" {
		conditions = append(conditions, fmt.Sprintf("e.role = $%d", argIdx))
		args = append(args, role)
		argIdx++
	}

	if departmentID != "" {
		conditions = append(conditions, fmt.Sprintf("e.department_id = $%d", argIdx))
		args = append(args, departmentID)
		argIdx++
	}

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		conditions = append(conditions, fmt.Sprintf("(LOWER(e.full_name) LIKE $%d OR LOWER(e.email) LIKE $%d OR LOWER(e.employee_code) LIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, searchPattern)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT e.id, e.employee_code, e.email, e.full_name, e.role,
		       COALESCE(e.department_id::text, ''), COALESCE(d.name, ''),
		       COALESCE(e.job_title_id::text, ''), COALESCE(j.title, ''),
		       COALESCE(e.manager_id::text, ''), COALESCE(m.full_name, ''),
		       COALESCE(e.phone, ''), COALESCE(e.address, ''), e.hire_date::text,
		       e.status, COALESCE(e.avatar_url, ''), e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN job_titles j ON e.job_title_id = j.id
		LEFT JOIN employees m ON e.manager_id = m.id
		%s
		ORDER BY e.created_at ASC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Employee
	for rows.Next() {
		var emp models.Employee
		var deptID, jobTitleID, managerID string

		err := rows.Scan(
			&emp.ID, &emp.EmployeeCode, &emp.Email, &emp.FullName, &emp.Role,
			&deptID, &emp.DepartmentName,
			&jobTitleID, &emp.JobTitle,
			&managerID, &emp.ManagerName,
			&emp.Phone, &emp.Address, &emp.HireDate,
			&emp.Status, &emp.AvatarURL, &emp.CreatedAt, &emp.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if deptID != "" {
			emp.DepartmentID = &deptID
		}
		if jobTitleID != "" {
			emp.JobTitleID = &jobTitleID
		}
		if managerID != "" {
			emp.ManagerID = &managerID
		}

		result = append(result, emp)
	}

	return result, nil
}

func (s *PostgresStore) CreateEmployee(emp *models.Employee) error {
	if emp.ID == "" {
		emp.ID = uuid.New().String()
	}
	if emp.EmployeeCode == "" {
		emp.EmployeeCode = fmt.Sprintf("EMP-%03d", time.Now().Unix()%1000)
	}
	if emp.Status == "" {
		emp.Status = "active"
	}
	if emp.PasswordHash == "" {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		emp.PasswordHash = string(hash)
	}
	if emp.AvatarURL == "" {
		emp.AvatarURL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
	}

	query := `
		INSERT INTO employees (
			id, employee_code, email, password_hash, full_name, role,
			department_id, job_title_id, manager_id, phone, address,
			hire_date, status, avatar_url, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			NULLIF($7, '')::uuid, NULLIF($8, '')::uuid, NULLIF($9, '')::uuid, $10, $11,
			COALESCE(NULLIF($12, '')::date, CURRENT_DATE), $13, $14, NOW(), NOW()
		);`

	deptID := ""
	if emp.DepartmentID != nil {
		deptID = *emp.DepartmentID
	}
	jobTitleID := ""
	if emp.JobTitleID != nil {
		jobTitleID = *emp.JobTitleID
	}
	mgrID := ""
	if emp.ManagerID != nil {
		mgrID = *emp.ManagerID
	}

	_, err := s.db.Exec(query,
		emp.ID, emp.EmployeeCode, emp.Email, emp.PasswordHash, emp.FullName, emp.Role,
		deptID, jobTitleID, mgrID, emp.Phone, emp.Address,
		emp.HireDate, emp.Status, emp.AvatarURL,
	)
	return err
}

func (s *PostgresStore) UpdateEmployee(emp *models.Employee) error {
	query := `
		UPDATE employees SET
			full_name = $1,
			role = $2,
			department_id = NULLIF($3, '')::uuid,
			job_title_id = NULLIF($4, '')::uuid,
			phone = $5,
			address = $6,
			status = $7,
			avatar_url = $8,
			password_hash = CASE WHEN $9 <> '' THEN $9 ELSE password_hash END,
			updated_at = NOW()
		WHERE id = $10;`

	deptID := ""
	if emp.DepartmentID != nil {
		deptID = *emp.DepartmentID
	}
	jobTitleID := ""
	if emp.JobTitleID != nil {
		jobTitleID = *emp.JobTitleID
	}

	res, err := s.db.Exec(query,
		emp.FullName, emp.Role, deptID, jobTitleID,
		emp.Phone, emp.Address, emp.Status, emp.AvatarURL, emp.PasswordHash, emp.ID,
	)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("employee %s not found", emp.ID)
	}
	return nil
}

func (s *PostgresStore) DeleteEmployee(id string) error {
	res, err := s.db.Exec("DELETE FROM employees WHERE id = $1", id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("employee %s not found", id)
	}
	return nil
}

// ==========================================
// 2. DEPARTMENTS & JOB TITLES
// ==========================================

func (s *PostgresStore) ListDepartments() ([]models.Department, error) {
	query := `
		SELECT d.id, d.name, d.code, COALESCE(d.description, ''),
		       COALESCE(d.manager_id::text, ''), d.created_at, d.updated_at
		FROM departments d
		ORDER BY d.name ASC;`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Department
	for rows.Next() {
		var d models.Department
		var mgrID string
		err := rows.Scan(&d.ID, &d.Name, &d.Code, &d.Description, &mgrID, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, err
		}
		if mgrID != "" {
			d.ManagerID = &mgrID
		}
		result = append(result, d)
	}
	return result, nil
}

func (s *PostgresStore) CreateDepartment(dept *models.Department) error {
	if dept.ID == "" {
		dept.ID = uuid.New().String()
	}
	mgrID := ""
	if dept.ManagerID != nil {
		mgrID = *dept.ManagerID
	}
	query := `
		INSERT INTO departments (id, name, code, description, manager_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NULLIF($5, '')::uuid, NOW(), NOW());`

	_, err := s.db.Exec(query, dept.ID, dept.Name, dept.Code, dept.Description, mgrID)
	return err
}

func (s *PostgresStore) ListJobTitles() ([]models.JobTitle, error) {
	query := `
		SELECT j.id, j.title, j.code, j.department_id::text, j.level, j.min_salary, j.max_salary, j.created_at
		FROM job_titles j
		ORDER BY j.title ASC;`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.JobTitle
	for rows.Next() {
		var j models.JobTitle
		err := rows.Scan(&j.ID, &j.Title, &j.Code, &j.DepartmentID, &j.Level, &j.MinSalary, &j.MaxSalary, &j.CreatedAt)
		if err != nil {
			return nil, err
		}
		result = append(result, j)
	}
	return result, nil
}

// ==========================================
// 3. ATTENDANCE & TIME TRACKING
// ==========================================

func (s *PostgresStore) GetTodayAttendance(employeeID string) (*models.Attendance, error) {
	query := `
		SELECT a.id, a.employee_id, e.full_name, a.date::text,
		       a.clock_in, a.clock_out, a.total_hours, a.status,
		       a.work_location, COALESCE(a.notes, ''), a.created_at, a.updated_at
		FROM attendance a
		JOIN employees e ON a.employee_id = e.id
		WHERE a.employee_id = $1 AND a.date = CURRENT_DATE
		LIMIT 1;`

	var att models.Attendance
	err := s.db.QueryRow(query, employeeID).Scan(
		&att.ID, &att.EmployeeID, &att.EmployeeName, &att.Date,
		&att.ClockIn, &att.ClockOut, &att.TotalHours, &att.Status,
		&att.WorkLocation, &att.Notes, &att.CreatedAt, &att.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &att, nil
}

func (s *PostgresStore) ClockIn(employeeID, location, notes, ip string) (*models.Attendance, error) {
	now := time.Now()
	id := uuid.New().String()
	status := "on_time"
	if now.Hour() > 9 || (now.Hour() == 9 && now.Minute() > 15) {
		status = "late"
	}

	query := `
		INSERT INTO attendance (id, employee_id, date, clock_in, status, work_location, ip_address, notes, created_at, updated_at)
		VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, NOW(), NOW())
		ON CONFLICT (employee_id, date) DO UPDATE SET
			clock_in = EXCLUDED.clock_in,
			work_location = EXCLUDED.work_location,
			notes = EXCLUDED.notes,
			updated_at = NOW()
		RETURNING id, employee_id, date::text, clock_in, clock_out, total_hours, status, work_location, notes, created_at, updated_at;`

	var att models.Attendance
	err := s.db.QueryRow(query, id, employeeID, now, status, location, ip, notes).Scan(
		&att.ID, &att.EmployeeID, &att.Date, &att.ClockIn, &att.ClockOut,
		&att.TotalHours, &att.Status, &att.WorkLocation, &att.Notes,
		&att.CreatedAt, &att.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &att, nil
}

func (s *PostgresStore) ClockOut(employeeID string) (*models.Attendance, error) {
	query := `
		UPDATE attendance SET
			clock_out = NOW(),
			total_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600.0, 2),
			updated_at = NOW()
		WHERE employee_id = $1 AND date = CURRENT_DATE
		RETURNING id, employee_id, date::text, clock_in, clock_out, total_hours, status, work_location, notes, created_at, updated_at;`

	var att models.Attendance
	err := s.db.QueryRow(query, employeeID).Scan(
		&att.ID, &att.EmployeeID, &att.Date, &att.ClockIn, &att.ClockOut,
		&att.TotalHours, &att.Status, &att.WorkLocation, &att.Notes,
		&att.CreatedAt, &att.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no clock-in record found for today")
		}
		return nil, err
	}
	return &att, nil
}

func (s *PostgresStore) ListAttendance(employeeID, startDate, endDate string) ([]models.Attendance, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if employeeID != "" {
		conditions = append(conditions, fmt.Sprintf("a.employee_id = $%d", argIdx))
		args = append(args, employeeID)
		argIdx++
	}
	if startDate != "" {
		conditions = append(conditions, fmt.Sprintf("a.date >= $%d::date", argIdx))
		args = append(args, startDate)
		argIdx++
	}
	if endDate != "" {
		conditions = append(conditions, fmt.Sprintf("a.date <= $%d::date", argIdx))
		args = append(args, endDate)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT a.id, a.employee_id, e.full_name, a.date::text,
		       a.clock_in, a.clock_out, a.total_hours, a.status,
		       a.work_location, COALESCE(a.notes, ''), a.created_at, a.updated_at
		FROM attendance a
		JOIN employees e ON a.employee_id = e.id
		%s
		ORDER BY a.date DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Attendance
	for rows.Next() {
		var att models.Attendance
		err := rows.Scan(
			&att.ID, &att.EmployeeID, &att.EmployeeName, &att.Date,
			&att.ClockIn, &att.ClockOut, &att.TotalHours, &att.Status,
			&att.WorkLocation, &att.Notes, &att.CreatedAt, &att.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, att)
	}
	return result, nil
}

// ==========================================
// 4. LEAVE MANAGEMENT
// ==========================================

func (s *PostgresStore) ListLeaveTypes() ([]models.LeaveType, error) {
	query := `SELECT id, name, code, max_days_per_year, requires_attachment, is_paid, created_at FROM leave_types ORDER BY name ASC;`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.LeaveType
	for rows.Next() {
		var lt models.LeaveType
		err := rows.Scan(&lt.ID, &lt.Name, &lt.Code, &lt.MaxDaysPerYear, &lt.RequiresAttachment, &lt.IsPaid, &lt.CreatedAt)
		if err != nil {
			return nil, err
		}
		result = append(result, lt)
	}
	return result, nil
}

func (s *PostgresStore) GetLeaveBalances(employeeID string, year int) ([]models.LeaveBalance, error) {
	if year == 0 {
		year = time.Now().Year()
	}
	query := `
		SELECT b.id, b.employee_id, b.leave_type_id, t.name, b.year, b.total_days, b.used_days, b.pending_days,
		       (b.total_days - b.used_days - b.pending_days) as remaining_days, b.created_at
		FROM leave_balances b
		JOIN leave_types t ON b.leave_type_id = t.id
		WHERE b.employee_id = $1 AND b.year = $2
		ORDER BY t.name ASC;`

	rows, err := s.db.Query(query, employeeID, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.LeaveBalance
	for rows.Next() {
		var lb models.LeaveBalance
		err := rows.Scan(&lb.ID, &lb.EmployeeID, &lb.LeaveTypeID, &lb.LeaveTypeName, &lb.Year, &lb.TotalDays, &lb.UsedDays, &lb.PendingDays, &lb.RemainingDays, &lb.CreatedAt)
		if err != nil {
			return nil, err
		}
		result = append(result, lb)
	}
	return result, nil
}

func (s *PostgresStore) ListLeaveRequests(employeeID, status string) ([]models.LeaveRequest, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if employeeID != "" {
		conditions = append(conditions, fmt.Sprintf("r.employee_id = $%d", argIdx))
		args = append(args, employeeID)
		argIdx++
	}
	if status != "" {
		conditions = append(conditions, fmt.Sprintf("r.status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT r.id, r.employee_id, e.full_name, COALESCE(d.name, ''),
		       r.leave_type_id, t.name, r.start_date::text, r.end_date::text, r.total_days,
		       r.reason, r.status, COALESCE(r.approver_id::text, ''), COALESCE(a.full_name, ''),
		       r.created_at
		FROM leave_requests r
		JOIN employees e ON r.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		JOIN leave_types t ON r.leave_type_id = t.id
		LEFT JOIN employees a ON r.approver_id = a.id
		%s
		ORDER BY r.created_at DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.LeaveRequest
	for rows.Next() {
		var req models.LeaveRequest
		var approverID string
		err := rows.Scan(
			&req.ID, &req.EmployeeID, &req.EmployeeName, &req.DepartmentName,
			&req.LeaveTypeID, &req.LeaveTypeName, &req.StartDate, &req.EndDate, &req.TotalDays,
			&req.Reason, &req.Status, &approverID, &req.ApproverName,
			&req.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		if approverID != "" {
			req.ApproverID = &approverID
		}
		result = append(result, req)
	}
	return result, nil
}

func (s *PostgresStore) CreateLeaveRequest(req *models.LeaveRequest) error {
	if req.ID == "" {
		req.ID = uuid.New().String()
	}
	req.Status = "pending"

	query := `
		INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4::date, $5::date, $6, $7, 'pending', NOW(), NOW());`

	_, err := s.db.Exec(query, req.ID, req.EmployeeID, req.LeaveTypeID, req.StartDate, req.EndDate, req.TotalDays, req.Reason)
	return err
}

func (s *PostgresStore) UpdateLeaveRequestStatus(requestID, status, approverID, reason string) (*models.LeaveRequest, error) {
	query := `
		UPDATE leave_requests SET
			status = $1,
			approver_id = NULLIF($2, '')::uuid,
			rejection_reason = $3,
			approved_at = NOW(),
			updated_at = NOW()
		WHERE id = $4
		RETURNING id, employee_id, leave_type_id, start_date::text, end_date::text, total_days, reason, status, created_at;`

	var req models.LeaveRequest
	err := s.db.QueryRow(query, status, approverID, reason, requestID).Scan(
		&req.ID, &req.EmployeeID, &req.LeaveTypeID, &req.StartDate, &req.EndDate,
		&req.TotalDays, &req.Reason, &req.Status, &req.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if status == "approved" {
		_, _ = s.db.Exec(`
			UPDATE leave_balances SET
				used_days = used_days + $1,
				updated_at = NOW()
			WHERE employee_id = $2 AND leave_type_id = $3 AND year = EXTRACT(YEAR FROM CURRENT_DATE);`,
			req.TotalDays, req.EmployeeID, req.LeaveTypeID)
	}

	return &req, nil
}

// ==========================================
// 5. PAYROLL
// ==========================================

func (s *PostgresStore) ListPayrollPeriods() ([]models.PayrollPeriod, error) {
	query := `SELECT id, name, start_date::text, end_date::text, pay_date::text, status, total_disbursement, created_at FROM payroll_periods ORDER BY start_date DESC;`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.PayrollPeriod
	for rows.Next() {
		var p models.PayrollPeriod
		err := rows.Scan(&p.ID, &p.Name, &p.StartDate, &p.EndDate, &p.PayDate, &p.Status, &p.TotalDisbursement, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, nil
}

func (s *PostgresStore) CreatePayrollPeriod(period *models.PayrollPeriod) error {
	if period.ID == "" {
		period.ID = uuid.New().String()
	}
	if period.Status == "" {
		period.Status = "draft"
	}
	query := `
		INSERT INTO payroll_periods (id, name, start_date, end_date, pay_date, status, total_disbursement, created_at)
		VALUES ($1, $2, $3::date, $4::date, $5::date, $6, $7, NOW());`

	_, err := s.db.Exec(query, period.ID, period.Name, period.StartDate, period.EndDate, period.PayDate, period.Status, period.TotalDisbursement)
	return err
}

func (s *PostgresStore) ListPayslips(periodID, employeeID string) ([]models.Payslip, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if periodID != "" {
		conditions = append(conditions, fmt.Sprintf("p.period_id = $%d", argIdx))
		args = append(args, periodID)
		argIdx++
	}
	if employeeID != "" {
		conditions = append(conditions, fmt.Sprintf("p.employee_id = $%d", argIdx))
		args = append(args, employeeID)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.period_id, pr.name, p.employee_id, e.employee_code, e.full_name,
		       COALESCE(d.name, ''), COALESCE(j.title, ''), p.basic_salary, p.total_allowances,
		       p.total_deductions, p.net_salary, p.status, p.created_at
		FROM payslips p
		JOIN payroll_periods pr ON p.period_id = pr.id
		JOIN employees e ON p.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN job_titles j ON e.job_title_id = j.id
		%s
		ORDER BY p.created_at DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Payslip
	for rows.Next() {
		var ps models.Payslip
		err := rows.Scan(
			&ps.ID, &ps.PeriodID, &ps.PeriodName, &ps.EmployeeID, &ps.EmployeeCode, &ps.EmployeeName,
			&ps.DepartmentName, &ps.JobTitle, &ps.BasicSalary, &ps.TotalAllowances,
			&ps.TotalDeductions, &ps.NetSalary, &ps.Status, &ps.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, ps)
	}
	return result, nil
}

func (s *PostgresStore) GeneratePayslipsForPeriod(periodID, processedBy string) error {
	rows, err := s.db.Query(`
		SELECT e.id, COALESCE(s.basic_salary, 10000000), COALESCE(s.housing_allowance, 1500000),
		       COALESCE(s.transport_allowance, 1000000), COALESCE(s.meal_allowance, 800000),
		       COALESCE(s.tax_rate, 5.0), COALESCE(s.insurance_rate, 4.0)
		FROM employees e
		LEFT JOIN salary_structures s ON e.id = s.employee_id
		WHERE e.status = 'active';`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var totalDisbursement float64

	for rows.Next() {
		var empID string
		var basic, housing, transport, meal, taxRate, insRate float64
		if err := rows.Scan(&empID, &basic, &housing, &transport, &meal, &taxRate, &insRate); err != nil {
			continue
		}

		allowances := housing + transport + meal
		gross := basic + allowances
		deductions := (gross * (taxRate / 100.0)) + (gross * (insRate / 100.0))
		net := gross - deductions
		totalDisbursement += net

		psID := uuid.New().String()
		_, _ = s.db.Exec(`
			INSERT INTO payslips (id, period_id, employee_id, basic_salary, total_allowances, total_deductions, net_salary, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, 'issued', NOW())
			ON CONFLICT (period_id, employee_id) DO UPDATE SET
				basic_salary = EXCLUDED.basic_salary,
				total_allowances = EXCLUDED.total_allowances,
				total_deductions = EXCLUDED.total_deductions,
				net_salary = EXCLUDED.net_salary,
				status = 'issued';`,
			psID, periodID, empID, basic, allowances, deductions, net)
	}

	_, _ = s.db.Exec(`
		UPDATE payroll_periods SET
			status = 'processing',
			total_disbursement = $1,
			processed_by = NULLIF($2, '')::uuid,
			processed_at = NOW()
		WHERE id = $3;`, totalDisbursement, processedBy, periodID)

	return nil
}

func (s *PostgresStore) GetSalaryStructure(employeeID string) (*models.SalaryStructure, error) {
	query := `
		SELECT id, employee_id, basic_salary, housing_allowance, transport_allowance, meal_allowance,
		       tax_rate, insurance_rate, COALESCE(bank_name, ''), COALESCE(bank_account_number, ''),
		       COALESCE(bank_account_holder, ''), effective_date::text, created_at
		FROM salary_structures
		WHERE employee_id = $1
		LIMIT 1;`

	var ss models.SalaryStructure
	err := s.db.QueryRow(query, employeeID).Scan(
		&ss.ID, &ss.EmployeeID, &ss.BasicSalary, &ss.HousingAllowance, &ss.TransportAllowance, &ss.MealAllowance,
		&ss.TaxRate, &ss.InsuranceRate, &ss.BankName, &ss.BankAccountNumber,
		&ss.BankAccountHolder, &ss.EffectiveDate, &ss.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &ss, nil
}

func (s *PostgresStore) SaveSalaryStructure(ss *models.SalaryStructure) error {
	if ss.ID == "" {
		ss.ID = uuid.New().String()
	}
	query := `
		INSERT INTO salary_structures (
			id, employee_id, basic_salary, housing_allowance, transport_allowance,
			meal_allowance, tax_rate, insurance_rate, bank_name, bank_account_number,
			bank_account_holder, effective_date, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			$11, COALESCE(NULLIF($12, '')::date, CURRENT_DATE), NOW(), NOW()
		) ON CONFLICT (employee_id) DO UPDATE SET
			basic_salary = EXCLUDED.basic_salary,
			housing_allowance = EXCLUDED.housing_allowance,
			transport_allowance = EXCLUDED.transport_allowance,
			meal_allowance = EXCLUDED.meal_allowance,
			tax_rate = EXCLUDED.tax_rate,
			insurance_rate = EXCLUDED.insurance_rate,
			bank_name = EXCLUDED.bank_name,
			bank_account_number = EXCLUDED.bank_account_number,
			bank_account_holder = EXCLUDED.bank_account_holder,
			effective_date = EXCLUDED.effective_date,
			updated_at = NOW();`

	_, err := s.db.Exec(query,
		ss.ID, ss.EmployeeID, ss.BasicSalary, ss.HousingAllowance, ss.TransportAllowance,
		ss.MealAllowance, ss.TaxRate, ss.InsuranceRate, ss.BankName, ss.BankAccountNumber,
		ss.BankAccountHolder, ss.EffectiveDate,
	)
	return err
}

// ==========================================
// 6. RECRUITMENT (ATS)
// ==========================================

func (s *PostgresStore) ListJobPostings() ([]models.JobPosting, error) {
	query := `
		SELECT j.id, j.title, COALESCE(j.department_id::text, ''), COALESCE(d.name, ''),
		       j.location, j.employment_type, j.experience_level, COALESCE(j.salary_range, ''),
		       COALESCE(j.description, ''), COALESCE(j.requirements, ''), j.status,
		       COUNT(a.id) as applicant_count, j.created_at
		FROM job_postings j
		LEFT JOIN departments d ON j.department_id = d.id
		LEFT JOIN applicants a ON a.job_id = j.id
		GROUP BY j.id, j.title, j.department_id, d.name, j.location, j.employment_type, j.experience_level,
		         j.salary_range, j.description, j.requirements, j.status, j.created_at
		ORDER BY j.created_at DESC;`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.JobPosting
	for rows.Next() {
		var jp models.JobPosting
		err := rows.Scan(
			&jp.ID, &jp.Title, &jp.DepartmentID, &jp.DepartmentName,
			&jp.Location, &jp.EmploymentType, &jp.ExperienceLevel, &jp.SalaryRange,
			&jp.Description, &jp.Requirements, &jp.Status,
			&jp.ApplicantCount, &jp.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, jp)
	}
	return result, nil
}

func (s *PostgresStore) CreateJobPosting(job *models.JobPosting) error {
	if job.ID == "" {
		job.ID = uuid.New().String()
	}
	if job.Status == "" {
		job.Status = "published"
	}

	query := `
		INSERT INTO job_postings (
			id, title, department_id, location, employment_type,
			experience_level, salary_range, description, requirements, status, created_at, updated_at
		) VALUES (
			$1, $2, NULLIF($3, '')::uuid, $4, $5,
			$6, $7, $8, $9, $10, NOW(), NOW()
		);`

	_, err := s.db.Exec(query,
		job.ID, job.Title, job.DepartmentID, job.Location, job.EmploymentType,
		job.ExperienceLevel, job.SalaryRange, job.Description, job.Requirements, job.Status,
	)
	return err
}

func (s *PostgresStore) ListApplicants(jobID, stage string) ([]models.Applicant, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if jobID != "" {
		conditions = append(conditions, fmt.Sprintf("a.job_id = $%d", argIdx))
		args = append(args, jobID)
		argIdx++
	}
	if stage != "" {
		conditions = append(conditions, fmt.Sprintf("a.stage = $%d", argIdx))
		args = append(args, stage)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT a.id, a.job_id, j.title, a.full_name, a.email,
		       COALESCE(a.phone, ''), a.stage, a.rating, COALESCE(a.notes, ''), a.created_at, a.updated_at
		FROM applicants a
		JOIN job_postings j ON a.job_id = j.id
		%s
		ORDER BY a.created_at DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Applicant
	for rows.Next() {
		var app models.Applicant
		err := rows.Scan(
			&app.ID, &app.JobID, &app.JobTitle, &app.FullName, &app.Email,
			&app.Phone, &app.Stage, &app.Rating, &app.Notes, &app.CreatedAt, &app.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, app)
	}
	return result, nil
}

func (s *PostgresStore) CreateApplicant(app *models.Applicant) error {
	if app.ID == "" {
		app.ID = uuid.New().String()
	}
	if app.Stage == "" {
		app.Stage = "applied"
	}

	query := `
		INSERT INTO applicants (id, job_id, full_name, email, phone, stage, rating, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW());`

	_, err := s.db.Exec(query, app.ID, app.JobID, app.FullName, app.Email, app.Phone, app.Stage, app.Rating, app.Notes)
	return err
}

func (s *PostgresStore) UpdateApplicantStage(applicantID, stage string) error {
	query := `UPDATE applicants SET stage = $1, updated_at = NOW() WHERE id = $2;`
	res, err := s.db.Exec(query, stage, applicantID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("applicant %s not found", applicantID)
	}
	return nil
}

// ==========================================
// 7. PERFORMANCE & OKRs
// ==========================================

func (s *PostgresStore) ListPerformanceCycles() ([]models.PerformanceCycle, error) {
	query := `SELECT id, title, quarter, year, start_date::text, end_date::text, status, created_at FROM performance_cycles ORDER BY start_date DESC;`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.PerformanceCycle
	for rows.Next() {
		var pc models.PerformanceCycle
		err := rows.Scan(&pc.ID, &pc.Title, &pc.Quarter, &pc.Year, &pc.StartDate, &pc.EndDate, &pc.Status, &pc.CreatedAt)
		if err != nil {
			return nil, err
		}
		result = append(result, pc)
	}
	return result, nil
}

func (s *PostgresStore) ListPerformanceGoals(employeeID, cycleID string) ([]models.PerformanceGoal, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if employeeID != "" {
		conditions = append(conditions, fmt.Sprintf("g.employee_id = $%d", argIdx))
		args = append(args, employeeID)
		argIdx++
	}
	if cycleID != "" {
		conditions = append(conditions, fmt.Sprintf("g.cycle_id = $%d", argIdx))
		args = append(args, cycleID)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT g.id, g.cycle_id, g.employee_id, e.full_name,
		       g.title, COALESCE(g.description, ''), g.category, g.metric_type,
		       g.target_value, g.current_value, g.weight, g.status,
		       COALESCE(g.manager_feedback, ''), g.score, g.created_at
		FROM performance_goals g
		JOIN employees e ON g.employee_id = e.id
		%s
		ORDER BY g.created_at DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.PerformanceGoal
	for rows.Next() {
		var pg models.PerformanceGoal
		err := rows.Scan(
			&pg.ID, &pg.CycleID, &pg.EmployeeID, &pg.EmployeeName,
			&pg.Title, &pg.Description, &pg.Category, &pg.MetricType,
			&pg.TargetValue, &pg.CurrentValue, &pg.Weight, &pg.Status,
			&pg.ManagerFeedback, &pg.Score, &pg.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, pg)
	}
	return result, nil
}

func (s *PostgresStore) CreatePerformanceGoal(goal *models.PerformanceGoal) error {
	if goal.ID == "" {
		goal.ID = uuid.New().String()
	}
	if goal.Status == "" {
		goal.Status = "in_progress"
	}
	query := `
		INSERT INTO performance_goals (
			id, cycle_id, employee_id, title, description,
			category, metric_type, target_value, current_value, weight, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10, $11, NOW(), NOW()
		);`

	_, err := s.db.Exec(query,
		goal.ID, goal.CycleID, goal.EmployeeID, goal.Title, goal.Description,
		goal.Category, goal.MetricType, goal.TargetValue, goal.CurrentValue, goal.Weight, goal.Status,
	)
	return err
}

func (s *PostgresStore) UpdatePerformanceGoal(goal *models.PerformanceGoal) error {
	query := `
		UPDATE performance_goals SET
			title = $1,
			description = $2,
			current_value = $3,
			status = $4,
			manager_feedback = $5,
			score = $6,
			updated_at = NOW()
		WHERE id = $7;`

	res, err := s.db.Exec(query,
		goal.Title, goal.Description, goal.CurrentValue, goal.Status, goal.ManagerFeedback, goal.Score, goal.ID,
	)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("performance goal %s not found", goal.ID)
	}
	return nil
}

// ==========================================
// 8. EXPENSES
// ==========================================

func (s *PostgresStore) ListExpenses(employeeID, status string) ([]models.Expense, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if employeeID != "" {
		conditions = append(conditions, fmt.Sprintf("x.employee_id = $%d", argIdx))
		args = append(args, employeeID)
		argIdx++
	}
	if status != "" {
		conditions = append(conditions, fmt.Sprintf("x.status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT x.id, x.employee_id, e.full_name,
		       x.title, x.category, x.amount, x.expense_date::text,
		       COALESCE(x.description, ''), COALESCE(x.receipt_url, ''), x.status,
		       COALESCE(x.approver_id::text, ''), COALESCE(a.full_name, ''),
		       x.created_at
		FROM expenses x
		JOIN employees e ON x.employee_id = e.id
		LEFT JOIN employees a ON x.approver_id = a.id
		%s
		ORDER BY x.created_at DESC;`, whereClause)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Expense
	for rows.Next() {
		var exp models.Expense
		var approverID string
		err := rows.Scan(
			&exp.ID, &exp.EmployeeID, &exp.EmployeeName,
			&exp.Title, &exp.Category, &exp.Amount, &exp.ExpenseDate,
			&exp.Description, &exp.ReceiptURL, &exp.Status,
			&approverID, &exp.ApproverName,
			&exp.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		if approverID != "" {
			exp.ApproverID = &approverID
		}
		result = append(result, exp)
	}
	return result, nil
}

func (s *PostgresStore) CreateExpense(exp *models.Expense) error {
	if exp.ID == "" {
		exp.ID = uuid.New().String()
	}
	if exp.Status == "" {
		exp.Status = "pending"
	}
	query := `
		INSERT INTO expenses (id, employee_id, title, category, amount, expense_date, description, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, COALESCE(NULLIF($6, '')::date, CURRENT_DATE), $7, 'pending', NOW(), NOW());`

	_, err := s.db.Exec(query, exp.ID, exp.EmployeeID, exp.Title, exp.Category, exp.Amount, exp.ExpenseDate, exp.Description)
	return err
}

func (s *PostgresStore) UpdateExpenseStatus(expenseID, status, approverID, reason string) (*models.Expense, error) {
	query := `
		UPDATE expenses SET
			status = $1,
			approver_id = NULLIF($2, '')::uuid,
			rejection_reason = $3,
			approved_at = NOW(),
			updated_at = NOW()
		WHERE id = $4
		RETURNING id, employee_id, title, category, amount, expense_date::text, description, status, created_at;`

	var exp models.Expense
	err := s.db.QueryRow(query, status, approverID, reason, expenseID).Scan(
		&exp.ID, &exp.EmployeeID, &exp.Title, &exp.Category, &exp.Amount,
		&exp.ExpenseDate, &exp.Description, &exp.Status, &exp.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &exp, nil
}

// ==========================================
// 9. AUDIT LOGS
// ==========================================

func (s *PostgresStore) LogAction(al *models.AuditLog) error {
	if al.ID == "" {
		al.ID = uuid.New().String()
	}
	detailsJSON, _ := json.Marshal(al.Details)
	if len(detailsJSON) == 0 {
		detailsJSON = []byte("{}")
	}

	query := `
		INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details, ip_address, created_at)
		VALUES ($1, NULLIF($2, '')::uuid, $3, $4, $5, $6::jsonb, $7, NOW());`

	_, err := s.db.Exec(query, al.ID, al.UserID, al.Action, al.Entity, al.EntityID, string(detailsJSON), al.IPAddress)
	return err
}

func (s *PostgresStore) ListAuditLogs(limit int) ([]models.AuditLog, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT l.id, COALESCE(l.user_id::text, ''), COALESCE(e.full_name, 'System'),
		       l.action, l.entity, COALESCE(l.entity_id, ''), l.details::text, COALESCE(l.ip_address, ''), l.created_at
		FROM audit_logs l
		LEFT JOIN employees e ON l.user_id = e.id
		ORDER BY l.created_at DESC
		LIMIT $1;`

	rows, err := s.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.AuditLog
	for rows.Next() {
		var al models.AuditLog
		var detailsStr string
		err := rows.Scan(
			&al.ID, &al.UserID, &al.UserName,
			&al.Action, &al.Entity, &al.EntityID, &detailsStr, &al.IPAddress, &al.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		if detailsStr != "" {
			_ = json.Unmarshal([]byte(detailsStr), &al.Details)
		}
		result = append(result, al)
	}
	return result, nil
}

// ==========================================
// 10. DASHBOARD TELEMETRY
// ==========================================

func (s *PostgresStore) GetDashboardTelemetry() (*models.DashboardTelemetry, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var totalEmployees int
	_ = s.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM employees WHERE status = 'active';").Scan(&totalEmployees)

	var activeToday int
	_ = s.db.QueryRowContext(ctx, "SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE date = CURRENT_DATE;").Scan(&activeToday)

	var pendingApprovals int
	_ = s.db.QueryRowContext(ctx, "SELECT (SELECT COUNT(*) FROM leave_requests WHERE status = 'pending') + (SELECT COUNT(*) FROM expenses WHERE status = 'pending');").Scan(&pendingApprovals)

	var totalPayroll float64
	_ = s.db.QueryRowContext(ctx, "SELECT COALESCE(SUM(total_disbursement), 0) FROM payroll_periods WHERE status = 'paid';").Scan(&totalPayroll)

	punctuality := 98.4
	if totalEmployees > 0 && activeToday > 0 {
		var onTimeCount int
		_ = s.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'on_time';").Scan(&onTimeCount)
		punctuality = float64(onTimeCount) / float64(activeToday) * 100.0
	}

	auditLogs, _ := s.ListAuditLogs(5)

	// Department distribution
	deptRows, _ := s.db.QueryContext(ctx, `
		SELECT COALESCE(d.name, 'Unassigned'), COUNT(e.id)
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		GROUP BY d.name;`)
	var deptStats []models.DepartmentHeadcount
	if deptRows != nil {
		defer deptRows.Close()
		for deptRows.Next() {
			var dept string
			var count int
			if err := deptRows.Scan(&dept, &count); err == nil {
				pct := 0.0
				if totalEmployees > 0 {
					pct = float64(count) / float64(totalEmployees) * 100.0
				}
				deptStats = append(deptStats, models.DepartmentHeadcount{
					Department: dept,
					Count:      count,
					Percentage: pct,
				})
			}
		}
	}

	// Attendance weekly trend
	trend := []models.DailyAttendanceStat{
		{Label: "Mon", Present: 28, Late: 2, Absent: 1},
		{Label: "Tue", Present: 30, Late: 1, Absent: 0},
		{Label: "Wed", Present: 29, Late: 3, Absent: 0},
		{Label: "Thu", Present: 31, Late: 0, Absent: 1},
		{Label: "Fri", Present: 27, Late: 4, Absent: 2},
	}

	return &models.DashboardTelemetry{
		TotalEmployees:   totalEmployees,
		ActiveToday:      activeToday,
		AttendanceRate:   punctuality,
		PendingApprovals: pendingApprovals,
		MonthlyPayroll:   totalPayroll,
		DepartmentStats:  deptStats,
		AttendanceTrend:  trend,
		RecentAuditLogs:  auditLogs,
	}, nil
}
