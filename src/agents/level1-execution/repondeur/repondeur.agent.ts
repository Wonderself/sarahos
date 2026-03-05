// ═══════════════════════════════════════════════════════
// Repondeur Agent — Intelligent Answering Machine
// ═══════════════════════════════════════════════════════

import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { memoryManager } from '../../../core/memory/memory-manager';
import { whatsAppService } from '../../../whatsapp/whatsapp.service';
import {
  REPONDEUR_SYSTEM_PROMPT,
  REPONDEUR_HAIKU_SYSTEM_PROMPT,
  buildModePrompt,
  buildStyleModifier,
  buildSkillFragments,
  CLASSIFICATION_PROMPT,
  SUMMARY_GENERATION_PROMPT,
  sanitizePromptInput,
} from './repondeur.prompts';
import {
  getRepondeurConfig,
  saveRepondeurMessage,
  saveRepondeurOrder,
  getUnsummarizedMessages,
  saveSummary,
  markMessagesSummarized,
  isContactBlocked,
  isContactVip,
  isScheduleActive,
  cleanupExpiredData,
} from './repondeur.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';
import type {
  RepondeurTaskType,
  ProcessMessagePayload,
  GenerateSummaryPayload,
  ClassificationResult,
  GeneratedResponse,
  RepondeurConfig,
} from './repondeur.types';

/** Truncate text at the last word boundary before maxLen */
function truncateAtWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLen * 0.5 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
}

export const REPONDEUR_AGENT_CONFIG: AgentConfig = {
  id: 'repondeur-agent',
  name: 'Repondeur Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: [
    'answering-machine',
    'message-taking',
    'order-capture',
    'summary-generation',
    'vip-detection',
    'faq-answering',
    'complaint-handling',
    'spam-filtering',
  ],
  systemPrompt: REPONDEUR_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 60,
};

export class RepondeurAgent extends BaseAgent {
  constructor(config: AgentConfig = REPONDEUR_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('RepondeurMessageReceived', async (event) => {
      await this.handleIncomingMessage(event);
    }, this.id);

    eventBus.subscribe('RepondeurSummaryRequested', async (event) => {
      await this.handleSummaryRequest(event);
    }, this.id);

    this.logger.info('Repondeur Agent initialized — listening for incoming messages');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as RepondeurTaskType | undefined) ?? 'process_message';

