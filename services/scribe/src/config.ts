import { z } from "zod/v4";

const envSchema = z.object({
  SCRIBE_PORT: z.coerce.number().default(3004),
  SLACK_APP_TOKEN: z.string().startsWith("xapp-"),
  SLACK_USER_TOKEN: z.string().startsWith("xoxp-"),
  SLACK_CHANNEL_ID: z.string().default("D0A55T5E4J0"),
  FORGE_URL: z.string().default("http://kairos-forge:3001"),
  FORGE_API_KEY: z.string().min(1, "FORGE_API_KEY is required"),
  BOT_URL: z.string().default("http://kairos-bot:3005"),
  TELEGRAM_OWNER_ID: z.coerce.number(),
  SCRIBE_DB_PATH: z.string().default("./data/scribe.db"),
});

export type Config = z.infer<typeof envSchema>;

export const config = envSchema.parse(process.env);
