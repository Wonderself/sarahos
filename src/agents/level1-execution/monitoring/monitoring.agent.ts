import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { MONITORING_SYSTEM_PROMPT, HEALTH_CHECK_TEMPLATE } from './monitoring.prompts';
import {
  checkLatency,
  logError,
  reportTokenUsage,
  checkContainerHealth,
  checkAvatarCache,
} from './monitoring.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const MONITORING_AGENT_CONFIG: AgentConfig = {
  id: 'monitoring-agent',
  name: 'Monitoring Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['check-latency', 'log-error', 'token-report', 'container-health', 'avatar-cache'],
  systemPrompt: MONITORING_SYSTEM_PROMPT,
  maxRetries: 1,
  timeoutMs: 20_000,
  rateLimitPerMinute: 30,
};

type MonitoringTaskType = 'health-check' | 'latency' | 'token-report' | 'container-health' | 'avatar-cache' | 'log-error';

export class MonitoringAgent extends BaseAgent {
  constructor(config: AgentConfig = MONITORING_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TaskFailed', async (event) => {
      this.logger.warn('Task failure detected — logging error', { eventId: event.id });
      await logError(`Task failed: ${String(event.payload['error'] ?? 'unknown')}`, {
        taskId: event.payload['taskId'],
        sourceAgent: event.sourceAgent,
        critical: false,
      });
    }, this.id);

    eventBus.subscribe('ThresholdBreached', async (event) => {
      const severity = event.payload['severity'] as string;
      if (severity === 'critical') {
        this.logger.error('Critical threshold breached — escalating', { eventId: event.id });
        await eventBus.publish('EscalationToHuman', this.id, {
          reason: 'Critical threshold breached',
          metric: event.payload['metric'],
          value: event.payload['value'],
          threshold: event.payload['threshold'],
        });
      }
    }, this.id);

    this.logger.info('Monitoring Agent initialized — watching system health');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as MonitoringTaskType | undefined) ?? 'health-check';

    switch (taskType) {
      case 'health-check':
        return this.handleFullHealthCheck(task);
      case 'latency':
        return this.handleLatencyCheck(task);
      case 'token-report':
        return this.handleTokenReport();
      case 'container-health':
        return this.handleContainerHealth();
      case 'avatar-cache':
        return this.handleAvatarCache();
      case 'log-error':
        return this.handleLogError(task);
      default:
        return { error: `Unknown monitoring task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'TaskFailed') {
      this.logger.debug('TaskFailed event received', { eventId: event.id, source: event.sourceAgent });
    }
    if (event.type === 'ThresholdBreached') {
      this.logger.debug('ThresholdBreached event received', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TaskFailed', this.id);
    eventBus.unsubscribe('ThresholdBreached', this.id);
    this.logger.info('Monitoring Agent shut down');
  }

  private async handleFullHealthCheck(_task: AgentTask): Promise<Record<string, unknown>> {
    const services = ['sarah-api', 'llm-router', 'event-bus', 'memory-manager', 'orchestrator'];
    const latencyResults = await Promise.all(services.map((s) => checkLatency(s)));
    const containers = await checkContainerHealth();
    const avatarCache = await checkAvatarCache();
    const tokenReport = reportTokenUsage();

    const alerts: Record<string, unknown>[] = [];

    for (const check of latencyResults) {
      if (check.status !== 'ok') {
        alerts.push({ severity: check.status, service: check.service, latencyMs: check.latencyMs });
      }
    }

    for (const container of containers) {
      if (container.status !== 'running') {
        alerts.push({ severity: 'critical', service: container.name, issue: `Container ${container.status}` });
      }
      if (container.restartCount > 3) {
        alerts.push({ severity: 'warn', service: container.name, issue: `${container.restartCount} restarts` });
      }
    }

    if (avatarCache.sarahHitRate < 0.8) {
      alerts.push({ severity: 'warn', service: 'avatar-cache-sarah', hitRate: avatarCache.sarahHitRate });
    }
    if (avatarCache.emmanuelHitRate < 0.8) {
      alerts.push({ severity: 'warn', service: 'avatar-cache-emmanuel', hitRate: avatarCache.emmanuelHitRate });
    }

    if (tokenReport.budgetUsedPercent > 95) {
      alerts.push({ severity: 'critical', service: 'token-budget', budgetUsedPercent: tokenReport.budgetUsedPercent });
    } else if (tokenReport.budgetUsedPercent > 80) {
      alerts.push({ severity: 'warn', service: 'token-budget', budgetUsedPercent: tokenReport.budgetUsedPercent });
    }

    const overallStatus = alerts.some((a) => a['severity'] === 'critical')
      ? 'critical'
      : alerts.length > 0
        ? 'degraded'
        : 'healthy';

    // Publish threshold breaches
    for (const alert of alerts) {
      if (alert['severity'] === 'critical') {
        await eventBus.publish('ThresholdBreached', this.id, alert);
      }
    }

    // Use LLM for recommendations if degraded
    let recommendations: string[] = [];
    if (overallStatus !== 'healthy') {
      const prompt = HEALTH_CHECK_TEMPLATE
        .replace('{services}', services.join(', '))
        .replace('{metrics}', JSON.stringify({ latencyResults, containers, avatarCache, tokenReport }));

      const response = await LLMRouter.route({
        agentId: this.id,
        agentName: this.name,
        modelTier: this.modelTier,
        systemPrompt: this.systemPrompt,
        userMessage: prompt,
      });
      recommendations = [response.content];
    }

    const report = {
      status: overallStatus,
      latency: latencyResults,
      containers,
      avatarCache,
      tokenReport,
      alerts,
      recommendations,
      action: 'health-check',
    };

    await eventBus.publish('HealthReport', this.id, report);
    return report;
  }

  private async handleLatencyCheck(task: AgentTask): Promise<Record<string, unknown>> {
    const service = String(task.payload['service'] ?? 'sarah-api');
    const result = await checkLatency(service);

    await eventBus.publish('MetricLogged', this.id, {
      metric: 'latency',
      service,
      value: result.latencyMs,
      status: result.status,
    });

    if (result.status !== 'ok') {
      await eventBus.publish('ThresholdBreached', this.id, {
        severity: result.status,
        metric: 'latency',
        service,
        value: result.latencyMs,
        threshold: result.status === 'critical' ? 5000 : 2000,
      });
    }

    return { ...result, action: 'latency' };
  }

  private async handleTokenReport(): Promise<Record<string, unknown>> {
    const report = reportTokenUsage();

    await eventBus.publish('MetricLogged', this.id, {
      metric: 'token-usage',
      totalTokens: report.totalTokens,
      budgetUsedPercent: report.budgetUsedPercent,
    });

    return { ...report, action: 'token-report' };
  }

  private async handleContainerHealth(): Promise<Record<string, unknown>> {
    const containers = await checkContainerHealth();

    const unhealthy = containers.filter((c) => c.status !== 'running');
    if (unhealthy.length > 0) {
      await eventBus.publish('ThresholdBreached', this.id, {
        severity: 'critical',
        metric: 'container-health',
        unhealthyContainers: unhealthy.map((c) => c.name),
      });
    }

    await eventBus.publish('MetricLogged', this.id, {
      metric: 'container-health',
      totalContainers: containers.length,
      healthyCount: containers.filter((c) => c.status === 'running').length,
    });

    return { containers, action: 'container-health' };
  }

  private async handleAvatarCache(): Promise<Record<string, unknown>> {
    const stats = await checkAvatarCache();

    await eventBus.publish('MetricLogged', this.id, {
      metric: 'avatar-cache',
      sarahHitRate: stats.sarahHitRate,
      emmanuelHitRate: stats.emmanuelHitRate,
      didUsageToday: stats.didUsageToday,
    });

    if (stats.sarahHitRate < 0.5 || stats.emmanuelHitRate < 0.5) {
      await eventBus.publish('ThresholdBreached', this.id, {
        severity: 'critical',
        metric: 'avatar-cache-hit-rate',
        sarahHitRate: stats.sarahHitRate,
        emmanuelHitRate: stats.emmanuelHitRate,
      });
    }

    return { ...stats, action: 'avatar-cache' };
  }

  private async handleLogError(task: AgentTask): Promise<Record<string, unknown>> {
    const error = String(task.payload['error'] ?? 'Unknown error');
    const context = (task.payload['context'] as Record<string, unknown>) ?? {};

    const entry = await logError(error, context);

    await eventBus.publish('MetricLogged', this.id, {
      metric: 'error',
      errorId: entry.errorId,
      severity: entry.severity,
    });

    return { ...entry, action: 'log-error' };
  }
}
