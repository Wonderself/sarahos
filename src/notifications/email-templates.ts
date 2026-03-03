// ---------------------------------------------------------------------------
// SARAH OS — Email Templates (French language, responsive HTML, inline CSS)
// ---------------------------------------------------------------------------

const BRAND_COLOR = '#6366f1';
const BRAND_GRADIENT = 'linear-gradient(135deg, #6366f1, #a855f7)';

// ---------------------------------------------------------------------------
// Utility: escape HTML entities
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Base layout wrapper
// ---------------------------------------------------------------------------

function baseLayout(title: string, bodyContent: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_GRADIENT};padding:32px 24px;text-align:center;">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.2);display:inline-block;line-height:48px;font-size:22px;font-weight:800;color:#ffffff;text-align:center;">S</div>
              <h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;font-weight:700;line-height:1.3;">${safeTitle}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background-color:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">SARAH OS — Vos employes IA, disponibles 24/7</p>
              <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;line-height:1.5;">
                Cet email a ete envoye automatiquement. Ne repondez pas directement.<br>
                <a href="{{unsubscribe_url}}" style="color:${BRAND_COLOR};text-decoration:underline;">Se desabonner</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Button helper
// ---------------------------------------------------------------------------

function ctaButton(text: string, href: string): string {
  return `<div style="text-align:center;margin:28px 0;">
  <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;background:${BRAND_GRADIENT};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;line-height:1;">${escapeHtml(text)}</a>
</div>`;
}

// ---------------------------------------------------------------------------
// 1. Welcome Email
// ---------------------------------------------------------------------------

export function welcomeEmail(userName: string): string {
  const safeName = escapeHtml(userName);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Bienvenue sur <strong>SARAH OS</strong> ! Nous sommes ravis de vous compter parmi nos utilisateurs.
    </p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Votre compte est actif et pret a l'emploi. Voici ce que vous pouvez faire des maintenant :
    </p>
    <ul style="font-size:14px;color:#4b5563;line-height:1.8;margin:0 0 16px;padding-left:20px;">
      <li>Deployer vos agents IA personnalises</li>
      <li>Automatiser vos taches repetitives</li>
      <li>Suivre vos performances en temps reel</li>
    </ul>
    <div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
      <p style="margin:0;font-size:14px;color:#16a34a;font-weight:600;">Bonus de bienvenue</p>
      <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">Des credits gratuits vous attendent dans votre portefeuille pour tester la plateforme.</p>
    </div>
    ${ctaButton('Acceder a mon tableau de bord', '{{dashboard_url}}')}
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
      Si vous avez la moindre question, notre equipe est la pour vous aider.
    </p>`;

  return baseLayout('Bienvenue sur SARAH OS', body);
}

// ---------------------------------------------------------------------------
// 2. Credit Low Warning Email
// ---------------------------------------------------------------------------

export function creditLowEmail(userName: string, balance: number): string {
  const safeName = escapeHtml(userName);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Votre solde de credits est bas. Il ne vous reste plus que <strong style="color:${BRAND_COLOR};">${balance} credits</strong>.
    </p>
    <div style="margin:24px 0;padding:16px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">Attention</p>
      <p style="margin:4px 0 0;font-size:13px;color:#92400e;">
        Lorsque votre solde atteint zero, vos agents IA seront mis en pause. Rechargez votre portefeuille pour eviter toute interruption de service.
      </p>
    </div>
    ${ctaButton('Recharger mes credits', '{{billing_url}}')}
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
      Vous pouvez aussi activer le rechargement automatique dans vos parametres de facturation.
    </p>`;

  return baseLayout('Solde de credits bas', body);
}

// ---------------------------------------------------------------------------
// 3. Referral Success Email
// ---------------------------------------------------------------------------

export function referralSuccessEmail(
  userName: string,
  referredName: string,
  rewardAmount: number,
): string {
  const safeName = escapeHtml(userName);
  const safeReferred = escapeHtml(referredName);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Bonne nouvelle ! <strong>${safeReferred}</strong> a rejoint SARAH OS grace a votre parrainage.
    </p>
    <div style="margin:24px 0;padding:20px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border-radius:12px;border:1px solid #c7d2fe;text-align:center;">
      <p style="margin:0;font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Recompense creditee</p>
      <p style="margin:8px 0 0;font-size:32px;color:#4f46e5;font-weight:800;line-height:1;">${rewardAmount}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#6366f1;">credits ajoutes a votre portefeuille</p>
    </div>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Continuez a partager votre lien de parrainage pour gagner encore plus de credits !
    </p>
    ${ctaButton('Voir mes parrainages', '{{referral_url}}')}`;

  return baseLayout('Parrainage reussi', body);
}

// ---------------------------------------------------------------------------
// 4. Weekly Digest Email
// ---------------------------------------------------------------------------

export function weeklyDigestEmail(
  userName: string,
  stats: { agentCalls: number; creditsUsed: number; topAgent: string },
): string {
  const safeName = escapeHtml(userName);
  const safeAgent = escapeHtml(stats.topAgent);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 24px;">
      Voici le resume de votre activite sur SARAH OS cette semaine :
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="padding:16px;background-color:#f9fafb;border-radius:10px;text-align:center;width:33%;">
          <p style="margin:0;font-size:24px;color:${BRAND_COLOR};font-weight:800;line-height:1;">${stats.agentCalls}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#6b7280;font-weight:500;">Appels d'agents</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background-color:#f9fafb;border-radius:10px;text-align:center;width:33%;">
          <p style="margin:0;font-size:24px;color:${BRAND_COLOR};font-weight:800;line-height:1;">${stats.creditsUsed}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#6b7280;font-weight:500;">Credits utilises</p>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background-color:#f9fafb;border-radius:10px;text-align:center;width:33%;">
          <p style="margin:0;font-size:14px;color:${BRAND_COLOR};font-weight:700;line-height:1.2;">${safeAgent}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#6b7280;font-weight:500;">Agent le plus actif</p>
        </td>
      </tr>
    </table>
    ${ctaButton('Voir le detail complet', '{{dashboard_url}}')}
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
      Ce resume est envoye chaque lundi. Vous pouvez modifier la frequence dans vos preferences.
    </p>`;

  return baseLayout('Votre resume hebdomadaire', body);
}

