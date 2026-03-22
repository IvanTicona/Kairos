## ADDED Requirements

### Requirement: Generate weekly report
The system SHALL generate weekly time reports for a specific client, showing hours worked per project with descriptions.

#### Scenario: Weekly report for a client
- **WHEN** a request is sent to `GET /v1/reports/weekly?client_id=1&week=2026-03-16`
- **THEN** the system returns a report covering Monday 2026-03-16 through Sunday 2026-03-22, with hours grouped by project, individual entries with descriptions and durations, project subtotals, and a grand total

### Requirement: Exclude non-reportable projects
The system SHALL exclude projects with `reportable: false` from generated reports.

#### Scenario: Non-reportable project excluded
- **WHEN** a client has projects "Golochtel" (reportable: true) and "Tutoría" (reportable: false), and both have time entries in the week
- **THEN** the report only includes "Golochtel" entries and totals

### Requirement: Report in PDF format
The system SHALL generate reports in PDF format when requested.

#### Scenario: PDF report
- **WHEN** a request is sent to `GET /v1/reports/weekly?client_id=1&week=2026-03-16&format=pdf`
- **THEN** the system returns a PDF file with Content-Type `application/pdf`, containing the weekly breakdown with client name, date range, project sections, entry details, and totals

### Requirement: Report in HTML format
The system SHALL generate reports in HTML format when requested.

#### Scenario: HTML report
- **WHEN** a request is sent to `GET /v1/reports/weekly?client_id=1&week=2026-03-16&format=html`
- **THEN** the system returns an HTML document with the same breakdown as the PDF, styled for readability

### Requirement: Default report format
The system SHALL default to JSON format when no `format` parameter is provided.

#### Scenario: Default JSON response
- **WHEN** a request is sent to `GET /v1/reports/weekly?client_id=1&week=2026-03-16` without a `format` parameter
- **THEN** the system returns the report data as structured JSON

### Requirement: Default to current week
The system SHALL default to the current week when no `week` parameter is provided.

#### Scenario: No week specified
- **WHEN** a request is sent to `GET /v1/reports/weekly?client_id=1` without a `week` parameter
- **THEN** the system generates the report for the current week (Monday to now)

### Requirement: Require client for reports
The system SHALL require a `client_id` parameter for report generation.

#### Scenario: Missing client_id
- **WHEN** a request is sent to `GET /v1/reports/weekly` without `client_id`
- **THEN** the system responds with HTTP 400 and a message indicating client_id is required

### Requirement: Handle empty report
The system SHALL return a valid report even when no time entries exist for the given period.

#### Scenario: No entries in period
- **WHEN** a report is requested for a week with no time entries
- **THEN** the system returns a report with zero totals and an empty project breakdown
