// Integration test setup — creates a test Express app with all middleware and routes
// Mocks external services but uses real middleware pipeline

jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    NODE_ENV: 'test',
    PORT: 3000,
    JWT_SECRET: 'integration-test-secret-at-least-16',
    JWT_EXPIRES_IN: '1h',
    ENCRYPTION_KEY: 'integration-test-encryption-key!',
    API_KEYS_ADMIN: 'test-admin-key',
    API_KEYS_OPERATOR: 'test-operator-key',
    API_KEYS_VIEWER: 'test-viewer-key',
    API_KEYS_SYSTEM: 'test-system-key',
    DASHBOARD_ORIGIN: 'http://localhost:3001',
    RATE_LIMIT_MAX: 1000,
    RATE_LIMIT_WINDOW_MS: 900000,
    ANTHROPIC_API_KEY: 'test-key',
  },
}));

jest.mock('../core/state/state-manager', () => ({
  stateManager: {
    getState: jest.fn().mockReturnValue({ current_phase: 7, active_agents: [], avatar_system: {} }),
    load: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    getAllEntries: jest.fn().mockReturnValue([]),
    getCount: jest.fn().mockReturnValue(0),
    healthCheckAll: jest.fn(),
    get: jest.fn().mockReturnValue(undefined),
  },
}));

jest.mock('../avatar/bridge/avatar-bridge', () => ({
  avatarBridge: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
}));

jest.mock('../infra', () => ({
  dbClient: { healthCheck: jest.fn().mockResolvedValue({ connected: false }), isConnected: jest.fn().mockReturnValue(false) },
  redisClient: { healthCheck: jest.fn().mockResolvedValue({ connected: false }), isConnected: jest.fn().mockReturnValue(false) },
}));

jest.mock('../core/event-bus/event-bus.persistent', () => ({
  persistentEventBus: { isPersistenceEnabled: jest.fn().mockReturnValue(false), getEventStats: jest.fn().mockResolvedValue({}) },
}));

jest.mock('../core/memory/memory-manager.persistent', () => ({
  persistentMemoryManager: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../core/human-override/approval-queue.persistent', () => ({
  persistentApprovalQueue: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../core/llm/token-tracker.persistent', () => ({
  persistentTokenTracker: { isPersistenceEnabled: jest.fn().mockReturnValue(false) },
}));

jest.mock('../avatar/services', () => ({
  asrService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }), transcribe: jest.fn(), getConfigForAvatar: jest.fn() },
  ttsService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }), synthesize: jest.fn(), buildConfigFromVoiceProfile: jest.fn() },
  videoAvatarService: { healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }) },
  telephonyService: {
    healthCheck: jest.fn().mockResolvedValue({ status: 'ok' }),
    getActiveCalls: jest.fn().mockReturnValue([]),
    getCallHistory: jest.fn().mockReturnValue([]),
    initiateOutboundCall: jest.fn(),
    handleIncomingCall: jest.fn(),
    generateTwiMLResponse: jest.fn().mockReturnValue('<Response/>'),
  },
  conversationManager: {
    getActiveSessions: jest.fn().mockReturnValue([]),
    getMetrics: jest.fn().mockReturnValue({}),
    startSession: jest.fn(),
    processTurn: jest.fn(),
    endSession: jest.fn(),
  },
  personaManager: {
    getAllPersonas: jest.fn().mockReturnValue([]),
    switchPersona: jest.fn(),
  },
}));

jest.mock('../core/event-bus/event-bus', () => ({
  eventBus: {
    getRecentEvents: jest.fn().mockReturnValue([]),
    getEventsByType: jest.fn().mockReturnValue([]),
    publish: jest.fn().mockResolvedValue({}),
    subscribeAll: jest.fn().mockReturnValue(jest.fn()),
  },
}));

jest.mock('../core/human-override/human-override', () => ({
  humanOverride: { getPendingApprovals: jest.fn().mockReturnValue([]) },
}));

