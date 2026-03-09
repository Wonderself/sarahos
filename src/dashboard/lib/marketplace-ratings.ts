// ═══════════════════════════════════════════════════
//   FREENZY.IO — Marketplace Ratings
//   User ratings for marketplace templates
// ═══════════════════════════════════════════════════

export interface TemplateRating {
  rating: number;
  ratedAt: string;
}

const RATINGS_KEY = 'fz_marketplace_ratings';
const INSTALLS_KEY = 'fz_marketplace_installs';
const USER_TEMPLATES_KEY = 'fz_marketplace_user_templates';

export interface UserTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  agentConfig: Record<string, unknown>;
  authorName: string;
  authorId: string;
  publishedAt: string;
  installCount: number;
  ratings: number[];
  averageRating: number;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── Ratings

export function loadRatings(): Record<string, TemplateRating> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) ?? '{}');
  } catch { return {}; }
}

export function rateTemplate(templateId: string, rating: number): void {
  rating = Math.max(1, Math.min(5, Math.round(rating)));
  const ratings = loadRatings();
  ratings[templateId] = { rating, ratedAt: new Date().toISOString() };
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

export function getUserRating(templateId: string): number | null {
  const rating = loadRatings()[templateId];
  return rating ? rating.rating : null;
}

// ─── Install count

export function loadInstalls(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(INSTALLS_KEY) ?? '{}');
  } catch { return {}; }
}

export function trackInstall(templateId: string): void {
  const installs = loadInstalls();
  installs[templateId] = (installs[templateId] ?? 0) + 1;
  localStorage.setItem(INSTALLS_KEY, JSON.stringify(installs));
}

// ─── User templates

export function loadUserTemplates(): UserTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USER_TEMPLATES_KEY) ?? '[]');
  } catch { return []; }
}

export function saveUserTemplate(template: UserTemplate): void {
  const templates = loadUserTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) templates[idx] = template;
  else templates.unshift(template);
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteUserTemplate(templateId: string): void {
  const templates = loadUserTemplates().filter(t => t.id !== templateId);
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates));
}
