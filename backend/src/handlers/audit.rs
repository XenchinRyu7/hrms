use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::{
    middleware::{check_roles, AuthUser},
    models::ApiResponse,
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct AuditQuery {
    pub limit: Option<usize>,
}

pub async fn list_audit_logs(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<AuditQuery>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    let limit = query.limit.unwrap_or(100);
    let logs = store.list_audit_logs(limit).await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(logs),
            message: None,
        }),
    )
        .into_response()
}
