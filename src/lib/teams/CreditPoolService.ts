/**
 * Teams System — Credit Pool Service
 * Manages shared credit pools, usage tracking, quotas, and alerts
 */
import { spawn } from 'child_process';

// ─── Types ──────────────────────────────────────────────────

export interface CreditPool {
  id: string;
  organization_id: string;
  total_credits: number;
  used_credits: number;
  monthly_limit: number;
  reset_day: number;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageEntry {
  id: string;
  organization_id: string;
  user_id: string;
  agent_id: string;
  credits_used: number;
  source: 'personal' | 'shared';
  created_at: string;
}

export interface MemberUsageSummary {
  user_id: string;
  email: string;
  name: string;
  total_used: number;
  request_count: number;
}

export interface AgentUsageSummary {
  agent_id: string;
  total_used: number;
  request_count: number;
  unique_users: number;
}

export interface QuotaCheck {
  allowed: boolean;
  remaining_credits: number;
  monthly_remaining: number;
  reason?: string;
}

export interface LowBalanceAlert {
  organization_id: string;
  org_name: string;
  total_credits: number;
  used_credits: number;
  percentage_used: number;
  owner_id: string;
}

export interface CreditResult {
  success: boolean;
  error?: string;
  pool?: CreditPool;
  usage?: CreditUsageEntry;
  alerts?: LowBalanceAlert[];
}

// ─── DB Helpers (psql pattern) ──────────────────────────────

function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0 && err) reject(new Error(err.trim()));
      else resolve(out.trim());
    });
  });
}

function dbQueryJSON<T>(sql: string): Promise<T | null> {
  return dbQuery(`SELECT row_to_json(t) FROM (${sql}) t`)
    .then((result) => {
      if (!result || result === '') return null;
      return JSON.parse(result) as T;
    })
    .catch(() => null);
}

function dbQueryJSONArray<T>(sql: string): Promise<T[]> {
  return dbQuery(`SELECT row_to_json(t) FROM (${sql}) t`)
    .then((result) => {
      if (!result || result === '') return [];
      return result.split('\n').filter(Boolean).map((line) => JSON.parse(line) as T);
    })
    .catch(() => []);
}

