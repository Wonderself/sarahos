'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useToast } from '../../../components/Toast';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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
  chat: '💬', repondeur: '📞', visio: '🎤',
  studio: '🎨', briefing: '📋', meeting: '🤝', other: '⚙️',
};
const PIE_COLORS = ['#1A1A1A', '#6B6B6B', '#9B9B9B', '#BFBFBF', '#4A4A4A', '#787878', '#A0A0A0'];
const MODEL_PRICES: ModelPrice[] = [
  { model: 'Claude Haiku 4.5', inputPer1M: 0.80, outputPer1M: 4.00 },
  { model: 'Claude Sonnet 4.6', inputPer1M: 3.00, outputPer1M: 15.00 },
  { model: 'Claude Opus 4.6', inputPer1M: 15.00, outputPer1M: 75.00 },
];
const TABS = ['Vue mensuelle', 'Par feature', 'Auto-topup', 'Tarification'] as const;
type Tab = typeof TABS[number];

// ─── ClickUp-style design tokens ─────────────────────────────────────────────

const CU = {
  card: {
    background: '#fff',
    border: '1px solid #E5E5E5' as const,
    border: '1px solid #E5E5E5',
    borderRadius: 8,
  },
  text: 'var(--fz-text, #1A1D23)',
  textSecondary: 'var(--fz-text-secondary, #6B6F76)',
  textMuted: 'var(--fz-text-muted, #A1A5AC)',
  accent: 'var(--fz-accent, #0EA5E9)',
  border: '#E5E5E5',
  bg: 'var(--fz-bg, #FFFFFF)',
  bgSecondary: 'var(--fz-bg-secondary, #F8FAFC)',
};

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
  const isMobile = useIsMobile();
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
        <div style={{ fontSize: 40 }}>💳</div>
        <div style={{ fontSize: 13, color: '#9B9B9B' }} className="animate-pulse">Chargement des finances...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{PAGE_META.finances.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{PAGE_META.finances.title}</h1>
            <p style={{ fontSize: 12, color: '#9B9B9B', margin: '2px 0 0' }}>{PAGE_META.finances.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.finances.helpText} />
        </div>
      </div>
      <PageExplanation pageId="finances" text={PAGE_META.finances?.helpText} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '130px' : '180px'}, 1fr))`, gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Solde actuel', value: `${currentBalance} cr`, icon: '💰', color: '#1A1A1A' },
          { label: 'Dépenses ce mois', value: `${monthSpent} cr`, icon: '📉', color: 'var(--danger)' },
          { label: 'Coût moyen/session', value: monthlyCosts.length > 0 ? `${((monthlyCosts.slice(-1)[0]?.cost ?? 0) / 30).toFixed(2)} cr/j` : '—', icon: '📊', color: '#1A1A1A' },
          { label: 'Auto-recharge', value: autoTopup.autoTopupEnabled ? 'Activée' : 'Désactivée', icon: '🔄', color: '#1A1A1A' },
        ].map(s => (
          <div key={s.label} style={{
            ...CU.card,
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            height: 36, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: tab === t ? 'none' : `1px solid ${'#E5E5E5'}`,
            background: tab === t ? CU.accent : CU.bg,
            color: tab === t ? '#fff' : CU.text,
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Vue mensuelle */}
      {tab === 'Vue mensuelle' && (
        <div>
          {monthlyCosts.length === 0 ? (
            <div style={{ ...CU.card, textAlign: 'center' as const, padding: '60px 40px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1A1A1A' }}>Aucune donnée disponible</div>
              <div style={{ fontSize: 13, color: '#9B9B9B' }}>Utilisez vos agents pour voir apparaître les données ici.</div>
            </div>
          ) : (
            <div style={{ ...CU.card, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>📊 Dépenses mensuelles (12 derniers mois)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyCosts} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={'#E5E5E5'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: CU.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: CU.textMuted }} unit=" cr" />
                  <Tooltip formatter={(v: number | undefined) => [`${v ?? 0} crédits`, 'Dépense']} />
                  <Bar dataKey="cost" fill={CU.accent} radius={[4, 4, 0, 0]} name="Crédits" />
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
            <div style={{ ...CU.card, textAlign: 'center' as const, padding: '60px 40px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1A1A1A' }}>Aucune donnée de répartition disponible</div>
              <div style={{ fontSize: 13, color: '#9B9B9B' }}>Les données s&apos;afficheront après utilisation.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 && !isMobile ? '1fr 1fr' : '1fr', gap: 16 }}>
              {pieData.length > 0 && (
                <div style={{ ...CU.card, padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>📊 Répartition par feature</h3>
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
              <div style={{ ...CU.card, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>📋 Détail par feature</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {featureCosts.map((f, i) => (
                    <div key={f.feature} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--fz-bg-secondary, #F8FAFC)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, color: '#1A1A1A' }}>{FEATURE_ICONS[f.feature] && <span style={{ fontSize: 14 }}>{FEATURE_ICONS[f.feature]}</span>}{FEATURE_LABELS[f.feature] ?? f.feature}</div>
                        <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 1 }}>
                          {f.requests} req · {(f.tokens / 1000).toFixed(0)}k tokens
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{(f.cost / 1_000_000).toFixed(3)} cr</div>
                        <div style={{ fontSize: 11, color: '#9B9B9B' }}>{(f.pct ?? 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${'#E5E5E5'}`, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{(totalFeatureCost / 1_000_000).toFixed(3)} cr</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-topup */}
      {tab === 'Auto-topup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...CU.card, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>🔄 Recharge <span className="fz-logo-word">automatique</span></h3>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 8,
              background: '#F7F7F7', marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>Auto-recharge</div>
                <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                  Recharge automatiquement quand le solde est bas
                </div>
              </div>
              <button
                onClick={() => setAutoTopup(p => ({ ...p, autoTopupEnabled: !p.autoTopupEnabled }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: '1px solid #E5E5E5', cursor: 'pointer',
                  background: autoTopup.autoTopupEnabled ? CU.accent : '#d1d5db',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: autoTopup.autoTopupEnabled ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', border: '1px solid #E5E5E5',
                }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B6B6B', display: 'block', marginBottom: 6 }}>
                  Seuil de déclenchement (crédits)
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={thresholdInput}
                  onChange={e => setThresholdInput(e.target.value)}
                  style={{ width: '100%', borderRadius: 6, fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 4 }}>Recharge quand le solde descend sous ce seuil</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B6B6B', display: 'block', marginBottom: 6 }}>
                  Montant à recharger (crédits)
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  style={{ width: '100%', borderRadius: 6, fontSize: 13 }}
                />
                <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 4 }}>Montant ajouté à chaque recharge</div>
              </div>
            </div>

            <button
              onClick={saveAutoTopup}
              disabled={topupSaving}
              style={{
                height: 36, padding: '0 20px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: '1px solid #E5E5E5', cursor: topupSaving ? 'wait' : 'pointer',
                background: '#1A1A1A', color: '#fff',
                transition: 'opacity 0.15s',
                opacity: topupSaving ? 0.7 : 1,
              }}
            >
              {topupSaving ? 'Sauvegarde...' : topupSaved ? <>✅ Sauvegardé</> : 'Sauvegarder les paramètres'}
            </button>
          </div>

          {/* History */}
          {topupHistory.length > 0 && (
            <div style={{ ...CU.card, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#1A1A1A' }}>📜 Historique des recharges automatiques</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {topupHistory.map(h => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 8px', borderBottom: `1px solid ${'#E5E5E5'}`,
                    borderRadius: 0, transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = CU.bgSecondary; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{Math.round(h.amount / 1_000_000)} crédits rechargés</div>
                      <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                        {new Date(h.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A' }}>🔄 Auto</span>
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
          <div style={{ ...CU.card, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>💲 Grille de prix par modèle</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${'#E5E5E5'}` }}>
                    {['Modèle', 'Input / 1M tokens', 'Output / 1M tokens', 'Coût moyen / 1M', 'Equivalent crédits'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9B9B9B', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODEL_PRICES.map(m => {
                    const avg = (m.inputPer1M + m.outputPer1M) / 2;
                    const credits = Math.ceil(avg * 1.25);
                    return (
                      <tr key={m.model} style={{ borderBottom: `1px solid ${'#E5E5E5'}`, transition: 'background 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = CU.bgSecondary; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 12px', fontWeight: 500, color: '#1A1A1A', fontSize: 13 }}>{m.model}</td>
                        <td style={{ padding: '12px 12px', color: '#6B6B6B', fontSize: 13 }}>${m.inputPer1M.toFixed(2)}</td>
                        <td style={{ padding: '12px 12px', color: '#6B6B6B', fontSize: 13 }}>${m.outputPer1M.toFixed(2)}</td>
                        <td style={{ padding: '12px 12px', color: '#6B6B6B', fontSize: 13 }}>${avg.toFixed(2)}</td>
                        <td style={{ padding: '12px 12px', fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{credits} cr / 1M tokens</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 12 }}>
              * Tarifs <span className="fz-logo-word">Anthropic</span> + 25% de marge Freenzy. 1 crédit = 1M micro-crédits (unité interne).
            </div>
          </div>

          {/* Calculator */}
          <div style={{ ...CU.card, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>🧮 Calculateur de budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', color: '#1A1A1A' }}>Messages par jour :</label>
              <input
                className="input"
                type="number"
                value={calcMessages}
                onChange={e => setCalcMessages(e.target.value)}
                style={{ width: 100, borderRadius: 6, fontSize: 13 }}
                min="1"
              />
              <span style={{ fontSize: 12, color: '#9B9B9B' }}>≈ {(msgsPerDay * 30).toFixed(0)} messages/mois · {(monthlyTokens / 1000).toFixed(0)}k tokens/mois</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '200px'}, 1fr))`, gap: 12 }}>
              {[
                { model: 'Claude Haiku (rapide)', cost: haikuCredits, color: '#1A1A1A', desc: 'Tâches simples et rapides', icon: '⚡' },
                { model: 'Claude Sonnet (standard)', cost: sonnetCredits, color: '#1A1A1A', desc: 'Agents L1/L2, usage courant', icon: '🎯' },
              ].map(c => (
                <div key={c.model} style={{
                  padding: 18, borderRadius: 8,
                  background: '#F7F7F7', border: '1px solid #E5E5E5',
                  border: '1px solid #E5E5E5',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>{c.icon} {c.model}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>~{c.cost} cr/mois</div>
                  <div style={{ fontSize: 12, color: '#9B9B9B' }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
