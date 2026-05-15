# 04 — Socle données/API MVP

## Dictionnaire de données (MVP)

Entités pivots:
- Chauffeur (`Driver`): identité métier, permis, score, rattachement utilisateur
- Véhicule (`Vehicle`): immatriculation, statut exploitation
- Contrat (`Contract`): type, statut, échéancier de référence
- Versement (`Payment`): montant, échéance, statut, pénalité
- Incident (`Incident`): nature, statut, véhicule/chauffeur liés
- Notification (`Notification`): canal, priorité, lecture

Référentiels communs:
- Rôles: `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`, `DRIVER`, `GARAGE`
- Statuts véhicule: `ACTIVE`, `IMMOBILIZED`, `MAINTENANCE`
- Statuts contrat: `ACTIVE`, `LATE`, `SUSPENDED`, `TERMINATED`
- Statuts paiement: `PENDING`, `PAID`, `OVERDUE`

## Endpoints MVP obligatoires

Déjà disponibles:
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: CRUD `/users`
- Drivers: CRUD `/drivers`
- Vehicles: CRUD `/vehicles`, `PATCH /vehicles/:id/status`
- Contracts: CRUD `/contracts`, `PATCH /contracts/:id/status`
- Payments: CRUD `/payments`, `GET /payments/summary/monthly`, `PATCH /payments/detect-late`

À compléter pour Phase 2:
- GPS
  - `GET /gps/vehicles/:vehicleId/location/latest`
  - `POST /gps/vehicles/:vehicleId/commands/immobilize`
  - `POST /gps/vehicles/:vehicleId/commands/release`
- Maintenance
  - `GET /maintenance/tasks`
  - `POST /maintenance/tasks`
  - `PATCH /maintenance/tasks/:id/status`
- Notifications
  - `GET /notifications`
  - `PATCH /notifications/:id/read`
  - `POST /notifications/dispatch`

## Événements clés à tracer

- `payment.overdue.detected`
- `contract.status.changed`
- `vehicle.status.changed`
- `gps.command.sent`
- `gps.command.acknowledged`
- `maintenance.task.created`
- `maintenance.task.overdue`
- `notification.dispatched`
