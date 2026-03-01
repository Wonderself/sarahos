import { TokenTracker } from './token-tracker';
import { logger } from '../../utils/logger';
import type { DatabaseClient } from '../../infra/database/db-client';
import type { TokenUsage } from './llm.types';

export interface TokenCostReport {
  totalTokens: number;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  estimatedCostUsd: number;
}

export interface DateRangeUsage {
  date: string;
  totalTokens: number;
  byAgent: Record<string, number>;
}

export class PersistentTokenTracker extends TokenTracker {
  private db: DatabaseClient | null = null;

  enablePersistence(db: DatabaseClient): void {
    if (db.isConnected()) {
      this.db = db;
      logger.info('TokenTracker persistence enabled — PostgreSQL');
    } else {
      logger.warn('TokenTracker persistence: DB not connected, using in-memory only');
    }
  }

  record(usage: TokenUsage): void {
    super.record(usage);

    if (this.db?.isConnected()) {
      this.db.query(
        `INSERT INTO token_usage (agent_name, model, prompt_tokens, completion_tokens, total_tokens, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          usage.agentName,
          usage.model,
          usage.inputTokens,
          usage.outputTokens,
          usage.totalTokens,
          usage.timestamp,
        ],
      ).catch((error) => {
        logger.error('Failed to persist token usage to PostgreSQL', {
          agent: usage.agentName,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }
  }

  async getTokensByDateRange(from: string, to: string): Promise<DateRangeUsage[]> {
    if (!this.db?.isConnected()) {
      // Fallback: filter in-memory
      const recent = this.getRecentUsage(50000);
      const filtered = recent.filter((u) => u.timestamp >= from && u.timestamp <= to);
      const byDate = new Map<string, DateRangeUsage>();

      for (const usage of filtered) {
        const date = usage.timestamp.split('T')[0]!;
        const existing = byDate.get(date) ?? { date, totalTokens: 0, byAgent: {} };
        existing.totalTokens += usage.totalTokens;
        existing.byAgent[usage.agentName] = (existing.byAgent[usage.agentName] ?? 0) + usage.totalTokens;
        byDate.set(date, existing);
      }

      return Array.from(byDate.values());
    }

    const result = await this.db.query(
      `SELECT DATE(created_at)::text as date,
              SUM(total_tokens)::int as total_tokens,
              agent_name
       FROM token_usage
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at), agent_name
       ORDER BY date DESC`,
      [from, to],
    );

    const byDate = new Map<string, DateRangeUsage>();
    for (const row of result.rows) {
      const date = String(row['date']);
      const existing = byDate.get(date) ?? { date, totalTokens: 0, byAgent: {} };
      const tokens = Number(row['total_tokens']);
      existing.totalTokens += tokens;
      existing.byAgent[String(row['agent_name'])] = tokens;
      byDate.set(date, existing);
    }

    return Array.from(byDate.values());
  }

  async getCostReport(): Promise<TokenCostReport> {
    if (!this.db?.isConnected()) {
      return {
        totalTokens: this.getTotalTokens(),
        byAgent: this.getTokensByAgent(),
        byModel: this.getTokensByModel(),
        estimatedCostUsd: this.getTotalTokens() * 0.00001, // rough estimate
      };
    }

    const [totalResult, agentResult, modelResult] = await Promise.all([
      this.db.query('SELECT COALESCE(SUM(total_tokens), 0)::int as total FROM token_usage'),
      this.db.query('SELECT agent_name, SUM(total_tokens)::int as total FROM token_usage GROUP BY agent_name'),
      this.db.query('SELECT model, SUM(total_tokens)::int as total FROM token_usage GROUP BY model'),
    ]);

    const totalTokens = Number(totalResult.rows[0]?.['total'] ?? 0);
    const byAgent: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    for (const row of agentResult.rows) {
      byAgent[String(row['agent_name'])] = Number(row['total']);
    }
    for (const row of modelResult.rows) {
      byModel[String(row['model'])] = Number(row['total']);
    }

    return {
      totalTokens,
      byAgent,
      byModel,
      estimatedCostUsd: totalTokens * 0.00001,
    };
  }

  async getDailyAverageFromDB(): Promise<number> {
    if (!this.db?.isConnected()) {
      return this.getDailyAverage();
    }

    const result = await this.db.query(
      `SELECT COALESCE(AVG(daily_total), 0)::int as avg_daily
       FROM (
         SELECT DATE(created_at), SUM(total_tokens) as daily_total
         FROM token_usage
         GROUP BY DATE(created_at)
       ) daily`,
    );

    return Number(result.rows[0]?.['avg_daily'] ?? 0);
  }

  isPersistenceEnabled(): boolean {
    return this.db?.isConnected() ?? false;
  }
}

export const persistentTokenTracker = new PersistentTokenTracker();
