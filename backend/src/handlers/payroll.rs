use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use std::sync::Arc;

use crate::{
    id,
    middleware::{check_roles, AuthUser},
    models::{ApiResponse, AuditLog, PayrollPeriod, SalaryStructure},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct CreatePeriodPayload {
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub pay_date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PayslipQuery {
    pub period_id: Option<String>,
    pub employee_id: Option<String>,
}

pub async fn list_periods(
    _auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
) -> impl IntoResponse {
    let periods = store.list_payroll_periods().await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(periods),
            message: None,
        }),
    )
}

pub async fn create_period(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreatePeriodPayload>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    let pay_date = payload.pay_date.unwrap_or_else(|| payload.end_date.clone());

    let period = PayrollPeriod {
        id: id::gen_id("pay"),
        name: payload.name,
        start_date: payload.start_date,
        end_date: payload.end_date,
        pay_date,
        status: "draft".into(),
        total_disbursement: 0.0,
        processed_by: None,
        processed_at: None,
        created_at: Utc::now(),
    };

    match store.create_payroll_period(period).await {
        Ok(created) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "PAYROLL_PERIOD_CREATE".into(),
                    entity: "payroll_period".into(),
                    entity_id: created.id.clone(),
                    details: serde_json::json!({ "name": created.name }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    data: Some(created),
                    message: Some("Payroll period created".into()),
                }),
            )
                .into_response()
        }
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::err(err)),
        )
            .into_response(),
    }
}

pub async fn list_payslips(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<PayslipQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" => query.employee_id.as_deref(),
        _ => Some(auth.id.as_str()),
    };

    let slips = store
        .list_payslips(query.period_id.as_deref(), emp_id)
        .await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(slips),
            message: None,
        }),
    )
}

pub async fn generate_payslips(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(period_id): Path<String>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    match store.generate_payslips_for_period(&period_id, &auth.id).await {
        Ok(_) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "PAYROLL_GENERATE_PAYSLIPS".into(),
                    entity: "payroll_period".into(),
                    entity_id: period_id,
                    details: serde_json::json!({}),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some("Payslips generated successfully"),
                    message: Some("Payslips generated successfully".into()),
                }),
            )
                .into_response()
        }
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::err(err)),
        )
            .into_response(),
    }
}

pub async fn get_salary_structure(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(employee_id): Path<String>,
) -> Response {
    if auth.role != "admin" && auth.role != "hr_manager" && auth.id != employee_id {
        return (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::err("Unauthorized access to salary structure")),
        )
            .into_response();
    }

    let st = store.get_salary_structure(&employee_id).await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(st),
            message: None,
        }),
    )
        .into_response()
}

pub async fn save_salary_structure(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<SalaryStructure>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    let mut st = payload;
    if st.id.is_empty() {
        st.id = id::gen_id("sal");
    }
    st.created_at = Utc::now();

    match store.save_salary_structure(st).await {
        Ok(saved) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "SALARY_STRUCTURE_SAVE".into(),
                    entity: "salary_structure".into(),
                    entity_id: saved.id.clone(),
                    details: serde_json::json!({ "basic_salary": saved.basic_salary }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(saved),
                    message: Some("Salary structure saved".into()),
                }),
            )
                .into_response()
        }
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::err(err)),
        )
            .into_response(),
    }
}
