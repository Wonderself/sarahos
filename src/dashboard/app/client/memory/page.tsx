'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU } from '../../../lib/page-styles';
import PageBlogSection from '@/components/blog/PageBlogSection';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Memoire IA
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_user_memories';
const TOGGLES_KEY = 'fz_memory_assistant_toggles';

// ─── Types ───────────────────────────────────────────

type MemoryCategory = 'client' | 'project' | 'preference' | 'fact' | 'instruction' | 'other';
type MemorySource = 'manual' | 'auto' | 'conversation';

interface Memory {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  shared: boolean;
  active: boolean;
  source: MemorySource;
  assistantIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface AssistantToggle {
  id: string;
  name: string;
  emoji: string;
  enabled: boolean;
}

// ─── Constants ───────────────────────────────────────

const CATEGORY_EMOJI: Record<MemoryCategory, string> = {
  client: '\u{1F464}',
  project: '\u{1F4C1}',
  preference: '\u2699\uFE0F',
  fact: '\u{1F4CC}',
  instruction: '\u{1F4DD}',
  other: '\u{1F4E6}',
};

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  client: 'Clients',
  project: 'Projets',
  preference: 'Preferences',
  fact: 'Faits',
  instruction: 'Instructions',
  other: 'Autres',
};

const ALL_CATEGORIES: MemoryCategory[] = ['client', 'project', 'preference', 'fact', 'instruction', 'other'];

const TOP_ASSISTANTS: { id: string; name: string; emoji: string }[] = [
  { id: 'fz-commercial', name: 'Commercial', emoji: '\u{1F4BC}' },
  { id: 'fz-marketing', name: 'Marketing', emoji: '\u{1F4E3}' },
  { id: 'fz-assistante', name: 'Secretaire', emoji: '\u{1F4CB}' },
  { id: 'fz-redacteur', name: 'Redacteur', emoji: '\u270D\uFE0F' },
  { id: 'fz-juridique', name: 'Juridique', emoji: '\u2696\uFE0F' },
  { id: 'fz-finance', name: 'Finance', emoji: '\u{1F4B0}' },
  { id: 'fz-rh', name: 'Ressources Humaines', emoji: '\u{1F465}' },
  { id: 'fz-communication', name: 'Communication', emoji: '\u{1F4E2}' },
];

const TOP_12_ASSISTANTS: { id: string; name: string; emoji: string }[] = [
  ...TOP_ASSISTANTS,
  { id: 'fz-dev', name: 'Developpeur', emoji: '\u{1F4BB}' },
  { id: 'fz-dg', name: 'Direction Generale', emoji: '\u{1F451}' },
  { id: 'fz-repondeur', name: 'Repondeur', emoji: '\u{1F4DE}' },
  { id: 'fz-data', name: 'Data Analyst', emoji: '\u{1F4CA}' },
];

const SOURCE_LABELS: Record<MemorySource, string> = {
  manual: 'Manuel',
  auto: 'Auto',
  conversation: 'Conversation',
};

// ─── Helpers ─────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

function loadMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Memory[];
  } catch { /* ignore */ }
  return [];
}

function saveMemories(memories: Memory[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memories)); } catch { /* ignore */ }
}

