import { logger } from '../utils/logger';
import type {
  AgentProposal, AuditReport, CreateProposalInput,
  ProposalStatus, AutopilotStats,
} from './autopilot.types';

// Row → typed helper
function rowToProposal(r: Record<string, unknown>): AgentProposal {
  return {
    id: String(r.id),
    agentId: String(r.agent_id),
    agentName: String(r.agent_name),
    category: r.category as AgentProposal['category'],
    severity: r.severity as AgentProposal['severity'],
    title: String(r.title),
    description: String(r.description),
    rationale: String(r.rationale),
    impactEstimate: r.impact_estimate ? String(r.impact_estimate) : undefined,
    riskEstimate: r.risk_estimate ? String(r.risk_estimate) : undefined,
    actionType: r.action_type as AgentProposal['actionType'],
    actionParams: (r.action_params as Record<string, unknown>) ?? {},
    rollbackSnapshot: r.rollback_snapshot as Record<string, unknown> | undefined,
    status: r.status as ProposalStatus,
    waMessageId: r.wa_message_id ? String(r.wa_message_id) : undefined,
    waSentAt: r.wa_sent_at ? new Date(r.wa_sent_at as string) : undefined,
    decidedBy: r.decided_by ? String(r.decided_by) : undefined,
    decidedAt: r.decided_at ? new Date(r.decided_at as string) : undefined,
    decisionNotes: r.decision_notes ? String(r.decision_notes) : undefined,
    executedBy: r.executed_by ? String(r.executed_by) : undefined,
    executedAt: r.executed_at ? new Date(r.executed_at as string) : undefined,
    executionLog: r.execution_log ? String(r.execution_log) : undefined,
    executionError: r.execution_error ? String(r.execution_error) : undefined,
    auditReportId: r.audit_report_id ? String(r.audit_report_id) : undefined,
    proposalDay: String(r.proposal_day),
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

function rowToReport(r: Record<string, unknown>): AuditReport {
  return {
    id: String(r.id),
    auditorId: String(r.auditor_id),
    reportType: r.report_type as AuditReport['reportType'],
    summary: String(r.summary),
    findings: (r.findings as AuditReport['findings']) ?? [],
    metrics: (r.metrics as Record<string, number | string>) ?? {},
    proposalsGenerated: Number(r.proposals_generated ?? 0),
    waMessageId: r.wa_message_id ? String(r.wa_message_id) : undefined,
    waSentAt: r.wa_sent_at ? new Date(r.wa_sent_at as string) : undefined,
    periodStart: r.period_start ? new Date(r.period_start as string) : undefined,
    periodEnd: r.period_end ? new Date(r.period_end as string) : undefined,
    durationMs: r.duration_ms ? Number(r.duration_ms) : undefined,
    createdAt: new Date(r.created_at as string),
  };
}

async function getDb() {
  const { dbClient } = await import('../infra');
  return dbClient;
}

// ── Proposals ──

export async function createProposal(input: CreateProposalInput): Promise<AgentProposal> {
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO agent_proposals
      (agent_id, agent_name, category, severity, title, description, rationale,
       impact_estimate, risk_estimate, action_type, action_params, audit_report_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'draft')
     RETURNING *`,
    [input.agentId, input.agentName, input.category, input.severity,
     input.title, input.description, input.rationale,
     input.impactEstimate ?? null, input.riskEstimate ?? null,
     input.actionType, JSON.stringify(input.actionParams),
     input.auditReportId ?? null],
  );
  return rowToProposal(rows[0] as Record<string, unknown>);
}

export async function getProposal(id: string): Promise<AgentProposal | null> {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM agent_proposals WHERE id = $1', [id]);
  return rows[0] ? rowToProposal(rows[0]) : null;
}

export async function getPendingProposals(): Promise<AgentProposal[]> {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT * FROM agent_proposals WHERE status = 'pending_review'
     ORDER BY CASE severity WHEN 'urgent' THEN 0 WHEN 'critical' THEN 1
       WHEN 'warning' THEN 2 ELSE 3 END, created_at ASC`,
  );
  return rows.map(rowToProposal);
}

export async function getProposalByWAMessageId(waMessageId: string): Promise<AgentProposal | null> {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT * FROM agent_proposals WHERE wa_message_id = $1', [waMessageId],
  );
  return rows[0] ? rowToProposal(rows[0]) : null;
}

