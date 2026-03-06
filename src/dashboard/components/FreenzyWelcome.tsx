'use client';

import Link from 'next/link';
import { getAgentsForTier, DEFAULT_AGENTS } from '../lib/agent-config';

interface FreenzyWelcomeProps {
  userName: string;
  tier: string;
  onDismiss: () => void;
}

const dgAgent = DEFAULT_AGENTS.find(a => a.id === 'fz-dg') ?? { name: 'Sarah', materialIcon: 'verified' };

const QUICK_ACTIONS: Array<{ icon: string; label: string; desc: string; href: string }> = [
  { icon: 'chat', label: `Discuter avec ${dgAgent.name}`, desc: `${DEFAULT_AGENTS.length} agents prets`, href: '/client/chat' },
  { icon: 'groups', label: 'Reunion strategique', desc: 'Reunissez vos agents', href: '/client/meeting' },
  { icon: 'tune', label: 'Agent Studio', desc: 'Personnalisez vos agents', href: '/client/agents/customize' },
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
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="fz-logo-text" style={{ fontSize: 20, margin: '0 auto 10px', color: 'var(--accent)' }}>
            freenzy.io
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
            {greeting}, {userName || 'cher client'} !
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: 380, margin: '0 auto' }}>
            Votre equipe de <span className="fz-logo-word">{agentDetails.length} agents IA</span> est prete.
          </p>
        </div>

        {/* Agents preview — scrollable row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {agentDetails.slice(0, 12).map(a => (
            <div key={a.id} title={a.role} style={{
              width: 30, height: 30, borderRadius: 8,
              background: a.color + '22', border: `1px solid ${a.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 15, color: a.color }}>{a.materialIcon}</span>
            </div>
          ))}
          {agentDetails.length > 12 && (
            <div style={{
              width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-tertiary)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            }}>+{agentDetails.length - 12}</div>
          )}
        </div>

        {/* Onboarding CTA */}
        {!hasProfile && (
          <div style={{
            padding: '12px 14px', marginBottom: 14, borderRadius: 10,
            background: 'linear-gradient(135deg, #5b6cf70a, #8b7cf808)',
            border: '1px solid #5b6cf725',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              Configurons votre profil !
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
              C&apos;est la que <span className="fz-logo-word">l&apos;IA</span> montre sa vraie puissance. Plus vos agents connaissent votre entreprise, plus leurs reponses sont precises et personnalisees. 5 minutes qui changent tout.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/client/onboarding" onClick={onDismiss} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
                Configurer
              </Link>
              <button onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Plus tard
              </button>
            </div>
          </div>
        )}

        {/* Quick actions — 2x2 grid */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Que souhaitez-vous faire ?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.label}
              href={action.href}
              onClick={onDismiss}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                borderRadius: 10, background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)', textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--accent)', flexShrink: 0 }}>{action.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dismiss */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Passer et aller au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
