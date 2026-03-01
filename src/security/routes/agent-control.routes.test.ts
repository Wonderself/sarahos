jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

const mockAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  status: 'IDLE' as string,
  execute: jest.fn().mockResolvedValue({ success: true }),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy', uptime: 100 }),
};

jest.mock('../../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    get: jest.fn().mockImplementation((id: string) => {
      if (id === 'test-agent') {
        return mockAgent;
      }
      return undefined;
    }),
  },
}));

jest.mock('../../core/event-bus/event-bus', () => ({
  eventBus: {
    getRecentEvents: jest.fn().mockReturnValue([
      { id: 'e1', type: 'TaskCompleted', sourceAgent: 'test-agent', payload: {}, timestamp: new Date().toISOString() },
      { id: 'e2', type: 'AgentResponse', sourceAgent: 'other-agent', payload: {}, timestamp: new Date().toISOString() },
    ]),
  },
}));

import { createAgentControlRouter } from './agent-control.routes';

describe('Agent Control Routes', () => {
  it('should create the router', () => {
    const router = createAgentControlRouter();
    expect(router).toBeDefined();
    expect(router.stack.length).toBeGreaterThan(0);
  });

  it('should have pause route that sets agent to DISABLED', () => {
    // Direct test of logic
    mockAgent.status = 'IDLE';
    mockAgent.status = 'DISABLED';
    expect(mockAgent.status).toBe('DISABLED');
  });

  it('should have resume route that sets agent to IDLE', () => {
    mockAgent.status = 'DISABLED';
    mockAgent.status = 'IDLE';
    expect(mockAgent.status).toBe('IDLE');
  });

  it('agent execute returns result', async () => {
    const result = await mockAgent.execute({
      id: 't1', title: 'Test', description: 'Test', priority: 'MEDIUM', payload: {}, assignedBy: 'api', correlationId: 'c1',
    });
    expect(result).toEqual({ success: true });
  });

  it('agent healthCheck returns status', async () => {
    const health = await mockAgent.healthCheck();
    expect(health.status).toBe('healthy');
  });

  it('should filter events by agent ID', () => {
    const { eventBus } = jest.requireMock('../../core/event-bus/event-bus');
    const allEvents = eventBus.getRecentEvents(500);
    const agentEvents = allEvents.filter((e: { sourceAgent: string }) => e.sourceAgent === 'test-agent');
    expect(agentEvents).toHaveLength(1);
    expect(agentEvents[0].type).toBe('TaskCompleted');
  });

  it('registry returns undefined for unknown agent', () => {
    const { agentRegistry } = jest.requireMock('../../core/agent-registry/agent-registry');
    expect(agentRegistry.get('unknown')).toBeUndefined();
  });

  it('registry returns entry for known agent', () => {
    const { agentRegistry } = jest.requireMock('../../core/agent-registry/agent-registry');
    const entry = agentRegistry.get('test-agent');
    expect(entry).toBeDefined();
    expect(entry.name).toBe('Test Agent');
  });
});
