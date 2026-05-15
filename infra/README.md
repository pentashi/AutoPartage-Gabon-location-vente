# Infrastructure

## Local

Démarrer la stack locale:

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- PostgreSQL: localhost:5432

## GCP Cloud Run

Fichiers fournis:
- `infra/cloud-run/backend-service.yaml`
- `infra/cloud-run/frontend-service.yaml`
- `infra/cloud-run/cloudbuild.yaml`

Adapter `PROJECT_ID`, `REGION` et URLs avant déploiement.
