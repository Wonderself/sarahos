import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { autonomyEngine } from '../../core/autonomy/autonomy-engine';
import { improvementScheduler } from '../../core/autonomy/improvement-scheduler';
import { recurringScheduler } from '../../core/orchestrator/recurring-scheduler';

export function createAutonomyRouter(): Router {
  const router = Router();

  router.use(verifyToken);
  router.use(requireRole('viewer', 'operator', 'system'));

  router.get('/autonomy/report', (_req, res) => {
    res.json(autonomyEngine.getAutonomyReport());
  });

  router.get('/autonomy/score', (_req, res) => {
    res.json({ score: autonomyEngine.calculateScore() });
  });

  router.get('/improvement/history', (_req, res) => {
    res.json(improvementScheduler.getImprovementHistory());
  });

  router.get('/scheduler/tasks', (_req, res) => {
    res.json(recurringScheduler.getScheduledTasks());
  });

  return router;
}
