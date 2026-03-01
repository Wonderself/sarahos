import { AutonomyEngine } from './autonomy-engine';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../infra/database/db-client', () => ({
  dbClient: { isConnected: jest.fn().mockReturnValue(false) },
}));

jest.mock('../../infra/redis/redis-client', () => ({
  redisClient: { isConnected: jest.fn().mockReturnValue(false) },
}));

const mockState = {
  avatar_system: {
    pipeline_latency_avg_ms: 0,
    asr_requests_today: 0,
    active_conversations: 0,
  },
  infrastructure: { uptime_hours: 0 },
  tasks_in_progress: [] as string[],
  blocked_tasks: [] as string[],
  known_bugs: [] as string[],
  last_self_improvement_cycle: null as string | null,
};

jest.mock('../state/state-manager', () => ({
  stateManager: {
    getState: () => mockState,
  },
}));

jest.mock('../agent-registry/agent-registry', () => ({
  agentRegistry: {
    getAllEntries: jest.fn().mockReturnValue([
      { id: 'a1', name: 'Agent1', status: 'IDLE' },
      { id: 'a2', name: 'Agent2', status: 'IDLE' },
    ]),
  },
}));

describe('AutonomyEngine', () => {
  let engine: AutonomyEngine;
  const { dbClient } = jest.requireMock('../../infra/database/db-client');
  const { redisClient } = jest.requireMock('../../infra/redis/redis-client');
  const { agentRegistry } = jest.requireMock('../agent-registry/agent-registry');

  beforeEach(() => {
    jest.clearAllMocks();
    dbClient.isConnected.mockReturnValue(false);
    redisClient.isConnected.mockReturnValue(false);
    mockState.blocked_tasks = [];
    mockState.tasks_in_progress = [];
    mockState.known_bugs = [];
    mockState.last_self_improvement_cycle = null;
    mockState.avatar_system.pipeline_latency_avg_ms = 0;
    mockState.avatar_system.asr_requests_today = 0;
    agentRegistry.getAllEntries.mockReturnValue([
      { id: 'a1', name: 'Agent1', status: 'IDLE' },
      { id: 'a2', name: 'Agent2', status: 'IDLE' },
    ]);
    engine = new AutonomyEngine();
  });

  describe('calculateScore', () => {
    it('should return base score without infra (agent health + automation partial)', () => {
      const score = engine.calculateScore();
      // persistence: 0 (no DB, no Redis)
      // agent_health: 25 (all healthy)
      // automation: 10 (no blocked) + 8 (manageable) + 0 (pipeline idle) = 18
      // self_improvement: 0 (no cycle) + 10 (no bugs) = 10
      expect(score).toBe(53);
    });

    it('should give full persistence points when DB and Redis connected', () => {
      dbClient.isConnected.mockReturnValue(true);
      redisClient.isConnected.mockReturnValue(true);
      const score = engine.calculateScore();
      expect(score).toBe(78); // 25 + 25 + 18 + 10
    });

    it('should give max score with everything running', () => {
      dbClient.isConnected.mockReturnValue(true);
      redisClient.isConnected.mockReturnValue(true);
      mockState.last_self_improvement_cycle = '2026-02-27T12:00:00Z';
      mockState.avatar_system.asr_requests_today = 5;
      const score = engine.calculateScore();
      // persistence: 25, agent_health: 25, automation: 25, self_improvement: 25
      expect(score).toBe(100);
    });

    it('should penalize error agents', () => {
      agentRegistry.getAllEntries.mockReturnValue([
        { id: 'a1', name: 'Agent1', status: 'ERROR' },
        { id: 'a2', name: 'Agent2', status: 'IDLE' },
      ]);
      const factors = engine.getFactors();
      const healthFactor = factors.find((f) => f.name === 'agent_health_factor');
      expect(healthFactor!.currentPoints).toBe(13); // 1/2 = 50% → 12.5 rounded to 13
    });
  });

  describe('identifyRealBlockers', () => {
    it('should identify no-database blocker', () => {
      const blockers = engine.identifyRealBlockers();
      const dbBlocker = blockers.find((b) => b.id === 'no-database');
      expect(dbBlocker).toBeDefined();
      expect(dbBlocker!.category).toBe('infrastructure');
    });

    it('should identify no-redis blocker', () => {
      const blockers = engine.identifyRealBlockers();
      const redisBlocker = blockers.find((b) => b.id === 'no-redis');
      expect(redisBlocker).toBeDefined();
    });

    it('should identify agents-in-error blocker', () => {
      agentRegistry.getAllEntries.mockReturnValue([
        { id: 'a1', name: 'BrokenAgent', status: 'ERROR' },
      ]);
      const blockers = engine.identifyRealBlockers();
      const errorBlocker = blockers.find((b) => b.id === 'agents-in-error');
      expect(errorBlocker).toBeDefined();
      expect(errorBlocker!.description).toContain('BrokenAgent');
    });

    it('should identify blocked-tasks blocker', () => {
      mockState.blocked_tasks = ['task-1', 'task-2'];
      const blockers = engine.identifyRealBlockers();
      const taskBlocker = blockers.find((b) => b.id === 'blocked-tasks');
      expect(taskBlocker).toBeDefined();
    });

    it('should identify no-improvement-cycle blocker', () => {
      const blockers = engine.identifyRealBlockers();
      const improveBlocker = blockers.find((b) => b.id === 'no-improvement-cycle');
      expect(improveBlocker).toBeDefined();
    });

    it('should not identify improvement blocker if cycle has run', () => {
      mockState.last_self_improvement_cycle = '2026-02-27T12:00:00Z';
      const blockers = engine.identifyRealBlockers();
      const improveBlocker = blockers.find((b) => b.id === 'no-improvement-cycle');
      expect(improveBlocker).toBeUndefined();
    });
  });

  describe('proposeAutonomyUpgrades', () => {
    it('should return suggestions based on blockers', () => {
      const upgrades = engine.proposeAutonomyUpgrades();
      expect(upgrades.length).toBeGreaterThan(0);
      expect(upgrades.some((u) => u.includes('PostgreSQL'))).toBe(true);
    });
  });

  describe('getAutonomyReport', () => {
    it('should generate a complete report', () => {
      const report = engine.getAutonomyReport();
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
      expect(report.factors).toHaveLength(4);
      expect(report.blockers.length).toBeGreaterThan(0);
      expect(report.timestamp).toBeDefined();
    });

    it('should have score within 0-100 bounds', () => {
      const report = engine.getAutonomyReport();
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    });
  });
});
