## Context

Dorian's leader sends User Stories via Slack DM, and turning them into actionable Claude Code prompts is a manual, repetitive process. Each US needs to be parsed, structured, checked for missing fields, and rewritten as a well-formed prompt. Scribe automates this: listen on Slack via Socket Mode, process through Forge, and deliver the ready-to-paste prompt via Telegram.

Forge and KairosBot already exist. Scribe is a new standalone service that connects both — it has no HTTP API for external consumers, only an internal Hono health endpoint and the Slack WebSocket connection.

## Goals / Non-Goals

**Goals:**
- Listen to a specific Slack DM channel for messages containing User Stories
- Parse US structure via Forge LLM (title, narrative, acceptance criteria, business rules, etc.)
- Generate a Claude Code-optimized prompt ready to paste
- Deliver the generated prompt to Dorian via Telegram (through KairosBot)
- Store US history in SQLite for reference

**Non-Goals:**
- Responding to Slack messages (read-only listener)
- Supporting multiple Slack channels or workspaces
- Editing or re-processing stored User Stories
- Telegram commands for Scribe (no bot commands — it's a background service)
- Custom prompt templates (single hardcoded system prompt for MVP)

## Decisions

### HTTP Framework: Hono

**Choice:** Hono (port 3004), same as all other services.

**Why:** Consistency across the monorepo. Scribe only needs a `/health` endpoint for Docker health checks, but keeping the same framework means shared patterns and easy extension if REST endpoints are needed later.

### Slack Connection: @slack/socket-mode

**Choice:** Socket Mode over Slack Events API (webhook-based).

**Why:** Socket Mode uses WebSocket — no public endpoint required, no Nginx route, no SSL configuration for Slack. The "doriandev" Slack app already exists. Socket Mode requires an App-Level Token (`xapp-*`) and a Bot Token (`xoxb-*`) with `im:history` and `im:read` scopes.

### Message Filtering: Simple string check

**Choice:** Case-insensitive `text.includes("User Story")` check.

**Why:** The leader uses a consistent format that always contains "User Story" in the message. No need for regex or NLP — a simple string check is reliable and debuggable. If the format changes, updating the filter is a one-line change.

### LLM Processing: Forge with task_type "reasoning"

**Choice:** Call Forge `POST /v1/chat/completions` with `task_type: "reasoning"`.

**Why:** US analysis requires complex reasoning — identifying present vs missing fields, understanding context, generating a well-structured prompt. This maps to the `reasoning` tier (o4-mini), which is the right model for multi-step analysis. Using Forge means centralized logging, cost tracking, and model routing.

### System Prompt Design

The system prompt instructs the LLM to:

1. **Parse US structure** — identify which fields are present: title, narrative (como/quiero/para), context, functional requirements, business rules, data schemas, acceptance criteria, technical considerations, expected result
2. **Flag missing fields** — note which standard US fields are absent so Dorian knows what to clarify
3. **Generate a Claude Code prompt** that includes:
   - Task summary (one sentence)
   - Full US context (structured and cleaned up)
   - Acceptance criteria as a checklist
   - Technical approach suggestions based on the US content
   - Relevant questions the developer should clarify before starting

The user prompt is the raw US text from Slack.

### Telegram Delivery: HTTP POST to KairosBot

**Choice:** Call KairosBot via a new internal endpoint `POST /internal/notify`.

**Why:** The bot already has the Telegram connection and token. Rather than giving Scribe its own Telegram token (violating the "one bot" design), Scribe sends the generated prompt to the bot, which forwards it to Dorian. The `/internal/notify` endpoint accepts `{ chat_id, text, parse_mode }` and sends the message.

The bot's Docker service needs to expose an HTTP server (Hono, same pattern) alongside the grammY polling. The endpoint is internal — only accessible from the Docker network, no auth needed.

### Message Splitting for Telegram

**Choice:** Split messages at 4096 character limit.

**Why:** Telegram's maximum message length is 4096 characters. Generated prompts will often exceed this. Scribe's Telegram client splits the message into chunks, respecting HTML tag boundaries where possible.

### Database: better-sqlite3

**Choice:** SQLite, same as Forge and Chronos.

**Why:** Simple append-only storage for US history. Single table, no complex queries, no concurrent writes. Schema:

```sql
user_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slack_message_id TEXT UNIQUE NOT NULL,
  channel_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  generated_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processed, error
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### Error Handling Strategy

- **Forge down or LLM error**: Store US with `status: 'error'`, send error notification via Telegram ("No pude procesar la US. Forge no responde."). Don't crash.
- **Bot/Telegram unreachable**: Log error with pino, store the generated prompt in SQLite anyway (can be retrieved later). Don't crash.
- **Slack disconnect**: `@slack/socket-mode` handles automatic reconnection. Log reconnection events.
- **Invalid message format**: Skip silently (the filter already ensures only US-containing messages are processed).

### Project Structure

```
services/scribe/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Hono app + Slack socket initialization
│   ├── config.ts             # Zod-validated env config
│   ├── routes/
│   │   └── health.ts         # GET /health
│   ├── services/
│   │   ├── slack.ts          # Socket Mode client, message listener, filtering
│   │   ├── forge.ts          # Forge API client (POST /v1/chat/completions)
│   │   ├── telegram.ts       # Bot notification client (POST /internal/notify)
│   │   └── prompt-builder.ts # System prompt and user prompt construction
│   ├── db/
│   │   ├── client.ts         # SQLite connection with WAL mode
│   │   ├── schema.sql        # user_stories table definition
│   │   └── queries.ts        # Insert, update status, query history
│   └── types.ts              # Scribe-specific types
```

### Bot Modification: Internal Notify Endpoint

KairosBot needs a new Hono HTTP server running alongside grammY polling:

```
services/bot/
├── src/
│   ├── index.ts              # Add Hono server alongside bot polling
│   ├── config.ts             # Add BOT_INTERNAL_PORT env var
│   └── routes/
│       └── internal.ts       # POST /internal/notify — sends Telegram message
```

The Hono server listens on `BOT_INTERNAL_PORT` (default 3005) and exposes:
- `POST /internal/notify` — `{ chat_id: number, text: string, parse_mode?: "HTML" | "MarkdownV2" }`
- `GET /health` — for Docker health checks

## Risks / Trade-offs

- **[Single channel listener]** → Only monitors one Slack DM channel. If the leader changes channels or Dorian wants to monitor additional channels, requires a config change and restart. Acceptable for MVP — can add multi-channel support later via a comma-separated env var.
- **[No retry on Forge failure]** → If Forge is temporarily down, the US is stored with error status but not retried. Dorian can manually trigger reprocessing later (not in MVP). Mitigated by the fact that Forge is on the same Docker network and rarely goes down.
- **[Bot modification required]** → Adding an HTTP server to the bot is a cross-service change. Mitigated by keeping it minimal (one endpoint) and using the same Hono framework.
- **[Message splitting heuristics]** → Splitting HTML messages at 4096 chars while preserving tag integrity is imperfect. Edge cases with deeply nested or long tags may produce malformed HTML. Mitigated by using simple HTML formatting (no nesting) and a conservative split strategy.
- **[Socket Mode token management]** → Requires an App-Level Token that has different rotation/revocation rules than Bot Tokens. If the token expires, Scribe stops receiving messages silently. Mitigated by monitoring Slack connection status via pino logs.
