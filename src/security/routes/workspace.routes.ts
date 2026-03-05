import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';

export function createWorkspaceRouter(): Router {
  const router = Router();

  /** GET /portal/workspaces — List user's workspaces */
  router.get('/portal/workspaces', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const workspaces = await workspaceService.listWorkspaces(userId);
    res.json({ workspaces });
  }));

  /** POST /portal/workspaces — Create workspace */
  router.post('/portal/workspaces', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { name, description, plan } = req.body as { name?: string; description?: string; plan?: string };
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Workspace name is required' });
      return;
    }

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const workspace = await workspaceService.createWorkspace(userId, { name, description, plan } as import('../../workspaces/workspace.types').CreateWorkspaceInput);
    if (!workspace) {
      res.status(400).json({ error: 'Failed to create workspace' });
      return;
    }

    res.status(201).json({ workspace });
  }));

  /** GET /portal/workspaces/:id — Get workspace details */
  router.get('/portal/workspaces/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { workspaceService } = await import('../../workspaces/workspace.service');
    const canAccess = await workspaceService.canAccess(userId, id);
    if (!canAccess) { res.status(403).json({ error: 'Access denied' }); return; }

    const workspace = await workspaceService.getWorkspace(id);
    if (!workspace) { res.status(404).json({ error: 'Workspace not found' }); return; }

    res.json({ workspace });
  }));

  /** PATCH /portal/workspaces/:id — Update workspace */
  router.patch('/portal/workspaces/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { name, description, settings, maxMembers } = req.body as Record<string, unknown>;

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const workspace = await workspaceService.updateWorkspace(id, userId, {
      name: name as string | undefined,
      description: description as string | undefined,
      settings: settings as Record<string, unknown> | undefined,
      maxMembers: maxMembers as number | undefined,
    } as import('../../workspaces/workspace.types').UpdateWorkspaceInput);

    if (!workspace) {
      res.status(400).json({ error: 'Failed to update workspace (not owner or not found)' });
      return;
    }

    res.json({ workspace });
  }));

  /** DELETE /portal/workspaces/:id — Delete workspace */
  router.delete('/portal/workspaces/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { workspaceService } = await import('../../workspaces/workspace.service');
    const success = await workspaceService.deleteWorkspace(id, userId);
    if (!success) { res.status(400).json({ error: 'Failed to delete workspace' }); return; }

    res.json({ message: 'Workspace deleted' });
  }));

  /** GET /portal/workspaces/:id/members — List members */
  router.get('/portal/workspaces/:id/members', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { workspaceService } = await import('../../workspaces/workspace.service');
    const members = await workspaceService.getMembers(id, userId);
    res.json({ members });
  }));

  /** POST /portal/workspaces/:id/invite — Invite member */
  router.post('/portal/workspaces/:id/invite', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { email, role } = req.body as { email?: string; role?: string };
    if (!email) { res.status(400).json({ error: 'Email is required' }); return; }

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const invitation = await workspaceService.inviteMember(id, userId, email, (role ?? 'viewer') as import('../../workspaces/workspace.types').WorkspaceRole);
    if (!invitation) {
      res.status(400).json({ error: 'Failed to send invitation (not owner, member limit reached, or error)' });
      return;
    }

    res.status(201).json({ invitation: { id: invitation.id, email: invitation.email, role: invitation.role } });
  }));

  /** PATCH /portal/workspaces/:id/members/:uid — Update member role */
  router.patch('/portal/workspaces/:id/members/:uid', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const wsId = String(req.params['id']);
    const targetUid = String(req.params['uid']);
    const { role } = req.body as { role?: string };
    if (!role) { res.status(400).json({ error: 'Role is required' }); return; }

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const success = await workspaceService.updateMemberRole(wsId, targetUid, role as import('../../workspaces/workspace.types').WorkspaceRole, userId);
    if (!success) { res.status(400).json({ error: 'Failed to update role' }); return; }

    res.json({ message: 'Role updated' });
  }));

  /** DELETE /portal/workspaces/:id/members/:uid — Remove member */
  router.delete('/portal/workspaces/:id/members/:uid', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const wsId = String(req.params['id']);
    const targetUid = String(req.params['uid']);

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const success = await workspaceService.removeMember(wsId, targetUid, userId);
    if (!success) { res.status(400).json({ error: 'Failed to remove member' }); return; }

    res.json({ message: 'Member removed' });
  }));

  /** POST /portal/workspaces/accept-invite — Accept invitation */
  router.post('/portal/workspaces/accept-invite', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { token } = req.body as { token?: string };
    if (!token) { res.status(400).json({ error: 'Token is required' }); return; }

    const { workspaceService } = await import('../../workspaces/workspace.service');
    const result = await workspaceService.acceptInvitation(token, userId);
    if (!result.success) {
      res.status(400).json({ error: result.error ?? 'Failed to accept invitation' });
      return;
    }

    res.json({ message: 'Invitation accepted', workspaceId: result.workspaceId });
  }));

  /** GET /portal/workspaces/:id/activity — Activity log */
  router.get('/portal/workspaces/:id/activity', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const id = String(req.params['id']);
    const { workspaceService } = await import('../../workspaces/workspace.service');
    const activity = await workspaceService.getActivity(id, userId);
    res.json({ activity });
  }));

  return router;
}
