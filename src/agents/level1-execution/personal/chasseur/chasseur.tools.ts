// ═══════════════════════════════════════════════════════
// Chasseur Agent — Tools & Repository (DAO)
// ═══════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import type {
  Mission,
  MissionStatus,
  FreelancePlatform,
  PipelineStats,
} from './chasseur.types';

// ── Get Missions ──

export async function getMissions(
  userId: string,
  statusFilter?: MissionStatus,
): Promise<Mission[]> {
  if (!dbClient.isConnected()) return [];
  try {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];

    if (statusFilter) {
      conditions.push('status = $2');
      values.push(statusFilter);
    }

    const result = await dbClient.query(
      `SELECT * FROM mission_pipeline WHERE ${conditions.join(' AND ')} ORDER BY updated_at DESC`,
      values,
    );

    return result.rows.map((r) => rowToMission(r as Record<string, unknown>));
  } catch (err) {
    logger.error('Failed to get missions', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

// ── Create Mission ──

export async function createMission(
  userId: string,
  data: Partial<Mission>,
): Promise<Mission | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO mission_pipeline
       (id, user_id, title, client_name, platform, url, tjm_cents,
        duration_days, status, notes, applied_at, next_action,
        next_action_date, tags, remote_policy, location,
        contact_name, contact_email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        id,
        userId,
        data.title ?? 'Sans titre',
        data.clientName ?? null,
        data.platform ?? 'autre',
        data.url ?? null,
        data.tjmCents ?? null,
        data.durationDays ?? null,
        data.status ?? 'discovered',
        data.notes ?? null,
        data.appliedAt ?? null,
        data.nextAction ?? null,
        data.nextActionDate ?? null,
        data.tags ?? [],
        data.remotePolicy ?? null,
        data.location ?? null,
        data.contactName ?? null,
        data.contactEmail ?? null,
      ],
    );

    return rowToMission(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to create mission', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Update Mission Status ──

export async function updateMissionStatus(
  missionId: string,
  userId: string,
  status: MissionStatus,
): Promise<Mission | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const extraFields: string[] = [];
    const values: unknown[] = [status];
    let idx = 2;

    // Set applied_at when transitioning to applied
    if (status === 'applied') {
      extraFields.push(`applied_at = COALESCE(applied_at, NOW())`);
    }

    const setClause = [
      `status = $1`,
      ...extraFields,
      `updated_at = NOW()`,
    ].join(', ');

    values.push(missionId, userId);

    const result = await dbClient.query(
      `UPDATE mission_pipeline SET ${setClause} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) return null;
    return rowToMission(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to update mission status', {
      missionId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Pipeline Stats ──

export async function getPipelineStats(userId: string): Promise<PipelineStats> {
  const defaultStats: PipelineStats = {
    total: 0,
    byStatus: {
      discovered: 0,
      applied: 0,
      interview: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
      archived: 0,
    },
    avgTjmCents: null,
    totalPotentialRevenueCents: 0,
    conversionRate: 0,
    activeMissions: 0,
  };

  if (!dbClient.isConnected()) return defaultStats;

  try {
    const [statusResult, tjmResult] = await Promise.all([
      dbClient.query(
        `SELECT status, COUNT(*) as count
         FROM mission_pipeline WHERE user_id = $1
         GROUP BY status`,
        [userId],
      ),
      dbClient.query(
        `SELECT
           AVG(tjm_cents) FILTER (WHERE tjm_cents IS NOT NULL) as avg_tjm,
           SUM(tjm_cents * COALESCE(duration_days, 1)) FILTER (WHERE status IN ('discovered','applied','interview','negotiation')) as potential_revenue
         FROM mission_pipeline WHERE user_id = $1`,
        [userId],
      ),
    ]);

    const byStatus = { ...defaultStats.byStatus };
    let total = 0;
    let wonCount = 0;
    let appliedOrBeyond = 0;
    const activeStatuses: MissionStatus[] = ['discovered', 'applied', 'interview', 'negotiation'];

    for (const row of statusResult.rows) {
      const r = row as Record<string, unknown>;
      const status = r['status'] as MissionStatus;
      const count = Number(r['count'] ?? 0);
      byStatus[status] = count;
      total += count;
      if (status === 'won') wonCount = count;
      if (['applied', 'interview', 'negotiation', 'won', 'lost'].includes(status)) {
        appliedOrBeyond += count;
      }
    }

    const tjmRow = tjmResult.rows[0] as Record<string, unknown> | undefined;
    const avgTjm = tjmRow?.['avg_tjm'] != null ? Math.round(Number(tjmRow['avg_tjm'])) : null;
    const potentialRevenue = Number(tjmRow?.['potential_revenue'] ?? 0);
    const conversionRate = appliedOrBeyond > 0 ? Math.round((wonCount / appliedOrBeyond) * 100) : 0;
    const activeMissions = activeStatuses.reduce((sum, s) => sum + byStatus[s], 0);

    return {
      total,
      byStatus,
      avgTjmCents: avgTjm,
      totalPotentialRevenueCents: potentialRevenue,
      conversionRate,
      activeMissions,
    };
  } catch (err) {
    logger.error('Failed to get pipeline stats', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return defaultStats;
  }
}

// ── Row Mapper ──

function rowToMission(row: Record<string, unknown>): Mission {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    title: (row['title'] as string) ?? 'Sans titre',
    clientName: (row['client_name'] as string) ?? null,
    platform: (row['platform'] as FreelancePlatform) ?? 'autre',
    url: (row['url'] as string) ?? null,
    tjmCents: row['tjm_cents'] != null ? Number(row['tjm_cents']) : null,
    durationDays: row['duration_days'] != null ? Number(row['duration_days']) : null,
    status: (row['status'] as MissionStatus) ?? 'discovered',
    notes: (row['notes'] as string) ?? null,
    appliedAt: row['applied_at'] ? new Date(row['applied_at'] as string) : null,
    nextAction: (row['next_action'] as string) ?? null,
    nextActionDate: row['next_action_date'] ? new Date(row['next_action_date'] as string) : null,
    tags: (row['tags'] as string[]) ?? [],
    remotePolicy: (row['remote_policy'] as Mission['remotePolicy']) ?? null,
    location: (row['location'] as string) ?? null,
    contactName: (row['contact_name'] as string) ?? null,
    contactEmail: (row['contact_email'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
