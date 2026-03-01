import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_AGENTS, SIGNUP_BONUS_CREDITS } from '../../lib/agent-config';

export const metadata: Metadata = {
  title: 'Démo — Visite guidée de SARAH OS',
  description: `Découvrez l'interface de SARAH OS en images : tableau de bord, chat avec vos ${DEFAULT_AGENTS.length} agents IA, réunions stratégiques, Agent Studio et gestion des crédits. Visite guidée complète.`,
};

/* ══════════════════════════════════════════════
   SARAH OS — Page Démo
   Screenshots placeholders: mettre les images dans
   /public/images/screenshots/ avec les noms suivants:
     - dashboard.jpg
     - chat.jpg
     - agents.jpg
     - meeting.jpg
     - billing.jpg
     - customize.jpg
   ══════════════════════════════════════════════ */

const SCREENSHOTS = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble de votre activité : crédits restants, agents utilisés, historique des conversations et notifications. Tout est centralisé pour un pilotage efficace de votre entreprise.',
    file: '/images/screenshots/dashboard.jpg',
    color: '#6366f1',
  },
  {
    id: 'chat',
    title: 'Chat avec vos agents',
    description: 'Conversez en temps réel avec n\'importe lequel des 10 agents IA. Posez vos questions, demandez des analyses, générez des documents. Les réponses sont contextualisées à votre entreprise.',
    file: '/images/screenshots/chat.jpg',
    color: '#22c55e',
  },
  {
    id: 'agents',
    title: 'Vos 10 agents spécialisés',
    description: `Accédez à votre équipe complète d'agents IA : ${DEFAULT_AGENTS.map(a => `${a.name} (${a.role})`).join(', ')}.`,
    file: '/images/screenshots/agents.jpg',
    color: '#f97316',
  },
  {
    id: 'meeting',
    title: 'Réunions stratégiques',
    description: 'Organisez des réunions virtuelles avec plusieurs agents simultanément. Idéal pour les brainstormings, les revues de stratégie ou les décisions complexes nécessitant plusieurs expertises.',
    file: '/images/screenshots/meeting.jpg',
    color: '#a855f7',
  },
  {
    id: 'billing',
    title: 'Gestion des crédits',
    description: 'Suivez votre consommation en temps réel, achetez des packs de crédits et consultez l\'historique de vos transactions. Transparence totale sur vos dépenses.',
    file: '/images/screenshots/billing.jpg',
    color: '#f59e0b',
  },
  {
    id: 'customize',
    title: 'Agent Studio — Personnalisation',
    description: 'Personnalisez chaque agent selon votre secteur, votre style de communication et vos priorités. Ajustez la personnalité, l\'expertise et les instructions pour des réponses parfaitement adaptées.',
    file: '/images/screenshots/customize.jpg',
    color: '#ec4899',
  },
];

