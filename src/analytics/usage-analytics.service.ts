import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UsageEvent {
  userId: string;
  event: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface StoredUsageEvent extends UsageEvent {
  id: string;
}

interface FeatureCount {
  event: string;
  count: number;
}

interface RetentionResult {
  cohortSize: number;
  retainedUsers: number;
  retentionRate: number;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

class InMemoryEventStore {
  private events: StoredUsageEvent[] = [];

  add(event: StoredUsageEvent): void {
    this.events.push(event);
  }

  getByUser(userId: string, startDate?: Date, endDate?: Date): StoredUsageEvent[] {
    return this.events.filter((e) => {
      if (e.userId !== userId) return false;
      if (startDate && e.timestamp < startDate) return false;
      if (endDate && e.timestamp > endDate) return false;
      return true;
    });
  }

  getPopularFeatures(limit: number): FeatureCount[] {
    const counts = new Map<string, number>();
    for (const event of this.events) {
      counts.set(event.event, (counts.get(event.event) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getDailyActiveUsers(date: Date): number {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const uniqueUsers = new Set<string>();
    for (const event of this.events) {
      if (event.timestamp >= dayStart && event.timestamp <= dayEnd) {
        uniqueUsers.add(event.userId);
      }
    }
    return uniqueUsers.size;
  }

  getUsersActiveOnDate(date: Date): Set<string> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const users = new Set<string>();
    for (const event of this.events) {
      if (event.timestamp >= dayStart && event.timestamp <= dayEnd) {
        users.add(event.userId);
      }
    }
    return users;
  }
}

// ---------------------------------------------------------------------------
// SQL table definition (for reference / migrations)
// ---------------------------------------------------------------------------

/*
CREATE TABLE IF NOT EXISTS usage_events (
  id SERIAL,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events (user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events (event);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events (created_at);
*/

// ---------------------------------------------------------------------------
// Usage Analytics Service
// ---------------------------------------------------------------------------

export class UsageAnalyticsService {
  private fallbackStore = new InMemoryEventStore();

  private useDb(): boolean {
    return dbClient.isConnected();
  }

  // -------------------------------------------------------------------------
  // Track an event
  // -------------------------------------------------------------------------

  async trackEvent(
    userId: string,
    event: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const timestamp = new Date();

    if (this.useDb()) {
      try {
        await dbClient.query(
          `INSERT INTO usage_events (user_id, event, metadata, created_at)
           VALUES ($1, $2, $3, $4)`,
          [userId, event, metadata ? JSON.stringify(metadata) : null, timestamp],
        );
        logger.debug('Usage event tracked', { userId, event });
        return;
      } catch (error) {
        logger.warn('Failed to persist usage event to DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback to in-memory
    this.fallbackStore.add({
      id: uuidv4(),
      userId,
      event,
      metadata,
      timestamp,
    });
    logger.debug('Usage event tracked (in-memory fallback)', { userId, event });
  }

  // -------------------------------------------------------------------------
  // Query events by user
  // -------------------------------------------------------------------------

  async getEventsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageEvent[]> {
    if (this.useDb()) {
      try {
        let query = 'SELECT user_id, event, metadata, created_at FROM usage_events WHERE user_id = $1';
        const params: unknown[] = [userId];

        if (startDate) {
          params.push(startDate);
          query += ` AND created_at >= $${params.length}`;
        }
        if (endDate) {
          params.push(endDate);
          query += ` AND created_at <= $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';

        const result = await dbClient.query(query, params);
        return result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            userId: r['user_id'] as string,
            event: r['event'] as string,
            metadata: (r['metadata'] as Record<string, any>) ?? undefined,
            timestamp: new Date(r['created_at'] as string),
          };
        });
      } catch (error) {
        logger.warn('Failed to query usage events from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback
    return this.fallbackStore.getByUser(userId, startDate, endDate);
  }

  // -------------------------------------------------------------------------
  // Popular features (aggregated counts)
  // -------------------------------------------------------------------------

  async getPopularFeatures(limit = 10): Promise<FeatureCount[]> {
    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT event, COUNT(*)::int AS count
           FROM usage_events
           GROUP BY event
           ORDER BY count DESC
           LIMIT $1`,
          [limit],
        );
        return result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            event: r['event'] as string,
            count: Number(r['count']),
          };
        });
      } catch (error) {
        logger.warn('Failed to query popular features from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getPopularFeatures(limit);
  }

  // -------------------------------------------------------------------------
  // Daily Active Users
  // -------------------------------------------------------------------------

  async getDailyActiveUsers(date?: Date): Promise<number> {
    const targetDate = date ?? new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT COUNT(DISTINCT user_id)::int AS dau
           FROM usage_events
           WHERE created_at >= $1 AND created_at <= $2`,
          [dayStart, dayEnd],
        );
        return Number((result.rows[0] as Record<string, unknown>)['dau']);
      } catch (error) {
        logger.warn('Failed to query DAU from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getDailyActiveUsers(targetDate);
  }

  // -------------------------------------------------------------------------
  // Basic retention rate
  // -------------------------------------------------------------------------

  /**
   * Calculate retention rate for a cohort.
   * A cohort is defined as users who had at least one event on `cohortDate`.
   * Retention is the fraction of those users who also had at least one event
   * exactly `days` days later.
   */
  async getRetentionRate(cohortDate: Date, days: number): Promise<RetentionResult> {
    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);
    const cohortEnd = new Date(cohortDate);
    cohortEnd.setHours(23, 59, 59, 999);

    const returnDate = new Date(cohortStart);
    returnDate.setDate(returnDate.getDate() + days);
    const returnEnd = new Date(returnDate);
    returnEnd.setHours(23, 59, 59, 999);

    if (this.useDb()) {
      try {
        // Get cohort users
        const cohortResult = await dbClient.query(
          `SELECT DISTINCT user_id FROM usage_events
           WHERE created_at >= $1 AND created_at <= $2`,
          [cohortStart, cohortEnd],
        );
        const cohortUsers = new Set(
          cohortResult.rows.map((r) => (r as Record<string, unknown>)['user_id'] as string),
        );

        if (cohortUsers.size === 0) {
          return { cohortSize: 0, retainedUsers: 0, retentionRate: 0 };
        }

        // Get users active on return date
        const returnResult = await dbClient.query(
          `SELECT DISTINCT user_id FROM usage_events
           WHERE created_at >= $1 AND created_at <= $2`,
          [returnDate, returnEnd],
        );
        const returnUsers = new Set(
          returnResult.rows.map((r) => (r as Record<string, unknown>)['user_id'] as string),
        );

        // Intersection
        let retained = 0;
        for (const userId of cohortUsers) {
          if (returnUsers.has(userId)) retained++;
        }

        return {
          cohortSize: cohortUsers.size,
          retainedUsers: retained,
          retentionRate: cohortUsers.size > 0 ? retained / cohortUsers.size : 0,
        };
      } catch (error) {
        logger.warn('Failed to query retention from DB, using fallback', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback: in-memory
    const cohortUsers = this.fallbackStore.getUsersActiveOnDate(cohortStart);
    if (cohortUsers.size === 0) {
      return { cohortSize: 0, retainedUsers: 0, retentionRate: 0 };
    }

    const returnUsers = this.fallbackStore.getUsersActiveOnDate(returnDate);
    let retained = 0;
    for (const userId of cohortUsers) {
      if (returnUsers.has(userId)) retained++;
    }

    return {
      cohortSize: cohortUsers.size,
      retainedUsers: retained,
      retentionRate: cohortUsers.size > 0 ? retained / cohortUsers.size : 0,
    };
  }
}

export const usageAnalyticsService = new UsageAnalyticsService();
