'use client';

import { useState, useEffect } from 'react';
import DocumentUploader from '../../../../components/DocumentUploader';
import DocumentList from '../../../../components/DocumentList';
import {
  DEFAULT_AGENTS, MATERIAL_ICON_OPTIONS, COLOR_PRESETS, PRESET_TEMPLATES,
  LANGUAGE_OPTIONS, FORMAT_OPTIONS,
  loadAgentConfigs, saveAgentConfigs, createDefaultConfig,
  buildSystemPrompt, exportConfigs, importConfigs, syncAgentConfigsWithApi, saveAgentConfigsToApi,
  type AgentTypeId, type AgentCustomConfig, type AgentPersonality, type UserAgentConfigs,
} from '../../../../lib/agent-config';

const STEPS = [
  { icon: '🎭', title: 'Identité', desc: 'Nom, rôle, avatar' },
  { icon: '⚙️', title: 'Personnalité', desc: 'Ton et style' },
  { icon: '🧠', title: 'Expertise', desc: 'Domaines et compétences' },
  { icon: '📝', title: 'Instructions', desc: 'Règles personnalisées' },
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
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

// ─── Tag Input Helper (outside component to prevent re-mount) ───
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

// ─── Rule List Helper (outside component to prevent re-mount) ───
function RuleList({ rules, onChange, placeholder }: { rules: string[]; onChange: (r: string[]) => void; placeholder: string }) {
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
        + Ajouter une règle
      </button>
    </div>
  );
}

