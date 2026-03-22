export interface ApiResponse<T = unknown> {
  data?: T;
  display: string;
  error?: string;
}

export interface ClientRow {
  id: number;
  name: string;
  created_at: string;
}

export interface ProjectRow {
  id: number;
  client_id: number;
  name: string;
  reportable: number;
  created_at: string;
}

export interface TimeEntryRow {
  id: number;
  project_id: number;
  description: string | null;
  started_at: string;
  stopped_at: string | null;
  duration_seconds: number | null;
  project_name: string;
  client_name: string;
}

export interface WeeklyReportData {
  client_name: string;
  week_start: string;
  week_end: string;
  projects: Array<{
    project_name: string;
    entries: Array<{
      description: string | null;
      started_at: string;
      duration_seconds: number;
    }>;
    total_seconds: number;
  }>;
  grand_total_seconds: number;
}
