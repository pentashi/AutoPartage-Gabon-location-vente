# Infrastructure

## Quick start — local development

```bash
docker compose up --build
```

Services:
| Service    | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:3000  |
| Backend    | http://localhost:4000  |
| PostgreSQL | localhost:5432         |

---

## GCP Cloud Run deployment

### Architecture

```
GitHub main branch
      │
      ▼
Cloud Build (infra/cloud-run/cloudbuild.yaml)
      │
      ├── Build backend image  ──► Artifact Registry
      ├── Build frontend image ──► Artifact Registry
      │
      ├── Deploy autopartage-backend  (Cloud Run)
      │      └─ Cloud SQL socket  ──► Cloud SQL (PostgreSQL 16)
      │      └─ Secrets          ──► Secret Manager
      │
      └── Deploy autopartage-frontend (Cloud Run)
               └─ NEXT_PUBLIC_API_URL ──► backend URL (resolved at deploy time)
```

### Prerequisites

- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Target GCP project set (`gcloud config set project YOUR_PROJECT_ID`)
- GitHub repository connected to Cloud Build

---

### Step 1 — One-time GCP bootstrap

Run the setup script **once** before the first deployment:

```bash
chmod +x infra/setup.sh
./infra/setup.sh
```

This script:
1. Enables required APIs (Cloud Run, Cloud Build, Cloud SQL, Secret Manager, Artifact Registry)
2. Creates an Artifact Registry Docker repository (`autopartage`)
3. Creates a Cloud SQL PostgreSQL 16 instance (`autopartage-db`)
4. Generates random secrets and stores them in Secret Manager
5. Creates service accounts with least-privilege IAM roles
6. Grants Cloud Build the necessary permissions
7. Creates a Cloud Build trigger on the `main` branch

> **Save the credentials printed at the end securely** — they are not stored elsewhere.

---

### Step 2 — First deployment

Push to `main` (or trigger manually):

```bash
gcloud builds submit --config=infra/cloud-run/cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_FRONTEND_ORIGIN=PLACEHOLDER
```

---

### Step 3 — Fix CORS after the first deployment

The backend's `FRONTEND_ORIGIN` needs the real frontend URL for CORS to work.

```bash
# Get the frontend URL
gcloud run services describe autopartage-frontend \
  --region=europe-west1 --format='value(status.url)'

# Get the backend URL
gcloud run services describe autopartage-backend \
  --region=europe-west1 --format='value(status.url)'
```

Update the Cloud Build trigger in the Console or via CLI:

```bash
gcloud builds triggers update autopartage-deploy \
  --update-substitutions=_FRONTEND_ORIGIN=https://autopartage-frontend-XXXX.a.run.app
```

Then push again to trigger a re-deployment with the correct CORS origin.

---

### Cloud Build substitution variables

| Variable            | Default                                        | Description                             |
|---------------------|------------------------------------------------|-----------------------------------------|
| `_REGION`           | `europe-west1`                                 | GCP region for all resources            |
| `_FRONTEND_ORIGIN`  | `https://autopartage-frontend-CHANGE_ME.a.run.app` | Frontend URL for backend CORS — **must be updated** |

---

### Secrets in Secret Manager

The following secrets must exist before deployment (created by `infra/setup.sh`):

| Secret name          | Used by  | Description              |
|----------------------|----------|--------------------------|
| `DATABASE_URL`       | Backend  | PostgreSQL connection URL via Cloud SQL socket |
| `JWT_ACCESS_SECRET`  | Backend  | JWT access token signing key |
| `JWT_REFRESH_SECRET` | Backend  | JWT refresh token signing key |

Rotate secrets:

```bash
printf 'new-secret-value' | gcloud secrets versions add SECRET_NAME --data-file=-
```

---

### Database migrations

Migrations run automatically on every container start via `backend/entrypoint.sh`:

```sh
npx prisma migrate deploy   # applies pending migrations
exec node dist/index.js     # starts the API server
```

To run migrations manually (e.g., after a schema change in development):

```bash
cd backend
npx prisma migrate dev --name describe_your_change
```

---

### Health checks

| Endpoint               | Expected response        |
|------------------------|--------------------------|
| `GET /health` (backend) | `200 {"status":"ok"}`   |
| `GET /` (frontend)      | `200` (HTML)            |

Cloud Build runs these smoke tests after every deployment and fails the build if either returns a non-200 status.

---

### Rollback

Roll back to the previous revision:

```bash
# List revisions
gcloud run revisions list --service=autopartage-backend --region=europe-west1

# Roll back
gcloud run services update-traffic autopartage-backend \
  --to-revisions=REVISION_NAME=100 \
  --region=europe-west1
```

> ⚠️ Only roll back code, never the database schema. Prisma migrations are forward-only.

---

### Manual service deployment (without Cloud Build)

You can deploy directly from the YAML service definitions after substituting the placeholder values:

```bash
# Replace PROJECT_ID, REGION, and image tags, then:
gcloud run services replace infra/cloud-run/backend-service.yaml --region=europe-west1
gcloud run services replace infra/cloud-run/frontend-service.yaml --region=europe-west1
```

