import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { KNOWLEDGE_SYSTEM_PROMPT } from './knowledge.prompts';
import { vectorSearch, getContext, getHistory, indexDocument } from './knowledge.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const KNOWLEDGE_AGENT_CONFIG: AgentConfig = {
  id: 'knowledge-agent',
  name: 'Knowledge Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['vector-search', 'context-retrieval', 'history', 'document-indexing'],
  systemPrompt: KNOWLEDGE_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 20_000,
  rateLimitPerMinute: 60,
};

type KnowledgeTaskType = 'search' | 'context' | 'history' | 'index';

export class KnowledgeAgent extends BaseAgent {
  constructor(config: AgentConfig = KNOWLEDGE_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('ContextRequest', async (event) => {
      await this.handleContextRequest(event);
    }, this.id);

    this.logger.info('Knowledge Agent initialized — listening for context requests');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as KnowledgeTaskType | undefined) ?? 'search';

    switch (taskType) {
      case 'search':
        return this.handleSearchTask(task);
      case 'context':
        return this.handleContextTask(task);
      case 'history':
        return this.handleHistoryTask(task);
      case 'index':
        return this.handleIndexTask(task);
      default:
        return { error: `Unknown knowledge task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ContextRequest') {
      await this.handleContextRequest(event);
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('ContextRequest', this.id);
    this.logger.info('Knowledge Agent shut down');
  }

  private async handleSearchTask(task: AgentTask): Promise<Record<string, unknown>> {
    const query = String(task.payload['query'] ?? task.description);
    const topK = (task.payload['topK'] as number | undefined) ?? 5;
    const source = task.payload['source'] as string | undefined;

    const results = await vectorSearch(query, { topK, source });

    if (results.totalFound === 0) {
      // Try refining the query via LLM
      const response = await LLMRouter.route({
        agentId: this.id,
        agentName: this.name,
        modelTier: this.modelTier,
        systemPrompt: this.systemPrompt,
        userMessage: `La recherche pour "${query}" n'a retourné aucun résultat. Propose une reformulation de la requête pour trouver des résultats pertinents. Retourne SEULEMENT la requête reformulée, sans explication.`,
      });

      const refinedResults = await vectorSearch(response.content.trim(), { topK, source });

      if (refinedResults.totalFound === 0) {
        await eventBus.publish('KnowledgeNotFound', this.id, { query, refined: response.content });
        return { ...refinedResults, queryRefined: response.content, originalQuery: query };
      }

      return { ...refinedResults, queryRefined: response.content, originalQuery: query };
    }

    return { ...results };
  }

  private async handleContextTask(task: AgentTask): Promise<Record<string, unknown>> {
    const topic = String(task.payload['topic'] ?? task.description);
    const agentId = task.payload['agentId'] as string | undefined;

    const result = await getContext(topic, agentId);

    const eventType = result.context.length > 0 ? 'ContextRetrieved' : 'KnowledgeNotFound';
    await eventBus.publish(eventType, this.id, {
      topic,
      resultCount: result.sources.length,
      relevanceScore: result.relevanceScore,
    });

    return { ...result };
  }

  private async handleHistoryTask(task: AgentTask): Promise<Record<string, unknown>> {
    const entityId = String(task.payload['entityId'] ?? '');
    const type = task.payload['type'] as string | undefined;

    const result = await getHistory(entityId, type);
    return { ...result, entityId };
  }

  private async handleIndexTask(task: AgentTask): Promise<Record<string, unknown>> {
    const content = String(task.payload['content'] ?? task.description);
    const metadata = (task.payload['metadata'] as Record<string, unknown>) ?? {};
    const source = String(task.payload['source'] ?? this.name);

    const result = await indexDocument(content, metadata, source);

    await eventBus.publish('DataIngested', this.id, {
      documentId: result.documentId,
      source,
      chunksCreated: result.chunksCreated,
    });

    return { ...result };
  }

  private async handleContextRequest(event: SystemEvent): Promise<void> {
    const topic = String(event.payload['topic'] ?? '');
    if (!topic) return;

    const result = await getContext(topic, event.sourceAgent);

    const eventType = result.context.length > 0 ? 'ContextRetrieved' : 'KnowledgeNotFound';
    await eventBus.publish(eventType, this.id, {
      requestEvent: event.id,
      topic,
      context: result.context,
      sources: result.sources,
      relevanceScore: result.relevanceScore,
    }, event.sourceAgent);
  }
}
