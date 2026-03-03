import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import { sendNotificationSchema } from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

export function createNotificationRouter(): Router {
  const router = Router();

  /**
   * GET /notifications — Get current user's notifications
   */
  router.get('/notifications', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

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

    const { notificationService } = await import('../../notifications/notification.service');
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  }));

  /**
   * POST /notifications/:id/read — Mark notification as read
   */
  router.post('/notifications/:id/read', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const notificationId = req.params['id'] as string;
    const { notificationService } = await import('../../notifications/notification.service');
    await notificationService.markAsRead(notificationId, userId);
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
