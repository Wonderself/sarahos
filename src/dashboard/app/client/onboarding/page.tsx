'use client';

import { useState, useEffect, useRef } from 'react';
import VoiceInput from '../../../components/VoiceInput';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

interface CompanyProfile {
  // Step 1 — Identité
  companyName: string;
  industry: string;
  employeeCount: string;
  foundedYear: string;
  website: string;
  location: string;

  // Step 2 — Mission & Vision
  mission: string;
  vision: string;
  values: string;
  uniqueValue: string;
  targetAudience: string;

  // Step 3 — Situation actuelle
  currentRevenue: string;
  mainChallenges: string;
  competitors: string;
  strengths: string;
  weaknesses: string;

  // Step 4 — Objectifs
  shortTermGoals: string;
  longTermGoals: string;
  kpis: string;
  budget: string;
  timeline: string;

  // Step 5 — Opérations quotidiennes
  dailyTasks: string;
  painPoints: string;
  toolsUsed: string;
  teamStructure: string;
  communicationChannels: string;

  // Step 6 — Où l'IA peut aider
  aiPriorities: string[];
  automationWishes: string;
  contentNeeds: string;
  customerServiceNeeds: string;
  analyticsNeeds: string;

  // Step 7 — Ton & Personnalité
  brandTone: string;
  languages: string[];
  doNotMention: string;
  inspirations: string;

  // Meta
  completedAt?: string;
  completionScore?: number;
}

const defaultProfile: CompanyProfile = {
  companyName: '', industry: '', employeeCount: '', foundedYear: '', website: '', location: '',
  mission: '', vision: '', values: '', uniqueValue: '', targetAudience: '',
  currentRevenue: '', mainChallenges: '', competitors: '', strengths: '', weaknesses: '',
  shortTermGoals: '', longTermGoals: '', kpis: '', budget: '', timeline: '',
  dailyTasks: '', painPoints: '', toolsUsed: '', teamStructure: '', communicationChannels: '',
  aiPriorities: [], automationWishes: '', contentNeeds: '', customerServiceNeeds: '', analyticsNeeds: '',
  brandTone: '', languages: [], doNotMention: '', inspirations: '',
};

const STEP_EMOJIS: Record<string, string> = {
  business: '🏢',
  target: '🎯',
  bar_chart: '📊',
  rocket_launch: '🚀',
  settings: '⚙️',
  smart_toy: '🤖',
  palette: '🎨',
};

const STEPS = [
  { id: 1, title: 'Votre Entreprise', subtitle: 'Qui êtes-vous ?', icon: 'business' },
  { id: 2, title: 'Mission & Vision', subtitle: 'Où allez-vous ?', icon: 'target' },
  { id: 3, title: 'Situation Actuelle', subtitle: 'Où en êtes-vous ?', icon: 'bar_chart' },
  { id: 4, title: 'Objectifs', subtitle: 'Que voulez-vous atteindre ?', icon: 'rocket_launch' },
  { id: 5, title: 'Quotidien', subtitle: 'Comment travaillez-vous ?', icon: 'settings' },
  { id: 6, title: 'Besoins IA', subtitle: 'Comment Freenzy peut vous aider ?', icon: 'smart_toy' },
  { id: 7, title: 'Personnalité', subtitle: 'Comment Freenzy doit communiquer ?', icon: 'palette' },
];

const AI_PRIORITIES = [
  'Répondre aux clients', 'Gérer les emails', 'Créer du contenu', 'Marketing digital',
  'Comptabilité', 'Gestion de projet', 'Analyse de données', 'Stratégie business',
  'Recrutement', 'Formation équipe', 'Social media', 'Veille concurrentielle',
  'Support technique', 'Gestion agenda', 'Rédaction juridique', 'Relations presse',
];

const TONES = ['Professionnel', 'Amical', 'Formel', 'Décontracté', 'Expert', 'Pédagogique', 'Inspirant', 'Direct'];
const LANGUAGES_LIST = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Hébreu', 'Allemand', 'Italien', 'Portugais'];

function OInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string;
}) {
  return <input type={type} style={CU.input} placeholder={placeholder} value={value} onChange={onChange} />;
}

