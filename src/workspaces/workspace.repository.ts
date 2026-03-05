import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type {
  Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceActivityEntry,
  CreateWorkspaceInput, UpdateWorkspaceInput, WorkspaceRole,
} from './workspace.types';

// ─── Row mappers ───

function rowToWorkspace(row: Record<string, unknown>): Workspace {
  return {
    id: row['id'] as string,
    ownerId: row['owner_id'] as string,
    name: row['name'] as string,
    slug: row['slug'] as string,
    description: (row['description'] as string) ?? '',
    settings: (row['settings'] as Workspace['settings']) ?? {},
    plan: (row['plan'] as Workspace['plan']) ?? 'team',
    maxMembers: Number(row['max_members'] ?? 5),
    isActive: row['is_active'] as boolean,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToMember(row: Record<string, unknown>): WorkspaceMember {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    userId: row['user_id'] as string,
    role: row['role'] as WorkspaceRole,
    invitedBy: (row['invited_by'] as string) ?? null,
    acceptedAt: row['accepted_at'] ? new Date(row['accepted_at'] as string) : null,
    isActive: row['is_active'] as boolean,
    createdAt: new Date(row['created_at'] as string),
    email: (row['email'] as string) ?? undefined,
    displayName: (row['display_name'] as string) ?? undefined,
  };
}

function rowToInvitation(row: Record<string, unknown>): WorkspaceInvitation {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    email: row['email'] as string,
    role: row['role'] as WorkspaceRole,
    invitedBy: row['invited_by'] as string,
    token: row['token'] as string,
    status: row['status'] as WorkspaceInvitation['status'],
    expiresAt: new Date(row['expires_at'] as string),
    createdAt: new Date(row['created_at'] as string),
  };
}

