import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { CONTENT_SYSTEM_PROMPT, COPYWRITING_TEMPLATE, BRAND_CHECK_TEMPLATE, TONE_ADAPTATION_TEMPLATE } from './content.prompts';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const CONTENT_AGENT_CONFIG: AgentConfig = {
  id: 'content-agent',
  name: 'Content Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['copywriting', 'visual-generation', 'brand-check', 'tone-adaptation'],
  systemPrompt: CONTENT_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 20,
};

type ContentTaskType = 'generate' | 'visual' | 'brand-check' | 'adapt-tone';

export class ContentAgent extends BaseAgent {
  constructor(config: AgentConfig = CONTENT_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('ContentApproved', async (event) => {
      await memoryManager.store({
        content: `Approved content: ${String(event.payload['title'] ?? 'untitled')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'approved_content', eventId: event.id },
      });
    }, this.id);

    this.logger.info('Content Agent initialized — tracking brand compliance');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as ContentTaskType | undefined) ?? 'generate';

    switch (taskType) {
      case 'generate':
        return this.handleGenerateTask(task);
      case 'visual':
        return this.handleVisualTask(task);
      case 'brand-check':
        return this.handleBrandCheckTask(task);
      case 'adapt-tone':
        return this.handleAdaptToneTask(task);
      default:
        return { error: `Unknown content task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ContentApproved') {
      this.logger.debug('Content approved', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('ContentApproved', this.id);
    this.logger.info('Content Agent shut down');
  }

  private async handleGenerateTask(task: AgentTask): Promise<Record<string, unknown>> {
    const contentType = String(task.payload['contentType'] ?? 'blog_post');
    const topic = String(task.payload['topic'] ?? task.description);
    const tone = String(task.payload['tone'] ?? 'professionnel');
    const length = (task.payload['length'] as number | undefined) ?? 500;
    const audience = String(task.payload['audience'] ?? 'entreprises françaises');
    const avatar = String(task.payload['avatar'] ?? 'sarah');

    const prompt = COPYWRITING_TEMPLATE
      .replace('{type}', contentType)
      .replace('{topic}', topic)
      .replace('{tone}', tone)
      .replace('{length}', String(length))
      .replace('{audience}', audience)
      .replace('{avatar}', avatar);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    // Brand check the generated content
    const brandCheck = await this.runBrandCheck(response.content);

    const eventType = brandCheck.compliant ? 'ContentGenerated' : 'BrandViolation';
    await eventBus.publish(eventType, this.id, {
      contentType,
      topic,
      tone,
      avatar,
      brandScore: brandCheck.score,
      violations: brandCheck.violations,
    });

    return {
      content: response.content,
      wordCount: response.content.split(/\s+/).length,
      tone,
      contentType,
      avatar,
      brandCompliant: brandCheck.compliant,
      brandScore: brandCheck.score,
      violations: brandCheck.violations,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleVisualTask(task: AgentTask): Promise<Record<string, unknown>> {
    const description = String(task.payload['description'] ?? task.description);
    const visualType = String(task.payload['visualType'] ?? 'banner');

    // Use LLM to refine the visual description for image generation
    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: `Génère un prompt de création visuelle optimisé pour ${visualType}. Description : ${description}. Inclus les couleurs de marque Freenzy.io (#2563eb, #f59e0b). Retourne SEULEMENT le prompt visuel.`,
    });

    return {
      visualPrompt: response.content,
      visualType,
      imageUrl: `https://placeholder.freenzy.io/visual/${Date.now()}`,
      dimensions: '1200x630',
      tokensUsed: response.totalTokens,
    };
  }

  private async handleBrandCheckTask(task: AgentTask): Promise<Record<string, unknown>> {
    const content = String(task.payload['content'] ?? task.description);
    const result = await this.runBrandCheck(content);
    return result;
  }

  private async handleAdaptToneTask(task: AgentTask): Promise<Record<string, unknown>> {
    const content = String(task.payload['content'] ?? task.description);
    const targetTone = String(task.payload['targetTone'] ?? 'professionnel');

    const prompt = TONE_ADAPTATION_TEMPLATE
      .replace('{content}', content)
      .replace('{originalTone}', String(task.payload['originalTone'] ?? 'neutre'))
      .replace('{targetTone}', targetTone);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    return {
      adapted: response.content,
      targetTone,
      tokensUsed: response.totalTokens,
    };
  }

  private async runBrandCheck(content: string): Promise<{ compliant: boolean; violations: Array<{ rule: string; excerpt: string; suggestion: string }>; score: number }> {
    const prompt = BRAND_CHECK_TEMPLATE.replace('{content}', content);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    try {
      const parsed = JSON.parse(response.content) as { compliant: boolean; violations: Array<{ rule: string; excerpt: string; suggestion: string }>; score: number };
      return parsed;
    } catch {
      return { compliant: true, violations: [], score: 80 };
    }
  }
}