function esc(val: string): string {
  return val.replace(/'/g, "''");
}

// ─── Service ────────────────────────────────────────────────

export class CreditPoolService {
  /**
   * Allocate credits to an organization's shared pool
   */
  static async allocateCredits(
    orgId: string,
    amount: number,
    source: string
  ): Promise<CreditResult> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Le montant doit etre positif' };
      }

      // Update pool
      await dbQuery(`
        UPDATE credit_pools
        SET total_credits = total_credits + ${amount}
        WHERE organization_id = '${esc(orgId)}'
      `);

      // Also update shared_credits on organization for quick access
      await dbQuery(`
        UPDATE organizations
        SET shared_credits = shared_credits + ${amount}
        WHERE id = '${esc(orgId)}'
      `);

      // Log the allocation
      await dbQuery(`
        INSERT INTO cron_logs (cron_name, status, message, created_at)
        VALUES ('credit_allocation', 'success', 'Org ${esc(orgId)}: +${amount} credits from ${esc(source)}', NOW())
      `);

      const pool = await this.getPool(orgId);

      return { success: true, pool: pool || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Use credits from shared pool. Falls back to personal credits if shared pool insufficient
   * and personal fallback is allowed in org settings.
   */
  static async useCredits(
    orgId: string,
    userId: string,
    agentId: string,
    amount: number
  ): Promise<CreditResult> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Le montant doit etre positif' };
      }

      // Check quota first
      const quota = await this.checkQuota(orgId, userId);
      if (!quota.allowed) {
        return { success: false, error: quota.reason || 'Quota depasse' };
      }

      // Try shared pool first
      const pool = await this.getPool(orgId);
      if (!pool) {
        return { success: false, error: 'Pool de credits introuvable' };
      }

      const availableShared = pool.total_credits - pool.used_credits;

      if (availableShared >= amount) {
        // Use shared credits
        await dbQuery(`
          UPDATE credit_pools
          SET used_credits = used_credits + ${amount}
          WHERE organization_id = '${esc(orgId)}'
        `);

        await dbQuery(`
          INSERT INTO credit_usage_log (organization_id, user_id, agent_id, credits_used, source)
          VALUES ('${esc(orgId)}', '${esc(userId)}', '${esc(agentId)}', ${amount}, 'shared')
        `);

        return { success: true };
      }

      // Check if personal fallback is allowed
      const orgSettings = await dbQuery(
        `SELECT settings->>'allow_personal_fallback' FROM organizations WHERE id = '${esc(orgId)}'`
      );
      const allowFallback = orgSettings === 'true';

      if (!allowFallback) {
        return { success: false, error: 'Credits partages insuffisants et fallback personnel desactive' };
      }

      // Use remaining shared + personal
      const sharedPortion = availableShared;
      const personalPortion = amount - sharedPortion;

      // Check personal credits
      const personalCredits = await dbQuery(
        `SELECT credits FROM users WHERE id = '${esc(userId)}'`
      );
      const personalAvailable = parseInt(personalCredits, 10) || 0;

      if (personalAvailable < personalPortion) {
        return { success: false, error: 'Credits insuffisants (partages + personnels)' };
      }

      // Deduct shared portion
      if (sharedPortion > 0) {
        await dbQuery(`
          UPDATE credit_pools
          SET used_credits = used_credits + ${sharedPortion}
          WHERE organization_id = '${esc(orgId)}'
        `);

        await dbQuery(`
          INSERT INTO credit_usage_log (organization_id, user_id, agent_id, credits_used, source)
          VALUES ('${esc(orgId)}', '${esc(userId)}', '${esc(agentId)}', ${sharedPortion}, 'shared')
        `);
      }

      // Deduct personal portion
      await dbQuery(`
        UPDATE users SET credits = credits - ${personalPortion} WHERE id = '${esc(userId)}'
      `);

      await dbQuery(`
        INSERT INTO credit_usage_log (organization_id, user_id, agent_id, credits_used, source)
        VALUES ('${esc(orgId)}', '${esc(userId)}', '${esc(agentId)}', ${personalPortion}, 'personal')
      `);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Get usage breakdown by member for a given period
   */
  static async getUsageByMember(
    orgId: string,
    period: 'day' | 'week' | 'month' | 'all'
  ): Promise<MemberUsageSummary[]> {
    const interval = this.periodToInterval(period);
    const whereClause = interval
      ? `AND cul.created_at >= NOW() - INTERVAL '${interval}'`
      : '';

    return dbQueryJSONArray<MemberUsageSummary>(`
      SELECT
        cul.user_id,
        u.email,
        u.name,
        SUM(cul.credits_used)::bigint AS total_used,
        COUNT(*)::int AS request_count
      FROM credit_usage_log cul
      JOIN users u ON u.id = cul.user_id
      WHERE cul.organization_id = '${esc(orgId)}'
      ${whereClause}
      GROUP BY cul.user_id, u.email, u.name
      ORDER BY total_used DESC
    `);
  }

  /**
   * Get usage breakdown by agent for a given period
   */
  static async getUsageByAgent(
    orgId: string,
    period: 'day' | 'week' | 'month' | 'all'
  ): Promise<AgentUsageSummary[]> {
    const interval = this.periodToInterval(period);
    const whereClause = interval
      ? `AND created_at >= NOW() - INTERVAL '${interval}'`
      : '';

    return dbQueryJSONArray<AgentUsageSummary>(`
      SELECT
        agent_id,
        SUM(credits_used)::bigint AS total_used,
        COUNT(*)::int AS request_count,
        COUNT(DISTINCT user_id)::int AS unique_users
      FROM credit_usage_log
      WHERE organization_id = '${esc(orgId)}'
      ${whereClause}
      GROUP BY agent_id
      ORDER BY total_used DESC
    `);
  }

  /**
   * Check if a user can use credits (quota + pool balance)
   */
  static async checkQuota(orgId: string, userId: string): Promise<QuotaCheck> {
    try {
      const pool = await this.getPool(orgId);
      if (!pool) {
        return { allowed: false, remaining_credits: 0, monthly_remaining: 0, reason: 'Pool introuvable' };
      }

      const remainingCredits = pool.total_credits - pool.used_credits;

      // Check monthly limit (0 = unlimited)
      let monthlyRemaining = Number.MAX_SAFE_INTEGER;
      if (pool.monthly_limit > 0) {
        const monthlyUsed = await dbQuery(`
          SELECT COALESCE(SUM(credits_used), 0) FROM credit_usage_log
          WHERE organization_id = '${esc(orgId)}'
          AND created_at >= date_trunc('month', NOW())
        `);
        const used = parseInt(monthlyUsed, 10) || 0;
        monthlyRemaining = pool.monthly_limit - used;

        if (monthlyRemaining <= 0) {
          return {
            allowed: false,
            remaining_credits: remainingCredits,
            monthly_remaining: 0,
            reason: 'Limite mensuelle atteinte',
          };
        }
      }

      // Check per-member quota from org settings
      const memberQuota = await dbQuery(
        `SELECT settings->>'member_monthly_quota' FROM organizations WHERE id = '${esc(orgId)}'`
      );
      if (memberQuota && memberQuota !== '' && memberQuota !== 'null') {
        const quota = parseInt(memberQuota, 10);
        if (quota > 0) {
          const memberUsed = await dbQuery(`
            SELECT COALESCE(SUM(credits_used), 0) FROM credit_usage_log
            WHERE organization_id = '${esc(orgId)}'
            AND user_id = '${esc(userId)}'
            AND created_at >= date_trunc('month', NOW())
          `);
          const used = parseInt(memberUsed, 10) || 0;
          if (used >= quota) {
            return {
              allowed: false,
              remaining_credits: remainingCredits,
              monthly_remaining: monthlyRemaining,
              reason: `Quota personnel mensuel atteint (${quota} credits)`,
            };
          }
        }
      }

      if (remainingCredits <= 0) {
        // Check personal fallback
        const orgSettings = await dbQuery(
          `SELECT settings->>'allow_personal_fallback' FROM organizations WHERE id = '${esc(orgId)}'`
        );
        if (orgSettings !== 'true') {
          return {
            allowed: false,
            remaining_credits: 0,
            monthly_remaining: monthlyRemaining,
            reason: 'Pool de credits epuise',
          };
        }
      }

      return {
        allowed: true,
        remaining_credits: Math.max(0, remainingCredits),
        monthly_remaining: monthlyRemaining === Number.MAX_SAFE_INTEGER ? -1 : monthlyRemaining,
      };
    } catch {
      return { allowed: false, remaining_credits: 0, monthly_remaining: 0, reason: 'Erreur de verification du quota' };
    }
  }

  /**
   * Check for organizations with low credit balance (< 10%)
   * Designed to be called by a cron job
   */
  static async checkLowBalanceAlerts(): Promise<LowBalanceAlert[]> {
    try {
      return dbQueryJSONArray<LowBalanceAlert>(`
        SELECT
          cp.organization_id,
          o.name AS org_name,
          cp.total_credits,
          cp.used_credits,
          CASE
            WHEN cp.total_credits = 0 THEN 100
            ELSE ROUND((cp.used_credits::numeric / cp.total_credits::numeric) * 100, 1)
          END AS percentage_used,
          o.owner_id
        FROM credit_pools cp
        JOIN organizations o ON o.id = cp.organization_id
        WHERE cp.total_credits > 0
        AND (cp.total_credits - cp.used_credits)::numeric / cp.total_credits::numeric < 0.10
      `);
    } catch {
      return [];
    }
  }

  /**
   * Sync usage summaries and reset monthly counters if needed
   * Designed to be called by a cron job
   */
  static async syncUsageSummaries(): Promise<number> {
    try {
      // Reset pools that have passed their reset day this month
      const today = new Date();
      const currentDay = today.getDate();

      const resetResult = await dbQuery(`
        UPDATE credit_pools
        SET used_credits = 0, updated_at = NOW()
        WHERE reset_day = ${currentDay}
        AND monthly_limit > 0
        AND updated_at < date_trunc('day', NOW())
        RETURNING id
      `);

      const resetCount = resetResult && resetResult !== ''
        ? resetResult.split('\n').filter(Boolean).length
        : 0;

      if (resetCount > 0) {
        await dbQuery(`
          INSERT INTO cron_logs (cron_name, status, message, created_at)
          VALUES ('credit_pool_sync', 'success', '${resetCount} pools reset for day ${currentDay}', NOW())
        `);
      }

      // Update organization shared_credits from pool
      await dbQuery(`
        UPDATE organizations o
        SET shared_credits = cp.total_credits - cp.used_credits
        FROM credit_pools cp
        WHERE cp.organization_id = o.id
      `);

      return resetCount;
    } catch {
      return 0;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  static async getPool(orgId: string): Promise<CreditPool | null> {
    return dbQueryJSON<CreditPool>(
      `SELECT * FROM credit_pools WHERE organization_id = '${esc(orgId)}'`
    );
  }

  private static periodToInterval(period: 'day' | 'week' | 'month' | 'all'): string | null {
    switch (period) {
      case 'day': return '1 day';
      case 'week': return '7 days';
      case 'month': return '30 days';
      case 'all': return null;
    }
  }
}
