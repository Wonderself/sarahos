import { AgentRegistry } from './agent-registry';
import type { IAgent } from '../../agents/base/agent.interface';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

function createMockAgent(overrides: Partial<IAgent> = {}): IAgent {
  return {
    id: 'agent-1',
    name: 'test-agent',
    level: 1,
    status: 'IDLE',
    capabilities: ['test'],
    modelTier: 'fast',
    initialize: jest.fn(),
    execute: jest.fn(),
    handleEvent: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue({
      agentId: 'agent-1',
      healthy: true,
      status: 'IDLE',
      uptime: 1000,
      lastActivity: null,
      details: {},
    }),
    shutdown: jest.fn(),
    ...overrides,
  };
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  it('registers and retrieves agents', () => {
    const agent = createMockAgent();
    registry.register(agent);

    expect(registry.get('agent-1')).toBe(agent);
    expect(registry.getCount()).toBe(1);
  });

  it('finds agent by name', () => {
    const agent = createMockAgent({ name: 'communication-agent' });
    registry.register(agent);

    expect(registry.getByName('communication-agent')).toBe(agent);
  });

  it('discovers agents by level', () => {
    registry.register(createMockAgent({ id: 'a1', level: 1 }));
    registry.register(createMockAgent({ id: 'a2', level: 2 }));
    registry.register(createMockAgent({ id: 'a3', level: 1 }));

    const l1 = registry.discover({ level: 1 });
    expect(l1).toHaveLength(2);
  });

  it('discovers agents by capability', () => {
    registry.register(createMockAgent({ id: 'a1', capabilities: ['email', 'slack'] }));
    registry.register(createMockAgent({ id: 'a2', capabilities: ['crm'] }));

    const emailAgents = registry.discover({ capability: 'email' });
    expect(emailAgents).toHaveLength(1);
    expect(emailAgents[0]?.id).toBe('a1');
  });

  it('unregisters agents', () => {
    const agent = createMockAgent();
    registry.register(agent);
    registry.unregister('agent-1');

    expect(registry.get('agent-1')).toBeUndefined();
    expect(registry.getCount()).toBe(0);
  });

  it('runs health checks on all agents', async () => {
    registry.register(createMockAgent({ id: 'a1' }));
    registry.register(createMockAgent({ id: 'a2' }));

    const results = await registry.healthCheckAll();
    expect(results.size).toBe(2);
    expect(results.get('a1')?.healthy).toBe(true);
  });
});
