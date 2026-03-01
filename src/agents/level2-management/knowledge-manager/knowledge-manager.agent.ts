import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { taskScheduler } from '../../../core/orchestrator/task-scheduler';
import { KNOWLEDGE_MANAGER_SYSTEM_PROMPT, AUDIT_TEMPLATE, GAP_ANALYSIS_TEMPLATE, INDEXING_STRATEGY_TEMPLATE } from './knowledge-manager.prompts';
import { auditKnowledgeBase, analyzeGaps, assessFreshness, planIndexing, deduplicateEntries } from './knowledge-manager.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const KNOWLEDGE_MANAGER_CONFIG: AgentConfig = {
  id: 'knowledge-manager',
  name: 'Knowledge Manager',
  level: 2,
  modelTier: 'standard',
  capabilities: ['knowledge-audit', 'embedding-management', 'context-freshness', 'gap-analysis', 'indexing-strategy'],
  systemPrompt: KNOWLEDGE_MANAGER_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 20,
};

type KnowledgeMgmtTaskType = 'audit' | 'gap-analysis' | 'freshness-check' | 'indexing-strategy' | 'deduplicate';

export class KnowledgeManager extends BaseAgent {
  constructor(config: AgentConfig = KNOWLEDGE_MANAGER_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('DataIngested', async (event) => {
      this.logger.debug('New data indexed — tracking', { documentId: event.payload['documentId'] });
      await memoryManager.store({
        content: `DataIngested: documentId=${String(event.payload['documentId'])} source=${String(event.payload['source'])} chunks=${String(event.payload['chunksCreated'])}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'indexing_event', documentId: event.payload['documentId'] },
      });
    }, this.id);

    eventBus.subscribe('KnowledgeNotFound', async (event) => {
      this.logger.debug('Knowledge gap detected', { query: event.payload['query'] });
      await memoryManager.store({
        content: `KnowledgeNotFound: query="${String(event.payload['query'])}" refined="${String(event.payload['refined'] ?? '')}"`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'knowledge_gap', query: event.payload['query'] },
      });
    }, this.id);

    eventBus.subscribe('ContextRetrieved', async (event) => {
      this.logger.debug('Context successfully retrieved', { topic: event.payload['topic'] });
    }, this.id);

    eventBus.subscribe('ContentGenerated', async (event) => {
      // Evaluate if generated content should be indexed
      const contentType = String(event.payload['contentType'] ?? '');
      if (['blog_post', 'documentation', 'knowledge_base'].includes(contentType)) {
        this.logger.info('Content suitable for indexing detected', { contentType });
        taskScheduler.enqueue({
          id: `auto-index-${event.id}`,
          title: `Auto-index generated ${contentType}`,
          description: `Index newly generated ${contentType} content into knowledge base`,
          priority: 'LOW',
          payload: {
            taskType: 'index',
            content: event.payload['content'],
            source: `content-agent:${contentType}`,
            metadata: { contentType, autoIndexed: true },
          },
          assignedBy: this.id,
          correlationId: event.correlationId ?? '',
        });
      }
    }, this.id);

    this.logger.info('Knowledge Manager initialized — curating knowledge quality');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as KnowledgeMgmtTaskType | undefined) ?? 'audit';

    switch (taskType) {
      case 'audit':
        return this.handleAudit(task);
      case 'gap-analysis':
        return this.handleGapAnalysis(task);
      case 'freshness-check':
        return this.handleFreshnessCheck(task);
      case 'indexing-strategy':
        return this.handleIndexingStrategy(task);
      case 'deduplicate':
        return this.handleDeduplicate();
      default:
        return { error: `Unknown knowledge management task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'KnowledgeNotFound') {
      this.logger.debug('Knowledge gap tracked for analysis', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('DataIngested', this.id);
    eventBus.unsubscribe('KnowledgeNotFound', this.id);
    eventBus.unsubscribe('ContextRetrieved', this.id);
    eventBus.unsubscribe('ContentGenerated', this.id);
    this.logger.info('Knowledge Manager shut down');
  }

  private async handleAudit(task: AgentTask): Promise<Record<string, unknown>> {
    // Run deduplication first
    const dedupResult = deduplicateEntries();
    const auditResult = auditKnowledgeBase();

    const prompt = AUDIT_TEMPLATE
      .replace('{stats}', JSON.stringify(auditResult))
      .replace('{lastAudit}', String(task.payload['lastAudit'] ?? 'never'))
      .replace('{domains}', JSON.stringify(['communication', 'content', 'scheduling', 'social-media', 'monitoring', 'knowledge']));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const report = {
      action: 'audit',
      ...auditResult,
      deduplication: dedupResult,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('KnowledgeAuditComplete', this.id, report);
    return report;
  }

  private async handleGapAnalysis(task: AgentTask): Promise<Record<string, unknown>> {
    // Collect KnowledgeNotFound events from memory
    const notFoundEntries = await memoryManager.search({
      query: 'KnowledgeNotFound query',
      topK: 50,
      agentId: this.id,
      minScore: 0.3,
    });

    const queries: string[] = notFoundEntries.map((e) => {
      const match = e.entry.content.match(/query="([^"]+)"/);
      return match?.[1] ?? e.entry.content;
    });

    const gapResult = analyzeGaps(queries);

    const prompt = GAP_ANALYSIS_TEMPLATE
      .replace('{notFoundQueries}', queries.slice(0, 20).join(', '))
      .replace('{frequencyMap}', JSON.stringify(gapResult.gaps.slice(0, 10)));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Enqueue indexing tasks for high-severity gaps
    for (const gap of gapResult.gaps.filter((g) => g.severity === 'high')) {
      taskScheduler.enqueue({
        id: `gap-fill-${Date.now()}-${gap.topic.replace(/\s+/g, '-')}`,
        title: `Fill knowledge gap: ${gap.topic}`,
        description: `Index content for missing topic: ${gap.topic}`,
        priority: 'MEDIUM',
        payload: { taskType: 'index', content: gap.topic, source: `gap-analysis:${gap.suggestedSource}` },
        assignedBy: this.id,
        correlationId: task.correlationId,
      });
    }

    return {
      action: 'gap-analysis',
      queriesAnalyzed: queries.length,
      gaps: gapResult.gaps,
      prioritizedActions: gapResult.prioritizedActions,
      indexingTasksEnqueued: gapResult.gaps.filter((g) => g.severity === 'high').length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleFreshnessCheck(_task: AgentTask): Promise<Record<string, unknown>> {
    const freshness = assessFreshness();

    const report = {
      action: 'freshness-check',
      ...freshness,
    };

    if (freshness.freshnessScore < 70) {
      await eventBus.publish('EmbeddingsDeprecated', this.id, {
        staleCount: freshness.stale,
        expiredCount: freshness.expired,
        freshnessScore: freshness.freshnessScore,
      });
    }

    return report;
  }

  private async handleIndexingStrategy(task: AgentTask): Promise<Record<string, unknown>> {
    const contentSources = (task.payload['contentSources'] as string[]) ?? ['blog_posts', 'documentation', 'social_media', 'emails'];
    const currentEntries = memoryManager.getCount();
    const targetEntries = (task.payload['targetEntries'] as number) ?? 10000;

    const plan = planIndexing(contentSources);

    const prompt = INDEXING_STRATEGY_TEMPLATE
      .replace('{contentSources}', contentSources.join(', '))
      .replace('{currentEntries}', String(currentEntries))
      .replace('{targetEntries}', String(targetEntries));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    return {
      action: 'indexing-strategy',
      strategy: plan.strategy,
      estimatedEntries: plan.estimatedEntries,
      currentEntries,
      targetEntries,
      llmRecommendations: response.content,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleDeduplicate(): Promise<Record<string, unknown>> {
    const result = deduplicateEntries();

    return {
      action: 'deduplicate',
      ...result,
    };
  }
}
