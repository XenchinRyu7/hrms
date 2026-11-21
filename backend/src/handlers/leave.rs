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
    models::{ApiResponse, AuditLog, LeaveRequest},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct LeaveBalancesQuery {
    pub employee_id: Option<String>,
    pub year: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct LeaveQuery {
    pub employee_id: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct CreateLeavePayload {
    pub leave_type_id: String,
    pub start_date: String,
    pub end_date: String,
    pub days_count: Option<f64>,
    pub total_days: Option<i32>,
    pub reason: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveStatusPayload {
    pub status: String,
    pub reason: Option<String>,
}

pub async fn list_types(State(store): State<Arc<dyn Store>>) -> impl IntoResponse {
    let types = store.list_leave_types().await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(types),
            message: None,
        }),
    )
}

pub async fn get_balances(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<LeaveBalancesQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" | "manager" => query.employee_id.as_deref().unwrap_or(&auth.id),
        _ => &auth.id,
    };

    let year = query.year.unwrap_or(2026);
    let balances = store.get_leave_balances(emp_id, year).await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(balances),
            message: None,
        }),
    )
}

pub async fn list_requests(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<LeaveQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" | "manager" => query.employee_id.as_deref(),
        _ => Some(auth.id.as_str()),
    };

    let requests = store
        .list_leave_requests(emp_id, query.status.as_deref())
        .await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(requests),
            message: None,
        }),
    )
}

pub async fn create_request(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreateLeavePayload>,
) -> Response {
    let types = store.list_leave_types().await;
    let type_name = types
        .iter()
        .find(|t| t.id == payload.leave_type_id)
        .map(|t| t.name.clone())
        .unwrap_or_else(|| "Annual Leave".into());

    let total_days = payload
        .total_days
        .unwrap_or_else(|| payload.days_count.unwrap_or(1.0) as i32);

    let req = LeaveRequest {
        id: id::gen_id("lev"),
        employee_id: auth.id.clone(),
        employee_name: Some(auth.name.clone()),
        department_name: None,
        leave_type_id: payload.leave_type_id,
        leave_type_name: Some(type_name),
        start_date: payload.start_date,
        end_date: payload.end_date,
        total_days,
        reason: payload.reason,
        attachment_url: None,
        status: "pending".into(),
        approver_id: None,
        approver_name: None,
        approved_at: None,
        rejection_reason: None,
        created_at: Utc::now(),
    };

    match store.create_leave_request(req).await {
        Ok(created) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "LEAVE_SUBMIT".into(),
                    entity: "leave".into(),
                    entity_id: created.id.clone(),
                    details: serde_json::json!({ "total_days": total_days }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    data: Some(created),
                    message: Some("Leave request submitted".into()),
                }),
            )
                .into_response()
        }
        Err(err) => (StatusCode::BAD_REQUEST, Json(ApiResponse::err(err))).into_response(),
    }
}

pub async fn update_status(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateLeaveStatusPayload>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager", "manager"]) {
        return err_resp;
    }

    match store
        .update_leave_request_status(&id, &payload.status, &auth.id, payload.reason.as_deref())
        .await
    {
        Ok(updated) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: format!("LEAVE_{}", payload.status.to_uppercase()),
                    entity: "leave".into(),
                    entity_id: id,
                    details: serde_json::json!({ "status": payload.status, "reason": payload.reason }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(updated),
                    message: Some(format!("Leave request {}", payload.status)),
                }),
            )
                .into_response()
        }
        Err(err) => (StatusCode::BAD_REQUEST, Json(ApiResponse::err(err))).into_response(),
    }
}
