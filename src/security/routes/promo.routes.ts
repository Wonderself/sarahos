import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { createPromoSchema, redeemPromoSchema } from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

export function createPromoRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  // POST /admin/promo-codes — create promo code (admin only)
  router.post('/admin/promo-codes', requireRole('admin'), validateBody(createPromoSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { promoService } = await import('../../users/promo.service');
      const promo = await promoService.createCode({
        ...req.body,
        createdBy: req.user?.sub ?? 'unknown',
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      });
      if (!promo) {
        res.status(500).json({ error: 'Failed to create promo code — database unavailable' });
        return;
      }
      res.status(201).json(promo);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        res.status(409).json({ error: 'Promo code already exists' });
        return;
      }
      next(error);
    }
  });

  // GET /admin/promo-codes — list promo codes (admin only)
  router.get('/admin/promo-codes', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { promoService } = await import('../../users/promo.service');
      const codes = await promoService.listCodes();
      res.json({ codes, total: codes.length });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /admin/promo-codes/:code — deactivate promo code (admin only)
  router.delete('/admin/promo-codes/:code', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { promoService } = await import('../../users/promo.service');
      const code = req.params.code as string;
      const result = await promoService.deactivateCode(code);
      if (!result) {
        res.status(404).json({ error: 'Promo code not found' });
        return;
      }
      res.json({ status: 'deactivated', code });
    } catch (error) {
      next(error);
    }
  });

  // POST /promo/redeem — redeem a promo code (any authenticated user)
  router.post('/promo/redeem', validateBody(redeemPromoSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ error: 'User account required to redeem promo codes (env-key users not supported)' });
        return;
      }

      const { promoService } = await import('../../users/promo.service');
      const result = await promoService.redeemCode(req.body.code, userId);
      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /promo/validate/:code — check code validity (any authenticated user)
  router.get('/promo/validate/:code', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { promoService } = await import('../../users/promo.service');
      const code = req.params.code as string;
      const promo = await promoService.findByCode(code);
      if (!promo) {
        res.status(404).json({ valid: false, reason: 'Promo code not found' });
        return;
      }
      const validation = promoService.validateCode(promo);
      res.json({
        valid: validation.valid,
        reason: validation.reason,
        effectType: promo.effectType,
        description: promo.description,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
