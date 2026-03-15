'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import MembersList from '../../../components/settings/team/MembersList';
import InviteModal from '../../../components/settings/team/InviteModal';
import CreditPoolManager from '../../../components/settings/team/CreditPoolManager';
import ApprovalWorkflows from '../../../components/settings/team/ApprovalWorkflows';
import AgentPermissions from '../../../components/settings/team/AgentPermissions';

// ─── Notion Palette ───────────────────────────────────────────
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  accent: '#0EA5E9',
  danger: '#DC2626',
  success: '#38A169',
} as const;

// ─── Types ────────────────────────────────────────────────────
type UserRole = 'viewer' | 'member' | 'admin' | 'owner';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'member' | 'admin' | 'owner';
  usage30d: number;
  lastActive: string;
}

interface OrgInfo {
  id: string;
  name: string;
  plan: string;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
}

interface CreditPool {
  total: number;
  used: number;
  remaining: number;
}

interface UsageByMember {
  id: string;
  name: string;
  usage: number;
}

interface Workflow {
  id: string;
  action_type: string;
  required_role: string;
  auto_approve_member: boolean;
  auto_approve_admin: boolean;
  auto_approve_owner: boolean;
  enabled: boolean;
}

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
}

interface PermissionMatrix {
  [agentId: string]: {
    [role: string]: boolean;
  };
}

interface TeamData {
  org: OrgInfo;
  members: Member[];
  pool: CreditPool;
  usageByMember: UsageByMember[];
  workflows: Workflow[];
  agents: AgentInfo[];
  permissions: PermissionMatrix;
  userRole: UserRole;
}

// ─── Auth Helper ──────────────────────────────────────────────
function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? '';
  } catch {
    return '';
  }
}

// ─── Demo Data ────────────────────────────────────────────────
const DEMO_DATA: TeamData = {
  org: {
    id: 'org_demo',
    name: 'Mon Organisation',
    plan: 'Pro',
    memberCount: 4,
    maxMembers: 10,
    createdAt: '2026-01-15T10:00:00Z',
  },
  members: [
    { id: 'u1', name: 'Jean Dupont', email: 'jean@example.com', role: 'owner', usage30d: 245, lastActive: new Date(Date.now() - 300000).toISOString() },
    { id: 'u2', name: 'Marie Martin', email: 'marie@example.com', role: 'admin', usage30d: 180, lastActive: new Date(Date.now() - 3600000).toISOString() },
    { id: 'u3', name: 'Pierre Durand', email: 'pierre@example.com', role: 'member', usage30d: 92, lastActive: new Date(Date.now() - 86400000).toISOString() },
    { id: 'u4', name: 'Sophie Leroy', email: 'sophie@example.com', role: 'viewer', usage30d: 15, lastActive: new Date(Date.now() - 172800000).toISOString() },
  ],
  pool: { total: 5000, used: 1532, remaining: 3468 },
  usageByMember: [
    { id: 'u1', name: 'Jean Dupont', usage: 245 },
    { id: 'u2', name: 'Marie Martin', usage: 180 },
    { id: 'u3', name: 'Pierre Durand', usage: 92 },
    { id: 'u4', name: 'Sophie Leroy', usage: 15 },
  ],
  workflows: [
    {
      id: 'wf_1',
      action_type: 'credit_spend',
      required_role: 'admin',
      auto_approve_member: false,
      auto_approve_admin: true,
      auto_approve_owner: true,
      enabled: true,
    },
    {
      id: 'wf_2',
      action_type: 'data_export',
      required_role: 'admin',
      auto_approve_member: false,
      auto_approve_admin: false,
      auto_approve_owner: true,
      enabled: true,
    },
  ],
  agents: [
    { id: 'fz-repondeur', name: 'Repondeur', emoji: '📞' },
    { id: 'fz-assistante', name: 'Assistante', emoji: '💼' },
    { id: 'fz-commercial', name: 'Commercial', emoji: '🤝' },
    { id: 'fz-marketing', name: 'Marketing', emoji: '📢' },
    { id: 'fz-rh', name: 'RH', emoji: '👥' },
    { id: 'fz-communication', name: 'Communication', emoji: '📣' },
    { id: 'fz-finance', name: 'Finance', emoji: '💰' },
    { id: 'fz-dev', name: 'Developpeur', emoji: '💻' },
    { id: 'fz-juridique', name: 'Juridique', emoji: '⚖️' },
    { id: 'fz-dg', name: 'Direction Generale', emoji: '🏛️' },
  ],
  permissions: {
    'fz-repondeur': { viewer: true, member: true, admin: true, owner: true },
    'fz-assistante': { viewer: false, member: true, admin: true, owner: true },
    'fz-commercial': { viewer: false, member: true, admin: true, owner: true },
    'fz-marketing': { viewer: false, member: true, admin: true, owner: true },
    'fz-rh': { viewer: false, member: false, admin: true, owner: true },
    'fz-communication': { viewer: false, member: true, admin: true, owner: true },
    'fz-finance': { viewer: false, member: false, admin: true, owner: true },
    'fz-dev': { viewer: false, member: false, admin: true, owner: true },
    'fz-juridique': { viewer: false, member: false, admin: true, owner: true },
    'fz-dg': { viewer: false, member: false, admin: false, owner: true },
  },
  userRole: 'owner',
};