// ---------------------------------------------------------------------------
// 5. Password Reset Email
// ---------------------------------------------------------------------------

export function passwordResetEmail(userName: string, resetLink: string): string {
  const safeName = escapeHtml(userName);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
    </p>
    ${ctaButton('Reinitialiser mon mot de passe', resetLink)}
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 12px;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${resetLink}" style="color:${BRAND_COLOR};word-break:break-all;font-size:12px;">${escapeHtml(resetLink)}</a>
    </p>
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 16px;">
      Ce lien expire dans 1 heure.
    </p>
    <div style="margin:24px 0 0;padding:16px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
        Si vous n'avez pas fait cette demande, ignorez simplement cet email. Votre mot de passe actuel restera inchange et votre compte est en securite.
      </p>
    </div>`;

  return baseLayout('Reinitialisation du mot de passe', body);
}

// ---------------------------------------------------------------------------
// 6. Invoice / Receipt Email
// ---------------------------------------------------------------------------

export function invoiceEmail(
  userName: string,
  amount: number,
  invoiceId: string,
): string {
  const safeName = escapeHtml(userName);
  const safeInvoiceId = escapeHtml(invoiceId);
  const formattedAmount = amount.toFixed(2);
  const body = `
    <p style="font-size:15px;color:#111827;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${safeName}</strong>,</p>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 24px;">
      Merci pour votre paiement. Voici le recapitulatif de votre facture :
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr style="background-color:#f9fafb;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;">Numero de facture</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;">${safeInvoiceId}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;border-top:1px solid #e5e7eb;">Montant paye</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-top:1px solid #e5e7eb;font-weight:700;">${formattedAmount} EUR</td>
      </tr>
      <tr style="background-color:#f9fafb;">
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;border-top:1px solid #e5e7eb;">Date</td>
        <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-top:1px solid #e5e7eb;">${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;border-top:1px solid #e5e7eb;">Statut</td>
        <td style="padding:12px 16px;font-size:13px;text-align:right;border-top:1px solid #e5e7eb;"><span style="display:inline-block;padding:2px 10px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:12px;font-weight:600;">Paye</span></td>
      </tr>
    </table>
    ${ctaButton('Voir ma facture', '{{invoice_url}}')}
    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
      Vous pouvez retrouver toutes vos factures dans la section Facturation de votre tableau de bord.
    </p>`;

  return baseLayout('Confirmation de paiement', body);
}

// ---------------------------------------------------------------------------
// Generic template renderer with variable substitution
// ---------------------------------------------------------------------------

/**
 * Render an email template by name with variable substitution.
 *
 * Variables in templates use the `{{variable_name}}` syntax.
 * Common variables: `unsubscribe_url`, `dashboard_url`, `billing_url`,
 * `referral_url`, `invoice_url`.
 *
 * @param template - The template name (e.g. 'welcome', 'credit_low', etc.)
 * @param variables - Key-value pairs for template variable replacement
 * @returns The rendered HTML string
 */
export function renderEmail(
  template: string,
  variables: Record<string, string>,
): string {
  // Generate the raw HTML based on the template name
  let html: string;

  switch (template) {
    case 'welcome':
      html = welcomeEmail(variables['userName'] ?? 'Utilisateur');
      break;
    case 'credit_low':
      html = creditLowEmail(
        variables['userName'] ?? 'Utilisateur',
        parseInt(variables['balance'] ?? '0', 10),
      );
      break;
    case 'referral_success':
      html = referralSuccessEmail(
        variables['userName'] ?? 'Utilisateur',
        variables['referredName'] ?? 'Un ami',
        parseInt(variables['rewardAmount'] ?? '0', 10),
      );
      break;
    case 'weekly_digest':
      html = weeklyDigestEmail(
        variables['userName'] ?? 'Utilisateur',
        {
          agentCalls: parseInt(variables['agentCalls'] ?? '0', 10),
          creditsUsed: parseInt(variables['creditsUsed'] ?? '0', 10),
          topAgent: variables['topAgent'] ?? 'N/A',
        },
      );
      break;
    case 'password_reset':
      html = passwordResetEmail(
        variables['userName'] ?? 'Utilisateur',
        variables['resetLink'] ?? '#',
      );
      break;
    case 'invoice':
      html = invoiceEmail(
        variables['userName'] ?? 'Utilisateur',
        parseFloat(variables['amount'] ?? '0'),
        variables['invoiceId'] ?? 'N/A',
      );
      break;
    default:
      throw new Error(`Unknown email template: ${template}`);
  }

  // Replace all {{variable}} placeholders with provided values
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escapeHtml(value));
  }

  return html;
}
