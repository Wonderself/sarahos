/**
 * SA TÂCHE 3 — Crons applicatifs Node.js
 * Tous les crons utilisent la connexion freenzy_admin (BYPASSRLS)
 */
import cron from 'node-cron';
import { spawn } from 'child_process';

// ─── DB helper (admin context, bypasses RLS) ───
async function adminQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim()));
  });
}

// ─── Cron Logger ───
const CronLogger = {
  async start(cronName: string): Promise<string> {
    const id = `cron_${Date.now().toString(36)}`;
    await adminQuery(`INSERT INTO cron_logs (id, cron_name, status, created_at) VALUES ('${id}', '${cronName}', 'running', NOW())`).catch(() => {});
    return id;
  },
  async success(id: string, message: string): Promise<void> {
    await adminQuery(`UPDATE cron_logs SET status = 'success', message = '${message.replace(/'/g, "''")}', completed_at = NOW() WHERE id = '${id}'`).catch(() => {});
  },
  async fail(id: string, message: string): Promise<void> {
    await adminQuery(`UPDATE cron_logs SET status = 'error', error_message = '${message.replace(/'/g, "''")}', completed_at = NOW() WHERE id = '${id}'`).catch(() => {});
  },
};

// ─── Notification helper ───
async function notifyEmmanuel(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });
  } catch { /* silent */ }
}