export default function AgentCustomizePage() {
  const [step, setStep] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentTypeId>('fz-assistante');
  const [config, setConfig] = useState<AgentCustomConfig>(createDefaultConfig('fz-assistante'));
  const [allConfigs, setAllConfigs] = useState<UserAgentConfigs>({ configs: {}, version: 1 });
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [refreshDocs, setRefreshDocs] = useState(0);

  // ─── Voice & Audio state ───
  const [voiceAgent, setVoiceAgent] = useState<string>('fz-assistante');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('EXAVITQu4vr4xnSDxMaL');
  const [voiceStability, setVoiceStability] = useState(0.5);
  const [voiceSimilarity, setVoiceSimilarity] = useState(0.75);
  const [voiceStyle, setVoiceStyle] = useState(0.0);
  const [voiceSpeakerBoost, setVoiceSpeakerBoost] = useState(true);
  const [voiceModel, setVoiceModel] = useState('eleven_multilingual_v2');
  const [voicePreviewLoading, setVoicePreviewLoading] = useState<string | null>(null);
  const [voicePreviewAudio, setVoicePreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [showVoiceClone, setShowVoiceClone] = useState(false);

  const VOICE_LIST = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female', lang: 'FR' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', lang: 'EN' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female', lang: 'FR' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', lang: 'EN' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', lang: 'EN' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Emmanuel', gender: 'Male', lang: 'FR' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Male', lang: 'EN' },
  ];

  const CAPABILITIES = [
    { icon: 'mic', title: 'Text-to-Speech', desc: '7 voix premium, 16 langues', available: true },
    { icon: 'record_voice_over', title: 'Voice Cloning', desc: 'Clonez votre propre voix (bient\u00f4t)', available: false },
    { icon: 'music_note', title: 'Sound Effects', desc: 'Effets sonores IA (bient\u00f4t)', available: false },
    { icon: 'language', title: 'Dubbing', desc: 'Doublage vid\u00e9o multi-langue (bient\u00f4t)', available: false },
    { icon: 'volume_off', title: 'Audio Isolation', desc: 'Extraction de voix (bient\u00f4t)', available: false },
    { icon: 'menu_book', title: 'Projects', desc: 'Contenu long (podcasts, audiobooks) (bient\u00f4t)', available: false },
  ];

  function loadVoiceSettings() {
    try {
      const raw = localStorage.getItem('fz_voice_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.voiceAgent) setVoiceAgent(s.voiceAgent);
        if (s.selectedVoiceId) setSelectedVoiceId(s.selectedVoiceId);
        if (s.stability !== undefined) setVoiceStability(s.stability);
        if (s.similarity !== undefined) setVoiceSimilarity(s.similarity);
        if (s.style !== undefined) setVoiceStyle(s.style);
        if (s.speakerBoost !== undefined) setVoiceSpeakerBoost(s.speakerBoost);
        if (s.model) setVoiceModel(s.model);
      }
    } catch { /* ignore */ }
  }

  function saveVoiceSettings(overrides?: Record<string, unknown>) {
    const settings = {
      voiceAgent,
      selectedVoiceId,
      stability: voiceStability,
      similarity: voiceSimilarity,
      style: voiceStyle,
      speakerBoost: voiceSpeakerBoost,
      model: voiceModel,
      ...overrides,
    };
    localStorage.setItem('fz_voice_settings', JSON.stringify(settings));
  }

  async function previewVoice(voiceId: string, voiceName: string) {
    if (voicePreviewAudio) {
      voicePreviewAudio.pause();
      setVoicePreviewAudio(null);
    }
    setVoicePreviewLoading(voiceId);
    try {
      const testText = voiceName === 'Sarah' || voiceName === 'Charlotte' || voiceName === 'Emmanuel'
        ? `Bonjour, je suis ${voiceName}. Comment puis-je vous aider aujourd'hui ?`
        : `Hello, I'm ${voiceName}. How can I help you today?`;
      const res = await fetch('/api/voice/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voiceId,
          model_id: voiceModel,
          stability: voiceStability,
          similarity_boost: voiceSimilarity,
          style: voiceStyle,
          use_speaker_boost: voiceSpeakerBoost,
        }),
      });
      if (!res.ok) throw new Error('Erreur TTS');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); setVoicePreviewAudio(null); };
      setVoicePreviewAudio(audio);
      audio.play();
    } catch {
      /* silently fail */
    } finally {
      setVoicePreviewLoading(null);
    }
  }

  useEffect(() => {
    const loaded = loadAgentConfigs();
    setAllConfigs(loaded);
    if (loaded.configs[selectedAgentId]) {
      setConfig(loaded.configs[selectedAgentId]!);
    }
    loadVoiceSettings();
    // Background sync with DB
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (session.token) {
        syncAgentConfigsWithApi(session.token).then(synced => {
          setAllConfigs(synced);
          if (synced.configs[selectedAgentId]) setConfig(synced.configs[selectedAgentId]!);
        }).catch(() => {});
      }
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Sync to DB
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (session.token) void saveAgentConfigsToApi(session.token, updated);
    } catch { /* */ }
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
    // Sync to DB
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (session.token) void saveAgentConfigsToApi(session.token, updated);
    } catch { /* */ }
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
    a.download = 'freenzy-agent-configs.json';
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
            { role: 'assistant', content: `Compris, je suis ${config.customName || 'votre assistant'}, ${config.customRole}. Comment puis-je vous aider?` },
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

  // TagInput and RuleList moved outside component to avoid re-mount on state change

  return (
    <div className="client-page-scrollable">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Agent Studio</h1>
          <p className="page-subtitle">Personnalisez vos assistants IA — {customizedCount} assistant{customizedCount !== 1 ? 's' : ''} personnalisé{customizedCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="page-actions flex gap-8">
          <button onClick={() => setShowExport(!showExport)} className="btn btn-ghost btn-sm">⚙️ Import/Export</button>
          {saved && <span className="badge badge-success" style={{ padding: '6px 14px' }}>Sauvegarde ✅</span>}
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
                border: `2px solid ${isSelected ? (effective?.accentColor ?? agent.color) : 'var(--fz-border, #E2E8F0)'}`,
                cursor: 'pointer', color: 'var(--fz-text, #1E293B)',
                transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 18 }}>{agent.emoji || '🤖'}</span>
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
              borderColor: config.templateId === preset.id ? preset.color : 'var(--fz-border, #E2E8F0)',
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
            <p className="text-md text-tertiary mb-24">Définissez l&apos;apparence et le titre de votre assistant.</p>

            <div className="grid-2 gap-20">
              <div>
                <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                  Nom de l&apos;assistant
                </label>
                <input
                  value={config.customName}
                  onChange={e => updateConfig({ customName: e.target.value })}
                  className="input"
                  placeholder="Mon assistant"
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

            {/* Icon Grid */}
            <div className="mt-16">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 8 }}>
                Avatar / Icône
              </label>
              <div className="flex flex-wrap gap-6">
                {MATERIAL_ICON_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => updateConfig({ emoji: e })}
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      border: `2px solid ${config.emoji === e ? config.accentColor : 'var(--fz-border, #E2E8F0)'}`,
                      background: config.emoji === e ? config.accentColor + '22' : 'var(--bg-primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 22 }}>{e}</span>
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
                  <span style={{ fontSize: 24 }}>{config.emoji}</span>
                </span>
                <div>
                  <div className="text-lg font-bold">{config.customName || 'votre assistant'}</div>
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
                {config.personality.formality > 70 && <>💬 Ton décontracté et amical. </>}
                {config.personality.formality < 30 && <>🎓 Ton formel et professionnel. </>}
                {config.personality.creativity > 70 && <>💡 Très créatif et innovant. </>}
                {config.personality.creativity < 30 && <>📏 Factuel et pragmatique. </>}
                {config.personality.proactivity > 70 && <>🚀 Proactif, anticipe vos besoins. </>}
                {config.personality.humor > 60 && <>😊 N&apos;hésite pas à être léger. </>}
                {config.personality.responseLength > 70 && <>📖 Réponses détaillées avec exemples. </>}
                {config.personality.responseLength < 30 && <>⚡ Réponses ultra-concises. </>}
                {config.personality.expertiseLevel > 70 && <>🎓 Vocabulaire expert et technique. </>}
                {config.personality.expertiseLevel < 30 && <>🌿 Langage simple et accessible. </>}
                {Object.values(config.personality).every(v => v >= 40 && v <= 60) && <>⚖️ Équilibré et polyvalent.</>}
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
                        border: `1px solid ${isSelected ? config.accentColor : 'var(--fz-border, #E2E8F0)'}`,
                        background: isSelected ? config.accentColor + '22' : 'transparent',
                        color: isSelected ? config.accentColor : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                      }}
                    >
                      {isSelected ? <>✅ </> : ''}{tag}
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
                placeholder="Informations spécifiques que l'assistant doit connaître..."
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
                ✅ Toujours faire
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
                      borderColor: config.instructions.responseFormat === f.value ? config.accentColor : 'var(--fz-border, #E2E8F0)',
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
                placeholder="Ex: — Votre équipe IA Freenzy"
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
                        border: `1px solid ${isSelected ? config.accentColor : 'var(--fz-border, #E2E8F0)'}`,
                        background: isSelected ? config.accentColor + '22' : 'transparent',
                        color: isSelected ? config.accentColor : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {isSelected ? <>✅ </> : ''}{lang}
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

            {/* Documents de reference */}
            <div className="mt-24">
              <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                Documents de reference
              </label>
              <p className="text-xs text-muted mb-8">
                Enrichissez le contexte de vos assistants avec des documents. Peut beaucoup aider selon le cas, mais consomme plus de tokens.
              </p>
              <DocumentUploader
                agentContext="agent-customize"
                token={(() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; } })()}
                onUploadComplete={() => setRefreshDocs(n => n + 1)}
              />
              <DocumentList
                agentContext="agent-customize"
                token={(() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; } })()}
                refreshKey={refreshDocs}
              />
            </div>
          </div>
        )}

        {/* Step 6: Preview & Test */}
        {step === 5 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Aperçu & Test</h3>
            <p className="text-md text-tertiary mb-24">Vérifiez le prompt généré et testez votre assistant personnalisé.</p>

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
                Tester l&apos;assistant (consomme des crédits)
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
                    <span style={{ fontSize: 12 }}>{config.emoji}</span> {config.customName || 'votre assistant'} répond :
                  </div>
                  {testResponse}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-12">
              <button onClick={saveConfig} className="btn btn-primary text-lg" style={{ padding: '12px 32px' }}>
                Sauvegarder {config.customName || 'votre assistant'}
              </button>
              <button onClick={resetAgent} className="btn btn-danger btn-sm">
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Voix & Audio — ElevenLabs ─── */}
      <div style={{ marginTop: 40 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
          borderBottom: '2px solid var(--fz-accent, #0EA5E9)', paddingBottom: 12,
        }}>
          🎤
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>
              Voix &amp; Audio — ElevenLabs
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>
              Configurez la voix de vos assistants avec ElevenLabs TTS
            </p>
          </div>
        </div>

        {/* 1. Voice Selection per Agent */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--fz-text, #1E293B)' }}>
            🎯 S&eacute;lection de voix par agent
          </h3>

          {/* Agent dropdown */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginBottom: 6 }}>
              Agent &agrave; configurer
            </label>
            <select
              value={voiceAgent}
              onChange={e => { setVoiceAgent(e.target.value); saveVoiceSettings({ voiceAgent: e.target.value }); }}
              className="input"
              style={{ width: '100%', maxWidth: 360, padding: '8px 12px', cursor: 'pointer' }}
            >
              {DEFAULT_AGENTS.map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
              ))}
            </select>
          </div>

          {/* Voice grid */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginBottom: 10 }}>
            Voix disponibles
          </label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {VOICE_LIST.map(v => {
              const isSelected = selectedVoiceId === v.id;
              const isLoading = voicePreviewLoading === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => { setSelectedVoiceId(v.id); saveVoiceSettings({ selectedVoiceId: v.id }); }}
                  style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${isSelected ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-border, #E2E8F0)'}`,
                    background: isSelected ? 'rgba(14,165,233,0.08)' : 'var(--bg-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{v.name}</span>
                    {isSelected && (
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'var(--fz-accent, #0EA5E9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                      }}>✓</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: v.gender === 'Female' ? '#ec489920' : '#3b82f620',
                      color: v.gender === 'Female' ? '#ec4899' : '#3b82f6',
                    }}>{v.gender}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: 'rgba(14,165,233,0.13)', color: 'var(--fz-accent, #0EA5E9)',
                    }}>{v.lang}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); previewVoice(v.id, v.name); }}
                    disabled={isLoading}
                    style={{
                      width: '100%', padding: '6px 0', borderRadius: 8, border: '1px solid rgba(14,165,233,0.25)',
                      background: isLoading ? 'rgba(14,165,233,0.13)' : 'transparent', cursor: isLoading ? 'wait' : 'pointer',
                      fontSize: 12, fontWeight: 600, color: 'var(--fz-accent, #0EA5E9)',
                      fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                    }}
                  >
                    {isLoading ? '\u23F3 Chargement...' : '\u25B6 \u00C9couter'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Voice Settings */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--fz-text, #1E293B)' }}>
            ⚙️ R&eacute;glages vocaux
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left column: sliders */}
            <div>
              {/* Stability */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)' }}>Stabilit&eacute;</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-accent, #0EA5E9)' }}>{voiceStability.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01} value={voiceStability}
                  onChange={e => { const v = Number(e.target.value); setVoiceStability(v); saveVoiceSettings({ stability: v }); }}
                  style={{
                    width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
                    background: `linear-gradient(to right, var(--fz-accent, #0EA5E9) ${voiceStability * 100}%, var(--bg-tertiary) ${voiceStability * 100}%)`,
                    borderRadius: 3, outline: 'none', cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                  <span>Variable</span><span>Stable</span>
                </div>
              </div>

              {/* Similarity */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)' }}>Similarit&eacute;</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-accent, #0EA5E9)' }}>{voiceSimilarity.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01} value={voiceSimilarity}
                  onChange={e => { const v = Number(e.target.value); setVoiceSimilarity(v); saveVoiceSettings({ similarity: v }); }}
                  style={{
                    width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
                    background: `linear-gradient(to right, var(--fz-accent, #0EA5E9) ${voiceSimilarity * 100}%, var(--bg-tertiary) ${voiceSimilarity * 100}%)`,
                    borderRadius: 3, outline: 'none', cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                  <span>Faible</span><span>Forte</span>
                </div>
              </div>

              {/* Style */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)' }}>Style</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fz-accent, #0EA5E9)' }}>{voiceStyle.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01} value={voiceStyle}
                  onChange={e => { const v = Number(e.target.value); setVoiceStyle(v); saveVoiceSettings({ style: v }); }}
                  style={{
                    width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
                    background: `linear-gradient(to right, var(--fz-accent, #0EA5E9) ${voiceStyle * 100}%, var(--bg-tertiary) ${voiceStyle * 100}%)`,
                    borderRadius: 3, outline: 'none', cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                  <span>Neutre</span><span>Expressif</span>
                </div>
              </div>
            </div>

            {/* Right column: toggle + model */}
            <div>
              {/* Speaker Boost Toggle */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginBottom: 8 }}>
                  Speaker Boost
                </label>
                <div
                  onClick={() => { const next = !voiceSpeakerBoost; setVoiceSpeakerBoost(next); saveVoiceSettings({ speakerBoost: next }); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    padding: '8px 16px', borderRadius: 10,
                    border: `1px solid ${voiceSpeakerBoost ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-border, #E2E8F0)'}`,
                    background: voiceSpeakerBoost ? 'rgba(14,165,233,0.08)' : 'var(--bg-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 22, borderRadius: 11, position: 'relative',
                    background: voiceSpeakerBoost ? 'var(--fz-accent, #0EA5E9)' : 'var(--bg-tertiary)',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 2,
                      left: voiceSpeakerBoost ? 20 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: voiceSpeakerBoost ? 'var(--fz-accent, #0EA5E9)' : 'var(--text-muted)' }}>
                    {voiceSpeakerBoost ? 'Activ\u00e9' : 'D\u00e9sactiv\u00e9'}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 6 }}>
                  Am&eacute;liore la clart&eacute; et la pr&eacute;sence de la voix
                </p>
              </div>

              {/* Model Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginBottom: 8 }}>
                  Mod&egrave;le TTS
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'eleven_multilingual_v2', label: 'Multilingual v2', desc: 'Haute qualit\u00e9, 29 langues' },
                    { id: 'eleven_flash_v2_5', label: 'Flash v2.5', desc: 'Faible latence, temps r\u00e9el' },
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => { setVoiceModel(m.id); saveVoiceSettings({ model: m.id }); }}
                      style={{
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${voiceModel === m.id ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-border, #E2E8F0)'}`,
                        background: voiceModel === m.id ? 'rgba(14,165,233,0.08)' : 'var(--bg-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: `2px solid ${voiceModel === m.id ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-border, #E2E8F0)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {voiceModel === m.id && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fz-accent, #0EA5E9)' }} />
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{m.label}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 24px', fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Cloner ma voix */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div
            onClick={() => setShowVoiceClone(!showVoiceClone)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--fz-text, #1E293B)' }}>
              {'\uD83E\uDDEC'} Cloner ma voix
            </h3>
            <span style={{
              fontSize: 18, color: 'var(--fz-text-muted, #94A3B8)', transition: 'transform 0.2s',
              transform: showVoiceClone ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>{'\u25BC'}</span>
          </div>

          {showVoiceClone && (
            <div style={{ marginTop: 16, opacity: 0.5, pointerEvents: 'none' as const }}>
              <div style={{
                padding: 16, borderRadius: 10, border: '1px dashed var(--fz-border, #E2E8F0)',
                background: 'var(--bg-secondary)', marginBottom: 16,
              }}>
                <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  Uploadez 1-5 minutes d&apos;audio de votre voix pour cr&eacute;er un clone vocal personnalis&eacute;.
                  La qualit&eacute; du clone d&eacute;pend de la clart&eacute; de l&apos;enregistrement.
                </p>
                <div style={{
                  padding: 32, borderRadius: 10, border: '2px dashed var(--fz-border, #E2E8F0)',
                  background: 'var(--bg-primary)', textAlign: 'center',
                }}>
                  <div style={{ marginBottom: 8 }}>🎤</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', margin: '0 0 4px 0' }}>
                    Glissez un fichier audio ici
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', margin: 0 }}>
                    Formats accept&eacute;s : MP3, WAV, M4A, OGG (max 25 MB)
                  </p>
                  <input type="file" accept="audio/*" disabled style={{ display: 'none' }} />
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10,
                background: '#f59e0b18', border: '1px solid #f59e0b40',
              }}>
                ⭐
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                  Fonctionnalit&eacute; premium — Bient&ocirc;t disponible
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Capabilities ElevenLabs */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--fz-text, #1E293B)' }}>
            💡 Capacit&eacute;s ElevenLabs
          </h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}>
            {CAPABILITIES.map(cap => (
              <div
                key={cap.title}
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  border: `1px solid ${cap.available ? 'rgba(14,165,233,0.25)' : 'var(--fz-border, #E2E8F0)'}`,
                  background: cap.available ? 'rgba(14,165,233,0.03)' : 'var(--bg-secondary)',
                  opacity: cap.available ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{cap.icon === 'mic' ? '🎤' : cap.icon === 'record_voice_over' ? '🗣️' : cap.icon === 'music_note' ? '🎵' : cap.icon === 'language' ? '🌐' : cap.icon === 'volume_off' ? '🔇' : cap.icon === 'menu_book' ? '📖' : cap.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{cap.title}</span>
                  {cap.available && (
                    <span style={{
                      marginLeft: 'auto', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 700,
                      background: '#22c55e20', color: '#22c55e',
                    }}>ACTIF</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.5 }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
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
            Sauvegarder ✅
          </button>
        )}
      </div>
    </div>
  );
}
