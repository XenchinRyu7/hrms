mod config;
mod handlers;
mod id;
mod middleware;
mod models;
mod routes;
mod store;

use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug,axum=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cfg = config::Config::from_env();
    let memory_store = store::memory::MemoryStore::new();
    let store_arc: Arc<dyn store::Store> = Arc::new(memory_store);

    let app = routes::create_router(store_arc);

    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("Starting Ethereal HRMS Rust Server on {}", addr);
    println!("🚀 Ethereal HRMS Rust Server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
