export type TTSProvider = 'telnyx' | 'inworld' | 'deepgram';

export interface TTSConfig {
  provider: TTSProvider;
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
  style: string;
  outputFormat: 'pcm' | 'mp3' | 'wav';
  sampleRate: 16000 | 22050 | 44100;
}

export interface TTSRequest {
  sessionId: string;
  text: string;
  config: TTSConfig;
  fallbackProvider?: TTSProvider;
  ssml?: boolean;
}

export interface TTSResult {
  sessionId: string;
  provider: TTSProvider;
  audioBuffer: Buffer;
  durationMs: number;
  characterCount: number;
  latencyMs: number;
  cached: boolean;
}

export interface TTSCacheEntry {
  textHash: string;
  voiceId: string;
  audioBuffer: Buffer;
  createdAt: string;
  accessCount: number;
}

export interface TTSHealthStatus {
  telnyx: boolean;
  inworld: boolean;
  deepgram: boolean;
  cacheSize: number;
  preferredProvider: TTSProvider;
}
