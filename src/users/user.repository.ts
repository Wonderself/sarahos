import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { User, CreateUserInput, UpdateUserInput, UserFilters } from './user.types';
import { DEFAULT_DAILY_LIMITS } from './user.types';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row['id'] as string,
    email: row['email'] as string,
    displayName: row['display_name'] as string,
    apiKey: row['api_key'] as string,
    role: row['role'] as User['role'],
    tier: row['tier'] as User['tier'],
    isActive: row['is_active'] as boolean,
    dailyApiCalls: row['daily_api_calls'] as number,
    dailyApiLimit: row['daily_api_limit'] as number,
    demoExpiresAt: row['demo_expires_at'] ? new Date(row['demo_expires_at'] as string) : null,
    promoCodeUsed: (row['promo_code_used'] as string) ?? null,
    emailConfirmed: (row['email_confirmed'] as boolean) ?? false,
    activeAgents: (row['active_agents'] as string[]) ?? ['fz-repondeur'],
    userNumber: (row['user_number'] as number) ?? 0,
    commissionRate: Number(row['commission_rate'] ?? 0),
    tokenBudgetMultiplier: Number(row['token_budget_multiplier'] ?? 1.0),
    referralCode: (row['referral_code'] as string) ?? null,
    referredBy: (row['referred_by'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
    lastLoginAt: row['last_login_at'] ? new Date(row['last_login_at'] as string) : null,
  };
}

export class UserRepository {
  async create(input: CreateUserInput): Promise<User | null> {
    if (!dbClient.isConnected()) {
      logger.warn('UserRepository.create: DB not connected');
      return null;
    }

    const apiKey = input.apiKey ?? uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 32);
    const tier = input.tier ?? 'free';
    const role = input.role ?? 'viewer';
    const dailyApiLimit = DEFAULT_DAILY_LIMITS[tier];
    const activeAgents = input.activeAgents ?? ['fz-repondeur'];
    const referredBy = input.referredBy ?? null;

    // Generate referral code (8 chars: FZ-XXXXXX)
    const referralCode = 'FZ-' + uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();

