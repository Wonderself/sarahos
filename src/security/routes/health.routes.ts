import { Router } from 'express';
import { stateManager } from '../../core/state/state-manager';
import { agentRegistry } from '../../core/agent-registry/agent-registry';
import { avatarBridge } from '../../avatar/bridge/avatar-bridge';
import { dbClient, redisClient } from '../../infra';
import { persistentEventBus } from '../../core/event-bus/event-bus.persistent';
import { persistentMemoryManager } from '../../core/memory/memory-manager.persistent';
import { persistentApprovalQueue } from '../../core/human-override/approval-queue.persistent';
import { persistentTokenTracker } from '../../core/llm/token-tracker.persistent';
import {
  asrService,
  ttsService,
  videoAvatarService,
  telephonyService,
} from '../../avatar/services';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const currentState = stateManager.getState();
    await agentRegistry.healthCheckAll();
    const avatarHealth = await avatarBridge.healthCheck();

    res.json({
      status: 'ok',
      version: '0.10.0',
      phase: currentState.current_phase,
      agents: {
        total: agentRegistry.getCount(),
        entries: agentRegistry.getAllEntries().map((e) => ({
          name: e.name,
          level: e.level,
          status: e.status,
        })),
      },
      avatarPipeline: avatarHealth,
      uptime: process.uptime(),
    });
  });

  router.get('/infra/health', async (_req, res) => {
    const [dbHealth, redisHealth] = await Promise.all([
      dbClient.healthCheck(),
      redisClient.healthCheck(),
    ]);
    res.json({
      database: dbHealth,
      redis: redisHealth,
      persistence: {
        eventBus: persistentEventBus.isPersistenceEnabled(),
        memoryManager: persistentMemoryManager.isPersistenceEnabled(),
        approvalQueue: persistentApprovalQueue.isPersistenceEnabled(),
        tokenTracker: persistentTokenTracker.isPersistenceEnabled(),
      },
    });
  });

  router.get('/avatar/pipeline/health', async (_req, res) => {
    const [asrHealth, ttsHealth, videoHealth, telHealth, bridgeHealth] = await Promise.all([
      asrService.healthCheck(),
      ttsService.healthCheck(),
      videoAvatarService.healthCheck(),
      telephonyService.healthCheck(),
      avatarBridge.healthCheck(),
    ]);
    res.json({ asr: asrHealth, tts: ttsHealth, video: videoHealth, telephony: telHealth, bridge: bridgeHealth });
  });

  return router;
}
