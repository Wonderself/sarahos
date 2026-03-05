import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface Referral {
  id: string;
  referrerEmail: string; referrerName: string; commissionRate: number;
  referredEmail: string; referredName: string; referredTier: string;
  referredAt: string; referredDeposited: number;
}
interface ReferralsData {
  referrals: Referral[];
  stats: { total: number; active: number };
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function ReferralsPage() {
  let data: ReferralsData = { referrals: [], stats: { total: 0, active: 0 } };
  try {
    data = await api.getReferrals() as unknown as ReferralsData;
  } catch { /* empty */ }

  const { referrals, stats } = data;

  // Group by referrer
  const byReferrer = referrals.reduce<Record<string, { name: string; email: string; rate: number; count: number; totalDeposited: number }>>((acc, r) => {
    if (!acc[r.referrerEmail]) {
      acc[r.referrerEmail] = { name: r.referrerName, email: r.referrerEmail, rate: r.commissionRate, count: 0, totalDeposited: 0 };
    }
    acc[r.referrerEmail]!.count++;
    acc[r.referrerEmail]!.totalDeposited += r.referredDeposited;
    return acc;
  }, {});
  const topReferrers = Object.values(byReferrer).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Réseau de Parrainage</h1>
          <p className="page-subtitle">Vue complète des affiliations et commissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Total Parrainages</span>
          <span className="stat-value stat-value-sm">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Filleuls Actifs</span>
          <span className="stat-value stat-value-sm text-success">{stats.active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Taux commission</span>
          <span className="stat-value stat-value-sm text-accent">5%</span>
          <span className="text-xs text-muted">après 5000 users</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Parrains</span>
          <span className="stat-value stat-value-sm">{topReferrers.length}</span>
        </div>
      </div>

      {/* Info box */}
      <div className="alert alert-info section" style={{ fontSize: 12 }}>
        🎯 <strong>Politique Freenzy.io :</strong> Les 5 000 premiers utilisateurs bénéficient d'une commission à <strong>0%</strong> à vie (verrouillée à l'inscription). Après le 5 000ème user, le taux passe à 5%.
      </div>

      {/* Top referrers */}
      {topReferrers.length > 0 && (
        <div className="section">
          <div className="section-title">Top Parrains</div>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}>#</th>
                  <th>Parrain</th>
                  <th className="text-right">Filleuls</th>
                  <th className="text-right hide-mobile">Dépôts (cr)</th>
                  <th className="text-right">Taux</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((r, i) => (
                  <tr key={r.email}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td className="text-right font-semibold">{r.count}</td>
                    <td className="text-right hide-mobile">{(r.totalDeposited / 1_000_000).toFixed(2)}</td>
                    <td className="text-right">
                      <span className={`badge ${r.rate === 0 ? 'badge-success' : 'badge-warning'}`}>
                        {r.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All referrals */}
      <div className="section">
        <div className="section-title">Tous les parrainages ({referrals.length})</div>
        {referrals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
            <div>Aucun parrainage enregistré pour l'instant.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parrain</th>
                  <th className="hide-mobile">Filleul</th>
                  <th>Tier</th>
                  <th className="text-right hide-mobile">Dépôts (cr)</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.referrerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.referrerEmail}</div>
                      <div className="show-mobile" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>→ {r.referredName}</div>
                    </td>
                    <td className="hide-mobile">
                      <div style={{ fontSize: 13 }}>{r.referredName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.referredEmail}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{r.referredTier}</span>
                    </td>
                    <td className="text-right text-sm hide-mobile">{(r.referredDeposited / 1_000_000).toFixed(2)} cr</td>
                    <td className="text-right text-sm text-muted">{fmt(r.referredAt)}</td>
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
