/**
 * LLM Batch API — Asynchronous processing with 50% cost reduction.
 * Use for non-real-time tasks: repondeur summaries, reports, budget analyses.
 *
 * Anthropic Batch API: requests processed within 24h (typically 5-60 min).
 * Results retrieved via polling. Requires SDK >= 0.20.0.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { LLMError } from '../../utils/errors';
import type { LLMRequest, LLMResponse } from './llm.types';

export interface LLMBatchRequest {
  /** Unique identifier for this request within the batch (used to match results). */
  customId: string;
  request: LLMRequest;
}

export interface LLMBatchResult {
  customId: string;
  response?: LLMResponse;
  error?: string;
}

export interface LLMBatchStatus {
  batchId: string;
  status: 'in_progress' | 'canceling' | 'ended';
  requestCounts: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
  createdAt: Date;
  expiresAt?: Date;
}

const MODEL_MAP: Record<string, string> = {
  'ultra-fast': process.env['CLAUDE_MODEL_ULTRAFAST'] ?? 'claude-haiku-4-5-20251001',
  fast:         process.env['CLAUDE_MODEL_FAST']      ?? 'claude-sonnet-4-20250514',
  standard:     process.env['CLAUDE_MODEL_STANDARD']  ?? 'claude-sonnet-4-20250514',
  advanced:     process.env['CLAUDE_MODEL_ADVANCED']  ?? 'claude-opus-4-6',
};

let batchClient: Anthropic | null = null;

function getBatchClient(): Anthropic {
  if (!batchClient) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new LLMError('ANTHROPIC_API_KEY not configured');
    }
    batchClient = new Anthropic({ apiKey });
  }
  return batchClient;
}

function buildBatchParams(req: LLMBatchRequest): Anthropic.MessageCreateParamsNonStreaming {
  const model = MODEL_MAP[req.request.modelTier] ?? MODEL_MAP['standard']!;
  const maxTokens = req.request.maxTokens ?? 2048;

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: maxTokens,
    system: req.request.systemPrompt,
    messages: [{ role: 'user', content: req.request.userMessage }],
  };

  if (req.request.temperature !== undefined) {
    params.temperature = req.request.temperature;
  }

  return params;
}

/**
 * Submit a batch of LLM requests to the Anthropic Batch API.
 * Returns the batchId to poll later with pollBatch().
 *
 * Cost savings: 50% reduction on input + output tokens vs synchronous calls.
 * Latency: results available in 5-60 minutes (max 24h).
 */
export async function createBatch(requests: LLMBatchRequest[]): Promise<string> {
  if (requests.length === 0) {
    throw new LLMError('createBatch: requests array is empty');
  }
  if (requests.length > 10_000) {
    throw new LLMError(`createBatch: too many requests (${requests.length} > 10,000 limit)`);
  }

  const anthropic = getBatchClient();

  try {
    const batch = await anthropic.messages.batches.create({
      requests: requests.map((req) => ({
        custom_id: req.customId,
        params: buildBatchParams(req),
      })),
    });

    logger.info('LLM batch created', {
      batchId: batch.id,
      requestCount: requests.length,
      models: [...new Set(requests.map(r => MODEL_MAP[r.request.modelTier] ?? 'unknown'))],
    });

    return batch.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new LLMError(`createBatch failed: ${message}`);
  }
}

/**
 * Poll the status and (if ended) results of a batch.
 * Call this periodically (e.g., every 15 minutes) until status === 'ended'.
 */
export async function pollBatch(batchId: string): Promise<{
  status: LLMBatchStatus;
  results?: LLMBatchResult[];
}> {
  const anthropic = getBatchClient();

  try {
    const batch = await anthropic.messages.batches.retrieve(batchId);

    const status: LLMBatchStatus = {
      batchId: batch.id,
      status: batch.processing_status as LLMBatchStatus['status'],
      requestCounts: {
        processing: batch.request_counts.processing,
        succeeded: batch.request_counts.succeeded,
        errored: batch.request_counts.errored,
        canceled: batch.request_counts.canceled,
        expired: batch.request_counts.expired,
      },
      createdAt: new Date(batch.created_at),
      expiresAt: batch.expires_at ? new Date(batch.expires_at) : undefined,
    };

    if (status.status !== 'ended') {
      return { status };
    }

    // Batch is complete — retrieve results
    const results: LLMBatchResult[] = [];

    // anthropic.messages.batches.results() returns an async-iterable stream
    const resultsStream = await anthropic.messages.batches.results(batchId);

    for await (const item of resultsStream) {
      if (item.result.type === 'succeeded' && 'message' in item.result) {
        const msg = item.result.message;
        const textContent = msg.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n');

        results.push({
          customId: item.custom_id,
          response: {
            content: textContent,
            model: msg.model,
            inputTokens: msg.usage.input_tokens,
            outputTokens: msg.usage.output_tokens,
            totalTokens: msg.usage.input_tokens + msg.usage.output_tokens,
            stopReason: msg.stop_reason ?? 'unknown',
            latencyMs: 0, // Batch doesn't track per-request latency
          },
        });
      } else {
        const errResult = item.result as { type: string; error?: { message?: string } };
        results.push({
          customId: item.custom_id,
          error: errResult.error?.message ?? `Batch result type: ${item.result.type}`,
        });
      }
    }

    logger.info('LLM batch results retrieved', {
      batchId,
      total: results.length,
      succeeded: results.filter(r => r.response).length,
      errored: results.filter(r => r.error).length,
    });

    return { status, results };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new LLMError(`pollBatch failed for ${batchId}: ${message}`);
  }
}

/**
 * Cancel a pending batch (only possible while status === 'in_progress').
 */
export async function cancelBatch(batchId: string): Promise<void> {
  const anthropic = getBatchClient();
  try {
    await anthropic.messages.batches.cancel(batchId);
    logger.info('LLM batch canceled', { batchId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new LLMError(`cancelBatch failed for ${batchId}: ${message}`);
  }
}