export async function getProposalByIdPrefix(prefix: string): Promise<AgentProposal | null> {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT * FROM agent_proposals WHERE id::text LIKE $1 ORDER BY created_at DESC LIMIT 1',
    [prefix + '%'],
  );
  return rows[0] ? rowToProposal(rows[0]) : null;
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
  extra?: {
    waMessageId?: string;
    waSentAt?: Date;
    decidedBy?: string;
    decidedAt?: Date;
    decisionNotes?: string;
    rollbackSnapshot?: Record<string, unknown>;
    executedBy?: string;
    executedAt?: Date;
    executionLog?: string;
    executionError?: string;
  },
): Promise<AgentProposal> {
  const db = await getDb();
  const sets: string[] = ['status = $2', 'updated_at = NOW()'];
  const vals: unknown[] = [id, status];
  let idx = 3;

  if (extra?.waMessageId) { sets.push(`wa_message_id = $${idx}`); vals.push(extra.waMessageId); idx++; }
  if (extra?.waSentAt) { sets.push(`wa_sent_at = $${idx}`); vals.push(extra.waSentAt); idx++; }
  if (extra?.decidedBy) { sets.push(`decided_by = $${idx}`); vals.push(extra.decidedBy); idx++; }
  if (extra?.decidedAt) { sets.push(`decided_at = $${idx}`); vals.push(extra.decidedAt); idx++; }
  if (extra?.decisionNotes) { sets.push(`decision_notes = $${idx}`); vals.push(extra.decisionNotes); idx++; }
  if (extra?.rollbackSnapshot) { sets.push(`rollback_snapshot = $${idx}`); vals.push(JSON.stringify(extra.rollbackSnapshot)); idx++; }
  if (extra?.executedBy) { sets.push(`executed_by = $${idx}`); vals.push(extra.executedBy); idx++; }
  if (extra?.executedAt) { sets.push(`executed_at = $${idx}`); vals.push(extra.executedAt); idx++; }
  if (extra?.executionLog) { sets.push(`execution_log = $${idx}`); vals.push(extra.executionLog); idx++; }
  if (extra?.executionError) { sets.push(`execution_error = $${idx}`); vals.push(extra.executionError); idx++; }

  const { rows } = await db.query(
    `UPDATE agent_proposals SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals,
  );
  if (!rows[0]) throw new Error(`Proposal ${id} not found`);
  return rowToProposal(rows[0]);
}

export async function countProposalsToday(category?: string): Promise<number> {
  const db = await getDb();
  const q = category
    ? 'SELECT COUNT(*)::int AS c FROM agent_proposals WHERE proposal_day = CURRENT_DATE AND category = $1'
    : 'SELECT COUNT(*)::int AS c FROM agent_proposals WHERE proposal_day = CURRENT_DATE';
  const { rows } = await db.query(q, category ? [category] : []);
  return rows[0]?.c ?? 0;
}

export async function countUrgentLastHour(): Promise<number> {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS c FROM agent_proposals
     WHERE severity = 'urgent' AND created_at > NOW() - INTERVAL '1 hour'`,
  );
  return rows[0]?.c ?? 0;
}

