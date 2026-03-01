import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, requireRole } from '../auth.middleware';
import { sseManager } from '../sse-manager';
import type { AuthenticatedRequest } from '../auth.types';

export function createStreamRouter(): Router {
  const router = Router();

  router.get('/stream/events', verifyToken, requireRole('viewer', 'operator', 'system'), (req: AuthenticatedRequest, res) => {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial connection message
    res.write(':connected\n\n');

    // Register client
    const clientId = `sse-${req.user?.sub ?? 'anon'}-${uuidv4().slice(0, 8)}`;
    const typesParam = req.query['types'] as string | undefined;
    const types = typesParam ? typesParam.split(',').map((t) => t.trim()) : undefined;

    sseManager.addClient(clientId, res, types);

    // Cleanup on disconnect
    req.on('close', () => {
      sseManager.removeClient(clientId);
    });
  });

  return router;
}
