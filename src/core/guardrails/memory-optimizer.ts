// ===================================================================
// Memory Optimizer — Sliding window + progressive summarization
// ===================================================================

import { logger } from '../../utils/logger';
import { dbClient } from '../../infra';
import { callLLM } from '../llm/llm-client';
import type { ConversationMessage } from '../llm/llm.types';
import type { AgentMode } from './guardrails.types';
import { MODE_CONFIG } from './user-mode';

// ── optimizeConversationContext ──

export async function optimizeConversationContext(
  userId: string,
  agentId: string,
  conversationKey: string,
  messages: ConversationMessage[],
  agentMode: AgentMode,
): Promise<{ summary: string | null; recentMessages: ConversationMessage[] }> {
  const config = MODE_CONFIG[agentMode];
  const { slidingWindowSize, summarizeEvery } = config;

  // If the conversation is short enough, no optimization needed
  if (messages.length <= slidingWindowSize) {
    const existingSummary = await getConversationSummary(
      userId,
      agentId,
      conversationKey,
    );
    return { summary: existingSummary, recentMessages: messages };
  }

  // Check if we should generate a new summary
  const shouldSummarize = messages.length % summarizeEvery === 0;
  let summary = await getConversationSummary(
    userId,
    agentId,
    conversationKey,
  );

  if (shouldSummarize) {
    // Summarize everything outside the sliding window
    const messagesToSummarize = messages.slice(0, -slidingWindowSize);

    if (messagesToSummarize.length > 0) {
      try {
        const newSummary = await generateSummary(messagesToSummarize);

        // Combine with existing summary if present
        const combinedSummary = summary
          ? `${summary}\n\n---\n\n${newSummary}`
          : newSummary;

        await saveConversationSummary(
          userId,
          agentId,
          conversationKey,
          combinedSummary,
          messages.length,
        );

        summary = combinedSummary;

        logger.debug('Conversation summary generated', {
          userId,
          agentId,
          conversationKey,
          messagesSummarized: messagesToSummarize.length,
          totalMessages: messages.length,
        });
      } catch (error) {
        logger.warn('Failed to generate conversation summary', {
          userId,
          agentId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  // Return the sliding window (last N messages)
  const recentMessages = messages.slice(-slidingWindowSize);

  return { summary, recentMessages };
}

// ── generateSummary ──

export async function generateSummary(
  messages: ConversationMessage[],
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const response = await callLLM({
    agentId: 'fz-system-summarizer',
    agentName: 'fz-system-summarizer',
    modelTier: 'ultra-fast',
    systemPrompt:
      'Tu es un résumeur. Résume cette conversation en 2-3 phrases. ' +
      'Garde uniquement : les décisions prises, les informations importantes, ' +
      "les préférences de l'utilisateur. Sois ultra concis.",
    userMessage: conversationText,
    maxTokens: 300,
    temperature: 0.2,
  });

  return response.content;
}

// ── getConversationSummary ──

export async function getConversationSummary(
  userId: string,
  agentId: string,
  conversationKey: string,
): Promise<string | null> {
  try {
    const result = await dbClient.query<{ summary: string }>(
      `SELECT summary FROM conversation_summaries
       WHERE user_id = $1 AND agent_id = $2 AND conversation_key = $3`,
      [userId, agentId, conversationKey],
    );

    return result.rows[0]?.summary ?? null;
  } catch (error) {
    logger.warn('getConversationSummary failed', {
      userId,
      agentId,
      conversationKey,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ── saveConversationSummary ──

export async function saveConversationSummary(
  userId: string,
  agentId: string,
  conversationKey: string,
  summary: string,
  messageCount: number,
): Promise<void> {
  try {
    await dbClient.query(
      `INSERT INTO conversation_summaries (user_id, agent_id, conversation_key, summary, message_count, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, agent_id, conversation_key)
       DO UPDATE SET summary = $4, message_count = $5, updated_at = NOW()`,
      [userId, agentId, conversationKey, summary, messageCount],
    );
  } catch (error) {
    logger.error('saveConversationSummary failed', {
      userId,
      agentId,
      conversationKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
