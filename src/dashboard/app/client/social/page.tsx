'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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
  [key: string]: unknown;
  linkedin?: { apiKey: string; connected: boolean };
  facebook?: { accessToken: string; pageId: string; connected: boolean };
  twitter?: { apiKey: string; apiSecret: string; bearerToken: string; connected: boolean };
  tiktok?: { connected: boolean };
}

interface ConnectedAccount {
  platform: string;
  username: string;
  profileUrl: string;
  followers: number;
  connected: boolean;
  lastSync: string;
}

interface PostAnalytics {
  id: string;
  platform: string;
  content: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementRate: number;
}

interface CompetitorProfile {
  id: string;
  name: string;
  platform: string;
  username: string;
  followers: number;
  avgEngagement: number;
  postFrequency: string;
  topContent: string;
  addedAt: string;
}

interface AccountAnalysis {
  platform: string;
  username: string;
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  bestPostTime: string;
  topHashtags: string[];
  growthRate: string;
  audienceAge: string;
}

// ─── Constants ───────────────────────────────────────────
const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', emoji: '\uD83D\uDCBC', color: '#0077b5' },
  { id: 'instagram', label: 'Instagram', emoji: '\uD83D\uDCF8', color: '#E4405F' },
  { id: 'facebook', label: 'Facebook', emoji: '\uD83D\uDCD8', color: '#1877f2' },
  { id: 'twitter', label: 'Twitter/X', emoji: '\uD83D\uDC26', color: '#1da1f2' },
  { id: 'tiktok', label: 'TikTok', emoji: '\uD83C\uDFB5', color: '#000000' },
  { id: 'youtube', label: 'YouTube', emoji: '\uD83D\uDCFA', color: '#FF0000' },
] as const;

const POST_TYPES = [
  { id: 'texte', label: 'Post texte' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'story', label: 'Story' },
  { id: 'thread', label: 'Thread' },
] as const;

const TONES = ['Professionnel', 'Decontracte', 'Humoristique', 'Inspirant'] as const;
const GOALS = ['Informer', 'Vendre', 'Engager', 'Eduquer'] as const;
const LANGUAGES = ['Francais', 'Anglais', 'Espagnol'] as const;
const LENGTHS = ['Courte', 'Moyenne', 'Longue'] as const;

const TABS = [
  { id: 'generator', label: 'Generateur', emoji: '\u270F\uFE0F' },
  { id: 'posts', label: 'Mes posts', emoji: '\uD83D\uDCCB' },
  { id: 'calendar', label: 'Calendrier', emoji: '\uD83D\uDCC5' },
  { id: 'accounts', label: 'Mes comptes', emoji: '\uD83D\uDD17' },
  { id: 'analytics', label: 'Analytics', emoji: '\uD83D\uDCCA' },
  { id: 'competitors', label: 'Concurrents', emoji: '\uD83C\uDFAF' },
] as const;

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

type TabId = typeof TABS[number]['id'];

// ─── Helpers ─────────────────────────────────────────────
function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

// localStorage helpers removed — useUserData handles persistence + backend sync

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
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
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
  return PLATFORMS.find(p => p.id === platformId)?.color ?? 'var(--fz-accent, #0EA5E9)';
}

function platformEmoji(platformId: string): string {
  return PLATFORMS.find(p => p.id === platformId)?.emoji ?? '\uD83D\uDCF1';
}

// ─── Mock data helpers ──────────────────────────────────
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockEngagement(postId: string): { likes: number; comments: number; shares: number; views: number } {
  const h = hashStr(postId);
  return {
    likes: 50 + (h % 500),
    comments: 5 + (h % 80),
    shares: 2 + (h % 40),
    views: 500 + (h % 5000),
  };
}

function mockAccountAnalysis(platform: string, username: string): AccountAnalysis {
  const h = hashStr(platform + username);
  const hashtags = ['#marketing', '#business', '#growth', '#digital', '#innovation', '#startup', '#tech', '#strategy', '#branding', '#content'];
  const selected = hashtags.filter((_, i) => (h >> i) & 1).slice(0, 5);
  if (selected.length === 0) selected.push('#marketing', '#business');
  return {
    platform,
    username,
    followers: 1000 + (h % 50000),
    following: 200 + (h % 3000),
    totalPosts: 50 + (h % 500),
    avgLikes: 20 + (h % 300),
    avgComments: 3 + (h % 50),
    engagementRate: parseFloat((1.5 + (h % 80) / 10).toFixed(1)),
    bestPostTime: ['09:00', '12:00', '14:00', '17:00', '19:00', '21:00'][h % 6],
    topHashtags: selected,
    growthRate: `+${(0.5 + (h % 50) / 10).toFixed(1)}%`,
    audienceAge: ['18-24', '25-34', '35-44'][h % 3],
  };
}

function mockCompetitorAnalysis(name: string, platform: string): Omit<CompetitorProfile, 'id' | 'addedAt'> {
  const h = hashStr(name + platform);
  const freqs = ['1 post/jour', '3 posts/semaine', '5 posts/semaine', '2 posts/jour', '1 post/semaine'];
  const contents = ['Carousel educatif', 'Video courte', 'Post texte long', 'Infographie', 'Temoignage client', 'Behind the scenes'];
  return {
    name,
    platform,
    username: `@${name.toLowerCase().replace(/\s+/g, '')}`,
    followers: 5000 + (h % 100000),
    avgEngagement: parseFloat((1.0 + (h % 100) / 10).toFixed(1)),
    postFrequency: freqs[h % freqs.length],
    topContent: contents[h % contents.length],
  };
}

