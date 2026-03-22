## ADDED Requirements

### Requirement: Expose usage statistics endpoint
The system SHALL expose a `GET /v1/stats` endpoint that returns aggregated usage and cost data.

#### Scenario: Default stats (current month)
- **WHEN** a caller requests `GET /v1/stats` without query parameters
- **THEN** the system returns aggregated stats for the current month: total_requests, total_tokens_in, total_tokens_out, total_cost_usd, and breakdown by model

### Requirement: Filter stats by time period
The system SHALL accept a `period` query parameter to filter stats by time range.

#### Scenario: Weekly stats
- **WHEN** a caller requests `GET /v1/stats?period=week`
- **THEN** the system returns aggregated stats for the current week (Monday to now)

#### Scenario: Daily stats
- **WHEN** a caller requests `GET /v1/stats?period=day`
- **THEN** the system returns aggregated stats for the current day

### Requirement: Filter stats by service
The system SHALL accept a `service` query parameter to filter stats by caller identity.

#### Scenario: Stats for specific service
- **WHEN** a caller requests `GET /v1/stats?service=scribe`
- **THEN** the system returns aggregated stats only for requests where `service` is "scribe"

### Requirement: Filter stats by model
The system SHALL accept a `model` query parameter to filter stats by model used.

#### Scenario: Stats for specific model
- **WHEN** a caller requests `GET /v1/stats?model=gpt-4o-mini`
- **THEN** the system returns aggregated stats only for requests that used `gpt-4o-mini`

### Requirement: Combine stat filters
The system SHALL allow combining `period`, `service`, and `model` query parameters.

#### Scenario: Combined filters
- **WHEN** a caller requests `GET /v1/stats?period=week&service=scribe&model=gpt-4o`
- **THEN** the system returns stats for requests matching ALL filters (this week AND service=scribe AND model=gpt-4o)

### Requirement: Authenticate stats requests
The stats endpoint SHALL require the same API key authentication as the completions endpoint.

#### Scenario: Unauthenticated stats request
- **WHEN** a caller requests `GET /v1/stats` without a valid Authorization header
- **THEN** the system responds with HTTP 401 Unauthorized
