## 1. Project Setup

- [x] 1.1 Initialize `services/bot/` with `package.json`, `tsconfig.json`, and folder structure (`src/commands`, `src/callbacks`, `src/middleware`, `src/services`)
- [x] 1.2 Add dependencies: `grammy`, `pino`, `zod` + dev deps (`typescript`, `tsx`)
- [x] 1.3 Create `Dockerfile` for the bot service
- [x] 1.4 Add bot service to root `docker-compose.yml` with env vars and dependency on chronos

## 2. Config and Infrastructure

- [x] 2.1 Create `src/config.ts` — zod schema for env vars (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID`, `CHRONOS_URL`)
- [x] 2.2 Create `src/middleware/owner-only.ts` — middleware that ignores messages from non-owner users
- [x] 2.3 Create `src/services/chronos.ts` — HTTP client wrapping all Chronos API calls with error handling

## 3. Commands

- [x] 3.1 Create `src/commands/help.ts` — `/start` and `/help` commands showing welcome message and command list
- [x] 3.2 Create `src/commands/timer.ts` — `/timer` (inline keyboard project picker → description prompt → start), `/stop`, `/status`
- [x] 3.3 Create `src/commands/clients.ts` — `/clientes` (list) and `/nuevo_cliente` (create with text reply)
- [x] 3.4 Create `src/commands/projects.ts` — `/proyectos` (client picker → project list) and `/nuevo_proyecto` (client picker → name → reportable toggle)
- [x] 3.5 Create `src/commands/reports.ts` — `/reporte` (client picker → send PDF) and `/entradas` (current week entries)

## 4. Callback Handler

- [x] 4.1 Create `src/callbacks/handler.ts` — dispatcher for inline keyboard callbacks (timer_start, select_client, report, etc.)

## 5. App Entrypoint

- [x] 5.1 Create `src/index.ts` — grammY bot setup, register middleware, commands, callbacks, start polling

## 6. Integration

- [x] 6.1 Register bot commands with BotFather format (setMyCommands) at startup
- [x] 6.2 Test full flow: /timer → pick project → add description → /stop → /reporte
