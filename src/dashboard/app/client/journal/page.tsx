'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';
import { recordEvent } from '../../../lib/gamification';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Journal Personnel
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_journal';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

const MOODS: { emoji: string; label: string; color: string }[] = [
  { emoji: '🤩', label: 'Super', color: '#22C55E' },
  { emoji: '😊', label: 'Bien', color: '#3B82F6' },
  { emoji: '😐', label: 'Neutre', color: '#F59E0B' },
  { emoji: '😢', label: 'Triste', color: '#8B5CF6' },
  { emoji: '😡', label: 'En colère', color: '#EF4444' },
];

const PROMPTS = [
  "Qu'est-ce qui t'a rendu heureux aujourd'hui ?",
  "Quel défi as-tu surmonté récemment ?",
  "De quoi es-tu reconnaissant aujourd'hui ?",
  "Qu'as-tu appris de nouveau cette semaine ?",
  "Quel est ton plus grand accomplissement récent ?",
  "Qu'est-ce qui t'a surpris aujourd'hui ?",
  "Comment te sens-tu en ce moment, et pourquoi ?",
  "Quel conseil donnerais-tu à ton toi d'il y a un an ?",
  "Qu'est-ce que tu voudrais améliorer demain ?",
  "Quel moment de ta journée referais-tu ?",
  "Quelle personne a eu un impact positif sur toi récemment ?",
  "Si tu pouvais changer une chose aujourd'hui, ce serait quoi ?",
  "Quel est ton objectif pour la semaine prochaine ?",
  "Qu'est-ce qui te stresse en ce moment ? Comment le gérer ?",
  "Décris un petit bonheur de ta journée.",
  "Qu'as-tu fait pour prendre soin de toi aujourd'hui ?",
  "Quel livre, film ou musique t'a marqué dernièrement ?",
  "Si ta journée était un film, quel serait son titre ?",
  "Qu'est-ce que tu aimerais faire mais que tu repousses ?",
  "Écris trois mots qui résument ta journée.",
  "Quelle habitude voudrais-tu développer ?",
  "Quel est ton rêve le plus fou ?",
];

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return [];
}

