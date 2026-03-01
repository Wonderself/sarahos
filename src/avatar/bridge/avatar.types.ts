export interface AvatarPipelineRequest {
  sessionId: string;
  avatarBase: 'sarah' | 'emmanuel';
  audioInput?: Buffer;
  textInput?: string;
  clientConfig?: {
    avatarName: string;
    companyName: string;
    systemPrompt: string;
  };
}

export interface AvatarPipelineResponse {
  sessionId: string;
  textResponse: string;
  audioOutput?: Buffer;
  videoFrameUrl?: string;
  latencyMs: number;
  tokensUsed: number;
}

export interface AvatarHealthStatus {
  asrService: boolean;
  ttsService: boolean;
  didService: boolean;
  twilioService: boolean;
  overallHealthy: boolean;
}
