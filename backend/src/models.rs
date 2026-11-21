#![allow(dead_code)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

pub const ROLE_ADMIN: &str = "admin";
pub const ROLE_HR_MANAGER: &str = "hr_manager";
pub const ROLE_MANAGER: &str = "manager";
pub const ROLE_EMPLOYEE: &str = "employee";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn ok_msg(data: T, msg: impl Into<String>) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: Some(msg.into()),
        }
    }
}

impl ApiResponse<()> {
    pub fn err(msg: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(msg.into()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub full_name: String,
    pub role: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub employee_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub job_title_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub job_title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hire_date: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Employee {
    pub id: String,
    pub employee_code: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub full_name: String,
    pub role: String,
    pub department_id: Option<String>,
    pub department_name: Option<String>,
    pub job_title_id: Option<String>,
    pub job_title: Option<String>,
    pub manager_id: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub hire_date: String,
    pub status: String,
    pub avatar_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Employee {
    pub fn to_user(&self) -> User {
        User {
            id: self.id.clone(),
            email: self.email.clone(),
            full_name: self.full_name.clone(),
            role: self.role.clone(),
            employee_code: Some(self.employee_code.clone()),
            department_id: self.department_id.clone(),
            department_name: self.department_name.clone(),
            job_title_id: self.job_title_id.clone(),
            job_title: self.job_title.clone(),
            phone: self.phone.clone(),
            address: self.address.clone(),
            hire_date: Some(self.hire_date.clone()),
            avatar_url: self.avatar_url.clone(),
            status: Some(self.status.clone()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Department {
    pub id: String,
    pub name: String,
    pub code: String,
    pub description: Option<String>,
    pub manager_id: Option<String>,
    pub manager_name: Option<String>,
    pub employee_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JobTitle {
    pub id: String,
    pub title: String,
    pub code: String,
    pub department_id: Option<String>,
    pub level: String,
    pub min_salary: f64,
    pub max_salary: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Attendance {
    pub id: String,
    pub employee_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub employee_name: Option<String>,
    pub date: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub clock_in: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub clock_out: Option<DateTime<Utc>>,
    pub total_hours: f64,
    pub break_hours: f64,
    pub work_hours: f64,
    pub overtime_hours: f64,
    pub overtime_pay: f64,
    pub status: String,
    pub work_location: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ip_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ClockInRequest {
    pub work_location: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeaveType {
    pub id: String,
    pub name: String,
    pub code: String,
    pub max_days_per_year: i32,
    pub requires_attachment: bool,
    pub is_paid: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeaveBalance {
    pub id: String,
    pub employee_id: String,
    pub leave_type_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub leave_type_name: Option<String>,
    pub year: i32,
    pub total_days: i32,
    pub used_days: i32,
    pub pending_days: i32,
    pub remaining_days: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeaveRequest {
    pub id: String,
    pub employee_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub employee_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub department_name: Option<String>,
    pub leave_type_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub leave_type_name: Option<String>,
    pub start_date: String,
    pub end_date: String,
    pub total_days: i32,
    pub reason: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attachment_url: Option<String>,
    pub status: String,
    pub approver_id: Option<String>,
    pub approver_name: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
    pub rejection_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveRequestInput {
    pub leave_type_id: String,
    pub start_date: String,
    pub end_date: String,
    pub total_days: i32,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveStatusInput {
    pub status: String,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SalaryStructure {
    pub id: String,
    pub employee_id: String,
    pub basic_salary: f64,
    pub housing_allowance: f64,
    pub transport_allowance: f64,
    pub meal_allowance: f64,
    pub tax_rate: f64,
    pub insurance_rate: f64,
    pub bank_name: Option<String>,
    pub bank_account_number: Option<String>,
    pub bank_account_holder: Option<String>,
    pub effective_date: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PayrollPeriod {
    pub id: String,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub pay_date: String,
    pub status: String,
    pub total_disbursement: f64,
    pub processed_by: Option<String>,
    pub processed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Payslip {
    pub id: String,
    pub period_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub period_name: Option<String>,
    pub employee_id: String,
    pub employee_code: String,
    pub employee_name: String,
    pub department_name: String,
    pub job_title: String,
    pub basic_salary: f64,
    pub total_allowances: f64,
    pub total_deductions: f64,
    pub net_salary: f64,
    pub breakdown: serde_json::Value,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JobPosting {
    pub id: String,
    pub title: String,
    pub department_id: Option<String>,
    pub department_name: Option<String>,
    pub location: String,
    pub employment_type: String,
    pub experience_level: String,
    pub salary_range: String,
    pub description: String,
    pub requirements: String,
    pub status: String,
    pub applicants_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Applicant {
    pub id: String,
    pub job_posting_id: String,
    pub job_title: Option<String>,
    pub full_name: String,
    pub email: String,
    pub phone: String,
    pub resume_url: Option<String>,
    pub stage: String,
    pub rating: i32,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStageInput {
    pub stage: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PerformanceCycle {
    pub id: String,
    pub name: String,
    pub year: i32,
    pub quarter: i32,
    pub start_date: String,
    pub end_date: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PerformanceGoal {
    pub id: String,
    pub employee_id: String,
    pub cycle_id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub weight: i32,
    pub target_value: f64,
    pub current_value: f64,
    pub metric_unit: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Expense {
    pub id: String,
    pub employee_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub employee_name: Option<String>,
    pub title: String,
    pub category: String,
    pub amount: f64,
    pub expense_date: String,
    pub description: Option<String>,
    pub receipt_url: Option<String>,
    pub status: String,
    pub approver_id: Option<String>,
    pub approver_name: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
    pub rejection_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExpenseInput {
    pub title: String,
    pub category: String,
    pub amount: f64,
    pub expense_date: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateExpenseStatusInput {
    pub status: String,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditLog {
    pub id: String,
    pub user_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_name: Option<String>,
    pub action: String,
    pub entity: String,
    pub entity_id: String,
    pub details: serde_json::Value,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DashboardTelemetry {
    pub total_employees: i32,
    pub active_today: i32,
    pub on_leave_today: i32,
    pub pending_leave_requests: i32,
    pub pending_expenses: i32,
    pub monthly_payroll_total: f64,
    pub attendance_rate: f64,
    pub open_jobs: i32,
    pub active_applicants: i32,
}
