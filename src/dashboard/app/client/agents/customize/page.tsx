'use client';

import { useState, useEffect } from 'react';
import {
  DEFAULT_AGENTS, EMOJI_OPTIONS, COLOR_PRESETS, PRESET_TEMPLATES,
  LANGUAGE_OPTIONS, FORMAT_OPTIONS,
  loadAgentConfigs, saveAgentConfigs, createDefaultConfig,
  buildSystemPrompt, exportConfigs, importConfigs,
  type AgentTypeId, type AgentCustomConfig, type AgentPersonality, type UserAgentConfigs,
} from '../../../../lib/agent-config';

const STEPS = [
  { icon: '🎭', title: 'Identité', desc: 'Nom, rôle, avatar' },
  { icon: '🎛️', title: 'Personnalité', desc: 'Ton et style' },
  { icon: '🧠', title: 'Expertise', desc: 'Domaines et compétences' },
  { icon: '📜', title: 'Instructions', desc: 'Règles personnalisées' },
  { icon: '🏢', title: 'Contexte', desc: 'Votre entreprise' },
  { icon: '👁️', title: 'Aperçu & Test', desc: 'Tester et sauvegarder' },
];

const PERSONALITY_SLIDERS: { key: keyof AgentPersonality; label: string; left: string; right: string }[] = [
  { key: 'formality', label: 'Formalité', left: 'Formel', right: 'Décontracté' },
  { key: 'responseLength', label: 'Longueur', left: 'Concis', right: 'Détaillé' },
  { key: 'creativity', label: 'Créativité', left: 'Factuel', right: 'Créatif' },
  { key: 'proactivity', label: 'Proactivité', left: 'Réactif', right: 'Proactif' },
  { key: 'expertiseLevel', label: 'Expertise', left: 'Simple', right: 'Expert' },
  { key: 'humor', label: 'Humour', left: 'Sérieux', right: 'Léger' },
];

function getSession() {
  try { return JSON.parse(localStorage.getItem('sarah_session') ?? '{}'); } catch { return {}; }
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-6 mb-8">
        {tags.map((t, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
            borderRadius: 20, background: 'var(--accent-muted)', color: 'var(--accent)', fontSize: 12, fontWeight: 600,
          }}>
            {t}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 14, padding: 0, marginLeft: 2 }}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-6">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { onChange([...tags, input.trim()]); setInput(''); e.preventDefault(); } }}
          className="input input-sm flex-1"
          placeholder={placeholder}
        />
        <button onClick={() => { if (input.trim()) { onChange([...tags, input.trim()]); setInput(''); } }} className="btn btn-ghost btn-sm">+</button>
      </div>
    </div>
  );
}

function RuleList({ rules, onChange, placeholder: _placeholder }: { rules: string[]; onChange: (r: string[]) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-6">
      {rules.map((rule, i) => (
        <div key={i} className="flex gap-6 items-center">
          <input
            value={rule}
            onChange={e => { const updated = [...rules]; updated[i] = e.target.value; onChange(updated); }}
            className="input input-sm flex-1"
          />
          <button onClick={() => onChange(rules.filter((_, j) => j !== i))} className="btn btn-ghost btn-xs" style={{ color: 'var(--danger)' }}>✕</button>
        </div>
      ))}
      <button
        onClick={() => onChange([...rules, ''])}
        className="btn btn-ghost btn-sm"
        style={{ alignSelf: 'flex-start' }}
      >
        + Ajouter une regle
      </button>
    </div>
  );
}

