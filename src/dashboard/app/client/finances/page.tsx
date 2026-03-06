'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useToast } from '../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyCost {
  month: string;
  cost: number;
}

interface FeatureCost {
  feature: string;
  requests: number;
  tokens: number;
  cost: number;
  pct: number;
}

interface AutoTopup {
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
}

interface TopupHistory {
  id: string;
  amount: number;
  createdAt: string;
  triggeredBy?: string;
}

interface ModelPrice {
  model: string;
  inputPer1M: number;
  outputPer1M: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  chat: 'Chat', repondeur: 'Répondeur', visio: 'Visio',
  studio: 'Studio', briefing: 'Briefing', meeting: 'Réunion', other: 'Autre',
};
const FEATURE_ICONS: Record<string, string> = {
  chat: 'chat', repondeur: 'call', visio: 'mic',
  studio: 'palette', briefing: 'assignment', meeting: 'handshake', other: 'settings',
};
const PIE_COLORS = ['#5b6cf7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b7cf8', '#14b8a6'];
const MODEL_PRICES: ModelPrice[] = [
  { model: 'Claude Haiku 4.5', inputPer1M: 0.80, outputPer1M: 4.00 },
  { model: 'Claude Sonnet 4.6', inputPer1M: 3.00, outputPer1M: 15.00 },
  { model: 'Claude Opus 4.6', inputPer1M: 15.00, outputPer1M: 75.00 },
];
const TABS = ['Vue mensuelle', 'Par feature', 'Auto-topup', 'Tarification'] as const;
type Tab = typeof TABS[number];

