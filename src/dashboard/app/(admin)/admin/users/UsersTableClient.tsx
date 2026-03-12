'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlideOver } from '../../../../components/SlideOver';
import { useToast } from '../../../../components/Toast';
import type { UserEntry } from '../../../../lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = 'displayName' | 'email' | 'role' | 'tier' | 'dailyApiCalls' | 'createdAt' | 'lastLoginAt';
type SortDir = 'asc' | 'desc';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  paid: 'badge-success',
  free: 'badge-info',
  demo: 'badge-warning',
  guest: 'badge-neutral',
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'badge-danger',
  system: 'badge-purple',
  operator: 'badge-warning',
  viewer: 'badge-neutral',
};
const PAGE_SIZE = 20;

// ─── Utils ────────────────────────────────────────────────────────────────────

async function callAction(action: string, params: Record<string, unknown>) {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
  return '#6B6B6B';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsersTableClient({ users: initialUsers }: { users: UserEntry[] }) {
  const router = useRouter();
  const toast = useToast();

  // ── Filter / Sort / Page state ──
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // ── Selection state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Slide-over state ──
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<UserEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Filtered + sorted + paginated ──
  const filtered = useMemo(() => {
    let list = [...initialUsers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (filterTier) list = list.filter(u => u.tier === filterTier);
    if (filterRole) list = list.filter(u => u.role === filterRole);
    if (filterStatus === 'active') list = list.filter(u => u.isActive);
    if (filterStatus === 'inactive') list = list.filter(u => !u.isActive);

    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'displayName': aVal = a.displayName; bVal = b.displayName; break;
        case 'email': aVal = a.email; bVal = b.email; break;
        case 'role': aVal = a.role; bVal = b.role; break;
        case 'tier': aVal = a.tier; bVal = b.tier; break;
        case 'dailyApiCalls': aVal = a.dailyApiCalls; bVal = b.dailyApiCalls; break;
        case 'lastLoginAt': aVal = a.lastLoginAt ?? ''; bVal = b.lastLoginAt ?? ''; break;
        default: aVal = a.createdAt; bVal = b.createdAt;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [initialUsers, search, filterTier, filterRole, filterStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Sort toggle ──
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  function resetFilters() {
    setSearch(''); setFilterTier(''); setFilterRole(''); setFilterStatus('');
    setPage(1);
  }

  // ── Selection ──
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const allIds = new Set(paginated.map(u => u.id));
    const allSelected = paginated.every(u => selectedIds.has(u.id));
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => new Set([...prev, ...allIds]));
    }
  }

  const allPageSelected = paginated.length > 0 && paginated.every(u => selectedIds.has(u.id));

  // ── Actions ──
  function openOverlay(type: string, user?: UserEntry) {
    setActiveOverlay(type);
    setTargetUser(user ?? null);
  }

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
    setTargetUser(null);
  }, []);

  async function doAction(action: string, params: Record<string, unknown>, successMsg: string) {
    setActionLoading(true);
    try {
      await callAction(action, params);
      toast.showSuccess(successMsg);
      closeOverlay();
      setSelectedIds(new Set());
      router.refresh();
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Erreur inattendue');
    } finally {
      setActionLoading(false);
    }
  }

  async function doBulkAction(
    actionFn: (id: string) => Promise<unknown>,
    successMsg: string
  ) {
    setActionLoading(true);
    try {
      await Promise.all([...selectedIds].map(id => actionFn(id)));
      toast.showSuccess(successMsg);
      closeOverlay();
      setSelectedIds(new Set());
      router.refresh();
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Erreur inattendue');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Sort header helper ──
  function SortTh({
    field,
    label,
    className = '',
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) {
    const active = sortField === field;
    return (
      <th
        className={`sortable ${className}`}
        onClick={() => handleSort(field)}
      >
        {label}
        <span className={`sort-icon${active ? ' sort-icon-active' : ''}`}>
          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </th>
    );
  }

  const hasFilters = !!(search || filterTier || filterRole || filterStatus);

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', fontSize: 12,
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}>🔍</span>
          <input
            className="input input-sm"
            placeholder="Rechercher par email ou nom…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 30 }}
          />
        </div>

        <select
          className="select input-sm"
          value={filterTier}
          onChange={e => { setFilterTier(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 110 }}
        >
          <option value="">Tous les tiers</option>
          <option value="paid">Paid</option>
          <option value="free">Free</option>
          <option value="demo">Demo</option>
          <option value="guest">Guest</option>
        </select>

        <select
          className="select input-sm"
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 120 }}
        >
          <option value="">Tous les roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          className="select input-sm"
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 100 }}
        >
          <option value="">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            ✕ Reset
          </button>
        )}

        <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedIds.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="bulk-actions">
            <button className="btn-bulk" onClick={() => openOverlay('bulk-deposit')}>
              💰 Deposer credits
            </button>
            <button className="btn-bulk" onClick={() => openOverlay('bulk-tier')}>
              Changer tier
            </button>
            <button className="btn-bulk" onClick={() => openOverlay('bulk-notify')}>
              📤 Notifier
            </button>
          </div>
          <button
            className="btn-bulk"
            style={{ marginLeft: 'auto', opacity: 0.8 }}
            onClick={() => setSelectedIds(new Set())}
          >
            ✕ Désélectionner
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="card table-responsive" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 44, paddingLeft: 16 }}>
                <div
                  className={`custom-checkbox${allPageSelected ? ' checked' : ''}`}
                  onClick={toggleSelectAll}
                  title={allPageSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                >
                  {allPageSelected ? '✅' : ''}
                </div>
              </th>
              <SortTh field="displayName" label="Utilisateur" />
              <SortTh field="role" label="Rôle" />
              <SortTh field="tier" label="Tier" />
              <SortTh field="dailyApiCalls" label="API / jour" className="text-center" />
              <th className="text-center">Statut</th>
              <SortTh field="createdAt" label="Inscription" />
              <SortTh field="lastLoginAt" label="Dernier login" />
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">{hasFilters ? '🔍' : '👥'}</div>
                    <div className="empty-state-text">
                      {hasFilters ? 'Aucun résultat pour ces filtres' : 'Aucun utilisateur'}
                    </div>
                    {hasFilters && (
                      <div className="empty-state-sub" style={{ marginTop: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                          Réinitialiser les filtres
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(user => (
                <tr key={user.id} className={selectedIds.has(user.id) ? 'row-selected' : ''}>
                  {/* Checkbox */}
                  <td style={{ width: 44, paddingLeft: 16 }}>
                    <div
                      className={`custom-checkbox${selectedIds.has(user.id) ? ' checked' : ''}`}
                      onClick={() => toggleSelect(user.id)}
                    >
                      {selectedIds.has(user.id) ? '✅' : ''}
                    </div>
                  </td>

                  {/* User */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: avatarColor(user.email) }}
                      >
                        {getInitials(user.displayName)}
                      </div>
                      <div>
                        <div className="font-medium text-md">{user.displayName}</div>
                        <div className="text-xs text-tertiary">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td>
                    <span className={`badge ${ROLE_COLORS[user.role] ?? 'badge-neutral'}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Tier */}
                  <td>
                    <span className={`badge ${TIER_COLORS[user.tier] ?? 'badge-neutral'}`}>
                      {user.tier}
                    </span>
                  </td>

                  {/* API calls */}
                  <td className="text-center">
                    <div className="text-md font-semibold">{user.dailyApiCalls}</div>
                    <div className="text-muted" style={{ fontSize: 10 }}>
                      / {user.dailyApiLimit}
                    </div>
                    <div
                      className="progress-bar"
                      style={{ marginTop: 4, maxWidth: 80, margin: '4px auto 0' }}
                    >
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(
                            (user.dailyApiCalls / Math.max(user.dailyApiLimit, 1)) * 100,
                            100
                          )}%`,
                          background:
                            user.dailyApiCalls > user.dailyApiLimit * 0.9
                              ? 'var(--danger)'
                              : user.dailyApiCalls > user.dailyApiLimit * 0.7
                              ? 'var(--text-secondary)'
                              : 'var(--text-primary)',
                        }}
                      />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="text-center">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="text-sm text-tertiary">{formatDate(user.createdAt)}</td>
                  <td className="text-sm text-tertiary">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-xs"
                        title="Déposer des crédits"
                        onClick={() => openOverlay('deposit', user)}
                      >
                        💰
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => openOverlay('role', user)}
                      >
                        Rôle
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => openOverlay('tier', user)}
                      >
                        Tier
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        title="Régénérer la clé API"
                        onClick={() => openOverlay('reset-key', user)}
                      >
                        🔑
                      </button>
                      {user.isActive ? (
                        <button
                          className="btn btn-danger btn-xs"
                          title="Désactiver"
                          onClick={() => openOverlay('deactivate', user)}
                        >
                          Off
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-xs"
                          title="Réactiver"
                          onClick={() =>
                            doAction(
                              'updateUser',
                              { id: user.id, data: { isActive: true } },
                              `${user.displayName} réactivé`
                            )
                          }
                        >
                          On
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur{' '}
              {filtered.length}
            </span>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                title="Première page"
              >
                «
              </button>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                ‹
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn${page === pageNum ? ' pagination-btn-active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
              >
                ›
              </button>
              <button
                className="pagination-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                title="Dernière page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════ SLIDE-OVERS ═══════════════════════════════ */}

      {/* Deposit */}
      <DepositSlideOver
        isOpen={activeOverlay === 'deposit'}
        user={targetUser}
        onClose={closeOverlay}
        onSubmit={(userId, amount, desc) =>
          doAction(
            'depositCredits',
            { userId, amount, description: desc },
            'Crédits déposés avec succès'
          )
        }
        loading={actionLoading}
      />

      {/* Role */}
      <RoleSlideOver
        isOpen={activeOverlay === 'role'}
        user={targetUser}
        onClose={closeOverlay}
        onSubmit={(userId, role) =>
          doAction('updateUser', { id: userId, data: { role } }, 'Rôle mis à jour')
        }
        loading={actionLoading}
      />

      {/* Tier */}
      <TierSlideOver
        isOpen={activeOverlay === 'tier'}
        user={targetUser}
        onClose={closeOverlay}
        onSubmit={(userId, tier) =>
          doAction('updateUser', { id: userId, data: { tier } }, 'Tier mis à jour')
        }
        loading={actionLoading}
      />

      {/* Reset Key */}
      <ResetKeySlideOver
        isOpen={activeOverlay === 'reset-key'}
        user={targetUser}
        onClose={closeOverlay}
        onSubmit={userId =>
          doAction('resetUserKey', { id: userId }, 'Clé API régénérée')
        }
        loading={actionLoading}
      />

      {/* Deactivate */}
      <DeactivateSlideOver
        isOpen={activeOverlay === 'deactivate'}
        user={targetUser}
        onClose={closeOverlay}
        onSubmit={userId =>
          doAction('deleteUser', { id: userId }, 'Utilisateur désactivé')
        }
        loading={actionLoading}
      />

      {/* Bulk Deposit */}
      <BulkDepositSlideOver
        isOpen={activeOverlay === 'bulk-deposit'}
        count={selectedIds.size}
        onClose={closeOverlay}
        onSubmit={(amount, desc) =>
          doBulkAction(
            id => callAction('depositCredits', { userId: id, amount, description: desc }),
            `Crédits déposés pour ${selectedIds.size} utilisateurs`
          )
        }
        loading={actionLoading}
      />

      {/* Bulk Tier */}
      <BulkTierSlideOver
        isOpen={activeOverlay === 'bulk-tier'}
        count={selectedIds.size}
        onClose={closeOverlay}
        onSubmit={tier =>
          doBulkAction(
            id => callAction('updateUser', { id, data: { tier } }),
            `Tier mis à jour pour ${selectedIds.size} utilisateurs`
          )
        }
        loading={actionLoading}
      />

      {/* Bulk Notify */}
      <BulkNotifySlideOver
        isOpen={activeOverlay === 'bulk-notify'}
        count={selectedIds.size}
        onClose={closeOverlay}
        onSubmit={(title, message) =>
          doBulkAction(
            id => callAction('sendNotification', { userId: id, channel: 'in_app', type: 'admin_broadcast', title, message }),
            `Notification envoyée à ${selectedIds.size} utilisateurs`
          )
        }
        loading={actionLoading}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Slide-over sub-components
// ═══════════════════════════════════════════════════════

function DepositSlideOver({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  user: UserEntry | null;
  onClose: () => void;
  onSubmit: (userId: string, amount: number, desc: string) => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const credits = parseFloat(amount);
    if (!credits || credits <= 0) return;
    onSubmit(user.id, Math.round(credits * 1_000_000), desc || 'Dépôt admin');
  }

  if (!user) return null;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Déposer des crédits"
      subtitle={`Pour ${user.displayName} (${user.email})`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            form="deposit-form"
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? 'En cours...' : <>💰 Deposer</>}
          </button>
        </>
      }
    >
      <form id="deposit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Montant (en crédits)</label>
          <input
            className="input"
            type="number"
            min="1"
            step="1"
            placeholder="Ex: 100"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
            required
          />
          <p className="form-hint">1 crédit = 1 000 000 micro-crédits. 100 crédits ≈ 330 messages Sonnet.</p>
        </div>
        <div className="form-group">
          <label className="form-label">Motif (optionnel)</label>
          <input
            className="input"
            type="text"
            placeholder="Dépôt admin, compensation, bonus…"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>
      </form>
    </SlideOver>
  );
}

function RoleSlideOver({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  user: UserEntry | null;
  onClose: () => void;
  onSubmit: (userId: string, role: string) => void;
  loading: boolean;
}) {
  const [role, setRole] = useState('');
  if (!user) return null;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Changer le rôle"
      subtitle={user.displayName}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => role && onSubmit(user.id, role)}
            disabled={loading || !role || role === user.role}
          >
            {loading ? 'En cours…' : 'Confirmer'}
          </button>
        </>
      }
    >
      <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
        Rôle actuel :{' '}
        <span className={`badge ${ROLE_COLORS[user.role] ?? 'badge-neutral'}`}>{user.role}</span>
      </p>
      <div className="form-group">
        <label className="form-label">Nouveau rôle</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { value: 'admin', label: 'Admin', desc: 'Acces complet a toutes les fonctionnalites et a la console admin.' },
            { value: 'operator', label: 'Operator', desc: 'Peut gerer les agents et les campagnes. Pas d\'acces admin.' },
            { value: 'viewer', label: 'Viewer', desc: 'Acces lecture seule au dashboard client standard.' },
          ].map(option => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: 12,
                border: `1px solid ${role === option.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: role === option.value ? 'var(--accent-muted)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                style={{ marginTop: 2 }}
              />
              <div>
                <div className="text-md font-medium">{option.label}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </SlideOver>
  );
}

function TierSlideOver({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  user: UserEntry | null;
  onClose: () => void;
  onSubmit: (userId: string, tier: string) => void;
  loading: boolean;
}) {
  const [tier, setTier] = useState('');
  if (!user) return null;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Changer le tier"
      subtitle={user.displayName}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => tier && onSubmit(user.id, tier)}
            disabled={loading || !tier || tier === user.tier}
          >
            {loading ? 'En cours…' : 'Confirmer'}
          </button>
        </>
      }
    >
      <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
        Tier actuel :{' '}
        <span className={`badge ${TIER_COLORS[user.tier] ?? 'badge-neutral'}`}>{user.tier}</span>
      </p>
      <div className="form-group">
        <label className="form-label">Nouveau tier</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { value: 'paid', label: 'Paid', desc: 'Abonnement payant actif. Acces complet + agents personnels.' },
            { value: 'free', label: 'Free', desc: 'Acces gratuit limite. 100 appels API/jour.' },
            { value: 'demo', label: 'Demo', desc: 'Acces demo temporaire. Expire apres 14 jours.' },
            { value: 'guest', label: 'Guest', desc: 'Acces visiteur minimal. Pas de chat ni agents.' },
          ].map(option => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: 12,
                border: `1px solid ${tier === option.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: tier === option.value ? 'var(--accent-muted)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="tier"
                value={option.value}
                checked={tier === option.value}
                onChange={() => setTier(option.value)}
                style={{ marginTop: 2 }}
              />
              <div>
                <div className="text-md font-medium">{option.label}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </SlideOver>
  );
}

function ResetKeySlideOver({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  user: UserEntry | null;
  onClose: () => void;
  onSubmit: (userId: string) => void;
  loading: boolean;
}) {
  if (!user) return null;
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Régénérer la clé API"
      subtitle={user.displayName}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-danger"
            onClick={() => onSubmit(user.id)}
            disabled={loading}
          >
            {loading ? 'En cours...' : <>🔑 Regenerer</>}
          </button>
        </>
      }
    >
      <div className="alert alert-warning" style={{ marginBottom: 16 }}>
        ⚠️ L&apos;ancienne cle API sera <strong>invalidee immediatement</strong>. L'utilisateur devra mettre à jour ses intégrations.
      </div>
      <p className="text-sm text-secondary">
        Régénérer la clé API de <strong>{user.displayName}</strong> ({user.email}) ?
      </p>
    </SlideOver>
  );
}

