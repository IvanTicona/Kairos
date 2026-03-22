import { Hono } from "hono";
import { z } from "zod/v4";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  handleStart,
  handleStop,
  handleStatus,
  TimerError,
} from "../services/timer.js";

const timer = new Hono();

const startSchema = z.object({
  project_id: z.number().int().positive(),
  description: z.string().optional(),
});

timer.post("/v1/timer/start", async (c) => {
  const body = await c.req.json();
  const parsed = startSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "project_id requerido", display: "Error: project_id requerido" },
      400,
    );
  }

  try {
    const result = handleStart(parsed.data.project_id, parsed.data.description);
    return c.json({ data: result.entry, display: result.display });
  } catch (err) {
    if (err instanceof TimerError) {
      return c.json(
        { error: err.message, display: `Error: ${err.message}` },
        err.status as ContentfulStatusCode,
      );
    }
    throw err;
  }
});

timer.post("/v1/timer/stop", (c) => {
  try {
    const result = handleStop();
    return c.json({ data: result.entry, display: result.display });
  } catch (err) {
    if (err instanceof TimerError) {
      return c.json(
        { error: err.message, display: err.message },
        err.status as ContentfulStatusCode,
      );
    }
    throw err;
  }
});

timer.get("/v1/timer/status", (c) => {
  const result = handleStatus();
  return c.json({ data: result, display: result.display });
});

export { timer };
