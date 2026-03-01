import { EventBus } from './event-bus';
import { logger } from '../../utils/logger';
import type { DatabaseClient } from '../../infra/database/db-client';
import type { RedisClient } from '../../infra/redis/redis-client';
import type { EventType, SystemEvent } from './event.types';

const REDIS_EVENT_CHANNEL = 'sarah:events';

export class PersistentEventBus extends EventBus {
  private db: DatabaseClient | null = null;
  private redis: RedisClient | null = null;

  enablePersistence(db: DatabaseClient, redis?: RedisClient): void {
    this.db = db.isConnected() ? db : null;
    this.redis = redis?.isConnected() ? redis : null;

    if (this.db) {
      logger.info('EventBus persistence enabled — PostgreSQL');
    }
    if (this.redis) {
      logger.info('EventBus persistence enabled — Redis Pub/Sub');
    }
    if (!this.db && !this.redis) {
      logger.warn('EventBus persistence: no backends available, using in-memory only');
    }
  }

  async publish(
    type: EventType,
    sourceAgent: string,
    payload: Record<string, unknown> = {},
    targetAgent?: string,
    correlationId?: string,
  ): Promise<SystemEvent> {
    // Always delegate to in-memory parent first
    const event = await super.publish(type, sourceAgent, payload, targetAgent, correlationId);

    // Persist to PostgreSQL
    if (this.db?.isConnected()) {
      try {
        await this.db.query(
          `INSERT INTO events (id, event_type, source_agent, target_agent, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [event.id, event.type, event.sourceAgent, event.targetAgent ?? null, JSON.stringify(event.payload), event.timestamp],
        );
      } catch (error) {
        logger.error('Failed to persist event to PostgreSQL', {
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Publish to Redis for cross-process distribution
    if (this.redis?.isConnected()) {
      try {
        await this.redis.publish(REDIS_EVENT_CHANNEL, JSON.stringify(event));
      } catch (error) {
        logger.error('Failed to publish event to Redis', {
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return event;
  }

  async getPersistedEvents(type?: EventType, limit = 100): Promise<SystemEvent[]> {
    if (!this.db?.isConnected()) {
      return type ? this.getEventsByType(type, limit) : this.getRecentEvents(limit);
    }

    const query = type
      ? `SELECT id, event_type, source_agent, target_agent, payload, created_at FROM events WHERE event_type = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT id, event_type, source_agent, target_agent, payload, created_at FROM events ORDER BY created_at DESC LIMIT $1`;

    const params = type ? [type, limit] : [limit];
    const result = await this.db.query(query, params);

    return result.rows.map((row) => ({
      id: String(row['id']),
      type: String(row['event_type']) as EventType,
      sourceAgent: String(row['source_agent']),
      targetAgent: row['target_agent'] ? String(row['target_agent']) : undefined,
      payload: (row['payload'] as Record<string, unknown>) ?? {},
      timestamp: String(row['created_at']),
      correlationId: undefined,
    }));
  }

  async getEventStats(): Promise<Record<string, number>> {
    if (!this.db?.isConnected()) {
      // Fallback: count from in-memory log
      const events = this.getRecentEvents(10000);
      const stats: Record<string, number> = {};
      for (const event of events) {
        stats[event.type] = (stats[event.type] ?? 0) + 1;
      }
      return stats;
    }

    const result = await this.db.query(
      `SELECT event_type, COUNT(*)::int as count FROM events GROUP BY event_type ORDER BY count DESC`,
    );

    const stats: Record<string, number> = {};
    for (const row of result.rows) {
      stats[String(row['event_type'])] = Number(row['count']);
    }
    return stats;
  }

  isPersistenceEnabled(): boolean {
    return (this.db?.isConnected() ?? false) || (this.redis?.isConnected() ?? false);
  }
}

export const persistentEventBus = new PersistentEventBus();
