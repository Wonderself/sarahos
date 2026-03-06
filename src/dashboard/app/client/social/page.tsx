'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '../../../lib/use-user-data';

// ─── Types ───────────────────────────────────────────────
interface SavedPost {
  id: string;
  platform: string;
  type: string;
  content: string;
  brief: string;
  tone: string;
  goal: string;
  language: string;
  createdAt: string;
}

interface CalendarPost {
  id: string;
  date: string; // YYYY-MM-DD
  platform: string;
  title: string;
  content: string;
  status: 'brouillon' | 'planifie' | 'publie' | 'annule';
  time?: string;
}

interface PlatformKeys {
  linkedin?: { apiKey: string; connected: boolean };
  facebook?: { accessToken: string; pageId: string; connected: boolean };
  twitter?: { apiKey: string; apiSecret: string; bearerToken: string; connected: boolean };
  tiktok?: { connected: boolean };
}

// ─── Constants ───────────────────────────────────────────
const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', emoji: '\uD83D\uDCBC', color: '#0077b5' },
  { id: 'instagram', label: 'Instagram', emoji: '\uD83D\uDCF7', color: '#E4405F' },
  { id: 'facebook', label: 'Facebook', emoji: '\uD83D\uDC4D', color: '#1877f2' },
  { id: 'twitter', label: 'Twitter/X', emoji: '\uD83D\uDC26', color: '#1da1f2' },
] as const;

const POST_TYPES = [
  { id: 'texte', label: 'Post texte' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'story', label: 'Story' },
  { id: 'thread', label: 'Thread' },
] as const;

const TONES = ['Professionnel', 'Décontracté', 'Humoristique', 'Inspirant'] as const;
const GOALS = ['Informer', 'Vendre', 'Engager', 'Eduquer'] as const;
const LANGUAGES = ['Français', 'Anglais', 'Espagnol'] as const;
const LENGTHS = ['Courte', 'Moyenne', 'Longue'] as const;

const TABS = [
  { id: 'generator', label: 'Générateur de posts', emoji: '\u270D\uFE0F' },
  { id: 'calendar', label: 'Calendrier éditorial', emoji: '\uD83D\uDCC5' },
  { id: 'connect', label: 'Connexion directe', emoji: '\uD83D\uDD17' },
  { id: 'analytics', label: 'Analytics', emoji: '\uD83D\uDCCA' },
] as const;

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

type TabId = typeof TABS[number]['id'];

// ─── Helpers ─────────────────────────────────────────────
function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

function loadPosts(): SavedPost[] {
  try { return JSON.parse(localStorage.getItem('fz_social_posts') ?? '[]'); } catch { return []; }
}

function savePosts(posts: SavedPost[]) {
  localStorage.setItem('fz_social_posts', JSON.stringify(posts));
}

function loadCalendar(): CalendarPost[] {
  try { return JSON.parse(localStorage.getItem('fz_social_calendar') ?? '[]'); } catch { return []; }
}

function saveCalendar(posts: CalendarPost[]) {
  localStorage.setItem('fz_social_calendar', JSON.stringify(posts));
}

function loadKeys(): PlatformKeys {
  try { return JSON.parse(localStorage.getItem('fz_social_keys') ?? '{}'); } catch { return {}; }
}

