import { InlineKeyboard, InputFile } from "grammy";
import type { Bot } from "grammy";
import * as chronos from "../services/chronos.js";

export function registerReportCommands(bot: Bot) {
  bot.command("reporte", async (ctx) => {
    try {
      const { data: clients } = await chronos.getClients();
      if (!clients || clients.length === 0) {
        await ctx.reply("No hay clientes.");
        return;
      }

      const keyboard = new InlineKeyboard();
      for (const client of clients) {
        keyboard.text(client.name, `report:${client.id}`);
        keyboard.row();
      }
      await ctx.reply("¿De qué cliente querés el reporte mensual?", {
        reply_markup: keyboard,
      });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  bot.command("entradas", async (ctx) => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      const from = monday.toISOString().slice(0, 10);

      const { data: entries, display } = await chronos.getEntries({ from });

      if (!entries || entries.length === 0) {
        await ctx.reply("No hay entradas esta semana.");
        return;
      }

      const lines = entries.map((e) => {
        const date = e.started_at.slice(0, 10);
        const hours = Math.floor(e.duration_seconds / 3600);
        const mins = Math.floor((e.duration_seconds % 3600) / 60);
        const duration =
          hours > 0 ? `${hours}h ${mins}m` : mins > 0 ? `${mins}m` : "< 1m";
        const desc = e.description ? ` — ${e.description}` : "";
        return `• ${e.client_name}/${e.project_name}${desc} (${date}, ${duration})`;
      });

      await ctx.reply(`*Entradas esta semana:*\n\n${lines.join("\n")}\n\n${display}`, {
        parse_mode: "Markdown",
      });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });
}