function loadToggles(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(TOGGLES_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch { /* ignore */ }
  return {};
}

function saveToggles(toggles: Record<string, boolean>): void {
  try { localStorage.setItem(TOGGLES_KEY, JSON.stringify(toggles)); } catch { /* ignore */ }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function estimateStorageSize(memories: Memory[]): string {
  const bytes = new Blob([JSON.stringify(memories)]).size;
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Component ───────────────────────────────────────

export default function MemoryPage() {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MemoryCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assistantToggles, setAssistantToggles] = useState<Record<string, boolean>>({});

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<MemoryCategory>('fact');
  const [formTags, setFormTags] = useState('');
  const [formShared, setFormShared] = useState(false);
  const [formAssistantAll, setFormAssistantAll] = useState(true);
  const [formAssistantIds, setFormAssistantIds] = useState<string[]>([]);

  // ─── Init ────────────────────────────────────────
  useEffect(() => {
    setMemories(loadMemories());
    const toggles = loadToggles();
    const initial: Record<string, boolean> = {};
    TOP_12_ASSISTANTS.forEach(a => { initial[a.id] = toggles[a.id] !== undefined ? toggles[a.id] : true; });
    setAssistantToggles(initial);
  }, []);

  // ─── Persist toggles ────────────────────────────
  useEffect(() => {
    if (Object.keys(assistantToggles).length > 0) saveToggles(assistantToggles);
  }, [assistantToggles]);

  // ─── Filtered memories ──────────────────────────
  const filtered = useMemo(() => {
    let list = memories;
    if (categoryFilter !== 'all') {
      list = list.filter(m => m.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [memories, search, categoryFilter]);

  // ─── Stats ──────────────────────────────────────
  const sharedCount = useMemo(() => memories.filter(m => m.shared).length, [memories]);
  const storageSize = useMemo(() => estimateStorageSize(memories), [memories]);

  // ─── Actions ────────────────────────────────────
  const persist = useCallback((next: Memory[]) => {
    setMemories(next);
    saveMemories(next);
  }, []);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('fact');
    setFormTags('');
    setFormShared(false);
    setFormAssistantAll(true);
    setFormAssistantIds([]);
    setShowForm(false);
    setEditingId(null);
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEdit = useCallback((m: Memory) => {
    setFormTitle(m.title);
    setFormContent(m.content);
    setFormCategory(m.category);
    setFormTags(m.tags.join(', '));
    setFormShared(m.shared);
    if (m.assistantIds.length === 0) {
      setFormAssistantAll(true);
      setFormAssistantIds([]);
    } else {
      setFormAssistantAll(false);
      setFormAssistantIds([...m.assistantIds]);
    }
    setEditingId(m.id);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formTitle.trim() || !formContent.trim()) return;
    const now = new Date().toISOString();
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const assistantIds = formAssistantAll ? [] : formAssistantIds;

    if (editingId) {
      const next = memories.map(m => m.id === editingId ? {
        ...m, title: formTitle.trim(), content: formContent.trim(), category: formCategory,
        tags, shared: formShared, assistantIds, updatedAt: now,
      } : m);
      persist(next);
    } else {
      const newMem: Memory = {
        id: uid(), category: formCategory, title: formTitle.trim(), content: formContent.trim(),
        tags, shared: formShared, active: true, source: 'manual', assistantIds, createdAt: now, updatedAt: now,
      };
      persist([newMem, ...memories]);
    }
    resetForm();
  }, [formTitle, formContent, formCategory, formTags, formShared, formAssistantAll, formAssistantIds, editingId, memories, persist, resetForm]);

  const handleDelete = useCallback((id: string) => {
    persist(memories.filter(m => m.id !== id));
  }, [memories, persist]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freenzy-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [memories]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as Memory[];
        if (Array.isArray(imported)) {
          const merged = [...memories];
          const existingIds = new Set(memories.map(m => m.id));
          imported.forEach(m => { if (!existingIds.has(m.id)) merged.push(m); });
          persist(merged);
        }
      } catch { /* invalid JSON */ }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [memories, persist]);

  const toggleAssistant = useCallback((id: string) => {
    setAssistantToggles(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFormAssistant = useCallback((id: string) => {
    setFormAssistantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  // ─── Styles ─────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    maxWidth: 820,
    margin: '0 auto',
    padding: isMobile ? '16px 12px' : '24px 20px',
  };

  const cardStyle: React.CSSProperties = {
    ...CU.card,
    marginBottom: 8,
  };

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    background: CU.bgSecondary,
    fontSize: 11,
    color: CU.textSecondary,
    fontWeight: 500,
  };

  const toggleTrack = (on: boolean): React.CSSProperties => ({
    width: 38,
    height: 22,
    borderRadius: 11,
    background: on ? CU.accent : CU.border,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
  });

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 3,
    left: on ? 19 : 3,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  });

  // ─── Empty state ────────────────────────────────
  if (memories.length === 0 && !showForm) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: isMobile ? '60px 16px' : '100px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{1F9E0}'}</div>
          <h2 style={{ ...CU.pageTitle, marginBottom: 8 }}>Votre memoire IA est vide</h2>
          <p style={{ ...CU.pageSubtitle, maxWidth: 420, margin: '0 auto 24px' }}>
            Ajoutez des informations pour que vos assistants se souviennent de vos clients, projets et preferences.
          </p>
          <button style={CU.btnPrimary} onClick={openAdd}>
            {'\u2795'} Ajouter mon premier souvenir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* ─── Header ───────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={CU.pageTitle}>{'\u{1F9E0}'} Memoire IA</h1>
        <p style={CU.pageSubtitle}>Ce que vos assistants savent de vous</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={pillStyle}>{memories.length} souvenir{memories.length > 1 ? 's' : ''}</span>
          <span style={pillStyle}>{sharedCount} partage{sharedCount > 1 ? 's' : ''}</span>
          <span style={pillStyle}>{storageSize}</span>
        </div>
      </div>

      {/* ─── Toolbar ──────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Rechercher dans la memoire..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...CU.input, flex: isMobile ? '1 1 100%' : '1 1 200px', minWidth: 0 }}
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as MemoryCategory | 'all')}
          style={CU.select}
        >
          <option value="all">Tous</option>
          {ALL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <button style={CU.btnPrimary} onClick={openAdd}>{'\u2795'} Ajouter</button>
        <button style={CU.btnGhost} onClick={handleExport}>{'\u{1F4E5}'} Exporter</button>
        <button style={CU.btnGhost} onClick={() => fileInputRef.current?.click()}>{'\u{1F4E4}'} Importer</button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </div>

      {/* ─── Inline Form ──────────────────────────── */}
      {showForm && (
        <div style={{ ...CU.card, marginBottom: 16, border: `2px solid ${CU.accent}` }}>
          <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>
            {editingId ? '\u270F\uFE0F Modifier le souvenir' : '\u2795 Nouveau souvenir'}
          </h3>

          <div style={{ marginBottom: 10 }}>
            <label style={CU.label}>Titre *</label>
            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Ex: Preferences client Dupont"
              style={CU.input}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={CU.label}>Contenu *</label>
            <textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Informations a retenir..."
              rows={3}
              style={CU.textarea}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={CU.label}>Categorie</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as MemoryCategory)}
                style={{ ...CU.select, width: '100%' }}
              >
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label style={CU.label}>Tags (separes par des virgules)</label>
              <input
                type="text"
                value={formTags}
                onChange={e => setFormTags(e.target.value)}
                placeholder="vip, urgent, tech"
                style={CU.input}
              />
            </div>
          </div>

          {/* Shared toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={toggleTrack(formShared)} onClick={() => setFormShared(!formShared)}>
              <div style={toggleKnob(formShared)} />
            </div>
            <span style={{ fontSize: 13, color: CU.text }}>Partage avec l&apos;equipe</span>
          </div>

          {/* Assistants */}
          <div style={{ marginBottom: 12 }}>
            <label style={CU.label}>Assistants autorises</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={toggleTrack(formAssistantAll)} onClick={() => setFormAssistantAll(!formAssistantAll)}>
                <div style={toggleKnob(formAssistantAll)} />
              </div>
              <span style={{ fontSize: 13, color: CU.text }}>Tous les assistants</span>
            </div>
            {!formAssistantAll && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TOP_ASSISTANTS.map(a => {
                  const checked = formAssistantIds.includes(a.id);
                  return (
                    <label key={a.id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6, fontSize: 12,
                      background: checked ? CU.accent : CU.bgSecondary,
                      color: checked ? '#fff' : CU.text,
                      cursor: 'pointer', transition: 'all 0.15s',
                      minHeight: 32,
                    }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFormAssistant(a.id)}
                        style={{ display: 'none' }}
                      />
                      {a.emoji} {a.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={CU.btnPrimary} onClick={handleSave}>{'\u{1F4BE}'} Enregistrer</button>
            <button style={CU.btnGhost} onClick={resetForm}>Annuler</button>
          </div>
        </div>
      )}

      {/* ─── Memory List ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: CU.textMuted, fontSize: 13 }}>
          Aucun souvenir ne correspond a votre recherche.
        </div>
      ) : (
        filtered.map(m => {
          const isExpanded = expandedId === m.id;
          return (
            <div key={m.id} style={cardStyle}>
              {/* Row 1: category + title + badges + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{CATEGORY_EMOJI[m.category]}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: CU.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.title}
                </span>
                {m.shared && <span style={pillStyle}>{'\u{1F465}'} Partage</span>}
                <button
                  style={{ ...CU.btnSmall, minWidth: isMobile ? 44 : 'auto', minHeight: isMobile ? 44 : 28, justifyContent: 'center' }}
                  onClick={() => openEdit(m)}
                  title="Modifier"
                >
                  {'\u270F\uFE0F'}
                </button>
                <button
                  style={{ ...CU.btnSmall, color: CU.danger, minWidth: isMobile ? 44 : 'auto', minHeight: isMobile ? 44 : 28, justifyContent: 'center' }}
                  onClick={() => handleDelete(m.id)}
                  title="Supprimer"
                >
                  {'\u{1F5D1}\uFE0F'}
                </button>
              </div>

              {/* Row 2: content */}
              <div
                style={{
                  fontSize: 13, color: CU.textSecondary, lineHeight: 1.5, marginBottom: 6, cursor: 'pointer',
                  ...(isExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }),
                }}
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
              >
                {m.content}
              </div>

              {/* Row 3: tags + assistants */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                {m.tags.map((tag, i) => (
                  <span key={i} style={pillStyle}>{tag}</span>
                ))}
                {m.tags.length > 0 && (m.assistantIds.length > 0 || m.assistantIds.length === 0) && (
                  <span style={{ ...pillStyle, background: 'transparent', color: CU.textMuted }}>
                    {m.assistantIds.length === 0
                      ? 'Tous les assistants'
                      : `\u{1F916} ${m.assistantIds.map(aid => TOP_ASSISTANTS.find(a => a.id === aid)?.name || aid).join(', ')}`
                    }
                  </span>
                )}
              </div>

              {/* Row 4: date + source */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: CU.textMuted }}>
                <span>Ajoute le {formatDate(m.createdAt)}</span>
                <span style={pillStyle}>{SOURCE_LABELS[m.source]}</span>
              </div>
            </div>
          );
        })
      )}

      {/* ─── Assistant Toggle Section ─────────────── */}
      <div style={{ ...CU.card, marginTop: 32 }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 14 }}>{'\u{1F916}'} Quels assistants utilisent la memoire ?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
          {TOP_12_ASSISTANTS.map(a => {
            const on = assistantToggles[a.id] !== false;
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: CU.bgSecondary,
              }}>
                <span style={{ fontSize: 16 }}>{a.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, color: CU.text }}>{a.name}</span>
                <div style={toggleTrack(on)} onClick={() => toggleAssistant(a.id)}>
                  <div style={toggleKnob(on)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PageBlogSection pageId="memory" />
    </div>
  );
}
