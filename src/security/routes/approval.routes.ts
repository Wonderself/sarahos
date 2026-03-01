import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { approvalDecisionSchema } from '../validation.schemas';
import { humanOverride } from '../../core/human-override/human-override';

export function createApprovalRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  router.get('/approvals/pending', requireRole('viewer', 'operator', 'system'), (_req, res) => {
    res.json(humanOverride.getPendingApprovals());
  });

  router.post(
    '/approvals/:id/decide',
    requireRole('operator', 'system'),
    validateBody(approvalDecisionSchema),
    (req, res) => {
      const id = req.params['id'] as string;
      const { status, decidedBy, notes } = req.body as {
        status: 'APPROVED' | 'DENIED';
        decidedBy: string;
        notes?: string;
      };

      humanOverride
        .processDecision({ requestId: id, status, decidedBy, notes })
        .then((result) => res.json(result))
        .catch((error: Error) => res.status(400).json({ error: error.message }));
    },
  );

  return router;
}
