import { db } from "./client.js";
import type { RequestLog } from "../types.js";

const insertStmt = db.prepare(`
  INSERT INTO requests (
    request_id, model_used, tier, task_type, service,
    tokens_in, tokens_out, cost_usd, status, error_message,
    duration_ms, metadata
  ) VALUES (
    @request_id, @model_used, @tier, @task_type, @service,
    @tokens_in, @tokens_out, @cost_usd, @status, @error_message,
    @duration_ms, @metadata
  )
`);

export function logRequest(entry: RequestLog): void {
  insertStmt.run({
    ...entry,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    cost_usd: entry.cost_usd ?? null,
    error_message: entry.error_message ?? null,
  });
}
