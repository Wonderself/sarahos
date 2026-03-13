'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar } from '../../../lib/page-styles';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Notes rapides
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_notes';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

const COLORS: { name: string; value: string }[] = [
  { name: 'Jaune', value: '#FFF9C4' },
  { name: 'Bleu', value: '#BBDEFB' },
  { name: 'Vert', value: '#C8E6C9' },
  { name: 'Rose', value: '#F8BBD0' },
  { name: 'Violet', value: '#E1BEE7' },
  { name: 'Orange', value: '#FFE0B2' },
];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return [];
}

function saveNotes(notes: Note[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* */ }
}

function seedNotes(): Note[] {
  const now = new Date().toISOString();
  const demo: Note[] = [
    { id: uid(), title: 'Bienvenue !', content: 'Cliquez sur une note pour la modifier. Utilisez les tags pour organiser vos idées.', color: COLORS[0].value, tags: ['aide'], createdAt: now, updatedAt: now, isPinned: true },
    { id: uid(), title: 'Idées projet Q2', content: 'Lancer la campagne marketing\nRefondre le site web\nNouveau partenariat B2B', color: COLORS[1].value, tags: ['travail', 'projet'], createdAt: now, updatedAt: now, isPinned: false },
    { id: uid(), title: 'Courses', content: 'Pain, lait, oeufs, café, fruits', color: COLORS[3].value, tags: ['perso'], createdAt: now, updatedAt: now, isPinned: false },
  ];
  saveNotes(demo);
  return demo;
}

export default function NotesPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['notes'];
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0].value);
  const [newTag, setNewTag] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    setMounted(true);
    const loaded = loadNotes();
    setNotes(loaded.length > 0 ? loaded : seedNotes());
  }, []);

  const persist = (updated: Note[]) => { setNotes(updated); saveNotes(updated); };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    if (filterTag) result = result.filter(n => n.tags.includes(filterTag));
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [notes, search, filterTag]);

  const createNote = () => {
    if (!newTitle.trim()) return;
    const now = new Date().toISOString();
    const note: Note = { id: uid(), title: newTitle.trim(), content: newContent, color: newColor, tags: newTags, createdAt: now, updatedAt: now, isPinned: false };
    persist([note, ...notes]);
    setShowNew(false); setNewTitle(''); setNewContent(''); setNewColor(COLORS[0].value); setNewTags([]); setNewTag('');
  };

  const deleteNote = (id: string) => persist(notes.filter(n => n.id !== id));
  const togglePin = (id: string) => persist(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n));

  const startEdit = (n: Note) => { setEditingId(n.id); setEditTitle(n.title); setEditContent(n.content); };
  const saveEdit = (id: string) => {
    persist(notes.map(n => n.id === id ? { ...n, title: editTitle, content: editContent, updatedAt: new Date().toISOString() } : n));
    setEditingId(null);
  };

  const addNewTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !newTags.includes(t)) setNewTags([...newTags, t]);
    setNewTag('');
  };

  if (!mounted) return null;

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>{meta.emoji}</span>
        <h1 style={CU.pageTitle}>{meta.title}</h1>
        <PageExplanation pageId="notes" text={meta.helpText} />
      </div>
      <p style={{ ...CU.pageSubtitle, marginBottom: 20 }}>{meta.subtitle}</p>

      {/* Toolbar */}
      <div style={toolbar()}>
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...CU.input, maxWidth: 240 }} />
        {allTags.length > 0 && (
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ ...CU.select, maxWidth: 160 }}>
            <option value="">Tous les tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button onClick={() => setShowNew(!showNew)} style={CU.btnPrimary}>+ Nouvelle note</button>
      </div>

      {/* New note form */}
      {showNew && (
        <div style={{ ...CU.card, padding: isMobile ? 16 : 20, marginBottom: 20 }}>
          <input placeholder="Titre" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ ...CU.input, marginBottom: 10, fontWeight: 600 }} />
          <textarea placeholder="Contenu..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} style={{ ...CU.textarea, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={CU.label}>Couleur :</span>
            {COLORS.map(c => (
              <button key={c.value} onClick={() => setNewColor(c.value)} style={{ width: 28, height: 28, borderRadius: '50%', background: c.value, border: newColor === c.value ? `3px solid ${CU.accent}` : `2px solid ${CU.border}`, cursor: 'pointer' }} title={c.name} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Ajouter un tag..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNewTag()} style={{ ...CU.input, maxWidth: 160 }} />
            <button onClick={addNewTag} style={CU.btnGhost}>+</button>
            {newTags.map(t => (
              <span key={t} style={{ ...CU.badge, gap: 4 }}>
                {t} <span style={{ cursor: 'pointer' }} onClick={() => setNewTags(newTags.filter(x => x !== t))}>x</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createNote} style={CU.btnPrimary}>Enregistrer</button>
            <button onClick={() => setShowNew(false)} style={CU.btnGhost}>Annuler</button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>📝</div>
          <div style={CU.emptyTitle}>Aucune note trouvée</div>
          <div style={CU.emptyDesc}>Créez votre première note !</div>
        </div>
      ) : (
        <div style={cardGrid(isMobile, 2)}>
          {filtered.map(n => (
            <div key={n.id} style={{ background: n.color, borderRadius: 8, padding: isMobile ? 16 : 20, position: 'relative', border: `1px solid ${CU.border}` }}>
              {/* Pin + Delete */}
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => togglePin(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: n.isPinned ? 1 : 0.4 }} title={n.isPinned ? 'Désépingler' : 'Épingler'}>📌</button>
                <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }} title="Supprimer">🗑️</button>
              </div>
              {editingId === n.id ? (
                <div>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ ...CU.input, marginBottom: 8, fontWeight: 600, background: 'rgba(255,255,255,0.6)' }} />
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} style={{ ...CU.textarea, marginBottom: 8, background: 'rgba(255,255,255,0.6)' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveEdit(n.id)} style={{ ...CU.btnPrimary, fontSize: 12, height: 30 }}>Sauvegarder</button>
                    <button onClick={() => setEditingId(null)} style={{ ...CU.btnGhost, fontSize: 12, height: 30 }}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => startEdit(n)} style={{ cursor: 'pointer' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#333', paddingRight: 50 }}>{n.isPinned && '📌 '}{n.title}</h3>
                  <p style={{ margin: '0 0 10px', fontSize: 14, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{n.content.length > 200 ? n.content.slice(0, 200) + '...' : n.content}</p>
                </div>
              )}
              {n.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {n.tags.map(t => (
                    <span key={t} style={{ ...CU.badge, background: 'rgba(0,0,0,0.1)', color: '#444' }}>{t}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>{new Date(n.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
