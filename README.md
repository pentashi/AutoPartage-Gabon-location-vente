# AutoPartage Gabon
Enterprise web platform for vehicle rent-to-own operations, fleet control, finance, and incident response in Gabon.

![Build](https://img.shields.io/badge/build-Cloud%20Build-blue)
![Version](https://img.shields.io/badge/version-0.1.0-informational)
![License](https://img.shields.io/badge/license-ISC-green)
![Coverage](https://img.shields.io/badge/coverage-not%20published-lightgrey)

## Overview
AutoPartage Gabon provides an operational system for managing drivers, vehicles, contracts, payments, GPS actions, maintenance workflows, notifications, and incidents from one admin web application.

It exists to replace fragmented manual workflows with auditable, role-based processes and API-driven integrations. It targets operations teams, fleet managers, accountants, administrators, and support stakeholders responsible for daily service continuity.

## Key Features
- Manage the full rent-to-own lifecycle: driver onboarding, vehicle assignment, contracts, and payment tracking.
- Monitor fleet status with GPS integration, including remote immobilization and release workflows.
- Execute maintenance workflows with escalation-aware status tracking.
- Handle incidents end-to-end with status transitions and role-scoped visibility.
- Enforce role-based access control, JWT cookie auth, CSRF protection, and request rate limiting.
- Deploy on GCP Cloud Run with Cloud SQL, Secret Manager, and Cloud Build automation.

## Architecture Overview
```text
Next.js Frontend (Cloud Run / localhost:3000)
          |
          v
Express + TypeScript API (Cloud Run / localhost:4000)
          |
          v
PostgreSQL (Cloud SQL in production, Docker Postgres locally)
```

Repository structure:
- `/frontend`: Next.js admin web app
- `/backend`: Express API + Prisma + business modules
- `/infra`: Docker and GCP Cloud Run deployment assets
- `/docs/mvp`: MVP scope, rules, integrations, and go-live documentation

## Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose (for local PostgreSQL/full-stack containers)
- GCP CLI (`gcloud`) for Cloud Run deployments

## Installation & Quick Start
```bash
git clone https://github.com/pentashi/AutoPartage-Gabon-location-vente.git
cd AutoPartage-Gabon-location-vente

# 1) Start PostgreSQL locally
docker compose up -d postgres

# 2) Backend setup
cd backend
npm install
cat > .env <<'ENV'
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autopartage
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
FRONTEND_ORIGIN=http://localhost:3000
GPS_COMMAND_TIMEOUT_MS=120000
MAINTENANCE_AUTO_IMMOBILIZATION_MIN_ESCALATION=3
ENV
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open a new terminal for the frontend:
```bash
cd frontend
npm install
cat > .env.local <<'ENV'
NEXT_PUBLIC_API_URL=http://localhost:4000
ENV
npm run dev
```

## Configuration
| Name | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | `development \| test \| production` | `development` | Backend runtime mode. |
| `PORT` | `number` | `4000` | Backend HTTP port. |
| `DATABASE_URL` | `string` | none | PostgreSQL connection string used by Prisma. |
| `JWT_ACCESS_SECRET` | `string` | none | Access token signing key. |
| `JWT_REFRESH_SECRET` | `string` | none | Refresh token signing key and session secret. |
| `ACCESS_TOKEN_TTL` | `string` | `15m` | Access token lifetime (ms-compatible format). |
| `REFRESH_TOKEN_TTL` | `string` | `7d` | Refresh token lifetime (ms-compatible format). |
| `FRONTEND_ORIGIN` | `string` | `http://localhost:3000` | Allowed CORS origin for backend. |
| `GPS_API_KEY` | `string` | none | Optional API key for external GPS provider integration. |
| `GPS_COMMAND_TIMEOUT_MS` | `number` | `120000` | Timeout for GPS command workflows in milliseconds. |
| `MAINTENANCE_AUTO_IMMOBILIZATION_MIN_ESCALATION` | `number` | `3` | Escalation threshold before auto-immobilization logic. |
| `NEXT_PUBLIC_API_URL` | `string` | `http://localhost:4000` | Frontend base URL for API calls. |
| `_REGION` | `string` | `europe-west1` | Cloud Build substitution for deployment region. |
| `_FRONTEND_ORIGIN` | `string` | `https://autopartage-frontend-CHANGE_ME.a.run.app` | Cloud Build substitution for production frontend origin. |

## Usage Examples
Health check:
```bash
curl -sS http://localhost:4000/health
```

Authenticate and persist cookies:
```bash
# 1) Get CSRF token + session cookie
curl -sS -c cookies.txt http://localhost:4000/auth/csrf-token

# 2) Login (replace credentials and csrf token)
CSRF_TOKEN="REPLACE_WITH_TOKEN_FROM_STEP_1"
curl -sS -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: ${CSRF_TOKEN}" \
  -X POST http://localhost:4000/auth/login \
  -d '{"email":"admin@example.com","password":"StrongPass123"}'
```

Create a vehicle with an authenticated session:
```bash
CSRF_TOKEN="REPLACE_WITH_CURRENT_TOKEN"
curl -sS -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: ${CSRF_TOKEN}" \
  -X POST http://localhost:4000/vehicles \
  -d '{"registrationNumber":"GA-123-AA","brand":"Toyota","model":"Hilux"}'
```

## API Reference
Base URL (local): `http://localhost:4000`

Authentication:
- `GET /auth/csrf-token`
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/refresh`
- `POST /auth/logout`

Core modules (authenticated, role-gated):
- `/dashboard`
- `/users`
- `/vehicles`
- `/drivers`
- `/contracts`
- `/payments`
- `/gps`
- `/incidents`
- `/maintenance`
- `/notifications`

Health:
- `GET /health`

## Testing
Backend:
```bash
cd backend
npm run prisma:generate
npm run lint
npm run build
npm run test
```

Frontend:
```bash
cd frontend
npm run lint
npm run build
```

## Deployment
Production deployment uses GCP Cloud Run with Cloud Build orchestration and Cloud SQL PostgreSQL.

Primary path:
```bash
chmod +x infra/setup.sh
./infra/setup.sh

gcloud builds submit --config=infra/cloud-run/cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_FRONTEND_ORIGIN=https://your-frontend-url.a.run.app
```

Production considerations:
- Keep `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in Secret Manager.
- Run forward-only Prisma migrations (`prisma migrate deploy`) during startup.
- Validate backend (`/health`) and frontend (`/`) after each deployment.
- Use Cloud Run revision traffic controls for rollback.

## Contributing
1. Create a short-lived branch from `main` (`feat/*`, `fix/*`, `chore/*`).
2. Keep changes scoped to one objective.
3. Run backend/frontend validation commands before opening a PR.
4. Open a PR with clear scope, risk notes, and test evidence.
5. Require review approval before merge to `main`.

Code standards:
- Backend: TypeScript + Prisma, strict type checks via `npm run lint`.
- Frontend: Next.js + TypeScript + ESLint.
- Prefer small, auditable commits and explicit configuration changes.

## Security
Report vulnerabilities privately to repository maintainers. Include impact, reproduction steps, and affected components. Do not open public issues for exploitable security defects.

## License
ISC
