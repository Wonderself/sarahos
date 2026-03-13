'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { ACTION_TYPE_ICONS, ACTION_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, formatDueDate } from '../../../lib/action-parser';
import { SlideOver } from '../../../components/SlideOver';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar } from '../../../lib/page-styles';

// ─── Types ───

interface Action {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sourceAgent: string | null;
  dueDate: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ActionStats {
  total: number;
  proposed: number;
  accepted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

type KanbanColumn = 'proposed' | 'accepted' | 'in_progress' | 'completed';

const COLUMNS: { id: KanbanColumn; label: string; color: string }[] = [
  { id: 'proposed', label: 'Proposées', color: CU.textMuted },
  { id: 'accepted', label: 'À faire', color: CU.textSecondary },
  { id: 'in_progress', label: 'En cours', color: CU.text },
  { id: 'completed', label: 'Terminées', color: CU.text },
];

const ALL_TYPES = Object.keys(ACTION_TYPE_LABELS);
const ALL_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// ─── Helpers ───

function getToken(): string | undefined {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; }
}

function getAgentName(agentId: string): string {
  return ALL_AGENTS.find(a => a.id === agentId)?.name ?? agentId;
}

function getAgentEmoji(agentId: string): string {
  return ALL_AGENTS.find(a => a.id === agentId)?.emoji ?? '';
}

function getAgentMaterialIcon(agentId: string): string {
  return (ALL_AGENTS.find(a => a.id === agentId) as any)?.materialIcon ?? 'smart_toy';
}

// ─── Page Component ───

export default function ActionsPage() {
  const isMobile = useIsMobile();
  const [actions, setActions] = useState<Action[]>([]);
  const [stats, setStats] = useState<ActionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAgent, setFilterAgent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ─── Data fetching ───

  const fetchActions = useCallback(async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterPriority) params.set('priority', filterPriority);
      params.set('limit', '200');

      const res = await fetch(`/api/portal/actions?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions ?? []);
      }
    } catch {}
    setLoading(false);
  }, [filterType, filterPriority]);

  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/portal/actions/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchActions();
    fetchStats();
  }, [fetchActions, fetchStats]);

  // ─── Action mutations ───

  async function updateActionStatus(actionId: string, newStatus: string) {
    try {
      const token = getToken();
      const res = await fetch(`/api/portal/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
        fetchStats();
        if (selectedAction?.id === actionId) {
          setSelectedAction(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch {}
  }

  async function deleteAction(actionId: string) {
    try {
      const token = getToken();
      const res = await fetch(`/api/portal/actions/${actionId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setActions(prev => prev.filter(a => a.id !== actionId));
        fetchStats();
        if (selectedAction?.id === actionId) setSelectedAction(null);
      }
    } catch {}
  }

  // ─── Filtered actions ───

  const filteredActions = actions.filter(a => {
    if (filterAgent && a.sourceAgent !== filterAgent) return false;
    return true;
  });

  function actionsForColumn(col: KanbanColumn): Action[] {
    return filteredActions.filter(a => a.status === col);
  }

  // ─── Stats Header ───

  const overdueCount = actions.filter(a =>
    a.dueDate && new Date(a.dueDate) < new Date() && !['completed', 'cancelled'].includes(a.status)
  ).length;

  // ─── Agent filter options ───

  const usedAgents = [...new Set(actions.map(a => a.sourceAgent).filter(Boolean))] as string[];

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.actions.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.actions.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.actions.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.actions.helpText} />
        </div>
      </div>
      <PageExplanation pageId="actions" text={PAGE_META.actions?.helpText} />

      {/* Toolbar */}
      <div style={{ ...toolbar(), justifyContent: 'flex-end' }}>
        <button
          onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          style={CU.btnGhost}
        >
          {viewMode === 'kanban' ? '📋' : '📊'} {viewMode === 'kanban' ? 'Liste' : 'Kanban'}
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          style={CU.btnPrimary}
        >
          + Nouvelle action
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={cardGrid(isMobile, isMobile ? 2 : 6)}>
          {[
            { label: 'Total', value: stats.total, color: CU.text },
            { label: 'Proposées', value: stats.proposed, color: CU.textMuted },
            { label: 'À faire', value: stats.accepted, color: CU.textSecondary },
            { label: 'En cours', value: stats.inProgress, color: CU.text },
            { label: 'Terminées', value: stats.completed, color: CU.text },
            { label: 'En retard', value: overdueCount, color: CU.danger },
          ].map(s => (
            <div key={s.label} style={{
              ...CU.card,
              background: CU.bgSecondary,
            }}>
              <div style={CU.statLabel}>{s.label}</div>
              <div style={{ ...CU.statValue, fontSize: 20, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ ...toolbar(), marginTop: 16, flexDirection: isMobile ? 'column' : 'row' }}>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ ...CU.select, width: isMobile ? '100%' : 'auto' }}
        >
          <option value="">Tous les types</option>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{ACTION_TYPE_ICONS[t]} {ACTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          style={{ ...CU.select, width: isMobile ? '100%' : 'auto' }}
        >
          <option value="">Toutes priorités</option>
          {ALL_PRIORITIES.map(p => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>
        {usedAgents.length > 0 && (
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            style={{ ...CU.select, width: isMobile ? '100%' : 'auto' }}
          >
            <option value="">Tous les assistants</option>
            {usedAgents.map(a => (
              <option key={a} value={a}>{getAgentEmoji(a)} {getAgentName(a)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: CU.textSecondary, fontSize: 13 }}>
          Chargement...
        </div>
      )}

      {/* Empty state */}
      {!loading && actions.length === 0 && (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>⚡</div>
          <div style={CU.emptyTitle}>Aucune action pour le moment</div>
          <div style={CU.emptyDesc}>
            Discutez avec vos assistants dans le chat — ils proposeront des actions concrètes
            à la fin de vos conversations.
          </div>
        </div>
      )}

      {/* Kanban View */}
      {!loading && actions.length > 0 && viewMode === 'kanban' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
          minHeight: 400,
        }}>
          {COLUMNS.map(col => (
            <div key={col.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{col.label}</span>
                <span style={{ fontSize: 12, color: CU.textMuted }}>
                  {actionsForColumn(col.id).length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {actionsForColumn(col.id).map(action => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onClick={() => setSelectedAction(action)}
                    onStatusChange={updateActionStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && actions.length > 0 && viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredActions.map(action => (
            <div
              key={action.id}
              onClick={() => setSelectedAction(action)}
              style={{
                ...CU.cardHoverable,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 16 }}>{ACTION_TYPE_ICONS[action.type] ?? '⚡'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: CU.text }}>{action.title}</div>
                <div style={{ fontSize: 12, color: CU.textSecondary }}>
                  {ACTION_TYPE_LABELS[action.type] ?? action.type}
                  {action.sourceAgent && ` · ${getAgentEmoji(action.sourceAgent)} ${getAgentName(action.sourceAgent)}`}
                </div>
              </div>
              <span style={{
                ...CU.badge,
                background: `${PRIORITY_COLORS[action.priority]}22`,
                color: PRIORITY_COLORS[action.priority],
              }}>
                {PRIORITY_LABELS[action.priority] ?? action.priority}
              </span>
              <span style={{ fontSize: 12, color: CU.textMuted }}>
                {COLUMNS.find(c => c.id === action.status)?.label ?? action.status}
              </span>
              {action.dueDate && (
                <span style={{
                  fontSize: 12,
                  color: new Date(action.dueDate) < new Date() ? CU.danger : CU.textMuted,
                }}>
                  {formatDueDate(action.dueDate)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Detail SlideOver */}
      <SlideOver
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        title={selectedAction?.title ?? ''}
        subtitle={selectedAction ? `${ACTION_TYPE_ICONS[selectedAction.type]} ${ACTION_TYPE_LABELS[selectedAction.type] ?? selectedAction.type}` : ''}
      >
        {selectedAction && (
          <ActionDetailPanel
            action={selectedAction}
            onStatusChange={(status) => updateActionStatus(selectedAction.id, status)}
            onDelete={() => deleteAction(selectedAction.id)}
          />
        )}
      </SlideOver>

      {/* Add Action Modal (simple) */}
      <SlideOver
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouvelle action"
        subtitle="Créer une action manuellement"
      >
        <AddActionForm
          onCreated={(a) => {
            setActions(prev => [a, ...prev]);
            setShowAddModal(false);
            fetchStats();
          }}
        />
      </SlideOver>
    </div>
  );
}

// ─── Action Card Component ───

function ActionCard({
  action,
  onClick,
  onStatusChange,
}: {
  action: Action;
  onClick: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() && !['completed', 'cancelled'].includes(action.status);

  return (
    <div
      onClick={onClick}
      style={{
        ...CU.cardHoverable,
        background: CU.bgSecondary,
        borderColor: isOverdue ? `${CU.danger}44` : CU.border,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>{ACTION_TYPE_ICONS[action.type] ?? '⚡'}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: CU.text }}>{action.title}</span>
      </div>
      {action.description && (
        <p style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.3, margin: '0 0 6px' }}>
          {action.description.length > 80 ? action.description.slice(0, 80) + '...' : action.description}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            ...CU.badge,
            background: `${PRIORITY_COLORS[action.priority]}22`,
            color: PRIORITY_COLORS[action.priority],
          }}>
            {PRIORITY_LABELS[action.priority]}
          </span>
          {action.dueDate && (
            <span style={{ fontSize: 12, color: isOverdue ? CU.danger : CU.textMuted }}>
              {formatDueDate(action.dueDate)}
            </span>
          )}
        </div>
        {action.sourceAgent && (
          <span style={{ fontSize: 12 }} title={getAgentName(action.sourceAgent)}>
            {getAgentEmoji(action.sourceAgent) || '🤖'}
          </span>
        )}
      </div>
      {/* Quick status buttons */}
      {action.status === 'proposed' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'accepted'); }}
            style={{ ...CU.btnPrimary, fontSize: 11, flex: 1, height: 32 }}
          >
            Accepter
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'cancelled'); }}
            style={{ ...CU.btnGhost, fontSize: 11, height: 32 }}
          >
            Ignorer
          </button>
        </div>
      )}
      {action.status === 'accepted' && (
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'in_progress'); }}
          style={{ ...CU.btnGhost, fontSize: 11, width: '100%', marginTop: 8, height: 32 }}
        >
          Démarrer
        </button>
      )}
      {action.status === 'in_progress' && (
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'completed'); }}
          style={{ ...CU.btnGhost, fontSize: 11, width: '100%', marginTop: 8, height: 32 }}
        >
          Terminer
        </button>
      )}
    </div>
  );
}

// ─── Action Detail Panel ───

function ActionDetailPanel({
  action,
  onStatusChange,
  onDelete,
}: {
  action: Action;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status timeline */}
      <div>
        <label style={CU.label}>Statut</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => onStatusChange(col.id)}
              style={{
                ...CU.btnSmall,
                flex: '1 1 auto',
                background: action.status === col.id ? `${col.color}22` : 'transparent',
                color: action.status === col.id ? col.color : CU.textSecondary,
                borderColor: action.status === col.id ? `${col.color}44` : CU.border,
                fontWeight: action.status === col.id ? 600 : 400,
              }}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      {action.description && (
        <div>
          <label style={CU.label}>Description</label>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: CU.text, margin: 0 }}>{action.description}</p>
        </div>
      )}

      {/* Metadata */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))' }}>
        <div>
          <label style={{ fontSize: 12, color: CU.textMuted }}>Type</label>
          <div style={{ fontSize: 13, color: CU.text }}>{ACTION_TYPE_ICONS[action.type]} {ACTION_TYPE_LABELS[action.type]}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: CU.textMuted }}>Priorité</label>
          <div style={{ fontSize: 13, color: PRIORITY_COLORS[action.priority] }}>
            {PRIORITY_LABELS[action.priority]}
          </div>
        </div>
        {action.sourceAgent && (
          <div>
            <label style={{ fontSize: 12, color: CU.textMuted }}>Assistant source</label>
            <div style={{ fontSize: 13, color: CU.text }}>{getAgentEmoji(action.sourceAgent)} {getAgentName(action.sourceAgent)}</div>
          </div>
        )}
        {action.dueDate && (
          <div>
            <label style={{ fontSize: 12, color: CU.textMuted }}>Échéance</label>
            <div style={{
              fontSize: 13,
              color: new Date(action.dueDate) < new Date() ? CU.danger : CU.text,
            }}>
              {new Date(action.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
        <div>
          <label style={{ fontSize: 12, color: CU.textMuted }}>Créée le</label>
          <div style={{ fontSize: 13, color: CU.text }}>
            {new Date(action.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...CU.divider }} />
      <div>
        <button
          onClick={onDelete}
          style={{ ...CU.btnSmall, color: CU.danger, borderColor: `${CU.danger}44`, background: `${CU.danger}08` }}
        >
          Annuler cette action
        </button>
      </div>
    </div>
  );
}

// ─── Add Action Form ───

function AddActionForm({ onCreated }: { onCreated: (action: Action) => void }) {
  const [type, setType] = useState('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/portal/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || undefined,
          status: 'accepted',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(data.action);
      }
    } catch {}
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={CU.label}>Type</label>
        <select value={type} onChange={e => setType(e.target.value)} style={CU.select}>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{ACTION_TYPE_ICONS[t]} {ACTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={CU.label}>Titre *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Appeler le fournisseur X"
          maxLength={200}
          style={CU.input}
        />
      </div>
      <div>
        <label style={CU.label}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Détails optionnels..."
          style={CU.textarea}
        />
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))' }}>
        <div>
          <label style={CU.label}>Priorité</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} style={CU.select}>
            {ALL_PRIORITIES.map(p => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={CU.label}>Échéance</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={CU.input}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!title.trim() || saving}
        style={{ ...CU.btnPrimary, width: '100%', height: 40, fontSize: 13 }}
      >
        {saving ? 'Création...' : 'Créer l\'action'}
      </button>
    </form>
  );
}
