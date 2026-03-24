## 1. Project Setup

- [ ] 1.1 Initialize `services/scribe/` with `package.json`, `tsconfig.json`, and folder structure (`src/routes`, `src/services`, `src/db`)
- [ ] 1.2 Add dependencies: `hono`, `@hono/node-server`, `@slack/socket-mode`, `@slack/web-api`, `better-sqlite3`, `pino`, `zod`, `nanoid` + dev deps (`typescript`, `tsx`, `@types/better-sqlite3`)
- [ ] 1.3 Create `Dockerfile` for the scribe service (Node.js, multi-stage build, copy schema.sql to dist)
- [ ] 1.4 Add scribe service to root `docker-compose.yml` with env vars, volume for SQLite data, depends_on forge and bot

## 2. Config and Database

- [ ] 2.1 Create `src/config.ts` — zod schema for env vars (`SCRIBE_PORT`, `SLACK_APP_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`, `FORGE_URL`, `FORGE_API_KEY`, `BOT_URL`, `TELEGRAM_OWNER_ID`)
- [ ] 2.2 Create `src/db/schema.sql` — `user_stories` table (id, slack_message_id UNIQUE, channel_id, raw_text, generated_prompt, status, error_message, created_at)
- [ ] 2.3 Create `src/db/client.ts` — SQLite connection with WAL mode, auto-run schema on startup
- [ ] 2.4 Create `src/db/queries.ts` — insert US, update status/prompt, check duplicate by slack_message_id, query history

## 3. Core Services

- [ ] 3.1 Create `src/services/prompt-builder.ts` — system prompt (US analysis instructions) and user prompt construction, returns `ForgeChatMessage[]`
- [ ] 3.2 Create `src/services/forge.ts` — Forge API client: POST `/v1/chat/completions` with `task_type: "reasoning"`, `service: "scribe"`, uses `ForgeRequest`/`ForgeResponse` from `@kairos/shared`
- [ ] 3.3 Create `src/services/telegram.ts` — Bot notification client: POST to `BOT_URL/internal/notify`, message splitting at 4096 char limit, error notification helper
- [ ] 3.4 Create `src/services/slack.ts` — Socket Mode client setup, message event listener, channel filter, US keyword filter, bot/edit/delete event filtering, deduplication check, orchestrates processing pipeline (store → forge → telegram)
- [ ] 3.5 Create `src/types.ts` — Scribe-specific types (UserStory record, processing status enum)

## 4. Routes

- [ ] 4.1 Create `src/routes/health.ts` — `GET /health` returning `{ status: "ok" }`

## 5. App Entrypoint

- [ ] 5.1 Create `src/index.ts` — Hono app setup with health route, initialize Slack Socket Mode client, start both Hono server (port 3004) and Slack listener

## 6. Bot Modification: Internal Notify Endpoint

- [ ] 6.1 Add `BOT_INTERNAL_PORT` to bot's `src/config.ts` zod schema (default 3005)
- [ ] 6.2 Create `src/routes/internal.ts` in bot — `POST /internal/notify` endpoint: validate `{ chat_id, text, parse_mode? }`, send message via grammY bot API, return `{ ok: true }` or error
- [ ] 6.3 Add `GET /health` endpoint to bot's Hono server
- [ ] 6.4 Update bot's `src/index.ts` — add Hono HTTP server alongside grammY polling, mount internal routes, listen on `BOT_INTERNAL_PORT`
- [ ] 6.5 Update bot's `docker-compose.yml` entry to expose `BOT_INTERNAL_PORT` on Docker network

## 7. Integration

- [ ] 7.1 Create `.env.example` with all required scribe env vars documented
- [ ] 7.2 Test full flow locally: Slack message → filter → Forge processing → Telegram delivery → verify SQLite record
