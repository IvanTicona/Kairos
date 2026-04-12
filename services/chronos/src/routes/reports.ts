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
  const [year, monthNum] = month.split("-").map(Number);
  const endDate = new Date(year, monthNum, 8); // next month's 8th (JS months are 0-indexed)
  const endMonth = endDate.getMonth() + 1;
  const endYear = endDate.getFullYear();
  return `9 ${MONTH_NAMES_ES[monthNum - 1]} — 8 ${MONTH_NAMES_ES[endMonth - 1]} ${endYear}`;
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
    // If before the 9th, we're still in the previous period
    if (now.getDate() < 9) {
      const prev = new Date(year, month - 2, 1);
      year = prev.getFullYear();
      month = prev.getMonth() + 1;
    }
  }

  const monthStart = `${year}-${String(month).padStart(2, "0")}-09`;
  const endDate = new Date(year, month, 8); // next month's 8th
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const monthEnd = `${endYear}-${String(endMonth).padStart(2, "0")}-08`;
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
