'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import EnterpriseSection from './plans/EnterpriseSection';
import { FAQ_CATEGORIES, TOTAL_FAQ_COUNT } from '../lib/faq-data';
import { getOrderedFaqCategories } from '../lib/faq-utils';
import {
  WA_MESSAGES, WHY_FREENZY, TRUST_BADGES,
  DISCUSSION_HIGHLIGHTS, DISCUSSION_CATEGORIES,
  PERSONAL_AGENTS_LANDING,
  STUDIO_FEATURES, STUDIO_CATEGORIES,
  CUSTOM_EXAMPLES,
  REWARDS_CHIPS,
} from '../lib/landing-data';

/* ═══════════════════════════════════════════════════════════
   V2 LANDING — Ultra-minimalist, emoji-driven, COMPLETE
   Concept: Apple simplicity meets emoji personality
   All sections from main landing, adapted to v2 aesthetic
   ═══════════════════════════════════════════════════════════ */

const TOOLS = [
  { emoji: '📞', name: 'Repondeur IA', desc: 'Repond a vos appels 24/7' },
  { emoji: '📄', name: 'Documents', desc: 'Genere contrats et courriers' },
  { emoji: '📱', name: 'Reseaux sociaux', desc: 'Publie et analyse pour vous' },
  { emoji: '💬', name: 'Chat IA', desc: '100+ agents specialises' },
  { emoji: '🎬', name: 'Studio creatif', desc: 'Photos et videos par IA' },
  { emoji: '💚', name: 'WhatsApp', desc: 'Pilotez tout depuis WhatsApp' },
  { emoji: '☀️', name: 'Briefing matinal', desc: 'Reveil intelligent personnalise' },
  { emoji: '🧠', name: 'Discussions', desc: 'Reflexions profondes avec l\'IA' },
  { emoji: '🕹️', name: 'Arcade', desc: 'Gamification et recompenses' },
  { emoji: '👥', name: 'Equipe', desc: 'Collaboration temps reel' },
  { emoji: '📊', name: 'Analytics', desc: 'Tableaux de bord intelligents' },
  { emoji: '🛒', name: 'Marketplace', desc: '50 templates prets a l\'emploi' },
];

const NUMBERS = [
  { value: '100+', label: 'agents IA', emoji: '🤖' },
  { value: '0%', label: 'commission', emoji: '💎' },
  { value: '50', label: 'credits offerts', emoji: '🎁' },
  { value: '24/7', label: 'disponibilite', emoji: '⚡' },
];

const STEPS = [
  { emoji: '1️⃣', title: 'Explorez', desc: 'Accedez au dashboard sans inscription. Decouvrez les agents.' },
  { emoji: '2️⃣', title: 'Activez', desc: 'Choisissez vos agents. Configurez en un clic.' },
  { emoji: '3️⃣', title: 'Automatisez', desc: 'Vos agents travaillent. Vous gerez depuis WhatsApp.' },
];

const QUOTES = [
  { text: 'J\'ai remplace 4 outils par Freenzy. Tout est au meme endroit.', name: 'Marie L.', role: 'Freelance' },
  { text: 'Le repondeur IA a transforme mon cabinet. Je ne rate plus aucun appel.', name: 'Dr. Benoit R.', role: 'Medecin' },
  { text: 'Simple, beau, efficace. Exactement ce qu\'il me fallait.', name: 'Sarah K.', role: 'E-commerce' },
];

// Section heading style — reused across all sections
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
  color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10,
};
const sectionH2: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(24px, 4vw, 40px)',
  fontWeight: 700, letterSpacing: '-0.03em',
  color: '#1A1A1A', marginBottom: 12,
};

