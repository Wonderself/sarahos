'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageExplanation from '@/components/PageExplanation';
import { useIsMobile } from '@/lib/use-media-query';
import { PAGE_META } from '@/lib/emoji-map';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LandingHero {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
}

interface LandingFeature {
  emoji: string;
  title: string;
  description: string;
}

interface LandingTestimonial {
  quote: string;
  authorName: string;
  authorRole: string;
}

interface LandingCTA {
  headline: string;
  buttonText: string;
  buttonLink: string;
}

interface LandingFooter {
  companyName: string;
  links: string;
}

interface LandingPage {
  id: string;
  name: string;
  templateId: string;
  theme: string;
  hero: LandingHero;
  features: [LandingFeature, LandingFeature, LandingFeature];
  testimonial: LandingTestimonial;
  cta: LandingCTA;
  footer: LandingFooter;
  createdAt: string;
  updatedAt: string;
}

interface LandingStore {
  pages: LandingPage[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_landings';

const THEMES: { id: string; label: string; primary: string; bg: string; text: string }[] = [
  { id: 'blue', label: 'Bleu', primary: '#3b82f6', bg: '#eff6ff', text: '#1e3a5f' },
  { id: 'green', label: 'Vert', primary: '#10b981', bg: '#ecfdf5', text: '#064e3b' },
  { id: 'purple', label: 'Violet', primary: '#8b5cf6', bg: '#f5f3ff', text: '#3b0764' },
  { id: 'orange', label: 'Orange', primary: '#f97316', bg: '#fff7ed', text: '#7c2d12' },
  { id: 'dark', label: 'Sombre', primary: '#6366f1', bg: '#1e1e2e', text: '#e2e8f0' },
];

interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  defaults: Omit<LandingPage, 'id' | 'name' | 'templateId' | 'createdAt' | 'updatedAt'>;
}

const TEMPLATES: Template[] = [
  {
    id: 'saas', name: 'SaaS', emoji: '💻', description: 'Page de vente pour logiciel SaaS avec features et pricing.',
    defaults: {
      theme: 'blue',
      hero: { title: 'Votre SaaS en un clic', subtitle: 'Automatisez vos processus avec notre plateforme intelligente.', ctaText: 'Essai gratuit', ctaLink: '#signup', bgColor: '#3b82f6' },
      features: [
        { emoji: '⚡', title: 'Rapide', description: 'Performances optimales pour votre business.' },
        { emoji: '🔒', title: 'Sécurisé', description: 'Vos données protégées avec chiffrement de bout en bout.' },
        { emoji: '📊', title: 'Analytics', description: 'Tableaux de bord en temps réel pour piloter votre activité.' },
      ],
      testimonial: { quote: 'Ce produit a transformé notre façon de travailler.', authorName: 'Marie Dupont', authorRole: 'CEO, TechCorp' },
      cta: { headline: 'Prêt à commencer ?', buttonText: 'Démarrer maintenant', buttonLink: '#signup' },
      footer: { companyName: 'MonSaaS', links: 'Mentions légales, CGU, Contact' },
    },
  },
  {
    id: 'ecommerce', name: 'E-commerce', emoji: '🛒', description: 'Landing page pour boutique en ligne ou lancement produit.',
    defaults: {
      theme: 'orange',
      hero: { title: 'Le produit qui change tout', subtitle: 'Découvrez notre nouvelle collection exclusive.', ctaText: 'Acheter maintenant', ctaLink: '#shop', bgColor: '#f97316' },
      features: [
        { emoji: '🚚', title: 'Livraison rapide', description: 'Livré chez vous en 24h.' },
        { emoji: '💎', title: 'Qualité premium', description: 'Matériaux sélectionnés avec soin.' },
        { emoji: '🔄', title: 'Retours gratuits', description: '30 jours pour changer d\'avis.' },
      ],
      testimonial: { quote: 'Un rapport qualité-prix imbattable !', authorName: 'Thomas Martin', authorRole: 'Client fidèle' },
      cta: { headline: 'Offre limitée -30%', buttonText: 'Profiter de l\'offre', buttonLink: '#promo' },
      footer: { companyName: 'MaBoutique', links: 'CGV, Livraison, FAQ' },
    },
  },
  {
    id: 'event', name: 'Événement', emoji: '🎉', description: 'Page d\'inscription pour conférence, webinar ou meetup.',
    defaults: {
      theme: 'purple',
      hero: { title: 'La conférence de l\'année', subtitle: 'Rejoignez 500+ professionnels le 15 avril 2026.', ctaText: 'S\'inscrire', ctaLink: '#register', bgColor: '#8b5cf6' },
      features: [
        { emoji: '🎤', title: '20+ speakers', description: 'Les meilleurs experts du secteur.' },
        { emoji: '🤝', title: 'Networking', description: 'Rencontrez votre prochain partenaire.' },
        { emoji: '🎓', title: 'Workshops', description: 'Ateliers pratiques toute la journée.' },
      ],
      testimonial: { quote: 'L\'événement le plus enrichissant de l\'année.', authorName: 'Sophie Bernard', authorRole: 'Fondatrice, StartupLab' },
      cta: { headline: 'Places limitées', buttonText: 'Réserver ma place', buttonLink: '#register' },
      footer: { companyName: 'MonEvent', links: 'Programme, Lieu, Sponsors' },
    },
  },
  {
    id: 'portfolio', name: 'Portfolio', emoji: '🎨', description: 'Showcase pour créatif, designer ou photographe.',
    defaults: {
      theme: 'dark',
      hero: { title: 'Créativité sans limites', subtitle: 'Designer UI/UX avec 10 ans d\'expérience.', ctaText: 'Voir mes projets', ctaLink: '#work', bgColor: '#6366f1' },
      features: [
        { emoji: '🎯', title: '200+ projets', description: 'Clients satisfaits dans le monde entier.' },
        { emoji: '🏆', title: '15 awards', description: 'Reconnu par l\'industrie du design.' },
        { emoji: '🤖', title: 'AI + Design', description: 'Fusion de créativité et technologie.' },
      ],
      testimonial: { quote: 'Un talent rare qui comprend nos besoins.', authorName: 'Lucas Petit', authorRole: 'Directeur créatif, AgencyX' },
      cta: { headline: 'Un projet en tête ?', buttonText: 'Me contacter', buttonLink: '#contact' },
      footer: { companyName: 'Studio Créatif', links: 'Portfolio, À propos, Contact' },
    },
  },
  {
    id: 'restaurant', name: 'Restaurant', emoji: '🍽️', description: 'Page vitrine pour restaurant avec menu et réservation.',
    defaults: {
      theme: 'green',
      hero: { title: 'Bienvenue chez Gusto', subtitle: 'Cuisine italienne authentique au cœur de Paris.', ctaText: 'Réserver une table', ctaLink: '#booking', bgColor: '#10b981' },
      features: [
        { emoji: '🍕', title: 'Fait maison', description: 'Tous nos plats préparés sur place.' },
        { emoji: '🍷', title: 'Cave sélection', description: '200 références de vins italiens.' },
        { emoji: '🌿', title: 'Bio & local', description: 'Ingrédients de saison et circuits courts.' },
      ],
      testimonial: { quote: 'La meilleure pasta de Paris, sans hésiter.', authorName: 'Emma Roux', authorRole: 'Critique gastronomique' },
      cta: { headline: 'Réservez votre table', buttonText: 'Appeler le restaurant', buttonLink: 'tel:+33100000000' },
      footer: { companyName: 'Gusto Paris', links: 'Menu, Horaires, Plan d\'accès' },
    },
  },
  {
    id: 'coaching', name: 'Coaching', emoji: '🧠', description: 'Page de vente pour coach, consultant ou formateur.',
    defaults: {
      theme: 'blue',
      hero: { title: 'Libérez votre potentiel', subtitle: 'Programme de coaching personnalisé en 12 semaines.', ctaText: 'Réserver un appel', ctaLink: '#booking', bgColor: '#3b82f6' },
      features: [
        { emoji: '🎯', title: 'Sur mesure', description: 'Un programme adapté à vos objectifs.' },
        { emoji: '📈', title: 'Résultats prouvés', description: '95% de clients satisfaits.' },
        { emoji: '💬', title: 'Suivi continu', description: 'Accès WhatsApp 7j/7 avec votre coach.' },
      ],
      testimonial: { quote: 'En 3 mois, mon CA a doublé grâce au coaching.', authorName: 'Pierre Leroy', authorRole: 'Entrepreneur' },
      cta: { headline: 'Prenez rendez-vous', buttonText: 'Appel découverte gratuit', buttonLink: '#call' },
      footer: { companyName: 'CoachPro', links: 'Témoignages, Tarifs, Blog' },
    },
  },
];

const DEMO_PAGE: LandingPage = {
  id: 'demo1',
  name: 'Mon Produit SaaS',
  templateId: 'saas',
  ...TEMPLATES[0].defaults,
  createdAt: '2026-03-10',
  updatedAt: '2026-03-10',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadStore(): LandingStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  const store: LandingStore = { pages: [DEMO_PAGE] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

function saveStore(store: LandingStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* */ }
}

function getTheme(id: string) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingBuilderPage() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [store, setStore] = useState<LandingStore>({ pages: [] });
  const [tab, setTab] = useState<'pages' | 'templates' | 'editor'>('pages');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewFull, setPreviewFull] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadStore();
    setStore(s);
    if (s.pages.length > 0) setEditingId(s.pages[0].id);
  }, []);

  const persist = useCallback((updated: LandingStore) => {
    setStore(updated);
    saveStore(updated);
  }, []);

  const editingPage = useMemo(() => store.pages.find(p => p.id === editingId) || null, [store, editingId]);

  const updatePage = useCallback((patch: Partial<LandingPage>) => {
    if (!editingId) return;
    const next = {
      ...store,
      pages: store.pages.map(p => p.id === editingId ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p),
    };
    persist(next);
  }, [editingId, store, persist]);

  const updateHero = useCallback((patch: Partial<LandingHero>) => {
    if (!editingPage) return;
    updatePage({ hero: { ...editingPage.hero, ...patch } });
  }, [editingPage, updatePage]);

  const updateFeature = useCallback((index: number, patch: Partial<LandingFeature>) => {
    if (!editingPage) return;
    const features = [...editingPage.features] as [LandingFeature, LandingFeature, LandingFeature];
    features[index] = { ...features[index], ...patch };
    updatePage({ features });
  }, [editingPage, updatePage]);

  const updateTestimonial = useCallback((patch: Partial<LandingTestimonial>) => {
    if (!editingPage) return;
    updatePage({ testimonial: { ...editingPage.testimonial, ...patch } });
  }, [editingPage, updatePage]);

  const updateCta = useCallback((patch: Partial<LandingCTA>) => {
    if (!editingPage) return;
    updatePage({ cta: { ...editingPage.cta, ...patch } });
  }, [editingPage, updatePage]);

  const updateFooter = useCallback((patch: Partial<LandingFooter>) => {
    if (!editingPage) return;
    updatePage({ footer: { ...editingPage.footer, ...patch } });
  }, [editingPage, updatePage]);

  const createFromTemplate = useCallback((tpl: Template) => {
    const page: LandingPage = {
      id: `lp${Date.now()}`,
      name: `${tpl.name} - Nouveau`,
      templateId: tpl.id,
      ...JSON.parse(JSON.stringify(tpl.defaults)),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const next = { ...store, pages: [...store.pages, page] };
    persist(next);
    setEditingId(page.id);
    setTab('editor');
  }, [store, persist]);

  const deletePage = useCallback((id: string) => {
    const next = { ...store, pages: store.pages.filter(p => p.id !== id) };
    persist(next);
    if (editingId === id) setEditingId(next.pages[0]?.id || null);
  }, [store, persist, editingId]);

  const duplicatePage = useCallback((id: string) => {
    const src = store.pages.find(p => p.id === id);
    if (!src) return;
    const dup: LandingPage = { ...JSON.parse(JSON.stringify(src)), id: `lp${Date.now()}`, name: `${src.name} (copie)`, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    const next = { ...store, pages: [...store.pages, dup] };
    persist(next);
  }, [store, persist]);

  const generateHTML = useCallback((page: LandingPage): string => {
    const th = getTheme(page.theme);
    const isDark = page.theme === 'dark';
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.hero.title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}body{background:${th.bg};color:${th.text}}
.hero{background:${page.hero.bgColor};color:#fff;padding:80px 20px;text-align:center}
.hero h1{font-size:2.5rem;margin-bottom:16px}.hero p{font-size:1.1rem;opacity:0.9;margin-bottom:24px}
.btn{display:inline-block;background:#fff;color:${page.hero.bgColor};padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700}
.features{display:flex;gap:20px;padding:60px 20px;max-width:900px;margin:0 auto;flex-wrap:wrap}
.feature{flex:1;min-width:200px;text-align:center;padding:24px}
.feature .icon{font-size:2rem;margin-bottom:12px}.feature h3{margin-bottom:8px}
.testimonial{background:${isDark ? '#2a2a3e' : '#f8f8f8'};padding:40px 20px;text-align:center;font-style:italic}
.cta-section{background:${page.hero.bgColor};color:#fff;padding:60px 20px;text-align:center}
.cta-section h2{margin-bottom:20px}
footer{background:${isDark ? '#111' : '#333'};color:#ccc;padding:20px;text-align:center;font-size:0.85rem}
</style></head>
<body>
<section class="hero"><h1>${page.hero.title}</h1><p>${page.hero.subtitle}</p><a class="btn" href="${page.hero.ctaLink}">${page.hero.ctaText}</a></section>
<section class="features">${page.features.map(f => `<div class="feature"><div class="icon">${f.emoji}</div><h3>${f.title}</h3><p>${f.description}</p></div>`).join('')}</section>
<section class="testimonial"><p>"${page.testimonial.quote}"</p><p style="margin-top:12px;font-style:normal;font-weight:700">${page.testimonial.authorName}, ${page.testimonial.authorRole}</p></section>
<section class="cta-section"><h2>${page.cta.headline}</h2><a class="btn" href="${page.cta.buttonLink}">${page.cta.buttonText}</a></section>
<footer><p>${page.footer.companyName} &mdash; ${page.footer.links}</p></footer>
</body></html>`;
  }, []);

  const copyHTML = useCallback(() => {
    if (!editingPage) return;
    navigator.clipboard.writeText(generateHTML(editingPage)).catch(() => {});
  }, [editingPage, generateHTML]);

  if (!mounted) return null;

  const meta = PAGE_META['landing-builder'];
  const tabs = [
    { id: 'pages' as const, label: 'Mes pages' },
    { id: 'templates' as const, label: 'Templates' },
    { id: 'editor' as const, label: 'Éditeur' },
  ];

  // Input style helper
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-primary)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 4,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 10,
    marginTop: 16,
    paddingBottom: 6,
    borderBottom: '1px solid var(--border-primary)',
  };

  // ─── Preview renderer ─────────────────────────────────────────────────────

  function renderPreview(page: LandingPage, compact: boolean = false) {
    const th = getTheme(page.theme);
    const scale = compact ? 0.5 : 1;
    return (
      <div style={{
        borderRadius: compact ? 8 : 12,
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        fontSize: 14 * scale,
        lineHeight: 1.4,
        background: th.bg,
        color: th.text,
      }}>
        {/* Hero */}
        <div style={{ background: page.hero.bgColor, color: '#fff', padding: compact ? '16px 10px' : '40px 20px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: compact ? 14 : 24, marginBottom: compact ? 4 : 8 }}>{page.hero.title}</div>
          <div style={{ opacity: 0.9, fontSize: compact ? 10 : 14, marginBottom: compact ? 6 : 16 }}>{page.hero.subtitle}</div>
          <span style={{
            display: 'inline-block',
            background: '#fff',
            color: page.hero.bgColor,
            padding: compact ? '4px 10px' : '8px 20px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: compact ? 9 : 13,
          }}>{page.hero.ctaText}</span>
        </div>
        {/* Features */}
        <div style={{ display: 'flex', gap: compact ? 4 : 12, padding: compact ? '10px 6px' : '24px 16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {page.features.map((f, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: compact ? 50 : 120, padding: compact ? 4 : 12 }}>
              <div style={{ fontSize: compact ? 16 : 28, marginBottom: compact ? 2 : 8 }}>{f.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: compact ? 9 : 14, marginBottom: compact ? 2 : 4 }}>{f.title}</div>
              {!compact && <div style={{ fontSize: 12, color: th.text, opacity: 0.7 }}>{f.description}</div>}
            </div>
          ))}
        </div>
        {/* Testimonial */}
        <div style={{ background: page.theme === 'dark' ? '#2a2a3e' : '#f5f5f5', padding: compact ? '8px 6px' : '20px 16px', textAlign: 'center', fontStyle: 'italic', fontSize: compact ? 9 : 13 }}>
          &quot;{page.testimonial.quote}&quot;
          <div style={{ fontStyle: 'normal', fontWeight: 700, marginTop: compact ? 2 : 8, fontSize: compact ? 8 : 12 }}>
            {page.testimonial.authorName}
          </div>
        </div>
        {/* CTA */}
        <div style={{ background: page.hero.bgColor, color: '#fff', padding: compact ? '10px 6px' : '24px 16px', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: compact ? 10 : 16, marginBottom: compact ? 4 : 12 }}>{page.cta.headline}</div>
          <span style={{
            display: 'inline-block',
            background: '#fff',
            color: page.hero.bgColor,
            padding: compact ? '3px 8px' : '8px 20px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: compact ? 8 : 13,
          }}>{page.cta.buttonText}</span>
        </div>
        {/* Footer */}
        <div style={{ background: page.theme === 'dark' ? '#111' : '#333', color: '#ccc', padding: compact ? '6px' : '12px', textAlign: 'center', fontSize: compact ? 7 : 11 }}>
          {page.footer.companyName}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: isMobile ? '16px 12px' : '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{meta.emoji}</span>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{meta.subtitle}</p>
            </div>
          </div>
        </div>
        <PageExplanation pageId="landing-builder" text={meta?.helpText} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { emoji: '📄', label: 'Pages créées', value: store.pages.length },
            { emoji: '🎨', label: 'Templates', value: TEMPLATES.length },
          ].map(s => (
            <div key={s.label} style={{
              flex: '1 1 140px',
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: isMobile ? 14 : 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--border-primary)',
            }}>
              <span style={{ fontSize: 24 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-primary)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Mes pages */}
        {tab === 'pages' && (
          <div>
            {store.pages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 14 }}>
                Aucune page cr&eacute;&eacute;e. Commencez par choisir un template !
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
              {store.pages.map(page => (
                <div key={page.id} style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  padding: isMobile ? 16 : 20,
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{ marginBottom: 12 }}>
                    {renderPreview(page, true)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{page.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    Template : {TEMPLATES.find(t => t.id === page.templateId)?.name || page.templateId} &bull; {page.updatedAt}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setEditingId(page.id); setTab('editor'); }}
                      style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => duplicatePage(page.id)}
                      style={{
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Dupliquer
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      style={{
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Templates */}
        {tab === 'templates' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {TEMPLATES.map(tpl => (
              <div key={tpl.id} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: isMobile ? 16 : 20,
                border: '1px solid var(--border-primary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{tpl.emoji}</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{tpl.name}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                  {tpl.description}
                </div>
                {/* Mini preview */}
                <div style={{ marginBottom: 12 }}>
                  {renderPreview({ ...DEMO_PAGE, ...tpl.defaults, id: tpl.id, name: tpl.name, templateId: tpl.id, createdAt: '', updatedAt: '' }, true)}
                </div>
                <button
                  onClick={() => createFromTemplate(tpl)}
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Utiliser ce template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Editor */}
        {tab === 'editor' && editingPage && (
          <div style={{ display: 'flex', gap: 20, flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Form panel */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Page name */}
              <label style={labelStyle}>Nom de la page</label>
              <input
                type="text"
                value={editingPage.name}
                onChange={e => updatePage({ name: e.target.value })}
                style={inputStyle}
              />

              {/* Theme picker */}
              <label style={labelStyle}>Th&egrave;me couleur</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {THEMES.map(th => (
                  <button
                    key={th.id}
                    onClick={() => updatePage({ theme: th.id, hero: { ...editingPage.hero, bgColor: th.primary } })}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: th.primary,
                      border: editingPage.theme === th.id ? '3px solid var(--text-primary)' : '2px solid var(--border-primary)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    title={th.label}
                  />
                ))}
              </div>

              {/* Hero */}
              <div style={sectionTitleStyle}>Section Hero</div>
              <label style={labelStyle}>Titre</label>
              <input type="text" value={editingPage.hero.title} onChange={e => updateHero({ title: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Sous-titre</label>
              <input type="text" value={editingPage.hero.subtitle} onChange={e => updateHero({ subtitle: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Texte CTA</label>
                  <input type="text" value={editingPage.hero.ctaText} onChange={e => updateHero({ ctaText: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Lien CTA</label>
                  <input type="text" value={editingPage.hero.ctaLink} onChange={e => updateHero({ ctaLink: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Features */}
              <div style={sectionTitleStyle}>Features (x3)</div>
              {editingPage.features.map((f, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, marginBottom: 10, border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 50 }}>
                      <label style={labelStyle}>Emoji</label>
                      <input type="text" value={f.emoji} onChange={e => updateFeature(i, { emoji: e.target.value })} style={{ ...inputStyle, textAlign: 'center' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Titre</label>
                      <input type="text" value={f.title} onChange={e => updateFeature(i, { title: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <label style={labelStyle}>Description</label>
                  <input type="text" value={f.description} onChange={e => updateFeature(i, { description: e.target.value })} style={inputStyle} />
                </div>
              ))}

              {/* Testimonial */}
              <div style={sectionTitleStyle}>T&eacute;moignage</div>
              <label style={labelStyle}>Citation</label>
              <textarea
                value={editingPage.testimonial.quote}
                onChange={e => updateTestimonial({ quote: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Auteur</label>
                  <input type="text" value={editingPage.testimonial.authorName} onChange={e => updateTestimonial({ authorName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>R&ocirc;le</label>
                  <input type="text" value={editingPage.testimonial.authorRole} onChange={e => updateTestimonial({ authorRole: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* CTA Section */}
              <div style={sectionTitleStyle}>Section CTA</div>
              <label style={labelStyle}>Titre</label>
              <input type="text" value={editingPage.cta.headline} onChange={e => updateCta({ headline: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Texte bouton</label>
                  <input type="text" value={editingPage.cta.buttonText} onChange={e => updateCta({ buttonText: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Lien bouton</label>
                  <input type="text" value={editingPage.cta.buttonLink} onChange={e => updateCta({ buttonLink: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Footer */}
              <div style={sectionTitleStyle}>Footer</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nom entreprise</label>
                  <input type="text" value={editingPage.footer.companyName} onChange={e => updateFooter({ companyName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Liens (virgules)</label>
                  <input type="text" value={editingPage.footer.links} onChange={e => updateFooter({ links: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={copyHTML}
                  style={{
                    background: '#1A1A1A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Copier le HTML
                </button>
                <button
                  onClick={() => setPreviewFull(true)}
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Pr&eacute;visualiser
                </button>
              </div>
            </div>

            {/* Live preview panel */}
            {!isMobile && (
              <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Aper&ccedil;u en direct
                </div>
                {renderPreview(editingPage, false)}
              </div>
            )}
          </div>
        )}

        {tab === 'editor' && !editingPage && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 14 }}>
            Aucune page s&eacute;lectionn&eacute;e. Cr&eacute;ez-en une depuis l&apos;onglet Templates.
          </div>
        )}

        {/* Full-screen preview modal */}
        {previewFull && editingPage && (
          <div
            onClick={() => setPreviewFull(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: 16,
              }}
            >
              {renderPreview(editingPage, false)}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                  onClick={() => setPreviewFull(false)}
                  style={{
                    background: '#fff',
                    color: '#333',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
