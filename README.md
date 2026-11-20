# Ethereal HRMS — Full-Stack Enterprise People & Talent Operating System

[![Ethereal UI](https://img.shields.io/badge/UI_Engine-Ethereal_UI_v0.0.7-blue?style=flat-square)](https://ethereal-ui.saefulrohman.dev)
[![Go Version](https://img.shields.io/badge/Backend-Go_1.25-00ADD8?style=flat-square&logo=go)](https://go.dev)
[![Astro Version](https://img.shields.io/badge/Frontend-Astro_5-FF5D01?style=flat-square&logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=flat-square)](CODE_OF_CONDUCT.md)

**Ethereal HRMS** is an enterprise-grade, dark-first Human Resource Management & Talent Telemetry System built with **Astro 5**, **Go (Golang 1.25)**, **Supabase (PostgreSQL 17)**, and styled strictly according to **[Ethereal UI](https://ethereal-ui.saefulrohman.dev)** (`@etherealui/react` v0.0.7) and **Tailwind CSS v4** design tokens.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend Layer (Astro 5 + React 19 + Ethereal UI v0.0.7)"]
        UI["Ethereal UI Telemetry Canvas (#09090b)"]
        Components["42+ Primitives & Blocks (AreaStatisticChart, DonutStatisticChart, MultiMetricGrid, KanbanBoard)"]
        NavCtx["No-Flicker SPA Router Engine (NavContext)"]
        ThemeCtx["OKLCH Theme Switcher (Default, Emerald, Violet, Cyberpunk, Amber)"]
        AuthCtx["JWT Auth Context & Role Switcher"]
        APIClient["Typed REST Client (src/lib/api.ts)"]
    end

    subgraph Backend["Backend Layer (Go 1.25 REST API)"]
        Router["Gin HTTP Router (:8080)"]
        Middleware["JWT Middleware + Strict RBAC Proxy"]
        Handlers["Domain Handlers (Dashboard, Employees, Attendance, Leave, Payroll, ATS, OKRs, Expenses, Audit, System)"]
        KeepAlive["Automated Supabase Keep-Alive Worker (Auto-Ping / Anti-Pause)"]
        Store["Data Engine (Dual-mode: Supabase PostgreSQL + Seeded In-Memory Sync)"]
    end

    subgraph Database["Database Layer (Supabase PostgreSQL)"]
        Pooler["Supabase IPv4 Connection Pooler (Port 5432 / 6543)"]
        PG["PostgreSQL Relational Engine (v17)"]
        RLS["Row Level Security (RLS) Policies"]
        Seeds["Enterprise Seed Data (16 Normalized Tables)"]
    end

    UI --> Components
    Components --> NavCtx
    Components --> ThemeCtx
    Components --> AuthCtx
    AuthCtx --> APIClient
    APIClient -->|JSON / Bearer JWT| Router
    Router --> Middleware
    Middleware --> Handlers
    Handlers --> Store
    KeepAlive -->|Periodic Keep-Alive Ping| Pooler
    Store --> Pooler
    Pooler --> PG
    PG --> RLS
    PG --> Seeds
```

---

## 🚀 Key Enterprise Modules & Features

| # | Module | Key Features & Ethereal UI Components |
|---|---|---|
| **1** | **Executive Telemetry Console** | Real-time workforce intelligence, `MultiMetricGrid` (Headcount, Punctuality, Approvals, Payroll total), `AreaStatisticChart` (Weekly attendance trends), `DonutStatisticChart` (Department distribution), live quick clock terminal, audit stream. |
| **2** | **Employee Directory & Org** | Roster management, search & department filtering, grid/list switcher, detail profile slide-over drawer, hierarchical corporate org chart (`Network` tree), employee registration modal. |
| **3** | **Time & Attendance Terminal** | Live digital clock (HH:MM:SS), work location selector (`Office`, `Remote`, `Client Site`), instant punctuality badge (`On Time` vs `Late`), daily timesheets, export functionality. |
| **4** | **Leave & Time-Off Management** | Accrual quota cards with progress bars (`Annual Paid`, `Sick`, `Parental`, `Unpaid`), submit leave request modal, manager 1-click approval/rejection ledger. |
| **5** | **Payroll & Compensation** | Automated salary calculation, statutory tax (PPh 21) & BPJS deduction algorithms, itemized monthly payslip statement modal with official corporate branding & print trigger. |
| **6** | **Recruitment & ATS Pipeline** | Job requisition postings, 5-stage interactive hiring Kanban board (`Applied` &rarr; `Screening` &rarr; `Interview` &rarr; `Offer` &rarr; `Hired`), candidate rating & interview evaluation notes. |
| **7** | **Goals, OKRs & Performance** | Q4 Review cycle tracker, department OKR cards with weight percentages, interactive progress sliders, manager feedback, and 5.0 rating scale. |
| **8** | **Expenses & Reimbursements** | Corporate expenditure ledger, category filtering (`Training`, `Hardware`, `Travel`, `Meals`), receipt justification, and manager approval sign-off. |
| **9** | **Compliance & Audit Logs** | Cryptographic immutable activity trail, IP address tracking, JSON telemetry payload inspector, ISO 27001 & UU PDP compliance standards. |
| **10** | **System Governance & RBAC** | Organization master parameters, strict RBAC policy grid (Super Admin, HR Director, Team Lead, Employee), token contrast audit verification. |
| **11** | **Automated DB Keep-Alive** | Continuous background worker executing periodic pings to keep Supabase free-tier databases from pausing after 7 days of inactivity. |

---

## ⚡ Supabase Free Tier Keep-Alive (Anti-Pause)

Supabase automatically pauses free projects after 7 days without inbound requests. Ethereal HRMS provides **two-layer protection** to prevent this:

1. **Backend Background Worker (Active)**:
   - The Go backend automatically starts a background goroutine that pings the Supabase database every 6 hours via `SELECT 1;`.
   - Telemetry status can be queried at `GET /api/v1/system/status`.
   - On-demand ping trigger available at `GET /api/v1/system/db-ping` or `POST /api/v1/system/keepalive`.
2. **GitHub Actions Scheduled Ping (Cloud Fallback)**:
   - A workflow in `.github/workflows/keepalive.yml` runs every 3 days using GitHub Actions cron, ensuring database activity even when your local machine is asleep.

---

## 🔐 Default Demo Accounts & Personas

Each demo persona can be selected with **1-click** on the Login page or toggled live via the top-bar role selector:

| Role | Email | Password | Scope & Permissions |
|---|---|---|---|
| **Super Admin** | `admin@ethereal.hr` | `password123` | Full access across all modules, employee deletion, and system governance. |
| **HR Director** | `hr@ethereal.hr` | `password123` | Manage employees, execute payroll calculations, approve leaves, post requisitions. |
| **Team Lead / Manager** | `devlead@ethereal.hr` | `password123` | Department attendance review, team leave approvals, evaluate team OKRs. |
| **Senior Employee** | `employee@ethereal.hr` | `password123` | Self clock in/out, submit vacation requests, view personal payslips, adjust goal sliders. |

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **pnpm**: v9+ or v10+ (`npm install -g pnpm`)
- **Go**: v1.24+ or v1.25+
- **Git**: Standard Git client with Husky hooks support

### 2. Monorepo Installation & Git Hooks Setup
```bash
# Clone the repository
git clone https://github.com/your-org/ethereal-hrms.git
cd ethereal-hrms

# Install root dependencies & activate Husky commit hooks
pnpm install
```

### 3. Backend Setup (Go REST API)
```bash
cd backend
cp .env.example .env

# Run Go backend server (starts on http://localhost:8080)
go run ./cmd/server/main.go
```

> [!NOTE]
> **Connecting to Supabase on IPv4 Networks**:
> Direct Supabase endpoints (`db.[ref].supabase.co`) only resolve IPv6 addresses. To connect from standard IPv4 connections, use the **Supabase Connection Pooler**:
> ```env
> DATABASE_URL=postgres://postgres.[PROJECT-REF]:[URL-ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
> ```
> *(e.g. for `@EtherealHRMS`, encode `@` as `%40EtherealHRMS`)*

### 4. Frontend Setup (Astro + Ethereal UI)
```bash
cd frontend
pnpm install

# Start development server (http://localhost:4321)
pnpm dev

# Build for production
pnpm build
```

---

## 🛡️ Enterprise Git Governance (Husky & Commitlint)

This repository enforces **Conventional Commits** via **Husky** and **Commitlint**:

```bash
git commit -m "feat(payroll): support indonesian bpjs keteanagakerjaan deductions" # ✅ Allowed
git commit -m "updated stuff"                                                       # ❌ Rejected by commitlint
```

Supported commit prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## 🤝 Community, Contribution & Funding

We welcome open-source contributions! Please check our community guidelines:

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Development setup, coding standards, Ethereal UI token rules, and PR workflow.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**: Contributor Covenant v2.1 code of conduct.
- **[SECURITY.md](SECURITY.md)**: Security policy and private vulnerability disclosure process.
- **[FUNDING.yml](.github/FUNDING.yml)**: Support our open-source development via GitHub Sponsors or Open Collective.

---

## 🎨 Ethereal UI Design System Guidelines

This project strictly adheres to `ETHEREAL_AGENT_GUIDE.md`:
- **Dark-First Canvas:** Deep zinc `#09090b` canvas with `#121215` elevated panels.
- **Strict Semantic Pairing:** Every `bg-primary` element is explicitly paired with `text-primary-foreground` to ensure WCAG 2.1 AA compliance across all 870+ OKLCH community themes.
- **Tailwind CSS v4 Native:** Pure `@theme inline` variables with zero legacy configuration.

---

*Authored for the Ethereal UI Ecosystem & Enterprise Human Resource Management.*
