import { logger } from '../../utils/logger';
import { stateManager } from '../state/state-manager';
import { agentRegistry } from '../agent-registry/agent-registry';
import { tokenTracker } from '../llm/token-tracker';
import { taskScheduler } from '../orchestrator/task-scheduler';

export interface SystemMetrics {
  pipelineLatencyAvgMs: number;
  agentErrorRate: number;
  tokenBurnDaily: number;
  uptimeHours: number;
  activeConversations: number;
  pendingTasks: number;
}

export interface ImprovementCycleRecord {
  cycleId: string;
  timestamp: string;
  healthScore: number;
  metrics: SystemMetrics;
  action: 'optimize' | 'metrics-review' | 'none';
}

export class ImprovementScheduler {
  private cycleHistory: ImprovementCycleRecord[] = [];

  collectSystemMetrics(): SystemMetrics {
    const state = stateManager.getState();
    const entries = agentRegistry.getAllEntries();
    const errorAgents = entries.filter((e) => e.status === 'ERROR').length;
    const totalAgents = Math.max(entries.length, 1);

    return {
      pipelineLatencyAvgMs: state.avatar_system.pipeline_latency_avg_ms,
      agentErrorRate: errorAgents / totalAgents,
      tokenBurnDaily: tokenTracker.getDailyAverage(),
      uptimeHours: state.infrastructure.uptime_hours,
      activeConversations: state.avatar_system.active_conversations,
      pendingTasks: state.tasks_in_progress.length,
    };
  }

  calculateHealthScore(metrics: SystemMetrics): number {
    let score = 100;

    // Latency penalty: -1 point per 100ms above 500ms (max -25)
    if (metrics.pipelineLatencyAvgMs > 500) {
      score -= Math.min(25, Math.floor((metrics.pipelineLatencyAvgMs - 500) / 100));
    }

    // Agent error rate penalty: -25 points if all agents in error
    score -= Math.min(25, Math.floor(metrics.agentErrorRate * 25));

    // Token burn penalty: -1 point per 10k tokens above 100k daily (max -25)
    if (metrics.tokenBurnDaily > 100_000) {
      score -= Math.min(25, Math.floor((metrics.tokenBurnDaily - 100_000) / 10_000));
    }

    // Pending tasks penalty: -5 per pending task (max -25)
    score -= Math.min(25, metrics.pendingTasks * 5);

    return Math.max(0, Math.min(100, score));
  }

  async runCycle(): Promise<ImprovementCycleRecord> {
    const metrics = this.collectSystemMetrics();
    const healthScore = this.calculateHealthScore(metrics);
    const cycleId = `cycle_${Date.now()}`;
    let action: ImprovementCycleRecord['action'] = 'none';

    logger.info('Self-improvement cycle running', { cycleId, healthScore });

    if (healthScore < 70) {
      // Enqueue optimization task for SelfImprovementAgent
      taskScheduler.enqueue({
        id: `improvement-${cycleId}`,
        title: 'Self-improvement optimization',
        description: `Health score ${healthScore} below threshold — optimization needed`,
        priority: 'HIGH',
        payload: {
          taskType: 'optimize',
          triggeredBy: 'improvement-scheduler',
          healthScore,
          metrics,
        },
        assignedBy: 'improvement-scheduler',
        correlationId: cycleId,
      });
      action = 'optimize';
      logger.warn('Health score below threshold — optimization task enqueued', { healthScore });
    } else if (healthScore > 90) {
      action = 'metrics-review';
      logger.info('Health score excellent — metrics review only', { healthScore });
    } else {
      action = 'none';
      logger.info('Health score acceptable — no action needed', { healthScore });
    }

    // Update state
    await stateManager.update((state) => {
      state.last_self_improvement_cycle = new Date().toISOString();
    });

    const record: ImprovementCycleRecord = {
      cycleId,
      timestamp: new Date().toISOString(),
      healthScore,
      metrics,
      action,
    };

    this.cycleHistory.push(record);
    if (this.cycleHistory.length > 100) {
      this.cycleHistory = this.cycleHistory.slice(-80);
    }

    return record;
  }

  getImprovementHistory(): ImprovementCycleRecord[] {
    return [...this.cycleHistory];
  }

  getLastCycle(): ImprovementCycleRecord | null {
    return this.cycleHistory[this.cycleHistory.length - 1] ?? null;
  }
}

export const improvementScheduler = new ImprovementScheduler();