function rowToActivity(row: Record<string, unknown>): WorkspaceActivityEntry {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    userId: row['user_id'] as string,
    action: row['action'] as string,
    resourceType: (row['resource_type'] as string) ?? null,
    resourceId: (row['resource_id'] as string) ?? null,
    details: (row['details'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
    userName: (row['display_name'] as string) ?? (row['email'] as string) ?? undefined,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    + '-' + crypto.randomBytes(3).toString('hex');
}

// ─── Repository ───

class WorkspaceRepository {
  // ─── Workspace CRUD ───

  async create(ownerId: string, input: CreateWorkspaceInput): Promise<Workspace | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    const slug = generateSlug(input.name);
    try {
      const result = await dbClient.query(
        `INSERT INTO workspaces (id, owner_id, name, slug, description, plan)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, ownerId, input.name, slug, input.description ?? '', input.plan ?? 'team'],
      );
      return result.rows[0] ? rowToWorkspace(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create workspace', { ownerId, error });
      return null;
    }
  }

  async getById(id: string): Promise<Workspace | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query('SELECT * FROM workspaces WHERE id = $1', [id]);
    return result.rows[0] ? rowToWorkspace(result.rows[0] as Record<string, unknown>) : null;
  }

  async listByUser(userId: string): Promise<Workspace[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      `SELECT w.* FROM workspaces w
       INNER JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1 AND wm.is_active = TRUE AND w.is_active = TRUE
       ORDER BY w.created_at ASC`,
      [userId],
    );
    return result.rows.map(r => rowToWorkspace(r as Record<string, unknown>));
  }

  async update(id: string, input: UpdateWorkspaceInput): Promise<Workspace | null> {
    if (!dbClient.isConnected()) return null;

    const sets: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (input.name !== undefined) { sets.push(`name = $${idx}`); values.push(input.name); idx++; }
    if (input.description !== undefined) { sets.push(`description = $${idx}`); values.push(input.description); idx++; }
    if (input.settings !== undefined) { sets.push(`settings = settings || $${idx}::jsonb`); values.push(JSON.stringify(input.settings)); idx++; }
    if (input.maxMembers !== undefined) { sets.push(`max_members = $${idx}`); values.push(input.maxMembers); idx++; }

    values.push(id);
    const result = await dbClient.query(
      `UPDATE workspaces SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] ? rowToWorkspace(result.rows[0] as Record<string, unknown>) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query(
      `UPDATE workspaces SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id],
    );
    return (result.rows.length ?? 0) > 0;
  }

  // ─── Members ───

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole, invitedBy?: string): Promise<WorkspaceMember | null> {
    if (!dbClient.isConnected()) return null;
    const id = uuidv4();
    try {
      const result = await dbClient.query(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, invited_by, accepted_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = $4, is_active = TRUE
         RETURNING *`,
        [id, workspaceId, userId, role, invitedBy ?? null],
      );
      return result.rows[0] ? rowToMember(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to add workspace member', { workspaceId, userId, error });
      return null;
    }
  }

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      `SELECT wm.*, u.email, u.display_name FROM workspace_members wm
       LEFT JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1 AND wm.is_active = TRUE
       ORDER BY wm.role = 'owner' DESC, wm.created_at ASC`,
      [workspaceId],
    );
    return result.rows.map(r => rowToMember(r as Record<string, unknown>));
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query(
      `SELECT role FROM workspace_members
       WHERE workspace_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [workspaceId, userId],
    );
    return result.rows[0] ? (result.rows[0] as Record<string, unknown>)['role'] as WorkspaceRole : null;
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query(
      `UPDATE workspace_members SET role = $3 WHERE workspace_id = $1 AND user_id = $2 RETURNING id`,
      [workspaceId, userId, role],
    );
    return (result.rows.length ?? 0) > 0;
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query(
      `UPDATE workspace_members SET is_active = FALSE WHERE workspace_id = $1 AND user_id = $2 RETURNING id`,
      [workspaceId, userId],
    );
    return (result.rows.length ?? 0) > 0;
  }

  async getMemberCount(workspaceId: string): Promise<number> {
    if (!dbClient.isConnected()) return 0;
    const result = await dbClient.query(
      'SELECT COUNT(*) as cnt FROM workspace_members WHERE workspace_id = $1 AND is_active = TRUE',
      [workspaceId],
    );
    return Number((result.rows[0] as Record<string, unknown>)?.['cnt'] ?? 0);
  }

  // ─── Invitations ───

  async createInvitation(workspaceId: string, email: string, role: WorkspaceRole, invitedBy: string): Promise<WorkspaceInvitation | null> {
    if (!dbClient.isConnected()) return null;
    const id = uuidv4();
    const token = crypto.randomBytes(32).toString('hex');
    try {
      const result = await dbClient.query(
        `INSERT INTO workspace_invitations (id, workspace_id, email, role, invited_by, token)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, workspaceId, email, role, invitedBy, token],
      );
      return result.rows[0] ? rowToInvitation(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create invitation', { workspaceId, email, error });
      return null;
    }
  }

  async getInvitationByToken(token: string): Promise<WorkspaceInvitation | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query(
      'SELECT * FROM workspace_invitations WHERE token = $1',
      [token],
    );
    return result.rows[0] ? rowToInvitation(result.rows[0] as Record<string, unknown>) : null;
  }

  async getPendingInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      `SELECT * FROM workspace_invitations
       WHERE workspace_id = $1 AND status = 'pending' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [workspaceId],
    );
    return result.rows.map(r => rowToInvitation(r as Record<string, unknown>));
  }

  async acceptInvitation(token: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query(
      `UPDATE workspace_invitations SET status = 'accepted' WHERE token = $1 RETURNING id`,
      [token],
    );
    return (result.rows.length ?? 0) > 0;
  }

  // ─── Activity Log ───

  async logActivity(
    workspaceId: string, userId: string, action: string,
    resourceType?: string, resourceId?: string, details?: Record<string, unknown>,
  ): Promise<void> {
    if (!dbClient.isConnected()) return;
    try {
      await dbClient.query(
        `INSERT INTO workspace_activity (id, workspace_id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), workspaceId, userId, action, resourceType ?? null, resourceId ?? null, JSON.stringify(details ?? {})],
      );
    } catch (error) {
      logger.error('Failed to log workspace activity', { workspaceId, action, error });
    }
  }

  async getActivity(workspaceId: string, limit = 50): Promise<WorkspaceActivityEntry[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      `SELECT wa.*, u.display_name, u.email FROM workspace_activity wa
       LEFT JOIN users u ON u.id = wa.user_id
       WHERE wa.workspace_id = $1
       ORDER BY wa.created_at DESC
       LIMIT $2`,
      [workspaceId, limit],
    );
    return result.rows.map(r => rowToActivity(r as Record<string, unknown>));
  }
}

export const workspaceRepository = new WorkspaceRepository();
