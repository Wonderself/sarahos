import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { stateManager } from '../../core/state/state-manager';
import { roadmapParser } from '../../core/state/roadmap-parser';

export function createStateRouter(): Router {
  const router = Router();

  router.use(verifyToken);
  router.use(requireRole('viewer', 'operator', 'system'));

  router.get('/state', (_req, res) => {
    res.json(stateManager.getState());
  });

  router.get('/roadmap/tasks', (_req, res) => {
    const tasks = roadmapParser.parseTasks();
    res.json({ tasks, currentPhase: roadmapParser.getCurrentPhase() });
  });

  return router;
}
