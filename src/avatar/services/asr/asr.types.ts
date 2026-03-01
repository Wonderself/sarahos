export type ASRProvider = 'assemblyai' | 'whisper' | 'deepgram';

export type ASRLanguage = 'fr-FR' | 'en-US' | 'he-IL' | 'auto';

export interface ASRConfig {
  provider: ASRProvider;
  language: ASRLanguage;
  enablePunctuation: boolean;
  enableSpeakerDiarization: boolean;
  model: 'default' | 'phone_call' | 'meeting';
}

export interface ASRRequest {
  sessionId: string;
  audioBuffer: Buffer;
  config: ASRConfig;
  fallbackProvider?: ASRProvider;
}

export interface ASRResult {
  sessionId: string;
  provider: ASRProvider;
  transcript: string;
  confidence: number;
  language: string;
  durationMs: number;
  words?: ASRWord[];
  latencyMs: number;
}

export interface ASRWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface ASRHealthStatus {
  assemblyai: boolean;
  whisper: boolean;
  deepgram: boolean;
  preferredProvider: ASRProvider;
}
