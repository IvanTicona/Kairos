## 1. Project Setup

- [x] 1.1 Initialize `services/forge/` with `package.json`, `tsconfig.json`, and folder structure (`src/routes`, `src/services`, `src/db`)
- [x] 1.2 Add dependencies: `hono`, `@hono/node-server`, `openai`, `better-sqlite3`, `pino`, `zod`, `nanoid` + dev deps (`typescript`, `tsx`, `@types/better-sqlite3`)
- [x] 1.3 Create `Dockerfile` for the forge service (Node.js, multi-stage build)
- [x] 1.4 Add forge service to root `docker-compose.yml` with env vars and volume for SQLite data

## 2. Config and Database

- [x] 2.1 Create `src/config.ts` — zod schema for env vars (`OPENAI_API_KEY`, `FORGE_API_KEY`, `FORGE_PORT`, `FORGE_TIER_MAP`)
- [x] 2.2 Create `src/db/schema.sql` — `requests` table (request_id, timestamp, model_used, tier, task_type, service, tokens_in, tokens_out, cost_usd, status, error_message, duration_ms, metadata)
- [x] 2.3 Create `src/db/client.ts` — SQLite connection with WAL mode, auto-run schema on startup
- [x] 2.4 Create `src/db/logger.ts` — `logRequest()` insert function

## 3. Core Services

- [x] 3.1 Create `src/services/router.ts` — tier resolution logic: parse `task_type`/`model` from request, resolve final model using tier mapping config
- [x] 3.2 Create `src/services/openai.ts` — OpenAI SDK wrapper: send chat completion request, extract token counts from response
- [x] 3.3 Create `src/services/cost.ts` — static pricing table for OpenAI models, `calculateCost(model, tokensIn, tokensOut)` function
- [x] 3.4 Create `src/types.ts` — request/response types, task_type enum, Forge metadata type

## 4. Routes

- [x] 4.1 Create `src/routes/health.ts` — `GET /health` returning `{ status: "ok" }`
- [x] 4.2 Create `src/routes/completions.ts` — `POST /v1/chat/completions` with: auth check, zod request validation, route to model, call OpenAI, log request, return response with `_forge` metadata
- [x] 4.3 Create `src/routes/stats.ts` — `GET /v1/stats` with query params (`period`, `service`, `model`), aggregation queries against SQLite

## 5. App Entrypoint and Auth

- [x] 5.1 Create `src/index.ts` — Hono app setup, mount routes, pino logger middleware, start server
- [x] 5.2 Add auth middleware — validate `Authorization: Bearer <FORGE_API_KEY>` header on protected routes

## 6. Shared Types

- [x] 6.1 Add Forge request/response types to `packages/shared/` for downstream services to import

## 7. Integration

- [x] 7.1 Create `.env.example` with all required forge env vars documented
- [x] 7.2 Test full flow locally: send request → route to model → get response → verify log entry and cost calculation
