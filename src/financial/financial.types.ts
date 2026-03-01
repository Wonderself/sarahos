export type AccountType = 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY';

export type Currency = 'EUR' | 'USD' | 'ILS';

export interface LedgerEntry {
  id: string;
  entryDate: string;
  accountType: AccountType;
  category: string;
  description: string;
  amountCents: number;
  currency: Currency;
  debitAccount: string;
  creditAccount: string;
  referenceId?: string;
  approvedBy?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'DENIED';
  createdAt: string;
}

export interface BudgetSummary {
  totalRevenueCents: number;
  totalExpensesCents: number;
  netProfitCents: number;
  charityAllocationCents: number;
  currency: Currency;
  period: string;
}

export interface CostBreakdown {
  apiTokens: number;
  infrastructure: number;
  saas: number;
  salaries: number;
  other: number;
  totalCents: number;
}

export interface CharityAllocation {
  id: string;
  amountCents: number;
  currency: Currency;
  beneficiary: string;
  category: string;
  allocatedAt: string;
  disbursedAt?: string;
}

export interface RevenueEntry {
  clientId: string;
  productId: string;
  amountCents: number;
  currency: Currency;
  channel: string;
  recordedAt: string;
}

export interface PredictiveScenario {
  name: string;
  monthlyBurnRateCents: number;
  monthlyRevenueCents: number;
  runwayMonths: number;
  breakEvenDate?: string;
}
