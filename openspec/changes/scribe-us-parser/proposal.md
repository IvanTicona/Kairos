## Why

Dorian's leader sends User Stories via Slack DM, and turning them into actionable Claude Code prompts is a manual, repetitive process. Each US needs to be parsed, structured, checked for missing fields, and rewritten as a well-formed prompt — work that an LLM can do consistently and faster. Scribe automates this pipeline: listen on Slack, process through Forge, and deliver the ready-to-paste prompt via Telegram.

## What Changes

- New standalone service (`services/scribe/`) that connects to Slack via Socket Mode (WebSocket, no public endpoint required)
- Listens to a specific Slack DM channel (`D0A55T5E4J0`) for messages containing User Stories
- When a US is detected, sends the raw text to Forge for parsing and prompt generation (using the existing `task_type` routing)
- Forge processes the US with a system prompt that extracts structure (title, narrative, acceptance criteria, business rules, technical considerations), identifies missing fields, and generates a Claude Code-optimized prompt
- Delivers the generated prompt to Dorian via KairosBot's Telegram notification endpoint
- Optionally stores the original US and generated prompt in SQLite for history and reference

## Capabilities

### New Capabilities
- `slack-listener`: Slack Socket Mode connection to monitor a specific DM channel, filtering messages that contain User Stories
- `us-processing`: User Story parsing and Claude Code prompt generation via Forge LLM routing
- `telegram-notification`: Delivery of generated prompts to Dorian via KairosBot/Telegram

### Modified Capabilities

_None — this is a new service._

## Impact

- **New service**: `services/scribe/` — TypeScript, Hono, SQLite
- **Slack integration**: `@slack/socket-mode` + `@slack/web-api` via the "doriandev" Slack app
- **Docker**: New container added to `docker-compose.yml`, depends on forge and bot
- **Dependencies**: `hono`, `@slack/socket-mode`, `@slack/web-api`, `better-sqlite3`, `pino`, `zod`
- **Environment**: `SCRIBE_PORT` (3004), `SLACK_APP_TOKEN` (xapp-), `SLACK_BOT_TOKEN` (xoxb-), `FORGE_URL`, `BOT_URL`, `SLACK_CHANNEL_ID`
- **Slack app scopes**: `im:history`, `im:read` (bot token scopes)
