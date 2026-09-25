# Deep Trace Cybernetics — Enterprise Multi-Tenant Security Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-indigo.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-38%20Passed-brightgreen.svg)]()
[![Security](https://img.shields.io/badge/Tenant%20Isolation-Enforced-success.svg)]()
[![Responsive](https://img.shields.io/badge/Responsive-Desktop%20%7C%20Tablet%20%7C%20Mobile-blueviolet.svg)]()

A modern, production-grade **Multi-Tenant Security Management & Phishing Simulation Platform** designed for enterprise Security Operations Centers (SOC). The platform provides unified threat posture monitoring, security campaign simulation and lifecycle tracking, real-time incident triage, tamper-proof forensic audit logging, role-based access control (RBAC), and strict data isolation across organizations.

---

## Table of Contents

1. [Platform Overview & Key Capabilities](#1-platform-overview--key-capabilities)
2. [Module & Page-by-Page Walkthrough](#2-module--page-by-page-walkthrough)
   - [Authentication & Quick Demo Access](#authentication--quick-demo-access-login)
   - [Executive SOC Dashboard](#executive-soc-dashboard-dashboard)
   - [Campaign Management & Simulation Coordinator](#campaign-management--simulation-coordinator-campaigns)
   - [Security Incident Events & Triage](#security-incident-events--triage-security-events)
   - [Immutable Audit Trail](#immutable-audit-trail-audit-logs)
   - [Identity & Access Management (RBAC)](#identity--access-management-users)
   - [Security Isolation & Penetration Testing Lab](#security-isolation--penetration-testing-lab-cross-tenant-demo)
3. [System Architecture & Data Model](#3-system-architecture--data-model)
4. [Multi-Tenant Data Isolation & Security Safeguards](#4-multi-tenant-data-isolation--security-safeguards)
5. [Technology Stack](#5-technology-stack)
6. [Prerequisites & Environment Configuration](#6-prerequisites--environment-configuration)
7. [Database Setup & Seed Data](#7-database-setup--seed-data)
8. [Running the Application](#8-running-the-application)
9. [Pre-Configured Demo Credentials](#9-pre-configured-demo-credentials)
10. [Automated Test Suite & Verification](#10-automated-test-suite--verification)
11. [Scalability, JWT Strategy & Production Troubleshooting](#11-scalability-jwt-strategy--production-troubleshooting)

---

## 1. Platform Overview & Key Capabilities

- **Strict Multi-Tenant Row-Level Security**: Zero information leakage across independent tenant organizations (`Acme Security Corp` & `Globex Security Solutions`).
- **Cryptographic JWT Authentication**: State-verified JWT claims with bcrypt password hashing (10 rounds) and automatic token-derived authorization context.
- **Role-Based Access Control (RBAC)**: Fine-grained permission matrices enforcing `ADMIN`, `MANAGER`, and `USER` privileges on both frontend routes and backend APIs.
- **Enterprise Design System**: Modern cyber-blue and crisp white visual aesthetic with smooth micro-animations, full-card border glows, and seamless responsive design across Desktop, Tablet, and Mobile.
- **Interactive Visualizations**: Custom SVG Donut Charts with center summary counters, connector callouts, and synchronized hover highlighting.
- **Single-Row Streamlined Filters**: Clean, gap-free toolbars unifying full-text search and multi-criteria status/severity dropdowns.
- **Interactive Security Isolation Lab**: Live attack simulation console demonstrating real-time rejection of cross-tenant IDOR probes.

---

## 2. Module & Page-by-Page Walkthrough

### Authentication & Quick Demo Access (`/login`)
- **Split-Screen Design**: High-contrast branding presentation alongside a clean, focused sign-in card.
- **Interactive Security Controls**: Toggle password visibility (`Eye`/`EyeOff`), real-time credential validation, and inline error handling.
- **Quick Demo Access Modal**: Instant 1-click login buttons for all sample accounts (Acme Admin, Acme Manager, Acme User, Globex Admin) without manual password typing.

### Executive SOC Dashboard (`/dashboard`)
- **Smart Metric Stat Cards**:
  - Compact, high-information-density cards displaying Total Campaigns, Active Drills, Security Incidents, and Registered Identities.
  - 360° colored borders matching metric context with live status badges (*"Live"*, *"Critical"*, *"Secured"*, *"RBAC Active"*).
- **Campaign Distribution Donut Chart**:
  - High-precision SVG donut chart visualizing registered campaigns by status (`Active` 🟢, `Draft` 🔘, `Completed` 🔵, `Cancelled` 🔴).
  - Center counter displaying `"7 Total Registered"` with animated count-up.
  - Thin connector lines with percentage callout tags.
  - Interactive right-side status breakdown with bidirectional hover sync.
- **Threat Posture & Critical Events**: Live summary of open high/critical incidents with one-click navigation to triage.
- **Real-Time Activity Feed**: Live stream of system actions, authentication events, and status updates.

### Campaign Management & Simulation Coordinator (`/campaigns`)
- **Simulation Coordination**: Create, configure, launch, complete, and cancel phishing security drills.
- **Single-Row Filter Toolbar**: Edge-to-edge search bar paired directly with status filter dropdowns (`All`, `Draft`, `Active`, `Completed`, `Cancelled`) and reset triggers with zero wasted space.
- **Target User Enrollment**: Modal to enroll organization identities into active campaigns with cross-tenant isolation guards.
- **Lifecycle State Enforcement**: Guarded transitions preventing invalid mutations (e.g. `COMPLETED` campaigns cannot be re-activated).

### Security Incident Events & Triage (`/security-events`)
- **Incident Monitoring**: Centralized log of detected anomalous activity, suspicious sign-ins, and simulated phishing interactions.
- **Severity Triage**: Filter events by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`).
- **Actionable Workflows**: Resolve incidents with one click, automatically recording audit logs and updating threat counts.

### Immutable Audit Trail (`/audit-logs`)
- **Tamper-Proof Audit Logging**: Forensic history capturing every user login, campaign change, permission update, and incident resolution.
- **Rich Metadata Inspection**: Expandable structured JSON payload viewer displaying before/after state snapshots, client IP, user agents, and actor IDs.
- **Single-Row Query Toolbar**: Filter by action types (`USER_LOGIN`, `CAMPAIGN_CREATE`, `INCIDENT_RESOLVE`, etc.) and target resource entities.

### Identity & Access Management (`/users`)
- **Directory Management**: Search and filter organizational users by role (`ADMIN`, `MANAGER`, `USER`).
- **User Provisioning**: Admin modal to provision new user identities with predefined roles and email addresses.
- **RBAC Enforcement**: Managers and standard users are automatically restricted from administrative identity actions.

### Security Isolation & Penetration Testing Lab (`/cross-tenant-demo`)
- **Live Attack Simulation Terminal**: Interactive penetration testing dashboard allowing users to trigger live cross-tenant API requests (e.g. attempting to read or delete Foreign Tenant Campaign `ID: 201`).
- **Verification Matrix**: Real-time response inspection proving that cross-tenant queries return **404 Not Found** with zero information leakage.

---

## 3. System Architecture & Data Model

```mermaid
graph TD
    Client[React 18 + Vite SPA] -->|HTTPS + Bearer JWT| Proxy[Reverse Proxy / API Gateway]
    Proxy -->|/api/*| ExpressApp[Express.js REST API]
    
    subgraph Security Middleware Pipeline
        ExpressApp --> Helmet[Helmet Security Headers]
        Helmet --> CORS[CORS Whitelist]
        CORS --> RateLimit[express-rate-limit]
        RateLimit --> Logger[Structured Request Logger]
        Logger --> AuthGuard[JWT Verification Middleware]
        AuthGuard --> RBACGuard[RBAC Permission Guard]
        RBACGuard --> ZodValidate[Zod Schema Validation]
    end
    
    subgraph Data Access Layer
        ZodValidate --> Controllers[Modular Controllers]
        Controllers --> Services[Business Logic Services]
        Services --> TenantIsolation[Tenant Isolation Filter: where tenantId = token.tenantId]
        Services --> AuditService[Async Audit Logger]
    end
    
    TenantIsolation --> Prisma[Prisma ORM Client]
    AuditService --> Prisma
    Prisma --> DB[(PostgreSQL Database)]
```

### Entity Relationship Diagram

```mermaid
erDiagram
    TENANT ||--o{ USER : contains
    TENANT ||--o{ CAMPAIGN : owns
    TENANT ||--o{ SECURITY_EVENT : monitors
    TENANT ||--o{ AUDIT_LOG : tracks
    
    USER ||--o{ CAMPAIGN : creates
    USER ||--o{ CAMPAIGN_USER : assigned_to
    USER ||--o{ AUDIT_LOG : initiates
    
    CAMPAIGN ||--o{ CAMPAIGN_USER : enrolls
```

---

## 4. Multi-Tenant Data Isolation & Security Safeguards

1. **Token-Derived Tenant Scope**: The user's `tenantId` is extracted solely from verified cryptographic JWT claims on the server. Any client-supplied `tenantId` in request bodies or query strings is stripped or ignored.
2. **Mandatory Tenant Scoping**: Every database read, update, and delete query is parameterized with `where: { id, tenantId: req.user.tenantId }`.
3. **Zero Information Disclosure (404 vs 403)**: When a user attempts to access a resource belonging to another organization, the API returns `404 Not Found` rather than `403 Forbidden`. This prevents attackers from enumerating valid IDs belonging to other tenants.
4. **Foreign Key Integrity Validation**: Cross-entity mutations (such as assigning users to campaigns) explicitly verify that both the campaign and the assigned user belong to the authenticated user's `tenantId`.

---

## 5. Technology Stack

### Backend
- **Runtime**: Node.js (v20+ / v22+) & TypeScript
- **Framework**: Express.js (Modular Router-Controller-Service pattern)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: Zod schema validation for params, queries, and request bodies
- **Security**: Helmet, CORS, and `express-rate-limit`
- **Testing**: Jest & Supertest (38 automated unit & integration security tests)

### Frontend
- **Framework**: React 18 & TypeScript (Vite bundler)
- **Routing**: React Router v6 with authenticated and role-guarded route boundaries
- **Server State**: TanStack Query v5 (automatic caching, invalidation, and optimistic updates)
- **HTTP Client**: Axios with centralized auth interceptors
- **Icons**: Lucide React
- **Styling**: Vanilla CSS design system with custom CSS variables, responsive drawer sidebar, and keyframe animations

---

## 6. Prerequisites & Environment Configuration

### Prerequisites
- **Node.js**: v20.x or v22.x
- **npm**: v10.x+
- **PostgreSQL**: v15+ (Running locally on `5432` or via Docker)

### Environment Files

#### `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/security_platform?schema=public"
JWT_SECRET="deep-trace-cybernetics-ultra-secure-jwt-secret-key-2026-xyz!"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=50
```

#### `frontend/.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 7. Database Setup & Seed Data

Run the database migration and seeding command:

```bash
# From the root directory:
npm run db:setup
```

*Or manually in the `backend` folder:*
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

This initializes the `Acme Security Corp` and `Globex Security Solutions` organizations along with sample campaigns (including **Globex Campaign ID `201`** for cross-tenant testing), security incidents, and audit logs.

---

## 8. Running the Application

### Concurrent Development Mode (Recommended)
```bash
# 1. Install root & workspace dependencies
npm install

# 2. Run backend (port 5000) and frontend (port 5173/5174) concurrently
npm run dev
```

- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Interactive Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check Endpoint**: `http://localhost:5000/health`

### Docker Compose
```bash
docker compose up --build -d
```

---

## 9. Pre-Configured Demo Credentials

| Organization | Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Acme Security Corp** | `ADMIN` | `admin@acme.com` | `Admin@123` | Full administrative access to Acme |
| **Acme Security Corp** | `MANAGER` | `manager@acme.com` | `Manager@123` | Campaign management & audit viewing |
| **Acme Security Corp** | `USER` | `user@acme.com` | `User@123` | Standard simulation target user |
| **Acme Security Corp** | `USER` | `analyst@acme.com` | `Analyst@123` | Security analyst user |
| **Globex Security Solutions** | `ADMIN` | `admin@globex.com` | `Admin@123` | Foreign organization admin |
| **Globex Security Solutions** | `MANAGER` | `manager@globex.com` | `Manager@123` | Foreign organization manager |
| **Globex Security Solutions** | `USER` | `user@globex.com` | `User@123` | Foreign organization user |

> **Quick Tip:** Use the **Quick Demo Access** button on the top-right of the login page to sign in with any role in one click.

---

## 10. Automated Test Suite & Verification

The test suite contains **38 automated security and integration tests** validating multi-tenant isolation, RBAC constraints, and state transitions.

```bash
# Run all backend tests
npm run test --prefix backend
```

### Key Tested Security Invariants
- `Tenant A User -> Foreign Tenant Campaign (ID 201)` $\rightarrow$ **404 Not Found (Denied)**
- `Tenant A Admin -> Delete Foreign Tenant Campaign (ID 201)` $\rightarrow$ **404 Not Found (Denied)**
- `Tenant A Admin -> Assign Foreign Tenant User to Acme Campaign` $\rightarrow$ **Denied (USER_NOT_FOUND)**
- `Body Spoofing (injected foreign tenantId)` $\rightarrow$ **Ignored; overridden by token context**
- `Unauthenticated / Tampered JWT` $\rightarrow$ **401 Unauthorized**
- `USER Role Access to Admin Endpoints` $\rightarrow$ **403 Forbidden**

---

## 11. Scalability, JWT Strategy & Production Troubleshooting

### Scaling to 1,000 Tenants & 1M Users
1. **Database Partitioning & Indexing**: Implement PostgreSQL declarative hash/list partitioning on `tenant_id` for high-volume audit logs and events. Maintain composite B-tree indexes `(tenant_id, created_at DESC)` and `(tenant_id, status)`.
2. **Connection Pooling**: Deploy **PgBouncer** in transaction pooling mode to scale connection capacity up to thousands of concurrent clients.
3. **Tenant-Namespaced Redis Caching**: Cache role permissions and tenant metadata using keys formatted as `tenant:{tenantId}:user:{userId}` with short TTLs.
4. **Asynchronous Background Processing**: Offload bulk simulation enrollments and email deliveries to **BullMQ** job queues.

### JWT Revocation Strategies
| Approach | Mechanism | Benefits | Tradeoffs |
| :--- | :--- | :--- | :--- |
| **Short-Lived Access + Refresh Rotation** *(Default)* | 15-minute access tokens with single-use rotating refresh tokens stored in DB. | Highly scalable, minimal DB overhead. | 15-minute window for active access tokens. |
| **User Token Versioning (`tokenVersion`)** | Integer column on User table verified against JWT claim. | Immediate revocation on password change or admin revoke. | Fast database lookup per authenticated request. |
| **Redis Denylist (`jti`)** | In-memory blacklist for revoked JWT IDs until expiry. | Real-time targeted token invalidation. | Requires Redis network hop. |

### Production HTTP 500 Incident Playbook
1. **Triage & Blast Radius**: Check Grafana APM for error rate spikes and determine if errors are isolated to a single route or tenant.
2. **Log Correlation**: Query structured logs in Loki/Datadog filtering by `x-request-id` to capture full stack traces and SQL query payloads.
3. **Database Health**: Verify PostgreSQL connection pool saturation, long-running locks (`pg_locks`), and CPU/memory utilization.
4. **Immediate Mitigation**: If triggered by a new release, execute immediate rollback to the previous container version; if connection pool exhausted, restart hung workers and adjust pool size.
5. **Regression Prevention**: Reproduce the incident in a staging environment and write an automated test covering the failure mode before redeploying.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
