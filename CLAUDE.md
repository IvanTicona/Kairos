# CLAUDE.md — Instructions for Claude Code

## Project Overview
Kairos (καιρός — "the opportune moment") is Dorian's personal productivity ecosystem — a monorepo of interconnected microservices deployed on a private VPS via Docker Compose. Read `openspec/project.md` for full context on roles, projects, and architecture.

## OpenSpec Workflow
This project uses OpenSpec for spec-driven development. Before implementing any feature:
1. Read relevant specs in `openspec/specs/[service]/spec.md`
2. Check pending changes in `openspec/changes/`
3. Use `/opsx:propose` before writing code for any new capability
4. Use `/opsx:apply` only after specs are reviewed
5. Use `/opsx:archive` after deployment

## Flipped Interaction Pattern
When Dorian describes a feature or requirement vaguely, **ask clarifying questions** before implementing. Prioritize understanding the "why" and edge cases. Ask one question at a time. Don't assume — ask.

## Code Conventions
- **Language:** TypeScript (Node.js) for services, Python only if a specific library requires it
- **Package Manager:** pnpm (workspaces for monorepo)
- **Code style:** English for code, Spanish for user-facing strings and Telegram bot responses
- **Commits:** Conventional commits — `feat(forge): add model routing logic`
- **Error handling:** Always handle errors explicitly, never swallow exceptions
- **Logging:** Structured JSON logs (pino or similar)
- **Config:** Environment variables via `.env` files, validated at startup with zod

## Architecture Rules
- Each service is a standalone Docker container
- Services communicate via HTTP REST (internal Docker network)
- Forge (LLM Router) is the only service that calls external AI APIs
- Telegram bot is the primary user interface — most services expose Telegram commands
- No authentication beyond API keys (single user system)
- All data stored locally (SQLite or PostgreSQL in Docker)

## File Structure
```
kairos/
├── CLAUDE.md              ← you are here
├── docker-compose.yml
├── .env.example
├── openspec/
│   ├── project.md
│   ├── AGENTS.md
│   └── specs/
│       ├── forge/
│       ├── chronos/
│       ├── cortex/
│       ├── scribe/
│       ├── nexus/
│       ├── bridge/
│       └── multiverse/
├── services/
│   ├── forge/             ← LLM Router API Gateway
│   ├── chronos/           ← Time Tracker + Telegram Bot
│   ├── cortex/            ← Web Dashboard
│   ├── scribe/            ← US Parser
│   ├── nexus/             ← Daily Automation
│   ├── bridge/            ← Channel Unifier
│   └── bot/               ← Shared Telegram Bot (routes commands to services)
├── packages/
│   └── shared/            ← Shared types, utils, Telegram helpers
└── scripts/
    └── deploy.sh
```

## Key Decisions
- **Why monorepo?** Dorian is solo — shared types and a single deploy pipeline reduce overhead
- **Why Telegram?** Dorian uses iPhone + Windows. Telegram works on both, has great bot API, and he already uses it for n8n pipelines and Thena group
- **Why SQLite first?** Single user, simple data. Can migrate to PostgreSQL later if needed
- **Why Forge as P1?** It's the shared dependency — every AI-powered service routes through it for cost optimization and centralized logging

## What NOT to do
- Don't over-engineer auth — this is a personal tool
- Don't add features beyond the current spec without proposing first
- Don't use heavyweight frameworks when lightweight alternatives exist
- Don't create separate repos — everything lives here
- Don't deploy to cloud services — everything goes to the VPS via Docker
