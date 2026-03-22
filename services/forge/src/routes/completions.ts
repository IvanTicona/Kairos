import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod/v4";
import { nanoid } from "nanoid";
import { resolveModel, RouteError } from "../services/router.js";
import { createCompletion } from "../services/openai.js";
import { calculateCost } from "../services/cost.js";
import { logRequest } from "../db/logger.js";
import { TASK_TYPES } from "../types.js";

const completions = new Hono();

const requestSchema = z.object({
  task_type: z.enum(TASK_TYPES).optional(),
  model: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1, "At least one message is required"),
  service: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

completions.post("/v1/chat/completions", async (c) => {
  const requestId = nanoid();
  const startTime = Date.now();

  let body: z.infer<typeof requestSchema>;
  try {
    const raw = await c.req.json();
    body = requestSchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: err.issues }, 400);
    }
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  // Resolve model
  let model: string;
  let tier: string;
  try {
    const result = resolveModel(body.task_type, body.model);
    model = result.model;
    tier = result.tier;
  } catch (err) {
    if (err instanceof RouteError) {
      logRequest({
        request_id: requestId,
        model_used: null,
        tier: null,
        task_type: body.task_type ?? null,
        service: body.service ?? "unknown",
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: null,
        status: "error",
        error_message: err.message,
        duration_ms: Date.now() - startTime,
        metadata: body.metadata,
      });
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }

  // Call OpenAI
  try {
    const { response, tokensIn, tokensOut } = await createCompletion(
      model,
      body.messages,
    );

    const costUsd = calculateCost(model, tokensIn, tokensOut);
    const durationMs = Date.now() - startTime;

    logRequest({
      request_id: requestId,
      model_used: model,
      tier,
      task_type: body.task_type ?? null,
      service: body.service ?? "unknown",
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_usd: costUsd,
      status: "success",
      duration_ms: durationMs,
      metadata: body.metadata,
    });

    return c.json({
      ...response,
      _forge: {
        model_used: model,
        tier,
        cost_usd: costUsd,
        request_id: requestId,
      },
    });
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      err instanceof Error ? err.message : "Unknown OpenAI error";

    logRequest({
      request_id: requestId,
      model_used: model,
      tier,
      task_type: body.task_type ?? null,
      service: body.service ?? "unknown",
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: null,
      status: "error",
      error_message: errorMessage,
      duration_ms: durationMs,
      metadata: body.metadata,
    });

    const status = (isOpenAIError(err) ? err.status : 502) as ContentfulStatusCode;
    return c.json({ error: errorMessage, request_id: requestId }, status);
  }
});

function isOpenAIError(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  );
}

export { completions };
