import { Pool, type PoolClient, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';
import { logger } from '../../utils/logger';
import { getDatabaseUrl } from '../../utils/config';
import { withRetry } from '../../utils/retry';

export class DatabaseClient {
  private pool: Pool | null = null;
  private connected = false;

  async connect(configOverride?: PoolConfig): Promise<void> {
    if (this.connected) {
      logger.warn('DatabaseClient already connected');
      return;
    }

    try {
      const connectionString = getDatabaseUrl();
      this.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        statement_timeout: 30_000,
        ...configOverride,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();
      this.connected = true;

      logger.info('DatabaseClient connected', { connectionString: connectionString.replace(/:[^@]+@/, ':***@') });
    } catch (error) {
      logger.warn('DatabaseClient connection failed — running without persistence', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.pool = null;
      this.connected = false;
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    if (!this.pool || !this.connected) {
      throw new Error('DatabaseClient not connected. Call connect() first.');
    }

    return withRetry(
      () => this.pool!.query<T>(sql, params),
      `db-query`,
      { maxRetries: 2, baseDelayMs: 500, maxDelayMs: 5000, backoffMultiplier: 2 },
    );
  }

  /**
   * Execute a function within a database transaction using a single pooled client.
   * Ensures BEGIN/COMMIT/ROLLBACK all happen on the same connection.
   * Use this for operations that require atomicity (e.g., wallet updates with row locking).
   */
  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool || !this.connected) {
      throw new Error('DatabaseClient not connected. Call connect() first.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getPool(): Pool | null {
    return this.pool;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
      logger.info('DatabaseClient disconnected');
    }
  }

  getPoolMetrics(): { total: number; idle: number; waiting: number } | null {
    if (!this.pool) return null;
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }

  async healthCheck(): Promise<{ connected: boolean; latencyMs: number; pool?: { total: number; idle: number; waiting: number } }> {
    if (!this.pool || !this.connected) {
      return { connected: false, latencyMs: -1 };
    }

    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start, pool: this.getPoolMetrics() ?? undefined };
    } catch {
      return { connected: false, latencyMs: Date.now() - start };
    }
  }
}

export const dbClient = new DatabaseClient();
