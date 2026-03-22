## Context

Kairos is a monorepo of personal productivity microservices. Forge is the first service to be built (P1) — it acts as the centralized LLM API gateway that all other AI-powered services will call. Currently no services exist; this is greenfield.

Dorian has an OpenAI API key. The VPS runs Ubuntu 24.04 with Docker Compose and Nginx. Domain is `dorian-redes.me` with HTTPS.

## Goals / Non-Goals

**Goals:**
- Single HTTP API that accepts LLM requests and routes them to the right OpenAI model
- Hybrid routing: explicit model selection OR automatic tier selection by `task_type`
- Configurable tier→model mapping without code changes
- Per-request logging with token counts and cost estimation
- Aggregated stats endpoint for downstream consumption (Cortex in Phase 2)

**Non-Goals:**
- Multi-provider support (Anthropic, etc.) — architecture allows it, but not implemented in MVP
- Streaming responses — batch only for MVP
- Rate limiting or quota management
- Caching or prompt deduplication
- Authentication beyond internal API key (single user system, services on same Docker network)

## Decisions

### HTTP Framework: Hono

**Choice:** Hono over Fastify/Express.

**Why:** Lightweight (~14kb), TypeScript-first, runs on Node.js. Perfect for a focused API gateway with few routes. Faster cold starts in Docker. Fastify is more mature but heavier than needed for 4-5 routes.

### Database: better-sqlite3

**Choice:** SQLite via `better-sqlite3` over PostgreSQL.

**Why:** Single user, append-heavy workload (logging requests), no concurrent write pressure. SQLite is zero-config, no separate container needed, and the data is easy to back up (single file). Can migrate to PostgreSQL later if multi-service writes become a bottleneck.

### Model Tier Mapping: Environment-based config

**Choice:** JSON config in environment variable (`FORGE_TIER_MAP`) validated at startup with zod.

**Why:** Easy to change without rebuilding the container. Default tiers:
- `quick`: `gpt-4o-mini` — fast, cheap tasks (summaries, formatting, simple chat)
- `standard`: `gpt-4o` — general-purpose tasks (analysis, code review, content generation)
- `reasoning`: `o4-mini` — complex reasoning tasks (architecture decisions, multi-step analysis)

Callers send `task_type` which maps to a tier, or override with explicit `model` field.

### Cost Estimation: Static pricing table

**Choice:** Hardcoded pricing per model (input/output per 1M tokens), updated manually.

**Why:** OpenAI pricing changes infrequently. A static lookup table is simple and accurate enough. No need for a pricing API call. Table lives in config, easy to update.

### API Design

Single endpoint: `POST /v1/chat/completions`

```typescript
// Request
{
  task_type?: "quick" | "standard" | "reasoning",  // auto-routing
  model?: string,                                     // manual override (takes precedence)
  messages: ChatMessage[],
  service?: string,                                   // caller identity for logging
  metadata?: Record<string, string>                   // arbitrary context for logs
}

// Response — passthrough from OpenAI with added metadata
{
  ...OpenAIResponse,
  _forge: {
    model_used: string,
    tier: string,
    cost_usd: number,
    request_id: string
  }
}
```

Stats endpoint: `GET /v1/stats`
- Query params: `period` (day/week/month), `service`, `model`
- Returns: total requests, total tokens, total cost, breakdown by model and service

Health endpoint: `GET /health`

### Project Structure

```
services/forge/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Hono app, server startup
│   ├── config.ts          # Zod-validated env config
│   ├── routes/
│   │   ├── completions.ts # POST /v1/chat/completions
│   │   ├── stats.ts       # GET /v1/stats
│   │   └── health.ts      # GET /health
│   ├── services/
│   │   ├── router.ts      # Tier resolution logic
│   │   ├── openai.ts      # OpenAI SDK wrapper
│   │   └── cost.ts        # Pricing table + cost calculation
│   ├── db/
│   │   ├── client.ts      # SQLite connection
│   │   ├── schema.sql     # Table definitions
│   │   └── logger.ts      # Request logging queries
│   └── types.ts           # Shared types
```

### Internal Auth

Simple shared API key (`FORGE_API_KEY` env var). Services on the Docker network include it in `Authorization: Bearer <key>` header. No JWT, no sessions.

## Risks / Trade-offs

- **[Single provider lock-in]** → Mitigated by abstracting the provider call behind `openai.ts`. Adding a new provider means adding one file + updating router logic. Not building the abstraction layer now to avoid YAGNI.
- **[SQLite write contention under load]** → Non-issue for single user. If multiple services hammer Forge simultaneously, WAL mode handles it. Can migrate to PostgreSQL if needed.
- **[Stale cost estimates]** → Pricing table is static. If OpenAI changes pricing, estimates drift until manually updated. Acceptable for personal cost tracking.
- **[No streaming]** → Some use cases (chat) benefit from streaming. Deferred to a future change — batch is simpler and sufficient for automated service-to-service calls.
