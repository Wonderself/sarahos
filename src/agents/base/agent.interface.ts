import type { AgentStatus, AgentTask, AgentResult, HealthStatus } from './agent.types';
import type { SystemEvent } from '../../core/event-bus/event.types';

export interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly level: 1 | 2 | 3;
  status: AgentStatus;
  readonly capabilities: string[];
  readonly modelTier: 'fast' | 'standard' | 'advanced';

  initialize(): Promise<void>;
  execute(task: AgentTask): Promise<AgentResult>;
  handleEvent(event: SystemEvent): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  shutdown(): Promise<void>;
}
