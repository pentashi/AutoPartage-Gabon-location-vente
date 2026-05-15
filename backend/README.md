# Backend

API Express + TypeScript pour AutoPartage Gabon.

## Stack

- Express
- Prisma ORM
- PostgreSQL
- JWT (cookies HttpOnly)

## Démarrage

1. Copier `.env.example` vers `.env`.
2. Démarrer PostgreSQL (ex: via `docker compose up`).
3. Installer les dépendances:
   ```bash
   npm install
   ```
4. Générer le client Prisma:
   ```bash
   npm run prisma:generate
   ```
5. Lancer les migrations:
   ```bash
   npm run prisma:migrate
   ```
6. Lancer l'API:
   ```bash
   npm run dev
   ```

## Endpoints initiaux

- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: CRUD ` /users`
- Vehicles: CRUD `/vehicles` + `PATCH /vehicles/:id/status`
- Drivers: CRUD `/drivers`
- Contracts: CRUD `/contracts` + `PATCH /contracts/:id/status`
- Payments: CRUD `/payments`, `GET /payments/summary/monthly`, `PATCH /payments/detect-late`
