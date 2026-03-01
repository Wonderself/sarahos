import { ApprovalQueue } from './approval-queue';
import { logger } from '../../utils/logger';
import type { DatabaseClient } from '../../infra/database/db-client';
import type { ApprovalRequest, ApprovalDecision, OverrideLevel } from './override.types';

export class PersistentApprovalQueue extends ApprovalQueue {
  private db: DatabaseClient | null = null;

  enablePersistence(db: DatabaseClient): void {
    if (db.isConnected()) {
      this.db = db;
      logger.info('ApprovalQueue persistence enabled — PostgreSQL');
    } else {
      logger.warn('ApprovalQueue persistence: DB not connected, using in-memory only');
    }
  }

  create(
    overrideLevel: OverrideLevel,
    title: string,
    description: string,
    requestingAgent: string,
    payload: Record<string, unknown> = {},
    expiresInMs?: number,
  ): ApprovalRequest {
    const request = super.create(overrideLevel, title, description, requestingAgent, payload, expiresInMs);

    if (this.db?.isConnected()) {
      this.db.query(
        `INSERT INTO approval_queue (id, override_level, title, description, requesting_agent, payload, status, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          request.id,
          request.overrideLevel,
          request.title,
          request.description,
          request.requestingAgent,
          JSON.stringify(request.payload),
          request.status,
          request.expiresAt,
          request.createdAt,
        ],
      ).catch((error) => {
        logger.error('Failed to persist approval request to PostgreSQL', {
          requestId: request.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    return request;
  }

  decide(decision: ApprovalDecision): ApprovalRequest {
    const request = super.decide(decision);

    if (this.db?.isConnected()) {
      this.db.query(
        `UPDATE approval_queue
         SET status = $1, decided_by = $2, decision_notes = $3, decided_at = $4
         WHERE id = $5`,
        [
          request.status,
          request.decidedBy,
          request.decisionNotes,
          request.decidedAt,
          request.id,
        ],
      ).catch((error) => {
        logger.error('Failed to persist approval decision to PostgreSQL', {
          requestId: request.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    return request;
  }

  async syncFromDatabase(): Promise<number> {
    if (!this.db?.isConnected()) {
      logger.warn('Cannot sync approvals from database — not connected');
      return 0;
    }

    const result = await this.db.query(
      `SELECT id, override_level, title, description, requesting_agent, payload, status, expires_at, created_at, decided_at, decided_by, decision_notes
       FROM approval_queue
       WHERE status = 'PENDING'
       ORDER BY created_at DESC`,
    );

    let synced = 0;
    for (const row of result.rows) {
      const existing = this.get(String(row['id']));
      if (!existing) {
        // Reconstruct in in-memory queue via create
        super.create(
          String(row['override_level']) as OverrideLevel,
          String(row['title']),
          String(row['description']),
          String(row['requesting_agent']),
          (row['payload'] as Record<string, unknown>) ?? {},
        );
        synced++;
      }
    }

    logger.info(`ApprovalQueue synced ${synced} pending requests from database`);
    return synced;
  }

  async getHistory(limit = 50): Promise<ApprovalRequest[]> {
    if (!this.db?.isConnected()) {
      return this.getByStatus('APPROVED')
        .concat(this.getByStatus('DENIED'))
        .slice(0, limit);
    }

    const result = await this.db.query(
      `SELECT id, override_level, title, description, requesting_agent, payload, status, expires_at, created_at, decided_at, decided_by, decision_notes
       FROM approval_queue
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );

    return result.rows.map((row) => ({
      id: String(row['id']),
      overrideLevel: String(row['override_level']) as OverrideLevel,
      title: String(row['title']),
      description: String(row['description']),
      requestingAgent: String(row['requesting_agent']),
      payload: (row['payload'] as Record<string, unknown>) ?? {},
      status: String(row['status']) as ApprovalRequest['status'],
      expiresAt: row['expires_at'] ? String(row['expires_at']) : null,
      createdAt: String(row['created_at']),
      decidedAt: row['decided_at'] ? String(row['decided_at']) : null,
      decidedBy: row['decided_by'] ? String(row['decided_by']) : null,
      decisionNotes: row['decision_notes'] ? String(row['decision_notes']) : null,
    }));
  }

  isPersistenceEnabled(): boolean {
    return this.db?.isConnected() ?? false;
  }
}

export const persistentApprovalQueue = new PersistentApprovalQueue();
