import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import { LLMRouter } from '../../../core/llm/llm-router';
import { ASRService, asrService as defaultASR } from '../asr/asr.service';
import { TTSService, ttsService as defaultTTS } from '../tts/tts.service';
import { VideoAvatarService, videoAvatarService as defaultVideo } from '../video/video.service';
import { personaManager } from '../persona/persona.service';
import type {
  ConversationConfig,
  ConversationSession,
  ConversationTurnInput,
  ConversationTurnResult,
  PipelineMetrics,
} from './conversation.types';

const DEFAULT_CONFIG: ConversationConfig = {
  maxTurns: 100,
  maxDurationMs: 3_600_000, // 1h
  enableASR: true,
  enableTTS: true,
  enableVideo: true,
  channel: 'web',
};

export class ConversationManager {
  private sessions = new Map<string, ConversationSession>();
  private readonly asr: ASRService;
  private readonly tts: TTSService;
  private readonly video: VideoAvatarService;

  // Métriques agrégées
  private metricsAccum = { asrLatency: 0, asrCount: 0, llmLatency: 0, llmCount: 0, ttsLatency: 0, ttsCount: 0, videoLatency: 0, videoCount: 0 };

  constructor(asr?: ASRService, tts?: TTSService, video?: VideoAvatarService) {
    this.asr = asr ?? defaultASR;
    this.tts = tts ?? defaultTTS;
    this.video = video ?? defaultVideo;
    logger.info('Conversation Manager initialized');
  }

  async startSession(
    sessionId: string,
    avatarBase: 'sarah' | 'emmanuel',
    personaId: string,
    config?: Partial<ConversationConfig>,
  ): Promise<ConversationSession> {
    const session: ConversationSession = {
      sessionId,
      avatarBase,
      personaId,
      channel: config?.channel ?? DEFAULT_CONFIG.channel,
      status: 'active',
      config: { ...DEFAULT_CONFIG, ...config },
      history: [],
      turnCount: 0,
      startedAt: new Date().toISOString(),
      lastTurnAt: null,
      totalLatencyMs: 0,
      totalTokensUsed: 0,
    };

    this.sessions.set(sessionId, session);

    // Lier le persona à la session
    personaManager.bindToSession(sessionId, personaId);

    logger.info('Conversation session started', { sessionId, avatarBase, personaId });
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    personaManager.unbindSession(sessionId);

    logger.info('Conversation session ended', {
      sessionId,
      turnCount: session.turnCount,
      totalLatencyMs: session.totalLatencyMs,
    });
  }

