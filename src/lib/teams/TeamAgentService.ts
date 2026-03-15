/**
 * Teams System — Team Agent Service
 * Manages per-organization agent availability, custom instructions, and role-based access
 */
import { spawn } from 'child_process';
import type { OrgRole } from './OrganizationService';

// ─── Types ──────────────────────────────────────────────────

export interface OrganizationAgent {
  id: string;
  organization_id: string;
  agent_id: string;
  enabled: boolean;
  custom_instructions: string;
  allowed_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentResult {
  success: boolean;
  error?: string;
  agent?: OrganizationAgent;
  agents?: OrganizationAgent[];
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

// ─── Service ────────────────────────────────────────────────

export class TeamAgentService {
  /**
   * Get all agents available to a user based on their org role.
   * Returns only enabled agents where the user's role is in allowed_roles.
   */
  static async getAvailableAgents(
    orgId: string,
    userRole: OrgRole
  ): Promise<OrganizationAgent[]> {
    try {
      return dbQueryJSONArray<OrganizationAgent>(`
        SELECT * FROM organization_agents
        WHERE organization_id = '${esc(orgId)}'
        AND enabled = true
        AND '${esc(userRole)}' = ANY(allowed_roles)
        ORDER BY agent_id ASC
      `);
    } catch {
      return [];
    }
  }

  /**
   * Get all agents for an organization (regardless of enabled status or role)
   * Used by admins to manage agent configuration
   */
  static async getAllAgents(orgId: string): Promise<OrganizationAgent[]> {
    try {
      return dbQueryJSONArray<OrganizationAgent>(`
        SELECT * FROM organization_agents
        WHERE organization_id = '${esc(orgId)}'
        ORDER BY agent_id ASC
      `);
    } catch {
      return [];
    }
  }

  /**
   * Enable an agent for the organization.
   * Creates the record if it doesn't exist (upsert).
   * Only owner or admin can enable agents.
   */
  static async enableAgent(
    orgId: string,
    agentId: string,
    enabledBy: string
  ): Promise<AgentResult> {
    try {
      // Verify permissions
      const roleCheck = await this.checkAdminRole(orgId, enabledBy);
      if (!roleCheck.allowed) {
        return { success: false, error: roleCheck.reason };
      }

      // Upsert: insert or update
      await dbQuery(`
        INSERT INTO organization_agents (organization_id, agent_id, enabled, custom_instructions, allowed_roles)
        VALUES ('${esc(orgId)}', '${esc(agentId)}', true, '', ARRAY['owner', 'admin', 'member'])
        ON CONFLICT (organization_id, agent_id)
        DO UPDATE SET enabled = true, updated_at = NOW()
      `);

      const agent = await dbQueryJSON<OrganizationAgent>(
        `SELECT * FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      return { success: true, agent: agent || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Disable an agent for the organization.
   * Only owner or admin can disable agents.
   */
  static async disableAgent(
    orgId: string,
    agentId: string,
    disabledBy: string
  ): Promise<AgentResult> {
    try {
      // Verify permissions
      const roleCheck = await this.checkAdminRole(orgId, disabledBy);
      if (!roleCheck.allowed) {
        return { success: false, error: roleCheck.reason };
      }

      // Check if agent config exists
      const existing = await dbQuery(
        `SELECT id FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      if (!existing || existing === '') {
        return { success: false, error: 'Agent non configure pour cette organisation' };
      }

      await dbQuery(`
        UPDATE organization_agents
        SET enabled = false, updated_at = NOW()
        WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'
      `);

      const agent = await dbQueryJSON<OrganizationAgent>(
        `SELECT * FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      return { success: true, agent: agent || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Set custom instructions for an agent in the organization context.
   * These instructions are appended to the agent's default system prompt.
   * Only owner or admin can set instructions.
   */
  static async setAgentInstructions(
    orgId: string,
    agentId: string,
    instructions: string
  ): Promise<AgentResult> {
    try {
      // Check if agent config exists
      const existing = await dbQuery(
        `SELECT id FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      if (!existing || existing === '') {
        // Create agent config with instructions
        await dbQuery(`
          INSERT INTO organization_agents (organization_id, agent_id, enabled, custom_instructions, allowed_roles)
          VALUES ('${esc(orgId)}', '${esc(agentId)}', true, '${esc(instructions)}', ARRAY['owner', 'admin', 'member'])
        `);
      } else {
        await dbQuery(`
          UPDATE organization_agents
          SET custom_instructions = '${esc(instructions)}', updated_at = NOW()
          WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'
        `);
      }

      const agent = await dbQueryJSON<OrganizationAgent>(
        `SELECT * FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      return { success: true, agent: agent || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Update the allowed roles for an agent.
   * Only owner or admin can change role restrictions.
   */
  static async setAllowedRoles(
    orgId: string,
    agentId: string,
    roles: OrgRole[],
    updatedBy: string
  ): Promise<AgentResult> {
    try {
      const roleCheck = await this.checkAdminRole(orgId, updatedBy);
      if (!roleCheck.allowed) {
        return { success: false, error: roleCheck.reason };
      }

      // Validate roles
      const validRoles: OrgRole[] = ['owner', 'admin', 'member', 'viewer'];
      const sanitized = roles.filter((r) => validRoles.includes(r));
      if (sanitized.length === 0) {
        return { success: false, error: 'Au moins un role doit etre autorise' };
      }

      const rolesArray = `ARRAY[${sanitized.map((r) => `'${esc(r)}'`).join(', ')}]`;

      await dbQuery(`
        UPDATE organization_agents
        SET allowed_roles = ${rolesArray}, updated_at = NOW()
        WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'
      `);

      const agent = await dbQueryJSON<OrganizationAgent>(
        `SELECT * FROM organization_agents WHERE organization_id = '${esc(orgId)}' AND agent_id = '${esc(agentId)}'`
      );

      return { success: true, agent: agent || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  private static async checkAdminRole(
    orgId: string,
    userId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const role = await dbQuery(
        `SELECT role FROM organization_members WHERE organization_id = '${esc(orgId)}' AND user_id = '${esc(userId)}'`
      );
      if (!role || role === '') {
        return { allowed: false, reason: 'Utilisateur non membre de cette organisation' };
      }
      const trimmedRole = role.trim();
      if (trimmedRole !== 'owner' && trimmedRole !== 'admin') {
        return { allowed: false, reason: 'Seuls les owner et admin peuvent modifier la configuration des agents' };
      }
      return { allowed: true };
    } catch {
      return { allowed: false, reason: 'Erreur de verification des permissions' };
    }
  }
}
