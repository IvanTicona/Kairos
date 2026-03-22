import { Hono } from "hono";
import { getWeeklyReportData, getClientById } from "../db/queries.js";
import { generatePdfReport } from "../services/report-pdf.js";
import { generateHtmlReport } from "../services/report-html.js";
import { formatDuration } from "../services/timer.js";
import type { WeeklyReportData } from "../types.js";

const reports = new Hono();

reports.get("/v1/reports/weekly", async (c) => {
  const clientIdParam = c.req.query("client_id");
  if (!clientIdParam) {
    return c.json(
      {
        error: "client_id es requerido",
        display: "Error: client_id es requerido",
      },
      400,
    );
  }

  const clientId = Number(clientIdParam);
  const client = getClientById(clientId);
  if (!client) {
    return c.json(
      { error: "Cliente no encontrado", display: "Error: cliente no encontrado" },
      404,
    );
  }

  const weekParam = c.req.query("week");
  const { weekStart, weekEnd } = getWeekRange(weekParam);

  const format = c.req.query("format") ?? "json";
  const projectData = getWeeklyReportData(clientId, weekStart, weekEnd);
  const grandTotal = projectData.reduce((sum, p) => sum + p.total_seconds, 0);

  const reportData: WeeklyReportData = {
    client_name: client.name,
    week_start: weekStart,
    week_end: weekEnd,
    projects: projectData,
    grand_total_seconds: grandTotal,
  };

  if (format === "pdf") {
    const pdfBuffer = await generatePdfReport(reportData);
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-${client.name}-${weekStart}.pdf"`,
      },
    });
  }

  if (format === "html") {
    const html = generateHtmlReport(reportData);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return c.json({
    data: reportData,
    display: `Reporte semanal ${client.name}: ${weekStart} al ${weekEnd} — Total: ${formatDuration(grandTotal)}`,
  });
});

function getWeekRange(weekParam?: string): {
  weekStart: string;
  weekEnd: string;
} {
  let monday: Date;

  if (weekParam) {
    monday = new Date(weekParam);
  } else {
    const now = new Date();
    const dayOfWeek = now.getDay();
    monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}

export { reports };
