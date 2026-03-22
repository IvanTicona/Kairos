import { InputFile } from "grammy";
import type { Bot } from "grammy";
import * as chronos from "../services/chronos.js";
import { pendingProjects } from "../commands/projects.js";

// Shared state: waiting for timer description
export const pendingDescriptions = new Map<
  number,
  { projectId: number }
>();

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

      // === Report: select client ===
      if (data.startsWith("report:")) {
        const clientId = Number(data.split(":")[1]);
        await ctx.answerCallbackQuery({ text: "Generando reporte..." });

        // Get JSON summary for caption
        const summary = await chronos.getWeeklyReportJson(clientId);

        // Get PDF
        const pdfBuffer = await chronos.getWeeklyReportPdf(clientId);
        const uint8 = new Uint8Array(pdfBuffer);

        await ctx.editMessageText(summary.display);
        await ctx.replyWithDocument(
          new InputFile(uint8, `reporte-semanal.pdf`),
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