    // Wrap in transaction to prevent race condition on userNumber/commissionRate
    return dbClient.withTransaction(async (client) => {
      const countResult = await client.query("SELECT COUNT(*)::int as cnt FROM users WHERE role != 'system'");
      const userCount = (countResult.rows[0]?.['cnt'] as number) ?? 0;
      const userNumber = userCount + 1;
      const commissionRate = 0; // 0% pour tous, à vie

      const result = await client.query(
        `INSERT INTO users (email, display_name, api_key, role, tier, daily_api_limit, active_agents, user_number, commission_rate, referral_code, referred_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [input.email, input.displayName, apiKey, role, tier, dailyApiLimit, activeAgents, userNumber, commissionRate, referralCode, referredBy],
      );

      return result.rows[0] ? rowToUser(result.rows[0]) : null;
    });
  }

  async findByApiKey(apiKey: string): Promise<User | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query('SELECT * FROM users WHERE api_key = $1', [apiKey]);
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    if (!dbClient.isConnected()) return [];

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.role) {
      conditions.push(`role = $${idx++}`);
      params.push(filters.role);
    }
    if (filters?.tier) {
      conditions.push(`tier = $${idx++}`);
      params.push(filters.tier);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      params.push(filters.isActive);
    }
    if (filters?.search) {
      const escaped = filters.search.replace(/[%_\\]/g, '\\$&');
      conditions.push(`(email ILIKE $${idx} ESCAPE '\\' OR display_name ILIKE $${idx} ESCAPE '\\')`);
      params.push(`%${escaped}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    params.push(limit, offset);
    const result = await dbClient.query(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`, params);
    return result.rows.map(rowToUser);
  }

  async countAll(filters?: UserFilters): Promise<number> {
    if (!dbClient.isConnected()) return 0;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.role) {
      conditions.push(`role = $${idx++}`);
      params.push(filters.role);
    }
    if (filters?.tier) {
      conditions.push(`tier = $${idx++}`);
      params.push(filters.tier);
    }
    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      params.push(filters.isActive);
    }
    if (filters?.search) {
      const escaped = filters.search.replace(/[%_\\]/g, '\\$&');
      conditions.push(`(email ILIKE $${idx} ESCAPE '\\' OR display_name ILIKE $${idx} ESCAPE '\\')`);
      params.push(`%${escaped}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await dbClient.query(`SELECT COUNT(*)::int as cnt FROM users ${where}`, params);
    return (result.rows[0] as Record<string, unknown>)?.['cnt'] as number ?? 0;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    if (!dbClient.isConnected()) return null;

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.displayName !== undefined) {
      sets.push(`display_name = $${idx++}`);
      params.push(input.displayName);
    }
    if (input.role !== undefined) {
      sets.push(`role = $${idx++}`);
      params.push(input.role);
    }
    if (input.tier !== undefined) {
      sets.push(`tier = $${idx++}`);
      params.push(input.tier);
    }
    if (input.isActive !== undefined) {
      sets.push(`is_active = $${idx++}`);
      params.push(input.isActive);
    }
    if (input.dailyApiLimit !== undefined) {
      sets.push(`daily_api_limit = $${idx++}`);
      params.push(input.dailyApiLimit);
    }
    if (input.demoExpiresAt !== undefined) {
      sets.push(`demo_expires_at = $${idx++}`);
      params.push(input.demoExpiresAt);
    }
    if (input.activeAgents !== undefined) {
      sets.push(`active_agents = $${idx++}`);
      params.push(input.activeAgents);
    }
    if (input.tokenBudgetMultiplier !== undefined) {
      sets.push(`token_budget_multiplier = $${idx++}`);
      params.push(input.tokenBudgetMultiplier);
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    params.push(id);

    const result = await dbClient.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );

    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async deactivate(id: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    const result = await dbClient.query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
      [id],
    );
    const deactivated = (result.rowCount ?? 0) > 0;

    // Invalidate active-status cache so JWT is immediately rejected
    if (deactivated) {
      try {
        const { redisClient } = await import('../infra/redis/redis-client');
        if (redisClient.isConnected()) {
          await redisClient.del(`user:active:${id}`);
        }
      } catch { /* best effort */ }
    }

    return deactivated;
  }

  async regenerateApiKey(id: string): Promise<string | null> {
    if (!dbClient.isConnected()) return null;

    const newKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 32);
    const result = await dbClient.query(
      'UPDATE users SET api_key = $1, updated_at = NOW() WHERE id = $2 RETURNING api_key',
      [newKey, id],
    );

    return result.rows[0] ? (result.rows[0]['api_key'] as string) : null;
  }

  async incrementDailyApiCalls(id: string): Promise<number> {
    if (!dbClient.isConnected()) return 0;

    const result = await dbClient.query(
      'UPDATE users SET daily_api_calls = daily_api_calls + 1 WHERE id = $1 RETURNING daily_api_calls',
      [id],
    );
    return result.rows[0] ? (result.rows[0]['daily_api_calls'] as number) : 0;
  }

  async resetDailyApiCalls(): Promise<number> {
    if (!dbClient.isConnected()) return 0;

    const result = await dbClient.query('UPDATE users SET daily_api_calls = 0');
    return result.rowCount ?? 0;
  }

  async updateLastLogin(id: string): Promise<void> {
    if (!dbClient.isConnected()) return;

    await dbClient.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
  }

  async updateActiveAgents(userId: string, agents: string[]): Promise<User | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query(
      'UPDATE users SET active_agents = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [agents, userId],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findByReferralCode(code: string): Promise<User | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query('SELECT * FROM users WHERE referral_code = $1', [code]);
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async getStats(): Promise<{ byTier: Record<string, number>; active: number; totalDailyCalls: number }> {
    if (!dbClient.isConnected()) return { byTier: {}, active: 0, totalDailyCalls: 0 };

    const tierResult = await dbClient.query(
      'SELECT tier, COUNT(*)::int as count FROM users WHERE is_active = TRUE GROUP BY tier',
    );
    const byTier: Record<string, number> = {};
    for (const row of tierResult.rows) {
      byTier[row['tier'] as string] = row['count'] as number;
    }

    const activeResult = await dbClient.query('SELECT COUNT(*)::int as count FROM users WHERE is_active = TRUE');
    const active = (activeResult.rows[0]?.['count'] as number) ?? 0;

    const callsResult = await dbClient.query('SELECT COALESCE(SUM(daily_api_calls), 0)::int as total FROM users');
    const totalDailyCalls = (callsResult.rows[0]?.['total'] as number) ?? 0;

    return { byTier, active, totalDailyCalls };
  }

  /**
   * GDPR: Permanently delete a user and all associated data.
   * With ON DELETE CASCADE FKs, deleting from users cascades to:
   * wallets, wallet_transactions, llm_usage_log, notifications, campaigns,
   * campaign_posts, referrals, user_sessions, user_preferences, user_documents,
   * user_alarms, projects, personal_agent_configs, repondeur_configs, etc.
   */
  async deleteUser(userId: string): Promise<{ deleted: boolean; tablesAffected: string[] }> {
    if (!dbClient.isConnected()) return { deleted: false, tablesAffected: [] };

    const tablesAffected: string[] = [];

    return dbClient.withTransaction(async (client) => {
      // Tables without FK cascade — delete explicitly
      const manualTables = ['activity_log', 'audit_log'];
      for (const table of manualTables) {
        try {
          const r = await client.query(
            `DELETE FROM ${table} WHERE actor = $1 OR resource_id = $1`,
            [userId],
          );
          if ((r.rowCount ?? 0) > 0) tablesAffected.push(table);
        } catch {
          // Table may not exist — skip
        }
      }

      // Delete the user — cascades to all FK-linked tables
      const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);
      if ((result.rowCount ?? 0) > 0) {
        tablesAffected.push('users (+ cascaded data)');
      }

      return { deleted: (result.rowCount ?? 0) > 0, tablesAffected };
    });
  }

  // ── Password & Email Auth Methods ──

  async getPasswordHash(userId: string): Promise<string | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    return result.rows[0] ? (result.rows[0]['password_hash'] as string) ?? null : null;
  }