function OTextArea({ value, onChange, onFocus, placeholder, rows = 3 }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void; placeholder: string; rows?: number;
}) {
  return <textarea style={{ ...CU.textarea, minHeight: rows * 24 }} placeholder={placeholder} rows={rows} value={value} onChange={onChange} onFocus={onFocus} />;
}

function OLabel({ text, hint, compactMode }: { text: string; hint?: string; compactMode?: boolean }) {
  return (
    <label style={{ display: 'block', marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{text}</span>
      {hint && !compactMode && <span style={{ fontSize: 11, color: CU.textMuted, marginLeft: 8 }}>{hint}</span>}
    </label>
  );
}

export default function OnboardingPage() {
  const isMobile = useIsMobile();
  const { showError } = useToast();
  const [step, setStep] = useState(0); // 0 = quick analysis step
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [analyzeDesc, setAnalyzeDesc] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const lastFocusedFieldRef = useRef<keyof CompanyProfile | ''>('');
  // Account type pre-step — shown only if not yet chosen
  const [showAccountTypeStep, setShowAccountTypeStep] = useState(false);

  useEffect(() => {
    loadProfile();
    try { setCompactMode(localStorage.getItem('fz_onboarding_compact') === 'true'); } catch { /* */ }
    // Show account type step if not yet set
    try {
      const alreadySet = localStorage.getItem('fz_is_pro') !== null;
      if (!alreadySet) setShowAccountTypeStep(true);
    } catch { /* */ }
  }, []);

  function selectAccountType(isPro: boolean) {
    try { localStorage.setItem('fz_is_pro', isPro ? 'true' : 'false'); } catch { /* */ }
    setShowAccountTypeStep(false);
    // Persist to backend
    try {
      const session = getSession();
      if (session?.token) {
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/preferences', token: session.token, method: 'PATCH', data: { isPro } }),
        }).catch(() => {});
      }
    } catch { /* */ }
    // If pro, force step 0 (company onboarding); if personal, redirect to dashboard
    if (!isPro) window.location.href = '/client/dashboard';
  }

  async function loadProfile() {
    const session = getSession();
    if (!session?.token) return;
    try {
      const res = await fetch(`/api/company?token=${encodeURIComponent(session.token)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(p => ({ ...p, ...data.profile }));
          try { localStorage.setItem('fz_company_profile', JSON.stringify(data.profile)); } catch { /* */ }
        }
      }
    } catch {
      setAnalyzeError('Impossible de charger votre profil. Vérifiez votre connexion.');
    }
    setLoaded(true);
    // If profile already has data, go to step 1
    if (profile.companyName) setStep(1);
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
  }

  function updateField(field: keyof CompanyProfile, value: string | string[]) {
    setProfile(p => ({ ...p, [field]: value }));
  }

  function toggleArray(field: 'aiPriorities' | 'languages', value: string) {
    setProfile(p => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  async function saveProfile(complete = false) {
    const session = getSession();
    if (!session?.token) return;
    setSaving(true);
    try {
      const score = calculateScore();
      const toSave = complete ? { ...profile, completedAt: new Date().toISOString(), completionScore: score } : { ...profile, completionScore: score };
      await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token, profile: toSave }),
      });
      // Persist company profile locally for briefing/dashboard/documents
      try { localStorage.setItem('fz_company_profile', JSON.stringify(toSave)); } catch { /* */ }
      if (complete) window.location.href = '/client/chat';
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  }

  function calculateScore(): number {
    const fields = Object.entries(profile);
    let filled = 0;
    for (const [, v] of fields) {
      if (Array.isArray(v)) { if (v.length > 0) filled++; }
      else if (typeof v === 'string' && v.trim()) filled++;
    }
    return Math.round((filled / fields.length) * 100);
  }

  const score = calculateScore();

  async function handleQuickAnalysis() {
    if (!analyzeUrl.trim()) { setAnalyzeError('Entrez l\'URL de votre site web'); return; }
    const session = getSession();
    if (!session?.token) { setAnalyzeError('Connectez-vous d\'abord'); return; }
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          action: 'analyze-url',
          url: analyzeUrl.startsWith('http') ? analyzeUrl : `https://${analyzeUrl}`,
          description: analyzeDesc || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'TOKEN_EXPIRED' || (data.error && data.error.includes('expiree'))) {
          setAnalyzeError('Votre session a expire. Veuillez vous reconnecter.');
          setTimeout(() => { window.location.href = '/login'; }, 3000);
        } else {
          setAnalyzeError(data.error || 'Erreur lors de l\'analyse');
        }
        return;
      }
      if (data.profile) {
        setProfile(p => {
          const updated = { ...p };
          for (const [key, val] of Object.entries(data.profile)) {
            if (val && (typeof val === 'string' ? val.trim() : Array.isArray(val) && val.length > 0)) {
              (updated as Record<string, unknown>)[key] = val;
            }
          }
          return updated as CompanyProfile;
        });
        setPrefilled(true);
        setStep(1);
      }
    } catch {
      setAnalyzeError('Erreur de connexion');
    } finally {
      setAnalyzing(false);
    }
  }

  function toggleCompactMode() {
    const next = !compactMode;
    setCompactMode(next);
    try { localStorage.setItem('fz_onboarding_compact', String(next)); } catch { /* */ }
  }

  if (!loaded) return <div style={{ padding: 24, textAlign: 'center', color: CU.textMuted }}>Chargement...</div>;

  // Account type pre-step
  if (showAccountTypeStep) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
          <h1 style={{ ...CU.pageTitle, fontSize: 22, marginBottom: 8 }}>Bienvenue sur <span className="fz-logo-word">Freenzy.io</span></h1>
          <p style={CU.pageSubtitle}>Vous utilisez <span className="fz-logo-word">Freenzy.io</span> pour :</p>
        </div>
        <div style={cardGrid(isMobile, 2)}>
          <button
            onClick={() => selectAccountType(false)}
            style={{
              ...CU.cardHoverable, textAlign: 'center', padding: '32px 24px',
              border: `2px solid ${CU.border}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = CU.accent; e.currentTarget.style.background = CU.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = CU.border; e.currentTarget.style.background = CU.bg; }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: CU.text }}>Usage personnel</div>
            <div style={{ fontSize: 13, color: CU.textMuted }}>Productivité, projets perso, assistants IA</div>
          </button>
          <button
            onClick={() => selectAccountType(true)}
            style={{
              ...CU.cardHoverable, textAlign: 'center', padding: '32px 24px',
              border: `2px solid ${CU.border}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = CU.accent; e.currentTarget.style.background = CU.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = CU.border; e.currentTarget.style.background = CU.bg; }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: CU.text }}>Mon entreprise</div>
            <div style={{ fontSize: 13, color: CU.textMuted }}>Équipe, clients, automatisation business</div>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: CU.textMuted, marginTop: 24 }}>
          Vous pourrez changer ce choix à tout moment dans Mon Compte
        </p>
      </div>
    );
  }

  // Step 0: Quick analysis screen
  if (step === 0) {
    return (
      <div style={{ ...pageContainer(isMobile), maxWidth: 700 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{PAGE_META.onboarding.emoji}</span>
            <div>
              <h1 style={CU.pageTitle}>{PAGE_META.onboarding.title}</h1>
              <p style={CU.pageSubtitle}>{PAGE_META.onboarding.subtitle}</p>
            </div>
            <HelpBubble text={PAGE_META.onboarding.helpText} />
          </div>
        </div>
        <PageExplanation pageId="onboarding" text={PAGE_META.onboarding?.helpText} />

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: CU.text, margin: 0 }}>
            Présentez votre entreprise à Freenzy
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: CU.textSecondary, marginTop: 8 }}>
            Choisissez la méthode qui vous convient le mieux pour commencer. Plus vous fournissez de contexte, mieux vos agents pourront vous aider.
          </p>
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: CU.accentLight, border: `1px solid ${CU.border}`, fontSize: 12, color: CU.text, lineHeight: 1.5 }}>
            🔒 <strong>Confidentialité garantie :</strong> Ces informations sont strictement privées et ne seront jamais partagées avec des tiers. Le Répondeur Intelligent et les agents externes n&apos;ont aucun accès à ces données.
          </div>
        </div>

        {/* Option 1: Quick Analysis */}
        <div style={{ ...CU.card, padding: 24, marginBottom: 16, borderLeft: `4px solid ${CU.accent}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: CU.text }}>Remplissage express</div>
              <div style={{ fontSize: 13, color: CU.textSecondary }}>
                <span className="fz-logo-word">Freenzy</span> analyse votre site web et pré-remplit le formulaire (~2-3 crédits)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                URL de votre site web
              </label>
              <input
                type="url"
                style={CU.input}
                placeholder="https://www.votre-entreprise.com"
                value={analyzeUrl}
                onChange={e => setAnalyzeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAnalysis()}
              />
            </div>
            <div>
              <label style={{ ...CU.label, display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                Description complémentaire <span style={{ fontWeight: 500, color: CU.textMuted }}>(optionnel)</span>
              </label>
              <textarea
                style={CU.textarea}
                rows={3}
                placeholder="Décrivez votre activité en quelques mots, ajoutez des infos que votre site ne mentionne pas..."
                value={analyzeDesc}
                onChange={e => setAnalyzeDesc(e.target.value)}
              />
            </div>

            {analyzeError && (
              <div style={{ padding: '8px 12px', background: '#FFF5F5', borderRadius: 8, fontSize: 13, color: CU.danger }}>
                {analyzeError}
              </div>
            )}

            <button
              onClick={handleQuickAnalysis}
              disabled={analyzing}
              style={{ ...CU.btnPrimary, height: 44, fontSize: 14 }}
            >
              {analyzing ? 'Analyse en cours...' : 'Analyser avec Freenzy'}
            </button>
          </div>

          <div style={{ fontSize: 11, marginTop: 12, lineHeight: 1.5, color: CU.textMuted }}>
            Freenzy va lire votre site, extraire les informations clés et pré-remplir le formulaire.
            Vous pourrez ensuite vérifier et ajuster chaque champ.
          </div>
        </div>

        {/* Option 2: Manual */}
        <div style={{ ...CU.cardHoverable, padding: 24, textAlign: 'center' }}
          onClick={() => setStep(1)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>📝</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: CU.text }}>Remplir manuellement</div>
              <div style={{ fontSize: 13, color: CU.textSecondary }}>
                7 étapes, ~10 minutes. Formulaire guidé avec descriptions.
              </div>
            </div>
            <span style={{ fontSize: 18, color: CU.textMuted }}>&rarr;</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.onboarding.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.onboarding.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.onboarding.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.onboarding.helpText} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: CU.text }}>
            Présentez votre entreprise à Freenzy
          </h2>
        </div>
        <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6, color: CU.textSecondary }}>
          Plus Freenzy vous connaît, plus vos agents seront efficaces. Remplissez ce formulaire en détail
          pour que votre équipe IA comprenne parfaitement vos besoins.
        </p>
        {/* Compact mode toggle + prefilled badge + voice input */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
          {prefilled && (
            <span style={{ ...CU.badge, height: 36, padding: '0 12px', fontWeight: 600, fontSize: 11 }}>
              Pré-rempli par IA — vérifiez et ajustez
            </span>
          )}
          <VoiceInput
            onTranscript={(t) => {
              const field = lastFocusedFieldRef.current;
              if (field) {
                const current = profile[field];
                if (typeof current === 'string') {
                  updateField(field, current ? current + ' ' + t : t);
                }
              }
            }}
            size="sm"
          />
          <button
            onClick={toggleCompactMode}
            style={{
              ...CU.btnGhost,
              fontSize: 11,
              background: compactMode ? CU.accent : CU.bg,
              color: compactMode ? '#fff' : CU.textMuted,
              border: `1px solid ${compactMode ? CU.accent : CU.border}`,
            }}
          >
            {compactMode ? <>📋 Vue détaillée</> : <>⚡ Vue rapide</>}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: CU.textSecondary }}>Profil complété à {score}%</span>
          <span style={{ fontSize: 13, color: CU.accent, fontWeight: 600 }}>Étape {step}/7</span>
        </div>
        <div style={{ height: 6, background: CU.accentLight, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: CU.accent, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Steps Nav */}
      <div style={{ display: 'flex', gap: isMobile ? 2 : 4, marginBottom: 24, overflowX: 'auto', paddingBottom: isMobile ? 8 : 4 }}>
        {STEPS.map(s => (
          <button
            key={s.id}
            onClick={() => { saveProfile(); setStep(s.id); }}
            style={{
              flex: '1 0 auto', padding: isMobile ? '8px 6px' : '10px 12px', borderRadius: 8,
              background: step === s.id ? CU.accent : CU.bg,
              border: `1px solid ${step === s.id ? CU.accent : CU.border}`,
              color: step === s.id ? '#fff' : CU.textSecondary,
              cursor: 'pointer', fontSize: isMobile ? 10 : 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: isMobile ? 3 : 6, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 18 }}>{STEP_EMOJIS[s.icon] ?? s.icon}</span> {s.title}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div style={{ ...CU.card, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: CU.text }}>
          <span style={{ fontSize: 22 }}>{STEP_EMOJIS[STEPS[step - 1].icon] ?? STEPS[step - 1].icon}</span> {STEPS[step - 1].title}
        </div>
        {!compactMode && (
          <div style={{ fontSize: 13, marginBottom: 24, color: CU.textSecondary }}>
            {STEPS[step - 1].subtitle}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {step === 1 && <>
            <div><OLabel text="Nom de l'entreprise" compactMode={compactMode} /><OInput value={profile.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Acme SAS" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div><OLabel text="Secteur d'activité" compactMode={compactMode} /><OInput value={profile.industry} onChange={e => updateField('industry', e.target.value)} placeholder="Tech, Santé, Finance..." /></div>
              <div><OLabel text="Nombre d'employés" compactMode={compactMode} /><OInput value={profile.employeeCount} onChange={e => updateField('employeeCount', e.target.value)} placeholder="1-10, 11-50, 51-200..." /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div><OLabel text="Année de création" compactMode={compactMode} /><OInput value={profile.foundedYear} onChange={e => updateField('foundedYear', e.target.value)} placeholder="2020" /></div>
              <div><OLabel text="Localisation" compactMode={compactMode} /><OInput value={profile.location} onChange={e => updateField('location', e.target.value)} placeholder="Paris, France" /></div>
            </div>
            <div><OLabel text="Site web" compactMode={compactMode} /><OInput value={profile.website} onChange={e => updateField('website', e.target.value)} placeholder="https://..." /></div>
          </>}

          {step === 2 && <>
            <div><OLabel text="Mission" hint="Pourquoi votre entreprise existe-t-elle ?" compactMode={compactMode} /><OTextArea value={profile.mission} onChange={e => updateField('mission', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'mission'; }} placeholder="Notre mission est de..." /></div>
            <div><OLabel text="Vision" hint="À quoi ressemble le succès dans 5 ans ?" compactMode={compactMode} /><OTextArea value={profile.vision} onChange={e => updateField('vision', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'vision'; }} placeholder="Dans 5 ans, nous serons..." /></div>
            <div><OLabel text="Valeurs" hint="Les principes qui guident vos décisions" compactMode={compactMode} /><OTextArea value={profile.values} onChange={e => updateField('values', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'values'; }} placeholder="Innovation, Transparence, Excellence..." /></div>
            <div><OLabel text="Proposition de valeur unique" hint="Qu'est-ce qui vous différencie ?" compactMode={compactMode} /><OTextArea value={profile.uniqueValue} onChange={e => updateField('uniqueValue', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'uniqueValue'; }} placeholder="Ce qui nous rend unique c'est..." /></div>
            <div><OLabel text="Public cible" compactMode={compactMode} /><OTextArea value={profile.targetAudience} onChange={e => updateField('targetAudience', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'targetAudience'; }} placeholder="PME tech entre 10-100 employés..." /></div>
          </>}

          {step === 3 && <>
            <div><OLabel text="Chiffre d'affaires actuel" hint="Approximatif, confidentiel" compactMode={compactMode} /><OInput value={profile.currentRevenue} onChange={e => updateField('currentRevenue', e.target.value)} placeholder="500K EUR/an, en croissance..." /></div>
            <div><OLabel text="Principaux défis" hint="Qu'est-ce qui vous empêche de dormir ?" compactMode={compactMode} /><OTextArea value={profile.mainChallenges} onChange={e => updateField('mainChallenges', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'mainChallenges'; }} placeholder="Acquisition client, rétention, scalabilité..." rows={4} /></div>
            <div><OLabel text="Concurrents principaux" compactMode={compactMode} /><OTextArea value={profile.competitors} onChange={e => updateField('competitors', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'competitors'; }} placeholder="Concurrent A (leader), Concurrent B (niche)..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div><OLabel text="Forces" compactMode={compactMode} /><OTextArea value={profile.strengths} onChange={e => updateField('strengths', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'strengths'; }} placeholder="Équipe technique, produit unique..." /></div>
              <div><OLabel text="Faiblesses" compactMode={compactMode} /><OTextArea value={profile.weaknesses} onChange={e => updateField('weaknesses', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'weaknesses'; }} placeholder="Marketing, manque de process..." /></div>
            </div>
          </>}

          {step === 4 && <>
            <div><OLabel text="Objectifs court terme" hint="3-6 mois" compactMode={compactMode} /><OTextArea value={profile.shortTermGoals} onChange={e => updateField('shortTermGoals', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'shortTermGoals'; }} placeholder="Lancer v2 du produit, doubler la base clients..." rows={4} /></div>
            <div><OLabel text="Objectifs long terme" hint="1-3 ans" compactMode={compactMode} /><OTextArea value={profile.longTermGoals} onChange={e => updateField('longTermGoals', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'longTermGoals'; }} placeholder="Devenir leader du marché, lever des fonds..." rows={4} /></div>
            <div><OLabel text="KPIs clés" hint="Comment mesurez-vous le succès ?" compactMode={compactMode} /><OTextArea value={profile.kpis} onChange={e => updateField('kpis', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'kpis'; }} placeholder="MRR, churn rate, NPS, conversion..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div><OLabel text="Budget IA mensuel" compactMode={compactMode} /><OInput value={profile.budget} onChange={e => updateField('budget', e.target.value)} placeholder="500 EUR/mois" /></div>
              <div><OLabel text="Timeline" compactMode={compactMode} /><OInput value={profile.timeline} onChange={e => updateField('timeline', e.target.value)} placeholder="Résultats attendus en 3 mois" /></div>
            </div>
          </>}

          {step === 5 && <>
            <div><OLabel text="Tâches quotidiennes" hint="Décrivez une journée type" compactMode={compactMode} /><OTextArea value={profile.dailyTasks} onChange={e => updateField('dailyTasks', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'dailyTasks'; }} placeholder="Matin: emails, réunions. Aprèm: dev, suivi clients..." rows={4} /></div>
            <div><OLabel text="Points de friction" hint="Qu'est-ce qui vous fait perdre du temps ?" compactMode={compactMode} /><OTextArea value={profile.painPoints} onChange={e => updateField('painPoints', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'painPoints'; }} placeholder="Trop d'emails, reporting manuel, coordination équipe..." rows={4} /></div>
            <div><OLabel text="Outils utilisés" compactMode={compactMode} /><OTextArea value={profile.toolsUsed} onChange={e => updateField('toolsUsed', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'toolsUsed'; }} placeholder="Slack, Notion, Google Workspace, HubSpot..." /></div>
            <div><OLabel text="Structure d'équipe" compactMode={compactMode} /><OTextArea value={profile.teamStructure} onChange={e => updateField('teamStructure', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'teamStructure'; }} placeholder="3 devs, 1 commercial, 1 marketing, CEO..." /></div>
            <div><OLabel text="Canaux de communication" compactMode={compactMode} /><OTextArea value={profile.communicationChannels} onChange={e => updateField('communicationChannels', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'communicationChannels'; }} placeholder="Email, WhatsApp, Slack, téléphone..." /></div>
          </>}

          {step === 6 && <>
            <div>
              <OLabel text="Priorités IA" hint="Sélectionnez tout ce qui vous intéresse" compactMode={compactMode} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {AI_PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleArray('aiPriorities', p)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: profile.aiPriorities.includes(p) ? CU.accent : CU.bg,
                      color: profile.aiPriorities.includes(p) ? '#fff' : CU.textSecondary,
                      border: `1px solid ${profile.aiPriorities.includes(p) ? CU.accent : CU.border}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div><OLabel text="Qu'aimeriez-vous automatiser ?" compactMode={compactMode} /><OTextArea value={profile.automationWishes} onChange={e => updateField('automationWishes', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'automationWishes'; }} placeholder="Réponses emails type, relances clients, reporting hebdo..." rows={4} /></div>
            <div><OLabel text="Besoins en contenu" compactMode={compactMode} /><OTextArea value={profile.contentNeeds} onChange={e => updateField('contentNeeds', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'contentNeeds'; }} placeholder="Posts LinkedIn, newsletters, articles blog..." /></div>
            <div><OLabel text="Service client" compactMode={compactMode} /><OTextArea value={profile.customerServiceNeeds} onChange={e => updateField('customerServiceNeeds', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'customerServiceNeeds'; }} placeholder="FAQ automatique, escalation, suivi tickets..." /></div>
            <div><OLabel text="Analyse & reporting" compactMode={compactMode} /><OTextArea value={profile.analyticsNeeds} onChange={e => updateField('analyticsNeeds', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'analyticsNeeds'; }} placeholder="Dashboard ventes, analyse concurrence, veille marché..." /></div>
          </>}

          {step === 7 && <>
            <div>
              <OLabel text="Ton de communication" hint="Comment Freenzy doit communiquer en votre nom ?" compactMode={compactMode} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => updateField('brandTone', t)}
                    style={{
                      padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                      background: profile.brandTone === t ? CU.accent : CU.bg,
                      color: profile.brandTone === t ? '#fff' : CU.textSecondary,
                      border: `1px solid ${profile.brandTone === t ? CU.accent : CU.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <OLabel text="Langues" hint="Dans quelles langues Freenzy doit communiquer ?" compactMode={compactMode} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {LANGUAGES_LIST.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleArray('languages', l)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: profile.languages.includes(l) ? CU.accent : CU.bg,
                      color: profile.languages.includes(l) ? '#fff' : CU.textSecondary,
                      border: `1px solid ${profile.languages.includes(l) ? CU.accent : CU.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div><OLabel text="Sujets à éviter" hint="Ce que Freenzy ne doit jamais mentionner" compactMode={compactMode} /><OTextArea value={profile.doNotMention} onChange={e => updateField('doNotMention', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'doNotMention'; }} placeholder="Concurrents spécifiques, anciens litiges..." /></div>
            <div><OLabel text="Inspirations" hint="Marques/personnes dont vous aimez le style" compactMode={compactMode} /><OTextArea value={profile.inspirations} onChange={e => updateField('inspirations', e.target.value)} onFocus={() => { lastFocusedFieldRef.current = 'inspirations'; }} placeholder="Apple pour le design, Patagonia pour les valeurs..." /></div>
          </>}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 24, padding: '0 4px' }}>
        <button
          onClick={() => { saveProfile(); setStep(s => Math.max(1, s - 1)); }}
          style={{ ...CU.btnGhost, opacity: step === 1 ? 0.4 : 1 }}
          disabled={step === 1}
        >
          &larr; Précédent
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => saveProfile()} style={CU.btnGhost} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {step < 7 ? (
            <button
              onClick={() => { saveProfile(); setStep(s => Math.min(7, s + 1)); }}
              style={CU.btnPrimary}
            >
              Suivant &rarr;
            </button>
          ) : (
            <button
              onClick={() => saveProfile(true)}
              style={{ ...CU.btnPrimary, background: CU.success }}
              disabled={saving}
            >
              {saving ? 'Finalisation...' : 'Terminer & Commencer →'}
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Bonus Section */}
      <div style={{
        ...CU.card, padding: 24, marginTop: 24,
        background: CU.bgSecondary,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>📱</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: CU.text }}>Connectez WhatsApp <span style={{ fontSize: 12, fontWeight: 500, color: CU.textMuted }}>(optionnel)</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: CU.textSecondary }}>
              Vos agents pourront vous envoyer des rappels, rapports et repondre a vos questions par WhatsApp.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="tel"
            style={{ ...CU.input, flex: 1, minWidth: 200 }}
            placeholder="+33 6 12 34 56 78"
            defaultValue={typeof window !== 'undefined' ? localStorage.getItem('fz_whatsapp_number') ?? '' : ''}
            onChange={e => {
              try { localStorage.setItem('fz_whatsapp_number', e.target.value); } catch { /* */ }
            }}
          />
          <span style={{ fontSize: 11, fontStyle: 'italic', color: CU.textMuted }}>
            Cette fonctionnalite sera activee prochainement
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, marginTop: 24, lineHeight: 1.6, color: CU.textMuted }}>
        Vos données sont privées et sécurisées. Elles servent uniquement à personnaliser Freenzy pour votre entreprise.
        <br />Vous pouvez modifier ces informations à tout moment.
      </div>
    </div>
  );
}
