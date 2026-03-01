'use client';

import Link from 'next/link';
import { DEFAULT_AGENTS, SIGNUP_BONUS_CREDITS } from '../../lib/agent-config';

/* ── WhatsApp SVG icon ── */
function WaIcon({ size = 24, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WhatsAppPage() {
  return (
    <div style={{ background: '#fff', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ═══ Nav ═══ */}
      <nav className="landing-nav">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/images/logo.jpg" alt="SARAH OS" className="rounded-md" style={{ height: 42 }} />
        </Link>
        <div className="flex items-center gap-24">
          <Link href="/" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>Accueil</Link>
          <Link href="/claude" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>Claude AI</Link>
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
            background: 'radial-gradient(circle, rgba(37,211,102,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 24,
              background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
              fontSize: 14, fontWeight: 600, color: '#25D366', marginBottom: 28,
            }}>
              <WaIcon size={18} /> WhatsApp Business
            </div>
            <h1 style={{
              fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            }}>
              Vos agents IA, directement
              <br />
              <span style={{ color: '#25D366' }}>sur WhatsApp</span>
            </h1>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px',
            }}>
              Envoyez un message texte ou une note vocale a n&apos;importe lequel de vos {DEFAULT_AGENTS.length} agents IA.
              Recevez briefings, alertes et rapports directement dans votre WhatsApp.
            </p>
            <div className="flex flex-wrap flex-center gap-12">
              <Link href="/login?mode=register" className="btn" style={{
                padding: '14px 32px', fontSize: 16, fontWeight: 700,
                background: '#25D366', color: '#fff', border: 'none', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(37,211,102,0.3)',
              }}>
                Essayer gratuitement
              </Link>
              <Link href="/demo" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
                Voir la demo
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ Image ═══ */}
        <div className="text-center" style={{ margin: '0 auto 60px', maxWidth: 500 }}>
          <img
            src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&q=80"
            alt="WhatsApp avec SARAH OS"
            style={{
              width: '100%', height: 'auto', borderRadius: 20,
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* ═══ Comment ca marche ═══ */}
        <section className="landing-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Comment ca marche
            </h2>
            <p className="text-lg text-secondary">
              3 etapes, 2 minutes
            </p>
          </div>
          <div className="landing-steps-grid">
            {[
              { step: '01', icon: '📱', title: 'Ajoutez le numero', desc: 'Ajoutez le numero WhatsApp Business de SARAH OS dans vos contacts. Vous le recevez a l\'inscription.' },
              { step: '02', icon: '💬', title: 'Envoyez un message', desc: 'Ecrivez un texte ou enregistrez une note vocale. Precisez l\'agent que vous voulez contacter (ex: "Thomas, prepare-moi une offre pour...").' },
              { step: '03', icon: '🤖', title: 'L\'agent repond', desc: 'Votre agent IA analyse votre demande et repond directement dans WhatsApp. Les notes vocales sont transcrites automatiquement par Deepgram.' },
            ].map(s => (
              <div key={s.step} className="card text-center" style={{ padding: 28, position: 'relative' }}>
                <div className="font-bold" style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 36, color: '#25D366', opacity: 0.15,
                }}>
                  {s.step}
                </div>
                <div className="mb-16" style={{ fontSize: 40 }}>{s.icon}</div>
                <div className="text-lg font-bold mb-8">{s.title}</div>
                <div className="text-md text-secondary leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Fonctionnalites ═══ */}
        <section className="landing-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Tout ce que vous pouvez faire
            </h2>
          </div>
          <div className="grid-3" style={{ gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: '💬', title: 'Messages texte', desc: 'Ecrivez naturellement a n\'importe quel agent. Il comprend le contexte de votre entreprise.', color: '#25D366' },
              { icon: '🎤', title: 'Notes vocales', desc: 'Enregistrez une note vocale. Deepgram la transcrit instantanement, l\'agent agit.', color: '#6366f1' },
              { icon: '☀️', title: 'Briefing quotidien', desc: 'Chaque matin a 8h, recevez un resume de vos taches, alertes et insights dans WhatsApp.', color: '#f59e0b' },
              { icon: '🔔', title: 'Alertes en temps reel', desc: 'Prospect chaud, facture en retard, deadline proche... vos agents vous alertent proactivement.', color: '#ef4444' },
              { icon: '👥', title: 'Multi-agents', desc: 'Parlez a Lea pour un email, Thomas pour une offre, Manon pour un post social. Tout dans WhatsApp.', color: '#8b5cf6' },
              { icon: '🔊', title: 'Reponses vocales', desc: 'Activez les reponses vocales avec ElevenLabs Flash v2.5. Voix ultra-realistes en francais.', color: '#ec4899' },
            ].map(f => (
              <div key={f.title} className="card card-lift text-center p-24" style={{
                borderTop: `3px solid ${f.color}`,
              }}>
                <div className="mb-12" style={{ fontSize: 36 }}>{f.icon}</div>
                <div className="font-bold mb-8" style={{ fontSize: 15 }}>{f.title}</div>
                <div className="text-md text-secondary leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Agents disponibles ═══ */}
        <section className="landing-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {DEFAULT_AGENTS.length} agents disponibles sur WhatsApp
            </h2>
            <p className="text-lg text-secondary" style={{ maxWidth: 500, margin: '0 auto' }}>
              Chaque agent est expert dans son domaine et propulse par Claude AI d&apos;Anthropic
            </p>
          </div>
          <div className="landing-agent-grid">
            {DEFAULT_AGENTS.map(agent => (
              <div key={agent.id} className="card card-lift flex items-center p-20" style={{
                borderLeft: `3px solid #25D366`, gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(37,211,102,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {agent.emoji}
                </div>
                <div>
                  <div className="text-base font-bold">{agent.name}</div>
                  <div className="text-sm text-muted">{agent.role}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <WaIcon size={18} color="rgba(37,211,102,0.5)" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Notes vocales & Deepgram ═══ */}
        <section className="landing-section">
          <div className="landing-whatsapp-section">
            <div>
              <div className="brand-badge brand-badge-whatsapp" style={{ marginBottom: 20 }}>
                <WaIcon size={14} /> Notes vocales
              </div>
              <h2 className="mb-16" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Parlez, vos agents comprennent
              </h2>
              <p className="text-secondary leading-relaxed" style={{ fontSize: 15, marginBottom: 20 }}>
                Enregistrez une note vocale WhatsApp comme vous le feriez avec un collegue.
                Notre pipeline vocal transforme votre voix en action :
              </p>
              <div className="flex-col mb-24" style={{ gap: 14 }}>
                {[
                  { label: 'Transcription instantanee', desc: 'Deepgram Nova-2 transcrit votre voix en texte avec 98% de precision', color: '#6366f1' },
                  { label: 'Comprehension contextuelle', desc: 'Claude AI comprend votre intention et le contexte de votre entreprise', color: '#D97706' },
                  { label: 'Action immediate', desc: 'L\'agent execute : email envoye, document cree, analyse lancee', color: '#25D366' },
                  { label: 'Reponse vocale', desc: 'ElevenLabs Flash v2.5 vous repond avec une voix ultra-realiste (optionnel)', color: '#8B5CF6' },
                ].map(item => (
                  <div key={item.label} className="flex gap-12" style={{ alignItems: 'flex-start' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                      background: item.color,
                    }} />
                    <div>
                      <div className="text-base font-semibold">{item.label}</div>
                      <div className="text-md text-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-whatsapp-image">
              <img
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=500&q=80"
                alt="Communication vocale avec SARAH OS"
                style={{ width: '100%', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </section>

        {/* ═══ Securite ═══ */}
        <section className="landing-section" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="text-center mb-24">
            <h2 className="mb-12" style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Securite et confidentialite
            </h2>
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            {[
              { icon: '🔒', title: 'Chiffrement', desc: 'WhatsApp chiffre vos messages de bout en bout. Vos donnees sont protegees en transit.' },
              { icon: '🇪🇺', title: 'RGPD', desc: 'Conforme au RGPD. Vos donnees sont hebergees en Europe. Droit a l\'oubli garanti.' },
              { icon: '🎤', title: 'Pas de stockage vocal', desc: 'Vos notes vocales sont transcrites puis supprimees. Aucun enregistrement conserve.' },
            ].map(s => (
              <div key={s.title} className="card text-center p-20">
                <div className="mb-8" style={{ fontSize: 28 }}>{s.icon}</div>
                <div className="text-base font-bold" style={{ marginBottom: 6 }}>{s.title}</div>
                <div className="text-sm text-secondary leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA Final ═══ */}
        <section className="landing-section text-center rounded-xl" style={{
          padding: '60px 24px',
          background: 'linear-gradient(135deg, rgba(37,211,102,0.08), rgba(37,211,102,0.04))',
          border: '1px solid rgba(37,211,102,0.15)',
          marginBottom: 40,
        }}>
          <WaIcon size={48} />
          <h2 className="mb-12 mt-16" style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Pret a parler a vos agents sur WhatsApp ?
          </h2>
          <p className="text-lg text-secondary" style={{ maxWidth: 480, margin: '0 auto 28px' }}>
            Commencez gratuitement avec {SIGNUP_BONUS_CREDITS} credits offerts
          </p>
          <Link href="/login?mode=register" className="btn rounded-lg font-bold" style={{
            padding: '16px 40px', fontSize: 17,
            background: '#25D366', color: '#fff', border: 'none',
            boxShadow: '0 8px 32px rgba(37,211,102,0.3)',
          }}>
            Essayer gratuitement
          </Link>
          <div className="flex flex-wrap flex-center gap-24 mt-16">
            {['WhatsApp inclus', 'Notes vocales', `${DEFAULT_AGENTS.length} agents`].map(t => (
              <span key={t} className="text-sm text-muted flex items-center gap-4">
                <span style={{ color: '#25D366' }}>&#10003;</span> {t}
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
            <Link href="/claude" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Claude AI</Link>
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
