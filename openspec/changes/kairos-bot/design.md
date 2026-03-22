## Context

Forge and Chronos are implemented as HTTP APIs. Dorian needs a Telegram interface to interact with them from iPhone and Windows. The bot is centralized — one bot, one token, routing to multiple services. Phase 1 only connects to Chronos.

## Goals / Non-Goals

**Goals:**
- Single Telegram bot that routes commands to Kairos services via HTTP
- Owner-only access (filter by Telegram user ID)
- Hybrid UX: text commands + inline keyboard buttons
- Commands for all Chronos functionality: timer, clients, projects, reports
- Spanish responses (forwarding Chronos `display` field)

**Non-Goals:**
- Forge commands (no user-facing need yet — Forge is a backend service)
- Natural language processing — commands are structured
- Multi-user support
- Webhook mode (polling is simpler for a single-user bot on a VPS)

## Decisions

### Bot Framework: grammY

**Choice:** grammY over Telegraf or node-telegram-bot-api.

**Why:** TypeScript-first, actively maintained, excellent plugin ecosystem, great inline keyboard support. Telegraf is popular but grammY has better TS types and is the spiritual successor.

### Polling vs Webhook

**Choice:** Long polling for MVP.

**Why:** Simpler setup — no need to configure a public URL, SSL certs, or Nginx routes for the bot. Single user, low traffic. Can switch to webhooks later if needed.

### Service Communication

Bot calls Chronos via HTTP using `fetch` (native in Node 20+). Base URL configured via `CHRONOS_URL` env var (e.g., `http://kairos-chronos:3002` in Docker).

### Command Design

| Command | Action | UX |
|---------|--------|----|
| `/timer` | Start a timer | Shows inline buttons: list of projects grouped by client. User taps project, then bot asks for description via text reply. |
| `/stop` | Stop active timer | Direct action, no buttons needed |
| `/status` | Show active timer | Direct response with elapsed time |
| `/clientes` | List clients | Text list |
| `/nuevo_cliente` | Create client | Bot asks for name via text reply |
| `/proyectos` | List projects | Inline buttons to pick a client, then shows projects |
| `/nuevo_proyecto` | Create project | Inline buttons to pick client, then asks for name |
| `/reporte` | Weekly report | Inline buttons to pick client, then sends PDF |
| `/entradas` | Recent time entries | Shows last entries for current week |
| `/help` | Show all commands | Text list of available commands |

### Conversation Flow for `/timer`

```
User: /timer
Bot: [inline keyboard]
     Paul:
     [Golochtel] [Docencia]
     SLAN:
     [Backend]

User: taps [Golochtel]
Bot: "¿Descripción? (o enviá /skip para omitir)"

User: "diseño multitenant"
Bot: "Timer iniciado: Golochtel — diseño multitenant"
```

### Inline Keyboard Callback Data Format

`action:param` — e.g., `timer_start:1` (project_id=1), `report:1` (client_id=1).

### Project Structure

```
services/bot/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Bot setup, launch polling
│   ├── config.ts          # Zod-validated env config
│   ├── middleware/
│   │   └── owner-only.ts  # Filter by TELEGRAM_OWNER_ID
│   ├── commands/
│   │   ├── timer.ts       # /timer, /stop, /status
│   │   ├── clients.ts     # /clientes, /nuevo_cliente
│   │   ├── projects.ts    # /proyectos, /nuevo_proyecto
│   │   ├── reports.ts     # /reporte, /entradas
│   │   └── help.ts        # /help
│   ├── callbacks/
│   │   └── handler.ts     # Inline keyboard callback dispatcher
│   └── services/
│       └── chronos.ts     # HTTP client for Chronos API
```

## Risks / Trade-offs

- **[Long polling vs webhooks]** → Polling is simpler but keeps a constant connection. Fine for single user on a VPS with low traffic. Switch to webhooks if it becomes an issue.
- **[Conversation state in memory]** → When the bot asks "¿Descripción?", it needs to remember which project the user selected. Using grammY's conversation plugin or simple in-memory map. Single user = no concurrency issues, state lost on restart (acceptable).
- **[Chronos down]** → If Chronos is unreachable, bot shows a friendly error. No retry logic needed for MVP.
