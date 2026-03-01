import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import type { DIDConfig } from '../../config/avatar.types';
import type {
  VideoSessionConfig,
  VideoSession,
  VideoFrameRequest,
  VideoFrameResult,
  VideoHealthStatus,
} from './video.types';

const DEFAULT_SESSION_CONFIG: VideoSessionConfig = {
  sourceUrl: '',
  driverId: 'simulated',
  quality: 'high',
  faceDetection: true,
  persistentConnection: true,
  idleTimeoutMs: 300_000,
};

export class VideoAvatarService {
  private sessions = new Map<string, VideoSession>();
  private dailyUsage = 0;
  private readonly dailyLimit = 500;

  constructor() {
    logger.info('Video Avatar Service initialized');
  }

  async createSession(
    sessionId: string,
    avatarBase: 'sarah' | 'emmanuel',
    config?: Partial<VideoSessionConfig>,
  ): Promise<VideoSession> {
    const session: VideoSession = {
      id: uuidv4(),
      sessionId,
      avatarBase,
      status: 'active',
      config: { ...DEFAULT_SESSION_CONFIG, ...config },
      createdAt: new Date().toISOString(),
      lastFrameAt: null,
      framesGenerated: 0,
    };

    this.sessions.set(sessionId, session);
    this.dailyUsage++;

    await eventBus.publish('VideoSessionStarted', 'video-avatar-service', {
      sessionId,
      avatarBase,
      quality: session.config.quality,
    });

    logger.info('Video session created', { sessionId, avatarBase });
    return session;
  }

  async getSession(sessionId: string): Promise<VideoSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'closed';

    await eventBus.publish('VideoSessionEnded', 'video-avatar-service', {
      sessionId,
      avatarBase: session.avatarBase,
      framesGenerated: session.framesGenerated,
    });

    logger.info('Video session closed', { sessionId, framesGenerated: session.framesGenerated });
  }

  getActiveSessions(): VideoSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === 'active' || s.status === 'idle',
    );
  }

  async generateFrame(request: VideoFrameRequest): Promise<VideoFrameResult> {
    const session = this.sessions.get(request.sessionId);
    if (session) {
      session.framesGenerated++;
      session.lastFrameAt = new Date().toISOString();
    }

    // Stub — intégration D-ID streaming en production
    const frameUrl = `https://d-id.stub/frames/${request.sessionId}/${Date.now()}.webm`;
    const result: VideoFrameResult = {
      sessionId: request.sessionId,
      frameUrl,
      streamUrl: `wss://d-id.stub/stream/${request.sessionId}`,
      durationMs: Math.floor(request.audioBuffer.length / 32),
      latencyMs: 250,
    };

    await eventBus.publish('VideoFrameGenerated', 'video-avatar-service', {
      sessionId: request.sessionId,
      frameUrl: result.frameUrl,
      latencyMs: result.latencyMs,
    });

    return result;
  }

  buildSessionConfig(didConfig: DIDConfig): VideoSessionConfig {
    return {
      sourceUrl: didConfig.sourceUrl,
      driverId: (didConfig.driverId as VideoSessionConfig['driverId']) || 'simulated',
      quality: (didConfig.sessionConfig['quality'] as VideoSessionConfig['quality']) ?? 'high',
      faceDetection: (didConfig.sessionConfig['faceDetection'] as boolean) ?? true,
      persistentConnection: true,
      idleTimeoutMs: 300_000,
    };
  }

  async healthCheck(): Promise<VideoHealthStatus> {
    return {
      didApiAvailable: true,
      activeSessionCount: this.getActiveSessions().length,
      dailyUsage: this.dailyUsage,
      dailyLimit: this.dailyLimit,
    };
  }

  async cleanupIdleSessions(maxIdleMs = 300_000): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions) {
      if (session.status === 'closed') continue;

      const lastActivity = session.lastFrameAt ?? session.createdAt;
      const idleTime = now - new Date(lastActivity).getTime();

      if (idleTime > maxIdleMs) {
        session.status = 'closed';
        cleaned++;
        logger.info('Cleaned up idle video session', { sessionId, idleTime });
      }
    }

    return cleaned;
  }
}

export const videoAvatarService = new VideoAvatarService();
