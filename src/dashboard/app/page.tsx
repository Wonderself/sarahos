'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { FAQ_CATEGORIES } from '../lib/faq-data';

/* ═══════════════════════════════════════════════════════════
   FREENZY.IO — Landing Page v3
   10 sections, inline styles, mobile-first, Notion palette
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

// ─── Floating emojis data
const FLOAT_EMOJIS = [
  { e: '\u{1F916}', top: '8%', left: '5%', size: 38, delay: 0 },
  { e: '\u{1F4AC}', top: '15%', left: '85%', size: 32, delay: 2 },
  { e: '\u{1F4CA}', top: '30%', left: '10%', size: 28, delay: 4 },
  { e: '\u{26A1}', top: '25%', left: '90%', size: 34, delay: 1 },
  { e: '\u{1F4DD}', top: '50%', left: '3%', size: 30, delay: 6 },
  { e: '\u{1F3A8}', top: '55%', left: '92%', size: 36, delay: 3 },
  { e: '\u{1F4E7}', top: '70%', left: '8%', size: 26, delay: 5 },
  { e: '\u{1F4B3}', top: '65%', left: '88%', size: 30, delay: 7 },
  { e: '\u{1F3AF}', top: '80%', left: '15%', size: 32, delay: 2 },
  { e: '\u2728', top: '10%', left: '45%', size: 24, delay: 8 },
  { e: '\u{1F680}', top: '40%', left: '95%', size: 28, delay: 9 },
  { e: '\u{1F4A1}', top: '85%', left: '80%', size: 30, delay: 4 },
  { e: '\u{1F916}', top: '45%', left: '50%', size: 22, delay: 10 },
  { e: '\u{1F4AC}', top: '75%', left: '55%', size: 26, delay: 11 },
  { e: '\u{26A1}', top: '20%', left: '30%', size: 20, delay: 6 },
];

// ─── Feature blocks
const FEATURES = [
  {
    title: 'Repondez a vos avis Google en 1 clic',
    desc: 'Votre assistant analyse chaque avis, detecte le ton, et redige une reponse professionnelle et personnalisee. Vous validez, il publie.',
    mockup: {
      review: { stars: 4, name: 'Marie D.', text: 'Tres bon service, livraison un peu lente mais qualite au top !' },
      response: 'Merci Marie pour votre retour ! Nous travaillons activement sur nos delais de livraison. Ravie que la qualite vous ait plu.',
    },
  },
  {
    title: 'Generez un devis pro en 3 minutes',
    desc: 'Decrivez votre prestation en langage naturel. L\'assistant genere un devis complet, chiffre, avec CGV et export PDF.',
    mockup: {
      client: 'Acme Corp',
      ref: 'DEV-2026-0047',
      total: '4 800,00 \u20AC HT',
      lines: ['Integration API — 2 400\u20AC', 'Formation equipe — 1 200\u20AC', 'Support 3 mois — 1 200\u20AC'],
    },
  },
  {
    title: 'Votre secretaire IA repond 24h/24',
    desc: 'Appels, emails, WhatsApp : votre assistant repond avec une voix naturelle, qualifie les demandes et vous transmet un resume.',
    mockup: {
      incoming: 'Bonjour, je souhaite prendre RDV pour une consultation mardi prochain.',
      reply: 'Bonjour ! J\'ai un creneau disponible mardi a 10h ou 14h. Lequel vous convient ?',
      status: 'RDV confirme · mardi 14h · rappel envoye',
    },
  },
  {
    title: 'Creez du contenu LinkedIn viral',
    desc: 'Donnez un sujet, choisissez le ton. L\'assistant redige des posts optimises avec hashtags, hooks et appels a l\'action.',
    mockup: {
      hook: 'J\'ai automatise 80% de mon admin en 2 semaines.',
      body: 'Voici les 3 outils qui ont change ma productivite...',
      hashtags: '#IA #Productivite #PME #Automatisation',
      engagement: '47 likes · 12 commentaires · 3 partages',
    },
  },
];

// ─── Profession cards
const PROFILES = [
  { emoji: '\u{1F527}', name: 'Artisan', count: 5, assistants: ['Devis automatique', 'Relance clients', 'Avis Google'] },
  { emoji: '\u{1F3E5}', name: 'Sante', count: 5, assistants: ['Prise de RDV', 'Rappels patients', 'Comptes-rendus'] },
  { emoji: '\u{1F3A8}', name: 'Agence', count: 6, assistants: ['Brief creatif', 'Social media', 'Reporting client'] },
  { emoji: '\u{1F6D2}', name: 'E-commerce', count: 5, assistants: ['Fiches produits', 'SAV automatise', 'Relance paniers'] },
  { emoji: '\u{1F3AF}', name: 'Coach', count: 4, assistants: ['Planning seances', 'Suivi client', 'Contenu expert'] },
  { emoji: '\u{1F37D}\uFE0F', name: 'Restaurant', count: 4, assistants: ['Reservations', 'Menu du jour', 'Avis Google'] },
  { emoji: '\u2696\uFE0F', name: 'Liberal', count: 5, assistants: ['Contrats IA', 'Veille juridique', 'Facturation'] },
  { emoji: '\u{1F3E2}', name: 'PME', count: 8, assistants: ['RH complet', 'Comptabilite', 'Commercial'] },
];

// ─── Plans
const PLANS = [
  { name: 'Gratuit', members: '3 membres', price: '0\u20AC', sub: 'pour toujours', features: ['3 membres', '150+ assistants', 'Dashboard complet'] },
  { name: 'Pro', members: '10 membres', price: '19\u20AC', sub: '/mois', features: ['10 membres', 'Roles & permissions', 'Support prioritaire'], highlight: true },
  { name: 'Business', members: '25 membres', price: '49\u20AC', sub: '/mois', features: ['25 membres', 'API access', 'Onboarding dedie'] },
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

export default function LandingPage() {
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <>
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-emoji {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
              opacity: 0.06,
              animation: `float-emoji 20s ease-in-out infinite`,
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
                fontSize: isMobile ? 32 : 44,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: 20,
              }}>
                Vos assistants IA travaillent pendant que vous dormez.
              </h1>
              <p style={{
                fontSize: isMobile ? 16 : 18,
                color: C.secondary,
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 520,
                marginLeft: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 'auto' : undefined,
              }}>
                150+ outils IA pour PME, independants et equipes. 0% commission. 50 credits offerts.
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
                  Voir ce que ca fait
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
                    { emoji: '\u{1F916}', label: '12 Assistants actifs', bg: '#F0F7FF' },
                    { emoji: '\u26A1', label: '23 Actions ce mois', bg: '#FFF8F0' },
                    { emoji: '\u{1F48E}', label: '47 Credits', bg: '#F0FFF4' },
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
                    { name: 'Secretaire IA', status: true },
                    { name: 'Devis Pro', status: true },
                    { name: 'Reputation Google', status: true },
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
                      <span style={{ fontSize: 14, color: '#27C93F' }}>{agent.status ? '\u2705' : '\u23F8'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — FEATURES
           ══════════════════════════════════════════════════════ */}
        <section id="features" style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Ce que Freenzy fait pour vous</h2>
            <p style={sectionSub}>Chaque assistant est specialise. Voici 4 cas concrets.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              {FEATURES.map((feat, idx) => {
                const reversed = idx % 2 === 1;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : (reversed ? 'row-reverse' : 'row'),
                    alignItems: 'center',
                    gap: 40,
                  }}>
                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: '-0.01em' }}>
                        {feat.title}
                      </h3>
                      <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.6 }}>
                        {feat.desc}
                      </p>
                    </div>

                    {/* Mockup */}
                    <div style={{ flex: 1, width: '100%' }}>
                      {idx === 0 && (
                        /* Google review mockup */
                        <div style={{ ...cardStyle, padding: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>M</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{feat.mockup.review.name}</div>
                              <div style={{ fontSize: 12, color: '#F59E0B' }}>{'★'.repeat(feat.mockup.review.stars)}{'☆'.repeat(5 - feat.mockup.review.stars)}</div>
                            </div>
                          </div>
                          <p style={{ fontSize: 13, color: C.secondary, marginBottom: 16, lineHeight: 1.5 }}>&quot;{feat.mockup.review.text}&quot;</p>
                          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{'\u{1F916}'} Reponse generee par Freenzy</div>
                            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontStyle: 'italic' }}>{feat.mockup.response}</p>
                          </div>
                        </div>
                      )}

                      {idx === 1 && (
                        /* Devis mockup */
                        <div style={{ ...cardStyle, padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>DEVIS</div>
                              <div style={{ fontSize: 11, color: C.muted }}>{feat.mockup.ref}</div>
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>Client: {feat.mockup.client}</div>
                          </div>
                          {feat.mockup.lines.map((line: string, li: number) => (
                            <div key={li} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: li < feat.mockup.lines.length - 1 ? `1px solid ${C.border}` : 'none',
                              fontSize: 13,
                              color: C.text,
                            }}>
                              <span>{line.split(' \u2014 ')[0]}</span>
                              <span style={{ fontWeight: 600 }}>{line.split(' \u2014 ')[1]}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTop: `2px solid ${C.text}` }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Total: {feat.mockup.total}</span>
                          </div>
                        </div>
                      )}

                      {idx === 2 && (
                        /* Secretary mockup */
                        <div style={{ ...cardStyle, padding: 20 }}>
                          <div style={{
                            background: C.bgSec,
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 10,
                            borderLeft: `3px solid ${C.border}`,
                          }}>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Patient</div>
                            <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{feat.mockup.incoming}</p>
                          </div>
                          <div style={{
                            background: '#F0F7FF',
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 10,
                            borderLeft: '3px solid #3B82F6',
                          }}>
                            <div style={{ fontSize: 11, color: '#3B82F6', marginBottom: 4 }}>{'\u{1F916}'} Secretaire IA</div>
                            <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{feat.mockup.reply}</p>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            background: '#F0FFF4',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#16A34A',
                            fontWeight: 500,
                          }}>
                            \u2705 {feat.mockup.status}
                          </div>
                        </div>
                      )}

                      {idx === 3 && (
                        /* LinkedIn mockup */
                        <div style={{ ...cardStyle, padding: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>in</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Votre post LinkedIn</div>
                              <div style={{ fontSize: 11, color: C.muted }}>Il y a 2h</div>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{feat.mockup.hook}</p>
                          <p style={{ fontSize: 13, color: C.secondary, marginBottom: 10, lineHeight: 1.5 }}>{feat.mockup.body}</p>
                          <p style={{ fontSize: 12, color: '#0077B5', marginBottom: 12 }}>{feat.mockup.hashtags}</p>
                          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, fontSize: 12, color: C.muted }}>
                            {feat.mockup.engagement}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — PROFILES
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Adapte a votre metier</h2>
            <p style={sectionSub}>Quel que soit votre metier, Freenzy s&apos;adapte.</p>

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
                    minHeight: hoveredProfile === i ? 180 : 120,
                    transition: 'all 0.25s ease',
                    boxShadow: hoveredProfile === i ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{p.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.count} assistants</div>

                  {hoveredProfile === i && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 12,
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
            SECTION 4 — HOW IT WORKS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Comment ca marche</h2>
            <p style={sectionSub}>3 etapes pour demarrer. Pas de carte bancaire.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 24,
            }}>
              {[
                { emoji: '\u{1F3AF}', step: '1', title: 'Testez gratuitement', desc: '5 messages gratuits, sans inscription. Decouvrez vos assistants en action.' },
                { emoji: '\u26A1', step: '2', title: 'Creez votre compte', desc: 'Quiz 2 min, dashboard personnalise. 50 credits offerts immediatement.' },
                { emoji: '\u{1F680}', step: '3', title: 'Vos assistants travaillent', desc: 'Automatisations, briefings matinaux, relances clients — tout tourne pour vous.' },
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
            SECTION 5 — TEAMS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Travaillez en equipe avec l&apos;IA</h2>
            <p style={sectionSub}>Chaque membre de votre equipe a acces aux memes assistants, avec des roles et permissions.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 900,
              margin: '0 auto',
            }}>
              {PLANS.map((plan, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 32,
                  border: plan.highlight ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                  position: 'relative',
                }}>
                  {plan.highlight && (
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
                    }}>
                      Populaire
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>{plan.name}</h3>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{plan.members}</div>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: C.text }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: C.muted }}>{plan.sub}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{ fontSize: 13, color: C.secondary }}>
                        \u2713 {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/login?mode=register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: C.text,
                color: '#fff',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Creer mon equipe gratuitement &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — PRICING
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Credits IA — payez uniquement ce que vous utilisez</h2>
            <p style={sectionSub}>1 credit ≈ 1 action IA (email, devis, reponse avis...). Pas d&apos;abonnement, pas de surprise.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 720,
              margin: '0 auto 32px',
            }}>
              {[
                { credits: '50', price: '4,99\u20AC', perCredit: '0,10\u20AC', badge: 'Starter' },
                { credits: '200', price: '14,99\u20AC', perCredit: '0,075\u20AC', badge: 'Pro', highlight: true },
                { credits: '500', price: '29,99\u20AC', perCredit: '0,06\u20AC', badge: 'Business' },
              ].map((pack, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 28,
                  border: pack.highlight ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{pack.badge}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginBottom: 4 }}>{pack.credits}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>credits</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>{pack.price}</div>
                  <div style={{ fontSize: 12, color: C.secondary }}>{pack.perCredit} / credit</div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
              marginTop: 24,
            }}>
              {[
                '\u{1F381} 50 credits offerts',
                '\u{1F48E} 0% commission',
                '\u221E Credits sans expiration',
              ].map((chip, i) => (
                <div key={i} style={{
                  padding: '8px 18px',
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 500,
                }}>
                  {chip}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — SOCIAL PROOF
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Ce que les assistants font chaque semaine</h2>
            <p style={sectionSub}>Cas d&apos;usage types — voici ce que Freenzy automatise au quotidien.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
            }}>
              {[
                { emoji: '\u{1F4E7}', value: '1 240+', label: 'emails rediges et envoyes', desc: 'Propositions commerciales, relances, confirmations' },
                { emoji: '\u{1F4C4}', value: '380+', label: 'documents generes', desc: 'Devis, contrats, NDA, rapports, CGV' },
                { emoji: '\u{1F465}', value: '85+', label: 'equipes actives', desc: 'PME, agences, cabinets, independants' },
              ].map((stat, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 32,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{stat.emoji}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — REFERRAL
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
              Invitez, gagnez.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              20 credits pour vous, 20 pour votre filleul. Sans limite de parrainages.
            </p>
            <Link href="/login?mode=register" style={{
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
              Creer mon compte &rarr;
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — FAQ
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={{ ...containerStyle, maxWidth: 720 }}>
            <h2 style={sectionTitle}>Questions frequentes</h2>
            <p style={sectionSub}>Les reponses aux 10 questions les plus posees.</p>

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

      </main>

      {/* ══════════════════════════════════════════════════════
          SECTION 10 — FOOTER
         ══════════════════════════════════════════════════════ */}
      <PublicFooter />
    </>
  );
}
