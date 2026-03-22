import { config } from "../config.js";
import { TASK_TYPES, type TaskType } from "../types.js";

export interface RouteResult {
  model: string;
  tier: string;
}

export function resolveModel(taskType?: string, model?: string): RouteResult {
  if (model) {
    const tier = findTierForModel(model) ?? "manual";
    return { model, tier };
  }

  if (!taskType) {
    throw new RouteError(
      `Either "task_type" or "model" is required. Valid task_type values: ${TASK_TYPES.join(", ")}`,
    );
  }

  if (!TASK_TYPES.includes(taskType as TaskType)) {
    throw new RouteError(
      `Invalid task_type "${taskType}". Valid values: ${TASK_TYPES.join(", ")}`,
    );
  }

  const resolved = config.FORGE_TIER_MAP[taskType];
  if (!resolved) {
    throw new RouteError(`No model configured for task_type "${taskType}"`);
  }

  return { model: resolved, tier: taskType };
}

function findTierForModel(model: string): string | undefined {
  const tierMap = config.FORGE_TIER_MAP;
  return Object.entries(tierMap).find(([, m]) => m === model)?.[0];
}

export class RouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RouteError";
  }
}
