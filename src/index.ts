import express from 'express';
import { logger } from './utils/logger';
import { stateManager } from './core/state/state-manager';
import { roadmapParser } from './core/state/roadmap-parser';
import { agentRegistry } from './core/agent-registry/agent-registry';
import { orchestrator } from './core/orchestrator/orchestrator';
import { avatarRegistry } from './avatar/config/avatar-registry';
import { personaManager } from './avatar/services';
import {
  CommunicationAgent,
  TaskExecutionAgent,
  KnowledgeAgent,
  SchedulingAgent,
  ContentAgent,
  SocialMediaAgent,
  MonitoringAgent,
} from './agents/level1-execution';
import {
  OperationsManager,
  GrowthManager,
  TechnicalManager,
  KnowledgeManager,
} from './agents/level2-management';
import {
  ChiefOrchestrationAgent,
  StrategyAgent,
  SelfImprovementAgent,
  AutonomyExpansionAgent,
} from './agents/level3-executive';
// Phase 6 — Infrastructure & Autonomy
import { dbClient, redisClient } from './infra';
import { persistentEventBus } from './core/event-bus/event-bus.persistent';
import { persistentMemoryManager } from './core/memory/memory-manager.persistent';
import { persistentApprovalQueue } from './core/human-override/approval-queue.persistent';
import { persistentTokenTracker } from './core/llm/token-tracker.persistent';
import { eventDrivenOrchestrator } from './core/orchestrator/event-driven-orchestrator';
import { recurringScheduler } from './core/orchestrator/recurring-scheduler';
import { improvementScheduler } from './core/autonomy/improvement-scheduler';
import { autonomyEngine } from './core/autonomy/autonomy-engine';
// Phase 7 — Security & API
import { applySecurityMiddleware } from './security/security.middleware';
import { registerAllRoutes } from './security/routes';
import { sseManager } from './security/sse-manager';
// Phase 9 — Billing, Campaigns, Cron
import { cronService } from './core/cron';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

