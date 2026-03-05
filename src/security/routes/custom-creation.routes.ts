import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery, validateUuidParam } from '../validation.middleware';
import { createCustomCreationQuoteSchema, updateCustomCreationQuoteSchema, customCreationQuerySchema } from '../validation.schemas';
import { logger } from '../../utils/logger';
import { auditLog } from '../../utils/audit-logger';
import type { AuthenticatedRequest } from '../auth.types';

export function createCustomCreationRouter(): Router {
  const router = Router();

  // POST /custom-creation/quotes — authenticated users submit a quote request
  router.post('/custom-creation/quotes', verifyToken, validateBody(createCustomCreationQuoteSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Service temporarily unavailable' });
        return;
      }

      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId ?? authReq.user?.sub ?? null;
      const { contactName, email, phone, projectType, description, budgetRange, urgency } = req.body;

      const result = await dbClient.query(
        `INSERT INTO custom_creation_quotes (user_id, contact_name, email, phone, project_type, description, budget_range, urgency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, contact_name, email, project_type, created_at`,
        [userId, contactName, email, phone || null, projectType, description, budgetRange || null, urgency || 'medium'],
      );

      const quote = result.rows[0] as { id: string; contact_name: string; email: string; project_type: string; created_at: Date } | undefined;
      const quoteId = quote?.id ?? 'unknown';

      // Notify admins
      try {
        await dbClient.query(
          `INSERT INTO notifications (user_id, channel, type, subject, body, metadata)
           SELECT id, 'in_app', 'custom_creation_quote', $1, $2, $3
           FROM users WHERE role = 'admin' AND is_active = TRUE`,
          [
            `Nouvelle demande creation sur mesure : ${projectType}`,
            `${contactName} (${email}) demande un devis pour un projet ${projectType}.`,
            JSON.stringify({ quoteId, projectType, email, contactName }),
          ],
        );
      } catch (notifError) {
        logger.warn('Failed to notify admins of custom creation quote', { error: notifError });
      }

      logger.info('Custom creation quote received', { quoteId, projectType, email });

      res.status(201).json({
        success: true,
        message: 'Votre demande de devis a ete envoyee. Notre equipe vous contactera sous 48h.',
        quoteId,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /custom-creation/quotes — admin only: list all quotes
  router.get('/custom-creation/quotes', verifyToken, requireRole('admin'), validateQuery(customCreationQuerySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Database not available' });
        return;
      }

      const limit = Number(req.query.limit ?? 50);
      const offset = Number(req.query.offset ?? 0);
      const status = req.query.status as string | undefined;

      let sql = 'SELECT * FROM custom_creation_quotes';
      const params: unknown[] = [];

      if (status) {
        sql += ' WHERE status = $1';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';
      sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await dbClient.query(sql, params);

      let countSql = 'SELECT COUNT(*) FROM custom_creation_quotes';
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

  // PATCH /custom-creation/quotes/:id — admin only: update status/notes
  router.patch('/custom-creation/quotes/:id', verifyToken, requireRole('admin'), validateUuidParam('id'), validateBody(updateCustomCreationQuoteSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { dbClient } = await import('../../infra/database/db-client');
      if (!dbClient.isConnected()) {
        res.status(503).json({ error: 'Database not available' });
        return;
      }

      const quoteId = req.params.id as string;
      const { status, adminNotes, quotedPrice } = req.body;

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
      if (quotedPrice !== undefined) {
        updates.push(`quoted_price = $${paramIndex++}`);
        params.push(quotedPrice);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      updates.push(`updated_at = NOW()`);
      params.push(quoteId);

      const result = await dbClient.query(
        `UPDATE custom_creation_quotes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params,
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }

      auditLog({
        actor: req.user?.sub ?? 'admin',
        action: 'admin_update_custom_creation_quote',
        resourceType: 'custom_creation_quote',
        resourceId: quoteId,
        details: { status, adminNotes, quotedPrice },
        ip: req.ip,
      });

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
