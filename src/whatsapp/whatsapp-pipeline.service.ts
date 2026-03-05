import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { whatsAppService } from './whatsapp.service';
import { whatsAppRepository } from './whatsapp.repository';
import { llmProxyService } from '../billing/llm-proxy.service';
import { walletService } from '../billing/wallet.service';
import { asrService } from '../avatar/services/asr/asr.service';
import { ttsService } from '../avatar/services/tts/tts.service';
import { calculateSTTCost, calculateTTSCost } from '../billing/pricing';
import { eventBus } from '../core/event-bus/event-bus';
import { getRepondeurConfig, isScheduleActive } from '../agents/level1-execution/repondeur/repondeur.tools';
import type { IncomingWhatsAppMessage, WhatsAppConversation } from './whatsapp.types';
import { normalizePhoneNumber } from './whatsapp.types';
import {
  detectRouting,
  buildWhatsAppPrompt,
  buildTransitionMessage,
  computeOnboardingPhase,
  registerAgents,
  type AgentDef,
  type BondContext,
} from './whatsapp-agent-router';

// ─── Agent Registry (loaded from config at startup) ───

const AGENT_REGISTRY: Map<string, AgentDef> = new Map();

/** Call once at startup with all agent definitions */
export function initAgentRegistry(agents: Array<{ id: string; name: string; role: string; emoji: string; systemPrompt: string }>) {
  for (const a of agents) {
    AGENT_REGISTRY.set(a.id, a);
  }
  registerAgents(agents);
  logger.info('WhatsApp agent registry initialized', { count: agents.length });
}

// Fallback prompts for sarah/emmanuel (backward compat)
const FALLBACK_PROMPTS: Record<string, string> = {
  sarah: `Tu es Sarah, Directrice Generale virtuelle de Freenzy.io. Tu es charismatique, empathique et professionnelle. Tu reponds en francais de maniere naturelle et bienveillante. Tu es concise dans tes reponses WhatsApp (max 300 caracteres). Tu utilises parfois des emojis de facon moderee.`,
  emmanuel: `Tu es Emmanuel, CEO et fondateur de Freenzy.io. Tu es pose, visionnaire et inspirant. Tu reponds en francais avec autorite et assurance. Tu es concis dans tes reponses WhatsApp (max 300 caracteres). Ton de leader tech bienveillant.`,
};

interface AgentContext {
  currentAgentId: string;
  responseMode: 'short' | 'detailed';
  messageCount: number;
  agentInteractions: Record<string, { count: number; onboardingPhase: string }>;
}

