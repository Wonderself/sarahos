import { config } from '../utils/config';
import { logger } from '../utils/logger';

/**
 * Email service using Resend API (or fallback to log-only).
 * If RESEND_API_KEY is not configured, emails are logged but not sent.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = config.RESEND_API_KEY;

  if (!apiKey) {
    logger.info('Email (no RESEND_API_KEY, log-only)', { to: params.to, subject: params.subject });
    logger.debug('Email HTML content', { html: params.html.substring(0, 500) });
    return true; // Don't fail if email not configured
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      logger.error('Resend API error', { status: res.status, error, to: params.to });
      return false;
    }

    const data = await res.json() as { id?: string };
    logger.info('Email sent via Resend', { to: params.to, id: data.id });
    return true;
  } catch (e) {
    logger.error('Failed to send email', { to: params.to, error: e });
    return false;
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function emailTemplate(title: string, body: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px 24px;text-align:center;">
      <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;">S</div>
      <h1 style="color:white;font-size:22px;margin:12px 0 0;font-weight:700;">${safeTitle}</h1>
    </div>
    <div style="padding:32px 24px;">
      ${body}
    </div>
    <div style="padding:16px 24px;background:#f8f9fa;text-align:center;font-size:12px;color:#9ca3af;">
      <p style="margin:0;">SARAH OS — Vos employes IA 24/7</p>
      <p style="margin:4px 0 0;">Cet email a ete envoye automatiquement, ne repondez pas directement.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendConfirmationEmail(email: string, name: string, token: string): Promise<boolean> {
  const confirmUrl = `${config.APP_URL}/api/auth/confirm-email?token=${token}`;
  const safeName = escapeHtml(name);

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Merci de vous etre inscrit(e) sur SARAH OS ! Pour confirmer votre adresse email, cliquez sur le bouton ci-dessous :
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${confirmUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        Confirmer mon email
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${confirmUrl}" style="color:#6366f1;word-break:break-all;">${confirmUrl}</a>
    </p>
    <p style="font-size:13px;color:#9ca3af;">Ce lien expire dans 24 heures.</p>
    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
      <p style="margin:0;font-size:14px;color:#16a34a;font-weight:600;">🎁 50 credits offerts !</p>
      <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">Votre bonus d'inscription vous attend deja dans votre portefeuille.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirmez votre email — SARAH OS',
    html: emailTemplate('Confirmez votre email', body),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
  const resetUrl = `${config.APP_URL}/login?mode=reset&token=${token}`;
  const safeName = escapeHtml(name);

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#a855f7);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        Reinitialiser mon mot de passe
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
      Si le bouton ne fonctionne pas, copiez ce lien :<br>
      <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="font-size:13px;color:#9ca3af;">Ce lien expire dans 1 heure.</p>
    <div style="margin-top:24px;padding:16px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:13px;color:#92400e;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre compte est en securite.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reinitialisation de mot de passe — SARAH OS',
    html: emailTemplate('Mot de passe oublie ?', body),
  });
}
