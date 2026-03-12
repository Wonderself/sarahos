'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 };
  const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };

  return (
    <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</h1>
        <PageExplanation pageId="notes" text={meta.helpText} />
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>{meta.subtitle}</p>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 240 }} />
        {allTags.length > 0 && (
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ ...inputStyle, maxWidth: 160 }}>
            <option value="">Tous les tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button onClick={() => setShowNew(!showNew)} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff' }}>+ Nouvelle note</button>
      </div>

      {/* New note form */}
      {showNew && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 20, border: '1px solid var(--border-primary)' }}>
          <input placeholder="Titre" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ ...inputStyle, marginBottom: 10, fontWeight: 600 }} />
          <textarea placeholder="Contenu..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Couleur :</span>
            {COLORS.map(c => (
              <button key={c.value} onClick={() => setNewColor(c.value)} style={{ width: 28, height: 28, borderRadius: '50%', background: c.value, border: newColor === c.value ? '3px solid var(--accent)' : '2px solid var(--border-primary)', cursor: 'pointer' }} title={c.name} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Ajouter un tag..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNewTag()} style={{ ...inputStyle, maxWidth: 160 }} />
            <button onClick={addNewTag} style={{ ...btnStyle, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>+</button>
            {newTags.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontSize: 12 }}>
                {t} <span style={{ cursor: 'pointer' }} onClick={() => setNewTags(newTags.filter(x => x !== t))}>x</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createNote} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff' }}>Enregistrer</button>
            <button onClick={() => setShowNew(false)} style={{ ...btnStyle, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ fontSize: 16 }}>Aucune note trouvée. Créez votre première note !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {filtered.map(n => (
            <div key={n.id} style={{ background: n.color, borderRadius: 12, padding: isMobile ? 16 : 20, position: 'relative', border: '1px solid var(--border-primary)' }}>
              {/* Pin + Delete */}
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => togglePin(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: n.isPinned ? 1 : 0.4 }} title={n.isPinned ? 'Désépingler' : 'Épingler'}>📌</button>
                <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }} title="Supprimer">🗑️</button>
              </div>
              {editingId === n.id ? (
                <div>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ ...inputStyle, marginBottom: 8, fontWeight: 600, background: 'rgba(255,255,255,0.6)' }} />
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} style={{ ...inputStyle, marginBottom: 8, resize: 'vertical', background: 'rgba(255,255,255,0.6)' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveEdit(n.id)} style={{ ...btnStyle, background: '#333', color: '#fff', fontSize: 12 }}>Sauvegarder</button>
                    <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: 'rgba(255,255,255,0.6)', color: '#333', fontSize: 12, border: '1px solid #ccc' }}>Annuler</button>
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
                    <span key={t} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(0,0,0,0.1)', fontSize: 11, color: '#444' }}>{t}</span>
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
