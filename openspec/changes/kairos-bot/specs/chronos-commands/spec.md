## ADDED Requirements

### Requirement: Start timer with project picker
The bot SHALL allow starting a timer using `/timer`, presenting an inline keyboard with available projects grouped by client.

#### Scenario: User sends /timer
- **WHEN** the owner sends `/timer`
- **THEN** the bot fetches clients and projects from Chronos and displays an inline keyboard with project buttons grouped by client name

#### Scenario: User selects a project
- **WHEN** the owner taps a project button from the inline keyboard
- **THEN** the bot asks for a description via text reply (with option to skip via `/skip`)

#### Scenario: User provides description
- **WHEN** the owner replies with a description text
- **THEN** the bot calls Chronos `POST /v1/timer/start` with the selected project_id and description, and displays the `display` field from the response

#### Scenario: User skips description
- **WHEN** the owner sends `/skip` instead of a description
- **THEN** the bot calls Chronos `POST /v1/timer/start` with the selected project_id and no description

### Requirement: Stop timer
The bot SHALL stop the active timer when the owner sends `/stop`.

#### Scenario: Active timer stopped
- **WHEN** the owner sends `/stop` and a timer is active
- **THEN** the bot calls Chronos `POST /v1/timer/stop` and displays the `display` field (including duration)

#### Scenario: No active timer
- **WHEN** the owner sends `/stop` and no timer is active
- **THEN** the bot displays the error message from Chronos ("No hay ningún timer activo")

### Requirement: Timer status
The bot SHALL show the current timer status when the owner sends `/status`.

#### Scenario: Active timer
- **WHEN** the owner sends `/status` and a timer is running
- **THEN** the bot displays project name, description, and elapsed time from Chronos

#### Scenario: No active timer
- **WHEN** the owner sends `/status` and no timer is running
- **THEN** the bot displays "No hay timer activo"

### Requirement: List clients
The bot SHALL list all clients when the owner sends `/clientes`.

#### Scenario: Clients exist
- **WHEN** the owner sends `/clientes`
- **THEN** the bot displays a numbered list of all clients

### Requirement: Create client
The bot SHALL allow creating a new client via `/nuevo_cliente`.

#### Scenario: Create client flow
- **WHEN** the owner sends `/nuevo_cliente`
- **THEN** the bot asks for the client name, waits for a text reply, calls Chronos `POST /v1/clients`, and displays the result

### Requirement: List projects
The bot SHALL list projects when the owner sends `/proyectos`, using inline buttons to select a client first.

#### Scenario: User sends /proyectos
- **WHEN** the owner sends `/proyectos`
- **THEN** the bot shows inline keyboard with client buttons

#### Scenario: User selects a client
- **WHEN** the owner taps a client button
- **THEN** the bot fetches and displays projects for that client, showing the reportable status

### Requirement: Create project
The bot SHALL allow creating a new project via `/nuevo_proyecto`.

#### Scenario: Create project flow
- **WHEN** the owner sends `/nuevo_proyecto`
- **THEN** the bot shows inline keyboard to pick a client, then asks for project name, then asks if it should be reportable (inline buttons Sí/No), then calls Chronos and displays the result

### Requirement: Weekly report
The bot SHALL generate and send a weekly report when the owner sends `/reporte`.

#### Scenario: User sends /reporte
- **WHEN** the owner sends `/reporte`
- **THEN** the bot shows inline keyboard with client buttons

#### Scenario: User selects client for report
- **WHEN** the owner taps a client button
- **THEN** the bot fetches the weekly report PDF from Chronos and sends it as a document in the chat, with the JSON summary as the caption

### Requirement: Recent entries
The bot SHALL show recent time entries when the owner sends `/entradas`.

#### Scenario: Entries exist
- **WHEN** the owner sends `/entradas`
- **THEN** the bot fetches entries for the current week from Chronos and displays them as a formatted list with project, description, date, and duration

#### Scenario: No entries
- **WHEN** the owner sends `/entradas` and no entries exist for the current week
- **THEN** the bot displays "No hay entradas esta semana"
