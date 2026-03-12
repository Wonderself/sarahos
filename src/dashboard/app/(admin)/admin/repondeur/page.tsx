'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

interface RepondeurStats {
  totalConfigs: number;
  activeConfigs: number;
  totalMessages: number;
  messagesToday: number;
  totalOrders: number;
  pendingOrders: number;
  totalSummaries: number;
  totalTokensUsed: number;
  totalBilledCredits: number;
}

interface Classification { classification: string; count: number }
interface DailyVolume { date: string; count: number }
interface Config {
  userId: string;
  userEmail: string;
  isActive: boolean;
  activeMode: string;
  activeStyle: string;
  messageCount: number;
  orderCount: number;
  lastMessageAt: string | null;
  tokensUsed: number;
  billedCredits: number;
}

export default function AdminRepondeurPage() {
  const [tab, setTab] = useState<'stats' | 'configs'>('stats');
  const [stats, setStats] = useState<RepondeurStats | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/repondeur/admin/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { setError(`Erreur ${res.status}`); setLoading(false); return; }
      const data = await res.json() as { stats: RepondeurStats; classifications: Classification[]; dailyVolume: DailyVolume[] };
      setStats(data.stats);
      setClassifications(data.classifications ?? []);
      setDailyVolume(data.dailyVolume ?? []);
    } catch { setError('Impossible de charger les stats'); }
    setLoading(false);
  }, []);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/repondeur/admin/configs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { setError(`Erreur ${res.status}`); setLoading(false); return; }
      const data = await res.json() as { configs: Config[] };
      setConfigs(data.configs ?? []);
    } catch { setError('Impossible de charger les configs'); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'stats') loadStats();
    else loadConfigs();
  }, [tab, loadStats, loadConfigs]);

  return (
    <div className="p-6 max-w-6xl mx-auto admin-page-scrollable">
      <div className="page-header mb-6">
        <h1 className="page-title">Répondeur IA — Admin</h1>
        <p className="page-subtitle">Statistiques globales et configurations utilisateurs</p>
      </div>

      {/* Tabs */}
      <div className="studio-tab-bar mb-6">
        <button className={`studio-tab${tab === 'stats' ? ' active' : ''}`} onClick={() => setTab('stats')}>
          Statistiques
        </button>
        <button className={`studio-tab${tab === 'configs' ? ' active' : ''}`} onClick={() => setTab('configs')}>
          Configurations
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />}
      {error && (
        <div className="card p-4 text-center" style={{ color: 'var(--error, #DC2626)' }}>
          {error}
        </div>
      )}

      {/* Stats tab */}
      {!loading && !error && tab === 'stats' && stats && (
        <div>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-value">{stats.totalConfigs}</div>
              <div className="stat-label">Configs totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#1A1A1A' }}>{stats.activeConfigs}</div>
              <div className="stat-label">Configs actives</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalMessages}</div>
              <div className="stat-label">Messages traités</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#1A1A1A' }}>{stats.messagesToday}</div>
              <div className="stat-label">Messages aujourd&apos;hui</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Commandes détectées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#9B9B9B' }}>{stats.pendingOrders}</div>
              <div className="stat-label">Commandes en attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalSummaries}</div>
              <div className="stat-label">Résumés générés</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalBilledCredits}</div>
              <div className="stat-label">Crédits facturés</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classifications */}
            <div className="card p-6">
              <h3 className="section-title mb-4">Répartition par classification</h3>
              {classifications.length === 0 ? (
                <div className="text-sm" style={{ color: 'var(--muted)' }}>Aucune donnée</div>
              ) : (
                <div>
                  {classifications.map(c => {
                    const total = classifications.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round(c.count / total * 100) : 0;
                    return (
                      <div key={c.classification} className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{c.classification || '—'}</span>
                          <span style={{ color: 'var(--muted)' }}>{c.count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#1A1A1A', borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily volume */}
            <div className="card p-6">
              <h3 className="section-title mb-4">Volume 7 derniers jours</h3>
              {dailyVolume.length === 0 ? (
                <div className="text-sm" style={{ color: 'var(--muted)' }}>Aucune donnée</div>
              ) : (
                <table style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '4px 0' }}>Date</th>
                      <th style={{ textAlign: 'right' }}>Messages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyVolume.map(d => (
                      <tr key={String(d.date)} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 0' }}>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configs tab */}
      {!loading && !error && tab === 'configs' && (
        <div className="card p-0 overflow-hidden">
          {configs.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
              Aucune configuration répondeur
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Statut</th>
                    <th>Mode</th>
                    <th>Style</th>
                    <th>Messages</th>
                    <th>Commandes</th>
                    <th>Crédits</th>
                    <th>Dernier message</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map(c => (
                    <tr key={c.userId}>
                      <td style={{ fontSize: 12 }}>{c.userEmail}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {c.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{c.activeMode || '—'}</td>
                      <td style={{ fontSize: 12 }}>{c.activeStyle || '—'}</td>
                      <td style={{ textAlign: 'right' }}>{c.messageCount}</td>
                      <td style={{ textAlign: 'right' }}>{c.orderCount}</td>
                      <td style={{ textAlign: 'right' }}>{c.billedCredits}</td>
                      <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
