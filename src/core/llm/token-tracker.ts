import { logger } from '../../utils/logger';
import type { TokenUsage } from './llm.types';

export class TokenTracker {
  private usageLog: TokenUsage[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 50000) {
    this.maxLogSize = maxLogSize;
  }

  record(usage: TokenUsage): void {
    this.usageLog.push(usage);

    if (this.usageLog.length > this.maxLogSize) {
      this.usageLog = this.usageLog.slice(-Math.floor(this.maxLogSize * 0.8));
    }

    logger.debug('Token usage recorded', {
      agent: usage.agentName,
      model: usage.model,
      total: usage.totalTokens,
    });
  }

  getTotalTokens(): number {
    return this.usageLog.reduce((sum, u) => sum + u.totalTokens, 0);
  }

  getTokensByAgent(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const usage of this.usageLog) {
      const current = result[usage.agentName] ?? 0;
      result[usage.agentName] = current + usage.totalTokens;
    }
    return result;
  }

  getTokensByModel(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const usage of this.usageLog) {
      const current = result[usage.model] ?? 0;
      result[usage.model] = current + usage.totalTokens;
    }
    return result;
  }

  getDailyAverage(): number {
    if (this.usageLog.length === 0) return 0;

    const days = new Set(
      this.usageLog.map((u) => u.timestamp.split('T')[0])
    );

    const total = this.getTotalTokens();
    return Math.round(total / Math.max(days.size, 1));
  }

  getRecentUsage(count = 100): TokenUsage[] {
    return this.usageLog.slice(-count);
  }

  reset(): void {
    this.usageLog = [];
  }
}

export const tokenTracker = new TokenTracker();
