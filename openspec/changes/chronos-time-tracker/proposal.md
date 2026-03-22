## Why

Dorian works across multiple clients and projects (SLAN, Paul/Golochtel, Paul/Docencia, Thena) with no formal hour tracking. Paul needs visibility into hours worked per project, and Dorian needs weekly reports to share. Currently there's no way to track, aggregate, or report time across these contexts.

## What Changes

- New standalone service (`services/chronos/`) providing a REST API for time tracking
- Timer-based workflow: start/stop timers associated with a client, project, and description
- Three-level data model: Client → Project → Time Entry
- Projects have a `reportable` flag to control inclusion in client reports (e.g., Tutoría tracked but excluded from Paul's report)
- Weekly report generation in PDF and HTML formats, filtered by client
- REST API consumed by the centralized Telegram bot (`services/bot/`) for Phase 1 and by Cortex dashboard in Phase 2

## Capabilities

### New Capabilities
- `time-tracking`: Timer-based time entry management — start, stop, and manual adjustments with client/project hierarchy
- `client-project-management`: CRUD for clients and projects with reportable flag
- `time-reports`: Weekly report generation in PDF/HTML format, filtered by client, with hour breakdowns by project

### Modified Capabilities

_None — this is a new service._

## Impact

- **New service**: `services/chronos/` — TypeScript, Hono, SQLite
- **Bot integration**: `services/bot/` routes Telegram commands (`/start`, `/stop`, `/report`, etc.) to Chronos API
- **Docker**: New container added to `docker-compose.yml`
- **Dependencies**: `hono`, `better-sqlite3`, `pino`, `zod`, PDF generation library (e.g., `pdfkit` or `@react-pdf/renderer`)
- **Environment**: `CHRONOS_PORT`, `CHRONOS_DB_PATH`
