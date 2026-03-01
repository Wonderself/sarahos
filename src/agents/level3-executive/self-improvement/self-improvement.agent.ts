import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { stateManager } from '../../../core/state/state-manager';
import {
  SELF_IMPROVEMENT_SYSTEM_PROMPT,
  OPTIMIZATION_ANALYSIS_TEMPLATE,
  CODE_IMPROVEMENT_TEMPLATE,
  IMPROVEMENT_CYCLE_TEMPLATE,
} from './self-improvement.prompts';
import { identifyOptimizations, proposeCodeImprovement, runImprovementCycle, calculateMetricsDelta } from './self-improvement.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const SELF_IMPROVEMENT_CONFIG: AgentConfig = {
  id: 'self-improvement-agent',
  name: 'Self-Improvement Agent',
  level: 3,
  modelTier: 'advanced',
  capabilities: [
    'performance-optimization',
    'code-improvement',
    'process-refinement',
    'metrics-tracking',
    'system-evolution',
  ],
  systemPrompt: SELF_IMPROVEMENT_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 120_000,
  rateLimitPerMinute: 8,
};

type SelfImprovementTaskType = 'optimize' | 'code-review' | 'improvement-cycle' | 'metrics-review';

export class SelfImprovementAgent extends BaseAgent {
  constructor(config: AgentConfig = SELF_IMPROVEMENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('TechDebtReport', async (event) => {
      this.logger.info('Tech debt report received for improvement analysis', { score: event.payload['totalDebtScore'] });
      await memoryManager.store({
        content: `TechDebtReport: score=${String(event.payload['totalDebtScore'])} items=${JSON.stringify(event.payload['debtItems']).slice(0, 300)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'tech_debt', score: event.payload['totalDebtScore'] },
      });
    }, this.id);

    eventBus.subscribe('PerformanceAlert', async (event) => {
      this.logger.warn('Performance alert — evaluating for optimization', { score: event.payload['score'] });
      await memoryManager.store({
        content: `PerformanceAlert: score=${String(event.payload['score'])} bottlenecks=${JSON.stringify(event.payload['bottlenecks']).slice(0, 300)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'performance_alert', score: event.payload['score'] },
      });
    }, this.id);

    eventBus.subscribe('OptimizationProposed', async (event) => {
      await memoryManager.store({
        content: `OptimizationProposed: burn=${String(event.payload['currentBurn'] ?? '')} projected=${String(event.payload['projectedMonthly'] ?? '')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'token_optimization' },
      });
    }, this.id);

    eventBus.subscribe('OperationReport', async (event) => {
      await memoryManager.store({
        content: `OperationReport: failures=${String(event.payload['recentFailures'] ?? 0)} summary=${String(event.payload['summary'] ?? '').slice(0, 200)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'operation_report' },
      });
    }, this.id);

    eventBus.subscribe('KnowledgeAuditComplete', async (event) => {
      await memoryManager.store({
        content: `KnowledgeAudit: coverage=${String(event.payload['coverageScore'])} quality=${String(event.payload['qualityScore'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'knowledge_audit' },
      });
    }, this.id);

    this.logger.info('Self-Improvement Agent initialized — continuous improvement active');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as SelfImprovementTaskType | undefined) ?? 'optimize';

    switch (taskType) {
      case 'optimize':
        return this.handleOptimize();
      case 'code-review':
        return this.handleCodeReview(task);
      case 'improvement-cycle':
        return this.handleImprovementCycle();
      case 'metrics-review':
        return this.handleMetricsReview();
      default:
        return { error: `Unknown self-improvement task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'PerformanceAlert') {
      this.logger.warn('Performance alert tracked for optimization', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('TechDebtReport', this.id);
    eventBus.unsubscribe('PerformanceAlert', this.id);
    eventBus.unsubscribe('OptimizationProposed', this.id);
    eventBus.unsubscribe('OperationReport', this.id);
    eventBus.unsubscribe('KnowledgeAuditComplete', this.id);
    this.logger.info('Self-Improvement Agent shut down');
  }

  private async handleOptimize(): Promise<Record<string, unknown>> {
    const techDebtData = await memoryManager.search({
      query: 'TechDebtReport debt score items',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const perfAlerts = await memoryManager.search({
      query: 'PerformanceAlert bottlenecks score',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const tokenData = await memoryManager.search({
      query: 'OptimizationProposed burn projected',
      topK: 5,
      agentId: this.id,
      minScore: 0.3,
    });

    const opsData = await memoryManager.search({
      query: 'OperationReport failures summary',
      topK: 5,
      agentId: this.id,
      minScore: 0.3,
    });

    const optimizations = identifyOptimizations({}, {});

    const prompt = OPTIMIZATION_ANALYSIS_TEMPLATE
      .replace('{techDebtReport}', techDebtData.map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{performanceAlerts}', perfAlerts.map((r) => r.entry.content).join(' | ') || 'No alerts')
      .replace('{tokenUsage}', tokenData.map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{operationReport}', opsData.map((r) => r.entry.content).join(' | ') || 'No data');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'optimize',
      optimizations,
      dataSourcesAnalyzed: techDebtData.length + perfAlerts.length + tokenData.length + opsData.length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('OptimizationProposed', this.id, result);
    return result;
  }

  private async handleCodeReview(task: AgentTask): Promise<Record<string, unknown>> {
    const issues = (task.payload['issues'] as string[]) ?? [];
    const targetMetrics = (task.payload['targetMetrics'] as Record<string, unknown>) ?? {};

    const improvements = proposeCodeImprovement(issues, targetMetrics);

    const prompt = CODE_IMPROVEMENT_TEMPLATE
      .replace('{issues}', issues.join(', ') || 'General review')
      .replace('{currentMetrics}', JSON.stringify(task.payload['currentMetrics'] ?? {}))
      .replace('{targetMetrics}', JSON.stringify(targetMetrics));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'code-review',
      improvements,
      issuesAnalyzed: issues.length,
      llmProposals: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('CodeSubmitted', this.id, result);
    return result;
  }

  private async handleImprovementCycle(): Promise<Record<string, unknown>> {
    const state = stateManager.getState();
    const lastCycle = state.last_self_improvement_cycle;

    const allReports = await memoryManager.search({
      query: 'TechDebtReport PerformanceAlert OptimizationProposed KnowledgeAudit',
      topK: 30,
      agentId: this.id,
      minScore: 0.2,
    });

    const cycleResult = runImprovementCycle(lastCycle, {});

    const prompt = IMPROVEMENT_CYCLE_TEMPLATE
      .replace('{lastCycle}', lastCycle ?? 'never')
      .replace('{metricsDelta}', 'Calculating from reports')
      .replace('{newAlerts}', allReports.filter((r) => r.entry.content.startsWith('PerformanceAlert')).map((r) => r.entry.content).join(' | ') || 'None')
      .replace('{debtStatus}', allReports.filter((r) => r.entry.content.startsWith('TechDebtReport')).map((r) => r.entry.content).join(' | ') || 'None');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Update state with cycle timestamp
    await stateManager.update((s) => {
      s.last_self_improvement_cycle = new Date().toISOString();
    });

    const result = {
      action: 'improvement-cycle',
      cycle: cycleResult,
      reportsAnalyzed: allReports.length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('AutomationCreated', this.id, result);
    return result;
  }

  private async handleMetricsReview(): Promise<Record<string, unknown>> {
    const delta = calculateMetricsDelta({}, {});

    const result = {
      action: 'metrics-review',
      delta,
    };

    return result;
  }
}
