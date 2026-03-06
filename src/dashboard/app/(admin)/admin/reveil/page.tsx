import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface Alarm {
  id: string;
  name: string;
  isActive: boolean;
  alarmTime: string;
  timezone: string;
  daysOfWeek: string;
  mode: string;
  deliveryMethod: string;
  lastTriggeredAt: string | null;
  lastTriggerStatus: string | null;
  createdAt: string;
  email: string;
  displayName: string;
}

interface AlarmsData {
  alarms: Alarm[];
  stats: { total: number; active: number; usersCount: number };
  byMode: Array<{ mode: string; count: number }>;
  byDelivery: Array<{ delivery_method: string; count: number }>;
}

const MODE_COLORS: Record<string, string> = {
  doux: '#22c55e',
  dur: '#ef4444',
  motivant: '#f59e0b',
  zen: '#06b6d4',
  energique: '#8b5cf6',
  drole: '#ec4899',
  sympa: '#10b981',
  fou: '#f97316',
};

const DELIVERY_LABELS: Record<string, string> = {
  phone_call: 'Appel',
  whatsapp_message: 'WhatsApp',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default async function ReveilPage() {
  let data: AlarmsData = { alarms: [], stats: { total: 0, active: 0, usersCount: 0 }, byMode: [], byDelivery: [] };
  try {
    data = await api.getAdminAlarms() as unknown as AlarmsData;
  } catch { /* empty */ }

  const { alarms, stats, byMode, byDelivery } = data;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Réveils Intelligents</h1>
          <p className="page-subtitle">Tous les réveils configurés par les utilisateurs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-3 section">
        <div className="stat-card">
          <span className="stat-label">Total réveils</span>
          <span className="stat-value stat-value-sm">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Actifs</span>
          <span className="stat-value stat-value-sm text-success">{stats.active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Users</span>
          <span className="stat-value stat-value-sm">{stats.usersCount}</span>
        </div>
      </div>

      {/* Mode distribution */}
      {byMode.length > 0 && (
        <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="text-sm font-semibold" style={{ marginRight: 4 }}>Modes:</span>
          {byMode.map(m => (
            <span
              key={m.mode}
              className="badge"
              style={{ background: MODE_COLORS[m.mode] ?? '#64748b', color: '#fff' }}
            >
              {m.mode}: {m.count}
            </span>
          ))}
        </div>
      )}

      {/* Delivery distribution */}
      {byDelivery.length > 0 && (
        <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 0 }}>
          <span className="text-sm font-semibold" style={{ marginRight: 4 }}>Delivery:</span>
          {byDelivery.map(d => (
            <span key={d.delivery_method} className="badge badge-neutral">
              {DELIVERY_LABELS[d.delivery_method] ?? d.delivery_method}: {d.count}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="section">
        <div className="section-title">Tous les réveils ({alarms.length})</div>
        {alarms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏰</div>
            <div>Aucun réveil configuré pour l&apos;instant.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Nom</th>
                  <th>Heure</th>
                  <th>Mode</th>
                  <th className="hide-mobile">Delivery</th>
                  <th>Actif?</th>
                  <th className="hide-mobile">Dernier déclenchement</th>
                  <th className="hide-mobile">Statut</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</div>
                    </td>
                    <td className="font-semibold">{a.name}</td>
                    <td className="text-sm">{a.alarmTime}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: MODE_COLORS[a.mode] ?? '#64748b', color: '#fff' }}
                      >
                        {a.mode}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <span className="badge badge-neutral">
                        {DELIVERY_LABELS[a.deliveryMethod] ?? a.deliveryMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${a.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {a.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="hide-mobile text-sm text-muted">{fmtTime(a.lastTriggeredAt)}</td>
                    <td className="hide-mobile">
                      {a.lastTriggerStatus ? (
                        <span className={`badge ${a.lastTriggerStatus === 'success' ? 'badge-success' : a.lastTriggerStatus === 'failed' ? 'badge-danger' : 'badge-neutral'}`}>
                          {a.lastTriggerStatus}
                        </span>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
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
