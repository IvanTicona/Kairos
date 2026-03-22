import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import pino from "pino";
import { config } from "./config.js";
import { health } from "./routes/health.js";
import { clients } from "./routes/clients.js";
import { projects } from "./routes/projects.js";
import { timer } from "./routes/timer.js";
import { entries } from "./routes/entries.js";
import { reports } from "./routes/reports.js";

const log = pino({ name: "chronos" });

const app = new Hono();

app.use("*", honoLogger());

app.route("/", health);
app.route("/", clients);
app.route("/", projects);
app.route("/", timer);
app.route("/", entries);
app.route("/", reports);

app.onError((err, c) => {
  log.error({ err }, "Unhandled error");
  return c.json({ error: "Internal server error" }, 500);
});

log.info({ port: config.CHRONOS_PORT }, "Chronos starting");

serve({ fetch: app.fetch, port: config.CHRONOS_PORT }, (info) => {
  log.info(`Chronos listening on http://localhost:${info.port}`);
});
