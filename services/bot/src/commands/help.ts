import type { Bot } from "grammy";

const HELP_TEXT = `🕐 <b>KairosBot — Tu asistente de productividad</b>

<b>Timer:</b>
/timer — Iniciar un timer (elegí proyecto)
/stop — Detener el timer activo
/status — Ver timer actual

<b>Clientes y Proyectos:</b>
/clientes — Listar clientes
/nuevo_cliente — Crear un cliente
/proyectos — Ver proyectos por cliente
/nuevo_proyecto — Crear un proyecto

<b>Reportes:</b>
/reporte — Reporte semanal (PDF)
/entradas — Entradas de esta semana

/help — Ver esta ayuda`;

export function registerHelpCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(`¡Hola! Soy KairosBot 👋\n\n${HELP_TEXT}`, {
      parse_mode: "HTML",
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT, { parse_mode: "HTML" });
  });
}
