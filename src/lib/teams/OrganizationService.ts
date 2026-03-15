/**
 * Teams System — Organization Service
 * Manages organizations, members, roles, and ownership transfer
 */
import { spawn } from 'child_process';

// ─── Types ──────────────────────────────────────────────────

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type OrgPlan = 'free' | 'starter' | 'business' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: OrgPlan;
  max_members: number;
  shared_credits: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  permissions: Record<string, unknown>;
  invited_by: string | null;
  joined_at: string;
  email?: string;
  name?: string;
  total_credits_used?: number;
}

export interface OrgResult {
  success: boolean;
  error?: string;
  organization?: Organization;
  member?: OrganizationMember;
  members?: OrganizationMember[];
}

// ─── DB Helpers (psql pattern) ──────────────────────────────

function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0 && err) reject(new Error(err.trim()));
      else resolve(out.trim());
    });
  });
}

function dbQueryJSON<T>(sql: string): Promise<T | null> {
  return dbQuery(`SELECT row_to_json(t) FROM (${sql}) t`)
    .then((result) => {
      if (!result || result === '') return null;
      return JSON.parse(result) as T;
    })
    .catch(() => null);
}

function dbQueryJSONArray<T>(sql: string): Promise<T[]> {
  return dbQuery(`SELECT row_to_json(t) FROM (${sql}) t`)
    .then((result) => {
      if (!result || result === '') return [];
      return result.split('\n').filter(Boolean).map((line) => JSON.parse(line) as T);
    })
    .catch(() => []);
}

