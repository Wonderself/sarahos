'use client';

import { useState, useEffect } from 'react';
import { RevenueAreaChart, UserGrowthBarChart, DateRangePicker } from '../AdminCharts';
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
  const [period, setPeriod] = useState<Period>('7d');
  const [revenue, setRevenue] = useState<Array<{ date: string; revenue: number; cost: number; margin: number }>>([]);
  const [growth, setGrowth] = useState<Array<{ date: string; newUsers: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'revenue' | 'users'>('revenue');

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

  return (
    <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header: tabs + period picker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`chat-mode-pill${activeTab === 'revenue' ? ' active' : ''}`}
            style={{ fontSize: 11, padding: '3px 10px' }}
          >
            Revenus
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`chat-mode-pill${activeTab === 'users' ? ' active' : ''}`}
            style={{ fontSize: 11, padding: '3px 10px' }}
          >
            Users
          </button>
        </div>
        <DateRangePicker value={period} onChange={setPeriod} />
      </div>

      {/* Chart */}
      <div className="admin-chart-compact">
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: '80%', borderRadius: 8 }} />
          </div>
        ) : activeTab === 'revenue' ? (
          <RevenueAreaChart data={revenue} />
        ) : (
          <UserGrowthBarChart data={growth} />
        )}
      </div>
    </div>
  );
}
