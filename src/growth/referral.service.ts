import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbClient } from '../infra';
import { walletService } from '../billing/wallet.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REFERRER_REWARD_CREDITS = 25_000_000; // 25 credits in micro-credits
const REFERRED_REWARD_CREDITS = 10_000_000; // 10 credits in micro-credits
const REFERRAL_CODE_LENGTH = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
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
// SQL — table definition (run via migration or seed)
// ---------------------------------------------------------------------------
// CREATE TABLE IF NOT EXISTS referrals (
//   id SERIAL PRIMARY KEY,
//   referrer_id TEXT NOT NULL,
//   referred_id TEXT,
//   code TEXT NOT NULL,
//   status TEXT DEFAULT 'pending',
//   reward_credits INT DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_code ON referrals (code);
// CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
// CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

class InMemoryReferralStore {
  private referrals: Referral[] = [];
  private codeMap = new Map<string, Referral>();
  private idCounter = 0;

  addCode(referrerId: string, code: string): Referral {
    // Check if referrer already has a code
    const existing = this.referrals.find(
      (r) => r.referrerId === referrerId && !r.referredId,
    );
    if (existing) return existing;

    const referral: Referral = {
      id: String(++this.idCounter),
      referrerId,
      referredId: '',
      code,
      status: 'pending',
      rewardCredits: 0,
      createdAt: new Date(),
    };
    this.referrals.push(referral);
    this.codeMap.set(code, referral);
    return referral;
  }

  findByCode(code: string): Referral | undefined {
    return this.codeMap.get(code);
  }

  getByReferrer(referrerId: string): Referral[] {
    return this.referrals.filter((r) => r.referrerId === referrerId);
  }

  applyReferral(code: string, referredId: string): Referral | undefined {
    const referral = this.codeMap.get(code);
    if (!referral) return undefined;

    // Create a new completed referral record
    const completed: Referral = {
      id: String(++this.idCounter),
      referrerId: referral.referrerId,
      referredId,
      code,
      status: 'completed',
      rewardCredits: REFERRER_REWARD_CREDITS,
      createdAt: new Date(),
    };
    this.referrals.push(completed);
    return completed;
  }

