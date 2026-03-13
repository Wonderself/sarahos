'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import AuthRequired from '../../../components/AuthRequired';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar, searchInput } from '../../../lib/page-styles';
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
    case 'owner': return 'Proprietaire';
    case 'admin': return 'Admin';
    case 'member': return 'Membre';
    case 'viewer': return 'Lecteur';
    default: return role;
  }
}

export default function TeamPage() {
  const isMobile = useIsMobile();
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
  const [newGroupEmoji, setNewGroupEmoji] = useState('\u{1F465}');
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
  const [newCommunityEmoji, setNewCommunityEmoji] = useState('\u{1F310}');
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
    setNewGroupEmoji('\u{1F465}');
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
    setNewCommunityEmoji('\u{1F310}');
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

  // ── Shared member row renderer ──
  function renderMemberRow(member: TeamMember) {
    return (
      <div key={member.id} style={{
        ...CU.card,
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: CU.accentLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative' as const, fontSize: 16,
        }}>
          <span>{member.emoji}</span>
          <div style={{
            position: 'absolute' as const, bottom: -1, right: -1,
            width: 10, height: 10, borderRadius: '50%',
            border: `2px solid ${CU.bg}`,
            background: member.status === 'online' ? CU.success : member.status === 'away' ? CU.warning : CU.border,
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{member.name}</div>
          <div style={{ fontSize: 11, color: CU.textMuted }}>{member.email}</div>
        </div>
        <span style={member.role === 'owner' ? CU.badgeWarning : member.role === 'admin' ? CU.badge : CU.badgeSuccess}>
          {roleLabelFr(member.role)}
        </span>
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => setMemberActionId(memberActionId === member.id ? null : member.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: CU.textMuted, padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >&#x2699;&#xFE0F;</button>
          {memberActionId === member.id && (
            <div style={{
              position: 'absolute' as const, right: 0, top: '100%', zIndex: 50,
              background: CU.bg, borderRadius: 8, padding: 8, minWidth: 160,
              border: `1px solid ${CU.border}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: CU.textMuted, marginBottom: 6, padding: '0 4px' }}>Changer le r&ocirc;le</div>
              {(['owner', 'admin', 'member', 'viewer'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => handleChangeRole(member.id, r)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left' as const, padding: '4px 8px',
                    fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                    background: member.role === r ? CU.accentLight : 'transparent',
                    color: member.role === r ? CU.text : CU.textSecondary,
                    fontWeight: member.role === r ? 600 : 400,
                  }}
                >
                  {roleLabelFr(r)}
                </button>
              ))}
              <div style={CU.divider} />
              {confirmRemoveId === member.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: '#DC262622', color: CU.danger, fontWeight: 600 }}
                  >Confirmer</button>
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    style={{ flex: 1, padding: '4px 8px', fontSize: 11, border: 'none', borderRadius: 4, cursor: 'pointer', background: CU.bgSecondary, color: CU.textMuted }}
                  >Annuler</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemoveId(member.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left' as const, padding: '4px 8px',
                    fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                    background: 'transparent', color: CU.danger,
                  }}
                >
                  Retirer du groupe
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthRequired pageName="Gestion d'Equipe">
    <div style={pageContainer(isMobile)}>
      {/* Error banner */}
      {error && (
        <div style={{ ...CU.card, background: '#FFF5F5', borderColor: CU.danger, color: CU.danger, fontSize: 13, marginBottom: 16, cursor: 'pointer' }} onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.team.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.team.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.team.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.team.helpText} />
        </div>
      </div>
      <PageExplanation pageId="team" text={PAGE_META.team?.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${CU.border}`, marginBottom: 20, overflowX: 'auto' as const }}>
        {([
          { id: 'agents' as TabId, emoji: '\u{1F916}', label: 'Equipe IA' },
          { id: 'members' as TabId, emoji: '\u{1F464}', label: 'Membres' },
          { id: 'groups' as TabId, emoji: '\u{1F3D8}\uFE0F', label: 'Groupes' },
          { id: 'communities' as TabId, emoji: '\u{1F310}', label: 'Communautes' },
          { id: 'activity' as TabId, emoji: '\u{1F4CB}', label: 'Activite' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'activity' && activeWorkspace) loadWorkspaceData(activeWorkspace);
            }}
            style={{
              ...(activeTab === tab.id ? CU.tabActive : CU.tab),
              display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap' as const, minHeight: 44,
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Agents ═══ */}
      {activeTab === 'agents' && <>

      <p style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 16 }}>
        {activeAgents.length} agent{activeAgents.length > 1 ? 's' : ''} actif{activeAgents.length > 1 ? 's' : ''} sur {DEFAULT_AGENTS.length} disponibles
      </p>

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={CU.sectionTitle}>Agents actifs</div>
          <div style={{ ...cardGrid(isMobile, 2), marginTop: 12 }}>
            {activeAgents.map(agent => (
              <div key={agent.id} style={{
                ...CU.card,
                borderColor: agent.color + '55',
                background: agent.color + '08',
              }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, background: agent.color + '22', border: `1px solid ${agent.color}44`,
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 26 }}>{agent.emoji}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: CU.text }}>{agent.role}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: agent.color, fontStyle: 'italic' }}>
                          {agent.tagline}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, borderRadius: 20,
                        padding: '4px 10px', background: CU.accentLight, border: `1px solid ${CU.border}`,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CU.text }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: CU.success }}>En ligne 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.5, color: CU.textSecondary, marginBottom: 12 }}>
                  {agent.hiringPitch}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 14 }}>
                  {agent.capabilities.map(cap => (
                    <span key={cap} style={{
                      ...CU.badge, padding: '2px 8px',
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href="/client/chat" style={{ ...CU.btnPrimary, flex: 1, background: agent.color, textDecoration: 'none' }}>
                    Discuter &rarr;
                  </Link>
                  <Link href="/client/agents/customize" style={{ ...CU.btnGhost, textDecoration: 'none' }} title="Personnaliser">
                    <span style={{ fontSize: 16 }}>{'\u{1F3A8}'}</span>
                  </Link>
                </div>

                {agent.isCustomized && (
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: CU.text, textAlign: 'center' as const }}>
                    {'\u2728'} Personnalise via Agent Studio
                  </div>
                )}

                <div style={{ marginTop: 8, textAlign: 'center' as const, fontSize: 11, color: CU.textMuted }}>
                  Inclus gratuitement
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Agents — can be activated */}
      {inactiveAgents.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={CU.sectionTitle}>Agents disponibles</div>
          <p style={{ fontSize: 13, color: CU.textMuted, marginBottom: 16, marginTop: 4 }}>
            Cliquez sur &quot;Activer&quot; pour ajouter un agent &agrave; votre &eacute;quipe.
          </p>
          <div style={cardGrid(isMobile, 2)}>
            {inactiveAgents.map(agent => (
              <div key={agent.id} style={{
                ...CU.card, opacity: 0.7,
              }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, background: CU.bgSecondary,
                    flexShrink: 0, filter: 'grayscale(0.3)',
                  }}>
                    <span style={{ fontSize: 26 }}>{agent.emoji}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: CU.textSecondary }}>{agent.role}</div>
                    <div style={{ fontSize: 13, marginTop: 4, fontStyle: 'italic', color: CU.textMuted }}>
                      {agent.tagline}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.5, color: CU.textMuted, marginBottom: 12 }}>
                  {agent.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 14 }}>
                  {agent.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} style={{ ...CU.badge, background: CU.bgSecondary, color: CU.textMuted }}>
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span style={{ fontSize: 11, color: CU.textMuted }}>+{agent.capabilities.length - 3}</span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleAgent(agent.id as AgentTypeId)}
                  style={{ ...CU.btnPrimary, width: '100%', background: agent.color }}
                >
                  Activer cet agent
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center' as const, borderRadius: 8, marginTop: 16, padding: '40px 20px', background: CU.bgSecondary, border: `1px solid ${CU.border}` }}>
        <div style={{ marginBottom: 12 }}><span style={{ fontSize: 36 }}>{'\u{1F4BC}'}</span></div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: CU.text }}>
          Votre &eacute;quipe IA travaille ensemble
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 20px', color: CU.textSecondary }}>
          Tous les agents collaborent, partagent le contexte, et s&apos;am&eacute;liorent avec chaque interaction.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
          <Link href="/client/chat" style={{ ...CU.btnPrimary, textDecoration: 'none' }}>Discuter avec mon &eacute;quipe</Link>
          <Link href="/client/meeting" style={{ ...CU.btnGhost, textDecoration: 'none' }}>Lancer une reunion</Link>
        </div>
      </div>

      </>}

      {/* ═══ Tab: Members ═══ */}
      {activeTab === 'members' && (
        <div>
          {/* Header */}
          <div style={{ ...toolbar(), flexWrap: 'wrap' as const, gap: 8 }}>
            <div style={{ ...CU.sectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{'\u{1F464}'}</span> Membres ({membersLocal.length})
            </div>
            <div style={{ flex: 1 }} />
            <input
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Rechercher..."
              style={searchInput(isMobile)}
            />
            <button
              onClick={() => setShowInviteModal(true)}
              style={{ ...CU.btnPrimary, marginLeft: 8, whiteSpace: 'nowrap' as const, minHeight: 44 }}
            >
              Inviter +
            </button>
          </div>

          {/* Stats */}
          <div style={cardGrid(isMobile ? true : false, 3)}>
            {[
              { emoji: '\u{1F465}', value: memberStats.total, label: 'Total membres' },
              { emoji: '\u{1F7E2}', value: memberStats.online, label: 'En ligne' },
              { emoji: '\u{1F6E1}\uFE0F', value: memberStats.admins, label: 'Admins' },
            ].map((stat, i) => (
              <div key={i} style={{ ...CU.card, textAlign: 'center' as const, padding: 16 }}>
                <span style={{ fontSize: 20 }}>{stat.emoji}</span>
                <div style={CU.statValue}>{stat.value}</div>
                <div style={CU.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Online members */}
          {onlineMembers.length > 0 && (
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 10 }}>
                {'\u{1F7E2}'} En ligne ({onlineMembers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {onlineMembers.map(member => renderMemberRow(member))}
              </div>
            </div>
          )}

          {/* Offline members */}
          {offlineMembers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 10 }}>
                {'\u26AA'} Hors ligne ({offlineMembers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                {offlineMembers.map(member => renderMemberRow(member))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredMembers.length === 0 && (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\u{1F464}'}</div>
              <div style={CU.emptyTitle}>Aucun membre trouv&eacute;</div>
              <div style={CU.emptyDesc}>{memberSearch ? 'Essayez un autre terme de recherche.' : 'Invitez des collaborateurs pour commencer.'}</div>
              <button style={CU.btnPrimary} onClick={() => setShowInviteModal(true)}>Inviter un membre</button>
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div style={CU.overlay} onClick={() => setShowInviteModal(false)}>
              <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 520, width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 16 }}>
                  <div style={CU.sectionTitle}>Inviter un membre</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@entreprise.com"
                    style={CU.input}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>R&ocirc;le</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                    style={{ ...CU.select, width: '100%' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Membre</option>
                    <option value="viewer">Lecteur</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setShowInviteModal(false)} style={CU.btnGhost}>Annuler</button>
                  <button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim()}
                    style={{ ...CU.btnPrimary, opacity: inviteEmail.trim() ? 1 : 0.5 }}
                  >Envoyer l&apos;invitation</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Groups ═══ */}
      {activeTab === 'groups' && (
        <div>
          {/* Header */}
          <div style={toolbar()}>
            <div style={{ ...CU.sectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{'\u{1F3D8}\uFE0F'}</span> Groupes ({groups.length})
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowCreateGroup(true)} style={CU.btnPrimary}>
              Nouveau +
            </button>
          </div>

          {/* Selected group detail view */}
          {selectedGroup && !editingGroup && (
            <div style={{
              ...CU.card, marginBottom: 20, padding: 16, background: CU.bgSecondary,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{selectedGroup.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ ...CU.sectionTitle }}>{selectedGroup.name}</div>
                  <div style={{ fontSize: 12, color: CU.textMuted }}>{selectedGroup.description}</div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: CU.textMuted }}
                >{'\u2715'}</button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: CU.textSecondary, marginBottom: 8 }}>
                Membres du groupe ({selectedGroup.members.length})
              </div>

              {/* Current group members */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, marginBottom: 12 }}>
                {selectedGroup.members.map(mId => {
                  const member = membersLocal.find(m => m.id === mId);
                  return (
                    <div key={mId} style={{
                      ...CU.card, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                    }}>
                      <span style={{ fontSize: 16 }}>{member?.emoji ?? '\u{1F464}'}</span>
                      <div style={{ flex: 1, fontSize: 13, color: CU.text }}>{member?.name ?? mId}</div>
                      <button
                        onClick={() => handleRemoveGroupMember(selectedGroup.id, mId)}
                        style={{ ...CU.btnSmall, background: '#DC262615', color: CU.danger, border: 'none' }}
                      >Retirer</button>
                    </div>
                  );
                })}
              </div>

              {/* Add members */}
              <div style={{ fontSize: 12, fontWeight: 600, color: CU.textMuted, marginBottom: 6 }}>
                Ajouter un membre
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {membersLocal.filter(m => !selectedGroup.members.includes(m.id)).map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleAddGroupMember(selectedGroup.id, m.id)}
                    style={CU.btnSmall}
                  >
                    <span>{m.emoji}</span> {m.name} <span style={{ color: CU.text }}>+</span>
                  </button>
                ))}
                {membersLocal.filter(m => !selectedGroup.members.includes(m.id)).length === 0 && (
                  <div style={{ fontSize: 12, color: CU.textMuted, fontStyle: 'italic' }}>Tous les membres sont dans ce groupe.</div>
                )}
              </div>
            </div>
          )}

          {/* Edit group modal */}
          {editingGroup && (
            <div style={CU.overlay} onClick={() => setEditingGroup(null)}>
              <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 520, width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 16 }}>
                  <div style={CU.sectionTitle}>Modifier le groupe</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Nom</label>
                  <input
                    value={editingGroup.name}
                    onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    style={CU.input}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' as const }}>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : 80 }}>
                    <label style={CU.label}>Emoji</label>
                    <input
                      value={editingGroup.emoji}
                      onChange={e => setEditingGroup({ ...editingGroup, emoji: e.target.value })}
                      style={CU.input}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : 120 }}>
                    <label style={CU.label}>Couleur</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                      {GROUP_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditingGroup({ ...editingGroup, color: c })}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: editingGroup.color === c ? `2px solid ${CU.text}` : '2px solid transparent',
                            background: c, cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Description</label>
                  <input
                    value={editingGroup.description}
                    onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })}
                    style={CU.input}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setEditingGroup(null)} style={CU.btnGhost}>Annuler</button>
                  <button onClick={handleUpdateGroup} style={CU.btnPrimary}>Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {/* Groups grid */}
          {groups.length > 0 ? (
            <div style={cardGrid(isMobile, 2)}>
              {groups.map(group => (
                <div key={group.id} style={CU.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 20, width: 36, height: 36, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: group.color + '22',
                    }}>{group.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{group.name}</div>
                      <div style={{ fontSize: 11, color: CU.textMuted }}>{group.members.length} membre{group.members.length > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 10 }}>{group.description}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    <button
                      onClick={() => { setSelectedGroup(group); setEditingGroup(null); }}
                      style={{ ...CU.btnSmall, background: group.color, color: '#fff', border: 'none' }}
                    >Voir</button>
                    <button
                      onClick={() => setEditingGroup(group)}
                      style={CU.btnSmall}
                    >Modifier</button>
                    {confirmDeleteGroupId === group.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          style={{ ...CU.btnSmall, background: '#DC262622', color: CU.danger, border: 'none', fontWeight: 600 }}
                        >Confirmer</button>
                        <button
                          onClick={() => setConfirmDeleteGroupId(null)}
                          style={{ ...CU.btnSmall, background: CU.bgSecondary, color: CU.textMuted }}
                        >Annuler</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteGroupId(group.id)}
                        style={{ ...CU.btnSmall, background: '#DC262615', color: CU.danger, border: 'none' }}
                      >Supprimer</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\u{1F3D8}\uFE0F'}</div>
              <div style={CU.emptyTitle}>Aucun groupe</div>
              <div style={CU.emptyDesc}>Cr&eacute;ez des groupes pour organiser vos collaborateurs par projet ou d&eacute;partement.</div>
              <button style={CU.btnPrimary} onClick={() => setShowCreateGroup(true)}>Cr&eacute;er un groupe</button>
            </div>
          )}

          {/* Create group modal */}
          {showCreateGroup && (
            <div style={CU.overlay} onClick={() => setShowCreateGroup(false)}>
              <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 520, width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 16 }}>
                  <div style={CU.sectionTitle}>Nouveau groupe</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Nom du groupe</label>
                  <input
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="ex: Marketing, Developpement..."
                    style={CU.input}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={CU.label}>Emoji</label>
                    <input
                      value={newGroupEmoji}
                      onChange={e => setNewGroupEmoji(e.target.value)}
                      style={CU.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={CU.label}>Couleur</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                      {GROUP_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewGroupColor(c)}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: newGroupColor === c ? `2px solid ${CU.text}` : '2px solid transparent',
                            background: c, cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Description</label>
                  <input
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    placeholder="Description courte du groupe"
                    style={CU.input}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setShowCreateGroup(false)} style={CU.btnGhost}>Annuler</button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    style={{ ...CU.btnPrimary, opacity: newGroupName.trim() ? 1 : 0.5 }}
                  >Cr&eacute;er le groupe</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Communities ═══ */}
      {activeTab === 'communities' && (
        <div>
          {/* Header */}
          <div style={{ ...toolbar(), flexWrap: 'wrap' as const, gap: 8 }}>
            <div style={{ ...CU.sectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{'\u{1F310}'}</span> Communaut&eacute;s
            </div>
            <div style={{ flex: 1 }} />
            <input
              value={communitySearch}
              onChange={e => setCommunitySearch(e.target.value)}
              placeholder="Rechercher..."
              style={searchInput(isMobile)}
            />
            <button
              onClick={() => setShowCreateCommunity(true)}
              style={{ ...CU.btnPrimary, marginLeft: 8, whiteSpace: 'nowrap' as const, minHeight: 44 }}
            >
              Cr&eacute;er +
            </button>
          </div>

          {/* Joined communities */}
          {joinedCommunities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 10 }}>
                Mes communaut&eacute;s ({joinedCommunities.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {joinedCommunities.map(community => (
                  <div key={community.id} style={CU.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 20, width: 36, height: 36, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: community.color + '22',
                      }}>{community.emoji}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{community.name}</div>
                        <div style={{ fontSize: 11, color: CU.textMuted }}>{community.memberCount} membres</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 8 }}>{community.description}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                      {community.tags.map(tag => <span key={tag} style={CU.badge}>#{tag}</span>)}
                    </div>
                    <button
                      onClick={() => handleLeaveCommunity(community.id)}
                      style={CU.btnGhost}
                    >Quitter</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discover communities */}
          {discoverCommunities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 10 }}>
                D&eacute;couvrir ({discoverCommunities.length})
              </div>
              <div style={cardGrid(isMobile, 2)}>
                {discoverCommunities.map(community => (
                  <div key={community.id} style={CU.cardHoverable}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 20, width: 36, height: 36, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: community.color + '22',
                      }}>{community.emoji}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{community.name}</div>
                        <div style={{ fontSize: 11, color: CU.textMuted }}>{community.memberCount} membres</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 8 }}>{community.description}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                      {community.tags.map(tag => <span key={tag} style={CU.badge}>#{tag}</span>)}
                    </div>
                    <button
                      onClick={() => handleJoinCommunity(community.id)}
                      style={CU.btnPrimary}
                    >Rejoindre</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredCommunities.length === 0 && (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\u{1F310}'}</div>
              <div style={CU.emptyTitle}>Aucune communaut&eacute; trouv&eacute;e</div>
              <div style={CU.emptyDesc}>{communitySearch ? 'Essayez un autre terme de recherche.' : 'Cr\u00e9ez ou rejoignez une communaut\u00e9.'}</div>
              <button style={CU.btnPrimary} onClick={() => setShowCreateCommunity(true)}>Cr&eacute;er une communaut&eacute;</button>
            </div>
          )}

          {/* Create community modal */}
          {showCreateCommunity && (
            <div style={CU.overlay} onClick={() => setShowCreateCommunity(false)}>
              <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 520, width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: 16 }}>
                  <div style={CU.sectionTitle}>Nouvelle communaut&eacute;</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Nom</label>
                  <input
                    value={newCommunityName}
                    onChange={e => setNewCommunityName(e.target.value)}
                    placeholder="ex: Developpeurs React, Marketing B2B..."
                    style={CU.input}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={CU.label}>Emoji</label>
                    <input
                      value={newCommunityEmoji}
                      onChange={e => setNewCommunityEmoji(e.target.value)}
                      style={{ ...CU.input, width: 60, textAlign: 'center' as const }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: CU.text, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newCommunityPublic}
                        onChange={e => setNewCommunityPublic(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: CU.accent }}
                      />
                      Communaut&eacute; publique
                    </label>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Description</label>
                  <input
                    value={newCommunityDesc}
                    onChange={e => setNewCommunityDesc(e.target.value)}
                    placeholder="Decrivez votre communaute..."
                    style={CU.input}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>Tags (s&eacute;par&eacute;s par des virgules)</label>
                  <input
                    value={newCommunityTags}
                    onChange={e => setNewCommunityTags(e.target.value)}
                    placeholder="ex: tech, startup, marketing"
                    style={CU.input}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={CU.label}>R&egrave;gles de la communaut&eacute;</label>
                  <textarea
                    value={newCommunityRules}
                    onChange={e => setNewCommunityRules(e.target.value)}
                    placeholder="Decrivez les regles de votre communaute..."
                    rows={3}
                    style={CU.textarea}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                  <button onClick={() => setShowCreateCommunity(false)} style={CU.btnGhost}>Annuler</button>
                  <button
                    onClick={handleCreateCommunity}
                    disabled={!newCommunityName.trim()}
                    style={{ ...CU.btnPrimary, opacity: newCommunityName.trim() ? 1 : 0.5 }}
                  >Cr&eacute;er la communaut&eacute;</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Activity ═══ */}
      {activeTab === 'activity' && (
        <div>
          {wsActivity.length === 0 ? (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\u{1F4CB}'}</div>
              <div style={CU.emptyTitle}>Aucune activit&eacute; pour le moment</div>
              <div style={CU.emptyDesc}>
                {workspaces.length === 0
                  ? 'Cr\u00e9ez un espace collaboratif pour voir l\u2019activit\u00e9 de votre \u00e9quipe.'
                  : ''}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
              {wsActivity.map(entry => (
                <div key={entry.id} style={{ ...CU.card, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: CU.bgSecondary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: CU.text,
                  }}>
                    {(entry.userName ?? '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: CU.text }}>
                      <strong>{entry.userName ?? 'Utilisateur'}</strong>{' '}
                      {entry.action.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 11, color: CU.textSecondary }}>
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
    </AuthRequired>
  );
}
