import { api } from '@/lib/api-client';
import { CampaignActions } from './CampaignActions';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  email: string;
  displayName: string;
}

interface CampaignsData {
  campaigns: Campaign[];
  stats: { total: number; drafts: number; pending: number; approved: number; active: number; completed: number };
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-neutral',
  pending_approval: 'badge-warning',
  approved: 'badge-success',
  active: '',
  completed: 'badge-neutral',
  rejected: 'badge-danger',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  pending_approval: 'En attente',
  approved: 'Approuvée',
  active: 'Active',
  completed: 'Terminée',
  rejected: 'Rejetée',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtBudget(n: number) {
  return (n / 1_000_000).toFixed(2) + ' cr';
}

export default async function CampaignsPage() {
  let data: CampaignsData = { campaigns: [], stats: { total: 0, drafts: 0, pending: 0, approved: 0, active: 0, completed: 0 } };
  try {
    data = await api.getAdminCampaigns() as unknown as CampaignsData;
  } catch { /* empty */ }

  const { campaigns, stats } = data;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Campagnes</h1>
          <p className="page-subtitle">Suivi de toutes les campagnes marketing utilisateurs</p>
        </div>
      </div>

      {/* KPIs - Row 1 */}
      <div className="grid-3 section">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value stat-value-sm">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Brouillons</span>
          <span className="stat-value stat-value-sm">{stats.drafts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">En attente</span>
          <span className="stat-value stat-value-sm text-warning">{stats.pending}</span>
        </div>
      </div>

      {/* KPIs - Row 2 */}
      <div className="grid-3 section" style={{ marginTop: 0 }}>
        <div className="stat-card">
          <span className="stat-label">Approuvées</span>
          <span className="stat-value stat-value-sm text-success">{stats.approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Actives</span>
          <span className="stat-value stat-value-sm text-accent">{stats.active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Terminées</span>
          <span className="stat-value stat-value-sm">{stats.completed}</span>
        </div>
      </div>

      {/* Table */}
      <div className="section">
        <div className="section-title">Toutes les campagnes ({campaigns.length})</div>
        {campaigns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 8 }}>📢</div>
            <div>Aucune campagne enregistrée pour l&apos;instant.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Nom campagne</th>
                  <th className="hide-mobile">Type</th>
                  <th>Statut</th>
                  <th className="text-right hide-mobile">Budget</th>
                  <th className="text-right hide-mobile">Dépensé</th>
                  <th className="text-right">Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{c.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                    </td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="hide-mobile text-sm">{c.type}</td>
                    <td>
                      {c.status === 'active' ? (
                        <span className="badge" style={{ background: '#1A1A1A', color: '#fff' }}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      ) : (
                        <span className={`badge ${STATUS_BADGE[c.status] ?? 'badge-neutral'}`}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      )}
                    </td>
                    <td className="text-right hide-mobile text-sm">{fmtBudget(c.budget)}</td>
                    <td className="text-right hide-mobile text-sm">{fmtBudget(c.spent)}</td>
                    <td className="text-right text-sm text-muted">{fmt(c.createdAt)}</td>
                    <td>
                      <CampaignActions campaignId={c.id} currentStatus={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
