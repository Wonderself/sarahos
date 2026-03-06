'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordType = 'invoice' | 'expense' | 'revenue';
type RecordStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

interface AccountingRecord {
  id: string;
  type: RecordType;
  label: string;
  amount_cents: number;
  status: RecordStatus;
  date: string;
  due_date?: string;
  reference?: string;
  description?: string;
}

interface Reminder {
  id: string;
  title: string;
  due_date: string;
  is_done: boolean;
  note?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<RecordType, string> = {
  invoice: 'Facture', expense: 'Dépense', revenue: 'Revenu',
};
const TYPE_ICONS: Record<RecordType, string> = {
  invoice: 'receipt', expense: 'money_off', revenue: 'savings',
};
const STATUS_LABELS: Record<RecordStatus, string> = {
  pending: 'En attente', paid: 'Payée', overdue: 'En retard', cancelled: 'Annulée',
};
const STATUS_COLORS: Record<RecordStatus, string> = {
  pending: '#f59e0b', paid: '#22c55e', overdue: '#ef4444', cancelled: '#6b7280',
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}

function parseQuarter(dateStr: string) {
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComptablePage() {
  const { showError, showSuccess } = useToast();
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'reminders' | 'recap'>('records');
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RecordStatus | 'all'>('all');

  // Modal record
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    type: 'invoice' as RecordType, label: '', amount: '',
    status: 'pending' as RecordStatus, date: new Date().toISOString().split('T')[0],
    due_date: '', reference: '', description: '',
  });
  const [recordSaving, setRecordSaving] = useState(false);

