import { logger } from '../../utils/logger';
import { calculateTokenCost } from '../../billing/pricing';
import { walletService } from '../../billing/wallet.service';
import type { LLMResponse } from './llm.types';

/** Well-known system user ID for agent-internal LLM costs. */
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Record agent LLM usage in the billing system.
 * Logs to llm_usage_log with cost calculation but no wallet deduction
 * (system doesn't pay itself — this is for admin visibility).
 */
export async function recordAgentUsage(
  response: LLMResponse,
  agentId: string,
  agentName: string,
): Promise<void> {
  try {
    const cost = calculateTokenCost(response.model, response.inputTokens, response.outputTokens);

    await walletService.recordLlmUsage({
      userId: SYSTEM_USER_ID,
      walletId: null,
      requestId: null,
      model: response.model,
      provider: 'anthropic',
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      costCredits: cost.costCredits,
      billedCredits: cost.billedCredits,
      marginCredits: cost.marginCredits,
      agentName,
      endpoint: `agent:${agentId}`,
      durationMs: response.latencyMs,
      metadata: { source: 'agent-internal' },
    });
  } catch (error) {
    logger.error('Failed to record agent LLM usage to billing', {
      agentId,
      agentName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
