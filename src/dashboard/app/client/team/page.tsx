'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DEFAULT_AGENTS,
  loadAgentConfigs,
  getEffectiveAgent,
  isAgentAvailable,
  getRequiredPlan,
  getAgentsForTier,
  getActiveAgentIds,
  toggleAgent,
  type AgentTypeId,
  type ResolvedAgent,
} from '../../../lib/agent-config';

interface TeamAgent {
  id: string;
  shortId: string;
  name: string;
  role: string;
  emoji: string;
  level: string;
  description: string;
  tagline: string;
  hiringPitch: string;
  capabilities: string[];
  color: string;
  isCustomized: boolean;
  isAvailable: boolean;
  requiredPlan: string;
}

function buildTeamAgents(tier: string): TeamAgent[] {
  const configs = loadAgentConfigs();
  const shortIdMap: Record<string, string> = {
    'sarah-repondeur': 'repondeur', 'sarah-assistante': 'assistante',
    'sarah-commercial': 'commercial', 'sarah-marketing': 'marketing',
    'sarah-rh': 'rh', 'sarah-communication': 'communication',
    'sarah-finance': 'cfo', 'sarah-dev': 'cto',
    'sarah-juridique': 'juridique', 'sarah-dg': 'dg',
  };

  return DEFAULT_AGENTS.map(def => {
    const resolved = getEffectiveAgent(def.id, configs);
    return {
      id: def.id,
      shortId: shortIdMap[def.id] ?? def.id,
      name: resolved.name,
      role: resolved.role,
      emoji: resolved.emoji,
      level: def.level,
      description: def.description,
      tagline: def.tagline,
      hiringPitch: def.hiringPitch,
      capabilities: def.capabilities,
      color: resolved.color,
      isCustomized: resolved.isCustomized,
      isAvailable: isAgentAvailable(def.id, tier),
      requiredPlan: getRequiredPlan(def.id),
    };
  });
}