function esc(val: string): string {
  return val.replace(/'/g, "''");
}

export function generateOrgId(): string {
  return `org_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Service ────────────────────────────────────────────────

export class OrganizationService {
  /**
   * Create a new organization and add the creator as owner
   */
  static async createOrganization(
    ownerId: string,
    name: string,
    slug: string
  ): Promise<OrgResult> {
    try {
      // Validate slug format (lowercase, alphanumeric + hyphens)
      const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (slugClean.length < 3 || slugClean.length > 80) {
        return { success: false, error: 'Le slug doit contenir entre 3 et 80 caracteres alphanumeriques' };
      }

      // Check slug uniqueness
      const existing = await dbQuery(
        `SELECT id FROM organizations WHERE slug = '${esc(slugClean)}'`
      );
      if (existing && existing !== '') {
        return { success: false, error: 'Ce slug est deja utilise' };
      }

      // Check if user exists
      const userCheck = await dbQuery(`SELECT id FROM users WHERE id = '${esc(ownerId)}'`);
      if (!userCheck || userCheck === '') {
        return { success: false, error: 'Utilisateur introuvable' };
      }

      // Create organization
      const orgResult = await dbQuery(`
        INSERT INTO organizations (name, slug, owner_id, plan, max_members, shared_credits, settings)
        VALUES ('${esc(name)}', '${esc(slugClean)}', '${esc(ownerId)}', 'free', 5, 0, '{}')
        RETURNING id
      `);

      const orgId = orgResult.trim();
      if (!orgId) {
        return { success: false, error: 'Echec de creation de l\'organisation' };
      }

      // Add owner as first member
      await dbQuery(`
        INSERT INTO organization_members (organization_id, user_id, role, permissions, invited_by)
        VALUES ('${orgId}', '${esc(ownerId)}', 'owner', '{"all": true}'::jsonb, '${esc(ownerId)}')
      `);

      // Create default credit pool
      await dbQuery(`
        INSERT INTO credit_pools (organization_id, total_credits, used_credits, monthly_limit, reset_day)
        VALUES ('${orgId}', 0, 0, 0, 1)
      `);

      const org = await dbQueryJSON<Organization>(
        `SELECT * FROM organizations WHERE id = '${orgId}'`
      );

      return { success: true, organization: org || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Invite a member by email. Inviter must be owner or admin.
   */
  static async inviteMember(
    orgId: string,
    email: string,
    role: OrgRole,
    invitedBy: string
  ): Promise<OrgResult> {
    try {
      // Verify inviter is owner or admin
      const inviterRole = await this.getMemberRole(orgId, invitedBy);
      if (!inviterRole || (inviterRole !== 'owner' && inviterRole !== 'admin')) {
        return { success: false, error: 'Seuls les owner et admin peuvent inviter des membres' };
      }

      // Cannot invite as owner
      if (role === 'owner') {
        return { success: false, error: 'Impossible d\'inviter directement comme owner. Utilisez transferOwnership.' };
      }

      // Admin cannot invite another admin (only owner can)
      if (role === 'admin' && inviterRole !== 'owner') {
        return { success: false, error: 'Seul le owner peut promouvoir un membre en admin' };
      }

      // Find user by email
      const userRow = await dbQuery(
        `SELECT id FROM users WHERE email = '${esc(email)}'`
      );
      if (!userRow || userRow === '') {
        return { success: false, error: 'Aucun utilisateur avec cet email' };
      }
      const userId = userRow.trim();

      // Check member limit
      const org = await dbQueryJSON<Organization>(
        `SELECT * FROM organizations WHERE id = '${esc(orgId)}'`
      );
      if (!org) {
        return { success: false, error: 'Organisation introuvable' };
      }

      const memberCount = await dbQuery(
        `SELECT COUNT(*) FROM organization_members WHERE organization_id = '${esc(orgId)}'`
      );
      if (parseInt(memberCount, 10) >= org.max_members) {
        return { success: false, error: `Limite de ${org.max_members} membres atteinte. Passez a un plan superieur.` };
      }

      // Check if already a member
      const existingMember = await dbQuery(
        `SELECT id FROM organization_members WHERE organization_id = '${esc(orgId)}' AND user_id = '${userId}'`
      );
      if (existingMember && existingMember !== '') {
        return { success: false, error: 'Cet utilisateur est deja membre de l\'organisation' };
      }

      // Add member
      await dbQuery(`
        INSERT INTO organization_members (organization_id, user_id, role, permissions, invited_by)
        VALUES ('${esc(orgId)}', '${userId}', '${esc(role)}', '{}'::jsonb, '${esc(invitedBy)}')
      `);

      const member = await dbQueryJSON<OrganizationMember>(
        `SELECT * FROM organization_members WHERE organization_id = '${esc(orgId)}' AND user_id = '${userId}'`
      );

      return { success: true, member: member || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Remove a member from the organization. Cannot remove the owner.
   */
  static async removeMember(
    orgId: string,
    userId: string,
    removedBy: string
  ): Promise<OrgResult> {
    try {
      // Verify remover is owner or admin
      const removerRole = await this.getMemberRole(orgId, removedBy);
      if (!removerRole || (removerRole !== 'owner' && removerRole !== 'admin')) {
        return { success: false, error: 'Seuls les owner et admin peuvent retirer des membres' };
      }

      // Cannot remove the owner
      const targetRole = await this.getMemberRole(orgId, userId);
      if (targetRole === 'owner') {
        return { success: false, error: 'Impossible de retirer le proprietaire. Utilisez transferOwnership d\'abord.' };
      }

      // Admin cannot remove another admin
      if (targetRole === 'admin' && removerRole !== 'owner') {
        return { success: false, error: 'Seul le owner peut retirer un admin' };
      }

      await dbQuery(`
        DELETE FROM organization_members
        WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(userId)}'
      `);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Update a member's role. Only owner can promote to admin.
   */
  static async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: OrgRole,
    updatedBy: string
  ): Promise<OrgResult> {
    try {
      // Verify updater is owner or admin
      const updaterRole = await this.getMemberRole(orgId, updatedBy);
      if (!updaterRole || (updaterRole !== 'owner' && updaterRole !== 'admin')) {
        return { success: false, error: 'Permissions insuffisantes' };
      }

      // Cannot change to owner via this method
      if (newRole === 'owner') {
        return { success: false, error: 'Utilisez transferOwnership pour changer le proprietaire' };
      }

      // Only owner can promote to admin
      if (newRole === 'admin' && updaterRole !== 'owner') {
        return { success: false, error: 'Seul le owner peut promouvoir en admin' };
      }

      // Cannot change own role
      if (userId === updatedBy) {
        return { success: false, error: 'Impossible de modifier son propre role' };
      }

      // Cannot demote owner
      const targetRole = await this.getMemberRole(orgId, userId);
      if (targetRole === 'owner') {
        return { success: false, error: 'Impossible de modifier le role du proprietaire' };
      }

      // Admin cannot modify another admin
      if (targetRole === 'admin' && updaterRole !== 'owner') {
        return { success: false, error: 'Seul le owner peut modifier un admin' };
      }

      await dbQuery(`
        UPDATE organization_members
        SET role = '${esc(newRole)}'
        WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(userId)}'
      `);

      const member = await dbQueryJSON<OrganizationMember>(
        `SELECT * FROM organization_members WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(userId)}'`
      );

      return { success: true, member: member || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Get all members of an organization with usage stats
   */
  static async getMembers(orgId: string): Promise<OrgResult> {
    try {
      const members = await dbQueryJSONArray<OrganizationMember>(`
        SELECT
          om.*,
          u.email,
          u.name,
          COALESCE(cul.total_used, 0) AS total_credits_used
        FROM organization_members om
        JOIN users u ON u.id = om.user_id
        LEFT JOIN (
          SELECT user_id, SUM(credits_used) AS total_used
          FROM credit_usage_log
          WHERE organization_id = '${esc(orgId)}'
          GROUP BY user_id
        ) cul ON cul.user_id = om.user_id
        WHERE om.organization_id = '${esc(orgId)}'
        ORDER BY
          CASE om.role
            WHEN 'owner' THEN 0
            WHEN 'admin' THEN 1
            WHEN 'member' THEN 2
            WHEN 'viewer' THEN 3
          END,
          om.joined_at ASC
      `);

      return { success: true, members };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Transfer ownership to another member. Current owner becomes admin.
   */
  static async transferOwnership(
    orgId: string,
    newOwnerId: string,
    currentOwnerId: string
  ): Promise<OrgResult> {
    try {
      // Verify current owner
      const currentRole = await this.getMemberRole(orgId, currentOwnerId);
      if (currentRole !== 'owner') {
        return { success: false, error: 'Seul le proprietaire actuel peut transferer la propriete' };
      }

      // Verify new owner is a member
      const newOwnerRole = await this.getMemberRole(orgId, newOwnerId);
      if (!newOwnerRole) {
        return { success: false, error: 'Le nouveau proprietaire doit etre membre de l\'organisation' };
      }

      // Cannot transfer to self
      if (newOwnerId === currentOwnerId) {
        return { success: false, error: 'Vous etes deja le proprietaire' };
      }

      // Update new owner
      await dbQuery(`
        UPDATE organization_members SET role = 'owner'
        WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(newOwnerId)}'
      `);

      // Demote current owner to admin
      await dbQuery(`
        UPDATE organization_members SET role = 'admin'
        WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(currentOwnerId)}'
      `);

      // Update organization owner_id
      await dbQuery(`
        UPDATE organizations SET owner_id = '${esc(newOwnerId)}'
        WHERE id = '${esc(orgId)}'
      `);

      const org = await dbQueryJSON<Organization>(
        `SELECT * FROM organizations WHERE id = '${esc(orgId)}'`
      );

      return { success: true, organization: org || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Get a member's role in an organization
   */
  static async getMemberRole(orgId: string, userId: string): Promise<OrgRole | null> {
    try {
      const result = await dbQuery(
        `SELECT role FROM organization_members WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(userId)}'`
      );
      if (!result || result === '') return null;
      return result.trim() as OrgRole;
    } catch {
      return null;
    }
  }

  /**
   * Get organization by ID
   */
  static async getById(orgId: string): Promise<Organization | null> {
    return dbQueryJSON<Organization>(
      `SELECT * FROM organizations WHERE id = '${esc(orgId)}'`
    );
  }

  /**
   * Get organization by slug
   */
  static async getBySlug(slug: string): Promise<Organization | null> {
    return dbQueryJSON<Organization>(
      `SELECT * FROM organizations WHERE slug = '${esc(slug)}'`
    );
  }

  /**
   * Get all organizations a user belongs to
   */
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    return dbQueryJSONArray<Organization>(`
      SELECT o.* FROM organizations o
      JOIN organization_members om ON om.organization_id = o.id
      WHERE om.user_id = '${esc(userId)}'
      ORDER BY o.created_at DESC
    `);
  }
}
