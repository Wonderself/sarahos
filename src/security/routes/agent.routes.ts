import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { agentRegistry } from '../../core/agent-registry/agent-registry';

export function createAgentRouter(): Router {
  const router = Router();

  router.use(verifyToken);
  router.use(requireRole('viewer', 'operator', 'system'));

  router.get('/agents', (_req, res) => {
    res.json(agentRegistry.getAllEntries());
  });

  return router;
}
