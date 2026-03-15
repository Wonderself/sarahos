/**
 * Reporting Service — Weekly and monthly reports
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

export class ReportingService {
  static async generateWeeklyReport(): Promise<string> {
    const [totalUsers, newUsers, activeUsers, revenue, errors, orgCount, memberCount, topAgents] = await Promise.all([
      dbQuery('SELECT COUNT(*) FROM users'),
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"),
      dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days'"),
      dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'completed'"),
      dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '7 days'"),
      dbQuery('SELECT COUNT(*) FROM organizations'),
      dbQuery('SELECT COUNT(*) FROM organization_members'),
      dbQuery(`SELECT agent_id || ': ' || COUNT(*) FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 5`),
    ]);

    const report = [
      `📊 *Rapport Hebdomadaire Freenzy*`,
      `Semaine du ${new Date(Date.now() - 7 * 86400000).toLocaleDateString('fr-FR')} au ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      `👤 *Users*`,
      `• Total : ${totalUsers}`,
      `• Nouveaux : +${newUsers}`,
      `• Actifs 7j : ${activeUsers}`,
      '',
      `💰 *Revenus* : ${revenue}€`,
      '',
      `👥 *Équipes* : ${orgCount} orgas | ${memberCount} membres`,
      '',
      `🤖 *Top agents* :`,
      topAgents || '• Aucune donnée',
      '',
      `🚨 *Erreurs* : ${errors}`,
    ].join('\n');

    await notifyEmmanuel(report);
    return report;
  }

  static async generateMonthlyReport(): Promise<string> {
    const [totalUsers, newUsers, revenue, purgedConvos, orgCount, totalCreditsUsed] = await Promise.all([
      dbQuery('SELECT COUNT(*) FROM users'),
      dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'"),
      dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'completed'"),
      dbQuery("SELECT COUNT(*) FROM conversations WHERE created_at < NOW() - INTERVAL '90 days'"),
      dbQuery('SELECT COUNT(*) FROM organizations'),
      dbQuery("SELECT COALESCE(SUM(credits_used), 0) FROM credit_usage_log WHERE created_at > NOW() - INTERVAL '30 days'"),
    ]);

    const report = [
      `📊 *Rapport Mensuel Freenzy* — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      '',
      `👤 Total users : ${totalUsers} (+${newUsers} ce mois)`,
      `💰 Revenus : ${revenue}€`,
      `👥 Équipes : ${orgCount}`,
      `🤖 Crédits consommés : ${totalCreditsUsed}`,
      `🗑️ RGPD : ${purgedConvos} conversations > 90j à purger`,
      '',
      `_Rapport détaillé disponible sur demande (/report)_`,
    ].join('\n');

    await notifyEmmanuel(report);
    return report;
  }
}
