// ===============================================================
// Comptable Agent — Tools & Repository ("Mon Comptable")
// ===============================================================

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import { COMPTABLE_DISCLAIMER } from './comptable.prompts';
import type {
  FreelanceRecord,
  FreelanceRecordType,
  FreelanceReminder,
  QuarterlyReport,
  InvoiceData,
  InvoiceLineItem,
  PaymentStatus,
  ExpenseCategory,
} from './comptable.types';

// Re-export for convenience
export { COMPTABLE_DISCLAIMER };

// ── Records (freelance_records) ──

export async function getRecords(
  userId: string,
  type?: FreelanceRecordType,
  limit = 50,
): Promise<FreelanceRecord[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (type) {
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }

    const result = await dbClient.query(
      `SELECT * FROM freelance_records
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${idx}`,
      [...values, limit],
    );
    return result.rows.map((r) => rowToRecord(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get freelance records', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function createRecord(
  userId: string,
  data: {
    type: FreelanceRecordType;
    amountCents: number;
    tvaRate?: number;
    tvaCents?: number;
    description: string;
    clientName?: string | null;
    invoiceNumber?: string | null;
    invoiceDate?: string | null;
    paymentStatus?: PaymentStatus;
    category?: ExpenseCategory | null;
    fiscalQuarter?: string | null;
  },
): Promise<FreelanceRecord | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();
  const tvaRate = data.tvaRate ?? 0;
  const tvaCents = data.tvaCents ?? Math.round(data.amountCents * tvaRate / 100);

  try {
    const result = await dbClient.query(
      `INSERT INTO freelance_records
       (id, user_id, type, amount_cents, tva_rate, tva_cents, description,
        client_name, invoice_number, invoice_date, payment_status, category, fiscal_quarter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        id, userId, data.type, data.amountCents, tvaRate, tvaCents,
        data.description, data.clientName ?? null,
        data.invoiceNumber ?? null, data.invoiceDate ?? null,
        data.paymentStatus ?? 'pending',
        data.category ?? null, data.fiscalQuarter ?? null,
      ],
    );
    return rowToRecord(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create freelance record', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Reminders (freelance_reminders) ──

export async function getReminders(
  userId: string,
  pendingOnly = false,
): Promise<FreelanceReminder[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];

    if (pendingOnly) {
      conditions.push('is_done = FALSE');
    }

    const result = await dbClient.query(
      `SELECT * FROM freelance_reminders
       WHERE ${conditions.join(' AND ')}
       ORDER BY due_date ASC`,
      values,
    );
    return result.rows.map((r) => rowToReminder(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get freelance reminders', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function createReminder(
  userId: string,
  data: {
    type: FreelanceReminder['type'];
    title: string;
    dueDate: string;
    notes?: string | null;
  },
): Promise<FreelanceReminder | null> {
  if (!dbClient.isConnected()) return null;
  const id = uuidv4();

  try {
    const result = await dbClient.query(
      `INSERT INTO freelance_reminders
       (id, user_id, type, title, due_date, is_done, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [id, userId, data.type, data.title, data.dueDate, false, data.notes ?? null],
    );
    return rowToReminder(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create freelance reminder', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function markReminderDone(
  reminderId: string,
  userId: string,
): Promise<boolean> {
  if (!dbClient.isConnected()) return false;
  try {
    const result = await dbClient.query(
      `UPDATE freelance_reminders
       SET is_done = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [reminderId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    logger.error('Failed to mark reminder done', {
      reminderId,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ── Quarterly Summary ──

export async function getQuarterlySummary(
  userId: string,
  quarter: string,
  year: number,
): Promise<QuarterlyReport> {
  const empty: QuarterlyReport = {
    quarter,
    year,
    totalRevenueCents: 0,
    totalExpenseCents: 0,
    totalTvaCollectedCents: 0,
    totalTvaDeductibleCents: 0,
    netTvaCents: 0,
    recordCount: 0,
    topClients: [],
    expensesByCategory: {},
    urssafEstimateCents: 0,
  };

  if (!dbClient.isConnected()) return empty;

  try {
    // Aggregated revenue
    const revenueResult = await dbClient.query(
      `SELECT
         COALESCE(SUM(amount_cents), 0) AS total_revenue,
         COALESCE(SUM(tva_cents), 0) AS total_tva_collected,
         COUNT(*) AS record_count
       FROM freelance_records
       WHERE user_id = $1 AND type = 'revenue' AND fiscal_quarter = $2
         AND EXTRACT(YEAR FROM created_at) = $3`,
      [userId, quarter, year],
    );

    // Aggregated expenses
    const expenseResult = await dbClient.query(
      `SELECT
         COALESCE(SUM(amount_cents), 0) AS total_expense,
         COALESCE(SUM(tva_cents), 0) AS total_tva_deductible
       FROM freelance_records
       WHERE user_id = $1 AND type = 'expense' AND fiscal_quarter = $2
         AND EXTRACT(YEAR FROM created_at) = $3`,
      [userId, quarter, year],
    );

    // Top clients
    const clientsResult = await dbClient.query(
      `SELECT client_name, SUM(amount_cents) AS total_cents
       FROM freelance_records
       WHERE user_id = $1 AND type = 'revenue' AND fiscal_quarter = $2
         AND EXTRACT(YEAR FROM created_at) = $3 AND client_name IS NOT NULL
       GROUP BY client_name
       ORDER BY total_cents DESC
       LIMIT 10`,
      [userId, quarter, year],
    );

    // Expenses by category
    const catResult = await dbClient.query(
      `SELECT category, SUM(amount_cents) AS total_cents
       FROM freelance_records
       WHERE user_id = $1 AND type = 'expense' AND fiscal_quarter = $2
         AND EXTRACT(YEAR FROM created_at) = $3 AND category IS NOT NULL
       GROUP BY category
       ORDER BY total_cents DESC`,
      [userId, quarter, year],
    );

    const revRow = revenueResult.rows[0] as Record<string, unknown>;
    const expRow = expenseResult.rows[0] as Record<string, unknown>;
    const totalRevenue = Number(revRow['total_revenue'] ?? 0);
    const totalTvaCollected = Number(revRow['total_tva_collected'] ?? 0);
    const totalExpense = Number(expRow['total_expense'] ?? 0);
    const totalTvaDeductible = Number(expRow['total_tva_deductible'] ?? 0);

    // Estimate URSSAF at 21.2% (BIC services default, most common for freelance)
    const urssafEstimate = Math.round(totalRevenue * 0.212);

    const topClients = clientsResult.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        clientName: (row['client_name'] as string) ?? 'Inconnu',
        totalCents: Number(row['total_cents'] ?? 0),
      };
    });

    const expensesByCategory: Record<string, number> = {};
    for (const r of catResult.rows) {
      const row = r as Record<string, unknown>;
      const cat = (row['category'] as string) ?? 'autre';
      expensesByCategory[cat] = Number(row['total_cents'] ?? 0);
    }

    return {
      quarter,
      year,
      totalRevenueCents: totalRevenue,
      totalExpenseCents: totalExpense,
      totalTvaCollectedCents: totalTvaCollected,
      totalTvaDeductibleCents: totalTvaDeductible,
      netTvaCents: totalTvaCollected - totalTvaDeductible,
      recordCount: Number(revRow['record_count'] ?? 0),
      topClients,
      expensesByCategory,
      urssafEstimateCents: urssafEstimate,
    };
  } catch (err) {
    logger.error('Failed to get quarterly summary', {
      userId,
      quarter,
      year,
      error: err instanceof Error ? err.message : String(err),
    });
    return empty;
  }
}

// ── Invoice Formatter ──

export function formatInvoice(data: InvoiceData): string {
  const lines = [
    '╔══════════════════════════════════════════════════╗',
    '║                    F A C T U R E                 ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    `Facture N° : ${data.invoiceNumber}`,
    `Date       : ${data.invoiceDate}`,
    `Echeance   : ${data.dueDate}`,
    '',
    '── EMETTEUR ──',
    data.freelanceName,
    data.freelanceAddress ? `Adresse : ${data.freelanceAddress}` : '',
    data.freelanceSiret ? `SIRET   : ${data.freelanceSiret}` : '',
    '',
    '── CLIENT ──',
    data.clientName,
    data.clientAddress ? `Adresse : ${data.clientAddress}` : '',
    data.clientSiret ? `SIRET   : ${data.clientSiret}` : '',
    '',
    '── PRESTATIONS ──',
    '┌──────────────────────────┬──────┬──────────┬──────┬──────────┐',
    '│ Description              │ Qte  │ PU HT    │ TVA  │ Total HT │',
    '├──────────────────────────┼──────┼──────────┼──────┼──────────┤',
  ];

  for (const item of data.lineItems) {
    const desc = item.description.padEnd(24).slice(0, 24);
    const qty = String(item.quantity).padStart(4);
    const pu = formatCents(item.unitPriceCents).padStart(8);
    const tva = `${item.tvaRate}%`.padStart(4);
    const total = formatCents(item.quantity * item.unitPriceCents).padStart(8);
    lines.push(`│ ${desc} │ ${qty} │ ${pu} │ ${tva} │ ${total} │`);
  }

  lines.push('└──────────────────────────┴──────┴──────────┴──────┴──────────┘');
  lines.push('');
  lines.push(`Total HT  : ${formatCents(data.totalHtCents)}`);
  lines.push(`Total TVA : ${formatCents(data.totalTvaCents)}`);
  lines.push(`Total TTC : ${formatCents(data.totalTtcCents)}`);
  lines.push('');

  if (data.paymentTerms) {
    lines.push(`Conditions de paiement : ${data.paymentTerms}`);
  }

  if (data.notes) {
    lines.push(`Notes : ${data.notes}`);
  }

  lines.push('');
  lines.push('Mentions legales :');
  lines.push('- TVA non applicable, art. 293 B du CGI (si franchise en base)');
  lines.push('- En cas de retard de paiement, une penalite de 3x le taux');
  lines.push('  d\'interet legal sera appliquee, ainsi qu\'une indemnite');
  lines.push('  forfaitaire de recouvrement de 40 EUR.');
  lines.push('');
  lines.push(COMPTABLE_DISCLAIMER);

  return lines.filter((l) => l !== undefined).join('\n');
}

// ── Helper: compute invoice totals ──

export function computeInvoiceTotals(lineItems: InvoiceLineItem[]): {
  totalHtCents: number;
  totalTvaCents: number;
  totalTtcCents: number;
} {
  let totalHt = 0;
  let totalTva = 0;

  for (const item of lineItems) {
    const lineHt = item.quantity * item.unitPriceCents;
    const lineTva = Math.round(lineHt * item.tvaRate / 100);
    totalHt += lineHt;
    totalTva += lineTva;
  }

  return {
    totalHtCents: totalHt,
    totalTvaCents: totalTva,
    totalTtcCents: totalHt + totalTva,
  };
}

// ── Helper: format cents to EUR string ──

function formatCents(cents: number): string {
  const euros = (cents / 100).toFixed(2);
  return `${euros} EUR`;
}

// ── Row Mappers ──

function rowToRecord(row: Record<string, unknown>): FreelanceRecord {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    type: row['type'] as FreelanceRecordType,
    amountCents: Number(row['amount_cents'] ?? 0),
    tvaRate: Number(row['tva_rate'] ?? 0),
    tvaCents: Number(row['tva_cents'] ?? 0),
    description: (row['description'] as string) ?? '',
    clientName: (row['client_name'] as string) ?? null,
    invoiceNumber: (row['invoice_number'] as string) ?? null,
    invoiceDate: (row['invoice_date'] as string) ?? null,
    paymentStatus: (row['payment_status'] as PaymentStatus) ?? 'pending',
    category: (row['category'] as ExpenseCategory) ?? null,
    fiscalQuarter: (row['fiscal_quarter'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToReminder(row: Record<string, unknown>): FreelanceReminder {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    type: row['type'] as FreelanceReminder['type'],
    title: (row['title'] as string) ?? '',
    dueDate: (row['due_date'] as string) ?? '',
    isDone: (row['is_done'] as boolean) ?? false,
    notes: (row['notes'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
