'use client';

import { useState } from 'react';

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

export function UserActions({ userId, userName, isActive }: { userId: string; userName: string; isActive: boolean }) {
  const [loading, setLoading] = useState('');

  async function doAction(action: string, params: Record<string, unknown>, confirm?: string) {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(action);
    try {
      await callAction(action, params);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button
        onClick={() => {
          const amount = window.prompt('Crédits à déposer (en micro-credits, ex: 100000000 = 100 cr):');
          if (!amount) return;
          doAction('depositCredits', { userId, amount: Number(amount) });
        }}
        className="btn btn-primary btn-xs"
        disabled={loading === 'depositCredits'}
      >
        {loading === 'depositCredits' ? '...' : '💰 Crédits'}
      </button>
      <button
        onClick={() => {
          const role = window.prompt(`Nouveau rôle pour ${userName}? (admin, operator, viewer):`);
          if (!role) return;
          doAction('updateUser', { id: userId, data: { role } });
        }}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'updateUser'}
      >
        {loading === 'updateUser' ? '...' : 'Role'}
      </button>
      <button
        onClick={() => {
          const tier = window.prompt(`Nouveau tier pour ${userName} ? (paid, free, demo, guest) :`);
          if (!tier) return;
          doAction('updateUser', { id: userId, data: { tier } });
        }}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'updateUser'}
      >
        Tier
      </button>
      <button
        onClick={() => doAction('resetUserKey', { id: userId }, `Régénérer la clé API de ${userName}?`)}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'resetUserKey'}
      >
        {loading === 'resetUserKey' ? '...' : 'Reset Key'}
      </button>
      {isActive ? (
        <button
          onClick={() => doAction('deleteUser', { id: userId }, `Désactiver ${userName}?`)}
          className="btn btn-danger btn-xs"
          disabled={loading === 'deleteUser'}
        >
          {loading === 'deleteUser' ? '...' : 'Désactiver'}
        </button>
      ) : (
        <button
          onClick={() => doAction('updateUser', { id: userId, data: { isActive: true } })}
          className="btn btn-primary btn-xs"
          disabled={loading === 'updateUser'}
        >
          Réactiver
        </button>
      )}
    </div>
  );
}

export function CreateUserButton() {
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const email = window.prompt('Email du nouvel utilisateur:');
    if (!email) return;
    const name = window.prompt('Nom complet:');
    if (!name) return;
    const role = window.prompt('Role (admin, operator, viewer):', 'viewer');
    if (!role) return;
    const tier = window.prompt('Tier (paid, free, demo, guest):', 'free');
    if (!tier) return;

    setLoading(true);
    try {
      await callAction('createUser', { email, displayName: name, role, tier });
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCreate} className="btn btn-primary" disabled={loading}>
      {loading ? 'Création...' : '+ Nouveau User'}
    </button>
  );
}

interface UserEntry {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
  isActive: boolean;
  dailyApiCalls: number;
  dailyApiLimit: number;
  createdAt: string;
  lastLoginAt: string | null;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 60%, 45%)`;
}

const USERS_PER_PAGE = 15;

export function PaginatedUserTable({ users, tierColors, roleColors }: { users: UserEntry[]; tierColors: Record<string, string>; roleColors: Record<string, string> }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const pageUsers = users.slice(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE);

  return (
    <div className="section">
      <div className="section-title">
        Tous les utilisateurs
        <span className="section-subtitle">— {users.length} enregistres</span>
      </div>
      <div className="card table-responsive" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Role</th>
              <th>Tier</th>
              <th className="text-center">API / jour</th>
              <th className="text-center">Statut</th>
              <th>Inscription</th>
              <th>Dernier login</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: avatarColor(user.email) }}>
                      {getInitials(user.displayName)}
                    </div>
                    <div>
                      <div className="font-medium text-md">{user.displayName}</div>
                      <div className="text-xs text-tertiary">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${roleColors[user.role] ?? 'badge-neutral'}`}>{user.role}</span></td>
                <td><span className={`badge ${tierColors[user.tier] ?? 'badge-neutral'}`}>{user.tier}</span></td>
                <td className="text-center">
                  <div className="text-md font-semibold">{user.dailyApiCalls}</div>
                  <div style={{ fontSize: 10 }} className="text-muted">/ {user.dailyApiLimit}</div>
                  <div className="progress-bar" style={{ marginTop: 4, maxWidth: 80, margin: '4px auto 0' }}>
                    <div className="progress-bar-fill" style={{
                      width: `${Math.min((user.dailyApiCalls / user.dailyApiLimit) * 100, 100)}%`,
                      background: user.dailyApiCalls > user.dailyApiLimit * 0.9 ? 'var(--danger)' : user.dailyApiCalls > user.dailyApiLimit * 0.7 ? 'var(--warning)' : 'var(--success)',
                    }} />
                  </div>
                </td>
                <td className="text-center">
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="text-sm text-tertiary">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="text-sm text-tertiary">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '\u2014'}
                </td>
                <td className="text-center">
                  <UserActions userId={user.id} userName={user.displayName} isActive={user.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-center items-center gap-8 mt-12">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn btn-secondary btn-sm"
          >
            Precedent
          </button>
          <span className="text-sm text-secondary">
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn btn-secondary btn-sm"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

export function DepositButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDeposit() {
    const amount = window.prompt('Montant en micro-crédits (100000000 = 100 cr) :');
    if (!amount) return;
    setLoading(true);
    try {
      await callAction('depositCredits', { userId, amount: Number(amount) });
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDeposit} className="btn btn-primary btn-xs" disabled={loading}>
      {loading ? '...' : '💰 Déposer'}
    </button>
  );
}