export class WhatsAppPipelineService {
  /**
   * Main entry point for inbound WhatsApp messages.
   */
  async processIncomingMessage(message: IncomingWhatsAppMessage, contactName: string): Promise<void> {
    const phoneNormalized = normalizePhoneNumber(message.from);

    logger.info('WhatsApp incoming message', {
      from: message.from,
      type: message.type,
      messageId: message.id,
      contactName,
    });

    // Mark as read
    whatsAppService.markAsRead(message.id).catch(() => {});

    // 1. Look up user by phone
    const phoneLink = await whatsAppRepository.findUserByPhone(phoneNormalized);
    if (!phoneLink) {
      await this.handleUnregisteredUser(message.from);
      return;
    }

    const userId = phoneLink.userId;

    // 2. Check/create 24h conversation window
    let conversation = await whatsAppRepository.getActiveConversation(userId);
    if (!conversation) {
      conversation = await whatsAppRepository.createConversation(
        userId,
        phoneLink.phoneNumber,
        phoneLink.preferredAgent,
      );
      logger.info('New WhatsApp conversation created', { conversationId: conversation.id, userId });
    }

    // 3. Pre-flight balance check
    const hasBalance = await walletService.hasBalance(userId, 1_000_000); // minimum 1 credit
    if (!hasBalance) {
      await this.handleInsufficientBalance(message.from);
      await whatsAppRepository.createMessage({
        conversationId: conversation.id,
        userId,
        direction: 'inbound',
        messageType: message.type === 'audio' ? 'audio' : 'text',
        content: message.text?.body ?? '[audio]',
        waMessageId: message.id,
        status: 'failed',
        errorMessage: 'Insufficient balance',
      });
      return;
    }

    // 4. Check if Repondeur is active for this user
    const repondeurConfig = await getRepondeurConfig(userId);
    if (repondeurConfig?.isActive) {
      const isBoss = repondeurConfig.bossPhoneNumber &&
        normalizePhoneNumber(message.from) === normalizePhoneNumber(repondeurConfig.bossPhoneNumber);
      if (!isBoss && isScheduleActive(repondeurConfig.schedule)) {
        logger.info('Routing to Repondeur Agent', { userId, from: message.from });
        // Fire event — the repondeur agent handles processing + WhatsApp reply
        await eventBus.publish('RepondeurMessageReceived', 'whatsapp-pipeline', {
          senderPhone: message.from,
          senderName: contactName,
          messageContent: message.text?.body ?? '[audio]',
          messageType: message.type === 'audio' ? 'audio' : 'text',
          waMessageId: message.id,
          userId,
        });
        return;
      }
    }

    // 5. Process based on message type (standard pipeline)
    try {
      if (message.type === 'text' && message.text?.body) {
        await this.processTextMessage(userId, message.text.body, message, conversation, phoneLink);
      } else if (message.type === 'audio' && message.audio?.id) {
        await this.processVoiceNote(userId, message.audio.id, message.audio.mime_type, message, conversation, phoneLink);
      } else {
        // Unsupported message type
        await whatsAppService.sendTextMessage({
          to: message.from,
          text: 'Je peux recevoir des messages texte et des notes vocales. Les autres types de medias ne sont pas encore supportes.',
        });
      }
    } catch (error) {
      logger.error('WhatsApp pipeline error', {
        userId,
        messageId: message.id,
        error: error instanceof Error ? error.message : String(error),
      });

      await whatsAppService.sendTextMessage({
        to: message.from,
        text: 'Desole, une erreur est survenue. Veuillez reessayer dans quelques instants.',
      });
    }

    // Update last message timestamp
    await whatsAppRepository.updateLastMessage(userId);
  }

  /** Load agent context from conversation metadata */
  private getAgentContext(conversation: WhatsAppConversation, preferredAgent: string): AgentContext {
    const stored = conversation.metadata?.agent_context as AgentContext | undefined;
    return stored ?? {
      currentAgentId: preferredAgent || 'fz-assistante',
      responseMode: 'short',
      messageCount: 0,
      agentInteractions: {},
    };
  }

  /** Save agent context back into conversation metadata */
  private async saveAgentContext(conversationId: string, ctx: AgentContext): Promise<void> {
    try {
      await whatsAppRepository.updateConversationMetadata(conversationId, { agent_context: ctx });
    } catch (err) {
      logger.warn('Failed to save agent context', { conversationId, error: err });
    }
  }

