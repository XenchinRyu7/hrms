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
    models::{ApiResponse, Applicant, AuditLog, JobPosting},
    store::Store,
};

#[derive(Debug, Deserialize)]
pub struct ApplicantQuery {
    pub job_id: Option<String>,
    pub stage: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobPayload {
    pub title: String,
    pub department_id: Option<String>,
    pub location: String,
    pub employment_type: String,
    pub experience_level: String,
    pub description: String,
    pub requirements: Option<Vec<String>>,
    pub salary_min: Option<f64>,
    pub salary_max: Option<f64>,
    pub salary_range: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateApplicantPayload {
    pub job_id: Option<String>,
    pub job_posting_id: Option<String>,
    pub name: Option<String>,
    pub full_name: Option<String>,
    pub email: String,
    pub phone: Option<String>,
    pub resume_url: Option<String>,
    pub cover_letter: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStagePayload {
    pub stage: String,
}

pub async fn list_jobs(State(store): State<Arc<dyn Store>>) -> impl IntoResponse {
    let jobs = store.list_jobs().await;
    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(jobs),
            message: None,
        }),
    )
}

pub async fn create_job(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreateJobPayload>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    let deps = store.list_departments().await;
    let dep_name = payload
        .department_id
        .as_ref()
        .and_then(|did| deps.iter().find(|d| &d.id == did).map(|d| d.name.clone()));

    let salary_range = payload.salary_range.unwrap_or_else(|| {
        format!(
            "Rp {:.0} - Rp {:.0}",
            payload.salary_min.unwrap_or(10_000_000.0),
            payload.salary_max.unwrap_or(20_000_000.0)
        )
    });

    let requirements = payload
        .requirements
        .map(|r| r.join("\n"))
        .unwrap_or_default();

    let job = JobPosting {
        id: id::gen_id("job"),
        title: payload.title,
        department_id: payload.department_id,
        department_name: dep_name,
        location: payload.location,
        employment_type: payload.employment_type,
        experience_level: payload.experience_level,
        salary_range,
        description: payload.description,
        requirements,
        status: "active".into(),
        applicants_count: 0,
        created_at: Utc::now(),
    };

    match store.create_job(job).await {
        Ok(created) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: "JOB_CREATE".into(),
                    entity: "job_posting".into(),
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
                    message: Some("Job posting created".into()),
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

pub async fn list_applicants(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Query(query): Query<ApplicantQuery>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager", "manager"]) {
        return err_resp;
    }

    let applicants = store
        .list_applicants(query.job_id.as_deref(), query.stage.as_deref())
        .await;

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: Some(applicants),
            message: None,
        }),
    )
        .into_response()
}

pub async fn create_applicant(
    State(store): State<Arc<dyn Store>>,
    Json(payload): Json<CreateApplicantPayload>,
) -> Response {
    let job_id = payload
        .job_posting_id
        .or(payload.job_id)
        .unwrap_or_default();
    let full_name = payload
        .full_name
        .or(payload.name)
        .unwrap_or_else(|| "Candidate".into());

    let app = Applicant {
        id: id::gen_id("app"),
        job_posting_id: job_id,
        job_title: None,
        full_name,
        email: payload.email,
        phone: payload.phone.unwrap_or_default(),
        resume_url: payload.resume_url,
        stage: "applied".into(),
        rating: 0,
        notes: payload.cover_letter,
        created_at: Utc::now(),
    };

    match store.create_applicant(app).await {
        Ok(created) => (
            StatusCode::CREATED,
            Json(ApiResponse {
                success: true,
                data: Some(created),
                message: Some("Application submitted".into()),
            }),
        )
            .into_response(),
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::err(err)),
        )
            .into_response(),
    }
}

pub async fn update_stage(
    auth: AuthUser,
    State(store): State<Arc<dyn Store>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateStagePayload>,
) -> Response {
    if let Err(err_resp) = check_roles(&auth, &["admin", "hr_manager"]) {
        return err_resp;
    }

    match store.update_applicant_stage(&id, &payload.stage).await {
        Ok(updated) => {
            store
                .log_action(AuditLog {
                    id: id::gen_id("aud"),
                    user_id: auth.id.clone(),
                    user_name: Some(auth.name.clone()),
                    action: format!("APPLICANT_STAGE_{}", payload.stage.to_uppercase()),
                    entity: "applicant".into(),
                    entity_id: id,
                    details: serde_json::json!({ "stage": payload.stage }),
                    ip_address: Some("127.0.0.1".into()),
                    created_at: Utc::now(),
                })
                .await;

            (
                StatusCode::OK,
                Json(ApiResponse {
                    success: true,
                    data: Some(updated),
                    message: Some("Applicant stage updated".into()),
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
