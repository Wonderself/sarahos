'use client';

import { useState, useEffect, useRef } from 'react';
import VoiceInput from '../../../components/VoiceInput';

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

const STEPS = [
  { id: 1, title: 'Votre Entreprise', subtitle: 'Qui êtes-vous ?', icon: '🏢' },
  { id: 2, title: 'Mission & Vision', subtitle: 'Où allez-vous ?', icon: '🎯' },
  { id: 3, title: 'Situation Actuelle', subtitle: 'Où en êtes-vous ?', icon: '📊' },
  { id: 4, title: 'Objectifs', subtitle: 'Que voulez-vous atteindre ?', icon: '🚀' },
  { id: 5, title: 'Quotidien', subtitle: 'Comment travaillez-vous ?', icon: '⚙️' },
  { id: 6, title: 'Besoins IA', subtitle: 'Comment Sarah peut aider ?', icon: '🤖' },
  { id: 7, title: 'Personnalité', subtitle: 'Comment Sarah doit parler ?', icon: '🎨' },
];

const AI_PRIORITIES = [
  'Répondre aux clients', 'Gérer les emails', 'Créer du contenu', 'Marketing digital',
  'Comptabilité', 'Gestion de projet', 'Analyse de données', 'Stratégie business',
  'Recrutement', 'Formation équipe', 'Social media', 'Veille concurrentielle',
  'Support technique', 'Gestion agenda', 'Rédaction juridique', 'Relations presse',
];

const TONES = ['Professionnel', 'Amical', 'Formel', 'Décontracté', 'Expert', 'Pédagogique', 'Inspirant', 'Direct'];
const LANGUAGES_LIST = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Hébreu', 'Allemand', 'Italien', 'Portugais'];

