import { workspaceRepository } from './workspace.repository';
import { logger } from '../utils/logger';
import type {
  Workspace, WorkspaceMember, WorkspaceInvitation,
  CreateWorkspaceInput, UpdateWorkspaceInput, WorkspaceRole, WorkspaceActivityEntry,
} from './workspace.types';

class WorkspaceService {
  async createWorkspace(ownerId: string, input: CreateWorkspaceInput): Promise<Workspace | null> {
    if (!input.name || input.name.trim().length === 0) return null;
    if (input.name.trim().length > 100) return null;

    const workspace = await workspaceRepository.create(ownerId, {
      name: input.name.trim(),
      description: input.description?.trim(),
      plan: input.plan,
    });

    if (!workspace) return null;

    // Add owner as first member
    await workspaceRepository.addMember(workspace.id, ownerId, 'owner');
    await workspaceRepository.logActivity(workspace.id, ownerId, 'workspace_created');

    logger.info('Workspace created', { workspaceId: workspace.id, ownerId });
    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return workspaceRepository.getById(id);
  }

  async listWorkspaces(userId: string): Promise<Workspace[]> {
    return workspaceRepository.listByUser(userId);
  }

  async updateWorkspace(id: string, userId: string, input: UpdateWorkspaceInput): Promise<Workspace | null> {
    const role = await workspaceRepository.getMemberRole(id, userId);
    if (role !== 'owner') return null;

    return workspaceRepository.update(id, input);
  }

  async deleteWorkspace(id: string, userId: string): Promise<boolean> {
    const role = await workspaceRepository.getMemberRole(id, userId);
    if (role !== 'owner') return false;

    return workspaceRepository.delete(id);
  }

  // ─── Members ───

  async getMembers(workspaceId: string, requesterId: string): Promise<WorkspaceMember[]> {
    const role = await workspaceRepository.getMemberRole(workspaceId, requesterId);
    if (!role) return [];
    return workspaceRepository.getMembers(workspaceId);
  }

  async canAccess(userId: string, workspaceId: string): Promise<boolean> {
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    return role !== null;
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    return workspaceRepository.getMemberRole(workspaceId, userId);
  }

  async updateMemberRole(workspaceId: string, targetUserId: string, newRole: WorkspaceRole, requesterId: string): Promise<boolean> {
    const requesterRole = await workspaceRepository.getMemberRole(workspaceId, requesterId);
    if (requesterRole !== 'owner') return false;
    if (targetUserId === requesterId) return false; // Can't change own role

    const success = await workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
    if (success) {
      await workspaceRepository.logActivity(workspaceId, requesterId, 'member_role_updated', 'member', targetUserId, { newRole });
    }
    return success;
  }

  async removeMember(workspaceId: string, targetUserId: string, requesterId: string): Promise<boolean> {
    const requesterRole = await workspaceRepository.getMemberRole(workspaceId, requesterId);
    if (requesterRole !== 'owner' && targetUserId !== requesterId) return false;

    const success = await workspaceRepository.removeMember(workspaceId, targetUserId);
    if (success) {
      await workspaceRepository.logActivity(workspaceId, requesterId, 'member_removed', 'member', targetUserId);
    }
    return success;
  }

  // ─── Invitations ───

  async inviteMember(workspaceId: string, requesterId: string, email: string, role: WorkspaceRole): Promise<WorkspaceInvitation | null> {
    const requesterRole = await workspaceRepository.getMemberRole(workspaceId, requesterId);
    if (requesterRole !== 'owner') return null;

    // Check member limit
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) return null;
    const memberCount = await workspaceRepository.getMemberCount(workspaceId);
    if (memberCount >= workspace.maxMembers) {
      logger.warn('Workspace member limit reached', { workspaceId, maxMembers: workspace.maxMembers });
      return null;
    }

    const invitation = await workspaceRepository.createInvitation(workspaceId, email, role, requesterId);
    if (invitation) {
      await workspaceRepository.logActivity(workspaceId, requesterId, 'invitation_sent', 'invitation', invitation.id, { email, role });

      // Send invitation notification (dispatched as email via notification service)
      try {
        const { notificationService } = await import('../notifications/notification.service');
        await notificationService.send({
          userId: requesterId,
          channel: 'email',
          type: 'workspace_invitation',
          subject: `Invitation à rejoindre "${workspace.name}" sur Freenzy.io`,
          body: `Invitation envoyée à ${email} pour rejoindre "${workspace.name}" (rôle: ${role}).`,
          metadata: { recipientEmail: email, inviteToken: invitation.token },
        });
      } catch (error) {
        logger.error('Failed to send invitation email', { email, error });
      }
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<{ success: boolean; workspaceId?: string; error?: string }> {
    const invitation = await workspaceRepository.getInvitationByToken(token);
    if (!invitation) return { success: false, error: 'Invitation not found' };
    if (invitation.status !== 'pending') return { success: false, error: 'Invitation already used' };
    if (new Date(invitation.expiresAt) < new Date()) return { success: false, error: 'Invitation expired' };

    // Accept the invitation
    await workspaceRepository.acceptInvitation(token);

    // Add member
    await workspaceRepository.addMember(invitation.workspaceId, userId, invitation.role, invitation.invitedBy);
    await workspaceRepository.logActivity(invitation.workspaceId, userId, 'invitation_accepted', 'invitation', invitation.id);

    return { success: true, workspaceId: invitation.workspaceId };
  }

  async getPendingInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return workspaceRepository.getPendingInvitations(workspaceId);
  }

  // ─── Activity ───

  async getActivity(workspaceId: string, requesterId: string): Promise<WorkspaceActivityEntry[]> {
    const role = await workspaceRepository.getMemberRole(workspaceId, requesterId);
    if (!role) return [];
    return workspaceRepository.getActivity(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
