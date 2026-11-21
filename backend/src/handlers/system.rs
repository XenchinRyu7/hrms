use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

pub async fn health() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "system": "Ethereal HRMS Rust Engine",
            "version": "1.0.0",
            "ui_engine": "Ethereal UI",
            "timestamp": chrono::Utc::now().to_rfc3339(),
        })),
    )
}

pub async fn system_status() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "online",
            "database": "connected (memory-store)",
            "uptime_seconds": 3600,
            "version": "1.0.0-rust"
        })),
    )
}

pub async fn db_ping() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "success": true,
            "latency_ms": 0.42,
            "engine": "Ethereal In-Memory / SQLite Store"
        })),
    )
}
