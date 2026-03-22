import type { Bot } from "grammy";

const HELP_TEXT = `🕐 *KairosBot — Tu asistente de productividad*

*Timer:*
/timer — Iniciar un timer (elegí proyecto)
/stop — Detener el timer activo
/status — Ver timer actual

*Clientes y Proyectos:*
/clientes — Listar clientes
/nuevo\\_cliente — Crear un cliente
/proyectos — Ver proyectos por cliente
/nuevo\\_proyecto — Crear un proyecto

*Reportes:*
/reporte — Reporte semanal (PDF)
/entradas — Entradas de esta semana

/help — Ver esta ayuda`;

export function registerHelpCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(`¡Hola! Soy KairosBot 👋\n\n${HELP_TEXT}`, {
      parse_mode: "MarkdownV2",
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT, { parse_mode: "MarkdownV2" });
  });
}
