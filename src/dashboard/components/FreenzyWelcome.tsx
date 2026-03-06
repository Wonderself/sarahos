'use client';

import Link from 'next/link';
import { getAgentsForTier, DEFAULT_AGENTS, type AgentTypeId } from '../lib/agent-config';

interface FreenzyWelcomeProps {
  userName: string;
  tier: string;
  onDismiss: () => void;
}

// Free model: same actions for everyone
const dgAgent = DEFAULT_AGENTS.find(a => a.id === 'fz-dg')!;

const QUICK_ACTIONS: Array<{ icon: string; label: string; desc: string; href: string }> = [
  { icon: '💬', label: `Discuter avec ${dgAgent.name}`, desc: `Votre équipe de ${DEFAULT_AGENTS.length} agents IA est prête`, href: '/client/chat' },
  { icon: '🏛️', label: 'Réunion stratégique', desc: 'Réunissez vos agents', href: '/client/meeting' },
  { icon: '🎨', label: 'Agent Studio', desc: 'Personnalisez vos agents', href: '/client/agents/customize' },
  { icon: '☀️', label: 'Briefing du jour', desc: 'Tâches et insights', href: '/client/briefing' },
];

export default function FreenzyWelcome({ userName, tier, onDismiss }: FreenzyWelcomeProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const availableAgents = getAgentsForTier(tier);
  const agentDetails = availableAgents.map(id => DEFAULT_AGENTS.find(a => a.id === id)!).filter(Boolean);

  const actions = QUICK_ACTIONS;

  // Check if company profile exists
  let hasProfile = false;
  try {
    const profile = localStorage.getItem('fz_company_profile');
    hasProfile = !!profile && profile !== '{}';
  } catch { /* */ }

  return (
    <div className="welcome-overlay" onClick={onDismiss}>
      <div className="welcome-card" onClick={e => e.stopPropagation()}>
        {/* Freenzy Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="fz-logo-text" style={{ fontSize: 24, margin: '0 auto 16px', color: 'var(--accent)' }}>
            FREENZY.IO
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>
            {greeting}, {userName || 'cher client'} !
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 400, margin: '0 auto' }}>
            Je suis {DEFAULT_AGENTS.find(a => a.id === 'fz-dg')!.name}, votre {DEFAULT_AGENTS.find(a => a.id === 'fz-dg')!.role}. Votre équipe de {agentDetails.length} agent{agentDetails.length > 1 ? 's' : ''} IA est prête à travailler.
          </p>
        </div>

        {/* Available agents preview */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {agentDetails.map(a => (
            <div key={a.id} title={a.role} style={{
              width: 36, height: 36, borderRadius: 10,
              background: a.color + '22', border: `1px solid ${a.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {a.emoji}
            </div>
          ))}
        </div>

        {/* Onboarding CTA — shown prominently if no profile */}
        {!hasProfile && (
          <div style={{
            padding: '16px 20px', marginBottom: 20, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #5b6cf70a, #8b7cf808)',
            border: '1px solid #5b6cf725',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              Configurons votre profil !
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
              Plus vos agents connaissent votre entreprise, plus leurs conseils seront pertinents et personnalisés.
              Prenez 5 minutes pour remplir votre profil — cela changera tout.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link
                href="/client/onboarding"
                onClick={onDismiss}
                className="btn btn-primary"
                style={{ fontSize: 14, padding: '10px 24px' }}
              >
                Configurer mon profil
              </Link>
              <button
                onClick={onDismiss}
                className="btn btn-ghost"
                style={{ fontSize: 13, color: 'var(--text-muted)' }}
              >
                Plus tard
              </button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Que souhaitez-vous faire ?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginBottom: 24 }}>
          {actions.map(action => (
            <Link
              key={action.label}
              href={action.href}
              onClick={onDismiss}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)', textDecoration: 'none', color: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{action.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{action.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dismiss */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Passer et aller au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
