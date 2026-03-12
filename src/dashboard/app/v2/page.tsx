'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ═══════════════════════════════════════════════════════════
   V2 LANDING — Ultra-minimalist, emoji-driven
   Concept: Apple simplicity meets emoji personality
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

export default function V2Landing() {
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveQuote(p => (p + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

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

        {/* ══ TOOLS — Emoji grid, nothing else ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: '#1A1A1A', marginBottom: 12,
              }}>
                Tout ce dont vous avez besoin.
              </h2>
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

        {/* ══ HOW — 3 steps, dead simple ══ */}
        <section style={{
          padding: 'clamp(48px, 8vw, 96px) 24px',
          background: '#FAFAFA',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: '#1A1A1A',
              }}>
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

        {/* ══ SOCIAL PROOF — Single rotating quote ══ */}
        <section style={{
          padding: 'clamp(56px, 8vw, 96px) 24px',
          textAlign: 'center',
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
            {/* Dots */}
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

        {/* ══ DEMO — Minimal mockup ══ */}
        <section style={{
          padding: 'clamp(48px, 8vw, 80px) 24px',
          background: '#FAFAFA',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: 700, letterSpacing: '-0.03em',
                color: '#1A1A1A', marginBottom: 12,
              }}>
                Simple par design.
              </h2>
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
              {/* Title bar */}
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
                {/* Mini sidebar */}
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

                {/* Content area */}
                <div style={{ flex: 1, padding: '20px 24px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 20 }}>🏠</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>Accueil</span>
                  </div>

                  {/* Mini stat cards */}
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

                  {/* Mini agent list */}
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

        {/* ══ PRICING — Ultra-simple ══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: '#1A1A1A', marginBottom: 12,
            }}>
              Transparent. Simple.
            </h2>
            <p style={{ fontSize: 15, color: '#9B9B9B', marginBottom: 40 }}>
              Payez uniquement ce que vous utilisez. Pas d&apos;abonnement.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: 2, background: '#F0F0F0', borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Free */}
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

              {/* Pro */}
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

              {/* Enterprise */}
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

        {/* ══ CTA FINAL — Pure minimalism ══ */}
        <section style={{
          padding: 'clamp(80px, 12vw, 160px) 24px',
          textAlign: 'center',
          background: '#FAFAFA',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <span style={{
              fontSize: 48, display: 'block', marginBottom: 24,
            }}>
              🚀
            </span>
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
              fontSize: 16, color: '#6B6B6B', marginBottom: 32,
              lineHeight: 1.6,
            }}>
              Gratuit. Sans inscription. Sans carte bancaire.
              <br />
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Juste vous et 100+ agents IA.</span>
            </p>
            <Link href="/client/dashboard" style={{
              display: 'inline-block',
              padding: '16px 48px',
              background: '#1A1A1A', color: '#fff',
              borderRadius: 12, fontSize: 16, fontWeight: 600,
              textDecoration: 'none',
            }}>
              Acceder a Freenzy
            </Link>
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
