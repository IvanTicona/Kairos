# Kairos — Personal Productivity Stack

*καιρός (kairos): the opportune moment — doing the right thing at the right time*

## Owner
Dorian — Solo developer, university student at UPB (Universidad Privada Boliviana), La Paz, Bolivia.

## Purpose
A personal ecosystem of interconnected microservices running on a private VPS, designed to maximize productivity across multiple simultaneous roles. All tools are for personal use only (single user: Dorian).

## Current Roles & Context

### 1. SLAN (Primary Job)
- **What:** Backend developer at a neobank fintech startup in Cancún, Mexico
- **Mode:** Remote from La Paz, Bolivia
- **Communication:** Slack (daily standups), tasks delivered as User Stories (US format, recently standardized)
- **Stack:** Backend development (details TBD per project)

### 2. Freelance for Paul (Docente/Tutor)
- **What:** Multiple tasks — class material preparation, software development
- **Key Project:** Golochtel (ISP company) — building multitenant architecture foundations for future scaling
- **Communication:** Verbal (in-person at UPB), Telegram (group with 4 tutorados for thesis feedback)
- **Pain Point:** No formal hour tracking; days with zero tasks alternate with double-work days. Paul needs visibility into hours worked per task/project.

### 3. Thena (Graduation Project)
- **What:** AI-assisted academic mentoring system with 3-layer RAG architecture and multi-agent document review
- **Tutor:** Paul
- **Communication:** Telegram group (4 students + Paul)
- **Status:** Requirements phase complete (11 functional, 6 non-functional requirements across 5 modules)

### 4. New AI Startup (Upcoming)
- **What:** AI-focused startup, details TBD
- **Status:** Potentially joining next week

## Tech Environment
- **OS:** Windows (laptop), iPhone (mobile)
- **Terminal:** PowerShell (customized profile with CP utilities like `ncpp`)
- **Editor:** Geany (for competitive programming), Claude Code (for AI-assisted development)
- **AI Dev Stack:** Claude Code + OpenSpec + Flipped Interaction Pattern
- **Automation:** n8n (existing pipeline: Telegram → Perplexity → Claude → PDF/PPTX)
- **Deployment:** Vercel (via GitHub Actions), VPS (idle, to be utilized)
- **Languages:** Spanish (primary for academic work), English (technical)

## Architecture Philosophy
- **Single-user system** — no auth complexity beyond basic API key/token protection
- **Docker Compose** orchestration on VPS
- **Reverse proxy** (Caddy or Traefik) for routing
- **Telegram as primary interface** — most tools should be accessible via Telegram bot
- **LLM Router pattern** — centralized API gateway that routes to cheapest adequate model
- **Modular microservices** — each tool is independent but can communicate with others

## Project Registry

### Active (Build Now)
| ID | Codename | Description | Priority |
|----|----------|-------------|----------|
| P1 | **Forge** | LLM Router — API gateway that routes requests to optimal model (GPT-5 Nano/Mini/Sonnet) based on task complexity. Central backend for all other tools. | 🔴 Critical (dependency) |
| P2 | **Chronos** | Time Tracker — Telegram bot for logging work hours per client/project. Weekly PDF/HTML reports for Paul. | 🔴 Critical (immediate need) |
| P3 | **Cortex** | Command Center — Web dashboard showing active tasks, timers, and context per role. Weekly hour reports per client. | 🟡 High |
| P4 | **Scribe** | US Parser — Receives User Stories (from Slack or Telegram), generates technical breakdown and subtask checklist. | 🟡 High |
| P5 | **Nexus** | Daily Standup Automation — Generates SLAN daily standup draft from git activity + logged time, sends to Telegram for approval before posting to Slack. | 🟢 Medium |
| P6 | **Bridge** | Channel Unifier — Aggregates work notifications from Slack, Telegram into single prioritized feed. | 🟢 Medium |
| P7 | **Multiverse** | Dev Identity Manager — PowerShell tooling to switch Git config, env vars, and context between projects/clients. | 🟢 Medium |

### Deferred (Not Now)
| ID | Codename | Description | Reason |
|----|----------|-------------|--------|
| D1 | Oracle | AI-powered class material generator (extends n8n pipeline) | Paul's workload not urgent enough |
| D2 | Sentinel-MT | Multitenant architecture monitor for Golochtel | Golochtel still in early design |
| D3 | Thena Lab | Dev/test environment for graduation project RAG system | Thena not in implementation phase yet |

## Dependency Graph
```
Forge (P1) ← foundation, all AI-powered tools depend on this
  ├── Scribe (P4) uses Forge for LLM calls
  ├── Nexus (P5) uses Forge for daily generation
  ├── Cortex (P3) uses Forge for context summaries
  └── Bridge (P6) uses Forge for notification prioritization

Chronos (P2) ← standalone, no LLM dependency
  └── Cortex (P3) pulls time data from Chronos

Multiverse (P7) ← standalone, local PowerShell only
```

## Implementation Order
1. **Phase 1:** Forge (P1) + Chronos (P2) — in parallel, no dependencies between them
2. **Phase 2:** Scribe (P4) + Cortex (P3) — after Forge is running
3. **Phase 3:** Nexus (P5) + Bridge (P6) + Multiverse (P7)

## Conventions
- **Language:** Code in English, user-facing strings in Spanish
- **Monorepo:** All projects live in a single repo under `packages/` or `services/`
- **Docker:** Each service has its own Dockerfile + shared docker-compose.yml
- **Specs:** OpenSpec in `openspec/` at repo root, capabilities organized by service codename
- **Commits:** Conventional commits (`feat(forge):`, `fix(chronos):`, etc.)
- **Branches:** `main` → production, `dev` → integration, feature branches per service
