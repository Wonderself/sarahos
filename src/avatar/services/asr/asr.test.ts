import { ASRService } from './asr.service';
import type { ASRRequest } from './asr.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

function makeRequest(overrides: Partial<ASRRequest> = {}): ASRRequest {
  return {
    sessionId: 'session-asr-1',
    audioBuffer: Buffer.from('fake-audio-data-16000hz'),
    config: { provider: 'assemblyai', language: 'fr-FR', enablePunctuation: true, enableSpeakerDiarization: false, model: 'default' },
    ...overrides,
  };
}

describe('ASRService', () => {
  let service: ASRService;

  beforeEach(() => {
    service = new ASRService();
    jest.clearAllMocks();
  });

  it('constructs with default config', () => {
    expect(service).toBeInstanceOf(ASRService);
  });

  it('constructs with custom config', () => {
    const custom = new ASRService({ provider: 'whisper', language: 'en-US' });
    expect(custom).toBeInstanceOf(ASRService);
  });

  it('transcribes with AssemblyAI provider', async () => {
    const result = await service.transcribe(makeRequest());
    expect(result.provider).toBe('assemblyai');
    expect(result.transcript).toContain('AssemblyAI stub');
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.language).toBe('fr-FR');
    expect(result.sessionId).toBe('session-asr-1');
  });

  it('transcribes with Whisper provider', async () => {
    const result = await service.transcribe(makeRequest({
      config: { provider: 'whisper', language: 'fr-FR', enablePunctuation: true, enableSpeakerDiarization: false, model: 'default' },
    }));
    expect(result.provider).toBe('whisper');
    expect(result.transcript).toContain('Whisper stub');
  });

  it('transcribeWithFallback uses primary provider first', async () => {
    const result = await service.transcribeWithFallback(makeRequest());
    expect(result.provider).toBe('assemblyai');
  });

  it('transcribeWithFallback falls back on primary failure', async () => {
    const failingService = new ASRService();
    // Mock the transcribe method to fail first, then succeed
    let callCount = 0;
    jest.spyOn(failingService, 'transcribe').mockImplementation(async (req) => {
      callCount++;
      if (callCount === 1) throw new Error('Primary provider failed');
      return {
        sessionId: req.sessionId, provider: 'whisper', transcript: 'fallback result',
        confidence: 0.88, language: 'fr-FR', durationMs: 1000, latencyMs: 450,
      };
    });

    const result = await failingService.transcribeWithFallback(makeRequest());
    expect(result.provider).toBe('whisper');
    expect(result.transcript).toBe('fallback result');
    expect(callCount).toBe(2);
  });

  it('healthCheck returns provider status', async () => {
    const health = await service.healthCheck();
    expect(health.assemblyai).toBe(true);
    expect(health.whisper).toBe(true);
    expect(health.preferredProvider).toBe('deepgram');
  });

  it('detectLanguage returns language code', async () => {
    const lang = await service.detectLanguage(Buffer.from('audio'));
    expect(lang).toBe('fr-FR');
  });

  it('getConfigForAvatar returns fr-FR for sarah', () => {
    const config = service.getConfigForAvatar('sarah');
    expect(config.language).toBe('fr-FR');
    expect(config.model).toBe('default');
  });

  it('getConfigForAvatar returns meeting model for emmanuel', () => {
    const config = service.getConfigForAvatar('emmanuel');
    expect(config.language).toBe('fr-FR');
    expect(config.model).toBe('meeting');
  });

  it('publishes ASRTranscriptionCompleted event on success', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.transcribe(makeRequest());
    expect(eventBus.publish).toHaveBeenCalledWith('ASRTranscriptionCompleted', 'asr-service', expect.objectContaining({
      sessionId: 'session-asr-1',
      provider: 'assemblyai',
    }));
  });

  it('publishes ASRTranscriptionFailed event on error', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    const failingService = new ASRService();
    jest.spyOn(failingService as any, 'transcribeAssemblyAI').mockRejectedValue(new Error('API down'));

    await expect(failingService.transcribe(makeRequest())).rejects.toThrow('API down');
    expect(eventBus.publish).toHaveBeenCalledWith('ASRTranscriptionFailed', 'asr-service', expect.objectContaining({
      sessionId: 'session-asr-1',
      error: 'API down',
    }));
  });
});
