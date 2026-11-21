use crate::middleware::AuthUser;
use crate::models::Claims;
use crate::store::Store;
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

pub async fn login(
    State(store): State<Arc<dyn Store>>,
    Json(input): Json<LoginInput>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let emp = store.get_employee_by_email(&input.email).await.ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Email atau kata sandi tidak valid." })),
        )
    })?;

    let valid = bcrypt::verify(&input.password, &emp.password_hash).unwrap_or(false);
    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Email atau kata sandi tidak valid." })),
        ));
    }

    let exp = (Utc::now() + Duration::days(7)).timestamp() as usize;
    let claims = Claims {
        sub: emp.id.clone(),
        email: emp.email.clone(),
        name: emp.full_name.clone(),
        role: emp.role.clone(),
        exp,
    };

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "hrms-secret-key-for-ethereal-ui".to_string());
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Token generation failed: {}", e) })),
        )
    })?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "token": token,
            "user": emp.to_user(),
        })),
    ))
}

pub async fn me(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let emp = store.get_employee_by_id(&user.id).await.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "User account not found" })),
        )
    })?;

    Ok((StatusCode::OK, Json(emp.to_user())))
}

#[derive(Deserialize)]
pub struct UpdateProfileInput {
    pub full_name: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
}

pub async fn update_profile(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
    Json(input): Json<UpdateProfileInput>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let mut emp = store.get_employee_by_id(&user.id).await.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "User account not found" })),
        )
    })?;

    if let Some(name) = input.full_name {
        emp.full_name = name;
    }
    if let Some(ph) = input.phone {
        emp.phone = Some(ph);
    }
    if let Some(addr) = input.address {
        emp.address = Some(addr);
    }

    let updated = store
        .update_employee(&user.id, emp)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({ "error": e }))))?;

    Ok((StatusCode::OK, Json(updated.to_user())))
}

#[derive(Deserialize)]
pub struct ChangePasswordInput {
    pub current_password: String,
    pub new_password: String,
}

pub async fn change_password(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
    Json(input): Json<ChangePasswordInput>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let mut emp = store.get_employee_by_id(&user.id).await.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "User account not found" })),
        )
    })?;

    let valid = bcrypt::verify(&input.current_password, &emp.password_hash).unwrap_or(false);
    if !valid {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Kata sandi saat ini tidak cocok." })),
        ));
    }

    if input.new_password.len() < 6 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Kata sandi baru minimal 6 karakter." })),
        ));
    }

    let new_hash = bcrypt::hash(&input.new_password, 4).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        )
    })?;

    emp.password_hash = new_hash;
    store
        .update_employee(&user.id, emp)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e }))))?;

    Ok((
        StatusCode::OK,
        Json(json!({ "message": "Kata sandi berhasil diperbarui." })),
    ))
}
