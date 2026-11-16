# 🌌 Ethereal HRMS — Full-Stack Enterprise People & Talent Operating System

[![Ethereal UI](https://img.shields.io/badge/UI_Engine-Ethereal_UI_v0.0.7-blue?style=flat-square)](https://ethereal-ui.saefulrohman.dev)
[![Go Version](https://img.shields.io/badge/Backend-Go_1.25-00ADD8?style=flat-square&logo=go)](https://go.dev)
[![Astro Version](https://img.shields.io/badge/Frontend-Astro_5-FF5D01?style=flat-square&logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

**Ethereal HRMS** is an enterprise-grade, dark-first Human Resource Management & Talent Telemetry System built with **Astro**, **Go (Golang 1.25)**, **Supabase (PostgreSQL)**, and styled strictly according to **[Ethereal UI](https://ethereal-ui.saefulrohman.dev)** (`@etherealui/react` v0.0.7) and **Tailwind CSS v4** design tokens.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend Layer (Astro 5 + React 19 + Ethereal UI v0.0.7)"]
        UI["Ethereal UI Telemetry Canvas (#09090b)"]
        Components["42+ Primitives & Blocks (AreaStatisticChart, DonutStatisticChart, MultiMetricGrid, KanbanBoard)"]
        AuthCtx["JWT Auth Context & Role Switcher"]
        APIClient["Typed REST Client (src/lib/api.ts)"]
    end

    subgraph Backend["Backend Layer (Go 1.25 REST API)"]
        Router["Gin HTTP Router (:8080)"]
        Middleware["JWT Middleware + Strict RBAC Proxy"]
        Handlers["Domain Handlers (Dashboard, Employees, Attendance, Leave, Payroll, ATS, OKRs, Expenses, Audit)"]
        Store["Data Engine (Dual-mode: Supabase PostgreSQL + Seeded In-Memory Sync)"]
    end

    subgraph Database["Database Layer (Supabase PostgreSQL)"]
        PG["PostgreSQL Relational Engine"]
        RLS["Row Level Security (RLS) Policies"]
        Seeds["Enterprise Seed Data (Departments, Roles, Employees, Timesheets, Cycles)"]
    end

    UI --> Components
    Components --> AuthCtx
    AuthCtx --> APIClient
    APIClient -->|JSON / Bearer JWT| Router
    Router --> Middleware
    Middleware --> Handlers
    Handlers --> Store
    Store -->|DATABASE_URL| PG
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

---

## 🔐 Default Demo Accounts & Personas

Each demo persona can be selected with **1-click** on the Login page or toggled live via the top-bar role selector:

| Role | Email | Password | Scope & Permissions |
|---|---|---|---|
| **Super Admin** | `admin@ethereal.hr` | `password123` | Full access across all 10 modules, employee deletion, and system configuration. |
| **HR Director** | `hr@ethereal.hr` | `password123` | Manage employees, execute payroll calculations, approve leaves, post requisitions. |
| **Team Lead / Manager** | `devlead@ethereal.hr` | `password123` | Department attendance review, team leave approvals, evaluate team OKRs. |
| **Senior Employee** | `employee@ethereal.hr` | `password123` | Self clock in/out, submit vacation requests, view personal payslips, adjust goal sliders. |

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22.16.0)
- **pnpm**: v9+ (tested on v10.22.0)
- **Go**: v1.24+ (tested on v1.25.1)
- **Git**: Any modern version

### 2. Backend Setup (Go REST API)
```bash
# Navigate to backend directory
cd backend

# (Optional) Copy environment template
cp .env.example .env

# Run Go backend server (starts on http://localhost:8080)
go run ./cmd/server
```

### 3. Frontend Setup (Astro + Ethereal UI)
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies (pnpm is recommended)
pnpm install

# Start development server (starts on http://localhost:4321)
pnpm dev

# Or build static production bundle
pnpm build
pnpm preview
```

### 4. Supabase Database Integration (Optional)
The backend includes an automatic hybrid engine: it runs out-of-the-box in seeded memory mode, and when you supply your Supabase connection string, it connects directly:
1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Run `database/schema.sql` to initialize tables, relationships, and indexes.
4. Run `database/seed.sql` to populate sample enterprise data.
5. In `backend/.env`, set `DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`.

---

## 🎨 Ethereal UI Token Pairing Compliance

This project strictly adheres to `ETHEREAL_AGENT_GUIDE.md`:
- **Dark-First Canvas:** Deep zinc `#09090b` canvas with `#121215` elevated panels.
- **Strict Semantic Pairing:** Every `bg-primary` element is explicitly paired with `text-primary-foreground` to ensure WCAG 2.1 AA compliance across all 870+ OKLCH community themes.
- **Tailwind CSS v4 Native:** Pure `@theme inline` variables with zero legacy configuration.

---

## 📂 Project Structure

```
d:\Fullstack\hrms\
├── backend/
│   ├── cmd/server/main.go            # Entrypoint for Go HTTP server
│   ├── internal/
│   │   ├── config/config.go          # Environment configuration
│   │   ├── database/                 # Store interface, memory & Postgres engines
│   │   ├── handlers/                 # 10 enterprise REST handlers
│   │   ├── middleware/               # JWT authentication & strict RBAC proxy
│   │   ├── models/                   # Domain models & telemetry structures
│   │   └── routes/                   # Router configuration & API endpoint grouping
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # HRMSAppShell & AppContainer
│   │   │   ├── pages/                # Client-only React page wrappers
│   │   │   └── views/                # Complete views for all 10 modules
│   │   ├── layouts/RootLayout.astro  # Root HTML layout with dark theme & fonts
│   │   ├── lib/                      # Typed API client, Auth context, types
│   │   ├── pages/                    # Astro routes (/, /employees, /leave, etc.)
│   │   └── styles/globals.css        # Tailwind v4 & Ethereal UI style imports
│   ├── astro.config.mjs              # Astro 5 configuration with React & Tailwind v4
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.sql                    # Supabase / PostgreSQL DDL
│   └── seed.sql                      # Enterprise initial mock data
├── ETHEREAL_AGENT_GUIDE.md           # Single source of truth for Ethereal UI
└── README.md
```

---

*Authored for Ethereal UI Ecosystem & Enterprise Human Resource Management.*
