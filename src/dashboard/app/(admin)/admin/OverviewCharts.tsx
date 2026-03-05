'use client';

import { useState, useEffect } from 'react';
import { RevenueAreaChart, UserGrowthBarChart, TopClientsTable, DateRangePicker } from '../AdminCharts';
import { getToken, API_BASE } from '@/lib/client-fetch';

type Period = '7d' | '30d' | '90d';

async function fetchWithToken<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch { return null; }
}

export default function OverviewCharts() {
  const [period, setPeriod] = useState<Period>('30d');
  const [revenue, setRevenue] = useState<Array<{ date: string; revenue: number; cost: number; margin: number }>>([]);
  const [growth, setGrowth] = useState<Array<{ date: string; newUsers: number }>>([]);
  const [topClients, setTopClients] = useState<Array<{
    id: string; email: string; displayName: string; tier: string;
    totalDeposited: number; totalSpent: number; balance: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWithToken<typeof revenue>(`/analytics/revenue-trend?period=${period}`),
      fetchWithToken<typeof growth>(`/analytics/user-growth?period=${period}`),
    ]).then(([rev, grow]) => {
      setRevenue(rev ?? []);
      setGrowth(grow ?? []);
      setLoading(false);
    });
  }, [period]);

  // Top clients: fetch once
  useEffect(() => {
    fetchWithToken<typeof topClients>('/analytics/top-clients?limit=10')
      .then(data => { if (data) setTopClients(data); });
  }, []);

  return (
    <>
      {/* ── Revenue + User Growth with period picker ── */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Tendances</div>
          <DateRangePicker value={period} onChange={setPeriod} />
        </div>
        <div className="grid-2">
          <div className="card" style={{ padding: 16 }}>
            <div className="text-md font-bold mb-12">Revenus & Marge</div>
            {loading ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 8 }} />
              </div>
            ) : (
              <RevenueAreaChart data={revenue} />
            )}
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="text-md font-bold mb-12">Nouveaux utilisateurs</div>
            {loading ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 8 }} />
              </div>
            ) : (
              <UserGrowthBarChart data={growth} />
            )}
          </div>
        </div>
      </div>

      {/* ── Top clients ── */}
      <div className="section">
        <div className="section-title">Top 10 Clients</div>
        <div className="card" style={{ padding: 16 }}>
          <TopClientsTable clients={topClients} />
        </div>
      </div>
    </>
  );
}
