/**
 * ReferralService — Parrainage system for Freenzy.io
 * All DB access via spawn('psql') following project conventions.
 */
import { spawn } from 'child_process';

interface ReferralStats {
  totalReferrals: number;
  creditsEarned: number;
  activeReferrals: number;
  pendingReferrals: number;
}

interface LeaderboardEntry {
  anonymizedName: string;
  referralCount: number;
  creditsEarned: number;
}

function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env['DB_PASSWORD'] || '' },
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0 && err.trim()) {
        reject(new Error(`psql error: ${err.trim()}`));
      } else {
        resolve(out.trim());
      }
    });
  });
}

function generateAlphanumericCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  const bytes = new Uint8Array(length);
  // Use Math.random as fallback (crypto not always available in all Node contexts)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * chars.length);
  }
  for (let i = 0; i < length; i++) {
    const idx = bytes[i];
    if (idx !== undefined) {
      code += chars[idx % chars.length];
    }
  }
  return code;
}

function anonymizeName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'Utilisateur';
  const first = parts[0];
  const anonymizedFirst = first.length > 2
    ? `${first[0]}***${first[first.length - 1]}`
    : `${first[0]}***`;
  if (parts.length > 1) {
    const last = parts[parts.length - 1] || '';
    return `${anonymizedFirst} ${last[0] || ''}.`;
  }
  return anonymizedFirst;
}

