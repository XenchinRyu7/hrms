use crate::models::Claims;
use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde_json::json;

pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
}

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok());

        let token = match auth_header {
            Some(h) if h.starts_with("Bearer ") => &h[7..],
            _ => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Missing or invalid authorization token" })),
                )
                    .into_response());
            }
        };

        let secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "hrms-secret-key-for-ethereal-ui".to_string());

        let token_data = match decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        ) {
            Ok(data) => data,
            Err(_) => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Invalid or expired authorization token" })),
                )
                    .into_response());
            }
        };

        Ok(AuthUser {
            id: token_data.claims.sub,
            email: token_data.claims.email,
            name: token_data.claims.name,
            role: token_data.claims.role,
        })
    }
}

pub fn check_roles(user: &AuthUser, allowed_roles: &[&str]) -> Result<(), Response> {
    if allowed_roles.contains(&user.role.as_str()) {
        Ok(())
    } else {
        Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "success": false,
                "error": "Akses Ditolak: Peran akun Anda tidak memiliki izin untuk tindakan ini."
            })),
        )
            .into_response())
    }
}
