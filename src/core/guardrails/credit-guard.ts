// ═══════════════════════════════════════════════════════════════════
// Credit Guard — coherence checks for credit system
// ═══════════════════════════════════════════════════════════════════

import { dbClient } from '../../infra/database/db-client';
import { logger } from '../../utils/logger';

interface CreditDiscrepancy {
  userId: string;
  walletBalance: number;
  calculatedBalance: number;
  drift: number;
}

interface CreditAnomaly {
  userId: string;
  type: string;
  detail: string;
}

/**
 * Runs the credit_coherence_check SQL view and returns any discrepancies
 * between wallet balance and calculated balance from transaction history.
 */
export async function checkCreditCoherence(): Promise<CreditDiscrepancy[]> {
  if (!dbClient.isConnected()) {
    logger.warn('CreditGuard: DB not connected, skipping coherence check');
    return [];
  }

  try {
    const result = await dbClient.query(`
      SELECT
        w.user_id,
        w.balance AS wallet_balance,
        COALESCE(SUM(
          CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END
        ), 0) AS calculated_balance
      FROM wallets w
      LEFT JOIN credit_transactions t ON t.user_id = w.user_id
      GROUP BY w.user_id, w.balance
      HAVING w.balance != COALESCE(SUM(
        CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END
      ), 0)
    `);

    const discrepancies: CreditDiscrepancy[] = result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      const walletBalance = Number(r['wallet_balance']);
      const calculatedBalance = Number(r['calculated_balance']);
      return {
        userId: String(r['user_id']),
        walletBalance,
        calculatedBalance,
        drift: Math.abs(walletBalance - calculatedBalance),
      };
    });

    if (discrepancies.length > 0) {
      logger.warn('CreditGuard: coherence discrepancies found', { count: discrepancies.length });
    }

    return discrepancies;
  } catch (error) {
    logger.error('CreditGuard: coherence check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Detects credit anomalies:
 * - Negative balances
 * - Consumption > 200 credits/min
 * - New accounts that burned all free credits instantly (< 60s after signup)
 */
export async function detectAnomalies(): Promise<CreditAnomaly[]> {
  if (!dbClient.isConnected()) {
    logger.warn('CreditGuard: DB not connected, skipping anomaly detection');
    return [];
  }

  const anomalies: CreditAnomaly[] = [];

  try {
    // 1. Negative balances
    const negativeResult = await dbClient.query(`
      SELECT user_id, balance
      FROM wallets
      WHERE balance < 0
    `);

    for (const row of negativeResult.rows) {
      const r = row as Record<string, unknown>;
      anomalies.push({
        userId: String(r['user_id']),
        type: 'negative_balance',
        detail: `Wallet balance is ${r['balance']} (negative)`,
      });
    }

    // 2. High consumption: > 200 credits in the last minute
    const highConsumptionResult = await dbClient.query(`
      SELECT user_id, SUM(amount) AS total_consumed
      FROM credit_transactions
      WHERE type = 'debit'
        AND created_at > NOW() - INTERVAL '1 minute'
      GROUP BY user_id
      HAVING SUM(amount) > 200
    `);

    for (const row of highConsumptionResult.rows) {
      const r = row as Record<string, unknown>;
      anomalies.push({
        userId: String(r['user_id']),
        type: 'high_consumption',
        detail: `Consumed ${r['total_consumed']} credits in the last minute (threshold: 200)`,
      });
    }

    // 3. New accounts that burned free credits instantly (< 60s after account creation)
    const instantBurnResult = await dbClient.query(`
      SELECT u.id AS user_id, u.created_at AS signup_at,
             MIN(t.created_at) AS first_debit_at,
             w.balance
      FROM users u
      JOIN wallets w ON w.user_id = u.id
      JOIN credit_transactions t ON t.user_id = u.id AND t.type = 'debit'
      WHERE u.created_at > NOW() - INTERVAL '24 hours'
        AND w.balance <= 0
      GROUP BY u.id, u.created_at, w.balance
      HAVING MIN(t.created_at) - u.created_at < INTERVAL '60 seconds'
    `);

    for (const row of instantBurnResult.rows) {
      const r = row as Record<string, unknown>;
      anomalies.push({
        userId: String(r['user_id']),
        type: 'instant_credit_burn',
        detail: `New account burned all free credits within 60 seconds of signup`,
      });
    }

    if (anomalies.length > 0) {
      logger.warn('CreditGuard: anomalies detected', {
        count: anomalies.length,
        types: Array.from(new Set(anomalies.map((a) => a.type))),
      });
    }

    return anomalies;
  } catch (error) {
    logger.error('CreditGuard: anomaly detection failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return anomalies;
  }
}

/**
 * Finds wallets with negative balance and corrects them to 0.
 * Returns the number of wallets fixed.
 */
export async function fixNegativeBalances(): Promise<number> {
  if (!dbClient.isConnected()) {
    logger.warn('CreditGuard: DB not connected, cannot fix negative balances');
    return 0;
  }

  try {
    const result = await dbClient.query(`
      UPDATE wallets
      SET balance = 0, updated_at = NOW()
      WHERE balance < 0
      RETURNING user_id, balance
    `);

    const count = result.rowCount ?? 0;

    if (count > 0) {
      logger.info('CreditGuard: fixed negative balances', { count });
    }

    return count;
  } catch (error) {
    logger.error('CreditGuard: fixNegativeBalances failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