  getActiveSessions(): ConversationSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
  }

  async processTurn(input: ConversationTurnInput): Promise<ConversationTurnResult> {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error(`Conversation session not found: ${input.sessionId}`);
    }

    const startTime = Date.now();
    let userText = input.textInput ?? '';

    // Étape 1 : ASR (si audio fourni et ASR activé)
    let asrResult: ConversationTurnResult['asrResult'];
    if (input.audioInput && session.config.enableASR) {
      asrResult = await this.runASR(session, input.audioInput);
      userText = asrResult.transcript;
    }

    // Étape 2 : LLM
    const llmResult = await this.runLLM(session, userText);

    // Étape 3 : TTS (si activé)
    let ttsResult: ConversationTurnResult['ttsResult'];
    if (session.config.enableTTS) {
      ttsResult = await this.runTTS(session, llmResult.textResponse);
    }

    // Étape 4 : Video (si activé et audio disponible)
    let videoResult: ConversationTurnResult['videoResult'];
    if (session.config.enableVideo && ttsResult) {
      videoResult = await this.runVideo(session, ttsResult.audioBuffer);
    }

    const totalLatencyMs = Date.now() - startTime;

    // Mettre à jour la session
    session.turnCount++;
    session.lastTurnAt = new Date().toISOString();
    session.totalLatencyMs += totalLatencyMs;
    session.totalTokensUsed += llmResult.tokensUsed;
    session.history.push(
      { role: 'user', content: userText },
      { role: 'assistant', content: llmResult.textResponse },
    );

    const result: ConversationTurnResult = {
      sessionId: input.sessionId,
      turnNumber: session.turnCount,
      asrResult,
      llmResult,
      ttsResult,
      videoResult,
      totalLatencyMs,
    };

    await eventBus.publish('ConversationTurnCompleted', 'conversation-manager', {
      sessionId: input.sessionId,
      turnNumber: session.turnCount,
      totalLatencyMs,
      tokensUsed: llmResult.tokensUsed,
    });

    return result;
  }

  private async runASR(session: ConversationSession, audioInput: Buffer): Promise<NonNullable<ConversationTurnResult['asrResult']>> {
    const asrConfig = this.asr.getConfigForAvatar(session.avatarBase);
    const result = await this.asr.transcribe({
      sessionId: session.sessionId,
      audioBuffer: audioInput,
      config: asrConfig,
    });

    this.metricsAccum.asrLatency += result.latencyMs;
    this.metricsAccum.asrCount++;

    return {
      transcript: result.transcript,
      confidence: result.confidence,
      latencyMs: result.latencyMs,
    };
  }

  private async runLLM(session: ConversationSession, userText: string): Promise<ConversationTurnResult['llmResult']> {
    const systemPrompt = personaManager.buildEnrichedSystemPrompt(session.personaId, session.sessionId);

    const response = await LLMRouter.route({
      agentId: 'conversation-manager',
      agentName: 'Conversation Manager',
      modelTier: 'standard',
      systemPrompt: systemPrompt || `Tu es ${session.avatarBase === 'sarah' ? 'Sarah' : 'Emmanuel'}, assistant IA.`,
      userMessage: userText,
      conversationHistory: session.history.slice(-20), // 10 derniers tours
    });

    this.metricsAccum.llmLatency += response.latencyMs;
    this.metricsAccum.llmCount++;

    return {
      textResponse: response.content,
      tokensUsed: response.totalTokens,
      latencyMs: response.latencyMs,
    };
  }

  private async runTTS(session: ConversationSession, text: string): Promise<NonNullable<ConversationTurnResult['ttsResult']>> {
    const persona = personaManager.getPersona(session.personaId);
    const ttsConfig = persona
      ? this.tts.buildConfigFromVoiceProfile(persona.voiceProfile)
      : { provider: 'telnyx' as const, voiceId: 'default', language: 'fr-FR', speed: 1.0, pitch: 1.0, style: 'professional', outputFormat: 'mp3' as const, sampleRate: 22050 as const };

    const result = await this.tts.synthesize({
      sessionId: session.sessionId,
      text,
      config: ttsConfig,
    });

    this.metricsAccum.ttsLatency += result.latencyMs;
    this.metricsAccum.ttsCount++;

    return {
      audioBuffer: result.audioBuffer,
      durationMs: result.durationMs,
      latencyMs: result.latencyMs,
    };
  }

  private async runVideo(session: ConversationSession, audioBuffer: Buffer): Promise<NonNullable<ConversationTurnResult['videoResult']>> {
    const result = await this.video.generateFrame({
      sessionId: session.sessionId,
      audioBuffer,
    });

    this.metricsAccum.videoLatency += result.latencyMs;
    this.metricsAccum.videoCount++;

    return {
      frameUrl: result.frameUrl,
      latencyMs: result.latencyMs,
    };
  }

  getMetrics(): PipelineMetrics {
    const totalTurns = this.metricsAccum.llmCount;
    const totalSessions = this.sessions.size;

    return {
      averageLatencyMs: totalTurns > 0
        ? Math.round(
            (this.metricsAccum.asrLatency + this.metricsAccum.llmLatency + this.metricsAccum.ttsLatency + this.metricsAccum.videoLatency)
            / totalTurns,
          )
        : 0,
      averageTokensPerTurn: totalTurns > 0
        ? Math.round(
            Array.from(this.sessions.values()).reduce((s, sess) => s + sess.totalTokensUsed, 0) / totalTurns,
          )
        : 0,
      totalTurns,
      totalSessions,
      asrLatencyAvgMs: this.metricsAccum.asrCount > 0 ? Math.round(this.metricsAccum.asrLatency / this.metricsAccum.asrCount) : 0,
      llmLatencyAvgMs: this.metricsAccum.llmCount > 0 ? Math.round(this.metricsAccum.llmLatency / this.metricsAccum.llmCount) : 0,
      ttsLatencyAvgMs: this.metricsAccum.ttsCount > 0 ? Math.round(this.metricsAccum.ttsLatency / this.metricsAccum.ttsCount) : 0,
      videoLatencyAvgMs: this.metricsAccum.videoCount > 0 ? Math.round(this.metricsAccum.videoLatency / this.metricsAccum.videoCount) : 0,
    };
  }
}

export const conversationManager = new ConversationManager();
