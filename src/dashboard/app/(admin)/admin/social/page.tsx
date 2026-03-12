'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../../lib/use-media-query';

// ── Auth helper ──────────────────────────────────────────────────────────────
function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

// ── Types ────────────────────────────────────────────────────────────────────
type Platform = 'linkedin' | 'instagram' | 'facebook' | 'twitter';
type Tone = 'Professionnel' | 'Decontracte' | 'Inspirant' | 'Educatif' | 'Humoristique';
type PostType = 'texte' | 'carousel' | 'story' | 'thread';
type Language = 'Francais' | 'English' | 'Bilingue';
type Goal = 'Visibilite' | 'Engagement' | 'Conversion' | 'Education';
type CalendarStatus = 'brouillon' | 'planifie' | 'publie' | 'annule';

interface SavedPost {
  id: string;
  platform: Platform;
  type: PostType;
  content: string;
  brief: string;
  tone: Tone;
  goal: Goal;
  language: Language;
  createdAt: string;
}

interface CalendarPost {
  id: string;
  date: string;
  platform: Platform;
  title: string;
  content: string;
  status: CalendarStatus;
  time?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { value: 'instagram', label: 'Instagram', icon: 'IG' },
  { value: 'facebook', label: 'Facebook', icon: 'fb' },
  { value: 'twitter', label: 'X / Twitter', icon: 'X' },
];

const TONES: Tone[] = ['Professionnel', 'Decontracte', 'Inspirant', 'Educatif', 'Humoristique'];
const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'texte', label: 'Texte' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'story', label: 'Story' },
  { value: 'thread', label: 'Thread' },
];
const LANGUAGES: Language[] = ['Francais', 'English', 'Bilingue'];
const GOALS: Goal[] = ['Visibilite', 'Engagement', 'Conversion', 'Education'];

const STATUS_BG: Record<CalendarStatus, string> = {
  brouillon: '#9B9B9B',
  planifie: '#6B6B6B',
  publie: '#1A1A1A',
  annule: '#DC2626',
};
const STATUS_COLOR: Record<CalendarStatus, string> = {
  brouillon: '#FFFFFF',
  planifie: '#FFFFFF',
  publie: '#FFFFFF',
  annule: '#FFFFFF',
};

const SAVED_KEY = 'fz_admin_saved_posts';
const CALENDAR_KEY = 'fz_admin_calendar_posts';

function loadJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

