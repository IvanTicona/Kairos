import { Hono } from "hono";
import { db } from "../db/client.js";
import type { StatsResult } from "../types.js";

const stats = new Hono();

stats.get("/v1/stats", (c) => {
  const period = c.req.query("period") ?? "month";
  const service = c.req.query("service");
  const model = c.req.query("model");

  const dateFilter = getDateFilter(period);
  if (!dateFilter) {
    return c.json(
      { error: `Invalid period "${period}". Valid: day, week, month` },
      400,
    );
  }

  const conditions: string[] = [
    "timestamp >= @dateFrom",
    "status = 'success'",
  ];
  const params: Record<string, string> = { dateFrom: dateFilter };

  if (service) {
    conditions.push("service = @service");
    params.service = service;
  }

  if (model) {
    conditions.push("model_used = @model");
    params.model = model;
  }

  const where = conditions.join(" AND ");

  const totals = db
    .prepare(
      `
    SELECT
      COUNT(*) as total_requests,
      COALESCE(SUM(tokens_in), 0) as total_tokens_in,
      COALESCE(SUM(tokens_out), 0) as total_tokens_out,
      COALESCE(SUM(cost_usd), 0) as total_cost_usd
    FROM requests
    WHERE ${where}
  `,
    )
    .get(params) as {
    total_requests: number;
    total_tokens_in: number;
    total_tokens_out: number;
    total_cost_usd: number;
  };

  const byModel = db
    .prepare(
      `
    SELECT
      model_used as model,
      COUNT(*) as requests,
      COALESCE(SUM(tokens_in), 0) as tokens_in,
      COALESCE(SUM(tokens_out), 0) as tokens_out,
      COALESCE(SUM(cost_usd), 0) as cost_usd
    FROM requests
    WHERE ${where}
    GROUP BY model_used
    ORDER BY requests DESC
  `,
    )
    .all(params) as StatsResult["by_model"];

  const byService = db
    .prepare(
      `
    SELECT
      service,
      COUNT(*) as requests,
      COALESCE(SUM(cost_usd), 0) as cost_usd
    FROM requests
    WHERE ${where}
    GROUP BY service
    ORDER BY requests DESC
  `,
    )
    .all(params) as StatsResult["by_service"];

  const result: StatsResult = {
    ...totals,
    by_model: byModel,
    by_service: byService,
  };

  return c.json(result);
});

function getDateFilter(period: string): string | null {
  const now = new Date();

  switch (period) {
    case "day":
      return now.toISOString().slice(0, 10);
    case "week": {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      return monday.toISOString().slice(0, 10);
    }
    case "month":
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    default:
      return null;
  }
}

export { stats };
