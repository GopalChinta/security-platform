# Multi-Tenant Security Platform — Backend API

Enterprise-grade REST API powering the Multi-Tenant Security Operations Platform for Deep Trace Cybernetics.

## Tech Stack
* **Runtime**: Node.js v20+ / TypeScript
* **Framework**: Express.js
* **Database**: PostgreSQL with Prisma ORM
* **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
* **Validation**: Zod schema validation for body, params, and queries
* **Security**: Helmet, CORS, express-rate-limit, strict tenant isolation
* **Documentation**: OpenAPI 3.0 via Swagger UI (`/api/docs`)
* **Testing**: Jest + Supertest (38 passing unit/integration/security tests)

## Directory Structure
```text
src/
├── config/          # Environment, Prisma client, logger
├── middleware/      # Auth (JWT/RBAC), error handling, rate limiting, validation
├── utils/           # Password hashing, JWT signer, pagination, audit logger
├── types/           # Type definitions and Express augmentation
├── modules/
│   ├── auth/            # Login, /me profile
│   ├── users/           # IAM user CRUD & role assignment
│   ├── campaigns/       # Security simulation CRUD, status machine, user assignment
│   ├── security-events/ # Incident logging, severity triage
│   ├── audit-logs/      # Immutable audit trail
│   └── dashboard/       # Aggregated SOC metrics & telemetry
├── app.ts           # Express application configuration
└── server.ts        # Server bootstrap & graceful shutdown
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your PostgreSQL database URL:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/security_platform?schema=public"
JWT_SECRET="deep-trace-cybernetics-ultra-secure-jwt-secret-key-2026-xyz!"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Migration & Seeding
```bash
npm run db:setup
# Or individually:
# npx prisma migrate dev --name init
# npm run db:seed
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

API will be live at `http://localhost:5000`
Interactive Swagger Docs at `http://localhost:5000/api/docs`
Health check at `http://localhost:5000/health`