// ─── Styles ───────────────────────────────────────────────────
const S: Record<string, CSSProperties> = {
  page: {
    padding: 28,
    maxWidth: 1000,
    margin: '0 auto',
    minHeight: '100vh',
    background: C.bg,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  emoji: { fontSize: 24, lineHeight: 1 },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    margin: '0 0 20px 0',
  },
  orgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    background: C.bgSecondary,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  orgInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: C.accent,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
  },
  orgName: {
    fontSize: 16,
    fontWeight: 600,
    color: C.text,
  },
  orgMeta: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  orgStats: {
    display: 'flex',
    gap: 20,
  },
  orgStat: {
    textAlign: 'center',
  },
  orgStatValue: {
    fontSize: 18,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1,
  },
  orgStatLabel: {
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: C.text,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    background: C.border,
    margin: '24px 0',
  },
  inviteBtn: {
    height: 34,
    padding: '0 16px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'opacity 0.15s',
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
  },
  ctaEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: 14,
    color: C.muted,
    maxWidth: 400,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  ctaActions: {
    display: 'flex',
    gap: 12,
  },
  ctaBtnPrimary: {
    height: 40,
    padding: '0 24px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ctaBtnGhost: {
    height: 40,
    padding: '0 24px',
    background: C.bg,
    color: C.secondary,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    color: C.muted,
    fontSize: 14,
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    padding: 16,
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    textAlign: 'center',
  },
  overviewValue: {
    fontSize: 26,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1,
  },
  overviewLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
    borderBottom: `1px solid ${C.border}`,
    fontSize: 13,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  activityText: {
    flex: 1,
    color: C.text,
  },
  activityTime: {
    fontSize: 11,
    color: C.muted,
    flexShrink: 0,
  },
  roleTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
    background: `${C.accent}15`,
    color: C.accent,
    marginLeft: 8,
  },
};

