/**
 * BrandingService — Manages user branding and auto-applies it to documents/emails.
 * Reads/writes localStorage `fz_branding`.
 */

// ─── Types ────────────────────────────────────────────────────

export type TonMarque = 'formel' | 'decontracte' | 'luxe' | 'artisanal';

export interface UserBranding {
  logo?: string; // base64 data URI
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  tonMarque: TonMarque;
  companyName: string;
  companyAddress: string;
  companySiret: string;
  companyPhone: string;
  companyEmail: string;
}

export interface BrandingCompleteness {
  score: number; // 0-100
  missing: string[];
  message: string;
}

// ─── Constants ────────────────────────────────────────────────

const STORAGE_KEY = 'fz_branding';

const DEFAULT_BRANDING: UserBranding = {
  logo: undefined,
  primaryColor: '#1A1A1A',
  secondaryColor: '#6B6B6B',
  accentColor: '#0EA5E9',
  fontFamily: 'Inter',
  tonMarque: 'formel',
  companyName: '',
  companyAddress: '',
  companySiret: '',
  companyPhone: '',
  companyEmail: '',
};

// Scoring weights for completeness
const SCORE_WEIGHTS: Record<string, { points: number; label: string }> = {
  logo: { points: 20, label: 'Logo' },
  colors: { points: 15, label: 'Couleurs' },
  fontFamily: { points: 5, label: 'Police' },
  tonMarque: { points: 5, label: 'Ton de marque' },
  companyName: { points: 20, label: 'Nom entreprise' },
  companyAddress: { points: 10, label: 'Adresse' },
  companySiret: { points: 10, label: 'SIRET' },
  companyPhone: { points: 10, label: 'Telephone' },
  companyEmail: { points: 5, label: 'Email' },
};

// Ton labels for brand guide
const TON_LABELS: Record<TonMarque, string> = {
  formel: 'Formel — Communication professionnelle et structuree',
  decontracte: 'Decontracte — Communication accessible et chaleureuse',
  luxe: 'Luxe — Communication raffinee et exclusive',
  artisanal: 'Artisanal — Communication authentique et proche',
};

// ─── Helpers ──────────────────────────────────────────────────

function normalizeTon(raw: string): TonMarque {
  const lower = raw.toLowerCase().trim();
  if (lower === 'formel') return 'formel';
  if (lower === 'decontracte') return 'decontracte';
  if (lower === 'luxe') return 'luxe';
  if (lower === 'artisanal') return 'artisanal';
  return 'formel';
}

function isNonEmpty(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function colorsCustomized(branding: UserBranding): boolean {
  return (
    branding.primaryColor !== DEFAULT_BRANDING.primaryColor ||
    branding.secondaryColor !== DEFAULT_BRANDING.secondaryColor ||
    branding.accentColor !== DEFAULT_BRANDING.accentColor
  );
}

// ─── Service ──────────────────────────────────────────────────

function getBranding(): UserBranding | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return {
      logo: typeof parsed.logo === 'string' && parsed.logo.length > 0 ? parsed.logo : undefined,
      primaryColor: typeof parsed.primaryColor === 'string' ? parsed.primaryColor : DEFAULT_BRANDING.primaryColor,
      secondaryColor: typeof parsed.secondaryColor === 'string' ? parsed.secondaryColor : DEFAULT_BRANDING.secondaryColor,
      accentColor: typeof parsed.accentColor === 'string' ? parsed.accentColor : DEFAULT_BRANDING.accentColor,
      fontFamily: typeof parsed.fontFamily === 'string' ? parsed.fontFamily : DEFAULT_BRANDING.fontFamily,
      tonMarque: typeof parsed.tonMarque === 'string' ? normalizeTon(parsed.tonMarque) : DEFAULT_BRANDING.tonMarque,
      companyName: typeof parsed.companyName === 'string' ? parsed.companyName : '',
      companyAddress: typeof parsed.companyAddress === 'string' ? parsed.companyAddress : '',
      companySiret: typeof parsed.companySiret === 'string' ? parsed.companySiret : '',
      companyPhone: typeof parsed.companyPhone === 'string' ? parsed.companyPhone : '',
      companyEmail: typeof parsed.companyEmail === 'string' ? parsed.companyEmail : '',
    };
  } catch {
    return null;
  }
}

function saveBranding(branding: UserBranding): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
}

function getDefault(): UserBranding {
  return { ...DEFAULT_BRANDING };
}