// ─── API helper ───────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinancesPage() {
  const { showError, showSuccess } = useToast();
  const [tab, setTab] = useState<Tab>('Vue mensuelle');
  const [loading, setLoading] = useState(true);

  // Monthly data (from billing/usage)
  const [monthlyCosts, setMonthlyCosts] = useState<MonthlyCost[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthSpent, setMonthSpent] = useState(0);

  // Feature breakdown (from financial/costs)
  const [featureCosts, setFeatureCosts] = useState<FeatureCost[]>([]);

  // Auto-topup
  const [autoTopup, setAutoTopup] = useState<AutoTopup>({ autoTopupEnabled: false, autoTopupThreshold: 5_000_000, autoTopupAmount: 50_000_000 });
  const [topupHistory, setTopupHistory] = useState<TopupHistory[]>([]);
  const [topupSaving, setTopupSaving] = useState(false);
  const [topupSaved, setTopupSaved] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('5');
  const [amountInput, setAmountInput] = useState('50');

  // Calculator
  const [calcMessages, setCalcMessages] = useState('100');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];

      const [walletRes, usageRes, financialRes, topupRes] = await Promise.all([
        portalCall<{ wallet?: { balance: number }; balance?: number }>('/portal/wallet').catch(() => null),
        portalCall<{ daily?: { date: string; totalCost: number }[] }>(`/billing/usage?startDate=${startDate}&endDate=${endDate}`).catch(() => null),
        portalCall<{ costs?: FeatureCost[]; features?: FeatureCost[] }>('/financial/costs').catch(() => null),
        portalCall<AutoTopup & { history?: TopupHistory[] }>('/billing/wallet/auto-topup').catch(() => null),
      ]);

      if (walletRes) {
        setCurrentBalance(Math.round((walletRes.wallet?.balance ?? walletRes.balance ?? 0) / 1_000_000));
      }
      if (usageRes?.daily) {
        // Group by month
        const byMonth: Record<string, number> = {};
        for (const d of usageRes.daily) {
          const mk = d.date.slice(0, 7);
          byMonth[mk] = (byMonth[mk] ?? 0) + d.totalCost;
        }
        const sorted = Object.entries(byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, cost]) => ({
            month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            cost: Math.round(cost / 1_000_000 * 100) / 100,
          }));
        setMonthlyCosts(sorted);
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthCost = Object.entries(byMonth)
          .filter(([mk]) => mk === thisMonth)
          .reduce((s, [, c]) => s + c, 0);
        setMonthSpent(Math.round(thisMonthCost / 1_000_000 * 100) / 100);
      }
      if (financialRes) {
        setFeatureCosts(financialRes.costs ?? financialRes.features ?? []);
      }
      if (topupRes) {
        setAutoTopup({
          autoTopupEnabled: !!topupRes.autoTopupEnabled,
          autoTopupThreshold: Number(topupRes.autoTopupThreshold ?? 5_000_000),
          autoTopupAmount: Number(topupRes.autoTopupAmount ?? 50_000_000),
        });
        setThresholdInput(String(Math.round(Number(topupRes.autoTopupThreshold ?? 5_000_000) / 1_000_000)));
        setAmountInput(String(Math.round(Number(topupRes.autoTopupAmount ?? 50_000_000) / 1_000_000)));
        setTopupHistory(topupRes.history ?? []);
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  async function saveAutoTopup() {
    const threshold = parseFloat(thresholdInput);
    const amount = parseFloat(amountInput);
    if (isNaN(threshold) || threshold < 1) { showError('Seuil de déclenchement invalide'); return; }
    if (isNaN(amount) || amount < 1) { showError('Montant de recharge invalide'); return; }
    setTopupSaving(true);
    setTopupSaved(false);
    try {
      await portalCall('/billing/wallet/auto-topup', 'PATCH', {
        autoTopupEnabled: autoTopup.autoTopupEnabled,
        autoTopupThreshold: threshold * 1_000_000,
        autoTopupAmount: amount * 1_000_000,
      });
      setTopupSaved(true);
      showSuccess('Paramètres auto-recharge sauvegardés');
      setTimeout(() => setTopupSaved(false), 3000);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde'); }
    setTopupSaving(false);
  }

  // Calculator
  const msgsPerDay = parseFloat(calcMessages) || 0;
  const avgTokensPerMsg = 2000; // ~1k input + 1k output
  const monthlyTokens = msgsPerDay * 30 * avgTokensPerMsg;
  const sonnetCost = (monthlyTokens / 1_000_000) * ((MODEL_PRICES[1].inputPer1M + MODEL_PRICES[1].outputPer1M) / 2);
  const haikuCost = (monthlyTokens / 1_000_000) * ((MODEL_PRICES[0].inputPer1M + MODEL_PRICES[0].outputPer1M) / 2);
  // 20% margin → credits = cost / 0.80 * factor
  const sonnetCredits = Math.ceil(sonnetCost * 1.25);
  const haikuCredits = Math.ceil(haikuCost * 1.25);

  const totalFeatureCost = featureCosts.reduce((s, f) => s + f.cost, 0);
  const pieData = featureCosts.filter(f => f.cost > 0).map((f, i) => ({
    name: FEATURE_LABELS[f.feature] ?? f.feature,
    value: Math.round(f.cost / 1_000_000 * 100) / 100,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>credit_card</span></div>
        <div className="text-md text-tertiary animate-pulse">Chargement des finances...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>credit_card</span> Finances</h1>
          <p className="page-subtitle">Suivi des dépenses, auto-recharge et tarification des modèles <span className="fz-logo-word">IA</span>.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Solde actuel', value: `${currentBalance} cr`, icon: 'savings', color: 'var(--accent)' },
          { label: 'Dépenses ce mois', value: `${monthSpent} cr`, icon: 'trending_down', color: '#ef4444' },
          { label: 'Coût moyen/session', value: monthlyCosts.length > 0 ? `${((monthlyCosts.slice(-1)[0]?.cost ?? 0) / 30).toFixed(2)} cr/j` : '—', icon: 'bar_chart', color: '#f59e0b' },
          { label: 'Auto-recharge', value: autoTopup.autoTopupEnabled ? 'Activée' : 'Désactivée', icon: 'refresh', color: autoTopup.autoTopupEnabled ? '#22c55e' : '#6b7280' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>{s.icon}</span></div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: tab === t ? '1.5px solid var(--accent)' : '1.5px solid var(--border-primary)',
            background: tab === t ? 'var(--accent)' : 'var(--bg-secondary)',
            color: tab === t ? '#fff' : 'var(--text-primary)',
          }}>{t}</button>
        ))}
      </div>

      {/* Vue mensuelle */}
      {tab === 'Vue mensuelle' && (
        <div>
          {monthlyCosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>bar_chart</span></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucune donnée disponible</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Utilisez vos agents pour voir apparaître les données ici.</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Dépenses mensuelles (12 derniers mois)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyCosts} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} unit=" cr" />
                  <Tooltip formatter={(v: number | undefined) => [`${v ?? 0} crédits`, 'Dépense']} />
                  <Bar dataKey="cost" fill="var(--accent)" radius={[3, 3, 0, 0]} name="Crédits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Par feature */}
      {tab === 'Par feature' && (
        <div>
          {featureCosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>trending_up</span></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucune donnée de répartition disponible</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Les données s&apos;afficheront après utilisation.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: 16 }}>
              {pieData.length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Répartition par feature</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}
                        label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number | undefined) => `${v ?? 0} cr`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Détail par feature</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {featureCosts.map((f, i) => (
                    <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>{FEATURE_ICONS[f.feature] && <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{FEATURE_ICONS[f.feature]}</span>}{FEATURE_LABELS[f.feature] ?? f.feature}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                          {f.requests} req · {(f.tokens / 1000).toFixed(0)}k tokens
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{(f.cost / 1_000_000).toFixed(3)} cr</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{(f.pct ?? 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{(totalFeatureCost / 1_000_000).toFixed(3)} cr</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-topup */}
      {tab === 'Auto-topup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recharge <span className="fz-logo-word">automatique</span></h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Auto-recharge</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Recharge automatiquement quand le solde est bas
                </div>
              </div>
              <button
                onClick={() => setAutoTopup(p => ({ ...p, autoTopupEnabled: !p.autoTopupEnabled }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: autoTopup.autoTopupEnabled ? 'var(--accent)' : '#d1d5db',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: autoTopup.autoTopupEnabled ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-elevated)',
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Seuil de déclenchement (crédits)
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={thresholdInput}
                  onChange={e => setThresholdInput(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>Recharge quand le solde descend sous ce seuil</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Montant à recharger (crédits)
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>Montant ajouté à chaque recharge</div>
              </div>
            </div>

            <button
              onClick={saveAutoTopup}
              disabled={topupSaving}
              className="btn btn-primary"
              style={{ fontSize: 13 }}
            >
              {topupSaving ? 'Sauvegarde...' : topupSaved ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>check_circle</span> Sauvegardé</> : 'Sauvegarder les paramètres'}
            </button>
          </div>

          {/* History */}
          {topupHistory.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Historique des recharges automatiques</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topupHistory.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-primary)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(h.amount / 1_000_000)} crédits rechargés</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {new Date(h.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}><span className="material-symbols-rounded" style={{ fontSize: 11 }}>refresh</span> Auto</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tarification */}
      {tab === 'Tarification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Grille de prix par modèle</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                    {['Modèle', 'Input / 1M tokens', 'Output / 1M tokens', 'Coût moyen / 1M', 'Equivalent crédits'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODEL_PRICES.map(m => {
                    const avg = (m.inputPer1M + m.outputPer1M) / 2;
                    const credits = Math.ceil(avg * 1.25);
                    return (
                      <tr key={m.model} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.model}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>${m.inputPer1M.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>${m.outputPer1M.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>${avg.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent)' }}>{credits} cr / 1M tokens</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12 }}>
              * Tarifs <span className="fz-logo-word">Anthropic</span> + 25% de marge Freenzy. 1 crédit = 1M micro-crédits (unité interne).
            </div>
          </div>

          {/* Calculator */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Calculateur de budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Messages par jour :</label>
              <input
                className="input"
                type="number"
                value={calcMessages}
                onChange={e => setCalcMessages(e.target.value)}
                style={{ width: 100 }}
                min="1"
              />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>≈ {(msgsPerDay * 30).toFixed(0)} messages/mois · {(monthlyTokens / 1000).toFixed(0)}k tokens/mois</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { model: 'Claude Haiku (rapide)', cost: haikuCredits, color: '#22c55e', desc: 'Tâches simples et rapides' },
                { model: 'Claude Sonnet (standard)', cost: sonnetCredits, color: 'var(--accent)', desc: 'Agents L1/L2, usage courant' },
              ].map(c => (
                <div key={c.model} className="card" style={{ padding: '16px', background: c.color + '08', borderColor: c.color + '30' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.model}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 2 }}>~{c.cost} cr/mois</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
