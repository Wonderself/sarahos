'use client';

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';

// ─── Notion Palette ───────────────────────────────────────────
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  accent: '#0EA5E9',
  danger: '#DC2626',
  success: '#38A169',
  warning: '#D69E2E',
} as const;

// ─── Types ────────────────────────────────────────────────────
type TabId = 'profile' | 'dashboard' | 'notifications' | 'validations' | 'agents' | 'integrations' | 'team';
type UserRole = 'viewer' | 'member' | 'admin' | 'owner';

interface ProfileSettings {
  displayName: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  avatarUrl: string;
}

interface DashboardSettings {
  defaultPage: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showWelcome: boolean;
  refreshInterval: number;
  dateFormat: string;
}

interface NotificationSettings {
  emailDigest: boolean;
  emailFrequency: string;
  pushEnabled: boolean;
  pushAgentAlerts: boolean;
  pushCreditAlerts: boolean;
  pushTeamUpdates: boolean;
  soundEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface ValidationSettings {
  requireApproval: boolean;
  approvalThreshold: number;
  autoApproveKnown: boolean;
  notifyOnPending: boolean;
}

interface AgentSettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
  autoRetry: boolean;
  contextWindow: string;
}

interface IntegrationSettings {
  webhookUrl: string;
  webhookEnabled: boolean;
  slackEnabled: boolean;
  slackChannel: string;
  zapierEnabled: boolean;
  apiAccessEnabled: boolean;
}

interface TeamSettings {
  orgName: string;
  orgPlan: string;
  maxMembers: number;
  currentMembers: number;
}

interface AllSettings {
  profile: ProfileSettings;
  dashboard: DashboardSettings;
  notifications: NotificationSettings;
  validations: ValidationSettings;
  agents: AgentSettings;
  integrations: IntegrationSettings;
  team: TeamSettings;
  userRole: UserRole;
  hasOrg: boolean;
}

// ─── Default Settings ─────────────────────────────────────────
const DEFAULT_SETTINGS: AllSettings = {
  profile: {
    displayName: '',
    email: '',
    phone: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    avatarUrl: '',
  },
  dashboard: {
    defaultPage: '/client/dashboard',
    sidebarCollapsed: false,
    compactMode: false,
    showWelcome: true,
    refreshInterval: 30,
    dateFormat: 'DD/MM/YYYY',
  },
  notifications: {
    emailDigest: true,
    emailFrequency: 'daily',
    pushEnabled: true,
    pushAgentAlerts: true,
    pushCreditAlerts: true,
    pushTeamUpdates: false,
    soundEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  validations: {
    requireApproval: false,
    approvalThreshold: 50,
    autoApproveKnown: true,
    notifyOnPending: true,
  },
  agents: {
    defaultModel: 'claude-sonnet',
    temperature: 0.7,
    maxTokens: 4096,
    streamingEnabled: true,
    autoRetry: true,
    contextWindow: '100k',
  },
  integrations: {
    webhookUrl: '',
    webhookEnabled: false,
    slackEnabled: false,
    slackChannel: '',
    zapierEnabled: false,
    apiAccessEnabled: false,
  },
  team: {
    orgName: '',
    orgPlan: 'free',
    maxMembers: 5,
    currentMembers: 1,
  },
  userRole: 'owner',
  hasOrg: false,
};

// ─── Tabs Configuration ──────────────────────────────────────
interface TabDef {
  id: TabId;
  label: string;
  emoji: string;
  requiresOrg?: boolean;
}

const TABS: TabDef[] = [
  { id: 'profile', label: 'Mon Profil', emoji: '👤' },
  { id: 'dashboard', label: 'Mon Dashboard', emoji: '🏠' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔' },
  { id: 'validations', label: 'Validations', emoji: '✅' },
  { id: 'agents', label: 'Agents', emoji: '🤖' },
  { id: 'integrations', label: 'Integrations', emoji: '🔗' },
  { id: 'team', label: 'Mon Equipe', emoji: '👥', requiresOrg: true },
];

// ─── Auth Helper ──────────────────────────────────────────────
function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? '';
  } catch {
    return '';
  }
}

