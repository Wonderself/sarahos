import { logger } from '../../utils/logger';
import type { IAgent } from '../../agents/base/agent.interface';
import type { HealthStatus } from '../../agents/base/agent.types';
import type { AgentRegistryEntry, AgentDiscoveryQuery } from './agent-registry.types';

export class AgentRegistry {
  private agents = new Map<string, IAgent>();
  private entries = new Map<string, AgentRegistryEntry>();

  register(agent: IAgent): void {
    if (this.agents.has(agent.id)) {
      logger.warn(`Agent already registered: ${agent.name} (${agent.id})`);
      return;
    }

    this.agents.set(agent.id, agent);
    this.entries.set(agent.id, {
      id: agent.id,
      name: agent.name,
      level: agent.level,
      status: agent.status,
      modelTier: agent.modelTier,
      capabilities: agent.capabilities,
      registeredAt: new Date().toISOString(),
      lastHealthCheck: null,
    });

    logger.info(`Agent registered: ${agent.name}`, {
      id: agent.id,
      level: agent.level,
      capabilities: agent.capabilities,
    });
  }

  unregister(agentId: string): void {
    const entry = this.entries.get(agentId);
    this.agents.delete(agentId);
    this.entries.delete(agentId);
    if (entry) {
      logger.info(`Agent unregistered: ${entry.name}`);
    }
  }

  get(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  getByName(name: string): IAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.name === name) return agent;
    }
    return undefined;
  }

  discover(query: AgentDiscoveryQuery): AgentRegistryEntry[] {
    let results = Array.from(this.entries.values());

    if (query.level !== undefined) {
      results = results.filter((e) => e.level === query.level);
    }
    if (query.capability) {
      results = results.filter((e) => e.capabilities.includes(query.capability!));
    }
    if (query.status) {
      results = results.filter((e) => e.status === query.status);
    }
    if (query.modelTier) {
      results = results.filter((e) => e.modelTier === query.modelTier);
    }

    return results;
  }

  async healthCheckAll(): Promise<Map<string, HealthStatus>> {
    const results = new Map<string, HealthStatus>();

    const checks = Array.from(this.agents.entries()).map(async ([id, agent]) => {
      try {
        const health = await agent.healthCheck();
        const entry = this.entries.get(id);
        if (entry) {
          entry.lastHealthCheck = health;
          entry.status = agent.status;
        }
        results.set(id, health);
      } catch (error) {
        logger.error(`Health check failed for ${agent.name}`, { error });
        results.set(id, {
          agentId: id,
          healthy: false,
          status: 'ERROR',
          uptime: 0,
          lastActivity: null,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    });

    await Promise.allSettled(checks);
    return results;
  }

  getAllEntries(): AgentRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  getCount(): number {
    return this.agents.size;
  }
}

export const agentRegistry = new AgentRegistry();
