## ADDED Requirements

### Requirement: Store incoming User Stories
The system SHALL store every qualifying User Story message in SQLite with its raw text, Slack message ID, and a `pending` status before processing.

#### Scenario: New US received
- **WHEN** a qualifying message passes the Slack listener filter
- **THEN** the system inserts a record into `user_stories` with `status: 'pending'` and the raw text

### Requirement: Process US through Forge
The system SHALL send the raw US text to Forge `POST /v1/chat/completions` with `task_type: "reasoning"` and `service: "scribe"` for LLM-powered parsing and prompt generation.

#### Scenario: Successful Forge processing
- **WHEN** a pending US is sent to Forge with the system prompt and raw US text
- **THEN** the system receives a generated Claude Code prompt, stores it in the `generated_prompt` column, and updates `status` to `'processed'`

#### Scenario: Forge is unreachable
- **WHEN** the Forge API call fails due to connection error or timeout
- **THEN** the system updates `status` to `'error'`, stores the error message, and sends an error notification via Telegram

#### Scenario: Forge returns an LLM error
- **WHEN** the Forge API returns a non-2xx response (rate limit, invalid request, etc.)
- **THEN** the system updates `status` to `'error'`, stores the error details, and sends an error notification via Telegram

### Requirement: System prompt for US analysis
The system SHALL use a system prompt that instructs the LLM to perform the following analysis:

1. **Parse US fields** — identify which of the following are present: title, narrative (como/quiero/para), context, functional requirements, business rules, data schemas, acceptance criteria, technical considerations, expected result
2. **Flag missing fields** — list which standard US fields are absent
3. **Generate Claude Code prompt** — produce a structured prompt containing:
   - Task summary (one sentence)
   - Full US context (cleaned up and structured)
   - Acceptance criteria as a checklist
   - Technical approach suggestions
   - Questions to clarify before implementation

#### Scenario: US with all fields present
- **WHEN** a US contains title, narrative, acceptance criteria, business rules, and technical considerations
- **THEN** the generated prompt includes all sections and the "missing fields" section is empty or omitted

#### Scenario: US with missing fields
- **WHEN** a US is missing acceptance criteria and technical considerations
- **THEN** the generated prompt includes a "Missing from US" section listing the absent fields and suggests the developer clarify them

### Requirement: Prompt construction
The system SHALL construct the Forge request with a dedicated prompt builder that assembles the system prompt (static instructions) and user prompt (raw US text wrapped with extraction instructions).

#### Scenario: Prompt builder output
- **WHEN** the prompt builder receives raw US text
- **THEN** it returns an array of `ForgeChatMessage[]` with one system message (analysis instructions) and one user message (the raw US text)

### Requirement: Use Forge shared types
The system SHALL use `ForgeRequest`, `ForgeChatMessage`, and `ForgeResponse` types from `@kairos/shared` for all Forge API interactions.

#### Scenario: Type-safe Forge call
- **WHEN** the Forge client constructs a request
- **THEN** it uses `ForgeRequest` interface and validates the response against `ForgeResponse` structure
