import {
  getActiveEntry,
  startEntry,
  stopEntry,
  getEntryById,
  getProjectById,
  getClientById,
} from "../db/queries.js";

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "< 1m";
}

export function getElapsedSeconds(startedAt: string): number {
  const start = new Date(startedAt + "Z").getTime();
  return Math.floor((Date.now() - start) / 1000);
}

export interface TimerStartResult {
  entry: ReturnType<typeof getEntryById>;
  stoppedPrevious?: {
    project_name: string;
    client_name: string;
    duration: string;
  };
  display: string;
}

export function handleStart(
  projectId: number,
  description?: string,
): TimerStartResult {
  const project = getProjectById(projectId);
  if (!project) {
    throw new TimerError("Proyecto no encontrado", 404);
  }

  const client = getClientById(project.client_id);
  if (!client) {
    throw new TimerError("Cliente no encontrado", 404);
  }

  let stoppedPrevious: TimerStartResult["stoppedPrevious"];

  // Auto-stop active timer
  const active = getActiveEntry();
  if (active) {
    stopEntry(active.id);
    const stopped = getEntryById(active.id);
    const duration = formatDuration(stopped?.duration_seconds ?? 0);
    stoppedPrevious = {
      project_name: active.project_name,
      client_name: active.client_name,
      duration,
    };
  }

  const newId = startEntry(projectId, description);
  const entry = getEntryById(newId);

  const desc = description ? ` — ${description}` : "";
  let display = `Timer iniciado: ${project.name}${desc}`;

  if (stoppedPrevious) {
    display = `Timer anterior detenido: ${stoppedPrevious.project_name} (${stoppedPrevious.duration}). ${display}`;
  }

  return { entry, stoppedPrevious, display };
}

export interface TimerStopResult {
  entry: ReturnType<typeof getEntryById>;
  display: string;
}

export function handleStop(): TimerStopResult {
  const active = getActiveEntry();
  if (!active) {
    throw new TimerError("No hay ningún timer activo", 400);
  }

  stopEntry(active.id);
  const entry = getEntryById(active.id);
  const duration = formatDuration(entry?.duration_seconds ?? 0);
  const desc = active.description ? ` — ${active.description}` : "";

  return {
    entry,
    display: `Timer detenido: ${active.project_name}${desc} (${duration})`,
  };
}

export function handleStatus() {
  const active = getActiveEntry();
  if (!active) {
    return { active: false as const, display: "No hay timer activo" };
  }

  const elapsed = getElapsedSeconds(active.started_at);
  const duration = formatDuration(elapsed);
  const desc = active.description ? ` — ${active.description}` : "";

  return {
    active: true as const,
    entry: {
      ...active,
      elapsed_seconds: elapsed,
      elapsed_display: duration,
    },
    display: `Timer activo: ${active.client_name} / ${active.project_name}${desc} (${duration})`,
  };
}

export class TimerError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TimerError";
  }
}
