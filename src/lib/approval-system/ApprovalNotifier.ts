/**
 * Approval System — Notifier
 * Envoie les notifications via email, Telegram, WhatsApp, in-app
 */
import { spawn } from 'child_process';
import type { ApprovalQueueItem, ApprovalSettings } from './approval-types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freenzy.io';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';

export class ApprovalNotifier {
  /**
   * Notify via all configured channels
   */
  async notify(item: ApprovalQueueItem, settings: ApprovalSettings): Promise<void> {
    // Check quiet hours
    if (this.isQuietHours(settings) && item.priority !== 'urgent') {
      return;
    }

    const channels = settings.notification_channels || ['inapp'];
    const sentVia: string[] = [];

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmail(item, settings.user_id);
            sentVia.push('email');
            break;
          case 'telegram':
            if (settings.telegram_chat_id) {
              await this.sendTelegram(item, settings.telegram_chat_id);
              sentVia.push('telegram');
            }
            break;
          case 'whatsapp':
            if (settings.whatsapp_number) {
              await this.sendWhatsApp(item, settings.whatsapp_number);
              sentVia.push('whatsapp');
            }
            break;
          case 'inapp':
            await this.sendInApp(item, settings.user_id);
            sentVia.push('inapp');
            break;
        }
      } catch (err) {
        console.error(`[ApprovalNotifier] ${channel} failed:`, err instanceof Error ? err.message : err);
      }
    }

    // Update notification_sent_via
    if (sentVia.length > 0) {
      try {
        await this.dbQuery(`
          UPDATE approval_queue SET notification_sent_via = '${JSON.stringify(sentVia)}'::jsonb
          WHERE id = '${item.id}'
        `);
      } catch { /* silent */ }
    }
  }

  /**
   * Send email notification with approval buttons
   */
  async sendEmail(item: ApprovalQueueItem, userId: string): Promise<void> {
    // Get user email
    const email = await this.dbQuery(`SELECT email FROM users WHERE id = '${userId}'`);
    if (!email) return;

    const approveUrl = `${APP_URL}/api/approval/${item.id}?action=approve&token=${this.generateToken(item.id)}`;
    const rejectUrl = `${APP_URL}/api/approval/${item.id}?action=reject&token=${this.generateToken(item.id)}`;
    const postponeUrl = `${APP_URL}/api/approval/${item.id}?action=postpone&token=${this.generateToken(item.id)}`;
    const modifyUrl = `${APP_URL}/api/approval/${item.id}?action=modify&token=${this.generateToken(item.id)}`;

    const expiresIn = Math.max(0, Math.round((new Date(item.expires_at).getTime() - Date.now()) / 3600000));
    const accentColor = this.getAccentColor(item.action_type);

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;">
  <tr><td style="height:4px;background:${accentColor};"></td></tr>
  <tr><td style="padding:24px 32px 16px;">
    <div style="font-size:15px;font-weight:700;color:#1A1A1A;letter-spacing:-0.02em;">freenzy.io</div>
  </td></tr>
  <tr><td style="padding:0 32px 16px;">
    <h1 style="font-size:20px;font-weight:600;color:#1A1A1A;margin:0;">Action en attente de votre validation</h1>
  </td></tr>
  <tr><td style="padding:0 32px 16px;">
    <span style="display:inline-block;padding:4px 12px;border-radius:12px;background:${accentColor}15;color:${accentColor};font-size:12px;font-weight:600;">${item.action_type.replace(/_/g, ' ').toUpperCase()}</span>
  </td></tr>
  <tr><td style="padding:0 32px 16px;">
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:8px;">${item.action_title}</div>
      <div style="font-size:13px;color:#6B7280;line-height:1.5;">${(item.preview_text || '').slice(0, 500)}</div>
    </div>
  </td></tr>
  <tr><td style="padding:0 32px 16px;">
    <div style="font-size:13px;color:#9CA3AF;">⏱ Expire dans ${expiresIn}h</div>
  </td></tr>
  <tr><td style="padding:0 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="24%" style="padding:4px;">
          <a href="${approveUrl}" style="display:block;padding:10px 8px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;text-align:center;">✅ Approuver</a>
        </td>
        <td width="24%" style="padding:4px;">
          <a href="${modifyUrl}" style="display:block;padding:10px 8px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;text-align:center;">✏️ Modifier</a>
        </td>
        <td width="24%" style="padding:4px;">
          <a href="${postponeUrl}" style="display:block;padding:10px 8px;background:#d97706;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;text-align:center;">⏰ Reporter</a>
        </td>
        <td width="24%" style="padding:4px;">
          <a href="${rejectUrl}" style="display:block;padding:10px 8px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;text-align:center;">❌ Refuser</a>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
    <div style="font-size:11px;color:#9CA3AF;">
      <a href="${APP_URL}/client/account" style="color:#6B7280;">Gérer toutes mes validations</a> · Freenzy.io
    </div>
  </td></tr>
</table>
</body></html>`;

    // Send via nodemailer (spawn node script)
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.log('[ApprovalNotifier] SMTP not configured, skipping email');
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
  to: '${email.trim()}',
  subject: 'Action en attente : ${item.action_title.replace(/'/g, "\\'")}',
  html: ${JSON.stringify(html)}
}).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
`;

    await new Promise<void>((resolve) => {
      const proc = spawn('node', ['-e', script]);
      proc.on('close', () => resolve());
    });
  }

  /**
   * Send Telegram notification with inline buttons
   */
  async sendTelegram(item: ApprovalQueueItem, chatId: string): Promise<void> {
    const expiresIn = Math.max(0, Math.round((new Date(item.expires_at).getTime() - Date.now()) / 3600000));

    const message = [
      `🔔 *Action en attente*`,
      '',
      `📋 ${item.action_title}`,
      `📅 Créé : ${new Date(item.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
      `⏱ Expire dans : ${expiresIn}h`,
      '',
      `📝 Aperçu :`,
      `${(item.preview_text || '').slice(0, 200)}...`,
    ].join('\n');

    const keyboard = JSON.stringify({
      inline_keyboard: [
        [
          { text: '✅ Approuver', callback_data: `approve_${item.id}` },
          { text: '✏️ Modifier', callback_data: `modify_${item.id}` },
        ],
        [
          { text: '⏰ +24h', callback_data: `postpone_24h_${item.id}` },
          { text: '❌ Refuser', callback_data: `reject_${item.id}` },
        ],
      ],
    });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }),
      });
    } catch { /* silent */ }
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(item: ApprovalQueueItem, phoneNumber: string): Promise<void> {
    // Uses Twilio WhatsApp if configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    if (!twilioSid) return;

    const message = `🔔 Freenzy — Action en attente\n\n${item.action_title}\n\nExpire dans ${Math.round((new Date(item.expires_at).getTime() - Date.now()) / 3600000)}h\n\nRépondez:\n✅ pour approuver\n❌ pour refuser\n⏰ pour reporter`;

    const script = `
const twilio = require('twilio')('${process.env.TWILIO_ACCOUNT_SID}', '${process.env.TWILIO_AUTH_TOKEN}');
twilio.messages.create({
  body: ${JSON.stringify(message)},
  from: 'whatsapp:${process.env.TWILIO_WHATSAPP_FROM || '+14155238886'}',
  to: 'whatsapp:${phoneNumber}'
}).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
`;

    await new Promise<void>((resolve) => {
      const proc = spawn('node', ['-e', script]);
      proc.on('close', () => resolve());
    });
  }

  /**
   * Send in-app notification
   */
  async sendInApp(item: ApprovalQueueItem, userId: string): Promise<void> {
    try {
      await this.dbQuery(`
        INSERT INTO notifications (user_id, type, title, body, action_url, read, created_at)
        VALUES ('${userId}', 'approval', '${item.action_title.replace(/'/g, "''")}', '${(item.preview_text || '').replace(/'/g, "''")}', '/client/account?tab=approvals&id=${item.id}', false, NOW())
      `);
    } catch { /* table may not exist yet */ }
  }

  /**
   * Notify Emmanuel directly (always via Telegram)
   */
  async notifyEmmanuel(type: string, data: Record<string, unknown>, urgent = false): Promise<void> {
    if (urgent || !this.isQuietHoursForAdmin()) {
      const message = this.formatAdminNotification(type, data);
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) return;

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      } catch { /* silent */ }
    }
  }

  // ─── Helpers ─────────────────────────────────────────────

  private isQuietHours(settings: ApprovalSettings): boolean {
    if (!settings.quiet_hours_start || !settings.quiet_hours_end) return false;
    const now = new Date();
    const hour = now.getHours();
    const start = parseInt(settings.quiet_hours_start.split(':')[0] || '22');
    const end = parseInt(settings.quiet_hours_end.split(':')[0] || '7');
    if (start > end) return hour >= start || hour < end; // overnight
    return hour >= start && hour < end;
  }

  private isQuietHoursForAdmin(): boolean {
    const hour = new Date().getUTCHours() + 3; // UTC+3 Israel
    return hour >= 23 || hour < 6;
  }

  private generateToken(itemId: string): string {
    // Simple HMAC-like token (in prod, use JWT)
    const secret = process.env.JWT_SECRET || 'freenzy-approval-secret';
    return Buffer.from(`${itemId}:${secret}:${Date.now()}`).toString('base64url');
  }

  private getAccentColor(actionType: string): string {
    const colors: Record<string, string> = {
      send_email: '#2563eb',
      send_sms: '#16a34a',
      send_whatsapp: '#25D366',
      post_social: '#8B5CF6',
      generate_document: '#0EA5E9',
      generate_invoice: '#D97706',
      publish_content: '#EC4899',
      credit_user: '#16a34a',
      debit_user: '#DC2626',
      admin_alert: '#DC2626',
      broadcast: '#F59E0B',
      default: '#1A1A1A',
    };
    return colors[actionType] || colors['default'] || '#1A1A1A';
  }

  private formatAdminNotification(type: string, data: Record<string, unknown>): string {
    switch (type) {
      case 'error_critical':
        return `🚨 *ERREUR CRITIQUE*\n\nService: ${data.service}\nMessage: ${data.message}\n\nAction requise immédiatement.`;
      case 'new_user':
        return `👤 *Nouveau user*\n\n${data.email}\nProfession: ${data.profession}\nVille: ${data.city}`;
      case 'payment_failed':
        return `💳 *Paiement échoué*\n\n${data.email}\nMontant: ${data.amount}€\nErreur: ${data.error}`;
      default:
        return `📋 *${type}*\n\n${JSON.stringify(data, null, 2).slice(0, 500)}`;
    }
  }

  private async dbQuery(sql: string): Promise<string> {
    return new Promise((resolve) => {
      const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
      });
      let out = '';
      proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
      proc.on('close', () => resolve(out.trim()));
    });
  }
}
