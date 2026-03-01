import { logger } from '../../utils/logger';
import { AvatarPipelineError } from '../../utils/errors';
import { withRetry } from '../../utils/retry';
import type { AvatarPipelineRequest, AvatarPipelineResponse, AvatarHealthStatus } from './avatar.types';

export class AvatarBridge {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env['AVATAR_PYTHON_URL'] ?? 'http://localhost:8000';
  }

  async processConversation(request: AvatarPipelineRequest): Promise<AvatarPipelineResponse> {
    return withRetry(
      async () => {
        const response = await fetch(`${this.baseUrl}/conversation/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: request.sessionId,
            avatar_base: request.avatarBase,
            text_input: request.textInput,
            client_config: request.clientConfig,
          }),
        });

        if (!response.ok) {
          throw new AvatarPipelineError(
            `Avatar pipeline error: ${response.status} ${response.statusText}`
          );
        }

        const data = (await response.json()) as {
          session_id: string;
          text_response: string;
          audio_output?: string;
          video_frame_url?: string;
          latency_ms: number;
          tokens_used: number;
        };

        return {
          sessionId: data.session_id,
          textResponse: data.text_response,
          videoFrameUrl: data.video_frame_url,
          latencyMs: data.latency_ms,
          tokensUsed: data.tokens_used,
        };
      },
      'avatar-pipeline',
      { maxRetries: 1 }
    );
  }

  async healthCheck(): Promise<AvatarHealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        return { asrService: false, ttsService: false, didService: false, twilioService: false, overallHealthy: false };
      }
      return (await response.json()) as AvatarHealthStatus;
    } catch {
      logger.warn('Avatar pipeline health check failed');
      return { asrService: false, ttsService: false, didService: false, twilioService: false, overallHealthy: false };
    }
  }
}

export const avatarBridge = new AvatarBridge();