  private async processTextMessage(
    userId: string,
    text: string,
    rawMessage: IncomingWhatsAppMessage,
    conversation: WhatsAppConversation,
    phoneLink: { preferredAgent: string; enableVoiceResponses: boolean; phoneNumber: string },
  ): Promise<void> {
    // Save inbound message
    await whatsAppRepository.createMessage({
      conversationId: conversation.id,
      userId,
      direction: 'inbound',
      messageType: 'text',
      content: text,
      waMessageId: rawMessage.id,
      status: 'delivered',
    });

    // ─── Multi-Agent Routing ───
    const ctx = this.getAgentContext(conversation, phoneLink.preferredAgent);
    const routing = detectRouting(text, ctx.currentAgentId, ctx.responseMode);
    const targetAgent = AGENT_REGISTRY.get(routing.targetAgentId);

    // Handle agent switch — send transition message
    if (routing.isSwitch && targetAgent) {
      const fromAgent = AGENT_REGISTRY.get(ctx.currentAgentId);
      const transitionMsg = buildTransitionMessage(fromAgent, targetAgent);
      await whatsAppService.sendTextMessage({ to: rawMessage.from, text: transitionMsg });
      ctx.currentAgentId = routing.targetAgentId;
      logger.info('WhatsApp agent switch', { userId, from: ctx.currentAgentId, to: routing.targetAgentId });
    }

    // Update context
    ctx.responseMode = routing.responseMode;
    ctx.messageCount += 1;
    const agentKey = ctx.currentAgentId;
    if (!ctx.agentInteractions[agentKey]) {
      ctx.agentInteractions[agentKey] = { count: 0, onboardingPhase: 'discovery' };
    }
    const agentInt = ctx.agentInteractions[agentKey]!;
    agentInt.count += 1;

    // Compute onboarding phase
    const agentIntCount = agentInt.count;
    const onboardingPhase = computeOnboardingPhase(agentIntCount);
    agentInt.onboardingPhase = onboardingPhase;

    // Build bond context
    const bond: BondContext = {
      totalInteractions: agentIntCount,
      relationshipLevel: agentIntCount >= 100 ? 5 : agentIntCount >= 50 ? 4 : agentIntCount >= 20 ? 3 : agentIntCount >= 5 ? 2 : 1,
      satisfactionScore: 50, // Default server-side (client tracks detailed scores)
    };

    // Get conversation history for context
    const history = await whatsAppRepository.getRecentMessagesForContext(userId, 8);

    // Build dynamic prompt
    const activeAgent = targetAgent ?? AGENT_REGISTRY.get(ctx.currentAgentId);
    const systemPrompt = activeAgent
      ? buildWhatsAppPrompt(activeAgent, ctx.responseMode, bond, onboardingPhase)
      : FALLBACK_PROMPTS[conversation.agentName] ?? FALLBACK_PROMPTS['sarah'] ?? '';

    // Call LLM with dynamic prompt
    const maxTokens = ctx.responseMode === 'detailed' ? 2048 : 512;
    const llmResult = await this.callLLMWithBilling(userId, text, history, systemPrompt, ctx.currentAgentId, maxTokens);

    // Auto-revert to short mode after detailed response
    if (ctx.responseMode === 'detailed') {
      ctx.responseMode = 'short';
    }

    // Save context
    await this.saveAgentContext(conversation.id, ctx);

    if ('error' in llmResult) {
      await whatsAppService.sendTextMessage({
        to: rawMessage.from,
        text: llmResult.error === 'Insufficient balance'
          ? 'Votre solde est insuffisant. Rechargez votre portefeuille sur le dashboard Freenzy.io.'
          : 'Desole, je ne peux pas repondre pour le moment. Veuillez reessayer.',
      });
      return;
    }

    // Send text response
    const waMessageId = await whatsAppService.sendTextMessage({
      to: rawMessage.from,
      text: llmResult.content,
    });

    // Every 5 messages, send feedback buttons
    if (ctx.messageCount % 5 === 0) {
      await whatsAppService.sendInteractiveMessage({
        to: rawMessage.from,
        body: 'Cette réponse vous a été utile ?',
        buttons: [
          { id: `feedback_yes_${ctx.currentAgentId}`, title: 'Utile 👍' },
          { id: `feedback_no_${ctx.currentAgentId}`, title: 'À améliorer 👎' },
          { id: 'cmd_detail', title: 'Plus de détails' },
        ],
        footer: `${activeAgent?.emoji ?? '🤖'} ${activeAgent?.name ?? 'Agent'}`,
      }).catch(() => {}); // non-blocking
    }

    // Save outbound message
    await whatsAppRepository.createMessage({
      conversationId: conversation.id,
      userId,
      direction: 'outbound',
      messageType: 'text',
      content: llmResult.content,
      waMessageId: waMessageId ?? undefined,
      tokensUsed: llmResult.tokens,
      billedCredits: llmResult.billedCredits,
      status: waMessageId ? 'sent' : 'failed',
      metadata: { agent_id: ctx.currentAgentId },
    });

    // Update conversation stats
    await whatsAppRepository.updateConversationStats(
      conversation.id,
      llmResult.tokens,
      llmResult.billedCredits,
    );

    // Optionally send voice response
    if (phoneLink.enableVoiceResponses) {
      await this.sendVoiceResponse(rawMessage.from, llmResult.content, userId, conversation);
    }
  }

