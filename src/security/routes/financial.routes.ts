import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { budgetTracker } from '../../financial/budget-tracker';
import { charityModule } from '../../financial/charity-module';

export function createFinancialRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  router.get('/financial/summary', requireRole('operator', 'system'), (_req, res) => {
    res.json(budgetTracker.getSummary());
  });

  router.get('/financial/costs', requireRole('operator', 'system'), (_req, res) => {
    res.json(budgetTracker.getCostBreakdown());
  });

  router.get('/financial/charity', requireRole('operator', 'system'), (_req, res) => {
    res.json({
      percentage: charityModule.getPercentage(),
      totalAllocated: charityModule.getTotalAllocated(),
      totalDisbursed: charityModule.getTotalDisbursed(),
      pending: charityModule.getPendingDisbursements(),
    });
  });

  return router;
}