export default function TeamPage() {
  const [agents, setAgents] = useState<TeamAgent[]>([]);
  const [tier, setTier] = useState('guest');
  const [activeIds, setActiveIds] = useState<AgentTypeId[]>(['sarah-repondeur']);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
      const t = session.tier || 'guest';
      setTier(t);
      setAgents(buildTeamAgents(t));
    } catch {
      setAgents(buildTeamAgents('guest'));
    }
    setActiveIds(getActiveAgentIds());
  }, []);

  function handleToggleAgent(agentId: AgentTypeId) {
    const updated = toggleAgent(agentId);
    setActiveIds([...updated]);
    // Persist to backend
    try {
      const session = JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
      if (session.token) {
        fetch('/api/portal?path=/portal/active-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.token, agents: updated }),
        }).catch(() => {});
      }
    } catch { /* */ }
  }

  const activeAgents = agents.filter(a => a.isAvailable && activeIds.includes(a.id as AgentTypeId));
  const inactiveAgents = agents.filter(a => a.isAvailable && !activeIds.includes(a.id as AgentTypeId));
  const lockedAgents = agents.filter(a => !a.isAvailable);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon equipe IA</h1>
          <p className="page-subtitle">
            {activeAgents.length} agent{activeAgents.length > 1 ? 's' : ''} actif{activeAgents.length > 1 ? 's' : ''} sur {DEFAULT_AGENTS.length} disponibles — Acces gratuit
          </p>
        </div>
        <Link href="/client/chat" className="btn btn-primary">
          Discuter &rarr;
        </Link>
      </div>

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div className="section">
          <div className="section-title">Agents actifs</div>
          <div className="grid-2" style={{ gap: 12 }}>
            {activeAgents.map(agent => (
              <div key={agent.id} className="card" style={{
                borderColor: agent.color + '55',
                background: agent.color + '08',
              }}>
                <div className="flex gap-12 mb-12" style={{ alignItems: 'flex-start' }}>
                  <div className="flex-center rounded-lg" style={{
                    width: 52, height: 52, fontSize: 26,
                    background: agent.color + '22', border: `1px solid ${agent.color}44`,
                    flexShrink: 0,
                  }}>
                    {agent.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div className="text-lg font-bold">{agent.role}</div>
                        <div className="text-sm font-semibold mt-4" style={{ color: agent.color, fontStyle: 'italic' }}>
                          {agent.tagline}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 rounded-full" style={{
                        padding: '4px 10px',
                        background: '#22c55e22', border: '1px solid #22c55e44',
                      }}>
                        <div className="rounded-full" style={{
                          width: 8, height: 8, background: '#22c55e',
                          boxShadow: '0 0 6px #22c55e88',
                        }} />
                        <span className="text-xs font-semibold text-success">En ligne 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-secondary mb-12" style={{ lineHeight: 1.5 }}>
                  {agent.hiringPitch}
                </p>

                <div className="flex flex-wrap gap-4" style={{ marginBottom: 14 }}>
                  {agent.capabilities.map(cap => (
                    <span key={cap} className="text-xs rounded-sm font-medium" style={{
                      padding: '2px 8px',
                      background: agent.color + '15', color: agent.color,
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="flex gap-6">
                  <Link href="/client/chat" className="btn btn-primary btn-sm flex-1" style={{ background: agent.color }}>
                    Discuter &rarr;
                  </Link>
                  <Link href="/client/agents/customize" className="btn btn-ghost btn-sm" title="Personnaliser">
                    🎨
                  </Link>
                </div>

                {agent.isCustomized && (
                  <div className="mt-8 text-xs text-accent font-semibold text-center">
                    ✨ Personnalisé via Agent Studio
                  </div>
                )}

                <div className="mt-8 text-center text-xs text-muted">
                  Inclus gratuitement
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Agents — can be activated */}
      {inactiveAgents.length > 0 && (
        <div className="section">
          <div className="section-title">Agents disponibles</div>
          <p className="text-md text-muted mb-16">
            Cliquez sur &quot;Activer&quot; pour ajouter un agent a votre equipe.
          </p>
          <div className="grid-2" style={{ gap: 12 }}>
            {inactiveAgents.map(agent => (
              <div key={agent.id} className="card" style={{
                borderColor: 'var(--border-primary)', opacity: 0.7,
              }}>
                <div className="flex gap-12 mb-12" style={{ alignItems: 'flex-start' }}>
                  <div className="flex-center rounded-lg bg-tertiary" style={{
                    width: 52, height: 52, fontSize: 26,
                    flexShrink: 0, filter: 'grayscale(0.3)',
                  }}>
                    {agent.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-secondary">{agent.role}</div>
                    <div className="text-sm text-muted mt-4" style={{ fontStyle: 'italic' }}>
                      {agent.tagline}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted mb-12" style={{ lineHeight: 1.5 }}>
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-4" style={{ marginBottom: 14 }}>
                  {agent.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="text-xs rounded-sm bg-tertiary text-muted" style={{ padding: '2px 8px' }}>
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-xs text-muted">+{agent.capabilities.length - 3}</span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleAgent(agent.id as AgentTypeId)}
                  className="btn btn-primary btn-sm w-full"
                  style={{ background: agent.color }}
                >
                  Activer cet agent
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center rounded-lg bg-secondary border mt-16" style={{ padding: '40px 20px' }}>
        <div className="mb-12" style={{ fontSize: 36 }}>🏢</div>
        <div className="text-xl font-bold mb-8">
          Votre équipe IA travaille ensemble
        </div>
        <p className="text-md text-secondary max-w-md" style={{ lineHeight: 1.6, margin: '0 auto 20px' }}>
          Tous les agents sont des facettes de Sarah. Ils collaborent en arriere-plan,
          partagent le contexte de votre entreprise, et s&apos;ameliorent avec chaque interaction.
          Plus vous recrutez, plus votre équipe est performante.
        </p>
        <div className="flex flex-center flex-wrap" style={{ gap: 10 }}>
          <Link href="/client/chat" className="btn btn-primary">
            Discuter avec mon équipe
          </Link>
          <Link href="/client/meeting" className="btn btn-ghost">
            Lancer une reunion
          </Link>
        </div>
      </div>
    </div>
  );
}
