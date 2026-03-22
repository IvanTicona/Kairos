export const TASK_TYPES = ["quick", "standard", "reasoning"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface ForgeRequest {
  task_type?: TaskType;
  model?: string;
  messages: ChatMessage[];
  service?: string;
  metadata?: Record<string, string>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ForgeMetadata {
  model_used: string;
  tier: string;
  cost_usd: number | null;
  request_id: string;
}

export interface RequestLog {
  request_id: string;
  model_used: string | null;
  tier: string | null;
  task_type: string | null;
  service: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number | null;
  status: "success" | "error";
  error_message?: string | null;
  duration_ms: number;
  metadata?: Record<string, string> | null;
}

export interface StatsResult {
  total_requests: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
  by_model: Array<{
    model: string;
    requests: number;
    tokens_in: number;
    tokens_out: number;
    cost_usd: number;
  }>;
  by_service: Array<{
    service: string;
    requests: number;
    cost_usd: number;
  }>;
}
