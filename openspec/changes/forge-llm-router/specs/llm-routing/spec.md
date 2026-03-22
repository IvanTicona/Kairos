## ADDED Requirements

### Requirement: Route requests by task type
The system SHALL accept a `task_type` field in the request and route the LLM call to the corresponding model tier. Supported task types: `quick`, `standard`, `reasoning`. The mapping from task type to model SHALL be configurable via environment variables.

#### Scenario: Automatic routing with task_type
- **WHEN** a caller sends a request with `task_type: "quick"` and no `model` field
- **THEN** the system routes the request to the model configured for the `quick` tier (default: `gpt-4o-mini`)

#### Scenario: Default tier mapping
- **WHEN** no custom tier mapping is provided in configuration
- **THEN** the system uses: `quick` → `gpt-4o-mini`, `standard` → `gpt-4o`, `reasoning` → `o4-mini`

### Requirement: Allow explicit model override
The system SHALL accept an optional `model` field in the request. When provided, the `model` field SHALL take precedence over `task_type` routing.

#### Scenario: Model override takes precedence
- **WHEN** a caller sends a request with both `task_type: "quick"` and `model: "gpt-4o"`
- **THEN** the system uses `gpt-4o` regardless of the task_type tier mapping

#### Scenario: Request with only model field
- **WHEN** a caller sends a request with `model: "gpt-4o-mini"` and no `task_type`
- **THEN** the system uses `gpt-4o-mini` directly

### Requirement: Require routing information
The system SHALL reject requests that provide neither `task_type` nor `model` with a 400 Bad Request error.

#### Scenario: Missing both task_type and model
- **WHEN** a caller sends a request without `task_type` and without `model`
- **THEN** the system responds with HTTP 400 and an error message indicating that either `task_type` or `model` is required

### Requirement: Validate task_type values
The system SHALL reject requests with an unrecognized `task_type` value with a 400 Bad Request error.

#### Scenario: Invalid task_type
- **WHEN** a caller sends a request with `task_type: "ultra"`
- **THEN** the system responds with HTTP 400 and an error message listing valid task_type values

### Requirement: Forward messages to OpenAI
The system SHALL forward the `messages` array to the OpenAI Chat Completions API using the resolved model and return the response to the caller.

#### Scenario: Successful completion
- **WHEN** a caller sends a valid request with messages
- **THEN** the system calls the OpenAI API with the resolved model and messages, and returns the OpenAI response augmented with `_forge` metadata (model_used, tier, cost_usd, request_id)

#### Scenario: OpenAI API error
- **WHEN** the OpenAI API returns an error (rate limit, invalid key, etc.)
- **THEN** the system returns the error to the caller with the corresponding HTTP status code and error details

### Requirement: Authenticate internal requests
The system SHALL require a valid API key in the `Authorization: Bearer <key>` header for all requests to `/v1/chat/completions`.

#### Scenario: Valid API key
- **WHEN** a request includes a valid `Authorization: Bearer <FORGE_API_KEY>` header
- **THEN** the system processes the request normally

#### Scenario: Missing or invalid API key
- **WHEN** a request is missing the Authorization header or provides an invalid key
- **THEN** the system responds with HTTP 401 Unauthorized
