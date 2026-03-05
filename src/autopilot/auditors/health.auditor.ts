import { logger } from '../../utils/logger';
import type { AuditFinding, AuditReport, CreateProposalInput } from '../autopilot.types';
import * as repo from '../autopilot.repository';
import { submitProposal } from '../autopilot.service';

// ── Thresholds ──
const DB_LATENCY_WARNING_MS = 100;
const MEMORY_CRITICAL_RATIO = 0.85;
const CRON_ERROR_WARNING_THRESHOLD = 3;
const STALE_APPROVAL_HOURS = 48;
const STALE_AGENT_HEALTH_HOURS = 24;

export async function runHealthAudit(): Promise<AuditReport> {
  const startTime = Date.now();
  const findings: AuditFinding[] = [];
  const metrics: Record<string, number | string> = {};
  const db = (await import('../../infra')).dbClient;

  // ── 1. DB Latency ──
  try {
    const t0 = Date.now();
    await db.query('SELECT 1');
    const dbLatencyMs = Date.now() - t0;
    metrics['db_latency_ms'] = dbLatencyMs;

    if (dbLatencyMs > DB_LATENCY_WARNING_MS) {
      findings.push({
        severity: 'warning',
        category: 'health',
        title: 'Latence base de donnees elevee',
        description: `La requete SELECT 1 a pris ${dbLatencyMs}ms (seuil: ${DB_LATENCY_WARNING_MS}ms). Verifier la charge PostgreSQL et les connexions.`,
        metric: 'db_latency_ms',
        threshold: DB_LATENCY_WARNING_MS,
        currentValue: dbLatencyMs,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    metrics['db_latency_ms'] = -1;
    findings.push({
      severity: 'critical',
      category: 'health',
      title: 'Base de donnees inaccessible',
      description: `Impossible d'executer SELECT 1: ${errorMsg}`,
      metric: 'db_latency_ms',
      currentValue: -1,
      proposalSuggested: true,
    });
  }

  // ── 2. Redis connectivity ──
  try {
    const { redisClient } = await import('../../infra/redis/redis-client');
    const redisConnected = redisClient.isConnected();
    metrics['redis_connected'] = redisConnected ? 1 : 0;

    if (!redisConnected) {
      findings.push({
        severity: 'critical',
        category: 'health',
        title: 'Redis deconnecte',
        description: 'Le client Redis n\'est pas connecte. Les fonctionnalites de cache, pub/sub et locks distribues sont indisponibles.',
        metric: 'redis_connected',
        threshold: 1,
        currentValue: 0,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    metrics['redis_connected'] = 0;
    findings.push({
      severity: 'critical',
      category: 'health',
      title: 'Redis inaccessible',
      description: `Erreur lors de la verification Redis: ${err instanceof Error ? err.message : String(err)}`,
      metric: 'redis_connected',
      currentValue: 0,
      proposalSuggested: true,
    });
  }

  // ── 3. Cron errors last 24h ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM cron_history
       WHERE status IN ('error','failed') AND created_at > NOW() - INTERVAL '24 hours'`,
    );
    const cronErrors = rows[0]?.c ?? 0;
    metrics['cron_errors_24h'] = cronErrors;

    if (cronErrors > CRON_ERROR_WARNING_THRESHOLD) {
      findings.push({
        severity: 'warning',
        category: 'health',
        title: 'Erreurs cron frequentes',
        description: `${cronErrors} erreurs cron dans les dernieres 24h (seuil: ${CRON_ERROR_WARNING_THRESHOLD}). Verifier les logs cron pour identifier les jobs defaillants.`,
        metric: 'cron_errors_24h',
        threshold: CRON_ERROR_WARNING_THRESHOLD,
        currentValue: cronErrors,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Health audit: cron_history query failed', { error: String(err) });
    metrics['cron_errors_24h'] = -1;
  }

  // ── 4. Agent health stale ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM agents
       WHERE last_health_check < NOW() - INTERVAL '24 hours'`,
    );
    const staleAgents = rows[0]?.c ?? 0;
    metrics['stale_agent_health'] = staleAgents;

    if (staleAgents > 0) {
      findings.push({
        severity: 'warning',
        category: 'health',
        title: 'Agents sans health check recent',
        description: `${staleAgents} agent(s) n'ont pas eu de health check depuis plus de ${STALE_AGENT_HEALTH_HOURS}h. Verifier que les crons de monitoring sont actifs.`,
        metric: 'stale_agent_health',
        threshold: 0,
        currentValue: staleAgents,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Health audit: agents health check query failed', { error: String(err) });
    metrics['stale_agent_health'] = -1;
  }

  // ── 5. Memory usage ──
  try {
    const mem = process.memoryUsage();
    const heapRatio = mem.heapUsed / mem.heapTotal;
    metrics['heap_used_mb'] = Math.round(mem.heapUsed / 1024 / 1024);
    metrics['heap_total_mb'] = Math.round(mem.heapTotal / 1024 / 1024);
    metrics['heap_ratio'] = Number(heapRatio.toFixed(3));

    if (heapRatio > MEMORY_CRITICAL_RATIO) {
      findings.push({
        severity: 'critical',
        category: 'health',
        title: 'Utilisation memoire critique',
        description: `Le heap utilise ${(heapRatio * 100).toFixed(1)}% de la memoire totale (${metrics['heap_used_mb']}MB / ${metrics['heap_total_mb']}MB). Seuil critique: ${MEMORY_CRITICAL_RATIO * 100}%.`,
        metric: 'heap_ratio',
        threshold: MEMORY_CRITICAL_RATIO,
        currentValue: heapRatio,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Health audit: memory check failed', { error: String(err) });
  }

  // ── 6. Pending approvals old ──
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS c FROM approval_queue
       WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '${STALE_APPROVAL_HOURS} hours'`,
    );
    const staleApprovals = rows[0]?.c ?? 0;
    metrics['stale_approvals'] = staleApprovals;

    if (staleApprovals > 0) {
      findings.push({
        severity: 'warning',
        category: 'health',
        title: 'Approbations en attente depuis longtemps',
        description: `${staleApprovals} approbation(s) en attente depuis plus de ${STALE_APPROVAL_HOURS}h. L'administrateur devrait les traiter ou les expirer.`,
        metric: 'stale_approvals',
        threshold: 0,
        currentValue: staleApprovals,
        proposalSuggested: true,
      });
    }
  } catch (err) {
    logger.warn('Health audit: approval_queue query failed', { error: String(err) });
    metrics['stale_approvals'] = -1;
  }

  // ── Generate proposals for findings that suggest one ──
  let proposalsGenerated = 0;
  for (const f of findings) {
    if (f.proposalSuggested) {
      try {
        const proposalInput: CreateProposalInput = buildHealthProposal(f);
        const result = await submitProposal(proposalInput);
        if (result) proposalsGenerated++;
      } catch (err) {
        logger.warn('Health audit: failed to submit proposal', {
          title: f.title,
          error: String(err),
        });
      }
    }
  }

  // ── Build report summary ──
  const criticalCount = findings.filter(f => f.severity === 'critical' || f.severity === 'urgent').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const status = criticalCount > 0 ? 'DEGRADED' : warningCount > 0 ? 'WARNING' : 'HEALTHY';
  const summary = `Health audit: ${status} — ${findings.length} finding(s), ${criticalCount} critical, ${warningCount} warning, ${proposalsGenerated} proposal(s) generated`;

  logger.info(summary, { metrics });

  return repo.createAuditReport({
    auditorId: 'health-auditor',
    reportType: 'health',
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
function buildHealthProposal(finding: AuditFinding): CreateProposalInput {
  const base = {
    agentId: 'fz-monitoring',
    agentName: 'Health Auditor',
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    rationale: `Detecte par l'audit de sante automatique. Metrique: ${finding.metric ?? 'N/A'}, valeur: ${finding.currentValue ?? 'N/A'}, seuil: ${finding.threshold ?? 'N/A'}.`,
  } as const;

  switch (finding.metric) {
    case 'db_latency_ms':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'health_alert',
          subject: 'Alerte: latence DB elevee',
          body: finding.description,
        },
        impactEstimate: 'Performance degradee pour tous les utilisateurs',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'redis_connected':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'health_alert',
          subject: 'Alerte critique: Redis deconnecte',
          body: finding.description,
        },
        impactEstimate: 'Cache, sessions et pub/sub indisponibles',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'cron_errors_24h':
      return {
        ...base,
        actionType: 'trigger_cron',
        actionParams: { jobName: 'health-check' },
        impactEstimate: 'Re-verification de sante des services',
        riskEstimate: 'Faible — declenchement d\'un job existant',
      };

    case 'stale_agent_health':
      return {
        ...base,
        actionType: 'trigger_cron',
        actionParams: { jobName: 'agent-health-check' },
        impactEstimate: 'Mise a jour des statuts de sante des agents',
        riskEstimate: 'Faible — declenchement d\'un job existant',
      };

    case 'heap_ratio':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'health_alert',
          subject: 'Alerte critique: memoire saturee',
          body: finding.description,
        },
        impactEstimate: 'Risque de crash ou OOM kill',
        riskEstimate: 'Faible — notification uniquement',
      };

    case 'stale_approvals':
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'health_alert',
          subject: 'Rappel: approbations en attente',
          body: finding.description,
        },
        impactEstimate: 'Deblocage des actions en attente',
        riskEstimate: 'Faible — notification uniquement',
      };

    default:
      return {
        ...base,
        actionType: 'send_notification',
        actionParams: {
          userId: 'admin',
          channel: 'in_app',
          type: 'health_alert',
          subject: finding.title,
          body: finding.description,
        },
      };
  }
}