function saveJSON(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminSocialPage() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'generator' | 'saved' | 'calendar'>('generator');
  const [platform, setPlatform] = useState<Platform>('linkedin');

  // Generator state
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState<Tone>('Professionnel');
  const [postType, setPostType] = useState<PostType>('texte');
  const [language, setLanguage] = useState<Language>('Francais');
  const [goal, setGoal] = useState<Goal>('Visibilite');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [genError, setGenError] = useState('');
  const [copied, setCopied] = useState(false);

  // Saved posts
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  // Calendar
  const [calendarPosts, setCalendarPosts] = useState<CalendarPost[]>([]);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalContent, setNewCalContent] = useState('');
  const [newCalTime, setNewCalTime] = useState('09:00');
  const [newCalStatus, setNewCalStatus] = useState<CalendarStatus>('brouillon');

  useEffect(() => {
    setSavedPosts(loadJSON<SavedPost[]>(SAVED_KEY, []));
    setCalendarPosts(loadJSON<CalendarPost[]>(CALENDAR_KEY, []));
  }, []);

  const pad = isMobile ? 16 : 24;
  const cardStyle = { background: '#FFFFFF', borderRadius: 8, padding: pad, border: '1px solid rgba(0,0,0,0.08)' };
  const btnBase = { border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 500 as const, fontSize: 14, minHeight: 44 };
  const inputStyle = {
    width: '100%', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#1A1A1A', outline: 'none', resize: 'none' as const,
  };
  const selectStyle = { ...inputStyle, padding: 8 };

  // ── Generate post ────────────────────────────────────────────────────────
  const generatePost = async () => {
    if (!brief.trim()) return;
    setGenerating(true);
    setGenError('');
    setGeneratedContent('');
    try {
      const prompt = `Generate a ${platform} ${postType} post about: ${brief}. Tone: ${tone}. Goal: ${goal}. Language: ${language}. Format ready to copy-paste.`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: getToken(),
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 2048,
          agentName: 'fz-communication',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      const text = data.content?.[0]?.text ?? data.text ?? data.response ?? '';
      setGeneratedContent(text);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Erreur generation');
    } finally {
      setGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePost = () => {
    if (!generatedContent) return;
    const post: SavedPost = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      platform, type: postType, content: generatedContent,
      brief, tone, goal, language,
      createdAt: new Date().toISOString(),
    };
    const next = [post, ...savedPosts];
    setSavedPosts(next);
    saveJSON(SAVED_KEY, next);
  };

  const deletePost = (id: string) => {
    const next = savedPosts.filter(p => p.id !== id);
    setSavedPosts(next);
    saveJSON(SAVED_KEY, next);
  };

  // ── Calendar helpers ─────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  const monthLabel = new Date(calYear, calMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const getPostsForDate = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarPosts.filter(p => p.date === dateStr);
  };

  const addCalendarPost = () => {
    if (!addingDate || !newCalTitle.trim()) return;
    const post: CalendarPost = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: addingDate,
      platform,
      title: newCalTitle,
      content: newCalContent,
      status: newCalStatus,
      time: newCalTime,
    };
    const next = [...calendarPosts, post];
    setCalendarPosts(next);
    saveJSON(CALENDAR_KEY, next);
    setAddingDate(null);
    setNewCalTitle('');
    setNewCalContent('');
    setNewCalTime('09:00');
    setNewCalStatus('brouillon');
  };

  const deleteCalendarPost = (id: string) => {
    const next = calendarPosts.filter(p => p.id !== id);
    setCalendarPosts(next);
    saveJSON(CALENDAR_KEY, next);
  };

  const updateCalendarStatus = (id: string, status: CalendarStatus) => {
    const next = calendarPosts.map(p => p.id === id ? { ...p, status } : p);
    setCalendarPosts(next);
    saveJSON(CALENDAR_KEY, next);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A1A', padding: pad }} className="admin-page-scrollable">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Social Media Hub</h1>
      <p style={{ color: '#9B9B9B', fontSize: 14, marginBottom: 24 }}>Generez, planifiez et gerez vos publications sur les reseaux sociaux.</p>

      {/* Platform selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {PLATFORMS.map(p => (
          <button
            key={p.value}
            onClick={() => setPlatform(p.value)}
            style={{
              ...btnBase, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14,
              background: platform === p.value ? '#1A1A1A' : '#F7F7F7',
              color: platform === p.value ? '#fff' : '#9B9B9B',
            }}
          >
            <span style={{
              width: 24, height: 24, borderRadius: 4, background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
            }}>{p.icon}</span>
            {!isMobile && p.label}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F7F7F7', borderRadius: 8, padding: 4, marginBottom: 24, width: 'fit-content', maxWidth: '100%', flexWrap: 'wrap' }}>
        {([
          { value: 'generator' as const, label: 'Generateur' },
          { value: 'saved' as const, label: `Sauv. (${savedPosts.length})` },
          { value: 'calendar' as const, label: 'Calendrier' },
        ]).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              ...btnBase, padding: '6px 16px', fontSize: 14,
              background: tab === t.value ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === t.value ? '#1A1A1A' : '#9B9B9B',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Generator Tab ──────────────────────────────────────────────────── */}
      {tab === 'generator' && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Generateur de posts</h2>

          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="De quoi parle votre publication ? Decrivez le sujet, le message cle..."
            rows={3}
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 16, marginBottom: 16,
          }}>
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Ton</label>
              <select value={tone} onChange={e => setTone(e.target.value as Tone)} style={selectStyle}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Type</label>
              <select value={postType} onChange={e => setPostType(e.target.value as PostType)} style={selectStyle}>
                {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Langue</label>
              <select value={language} onChange={e => setLanguage(e.target.value as Language)} style={selectStyle}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Objectif</label>
              <select value={goal} onChange={e => setGoal(e.target.value as Goal)} style={selectStyle}>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generatePost}
            disabled={generating || !brief.trim()}
            style={{
              ...btnBase, padding: '10px 24px',
              background: (generating || !brief.trim()) ? 'rgba(0,0,0,0.04)' : '#1A1A1A',
              color: (generating || !brief.trim()) ? '#9B9B9B' : '#fff',
            }}
          >
            {generating ? 'Generation en cours...' : 'Generer le post'}
          </button>

          {genError && <p style={{ color: '#DC2626', fontSize: 14, marginTop: 12 }}>{genError}</p>}

          {generatedContent && (
            <div style={{ background: '#F7F7F7', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', padding: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9B9B9B' }}>Resultat — {platform} / {postType}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copyContent}
                    style={{ ...btnBase, padding: '6px 12px', fontSize: 12, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>
                    {copied ? 'Copie !' : 'Copier'}
                  </button>
                  <button onClick={savePost}
                    style={{ ...btnBase, padding: '6px 12px', fontSize: 12, background: '#1A1A1A', color: '#fff' }}>
                    Sauvegarder
                  </button>
                </div>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#1A1A1A', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{generatedContent}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── Saved Posts Tab ────────────────────────────────────────────────── */}
      {tab === 'saved' && (
        <div>
          {savedPosts.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 32 }}>
              <p style={{ color: '#9B9B9B' }}>Aucun post sauvegarde. Generez et sauvegardez des posts depuis l&apos;onglet Generateur.</p>
            </div>
          )}
          {savedPosts.map(post => (
            <div key={post.id} style={{ ...cardStyle, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>{post.platform}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>{post.type}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>{post.tone}</span>
                  <span style={{ fontSize: 10, color: '#9B9B9B' }}>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <button onClick={() => deletePost(post.id)} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 12px' }}>Supprimer</button>
              </div>
              <p style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 8 }}>Brief : {post.brief}</p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#1A1A1A', background: '#F7F7F7', borderRadius: 8, padding: 12, maxHeight: 192, overflow: 'auto', margin: 0, wordBreak: 'break-word' }}>{post.content}</pre>
              <button
                onClick={() => { navigator.clipboard.writeText(post.content); }}
                style={{ ...btnBase, padding: '6px 12px', fontSize: 12, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A', marginTop: 8 }}
              >
                Copier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Calendar Tab ───────────────────────────────────────────────────── */}
      {tab === 'calendar' && (
        <div style={cardStyle}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
              else setCalMonth(m => m - 1);
            }} style={{ ...btnBase, padding: '6px 12px', fontSize: 14, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>&larr;</button>
            <h2 style={{ fontSize: 18, fontWeight: 600, textTransform: 'capitalize' }}>{monthLabel}</h2>
            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
              else setCalMonth(m => m + 1);
            }} style={{ ...btnBase, padding: '6px 12px', fontSize: 14, background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>&rarr;</button>
          </div>

          {/* Calendar - scrollable on mobile */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: isMobile ? 560 : 'auto' }}>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 12, color: '#9B9B9B', padding: 4 }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} style={{ height: 80 }} />;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const posts = getPostsForDate(day);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => setAddingDate(dateStr)}
                      style={{
                        height: 80, borderRadius: 8, padding: 4, cursor: 'pointer',
                        border: isToday ? '1px solid #1A1A1A' : '1px solid rgba(0,0,0,0.08)',
                        background: isToday ? '#F7F7F7' : '#FFFFFF',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: isToday ? '#1A1A1A' : '#9B9B9B' }}>{day}</span>
                      <div style={{ marginTop: 2, overflow: 'hidden' }}>
                        {posts.slice(0, 2).map(p => (
                          <div key={p.id} style={{
                            fontSize: 9, padding: '1px 4px', borderRadius: 3, marginBottom: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            background: STATUS_BG[p.status], color: STATUS_COLOR[p.status],
                          }}>
                            {p.title}
                          </div>
                        ))}
                        {posts.length > 2 && <span style={{ fontSize: 9, color: '#9B9B9B' }}>+{posts.length - 2}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add post modal */}
          {addingDate && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: isMobile ? 16 : 0 }}
              onClick={() => setAddingDate(null)}
            >
              <div
                style={{ background: '#FFFFFF', borderRadius: 8, padding: pad, width: '100%', maxWidth: 448, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.08)' }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Ajouter un post — {new Date(addingDate + 'T00:00:00').toLocaleDateString('fr-FR')}</h3>

                {/* Existing posts for this date */}
                {calendarPosts.filter(p => p.date === addingDate).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 8 }}>Posts existants :</p>
                    {calendarPosts.filter(p => p.date === addingDate).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F7F7', borderRadius: 4, padding: 8, marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                        <div>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: STATUS_BG[p.status], color: STATUS_COLOR[p.status] }}>{p.status}</span>
                          <span style={{ fontSize: 12, color: '#1A1A1A', marginLeft: 8 }}>{p.title}</span>
                          {p.time && <span style={{ fontSize: 10, color: '#9B9B9B', marginLeft: 4 }}>{p.time}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <select
                            value={p.status}
                            onChange={e => updateCalendarStatus(p.id, e.target.value as CalendarStatus)}
                            style={{ fontSize: 10, background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '2px 4px', color: '#1A1A1A' }}
                          >
                            <option value="brouillon">brouillon</option>
                            <option value="planifie">planifie</option>
                            <option value="publie">publie</option>
                            <option value="annule">annule</option>
                          </select>
                          <button onClick={() => deleteCalendarPost(p.id)} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginLeft: 4, minWidth: 32, minHeight: 32 }}>x</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  value={newCalTitle}
                  onChange={e => setNewCalTitle(e.target.value)}
                  placeholder="Titre du post"
                  style={{ ...inputStyle, marginBottom: 12 }}
                />
                <textarea
                  value={newCalContent}
                  onChange={e => setNewCalContent(e.target.value)}
                  placeholder="Contenu (optionnel)"
                  rows={3}
                  style={{ ...inputStyle, marginBottom: 12 }}
                />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: 12, marginBottom: 16,
                }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Heure</label>
                    <input type="time" value={newCalTime} onChange={e => setNewCalTime(e.target.value)}
                      style={{ ...inputStyle, padding: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Plateforme</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
                      style={{ ...selectStyle }}>
                      {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 4, display: 'block' }}>Statut</label>
                    <select value={newCalStatus} onChange={e => setNewCalStatus(e.target.value as CalendarStatus)}
                      style={{ ...selectStyle }}>
                      <option value="brouillon">Brouillon</option>
                      <option value="planifie">Planifie</option>
                      <option value="publie">Publie</option>
                      <option value="annule">Annule</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddingDate(null)}
                    style={{ ...btnBase, padding: '8px 16px', background: 'rgba(0,0,0,0.04)', color: '#1A1A1A' }}>Fermer</button>
                  <button
                    onClick={addCalendarPost}
                    disabled={!newCalTitle.trim()}
                    style={{
                      ...btnBase, padding: '8px 16px',
                      background: !newCalTitle.trim() ? 'rgba(0,0,0,0.04)' : '#1A1A1A',
                      color: !newCalTitle.trim() ? '#9B9B9B' : '#fff',
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
