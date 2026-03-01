import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { TECHNICAL_MANAGER_SYSTEM_PROMPT, TECH_DEBT_TEMPLATE, PERFORMANCE_TEMPLATE, TOKEN_OPTIMIZATION_TEMPLATE } from './technical-manager.prompts';
import { assessTechDebt, analyzePerformance, optimizeTokenUsage, assessInfrastructure, auditAvatarPipeline } from './technical-manager.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const TECHNICAL_MANAGER_CONFIG: AgentConfig = {
  id: 'technical-manager',
  name: 'Technical Manager',
  level: 2,
  modelTier: 'standard',
  capabilities: ['tech-debt-tracking', 'infra-assessment', 'performance-optimization', 'token-optimization', 'avatar-pipeline-monitoring'],
  systemPrompt: TECHNICAL_MANAGER_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 20,
};

type TechTaskType = 'tech-debt' | 'performance' | 'token-optimization' | 'infra-assessment' | 'avatar-audit';

export class TechnicalManager extends BaseAgent {
  constructor(config: AgentConfig = TECHNICAL_MANAGER_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('HealthReport', async (event) => {
      await memoryManager.store({
        content: `HealthReport: status=${String(event.payload['status'])} containers=${JSON.stringify(event.payload['containers'] ?? [])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'health_report', status: event.payload['status'] },
      });
    }, this.id);

    eventBus.subscribe('ThresholdBreached', async (event) => {
      this.logger.warn('Threshold breach — assessing technical impact', { metric: event.payload['metric'] });
      await memoryManager.store({
        content: `ThresholdBreached: metric=${String(event.payload['metric'])} severity=${String(event.payload['severity'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'threshold_breach', metric: event.payload['metric'], severity: event.payload['severity'] },
      });
    }, this.id);

    eventBus.subscribe('MetricLogged', async (event) => {
      // Only store significant metrics
      const metric = String(event.payload['metric'] ?? '');
      if (metric === 'latency' || metric === 'token-usage' || metric === 'container-health') {
        await memoryManager.store({
          content: `MetricLogged: ${metric} value=${JSON.stringify(event.payload)}`,
          source: this.name,
          agentId: this.id,
          metadata: { type: 'metric', metric },
        });
      }
    }, this.id);

    eventBus.subscribe('PerformanceAlert', async (event) => {
      this.logger.warn('Performance alert received', { eventId: event.id });
    }, this.id);

    eventBus.subscribe('ScriptExecuted', async (event) => {
      this.logger.debug('Script execution tracked', { scriptPath: event.payload['scriptPath'] });
    }, this.id);

    this.logger.info('Technical Manager initialized — monitoring system health');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as TechTaskType | undefined) ?? 'tech-debt';

    switch (taskType) {
      case 'tech-debt':
        return this.handleTechDebt(task);
      case 'performance':
        return this.handlePerformance(task);
      case 'token-optimization':
        return this.handleTokenOptimization();
      case 'infra-assessment':
        return this.handleInfraAssessment(task);
      case 'avatar-audit':
        return this.handleAvatarAudit(task);
      default:
        return { error: `Unknown technical task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ThresholdBreached') {
      this.logger.debug('Technical threshold breach tracked', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('HealthReport', this.id);
    eventBus.unsubscribe('ThresholdBreached', this.id);
    eventBus.unsubscribe('MetricLogged', this.id);
    eventBus.unsubscribe('PerformanceAlert', this.id);
    eventBus.unsubscribe('ScriptExecuted', this.id);
    this.logger.info('Technical Manager shut down');
  }

  private async handleTechDebt(task: AgentTask): Promise<Record<string, unknown>> {
    const systems = (task.payload['systems'] as string[]) ?? ['EventBus', 'MemoryManager', 'ApprovalQueue'];

    const stubAssessment = assessTechDebt(systems);

    // Get recent incidents from memory
    const incidents = await memoryManager.search({
      query: 'ThresholdBreached error failure',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const prompt = TECH_DEBT_TEMPLATE
      .replace('{systems}', systems.join(', '))
      .replace('{knownDebt}', JSON.stringify(stubAssessment.items))
      .replace('{incidents}', String(incidents.length));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'tech-debt',
      systems,
      assessment: response.content,
      debtItems: stubAssessment.items,
      totalDebtScore: stubAssessment.totalDebtScore,
      recentIncidents: incidents.length,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('TechDebtReport', this.id, report);
    return report;
  }

  private async handlePerformance(task: AgentTask): Promise<Record<string, unknown>> {
    const period = String(task.payload['period'] ?? 'last_24h');

    // Get recent metrics from memory
    const metricsData = await memoryManager.search({
      query: 'MetricLogged latency container',
      topK: 30,
      agentId: this.id,
      minScore: 0.3,
    });

    const stubAnalysis = analyzePerformance({});

    const prompt = PERFORMANCE_TEMPLATE
      .replace('{latencyMetrics}', JSON.stringify(metricsData.map((m) => m.entry.content).slice(0, 10)))
      .replace('{containerHealth}', 'See recent health reports')
      .replace('{errorRate}', 'See threshold breaches')
      .replace('{period}', period);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'performance',
      period,
      analysis: response.content,
      overallScore: stubAnalysis.overallScore,
      bottlenecks: stubAnalysis.bottlenecks,
      dataPointsAnalyzed: metricsData.length,
      tokensUsed: response.totalTokens,
    };

    // Publish PerformanceAlert if score is low
    if (stubAnalysis.overallScore < 70) {
      await eventBus.publish('PerformanceAlert', this.id, {
        score: stubAnalysis.overallScore,
        bottlenecks: stubAnalysis.bottlenecks,
      });
    }

    return report;
  }

  private async handleTokenOptimization(): Promise<Record<string, unknown>> {
    const optimization = optimizeTokenUsage();

    const prompt = TOKEN_OPTIMIZATION_TEMPLATE
      .replace('{byAgent}', JSON.stringify(optimization.optimizations.map((o) => o.agent)))
      .replace('{byModel}', 'claude-sonnet (primary), claude-opus (advanced)')
      .replace('{budget}', '10,000,000 tokens/month')
      .replace('{budgetPercent}', String(optimization.budgetPercent));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'token-optimization',
      currentBurn: optimization.currentBurn,
      projectedMonthly: optimization.projectedMonthly,
      budgetPercent: optimization.budgetPercent,
      optimizations: optimization.optimizations,
      llmRecommendations: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('OptimizationProposed', this.id, report);
    return report;
  }

  private async handleInfraAssessment(task: AgentTask): Promise<Record<string, unknown>> {
    const containers = (task.payload['containers'] as Record<string, unknown>[]) ?? [];
    const dbSizeMb = (task.payload['dbSizeMb'] as number) ?? 0;
    const redisMemoryMb = (task.payload['redisMemoryMb'] as number) ?? 0;

    const assessment = assessInfrastructure(containers, dbSizeMb, redisMemoryMb);

    const report = {
      action: 'infra-assessment',
      ...assessment,
    };

    if (assessment.upgradeNeeded.length > 0) {
      await eventBus.publish('InfraUpgradeNeeded', this.id, {
        upgradeNeeded: assessment.upgradeNeeded,
        estimatedCost: assessment.estimatedCost,
      });
    }

    return report;
  }

  private async handleAvatarAudit(task: AgentTask): Promise<Record<string, unknown>> {
    const cacheStats = (task.payload['cacheStats'] as Record<string, unknown>) ?? {};
    const audit = auditAvatarPipeline(cacheStats);

    return {
      action: 'avatar-audit',
      ...audit,
    };
  }
}
