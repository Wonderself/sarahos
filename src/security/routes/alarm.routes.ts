import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import { validateBody } from '../validation.middleware';
import { createAlarmSchema, updateAlarmSchema } from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

export function createAlarmRouter(): Router {
  const router = Router();

  /**
   * GET /portal/alarms — List user's alarms
   */
  router.get('/portal/alarms', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { alarmService } = await import('../../reveil/alarm.service');
    const alarms = await alarmService.listAlarms(userId);
    res.json({ alarms });
  }));

  /**
   * POST /portal/alarms — Create a new alarm
   */
  router.post('/portal/alarms', verifyToken, validateBody(createAlarmSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // Transform validated schema (hour/minute) to repository format (alarmTime)
    const input = {
      ...body,
      name: body.label ?? body.name ?? 'Mon reveil',
      alarmTime: body.alarmTime ?? `${String(body.hour ?? 7).padStart(2, '0')}:${String(body.minute ?? 0).padStart(2, '0')}`,
      daysOfWeek: body.days ?? body.daysOfWeek ?? [1, 2, 3, 4, 5],
    };

    const { alarmService } = await import('../../reveil/alarm.service');
    const alarm = await alarmService.createAlarm(userId, input);
    res.status(201).json({ alarm });
  }));

  /**
   * GET /portal/alarms/:id — Get alarm by id
   */
  router.get('/portal/alarms/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);

    const { alarmService } = await import('../../reveil/alarm.service');
    const alarm = await alarmService.getAlarm(id, userId);
    if (!alarm) { res.status(404).json({ error: 'Alarm not found' }); return; }

    res.json({ alarm });
  }));

  /**
   * PATCH /portal/alarms/:id — Update alarm
   */
  router.patch('/portal/alarms/:id', verifyToken, validateBody(updateAlarmSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);

    const { alarmService } = await import('../../reveil/alarm.service');
    const alarm = await alarmService.updateAlarm(id, userId, req.body);
    if (!alarm) { res.status(404).json({ error: 'Alarm not found' }); return; }

    res.json({ alarm });
  }));

  /**
   * DELETE /portal/alarms/:id — Delete alarm
   */
  router.delete('/portal/alarms/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);

    const { alarmService } = await import('../../reveil/alarm.service');
    const deleted = await alarmService.deleteAlarm(id, userId);
    if (!deleted) { res.status(404).json({ error: 'Alarm not found' }); return; }

    res.json({ success: true });
  }));

  /**
   * POST /portal/alarms/:id/test — Test alarm immediately
   */
  router.post('/portal/alarms/:id/test', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);

    const { alarmService } = await import('../../reveil/alarm.service');
    const result = await alarmService.testAlarm(id, userId);
    res.json({ content: result.content, delivered: result.delivered });
  }));

  return router;
}
