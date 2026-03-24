export interface UserStory {
  id: number;
  slack_message_id: string;
  channel_id: string;
  raw_text: string;
  generated_prompt: string | null;
  status: "pending" | "processed" | "error";
  error_message: string | null;
  created_at: string;
}
