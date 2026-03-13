'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar, searchInput } from '../../../lib/page-styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Tech' | 'Business' | 'Marketing' | 'IA' | 'Startup' | 'Général';

interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  emoji: string;
  addedAt: string;
}

interface FeedArticle {
  id: string;
  sourceId: string;
  title: string;
  excerpt: string;
  link: string;
  date: string;
  read: boolean;
  bookmarked: boolean;
}

interface VeilleData {
  sources: FeedSource[];
  articles: FeedArticle[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_veille';

const CATEGORIES: Category[] = ['Tech', 'Business', 'Marketing', 'IA', 'Startup', 'Général'];

type FilterMode = 'all' | 'unread' | 'bookmarked';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function loadData(): VeilleData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as VeilleData; } catch { return { sources: [], articles: [] }; }
}
function saveData(data: VeilleData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function seedData(): VeilleData {
  const sources: FeedSource[] = [
    { id: 's1', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech', emoji: '🚀', addedAt: '2026-03-01' },
    { id: 's2', name: 'Le Monde Tech', url: 'https://www.lemonde.fr/technologies/rss_full.xml', category: 'Tech', emoji: '🌍', addedAt: '2026-03-01' },
    { id: 's3', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Tech', emoji: '🟠', addedAt: '2026-03-01' },
    { id: 's4', name: 'Product Hunt', url: 'https://www.producthunt.com/feed', category: 'Startup', emoji: '🐱', addedAt: '2026-03-01' },
    { id: 's5', name: 'Journal du Net', url: 'https://www.journaldunet.com/rss/', category: 'Business', emoji: '📰', addedAt: '2026-03-01' },
    { id: 's6', name: 'Maddyness', url: 'https://www.maddyness.com/feed/', category: 'Startup', emoji: '💡', addedAt: '2026-03-01' },
  ];

  const articles: FeedArticle[] = [
    { id: uid(), sourceId: 's1', title: 'Les startups IA lèvent 2,5 milliards au T1 2026', excerpt: 'Le secteur de l\'intelligence artificielle continue d\'attirer des investissements records, avec une concentration sur les agents autonomes et la génération de contenu.', link: 'https://techcrunch.com/ai-funding-q1-2026', date: '2026-03-12', read: false, bookmarked: false },
    { id: uid(), sourceId: 's1', title: 'OpenAI lance son nouveau modèle multimodal', excerpt: 'La dernière version peut traiter simultanément texte, image, audio et vidéo, ouvrant de nouvelles possibilités pour les applications d\'entreprise.', link: 'https://techcrunch.com/openai-multimodal', date: '2026-03-11', read: false, bookmarked: true },
    { id: uid(), sourceId: 's2', title: 'La France investit 1 milliard dans la souveraineté numérique', excerpt: 'Le gouvernement annonce un plan ambitieux pour réduire la dépendance aux technologies américaines et chinoises dans les secteurs critiques.', link: 'https://lemonde.fr/france-souverainete', date: '2026-03-11', read: true, bookmarked: false },
    { id: uid(), sourceId: 's2', title: 'Cybersécurité : les PME françaises encore vulnérables', excerpt: 'Selon un rapport de l\'ANSSI, 67% des PME ne disposent pas de protection adéquate contre les ransomwares et le phishing.', link: 'https://lemonde.fr/cybersecurite-pme', date: '2026-03-10', read: false, bookmarked: false },
    { id: uid(), sourceId: 's3', title: 'Show HN: Un framework open-source pour agents IA autonomes', excerpt: 'Un développeur indépendant partage son framework permettant de créer des agents IA qui s\'auto-améliorent grâce au feedback humain.', link: 'https://news.ycombinator.com/item?id=12345', date: '2026-03-12', read: false, bookmarked: true },
    { id: uid(), sourceId: 's3', title: 'Comment nous avons réduit nos coûts cloud de 80%', excerpt: 'Retour d\'expérience d\'une startup qui est passée de AWS à un mix bare-metal + edge computing pour servir 10M d\'utilisateurs.', link: 'https://news.ycombinator.com/item?id=12346', date: '2026-03-10', read: true, bookmarked: false },
    { id: uid(), sourceId: 's4', title: 'Produit du jour : Flashboard — l\'OS IA pour PME', excerpt: 'Flashboard propose une suite complète d\'agents IA pour automatiser la gestion d\'entreprise : CRM, facturation, marketing et plus.', link: 'https://producthunt.com/posts/flashboard', date: '2026-03-09', read: false, bookmarked: true },
    { id: uid(), sourceId: 's4', title: 'Les 10 meilleurs outils no-code de mars 2026', excerpt: 'Notre sélection mensuelle des outils no-code les plus innovants pour lancer votre business sans écrire une ligne de code.', link: 'https://producthunt.com/stories/nocode-mars-2026', date: '2026-03-08', read: true, bookmarked: false },
    { id: uid(), sourceId: 's5', title: 'E-commerce : les tendances qui vont dominer 2026', excerpt: 'Social commerce, recommandation IA, livraison par drone — les tendances qui transforment le retail en ligne cette année.', link: 'https://journaldunet.com/ecommerce-2026', date: '2026-03-11', read: false, bookmarked: false },
    { id: uid(), sourceId: 's5', title: 'Le marché du SaaS B2B atteint 300 milliards en Europe', excerpt: 'L\'écosystème SaaS européen poursuit sa croissance, tirée par la transformation digitale des ETI et grands groupes.', link: 'https://journaldunet.com/saas-europe', date: '2026-03-09', read: false, bookmarked: false },
    { id: uid(), sourceId: 's5', title: 'Les métiers du marketing digital les plus recherchés', excerpt: 'Growth hacker, prompt engineer, AI content strategist — les nouveaux profils que les entreprises s\'arrachent.', link: 'https://journaldunet.com/metiers-marketing', date: '2026-03-07', read: true, bookmarked: false },
    { id: uid(), sourceId: 's6', title: 'Station F : 5 startups IA à suivre en 2026', excerpt: 'Notre sélection de pépites françaises de l\'intelligence artificielle hébergées à Station F qui pourraient devenir des licornes.', link: 'https://maddyness.com/stationf-ia-2026', date: '2026-03-12', read: false, bookmarked: false },
    { id: uid(), sourceId: 's6', title: 'Comment lever des fonds en 2026 : le guide complet', excerpt: 'Du pre-seed à la série A : les étapes, les montants, les investisseurs et les erreurs à éviter pour réussir sa levée.', link: 'https://maddyness.com/lever-fonds-2026', date: '2026-03-10', read: false, bookmarked: false },
    { id: uid(), sourceId: 's6', title: 'L\'impact de l\'IA sur l\'emploi en France : état des lieux', excerpt: 'Entre création et destruction d\'emplois, l\'IA transforme le marché du travail français. Analyse chiffrée et perspectives.', link: 'https://maddyness.com/ia-emploi-france', date: '2026-03-08', read: true, bookmarked: false },
    { id: uid(), sourceId: 's6', title: 'La French Tech en chiffres : bilan du premier trimestre', excerpt: 'Nombre de levées, montants, secteurs porteurs — le bilan complet de l\'écosystème startup français au T1 2026.', link: 'https://maddyness.com/frenchtech-q1-2026', date: '2026-03-06', read: true, bookmarked: false },
  ];

  return { sources, articles };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VeillePage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.veille ?? { emoji: '📰', title: 'Veille', subtitle: 'Restez informé', helpText: '' };

  const [data, setData] = useState<VeilleData>({ sources: [], articles: [] });
  const [loaded, setLoaded] = useState(false);

  // Filters
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');

  // Source form
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [srcName, setSrcName] = useState('');
  const [srcUrl, setSrcUrl] = useState('');
  const [srcCategory, setSrcCategory] = useState<Category>('Tech');
  const [srcEmoji, setSrcEmoji] = useState('📡');

  // Refreshing
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const stored = loadData();
    if (stored.sources?.length || stored.articles?.length) {
      setData(stored);
    } else {
      const seed = seedData();
      saveData(seed);
      setData(seed);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((d: VeilleData) => { setData(d); saveData(d); }, []);

  // ── Actions ──
  const toggleRead = (id: string) => {
    persist({ ...data, articles: data.articles.map(a => a.id === id ? { ...a, read: !a.read } : a) });
  };
  const toggleBookmark = (id: string) => {
    persist({ ...data, articles: data.articles.map(a => a.id === id ? { ...a, bookmarked: !a.bookmarked } : a) });
  };
  const addSource = () => {
    if (!srcName.trim() || !srcUrl.trim()) return;
    const source: FeedSource = { id: uid(), name: srcName.trim(), url: srcUrl.trim(), category: srcCategory, emoji: srcEmoji, addedAt: new Date().toISOString().slice(0, 10) };
    persist({ ...data, sources: [...data.sources, source] });
    setShowSourceForm(false);
    setSrcName(''); setSrcUrl('');
  };
  const deleteSource = (id: string) => {
    persist({ ...data, sources: data.sources.filter(s => s.id !== id), articles: data.articles.filter(a => a.sourceId !== id) });
  };
  const refreshFeed = async () => {
    setRefreshing(true);
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (!session.token) { setRefreshing(false); return; }

      const sourceNames = data.sources.map(s => `${s.name} (${s.category})`).join(', ');
      const prompt = `Tu es un assistant de veille technologique. Génère 3 articles d'actualité récents et réalistes pour les sources suivantes : ${sourceNames}.

Réponds UNIQUEMENT en JSON valide (pas de markdown) avec ce format :
[
  {"sourceIndex": 0, "title": "Titre article", "excerpt": "Résumé en 1-2 phrases"},
  {"sourceIndex": 1, "title": "Titre article", "excerpt": "Résumé en 1-2 phrases"},
  {"sourceIndex": 2, "title": "Titre article", "excerpt": "Résumé en 1-2 phrases"}
]

sourceIndex = index dans la liste des sources (0 = première source).
Les articles doivent être crédibles et datés d'aujourd'hui.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 1024,
          agentName: 'fz-veille',
        }),
      });

      if (res.ok) {
        const aiData = await res.json();
        const text = aiData.content || aiData.message || aiData.text || '';
        try {
          const newItems = JSON.parse(text) as { sourceIndex: number; title: string; excerpt: string }[];
          const newArticles: FeedArticle[] = newItems.map(item => ({
            id: uid(),
            sourceId: data.sources[item.sourceIndex]?.id ?? data.sources[0]?.id ?? 's1',
            title: item.title,
            excerpt: item.excerpt,
            link: '#',
            date: new Date().toISOString().slice(0, 10),
            read: false,
            bookmarked: false,
          }));
          persist({ ...data, articles: [...newArticles, ...data.articles] });
        } catch { /* JSON parse error — skip */ }
      }
    } catch { /* network error — skip */ }
    setRefreshing(false);
  };

  // ── Filtering ──
  const getSourceName = (id: string) => data.sources.find(s => s.id === id)?.name ?? 'Source inconnue';
  const getSourceEmoji = (id: string) => data.sources.find(s => s.id === id)?.emoji ?? '📄';
  const getSourceCategory = (id: string) => data.sources.find(s => s.id === id)?.category ?? 'Général';

  const filteredArticles = data.articles.filter(a => {
    if (filterSource !== 'all' && a.sourceId !== filterSource) return false;
    if (filterCategory !== 'all' && getSourceCategory(a.sourceId) !== filterCategory) return false;
    if (filterMode === 'unread' && a.read) return false;
    if (filterMode === 'bookmarked' && !a.bookmarked) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const unreadCount = data.articles.filter(a => !a.read).length;
  const bookmarkedCount = data.articles.filter(a => a.bookmarked).length;

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: CU.textSecondary }}>Chargement...</div>;

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{pageMeta.emoji}</span>
            <h1 style={CU.pageTitle}>
              <span className="fz-logo-word">{pageMeta.title}</span>
            </h1>
            <HelpBubble text={pageMeta.helpText} />
          </div>
          <p style={CU.pageSubtitle}>{pageMeta.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={refreshFeed} disabled={refreshing} style={{ ...CU.btnGhost, opacity: refreshing ? 0.6 : 1 }}>
            {refreshing ? '⏳ Actualisation...' : '🔄 Actualiser'}
          </button>
          <button onClick={() => setShowSourceForm(true)} style={CU.btnPrimary}>➕ Source</button>
        </div>
      </div>
      <PageExplanation pageId="veille" text={pageMeta.helpText} />

      {/* Info banner */}
      <div style={{ ...CU.card, padding: 12, marginBottom: 16, background: '#fefce8', border: '1px solid #fef08a', fontSize: 12, color: '#854d0e' }}>
        💡 Connectez vos flux RSS pour des articles en temps réel. Les articles affichés sont des exemples de démonstration.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Articles', value: String(data.articles.length), emoji: '📄' },
          { label: 'Non lus', value: String(unreadCount), emoji: '🔵' },
          { label: 'Favoris', value: String(bookmarkedCount), emoji: '⭐' },
          { label: 'Sources', value: String(data.sources.length), emoji: '📡' },
        ].map(s => (
          <div key={s.label} style={{ ...CU.card, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.emoji}</div>
            <div style={CU.statValue}>{s.value}</div>
            <div style={CU.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={toolbar()}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..." style={{ ...searchInput(isMobile), maxWidth: 200 }} />
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...CU.select, height: 32, fontSize: 11, padding: '0 6px' }}>
          <option value="all">Toutes les sources</option>
          {data.sources.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...CU.select, height: 32, fontSize: 11, padding: '0 6px' }}>
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {([['all', 'Tous'], ['unread', 'Non lus'], ['bookmarked', 'Favoris']] as [FilterMode, string][]).map(([mode, label]) => (
            <button key={mode} onClick={() => setFilterMode(mode)}
              style={filterMode === mode ? { ...CU.btnSmall, background: CU.accent, color: '#fff', border: `1px solid ${CU.accent}` } : CU.btnSmall}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Source form */}
      {showSourceForm && (
        <div style={CU.overlay} onClick={() => setShowSourceForm(false)}>
          <div style={{ ...CU.modal, maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 16 }}>Ajouter une source</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={CU.label}>Nom</label><input value={srcName} onChange={e => setSrcName(e.target.value)} style={CU.input} placeholder="Ex: Mon Blog Tech" /></div>
              <div><label style={CU.label}>URL du flux RSS</label><input value={srcUrl} onChange={e => setSrcUrl(e.target.value)} style={CU.input} placeholder="https://example.com/rss" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={CU.label}>Catégorie</label>
                  <select value={srcCategory} onChange={e => setSrcCategory(e.target.value as Category)} style={{ ...CU.select, width: '100%' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={CU.label}>Emoji</label>
                  <input value={srcEmoji} onChange={e => setSrcEmoji(e.target.value)} style={CU.input} maxLength={2} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowSourceForm(false)} style={CU.btnGhost}>Annuler</button>
              <button onClick={addSource} style={CU.btnPrimary}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Sources sidebar (collapsed on mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: 16 }}>
        {/* Sources list */}
        <div>
          <div style={CU.sectionTitle}>Sources ({data.sources.length})</div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 6, overflowX: isMobile ? 'auto' : undefined, flexWrap: isMobile ? 'nowrap' : undefined, marginTop: 8 }}>
            {data.sources.map(s => {
              const articleCount = data.articles.filter(a => a.sourceId === s.id).length;
              const unread = data.articles.filter(a => a.sourceId === s.id && !a.read).length;
              return (
                <div key={s.id} style={{
                  ...CU.card, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  minWidth: isMobile ? 160 : undefined, cursor: 'pointer',
                  background: filterSource === s.id ? CU.bgSecondary : CU.bg,
                }} onClick={() => setFilterSource(filterSource === s.id ? 'all' : s.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: CU.text }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: CU.textMuted }}>{articleCount} articles{unread > 0 ? ` (${unread} new)` : ''}</div>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteSource(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#ef4444' }}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Articles */}
        <div>
          <div style={CU.sectionTitle}>
            Articles ({filteredArticles.length})
          </div>
          {filteredArticles.length === 0 ? (
            <div style={{ ...CU.card, ...CU.emptyState }}>
              <span style={CU.emptyEmoji}>📄</span>
              <div style={CU.emptyTitle}>Aucun article trouvé</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {filteredArticles.map(article => (
                <div key={article.id} style={{
                  ...CU.card, padding: isMobile ? 12 : 16,
                  opacity: article.read ? 0.7 : 1,
                  borderLeft: article.bookmarked ? '3px solid #f59e0b' : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{getSourceEmoji(article.sourceId)}</span>
                        <span style={{ fontSize: 11, color: CU.textSecondary }}>{getSourceName(article.sourceId)}</span>
                        <span style={{ fontSize: 10, color: CU.textMuted }}>{article.date}</span>
                        {!article.read && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#3b82f6', display: 'inline-block' }} />}
                      </div>
                      <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: CU.text, textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                        {article.title}
                      </a>
                      <div style={{ fontSize: 12, color: CU.textSecondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.excerpt}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => toggleBookmark(article.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title={article.bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                        {article.bookmarked ? '⭐' : '☆'}
                      </button>
                      <button onClick={() => toggleRead(article.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }} title={article.read ? 'Marquer comme non lu' : 'Marquer comme lu'}>
                        {article.read ? '📖' : '📕'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
