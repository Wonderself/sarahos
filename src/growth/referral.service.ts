import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import { walletService } from '../billing/wallet.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Credits awarded to the referrer when a referral is completed. */
const REFERRER_REWARD_CREDITS = 25;

/** Credits awarded to the referred user when they sign up via a referral. */
const REFERRED_REWARD_CREDITS = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string | null;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  rewardCredits: number;
  createdAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  referralCode: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalReferrals: number;
  totalEarned: number;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

class InMemoryReferralStore {
  private referrals: Referral[] = [];
  private codeMap = new Map<string, Referral>();
  private userCodeMap = new Map<string, string>();

  add(referral: Referral): void {
    this.referrals.push(referral);
    this.codeMap.set(referral.code, referral);
    if (!this.userCodeMap.has(referral.referrerId)) {
      this.userCodeMap.set(referral.referrerId, referral.code);
    }
  }

  getByCode(code: string): Referral | undefined {
    return this.codeMap.get(code);
  }

  getCodeForUser(userId: string): string | undefined {
    return this.userCodeMap.get(userId);
  }

  getByReferrer(referrerId: string): Referral[] {
    return this.referrals.filter((r) => r.referrerId === referrerId);
  }

  update(code: string, updates: Partial<Referral>): void {
    const referral = this.codeMap.get(code);
    if (referral) {
      Object.assign(referral, updates);
    }
  }

  getAll(): Referral[] {
    return [...this.referrals];
  }
}

// ---------------------------------------------------------------------------
// SQL table definition (for reference / migrations)
// ---------------------------------------------------------------------------

/*
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL,
  referrer_id TEXT NOT NULL,
  referred_id TEXT,
  code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  reward_credits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals (code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);
*/

// ---------------------------------------------------------------------------
// Referral Service
// ---------------------------------------------------------------------------

export class ReferralService {
  private fallbackStore = new InMemoryReferralStore();

  private useDb(): boolean {
    return dbClient.isConnected();
  }

  // -------------------------------------------------------------------------
  // Generate a unique referral code for a user
  // -------------------------------------------------------------------------

