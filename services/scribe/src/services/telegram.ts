import pino from "pino";
import { config } from "../config.js";

const log = pino({ name: "scribe:telegram" });

const MAX_MESSAGE_LENGTH = 4096;

function splitMessage(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_MESSAGE_LENGTH) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = remaining.lastIndexOf("\n", MAX_MESSAGE_LENGTH);
    if (splitIndex === -1 || splitIndex < MAX_MESSAGE_LENGTH / 2) {
      splitIndex = MAX_MESSAGE_LENGTH;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex);
  }

  return chunks;
}

async function sendNotification(chatId: number, text: string, parseMode = "HTML"): Promise<void> {
  const chunks = splitMessage(text);

  for (const chunk of chunks) {
    const response = await fetch(`${config.BOT_URL}/internal/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      log.error({ status: response.status, body }, "Bot notification failed");
      throw new Error(`Bot notification error: ${response.status}`);
    }
  }
}

export async function notifyPrompt(generatedPrompt: string): Promise<void> {
  // Send header as HTML, then prompt as plain text (no parse_mode) to avoid HTML conflicts
  await sendNotification(config.TELEGRAM_OWNER_ID, "📋 <b>Scribe — Prompt Generado</b>");
  await sendNotification(config.TELEGRAM_OWNER_ID, generatedPrompt, "");
  log.info("Prompt notification sent to Telegram");
}

export async function notifyError(errorMessage: string): Promise<void> {
  const text = `<b>Scribe - Error</b>\n\nNo se pudo procesar la User Story.\n<code>${escapeHtml(errorMessage)}</code>`;
  await sendNotification(config.TELEGRAM_OWNER_ID, text);
  log.warn({ errorMessage }, "Error notification sent to Telegram");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
