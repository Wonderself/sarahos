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
  success: '#38A169',
} as const;

// ─── Types ────────────────────────────────────────────────────
interface Workflow {
  id: string;
  action_type: string;
  required_role: string;
  auto_approve_member: boolean;
  auto_approve_admin: boolean;
  auto_approve_owner: boolean;
  enabled: boolean;
}

interface ApprovalWorkflowsProps {
  workflows: Workflow[];
  userRole: 'viewer' | 'member' | 'admin' | 'owner';
  onSave: (workflows: Workflow[]) => void;
}

const ACTION_TYPES: { value: string; label: string }[] = [
  { value: 'agent_execution', label: 'Execution d\'agent' },
  { value: 'credit_spend', label: 'Depense de credits' },
  { value: 'document_creation', label: 'Creation de document' },
  { value: 'campaign_launch', label: 'Lancement de campagne' },
  { value: 'external_api_call', label: 'Appel API externe' },
  { value: 'data_export', label: 'Export de donnees' },
  { value: 'member_invite', label: 'Invitation de membre' },
  { value: 'settings_change', label: 'Modification des parametres' },
];

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'member', label: 'Membre' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Proprietaire' },
];

function generateId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Styles ───────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: C.text,
    margin: 0,
  },
  addBtn: {
    height: 32,
    padding: '0 14px',
    background: C.bg,
    color: C.accent,
    border: `1px solid ${C.accent}`,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  workflowCard: {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 16,
  },
  workflowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workflowIndex: {
    fontSize: 11,
    fontWeight: 600,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  workflowActions: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  toggleBtn: {
    width: 36,
    height: 20,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    padding: 0,
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    transition: 'left 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    background: C.bg,
    color: C.danger,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  fieldRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  fieldGroup: {
    flex: 1,
    minWidth: 160,
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: C.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  select: {
    width: '100%',
    height: 34,
    padding: '0 10px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 13,
    color: C.text,
    background: C.bg,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  checkboxRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: C.secondary,
    cursor: 'pointer',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: `1px solid ${C.border}`,
    background: C.bg,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    background: C.accent,
    borderColor: C.accent,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
  },
  saveBtn: {
    height: 36,
    padding: '0 20px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: C.muted,
    fontSize: 13,
    border: `1px dashed ${C.border}`,
    borderRadius: 8,
  },
  disabledOverlay: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
};

// ─── Component ────────────────────────────────────────────────
export default function ApprovalWorkflows({
  workflows: initialWorkflows,
  userRole,
  onSave,
}: ApprovalWorkflowsProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [dirty, setDirty] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'owner';

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev =>
      prev.map(wf => (wf.id === id ? { ...wf, ...updates } : wf))
    );
    setDirty(true);
  };

  const addWorkflow = () => {
    const newWf: Workflow = {
      id: generateId(),
      action_type: 'agent_execution',
      required_role: 'admin',
      auto_approve_member: false,
      auto_approve_admin: false,
      auto_approve_owner: true,
      enabled: true,
    };
    setWorkflows(prev => [...prev, newWf]);
    setDirty(true);
  };

  const removeWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== id));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(workflows);
    setDirty(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Workflows d&apos;approbation</h3>
        {canEdit && (
          <button style={styles.addBtn} onClick={addWorkflow}>
            + Ajouter
          </button>
        )}
      </div>

      {workflows.length === 0 ? (
        <div style={styles.emptyState}>
          Aucun workflow configure. Les actions seront executees sans approbation.
        </div>
      ) : (
        workflows.map((wf, idx) => (
          <div
            key={wf.id}
            style={{
              ...styles.workflowCard,
              ...(!wf.enabled ? { opacity: 0.6 } : {}),
            }}
          >
            <div style={styles.workflowHeader}>
              <span style={styles.workflowIndex}>Workflow #{idx + 1}</span>
              {canEdit && (
                <div style={styles.workflowActions}>
                  <button
                    style={{
                      ...styles.toggleBtn,
                      background: wf.enabled ? C.success : C.border,
                    }}
                    onClick={() => updateWorkflow(wf.id, { enabled: !wf.enabled })}
                    title={wf.enabled ? 'Desactiver' : 'Activer'}
                  >
                    <div
                      style={{
                        ...styles.toggleDot,
                        left: wf.enabled ? 18 : 2,
                      }}
                    />
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => removeWorkflow(wf.id)}
                    title="Supprimer"
                  >
                    x
                  </button>
                </div>
              )}
            </div>

            <div style={canEdit ? {} : styles.disabledOverlay}>
              <div style={styles.fieldRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Type d&apos;action</label>
                  <select
                    style={styles.select}
                    value={wf.action_type}
                    onChange={e => updateWorkflow(wf.id, { action_type: e.target.value })}
                    disabled={!canEdit}
                  >
                    {ACTION_TYPES.map(at => (
                      <option key={at.value} value={at.value}>
                        {at.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role minimum requis</label>
                  <select
                    style={styles.select}
                    value={wf.required_role}
                    onChange={e => updateWorkflow(wf.id, { required_role: e.target.value })}
                    disabled={!canEdit}
                  >
                    {ROLE_OPTIONS.map(ro => (
                      <option key={ro.value} value={ro.value}>
                        {ro.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Approbation automatique</label>
                <div style={styles.checkboxRow}>
                  {(['member', 'admin', 'owner'] as const).map(roleKey => {
                    const field = `auto_approve_${roleKey}` as keyof Workflow;
                    const checked = wf[field] as boolean;
                    const label = roleKey === 'member' ? 'Membre' : roleKey === 'admin' ? 'Admin' : 'Proprietaire';
                    return (
                      <label key={roleKey} style={styles.checkboxLabel}>
                        <div
                          style={{
                            ...styles.checkbox,
                            ...(checked ? styles.checkboxChecked : {}),
                          }}
                          onClick={() => {
                            if (canEdit) updateWorkflow(wf.id, { [field]: !checked });
                          }}
                        >
                          {checked && <span style={styles.checkmark}>&#10003;</span>}
                        </div>
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {canEdit && dirty && (
        <button style={styles.saveBtn} onClick={handleSave}>
          Sauvegarder les workflows
        </button>
      )}
    </div>
  );
}
