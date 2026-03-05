export type ModelTier = 'ultra-fast' | 'fast' | 'standard' | 'advanced';

export interface LLMRequest {
  agentId: string;
  agentName: string;
  modelTier: ModelTier;
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: ConversationMessage[];
  maxTokens?: number;
  temperature?: number;
  tools?: LLMTool[];
  enableThinking?: boolean;
  thinkingBudgetTokens?: number;
  /** Cache this response in Redis for repeated identical requests. */
  enableMemoization?: boolean;
  /** TTL in seconds for memoized responses. Default: 300 (5 min). */
  memoizationTtlSeconds?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  toolCalls?: LLMToolCall[];
  stopReason: string;
  latencyMs: number;
  thinking?: string;
  thinkingTokens?: number;
  /** Tokens read from Anthropic prompt cache (cost: 0.1x normal input price). */
  cacheReadTokens?: number;
  /** Tokens written into Anthropic prompt cache (cost: 1x normal input price). */
  cacheCreatedTokens?: number;
  /** True if response was served from Redis memoization cache (no API call made). */
  fromCache?: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface TokenUsage {
  agentId: string;
  agentName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: string;
}
