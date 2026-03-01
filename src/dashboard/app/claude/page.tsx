'use client';

import Link from 'next/link';
import { DEFAULT_AGENTS, SIGNUP_BONUS_CREDITS } from '../../lib/agent-config';

/* ── Simplified Claude icon ── */
function ClaudeIcon({ size = 24, color = '#D97706' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={`${color}12`} />
      <path d="M8 8l4 8 4-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Opus agents (strategic, extended thinking) ── */
const OPUS_AGENT_IDS = ['sarah-dev', 'sarah-dg'];

export default function ClaudePage() {
  const sonnetAgents = DEFAULT_AGENTS.filter(a => !OPUS_AGENT_IDS.includes(a.id));
  const opusAgents = DEFAULT_AGENTS.filter(a => OPUS_AGENT_IDS.includes(a.id));

  return (
    <div style={{ background: '#fff', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ═══ Nav ═══ */}
      <nav className="landing-nav">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/images/logo.jpg" alt="SARAH OS" className="rounded-md" style={{ height: 42 }} />
        </Link>
        <div className="flex items-center gap-24">
          <Link href="/" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>Accueil</Link>
          <Link href="/whatsapp" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>WhatsApp</Link>
          <Link href="/login?mode=register" className="btn btn-primary btn-sm">
            Essayer gratuitement
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

        {/* ═══ Hero ═══ */}
        <section className="text-center" style={{
          padding: '80px 0 60px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 24,
              background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)',
              fontSize: 14, fontWeight: 600, color: '#D97706', marginBottom: 28,
            }}>
              <ClaudeIcon size={18} /> Propulse par Anthropic
            </div>
            <h1 style={{
              fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            }}>
              L&apos;IA la plus avancee au monde
              <br />
              <span style={{ color: '#D97706' }}>propulse vos agents</span>
            </h1>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px',
            }}>
              SARAH OS utilise exclusivement les modeles Claude d&apos;Anthropic — reconnus comme les plus performants,
              les plus surs et les plus alignes du marche. Deux modeles, deux forces complementaires.
            </p>
          </div>
        </section>

        {/* ═══ Image IA ═══ */}
        <div className="text-center" style={{ margin: '0 auto 60px', maxWidth: 600 }}>
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
            alt="Intelligence artificielle Claude"
            style={{
              width: '100%', height: 'auto', borderRadius: 20,
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* ═══ Pourquoi Claude ═══ */}
        <section className="landing-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Pourquoi Claude AI ?
            </h2>
            <p className="text-lg text-secondary" style={{ maxWidth: 520, margin: '0 auto' }}>
              Le choix de l&apos;IA qui propulse votre entreprise n&apos;est pas anodin
            </p>
          </div>
          <div className="landing-tools-grid">
            {[
              { icon: '🛡️', title: 'Securite #1 mondiale', desc: 'Anthropic est le leader mondial en securite IA. Constitutional AI, RLHF, alignement. Vos donnees ne sont jamais utilisees pour l\'entrainement.', color: '#D97706' },
              { icon: '⚡', title: 'Performance de pointe', desc: 'Claude surpasse GPT-4 et Gemini sur les benchmarks de raisonnement, codage et comprehension de texte. Le plus performant du marche.', color: '#92400E' },
              { icon: '🧠', title: 'Comprehension profonde', desc: 'Fenetre de contexte de 200K tokens. Claude comprend des documents entiers, des conversations longues, et le contexte de votre entreprise.', color: '#B45309' },
              { icon: '🇫🇷', title: 'Excellent en francais', desc: 'Claude excelle en francais avec une comprehension native des nuances, du vocabulaire professionnel et des expressions idiomatiques.', color: '#D97706' },
            ].map(c => (
              <div key={c.title} className="card card-lift text-center p-24" style={{
                borderTop: `3px solid ${c.color}`,
              }}>
                <div className="mb-12" style={{ fontSize: 36 }}>{c.icon}</div>
                <div className="font-bold mb-8" style={{ fontSize: 15 }}>{c.title}</div>
                <div className="text-md text-secondary leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Deux modeles ═══ */}
        <section className="landing-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Deux modeles, deux forces
            </h2>
          </div>
          <div className="landing-claude-grid">
            {/* Sonnet */}
            <div className="card card-lift text-center" style={{
              padding: 32, borderTop: '4px solid #D97706',
            }}>
              <div className="text-sm font-bold mb-16" style={{
                display: 'inline-flex', padding: '6px 16px', borderRadius: 20,
                background: 'rgba(217,119,6,0.1)', color: '#D97706',
              }}>
                CLAUDE SONNET
              </div>
              <div className="text-2xl mb-12" style={{ fontWeight: 800 }}>
                Rapide & Efficace
              </div>
              <p className="text-base text-secondary leading-relaxed" style={{ marginBottom: 20 }}>
                Le moteur de vos {sonnetAgents.length} agents du quotidien. Reponses en quelques secondes pour les emails,
                analyses, documents, conversations et taches courantes.
              </p>
              <div className="flex-col" style={{ gap: 8, textAlign: 'left', marginBottom: 20 }}>
                {[
                  'Temps de reponse ultra-rapide (2-5s)',
                  'Cout optimise par action',
                  'Ideal pour les taches courantes',
                  'Comprehension contextuelle avancee',
                ].map(f => (
                  <div key={f} className="flex items-center gap-8 text-md text-secondary">
                    <span style={{ color: '#D97706' }} className="font-bold">&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 16 }}>
                Agents : {sonnetAgents.map(a => a.name).join(', ')}
              </div>
            </div>

            {/* Opus */}
            <div className="card card-lift text-center" style={{
              padding: 32, borderTop: '4px solid #92400E',
              background: 'linear-gradient(135deg, rgba(217,119,6,0.03), rgba(146,64,14,0.03))',
            }}>
              <div className="text-sm font-bold mb-16" style={{
                display: 'inline-flex', padding: '6px 16px', borderRadius: 20,
                background: 'rgba(146,64,14,0.1)', color: '#92400E',
              }}>
                CLAUDE OPUS
              </div>
              <div className="text-2xl mb-12" style={{ fontWeight: 800 }}>
                Strategique & Profond
              </div>
              <p className="text-base text-secondary leading-relaxed" style={{ marginBottom: 20 }}>
                Reserve aux decisions strategiques et problemes complexes. Extended Thinking pour
                une reflexion approfondie avant chaque reponse.
              </p>
              <div className="flex-col" style={{ gap: 8, textAlign: 'left', marginBottom: 20 }}>
                {[
                  'Extended Thinking (reflexion profonde)',
                  'Analyse multi-dimensionnelle',
                  'Decisions strategiques a long terme',
                  'Le modele le plus puissant d\'Anthropic',
                ].map(f => (
                  <div key={f} className="flex items-center gap-8 text-md text-secondary">
                    <span style={{ color: '#92400E' }} className="font-bold">&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 16 }}>
                Agents : {opusAgents.map(a => `${a.name} (${a.role})`).join(', ')}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Extended Thinking ═══ */}
        <section className="landing-section" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            padding: 40, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(217,119,6,0.06), rgba(146,64,14,0.04))',
            border: '1px solid rgba(217,119,6,0.15)',
          }}>
            <div className="text-center mb-24">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(146,64,14,0.1)', border: '1px solid rgba(146,64,14,0.2)',
                fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 16,
              }}>
                Exclusif : Extended Thinking
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
                Quand l&apos;IA reflechit avant de repondre
              </h2>
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'center', marginBottom: 24 }}>
              Claude Opus dispose de l&apos;<strong>Extended Thinking</strong> — une capacite unique qui lui permet de
              developper un raisonnement interne structure avant de formuler sa reponse. Comme un dirigeant
              qui pese le pour et le contre, analyse les scenarios et anticipe les consequences.
            </p>
            <div className="grid-3" style={{ gap: 16 }}>
              {[
                { icon: '🔍', title: 'Analyse', desc: 'Decompose le probleme en sous-elements' },
                { icon: '⚖️', title: 'Evaluation', desc: 'Compare les scenarios et leurs impacts' },
                { icon: '🎯', title: 'Decision', desc: 'Formule une recommandation argumentee' },
              ].map(s => (
                <div key={s.title} className="text-center p-16">
                  <div className="mb-8" style={{ fontSize: 28 }}>{s.icon}</div>
                  <div className="text-base font-bold mb-4">{s.title}</div>
                  <div className="text-sm text-muted">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Quel agent utilise quel modele ═══ */}
        <section className="landing-section">
          <div className="text-center mb-24">
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Quel agent utilise quel modele
            </h2>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {DEFAULT_AGENTS.map(agent => {
              const isOpus = OPUS_AGENT_IDS.includes(agent.id);
              return (
                <div key={agent.id} className="flex items-center" style={{
                  gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-primary)',
                }}>
                  <div style={{ fontSize: 22 }}>{agent.emoji}</div>
                  <div className="flex-1">
                    <div className="text-base font-semibold">{agent.name}</div>
                    <div className="text-sm text-muted">{agent.role}</div>
                  </div>
                  <div className="text-xs font-bold rounded-md" style={{
                    padding: '4px 12px',
                    background: isOpus ? 'rgba(146,64,14,0.1)' : 'rgba(217,119,6,0.1)',
                    color: isOpus ? '#92400E' : '#D97706',
                  }}>
                    {isOpus ? 'Claude Opus' : 'Claude Sonnet'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Securite & Ethique ═══ */}
        <section className="landing-section" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="text-center mb-24">
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Securite et ethique au cœur
            </h2>
          </div>
          <div className="landing-claude-grid">
            {[
              { icon: '🏛️', title: 'Constitutional AI', desc: 'Anthropic a invente la Constitutional AI — un systeme d\'auto-regulation qui garantit des reponses sures, honnetes et utiles. Claude suit des principes ethiques stricts.' },
              { icon: '🔐', title: 'Donnees protegees', desc: 'Vos conversations ne sont jamais utilisees pour entrainer les modeles. Zero retention de donnees. Chiffrement en transit et au repos. Conforme RGPD.' },
              { icon: '⚖️', title: 'Alignement IA', desc: 'Anthropic est le leader mondial en alignement IA — la science qui s\'assure que l\'IA agit dans l\'interet de l\'utilisateur. Resultats verifies par des audits independants.' },
              { icon: '🏆', title: 'Benchmarks #1', desc: 'Claude est classe #1 sur les benchmarks MMLU, HumanEval, GSM8K. Le modele le plus performant en raisonnement, code, mathematiques et comprehension.' },
            ].map(c => (
              <div key={c.title} className="card p-24">
                <div style={{ fontSize: 28 }} className="mb-8">{c.icon}</div>
                <div className="font-bold mb-8" style={{ fontSize: 15 }}>{c.title}</div>
                <div className="text-md text-secondary leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Ecosysteme complet ═══ */}
        <section className="landing-section">
          <div className="text-center mb-24">
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Un ecosysteme complet autour de Claude
            </h2>
          </div>
          <div className="landing-tools-grid">
            {[
              { icon: '💬', title: 'WhatsApp', desc: 'Parlez a vos agents par WhatsApp et notes vocales', color: '#25D366', href: '/whatsapp' },
              { icon: '🔊', title: 'ElevenLabs', desc: 'Voix ultra-realistes Flash v2.5 pour les reponses vocales', color: '#8B5CF6', href: '#' },
              { icon: '📅', title: 'Google Calendar', desc: 'Synchronisation agenda et planification automatique', color: '#4285F4', href: '#' },
              { icon: '🎤', title: 'Deepgram', desc: 'Transcription vocale Nova-2 avec 98% de precision', color: '#6366f1', href: '#' },
            ].map(t => (
              <Link key={t.title} href={t.href} className="card card-lift text-center p-20" style={{
                textDecoration: 'none', color: 'inherit',
                borderTop: `3px solid ${t.color}`,
              }}>
                <div style={{ fontSize: 32 }} className="mb-8">{t.icon}</div>
                <div className="text-base font-bold mb-4">{t.title}</div>
                <div className="text-sm text-secondary leading-relaxed">{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ CTA Final ═══ */}
        <section className="landing-section text-center rounded-xl" style={{
          padding: '60px 24px',
          background: 'linear-gradient(135deg, rgba(217,119,6,0.08), rgba(146,64,14,0.04))',
          border: '1px solid rgba(217,119,6,0.15)',
          marginBottom: 40,
        }}>
          <ClaudeIcon size={48} />
          <h2 className="mb-12 mt-16" style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Pret a decouvrir la puissance de Claude AI ?
          </h2>
          <p className="text-lg text-secondary" style={{ maxWidth: 480, margin: '0 auto 28px' }}>
            {SIGNUP_BONUS_CREDITS} credits offerts — testez Sonnet et Opus sans engagement
          </p>
          <Link href="/login?mode=register" className="btn rounded-lg font-bold" style={{
            padding: '16px 40px', fontSize: 17,
            background: '#D97706', color: '#fff', border: 'none',
            boxShadow: '0 8px 32px rgba(217,119,6,0.3)',
          }}>
            Essayer gratuitement
          </Link>
          <div className="flex flex-wrap flex-center gap-24 mt-16">
            {['Claude Sonnet & Opus', `${DEFAULT_AGENTS.length} agents IA`, 'Extended Thinking'].map(t => (
              <span key={t} className="text-sm text-muted flex items-center gap-4">
                <span style={{ color: '#D97706' }}>&#10003;</span> {t}
              </span>
            ))}
          </div>
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="text-center mt-24" style={{
          padding: '32px 0', borderTop: '1px solid var(--border-light, #e5e7eb)',
        }}>
          <div className="flex flex-wrap flex-center gap-20 mb-16">
            <Link href="/" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Accueil</Link>
            <Link href="/whatsapp" className="text-md text-secondary" style={{ textDecoration: 'none' }}>WhatsApp</Link>
            <Link href="/demo" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Demo</Link>
            <Link href="/plans" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Tarifs</Link>
          </div>
          <div className="text-sm text-muted">
            SARAH OS v0.10.0 — Propulse par Claude AI (Sonnet & Opus) + ElevenLabs + WhatsApp
          </div>
        </footer>
      </div>
    </div>
  );
}
