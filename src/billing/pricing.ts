import type { TokenPricing } from './billing.types';
import { creditsToMicroCredits } from './billing.types';

/**
 * Token pricing configuration.
 * Prices are in micro-credits per 1M tokens.
 * Based on Anthropic API pricing as of 2026. Margin = 0% (captured at credit pack purchase level).
 *
 * Actual Anthropic pricing (approx USD):
 * - Sonnet: $3/1M input, $15/1M output
 * - Opus:   $15/1M input, $75/1M output
 *
 * We convert USD to credits at 1 credit = ~$0.01
 * So $3/1M input = 300 credits/1M = 300,000,000 micro-credits/1M
 */
export const TOKEN_PRICING: TokenPricing[] = [
  // Claude Sonnet (fast + standard)
  {
    model: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    inputCostPerMillion: creditsToMicroCredits(300),    // 300 credits / 1M input tokens
    outputCostPerMillion: creditsToMicroCredits(1500),  // 1500 credits / 1M output tokens
    marginPercent: 0,
  },
  // Claude Opus (advanced)
  {
    model: 'claude-opus-4-6',
    provider: 'anthropic',
    inputCostPerMillion: creditsToMicroCredits(1500),   // 1500 credits / 1M input tokens
    outputCostPerMillion: creditsToMicroCredits(7500),  // 7500 credits / 1M output tokens
    marginPercent: 0,
  },
];

// Default fallback pricing — margin captured at credit pack level, not per-token
const DEFAULT_PRICING: TokenPricing = {
  model: 'default',
  provider: 'unknown',
  inputCostPerMillion: creditsToMicroCredits(500),
  outputCostPerMillion: creditsToMicroCredits(2500),
  marginPercent: 0,
};

// ── Voice & WhatsApp Pricing ──
// Margin captured at credit pack level (same as LLM tokens)

export const VOICE_PRICING = {
  sttPerMinuteMicroCredits: creditsToMicroCredits(50),          // 50 credits/minute of audio
  ttsPerThousandCharsMicroCredits: creditsToMicroCredits(150),  // 150 credits/1000 chars
  whatsappConversationMicroCredits: creditsToMicroCredits(500), // 500 credits per 24h window
} as const;

export function calculateSTTCost(durationMs: number): number {
  const minutes = durationMs / 60_000;
  return Math.ceil(minutes * VOICE_PRICING.sttPerMinuteMicroCredits);
}

export function calculateTTSCost(characterCount: number): number {
  return Math.ceil((characterCount / 1000) * VOICE_PRICING.ttsPerThousandCharsMicroCredits);
}

export function getPricingForModel(model: string): TokenPricing {
  return TOKEN_PRICING.find((p) => p.model === model) ?? DEFAULT_PRICING;
}

/**
 * Calculate the cost for a given number of tokens.
 * Returns { costCredits, billedCredits, marginCredits } in micro-credits.
 */
export function calculateTokenCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): { costCredits: number; billedCredits: number; marginCredits: number } {
  const pricing = getPricingForModel(model);

  const inputCost = Math.ceil((inputTokens * pricing.inputCostPerMillion) / 1_000_000);
  const outputCost = Math.ceil((outputTokens * pricing.outputCostPerMillion) / 1_000_000);
  const costCredits = inputCost + outputCost;

  const marginMultiplier = 1 + pricing.marginPercent / 100;
  const billedCredits = Math.ceil(costCredits * marginMultiplier);
  const marginCredits = billedCredits - costCredits;

  return { costCredits, billedCredits, marginCredits };
}
