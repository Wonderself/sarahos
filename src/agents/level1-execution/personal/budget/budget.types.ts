// ═══════════════════════════════════════════════════════
// Budget Agent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Task Types ──

export type BudgetTaskType = 'categorize' | 'project' | 'goals' | 'summary';

// ── Transaction Types ──

export type TransactionType = 'income' | 'expense';

export type BudgetCategory =
  | 'alimentation'
  | 'logement'
  | 'transport'
  | 'loisirs'
  | 'sante'
  | 'vetements'
  | 'abonnements'
  | 'education'
  | 'epargne'
  | 'impots'
  | 'assurance'
  | 'cadeaux'
  | 'restaurant'
  | 'voyage'
  | 'electronique'
  | 'animaux'
  | 'enfants'
  | 'salaire'
  | 'freelance'
  | 'investissement'
  | 'remboursement'
  | 'autre';

// ── Goal Status ──

export type GoalStatus = 'active' | 'reached' | 'abandoned' | 'paused';

// ── Data Structures ──

export interface BudgetTransaction {
  id: string;
  userId: string;
  amountCents: number;
  type: TransactionType;
  category: BudgetCategory;
  description: string;
  date: Date;
  recurring: boolean;
  recurringFrequency: 'weekly' | 'monthly' | 'yearly' | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetGoal {
  id: string;
  userId: string;
  name: string;
  targetCents: number;
  currentCents: number;
  deadline: Date | null;
  status: GoalStatus;
  category: BudgetCategory | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  month: number;
  year: number;
  totalIncomeCents: number;
  totalExpenseCents: number;
  balanceCents: number;
  byCategory: Record<string, number>;
  transactionCount: number;
  topExpenseCategories: Array<{ category: string; amountCents: number; percentage: number }>;
  savingsRatePct: number;
}

// ── Task Payloads ──

export interface CategorizePayload {
  type: 'categorize';
  userId: string;
  transactions?: Array<{
    description: string;
    amountCents: number;
    type: TransactionType;
    date?: string;
  }>;
  rawText?: string;
}

export interface ProjectPayload {
  type: 'project';
  userId: string;
  monthsAhead?: number;
  scenario?: 'optimiste' | 'realiste' | 'pessimiste';
}

export interface GoalsPayload {
  type: 'goals';
  userId: string;
  action: 'list' | 'create' | 'update' | 'suggest';
  goalId?: string;
  goalData?: Partial<BudgetGoal>;
  currentCents?: number;
}

export interface SummaryPayload {
  type: 'summary';
  userId: string;
  month?: number;
  year?: number;
  includeAdvice?: boolean;
}

// ── LLM Response Shapes ──

export interface CategorizeResult {
  categorized: Array<{
    description: string;
    amountCents: number;
    type: TransactionType;
    category: BudgetCategory;
    confidence: number;
    date: string;
  }>;
  uncategorized: string[];
  summary: string;
}

export interface ProjectionResult {
  projections: Array<{
    month: string;
    incomeCents: number;
    expenseCents: number;
    balanceCents: number;
    savingsCents: number;
  }>;
  scenario: string;
  assumptions: string[];
  risks: string[];
  recommendations: string[];
}

export interface GoalSuggestion {
  name: string;
  targetCents: number;
  timeline: string;
  strategy: string;
  monthlyContributionCents: number;
}