jest.mock('../core/llm/token-tracker', () => ({
  tokenTracker: {
    getTotalTokens: jest.fn().mockReturnValue(0),
    getTokensByAgent: jest.fn().mockReturnValue({}),
    getTokensByModel: jest.fn().mockReturnValue({}),
    getDailyAverage: jest.fn().mockReturnValue(0),
  },
}));

jest.mock('../financial/budget-tracker', () => ({
  budgetTracker: { getSummary: jest.fn().mockReturnValue({}), getCostBreakdown: jest.fn().mockReturnValue({}) },
}));

jest.mock('../financial/charity-module', () => ({
  charityModule: {
    getPercentage: jest.fn().mockReturnValue(20),
    getTotalAllocated: jest.fn().mockReturnValue(0),
    getTotalDisbursed: jest.fn().mockReturnValue(0),
    getPendingDisbursements: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../core/state/roadmap-parser', () => ({
  roadmapParser: { parseTasks: jest.fn().mockReturnValue([]), getCurrentPhase: jest.fn().mockReturnValue(7) },
}));

jest.mock('../core/autonomy/autonomy-engine', () => ({
  autonomyEngine: { getAutonomyReport: jest.fn().mockReturnValue({ score: 20 }), calculateScore: jest.fn().mockReturnValue(20) },
}));

jest.mock('../core/autonomy/improvement-scheduler', () => ({
  improvementScheduler: { getImprovementHistory: jest.fn().mockReturnValue([]) },
}));

jest.mock('../core/orchestrator/recurring-scheduler', () => ({
  recurringScheduler: { getScheduledTasks: jest.fn().mockReturnValue([]) },
}));

jest.mock('../core/orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
    getQueue: jest.fn().mockReturnValue([]),
    getById: jest.fn().mockReturnValue(undefined),
    remove: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../avatar/config/avatar-registry', () => ({
  avatarRegistry: {
    getAllPresets: jest.fn().mockReturnValue([]),
    getActiveClientCount: jest.fn().mockReturnValue(0),
    getClientConfigsByBase: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: 'test' }),
    search: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockReturnValue(undefined),
    delete: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../core/memory/embedding.service', () => ({
  embeddingService: { generate: jest.fn().mockResolvedValue({ values: [0.1] }) },
}));

jest.mock('../users/user.service', () => ({
  userService: {
    createUser: jest.fn(),
    listUsers: jest.fn().mockResolvedValue([]),
    getUser: jest.fn().mockResolvedValue(null),
    updateUser: jest.fn(),
    deactivateUser: jest.fn().mockResolvedValue(false),
    regenerateApiKey: jest.fn(),
    getStats: jest.fn().mockResolvedValue({ byTier: {}, active: 0, totalDailyCalls: 0 }),
    authenticateByApiKey: jest.fn().mockResolvedValue(null),
    checkDailyLimit: jest.fn().mockResolvedValue({ allowed: true, used: 0, limit: 100 }),
    incrementDailyApiCalls: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock('../users/promo.service', () => ({
  promoService: {
    createCode: jest.fn(),
    listCodes: jest.fn().mockResolvedValue([]),
    deactivateCode: jest.fn().mockResolvedValue(false),
    findByCode: jest.fn().mockResolvedValue(null),
    validateCode: jest.fn().mockReturnValue({ valid: false, reason: 'Not found' }),
    redeemCode: jest.fn().mockResolvedValue({ success: false, message: 'Not found' }),
    getRedemptionsByUser: jest.fn().mockResolvedValue([]),
    hasUserRedeemed: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock('../security/sse-manager', () => ({
  sseManager: { addClient: jest.fn(), removeClient: jest.fn() },
}));

import express from 'express';
import { applySecurityMiddleware } from '../security/security.middleware';
import { registerAllRoutes } from '../security/routes';

export function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());
  applySecurityMiddleware(app);
  registerAllRoutes(app);
  return app;
}

export { AuthService } from '../security/auth.service';