async function bootstrap(): Promise<void> {
  logger.info('═══ SARAH OS — Starting ═══');
  logger.info(`Version: 0.9.0 | Phase: 9 — SaaS Billing & Client Platform`);

  // Load state
  const state = await stateManager.load();
  await roadmapParser.load();

  logger.info('System state loaded', {
    phase: state.current_phase,
    activeAgents: state.active_agents.length,
    unfinishedSystems: state.unfinished_systems.length,
  });

  // Log avatar system status
  const presets = avatarRegistry.getAllPresets();
  logger.info('Avatar system ready', {
    presets: presets.map((p) => p.baseName),
    clientAvatars: avatarRegistry.getActiveClientCount(),
  });

  // Initialize persona system
  personaManager.initializeFounderPersonas();
  logger.info('Persona system initialized', {
    personas: personaManager.getAllPersonas().map((p) => p.displayName),
  });

  // Phase 6 — Connect infrastructure (graceful degradation)
  try {
    await dbClient.connect();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.warn('PostgreSQL unavailable — running without persistence', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.warn('Redis unavailable — running without pub/sub', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Enable persistence on core modules
  persistentEventBus.enablePersistence(dbClient, redisClient);
  persistentMemoryManager.enablePersistence(dbClient);
  persistentApprovalQueue.enablePersistence(dbClient);
  persistentTokenTracker.enablePersistence(dbClient);
  logger.info('Persistence layer initialized', {
    db: dbClient.isConnected(),
    redis: redisClient.isConnected(),
  });

  // Setup event-driven orchestrator
  eventDrivenOrchestrator.setupEventTriggers();
  logger.info('Event-driven orchestrator triggers active');

  // Configure recurring scheduler
  recurringScheduler.addRecurringTask('state-save', 10 * 60_000, async () => {
    await stateManager.save();
  });
  recurringScheduler.addRecurringTask('health-check', 5 * 60_000, async () => {
    await agentRegistry.healthCheckAll();
  });
  recurringScheduler.addRecurringTask('self-improvement', 6 * 3600_000, async () => {
    await improvementScheduler.runCycle();
  });
  recurringScheduler.addRecurringTask('autonomy-assessment', 12 * 3600_000, async () => {
    const report = autonomyEngine.getAutonomyReport();
    await stateManager.update((s) => {
      s.autonomy_score = report.score;
    });
  });
  logger.info('Recurring scheduler configured', {
    tasks: recurringScheduler.getScheduledTasks().map((t) => t.name),
  });

  // Register Level 1 Execution Agents
  const l1Agents = [
    new CommunicationAgent(),
    new TaskExecutionAgent(),
    new KnowledgeAgent(),
    new SchedulingAgent(),
    new ContentAgent(),
    new SocialMediaAgent(),
    new MonitoringAgent(),
  ];

  for (const agent of l1Agents) {
    agentRegistry.register(agent);
  }

  logger.info(`L1 Execution Agents registered: ${l1Agents.length}`, {
    agents: l1Agents.map((a) => a.name),
  });

  // Register Level 2 Management Agents
  const l2Agents = [
    new OperationsManager(),
    new GrowthManager(),
    new TechnicalManager(),
    new KnowledgeManager(),
  ];

  for (const agent of l2Agents) {
    agentRegistry.register(agent);
  }

  logger.info(`L2 Management Agents registered: ${l2Agents.length}`, {
    agents: l2Agents.map((a) => a.name),
  });

  // Register Level 3 Executive Agents
  const l3Agents = [
    new ChiefOrchestrationAgent(),
    new StrategyAgent(),
    new SelfImprovementAgent(),
    new AutonomyExpansionAgent(),
  ];

  for (const agent of l3Agents) {
    agentRegistry.register(agent);
  }

  logger.info(`L3 Executive Agents registered: ${l3Agents.length}`, {
    agents: l3Agents.map((a) => a.name),
  });

  // Phase 7 — Express API with security
  const app = express();
  app.use(express.json());
  applySecurityMiddleware(app);
  registerAllRoutes(app);

  // Initialize SSE manager (subscribe to EventBus)
  sseManager.initialize();
  sseManager.startHeartbeat();
  logger.info('SSE Manager initialized');

  // Start server
  app.listen(PORT, () => {
    logger.info(`SARAH OS API listening on port ${PORT}`);
  });

  // Initialize orchestrator
  await orchestrator.initialize();

  // Start recurring scheduler
  recurringScheduler.start();
  logger.info('Recurring scheduler started');

  // Start cron jobs (billing resets, demo expiry, cleanup)
  cronService.start();
  logger.info('Cron service started');

  logger.info('═══ SARAH OS — Ready ═══');
  logger.info(`Dashboard: http://localhost:${PORT}/health`);
  logger.info(`Autonomy score: ${autonomyEngine.calculateScore()}/100`);

  // Graceful shutdown with hardened error handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    // Safety timeout: force exit after 10s if shutdown hangs
    const forceExit = setTimeout(() => {
      logger.error('Shutdown timeout — forcing exit');
      process.exit(1);
    }, 10000);
    forceExit.unref();

    try { sseManager.teardown(); } catch (e) { logger.error('SSE teardown error', { error: String(e) }); }
    try { cronService.stop(); } catch (e) { logger.error('Cron service stop error', { error: String(e) }); }
    try { recurringScheduler.stop(); } catch (e) { logger.error('Scheduler stop error', { error: String(e) }); }
    try { eventDrivenOrchestrator.teardown(); } catch (e) { logger.error('Event orchestrator teardown error', { error: String(e) }); }
    try { await orchestrator.stop(); } catch (e) { logger.error('Orchestrator stop error', { error: String(e) }); }
    try { await stateManager.save(); } catch (e) { logger.error('State save error', { error: String(e) }); }
    try { await dbClient.disconnect(); } catch (e) { logger.error('DB disconnect error', { error: String(e) }); }
    try { await redisClient.disconnect(); } catch (e) { logger.error('Redis disconnect error', { error: String(e) }); }

    logger.info('SARAH OS shut down complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => { shutdown('SIGTERM').catch(console.error); });
  process.on('SIGINT', () => { shutdown('SIGINT').catch(console.error); });
}

bootstrap().catch((error) => {
  logger.error('Fatal error during bootstrap', { error });
  process.exit(1);
});