function saveEntries(entries: JournalEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

function seedEntries(): JournalEntry[] {
  const now = new Date();
  const entries: JournalEntry[] = [
    { id: uid(), date: now.toISOString().slice(0, 10), content: "Très bonne journée ! J'ai terminé le projet client et reçu des retours positifs. Feeling motivated.", mood: '🤩', tags: ['travail', 'motivation'], createdAt: now.toISOString() },
    { id: uid(), date: new Date(now.getTime() - 86400000).toISOString().slice(0, 10), content: "Journée calme, beaucoup de lecture. J'ai commencé un nouveau livre sur la productivité. Besoin de plus de sommeil.", mood: '😊', tags: ['lecture', 'bien-être'], createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: uid(), date: new Date(now.getTime() - 86400000 * 3).toISOString().slice(0, 10), content: "Stressé par les deadlines. Mais j'ai réussi à méditer 10 minutes ce matin, ça aide.", mood: '😐', tags: ['stress', 'méditation'], createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
  ];
  saveEntries(entries);
  return entries;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function JournalPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['journal'];
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setMounted(true);
    const loaded = loadEntries();
    setEntries(loaded.length > 0 ? loaded : seedEntries());
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  const persist = (updated: JournalEntry[]) => { setEntries(updated); saveEntries(updated); };

  const addEntry = () => {
    if (!content.trim()) return;
    const entry: JournalEntry = { id: uid(), date: new Date().toISOString().slice(0, 10), content: content.trim(), mood, tags, createdAt: new Date().toISOString() };
    persist([entry, ...entries]);
    recordEvent({ type: 'document' }); // +25 XP for journal entry
    setShowNew(false); setContent(''); setMood('😊'); setTags([]); setTagInput('');
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  };

  const deleteEntry = (id: string) => persist(entries.filter(e => e.id !== id));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const filtered = useMemo(() => {
    let result = [...entries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.content.toLowerCase().includes(q));
    }
    if (filterMood) result = result.filter(e => e.mood === filterMood);
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [entries, search, filterMood]);

  // Monthly mood chart
  const moodChart = useMemo(() => {
    const counts: Record<string, number> = {};
    MOODS.forEach(m => { counts[m.emoji] = 0; });
    entries.forEach(e => { if (counts[e.mood] !== undefined) counts[e.mood]++; });
    const max = Math.max(1, ...Object.values(counts));
    return MOODS.map(m => ({ ...m, count: counts[m.emoji] || 0, pct: Math.round(((counts[m.emoji] || 0) / max) * 100) }));
  }, [entries]);

  const exportMarkdown = () => {
    const md = entries.map(e => `## ${e.date} ${e.mood}\n\n${e.content}\n\nTags: ${e.tags.join(', ') || 'aucun'}\nMots: ${wordCount(e.content)}\n`).join('\n---\n\n');
    const blob = new Blob([`# Mon Journal\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'journal-freenzy.md'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 900 }}>
      {/* Header */}
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>{meta.emoji}</span>
        <h1 style={CU.pageTitle}>{meta.title}</h1>
        <PageExplanation pageId="journal" text={meta.helpText} />
      </div>
      <p style={{ ...CU.pageSubtitle, marginBottom: 20 }}>{meta.subtitle}</p>

      {/* Mood distribution */}
      <div style={{ ...CU.card, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', ...CU.sectionTitle }}>Distribution des humeurs</h3>
        <div style={{ display: 'flex', gap: isMobile ? 8 : 16, alignItems: 'flex-end', height: 80 }}>
          {moodChart.map(m => (
            <div key={m.emoji} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
              <span style={{ fontSize: 12, color: CU.textSecondary, fontWeight: 600 }}>{m.count}</span>
              <div style={{ width: '100%', maxWidth: 40, height: `${Math.max(8, m.pct)}%`, borderRadius: 4, background: m.color, transition: 'height 0.3s ease' }} />
              <span style={{ fontSize: 18 }}>{m.emoji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...CU.input, maxWidth: 240 }} />
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)} style={{ ...CU.select, maxWidth: 160 }}>
          <option value="">Toutes les humeurs</option>
          {MOODS.map(m => <option key={m.emoji} value={m.emoji}>{m.emoji} {m.label}</option>)}
        </select>
        <button onClick={() => setShowNew(!showNew)} style={CU.btnPrimary}>+ Nouvelle entrée</button>
        {entries.length > 0 && (
          <button onClick={exportMarkdown} style={CU.btnGhost}>Exporter MD</button>
        )}
      </div>

      {/* New entry form */}
      {showNew && (
        <div style={{ ...CU.card, marginBottom: 20 }}>
          {/* Prompt suggestion */}
          <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={{ fontSize: 13, color: CU.textSecondary, fontStyle: 'italic', flex: 1 }}>{prompt}</span>
            <button onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔄</button>
          </div>

          {/* Mood picker */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: CU.textSecondary }}>Humeur :</span>
            {MOODS.map(m => (
              <button key={m.emoji} onClick={() => setMood(m.emoji)} style={{ fontSize: 24, background: mood === m.emoji ? m.color + '33' : 'transparent', border: mood === m.emoji ? `2px solid ${m.color}` : '2px solid transparent', borderRadius: 8, padding: 4, cursor: 'pointer', lineHeight: 1 }}>
                {m.emoji}
              </button>
            ))}
          </div>

          <textarea placeholder="Écrivez votre journal du jour..." value={content} onChange={e => setContent(e.target.value)} rows={6} style={{ ...CU.textarea, marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 10 }}>{wordCount(content)} mots</div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} style={{ ...CU.input, maxWidth: 140 }} />
            <button onClick={addTag} style={{ ...CU.btnSmall, height: 36 }}>+</button>
            {tags.map(t => (
              <span key={t} style={{ ...CU.badge, background: CU.accent, color: '#fff' }}>
                {t} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setTags(tags.filter(x => x !== t))}>x</span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addEntry} style={CU.btnPrimary}>Enregistrer</button>
            <button onClick={() => setShowNew(false)} style={CU.btnGhost}>Annuler</button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>📓</div>
          <div style={CU.emptyTitle}>Aucune entrée trouvée</div>
          <div style={CU.emptyDesc}>Commencez votre journal !</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(e => {
            const moodData = MOODS.find(m => m.emoji === e.mood);
            return (
              <div key={e.id} style={{ ...CU.card, borderLeft: `4px solid ${moodData?.color || CU.accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{e.mood}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: CU.textSecondary }}>{wordCount(e.content)} mots</span>
                    <button onClick={() => deleteEntry(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5 }}>🗑️</button>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 14, color: CU.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{e.content}</p>
                {e.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {e.tags.map(t => (
                      <span key={t} style={CU.badge}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
