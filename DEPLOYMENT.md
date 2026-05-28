# Deployment Procedure - AutoPartage-Gabon-location-vente

This project is deployed to Google Cloud Run using Cloud Build.

## 1. Prerequisites
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Target GCP project set (`gcloud config set project YOUR_PROJECT_ID`)

## 2. Triggering a Deployment
You can trigger a redeployment by pushing to the `main` branch if Cloud Build is configured, or by manually submitting the build from the project root:

```bash
gcloud builds submit --config=infra/cloud-run/cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_FRONTEND_ORIGIN=https://YOUR_FRONTEND_URL.a.run.app
```

*Note: Replace `YOUR_FRONTEND_URL` with your actual frontend URL.*

## 3. Database Migrations
Migrations run automatically on every container start via `backend/entrypoint.sh`.

## 4. Rollback
To roll back the backend to a previous revision:

```bash
# List revisions
gcloud run revisions list --service=autopartage-backend --region=europe-west1

# Roll back
gcloud run services update-traffic autopartage-backend \
  --to-revisions=REVISION_NAME=100 \
  --region=europe-west1
```
