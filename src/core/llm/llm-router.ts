import { logger } from '../../utils/logger';
import { callLLM } from './llm-client';
import { tokenTracker } from './token-tracker';
import { recordAgentUsage } from './llm-billing-bridge';
import type { ModelTier, LLMRequest, LLMResponse } from './llm.types';

export class LLMRouter {
  private static readonly tierForLevel: Record<number, ModelTier> = {
    1: 'fast',
    2: 'standard',
    3: 'advanced',
  };

  static getTierForLevel(level: 1 | 2 | 3): ModelTier {
    return this.tierForLevel[level] ?? 'standard';
  }

  static async route(request: LLMRequest): Promise<LLMResponse> {
    // Auto-enable extended thinking for advanced tier (L3 agents)
    if (request.modelTier === 'advanced' && request.enableThinking !== false) {
      request.enableThinking = true;
      request.thinkingBudgetTokens = request.thinkingBudgetTokens ?? 4096;
    }

    logger.debug('Routing LLM request', {
      agent: request.agentName,
      tier: request.modelTier,
      thinking: request.enableThinking ?? false,
    });

    const response = await callLLM(request);

    tokenTracker.record({
      agentId: request.agentId,
      agentName: request.agentName,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      timestamp: new Date().toISOString(),
    });

    // Fire-and-forget: log to billing system for admin visibility
    recordAgentUsage(response, request.agentId, request.agentName).catch(() => {
      // Error already logged inside recordAgentUsage
    });

    return response;
  }
}
