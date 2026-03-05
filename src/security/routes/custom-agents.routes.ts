import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';
import { dbClient } from '../../infra/database/db-client';

export function createCustomAgentsRouter(): Router {
  const router = Router();

  /**
   * GET /portal/agents/custom — List user's custom agents
   */
  router.get('/portal/agents/custom', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const result = await dbClient.query(
      `SELECT id, name, role, emoji, color, domain, capabilities, autonomy_level,
              tone, always_do, never_do, company_context, system_prompt,
              is_active, visible_in_sidebar, created_at, updated_at
       FROM custom_agents WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ agents: result.rows });
  }));

  /**
   * POST /portal/agents/custom — Create a new custom agent
   */
  router.post('/portal/agents/custom', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const {
      name, role, emoji, color, domain, capabilities, autonomy_level,
      tone, always_do, never_do, company_context, system_prompt,
      visible_in_sidebar,
    } = req.body as Record<string, unknown>;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Agent name is required' }); return;
    }

    const result = await dbClient.query(
      `INSERT INTO custom_agents
         (user_id, name, role, emoji, color, domain, capabilities, autonomy_level,
          tone, always_do, never_do, company_context, system_prompt, visible_in_sidebar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        userId,
        name.trim(),
        role ?? null,
        emoji ?? '🤖',
        color ?? '#6366f1',
        domain ?? null,
        JSON.stringify(capabilities ?? []),
        autonomy_level ?? 50,
        tone ?? 'professional',
        always_do ?? [],
        never_do ?? [],
        company_context ?? null,
        system_prompt ?? null,
        visible_in_sidebar !== false,
      ]
    );

    res.status(201).json({ agent: result.rows[0] });
  }));

  /**
   * PUT /portal/agents/custom/:id — Update a custom agent
   */
  router.put('/portal/agents/custom/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);

    // Verify ownership
    const own = await dbClient.query('SELECT id FROM custom_agents WHERE id = $1 AND user_id = $2', [id, userId]);
    if (own.rowCount === 0) { res.status(404).json({ error: 'Agent not found' }); return; }

    const {
      name, role, emoji, color, domain, capabilities, autonomy_level,
      tone, always_do, never_do, company_context, system_prompt,
      is_active, visible_in_sidebar,
    } = req.body as Record<string, unknown>;

    const result = await dbClient.query(
      `UPDATE custom_agents SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         emoji = COALESCE($3, emoji),
         color = COALESCE($4, color),
         domain = COALESCE($5, domain),
         capabilities = COALESCE($6, capabilities),
         autonomy_level = COALESCE($7, autonomy_level),
         tone = COALESCE($8, tone),
         always_do = COALESCE($9, always_do),
         never_do = COALESCE($10, never_do),
         company_context = COALESCE($11, company_context),
         system_prompt = COALESCE($12, system_prompt),
         is_active = COALESCE($13, is_active),
         visible_in_sidebar = COALESCE($14, visible_in_sidebar),
         updated_at = NOW()
       WHERE id = $15 AND user_id = $16 RETURNING *`,
      [
        name ?? null, role ?? null, emoji ?? null, color ?? null, domain ?? null,
        capabilities !== undefined ? JSON.stringify(capabilities) : null,
        autonomy_level ?? null, tone ?? null,
        always_do ?? null, never_do ?? null,
        company_context ?? null, system_prompt ?? null,
        is_active ?? null, visible_in_sidebar ?? null,
        id, userId,
      ]
    );

    res.json({ agent: result.rows[0] });
  }));

  /**
   * DELETE /portal/agents/custom/:id — Delete a custom agent
   */
  router.delete('/portal/agents/custom/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const id = String(req.params['id']);
    const result = await dbClient.query(
      'DELETE FROM custom_agents WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) { res.status(404).json({ error: 'Agent not found' }); return; }
    res.json({ message: 'Agent deleted' });
  }));

  return router;
}
