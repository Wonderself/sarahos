import { MemoryManager } from './memory-manager';
import { logger } from '../../utils/logger';
import type { DatabaseClient } from '../../infra/database/db-client';
import type { MemoryEntry, SearchResult, MemorySearchOptions, MemoryStoreOptions } from './memory.types';

export class PersistentMemoryManager extends MemoryManager {
  private db: DatabaseClient | null = null;

  enablePersistence(db: DatabaseClient): void {
    if (db.isConnected()) {
      this.db = db;
      logger.info('MemoryManager persistence enabled — PostgreSQL pgvector');
    } else {
      logger.warn('MemoryManager persistence: DB not connected, using in-memory only');
    }
  }

  async store(options: MemoryStoreOptions): Promise<MemoryEntry> {
    // Always store in-memory first
    const entry = await super.store(options);

    // Persist to PostgreSQL
    if (this.db?.isConnected()) {
      try {
        const embeddingStr = entry.embedding
          ? `[${entry.embedding.join(',')}]`
          : null;

        await this.db.query(
          `INSERT INTO memory_embeddings (id, content, metadata, embedding, source, agent_id, expires_at, created_at)
           VALUES ($1, $2, $3, $4::vector, $5, $6, $7, $8)`,
          [
            entry.id,
            entry.content,
            JSON.stringify(entry.metadata),
            embeddingStr,
            entry.source,
            entry.agentId ?? null,
            entry.expiresAt ?? null,
            entry.createdAt,
          ],
        );
      } catch (error) {
        logger.error('Failed to persist memory to PostgreSQL', {
          memoryId: entry.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return entry;
  }

  async search(options: MemorySearchOptions): Promise<SearchResult[]> {
    // If DB is connected and we have a vector search capability, use it
    if (this.db?.isConnected()) {
      try {
        return await this.searchFromDB(options);
      } catch (error) {
        logger.warn('pgvector search failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Fallback to in-memory cosine similarity
    return super.search(options);
  }

  private async searchFromDB(options: MemorySearchOptions): Promise<SearchResult[]> {
    const topK = options.topK ?? 5;
    const minScore = options.minScore ?? 0.7;

    // Build query with filters
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (options.source) {
      conditions.push(`source = $${paramIndex}`);
      params.push(options.source);
      paramIndex++;
    }

    if (options.agentId) {
      conditions.push(`agent_id = $${paramIndex}`);
      params.push(options.agentId);
      paramIndex++;
    }

    conditions.push(`(expires_at IS NULL OR expires_at > NOW())`);

    // Text-based search (since embedding generation is handled by the embedding service)
    const query = `
      SELECT id, content, metadata, source, agent_id, expires_at, created_at,
             0.5::float AS score
      FROM memory_embeddings
      WHERE ${conditions.join(' AND ')}
        AND content ILIKE $${paramIndex}
      ORDER BY created_at DESC
      LIMIT $${paramIndex + 1}
    `;

    params.push(`%${options.query}%`, topK);

    const result = await this.db!.query(query, params);

    return result.rows
      .filter((row) => Number(row['score']) >= minScore)
      .map((row) => ({
        entry: {
          id: String(row['id']),
          content: String(row['content']),
          metadata: (row['metadata'] as Record<string, unknown>) ?? {},
          source: String(row['source']),
          agentId: row['agent_id'] ? String(row['agent_id']) : undefined,
          expiresAt: row['expires_at'] ? String(row['expires_at']) : undefined,
          createdAt: String(row['created_at']),
        },
        score: Number(row['score']),
        distance: 1 - Number(row['score']),
      }));
  }

  delete(id: string): boolean {
    const deleted = super.delete(id);

    if (deleted && this.db?.isConnected()) {
      this.db.query('DELETE FROM memory_embeddings WHERE id = $1', [id]).catch((error) => {
        logger.error('Failed to delete memory from PostgreSQL', {
          memoryId: id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    return deleted;
  }

  async syncFromDatabase(): Promise<number> {
    if (!this.db?.isConnected()) {
      logger.warn('Cannot sync from database — not connected');
      return 0;
    }

    const result = await this.db.query(
      `SELECT id, content, metadata, source, agent_id, expires_at, created_at
       FROM memory_embeddings
       WHERE expires_at IS NULL OR expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1000`,
    );

    let synced = 0;
    for (const row of result.rows) {
      const existing = this.get(String(row['id']));
      if (!existing) {
        // Store directly in-memory (bypass persistence to avoid duplicate INSERT)
        await super.store({
          content: String(row['content']),
          metadata: (row['metadata'] as Record<string, unknown>) ?? {},
          source: String(row['source']),
          agentId: row['agent_id'] ? String(row['agent_id']) : undefined,
          expiresAt: row['expires_at'] ? String(row['expires_at']) : undefined,
        });
        synced++;
      }
    }

    logger.info(`MemoryManager synced ${synced} entries from database`);
    return synced;
  }

  async getPersistedCount(): Promise<number> {
    if (!this.db?.isConnected()) {
      return this.getCount();
    }

    const result = await this.db.query('SELECT COUNT(*)::int as count FROM memory_embeddings');
    return Number(result.rows[0]?.['count'] ?? 0);
  }

  isPersistenceEnabled(): boolean {
    return this.db?.isConnected() ?? false;
  }
}

export const persistentMemoryManager = new PersistentMemoryManager();
