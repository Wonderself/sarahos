'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type TxCategory = 'income' | 'expense' | 'savings' | 'investment';

interface Transaction {
  id: string;
  amount_cents: number;
  category: TxCategory;
  label: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
}

interface Goal {
  id: string;
  label: string;
  target_cents: number;
  current_cents: number;
  status: 'active' | 'completed' | 'paused';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<TxCategory, string> = {
  income: 'Revenu', expense: 'Dépense', savings: 'Épargne', investment: 'Investissement',
};
const CAT_COLORS: Record<TxCategory, string> = {
  income: '#22c55e', expense: '#ef4444', savings: '#3b82f6', investment: '#06b6d4',
};
const CAT_ICONS: Record<TxCategory, string> = {
  income: 'savings', expense: 'money_off', savings: 'account_balance', investment: 'trending_up',
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BudgetPage() {
  const { showError, showSuccess } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'transactions' | 'goals'>('overview');
  const [filterCat, setFilterCat] = useState<TxCategory | 'all'>('all');

  // Modal add transaction
  const [showTxModal, setShowTxModal] = useState(false);
  const [txForm, setTxForm] = useState({ label: '', amount: '', category: 'expense' as TxCategory, date: new Date().toISOString().split('T')[0], is_recurring: false });
  const [txSaving, setTxSaving] = useState(false);

  // Modal add goal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ label: '', target: '' });
  const [goalSaving, setGoalSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, goalsRes] = await Promise.all([
        portalCall<{ transactions: Transaction[] }>('/personal/budget/transactions?limit=200'),
        portalCall<{ goals: Goal[] }>('/personal/budget/goals'),
      ]);
      setTransactions(txRes.transactions ?? []);
      setGoals(goalsRes.goals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Stats ──
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTx = transactions.filter(t => getMonthKey(t.date) === thisMonth);
  const totalIncome = monthTx.filter(t => t.category === 'income').reduce((s, t) => s + t.amount_cents, 0);
  const totalExpenses = monthTx.filter(t => t.category === 'expense').reduce((s, t) => s + t.amount_cents, 0);
  const totalSavings = monthTx.filter(t => t.category === 'savings').reduce((s, t) => s + t.amount_cents, 0);
  const balance = totalIncome - totalExpenses;

  // ── Chart data (last 6 months) ──
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const chartData = months.map(mk => {
    const mTx = transactions.filter(t => getMonthKey(t.date) === mk);
    return {
      month: getMonthLabel(mk),
      Revenus: Math.round(mTx.filter(t => t.category === 'income').reduce((s, t) => s + t.amount_cents, 0) / 100),
      Dépenses: Math.round(mTx.filter(t => t.category === 'expense').reduce((s, t) => s + t.amount_cents, 0) / 100),
      Épargne: Math.round(mTx.filter(t => t.category === 'savings').reduce((s, t) => s + t.amount_cents, 0) / 100),
    };
  });

  // ── Filtered transactions ──
  const displayedTx = (filterCat === 'all' ? transactions : transactions.filter(t => t.category === filterCat))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── Add transaction ──
  async function handleAddTx() {
    if (!txForm.label || !txForm.amount) return;
    setTxSaving(true);
    try {
      await portalCall('/personal/budget/transactions', 'POST', {
        label: txForm.label,
        amount_cents: Math.round(parseFloat(txForm.amount) * 100),
        category: txForm.category,
        date: txForm.date,
        is_recurring: txForm.is_recurring,
      });
      setShowTxModal(false);
      setTxForm({ label: '', amount: '', category: 'expense', date: new Date().toISOString().split('T')[0], is_recurring: false });
      showSuccess('Transaction ajoutée');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout'); }
    setTxSaving(false);
  }

  // ── Delete transaction ──
  async function handleDeleteTx(id: string) {
    if (!confirm('Supprimer cette transaction ?')) return;
    try {
      await portalCall(`/personal/budget/transactions/${id}`, 'DELETE');
      setTransactions(prev => prev.filter(t => t.id !== id));
      showSuccess('Transaction supprimée');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la suppression'); }
  }

  // ── Add goal ──
  async function handleAddGoal() {
    if (!goalForm.label || !goalForm.target) return;
    setGoalSaving(true);
    try {
      await portalCall('/personal/budget/goals', 'POST', {
        label: goalForm.label,
        target_cents: Math.round(parseFloat(goalForm.target) * 100),
      });
      setShowGoalModal(false);
      setGoalForm({ label: '', target: '' });
      showSuccess('Objectif créé');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la création'); }
    setGoalSaving(false);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>savings</span></div>
        <div className="text-md text-tertiary animate-pulse">Chargement du budget...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
              ← Agents personnels
            </Link>
          </div>
          <h1 className="page-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>savings</span> Budget Personnel</h1>
          <p className="page-subtitle">Suivez vos revenus, dépenses et objectifs d&apos;épargne</p>
        </div>
        <Link href="/client/chat?agent=fz-budget" className="btn btn-primary btn-sm">
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>chat</span> Analyser avec fz-budget
        </Link>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Solde ce mois', value: fmt(balance), icon: 'balance', color: balance >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Revenus', value: fmt(totalIncome), icon: 'savings', color: '#22c55e' },
          { label: 'Dépenses', value: fmt(totalExpenses), icon: 'money_off', color: '#ef4444' },
          { label: 'Épargne', value: fmt(totalSavings), icon: 'account_balance', color: '#3b82f6' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{stat.icon}</span></div>
            <div style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['overview', 'transactions', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: activeSection === tab ? '1.5px solid var(--accent)' : '1.5px solid var(--border-primary)',
              background: activeSection === tab ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeSection === tab ? '#fff' : 'var(--text-primary)',
            }}
          >
            {tab === 'overview' ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>bar_chart</span> Vue d&apos;ensemble</> : tab === 'transactions' ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>assignment</span> Transactions</> : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>target</span> Objectifs</>}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeSection === 'overview' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Évolution sur 6 mois
          </h3>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 36 }}>bar_chart</span></div>
              <div>Ajoutez des transactions pour voir votre évolution</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickFormatter={v => `${v}€`} />
                <Tooltip formatter={(value: number | undefined) => `${(value ?? 0).toLocaleString('fr-FR')} €`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenus" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Épargne" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Transactions tab */}
      {activeSection === 'transactions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'income', 'expense', 'savings', 'investment'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={filterCat === cat ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ fontSize: 11 }}
                >
                  {cat === 'all' ? 'Tout' : `${CAT_ICONS[cat]} ${CAT_LABELS[cat]}`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTxModal(true)} className="btn btn-primary btn-sm">
              + Ajouter
            </button>
          </div>

          {displayedTx.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>assignment</span></div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucune transaction</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Enregistrez vos revenus et dépenses pour suivre votre budget
              </div>
              <button onClick={() => setShowTxModal(true)} className="btn btn-primary btn-sm">
                + Ajouter une transaction
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayedTx.map(tx => (
                <div key={tx.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: CAT_COLORS[tx.category] + '15', fontSize: 16,
                  }}>
                    {CAT_ICONS[tx.category]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{tx.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                      {tx.is_recurring && <span style={{ marginLeft: 6, background: 'var(--accent)20', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>Récurrent</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: CAT_COLORS[tx.category], flexShrink: 0 }}>
                    {tx.category === 'expense' ? '-' : '+'}{fmt(tx.amount_cents)}
                  </div>
                  <button
                    onClick={() => handleDeleteTx(tx.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: '4px 6px', flexShrink: 0 }}
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goals tab */}
      {activeSection === 'goals' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowGoalModal(true)} className="btn btn-primary btn-sm">
              + Nouvel objectif
            </button>
          </div>
          {goals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>target</span></div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun objectif</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Définissez des objectifs d&apos;épargne ou d&apos;investissement
              </div>
              <button onClick={() => setShowGoalModal(true)} className="btn btn-primary btn-sm">
                + Créer un objectif
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {goals.map(goal => {
                const pct = Math.min(100, Math.round((goal.current_cents / goal.target_cents) * 100));
                return (
                  <div key={goal.id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{goal.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {fmt(goal.current_cents)} / {fmt(goal.target_cents)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: pct >= 100 ? '#22c55e' : 'var(--accent)' }}>
                        {pct}%
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, width: `${pct}%`,
                        background: pct >= 100 ? '#22c55e' : 'var(--accent)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    {goal.status === 'completed' && (
                      <div style={{ fontSize: 12, color: '#22c55e', marginTop: 6 }}><span className="material-symbols-rounded" style={{ fontSize: 12 }}>check_circle</span> Objectif atteint !</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Add Transaction */}
      {showTxModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>add_circle</span> Ajouter une transaction</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Libellé</label>
                <input
                  className="input"
                  placeholder="Ex: Salaire, Loyer..."
                  value={txForm.label}
                  onChange={e => setTxForm(p => ({ ...p, label: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Montant (€)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date</label>
                  <input
                    className="input"
                    type="date"
                    value={txForm.date}
                    onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Catégorie</label>
                <select className="input" value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value as TxCategory }))}>
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{CAT_ICONS[k as TxCategory]} {v}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={txForm.is_recurring} onChange={e => setTxForm(p => ({ ...p, is_recurring: e.target.checked }))} />
                Transaction récurrente
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowTxModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAddTx} className="btn btn-primary" style={{ flex: 1 }} disabled={txSaving}>
                {txSaving ? 'Enregistrement...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Goal */}
      {showGoalModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 380, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>target</span> Nouvel objectif</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nom de l&apos;objectif</label>
                <input
                  className="input"
                  placeholder="Ex: Fonds d'urgence, Voyage..."
                  value={goalForm.label}
                  onChange={e => setGoalForm(p => ({ ...p, label: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Montant cible (€)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={goalForm.target}
                  onChange={e => setGoalForm(p => ({ ...p, target: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowGoalModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAddGoal} className="btn btn-primary" style={{ flex: 1 }} disabled={goalSaving}>
                {goalSaving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
