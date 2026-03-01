'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, SIGNUP_BONUS_CREDITS } from '../lib/agent-config';
import VideoPlaceholder from '../components/VideoPlaceholder';
import TestimonialCard from '../components/TestimonialCard';

const repondeur = DEFAULT_AGENTS.find(a => a.id === 'sarah-repondeur')!;
const otherAgents = DEFAULT_AGENTS.filter(a => a.id !== 'sarah-repondeur');
const OPUS_AGENT_IDS = ['sarah-dev', 'sarah-dg'];

/* ── Inline SVG icons ── */
function WhatsAppIcon({ size = 24, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function ClaudeIcon({ size = 24, color = '#D97706' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={`${color}12`} />
      <path d="M8 8l4 8 4-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: '#fff', color: 'var(--text-primary)', minHeight: '100vh', scrollBehavior: 'smooth' }}>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="landing-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/images/logo.jpg"
            alt="SARAH OS"
            style={{ height: 42, borderRadius: 8 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </Link>

        <div className={`landing-nav-links${menuOpen ? ' open' : ''}`}>
          <a href="#agents" onClick={() => setMenuOpen(false)}>Agents</a>
          <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <Link href="/whatsapp" onClick={() => setMenuOpen(false)}>WhatsApp</Link>
          <Link href="/claude" onClick={() => setMenuOpen(false)}>Claude AI</Link>
          <a href="#tarifs" onClick={() => setMenuOpen(false)}>Tarifs</a>
          <Link
            href="/login?mode=register"
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 20px', fontSize: 13 }}
            onClick={() => setMenuOpen(false)}
          >
            Essayer gratuitement
          </Link>
        </div>

        <button
          className="landing-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path d="M6 6l12 12M6 18L18 6" />
              : <path d="M3 6h18M3 12h18M3 18h18" />
            }
          </svg>
        </button>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="landing-hero-grid">
          {/* Left column — text */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: 20,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              fontSize: 13, fontWeight: 600, color: '#16a34a', marginBottom: 24,
            }}>
              {SIGNUP_BONUS_CREDITS} crédits offerts à l&apos;inscription
            </div>

            <h1 style={{
              fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800,
              letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            }}>
              Votre Répondeur Intelligent
              <br />
              <span className="gradient-text">Plus jamais un appel manqué</span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: 32, maxWidth: 520,
            }}>
              Sarah répond à vos appels 24h/24 avec intelligence et professionnalisme.
              Et derrière votre répondeur, découvrez <strong>{DEFAULT_AGENTS.length} agents IA spécialisés</strong> pour
              gérer toute votre entreprise.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/login?mode=register" className="btn btn-primary" style={{
                padding: '14px 32px', fontSize: 16, fontWeight: 700,
                boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
              }}>
                Essayer gratuitement
              </Link>
              <a href="#demo-video" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
                Voir la démo
              </a>
            </div>

            <div style={{
              display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap',
              fontSize: 13, color: 'var(--text-muted)',
            }}>
              {['Pas de carte bancaire', 'Sans engagement', `${SIGNUP_BONUS_CREDITS} crédits offerts`].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#16a34a' }}>&#10003;</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — hero image */}
          <div className="landing-hero-image" style={{ position: 'relative' }}>
            <div className="animate-float" style={{
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.1)',
              aspectRatio: '9/16', maxHeight: 420,
              position: 'relative',
            }}>
              <img
                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80"
                alt="SARAH OS sur mobile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  el.parentElement!.style.background = 'linear-gradient(135deg, #1e1b4b, #312e81)';
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 24,
              }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>SARAH OS</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Vos {DEFAULT_AGENTS.length} agents IA, partout</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

        {/* ═══════════ STATS STRIP ═══════════ */}
        <section className="landing-section" style={{ paddingTop: 40 }}>
          <div className="landing-stats-grid">
            {[
              { val: '10', label: 'Agents IA', sub: 'directeurs spécialisés' },
              { val: '24/7', label: 'Disponible', sub: 'sans interruption' },
              { val: '0€', label: 'Par mois', sub: 'pas d\'abonnement' },
              { val: String(SIGNUP_BONUS_CREDITS), label: 'Crédits offerts', sub: 'à l\'inscription' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ ILLUSTRATION ═══════════ */}
        <div style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: 500 }}>
          <img
            src="/images/image2.jpg"
            alt="SARAH OS — Vue du tableau de bord"
            style={{
              width: '100%', height: 'auto', borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-light, #e5e7eb)',
            }}
          />
        </div>

        {/* ═══════════ AGENTS ═══════════ */}
        <section id="agents" className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Votre équipe IA complète
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 550, margin: '0 auto' }}>
              Le Répondeur Intelligent en tête, et 9 agents spécialisés pour tout le reste
            </p>
          </div>

          {/* Répondeur hero card */}
          <div className="landing-repondeur-hero" style={{ marginBottom: 28 }}>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: repondeur.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>
                {repondeur.emoji}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{repondeur.role}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                {repondeur.tagline}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  'Répond à vos appels 24h/24 avec intelligence',
                  'Prend les messages et qualifie les demandes',
                  'Transfère les urgences vers votre mobile',
                  'Accessible par WhatsApp et notes vocales',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/login?mode=register" className="btn btn-primary" style={{
                  padding: '10px 24px', fontSize: 14, background: '#22c55e',
                  border: 'none',
                }}>
                  Essayer le Répondeur
                </Link>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  À partir de {repondeur.priceCredits} crédits par appel
                </span>
              </div>
            </div>
          </div>

          {/* 9-agent grid */}
          <div className="landing-agent-grid">
            {otherAgents.map(agent => (
              <div key={agent.id} className="card card-lift" style={{
                padding: 24, borderLeft: `3px solid ${agent.color}`,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: agent.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {agent.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{agent.role}</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {agent.priceCredits} crédits/action
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  {agent.tagline}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16, marginTop: 'auto' }}>
                  {agent.capabilities.slice(0, 3).map(c => (
                    <span key={c} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      background: 'var(--bg-secondary, #f8fafc)', color: 'var(--text-muted)',
                      border: '1px solid var(--border-light, #e5e7eb)',
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                    background: OPUS_AGENT_IDS.includes(agent.id) ? 'rgba(146,64,14,0.1)' : 'rgba(217,119,6,0.1)',
                    color: OPUS_AGENT_IDS.includes(agent.id) ? '#92400E' : '#D97706',
                  }}>
                    {OPUS_AGENT_IDS.includes(agent.id) ? 'Opus' : 'Sonnet'}
                  </span>
                  <WhatsAppIcon size={12} color="rgba(37,211,102,0.6)" />
                </div>
                <Link href="/login?mode=register" style={{
                  fontSize: 13, fontWeight: 600, color: agent.color,
                  textDecoration: 'none', marginTop: 6,
                }}>
                  Essayer &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ COMMENT ÇA MARCHE ═══════════ */}
        <section id="comment-ca-marche" className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Comment ça marche
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
              Personnalisez au début, automatisez tout le reste
            </p>
          </div>

          {/* Top row — 3 steps */}
          <div className="landing-steps-grid" style={{ marginBottom: 0 }}>
            {[
              {
                step: '01', icon: '👤',
                title: 'Inscrivez-vous gratuitement',
                desc: 'Créez votre compte en 30 secondes. 50 crédits offerts, accès immédiat à vos 10 agents. Pas de carte bancaire.',
              },
              {
                step: '02', icon: '🏢',
                title: 'Configurez votre entreprise',
                desc: 'Collez l\'URL de votre site et Sarah analyse tout automatiquement. Ou remplissez le profil en 5 minutes. Secteur, objectifs, ton, équipe — vos agents apprennent votre contexte.',
              },
              {
                step: '03', icon: '🎛️',
                title: 'Personnalisez vos agents',
                desc: '6 curseurs de personnalité par agent. Expertise sectorielle, règles métier, format de réponse. Renommez-les, changez leurs rôles. 3 presets prêts à l\'emploi : Startup, Corporate, Agence.',
              },
            ].map(s => (
              <div key={s.step} className="card" style={{ padding: 28, textAlign: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 36, fontWeight: 800, color: 'var(--accent)', opacity: 0.12,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Bottom row — 2 steps, centered */}
          <div className="landing-steps-bottom-row">
            {[
              {
                step: '04', icon: '💬',
                title: 'Travaillez avec votre équipe',
                desc: 'Discutez par texte ou par voix avec chaque agent. Lancez des réunions stratégiques multi-agents. Générez des documents, stratégies et plans d\'action en quelques clics.',
              },
              {
                step: '05', icon: '🤖',
                title: 'Automatisez et déléguez',
                desc: 'Briefing quotidien automatique. Notifications WhatsApp et SMS. Vos agents vous contactent proactivement avec des rappels, rapports et suggestions.',
              },
            ].map(s => (
              <div key={s.step} className="card" style={{ padding: 28, textAlign: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 36, fontWeight: 800, color: 'var(--accent)', opacity: 0.12,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Video placeholder */}
          <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
            <VideoPlaceholder
              id="demo-video"
              title="Découvrez Sarah en action"
              subtitle="Vidéo de démonstration à venir"
            />
          </div>
        </section>

        {/* ═══════════ PARLEZ À VOS AGENTS ═══════════ */}
        <section className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Interaction vocale
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Parlez à vos agents
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Votre voix, leur action
            </p>
          </div>

          <div className="landing-voice-grid">
            {[
              {
                icon: '🎤',
                title: 'Notes vocales',
                desc: 'Dictez vos messages en chat et en réunion. Transcription instantanée par Deepgram.',
                color: '#6366f1',
              },
              {
                icon: '📱',
                title: 'WhatsApp & SMS',
                desc: 'Envoyez des notes vocales par WhatsApp. Vos agents transcrivent et agissent automatiquement.',
                color: '#22c55e',
              },
              {
                icon: '🔊',
                title: 'Écoutez les réponses',
                desc: 'Vos agents vous répondent aussi à voix haute. Voix masculine ou féminine selon l\'agent.',
                color: '#f59e0b',
              },
            ].map(card => (
              <div key={card.title} className="card" style={{
                padding: 28, textAlign: 'center',
                borderTop: `3px solid ${card.color}`,
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{card.desc}</div>
              </div>
            ))}
          </div>

          {/* Coming soon banner */}
          <div style={{
            maxWidth: 700, margin: '28px auto 0', padding: '14px 24px',
            borderRadius: 12, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))',
            border: '1px solid rgba(99,102,241,0.12)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Voix ElevenLabs Flash v2.5 disponible + Avatar vidéo D-ID bientôt
            </span>
          </div>
        </section>

        {/* ═══════════ VOS OUTILS CONNECTES ═══════════ */}
        <section id="outils" className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Écosystème intégré
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Les meilleurs outils, déjà connectés
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 550, margin: '0 auto' }}>
              SARAH OS intègre les technologies les plus avancées pour vos agents
            </p>
          </div>

          <div className="landing-tools-grid">
            {[
              {
                icon: <ClaudeIcon size={32} />,
                title: 'Claude AI',
                desc: 'Sonnet pour la rapidité, Opus pour la stratégie. Le modèle IA le plus performant du marché, par Anthropic.',
                color: '#D97706',
                badge: 'IA #1 mondiale',
                href: '/claude',
              },
              {
                icon: <WhatsAppIcon size={32} />,
                title: 'WhatsApp Business',
                desc: 'Parlez à vos agents par texte et notes vocales. Briefings quotidiens et alertes directement dans WhatsApp.',
                color: '#25D366',
                badge: 'Texte & Voix',
                href: '/whatsapp',
              },
              {
                icon: <span style={{ fontSize: 32 }}>🔊</span>,
                title: 'ElevenLabs',
                desc: 'Voix ultra-réalistes Flash v2.5. La meilleure synthèse vocale du marché, en français naturel.',
                color: '#8B5CF6',
                badge: 'Flash v2.5',
                href: '#',
              },
              {
                icon: <span style={{ fontSize: 32 }}>📅</span>,
                title: 'Google Calendar',
                desc: 'Synchronisation agenda automatique. Léa planifie vos réunions et gère vos disponibilités.',
                color: '#4285F4',
                badge: 'Agenda sync',
                href: '#',
              },
            ].map(tool => (
              <Link key={tool.title} href={tool.href} className="card card-lift" style={{
                padding: 24, textAlign: 'center', textDecoration: 'none', color: 'inherit',
                borderTop: `3px solid ${tool.color}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <div style={{ marginBottom: 12 }}>{tool.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{tool.title}</div>
                <div style={{
                  fontSize: 10, padding: '2px 10px', borderRadius: 10,
                  background: `${tool.color}15`, color: tool.color,
                  fontWeight: 600, marginBottom: 10,
                }}>
                  {tool.badge}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════ WHATSAPP BUSINESS ═══════════ */}
        <section id="whatsapp" className="landing-section" style={{ background: 'rgba(37,211,102,0.02)', borderRadius: 24, padding: '60px 24px' }}>
          <div className="landing-whatsapp-section">
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
                fontSize: 13, fontWeight: 600, color: '#25D366', marginBottom: 24,
              }}>
                <WhatsAppIcon size={16} /> WhatsApp Business
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
                Vos agents IA, directement sur <span style={{ color: '#25D366' }}>WhatsApp</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                Envoyez un message ou une note vocale à n&apos;importe quel agent.
                Recevez notifications, briefings et rapports dans votre WhatsApp.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  'Échangez par texte et notes vocales avec vos 10 agents',
                  'Briefing quotidien chaque matin dans votre WhatsApp',
                  'Alertes et notifications en temps réel',
                  'Transcription automatique des notes vocales (Deepgram)',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#25D366', fontWeight: 700 }}>&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/whatsapp" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', fontSize: 15, fontWeight: 700,
                background: '#25D366', color: '#fff', border: 'none',
                borderRadius: 12, boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                textDecoration: 'none',
              }}>
                <WhatsAppIcon size={18} color="#fff" /> Découvrir WhatsApp
              </Link>
            </div>
            <div className="landing-whatsapp-image">
              <img
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=500&q=80"
                alt="WhatsApp avec SARAH OS"
                style={{ width: '100%', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </section>

        {/* ═══════════ PROPULSE PAR CLAUDE AI ═══════════ */}
        <section id="claude-ai" className="landing-section" style={{ background: 'rgba(217,119,6,0.02)', borderRadius: 24, padding: '60px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 20,
              background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)',
              fontSize: 13, fontWeight: 600, color: '#D97706', marginBottom: 16,
            }}>
              <ClaudeIcon size={16} /> Propulsé par Anthropic
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              L&apos;IA la plus performante au monde
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '12px auto 0' }}>
              SARAH OS utilise les modèles Claude d&apos;Anthropic — reconnus comme les plus avancés
              et les plus sûrs du marché
            </p>
          </div>

          <div className="landing-claude-grid">
            <div className="card card-lift" style={{
              padding: 28, borderTop: '3px solid #D97706', textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706', marginBottom: 8 }}>
                CLAUDE SONNET
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Rapide & Efficace</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Utilisé par 8 agents pour les tâches courantes : emails, analyses,
                documents, conversations. Réponses en quelques secondes.
              </p>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Camille, Léa, Thomas, Manon, Julien, Clara, Antoine, Marie
              </div>
            </div>

            <div className="card card-lift" style={{
              padding: 28, borderTop: '3px solid #92400E', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(217,119,6,0.04), rgba(146,64,14,0.04))',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
                CLAUDE OPUS
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Strategique & Profond</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                Réservé aux décisions stratégiques et problèmes complexes.
                Extended thinking pour une réflexion approfondie.
              </p>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Hugo (CTO), Sarah (DG) — les postes stratégiques
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link href="/claude" style={{ fontSize: 14, fontWeight: 600, color: '#D97706', textDecoration: 'none' }}>
              En savoir plus sur Claude AI &rarr;
            </Link>
          </div>
        </section>

        {/* ═══════════ TEMPLATES PRÊTS À L'EMPLOI ═══════════ */}
        <section className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Bibliothèque de templates
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Des dizaines de templates prêts à l&apos;emploi
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
              Vos agents savent déjà tout faire. Choisissez, lancez.
            </p>
          </div>

          {/* ── Documents ── */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(99,102,241,0.1)', fontSize: 16,
              }}>📄</span>
              Documents
            </h3>
            <div className="landing-templates-grid">
              {[
                { emoji: '✉️', name: 'Email professionnel', agent: 'Léa', credits: '~1 cr', href: '/client/documents' },
                { emoji: '📋', name: 'Proposition commerciale', agent: 'Thomas', credits: '~3 cr', href: '/client/documents' },
                { emoji: '📊', name: 'Business plan', agent: 'Sarah', credits: '~5 cr', href: '/client/documents' },
                { emoji: '📣', name: 'Post réseaux sociaux', agent: 'Manon', credits: '~1 cr', href: '/client/documents' },
                { emoji: '📜', name: 'Contrat / CGV', agent: 'Marie', credits: '~3 cr', href: '/client/documents' },
                { emoji: '👔', name: 'Fiche de poste', agent: 'Julien', credits: '~2 cr', href: '/client/documents' },
              ].map(t => (
                <Link key={t.name} href={t.href} className="landing-template-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Agent : {t.agent}
                  </div>
                  <div style={{
                    display: 'inline-block', alignSelf: 'flex-start',
                    padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: 'rgba(99,102,241,0.08)', color: 'var(--accent)',
                  }}>
                    {t.credits}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Stratégies ── */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(168,85,247,0.1)', fontSize: 16,
              }}>🎯</span>
              Stratégies
            </h3>
            <div className="landing-templates-grid">
              {[
                { emoji: '📢', name: 'Stratégie marketing', agent: 'Manon', credits: '~3-5 cr', href: '/client/strategy' },
                { emoji: '💰', name: 'Plan financier', agent: 'Antoine', credits: '~3-5 cr', href: '/client/strategy' },
                { emoji: '🛠️', name: 'Feuille de route tech', agent: 'Hugo', credits: '~3-5 cr', href: '/client/strategy' },
                { emoji: '🤝', name: 'Plan commercial', agent: 'Thomas', credits: '~3-5 cr', href: '/client/strategy' },
                { emoji: '👥', name: 'Stratégie RH', agent: 'Julien', credits: '~3-5 cr', href: '/client/strategy' },
              ].map(t => (
                <Link key={t.name} href={t.href} className="landing-template-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Agent : {t.agent}
                  </div>
                  <div style={{
                    display: 'inline-block', alignSelf: 'flex-start',
                    padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: 'rgba(168,85,247,0.08)', color: '#a855f7',
                  }}>
                    {t.credits}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Réunions ── */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(34,197,94,0.1)', fontSize: 16,
              }}>🗣️</span>
              Réunions
            </h3>
            <div className="landing-templates-grid">
              {[
                { emoji: '🚀', name: 'Lancement projet', agents: 'Sarah, Hugo, Antoine', credits: '~10 cr', href: '/client/meeting' },
                { emoji: '💡', name: 'Brainstorming produit', agents: 'Manon, Hugo, Thomas', credits: '~10 cr', href: '/client/meeting' },
                { emoji: '🚨', name: 'Résolution de crise', agents: 'Sarah, Clara, Marie', credits: '~10 cr', href: '/client/meeting' },
              ].map(t => (
                <Link key={t.name} href={t.href} className="landing-template-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Agents : {t.agents}
                  </div>
                  <div style={{
                    display: 'inline-block', alignSelf: 'flex-start',
                    padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: 'rgba(34,197,94,0.08)', color: '#16a34a',
                  }}>
                    {t.credits}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Automatisations ── */}
          <div>
            <h3 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(245,158,11,0.1)', fontSize: 16,
              }}>⚡</span>
              Automatisations
            </h3>
            <div className="landing-templates-grid">
              {[
                { emoji: '☀️', name: 'Briefing quotidien', desc: 'Recevez chaque matin un résumé de vos tâches et insights', href: '/client/briefing' },
                { emoji: '🔍', name: 'Analyse de site web', desc: 'Collez votre URL, Sarah analyse tout', href: '/client/onboarding' },
                { emoji: '⚙️', name: 'Personnalisation express', desc: '3 presets pour configurer vos agents en 1 clic', href: '/client/agents/customize' },
              ].map(t => (
                <Link key={t.name} href={t.href} className="landing-template-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{t.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TÉMOIGNAGES ═══════════ */}
        <section className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Témoignages de nos premiers utilisateurs
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Ils font confiance à Sarah
            </h2>
          </div>

          <div className="landing-testimonials-grid">
            <TestimonialCard
              name="Marie Dupont"
              company="Dupont Immobilier"
              role="Gérante"
              rating={5}
              quote="Depuis que Sarah répond à nos appels, nous ne perdons plus aucun prospect. Le week-end, les soirs… elle est toujours là. Nos clients sont impressionnés par la qualité des réponses."
              avatarColor="#ec4899"
            />
            <TestimonialCard
              name="Thomas Bernard"
              company="Bernard & Associés"
              role="Avocat associé"
              rating={5}
              quote="J'étais sceptique au début, mais Sarah gère parfaitement le filtrage des appels urgents. Elle comprend le contexte juridique et sait quand me transférer un appel. Un gain de temps énorme."
              avatarColor="#6366f1"
            />
            <TestimonialCard
              name="Sophie Martin"
              company="Agence Créative SM"
              role="Directrice"
              rating={5}
              quote="Le répondeur IA, c'était le début. Maintenant j'utilise aussi l'agent Marketing et Commercial, même par WhatsApp et notes vocales. Sarah est devenue indispensable pour ma petite agence."
              avatarColor="#f59e0b"
            />
          </div>
        </section>

        {/* ═══════════ NOTRE VISION ═══════════ */}
        <section className="landing-section" style={{ textAlign: 'center' }}>
          <div className="landing-image-banner" style={{ maxWidth: 800 }}>
            <img
              src="/images/team.jpg"
              alt="L'équipe SARAH OS"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
            <div className="landing-image-banner-overlay">
              <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Technologie française, ambition mondiale
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                SARAH OS est conçu par une équipe passionnée d&apos;IA et d&apos;entrepreneuriat
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
            marginTop: 32,
          }}>
            {[
              { icon: '🛡️', label: 'Sécurité entreprise', desc: 'Chiffrement, auth JWT, rate limiting' },
              { icon: '✅', label: '702 tests automatisés', desc: 'Qualité garantie en continu' },
              { icon: '🇪🇺', label: 'Conforme RGPD', desc: 'Vos données restent les vôtres' },
              { icon: '🇫🇷', label: 'Made in France', desc: 'Conçu et hébergé en France' },
            ].map(t => (
              <div key={t.label} style={{
                padding: '16px 20px', borderRadius: 12,
                background: 'var(--bg-secondary, #f8fafc)',
                border: '1px solid var(--border-light, #e5e7eb)',
                textAlign: 'center', minWidth: 160, flex: '1 1 160px', maxWidth: 220,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ TARIFS ═══════════ */}
        <section id="tarifs" className="landing-section">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Gratuit. Payez uniquement les tokens consommés.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 550, margin: '0 auto' }}>
              Votre taux de commission est verrouillé à vie selon votre numéro d&apos;inscription.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 20, maxWidth: 900, margin: '0 auto', alignItems: 'stretch' }}>
            {[
              { id: 'early', icon: '🌟', name: 'Early Adopter', desc: 'Les 1 000 premiers inscrits', rate: '0%', color: '#22c55e', popular: true, detail: 'Zéro commission à vie' },
              { id: 'standard', icon: '🚀', name: 'Standard', desc: 'Inscrits 1 001 à 100 000', rate: '5%', color: '#6366f1', popular: false, detail: '5% sur le coût des tokens' },
              { id: 'plus', icon: '💎', name: 'Standard+', desc: 'À partir du 100 001e', rate: '7%', color: '#9333ea', popular: false, detail: '7% sur le coût des tokens' },
            ].map(tier => (
              <div key={tier.id} className={`plan-card card-lift${tier.popular ? ' plan-card-popular' : ''}`} style={{
                borderColor: tier.popular ? tier.color : undefined,
                textAlign: 'center',
              }}>
                {tier.popular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: tier.color, color: 'white', fontSize: 10, fontWeight: 700,
                    padding: '3px 16px', borderRadius: '0 0 8px 8px', letterSpacing: '0.03em',
                  }}>
                    PLACES LIMITÉES
                  </div>
                )}
                <div style={{ fontSize: 40, marginBottom: 8, marginTop: tier.popular ? 8 : 0 }}>{tier.icon}</div>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: tier.color,
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
                }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{tier.desc}</div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', color: tier.color }}>{tier.rate}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>de commission</div>
                <div style={{
                  display: 'inline-block', padding: '6px 14px', borderRadius: 8,
                  fontSize: 14, fontWeight: 700,
                  background: tier.color + '12', color: tier.color, marginBottom: 16,
                }}>
                  Taux verrouillé à vie
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  {tier.detail}
                </div>
                <Link href="/login?mode=register" className="btn btn-primary" style={{
                  width: '100%', height: 44, fontSize: 14,
                  background: tier.popular ? tier.color : undefined,
                }}>
                  S&apos;inscrire
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {SIGNUP_BONUS_CREDITS} crédits offerts à l&apos;inscription — sans engagement
            </p>
            <Link href="/plans" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>
              Voir les détails complets &rarr;
            </Link>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" className="landing-section landing-faq" style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, textAlign: 'center', marginBottom: 40, letterSpacing: '-0.03em' }}>
            Questions fréquentes
          </h2>
          {[
            {
              q: 'Comment fonctionne le Répondeur Intelligent de Sarah OS ?',
              a: `Le Répondeur Intelligent de Sarah OS est un agent IA qui répond à vos appels téléphoniques 24h/24, 7j/7. Contrairement à un répondeur classique, il comprend le contexte de votre entreprise et interagit naturellement avec vos interlocuteurs. Il prend les messages détaillés, qualifie les demandes (prospect, client existant, urgence) et transfère les appels critiques directement sur votre mobile. Chaque appel est résumé dans votre tableau de bord avec les informations clés : nom de l'appelant, objet de l'appel, niveau d'urgence et actions recommandées. Idéal pour les PME, artisans, professions libérales et indépendants qui ne peuvent pas se permettre de manquer un appel.`,
            },
            {
              q: 'Sarah OS est-il vraiment gratuit ? Quel est le modèle de tarification ?',
              a: `Oui, l'accès à la plateforme Sarah OS et à tous les ${DEFAULT_AGENTS.length} agents IA est 100% gratuit — pas d'abonnement, pas de frais fixes, pas d'engagement. Vous ne payez que les tokens consommés lors de vos interactions avec les agents. À l'inscription, vous recevez ${SIGNUP_BONUS_CREDITS} crédits offerts pour tester le service. Ensuite, vous rechargez votre portefeuille par dépôt (5€, 20€, 50€ ou 100€) et ne payez que ce que vous consommez réellement. Les 1 000 premiers inscrits bénéficient de 0% de commission à vie. C'est un modèle « pay-as-you-go » transparent, sans surprise.`,
            },
            {
              q: 'Combien coûte un appel répondu par le Répondeur IA ?',
              a: `Un appel répondu par le Répondeur Intelligent consomme environ ${repondeur.priceCredits} crédits, soit quelques centimes. Avec un dépôt de 20€, vous pouvez traiter des centaines d'interactions. À titre de comparaison, un secrétariat téléphonique externalisé coûte entre 1€ et 3€ par appel, et une secrétaire à temps plein coûte plus de 2 000€ par mois. Sarah OS est donc entre 15 et 50 fois moins cher qu'un service humain, tout en étant disponible 24h/24 sans pause ni congés.`,
            },
            {
              q: `Quels sont les ${DEFAULT_AGENTS.length} agents IA disponibles dans Sarah OS ?`,
              a: `Sarah OS propose ${DEFAULT_AGENTS.length} agents IA spécialisés qui couvrent tous les postes clés d'une entreprise : ${DEFAULT_AGENTS.map(a => `${a.emoji} ${a.role}`).join(', ')}. Chaque agent est expert dans son domaine et alimenté par l'IA Claude d'Anthropic. La Répondeuse Intelligente gère vos appels, l'Assistante Exécutive organise votre quotidien, le Directeur Commercial booste vos ventes, la Directrice Marketing pilote votre visibilité, le DRH recrute et forme, la Directrice Communication soigne votre image, le Directeur Financier gère vos budgets, le Directeur Technique résout vos défis tech, la Directrice Juridique sécurise vos contrats, et la Directrice Générale conseille sur la stratégie globale.`,
            },
            {
              q: 'Mes données sont-elles en sécurité avec Sarah OS ?',
              a: `La sécurité est au cœur de Sarah OS. Vos données sont chiffrées en transit et au repos. Nous utilisons Claude Sonnet pour les tâches rapides et Claude Opus avec Extended Thinking pour les décisions stratégiques — les modèles d'Anthropic, leader mondial en sécurité et alignement IA. Vos conversations ne sont jamais utilisées pour entraîner des modèles. Les notes vocales WhatsApp sont transcrites par Deepgram puis immédiatement supprimées. Conformes RGPD, vous gardez le contrôle total de vos données.`,
            },
            {
              q: 'Puis-je personnaliser les agents IA de Sarah OS ?',
              a: `Absolument ! L'Agent Studio de Sarah OS vous permet de personnaliser chaque agent en profondeur. Vous pouvez ajuster la personnalité (formel/décontracté, concis/détaillé, créatif/factuel), définir l'expertise par domaine et secteur d'activité, configurer les instructions (ce que l'agent doit toujours faire ou ne jamais faire), et renseigner le contexte de votre entreprise (vision, KPIs, équipe, priorités). Trois presets sont disponibles — Mode Startup, Mode Corporate et Mode Agence — pour un démarrage rapide. Vos personnalisations s'appliquent à toutes les interactions : chat, réunion, briefing et plus.`,
            },
            {
              q: 'Sarah OS convient-il aux petites entreprises et indépendants ?',
              a: `Sarah OS a été conçu spécifiquement pour les PME françaises, les indépendants, les artisans et les professions libérales. Contrairement aux solutions d'IA d'entreprise coûteuses et complexes, Sarah OS est accessible dès 0€ (pas d'abonnement) et ne nécessite aucune compétence technique. Le Répondeur Intelligent est particulièrement adapté aux professionnels qui manquent des appels quand ils sont en rendez-vous, sur un chantier ou en consultation. Que vous soyez avocat, médecin, agent immobilier, artisan, consultant ou gérant de TPE/PME, Sarah OS s'adapte à votre métier et votre vocabulaire.`,
            },
            {
              q: 'Comment démarrer avec Sarah OS ?',
              a: `C'est très simple : créez votre compte en 30 secondes, recevez vos ${SIGNUP_BONUS_CREDITS} crédits offerts, et accédez immédiatement à vos ${DEFAULT_AGENTS.length} agents IA propulsés par Claude AI. Parlez-leur par chat, par WhatsApp ou par notes vocales. Vos agents vous répondent avec les voix ultra-réalistes d'ElevenLabs Flash v2.5. Connectez Google Calendar pour que Léa planifie vos réunions automatiquement. Aucune carte bancaire requise.`,
            },
          ].map(faq => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <div>{faq.a}</div>
            </details>
          ))}
        </section>

        {/* ═══════════ CTA FINAL ═══════════ */}
        <section className="landing-section" style={{
          textAlign: 'center', padding: '60px 24px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))',
          border: '1px solid rgba(99,102,241,0.15)',
          marginBottom: 40,
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>
            Prêt à ne plus jamais manquer un appel ?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            Commencez gratuitement avec {SIGNUP_BONUS_CREDITS} crédits offerts
          </p>
          <Link href="/login?mode=register" className="btn btn-primary" style={{
            padding: '16px 40px', fontSize: 17, fontWeight: 700,
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            Essayer gratuitement
          </Link>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            {['Pas de carte bancaire', 'Crédits sans expiration', '10 agents inclus', 'Conforme RGPD'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ color: '#16a34a' }}>&#10003;</span> {t}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <span className="brand-badge brand-badge-claude"><ClaudeIcon size={12} /> Claude AI</span>
            <span className="brand-badge brand-badge-whatsapp"><WhatsAppIcon size={12} /> WhatsApp</span>
            <span className="brand-badge brand-badge-elevenlabs">🔊 ElevenLabs</span>
            <span className="brand-badge brand-badge-calendar">📅 Calendar</span>
            <span className="brand-badge" style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.15)' }}>🇫🇷 Made in France</span>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer style={{
          textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--border-light, #e5e7eb)',
          marginTop: 40,
        }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Se connecter</Link>
            <Link href="/demo" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Demo</Link>
            <Link href="/plans" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Tarifs</Link>
            <Link href="/whatsapp" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>WhatsApp</Link>
            <Link href="/claude" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Claude AI</Link>
            <a href="#faq" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>SARAH OS v0.10.0 — Propulsé par</span>
            <ClaudeIcon size={14} />
            <span style={{ fontWeight: 600 }}>Claude AI</span>
            <span>(Sonnet & Opus)</span>
            <span>+ ElevenLabs + WhatsApp</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
