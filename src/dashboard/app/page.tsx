'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { FAQ_CATEGORIES } from '../lib/faq-data';

/* ═══════════════════════════════════════════════════════════
   FREENZY.IO — Landing Page v4
   12 sections, inline styles, mobile-first, Notion palette
   ═══════════════════════════════════════════════════════════ */

// ─── Palette
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSec: '#FAFAFA',
};

// ─── Floating emojis data (25 emojis)
const FLOAT_EMOJIS = [
  { e: '🤖', top: '5%', left: '4%', size: 44, delay: 0 },
  { e: '💬', top: '12%', left: '88%', size: 38, delay: 2 },
  { e: '📊', top: '28%', left: '8%', size: 36, delay: 4 },
  { e: '⚡', top: '22%', left: '92%', size: 42, delay: 1 },
  { e: '📝', top: '48%', left: '3%', size: 38, delay: 6 },
  { e: '🎨', top: '52%', left: '94%', size: 44, delay: 3 },
  { e: '📧', top: '68%', left: '6%', size: 34, delay: 5 },
  { e: '💳', top: '62%', left: '90%', size: 38, delay: 7 },
  { e: '🎯', top: '78%', left: '12%', size: 40, delay: 2 },
  { e: '✨', top: '8%', left: '42%', size: 32, delay: 8 },
  { e: '🚀', top: '38%', left: '96%', size: 36, delay: 9 },
  { e: '💡', top: '82%', left: '82%', size: 38, delay: 4 },
  { e: '🎓', top: '18%', left: '30%', size: 34, delay: 10 },
  { e: '📱', top: '42%', left: '50%', size: 30, delay: 11 },
  { e: '🔍', top: '72%', left: '55%', size: 36, delay: 6 },
  { e: '💼', top: '32%', left: '18%', size: 40, delay: 12 },
  { e: '🛡️', top: '58%', left: '40%', size: 34, delay: 3 },
  { e: '📋', top: '88%', left: '25%', size: 38, delay: 14 },
  { e: '🎮', top: '15%', left: '65%', size: 32, delay: 5 },
  { e: '💬', top: '75%', left: '35%', size: 36, delay: 13 },
  { e: '📊', top: '45%', left: '75%', size: 30, delay: 7 },
  { e: '🧠', top: '25%', left: '55%', size: 42, delay: 15 },
  { e: '🤖', top: '65%', left: '70%', size: 34, delay: 8 },
  { e: '⚡', top: '85%', left: '60%', size: 38, delay: 16 },
  { e: '🎯', top: '55%', left: '15%', size: 50, delay: 9 },
];

// ─── Feature carousel columns
const FEATURE_COLUMNS = [
  { title: '📝 Documents', items: ['📄 Devis automatiques', '🧾 Factures PDF', '📑 Contrats', '📋 Attestations', '📝 Comptes-rendus', '📊 Rapports'] },
  { title: '💬 Communication', items: ['📧 Emails professionnels', '⭐ Réponses avis Google', '💬 Messages WhatsApp', '📱 SMS de relance', '📰 Newsletter', '🎧 Support client'] },
  { title: '📱 Réseaux sociaux', items: ['💼 Posts LinkedIn', '📸 Posts Instagram', '👥 Posts Facebook', '🐦 Threads Twitter', '📱 Stories', '📅 Calendrier éditorial'] },
  { title: '📊 Analyse', items: ['🔍 Veille concurrentielle', '📈 Analyse de marché', '📊 Reporting', '🔎 SEO audit', '🎯 Prospection', '📋 Scoring leads'] },
  { title: '🎨 Création', items: ['📸 Photos IA', '🎬 Vidéos avatars', '🎨 Logos et branding', '🛍️ Fiches produits', '📄 CV professionnels', '📊 Présentations'] },
  { title: '🤖 Automatisation', items: ['☀️ Briefing matinal', '🔔 Rappels RDV', '🔄 Relances auto', '✅ Validation workflows', '📧 Emails séquencés', '🚨 Alertes intelligentes'] },
];

