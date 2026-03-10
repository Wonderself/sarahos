'use client';

import { useState, useEffect } from 'react';
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
import {
  Team, TeamMember, Group, Community,
  getTeams, createTeam, updateTeam, deleteTeam, getTeamById,
  addMember, removeMember, updateMemberRole, updateMemberStatus,
  getOnlineMembers, searchMembers, getMemberStats, inviteMember,
  getGroups, createGroup, updateGroup, deleteGroup, addGroupMember, removeGroupMember,
  getCommunities, createCommunity, joinCommunity, leaveCommunity, getJoinedCommunities, isJoined,
  seedDefaults, getCurrentUser
} from '../../../lib/team-management';

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
      materialIcon: (resolved as unknown as Record<string, unknown>).materialIcon as string ?? 'smart_toy',
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

type TabId = 'agents' | 'members' | 'groups' | 'communities' | 'activity';

const GROUP_COLORS = ['#0EA5E9', '#7C3AED', '#16A34A', '#D97706', '#DC2626', '#E11D48'];

function roleColor(role: string): string {
  switch (role) {
    case 'owner': return 'warning';
    case 'admin': return 'accent';
    case 'member': return 'success';
    case 'viewer': return 'neutral';
    default: return 'neutral';
  }
}

function roleLabelFr(role: string): string {
  switch (role) {
    case 'owner': return 'Propriétaire';
    case 'admin': return 'Admin';
    case 'member': return 'Membre';
    case 'viewer': return 'Lecteur';
    default: return role;
  }
}

