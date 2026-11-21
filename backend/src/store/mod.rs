pub mod memory;

use crate::models::*;
use async_trait::async_trait;

#[async_trait]
pub trait Store: Send + Sync {
    // Auth & Employees
    async fn get_employee_by_email(&self, email: &str) -> Option<Employee>;
    async fn get_employee_by_id(&self, id: &str) -> Option<Employee>;
    async fn list_employees(&self, role: Option<&str>, department_id: Option<&str>, search: Option<&str>) -> Vec<Employee>;
    async fn create_employee(&self, emp: Employee) -> Result<Employee, String>;
    async fn update_employee(&self, id: &str, emp: Employee) -> Result<Employee, String>;
    async fn delete_employee(&self, id: &str) -> Result<(), String>;

    // Departments & Job Titles
    async fn list_departments(&self) -> Vec<Department>;
    async fn list_job_titles(&self) -> Vec<JobTitle>;

    // Attendance
    async fn get_today_attendance(&self, employee_id: &str) -> Option<Attendance>;
    async fn clock_in(&self, employee_id: &str, location: Option<&str>, notes: Option<&str>, ip: Option<&str>) -> Result<Attendance, String>;
    async fn clock_out(&self, employee_id: &str) -> Result<Attendance, String>;
    async fn list_attendance(&self, employee_id: Option<&str>, start_date: Option<&str>, end_date: Option<&str>) -> Vec<Attendance>;

    // Leave
    async fn list_leave_types(&self) -> Vec<LeaveType>;
    async fn get_leave_balances(&self, employee_id: &str, year: i32) -> Vec<LeaveBalance>;
    async fn list_leave_requests(&self, employee_id: Option<&str>, status: Option<&str>) -> Vec<LeaveRequest>;
    async fn get_leave_request_by_id(&self, id: &str) -> Option<LeaveRequest>;
    async fn create_leave_request(&self, req: LeaveRequest) -> Result<LeaveRequest, String>;
    async fn update_leave_request_status(&self, id: &str, status: &str, approver_id: &str, reason: Option<&str>) -> Result<LeaveRequest, String>;

    // Payroll
    async fn list_payroll_periods(&self) -> Vec<PayrollPeriod>;
    async fn create_payroll_period(&self, period: PayrollPeriod) -> Result<PayrollPeriod, String>;
    async fn list_payslips(&self, period_id: Option<&str>, employee_id: Option<&str>) -> Vec<Payslip>;
    async fn generate_payslips_for_period(&self, period_id: &str, processed_by: &str) -> Result<(), String>;
    async fn get_salary_structure(&self, employee_id: &str) -> Option<SalaryStructure>;
    async fn save_salary_structure(&self, st: SalaryStructure) -> Result<SalaryStructure, String>;

    // Expenses
    async fn list_expenses(&self, employee_id: Option<&str>, status: Option<&str>) -> Vec<Expense>;
    async fn get_expense_by_id(&self, id: &str) -> Option<Expense>;
    async fn create_expense(&self, exp: Expense) -> Result<Expense, String>;
    async fn update_expense_status(&self, id: &str, status: &str, approver_id: &str, reason: Option<&str>) -> Result<Expense, String>;

    // Recruitment
    async fn list_jobs(&self) -> Vec<JobPosting>;
    async fn create_job(&self, job: JobPosting) -> Result<JobPosting, String>;
    async fn list_applicants(&self, job_id: Option<&str>, stage: Option<&str>) -> Vec<Applicant>;
    async fn create_applicant(&self, app: Applicant) -> Result<Applicant, String>;
    async fn update_applicant_stage(&self, id: &str, stage: &str) -> Result<Applicant, String>;

    // Performance
    async fn list_cycles(&self) -> Vec<PerformanceCycle>;
    async fn list_goals(&self, employee_id: Option<&str>, cycle_id: Option<&str>) -> Vec<PerformanceGoal>;
    async fn create_goal(&self, goal: PerformanceGoal) -> Result<PerformanceGoal, String>;
    async fn update_goal(&self, id: &str, goal: PerformanceGoal) -> Result<PerformanceGoal, String>;

    // Audit Logs
    async fn log_action(&self, log: AuditLog);
    async fn list_audit_logs(&self, limit: usize) -> Vec<AuditLog>;

    // Dashboard Telemetry
    async fn get_dashboard_telemetry(&self) -> DashboardTelemetry;
}
