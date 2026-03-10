'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
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
  materialIcon: string;
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
    'fz-repondeur': 'repondeur', 'fz-assistante': 'assistante',
    'fz-commercial': 'commercial', 'fz-marketing': 'marketing',
    'fz-rh': 'rh', 'fz-communication': 'communication',
    'fz-finance': 'cfo', 'fz-dev': 'cto',
    'fz-juridique': 'juridique', 'fz-dg': 'dg',
  };

  return DEFAULT_AGENTS.map(def => {
    const resolved = getEffectiveAgent(def.id, configs);
    return {
      id: def.id,
      shortId: shortIdMap[def.id] ?? def.id,
      name: resolved.name,
      role: resolved.role,
      emoji: resolved.emoji,
      materialIcon: (resolved as any).materialIcon ?? 'smart_toy',
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
  const [activeIds, setActiveIds] = useState<AgentTypeId[]>(['fz-repondeur']);
  const [activeTab, setActiveTab] = useState<'agents' | 'workspace' | 'activity'>('agents');
  // Workspace state
  const [workspaces, setWorkspaces] = useState<Array<{ id: string; name: string; slug: string; plan: string; maxMembers: number }>>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; userId: string; role: string; email?: string; displayName?: string }>>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; email: string; role: string }>>([]);
  const [wsActivity, setWsActivity] = useState<Array<{ id: string; action: string; userName?: string; createdAt: string }>>([]);
  const [wsName, setWsName] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const t = session.tier || 'guest';
      setTier(t);
      setAgents(buildTeamAgents(t));
    } catch {
      setAgents(buildTeamAgents('guest'));
    }
    setActiveIds(getActiveAgentIds());
    // Load workspaces
    loadWorkspaces();
  }, []);

  function getToken() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; }
  }

  async function loadWorkspaces() {
    try {
      const token = getToken();
      const res = await fetch('/api/portal/workspaces', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces ?? []);
        if (data.workspaces?.length > 0) {
          const first = data.workspaces[0];
          setActiveWorkspace(first.id);
          loadWorkspaceData(first.id);
        }
      }
    } catch {
      setError('Impossible de charger les espaces de travail');
    }
  }

  async function loadWorkspaceData(wsId: string) {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [membersRes, activityRes] = await Promise.all([
        fetch(`/api/portal/workspaces/${wsId}/members`, { headers }),
        fetch(`/api/portal/workspaces/${wsId}/activity`, { headers }),
      ]);
      if (membersRes.ok) { const d = await membersRes.json(); setMembers(d.members ?? []); }
      if (activityRes.ok) { const d = await activityRes.json(); setWsActivity(d.activity ?? []); }
    } catch {
      setError('Impossible de charger les données de l\'espace');
    }
  }

  async function createWorkspace() {
    if (!wsName.trim()) return;
    setCreatingWs(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch('/api/portal/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: wsName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(prev => [...prev, data.workspace]);
        setActiveWorkspace(data.workspace.id);
        setWsName('');
        loadWorkspaceData(data.workspace.id);
      } else {
        setError('Erreur lors de la création de l\'espace');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setCreatingWs(false);
  }

  async function sendInvite() {
    if (!inviteEmail.trim() || !activeWorkspace) return;
    setInviting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`/api/portal/workspaces/${activeWorkspace}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail('');
        loadWorkspaceData(activeWorkspace);
      } else {
        setError('Erreur lors de l\'envoi de l\'invitation');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setInviting(false);
  }

  function handleToggleAgent(agentId: AgentTypeId) {
    const updated = toggleAgent(agentId);
    setActiveIds([...updated]);
    // Persist to backend
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (session.token) {
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/active-agents', token: session.token, method: 'POST', data: { agents: updated } }),
        }).catch(() => {});
      }
    } catch { /* */ }
  }

  const activeAgents = agents.filter(a => a.isAvailable && activeIds.includes(a.id as AgentTypeId));
  const inactiveAgents = agents.filter(a => a.isAvailable && !activeIds.includes(a.id as AgentTypeId));
  const lockedAgents = agents.filter(a => !a.isAvailable);

  const TAB_EMOJIS: Record<string, string> = {
    smart_toy: '🤖',
    group: '👥',
    bar_chart: '📊',
  };

  return (
    <div className="client-page-scrollable">
      {/* Error banner */}
      {error && (
        <div className="alert alert-danger" style={{ margin: '0 0 16px', fontSize: 13 }} onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.team.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.team.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.team.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.team.helpText} />
        </div>
      </div>
      <PageExplanation pageId="team" text={PAGE_META.team?.helpText} />

      {/* Tabs */}
      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid var(--fz-border, #E2E8F0)' }}>
        {([
          { id: 'agents' as const, label: 'Mon équipe IA', icon: 'smart_toy' },
          { id: 'workspace' as const, label: 'Espace collaboratif', icon: 'group' },
          { id: 'activity' as const, label: 'Activité', icon: 'bar_chart' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'workspace' && activeWorkspace) loadWorkspaceData(activeWorkspace);
            }}
            className="btn btn-ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--fz-text-secondary, #64748B)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 13,
              padding: '8px 16px',
            }}
          >
            <span style={{ fontSize: 16 }}>{TAB_EMOJIS[tab.icon] ?? tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Agents */}
      {activeTab === 'agents' && <>

      <p className="text-sm mb-8" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
        {activeAgents.length} agent{activeAgents.length > 1 ? 's' : ''} actif{activeAgents.length > 1 ? 's' : ''} sur {DEFAULT_AGENTS.length} disponibles
      </p>

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
                    width: 52, height: 52,
                    background: agent.color + '22', border: `1px solid ${agent.color}44`,
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 26 }}>{agent.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'var(--fz-text, #1E293B)' }}>{agent.role}</div>
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

                <p className="text-sm mb-12" style={{ lineHeight: 1.5, color: 'var(--fz-text-secondary, #64748B)' }}>
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
                    <span style={{ fontSize: 16 }}>🎨</span>
                  </Link>
                </div>

                {agent.isCustomized && (
                  <div className="mt-8 text-xs text-accent font-semibold text-center">
                    ✨ Personnalisé via Agent Studio
                  </div>
                )}

                <div className="mt-8 text-center text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
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
          <p className="text-md mb-16" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
            Cliquez sur &quot;Activer&quot; pour ajouter un agent à votre équipe.
          </p>
          <div className="grid-2" style={{ gap: 12 }}>
            {inactiveAgents.map(agent => (
              <div key={agent.id} className="card" style={{
                borderColor: 'var(--fz-border, #E2E8F0)', opacity: 0.7,
              }}>
                <div className="flex gap-12 mb-12" style={{ alignItems: 'flex-start' }}>
                  <div className="flex-center rounded-lg" style={{
                    width: 52, height: 52,
                    background: 'var(--fz-bg-secondary, #F8FAFC)',
                    flexShrink: 0, filter: 'grayscale(0.3)',
                  }}>
                    <span style={{ fontSize: 26 }}>{agent.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{agent.role}</div>
                    <div className="text-sm mt-4" style={{ fontStyle: 'italic', color: 'var(--fz-text-muted, #94A3B8)' }}>
                      {agent.tagline}
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-12" style={{ lineHeight: 1.5, color: 'var(--fz-text-muted, #94A3B8)' }}>
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-4" style={{ marginBottom: 14 }}>
                  {agent.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="text-xs rounded-sm" style={{ padding: '2px 8px', background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text-muted, #94A3B8)' }}>
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>+{agent.capabilities.length - 3}</span>
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
      <div className="text-center rounded-lg mt-16" style={{ padding: '40px 20px', background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid var(--fz-border, #E2E8F0)' }}>
        <div className="mb-12"><span style={{ fontSize: 36 }}>💼</span></div>
        <div className="text-xl font-bold mb-8" style={{ color: 'var(--fz-text, #1E293B)' }}>
          Votre équipe IA travaille ensemble
        </div>
        <p className="text-md max-w-md" style={{ lineHeight: 1.6, margin: '0 auto 20px', color: 'var(--fz-text-secondary, #64748B)' }}>
          Tous les agents collaborent, partagent le contexte, et s&apos;améliorent avec chaque interaction.
        </p>
        <div className="flex flex-center flex-wrap" style={{ gap: 10 }}>
          <Link href="/client/chat" className="btn btn-primary">Discuter avec mon équipe</Link>
          <Link href="/client/meeting" className="btn btn-ghost">Lancer une reunion</Link>
        </div>
      </div>

      </>}

      {/* Tab: Workspace */}
      {activeTab === 'workspace' && (
        <div>
          {workspaces.length === 0 ? (
            <div className="text-center rounded-lg" style={{ padding: '60px 20px', background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid var(--fz-border, #E2E8F0)' }}>
              <div style={{ marginBottom: 16 }}><span style={{ fontSize: 48 }}>👥</span></div>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--fz-text, #1E293B)' }}>Créez votre premier espace collaboratif</h3>
              <p className="text-sm mb-16" style={{ maxWidth: 400, margin: '0 auto 20px', color: 'var(--fz-text-secondary, #64748B)' }}>
                Invitez votre équipe pour travailler ensemble : données partagées, agents communs, actions assignées.
              </p>
              <div className="flex flex-center gap-6">
                <input
                  value={wsName}
                  onChange={e => setWsName(e.target.value)}
                  placeholder="Nom de l'espace (ex: Mon entreprise)"
                  className="input"
                  style={{ maxWidth: 300, fontSize: 13 }}
                />
                <button
                  onClick={createWorkspace}
                  disabled={!wsName.trim() || creatingWs}
                  className="btn btn-primary"
                >
                  {creatingWs ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Workspace selector if multiple */}
              {workspaces.length > 1 && (
                <select
                  value={activeWorkspace ?? ''}
                  onChange={e => { setActiveWorkspace(e.target.value); loadWorkspaceData(e.target.value); }}
                  className="input mb-8"
                  style={{ fontSize: 13, width: 'auto' }}
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              )}

              {/* Workspace info */}
              <div className="card mb-8" style={{ padding: 16 }}>
                <div className="flex flex-between items-center mb-8">
                  <h3 className="text-base font-bold" style={{ color: 'var(--fz-text, #1E293B)' }}>
                    {workspaces.find(w => w.id === activeWorkspace)?.name ?? 'Espace'}
                  </h3>
                  <span className="text-xs font-medium" style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: 'var(--accent)11', color: 'var(--accent)',
                  }}>
                    {workspaces.find(w => w.id === activeWorkspace)?.plan ?? 'team'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
                  {members.length} membre{members.length > 1 ? 's' : ''} ·
                  Max {workspaces.find(w => w.id === activeWorkspace)?.maxMembers ?? 5}
                </p>
              </div>

              {/* Members list */}
              <div className="section">
                <div className="section-title">Membres</div>
                <div className="flex flex-col gap-4">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-8 card" style={{ padding: '10px 14px' }}>
                      <div className="flex-center rounded-full" style={{
                        width: 36, height: 36, background: 'var(--accent)22', color: 'var(--accent)',
                        fontSize: 14, fontWeight: 700,
                      }}>
                        {(m.displayName ?? m.email ?? '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--fz-text, #1E293B)' }}>{m.displayName ?? m.email ?? 'Utilisateur'}</div>
                        {m.email && <div className="text-xs" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{m.email}</div>}
                      </div>
                      <span className="text-xs font-medium" style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: m.role === 'owner' ? '#F59E0B22' : m.role === 'editor' ? '#3B82F622' : '#6B728022',
                        color: m.role === 'owner' ? '#F59E0B' : m.role === 'editor' ? '#3B82F6' : '#6B7280',
                      }}>
                        {m.role === 'owner' ? 'Propriétaire' : m.role === 'editor' ? 'Éditeur' : 'Lecteur'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite section */}
              <div className="section">
                <div className="section-title">Inviter un membre</div>
                <div className="flex gap-6 items-center flex-wrap">
                  <input
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Email du collaborateur"
                    type="email"
                    className="input"
                    style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="input"
                    style={{ width: 'auto', fontSize: 13 }}
                  >
                    <option value="viewer">Lecteur</option>
                    <option value="editor">Éditeur</option>
                  </select>
                  <button
                    onClick={sendInvite}
                    disabled={!inviteEmail.trim() || inviting}
                    className="btn btn-primary btn-sm"
                  >
                    {inviting ? 'Envoi...' : 'Inviter'}
                  </button>
                </div>
              </div>

              {/* Create another workspace */}
              <div className="section">
                <div className="section-title">Créer un autre espace</div>
                <div className="flex gap-6 items-center">
                  <input
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                    placeholder="Nom du nouvel espace"
                    className="input"
                    style={{ flex: 1, maxWidth: 300, fontSize: 13 }}
                  />
                  <button
                    onClick={createWorkspace}
                    disabled={!wsName.trim() || creatingWs}
                    className="btn btn-secondary btn-sm"
                  >
                    {creatingWs ? 'Création...' : '+ Créer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activity */}
      {activeTab === 'activity' && (
        <div>
          {wsActivity.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px', color: 'var(--fz-text-secondary, #64748B)' }}>
              <div style={{ marginBottom: 12 }}><span style={{ fontSize: 48 }}>📊</span></div>
              <p className="text-sm">Aucune activité pour le moment.</p>
              {workspaces.length === 0 && (
                <p className="text-xs mt-4">Créez un espace collaboratif pour voir l&apos;activité de votre équipe.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {wsActivity.map(entry => (
                <div key={entry.id} className="flex items-center gap-8 card" style={{ padding: '10px 14px' }}>
                  <div className="flex-center rounded-full" style={{
                    width: 32, height: 32, background: 'var(--fz-bg-secondary, #F8FAFC)',
                    fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)',
                  }}>
                    {(entry.userName ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: 'var(--fz-text, #1E293B)' }}>
                      <strong>{entry.userName ?? 'Utilisateur'}</strong>{' '}
                      {entry.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
                      {new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
