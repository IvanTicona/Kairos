import { db } from "./client.js";
import type { UserStory } from "../types.js";

const insertStmt = db.prepare(`
  INSERT INTO user_stories (slack_message_id, channel_id, raw_text)
  VALUES (@slack_message_id, @channel_id, @raw_text)
`);

const updateStatusStmt = db.prepare(`
  UPDATE user_stories
  SET status = @status,
      generated_prompt = COALESCE(@generated_prompt, generated_prompt),
      error_message = COALESCE(@error_message, error_message)
  WHERE id = @id
`);

const findBySlackMessageIdStmt = db.prepare(`
  SELECT * FROM user_stories WHERE slack_message_id = @slack_message_id
`);

const getRecentStmt = db.prepare(`
  SELECT * FROM user_stories ORDER BY created_at DESC LIMIT @limit
`);

export function insertUS(
  slack_message_id: string,
  channel_id: string,
  raw_text: string,
): number {
  const result = insertStmt.run({ slack_message_id, channel_id, raw_text });
  return Number(result.lastInsertRowid);
}

export function updateStatus(
  id: number,
  status: string,
  generated_prompt?: string,
  error_message?: string,
): void {
  updateStatusStmt.run({
    id,
    status,
    generated_prompt: generated_prompt ?? null,
    error_message: error_message ?? null,
  });
}

export function findBySlackMessageId(
  slack_message_id: string,
): UserStory | null {
  return (findBySlackMessageIdStmt.get({ slack_message_id }) as UserStory) ?? null;
}

export function getRecent(limit: number): UserStory[] {
  return getRecentStmt.all({ limit }) as UserStory[];
}
