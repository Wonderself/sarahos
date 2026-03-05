'use client';

import { useState, useEffect, useMemo } from 'react';

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
  date: string; // YYYY-MM-DD
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

const STATUS_COLORS: Record<CalendarStatus, string> = {
  brouillon: 'bg-gray-600 text-gray-200',
  planifie: 'bg-blue-700 text-blue-100',
  publie: 'bg-green-700 text-green-100',
  annule: 'bg-red-800 text-red-200',
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
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday start
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold">Social Media Hub</h1>
      <p className="text-gray-400 text-sm">Generez, planifiez et gerez vos publications sur les reseaux sociaux.</p>

      {/* Platform selector */}
      <div className="flex gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.value}
            onClick={() => setPlatform(p.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
              platform === p.value ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-[10px] font-bold">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        {([
          { value: 'generator' as const, label: 'Generateur' },
          { value: 'saved' as const, label: `Sauvegardes (${savedPosts.length})` },
          { value: 'calendar' as const, label: 'Calendrier' },
        ]).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === t.value ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Generator Tab ──────────────────────────────────────────────────── */}
      {tab === 'generator' && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Generateur de posts</h2>

          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="De quoi parle votre publication ? Decrivez le sujet, le message cle..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tone */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Ton</label>
              <select value={tone} onChange={e => setTone(e.target.value as Tone)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Post type */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <select value={postType} onChange={e => setPostType(e.target.value as PostType)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Langue</label>
              <select value={language} onChange={e => setLanguage(e.target.value as Language)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Objectif</label>
              <select value={goal} onChange={e => setGoal(e.target.value as Goal)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generatePost}
            disabled={generating || !brief.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition"
          >
            {generating ? 'Generation en cours...' : 'Generer le post'}
          </button>

          {genError && <p className="text-red-400 text-sm">{genError}</p>}

          {generatedContent && (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Resultat — {platform} / {postType}</span>
                <div className="flex gap-2">
                  <button onClick={copyContent}
                    className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition">
                    {copied ? 'Copie !' : 'Copier'}
                  </button>
                  <button onClick={savePost}
                    className="text-xs px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white transition">
                    Sauvegarder
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">{generatedContent}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── Saved Posts Tab ────────────────────────────────────────────────── */}
      {tab === 'saved' && (
        <div className="space-y-3">
          {savedPosts.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500">Aucun post sauvegarde. Generez et sauvegardez des posts depuis l&apos;onglet Generateur.</p>
            </div>
          )}
          {savedPosts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-900/50 text-purple-300">{post.platform}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-700 text-gray-300">{post.type}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-700 text-gray-300">{post.tone}</span>
                  <span className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <button onClick={() => deletePost(post.id)} className="text-xs text-red-400 hover:text-red-300">Supprimer</button>
              </div>
              <p className="text-xs text-gray-400">Brief : {post.brief}</p>
              <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-gray-900 rounded p-3 max-h-48 overflow-auto">{post.content}</pre>
              <button
                onClick={() => { navigator.clipboard.writeText(post.content); }}
                className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
              >
                Copier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Calendar Tab ───────────────────────────────────────────────────── */}
      {tab === 'calendar' && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
              else setCalMonth(m => m - 1);
            }} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">&larr;</button>
            <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
              else setCalMonth(m => m + 1);
            }} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">&rarr;</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-20" />;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const posts = getPostsForDate(day);
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setAddingDate(dateStr)}
                  className={`h-20 rounded-lg p-1 cursor-pointer border transition hover:border-purple-500 ${
                    isToday ? 'border-purple-600 bg-gray-750' : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-purple-400' : 'text-gray-400'}`}>{day}</span>
                  <div className="space-y-0.5 mt-0.5 overflow-hidden">
                    {posts.slice(0, 2).map(p => (
                      <div key={p.id} className={`text-[9px] px-1 py-0.5 rounded truncate ${STATUS_COLORS[p.status]}`}>
                        {p.title}
                      </div>
                    ))}
                    {posts.length > 2 && <span className="text-[9px] text-gray-500">+{posts.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add post modal */}
          {addingDate && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAddingDate(null)}>
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold">Ajouter un post — {new Date(addingDate + 'T00:00:00').toLocaleDateString('fr-FR')}</h3>

                {/* Existing posts for this date */}
                {calendarPosts.filter(p => p.date === addingDate).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Posts existants :</p>
                    {calendarPosts.filter(p => p.date === addingDate).map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-900 rounded p-2">
                        <div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                          <span className="text-xs text-gray-300 ml-2">{p.title}</span>
                          {p.time && <span className="text-[10px] text-gray-500 ml-1">{p.time}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <select
                            value={p.status}
                            onChange={e => updateCalendarStatus(p.id, e.target.value as CalendarStatus)}
                            className="text-[10px] bg-gray-800 border border-gray-700 rounded px-1 py-0.5"
                          >
                            <option value="brouillon">brouillon</option>
                            <option value="planifie">planifie</option>
                            <option value="publie">publie</option>
                            <option value="annule">annule</option>
                          </select>
                          <button onClick={() => deleteCalendarPost(p.id)} className="text-red-400 hover:text-red-300 text-xs ml-1">x</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  value={newCalTitle}
                  onChange={e => setNewCalTitle(e.target.value)}
                  placeholder="Titre du post"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <textarea
                  value={newCalContent}
                  onChange={e => setNewCalContent(e.target.value)}
                  placeholder="Contenu (optionnel)"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Heure</label>
                    <input type="time" value={newCalTime} onChange={e => setNewCalTime(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Plateforme</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-sm">
                      {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Statut</label>
                    <select value={newCalStatus} onChange={e => setNewCalStatus(e.target.value as CalendarStatus)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-sm">
                      <option value="brouillon">Brouillon</option>
                      <option value="planifie">Planifie</option>
                      <option value="publie">Publie</option>
                      <option value="annule">Annule</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={() => setAddingDate(null)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition">Fermer</button>
                  <button
                    onClick={addCalendarPost}
                    disabled={!newCalTitle.trim()}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm font-medium transition"
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