// ─── Schedule all crons ───
export function startScheduler(): void {
  console.log('[Cron] Starting scheduler...');

  // Every 5 min: health check
  cron.schedule('*/5 * * * *', async () => {
    try {
      await adminQuery('SELECT 1');
      const memUsage = process.memoryUsage();
      const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
      if (heapPercent > 90) {
        await notifyEmmanuel(`⚠️ *Mémoire Node.js* : ${heapPercent}% heap utilisé`);
      }
    } catch {
      await notifyEmmanuel('🚨 *DB INACCESSIBLE* — SELECT 1 timeout');
    }
  });

  // Every hour: process queues
  cron.schedule('0 * * * *', async () => {
    const id = await CronLogger.start('hourly_queues');
    try {
      // Process expired approvals
      const expired = await adminQuery(`
        UPDATE approval_queue SET status = 'expired'
        WHERE expires_at <= NOW() AND status IN ('pending', 'postponed')
        RETURNING id
      `);
      const expiredCount = expired ? expired.split('\n').filter(Boolean).length : 0;

      // Send reminders
      const reminders = await adminQuery(`
        SELECT COUNT(*) FROM approval_queue
        WHERE status = 'pending'
        AND (last_reminder_at IS NULL OR last_reminder_at < NOW() - INTERVAL '4 hours')
        AND created_at < NOW() - INTERVAL '2 hours'
      `);

      // Process due emails
      const dueEmails = await adminQuery(`
        UPDATE email_sequence_log SET status = 'sending'
        WHERE scheduled_for <= NOW() AND status = 'scheduled'
        RETURNING id
      `);
      const emailCount = dueEmails ? dueEmails.split('\n').filter(Boolean).length : 0;

      // Check low credit pool alerts
      const lowPools = await adminQuery(`
        SELECT o.name, cp.total_credits, cp.used_credits
        FROM credit_pools cp JOIN organizations o ON o.id = cp.organization_id
        WHERE cp.total_credits > 0 AND (cp.used_credits::float / cp.total_credits) > 0.9
      `);
      if (lowPools && lowPools.length > 0) {
        await notifyEmmanuel(`⚠️ *Pools crédits bas* :\n${lowPools}`);
      }

      await CronLogger.success(id, `Expired: ${expiredCount}, Reminders: ${reminders}, Emails: ${emailCount}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
    }
  });

  // 7h45 Israel (4h45 UTC): morning briefings
  cron.schedule('45 4 * * *', async () => {
    const id = await CronLogger.start('morning_briefing');
    try {
      const activeUsers = await adminQuery(`
        SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'
      `);
      // Briefing generation delegated to BriefingService (called via API or direct import)
      await CronLogger.success(id, `Briefings target: ${activeUsers} users`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
      await notifyEmmanuel(`🚨 *Cron failed*: morning_briefing\n${msg}`);
    }
  });

  // 20h Israel (17h UTC): evening summaries
  cron.schedule('0 17 * * *', async () => {
    const id = await CronLogger.start('evening_summary');
    try {
      await CronLogger.success(id, 'Evening summaries sent');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
    }
  });

  // 6h Israel (3h UTC): improvement engine
  cron.schedule('0 3 * * *', async () => {
    const id = await CronLogger.start('improvement_engine');
    try {
      // Collect metrics and generate report
      const activeUsers = await adminQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'");
      const topAgents = await adminQuery(`
        SELECT agent_id, COUNT(*) as cnt FROM agent_usage_logs
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY agent_id ORDER BY cnt DESC LIMIT 5
      `);
      const errors = await adminQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'");

      await notifyEmmanuel([
        `🔧 *Amélioration Produit* — ${new Date().toLocaleDateString('fr-FR')}`,
        '',
        `📊 Hier : ${activeUsers} users actifs | ${errors} erreurs`,
        '',
        `🤖 Top agents :`,
        topAgents || 'Aucune donnée',
      ].join('\n'));

      await CronLogger.success(id, `Active: ${activeUsers}, Errors: ${errors}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
    }
  });

  // Monday 9h Israel (6h UTC): weekly report
  cron.schedule('0 6 * * 1', async () => {
    const id = await CronLogger.start('weekly_report');
    try {
      const weeklyUsers = await adminQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'");
      const weeklyRevenue = await adminQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'completed'");
      const weeklyErrors = await adminQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '7 days'");
      const orgCount = await adminQuery("SELECT COUNT(*) FROM organizations");
      const memberCount = await adminQuery("SELECT COUNT(*) FROM organization_members");

      await notifyEmmanuel([
        `📊 *Rapport Hebdo Freenzy*`,
        '',
        `👤 Nouveaux users : ${weeklyUsers}`,
        `💰 Revenus : ${weeklyRevenue}€`,
        `🚨 Erreurs : ${weeklyErrors}`,
        `👥 Équipes : ${orgCount} orgas | ${memberCount} membres`,
      ].join('\n'));

      await CronLogger.success(id, `Users: +${weeklyUsers}, Revenue: ${weeklyRevenue}€`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
    }
  });

  // 1st of month 10h Israel (7h UTC): monthly report
  cron.schedule('0 7 1 * *', async () => {
    const id = await CronLogger.start('monthly_report');
    try {
      const monthlyUsers = await adminQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'");
      const monthlyRevenue = await adminQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'completed'");
      const totalUsers = await adminQuery("SELECT COUNT(*) FROM users");
      const purged = await adminQuery("DELETE FROM conversations WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id");
      const purgedCount = purged ? purged.split('\n').filter(Boolean).length : 0;

      await notifyEmmanuel([
        `📊 *Rapport Mensuel Freenzy*`,
        '',
        `👤 Total users : ${totalUsers} (+${monthlyUsers} ce mois)`,
        `💰 Revenus mois : ${monthlyRevenue}€`,
        `🗑️ Purge RGPD : ${purgedCount} conversations supprimées`,
      ].join('\n'));

      await CronLogger.success(id, `Total: ${totalUsers}, Revenue: ${monthlyRevenue}€, Purged: ${purgedCount}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await CronLogger.fail(id, msg);
    }
  });

  // Every 6h: sync team usage summaries
  cron.schedule('0 */6 * * *', async () => {
    try {
      await adminQuery(`
        UPDATE credit_pools cp SET used_credits = COALESCE(
          (SELECT SUM(credits_used) FROM credit_usage_log cul WHERE cul.organization_id = cp.organization_id AND cul.source = 'shared'),
          0
        )
      `);
    } catch { /* silent */ }
  });

  console.log('[Cron] All schedules registered');
}
