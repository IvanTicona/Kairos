import { SocketModeClient } from "@slack/socket-mode";
import pino from "pino";
import { config } from "../config.js";
import { insertUS, updateStatus, findBySlackMessageId } from "../db/queries.js";
import { generatePrompt } from "./forge.js";
import { notifyPrompt, notifyError } from "./telegram.js";

const log = pino({ name: "scribe:slack" });

interface SlackMessageEvent {
  type: string;
  subtype?: string;
  text?: string;
  channel?: string;
  ts?: string;
  bot_id?: string;
}

export async function startSlackListener(): Promise<void> {
  const client = new SocketModeClient({ appToken: config.SLACK_APP_TOKEN });

  client.on("message", async ({ event, ack }) => {
    await ack();

    const msg = event as SlackMessageEvent;

    // Ignore bot messages
    if (msg.bot_id) return;

    // Ignore edits and deletions
    if (msg.subtype === "message_changed" || msg.subtype === "message_deleted") return;

    // Only process messages from the configured channel
    if (msg.channel !== config.SLACK_CHANNEL_ID) return;

    // Only process messages containing "User Story"
    if (!msg.text || !msg.text.toLowerCase().includes("user story")) return;

    const slackMessageId = msg.ts!;
    const rawText = msg.text;

    log.info({ slackMessageId, channel: msg.channel }, "User Story detected");

    // Deduplication check
    const existing = findBySlackMessageId(slackMessageId);
    if (existing) {
      log.info({ slackMessageId }, "Duplicate message, skipping");
      return;
    }

    // Store as pending
    const id = insertUS(slackMessageId, msg.channel, rawText);
    log.info({ id, slackMessageId }, "User Story stored as pending");

    try {
      // Call Forge to generate prompt
      const generatedPrompt = await generatePrompt(rawText, slackMessageId);

      // Update DB with generated prompt
      updateStatus(id, "processed", generatedPrompt);
      log.info({ id }, "User Story processed successfully");

      // Send to Telegram
      await notifyPrompt(generatedPrompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateStatus(id, "error", undefined, errorMessage);
      log.error({ id, error: errorMessage }, "Failed to process User Story");

      try {
        await notifyError(errorMessage);
      } catch (notifyErr) {
        log.error({ error: notifyErr }, "Failed to send error notification");
      }
    }
  });

  await client.start();
  log.info(
    { channel: config.SLACK_CHANNEL_ID },
    "Slack Socket Mode client connected",
  );
}