    switch (taskType) {
      case 'process_message':
        return this.processMessage(task);
      case 'generate_summary':
        return this.generateSummary(task);
      case 'send_summary':
        return this.sendSummary(task);
      case 'cleanup_old_data':
        return this.cleanupOldData();
      default:
        return { error: `Unknown repondeur task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'RepondeurMessageReceived':
        await this.handleIncomingMessage(event);
        break;
      case 'RepondeurSummaryRequested':
        await this.handleSummaryRequest(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('RepondeurMessageReceived', this.id);
    eventBus.unsubscribe('RepondeurSummaryRequested', this.id);
    this.logger.info('Repondeur Agent shut down');
  }

  // ── Core Message Processing Pipeline ──

  private async processMessage(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ProcessMessagePayload;
    const config = await getRepondeurConfig(payload.userId);

    if (!config || !config.isActive) {
      return { skipped: true, reason: 'Repondeur not active for this user' };
    }

    // 1. Check if schedule allows responses now
    if (!isScheduleActive(config.schedule)) {
      return { skipped: true, reason: 'Outside active schedule' };
    }

    // 2. Check blocked contacts
    if (isContactBlocked(payload.senderPhone, config.blockedContacts)) {
      await saveRepondeurMessage({
        configId: config.id,
        userId: config.userId,
        senderPhone: payload.senderPhone,
        senderName: payload.senderName,
        direction: 'inbound',
        content: payload.messageContent,
        modeUsed: config.activeMode,
        styleUsed: config.activeStyle,
        classification: 'blocked',
        priority: 'low',
      });
      return { blocked: true, senderPhone: payload.senderPhone };
    }

    // 3. Classify the message (LLM call #1)
    const classification = await this.classifyMessage(
      payload.messageContent,
      payload.senderPhone,
      payload.senderName,
      config,
    );

    // 4. If urgent + realtime summary, alert boss immediately
    if (classification.isUrgent && config.summaryFrequency === 'realtime') {
      await this.sendUrgentAlert(config, payload, classification);
    }

    // 5. Generate contextual response (LLM call #2)
    const generatedResponse = await this.generateResponse(
      payload.messageContent,
      payload.senderPhone,
      payload.senderName,
      classification,
      config,
    );

    // 6. Save inbound message
    const savedMessage = await saveRepondeurMessage({
      configId: config.id,
      userId: config.userId,
      senderPhone: payload.senderPhone,
      senderName: payload.senderName,
      direction: 'inbound',
      content: payload.messageContent,
      modeUsed: config.activeMode,
      styleUsed: config.activeStyle,
      classification: classification.classification,
      priority: classification.priority,
      sentiment: classification.sentiment,
      entitiesExtracted: classification.entities,
      skillsTriggered: classification.skillsToTrigger,
      waMessageId: payload.waMessageId,
    });

    // 7. Save order if order_taking mode captured one
    if (generatedResponse.order && classification.classification === 'order') {
      await saveRepondeurOrder({
        configId: config.id,
        messageId: savedMessage.id,
        customerPhone: payload.senderPhone,
        customerName: payload.senderName,
        orderItems: generatedResponse.order.orderItems ?? [],
        deliveryAddress: generatedResponse.order.deliveryAddress ?? undefined,
        deliveryNotes: generatedResponse.order.deliveryNotes ?? undefined,
      });
    }

    // 8. Save outbound response message
    await saveRepondeurMessage({
      configId: config.id,
      userId: config.userId,
      senderPhone: payload.senderPhone,
      senderName: payload.senderName,
      direction: 'outbound',
      content: generatedResponse.response,
      modeUsed: config.activeMode,
      styleUsed: config.activeStyle,
      classification: classification.classification,
      priority: classification.priority,
    });

    // 8b. Send response via WhatsApp (with retry)
    if (generatedResponse.response && payload.senderPhone) {
      const maxAttempts = 2;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await whatsAppService.sendTextMessage({
            to: payload.senderPhone,
            text: generatedResponse.response,
          });
          break;
        } catch (err) {
          this.logger.error(`WhatsApp send attempt ${attempt}/${maxAttempts} failed`, {
            senderPhone: payload.senderPhone,
            error: err instanceof Error ? err.message : String(err),
          });
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }

    // 9. Store in memory for cross-agent context
    await memoryManager.store({
      content: `Repondeur [${classification.classification}] from ${payload.senderName ?? payload.senderPhone}: ${payload.messageContent.slice(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: {
        type: 'repondeur_message',
        classification: classification.classification,
        priority: classification.priority,
        senderPhone: payload.senderPhone,
      },
    });

    // 10. Publish event for other agents
    await eventBus.publish('RepondeurResponseGenerated', this.id, {
      messageId: savedMessage.id,
      classification: classification.classification,
      priority: classification.priority,
      senderPhone: payload.senderPhone,
      responsePreview: generatedResponse.response.slice(0, 100),
    });

    return {
      response: generatedResponse.response,
      classification,
      messageId: savedMessage.id,
    };
  }

  // ── Classification (LLM call #1) ──

  private async classifyMessage(
    content: string,
    senderPhone: string,
    senderName: string,
    config: RepondeurConfig,
  ): Promise<ClassificationResult> {
    const isVip = isContactVip(senderPhone, config.vipContacts);

    const classificationPrompt = CLASSIFICATION_PROMPT
      .replace('{message}', sanitizePromptInput(content))
      .replace('{senderPhone}', senderPhone)
      .replace('{senderName}', senderName ?? 'Inconnu')
      .replace('{isVip}', String(isVip))
      .replace('{activeMode}', config.activeMode)
      .replace('{activeSkills}', config.activeSkills.join(', '))
      .replace('{faqEntries}', JSON.stringify(config.faqEntries.filter(f => f.isActive).slice(0, 20)));

    // Use Haiku (ultra-fast) for classification — simple JSON output, 19x cheaper than Opus
    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: 'ultra-fast',
      systemPrompt: REPONDEUR_HAIKU_SYSTEM_PROMPT,
      userMessage: classificationPrompt,
      maxTokens: 512,
      enableMemoization: true,
      memoizationTtlSeconds: 120, // 2 min — same message reclassified quickly
    });

