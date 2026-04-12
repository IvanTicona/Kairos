import { db } from "./client.js";

// === Clients ===

export function getAllClients() {
  return db.prepare("SELECT * FROM clients ORDER BY name").all() as Array<{
    id: number;
    name: string;
    created_at: string;
  }>;
}

export function getClientById(id: number) {
  return db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as
    | { id: number; name: string; created_at: string }
    | undefined;
}

export function createClient(name: string) {
  const result = db
    .prepare("INSERT INTO clients (name) VALUES (?)")
    .run(name);
  return { id: result.lastInsertRowid as number, name };
}

export function clientExistsByName(name: string): boolean {
  const row = db
    .prepare("SELECT 1 FROM clients WHERE name = ?")
    .get(name);
  return !!row;
}

// === Projects ===

export function getProjectsByClient(clientId: number) {
  return db
    .prepare("SELECT * FROM projects WHERE client_id = ? ORDER BY name")
    .all(clientId) as Array<{
    id: number;
    client_id: number;
    name: string;
    reportable: number;
    created_at: string;
  }>;
}

export function getProjectById(id: number) {
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as
    | {
        id: number;
        client_id: number;
        name: string;
        reportable: number;
        created_at: string;
      }
    | undefined;
}

export function createProject(
  clientId: number,
  name: string,
  reportable: boolean = true,
) {
  const result = db
    .prepare(
      "INSERT INTO projects (client_id, name, reportable) VALUES (?, ?, ?)",
    )
    .run(clientId, name, reportable ? 1 : 0);
  return {
    id: result.lastInsertRowid as number,
    client_id: clientId,
    name,
    reportable,
  };
}

export function projectExistsByName(
  clientId: number,
  name: string,
): boolean {
  const row = db
    .prepare(
      "SELECT 1 FROM projects WHERE client_id = ? AND name = ?",
    )
    .get(clientId, name);
  return !!row;
}

// === Timer / Time Entries ===

export function getActiveEntry() {
  return db
    .prepare(
      `SELECT te.*, p.name as project_name, p.client_id, c.name as client_name
       FROM time_entries te
       JOIN projects p ON te.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE te.stopped_at IS NULL
       LIMIT 1`,
    )
    .get() as
    | {
        id: number;
        project_id: number;
        description: string | null;
        started_at: string;
        stopped_at: null;
        duration_seconds: null;
        project_name: string;
        client_id: number;
        client_name: string;
      }
    | undefined;
}

export function startEntry(projectId: number, description?: string) {
  const result = db
    .prepare(
      "INSERT INTO time_entries (project_id, description) VALUES (?, ?)",
    )
    .run(projectId, description ?? null);
  return result.lastInsertRowid as number;
}

export function stopEntry(id: number) {
  db.prepare(
    `UPDATE time_entries
     SET stopped_at = datetime('now'),
         duration_seconds = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
     WHERE id = ?`,
  ).run(id);
}

export function getEntryById(id: number) {
  return db
    .prepare(
      `SELECT te.*, p.name as project_name, c.name as client_name
       FROM time_entries te
       JOIN projects p ON te.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE te.id = ?`,
    )
    .get(id) as
    | {
        id: number;
        project_id: number;
        description: string | null;
        started_at: string;
        stopped_at: string | null;
        duration_seconds: number | null;
        project_name: string;
        client_name: string;
      }
    | undefined;
}

// === Entries Query ===

export function getEntries(filters: {
  from?: string;
  to?: string;
  project_id?: number;
  client_id?: number;
}) {
  const conditions: string[] = ["te.stopped_at IS NOT NULL"];
  const params: Record<string, string | number> = {};

  if (filters.from) {
    conditions.push("te.started_at >= @from");
    params.from = filters.from;
  }
  if (filters.to) {
    conditions.push("te.started_at <= @to || ' 23:59:59'");
    params.to = filters.to;
  }
  if (filters.project_id) {
    conditions.push("te.project_id = @project_id");
    params.project_id = filters.project_id;
  }
  if (filters.client_id) {
    conditions.push("p.client_id = @client_id");
    params.client_id = filters.client_id;
  }

  const where = conditions.join(" AND ");

  return db
    .prepare(
      `SELECT te.*, p.name as project_name, c.name as client_name
       FROM time_entries te
       JOIN projects p ON te.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       WHERE ${where}
       ORDER BY te.started_at DESC`,
    )
    .all(params) as Array<{
    id: number;
    project_id: number;
    description: string | null;
    started_at: string;
    stopped_at: string;
    duration_seconds: number;
    project_name: string;
    client_name: string;
  }>;
}

// === Reports ===

export interface ReportEntry {
  project_name: string;
  description: string | null;
  started_at: string;
  duration_seconds: number;
}

export interface ReportProject {
  project_name: string;
  entries: ReportEntry[];
  total_seconds: number;
}

export function getMonthlyReportData(
  clientId: number,
  monthStart: string,
  monthEnd: string,
): ReportProject[] {
  const rows = db
    .prepare(
      `SELECT p.name as project_name, te.description, te.started_at, te.duration_seconds
       FROM time_entries te
       JOIN projects p ON te.project_id = p.id
       WHERE p.client_id = ?
         AND p.reportable = 1
         AND te.stopped_at IS NOT NULL
         AND te.started_at >= ?
         AND te.started_at <= ? || ' 23:59:59'
       ORDER BY p.name, te.started_at`,
    )
    .all(clientId, monthStart, monthEnd) as ReportEntry[];

  const grouped = new Map<string, ReportEntry[]>();
  for (const row of rows) {
    const existing = grouped.get(row.project_name) ?? [];
    existing.push(row);
    grouped.set(row.project_name, existing);
  }

  return Array.from(grouped.entries()).map(([project_name, entries]) => ({
    project_name,
    entries,
    total_seconds: entries.reduce((sum, e) => sum + e.duration_seconds, 0),
  }));
}
