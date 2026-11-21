# 1. Build Stage
FROM rust:alpine AS builder

WORKDIR /app

RUN apk add --no-cache musl-dev

COPY Cargo.toml Cargo.lock ./
# Pre-build dependencies for caching
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY . .
RUN touch src/main.rs && cargo build --release

# 2. Production Stage
FROM alpine:3.21

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/target/release/ethereal-hrms-backend /app/server

EXPOSE 8080

CMD ["/app/server"]
