'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

interface DocStats {
  totalDocuments: number;
  totalStorageBytes: number;
  avgTokensPerDoc: number;
  byType: Array<{ type: string; count: number }>;
  topUsers: Array<{ userId: string; email: string; docCount: number; storageBytes: number }>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsAnalyticsPage() {
  const [stats, setStats] = useState<DocStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/analytics/documents`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) { setError(`Erreur ${res.status}`); setLoading(false); return; }
        setStats(await res.json() as DocStats);
      } catch { setError('Impossible de contacter l\'API'); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8 admin-page-scrollable"><div className="loading-spinner" /></div>;
  if (error) return (
    <div className="p-8 max-w-5xl mx-auto admin-page-scrollable">
      <h1 className="text-2xl font-bold mb-4">Analytics — Documents</h1>
      <div className="card p-6 text-center" style={{ color: 'var(--error, #DC2626)' }}>Erreur : {error}</div>
    </div>
  );

  const data = stats ?? {
    totalDocuments: 0,
    totalStorageBytes: 0,
    avgTokensPerDoc: 0,
    byType: [],
    topUsers: [],
  };

  return (
    <div className="p-8 max-w-5xl mx-auto admin-page-scrollable">
      <h1 className="text-2xl font-bold mb-2">Analytics — Documents</h1>
      <p className="text-sm text-[var(--muted)] mb-6">Uploads, stockage et consommation tokens par contexte.</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[#1A1A1A]">{data.totalDocuments}</div>
          <div className="text-xs text-[var(--muted)]">Documents uploades</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{formatBytes(data.totalStorageBytes)}</div>
          <div className="text-xs text-[var(--muted)]">Stockage total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{data.avgTokensPerDoc}</div>
          <div className="text-xs text-[var(--muted)]">Tokens moyen / doc</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* By type */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Repartition par type</h3>
          {data.byType.length > 0 ? data.byType.map(t => (
            <div key={t.type} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-mono" style={{ textTransform: 'uppercase' }}>{t.type}</span>
              <span className="text-sm font-semibold">{t.count}</span>
            </div>
          )) : (
            <div className="text-sm text-[var(--muted)]">Aucun document pour le moment</div>
          )}
        </div>

        {/* Top users */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Top utilisateurs (stockage)</h3>
          {data.topUsers.length > 0 ? data.topUsers.map(u => (
            <div key={u.userId} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div>
                <div className="text-sm">{u.email}</div>
                <div className="text-xs text-[var(--muted)]">{u.docCount} docs</div>
              </div>
              <span className="text-sm font-semibold">{formatBytes(u.storageBytes)}</span>
            </div>
          )) : (
            <div className="text-sm text-[var(--muted)]">Aucun utilisateur</div>
          )}
        </div>
      </div>
    </div>
  );
}