// ─── Styles ───────────────────────────────────────────────────
const S: Record<string, CSSProperties> = {
  page: {
    padding: 28,
    maxWidth: 900,
    margin: '0 auto',
    minHeight: '100vh',
    background: C.bg,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  emoji: { fontSize: 24, lineHeight: 1 },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    margin: '0 0 20px 0',
  },
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: `1px solid ${C.border}`,
    marginBottom: 24,
    overflowX: 'auto',
  },
  tab: {
    padding: '10px 16px',
    fontSize: 13,
    color: C.muted,
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: C.text,
    borderBottomColor: C.text,
    fontWeight: 600,
  },
  saveIndicator: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    transition: 'opacity 0.3s',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: C.text,
    margin: '0 0 12px 0',
  },
  card: {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  fieldRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  field: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: C.secondary,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 36,
    padding: '0 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: C.text,
    background: C.bg,
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    height: 36,
    padding: '0 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: C.text,
    background: C.bg,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: 10,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: C.text,
    background: C.bg,
    outline: 'none',
    resize: 'vertical',
    minHeight: 60,
    lineHeight: 1.5,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${C.border}`,
  },
  toggleLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: 500,
  },
  toggleDesc: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    padding: 0,
    flexShrink: 0,
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  slider: {
    width: '100%',
    height: 4,
    appearance: 'none',
    background: C.border,
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: 600,
    color: C.accent,
    marginLeft: 8,
  },
  dangerZone: {
    border: `1px solid ${C.danger}30`,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: C.danger,
    margin: '0 0 8px 0',
  },
  dangerBtn: {
    height: 32,
    padding: '0 14px',
    background: C.bg,
    color: C.danger,
    border: `1px solid ${C.danger}`,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  teamInfo: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1,
    minWidth: 120,
    padding: 14,
    background: C.bgSecondary,
    borderRadius: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    color: C.muted,
    fontSize: 14,
  },
  roleTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
    background: `${C.accent}15`,
    color: C.accent,
    marginLeft: 8,
  },
};

// ─── Toggle Component ─────────────────────────────────────────
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div style={S.toggleRow}>
      <div>
        <div style={S.toggleLabel}>{label}</div>
        {description && <div style={S.toggleDesc}>{description}</div>}
      </div>
      <button
        style={{
          ...S.toggle,
          background: checked ? C.success : C.border,
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          style={{
            ...S.toggleDot,
            left: checked ? 20 : 2,
          }}
        />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function PersonalizationPage() {
  const [settings, setSettings] = useState<AllSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch settings on mount ───────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/settings/personalization', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: AllSettings = await res.json();
          setSettings(data);
        }
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Auto-save with debounce ───────────────────────────────
  const autoSave = useCallback(
    (updated: AllSettings) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          const token = getToken();
          const res = await fetch('/api/settings/personalization', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          });
          setSaveStatus(res.ok ? 'saved' : 'error');
        } catch {
          setSaveStatus('error');
        }
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
    },
    []
  );

  // ── Update helpers ────────────────────────────────────────
  function updateProfile(field: keyof ProfileSettings, value: string) {
    setSettings(prev => {
      const next = { ...prev, profile: { ...prev.profile, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  function updateDashboard<K extends keyof DashboardSettings>(field: K, value: DashboardSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, dashboard: { ...prev.dashboard, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  function updateNotifications<K extends keyof NotificationSettings>(field: K, value: NotificationSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, notifications: { ...prev.notifications, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  function updateValidations<K extends keyof ValidationSettings>(field: K, value: ValidationSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, validations: { ...prev.validations, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  function updateAgents<K extends keyof AgentSettings>(field: K, value: AgentSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, agents: { ...prev.agents, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  function updateIntegrations<K extends keyof IntegrationSettings>(field: K, value: IntegrationSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, integrations: { ...prev.integrations, [field]: value } };
      autoSave(next);
      return next;
    });
  }

  // ── Visible tabs ──────────────────────────────────────────
  const visibleTabs = TABS.filter(t => !t.requiresOrg || settings.hasOrg);

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.loadingContainer}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          <div>Chargement des parametres...</div>
        </div>
      </div>
    );
  }

  // ── Tab Content Renderers ─────────────────────────────────
  function renderProfile() {
    const p = settings.profile;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Informations personnelles</h3>
        <div style={S.card}>
          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Nom d&apos;affichage</label>
              <input
                style={S.input}
                value={p.displayName}
                onChange={e => updateProfile('displayName', e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <input
                style={{ ...S.input, background: C.bgSecondary, color: C.muted }}
                value={p.email}
                readOnly
              />
            </div>
          </div>
          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Telephone</label>
              <input
                style={S.input}
                value={p.phone}
                onChange={e => updateProfile('phone', e.target.value)}
                placeholder="+33 6 00 00 00 00"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Langue</label>
              <select
                style={S.select}
                value={p.language}
                onChange={e => updateProfile('language', e.target.value)}
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="he">Hebrew</option>
              </select>
            </div>
          </div>
          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Fuseau horaire</label>
              <select
                style={S.select}
                value={p.timezone}
                onChange={e => updateProfile('timezone', e.target.value)}
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="Asia/Jerusalem">Asia/Jerusalem (UTC+2)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={S.dangerZone}>
          <h4 style={S.dangerTitle}>Zone dangereuse</h4>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            La suppression de votre compte est irreversible. Toutes vos donnees seront supprimees sous 30 jours.
          </p>
          <button style={S.dangerBtn}>Supprimer mon compte</button>
        </div>
      </div>
    );
  }

  function renderDashboard() {
    const d = settings.dashboard;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Apparence et comportement</h3>
        <div style={S.card}>
          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Page par defaut</label>
              <select
                style={S.select}
                value={d.defaultPage}
                onChange={e => updateDashboard('defaultPage', e.target.value)}
              >
                <option value="/client/dashboard">Dashboard</option>
                <option value="/client/agents">Agents</option>
                <option value="/client/discussions">Discussions</option>
                <option value="/client/studio">Studio</option>
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Format de date</label>
              <select
                style={S.select}
                value={d.dateFormat}
                onChange={e => updateDashboard('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>
              Intervalle de rafraichissement: {d.refreshInterval}s
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>10s</span>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={d.refreshInterval}
                onChange={e => updateDashboard('refreshInterval', Number(e.target.value))}
                style={{ ...S.slider, flex: 1 }}
              />
              <span style={{ fontSize: 11, color: C.muted }}>120s</span>
            </div>
          </div>

          <Toggle
            label="Sidebar repliee par defaut"
            description="La sidebar sera repliee a l'ouverture du dashboard"
            checked={d.sidebarCollapsed}
            onChange={v => updateDashboard('sidebarCollapsed', v)}
          />
          <Toggle
            label="Mode compact"
            description="Reduit l'espacement et la taille des elements"
            checked={d.compactMode}
            onChange={v => updateDashboard('compactMode', v)}
          />
          <Toggle
            label="Afficher le message de bienvenue"
            checked={d.showWelcome}
            onChange={v => updateDashboard('showWelcome', v)}
          />
        </div>
      </div>
    );
  }

  function renderNotifications() {
    const n = settings.notifications;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Emails</h3>
        <div style={S.card}>
          <Toggle
            label="Digest par email"
            description="Recevez un resume de l'activite par email"
            checked={n.emailDigest}
            onChange={v => updateNotifications('emailDigest', v)}
          />
          {n.emailDigest && (
            <div style={{ ...S.fieldRow, marginTop: 10 }}>
              <div style={S.field}>
                <label style={S.label}>Frequence</label>
                <select
                  style={S.select}
                  value={n.emailFrequency}
                  onChange={e => updateNotifications('emailFrequency', e.target.value)}
                >
                  <option value="realtime">Temps reel</option>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="never">Desactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Notifications push</h3>
        <div style={S.card}>
          <Toggle
            label="Activer les notifications push"
            checked={n.pushEnabled}
            onChange={v => updateNotifications('pushEnabled', v)}
          />
          {n.pushEnabled && (
            <>
              <Toggle
                label="Alertes agents"
                description="Notifications quand un agent termine une tache"
                checked={n.pushAgentAlerts}
                onChange={v => updateNotifications('pushAgentAlerts', v)}
              />
              <Toggle
                label="Alertes credits"
                description="Notifications quand vos credits sont bas"
                checked={n.pushCreditAlerts}
                onChange={v => updateNotifications('pushCreditAlerts', v)}
              />
              <Toggle
                label="Mises a jour equipe"
                description="Notifications d'activite de votre equipe"
                checked={n.pushTeamUpdates}
                onChange={v => updateNotifications('pushTeamUpdates', v)}
              />
            </>
          )}
        </div>

        <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Son et heures calmes</h3>
        <div style={S.card}>
          <Toggle
            label="Sons de notification"
            checked={n.soundEnabled}
            onChange={v => updateNotifications('soundEnabled', v)}
          />
          <div style={{ ...S.fieldRow, marginTop: 10 }}>
            <div style={S.field}>
              <label style={S.label}>Heures calmes - debut</label>
              <input
                type="time"
                style={S.input}
                value={n.quietHoursStart}
                onChange={e => updateNotifications('quietHoursStart', e.target.value)}
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Heures calmes - fin</label>
              <input
                type="time"
                style={S.input}
                value={n.quietHoursEnd}
                onChange={e => updateNotifications('quietHoursEnd', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderValidations() {
    const v = settings.validations;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Regles de validation</h3>
        <div style={S.card}>
          <Toggle
            label="Exiger une approbation pour les actions couteuses"
            description="Les actions depassant le seuil necessiteront votre validation"
            checked={v.requireApproval}
            onChange={val => updateValidations('requireApproval', val)}
          />
          {v.requireApproval && (
            <>
              <div style={{ marginTop: 14, marginBottom: 14 }}>
                <label style={S.label}>
                  Seuil d&apos;approbation: {v.approvalThreshold} credits
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>5</span>
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={v.approvalThreshold}
                    onChange={e => updateValidations('approvalThreshold', Number(e.target.value))}
                    style={{ ...S.slider, flex: 1 }}
                  />
                  <span style={{ fontSize: 11, color: C.muted }}>500</span>
                </div>
              </div>
              <Toggle
                label="Approuver automatiquement les actions connues"
                description="Les types d'actions deja approuves seront auto-valides"
                checked={v.autoApproveKnown}
                onChange={val => updateValidations('autoApproveKnown', val)}
              />
              <Toggle
                label="Notifier en attente"
                description="Recevoir une notification pour chaque action en attente"
                checked={v.notifyOnPending}
                onChange={val => updateValidations('notifyOnPending', val)}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  function renderAgents() {
    const a = settings.agents;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Configuration des agents IA</h3>
        <div style={S.card}>
          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Modele par defaut</label>
              <select
                style={S.select}
                value={a.defaultModel}
                onChange={e => updateAgents('defaultModel', e.target.value)}
              >
                <option value="claude-haiku">Claude Haiku (rapide, economique)</option>
                <option value="claude-sonnet">Claude Sonnet (equilibre)</option>
                <option value="claude-opus">Claude Opus (puissant)</option>
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Fenetre de contexte</label>
              <select
                style={S.select}
                value={a.contextWindow}
                onChange={e => updateAgents('contextWindow', e.target.value)}
              >
                <option value="8k">8k tokens</option>
                <option value="32k">32k tokens</option>
                <option value="100k">100k tokens</option>
                <option value="200k">200k tokens</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>
              Temperature: {a.temperature.toFixed(1)}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>0.0</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={a.temperature}
                onChange={e => updateAgents('temperature', Number(e.target.value))}
                style={{ ...S.slider, flex: 1 }}
              />
              <span style={{ fontSize: 11, color: C.muted }}>1.0</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Plus bas = plus precis, plus haut = plus creatif
            </div>
          </div>

          <div style={S.fieldRow}>
            <div style={S.field}>
              <label style={S.label}>Tokens max par reponse</label>
              <select
                style={S.select}
                value={String(a.maxTokens)}
                onChange={e => updateAgents('maxTokens', Number(e.target.value))}
              >
                <option value="1024">1 024</option>
                <option value="2048">2 048</option>
                <option value="4096">4 096</option>
                <option value="8192">8 192</option>
              </select>
            </div>
          </div>

          <Toggle
            label="Streaming"
            description="Afficher les reponses au fur et a mesure de la generation"
            checked={a.streamingEnabled}
            onChange={v => updateAgents('streamingEnabled', v)}
          />
          <Toggle
            label="Retry automatique"
            description="Relancer automatiquement en cas d'erreur temporaire"
            checked={a.autoRetry}
            onChange={v => updateAgents('autoRetry', v)}
          />
        </div>
      </div>
    );
  }

  function renderIntegrations() {
    const i = settings.integrations;
    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Webhooks</h3>
        <div style={S.card}>
          <Toggle
            label="Activer les webhooks"
            description="Envoyer des evenements a une URL externe"
            checked={i.webhookEnabled}
            onChange={v => updateIntegrations('webhookEnabled', v)}
          />
          {i.webhookEnabled && (
            <div style={{ ...S.fieldRow, marginTop: 10 }}>
              <div style={{ ...S.field, flex: 1 }}>
                <label style={S.label}>URL du webhook</label>
                <input
                  style={S.input}
                  value={i.webhookUrl}
                  onChange={e => updateIntegrations('webhookUrl', e.target.value)}
                  placeholder="https://votre-serveur.com/webhook"
                />
              </div>
            </div>
          )}
        </div>

        <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Services externes</h3>
        <div style={S.card}>
          <Toggle
            label="Slack"
            description="Recevoir les notifications dans un canal Slack"
            checked={i.slackEnabled}
            onChange={v => updateIntegrations('slackEnabled', v)}
          />
          {i.slackEnabled && (
            <div style={{ ...S.fieldRow, marginTop: 10 }}>
              <div style={S.field}>
                <label style={S.label}>Canal Slack</label>
                <input
                  style={S.input}
                  value={i.slackChannel}
                  onChange={e => updateIntegrations('slackChannel', e.target.value)}
                  placeholder="#general"
                />
              </div>
            </div>
          )}
          <Toggle
            label="Zapier"
            description="Connecter Freenzy a des milliers d'apps via Zapier"
            checked={i.zapierEnabled}
            onChange={v => updateIntegrations('zapierEnabled', v)}
          />
          <Toggle
            label="Acces API"
            description="Autoriser l'acces programmatique a votre compte"
            checked={i.apiAccessEnabled}
            onChange={v => updateIntegrations('apiAccessEnabled', v)}
          />
        </div>
      </div>
    );
  }

  function renderTeam() {
    const t = settings.team;
    const role = settings.userRole;

    return (
      <div style={S.section}>
        <h3 style={S.sectionTitle}>
          Mon Organisation
          <span style={S.roleTag}>{role}</span>
        </h3>

        <div style={{ ...S.teamInfo, marginBottom: 20 }}>
          <div style={S.statBox}>
            <div style={S.statValue}>{t.currentMembers}</div>
            <div style={S.statLabel}>Membres</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statValue}>{t.maxMembers}</div>
            <div style={S.statLabel}>Limite</div>
          </div>
          <div style={S.statBox}>
            <div style={{ ...S.statValue, color: C.accent }}>{t.orgPlan}</div>
            <div style={S.statLabel}>Plan</div>
          </div>
        </div>

        {(role === 'admin' || role === 'owner') && (
          <div style={S.card}>
            <div style={S.fieldRow}>
              <div style={S.field}>
                <label style={S.label}>Nom de l&apos;organisation</label>
                <input
                  style={S.input}
                  value={t.orgName}
                  onChange={e => {
                    setSettings(prev => {
                      const next = { ...prev, team: { ...prev.team, orgName: e.target.value } };
                      autoSave(next);
                      return next;
                    });
                  }}
                  placeholder="Mon entreprise"
                />
              </div>
            </div>
          </div>
        )}

        {role === 'viewer' && (
          <div style={S.card}>
            <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 13 }}>
              Vous avez un acces en lecture seule. Contactez un administrateur pour modifier les parametres de l&apos;equipe.
            </div>
          </div>
        )}

        {role === 'member' && (
          <div style={S.card}>
            <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 13 }}>
              En tant que membre, vous pouvez utiliser les agents et voir les statistiques de l&apos;equipe.
              Pour gerer l&apos;equipe, demandez un acces admin.
            </div>
          </div>
        )}

        {role === 'owner' && (
          <div style={{ ...S.card, marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>
              Actions proprietaire
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  height: 32,
                  padding: '0 14px',
                  background: C.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Gerer l&apos;equipe
              </button>
              <button
                style={{
                  height: 32,
                  padding: '0 14px',
                  background: C.bg,
                  color: C.secondary,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Changer de plan
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Tab Content Map ───────────────────────────────────────
  const TAB_RENDERERS: Record<TabId, () => JSX.Element> = {
    profile: renderProfile,
    dashboard: renderDashboard,
    notifications: renderNotifications,
    validations: renderValidations,
    agents: renderAgents,
    integrations: renderIntegrations,
    team: renderTeam,
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.headerRow}>
        <span style={S.emoji}>⚙️</span>
        <h1 style={S.title}>Parametres</h1>
      </div>
      <p style={S.subtitle}>Personnalisez votre experience Freenzy</p>

      {/* Tabs */}
      <div style={S.tabBar}>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...S.tab,
              ...(activeTab === tab.id ? S.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {TAB_RENDERERS[activeTab]()}

      {/* Save Indicator */}
      {saveStatus !== 'idle' && (
        <div
          style={{
            ...S.saveIndicator,
            background: saveStatus === 'saved' ? C.success : saveStatus === 'error' ? C.danger : C.secondary,
            color: '#fff',
          }}
        >
          {saveStatus === 'saving' && 'Sauvegarde...'}
          {saveStatus === 'saved' && 'Sauvegarde !'}
          {saveStatus === 'error' && 'Erreur de sauvegarde'}
        </div>
      )}
    </div>
  );
}