// accounts + competitors helpers removed — useUserData handles persistence

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
  const [language, setLanguage] = useState<string>('Francais');
  const [length, setLength] = useState<string>('Moyenne');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { data: savedPosts, setData: setSavedPosts } = useUserData<SavedPost[]>('social_posts', [], 'fz_social_posts');
  const [copySuccess, setCopySuccess] = useState(false);

  // Posts tab state
  const [postsFilter, setPostsFilter] = useState<string>('all');
  const [postsSort, setPostsSort] = useState<'date' | 'platform'>('date');
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Calendar state
  const { data: calendarPosts, setData: setCalendarPosts } = useUserData<CalendarPost[]>('social_calendar', [], 'fz_social_calendar');
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [showAddPost, setShowAddPost] = useState<string | null>(null);
  const [newCalPost, setNewCalPost] = useState({ platform: 'linkedin', title: '', content: '', time: '09:00' });
  const [editingCalPost, setEditingCalPost] = useState<CalendarPost | null>(null);

  // Accounts state (synced to backend via useUserData)
  const { data: platformKeys, setData: setPlatformKeys } = useUserData<PlatformKeys>('social_keys', {}, 'fz_social_keys');
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const { data: connectedAccounts, setData: setConnectedAccounts } = useUserData<ConnectedAccount[]>('social_accounts', [], 'fz_social_accounts');

  // Analytics state
  const [analysisTarget, setAnalysisTarget] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AccountAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Competitors state (synced to backend via useUserData)
  const { data: competitors, setData: setCompetitors } = useUserData<CompetitorProfile[]>('social_competitors', [], 'fz_social_competitors');
  const [newCompName, setNewCompName] = useState('');
  const [newCompPlatform, setNewCompPlatform] = useState('linkedin');
  const [analyzingCompId, setAnalyzingCompId] = useState<string | null>(null);
  const [compSearchQuery, setCompSearchQuery] = useState('');
  const [showCompSearch, setShowCompSearch] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);

  // Data loaded automatically by useUserData hooks (localStorage + backend sync)

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
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

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
        signal: controller.signal,
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
              if (data && data !== '[DONE]') {
                accumulated += data;
                setGeneratedContent(accumulated);
              }
            }
          }
        }
      }

      if (!accumulated) {
        setGeneratedContent('Aucun contenu genere. Verifiez vos credits.');
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
    const updated = [post, ...savedPosts];
    setSavedPosts(updated);
  }

  function handleDeletePost(id: string) {
    const updated = savedPosts.filter(p => p.id !== id);
    setSavedPosts(updated);
  }

  function handleRegenerate() {
    handleGenerate();
  }

  // ─── TAB 2: Mes Posts ──────────────────────────────────
  function getFilteredPosts(): SavedPost[] {
    let posts = [...savedPosts];
    if (postsFilter !== 'all') {
      posts = posts.filter(p => p.platform === postsFilter);
    }
    if (postsSort === 'platform') {
      posts.sort((a, b) => a.platform.localeCompare(b.platform));
    } else {
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return posts;
  }

  function togglePostSelect(id: string) {
    const next = new Set(selectedPostIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPostIds(next);
  }

  function handleDeleteSelected() {
    if (selectedPostIds.size === 0) return;
    const updated = savedPosts.filter(p => !selectedPostIds.has(p.id));
    setSavedPosts(updated);
    setSelectedPostIds(new Set());
  }

  function handleSchedulePost(post: SavedPost) {
    const today = dateToKey(new Date());
    const calPost: CalendarPost = {
      id: generateId(),
      date: today,
      platform: post.platform,
      title: post.brief || post.content.slice(0, 40) + '...',
      content: post.content,
      status: 'planifie',
      time: '09:00',
    };
    setCalendarPosts([...calendarPosts, calPost]);
    setActiveTab('calendar');
  }

  function handleReusePost(post: SavedPost) {
    setPlatform(post.platform);
    setPostType(post.type);
    setBrief(post.brief);
    setGeneratedContent(post.content);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── TAB 3: Calendar ──────────────────────────────────
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
    setShowAddPost(null);
    setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' });
  }

  function updateCalendarPostStatus(id: string, status: CalendarPost['status']) {
    const updated = calendarPosts.map(p => p.id === id ? { ...p, status } : p);
    setCalendarPosts(updated);
  }

  function deleteCalendarPost(id: string) {
    const updated = calendarPosts.filter(p => p.id !== id);
    setCalendarPosts(updated);
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

  // ─── TAB 4: Connection test ───────────────────────────
  function handleTestConnection(platformId: string) {
    setTestingPlatform(platformId);
    setTimeout(() => {
      const keys = { ...platformKeys };
      let connected = false;
      if (platformId === 'linkedin' && keys.linkedin?.apiKey) {
        keys.linkedin = { ...keys.linkedin, connected: true };
        connected = true;
      } else if (platformId === 'facebook' && keys.facebook?.accessToken && keys.facebook?.pageId) {
        keys.facebook = { ...keys.facebook, connected: true };
        connected = true;
      } else if (platformId === 'twitter' && keys.twitter?.bearerToken) {
        keys.twitter = { ...keys.twitter, connected: true };
        connected = true;
      } else {
        if (platformId === 'linkedin') keys.linkedin = { apiKey: keys.linkedin?.apiKey ?? '', connected: false };
        if (platformId === 'facebook') keys.facebook = { accessToken: keys.facebook?.accessToken ?? '', pageId: keys.facebook?.pageId ?? '', connected: false };
        if (platformId === 'twitter') keys.twitter = { apiKey: keys.twitter?.apiKey ?? '', apiSecret: keys.twitter?.apiSecret ?? '', bearerToken: keys.twitter?.bearerToken ?? '', connected: false };
      }
      setPlatformKeys(keys);

      if (connected) {
        const existing = connectedAccounts.filter(a => a.platform !== platformId);
        const newAcc: ConnectedAccount = {
          platform: platformId,
          username: `@freenzy_${platformId}`,
          profileUrl: `https://${platformId}.com/freenzy`,
          followers: 1000 + hashStr(platformId) % 10000,
          connected: true,
          lastSync: new Date().toISOString(),
        };
        const updated = [...existing, newAcc];
        setConnectedAccounts(updated);
      }

      setTestingPlatform(null);
    }, 1500);
  }

  function handleDisconnect(platformId: string) {
    const keys = { ...platformKeys };
    if (platformId === 'linkedin') keys.linkedin = { apiKey: '', connected: false };
    if (platformId === 'facebook') keys.facebook = { accessToken: '', pageId: '', connected: false };
    if (platformId === 'twitter') keys.twitter = { apiKey: '', apiSecret: '', bearerToken: '', connected: false };
    setPlatformKeys(keys);
    const updated = connectedAccounts.filter(a => a.platform !== platformId);
    setConnectedAccounts(updated);
  }

  function handleSyncAccount(platformId: string) {
    const updated = connectedAccounts.map(a =>
      a.platform === platformId ? { ...a, lastSync: new Date().toISOString(), followers: a.followers + Math.floor(Math.random() * 50) } : a
    );
    setConnectedAccounts(updated);
  }

  // ─── TAB 5: Analytics ─────────────────────────────────
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

    const bestPlatform = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

    const avgEngagement = savedPosts.length > 0
      ? savedPosts.reduce((sum, p) => {
          const e = mockEngagement(p.id);
          return sum + e.likes + e.comments + e.shares;
        }, 0) / savedPosts.length
      : 0;

    return { monthPosts: monthPosts.length, totalChars, byPlatform, totalPosts: savedPosts.length, bestPlatform, avgEngagement: Math.round(avgEngagement) };
  }

  function runAccountAnalysis() {
    if (!analysisTarget) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const session = getSession();
    const account = connectedAccounts.find(a => a.platform === analysisTarget);
    const username = account?.username ?? `@freenzy_${analysisTarget}`;

    // Try API call, fallback to mock
    const doAnalysis = async () => {
      try {
        if (session.token) {
          const res = await fetch('/api/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
            body: JSON.stringify({ path: '/portal/social/analyze', platform: analysisTarget, username }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.analysis) {
              setAnalysisResult(data.analysis);
              setIsAnalyzing(false);
              return;
            }
          }
        }
      } catch { /* fallback to mock */ }

      // Mock fallback
      setTimeout(() => {
        setAnalysisResult(mockAccountAnalysis(analysisTarget, username));
        setIsAnalyzing(false);
      }, 1500);
    };

    doAnalysis();
  }

  function getTopPerformingPosts(): (SavedPost & { engagement: ReturnType<typeof mockEngagement> })[] {
    return savedPosts
      .map(p => ({ ...p, engagement: mockEngagement(p.id) }))
      .sort((a, b) => (b.engagement.likes + b.engagement.comments + b.engagement.shares) - (a.engagement.likes + a.engagement.comments + a.engagement.shares))
      .slice(0, 5);
  }

  // ─── TAB 6: Competitors ───────────────────────────────
  function addCompetitor() {
    if (!newCompName.trim()) return;
    const analysis = mockCompetitorAnalysis(newCompName, newCompPlatform);
    const comp: CompetitorProfile = {
      id: generateId(),
      ...analysis,
      addedAt: new Date().toISOString(),
    };
    const updated = [...competitors, comp];
    setCompetitors(updated);

    setNewCompName('');
  }

  function removeCompetitor(id: string) {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);

    if (compareTarget === id) setCompareTarget(null);
  }

  function analyzeCompetitor(id: string) {
    setAnalyzingCompId(id);
    setTimeout(() => {
      const comp = competitors.find(c => c.id === id);
      if (comp) {
        const fresh = mockCompetitorAnalysis(comp.name, comp.platform);
        const updated = competitors.map(c => c.id === id ? { ...c, ...fresh, followers: fresh.followers + Math.floor(Math.random() * 1000) } : c);
        setCompetitors(updated);
    
      }
      setAnalyzingCompId(null);
    }, 2000);
  }

  function getSearchResults(): { name: string; platform: string; followers: number }[] {
    if (!compSearchQuery.trim()) return [];
    const names = [
      `${compSearchQuery} Agency`, `${compSearchQuery} Digital`, `${compSearchQuery} Pro`,
      `${compSearchQuery} Group`, `Top ${compSearchQuery}`,
    ];
    return names.map(name => ({
      name,
      platform: PLATFORMS[hashStr(name) % PLATFORMS.length].id,
      followers: 2000 + hashStr(name) % 50000,
    }));
  }

  // ─── Platform preview ─────────────────────────────────
  function renderPlatformPreview(content: string, platformId: string) {
    const pColor = platformColor(platformId);
    const pEmoji = platformEmoji(platformId);
    const pLabel = PLATFORMS.find(p => p.id === platformId)?.label ?? platformId;

    return (
      <div className="fz-card" style={{ borderColor: `${pColor}33`, overflow: 'hidden', padding: 0 }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${pColor}22`,
          display: 'flex', alignItems: 'center', gap: 10,
          background: `${pColor}08`,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `${pColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            <span style={{ fontSize: 20 }}>{pEmoji}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fz-text, #1E293B)' }}>Votre Entreprise</div>
            <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
              {pLabel} {'\u00B7'} Apercu du post
            </div>
          </div>
        </div>
        <div style={{
          padding: 16, fontSize: 14, lineHeight: 1.7,
          whiteSpace: 'pre-wrap', color: 'var(--fz-text, #1E293B)',
          maxHeight: 400, overflowY: 'auto',
        }}>
          {content}
        </div>
        <div style={{
          padding: '10px 16px', borderTop: `1px solid ${pColor}15`,
          display: 'flex', gap: 20, fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)',
        }}>
          {platformId === 'linkedin' && (
            <>{'\uD83D\uDC4D'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDD01'} Republier</>
          )}
          {platformId === 'instagram' && (
            <>{'\u2764\uFE0F'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDCE4'} Envoyer</>
          )}
          {platformId === 'facebook' && (
            <>{'\uD83D\uDC4D'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDCE4'} Partager</>
          )}
          {platformId === 'twitter' && (
            <>{'\u2764\uFE0F'} Liker &nbsp; {'\uD83D\uDD01'} Retweeter &nbsp; {'\uD83D\uDCAC'} Repondre</>
          )}
          {platformId === 'tiktok' && (
            <>{'\u2764\uFE0F'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDD01'} Partager</>
          )}
          {platformId === 'youtube' && (
            <>{'\uD83D\uDC4D'} J&apos;aime &nbsp; {'\uD83D\uDCAC'} Commenter &nbsp; {'\uD83D\uDD14'} S&apos;abonner</>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────
  const analytics = getAnalytics();

  return (
    <div className="fz-page">
      {/* Page Header */}
      <div className="fz-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{PAGE_META.social.emoji}</span>
          <div>
            <h1 className="fz-page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{PAGE_META.social.title}</h1>
            <p className="fz-page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
              {PAGE_META.social.subtitle}
            </p>
          </div>
          <HelpBubble text={PAGE_META.social.helpText} />
        </div>
      </div>
      <PageExplanation pageId="social" text={PAGE_META.social?.helpText} />

      {/* Tab Navigation */}
      <div className="fz-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`fz-tab ${activeTab === tab.id ? 'fz-tab-active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB 1: Generateur de posts
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'generator' && (
        <div>
          <div className="fz-card" style={{ marginBottom: 16 }}>
            <div className="fz-section-title">Plateforme</div>
            <div className="fz-pill-group">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`fz-pill ${platform === p.id ? 'fz-pill-active' : ''}`}
                  style={platform === p.id ? { borderColor: p.color, background: `${p.color}12`, color: p.color } : {}}
                >
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="fz-section-title" style={{ marginTop: 20 }}>Type de contenu</div>
            <div className="fz-pill-group">
              {POST_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setPostType(t.id)}
                  className={`fz-pill ${postType === t.id ? 'fz-pill-active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="fz-section-title" style={{ marginTop: 20 }}>Sujet / Brief</div>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="Decrivez le sujet de votre post..."
              className="fz-textarea"
              style={{ minHeight: 100 }}
            />

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="fz-btn fz-btn-ghost"
              style={{ marginTop: 12, gap: 6, paddingLeft: 0 }}
            >
              <span style={{
                display: 'inline-block',
                transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                <span style={{ fontSize: 14 }}>{'\u25B6'}</span>
              </span>
              Options avancees
            </button>

            {showAdvanced && (
              <div className="fz-grid-2" style={{ marginTop: 12, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid var(--fz-border, #E2E8F0)', gap: 16 }}>
                <div>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Ton</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} className="fz-select">
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Objectif</label>
                  <select value={goal} onChange={e => setGoal(e.target.value)} className="fz-select">
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Langue</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="fz-select">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Longueur</label>
                  <select value={length} onChange={e => setLength(e.target.value)} className="fz-select">
                    {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Hashtags</label>
                  <div className="fz-pill-group" style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => setHashtagMode('auto')}
                      className={`fz-pill ${hashtagMode === 'auto' ? 'fz-pill-active' : ''}`}
                    >
                      Automatique
                    </button>
                    <button
                      onClick={() => setHashtagMode('manual')}
                      className={`fz-pill ${hashtagMode === 'manual' ? 'fz-pill-active' : ''}`}
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
                      className="fz-input"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !brief.trim()}
              className="fz-btn fz-btn-primary"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center', gap: 8 }}
            >
              {isGenerating ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
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
            <div className="fz-card" style={{ marginBottom: 16 }}>
              <div className="fz-section-title" style={{ marginBottom: 14 }}>Resultat</div>
              {renderPlatformPreview(generatedContent, platform)}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button onClick={handleCopy} className={`fz-btn ${copySuccess ? 'fz-btn-success' : 'fz-btn-secondary'} fz-btn-sm`}>
                  {copySuccess ? <><span style={{ fontSize: 14, verticalAlign: 'middle' }}>{'\u2705'}</span> Copie !</> : 'Copier'}
                </button>
                <button onClick={handleRegenerate} disabled={isGenerating} className="fz-btn fz-btn-secondary fz-btn-sm" style={{ opacity: isGenerating ? 0.5 : 1 }}>
                  Regenerer
                </button>
                <button onClick={handleSavePost} className="fz-btn fz-btn-sm" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* Recent posts (generator tab - compact) */}
          {savedPosts.length > 0 && (
            <div className="fz-card">
              <div className="fz-section-title" style={{ marginBottom: 14 }}>Historique ({savedPosts.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedPosts.slice(0, 5).map(post => (
                  <div key={post.id} style={{
                    padding: 14, borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg-secondary, #F8FAFC)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="fz-badge" style={{ background: `${platformColor(post.platform)}15`, color: platformColor(post.platform) }}>
                          <span style={{ fontSize: 14 }}>{platformEmoji(post.platform)}</span> {post.platform}
                        </span>
                        <span className="fz-badge">{post.type}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{formatDate(post.createdAt)}</span>
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--fz-text-muted)', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {post.content}
                    </div>
                  </div>
                ))}
                {savedPosts.length > 5 && (
                  <button onClick={() => setActiveTab('posts')} className="fz-btn fz-btn-ghost fz-btn-sm" style={{ alignSelf: 'center' }}>
                    Voir tous les posts ({savedPosts.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 2: Mes Posts
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'posts' && (
        <div>
          {/* Filters & Sort */}
          <div className="fz-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginRight: 8 }}>Plateforme:</label>
                  <select value={postsFilter} onChange={e => setPostsFilter(e.target.value)} className="fz-select" style={{ width: 'auto', minWidth: 120 }}>
                    <option value="all">Toutes</option>
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginRight: 8 }}>Tri:</label>
                  <select value={postsSort} onChange={e => setPostsSort(e.target.value as 'date' | 'platform')} className="fz-select" style={{ width: 'auto', minWidth: 120 }}>
                    <option value="date">Plus recents</option>
                    <option value="platform">Par plateforme</option>
                  </select>
                </div>
              </div>
              {selectedPostIds.size > 0 && (
                <button onClick={handleDeleteSelected} className="fz-btn fz-btn-danger fz-btn-sm">
                  Supprimer ({selectedPostIds.size})
                </button>
              )}
            </div>
          </div>

          {/* Posts List */}
          {getFilteredPosts().length === 0 ? (
            <div className="fz-empty">
              <div className="fz-empty-icon"><span style={{ fontSize: 48 }}>{'\uD83D\uDCCB'}</span></div>
              <div className="fz-empty-title">Aucun post sauvegarde</div>
              <div className="fz-empty-desc">Generez votre premier post dans l&apos;onglet Generateur</div>
              <button onClick={() => setActiveTab('generator')} className="fz-btn fz-btn-primary fz-btn-sm" style={{ marginTop: 12 }}>
                Creer un post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getFilteredPosts().map(post => {
                const eng = mockEngagement(post.id);
                const isSelected = selectedPostIds.has(post.id);
                return (
                  <div key={post.id} className="fz-card fz-card-hover" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => togglePostSelect(post.id)}
                        style={{
                          width: 20, height: 20, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                          border: isSelected ? '2px solid var(--accent)' : '2px solid var(--fz-border, #E2E8F0)',
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', marginTop: 2, color: '#fff', fontSize: 12,
                        }}
                      >
                        {isSelected && <span style={{ fontSize: 12 }}>{'\u2713'}</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="fz-badge" style={{ background: `${platformColor(post.platform)}15`, color: platformColor(post.platform) }}>
                              <span style={{ fontSize: 14 }}>{platformEmoji(post.platform)}</span> {PLATFORMS.find(p => p.id === post.platform)?.label ?? post.platform}
                            </span>
                            <span className="fz-badge">{post.type}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{formatDate(post.createdAt)}</span>
                        </div>

                        {/* Content preview */}
                        <div style={{
                          fontSize: 12, color: 'var(--fz-text-muted)', lineHeight: 1.6,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                          marginBottom: 12,
                        }}>
                          {post.content}
                        </div>

                        {/* Engagement stats */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\u2764\uFE0F'} {eng.likes}</span>
                          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\uD83D\uDCAC'} {eng.comments}</span>
                          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\uD83D\uDD01'} {eng.shares}</span>
                          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\uD83D\uDC41\uFE0F'} {eng.views}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => { navigator.clipboard.writeText(post.content); }}
                            className="fz-btn fz-btn-secondary fz-btn-sm"
                          >
                            Copier
                          </button>
                          <button onClick={() => handleReusePost(post)} className="fz-btn fz-btn-secondary fz-btn-sm">
                            Reutiliser
                          </button>
                          <button onClick={() => handleSchedulePost(post)} className="fz-btn fz-btn-secondary fz-btn-sm">
                            Planifier
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="fz-btn fz-btn-danger fz-btn-sm">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 3: Calendrier editorial
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'calendar' && (
        <div>
          {/* View toggle + navigation */}
          <div className="fz-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className="fz-pill-group">
                <button
                  onClick={() => setCalendarView('week')}
                  className={`fz-pill ${calendarView === 'week' ? 'fz-pill-active' : ''}`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setCalendarView('month')}
                  className={`fz-pill ${calendarView === 'month' ? 'fz-pill-active' : ''}`}
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
                  className="fz-btn fz-btn-secondary fz-btn-sm"
                  style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 16 }}>{'\u25C0'}</span>
                </button>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)', minWidth: 140, textAlign: 'center' }}>
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
                  className="fz-btn fz-btn-secondary fz-btn-sm"
                  style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 16 }}>{'\u25B6'}</span>
                </button>
                {calendarView === 'week' && weekOffset !== 0 && (
                  <button onClick={() => setWeekOffset(0)} className="fz-btn fz-btn-ghost fz-btn-sm">
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
                  <div key={key} className="fz-card" style={{
                    minHeight: 160, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', padding: 0,
                    borderColor: isToday ? 'var(--accent)' : undefined,
                    borderWidth: isToday ? 2 : undefined,
                  }}>
                    <div style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--fz-border, #E2E8F0)',
                      background: isToday ? 'var(--accent-muted)' : 'var(--fz-bg-secondary, #F8FAFC)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--fz-text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                          {DAYS_FR[i]}
                        </span>
                        <span style={{ marginLeft: 6, fontSize: 14, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--fz-text, #1E293B)' }}>
                          {date.getDate()}
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowAddPost(key); setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' }); }}
                        className="fz-btn fz-btn-ghost fz-btn-sm"
                        style={{ width: 22, height: 22, padding: 0, justifyContent: 'center', fontSize: 14 }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ flex: 1, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dayPosts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setEditingCalPost(p)}
                          style={{
                            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                            background: `${platformColor(p.platform)}10`,
                            borderLeft: `3px solid ${statusColors[p.status]}`,
                            cursor: 'pointer', fontSize: 11, lineHeight: 1.4,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 10 }}>{platformEmoji(p.platform)}</span>
                            <span style={{ fontWeight: 600, color: 'var(--fz-text, #1E293B)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </span>
                          </div>
                          {p.time && <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>{p.time}</div>}
                        </div>
                      ))}
                      {dayPosts.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>Aucun post</span>
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
            <div className="fz-card" style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--fz-text-muted, #94A3B8)', padding: '4px 0', textTransform: 'uppercase' }}>
                    {d}
                  </div>
                ))}
              </div>
              {getMonthDates(monthDate.getFullYear(), monthDate.getMonth()).map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                  {week.map((date, di) => {
                    if (!date) return <div key={di} style={{ minHeight: 60, borderRadius: 'var(--radius-sm)', background: 'var(--fz-bg-secondary, #F8FAFC)' }} />;
                    const key = dateToKey(date);
                    const dayPosts = getPostsForDate(key);
                    const isToday = dateToKey(new Date()) === key;
                    return (
                      <div key={di} style={{
                        minHeight: 60, borderRadius: 'var(--radius-sm)',
                        border: isToday ? '1px solid var(--accent)' : '1px solid var(--fz-border, #E2E8F0)',
                        background: 'var(--fz-bg, #FFFFFF)', padding: 4, cursor: 'pointer',
                      }}
                      onClick={() => { setShowAddPost(key); setNewCalPost({ platform: 'linkedin', title: '', content: '', time: '09:00' }); }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--fz-text, #1E293B)', marginBottom: 4 }}>
                          {date.getDate()}
                        </div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {dayPosts.map(p => (
                            <div key={p.id} title={`${p.title} (${statusLabels[p.status]})`} style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: platformColor(p.platform), border: `1px solid ${statusColors[p.status]}`,
                            }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    {p.label}
                  </div>
                ))}
                <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>|</span>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
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
              <div onClick={() => setShowAddPost(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
              <div className="fz-card" style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 480, zIndex: 1000, boxShadow: 'var(--shadow-lg)',
              }}>
                <div className="fz-section-title" style={{ marginBottom: 16 }}>
                  Ajouter un post - {showAddPost}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Plateforme</label>
                  <div className="fz-pill-group">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setNewCalPost({ ...newCalPost, platform: p.id })}
                        className={`fz-pill ${newCalPost.platform === p.id ? 'fz-pill-active' : ''}`}
                        style={newCalPost.platform === p.id ? { borderColor: p.color, color: p.color } : {}}
                      >
                        <span style={{ fontSize: 14 }}>{p.emoji}</span> {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Heure</label>
                  <input type="time" value={newCalPost.time} onChange={e => setNewCalPost({ ...newCalPost, time: e.target.value })} className="fz-input" style={{ width: 'auto' }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Titre</label>
                  <input type="text" value={newCalPost.title} onChange={e => setNewCalPost({ ...newCalPost, title: e.target.value })} placeholder="Titre du post" className="fz-input" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Contenu (optionnel)</label>
                  <textarea value={newCalPost.content} onChange={e => setNewCalPost({ ...newCalPost, content: e.target.value })} placeholder="Contenu du post..." className="fz-textarea" style={{ minHeight: 80 }} />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAddPost(null)} className="fz-btn fz-btn-secondary fz-btn-sm">
                    Annuler
                  </button>
                  <button onClick={() => addCalendarPost(showAddPost)} disabled={!newCalPost.title.trim()} className="fz-btn fz-btn-primary fz-btn-sm" style={{ opacity: newCalPost.title.trim() ? 1 : 0.5 }}>
                    Ajouter
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Edit Post Modal */}
          {editingCalPost && (
            <>
              <div onClick={() => setEditingCalPost(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
              <div className="fz-card" style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90%', maxWidth: 440, zIndex: 1000, boxShadow: 'var(--shadow-lg)',
              }}>
                <div className="fz-section-title" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{platformEmoji(editingCalPost.platform)}</span> {editingCalPost.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 16 }}>
                  {editingCalPost.date} {editingCalPost.time ? `a ${editingCalPost.time}` : ''}
                </div>

                {editingCalPost.content && (
                  <div style={{
                    padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)',
                    fontSize: 13, lineHeight: 1.6, color: 'var(--fz-text-secondary, #64748B)',
                    marginBottom: 16, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap',
                  }}>
                    {editingCalPost.content}
                  </div>
                )}

                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--fz-text-secondary, #64748B)' }}>Changer le statut</div>
                <div className="fz-pill-group" style={{ marginBottom: 16 }}>
                  {(Object.entries(statusLabels) as [CalendarPost['status'], string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { updateCalendarPostStatus(editingCalPost.id, key); setEditingCalPost({ ...editingCalPost, status: key }); }}
                      className={`fz-pill ${editingCalPost.status === key ? 'fz-pill-active' : ''}`}
                      style={editingCalPost.status === key ? { borderColor: statusColors[key], color: statusColors[key] } : {}}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <button onClick={() => deleteCalendarPost(editingCalPost.id)} className="fz-btn fz-btn-danger fz-btn-sm">
                    Supprimer
                  </button>
                  <button onClick={() => setEditingCalPost(null)} className="fz-btn fz-btn-secondary fz-btn-sm">
                    Fermer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 4: Mes comptes
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'accounts' && (
        <div>
          <div className="fz-info-box fz-info-box-accent" style={{ marginBottom: 20 }}>
            <span className="fz-info-box-icon"><span style={{ fontSize: 20 }}>{'\uD83D\uDD17'}</span></span>
            <div>
              <strong>Connectez vos comptes</strong> pour publier directement depuis Freenzy.io. Configurez vos cles API pour chaque plateforme. Vos identifiants sont stockes localement et ne quittent jamais votre navigateur.
            </div>
          </div>

          <div className="fz-grid-2">
            {/* LinkedIn */}
            <div className="fz-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#0077b515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83D\uDCBC'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0077b5' }}>LinkedIn</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>LinkedIn Developer App</div>
                </div>
                <span className={`fz-badge ${platformKeys.linkedin?.connected ? 'fz-badge-success' : ''}`}>
                  {platformKeys.linkedin?.connected ? 'Connecte' : 'Deconnecte'}
                </span>
              </div>

              {platformKeys.linkedin?.connected ? (
                <div>
                  {(() => { const acc = connectedAccounts.find(a => a.platform === 'linkedin'); return acc ? (
                    <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{acc.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{acc.followers.toLocaleString()} abonnes</div>
                      <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>Synchro: {formatDate(acc.lastSync)}</div>
                    </div>
                  ) : null; })()}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleSyncAccount('linkedin')} className="fz-btn fz-btn-secondary fz-btn-sm" style={{ flex: 1 }}>Synchroniser</button>
                    <button onClick={() => handleDisconnect('linkedin')} className="fz-btn fz-btn-danger fz-btn-sm">Deconnecter</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>API Key</label>
                    <input
                      type="password"
                      value={platformKeys.linkedin?.apiKey ?? ''}
                      onChange={e => { const keys = { ...platformKeys, linkedin: { apiKey: e.target.value, connected: false } }; setPlatformKeys(keys); }}
                      placeholder="Votre cle API LinkedIn"
                      className="fz-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <button onClick={() => handleTestConnection('linkedin')} disabled={testingPlatform === 'linkedin'} className="fz-btn fz-btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#0077b5', color: '#0077b5' }}>
                    {testingPlatform === 'linkedin' ? 'Test en cours...' : 'Tester la connexion'}
                  </button>
                </div>
              )}
            </div>

            {/* Facebook / Instagram */}
            <div className="fz-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#1877f215', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83D\uDCD8'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1877f2' }}>Facebook / Instagram</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>Meta Business Suite</div>
                </div>
                <span className={`fz-badge ${platformKeys.facebook?.connected ? 'fz-badge-success' : ''}`}>
                  {platformKeys.facebook?.connected ? 'Connecte' : 'Deconnecte'}
                </span>
              </div>

              {platformKeys.facebook?.connected ? (
                <div>
                  {(() => { const acc = connectedAccounts.find(a => a.platform === 'facebook'); return acc ? (
                    <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{acc.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{acc.followers.toLocaleString()} abonnes</div>
                      <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>Synchro: {formatDate(acc.lastSync)}</div>
                    </div>
                  ) : null; })()}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleSyncAccount('facebook')} className="fz-btn fz-btn-secondary fz-btn-sm" style={{ flex: 1 }}>Synchroniser</button>
                    <button onClick={() => handleDisconnect('facebook')} className="fz-btn fz-btn-danger fz-btn-sm">Deconnecter</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Access Token</label>
                    <input
                      type="password"
                      value={platformKeys.facebook?.accessToken ?? ''}
                      onChange={e => { const keys = { ...platformKeys, facebook: { accessToken: e.target.value, pageId: platformKeys.facebook?.pageId ?? '', connected: false } }; setPlatformKeys(keys); }}
                      placeholder="Votre access token Meta"
                      className="fz-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Page ID</label>
                    <input
                      type="text"
                      value={platformKeys.facebook?.pageId ?? ''}
                      onChange={e => { const keys = { ...platformKeys, facebook: { accessToken: platformKeys.facebook?.accessToken ?? '', pageId: e.target.value, connected: false } }; setPlatformKeys(keys); }}
                      placeholder="ID de votre page Facebook"
                      className="fz-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <button onClick={() => handleTestConnection('facebook')} disabled={testingPlatform === 'facebook'} className="fz-btn fz-btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#1877f2', color: '#1877f2' }}>
                    {testingPlatform === 'facebook' ? 'Test en cours...' : 'Tester la connexion'}
                  </button>
                </div>
              )}
            </div>

            {/* Twitter / X */}
            <div className="fz-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#1da1f215', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83D\uDC26'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1da1f2' }}>Twitter / X</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>API payante ($100/mois)</div>
                </div>
                <span className={`fz-badge ${platformKeys.twitter?.connected ? 'fz-badge-success' : ''}`}>
                  {platformKeys.twitter?.connected ? 'Connecte' : 'Deconnecte'}
                </span>
              </div>

              {platformKeys.twitter?.connected ? (
                <div>
                  {(() => { const acc = connectedAccounts.find(a => a.platform === 'twitter'); return acc ? (
                    <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{acc.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{acc.followers.toLocaleString()} abonnes</div>
                      <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>Synchro: {formatDate(acc.lastSync)}</div>
                    </div>
                  ) : null; })()}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleSyncAccount('twitter')} className="fz-btn fz-btn-secondary fz-btn-sm" style={{ flex: 1 }}>Synchroniser</button>
                    <button onClick={() => handleDisconnect('twitter')} className="fz-btn fz-btn-danger fz-btn-sm">Deconnecter</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Bearer Token</label>
                    <input
                      type="password"
                      value={platformKeys.twitter?.bearerToken ?? ''}
                      onChange={e => { const keys = { ...platformKeys, twitter: { apiKey: platformKeys.twitter?.apiKey ?? '', apiSecret: platformKeys.twitter?.apiSecret ?? '', bearerToken: e.target.value, connected: false } }; setPlatformKeys(keys); }}
                      placeholder="Bearer Token"
                      className="fz-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <button onClick={() => handleTestConnection('twitter')} disabled={testingPlatform === 'twitter'} className="fz-btn fz-btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#1da1f2', color: '#1da1f2' }}>
                    {testingPlatform === 'twitter' ? 'Test en cours...' : 'Tester la connexion'}
                  </button>
                </div>
              )}
            </div>

            {/* Instagram (via Facebook) */}
            <div className="fz-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#E4405F15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83D\uDCF8'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#E4405F' }}>Instagram</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>Via Facebook Business</div>
                </div>
                <span className={`fz-badge ${platformKeys.facebook?.connected ? 'fz-badge-info' : ''}`}>
                  {platformKeys.facebook?.connected ? 'Via Facebook' : 'Deconnecte'}
                </span>
              </div>
              <div className="fz-info-box" style={{ fontSize: 13 }}>
                <span className="fz-info-box-icon"><span style={{ fontSize: 16 }}>{'\u2139\uFE0F'}</span></span>
                <span>Instagram utilise les memes identifiants que Facebook Business. Connectez votre compte Facebook pour publier sur Instagram.</span>
              </div>
            </div>

            {/* TikTok - Coming soon */}
            <div className="fz-card" style={{ opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#00000010', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83C\uDFB5'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>TikTok</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>Bientot disponible</div>
                </div>
                <span className="fz-badge fz-badge-warning">Prochainement</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.6 }}>
                L&apos;integration TikTok sera disponible dans une future mise a jour.
              </div>
            </div>

            {/* YouTube - Coming soon */}
            <div className="fz-card" style={{ opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#FF000015', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <span style={{ fontSize: 22 }}>{'\uD83D\uDCFA'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FF0000' }}>YouTube</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>Bientot disponible</div>
                </div>
                <span className="fz-badge fz-badge-warning">Prochainement</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.6 }}>
                L&apos;integration YouTube sera disponible dans une future mise a jour.
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="fz-info-box fz-info-box-success" style={{ marginTop: 20 }}>
            <span className="fz-info-box-icon"><span style={{ fontSize: 20 }}>{'\uD83D\uDD12'}</span></span>
            <span>
              <strong>Securite :</strong> Vos cles API sont stockees localement dans votre navigateur (localStorage) et ne sont jamais envoyees a nos serveurs. La connexion utilise une simulation OAuth pour le moment.
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 5: Analytics
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div>
          {/* Summary Stats */}
          <div className="fz-stat-grid" style={{ marginBottom: 24 }}>
            <div className="fz-stat">
              <div className="fz-stat-label">Posts generes</div>
              <div className="fz-stat-value">{analytics.totalPosts}</div>
              <div className="fz-stat-sub">{analytics.monthPosts} ce mois</div>
            </div>
            <div className="fz-stat">
              <div className="fz-stat-label">Caracteres</div>
              <div className="fz-stat-value">
                {analytics.totalChars > 1000 ? `${(analytics.totalChars / 1000).toFixed(1)}k` : analytics.totalChars}
              </div>
              <div className="fz-stat-sub">generes ce mois</div>
            </div>
            <div className="fz-stat">
              <div className="fz-stat-label">Engagement moyen</div>
              <div className="fz-stat-value">{analytics.avgEngagement}</div>
              <div className="fz-stat-sub">interactions / post</div>
            </div>
            <div className="fz-stat">
              <div className="fz-stat-label">Meilleure plateforme</div>
              <div className="fz-stat-value" style={{ fontSize: 20 }}>
                <span style={{ fontSize: 20 }}>{platformEmoji(analytics.bestPlatform)}</span> {PLATFORMS.find(p => p.id === analytics.bestPlatform)?.label ?? '-'}
              </div>
              <div className="fz-stat-sub">{analytics.byPlatform[analytics.bestPlatform] ?? 0} posts</div>
            </div>
          </div>

          {/* Account Analysis */}
          <div className="fz-section" style={{ marginBottom: 24 }}>
            <div className="fz-section-title">Analyse de compte</div>
            <div className="fz-section-desc" style={{ marginBottom: 16 }}>Selectionnez un compte connecte pour lancer une analyse detaillee</div>
            <div className="fz-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Compte</label>
                  <select value={analysisTarget} onChange={e => setAnalysisTarget(e.target.value)} className="fz-select">
                    <option value="">Choisir un compte...</option>
                    {connectedAccounts.map(a => (
                      <option key={a.platform} value={a.platform}>{platformEmoji(a.platform)} {a.username}</option>
                    ))}
                    {PLATFORMS.map(p => (
                      !connectedAccounts.find(a => a.platform === p.id) ? (
                        <option key={p.id} value={p.id}>{p.emoji} {p.label} (demo)</option>
                      ) : null
                    ))}
                  </select>
                </div>
                <button
                  onClick={runAccountAnalysis}
                  disabled={!analysisTarget || isAnalyzing}
                  className="fz-btn fz-btn-primary fz-btn-sm"
                  style={{ opacity: !analysisTarget || isAnalyzing ? 0.5 : 1 }}
                >
                  {isAnalyzing ? 'Analyse...' : 'Lancer l\'analyse'}
                </button>
              </div>

              {isAnalyzing && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: 32, height: 32, margin: '0 auto 12px',
                    border: '3px solid var(--fz-border, #E2E8F0)', borderTopColor: 'var(--accent)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>Analyse en cours...</div>
                </div>
              )}

              {analysisResult && !isAnalyzing && (
                <div style={{ marginTop: 20 }}>
                  <div className="fz-divider" style={{ margin: '0 0 16px' }} />
                  <div className="fz-grid-3" style={{ gap: 12 }}>
                    <div className="fz-stat">
                      <div className="fz-stat-label">Abonnes</div>
                      <div className="fz-stat-value">{analysisResult.followers.toLocaleString()}</div>
                      <div className="fz-stat-sub">Croissance: {analysisResult.growthRate}/mois</div>
                    </div>
                    <div className="fz-stat">
                      <div className="fz-stat-label">Engagement</div>
                      <div className="fz-stat-value">{analysisResult.engagementRate}%</div>
                      <div className="fz-stat-sub">{analysisResult.avgLikes} likes, {analysisResult.avgComments} commentaires</div>
                    </div>
                    <div className="fz-stat">
                      <div className="fz-stat-label">Meilleur horaire</div>
                      <div className="fz-stat-value">{analysisResult.bestPostTime}</div>
                      <div className="fz-stat-sub">Audience: {analysisResult.audienceAge} ans</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', marginBottom: 8 }}>Top hashtags</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {analysisResult.topHashtags.map(tag => (
                        <span key={tag} className="fz-badge fz-badge-accent">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                      <strong>Abonnements:</strong> {analysisResult.following.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                      <strong>Posts:</strong> {analysisResult.totalPosts}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="fz-section" style={{ marginBottom: 24 }}>
            <div className="fz-section-title">Performance des posts</div>
            <div className="fz-section-desc" style={{ marginBottom: 16 }}>Top 5 posts par engagement</div>

            {savedPosts.length === 0 ? (
              <div className="fz-empty">
                <div className="fz-empty-icon"><span style={{ fontSize: 48 }}>{'\uD83D\uDCCA'}</span></div>
                <div className="fz-empty-title">Pas de donnees</div>
                <div className="fz-empty-desc">Generez des posts pour voir leurs performances</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {getTopPerformingPosts().map((post, idx) => (
                  <div key={post.id} className="fz-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: idx < 3 ? 'var(--accent-muted)' : 'var(--fz-bg-secondary, #F8FAFC)',
                      color: idx < 3 ? 'var(--accent)' : 'var(--fz-text-muted, #94A3B8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="fz-badge" style={{ background: `${platformColor(post.platform)}15`, color: platformColor(post.platform) }}>
                          <span style={{ fontSize: 14 }}>{platformEmoji(post.platform)}</span> {post.platform}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 12, color: 'var(--fz-text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {post.content.slice(0, 80)}...
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\u2764\uFE0F'} {post.engagement.likes}</span>
                      <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\uD83D\uDCAC'} {post.engagement.comments}</span>
                      <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{'\uD83D\uDD01'} {post.engagement.shares}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tendances - posting frequency */}
          <div className="fz-section">
            <div className="fz-section-title">Tendances</div>
            <div className="fz-section-desc" style={{ marginBottom: 16 }}>Frequence de publication par jour de la semaine</div>
            <div className="fz-card">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
                {DAYS_FR.map((day, i) => {
                  const count = calendarPosts.filter(p => {
                    const d = new Date(p.date);
                    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    return dow === i;
                  }).length;
                  const maxCount = Math.max(...DAYS_FR.map((_, j) => calendarPosts.filter(p => {
                    const d = new Date(p.date);
                    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    return dow === j;
                  }).length), 1);
                  const height = Math.max((count / maxCount) * 80, 4);
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{count}</span>
                      <div style={{
                        width: '100%', maxWidth: 40, height, borderRadius: 'var(--radius-sm)',
                        background: count > 0 ? 'linear-gradient(180deg, var(--accent), #06b6d4)' : 'var(--fz-bg-secondary, #F8FAFC)',
                        transition: 'height 0.3s ease',
                      }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fz-text-muted, #94A3B8)' }}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="fz-divider" style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                  <strong>Meilleur jour:</strong> {(() => {
                    let bestDay = 'Lundi';
                    let bestCount = 0;
                    DAYS_FR.forEach((day, i) => {
                      const count = calendarPosts.filter(p => { const d = new Date(p.date); const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; return dow === i; }).length;
                      if (count > bestCount) { bestCount = count; bestDay = day; }
                    });
                    return bestDay;
                  })()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                  <strong>Total planifies:</strong> {calendarPosts.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 6: Concurrents
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'competitors' && (
        <div>
          {/* Add Competitor Form */}
          <div className="fz-card" style={{ marginBottom: 20 }}>
            <div className="fz-section-title" style={{ marginBottom: 12 }}>Ajouter un concurrent</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Nom / Username</label>
                <input
                  type="text"
                  value={newCompName}
                  onChange={e => setNewCompName(e.target.value)}
                  placeholder="Ex: HubSpot, Nike..."
                  className="fz-input"
                />
              </div>
              <div style={{ minWidth: 150 }}>
                <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Plateforme</label>
                <select value={newCompPlatform} onChange={e => setNewCompPlatform(e.target.value)} className="fz-select">
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addCompetitor}
                disabled={!newCompName.trim()}
                className="fz-btn fz-btn-primary fz-btn-sm"
                style={{ opacity: newCompName.trim() ? 1 : 0.5 }}
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowCompSearch(!showCompSearch)}
                className="fz-btn fz-btn-secondary fz-btn-sm"
              >
                <span style={{ fontSize: 14 }}>{'\uD83D\uDD0D'}</span> Rechercher
              </button>
            </div>
          </div>

          {/* Search Competitors */}
          {showCompSearch && (
            <div className="fz-card" style={{ marginBottom: 20 }}>
              <div className="fz-section-title" style={{ marginBottom: 12 }}>Rechercher des concurrents</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="fz-section-desc" style={{ marginBottom: 6, display: 'block' }}>Secteur / Mots-cles</label>
                  <input
                    type="text"
                    value={compSearchQuery}
                    onChange={e => setCompSearchQuery(e.target.value)}
                    placeholder="Ex: Marketing digital, SaaS..."
                    className="fz-input"
                  />
                </div>
              </div>

              {compSearchQuery.trim() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getSearchResults().map((result, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)',
                      border: '1px solid var(--fz-border, #E2E8F0)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{platformEmoji(result.platform)}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{result.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                            {PLATFORMS.find(p => p.id === result.platform)?.label} - {result.followers.toLocaleString()} abonnes
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewCompName(result.name);
                          setNewCompPlatform(result.platform);
                          addCompetitor();
                        }}
                        className="fz-btn fz-btn-secondary fz-btn-sm"
                      >
                        + Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Competitors List */}
          {competitors.length === 0 ? (
            <div className="fz-empty">
              <div className="fz-empty-icon"><span style={{ fontSize: 48 }}>{'\uD83C\uDFAF'}</span></div>
              <div className="fz-empty-title">Aucun concurrent suivi</div>
              <div className="fz-empty-desc">Ajoutez des concurrents pour comparer vos performances</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {competitors.map(comp => {
                const isComparing = compareTarget === comp.id;
                return (
                  <div key={comp.id} className="fz-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{platformEmoji(comp.platform)}</span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{comp.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{comp.username} - {PLATFORMS.find(p => p.id === comp.platform)?.label}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => analyzeCompetitor(comp.id)}
                          disabled={analyzingCompId === comp.id}
                          className="fz-btn fz-btn-secondary fz-btn-sm"
                        >
                          {analyzingCompId === comp.id ? 'Analyse...' : 'Analyser'}
                        </button>
                        <button
                          onClick={() => setCompareTarget(isComparing ? null : comp.id)}
                          className={`fz-btn fz-btn-sm ${isComparing ? 'fz-btn-primary' : 'fz-btn-secondary'}`}
                        >
                          {isComparing ? 'Fermer' : 'Comparer'}
                        </button>
                        <button onClick={() => removeCompetitor(comp.id)} className="fz-btn fz-btn-danger fz-btn-sm">
                          <span style={{ fontSize: 14 }}>{'\u2716'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: isComparing ? 16 : 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                        <strong>{comp.followers.toLocaleString()}</strong> abonnes
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                        <strong>{comp.avgEngagement}%</strong> engagement
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                        <strong>{comp.postFrequency}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>
                        Top: <strong>{comp.topContent}</strong>
                      </div>
                    </div>

                    {/* Compare View */}
                    {isComparing && (
                      <div>
                        <div className="fz-divider" style={{ margin: '0 0 16px' }} />
                        <div className="fz-section-title" style={{ fontSize: 13, marginBottom: 12 }}>
                          Comparaison avec votre compte
                        </div>
                        <div className="fz-grid-2" style={{ gap: 12 }}>
                          <div className="fz-stat" style={{ border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)' }}>
                            <div className="fz-stat-label">Vous</div>
                            <div className="fz-stat-value" style={{ fontSize: 18 }}>
                              {(() => {
                                const acc = connectedAccounts.find(a => a.platform === comp.platform);
                                return acc ? acc.followers.toLocaleString() : savedPosts.length;
                              })()}
                            </div>
                            <div className="fz-stat-sub">
                              {connectedAccounts.find(a => a.platform === comp.platform) ? 'abonnes' : 'posts'}
                            </div>
                          </div>
                          <div className="fz-stat" style={{ border: `1px solid ${platformColor(comp.platform)}`, borderRadius: 'var(--radius-md)' }}>
                            <div className="fz-stat-label">{comp.name}</div>
                            <div className="fz-stat-value" style={{ fontSize: 18 }}>{comp.followers.toLocaleString()}</div>
                            <div className="fz-stat-sub">abonnes</div>
                          </div>
                        </div>
                        <div className="fz-grid-2" style={{ gap: 12, marginTop: 12 }}>
                          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', textAlign: 'center' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 4 }}>Votre engagement</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                              {savedPosts.length > 0 ? `${(analytics.avgEngagement / Math.max(savedPosts.length, 1)).toFixed(1)}%` : '0%'}
                            </div>
                          </div>
                          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--fz-bg-secondary, #F8FAFC)', textAlign: 'center' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 4 }}>Engagement concurrent</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: platformColor(comp.platform) }}>
                              {comp.avgEngagement}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
