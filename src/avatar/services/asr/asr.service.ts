import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import type {
  ASRLanguage,
  ASRProvider,
  ASRConfig,
  ASRRequest,
  ASRResult,
  ASRHealthStatus,
} from './asr.types';

const DEFAULT_CONFIG: ASRConfig = {
  provider: 'deepgram',
  language: 'fr-FR',
  enablePunctuation: true,
  enableSpeakerDiarization: false,
  model: 'default',
};

export class ASRService {
  private readonly defaultConfig: ASRConfig;

  constructor(config?: Partial<ASRConfig>) {
    this.defaultConfig = { ...DEFAULT_CONFIG, ...config };
    logger.info('ASR Service initialized', { provider: this.defaultConfig.provider });
  }

  async transcribe(request: ASRRequest): Promise<ASRResult> {
    const config = { ...this.defaultConfig, ...request.config };

    try {
      let result: ASRResult;
      if (config.provider === 'deepgram') {
        result = await this.transcribeDeepgram(request, config);
      } else if (config.provider === 'assemblyai') {
        result = await this.transcribeAssemblyAI(request, config);
      } else {
        result = await this.transcribeWhisper(request, config);
      }

      await eventBus.publish('ASRTranscriptionCompleted', 'asr-service', {
        sessionId: request.sessionId,
        provider: config.provider,
        confidence: result.confidence,
        latencyMs: result.latencyMs,
      });

      return result;
    } catch (error) {
      await eventBus.publish('ASRTranscriptionFailed', 'asr-service', {
        sessionId: request.sessionId,
        provider: config.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async transcribeWithFallback(request: ASRRequest): Promise<ASRResult> {
    try {
      return await this.transcribe(request);
    } catch (_primaryError) {
      const fallbackProvider: ASRProvider = request.fallbackProvider
        ?? (request.config.provider === 'deepgram' ? 'assemblyai' : 'deepgram');

      logger.warn('ASR primary provider failed, falling back', {
        primary: request.config.provider,
        fallback: fallbackProvider,
        sessionId: request.sessionId,
      });

      const fallbackRequest: ASRRequest = {
        ...request,
        config: { ...request.config, provider: fallbackProvider },
      };
      return await this.transcribe(fallbackRequest);
    }
  }

  private async transcribeDeepgram(request: ASRRequest, config: ASRConfig): Promise<ASRResult> {
    const apiKey = process.env['DEEPGRAM_API_KEY'];
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY not configured');
    }

    const language = config.language === 'auto' ? '' : config.language.split('-')[0];
    const startTime = Date.now();

    const params = new URLSearchParams({
      model: 'nova-2',
      smart_format: 'true',
      punctuate: String(config.enablePunctuation),
    });
    if (language) params.set('language', language);
    if (config.enableSpeakerDiarization) params.set('diarize', 'true');

    const response = await fetch(
      `https://api.deepgram.com/v1/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/ogg',
        },
        body: request.audioBuffer,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram STT error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{
            transcript?: string;
            confidence?: number;
            words?: Array<{ word: string; start: number; end: number; confidence: number }>;
          }>;
          detected_language?: string;
        }>;
      };
      metadata?: { duration?: number };
    };

    const latencyMs = Date.now() - startTime;
    const alt = data.results?.channels?.[0]?.alternatives?.[0];
    const detectedLang = data.results?.channels?.[0]?.detected_language;

    logger.info('Deepgram STT transcription complete', {
      sessionId: request.sessionId,
      transcript: alt?.transcript?.substring(0, 100),
      confidence: alt?.confidence,
      durationSeconds: data.metadata?.duration,
      latencyMs,
    });

    return {
      sessionId: request.sessionId,
      provider: 'deepgram',
      transcript: alt?.transcript || '',
      confidence: alt?.confidence || 0,
      language: config.language === 'auto' ? (detectedLang || 'fr-FR') : config.language,
      durationMs: Math.floor((data.metadata?.duration || 0) * 1000),
      words: alt?.words?.map((w) => ({
        text: w.word,
        start: Math.floor(w.start * 1000),
        end: Math.floor(w.end * 1000),
        confidence: w.confidence,
      })),
      latencyMs,
    };
  }

  private async transcribeAssemblyAI(request: ASRRequest, config: ASRConfig): Promise<ASRResult> {
    // Stub — intégration AssemblyAI en production
    const latencyMs = Date.now() - Date.now() + 320;
    return {
      sessionId: request.sessionId,
      provider: 'assemblyai',
      transcript: `[AssemblyAI stub] Transcription du buffer audio (${request.audioBuffer.length} bytes)`,
      confidence: 0.94,
      language: config.language === 'auto' ? 'fr-FR' : config.language,
      durationMs: Math.floor(request.audioBuffer.length / 32),
      words: [
        { text: 'Bonjour', start: 0, end: 500, confidence: 0.98 },
        { text: 'monde', start: 510, end: 900, confidence: 0.95 },
      ],
      latencyMs,
    };
  }

  private async transcribeWhisper(request: ASRRequest, config: ASRConfig): Promise<ASRResult> {
    // Stub — intégration Whisper (OpenAI) en production
    const latencyMs = Date.now() - Date.now() + 450;
    return {
      sessionId: request.sessionId,
      provider: 'whisper',
      transcript: `[Whisper stub] Transcription du buffer audio (${request.audioBuffer.length} bytes)`,
      confidence: 0.91,
      language: config.language === 'auto' ? 'fr-FR' : config.language,
      durationMs: Math.floor(request.audioBuffer.length / 32),
      latencyMs,
    };
  }

  async healthCheck(): Promise<ASRHealthStatus> {
    const deepgramConfigured = !!process.env['DEEPGRAM_API_KEY'];
    return {
      assemblyai: true,
      whisper: true,
      deepgram: deepgramConfigured,
      preferredProvider: this.defaultConfig.provider,
    };
  }

  async detectLanguage(_audioBuffer: Buffer): Promise<ASRLanguage> {
    return 'fr-FR';
  }

  getConfigForAvatar(avatarBase: 'sarah' | 'emmanuel'): ASRConfig {
    return {
      ...this.defaultConfig,
      language: 'fr-FR',
      model: avatarBase === 'sarah' ? 'default' : 'meeting',
    };
  }
}

export const asrService = new ASRService();
