import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery, validateUuidParam } from '../validation.middleware';
import { createEnterpriseQuoteSchema, updateEnterpriseQuoteSchema, quoteQuerySchema } from '../validation.schemas';
import { logger } from '../../utils/logger';
import { auditLog } from '../../utils/audit-logger';
import type { AuthenticatedRequest } from '../auth.types';

export function createEnterpriseRouter(): Router {
  const router = Router();

  // POST /enterprise/quote — public (no auth required)
  router.post('/enterprise/quote', validateBody(createEnterpriseQuoteSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Service temporarily unavailable' });
        return;
      }

      const { companyName, contactName, email, phone, industry, estimatedUsers, needs, budgetRange } = req.body;

      const result = await dbClient.query(
        `INSERT INTO enterprise_quotes (company_name, contact_name, email, phone, industry, estimated_users, needs, budget_range)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, company_name, contact_name, email, created_at`,
        [companyName, contactName, email, phone || null, industry || null, estimatedUsers || null, needs || null, budgetRange || null],
      );

      const quote = result.rows[0] as { id: string; company_name: string; contact_name: string; email: string; created_at: Date } | undefined;
      const quoteId = quote?.id ?? 'unknown';

      // Notify admins via in_app notification
      try {
        await dbClient.query(
          `INSERT INTO notifications (user_id, channel, type, subject, body, metadata)
           SELECT id, 'in_app', 'enterprise_quote', $1, $2, $3
           FROM users WHERE role = 'admin' AND is_active = TRUE`,
          [
            `Nouvelle demande entreprise : ${companyName}`,
            `${contactName} (${email}) demande un devis White-Label SaaS.${estimatedUsers ? ` ~${estimatedUsers} utilisateurs.` : ''}`,
            JSON.stringify({ quoteId, companyName, email }),
          ],
        );
      } catch (notifError) {
        logger.warn('Failed to notify admins of enterprise quote', { error: notifError });
      }

      logger.info('Enterprise quote received', { quoteId, companyName, email });

      res.status(201).json({
        success: true,
        message: 'Votre demande de devis a ete envoyee. Notre equipe vous contactera sous 24h.',
        quoteId,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /enterprise/quotes — admin only
  router.get('/enterprise/quotes', verifyToken, requireRole('admin'), validateQuery(quoteQuerySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Database not available' });
        return;
      }

      const limit = Number(req.query.limit ?? 50);
      const offset = Number(req.query.offset ?? 0);
      const status = req.query.status as string | undefined;

      let sql = 'SELECT * FROM enterprise_quotes';
      const params: unknown[] = [];

      if (status) {
        sql += ' WHERE status = $1';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await dbClient.query(sql, params);

      // Get total count
      let countSql = 'SELECT COUNT(*) FROM enterprise_quotes';
      const countParams: unknown[] = [];
      if (status) {
        countSql += ' WHERE status = $1';
        countParams.push(status);
      }
      const countResult = await dbClient.query<{ count: string }>(countSql, countParams);
      const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

      res.json({ quotes: result.rows, total, limit, offset });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /enterprise/quotes/:id — admin only
  router.patch('/enterprise/quotes/:id', verifyToken, requireRole('admin'), validateUuidParam('id'), validateBody(updateEnterpriseQuoteSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Database not available' });
        return;
      }

      const quoteId = req.params.id as string;
      const { status, adminNotes } = req.body;

      const updates: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (status) {
        updates.push(`status = $${paramIndex++}`);
        params.push(status);
      }
      if (adminNotes !== undefined) {
        updates.push(`admin_notes = $${paramIndex++}`);
        params.push(adminNotes);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      updates.push(`updated_at = NOW()`);
      params.push(quoteId);

      const result = await dbClient.query(
        `UPDATE enterprise_quotes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params,
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }

      auditLog({
        actor: req.user?.sub ?? 'admin',
        action: 'admin_update_enterprise_quote',
        resourceType: 'enterprise_quote',
        resourceId: quoteId,
        details: { status, adminNotes },
        ip: req.ip,
      });

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