function DeactivateSlideOver({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  user: UserEntry | null;
  onClose: () => void;
  onSubmit: (userId: string) => void;
  loading: boolean;
}) {
  if (!user) return null;
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Désactiver l'utilisateur"
      subtitle={user.displayName}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-danger"
            onClick={() => onSubmit(user.id)}
            disabled={loading}
          >
            {loading ? 'En cours…' : 'Désactiver'}
          </button>
        </>
      }
    >
      <div className="alert alert-danger" style={{ marginBottom: 16 }}>
        L'utilisateur perdra immédiatement accès à son compte.
      </div>
      <p className="text-sm text-secondary">
        Désactiver <strong>{user.displayName}</strong> ({user.email}) ?
        Son compte sera suspendu mais ses données seront conservées.
        Vous pourrez le réactiver à tout moment.
      </p>
    </SlideOver>
  );
}

function BulkDepositSlideOver({
  isOpen,
  count,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onSubmit: (amount: number, desc: string) => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Déposer crédits — ${count} users`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const credits = parseFloat(amount);
              if (credits > 0) onSubmit(Math.round(credits * 1_000_000), desc || 'Dépôt admin groupé');
            }}
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? 'En cours...' : <>💰 Deposer pour {count} users</>}
          </button>
        </>
      }
    >
      <div className="alert alert-warning" style={{ marginBottom: 16 }}>
        Cette action déposera des crédits sur <strong>{count} comptes</strong> simultanément.
      </div>
      <div className="form-group">
        <label className="form-label">Montant par utilisateur (crédits)</label>
        <input
          className="input"
          type="number"
          min="1"
          step="1"
          placeholder="Ex: 50"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Motif</label>
        <input
          className="input"
          type="text"
          placeholder="Bonus, promotion, compensation…"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
      </div>
    </SlideOver>
  );
}

function BulkTierSlideOver({
  isOpen,
  count,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onSubmit: (tier: string) => void;
  loading: boolean;
}) {
  const [tier, setTier] = useState('');
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Changer tier — ${count} users`}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => tier && onSubmit(tier)}
            disabled={loading || !tier}
          >
            {loading ? 'En cours…' : `Appliquer à ${count} users`}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Nouveau tier</label>
        <select className="select" value={tier} onChange={e => setTier(e.target.value)} style={{ width: '100%' }}>
          <option value="">Choisir un tier…</option>
          <option value="paid">Paid</option>
          <option value="free">Free</option>
          <option value="demo">Demo</option>
          <option value="guest">Guest</option>
        </select>
      </div>
    </SlideOver>
  );
}

function BulkNotifySlideOver({
  isOpen,
  count,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onSubmit: (title: string, message: string) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Notification — ${count} users`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => title && message && onSubmit(title, message)}
            disabled={loading || !title || !message}
          >
            {loading ? 'En cours...' : <>📤 Envoyer a {count} users</>}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Titre</label>
        <input
          className="input"
          type="text"
          placeholder="Titre de la notification…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Message</label>
        <textarea
          className="input"
          rows={4}
          placeholder="Corps du message…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
    </SlideOver>
  );
}
