import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { Bot } from "grammy";
import pino from "pino";
import { config } from "./config.js";
import { ownerOnly } from "./middleware/owner-only.js";
import { registerHelpCommands } from "./commands/help.js";
import { registerTimerCommands } from "./commands/timer.js";
import { registerClientCommands } from "./commands/clients.js";
import { registerProjectCommands } from "./commands/projects.js";
import { registerReportCommands } from "./commands/reports.js";
import { registerCallbacks } from "./callbacks/handler.js";
import { health } from "./routes/health.js";
import { createInternalRoutes } from "./routes/internal.js";

const log = pino({ name: "kairos-bot" });

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// Owner-only filter — must be first
bot.use(ownerOnly);

// Register commands
registerHelpCommands(bot);
registerTimerCommands(bot);
registerClientCommands(bot);
registerProjectCommands(bot);
registerReportCommands(bot);

// Register inline keyboard callbacks
registerCallbacks(bot);

// Set bot commands in Telegram menu
await bot.api.setMyCommands([
  { command: "timer", description: "Iniciar un timer" },
  { command: "stop", description: "Detener el timer activo" },
  { command: "status", description: "Ver timer actual" },
  { command: "clientes", description: "Listar clientes" },
  { command: "nuevo_cliente", description: "Crear un cliente" },
  { command: "proyectos", description: "Ver proyectos por cliente" },
  { command: "nuevo_proyecto", description: "Crear un proyecto" },
  { command: "reporte", description: "Reporte mensual (PDF)" },
  { command: "entradas", description: "Entradas de este mes" },
  { command: "help", description: "Ver ayuda" },
]);

// Error handler
bot.catch((err) => {
  log.error({ err: err.error }, "Bot error");
});

// --- Internal HTTP server (Hono) ---
const app = new Hono();

app.use("*", honoLogger());

app.route("/", health);
app.route("/", createInternalRoutes(bot));

app.onError((err, c) => {
  log.error({ err }, "Unhandled HTTP error");
  return c.json({ error: "Internal server error" }, 500);
});

// Start both concurrently: bot polling + HTTP server
log.info("KairosBot starting...");

bot.start({
  onStart: () => log.info("KairosBot polling started"),
});

serve({ fetch: app.fetch, port: config.BOT_INTERNAL_PORT }, (info) => {
  log.info(`KairosBot internal HTTP server listening on http://localhost:${info.port}`);
});