  private async processVoiceNote(
    userId: string,
    audioMediaId: string,
    mimeType: string,
    rawMessage: IncomingWhatsAppMessage,
    conversation: WhatsAppConversation,
    phoneLink: { preferredAgent: string; enableVoiceResponses: boolean; phoneNumber: string },
  ): Promise<void> {
    // Download audio from WhatsApp
    const audioBuffer = await whatsAppService.downloadMedia(audioMediaId);
    if (!audioBuffer) {
      await whatsAppService.sendTextMessage({
        to: rawMessage.from,
        text: 'Je n\'ai pas pu telecharger votre message vocal. Pouvez-vous reessayer ?',
      });
      return;
    }

    // Transcribe with Deepgram STT
    let transcript = '';
    let confidence = 0;
    let sttDurationMs = 0;
    try {
      const asrResult = await asrService.transcribe({
        sessionId: uuidv4(),
        audioBuffer,
        config: {
          provider: 'deepgram',
          language: 'fr-FR',
          enablePunctuation: true,
          enableSpeakerDiarization: false,
          model: 'default',
        },
      });
      transcript = asrResult.transcript;
      confidence = asrResult.confidence;
      sttDurationMs = asrResult.durationMs;

      // Bill STT
      const sttCost = calculateSTTCost(sttDurationMs);
      if (sttCost > 0) {
        await walletService.withdraw(userId, sttCost, `STT: ${sttDurationMs}ms audio`, 'stt_usage');
      }
    } catch (error) {
      logger.error('WhatsApp voice transcription failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      await whatsAppService.sendTextMessage({
        to: rawMessage.from,
        text: 'Je n\'ai pas pu transcrire votre message vocal. Pouvez-vous l\'ecrire en texte ?',
      });
      return;
    }

    if (!transcript.trim()) {
      await whatsAppService.sendTextMessage({
        to: rawMessage.from,
        text: 'Je n\'ai pas detecte de parole dans votre message vocal. Pouvez-vous reessayer ?',
      });
      return;
    }

    // Save inbound voice message
    await whatsAppRepository.createMessage({
      conversationId: conversation.id,
      userId,
      direction: 'inbound',
      messageType: 'audio',
      content: transcript,
      waMessageId: rawMessage.id,
      mediaMimeType: mimeType,
      audioDurationMs: sttDurationMs,
      transcription: transcript,
      transcriptionConfidence: confidence,
      status: 'delivered',
    });

    // Get context and call LLM (voice notes use the current agent context)
    const history = await whatsAppRepository.getRecentMessagesForContext(userId, 8);
    const voiceCtx = this.getAgentContext(conversation, phoneLink.preferredAgent);
    const voiceAgent = AGENT_REGISTRY.get(voiceCtx.currentAgentId);
    const voicePrompt = voiceAgent
      ? buildWhatsAppPrompt(voiceAgent, 'short', { totalInteractions: 0, relationshipLevel: 1, satisfactionScore: 50 }, 'active')
      : FALLBACK_PROMPTS[conversation.agentName] ?? FALLBACK_PROMPTS['sarah'] ?? '';
    const llmResult = await this.callLLMWithBilling(userId, transcript, history, voicePrompt, voiceCtx.currentAgentId);

    if ('error' in llmResult) {
      // Refund STT cost if LLM fails (user shouldn't pay for transcription without a response)
      const sttRefundCost = calculateSTTCost(sttDurationMs);
      if (sttRefundCost > 0) {
        try {
          await walletService.deposit({
            userId,
            amount: sttRefundCost,
            description: `STT refund: LLM failure after ${sttDurationMs}ms audio`,
            referenceType: 'stt_refund',
          });
        } catch (refundErr) {
          logger.warn('Failed to refund STT cost after LLM failure', { userId, sttRefundCost, error: refundErr });
        }
      }
      await whatsAppService.sendTextMessage({
        to: rawMessage.from,
        text: 'Desole, je ne peux pas repondre pour le moment.',
      });
      return;
    }

