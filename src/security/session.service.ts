/**
 * SARAH OS — Session Management Service
 * Manages user sessions with database-backed storage, expiry, and multi-device support.
 */

import crypto from 'crypto';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';

// ── Types ──

export interface Session {
  id: string;
  userId: string;
  token: string;
  device: string;
  ip: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

// ── Constants ──

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSIONS_TABLE = 'sessions';

// ── Sessions Table DDL ──
// CREATE TABLE sessions (
//   id TEXT PRIMARY KEY,
//   user_id TEXT NOT NULL,
//   token TEXT NOT NULL,
//   device TEXT NOT NULL,
//   ip TEXT NOT NULL,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   expires_at TIMESTAMPTZ NOT NULL
// );

// ── Helper ──

function mapRowToSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    token: row.token as string,
    device: row.device as string,
    ip: row.ip as string,
    createdAt: new Date(row.created_at as string),
    lastActiveAt: new Date(row.last_active_at as string),
    expiresAt: new Date(row.expires_at as string),
  };
}

// ── Session Service ──

export class SessionService {
  /**
   * Create a new session for a user.
   *
   * @param userId - The user's ID
   * @param device - Device description (e.g. "Chrome on macOS")
   * @param ip - Client IP address
   * @returns The newly created Session
   */
  async createSession(userId: string, device: string, ip: string): Promise<Session> {
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(48).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    await dbClient.query(
      `INSERT INTO ${SESSIONS_TABLE} (id, user_id, token, device, ip, created_at, last_active_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, userId, token, device, ip, now.toISOString(), now.toISOString(), expiresAt.toISOString()],
    );

    logger.info('Session created', { sessionId: id, userId, device });

    return {
      id,
      userId,
      token,
      device,
      ip,
      createdAt: now,
      lastActiveAt: now,
      expiresAt,
    };
  }

  /**
   * Validate that a session exists and has not expired.
   *
   * @param sessionId - The session ID to validate
   * @returns The Session if valid, or null if expired/not found
   */
  async validateSession(sessionId: string): Promise<Session | null> {
    const result = await dbClient.query(
      `SELECT * FROM ${SESSIONS_TABLE} WHERE id = $1`,
      [sessionId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const session = mapRowToSession(result.rows[0] as Record<string, unknown>);

    // Check expiry
    if (new Date() > session.expiresAt) {
      // Session has expired — clean it up
      await this.revokeSession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Refresh a session by extending its expiry and updating lastActiveAt.
   *
   * @param sessionId - The session ID to refresh
   * @returns The updated Session, or null if not found
   */
  async refreshSession(sessionId: string): Promise<Session | null> {
    const now = new Date();
    const newExpiry = new Date(now.getTime() + SESSION_DURATION_MS);

    const result = await dbClient.query(
      `UPDATE ${SESSIONS_TABLE}
       SET last_active_at = $1, expires_at = $2
       WHERE id = $3
       RETURNING *`,
      [now.toISOString(), newExpiry.toISOString(), sessionId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    logger.debug('Session refreshed', { sessionId });
    return mapRowToSession(result.rows[0] as Record<string, unknown>);
  }

  /**
   * Revoke (invalidate) a specific session.
   *
   * @param sessionId - The session ID to revoke
   */
  async revokeSession(sessionId: string): Promise<void> {
    await dbClient.query(
      `DELETE FROM ${SESSIONS_TABLE} WHERE id = $1`,
      [sessionId],
    );

    logger.info('Session revoked', { sessionId });
  }

  /**
   * Revoke all sessions for a user, optionally keeping one active session.
   * This is the "logout everywhere" operation.
   *
   * @param userId - The user whose sessions should be revoked
   * @param exceptId - Optional session ID to keep (current session)
   */
  async revokeAllSessions(userId: string, exceptId?: string): Promise<void> {
    if (exceptId) {
      await dbClient.query(
        `DELETE FROM ${SESSIONS_TABLE} WHERE user_id = $1 AND id != $2`,
        [userId, exceptId],
      );
    } else {
      await dbClient.query(
        `DELETE FROM ${SESSIONS_TABLE} WHERE user_id = $1`,
        [userId],
      );
    }

    logger.info('All sessions revoked for user', { userId, exceptId: exceptId ?? 'none' });
  }

  /**
   * Get all active (non-expired) sessions for a user.
   *
   * @param userId - The user ID
   * @returns Array of active sessions sorted by most recent activity
   */
  async getActiveSessions(userId: string): Promise<Session[]> {
    const now = new Date();
    const result = await dbClient.query(
      `SELECT * FROM ${SESSIONS_TABLE}
       WHERE user_id = $1 AND expires_at > $2
       ORDER BY last_active_at DESC`,
      [userId, now.toISOString()],
    );

    return result.rows.map((row) => mapRowToSession(row as Record<string, unknown>));
  }

  /**
   * Remove all expired sessions from the database.
   * Intended to be called periodically (e.g., daily cron job).
   *
   * @returns The number of expired sessions removed
   */
  async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await dbClient.query(
      `DELETE FROM ${SESSIONS_TABLE} WHERE expires_at <= $1`,
      [now.toISOString()],
    );

    const count = result.rowCount ?? 0;
    if (count > 0) {
      logger.info('Expired sessions cleaned', { removed: count });
    }

    return count;
  }
}

/** Singleton session service instance */
export const sessionService = new SessionService();
