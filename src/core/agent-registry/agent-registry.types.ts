import type { AgentLevel, AgentStatus, ModelTier, HealthStatus } from '../../agents/base/agent.types';

export interface AgentRegistryEntry {
  id: string;
  name: string;
  level: AgentLevel;
  status: AgentStatus;
  modelTier: ModelTier;
  capabilities: string[];
  registeredAt: string;
  lastHealthCheck: HealthStatus | null;
}

export interface AgentDiscoveryQuery {
  level?: AgentLevel;
  capability?: string;
  status?: AgentStatus;
  modelTier?: ModelTier;
}
