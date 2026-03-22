import OpenAI from "openai";
import { config } from "../config.js";
import type { ChatMessage } from "../types.js";

const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface CompletionResult {
  response: OpenAI.Chat.ChatCompletion;
  tokensIn: number;
  tokensOut: number;
}

export async function createCompletion(
  model: string,
  messages: ChatMessage[],
): Promise<CompletionResult> {
  const response = await client.chat.completions.create({
    model,
    messages,
  });

  const usage = response.usage;

  return {
    response,
    tokensIn: usage?.prompt_tokens ?? 0,
    tokensOut: usage?.completion_tokens ?? 0,
  };
}
