import { TTSService } from './tts.service';
import type { TTSRequest, TTSConfig } from './tts.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

const baseConfig: TTSConfig = {
  provider: 'telnyx', voiceId: 'sarah-fr-female-01', language: 'fr-FR',
  speed: 1.0, pitch: 1.0, style: 'warm-professional', outputFormat: 'mp3', sampleRate: 22050,
};

function makeRequest(overrides: Partial<TTSRequest> = {}): TTSRequest {
  return {
    sessionId: 'session-tts-1',
    text: 'Bonjour, comment allez-vous ?',
    config: baseConfig,
    ...overrides,
  };
}

describe('TTSService', () => {
  let service: TTSService;

  beforeEach(() => {
    service = new TTSService();
    jest.clearAllMocks();
  });

  it('constructs with default cache size', () => {
    expect(service).toBeInstanceOf(TTSService);
  });

  it('constructs with custom cache size', () => {
    const custom = new TTSService(500);
    expect(custom).toBeInstanceOf(TTSService);
  });

  it('synthesizes with Telnyx provider', async () => {
    const result = await service.synthesize(makeRequest());
    expect(result.provider).toBe('telnyx');
    expect(result.audioBuffer).toBeInstanceOf(Buffer);
    expect(result.characterCount).toBe('Bonjour, comment allez-vous ?'.length);
    expect(result.cached).toBe(false);
    expect(result.sessionId).toBe('session-tts-1');
  });

  it('synthesizes with Inworld provider', async () => {
    const result = await service.synthesize(makeRequest({
      config: { ...baseConfig, provider: 'inworld' },
    }));
    expect(result.provider).toBe('inworld');
    expect(result.audioBuffer).toBeInstanceOf(Buffer);
  });

  it('synthesizeWithFallback uses primary provider first', async () => {
    const result = await service.synthesizeWithFallback(makeRequest());
    expect(result.provider).toBe('telnyx');
  });

  it('synthesizeWithFallback falls back on primary failure', async () => {
    const failingService = new TTSService();
    let callCount = 0;
    jest.spyOn(failingService, 'synthesize').mockImplementation(async (req) => {
      callCount++;
      if (callCount === 1) throw new Error('Telnyx down');
      return {
        sessionId: req.sessionId, provider: 'inworld', audioBuffer: Buffer.from('fallback'),
        durationMs: 500, characterCount: req.text.length, latencyMs: 220, cached: false,
      };
    });

    const result = await failingService.synthesizeWithFallback(makeRequest());
    expect(result.provider).toBe('inworld');
    expect(callCount).toBe(2);
  });

  it('caches TTS results and returns cached on second call', async () => {
    const req = makeRequest();
    const first = await service.synthesize(req);
    expect(first.cached).toBe(false);

    const second = await service.synthesize(req);
    expect(second.cached).toBe(true);
    expect(second.latencyMs).toBeLessThan(first.latencyMs);
  });

  it('getCacheStats returns correct hit rate', async () => {
    const req = makeRequest();
    await service.synthesize(req); // miss
    await service.synthesize(req); // hit

    const stats = service.getCacheStats();
    expect(stats.size).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  it('clearCache empties the cache', async () => {
    await service.synthesize(makeRequest());
    expect(service.getCacheStats().size).toBe(1);

    service.clearCache();
    expect(service.getCacheStats().size).toBe(0);
    expect(service.getCacheStats().hitRate).toBe(0);
  });

  it('buildConfigFromVoiceProfile maps VoiceProfile correctly', () => {
    const profile = { provider: 'telnyx' as const, voiceId: 'sarah-fr-female-01', language: 'fr-FR', speed: 1.0, pitch: 1.0, style: 'warm-professional' };
    const config = service.buildConfigFromVoiceProfile(profile);
    expect(config.provider).toBe('telnyx');
    expect(config.voiceId).toBe('sarah-fr-female-01');
    expect(config.outputFormat).toBe('mp3');
    expect(config.sampleRate).toBe(22050);
  });

  it('publishes TTSSynthesisCompleted event on success', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.synthesize(makeRequest());
    expect(eventBus.publish).toHaveBeenCalledWith('TTSSynthesisCompleted', 'tts-service', expect.objectContaining({
      sessionId: 'session-tts-1',
      provider: 'telnyx',
    }));
  });

  it('healthCheck returns provider and cache status', async () => {
    const health = await service.healthCheck();
    expect(health.telnyx).toBe(true);
    expect(health.inworld).toBe(true);
    expect(health.cacheSize).toBe(0);
    expect(health.preferredProvider).toBe('deepgram');
  });
});
