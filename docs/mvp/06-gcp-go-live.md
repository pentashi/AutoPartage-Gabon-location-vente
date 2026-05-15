# 06 — Préparation mise en production GCP

## Cible de déploiement

- Frontend: Cloud Run (service web)
- Backend: Cloud Run (API)
- Base de données: PostgreSQL managé (Cloud SQL recommandé)
- Build: Cloud Build (`infra/cloud-run/cloudbuild.yaml`)

## Configuration minimale

- Variables backend:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CORS_ORIGINS`
- Variables frontend:
  - `NEXT_PUBLIC_API_URL`
- Secrets via Secret Manager (jamais en clair)

## Observabilité et sécurité

- Logs structurés backend/frontend
- Alertes uptime et taux d’erreur
- Audit des actions critiques (suspension, immobilisation, déblocage)
- Rotation régulière des secrets

## Procédure de déploiement

1. Build image backend/frontend
2. Déploiement progressif Cloud Run
3. Vérification santé (`/healthz` API + disponibilité front)
4. Vérification appels inter-services
5. Validation parcours critique métier

## Plan de rollback

- rollback vers révision Cloud Run précédente
- vérification intégrité DB (pas de rollback destructif)
- vérification reprise des flux critiques
- communication incident et clôture postmortem

## Checklist go-live

- [ ] Secrets chargés et testés
- [ ] Variables d’environnement validées
- [ ] DB migrée et connectée
- [ ] Monitoring/alerting actifs
- [ ] Runbook incident disponible
- [ ] Scénarios critiques validés en pré-prod
