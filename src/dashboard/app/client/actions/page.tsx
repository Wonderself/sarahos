'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { ACTION_TYPE_ICONS, ACTION_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, formatDueDate } from '../../../lib/action-parser';
import { SlideOver } from '../../../components/SlideOver';

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
  { id: 'proposed', label: 'Proposées', color: '#8B5CF6' },
  { id: 'accepted', label: 'À faire', color: '#3B82F6' },
  { id: 'in_progress', label: 'En cours', color: '#F59E0B' },
  { id: 'completed', label: 'Terminées', color: '#22C55E' },
];

const ALL_TYPES = Object.keys(ACTION_TYPE_LABELS);
const ALL_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// ─── Helpers ───

function getToken(): string | undefined {
  return document.cookie.split(';').find(c => c.trim().startsWith('fz-token='))?.split('=')[1];
}

function getAgentName(agentId: string): string {
  return ALL_AGENTS.find(a => a.id === agentId)?.name ?? agentId;
}

function getAgentEmoji(agentId: string): string {
  return ALL_AGENTS.find(a => a.id === agentId)?.emoji ?? '🤖';
}

// ─── Page Component ───

export default function ActionsPage() {
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
    <div>
      {/* Header */}
      <div className="flex flex-between items-center mb-8 flex-wrap gap-6">
        <div>
          <h1 className="text-xl font-bold">Centre d&apos;actions</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Actions proposées par vos agents, suivi et exécution
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            className="btn btn-secondary btn-sm"
          >
            {viewMode === 'kanban' ? '📋 Liste' : '📊 Kanban'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-sm"
            style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
          >
            + Nouvelle action
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Proposées', value: stats.proposed, color: '#8B5CF6' },
            { label: 'À faire', value: stats.accepted, color: '#3B82F6' },
            { label: 'En cours', value: stats.inProgress, color: '#F59E0B' },
            { label: 'Terminées', value: stats.completed, color: '#22C55E' },
            { label: 'En retard', value: overdueCount, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="rounded-sm" style={{
              padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-6 flex-wrap mb-8">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="input"
          style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
        >
          <option value="">Tous les types</option>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{ACTION_TYPE_ICONS[t]} {ACTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="input"
          style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
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
            className="input"
            style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
          >
            <option value="">Tous les agents</option>
            {usedAgents.map(a => (
              <option key={a} value={a}>{getAgentEmoji(a)} {getAgentName(a)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
          Chargement...
        </div>
      )}

      {/* Empty state */}
      {!loading && actions.length === 0 && (
        <div className="text-center" style={{
          padding: '60px 20px', background: 'var(--bg-secondary)',
          borderRadius: 8, border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <h3 className="text-lg font-semibold mb-4">Aucune action pour le moment</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Discutez avec vos agents dans le chat — ils proposeront des actions concrètes
            à la fin de vos conversations.
          </p>
        </div>
      )}

      {/* Kanban View */}
      {!loading && actions.length > 0 && viewMode === 'kanban' && (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)', minHeight: 400 }}>
          {COLUMNS.map(col => (
            <div key={col.id}>
              <div className="flex items-center gap-6 mb-6" style={{ padding: '0 4px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {actionsForColumn(col.id).length}
                </span>
              </div>
              <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-4">
          {filteredActions.map(action => (
            <div
              key={action.id}
              className="flex items-center gap-8 rounded-sm cursor-pointer"
              onClick={() => setSelectedAction(action)}
              style={{
                padding: '10px 12px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 16 }}>{ACTION_TYPE_ICONS[action.type] ?? '⚡'}</span>
              <div style={{ flex: 1 }}>
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {ACTION_TYPE_LABELS[action.type] ?? action.type}
                  {action.sourceAgent && ` · ${getAgentEmoji(action.sourceAgent)} ${getAgentName(action.sourceAgent)}`}
                </div>
              </div>
              <span className="text-xs font-medium" style={{
                padding: '2px 8px', borderRadius: 4,
                background: `${PRIORITY_COLORS[action.priority]}22`,
                color: PRIORITY_COLORS[action.priority],
              }}>
                {PRIORITY_LABELS[action.priority] ?? action.priority}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)', minWidth: 80 }}>
                {COLUMNS.find(c => c.id === action.status)?.label ?? action.status}
              </span>
              {action.dueDate && (
                <span className="text-xs" style={{
                  color: new Date(action.dueDate) < new Date() ? '#EF4444' : 'var(--text-tertiary)',
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
      className="rounded-sm cursor-pointer"
      onClick={onClick}
      style={{
        padding: '10px 12px',
        background: 'var(--bg-secondary)',
        border: isOverdue ? '1px solid #EF444444' : '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-6 mb-4">
        <span style={{ fontSize: 14 }}>{ACTION_TYPE_ICONS[action.type] ?? '⚡'}</span>
        <span className="text-sm font-medium" style={{ flex: 1, lineHeight: 1.3 }}>{action.title}</span>
      </div>
      {action.description && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          {action.description.length > 80 ? action.description.slice(0, 80) + '...' : action.description}
        </p>
      )}
      <div className="flex flex-between items-center">
        <div className="flex gap-4 items-center">
          <span className="text-xs" style={{
            padding: '1px 6px', borderRadius: 4,
            background: `${PRIORITY_COLORS[action.priority]}22`,
            color: PRIORITY_COLORS[action.priority],
          }}>
            {PRIORITY_LABELS[action.priority]}
          </span>
          {action.dueDate && (
            <span className="text-xs" style={{ color: isOverdue ? '#EF4444' : 'var(--text-tertiary)' }}>
              {formatDueDate(action.dueDate)}
            </span>
          )}
        </div>
        {action.sourceAgent && (
          <span className="text-xs" title={getAgentName(action.sourceAgent)}>
            {getAgentEmoji(action.sourceAgent)}
          </span>
        )}
      </div>
      {/* Quick status buttons */}
      {action.status === 'proposed' && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'accepted'); }}
            className="btn btn-sm"
            style={{ fontSize: 10, flex: 1, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
          >
            Accepter
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'cancelled'); }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 10 }}
          >
            Ignorer
          </button>
        </div>
      )}
      {action.status === 'accepted' && (
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'in_progress'); }}
          className="btn btn-sm mt-6"
          style={{ fontSize: 10, width: '100%', background: '#F59E0B22', color: '#F59E0B', borderColor: '#F59E0B44' }}
        >
          Démarrer
        </button>
      )}
      {action.status === 'in_progress' && (
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(action.id, 'completed'); }}
          className="btn btn-sm mt-6"
          style={{ fontSize: 10, width: '100%', background: '#22C55E22', color: '#22C55E', borderColor: '#22C55E44' }}
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
  const statusFlow: string[] = ['proposed', 'accepted', 'in_progress', 'completed'];
  const currentIdx = statusFlow.indexOf(action.status);

  return (
    <div className="flex flex-col gap-8">
      {/* Status timeline */}
      <div>
        <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Statut</label>
        <div className="flex gap-4">
          {COLUMNS.map((col, i) => (
            <button
              key={col.id}
              onClick={() => onStatusChange(col.id)}
              className="btn btn-sm"
              style={{
                fontSize: 11, flex: 1,
                background: action.status === col.id ? `${col.color}22` : 'transparent',
                color: action.status === col.id ? col.color : 'var(--text-secondary)',
                borderColor: action.status === col.id ? `${col.color}44` : 'var(--border)',
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
          <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Description</label>
          <p className="text-sm" style={{ lineHeight: 1.5 }}>{action.description}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Type</label>
          <div className="text-sm">{ACTION_TYPE_ICONS[action.type]} {ACTION_TYPE_LABELS[action.type]}</div>
        </div>
        <div>
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Priorité</label>
          <div className="text-sm" style={{ color: PRIORITY_COLORS[action.priority] }}>
            {PRIORITY_LABELS[action.priority]}
          </div>
        </div>
        {action.sourceAgent && (
          <div>
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Agent source</label>
            <div className="text-sm">{getAgentEmoji(action.sourceAgent)} {getAgentName(action.sourceAgent)}</div>
          </div>
        )}
        {action.dueDate && (
          <div>
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Échéance</label>
            <div className="text-sm" style={{
              color: new Date(action.dueDate) < new Date() ? '#EF4444' : 'var(--text-primary)',
            }}>
              {new Date(action.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
        <div>
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Créée le</label>
          <div className="text-sm">
            {new Date(action.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
        <button
          onClick={onDelete}
          className="btn btn-sm"
          style={{ fontSize: 11, color: '#EF4444', borderColor: '#EF444444', background: '#EF444408' }}
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="input" style={{ fontSize: 13 }}>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{ACTION_TYPE_ICONS[t]} {ACTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Titre *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input"
          placeholder="Ex: Appeler le fournisseur X"
          maxLength={200}
          style={{ fontSize: 13 }}
        />
      </div>
      <div>
        <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input"
          rows={3}
          placeholder="Détails optionnels..."
          style={{ fontSize: 13, resize: 'vertical' }}
        />
      </div>
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Priorité</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="input" style={{ fontSize: 13 }}>
            {ALL_PRIORITIES.map(p => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)', display: 'block' }}>Échéance</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="input"
            style={{ fontSize: 13 }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!title.trim() || saving}
        className="btn"
        style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)', fontSize: 13 }}
      >
        {saving ? 'Création...' : 'Créer l\'action'}
      </button>
    </form>
  );
}
