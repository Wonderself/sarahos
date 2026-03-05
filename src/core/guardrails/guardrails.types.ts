// ═══════════════════════════════════════════════════════════════════
// Guardrails & Optimization System — Shared Types
// ═══════════════════════════════════════════════════════════════════

export type AgentMode = 'pro' | 'eco';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type CircuitBreakerLevel = 'request' | 'agent' | 'global';
export type CircuitBreakerState = 'closed' | 'open' | 'half_open';
export type ProviderService = 'llm' | 'image' | 'voice' | 'whatsapp';

// ── Token Budget ──

export interface TokenBudget {
  userId: string;
  dailyLimit: number;
  hourlyLimit: number;
  perRequestLimit: number;
  perMinuteLimit: number;
  consumed: {
    today: number;
    thisHour: number;
    thisMinute: number;
  };
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  userMessage?: string;
  maxTokensAllowed: number;
  consumed: TokenBudget['consumed'];
}

// ── Agent Call Chain ──

export interface AgentCallChain {
  chainId: string;
  initiatorUserId: string;
  callStack: string[];
  depth: number;
  totalTokens: number;
  totalCost: number;
  startedAt: number; // timestamp ms
  maxDepth: number;
  maxTokens: number;
  maxDurationMs: number;
}

export type ChainValidationResult =
  | { allowed: true }
  | { allowed: false; reason: string; userMessage: string };

// ── User Mode Config ──

export interface ModeConfig {
  defaultModel: string;
  allowOpus: boolean;
  allowInterAgentComm: boolean;
  slidingWindowSize: number;
  summaryMaxTokens: number;
  summarizeEvery: number;
  maxOutputTokens: number;
  maxChainDepth: number;
  maxChainTokens: number;
  maxChainDurationMs: number;
  creditMultiplier: number;
}

// ── Model Router ──

export type RequestType =
  | 'chat'
  | 'writing'
  | 'analysis'
  | 'complex_conversation'
  | 'prompt_enhancement'
  | 'classification'
  | 'sav'
  | 'architecture'
  | 'multi_step_reasoning'
  | 'complex_code'
  | 'summarization';

// ── Fallback Provider ──

export interface FallbackConfig {
  primary: string;
  fallback: string;
  healthCheckIntervalMs: number;
  maxRetries: number;
  timeoutMs: number;
  circuitBreakerThreshold: number;
}

// ── Alert ──

export interface GuardrailAlert {
  id: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  metadata: Record<string, unknown>;
  userId?: string;
  agentId?: string;
  createdAt: Date;
  acknowledged: boolean;
}

// ── Token Event (for event sourcing) ──

export interface TokenEvent {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costMicroCredits: number;
  agentName: string;
  requestType: string;
  chainId?: string;
  mode: AgentMode;
}

// ── Guardrails Status (for dashboard) ──

export interface GuardrailsStatus {
  tokenBudget: {
    globalHourlyTokens: number;
    globalHourlyCost: number;
    globalHourlyBudget: number;
    modelDistribution: { haiku: number; sonnet: number; opus: number };
  };
  circuitBreakers: {
    level: 'normal' | 'degraded' | 'emergency';
    agentsSuspended: string[];
    tripsLast24h: number;
  };
  activeChains: number;
  loopsDetectedLast24h: number;
  apiHealth: Record<string, { up: boolean; latencyMs: number }>;
  recentAlerts: GuardrailAlert[];
}

// ── Inter-Agent Action Catalog ──

export const INTER_AGENT_ACTIONS = [
  'generate_image', 'edit_image', 'generate_video', 'generate_voice',
  'write_content', 'analyze_data', 'classify_request', 'translate_text',
  'summarize_conversation', 'search_knowledge_base',
] as const;

export type InterAgentAction = typeof INTER_AGENT_ACTIONS[number];

export interface InterAgentMessage {
  chainId: string;
  fromAgent: string;
  toAgent: string;
  action: InterAgentAction;
  params: Record<string, unknown>;
  maxResponseTokens: number;
}