function getCompleteness(): BrandingCompleteness {
  const branding = getBranding();
  if (!branding) {
    return {
      score: 0,
      missing: Object.values(SCORE_WEIGHTS).map((w) => w.label),
      message: 'Configurez votre branding pour des documents professionnels',
    };
  }

  let score = 0;
  const missing: string[] = [];

  // Logo: 20 points
  if (isNonEmpty(branding.logo)) {
    score += SCORE_WEIGHTS.logo.points;
  } else {
    missing.push(SCORE_WEIGHTS.logo.label);
  }

  // Colors: 15 points (any customization counts)
  if (colorsCustomized(branding)) {
    score += SCORE_WEIGHTS.colors.points;
  } else {
    missing.push(SCORE_WEIGHTS.colors.label);
  }

  // Font: 5 points
  if (isNonEmpty(branding.fontFamily) && branding.fontFamily !== DEFAULT_BRANDING.fontFamily) {
    score += SCORE_WEIGHTS.fontFamily.points;
  } else {
    missing.push(SCORE_WEIGHTS.fontFamily.label);
  }

  // Ton: 5 points (always set, but check it differs from default)
  if (branding.tonMarque !== DEFAULT_BRANDING.tonMarque) {
    score += SCORE_WEIGHTS.tonMarque.points;
  } else {
    missing.push(SCORE_WEIGHTS.tonMarque.label);
  }

  // Company name: 20 points
  if (isNonEmpty(branding.companyName)) {
    score += SCORE_WEIGHTS.companyName.points;
  } else {
    missing.push(SCORE_WEIGHTS.companyName.label);
  }

  // Address: 10 points
  if (isNonEmpty(branding.companyAddress)) {
    score += SCORE_WEIGHTS.companyAddress.points;
  } else {
    missing.push(SCORE_WEIGHTS.companyAddress.label);
  }

  // SIRET: 10 points
  if (isNonEmpty(branding.companySiret)) {
    score += SCORE_WEIGHTS.companySiret.points;
  } else {
    missing.push(SCORE_WEIGHTS.companySiret.label);
  }

  // Phone: 10 points
  if (isNonEmpty(branding.companyPhone)) {
    score += SCORE_WEIGHTS.companyPhone.points;
  } else {
    missing.push(SCORE_WEIGHTS.companyPhone.label);
  }

  // Email: 5 points
  if (isNonEmpty(branding.companyEmail)) {
    score += SCORE_WEIGHTS.companyEmail.points;
  } else {
    missing.push(SCORE_WEIGHTS.companyEmail.label);
  }

  // Build message
  let message: string;
  if (score >= 80) {
    message = 'Votre branding est presque complet !';
  } else if (score >= 60) {
    message = 'Bon debut ! Ajoutez quelques details pour un branding professionnel.';
  } else if (score >= 30) {
    message = 'Completez votre branding pour des documents professionnels.';
  } else {
    message = 'Configurez votre branding pour personnaliser vos documents.';
  }

  return { score, missing, message };
}

function isComplete(): boolean {
  return getCompleteness().score >= 60;
}

function applyToDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const branding = getBranding();
  if (!branding) return doc;

  return {
    ...doc,
    branding: {
      logo: branding.logo,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      fontFamily: branding.fontFamily,
      tonMarque: branding.tonMarque,
      companyName: branding.companyName,
      companyAddress: branding.companyAddress,
      companySiret: branding.companySiret,
      companyPhone: branding.companyPhone,
      companyEmail: branding.companyEmail,
    },
  };
}

function applyToEmail(html: string): string {
  const branding = getBranding();
  if (!branding) return html;

  const replacements: Record<string, string> = {
    '{{BRAND_LOGO}}': branding.logo || '',
    '{{BRAND_PRIMARY_COLOR}}': branding.primaryColor,
    '{{BRAND_SECONDARY_COLOR}}': branding.secondaryColor,
    '{{BRAND_ACCENT_COLOR}}': branding.accentColor,
    '{{BRAND_FONT}}': branding.fontFamily,
    '{{BRAND_COMPANY_NAME}}': branding.companyName,
    '{{BRAND_COMPANY_ADDRESS}}': branding.companyAddress,
    '{{BRAND_COMPANY_SIRET}}': branding.companySiret,
    '{{BRAND_COMPANY_PHONE}}': branding.companyPhone,
    '{{BRAND_COMPANY_EMAIL}}': branding.companyEmail,
    '{{BRAND_TON}}': branding.tonMarque,
  };

  let result = html;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value);
  }
  return result;
}

function generateBrandGuide(): string {
  const branding = getBranding();
  if (!branding) {
    return 'Aucun branding configure. Utilisez les valeurs par defaut de Freenzy.';
  }

  const tonDescription = TON_LABELS[branding.tonMarque] || branding.tonMarque;
  const lines: string[] = [
    `Entreprise : ${branding.companyName || 'Non defini'}`,
    `Ton de marque : ${tonDescription}`,
    `Couleur principale : ${branding.primaryColor}`,
    `Couleur secondaire : ${branding.secondaryColor}`,
    `Couleur accent : ${branding.accentColor}`,
    `Police : ${branding.fontFamily}`,
  ];

  if (isNonEmpty(branding.companyAddress)) {
    lines.push(`Adresse : ${branding.companyAddress}`);
  }
  if (isNonEmpty(branding.companyPhone)) {
    lines.push(`Telephone : ${branding.companyPhone}`);
  }
  if (isNonEmpty(branding.companyEmail)) {
    lines.push(`Email : ${branding.companyEmail}`);
  }
  if (isNonEmpty(branding.companySiret)) {
    lines.push(`SIRET : ${branding.companySiret}`);
  }
  if (branding.logo) {
    lines.push('Logo : configure (base64)');
  } else {
    lines.push('Logo : non configure');
  }

  return lines.join('\n');
}

// ─── Exported Service ─────────────────────────────────────────

export const BrandingService = {
  getBranding,
  saveBranding,
  getDefault,
  getCompleteness,
  isComplete,
  applyToDocument,
  applyToEmail,
  generateBrandGuide,
};
