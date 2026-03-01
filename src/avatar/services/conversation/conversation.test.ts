import { ConversationManager } from './conversation.service';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: 'Bonjour ! Comment puis-je vous aider ?',
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 50, totalTokens: 150,
      stopReason: 'end_turn', latencyMs: 800,
    }),
  },
}));

// Mock persona manager
jest.mock('../persona/persona.service', () => ({
  personaManager: {
    bindToSession: jest.fn(),
    unbindSession: jest.fn(),
    getPersona: jest.fn().mockReturnValue({
      id: 'persona-sarah',
      voiceProfile: { provider: 'telnyx', voiceId: 'sarah-fr-female-01', language: 'fr-FR', speed: 1.0, pitch: 1.0, style: 'warm-professional' },
    }),
    buildEnrichedSystemPrompt: jest.fn().mockReturnValue('Tu es Sarah, la DG de SARAH OS.'),
  },
}));

// Mock ASR service
const mockASR = {
  transcribe: jest.fn().mockResolvedValue({
    sessionId: 'sess-1', provider: 'assemblyai', transcript: 'Bonjour monde',
    confidence: 0.94, language: 'fr-FR', durationMs: 1200, latencyMs: 320,
  }),
  transcribeWithFallback: jest.fn(),
  getConfigForAvatar: jest.fn().mockReturnValue({
    provider: 'assemblyai', language: 'fr-FR', enablePunctuation: true, enableSpeakerDiarization: false, model: 'default',
  }),
  healthCheck: jest.fn(),
  detectLanguage: jest.fn(),
};

// Mock TTS service
const mockTTS = {
  synthesize: jest.fn().mockResolvedValue({
    sessionId: 'sess-1', provider: 'telnyx', audioBuffer: Buffer.from('tts-audio'),
    durationMs: 2400, characterCount: 40, latencyMs: 180, cached: false,
  }),
  synthesizeWithFallback: jest.fn(),
  buildConfigFromVoiceProfile: jest.fn().mockReturnValue({
    provider: 'telnyx', voiceId: 'sarah-fr-female-01', language: 'fr-FR',
    speed: 1.0, pitch: 1.0, style: 'warm-professional', outputFormat: 'mp3', sampleRate: 22050,
  }),
  healthCheck: jest.fn(),
  getCacheStats: jest.fn(),
  clearCache: jest.fn(),
};

