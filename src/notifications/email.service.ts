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

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px 24px;text-align:center;">
      <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;">F</div>
      <h1 style="color:white;font-size:22px;margin:12px 0 0;font-weight:700;">${title}</h1>
    </div>
    <div style="padding:32px 24px;">
      ${body}
    </div>
    <div style="padding:16px 24px;background:#f8f9fa;text-align:center;font-size:12px;color:#9ca3af;">
      <p style="margin:0;">Freenzy.io — Vos employes IA 24/7</p>
      <p style="margin:4px 0 0;">Cet email a ete envoye automatiquement, ne repondez pas directement.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendConfirmationEmail(email: string, name: string, token: string): Promise<boolean> {
  const confirmUrl = `${config.APP_URL}/api/auth/confirm-email?token=${token}`;

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Merci de vous etre inscrit(e) sur Freenzy.io ! Pour confirmer votre adresse email, cliquez sur le bouton ci-dessous :
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
    subject: 'Confirmez votre email — Freenzy.io',
    html: emailTemplate('Confirmez votre email', body),
  });
}

// ─── Email Sequence: J+0 Welcome ───

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const loginUrl = `${config.APP_URL}/login`;

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Bienvenue sur Freenzy.io ! Votre compte est pret et <strong>50 credits gratuits</strong> vous attendent deja.
    </p>
    <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
      <p style="margin:0 0 12px;font-size:15px;color:#16a34a;font-weight:700;">3 choses a faire maintenant :</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;color:#4b5563;line-height:1.8;">
        <li><strong>Activez le Repondeur IA</strong> — Repondez a vos clients 24/7 sans lever le petit doigt</li>
        <li><strong>Generez votre premier document</strong> — Contrat, devis ou facture en 30 secondes</li>
        <li><strong>Programmez votre briefing matinal</strong> — Votre journee organisee avant meme le cafe</li>
      </ol>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        Commencer maintenant
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
      Vous avez des questions ? Repondez simplement a cet email, notre equipe est la pour vous.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Bienvenue sur Freenzy.io — 50 credits offerts !',
    html: emailTemplate('Bienvenue sur Freenzy.io', body),
  });
}

// ─── Email Sequence: J+2 Getting Started ───

export async function sendGettingStartedEmail(email: string, name: string): Promise<boolean> {
  const dashboardUrl = `${config.APP_URL}/client/dashboard`;

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Ca fait 2 jours que vous etes sur Freenzy.io. Voici quelques astuces pour en tirer le maximum :
    </p>
    <div style="margin:20px 0;">
      <div style="padding:16px;background:#f5f3ff;border-radius:10px;border-left:4px solid #7c3aed;margin-bottom:12px;">
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">Astuce #1 : Personnalisez vos agents</p>
        <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">Chaque agent peut etre adapte a votre ton, vos horaires et votre secteur d'activite. Plus ils vous connaissent, plus ils sont efficaces.</p>
      </div>
      <div style="padding:16px;background:#ecfdf5;border-radius:10px;border-left:4px solid #10b981;margin-bottom:12px;">
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">Astuce #2 : Utilisez le chat</p>
        <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">Posez vos questions en langage naturel a n'importe quel agent. Pas de menu complique, juste une conversation.</p>
      </div>
      <div style="padding:16px;background:#eff6ff;border-radius:10px;border-left:4px solid #3b82f6;margin-bottom:12px;">
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">Astuce #3 : Explorez le Marketplace</p>
        <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">48 templates prets a l'emploi — 23 gratuits. Installez ceux qui correspondent a votre metier en un clic.</p>
      </div>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        Retourner sur mon dashboard
      </a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Vos 3 astuces pour bien demarrer — Freenzy.io',
    html: emailTemplate('Guide premiers pas', body),
  });
}

// ─── Email Sequence: J+5 Success Story ───

export async function sendSuccessStoryEmail(email: string, name: string): Promise<boolean> {
  const dashboardUrl = `${config.APP_URL}/client/dashboard`;

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${name}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;">
      Decouvrez comment Marie, restauratrice a Lyon, utilise Freenzy.io au quotidien :
    </p>
    <div style="margin:20px 0;padding:20px;background:#fefce8;border-radius:12px;border:1px solid #fde68a;">
      <p style="margin:0 0 8px;font-size:16px;color:#92400e;font-weight:700;">"J'ai recupere 15h par semaine"</p>
      <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;font-style:italic;">
        "Avant Freenzy, je passais mes soirees a repondre aux messages, faire les plannings et gerer la compta.
        Maintenant, le Repondeur gere les reservations, l'agent RH fait les plannings, et mon briefing matinal
        me donne tout ce que je dois savoir en 2 minutes."
      </p>
      <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">Marie D. — Restauratrice, Lyon</p>
    </div>
    <div style="margin:24px 0;padding:16px;background:#f8f9fa;border-radius:10px;">
      <p style="margin:0 0 12px;font-size:14px;color:#111827;font-weight:600;">Ce que Marie utilise le plus :</p>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#4b5563;line-height:1.8;">
        <li>Repondeur IA — 200+ messages geres automatiquement par mois</li>
        <li>Briefing matinal — Chaque jour a 7h, avec meteo + agenda + chiffres</li>
        <li>Generateur de documents — Contrats saisonniers generes en 1 clic</li>
      </ul>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        Essayer ces fonctionnalites
      </a>
    </div>
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
      Vous avez aussi une histoire a raconter ? Repondez a cet email, on adore les retours de nos utilisateurs.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: '"J\'ai recupere 15h par semaine" — Temoignage Freenzy.io',
    html: emailTemplate('Cas d\'usage inspirant', body),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
  const resetUrl = `${config.APP_URL}/login?mode=reset&token=${token}`;

  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;">Bonjour <strong>${name}</strong>,</p>
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
    subject: 'Reinitialisation de mot de passe — Freenzy.io',
    html: emailTemplate('Mot de passe oublie ?', body),
  });
}
