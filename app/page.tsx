'use client';

import { useState } from 'react';
import Link from 'next/link';

// Minimal agent list for the landing
const FEATURED_AGENTS = [
  { icon: 'call', name: 'Repondeur 24/7', desc: 'Ne manquez plus aucun appel' },
  { icon: 'alarm', name: 'Reveil Intelligent', desc: 'Briefing personnalise chaque matin' },
  { icon: 'description', name: 'Documents', desc: 'Contrats et devis en quelques secondes' },
  { icon: 'phone_iphone', name: 'Reseaux Sociaux', desc: 'Posts generes et planifies' },
  { icon: 'chat', name: 'WhatsApp Business', desc: 'Messages automatiques intelligents' },
  { icon: 'self_improvement', name: 'Coach Personnel', desc: 'Conseils et accompagnement' },
];

const TESTIMONIALS = [
  { name: 'Marie L.', role: 'Fondatrice, Startup', quote: 'Enfin une IA qui simplifie vraiment mon quotidien.' },
  { name: 'Thomas B.', role: 'Consultant independant', quote: 'Le repondeur a change ma facon de gerer mes appels.' },
  { name: 'Sophie M.', role: 'Directrice Marketing', quote: 'Simple, elegant, efficace. Exactement ce qu\'il me fallait.' },
];

export default function MinimalLanding() {
  const [email, setEmail] = useState('');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(250,250,248,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 500,
            color: '#1A1A1A',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}>
            SarahOS
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="#features" style={{
              fontSize: 14,
              color: '#666',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}>
              Fonctionnalites
            </Link>
            <Link href="#pricing" style={{
              fontSize: 14,
              color: '#666',
              textDecoration: 'none',
            }}>
              Tarifs
            </Link>
            <Link href="/login" style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#1A1A1A',
              textDecoration: 'none',
              padding: '10px 20px',
              background: '#1A1A1A',
              color: '#fff',
              borderRadius: 8,
            }}>
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680 }}>
          {/* Subtle badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 40,
            marginBottom: 32,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#C4A77D',
            }} />
            <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              Gratuit pour commencer
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(42px, 8vw, 72px)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: '#1A1A1A',
            marginBottom: 24,
            letterSpacing: '-0.03em',
          }}>
            Votre assistant
            <br />
            <span style={{ fontStyle: 'italic' }}>personnel</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: '#666',
            marginBottom: 48,
            maxWidth: 480,
            margin: '0 auto 48px',
          }}>
            72 agents IA qui travaillent pour vous. 
            Telephonie, documents, reseaux sociaux — 
            tout est simplifie.
          </p>

          {/* CTA */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              display: 'flex',
              gap: 8,
              maxWidth: 400,
              width: '100%',
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: 15,
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  background: '#fff',
                  outline: 'none',
                }}
              />
              <button style={{
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 500,
                background: '#1A1A1A',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                Essayer
              </button>
            </div>
            <span style={{ fontSize: 12, color: '#999' }}>
              Sans carte bancaire. Annulez quand vous voulez.
            </span>
          </div>
        </div>
      </section>

      {/* Trusted by section - minimal */}
      <section style={{
        padding: '40px 24px',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Propulse par
          </span>
          {['Claude AI', 'OpenAI', 'Twilio', 'ElevenLabs'].map((brand) => (
            <span key={brand} style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#999',
            }}>
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        padding: '120px 24px',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            color: '#1A1A1A',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 400, margin: '0 auto' }}>
            Des outils puissants, une interface simple.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {FEATURED_AGENTS.map((agent, i) => (
            <div key={i} style={{
              padding: 32,
              background: '#fff',
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(196,167,125,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <span className="material-symbols-rounded" style={{
                  fontSize: 24,
                  color: '#C4A77D',
                }}>
                  {agent.icon}
                </span>
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#1A1A1A',
                marginBottom: 8,
              }}>
                {agent.name}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#666',
                lineHeight: 1.6,
              }}>
                {agent.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '80px 24px 120px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 400,
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
            }}>
              Comment ca marche
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {[
              { num: '01', title: 'Inscrivez-vous', desc: 'Creez votre compte en 30 secondes. Aucune carte requise.' },
              { num: '02', title: 'Configurez vos agents', desc: 'Choisissez les agents qui correspondent a vos besoins.' },
              { num: '03', title: 'Laissez-les travailler', desc: 'Vos agents s\'occupent du reste. Vous gardez le controle.' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 32,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 48,
                  fontWeight: 400,
                  color: 'rgba(0,0,0,0.08)',
                  lineHeight: 1,
                  minWidth: 80,
                }}>
                  {step.num}
                </span>
                <div>
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: '#1A1A1A',
                    marginBottom: 8,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 15,
                    color: '#666',
                    lineHeight: 1.6,
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '120px 24px',
        background: '#FAFAF8',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 400,
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
            }}>
              Ce qu&apos;ils en disent
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                padding: 32,
                background: '#fff',
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: '#1A1A1A',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#999' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '120px 24px',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            color: '#1A1A1A',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Prix transparent
          </h2>
          <p style={{
            fontSize: 16,
            color: '#666',
            marginBottom: 48,
          }}>
            Payez uniquement ce que vous utilisez. 0% de commission.
          </p>

          <div style={{
            display: 'inline-block',
            padding: 48,
            background: '#FAFAF8',
            borderRadius: 24,
            border: '1px solid rgba(0,0,0,0.06)',
            maxWidth: 400,
            width: '100%',
          }}>
            <div style={{
              fontSize: 12,
              color: '#C4A77D',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}>
              Pour commencer
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 64,
              fontWeight: 400,
              color: '#1A1A1A',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              0€
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>
              50 credits offerts a l&apos;inscription
            </div>
            
            <div style={{
              textAlign: 'left',
              marginBottom: 32,
            }}>
              {[
                'Acces a tous les agents',
                'Toutes les fonctionnalites',
                'Support par email',
                'Sans engagement',
              ].map((feature, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}>
                  <span className="material-symbols-rounded" style={{
                    fontSize: 18,
                    color: '#C4A77D',
                  }}>
                    check
                  </span>
                  <span style={{ fontSize: 14, color: '#1A1A1A' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/login?mode=register" style={{
              display: 'block',
              padding: '16px 32px',
              background: '#1A1A1A',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 10,
              textDecoration: 'none',
              textAlign: 'center',
            }}>
              Creer mon compte gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '120px 24px',
        background: '#1A1A1A',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 400,
            color: '#fff',
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Pret a simplifier votre quotidien ?
          </h2>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 40,
          }}>
            Rejoignez les entrepreneurs qui ont choisi de deleguer a l&apos;IA.
          </p>
          <Link href="/login?mode=register" style={{
            display: 'inline-block',
            padding: '16px 40px',
            background: '#fff',
            color: '#1A1A1A',
            fontSize: 15,
            fontWeight: 500,
            borderRadius: 10,
            textDecoration: 'none',
          }}>
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        background: '#1A1A1A',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            color: '#fff',
          }}>
            SarahOS
          </span>
          <div style={{ display: 'flex', gap: 32 }}>
            {['CGU', 'Confidentialite', 'Contact'].map((link) => (
              <Link key={link} href="#" style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
              }}>
                {link}
              </Link>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            2026 SarahOS
          </span>
        </div>
      </footer>

      {/* Google Fonts for Playfair Display */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
        
        @media (max-width: 768px) {
          nav > div > div:nth-child(2) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
