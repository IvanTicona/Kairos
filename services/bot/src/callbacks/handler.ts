import { InlineKeyboard, InputFile } from "grammy";
import type { Bot } from "grammy";
import * as chronos from "../services/chronos.js";
import { pendingProjects } from "../commands/projects.js";

// Shared state: waiting for timer description
export const pendingDescriptions = new Map<
  number,
  { projectId: number }
>();

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getRecentMonths(count: number): Array<{ key: string; label: string }> {
  const now = new Date();
  const day = now.getDate();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  // If before the 9th, current period started last month
  if (day < 9) {
    const prev = new Date(year, month - 2, 1);
    year = prev.getFullYear();
    month = prev.getMonth() + 1;
  }

  const months = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(year, month - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const endDate = new Date(y, m, 8); // next month's 8th
    const endM = endDate.getMonth() + 1;
    const endY = endDate.getFullYear();
    months.push({
      key: `${y}-${String(m).padStart(2, "0")}`,
      label: `9 ${MONTH_NAMES_ES[m - 1]} — 8 ${MONTH_NAMES_ES[endM - 1]} ${endY}`,
    });
  }
  return months;
}

export function registerCallbacks(bot: Bot) {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    try {
      // === Timer: select project ===
      if (data.startsWith("timer_start:")) {
        const projectId = Number(data.split(":")[1]);
        pendingDescriptions.set(userId, { projectId });
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(
          "¿Descripción? (o enviá /skip para omitir)",
        );
        return;
      }

      // === List projects for a client ===
      if (data.startsWith("list_projects:")) {
        const clientId = Number(data.split(":")[1]);
        const { data: projects } = await chronos.getProjects(clientId);
        await ctx.answerCallbackQuery();

        if (!projects || projects.length === 0) {
          await ctx.editMessageText(
            "No hay proyectos para este cliente. Usá /nuevo_proyecto.",
          );
          return;
        }

        const list = projects
          .map(
            (p) =>
              `• ${p.name} ${p.reportable ? "📊" : "🔒"}`,
          )
          .join("\n");
        await ctx.editMessageText(
          `*Proyectos:*\n${list}\n\n📊 = en reportes | 🔒 = solo tracking`,
          { parse_mode: "Markdown" },
        );
        return;
      }

      // === New project: select client ===
      if (data.startsWith("new_project_client:")) {
        const clientId = Number(data.split(":")[1]);
        pendingProjects.set(userId, { step: "name", clientId });
        await ctx.answerCallbackQuery();
        await ctx.editMessageText("¿Cómo se llama el nuevo proyecto?");
        return;
      }

      // === New project: reportable toggle ===
      if (data.startsWith("project_reportable:")) {
        const reportable = data.split(":")[1] === "1";
        const pending = pendingProjects.get(userId);

        if (!pending || !pending.name) {
          await ctx.answerCallbackQuery({ text: "Error: flujo perdido" });
          return;
        }

        pendingProjects.delete(userId);
        await ctx.answerCallbackQuery();

        const result = await chronos.createProject(
          pending.clientId,
          pending.name,
          reportable,
        );
        await ctx.editMessageText(result.display);
        return;
      }

      // === Report: select client → show month picker ===
      if (data.startsWith("report:")) {
        const clientId = Number(data.split(":")[1]);
        await ctx.answerCallbackQuery();

        const months = getRecentMonths(4);
        const keyboard = new InlineKeyboard();
        for (const m of months) {
          keyboard.text(m.label, `report_month:${clientId}:${m.key}`).row();
        }

        await ctx.editMessageText("¿De qué mes querés el reporte?", {
          reply_markup: keyboard,
        });
        return;
      }

      // === Report: month selected → generate PDF ===
      if (data.startsWith("report_month:")) {
        const [, clientIdStr, month] = data.split(":");
        const clientId = Number(clientIdStr);
        await ctx.answerCallbackQuery({ text: "Generando reporte..." });

        const summary = await chronos.getMonthlyReportJson(clientId, month);
        const pdfBuffer = await chronos.getMonthlyReportPdf(clientId, month);
        const uint8 = new Uint8Array(pdfBuffer);

        await ctx.editMessageText(summary.display);
        await ctx.replyWithDocument(
          new InputFile(uint8, `reporte-${month}.pdf`),
          { caption: summary.display },
        );
        return;
      }

      await ctx.answerCallbackQuery({ text: "Acción no reconocida" });
    } catch {
      await ctx.answerCallbackQuery({ text: "Error de conexión" });
      await ctx.reply(
        "No puedo conectar con Chronos. ¿Está corriendo el servicio?",
      );
    }
  });
}
