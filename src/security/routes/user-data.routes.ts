import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';

export function createUserDataRouter(): Router {
  const router = Router();

  /**
   * GET /portal/user-data/:namespace — Read data for a namespace
   */
  router.get('/portal/user-data/:namespace', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const namespace = String(req.params['namespace']);
    const { userDataRepository } = await import('../../users/user-data.repository');

    if (!userDataRepository.isAllowedNamespace(namespace)) {
      res.status(400).json({ error: `Unknown namespace: ${namespace}` });
      return;
    }

    const data = await userDataRepository.get(userId, namespace);
    res.json({ namespace, data: data ?? null });
  }));

  /**
   * PUT /portal/user-data/:namespace — Upsert data for a namespace
   */
  router.put('/portal/user-data/:namespace', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const namespace = String(req.params['namespace']);
    const { userDataRepository } = await import('../../users/user-data.repository');

    if (!userDataRepository.isAllowedNamespace(namespace)) {
      res.status(400).json({ error: `Unknown namespace: ${namespace}` });
      return;
    }

    const body = req.body as { data?: unknown } | undefined;
    if (!body || body.data === undefined) {
      res.status(400).json({ error: 'Missing data field in request body' });
      return;
    }

    const ok = await userDataRepository.upsert(userId, namespace, body.data);
    if (!ok) {
      res.status(503).json({ error: 'Storage temporarily unavailable' });
      return;
    }

    res.json({ namespace, saved: true });
  }));

  return router;
}