function saveKeys(keys: PlatformKeys) {
  localStorage.setItem('fz_social_keys', JSON.stringify(keys));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + (offset * 7));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMonthDates(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday-based
  const totalDays = lastDay.getDate();
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) currentWeek.push(null);
  for (let d = 1; d <= totalDays; d++) {
    currentWeek.push(new Date(year, month, d));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

function dateToKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function platformColor(platformId: string): string {
  return PLATFORMS.find(p => p.id === platformId)?.color ?? '#5b6cf7';
}

function platformEmoji(platformId: string): string {
  return PLATFORMS.find(p => p.id === platformId)?.emoji ?? '\uD83D\uDCF1';
}

// ─── Main Component ──────────────────────────────────────
export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('generator');

  // Generator state
  const [platform, setPlatform] = useState('linkedin');
  const [postType, setPostType] = useState('texte');
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState<string>('Professionnel');
  const [goal, setGoal] = useState<string>('Informer');
  const [hashtagMode, setHashtagMode] = useState<'auto' | 'manual'>('auto');
  const [manualHashtags, setManualHashtags] = useState('');
  const [language, setLanguage] = useState<string>('Français');
  const [length, setLength] = useState<string>('Moyenne');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: savedPosts, setData: setSavedPosts } = useUserData<SavedPost[]>('social_posts', [], 'fz_social_posts');
  const [copySuccess, setCopySuccess] = useState(false);

  // Calendar state
  const { data: calendarPosts, setData: setCalendarPosts } = useUserData<CalendarPost[]>('social_calendar', [], 'fz_social_calendar');
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [showAddPost, setShowAddPost] = useState<string | null>(null); // date key
  const [newCalPost, setNewCalPost] = useState({ platform: 'linkedin', title: '', content: '', time: '09:00' });
  const [editingCalPost, setEditingCalPost] = useState<CalendarPost | null>(null);

  // Connect state
  const [platformKeys, setPlatformKeys] = useState<PlatformKeys>({});
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  // Posts + calendar loaded by useUserData hooks; keys stay in localStorage
  useEffect(() => {
    setPlatformKeys(loadKeys());
  }, []);

  // ─── TAB 1: Post Generator ────────────────────────────
  async function handleGenerate() {
    if (!brief.trim()) return;
    const session = getSession();
    if (!session.token) {
      alert('Veuillez vous connecter pour generer du contenu.');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    const hashtagInstruction = hashtagMode === 'auto'
      ? 'Ajoute des hashtags pertinents automatiquement.'
      : `Utilise ces hashtags: ${manualHashtags}`;

    const systemPrompt = `Tu es un expert en social media marketing. Genere un post optimise pour ${platform} au format ${postType}. Ton: ${tone}. Objectif: ${goal}. Le post doit etre en ${language}. Longueur souhaitee: ${length}. ${hashtagInstruction}. Inclus des emojis pertinents et des hashtags.`;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [
            { role: 'user', content: `${systemPrompt}\n\nSujet/Brief: ${brief}` }
          ],
          maxTokens: 2048,
          temperature: 0.8,
          agentName: 'fz-community',
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        setGeneratedContent(`Erreur: ${err}`);
        setIsGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setGeneratedContent('Erreur: pas de stream disponible');
        setIsGenerating(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                accumulated += parsed.delta.text;
                setGeneratedContent(accumulated);
              } else if (parsed.text) {
                accumulated += parsed.text;
                setGeneratedContent(accumulated);
              } else if (parsed.content) {
                accumulated = parsed.content;
                setGeneratedContent(accumulated);
              }
            } catch {
              // Non-JSON SSE data, append as text
              if (data && data !== '[DONE]') {
                accumulated += data;
                setGeneratedContent(accumulated);
              }
            }
          }
        }
      }

      if (!accumulated) {
        setGeneratedContent('Aucun contenu généré. Vérifiez vos crédits.');
      }
    } catch (err) {
      setGeneratedContent(`Erreur de connexion: ${err instanceof Error ? err.message : 'inconnue'}`);
    }

    setIsGenerating(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  function handleSavePost() {
    if (!generatedContent) return;
    const post: SavedPost = {
      id: generateId(),
      platform,
      type: postType,
      content: generatedContent,
      brief,
      tone,
      goal,
      language,
      createdAt: new Date().toISOString(),
    };
    const updated = [post, ...savedPosts].slice(0, 10);
    setSavedPosts(updated);
    // savePosts removed — useUserData handles persistence
  }

  function handleDeletePost(id: string) {
    const updated = savedPosts.filter(p => p.id !== id);
    setSavedPosts(updated);
    // savePosts removed — useUserData handles persistence
  }

  function handleRegenerate() {
    handleGenerate();
  }

  // ─── TAB 2: Calendar ──────────────────────────────────
  function addCalendarPost(dateKey: string) {
    if (!newCalPost.title.trim()) return;
    const post: CalendarPost = {
      id: generateId(),
      date: dateKey,
      platform: newCalPost.platform,
      title: newCalPost.title,
      content: newCalPost.content,
      status: 'brouillon',
      time: newCalPost.time,
    };
    const updated = [...calendarPosts, post];
    setCalendarPosts(updated);
    // saveCalendar removed — useUserData handles persistence
    setShowAddPost(null);
    setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' });
  }

  function updateCalendarPostStatus(id: string, status: CalendarPost['status']) {
    const updated = calendarPosts.map(p => p.id === id ? { ...p, status } : p);
    setCalendarPosts(updated);
    // saveCalendar removed — useUserData handles persistence
  }

  function deleteCalendarPost(id: string) {
    const updated = calendarPosts.filter(p => p.id !== id);
    setCalendarPosts(updated);
    // saveCalendar removed — useUserData handles persistence
    setEditingCalPost(null);
  }

  function getPostsForDate(dateKey: string): CalendarPost[] {
    return calendarPosts.filter(p => p.date === dateKey);
  }

  const statusColors: Record<string, string> = {
    brouillon: '#9ca3af',
    planifie: '#3b82f6',
    publie: '#16a34a',
    annule: '#ef4444',
  };

  const statusLabels: Record<string, string> = {
    brouillon: 'Brouillon',
    planifie: 'Planifie',
    publie: 'Publie',
    annule: 'Annule',
  };

  // ─── TAB 3: Connection test ───────────────────────────
  function handleTestConnection(platformId: string) {
    setTestingPlatform(platformId);
    // Simulate connection test
    setTimeout(() => {
      const keys = { ...platformKeys };
      if (platformId === 'linkedin' && keys.linkedin?.apiKey) {
        keys.linkedin = { ...keys.linkedin, connected: true };
      } else if (platformId === 'facebook' && keys.facebook?.accessToken && keys.facebook?.pageId) {
        keys.facebook = { ...keys.facebook, connected: true };
      } else if (platformId === 'twitter' && keys.twitter?.bearerToken) {
        keys.twitter = { ...keys.twitter, connected: true };
      } else {
        // Mark as disconnected if keys are missing
        if (platformId === 'linkedin') keys.linkedin = { apiKey: keys.linkedin?.apiKey ?? '', connected: false };
        if (platformId === 'facebook') keys.facebook = { accessToken: keys.facebook?.accessToken ?? '', pageId: keys.facebook?.pageId ?? '', connected: false };
        if (platformId === 'twitter') keys.twitter = { apiKey: keys.twitter?.apiKey ?? '', apiSecret: keys.twitter?.apiSecret ?? '', bearerToken: keys.twitter?.bearerToken ?? '', connected: false };
      }
      setPlatformKeys(keys);
      saveKeys(keys);
      setTestingPlatform(null);
    }, 1500);
  }

  // ─── TAB 4: Analytics ─────────────────────────────────
  function getAnalytics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthPosts = savedPosts.filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalChars = monthPosts.reduce((sum, p) => sum + p.content.length, 0);

    const byPlatform: Record<string, number> = {};
    for (const p of savedPosts) {
      byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + 1;
    }

    const calByPlatform: Record<string, number> = {};
    for (const p of calendarPosts) {
      calByPlatform[p.platform] = (calByPlatform[p.platform] ?? 0) + 1;
    }

    return { monthPosts: monthPosts.length, totalChars, byPlatform, calByPlatform, totalPosts: savedPosts.length, totalCalendar: calendarPosts.length };
  }

  // ─── Platform preview style ───────────────────────────
  function renderPlatformPreview(content: string, platformId: string) {
    const pColor = platformColor(platformId);
    const pEmoji = platformEmoji(platformId);
    const pLabel = PLATFORMS.find(p => p.id === platformId)?.label ?? platformId;

    return (
      <div style={{
        border: `1px solid ${pColor}33`,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
      }}>
        {/* Platform header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${pColor}22`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: `${pColor}08`,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `${pColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {pEmoji}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Votre Entreprise</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {pLabel} {'\u00B7'} Apercu du post
            </div>
          </div>
        </div>
        {/* Content */}
        <div style={{
          padding: '16px',
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          color: 'var(--text-primary)',
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {content}
        </div>
        {/* Platform footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: `1px solid ${pColor}15`,
          display: 'flex',
          gap: 20,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          {platformId === 'linkedin' && (
            <>{'\uD83D\uDC4D'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDD01'} Republier</>
          )}
          {platformId === 'instagram' && (
            <>{'\u2764\uFE0F'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDCE9'} Envoyer</>
          )}
          {platformId === 'facebook' && (
            <>{'\uD83D\uDC4D'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\u21A9\uFE0F'} Partager</>
          )}
          {platformId === 'twitter' && (
            <>{'\u2764\uFE0F'} Liker &nbsp; {'\uD83D\uDD01'} Retweeter &nbsp; {'\uD83D\uDCAC'} Repondre</>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────
  const analytics = getAnalytics();

  return (
    <div className="client-page-scrollable">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Reseaux sociaux
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
          Generez, planifiez et publiez du contenu pour vos reseaux
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 24,
        overflowX: 'auto',
        padding: '4px 0',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: activeTab === tab.id ? '1px solid #5b6cf7' : '1px solid var(--border-secondary)',
              background: activeTab === tab.id ? '#5b6cf7' : 'var(--bg-elevated)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB 1: Generateur de posts
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'generator' && (
        <div>
          {/* Platform Selector */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
              Plateforme
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: platform === p.id ? `2px solid ${p.color}` : '1px solid var(--border-secondary)',
                    background: platform === p.id ? `${p.color}12` : 'var(--bg-secondary)',
                    color: platform === p.id ? p.color : 'var(--text-secondary)',
                    fontSize: 14,
                    fontWeight: platform === p.id ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Post Type */}
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 20, color: 'var(--text-primary)' }}>
              Type de contenu
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POST_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setPostType(t.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: postType === t.id ? '2px solid #5b6cf7' : '1px solid var(--border-secondary)',
                    background: postType === t.id ? 'var(--accent-muted)' : 'var(--bg-secondary)',
                    color: postType === t.id ? '#5b6cf7' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: postType === t.id ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Brief */}
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 20, color: 'var(--text-primary)' }}>
              Sujet / Brief
            </div>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="Decrivez le sujet de votre post..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#5b6cf7'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-secondary)'; }}
            />

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
                padding: '6px 0',
                background: 'none',
                border: 'none',
                color: '#5b6cf7',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{
                display: 'inline-block',
                transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                {'\u25B6'}
              </span>
              Options avancees
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: 12,
                padding: 16,
                borderRadius: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
              }}>
                {/* Tone */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Ton</div>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Objectif</div>
                  <select
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Langue</div>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Length */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Longueur</div>
                  <select
                    value={length}
                    onChange={e => setLength(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Hashtags */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Hashtags</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button
                      onClick={() => setHashtagMode('auto')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: hashtagMode === 'auto' ? '1px solid #5b6cf7' : '1px solid var(--border-secondary)',
                        background: hashtagMode === 'auto' ? 'var(--accent-muted)' : 'transparent',
                        color: hashtagMode === 'auto' ? '#5b6cf7' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Automatique
                    </button>
                    <button
                      onClick={() => setHashtagMode('manual')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: hashtagMode === 'manual' ? '1px solid #5b6cf7' : '1px solid var(--border-secondary)',
                        background: hashtagMode === 'manual' ? 'var(--accent-muted)' : 'transparent',
                        color: hashtagMode === 'manual' ? '#5b6cf7' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Manuel
                    </button>
                  </div>
                  {hashtagMode === 'manual' && (
                    <input
                      type="text"
                      value={manualHashtags}
                      onChange={e => setManualHashtags(e.target.value)}
                      placeholder="#marketing #ia #business"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                        outline: 'none',
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !brief.trim()}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                border: 'none',
                background: isGenerating
                  ? 'var(--bg-tertiary)'
                  : 'linear-gradient(135deg, #5b6cf7, #8b7cf8)',
                color: isGenerating ? 'var(--text-muted)' : '#ffffff',
                fontSize: 15,
                fontWeight: 700,
                cursor: isGenerating ? 'default' : 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: 16, height: 16,
                    border: '2px solid var(--text-muted)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Generation en cours...
                </>
              ) : (
                <>Generer avec Freenzy</>
              )}
            </button>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                Resultat
              </div>

              {renderPlatformPreview(generatedContent, platform)}

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 18px', borderRadius: 10,
                    border: '1px solid var(--border-secondary)',
                    background: copySuccess ? '#16a34a15' : 'var(--bg-secondary)',
                    color: copySuccess ? '#16a34a' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                  }}
                >
                  {copySuccess ? '\u2713 Copie !' : 'Copier'}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  style={{
                    padding: '8px 18px', borderRadius: 10,
                    border: '1px solid var(--border-secondary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                    opacity: isGenerating ? 0.5 : 1,
                  }}
                >
                  Regenerer
                </button>
                <button
                  onClick={handleSavePost}
                  style={{
                    padding: '8px 18px', borderRadius: 10,
                    border: '1px solid #5b6cf7',
                    background: 'var(--accent-muted)',
                    color: '#5b6cf7',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                  }}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* Saved Posts History */}
          {savedPosts.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                Historique ({savedPosts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedPosts.map(post => (
                  <div key={post.id} style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6,
                          background: `${platformColor(post.platform)}15`,
                          color: platformColor(post.platform),
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {platformEmoji(post.platform)} {post.platform}
                        </span>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6,
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                          fontSize: 11, fontWeight: 600,
                        }}>
                          {post.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(post.createdAt)}</span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 14, padding: '0 4px',
                          }}
                          title="Supprimer"
                        >
                          {'\u2715'}
                        </button>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 13, color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {post.content}
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedContent(post.content);
                        setPlatform(post.platform);
                        setPostType(post.type);
                        setBrief(post.brief);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        marginTop: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#5b6cf7', fontSize: 12, fontWeight: 600,
                        padding: 0, fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Reutiliser ce post
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 2: Calendrier editorial
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'calendar' && (
        <div>
          {/* View toggle + navigation */}
          <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setCalendarView('week')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: calendarView === 'week' ? '1px solid #5b6cf7' : '1px solid var(--border-secondary)',
                    background: calendarView === 'week' ? 'var(--accent-muted)' : 'transparent',
                    color: calendarView === 'week' ? '#5b6cf7' : 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setCalendarView('month')}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: calendarView === 'month' ? '1px solid #5b6cf7' : '1px solid var(--border-secondary)',
                    background: calendarView === 'month' ? 'var(--accent-muted)' : 'transparent',
                    color: calendarView === 'month' ? '#5b6cf7' : 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  Mois
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => {
                    if (calendarView === 'week') setWeekOffset(w => w - 1);
                    else setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)',
                  }}
                >
                  {'\u2190'}
                </button>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minWidth: 140, textAlign: 'center' }}>
                  {calendarView === 'week'
                    ? (() => {
                        const dates = getWeekDates(weekOffset);
                        return `${dates[0].getDate()} - ${dates[6].getDate()} ${MONTHS_FR[dates[6].getMonth()]}`;
                      })()
                    : `${MONTHS_FR[monthDate.getMonth()]} ${monthDate.getFullYear()}`
                  }
                </span>
                <button
                  onClick={() => {
                    if (calendarView === 'week') setWeekOffset(w => w + 1);
                    else setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)',
                  }}
                >
                  {'\u2192'}
                </button>
                {calendarView === 'week' && weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: '1px solid var(--border-secondary)', background: 'transparent',
                      color: '#5b6cf7', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Aujourd&apos;hui
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Week view */}
          {calendarView === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {getWeekDates(weekOffset).map((date, i) => {
                const key = dateToKey(date);
                const dayPosts = getPostsForDate(key);
                const isToday = dateToKey(new Date()) === key;
                return (
                  <div key={key} style={{
                    borderRadius: 12,
                    border: isToday ? '2px solid #5b6cf7' : '1px solid var(--border-primary)',
                    background: 'var(--bg-elevated)',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}>
                    {/* Day header */}
                    <div style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--border-primary)',
                      background: isToday ? '#5b6cf708' : 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: isToday ? '#5b6cf7' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}>
                          {DAYS_FR[i]}
                        </span>
                        <span style={{
                          marginLeft: 6, fontSize: 14, fontWeight: 700,
                          color: isToday ? '#5b6cf7' : 'var(--text-primary)',
                        }}>
                          {date.getDate()}
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowAddPost(key); setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' }); }}
                        style={{
                          width: 22, height: 22, borderRadius: 6,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--border-secondary)',
                          background: 'transparent', cursor: 'pointer',
                          color: 'var(--text-muted)', fontSize: 14,
                        }}
                        title="Ajouter un post"
                      >
                        +
                      </button>
                    </div>

                    {/* Posts for day */}
                    <div style={{ flex: 1, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dayPosts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setEditingCalPost(p)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: `${platformColor(p.platform)}10`,
                            borderLeft: `3px solid ${statusColors[p.status]}`,
                            cursor: 'pointer',
                            fontSize: 11,
                            lineHeight: 1.4,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 10 }}>{platformEmoji(p.platform)}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </span>
                          </div>
                          {p.time && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.time}</div>
                          )}
                        </div>
                      ))}
                      {dayPosts.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Aucun post</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Month view */}
          {calendarView === 'month' && (
            <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
              {/* Days header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase',
                  }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Weeks */}
              {getMonthDates(monthDate.getFullYear(), monthDate.getMonth()).map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                  {week.map((date, di) => {
                    if (!date) return <div key={di} style={{ minHeight: 60, borderRadius: 8, background: 'var(--bg-secondary)' }} />;
                    const key = dateToKey(date);
                    const dayPosts = getPostsForDate(key);
                    const isToday = dateToKey(new Date()) === key;
                    return (
                      <div key={di} style={{
                        minHeight: 60,
                        borderRadius: 8,
                        border: isToday ? '1px solid #5b6cf7' : '1px solid var(--border-primary)',
                        background: 'var(--bg-elevated)',
                        padding: 4,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onClick={() => { setShowAddPost(key); setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' }); }}
                      >
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: isToday ? '#5b6cf7' : 'var(--text-primary)',
                          marginBottom: 4,
                        }}>
                          {date.getDate()}
                        </div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {dayPosts.map(p => (
                            <div
                              key={p.id}
                              title={`${p.title} (${statusLabels[p.status]})`}
                              style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: platformColor(p.platform),
                                border: `1px solid ${statusColors[p.status]}`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    {p.label}
                  </div>
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>|</span>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <div style={{ width: 10, height: 4, borderRadius: 2, background: statusColors[key] }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Post Modal */}
          {showAddPost && (
            <>
              <div
                onClick={() => setShowAddPost(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
              />
              <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 480, zIndex: 1000,
                background: 'var(--bg-elevated)', borderRadius: 16,
                border: '1px solid var(--border-secondary)', boxShadow: 'var(--shadow-lg)',
                padding: 24,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Ajouter un post - {showAddPost}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Plateforme</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setNewCalPost({ ...newCalPost, platform: p.id })}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: newCalPost.platform === p.id ? `1px solid ${p.color}` : '1px solid var(--border-secondary)',
                          background: newCalPost.platform === p.id ? `${p.color}15` : 'transparent',
                          color: newCalPost.platform === p.id ? p.color : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Heure</div>
                  <input
                    type="time"
                    value={newCalPost.time}
                    onChange={e => setNewCalPost({ ...newCalPost, time: e.target.value })}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Titre</div>
                  <input
                    type="text"
                    value={newCalPost.title}
                    onChange={e => setNewCalPost({ ...newCalPost, title: e.target.value })}
                    placeholder="Titre du post"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Contenu (optionnel)</div>
                  <textarea
                    value={newCalPost.content}
                    onChange={e => setNewCalPost({ ...newCalPost, content: e.target.value })}
                    placeholder="Contenu du post..."
                    style={{
                      width: '100%', minHeight: 80, padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
                      lineHeight: 1.5, resize: 'vertical', outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowAddPost(null)}
                    style={{
                      padding: '8px 18px', borderRadius: 10,
                      border: '1px solid var(--border-secondary)', background: 'transparent',
                      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => addCalendarPost(showAddPost)}
                    disabled={!newCalPost.title.trim()}
                    style={{
                      padding: '8px 18px', borderRadius: 10,
                      border: 'none',
                      background: newCalPost.title.trim() ? '#5b6cf7' : 'var(--bg-tertiary)',
                      color: newCalPost.title.trim() ? '#fff' : 'var(--text-muted)',
                      fontSize: 13, fontWeight: 600,
                      cursor: newCalPost.title.trim() ? 'pointer' : 'default',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Edit Post Modal */}
          {editingCalPost && (
            <>
              <div
                onClick={() => setEditingCalPost(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
              />
              <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 440, zIndex: 1000,
                background: 'var(--bg-elevated)', borderRadius: 16,
                border: '1px solid var(--border-secondary)', boxShadow: 'var(--shadow-lg)',
                padding: 24,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
                  {platformEmoji(editingCalPost.platform)} {editingCalPost.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  {editingCalPost.date} {editingCalPost.time ? `a ${editingCalPost.time}` : ''}
                </div>

                {editingCalPost.content && (
                  <div style={{
                    padding: 12, borderRadius: 10, background: 'var(--bg-secondary)',
                    fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)',
                    marginBottom: 16, maxHeight: 200, overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {editingCalPost.content}
                  </div>
                )}

                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Changer le statut</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {(Object.entries(statusLabels) as [CalendarPost['status'], string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateCalendarPostStatus(editingCalPost.id, key);
                        setEditingCalPost({ ...editingCalPost, status: key });
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: editingCalPost.status === key ? `1px solid ${statusColors[key]}` : '1px solid var(--border-secondary)',
                        background: editingCalPost.status === key ? `${statusColors[key]}20` : 'transparent',
                        color: editingCalPost.status === key ? statusColors[key] : 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <button
                    onClick={() => deleteCalendarPost(editingCalPost.id)}
                    style={{
                      padding: '8px 16px', borderRadius: 10,
                      border: '1px solid #ef4444', background: 'transparent',
                      color: '#ef4444', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setEditingCalPost(null)}
                    style={{
                      padding: '8px 18px', borderRadius: 10,
                      border: '1px solid var(--border-secondary)', background: 'transparent',
                      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 3: Connexion directe
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'connect' && (
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #5b6cf708, #8b7cf806)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
              Connectez vos comptes pour publier directement depuis Freenzy.io
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Configurez vos cles API pour chaque plateforme. Une fois connecte, vous pourrez publier vos posts generes en un clic.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {/* LinkedIn */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#0077b515', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {'\uD83D\uDCBC'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0077b5' }}>LinkedIn</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Necessite une app LinkedIn Developer
                  </div>
                </div>
                {platformKeys.linkedin?.connected && (
                  <div style={{
                    marginLeft: 'auto',
                    padding: '3px 10px', borderRadius: 20,
                    background: '#16a34a15', color: '#16a34a',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    Connecte
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>API Key</div>
                <input
                  type="password"
                  value={platformKeys.linkedin?.apiKey ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, linkedin: { apiKey: e.target.value, connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="Votre cle API LinkedIn"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={() => handleTestConnection('linkedin')}
                disabled={testingPlatform === 'linkedin'}
                style={{
                  width: '100%', padding: '8px 16px', borderRadius: 10,
                  border: '1px solid #0077b5', background: testingPlatform === 'linkedin' ? '#0077b510' : 'transparent',
                  color: '#0077b5', fontSize: 13, fontWeight: 600,
                  cursor: testingPlatform === 'linkedin' ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {testingPlatform === 'linkedin' ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Guide: Creez une app sur{' '}
                <a href="https://developer.linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline' }}>
                  developer.linkedin.com
                </a>
                , activez les scopes w_member_social et r_liteprofile.
              </div>
            </div>

            {/* Facebook/Instagram */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#1877f215', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {'\uD83D\uDC4D'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1877f2' }}>Facebook / Instagram</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Necessite Meta Business Suite
                  </div>
                </div>
                {platformKeys.facebook?.connected && (
                  <div style={{
                    marginLeft: 'auto',
                    padding: '3px 10px', borderRadius: 20,
                    background: '#16a34a15', color: '#16a34a',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    Connecte
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Access Token</div>
                <input
                  type="password"
                  value={platformKeys.facebook?.accessToken ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, facebook: { accessToken: e.target.value, pageId: platformKeys.facebook?.pageId ?? '', connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="Votre access token Meta"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Page ID</div>
                <input
                  type="text"
                  value={platformKeys.facebook?.pageId ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, facebook: { accessToken: platformKeys.facebook?.accessToken ?? '', pageId: e.target.value, connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="ID de votre page Facebook"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={() => handleTestConnection('facebook')}
                disabled={testingPlatform === 'facebook'}
                style={{
                  width: '100%', padding: '8px 16px', borderRadius: 10,
                  border: '1px solid #1877f2', background: testingPlatform === 'facebook' ? '#1877f210' : 'transparent',
                  color: '#1877f2', fontSize: 13, fontWeight: 600,
                  cursor: testingPlatform === 'facebook' ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {testingPlatform === 'facebook' ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Guide: Configurez une app sur{' '}
                <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1877f2', textDecoration: 'underline' }}>
                  developers.facebook.com
                </a>
                , activez les pages_manage_posts et instagram_basic.
              </div>
            </div>

            {/* Twitter/X */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#1da1f215', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {'\uD83D\uDC26'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1da1f2' }}>Twitter / X</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    API payante ($100/mois)
                  </div>
                </div>
                {platformKeys.twitter?.connected && (
                  <div style={{
                    marginLeft: 'auto',
                    padding: '3px 10px', borderRadius: 20,
                    background: '#16a34a15', color: '#16a34a',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    Connecte
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>API Key</div>
                <input
                  type="password"
                  value={platformKeys.twitter?.apiKey ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, twitter: { apiKey: e.target.value, apiSecret: platformKeys.twitter?.apiSecret ?? '', bearerToken: platformKeys.twitter?.bearerToken ?? '', connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="API Key"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>API Secret</div>
                <input
                  type="password"
                  value={platformKeys.twitter?.apiSecret ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, twitter: { apiKey: platformKeys.twitter?.apiKey ?? '', apiSecret: e.target.value, bearerToken: platformKeys.twitter?.bearerToken ?? '', connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="API Secret"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Bearer Token</div>
                <input
                  type="password"
                  value={platformKeys.twitter?.bearerToken ?? ''}
                  onChange={e => {
                    const keys = { ...platformKeys, twitter: { apiKey: platformKeys.twitter?.apiKey ?? '', apiSecret: platformKeys.twitter?.apiSecret ?? '', bearerToken: e.target.value, connected: false } };
                    setPlatformKeys(keys);
                    saveKeys(keys);
                  }}
                  placeholder="Bearer Token"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={() => handleTestConnection('twitter')}
                disabled={testingPlatform === 'twitter'}
                style={{
                  width: '100%', padding: '8px 16px', borderRadius: 10,
                  border: '1px solid #1da1f2', background: testingPlatform === 'twitter' ? '#1da1f210' : 'transparent',
                  color: '#1da1f2', fontSize: 13, fontWeight: 600,
                  cursor: testingPlatform === 'twitter' ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {testingPlatform === 'twitter' ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Guide: Souscrivez au plan Basic ($100/mois) sur{' '}
                <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2', textDecoration: 'underline' }}>
                  developer.twitter.com
                </a>
                , activez les OAuth 2.0 scopes tweet.write et users.read.
              </div>
            </div>

            {/* TikTok — Greyed out */}
            <div className="card" style={{ padding: 20, opacity: 0.45, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#00000010', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {'\uD83C\uDFB5'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>TikTok</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Bientot disponible
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  padding: '3px 10px', borderRadius: 20,
                  background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700,
                }}>
                  Prochainement
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                L&apos;integration TikTok sera disponible dans une future mise a jour. Restez informe !
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#16a34a08',
            border: '1px solid #16a34a22',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{'\uD83D\uDD12'}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Securite :</strong> Vos cles API sont stockees localement dans votre navigateur et ne sont jamais envoyees a nos serveurs.
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 4: Analytics
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                Posts generes ce mois
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#5b6cf7' }}>
                {analytics.monthPosts}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {analytics.totalPosts} au total
              </div>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                Caracteres generes
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#8b7cf8' }}>
                {analytics.totalChars > 1000 ? `${(analytics.totalChars / 1000).toFixed(1)}k` : analytics.totalChars}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                ce mois
              </div>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                Posts planifies
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#3b82f6' }}>
                {analytics.totalCalendar}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                dans le calendrier
              </div>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Repartition par plateforme
            </div>

            {analytics.totalPosts === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucun post genere pour le moment. Commencez par generer votre premier post !
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLATFORMS.map(p => {
                  const count = analytics.byPlatform[p.id] ?? 0;
                  const maxCount = Math.max(...Object.values(analytics.byPlatform), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={p.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>{p.emoji}</span>
                          {p.label}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{count}</span>
                      </div>
                      <div style={{
                        height: 8, borderRadius: 4,
                        background: 'var(--bg-tertiary)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: 4,
                          background: p.color,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar Analytics */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Calendrier editorial - repartition des statuts
            </div>

            {analytics.totalCalendar === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucun post dans le calendrier. Planifiez vos publications dans l&apos;onglet Calendrier !
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                {(Object.entries(statusLabels) as [CalendarPost['status'], string][]).map(([key, label]) => {
                  const count = calendarPosts.filter(p => p.status === key).length;
                  return (
                    <div key={key} style={{
                      padding: 16, borderRadius: 12, textAlign: 'center',
                      background: `${statusColors[key]}10`,
                      border: `1px solid ${statusColors[key]}30`,
                    }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: statusColors[key] }}>{count}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: statusColors[key], marginTop: 4 }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar platform distribution */}
          {analytics.totalCalendar > 0 && (
            <div className="card" style={{ padding: 20, marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                Calendrier - repartition par plateforme
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLATFORMS.map(p => {
                  const count = analytics.calByPlatform[p.id] ?? 0;
                  const maxCount = Math.max(...Object.values(analytics.calByPlatform), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={p.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>{p.emoji}</span>
                          {p.label}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{count}</span>
                      </div>
                      <div style={{
                        height: 8, borderRadius: 4,
                        background: 'var(--bg-tertiary)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: 4,
                          background: p.color,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spinner animation (inline keyframes) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
