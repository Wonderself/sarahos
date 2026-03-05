import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import type { AuthenticatedRequest } from '../auth.types';
import { logger } from '../../utils/logger';

// Store active SSE connections per user
const activeConnections = new Map<string, Set<import('express').Response>>();

export function addNotificationToStream(userId: string, notification: Record<string, unknown>): void {
  const connections = activeConnections.get(userId);
  if (!connections || connections.size === 0) return;

  const data = JSON.stringify(notification);
  for (const res of connections) {
    try {
      res.write(`event: notification\ndata: ${data}\n\n`);
    } catch {
      connections.delete(res);
    }
  }
}

export function getActiveStreamCount(): number {
  let count = 0;
  for (const conns of activeConnections.values()) {
    count += conns.size;
  }
  return count;
}

export function createNotificationStreamRouter(): Router {
  const router = Router();

  router.get('/portal/notifications/stream', verifyToken, (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`);

    // Register connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(res);

    logger.debug('SSE notification stream connected', { userId, activeStreams: getActiveStreamCount() });

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      const conns = activeConnections.get(userId);
      if (conns) {
        conns.delete(res);
        if (conns.size === 0) activeConnections.delete(userId);
      }
      logger.debug('SSE notification stream disconnected', { userId, activeStreams: getActiveStreamCount() });
    });
  });

  return router;
}
