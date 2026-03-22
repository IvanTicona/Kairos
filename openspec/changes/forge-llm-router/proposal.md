## Why

Every AI-powered service in Kairos (Scribe, Nexus, Cortex, Bridge) needs to call LLM APIs. Without a centralized router, each service would manage its own API keys, model selection, and cost tracking — duplicating logic and making it impossible to get a unified view of AI spend. Forge is the P1 dependency that all other AI services build on.

## What Changes

- New standalone service (`services/forge/`) acting as an HTTP API gateway for LLM requests
- Hybrid routing: callers can specify a model explicitly OR send a `task_type` and let Forge pick the optimal model tier automatically
- Configurable tier mapping (`task_type` → model) via environment variables, easy to adjust without code changes
- Request logging to SQLite: every call records timestamp, model used, task_type, tokens in/out, and estimated cost in USD
- Stats endpoint exposing aggregated usage and cost data, ready for Cortex dashboard consumption in Phase 2
- OpenAI as the only provider for MVP, with the provider abstraction designed to support additional providers later

## Capabilities

### New Capabilities
- `llm-routing`: Hybrid model routing — automatic tier selection by task_type with manual override support
- `request-logging`: Per-request logging with token counts and cost estimation to SQLite
- `usage-stats`: Aggregated usage and cost statistics exposed via HTTP endpoint

### Modified Capabilities

_None — this is a new service._

## Impact

- **New service**: `services/forge/` — TypeScript, Fastify or Hono, SQLite
- **New shared types**: `packages/shared/` — request/response types for Forge API, task_type enum
- **Docker**: New container added to `docker-compose.yml`, exposed on internal network
- **Nginx**: New server block needed on VPS to proxy `forge.dorian-redes.me` (or path-based routing)
- **Dependencies**: `openai` SDK, `better-sqlite3`, HTTP framework, `pino` for logging, `zod` for config validation
- **Environment**: `OPENAI_API_KEY`, tier mapping config, port config
