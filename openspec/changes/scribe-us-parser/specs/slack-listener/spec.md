## ADDED Requirements

### Requirement: Connect to Slack via Socket Mode
The system SHALL establish a WebSocket connection to Slack using Socket Mode on startup, using the configured App-Level Token (`SLACK_APP_TOKEN`) and Bot Token (`SLACK_BOT_TOKEN`).

#### Scenario: Successful connection
- **WHEN** the service starts with valid Slack tokens
- **THEN** the system connects to Slack via Socket Mode and logs a confirmation message

#### Scenario: Invalid or missing tokens
- **WHEN** the service starts with invalid or missing Slack tokens
- **THEN** the system logs an error and exits with a non-zero status code

### Requirement: Listen to specific DM channel
The system SHALL only process messages from the configured Slack DM channel (`SLACK_CHANNEL_ID`, default `D0A55T5E4J0`).

#### Scenario: Message from monitored channel
- **WHEN** a message event is received from channel `D0A55T5E4J0`
- **THEN** the system evaluates the message for US content

#### Scenario: Message from other channel
- **WHEN** a message event is received from a channel other than the configured channel ID
- **THEN** the system ignores the message completely

### Requirement: Filter messages containing User Stories
The system SHALL only process messages whose text contains "User Story" (case-insensitive).

#### Scenario: Message contains "User Story"
- **WHEN** a message is received from the monitored channel with text containing "user story" (any case)
- **THEN** the system extracts the raw text and forwards it to the US processing pipeline

#### Scenario: Message without "User Story"
- **WHEN** a message is received from the monitored channel with text that does NOT contain "User Story"
- **THEN** the system ignores the message

### Requirement: Ignore non-message events
The system SHALL ignore bot messages, message edits, message deletions, and thread replies.

#### Scenario: Bot message received
- **WHEN** a message event has a `bot_id` or `subtype: "bot_message"`
- **THEN** the system ignores the message

#### Scenario: Message edit event
- **WHEN** a message event has `subtype: "message_changed"`
- **THEN** the system ignores the event

#### Scenario: Message deletion event
- **WHEN** a message event has `subtype: "message_deleted"`
- **THEN** the system ignores the event

### Requirement: Automatic reconnection
The system SHALL automatically reconnect to Slack when the WebSocket connection drops.

#### Scenario: Connection lost
- **WHEN** the Slack WebSocket connection is interrupted
- **THEN** the `@slack/socket-mode` client automatically reconnects and the system logs the reconnection event

### Requirement: Extract message metadata
The system SHALL extract the Slack message ID (`ts`), channel ID, and raw text from qualifying messages for downstream processing and deduplication.

#### Scenario: Duplicate message
- **WHEN** a message with a `slack_message_id` that already exists in the database is received
- **THEN** the system skips processing and logs a debug message
