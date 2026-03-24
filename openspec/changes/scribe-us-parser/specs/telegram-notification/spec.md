## ADDED Requirements

### Requirement: Deliver generated prompt via Telegram
The system SHALL send the generated Claude Code prompt to Dorian via an HTTP POST to KairosBot's internal notify endpoint (`POST /internal/notify`).

#### Scenario: Successful delivery
- **WHEN** a US is successfully processed and a prompt is generated
- **THEN** the system sends the prompt to `BOT_URL/internal/notify` with `{ chat_id: TELEGRAM_OWNER_ID, text: formatted_prompt, parse_mode: "HTML" }` and the bot forwards it to Telegram

#### Scenario: Bot is unreachable
- **WHEN** the HTTP call to the bot's notify endpoint fails (connection refused, timeout)
- **THEN** the system logs the error but does NOT crash — the generated prompt is still stored in SQLite for later retrieval

### Requirement: HTML message formatting
The system SHALL format the generated prompt using HTML tags consistent with KairosBot's parse mode.

#### Scenario: Formatted output
- **WHEN** the generated prompt is prepared for Telegram delivery
- **THEN** the system wraps it with HTML formatting: `<b>` for section headers, `<code>` for code references, `<pre>` for code blocks

### Requirement: Split long messages
The system SHALL split messages that exceed Telegram's 4096 character limit into multiple sequential messages.

#### Scenario: Prompt under 4096 characters
- **WHEN** the formatted prompt is 4096 characters or fewer
- **THEN** the system sends it as a single message

#### Scenario: Prompt over 4096 characters
- **WHEN** the formatted prompt exceeds 4096 characters
- **THEN** the system splits it into multiple messages at line boundaries, each under 4096 characters, and sends them sequentially

#### Scenario: Partial send failure
- **WHEN** the first chunk is sent successfully but a subsequent chunk fails
- **THEN** the system logs the error for the failed chunk but does not retry — Dorian receives a partial prompt and can check SQLite for the full version

### Requirement: Error notification via Telegram
The system SHALL send error notifications to Dorian when US processing fails.

#### Scenario: Processing error notification
- **WHEN** Forge processing fails for a User Story
- **THEN** the system sends a message to Dorian via the bot: "No pude procesar la User Story. Error: {error_message}"

### Requirement: KairosBot internal notify endpoint
KairosBot SHALL expose a new `POST /internal/notify` HTTP endpoint on its internal port for receiving notification requests from other services.

#### Scenario: Valid notify request
- **WHEN** a service sends `POST /internal/notify` with `{ chat_id: number, text: string, parse_mode?: "HTML" }`
- **THEN** the bot sends the message to the specified Telegram chat and returns `{ ok: true }`

#### Scenario: Invalid notify request
- **WHEN** a request is missing `chat_id` or `text`
- **THEN** the bot returns HTTP 400 with an error message

#### Scenario: Telegram API error
- **WHEN** the bot receives a valid notify request but the Telegram API call fails
- **THEN** the bot returns HTTP 502 with the error details
