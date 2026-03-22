import { Hono } from "hono";
import { getEntries } from "../db/queries.js";
import { formatDuration } from "../services/timer.js";

const entries = new Hono();

entries.get("/v1/entries", (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const projectId = c.req.query("project_id");
  const clientId = c.req.query("client_id");

  const results = getEntries({
    from: from ?? undefined,
    to: to ?? undefined,
    project_id: projectId ? Number(projectId) : undefined,
    client_id: clientId ? Number(clientId) : undefined,
  });

  const totalSeconds = results.reduce(
    (sum, e) => sum + e.duration_seconds,
    0,
  );

  return c.json({
    data: results,
    display: `${results.length} entrada(s), total: ${formatDuration(totalSeconds)}`,
  });
});

export { entries };
