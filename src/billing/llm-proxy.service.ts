import { logger } from '../utils/logger';
import { calculateTokenCost } from './pricing';
import { walletService } from './wallet.service';
import { callLLM } from '../core/llm/llm-client';
import { streamLLM } from '../core/llm/llm-stream';
import type { SSEWriter } from '../core/llm/llm-stream';
import type { ModelTier, LLMRequest } from '../core/llm/llm.types';
import type { LlmUsageEntry } from './billing.types';
import { userRepository } from '../users/user.repository';
// ── Guardrails Integration ──
import { beforeClaudeCall, afterClaudeCall } from '../core/guardrails/token-budget-manager';
import { checkAgentCircuitBreaker, recordAgentTokens, recordGlobalTokens } from '../core/guardrails/circuit-breaker-enhanced';
import { getUserMode } from '../core/guardrails/user-mode';
import { selectModel } from '../core/guardrails/model-router';
import { optimizeConversationContext } from '../core/guardrails/memory-optimizer';
import { getSecuritySystemPromptSuffix } from '../core/guardrails/security-hardening';
import { startChain, recordChainTokens, endChain } from '../core/guardrails/loop-detector';
import type { TokenEvent } from '../core/guardrails/guardrails.types';

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
   * Uses hold/release pattern: 1) Check budget → 2) Hold estimated cost → 3) Call LLM → 4) Release hold (refund difference) → 5) Log usage
   */
  async processRequest(request: LlmProxyRequest): Promise<LlmProxyResponse | { error: string; code: string }> {
    const startTime = Date.now();

    // ── Guardrails: Pre-flight checks ──
    const agentMode = await getUserMode(request.userId);
    const estimatedInputTokens = this.estimateInputTokens(request.messages);

    // Guardrails: Token budget check (per-minute/hour/day Redis counters)
    const budgetCheck = await beforeClaudeCall(request.userId, estimatedInputTokens, agentMode);
    if (!budgetCheck.allowed) {
      logger.warn('LLM proxy: guardrail token budget blocked', { userId: request.userId, reason: budgetCheck.reason });
      return { error: budgetCheck.userMessage ?? 'Token budget exceeded', code: 'TOKEN_BUDGET_EXCEEDED' };
    }

    // Guardrails: Agent circuit breaker check
    const agentId = request.agentName ?? 'unknown';
    const agentBreaker = await checkAgentCircuitBreaker(agentId);
    if (!agentBreaker.allowed) {
      return { error: agentBreaker.reason ?? 'Agent suspended', code: 'AGENT_SUSPENDED' };
    }

    // Guardrails: Loop detection for agent chains
    let chainId: string | undefined;
    if (agentMode === 'pro') {
      const chain = startChain(request.userId, agentMode as 'pro' | 'eco');
      chainId = chain.chainId;
    }

    // Guardrails: Optimize conversation context (sliding window + summarization)
    const optimizedResult = await optimizeConversationContext(
      request.userId, agentId, 'default',
      request.messages.filter(m => m.role !== 'system') as Array<{ role: 'user' | 'assistant'; content: string }>,
      agentMode as 'pro' | 'eco',
    ).catch(() => null);
    const optimizedMessages = optimizedResult
      ? optimizedResult.recentMessages.map(m => ({ role: m.role, content: m.content }))
      : request.messages;

    // Guardrails: Append security suffix to system prompt
    const securitySuffix = getSecuritySystemPromptSuffix();
    const securedMessages = [...optimizedMessages];
    if (securitySuffix && securedMessages.length > 0 && securedMessages[0]?.role === 'system') {
      securedMessages[0] = { ...securedMessages[0], content: securedMessages[0].content + '\n\n' + securitySuffix };
    }

    // Guardrails: Model routing (may override requested model)
    const effectiveModel = await selectModel(request.userId, agentId, 'chat', estimatedInputTokens, agentMode);

    // Cap maxTokens based on guardrails budget check
    const maxOutput = Math.min(request.maxTokens ?? 4096, budgetCheck.maxTokensAllowed);
    const estimate = calculateTokenCost(effectiveModel, estimatedInputTokens, maxOutput);

    // 2. Daily budget check (existing — kept as fallback)
    const withinBudget = await this.checkDailyBudget(request.userId, estimate.billedCredits);
    if (!withinBudget) {
      logger.warn('LLM proxy: daily budget exceeded', { userId: request.userId });
      return { error: 'Daily spending limit exceeded', code: 'DAILY_BUDGET_EXCEEDED' };
    }

    // 3. Hold estimated cost atomically (prevents race conditions)
    const holdId = await walletService.hold(
      request.userId,
      estimate.billedCredits,
      `LLM hold: ${request.model} (estimated)`,
    );
    if (!holdId) {
      // Check if auto-topup is enabled and notify
      let autoTopupRequested = false;
      try {
        const settings = await walletService.getAutoTopupSettings(request.userId);
        if (settings?.autoTopupEnabled) {
          autoTopupRequested = true;
          logger.info('LLM proxy: low-balance alert user has insufficient balance', { userId: request.userId });
        }
      } catch { /* ignore */ }

      logger.warn('LLM proxy: insufficient balance for hold', {
        userId: request.userId,
        estimatedCost: estimate.billedCredits,
        autoTopupRequested,
      });
      return { error: `Insufficient balance${autoTopupRequested ? ' (low-balance alert active)' : ''}`, code: 'INSUFFICIENT_BALANCE' };
    }

    // 4. Call LLM via Anthropic SDK (credits already held)
    let llmResult: { content: string; inputTokens: number; outputTokens: number; totalTokens: number; cacheReadTokens?: number; cacheCreatedTokens?: number };
    try {
      llmResult = await this.callLlm({ ...request, model: effectiveModel, messages: securedMessages });
    } catch (error) {
      // LLM call failed — full refund of hold
      await walletService.releaseHold(request.userId, holdId, estimate.billedCredits, 0);
      throw error;
    }
    const durationMs = Date.now() - startTime;

    // Guardrails: Record chain tokens and end chain
    if (chainId) {
      recordChainTokens(chainId, llmResult.totalTokens);
      endChain(chainId);
    }

    // 5. Calculate actual cost and release hold (refund overestimate)
    const rawCost = calculateTokenCost(effectiveModel, llmResult.inputTokens, llmResult.outputTokens);
    const actualCost = await this.applyUserCommission(request.userId, rawCost);
    await walletService.releaseHold(request.userId, holdId, estimate.billedCredits, actualCost.billedCredits);

    // 6. Log usage for analytics
    const wallet = await walletService.getWalletByUserId(request.userId);
    const usageEntry: Omit<LlmUsageEntry, 'id' | 'createdAt'> = {
      userId: request.userId,
      walletId: wallet?.id ?? null,
      requestId: request.requestId ?? null,
      model: effectiveModel,
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

    // ── Guardrails: Post-call recording ──
    const tokenEvent: TokenEvent = {
      userId: request.userId,
      model: effectiveModel,
      inputTokens: llmResult.inputTokens,
      outputTokens: llmResult.outputTokens,
      cacheReadTokens: llmResult.cacheReadTokens ?? 0,
      cacheCreationTokens: llmResult.cacheCreatedTokens ?? 0,
      costMicroCredits: actualCost.billedCredits,
      agentName: agentId,
      requestType: 'chat',
      mode: agentMode,
    };
    await afterClaudeCall(request.userId, tokenEvent).catch((e) =>
      logger.warn('Guardrails afterClaudeCall failed', { error: e instanceof Error ? e.message : String(e) }),
    );
    await recordAgentTokens(agentId, llmResult.totalTokens).catch(() => { /* best-effort */ });
    await recordGlobalTokens(llmResult.totalTokens).catch(() => { /* best-effort */ });

    logger.info('LLM proxy request completed', {
      userId: request.userId,
      model: effectiveModel,
      tokens: llmResult.totalTokens,
      billedCredits: actualCost.billedCredits,
      durationMs,
    });

    return {
      content: llmResult.content,
      model: effectiveModel,
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
   * Uses hold/release pattern (same as processRequest) to prevent overdraft.
   */
  async processStreamRequest(
    request: LlmProxyRequest,
    sseWriter: SSEWriter,
  ): Promise<void> {
    const startTime = Date.now();

    // ── Guardrails: Pre-flight checks for streaming ──
    const streamAgentMode = await getUserMode(request.userId);
    const estimatedInputTokens = this.estimateInputTokens(request.messages);

    const streamBudgetCheck = await beforeClaudeCall(request.userId, estimatedInputTokens, streamAgentMode);
    if (!streamBudgetCheck.allowed) {
      throw new Error(streamBudgetCheck.userMessage ?? 'Token budget exceeded');
    }

    const streamAgentId = request.agentName ?? 'unknown';
    const streamAgentBreaker = await checkAgentCircuitBreaker(streamAgentId);
    if (!streamAgentBreaker.allowed) {
      throw new Error(streamAgentBreaker.reason ?? 'Agent suspended');
    }

    // Guardrails: Loop detection for agent chains (streaming)
    let streamChainId: string | undefined;
    if (streamAgentMode === 'pro') {
      const chain = startChain(request.userId, streamAgentMode as 'pro' | 'eco');
      streamChainId = chain.chainId;
    }

    // Guardrails: Optimize conversation context (sliding window + summarization)
    const optimizedStreamResult = await optimizeConversationContext(
      request.userId, streamAgentId, 'default',
      request.messages.filter(m => m.role !== 'system') as Array<{ role: 'user' | 'assistant'; content: string }>,
      streamAgentMode as 'pro' | 'eco',
    ).catch(() => null);
    const optimizedStreamMessages = optimizedStreamResult
      ? optimizedStreamResult.recentMessages.map(m => ({ role: m.role, content: m.content }))
      : request.messages;

    // Guardrails: Append security suffix to system prompt
    const streamSecuritySuffix = getSecuritySystemPromptSuffix();
    const securedStreamMessages = [...optimizedStreamMessages];
    if (streamSecuritySuffix && securedStreamMessages.length > 0 && securedStreamMessages[0]?.role === 'system') {
      securedStreamMessages[0] = { ...securedStreamMessages[0], content: securedStreamMessages[0].content + '\n\n' + streamSecuritySuffix };
    }

    // Guardrails: Model routing (may override requested model)
    const streamEffectiveModel = await selectModel(request.userId, streamAgentId, 'chat', estimatedInputTokens, streamAgentMode);

    // 1. Hold estimated cost atomically before streaming
    const maxOutput = Math.min(request.maxTokens ?? 4096, streamBudgetCheck.maxTokensAllowed);
    const estimate = calculateTokenCost(streamEffectiveModel, estimatedInputTokens, maxOutput);

    const holdId = await walletService.hold(
      request.userId,
      estimate.billedCredits,
      `LLM stream hold: ${streamEffectiveModel} (estimated)`,
    );
    if (!holdId) {
      throw new Error('Insufficient balance for streaming request');
    }

    // 2. Stream LLM response (credits already held)
    let response: { inputTokens: number; outputTokens: number; totalTokens: number };
    try {
      const llmRequest = this.mapToLLMRequest({ ...request, model: streamEffectiveModel, messages: securedStreamMessages });
      response = await streamLLM(llmRequest, sseWriter);
    } catch (error) {
      // Stream failed — full refund of hold
      await walletService.releaseHold(request.userId, holdId, estimate.billedCredits, 0);
      throw error;
    }
    const durationMs = Date.now() - startTime;

    // Guardrails: Record chain tokens and end chain (streaming)
    if (streamChainId) {
      recordChainTokens(streamChainId, response.totalTokens);
      endChain(streamChainId);
    }

    // 3. Calculate actual cost and release hold (refund overestimate)
    const rawCost = calculateTokenCost(streamEffectiveModel, response.inputTokens, response.outputTokens);
    const actualCost = await this.applyUserCommission(request.userId, rawCost);
    await walletService.releaseHold(request.userId, holdId, estimate.billedCredits, actualCost.billedCredits);

    // 4. Log usage
    const wallet = await walletService.getWalletByUserId(request.userId);
    await walletService.recordLlmUsage({
      userId: request.userId,
      walletId: wallet?.id ?? null,
      requestId: request.requestId ?? null,
      model: streamEffectiveModel,
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

    // ── Guardrails: Post-call recording for streaming ──
    const streamTokenEvent: TokenEvent = {
      userId: request.userId,
      model: streamEffectiveModel,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      cacheReadTokens: 0, // streaming doesn't return cache details
      cacheCreationTokens: 0,
      costMicroCredits: actualCost.billedCredits,
      agentName: streamAgentId,
      requestType: 'chat',
      mode: streamAgentMode,
    };
    await afterClaudeCall(request.userId, streamTokenEvent).catch(() => { /* best-effort */ });
    await recordAgentTokens(streamAgentId, response.totalTokens).catch(() => { /* best-effort */ });
    await recordGlobalTokens(response.totalTokens).catch(() => { /* best-effort */ });

    logger.info('LLM stream request completed', {
      userId: request.userId,
      model: streamEffectiveModel,
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
        // Apply commission ON TOP of the already-margined billedCredits (preserves 1% safety margin)
        const billedCredits = Math.ceil(cost.billedCredits * (1 + user.commissionRate));
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
   * Conservative token estimation for French/multilingual text.
   * French averages ~2.5 chars per token due to accents and longer words.
   */
  private estimateInputTokens(messages: Array<{ role: string; content: string }>): number {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length + m.role.length + 4, 0);
    return Math.ceil(totalChars / 2.5);
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
    cacheReadTokens?: number;
    cacheCreatedTokens?: number;
  }> {
    const llmRequest = this.mapToLLMRequest(request);
    const response = await callLLM(llmRequest);

    return {
      content: response.content,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      cacheReadTokens: response.cacheReadTokens,
      cacheCreatedTokens: response.cacheCreatedTokens,
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
      // Use UTC consistently to avoid timezone-dependent budget windows
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const usage = await walletService.getUsageSummary(userId, today, tomorrow);
      return (usage.totalBilledCredits + estimatedCost) <= limitCredits;
    } catch (err) {
      // Fail-closed: deny request if daily budget check fails (prevents unbounded spending)
      logger.error('Daily budget check failed, denying request', { userId, err });
      return false;
    }
  }
}

export const llmProxyService = new LlmProxyService();
