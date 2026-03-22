import type { Bot, Context } from "grammy";
import * as chronos from "../services/chronos.js";

const pendingClientCreation = new Set<number>();

export function registerClientCommands(bot: Bot) {
  bot.command("clientes", async (ctx) => {
    try {
      const { data: clients } = await chronos.getClients();
      if (!clients || clients.length === 0) {
        await ctx.reply("No hay clientes. Usá /nuevo_cliente para crear uno.");
        return;
      }

      const list = clients
        .map((c, i) => `${i + 1}. ${c.name}`)
        .join("\n");
      await ctx.reply(`*Clientes:*\n${list}`, { parse_mode: "Markdown" });
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });

  bot.command("nuevo_cliente", async (ctx) => {
    if (!ctx.from) return;
    pendingClientCreation.add(ctx.from.id);
    await ctx.reply("¿Cómo se llama el nuevo cliente?");
  });

  // Handle text reply for client creation — registered as named middleware
  bot.on("message:text", async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !pendingClientCreation.has(userId)) {
      await next();
      return;
    }

    pendingClientCreation.delete(userId);
    const name = ctx.message.text.trim();

    if (name.startsWith("/")) {
      await next();
      return;
    }

    try {
      const result = await chronos.createClient(name);
      await ctx.reply(result.display);
    } catch {
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });
}