// ─── Profession cards
const PROFILES = [
  { emoji: '🔧', name: 'Artisan', count: 5, assistants: ['Devis automatique', 'Relance clients', 'Avis Google', 'Planning chantiers'] },
  { emoji: '🏥', name: 'Santé', count: 5, assistants: ['Prise de RDV', 'Rappels patients', 'Comptes-rendus', 'Ordonnances'] },
  { emoji: '🎨', name: 'Agence', count: 6, assistants: ['Brief créatif', 'Social media', 'Reporting client', 'Veille tendances'] },
  { emoji: '🛒', name: 'E-commerce', count: 5, assistants: ['Fiches produits', 'SAV automatisé', 'Relance paniers', 'Analyse ventes'] },
  { emoji: '🎯', name: 'Coach', count: 4, assistants: ['Planning séances', 'Suivi client', 'Contenu expert', 'Facturation'] },
  { emoji: '🍽️', name: 'Restaurant', count: 4, assistants: ['Réservations', 'Menu du jour', 'Avis Google', 'Stocks'] },
  { emoji: '⚖️', name: 'Libéral', count: 5, assistants: ['Contrats IA', 'Veille juridique', 'Facturation', 'Secrétariat'] },
  { emoji: '🏢', name: 'PME', count: 8, assistants: ['RH complet', 'Comptabilité', 'Commercial', 'Direction'] },
];

// ─── FAQ selection (10 most common)
const FAQ_SELECTION = (() => {
  const picked: { q: string; a: string }[] = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const faq of cat.questions) {
      if (picked.length < 10) picked.push(faq);
    }
  }
  return picked;
})();

// ─── Shared styles
const sectionStyle = (bg: string): React.CSSProperties => ({
  padding: '80px 24px',
  background: bg,
  position: 'relative',
});

const containerStyle: React.CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: C.text,
  textAlign: 'center',
  marginBottom: 12,
  letterSpacing: '-0.02em',
};

const sectionSub: React.CSSProperties = {
  fontSize: 16,
  color: C.secondary,
  textAlign: 'center',
  marginBottom: 48,
  maxWidth: 600,
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.6,
};

const cardStyle: React.CSSProperties = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 24,
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

// ─── Dashboard sidebar items
const SIDEBAR_ITEMS = [
  '🏠 Tableau de bord',
  '💬 Chat IA',
  '🤖 Mes Assistants',
  '📄 Documents',
  '🎨 Studio Créatif',
  '📊 Analytics',
  '📚 Formations',
  '📰 News IA',
  '🔧 Skills',
  '👥 Mon Équipe',
  '⚙️ Paramètres',
];

