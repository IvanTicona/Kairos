import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import pino from "pino";
import { config } from "./config.js";
import { health } from "./routes/health.js";
import { completions } from "./routes/completions.js";
import { stats } from "./routes/stats.js";
import { authMiddleware } from "./middleware/auth.js";

const log = pino({ name: "forge" });

const app = new Hono();

app.use("*", honoLogger());

// Public routes
app.route("/", health);

// Protected routes
const api = new Hono();
api.use("*", authMiddleware);
api.route("/", completions);
api.route("/", stats);

app.route("/", api);

// Global error handler
app.onError((err, c) => {
  log.error({ err }, "Unhandled error");
  return c.json({ error: "Internal server error" }, 500);
});

log.info(
  { port: config.FORGE_PORT, tiers: config.FORGE_TIER_MAP },
  "Forge starting",
);

serve({ fetch: app.fetch, port: config.FORGE_PORT }, (info) => {
  log.info(`Forge listening on http://localhost:${info.port}`);
});
