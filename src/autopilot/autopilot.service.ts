import { logger } from '../utils/logger';
import { auditLog } from '../utils/audit-logger';
import type { CreateProposalInput, AgentProposal, ActionType } from './autopilot.types';
import * as repo from './autopilot.repository';

// ── Config ──
const MAX_PROPOSALS_PER_DAY = Number(process.env['AUTOPILOT_MAX_PROPOSALS_PER_DAY'] ?? 20);
const MAX_URGENT_PER_HOUR = Number(process.env['AUTOPILOT_MAX_URGENT_PER_HOUR'] ?? 5);

function isEnabled(): boolean {
  return (process.env['AUTOPILOT_ENABLED'] ?? 'true') !== 'false';
}

function getAdminPhone(): string | undefined {
  return process.env['ADMIN_WHATSAPP_PHONE'];
}

const SEVERITY_EMOJI: Record<string, string> = {
  urgent: '🔴', critical: '🟠', warning: '🟡', info: '🔵',
};

// ── Submit Proposal ──

export async function submitProposal(input: CreateProposalInput): Promise<AgentProposal | null> {
  if (!isEnabled()) {
    logger.info('Autopilot disabled, skipping proposal', { title: input.title });
    return null;
  }

  // Rate limit
  const todayCount = await repo.countProposalsToday();
  if (todayCount >= MAX_PROPOSALS_PER_DAY) {
    logger.warn('Autopilot rate limit: max proposals per day reached', { todayCount });
    return null;
  }
  if (input.severity === 'urgent') {
    const urgentCount = await repo.countUrgentLastHour();
    if (urgentCount >= MAX_URGENT_PER_HOUR) {
      logger.warn('Autopilot rate limit: max urgent per hour reached', { urgentCount });
      return null;
    }
  }

  // Create
  const proposal = await repo.createProposal(input);

  // Move to pending_review
  const updated = await repo.updateProposalStatus(proposal.id, 'pending_review');

  // Send WhatsApp notification
  sendProposalToAdmin(updated).catch(err =>
    logger.error('Failed to send proposal WA', { id: updated.id, error: String(err) }),
  );

  // Publish event
  publishEvent('AutopilotProposalCreated', { proposalId: updated.id, severity: updated.severity, title: updated.title });

  return updated;
}

// ── WhatsApp Outbound ──

async function sendProposalToAdmin(proposal: AgentProposal): Promise<void> {
  const adminPhone = getAdminPhone();
  if (!adminPhone) {
    logger.info('ADMIN_WHATSAPP_PHONE not set, skipping WA notification');
    return;
  }

  const { whatsAppService } = await import('../whatsapp/whatsapp.service');
  if (!whatsAppService.isConfigured()) return;

  const emoji = SEVERITY_EMOJI[proposal.severity] || '🔵';
  const body = [
    `${emoji} *[${proposal.severity.toUpperCase()}] ${proposal.category}*`,
    '',
    `*${proposal.title}*`,
    '',
    proposal.description.slice(0, 600),
    '',
    `💡 _${proposal.rationale.slice(0, 200)}_`,
    '',
    `🤖 Agent: ${proposal.agentName}`,
    `📋 Action: ${proposal.actionType}`,
  ].join('\n');

  const shortId = proposal.id.slice(0, 8);
  const waMessageId = await whatsAppService.sendInteractiveMessage({
    to: adminPhone,
    body,
    buttons: [
      { id: `ap_approve_${shortId}`, title: 'Approuver' },
      { id: `ap_deny_${shortId}`, title: 'Refuser' },
      { id: `ap_info_${shortId}`, title: 'Details' },
    ],
    footer: `ID: ${shortId}`,
  });

  if (waMessageId) {
    await repo.updateProposalStatus(proposal.id, 'pending_review', {
      waMessageId, waSentAt: new Date(),
    });
  }
}

export async function sendAuditReportToAdmin(report: { id: string; summary: string; reportType: string; findings: { severity: string }[] }): Promise<void> {
  const adminPhone = getAdminPhone();
  if (!adminPhone) return;

  const { whatsAppService } = await import('../whatsapp/whatsapp.service');
  if (!whatsAppService.isConfigured()) return;

  const urgentCount = report.findings.filter(f => f.severity === 'urgent' || f.severity === 'critical').length;
  const warningCount = report.findings.filter(f => f.severity === 'warning').length;

  const body = [
    `📊 *Rapport Audit ${report.reportType.toUpperCase()}*`,
    '',
    report.summary.slice(0, 800),
    '',
    `Résultats: ${urgentCount > 0 ? `🔴 ${urgentCount} urgent(s)` : ''} ${warningCount > 0 ? `🟡 ${warningCount} warning(s)` : ''} ${urgentCount === 0 && warningCount === 0 ? '✅ Tout va bien' : ''}`.trim(),
  ].join('\n');

  const waMessageId = await whatsAppService.sendInteractiveMessage({
    to: adminPhone,
    body,
    buttons: [
      { id: 'ap_list_pending', title: 'Voir proposals' },
      { id: 'ap_audit_ok', title: 'OK compris' },
    ],
    footer: `Rapport du ${new Date().toLocaleDateString('fr-FR')}`,
  });

  if (waMessageId) {
    await repo.updateReportWASent(report.id, waMessageId);
  }
}

