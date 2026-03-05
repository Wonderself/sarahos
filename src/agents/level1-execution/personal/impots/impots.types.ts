// ═══════════════════════════════════════════════════════
// ImpotsAgent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Task Types ──

export type ImpotsTaskType = 'guide' | 'deductions' | 'calendar' | 'simulate';

// ── Taxpayer Profiles ──

export type TaxpayerType =
  | 'salarie'
  | 'auto_entrepreneur'
  | 'liberal'
  | 'retraite'
  | 'investisseur'
  | 'non_resident';

export type FamilySituation =
  | 'celibataire'
  | 'marie'
  | 'pacse'
  | 'divorce'
  | 'veuf';

// ── Tax Brackets (IR) ──

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number; // percentage
}

// ── Result Shapes ──

export interface GuideResult {
  topic: string;
  explanation: string;
  references: string[];
  tips: string[];
  disclaimer: string;
}

export interface DeductionsResult {
  applicableDeductions: DeductionItem[];
  estimatedSavings: number;
  conditions: string[];
  tips: string[];
  disclaimer: string;
}

export interface DeductionItem {
  name: string;
  amount: number;
  type: 'deduction' | 'credit' | 'reduction';
  cgiArticle: string;
}

export interface CalendarResult {
  year: number;
  keyDates: FiscalDate[];
  nextDeadline: FiscalDate | null;
  reminders: string[];
  disclaimer: string;
}

export interface FiscalDate {
  date: string;
  description: string;
  category: 'declaration' | 'payment' | 'regularization' | 'other';
  mandatory: boolean;
}

export interface SimulationResult {
  parameters: Record<string, unknown>;
  calculation: string;
  result: number;
  breakdown: TaxBreakdownEntry[];
  disclaimer: string;
}

export interface TaxBreakdownEntry {
  bracket: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}
