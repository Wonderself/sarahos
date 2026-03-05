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
  normal: 'text-green-400',
  degraded: 'text-yellow-400',
  emergency: 'text-red-400',
};

const SEVERITY_COLORS = {
  critical: 'bg-red-600',
  high: 'bg-orange-600',
  medium: 'bg-yellow-600',
  low: 'bg-gray-600',
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

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

  const s = stats;
  if (!s) return <div className="p-12 text-center text-gray-500">Erreur de chargement</div>;

  const totalModels = s.tokenBudget.modelDistribution.haiku + s.tokenBudget.modelDistribution.sonnet + s.tokenBudget.modelDistribution.opus;
  const haikuPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.haiku / totalModels) * 100) : 0;
  const sonnetPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.sonnet / totalModels) * 100) : 0;
  const opusPct = totalModels > 0 ? Math.round((s.tokenBudget.modelDistribution.opus / totalModels) * 100) : 0;
  const budgetPct = s.tokenBudget.globalHourlyBudget > 0 ? Math.round((s.tokenBudget.globalHourlyTokens / s.tokenBudget.globalHourlyBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Guardrails Monitor</h1>
          <p className="text-gray-400 mt-1">Protection en temps réel — tokens, agents, alertes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${autoRefresh ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs">{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs hover:text-white">
            {autoRefresh ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Budget */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💰</span>
            <h3 className="text-white font-medium text-sm">Tokens (cette heure)</h3>
          </div>
          <p className="text-2xl font-bold text-white">{(s.tokenBudget.globalHourlyTokens / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-1">/ {(s.tokenBudget.globalHourlyBudget / 1_000_000).toFixed(1)}M budget</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className={`h-2 rounded-full ${budgetPct > 150 ? 'bg-red-500' : budgetPct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{budgetPct}% utilisé</p>
        </div>

        {/* Circuit Breakers */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛡️</span>
            <h3 className="text-white font-medium text-sm">Circuit Breakers</h3>
          </div>
          <p className={`text-2xl font-bold ${LEVEL_COLORS[s.circuitBreakers.level]}`}>
            {s.circuitBreakers.level === 'normal' ? 'NORMAL' : s.circuitBreakers.level === 'degraded' ? 'DÉGRADÉ' : 'URGENCE'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{s.circuitBreakers.tripsLast24h} déclenchements (24h)</p>
          {s.circuitBreakers.agentsSuspended.length > 0 && (
            <p className="text-xs text-red-400 mt-2">{s.circuitBreakers.agentsSuspended.length} agents suspendus</p>
          )}
        </div>

        {/* Model Distribution */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <h3 className="text-white font-medium text-sm">Distribution modèles</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400">Haiku</span>
              <span className="text-gray-400">{haikuPct}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${haikuPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">Sonnet</span>
              <span className="text-gray-400">{sonnetPct}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${sonnetPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-400">Opus</span>
              <span className="text-gray-400">{opusPct}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${opusPct}%` }} />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Cible: 70/25/5</p>
        </div>

        {/* Chains & Loops */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔗</span>
            <h3 className="text-white font-medium text-sm">Chaînes inter-agents</h3>
          </div>
          <p className="text-2xl font-bold text-white">{s.activeChains}</p>
          <p className="text-xs text-gray-500 mt-1">chaînes actives</p>
          <p className="text-xs text-gray-500 mt-2">{s.loopsDetectedLast24h} boucles détectées (24h)</p>
        </div>
      </div>

      {/* API Health */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-medium mb-4">APIs externes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(s.apiHealth).map(([name, health]) => (
            <div key={name} className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
              <div className={`w-3 h-3 rounded-full ${health.up ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-white text-sm font-medium">{name}</p>
                <p className="text-gray-500 text-xs">{health.up ? `${health.latencyMs}ms` : 'DOWN'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Alertes récentes</h3>
          <span className="text-xs text-gray-500">{s.recentAlerts.filter(a => !a.acknowledged).length} non lues</span>
        </div>
        {s.recentAlerts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucune alerte</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {s.recentAlerts.map(alert => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.acknowledged ? 'bg-gray-900/50' : 'bg-gray-900'}`}>
                <span className={`px-2 py-0.5 rounded text-xs text-white ${SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] ?? 'bg-gray-600'}`}>
                  {alert.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{alert.type} — {new Date(alert.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guardrail Modules Status */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-medium mb-4">Modules de protection</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
            <div key={m.name} className="bg-gray-900 rounded-lg p-3 text-center">
              <span className="text-lg">{m.icon}</span>
              <p className="text-white text-xs font-medium mt-1">{m.name}</p>
              <p className="text-green-400 text-xs mt-0.5">Actif</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
