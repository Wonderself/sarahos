'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'prospect' | 'qualification' | 'proposition' | 'gagne';
type ActivityType = 'appel' | 'email' | 'reunion' | 'note';

interface Deal {
  id: string;
  company: string;
  contactName: string;
  amount: number;
  probability: number;
  stage: Stage;
  nextAction: string;
  notes: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatarEmoji: string;
  lastContactDate: string;
  notes: string;
  createdAt: string;
}

interface Activity {
  id: string;
  type: ActivityType;
  contactId: string;
  date: string;
  notes: string;
  createdAt: string;
}

interface CrmData {
  deals: Deal[];
  contacts: Contact[];
  activities: Activity[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_crm';

const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: 'prospect', label: 'Prospect', color: '#6b7280' },
  { id: 'qualification', label: 'Qualification', color: '#f59e0b' },
  { id: 'proposition', label: 'Proposition', color: '#3b82f6' },
  { id: 'gagne', label: 'Gagné', color: '#22c55e' },
];

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  appel: 'Appel', email: 'Email', reunion: 'Réunion', note: 'Note',
};
const ACTIVITY_EMOJIS: Record<ActivityType, string> = {
  appel: '📞', email: '📧', reunion: '🤝', note: '📝',
};
const CONTACT_EMOJIS = ['👤', '👩', '👨', '🧑', '👩‍💼', '👨‍💼', '🧑‍💻', '👩‍🔬', '👨‍🎨', '🧑‍🏫'];