export async function listProposals(filters: {
  status?: ProposalStatus; category?: string; severity?: string;
  limit?: number; offset?: number;
}): Promise<{ proposals: AgentProposal[]; total: number }> {
  const db = await getDb();
  const where: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (filters.status) { where.push(`status = $${idx++}`); vals.push(filters.status); }
  if (filters.category) { where.push(`category = $${idx++}`); vals.push(filters.category); }
  if (filters.severity) { where.push(`severity = $${idx++}`); vals.push(filters.severity); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const [dataRes, countRes] = await Promise.all([
    db.query(
      `SELECT * FROM agent_proposals ${whereClause}
       ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...vals, limit, offset],
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM agent_proposals ${whereClause}`, vals),
  ]);

  return {
    proposals: dataRes.rows.map(rowToProposal),
    total: countRes.rows[0]?.total ?? 0,
  };
}

export async function expireStaleProposals(hours: number): Promise<number> {
  const db = await getDb();
  const { rowCount } = await db.query(
    `UPDATE agent_proposals SET status = 'expired', updated_at = NOW()
     WHERE status = 'pending_review' AND created_at < NOW() - INTERVAL '1 hour' * $1`,
    [hours],
  );
  return rowCount ?? 0;
}

export async function getStats(): Promise<AutopilotStats> {
  const db = await getDb();
  const { rows } = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending_review')::int AS pending_count,
      COUNT(*) FILTER (WHERE status = 'approved' AND proposal_day = CURRENT_DATE)::int AS approved_today,
      COUNT(*) FILTER (WHERE status = 'denied' AND proposal_day = CURRENT_DATE)::int AS denied_today,
      COUNT(*) FILTER (WHERE status = 'completed' AND proposal_day = CURRENT_DATE)::int AS executed_today,
      COUNT(*) FILTER (WHERE status = 'failed' AND proposal_day = CURRENT_DATE)::int AS failed_today,
      COUNT(*) FILTER (WHERE status = 'rolled_back')::int AS rolled_back_total,
      COALESCE(AVG(EXTRACT(EPOCH FROM (decided_at - created_at))/60) FILTER (WHERE decided_at IS NOT NULL), 0)::numeric(10,1) AS avg_decision_minutes
    FROM agent_proposals
  `);
  const catRes = await db.query(`SELECT category, COUNT(*)::int AS c FROM agent_proposals WHERE proposal_day = CURRENT_DATE GROUP BY category`);
  const sevRes = await db.query(`SELECT severity, COUNT(*)::int AS c FROM agent_proposals WHERE proposal_day = CURRENT_DATE GROUP BY severity`);

  const s = rows[0] ?? {};
  return {
    pendingCount: s.pending_count ?? 0,
    approvedToday: s.approved_today ?? 0,
    deniedToday: s.denied_today ?? 0,
    executedToday: s.executed_today ?? 0,
    failedToday: s.failed_today ?? 0,
    rolledBackTotal: s.rolled_back_total ?? 0,
    proposalsByCategory: Object.fromEntries(catRes.rows.map((r: Record<string, unknown>) => [r.category, r.c])),
    proposalsBySeverity: Object.fromEntries(sevRes.rows.map((r: Record<string, unknown>) => [r.severity, r.c])),
    avgDecisionTimeMinutes: Number(s.avg_decision_minutes ?? 0),
  };
}

// ── Audit Reports ──

export async function createAuditReport(input: Omit<AuditReport, 'id' | 'createdAt'>): Promise<AuditReport> {
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO agent_audit_reports
      (auditor_id, report_type, summary, findings, metrics, proposals_generated,
       wa_message_id, wa_sent_at, duration_ms, period_start, period_end)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [input.auditorId, input.reportType, input.summary,
     JSON.stringify(input.findings), JSON.stringify(input.metrics),
     input.proposalsGenerated,
     input.waMessageId ?? null, input.waSentAt ?? null,
     input.durationMs ?? null, input.periodStart ?? null, input.periodEnd ?? null],
  );
  return rowToReport(rows[0] as Record<string, unknown>);
}

export async function listAuditReports(limit = 10): Promise<AuditReport[]> {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT * FROM agent_audit_reports ORDER BY created_at DESC LIMIT $1', [limit],
  );
  return rows.map(rowToReport);
}

export async function updateReportWASent(id: string, waMessageId: string): Promise<void> {
  const db = await getDb();
  await db.query(
    'UPDATE agent_audit_reports SET wa_message_id = $2, wa_sent_at = NOW() WHERE id = $1',
    [id, waMessageId],
  ).catch(err => logger.error('Failed to update report WA status', { id, error: String(err) }));
}
