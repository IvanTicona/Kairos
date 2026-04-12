import PDFDocument from "pdfkit";
import { formatDuration } from "./timer.js";
import type { MonthlyReportData } from "../types.js";

export function generatePdfReport(
  data: MonthlyReportData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold");
    doc.text(`Reporte Mensual — ${data.client_name}`);
    doc.fontSize(12).font("Helvetica").fillColor("#666666");
    doc.text(data.month_label);
    doc.moveDown(1.5);

    // Projects
    for (const project of data.projects) {
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#333333");
      doc.text(project.project_name);
      doc.moveDown(0.3);

      // Table header
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#888888");
      const y = doc.y;
      doc.text("DESCRIPCIÓN", 50, y, { width: 280 });
      doc.text("FECHA", 340, y, { width: 80 });
      doc.text("DURACIÓN", 430, y, { width: 80, align: "right" });
      doc.moveDown(0.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(510, doc.y)
        .strokeColor("#dddddd")
        .stroke();
      doc.moveDown(0.3);

      // Entries
      doc.fontSize(10).font("Helvetica").fillColor("#333333");
      for (const entry of project.entries) {
        const ey = doc.y;
        doc.text(entry.description ?? "(sin descripción)", 50, ey, {
          width: 280,
        });
        doc.text(entry.started_at.slice(0, 10), 340, ey, { width: 80 });
        doc.text(formatDuration(entry.duration_seconds), 430, ey, {
          width: 80,
          align: "right",
        });
        doc.moveDown(0.3);
      }

      // Subtotal
      doc
        .moveTo(50, doc.y)
        .lineTo(510, doc.y)
        .strokeColor("#dddddd")
        .stroke();
      doc.moveDown(0.3);
      const sy = doc.y;
      doc.font("Helvetica-Bold").fillColor("#333333");
      doc.text("Subtotal", 50, sy, { width: 280 });
      doc.text(formatDuration(project.total_seconds), 430, sy, {
        width: 80,
        align: "right",
      });
      doc.moveDown(1);
    }

    // Grand total
    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(510, doc.y)
      .strokeColor("#333333")
      .lineWidth(2)
      .stroke();
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000000");
    doc.text(
      `TOTAL MES: ${formatDuration(data.grand_total_seconds)}`,
      50,
    );

    doc.end();
  });
}
