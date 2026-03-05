import { logger } from '../../utils/logger';
import type { AuditFinding, AuditReport, CreateProposalInput } from '../autopilot.types';
import * as repo from '../autopilot.repository';
import { submitProposal } from '../autopilot.service';

// ── Thresholds ──
const MIN_MARGIN_PCT = 10;
const LOW_BALANCE_WARNING_PCT = 30; // warn if >30% of users have low balance
const LOW_BALANCE_CREDITS = 1_000_000; // 1 credit = 1M micro-credits

export async function runBusinessAudit(): Promise<AuditReport> {
  const startTime = Date.now();
  const findings: AuditFinding[] = [];
  const metrics: Record<string, number | string> = {};
  const db = (await import('../../infra')).dbClient;

  // ── 1. New users: this 7d vs previous 7d ──
  try {
    const [currentRes, previousRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*)::int AS c FROM users WHERE created_at > NOW() - INTERVAL '7 days'`,
      ),
      db.query(
        `SELECT COUNT(*)::int AS c FROM users
         WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'`,
      ),
    ]);
    const newUsersCurrent = currentRes.rows[0]?.c ?? 0;
    const newUsersPrevious = previousRes.rows[0]?.c ?? 0;
    metrics['new_users_7d'] = newUsersCurrent;
    metrics['new_users_prev_7d'] = newUsersPrevious;

    const growthPct = newUsersPrevious > 0
      ? Math.round(((newUsersCurrent - newUsersPrevious) / newUsersPrevious) * 100)
      : (newUsersCurrent > 0 ? 100 : 0);
    metrics['user_growth_pct'] = growthPct;

    if (growthPct < 0) {
      findings.push({
        severity: 'warning',
        category: 'business',
        title: 'Croissance utilisateurs en baisse',
        description: `${newUsersCurrent} nouveaux utilisateurs cette semaine vs ${newUsersPrevious} la semaine precedente (${growthPct}%). La tendance est negative.`,
        metric: 'user_growth_pct',
        threshold: 0,
        currentValue: growthPct,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Business audit: user growth query failed', { error: String(err) });
  }

  // ── 2. DAU ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(DISTINCT id)::int AS c FROM users WHERE last_login_at > NOW() - INTERVAL '1 day'`,
    );
    metrics['dau'] = rows[0]?.c ?? 0;
  } catch (err) {
    logger.warn('Business audit: DAU query failed', { error: String(err) });
    metrics['dau'] = -1;
  }

  // ── 3. MAU ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(DISTINCT id)::int AS c FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'`,
    );
    metrics['mau'] = rows[0]?.c ?? 0;
  } catch (err) {
    logger.warn('Business audit: MAU query failed', { error: String(err) });
    metrics['mau'] = -1;
  }

  // ── 4. Revenue 7d (deposits) ──
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(amount),0)::numeric AS total FROM wallet_transactions
       WHERE type = 'deposit' AND created_at > NOW() - INTERVAL '7 days'`,
    );
    const revenue7d = Number(rows[0]?.total ?? 0);
    metrics['revenue_7d'] = revenue7d;
  } catch (err) {
    logger.warn('Business audit: revenue query failed', { error: String(err) });
    metrics['revenue_7d'] = -1;
  }

  // ── 5. LLM cost 7d ──
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(billed_credits),0)::numeric AS total FROM llm_usage_log
       WHERE created_at > NOW() - INTERVAL '7 days'`,
    );
    const llmCost7d = Number(rows[0]?.total ?? 0);
    metrics['llm_cost_7d'] = llmCost7d;

    // Calculate margin if we have revenue
    const revenue = Number(metrics['revenue_7d'] ?? 0);
    if (revenue > 0 && llmCost7d > 0) {
      const marginPct = Math.round(((revenue - llmCost7d) / revenue) * 100);
      metrics['margin_pct'] = marginPct;

      if (marginPct < MIN_MARGIN_PCT) {
        findings.push({
          severity: 'critical',
          category: 'cost_optimization',
          title: 'Marge inferieure au seuil minimum',
          description: `La marge actuelle est de ${marginPct}% (revenus: ${revenue}, cout LLM: ${llmCost7d}). Le seuil minimum est ${MIN_MARGIN_PCT}%. Envisager un ajustement tarifaire ou une optimisation des couts.`,
          metric: 'margin_pct',
          threshold: MIN_MARGIN_PCT,
          currentValue: marginPct,
          proposalSuggested: true,
        });
      }
    }
  } catch (err) {
    logger.warn('Business audit: LLM cost query failed', { error: String(err) });
    metrics['llm_cost_7d'] = -1;
  }

  // ── 6. Tier distribution ──
  try {
    const { rows } = await db.query(
      `SELECT tier, COUNT(*)::int AS c FROM users WHERE is_active = true GROUP BY tier`,
    );
    let totalActive = 0;
    for (const row of rows) {
      const tier = String(row.tier ?? 'unknown');
      const count = Number(row.c ?? 0);
      metrics[`tier_${tier}`] = count;
      totalActive += count;
    }
    metrics['total_active_users'] = totalActive;
  } catch (err) {
    logger.warn('Business audit: tier distribution query failed', { error: String(err) });
  }

  // ── 7. Low balance users ──
  try {
    const [lowRes, totalRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*)::int AS c FROM wallets WHERE balance_credits < $1`,
        [LOW_BALANCE_CREDITS],
      ),
      db.query(`SELECT COUNT(*)::int AS c FROM wallets`),
    ]);
    const lowBalanceCount = lowRes.rows[0]?.c ?? 0;
    const totalWallets = totalRes.rows[0]?.c ?? 0;
    metrics['low_balance_users'] = lowBalanceCount;
    metrics['total_wallets'] = totalWallets;

    const lowBalancePct = totalWallets > 0
      ? Math.round((lowBalanceCount / totalWallets) * 100)
      : 0;
    metrics['low_balance_pct'] = lowBalancePct;

    if (lowBalancePct > LOW_BALANCE_WARNING_PCT) {
      findings.push({
        severity: 'warning',
        category: 'business',
        title: 'Trop d\'utilisateurs avec solde faible',
        description: `${lowBalanceCount} utilisateurs (${lowBalancePct}%) ont un solde inferieur a ${LOW_BALANCE_CREDITS / 1_000_000} credit(s). Seuil d'alerte: ${LOW_BALANCE_WARNING_PCT}%. Envisager une campagne de recharge ou un ajustement du bonus d'inscription.`,
        metric: 'low_balance_pct',
        threshold: LOW_BALANCE_WARNING_PCT,
        currentValue: lowBalancePct,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Business audit: low balance query failed', { error: String(err) });
  }

  // ── Generate proposals for findings that suggest one ──
  let proposalsGenerated = 0;
  for (const f of findings) {
    if (f.proposalSuggested) {
      try {
        const proposalInput: CreateProposalInput = buildBusinessProposal(f);
        const result = await submitProposal(proposalInput);
        if (result) proposalsGenerated++;
      } catch (err) {
        logger.warn('Business audit: failed to submit proposal', {
          title: f.title,
          error: String(err),
        });
      }
    }
  }

  // ── Build report summary ──
  const criticalCount = findings.filter(f => f.severity === 'critical' || f.severity === 'urgent').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const dau = metrics['dau'] ?? 'N/A';
  const mau = metrics['mau'] ?? 'N/A';
  const growth = metrics['user_growth_pct'] ?? 'N/A';
  const summary = `Business audit: ${findings.length} finding(s), ${criticalCount} critical, ${warningCount} warning, ${proposalsGenerated} proposal(s). DAU=${dau}, MAU=${mau}, growth=${growth}%`;

  logger.info(summary, { metrics });

  return repo.createAuditReport({
    auditorId: 'business-auditor',
    reportType: 'business',
    summary,
    findings,
    metrics,
    proposalsGenerated,
    durationMs: Date.now() - startTime,
    periodStart: new Date(Date.now() - 7 * 86400000),
    periodEnd: new Date(),
  });
}

// ── Map finding → proposal ──
function buildBusinessProposal(finding: AuditFinding): CreateProposalInput {
  const base = {
    agentId: 'fz-finance',
    agentName: 'Business Auditor',
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    rationale: `Detecte par l'audit business automatique. Metrique: ${finding.metric ?? 'N/A'}, valeur: ${finding.currentValue ?? 'N/A'}, seuil: ${finding.threshold ?? 'N/A'}.`,
  } as const;

  switch (finding.metric) {
    case 'user_growth_pct':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'business_alert',
          subject: 'Alerte: croissance utilisateurs negative',
          body: finding.description,
        },
        impactEstimate: 'Visibilite sur la tendance de croissance',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'margin_pct':
      return {
        ...base,
        actionType: 'modify_billing_param',
        actionParams: {
          paramName: 'margin_alert',
          fromValue: 'none',
          toValue: `margin_${finding.currentValue}pct`,
        },
        impactEstimate: 'Enregistrement de l\'alerte marge pour suivi',
        riskEstimate: 'Faible — modification de parametre de suivi uniquement',
      };

    case 'low_balance_pct':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'business_alert',
          subject: 'Alerte: trop d\'utilisateurs avec solde faible',
          body: finding.description,
        },
        impactEstimate: 'Sensibilisation pour action de retention',
        riskEstimate: 'Faible — notification uniquement',
      };

    default:
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'business_alert',
          subject: finding.title,
          body: finding.description,
        },
      };
  }
}