export default function OnboardingPage() {
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
  const [isDirty, setIsDirty] = useState(false);
  const lastFocusedFieldRef = useRef<keyof CompanyProfile | ''>('');

  useEffect(() => {
    loadProfile();
    // Load compact mode preference
    try { setCompactMode(localStorage.getItem('sarah_onboarding_compact') === 'true'); } catch { /* */ }
    // If profile already exists, skip step 0
  }, []);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  async function loadProfile() {
    const session = getSession();
    if (!session?.token) return;
    try {
      const res = await fetch(`/api/company?token=${encodeURIComponent(session.token)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(p => ({ ...p, ...data.profile }));
      }
    } catch { /* */ }
    setLoaded(true);
    // If profile already has data, go to step 1
    if (profile.companyName) setStep(1);
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('sarah_session') ?? '{}'); } catch { return {}; }
  }

  function updateField(field: keyof CompanyProfile, value: string | string[]) {
    setProfile(p => ({ ...p, [field]: value }));
    setIsDirty(true);
  }

  function toggleArray(field: 'aiPriorities' | 'languages', value: string) {
    setProfile(p => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    setIsDirty(true);
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
      setIsDirty(false);
      if (complete) window.location.href = '/client/chat';
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur de sauvegarde');
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
      if (!res.ok) { setAnalyzeError(data.error || 'Erreur lors de l\'analyse'); return; }
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
    try { localStorage.setItem('sarah_onboarding_compact', String(next)); } catch { /* */ }
  }

  function TextArea({ field, placeholder, rows = 3 }: { field: keyof CompanyProfile; placeholder: string; rows?: number }) {
    return (
      <textarea
        className="input"
        placeholder={placeholder}
        rows={rows}
        value={profile[field] as string}
        onChange={e => updateField(field, e.target.value)}
        onFocus={() => { lastFocusedFieldRef.current = field; }}
        style={{ resize: 'vertical' }}
      />
    );
  }

  function Input({ field, placeholder, type = 'text' }: { field: keyof CompanyProfile; placeholder: string; type?: string }) {
    return (
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        value={profile[field] as string}
        onChange={e => updateField(field, e.target.value)}
      />
    );
  }

  function Label({ text, hint }: { text: string; hint?: string }) {
    return (
      <label style={{ display: 'block', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
        {hint && !compactMode && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{hint}</span>}
      </label>
    );
  }

  if (!loaded) return <div className="animate-pulse p-24 text-center text-muted">Chargement...</div>;

  // Step 0: Quick analysis screen
  if (step === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="text-center mb-24" style={{ marginBottom: 40 }}>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
            Présentez votre entreprise à Sarah
          </h1>
          <p className="text-base text-tertiary mt-8" style={{ lineHeight: 1.6 }}>
            Choisissez la méthode qui vous convient le mieux pour commencer.
          </p>
        </div>

        {/* Option 1: Quick Analysis */}
        <div className="card p-24 mb-16" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="flex items-center gap-12 mb-16">
            <span style={{ fontSize: 28 }}>⚡</span>
            <div>
              <div className="text-xl font-bold">Remplissage express</div>
              <div className="text-md text-tertiary">
                Sarah analyse votre site web et pré-remplit le formulaire (~2-3 crédits)
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <div>
              <label className="text-md font-semibold" style={{ marginBottom: 6, display: 'block' }}>
                URL de votre site web
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://www.votre-entreprise.com"
                value={analyzeUrl}
                onChange={e => setAnalyzeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAnalysis()}
              />
            </div>
            <div>
              <label className="text-md font-semibold" style={{ marginBottom: 6, display: 'block' }}>
                Description complémentaire <span className="font-medium text-muted">(optionnel)</span>
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Décrivez votre activité en quelques mots, ajoutez des infos que votre site ne mentionne pas..."
                value={analyzeDesc}
                onChange={e => setAnalyzeDesc(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {analyzeError && (
              <div className="text-md text-danger rounded-sm" style={{ padding: '8px 12px', background: 'var(--danger-bg)' }}>
                {analyzeError}
              </div>
            )}

            <button
              onClick={handleQuickAnalysis}
              className="btn btn-primary text-lg"
              disabled={analyzing}
              style={{ height: 44 }}
            >
              {analyzing ? (
                <span className="flex items-center gap-8">
                  <span className="animate-pulse">Analyse en cours...</span>
                </span>
              ) : (
                'Analyser avec Sarah'
              )}
            </button>
          </div>

          <div className="text-xs text-muted mt-12" style={{ lineHeight: 1.5 }}>
            Sarah va lire votre site, extraire les informations clés et pré-remplir le formulaire.
            Vous pourrez ensuite vérifier et ajuster chaque champ.
          </div>
        </div>

        {/* Option 2: Manual */}
        <div className="card card-lift text-center pointer p-24"
          onClick={() => setStep(1)}>
          <div className="flex items-center flex-center gap-12">
            <span style={{ fontSize: 24 }}>📝</span>
            <div style={{ textAlign: 'left' }}>
              <div className="text-lg font-bold">Remplir manuellement</div>
              <div className="text-md text-tertiary">
                7 étapes, ~10 minutes. Formulaire guidé avec descriptions.
              </div>
            </div>
            <span className="text-xl text-muted">→</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-24">
        <div className="flex flex-center items-center gap-16 mb-12">
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em', margin: 0 }}>
            Présentez votre entreprise à Sarah
          </h1>
        </div>
        <p className="text-base text-tertiary mt-8" style={{ lineHeight: 1.6 }}>
          Plus Sarah vous connaît, plus elle sera efficace. Remplissez ce formulaire en détail
          pour que votre équipe IA comprenne parfaitement vos besoins.
        </p>
        {/* Compact mode toggle + prefilled badge + voice input */}
        <div className="flex flex-center items-center gap-12 mt-12">
          {prefilled && (
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, background: '#6366f115', color: 'var(--accent)', fontWeight: 600 }}>
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
              fontSize: 11, padding: '4px 10px', borderRadius: 12, cursor: 'pointer',
              background: compactMode ? 'var(--accent-muted)' : 'var(--bg-secondary)',
              color: compactMode ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${compactMode ? 'var(--accent)' : 'var(--border-primary)'}`,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {compactMode ? '📋 Vue détaillée' : '⚡ Vue rapide'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-24">
        <div className="flex flex-between mb-8">
          <span className="text-sm text-tertiary">Profil complété à {score}%</span>
          <span className="text-sm text-accent">Étape {step}/7</span>
        </div>
        <div className="progress-bar progress-bar-lg">
          <div className="progress-bar-fill" style={{ width: `${score}%`, background: score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--accent)' }} />
        </div>
      </div>

      {/* Steps Nav */}
      <div className="flex gap-4 mb-24" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map(s => (
          <button
            key={s.id}
            onClick={() => { saveProfile(); setStep(s.id); }}
            style={{
              flex: '1 0 auto', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              background: step === s.id ? 'var(--accent-muted)' : 'var(--bg-secondary)',
              border: `1px solid ${step === s.id ? 'var(--accent)' : 'var(--border-primary)'}`,
              color: step === s.id ? 'var(--accent-hover)' : 'var(--text-tertiary)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}
          >
            <span>{s.icon}</span> {s.title}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="card p-24">
        <div className="text-xl font-bold mb-4">
          {STEPS[step - 1].icon} {STEPS[step - 1].title}
        </div>
        {!compactMode && (
          <div className="text-md text-tertiary mb-24">
            {STEPS[step - 1].subtitle}
          </div>
        )}

        <div className="flex flex-col gap-20">
          {step === 1 && <>
            <div><Label text="Nom de l'entreprise" /><Input field="companyName" placeholder="Acme SAS" /></div>
            <div className="grid-2">
              <div><Label text="Secteur d'activité" /><Input field="industry" placeholder="Tech, Santé, Finance..." /></div>
              <div><Label text="Nombre d'employés" /><Input field="employeeCount" placeholder="1-10, 11-50, 51-200..." /></div>
            </div>
            <div className="grid-2">
              <div><Label text="Année de création" /><Input field="foundedYear" placeholder="2020" /></div>
              <div><Label text="Localisation" /><Input field="location" placeholder="Paris, France" /></div>
            </div>
            <div><Label text="Site web" /><Input field="website" placeholder="https://..." /></div>
          </>}

          {step === 2 && <>
            <div><Label text="Mission" hint="Pourquoi votre entreprise existe-t-elle ?" /><TextArea field="mission" placeholder="Notre mission est de..." /></div>
            <div><Label text="Vision" hint="À quoi ressemble le succès dans 5 ans ?" /><TextArea field="vision" placeholder="Dans 5 ans, nous serons..." /></div>
            <div><Label text="Valeurs" hint="Les principes qui guident vos décisions" /><TextArea field="values" placeholder="Innovation, Transparence, Excellence..." /></div>
            <div><Label text="Proposition de valeur unique" hint="Qu'est-ce qui vous différencie ?" /><TextArea field="uniqueValue" placeholder="Ce qui nous rend unique c'est..." /></div>
            <div><Label text="Public cible" /><TextArea field="targetAudience" placeholder="PME tech entre 10-100 employés..." /></div>
          </>}

          {step === 3 && <>
            <div><Label text="Chiffre d'affaires actuel" hint="Approximatif, confidentiel" /><Input field="currentRevenue" placeholder="500K EUR/an, en croissance..." /></div>
            <div><Label text="Principaux défis" hint="Qu'est-ce qui vous empêche de dormir ?" /><TextArea field="mainChallenges" placeholder="Acquisition client, rétention, scalabilité..." rows={4} /></div>
            <div><Label text="Concurrents principaux" /><TextArea field="competitors" placeholder="Concurrent A (leader), Concurrent B (niche)..." /></div>
            <div className="grid-2">
              <div><Label text="Forces" /><TextArea field="strengths" placeholder="Équipe technique, produit unique..." /></div>
              <div><Label text="Faiblesses" /><TextArea field="weaknesses" placeholder="Marketing, manque de process..." /></div>
            </div>
          </>}

          {step === 4 && <>
            <div><Label text="Objectifs court terme" hint="3-6 mois" /><TextArea field="shortTermGoals" placeholder="Lancer v2 du produit, doubler la base clients..." rows={4} /></div>
            <div><Label text="Objectifs long terme" hint="1-3 ans" /><TextArea field="longTermGoals" placeholder="Devenir leader du marché, lever des fonds..." rows={4} /></div>
            <div><Label text="KPIs clés" hint="Comment mesurez-vous le succès ?" /><TextArea field="kpis" placeholder="MRR, churn rate, NPS, conversion..." /></div>
            <div className="grid-2">
              <div><Label text="Budget IA mensuel" /><Input field="budget" placeholder="500 EUR/mois" /></div>
              <div><Label text="Timeline" /><Input field="timeline" placeholder="Résultats attendus en 3 mois" /></div>
            </div>
          </>}

          {step === 5 && <>
            <div><Label text="Tâches quotidiennes" hint="Décrivez une journée type" /><TextArea field="dailyTasks" placeholder="Matin: emails, réunions. Aprèm: dev, suivi clients..." rows={4} /></div>
            <div><Label text="Points de friction" hint="Qu'est-ce qui vous fait perdre du temps ?" /><TextArea field="painPoints" placeholder="Trop d'emails, reporting manuel, coordination équipe..." rows={4} /></div>
            <div><Label text="Outils utilisés" /><TextArea field="toolsUsed" placeholder="Slack, Notion, Google Workspace, HubSpot..." /></div>
            <div><Label text="Structure d'équipe" /><TextArea field="teamStructure" placeholder="3 devs, 1 commercial, 1 marketing, CEO..." /></div>
            <div><Label text="Canaux de communication" /><TextArea field="communicationChannels" placeholder="Email, WhatsApp, Slack, téléphone..." /></div>
          </>}

          {step === 6 && <>
            <div>
              <Label text="Priorités IA" hint="Sélectionnez tout ce qui vous intéresse" />
              <div className="flex flex-wrap gap-6 mt-8">
                {AI_PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleArray('aiPriorities', p)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: profile.aiPriorities.includes(p) ? 'var(--accent)' : 'var(--bg-primary)',
                      color: profile.aiPriorities.includes(p) ? 'white' : 'var(--text-tertiary)',
                      border: `1px solid ${profile.aiPriorities.includes(p) ? 'var(--accent)' : 'var(--border-secondary)'}`,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div><Label text="Qu'aimeriez-vous automatiser ?" /><TextArea field="automationWishes" placeholder="Réponses emails type, relances clients, reporting hebdo..." rows={4} /></div>
            <div><Label text="Besoins en contenu" /><TextArea field="contentNeeds" placeholder="Posts LinkedIn, newsletters, articles blog..." /></div>
            <div><Label text="Service client" /><TextArea field="customerServiceNeeds" placeholder="FAQ automatique, escalation, suivi tickets..." /></div>
            <div><Label text="Analyse & reporting" /><TextArea field="analyticsNeeds" placeholder="Dashboard ventes, analyse concurrence, veille marché..." /></div>
          </>}

          {step === 7 && <>
            <div>
              <Label text="Ton de communication" hint="Comment Sarah doit parler en votre nom ?" />
              <div className="flex flex-wrap gap-6 mt-8">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => updateField('brandTone', t)}
                    style={{
                      padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                      background: profile.brandTone === t ? 'var(--accent)' : 'var(--bg-primary)',
                      color: profile.brandTone === t ? 'white' : 'var(--text-tertiary)',
                      border: `1px solid ${profile.brandTone === t ? 'var(--accent)' : 'var(--border-secondary)'}`,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label text="Langues" hint="Dans quelles langues Sarah doit communiquer ?" />
              <div className="flex flex-wrap gap-6 mt-8">
                {LANGUAGES_LIST.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleArray('languages', l)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: profile.languages.includes(l) ? 'var(--success)' : 'var(--bg-primary)',
                      color: profile.languages.includes(l) ? 'white' : 'var(--text-tertiary)',
                      border: `1px solid ${profile.languages.includes(l) ? 'var(--success)' : 'var(--border-secondary)'}`,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div><Label text="Sujets à éviter" hint="Ce que Sarah ne doit jamais mentionner" /><TextArea field="doNotMention" placeholder="Concurrents spécifiques, anciens litiges..." /></div>
            <div><Label text="Inspirations" hint="Marques/personnes dont vous aimez le style" /><TextArea field="inspirations" placeholder="Apple pour le design, Patagonia pour les valeurs..." /></div>
          </>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-between flex-wrap gap-8 mt-24" style={{ padding: '0 4px' }}>
        <button
          onClick={() => { saveProfile(); setStep(s => Math.max(1, s - 1)); }}
          className="btn btn-secondary"
          disabled={step === 1}
        >
          ← Précédent
        </button>

        <div className="flex gap-8">
          <button onClick={() => saveProfile()} className="btn btn-ghost" disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {step < 7 ? (
            <button
              onClick={() => { saveProfile(); setStep(s => Math.min(7, s + 1)); }}
              className="btn btn-primary"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={() => saveProfile(true)}
              className="btn btn-primary"
              style={{ background: 'var(--success)' }}
              disabled={saving}
            >
              {saving ? 'Finalisation...' : 'Terminer & Commencer →'}
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Bonus Section */}
      <div className="card p-24 mt-24" style={{
        background: 'linear-gradient(135deg, #25d36608, #128c7e08)',
        border: '1px solid #25d36622',
      }}>
        <div className="flex items-center gap-8 mb-12">
          <span style={{ fontSize: 24 }}>📱</span>
          <div>
            <div className="text-lg font-bold">Connectez WhatsApp <span className="text-sm font-medium text-muted">(optionnel)</span></div>
            <div className="text-sm text-tertiary" style={{ lineHeight: 1.5 }}>
              Vos agents pourront vous envoyer des rappels, rapports et repondre a vos questions par WhatsApp.
            </div>
          </div>
        </div>
        <div className="flex gap-8 items-center flex-wrap">
          <input
            type="tel"
            className="input"
            placeholder="+33 6 12 34 56 78"
            style={{ flex: 1, minWidth: 200 }}
            defaultValue={typeof window !== 'undefined' ? localStorage.getItem('sarah_whatsapp_number') ?? '' : ''}
            onChange={e => {
              try { localStorage.setItem('sarah_whatsapp_number', e.target.value); } catch { /* */ }
            }}
          />
          <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
            Cette fonctionnalite sera activee prochainement
          </span>
        </div>
      </div>

      <div className="text-center text-sm text-muted mt-24" style={{ lineHeight: 1.6 }}>
        Vos données sont privées et sécurisées. Elles servent uniquement à personnaliser Sarah pour votre entreprise.
        <br />Vous pouvez modifier ces informations à tout moment.
      </div>
    </div>
  );
}