export default function LandingPage() {
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Build flat carousel items (duplicate for seamless loop)
  const carouselItems = FEATURE_COLUMNS.flatMap(col =>
    col.items.map(item => ({ category: col.title, label: item }))
  );
  const duplicatedItems = [...carouselItems, ...carouselItems];

  return (
    <>
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-emoji {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-features {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      ` }} />

      <PublicNav />

      <main style={{ paddingTop: 56 }}>

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — HERO
           ══════════════════════════════════════════════════════ */}
        <section style={{
          ...sectionStyle(C.bg),
          padding: '120px 24px 80px',
          overflow: 'hidden',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Floating emojis */}
          {FLOAT_EMOJIS.map((fe, i) => (
            <span key={i} style={{
              position: 'absolute',
              top: fe.top,
              left: fe.left,
              fontSize: fe.size,
              opacity: 0.12,
              animation: `float-emoji 25s ease-in-out infinite`,
              animationDelay: `${fe.delay}s`,
              pointerEvents: 'none',
              zIndex: 0,
              userSelect: 'none',
            }}>
              {fe.e}
            </span>
          ))}

          <div style={{
            ...containerStyle,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 48,
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Left: Text */}
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h1 style={{
                fontSize: isMobile ? 36 : 52,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: 8,
              }}>
                Utilisez vraiment l&apos;IA.
              </h1>
              <h2 style={{
                fontSize: isMobile ? 22 : 28,
                fontWeight: 600,
                color: C.secondary,
                lineHeight: 1.3,
                marginBottom: 16,
                letterSpacing: '-0.01em',
              }}>
                Facile et gratuit*
              </h2>
              <p style={{
                fontSize: isMobile ? 16 : 18,
                color: C.secondary,
                lineHeight: 1.6,
                marginBottom: 8,
                maxWidth: 520,
                marginLeft: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 'auto' : undefined,
              }}>
                +150 assistants IA sur mesure pour vous
              </p>
              <p style={{
                fontSize: 12,
                color: C.muted,
                marginBottom: 32,
                maxWidth: 520,
                marginLeft: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 'auto' : undefined,
              }}>
                *pas d&apos;abonnement et pas de commissions sur les tokens
              </p>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}>
                <Link href="/try" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  background: C.text,
                  color: '#FFFFFF',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  border: 'none',
                }}>
                  Essayer gratuitement &rarr;
                </Link>
                <Link href="#features" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  background: 'transparent',
                  color: C.text,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: `1px solid ${C.border}`,
                  transition: 'background 0.2s ease',
                }}>
                  Découvrir &darr;
                </Link>
              </div>
            </div>

            {/* Right: Flashboard mockup */}
            <div style={{
              flex: 1,
              maxWidth: isMobile ? '100%' : 480,
              width: '100%',
            }}>
              <div style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              }}>
                {/* Mockup header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>flashboard</span>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 20,
                }}>
                  {[
                    { emoji: '🤖', label: '12 Assistants actifs', bg: '#F0F7FF' },
                    { emoji: '⚡', label: '23 Actions ce mois', bg: '#FFF8F0' },
                    { emoji: '💎', label: '47 Crédits', bg: '#F0FFF4' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: s.bg,
                      borderRadius: 10,
                      padding: '12px 10px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini agent cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Secrétaire IA', status: true },
                    { name: 'Devis Pro', status: true },
                    { name: 'Réputation Google', status: true },
                  ].map((agent, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: C.bgSec,
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{agent.name}</span>
                      <span style={{ fontSize: 14, color: '#27C93F' }}>✅</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — FEATURES CAROUSEL
           ══════════════════════════════════════════════════════ */}
        <section id="features" style={{ ...sectionStyle(C.bgSec), overflow: 'hidden' }}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Concrètement, ça fait quoi ? 🤔</h2>
            <p style={sectionSub}>Un aperçu de ce que vos assistants font pour vous, automatiquement.</p>
          </div>

          {/* Auto-scrolling carousel */}
          <div
            ref={carouselRef}
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
            onTouchStart={() => setCarouselPaused(true)}
            onTouchEnd={() => setCarouselPaused(false)}
            style={{
              overflow: 'hidden',
              width: '100%',
              padding: '0 0 8px',
            }}
          >
            <div style={{
              display: 'flex',
              gap: 12,
              animation: 'scroll-features 60s linear infinite',
              animationPlayState: carouselPaused ? 'paused' : 'running',
              width: 'max-content',
            }}>
              {duplicatedItems.map((item, i) => (
                <div key={i} style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  whiteSpace: 'nowrap',
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 500,
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Category labels below */}
          <div style={{
            ...containerStyle,
            marginTop: 32,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
          }}>
            {FEATURE_COLUMNS.map((col, i) => (
              <div key={i} style={{
                padding: '8px 16px',
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}>
                {col.title}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — DASHBOARD SCREENSHOT
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Votre dashboard, adapté à votre métier 🎯</h2>
            <p style={sectionSub}>Le menu s&apos;adapte automatiquement selon votre activité et votre profession.</p>

            <div style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              maxWidth: 900,
              margin: '0 auto',
              position: 'relative',
            }}>
              {/* Browser chrome */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderBottom: `1px solid ${C.border}`,
                background: C.bgSec,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
                <div style={{
                  marginLeft: 16,
                  flex: 1,
                  background: C.bg,
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: C.muted,
                  fontFamily: 'monospace',
                }}>
                  app.freenzy.io/client/dashboard
                </div>
              </div>

              <div style={{
                display: 'flex',
                minHeight: isMobile ? 'auto' : 380,
                flexDirection: isMobile ? 'column' : 'row',
              }}>
                {/* Sidebar */}
                <div style={{
                  width: isMobile ? '100%' : 220,
                  borderRight: isMobile ? 'none' : `1px solid ${C.border}`,
                  borderBottom: isMobile ? `1px solid ${C.border}` : 'none',
                  padding: '16px 12px',
                  background: C.bgSec,
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 16,
                    padding: '0 8px',
                  }}>
                    FREENZY.IO
                  </div>
                  {SIDEBAR_ITEMS.map((item, i) => (
                    <div key={i} style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      color: i === 0 ? C.text : C.secondary,
                      fontWeight: i === 0 ? 600 : 400,
                      background: i === 0 ? C.bg : 'transparent',
                      marginBottom: 2,
                      cursor: 'default',
                    }}>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: isMobile ? 16 : 24 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 24 }}>
                    Bienvenue, Marie 👋
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: 12,
                    marginBottom: 24,
                  }}>
                    {[
                      { label: 'Assistants actifs', value: '12', emoji: '🤖', bg: '#F0F7FF' },
                      { label: 'Actions ce mois', value: '23', emoji: '⚡', bg: '#FFF8F0' },
                      { label: 'Crédits restants', value: '47', emoji: '💎', bg: '#F0FFF4' },
                    ].map((kpi, i) => (
                      <div key={i} style={{
                        background: kpi.bg,
                        borderRadius: 10,
                        padding: 16,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{kpi.emoji}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{kpi.value}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    {[
                      { name: 'Secrétaire IA', action: 'RDV confirmé — mardi 14h', time: 'Il y a 5 min' },
                      { name: 'Devis Pro', action: 'Devis #047 envoyé à Acme Corp', time: 'Il y a 12 min' },
                      { name: 'Réputation', action: '3 avis Google traités', time: 'Il y a 1h' },
                    ].map((activity, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: C.bgSec,
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{activity.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{activity.action}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Label overlay */}
              <div style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: C.text,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
                ✨ Le menu s&apos;adapte selon votre profil
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — PROFILES
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Quel que soit votre métier 🎯</h2>
            <p style={sectionSub}>Freenzy s&apos;adapte à votre activité avec des assistants spécialisés.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
            }}>
              {PROFILES.map((p, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredProfile(i)}
                  onMouseLeave={() => setHoveredProfile(null)}
                  style={{
                    ...cardStyle,
                    textAlign: 'center',
                    cursor: 'default',
                    position: 'relative',
                    padding: 28,
                    minHeight: hoveredProfile === i ? 200 : 140,
                    transition: 'all 0.25s ease',
                    boxShadow: hoveredProfile === i ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{p.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{p.count} assistants dédiés</div>

                  {hoveredProfile === i && (
                    <div style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: `1px solid ${C.border}`,
                    }}>
                      {p.assistants.map((a, ai) => (
                        <div key={ai} style={{
                          fontSize: 12,
                          color: C.secondary,
                          padding: '3px 0',
                        }}>
                          {a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Opérationnel en 2 minutes ⚡</h2>
            <p style={sectionSub}>3 étapes simples pour démarrer.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 24,
            }}>
              {[
                { emoji: '🎯', step: '1', title: 'Testez gratuitement', desc: 'Pas de carte bancaire. 5 messages gratuits pour découvrir.' },
                { emoji: '⚙️', step: '2', title: 'On configure tout', desc: 'Quiz rapide de 2 minutes. Dashboard personnalisé selon votre métier.' },
                { emoji: '🚀', step: '3', title: 'Vos assistants travaillent', desc: 'Briefings, relances, documents — tout se fait automatiquement.' },
              ].map((s, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 32,
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: C.text,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — FORMATIONS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Formez-vous gratuitement 🎓</h2>
            <p style={sectionSub}>22 parcours, 396 leçons, diplômes téléchargeables</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 900,
              margin: '0 auto',
            }}>
              {[
                { emoji: '🧠', title: 'Prompt Engineering', level: 'Intermédiaire', duration: '1h', color: '#F0F7FF' },
                { emoji: '🎨', title: 'Créer du contenu pro', level: 'Débutant', duration: '1h', color: '#FFF8F0' },
                { emoji: '🛡️', title: 'Droit de l\'IA', level: 'Avancé', duration: '1h', color: '#F0FFF4' },
              ].map((course, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  padding: 28,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: course.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    margin: '0 auto 16px',
                  }}>
                    {course.emoji}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{course.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: C.bgSec,
                      border: `1px solid ${C.border}`,
                      color: C.secondary,
                      fontWeight: 500,
                    }}>
                      {course.level}
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: C.bgSec,
                      border: `1px solid ${C.border}`,
                      color: C.secondary,
                      fontWeight: 500,
                    }}>
                      {course.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/client/learn" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: C.text,
                color: '#fff',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Voir toutes les formations &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — NEWS IA
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>L&apos;actu IA, résumée pour vous 📰</h2>
            <p style={sectionSub}>Les dernières nouvelles du monde de l&apos;intelligence artificielle.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 900,
              margin: '0 auto',
            }}>
              {[
                { emoji: '🧠', title: 'Claude 4 Opus : ce que ça change pour les entreprises', date: '15 mars 2026', tag: 'Modèles IA' },
                { emoji: '⚖️', title: 'AI Act européen : les nouvelles obligations pour 2026', date: '14 mars 2026', tag: 'Régulation' },
                { emoji: '🚀', title: 'Comment les PME françaises adoptent l\'IA en 2026', date: '13 mars 2026', tag: 'Tendances' },
              ].map((article, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  padding: 24,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{article.emoji}</div>
                  <span style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: C.bgSec,
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontWeight: 500,
                  }}>
                    {article.tag}
                  </span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginTop: 10, marginBottom: 8, lineHeight: 1.4 }}>
                    {article.title}
                  </h3>
                  <div style={{ fontSize: 12, color: C.muted }}>{article.date}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/client/news-ai" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: C.text,
                color: '#fff',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Lire toutes les news &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — TARIFS (CRÉDITS ONLY)
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Transparent et sans surprise 💎</h2>
            <p style={sectionSub}>Pas d&apos;abonnement. Rechargez quand vous voulez.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
              maxWidth: 900,
              margin: '0 auto 32px',
            }}>
              {[
                { credits: '10', price: '10€', bonus: null },
                { credits: '50', price: '45€', bonus: '10% offert' },
                { credits: '100', price: '80€', bonus: '20% offert', highlight: true },
                { credits: '500', price: '350€', bonus: '30% offert' },
              ].map((pack, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 28,
                  border: pack.highlight ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                  position: 'relative',
                }}>
                  {pack.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: C.text,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}>
                      Populaire
                    </div>
                  )}
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginBottom: 4 }}>{pack.credits}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>crédits</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>{pack.price}</div>
                  {pack.bonus && (
                    <div style={{
                      fontSize: 12,
                      color: '#16A34A',
                      fontWeight: 600,
                      marginTop: 8,
                      padding: '3px 10px',
                      background: '#F0FFF4',
                      borderRadius: 12,
                      display: 'inline-block',
                    }}>
                      {pack.bonus}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              maxWidth: 500,
              margin: '0 auto',
            }}>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: 0 }}>
                🎁 50 crédits offerts à l&apos;inscription · 1 crédit ≈ 1 action IA
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — FAQ
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={{ ...containerStyle, maxWidth: 720 }}>
            <h2 style={sectionTitle}>Des questions ? 💬</h2>
            <p style={sectionSub}>Les réponses aux 10 questions les plus posées.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQ_SELECTION.map((faq, i) => (
                <div key={i} style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.text,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ flex: 1, paddingRight: 16 }}>{faq.q}</span>
                    <span style={{
                      fontSize: 18,
                      color: C.muted,
                      transition: 'transform 0.2s ease',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{
                      padding: '0 20px 16px',
                      fontSize: 13,
                      color: C.secondary,
                      lineHeight: 1.7,
                    }}>
                      {faq.a.length > 300 ? faq.a.substring(0, 300) + '...' : faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/faq" style={{
                fontSize: 14,
                color: C.text,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}>
                Voir les 100+ questions &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 10 — PARRAINAGE
           ══════════════════════════════════════════════════════ */}
        <section style={{
          ...sectionStyle(C.text),
          padding: '64px 24px',
        }}>
          <div style={{
            ...containerStyle,
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Partagez Freenzy, gagnez des crédits 🎁
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 12, maxWidth: 520, margin: '0 auto 12px' }}>
              Invitez un ami &rarr; vous gagnez 20 crédits, il gagne 20 crédits.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Sans limite de parrainages.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/client/referrals" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: '#FFFFFF',
                color: C.text,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Obtenir mon lien &rarr;
              </Link>
              <Link href="/login?mode=register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: 'transparent',
                color: '#FFFFFF',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                Créer mon compte
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════════
          SECTION 11 — FOOTER
         ══════════════════════════════════════════════════════ */}
      <PublicFooter />
    </>
  );
}
