'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META, REPONDEUR_MODE_EMOJIS, REPONDEUR_SCENARIO_EMOJIS } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useVisitorDraftObject } from '../../../lib/useVisitorDraft';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, tabBar } from '../../../lib/page-styles';

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
  urgent: CU.text, vip: CU.text, order: CU.text, complaint: CU.text,
  appointment: CU.textSecondary, faq: CU.textSecondary, family: CU.textSecondary, spam: CU.textMuted,
  general: CU.textMuted, blocked: CU.textMuted,
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
function StatCard({ emoji, value, label }: { emoji: string; value: number | string; label: string; color?: string }) {
  return (
    <div style={{ ...CU.card, flex: 1, minWidth: 100 }}>
      <div style={{ marginBottom: 4, fontSize: 22 }}>{emoji}</div>
      <div style={{ ...CU.statValue, fontSize: 24, fontWeight: 800 }}>{value}</div>
      <div style={{ ...CU.statLabel }}>{label}</div>
    </div>
  );
}

function SaveBar({ saving, onSave, changed }: { saving: boolean; onSave: () => void; changed: boolean }) {
  if (!changed && !saving) return null;
  return (
    <div style={{
      position: 'sticky', bottom: 0, background: CU.bg, borderTop: `1px solid ${CU.border}`,
      padding: '10px 20px', display: 'flex', justifyContent: 'flex-end', zIndex: 10,
    }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          ...CU.btnPrimary,
          padding: '8px 20px',
          background: saving ? CU.textMuted : CU.accent,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 600,
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
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${CU.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 14, color: CU.textSecondary }}>Chargement du répondeur...</span>
      </div>
    );
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = (error || success) ? (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 1000,
      padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      background: CU.bg,
      color: error ? CU.danger : CU.text,
      border: `1px solid ${CU.border}`,
    }}>
      {error || success}
    </div>
  ) : null;

  // ── Wizard ────────────────────────────────────────────────────────────────
  if (!config) {
    return (
      <div style={{ ...pageContainer(isMobile), maxWidth: 700 }}>
        {toast}
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 12, fontSize: 48 }}>{PAGE_META.repondeur.emoji}</div>
          <h1 style={{ ...CU.pageTitle, fontSize: 22, fontWeight: 800 }}>Configurer votre répondeur <span className="fz-logo-word">IA</span></h1>
          <p style={{ ...CU.pageSubtitle, marginTop: 8, fontSize: 14 }}>
            Votre assistant répondra automatiquement à vos messages WhatsApp
          </p>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: wizardStep >= s ? CU.accent : CU.accentLight,
                  color: wizardStep >= s ? 'white' : CU.textMuted,
                }}>{s}</div>
                {s < 3 && <div style={{ width: 40, height: 2, background: wizardStep > s ? CU.accent : CU.border }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Scenario */}
        {wizardStep === 1 && (
          <div>
            <h2 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
              1 — Quel est votre cas d'usage ?
            </h2>
            <div style={cardGrid(isMobile, 2)}>
              {SCENARIO_TEMPLATES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setWizardScenario(s.id)}
                  style={{
                    padding: 16, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${wizardScenario === s.id ? CU.accent : CU.border}`,
                    background: wizardScenario === s.id ? CU.accentLight : CU.bg,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ marginBottom: 6, fontSize: 24 }}>{REPONDEUR_SCENARIO_EMOJIS[s.id] ?? '📞'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: CU.text }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: CU.textSecondary, marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => wizardScenario && setWizardStep(2)}
                disabled={!wizardScenario}
                style={{
                  ...CU.btnPrimary,
                  padding: '10px 32px', minHeight: 44,
                  background: wizardScenario ? CU.accent : CU.border,
                  color: wizardScenario ? 'white' : CU.textMuted,
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
            <h2 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
              2 — Numéro d'alerte patron
            </h2>
            <p style={{ ...CU.pageSubtitle, textAlign: 'center', marginBottom: 20, fontSize: 12 }}>
              Pour les messages urgents, le répondeur vous envoie immédiatement une alerte WhatsApp.
            </p>
            <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 20, border: `1px solid ${CU.border}` }}>
              <label style={{ ...CU.label, display: 'block', marginBottom: 8, fontWeight: 700 }}>
                Votre numéro WhatsApp
              </label>
              <input
                type="tel"
                value={wizardPhone}
                onChange={e => setWizardPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                style={{ ...CU.input, fontSize: 14, padding: '10px 14px' }}
              />
              <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 6 }}>
                Optionnel — vous pouvez l'ajouter plus tard dans Paramètres
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <button onClick={() => setWizardStep(1)} style={{ ...CU.btnGhost, padding: '10px 20px', fontFamily: 'inherit' }}>
                ← Retour
              </button>
              <button onClick={() => setWizardStep(3)} style={{ ...CU.btnPrimary, padding: '10px 28px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {wizardStep === 3 && (
          <div>
            <h2 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
              3 — Prêt à démarrer !
            </h2>
            <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 20, border: `1px solid ${CU.border}`, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={emojiIcon(20)}>{REPONDEUR_SCENARIO_EMOJIS[wizardScenario] ?? '📞'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: CU.text }}>Scénario</div>
                    <div style={{ fontSize: 12, color: CU.textMuted }}>{SCENARIO_TEMPLATES.find(s => s.id === wizardScenario)?.label}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={emojiIcon(20)}>📞</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: CU.text }}>Numéro d'alerte</div>
                    <div style={{ fontSize: 12, color: CU.textMuted }}>{wizardPhone || 'Non défini (à configurer plus tard)'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: CU.accentLight, borderRadius: 8, padding: 14, fontSize: 12, color: CU.text, marginBottom: 20 }}>
              💡 Après activation, vous pouvez tout personnaliser : modes, styles, FAQ, VIP, planning...
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setWizardStep(2)} style={{ ...CU.btnGhost, padding: '10px 20px', fontFamily: 'inherit' }}>
                ← Retour
              </button>
              <button
                onClick={finishWizard}
                disabled={saving}
                style={{
                  ...CU.btnPrimary,
                  padding: '10px 32px', minHeight: 44,
                  background: saving ? CU.textMuted : CU.accent,
                  fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
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
      <div style={{ padding: '16px 20px 0', background: CU.bg, borderBottom: `1px solid ${CU.border}` }}>
        <div style={{ ...headerRow(), marginBottom: 12, gap: 14 }}>
          <span style={emojiIcon(18)}>{PAGE_META.repondeur.emoji}</span>
          <div>
            <h1 style={{ ...CU.pageTitle, fontSize: 18, fontWeight: 800 }}>
              {PAGE_META.repondeur.title}
              <HelpBubble text={PAGE_META.repondeur.helpText} />
            </h1>
            <p style={{ ...CU.pageSubtitle, fontSize: 12 }}>
              {PAGE_META.repondeur.subtitle}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: config.isActive ? CU.text : CU.danger, fontWeight: 600 }}>
              {config.isActive ? '● Actif' : '● Inactif'}
            </span>
            <button
              onClick={() => updateConfig({ isActive: !config.isActive })}
              style={{
                ...(config.isActive ? CU.btnDanger : CU.btnGhost),
                padding: '10px 14px', fontSize: 12, fontWeight: 700,
                minHeight: 44, fontFamily: 'inherit',
                background: config.isActive ? '#fef2f2' : CU.bg,
                color: config.isActive ? CU.danger : CU.text,
              }}
            >
              {config.isActive ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>
        <PageExplanation pageId="repondeur" text={PAGE_META.repondeur?.helpText} />

        {/* Tabs */}
        <div style={tabBar()}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={tab === t.id ? { ...CU.tabActive, fontSize: 12 } : { ...CU.tab, fontSize: 12 }}
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
        <StatCard emoji="💬" value={stats?.messages.today ?? stats?.messages.inbound ?? 0} label="Messages aujourd'hui" />
        <StatCard emoji="🛒" value={stats?.orders.pending ?? 0} label="Commandes en attente" />
        <StatCard emoji="🚨" value={stats?.messages.urgent ?? 0} label="Alertes urgentes" />
        <StatCard emoji="⭐" value={stats?.messages.vip ?? 0} label="VIP détectés" />
      </div>

      {/* Current mode */}
      <div style={CU.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ ...CU.sectionTitle, fontSize: 13 }}>Mode actif</span>
          <button style={{ ...CU.btnSmall }} onClick={() => { /* switch to config tab is done externally */ }}>
            Changer
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={emojiIcon(28)}>{REPONDEUR_MODE_EMOJIS[config.activeMode] ?? '📞'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{mode?.label ?? config.activeMode}</div>
            <div style={{ fontSize: 12, color: CU.textSecondary }}>{mode?.desc ?? ''}</div>
          </div>
        </div>
        {config.greetingMessage && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: CU.bgSecondary, borderRadius: 8, fontSize: 12, color: CU.textSecondary, borderLeft: `3px solid ${CU.accent}` }}>
            "{config.greetingMessage}"
          </div>
        )}
      </div>

      {/* Test zone */}
      <div style={CU.card}>
        <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 10 }}>🧪 Tester le répondeur</div>
        {testSent ? (
          <div style={{ padding: '10px 14px', background: CU.bg, borderRadius: 8, fontSize: 13, color: CU.text, fontWeight: 600 }}>
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
              style={{ ...CU.input, flex: 1 }}
            />
            <button
              onClick={sendTest}
              disabled={!testMessage.trim()}
              style={{
                ...CU.btnPrimary,
                fontFamily: 'inherit',
                background: testMessage.trim() ? CU.accent : CU.border,
                color: testMessage.trim() ? 'white' : CU.textMuted,
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
        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>📨 Activité récente</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentMessages.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                borderBottom: `1px solid ${CU.bgSecondary}`,
              }}>
                <span style={{
                  ...CU.badge,
                  fontSize: 10, padding: '2px 7px', flexShrink: 0, marginTop: 1,
                  background: `${CLASSIF_COLORS[m.classification] ?? CU.textMuted}18`,
                  color: CLASSIF_COLORS[m.classification] ?? CU.textMuted,
                }}>
                  {m.classification}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: CU.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.content}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: CU.textMuted, flexShrink: 0 }}>{timeAgo(m.createdAt)}</span>
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
      <div style={CU.card}>
        <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>⚡ Presets rapides</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              style={{
                padding: '10px 14px', borderRadius: 20, border: `1px solid ${CU.border}`, minHeight: 44,
                background: mode === p.mode ? CU.accentLight : CU.bg,
                color: mode === p.mode ? CU.text : CU.textSecondary,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div style={CU.card}>
        <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🎭 Mode de réponse</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); markChanged(); }}
              style={{
                padding: '12px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${mode === m.value ? CU.accent : CU.border}`,
                background: mode === m.value ? CU.accentLight : CU.bgSecondary,
                fontFamily: 'inherit',
              }}
            >
              <div style={{ marginBottom: 4, fontSize: 20 }}>{REPONDEUR_MODE_EMOJIS[m.value] ?? '📞'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: CU.text }}>{m.label}</div>
              <div style={{ fontSize: 10, color: CU.textMuted, marginTop: 2, lineHeight: 1.3 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Style */}
        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🎨 Style de réponse</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STYLES.map(s => (
              <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: style === s.value ? CU.accentLight : 'transparent' }}>
                <input type="radio" checked={style === s.value} onChange={() => { setStyle(s.value); markChanged(); }} style={{ accentColor: CU.accent }} />
                <span style={{ fontSize: 12, fontWeight: style === s.value ? 600 : 400 }}>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🔧 Compétences actives</div>
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
                    background: active ? CU.bg : CU.bgSecondary, fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    background: active ? CU.accent : CU.border,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12 }}>{s.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? CU.text : CU.textSecondary }}>
                    {s.label}{s.always ? ' (toujours)' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={CU.card}>
        <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>💬 Messages</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ ...CU.label, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 700, fontSize: 11 }}>
              Message d'accueil
            </label>
            <textarea
              value={greeting}
              onChange={e => { setGreeting(e.target.value); markChanged(); }}
              placeholder="Bonjour, je suis le répondeur de [nom]..."
              rows={3}
              style={{ ...CU.textarea, fontSize: 12, padding: '8px 10px', minHeight: 'auto' }}
            />
          </div>
          <div>
            <label style={{ ...CU.label, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 700, fontSize: 11 }}>
              Message d'absence
            </label>
            <textarea
              value={absence}
              onChange={e => { setAbsence(e.target.value); markChanged(); }}
              placeholder="Je suis actuellement indisponible..."
              rows={3}
              style={{ ...CU.textarea, fontSize: 12, padding: '8px 10px', minHeight: 'auto' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ ...CU.label, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 700, fontSize: 11 }}>
            📞 Numéro patron (alertes urgences)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); markChanged(); }}
            placeholder="+33 6 12 34 56 78"
            style={{ ...CU.input, padding: '8px 10px' }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ ...CU.label, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 700, fontSize: 11 }}>
            Instructions personnalisées
          </label>
          <textarea
            value={instructions}
            onChange={e => { setInstructions(e.target.value); markChanged(); }}
            placeholder="Toujours mentionner notre délai de livraison de 48h..."
            rows={2}
            style={{ ...CU.textarea, fontSize: 12, padding: '8px 10px', minHeight: 'auto' }}
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
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: CU.bgSecondary, borderRadius: 8, padding: 4, width: isMobile ? '100%' : 'fit-content', flexWrap: 'wrap' }}>
        {([['faq', '❓', 'FAQ', config.faqEntries.length], ['vip', '⭐', 'VIP', config.vipContacts.length], ['blocked', '🚫', 'Bloqués', config.blockedContacts.length]] as [string, string, string, number][]).map(([id, tabIcon, label, count]) => (
          <button
            key={id}
            onClick={() => setSubTab(id as 'vip' | 'faq' | 'blocked')}
            style={{
              padding: '10px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              minHeight: 44, background: subTab === id ? CU.bg : 'transparent',
              color: subTab === id ? CU.text : CU.textSecondary,
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}
          >
            {tabIcon} {label}
            <span style={{ ...CU.badge, borderRadius: 8, padding: '0 6px', fontSize: 10 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* FAQ */}
      {subTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Add form */}
          <div style={CU.card}>
            <div style={{ ...CU.label, fontWeight: 700, marginBottom: 10 }}>➕ Ajouter une entrée FAQ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Question (ex: Quels sont vos horaires ?)" style={CU.input} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={newA} onChange={e => setNewA(e.target.value)} placeholder="Réponse complète..." style={{ ...CU.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addFaq()} />
                <button onClick={addFaq} disabled={!newQ || !newA} style={{
                  ...CU.btnPrimary, fontFamily: 'inherit',
                  background: newQ && newA ? CU.accent : CU.border,
                  color: newQ && newA ? 'white' : CU.textMuted,
                  cursor: newQ && newA ? 'pointer' : 'not-allowed',
                }}>Ajouter</button>
              </div>
            </div>
          </div>
          {/* List */}
          {config.faqEntries.length === 0 ? (
            <div style={{ ...CU.emptyState, padding: 32 }}>
              <div style={CU.emptyDesc}>Aucune entrée FAQ</div>
            </div>
          ) : (
            config.faqEntries.map(f => (
              <div key={f.id} style={{ ...CU.card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: CU.text }}>❓ {f.question}</div>
                  <div style={{ fontSize: 12, color: CU.textSecondary, marginTop: 4 }}>{f.answer}</div>
                </div>
                <button onClick={() => deleteFaq(f.id)} style={{ ...CU.btnSmall, color: CU.danger, fontFamily: 'inherit' }}>Suppr.</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIP */}
      {subTab === 'vip' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={CU.card}>
            <div style={{ ...CU.label, fontWeight: 700, marginBottom: 10 }}>➕ Ajouter un contact VIP</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="tel" value={newVipPhone} onChange={e => setNewVipPhone(e.target.value)} placeholder="+33 6..." style={{ ...CU.input, flex: '1 1 120px', minWidth: 0, minHeight: 44 }} />
              <input type="text" value={newVipName} onChange={e => setNewVipName(e.target.value)} placeholder="Nom" style={{ ...CU.input, flex: '1 1 100px', minWidth: 0, minHeight: 44 }} />
              <input type="text" value={newVipRel} onChange={e => setNewVipRel(e.target.value)} placeholder="Relation (ex: Client, Ami...)" style={{ ...CU.input, flex: '1 1 120px', minWidth: 0, minHeight: 44 }} />
              <button onClick={addVip} disabled={!newVipPhone || !newVipName} style={{
                ...CU.btnPrimary, minHeight: 44, fontFamily: 'inherit',
                background: newVipPhone && newVipName ? CU.accent : CU.border,
              }}>Ajouter</button>
            </div>
          </div>
          {config.vipContacts.length === 0 ? (
            <div style={{ ...CU.emptyState, padding: 32 }}>
              <div style={CU.emptyDesc}>Aucun contact VIP</div>
            </div>
          ) : (
            config.vipContacts.map((v, i) => (
              <div key={i} style={{ ...CU.card, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: CU.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⭐</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: CU.text }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: CU.textMuted }}>{v.phone}{v.relationship ? ` · ${v.relationship}` : ''}</div>
                </div>
                <button onClick={() => removeVip(v.phone)} style={{ ...CU.btnSmall, color: CU.danger, fontFamily: 'inherit' }}>Retirer</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blocked */}
      {subTab === 'blocked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={CU.card}>
            <div style={{ ...CU.label, fontWeight: 700, marginBottom: 10 }}>🚫 Bloquer un numéro</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="tel" value={newBlocked} onChange={e => setNewBlocked(e.target.value)} placeholder="+33 6 00 00 00 00" style={{ ...CU.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addBlocked()} />
              <button onClick={addBlocked} disabled={!newBlocked} style={{
                ...CU.btnPrimary, fontFamily: 'inherit',
                background: newBlocked ? CU.accent : CU.border,
              }}>Bloquer</button>
            </div>
          </div>
          {config.blockedContacts.length === 0 ? (
            <div style={{ ...CU.emptyState, padding: 32 }}>
              <div style={CU.emptyDesc}>Aucun numéro bloqué</div>
            </div>
          ) : (
            <div style={{ ...CU.card, padding: 0, overflow: 'hidden' }}>
              {config.blockedContacts.map((phone, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < config.blockedContacts.length - 1 ? `1px solid ${CU.bgSecondary}` : 'none' }}>
                  <span style={{ fontSize: 12, flex: 1 }}>🚫 {phone}</span>
                  <button onClick={() => removeBlocked(phone)} style={{ ...CU.btnSmall, fontFamily: 'inherit' }}>Débloquer</button>
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
          <button key={id} onClick={() => setInboxTab(id as 'messages' | 'orders' | 'summaries')} style={{
            padding: '7px 14px', borderRadius: 8,
            border: `1px solid ${inboxTab === id ? CU.accent : CU.border}`,
            background: inboxTab === id ? CU.accentLight : CU.bg,
            color: inboxTab === id ? CU.text : CU.textSecondary,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'inherit',
          }}>
            {icon} {label} <span style={{ ...CU.badge, borderRadius: 8, padding: '0 6px', fontSize: 10 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {inboxTab === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setMsgFilter('all')} style={{
              padding: '4px 12px', borderRadius: 20,
              border: `1px solid ${msgFilter === 'all' ? CU.accent : CU.border}`,
              background: msgFilter === 'all' ? CU.accentLight : CU.bg,
              color: msgFilter === 'all' ? CU.text : CU.textSecondary,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Tous ({messages.length})
            </button>
            {Object.entries(classifCounts).map(([c, n]) => (
              <button key={c} onClick={() => setMsgFilter(c)} style={{
                padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${msgFilter === c ? CLASSIF_COLORS[c] ?? CU.accent : CU.border}`,
                background: msgFilter === c ? `${CLASSIF_COLORS[c] ?? CU.accent}12` : CU.bg,
                color: msgFilter === c ? (CLASSIF_COLORS[c] ?? CU.accent) : CU.textSecondary,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {c} ({n})
              </button>
            ))}
          </div>
          {filteredMessages.length === 0 ? (
            <div style={{ ...CU.emptyState, padding: 40 }}>
              <div style={CU.emptyDesc}>Aucun message</div>
            </div>
          ) : (
            filteredMessages.map(m => (
              <div key={m.id} style={{ ...CU.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  ...CU.badge, padding: '3px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  background: `${CLASSIF_COLORS[m.classification] ?? CU.textMuted}18`,
                  color: CLASSIF_COLORS[m.classification] ?? CU.textMuted,
                }}>
                  {m.classification}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 2 }}>{m.content}</div>
                  <div style={{ fontSize: 10, color: CU.textMuted }}>{m.direction === 'inbound' ? '← Reçu' : '→ Envoyé'} · {timeAgo(m.createdAt)}</div>
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
            <div style={{ ...CU.emptyState, padding: 40 }}>
              <div style={CU.emptyDesc}>Aucune commande</div>
            </div>
          ) : (
            orders.map(o => (
              <div key={o.id} style={{ ...CU.card, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: CU.text }}>{o.items}</div>
                  <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 2 }}>{o.total} · {timeAgo(o.createdAt)}</div>
                </div>
                <span style={{
                  ...CU.badge, fontSize: 10, padding: '3px 8px',
                  background: o.status === 'pending' ? CU.accentLight : o.status === 'confirmed' ? CU.accentLight : CU.bgSecondary,
                  color: o.status === 'pending' ? CU.text : o.status === 'confirmed' ? CU.text : CU.textSecondary,
                  fontWeight: 600,
                }}>
                  {o.status}
                </span>
                {o.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => updateOrder(o.id, 'confirmed')} style={{
                      ...CU.btnPrimary, fontSize: 10, padding: '4px 8px', height: 'auto', fontFamily: 'inherit',
                    }}>Confirmer</button>
                    <button onClick={() => updateOrder(o.id, 'cancelled')} style={{
                      ...CU.btnSmall, color: CU.danger, fontSize: 10, fontFamily: 'inherit',
                    }}>Annuler</button>
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
            <button onClick={generateSummary} disabled={generatingSummary} style={{ ...CU.btnPrimary, fontFamily: 'inherit' }}>
              {generatingSummary ? 'Génération...' : 'Générer un résumé maintenant'}
            </button>
          </div>
          {summaries.length === 0 ? (
            <div style={{ ...CU.emptyState, padding: 40 }}>
              <div style={CU.emptyDesc}>Aucun résumé généré</div>
            </div>
          ) : (
            summaries.map(s => (
              <div key={s.id} style={CU.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CU.text, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.type}</span>
                  <span style={{ fontSize: 10, color: CU.textMuted }}>{timeAgo(s.createdAt)}</span>
                </div>
                <pre style={{ fontSize: 11, color: CU.textSecondary, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{s.content}</pre>
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
      <div style={CU.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ ...CU.sectionTitle, fontSize: 13 }}>📅 Planning de disponibilité</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 12, color: CU.textSecondary }}>Toujours actif</span>
            <div
              onClick={() => { setAlwaysOn(!alwaysOn); mark(); }}
              style={{
                width: 36, height: 20, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                background: alwaysOn ? CU.accent : CU.border, position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: alwaysOn ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: CU.bg, transition: 'all 0.2s',
                border: `1px solid ${CU.border}`,
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
                    padding: '6px 10px', borderRadius: 8, border: `1px solid ${active ? CU.accent : CU.border}`,
                    background: active ? CU.accentLight : CU.bg, color: active ? CU.text : CU.textMuted,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{day}</button>
                );
              })}
            </div>
            {schedule.filter(r => r.isActive).length > 0 && (
              <div style={{ fontSize: 11, color: CU.textSecondary }}>
                Horaires : {schedule.filter(r => r.isActive).map(r => `${DAYS[r.dayOfWeek - 1] ?? ''} ${r.startTime}–${r.endTime}`).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Résumés + Langue */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>📋 Résumés</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 4 }}>Fréquence</label>
              <select value={summaryFreq} onChange={e => { setSummaryFreq(e.target.value); mark(); }} style={{ ...CU.select, width: '100%' }}>
                <option value="realtime">Temps réel (urgences)</option>
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidien (20h)</option>
                <option value="manual">Manuel uniquement</option>
              </select>
            </div>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 4 }}>Canal de livraison</label>
              <select value={summaryChannel} onChange={e => { setSummaryChannel(e.target.value); mark(); }} style={{ ...CU.select, width: '100%' }}>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="in-app">In-app seulement</option>
              </select>
            </div>
          </div>
        </div>

        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🌐 Langue & Format</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 4 }}>Langue</label>
              <select value={language} onChange={e => { setLanguage(e.target.value); mark(); }} style={{ ...CU.select, width: '100%' }}>
                <option value="auto">Auto-détection</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 4 }}>Longueur max réponse</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={100} max={2000} step={100} value={maxLen} onChange={e => { setMaxLen(parseInt(e.target.value)); mark(); }} style={{ flex: 1, accentColor: CU.accent }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: CU.text, minWidth: 50 }}>{maxLen} car.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Téléphonie */}
      <div style={CU.card}>
        <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>📞 Intégration téléphonie</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10 }}>
          {[
            { id: 'A', label: 'Numéro IA perso', price: '~1-2€/mois', desc: 'Numéro dédié, renvoi conditionnel depuis votre tel', badge: 'Recommandé' },
            { id: 'B', label: 'Numéro IA dédié', price: 'Dès 5€/mois', desc: 'Numéro professionnel séparé pour votre business' },
            { id: 'C', label: 'SIP Trunking', price: 'Sur devis', desc: 'Intégration IPBX pour grandes entreprises' },
          ].map(opt => (
            <div key={opt.id} style={{ padding: 14, borderRadius: 8, border: `1px solid ${CU.border}`, background: CU.bgSecondary }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: CU.text }}>Option {opt.id}</span>
                {opt.badge && <span style={{ ...CU.badge, fontSize: 9, fontWeight: 700 }}>{opt.badge}</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: CU.text }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: CU.text, fontWeight: 700, marginBottom: 4 }}>{opt.price}</div>
              <div style={{ fontSize: 10, color: CU.textMuted }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: CU.textSecondary }}>
          Pour activer : contactez <a href="mailto:support@freenzy.io" style={{ color: CU.accent }}>support@freenzy.io</a>
        </div>
      </div>

      {/* GDPR + Webhooks */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🔒 RGPD</div>
          <div>
            <label style={{ ...CU.label, display: 'block', marginBottom: 4 }}>Rétention des données</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={7} max={365} step={7} value={retention} onChange={e => { setRetention(parseInt(e.target.value)); mark(); }} style={{ flex: 1, accentColor: CU.accent }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: CU.text, minWidth: 55 }}>{retention} jours</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => fetchAPI('/repondeur/gdpr/export', { method: 'POST', body: '{}' }).then(() => alert('Export en cours...')).catch(() => {})}
              style={{ ...CU.btnGhost, flex: 1, fontFamily: 'inherit' }}
            >
              ⬆️ Exporter
            </button>
          </div>
        </div>

        <div style={CU.card}>
          <div style={{ ...CU.sectionTitle, fontSize: 13, marginBottom: 12 }}>🔗 Webhook</div>
          <div style={{ fontSize: 11, color: CU.textSecondary, marginBottom: 8 }}>URL de notification des événements</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${CU.border}`, fontSize: 10, color: CU.textSecondary, background: CU.bgSecondary, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {webhookUrl}
            </div>
            <button onClick={copyWebhook} style={{ ...CU.btnSmall, fontFamily: 'inherit' }}>
              {webhookCopied ? '✅' : 'Copier'}
            </button>
          </div>
        </div>
      </div>

      <SaveBar saving={saving} onSave={save} changed={changed} />
    </div>
  );
}
