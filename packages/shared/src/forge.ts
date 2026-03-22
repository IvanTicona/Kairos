export const TASK_TYPES = ["quick", "standard", "reasoning"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface ForgeRequest {
  task_type?: TaskType;
  model?: string;
  messages: ForgeChatMessage[];
  service?: string;
  metadata?: Record<string, string>;
}

export interface ForgeChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ForgeMetadata {
  model_used: string;
  tier: string;
  cost_usd: number | null;
  request_id: string;
}

export interface ForgeResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string | null };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _forge: ForgeMetadata;
}

export interface ForgeStatsResult {
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
