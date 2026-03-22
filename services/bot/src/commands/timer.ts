import { InlineKeyboard } from "grammy";
import type { Bot, Context } from "grammy";
import * as chronos from "../services/chronos.js";
import { pendingDescriptions } from "../callbacks/handler.js";

export function registerTimerCommands(bot: Bot) {
  bot.command("timer", async (ctx) => {
    try {
      const { data: clients } = await chronos.getClients();
      if (!clients || clients.length === 0) {
        await ctx.reply(
          "No hay clientes creados. Usá /nuevo_cliente primero.",
        );
        return;
      }

      const keyboard = new InlineKeyboard();

      for (const client of clients) {
        const { data: projects } = await chronos.getProjects(client.id);
        if (!projects || projects.length === 0) continue;

        for (const project of projects) {
          keyboard.text(
            `${client.name} / ${project.name}`,
            `timer_start:${project.id}`,
          );
          keyboard.row();
        }
      }

      await ctx.reply("¿En qué proyecto vas a trabajar?", {
        reply_markup: keyboard,
      });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  bot.command("stop", async (ctx) => {
    try {
      const result = await chronos.stopTimer();
      await ctx.reply(result.display);
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  bot.command("status", async (ctx) => {
    try {
      const result = await chronos.getTimerStatus();
      await ctx.reply(result.display);
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  // Handle text replies for timer description
  bot.on("message:text", async (ctx, next) => {
    const userId = ctx.from.id;
    const pending = pendingDescriptions.get(userId);

    if (!pending) {
      await next();
      return;
    }

    pendingDescriptions.delete(userId);

    const description =
      ctx.message.text === "/skip" ? undefined : ctx.message.text;

    try {
      const result = await chronos.startTimer(pending.projectId, description);
      await ctx.reply(result.display);
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });
}
