use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use std::sync::Arc;

use crate::{
    id,
    middleware::AuthUser,
    models::{ApiResponse, AuditLog},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct ClockInPayload {
    pub location: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceQuery {
    pub employee_id: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

pub async fn get_today(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
) -> impl IntoResponse {
    let today = store.get_today_attendance(&auth.id).await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(today),
            message: None,
        }),
    )
}

pub async fn clock_in(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<ClockInPayload>,
) -> Response {
    match store
        .clock_in(
            &auth.id,
            payload.location.as_deref(),
            payload.notes.as_deref(),
            Some("127.0.0.1"),
        )
        .await
    {
        Ok(att) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "ATTENDANCE_CLOCK_IN".into(),
                    entity: "attendance".into(),
                    entity_id: att.id.clone(),
                    details: serde_json::json!({ "location": payload.location, "notes": payload.notes }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(att),
                    message: Some("Clock-in recorded successfully".into()),
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

pub async fn clock_out(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
) -> Response {
    match store.clock_out(&auth.id).await {
        Ok(att) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "ATTENDANCE_CLOCK_OUT".into(),
                    entity: "attendance".into(),
                    entity_id: att.id.clone(),
                    details: serde_json::json!({}),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(att),
                    message: Some("Clock-out recorded successfully".into()),
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

pub async fn list_attendance(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<AttendanceQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" | "manager" => query.employee_id.as_deref(),
        _ => Some(auth.id.as_str()),
    };

    let records = store
        .list_attendance(emp_id, query.start_date.as_deref(), query.end_date.as_deref())
        .await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(records),
            message: None,
        }),
    )
}
