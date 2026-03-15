/**
 * Metrics Collector — Collects daily metrics for the improvement engine
 */
import { spawn } from 'child_process';

async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim()));
  });
}

export interface DailyMetrics {
  date: string;
  users: { total: number; active24h: number; active7d: number; active30d: number; new24h: number; new7d: number; new30d: number };
  agents: { topUsed: { id: string; count: number }[]; unused: string[]; totalUsages24h: number };
  onboarding: { started: number; completed: number; completionRate: number; abandonByStep: Record<string, number> };
  approvals: { pending: number; approved24h: number; rejected24h: number; modifiedBeforeApproval: number; mostRejectedTypes: string[] };
  emails: { sent24h: number; lowestOpenRate: { sequence: string; rate: number }[] };
  errors: { total24h: number; mostFrequent: { cron: string; count: number }[] };
  conversion: { signupToFirstAgent: number; signupToFirstPurchase: number };
  teams: { activeOrgs: number; totalMembers: number; avgMembersPerOrg: number; topOrgsByActivity: { name: string; actions: number }[]; sharedAgents: { agentId: string; orgCount: number }[]; avgApprovalRate: number };
}

export class MetricsCollector {
  static async collectDailyMetrics(): Promise<DailyMetrics> {
    const date = new Date().toISOString().split('T')[0] || '';

    // Users
    const [total, active24h, active7d, active30d, new24h, new7d, new30d] = await Promise.all([
      dbQuery('SELECT COUNT(*) FROM users'),
      dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"),
    ]);

    // Top agents
    const topAgentsRaw = await dbQuery(`
      SELECT agent_id, COUNT(*) as cnt FROM agent_usage_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY agent_id ORDER BY cnt DESC LIMIT 10
    `);
    const topUsed = topAgentsRaw
      ? topAgentsRaw.split('\n').filter(Boolean).map(l => {
          const [id, count] = l.split('|');
          return { id: id || '', count: parseInt(count || '0') };
        })
      : [];

    const totalUsages = await dbQuery("SELECT COUNT(*) FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '24 hours'");

    // Onboarding
    const [onbStarted, onbCompleted] = await Promise.all([
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE onboarding_completed = true AND created_at > NOW() - INTERVAL '24 hours'"),
    ]);
    const started = parseInt(onbStarted) || 0;
    const completed = parseInt(onbCompleted) || 0;

    // Approvals
    const [pending, approved, rejected, modified] = await Promise.all([
      dbQuery("SELECT COUNT(*) FROM approval_queue WHERE status = 'pending'"),
      dbQuery("SELECT COUNT(*) FROM approval_queue WHERE status = 'approved' AND approved_at > NOW() - INTERVAL '24 hours'"),
      dbQuery("SELECT COUNT(*) FROM approval_queue WHERE status = 'rejected' AND rejected_at > NOW() - INTERVAL '24 hours'"),
      dbQuery("SELECT COUNT(*) FROM approval_queue WHERE modified_payload IS NOT NULL AND created_at > NOW() - INTERVAL '24 hours'"),
    ]);

    // Errors
    const errorCount = await dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'");
    const frequentErrors = await dbQuery(`
      SELECT cron_name, COUNT(*) as cnt FROM cron_logs
      WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'
      GROUP BY cron_name ORDER BY cnt DESC LIMIT 5
    `);
    const mostFrequent = frequentErrors
      ? frequentErrors.split('\n').filter(Boolean).map(l => {
          const [cron, count] = l.split('|');
          return { cron: cron || '', count: parseInt(count || '0') };
        })
      : [];

    // Teams
    const [activeOrgs, totalMembers, topOrgs] = await Promise.all([
      dbQuery("SELECT COUNT(*) FROM organizations"),
      dbQuery("SELECT COUNT(*) FROM organization_members"),
      dbQuery(`
        SELECT o.name, COUNT(cul.id) as actions
        FROM organizations o
        LEFT JOIN credit_usage_log cul ON o.id = cul.organization_id AND cul.created_at > NOW() - INTERVAL '24 hours'
        GROUP BY o.id, o.name ORDER BY actions DESC LIMIT 5
      `),
    ]);

    const topOrgsByActivity = topOrgs
      ? topOrgs.split('\n').filter(Boolean).map(l => {
          const [name, actions] = l.split('|');
          return { name: name || '', actions: parseInt(actions || '0') };
        })
      : [];

    return {
      date,
      users: {
        total: parseInt(total) || 0,
        active24h: parseInt(active24h) || 0,
        active7d: parseInt(active7d) || 0,
        active30d: parseInt(active30d) || 0,
        new24h: parseInt(new24h) || 0,
        new7d: parseInt(new7d) || 0,
        new30d: parseInt(new30d) || 0,
      },
      agents: { topUsed, unused: [], totalUsages24h: parseInt(totalUsages) || 0 },
      onboarding: {
        started,
        completed,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
        abandonByStep: {},
      },
      approvals: {
        pending: parseInt(pending) || 0,
        approved24h: parseInt(approved) || 0,
        rejected24h: parseInt(rejected) || 0,
        modifiedBeforeApproval: parseInt(modified) || 0,
        mostRejectedTypes: [],
      },
      emails: { sent24h: 0, lowestOpenRate: [] },
      errors: { total24h: parseInt(errorCount) || 0, mostFrequent },
      conversion: { signupToFirstAgent: 0, signupToFirstPurchase: 0 },
      teams: {
        activeOrgs: parseInt(activeOrgs) || 0,
        totalMembers: parseInt(totalMembers) || 0,
        avgMembersPerOrg: parseInt(activeOrgs) > 0 ? Math.round(parseInt(totalMembers) / parseInt(activeOrgs)) : 0,
        topOrgsByActivity,
        sharedAgents: [],
        avgApprovalRate: 0,
      },
    };
  }
}
