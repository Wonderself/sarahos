'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  tva: number; // percentage
}

interface Invoice {
  id: string;
  number: string;
  type: 'facture' | 'devis';
  date: string;
  dueDate: string;
  clientId: string;
  items: LineItem[];
  notes: string;
  paymentConditions: string;
  status: 'brouillon' | 'envoyee' | 'payee' | 'en_retard';
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  createdAt: string;
}

interface FacturationData {
  invoices: Invoice[];
  clients: Client[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_invoices';
const TVA_RATES = [0, 5.5, 10, 20];

const STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon', envoyee: 'Envoyée', payee: 'Payée', en_retard: 'En retard',
};
const STATUS_COLORS: Record<string, string> = {
  brouillon: '#6b7280', envoyee: '#3b82f6', payee: '#22c55e', en_retard: '#ef4444',
};

type TabId = 'factures' | 'devis' | 'clients';
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'factures', label: 'Factures', emoji: '🧾' },
  { id: 'devis', label: 'Devis', emoji: '📝' },
  { id: 'clients', label: 'Clients', emoji: '👥' },
];

const CU = {
  card: { border: '1px solid #E5E5E5' as const, borderRadius: 8, background: '#fff' },
  btn: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: '1px solid #E5E5E5' as const, background: '#fff' as const,
  },
  btnPrimary: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: 'none' as const, background: '#1A1A1A', color: '#fff',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function loadData(): FacturationData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as FacturationData; } catch { return { invoices: [], clients: [] }; }
}

