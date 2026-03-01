import { VideoAvatarService } from './video.service';

jest.mock('uuid', () => ({ v4: () => 'vid-uuid-1' }));

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

describe('VideoAvatarService', () => {
  let service: VideoAvatarService;

  beforeEach(() => {
    service = new VideoAvatarService();
    jest.clearAllMocks();
  });

  it('creates a video session for sarah', async () => {
    const session = await service.createSession('sess-1', 'sarah');
    expect(session.sessionId).toBe('sess-1');
    expect(session.avatarBase).toBe('sarah');
    expect(session.status).toBe('active');
    expect(session.framesGenerated).toBe(0);
    expect(session.config.quality).toBe('high');
  });

  it('creates a video session for emmanuel', async () => {
    const session = await service.createSession('sess-2', 'emmanuel', { quality: 'medium' });
    expect(session.avatarBase).toBe('emmanuel');
    expect(session.config.quality).toBe('medium');
  });

  it('retrieves an existing session', async () => {
    await service.createSession('sess-1', 'sarah');
    const found = await service.getSession('sess-1');
    expect(found).toBeDefined();
    expect(found!.sessionId).toBe('sess-1');
  });

  it('returns undefined for non-existent session', async () => {
    const found = await service.getSession('unknown');
    expect(found).toBeUndefined();
  });

  it('closes a session and updates status', async () => {
    await service.createSession('sess-1', 'sarah');
    await service.closeSession('sess-1');
    const session = await service.getSession('sess-1');
    expect(session!.status).toBe('closed');
  });

  it('generateFrame returns frame URL and increments count', async () => {
    await service.createSession('sess-1', 'sarah');
    const result = await service.generateFrame({
      sessionId: 'sess-1',
      audioBuffer: Buffer.from('audio-data'),
    });
    expect(result.frameUrl).toContain('d-id.stub/frames/sess-1');
    expect(result.streamUrl).toContain('d-id.stub/stream/sess-1');
    expect(result.latencyMs).toBeGreaterThan(0);

    const session = await service.getSession('sess-1');
    expect(session!.framesGenerated).toBe(1);
  });

  it('publishes VideoFrameGenerated event', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.createSession('sess-1', 'sarah');
    await service.generateFrame({ sessionId: 'sess-1', audioBuffer: Buffer.from('audio') });
    expect(eventBus.publish).toHaveBeenCalledWith('VideoFrameGenerated', 'video-avatar-service', expect.objectContaining({
      sessionId: 'sess-1',
    }));
  });

  it('publishes VideoSessionStarted on create', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.createSession('sess-1', 'sarah');
    expect(eventBus.publish).toHaveBeenCalledWith('VideoSessionStarted', 'video-avatar-service', expect.objectContaining({
      sessionId: 'sess-1',
      avatarBase: 'sarah',
    }));
  });

  it('publishes VideoSessionEnded on close', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.createSession('sess-1', 'sarah');
    await service.closeSession('sess-1');
    expect(eventBus.publish).toHaveBeenCalledWith('VideoSessionEnded', 'video-avatar-service', expect.objectContaining({
      sessionId: 'sess-1',
    }));
  });

  it('getActiveSessions returns only active sessions', async () => {
    await service.createSession('sess-1', 'sarah');
    await service.createSession('sess-2', 'emmanuel');
    await service.closeSession('sess-1');

    const active = service.getActiveSessions();
    expect(active).toHaveLength(1);
    expect(active[0]!.sessionId).toBe('sess-2');
  });

  it('cleanupIdleSessions removes stale sessions', async () => {
    await service.createSession('sess-1', 'sarah');
    // Force session to look old
    const session = await service.getSession('sess-1');
    (session as any).createdAt = new Date(Date.now() - 400_000).toISOString();

    const cleaned = await service.cleanupIdleSessions(300_000);
    expect(cleaned).toBe(1);
    expect(session!.status).toBe('closed');
  });

  it('healthCheck returns D-ID status', async () => {
    await service.createSession('sess-1', 'sarah');
    const health = await service.healthCheck();
    expect(health.didApiAvailable).toBe(true);
    expect(health.activeSessionCount).toBe(1);
    expect(health.dailyUsage).toBe(1);
    expect(health.dailyLimit).toBe(500);
  });
});
