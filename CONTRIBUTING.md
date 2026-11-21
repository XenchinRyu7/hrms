# Contributing to Ethereal Enterprise HRMS

Thank you for your interest in contributing to **Ethereal Enterprise HRMS**! This project is an open-source, enterprise-grade Human Resource Management System built with **Astro 5**, **Go 1.25 REST API**, **Supabase PostgreSQL**, and the custom **Ethereal UI (`@etherealui/react` v0.0.7)** design system with Tailwind CSS v4.

We welcome contributions from everyone—whether it's fixing bugs, improving documentation, designing UI components, or introducing enterprise HR workflows.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Development Environment Setup](#development-environment-setup)
3. [Architecture Overview](#architecture-overview)
4. [Ethereal UI Design System Guidelines](#ethereal-ui-design-system-guidelines)
5. [Git Workflow & Commit Guidelines](#git-workflow--commit-guidelines)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [Reporting Bugs & Suggesting Features](#reporting-bugs--suggesting-features)

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Development Environment Setup

### Prerequisites
- **Node.js**: v20.x or v22.x LTS (Recommended: v22.16+)
- **pnpm**: v9.x or v10.x (`npm install -g pnpm`)
- **Go**: v1.23+ or v1.25+
- **Supabase Account**: A free Supabase PostgreSQL project or local PostgreSQL 15+

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ethereal-hrms.git
cd ethereal-hrms
```

### 2. Install Root & Frontend Dependencies
```bash
# Installs root hooks (Husky, commitlint, lint-staged)
pnpm install

# Installs Astro & Ethereal UI frontend dependencies
cd frontend
pnpm install
cd ..
```

### 3. Configure Environment Variables
Copy the sample environment file in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=8080
# Note: For IPv4-only networks, always use the Supabase Connection Pooler:
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[URL_ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:4321,http://localhost:3000
```

### 4. Run Development Servers
In separate terminals:

```bash
# Terminal 1: Run Rust Backend API (Port 8080)
pnpm dev:backend
# or: cd backend && cargo run

# Terminal 2: Run Astro + Ethereal UI Frontend (Port 4321)
pnpm dev:frontend
# or: cd frontend && pnpm dev
```

Open your browser at `http://localhost:4321`.

---

## Architecture Overview

```
├── .github/                   # GitHub workflows, funding, PR & issue templates
├── .husky/                    # Husky git hooks (commit-msg & pre-commit)
├── backend/                   # Go 1.25 REST API Server (Gin Gonic engine)
│   ├── cmd/server/            # Entry point (main.go)
│   ├── internal/
│   │   ├── config/            # Environment variable configuration
│   │   ├── database/          # PostgreSQL & Keep-Alive automated worker
│   │   ├── handlers/          # REST route handlers (Auth, HR, Payroll, ATS)
│   │   ├── middleware/        # JWT auth, CORS, and RBAC role validation
│   │   ├── models/            # Domain models and request/response structs
│   │   └── routes/            # Centralized API router configuration
├── database/                  # Enterprise SQL schemas and seed fixtures
│   ├── schema.sql             # 16 normalized HR relational tables with UUIDs
│   └── seed.sql               # Seed dataset (executives, HR, departments)
├── frontend/                  # Astro 5 + React 19 + Ethereal UI SPA frontend
│   ├── src/
│   │   ├── components/        # Ethereal UI modules (Attendance, Leave, ATS)
│   │   ├── layouts/           # RootLayout with theme provider & sidebar
│   │   ├── lib/               # AuthContext, NavContext (SPA), ThemeContext
│   │   ├── pages/             # Astro file routes with client:only hydration
│   │   └── styles/            # globals.css with OKLCH tokens and themes
├── commitlint.config.js       # Conventional commit validation configuration
└── package.json               # Root monorepo workspace scripts
```

---

## Ethereal UI Design System Guidelines

When building or modifying UI components, you **MUST** follow these core Ethereal UI design system principles:

1. **Semantic Color Pairing (WCAG 2.1 AA Compliance)**:
   - Always pair `bg-primary` with `text-primary-foreground`.
   - Always pair `bg-card` with `text-card-foreground`.
   - Always pair `bg-muted` with `text-muted-foreground`.
   - **NEVER** hardcode `text-white` on variable primary or accent backgrounds.
2. **Dynamic OKLCH Color Tokens**:
   - The application supports multiple OKLCH theme palettes (`default`, `emerald`, `violet`, `cyberpunk`, `amber`) and dark/light modes.
   - All colors must rely on CSS variables (`var(--primary)`, `var(--card)`, etc.).
3. **No-Flicker Navigation**:
   - Page transitions use client-side SPA routing (`useNav().navigate`) to prevent unwanted full-page document reload flashes.

---

## Git Workflow & Commit Guidelines

This repository enforces **Conventional Commits** via **Husky** and **Commitlint**. Non-compliant commit messages will be rejected automatically.

### Commit Format
```
<type>(<scope>): <subject>
```

### Allowed Types:
- `feat`: A new user-facing feature or module
- `fix`: A bug fix
- `docs`: Documentation updates or additions
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Refactoring production code without behavior changes
- `perf`: Code changes that improve performance
- `test`: Adding or refactoring unit/integration tests
- `chore`: Build tasks, package updates, repository maintenance
- `ci`: CI/CD pipeline and GitHub workflow modifications

### Examples:
- `feat(payroll): add Indonesian PPh 21 and BPJS deduction calculation`
- `fix(auth): handle expired JWT tokens with automatic redirection`
- `docs(readme): add Supabase connection pooler troubleshooting`
- `chore(deps): update @etherealui/react to latest patch`

---

## Submitting a Pull Request

1. **Fork** the repository and create your branch from `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes** following the code formatting and Ethereal UI rules.
3. **Verify the builds pass cleanly**:
   ```bash
   pnpm build:frontend
   cd backend && go build ./... && cd ..
   ```
4. **Commit your changes** using conventional commit messages.
5. **Push to your fork** and submit a Pull Request using our [PR Template](.github/pull_request_template.md).

---

## Reporting Bugs & Suggesting Features

- For bug reports, use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- For new feature proposals or HR module requests, use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

Thank you for helping make Ethereal Enterprise HRMS the premier open-source HR platform!
