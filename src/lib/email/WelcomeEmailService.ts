/**
 * Welcome Email Service — Sends personalized welcome or invitation emails
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freenzy.io';

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

function renderTemplate(templateName: string, variables: Record<string, string>): string {
  const templatePath = path.join(process.cwd(), 'emails', 'templates', templateName);
  if (!fs.existsSync(templatePath)) {
    console.error(`[WelcomeEmail] Template not found: ${templatePath}`);
    return '';
  }

  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace all {{VARIABLE}} occurrences
  for (const [key, value] of Object.entries(variables)) {
    const safe = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
  }

  // Log missing variables
  const missing = html.match(/\{\{[A-Za-z_]+\}\}/g);
  if (missing) {
    console.warn(`[WelcomeEmail] Missing variables in ${templateName}: ${missing.join(', ')}`);
  }

  return html;
}

export class WelcomeEmailService {
  /**
   * Send welcome or invitation email to a new user
   */
  static async sendWelcomeEmail(userId: string): Promise<void> {
    // Get user data
    const userData = await dbQuery(`
      SELECT u.email, u.display_name, u.credits,
        up.profession, up.city, up.custom_request,
        bi.nom as business_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN business_info bi ON u.id = bi.user_id
      WHERE u.id = '${userId}'
    `);

    if (!userData) {
      console.error(`[WelcomeEmail] User ${userId} not found`);
      return;
    }

    const [email, displayName, credits, profession, , customRequest, businessName] = userData.split('|');
    if (!email) return;

    const prenom = (displayName || '').split(' ')[0] || 'Bonjour';
    const nom = (displayName || '').split(' ').slice(1).join(' ') || '';

    // Check if user was invited to an org
    const orgData = await dbQuery(`
      SELECT o.name, om.role, u2.display_name as inviter_name,
        COALESCE(cp.total_credits - cp.used_credits, 0) as pool_credits
      FROM organization_members om
      JOIN organizations o ON om.organization_id = o.id
      JOIN users u2 ON om.invited_by = u2.id
      LEFT JOIN credit_pools cp ON o.id = cp.organization_id
      WHERE om.user_id = '${userId}' AND om.invited_by IS NOT NULL
      LIMIT 1
    `);

    let templateName: string;
    let subject: string;
    const variables: Record<string, string> = {
      prenom,
      nom,
      profession: profession || 'professionnel',
      credits: String(Math.round(parseInt(credits || '0') / 1_000_000)),
      dashboard_url: `${APP_URL}/client/dashboard`,
      custom_request: customRequest || '',
      agent_recommande: 'briefing-matinal',
      business_name: businessName || '',
      UNSUBSCRIBE_URL: `${APP_URL}/unsubscribe`,
    };

    if (orgData && orgData !== '') {
      // Invitation email
      const [orgName, role, inviterName, poolCredits] = orgData.split('|');
      templateName = 'welcome-invitation.html';
      subject = `${inviterName} vous invite à rejoindre ${orgName} sur Freenzy`;
      variables['inviter_name'] = inviterName || '';
      variables['org_name'] = orgName || '';
      variables['role'] = this.translateRole(role || 'member');
      variables['pool_credits'] = String(Math.round(parseInt(poolCredits || '0') / 1_000_000));
      variables['agent_list'] = 'Briefing matinal, Documents, Email marketing';
      variables['invite_url'] = `${APP_URL}/client/dashboard?welcome=true`;
    } else {
      // Regular welcome email by profession
      const profKey = (profession || 'autre').toLowerCase().replace(/[éè]/g, 'e').replace(/[àâ]/g, 'a');
      const validProfiles = ['artisan', 'sante', 'agence', 'ecommerce', 'coach', 'restaurant', 'liberal', 'pme', 'immo', 'particulier'];
      const profile = validProfiles.includes(profKey) ? profKey : 'autre';
      templateName = `welcome-${profile}.html`;
      subject = `${prenom}, bienvenue sur Freenzy.io !`;
    }

    const html = renderTemplate(templateName, variables);
    if (!html) return;

    // Send email
    await this.sendEmail(email, subject, html);

    // Update records
    await dbQuery(`
      UPDATE user_profiles SET welcome_email_sent_at = NOW() WHERE user_id = '${userId}'
    `).catch(() => {});

    await dbQuery(`
      INSERT INTO email_sequence_log (user_id, sequence_type, step_number, status, sent_at, created_at)
      VALUES ('${userId}', 'welcome', 0, 'sent', NOW(), NOW())
    `).catch(() => {});

    console.log(`[WelcomeEmail] Sent ${templateName} to ${email}`);
  }

  private static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.log(`[WelcomeEmail] SMTP not configured, skipping`);
      return;
    }

    const script = `
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: '${process.env.SMTP_HOST}',
  port: ${process.env.SMTP_PORT || 587},
  auth: { user: '${process.env.SMTP_USER}', pass: '${process.env.SMTP_PASS}' }
});
t.sendMail({
  from: '"Freenzy.io" <${process.env.SMTP_USER || 'noreply@freenzy.io'}>',
  to: ${JSON.stringify(to)},
  subject: ${JSON.stringify(subject)},
  html: ${JSON.stringify(html)}
}).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
`;

    await new Promise<void>((resolve) => {
      const proc = spawn('node', ['-e', script]);
      proc.on('close', () => resolve());
    });
  }

  private static translateRole(role: string): string {
    const roles: Record<string, string> = {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      member: 'Membre',
      viewer: 'Observateur',
    };
    return roles[role] || role;
  }
}