type TabId = 'pipeline' | 'contacts' | 'activites';
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'pipeline', label: 'Pipeline', emoji: '📊' },
  { id: 'contacts', label: 'Contacts', emoji: '👥' },
  { id: 'activites', label: 'Activités', emoji: '🕐' },
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
function loadData(): CrmData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as CrmData; } catch { return { deals: [], contacts: [], activities: [] }; }
}
function saveData(data: CrmData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function seedData(): CrmData {
  const contacts: Contact[] = [
    { id: 'c1', name: 'Marie Dupont', company: 'Acme Corp', email: 'marie@acme.fr', phone: '06 12 34 56 78', avatarEmoji: '👩‍💼', lastContactDate: '2026-03-10', notes: 'Intéressée par le plan Pro', createdAt: '2026-01-15' },
    { id: 'c2', name: 'Jean Martin', company: 'TechVision', email: 'jean@techvision.io', phone: '06 98 76 54 32', avatarEmoji: '👨‍💻', lastContactDate: '2026-03-08', notes: 'CTO, décideur technique', createdAt: '2026-01-20' },
    { id: 'c3', name: 'Sophie Laurent', company: 'Green Solutions', email: 'sophie@green-sol.com', phone: '06 55 44 33 22', avatarEmoji: '👩', lastContactDate: '2026-03-05', notes: 'PME 50 employés', createdAt: '2026-02-01' },
    { id: 'c4', name: 'Pierre Dubois', company: 'Média Plus', email: 'p.dubois@mediaplus.fr', phone: '06 11 22 33 44', avatarEmoji: '👨', lastContactDate: '2026-03-12', notes: 'Agence de communication', createdAt: '2026-02-10' },
    { id: 'c5', name: 'Claire Moreau', company: 'StartupLab', email: 'claire@startuplab.co', phone: '06 77 88 99 00', avatarEmoji: '🧑‍🔬', lastContactDate: '2026-02-28', notes: 'Incubateur, 20 startups', createdAt: '2026-02-15' },
    { id: 'c6', name: 'Thomas Bernard', company: 'FinanceOne', email: 'thomas@financeone.eu', phone: '06 44 55 66 77', avatarEmoji: '👨‍💼', lastContactDate: '2026-03-11', notes: 'Directeur commercial', createdAt: '2026-03-01' },
  ];
  const deals: Deal[] = [
    { id: 'd1', company: 'Acme Corp', contactName: 'Marie Dupont', amount: 12000, probability: 30, stage: 'prospect', nextAction: '2026-03-15', notes: 'Premier contact', createdAt: '2026-03-01' },
    { id: 'd2', company: 'TechVision', contactName: 'Jean Martin', amount: 25000, probability: 60, stage: 'qualification', nextAction: '2026-03-14', notes: 'Démo planifiée', createdAt: '2026-02-20' },
    { id: 'd3', company: 'Green Solutions', contactName: 'Sophie Laurent', amount: 8500, probability: 75, stage: 'proposition', nextAction: '2026-03-16', notes: 'Devis envoyé', createdAt: '2026-02-10' },
    { id: 'd4', company: 'Média Plus', contactName: 'Pierre Dubois', amount: 15000, probability: 90, stage: 'gagne', nextAction: '', notes: 'Contrat signé', createdAt: '2026-01-15' },
  ];
  const activities: Activity[] = [
    { id: 'a1', type: 'appel', contactId: 'c1', date: '2026-03-10', notes: 'Appel de découverte — intéressée par le plan Pro', createdAt: '2026-03-10' },
    { id: 'a2', type: 'email', contactId: 'c2', date: '2026-03-08', notes: 'Envoi de la présentation technique', createdAt: '2026-03-08' },
    { id: 'a3', type: 'reunion', contactId: 'c3', date: '2026-03-05', notes: 'Réunion de présentation — 45 min', createdAt: '2026-03-05' },
    { id: 'a4', type: 'email', contactId: 'c4', date: '2026-03-12', notes: 'Devis et contrat envoyés', createdAt: '2026-03-12' },
    { id: 'a5', type: 'note', contactId: 'c6', date: '2026-03-11', notes: 'Relance prévue semaine prochaine', createdAt: '2026-03-11' },
  ];
  return { deals, contacts, activities };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrmPage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.crm ?? { emoji: '🤝', title: 'CRM', subtitle: 'Gérez vos contacts', helpText: '' };

  const [data, setData] = useState<CrmData>({ deals: [], contacts: [], activities: [] });
  const [tab, setTab] = useState<TabId>('pipeline');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  // Deal form
  const [showDealForm, setShowDealForm] = useState(false);
  const [editDealId, setEditDealId] = useState<string | null>(null);
  const [dealCompany, setDealCompany] = useState('');
  const [dealContact, setDealContact] = useState('');
  const [dealAmount, setDealAmount] = useState(0);
  const [dealProb, setDealProb] = useState(50);
  const [dealStage, setDealStage] = useState<Stage>('prospect');
  const [dealNextAction, setDealNextAction] = useState('');
  const [dealNotes, setDealNotes] = useState('');

  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  const [cName, setCName] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmoji, setCEmoji] = useState('👤');
  const [cNotes, setCNotes] = useState('');

  // Activity form
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actType, setActType] = useState<ActivityType>('appel');
  const [actContactId, setActContactId] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().slice(0, 10));
  const [actNotes, setActNotes] = useState('');

  // Contact detail
  const [detailContactId, setDetailContactId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadData();
    if (stored.deals?.length || stored.contacts?.length) {
      setData(stored);
    } else {
      const seed = seedData();
      saveData(seed);
      setData(seed);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((d: CrmData) => { setData(d); saveData(d); }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
    fontSize: 13, background: '#fff', color: '#1A1A1A', outline: 'none',
  };

  // ── Deal CRUD ──
  const resetDealForm = () => { setEditDealId(null); setDealCompany(''); setDealContact(''); setDealAmount(0); setDealProb(50); setDealStage('prospect'); setDealNextAction(''); setDealNotes(''); };
  const openNewDeal = () => { resetDealForm(); setShowDealForm(true); };
  const openEditDeal = (d: Deal) => { setEditDealId(d.id); setDealCompany(d.company); setDealContact(d.contactName); setDealAmount(d.amount); setDealProb(d.probability); setDealStage(d.stage); setDealNextAction(d.nextAction); setDealNotes(d.notes); setShowDealForm(true); };
  const saveDeal = () => {
    const updated = { ...data };
    if (editDealId) {
      updated.deals = updated.deals.map(d => d.id === editDealId ? { ...d, company: dealCompany, contactName: dealContact, amount: dealAmount, probability: dealProb, stage: dealStage, nextAction: dealNextAction, notes: dealNotes } : d);
    } else {
      updated.deals.push({ id: uid(), company: dealCompany, contactName: dealContact, amount: dealAmount, probability: dealProb, stage: dealStage, nextAction: dealNextAction, notes: dealNotes, createdAt: new Date().toISOString().slice(0, 10) });
    }
    persist(updated);
    setShowDealForm(false);
  };
  const deleteDeal = (id: string) => persist({ ...data, deals: data.deals.filter(d => d.id !== id) });
  const moveDeal = (id: string, newStage: Stage) => {
    persist({ ...data, deals: data.deals.map(d => d.id === id ? { ...d, stage: newStage } : d) });
  };

  // ── Contact CRUD ──
  const resetContactForm = () => { setEditContactId(null); setCName(''); setCCompany(''); setCEmail(''); setCPhone(''); setCEmoji('👤'); setCNotes(''); };
  const openNewContact = () => { resetContactForm(); setShowContactForm(true); };
  const openEditContact = (c: Contact) => { setEditContactId(c.id); setCName(c.name); setCCompany(c.company); setCEmail(c.email); setCPhone(c.phone); setCEmoji(c.avatarEmoji); setCNotes(c.notes); setShowContactForm(true); };
  const saveContact = () => {
    const updated = { ...data };
    if (editContactId) {
      updated.contacts = updated.contacts.map(c => c.id === editContactId ? { ...c, name: cName, company: cCompany, email: cEmail, phone: cPhone, avatarEmoji: cEmoji, notes: cNotes } : c);
    } else {
      updated.contacts.push({ id: uid(), name: cName, company: cCompany, email: cEmail, phone: cPhone, avatarEmoji: cEmoji, lastContactDate: new Date().toISOString().slice(0, 10), notes: cNotes, createdAt: new Date().toISOString().slice(0, 10) });
    }
    persist(updated);
    setShowContactForm(false);
  };
  const deleteContact = (id: string) => persist({ ...data, contacts: data.contacts.filter(c => c.id !== id) });

  // ── Activity CRUD ──
  const saveActivity = () => {
    const updated = { ...data };
    updated.activities.push({ id: uid(), type: actType, contactId: actContactId, date: actDate, notes: actNotes, createdAt: new Date().toISOString().slice(0, 10) });
    persist(updated);
    setShowActivityForm(false);
    setActNotes('');
  };

  // ── Stats ──
  const totalPipeline = data.deals.reduce((s, d) => s + d.amount, 0);
  const conversionRate = data.deals.length > 0 ? Math.round((data.deals.filter(d => d.stage === 'gagne').length / data.deals.length) * 100) : 0;

  const getContactName = (id: string) => data.contacts.find(c => c.id === id)?.name ?? 'Inconnu';
  const detailContact = detailContactId ? data.contacts.find(c => c.id === detailContactId) : null;
  const detailActivities = detailContactId ? data.activities.filter(a => a.contactId === detailContactId).sort((a, b) => b.date.localeCompare(a.date)) : [];

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Chargement...</div>;

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
      <PageExplanation pageId="crm" text={pageMeta.helpText} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pipeline total', value: totalPipeline.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), color: '#1A1A1A' },
          { label: 'Deals', value: String(data.deals.length), color: '#3b82f6' },
          { label: 'Taux de conversion', value: `${conversionRate}%`, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} style={{ ...CU.card, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E5E5E5' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...CU.btn, border: 'none', borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent', borderRadius: 0, background: 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B6B6B', fontWeight: tab === t.id ? 600 : 400 }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Modals ── */}
      {/* Deal Form */}
      {showDealForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowDealForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>{editDealId ? 'Modifier' : 'Nouveau'} deal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Entreprise</label><input value={dealCompany} onChange={e => setDealCompany(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Contact</label><input value={dealContact} onChange={e => setDealContact(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Montant (€)</label><input type="number" value={dealAmount} onChange={e => setDealAmount(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Probabilité (%)</label><input type="number" min={0} max={100} value={dealProb} onChange={e => setDealProb(parseInt(e.target.value) || 0)} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Étape</label>
                  <select value={dealStage} onChange={e => setDealStage(e.target.value as Stage)} style={inputStyle}>
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Prochaine action</label><input type="date" value={dealNextAction} onChange={e => setDealNextAction(e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Notes</label><textarea value={dealNotes} onChange={e => setDealNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowDealForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveDeal} style={CU.btnPrimary}>{editDealId ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      {showContactForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowContactForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>{editContactId ? 'Modifier' : 'Nouveau'} contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B' }}>Avatar</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {CONTACT_EMOJIS.map(e => (
                    <button key={e} onClick={() => setCEmoji(e)} style={{ width: 32, height: 32, borderRadius: 8, border: cEmoji === e ? '2px solid #1A1A1A' : '1px solid #E5E5E5', background: '#fff', fontSize: 16, cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Nom</label><input value={cName} onChange={e => setCName(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Entreprise</label><input value={cCompany} onChange={e => setCCompany(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Email</label><input value={cEmail} onChange={e => setCEmail(e.target.value)} style={inputStyle} /></div>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Téléphone</label><input value={cPhone} onChange={e => setCPhone(e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Notes</label><textarea value={cNotes} onChange={e => setCNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowContactForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveContact} style={CU.btnPrimary}>{editContactId ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Form */}
      {showActivityForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowActivityForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Nouvelle activité</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Type</label>
                  <select value={actType} onChange={e => setActType(e.target.value as ActivityType)} style={inputStyle}>
                    {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Date</label><input type="date" value={actDate} onChange={e => setActDate(e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Contact</label>
                <select value={actContactId} onChange={e => setActContactId(e.target.value)} style={inputStyle}>
                  <option value="">-- Sélectionner --</option>
                  {data.contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Notes</label><textarea value={actNotes} onChange={e => setActNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowActivityForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveActivity} style={CU.btnPrimary}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Detail */}
      {detailContact && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setDetailContactId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{detailContact.avatarEmoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{detailContact.name}</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B' }}>{detailContact.company}</div>
                </div>
              </div>
              <button onClick={() => setDetailContactId(null)} style={{ ...CU.btn, width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              <div>📧 {detailContact.email}</div>
              <div>📞 {detailContact.phone}</div>
              {detailContact.notes && <div style={{ marginTop: 8, color: '#6B6B6B' }}>📝 {detailContact.notes}</div>}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Historique des interactions</div>
            {detailActivities.length === 0 ? (
              <div style={{ color: '#6B6B6B', fontSize: 12 }}>Aucune activité enregistrée</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detailActivities.map(a => (
                  <div key={a.id} style={{ ...CU.card, padding: 10, fontSize: 12 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                      <span>{ACTIVITY_EMOJIS[a.type]}</span>
                      <span style={{ fontWeight: 600 }}>{ACTIVITY_LABELS[a.type]}</span>
                      <span style={{ color: '#9B9B9B' }}>{a.date}</span>
                    </div>
                    <div style={{ color: '#6B6B6B' }}>{a.notes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pipeline Tab ── */}
      {tab === 'pipeline' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={openNewDeal} style={CU.btnPrimary}>➕ Nouveau deal</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12, overflowX: isMobile ? 'auto' : undefined }}>
            {STAGES.map(stage => {
              const stageDeals = data.deals.filter(d => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((s, d) => s + d.amount, 0);
              return (
                <div key={stage.id} style={{ minWidth: isMobile ? 260 : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: stage.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{stage.label}</span>
                      <span style={{ fontSize: 11, color: '#6B6B6B' }}>({stageDeals.length})</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: stage.color }}>{stageTotal.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stageDeals.map(deal => (
                      <div key={deal.id} style={{ ...CU.card, padding: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{deal.company}</div>
                        <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>{deal.contactName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{deal.amount.toLocaleString('fr-FR')} €</span>
                          <span style={{ fontSize: 11, color: '#6B6B6B' }}>{deal.probability}%</span>
                        </div>
                        {deal.nextAction && <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 6 }}>📅 {deal.nextAction}</div>}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <select value={deal.stage} onChange={e => moveDeal(deal.id, e.target.value as Stage)} style={{ ...CU.btn, height: 24, fontSize: 10, padding: '0 4px' }}>
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                          <button onClick={() => openEditDeal(deal)} style={{ ...CU.btn, height: 24, fontSize: 10 }}>✏️</button>
                          <button onClick={() => deleteDeal(deal.id)} style={{ ...CU.btn, height: 24, fontSize: 10, color: '#ef4444' }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div style={{ ...CU.card, padding: 16, textAlign: 'center', color: '#9B9B9B', fontSize: 12 }}>Aucun deal</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Contacts Tab ── */}
      {tab === 'contacts' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un contact..." style={{ ...inputStyle, maxWidth: 300 }} />
            <button onClick={openNewContact} style={CU.btnPrimary}>➕ Nouveau contact</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.contacts.filter(c => {
              if (!search) return true;
              const q = search.toLowerCase();
              return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
            }).map(c => (
              <div key={c.id} style={{ ...CU.card, padding: isMobile ? 12 : 16, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 8, cursor: 'pointer' }} onClick={() => setDetailContactId(c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{c.avatarEmoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#6B6B6B' }}>{c.company} — {c.email}</div>
                    <div style={{ fontSize: 11, color: '#9B9B9B' }}>📞 {c.phone} — Dernier contact : {c.lastContactDate}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEditContact(c)} style={{ ...CU.btn, height: 28, fontSize: 11 }}>✏️</button>
                  <button onClick={() => deleteContact(c.id)} style={{ ...CU.btn, height: 28, fontSize: 11, color: '#ef4444' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Activités Tab ── */}
      {tab === 'activites' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => { setActContactId(data.contacts[0]?.id ?? ''); setShowActivityForm(true); }} style={CU.btnPrimary}>➕ Nouvelle activité</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.activities.sort((a, b) => b.date.localeCompare(a.date)).map(a => (
              <div key={a.id} style={{ ...CU.card, padding: isMobile ? 12 : 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{ACTIVITY_EMOJIS[a.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{ACTIVITY_LABELS[a.type]}</span>
                    <span style={{ fontSize: 11, color: '#9B9B9B' }}>{a.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#3b82f6' }}>{getContactName(a.contactId)}</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{a.notes}</div>
                </div>
              </div>
            ))}
            {data.activities.length === 0 && (
              <div style={{ ...CU.card, padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Aucune activité enregistrée</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