  async setPasswordHash(userId: string, hash: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, userId]);
  }

  async setEmailConfirmToken(userId: string, token: string, expires: Date): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      'UPDATE users SET email_confirm_token = $1, email_confirm_expires = $2, updated_at = NOW() WHERE id = $3',
      [token, expires, userId],
    );
  }

  async confirmEmail(token: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query(
      `UPDATE users SET email_confirmed = TRUE, email_confirm_token = NULL, email_confirm_expires = NULL, updated_at = NOW()
       WHERE email_confirm_token = $1 AND email_confirm_expires > NOW()
       RETURNING id`,
      [token],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2, updated_at = NOW() WHERE id = $3',
      [token, expires, userId],
    );
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async updatePassword(userId: string, hash: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW() WHERE id = $2',
      [hash, userId],
    );

    // Invalidate all existing sessions by storing password-change timestamp in Redis
    try {
      const { redisClient } = await import('../infra/redis/redis-client');
      if (redisClient.isConnected()) {
        // Store timestamp (seconds) — JWTs issued before this are invalid
        await redisClient.set(`user:pwd_changed:${userId}`, String(Math.floor(Date.now() / 1000)), 86400);
        await redisClient.del(`user:active:${userId}`);
      }
    } catch { /* best effort — JWT will still expire naturally */ }
  }

  async upsertByEmail(input: CreateUserInput & { tier: User['tier']; role: User['role'] }): Promise<User | null> {
    if (!dbClient.isConnected()) return null;

    const apiKey = input.apiKey ?? uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 32);
    const dailyApiLimit = DEFAULT_DAILY_LIMITS[input.tier];

    // On conflict: only update display_name and reactivate.
    // Deliberately exclude role, tier, api_key, daily_api_limit to prevent role escalation.
    const result = await dbClient.query(
      `INSERT INTO users (email, display_name, api_key, role, tier, daily_api_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         is_active = TRUE,
         updated_at = NOW()
       RETURNING *`,
      [input.email, input.displayName, apiKey, input.role, input.tier, dailyApiLimit],
    );

    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }
}

export const userRepository = new UserRepository();
