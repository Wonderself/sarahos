'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META, REPONDEUR_MODE_EMOJIS, REPONDEUR_SCENARIO_EMOJIS } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useVisitorDraftObject } from '../../../lib/useVisitorDraft';

const API = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

// ── Types ────────────────────────────────────────────────────────────────────
interface RepondeurConfig {
  id: string;
  isActive: boolean;
  activeMode: string;
  activeStyle: string;
  activeSkills: string[];
  customInstructions: string | null;
  greetingMessage: string | null;
  absenceMessage: string | null;
  bossPhoneNumber: string | null;
  summaryFrequency: string;
  summaryDeliveryChannel: string;
  blockedContacts: string[];
  vipContacts: Array<{ phone: string; name: string; relationship: string; notes: string }>;
  faqEntries: Array<{ id: string; question: string; answer: string; category: string; isActive: boolean }>;
  schedule: { alwaysOn: boolean; timezone: string; rules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }> };
  maxResponseLength: number;
  language: string;
  gdprRetentionDays: number;
}

interface Stats {
  messages: { total: number; inbound: number; urgent: number; vip: number; orders: number; complaints: number; spam: number; today?: number };
  orders: { total: number; pending: number; confirmed: number };
  summaries: { total: number };
}

interface Message {
  id: string;
  senderPhone: string;
  content: string;
  classification: string;
  direction: 'inbound' | 'outbound';
  createdAt: string;
  priority?: string;
}

