export type AgentStatus = 'IDLE' | 'BUSY' | 'ERROR' | 'DISABLED';

export type AgentLevel = 1 | 2 | 3;

export type ModelTier = 'fast' | 'standard' | 'advanced';

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload: Record<string, unknown>;
  assignedBy: string;
  correlationId: string;
  deadline?: string;
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: Record<string, unknown>;
  error?: string;
  tokensUsed: number;
  executionTimeMs: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification' | 'escalation';
  content: Record<string, unknown>;
  timestamp: string;
  correlationId: string;
}

export interface HealthStatus {
  agentId: string;
  healthy: boolean;
  status: AgentStatus;
  uptime: number;
  lastActivity: string | null;
  details: Record<string, unknown>;
}

export interface AgentConfig {
  id: string;
  name: string;
  level: AgentLevel;
  modelTier: ModelTier;
  capabilities: string[];
  systemPrompt: string;
  maxRetries: number;
  timeoutMs: number;
  rateLimitPerMinute: number;
}
