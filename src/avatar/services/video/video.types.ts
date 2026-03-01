export type VideoQuality = 'low' | 'medium' | 'high';

export type VideoDriverId = 'microsoft' | 'wav2lip' | 'simulated';

export interface VideoSessionConfig {
  sourceUrl: string;
  driverId: VideoDriverId;
  quality: VideoQuality;
  faceDetection: boolean;
  persistentConnection: boolean;
  idleTimeoutMs: number;
}

export interface VideoSession {
  id: string;
  sessionId: string;
  avatarBase: 'sarah' | 'emmanuel';
  status: 'creating' | 'active' | 'idle' | 'closed' | 'error';
  config: VideoSessionConfig;
  createdAt: string;
  lastFrameAt: string | null;
  framesGenerated: number;
}

export interface VideoFrameRequest {
  sessionId: string;
  audioBuffer: Buffer;
  text?: string;
}

export interface VideoFrameResult {
  sessionId: string;
  frameUrl: string;
  streamUrl?: string;
  durationMs: number;
  latencyMs: number;
}

export interface VideoHealthStatus {
  didApiAvailable: boolean;
  activeSessionCount: number;
  dailyUsage: number;
  dailyLimit: number;
}
