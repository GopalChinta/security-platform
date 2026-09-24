# Deep Trace Cybernetics — Multi-Tenant Security Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-indigo.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-38%20Passed-brightgreen.svg)]()
[![Security](https://img.shields.io/badge/Tenant%20Isolation-Enforced-success.svg)]()

A complete, production-quality, runnable Full-Stack Multi-Tenant Security Management Platform built for **Deep Trace Cybernetics**.

The platform provides centralized security posture monitoring, phishing simulation campaign coordination, user management, security incident event triage, immutable audit logging, role-based access control (RBAC), and strict multi-tenant data isolation.

---

## Table of Contents

1. [Project Overview & Key Features](#1-project-overview--key-features)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Prerequisites & Environment Setup](#4-prerequisites--environment-setup)
5. [Database Migrations & Seeding](#5-database-migrations--seeding)
6. [Running the Application](#6-running-the-application)
7. [Sample Credentials Table](#7-sample-credentials-table)
8. [Multi-Tenant Isolation & Security Model](#8-multi-tenant-isolation--security-model)
9. [Automated Testing & Security Verification](#9-automated-testing--security-verification)
10. [Technical Assessment Questions](#10-technical-assessment-questions)
    * [Scaling to 1,000 Tenants and 1M Users](#scaling-to-1000-tenants-and-1m-users)
    * [JWT Revocation Strategies and Tradeoffs](#jwt-revocation-strategies-and-tradeoffs)
    * [Production HTTP 500 Incident Troubleshooting Playbook](#production-http-500-incident-troubleshooting-playbook)
11. [5–10 Minute Assessment Demonstration Script](#11-510-minute-assessment-demonstration-script)

---

## 1. Project Overview & Key Features

* **Multi-Tenant Operations**: Complete isolation between organizations (`Acme Security Corp` & `Globex Security Solutions`). Zero information leakage across tenants.
* **JWT-Based Authentication**: Secure token generation containing verified user and tenant claims with password hashing via bcrypt (10 rounds).
* **Role-Based Access Control (RBAC)**: Enforces `ADMIN`, `MANAGER`, and `USER` permission matrices with dedicated middleware and database authorization.
* **Campaign Management & State Machine**: Full CRUD with structured status transitions (`DRAFT` → `ACTIVE` → `COMPLETED`/`CANCELLED`) and cross-tenant user assignment guards.
* **Security Incident Tracking**: Server-side filtering, severity classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and status resolution workflows.
* **Immutable Audit Trail**: Automatic server-side auditing of logins, failures, campaign mutations, user provisioning, and incident resolution with client IP and structured JSON metadata.
* **Live Penetration & Isolation Lab**: Built-in interactive security testing terminal in the UI to demonstrate and verify real-time cross-tenant access rejection (e.g. attempting to read foreign campaign ID `201`).
* **OpenAPI 3.0 Documentation**: Interactive Swagger UI at `/api/docs`.

---

## 2. Technology Stack

### Backend
* **Node.js 22+ & TypeScript**
* **Express.js** (modular controller/service/router architecture)
* **PostgreSQL** & **Prisma ORM**
* **JSON Web Tokens (jsonwebtoken)** & **bcryptjs**
* **Zod** (runtime validation for request bodies, URL params, and query filters)
* **Helmet** (HTTP security headers) & **CORS**
* **express-rate-limit** (Strict auth endpoint limits & global API limiters)
* **Morgan & Structured JSON Logger**
* **Jest & Supertest** (38 automated unit & integration security tests)

### Frontend
* **React 18 & TypeScript**
* **Vite**
* **React Router v6** (Protected routes with role guards)
* **TanStack Query v5** (Server state management, caching, and mutations)
* **Axios** (Centralized API client with auth interceptors)
* **Lucide React** (Security & operations iconography)
* **Custom Cybernetic Dark Design System** (Glassmorphic cards, glowing status tags, micro-animations, accessible dialogs)

---

## 3. System Architecture

```mermaid
graph TD
    Client[Web Browser / React Frontend] -->|HTTPS / Bearer JWT| Proxy[Vite / Nginx Reverse Proxy]
    Proxy -->|/api/*| App[Express Backend]
    
    subgraph Express Backend
        MW1[Helmet & CORS]
        MW2[Rate Limiter]
        MW3[Request Logger]
        MW4[Auth Middleware - Token Verification]
        MW5[RBAC Guard - Role Authorization]
        MW6[Zod Request Validator]
        App --> MW1 --> MW2 --> MW3 --> MW4 --> MW5 --> MW6
        
        MW6 --> Controllers[Module Controllers]
        Controllers --> Services[Business Services]
        Services --> TenantGuard[Strict Tenant Isolation: where tenantId = authUser.tenantId]
        Services --> AuditLogger[Async Audit Logger]
    end

    TenantGuard -->|Parameterized SQL| Prisma[Prisma ORM]
    AuditLogger -->|Insert Audit Log| Prisma
    Prisma --> DB[(PostgreSQL Database)]
```

### Database Entity Relationship Diagram

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

## 4. Prerequisites & Environment Setup

### Prerequisites
* **Node.js**: v20.x or v22.x
* **npm**: v10.x+
* **PostgreSQL**: v15+ (Running locally on `localhost:5432` OR via Docker)

### Environment Files
Create `.env` in both `./backend` and `./frontend` (pre-configured templates are provided in `.env.example`).

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

## 5. Database Migrations & Seeding

Run the unified setup command to generate the Prisma client, apply database migrations, and seed sample multi-tenant data:

```bash
# From the root directory:
npm run db:setup

# OR navigate to backend:
cd backend
npm install
npm run db:setup
```

The seed script initializes two distinct organizations (`Acme Security Corp` and `Globex Security Solutions`), active campaigns (including **Globex Campaign ID `201`** for cross-tenant testing), security events, and audit logs.

---

## 6. Running the Application

### Option A: Local Development (Concurrent)
```bash
# 1. Install root dependencies
npm install

# 2. Start both backend and frontend concurrently
npm run dev
```

* **Frontend Dashboard**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`
* **Interactive Swagger Documentation**: `http://localhost:5000/api/docs`
* **Health Check**: `http://localhost:5000/health`

### Option B: Docker Compose
```bash
docker compose up --build -d
```
* **Frontend**: `http://localhost:5173`
* **Backend**: `http://localhost:5000`
* **PostgreSQL**: `localhost:5432`

---

## 7. Sample Credentials Table

| Tenant Name | Role | Email | Password | Seed ID | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Acme Security Corp** | `ADMIN` | `admin@acme.com` | `Admin@123` | `user-acme-admin` | Full organization admin |
| **Acme Security Corp** | `MANAGER` | `manager@acme.com` | `Manager@123` | `user-acme-manager` | Campaign operator & audit viewer |
| **Acme Security Corp** | `USER` | `user@acme.com` | `User@123` | `user-acme-user` | Standard simulation target |
| **Acme Security Corp** | `USER` | `analyst@acme.com` | `Analyst@123` | `user-acme-analyst` | Security analyst user |
| **Globex Security Solutions** | `ADMIN` | `admin@globex.com` | `Admin@123` | `user-globex-admin` | Foreign tenant admin |
| **Globex Security Solutions** | `MANAGER` | `manager@globex.com` | `Manager@123` | `user-globex-manager` | Foreign tenant manager |
| **Globex Security Solutions** | `USER` | `user@globex.com` | `User@123` | `user-globex-user` | Foreign tenant user |

*(Tip: The login screen contains 1-click Quick Login buttons for all demo accounts).*

---

## 8. Multi-Tenant Isolation & Security Model

Multi-tenancy is enforced at the core data-access layer rather than relying on route conventions:

1. **Derived Context**: `tenantId` is extracted strictly from the validated cryptographic JWT payload on each request. The backend rejects or ignores any client-supplied `tenantId` in request bodies or query parameters.
2. **Tenant-Aware Queries**: Every single read, update, or delete query executes with `where: { id, tenantId: req.user.tenantId }`.
3. **Zero Information Leakage**: If an attacker under Tenant A requests a resource belonging to Tenant B (e.g., `GET /api/campaigns/201`), the server returns `404 Not Found` (`CAMPAIGN_NOT_FOUND`). It never reveals whether the ID exists in another tenant.
4. **Foreign Key Cross-Tenant Guards**: When assigning users to campaigns (`POST /api/campaigns/:id/users`), the service validates that both the campaign and the target user belong to `req.user.tenantId`. Attempting to assign a Tenant B user to a Tenant A campaign results in an immediate 404.

---

## 9. Automated Testing & Security Verification

The backend includes a 38-test automated test suite covering all security, RBAC, state transitions, and cross-tenant attack vectors.

Run tests:
```bash
npm run test --prefix backend
```

### Key Test Suites:
* `tests/security-tenant-isolation.test.ts`:
  * `Tenant A user -> Tenant B campaign (ID: 201)` = **404 Not Found (Denied)**
  * `Tenant A manager -> Tenant B campaign (ID: 201)` = **404 Not Found (Denied)**
  * `Tenant A admin -> Tenant B campaign (ID: 201)` = **404 Not Found (Denied)**
  * `Tenant A admin -> DELETE Tenant B campaign (ID: 201)` = **404 Not Found (Denied)**
  * `Tenant A admin -> Tenant B user` = **404 Not Found (Denied)**
  * `Tenant A admin -> Tenant B security event` = **404 Not Found (Denied)**
  * `Tenant A admin -> Tenant B audit log` = **404 Not Found (Denied)**
  * `Tenant A admin -> Assign Tenant B user to Tenant A campaign` = **Denied (USER_NOT_FOUND)**
  * `Request body tenantId spoofing attempt` = **Ignored, overridden by auth tenant**
* `tests/auth-rbac.test.ts`:
  * Password complexity and bcrypt verification.
  * Role permissions (`USER cannot delete campaign`, `USER cannot manage users`, `USER cannot view audit logs`, `MANAGER cannot delete campaign`).
  * Unauthenticated and tampered JWT rejections.
* `tests/campaigns.test.ts`:
  * State transition machine verification (`DRAFT` → `ACTIVE` → `COMPLETED`).
  * Invalid state transitions rejected with `400 Bad Request`.

---

## 10. Technical Assessment Questions

### Scaling to 1,000 Tenants and 1M Users

#### 1. Database Optimization & Indexing
* **Composite Tenant B-Tree Indexes**: Maintain composite indexes `(tenant_id, created_at DESC)`, `(tenant_id, status)`, and `(tenant_id, email)` so lookups scan only the subset of rows belonging to that tenant.
* **Declarative PostgreSQL Table Partitioning**: As data scales into tens of millions of audit logs and events, implement **List or Hash Partitioning by `tenant_id`**. PostgreSQL will perform partition pruning, ensuring queries only scan the table partition for the querying tenant.
* **Connection Pooling**: Place **PgBouncer** in front of PostgreSQL in transaction pooling mode to manage thousands of concurrent API connections while maintaining a lean pool of 50–100 database connections.
* **Read Replicas**: Direct dashboard aggregation queries and read-heavy list endpoints to read replicas using Prisma's multi-datasource or replica extension, reserving the primary instance for mutations.

#### 2. Caching Strategy
* **Redis Caching**: Cache hot tenant metadata (tenant profile, role matrices, user permissions) with short TTLs (5–15 minutes) and cache invalidation on user/tenant mutation.
* **Cache Key Namespacing**: Namespace all Redis keys by tenant ID (`tenant:{tenantId}:user:{userId}`) to prevent accidental cross-tenant cache contamination.

#### 3. API & Stateless Horizontal Scaling
* **Stateless API Nodes**: The Express API instances are completely stateless. Place nodes behind an Application Load Balancer (AWS ALB, Cloudflare, or NGINX) with round-robin or least-connections balancing and autoscaling based on CPU/RAM thresholds.
* **Asynchronous Processing for Heavy Operations**: Offload batch operations (e.g. enrolling 10,000 users into a phishing campaign, delivering webhook notifications) to **BullMQ / Redis queues** processed by background worker nodes.

#### 4. Observability
* Distributed tracing with **OpenTelemetry**, centralized metric aggregation with **Prometheus & Grafana**, and structured log shipping with **Vector / ELK / Loki**.

---

### JWT Revocation Strategies and Tradeoffs

| Strategy | Mechanism | Pros | Cons / Tradeoffs |
| :--- | :--- | :--- | :--- |
| **1. Short-Lived Access Tokens + Refresh Token Rotation** *(Recommended)* | Access tokens expire in 10–15 minutes. Long-lived refresh tokens stored securely with one-time rotation and DB session tracking. | Near real-time revocation on next refresh. Minimal DB load during standard API calls. | Up to 10–15 min window before an active stolen access token expires unless combined with a denylist. |
| **2. Token Versioning (`tokenVersion` in User record)** | User record has an integer `tokenVersion`. JWT contains `tokenVersion`. On logout or password reset, increment `tokenVersion`. Middleware checks payload version against DB. | Instantly invalidates all active tokens for a user across all devices upon password reset or admin revoke. | Requires a fast database read or cached Redis read on authenticated requests. |
| **3. Redis Denylist / Blocklist** | On logout or token compromise, write the JWT ID (`jti`) or token signature to Redis with a TTL equal to the token's remaining lifespan. Middleware checks `redis.exists(jti)`. | Immediate revocation of specific compromised tokens while keeping tokens stateless otherwise. | Requires an in-memory Redis cluster; introduces an external network hop per authenticated request. |
| **4. Server-Side Session Store** | Store all active session IDs in Redis / DB; token is simply a signed session reference. | Absolute real-time control, instant termination of any session. | Reintroduces statefulness; increases database/Redis load on every request. |

**Recommended Production Approach**: A hybrid of **Strategy 1 and 2**: Issue 15-minute access tokens with refresh token rotation, while maintaining a `tokenVersion` or Redis revocation denylist for emergency security revocations.

---

### Production HTTP 500 Incident Troubleshooting Playbook

When an API experiences a sudden spike in HTTP 500 errors, execute this structured incident response workflow:

```mermaid
flowchart TD
    A[1. Triage & Alert Detection] --> B[2. Identify Blast Radius & Affected Route]
    B --> C[3. Correlate Logs via Request ID]
    C --> D{Root Cause Category}
    
    D -->|Recent Deployment Bug| E[Roll Back Deployment]
    D -->|Database Connection Exhaustion| F[Scale Connection Pool / Kill Stale Locks]
    D -->|Third-Party Dependency Outage| G[Activate Circuit Breaker / Fallback]
    D -->|Data Migration / Schema Mismatch| H[Roll Back Migration / Apply Hotfix]
    
    E --> I[4. Safe Reproduction & Staging Validation]
    F --> I
    G --> I
    H --> I
    
    I --> J[5. Deploy Verified Fix & Regression Tests]
    J --> K[6. Monitor Recovery Metrics & Post-Mortem]
```

1. **Triage & Metric Inspection**: Open Grafana / APM dashboards. Determine error rate (percentage of 500s vs total traffic), error distribution across endpoints, and latency anomalies.
2. **Identify Affected Route & Scope**: Determine whether 500 errors affect all endpoints (global failure) or a specific endpoint (e.g. `POST /api/campaigns/:id/users`). Check if errors are tenant-specific or cross-tenant.
3. **Log Correlation via Request ID (`x-request-id`)**: Query structured JSON logs in Loki/Datadog for `level: "error"`. Extract the stack trace, error code, database query, and caller context.
4. **Check Recent Changes**: Inspect the CI/CD deployment pipeline for releases in the last 60 minutes. Check recent Prisma migrations or environment configuration updates.
5. **Database & Infrastructure Health**:
   * Inspect PostgreSQL active connection count (`SELECT count(*) FROM pg_stat_activity;`).
   * Check for long-running locks or table locks (`pg_locks`).
   * Verify CPU, memory, and disk IOPS metrics on the database instance.
6. **Mitigate Immediate Impact**:
   * If caused by a recent code deploy: **Immediately roll back** to the last known stable container image.
   * If caused by connection pool starvation: Restart stalled pool workers or increase PgBouncer capacity.
7. **Root Cause Analysis & Regression Testing**: Reproduce the failure in an isolated staging environment with test fixtures. Write an automated unit/integration test reproducing the exact failure mode.
8. **Deploy Fix & Post-Mortem**: Deploy the hotfix, monitor error rates to ensure stabilization (0% 500s), and conduct a blameless post-mortem document.

---

## 11. 5–10 Minute Assessment Demonstration Script

Follow this walkthrough to demonstrate all platform features:

1. **Step 1: Launch Application & Database**
   * Run `npm run dev` (or `docker compose up -d`).
   * Open `http://localhost:5173` in your browser.

2. **Step 2: Sign In as Tenant A Admin (`Acme Security Corp`)**
   * Click **Acme Admin** quick-fill button (`admin@acme.com` / `Admin@123`).
   * Observe the SOC Dashboard with active campaign statistics, threat counts, and the live activity stream.

3. **Step 3: User & Campaign Management**
   * Navigate to **Users & Access**: view Acme identities (`Alice Walker`, `Bob Martinez`, `Charlie Hayes`, `Diana Prince`).
   * Click **Create User Identity**: create `john@acme.com` with role `USER`.
   * Navigate to **Campaigns**: click **Create Campaign** (`Q2 Zero-Trust Drill`).
   * Open campaign details: click **Assign User** and assign `Diana Prince`.

4. **Step 4: Security Events & Audit Trail**
   * Navigate to **Security Events**: filter by `CRITICAL` severity. Click **Resolve** on an incident to update its status.
   * Navigate to **Audit Trail**: inspect the automatically generated audit logs for user creation, campaign creation, and resolution. Click **JSON** to inspect structured metadata.

5. **Step 5: Switch to Tenant A User (RBAC Demonstration)**
   * Click **Logout** in top navigation.
   * Click **Acme User** (`user@acme.com` / `User@123`).
   * Observe that administrative sections (**Users** and **Audit Trail**) are marked as restricted and blocked by backend route authorization.

6. **Step 6: Live Cross-Tenant Isolation Verification**
   * Navigate to the **Security Isolation Lab** (`/cross-tenant-demo`).
   * Click **Run Mandatory Isolation Assessment**.
   * Observe the automated attack vectors:
     * `GET /api/campaigns/201` (Globex Campaign) returns **404 Not Found**.
     * `DELETE /api/campaigns/201` returns **404 Not Found**.
     * `GET /api/users/user-globex-user` returns **404 Not Found**.
     * `GET /api/security-events/evt-globex-01` returns **404 Not Found**.
     * `POST /api/campaigns` with injected `tenantId: tenant-globex-sec` binds safely to `tenant-acme-corp`.
   * Confirm that zero information is leaked across tenant boundaries.
