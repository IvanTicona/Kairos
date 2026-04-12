import { config } from "../config.js";

const BASE = config.CHRONOS_URL;

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data?: T; display: string; error?: string }> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res.json() as Promise<{ data?: T; display: string; error?: string }>;
}

// === Clients ===

export interface Client {
  id: number;
  name: string;
  created_at: string;
}

export async function getClients() {
  return request<Client[]>("/v1/clients");
}

export async function createClient(name: string) {
  return request<Client>("/v1/clients", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// === Projects ===

export interface Project {
  id: number;
  client_id: number;
  name: string;
  reportable: boolean;
  created_at: string;
}

export async function getProjects(clientId: number) {
  return request<Project[]>(`/v1/clients/${clientId}/projects`);
}

export async function createProject(
  clientId: number,
  name: string,
  reportable: boolean,
) {
  return request<Project>(`/v1/clients/${clientId}/projects`, {
    method: "POST",
    body: JSON.stringify({ name, reportable }),
  });
}

// === Timer ===

export async function startTimer(projectId: number, description?: string) {
  return request("/v1/timer/start", {
    method: "POST",
    body: JSON.stringify({ project_id: projectId, description }),
  });
}

export async function stopTimer() {
  return request("/v1/timer/stop", { method: "POST" });
}

export async function getTimerStatus() {
  return request("/v1/timer/status");
}

// === Entries ===

export interface TimeEntry {
  id: number;
  project_id: number;
  description: string | null;
  started_at: string;
  stopped_at: string;
  duration_seconds: number;
  project_name: string;
  client_name: string;
}

export async function getEntries(params?: {
  from?: string;
  to?: string;
  client_id?: number;
}) {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.client_id) query.set("client_id", String(params.client_id));
  const qs = query.toString();
  return request<TimeEntry[]>(`/v1/entries${qs ? `?${qs}` : ""}`);
}

// === Reports ===

export async function getMonthlyReportPdf(
  clientId: number,
  month: string,
): Promise<ArrayBuffer> {
  const res = await fetch(
    `${BASE}/v1/reports/monthly?client_id=${clientId}&month=${month}&format=pdf`,
  );
  return res.arrayBuffer();
}

export async function getMonthlyReportJson(clientId: number, month: string) {
  return request(`/v1/reports/monthly?client_id=${clientId}&month=${month}`);
}
