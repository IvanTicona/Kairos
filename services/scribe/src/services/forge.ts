import pino from "pino";
import { config } from "../config.js";
import { buildMessages } from "./prompt-builder.js";

const log = pino({ name: "scribe:forge" });

interface ForgeResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export async function generatePrompt(
  rawUsText: string,
  slackMessageId: string,
): Promise<string> {
  const messages = buildMessages(rawUsText);

  const response = await fetch(`${config.FORGE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      task_type: "reasoning",
      service: "scribe",
      messages,
      metadata: { slack_message_id: slackMessageId },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    log.error(
      { status: response.status, body },
      "Forge API request failed",
    );
    throw new Error(`Forge API error: ${response.status} — ${body}`);
  }

  const data = (await response.json()) as ForgeResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Forge returned empty response");
  }

  log.info({ slackMessageId }, "Prompt generated successfully");
  return content;
}
