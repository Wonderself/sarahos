import { api, type UserEntry, type AdminStats } from '@/lib/api-client';
import { UserActions, CreateUserButton, DepositButton } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const tierColors: Record<string, string> = { paid: 'badge-success', free: 'badge-info', demo: 'badge-warning', guest: 'badge-neutral' };
const roleColors: Record<string, string> = { admin: 'badge-danger', system: 'badge-purple', operator: 'badge-warning', viewer: 'badge-neutral' };

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 60%, 45%)`;
}

export default async function UsersPage() {
  let users: UserEntry[] = [];
  let stats: AdminStats | undefined;
  let error: string | undefined;

  try {
    [users, stats] = await Promise.all([
      api.getUsers(),
      api.getAdminStats(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load users';
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Utilisateurs</h1>
        </div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const raw = stats as unknown as Record<string, unknown>;
  const byTier = (raw?.['byTier'] as Record<string, number>) ?? {};
  const byRole = (raw?.['byRole'] as Record<string, number>) ?? {};
  const totalUsers = Object.values(byTier).reduce((a, b) => a + b, 0);
  const activeCount = Number(raw?.['active'] ?? totalUsers);

  // Sort by most recent first
  const sorted = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Top API consumers
  const topConsumers = [...users].sort((a, b) => b.dailyApiCalls - a.dailyApiCalls).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{totalUsers} comptes — {activeCount} actifs</p>
        </div>
        <div className="page-actions">
          <CreateUserButton />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-5 section">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value stat-value-sm">{totalUsers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Actifs</span>
          <span className="stat-value stat-value-sm text-success">{activeCount}</span>
        </div>
        {Object.entries(byTier).map(([tier, count]) => (
          <div key={tier} className="stat-card">
            <span className="stat-label">{tier}</span>
            <span className="stat-value stat-value-sm">{count}</span>
          </div>
        ))}
      </div>

      {/* Two columns: Top consumers + Role distribution */}
      <div className="grid-2 section">
        <div className="card">
          <div className="text-md font-semibold mb-16">Top Consommateurs API</div>
          {topConsumers.map((u, i) => (
            <div key={u.id} className="flex items-center gap-12" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-primary)' }}>
              <span className="text-sm text-muted" style={{ width: 20 }}>#{i + 1}</span>
              <div className="avatar avatar-sm" style={{ background: avatarColor(u.email) }}>{getInitials(u.displayName)}</div>
              <div className="flex-1">
                <div className="text-md font-medium">{u.displayName}</div>
                <div className="text-xs text-tertiary">{u.email}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: u.dailyApiCalls > u.dailyApiLimit * 0.8 ? 'var(--warning)' : 'var(--text-primary)' }}>
                  {u.dailyApiCalls}
                </div>
                <div style={{ fontSize: 10 }} className="text-muted">/ {u.dailyApiLimit}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="text-md font-semibold mb-16">Répartition par Rôle</div>
          {Object.entries(byRole).map(([role, count]) => (
            <div key={role} className="mb-12">
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md" style={{ textTransform: 'capitalize' }}>{role}</span>
                <span className="text-md font-semibold">{count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(count / totalUsers) * 100}%`, background: role === 'admin' ? 'var(--danger)' : role === 'system' ? 'var(--purple)' : role === 'operator' ? 'var(--warning)' : 'var(--text-tertiary)' }} />
              </div>
            </div>
          ))}

          <div className="separator" />

          <div className="text-md font-semibold mb-12">Répartition par Tier</div>
          {Object.entries(byTier).map(([tier, count]) => (
            <div key={tier} className="mb-12">
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md" style={{ textTransform: 'capitalize' }}>{tier}</span>
                <span className="text-md font-semibold">{count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(count / totalUsers) * 100}%`, background: tier === 'paid' ? 'var(--success)' : tier === 'free' ? 'var(--info)' : tier === 'demo' ? 'var(--warning)' : 'var(--text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full User Table */}
      <div className="section">
        <div className="section-title">
          Tous les utilisateurs
          <span className="section-subtitle">— {users.length} enregistrés</span>
        </div>
        <div className="card table-responsive" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Tier</th>
                <th className="text-center">API / jour</th>
                <th className="text-center">Statut</th>
                <th>Inscription</th>
                <th>Dernier login</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((user) => (
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
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="text-center">
                    <UserActions userId={user.id} userName={user.displayName} isActive={user.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-muted mt-8">
        API: POST /admin/users (créer) | PATCH /admin/users/:id (modifier) | DELETE /admin/users/:id (désactiver) | POST /admin/users/:id/reset-key (régénérer clé)
      </div>
    </div>
  );
}
