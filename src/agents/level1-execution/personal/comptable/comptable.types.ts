// ===============================================================
// Comptable Agent — Type Definitions ("Mon Comptable")
// ===============================================================

// -- Task Types --

export type ComptableTaskType = 'invoice' | 'expense' | 'quarterly' | 'urssaf';

// -- Record Types --

export type FreelanceRecordType = 'revenue' | 'expense';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type ExpenseCategory =
  | 'materiel'
  | 'logiciel'
  | 'deplacement'
  | 'repas'
  | 'formation'
  | 'assurance'
  | 'loyer'
  | 'telephone'
  | 'internet'
  | 'comptabilite'
  | 'bancaire'
  | 'autre';

export interface FreelanceRecord {
  id: string;
  userId: string;
  type: FreelanceRecordType;
  amountCents: number;
  tvaRate: number;
  tvaCents: number;
  description: string;
  clientName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  paymentStatus: PaymentStatus;
  category: ExpenseCategory | null;
  fiscalQuarter: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -- Reminders --

export type ReminderType =
  | 'urssaf_declaration'
  | 'tva_declaration'
  | 'cfe'
  | 'impot_revenu'
  | 'facture_relance'
  | 'custom';

export interface FreelanceReminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  isDone: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -- Invoice Data --

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
  tvaRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientAddress: string | null;
  clientSiret: string | null;
  freelanceName: string;
  freelanceAddress: string | null;
  freelanceSiret: string | null;
  lineItems: InvoiceLineItem[];
  totalHtCents: number;
  totalTvaCents: number;
  totalTtcCents: number;
  paymentTerms: string | null;
  notes: string | null;
}

// -- Quarterly Report --

export interface QuarterlyReport {
  quarter: string;
  year: number;
  totalRevenueCents: number;
  totalExpenseCents: number;
  totalTvaCollectedCents: number;
  totalTvaDeductibleCents: number;
  netTvaCents: number;
  recordCount: number;
  topClients: Array<{ clientName: string; totalCents: number }>;
  expensesByCategory: Record<string, number>;
  urssafEstimateCents: number;
}

// -- Task Payloads --

export interface InvoicePayload {
  type: 'invoice';
  userId: string;
  clientName: string;
  lineItems?: InvoiceLineItem[];
  notes?: string;
}

export interface ExpensePayload {
  type: 'expense';
  userId: string;
  amountCents: number;
  description: string;
  category: ExpenseCategory;
  tvaRate?: number;
}

export interface QuarterlyPayload {
  type: 'quarterly';
  userId: string;
  quarter: string;
  year: number;
}

export interface UrssafPayload {
  type: 'urssaf';
  userId: string;
  action: 'check' | 'calculate' | 'reminders';
}
