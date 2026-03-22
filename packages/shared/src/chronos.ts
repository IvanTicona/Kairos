export interface ChronosApiResponse<T = unknown> {
  data?: T;
  display: string;
  error?: string;
}

export interface ChronosClient {
  id: number;
  name: string;
  created_at: string;
}

export interface ChronosProject {
  id: number;
  client_id: number;
  name: string;
  reportable: boolean;
  created_at: string;
}

export interface ChronosTimeEntry {
  id: number;
  project_id: number;
  description: string | null;
  started_at: string;
  stopped_at: string | null;
  duration_seconds: number | null;
  project_name: string;
  client_name: string;
}

export interface ChronosTimerStatus {
  active: boolean;
  entry?: ChronosTimeEntry & {
    elapsed_seconds: number;
    elapsed_display: string;
  };
  display: string;
}

export interface ChronosWeeklyReport {
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