// Mock Video service
const mockVideo = {
  generateFrame: jest.fn().mockResolvedValue({
    sessionId: 'sess-1', frameUrl: 'https://d-id.stub/frame.webm',
    streamUrl: 'wss://d-id.stub/stream', durationMs: 2400, latencyMs: 250,
  }),
  createSession: jest.fn(),
  getSession: jest.fn(),
  closeSession: jest.fn(),
  getActiveSessions: jest.fn(),
  buildSessionConfig: jest.fn(),
  healthCheck: jest.fn(),
  cleanupIdleSessions: jest.fn(),
};

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = new ConversationManager(mockASR as any, mockTTS as any, mockVideo as any);
    jest.clearAllMocks();
  });

  it('constructs with injected services', () => {
    expect(manager).toBeInstanceOf(ConversationManager);
  });

  it('startSession creates a new conversation session', async () => {
    const session = await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    expect(session.sessionId).toBe('sess-1');
    expect(session.avatarBase).toBe('sarah');
    expect(session.personaId).toBe('persona-sarah');
    expect(session.status).toBe('active');
    expect(session.turnCount).toBe(0);
  });

  it('startSession sets correct defaults', async () => {
    const session = await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    expect(session.config.enableASR).toBe(true);
    expect(session.config.enableTTS).toBe(true);
    expect(session.config.enableVideo).toBe(true);
    expect(session.config.channel).toBe('web');
    expect(session.config.maxTurns).toBe(100);
  });

  it('getSession returns existing session', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const found = manager.getSession('sess-1');
    expect(found).toBeDefined();
    expect(found!.sessionId).toBe('sess-1');
  });

  it('getSession returns undefined for non-existent session', () => {
    expect(manager.getSession('unknown')).toBeUndefined();
  });

  it('endSession marks session as completed', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    await manager.endSession('sess-1');
    const session = manager.getSession('sess-1');
    expect(session!.status).toBe('completed');
  });

  it('getActiveSessions returns only active sessions', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    await manager.startSession('sess-2', 'emmanuel', 'persona-emmanuel');
    await manager.endSession('sess-1');

    const active = manager.getActiveSessions();
    expect(active).toHaveLength(1);
    expect(active[0]!.sessionId).toBe('sess-2');
  });

  it('processTurn with text input skips ASR', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const result = await manager.processTurn({ sessionId: 'sess-1', textInput: 'Bonjour' });

    expect(result.asrResult).toBeUndefined();
    expect(result.llmResult.textResponse).toBeTruthy();
    expect(mockASR.transcribe).not.toHaveBeenCalled();
  });

  it('processTurn with audio input runs ASR first', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const result = await manager.processTurn({ sessionId: 'sess-1', audioInput: Buffer.from('audio') });

    expect(result.asrResult).toBeDefined();
    expect(result.asrResult!.transcript).toBe('Bonjour monde');
    expect(mockASR.transcribe).toHaveBeenCalled();
  });

  it('processTurn runs LLM and returns text response', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const result = await manager.processTurn({ sessionId: 'sess-1', textInput: 'Bonjour' });

    expect(result.llmResult.textResponse).toBe('Bonjour ! Comment puis-je vous aider ?');
    expect(result.llmResult.tokensUsed).toBe(150);
    expect(result.llmResult.latencyMs).toBe(800);
  });

  it('processTurn runs TTS when enabled', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const result = await manager.processTurn({ sessionId: 'sess-1', textInput: 'Bonjour' });

    expect(result.ttsResult).toBeDefined();
    expect(result.ttsResult!.audioBuffer).toBeInstanceOf(Buffer);
    expect(mockTTS.synthesize).toHaveBeenCalled();
  });

  it('processTurn runs video when enabled and TTS available', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    const result = await manager.processTurn({ sessionId: 'sess-1', textInput: 'Bonjour' });

    expect(result.videoResult).toBeDefined();
    expect(result.videoResult!.frameUrl).toContain('d-id.stub');
    expect(mockVideo.generateFrame).toHaveBeenCalled();
  });

  it('publishes ConversationTurnCompleted event', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    await manager.processTurn({ sessionId: 'sess-1', textInput: 'Bonjour' });

    expect(eventBus.publish).toHaveBeenCalledWith('ConversationTurnCompleted', 'conversation-manager', expect.objectContaining({
      sessionId: 'sess-1',
      turnNumber: 1,
    }));
  });

  it('processTurn increments turn count and updates history', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    await manager.processTurn({ sessionId: 'sess-1', textInput: 'Premier message' });
    await manager.processTurn({ sessionId: 'sess-1', textInput: 'Deuxième message' });

    const session = manager.getSession('sess-1');
    expect(session!.turnCount).toBe(2);
    expect(session!.history).toHaveLength(4); // 2 user + 2 assistant
    expect(session!.totalTokensUsed).toBe(300); // 150 * 2
  });

  it('getMetrics returns pipeline metrics', async () => {
    await manager.startSession('sess-1', 'sarah', 'persona-sarah');
    await manager.processTurn({ sessionId: 'sess-1', textInput: 'Test' });

    const metrics = manager.getMetrics();
    expect(metrics.totalTurns).toBe(1);
    expect(metrics.totalSessions).toBe(1);
    expect(metrics.llmLatencyAvgMs).toBe(800);
    expect(metrics.ttsLatencyAvgMs).toBe(180);
    expect(metrics.videoLatencyAvgMs).toBe(250);
  });
});
