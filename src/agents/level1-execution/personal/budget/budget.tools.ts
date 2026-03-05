// ===============================================================
// Budget Agent — Tools & Repository ("Mon Budget")
// ===============================================================

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import type {
  BudgetTransaction,
  BudgetGoal,
  BudgetSummary,
  BudgetCategory,
  TransactionType,
  GoalStatus,
} from './budget.types';

// ── Budget Categories with Emoji ──

export const BUDGET_CATEGORIES: Record<BudgetCategory, { emoji: string; label: string; type: TransactionType }> = {
  alimentation: { emoji: '\uD83D\uDED2', label: 'Alimentation', type: 'expense' },
  logement: { emoji: '\uD83C\uDFE0', label: 'Logement', type: 'expense' },
  transport: { emoji: '\uD83D\uDE97', label: 'Transport', type: 'expense' },
  loisirs: { emoji: '\uD83C\uDFAE', label: 'Loisirs', type: 'expense' },
  sante: { emoji: '\uD83C\uDFE5', label: 'Sante', type: 'expense' },
  vetements: { emoji: '\uD83D\uDC55', label: 'Vetements', type: 'expense' },
  abonnements: { emoji: '\uD83D\uDCF1', label: 'Abonnements', type: 'expense' },
  education: { emoji: '\uD83D\uDCDA', label: 'Education', type: 'expense' },
  epargne: { emoji: '\uD83D\uDCB0', label: 'Epargne', type: 'expense' },
  impots: { emoji: '\uD83C\uDFDB\uFE0F', label: 'Impots & Taxes', type: 'expense' },
  assurance: { emoji: '\uD83D\uDEE1\uFE0F', label: 'Assurance', type: 'expense' },
  cadeaux: { emoji: '\uD83C\uDF81', label: 'Cadeaux', type: 'expense' },
  restaurant: { emoji: '\uD83C\uDF7D\uFE0F', label: 'Restaurant', type: 'expense' },
  voyage: { emoji: '\u2708\uFE0F', label: 'Voyage', type: 'expense' },
  electronique: { emoji: '\uD83D\uDCBB', label: 'Electronique', type: 'expense' },
  animaux: { emoji: '\uD83D\uDC3E', label: 'Animaux', type: 'expense' },
  enfants: { emoji: '\uD83D\uDC76', label: 'Enfants', type: 'expense' },
  salaire: { emoji: '\uD83D\uDCB5', label: 'Salaire', type: 'income' },
  freelance: { emoji: '\uD83D\uDCBC', label: 'Freelance', type: 'income' },
  investissement: { emoji: '\uD83D\uDCC8', label: 'Investissement', type: 'income' },
  remboursement: { emoji: '\uD83D\uDD04', label: 'Remboursement', type: 'income' },
  autre: { emoji: '\u2753', label: 'Autre', type: 'expense' },
};

// ── Get Transactions ──

