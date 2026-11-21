use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub database_url: Option<String>,
    pub jwt_secret: String,
    pub cors_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);

        let database_url = env::var("DATABASE_URL").ok();
        let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "hrms-secret-key-for-ethereal-ui".to_string());
        let cors_str = env::var("CORS_ORIGIN").unwrap_or_else(|_| "http://localhost:4321,http://localhost:3000,http://127.0.0.1:4321".to_string());
        let cors_origins = cors_str.split(',').map(|s| s.trim().to_string()).collect();

        Config {
            port,
            database_url,
            jwt_secret,
            cors_origins,
        }
    }
}
