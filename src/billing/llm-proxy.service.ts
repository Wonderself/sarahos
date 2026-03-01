import { logger } from '../utils/logger';
import { calculateTokenCost } from './pricing';
import { walletService } from './wallet.service';
import { callLLM } from '../core/llm/llm-client';
import { streamLLM } from '../core/llm/llm-stream';
import type { SSEWriter } from '../core/llm/llm-stream';
import type { ModelTier, LLMRequest } from '../core/llm/llm.types';
import type { LlmUsageEntry } from './billing.types';
import { userRepository } from '../users/user.repository';

export interface LlmProxyRequest {
  userId: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  agentName?: string;
  endpoint?: string;
  requestId?: string;
}

export interface LlmProxyResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCredits: number;
  billedCredits: number;
  durationMs: number;
}

/**
 * LLM Proxy Service — wraps Anthropic API calls with:
 * - Pre-flight balance check + daily budget limit
 * - Token counting + cost calculation
 * - Wallet billing with 20% margin
 * - Usage logging for analytics
 */
export class LlmProxyService {
  /**
   * Process an LLM request with billing.
   * Steps: 1) Check budget → 2) Check balance → 3) Call LLM → 4) Deduct credits → 5) Log usage
   */
  async processRequest(request: LlmProxyRequest): Promise<LlmProxyResponse | { error: string; code: string }> {
    const startTime = Date.now();

    // 1. Estimate cost for pre-flight check (rough estimate based on input)
    const estimatedInputTokens = this.estimateInputTokens(request.messages);
    const maxOutput = request.maxTokens ?? 4096;
    const estimate = calculateTokenCost(request.model, estimatedInputTokens, maxOutput);

    // 2. Daily budget check
    const withinBudget = await this.checkDailyBudget(request.userId, estimate.billedCredits);
    if (!withinBudget) {
      logger.warn('LLM proxy: daily budget exceeded', { userId: request.userId });
      return { error: 'Daily spending limit exceeded', code: 'DAILY_BUDGET_EXCEEDED' };
    }

    // 3. Pre-flight balance check
    const hasBalance = await walletService.hasBalance(request.userId, estimate.billedCredits);
    if (!hasBalance) {
      logger.warn('LLM proxy: insufficient balance', {
        userId: request.userId,
        estimatedCost: estimate.billedCredits,
      });
      return { error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' };
    }

    // 4. Call LLM via Anthropic SDK
    const llmResult = await this.callLlm(request);
    const durationMs = Date.now() - startTime;

    // 4. Calculate actual cost with user's commission rate
    const rawCost = calculateTokenCost(request.model, llmResult.inputTokens, llmResult.outputTokens);
    const actualCost = await this.applyUserCommission(request.userId, rawCost);

    // 5. Deduct from wallet
    const withdrawal = await walletService.withdraw(
      request.userId,
      actualCost.billedCredits,
      `LLM usage: ${request.model} (${llmResult.totalTokens} tokens)`,
      'llm_usage',
      request.requestId,
    );

    if (!withdrawal) {
      logger.error('LLM proxy: failed to deduct credits after LLM call', {
        userId: request.userId,
        cost: actualCost.billedCredits,
      });
      // Still return the result — we'll reconcile billing later
    }

    // 6. Log usage for analytics
    const wallet = await walletService.getWalletByUserId(request.userId);
    const usageEntry: Omit<LlmUsageEntry, 'id' | 'createdAt'> = {
      userId: request.userId,
      walletId: wallet?.id ?? null,
      requestId: request.requestId ?? null,
      model: request.model,
      provider: 'anthropic',
      inputTokens: llmResult.inputTokens,
      outputTokens: llmResult.outputTokens,
      totalTokens: llmResult.totalTokens,
      costCredits: actualCost.costCredits,
      billedCredits: actualCost.billedCredits,
      marginCredits: actualCost.marginCredits,
      agentName: request.agentName ?? null,
      endpoint: request.endpoint ?? null,
      durationMs,
      metadata: {},
    };
    await walletService.recordLlmUsage(usageEntry);

    logger.info('LLM proxy request completed', {
      userId: request.userId,
      model: request.model,
      tokens: llmResult.totalTokens,
      billedCredits: actualCost.billedCredits,
      durationMs,
    });

    return {
      content: llmResult.content,
      model: request.model,
      inputTokens: llmResult.inputTokens,
      outputTokens: llmResult.outputTokens,
      totalTokens: llmResult.totalTokens,
      costCredits: actualCost.costCredits,
      billedCredits: actualCost.billedCredits,
      durationMs,
    };
  }

  /**
   * Pre-flight check for balance and daily budget.
   * Returns null if OK, or an error object if blocked.
   */
  async preFlightCheck(request: LlmProxyRequest): Promise<{ error: string; code: string } | null> {
    const estimatedInputTokens = this.estimateInputTokens(request.messages);
    const maxOutput = request.maxTokens ?? 4096;
    const estimate = calculateTokenCost(request.model, estimatedInputTokens, maxOutput);

    const withinBudget = await this.checkDailyBudget(request.userId, estimate.billedCredits);
    if (!withinBudget) {
      return { error: 'Daily spending limit exceeded', code: 'DAILY_BUDGET_EXCEEDED' };
    }

    const hasBalance = await walletService.hasBalance(request.userId, estimate.billedCredits);
    if (!hasBalance) {
      return { error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' };
    }

    return null;
  }

  /**
   * Process a streaming LLM request with billing.
   * Pre-flight already checked by caller; this streams and bills after.
   */
  async processStreamRequest(
    request: LlmProxyRequest,
    sseWriter: SSEWriter,
  ): Promise<void> {
    // Stream LLM response
    const startTime = Date.now();
    const llmRequest = this.mapToLLMRequest(request);
    const response = await streamLLM(llmRequest, sseWriter);
    const durationMs = Date.now() - startTime;

    // 3. Post-stream billing with user's commission rate
    const rawCost = calculateTokenCost(request.model, response.inputTokens, response.outputTokens);
    const actualCost = await this.applyUserCommission(request.userId, rawCost);

    await walletService.withdraw(
      request.userId,
      actualCost.billedCredits,
      `LLM stream: ${request.model} (${response.totalTokens} tokens)`,
      'llm_usage',
      request.requestId,
    );

    const wallet = await walletService.getWalletByUserId(request.userId);
    await walletService.recordLlmUsage({
      userId: request.userId,
      walletId: wallet?.id ?? null,
      requestId: request.requestId ?? null,
      model: request.model,
      provider: 'anthropic',
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      costCredits: actualCost.costCredits,
      billedCredits: actualCost.billedCredits,
      marginCredits: actualCost.marginCredits,
      agentName: request.agentName ?? null,
      endpoint: request.endpoint ?? '/billing/llm/stream',
      durationMs,
      metadata: { streaming: true },
    });

    logger.info('LLM stream request completed', {
      userId: request.userId,
      model: request.model,
      tokens: response.totalTokens,
      billedCredits: actualCost.billedCredits,
      durationMs,
    });
  }

  /**
   * Apply the user's commission rate to raw token cost.
   * Commission is locked at registration based on user number (0%/5%/7%).
   */
  private async applyUserCommission(
    userId: string,
    cost: { costCredits: number; billedCredits: number; marginCredits: number },
  ): Promise<{ costCredits: number; billedCredits: number; marginCredits: number }> {
    try {
      const user = await userRepository.findById(userId);
      if (user && user.commissionRate > 0) {
        const billedCredits = Math.ceil(cost.costCredits * (1 + user.commissionRate));
        return {
          costCredits: cost.costCredits,
          billedCredits,
          marginCredits: billedCredits - cost.costCredits,
        };
      }
    } catch (err) {
      logger.warn('Failed to load user commission rate, using raw cost', { userId, err });
    }
    return cost;
  }

  /**
   * Rough token estimation (~4 chars per token).
   */
  private estimateInputTokens(messages: Array<{ role: string; content: string }>): number {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length + m.role.length + 4, 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * Call the real Anthropic SDK via the shared llm-client.
   * Maps the billing request format to the core LLMRequest format.
   */
  private async callLlm(request: LlmProxyRequest): Promise<{
    content: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }> {
    const llmRequest = this.mapToLLMRequest(request);
    const response = await callLLM(llmRequest);

    return {
      content: response.content,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
    };
  }

  /**
   * Map billing proxy request to core LLMRequest format.
   */
  private mapToLLMRequest(request: LlmProxyRequest): LLMRequest {
    const systemMsg = request.messages.find((m) => m.role === 'system');
    const nonSystemMsgs = request.messages.filter((m) => m.role !== 'system');

    const lastMsg = nonSystemMsgs[nonSystemMsgs.length - 1];
    const history = nonSystemMsgs.slice(0, -1);

    return {
      agentId: request.agentName ?? 'llm-proxy',
      agentName: request.agentName ?? 'LLM Proxy',
      modelTier: this.resolveModelTier(request.model),
      systemPrompt: systemMsg?.content ?? 'You are a helpful AI assistant.',
      userMessage: lastMsg?.content ?? '',
      conversationHistory:
        history.length > 0
          ? history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
          : undefined,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
    };
  }

  /**
   * Resolve model tier from model name string.
   */
  private resolveModelTier(model: string): ModelTier {
    if (model.includes('opus')) return 'advanced';
    if (model.includes('haiku')) return 'fast';
    return 'standard';
  }

  /**
   * Check if user is within their daily spending limit.
   * Default: 100 credits/day (configurable via LLM_DAILY_LIMIT_CREDITS env var).
   */
  private async checkDailyBudget(userId: string, estimatedCost: number): Promise<boolean> {
    try {
      const limitCredits = Number(process.env['LLM_DAILY_LIMIT_CREDITS'] ?? 100_000_000); // 100 credits default
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const usage = await walletService.getUsageSummary(userId, today, tomorrow);
      return (usage.totalBilledCredits + estimatedCost) <= limitCredits;
    } catch {
      // If we can't check, allow the request (fail open)
      return true;
    }
  }
}

export const llmProxyService = new LlmProxyService();
