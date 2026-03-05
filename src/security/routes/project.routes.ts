import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';

export function createProjectRouter(): Router {
  const router = Router();

  /**
   * GET /portal/projects — List user's projects
   */
  router.get('/portal/projects', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { projectService } = await import('../../projects/project.service');
    const projects = await projectService.listProjects(userId);
    res.json({ projects });
  }));

  /**
   * POST /portal/projects — Create a new project
   */
  router.post('/portal/projects', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { name, description } = req.body as { name?: string; description?: string };
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const { projectService } = await import('../../projects/project.service');
    const project = await projectService.createProject(userId, { name, description });
    if (!project) {
      res.status(400).json({ error: 'Failed to create project (name may be too long or duplicate)' });
      return;
    }

    res.status(201).json({ project });
  }));

  /**
   * GET /portal/projects/:id — Get a specific project
   */
  router.get('/portal/projects/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { projectService } = await import('../../projects/project.service');
    const project = await projectService.getProject(id, userId);
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }

    res.json({ project });
  }));

  /**
   * PATCH /portal/projects/:id — Update a project
   */
  router.patch('/portal/projects/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { name, description, settings, isActive } = req.body as {
      name?: string;
      description?: string;
      settings?: Record<string, unknown>;
      isActive?: boolean;
    };

    const { projectService } = await import('../../projects/project.service');
    const project = await projectService.updateProject(id, userId, { name, description, settings, isActive });
    if (!project) {
      res.status(400).json({ error: 'Failed to update project (not found or invalid input)' });
      return;
    }

    res.json({ project });
  }));

  /**
   * DELETE /portal/projects/:id — Delete a project (cannot delete default)
   */
  router.delete('/portal/projects/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { projectService } = await import('../../projects/project.service');
    const result = await projectService.deleteProject(id, userId);
    if (!result.success) {
      res.status(400).json({ error: result.error ?? 'Failed to delete project' });
      return;
    }

    res.json({ message: 'Project deleted' });
  }));

  /**
   * POST /portal/projects/:id/set-default — Set a project as default
   */
  router.post('/portal/projects/:id/set-default', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { projectService } = await import('../../projects/project.service');
    const success = await projectService.setDefaultProject(id, userId);
    if (!success) {
      res.status(400).json({ error: 'Failed to set default project' });
      return;
    }

    res.json({ message: 'Default project updated' });
  }));

  return router;
}
