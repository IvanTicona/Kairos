import { z } from "zod/v4";

const envSchema = z.object({
  CHRONOS_PORT: z.coerce.number().default(3002),
  CHRONOS_DB_PATH: z.string().default("data/chronos.db"),
});

export type Config = z.infer<typeof envSchema>;

export const config = envSchema.parse(process.env);
