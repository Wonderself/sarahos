import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';
import type { ActionFilters } from '../../actions/action.types';

export function createActionRouter(): Router {
  const router = Router();

  /**
   * GET /portal/actions — List user's actions with filters
   */
  router.get('/portal/actions', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const filters: ActionFilters = {
      status: req.query['status'] as ActionFilters['status'],
      type: req.query['type'] as ActionFilters['type'],
      priority: req.query['priority'] as ActionFilters['priority'],
      from: req.query['from'] as string | undefined,
      to: req.query['to'] as string | undefined,
      assignedTo: req.query['assignedTo'] as string | undefined,
      workspaceId: req.query['workspaceId'] as string | undefined,
      projectId: req.query['projectId'] as string | undefined,
      limit: req.query['limit'] ? Number(req.query['limit']) : undefined,
      offset: req.query['offset'] ? Number(req.query['offset']) : undefined,
    };

    const { actionService } = await import('../../actions/action.service');
    const actions = await actionService.listActions(userId, filters);
    res.json({ actions });
  }));

  /**
   * GET /portal/actions/stats — Action statistics
   */
  router.get('/portal/actions/stats', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const workspaceId = req.query['workspaceId'] as string | undefined;
    const { actionService } = await import('../../actions/action.service');
    const stats = await actionService.getStats(userId, workspaceId);
    res.json({ stats });
  }));

  /**
   * GET /portal/actions/:id — Get a specific action
   */
  router.get('/portal/actions/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { actionService } = await import('../../actions/action.service');
    const action = await actionService.getAction(id, userId);
    if (!action) { res.status(404).json({ error: 'Action not found' }); return; }

    res.json({ action });
  }));

  /**
   * POST /portal/actions — Create a single action
   */
  router.post('/portal/actions', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { type, title, description, priority, sourceAgent, sourceConversationId,
            sourceMessageIndex, assignedTo, dueDate, reminderAt, scheduledAt,
            payload, projectId, workspaceId } = req.body as Record<string, unknown>;

    if (!title || !type) {
      res.status(400).json({ error: 'Type and title are required' });
      return;
    }

    const { actionService } = await import('../../actions/action.service');
    const action = await actionService.createAction(userId, {
      type: type as string,
      title: title as string,
      description: description as string | undefined,
      priority: priority as string | undefined,
      sourceAgent: sourceAgent as string | undefined,
      sourceConversationId: sourceConversationId as string | undefined,
      sourceMessageIndex: sourceMessageIndex as number | undefined,
      assignedTo: assignedTo as string | undefined,
      dueDate: dueDate as string | undefined,
      reminderAt: reminderAt as string | undefined,
      scheduledAt: scheduledAt as string | undefined,
      payload: payload as Record<string, unknown> | undefined,
      projectId: projectId as string | undefined,
      workspaceId: workspaceId as string | undefined,
    } as import('../../actions/action.types').CreateActionInput);

    if (!action) {
      res.status(400).json({ error: 'Failed to create action' });
      return;
    }

    res.status(201).json({ action });
  }));

  /**
   * POST /portal/actions/batch — Create multiple actions at once
   */
  router.post('/portal/actions/batch', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { actions: inputs } = req.body as { actions?: Array<Record<string, unknown>> };
    if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
      res.status(400).json({ error: 'Actions array is required' });
      return;
    }
    if (inputs.length > 20) {
      res.status(400).json({ error: 'Maximum 20 actions per batch' });
      return;
    }

    const { actionService } = await import('../../actions/action.service');
    const created = await actionService.createBatch(
      userId,
      inputs as unknown as import('../../actions/action.types').CreateActionInput[],
    );

    res.status(201).json({ actions: created, count: created.length });
  }));

  /**
   * PATCH /portal/actions/:id — Update an action
   */
  router.patch('/portal/actions/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { title, description, status, priority, assignedTo, dueDate,
            reminderAt, scheduledAt, payload, result } = req.body as Record<string, unknown>;

    const { actionService } = await import('../../actions/action.service');
    const action = await actionService.updateAction(id, userId, {
      title: title as string | undefined,
      description: description as string | undefined,
      status: status as string | undefined,
      priority: priority as string | undefined,
      assignedTo: assignedTo as string | null | undefined,
      dueDate: dueDate as string | null | undefined,
      reminderAt: reminderAt as string | null | undefined,
      scheduledAt: scheduledAt as string | null | undefined,
      payload: payload as Record<string, unknown> | undefined,
      result: result as Record<string, unknown> | undefined,
    } as import('../../actions/action.types').UpdateActionInput);

    if (!action) {
      res.status(400).json({ error: 'Failed to update action' });
      return;
    }

    res.json({ action });
  }));

  /**
   * DELETE /portal/actions/:id — Cancel an action (soft delete)
   */
  router.delete('/portal/actions/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { actionService } = await import('../../actions/action.service');
    const success = await actionService.cancelAction(id, userId);
    if (!success) {
      res.status(400).json({ error: 'Failed to cancel action' });
      return;
    }

    res.json({ message: 'Action cancelled' });
  }));

  return router;
}