export default function AgentCustomizePage() {
  const [step, setStep] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentTypeId>('sarah-assistante');
  const [config, setConfig] = useState<AgentCustomConfig>(createDefaultConfig('sarah-assistante'));
  const [allConfigs, setAllConfigs] = useState<UserAgentConfigs>({ configs: {}, version: 1 });
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const loaded = loadAgentConfigs();
    setAllConfigs(loaded);
    if (loaded.configs[selectedAgentId]) {
      setConfig(loaded.configs[selectedAgentId]!);
    }
  }, []);

  function selectAgent(id: AgentTypeId) {
    setSelectedAgentId(id);
    const loaded = loadAgentConfigs();
    if (loaded.configs[id]) {
      setConfig(loaded.configs[id]!);
    } else {
      setConfig(createDefaultConfig(id));
    }
    setStep(0);
  }

  function updateConfig(partial: Partial<AgentCustomConfig>) {
    setConfig(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
    setSaved(false);
  }

  function updatePersonality(key: keyof AgentPersonality, value: number) {
    setConfig(prev => ({
      ...prev,
      personality: { ...prev.personality, [key]: value },
      updatedAt: new Date().toISOString(),
    }));
    setSaved(false);
  }

  function saveConfig() {
    const updated: UserAgentConfigs = {
      ...allConfigs,
      configs: { ...allConfigs.configs, [selectedAgentId]: config },
    };
    saveAgentConfigs(updated);
    setAllConfigs(updated);
    setSaved(true);
    // Gamification
    try {
      const { recordEvent } = require('../../../../lib/gamification');
      recordEvent({ type: 'customize_agent' });
    } catch { /* */ }
  }

  function resetAgent() {
    setConfig(createDefaultConfig(selectedAgentId));
    const updated: UserAgentConfigs = {
      ...allConfigs,
      configs: { ...allConfigs.configs },
    };
    delete updated.configs[selectedAgentId];
    saveAgentConfigs(updated);
    setAllConfigs(updated);
    setSaved(false);
  }

  function applyPreset(presetId: string) {
    const preset = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (!preset) return;
    setConfig(prev => ({
      ...prev,
      personality: { ...prev.personality, ...preset.personality },
      instructions: { ...prev.instructions, ...preset.instructions },
      templateId: presetId,
      updatedAt: new Date().toISOString(),
    }));
    setSaved(false);
  }

  function handleExport() {
    const json = exportConfigs(allConfigs);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sarah-agent-configs.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = importConfigs(reader.result as string);
      if (imported) {
        saveAgentConfigs(imported);
        setAllConfigs(imported);
        if (imported.configs[selectedAgentId]) {
          setConfig(imported.configs[selectedAgentId]!);
        }
        setSaved(true);
      }
    };
    reader.readAsText(file);
  }

  async function testAgent() {
    if (!testMessage.trim()) return;
    const session = getSession();
    if (!session.token) return;
    setTestLoading(true);
    setTestResponse('');
    try {
      const prompt = buildSystemPrompt(selectedAgentId, { ...allConfigs, configs: { ...allConfigs.configs, [selectedAgentId]: config } });
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: `Compris, je suis ${config.customName || 'Sarah'}, ${config.customRole}. Comment puis-je vous aider?` },
            { role: 'user', content: testMessage },
          ],
          maxTokens: 512,
          agentName: selectedAgentId,
        }),
      });
      const data = await res.json();
      setTestResponse(data.content ?? data.text ?? 'Pas de réponse');
    } catch (err) {
      setTestResponse('Erreur: ' + (err instanceof Error ? err.message : 'Échec'));
    } finally {
      setTestLoading(false);
    }
  }

  const agentDef = DEFAULT_AGENTS.find(a => a.id === selectedAgentId)!;
  const customizedCount = Object.keys(allConfigs.configs).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Agent Studio</h1>
          <p className="page-subtitle">Personnalisez vos agents IA — {customizedCount} agent{customizedCount !== 1 ? 's' : ''} personnalisé{customizedCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-actions flex gap-8">
          <button onClick={() => setShowExport(!showExport)} className="btn btn-ghost btn-sm">⚙️ Import/Export</button>
          {saved && <span className="badge badge-success" style={{ padding: '6px 14px' }}>Sauvegarde ✓</span>}
        </div>
      </div>

      {/* Export/Import Panel */}
      {showExport && (
        <div className="card flex gap-12 items-center mb-16">
          <button onClick={handleExport} className="btn btn-secondary btn-sm">Exporter mes configs</button>
          <label className="btn btn-secondary btn-sm pointer">
            Importer
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <span className="text-xs text-muted">Format JSON — compatible entre utilisateurs</span>
        </div>
      )}

      {/* Agent Selector */}
      <div className="flex gap-8 flex-wrap mb-24">
        {DEFAULT_AGENTS.map(agent => {
          const isSelected = agent.id === selectedAgentId;
          const isCustomized = agent.id in allConfigs.configs;
          const effective = isCustomized ? allConfigs.configs[agent.id]! : null;
          return (
            <button
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? (effective?.accentColor ?? agent.color) + '22' : 'var(--bg-secondary)',
                border: `2px solid ${isSelected ? (effective?.accentColor ?? agent.color) : 'var(--border-primary)'}`,
                cursor: 'pointer', color: 'var(--text-primary)',
                transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 20 }}>{effective?.emoji ?? agent.emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div className="text-md font-semibold">{effective?.customName ?? agent.name}</div>
                <div className="text-xs text-muted">{effective?.customRole ?? agent.role}</div>
              </div>
              {isCustomized && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: 'white', fontWeight: 800,
                }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Preset Templates */}
      <div className="flex gap-8 flex-wrap mb-24">
        {PRESET_TEMPLATES.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            className="card card-compact"
            style={{
              cursor: 'pointer', flex: 1, textAlign: 'left',
              borderColor: config.templateId === preset.id ? preset.color : 'var(--border-primary)',
            }}
          >
            <div className="flex items-center gap-8 mb-4">
              <span style={{ fontSize: 18 }}>{preset.icon}</span>
              <span className="text-md font-bold">{preset.name}</span>
            </div>
            <div className="text-xs text-muted" style={{ lineHeight: 1.4 }}>{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Step Navigation */}
      <div className="flex rounded-md bg-tertiary mb-24" style={{ gap: 2, padding: 3, overflowX: 'auto' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: step === i ? 'var(--bg-secondary)' : 'transparent',
              color: step === i ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: step === i ? 600 : 400,
              transition: 'all 0.15s', textAlign: 'center',
              boxShadow: step === i ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
            <div>{s.title}</div>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="card p-24" style={{ minHeight: 400 }}>
        {/* Step 1: Identité */}
        {step === 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Identité & Rôle</h3>
            <p className="text-md text-tertiary mb-24">Définissez l&apos;apparence et le titre de votre agent.</p>

            <div className="grid-2 gap-20">
              <div>
                <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                  Nom de l&apos;agent
                </label>
                <input
                  value={config.customName}
                  onChange={e => updateConfig({ customName: e.target.value })}
                  className="input"
                  placeholder="Sarah"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                  Titre / Rôle
                </label>
                <input
                  value={config.customRole}
                  onChange={e => updateConfig({ customRole: e.target.value })}
                  className="input"
                  placeholder={agentDef.role}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="mt-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Avatar / Emoji
              </label>
              <div className="flex flex-wrap gap-6">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => updateConfig({ emoji: e })}
                    style={{
                      width: 44, height: 44, borderRadius: 10, fontSize: 22,
                      border: `2px solid ${config.emoji === e ? config.accentColor : 'var(--border-primary)'}`,
                      background: config.emoji === e ? config.accentColor + '22' : 'var(--bg-primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="mt-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Couleur d&apos;accent
              </label>
              <div className="flex" style={{ gap: 10 }}>
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => updateConfig({ accentColor: c.value })}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', border: 'none',
                      background: c.value, cursor: 'pointer',
                      boxShadow: config.accentColor === c.value ? `0 0 0 3px var(--bg-primary), 0 0 0 5px ${c.value}` : 'none',
                      transition: 'all 0.15s',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-24 p-16 rounded-md border">
              <div className="text-xs text-muted mb-8">Aperçu</div>
              <div className="flex items-center gap-12">
                <span style={{
                  width: 48, height: 48, borderRadius: 14, fontSize: 24,
                  background: config.accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {config.emoji}
                </span>
                <div>
                  <div className="text-lg font-bold">{config.customName || 'Sarah'}</div>
                  <div className="text-md" style={{ color: config.accentColor }}>{config.customRole || agentDef.role}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Personnalité */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Personnalité</h3>
            <p className="text-md text-tertiary mb-24">Ajustez le ton et le style de communication de l&apos;agent.</p>

            <div className="flex flex-col" style={{ gap: 28 }}>
              {PERSONALITY_SLIDERS.map(slider => (
                <div key={slider.key}>
                  <div className="flex flex-between mb-8">
                    <span className="text-md font-semibold">{slider.label}</span>
                    <span className="text-sm text-accent font-bold">{config.personality[slider.key]}%</span>
                  </div>
                  <div className="flex items-center gap-12">
                    <span className="text-xs text-muted text-right" style={{ minWidth: 70 }}>{slider.left}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={config.personality[slider.key]}
                      onChange={e => updatePersonality(slider.key, Number(e.target.value))}
                      style={{
                        flex: 1, height: 6, appearance: 'none', WebkitAppearance: 'none',
                        background: `linear-gradient(to right, var(--accent) ${config.personality[slider.key]}%, var(--bg-tertiary) ${config.personality[slider.key]}%)`,
                        borderRadius: 3, outline: 'none', cursor: 'pointer',
                      }}
                    />
                    <span className="text-xs text-muted" style={{ minWidth: 70 }}>{slider.right}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Personality Preview */}
            <div className="mt-24 p-16 rounded-md border">
              <div className="text-xs text-muted mb-8">Impact sur le comportement</div>
              <div className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>
                {config.personality.formality > 70 && '💬 Ton décontracté et amical. '}
                {config.personality.formality < 30 && '🎩 Ton formel et professionnel. '}
                {config.personality.creativity > 70 && '💡 Très créatif et innovant. '}
                {config.personality.creativity < 30 && '📐 Factuel et pragmatique. '}
                {config.personality.proactivity > 70 && '🚀 Proactif, anticipe vos besoins. '}
                {config.personality.humor > 60 && '😄 N\'hésite pas à être léger. '}
                {config.personality.responseLength > 70 && '📖 Réponses détaillées avec exemples. '}
                {config.personality.responseLength < 30 && '⚡ Réponses ultra-concises. '}
                {config.personality.expertiseLevel > 70 && '🎓 Vocabulaire expert et technique. '}
                {config.personality.expertiseLevel < 30 && '🌱 Langage simple et accessible. '}
                {Object.values(config.personality).every(v => v >= 40 && v <= 60) && '⚖️ Équilibré et polyvalent.'}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Expertise */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Expertise & Spécialisation</h3>
            <p className="text-md text-tertiary mb-24">Définissez les domaines de compétence de l&apos;agent.</p>

            {/* Domain Tags */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Domaines d&apos;expertise (cliquez pour sélectionner)
              </label>
              <div className="flex flex-wrap gap-6">
                {agentDef.domainOptions.map(tag => {
                  const isSelected = config.expertise.domainTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const tags = isSelected
                          ? config.expertise.domainTags.filter(t => t !== tag)
                          : [...config.expertise.domainTags, tag];
                        updateConfig({ expertise: { ...config.expertise, domainTags: tags } });
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${isSelected ? config.accentColor : 'var(--border-primary)'}`,
                        background: isSelected ? config.accentColor + '22' : 'transparent',
                        color: isSelected ? config.accentColor : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Industry */}
            <div className="mb-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Secteur d&apos;activité
              </label>
              <input
                value={config.expertise.industryFocus}
                onChange={e => updateConfig({ expertise: { ...config.expertise, industryFocus: e.target.value } })}
                className="input"
                placeholder="Tech, Santé, Finance, E-commerce..."
                style={{ width: '100%' }}
              />
            </div>

            {/* Custom Knowledge */}
            <div className="mb-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Connaissances spécifiques
              </label>
              <textarea
                value={config.expertise.customKnowledge}
                onChange={e => updateConfig({ expertise: { ...config.expertise, customKnowledge: e.target.value } })}
                className="input"
                rows={3}
                placeholder="Informations spécifiques que l'agent doit connaître..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Frameworks */}
            <div className="mb-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Méthodologies & Frameworks
              </label>
              <TagInput
                tags={config.expertise.frameworks}
                onChange={frameworks => updateConfig({ expertise: { ...config.expertise, frameworks } })}
                placeholder="Ex: Lean Startup, OKR, Design Thinking..."
              />
            </div>

            {/* Competitors */}
            <div>
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Concurrents à surveiller
              </label>
              <TagInput
                tags={config.expertise.competitorNames}
                onChange={competitorNames => updateConfig({ expertise: { ...config.expertise, competitorNames } })}
                placeholder="Nom d'un concurrent..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Instructions */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Instructions Personnalisées</h3>
            <p className="text-md text-tertiary mb-24">Définissez les règles que l&apos;agent doit toujours suivre.</p>

            {/* Always Do */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-success" style={{ display: 'block', marginBottom: 8 }}>
                ✓ Toujours faire
              </label>
              <RuleList
                rules={config.instructions.alwaysDo}
                onChange={alwaysDo => updateConfig({ instructions: { ...config.instructions, alwaysDo } })}
                placeholder="Ex: Proposer un plan d'action"
              />
            </div>

            {/* Never Do */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-danger" style={{ display: 'block', marginBottom: 8 }}>
                ✕ Ne jamais faire
              </label>
              <RuleList
                rules={config.instructions.neverDo}
                onChange={neverDo => updateConfig({ instructions: { ...config.instructions, neverDo } })}
                placeholder="Ex: Donner des conseils juridiques"
              />
            </div>

            {/* Response Format */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Format de réponse préféré
              </label>
              <div className="flex gap-8 flex-wrap">
                {FORMAT_OPTIONS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => updateConfig({ instructions: { ...config.instructions, responseFormat: f.value } })}
                    className="card card-compact"
                    style={{
                      flex: 1, textAlign: 'center', cursor: 'pointer',
                      borderColor: config.instructions.responseFormat === f.value ? config.accentColor : 'var(--border-primary)',
                      background: config.instructions.responseFormat === f.value ? config.accentColor + '15' : 'var(--bg-secondary)',
                    }}
                  >
                    <div className="text-md font-semibold">{f.label}</div>
                    <div className="text-xs text-muted mt-4">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="mb-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Signature / Clôture
              </label>
              <input
                value={config.instructions.signatureStyle}
                onChange={e => updateConfig({ instructions: { ...config.instructions, signatureStyle: e.target.value } })}
                className="input"
                placeholder="Ex: — Sarah, votre équipe IA"
                style={{ width: '100%' }}
              />
            </div>

            {/* Languages */}
            <div>
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Langues
              </label>
              <div className="flex flex-wrap gap-6">
                {LANGUAGE_OPTIONS.map(lang => {
                  const isSelected = config.instructions.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => {
                        const langs = isSelected
                          ? config.instructions.languages.filter(l => l !== lang)
                          : [...config.instructions.languages, lang];
                        updateConfig({ instructions: { ...config.instructions, languages: langs } });
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${isSelected ? config.accentColor : 'var(--border-primary)'}`,
                        background: isSelected ? config.accentColor + '22' : 'transparent',
                        color: isSelected ? config.accentColor : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Company Context */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Contexte Entreprise</h3>
            <p className="text-md text-tertiary mb-24">
              Ces informations aident l&apos;agent à mieux comprendre votre entreprise.
              <a href="/client/onboarding" style={{ color: 'var(--accent)', marginLeft: 4 }}>Modifier le profil complet →</a>
            </p>

            {[
              { key: 'companyVision' as const, label: 'Vision / Mission', placeholder: 'La vision de votre entreprise...', type: 'textarea' },
              { key: 'keyMetrics' as const, label: 'KPIs & Métriques clés', placeholder: 'CA, MRR, taux de conversion, NPS...', type: 'input' },
              { key: 'teamSize' as const, label: 'Taille de l\'équipe', placeholder: '5 personnes, 3 devs, 1 commercial...', type: 'input' },
              { key: 'keyContacts' as const, label: 'Contacts & Parties prenantes', placeholder: 'Noms et rôles des personnes clés...', type: 'textarea' },
              { key: 'currentPriorities' as const, label: 'Priorités actuelles', placeholder: 'Lancement produit, levée de fonds...', type: 'textarea' },
              { key: 'budgetConstraints' as const, label: 'Contraintes budgétaires', placeholder: 'Budget marketing: 5K/mois, pas de recrutement...', type: 'input' },
            ].map(field => (
              <div key={field.key} className="mb-16">
                <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={config.companyContext[field.key]}
                    onChange={e => updateConfig({ companyContext: { ...config.companyContext, [field.key]: e.target.value } })}
                    className="input"
                    rows={2}
                    placeholder={field.placeholder}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    value={config.companyContext[field.key]}
                    onChange={e => updateConfig({ companyContext: { ...config.companyContext, [field.key]: e.target.value } })}
                    className="input"
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Preview & Test */}
        {step === 5 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Aperçu & Test</h3>
            <p className="text-md text-tertiary mb-24">Vérifiez le prompt généré et testez votre agent personnalisé.</p>

            {/* Generated Prompt */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Prompt système généré
              </label>
              <div className="p-16 rounded-md border text-mono text-sm text-secondary" style={{
                lineHeight: 1.7, whiteSpace: 'pre-wrap',
                maxHeight: 300, overflowY: 'auto',
              }}>
                {buildSystemPrompt(selectedAgentId, { ...allConfigs, configs: { ...allConfigs.configs, [selectedAgentId]: config } })}
              </div>
            </div>

            {/* Test Chat */}
            <div className="mb-24">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Tester l&apos;agent (consomme des crédits)
              </label>
              <div className="flex gap-8">
                <input
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && testAgent()}
                  className="input flex-1"
                  placeholder="Posez une question de test..."
                />
                <button onClick={testAgent} disabled={testLoading} className="btn btn-primary btn-sm">
                  {testLoading ? '...' : 'Tester'}
                </button>
              </div>
              {testResponse && (
                <div className="mt-12 p-12 rounded-md text-md text-secondary" style={{
                  background: config.accentColor + '12', borderLeft: `3px solid ${config.accentColor}`,
                  lineHeight: 1.7,
                }}>
                  <div className="text-xs font-bold mb-4" style={{ color: config.accentColor }}>
                    {config.emoji} {config.customName || 'Sarah'} répond :
                  </div>
                  {testResponse}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-12">
              <button onClick={saveConfig} className="btn btn-primary text-lg" style={{ padding: '12px 32px' }}>
                Sauvegarder {config.customName || 'Sarah'}
              </button>
              <button onClick={resetAgent} className="btn btn-danger btn-sm">
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-between mt-16">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn btn-ghost"
          style={{ opacity: step === 0 ? 0.3 : 1 }}
        >
          ← Précédent
        </button>
        <div className="text-sm text-muted flex items-center">
          Étape {step + 1} / {STEPS.length}
        </div>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="btn btn-primary">
            Suivant →
          </button>
        ) : (
          <button onClick={saveConfig} className="btn btn-primary">
            Sauvegarder ✓
          </button>
        )}
      </div>
    </div>
  );
}
