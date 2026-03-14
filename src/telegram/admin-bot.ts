/**
 * FEATURE 1 — Bot principal avec toutes les commandes
 * Sécurité : vérifie ADMIN_CHAT_ID sur CHAQUE message
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import { resetHistory } from './commands/chat-command';

export const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

// ─── DB Helper ─────────────────────────────────────────────────
// Uses psql directly (no pg dependency needed)
async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('close', () => resolve(out.trim() || err.trim() || 'No result'));
  });
}

// ─── System helpers ────────────────────────────────────────────
async function getSystemStats(): Promise<{ cpu: string; ram: string; disk: string; uptime: string }> {
  return new Promise((resolve) => {
    const proc = spawn('bash', ['-c', `
      CPU=$(top -bn1 | grep "Cpu(s)" | awk '{printf "%.1f", $2+$4}' 2>/dev/null || echo "?")
      RAM=$(free -m | awk '/Mem:/ {printf "%.1f", $3/$2*100}' 2>/dev/null || echo "?")
      DISK=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%' 2>/dev/null || echo "?")
      UPTIME=$(uptime -p 2>/dev/null || echo "?")
      echo "$CPU|$RAM|$DISK|$UPTIME"
    `]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => {
      const [cpu, ram, disk, uptime] = out.trim().split('|');
      resolve({ cpu: cpu || '?', ram: ram || '?', disk: disk || '?', uptime: uptime || '?' });
    });
  });
}

function statusIcon(value: string, thresholds: [number, number]): string {
  const n = parseFloat(value);
  if (isNaN(n)) return '❓';
  return n < thresholds[0] ? '🟢' : n < thresholds[1] ? '🟡' : '🔴';
}

// ─── Register all commands ─────────────────────────────────────

export function registerBotCommands(bot: TelegramBot, adminChatId: string): void {

  // ── /start ──
  bot.onText(/\/start/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    await bot.sendMessage(msg.chat.id, `🤖 *Freenzy Admin Bot*

📊 *INFORMATIONS*
/status — État VPS et métriques
/users — Stats utilisateurs
/revenue — Revenus Stripe
/errors — Dernières erreurs

⚡ *ACTIONS RAPIDES*
/claude \\[instruction\\] — Donner une tâche à Claude
/think \\[question\\] — Analyse approfondie
/chat \\[message\\] — Conversation libre
_Envoie une photo pour l'analyser_

✅ *VALIDATIONS*
/pending — Actions en attente
/approve \\[id\\] — Approuver
/reject \\[id\\] — Refuser
/backlog — Améliorations produit

🔧 *SYSTÈME*
/deploy — Déployer en prod
/backup — Backup DB maintenant
/report — Rapport complet
/broadcast \\[msg\\] — Message à tous
/credits \\[email\\] \\[n\\] — Créditer un user
/user \\[email\\] — Profil d'un user

💬 *CONVERSATION*
/reset — Réinitialiser l'historique
/help — Cette aide`, { parse_mode: 'Markdown' });
  });

  // ── /help (alias /start) ──
  bot.onText(/\/help/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    // Simulate /start via processUpdate
    bot.processUpdate({
      update_id: Date.now(),
      message: { ...msg, text: '/start', message_id: Date.now() },
    });
  });

  // ── /status ──
  bot.onText(/\/status/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const sys = await getSystemStats();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // DB queries
    const totalUsers = await dbQuery('SELECT COUNT(*) FROM users');
    const active24h = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'");
    const newToday = await dbQuery("SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE");
    const pgStatus = await dbQuery('SELECT 1').then(() => '✅ Online').catch(() => '🔴 OFFLINE');

    // Revenue queries
    const revenueToday = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at::date = CURRENT_DATE AND status = 'completed'");
    const revenueWeek = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'completed'");
    const revenueMonth = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'completed'");

    const lastError = await dbQuery("SELECT EXTRACT(EPOCH FROM NOW() - MAX(created_at))/3600 FROM cron_logs WHERE status = 'error'");
    const lastBackup = await dbQuery("SELECT to_char(MAX(created_at), 'DD/MM HH24:MI') FROM cron_logs WHERE cron_name = 'backup' AND status = 'success'");

    const statusMsg = `🖥️ *Status Freenzy* — ${now} UTC

*Infrastructure :*
• CPU : ${sys.cpu}% ${statusIcon(sys.cpu, [50, 80])}
• RAM : ${sys.ram}% ${statusIcon(sys.ram, [70, 85])}
• Disque : ${sys.disk}% ${statusIcon(sys.disk, [70, 80])}
• PostgreSQL : ${pgStatus}
• Node.js : ✅ v${process.version.slice(1)}

*Business :*
• Users total : ${totalUsers}
• Actifs (24h) : ${active24h}
• Nouveaux aujourd'hui : ${newToday}

*Revenus :*
• Aujourd'hui : ${revenueToday}€
• Cette semaine : ${revenueWeek}€
• Ce mois : ${revenueMonth}€

*Système :*
• Dernière erreur : il y a ${parseFloat(lastError || '0').toFixed(1)}h
• Dernier backup : ${lastBackup || 'jamais'}
• Uptime : ${sys.uptime}`;

    await bot.sendMessage(msg.chat.id, statusMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Rafraîchir', callback_data: 'refresh_status' },
          { text: '📊 Détails', callback_data: 'status_details' },
          { text: '🚨 Erreurs', callback_data: 'show_errors' },
        ]],
      },
    });
  });

  // ── /users ──
  bot.onText(/\/users(?:\s+(\d+))?/, async (msg, _match) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const total = await dbQuery('SELECT COUNT(*) FROM users');
    const active7d = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days'");
    const active30d = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'");
    const newWeek = await dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'");

    const topProfessions = await dbQuery(`
      SELECT profession, COUNT(*) as cnt FROM user_profiles
      WHERE profession IS NOT NULL
      GROUP BY profession ORDER BY cnt DESC LIMIT 5
    `);

    const onboardingRate = await dbQuery(`
      SELECT ROUND(
        COUNT(CASE WHEN onboarding_completed THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1
      ) FROM users
    `);

    const usersMsg = `👥 *Stats Utilisateurs*

📊 Vue d'ensemble :
• Total : ${total}
• Actifs 7j : ${active7d}
• Actifs 30j : ${active30d}
• Nouveaux cette semaine : ${newWeek}
• Taux complétion onboarding : ${onboardingRate}%

💼 Top professions :
${topProfessions.split('\n').map((l: string) => {
  const [prof, cnt] = l.split('|');
  return prof ? `• ${prof} — ${cnt}` : '';
}).filter(Boolean).join('\n') || '• Aucune donnée'}`;

    await bot.sendMessage(msg.chat.id, usersMsg, { parse_mode: 'Markdown' });
  });

  // ── /revenue ──
  bot.onText(/\/revenue(?:\s+(\w+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const period = match?.[1] || 'today';

    let periodSql = "created_at::date = CURRENT_DATE";
    let periodLabel = "Aujourd'hui";
    if (period === 'week') { periodSql = "created_at > NOW() - INTERVAL '7 days'"; periodLabel = 'Cette semaine'; }
    if (period === 'month') { periodSql = "created_at > NOW() - INTERVAL '30 days'"; periodLabel = 'Ce mois'; }

    const total = await dbQuery(`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE ${periodSql} AND status = 'completed'`);
    const count = await dbQuery(`SELECT COUNT(*) FROM transactions WHERE ${periodSql} AND status = 'completed'`);

    const revenueMsg = `💰 *Revenus — ${periodLabel}*

• Total : ${total}€
• Transactions : ${count}`;

    await bot.sendMessage(msg.chat.id, revenueMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: "Aujourd'hui", callback_data: 'revenue_today' },
          { text: 'Semaine', callback_data: 'revenue_week' },
          { text: 'Mois', callback_data: 'revenue_month' },
        ]],
      },
    });
  });

  // ── /errors ──
  bot.onText(/\/errors(?:\s+(\d+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const n = parseInt(match?.[1] || '10', 10);

    const errors = await dbQuery(`
      SELECT to_char(created_at, 'DD/MM HH24:MI') || ' | ' || cron_name || ' | ' || SUBSTRING(error_message, 1, 60)
      FROM cron_logs WHERE status = 'error'
      ORDER BY created_at DESC LIMIT ${n}
    `);

    const errMsg = `🚨 *Dernières erreurs* (${n})\n\n\`\`\`\n${errors || 'Aucune erreur'}\n\`\`\``;
    await bot.sendMessage(msg.chat.id, errMsg, { parse_mode: 'Markdown' });
  });

  // ── /pending ──
  bot.onText(/\/pending/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const pending = await dbQuery(`
      SELECT id, title, agent_id, to_char(expires_at, 'DD/MM HH24:MI') as expires,
             CASE WHEN expires_at < NOW() + INTERVAL '2 hours' THEN 'urgent' ELSE 'normal' END as urgency
      FROM agent_proposals WHERE status = 'pending'
      ORDER BY expires_at ASC LIMIT 10
    `);

    if (!pending || pending === 'No result') {
      await bot.sendMessage(msg.chat.id, '✅ Aucune action en attente.');
      return;
    }

    const lines = pending.split('\n').filter(Boolean);
    for (const line of lines) {
      const [id, title, agent, expires, urgency] = line.split('|');
      const badge = urgency === 'urgent' ? '🔴 Urgent' : '';
      const itemMsg = `${badge} *${title}*\nAgent : ${agent}\nExpire : ${expires}\nID : \`${id}\``;
      await bot.sendMessage(msg.chat.id, itemMsg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Approve', callback_data: `approve_${id}` },
            { text: '❌ Reject', callback_data: `reject_${id}` },
            { text: '⏸️ Reporter', callback_data: `postpone_${id}` },
          ]],
        },
      });
    }
  });

  // ── /approve [id] ──
  bot.onText(/\/approve (\w+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const id = match?.[1];
    if (!id) return;

    await dbQuery(`UPDATE agent_proposals SET status = 'approved', reviewed_by = 'emmanuel', reviewed_at = NOW() WHERE id = '${id}'`);
    await bot.sendMessage(msg.chat.id, `✅ Action \`${id}\` approuvée et exécutée.`, { parse_mode: 'Markdown' });
  });

  // ── /reject [id] ──
  bot.onText(/\/reject (\w+)(?:\s+(.+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const id = match?.[1];
    const reason = match?.[2] || 'Refusé par admin';
    if (!id) return;

    await dbQuery(`UPDATE agent_proposals SET status = 'rejected', reviewed_by = 'emmanuel', reviewed_at = NOW(), rejection_reason = '${reason.replace(/'/g, "''")}' WHERE id = '${id}'`);
    await bot.sendMessage(msg.chat.id, `❌ Action \`${id}\` refusée. Raison : ${reason}`, { parse_mode: 'Markdown' });
  });

  // ── /deploy ──
  bot.onText(/\/deploy/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    await bot.sendMessage(msg.chat.id, '⚠️ *Déployer en production ?*', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Confirmer le deploy', callback_data: 'confirm_deploy' },
          { text: '❌ Annuler', callback_data: 'cancel_deploy' },
        ]],
      },
    });
  });

  // ── /backup ──
  bot.onText(/\/backup/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    spawn('bash', ['/root/crons/backup-db.sh'], { detached: true, stdio: 'ignore' }).unref();
    await bot.sendMessage(msg.chat.id, '💾 Backup lancé... Tu recevras une notification à la fin.');
  });

  // ── /report ──
  bot.onText(/\/report/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const sys = await getSystemStats();
    const total = await dbQuery('SELECT COUNT(*) FROM users');
    const active = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'");
    const revenue = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'completed'");
    const pendingCount = await dbQuery("SELECT COUNT(*) FROM agent_proposals WHERE status = 'pending'");
    const errors24h = await dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'");

    const report = `📊 *Rapport Complet Freenzy*

🖥️ Infra : CPU ${sys.cpu}% | RAM ${sys.ram}% | Disque ${sys.disk}%
👥 Users : ${total} total | ${active} actifs 24h
💰 Revenus 30j : ${revenue}€
⏳ Validations : ${pendingCount} en attente
🚨 Erreurs 24h : ${errors24h}
⏰ Uptime : ${sys.uptime}`;

    await bot.sendMessage(msg.chat.id, report, { parse_mode: 'Markdown' });
  });

  // ── /broadcast [message] ──
  bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const message = match?.[1];
    if (!message) return;

    const activeCount = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'");

    await bot.sendMessage(msg.chat.id, `📢 Envoyer ce message à *${activeCount} users actifs* ?\n\n"${message}"`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Envoyer', callback_data: `confirm_broadcast_${Date.now()}` },
          { text: '❌ Annuler', callback_data: 'cancel_broadcast' },
        ]],
      },
    });
  });

  // ── /credits [email] [montant] ──
  bot.onText(/\/credits (\S+) (\d+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const email = match?.[1];
    const amount = match?.[2];
    if (!email || !amount) return;

    await bot.sendMessage(msg.chat.id, `Créditer *${email}* de *${amount}* crédits ?`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Confirmer', callback_data: `confirm_credits_${email}_${amount}` },
          { text: '❌ Annuler', callback_data: 'cancel_credits' },
        ]],
      },
    });
  });

  // ── /user [email] ──
  bot.onText(/\/user (\S+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const email = match?.[1];
    if (!email) return;

    const userInfo = await dbQuery(`
      SELECT u.email, u.display_name, u.role, u.created_at, u.last_login_at, u.credits,
             up.profession, up.city
      FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = '${email.replace(/'/g, "''")}'
    `);

    if (!userInfo || userInfo === 'No result') {
      await bot.sendMessage(msg.chat.id, `⚠️ User \`${email}\` introuvable.`, { parse_mode: 'Markdown' });
      return;
    }

    const [emailVal, name, role, created, lastLogin, credits, profession, city] = userInfo.split('|');
    const userMsg = `👤 *Profil — ${name || emailVal}*

📧 ${emailVal}
💼 ${profession || '?'} — ${city || '?'}
🎭 Rôle : ${role}
💳 Crédits : ${credits}
📅 Inscrit : ${created?.slice(0, 10)}
🕐 Dernier login : ${lastLogin?.slice(0, 16) || 'jamais'}`;

    await bot.sendMessage(msg.chat.id, userMsg, { parse_mode: 'Markdown' });
  });

  // ── /backlog ──
  bot.onText(/\/backlog/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const items = await dbQuery(`
      SELECT id, title, priority_score, effort, impact
      FROM product_improvements
      WHERE status IN ('proposed', 'approved')
      ORDER BY priority_score DESC LIMIT 15
    `);

    if (!items || items === 'No result') {
      await bot.sendMessage(msg.chat.id, '📋 Backlog vide.');
      return;
    }

    const lines = items.split('\n').filter(Boolean);
    let backlogMsg = '📋 *Backlog Produit*\n\n';
    for (const line of lines) {
      const [_id, title, priority, effort, impact] = line.split('|');
      backlogMsg += `• [${priority}] *${title}* — Effort: ${effort}, Impact: ${impact}\n`;
    }

    await bot.sendMessage(msg.chat.id, backlogMsg, { parse_mode: 'Markdown' });
  });

  // ── /reset ──
  bot.onText(/\/reset/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    resetHistory(msg.chat.id.toString());
    await bot.sendMessage(msg.chat.id, '🔄 Historique effacé. Nouvelle conversation.');
  });
}
