/**
 * Briefing Service — Morning & Evening briefs personalized by profile
 */
import { spawn } from 'child_process';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

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

interface UserBriefData {
  userId: string;
  email: string;
  displayName: string;
  profession: string;
  credits: number;
  pendingApprovals: number;
  orgName: string | null;
  teamActiveMembers: number;
  teamPoolCredits: number;
}

export class BriefingService {
  static async sendMorningBriefings(): Promise<number> {
    // Get all active users (last 30 days)
    const users = await dbQuery(`
      SELECT u.id, u.email, u.display_name, up.profession, u.credits,
        (SELECT COUNT(*) FROM approval_queue aq WHERE aq.user_id = u.id AND aq.status = 'pending') as pending,
        o.name as org_name,
        (SELECT COUNT(*) FROM organization_members om2 WHERE om2.organization_id = om.organization_id) as team_size,
        COALESCE(cp.total_credits - cp.used_credits, 0) as pool_credits
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN organization_members om ON u.id = om.user_id
      LEFT JOIN organizations o ON om.organization_id = o.id
      LEFT JOIN credit_pools cp ON o.id = cp.organization_id
      WHERE u.last_login_at > NOW() - INTERVAL '30 days'
      LIMIT 500
    `);

    if (!users) return 0;

    const lines = users.split('\n').filter(Boolean);
    let sent = 0;

    for (const line of lines) {
      const parts = line.split('|');
      const data: UserBriefData = {
        userId: parts[0] || '',
        email: parts[1] || '',
        displayName: parts[2] || '',
        profession: parts[3] || 'pme',
        credits: parseInt(parts[4] || '0'),
        pendingApprovals: parseInt(parts[5] || '0'),
        orgName: parts[6] || null,
        teamActiveMembers: parseInt(parts[7] || '0'),
        teamPoolCredits: parseInt(parts[8] || '0'),
      };

      try {
        const brief = await this.generateBrief(data);
        if (brief) {
          // Store as notification in-app
          await dbQuery(`
            INSERT INTO notifications (user_id, type, title, body, read, created_at)
            VALUES ('${data.userId}', 'briefing', 'Briefing du jour', '${brief.replace(/'/g, "''")}', false, NOW())
          `).catch(() => {});
          sent++;
        }
      } catch { /* skip user */ }
    }

    return sent;
  }

  static async sendEveningSummaries(): Promise<number> {
    // Simplified evening summary
    const activeUsers = await dbQuery(`
      SELECT u.id, u.display_name, up.profession,
        (SELECT COUNT(*) FROM approval_queue WHERE user_id = u.id AND status = 'pending' AND expires_at < NOW() + INTERVAL '12 hours') as urgent_approvals
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.last_login_at > NOW() - INTERVAL '24 hours'
    `);

    if (!activeUsers) return 0;

    const lines = activeUsers.split('\n').filter(Boolean);
    let sent = 0;

    for (const line of lines) {
      const [userId, name, , urgentCount] = line.split('|');
      if (!userId) continue;

      const urgent = parseInt(urgentCount || '0');
      if (urgent > 0) {
        await dbQuery(`
          INSERT INTO notifications (user_id, type, title, body, read, created_at)
          VALUES ('${userId}', 'reminder', 'Résumé du soir', '⚠️ ${urgent} action(s) expirent bientôt. ${name || 'Bonjour'}, pensez à les traiter avant demain.', false, NOW())
        `).catch(() => {});
        sent++;
      }
    }

    return sent;
  }

  private static async generateBrief(data: UserBriefData): Promise<string | null> {
    const creditDisplay = Math.round(data.credits / 1_000_000);
    const teamContext = data.orgName
      ? `\n👥 Équipe ${data.orgName} : ${data.teamActiveMembers} membres | Pool: ${Math.round(data.teamPoolCredits / 1_000_000)} crédits`
      : '';

    const templates: Record<string, string> = {
      sante: `☀️ Dr ${data.displayName} — ${data.pendingApprovals} actions en attente | Crédits: ${creditDisplay}${teamContext}`,
      artisan: `☀️ ${data.displayName} — ${data.pendingApprovals} en attente | Crédits: ${creditDisplay}${teamContext}`,
      ecommerce: `☀️ ${data.displayName} — ${data.pendingApprovals} actions en attente | Crédits: ${creditDisplay}${teamContext}`,
      agence: `☀️ ${data.displayName} — ${data.pendingApprovals} actions en attente | Crédits: ${creditDisplay}${teamContext}`,
      coach: `☀️ ${data.displayName} — ${data.pendingApprovals} en attente | Crédits: ${creditDisplay}${teamContext}`,
      restaurant: `☀️ ${data.displayName} — ${data.pendingApprovals} actions en attente | Crédits: ${creditDisplay}${teamContext}`,
    };

    // Use Claude Haiku for personalized brief if API key available
    if (ANTHROPIC_API_KEY && data.pendingApprovals > 0) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{ role: 'user', content: `Génère un briefing matinal de 200 mots max pour ${data.displayName}, ${data.profession}. Crédits: ${creditDisplay}. ${data.pendingApprovals} actions en attente.${data.orgName ? ` Équipe: ${data.orgName}, ${data.teamActiveMembers} membres.` : ''} Ton motivant, 3 actions prioritaires. Français.` }],
          }),
        });
        if (res.ok) {
          const json = await res.json() as { content: { text: string }[] };
          return json.content[0]?.text || templates[data.profession] || templates['pme'] || null;
        }
      } catch { /* fallback to template */ }
    }

    return templates[data.profession] || templates['pme'] || `☀️ ${data.displayName} — Crédits: ${creditDisplay}${teamContext}`;
  }
}