// ── Decision Processing ──

export async function processDecision(params: {
  proposalId: string;
  decision: 'approved' | 'denied';
  decidedBy: string;
  notes?: string;
}): Promise<AgentProposal> {
  const proposal = await repo.getProposal(params.proposalId);
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'pending_review') {
    throw new Error(`Proposal is ${proposal.status}, not pending_review`);
  }

  const updated = await repo.updateProposalStatus(params.proposalId, params.decision, {
    decidedBy: params.decidedBy,
    decidedAt: new Date(),
    decisionNotes: params.notes,
  });

  auditLog({
    actor: params.decidedBy,
    action: 'autopilot_decision',
    resourceType: 'proposal',
    resourceId: params.proposalId,
    details: { decision: params.decision, title: proposal.title },
  });

  publishEvent('AutopilotProposalDecided', {
    proposalId: params.proposalId,
    decision: params.decision,
    title: proposal.title,
  });

  // Execute if approved (non-blocking)
  if (params.decision === 'approved') {
    executeProposal(updated).catch(err =>
      logger.error('Autopilot execution failed', { id: params.proposalId, error: String(err) }),
    );
  }

  // Send WA confirmation
  sendDecisionConfirmation(updated, params.decision).catch(() => {});

  return updated;
}

async function sendDecisionConfirmation(proposal: AgentProposal, decision: string): Promise<void> {
  const adminPhone = getAdminPhone();
  if (!adminPhone) return;
  const { whatsAppService } = await import('../whatsapp/whatsapp.service');
  if (!whatsAppService.isConfigured()) return;

  const emoji = decision === 'approved' ? '✅' : '❌';
  await whatsAppService.sendTextMessage({
    to: adminPhone,
    text: `${emoji} *${proposal.title}* — ${decision === 'approved' ? 'Approuvé, exécution en cours...' : 'Refusé.'}`,
  });
}

// ── Execution Engine ──