    try {
      return JSON.parse(response.content) as ClassificationResult;
    } catch {
      return {
        classification: isVip ? 'vip' : 'general',
        priority: 'normal',
        sentiment: 'neutral',
        entities: {},
        skillsToTrigger: ['message_taking'],
        isUrgent: false,
        isBossMessage: false,
      };
    }
  }

  // ── Response Generation (LLM call #2) ──

  private async generateResponse(
    content: string,
    senderPhone: string,
    senderName: string,
    classification: ClassificationResult,
    config: RepondeurConfig,
  ): Promise<GeneratedResponse> {
    // Build composite prompt from mode + style + skills
    const modePrompt = buildModePrompt(config.activeMode);
    const styleModifier = buildStyleModifier(config.activeStyle);
    const skillFragments = buildSkillFragments(config.activeSkills, config);

    const compositeSystemPrompt = [
      REPONDEUR_SYSTEM_PROMPT,
      '\n\n--- MODE ACTIF ---\n',
      modePrompt,
      '\n\n--- STYLE ---\n',
      styleModifier,
      '\n\n--- COMPETENCES ACTIVES ---\n',
      skillFragments,
      config.customInstructions
        ? `\n\n--- INSTRUCTIONS PERSONNALISEES DU PATRON ---\n${config.customInstructions}`
        : '',
    ].join('');

    const userPrompt = [
      'MESSAGE ENTRANT :',
      `De : ${senderName ?? 'Inconnu'} (${senderPhone})`,
      `Contenu : ${content}`,
      '',
      `CLASSIFICATION : ${JSON.stringify(classification)}`,
      '',
      'CONTEXTE :',
      `- Mode actif : ${config.activeMode}`,
      `- Style : ${config.activeStyle}`,
      `- Langue : ${config.language}`,
      `- Longueur max reponse : ${config.maxResponseLength} caracteres`,
      config.greetingMessage ? `- Message d'accueil personnalise : ${config.greetingMessage}` : '',
      '',
      'Genere la reponse appropriee en JSON valide.',
    ].filter(Boolean).join('\n');

    // Simple messages (low priority, general classification, not urgent) → Haiku to save cost
    const isSimpleMessage =
      !classification.isUrgent &&
      classification.priority === 'low' &&
      classification.classification === 'general';

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: isSimpleMessage ? 'ultra-fast' : this.modelTier,
      systemPrompt: compositeSystemPrompt,
      userMessage: userPrompt,
      maxTokens: isSimpleMessage ? 512 : undefined,
    });

    try {
      return JSON.parse(response.content) as GeneratedResponse;
    } catch {
      return {
        response: truncateAtWordBoundary(response.content, config.maxResponseLength),
        classification,
      };
    }
  }

  // ── Summary Generation ──

  private async generateSummary(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as GenerateSummaryPayload;
    const config = await getRepondeurConfig(payload.userId);
    if (!config) return { skipped: true, reason: 'Config not found' };

    const messages = await getUnsummarizedMessages(payload.configId, payload.periodStart, payload.periodEnd);

    if (messages.length === 0) {
      return { skipped: true, reason: 'No messages to summarize' };
    }

    const messagesText = messages.map((m) =>
      `[${m.createdAt.toISOString()}] [${m.classification}/${m.priority}] ${m.senderName ?? m.senderPhone}: ${m.content}`,
    ).join('\n');

    const summaryPrompt = SUMMARY_GENERATION_PROMPT
      .replace('{periodStart}', payload.periodStart)
      .replace('{periodEnd}', payload.periodEnd)
      .replace('{messageCount}', String(messages.length))
      .replace('{messages}', messagesText);

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: REPONDEUR_SYSTEM_PROMPT,
      userMessage: summaryPrompt,
    });

    const summary = await saveSummary({
      configId: payload.configId,
      userId: payload.userId,
      summaryType: payload.summaryType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      totalMessages: messages.length,
      urgentCount: messages.filter(m => m.priority === 'urgent' || m.priority === 'critical').length,
      vipCount: messages.filter(m => m.classification === 'vip').length,
      orderCount: messages.filter(m => m.classification === 'order').length,
      complaintCount: messages.filter(m => m.classification === 'complaint').length,
      summaryText: response.content,
      deliveryChannel: config.summaryDeliveryChannel,
      tokensUsed: response.totalTokens,
    });

    // Mark messages as included in this summary
    await markMessagesSummarized(
      messages.map(m => m.id),
      summary.id,
    );

    return { summaryId: summary.id, messageCount: messages.length };
  }

  // ── Summary Delivery ──

  private async sendSummary(task: AgentTask): Promise<Record<string, unknown>> {
    const summaryId = task.payload['summaryId'] as string;
    const userId = task.payload['userId'] as string;

    if (!summaryId || !userId) {
      return { error: 'Missing summaryId or userId' };
    }

    // Publish event for notification service to handle delivery
    await eventBus.publish('RepondeurSummaryDelivered', this.id, {
      summaryId,
      userId,
    });

    return { sent: true, summaryId };
  }

  // ── Urgent Alert ──

  private async sendUrgentAlert(
    config: RepondeurConfig,
    payload: ProcessMessagePayload,
    classification: ClassificationResult,
  ): Promise<void> {
    if (!config.bossUserId) return;

    await eventBus.publish('RepondeurUrgentAlert', this.id, {
      bossUserId: config.bossUserId,
      deliveryChannel: config.summaryDeliveryChannel,
      senderPhone: payload.senderPhone,
      senderName: payload.senderName,
      classification: classification.classification,
      priority: classification.priority,
      messagePreview: payload.messageContent.slice(0, 200),
    });
  }

  // ── GDPR Cleanup ──

  private async cleanupOldData(): Promise<Record<string, unknown>> {
    const result = await cleanupExpiredData();
    return { ...result };
  }

  // ── Event Handlers ──

  private async handleIncomingMessage(event: SystemEvent): Promise<void> {
    const task: AgentTask = {
      id: event.id,
      title: 'Process repondeur message',
      description: `Message from ${String(event.payload['senderPhone'])}`,
      priority: 'MEDIUM',
      payload: { type: 'process_message', ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }

  private async handleSummaryRequest(event: SystemEvent): Promise<void> {
    const task: AgentTask = {
      id: event.id,
      title: 'Generate repondeur summary',
      description: 'Scheduled summary generation',
      priority: 'LOW',
      payload: { type: 'generate_summary', ...event.payload },
      assignedBy: event.sourceAgent,
      correlationId: event.correlationId ?? event.id,
    };
    await this.execute(task);
  }
}
