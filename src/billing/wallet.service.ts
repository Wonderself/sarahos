import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { Wallet, WalletTransaction, DepositInput, LlmUsageEntry } from './billing.types';

function rowToWallet(row: Record<string, unknown>): Wallet {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    balanceCredits: Number(row['balance_credits']),
    totalDeposited: Number(row['total_deposited']),
    totalSpent: Number(row['total_spent']),
    currency: row['currency'] as string,
    autoTopupEnabled: row['auto_topup_enabled'] as boolean,
    autoTopupThreshold: Number(row['auto_topup_threshold'] ?? 0),
    autoTopupAmount: Number(row['auto_topup_amount'] ?? 0),
    stripeCustomerId: (row['stripe_customer_id'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToTransaction(row: Record<string, unknown>): WalletTransaction {
  return {
    id: row['id'] as string,
    walletId: row['wallet_id'] as string,
    userId: row['user_id'] as string,
    type: row['type'] as WalletTransaction['type'],
    amount: Number(row['amount']),
    balanceAfter: Number(row['balance_after']),
    description: row['description'] as string,
    referenceType: (row['reference_type'] as string) ?? null,
    referenceId: (row['reference_id'] as string) ?? null,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
  };
}

export class WalletService {
  /**
   * Get or create a wallet for a user.
   */
  async getOrCreateWallet(userId: string): Promise<Wallet | null> {
    if (!dbClient.isConnected()) return null;

    // Atomic upsert: INSERT ... ON CONFLICT prevents race conditions
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO wallets (id, user_id) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = wallets.updated_at
       RETURNING *`,
      [id, userId],
    );
    return result.rows[0] ? rowToWallet(result.rows[0] as Record<string, unknown>) : null;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    return result.rows[0] ? rowToWallet(result.rows[0] as Record<string, unknown>) : null;
  }

  /**
   * Deposit credits into a wallet (atomic transaction with row-level locking).
   */
  async deposit(input: DepositInput): Promise<WalletTransaction | null> {
    if (!dbClient.isConnected()) return null;
    if (input.amount <= 0) throw new Error('Deposit amount must be positive');

    // Ensure wallet exists before entering transaction
    const wallet = await this.getOrCreateWallet(input.userId);
    if (!wallet) throw new Error('Failed to get or create wallet');

    return dbClient.withTransaction(async (client) => {
      // Lock the wallet row to prevent concurrent modifications
      const lockedResult = await client.query(
        'SELECT * FROM wallets WHERE id = $1 FOR UPDATE',
        [wallet.id],
      );
      if (!lockedResult.rows[0]) return null;
      const locked = rowToWallet(lockedResult.rows[0] as Record<string, unknown>);

      const newBalance = locked.balanceCredits + input.amount;
      const txId = uuidv4();

      await client.query(
        `UPDATE wallets SET balance_credits = $1, total_deposited = total_deposited + $2, updated_at = NOW() WHERE id = $3`,
        [newBalance, input.amount, wallet.id],
      );

      const txResult = await client.query(
        `INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id)
         VALUES ($1, $2, $3, 'deposit', $4, $5, $6, $7, $8) RETURNING *`,
        [txId, wallet.id, input.userId, input.amount, newBalance, input.description, input.referenceType, input.referenceId ?? null],
      );

      logger.info('Wallet deposit', { userId: input.userId, amount: input.amount, newBalance });
      return txResult.rows[0] ? rowToTransaction(txResult.rows[0] as Record<string, unknown>) : null;
    });
  }

  /**
   * Withdraw credits (for LLM usage, etc.). Returns null if insufficient balance.
   * Uses SELECT ... FOR UPDATE to prevent concurrent race conditions.
   */
  async withdraw(
    userId: string,
    amount: number,
    description: string,
    referenceType: string,
    referenceId?: string,
  ): Promise<WalletTransaction | null> {
    if (!dbClient.isConnected()) return null;
    if (amount <= 0) throw new Error('Withdrawal amount must be positive');

    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) return null;

    try {
      return await dbClient.withTransaction(async (client) => {
        // Lock the wallet row to prevent concurrent modifications
        const lockedResult = await client.query(
          'SELECT * FROM wallets WHERE id = $1 FOR UPDATE',
          [wallet.id],
        );
        if (!lockedResult.rows[0]) return null;
        const locked = rowToWallet(lockedResult.rows[0] as Record<string, unknown>);

        if (locked.balanceCredits < amount) {
          logger.warn('Insufficient wallet balance', { userId, balance: locked.balanceCredits, required: amount });
          return null;
        }

        const newBalance = locked.balanceCredits - amount;
        const txId = uuidv4();

        await client.query(
          `UPDATE wallets SET balance_credits = $1, total_spent = total_spent + $2, updated_at = NOW() WHERE id = $3`,
          [newBalance, amount, wallet.id],
        );

        const txResult = await client.query(
          `INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id)
           VALUES ($1, $2, $3, 'withdrawal', $4, $5, $6, $7, $8) RETURNING *`,
          [txId, wallet.id, userId, -amount, newBalance, description, referenceType, referenceId ?? null],
        );

        logger.info('Wallet withdrawal', { userId, amount, newBalance });
        return txResult.rows[0] ? rowToTransaction(txResult.rows[0] as Record<string, unknown>) : null;
      });
    } catch (error) {
      // Handle DB-level balance constraint (safety net)
      if (error instanceof Error && error.message.includes('chk_balance_nonnegative')) {
        logger.warn('Balance constraint prevented overdraft', { userId, amount });
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if user has sufficient balance.
   */
  async hasBalance(userId: string, requiredAmount: number): Promise<boolean> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) return false;
    return wallet.balanceCredits >= requiredAmount;
  }

  /**
   * Pre-authorize (hold) credits before an LLM call.
   * Atomically deducts the estimated max cost. Returns a hold transaction ID
   * that can be used with releaseHold() to refund the difference after actual cost is known.
   */
  async hold(userId: string, amount: number, description: string): Promise<string | null> {
    const tx = await this.withdraw(userId, amount, `[HOLD] ${description}`, 'llm_hold');
    return tx?.id ?? null;
  }

  /**
   * Release a hold by refunding the difference between held amount and actual cost.
   * If actualAmount >= heldAmount, no refund is issued.
   */
  async releaseHold(userId: string, holdId: string, heldAmount: number, actualAmount: number): Promise<void> {
    if (actualAmount > heldAmount) {
      // Actual cost exceeded estimate — charge the difference
      const extraCharge = actualAmount - heldAmount;
      await this.withdraw(userId, extraCharge, `[HOLD OVERAGE] Additional charge`, 'llm_hold_overage', holdId);
      logger.info('Hold overage charged', { userId, holdId, heldAmount, actualAmount, extraCharge });
      return;
    }

    const refundAmount = heldAmount - actualAmount;
    if (refundAmount <= 0) return;

    await this.deposit({
      userId,
      amount: refundAmount,
      description: `[HOLD RELEASE] Refund overestimate`,
      referenceType: 'llm_hold_release',
      referenceId: holdId,
    });

    logger.debug('Hold released', { userId, holdId, heldAmount, actualAmount, refunded: refundAmount });
  }

  /**
   * Get transaction history for a user.
   */
  async getTransactions(userId: string, limit = 50, offset = 0): Promise<WalletTransaction[]> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      'SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    );
    return result.rows.map((r) => rowToTransaction(r as Record<string, unknown>));
  }

  /**
   * Record LLM usage (for billing history/analytics).
   */
  async recordLlmUsage(entry: Omit<LlmUsageEntry, 'id' | 'createdAt'>): Promise<void> {
    if (!dbClient.isConnected()) return;

    await dbClient.query(
      `INSERT INTO llm_usage_log (id, user_id, wallet_id, request_id, model, provider, input_tokens, output_tokens, total_tokens, cost_credits, billed_credits, margin_credits, agent_name, endpoint, duration_ms, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        uuidv4(), entry.userId, entry.walletId, entry.requestId, entry.model, entry.provider,
        entry.inputTokens, entry.outputTokens, entry.totalTokens,
        entry.costCredits, entry.billedCredits, entry.marginCredits,
        entry.agentName, entry.endpoint, entry.durationMs,
        JSON.stringify(entry.metadata),
      ],
    );
  }

  /**
   * Get usage summary for a user in a date range.
   */
  async getUsageSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostCredits: number;
    totalBilledCredits: number;
    totalMarginCredits: number;
    byModel: Record<string, { requests: number; tokens: number; billed: number }>;
  }> {
    if (!dbClient.isConnected()) {
      return { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCostCredits: 0, totalBilledCredits: 0, totalMarginCredits: 0, byModel: {} };
    }

    let query = `SELECT
      COUNT(*)::int as total_requests,
      COALESCE(SUM(input_tokens), 0)::int as total_input,
      COALESCE(SUM(output_tokens), 0)::int as total_output,
      COALESCE(SUM(cost_credits), 0)::bigint as total_cost,
      COALESCE(SUM(billed_credits), 0)::bigint as total_billed,
      COALESCE(SUM(margin_credits), 0)::bigint as total_margin
      FROM llm_usage_log WHERE user_id = $1`;
    const params: unknown[] = [userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    const result = await dbClient.query(query, params);
    const row = result.rows[0] as Record<string, unknown>;

    // By model breakdown (same date filters as totals query)
    let modelQuery = `SELECT model, COUNT(*)::int as requests, COALESCE(SUM(total_tokens), 0)::int as tokens, COALESCE(SUM(billed_credits), 0)::bigint as billed
       FROM llm_usage_log WHERE user_id = $1`;
    const modelParams: unknown[] = [userId];
    if (startDate) {
      modelParams.push(startDate);
      modelQuery += ` AND created_at >= $${modelParams.length}`;
    }
    if (endDate) {
      modelParams.push(endDate);
      modelQuery += ` AND created_at <= $${modelParams.length}`;
    }
    modelQuery += ' GROUP BY model';
    const modelResult = await dbClient.query(modelQuery, modelParams);
    const byModel: Record<string, { requests: number; tokens: number; billed: number }> = {};
    for (const r of modelResult.rows) {
      const mr = r as Record<string, unknown>;
      byModel[mr['model'] as string] = {
        requests: Number(mr['requests']),
        tokens: Number(mr['tokens']),
        billed: Number(mr['billed']),
      };
    }

    return {
      totalRequests: Number(row['total_requests']),
      totalInputTokens: Number(row['total_input']),
      totalOutputTokens: Number(row['total_output']),
      totalCostCredits: Number(row['total_cost']),
      totalBilledCredits: Number(row['total_billed']),
      totalMarginCredits: Number(row['total_margin']),
      byModel,
    };
  }

  /**
   * Update auto-topup settings for a user's wallet.
   */
  async updateAutoTopupSettings(
    userId: string,
    settings: { autoTopupEnabled: boolean; autoTopupThreshold?: number; autoTopupAmount?: number },
  ): Promise<Wallet | null> {
    if (!dbClient.isConnected()) return null;

    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet) return null;

    const result = await dbClient.query(
      `UPDATE wallets SET auto_topup_enabled = $1, auto_topup_threshold = $2, auto_topup_amount = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [
        settings.autoTopupEnabled,
        settings.autoTopupThreshold ?? wallet.autoTopupThreshold,
        settings.autoTopupAmount ?? wallet.autoTopupAmount,
        wallet.id,
      ],
    );
    return result.rows[0] ? rowToWallet(result.rows[0] as Record<string, unknown>) : null;
  }

  /**
   * Get auto-topup settings for a user's wallet.
   */
  async getAutoTopupSettings(userId: string): Promise<{
    autoTopupEnabled: boolean;
    autoTopupThreshold: number;
    autoTopupAmount: number;
  } | null> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) return null;
    return {
      autoTopupEnabled: wallet.autoTopupEnabled,
      autoTopupThreshold: wallet.autoTopupThreshold,
      autoTopupAmount: wallet.autoTopupAmount,
    };
  }

  /**
   * Find wallets that need auto-topup (balance below threshold with auto-topup enabled).
   */
  async getWalletsNeedingTopup(): Promise<Array<{ userId: string; balance: number; threshold: number; amount: number }>> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      `SELECT user_id, balance_credits, auto_topup_threshold, auto_topup_amount
       FROM wallets
       WHERE auto_topup_enabled = TRUE
         AND balance_credits < auto_topup_threshold
         AND auto_topup_amount > 0`,
    );

    return result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        userId: row['user_id'] as string,
        balance: Number(row['balance_credits']),
        threshold: Number(row['auto_topup_threshold']),
        amount: Number(row['auto_topup_amount']),
      };
    });
  }

  /**
   * Admin: Get platform-wide revenue stats.
   */
  async getPlatformStats(): Promise<{
    totalRevenue: number;
    totalMargin: number;
    totalRequests: number;
    activeWallets: number;
    totalBalance: number;
  }> {
    if (!dbClient.isConnected()) {
      return { totalRevenue: 0, totalMargin: 0, totalRequests: 0, activeWallets: 0, totalBalance: 0 };
    }

    const usageResult = await dbClient.query(
      `SELECT COUNT(*)::int as total_requests, COALESCE(SUM(billed_credits), 0)::bigint as revenue, COALESCE(SUM(margin_credits), 0)::bigint as margin FROM llm_usage_log`,
    );
    const walletResult = await dbClient.query(
      `SELECT COUNT(*)::int as active_wallets, COALESCE(SUM(balance_credits), 0)::bigint as total_balance FROM wallets WHERE balance_credits > 0`,
    );

    const ur = usageResult.rows[0] as Record<string, unknown>;
    const wr = walletResult.rows[0] as Record<string, unknown>;

    return {
      totalRevenue: Number(ur['revenue']),
      totalMargin: Number(ur['margin']),
      totalRequests: Number(ur['total_requests']),
      activeWallets: Number(wr['active_wallets']),
      totalBalance: Number(wr['total_balance']),
    };
  }
}

export const walletService = new WalletService();