// ─── Component ────────────────────────────────────────────────
export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOrg, setHasOrg] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({});

  // ── Fetch team data ───────────────────────────────────────
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/settings/team', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const teamData: TeamData = await res.json();
          setData(teamData);
          setHasOrg(true);
        } else if (res.status === 404) {
          setHasOrg(false);
        } else {
          // Fallback to demo data
          setData(DEMO_DATA);
        }
      } catch {
        setData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  // ── Handlers ──────────────────────────────────────────────
  const handleRemoveMember = useCallback((memberId: string) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId),
        org: { ...prev.org, memberCount: prev.org.memberCount - 1 },
      };
    });
  }, []);

  const handleRoleChange = useCallback((memberId: string, newRole: Member['role']) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map(m =>
          m.id === memberId ? { ...m, role: newRole } : m
        ),
      };
    });
  }, []);

  const handleInvite = useCallback((email: string, role: string) => {
    const newMember: Member = {
      id: `u_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role as Member['role'],
      usage30d: 0,
      lastActive: new Date().toISOString(),
    };
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: [...prev.members, newMember],
        org: { ...prev.org, memberCount: prev.org.memberCount + 1 },
      };
    });
  }, []);

  const handleSaveWorkflows = useCallback((workflows: Workflow[]) => {
    setData(prev => {
      if (!prev) return prev;
      return { ...prev, workflows };
    });
  }, []);

  const handleTogglePermission = useCallback((agentId: string, role: string, value: boolean) => {
    setData(prev => {
      if (!prev) return prev;
      const perms = { ...prev.permissions };
      if (!perms[agentId]) perms[agentId] = {};
      perms[agentId] = { ...perms[agentId], [role]: value };
      return { ...prev, permissions: perms };
    });
  }, []);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.loadingContainer}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div>Chargement de l&apos;equipe...</div>
        </div>
      </div>
    );
  }

  // ── No Org CTA ────────────────────────────────────────────
  if (!hasOrg || !data) {
    return (
      <div style={S.page}>
        <div style={S.ctaContainer}>
          <div style={S.ctaEmoji}>🏢</div>
          <div style={S.ctaTitle}>Travaillez en equipe</div>
          <div style={S.ctaDesc}>
            Creez une organisation pour collaborer avec votre equipe.
            Partagez les agents, les credits et les projets.
          </div>
          <div style={S.ctaActions}>
            <button style={S.ctaBtnPrimary}>
              Creer une organisation
            </button>
            <button style={S.ctaBtnGhost}>
              Rejoindre une organisation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = data.userRole === 'admin' || data.userRole === 'owner';

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.headerRow}>
        <span style={S.emoji}>👥</span>
        <h1 style={S.title}>Mon Equipe</h1>
        <span style={S.roleTag}>{data.userRole}</span>
      </div>
      <p style={S.subtitle}>Gerez votre organisation et vos collaborateurs</p>

      {/* Org Header */}
      <div style={S.orgHeader}>
        <div style={S.orgInfo}>
          <div style={S.orgAvatar}>
            {data.org.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={S.orgName}>{data.org.name}</div>
            <div style={S.orgMeta}>
              Plan {data.org.plan} — Cree le {new Date(data.org.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
        <div style={S.orgStats}>
          <div style={S.orgStat}>
            <div style={S.orgStatValue}>{data.org.memberCount}</div>
            <div style={S.orgStatLabel}>Membres</div>
          </div>
          <div style={S.orgStat}>
            <div style={S.orgStatValue}>{data.pool.remaining}</div>
            <div style={S.orgStatLabel}>Credits</div>
          </div>
        </div>
      </div>

      {/* Overview Section (All Roles) */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>
          <span>📊</span> Vue d&apos;ensemble
        </h2>
        <div style={S.overviewGrid}>
          <div style={S.overviewCard}>
            <div style={S.overviewValue}>{data.org.memberCount}</div>
            <div style={S.overviewLabel}>Membres actifs</div>
          </div>
          <div style={S.overviewCard}>
            <div style={{ ...S.overviewValue, color: C.accent }}>
              {data.pool.used}
            </div>
            <div style={S.overviewLabel}>Credits utilises (30j)</div>
          </div>
          <div style={S.overviewCard}>
            <div style={{ ...S.overviewValue, color: C.success }}>
              {data.agents.length}
            </div>
            <div style={S.overviewLabel}>Agents disponibles</div>
          </div>
          <div style={S.overviewCard}>
            <div style={S.overviewValue}>{data.workflows.filter(w => w.enabled).length}</div>
            <div style={S.overviewLabel}>Workflows actifs</div>
          </div>
        </div>

        {/* Activity (visible to all) */}
        <div style={{ ...S.sectionTitle, fontSize: 14, marginBottom: 10 }}>Activite recente</div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 16px' }}>
          {data.members.slice(0, 4).map(member => (
            <div key={member.id} style={S.activityItem}>
              <div style={{ ...S.activityDot, background: member.role === 'owner' ? '#7C3AED' : C.accent }} />
              <div style={S.activityText}>
                <strong>{member.name}</strong> — {member.usage30d} credits utilises ce mois
              </div>
              <div style={S.activityTime}>
                {member.lastActive ? new Date(member.lastActive).toLocaleDateString('fr-FR') : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members Section (Admin+) */}
      {isAdmin && (
        <>
          <div style={S.divider} />
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <h2 style={S.sectionTitle}>
                <span>👤</span> Membres
              </h2>
              <button style={S.inviteBtn} onClick={() => setInviteOpen(true)}>
                + Inviter
              </button>
            </div>
            <MembersList
              members={data.members}
              currentUserRole={data.userRole}
              onRemove={handleRemoveMember}
              onRoleChange={handleRoleChange}
            />
          </div>
        </>
      )}

      {/* Credit Usage (Admin+) */}
      {isAdmin && (
        <>
          <div style={S.divider} />
          <div style={S.section}>
            <h2 style={S.sectionTitle}>
              <span>💳</span> Credits
            </h2>
            <div style={{ marginTop: 12 }}>
              <CreditPoolManager
                pool={data.pool}
                usageByMember={data.usageByMember}
                userRole={data.userRole}
                onRecharge={() => {
                  // Will connect to billing
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Approvals (Admin+) */}
      {isAdmin && (
        <>
          <div style={S.divider} />
          <div style={S.section}>
            <h2 style={S.sectionTitle}>
              <span>✅</span> Approbations
            </h2>
            <div style={{ marginTop: 12 }}>
              <ApprovalWorkflows
                workflows={data.workflows}
                userRole={data.userRole}
                onSave={handleSaveWorkflows}
              />
            </div>
          </div>
        </>
      )}

      {/* Agent Config (Admin+) */}
      {isAdmin && (
        <>
          <div style={S.divider} />
          <div style={S.section}>
            <h2 style={S.sectionTitle}>
              <span>🤖</span> Configuration des agents
            </h2>
            <div style={{ marginTop: 12 }}>
              <AgentPermissions
                agents={data.agents}
                roles={['viewer', 'member', 'admin', 'owner']}
                permissions={data.permissions}
                onToggle={handleTogglePermission}
                customInstructions={customInstructions}
                onInstructionChange={(agentId, instruction) => {
                  setCustomInstructions(prev => ({ ...prev, [agentId]: instruction }));
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Invite Modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
