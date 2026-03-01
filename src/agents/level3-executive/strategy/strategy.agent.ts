import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { humanOverride } from '../../../core/human-override/human-override';
import { memoryManager } from '../../../core/memory/memory-manager';
import {
  STRATEGY_AGENT_SYSTEM_PROMPT,
  STRATEGY_FORMULATION_TEMPLATE,
  PIVOT_ANALYSIS_TEMPLATE,
  GROWTH_PLAN_TEMPLATE,
} from './strategy.prompts';
import { formulateStrategy, performSWOT, evaluatePivot, buildGrowthRoadmap } from './strategy.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const STRATEGY_AGENT_CONFIG: AgentConfig = {
  id: 'strategy-agent',
  name: 'Strategy Agent',
  level: 3,
  modelTier: 'advanced',
  capabilities: [
    'market-strategy',
    'pivot-recommendation',
    'long-term-planning',
    'competitive-analysis',
    'growth-roadmap',
  ],
  systemPrompt: STRATEGY_AGENT_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 120_000,
  rateLimitPerMinute: 8,
};

type StrategyTaskType = 'formulate-strategy' | 'pivot-analysis' | 'growth-plan' | 'competitive-review';

export class StrategyAgent extends BaseAgent {
  constructor(config: AgentConfig = STRATEGY_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('GrowthReport', async (event) => {
      await memoryManager.store({
        content: `GrowthReport: ${JSON.stringify(event.payload).slice(0, 500)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'growth_data' },
      });
    }, this.id);

    eventBus.subscribe('MarketAnalysis', async (event) => {
      this.logger.info('Market analysis received for strategy review', { industry: event.payload['industry'] });
      await memoryManager.store({
        content: `MarketAnalysis: industry=${String(event.payload['industry'] ?? '')} analysis=${String(event.payload['analysis'] ?? '').slice(0, 300)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'market_data' },
      });
    }, this.id);

    eventBus.subscribe('OpportunityDetected', async (event) => {
      this.logger.info('Growth opportunity detected', { signalsAnalyzed: event.payload['signalsAnalyzed'] });
      await memoryManager.store({
        content: `OpportunityDetected: signals=${String(event.payload['signalsAnalyzed'] ?? 0)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'opportunity' },
      });
    }, this.id);

    eventBus.subscribe('ABTestResult', async (event) => {
      await memoryManager.store({
        content: `ABTestResult: testId=${String(event.payload['testId'] ?? '')} status=${String(event.payload['status'] ?? '')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'ab_test' },
      });
    }, this.id);

    eventBus.subscribe('OperationReport', async (event) => {
      await memoryManager.store({
        content: `OperationReport: period=${String(event.payload['period'] ?? '')} summary=${String(event.payload['summary'] ?? '').slice(0, 200)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'operation_data' },
      });
    }, this.id);

    this.logger.info('Strategy Agent initialized — strategic oversight active');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as StrategyTaskType | undefined) ?? 'formulate-strategy';

    switch (taskType) {
      case 'formulate-strategy':
        return this.handleFormulateStrategy(task);
      case 'pivot-analysis':
        return this.handlePivotAnalysis(task);
      case 'growth-plan':
        return this.handleGrowthPlan(task);
      case 'competitive-review':
        return this.handleCompetitiveReview();
      default:
        return { error: `Unknown strategy task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'OpportunityDetected') {
      this.logger.info('Opportunity tracked for strategy analysis', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('GrowthReport', this.id);
    eventBus.unsubscribe('MarketAnalysis', this.id);
    eventBus.unsubscribe('OpportunityDetected', this.id);
    eventBus.unsubscribe('ABTestResult', this.id);
    eventBus.unsubscribe('OperationReport', this.id);
    this.logger.info('Strategy Agent shut down');
  }

  private async handleFormulateStrategy(_task: AgentTask): Promise<Record<string, unknown>> {
    const growthData = await memoryManager.search({
      query: 'GrowthReport engagement growth',
      topK: 15,
      agentId: this.id,
      minScore: 0.3,
    });

    const marketData = await memoryManager.search({
      query: 'MarketAnalysis industry trends',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const opportunities = await memoryManager.search({
      query: 'OpportunityDetected signals',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const operationalData = await memoryManager.search({
      query: 'OperationReport capacity',
      topK: 5,
      agentId: this.id,
      minScore: 0.3,
    });

    const stubStrategy = formulateStrategy({}, {});

    const prompt = STRATEGY_FORMULATION_TEMPLATE
      .replace('{growthData}', growthData.map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{marketAnalysis}', marketData.map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{opportunities}', opportunities.map((r) => r.entry.content).join(' | ') || 'No data')
      .replace('{operationalCapacity}', operationalData.map((r) => r.entry.content).join(' | ') || 'No data');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'formulate-strategy',
      strategy: stubStrategy,
      dataSourcesAnalyzed: growthData.length + marketData.length + opportunities.length + operationalData.length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('StrategyProposal', this.id, result);
    return result;
  }

  private async handlePivotAnalysis(task: AgentTask): Promise<Record<string, unknown>> {
    const abResults = await memoryManager.search({
      query: 'ABTestResult test status',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const pivotStub = evaluatePivot({}, {});

    const prompt = PIVOT_ANALYSIS_TEMPLATE
      .replace('{currentPerformance}', String(task.payload['currentPerformance'] ?? 'No data'))
      .replace('{marketTrends}', String(task.payload['marketTrends'] ?? 'No data'))
      .replace('{abTestResults}', abResults.map((r) => r.entry.content).join(' | ') || 'No A/B tests')
      .replace('{weakSignals}', String(task.payload['weakSignals'] ?? 'None'));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'pivot-analysis',
      pivotAssessment: pivotStub,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('PivotRecommendation', this.id, result);

    // Pivots always require human strategic approval
    await humanOverride.requestApproval(
      'STRATEGIC',
      'Pivot Analysis Complete — Review Required',
      `Pivot recommendation: ${response.content.slice(0, 300)}`,
      this.id,
      { pivotAssessment: pivotStub },
    );

    return result;
  }

  private async handleGrowthPlan(task: AgentTask): Promise<Record<string, unknown>> {
    const horizon = String(task.payload['horizon'] ?? '6_months');
    const targets = (task.payload['targets'] as Record<string, unknown>) ?? {};
    const budget = String(task.payload['budget'] ?? 'not specified');

    const roadmap = buildGrowthRoadmap(horizon, targets);

    const prompt = GROWTH_PLAN_TEMPLATE
      .replace('{horizon}', horizon)
      .replace('{currentState}', String(task.payload['currentState'] ?? 'Phase 4 active'))
      .replace('{targets}', JSON.stringify(targets))
      .replace('{budget}', budget);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'growth-plan',
      horizon,
      roadmap,
      llmPlan: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('StrategyProposal', this.id, result);
    return result;
  }

  private async handleCompetitiveReview(): Promise<Record<string, unknown>> {
    const marketData = await memoryManager.search({
      query: 'MarketAnalysis competition industry',
      topK: 15,
      agentId: this.id,
      minScore: 0.3,
    });

    const swot = performSWOT({ marketData: marketData.map((r) => r.entry.content) });

    const result = {
      action: 'competitive-review',
      swot,
      dataSourcesAnalyzed: marketData.length,
    };

    await memoryManager.store({
      content: `CompetitiveReview: strengths=${swot.strengths.length} weaknesses=${swot.weaknesses.length} score=${swot.overallScore}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'competitive_review', overallScore: swot.overallScore },
    });

    return result;
  }
}
