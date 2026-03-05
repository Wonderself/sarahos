import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import { logger } from '../../utils/logger';
import { LLMError, CircuitBreakerOpenError } from '../../utils/errors';
import { withRetry } from '../../utils/retry';
import { llmCircuitBreaker } from './circuit-breaker';
import { isProviderDown, recordProviderFailure, recordProviderSuccess } from '../guardrails/fallback-manager';
import { redisClient } from '../../infra/redis/redis-client';
import type { LLMRequest, LLMResponse } from './llm.types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new LLMError('ANTHROPIC_API_KEY not configured');
    }
    client = new Anthropic({
      apiKey,
      // Enable prompt caching — costs 0.1x on cache reads, saves ~90% on repeated system prompts
      defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
    });
  }
  return client;
}

function buildMessages(
  request: LLMRequest
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (request.conversationHistory) {
    for (const msg of request.conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: request.userMessage });
  return messages;
}

/** Build a stable cache key for Redis memoization. */
function buildMemoKey(request: LLMRequest, model: string): string {
  const hash = createHash('sha256')
    .update(model)
    .update('|')
    .update(request.systemPrompt)
    .update('|')
    .update(request.userMessage)
    .digest('hex')
    .slice(0, 32);
  return `llm:memo:${hash}`;
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  const modelMap: Record<string, string> = {
    'ultra-fast': process.env['CLAUDE_MODEL_ULTRAFAST'] ?? 'claude-haiku-4-5-20251001',
    fast:         process.env['CLAUDE_MODEL_FAST']      ?? 'claude-sonnet-4-20250514',
    standard:     process.env['CLAUDE_MODEL_STANDARD']  ?? 'claude-sonnet-4-20250514',
    advanced:     process.env['CLAUDE_MODEL_ADVANCED']  ?? 'claude-opus-4-6',
  };

  const model = modelMap[request.modelTier] ?? modelMap['standard']!;
  const messages = buildMessages(request);

  logger.debug('LLM request', {
    agent: request.agentName,
    model,
    messageCount: messages.length,
    memoization: request.enableMemoization ?? false,
  });

  // ── Redis memoization (before circuit breaker — no API call needed) ──
  if (request.enableMemoization) {
    const memoKey = buildMemoKey(request, model);
    try {
      const cached = await redisClient.get(memoKey);
      if (cached) {
        const parsed = JSON.parse(cached) as LLMResponse;
        logger.debug('LLM response served from Redis cache', {
          agent: request.agentName,
          key: memoKey,
        });
        return { ...parsed, fromCache: true, latencyMs: Date.now() - startTime };
      }
    } catch {
      // Redis unavailable — proceed without cache
    }
  }

  // Guardrails: Check if Anthropic is marked as down
  if (await isProviderDown('llm')) {
    throw new Error('Anthropic API temporarily unavailable (circuit breaker open)');
  }

  // Circuit breaker check
  if (!llmCircuitBreaker.canExecute()) {
    throw new CircuitBreakerOpenError(
      `Anthropic API circuit breaker is OPEN — requests blocked for ${request.agentName}`,
      { agent: request.agentName, model, circuitBreaker: llmCircuitBreaker.getState() },
    );
  }

  try {
    const response = await withRetry(
      async () => {
        const anthropic = getClient();

        let maxTokens = request.maxTokens ?? 4096;

        // System prompt with prompt caching — marked ephemeral, cached for 5 min by Anthropic
        const systemBlocks: Anthropic.TextBlockParam[] = [
          {
            type: 'text',
            text: request.systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ];

        const params: Anthropic.MessageCreateParams = {
          model,
          max_tokens: maxTokens,
          system: systemBlocks,
          messages,
        };

        // Extended thinking for advanced tier (L3 agents)
        if (request.enableThinking) {
          const thinkingBudget = request.thinkingBudgetTokens ?? 4096;
          // max_tokens must exceed thinking budget
          maxTokens = Math.max(maxTokens, thinkingBudget + 1024);
          params.max_tokens = maxTokens;
          params.thinking = {
            type: 'enabled',
            budget_tokens: thinkingBudget,
          };
          // Extended thinking requires temperature=1 (SDK constraint)
          delete params.temperature;
        } else if (request.temperature !== undefined) {
          params.temperature = request.temperature;
        }

        if (request.tools && request.tools.length > 0) {
          params.tools = request.tools.map((t) => ({
            name: t.name,
            description: t.description,
            input_schema: t.input_schema as Anthropic.Tool.InputSchema,
          }));
        }

        return anthropic.messages.create(params);
      },
      `llm-call:${request.agentName}`,
      { maxRetries: 2, retryableErrors: ['overloaded', '529', '500'] }
    );

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const toolCalls = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      }));

    // Extract thinking blocks (extended thinking)
    const thinkingBlocks = response.content.filter(
      (block): block is Anthropic.ThinkingBlock => block.type === 'thinking',
    );
    const thinkingContent = thinkingBlocks.map((b) => b.thinking).join('\n');

    // Extract cache token counts from usage (available when prompt caching header is set)
    const usage = response.usage as Anthropic.Usage & {
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };

    const result: LLMResponse = {
      content: textContent,
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      stopReason: response.stop_reason ?? 'unknown',
      latencyMs: Date.now() - startTime,
      thinking: thinkingContent || undefined,
      cacheReadTokens: usage.cache_read_input_tokens,
      cacheCreatedTokens: usage.cache_creation_input_tokens,
    };

    logger.debug('LLM response', {
      agent: request.agentName,
      model,
      tokens: result.totalTokens,
      cacheRead: result.cacheReadTokens ?? 0,
      cacheCreated: result.cacheCreatedTokens ?? 0,
      latencyMs: result.latencyMs,
    });

    llmCircuitBreaker.recordSuccess();
    await recordProviderSuccess('llm').catch(() => {});

    // ── Store in Redis memoization cache (write-through) ──
    if (request.enableMemoization) {
      const memoKey = buildMemoKey(request, model);
      const ttl = request.memoizationTtlSeconds ?? 300; // 5 min default
      try {
        await redisClient.set(memoKey, JSON.stringify(result), ttl);
      } catch {
        // Redis unavailable — proceed without caching
      }
    }

    return result;
  } catch (error) {
    // Don't record circuit breaker failures as additional failures
    if (!(error instanceof CircuitBreakerOpenError)) {
      llmCircuitBreaker.recordFailure();
    }
    await recordProviderFailure('llm').catch(() => {});
    const message = error instanceof Error ? error.message : String(error);
    throw new LLMError(`LLM call failed for ${request.agentName}: ${message}`, {
      model,
      agent: request.agentName,
    });
  }
}
