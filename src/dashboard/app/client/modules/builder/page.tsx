'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleType = 'form' | 'crm' | 'agent' | 'dashboard';
type FieldType = 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'textarea' | 'number';

interface SchemaField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for 'select'
}

interface ModuleSchema {
  fields?: SchemaField[];
  system_prompt?: string;
  welcome_message?: string;
  model?: string;
  language?: string;
  confirmation_message?: string;
  agent_id?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_TYPES: { type: ModuleType; icon: string; title: string; desc: string; color: string }[] = [
  { type: 'form', icon: '📋', title: 'Formulaire intelligent', color: '#10b981', desc: 'Collecte de données structurées. Peut alimenter un agent ou une base.' },
  { type: 'crm', icon: '📊', title: 'Base de données CRM', color: '#3b82f6', desc: 'Table personnalisée avec colonnes configurables, recherche et CRUD intégré.' },
  { type: 'agent', icon: '🤖', title: 'Agent IA dédié', color: '#8b5cf6', desc: 'Mini-chatbot IA avec son propre prompt. Intégrable sur votre site web.' },
  { type: 'dashboard', icon: '📈', title: 'Tableau de bord', color: '#f59e0b', desc: 'Visualisation des enregistrements de votre module sous forme de compteurs et graphiques.' },
];

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Texte court' },
  { type: 'textarea', label: 'Texte long' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Téléphone' },
  { type: 'number', label: 'Nombre' },
  { type: 'select', label: 'Liste déroulante' },
  { type: 'checkbox', label: 'Case à cocher' },
  { type: 'date', label: 'Date' },
];

const EMOJIS = ['📋', '📊', '🤖', '📈', '🎯', '💼', '🏆', '⚡', '🌟', '🔥', '💡', '🛒', '📞', '✉️', '📝', '🎨', '🏠', '👥', '🔧', '📦', '🌍', '💰', '📅', '🔔'];
const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldEditor({ field, onChange, onDelete }: {
  field: SchemaField;
  onChange: (f: SchemaField) => void;
  onDelete: () => void;
}) {
  const [optionInput, setOptionInput] = useState('');

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, border: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
          placeholder="Libellé du champ"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13 }}
        />
        <select
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value as FieldType })}
          style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13 }}
        >
          {FIELD_TYPES.map(ft => (
            <option key={ft.type} value={ft.type}>{ft.label}</option>
          ))}
        </select>
        <button onClick={onDelete} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={field.placeholder ?? ''}
          onChange={e => onChange({ ...field, placeholder: e.target.value })}
          placeholder="Placeholder (optionnel)"
          style={{ flex: 1, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={field.required} onChange={e => onChange({ ...field, required: e.target.checked })} />
          Requis
        </label>
      </div>
      {field.type === 'select' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Options :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {(field.options ?? []).map((opt, i) => (
              <span key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                {opt}
                <button onClick={() => onChange({ ...field, options: field.options?.filter((_, j) => j !== i) })} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={optionInput}
              onChange={e => setOptionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && optionInput.trim()) { onChange({ ...field, options: [...(field.options ?? []), optionInput.trim()] }); setOptionInput(''); } }}
              placeholder="Ajouter une option…"
              style={{ flex: 1, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12 }}
            />
            <button
              onClick={() => { if (optionInput.trim()) { onChange({ ...field, options: [...(field.options ?? []), optionInput.trim()] }); setOptionInput(''); } }}
              style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { showError, showSuccess } = useToast();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Type
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);

  // Step 2 — Identity
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [color, setColor] = useState('#6366f1');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  // Step 3 — Structure
  const [fields, setFields] = useState<SchemaField[]>([
    { id: uid(), type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
    { id: uid(), type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
  ]);
  const [confirmationMessage, setConfirmationMessage] = useState('Merci pour votre envoi !');
  const [systemPrompt, setSystemPrompt] = useState('Tu es un assistant IA spécialisé. Réponds de manière professionnelle et utile.');
  const [welcomeMessage, setWelcomeMessage] = useState('Bonjour ! Comment puis-je vous aider ?');
  const [aiModel, setAiModel] = useState('claude-haiku-4-5-20251001');
  const [aiLanguage, setAiLanguage] = useState('fr');

  // Step 4 — Publish
  const [isPublished, setIsPublished] = useState(true);
  const [publicAccess, setPublicAccess] = useState(false);

  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugEdited]);

  // Load for edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const session = getSession();
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/portal/modules/${editId}`, token: session.token }),
        });
        const data = await res.json();
        const m = data.module;
        if (!m) return;
        setModuleType(m.type);
        setName(m.name ?? '');
        setDescription(m.description ?? '');
        setEmoji(m.emoji ?? '📋');
        setColor(m.color ?? '#6366f1');
        setSlug(m.slug ?? '');
        setSlugEdited(true);
        setIsPublished(m.is_published ?? true);
        setPublicAccess(m.public_access ?? false);
        const schema: ModuleSchema = typeof m.schema === 'string' ? JSON.parse(m.schema) : (m.schema ?? {});
        if (schema.fields) setFields(schema.fields);
        if (schema.confirmation_message) setConfirmationMessage(schema.confirmation_message);
        if (schema.system_prompt) setSystemPrompt(schema.system_prompt);
        if (schema.welcome_message) setWelcomeMessage(schema.welcome_message);
        if (schema.model) setAiModel(schema.model);
        if (schema.language) setAiLanguage(schema.language);
        setStep(2); // jump to step 2 when editing
      } catch { /* */ }
    })();
  }, [editId]);

  const canNext = () => {
    if (step === 1) return moduleType !== null;
    if (step === 2) return name.trim().length >= 2 && slug.trim().length >= 2;
    return true;
  };

  function buildSchema(): ModuleSchema {
    if (moduleType === 'form' || moduleType === 'crm') {
      return { fields, confirmation_message: confirmationMessage };
    }
    if (moduleType === 'agent') {
      return { system_prompt: systemPrompt, welcome_message: welcomeMessage, model: aiModel, language: aiLanguage };
    }
    return {}; // dashboard — auto-generated
  }

  async function save() {
    setSaving(true);
    try {
      const session = getSession();
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        color,
        slug: slug.trim(),
        type: moduleType!,
        schema: buildSchema(),
        is_published: isPublished,
        public_access: publicAccess,
      };
      const path = editId ? `/portal/modules/${editId}` : '/portal/modules';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, token: session.token, method, data: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      showSuccess(editId ? 'Module mis à jour !' : 'Module créé !');
      const savedSlug = data.module?.slug ?? slug;
      router.push(`/client/modules/${savedSlug}`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  const STEP_LABELS = ['Type', 'Identité', 'Structure', 'Publier'];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 860, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {editId ? '✏️ Modifier le module' : '🔨 Créer un module'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Créez une mini-application fonctionnelle intégrée à votre dashboard.
        </p>
      </div>

      {/* ── Stepper ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, position: 'relative' }}>
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <button
              key={s}
              onClick={() => { if (s < step) setStep(s); }}
              disabled={s >= step}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: s < step ? 'pointer' : 'default',
                background: active ? 'var(--accent)' : done ? '#10b981' : 'var(--bg-secondary)',
                color: (active || done) ? 'white' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500, fontSize: 13,
                borderRadius: s === 1 ? '12px 0 0 12px' : s === 4 ? '0 12px 12px 0' : 0,
                transition: 'all 0.2s',
              }}
            >
              {done ? '✓ ' : `${s}. `}{label}
            </button>
          );
        })}
      </div>

      {/* ── Step 1 — Type ── */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Quel type de module souhaitez-vous créer ?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {MODULE_TYPES.map(mt => (
              <button
                key={mt.type}
                onClick={() => { setModuleType(mt.type); setEmoji(mt.icon); }}
                style={{
                  padding: 24, borderRadius: 16, border: `2px solid ${moduleType === mt.type ? mt.color : 'var(--border)'}`,
                  background: moduleType === mt.type ? `${mt.color}10` : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{mt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{mt.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2 — Identity ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Donnez une identité à votre module</h2>

          {/* Emoji + Color row */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Icône</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)} style={{
                    width: 36, height: 36, borderRadius: 8, border: `2px solid ${emoji === e ? 'var(--accent)' : 'transparent'}`,
                    background: emoji === e ? 'var(--accent)20' : 'var(--bg-secondary)',
                    cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Couleur</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 180 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: 28, height: 28, borderRadius: '50%', border: `3px solid ${color === c ? 'white' : 'transparent'}`,
                    background: c, cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: `${color}15`, borderRadius: 12, border: `2px solid ${color}40`, alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 24 }}>{emoji}</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{name || 'Nom du module'}</span>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex : Demande de devis, Base contacts, Agent support…"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description (optionnelle)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Courte description du rôle de ce module"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Slug URL *</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>/client/modules/</span>
              <input
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                placeholder="mon-module"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 — Structure ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {moduleType === 'agent' ? 'Configurez votre agent IA' :
             moduleType === 'dashboard' ? 'Votre dashboard sera généré automatiquement' :
             'Définissez les champs de votre module'}
          </h2>

          {/* Form / CRM */}
          {(moduleType === 'form' || moduleType === 'crm') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((field, i) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onChange={updated => setFields(prev => prev.map((f, j) => j === i ? updated : f))}
                  onDelete={() => setFields(prev => prev.filter((_, j) => j !== i))}
                />
              ))}
              <button
                onClick={() => setFields(prev => [...prev, { id: uid(), type: 'text', label: '', required: false }])}
                style={{ padding: '10px', borderRadius: 10, border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
              >
                + Ajouter un champ
              </button>
              {moduleType === 'form' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message de confirmation</label>
                  <input
                    value={confirmationMessage}
                    onChange={e => setConfirmationMessage(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Agent */}
          {moduleType === 'agent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prompt système</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message d&apos;accueil</label>
                <input
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Modèle</label>
                  <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="claude-haiku-4-5-20251001">Haiku 4.5 (rapide)</option>
                    <option value="claude-sonnet-4-6">Sonnet 4.6 (puissant)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Langue</label>
                  <select value={aiLanguage} onChange={e => setAiLanguage(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13 }}>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="ar">Arabe</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {moduleType === 'dashboard' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Votre tableau de bord sera généré automatiquement à partir des données de vos autres modules.
                Il affichera des compteurs, des graphiques et des statistiques en temps réel.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4 — Publish ── */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Publiez votre module</h2>

          {/* Preview card */}
          <div style={{ background: `${color}10`, border: `2px solid ${color}40`, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {emoji}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
              {description && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{description}</div>}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {MODULE_TYPES.find(t => t.type === moduleType)?.icon} {MODULE_TYPES.find(t => t.type === moduleType)?.title}
                {' · '}/client/modules/<strong>{slug}</strong>
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Publier maintenant</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Le module sera accessible et visible dans votre sidebar.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}>
              <input type="checkbox" checked={publicAccess} onChange={e => setPublicAccess(e.target.checked)} style={{ width: 18, height: 18 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>URL publique</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Génère un lien partageable : <code>/m/{slug}</code> — accessible sans connexion.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/client/modules')}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}
        >
          ← {step > 1 ? 'Précédent' : 'Annuler'}
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            style={{ padding: '10px 24px', borderRadius: 10, background: canNext() ? 'var(--accent)' : 'var(--bg-secondary)', color: canNext() ? 'white' : 'var(--text-secondary)', border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '10px 28px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14 }}
          >
            {saving ? 'Publication...' : editId ? '✅ Mettre à jour' : '🚀 Publier le module'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ModuleBuilderPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
