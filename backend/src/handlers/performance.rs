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
    middleware::AuthUser,
    models::{ApiResponse, AuditLog, PerformanceGoal},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct GoalQuery {
    pub employee_id: Option<String>,
    pub cycle_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateGoalPayload {
    pub cycle_id: String,
    pub title: String,
    pub description: String,
    pub weight: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGoalPayload {
    pub title: Option<String>,
    pub description: Option<String>,
    pub progress: Option<f64>,
    pub status: Option<String>,
}

pub async fn list_cycles(State(store): State<Arc<dyn Store>>) -> impl IntoResponse {
    let cycles = store.list_cycles().await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(cycles),
            message: None,
        }),
    )
}

pub async fn list_goals(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<GoalQuery>,
) -> impl IntoResponse {
    let emp_id = match auth.role.as_str() {
        "admin" | "hr_manager" | "manager" => query.employee_id.as_deref(),
        _ => Some(auth.id.as_str()),
    };

    let goals = store.list_goals(emp_id, query.cycle_id.as_deref()).await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(goals),
            message: None,
        }),
    )
}

pub async fn create_goal(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreateGoalPayload>,
) -> Response {
    let weight = payload.weight.unwrap_or(20.0) as i32;

    let goal = PerformanceGoal {
        id: id::gen_id("gol"),
        employee_id: auth.id.clone(),
        cycle_id: payload.cycle_id,
        title: payload.title,
        description: payload.description,
        category: "operational".into(),
        weight,
        target_value: 100.0,
        current_value: 0.0,
        metric_unit: "%".into(),
        status: "in_progress".into(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    match store.create_goal(goal).await {
        Ok(created) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "GOAL_CREATE".into(),
                    entity: "performance_goal".into(),
                    entity_id: created.id.clone(),
                    details: serde_json::json!({ "title": created.title }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    data: Some(created),
                    message: Some("Goal created".into()),
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

pub async fn update_goal(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateGoalPayload>,
) -> Response {
    let existing_goals = store.list_goals(None, None).await;
    let existing = match existing_goals.into_iter().find(|g| g.id == id) {
        Some(g) => g,
        None => {
            return (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::err("Goal not found")),
            )
                .into_response();
        }
    };

    if auth.role != "admin" && auth.role != "hr_manager" && existing.employee_id != auth.id {
        return (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::err("Unauthorized to update this goal")),
        )
            .into_response();
    }

    let mut updated = existing;
    if let Some(t) = payload.title {
        updated.title = t;
    }
    if let Some(d) = payload.description {
        updated.description = d;
    }
    if let Some(p) = payload.progress {
        updated.current_value = p;
    }
    if let Some(s) = payload.status {
        updated.status = s;
    }
    updated.updated_at = Utc::now();

    match store.update_goal(&id, updated).await {
        Ok(saved) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "GOAL_UPDATE".into(),
                    entity: "performance_goal".into(),
                    entity_id: id,
                    details: serde_json::json!({ "current_value": saved.current_value }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(saved),
                    message: Some("Goal updated".into()),
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
