import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";
import * as chronos from "../services/chronos.js";

interface PendingProject {
  step: "name" | "reportable";
  clientId: number;
  name?: string;
}

const pendingProjects = new Map<number, PendingProject>();

export function registerProjectCommands(bot: Bot) {
  bot.command("proyectos", async (ctx) => {
    try {
      const { data: clients } = await chronos.getClients();
      if (!clients || clients.length === 0) {
        await ctx.reply("No hay clientes. Usá /nuevo_cliente primero.");
        return;
      }

      const keyboard = new InlineKeyboard();
      for (const client of clients) {
        keyboard.text(client.name, `list_projects:${client.id}`);
        keyboard.row();
      }
      await ctx.reply("¿De qué cliente querés ver los proyectos?", {
        reply_markup: keyboard,
      });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  bot.command("nuevo_proyecto", async (ctx) => {
    try {
      const { data: clients } = await chronos.getClients();
      if (!clients || clients.length === 0) {
        await ctx.reply("No hay clientes. Usá /nuevo_cliente primero.");
        return;
      }

      const keyboard = new InlineKeyboard();
      for (const client of clients) {
        keyboard.text(client.name, `new_project_client:${client.id}`);
        keyboard.row();
      }
      await ctx.reply("¿A qué cliente pertenece el nuevo proyecto?", {
        reply_markup: keyboard,
      });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  // Handle text reply for project name
  bot.on("message:text", async (ctx, next) => {
    const userId = ctx.from.id;
    const pending = pendingProjects.get(userId);

    if (!pending || pending.step !== "name") {
      await next();
      return;
    }

    const name = ctx.message.text.trim();
    if (name.startsWith("/")) {
      pendingProjects.delete(userId);
      await next();
      return;
    }

    pending.name = name;
    pending.step = "reportable";

    const keyboard = new InlineKeyboard()
      .text("Sí", `project_reportable:1`)
      .text("No", `project_reportable:0`);

    await ctx.reply("¿Debe aparecer en los reportes?", {
      reply_markup: keyboard,
    });
  });
}

export { pendingProjects };
