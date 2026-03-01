import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateQuery } from '../validation.middleware';
import { eventsQuerySchema } from '../validation.schemas';
import { eventBus } from '../../core/event-bus/event-bus';
import { persistentEventBus } from '../../core/event-bus/event-bus.persistent';
import type { EventType } from '../../core/event-bus/event.types';

export function createEventsRouter(): Router {
  const router = Router();

  router.use(verifyToken);
  router.use(requireRole('viewer', 'operator', 'system'));

  router.get('/events/recent', validateQuery(eventsQuerySchema), (_req, res) => {
    const { type, limit, offset } = _req.query as unknown as { type?: string; limit: number; offset: number };

    let events;
    if (type) {
      events = eventBus.getEventsByType(type as EventType, limit + offset);
    } else {
      events = eventBus.getRecentEvents(limit + offset);
    }

    res.json(events.slice(offset, offset + limit));
  });

  router.get('/events/stats', async (_req, res) => {
    const stats = await persistentEventBus.getEventStats();
    res.json(stats);
  });

  return router;
}
