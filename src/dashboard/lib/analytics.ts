/* ═══════════════════════════════════════════════════════════════
   analytics.ts — Module central GA4
   Toutes les pages importent depuis ici. Jamais de gtag() direct.
   ═══════════════════════════════════════════════════════════════ */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// ─── State ───────────────────────────────────────────────
let gtagLoaded = false;
const pendingEvents: Array<{ name: string; params: Record<string, string | number> }> = [];

const CONSENT_KEY = 'fz_cookies_consent';

// ─── Consent helpers ─────────────────────────────────────
export function isConsentGranted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

// ─── Load gtag.js dynamically ────────────────────────────
export function loadGtag(measurementId: string): void {
  if (typeof window === 'undefined' || gtagLoaded || !measurementId) return;
  gtagLoaded = true;

  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Init dataLayer + gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  // Update consent to granted
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  });

  // Flush queued events
  flushQueue();
}

// ─── Event queue ─────────────────────────────────────────
function flushQueue(): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  for (const evt of pendingEvents) {
    window.gtag('event', evt.name, evt.params);
  }
  pendingEvents.length = 0;
}

// ─── Core track function ─────────────────────────────────
export function trackEvent(name: string, params: Record<string, string | number> = {}): void {
  if (typeof window === 'undefined') return;
  if (gtagLoaded && window.gtag) {
    window.gtag('event', name, params);
  } else {
    pendingEvents.push({ name, params });
  }
}

// ═══════════════════════════════════════════════════════════
// Specific event helpers (fz_ prefix)
// ═══════════════════════════════════════════════════════════

export function trackAudienceSelected(audience: string): void {
  trackEvent('fz_audience_selected', { audience });
}

export function trackCtaClick(label: string, href: string, audience: string | null, page: string): void {
  trackEvent('fz_cta_click', { label, href, audience: audience || 'none', page });
}

export function trackSectionViewed(sectionName: string): void {
  trackEvent('fz_section_viewed', { section: sectionName });
}

export function trackFaqOpened(question: string, category: string): void {
  trackEvent('fz_faq_opened', { question: question.substring(0, 100), category });
}

export function trackPageView(page: string, variant: string | null, audience: string | null): void {
  trackEvent('fz_page_view', {
    page,
    variant: variant || 'main',
    audience: audience || 'none',
  });
}

export function trackScrollDepth(sectionName: string): void {
  trackEvent('fz_scroll_depth', { section: sectionName });
}

export function trackEnterpriseFormViewed(): void {
  trackEvent('fz_enterprise_form_viewed', {});
}

export function trackBonusMessageViewed(): void {
  trackEvent('fz_bonus_message_viewed', {});
}
