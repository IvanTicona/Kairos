## Context

Dorian works for multiple clients (SLAN, Paul, university) and needs to track hours per project. Paul specifically needs weekly hour reports for Golochtel and Docencia work. Currently there's zero tracking — just mental estimates. Chronos is P2 priority but has no dependencies on Forge, so it's built in parallel during Phase 1.

The primary interface is Telegram via KairosBot (centralized bot at `services/bot/`). Chronos exposes a REST API that the bot calls.

## Goals / Non-Goals

**Goals:**
- REST API for timer-based time tracking (start/stop)
- Client → Project → Time Entry data model with `reportable` flag
- Weekly PDF/HTML reports filtered by client
- API designed for bot consumption (simple, predictable responses with display-ready text)

**Non-Goals:**
- Telegram bot implementation (that's `services/bot/`, separate change)
- Manual time entry editing (MVP: start/stop only, edit comes later)
- Invoicing or billing calculations
- Multi-user support
- Real-time notifications or reminders
- Integration with external time tracking tools

## Decisions

### HTTP Framework: Hono

**Choice:** Hono, same as Forge.

**Why:** Consistency across services. Same patterns, same middleware approach. One framework to maintain across the monorepo.

### Database: better-sqlite3

**Choice:** SQLite, same as Forge.

**Why:** Single user, simple relational data. Three tables (clients, projects, time_entries) with straightforward queries. No need for a separate database container.

### Data Model

```sql
clients (id, name, created_at)
projects (id, client_id FK, name, reportable BOOLEAN DEFAULT true, created_at)
time_entries (id, project_id FK, description, started_at, stopped_at, duration_seconds, created_at)
```

- `reportable` on projects controls report inclusion. Tutoría/Thena projects are `reportable: false`.
- `duration_seconds` is computed on stop and stored for fast aggregation queries.
- `stopped_at` NULL means timer is running.

### Timer Logic

- Only ONE timer can be active at a time. Starting a new timer auto-stops the current one.
- This prevents forgotten timers from accumulating hours silently.
- Bot commands: the bot translates Telegram commands to Chronos API calls. Chronos returns structured JSON with a `display` field containing Spanish text ready for the bot to forward.

### Report Generation: pdfmake

**Choice:** `pdfmake` over `pdfkit` or `@react-pdf/renderer`.

**Why:** Pure JavaScript, no native dependencies (easier Docker builds), declarative document definition that's easy to template. Generates PDF buffers in-memory without temp files.

HTML reports are simple Handlebars templates rendered server-side.

### API Design

```
# Clients & Projects
GET    /v1/clients                    # List all clients
POST   /v1/clients                    # Create client
GET    /v1/clients/:id/projects       # List projects for client
POST   /v1/clients/:id/projects       # Create project (body: { name, reportable? })

# Timer
POST   /v1/timer/start                # { project_id, description }
POST   /v1/timer/stop                 # Stop active timer
GET    /v1/timer/status               # Current timer info (or null)

# Time Entries
GET    /v1/entries                    # List entries (query: from, to, project_id, client_id)

# Reports
GET    /v1/reports/weekly             # Query: client_id, week (ISO date), format (pdf|html)
```

All endpoints return JSON with a `display` field in Spanish for bot consumption.

### Project Structure

```
services/chronos/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Hono app, server startup
│   ├── config.ts             # Zod-validated env config
│   ├── routes/
│   │   ├── clients.ts        # Client CRUD
│   │   ├── projects.ts       # Project CRUD
│   │   ├── timer.ts          # Start/stop/status
│   │   ├── entries.ts        # Time entry queries
│   │   ├── reports.ts        # Report generation
│   │   └── health.ts         # GET /health
│   ├── services/
│   │   ├── timer.ts          # Timer business logic
│   │   ├── report-pdf.ts     # PDF generation with pdfmake
│   │   └── report-html.ts    # HTML generation with Handlebars
│   ├── db/
│   │   ├── client.ts         # SQLite connection
│   │   ├── schema.sql        # Table definitions
│   │   └── queries.ts        # All database queries
│   ├── templates/
│   │   └── weekly-report.hbs # Handlebars template for HTML report
│   └── types.ts              # Shared types
```

## Risks / Trade-offs

- **[Single active timer]** → Simplifies UX but means Dorian can't track parallel work. Mitigated by the fact that humans generally focus on one task at a time. Can add overlapping timers later if needed.
- **[No manual time editing in MVP]** → If Dorian forgets to stop a timer, the entry has wrong duration. Mitigated by auto-stop on new timer start. Full editing deferred to a follow-up change.
- **[PDF library choice]** → `pdfmake` is less mature than `pdfkit` but avoids native deps. If PDF quality is insufficient, can swap without API changes.
- **[Spanish display text in API responses]** → Coupling language to the API. Acceptable for single-user system. If Cortex needs English, can add a `lang` param later.
