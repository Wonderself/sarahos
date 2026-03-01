export interface Wallet {
  id: string;
  userId: string;
  balanceCredits: number;    // micro-credits (1 credit = 1,000,000 micro)
  totalDeposited: number;
  totalSpent: number;
  currency: string;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Commission tiers (locked at registration based on user number)
export const COMMISSION_TIERS = [
  { maxUserNumber: 1000, rate: 0, label: 'Early Adopter' },
  { maxUserNumber: 100000, rate: 0.05, label: 'Standard' },
  { maxUserNumber: Infinity, rate: 0.07, label: 'Standard+' },
];

export function getCommissionRate(userNumber: number): number {
  for (const tier of COMMISSION_TIERS) {
    if (userNumber <= tier.maxUserNumber) return tier.rate;
  }
  return 0.07;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'refund' | 'bonus' | 'expiry';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;            // positive for credits, negative for debits
  balanceAfter: number;
  description: string;
  referenceType: string | null;  // 'stripe_payment', 'llm_usage', 'promo_bonus', 'admin_credit'
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface LlmUsageEntry {
  id: string;
  userId: string;
  walletId: string | null;
  requestId: string | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCredits: number;       // actual cost in micro-credits
  billedCredits: number;     // cost + margin
  marginCredits: number;     // profit
  agentName: string | null;
  endpoint: string | null;
  durationMs: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface DepositInput {
  userId: string;
  amount: number;            // micro-credits
  description: string;
  referenceType: string;
  referenceId?: string;
}

export interface TokenPricing {
  model: string;
  provider: string;
  inputCostPerMillion: number;    // micro-credits per 1M input tokens
  outputCostPerMillion: number;   // micro-credits per 1M output tokens
  marginPercent: number;          // e.g. 20 for 20%
}

// 1 credit = 1,000,000 micro-credits
// Display: "10.50 credits" = 10,500,000 micro-credits
export const MICRO_CREDITS_PER_CREDIT = 1_000_000;

export function microCreditsToCredits(micro: number): number {
  return micro / MICRO_CREDITS_PER_CREDIT;
}

export function creditsToMicroCredits(credits: number): number {
  return Math.round(credits * MICRO_CREDITS_PER_CREDIT);
}
