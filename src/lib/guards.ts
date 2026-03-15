/**
 * Security Guards — Defense in depth layer
 * Used alongside RLS for double-checking ownership
 */
import { spawn } from 'child_process';

export class ForbiddenError extends Error {
  public readonly statusCode = 403;
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Assert that a resource belongs to the given user
 * Throws ForbiddenError if not
 */
export function assertOwnership(resource: Record<string, unknown>, userId: string): void {
  const resourceUserId = resource['user_id'] || resource['id'] || resource['owner_id'];
  if (resourceUserId !== userId) {
    throw new ForbiddenError('Access denied: resource does not belong to user');
  }
}

/**
 * Assert the user has one of the allowed roles
 */
export function assertRole(userRole: string, allowedRoles: string[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(`Access denied: role '${userRole}' not in [${allowedRoles.join(', ')}]`);
  }
}

/**
 * Sanitize output to only include allowed fields
 */
export function sanitizeOutput(data: Record<string, unknown>, allowedFields: string[]): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key))
  );
}

/**
 * Assert the user is a member of the organization (with optional role check)
 */
export async function assertTeamMember(orgId: string, userId: string, requiredRole?: string): Promise<void> {
  const result = await dbQuery(`
    SELECT role FROM organization_members
    WHERE organization_id = '${orgId}' AND user_id = '${userId}'
  `);

  if (!result || result === '') {
    throw new ForbiddenError('Access denied: not a member of this organization');
  }

  if (requiredRole) {
    const roleHierarchy: Record<string, number> = { owner: 4, admin: 3, member: 2, viewer: 1 };
    const userLevel = roleHierarchy[result.trim()] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    if (userLevel < requiredLevel) {
      throw new ForbiddenError(`Access denied: requires '${requiredRole}' role, you have '${result.trim()}'`);
    }
  }
}

// DB helper
function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim()));
  });
}
