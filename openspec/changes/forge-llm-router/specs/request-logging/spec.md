## ADDED Requirements

### Requirement: Log every request to SQLite
The system SHALL log every request to the `/v1/chat/completions` endpoint in a SQLite database, regardless of success or failure.

#### Scenario: Successful request logged
- **WHEN** a request completes successfully
- **THEN** the system stores a log entry with: request_id, timestamp, model_used, tier, task_type, service (caller identity), tokens_in, tokens_out, cost_usd, status ("success"), and duration_ms

#### Scenario: Failed request logged
- **WHEN** a request fails (OpenAI error or validation error)
- **THEN** the system stores a log entry with: request_id, timestamp, model_used (if resolved), tier, task_type, service, tokens_in (0), tokens_out (0), cost_usd (0), status ("error"), error_message, and duration_ms

### Requirement: Calculate cost per request
The system SHALL calculate the estimated cost in USD for each request based on the model used and token counts (input and output), using a static pricing table.

#### Scenario: Cost calculation for gpt-4o-mini
- **WHEN** a request uses `gpt-4o-mini` with 1000 input tokens and 500 output tokens
- **THEN** the system calculates cost using the configured price per 1M tokens for gpt-4o-mini input and output rates

#### Scenario: Unknown model pricing
- **WHEN** a request uses a model not in the pricing table (via manual override)
- **THEN** the system logs the request with `cost_usd: null` and a warning, without failing the request

### Requirement: Track caller identity
The system SHALL accept an optional `service` field in the request body to identify which Kairos service made the call.

#### Scenario: Service field provided
- **WHEN** a request includes `service: "scribe"`
- **THEN** the log entry records `service: "scribe"`

#### Scenario: Service field omitted
- **WHEN** a request does not include a `service` field
- **THEN** the log entry records `service: "unknown"`

### Requirement: Store optional metadata
The system SHALL accept an optional `metadata` field (key-value pairs) in the request body and store it as JSON in the log entry.

#### Scenario: Metadata provided
- **WHEN** a request includes `metadata: { "user_story": "US-123" }`
- **THEN** the log entry stores the metadata JSON alongside other fields
