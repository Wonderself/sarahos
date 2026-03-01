import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { taskScheduler } from '../../../core/orchestrator/task-scheduler';
import { GROWTH_MANAGER_SYSTEM_PROMPT, ENGAGEMENT_ANALYSIS_TEMPLATE, CAMPAIGN_TEMPLATE, AB_TEST_TEMPLATE } from './growth-manager.prompts';
import { analyzeEngagement, proposeCampaign, designABTest, analyzeMarket, detectOpportunity } from './growth-manager.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const GROWTH_MANAGER_CONFIG: AgentConfig = {
  id: 'growth-manager',
  name: 'Growth Manager',
  level: 2,
  modelTier: 'standard',
  capabilities: ['engagement-analysis', 'campaign-strategy', 'ab-testing', 'market-analysis', 'opportunity-detection'],
  systemPrompt: GROWTH_MANAGER_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 15,
};

type GrowthTaskType = 'analyze-engagement' | 'campaign' | 'ab-test' | 'market-analysis' | 'detect-opportunities';

export class GrowthManager extends BaseAgent {
  constructor(config: AgentConfig = GROWTH_MANAGER_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('EngagementReport', async (event) => {
      await memoryManager.store({
        content: `EngagementReport: platform=${String(event.payload['platform'])} metrics=${JSON.stringify(event.payload['metrics'] ?? {})}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'engagement_data', platform: event.payload['platform'] },
      });
    }, this.id);

    eventBus.subscribe('PostPublished', async (event) => {
      await memoryManager.store({
        content: `PostPublished: platform=${String(event.payload['platform'])} postId=${String(event.payload['postId'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'post_published', platform: event.payload['platform'] },
      });
    }, this.id);

    eventBus.subscribe('ViralAlert', async (event) => {
      this.logger.info('Viral alert — analyzing for amplification', { eventId: event.id });
      await this.handleViralOpportunity(event);
    }, this.id);

    eventBus.subscribe('ContentGenerated', async (event) => {
      this.logger.debug('New content available for growth tracking', { eventId: event.id });
    }, this.id);

    this.logger.info('Growth Manager initialized — tracking growth metrics');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as GrowthTaskType | undefined) ?? 'analyze-engagement';

    switch (taskType) {
      case 'analyze-engagement':
        return this.handleEngagementAnalysis(task);
      case 'campaign':
        return this.handleCampaign(task);
      case 'ab-test':
        return this.handleABTest(task);
      case 'market-analysis':
        return this.handleMarketAnalysis(task);
      case 'detect-opportunities':
        return this.handleOpportunityDetection(task);
      default:
        return { error: `Unknown growth task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ViralAlert') {
      this.logger.debug('Viral signal received', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('EngagementReport', this.id);
    eventBus.unsubscribe('PostPublished', this.id);
    eventBus.unsubscribe('ViralAlert', this.id);
    eventBus.unsubscribe('ContentGenerated', this.id);
    this.logger.info('Growth Manager shut down');
  }

  private async handleEngagementAnalysis(task: AgentTask): Promise<Record<string, unknown>> {
    const period = String(task.payload['period'] ?? 'last_7_days');

    // Gather engagement data from memory
    const engagementData = await memoryManager.search({
      query: 'EngagementReport engagement metrics',
      topK: 50,
      agentId: this.id,
      minScore: 0.3,
    });

    const stubAnalysis = analyzeEngagement(
      engagementData.map((d) => d.entry.metadata),
      period,
    );

    const prompt = ENGAGEMENT_ANALYSIS_TEMPLATE
      .replace('{period}', period)
      .replace('{metrics}', JSON.stringify(stubAnalysis.platformBreakdown))
      .replace('{recentPosts}', String(engagementData.length));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'analyze-engagement',
      period,
      analysis: response.content,
      dataPointsAnalyzed: engagementData.length,
      stubMetrics: stubAnalysis,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('GrowthReport', this.id, report);
    return report;
  }

  private async handleCampaign(task: AgentTask): Promise<Record<string, unknown>> {
    const topic = String(task.payload['topic'] ?? task.description);
    const platforms = (task.payload['platforms'] as string[]) ?? ['linkedin', 'x'];
    const budget = task.payload['budget'] as number | undefined;
    const avatar = String(task.payload['avatar'] ?? 'sarah');
    const duration = String(task.payload['duration'] ?? '2 weeks');

    const prompt = CAMPAIGN_TEMPLATE
      .replace('{topic}', topic)
      .replace('{platforms}', platforms.join(', '))
      .replace('{budget}', budget ? `${budget}€` : 'organic')
      .replace('{duration}', duration)
      .replace('{avatar}', avatar);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Enqueue content generation tasks
    taskScheduler.enqueue({
      id: `${task.id}-content`,
      title: `Generate campaign content: ${topic}`,
      description: `Generate content for ${platforms.join(', ')} campaign about ${topic}`,
      priority: task.priority,
      payload: { taskType: 'generate', contentType: 'social_campaign', topic, avatar },
      assignedBy: this.id,
      correlationId: task.correlationId,
    });

    const stubCampaign = proposeCampaign(topic, platforms, budget);

    const result = {
      action: 'campaign',
      topic,
      platforms,
      avatar,
      campaignPlan: response.content,
      contentTaskEnqueued: true,
      stubProposal: stubCampaign,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('GrowthReport', this.id, { type: 'campaign', ...result });
    return result;
  }

  private async handleABTest(task: AgentTask): Promise<Record<string, unknown>> {
    const hypothesis = String(task.payload['hypothesis'] ?? '');
    const variable = String(task.payload['variable'] ?? '');
    const successMetric = String(task.payload['successMetric'] ?? 'engagement_rate');
    const variants = (task.payload['variants'] as string[]) ?? ['control', 'variant'];

    const prompt = AB_TEST_TEMPLATE
      .replace('{hypothesis}', hypothesis)
      .replace('{variable}', variable)
      .replace('{successMetric}', successMetric);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const testDesign = designABTest(hypothesis, variants);

    const result = {
      action: 'ab-test',
      ...testDesign,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('ABTestResult', this.id, { status: 'designed', ...result });
    return result;
  }

  private async handleMarketAnalysis(task: AgentTask): Promise<Record<string, unknown>> {
    const industry = String(task.payload['industry'] ?? 'AI SaaS');
    const competitors = (task.payload['competitors'] as string[]) ?? [];

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: `Analyse le marché ${industry}. Concurrents : ${competitors.join(', ') || 'non spécifiés'}. Identifie les tendances, opportunités et menaces.`,
    });

    const stubAnalysis = analyzeMarket(industry, competitors);

    const result = {
      action: 'market-analysis',
      industry,
      competitors,
      analysis: response.content,
      stubData: stubAnalysis,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('MarketAnalysis', this.id, result);
    return result;
  }

  private async handleOpportunityDetection(_task: AgentTask): Promise<Record<string, unknown>> {
    // Scan recent engagement + viral + content events
    const recentData = await memoryManager.search({
      query: 'viral engagement opportunity growth',
      topK: 30,
      agentId: this.id,
      minScore: 0.3,
    });

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: `Analyse ces ${recentData.length} signaux récents et détecte les opportunités de croissance : ${recentData.map((d) => d.entry.content).join(' | ')}`,
    });

    const stubDetection = detectOpportunity({});

    const result = {
      action: 'detect-opportunities',
      signalsAnalyzed: recentData.length,
      analysis: response.content,
      stubOpportunities: stubDetection.opportunities,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('OpportunityDetected', this.id, result);
    return result;
  }

  private async handleViralOpportunity(event: SystemEvent): Promise<void> {
    const platform = String(event.payload['platform'] ?? '');
    const engagementRate = event.payload['engagementRate'] as number ?? 0;

    this.logger.info('Viral content detected — scheduling amplification', { platform, engagementRate });

    // Enqueue cross-posting task
    taskScheduler.enqueue({
      id: `viral-amplify-${event.id}`,
      title: `Amplify viral content from ${platform}`,
      description: `Cross-post viral content (${(engagementRate * 100).toFixed(1)}% engagement) to other platforms`,
      priority: 'HIGH',
      payload: { taskType: 'post', platform: platform === 'linkedin' ? 'x' : 'linkedin', content: String(event.payload['content'] ?? '') },
      assignedBy: this.id,
      correlationId: event.correlationId ?? '',
    });

    await memoryManager.store({
      content: `ViralAlert: platform=${platform} engagementRate=${engagementRate} — amplification scheduled`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'viral_alert', platform, engagementRate },
    });
  }
}
