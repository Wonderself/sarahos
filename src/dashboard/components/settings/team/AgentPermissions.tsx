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
} as const;

// ─── Types ────────────────────────────────────────────────────
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

interface CustomInstructions {
  [agentId: string]: string;
}

interface AgentPermissionsProps {
  agents: AgentInfo[];
  roles: string[];
  permissions: PermissionMatrix;
  onToggle: (agentId: string, role: string, value: boolean) => void;
  customInstructions?: CustomInstructions;
  onInstructionChange?: (agentId: string, instruction: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Lecteur',
  member: 'Membre',
  admin: 'Admin',
  owner: 'Proprietaire',
};

// ─── Styles ───────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: C.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  searchInput: {
    height: 34,
    width: 220,
    padding: '0 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 13,
    color: C.text,
    background: C.bg,
    outline: 'none',
    boxSizing: 'border-box',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'center',
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${C.border}`,
    background: C.bgSecondary,
    whiteSpace: 'nowrap',
  },
  thAgent: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${C.border}`,
    background: C.bgSecondary,
    minWidth: 180,
  },
  td: {
    padding: '10px 16px',
    borderBottom: `1px solid ${C.border}`,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  tdAgent: {
    padding: '10px 12px',
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
  },
  agentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  agentEmoji: {
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0,
  },
  agentName: {
    fontSize: 13,
    fontWeight: 500,
    color: C.text,
    whiteSpace: 'nowrap',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: `1px solid ${C.border}`,
    background: C.bg,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s, border-color 0.15s',
  },
  checkboxChecked: {
    background: C.accent,
    borderColor: C.accent,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  },
  expandBtn: {
    width: 24,
    height: 24,
    border: 'none',
    background: 'transparent',
    color: C.muted,
    cursor: 'pointer',
    fontSize: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    flexShrink: 0,
  },
  instructionRow: {
    background: C.bgSecondary,
  },
  instructionCell: {
    padding: '8px 12px 12px',
    borderBottom: `1px solid ${C.border}`,
  },
  instructionLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: C.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  textarea: {
    width: '100%',
    padding: 10,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: C.text,
    background: C.bg,
    outline: 'none',
    resize: 'vertical',
    minHeight: 60,
    lineHeight: 1.5,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: C.muted,
    fontSize: 13,
  },
  bulkActions: {
    display: 'flex',
    gap: 8,
    fontSize: 12,
  },
  bulkBtn: {
    height: 26,
    padding: '0 10px',
    border: `1px solid ${C.border}`,
    borderRadius: 5,
    background: C.bg,
    color: C.secondary,
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

// ─── Component ────────────────────────────────────────────────
export default function AgentPermissions({
  agents,
  roles,
  permissions,
  onToggle,
  customInstructions = {},
  onInstructionChange,
}: AgentPermissionsProps) {
  const [search, setSearch] = useState('');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const filteredAgents = agents.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkToggle = (role: string, value: boolean) => {
    for (const agent of filteredAgents) {
      onToggle(agent.id, role, value);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Permissions des agents</h3>
          <div style={styles.subtitle}>
            Definissez quels roles peuvent utiliser chaque agent
          </div>
        </div>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Rechercher un outil..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filteredAgents.length === 0 ? (
        <div style={styles.emptyState}>Aucun agent trouve.</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thAgent}>Agent</th>
                {roles.map(role => (
                  <th key={role} style={styles.th}>
                    <div>{ROLE_LABELS[role] ?? role}</div>
                    <div style={styles.bulkActions}>
                      <button
                        style={styles.bulkBtn}
                        onClick={() => handleBulkToggle(role, true)}
                        title="Tout activer"
                      >
                        Tout
                      </button>
                      <button
                        style={styles.bulkBtn}
                        onClick={() => handleBulkToggle(role, false)}
                        title="Tout desactiver"
                      >
                        Aucun
                      </button>
                    </div>
                  </th>
                ))}
                <th style={{ ...styles.th, width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map(agent => {
                const isExpanded = expandedAgent === agent.id;
                const agentPerms = permissions[agent.id] ?? {};

                return (
                  <tr key={agent.id} style={undefined}>
                    <td style={styles.tdAgent}>
                      <div style={styles.agentCell}>
                        <span style={styles.agentEmoji}>{agent.emoji}</span>
                        <span style={styles.agentName}>{agent.name}</span>
                      </div>
                    </td>
                    {roles.map(role => {
                      const checked = agentPerms[role] ?? false;
                      return (
                        <td key={role} style={styles.td}>
                          <div
                            style={{
                              ...styles.checkbox,
                              ...(checked ? styles.checkboxChecked : {}),
                            }}
                            onClick={() => onToggle(agent.id, role, !checked)}
                          >
                            {checked && (
                              <span style={styles.checkmark}>&#10003;</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td style={styles.td}>
                      <button
                        style={styles.expandBtn}
                        onClick={() =>
                          setExpandedAgent(isExpanded ? null : agent.id)
                        }
                        title="Instructions personnalisees"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </td>
                    {isExpanded && (
                      <td
                        colSpan={roles.length + 2}
                        style={styles.instructionCell}
                      >
                        {/* Rendered as a separate row below via CSS trick */}
                      </td>
                    )}
                  </tr>
                );
              })}
              {/* Instruction expansion rows */}
              {filteredAgents.map(agent => {
                if (expandedAgent !== agent.id) return null;
                return (
                  <tr key={`${agent.id}-instructions`} style={styles.instructionRow}>
                    <td
                      colSpan={roles.length + 2}
                      style={styles.instructionCell}
                    >
                      <div style={styles.instructionLabel}>
                        Instructions personnalisees pour {agent.name}
                      </div>
                      <textarea
                        style={styles.textarea}
                        value={customInstructions[agent.id] ?? ''}
                        onChange={e =>
                          onInstructionChange?.(agent.id, e.target.value)
                        }
                        placeholder={`Ajoutez des instructions specifiques pour ${agent.name}...`}
                        rows={3}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
