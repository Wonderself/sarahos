import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { memoryStoreSchema, memorySearchSchema } from '../validation.schemas';
import { memoryManager } from '../../core/memory/memory-manager';
import type { MemoryStoreOptions, MemorySearchOptions } from '../../core/memory/memory.types';

export function createMemoryRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  router.post('/memory/store', requireRole('operator', 'system'), validateBody(memoryStoreSchema), async (req, res) => {
    const body = req.body as MemoryStoreOptions;
    const entry = await memoryManager.store(body);
    res.status(201).json(entry);
  });

  router.post('/memory/search', requireRole('viewer', 'operator', 'system'), validateBody(memorySearchSchema), async (req, res) => {
    const body = req.body as MemorySearchOptions;
    const results = await memoryManager.search(body);
    res.json(results);
  });

  router.get('/memory/:id', requireRole('viewer', 'operator', 'system'), (req, res) => {
    const id = req.params['id'] as string;
    const entry = memoryManager.get(id);
    if (!entry) {
      res.status(404).json({ error: 'Memory entry not found' });
      return;
    }
    res.json(entry);
  });

  router.delete('/memory/:id', requireRole('operator', 'system'), (req, res) => {
    const id = req.params['id'] as string;
    const deleted = memoryManager.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Memory entry not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