export default function V2Landing() {
  const [activeQuote, setActiveQuote] = useState(0);
  const [faqCat, setFaqCat] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [customIdx, setCustomIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveQuote(p => (p + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Auto-rotate custom examples
  useEffect(() => {
    const t = setInterval(() => setCustomIdx(p => (p + 1) % CUSTOM_EXAMPLES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const orderedFaq = getOrderedFaqCategories(FAQ_CATEGORIES, null);

  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56, background: '#fff' }}>

        {/* ══ HERO — One line, maximum impact ══ */}
        <section style={{
          minHeight: 'calc(100vh - 56px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          padding: '0 24px', textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {/* Floating emojis — subtle, decorative */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
              opacity: 0.08, fontSize: 'clamp(40px, 8vw, 80px)',
            }}>
              <span style={{ position: 'absolute', top: '15%', left: '8%' }}>🤖</span>
              <span style={{ position: 'absolute', top: '25%', right: '12%' }}>📞</span>
              <span style={{ position: 'absolute', bottom: '30%', left: '15%' }}>🎬</span>
              <span style={{ position: 'absolute', bottom: '20%', right: '8%' }}>💬</span>
              <span style={{ position: 'absolute', top: '60%', left: '5%' }}>📄</span>
              <span style={{ position: 'absolute', top: '10%', right: '30%' }}>⚡</span>
            </div>

            <p style={{
              fontSize: 13, fontWeight: 600, color: '#9B9B9B',
              letterSpacing: 3, textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              freenzy.io <span style={{ fontSize: 8, fontStyle: 'italic', letterSpacing: 0, fontWeight: 400, opacity: 0.7 }}>Beta Test 1</span>
            </p>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 8vw, 80px)',
              fontWeight: 700, lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: '#1A1A1A',
              marginBottom: 24,
            }}>
              Utilisez
              <br />
              vraiment
              <br />
              l&apos;IA.
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#6B6B6B', lineHeight: 1.6,
              maxWidth: 420, margin: '0 auto 36px',
            }}>
              100+ agents IA pour tout gerer.
              <br />
              <span style={{ color: '#1A1A1A', fontWeight: 600 }}>Gratuit. Sans inscription.</span>
            </p>

            <Link href="/client/dashboard" style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: '#1A1A1A', color: '#fff',
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Commencer gratuitement
            </Link>

            <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 14 }}>
              Aucune carte bancaire requise
            </p>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 11, color: '#C4C4C4', letterSpacing: 1 }}>SCROLL</span>
            <div style={{
              width: 1, height: 24, background: 'linear-gradient(to bottom, #C4C4C4, transparent)',
            }} />
          </div>
        </section>

        {/* ══ NUMBERS — Clean stats strip ══ */}
        <section style={{
          borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #F0F0F0',
          padding: '40px 24px',
        }}>
          <div style={{
            maxWidth: 800, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
            gap: 24, textAlign: 'center',
          }}>
            {NUMBERS.map((n, i) => (
              <div key={i}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{n.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 700, color: '#1A1A1A',
                  letterSpacing: '-0.02em', display: 'block',
                }}>
                  {n.value}
                </span>
                <span style={{ fontSize: 12, color: '#9B9B9B', fontWeight: 500 }}>{n.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TOOLS — Emoji grid ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={sectionH2}>Tout ce dont vous avez besoin.</h2>
              <p style={{ fontSize: 15, color: '#9B9B9B' }}>
                Chaque emoji est un outil IA complet.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
              gap: 2,
            }}>
              {TOOLS.map((tool, i) => (
                <div key={i} style={{
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: '#FAFAFA',
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{tool.emoji}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: '#1A1A1A',
                    display: 'block', marginBottom: 4,
                  }}>
                    {tool.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#9B9B9B' }}>{tool.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHATSAPP — Pilotage par messagerie ══ */}
        <section style={{ background: '#FAFAFA', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              gap: 40, alignItems: 'center',
            }}>
              <div>
                <p style={sectionLabel}>WhatsApp IA Business</p>
                <h2 style={{ ...sectionH2, fontSize: 'clamp(22px, 3.5vw, 36px)' }}>
                  Pilotez vos agents IA sur <strong>WhatsApp</strong>.
                </h2>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 20 }}>
                  Recevez les resumes, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents repondent en <strong style={{ color: '#1A1A1A' }}>temps reel</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Resumes automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#6B6B6B' }}>
                      <span style={{ fontSize: 16 }}>✅</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              {/* WhatsApp mockup */}
              <div style={{
                background: '#fff', border: '1px solid #E5E5E5', borderRadius: 20, padding: '20px 16px',
                maxWidth: 340, width: '100%', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0', background: '#25D366' }} />
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Freenzy Assistant</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {WA_MESSAGES.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.from === 'user' ? '#dcf8c6' : '#fff',
                      color: '#1A1A1A', borderRadius: 10, padding: '8px 12px',
                      maxWidth: '85%', fontSize: 12, lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      border: '1px solid #E5E5E5',
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 10, color: '#9B9B9B', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ HOW — 3 steps, dead simple ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={sectionH2}>
                3 etapes. C&apos;est tout.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  padding: '28px 0',
                  borderBottom: i < STEPS.length - 1 ? '1px solid #EBEBEB' : 'none',
                }}>
                  <span style={{
                    fontSize: 28, flexShrink: 0,
                    width: 48, textAlign: 'center',
                  }}>{step.emoji}</span>
                  <div>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700, color: '#1A1A1A',
                      marginBottom: 6,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AGENTS PERSONNELS — B2C ══ */}
        <section style={{ background: '#FAFAFA', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={sectionLabel}>Agents IA pour votre vie personnelle</p>
              <h2 style={sectionH2}>
                Des agents IA personnels pour <strong>VOUS</strong>.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Budget, impots, immobilier, coaching, ecriture... <span style={{ color: '#1A1A1A', fontWeight: 600 }}>12 agents personnels</span>, inclus gratuitement.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
              gap: 10,
            }}>
              {PERSONAL_AGENTS_LANDING.map((agent, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12, padding: '14px 16px',
                  borderLeft: '3px solid #E5E5E5',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{agent.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 3 }}>{agent.name}</p>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.4, margin: 0 }}>{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 12, color: '#9B9B9B' }}>+ Coach, Contradicteur, Cineaste, Deconnexion et bien d&apos;autres...</span>
            </div>
          </div>
        </section>

        {/* ══ STUDIO CREATIF ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={sectionLabel}>Studio creatif IA</p>
              <h2 style={sectionH2}>
                Photos, videos, avatars — <strong>generes par l&apos;IA</strong>.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Creez du contenu visuel professionnel en quelques secondes.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
              gap: 12,
            }}>
              {STUDIO_FEATURES.map((f, i) => (
                <div key={i} style={{
                  background: '#FAFAFA', borderRadius: 14, padding: 'clamp(16px, 2.5vw, 24px)',
                  border: '1px solid #E5E5E5',
                }}>
                  <span style={{ fontSize: 28, marginBottom: 10, display: 'block' }}>{f.emoji}</span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{f.title}</h4>
                  <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, margin: '0 0 10px' }}>{f.desc}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#fff', color: '#6B6B6B', fontWeight: 600, border: '1px solid #E5E5E5' }}>{f.badge}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#fff', color: '#6B6B6B', border: '1px solid #E5E5E5' }}>{f.credits}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Category pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {STUDIO_CATEGORIES.map((cat, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 100,
                  background: '#FAFAFA', color: '#1A1A1A', fontWeight: 500,
                  border: '1px solid #E5E5E5',
                }}>{cat}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CREATION SUR MESURE ══ */}
        <section style={{ background: '#FAFAFA', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={sectionLabel}>Modules IA sur mesure</p>
              <h2 style={sectionH2}>
                Creez vos propres modules IA.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Chaque entreprise est <strong style={{ color: '#1A1A1A' }}>unique</strong>. Creez des modules IA adaptes a votre metier.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16,
              marginBottom: 28,
            }}>
              {/* Self-service */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '28px 24px' }}>
                <span style={{ fontSize: 28, marginBottom: 14, display: 'block' }}>🛠️</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                  Vous creez vos agents IA
                </h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 16 }}>
                  Definissez un agent personnalise en quelques minutes : nom, role, instructions, ton, et outils connectes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Definissez le role et les objectifs', 'Choisissez le modele IA', 'Connectez vos outils', 'Testez et deployez instantanement'].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6B6B6B', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>✅</span> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* On-demand */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '28px 24px' }}>
                <span style={{ fontSize: 28, marginBottom: 14, display: 'block' }}>🎯</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                  On cree vos modules pour vous
                </h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 16 }}>
                  Besoin d&apos;un module complexe ou specifique a votre secteur ? Notre equipe le concoit et le deploie.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Agents metier sur mesure', 'Workflows automatises multi-agents', 'Integrations personnalisees', 'Formation et accompagnement inclus'].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6B6B6B', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>✅</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Examples carousel */}
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>
                Exemples de modules crees par nos utilisateurs
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))',
                gap: 10,
              }}>
                {CUSTOM_EXAMPLES.slice(customIdx, customIdx + 4).concat(
                  CUSTOM_EXAMPLES.slice(0, Math.max(0, customIdx + 4 - CUSTOM_EXAMPLES.length))
                ).slice(0, 4).map((ex, i) => (
                  <div key={`${customIdx}-${i}`} style={{
                    padding: '14px 12px', borderRadius: 10,
                    background: '#FAFAFA', border: '1px solid #E5E5E5',
                  }}>
                    <span style={{ fontSize: 20, marginBottom: 6, display: 'block' }}>{ex.emoji}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: '#6B6B6B', lineHeight: 1.5 }}>{ex.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ DISCUSSIONS APPROFONDIES ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              gap: 40, alignItems: 'center',
            }}>
              <div>
                <p style={sectionLabel}>Reflexion profonde</p>
                <h2 style={{ ...sectionH2, fontSize: 'clamp(22px, 3.5vw, 36px)' }}>
                  Explorez les <strong>grandes questions</strong> avec l&apos;IA.
                </h2>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 24 }}>
                  85+ templates de discussion guidee, 16 categories, pensee etendue avec Claude Opus. L&apos;IA <strong style={{ color: '#1A1A1A' }}>reflechit profondement</strong> avec vous.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {DISCUSSION_HIGHLIGHTS.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{h.emoji}</span>
                      <span style={{ fontSize: 13, color: '#6B6B6B' }}>{h.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {DISCUSSION_CATEGORIES.map((cat, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 100,
                      background: '#FAFAFA', color: '#1A1A1A', fontWeight: 500,
                    }}>{cat}</span>
                  ))}
                </div>
                <Link href="/client/discussions" style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: '#1A1A1A', color: '#fff',
                  borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>
                  Explorer les discussions
                </Link>
              </div>
              {/* Discussion mockup */}
              <div style={{
                background: '#FAFAFA', borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E5E5E5',
              }}>
                <div style={{ padding: '10px 14px', display: 'flex', gap: 6, borderBottom: '1px solid #E5E5E5' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                </div>
                <div style={{ padding: '18px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#fff', border: '1px solid #E5E5E5', color: '#1A1A1A', fontWeight: 600 }}>Philosophie</span>
                    <span style={{ fontSize: 11, color: '#9B9B9B' }}>Extended Thinking</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Le bonheur est-il un choix ?</p>
                  <div style={{
                    background: '#fff', border: '1px solid #E5E5E5', borderRadius: '12px 12px 4px 12px',
                    padding: '10px 14px', marginBottom: 10, maxWidth: '85%', marginLeft: 'auto',
                  }}>
                    <p style={{ fontSize: 12, color: '#1A1A1A', lineHeight: 1.5, margin: 0 }}>
                      Est-ce que le bonheur depend de nos circonstances ou de notre attitude interieure ?
                    </p>
                  </div>
                  <div style={{
                    background: '#fff', border: '1px solid #E5E5E5', borderRadius: '12px 12px 12px 4px',
                    padding: '10px 14px', maxWidth: '90%',
                  }}>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, margin: 0 }}>
                      Cette question touche au coeur de la philosophie stoicienne. Epictete distinguait les choses qui dependent de nous...
                    </p>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#E5E5E5' }}>
                      <div style={{ width: '25%', height: '100%', borderRadius: 2, background: '#1A1A1A' }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#9B9B9B' }}>Profondeur 3/20</span>
                  </div>
                </div>
                <div style={{ padding: '8px 18px 12px', borderTop: '1px solid #E5E5E5', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9B9B9B' }}>85+ sujets disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SOCIAL PROOF — Rotating quote ══ */}
        <section style={{
          padding: 'clamp(56px, 8vw, 96px) 24px',
          textAlign: 'center',
          background: '#FAFAFA',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 20, opacity: 0.15 }}>&ldquo;</span>
            <p style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 500, color: '#1A1A1A',
              lineHeight: 1.5, letterSpacing: '-0.01em',
              marginBottom: 20,
              minHeight: 80,
              transition: 'opacity 0.4s',
            }}>
              {QUOTES[activeQuote].text}
            </p>
            <p style={{ fontSize: 13, color: '#9B9B9B' }}>
              <strong style={{ color: '#6B6B6B' }}>{QUOTES[activeQuote].name}</strong> — {QUOTES[activeQuote].role}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuote(i)}
                  aria-label={`Temoignage ${i + 1}`}
                  style={{
                    width: activeQuote === i ? 20 : 6,
                    height: 6, borderRadius: 3,
                    background: activeQuote === i ? '#1A1A1A' : '#E0E0E0',
                    border: 'none', padding: 0, cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══ POURQUOI FREENZY ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={sectionLabel}>Free &amp; Easy — L&apos;IA sans complexite</p>
              <h2 style={sectionH2}>
                L&apos;intelligence artificielle accessible a tous.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8, lineHeight: 1.6, maxWidth: 520, margin: '8px auto 0' }}>
                <strong style={{ color: '#1A1A1A' }}>Complete</strong>, <strong style={{ color: '#1A1A1A' }}>gratuite</strong>, sans abonnement, sans commission, sans complexite.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
              gap: 14,
            }}>
              {WHY_FREENZY.map((item, i) => (
                <div key={i} style={{
                  background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 14,
                  padding: '22px 20px',
                }}>
                  <span style={{ fontSize: 26, marginBottom: 10, display: 'block' }}>{item.emoji}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
              marginTop: 36, paddingTop: 28, borderTop: '1px solid #E5E5E5',
            }}>
              {TRUST_BADGES.map((badge, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 600, color: '#9B9B9B',
                }}>
                  <span style={{ fontSize: 15 }}>{badge.emoji}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ DEMO — Minimal mockup ══ */}
        <section style={{
          padding: 'clamp(48px, 8vw, 80px) 24px',
          background: '#FAFAFA',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={sectionH2}>Simple par design.</h2>
              <p style={{ fontSize: 15, color: '#9B9B9B' }}>
                Un dashboard clair, des emojis pour naviguer.
              </p>
            </div>

            {/* Minimal dashboard mockup */}
            <div style={{
              background: '#fff', borderRadius: 16,
              border: '1px solid #E8E8E8',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #F0F0F0',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0F0F0' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0F0F0' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0F0F0' }} />
                <span style={{ fontSize: 11, color: '#C4C4C4', marginLeft: 8 }}>Flashboard</span>
              </div>

              <div style={{ display: 'flex' }}>
                <div style={{
                  width: 52, borderRight: '1px solid #F0F0F0',
                  padding: '16px 0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  {['🏠', '💬', '📄', '🎬', '📞', '📊'].map((e, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                      background: i === 0 ? '#F5F5F5' : 'transparent',
                    }}>
                      {e}
                    </div>
                  ))}
                </div>

                <div style={{ flex: 1, padding: '20px 24px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 20 }}>🏠</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>Accueil</span>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8, marginBottom: 16,
                  }}>
                    {[
                      { emoji: '🤖', val: '12', lbl: 'Agents actifs' },
                      { emoji: '⚡', val: '847', lbl: 'Actions ce mois' },
                      { emoji: '💎', val: '42.5', lbl: 'Credits' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        padding: '12px 10px', borderRadius: 10,
                        background: '#FAFAFA', textAlign: 'center',
                      }}>
                        <span style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{s.emoji}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', display: 'block' }}>{s.val}</span>
                        <span style={{ fontSize: 9, color: '#9B9B9B' }}>{s.lbl}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { emoji: '📞', name: 'Repondeur', status: 'Actif' },
                      { emoji: '📄', name: 'Documents', status: '3 en cours' },
                      { emoji: '📱', name: 'Social media', status: 'Publie a 14h' },
                    ].map((a, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 8,
                        background: '#FAFAFA',
                      }}>
                        <span style={{ fontSize: 14 }}>{a.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', flex: 1 }}>{a.name}</span>
                        <span style={{ fontSize: 10, color: '#9B9B9B' }}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ ENTERPRISE ══ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <EnterpriseSection />
        </section>

        {/* ══ PRICING — Ultra-simple ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px', background: '#FAFAFA' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={sectionH2}>Transparent. Simple.</h2>
            <p style={{ fontSize: 15, color: '#9B9B9B', marginBottom: 40 }}>
              Payez uniquement ce que vous utilisez. Pas d&apos;abonnement.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: 2, background: '#E5E5E5', borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{ background: '#fff', padding: '36px 28px' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>🆓</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Gratuit</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>0&euro;</p>
                <p style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 20, lineHeight: 1.6 }}>
                  50 credits offerts<br />Acces complet au dashboard<br />Tous les agents disponibles
                </p>
                <Link href="/client/dashboard" style={{
                  display: 'block', padding: '10px 20px',
                  background: '#F5F5F5', color: '#1A1A1A',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', textAlign: 'center',
                }}>
                  Commencer
                </Link>
              </div>

              <div style={{ background: '#fff', padding: '36px 28px', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  background: '#1A1A1A', padding: '3px 10px', borderRadius: 20,
                }}>
                  POPULAIRE
                </div>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>⚡</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Pro</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>A l&apos;usage</p>
                <p style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 20, lineHeight: 1.6 }}>
                  0% commission<br />Credits rechargeables<br />Support prioritaire
                </p>
                <Link href="/plans" style={{
                  display: 'block', padding: '10px 20px',
                  background: '#1A1A1A', color: '#fff',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', textAlign: 'center',
                }}>
                  Voir les tarifs
                </Link>
              </div>

              <div style={{ background: '#fff', padding: '36px 28px' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>🏢</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Entreprise</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Sur devis</p>
                <p style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 20, lineHeight: 1.6 }}>
                  Instance dediee<br />White-label disponible<br />SLA et support 24/7
                </p>
                <Link href="/plans#enterprise" style={{
                  display: 'block', padding: '10px 20px',
                  background: '#F5F5F5', color: '#1A1A1A',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', textAlign: 'center',
                }}>
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ — Questions par theme ══ */}
        <section id="faq" style={{ padding: 'clamp(48px, 8vw, 80px) 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={sectionLabel}>FAQ — Questions frequentes</p>
              <h2 style={sectionH2}>
                {TOTAL_FAQ_COUNT} reponses a vos questions.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
                Tout ce que vous devez savoir sur Freenzy.io.
              </p>
            </div>

            {/* Category tabs */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
              marginBottom: 24,
            }}>
              {orderedFaq.map((cat, ci) => (
                <button
                  key={cat.id}
                  onClick={() => { setFaqCat(ci); setOpenFaq(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, minHeight: 44,
                    border: 'none', cursor: 'pointer',
                    background: faqCat === ci ? '#1A1A1A' : '#FAFAFA',
                    color: faqCat === ci ? '#fff' : '#6B6B6B',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  {cat.label}
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, marginLeft: 2 }}>
                    {cat.questions.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Active category */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              padding: '10px 14px', borderRadius: 10,
              background: '#FAFAFA', border: '1px solid #E5E5E5',
            }}>
              <span style={{ fontSize: 18 }}>{orderedFaq[faqCat].icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{orderedFaq[faqCat].label}</span>
              <span style={{ fontSize: 12, color: '#9B9B9B', marginLeft: 'auto' }}>{orderedFaq[faqCat].questions.length} questions</span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedFaq[faqCat].questions.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={`${faqCat}-${i}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenFaq(isOpen ? null : i);
                      }
                    }}
                    style={{
                      background: isOpen ? '#FAFAFA' : '#fff',
                      border: '1px solid #E5E5E5',
                      borderLeft: `3px solid ${isOpen ? '#1A1A1A' : '#E5E5E5'}`,
                      borderRadius: 10, padding: '14px 16px',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{faq.q}</div>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isOpen ? '#1A1A1A' : '#FAFAFA',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: isOpen ? '#fff' : '#9B9B9B',
                        transition: 'all 0.2s',
                      }}>
                        {isOpen ? '−' : '+'}
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{
                        marginTop: 12, paddingTop: 12,
                        borderTop: '1px solid #E5E5E5',
                        fontSize: 13, color: '#6B6B6B', lineHeight: 1.7,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL — Pure minimalism ══ */}
        <section style={{
          padding: 'clamp(80px, 12vw, 160px) 24px',
          textAlign: 'center',
          background: '#FAFAFA',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 24 }}>🚀</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700, letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#1A1A1A', marginBottom: 16,
            }}>
              Pret a commencer ?
            </h2>
            <p style={{
              fontSize: 16, color: '#6B6B6B', marginBottom: 24,
              lineHeight: 1.6,
            }}>
              Gratuit. Sans inscription. Sans carte bancaire.
              <br />
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Juste vous et 100+ agents IA.</span>
            </p>

            {/* Rewards chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {REWARDS_CHIPS.map((chip, i) => (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 100,
                  background: '#fff', border: '1px solid #E5E5E5',
                }}>
                  <span style={{ fontSize: 15 }}>{chip.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{chip.text}</span>
                </div>
              ))}
            </div>

            <Link href="/client/dashboard" style={{
              display: 'inline-block',
              padding: '16px 48px',
              background: '#1A1A1A', color: '#fff',
              borderRadius: 10, fontSize: 16, fontWeight: 600,
              textDecoration: 'none',
            }}>
              Acceder a Freenzy
            </Link>
            <div style={{ marginTop: 16 }}>
              <Link href="/plans" style={{ fontSize: 12, color: '#9B9B9B', textDecoration: 'none' }}>
                Voir les tarifs detailles →
              </Link>
            </div>
            <p style={{ fontSize: 12, color: '#C4C4C4', marginTop: 16 }}>
              freenzy.io <span style={{ fontStyle: 'italic', fontSize: 9, opacity: 0.7 }}>Beta Test 1</span> — l&apos;IA pour tous
            </p>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
