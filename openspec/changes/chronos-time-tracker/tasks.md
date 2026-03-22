## 1. Project Setup

- [x] 1.1 Initialize `services/chronos/` with `package.json`, `tsconfig.json`, and folder structure (`src/routes`, `src/services`, `src/db`, `src/templates`)
- [x] 1.2 Add dependencies: `hono`, `@hono/node-server`, `better-sqlite3`, `pino`, `zod`, `pdfmake`, `handlebars`, `nanoid` + dev deps (`typescript`, `tsx`, `@types/better-sqlite3`)
- [x] 1.3 Create `Dockerfile` for the chronos service
- [x] 1.4 Add chronos service to root `docker-compose.yml` with env vars and volume for SQLite data

## 2. Config and Database

- [x] 2.1 Create `src/config.ts` — zod schema for env vars (`CHRONOS_PORT`, `CHRONOS_DB_PATH`)
- [x] 2.2 Create `src/db/schema.sql` — tables: `clients` (id, name, created_at), `projects` (id, client_id, name, reportable, created_at), `time_entries` (id, project_id, description, started_at, stopped_at, duration_seconds, created_at) with unique constraints and foreign keys
- [x] 2.3 Create `src/db/client.ts` — SQLite connection with WAL mode, auto-run schema on startup
- [x] 2.4 Create `src/db/queries.ts` — all database query functions (clients CRUD, projects CRUD, timer operations, entry queries, report aggregations)

## 3. Core Services

- [x] 3.1 Create `src/services/timer.ts` — timer business logic: start (with auto-stop of active timer), stop, status, duration calculation and formatting
- [x] 3.2 Create `src/types.ts` — types for clients, projects, time entries, API request/response shapes, display field convention

## 4. Routes

- [x] 4.1 Create `src/routes/health.ts` — `GET /health`
- [x] 4.2 Create `src/routes/clients.ts` — `GET /v1/clients`, `POST /v1/clients`
- [x] 4.3 Create `src/routes/projects.ts` — `GET /v1/clients/:id/projects`, `POST /v1/clients/:id/projects`
- [x] 4.4 Create `src/routes/timer.ts` — `POST /v1/timer/start`, `POST /v1/timer/stop`, `GET /v1/timer/status`
- [x] 4.5 Create `src/routes/entries.ts` — `GET /v1/entries` with query filters (from, to, project_id, client_id)
- [x] 4.6 Create `src/routes/reports.ts` — `GET /v1/reports/weekly` with query params (client_id, week, format)

## 5. Report Generation

- [x] 5.1 Create `src/services/report-pdf.ts` — PDF generation with pdfmake (weekly breakdown layout: header, project sections, totals)
- [x] 5.2 Create `src/templates/weekly-report.hbs` — Handlebars template for HTML report
- [x] 5.3 Create `src/services/report-html.ts` — HTML rendering with Handlebars

## 6. App Entrypoint

- [x] 6.1 Create `src/index.ts` — Hono app setup, mount all routes, pino logger middleware, start server

## 7. Integration

- [x] 7.1 Add Chronos API types to `packages/shared/` for bot consumption
- [x] 7.2 Create `.env.example` with all required chronos env vars documented
- [x] 7.3 Test full flow locally: create client/project → start timer → stop timer → generate weekly report
