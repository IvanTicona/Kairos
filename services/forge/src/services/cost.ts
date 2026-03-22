// Pricing per 1M tokens in USD (as of March 2026)
// Source: https://openai.com/pricing
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "o4-mini": { input: 1.1, output: 4.4 },
  "o3": { input: 2.0, output: 8.0 },
  "o3-mini": { input: 1.1, output: 4.4 },
};

export function calculateCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
): number | null {
  const pricing = PRICING[model];
  if (!pricing) return null;

  const inputCost = (tokensIn / 1_000_000) * pricing.input;
  const outputCost = (tokensOut / 1_000_000) * pricing.output;

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
