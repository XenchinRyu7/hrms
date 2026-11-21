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
    models::{ApiResponse, AuditLog, Expense},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct ExpenseQuery {
    pub employee_id: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExpensePayload {
    pub title: Option<String>,
    pub category: String,
    pub amount: f64,
    pub expense_date: Option<String>,
    pub date: Option<String>,
    pub description: Option<String>,
    pub receipt_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateExpenseStatusPayload {
    pub status: String,
    pub rejection_reason: Option<String>,
}

pub async fn list_expenses(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<ExpenseQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" | "manager" => query.employee_id.as_deref(),
        _ => Some(auth.id.as_str()),
    };

    let expenses = store.list_expenses(emp_id, query.status.as_deref()).await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(expenses),
            message: None,
        }),
    )
}

pub async fn create_expense(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreateExpensePayload>,
) -> Response {
    let title = payload
        .title
        .unwrap_or_else(|| format!("{} Claim", payload.category));
    let expense_date = payload
        .expense_date
        .or(payload.date)
        .unwrap_or_else(|| Utc::now().format("%Y-%m-%d").to_string());

    let exp = Expense {
        id: id::gen_id("exp"),
        employee_id: auth.id.clone(),
        employee_name: Some(auth.name.clone()),
        title,
        category: payload.category,
        amount: payload.amount,
        expense_date,
        description: payload.description,
        receipt_url: payload.receipt_url,
        status: "pending".into(),
        approver_id: None,
        approver_name: None,
        approved_at: None,
        rejection_reason: None,
        created_at: Utc::now(),
    };

    match store.create_expense(exp).await {
        Ok(created) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "EXPENSE_SUBMIT".into(),
                    entity: "expense".into(),
                    entity_id: created.id.clone(),
                    details: serde_json::json!({ "amount": created.amount, "category": created.category }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    data: Some(created),
                    message: Some("Expense submitted successfully".into()),
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

pub async fn update_status(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateExpenseStatusPayload>,
) -> Response {
    // Strictly require HR Manager or Admin for Reimbursement Approval (Separation of Duties)
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    match store
        .update_expense_status(
            &id,
            &payload.status,
            &auth.id,
            payload.rejection_reason.as_deref(),
        )
        .await
    {
        Ok(updated) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: format!("EXPENSE_{}", payload.status.to_uppercase()),
                    entity: "expense".into(),
                    entity_id: id,
                    details: serde_json::json!({ "status": payload.status, "reason": payload.rejection_reason }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(updated),
                    message: Some(format!("Expense {}", payload.status)),
                }),
            )
                .into_response()
        }
        Err(err) => {
            let status_code = if err.contains("not authorized") || err.contains("cannot approve your own") {
                StatusCode::FORBIDDEN
            } else {
                StatusCode::BAD_REQUEST
            };
            (
                status_code,
                Json(ApiResponse::err(err)),
            )
                .into_response()
        }
    }
}