function saveData(data: FacturationData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function nextNumber(invoices: Invoice[], type: 'facture' | 'devis'): string {
  const prefix = type === 'facture' ? 'FAC' : 'DEV';
  const year = new Date().getFullYear();
  const existing = invoices.filter(i => i.type === type);
  const num = existing.length + 1;
  return `${prefix}-${year}-${String(num).padStart(3, '0')}`;
}

function calcLineTotal(item: LineItem): number { return item.qty * item.unitPrice; }
function calcLineTVA(item: LineItem): number { return calcLineTotal(item) * (item.tva / 100); }
function calcSubtotal(items: LineItem[]): number { return items.reduce((s, i) => s + calcLineTotal(i), 0); }
function calcTotalTVA(items: LineItem[]): number { return items.reduce((s, i) => s + calcLineTVA(i), 0); }
function calcTotal(items: LineItem[]): number { return calcSubtotal(items) + calcTotalTVA(items); }

function seedData(): FacturationData {
  const clients: Client[] = [
    { id: uid(), name: 'Dupont SARL', email: 'contact@dupont.fr', phone: '01 23 45 67 89', address: '12 Rue de Paris, 75001 Paris', siret: '123 456 789 00012', createdAt: '2026-01-10' },
    { id: uid(), name: 'Martin & Fils', email: 'info@martinetfils.com', phone: '04 56 78 90 12', address: '5 Avenue Victor Hugo, 69002 Lyon', siret: '987 654 321 00034', createdAt: '2026-02-05' },
    { id: uid(), name: 'Tech Solutions SAS', email: 'admin@techsol.io', phone: '06 12 34 56 78', address: '8 Boulevard Haussmann, 75009 Paris', siret: '456 789 123 00056', createdAt: '2026-02-20' },
  ];
  const invoices: Invoice[] = [
    {
      id: uid(), number: 'FAC-2026-001', type: 'facture', date: '2026-03-01', dueDate: '2026-03-31',
      clientId: clients[0].id,
      items: [
        { id: uid(), description: 'Développement site web', qty: 1, unitPrice: 3500, tva: 20 },
        { id: uid(), description: 'Hébergement annuel', qty: 1, unitPrice: 240, tva: 20 },
      ],
      notes: 'Merci pour votre confiance.', paymentConditions: 'Paiement à 30 jours', status: 'envoyee', createdAt: '2026-03-01',
    },
    {
      id: uid(), number: 'FAC-2026-002', type: 'facture', date: '2026-03-05', dueDate: '2026-04-04',
      clientId: clients[1].id,
      items: [
        { id: uid(), description: 'Audit SEO complet', qty: 1, unitPrice: 1200, tva: 20 },
        { id: uid(), description: 'Rédaction contenu (10 articles)', qty: 10, unitPrice: 150, tva: 20 },
      ],
      notes: '', paymentConditions: 'Paiement à 30 jours', status: 'payee', createdAt: '2026-03-05',
    },
    {
      id: uid(), number: 'DEV-2026-001', type: 'devis', date: '2026-03-10', dueDate: '2026-04-10',
      clientId: clients[2].id,
      items: [
        { id: uid(), description: 'Application mobile React Native', qty: 1, unitPrice: 8000, tva: 20 },
        { id: uid(), description: 'Design UI/UX', qty: 1, unitPrice: 2500, tva: 20 },
        { id: uid(), description: 'Tests & déploiement', qty: 1, unitPrice: 1500, tva: 20 },
      ],
      notes: 'Devis valable 30 jours.', paymentConditions: '50% à la commande, 50% à la livraison', status: 'brouillon', createdAt: '2026-03-10',
    },
  ];
  return { invoices, clients };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FacturationPage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.facturation ?? { emoji: '🧾', title: 'Facturation', subtitle: 'Devis et factures', helpText: '' };

  const [data, setData] = useState<FacturationData>({ invoices: [], clients: [] });
  const [tab, setTab] = useState<TabId>('factures');
  const [loaded, setLoaded] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Forms
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'facture' | 'devis'>('facture');
  const [formClientId, setFormClientId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDueDate, setFormDueDate] = useState('');
  const [formItems, setFormItems] = useState<LineItem[]>([{ id: uid(), description: '', qty: 1, unitPrice: 0, tva: 20 }]);
  const [formNotes, setFormNotes] = useState('');
  const [formConditions, setFormConditions] = useState('Paiement à 30 jours');

  // Preview
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Client form
  const [showClientForm, setShowClientForm] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientSiret, setClientSiret] = useState('');

  useEffect(() => {
    const stored = loadData();
    if (stored.invoices?.length || stored.clients?.length) {
      setData(stored);
    } else {
      const seed = seedData();
      saveData(seed);
      setData(seed);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((d: FacturationData) => { setData(d); saveData(d); }, []);

  // ── Invoice CRUD ──
  const resetForm = () => {
    setEditId(null);
    setFormClientId(data.clients[0]?.id ?? '');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDueDate('');
    setFormItems([{ id: uid(), description: '', qty: 1, unitPrice: 0, tva: 20 }]);
    setFormNotes('');
    setFormConditions('Paiement à 30 jours');
  };

  const openNewInvoice = (type: 'facture' | 'devis') => {
    setFormType(type);
    resetForm();
    setShowForm(true);
  };

  const openEditInvoice = (inv: Invoice) => {
    setEditId(inv.id);
    setFormType(inv.type);
    setFormClientId(inv.clientId);
    setFormDate(inv.date);
    setFormDueDate(inv.dueDate);
    setFormItems([...inv.items]);
    setFormNotes(inv.notes);
    setFormConditions(inv.paymentConditions);
    setShowForm(true);
  };

  const saveInvoice = () => {
    const updated = { ...data };
    if (editId) {
      updated.invoices = updated.invoices.map(i =>
        i.id === editId ? { ...i, clientId: formClientId, date: formDate, dueDate: formDueDate, items: formItems, notes: formNotes, paymentConditions: formConditions } : i
      );
    } else {
      const inv: Invoice = {
        id: uid(), number: nextNumber(updated.invoices, formType), type: formType,
        date: formDate, dueDate: formDueDate || formDate, clientId: formClientId,
        items: formItems, notes: formNotes, paymentConditions: formConditions,
        status: 'brouillon', createdAt: new Date().toISOString().slice(0, 10),
      };
      updated.invoices.push(inv);
    }
    persist(updated);
    setShowForm(false);
  };

  const deleteInvoice = (id: string) => {
    const updated = { ...data, invoices: data.invoices.filter(i => i.id !== id) };
    persist(updated);
  };

  const setInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = { ...data, invoices: data.invoices.map(i => i.id === id ? { ...i, status } : i) };
    persist(updated);
  };

  const convertDevisToFacture = (devisId: string) => {
    const devis = data.invoices.find(i => i.id === devisId);
    if (!devis) return;
    const facture: Invoice = {
      ...devis, id: uid(), number: nextNumber(data.invoices, 'facture'),
      type: 'facture', status: 'brouillon', createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = { ...data, invoices: [...data.invoices, facture] };
    persist(updated);
  };

  // ── Line items ──
  const addLine = () => setFormItems([...formItems, { id: uid(), description: '', qty: 1, unitPrice: 0, tva: 20 }]);
  const removeLine = (id: string) => setFormItems(formItems.filter(i => i.id !== id));
  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setFormItems(formItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // ── Client CRUD ──
  const resetClientForm = () => { setEditClientId(null); setClientName(''); setClientEmail(''); setClientPhone(''); setClientAddress(''); setClientSiret(''); };
  const openNewClient = () => { resetClientForm(); setShowClientForm(true); };
  const openEditClient = (c: Client) => {
    setEditClientId(c.id); setClientName(c.name); setClientEmail(c.email);
    setClientPhone(c.phone); setClientAddress(c.address); setClientSiret(c.siret);
    setShowClientForm(true);
  };
  const saveClient = () => {
    const updated = { ...data };
    if (editClientId) {
      updated.clients = updated.clients.map(c =>
        c.id === editClientId ? { ...c, name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, siret: clientSiret } : c
      );
    } else {
      updated.clients.push({ id: uid(), name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, siret: clientSiret, createdAt: new Date().toISOString().slice(0, 10) });
    }
    persist(updated);
    setShowClientForm(false);
  };
  const deleteClient = (id: string) => {
    persist({ ...data, clients: data.clients.filter(c => c.id !== id) });
  };

  // ── Stats ──
  const factures = data.invoices.filter(i => i.type === 'facture');
  const totalFacture = factures.reduce((s, i) => s + calcTotal(i.items), 0);
  const totalPaye = factures.filter(i => i.status === 'payee').reduce((s, i) => s + calcTotal(i.items), 0);
  const totalEnAttente = factures.filter(i => i.status === 'envoyee' || i.status === 'en_retard').reduce((s, i) => s + calcTotal(i.items), 0);

  const getClientName = (clientId: string) => data.clients.find(c => c.id === clientId)?.name ?? 'Client inconnu';
  const getClient = (clientId: string) => data.clients.find(c => c.id === clientId);

  const filteredInvoices = data.invoices.filter(i => {
    if (tab === 'factures' && i.type !== 'facture') return false;
    if (tab === 'devis' && i.type !== 'devis') return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const previewInvoice = previewId ? data.invoices.find(i => i.id === previewId) : null;

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Chargement...</div>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
    fontSize: 13, background: '#fff', color: '#1A1A1A', outline: 'none',
  };

  return (
    <div className="client-page-scrollable">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{pageMeta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>
                <span className="fz-logo-word">{pageMeta.title}</span>
              </h1>
              <HelpBubble text={pageMeta.helpText} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{pageMeta.subtitle}</p>
          </div>
        </div>
      </div>
      <PageExplanation pageId="facturation" text={pageMeta.helpText} />

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total facturé', value: totalFacture, color: '#1A1A1A' },
          { label: 'Payé', value: totalPaye, color: '#22c55e' },
          { label: 'En attente', value: totalEnAttente, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ ...CU.card, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E5E5E5', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setStatusFilter('all'); }}
            style={{ ...CU.btn, border: 'none', borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent', borderRadius: 0, background: 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B6B6B', fontWeight: tab === t.id ? 600 : 400 }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Preview Modal ── */}
      {previewInvoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setPreviewId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 20 : 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{previewInvoice.type === 'facture' ? 'FACTURE' : 'DEVIS'}</h2>
                <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 4 }}>{previewInvoice.number}</div>
              </div>
              <button onClick={() => setPreviewId(null)} style={{ ...CU.btn, width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: 13 }}>
              <div><strong>Date :</strong> {previewInvoice.date}</div>
              <div><strong>Échéance :</strong> {previewInvoice.dueDate}</div>
            </div>
            {(() => { const cl = getClient(previewInvoice.clientId); return cl ? (
              <div style={{ ...CU.card, padding: 12, marginBottom: 20, fontSize: 13 }}>
                <strong>{cl.name}</strong><br />{cl.address}<br />{cl.email} — {cl.phone}<br />SIRET : {cl.siret}
              </div>
            ) : null; })()}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>Qté</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>P.U. HT</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>TVA</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px' }}>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {previewInvoice.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 4px' }}>{item.description}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{item.unitPrice.toFixed(2)} €</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{item.tva}%</td>
                    <td style={{ textAlign: 'right', padding: '8px 4px' }}>{calcLineTotal(item).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 2 }}>
              <div>Sous-total HT : <strong>{calcSubtotal(previewInvoice.items).toFixed(2)} €</strong></div>
              <div>TVA : <strong>{calcTotalTVA(previewInvoice.items).toFixed(2)} €</strong></div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Total TTC : {calcTotal(previewInvoice.items).toFixed(2)} €</div>
            </div>
            {previewInvoice.notes && <div style={{ marginTop: 16, fontSize: 12, color: '#6B6B6B', borderTop: '1px solid #E5E5E5', paddingTop: 12 }}><strong>Notes :</strong> {previewInvoice.notes}</div>}
            {previewInvoice.paymentConditions && <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}><strong>Conditions :</strong> {previewInvoice.paymentConditions}</div>}
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button onClick={() => alert('Export PDF disponible prochainement')} style={CU.btnPrimary}>📥 Exporter PDF</button>
              <button onClick={() => setPreviewId(null)} style={CU.btn}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice/Devis Form Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
              {editId ? 'Modifier' : 'Créer'} {formType === 'facture' ? 'une facture' : 'un devis'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Client</label>
                <select value={formClientId} onChange={e => setFormClientId(e.target.value)} style={inputStyle}>
                  <option value="">-- Sélectionner --</option>
                  {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Date</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Échéance</label>
                <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Line items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Lignes</div>
              {formItems.map((item, idx) => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <div>
                    {idx === 0 && <label style={{ fontSize: 11, color: '#6B6B6B' }}>Description</label>}
                    <input value={item.description} onChange={e => updateLine(item.id, 'description', e.target.value)} style={inputStyle} placeholder="Description" />
                  </div>
                  <div>
                    {idx === 0 && <label style={{ fontSize: 11, color: '#6B6B6B' }}>Qté</label>}
                    <input type="number" min={1} value={item.qty} onChange={e => updateLine(item.id, 'qty', parseInt(e.target.value) || 1)} style={inputStyle} />
                  </div>
                  <div>
                    {idx === 0 && <label style={{ fontSize: 11, color: '#6B6B6B' }}>P.U. HT</label>}
                    <input type="number" min={0} step={0.01} value={item.unitPrice} onChange={e => updateLine(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} style={inputStyle} />
                  </div>
                  <div>
                    {idx === 0 && <label style={{ fontSize: 11, color: '#6B6B6B' }}>TVA %</label>}
                    <select value={item.tva} onChange={e => updateLine(item.id, 'tva', parseFloat(e.target.value))} style={inputStyle}>
                      {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeLine(item.id)} style={{ ...CU.btn, height: 34, padding: '0 8px', color: '#ef4444' }} title="Supprimer">🗑️</button>
                </div>
              ))}
              <button onClick={addLine} style={{ ...CU.btn, fontSize: 12, marginTop: 4 }}>➕ Ajouter une ligne</button>
            </div>

            {/* Totals */}
            <div style={{ textAlign: 'right', fontSize: 13, marginBottom: 16, lineHeight: 1.8 }}>
              <div>Sous-total HT : <strong>{calcSubtotal(formItems).toFixed(2)} €</strong></div>
              <div>TVA : <strong>{calcTotalTVA(formItems).toFixed(2)} €</strong></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Total TTC : {calcTotal(formItems).toFixed(2)} €</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Conditions de paiement</label>
                <textarea value={formConditions} onChange={e => setFormConditions(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveInvoice} style={CU.btnPrimary}>
                {editId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Form Modal ── */}
      {showClientForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowClientForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
              {editClientId ? 'Modifier' : 'Ajouter'} un client
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Nom / Société</label><input value={clientName} onChange={e => setClientName(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Email</label><input value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Téléphone</label><input value={clientPhone} onChange={e => setClientPhone(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Adresse</label><input value={clientAddress} onChange={e => setClientAddress(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>SIRET</label><input value={clientSiret} onChange={e => setClientSiret(e.target.value)} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowClientForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveClient} style={CU.btnPrimary}>{editClientId ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Factures / Devis Tab ── */}
      {(tab === 'factures' || tab === 'devis') && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['all', 'brouillon', 'envoyee', 'payee', 'en_retard'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ ...CU.btn, height: 28, fontSize: 11, background: statusFilter === s ? '#1A1A1A' : '#fff', color: statusFilter === s ? '#fff' : '#6B6B6B', border: statusFilter === s ? '1px solid #1A1A1A' : '1px solid #E5E5E5' }}>
                  {s === 'all' ? 'Tous' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <button onClick={() => openNewInvoice(tab === 'factures' ? 'facture' : 'devis')} style={CU.btnPrimary}>
              ➕ {tab === 'factures' ? 'Nouvelle facture' : 'Nouveau devis'}
            </button>
          </div>

          {filteredInvoices.length === 0 ? (
            <div style={{ ...CU.card, padding: 40, textAlign: 'center', color: '#6B6B6B' }}>
              Aucun {tab === 'factures' ? 'facture' : 'devis'} trouvé
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredInvoices.map(inv => (
                <div key={inv.id} style={{ ...CU.card, padding: isMobile ? 12 : 16, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{inv.number}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: STATUS_COLORS[inv.status] + '18', color: STATUS_COLORS[inv.status], fontWeight: 600 }}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B6B6B' }}>
                      {getClientName(inv.clientId)} — {inv.date}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{calcTotal(inv.items).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button onClick={() => setPreviewId(inv.id)} style={{ ...CU.btn, height: 28, fontSize: 11 }}>👁️ Voir</button>
                    <button onClick={() => openEditInvoice(inv)} style={{ ...CU.btn, height: 28, fontSize: 11 }}>✏️</button>
                    <select value={inv.status} onChange={e => setInvoiceStatus(inv.id, e.target.value as Invoice['status'])}
                      style={{ ...CU.btn, height: 28, fontSize: 11, padding: '0 4px' }}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {inv.type === 'devis' && (
                      <button onClick={() => convertDevisToFacture(inv.id)} style={{ ...CU.btn, height: 28, fontSize: 11 }} title="Convertir en facture">🔄 Facturer</button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} style={{ ...CU.btn, height: 28, fontSize: 11, color: '#ef4444' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Clients Tab ── */}
      {tab === 'clients' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={openNewClient} style={CU.btnPrimary}>➕ Nouveau client</button>
          </div>
          {data.clients.length === 0 ? (
            <div style={{ ...CU.card, padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Aucun client</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.clients.map(c => (
                <div key={c.id} style={{ ...CU.card, padding: isMobile ? 12 : 16, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>🏢 {c.name}</div>
                    <div style={{ fontSize: 12, color: '#6B6B6B' }}>{c.email} — {c.phone}</div>
                    <div style={{ fontSize: 11, color: '#9B9B9B' }}>{c.address} — SIRET : {c.siret}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEditClient(c)} style={{ ...CU.btn, height: 28, fontSize: 11 }}>✏️</button>
                    <button onClick={() => deleteClient(c.id)} style={{ ...CU.btn, height: 28, fontSize: 11, color: '#ef4444' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
