import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { COMMUNICATION_SYSTEM_PROMPT, EMAIL_TEMPLATE, SLACK_TEMPLATE, TRANSLATION_TEMPLATE, PARSE_TEMPLATE } from './communication.prompts';
import { sendEmail, postSlack } from './communication.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const COMMUNICATION_AGENT_CONFIG: AgentConfig = {
  id: 'communication-agent',
  name: 'Communication Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: ['email', 'slack', 'translate', 'parse-message'],
  systemPrompt: COMMUNICATION_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

type CommunicationTaskType = 'email' | 'slack' | 'translate' | 'parse';

export class CommunicationAgent extends BaseAgent {
  constructor(config: AgentConfig = COMMUNICATION_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('DirectiveIssued', async (event) => {
      await this.handleDirective(event);
    }, this.id);

    eventBus.subscribe('MessageReceived', async (event) => {
      await this.handleIncomingMessage(event);
    }, this.id);

    this.logger.info('Communication Agent initialized — listening for directives and messages');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as CommunicationTaskType | undefined) ?? 'parse';

    switch (taskType) {
      case 'email':
        return this.handleEmailTask(task);
      case 'slack':
        return this.handleSlackTask(task);
      case 'translate':
        return this.handleTranslateTask(task);
      case 'parse':
        return this.handleParseTask(task);
      default:
        return { error: `Unknown communication task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'DirectiveIssued':
        await this.handleDirective(event);
        break;
      case 'MessageReceived':
        await this.handleIncomingMessage(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('DirectiveIssued', this.id);
    eventBus.unsubscribe('MessageReceived', this.id);
    this.logger.info('Communication Agent shut down');
  }

  private async handleEmailTask(task: AgentTask): Promise<Record<string, unknown>> {
    const to = String(task.payload['to'] ?? '');
    const subject = String(task.payload['subject'] ?? '');
    const context = String(task.payload['context'] ?? task.description);
    const tone = String(task.payload['tone'] ?? 'professionnel');

    const prompt = EMAIL_TEMPLATE
      .replace('{to}', to)
      .replace('{subject}', subject)
      .replace('{context}', context)
      .replace('{tone}', tone);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = await sendEmail(to, subject, response.content);

    await eventBus.publish('MessageSent', this.id, {
      channel: 'email',
      to,
      subject,
      messageId: result.messageId,
    });

    return { ...result, content: response.content, tokensUsed: response.totalTokens };
  }

  private async handleSlackTask(task: AgentTask): Promise<Record<string, unknown>> {
    const channel = String(task.payload['channel'] ?? '#general');
    const context = String(task.payload['context'] ?? task.description);
    const tone = String(task.payload['tone'] ?? 'cordial');
    const thread = task.payload['thread'] as string | undefined;

    const prompt = SLACK_TEMPLATE
      .replace('{channel}', channel)
      .replace('{context}', context)
      .replace('{tone}', tone);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = await postSlack(channel, response.content, thread);

    await eventBus.publish('MessageSent', this.id, {
      channel: 'slack',
      slackChannel: channel,
      messageTs: result.messageTs,
    });

    return { ...result, content: response.content, tokensUsed: response.totalTokens };
  }

  private async handleTranslateTask(task: AgentTask): Promise<Record<string, unknown>> {
    const text = String(task.payload['text'] ?? task.description);
    const sourceLanguage = String(task.payload['from'] ?? 'en');
    const targetLanguage = String(task.payload['to'] ?? 'fr');

    const prompt = TRANSLATION_TEMPLATE
      .replace('{text}', text)
      .replace('{sourceLanguage}', sourceLanguage);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Translation [${sourceLanguage}→${targetLanguage}]: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'translation', sourceLanguage, targetLanguage },
    });

    await eventBus.publish('TranslationCompleted', this.id, {
      sourceLanguage,
      targetLanguage,
      originalLength: text.length,
      translatedLength: response.content.length,
    });

    return {
      translated: response.content,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleParseTask(task: AgentTask): Promise<Record<string, unknown>> {
    const rawMessage = String(task.payload['message'] ?? task.description);

    const prompt = PARSE_TEMPLATE.replace('{rawMessage}', rawMessage);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    try {
      const parsed = JSON.parse(response.content) as Record<string, unknown>;
      return { ...parsed, tokensUsed: response.totalTokens };
    } catch {
      return {
        rawAnalysis: response.content,
        parseError: 'LLM response was not valid JSON',
        tokensUsed: response.totalTokens,
      };
    }
  }

  private async handleDirective(event: SystemEvent): Promise<void> {
    const directive = String(event.payload['directive'] ?? '');
    if (!directive) return;

    this.logger.info('Auto-translating founder directive');

    const prompt = TRANSLATION_TEMPLATE
      .replace('{text}', directive)
      .replace('{sourceLanguage}', 'anglais/hébreu');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await eventBus.publish('TranslationCompleted', this.id, {
      sourceEvent: event.id,
      translated: response.content,
      type: 'directive',
    });
  }

  private async handleIncomingMessage(event: SystemEvent): Promise<void> {
    const message = String(event.payload['message'] ?? '');
    if (!message) return;

    const prompt = PARSE_TEMPLATE.replace('{rawMessage}', message);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    await memoryManager.store({
      content: `Parsed message: ${response.content}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'parsed_message', sourceEvent: event.id },
    });
  }
}
