import type { ConversationMessage } from '../../../core/llm/llm.types';

export type ConversationChannel = 'web' | 'phone' | 'api' | 'whatsapp';

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'error';

export interface ConversationConfig {
  maxTurns: number;
  maxDurationMs: number;
  enableASR: boolean;
  enableTTS: boolean;
  enableVideo: boolean;
  channel: ConversationChannel;
}

export interface ConversationSession {
  sessionId: string;
  avatarBase: 'sarah' | 'emmanuel';
  personaId: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  config: ConversationConfig;
  history: ConversationMessage[];
  turnCount: number;
  startedAt: string;
  lastTurnAt: string | null;
  totalLatencyMs: number;
  totalTokensUsed: number;
}

export interface ConversationTurnInput {
  sessionId: string;
  audioInput?: Buffer;
  textInput?: string;
}

export interface ConversationTurnResult {
  sessionId: string;
  turnNumber: number;
  asrResult?: {
    transcript: string;
    confidence: number;
    latencyMs: number;
  };
  llmResult: {
    textResponse: string;
    tokensUsed: number;
    latencyMs: number;
  };
  ttsResult?: {
    audioBuffer: Buffer;
    durationMs: number;
    latencyMs: number;
  };
  videoResult?: {
    frameUrl: string;
    latencyMs: number;
  };
  totalLatencyMs: number;
}

export interface PipelineMetrics {
  averageLatencyMs: number;
  averageTokensPerTurn: number;
  totalTurns: number;
  totalSessions: number;
  asrLatencyAvgMs: number;
  llmLatencyAvgMs: number;
  ttsLatencyAvgMs: number;
  videoLatencyAvgMs: number;
}
