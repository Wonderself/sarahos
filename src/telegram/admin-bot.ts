/**
 * FEATURE 1 — Bot principal avec toutes les commandes
 * Sécurité : vérifie ADMIN_CHAT_ID sur CHAQUE message
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import { resetHistory } from './commands/chat-command';

export const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

// ─── DB Helper ─────────────────────────────────────────────────
// Uses docker exec to reach PostgreSQL inside the container
// Container name is auto-detected to survive Coolify redeploys
async function findContainer(namePattern: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['ps', '--format', '{{.Names}}', '--filter', `name=${namePattern}`]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => {
      const name = out.trim().split('\n')[0];
      resolve(name || '');
    });
    proc.on('error', () => resolve(''));
  });
}

let pgContainerCache = '';
async function getPgContainer(): Promise<string> {
  if (pgContainerCache) return pgContainerCache;
  // Try multiple patterns to find the postgres container
  for (const pattern of ['freenzy-postgres', 'postgres']) {
    const name = await findContainer(pattern);
    if (name) { pgContainerCache = name; return name; }
  }
  return process.env.PG_CONTAINER || '';
}

async function dbQuery(sql: string): Promise<string> {
  const container = await getPgContainer();
  if (!container) return 'Error: PostgreSQL container not found';
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', container, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('error', (e: Error) => {
      resolve(`Error: ${e.message}`);
    });
    proc.on('close', (code) => {
      if (code !== 0 && err) resolve(`Error: ${err.trim()}`);
      else resolve(out.trim() || 'No result');
    });
  });
}

// Invalidate container cache on redeploy (every 5 min)
setInterval(() => { pgContainerCache = ''; }, 300_000);

// Redis check via docker exec
async function checkRedis(): Promise<string> {
  const container = await findContainer('freenzy-redis');
  if (!container) {
    // Try via redis-cli on host
    return new Promise((resolve) => {
      const proc = spawn('redis-cli', ['-p', '6379', '-a', process.env['REDIS_PASSWORD'] || '', 'ping']);
      let out = '';
      proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
      proc.on('close', () => resolve(out.trim() === 'PONG' ? '✅ Online' : '🔴 OFFLINE'));
      proc.on('error', () => resolve('⚠️ Non vérifié'));
    });
  }
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', container, 'redis-cli', '-a', process.env['REDIS_PASSWORD'] || '', 'ping']);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim() === 'PONG' ? '✅ Online' : '🔴 OFFLINE'));
    proc.on('error', () => resolve('⚠️ Non vérifié'));
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
/autoloop \\[instruction\\] \\[durée\\] — Session autonome longue
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
    const pgResult = await dbQuery('SELECT 1');
    const pgStatus = pgResult.startsWith('Error') ? '🔴 OFFLINE' : '✅ Online';
    const redisStatus = await checkRedis();

    // Revenue queries
    const revenueToday = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE created_at::date = CURRENT_DATE AND type = 'deposit'");
    const revenueWeek = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE created_at > NOW() - INTERVAL '7 days' AND type = 'deposit'");
    const revenueMonth = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE created_at > NOW() - INTERVAL '30 days' AND type = 'deposit'");

    const lastError = await dbQuery("SELECT EXTRACT(EPOCH FROM NOW() - MAX(started_at))/3600 FROM cron_logs WHERE status = 'error'");
    const lastBackup = await dbQuery("SELECT to_char(MAX(started_at), 'DD/MM HH24:MI') FROM cron_logs WHERE cron_name = 'backup' AND status = 'success'");

    const statusMsg = `🖥️ *Status Freenzy* — ${now} UTC

*Infrastructure :*
• CPU : ${sys.cpu}% ${statusIcon(sys.cpu, [50, 80])}
• RAM : ${sys.ram}% ${statusIcon(sys.ram, [70, 85])}
• Disque : ${sys.disk}% ${statusIcon(sys.disk, [70, 80])}
• PostgreSQL : ${pgStatus}
• Redis : ${redisStatus}
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
• Dernière erreur : ${lastError && lastError !== 'No result' && !isNaN(parseFloat(lastError)) ? `il y a ${parseFloat(lastError).toFixed(1)}h` : 'aucune ✅'}
• Dernier backup : ${lastBackup && lastBackup !== 'No result' ? lastBackup : 'aucun'}
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
        COUNT(CASE WHEN onboarding_completed_at IS NOT NULL THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1
      ) FROM user_profiles
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

    const total = await dbQuery(`SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE ${periodSql} AND type = 'deposit'`);
    const count = await dbQuery(`SELECT COUNT(*) FROM wallet_transactions WHERE ${periodSql} AND type = 'deposit'`);

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
      SELECT to_char(started_at, 'DD/MM HH24:MI') || ' | ' || cron_name || ' | ' || COALESCE(errors[1], 'unknown')
      FROM cron_logs WHERE status = 'error'
      ORDER BY started_at DESC LIMIT ${n}
    `);

    const errMsg = `🚨 *Dernières erreurs* (${n})\n\n\`\`\`\n${errors || 'Aucune erreur'}\n\`\`\``;
    await bot.sendMessage(msg.chat.id, errMsg, { parse_mode: 'Markdown' });
  });

  // ── /pending ──
  bot.onText(/\/pending/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const pending = await dbQuery(`
      SELECT id, title, agent_id, to_char(created_at, 'DD/MM HH24:MI') as created,
             'normal' as urgency
      FROM agent_proposals WHERE status = 'pending_review'
      ORDER BY created_at DESC LIMIT 10
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

    await dbQuery(`UPDATE agent_proposals SET status = 'approved', decided_by = 'emmanuel', decided_at = NOW() WHERE id = '${id}'`);
    await bot.sendMessage(msg.chat.id, `✅ Action \`${id}\` approuvée et exécutée.`, { parse_mode: 'Markdown' });
  });

  // ── /reject [id] ──
  bot.onText(/\/reject (\w+)(?:\s+(.+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const id = match?.[1];
    const reason = match?.[2] || 'Refusé par admin';
    if (!id) return;

    await dbQuery(`UPDATE agent_proposals SET status = 'denied', decided_by = 'emmanuel', decided_at = NOW(), decision_notes = '${reason.replace(/'/g, "''")}' WHERE id = '${id}'`);
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
    const revenue = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE created_at > NOW() - INTERVAL '30 days' AND type = 'deposit'");
    const pendingCount = await dbQuery("SELECT COUNT(*) FROM agent_proposals WHERE status = 'pending_review'");
    const errors24h = await dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND started_at > NOW() - INTERVAL '24 hours'");

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
      SELECT u.email, u.display_name, u.role, u.created_at, u.last_login_at, COALESCE(w.balance_credits, 0),
             up.profession, COALESCE(bi.ville, '')
      FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id LEFT JOIN wallets w ON u.id = w.user_id LEFT JOIN business_info bi ON u.id = bi.user_id
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

  // ── /teams ──
  bot.onText(/\/teams/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const teams = await dbQuery(`
      SELECT o.name, COUNT(om.id) as members,
        COALESCE(cp.total_credits - cp.used_credits, 0) as pool_remaining,
        (SELECT COUNT(*) FROM organization_agents oa WHERE oa.organization_id = o.id AND oa.enabled = true) as active_agents,
        u.email as owner_email, o.plan
      FROM organizations o
      JOIN users u ON o.owner_id = u.id
      LEFT JOIN organization_members om ON o.id = om.organization_id
      LEFT JOIN credit_pools cp ON o.id = cp.organization_id
      GROUP BY o.id, o.name, cp.total_credits, cp.used_credits, u.email, o.plan
      ORDER BY members DESC LIMIT 20
    `);

    if (!teams || teams === 'No result') {
      await bot.sendMessage(msg.chat.id, '👥 Aucune équipe créée.');
      return;
    }

    const lines = teams.split('\n').filter(Boolean);
    let teamsMsg = '👥 *Équipes Freenzy*\n\n';
    let totalMembers = 0;

    lines.forEach((line, i) => {
      const [name, members, pool, agents, owner, plan] = line.split('|');
      totalMembers += parseInt(members || '0');
      teamsMsg += `${i + 1}. *${name}* — ${members} membres | ${pool} crédits | ${agents} agents\n   Owner: ${owner} | Plan: ${plan}\n\n`;
    });

    teamsMsg += `\n_Total : ${lines.length} orgas | ${totalMembers} membres_`;

    await bot.sendMessage(msg.chat.id, teamsMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '📊 Détails', callback_data: 'teams_details' },
          { text: '📈 Usage', callback_data: 'teams_usage' },
        ]],
      },
    });
  });

  // ── /team [name] ──
  bot.onText(/\/team (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const search = match?.[1]?.trim();
    if (!search) return;

    const org = await dbQuery(`
      SELECT o.id, o.name, o.plan, o.max_members, u.email as owner_email,
        COUNT(om.id) as member_count,
        COALESCE(cp.total_credits, 0) as total_credits,
        COALESCE(cp.used_credits, 0) as used_credits
      FROM organizations o
      JOIN users u ON o.owner_id = u.id
      LEFT JOIN organization_members om ON o.id = om.organization_id
      LEFT JOIN credit_pools cp ON o.id = cp.organization_id
      WHERE LOWER(o.name) LIKE LOWER('%${search.replace(/'/g, "''")}%')
      GROUP BY o.id, o.name, o.plan, o.max_members, u.email, cp.total_credits, cp.used_credits
      LIMIT 1
    `);

    if (!org || org === 'No result') {
      await bot.sendMessage(msg.chat.id, `⚠️ Équipe "${search}" introuvable.`);
      return;
    }

    const [orgId, name, plan, maxMembers, ownerEmail, memberCount, totalCr, usedCr] = org.split('|');
    const poolRemaining = parseInt(totalCr || '0') - parseInt(usedCr || '0');

    // Get members usage
    const members = await dbQuery(`
      SELECT u.display_name, om.role,
        (SELECT COUNT(*) FROM llm_usage_log lul WHERE lul.user_id = u.id AND lul.created_at > NOW() - INTERVAL '7 days') as agent_uses,
        (SELECT COALESCE(SUM(credits_used), 0) FROM credit_usage_log cul WHERE cul.user_id = u.id AND cul.organization_id = '${orgId}' AND cul.created_at > NOW() - INTERVAL '7 days') as credits_used
      FROM organization_members om
      JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = '${orgId}'
      ORDER BY credits_used DESC
    `);

    // Get top agents
    const topAgents = await dbQuery(`
      SELECT cul.agent_id, COUNT(*) as uses
      FROM credit_usage_log cul
      WHERE cul.organization_id = '${orgId}' AND cul.created_at > NOW() - INTERVAL '7 days'
      GROUP BY cul.agent_id ORDER BY uses DESC LIMIT 5
    `);

    let teamMsg = `👥 *${name}*\n\n`;
    teamMsg += `Membres : ${memberCount} / ${maxMembers}\n`;
    teamMsg += `Owner : ${ownerEmail}\n`;
    teamMsg += `Plan : ${plan}\n`;
    teamMsg += `Pool crédits : ${usedCr} / ${totalCr} (${poolRemaining} restants)\n\n`;

    teamMsg += `📊 *Usage 7j :*\n`;
    if (members) {
      for (const line of members.split('\n').filter(Boolean)) {
        const [mName, mRole, mAgents, mCredits] = line.split('|');
        teamMsg += `• ${mName} (${mRole}) — ${mAgents} agents | ${mCredits} crédits\n`;
      }
    }

    teamMsg += `\n🤖 *Top agents :*\n`;
    if (topAgents && topAgents !== 'No result') {
      for (const line of topAgents.split('\n').filter(Boolean)) {
        const [agentId, uses] = line.split('|');
        teamMsg += `• ${agentId} — ${uses} utilisations\n`;
      }
    }

    await bot.sendMessage(msg.chat.id, teamMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '💳 Ajouter crédits', callback_data: `team_add_credits_${orgId}` },
          { text: '👤 Gérer membres', callback_data: `team_members_${orgId}` },
          { text: '⚙️ Settings', callback_data: `team_settings_${orgId}` },
        ]],
      },
    });
  });

  // ── /tickets ──
  bot.onText(/\/tickets/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const tickets = await dbQuery(`
      SELECT id, visitor_email, subject, status, priority,
        to_char(created_at, 'DD/MM HH24:MI') as created
      FROM support_tickets
      WHERE status != 'closed'
      ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 ELSE 3 END, created_at DESC
      LIMIT 15
    `);

    if (!tickets || tickets === 'No result') {
      await bot.sendMessage(msg.chat.id, '✅ Aucun ticket ouvert.');
      return;
    }

    let ticketsMsg = '🎫 *Tickets Support*\n\n';
    for (const line of tickets.split('\n').filter(Boolean)) {
      const [id, email, subject, status, priority, created] = line.split('|');
      const badge = priority === 'urgent' ? '🔴' : priority === 'high' ? '🟡' : '🟢';
      ticketsMsg += `${badge} *${(subject || '').slice(0, 40)}*\n   ${email} · ${status} · ${created}\n   ID: \`${(id || '').slice(0, 8)}\`\n\n`;
    }

    await bot.sendMessage(msg.chat.id, ticketsMsg, { parse_mode: 'Markdown' });
  });

  // ── /referrals ──
  bot.onText(/\/referrals/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const stats = await dbQuery(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'rewarded' THEN 1 END) as activated,
        COALESCE(SUM(CASE WHEN status = 'rewarded' THEN reward_referrer END), 0) as credits_given
      FROM referrals
    `);

    const topReferrers = await dbQuery(`
      SELECT u.display_name, COUNT(r.id) as refs, SUM(r.reward_referrer) as earned
      FROM referrals r JOIN users u ON r.referrer_id = u.id
      WHERE r.status = 'rewarded'
      GROUP BY u.id, u.display_name ORDER BY refs DESC LIMIT 5
    `);

    const [total, activated, creditsGiven] = (stats || '0|0|0').split('|');

    let msg2 = `🎁 *Parrainages*\n\n`;
    msg2 += `Total : ${total}\n`;
    msg2 += `Activés : ${activated}\n`;
    msg2 += `Crédits distribués : ${creditsGiven}\n\n`;

    if (topReferrers && topReferrers !== 'No result') {
      msg2 += `🏆 *Top parrains :*\n`;
      for (const line of topReferrers.split('\n').filter(Boolean)) {
        const [name, refs, earned] = line.split('|');
        msg2 += `• ${name} — ${refs} filleuls · ${earned} crédits\n`;
      }
    }

    await bot.sendMessage(msg.chat.id, msg2, { parse_mode: 'Markdown' });
  });
}
