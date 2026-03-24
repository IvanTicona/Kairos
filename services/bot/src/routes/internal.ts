import { Hono } from "hono";
import { z } from "zod/v4";
import type { Bot } from "grammy";
import pino from "pino";

const log = pino({ name: "kairos-bot:internal" });

const notifySchema = z.object({
  chat_id: z.number().int(),
  text: z.string().min(1),
  parse_mode: z.enum(["HTML", "MarkdownV2"]).optional(),
});

export function createInternalRoutes(bot: Bot) {
  const internal = new Hono();

  internal.post("/internal/notify", async (c) => {
    const body = await c.req.json();
    const parsed = notifySchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ ok: false, error: parsed.error.message }, 400);
    }

    const { chat_id, text, parse_mode } = parsed.data;

    try {
      const result = await bot.api.sendMessage(chat_id, text, {
        parse_mode,
      });

      return c.json({ ok: true, message_id: result.message_id });
    } catch (err) {
      log.error({ err, chat_id }, "Failed to send notification");
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ ok: false, error: message }, 502);
    }
  });

  return internal;
}