export async function getTransactions(
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    category?: BudgetCategory;
    type?: TransactionType;
    limit?: number;
  },
): Promise<BudgetTransaction[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (filters?.startDate) {
      conditions.push(`date >= $${idx++}`);
      values.push(filters.startDate);
    }
    if (filters?.endDate) {
      conditions.push(`date <= $${idx++}`);
      values.push(filters.endDate);
    }
    if (filters?.category) {
      conditions.push(`category = $${idx++}`);
      values.push(filters.category);
    }
    if (filters?.type) {
      conditions.push(`type = $${idx++}`);
      values.push(filters.type);
    }

    const limit = filters?.limit ?? 100;

    const result = await dbClient.query(
      `SELECT * FROM budget_transactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY date DESC
       LIMIT $${idx}`,
      [...values, limit],
    );

    return result.rows.map((r) => rowToTransaction(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get budget transactions', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

// ── Create Transaction ──

export async function createTransaction(
  userId: string,
  data: {
    amountCents: number;
    type: TransactionType;
    category?: BudgetCategory;
    description?: string;
    date?: Date | string;
    recurring?: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'yearly' | null;
    tags?: string[];
  },
): Promise<BudgetTransaction | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO budget_transactions
       (id, user_id, amount_cents, type, category, description, date,
        recurring, recurring_frequency, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        id,
        userId,
        data.amountCents,
        data.type,
        data.category ?? 'autre',
        data.description ?? '',
        data.date ?? new Date(),
        data.recurring ?? false,
        data.recurringFrequency ?? null,
        data.tags ?? [],
      ],
    );

    return rowToTransaction(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create budget transaction', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Delete Transaction ──

export async function deleteTransaction(
  transactionId: string,
  userId: string,
): Promise<boolean> {
  if (!dbClient.isConnected()) return false;
  try {
    const result = await dbClient.query(
      `DELETE FROM budget_transactions
       WHERE id = $1 AND user_id = $2`,
      [transactionId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    logger.error('Failed to delete budget transaction', {
      transactionId,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ── Get Goals ──

export async function getGoals(
  userId: string,
  statusFilter?: GoalStatus,
): Promise<BudgetGoal[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];

    if (statusFilter) {
      conditions.push('status = $2');
      values.push(statusFilter);
    }

    const result = await dbClient.query(
      `SELECT * FROM budget_goals
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC`,
      values,
    );
    return result.rows.map((r) => rowToGoal(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get budget goals', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

// ── Create Goal ──

export async function createGoal(
  userId: string,
  data: {
    name: string;
    targetCents: number;
    currentCents?: number;
    deadline?: Date | string | null;
    category?: BudgetCategory | null;
    notes?: string | null;
  },
): Promise<BudgetGoal | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO budget_goals
       (id, user_id, name, target_cents, current_cents, deadline, status, category, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        id,
        userId,
        data.name,
        data.targetCents,
        data.currentCents ?? 0,
        data.deadline ?? null,
        'active',
        data.category ?? null,
        data.notes ?? null,
      ],
    );

    return rowToGoal(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create budget goal', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Update Goal ──

export async function updateGoal(
  goalId: string,
  userId: string,
  updates: {
    currentCents?: number;
    status?: GoalStatus;
    name?: string;
    targetCents?: number;
    deadline?: Date | string | null;
    notes?: string | null;
  },
): Promise<BudgetGoal | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.currentCents !== undefined) {
      setClauses.push(`current_cents = $${idx++}`);
      values.push(updates.currentCents);
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.targetCents !== undefined) {
      setClauses.push(`target_cents = $${idx++}`);
      values.push(updates.targetCents);
    }
    if (updates.deadline !== undefined) {
      setClauses.push(`deadline = $${idx++}`);
      values.push(updates.deadline);
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${idx++}`);
      values.push(updates.notes);
    }

    // Auto-detect reached status
    if (updates.currentCents !== undefined && updates.status === undefined) {
      const goalResult = await dbClient.query(
        'SELECT target_cents FROM budget_goals WHERE id = $1 AND user_id = $2',
        [goalId, userId],
      );
      if (goalResult.rows.length > 0) {
        const targetCents = Number(
          (goalResult.rows[0] as Record<string, unknown>)['target_cents'] ?? 0,
        );
        if (updates.currentCents >= targetCents) {
          setClauses.push(`status = $${idx++}`);
          values.push('reached');
        }
      }
    }

    values.push(goalId);
    values.push(userId);

    const result = await dbClient.query(
      `UPDATE budget_goals
       SET ${setClauses.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) return null;
    return rowToGoal(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update budget goal', {
      goalId,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Monthly Summary ──

export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number,
): Promise<BudgetSummary> {
  const defaultSummary: BudgetSummary = {
    month,
    year,
    totalIncomeCents: 0,
    totalExpenseCents: 0,
    balanceCents: 0,
    byCategory: {},
    transactionCount: 0,
    topExpenseCategories: [],
    savingsRatePct: 0,
  };

  if (!dbClient.isConnected()) return defaultSummary;

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const [totalsResult, categoryResult] = await Promise.all([
      dbClient.query(
        `SELECT
           COALESCE(SUM(amount_cents) FILTER (WHERE type = 'income'), 0) as total_income,
           COALESCE(SUM(amount_cents) FILTER (WHERE type = 'expense'), 0) as total_expense,
           COUNT(*) as tx_count
         FROM budget_transactions
         WHERE user_id = $1 AND date >= $2 AND date < $3`,
        [userId, startDate, endDate],
      ),
      dbClient.query(
        `SELECT category, SUM(amount_cents) as total
         FROM budget_transactions
         WHERE user_id = $1 AND date >= $2 AND date < $3 AND type = 'expense'
         GROUP BY category
         ORDER BY total DESC`,
        [userId, startDate, endDate],
      ),
    ]);

    const totalsRow = totalsResult.rows[0] as Record<string, unknown>;
    const totalIncome = Number(totalsRow['total_income'] ?? 0);
    const totalExpense = Number(totalsRow['total_expense'] ?? 0);
    const txCount = Number(totalsRow['tx_count'] ?? 0);

    const byCategory: Record<string, number> = {};
    const topExpenseCategories: Array<{ category: string; amountCents: number; percentage: number }> = [];

    for (const row of categoryResult.rows) {
      const r = row as Record<string, unknown>;
      const cat = r['category'] as string;
      const total = Number(r['total'] ?? 0);
      byCategory[cat] = total;
      topExpenseCategories.push({
        category: cat,
        amountCents: total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
      });
    }

    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
      : 0;

    return {
      month,
      year,
      totalIncomeCents: totalIncome,
      totalExpenseCents: totalExpense,
      balanceCents: totalIncome - totalExpense,
      byCategory,
      transactionCount: txCount,
      topExpenseCategories: topExpenseCategories.slice(0, 5),
      savingsRatePct: savingsRate,
    };
  } catch (err) {
    logger.error('Failed to get monthly summary', {
      userId,
      month,
      year,
      error: err instanceof Error ? err.message : String(err),
    });
    return defaultSummary;
  }
}

// ── Format Budget Summary (pure text formatter) ──

export function formatBudgetSummary(summary: BudgetSummary): string {
  const lines: string[] = [
    '╔══════════════════════════════════════════════════╗',
    '║           B I L A N   B U D G E T               ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    `Periode : ${String(summary.month).padStart(2, '0')}/${summary.year}`,
    '',
    '── REVENUS & DEPENSES ──',
    `Revenus   : ${formatCents(summary.totalIncomeCents)}`,
    `Depenses  : ${formatCents(summary.totalExpenseCents)}`,
    `Solde     : ${formatCents(summary.balanceCents)}`,
    '',
    `Transactions : ${summary.transactionCount}`,
    `Taux d'epargne : ${summary.savingsRatePct}%`,
    '',
  ];

  if (summary.topExpenseCategories.length > 0) {
    lines.push('── TOP DEPENSES ──');
    for (const cat of summary.topExpenseCategories) {
      const label = cat.category.padEnd(16);
      const amount = formatCents(cat.amountCents).padStart(12);
      lines.push(`  ${label} ${amount}  (${cat.percentage}%)`);
    }
    lines.push('');
  }

  if (Object.keys(summary.byCategory).length > 0) {
    lines.push('── REPARTITION PAR CATEGORIE ──');
    for (const [cat, amount] of Object.entries(summary.byCategory)) {
      lines.push(`  ${cat.padEnd(16)} ${formatCents(amount).padStart(12)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Helper: format cents to EUR string ──

function formatCents(cents: number): string {
  const euros = (cents / 100).toFixed(2);
  return `${euros} EUR`;
}

// ── Row Mappers ──

function rowToTransaction(row: Record<string, unknown>): BudgetTransaction {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    amountCents: Number(row['amount_cents'] ?? 0),
    type: (row['type'] as TransactionType) ?? 'expense',
    category: (row['category'] as BudgetCategory) ?? 'autre',
    description: (row['description'] as string) ?? '',
    date: new Date(row['date'] as string),
    recurring: (row['recurring'] as boolean) ?? false,
    recurringFrequency: (row['recurring_frequency'] as BudgetTransaction['recurringFrequency']) ?? null,
    tags: (row['tags'] as string[]) ?? [],
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToGoal(row: Record<string, unknown>): BudgetGoal {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    name: (row['name'] as string) ?? 'Objectif sans nom',
    targetCents: Number(row['target_cents'] ?? 0),
    currentCents: Number(row['current_cents'] ?? 0),
    deadline: row['deadline'] ? new Date(row['deadline'] as string) : null,
    status: (row['status'] as GoalStatus) ?? 'active',
    category: (row['category'] as BudgetCategory) ?? null,
    notes: (row['notes'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