interface Order {
  id: string;
  items: string;
  total: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

interface Summary {
  id: string;
  content: string;
  type: string;
  createdAt: string;
}

// ── Static data ──────────────────────────────────────────────────────────────
const MODES = [
  { value: 'professional', label: 'Professionnel', desc: 'Répondeur entreprise formel' },
  { value: 'family_humor', label: 'Famille & Humour', desc: 'Messages avec blagues' },
  { value: 'order_taking', label: 'Prise de commande', desc: 'Capture structurée de commandes' },
  { value: 'emergency', label: 'Urgence', desc: 'Triage + alerte immédiate' },
  { value: 'concierge', label: 'Concierge', desc: 'Service premium style palace' },
  { value: 'support_technique', label: 'Support tech', desc: 'Diagnostic IT premier niveau' },
  { value: 'qualification', label: 'Qualification', desc: 'Qualification prospects BANT' },
  { value: 'humoristique_debride', label: 'Humour débridé', desc: 'Blagues non-stop, délire total' },
  { value: 'butler_british', label: 'Butler british', desc: 'Majordome flegmatique british' },
  { value: 'coach_sportif', label: 'Coach sportif', desc: 'Énergie et motivation pure' },
  { value: 'ami_proche', label: 'Ami proche', desc: 'Ton décontracté, comme un pote' },
];

const STYLES = [
  { value: 'formal_corporate', label: 'Formel corporatif' },
  { value: 'friendly_professional', label: 'Pro chaleureux' },
  { value: 'casual_fun', label: 'Décontracté & fun' },
  { value: 'minimalist', label: 'Minimaliste' },
  { value: 'luxe_concierge', label: 'Luxe concierge' },
  { value: 'tech_startup', label: 'Startup tech' },
  { value: 'medical_cabinet', label: 'Cabinet médical' },
];

const SKILLS = [
  { value: 'message_taking', label: 'Prise de message', always: true, emoji: '📝' },
  { value: 'faq_answering', label: 'Réponses FAQ', emoji: '❓' },
  { value: 'appointment_scheduling', label: 'Prise de RDV', emoji: '📅' },
  { value: 'order_capture', label: 'Capture commande', emoji: '🛒' },
  { value: 'complaint_handling', label: 'Gestion réclamations', emoji: '⚠️' },
  { value: 'vip_detection', label: 'Détection VIP', emoji: '⭐' },
  { value: 'spam_filtering', label: 'Filtrage spam', emoji: '🛡️' },
  { value: 'language_detection', label: 'Détection langue', emoji: '🌐' },
  { value: 'callback_scheduling', label: 'Planification rappel', emoji: '📞' },
  { value: 'sentiment_analysis', label: 'Analyse sentiment', emoji: '🎭' },
];

const PRESETS = [
  { id: 'blagues', label: 'Perso blagues', emoji: '🤣', mode: 'humoristique_debride', style: 'casual_fun' },
  { id: 'corporate', label: 'Entreprise', emoji: '👔', mode: 'professional', style: 'formal_corporate' },
  { id: 'vip', label: 'Concierge VIP', emoji: '💎', mode: 'concierge', style: 'luxe_concierge' },
  { id: 'medical', label: 'Médical', emoji: '🏥', mode: 'support_technique', style: 'medical_cabinet' },
  { id: 'startup', label: 'Startup', emoji: '🚀', mode: 'qualification', style: 'tech_startup' },
];

const SCENARIO_TEMPLATES = [
  { id: 'absent', label: 'En réunion', desc: 'Prend un message, rappelle plus tard', mode: 'professional' },
  { id: 'vacances', label: 'Vacances', desc: 'Indisponible, urgences seulement', mode: 'emergency' },
  { id: 'commande', label: 'Commandes', desc: 'Capture les commandes clients', mode: 'order_taking' },
  { id: 'urgence', label: 'Urgences', desc: 'Filtre et alerte immédiate', mode: 'emergency' },
  { id: 'rdv', label: 'Prise de RDV', desc: 'Propose des créneaux', mode: 'professional' },
  { id: 'support', label: 'Support', desc: 'Diagnostic premier niveau', mode: 'support_technique' },
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const CLASSIF_COLORS: Record<string, string> = {
  urgent: '#1A1A1A', vip: '#1A1A1A', order: '#1A1A1A', complaint: '#1A1A1A',
  appointment: '#6B6B6B', faq: '#6B6B6B', family: '#6B6B6B', spam: '#9B9B9B',
  general: '#9B9B9B', blocked: '#9B9B9B',
};

// ── API helper ────────────────────────────────────────────────────────────────
function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') || '{}').token || ''; } catch { return ''; }
}

async function fetchAPI<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...opts.headers },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function StatCard({ emoji, value, label, color = '#1A1A1A' }: { emoji: string; value: number | string; label: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: '16px 20px',
      border: '1px solid #E5E5E5', flex: 1, minWidth: 100,
    }}>
      <div style={{ marginBottom: 4, fontSize: 22 }}>{emoji}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SaveBar({ saving, onSave, changed }: { saving: boolean; onSave: () => void; changed: boolean }) {
  if (!changed && !saving) return null;
  return (
    <div style={{
      position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #E5E5E5',
      padding: '10px 20px', display: 'flex', justifyContent: 'flex-end', zIndex: 10,
    }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: '8px 20px', borderRadius: 8, border: 'none',
          background: saving ? '#9B9B9B' : '#1A1A1A', color: 'white',
          fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function RepondeurPage() {
  const isMobile = useIsMobile();
  const { requireAuth, LoginModalComponent } = useAuthGuard();
  const [config, setConfig] = useState<RepondeurConfig | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'overview' | 'config' | 'contacts' | 'inbox' | 'settings'>('overview');

  // Setup wizard state — persisted for visitors via localStorage
  const { draft: wizardDraft, updateField: updateWizardField, clearDraft: clearWizardDraft } = useVisitorDraftObject('repondeur', {
    wizardScenario: '',
    wizardPhone: '',
  });
  const [wizardStep, setWizardStep] = useState(1);
  const wizardScenario = wizardDraft.wizardScenario;
  const setWizardScenario = (v: string) => updateWizardField('wizardScenario', v);
  const wizardPhone = wizardDraft.wizardPhone;
  const setWizardPhone = (v: string) => updateWizardField('wizardPhone', v);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<RepondeurConfig>('/repondeur/config');
      setConfig(data);
      const s = await fetchAPI<Stats>('/repondeur/stats');
      setStats(s);
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 5000); };

  const updateConfig = async (updates: Partial<RepondeurConfig>) => {
    if (!requireAuth('Connectez-vous pour configurer le repondeur')) return;
    try {
      setSaving(true);
      setError('');
      const data = await fetchAPI<RepondeurConfig>('/repondeur/config', {
        method: 'PUT', body: JSON.stringify(updates),
      });
      setConfig(data);
      showSuccess('Sauvegardé');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ── Wizard: create first config ────────────────────────────────────────────
  const finishWizard = async () => {
    if (!requireAuth('Connectez-vous pour activer le repondeur')) return;
    try {
      setSaving(true);
      const scenario = SCENARIO_TEMPLATES.find(s => s.id === wizardScenario);
      const data = await fetchAPI<RepondeurConfig>('/repondeur/config', {
        method: 'POST',
        body: JSON.stringify({
          activeMode: scenario?.mode ?? 'professional',
          bossPhoneNumber: wizardPhone.trim() || null,
        }),
      });
      setConfig(data);
      setTab('overview');
      clearWizardDraft();
      showSuccess('Répondeur activé ! Bienvenue');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de création');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #1A1A1A', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 14, color: '#6B6B6B' }}>Chargement du répondeur...</span>
      </div>
    );
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = (error || success) ? (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 1000,
      padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      background: '#fff',
      color: error ? 'var(--danger)' : '#1A1A1A',
      border: '1px solid #E5E5E5',
    }}>
      {error || success}
    </div>
  ) : null;

  // ── Wizard ────────────────────────────────────────────────────────────────
  if (!config) {
    return (
      <div style={{ padding: isMobile ? '16px 12px' : '32px 24px', maxWidth: 700, margin: '0 auto' }}>
        {toast}
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 12, fontSize: 48 }}>{PAGE_META.repondeur.emoji}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#1A1A1A' }}>Configurer votre répondeur <span className="fz-logo-word">IA</span></h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
            Votre assistant répondra automatiquement à vos messages WhatsApp
          </p>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: wizardStep >= s ? '#1A1A1A' : '#F7F7F7',
                  color: wizardStep >= s ? 'white' : '#9B9B9B',
                }}>{s}</div>
                {s < 3 && <div style={{ width: 40, height: 2, background: wizardStep > s ? '#1A1A1A' : '#E5E5E5' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Scenario */}
        {wizardStep === 1 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
              1 — Quel est votre cas d'usage ?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              {SCENARIO_TEMPLATES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setWizardScenario(s.id)}
                  style={{
                    padding: 16, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${wizardScenario === s.id ? '#1A1A1A' : '#E5E5E5'}`,
                    background: wizardScenario === s.id ? 'rgba(0,0,0,0.04)' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ marginBottom: 6, fontSize: 24 }}>{REPONDEUR_SCENARIO_EMOJIS[s.id] ?? '📞'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => wizardScenario && setWizardStep(2)}
                disabled={!wizardScenario}
                style={{
                  padding: '10px 32px', borderRadius: 8, border: 'none', minHeight: 44,
                  background: wizardScenario ? '#1A1A1A' : '#E5E5E5',
                  color: wizardScenario ? 'white' : '#9B9B9B',
                  fontSize: 14, fontWeight: 600, cursor: wizardScenario ? 'pointer' : 'not-allowed',
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Boss phone */}
        {wizardStep === 2 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              2 — Numéro d'alerte patron
            </h2>
            <p style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', marginBottom: 20 }}>
              Pour les messages urgents, le répondeur vous envoie immédiatement une alerte WhatsApp.
            </p>
            <div style={{ background: '#F7F7F7', borderRadius: 8, padding: 20, border: '1px solid #E5E5E5' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6B6B6B', display: 'block', marginBottom: 8 }}>
                Votre numéro WhatsApp
              </label>
              <input
                type="tel"
                value={wizardPhone}
                onChange={e => setWizardPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 6 }}>
                Optionnel — vous pouvez l'ajouter plus tard dans Paramètres
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <button onClick={() => setWizardStep(1)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                ← Retour
              </button>
              <button onClick={() => setWizardStep(3)} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#1A1A1A', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {wizardStep === 3 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
              3 — Prêt à démarrer !
            </h2>
            <div style={{ background: '#F7F7F7', borderRadius: 8, padding: 20, border: '1px solid #E5E5E5', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{REPONDEUR_SCENARIO_EMOJIS[wizardScenario] ?? '📞'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Scénario</div>
                    <div style={{ fontSize: 12, color: '#9B9B9B' }}>{SCENARIO_TEMPLATES.find(s => s.id === wizardScenario)?.label}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>📞</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Numéro d'alerte</div>
                    <div style={{ fontSize: 12, color: '#9B9B9B' }}>{wizardPhone || 'Non défini (à configurer plus tard)'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 14, fontSize: 12, color: '#1A1A1A', marginBottom: 20 }}>
              💡 Après activation, vous pouvez tout personnaliser : modes, styles, FAQ, VIP, planning...
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setWizardStep(2)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                ← Retour
              </button>
              <button
                onClick={finishWizard}
                disabled={saving}
                style={{
                  padding: '10px 32px', borderRadius: 8, border: 'none', minHeight: 44,
                  background: saving ? '#9B9B9B' : '#1A1A1A', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Activation...' : 'Activer le répondeur'}
              </button>
            </div>
          </div>
        )}
        {LoginModalComponent}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN VIEW (config exists)
  // ══════════════════════════════════════════════════════════════════════════
  const TABS = [
    { id: 'overview', label: 'Vue d\'ensemble', emoji: '📊' },
    { id: 'config', label: 'Configuration', emoji: '⚙️' },
    { id: 'contacts', label: 'Contacts & FAQ', emoji: '👥' },
    { id: 'inbox', label: 'Boîte de réception', emoji: '📨' },
    { id: 'settings', label: 'Paramètres', emoji: '🔧' },
  ] as const;

  return (
    <div className="client-page-scrollable" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      {toast}

      {/* Page header */}
      <div style={{ padding: '16px 20px 0', background: '#fff', borderBottom: '1px solid #E5E5E5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.repondeur.emoji}</span>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#1A1A1A' }}>
              {PAGE_META.repondeur.title}
              <HelpBubble text={PAGE_META.repondeur.helpText} />
            </h1>
            <p style={{ fontSize: 12, color: '#9B9B9B', margin: 0 }}>
              {PAGE_META.repondeur.subtitle}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: config.isActive ? '#1A1A1A' : '#dc2626', fontWeight: 600 }}>
              {config.isActive ? '● Actif' : '● Inactif'}
            </span>
            <button
              onClick={() => updateConfig({ isActive: !config.isActive })}
              style={{
                padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', minHeight: 44,
                background: config.isActive ? '#fef2f2' : '#fff',
                color: config.isActive ? 'var(--danger)' : '#1A1A1A',
              }}
            >
              {config.isActive ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>
        <PageExplanation pageId="repondeur" text={PAGE_META.repondeur?.helpText} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#1A1A1A' : '#6B6B6B',
                borderRadius: '8px 8px 0 0',
                borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '20px' }}>

        {/* ── TAB: Vue d'ensemble ── */}
        {tab === 'overview' && (
          <OverviewTab config={config} stats={stats} onUpdate={updateConfig} saving={saving} />
        )}

        {/* ── TAB: Configuration ── */}
        {tab === 'config' && (
          <ConfigTab config={config} onUpdate={updateConfig} saving={saving} />
        )}

        {/* ── TAB: Contacts & FAQ ── */}
        {tab === 'contacts' && (
          <ContactsTab config={config} onReload={loadData} showError={showError} showSuccess={showSuccess} />
        )}

        {/* ── TAB: Boîte de réception ── */}
        {tab === 'inbox' && (
          <InboxTab config={config} showError={showError} showSuccess={showSuccess} onUpdate={updateConfig} saving={saving} />
        )}

        {/* ── TAB: Paramètres ── */}
        {tab === 'settings' && (
          <SettingsTab config={config} onUpdate={updateConfig} saving={saving} />
        )}
      </div>
      {LoginModalComponent}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Vue d'ensemble
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab({
  config, stats, onUpdate, saving,
}: { config: RepondeurConfig; stats: Stats | null; onUpdate: (u: Partial<RepondeurConfig>) => void; saving: boolean }) {
  const [testMessage, setTestMessage] = useState('');
  const [testSent, setTestSent] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchAPI<{ messages: Message[] }>('/repondeur/messages?limit=3')
      .then(d => setRecentMessages(d.messages))
      .catch(() => {});
  }, []);

  const sendTest = async () => {
    if (!testMessage.trim()) return;
    try {
      await fetchAPI('/repondeur/test', { method: 'POST', body: JSON.stringify({ message: testMessage }) });
      setTestSent(true);
      setTestMessage('');
      setTimeout(() => setTestSent(false), 3000);
    } catch { /* silent */ }
  };

  const mode = MODES.find(m => m.value === config.activeMode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard emoji="💬" value={stats?.messages.today ?? stats?.messages.inbound ?? 0} label="Messages aujourd'hui" color="#1A1A1A" />
        <StatCard emoji="🛒" value={stats?.orders.pending ?? 0} label="Commandes en attente" color="#1A1A1A" />
        <StatCard emoji="🚨" value={stats?.messages.urgent ?? 0} label="Alertes urgentes" color="#1A1A1A" />
        <StatCard emoji="⭐" value={stats?.messages.vip ?? 0} label="VIP détectés" color="#1A1A1A" />
      </div>

      {/* Current mode */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Mode actif</span>
          <button
            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', color: '#6B6B6B' }}
            onClick={() => { /* switch to config tab is done externally */ }}
          >
            Changer
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{REPONDEUR_MODE_EMOJIS[config.activeMode] ?? '📞'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{mode?.label ?? config.activeMode}</div>
            <div style={{ fontSize: 12, color: '#6B6B6B' }}>{mode?.desc ?? ''}</div>
          </div>
        </div>
        {config.greetingMessage && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#F7F7F7', borderRadius: 8, fontSize: 12, color: '#6B6B6B', borderLeft: '3px solid #1A1A1A' }}>
            "{config.greetingMessage}"
          </div>
        )}
      </div>

      {/* Test zone */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#1A1A1A' }}>🧪 Tester le répondeur</div>
        {testSent ? (
          <div style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>
            ✅ Message envoyé ! Le répondeur va traiter et répondre.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTest()}
              placeholder="Ex: Bonjour, je voudrais un devis..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={sendTest}
              disabled={!testMessage.trim()}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                background: testMessage.trim() ? '#1A1A1A' : '#E5E5E5',
                color: testMessage.trim() ? 'white' : '#9B9B9B',
                cursor: testMessage.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Envoyer
            </button>
          </div>
        )}
      </div>

      {/* Recent messages */}
      {recentMessages.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>📨 Activité récente</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentMessages.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                borderBottom: '1px solid #F7F7F7',
              }}>
                <span style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600, flexShrink: 0, marginTop: 1,
                  background: `${CLASSIF_COLORS[m.classification] ?? '#9B9B9B'}18`,
                  color: CLASSIF_COLORS[m.classification] ?? '#9B9B9B',
                }}>
                  {m.classification}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.content}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#9B9B9B', flexShrink: 0 }}>{timeAgo(m.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Configuration
// ══════════════════════════════════════════════════════════════════════════════
function ConfigTab({ config, onUpdate, saving }: { config: RepondeurConfig; onUpdate: (u: Partial<RepondeurConfig>) => void; saving: boolean }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState(config.activeMode);
  const [style, setStyle] = useState(config.activeStyle);
  const [skills, setSkills] = useState<string[]>(config.activeSkills);
  const [greeting, setGreeting] = useState(config.greetingMessage ?? '');
  const [absence, setAbsence] = useState(config.absenceMessage ?? '');
  const [phone, setPhone] = useState(config.bossPhoneNumber ?? '');
  const [instructions, setInstructions] = useState(config.customInstructions ?? '');
  const [changed, setChanged] = useState(false);

  const markChanged = () => setChanged(true);

  const save = () => {
    onUpdate({
      activeMode: mode, activeStyle: style, activeSkills: skills,
      greetingMessage: greeting || null, absenceMessage: absence || null,
      bossPhoneNumber: phone || null, customInstructions: instructions || null,
    });
    setChanged(false);
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setMode(p.mode); setStyle(p.style); markChanged();
  };

  const toggleSkill = (v: string) => {
    if (v === 'message_taking') return; // always on
    setSkills(prev => prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v]);
    markChanged();
  };

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Presets */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>⚡ Presets rapides</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              style={{
                padding: '10px 14px', borderRadius: 20, border: '1px solid #E5E5E5', minHeight: 44,
                background: mode === p.mode ? 'rgba(0,0,0,0.04)' : '#fff',
                color: mode === p.mode ? '#1A1A1A' : '#6B6B6B',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>🎭 Mode de réponse</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); markChanged(); }}
              style={{
                padding: '12px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${mode === m.value ? '#1A1A1A' : '#E5E5E5'}`,
                background: mode === m.value ? 'rgba(0,0,0,0.04)' : '#F7F7F7',
              }}
            >
              <div style={{ marginBottom: 4, fontSize: 20 }}>{REPONDEUR_MODE_EMOJIS[m.value] ?? '📞'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A' }}>{m.label}</div>
              <div style={{ fontSize: 10, color: '#9B9B9B', marginTop: 2, lineHeight: 1.3 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Style */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>🎨 Style de réponse</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STYLES.map(s => (
              <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: style === s.value ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
                <input type="radio" checked={style === s.value} onChange={() => { setStyle(s.value); markChanged(); }} style={{ accentColor: '#1A1A1A' }} />
                <span style={{ fontSize: 12, fontWeight: style === s.value ? 600 : 400 }}>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>🔧 Compétences actives</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SKILLS.map(s => {
              const active = s.always || skills.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => toggleSkill(s.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6,
                    border: 'none', cursor: s.always ? 'default' : 'pointer', textAlign: 'left', width: '100%',
                    background: active ? '#fff' : '#F7F7F7',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    background: active ? '#1A1A1A' : '#E5E5E5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12 }}>{s.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#1A1A1A' : '#6B6B6B' }}>
                    {s.label}{s.always ? ' (toujours)' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>💬 Messages</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              Message d'accueil
            </label>
            <textarea
              value={greeting}
              onChange={e => { setGreeting(e.target.value); markChanged(); }}
              placeholder="Bonjour, je suis le répondeur de [nom]..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              Message d'absence
            </label>
            <textarea
              value={absence}
              onChange={e => { setAbsence(e.target.value); markChanged(); }}
              placeholder="Je suis actuellement indisponible..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            📞 Numéro patron (alertes urgences)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); markChanged(); }}
            placeholder="+33 6 12 34 56 78"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Instructions personnalisées
          </label>
          <textarea
            value={instructions}
            onChange={e => { setInstructions(e.target.value); markChanged(); }}
            placeholder="Toujours mentionner notre délai de livraison de 48h..."
            rows={2}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <SaveBar saving={saving} onSave={save} changed={changed} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Contacts & FAQ
// ══════════════════════════════════════════════════════════════════════════════
function ContactsTab({ config, onReload, showError, showSuccess }: {
  config: RepondeurConfig;
  onReload: () => void;
  showError: (m: string) => void;
  showSuccess: (m: string) => void;
}) {
  const isMobile = useIsMobile();
  const [subTab, setSubTab] = useState<'faq' | 'vip' | 'blocked'>('faq');
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [newVipPhone, setNewVipPhone] = useState('');
  const [newVipName, setNewVipName] = useState('');
  const [newVipRel, setNewVipRel] = useState('');
  const [newBlocked, setNewBlocked] = useState('');

  const addFaq = async () => {
    if (!newQ || !newA) return;
    try {
      await fetchAPI('/repondeur/faq', { method: 'POST', body: JSON.stringify({ question: newQ, answer: newA }) });
      setNewQ(''); setNewA(''); onReload(); showSuccess('FAQ ajoutée');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur'); }
  };

  const deleteFaq = async (id: string) => {
    await fetchAPI(`/repondeur/faq/${id}`, { method: 'DELETE' });
    onReload();
  };

  const addVip = async () => {
    if (!newVipPhone || !newVipName) return;
    try {
      await fetchAPI('/repondeur/vip', { method: 'POST', body: JSON.stringify({ phone: newVipPhone, name: newVipName, relationship: newVipRel }) });
      setNewVipPhone(''); setNewVipName(''); setNewVipRel(''); onReload(); showSuccess('Contact VIP ajouté');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur'); }
  };

  const removeVip = async (phone: string) => {
    await fetchAPI(`/repondeur/vip/${encodeURIComponent(phone)}`, { method: 'DELETE' });
    onReload();
  };

  const addBlocked = async () => {
    if (!newBlocked) return;
    try {
      await fetchAPI('/repondeur/blocked', { method: 'POST', body: JSON.stringify({ phone: newBlocked }) });
      setNewBlocked(''); onReload(); showSuccess('Numéro bloqué');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur'); }
  };

  const removeBlocked = async (phone: string) => {
    await fetchAPI(`/repondeur/blocked/${encodeURIComponent(phone)}`, { method: 'DELETE' });
    onReload();
  };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#F7F7F7', borderRadius: 8, padding: 4, width: isMobile ? '100%' : 'fit-content', flexWrap: 'wrap' }}>
        {([['faq', '❓', 'FAQ', config.faqEntries.length], ['vip', '⭐', 'VIP', config.vipContacts.length], ['blocked', '🚫', 'Bloqués', config.blockedContacts.length]] as [string, string, string, number][]).map(([id, tabIcon, label, count]) => (
          <button
            key={id}
            onClick={() => setSubTab(id as 'vip' | 'faq' | 'blocked')}
            style={{
              padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              minHeight: 44, background: subTab === id ? '#fff' : 'transparent',
              color: subTab === id ? '#1A1A1A' : '#6B6B6B',
              boxShadow: subTab === id ? 'none' : 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tabIcon} {label}
            <span style={{ background: '#E5E5E5', borderRadius: 8, padding: '0 6px', fontSize: 10 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* FAQ */}
      {subTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Add form */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: '#6B6B6B' }}>➕ Ajouter une entrée FAQ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Question (ex: Quels sont vos horaires ?)" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={newA} onChange={e => setNewA(e.target.value)} placeholder="Réponse complète..." style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none' }} onKeyDown={e => e.key === 'Enter' && addFaq()} />
                <button onClick={addFaq} disabled={!newQ || !newA} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: newQ && newA ? '#1A1A1A' : '#E5E5E5', color: newQ && newA ? 'white' : '#9B9B9B', fontSize: 12, fontWeight: 600, cursor: newQ && newA ? 'pointer' : 'not-allowed' }}>Ajouter</button>
              </div>
            </div>
          </div>
          {/* List */}
          {config.faqEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9B9B9B', fontSize: 13 }}>Aucune entrée FAQ</div>
          ) : (
            config.faqEntries.map(f => (
              <div key={f.id} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E5E5', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>❓ {f.question}</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>{f.answer}</div>
                </div>
                <button onClick={() => deleteFaq(f.id)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #E5E5E5', color: 'var(--danger)', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>Suppr.</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIP */}
      {subTab === 'vip' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>➕ Ajouter un contact VIP</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="tel" value={newVipPhone} onChange={e => setNewVipPhone(e.target.value)} placeholder="+33 6..." style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', flex: '1 1 120px', minWidth: 0, minHeight: 44 }} />
              <input type="text" value={newVipName} onChange={e => setNewVipName(e.target.value)} placeholder="Nom" style={{ flex: '1 1 100px', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', minWidth: 0, minHeight: 44 }} />
              <input type="text" value={newVipRel} onChange={e => setNewVipRel(e.target.value)} placeholder="Relation (ex: Client, Ami...)" style={{ flex: '1 1 120px', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none', minWidth: 0, minHeight: 44 }} />
              <button onClick={addVip} disabled={!newVipPhone || !newVipName} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: newVipPhone && newVipName ? '#1A1A1A' : '#E5E5E5', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Ajouter</button>
            </div>
          </div>
          {config.vipContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9B9B9B', fontSize: 13 }}>Aucun contact VIP</div>
          ) : (
            config.vipContacts.map((v, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⭐</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: '#9B9B9B' }}>{v.phone}{v.relationship ? ` · ${v.relationship}` : ''}</div>
                </div>
                <button onClick={() => removeVip(v.phone)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #E5E5E5', color: 'var(--danger)', background: '#fff', cursor: 'pointer' }}>Retirer</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blocked */}
      {subTab === 'blocked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🚫 Bloquer un numéro</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="tel" value={newBlocked} onChange={e => setNewBlocked(e.target.value)} placeholder="+33 6 00 00 00 00" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 13, outline: 'none' }} onKeyDown={e => e.key === 'Enter' && addBlocked()} />
              <button onClick={addBlocked} disabled={!newBlocked} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: newBlocked ? '#1A1A1A' : '#E5E5E5', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Bloquer</button>
            </div>
          </div>
          {config.blockedContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9B9B9B', fontSize: 13 }}>Aucun numéro bloqué</div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
              {config.blockedContacts.map((phone, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < config.blockedContacts.length - 1 ? '1px solid #F7F7F7' : 'none' }}>
                  <span style={{ fontSize: 12, flex: 1 }}>🚫 {phone}</span>
                  <button onClick={() => removeBlocked(phone)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #E5E5E5', color: '#6B6B6B', background: '#fff', cursor: 'pointer' }}>Débloquer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Boîte de réception
// ══════════════════════════════════════════════════════════════════════════════
function InboxTab({ showError, showSuccess, onUpdate, saving }: {
  config: RepondeurConfig;
  showError: (m: string) => void;
  showSuccess: (m: string) => void;
  onUpdate: (u: Partial<RepondeurConfig>) => void;
  saving: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [msgFilter, setMsgFilter] = useState('all');
  const [inboxTab, setInboxTab] = useState<'messages' | 'orders' | 'summaries'>('messages');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, o, s] = await Promise.all([
          fetchAPI<{ messages: Message[] }>('/repondeur/messages?limit=50'),
          fetchAPI<{ orders: Order[] }>('/repondeur/orders?limit=20'),
          fetchAPI<{ summaries: Summary[] }>('/repondeur/summaries?limit=10'),
        ]);
        setMessages(m.messages);
        setOrders(o.orders);
        setSummaries(s.summaries);
      } catch { /* silent */ }
    };
    load();
  }, []);

  const generateSummary = async () => {
    setGeneratingSummary(true);
    try {
      await fetchAPI('/repondeur/summaries/generate', { method: 'POST', body: '{}' });
      showSuccess('Résumé en cours de génération...');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setGeneratingSummary(false); }
  };

  const updateOrder = async (id: string, status: string) => {
    try {
      await fetchAPI(`/repondeur/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as Order['status'] } : o));
      showSuccess('Commande mise à jour');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur'); }
  };

  const filteredMessages = msgFilter === 'all' ? messages : messages.filter(m => m.classification === msgFilter);

  const classifCounts: Record<string, number> = {};
  for (const m of messages) classifCounts[m.classification] = (classifCounts[m.classification] ?? 0) + 1;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([['messages', '💬', 'Messages', messages.length], ['orders', '🛒', 'Commandes', orders.length], ['summaries', '📋', 'Résumés', summaries.length]] as [string, string, string, number][]).map(([id, icon, label, count]) => (
          <button key={id} onClick={() => setInboxTab(id as 'messages' | 'orders' | 'summaries')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${inboxTab === id ? '#1A1A1A' : '#E5E5E5'}`, background: inboxTab === id ? 'rgba(0,0,0,0.04)' : '#fff', color: inboxTab === id ? '#1A1A1A' : '#6B6B6B', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            {icon} {label} <span style={{ background: '#E5E5E5', borderRadius: 8, padding: '0 6px', fontSize: 10 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {inboxTab === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setMsgFilter('all')} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${msgFilter === 'all' ? '#1A1A1A' : '#E5E5E5'}`, background: msgFilter === 'all' ? 'rgba(0,0,0,0.04)' : '#fff', color: msgFilter === 'all' ? '#1A1A1A' : '#6B6B6B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              Tous ({messages.length})
            </button>
            {Object.entries(classifCounts).map(([c, n]) => (
              <button key={c} onClick={() => setMsgFilter(c)} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${msgFilter === c ? CLASSIF_COLORS[c] ?? '#1A1A1A' : '#E5E5E5'}`, background: msgFilter === c ? `${CLASSIF_COLORS[c] ?? '#1A1A1A'}12` : '#fff', color: msgFilter === c ? (CLASSIF_COLORS[c] ?? '#1A1A1A') : '#6B6B6B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {c} ({n})
              </button>
            ))}
          </div>
          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9B9B9B', fontSize: 13 }}>Aucun message</div>
          ) : (
            filteredMessages.map(m => (
              <div key={m.id} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E5E5', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, flexShrink: 0, background: `${CLASSIF_COLORS[m.classification] ?? '#9B9B9B'}18`, color: CLASSIF_COLORS[m.classification] ?? '#9B9B9B' }}>
                  {m.classification}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 2 }}>{m.content}</div>
                  <div style={{ fontSize: 10, color: '#9B9B9B' }}>{m.direction === 'inbound' ? '← Reçu' : '→ Envoyé'} · {timeAgo(m.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders */}
      {inboxTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9B9B9B', fontSize: 13 }}>Aucune commande</div>
          ) : (
            orders.map(o => (
              <div key={o.id} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E5E5', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{o.items}</div>
                  <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>{o.total} · {timeAgo(o.createdAt)}</div>
                </div>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, background: o.status === 'pending' ? 'rgba(0,0,0,0.04)' : o.status === 'confirmed' ? 'rgba(0,0,0,0.04)' : '#F7F7F7', color: o.status === 'pending' ? '#1A1A1A' : o.status === 'confirmed' ? '#1A1A1A' : '#6B6B6B', fontWeight: 600 }}>
                  {o.status}
                </span>
                {o.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => updateOrder(o.id, 'confirmed')} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#1A1A1A', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Confirmer</button>
                    <button onClick={() => updateOrder(o.id, 'cancelled')} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid #E5E5E5', color: 'var(--danger)', background: '#fff', cursor: 'pointer' }}>Annuler</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Summaries */}
      {inboxTab === 'summaries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={generateSummary} disabled={generatingSummary} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1A1A1A', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {generatingSummary ? 'Génération...' : 'Générer un résumé maintenant'}
            </button>
          </div>
          {summaries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9B9B9B', fontSize: 13 }}>Aucun résumé généré</div>
          ) : (
            summaries.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.type}</span>
                  <span style={{ fontSize: 10, color: '#9B9B9B' }}>{timeAgo(s.createdAt)}</span>
                </div>
                <pre style={{ fontSize: 11, color: '#6B6B6B', fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{s.content}</pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: Paramètres avancés
// ══════════════════════════════════════════════════════════════════════════════
function SettingsTab({ config, onUpdate, saving }: { config: RepondeurConfig; onUpdate: (u: Partial<RepondeurConfig>) => void; saving: boolean }) {
  const isMobile = useIsMobile();
  const [summaryFreq, setSummaryFreq] = useState(config.summaryFrequency);
  const [summaryChannel, setSummaryChannel] = useState(config.summaryDeliveryChannel);
  const [maxLen, setMaxLen] = useState(config.maxResponseLength);
  const [language, setLanguage] = useState(config.language);
  const [retention, setRetention] = useState(config.gdprRetentionDays);
  const [alwaysOn, setAlwaysOn] = useState(config.schedule.alwaysOn);
  const [schedule, setSchedule] = useState(config.schedule.rules);
  const [changed, setChanged] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);

  const mark = () => setChanged(true);

  const save = () => {
    onUpdate({
      summaryFrequency: summaryFreq,
      summaryDeliveryChannel: summaryChannel,
      maxResponseLength: maxLen,
      language,
      gdprRetentionDays: retention,
      schedule: { ...config.schedule, alwaysOn, rules: schedule },
    });
    setChanged(false);
  };

  const webhookUrl = `${API}/webhook/repondeur`;
  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const toggleDay = (dayIndex: number) => {
    const existing = schedule.find(r => r.dayOfWeek === dayIndex);
    if (existing) {
      setSchedule(prev => prev.map(r => r.dayOfWeek === dayIndex ? { ...r, isActive: !r.isActive } : r));
    } else {
      setSchedule(prev => [...prev, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '18:00', isActive: true }]);
    }
    mark();
  };

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Planning */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>📅 Planning de disponibilité</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 12, color: '#6B6B6B' }}>Toujours actif</span>
            <div
              onClick={() => { setAlwaysOn(!alwaysOn); mark(); }}
              style={{
                width: 36, height: 20, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                background: alwaysOn ? '#1A1A1A' : '#E5E5E5', position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: alwaysOn ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'all 0.2s',
                border: '1px solid #E5E5E5',
              }} />
            </div>
          </label>
        </div>
        {!alwaysOn && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {DAYS.map((day, i) => {
                const rule = schedule.find(r => r.dayOfWeek === i + 1);
                const active = rule?.isActive ?? false;
                return (
                  <button key={i} onClick={() => toggleDay(i + 1)} style={{
                    padding: '6px 10px', borderRadius: 8, border: `1px solid ${active ? '#1A1A1A' : '#E5E5E5'}`,
                    background: active ? 'rgba(0,0,0,0.04)' : '#fff', color: active ? '#1A1A1A' : '#9B9B9B',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>{day}</button>
                );
              })}
            </div>
            {schedule.filter(r => r.isActive).length > 0 && (
              <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                Horaires : {schedule.filter(r => r.isActive).map(r => `${DAYS[r.dayOfWeek - 1] ?? ''} ${r.startTime}–${r.endTime}`).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Résumés + Langue */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📋 Résumés</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Fréquence</label>
              <select value={summaryFreq} onChange={e => { setSummaryFreq(e.target.value); mark(); }} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', background: '#fff' }}>
                <option value="realtime">Temps réel (urgences)</option>
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidien (20h)</option>
                <option value="manual">Manuel uniquement</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Canal de livraison</label>
              <select value={summaryChannel} onChange={e => { setSummaryChannel(e.target.value); mark(); }} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', background: '#fff' }}>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="in-app">In-app seulement</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🌐 Langue & Format</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Langue</label>
              <select value={language} onChange={e => { setLanguage(e.target.value); mark(); }} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E5E5', fontSize: 12, outline: 'none', background: '#fff' }}>
                <option value="auto">Auto-détection</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Longueur max réponse</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={100} max={2000} step={100} value={maxLen} onChange={e => { setMaxLen(parseInt(e.target.value)); mark(); }} style={{ flex: 1, accentColor: '#1A1A1A' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', minWidth: 50 }}>{maxLen} car.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Téléphonie */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📞 Intégration téléphonie</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10 }}>
          {[
            { id: 'A', label: 'Numéro IA perso', price: '~1-2€/mois', desc: 'Numéro dédié, renvoi conditionnel depuis votre tel', badge: 'Recommandé' },
            { id: 'B', label: 'Numéro IA dédié', price: 'Dès 5€/mois', desc: 'Numéro professionnel séparé pour votre business' },
            { id: 'C', label: 'SIP Trunking', price: 'Sur devis', desc: 'Intégration IPBX pour grandes entreprises' },
          ].map(opt => (
            <div key={opt.id} style={{ padding: 14, borderRadius: 8, border: '1px solid #E5E5E5', background: '#F7F7F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Option {opt.id}</span>
                {opt.badge && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A', padding: '2px 6px', borderRadius: 8 }}>{opt.badge}</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: '#1A1A1A', fontWeight: 700, marginBottom: 4 }}>{opt.price}</div>
              <div style={{ fontSize: 10, color: '#9B9B9B' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#6B6B6B' }}>
          Pour activer : contactez <a href="mailto:support@freenzy.io" style={{ color: '#1A1A1A' }}>support@freenzy.io</a>
        </div>
      </div>

      {/* GDPR + Webhooks */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🔒 RGPD</div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', display: 'block', marginBottom: 4 }}>Rétention des données</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={7} max={365} step={7} value={retention} onChange={e => { setRetention(parseInt(e.target.value)); mark(); }} style={{ flex: 1, accentColor: '#1A1A1A' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', minWidth: 55 }}>{retention} jours</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => fetchAPI('/repondeur/gdpr/export', { method: 'POST', body: '{}' }).then(() => alert('Export en cours...')).catch(() => {})}
              style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid #E5E5E5', background: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              ⬆️ Exporter
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #E5E5E5' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🔗 Webhook</div>
          <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 8 }}>URL de notification des événements</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E5E5', fontSize: 10, color: '#6B6B6B', background: '#F7F7F7', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {webhookUrl}
            </div>
            <button onClick={copyWebhook} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #E5E5E5', background: webhookCopied ? '#fff' : '#fff', color: webhookCopied ? '#1A1A1A' : '#6B6B6B', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              {webhookCopied ? '✅' : 'Copier'}
            </button>
          </div>
        </div>
      </div>

      <SaveBar saving={saving} onSave={save} changed={changed} />
    </div>
  );
}
