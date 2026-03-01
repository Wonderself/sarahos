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
    DASHBOARD_ORIGIN: 'http://localhost:3001',
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_WINDOW_MS: 900000,
  },
}));

jest.mock('../../core/state/state-manager', () => ({
  stateManager: {
    getState: jest.fn().mockReturnValue({ current_phase: 7, active_agents: [], avatar_system: {} }),
    load: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    getAllEntries: jest.fn().mockReturnValue([]),
    getCount: jest.fn().mockReturnValue(0),
    healthCheckAll: jest.fn(),
  },
}));

jest.mock('../../avatar/bridge/avatar-bridge', () => ({
  avatarBridge: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
}));

jest.mock('../../infra', () => ({
  dbClient: { healthCheck: jest.fn().mockResolvedValue({ connected: false }), isConnected: jest.fn().mockReturnValue(false) },
  redisClient: { healthCheck: jest.fn().mockResolvedValue({ connected: false }), isConnected: jest.fn().mockReturnValue(false) },
}));

jest.mock('../../core/event-bus/event-bus.persistent', () => ({
  persistentEventBus: {
    isPersistenceEnabled: jest.fn().mockReturnValue(false),
    getEventStats: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../core/memory/memory-manager.persistent', () => ({
  persistentMemoryManager: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../../core/human-override/approval-queue.persistent', () => ({
  persistentApprovalQueue: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../../core/llm/token-tracker.persistent', () => ({
  persistentTokenTracker: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../../avatar/services', () => ({
  asrService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
  ttsService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
  videoAvatarService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
  telephonyService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
  conversationManager: { getActiveSessions: jest.fn().mockReturnValue([]) },
  personaManager: { getAllPersonas: jest.fn().mockReturnValue([]) },
}));

jest.mock('../../core/event-bus/event-bus', () => ({
  eventBus: {
    getRecentEvents: jest.fn().mockReturnValue([]),
    getEventsByType: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../../core/human-override/human-override', () => ({
  humanOverride: { getPendingApprovals: jest.fn().mockReturnValue([]) },
}));

jest.mock('../../core/llm/token-tracker', () => ({
  tokenTracker: {
    getTotalTokens: jest.fn().mockReturnValue(0),
    getTokensByAgent: jest.fn().mockReturnValue({}),
    getTokensByModel: jest.fn().mockReturnValue({}),
    getDailyAverage: jest.fn().mockReturnValue(0),
  },
}));

jest.mock('../../financial/budget-tracker', () => ({
  budgetTracker: {
    getSummary: jest.fn().mockReturnValue({}),
    getCostBreakdown: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('../../financial/charity-module', () => ({
  charityModule: {
    getPercentage: jest.fn().mockReturnValue(20),
    getTotalAllocated: jest.fn().mockReturnValue(0),
    getTotalDisbursed: jest.fn().mockReturnValue(0),
    getPendingDisbursements: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../../core/state/roadmap-parser', () => ({
  roadmapParser: {
    parseTasks: jest.fn().mockReturnValue([]),
    getCurrentPhase: jest.fn().mockReturnValue(7),
  },
}));

jest.mock('../../core/autonomy/autonomy-engine', () => ({
  autonomyEngine: {
    getAutonomyReport: jest.fn().mockReturnValue({ score: 20 }),
    calculateScore: jest.fn().mockReturnValue(20),
  },
}));

jest.mock('../../core/autonomy/improvement-scheduler', () => ({
  improvementScheduler: { getImprovementHistory: jest.fn().mockReturnValue([]) },
}));

jest.mock('../../core/orchestrator/recurring-scheduler', () => ({
  recurringScheduler: { getScheduledTasks: jest.fn().mockReturnValue([]) },
}));

jest.mock('../../avatar/config/avatar-registry', () => ({
  avatarRegistry: {
    getAllPresets: jest.fn().mockReturnValue([]),
    getActiveClientCount: jest.fn().mockReturnValue(0),
    getClientConfigsByBase: jest.fn().mockReturnValue([]),
  },
}));

import { registerAllRoutes } from './index';

describe('registerAllRoutes', () => {
  it('should register all routes without error', () => {
    const mockApp = {
      use: jest.fn(),
    };
    expect(() => registerAllRoutes(mockApp as never)).not.toThrow();
  });

  it('should register public and protected routers', () => {
    const mockApp = {
      use: jest.fn(),
    };
    registerAllRoutes(mockApp as never);
    // auth + health + state + approval + agent + financial + avatar + token + autonomy + events + 404 + errorHandler
    expect(mockApp.use.mock.calls.length).toBeGreaterThanOrEqual(12);
  });
});

describe('globalErrorHandler', () => {
  it('should return 500 for unhandled errors', () => {
    const { globalErrorHandler } = require('../error-handler.middleware');
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    globalErrorHandler(new Error('test'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal server error' }));
  });
});

describe('createHealthRouter', () => {
  it('should create a router with health endpoints', () => {
    const { createHealthRouter } = require('./health.routes');
    const router = createHealthRouter();
    expect(router).toBeDefined();
    expect(router.stack.length).toBeGreaterThan(0);
  });
});

describe('createStateRouter', () => {
  it('should create a router with state endpoints', () => {
    const { createStateRouter } = require('./state.routes');
    const router = createStateRouter();
    expect(router).toBeDefined();
  });
});

describe('createApprovalRouter', () => {
  it('should create a router with approval endpoints', () => {
    const { createApprovalRouter } = require('./approval.routes');
    const router = createApprovalRouter();
    expect(router).toBeDefined();
  });
});

describe('createEventsRouter', () => {
  it('should create a router with events endpoints', () => {
    const { createEventsRouter } = require('./events.routes');
    const router = createEventsRouter();
    expect(router).toBeDefined();
  });
});

describe('createFinancialRouter', () => {
  it('should create a router with financial endpoints', () => {
    const { createFinancialRouter } = require('./financial.routes');
    const router = createFinancialRouter();
    expect(router).toBeDefined();
  });
});

describe('createAutonomyRouter', () => {
  it('should create a router with autonomy endpoints', () => {
    const { createAutonomyRouter } = require('./autonomy.routes');
    const router = createAutonomyRouter();
    expect(router).toBeDefined();
  });
});