function escapeSQL(val: string): string {
  return val.replace(/'/g, "''");
}

export class ReferralService {
  /**
   * Generate a unique 6-char referral code for a user.
   * If the user already has a code, returns the existing one.
   */
  static async generateCode(userId: string): Promise<string> {
    // Check if user already has a referral code (as referrer with no referred yet = their "master" code)
    const existing = await dbQuery(
      `SELECT referral_code FROM referrals WHERE referrer_id = '${escapeSQL(userId)}' AND referred_id IS NULL AND referred_email IS NULL LIMIT 1`
    );
    if (existing) {
      return existing;
    }

    // Generate unique code with retry
    let code = '';
    let attempts = 0;
    while (attempts < 10) {
      code = generateAlphanumericCode(6);
      const conflict = await dbQuery(
        `SELECT 1 FROM referrals WHERE referral_code = '${escapeSQL(code)}' LIMIT 1`
      );
      if (!conflict) break;
      attempts++;
    }

    if (!code) {
      throw new Error('Failed to generate unique referral code after 10 attempts');
    }

    await dbQuery(
      `INSERT INTO referrals (referrer_id, referral_code, status) VALUES ('${escapeSQL(userId)}', '${escapeSQL(code)}', 'pending')`
    );

    return code;
  }

  /**
   * Get the referral link for a user (generates code if needed).
   */
  static async getReferralLink(userId: string): Promise<string> {
    const code = await ReferralService.generateCode(userId);
    return `https://freenzy.io/r/${code}`;
  }

  /**
   * Track a registration from a referral code.
   * Links the new user to the referrer.
   */
  static async trackRegistration(code: string, newUserId: string): Promise<boolean> {
    // Find the referral entry for this code
    const row = await dbQuery(
      `SELECT id, referrer_id, status FROM referrals WHERE referral_code = '${escapeSQL(code)}' AND status = 'pending' LIMIT 1`
    );
    if (!row) return false;

    const [id, referrerId] = row.split('|');
    if (!id || !referrerId) return false;

    // Prevent self-referral
    if (referrerId === newUserId) return false;

    await dbQuery(
      `UPDATE referrals SET referred_id = '${escapeSQL(newUserId)}', status = 'registered' WHERE id = '${escapeSQL(id)}'`
    );

    return true;
  }

  /**
   * Activate a referral when the referred user performs their first action.
   * Credits both referrer and referred, notifies referrer via Telegram.
   */
  static async activateReferral(referredId: string): Promise<boolean> {
    // Find the registered referral for this user
    const row = await dbQuery(
      `SELECT id, referrer_id, reward_referrer, reward_referred FROM referrals WHERE referred_id = '${escapeSQL(referredId)}' AND status = 'registered' LIMIT 1`
    );
    if (!row) return false;

    const parts = row.split('|');
    if (parts.length < 4) return false;
    const rowId = parts[0] || '';
    const referrerId = parts[1] || '';
    const rewardReferrer = parseInt(parts[2] || '20', 10) || 20;
    const rewardReferred = parseInt(parts[3] || '20', 10) || 20;

    if (!rowId || !referrerId) return false;

    // Credit both users and update referral status in a single transaction
    await dbQuery(`
      BEGIN;
      UPDATE users SET credits = credits + ${rewardReferrer} WHERE id = '${escapeSQL(referrerId)}';
      UPDATE users SET credits = credits + ${rewardReferred} WHERE id = '${escapeSQL(referredId)}';
      UPDATE referrals SET status = 'rewarded', activated_at = NOW() WHERE id = '${escapeSQL(rowId)}';
      COMMIT;
    `);

    // Notify referrer via Telegram (best-effort, non-blocking)
    ReferralService.notifyReferrerTelegram(referrerId, rewardReferrer).catch(() => {
      // Notification failure should not break the flow
    });

    return true;
  }

  /**
   * Get referral statistics for a user.
   */
  static async getStats(userId: string): Promise<ReferralStats> {
    const totalResult = await dbQuery(
      `SELECT COUNT(*) FROM referrals WHERE referrer_id = '${escapeSQL(userId)}' AND referred_id IS NOT NULL`
    );
    const totalReferrals = parseInt(totalResult, 10) || 0;

    const creditsResult = await dbQuery(
      `SELECT COALESCE(SUM(reward_referrer), 0) FROM referrals WHERE referrer_id = '${escapeSQL(userId)}' AND status = 'rewarded'`
    );
    const creditsEarned = parseInt(creditsResult, 10) || 0;

    const activeResult = await dbQuery(
      `SELECT COUNT(*) FROM referrals WHERE referrer_id = '${escapeSQL(userId)}' AND status = 'rewarded'`
    );
    const activeReferrals = parseInt(activeResult, 10) || 0;

    const pendingResult = await dbQuery(
      `SELECT COUNT(*) FROM referrals WHERE referrer_id = '${escapeSQL(userId)}' AND status IN ('pending', 'registered')`
    );
    const pendingReferrals = parseInt(pendingResult, 10) || 0;

    return { totalReferrals, creditsEarned, activeReferrals, pendingReferrals };
  }

  /**
   * Get top 10 referrers with anonymized names.
   */
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await dbQuery(`
      SELECT u.display_name as name, COUNT(r.id) AS cnt, COALESCE(SUM(r.reward_referrer), 0) AS earned
      FROM referrals r
      JOIN users u ON u.id = r.referrer_id
      WHERE r.status = 'rewarded'
      GROUP BY u.id, u.display_name
      ORDER BY cnt DESC
      LIMIT 10
    `);

    if (!result) return [];

    const entries: LeaderboardEntry[] = [];
    const lines = result.split('\n');
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 3) {
        entries.push({
          anonymizedName: anonymizeName(parts[0] || 'Utilisateur'),
          referralCount: parseInt(parts[1] || '0', 10) || 0,
          creditsEarned: parseInt(parts[2] || '0', 10) || 0,
        });
      }
    }
    return entries;
  }

  /**
   * Get referrer info by code (public, for referral landing page).
   */
  static async getReferrerInfoByCode(code: string): Promise<{ anonymizedName: string; rewardAmount: number } | null> {
    const result = await dbQuery(
      `SELECT u.display_name as name, r.reward_referred FROM referrals r JOIN users u ON u.id = r.referrer_id WHERE r.referral_code = '${escapeSQL(code)}' LIMIT 1`
    );
    if (!result) return null;

    const parts = result.split('|');
    if (parts.length < 2) return null;

    return {
      anonymizedName: anonymizeName(parts[0] || 'Utilisateur'),
      rewardAmount: parseInt(parts[1] || '20', 10) || 20,
    };
  }

  /**
   * Notify referrer via Telegram (best-effort).
   */
  private static async notifyReferrerTelegram(referrerId: string, credits: number): Promise<void> {
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    if (!botToken) return;

    // Get referrer's telegram chat ID from user profile
    const chatId = await dbQuery(
      `SELECT telegram_chat_id FROM users WHERE id = '${escapeSQL(referrerId)}' AND telegram_chat_id IS NOT NULL`
    );
    if (!chatId) return;

    const message = `Parrainage actif ! Vous venez de gagner ${credits} credits grace a votre filleul. Continuez a partager votre lien !`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  }
}
