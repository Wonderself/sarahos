import { logger } from './logger';

interface AuditEntry {
  actor: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  try {
    const { dbClient } = await import('../infra');
    if (!dbClient.isConnected()) {
      logger.warn('Audit log skipped — DB not connected', { action: entry.action });
      return;
    }

    await dbClient.query(
      `INSERT INTO audit_log (actor, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.actor,
        entry.action,
        entry.resourceType,
        entry.resourceId ?? null,
        JSON.stringify(entry.details ?? {}),
        entry.ip ?? null,
      ],
    );
  } catch (err) {
    logger.error('Failed to write audit log', { entry, error: err instanceof Error ? err.message : String(err) });
  }
}
