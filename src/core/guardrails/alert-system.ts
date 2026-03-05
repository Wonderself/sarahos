// ═══════════════════════════════════════════════════════════════════
// Alert System — notifications by severity
// ═══════════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../infra/database/db-client';
import { logger } from '../../utils/logger';
import { notificationService } from '../../notifications/notification.service';
import type { AlertSeverity, GuardrailAlert } from './guardrails.types';

const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? 'smadja99@gmail.com';
const ADMIN_PHONE = process.env['ADMIN_PHONE'] ?? '';

/** System user ID used for admin-targeted notifications. */
const SYSTEM_USER_ID = 'system';

function rowToAlert(row: Record<string, unknown>): GuardrailAlert {
  return {
    id: String(row['id']),
    severity: row['severity'] as AlertSeverity,
    type: String(row['type']),
    message: String(row['message']),
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    userId: row['user_id'] ? String(row['user_id']) : undefined,
    agentId: row['agent_id'] ? String(row['agent_id']) : undefined,
    createdAt: new Date(row['created_at'] as string),
    acknowledged: Boolean(row['acknowledged']),
  };
}

/**
 * Creates a guardrail alert:
 * 1. Persists to the guardrail_alerts table
 * 2. Dispatches notifications based on severity:
 *    - critical → SMS + email
 *    - high → email only
 *    - medium/low → log + DB only
 */
export async function createAlert(
  severity: AlertSeverity,
  type: string,
  message: string,
  metadata?: Record<string, unknown>,
  userId?: string,
  agentId?: string,
): Promise<void> {
  const id = uuidv4();
  const meta = metadata ?? {};

  // Always log the alert
  const logData = { id, severity, type, message, userId, agentId, metadata: meta };
  if (severity === 'critical' || severity === 'high') {
    logger.error('GuardrailAlert', logData);
  } else {
    logger.warn('GuardrailAlert', logData);
  }

  // Persist to DB
  if (dbClient.isConnected()) {
    try {
      await dbClient.query(
        `INSERT INTO guardrail_alerts (id, severity, type, message, metadata, user_id, agent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, severity, type, message, JSON.stringify(meta), userId ?? null, agentId ?? null],
      );
    } catch (error) {
      logger.error('AlertSystem: failed to persist alert to DB', {
        alertId: id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Dispatch notifications based on severity (best-effort, never throw)
  try {
    if (severity === 'critical') {
      // SMS to admin phone
      if (ADMIN_PHONE) {
        await notificationService.send({
          userId: SYSTEM_USER_ID,
          channel: 'sms',
          type: 'guardrail_alert',
          subject: `[CRITICAL] ${type}`,
          body: message,
          metadata: { ...meta, alertId: id, phone: ADMIN_PHONE },
        });
      }
      // Email to admin
      await notificationService.send({
        userId: SYSTEM_USER_ID,
        channel: 'email',
        type: 'guardrail_alert',
        subject: `[CRITICAL] Freenzy Alert: ${type}`,
        body: `Severity: CRITICAL\nType: ${type}\n\n${message}\n\nMetadata: ${JSON.stringify(meta, null, 2)}`,
        metadata: { ...meta, alertId: id, email: ADMIN_EMAIL },
      });
    } else if (severity === 'high') {
      // Email only
      await notificationService.send({
        userId: SYSTEM_USER_ID,
        channel: 'email',
        type: 'guardrail_alert',
        subject: `[HIGH] Freenzy Alert: ${type}`,
        body: `Severity: HIGH\nType: ${type}\n\n${message}\n\nMetadata: ${JSON.stringify(meta, null, 2)}`,
        metadata: { ...meta, alertId: id, email: ADMIN_EMAIL },
      });
    }
    // medium / low → DB + log only (already done above)
  } catch (error) {
    // Notification failure must never prevent alert from being saved
    logger.error('AlertSystem: notification dispatch failed', {
      alertId: id,
      severity,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Retrieves the most recent alerts from the database.
 */
export async function getRecentAlerts(limit = 50): Promise<GuardrailAlert[]> {
  if (!dbClient.isConnected()) return [];

  try {
    const result = await dbClient.query(
      `SELECT * FROM guardrail_alerts ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return result.rows.map((r) => rowToAlert(r as Record<string, unknown>));
  } catch (error) {
    logger.error('AlertSystem: getRecentAlerts failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Marks an alert as acknowledged.
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  if (!dbClient.isConnected()) return;

  try {
    await dbClient.query(
      `UPDATE guardrail_alerts SET acknowledged = TRUE WHERE id = $1`,
      [alertId],
    );
    logger.info('AlertSystem: alert acknowledged', { alertId });
  } catch (error) {
    logger.error('AlertSystem: acknowledgeAlert failed', {
      alertId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Returns the count of unacknowledged alerts.
 */
export async function getUnacknowledgedCount(): Promise<number> {
  if (!dbClient.isConnected()) return 0;

  try {
    const result = await dbClient.query(
      `SELECT COUNT(*)::int AS count FROM guardrail_alerts WHERE acknowledged = FALSE`,
    );
    return Number((result.rows[0] as Record<string, unknown>)['count']);
  } catch (error) {
    logger.error('AlertSystem: getUnacknowledgedCount failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
