use crate::id::gen_id;
use crate::middleware::{check_roles, AuthUser};
use crate::models::{Employee, ROLE_ADMIN, ROLE_HR_MANAGER};
use crate::store::Store;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct EmployeeFilter {
    pub role: Option<String>,
    pub department_id: Option<String>,
    pub search: Option<String>,
}

pub async fn list_employees(
    State(store): State<Arc<dyn Store>>,
    _user: AuthUser,
    Query(filter): Query<EmployeeFilter>,
) -> impl IntoResponse {
    let list = store
        .list_employees(
            filter.role.as_deref(),
            filter.department_id.as_deref(),
            filter.search.as_deref(),
        )
        .await;

    let users: Vec<_> = list.into_iter().map(|e| e.to_user()).collect();
    (StatusCode::OK, Json(users))
}

pub async fn get_employee(
    State(store): State<Arc<dyn Store>>,
    _user: AuthUser,
    Path(id): Path<String>,
) -> Response {
    match store.get_employee_by_id(&id).await {
        Some(emp) => (StatusCode::OK, Json(emp.to_user())).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Employee not found" })),
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
pub struct CreateEmployeeInput {
    pub email: String,
    pub password: Option<String>,
    pub full_name: String,
    pub role: Option<String>,
    pub department_id: Option<String>,
    pub job_title_id: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub hire_date: Option<String>,
}

pub async fn create_employee(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
    Json(input): Json<CreateEmployeeInput>,
) -> Response {
    if let Err(res) = check_roles(&user, &[ROLE_ADMIN, ROLE_HR_MANAGER]) {
        return res;
    }

    let pass = input.password.unwrap_or_else(|| "password123".to_string());
    let pass_hash = bcrypt::hash(&pass, 4).unwrap_or_else(|_| "hash".to_string());
    let now = Utc::now();

    let emp = Employee {
        id: gen_id("emp"),
        employee_code: String::new(),
        email: input.email,
        password_hash: pass_hash,
        full_name: input.full_name,
        role: input.role.unwrap_or_else(|| "employee".to_string()),
        department_id: input.department_id,
        department_name: None,
        job_title_id: input.job_title_id,
        job_title: None,
        manager_id: None,
        phone: input.phone,
        address: input.address,
        hire_date: input.hire_date.unwrap_or_else(|| now.format("%Y-%m-%d").to_string()),
        status: "active".to_string(),
        avatar_url: None,
        created_at: now,
        updated_at: now,
    };

    match store.create_employee(emp).await {
        Ok(created) => (StatusCode::CREATED, Json(created.to_user())).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(json!({ "error": e }))).into_response(),
    }
}

#[derive(Deserialize)]
pub struct UpdateEmployeeInput {
    pub full_name: String,
    pub role: String,
    pub department_id: Option<String>,
    pub job_title_id: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
}

pub async fn update_employee(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
    Path(id): Path<String>,
    Json(input): Json<UpdateEmployeeInput>,
) -> Response {
    if let Err(res) = check_roles(&user, &[ROLE_ADMIN, ROLE_HR_MANAGER]) {
        return res;
    }

    let mut existing = match store.get_employee_by_id(&id).await {
        Some(e) => e,
        None => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Employee not found" })),
            )
                .into_response();
        }
    };

    existing.full_name = input.full_name;
    existing.role = input.role;
    existing.department_id = input.department_id;
    existing.job_title_id = input.job_title_id;
    existing.phone = input.phone;
    existing.address = input.address;

    match store.update_employee(&id, existing).await {
        Ok(updated) => (StatusCode::OK, Json(updated.to_user())).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(json!({ "error": e }))).into_response(),
    }
}

pub async fn delete_employee(
    State(store): State<Arc<dyn Store>>,
    user: AuthUser,
    Path(id): Path<String>,
) -> Response {
    if let Err(res) = check_roles(&user, &[ROLE_ADMIN]) {
        return res;
    }

    match store.delete_employee(&id).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({ "message": "Employee successfully deleted" })),
        )
            .into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(json!({ "error": e }))).into_response(),
    }
}

pub async fn list_departments(
    State(store): State<Arc<dyn Store>>,
    _user: AuthUser,
) -> impl IntoResponse {
    let list = store.list_departments().await;
    (StatusCode::OK, Json(list))
}

pub async fn list_job_titles(
    State(store): State<Arc<dyn Store>>,
    _user: AuthUser,
) -> impl IntoResponse {
    let list = store.list_job_titles().await;
    (StatusCode::OK, Json(list))
}
