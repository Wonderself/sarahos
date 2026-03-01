import { createHash } from 'crypto';
import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import type { VoiceProfile } from '../../config/avatar.types';
import type {
  TTSProvider,
  TTSConfig,
  TTSRequest,
  TTSResult,
  TTSCacheEntry,
  TTSHealthStatus,
} from './tts.types';

const DEFAULT_CONFIG: TTSConfig = {
  provider: 'deepgram',
  voiceId: 'sarah-fr-female-01',
  language: 'fr-FR',
  speed: 1.0,
  pitch: 1.0,
  style: 'warm-professional',
  outputFormat: 'mp3',
  sampleRate: 22050,
};

export class TTSService {
  private cache = new Map<string, TTSCacheEntry>();
  private readonly maxCacheSize: number;
  private cacheHits = 0;
  private cacheRequests = 0;

  constructor(maxCacheSize = 200) {
    this.maxCacheSize = maxCacheSize;
    logger.info('TTS Service initialized', { maxCacheSize, provider: DEFAULT_CONFIG.provider });
  }

  async synthesize(request: TTSRequest): Promise<TTSResult> {
    const config = { ...DEFAULT_CONFIG, ...request.config };
    const cacheKey = this.getCacheKey(request.text, config.voiceId);
    this.cacheRequests++;

    // Vérifier le cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.cacheHits++;
      cached.accessCount++;
      return {
        sessionId: request.sessionId,
        provider: config.provider,
        audioBuffer: cached.audioBuffer,
        durationMs: Math.floor(request.text.length * 60),
        characterCount: request.text.length,
        latencyMs: 5,
        cached: true,
      };
    }

    try {
      let result: TTSResult;
      if (config.provider === 'deepgram') {
        result = await this.synthesizeDeepgram(request, config);
      } else if (config.provider === 'telnyx') {
        result = await this.synthesizeTelnyx(request, config);
      } else {
        result = await this.synthesizeInworld(request, config);
      }

      // Stocker en cache
      this.addToCache(cacheKey, {
        textHash: cacheKey,
        voiceId: config.voiceId,
        audioBuffer: result.audioBuffer,
        createdAt: new Date().toISOString(),
        accessCount: 1,
      });

      await eventBus.publish('TTSSynthesisCompleted', 'tts-service', {
        sessionId: request.sessionId,
        provider: config.provider,
        characterCount: result.characterCount,
        latencyMs: result.latencyMs,
        cached: false,
      });

      return result;
    } catch (error) {
      await eventBus.publish('TTSSynthesisFailed', 'tts-service', {
        sessionId: request.sessionId,
        provider: config.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async synthesizeWithFallback(request: TTSRequest): Promise<TTSResult> {
    try {
      return await this.synthesize(request);
    } catch (_primaryError) {
      const fallbackProvider: TTSProvider = request.fallbackProvider
        ?? (request.config.provider === 'deepgram' ? 'telnyx' : 'deepgram');

      logger.warn('TTS primary provider failed, falling back', {
        primary: request.config.provider,
        fallback: fallbackProvider,
        sessionId: request.sessionId,
      });

      const fallbackRequest: TTSRequest = {
        ...request,
        config: { ...request.config, provider: fallbackProvider },
      };
      return await this.synthesize(fallbackRequest);
    }
  }

  private async synthesizeDeepgram(request: TTSRequest, config: TTSConfig): Promise<TTSResult> {
    const apiKey = process.env['DEEPGRAM_API_KEY'];
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY not configured');
    }

    const voiceModel = this.resolveDeepgramVoice(config.voiceId, config.language);
    const startTime = Date.now();
    const textToSynthesize = request.text.slice(0, 2000);

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${voiceModel}&encoding=mp3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'text/plain',
        },
        body: textToSynthesize,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram TTS error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    const latencyMs = Date.now() - startTime;

    logger.info('Deepgram TTS synthesis complete', {
      sessionId: request.sessionId,
      voiceModel,
      characters: textToSynthesize.length,
      audioBytes: audioBuffer.length,
      latencyMs,
    });

    return {
      sessionId: request.sessionId,
      provider: 'deepgram',
      audioBuffer,
      durationMs: Math.floor(textToSynthesize.length * 60),
      characterCount: textToSynthesize.length,
      latencyMs,
      cached: false,
    };
  }

  private resolveDeepgramVoice(voiceId: string, language: string): string {
    if (language.startsWith('fr')) {
      if (voiceId.includes('female') || voiceId.includes('sarah')) return 'aura-2-agathe-fr';
      if (voiceId.includes('male') || voiceId.includes('emmanuel')) return 'aura-2-theron-en';
      return 'aura-2-agathe-fr';
    }
    if (voiceId.includes('female') || voiceId.includes('sarah')) return 'aura-2-agathe-fr';
    return 'aura-2-theron-en';
  }

  private async synthesizeTelnyx(request: TTSRequest, config: TTSConfig): Promise<TTSResult> {
    // Stub — intégration Telnyx TTS en production
    const audioData = `telnyx-audio:${config.voiceId}:${request.text.substring(0, 50)}`;
    return {
      sessionId: request.sessionId,
      provider: 'telnyx',
      audioBuffer: Buffer.from(audioData),
      durationMs: Math.floor(request.text.length * 60),
      characterCount: request.text.length,
      latencyMs: 180,
      cached: false,
    };
  }

  private async synthesizeInworld(request: TTSRequest, config: TTSConfig): Promise<TTSResult> {
    // Stub — intégration Inworld TTS en production
    const audioData = `inworld-audio:${config.voiceId}:${request.text.substring(0, 50)}`;
    return {
      sessionId: request.sessionId,
      provider: 'inworld',
      audioBuffer: Buffer.from(audioData),
      durationMs: Math.floor(request.text.length * 65),
      characterCount: request.text.length,
      latencyMs: 220,
      cached: false,
    };
  }

  private getCacheKey(text: string, voiceId: string): string {
    return createHash('sha256').update(`${voiceId}:${text}`).digest('hex').substring(0, 16);
  }

  private getFromCache(key: string): TTSCacheEntry | undefined {
    return this.cache.get(key);
  }

  private addToCache(key: string, entry: TTSCacheEntry): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Éviction LRU simple — supprimer la première entrée
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, entry);
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: this.cacheRequests > 0 ? this.cacheHits / this.cacheRequests : 0,
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheRequests = 0;
    logger.info('TTS cache cleared');
  }

  buildConfigFromVoiceProfile(profile: VoiceProfile): TTSConfig {
    return {
      provider: profile.provider,
      voiceId: profile.voiceId,
      language: profile.language,
      speed: profile.speed,
      pitch: profile.pitch,
      style: profile.style,
      outputFormat: 'mp3',
      sampleRate: 22050,
    };
  }

  async healthCheck(): Promise<TTSHealthStatus> {
    const deepgramConfigured = !!process.env['DEEPGRAM_API_KEY'];
    return {
      telnyx: true,
      inworld: true,
      deepgram: deepgramConfigured,
      cacheSize: this.cache.size,
      preferredProvider: DEFAULT_CONFIG.provider,
    };
  }
}

export const ttsService = new TTSService();