  getLeaderboard(limit: number): LeaderboardEntry[] {
    const stats = new Map<string, { totalReferrals: number; totalEarned: number }>();
    for (const r of this.referrals) {
      if (r.status === 'completed' && r.referredId) {
        const entry = stats.get(r.referrerId) ?? { totalReferrals: 0, totalEarned: 0 };
        entry.totalReferrals++;
        entry.totalEarned += r.rewardCredits;
        stats.set(r.referrerId, entry);
      }
    }
    return Array.from(stats.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, limit);
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class ReferralService {
  private fallbackStore = new InMemoryReferralStore();

  private useDb(): boolean {
    return dbClient.isConnected();
  }

  // -----------------------------------------------------------------------
  // Ensure table exists (idempotent)
  // -----------------------------------------------------------------------

  async ensureTable(): Promise<void> {
    if (!this.useDb()) return;

    try {
      await dbClient.query(`
        CREATE TABLE IF NOT EXISTS referrals (
          id SERIAL PRIMARY KEY,
          referrer_id TEXT NOT NULL,
          referred_id TEXT,
          code TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          reward_credits INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await dbClient.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_code ON referrals (code) WHERE referred_id IS NULL`,
      );
      await dbClient.query(
        `CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id)`,
      );
      await dbClient.query(
        `CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id)`,
      );
    } catch (error) {
      logger.warn('ReferralService: failed to ensure table', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // -----------------------------------------------------------------------
  // generateReferralCode
  // -----------------------------------------------------------------------

  /**
   * Generate a unique 8-character alphanumeric referral code for a user.
   * If the user already has a code, returns the existing one.
   */
  async generateReferralCode(userId: string): Promise<string> {
    if (this.useDb()) {
      try {
        // Check if user already has a referral code (a referral row with no referred_id)
        const existing = await dbClient.query(
          `SELECT code FROM referrals WHERE referrer_id = $1 AND referred_id IS NULL LIMIT 1`,
          [userId],
        );
        if (existing.rows[0]) {
          return (existing.rows[0] as Record<string, unknown>)['code'] as string;
        }

        // Generate a unique code
        const code = this.createAlphanumericCode();

        await dbClient.query(
          `INSERT INTO referrals (referrer_id, code, status) VALUES ($1, $2, 'pending')`,
          [userId, code],
        );

        logger.info('Referral code generated', { userId, code });
        return code;
      } catch (error) {
        logger.warn('ReferralService: generateReferralCode DB error, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    const existingMem = this.fallbackStore.getByReferrer(userId).find((r) => !r.referredId);
    if (existingMem) return existingMem.code;

    const code = this.createAlphanumericCode();
    this.fallbackStore.addCode(userId, code);
    logger.info('Referral code generated (in-memory)', { userId, code });
    return code;
  }

  // -----------------------------------------------------------------------
  // validateReferralCode
  // -----------------------------------------------------------------------

  /**
   * Validate a referral code and return the referrer's user ID if valid.
   */
  async validateReferralCode(
    code: string,
  ): Promise<{ valid: boolean; referrerId?: string }> {
    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT referrer_id FROM referrals WHERE code = $1 AND referred_id IS NULL AND status = 'pending' LIMIT 1`,
          [code.toUpperCase()],
        );
        if (result.rows[0]) {
          return {
            valid: true,
            referrerId: (result.rows[0] as Record<string, unknown>)['referrer_id'] as string,
          };
        }
        return { valid: false };
      } catch (error) {
        logger.warn('ReferralService: validateReferralCode DB error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    const referral = this.fallbackStore.findByCode(code.toUpperCase());
    if (referral && !referral.referredId) {
      return { valid: true, referrerId: referral.referrerId };
    }
    return { valid: false };
  }

  // -----------------------------------------------------------------------
  // applyReferral
  // -----------------------------------------------------------------------

  /**
   * Apply a referral: credit both the referrer (25 credits) and the referred user (10 credits).
   */
  async applyReferral(referrerId: string, referredUserId: string): Promise<boolean> {
    if (referrerId === referredUserId) {
      logger.warn('ReferralService: user tried to refer themselves', { referrerId });
      return false;
    }

    if (this.useDb()) {
      try {
        // Mark the referral as completed by inserting a completed record
        await dbClient.query(
          `INSERT INTO referrals (referrer_id, referred_id, code, status, reward_credits)
           VALUES ($1, $2, $3, 'completed', $4)`,
          [
            referrerId,
            referredUserId,
            `REF-${referredUserId.substring(0, 8)}`,
            REFERRER_REWARD_CREDITS,
          ],
        );

        // Credit the referrer
        await walletService.deposit({
          userId: referrerId,
          amount: REFERRER_REWARD_CREDITS,
          description: `Bonus parrainage — nouvel utilisateur ${referredUserId.substring(0, 8)}`,
          referenceType: 'referral_reward',
          referenceId: referredUserId,
        });

        // Credit the referred user
        await walletService.deposit({
          userId: referredUserId,
          amount: REFERRED_REWARD_CREDITS,
          description: `Bonus de bienvenue — parraine par ${referrerId.substring(0, 8)}`,
          referenceType: 'referral_bonus',
          referenceId: referrerId,
        });

        logger.info('Referral applied successfully', {
          referrerId,
          referredUserId,
          referrerReward: REFERRER_REWARD_CREDITS,
          referredReward: REFERRED_REWARD_CREDITS,
        });

        return true;
      } catch (error) {
        logger.error('ReferralService: applyReferral failed', {
          error: error instanceof Error ? error.message : String(error),
          referrerId,
          referredUserId,
        });
        return false;
      }
    }

    // Fallback: in-memory (no wallet operations possible without DB)
    const referrerReferrals = this.fallbackStore.getByReferrer(referrerId);
    const codeRecord = referrerReferrals.find((r) => !r.referredId);
    if (codeRecord) {
      this.fallbackStore.applyReferral(codeRecord.code, referredUserId);
    }
    logger.info('Referral applied (in-memory, no wallet credit)', { referrerId, referredUserId });
    return true;
  }

  // -----------------------------------------------------------------------
  // getReferralStats
  // -----------------------------------------------------------------------

  /**
   * Get referral statistics for a user.
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    // First, ensure the user has a referral code
    const referralCode = await this.generateReferralCode(userId);

    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT
             COUNT(*) FILTER (WHERE referred_id IS NOT NULL)::int AS total_referrals,
             COUNT(*) FILTER (WHERE status = 'pending' AND referred_id IS NOT NULL)::int AS pending_rewards,
             COALESCE(SUM(reward_credits) FILTER (WHERE status = 'completed'), 0)::bigint AS total_earned
           FROM referrals
           WHERE referrer_id = $1`,
          [userId],
        );

        const row = result.rows[0] as Record<string, unknown>;
        return {
          totalReferrals: Number(row['total_referrals']),
          pendingRewards: Number(row['pending_rewards']),
          totalEarned: Number(row['total_earned']),
          referralCode,
        };
      } catch (error) {
        logger.warn('ReferralService: getReferralStats DB error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    const referrals = this.fallbackStore.getByReferrer(userId);
    const completed = referrals.filter((r) => r.status === 'completed' && r.referredId);
    return {
      totalReferrals: completed.length,
      pendingRewards: 0,
      totalEarned: completed.reduce((sum, r) => sum + r.rewardCredits, 0),
      referralCode,
    };
  }

  // -----------------------------------------------------------------------
  // getReferralLeaderboard
  // -----------------------------------------------------------------------

  /**
   * Get the top referrers by number of completed referrals.
   */
  async getReferralLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT
             referrer_id,
             COUNT(*)::int AS total_referrals,
             COALESCE(SUM(reward_credits), 0)::bigint AS total_earned
           FROM referrals
           WHERE status = 'completed' AND referred_id IS NOT NULL
           GROUP BY referrer_id
           ORDER BY total_referrals DESC
           LIMIT $1`,
          [limit],
        );

        return result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            userId: r['referrer_id'] as string,
            totalReferrals: Number(r['total_referrals']),
            totalEarned: Number(r['total_earned']),
          };
        });
      } catch (error) {
        logger.warn('ReferralService: getReferralLeaderboard DB error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getLeaderboard(limit);
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /**
   * Create an 8-character alphanumeric code (uppercase).
   */
  private createAlphanumericCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous I/O/0/1
    const bytes = crypto.randomBytes(REFERRAL_CODE_LENGTH);
    let code = '';
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }
}

export const referralService = new ReferralService();
