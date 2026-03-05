import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import { sendNotificationSchema } from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createNotificationRouter(): Router {
  const router = Router();

  /**
   * GET /notifications — Get current user's notifications
   */
  router.get('/notifications', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }
    if (!UUID_REGEX.test(userId)) { res.json({ notifications: [] }); return; }

    const limit = Math.min(Number(req.query['limit'] ?? 50), 200);
    const { notificationService } = await import('../../notifications/notification.service');
    const notifications = await notificationService.getByUser(userId, limit);
    res.json({ notifications });
  }));

  /**
   * GET /notifications/unread-count — Get unread notification count
   */
  router.get('/notifications/unread-count', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }
    if (!UUID_REGEX.test(userId)) { res.json({ unreadCount: 0 }); return; }

    const { notificationService } = await import('../../notifications/notification.service');
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  }));

  /**
   * POST /notifications/:id/read — Mark notification as read (ownership verified)
   */
  router.post('/notifications/:id/read', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const notificationId = req.params['id'] as string;

    // Verify ownership before marking as read (IDOR fix)
    const { dbClient } = await import('../../infra');
    const check = await dbClient.query(
      'SELECT user_id FROM notifications WHERE id = $1',
      [notificationId],
    );
    if (!check.rows[0] || (check.rows[0] as Record<string, unknown>)['user_id'] !== userId) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const { notificationService } = await import('../../notifications/notification.service');
    await notificationService.markAsRead(notificationId);
    res.json({ message: 'Notification marked as read' });
  }));

  /**
   * POST /notifications/send — Send a notification (admin/system only)
   */
  router.post('/notifications/send', verifyToken, validateBody(sendNotificationSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'system') {
      res.status(403).json({ error: 'Admin or system role required' });
      return;
    }

    const { notificationService } = await import('../../notifications/notification.service');
    const notification = await notificationService.send(req.body);
    if (!notification) { res.status(500).json({ error: 'Failed to send notification' }); return; }
    res.status(201).json({ notification });
  }));

  return router;
}
