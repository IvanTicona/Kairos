# ⏳ Kairos

*El momento oportuno* — Mi ecosistema personal de productividad. Microservicios interconectados desplegados en VPS via Docker Compose.

## Stack

TypeScript · Hono · grammY · SQLite · Docker · pnpm workspaces

## Servicios

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| **Forge** | 3001 | LLM Router — Gateway API que rutea a modelo óptimo | ✅ Activo |
| **Chronos** | 3002 | Time Tracker — Bot de Telegram para registro de horas | ✅ Activo |
| **Cortex** | 3003 | Command Center — Dashboard web con contexto por rol | 🔲 Pendiente |
| **Scribe** | 3004 | US Parser — User Stories a checklist técnico | 🔲 Pendiente |
| **Nexus** | 3005 | Daily Automation — Genera standups para Slack | 🔲 Pendiente |
| **Bridge** | 3006 | Channel Unifier — Unifica notificaciones de trabajo | 🔲 Pendiente |
| **Bot** | — | Telegram Bot compartido — Rutea comandos a servicios | ✅ Activo |

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo-url> kairos
cd kairos
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys (Telegram, OpenAI, etc.)

# 3. Levantar servicios con Docker
docker compose up -d

# 4. Desarrollo local (sin Docker)
pnpm dev:forge    # o el servicio que estés desarrollando
```

## Estructura

```
kairos/
├── CLAUDE.md              # Instrucciones para Claude Code
├── openspec/              # Specs y cambios (OpenSpec)
│   ├── project.md         # Contexto completo del proyecto
│   ├── specs/             # Source of truth por servicio
│   └── changes/           # Cambios propuestos
├── services/              # Microservicios
│   ├── forge/
│   ├── chronos/
│   ├── cortex/
│   ├── scribe/
│   ├── nexus/
│   ├── bridge/
│   └── bot/
├── packages/
│   └── shared/            # Tipos y utilidades compartidas
└── docker-compose.yml
```

## Fases de Implementación

- **Phase 1:** Forge + Chronos + Bot ✅
- **Phase 2:** Scribe + Cortex (dependen de Forge)
- **Phase 3:** Nexus + Bridge + Multiverse
