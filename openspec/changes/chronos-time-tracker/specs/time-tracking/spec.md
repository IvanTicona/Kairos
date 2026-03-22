## ADDED Requirements

### Requirement: Start a timer
The system SHALL allow starting a timer associated with a project and an optional description. The timer records the start timestamp and remains active until explicitly stopped or replaced.

#### Scenario: Start timer on a project
- **WHEN** a request is sent to `POST /v1/timer/start` with `{ project_id: 1, description: "diseño multitenant" }`
- **THEN** the system creates a new time entry with `started_at` set to the current timestamp, `stopped_at` as NULL, and returns the entry details with a `display` field in Spanish (e.g., "Timer iniciado: Golochtel — diseño multitenant")

#### Scenario: Start timer without description
- **WHEN** a request is sent to `POST /v1/timer/start` with `{ project_id: 1 }` and no description
- **THEN** the system creates the time entry with `description` as NULL

#### Scenario: Start timer with invalid project
- **WHEN** a request is sent with a `project_id` that does not exist
- **THEN** the system responds with HTTP 404 and an error message

### Requirement: Auto-stop on new timer
The system SHALL enforce that only one timer is active at a time. Starting a new timer SHALL automatically stop the currently active timer.

#### Scenario: Starting a timer while another is active
- **WHEN** timer A is running and a request starts timer B
- **THEN** the system stops timer A (sets `stopped_at` and calculates `duration_seconds`), starts timer B, and returns both actions in the response `display` field (e.g., "Timer anterior detenido: Golochtel (1h 30m). Timer iniciado: SLAN — fix endpoint")

#### Scenario: Starting a timer with no active timer
- **WHEN** no timer is currently active and a new timer is started
- **THEN** the system starts the new timer normally without any auto-stop action

### Requirement: Stop the active timer
The system SHALL allow stopping the currently active timer, calculating and storing the duration.

#### Scenario: Stop active timer
- **WHEN** a request is sent to `POST /v1/timer/stop` while a timer is active
- **THEN** the system sets `stopped_at` to the current timestamp, calculates `duration_seconds`, and returns the entry with `display` field (e.g., "Timer detenido: Golochtel — diseño multitenant (2h 15m)")

#### Scenario: Stop with no active timer
- **WHEN** a request is sent to `POST /v1/timer/stop` but no timer is active
- **THEN** the system responds with HTTP 400 and a message (e.g., "No hay ningún timer activo")

### Requirement: Check timer status
The system SHALL expose the current timer status, including whether a timer is running and its elapsed time.

#### Scenario: Active timer status
- **WHEN** a request is sent to `GET /v1/timer/status` while a timer is active
- **THEN** the system returns the active entry details including project name, client name, description, started_at, and current elapsed time

#### Scenario: No active timer
- **WHEN** a request is sent to `GET /v1/timer/status` with no active timer
- **THEN** the system returns `{ active: false }` with `display` field "No hay timer activo"

### Requirement: Query time entries
The system SHALL allow querying time entries with optional filters.

#### Scenario: Filter entries by date range
- **WHEN** a request is sent to `GET /v1/entries?from=2026-03-16&to=2026-03-22`
- **THEN** the system returns all completed time entries within that date range, ordered by `started_at` descending

#### Scenario: Filter entries by client
- **WHEN** a request is sent to `GET /v1/entries?client_id=1`
- **THEN** the system returns all entries for projects belonging to that client

#### Scenario: Filter entries by project
- **WHEN** a request is sent to `GET /v1/entries?project_id=2`
- **THEN** the system returns all entries for that specific project
