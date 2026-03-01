import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { agentExecuteSchema } from '../validation.schemas';
import { agentRegistry } from '../../core/agent-registry/agent-registry';
import { eventBus } from '../../core/event-bus/event-bus';

export function createAgentControlRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  router.post('/agents/:id/execute', requireRole('operator', 'system'), validateBody(agentExecuteSchema), async (req, res) => {
    const agentId = req.params['id'] as string;
    const agent = agentRegistry.get(agentId);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    if (agent.status === 'BUSY') {
      res.status(409).json({ error: 'Agent is busy' });
      return;
    }

    if (agent.status === 'DISABLED') {
      res.status(409).json({ error: 'Agent is disabled' });
      return;
    }

    const body = req.body as {
      title: string;
      description: string;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      payload: Record<string, unknown>;
    };

    const task = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      priority: body.priority,
      payload: body.payload,
      assignedBy: 'api',
      correlationId: uuidv4(),
    };

    try {
      const result = await agent.execute(task);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' });
    }
  });

  router.post('/agents/:id/pause', requireRole('operator', 'system'), (_req, res) => {
    const agentId = _req.params['id'] as string;
    const agent = agentRegistry.get(agentId);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    agent.status = 'DISABLED';
    res.json({ id: agentId, status: 'DISABLED' });
  });

  router.post('/agents/:id/resume', requireRole('operator', 'system'), (_req, res) => {
    const agentId = _req.params['id'] as string;
    const agent = agentRegistry.get(agentId);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    agent.status = 'IDLE';
    res.json({ id: agentId, status: 'IDLE' });
  });

  router.get('/agents/:id/health', requireRole('viewer', 'operator', 'system'), async (req, res) => {
    const agentId = req.params['id'] as string;
    const agent = agentRegistry.get(agentId);

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const health = await agent.healthCheck();
    res.json(health);
  });

  router.get('/agents/:id/history', requireRole('viewer', 'operator', 'system'), (req, res) => {
    const agentId = req.params['id'] as string;
    const count = Math.min(parseInt(String(req.query['count'] ?? '20'), 10), 100);
    const events = eventBus.getRecentEvents(500).filter((e) => e.sourceAgent === agentId);
    res.json(events.slice(-count));
  });

  return router;
}
