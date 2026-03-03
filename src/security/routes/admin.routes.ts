import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery } from '../validation.middleware';
import { createUserSchema, updateUserSchema, userQuerySchema } from '../validation.schemas';
import { logger } from '../../utils/logger';
import type { AuthenticatedRequest } from '../auth.types';

export function createAdminRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  // POST /admin/users — create user
  router.post('/admin/users', requireRole('admin'), validateBody(createUserSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const user = await userService.createUser(req.body);
      res.status(201).json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        apiKey: user.apiKey,
        role: user.role,
        tier: user.tier,
        isActive: user.isActive,
        dailyApiLimit: user.dailyApiLimit,
        demoExpiresAt: user.demoExpiresAt,
        createdAt: user.createdAt,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  // GET /admin/users — list users
  router.get('/admin/users', requireRole('admin'), validateQuery(userQuerySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const filters: Record<string, unknown> = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.tier) filters.tier = req.query.tier;
      if (req.query.active !== undefined) filters.isActive = req.query.active === 'true';
      if (req.query.search) filters.search = req.query.search;

      const users = await userService.listUsers(filters as Parameters<typeof userService.listUsers>[0]);
      // Strip apiKey from list response for security
      const sanitized = users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        tier: u.tier,
        isActive: u.isActive,
        dailyApiCalls: u.dailyApiCalls,
        dailyApiLimit: u.dailyApiLimit,
        demoExpiresAt: u.demoExpiresAt,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      }));
      res.json({ users: sanitized, total: sanitized.length });
    } catch (error) {
      next(error);
    }
  });

  // GET /admin/users/:id — get user details
  router.get('/admin/users/:id', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const user = await userService.getUser(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // PATCH /admin/users/:id — update user
  router.patch('/admin/users/:id', requireRole('admin'), validateBody(updateUserSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const input = { ...req.body };
      // Convert demoExpiresAt string to Date
      if (input.demoExpiresAt) {
        input.demoExpiresAt = new Date(input.demoExpiresAt);
      }
      const user = await userService.updateUser(userId, input);

      // Notify user about tier or role changes
      try {
        const { notificationService } = await import('../../notifications/notification.service');
        if (input.tier) {
          await notificationService.send({
            userId,
            channel: 'in_app',
            type: 'tier_change',
            subject: 'Votre plan a ete mis a jour',
            body: `Votre plan a ete change vers : ${input.tier}.`,
            metadata: { newTier: input.tier },
          });
        }
      } catch { /* best-effort notification */ }

      res.json(user);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  // DELETE /admin/users/:id — deactivate (soft delete)
  router.delete('/admin/users/:id', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const result = await userService.deactivateUser(userId);
      if (!result) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Notify user about deactivation
      try {
        const { notificationService } = await import('../../notifications/notification.service');
        await notificationService.send({
          userId,
          channel: 'in_app',
          type: 'account_deactivated',
          subject: 'Compte desactive',
          body: 'Votre compte a ete desactive par un administrateur. Contactez le support pour plus d\'informations.',
        });
      } catch { /* best-effort notification */ }

      res.json({ status: 'deactivated', userId });
    } catch (error) {
      next(error);
    }
  });

  // POST /admin/users/:id/reset-key — regenerate API key
  router.post('/admin/users/:id/reset-key', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const newKey = await userService.regenerateApiKey(userId);
      logger.info('Admin regenerated user API key', { adminId: req.user?.userId, targetUserId: userId });
      res.json({ userId, apiKey: newKey });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Failed')) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      next(error);
    }
  });

  // GET /admin/stats — aggregate user statistics
  router.get('/admin/stats', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const stats = await userService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
