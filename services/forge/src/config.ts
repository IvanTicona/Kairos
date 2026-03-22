import { z } from "zod/v4";

const tierMapSchema = z.record(z.string(), z.string());

const defaultTierMap: Record<string, string> = {
  quick: "gpt-4o-mini",
  standard: "gpt-4o",
  reasoning: "o4-mini",
};

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  FORGE_API_KEY: z.string().min(1, "FORGE_API_KEY is required"),
  FORGE_PORT: z.coerce.number().default(3001),
  FORGE_TIER_MAP: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return defaultTierMap;
      return { ...defaultTierMap, ...JSON.parse(val) };
    }),
  FORGE_DB_PATH: z.string().default("data/forge.db"),
});

export type Config = z.infer<typeof envSchema>;

export const config = envSchema.parse(process.env);
