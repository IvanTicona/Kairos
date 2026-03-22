import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatDuration } from "./timer.js";
import type { WeeklyReportData } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dirname, "..", "templates", "weekly-report.hbs");
const templateSource = readFileSync(templatePath, "utf-8");
const template = Handlebars.compile(templateSource);

export function generateHtmlReport(data: WeeklyReportData): string {
  const templateData = {
    client_name: data.client_name,
    week_start: data.week_start,
    week_end: data.week_end,
    grand_total_display: formatDuration(data.grand_total_seconds),
    projects: data.projects.map((p) => ({
      project_name: p.project_name,
      total_display: formatDuration(p.total_seconds),
      entries: p.entries.map((e) => ({
        description: e.description,
        date: e.started_at.slice(0, 10),
        duration: formatDuration(e.duration_seconds),
      })),
    })),
  };

  return template(templateData);
}
