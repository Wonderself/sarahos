export type ModelTier = 'fast' | 'standard' | 'advanced';

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
