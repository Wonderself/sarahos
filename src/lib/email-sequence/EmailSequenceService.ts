/**
 * Email Sequence Service — Process scheduled emails
 * Integrates with approval system and team workflows
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

export class EmailSequenceService {
  /**
   * Process all due emails from the sequence log
   */
  static async processDueEmails(): Promise<number> {
    const dueEmails = await dbQuery(`
      SELECT esl.id, esl.user_id, esl.sequence_type, esl.step_number, u.email, u.display_name, up.profession
      FROM email_sequence_log esl
      JOIN users u ON esl.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE esl.scheduled_for <= NOW() AND esl.status = 'scheduled'
      ORDER BY esl.scheduled_for ASC
      LIMIT 50
    `);

    if (!dueEmails) return 0;

    const lines = dueEmails.split('\n').filter(Boolean);
    let processed = 0;

    for (const line of lines) {
      const [eslId, userId, seqType, step, email, name, profession] = line.split('|');
      if (!eslId || !userId) continue;

      try {
        // Check if user is in an org with approval workflows
        const workflow = await dbQuery(`
          SELECT aw.auto_approve_for FROM approval_workflows aw
          JOIN organization_members om ON aw.organization_id = om.organization_id
          WHERE om.user_id = '${userId}' AND aw.action_type = 'send_email'
          LIMIT 1
        `);

        const autoApprove = workflow && workflow.includes('member');

        if (autoApprove) {
          // Auto-approve: send directly
          await this.sendEmail(eslId, userId, email || '', name || '', profession || 'pme', seqType || '', parseInt(step || '0'));
          await dbQuery(`UPDATE email_sequence_log SET status = 'sent', sent_at = NOW() WHERE id = '${eslId}'`);
        } else {
          // Create approval queue entry
          await dbQuery(`
            INSERT INTO approval_queue (id, user_id, agent_id, action_type, action_title, action_payload, target, status, priority, preview_text, created_at, expires_at, postpone_count, reminder_count, notification_sent_via)
            VALUES (
              'apv_email_${eslId}',
              '${userId}',
              'email-marketing',
              'send_email',
              'Email séquence: ${(seqType || '').replace(/'/g, "''")} étape ${step}',
              '{"email_log_id": "${eslId}", "to": "${email}", "sequence": "${seqType}", "step": ${step}}'::jsonb,
              'user',
              'pending',
              'normal',
              'Email ${seqType} étape ${step} pour ${(name || '').replace(/'/g, "''")}',
              NOW(),
              NOW() + INTERVAL '48 hours',
              0, 0, '{}'
            )
          `);
          await dbQuery(`UPDATE email_sequence_log SET status = 'pending_approval' WHERE id = '${eslId}'`);
        }

        processed++;
      } catch (err) {
        console.error(`[EmailSequence] Error processing ${eslId}:`, err instanceof Error ? err.message : err);
        await dbQuery(`UPDATE email_sequence_log SET status = 'error', error_message = '${(err instanceof Error ? err.message : String(err)).replace(/'/g, "''")}' WHERE id = '${eslId}'`).catch(() => {});
      }
    }

    return processed;
  }

  /**
   * Send an individual email (called after approval or auto-approve)
   */
  private static async sendEmail(
    eslId: string,
    _userId: string,
    to: string,
    name: string,
    profession: string,
    seqType: string,
    step: number,
  ): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost || !to) {
      console.log(`[EmailSequence] SMTP not configured or no email for ${eslId}`);
      return;
    }

    const subject = this.getSubject(seqType, step, name);
    const body = this.getBody(seqType, step, name, profession);

    const script = `
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: '${process.env.SMTP_HOST}',
  port: ${process.env.SMTP_PORT || 587},
  auth: { user: '${process.env.SMTP_USER}', pass: '${process.env.SMTP_PASS}' }
});
t.sendMail({
  from: '"Freenzy.io" <${process.env.SMTP_USER || 'noreply@freenzy.io'}>',
  to: '${to}',
  subject: ${JSON.stringify(subject)},
  html: ${JSON.stringify(body)}
}).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
`;

    await new Promise<void>((resolve) => {
      const proc = spawn('node', ['-e', script]);
      proc.on('close', () => resolve());
    });

    // Log
    await dbQuery(`
      INSERT INTO cron_logs (cron_name, status, message, created_at)
      VALUES ('email_sequence', 'success', 'Sent ${seqType} step ${step} to ${to}', NOW())
    `).catch(() => {});
  }

  private static getSubject(seqType: string, step: number, name: string): string {
    const subjects: Record<string, string[]> = {
      welcome: ['Bienvenue sur Freenzy.io !'],
      getting_started: [`${name}, vos 3 premières actions`],
      success_story: ['Comment une PME a automatisé 80% de son admin'],
      features: [`${name}, découvrez ces fonctionnalités`],
      testimonials: ['Ce que nos utilisateurs en disent'],
      offer: ['Offre spéciale — 30% de crédits en plus'],
      reactivation: [`${name}, on vous attend !`],
    };
    return subjects[seqType]?.[0] || `Freenzy.io — Message ${step}`;
  }

  private static getBody(seqType: string, step: number, name: string, profession: string): string {
    return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,sans-serif;">
<table width="100%" style="max-width:600px;margin:0 auto;background:#fff;">
<tr><td style="padding:24px 32px;">
<div style="font-size:15px;font-weight:700;color:#1A1A1A;">freenzy.io</div>
<h1 style="font-size:20px;margin:16px 0 8px;">${this.getSubject(seqType, step, name)}</h1>
<p style="color:#6B6B6B;line-height:1.6;">Bonjour ${name},</p>
<p style="color:#6B6B6B;line-height:1.6;">Cet email fait partie de votre séquence ${seqType} (étape ${step}).</p>
<p style="color:#6B6B6B;line-height:1.6;">Votre profil : ${profession}</p>
<a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://freenzy.io'}/client/dashboard" style="display:inline-block;padding:12px 24px;background:#1A1A1A;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">Accéder à mon espace</a>
<p style="font-size:12px;color:#9B9B9B;margin-top:24px;">Emmanuel Smadja — Fondateur Freenzy.io<br>
<a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://freenzy.io'}/unsubscribe" style="color:#9B9B9B;">Se désabonner</a></p>
</td></tr></table></body></html>`;
  }
}
