import { logger } from '../../utils/logger';
import type { AuditFinding, AuditReport, CreateProposalInput } from '../autopilot.types';
import * as repo from '../autopilot.repository';
import { submitProposal } from '../autopilot.service';

// ── Thresholds ──
const MAX_ADMINS_WARNING = 3;
const FAILED_LOGINS_CRITICAL = 50;
const STALE_APPROVAL_HOURS = 72;

export async function runSecurityAudit(): Promise<AuditReport> {
  const startTime = Date.now();
  const findings: AuditFinding[] = [];
  const metrics: Record<string, number | string> = {};
  const db = (await import('../../infra')).dbClient;

  // ── 1. Admin count ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin'`,
    );
    const adminCount = rows[0]?.c ?? 0;
    metrics['admin_count'] = adminCount;

    if (adminCount > MAX_ADMINS_WARNING) {
      findings.push({
        severity: 'warning',
        category: 'security',
        title: 'Trop de comptes administrateurs',
        description: `Il y a ${adminCount} comptes avec le role admin (seuil: ${MAX_ADMINS_WARNING}). Appliquer le principe de moindre privilege et verifier que chaque admin est legitime.`,
        metric: 'admin_count',
        threshold: MAX_ADMINS_WARNING,
        currentValue: adminCount,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Security audit: admin count query failed', { error: String(err) });
    metrics['admin_count'] = -1;
  }

  // ── 2. Failed logins last 24h ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM audit_log
       WHERE action = 'login_failed' AND created_at > NOW() - INTERVAL '24 hours'`,
    );
    const failedLogins = rows[0]?.c ?? 0;
    metrics['failed_logins_24h'] = failedLogins;

    if (failedLogins > FAILED_LOGINS_CRITICAL) {
      findings.push({
        severity: 'critical',
        category: 'security',
        title: 'Nombre eleve de tentatives de connexion echouees',
        description: `${failedLogins} tentatives de connexion echouees dans les dernieres 24h (seuil: ${FAILED_LOGINS_CRITICAL}). Cela peut indiquer une attaque par force brute. Verifier les IPs sources et envisager un blocage.`,
        metric: 'failed_logins_24h',
        threshold: FAILED_LOGINS_CRITICAL,
        currentValue: failedLogins,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Security audit: failed logins query failed', { error: String(err) });
    metrics['failed_logins_24h'] = -1;
  }

  // ── 3. Admins without 2FA ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM users
       WHERE role IN ('admin', 'operator')
       AND (totp_enabled IS NULL OR totp_enabled = false)`,
    );
    const adminsNo2fa = rows[0]?.c ?? 0;
    metrics['admins_without_2fa'] = adminsNo2fa;

    if (adminsNo2fa > 0) {
      findings.push({
        severity: 'warning',
        category: 'security',
        title: 'Administrateurs sans 2FA',
        description: `${adminsNo2fa} compte(s) admin/operateur n'ont pas active l'authentification a deux facteurs (TOTP). Tous les comptes privilegies devraient avoir 2FA actif.`,
        metric: 'admins_without_2fa',
        threshold: 0,
        currentValue: adminsNo2fa,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Security audit: 2FA check query failed', { error: String(err) });
    metrics['admins_without_2fa'] = -1;
  }

  // ── 4. LLM usage outliers (agents consuming >3x average) ──
  try {
    const { rows } = await db.query(
      `SELECT agent_name, SUM(total_tokens)::bigint AS total
       FROM llm_usage_log
       WHERE created_at > NOW() - INTERVAL '24 hours'
       GROUP BY agent_name
       HAVING SUM(total_tokens) > (
         SELECT COALESCE(AVG(total_tokens), 0) * 3
         FROM llm_usage_log
         WHERE created_at > NOW() - INTERVAL '7 days'
       )`,
    );
    const outlierCount = rows.length;
    metrics['llm_usage_outlier_agents'] = outlierCount;

    if (outlierCount > 0) {
      const agentList = rows
        .map((r: Record<string, unknown>) => `${r.agent_name} (${r.total} tokens)`)
        .join(', ');
      metrics['llm_outlier_details'] = agentList;

      findings.push({
        severity: 'warning',
        category: 'security',
        title: 'Agents avec consommation LLM anormale',
        description: `${outlierCount} agent(s) consomment plus de 3x la moyenne de tokens sur 24h: ${agentList}. Verifier s'il s'agit d'un usage normal ou d'un abus/boucle infinie.`,
        metric: 'llm_usage_outlier_agents',
        threshold: 0,
        currentValue: outlierCount,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Security audit: LLM outlier query failed', { error: String(err) });
    metrics['llm_usage_outlier_agents'] = -1;
  }

  // ── 5. Stale approvals (72h+) ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM approval_queue
       WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '${STALE_APPROVAL_HOURS} hours'`,
    );
    const staleApprovals = rows[0]?.c ?? 0;
    metrics['stale_approvals_72h'] = staleApprovals;

    if (staleApprovals > 0) {
      findings.push({
        severity: 'warning',
        category: 'security',
        title: 'Approbations bloquees depuis 72h+',
        description: `${staleApprovals} approbation(s) en attente depuis plus de ${STALE_APPROVAL_HOURS}h. Les actions non validees s'accumulent et pourraient representer un risque de securite si elles concernent des operations sensibles.`,
        metric: 'stale_approvals_72h',
        threshold: 0,
        currentValue: staleApprovals,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Security audit: stale approvals query failed', { error: String(err) });
    metrics['stale_approvals_72h'] = -1;
  }

  // ── Generate proposals for findings that suggest one ──
  let proposalsGenerated = 0;
  for (const f of findings) {
    if (f.proposalSuggested) {
      try {
        const proposalInput: CreateProposalInput = buildSecurityProposal(f);
        const result = await submitProposal(proposalInput);
        if (result) proposalsGenerated++;
      } catch (err) {
        logger.warn('Security audit: failed to submit proposal', {
          title: f.title,
          error: String(err),
        });
      }
    }
  }

  // ── Build report summary ──
  const criticalCount = findings.filter(f => f.severity === 'critical' || f.severity === 'urgent').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const status = criticalCount > 0 ? 'ALERT' : warningCount > 0 ? 'REVIEW_NEEDED' : 'SECURE';
  const summary = `Security audit: ${status} — ${findings.length} finding(s), ${criticalCount} critical, ${warningCount} warning, ${proposalsGenerated} proposal(s) generated`;

  logger.info(summary, { metrics });

  return repo.createAuditReport({
    auditorId: 'security-auditor',
    reportType: 'security',
    summary,
    findings,
    metrics,
    proposalsGenerated,
    durationMs: Date.now() - startTime,
    periodStart: new Date(Date.now() - 86400000),
    periodEnd: new Date(),
  });
}

// ── Map finding → proposal ──
function buildSecurityProposal(finding: AuditFinding): CreateProposalInput {
  const base = {
    agentId: 'fz-juridique',
    agentName: 'Security Auditor',
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    rationale: `Detecte par l'audit de securite automatique. Metrique: ${finding.metric ?? 'N/A'}, valeur: ${finding.currentValue ?? 'N/A'}, seuil: ${finding.threshold ?? 'N/A'}.`,
  } as const;

  switch (finding.metric) {
    case 'admin_count':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: 'Alerte: trop de comptes admin',
          body: finding.description,
        },
        impactEstimate: 'Audit des privileges administrateurs recommande',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'failed_logins_24h':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: 'Alerte critique: tentatives de connexion suspectes',
          body: finding.description,
        },
        impactEstimate: 'Detection potentielle d\'attaque par force brute',
        riskEstimate: 'Faible — notification uniquement, blocage IP a evaluer',
      };

    case 'admins_without_2fa':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: 'Securite: comptes privilegies sans 2FA',
          body: finding.description,
        },
        impactEstimate: 'Renforcement de la securite des comptes admin',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'llm_usage_outlier_agents':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: 'Alerte: consommation LLM anormale',
          body: finding.description,
        },
        impactEstimate: 'Detection de potentiel abus ou boucle d\'agent',
        riskEstimate: 'Moyen — peut necessiter desactivation d\'agent',
      };

    case 'stale_approvals_72h':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: 'Securite: approbations bloquees 72h+',
          body: finding.description,
        },
        impactEstimate: 'Deblocage du pipeline d\'approbation',
        riskEstimate: 'Faible — notification uniquement',
      };

    default:
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'security_alert',
          subject: finding.title,
          body: finding.description,
        },
      };
  }
}
