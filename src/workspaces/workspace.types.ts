// ─── Workspace/Team Types ───

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';
export type WorkspacePlan = 'team' | 'business' | 'enterprise';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  settings: WorkspaceSettings;
  plan: WorkspacePlan;
  maxMembers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  invitedBy: string | null;
  acceptedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  // Joined from users table
  email?: string;
  displayName?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface WorkspaceActivityEntry {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, unknown>;
  createdAt: Date;
  // Joined
  userName?: string;
}

export interface WorkspaceSettings {
  defaultAgents?: string[];
  sharedStrategy?: boolean;
  sharedDocuments?: boolean;
  sharedCRM?: boolean;
  sharedCampaigns?: boolean;
  approvalRequired?: boolean;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  plan?: WorkspacePlan;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
  maxMembers?: number;
}
