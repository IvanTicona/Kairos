import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import pino from "pino";
import { config } from "./config.js";
import { health } from "./routes/health.js";
import { startSlackListener } from "./services/slack.js";

// Initialize DB (side-effect import triggers schema creation)
import "./db/client.js";

const log = pino({ name: "scribe" });

const app = new Hono();

app.use("*", honoLogger());

// Routes
app.route("/", health);

// Global error handler
app.onError((err, c) => {
  log.error({ err }, "Unhandled error");
  return c.json({ error: "Internal server error" }, 500);
});

// Start Slack listener
startSlackListener().catch((err) => {
  log.error({ err }, "Failed to start Slack listener");
  process.exit(1);
});

log.info({ port: config.SCRIBE_PORT }, "Scribe starting");

serve({ fetch: app.fetch, port: config.SCRIBE_PORT }, (info) => {
  log.info(`Scribe listening on http://localhost:${info.port}`);
});
