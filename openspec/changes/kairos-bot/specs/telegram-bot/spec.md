## ADDED Requirements

### Requirement: Owner-only access
The bot SHALL only respond to messages from the configured Telegram owner ID (`TELEGRAM_OWNER_ID`). All other messages SHALL be silently ignored.

#### Scenario: Owner sends a command
- **WHEN** a message is received from user ID matching `TELEGRAM_OWNER_ID`
- **THEN** the bot processes the command normally

#### Scenario: Non-owner sends a command
- **WHEN** a message is received from a user ID that does NOT match `TELEGRAM_OWNER_ID`
- **THEN** the bot ignores the message completely (no response)

### Requirement: Centralized command routing
The bot SHALL act as the single Telegram entry point, routing commands to the appropriate Kairos service via HTTP.

#### Scenario: Chronos command
- **WHEN** the owner sends a time-tracking command (e.g., `/timer`, `/stop`)
- **THEN** the bot makes the corresponding HTTP request to the Chronos API and returns the response

#### Scenario: Service unreachable
- **WHEN** the bot cannot reach a backend service (connection refused, timeout)
- **THEN** the bot responds with a friendly error message in Spanish (e.g., "No puedo conectar con Chronos. ¿Está corriendo el servicio?")

### Requirement: Help command
The bot SHALL respond to `/help` with a list of all available commands and their descriptions in Spanish.

#### Scenario: User sends /help
- **WHEN** the owner sends `/help`
- **THEN** the bot responds with a formatted list of all commands grouped by category

### Requirement: Start command
The bot SHALL respond to `/start` (Telegram's default) with a welcome message and the same content as `/help`.

#### Scenario: User sends /start
- **WHEN** the owner sends `/start` (first interaction or restart)
- **THEN** the bot responds with a welcome message and command list
