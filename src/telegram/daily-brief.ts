/**
 * FEATURE 11 — Brief CEO quotidien à 8h
 * Chaque jour à 8h Netanya (5h UTC), envoie un résumé complet
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';

let bot: TelegramBot;
let adminChatId: string;
let briefInterval: ReturnType<typeof setInterval> | null = null;
let lastBriefDate = '';

// DB helper — uses dynamic container detection (same as admin-bot)
async function findPgContainer(): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['ps', '--format', '{{.Names}}', '--filter', 'name=freenzy-postgres']);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim().split('\n')[0] || ''));
    proc.on('error', () => resolve(''));
  });
}

async function dbQuery(sql: string): Promise<string> {
  const container = await findPgContainer();
  if (!container) return 'Error: PostgreSQL container not found';
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', container, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('error', (e: Error) => { resolve(`Error: ${e.message}`); });
    proc.on('close', (code) => {
      if (code !== 0 && err) resolve(`Error: ${err.trim()}`);
      else resolve(out.trim() || '0');
    });
  });
}

async function generateBrief(): Promise<string> {
  const now = new Date();
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const day = dayNames[now.getDay()];
  const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // Revenue (wallet_transactions, type='deposit')
  const revenueYesterday = await dbQuery(`
    SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions
    WHERE created_at::date = (CURRENT_DATE - 1) AND type = 'deposit'
  `);
  const revenueDayBefore = await dbQuery(`
    SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions
    WHERE created_at::date = (CURRENT_DATE - 2) AND type = 'deposit'
  `);
  const revYesterday = parseFloat(revenueYesterday) || 0;
  const revDayBefore = parseFloat(revenueDayBefore) || 0;
  const revChange = revDayBefore > 0
    ? `${((revYesterday - revDayBefore) / revDayBefore * 100).toFixed(0)}%`
    : 'N/A';

  // Users
  const newUsers = await dbQuery(`
    SELECT COUNT(*) FROM users WHERE created_at::date = (CURRENT_DATE - 1)
  `);
  const activeUsers = await dbQuery(`
    SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'
  `);

  // New user profiles summary
  const newProfiles = await dbQuery(`
    SELECT string_agg(COALESCE(up.profession, 'inconnu'), ', ')
    FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.created_at::date = (CURRENT_DATE - 1)
  `);

  // Top agent (llm_usage_log instead of agent_usage_logs)
  const topAgent = await dbQuery(`
    SELECT agent_name || ' (' || COUNT(*) || ' utilisations)'
    FROM llm_usage_log
    WHERE created_at > NOW() - INTERVAL '24 hours' AND agent_name IS NOT NULL
    GROUP BY agent_name ORDER BY COUNT(*) DESC LIMIT 1
  `);

  // Pending validations (pending_review, not pending)
  const pendingCount = await dbQuery(`
    SELECT COUNT(*) FROM agent_proposals WHERE status = 'pending_review'
  `);
  let pendingList = '';
  if (parseInt(pendingCount) > 0) {
    const top3 = await dbQuery(`
      SELECT '• ' || title || ' (créé: ' || to_char(created_at, 'DD/MM HH24:MI') || ')'
      FROM agent_proposals WHERE status = 'pending_review'
      ORDER BY created_at DESC LIMIT 3
    `);
    pendingList = `\n${top3}`;
  }

  // Quick win
  const quickWin = await dbQuery(`
    SELECT title || ' — Effort: ' || effort
    FROM product_improvements
    WHERE status IN ('proposed', 'approved') AND effort IN ('XS', 'S')
    ORDER BY priority_score DESC LIMIT 1
  `);

  // Error count (started_at, not created_at)
  const errors24h = await dbQuery(`
    SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND started_at > NOW() - INTERVAL '24 hours'
  `);

  // Build brief
  const brief = [
    `☀️ *Brief Freenzy — ${day} ${date}*`,
    '',
    `💰 Revenus hier : ${revYesterday}€ ${revChange !== 'N/A' ? `(${revChange} vs avant-hier)` : ''}`,
    `👤 Nouveaux users : ${newUsers}${newProfiles && newProfiles !== '0' ? ` (${newProfiles})` : ''}`,
    `⚡ Users actifs : ${activeUsers}`,
    `🤖 Agent star : ${topAgent || 'Aucune donnée'}`,
    '',
    `⏳ En attente de toi : ${pendingCount} validations${pendingList}`,
    '',
    parseInt(errors24h) > 0 ? `🚨 ${errors24h} erreurs en 24h\n` : '',
    quickWin && quickWin !== '0' && !quickWin.startsWith('Error') ? `🔧 *Quick win du jour :*\n${quickWin}\n` : '',
    'Bonne journée ! 🚀',
  ].filter(Boolean).join('\n');

  return brief;
}

export function initDailyBrief(botInstance: TelegramBot, chatId: string): void {
  bot = botInstance;
  adminChatId = chatId;

  // Check every minute if it's briefing time
  briefInterval = setInterval(async () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    // 5h UTC = 8h Netanya (Israel Standard Time)
    // Only send once per day (prevent duplicate sends)
    if (now.getUTCHours() === 5 && now.getUTCMinutes() === 0 && lastBriefDate !== todayStr) {
      lastBriefDate = todayStr;
      try {
        const brief = await generateBrief();
        await bot.sendMessage(adminChatId, brief, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Traiter validations', callback_data: 'handle_pending' },
              { text: '🔧 Quick win', callback_data: 'implement_quickwin' },
              { text: '📊 Rapport complet', callback_data: 'full_report' },
            ]],
          },
        });
      } catch (err) {
        console.error('[DailyBrief] Error:', err instanceof Error ? err.message : err);
      }
    }
  }, 60000);
}

export function stopDailyBrief(): void {
  if (briefInterval) {
    clearInterval(briefInterval);
    briefInterval = null;
  }
}

/**
 * Manual trigger — for /report or testing
 */
export async function sendBriefNow(): Promise<string> {
  return generateBrief();
}
