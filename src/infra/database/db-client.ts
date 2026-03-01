import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';
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

  async healthCheck(): Promise<{ connected: boolean; latencyMs: number }> {
    if (!this.pool || !this.connected) {
      return { connected: false, latencyMs: -1 };
    }

    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start };
    } catch {
      return { connected: false, latencyMs: Date.now() - start };
    }
  }
}

export const dbClient = new DatabaseClient();