    // Send text response
    const waMessageId = await whatsAppService.sendTextMessage({
      to: rawMessage.from,
      text: llmResult.content,
    });

    // Save outbound message
    await whatsAppRepository.createMessage({
      conversationId: conversation.id,
      userId,
      direction: 'outbound',
      messageType: 'text',
      content: llmResult.content,
      waMessageId: waMessageId ?? undefined,
      tokensUsed: llmResult.tokens,
      billedCredits: llmResult.billedCredits,
      status: waMessageId ? 'sent' : 'failed',
    });

    await whatsAppRepository.updateConversationStats(
      conversation.id,
      llmResult.tokens,
      llmResult.billedCredits,
    );

    // Send voice response if enabled
    if (phoneLink.enableVoiceResponses) {
      await this.sendVoiceResponse(rawMessage.from, llmResult.content, userId, conversation);
    }
  }

  private async sendVoiceResponse(
    to: string,
    text: string,
    userId: string,
    conversation: WhatsAppConversation,
  ): Promise<void> {
    try {
      const ttsResult = await ttsService.synthesize({
        sessionId: uuidv4(),
        text: text.slice(0, 2000),
        config: {
          provider: 'deepgram',
          voiceId: conversation.agentName === 'emmanuel' ? 'emmanuel-fr-male-01' : 'sarah-fr-female-01',
          language: 'fr-FR',
          speed: 1.0,
          pitch: 1.0,
          style: 'warm-professional',
          outputFormat: 'mp3',
          sampleRate: 22050,
        },
      });

      // Bill TTS
      const ttsCost = calculateTTSCost(text.length);
      if (ttsCost > 0) {
        await walletService.withdraw(userId, ttsCost, `TTS: ${text.length} chars`, 'tts_usage');
      }

      // Upload audio to WhatsApp
      const mediaId = await whatsAppService.uploadMedia(ttsResult.audioBuffer, 'audio/mpeg');
      if (mediaId) {
        await whatsAppService.sendAudioMessage({ to, mediaId });
      }
    } catch (error) {
      logger.warn('WhatsApp voice response failed, text-only sent', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async callLLMWithBilling(
    userId: string,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    systemPrompt: string,
    agentId: string = 'sarah',
    maxTokens: number = 1024,
  ): Promise<{ content: string; tokens: number; billedCredits: number } | { error: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const result = await llmProxyService.processRequest({
      userId,
      model: 'claude-sonnet-4-20250514',
      messages,
      maxTokens,
      agentName: `whatsapp-${agentId}`,
      endpoint: '/whatsapp/message',
      requestId: uuidv4(),
    });

    if ('error' in result) {
      return { error: result.error };
    }

    return {
      content: result.content,
      tokens: result.totalTokens,
      billedCredits: result.billedCredits,
    };
  }

  private async handleUnregisteredUser(phoneNumber: string): Promise<void> {
    logger.info('WhatsApp message from unregistered user', { phoneNumber });

    await whatsAppService.sendTextMessage({
      to: phoneNumber,
      text: `Bonjour ! 👋 Pour utiliser Freenzy.io sur WhatsApp, inscrivez-vous sur notre plateforme et liez votre numero dans l'espace client.\n\nRendez-vous sur votre dashboard Freenzy.io → WhatsApp pour commencer.`,
    });
  }

  private async handleInsufficientBalance(phoneNumber: string): Promise<void> {
    await whatsAppService.sendTextMessage({
      to: phoneNumber,
      text: `Votre solde de credits est insuffisant pour continuer la conversation. Rechargez votre portefeuille depuis votre dashboard Freenzy.io → Portefeuille.`,
    });
  }
}

export const whatsAppPipeline = new WhatsAppPipelineService();
