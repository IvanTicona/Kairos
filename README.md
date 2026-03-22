# ⏳ Kairos

*El momento oportuno* — Mi ecosistema personal de productividad. Microservicios interconectados desplegados en VPS via Docker Compose.

## Servicios

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| **Forge** | 3001 | LLM Router — Gateway API que rutea a modelo óptimo | 🔲 Pendiente |
| **Chronos** | 3002 | Time Tracker — Bot de Telegram para registro de horas | 🔲 Pendiente |
| **Cortex** | 3003 | Command Center — Dashboard web con contexto por rol | 🔲 Pendiente |
| **Scribe** | 3004 | US Parser — User Stories a checklist técnico | 🔲 Pendiente |
| **Nexus** | 3005 | Daily Automation — Genera standups para Slack | 🔲 Pendiente |
| **Bridge** | 3006 | Channel Unifier — Unifica notificaciones de trabajo | 🔲 Pendiente |
| **Bot** | — | Telegram Bot compartido — Rutea comandos a servicios | 🔲 Pendiente |

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo-url> kairos
cd kairos
pnpm install

# 2. Configurar
cp .env.example .env
# Editar .env con tus API keys

# 3. Desarrollo local
pnpm dev:forge    # o el servicio que estés desarrollando

# 4. Deploy a VPS
pnpm deploy
```

## AI Development Workflow

```bash
# 1. Inicializar OpenSpec (solo la primera vez)
openspec init --tools claude

# 2. Proponer un cambio
# En Claude Code:
/opsx:propose add-telegram-time-tracking

# 3. Implementar después de aprobar specs
/opsx:apply

# 4. Archivar cuando esté desplegado
/opsx:archive
```

## Estructura

```
kairos/
├── CLAUDE.md              # Instrucciones para Claude Code
├── KICKOFF.md             # Prompt de arranque con Flipped Interaction
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

- **Phase 1:** Forge + Chronos (sin dependencias entre sí)
- **Phase 2:** Scribe + Cortex (dependen de Forge)
- **Phase 3:** Nexus + Bridge + Multiverse
