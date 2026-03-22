## Why

Forge and Chronos are running as HTTP APIs, but Dorian needs a way to interact with them from his phone and desktop without opening a browser. Telegram is his primary interface — he already uses it for n8n pipelines and communication. A centralized bot routes commands to the appropriate service, so adding new services later doesn't require a new bot.

## What Changes

- New standalone service (`services/bot/`) — a Telegram bot that acts as the user interface for all Kairos services
- Owner-only access: bot only responds to Dorian's Telegram user ID, ignores everyone else
- Hybrid interaction: text commands for quick actions, inline keyboard buttons for selections (project picker, client picker)
- Phase 1 commands route to Chronos API for time tracking
- Bot forwards the `display` field from Chronos responses directly to the user — no re-formatting needed

## Capabilities

### New Capabilities
- `telegram-bot`: Centralized Telegram bot with owner-only access, command routing to internal services, and inline keyboard support
- `chronos-commands`: Telegram commands for time tracking — timer control, client/project management, and weekly reports

### Modified Capabilities

_None — this is a new service._

## Impact

- **New service**: `services/bot/` — TypeScript, grammy (Telegram bot framework), HTTP client for service calls
- **Docker**: New container added to `docker-compose.yml`, depends on chronos
- **Environment**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID`, `CHRONOS_URL` (internal Docker network URL)
- **External**: Requires a Telegram bot created via BotFather (KairosBot)
