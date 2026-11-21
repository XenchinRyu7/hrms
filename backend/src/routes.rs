use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::{handlers, store::Store};

pub fn create_router(store: Arc<dyn Store>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let api_v1 = Router::new()
        // Health & System
        .route("/health", get(handlers::system::health))
        .route("/system/status", get(handlers::system::system_status))
        .route("/system/db-ping", get(handlers::system::db_ping))
        // Auth
        .route("/auth/login", post(handlers::auth::login))
        .route("/auth/me", get(handlers::auth::me))
        .route("/auth/profile", put(handlers::auth::update_profile))
        .route("/auth/change-password", post(handlers::auth::change_password))
        // Dashboard
        .route("/dashboard/telemetry", get(handlers::dashboard::get_telemetry))
        // Employees & Organization
        .route(
            "/employees",
            get(handlers::employees::list_employees).post(handlers::employees::create_employee),
        )
        .route(
            "/employees/{id}",
            get(handlers::employees::get_employee)
                .put(handlers::employees::update_employee)
                .delete(handlers::employees::delete_employee),
        )
        .route("/departments", get(handlers::employees::list_departments))
        .route("/job-titles", get(handlers::employees::list_job_titles))
        // Attendance
        .route("/attendance/today", get(handlers::attendance::get_today))
        .route("/attendance/clock-in", post(handlers::attendance::clock_in))
        .route("/attendance/clock-out", post(handlers::attendance::clock_out))
        .route("/attendance", get(handlers::attendance::list_attendance))
        // Leave
        .route("/leave/types", get(handlers::leave::list_types))
        .route("/leave/balances", get(handlers::leave::get_balances))
        .route(
            "/leave/requests",
            get(handlers::leave::list_requests).post(handlers::leave::create_request),
        )
        .route(
            "/leave/requests/{id}/status",
            put(handlers::leave::update_status),
        )
        // Payroll
        .route(
            "/payroll/periods",
            get(handlers::payroll::list_periods).post(handlers::payroll::create_period),
        )
        .route(
            "/payroll/periods/{id}/generate",
            post(handlers::payroll::generate_payslips),
        )
        .route("/payroll/payslips", get(handlers::payroll::list_payslips))
        .route(
            "/payroll/salary-structure/{employee_id}",
            get(handlers::payroll::get_salary_structure),
        )
        .route(
            "/payroll/salary-structure",
            post(handlers::payroll::save_salary_structure),
        )
        // Expenses
        .route(
            "/expenses",
            get(handlers::expenses::list_expenses).post(handlers::expenses::create_expense),
        )
        .route(
            "/expenses/{id}/status",
            put(handlers::expenses::update_status),
        )
        // Recruitment
        .route(
            "/recruitment/jobs",
            get(handlers::recruitment::list_jobs).post(handlers::recruitment::create_job),
        )
        .route(
            "/recruitment/applicants",
            get(handlers::recruitment::list_applicants).post(handlers::recruitment::create_applicant),
        )
        .route(
            "/recruitment/applicants/{id}/stage",
            put(handlers::recruitment::update_stage),
        )
        // Performance
        .route("/performance/cycles", get(handlers::performance::list_cycles))
        .route(
            "/performance/goals",
            get(handlers::performance::list_goals).post(handlers::performance::create_goal),
        )
        .route(
            "/performance/goals/{id}",
            put(handlers::performance::update_goal),
        )
        // Audit
        .route("/audit/logs", get(handlers::audit::list_audit_logs))
        .with_state(store);

    Router::new()
        .nest("/api/v1", api_v1)
        .layer(cors)
}
