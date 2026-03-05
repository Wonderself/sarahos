'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const EMOJIS = ['🤖','🧠','💡','⚡','🎯','🚀','💼','📊','🛠️','🎨','💬','📝','🔍','🏆','💎','🌟','⭐','🔥','🎭','🤝','📱','💻','🌐','📈','🎪','🏅','🎓','🔮','🧩','🎲'];

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#0ea5e9','#3b82f6','#6b7280','#1d1d1f'];

const DOMAINS = [
  { value: 'commercial', label: 'Commercial', icon: '💼' },
  { value: 'rh', label: 'Ressources humaines', icon: '👥' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'tech', label: 'Tech & Dev', icon: '💻' },
  { value: 'juridique', label: 'Juridique', icon: '⚖️' },
  { value: 'support', label: 'Support client', icon: '🎧' },
  { value: 'autre', label: 'Autre', icon: '✨' },
];

const CAPABILITIES = [
  'Répondre aux emails', 'Gérer un calendrier', 'Analyser des données', 'Rédiger des contenus',
  'Qualifier des leads', 'Gérer le support client', 'Générer des rapports', 'Traduire des textes',
  'Faire de la veille', 'Capturer des commandes', 'Planifier des RDV', 'Analyser des sentiments',
];

const TONES = [
  { value: 'very_formal', label: 'Très formel', icon: '🏛️' },
  { value: 'professional', label: 'Professionnel', icon: '💼' },
  { value: 'casual', label: 'Décontracté', icon: '😊' },
  { value: 'creative', label: 'Créatif', icon: '🎨' },
  { value: 'technical', label: 'Technique', icon: '⚙️' },
];

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

function generateSystemPrompt(data: {
  name: string; role: string; domain: string; capabilities: string[]; tone: string;
  alwaysDo: string[]; neverDo: string[]; companyContext: string; autonomy: number;
}): string {
  const toneDesc: Record<string, string> = {
    very_formal: 'très formel et protocollaire', professional: 'professionnel et courtois',
    casual: 'décontracté et amical', creative: 'créatif et inspirant', technical: 'précis et technique',
  };
  const tone = toneDesc[data.tone] ?? 'professionnel';
  const caps = data.capabilities.length > 0 ? `\n\nCapacités principales :\n${data.capabilities.map(c => `- ${c}`).join('\n')}` : '';
  const always = data.alwaysDo.length > 0 ? `\n\nInstructions permanentes :\n${data.alwaysDo.map(r => `- Toujours : ${r}`).join('\n')}` : '';
  const never = data.neverDo.length > 0 ? `\n${data.neverDo.map(r => `- Jamais : ${r}`).join('\n')}` : '';
  const context = data.companyContext.trim() ? `\n\nContexte entreprise :\n${data.companyContext}` : '';
  const autonomy = data.autonomy > 70 ? '\n\nTu prends des initiatives et des décisions de manière autonome lorsque approprié.' : data.autonomy < 30 ? '\n\nTu assistes et proposes des options sans décider à la place de l\'utilisateur.' : '';

  return `Tu es ${data.name}, ${data.role ?? 'un assistant IA'} spécialisé dans le domaine ${data.domain}.

Ton style de communication est ${tone}.${caps}${always}${never}${context}${autonomy}

Tu réponds toujours en français sauf si l'utilisateur s'adresse à toi dans une autre langue. Tu es focalisé sur ta mission et tu n'inventes pas d'informations que tu n'as pas.`;
}

function CreateAgentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Identity
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [emoji, setEmoji] = useState('🤖');
  const [color, setColor] = useState('#6366f1');

  // Step 2 — Domain & capabilities
  const [domain, setDomain] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [autonomy, setAutonomy] = useState(50);

  // Step 3 — Behavior
  const [tone, setTone] = useState('professional');
  const [alwaysDo, setAlwaysDo] = useState<string[]>([]);
  const [neverDo, setNeverDo] = useState<string[]>([]);
  const [companyContext, setCompanyContext] = useState('');
  const [newAlways, setNewAlways] = useState('');
  const [newNever, setNewNever] = useState('');

  // Step 4 — Test
  const [systemPrompt, setSystemPrompt] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);

  // Step 5 — Deploy
  const [visibleSidebar, setVisibleSidebar] = useState(true);

  const buildPrompt = useCallback(() => {
    return generateSystemPrompt({ name, role, domain, capabilities, tone, alwaysDo, neverDo, companyContext, autonomy });
  }, [name, role, domain, capabilities, tone, alwaysDo, neverDo, companyContext, autonomy]);

  const goToStep = (n: number) => {
    if (n === 4) setSystemPrompt(buildPrompt());
    setStep(n);
  };

  const sendTest = async () => {
    if (!testMessage.trim()) return;
    setTesting(true);
    try {
      const session = getSession();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: testMessage },
          ],
          token: session.token,
          model: 'claude-haiku-4-5-20251001',
          agentName: 'custom-preview',
        }),
      });
      const data = await res.json();
      setTestResponse(data.content ?? data.message ?? 'Pas de réponse');
    } catch {
      setTestResponse('Erreur lors du test');
    } finally {
      setTesting(false);
    }
  };

  const saveAgent = async () => {
    setSaving(true);
    setError('');
    try {
      const session = getSession();
      const token = session.token ?? '';
      const body = {
        name, role, emoji, color, domain,
        capabilities, autonomy_level: autonomy, tone,
        always_do: alwaysDo, never_do: neverDo, company_context: companyContext,
        system_prompt: systemPrompt || buildPrompt(),
        visible_in_sidebar: visibleSidebar,
        is_active: true,
      };
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: editId ? `/portal/agents/custom/${editId}` : '/portal/agents/custom',
          token,
          method: editId ? 'PUT' : 'POST',
          data: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      router.push('/client/agents');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const STEPS = ['Identité', 'Domaine', 'Comportement', 'Test', 'Déploiement'];

  const canNext: Record<number, boolean> = {
    1: name.trim().length >= 2,
    2: domain !== '',
    3: true,
    4: true,
    5: true,
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <a href="/client/agents" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>← Agents</a>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 4px' }}>
          {editId ? 'Modifier l\'agent' : 'Créer un agent IA'}
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
          Configurez votre assistant IA personnalisé en quelques étapes
        </p>
      </div>

      {/* Progress stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28, overflowX: 'auto' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => i + 1 < step && goToStep(i + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
                border: 'none', cursor: i + 1 < step ? 'pointer' : 'default',
                background: step === i + 1 ? '#6366f1' : i + 1 < step ? '#eef2ff' : '#f3f4f6',
                color: step === i + 1 ? 'white' : i + 1 < step ? '#6366f1' : '#9ca3af',
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%', background: step === i + 1 ? 'rgba(255,255,255,0.3)' : i + 1 < step ? '#6366f1' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700,
                color: step === i + 1 ? 'white' : i + 1 < step ? 'white' : '#9ca3af', flexShrink: 0,
              }}>
                {i + 1 < step ? '✓' : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <div style={{ width: 20, height: 2, background: i + 1 < step ? '#6366f1' : '#e5e7eb', flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* ── STEP 1: Identity ── */}
      {step === 1 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>🎭 Identité de l'agent</h2>

          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            {/* Emoji + Color picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, background: `${color}18`, border: `2px solid ${color}`,
              }}>
                {emoji}
              </div>
              {/* Color row */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: 18, height: 18, borderRadius: '50%', background: c, border: `2px solid ${color === c ? '#1d1d1f' : 'transparent'}`,
                    cursor: 'pointer', padding: 0,
                  }} />
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>Nom de l'agent *</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Sophia — Assistante commerciale"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>Rôle / Mission</label>
                <textarea
                  value={role} onChange={e => setRole(e.target.value)}
                  placeholder="Ex: Gère les devis entrants, qualifie les prospects et organise les RDV commerciaux"
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Emoji</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 18, border: `2px solid ${emoji === e ? color : '#e5e7eb'}`,
                  background: emoji === e ? `${color}18` : '#fafafa', cursor: 'pointer', padding: 0,
                }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Domain & Capabilities ── */}
      {step === 2 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>🎯 Domaine & Capacités</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>Domaine principal *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {DOMAINS.map(d => (
                <button key={d.value} onClick={() => setDomain(d.value)} style={{
                  padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${domain === d.value ? color : '#e5e7eb'}`,
                  background: domain === d.value ? `${color}12` : '#fafafa',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: domain === d.value ? color : '#374151' }}>{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Capacités</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CAPABILITIES.map(c => {
                const active = capabilities.includes(c);
                return (
                  <button key={c} onClick={() => setCapabilities(prev => active ? prev.filter(x => x !== c) : [...prev, c])} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${active ? color : '#e5e7eb'}`,
                    background: active ? `${color}12` : '#fafafa',
                    color: active ? color : '#6b7280',
                  }}>
                    {active ? '✓ ' : ''}{c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              Niveau d'autonomie : {autonomy < 30 ? 'Assiste seulement' : autonomy > 70 ? 'Prend des décisions' : 'Équilibré'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Assiste</span>
              <input type="range" min={0} max={100} value={autonomy} onChange={e => setAutonomy(parseInt(e.target.value))} style={{ flex: 1, accentColor: color }} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Décide</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Behavior ── */}
      {step === 3 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 0 }}>🧠 Comportement</h2>

          {/* Tone */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Ton de communication</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TONES.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${tone === t.value ? color : '#e5e7eb'}`,
                  background: tone === t.value ? `${color}12` : '#fafafa',
                  color: tone === t.value ? color : '#6b7280',
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Always do */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>✅ Toujours faire</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input type="text" value={newAlways} onChange={e => setNewAlways(e.target.value)} placeholder="Ex: Mentionner le délai de livraison de 48h" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none' }} onKeyDown={e => { if (e.key === 'Enter' && newAlways.trim()) { setAlwaysDo(p => [...p, newAlways.trim()]); setNewAlways(''); } }} />
              <button onClick={() => { if (newAlways.trim()) { setAlwaysDo(p => [...p, newAlways.trim()]); setNewAlways(''); } }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', fontSize: 12, cursor: 'pointer' }}>+</button>
            </div>
            {alwaysDo.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, flex: 1, color: '#374151' }}>✅ {r}</span>
                <button onClick={() => setAlwaysDo(p => p.filter((_, j) => j !== i))} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#9ca3af' }}>×</button>
              </div>
            ))}
          </div>

          {/* Never do */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>🚫 Ne jamais faire</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input type="text" value={newNever} onChange={e => setNewNever(e.target.value)} placeholder="Ex: Promettre des remises sans autorisation" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none' }} onKeyDown={e => { if (e.key === 'Enter' && newNever.trim()) { setNeverDo(p => [...p, newNever.trim()]); setNewNever(''); } }} />
              <button onClick={() => { if (newNever.trim()) { setNeverDo(p => [...p, newNever.trim()]); setNewNever(''); } }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontSize: 12, cursor: 'pointer' }}>+</button>
            </div>
            {neverDo.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, flex: 1, color: '#374151' }}>🚫 {r}</span>
                <button onClick={() => setNeverDo(p => p.filter((_, j) => j !== i))} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#9ca3af' }}>×</button>
              </div>
            ))}
          </div>

          {/* Context */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>Contexte entreprise</label>
            <textarea
              value={companyContext} onChange={e => setCompanyContext(e.target.value)}
              placeholder="Ce que l'agent doit savoir sur votre entreprise, produits, offres..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 9, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* ── STEP 4: Test ── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Prompt généré */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📄 Prompt système généré</h2>
              <button onClick={() => setSystemPrompt(buildPrompt())} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#6b7280', fontWeight: 600 }}>
                🔄 Régénérer
              </button>
            </div>
            <textarea
              value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
              rows={8}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #e5e7eb',
                fontSize: 11, outline: 'none', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box',
                background: '#f9fafb', lineHeight: 1.6, color: '#374151',
              }}
            />
          </div>

          {/* Chat test */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>🧪 Tester l'agent</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text" value={testMessage} onChange={e => setTestMessage(e.target.value)}
                placeholder="Envoyez un message test à votre agent..."
                onKeyDown={e => e.key === 'Enter' && sendTest()}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 9, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}
              />
              <button onClick={sendTest} disabled={testing || !testMessage.trim()} style={{
                padding: '10px 18px', borderRadius: 9, border: 'none',
                background: testing || !testMessage.trim() ? '#e5e7eb' : color,
                color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                {testing ? '⏳' : 'Envoyer'}
              </button>
            </div>
            {testResponse && (
              <div style={{
                padding: '12px 14px', background: '#f9fafb', borderRadius: 10,
                border: '1px solid #e5e7eb', fontSize: 13, color: '#374151', lineHeight: 1.6,
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{name || 'Agent'}</span>
                </div>
                {testResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 5: Deploy ── */}
      {step === 5 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>🚀 Déploiement</h2>

          {/* Recap card */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {emoji}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{name || 'Agent sans nom'}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{role || 'Agent personnalisé'}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {domain && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: `${color}18`, color, fontWeight: 600 }}>{domain}</span>}
                  {capabilities.length > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>{capabilities.length} capacités</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 14px', borderRadius: 10, border: `1px solid ${visibleSidebar ? color : '#e5e7eb'}`, background: visibleSidebar ? `${color}08` : 'white' }}>
              <input type="checkbox" checked={visibleSidebar} onChange={e => setVisibleSidebar(e.target.checked)} style={{ accentColor: color, width: 16, height: 16 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Visible dans la sidebar</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>L'agent apparaît dans le menu de navigation</div>
              </div>
            </label>
          </div>

          <button
            onClick={saveAgent}
            disabled={saving || !name.trim()}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
              background: saving || !name.trim() ? '#e5e7eb' : color,
              color: 'white', fontSize: 14, fontWeight: 700,
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Création en cours...' : editId ? '💾 Sauvegarder les modifications' : '✨ Créer l\'agent'}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ← Précédent
          </button>
        ) : <div />}

        {step < 5 && (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={!canNext[step]}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: canNext[step] ? color : '#e5e7eb',
              color: 'white', fontSize: 13, fontWeight: 600,
              cursor: canNext[step] ? 'pointer' : 'not-allowed',
            }}
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}

export default function CreateAgentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Chargement...</div>}>
      <CreateAgentContent />
    </Suspense>
  );
}
