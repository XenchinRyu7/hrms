use crate::middleware::{check_roles, AuthUser};
use crate::models::{ROLE_ADMIN, ROLE_HR_MANAGER, ROLE_MANAGER};
use crate::store::Store;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use std::sync::Arc;

pub async fn get_telemetry(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
) -> Response {
    if let Err(res) = check_roles(&user, &[ROLE_ADMIN, ROLE_HR_MANAGER, ROLE_MANAGER]) {
        return res;
    }

    let telem = store.get_dashboard_telemetry().await;
    (StatusCode::OK, Json(telem)).into_response()
}
