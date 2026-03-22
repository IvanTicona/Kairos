import { z } from "zod/v4";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_OWNER_ID: z.coerce.number().int(),
  CHRONOS_URL: z.string().default("http://localhost:3002"),
});

export type Config = z.infer<typeof envSchema>;

export const config = envSchema.parse(process.env);