  /**
   * Generate a unique 8-character alphanumeric referral code for a user.
   * If the user already has a code, return the existing one.
   */
  async generateReferralCode(userId: string): Promise<string> {
    // Check if user already has a code
    if (this.useDb()) {
      try {
        const existing = await dbClient.query(
          `SELECT code FROM referrals WHERE referrer_id = $1 AND referred_id IS NULL LIMIT 1`,
          [userId],
        );
        if (existing.rows[0]) {
          return (existing.rows[0] as Record<string, unknown>)['code'] as string;
        }

        // Generate a unique code
        const code = this.createCode();
        const id = uuidv4();

        await dbClient.query(
          `INSERT INTO referrals (id, referrer_id, code, status, reward_credits)
           VALUES ($1, $2, $3, 'pending', 0)`,
          [id, userId, code],
        );

        logger.info('Referral code generated', { userId, code });
        return code;
      } catch (error) {
        logger.warn('Failed to generate referral code in DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback: in-memory
    const existingCode = this.fallbackStore.getCodeForUser(userId);
    if (existingCode) return existingCode;

    const code = this.createCode();
    this.fallbackStore.add({
      id: uuidv4(),
      referrerId: userId,
      referredId: null,
      code,
      status: 'pending',
      rewardCredits: 0,
      createdAt: new Date(),
    });

    logger.info('Referral code generated (in-memory fallback)', { userId, code });
    return code;
  }

  // -------------------------------------------------------------------------
  // Validate a referral code
  // -------------------------------------------------------------------------

  /**
   * Check if a referral code is valid and return the referrer's userId.
   * Returns null if the code is invalid or already fully used.
   */
  async validateReferralCode(
    code: string,
  ): Promise<{ valid: boolean; referrerId?: string }> {
    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT referrer_id, status FROM referrals WHERE code = $1 LIMIT 1`,
          [code],
        );

        if (!result.rows[0]) {
          return { valid: false };
        }

        const row = result.rows[0] as Record<string, unknown>;
        const referrerId = row['referrer_id'] as string;

        return { valid: true, referrerId };
      } catch (error) {
        logger.warn('Failed to validate referral code in DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    const referral = this.fallbackStore.getByCode(code);
    if (!referral) return { valid: false };
    return { valid: true, referrerId: referral.referrerId };
  }

  // -------------------------------------------------------------------------
  // Apply a referral (reward both users)
  // -------------------------------------------------------------------------

  /**
   * Apply a referral: credit both the referrer and the referred user.
   * - Referrer gets REFERRER_REWARD_CREDITS credits
   * - Referred user gets REFERRED_REWARD_CREDITS credits
   */
  async applyReferral(
    referrerId: string,
    referredUserId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Prevent self-referral
    if (referrerId === referredUserId) {
      return { success: false, error: 'Cannot refer yourself' };
    }

    if (this.useDb()) {
      try {
        // Check if this referred user was already referred
        const existingRef = await dbClient.query(
          `SELECT id FROM referrals WHERE referred_id = $1 AND status = 'completed' LIMIT 1`,
          [referredUserId],
        );
        if (existingRef.rows[0]) {
          return { success: false, error: 'User has already been referred' };
        }

        await dbClient.query('BEGIN');

        try {
          // Record the referral
          const id = uuidv4();
          await dbClient.query(
            `INSERT INTO referrals (id, referrer_id, referred_id, code, status, reward_credits)
             VALUES ($1, $2, $3, $4, 'completed', $5)`,
            [id, referrerId, referredUserId, this.createCode(), REFERRER_REWARD_CREDITS],
          );

          // Credit the referrer
          await walletService.deposit({
            userId: referrerId,
            amount: REFERRER_REWARD_CREDITS * 1_000_000, // Convert to micro-credits
            description: `Bonus parrainage — nouvel utilisateur parraine`,
            referenceType: 'referral_reward',
            referenceId: id,
          });

          // Credit the referred user
          await walletService.deposit({
            userId: referredUserId,
            amount: REFERRED_REWARD_CREDITS * 1_000_000, // Convert to micro-credits
            description: `Bonus de bienvenue — inscription via parrainage`,
            referenceType: 'referral_bonus',
            referenceId: id,
          });

          await dbClient.query('COMMIT');

          logger.info('Referral applied successfully', {
            referrerId,
            referredUserId,
            referrerReward: REFERRER_REWARD_CREDITS,
            referredReward: REFERRED_REWARD_CREDITS,
          });

          return { success: true };
        } catch (error) {
          await dbClient.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error('Failed to apply referral', { referrerId, referredUserId, error: msg });
        return { success: false, error: msg };
      }
    }

    // Fallback: in-memory (no wallet interaction)
    this.fallbackStore.add({
      id: uuidv4(),
      referrerId,
      referredId: referredUserId,
      code: this.createCode(),
      status: 'completed',
      rewardCredits: REFERRER_REWARD_CREDITS,
      createdAt: new Date(),
    });

    logger.info('Referral applied (in-memory fallback)', { referrerId, referredUserId });
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Referral stats for a user
  // -------------------------------------------------------------------------

  async getReferralStats(userId: string): Promise<ReferralStats> {
    if (this.useDb()) {
      try {
        // Get or generate the user's referral code
        const code = await this.generateReferralCode(userId);

        // Aggregate stats
        const statsResult = await dbClient.query(
          `SELECT
             COUNT(*)::int AS total_referrals,
             COALESCE(SUM(CASE WHEN status = 'pending' THEN reward_credits ELSE 0 END), 0)::int AS pending_rewards,
             COALESCE(SUM(CASE WHEN status = 'completed' THEN reward_credits ELSE 0 END), 0)::int AS total_earned
           FROM referrals
           WHERE referrer_id = $1 AND referred_id IS NOT NULL`,
          [userId],
        );

        const row = statsResult.rows[0] as Record<string, unknown>;
        return {
          totalReferrals: Number(row['total_referrals']),
          pendingRewards: Number(row['pending_rewards']),
          totalEarned: Number(row['total_earned']),
          referralCode: code,
        };
      } catch (error) {
        logger.warn('Failed to get referral stats from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    const code = await this.generateReferralCode(userId);
    const referrals = this.fallbackStore.getByReferrer(userId).filter((r) => r.referredId);
    const pending = referrals
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.rewardCredits, 0);
    const earned = referrals
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.rewardCredits, 0);

    return {
      totalReferrals: referrals.length,
      pendingRewards: pending,
      totalEarned: earned,
      referralCode: code,
    };
  }

  // -------------------------------------------------------------------------
  // Leaderboard
  // -------------------------------------------------------------------------

  async getReferralLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT
             referrer_id AS user_id,
             COUNT(*)::int AS total_referrals,
             COALESCE(SUM(reward_credits), 0)::int AS total_earned
           FROM referrals
           WHERE referred_id IS NOT NULL AND status = 'completed'
           GROUP BY referrer_id
           ORDER BY total_referrals DESC
           LIMIT $1`,
          [limit],
        );

        return result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            userId: r['user_id'] as string,
            totalReferrals: Number(r['total_referrals']),
            totalEarned: Number(r['total_earned']),
          };
        });
      } catch (error) {
        logger.warn('Failed to get referral leaderboard from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback: in-memory aggregation
    const all = this.fallbackStore.getAll().filter(
      (r) => r.referredId && r.status === 'completed',
    );

    const byReferrer = new Map<string, { count: number; earned: number }>();
    for (const r of all) {
      const entry = byReferrer.get(r.referrerId) ?? { count: 0, earned: 0 };
      entry.count++;
      entry.earned += r.rewardCredits;
      byReferrer.set(r.referrerId, entry);
    }

    return Array.from(byReferrer.entries())
      .map(([userId, data]) => ({
        userId,
        totalReferrals: data.count,
        totalEarned: data.earned,
      }))
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, limit);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Generate an 8-character alphanumeric code.
   */
  private createCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }
}

export const referralService = new ReferralService();
