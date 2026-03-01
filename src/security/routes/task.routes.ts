import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { createTaskSchema } from '../validation.schemas';
import { taskScheduler } from '../../core/orchestrator/task-scheduler';
import { eventBus } from '../../core/event-bus/event-bus';

export function createTaskRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  router.post('/tasks', requireRole('operator', 'system'), validateBody(createTaskSchema), async (req, res) => {
    const body = req.body as {
      title: string;
      description: string;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      payload: Record<string, unknown>;
      assignedBy: string;
      deadline?: string;
      autonomyBoost: boolean;
    };

    const task = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      priority: body.priority,
      payload: body.payload,
      assignedBy: body.assignedBy,
      correlationId: uuidv4(),
      deadline: body.deadline,
    };

    taskScheduler.enqueue(task, body.autonomyBoost);

    await eventBus.publish('TaskCreated', 'api', {
      taskId: task.id,
      title: task.title,
      priority: task.priority,
    });

    res.status(201).json(task);
  });

  router.get('/tasks', requireRole('viewer', 'operator', 'system'), (req, res) => {
    let tasks = taskScheduler.getQueue();
    const priority = req.query['priority'] as string | undefined;
    const assignedBy = req.query['assignedBy'] as string | undefined;

    if (priority) {
      tasks = tasks.filter((t) => t.priority === priority);
    }
    if (assignedBy) {
      tasks = tasks.filter((t) => t.assignedBy === assignedBy);
    }

    res.json(tasks);
  });

  router.get('/tasks/:id', requireRole('viewer', 'operator', 'system'), (req, res) => {
    const id = req.params['id'] as string;
    const task = taskScheduler.getById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  });

  router.delete('/tasks/:id', requireRole('operator', 'system'), (req, res) => {
    const id = req.params['id'] as string;
    const removed = taskScheduler.remove(id);
    if (!removed) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