  // Modal reminder
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ title: '', due_date: '', note: '' });
  const [reminderSaving, setReminderSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, remRes] = await Promise.all([
        portalCall<{ records: AccountingRecord[] }>('/personal/comptable/records?limit=200'),
        portalCall<{ reminders: Reminder[] }>('/personal/comptable/reminders'),
      ]);
      setRecords(recRes.records ?? []);
      setReminders(remRes.reminders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const currentQ = parseQuarter(new Date().toISOString());
  const qRecords = records.filter(r => parseQuarter(r.date) === currentQ);
  const totalCA = qRecords.filter(r => r.type === 'revenue' || r.type === 'invoice').reduce((s, r) => s + r.amount_cents, 0);
  const totalCharges = qRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount_cents, 0);
  const benef = totalCA - totalCharges;
  const overdueCount = records.filter(r => r.status === 'overdue').length;

  // Filter records
  const displayed = records
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  async function handleAddRecord() {
    if (!recordForm.label || !recordForm.amount) return;
    setRecordSaving(true);
    try {
      await portalCall('/personal/comptable/records', 'POST', {
        type: recordForm.type,
        label: recordForm.label,
        amount_cents: Math.round(parseFloat(recordForm.amount) * 100),
        status: recordForm.status,
        date: recordForm.date,
        ...(recordForm.due_date && { due_date: recordForm.due_date }),
        ...(recordForm.reference && { reference: recordForm.reference }),
        ...(recordForm.description && { description: recordForm.description }),
      });
      setShowRecordModal(false);
      setRecordForm({ type: 'invoice', label: '', amount: '', status: 'pending', date: new Date().toISOString().split('T')[0], due_date: '', reference: '', description: '' });
      showSuccess('Enregistrement ajouté');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout'); }
    setRecordSaving(false);
  }

  async function handleDeleteRecord(id: string) {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    try {
      await portalCall(`/personal/comptable/records/${id}`, 'DELETE');
      setRecords(prev => prev.filter(r => r.id !== id));
      showSuccess('Enregistrement supprimé');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la suppression'); }
  }

  async function handleToggleReminder(id: string, isDone: boolean) {
    try {
      await portalCall(`/personal/comptable/reminders/${id}`, 'PATCH', { is_done: !isDone });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_done: !isDone } : r));
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'); }
  }

  async function handleAddReminder() {
    if (!reminderForm.title || !reminderForm.due_date) return;
    setReminderSaving(true);
    try {
      await portalCall('/personal/comptable/reminders', 'POST', reminderForm);
      setShowReminderModal(false);
      setReminderForm({ title: '', due_date: '', note: '' });
      showSuccess('Rappel créé');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la création'); }
    setReminderSaving(false);
  }

  function exportCSV() {
    const rows = [['Type', 'Libellé', 'Montant', 'Statut', 'Date', 'Référence']];
    for (const r of records) {
      rows.push([TYPE_LABELS[r.type], r.label, (r.amount_cents / 100).toFixed(2), STATUS_LABELS[r.status], r.date, r.reference ?? '']);
    }
    const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `comptabilite_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>receipt</span></div>
        <div className="text-md text-tertiary animate-pulse">Chargement de la comptabilité...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 4 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
              ← Agents personnels
            </Link>
          </div>
          <h1 className="page-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>receipt</span> Comptabilité</h1>
          <p className="page-subtitle">Factures, dépenses et rappels fiscaux</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} className="btn btn-ghost btn-sm"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>download</span> Export CSV</button>
          <Link href="/client/chat?agent=fz-comptable" className="btn btn-primary btn-sm"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>chat</span> fz-comptable</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: `CA ${currentQ}`, value: fmt(totalCA), icon: 'savings', color: '#22c55e' },
          { label: `Charges ${currentQ}`, value: fmt(totalCharges), icon: 'money_off', color: '#ef4444' },
          { label: 'Bénéfice net', value: fmt(benef), icon: 'bar_chart', color: benef >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'En retard', value: `${overdueCount} facture${overdueCount !== 1 ? 's' : ''}`, icon: 'warning', color: overdueCount > 0 ? '#ef4444' : '#22c55e' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}><span className="material-symbols-rounded" style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['records', 'assignment', 'Enregistrements'], ['reminders', 'alarm', 'Rappels fiscaux'], ['recap', 'bar_chart', 'Récap trimestriel']] as [string, string, string][]).map(([t, icon, label]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as 'records' | 'reminders' | 'recap')}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: activeTab === t ? '1.5px solid var(--accent)' : '1.5px solid var(--border-primary)',
              background: activeTab === t ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeTab === t ? '#fff' : 'var(--text-primary)',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Records tab */}
      {activeTab === 'records' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <select className="input" style={{ fontSize: 12, padding: '6px 10px', width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value as RecordType | 'all')}>
                <option value="all">Tous types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className="input" style={{ fontSize: 12, padding: '6px 10px', width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value as RecordStatus | 'all')}>
                <option value="all">Tous statuts</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={() => setShowRecordModal(true)} className="btn btn-primary btn-sm">+ Ajouter</button>
          </div>

          {displayed.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>receipt</span></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucun enregistrement</div>
              <button onClick={() => setShowRecordModal(true)} className="btn btn-primary btn-sm">+ Première entrée</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {['Type', 'Libellé', 'Montant', 'Statut', 'Date', 'Référence', ''].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{TYPE_ICONS[r.type]} {TYPE_LABELS[r.type]}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{r.label}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: r.type === 'expense' ? '#ef4444' : '#22c55e' }}>
                        {r.type === 'expense' ? '-' : '+'}{fmt(r.amount_cents)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: STATUS_COLORS[r.status] + '20', color: STATUS_COLORS[r.status],
                        }}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {new Date(r.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-tertiary)' }}>{r.reference ?? '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleDeleteRecord(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reminders tab */}
      {activeTab === 'reminders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button onClick={() => setShowReminderModal(true)} className="btn btn-primary btn-sm">+ Rappel</button>
          </div>
          {reminders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>alarm</span></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucun rappel fiscal</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                TVA, IS, URSSAF... configurez vos rappels pour ne rien oublier
              </div>
              <button onClick={() => setShowReminderModal(true)} className="btn btn-primary btn-sm">+ Ajouter un rappel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reminders
                .slice()
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .map(r => {
                  const isOverdue = !r.is_done && new Date(r.due_date) < new Date();
                  return (
                    <div key={r.id} className="card" style={{
                      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      opacity: r.is_done ? 0.6 : 1,
                      borderLeft: `3px solid ${isOverdue ? '#ef4444' : r.is_done ? '#22c55e' : '#f59e0b'}`,
                    }}>
                      <input
                        type="checkbox" checked={r.is_done}
                        onChange={() => handleToggleReminder(r.id, r.is_done)}
                        style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: r.is_done ? 'line-through' : 'none' }}>
                          {r.title}
                        </div>
                        {r.note && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.note}</div>}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? '#ef4444' : 'var(--text-tertiary)', flexShrink: 0 }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>calendar_month</span> {new Date(r.due_date).toLocaleDateString('fr-FR')}
                        {isOverdue && <span style={{ marginLeft: 4, color: '#ef4444' }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>warning</span> En retard</span>}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Recap tab */}
      {activeTab === 'recap' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
            const year = new Date().getFullYear();
            const qRecordsFiltered = records.filter(r => parseQuarter(r.date) === `${q} ${year}`);
            const ca = qRecordsFiltered.filter(r => r.type !== 'expense').reduce((s, r) => s + r.amount_cents, 0);
            const charges = qRecordsFiltered.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount_cents, 0);
            const net = ca - charges;
            return (
              <div key={q} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{q} {year}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>CA Brut</span>
                    <span style={{ fontWeight: 700, color: '#22c55e' }}>{fmt(ca)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Charges</span>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{fmt(charges)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ fontWeight: 700 }}>Bénéfice net</span>
                    <span style={{ fontWeight: 700, color: net >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(net)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Record */}
      {showRecordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>add_circle</span> Nouvel enregistrement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="input" value={recordForm.type} onChange={e => setRecordForm(p => ({ ...p, type: e.target.value as RecordType }))}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{TYPE_ICONS[k as RecordType]} {v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Statut</label>
                  <select className="input" value={recordForm.status} onChange={e => setRecordForm(p => ({ ...p, status: e.target.value as RecordStatus }))}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Libellé</label>
                <input className="input" placeholder="Ex: Facture client X..." value={recordForm.label} onChange={e => setRecordForm(p => ({ ...p, label: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Montant (€)</label>
                  <input className="input" type="number" placeholder="0.00" value={recordForm.amount} onChange={e => setRecordForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date</label>
                  <input className="input" type="date" value={recordForm.date} onChange={e => setRecordForm(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Référence (optionnel)</label>
                <input className="input" placeholder="FAC-2026-001..." value={recordForm.reference} onChange={e => setRecordForm(p => ({ ...p, reference: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowRecordModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAddRecord} className="btn btn-primary" style={{ flex: 1 }} disabled={recordSaving}>
                {recordSaving ? 'Enregistrement...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reminder */}
      {showReminderModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 380, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>alarm</span> Nouveau rappel fiscal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Titre</label>
                <input className="input" placeholder="Ex: Déclaration TVA Q1..." value={reminderForm.title} onChange={e => setReminderForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date limite</label>
                <input className="input" type="date" value={reminderForm.due_date} onChange={e => setReminderForm(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Note (optionnel)</label>
                <input className="input" placeholder="Détails..." value={reminderForm.note} onChange={e => setReminderForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowReminderModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAddReminder} className="btn btn-primary" style={{ flex: 1 }} disabled={reminderSaving}>
                {reminderSaving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
