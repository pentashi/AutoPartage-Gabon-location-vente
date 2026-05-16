#!/usr/bin/env bash
# =============================================================================
# infra/setup.sh — One-time GCP infrastructure bootstrap for AutoPartage Gabon
# =============================================================================
# Run this ONCE before the very first deployment.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - Target project set: gcloud config set project YOUR_PROJECT_ID
#   - openssl available (standard on Linux/macOS)
#
# Usage:
#   chmod +x infra/setup.sh
#   ./infra/setup.sh
#
# After this script, follow the "Next steps" printed at the end.
# =============================================================================

set -euo pipefail

# ── Configuration — edit these before running ─────────────────────────────────
REGION="europe-west1"
DB_INSTANCE_NAME="autopartage-db"
DB_NAME="autopartage"
DB_USER="autopartage"
ARTIFACT_REPO="autopartage"
BACKEND_SA="autopartage-backend"
FRONTEND_SA="autopartage-frontend"
# GitHub repository details — used to create the Cloud Build trigger
GITHUB_OWNER="pentashi"
GITHUB_REPO="AutoPartage-Gabon-location-vente"
# ──────────────────────────────────────────────────────────────────────────────

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: No GCP project configured. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
BUILD_SA_EMAIL="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "============================================="
echo " AutoPartage GCP Setup"
echo "============================================="
echo " Project : $PROJECT_ID"
echo " Region  : $REGION"
echo "============================================="
echo ""

# ── 1. Enable required APIs ───────────────────────────────────────────────────
echo "[1/7] Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  --project="$PROJECT_ID"
echo "  APIs enabled."

# ── 2. Artifact Registry Docker repository ────────────────────────────────────
echo "[2/7] Creating Artifact Registry repository..."
gcloud artifacts repositories create "$ARTIFACT_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="AutoPartage container images" \
  --project="$PROJECT_ID" 2>/dev/null \
  || echo "  Repository '$ARTIFACT_REPO' already exists — skipping."

echo "  Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── 3. Cloud SQL PostgreSQL instance ─────────────────────────────────────────
echo "[3/7] Creating Cloud SQL instance (may take 5-10 minutes)..."
gcloud sql instances create "$DB_INSTANCE_NAME" \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --deletion-protection \
  --project="$PROJECT_ID" 2>/dev/null \
  || echo "  Instance '$DB_INSTANCE_NAME' already exists — skipping."

echo "  Creating database '$DB_NAME'..."
gcloud sql databases create "$DB_NAME" \
  --instance="$DB_INSTANCE_NAME" \
  --project="$PROJECT_ID" 2>/dev/null \
  || echo "  Database already exists — skipping."

echo "  Creating database user '$DB_USER'..."
DB_PASSWORD=$(openssl rand -hex 16)
gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE_NAME" \
  --password="$DB_PASSWORD" \
  --project="$PROJECT_ID" 2>/dev/null \
  || { echo "  User already exists — using placeholder password. Update SECRET manually."; DB_PASSWORD="ALREADY_EXISTS_UPDATE_MANUALLY"; }

CLOUD_SQL_INSTANCE="${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_INSTANCE}"

# ── 4. Secret Manager secrets ─────────────────────────────────────────────────
echo "[4/7] Storing secrets in Secret Manager..."

_upsert_secret() {
  local NAME="$1"
  local VALUE="$2"
  if gcloud secrets describe "$NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "    Updating existing secret '$NAME'..."
    printf '%s' "$VALUE" | gcloud secrets versions add "$NAME" \
      --data-file=- --project="$PROJECT_ID"
  else
    echo "    Creating secret '$NAME'..."
    printf '%s' "$VALUE" | gcloud secrets create "$NAME" \
      --data-file=- --project="$PROJECT_ID"
  fi
}

JWT_ACCESS_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')

_upsert_secret "DATABASE_URL"      "$DATABASE_URL"
_upsert_secret "JWT_ACCESS_SECRET" "$JWT_ACCESS_SECRET"
_upsert_secret "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET"

# ── 5. Service accounts ───────────────────────────────────────────────────────
echo "[5/7] Creating service accounts..."

for SA in "$BACKEND_SA" "$FRONTEND_SA"; do
  gcloud iam service-accounts create "$SA" \
    --display-name="AutoPartage ${SA}" \
    --project="$PROJECT_ID" 2>/dev/null \
    || echo "  SA '$SA' already exists — skipping."
done

BACKEND_SA_EMAIL="${BACKEND_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
FRONTEND_SA_EMAIL="${FRONTEND_SA}@${PROJECT_ID}.iam.gserviceaccount.com"

# Backend SA: Cloud SQL client + read secrets
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${BACKEND_SA_EMAIL}" \
  --role="roles/cloudsql.client" --condition=None

for SECRET in DATABASE_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET; do
  gcloud secrets add-iam-policy-binding "$SECRET" \
    --member="serviceAccount:${BACKEND_SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID"
done

# Frontend SA: no extra permissions needed for Cloud Run (just runs Next.js)
echo "  Service accounts configured."

# ── 6. Cloud Build SA permissions ────────────────────────────────────────────
echo "[6/7] Granting Cloud Build service account permissions..."

for ROLE in \
  roles/run.admin \
  roles/iam.serviceAccountUser \
  roles/secretmanager.secretAccessor \
  roles/cloudsql.client \
  roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${BUILD_SA_EMAIL}" \
    --role="$ROLE" --condition=None
done
echo "  Cloud Build permissions granted."

# ── 7. Create Cloud Build trigger ─────────────────────────────────────────────
echo "[7/7] Creating Cloud Build trigger..."
gcloud builds triggers create github \
  --name="autopartage-deploy" \
  --repo-owner="$GITHUB_OWNER" \
  --repo-name="$GITHUB_REPO" \
  --branch-pattern="^main$" \
  --build-config="infra/cloud-run/cloudbuild.yaml" \
  --substitutions="_REGION=${REGION},_FRONTEND_ORIGIN=PLACEHOLDER_UPDATE_AFTER_FIRST_DEPLOY" \
  --project="$PROJECT_ID" 2>/dev/null \
  || echo "  Trigger already exists or could not be created automatically — create it manually in the Console."

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================="
echo " Setup complete!"
echo "============================================="
echo ""
echo "⚠️  Store these values SECURELY — they will not be shown again:"
echo ""
echo "  DB_PASSWORD        : $DB_PASSWORD"
echo "  JWT_ACCESS_SECRET  : $JWT_ACCESS_SECRET"
echo "  JWT_REFRESH_SECRET : $JWT_REFRESH_SECRET"
echo "  DATABASE_URL       : $DATABASE_URL"
echo ""
echo "Next steps:"
echo ""
echo "  1. Connect your GitHub repo to Cloud Build (if the trigger above failed):"
echo "     https://console.cloud.google.com/cloud-build/triggers"
echo ""
echo "  2. Trigger the first deployment by pushing to main, OR run:"
echo "     gcloud builds submit --config=infra/cloud-run/cloudbuild.yaml \\"
echo "       --substitutions=_REGION=${REGION},_FRONTEND_ORIGIN=PLACEHOLDER"
echo ""
echo "  3. After the first deployment, get the real frontend URL:"
echo "     gcloud run services describe autopartage-frontend \\"
echo "       --region=${REGION} --format='value(status.url)'"
echo ""
echo "  4. Update the Cloud Build trigger's _FRONTEND_ORIGIN substitution to that URL,"
echo "     then run a second deployment so the backend CORS is correct."
echo ""
echo "  Cloud SQL instance : $CLOUD_SQL_INSTANCE"
echo "  Artifact Registry  : ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}"