export async function executeProposal(proposal: AgentProposal): Promise<void> {
  const id = proposal.id;
  try {
    await repo.updateProposalStatus(id, 'executing');

    // Capture rollback snapshot
    const snapshot = await captureRollbackSnapshot(proposal);
    await repo.updateProposalStatus(id, 'executing', { rollbackSnapshot: snapshot });

    // Dispatch the action
    const log = await dispatchAction(proposal.actionType, proposal.actionParams);

    // Success
    await repo.updateProposalStatus(id, 'completed', {
      executedBy: 'autopilot-executor',
      executedAt: new Date(),
      executionLog: log,
    });

    auditLog({
      actor: 'autopilot-executor',
      action: 'autopilot_executed',
      resourceType: 'proposal',
      resourceId: id,
      details: { actionType: proposal.actionType, log },
    });

    publishEvent('AutopilotProposalExecuted', { proposalId: id, title: proposal.title });

    // WA success confirmation
    const adminPhone = getAdminPhone();
    if (adminPhone) {
      const { whatsAppService } = await import('../whatsapp/whatsapp.service');
      if (whatsAppService.isConfigured()) {
        await whatsAppService.sendTextMessage({
          to: adminPhone,
          text: `✅ *Exécuté:* ${proposal.title}\n${log}`,
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await repo.updateProposalStatus(id, 'failed', {
      executedBy: 'autopilot-executor',
      executedAt: new Date(),
      executionError: errorMsg,
    });

    publishEvent('AutopilotProposalFailed', { proposalId: id, error: errorMsg });

    // WA failure alert
    const adminPhone = getAdminPhone();
    if (adminPhone) {
      const { whatsAppService } = await import('../whatsapp/whatsapp.service');
      if (whatsAppService.isConfigured()) {
        await whatsAppService.sendTextMessage({
          to: adminPhone,
          text: `❌ *Échec exécution:* ${proposal.title}\nErreur: ${errorMsg}`,
        });
      }
    }
  }
}

// ── Rollback ──

export async function rollbackProposal(proposalId: string, requestedBy: string): Promise<void> {
  const proposal = await repo.getProposal(proposalId);
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'completed') throw new Error(`Cannot rollback: status is ${proposal.status}`);
  if (!proposal.rollbackSnapshot) throw new Error('No rollback snapshot available');

  const NON_REVERSIBLE: ActionType[] = ['send_notification', 'trigger_cron'];
  if (NON_REVERSIBLE.includes(proposal.actionType)) {
    throw new Error(`Action type ${proposal.actionType} is not reversible`);
  }

  try {
    // Execute rollback using the snapshot
    const log = await dispatchAction(proposal.actionType, proposal.rollbackSnapshot);

    await repo.updateProposalStatus(proposalId, 'rolled_back', {
      executionLog: `ROLLBACK: ${log}`,
    });

    auditLog({
      actor: requestedBy,
      action: 'autopilot_rollback',
      resourceType: 'proposal',
      resourceId: proposalId,
    });

    publishEvent('AutopilotProposalRolledBack', { proposalId, title: proposal.title });

    const adminPhone = getAdminPhone();
    if (adminPhone) {
      const { whatsAppService } = await import('../whatsapp/whatsapp.service');
      if (whatsAppService.isConfigured()) {
        await whatsAppService.sendTextMessage({
          to: adminPhone,
          text: `↩️ *Rollback effectué:* ${proposal.title}`,
        });
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Rollback failed', { proposalId, error: errorMsg });
    throw new Error(`Rollback failed: ${errorMsg}`);
  }
}

// ── Rollback Snapshot Capture ──

async function captureRollbackSnapshot(proposal: AgentProposal): Promise<Record<string, unknown>> {
  const db = (await import('../infra')).dbClient;
  const p = proposal.actionParams;

  switch (proposal.actionType) {
    case 'toggle_feature_flag': {
      const { rows } = await db.query(
        'SELECT enabled FROM user_feature_flags WHERE user_id = $1 AND feature_name = $2',
        [p.userId, p.flagName],
      );
      return { userId: p.userId, flagName: p.flagName, enabled: rows[0]?.enabled ?? false };
    }
    case 'update_agent_config': {
      const { rows } = await db.query(
        'SELECT * FROM agent_runtime_config WHERE agent_id = $1', [p.agentId],
      );
      return rows[0] ? { agentId: p.agentId, field: p.field, value: rows[0][p.field as string] } : { agentId: p.agentId, field: p.field, value: null };
    }
    case 'toggle_custom_agent': {
      const { rows } = await db.query('SELECT is_active FROM custom_agents WHERE id = $1', [p.agentId]);
      return { agentId: p.agentId, active: rows[0]?.is_active ?? true };
    }
    case 'approve_campaign': {
      const { rows } = await db.query('SELECT status FROM campaigns WHERE id = $1', [p.campaignId]);
      return { campaignId: p.campaignId, status: rows[0]?.status ?? 'pending_approval' };
    }
    case 'update_user_tier': {
      const { rows } = await db.query('SELECT tier FROM users WHERE id = $1', [p.userId]);
      return { userId: p.userId, fromTier: rows[0]?.tier, toTier: p.fromTier };
    }
    case 'soft_delete_document':
      return { documentId: p.documentId, isActive: true };
    case 'toggle_cron': {
      const { redisClient } = await import('../infra/redis/redis-client');
      const disabled = await redisClient.get(`autopilot:cron_disabled:${p.jobName}`);
      return { jobName: p.jobName, enabled: !disabled };
    }
    default:
      return { note: 'No rollback data for this action type' };
  }
}

// ── Action Dispatcher ──

async function dispatchAction(actionType: ActionType, params: Record<string, unknown>): Promise<string> {
  const db = (await import('../infra')).dbClient;

  switch (actionType) {
    case 'toggle_feature_flag': {
      await db.query(
        `INSERT INTO user_feature_flags (user_id, feature_name, enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, feature_name) DO UPDATE SET enabled = $3`,
        [params.userId, params.flagName, params.enabled],
      );
      return `Feature flag ${params.flagName} set to ${params.enabled} for user ${params.userId}`;
    }

    case 'update_agent_config': {
      const field = String(params.field);
      const allowed = ['temperature', 'max_tokens', 'system_prompt', 'model'];
      if (!allowed.includes(field)) throw new Error(`Field ${field} not allowed in agent config`);
      await db.query(
        `INSERT INTO agent_runtime_config (agent_id, ${field}, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (agent_id) DO UPDATE SET ${field} = $2, updated_at = NOW()`,
        [params.agentId, params.value],
      );
      return `Agent ${params.agentId} config ${field} updated to ${params.value}`;
    }

    case 'toggle_cron': {
      const { redisClient } = await import('../infra/redis/redis-client');
      if (params.enabled) {
        await redisClient.del(`autopilot:cron_disabled:${params.jobName}`);
        return `Cron ${params.jobName} enabled`;
      } else {
        await redisClient.set(`autopilot:cron_disabled:${params.jobName}`, '1', 86400 * 365);
        return `Cron ${params.jobName} disabled`;
      }
    }

    case 'approve_campaign': {
      await db.query(
        "UPDATE campaigns SET status = 'approved', updated_at = NOW() WHERE id = $1",
        [params.campaignId],
      );
      return `Campaign ${params.campaignId} approved`;
    }

    case 'toggle_custom_agent': {
      await db.query(
        'UPDATE custom_agents SET is_active = $2, updated_at = NOW() WHERE id = $1',
        [params.agentId, params.active],
      );
      return `Custom agent ${params.agentId} set active=${params.active}`;
    }

    case 'soft_delete_document': {
      await db.query(
        'UPDATE user_documents SET is_active = false, updated_at = NOW() WHERE id = $1',
        [params.documentId],
      );
      return `Document ${params.documentId} soft-deleted`;
    }

    case 'send_notification': {
      const { notificationService } = await import('../notifications/notification.service');
      await notificationService.send({
        userId: String(params.userId),
        channel: ((params.channel as string) ?? 'in_app') as 'in_app' | 'email' | 'sms' | 'whatsapp' | 'webhook',
        type: String(params.type ?? 'autopilot'),
        subject: String(params.subject ?? ''),
        body: String(params.body ?? ''),
      });
      return `Notification sent to user ${params.userId} via ${params.channel}`;
    }

    case 'update_user_tier': {
      await db.query(
        'UPDATE users SET tier = $2, updated_at = NOW() WHERE id = $1',
        [params.userId, params.toTier],
      );
      return `User ${params.userId} tier changed from ${params.fromTier} to ${params.toTier}`;
    }

    case 'create_promo_code': {
      await db.query(
        `INSERT INTO promo_codes (code, discount_pct, max_uses, expires_at, created_by)
         VALUES ($1, $2, $3, $4, 'autopilot')`,
        [params.code, params.discountPct, params.maxUses ?? 100, params.expiresAt ?? null],
      );
      return `Promo code ${params.code} created (${params.discountPct}% off)`;
    }

    case 'trigger_cron': {
      const { cronService } = await import('../core/cron/cron.service');
      await cronService.triggerJob(String(params.jobName));
      return `Cron job ${params.jobName} triggered`;
    }

    case 'modify_billing_param': {
      await db.query(
        `INSERT INTO agent_runtime_config (agent_id, system_prompt, updated_at)
         VALUES ('system-billing-' || $1, $2, NOW())
         ON CONFLICT (agent_id) DO UPDATE SET system_prompt = $2, updated_at = NOW()`,
        [params.paramName, String(params.toValue)],
      );
      return `Billing param ${params.paramName} set to ${params.toValue}`;
    }

    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

// ── Event Bus Helper ──

async function publishEvent(type: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const { eventBus } = await import('../core/event-bus/event-bus');
    eventBus.publish(type as never, 'autopilot', payload);
  } catch (err) {
    logger.warn('Failed to publish autopilot event', { type, error: String(err) });
  }
}

// ── Send pending list via WA ──

export async function sendPendingList(): Promise<string> {
  const pending = await repo.getPendingProposals();
  if (pending.length === 0) return 'Aucune proposition en attente.';

  const lines = pending.map((p, i) => {
    const emoji = SEVERITY_EMOJI[p.severity] || '🔵';
    const age = Math.round((Date.now() - p.createdAt.getTime()) / 60000);
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    return `${i + 1}. ${emoji} [${p.severity}] ${p.title}\n   ID: ${p.id.slice(0, 8)} • ${ageStr}`;
  });

  return `📋 *${pending.length} proposition(s) en attente*\n\n${lines.join('\n\n')}\n\nTapez /ap approve {id} ou /ap deny {id} {raison}`;
}

// ── Proposal details for WA ──

export async function getProposalDetails(proposalId: string): Promise<string> {
  const p = await repo.getProposal(proposalId);
  if (!p) return 'Proposition introuvable.';

  return [
    `📋 *Détails Proposition*`,
    `ID: ${p.id.slice(0, 8)}`,
    `Status: ${p.status}`,
    `Severity: ${SEVERITY_EMOJI[p.severity]} ${p.severity}`,
    `Catégorie: ${p.category}`,
    '',
    `*${p.title}*`,
    p.description,
    '',
    `💡 Rationale: ${p.rationale}`,
    p.impactEstimate ? `📈 Impact: ${p.impactEstimate}` : '',
    p.riskEstimate ? `⚠️ Risque: ${p.riskEstimate}` : '',
    '',
    `🔧 Action: ${p.actionType}`,
    `Params: ${JSON.stringify(p.actionParams, null, 2)}`,
  ].filter(Boolean).join('\n');
}
