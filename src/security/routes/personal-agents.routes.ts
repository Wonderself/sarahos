import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import type { AuthenticatedRequest } from '../auth.types';
import { logger } from '../../utils/logger';
import { dbClient } from '../../infra';
import { validateBody } from '../validation.middleware';
import {
  personalAgentConfigSchema, budgetTransactionSchema, budgetGoalSchema, updateBudgetGoalSchema,
  freelanceRecordSchema, updateFreelanceRecordSchema, freelanceReminderSchema,
  missionSchema, updateMissionSchema, cvProfileSchema,
  eventPlannerSchema, updateEventSchema,
} from '../validation.schemas';

// ═══════════════════════════════════════════════════
//  FREENZY.IO — Personal Agents Routes
//  Config, Budget, Comptable, Chasseur, CV, Cérémonie, Écrivain
// ═══════════════════════════════════════════════════

export function createPersonalAgentsRouter(): Router {
  const router = Router();

  // ─── Shared Config (activation, settings, JSONB data) ───

  router.get('/personal/config', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'SELECT * FROM personal_agent_configs WHERE user_id = $1 ORDER BY agent_id',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get personal agent configs', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/personal/config/:agentId', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json(null); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'SELECT * FROM personal_agent_configs WHERE user_id = $1 AND agent_id = $2',
        [userId, String(req.params['agentId'])]
      );
      res.json(result.rows[0] ?? null);
    } catch (error) {
      logger.error('Failed to get personal agent config', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/personal/config/:agentId', verifyToken, validateBody(personalAgentConfigSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const agentId = String(req.params['agentId']);
      const { is_active, settings, data } = req.body;

      const result = await dbClient.query(
        `INSERT INTO personal_agent_configs (user_id, agent_id, is_active, settings, data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, agent_id)
         DO UPDATE SET is_active = COALESCE($3, personal_agent_configs.is_active),
                       settings = COALESCE($4, personal_agent_configs.settings),
                       data = COALESCE($5, personal_agent_configs.data),
                       updated_at = NOW()
         RETURNING *`,
        [userId, agentId, is_active ?? false, JSON.stringify(settings ?? {}), JSON.stringify(data ?? {})]
      );
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update personal agent config', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Budget: Transactions ───

  router.get('/personal/budget/transactions', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const limit = Math.min(parseInt(String(req.query['limit'] ?? '50'), 10), 200);
      const offset = parseInt(String(req.query['offset'] ?? '0'), 10);
      const category = req.query['category'] as string | undefined;

      let query = 'SELECT * FROM budget_transactions WHERE user_id = $1';
      const params: unknown[] = [userId];
      if (category) { query += ' AND category = $2'; params.push(category); }
      params.push(limit, offset);
      query += ` ORDER BY date DESC, created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

      const result = await dbClient.query(query, params);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get budget transactions', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/budget/transactions', verifyToken, validateBody(budgetTransactionSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { amount_cents, type, category, description, date, recurring, recurring_frequency, tags } = req.body;

      if (!amount_cents || !type || !category) { res.status(400).json({ error: 'amount_cents, type, and category are required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO budget_transactions (user_id, amount_cents, type, category, description, date, recurring, recurring_frequency, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [userId, amount_cents, type, category, description ?? null, date ?? new Date().toISOString().split('T')[0], recurring ?? false, recurring_frequency ?? null, tags ?? []]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create budget transaction', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/personal/budget/transactions/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      await dbClient.query('DELETE FROM budget_transactions WHERE id = $1 AND user_id = $2', [String(req.params['id']), userId]);
      res.json({ deleted: true });
    } catch (error) {
      logger.error('Failed to delete budget transaction', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Budget: Goals ───

  router.get('/personal/budget/goals', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query('SELECT * FROM budget_goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get budget goals', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/budget/goals', verifyToken, validateBody(budgetGoalSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { name, target_cents, deadline, category } = req.body;
      if (!name || !target_cents) { res.status(400).json({ error: 'name and target_cents are required' }); return; }

      const result = await dbClient.query(
        'INSERT INTO budget_goals (user_id, name, target_cents, deadline, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, name, target_cents, deadline ?? null, category ?? null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create budget goal', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/budget/goals/:id', verifyToken, validateBody(updateBudgetGoalSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { current_cents, status } = req.body;

      const result = await dbClient.query(
        `UPDATE budget_goals SET
          current_cents = COALESCE($3, current_cents),
          status = COALESCE($4, status),
          updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [String(req.params['id']), userId, current_cents, status]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Goal not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update budget goal', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Comptable: Records ───

  router.get('/personal/comptable/records', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const limit = Math.min(parseInt(String(req.query['limit'] ?? '50'), 10), 200);
      const offset = parseInt(String(req.query['offset'] ?? '0'), 10);
      const result = await dbClient.query(
        'SELECT * FROM freelance_records WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset]
      );
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get freelance records', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/comptable/records', verifyToken, validateBody(freelanceRecordSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { type, amount_cents, tva_rate, tva_cents, description, client_name, invoice_number, invoice_date, payment_status, category } = req.body;
      if (!type || !amount_cents || !description || !category) { res.status(400).json({ error: 'type, amount_cents, description, and category are required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO freelance_records (user_id, type, amount_cents, tva_rate, tva_cents, description, client_name, invoice_number, invoice_date, payment_status, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [userId, type, amount_cents, tva_rate ?? 0, tva_cents ?? 0, description, client_name ?? null, invoice_number ?? null, invoice_date ?? null, payment_status ?? 'pending', category]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create freelance record', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // B-03: PATCH for comptable records
  router.patch('/personal/comptable/records/:id', verifyToken, validateBody(updateFreelanceRecordSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { amount_cents, tva_rate, tva_cents, description, client_name, invoice_number, invoice_date, payment_status, category } = req.body;

      const result = await dbClient.query(
        `UPDATE freelance_records SET
          amount_cents = COALESCE($3, amount_cents),
          tva_rate = COALESCE($4, tva_rate),
          tva_cents = COALESCE($5, tva_cents),
          description = COALESCE($6, description),
          client_name = COALESCE($7, client_name),
          invoice_number = COALESCE($8, invoice_number),
          invoice_date = COALESCE($9, invoice_date),
          payment_status = COALESCE($10, payment_status),
          category = COALESCE($11, category),
          updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [String(req.params['id']), userId, amount_cents, tva_rate, tva_cents, description, client_name, invoice_number, invoice_date, payment_status, category]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Record not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update freelance record', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // B-04: DELETE for comptable records
  router.delete('/personal/comptable/records/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      await dbClient.query('DELETE FROM freelance_records WHERE id = $1 AND user_id = $2', [String(req.params['id']), userId]);
      res.json({ deleted: true });
    } catch (error) {
      logger.error('Failed to delete freelance record', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Comptable: Reminders ───

  router.get('/personal/comptable/reminders', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'SELECT * FROM freelance_reminders WHERE user_id = $1 ORDER BY due_date ASC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get freelance reminders', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/comptable/reminders', verifyToken, validateBody(freelanceReminderSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { type, title, due_date, notes } = req.body;
      if (!type || !title || !due_date) { res.status(400).json({ error: 'type, title, and due_date are required' }); return; }

      const result = await dbClient.query(
        'INSERT INTO freelance_reminders (user_id, type, title, due_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, type, title, due_date, notes ?? null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create freelance reminder', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/comptable/reminders/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'UPDATE freelance_reminders SET is_done = $3, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
        [String(req.params['id']), userId, req.body.is_done ?? true]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Reminder not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update freelance reminder', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Chasseur: Mission Pipeline ───

  router.get('/personal/chasseur/missions', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const status = req.query['status'] as string | undefined;
      let query = 'SELECT * FROM mission_pipeline WHERE user_id = $1';
      const params: unknown[] = [userId];
      if (status) { query += ' AND status = $2'; params.push(status); }
      query += ' ORDER BY updated_at DESC';
      const result = await dbClient.query(query, params);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get missions', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/chasseur/missions', verifyToken, validateBody(missionSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { title, client_name, platform, url, tjm_cents, duration_days, notes } = req.body;
      if (!title) { res.status(400).json({ error: 'title is required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO mission_pipeline (user_id, title, client_name, platform, url, tjm_cents, duration_days, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, title, client_name ?? null, platform ?? null, url ?? null, tjm_cents ?? null, duration_days ?? null, notes ?? null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create mission', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/chasseur/missions/:id', verifyToken, validateBody(updateMissionSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { status, next_action, next_action_date, notes } = req.body;

      const result = await dbClient.query(
        `UPDATE mission_pipeline SET
          status = COALESCE($3, status),
          next_action = COALESCE($4, next_action),
          next_action_date = COALESCE($5, next_action_date),
          notes = COALESCE($6, notes),
          applied_at = CASE WHEN $3 = 'applied' THEN NOW() ELSE applied_at END,
          updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [String(req.params['id']), userId, status, next_action, next_action_date, notes]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Mission not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update mission', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── CV 2026: Profile ───

  router.get('/personal/cv/profile', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json(null); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query('SELECT * FROM cv_profiles WHERE user_id = $1', [userId]);
      res.json(result.rows[0] ?? null);
    } catch (error) {
      logger.error('Failed to get CV profile', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/personal/cv/profile', verifyToken, validateBody(cvProfileSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { full_name, title, summary, contact_info, skills, experiences, education, certifications, languages, interests, career_goals, target_roles, last_ai_analysis } = req.body;
      if (!full_name) { res.status(400).json({ error: 'full_name is required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO cv_profiles (user_id, full_name, title, summary, contact_info, skills, experiences, education, certifications, languages, interests, career_goals, target_roles, last_ai_analysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (user_id)
         DO UPDATE SET full_name = $2, title = $3, summary = $4, contact_info = $5,
                       skills = $6, experiences = $7, education = $8, certifications = $9,
                       languages = $10, interests = $11, career_goals = $12, target_roles = $13,
                       last_ai_analysis = $14, version = cv_profiles.version + 1, updated_at = NOW()
         RETURNING *`,
        [userId, full_name, title ?? null, summary ?? null,
         JSON.stringify(contact_info ?? {}), JSON.stringify(skills ?? []), JSON.stringify(experiences ?? []),
         JSON.stringify(education ?? []), JSON.stringify(certifications ?? []), JSON.stringify(languages ?? []),
         interests ?? [], career_goals ?? null, target_roles ?? [], JSON.stringify(last_ai_analysis ?? {})]
      );
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to upsert CV profile', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Cérémonie: Events ───

  router.get('/personal/ceremonie/events', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query('SELECT * FROM events_planner WHERE user_id = $1 ORDER BY event_date ASC NULLS LAST', [userId]);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get events', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/ceremonie/events', verifyToken, validateBody(eventPlannerSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { event_type, title, event_date, venue, budget_cents, notes } = req.body;
      if (!event_type || !title) { res.status(400).json({ error: 'event_type and title are required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO events_planner (user_id, event_type, title, event_date, venue, budget_cents, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, event_type, title, event_date ?? null, venue ?? null, budget_cents ?? null, notes ?? null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create event', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/ceremonie/events/:id', verifyToken, validateBody(updateEventSchema), async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { status, timeline, menu, spent_cents, guest_count } = req.body;

      const result = await dbClient.query(
        `UPDATE events_planner SET
          status = COALESCE($3, status),
          timeline = COALESCE($4, timeline),
          menu = COALESCE($5, menu),
          spent_cents = COALESCE($6, spent_cents),
          guest_count = COALESCE($7, guest_count),
          updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [String(req.params['id']), userId, status, req.body.timeline ? JSON.stringify(timeline) : null,
         req.body.menu ? JSON.stringify(menu) : null, spent_cents, guest_count]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Event not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update event', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Cérémonie: Guests (H-05: owner verification via JOIN) ───

  router.get('/personal/ceremonie/events/:eventId/guests', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      // Verify event belongs to user before listing guests
      const eventCheck = await dbClient.query('SELECT id FROM events_planner WHERE id = $1 AND user_id = $2', [req.params['eventId'], userId]);
      if (eventCheck.rows.length === 0) { res.status(404).json({ error: 'Event not found' }); return; }

      const result = await dbClient.query('SELECT * FROM event_guests WHERE event_id = $1 ORDER BY name ASC', [req.params['eventId']]);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get guests', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/ceremonie/events/:eventId/guests', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { name, email, phone, dietary, plus_one } = req.body;
      if (!name) { res.status(400).json({ error: 'name is required' }); return; }

      // Verify event belongs to user
      const eventCheck = await dbClient.query('SELECT id FROM events_planner WHERE id = $1 AND user_id = $2', [req.params['eventId'], userId]);
      if (eventCheck.rows.length === 0) { res.status(404).json({ error: 'Event not found' }); return; }

      const result = await dbClient.query(
        `INSERT INTO event_guests (event_id, name, email, phone, dietary, plus_one)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.params['eventId'], name, email ?? null, phone ?? null, dietary ?? null, plus_one ?? false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to add guest', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/ceremonie/guests/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { rsvp_status, table_number } = req.body;
      // Verify guest belongs to an event owned by user
      const result = await dbClient.query(
        `UPDATE event_guests SET rsvp_status = COALESCE($2, rsvp_status), table_number = COALESCE($3, table_number)
         WHERE id = $1 AND event_id IN (SELECT id FROM events_planner WHERE user_id = $4) RETURNING *`,
        [req.params['id'], rsvp_status, table_number, userId]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Guest not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update guest', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // B-01: DELETE for guests
  router.delete('/personal/ceremonie/guests/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'DELETE FROM event_guests WHERE id = $1 AND event_id IN (SELECT id FROM events_planner WHERE user_id = $2) RETURNING id',
        [req.params['id'], userId]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Guest not found' }); return; }
      res.json({ deleted: true });
    } catch (error) {
      logger.error('Failed to delete guest', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Écrivain: Projects ───

  router.get('/personal/ecrivain/projects', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query('SELECT * FROM writing_projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get writing projects', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/ecrivain/projects', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { title, genre, project_type, synopsis, target_word_count } = req.body;
      if (!title) { res.status(400).json({ error: 'title is required' }); return; }

      const result = await dbClient.query(
        `INSERT INTO writing_projects (user_id, title, genre, project_type, synopsis, target_word_count)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title, genre ?? null, project_type ?? 'novel', synopsis ?? null, target_word_count ?? null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create writing project', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/ecrivain/projects/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { status, current_word_count, characters, structure, synopsis } = req.body;

      const result = await dbClient.query(
        `UPDATE writing_projects SET
          status = COALESCE($3, status),
          current_word_count = COALESCE($4, current_word_count),
          characters = COALESCE($5, characters),
          structure = COALESCE($6, structure),
          synopsis = COALESCE($7, synopsis),
          updated_at = NOW()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params['id'], userId, status, current_word_count,
         req.body.characters ? JSON.stringify(characters) : null,
         req.body.structure ? JSON.stringify(structure) : null, synopsis]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Project not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update writing project', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ─── Écrivain: Chapters (H-06: owner verification via JOIN) ───

  router.get('/personal/ecrivain/projects/:projectId/chapters', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.json([]); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      // Verify project belongs to user
      const projCheck = await dbClient.query('SELECT id FROM writing_projects WHERE id = $1 AND user_id = $2', [req.params['projectId'], userId]);
      if (projCheck.rows.length === 0) { res.status(404).json({ error: 'Project not found' }); return; }

      const result = await dbClient.query(
        'SELECT * FROM writing_chapters WHERE project_id = $1 ORDER BY chapter_number ASC',
        [req.params['projectId']]
      );
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to get chapters', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/personal/ecrivain/projects/:projectId/chapters', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { chapter_number, title, content } = req.body;
      if (chapter_number === undefined) { res.status(400).json({ error: 'chapter_number is required' }); return; }

      // Verify project belongs to user
      const projCheck = await dbClient.query('SELECT id FROM writing_projects WHERE id = $1 AND user_id = $2', [req.params['projectId'], userId]);
      if (projCheck.rows.length === 0) { res.status(404).json({ error: 'Project not found' }); return; }

      const result = await dbClient.query(
        `INSERT INTO writing_chapters (project_id, chapter_number, title, content, word_count)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params['projectId'], chapter_number, title ?? null, content ?? null,
         content ? content.split(/\s+/).length : 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create chapter', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/personal/ecrivain/chapters/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const { title, content, status, ai_notes } = req.body;
      const wordCount = content ? content.split(/\s+/).length : undefined;

      // Verify chapter belongs to a project owned by user
      const result = await dbClient.query(
        `UPDATE writing_chapters SET
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          word_count = COALESCE($4, word_count),
          status = COALESCE($5, status),
          ai_notes = COALESCE($6, ai_notes),
          updated_at = NOW()
         WHERE id = $1 AND project_id IN (SELECT id FROM writing_projects WHERE user_id = $7) RETURNING *`,
        [req.params['id'], title, content, wordCount, status, ai_notes, userId]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Chapter not found' }); return; }
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update chapter', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // B-02: DELETE for chapters
  router.delete('/personal/ecrivain/chapters/:id', verifyToken, async (req, res) => {
    try {
      if (!dbClient.isConnected()) { res.status(503).json({ error: 'Database unavailable' }); return; }
      const userId = (req as AuthenticatedRequest).user?.userId ?? '';
      const result = await dbClient.query(
        'DELETE FROM writing_chapters WHERE id = $1 AND project_id IN (SELECT id FROM writing_projects WHERE user_id = $2) RETURNING id',
        [req.params['id'], userId]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Chapter not found' }); return; }
      res.json({ deleted: true });
    } catch (error) {
      logger.error('Failed to delete chapter', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
