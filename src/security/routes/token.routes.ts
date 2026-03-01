import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { tokenTracker } from '../../core/llm/token-tracker';

export function createTokenRouter(): Router {
  const router = Router();

  router.use(verifyToken);
  router.use(requireRole('viewer', 'operator', 'system'));

  router.get('/tokens/usage', (_req, res) => {
    res.json({
      total: tokenTracker.getTotalTokens(),
      byAgent: tokenTracker.getTokensByAgent(),
      byModel: tokenTracker.getTokensByModel(),
      dailyAverage: tokenTracker.getDailyAverage(),
    });
  });

  return router;
}