export default function DemoPage() {
  return (
    <div style={{ background: '#fff', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/images/logo.jpg"
            alt="SARAH OS"
            className="rounded-md"
            style={{ height: 42 }}
          />
        </Link>
        <div className="flex items-center gap-24">
          <Link href="/" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>Accueil</Link>
          <Link href="/plans" className="text-base text-secondary font-medium" style={{ textDecoration: 'none' }}>Tarifs</Link>
          <Link href="/login?mode=register" className="btn btn-primary btn-sm">
            Essayer gratuitement
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        {/* Hero */}
        <section className="text-center" style={{ padding: '60px 0 40px' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 20,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 24,
          }}>
            Visite guidée de SARAH OS
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16,
          }}>
            Découvrez votre futur
            <br />
            <span className="gradient-text">espace de travail IA</span>
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)',
            lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px',
          }}>
            {DEFAULT_AGENTS.length} agents IA spécialisés, un tableau de bord complet,
            des réunions stratégiques et un Agent Studio pour personnaliser chaque agent.
            Voici ce qui vous attend.
          </p>
        </section>

        {/* Screenshots grid */}
        <section style={{ paddingBottom: 80 }}>
          <div className="flex-col" style={{ gap: 48 }}>
            {SCREENSHOTS.map((screenshot, index) => (
              <div
                key={screenshot.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                  gap: 40,
                  alignItems: 'center',
                }}
                className="demo-row"
              >
                {/* Screenshot placeholder */}
                <div style={{ order: index % 2 === 0 ? 0 : 1 }}>
                  <div style={{
                    borderRadius: 16, overflow: 'hidden', position: 'relative',
                    background: `linear-gradient(135deg, ${screenshot.color}10, ${screenshot.color}05)`,
                    border: `1px solid ${screenshot.color}20`,
                    aspectRatio: '16/10',
                  }}>
                    {/* Real screenshot — replace when available */}
                    <img
                      src={screenshot.file}
                      alt={`SARAH OS — ${screenshot.title}`}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        position: 'absolute', inset: 0,
                      }}
                    />
                    {/* Fallback placeholder */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${screenshot.color}08, ${screenshot.color}03)`,
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: screenshot.color + '15',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12,
                      }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={screenshot.color} strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: screenshot.color }}>
                        {screenshot.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Capture d&apos;écran à venir
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ order: index % 2 === 0 ? 1 : 0 }}>
                  <div className="text-xs font-bold mb-12" style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                    background: screenshot.color + '12', color: screenshot.color,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-2xl font-bold mb-12" style={{ letterSpacing: '-0.02em' }}>
                    {screenshot.title}
                  </h3>
                  <p className="text-secondary leading-relaxed" style={{ fontSize: 15 }}>
                    {screenshot.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Agents recap */}
        <section style={{
          padding: '48px 0', borderTop: '1px solid var(--border-light, #e5e7eb)',
          marginBottom: 48,
        }}>
          <h2 className="text-2xl font-bold text-center mb-24" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Les {DEFAULT_AGENTS.length} agents à votre disposition
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {DEFAULT_AGENTS.map(agent => (
              <div key={agent.id} style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px',
                borderRadius: 12, background: 'var(--bg-secondary, #f8fafc)',
                border: '1px solid var(--border-light, #e5e7eb)',
              }}>
                <span style={{ fontSize: 24 }}>{agent.emoji}</span>
                <div>
                  <div className="text-md font-semibold">{agent.role}</div>
                  <div className="text-xs text-muted">{agent.priceCredits} crédits/action</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Voice & Communication Capabilities */}
        <section style={{
          padding: '48px 0', borderTop: '1px solid var(--border-light, #e5e7eb)',
          marginBottom: 48,
        }}>
          <h2 className="text-2xl text-center mb-12" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Interagissez comme vous le souhaitez
          </h2>
          <p className="text-secondary text-center leading-relaxed" style={{ fontSize: 15, maxWidth: 600, margin: '0 auto 32px' }}>
            SARAH OS ne se limite pas au texte. Utilisez votre voix, ecoutez les reponses de vos agents, et bientot communiquez par WhatsApp ou en video.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            <div className="bg-secondary rounded-xl text-center border p-20">
              <div style={{ fontSize: 32 }} className="mb-8">🎤</div>
              <div className="text-base font-bold mb-4">Dictee vocale (Deepgram)</div>
              <div className="text-sm text-muted leading-relaxed">
                Dictez vos messages par la voix. Transcription instantanee grace a Deepgram.
              </div>
              <div className="mt-8">
                <span className="badge badge-success font-semibold" style={{ fontSize: 10 }}>Disponible</span>
              </div>
            </div>
            <div className="bg-secondary rounded-xl text-center border p-20">
              <div style={{ fontSize: 32 }} className="mb-8">🔊</div>
              <div className="text-base font-bold mb-4">Ecoute des reponses</div>
              <div className="text-sm text-muted leading-relaxed">
                Ecoutez les reponses de vos agents en audio. Synthese vocale integree.
              </div>
              <div className="mt-8">
                <span className="badge badge-success font-semibold" style={{ fontSize: 10 }}>Disponible</span>
              </div>
            </div>
            <div className="bg-secondary rounded-xl text-center border p-20">
              <div style={{ fontSize: 32 }} className="mb-8">🎬</div>
              <div className="text-base font-bold mb-4">Avatar Video (D-ID)</div>
              <div className="text-sm text-muted leading-relaxed">
                Vos agents en video pour briefings et presentations. Interaction visuelle immersive.
              </div>
              <div className="mt-8">
                <span className="badge badge-warning font-semibold" style={{ fontSize: 10 }}>Bientot</span>
              </div>
            </div>
            <div className="bg-secondary rounded-xl text-center border p-20">
              <div style={{ fontSize: 32 }} className="mb-8">🗣️</div>
              <div className="text-base font-bold mb-4">Voix Premium (ElevenLabs)</div>
              <div className="text-sm text-muted leading-relaxed">
                Voix ultra-realistes pour chaque agent. Choisissez la voix qui vous convient.
              </div>
              <div className="mt-8">
                <span className="badge badge-warning font-semibold" style={{ fontSize: 10 }}>Bientot</span>
              </div>
            </div>
            <div className="bg-secondary rounded-xl text-center border p-20">
              <div style={{ fontSize: 32 }} className="mb-8">📲</div>
              <div className="text-base font-bold mb-4">WhatsApp</div>
              <div className="text-sm text-muted leading-relaxed">
                Parlez a vos agents directement par WhatsApp. Messages, notes vocales et rappels.
              </div>
              <div className="mt-8">
                <span className="badge badge-warning font-semibold" style={{ fontSize: 10 }}>Bientot</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-xl" style={{
          padding: '48px 24px', marginBottom: 48,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <h2 className="mb-12" style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Prêt à essayer ?
          </h2>
          <p className="text-secondary" style={{ fontSize: 15, maxWidth: 440, margin: '0 auto 24px' }}>
            Créez votre compte gratuitement et recevez {SIGNUP_BONUS_CREDITS} crédits offerts pour tester tous les agents.
          </p>
          <Link href="/login?mode=register" className="btn btn-primary" style={{
            padding: '14px 36px', fontSize: 16, fontWeight: 700,
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            Créer mon compte gratuit
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center" style={{
          padding: '32px 0',
          borderTop: '1px solid var(--border-light, #e5e7eb)',
        }}>
          <div className="flex flex-wrap flex-center gap-20 mb-16">
            <Link href="/" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Accueil</Link>
            <Link href="/login" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Se connecter</Link>
            <Link href="/plans" className="text-md text-secondary" style={{ textDecoration: 'none' }}>Tarifs</Link>
          </div>
          <div className="text-sm text-muted">
            SARAH OS v0.10.0 — Powered by Claude AI
          </div>
        </footer>
      </div>

      {/* Responsive CSS for demo rows */}
      <style>{`
        @media (max-width: 768px) {
          .demo-row {
            grid-template-columns: 1fr !important;
          }
          .demo-row > div {
            order: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
