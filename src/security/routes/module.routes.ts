import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';
import { dbClient } from '../../infra/database/db-client';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export function createModuleRouter(): Router {
  const router = Router();

  /**
   * GET /portal/modules — List user's modules
   */
  router.get('/portal/modules', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const result = await dbClient.query(
      `SELECT id, name, slug, description, emoji, color, type,
              schema, settings, is_published, public_access, record_count,
              created_at, updated_at
       FROM user_modules WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ modules: result.rows });
  }));

  /**
   * POST /portal/modules — Create a new module
   */
  router.post('/portal/modules', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { name, description, emoji, color, type, schema, settings, is_published, public_access, slug: customSlug } = req.body as Record<string, unknown>;

    if (!name || typeof name !== 'string') { res.status(400).json({ error: 'Module name is required' }); return; }
    if (!type || !['form', 'crm', 'agent', 'dashboard'].includes(type as string)) {
      res.status(400).json({ error: 'Invalid module type' }); return;
    }

    // Generate unique slug
    let slug = (customSlug && typeof customSlug === 'string') ? customSlug : generateSlug(name);
    // Ensure uniqueness by appending random suffix if needed
    const existing = await dbClient.query('SELECT id FROM user_modules WHERE user_id = $1 AND slug = $2', [userId, slug]);
    if (existing.rowCount! > 0) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const result = await dbClient.query(
      `INSERT INTO user_modules
         (user_id, name, slug, description, emoji, color, type, schema, settings, is_published, public_access)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        userId,
        name.trim(),
        slug,
        description ?? null,
        emoji ?? '📋',
        color ?? '#6366f1',
        type,
        JSON.stringify(schema ?? {}),
        JSON.stringify(settings ?? {}),
        is_published ?? false,
        public_access ?? false,
      ]
    );

    res.status(201).json({ module: result.rows[0] });
  }));

  /**
   * GET /portal/modules/:id — Get a module (by id or slug)
   */
  router.get('/portal/modules/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const result = await dbClient.query(
      `SELECT * FROM user_modules WHERE user_id = $1 AND (id::text = $2 OR slug = $2)`,
      [userId, id]
    );

    if (result.rowCount === 0) { res.status(404).json({ error: 'Module not found' }); return; }
    res.json({ module: result.rows[0] });
  }));

  /**
   * PUT /portal/modules/:id — Update a module
   */
  router.put('/portal/modules/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const own = await dbClient.query('SELECT id FROM user_modules WHERE (id::text = $1 OR slug = $1) AND user_id = $2', [id, userId]);
    if (own.rowCount === 0) { res.status(404).json({ error: 'Module not found' }); return; }

    const { name, description, emoji, color, schema, settings, is_published, public_access } = req.body as Record<string, unknown>;

    const result = await dbClient.query(
      `UPDATE user_modules SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         emoji = COALESCE($3, emoji),
         color = COALESCE($4, color),
         schema = COALESCE($5, schema),
         settings = COALESCE($6, settings),
         is_published = COALESCE($7, is_published),
         public_access = COALESCE($8, public_access),
         updated_at = NOW()
       WHERE (id::text = $9 OR slug = $9) AND user_id = $10 RETURNING *`,
      [
        name ?? null, description ?? null, emoji ?? null, color ?? null,
        schema !== undefined ? JSON.stringify(schema) : null,
        settings !== undefined ? JSON.stringify(settings) : null,
        is_published ?? null, public_access ?? null,
        id, userId,
      ]
    );

    res.json({ module: result.rows[0] });
  }));

  /**
   * DELETE /portal/modules/:id — Delete a module
   */
  router.delete('/portal/modules/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const result = await dbClient.query(
      'DELETE FROM user_modules WHERE (id::text = $1 OR slug = $1) AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) { res.status(404).json({ error: 'Module not found' }); return; }
    res.json({ message: 'Module deleted' });
  }));

  /**
   * GET /portal/modules/:id/records — List module records
   */
  router.get('/portal/modules/:id/records', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const limit = Math.min(parseInt(String(req.query['limit'] ?? '50')), 200);
    const offset = parseInt(String(req.query['offset'] ?? '0'));

    // Verify ownership
    const mod = await dbClient.query(
      'SELECT id FROM user_modules WHERE (id::text = $1 OR slug = $1) AND user_id = $2',
      [id, userId]
    );
    if (mod.rowCount === 0) { res.status(404).json({ error: 'Module not found' }); return; }

    const moduleId = (mod.rows[0] as { id: string }).id;
    const result = await dbClient.query(
      'SELECT id, data, created_at FROM module_records WHERE module_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [moduleId, limit, offset]
    );
    const countResult = await dbClient.query('SELECT COUNT(*)::int AS total FROM module_records WHERE module_id = $1', [moduleId]);

    res.json({ records: result.rows, total: (countResult.rows[0] as { total: number }).total, limit, offset });
  }));

  /**
   * POST /portal/modules/:id/records — Add a record
   */
  router.post('/portal/modules/:id/records', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const mod = await dbClient.query(
      'SELECT id FROM user_modules WHERE (id::text = $1 OR slug = $1) AND user_id = $2',
      [id, userId]
    );
    if (mod.rowCount === 0) { res.status(404).json({ error: 'Module not found' }); return; }

    const moduleId = (mod.rows[0] as { id: string }).id;
    const { data } = req.body as { data?: Record<string, unknown> };

    const result = await dbClient.query(
      'INSERT INTO module_records (module_id, user_id, data) VALUES ($1,$2,$3) RETURNING *',
      [moduleId, userId, JSON.stringify(data ?? {})]
    );

    res.status(201).json({ record: result.rows[0] });
  }));

  /**
   * DELETE /portal/modules/:id/records/:recordId — Delete a record
   */
  router.delete('/portal/modules/:id/records/:recordId', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const moduleId = String(req.params['id']);
    const recordId = String(req.params['recordId']);

    // Verify ownership via join
    const result = await dbClient.query(
      `DELETE FROM module_records mr
       USING user_modules um
       WHERE mr.id = $1 AND mr.module_id = um.id
         AND (um.id::text = $2 OR um.slug = $2) AND um.user_id = $3
       RETURNING mr.id`,
      [recordId, moduleId, userId]
    );

    if (result.rowCount === 0) { res.status(404).json({ error: 'Record not found' }); return; }
    res.json({ message: 'Record deleted' });
  }));

  return router;
}
