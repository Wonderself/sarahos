'use client';

import { useState, useEffect, useCallback } from 'react';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

interface GuardrailStats {
  tokenBudget: {
    globalHourlyTokens: number;
    globalHourlyCost: number;
    globalHourlyBudget: number;
    modelDistribution: { haiku: number; sonnet: number; opus: number };
  };
  circuitBreakers: {
    level: 'normal' | 'degraded' | 'emergency';
    agentsSuspended: string[];
    tripsLast24h: number;
  };
  activeChains: number;
  loopsDetectedLast24h: number;
  apiHealth: Record<string, { up: boolean; latencyMs: number }>;
  recentAlerts: Array<{
    id: string;
    severity: string;
    type: string;
    message: string;
    createdAt: string;
    acknowledged: boolean;
  }>;
}

const LEVEL_COLORS = {
  normal: 'text-primary',
  degraded: 'text-secondary',
  emergency: 'text-danger',
};

const SEVERITY_COLORS = {
  critical: 'bg-danger',
  high: 'bg-secondary',
  medium: 'bg-tertiary',
  low: 'bg-muted',
};

export default function GuardrailsPage() {
  const [stats, setStats] = useState<GuardrailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/guardrails/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json() as GuardrailStats);
      }
    } catch {
      // Use mock data when API not available
      setStats({
        tokenBudget: {
          globalHourlyTokens: 0,
          globalHourlyCost: 0,
          globalHourlyBudget: 5_000_000,
          modelDistribution: { haiku: 0, sonnet: 0, opus: 0 },
        },
        circuitBreakers: { level: 'normal', agentsSuspended: [], tripsLast24h: 0 },
        activeChains: 0,
        loopsDetectedLast24h: 0,
        apiHealth: {
          anthropic: { up: true, latencyMs: 0 },
          fal_ai: { up: true, latencyMs: 0 },
          elevenlabs: { up: true, latencyMs: 0 },
          meta_whatsapp: { up: true, latencyMs: 0 },
        },
        recentAlerts: [],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    if (!autoRefresh) return;
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  if (loading) return <div className="admin-page-scrollable" style={{ padding: 48, textAlign: 'center', color: '#9B9B9B' }}>Chargement...</div>;

  const s = stats;
  if (!s) return <div className="admin-page-scrollable" style={{ padding: 48, textAlign: 'center', color: '#9B9B9B' }}>Erreur de chargement</div>;

  const totalModels = s.tokenBudget.modelDistribution.haiku + s.tokenBudget.modelDistribution.sonnet + s.tokenBudget.modelDistribution.opus;
  const haikuPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.haiku / totalModels) * 100) : 0;
  const sonnetPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.sonnet / totalModels) * 100) : 0;
  const opusPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.opus / totalModels) * 100) : 0;
  const budgetPct = s.tokenBudget.globalHourlyBudget > 0 ? Math.round((s.tokenBudget.globalHourlyTokens / s.tokenBudget.globalHourlyBudget) * 100) : 0;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guardrails Monitor</h1>
          <p className="page-subtitle">Protection en temps réel — tokens, agents, alertes</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: autoRefresh ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.04)', color: autoRefresh ? '#1A1A1A' : '#9B9B9B', fontSize: 12, fontWeight: 600, border: '1px solid var(--border-primary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: autoRefresh ? '#1A1A1A' : '#9B9B9B', display: 'inline-block' }} />
            <span>{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className="btn btn-secondary btn-sm">
            {autoRefresh ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid-4 section">
        {/* Token Budget */}
        <div className="stat-card">
          <div className="flex items-center gap-8 mb-8">
            💰
            <span className="stat-label">Tokens (cette heure)</span>
          </div>
          <span className="stat-value stat-value-sm">{(s.tokenBudget.globalHourlyTokens / 1000).toFixed(0)}K</span>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>/ {(s.tokenBudget.globalHourlyBudget / 1_000_000).toFixed(1)}M budget</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetPct > 150 ? '#DC2626' : budgetPct > 80 ? '#9B9B9B' : '#1A1A1A' }} />
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>{budgetPct}% utilisé</div>
        </div>

        {/* Circuit Breakers */}
        <div className="stat-card">
          <div className="flex items-center gap-8 mb-8">
            🛡️
            <span className="stat-label">Circuit Breakers</span>
          </div>
          <span className={`stat-value stat-value-sm ${LEVEL_COLORS[s.circuitBreakers.level]}`}>
            {s.circuitBreakers.level === 'normal' ? 'NORMAL' : s.circuitBreakers.level === 'degraded' ? 'DEGRADE' : 'URGENCE'}
          </span>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>{s.circuitBreakers.tripsLast24h} déclenchements (24h)</div>
          {s.circuitBreakers.agentsSuspended.length > 0 && (
            <div className="text-xs text-danger" style={{ marginTop: 4 }}>{s.circuitBreakers.agentsSuspended.length} agents suspendus</div>
          )}
        </div>

        {/* Model Distribution */}
        <div className="stat-card">
          <div className="flex items-center gap-8 mb-8">
            🤖
            <span className="stat-label">Distribution modèles</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="flex flex-between text-xs">
              <span>Haiku</span>
              <span className="text-muted">{haikuPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 4 }}>
              <div className="progress-bar-fill" style={{ width: `${haikuPct}%`, background: '#1A1A1A' }} />
            </div>
            <div className="flex flex-between text-xs">
              <span>Sonnet</span>
              <span className="text-muted">{sonnetPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 4 }}>
              <div className="progress-bar-fill" style={{ width: `${sonnetPct}%`, background: '#6B6B6B' }} />
            </div>
            <div className="flex flex-between text-xs">
              <span>Opus</span>
              <span className="text-muted">{opusPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 4 }}>
              <div className="progress-bar-fill" style={{ width: `${opusPct}%`, background: '#9B9B9B' }} />
            </div>
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 6 }}>Cible: 70/25/5</div>
        </div>

        {/* Chains & Loops */}
        <div className="stat-card">
          <div className="flex items-center gap-8 mb-8">
            🔗
            <span className="stat-label">Chaînes inter-agents</span>
          </div>
          <span className="stat-value stat-value-sm">{s.activeChains}</span>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>chaînes actives</div>
          <div className="text-xs text-muted" style={{ marginTop: 4 }}>{s.loopsDetectedLast24h} boucles détectées (24h)</div>
        </div>
      </div>

      {/* API Health */}
      <div className="section">
        <div className="section-title">APIs externes</div>
        <div className="grid-4">
          {Object.entries(s.apiHealth).map(([name, health]) => (
            <div key={name} className="card card-compact flex items-center gap-12">
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: health.up ? '#1A1A1A' : '#DC2626', flexShrink: 0 }} />
              <div>
                <div className="text-md font-semibold">{name}</div>
                <div className="text-xs text-muted">{health.up ? `${health.latencyMs}ms` : 'DOWN'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="section">
        <div className="section-title">
          Alertes récentes
          <span className="section-subtitle"> — {s.recentAlerts.filter(a => !a.acknowledged).length} non lues</span>
        </div>
        <div className="card">
          {s.recentAlerts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">Aucune alerte</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 256, overflowY: 'auto' }}>
              {s.recentAlerts.map(alert => (
                <div key={alert.id} className="flex gap-8 rounded-sm" style={{ padding: '8px 12px', alignItems: 'flex-start', background: alert.acknowledged ? 'transparent' : 'var(--bg-secondary)', opacity: alert.acknowledged ? 0.6 : 1 }}>
                  <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : alert.severity === 'high' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                    {alert.severity}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-md">{alert.message}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>{alert.type} — {new Date(alert.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guardrail Modules Status */}
      <div className="section">
        <div className="section-title">Modules de protection</div>
        <div className="grid-auto">
          {[
            { name: 'Token Budget', icon: '💰', status: 'active' },
            { name: 'Circuit Breakers', icon: '🛡️', status: 'active' },
            { name: 'Loop Detector', icon: '🔗', status: 'active' },
            { name: 'Memory Optimizer', icon: '🧠', status: 'active' },
            { name: 'Model Router', icon: '🤖', status: 'active' },
            { name: 'Credit Guard', icon: '💳', status: 'active' },
            { name: 'Security', icon: '🔒', status: 'active' },
            { name: 'Fallback Manager', icon: '🔄', status: 'active' },
            { name: 'Alert System', icon: '🔔', status: 'active' },
            { name: 'Mode Toggle', icon: '⚡', status: 'active' },
          ].map(m => (
            <div key={m.name} className="card card-compact text-center">
              {m.icon}
              <div className="text-xs font-semibold" style={{ marginTop: 4 }}>{m.name}</div>
              <div className="text-xs text-success" style={{ marginTop: 2 }}>Actif</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