export default function TeamPage() {
  const [agents, setAgents] = useState<TeamAgent[]>([]);
  const [tier, setTier] = useState('guest');
  const [activeIds, setActiveIds] = useState<AgentTypeId[]>(['fz-repondeur']);
  const [activeTab, setActiveTab] = useState<TabId>('agents');

  // Workspace state (kept for activity tab)
  const [workspaces, setWorkspaces] = useState<Array<{ id: string; name: string; slug: string; plan: string; maxMembers: number }>>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [wsActivity, setWsActivity] = useState<Array<{ id: string; action: string; userName?: string; createdAt: string }>>([]);
  const [error, setError] = useState('');

  // Members tab state
  const [teams, setTeamsState] = useState<Team[]>([]);
  const [membersLocal, setMembersLocal] = useState<TeamMember[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [memberSort, setMemberSort] = useState<'name' | 'role' | 'status'>('status');
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Groups tab state
  const [groups, setGroupsLocal] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('👥');
  const [newGroupColor, setNewGroupColor] = useState('#0EA5E9');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null);

  // Communities tab state
  const [communities, setCommunitiesLocal] = useState<Community[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityEmoji, setNewCommunityEmoji] = useState('🌐');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityTags, setNewCommunityTags] = useState('');
  const [newCommunityPublic, setNewCommunityPublic] = useState(true);
  const [newCommunityRules, setNewCommunityRules] = useState('');

  useEffect(() => {
    // Agents init
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const t = session.tier || 'guest';
      setTier(t);
      setAgents(buildTeamAgents(t));
    } catch {
      setAgents(buildTeamAgents('guest'));
    }
    setActiveIds(getActiveAgentIds());

    // Seed and load team management data
    seedDefaults();
    const loadedTeams = getTeams();
    setTeamsState(loadedTeams);
    if (loadedTeams.length > 0) {
      setMembersLocal(loadedTeams[0].members);
    }
    setGroupsLocal(getGroups());
    setCommunitiesLocal(getCommunities());
    setJoinedIds(getJoinedCommunities());

    // Load workspaces for activity tab
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
      // silently fail
    }
  }

  async function loadWorkspaceData(wsId: string) {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const activityRes = await fetch(`/api/portal/workspaces/${wsId}/activity`, { headers });
      if (activityRes.ok) { const d = await activityRes.json(); setWsActivity(d.activity ?? []); }
    } catch {
      // silently fail
    }
  }

  function handleToggleAgent(agentId: AgentTypeId) {
    const updated = toggleAgent(agentId);
    setActiveIds([...updated]);
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

  // ── Members helpers ──
  function refreshMembers() {
    const loadedTeams = getTeams();
    setTeamsState(loadedTeams);
    if (loadedTeams.length > 0) {
      setMembersLocal(loadedTeams[0].members);
    }
  }

  function handleInviteMember() {
    if (!inviteEmail.trim() || teams.length === 0) return;
    inviteMember(teams[0].id, inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setInviteRole('member');
    setShowInviteModal(false);
    refreshMembers();
  }

  function handleChangeRole(memberId: string, newRole: TeamMember['role']) {
    if (teams.length === 0) return;
    updateMemberRole(teams[0].id, memberId, newRole);
    setMemberActionId(null);
    refreshMembers();
  }

  function handleRemoveMember(memberId: string) {
    if (teams.length === 0) return;
    removeMember(teams[0].id, memberId);
    setConfirmRemoveId(null);
    setMemberActionId(null);
    refreshMembers();
  }

  const filteredMembers = memberSearch
    ? membersLocal.filter(m =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : membersLocal;

  const onlineMembers = filteredMembers.filter(m => m.status !== 'offline');
  const offlineMembers = filteredMembers.filter(m => m.status === 'offline');
  const memberStats = teams.length > 0 ? getMemberStats(teams[0].id) : { total: 0, online: 0, admins: 0 };

  // ── Groups helpers ──
  function refreshGroups() {
    setGroupsLocal(getGroups());
  }

  function handleCreateGroup() {
    if (!newGroupName.trim() || teams.length === 0) return;
    createGroup(newGroupName.trim(), teams[0].id, newGroupEmoji, newGroupColor, newGroupDesc.trim());
    setNewGroupName('');
    setNewGroupEmoji('👥');
    setNewGroupColor('#0EA5E9');
    setNewGroupDesc('');
    setShowCreateGroup(false);
    refreshGroups();
  }

  function handleDeleteGroup(groupId: string) {
    deleteGroup(groupId);
    setConfirmDeleteGroupId(null);
    if (selectedGroup?.id === groupId) setSelectedGroup(null);
    refreshGroups();
  }

  function handleUpdateGroup() {
    if (!editingGroup) return;
    updateGroup(editingGroup.id, {
      name: editingGroup.name,
      emoji: editingGroup.emoji,
      color: editingGroup.color,
      description: editingGroup.description,
    });
    setEditingGroup(null);
    refreshGroups();
    // Refresh selectedGroup if it was edited
    if (selectedGroup?.id === editingGroup.id) {
      const updated = getGroups().find(g => g.id === editingGroup.id);
      if (updated) setSelectedGroup(updated);
    }
  }

  function handleAddGroupMember(groupId: string, memberId: string) {
    addGroupMember(groupId, memberId);
    refreshGroups();
    const updated = getGroups().find(g => g.id === groupId);
    if (updated) setSelectedGroup(updated);
  }

  function handleRemoveGroupMember(groupId: string, memberId: string) {
    removeGroupMember(groupId, memberId);
    refreshGroups();
    const updated = getGroups().find(g => g.id === groupId);
    if (updated) setSelectedGroup(updated);
  }

  // ── Communities helpers ──
  function refreshCommunities() {
    setCommunitiesLocal(getCommunities());
    setJoinedIds(getJoinedCommunities());
  }

  function handleJoinCommunity(communityId: string) {
    joinCommunity(communityId);
    refreshCommunities();
  }

  function handleLeaveCommunity(communityId: string) {
    leaveCommunity(communityId);
    refreshCommunities();
  }

  function handleCreateCommunity() {
    if (!newCommunityName.trim()) return;
    const user = getCurrentUser();
    const tags = newCommunityTags.split(',').map(t => t.trim()).filter(Boolean);
    createCommunity(
      newCommunityName.trim(),
      newCommunityDesc.trim(),
      newCommunityEmoji,
      '#7C3AED',
      tags,
      newCommunityPublic,
      newCommunityRules.trim(),
      user.id
    );
    // Auto-join
    const allC = getCommunities();
    const created = allC[allC.length - 1];
    if (created) joinCommunity(created.id);
    setNewCommunityName('');
    setNewCommunityEmoji('🌐');
    setNewCommunityDesc('');
    setNewCommunityTags('');
    setNewCommunityPublic(true);
    setNewCommunityRules('');
    setShowCreateCommunity(false);
    refreshCommunities();
  }

  const filteredCommunities = communitySearch
    ? communities.filter(c =>
        c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(communitySearch.toLowerCase()))
      )
    : communities;

  const joinedCommunities = filteredCommunities.filter(c => joinedIds.includes(c.id));
  const discoverCommunities = filteredCommunities.filter(c => !joinedIds.includes(c.id) && c.isPublic);

  // ── Agents computed ──
  const activeAgents = agents.filter(a => a.isAvailable && activeIds.includes(a.id as AgentTypeId));
  const inactiveAgents = agents.filter(a => a.isAvailable && !activeIds.includes(a.id as AgentTypeId));
  const lockedAgents = agents.filter(a => !a.isAvailable);

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
      <div className="cu-tabs">
        <button className={`cu-tab ${activeTab === 'agents' ? 'cu-tab-active' : ''}`} onClick={() => setActiveTab('agents')}>
          <span style={{ fontSize: 14 }}>🤖</span> Équipe IA
        </button>
        <button className={`cu-tab ${activeTab === 'members' ? 'cu-tab-active' : ''}`} onClick={() => setActiveTab('members')}>
          <span style={{ fontSize: 14 }}>👤</span> Membres
        </button>
        <button className={`cu-tab ${activeTab === 'groups' ? 'cu-tab-active' : ''}`} onClick={() => setActiveTab('groups')}>
          <span style={{ fontSize: 14 }}>🏘️</span> Groupes
        </button>
        <button className={`cu-tab ${activeTab === 'communities' ? 'cu-tab-active' : ''}`} onClick={() => setActiveTab('communities')}>
          <span style={{ fontSize: 14 }}>🌐</span> Communautés
        </button>
        <button className={`cu-tab ${activeTab === 'activity' ? 'cu-tab-active' : ''}`} onClick={() => {
          setActiveTab('activity');
          if (activeWorkspace) loadWorkspaceData(activeWorkspace);
        }}>
          <span style={{ fontSize: 14 }}>📋</span> Activité
        </button>
      </div>

      {/* ═══════════════════════════════════════════ Tab: Agents ═══════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════ Tab: Members ═══════════════════════════════════════════ */}
      {activeTab === 'members' && (
        <div>
          {/* Header */}
          <div className="cu-section-header">
            <div className="cu-section-header-title">
              <span style={{ fontSize: 16 }}>👤</span> Membres ({membersLocal.length})
            </div>
            <div className="cu-section-header-spacer" />
            <input
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{
                padding: '6px 12px', fontSize: 13, borderRadius: 8,
                border: '1px solid var(--fz-border, #E2E8F0)',
                background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                width: 180,
              }}
            />
            <button
              className="cu-section-header-action"
              onClick={() => setShowInviteModal(true)}
              style={{ marginLeft: 8 }}
            >
              Inviter +
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div className="cu-stat-card">
              <span className="cu-stat-emoji">👥</span>
              <div className="cu-stat-value">{memberStats.total}</div>
              <div className="cu-stat-label">Total membres</div>
            </div>
            <div className="cu-stat-card">
              <span className="cu-stat-emoji">🟢</span>
              <div className="cu-stat-value">{memberStats.online}</div>
              <div className="cu-stat-label">En ligne</div>
            </div>
            <div className="cu-stat-card">
              <span className="cu-stat-emoji">🛡️</span>
              <div className="cu-stat-value">{memberStats.admins}</div>
              <div className="cu-stat-label">Admins</div>
            </div>
          </div>

          {/* Online members */}
          {onlineMembers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 10 }}>
                🟢 En ligne ({onlineMembers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {onlineMembers.map(member => (
                  <div key={member.id} className="cu-member-card">
                    <div className="cu-avatar" style={{ width: 32, height: 32, position: 'relative' }}>
                      <span>{member.emoji}</span>
                      <div className={`cu-status-dot cu-status-${member.status}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cu-member-name">{member.name}</div>
                      <div className="cu-member-email">{member.email}</div>
                    </div>
                    <span className={`cu-badge cu-badge-${roleColor(member.role)}`}>{roleLabelFr(member.role)}</span>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setMemberActionId(memberActionId === member.id ? null : member.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted)', padding: 4 }}
                      >⚙️</button>
                      {memberActionId === member.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 50,
                          background: 'var(--fz-bg, #fff)', border: '1px solid var(--fz-border, #E2E8F0)',
                          borderRadius: 8, padding: 8, minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-muted)', marginBottom: 6, padding: '0 4px' }}>Changer le rôle</div>
                          {(['owner', 'admin', 'member', 'viewer'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => handleChangeRole(member.id, r)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px',
                                fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                                background: member.role === r ? 'var(--accent-light, #EDE9FE)' : 'transparent',
                                color: member.role === r ? 'var(--accent, #7c3aed)' : 'var(--fz-text)',
                                fontWeight: member.role === r ? 600 : 400,
                              }}
                            >
                              {roleLabelFr(r)}
                            </button>
                          ))}
                          <div style={{ borderTop: '1px solid var(--fz-border, #E2E8F0)', margin: '6px 0' }} />
                          {confirmRemoveId === member.id ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: '#DC262622', color: '#DC2626', fontWeight: 600 }}
                              >Confirmer</button>
                              <button
                                onClick={() => setConfirmRemoveId(null)}
                                style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'var(--fz-bg-secondary)', color: 'var(--fz-text-muted)' }}
                              >Annuler</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemoveId(member.id)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px',
                                fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                                background: 'transparent', color: '#DC2626',
                              }}
                            >
                              Retirer du groupe
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline members */}
          {offlineMembers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 10 }}>
                ⚪ Hors ligne ({offlineMembers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {offlineMembers.map(member => (
                  <div key={member.id} className="cu-member-card">
                    <div className="cu-avatar" style={{ width: 32, height: 32, position: 'relative' }}>
                      <span>{member.emoji}</span>
                      <div className={`cu-status-dot cu-status-${member.status}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cu-member-name">{member.name}</div>
                      <div className="cu-member-email">{member.email}</div>
                    </div>
                    <span className={`cu-badge cu-badge-${roleColor(member.role)}`}>{roleLabelFr(member.role)}</span>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setMemberActionId(memberActionId === member.id ? null : member.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted)', padding: 4 }}
                      >⚙️</button>
                      {memberActionId === member.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 50,
                          background: 'var(--fz-bg, #fff)', border: '1px solid var(--fz-border, #E2E8F0)',
                          borderRadius: 8, padding: 8, minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-muted)', marginBottom: 6, padding: '0 4px' }}>Changer le rôle</div>
                          {(['owner', 'admin', 'member', 'viewer'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => handleChangeRole(member.id, r)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px',
                                fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                                background: member.role === r ? 'var(--accent-light, #EDE9FE)' : 'transparent',
                                color: member.role === r ? 'var(--accent, #7c3aed)' : 'var(--fz-text)',
                                fontWeight: member.role === r ? 600 : 400,
                              }}
                            >
                              {roleLabelFr(r)}
                            </button>
                          ))}
                          <div style={{ borderTop: '1px solid var(--fz-border, #E2E8F0)', margin: '6px 0' }} />
                          {confirmRemoveId === member.id ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: '#DC262622', color: '#DC2626', fontWeight: 600 }}
                              >Confirmer</button>
                              <button
                                onClick={() => setConfirmRemoveId(null)}
                                style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'var(--fz-bg-secondary)', color: 'var(--fz-text-muted)' }}
                              >Annuler</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemoveId(member.id)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left', padding: '4px 8px',
                                fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                                background: 'transparent', color: '#DC2626',
                              }}
                            >
                              Retirer du groupe
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredMembers.length === 0 && (
            <div className="cu-empty-state">
              <div className="cu-empty-emoji">👤</div>
              <div className="cu-empty-title">Aucun membre trouvé</div>
              <div className="cu-empty-desc">{memberSearch ? 'Essayez un autre terme de recherche.' : 'Invitez des collaborateurs pour commencer.'}</div>
              <button className="cu-empty-action" onClick={() => setShowInviteModal(true)}>Inviter un membre</button>
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="cu-modal-overlay" onClick={() => setShowInviteModal(false)}>
              <div className="cu-modal" onClick={e => e.stopPropagation()}>
                <div className="cu-modal-header">
                  <div className="cu-modal-title">Inviter un membre</div>
                </div>
                <div className="cu-modal-body">
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="collaborateur@entreprise.com"
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Rôle</label>
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Membre</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                  </div>
                </div>
                <div className="cu-modal-footer">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: '1px solid var(--fz-border)',
                      background: 'transparent', color: 'var(--fz-text-muted)', cursor: 'pointer',
                    }}
                  >Annuler</button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim()}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: 'none',
                      background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
                      opacity: inviteEmail.trim() ? 1 : 0.5,
                    }}
                  >Envoyer l&apos;invitation</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ Tab: Groups ═══════════════════════════════════════════ */}
      {activeTab === 'groups' && (
        <div>
          {/* Header */}
          <div className="cu-section-header">
            <div className="cu-section-header-title">
              <span style={{ fontSize: 16 }}>🏘️</span> Groupes ({groups.length})
            </div>
            <div className="cu-section-header-spacer" />
            <button
              className="cu-section-header-action"
              onClick={() => setShowCreateGroup(true)}
            >
              Nouveau +
            </button>
          </div>

          {/* Selected group detail view */}
          {selectedGroup && !editingGroup && (
            <div style={{
              marginBottom: 20, padding: 16, borderRadius: 12,
              border: `1px solid ${selectedGroup.color}44`,
              background: selectedGroup.color + '08',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{selectedGroup.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fz-text)' }}>{selectedGroup.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fz-text-muted)' }}>{selectedGroup.description}</div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--fz-text-muted)' }}
                >✕</button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 8 }}>
                Membres du groupe ({selectedGroup.members.length})
              </div>

              {/* Current group members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {selectedGroup.members.map(mId => {
                  const member = membersLocal.find(m => m.id === mId);
                  return (
                    <div key={mId} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                      borderRadius: 8, background: 'var(--fz-bg, #fff)',
                      border: '1px solid var(--fz-border, #E2E8F0)',
                    }}>
                      <span style={{ fontSize: 16 }}>{member?.emoji ?? '👤'}</span>
                      <div style={{ flex: 1, fontSize: 13, color: 'var(--fz-text)' }}>{member?.name ?? mId}</div>
                      <button
                        onClick={() => handleRemoveGroupMember(selectedGroup.id, mId)}
                        style={{
                          padding: '2px 8px', fontSize: 11, borderRadius: 4,
                          border: 'none', background: '#DC262615', color: '#DC2626', cursor: 'pointer',
                        }}
                      >Retirer</button>
                    </div>
                  );
                })}
              </div>

              {/* Add members */}
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-muted)', marginBottom: 6 }}>
                Ajouter un membre
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {membersLocal.filter(m => !selectedGroup.members.includes(m.id)).map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleAddGroupMember(selectedGroup.id, m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                      borderRadius: 6, fontSize: 12, border: '1px solid var(--fz-border, #E2E8F0)',
                      background: 'var(--fz-bg, #fff)', color: 'var(--fz-text)', cursor: 'pointer',
                    }}
                  >
                    <span>{m.emoji}</span> {m.name} <span style={{ color: 'var(--accent)' }}>+</span>
                  </button>
                ))}
                {membersLocal.filter(m => !selectedGroup.members.includes(m.id)).length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--fz-text-muted)', fontStyle: 'italic' }}>Tous les membres sont dans ce groupe.</div>
                )}
              </div>
            </div>
          )}

          {/* Edit group modal */}
          {editingGroup && (
            <div className="cu-modal-overlay" onClick={() => setEditingGroup(null)}>
              <div className="cu-modal" onClick={e => e.stopPropagation()}>
                <div className="cu-modal-header">
                  <div className="cu-modal-title">Modifier le groupe</div>
                </div>
                <div className="cu-modal-body">
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Nom</label>
                    <input
                      value={editingGroup.name}
                      onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Emoji</label>
                      <input
                        value={editingGroup.emoji}
                        onChange={e => setEditingGroup({ ...editingGroup, emoji: e.target.value })}
                        style={{
                          width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                          border: '1px solid var(--fz-border, #E2E8F0)',
                          background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Couleur</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {GROUP_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditingGroup({ ...editingGroup, color: c })}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', border: editingGroup.color === c ? '2px solid var(--fz-text)' : '2px solid transparent',
                              background: c, cursor: 'pointer',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Description</label>
                    <input
                      value={editingGroup.description}
                      onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                </div>
                <div className="cu-modal-footer">
                  <button
                    onClick={() => setEditingGroup(null)}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: '1px solid var(--fz-border)',
                      background: 'transparent', color: 'var(--fz-text-muted)', cursor: 'pointer',
                    }}
                  >Annuler</button>
                  <button
                    onClick={handleUpdateGroup}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: 'none',
                      background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
                    }}
                  >Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {/* Groups grid */}
          {groups.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {groups.map(group => (
                <div key={group.id} className="cu-group-card">
                  <div className="cu-group-header">
                    <span className="cu-group-emoji" style={{ background: group.color + '22' }}>{group.emoji}</span>
                    <div>
                      <div className="cu-group-name">{group.name}</div>
                      <div className="cu-group-meta">{group.members.length} membre{group.members.length > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="cu-group-desc">{group.description}</div>
                  <div className="cu-group-actions">
                    <button
                      className="fz-btn fz-btn-primary fz-btn-sm"
                      onClick={() => { setSelectedGroup(group); setEditingGroup(null); }}
                      style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none', background: group.color, color: '#fff', cursor: 'pointer' }}
                    >Voir</button>
                    <button
                      className="fz-btn fz-btn-secondary fz-btn-sm"
                      onClick={() => setEditingGroup(group)}
                      style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--fz-border)', background: 'transparent', color: 'var(--fz-text)', cursor: 'pointer' }}
                    >Modifier</button>
                    {confirmDeleteGroupId === group.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#DC262622', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
                        >Confirmer</button>
                        <button
                          onClick={() => setConfirmDeleteGroupId(null)}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: 'none', background: 'var(--fz-bg-secondary)', color: 'var(--fz-text-muted)', cursor: 'pointer' }}
                        >Annuler</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteGroupId(group.id)}
                        style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#DC262615', color: '#DC2626', cursor: 'pointer' }}
                      >Supprimer</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cu-empty-state">
              <div className="cu-empty-emoji">🏘️</div>
              <div className="cu-empty-title">Aucun groupe</div>
              <div className="cu-empty-desc">Créez des groupes pour organiser vos collaborateurs par projet ou département.</div>
              <button className="cu-empty-action" onClick={() => setShowCreateGroup(true)}>Créer un groupe</button>
            </div>
          )}

          {/* Create group modal */}
          {showCreateGroup && (
            <div className="cu-modal-overlay" onClick={() => setShowCreateGroup(false)}>
              <div className="cu-modal" onClick={e => e.stopPropagation()}>
                <div className="cu-modal-header">
                  <div className="cu-modal-title">Nouveau groupe</div>
                </div>
                <div className="cu-modal-body">
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Nom du groupe</label>
                    <input
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="ex: Marketing, Développement..."
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Emoji</label>
                      <input
                        value={newGroupEmoji}
                        onChange={e => setNewGroupEmoji(e.target.value)}
                        style={{
                          width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                          border: '1px solid var(--fz-border, #E2E8F0)',
                          background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Couleur</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {GROUP_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setNewGroupColor(c)}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', border: newGroupColor === c ? '2px solid var(--fz-text)' : '2px solid transparent',
                              background: c, cursor: 'pointer',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Description</label>
                    <input
                      value={newGroupDesc}
                      onChange={e => setNewGroupDesc(e.target.value)}
                      placeholder="Description courte du groupe"
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                </div>
                <div className="cu-modal-footer">
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: '1px solid var(--fz-border)',
                      background: 'transparent', color: 'var(--fz-text-muted)', cursor: 'pointer',
                    }}
                  >Annuler</button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: 'none',
                      background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
                      opacity: newGroupName.trim() ? 1 : 0.5,
                    }}
                  >Créer le groupe</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ Tab: Communities ═══════════════════════════════════════════ */}
      {activeTab === 'communities' && (
        <div>
          {/* Header */}
          <div className="cu-section-header">
            <div className="cu-section-header-title">
              <span style={{ fontSize: 16 }}>🌐</span> Communautés
            </div>
            <div className="cu-section-header-spacer" />
            <input
              value={communitySearch}
              onChange={e => setCommunitySearch(e.target.value)}
              placeholder="Rechercher..."
              style={{
                padding: '6px 12px', fontSize: 13, borderRadius: 8,
                border: '1px solid var(--fz-border, #E2E8F0)',
                background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                width: 180,
              }}
            />
            <button
              className="cu-section-header-action"
              onClick={() => setShowCreateCommunity(true)}
              style={{ marginLeft: 8 }}
            >
              Créer +
            </button>
          </div>

          {/* Joined communities */}
          {joinedCommunities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 10 }}>
                Mes communautés ({joinedCommunities.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {joinedCommunities.map(community => (
                  <div key={community.id} className="cu-group-card" style={{ cursor: 'default' }}>
                    <div className="cu-group-header">
                      <span className="cu-group-emoji" style={{ background: community.color + '22' }}>{community.emoji}</span>
                      <div>
                        <div className="cu-group-name">{community.name}</div>
                        <div className="cu-group-meta">{community.memberCount} membres</div>
                      </div>
                    </div>
                    <div className="cu-group-desc">{community.description}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {community.tags.map(tag => <span key={tag} className="cu-tag">#{tag}</span>)}
                    </div>
                    <div className="cu-group-actions">
                      <button
                        onClick={() => handleLeaveCommunity(community.id)}
                        style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 6,
                          border: '1px solid var(--fz-border)', background: 'transparent',
                          color: 'var(--fz-text-muted)', cursor: 'pointer',
                        }}
                      >Quitter</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discover communities */}
          {discoverCommunities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 10 }}>
                Découvrir ({discoverCommunities.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {discoverCommunities.map(community => (
                  <div key={community.id} className="cu-group-card" style={{ cursor: 'pointer' }}>
                    <div className="cu-group-header">
                      <span className="cu-group-emoji" style={{ background: community.color + '22' }}>{community.emoji}</span>
                      <div>
                        <div className="cu-group-name">{community.name}</div>
                        <div className="cu-group-meta">{community.memberCount} membres</div>
                      </div>
                    </div>
                    <div className="cu-group-desc">{community.description}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {community.tags.map(tag => <span key={tag} className="cu-tag">#{tag}</span>)}
                    </div>
                    <div className="cu-group-actions">
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none',
                          background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
                        }}
                      >Rejoindre</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredCommunities.length === 0 && (
            <div className="cu-empty-state">
              <div className="cu-empty-emoji">🌐</div>
              <div className="cu-empty-title">Aucune communauté trouvée</div>
              <div className="cu-empty-desc">{communitySearch ? 'Essayez un autre terme de recherche.' : 'Créez ou rejoignez une communauté.'}</div>
              <button className="cu-empty-action" onClick={() => setShowCreateCommunity(true)}>Créer une communauté</button>
            </div>
          )}

          {/* Create community modal */}
          {showCreateCommunity && (
            <div className="cu-modal-overlay" onClick={() => setShowCreateCommunity(false)}>
              <div className="cu-modal" onClick={e => e.stopPropagation()}>
                <div className="cu-modal-header">
                  <div className="cu-modal-title">Nouvelle communauté</div>
                </div>
                <div className="cu-modal-body">
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Nom</label>
                    <input
                      value={newCommunityName}
                      onChange={e => setNewCommunityName(e.target.value)}
                      placeholder="ex: Développeurs React, Marketing B2B..."
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Emoji</label>
                      <input
                        value={newCommunityEmoji}
                        onChange={e => setNewCommunityEmoji(e.target.value)}
                        style={{
                          width: 60, padding: '8px 12px', fontSize: 13, borderRadius: 8,
                          border: '1px solid var(--fz-border, #E2E8F0)',
                          background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fz-text)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newCommunityPublic}
                          onChange={e => setNewCommunityPublic(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                        />
                        Communauté publique
                      </label>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Description</label>
                    <input
                      value={newCommunityDesc}
                      onChange={e => setNewCommunityDesc(e.target.value)}
                      placeholder="Décrivez votre communauté..."
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Tags (séparés par des virgules)</label>
                    <input
                      value={newCommunityTags}
                      onChange={e => setNewCommunityTags(e.target.value)}
                      placeholder="ex: tech, startup, marketing"
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary)', marginBottom: 4 }}>Règles de la communauté</label>
                    <textarea
                      value={newCommunityRules}
                      onChange={e => setNewCommunityRules(e.target.value)}
                      placeholder="Décrivez les règles de votre communauté..."
                      rows={3}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
                        border: '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1E293B)',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
                <div className="cu-modal-footer">
                  <button
                    onClick={() => setShowCreateCommunity(false)}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: '1px solid var(--fz-border)',
                      background: 'transparent', color: 'var(--fz-text-muted)', cursor: 'pointer',
                    }}
                  >Annuler</button>
                  <button
                    onClick={handleCreateCommunity}
                    disabled={!newCommunityName.trim()}
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8, border: 'none',
                      background: 'var(--accent, #7c3aed)', color: '#fff', cursor: 'pointer',
                      opacity: newCommunityName.trim() ? 1 : 0.5,
                    }}
                  >Créer la communauté</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ Tab: Activity ═══════════════════════════════════════════ */}
      {activeTab === 'activity' && (
        <div>
          {wsActivity.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px', color: 'var(--fz-text-secondary, #64748B)' }}>
              <div style={{ marginBottom: 12 }}><span style={{ fontSize: 48 }}>📋</span></div>
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
