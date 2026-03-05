'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

interface StudioStats {
  videoGenerations: number;
  photoGenerations: number;
  totalCost: number;
  avgCostPerGeneration: number;
  topWorkflows: Array<{ workflow: string; count: number }>;
  recentGenerations: Array<{ id: string; type: string; workflow: string; createdAt: string; cost: number }>;
}

export default function StudioAnalyticsPage() {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/analytics/studio`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) { setError(`Erreur ${res.status}`); setLoading(false); return; }
        setStats(await res.json() as StudioStats);
      } catch { setError('Impossible de contacter l\'API'); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8"><div className="loading-spinner" /></div>;
  if (error) return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Analytics — Studio Creatif</h1>
      <div className="card p-6 text-center" style={{ color: 'var(--error, #ef4444)' }}>Erreur : {error}</div>
    </div>
  );

  const data = stats ?? {
    videoGenerations: 0,
    photoGenerations: 0,
    totalCost: 0,
    avgCostPerGeneration: 0,
    topWorkflows: [],
    recentGenerations: [],
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Analytics — Studio Creatif</h1>
      <p className="text-sm text-[var(--muted)] mb-6">Video (D-ID) et Photo (Nano Banana) — Generation et couts.</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[#8b5cf6]">{data.videoGenerations}</div>
          <div className="text-xs text-[var(--muted)]">Videos generees</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[#06b6d4]">{data.photoGenerations}</div>
          <div className="text-xs text-[var(--muted)]">Photos generees</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{data.totalCost.toFixed(1)}</div>
          <div className="text-xs text-[var(--muted)]">Credits consommes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{data.avgCostPerGeneration.toFixed(1)}</div>
          <div className="text-xs text-[var(--muted)]">Cout moyen/generation</div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Repartition Video / Photo</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `conic-gradient(#8b5cf6 ${data.videoGenerations / Math.max(data.videoGenerations + data.photoGenerations, 1) * 360}deg, #06b6d4 0deg)`,
            }} />
            <div>
              <div className="flex items-center gap-2 text-sm mb-1">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8b5cf6' }} />
                Video: {data.videoGenerations}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#06b6d4' }} />
                Photo: {data.photoGenerations}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Top Workflows</h3>
          {data.topWorkflows.length > 0 ? data.topWorkflows.map(w => (
            <div key={w.workflow} className="flex items-center justify-between py-1">
              <span className="text-sm">{w.workflow}</span>
              <span className="text-sm font-semibold">{w.count}</span>
            </div>
          )) : (
            <div className="text-sm text-[var(--muted)]">Aucune generation pour le moment</div>
          )}
        </div>
      </div>

      {/* Recent generations */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-4">Dernieres generations</h3>
        {data.recentGenerations.length > 0 ? (
          <table style={{ width: '100%', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '6px 0' }}>Type</th>
                <th>Workflow</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {data.recentGenerations.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '6px 0' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: g.type === 'video' ? '#f5f3ff' : '#ecfdf5',
                      color: g.type === 'video' ? '#7c3aed' : '#059669',
                    }}>
                      {g.type}
                    </span>
                  </td>
                  <td>{g.workflow}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{ textAlign: 'right' }}>{g.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-[var(--muted)]">Aucune generation pour le moment</div>
        )}
      </div>
    </div>
  );
}
