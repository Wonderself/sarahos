'use client';

import { useState, type CSSProperties } from 'react';

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
} as const;

// ─── Types ────────────────────────────────────────────────────
interface Member {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'member' | 'admin' | 'owner';
  usage30d: number;
  lastActive: string;
}

interface MembersListProps {
  members: Member[];
  currentUserRole: 'viewer' | 'member' | 'admin' | 'owner';
  onRemove: (memberId: string) => void;
  onRoleChange: (memberId: string, newRole: Member['role']) => void;
}

// ─── Role Helpers ─────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Admin',
  member: 'Membre',
  viewer: 'Lecteur',
};

const ROLE_COLORS: Record<string, string> = {
  owner: '#7C3AED',
  admin: '#0EA5E9',
  member: '#38A169',
  viewer: '#9B9B9B',
};

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

function canManage(currentRole: string, targetRole: string): boolean {
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole];
}

function formatLastActive(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'En ligne';
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD}j`;
  return d.toLocaleDateString('fr-FR');
}

// ─── Styles ───────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${C.border}`,
    background: C.bgSecondary,
  },
  td: {
    padding: '12px',
    borderBottom: `1px solid ${C.border}`,
    color: C.text,
    verticalAlign: 'middle',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: C.accent,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  nameText: {
    fontWeight: 500,
    color: C.text,
    lineHeight: 1.3,
  },
  emailText: {
    fontSize: 12,
    color: C.muted,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
  },
  select: {
    height: 28,
    padding: '0 8px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: C.text,
    background: C.bg,
    cursor: 'pointer',
    outline: 'none',
  },
  removeBtn: {
    height: 28,
    padding: '0 10px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: C.danger,
    background: C.bg,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  usageBar: {
    width: 60,
    height: 4,
    background: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'inline-block',
    marginRight: 6,
    verticalAlign: 'middle',
  },
  actions: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  emptyRow: {
    textAlign: 'center',
    padding: '40px 12px',
    color: C.muted,
    fontSize: 13,
  },
};

// ─── Component ────────────────────────────────────────────────
export default function MembersList({
  members,
  currentUserRole,
  onRemove,
  onRoleChange,
}: MembersListProps) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const maxUsage = Math.max(...members.map(m => m.usage30d), 1);

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Membre</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Usage 30j</th>
            <th style={styles.th}>Derniere activite</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 && (
            <tr>
              <td colSpan={5} style={styles.emptyRow}>
                Aucun membre dans l&apos;organisation.
              </td>
            </tr>
          )}
          {members.map(member => {
            const initials = member.name
              .split(' ')
              .map(w => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const canEdit = canManage(currentUserRole, member.role);
            const usagePercent = Math.round((member.usage30d / maxUsage) * 100);

            return (
              <tr key={member.id}>
                <td style={styles.td}>
                  <div style={styles.nameCell}>
                    <div style={styles.avatar}>{initials}</div>
                    <div>
                      <div style={styles.nameText}>{member.name}</div>
                      <div style={styles.emailText}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  {canEdit ? (
                    <select
                      style={styles.select}
                      value={member.role}
                      onChange={e => onRoleChange(member.id, e.target.value as Member['role'])}
                    >
                      <option value="viewer">Lecteur</option>
                      <option value="member">Membre</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        ...styles.roleBadge,
                        background: `${ROLE_COLORS[member.role]}15`,
                        color: ROLE_COLORS[member.role],
                      }}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={styles.usageBar}>
                      <div
                        style={{
                          width: `${usagePercent}%`,
                          height: '100%',
                          background: C.accent,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: C.secondary }}>
                      {member.usage30d} cr
                    </span>
                  </div>
                </td>
                <td style={{ ...styles.td, fontSize: 12, color: C.secondary }}>
                  {formatLastActive(member.lastActive)}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {canEdit && member.role !== 'owner' && (
                      <>
                        {confirmRemove === member.id ? (
                          <>
                            <button
                              style={{ ...styles.removeBtn, color: '#fff', background: C.danger, border: 'none' }}
                              onClick={() => {
                                onRemove(member.id);
                                setConfirmRemove(null);
                              }}
                            >
                              Confirmer
                            </button>
                            <button
                              style={styles.removeBtn}
                              onClick={() => setConfirmRemove(null)}
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            style={styles.removeBtn}
                            onClick={() => setConfirmRemove(member.id)}
                          >
                            Retirer
                          </button>
                        )}
                      </>
                    )}
                    {!canEdit && (
                      <span style={{ fontSize: 12, color: C.muted }}>—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
