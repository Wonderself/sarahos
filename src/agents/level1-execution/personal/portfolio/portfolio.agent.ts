import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  PORTFOLIO_SYSTEM_PROMPT,
  LINKEDIN_OPTIMIZE_TEMPLATE,
  CONTENT_GENERATE_TEMPLATE,
  CALENDAR_TEMPLATE,
  BRAND_STRATEGY_TEMPLATE,
} from './portfolio.prompts';
import { formatLinkedInPost, generateEditorialCalendar } from './portfolio.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type { PortfolioTaskType, LinkedInPost } from './portfolio.types';

export const PORTFOLIO_AGENT_CONFIG: AgentConfig = {
  id: 'portfolio-agent',
  name: 'Portfolio Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['linkedin-optimization', 'content-generation', 'editorial-calendar', 'personal-branding'],
  systemPrompt: PORTFOLIO_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 20,
};

export class PortfolioAgent extends BaseAgent {
  constructor(config: AgentConfig = PORTFOLIO_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('BrandingRequested', async (event) => {
      await this.handleBrandingRequest(event);
    }, this.id);

    eventBus.subscribe('ContentRequested', async (event) => {
      await this.handleContentRequest(event);
    }, this.id);

    this.logger.info('Portfolio Agent initialized — listening for branding and content requests');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as PortfolioTaskType | undefined) ?? 'content';

    switch (taskType) {
      case 'linkedin':
        return this.handleLinkedInTask(task);
      case 'content':
        return this.handleContentTask(task);
      case 'calendar':
        return this.handleCalendarTask(task);
      case 'brand':
        return this.handleBrandTask(task);
      default:
        return { error: `Unknown portfolio task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'BrandingRequested':
        await this.handleBrandingRequest(event);
        break;
      case 'ContentRequested':
        await this.handleContentRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('BrandingRequested', this.id);
    eventBus.unsubscribe('ContentRequested', this.id);
    this.logger.info('Portfolio Agent shut down');
  }

  private async handleLinkedInTask(task: AgentTask): Promise<Record<string, unknown>> {
    const name = String(task.payload['name'] ?? '');
    const currentRole = String(task.payload['currentRole'] ?? '');
    const industry = String(task.payload['industry'] ?? '');
    const goal = String(task.payload['goal'] ?? 'Augmenter la visibilite professionnelle');
    const context = String(task.payload['context'] ?? task.description);

    const prompt = LINKEDIN_OPTIMIZE_TEMPLATE
      .replace('{name}', name)
      .replace('{currentRole}', currentRole)
      .replace('{industry}', industry)
      .replace('{goal}', goal)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `LinkedIn profile optimization for ${name}: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'linkedin_optimization', name, industry },
    });

    await eventBus.publish('ProfileOptimized', this.id, {
      name,
      industry,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return { rawAnalysis: response.content, tokensUsed: response.totalTokens };
    }
  }

  private async handleContentTask(task: AgentTask): Promise<Record<string, unknown>> {
    const topic = String(task.payload['topic'] ?? task.description);
    const tone = String(task.payload['tone'] ?? 'professionnel et engageant');
    const audience = String(task.payload['audience'] ?? 'professionnels');
    const objective = String(task.payload['objective'] ?? 'engagement');
    const context = String(task.payload['context'] ?? '');

    const prompt = CONTENT_GENERATE_TEMPLATE
      .replace('{topic}', topic)
      .replace('{tone}', tone)
      .replace('{audience}', audience)
      .replace('{objective}', objective)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    try {
      const parsed = JSON.parse(response.content) as LinkedInPost;
      const formattedPost = formatLinkedInPost(parsed);

      await eventBus.publish('ContentGenerated', this.id, {
        topic,
        format: 'linkedin_post',
        taskId: task.id,
      });

      return {
        ...parsed,
        formattedPost,
        tokensUsed: response.totalTokens,
      };
    } catch {
      return {
        rawContent: response.content,
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleCalendarTask(task: AgentTask): Promise<Record<string, unknown>> {
    const month = String(task.payload['month'] ?? new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
    const industry = String(task.payload['industry'] ?? '');
    const goals = String(task.payload['goals'] ?? 'visibilite et engagement');
    const pillars = String(task.payload['pillars'] ?? '');
    const frequency = String(task.payload['frequency'] ?? '3 posts par semaine');
    const context = String(task.payload['context'] ?? task.description);

    // Generate skeleton calendar first
    const skeleton = generateEditorialCalendar(month, goals);

    const prompt = CALENDAR_TEMPLATE
      .replace('{month}', month)
      .replace('{industry}', industry)
      .replace('{goals}', goals)
      .replace('{pillars}', pillars)
      .replace('{frequency}', frequency)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Editorial calendar for ${month}: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'editorial_calendar', month, industry },
    });

    await eventBus.publish('CalendarGenerated', this.id, {
      month,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, skeleton, tokensUsed: response.totalTokens };
    } catch {
      return {
        rawCalendar: response.content,
        skeleton,
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleBrandTask(task: AgentTask): Promise<Record<string, unknown>> {
    const profile = String(task.payload['profile'] ?? '');
    const industry = String(task.payload['industry'] ?? '');
    const goals = String(task.payload['goals'] ?? '');
    const values = String(task.payload['values'] ?? '');
    const strengths = String(task.payload['strengths'] ?? '');
    const audience = String(task.payload['audience'] ?? '');
    const context = String(task.payload['context'] ?? task.description);

    const prompt = BRAND_STRATEGY_TEMPLATE
      .replace('{profile}', profile)
      .replace('{industry}', industry)
      .replace('{goals}', goals)
      .replace('{values}', values)
      .replace('{strengths}', strengths)
      .replace('{audience}', audience)
      .replace('{context}', context);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Brand strategy for ${profile}: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'brand_strategy', profile, industry },
    });

    await eventBus.publish('BrandStrategyCreated', this.id, {
      profile,
      industry,
      taskId: task.id,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return {
        rawStrategy: response.content,
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleBrandingRequest(event: SystemEvent): Promise<void> {
    const profile = String(event.payload['profile'] ?? '');
    if (!profile) return;

    this.logger.info('Handling branding request from event', { profile });

    const prompt = BRAND_STRATEGY_TEMPLATE
      .replace('{profile}', profile)
      .replace('{industry}', String(event.payload['industry'] ?? ''))
      .replace('{goals}', String(event.payload['goals'] ?? ''))
      .replace('{values}', String(event.payload['values'] ?? ''))
      .replace('{strengths}', String(event.payload['strengths'] ?? ''))
      .replace('{audience}', String(event.payload['audience'] ?? ''))
      .replace('{context}', 'Event-triggered branding request');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Event-triggered brand strategy: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'brand_strategy', sourceEvent: event.id },
    });
  }

  private async handleContentRequest(event: SystemEvent): Promise<void> {
    const topic = String(event.payload['topic'] ?? '');
    if (!topic) return;

    this.logger.info('Handling content request from event', { topic });

    const prompt = CONTENT_GENERATE_TEMPLATE
      .replace('{topic}', topic)
      .replace('{tone}', String(event.payload['tone'] ?? 'professionnel'))
      .replace('{audience}', String(event.payload['audience'] ?? 'professionnels'))
      .replace('{objective}', String(event.payload['objective'] ?? 'engagement'))
      .replace('{context}', 'Event-triggered content request');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Event-triggered content: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'content_generation', sourceEvent: event.id, topic },
    });
  }
}
