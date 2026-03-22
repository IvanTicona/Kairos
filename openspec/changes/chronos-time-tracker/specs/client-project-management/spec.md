## ADDED Requirements

### Requirement: Create a client
The system SHALL allow creating clients with a unique name.

#### Scenario: Create client successfully
- **WHEN** a request is sent to `POST /v1/clients` with `{ name: "Paul" }`
- **THEN** the system creates the client and returns its details with `display` field (e.g., "Cliente creado: Paul")

#### Scenario: Duplicate client name
- **WHEN** a request is sent to create a client with a name that already exists
- **THEN** the system responds with HTTP 409 and a message indicating the name is taken

### Requirement: List clients
The system SHALL allow listing all clients.

#### Scenario: List all clients
- **WHEN** a request is sent to `GET /v1/clients`
- **THEN** the system returns an array of all clients ordered by name

### Requirement: Create a project under a client
The system SHALL allow creating projects associated with a client, with an optional `reportable` flag (default: `true`).

#### Scenario: Create reportable project
- **WHEN** a request is sent to `POST /v1/clients/1/projects` with `{ name: "Golochtel" }`
- **THEN** the system creates the project with `reportable: true` and returns its details

#### Scenario: Create non-reportable project
- **WHEN** a request is sent to `POST /v1/clients/1/projects` with `{ name: "Tutoría", reportable: false }`
- **THEN** the system creates the project with `reportable: false`

#### Scenario: Create project for non-existent client
- **WHEN** a request is sent to create a project under a client_id that doesn't exist
- **THEN** the system responds with HTTP 404

### Requirement: List projects for a client
The system SHALL allow listing all projects for a given client.

#### Scenario: List client projects
- **WHEN** a request is sent to `GET /v1/clients/1/projects`
- **THEN** the system returns all projects for that client, including the `reportable` flag

### Requirement: Unique project names per client
The system SHALL enforce unique project names within the same client.

#### Scenario: Duplicate project name under same client
- **WHEN** a request creates a project named "Golochtel" under client 1, and a project with that name already exists under client 1
- **THEN** the system responds with HTTP 409

#### Scenario: Same project name under different clients
- **WHEN** client 1 has a project "Backend" and a request creates a project "Backend" under client 2
- **THEN** the system creates the project successfully (names are unique per client, not globally)
