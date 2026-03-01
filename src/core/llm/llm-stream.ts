import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { LLMError, CircuitBreakerOpenError } from '../../utils/errors';
import { llmCircuitBreaker } from './circuit-breaker';
import type { LLMRequest, LLMResponse } from './llm.types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new LLMError('ANTHROPIC_API_KEY not configured');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type SSEWriter = (event: string, data: string) => void;

/**
 * Stream an LLM response via SSE.
 * Emits: content_delta, message_complete, done
 * Returns the full LLMResponse after stream completes (for billing).
 */
export async function streamLLM(
  request: LLMRequest,
  sseWriter: SSEWriter,
): Promise<LLMResponse> {
  const startTime = Date.now();

  const modelMap: Record<string, string> = {
    fast: process.env['CLAUDE_MODEL_FAST'] ?? 'claude-sonnet-4-20250514',
    standard: process.env['CLAUDE_MODEL_STANDARD'] ?? 'claude-sonnet-4-20250514',
    advanced: process.env['CLAUDE_MODEL_ADVANCED'] ?? 'claude-opus-4-6',
  };

  const model = modelMap[request.modelTier] ?? modelMap['standard']!;

  if (!llmCircuitBreaker.canExecute()) {
    throw new CircuitBreakerOpenError(
      `Anthropic API circuit breaker is OPEN — stream blocked for ${request.agentName}`,
      { agent: request.agentName, model },
    );
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  if (request.conversationHistory) {
    for (const msg of request.conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: 'user', content: request.userMessage });

  try {
    const anthropic = getClient();

    const stream = anthropic.messages.stream({
      model,
      max_tokens: request.maxTokens ?? 4096,
      system: request.systemPrompt,
      messages,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
    });

    let fullContent = '';

    stream.on('text', (text) => {
      fullContent += text;
      sseWriter('content_delta', JSON.stringify({ text }));
    });

    const finalMessage = await stream.finalMessage();

    const result: LLMResponse = {
      content: fullContent,
      model,
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
      totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
      stopReason: finalMessage.stop_reason ?? 'unknown',
      latencyMs: Date.now() - startTime,
    };

    sseWriter('message_complete', JSON.stringify({
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      totalTokens: result.totalTokens,
    }));

    sseWriter('done', '[DONE]');

    llmCircuitBreaker.recordSuccess();

    logger.debug('LLM stream completed', {
      agent: request.agentName,
      model,
      tokens: result.totalTokens,
      latencyMs: result.latencyMs,
    });

    return result;
  } catch (error) {
    if (!(error instanceof CircuitBreakerOpenError)) {
      llmCircuitBreaker.recordFailure();
    }

    // Try to send error event before throwing
    try {
      const msg = error instanceof Error ? error.message : String(error);
      sseWriter('error', JSON.stringify({ error: msg }));
    } catch {
      // SSE write may fail if connection already closed
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new LLMError(`LLM stream failed for ${request.agentName}: ${message}`, {
      model,
      agent: request.agentName,
    });
  }
}
