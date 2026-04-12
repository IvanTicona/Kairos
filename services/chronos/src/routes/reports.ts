import { Hono } from "hono";
import { getMonthlyReportData, getClientById } from "../db/queries.js";
import { generatePdfReport } from "../services/report-pdf.js";
import { generateHtmlReport } from "../services/report-html.js";
import { formatDuration } from "../services/timer.js";
import type { MonthlyReportData } from "../types.js";

const reports = new Hono();

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  return `${MONTH_NAMES_ES[Number(monthNum) - 1]} ${year}`;
}

function getMonthRange(monthParam?: string): { monthStart: string; monthEnd: string; month: string } {
  let year: number;
  let month: number;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    [year, month] = monthParam.split("-").map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  return { monthStart, monthEnd, month: monthKey };
}

reports.get("/v1/reports/monthly", async (c) => {
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

  const { monthStart, monthEnd, month } = getMonthRange(c.req.query("month"));
  const format = c.req.query("format") ?? "json";
  const projectData = getMonthlyReportData(clientId, monthStart, monthEnd);
  const grandTotal = projectData.reduce((sum, p) => sum + p.total_seconds, 0);

  const reportData: MonthlyReportData = {
    client_name: client.name,
    month,
    month_label: getMonthLabel(month),
    projects: projectData,
    grand_total_seconds: grandTotal,
  };

  if (format === "pdf") {
    const pdfBuffer = await generatePdfReport(reportData);
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-${client.name}-${month}.pdf"`,
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
    display: `Reporte ${reportData.month_label} — ${client.name}: Total ${formatDuration(grandTotal)}`,
  });
});

export { reports };
