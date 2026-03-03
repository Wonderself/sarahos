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
// SQL — table definition (run via migration or seed)
// ---------------------------------------------------------------------------
// CREATE TABLE IF NOT EXISTS usage_events (
//   id SERIAL PRIMARY KEY,
//   user_id TEXT NOT NULL,
//   event TEXT NOT NULL,
//   metadata JSONB DEFAULT '{}',
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events (user_id);
// CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events (event);
// CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events (created_at);

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

class InMemoryEventStore {
  private events: StoredUsageEvent[] = [];
  private idCounter = 0;

  add(event: UsageEvent): StoredUsageEvent {
    const stored: StoredUsageEvent = {
      id: String(++this.idCounter),
      ...event,
    };
    this.events.push(stored);
    return stored;
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
    for (const e of this.events) {
      counts.set(e.event, (counts.get(e.event) ?? 0) + 1);
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
    for (const e of this.events) {
      if (e.timestamp >= dayStart && e.timestamp <= dayEnd) {
        uniqueUsers.add(e.userId);
      }
    }
    return uniqueUsers.size;
  }

  getRetentionRate(cohortDate: Date, days: number): RetentionResult {
    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);
    const cohortEnd = new Date(cohortDate);
    cohortEnd.setHours(23, 59, 59, 999);

    // Users who were active on the cohort date
    const cohortUsers = new Set<string>();
    for (const e of this.events) {
      if (e.timestamp >= cohortStart && e.timestamp <= cohortEnd) {
        cohortUsers.add(e.userId);
      }
    }

    if (cohortUsers.size === 0) {
      return { cohortSize: 0, retainedUsers: 0, retentionRate: 0 };
    }

    // Check which cohort users are active N days later
    const targetStart = new Date(cohortStart);
    targetStart.setDate(targetStart.getDate() + days);
    const targetEnd = new Date(targetStart);
    targetEnd.setHours(23, 59, 59, 999);

    const retainedUsers = new Set<string>();
    for (const e of this.events) {
      if (
        e.timestamp >= targetStart &&
        e.timestamp <= targetEnd &&
        cohortUsers.has(e.userId)
      ) {
        retainedUsers.add(e.userId);
      }
    }

    return {
      cohortSize: cohortUsers.size,
      retainedUsers: retainedUsers.size,
      retentionRate: retainedUsers.size / cohortUsers.size,
    };
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class UsageAnalyticsService {
  private fallbackStore = new InMemoryEventStore();

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
        CREATE TABLE IF NOT EXISTS usage_events (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          event TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await dbClient.query(
        `CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events (user_id)`,
      );
      await dbClient.query(
        `CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events (event)`,
      );
      await dbClient.query(
        `CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events (created_at)`,
      );
    } catch (error) {
      logger.warn('UsageAnalyticsService: failed to ensure table', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // -----------------------------------------------------------------------
  // trackEvent
  // -----------------------------------------------------------------------

  async trackEvent(
    userId: string,
    event: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const usageEvent: UsageEvent = {
      userId,
      event,
      metadata: metadata ?? {},
      timestamp: new Date(),
    };

    if (this.useDb()) {
      try {
        await dbClient.query(
          `INSERT INTO usage_events (user_id, event, metadata) VALUES ($1, $2, $3)`,
          [userId, event, JSON.stringify(metadata ?? {})],
        );
        logger.debug('Usage event tracked', { userId, event });
        return;
      } catch (error) {
        logger.warn('UsageAnalyticsService: DB insert failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback to in-memory
    this.fallbackStore.add(usageEvent);
    logger.debug('Usage event tracked (in-memory)', { userId, event });
  }

  // -----------------------------------------------------------------------
  // getEventsByUser
  // -----------------------------------------------------------------------

  async getEventsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageEvent[]> {
    if (this.useDb()) {
      try {
        let sql = `SELECT user_id, event, metadata, created_at FROM usage_events WHERE user_id = $1`;
        const params: unknown[] = [userId];

        if (startDate) {
          params.push(startDate);
          sql += ` AND created_at >= $${params.length}`;
        }
        if (endDate) {
          params.push(endDate);
          sql += ` AND created_at <= $${params.length}`;
        }

        sql += ` ORDER BY created_at DESC`;

        const result = await dbClient.query(sql, params);
        return result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            userId: r['user_id'] as string,
            event: r['event'] as string,
            metadata: (r['metadata'] as Record<string, any>) ?? {},
            timestamp: new Date(r['created_at'] as string),
          };
        });
      } catch (error) {
        logger.warn('UsageAnalyticsService: DB query failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getByUser(userId, startDate, endDate);
  }

  // -----------------------------------------------------------------------
  // getPopularFeatures
  // -----------------------------------------------------------------------

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
        logger.warn('UsageAnalyticsService: getPopularFeatures DB query failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getPopularFeatures(limit);
  }

  // -----------------------------------------------------------------------
  // getDailyActiveUsers
  // -----------------------------------------------------------------------

  async getDailyActiveUsers(date?: Date): Promise<number> {
    const targetDate = date ?? new Date();

    if (this.useDb()) {
      try {
        const result = await dbClient.query(
          `SELECT COUNT(DISTINCT user_id)::int AS dau
           FROM usage_events
           WHERE created_at >= $1::date
             AND created_at < ($1::date + INTERVAL '1 day')`,
          [targetDate],
        );
        const row = result.rows[0] as Record<string, unknown>;
        return Number(row['dau']);
      } catch (error) {
        logger.warn('UsageAnalyticsService: getDailyActiveUsers DB query failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getDailyActiveUsers(targetDate);
  }

  // -----------------------------------------------------------------------
  // getRetentionRate
  // -----------------------------------------------------------------------

  async getRetentionRate(cohortDate: Date, days: number): Promise<RetentionResult> {
    if (this.useDb()) {
      try {
        // Get cohort: distinct users active on cohortDate
        const cohortResult = await dbClient.query(
          `SELECT DISTINCT user_id
           FROM usage_events
           WHERE created_at >= $1::date
             AND created_at < ($1::date + INTERVAL '1 day')`,
          [cohortDate],
        );

        const cohortUsers = cohortResult.rows.map(
          (r) => (r as Record<string, unknown>)['user_id'] as string,
        );

        if (cohortUsers.length === 0) {
          return { cohortSize: 0, retainedUsers: 0, retentionRate: 0 };
        }

        // Target date = cohortDate + N days
        const targetDate = new Date(cohortDate);
        targetDate.setDate(targetDate.getDate() + days);

        // Count how many cohort users were active on the target date
        const retainedResult = await dbClient.query(
          `SELECT COUNT(DISTINCT user_id)::int AS retained
           FROM usage_events
           WHERE user_id = ANY($1)
             AND created_at >= $2::date
             AND created_at < ($2::date + INTERVAL '1 day')`,
          [cohortUsers, targetDate],
        );

        const retained = Number(
          (retainedResult.rows[0] as Record<string, unknown>)['retained'],
        );

        return {
          cohortSize: cohortUsers.length,
          retainedUsers: retained,
          retentionRate: retained / cohortUsers.length,
        };
      } catch (error) {
        logger.warn('UsageAnalyticsService: getRetentionRate DB query failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallbackStore.getRetentionRate(cohortDate, days);
  }
}

export const usageAnalyticsService = new UsageAnalyticsService();
