/**
 * FEATURE 11 — Brief CEO quotidien à 8h
 * Chaque jour à 8h Netanya (5h UTC), envoie un résumé complet
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';

let bot: TelegramBot;
let adminChatId: string;
let briefInterval: ReturnType<typeof setInterval> | null = null;

// DB helper — uses docker exec to reach PostgreSQL
const PG_CONTAINER = process.env.PG_CONTAINER || 'freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003';

async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', PG_CONTAINER, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('error', (e: Error) => { resolve(`Error: ${e.message}`); });
    proc.on('close', () => resolve(out.trim() || '0'));
  });
}

async function generateBrief(): Promise<string> {
  const now = new Date();
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const day = dayNames[now.getDay()];
  const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // Revenue
  const revenueYesterday = await dbQuery(`
    SELECT COALESCE(SUM(amount), 0) FROM transactions
    WHERE created_at::date = (CURRENT_DATE - 1) AND status = 'completed'
  `);
  const revenueDayBefore = await dbQuery(`
    SELECT COALESCE(SUM(amount), 0) FROM transactions
    WHERE created_at::date = (CURRENT_DATE - 2) AND status = 'completed'
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

  // Top agent
  const topAgent = await dbQuery(`
    SELECT agent_id || ' (' || COUNT(*) || ' utilisations)'
    FROM agent_usage_logs
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 1
  `);

  // Pending validations
  const pendingCount = await dbQuery(`
    SELECT COUNT(*) FROM agent_proposals WHERE status = 'pending'
  `);
  let pendingList = '';
  if (parseInt(pendingCount) > 0) {
    const top3 = await dbQuery(`
      SELECT '• ' || title || ' (expire: ' || to_char(expires_at, 'DD/MM HH24:MI') || ')'
      FROM agent_proposals WHERE status = 'pending'
      ORDER BY expires_at ASC LIMIT 3
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

  // Error count
  const errors24h = await dbQuery(`
    SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'
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
    quickWin && quickWin !== '0' ? `🔧 *Quick win du jour :*\n${quickWin}\n` : '',
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
    // 5h UTC = 8h Netanya (Israel Standard Time)
    if (now.getUTCHours() === 5 && now.getUTCMinutes() === 0) {
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
