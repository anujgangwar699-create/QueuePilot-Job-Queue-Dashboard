# QueuePilot — Mini Job Queue Dashboard

A polished React + NestJS implementation of the internship assignment. It includes the required CRUD/status functionality, validation, loading/error states, counts and status filters, plus a responsive animated UI and demo login experience.

## Stack
- Frontend: React 18 + TypeScript + Vite + Framer Motion + Lucide
- Backend: NestJS + TypeORM
- Database: SQLite (zero external DB setup)

## Fastest local setup
### Windows
1. Install Node.js 20+.
2. Double-click `setup.bat` once.
3. Double-click `run.bat` whenever you want to run the app.
4. Browser opens at `http://localhost:5173`.

The backend runs at `http://localhost:3000/api`.

### macOS / Linux
```bash
./setup.sh
./run.sh
```

## API
- `POST /api/jobs` — create a job
- `GET /api/jobs` — list jobs
- `PATCH /api/jobs/:id/status` — update status
- `DELETE /api/jobs/:id` — delete job

Status update body example:
```json
{ "status": "running", "version": 1 }
```

## State-transition rules
Allowed transitions are enforced in the backend:
- `pending -> running`
- `pending -> failed`
- `running -> completed`
- `running -> failed`
- `completed` and `failed` are terminal.

The frontend only displays valid next actions, but the backend remains the source of truth so direct API calls cannot bypass the rule.

## Concurrency decision
Each job has a TypeORM `@VersionColumn`. Status changes use a conditional SQL update:

`WHERE id = :id AND version = :version`

Only a client holding the latest version can update the job. If two tabs both read version 1 and submit nearly together, the first update increments the version and succeeds; the second affects zero rows and receives HTTP 409 Conflict. The frontend reloads data after that conflict.

This is deliberately simpler than a distributed lock and fits a small single-database service well.

## Validation / errors
- DTO validation uses `class-validator` and Nest's global `ValidationPipe`.
- Unknown fields are rejected.
- Missing jobs return 404.
- Invalid transitions and stale concurrent writes return 409.
- Frontend shows API/loading errors visibly.

## Extra improvement
Optimistic concurrency control is the production-readiness bonus. It prevents silent lost updates between multiple browser tabs/clients without introducing lock infrastructure.

## Demo login note
The side login is intentionally UI-only because authentication is outside the assignment requirements. Any email/password signs in locally via `localStorage`. In production, this would be replaced by server-issued sessions/JWT, hashed credentials, authorization guards, CSRF/session protections, and logout invalidation.

## Deployment
### Frontend (Vercel / Netlify)
Set environment variable:
`VITE_API_URL=https://YOUR-BACKEND/api`

Build command: `npm run build`
Output: `dist`

### Backend (Render / Railway)
Root directory: `backend`
Build: `npm install && npm run build`
Start: `npm run start:prod`

For ephemeral hosts, SQLite may reset between deploys. For a real production deployment, switch the TypeORM connection to managed PostgreSQL while keeping the same entity/service design.

## Assumptions / trade-offs
- SQLite chosen to make reviewer setup nearly zero-config.
- `synchronize: true` is convenient for an internship demo; production should use migrations.
- Demo auth is presentation-only and intentionally not represented as secure authentication.
- A larger queue system could add pagination, audit logs, retry metadata, workers, WebSocket updates and role-based authorization.
