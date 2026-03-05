import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateUuidParam } from '../validation.middleware';
import { logger } from '../../utils/logger';
import { auditLog } from '../../utils/audit-logger';
import type { AuthenticatedRequest } from '../auth.types';

export function createAutopilotRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  // GET /autopilot/proposals — list proposals with filters
  router.get('/autopilot/proposals', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { listProposals, getPendingProposals } = await import('../../autopilot/autopilot.repository');

      const status = req.query['status'] as string | undefined;
      const category = req.query['category'] as string | undefined;
      const severity = req.query['severity'] as string | undefined;
      const limit = req.query['limit'] ? Number(req.query['limit']) : undefined;
      const offset = req.query['offset'] ? Number(req.query['offset']) : undefined;

      const [result, pending] = await Promise.all([
        listProposals({ status: status as never, category, severity, limit, offset }),
        getPendingProposals(),
      ]);

      res.json({
        proposals: result.proposals,
        total: result.total,
        pendingCount: pending.length,
      });
    } catch (error: unknown) {
      next(error);
    }
  });

  // GET /autopilot/proposals/:id — get single proposal
  router.get('/autopilot/proposals/:id', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { getProposal } = await import('../../autopilot/autopilot.repository');
      const id = String(req.params['id']);
      const proposal = await getProposal(id);

      if (!proposal) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }

      res.json(proposal);
    } catch (error: unknown) {
      next(error);
    }
  });

  // POST /autopilot/proposals/:id/decide — approve or deny
  router.post('/autopilot/proposals/:id/decide', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { processDecision } = await import('../../autopilot/autopilot.service');
      const id = String(req.params['id']);
      const { decision, notes } = req.body;

      if (decision !== 'approved' && decision !== 'denied') {
        res.status(400).json({ error: 'Invalid decision: must be "approved" or "denied"' });
        return;
      }

      const decidedBy = `dashboard:${req.user?.sub ?? 'unknown'}`;

      try {
        const updated = await processDecision({ proposalId: id, decision, decidedBy, notes });
        auditLog({
          actor: decidedBy,
          action: `autopilot_${decision}`,
          resourceType: 'proposal',
          resourceId: id,
          ip: req.ip,
        });
        res.json(updated);
      } catch (err) {
        if (err instanceof Error && err.message.includes('not pending_review')) {
          res.status(400).json({ error: err.message });
          return;
        }
        if (err instanceof Error && err.message === 'Proposal not found') {
          res.status(404).json({ error: 'Proposal not found' });
          return;
        }
        throw err;
      }
    } catch (error: unknown) {
      next(error);
    }
  });

  // POST /autopilot/proposals/:id/rollback — rollback a completed proposal
  router.post('/autopilot/proposals/:id/rollback', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { rollbackProposal } = await import('../../autopilot/autopilot.service');
      const id = String(req.params['id']);
      const requestedBy = `dashboard:${req.user?.sub ?? 'unknown'}`;

      try {
        await rollbackProposal(id, requestedBy);
        auditLog({
          actor: requestedBy,
          action: 'autopilot_rollback',
          resourceType: 'proposal',
          resourceId: id,
          ip: req.ip,
        });
        res.json({ message: 'Rollback completed', proposalId: id });
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === 'Proposal not found') {
            res.status(404).json({ error: 'Proposal not found' });
            return;
          }
          if (err.message.startsWith('Cannot rollback') || err.message.includes('not reversible') || err.message === 'No rollback snapshot available') {
            res.status(400).json({ error: err.message });
            return;
          }
        }
        throw err;
      }
    } catch (error: unknown) {
      next(error);
    }
  });

  // GET /autopilot/reports — list audit reports
  router.get('/autopilot/reports', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { listAuditReports } = await import('../../autopilot/autopilot.repository');
      const limit = req.query['limit'] ? Number(req.query['limit']) : 10;
      const reports = await listAuditReports(limit);
      res.json({ reports });
    } catch (error: unknown) {
      next(error);
    }
  });

  // POST /autopilot/audit/trigger — trigger an audit
  router.post('/autopilot/audit/trigger', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const validTypes = ['health', 'business', 'security', 'combined'];

      if (!type || !validTypes.includes(type)) {
        res.status(400).json({ error: `Invalid audit type: must be one of ${validTypes.join(', ')}` });
        return;
      }

      const actor = `dashboard:${req.user?.sub ?? 'unknown'}`;
      auditLog({
        actor,
        action: 'autopilot_audit_trigger',
        resourceType: 'audit',
        resourceId: type,
        ip: req.ip,
      });

      // Lazy import auditors — run in background (non-blocking)
      const reportIds: string[] = [];

      if (type === 'combined') {
        // Run all 3 audit types in parallel
        const [healthMod, businessMod, securityMod] = await Promise.all([
          import('../../autopilot/auditors/health.auditor').catch(() => null),
          import('../../autopilot/auditors/business.auditor').catch(() => null),
          import('../../autopilot/auditors/security.auditor').catch(() => null),
        ]);

        const jobs: Promise<string | null>[] = [];
        if (healthMod?.runHealthAudit) jobs.push(healthMod.runHealthAudit().then(r => r?.id ?? null).catch(() => null));
        if (businessMod?.runBusinessAudit) jobs.push(businessMod.runBusinessAudit().then(r => r?.id ?? null).catch(() => null));
        if (securityMod?.runSecurityAudit) jobs.push(securityMod.runSecurityAudit().then(r => r?.id ?? null).catch(() => null));

        // Fire and forget — we return 202 immediately
        Promise.all(jobs).then(ids => {
          reportIds.push(...ids.filter((id): id is string => id !== null));
          logger.info('Combined audit completed', { reportIds });
        }).catch(err => {
          logger.error('Combined audit error', { error: String(err) });
        });
      } else {
        const auditorMap: Record<string, string> = {
          health: '../../autopilot/auditors/health.auditor',
          business: '../../autopilot/auditors/business.auditor',
          security: '../../autopilot/auditors/security.auditor',
        };

        const fnMap: Record<string, string> = {
          health: 'runHealthAudit',
          business: 'runBusinessAudit',
          security: 'runSecurityAudit',
        };

        // Fire and forget
        const modulePath = auditorMap[type];
        const funcName = fnMap[type];
        if (!modulePath || !funcName) { res.status(400).json({ error: 'Invalid type' }); return; }
        import(modulePath).then(mod => {
          const fn = mod[funcName];
          if (fn) return fn();
          logger.warn('Auditor function not found', { type });
        }).catch(err => {
          logger.error('Audit trigger error', { type, error: String(err) });
        });
      }

      res.status(202).json({
        message: 'Audit triggered',
        type,
        triggeredBy: actor,
      });
    } catch (error: unknown) {
      next(error);
    }
  });

  // GET /autopilot/stats — autopilot statistics
  router.get('/autopilot/stats', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { getStats } = await import('../../autopilot/autopilot.repository');
      const stats = await getStats();
      res.json(stats);
    } catch (error: unknown) {
      next(error);
    }
  });

  return router;
}
