'use client';

import Link from 'next/link';
import { getAgentsForTier, DEFAULT_AGENTS } from '../lib/agent-config';

interface FreenzyWelcomeProps {
  userName: string;
  tier: string;
  onDismiss: () => void;
}

const dgAgent = DEFAULT_AGENTS.find(a => a.id === 'fz-dg') ?? { name: 'Freenzy', materialIcon: 'verified' };

const QUICK_ACTIONS: Array<{ icon: string; label: string; desc: string; href: string }> = [
  { icon: 'chat', label: `Discuter avec ${dgAgent.name}`, desc: `${DEFAULT_AGENTS.length} assistants prets`, href: '/client/chat' },
  { icon: 'groups', label: 'Reunion strategique', desc: 'Reunissez vos assistants', href: '/client/meeting' },
  { icon: 'tune', label: 'Agent Studio', desc: 'Personnalisez vos assistants', href: '/client/agents/customize' },
  { icon: 'wb_sunny', label: 'Briefing du jour', desc: 'Taches et insights', href: '/client/briefing' },
];

export default function FreenzyWelcome({ userName, tier, onDismiss }: FreenzyWelcomeProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';

  const availableAgents = getAgentsForTier(tier);
  const agentDetails = availableAgents.map(id => DEFAULT_AGENTS.find(a => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a);

  let hasProfile = false;
  try {
    const profile = localStorage.getItem('fz_company_profile');
    hasProfile = !!profile && profile !== '{}';
  } catch { /* */ }

  return (
    <div className="welcome-overlay" onClick={onDismiss}>
      <div className="welcome-card" onClick={e => e.stopPropagation()}>
        {/* Logo + Greeting — compact */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div className="fz-logo-text" style={{ fontSize: 18, margin: '0 auto 6px', color: 'var(--accent)' }}>
            freenzy.io
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>
            {greeting}, {userName || 'cher client'} !
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: 380, margin: '0 auto' }}>
            Votre equipe de <span className="fz-logo-word">{agentDetails.length} assistants IA</span> est prete.
          </p>
        </div>

        {/* Agents preview — scrollable row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {agentDetails.slice(0, 10).map(a => (
            <div key={a.id} title={a.role} style={{
              width: 26, height: 26, borderRadius: 6,
              background: a.color + '22', border: `1px solid ${a.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 13, color: a.color }}>{a.materialIcon}</span>
            </div>
          ))}
          {agentDetails.length > 10 && (
            <div style={{
              width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-tertiary)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
            }}>+{agentDetails.length - 10}</div>
          )}
        </div>

        {/* Onboarding CTA */}
        {!hasProfile && (
          <div style={{
            padding: '10px 12px', marginBottom: 10, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed0a, #06b6d408)',
            border: '1px solid #7c3aed25',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
              Configurons votre profil !
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>
              Plus vos assistants connaissent votre entreprise, plus leurs réponses sont précises. <strong>5 minutes</strong> qui changent tout.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/client/onboarding" onClick={onDismiss} className="btn btn-primary" style={{ fontSize: 12, padding: '6px 16px' }}>
                Configurer
              </Link>
              <button onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Plus tard
              </button>
            </div>
          </div>
        )}

        {/* Quick actions — 2x2 grid */}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Que souhaitez-vous faire ?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.label}
              href={action.href}
              onClick={onDismiss}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px',
                borderRadius: 8, background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)', textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0 }}>{action.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dismiss */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Passer et aller au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
