'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, tabBar } from '../../../lib/page-styles';
import PageBlogSection from '@/components/blog/PageBlogSection';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoFactor {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

interface SeoAnalysis {
  id: string;
  url: string;
  score: number;
  factors: SeoFactor[];
  analyzedAt: string;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  volume: number;
  addedAt: string;
}

interface SeoData {
  analyses: SeoAnalysis[];
  keywords: TrackedKeyword[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_seo';

type TabId = 'analyse' | 'keywords' | 'contenu';
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'analyse', label: 'Analyse SEO', emoji: '🔍' },
  { id: 'keywords', label: 'Mots-cles', emoji: '🎯' },
  { id: 'contenu', label: 'Optimiseur', emoji: '✍️' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function loadData(): SeoData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as SeoData; } catch { return { analyses: [], keywords: [] }; }
}
function saveData(data: SeoData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

async function analyzeWithAI(url: string): Promise<SeoAnalysis> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  if (!session.token) {
    throw new Error('Connectez-vous pour analyser');
  }

  const prompt = `Tu es un expert SEO. Analyse l'URL suivante et donne un audit SEO structuré.

URL : ${url}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec ce format exact :
{
  "factors": [
    {"id": "title", "label": "Titre de page", "passed": true, "detail": "Explication courte"},
    {"id": "meta", "label": "Meta description", "passed": false, "detail": "Explication courte"},
    {"id": "h1", "label": "H1 unique", "passed": true, "detail": "Explication courte"},
    {"id": "alt", "label": "Images avec alt text", "passed": false, "detail": "Explication courte"},
    {"id": "https", "label": "HTTPS", "passed": true, "detail": "Explication courte"},
    {"id": "mobile", "label": "Mobile-friendly", "passed": true, "detail": "Explication courte"},
    {"id": "speed", "label": "Vitesse de chargement", "passed": true, "detail": "Explication courte"},
    {"id": "links", "label": "Liens internes", "passed": false, "detail": "Explication courte"}
  ]
}

Base ton analyse sur le nom de domaine et les bonnes pratiques SEO standards. Sois réaliste.`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: session.token,
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1024,
      agentName: 'fz-seo',
    }),
  });

  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  const text = data.content || data.message || data.text || '';

  try {
    const parsed = JSON.parse(text);
    const factors: SeoFactor[] = parsed.factors || [];
    const passedCount = factors.filter(f => f.passed).length;
    const score = Math.round((passedCount / factors.length) * 100);
    return { id: uid(), url, score, factors, analyzedAt: new Date().toISOString().slice(0, 10) };
  } catch {
    // Fallback if AI doesn't return valid JSON
    const factors: SeoFactor[] = [
      { id: 'title', label: 'Titre de page', passed: url.includes('.'), detail: 'Analyse basée sur l\'URL' },
      { id: 'https', label: 'HTTPS', passed: url.startsWith('https'), detail: url.startsWith('https') ? 'HTTPS activé' : 'HTTP non sécurisé' },
    ];
    return { id: uid(), url, score: url.startsWith('https') ? 50 : 25, factors, analyzedAt: new Date().toISOString().slice(0, 10) };
  }
}

async function researchKeywordsWithAI(topic: string): Promise<{ keyword: string; volume: number }[]> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  if (!session.token) {
    throw new Error('Connectez-vous pour rechercher');
  }

  const prompt = `Tu es un expert SEO. Suggère 10 mots-clés pertinents pour le sujet "${topic}" en français.

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec ce format :
[
  {"keyword": "mot clé 1", "volume": 2400},
  {"keyword": "mot clé 2", "volume": 1800}
]

Estime les volumes de recherche mensuels de façon réaliste pour le marché français.`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: session.token,
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1024,
      agentName: 'fz-seo',
    }),
  });

  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  const text = data.content || data.message || data.text || '';

  try {
    return JSON.parse(text);
  } catch {
    // Fallback
    return [{ keyword: topic.toLowerCase(), volume: 1000 }];
  }
}

function seedData(): SeoData {
  const factors: SeoFactor[] = [
    { id: 'title', label: 'Titre de page', passed: true, detail: 'Titre present et optimise (45 caracteres)' },
    { id: 'meta', label: 'Meta description', passed: true, detail: 'Meta description de 155 caracteres, bien optimisee' },
    { id: 'h1', label: 'H1 unique', passed: true, detail: 'H1 unique contenant le mot-cle principal' },
    { id: 'alt', label: 'Images avec alt text', passed: false, detail: 'Certaines images manquent d\'attribut alt' },
    { id: 'https', label: 'HTTPS', passed: true, detail: 'Connexion securisee SSL/TLS' },
    { id: 'mobile', label: 'Mobile-friendly', passed: true, detail: 'Design responsive, viewport bien configure' },
    { id: 'speed', label: 'Vitesse de chargement', passed: true, detail: 'Temps de chargement < 2 secondes' },
    { id: 'links', label: 'Liens internes', passed: false, detail: 'Maillage interne a ameliorer (3 liens)' },
  ];
  const passedCount = factors.filter(f => f.passed).length;
  const score = Math.round((passedCount / factors.length) * 100);
  const analysis: SeoAnalysis = { id: uid(), url: 'https://freenzy.io', score, factors, analyzedAt: '2026-03-10' };

  const keywords: TrackedKeyword[] = [
    { id: uid(), keyword: 'assistant ia entreprise', position: 12, previousPosition: 18, volume: 2400, addedAt: '2026-03-01' },
    { id: uid(), keyword: 'automatisation business', position: 8, previousPosition: 8, volume: 5100, addedAt: '2026-03-01' },
    { id: uid(), keyword: 'chatbot francais', position: 23, previousPosition: 19, volume: 3200, addedAt: '2026-03-05' },
    { id: uid(), keyword: 'crm ia gratuit', position: 5, previousPosition: 9, volume: 1800, addedAt: '2026-03-08' },
    { id: uid(), keyword: 'agent ia autonome', position: 31, previousPosition: 45, volume: 890, addedAt: '2026-03-10' },
  ];

  return { analyses: [analysis], keywords };
}

function scoreColor(score: number): string {
  if (score >= 80) return CU.success;
  if (score >= 50) return CU.warning;
  return CU.danger;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeoPage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.seo ?? { emoji: '🔍', title: 'SEO Tracker', subtitle: 'Optimisez votre visibilite', helpText: '' };

  const [data, setData] = useState<SeoData>({ analyses: [], keywords: [] });
  const [tab, setTab] = useState<TabId>('analyse');
  const [loaded, setLoaded] = useState(false);

  // Analyse
  const [analyseUrl, setAnalyseUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<SeoAnalysis | null>(null);

  // Keywords
  const [newKeyword, setNewKeyword] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [researchResults, setResearchResults] = useState<{ keyword: string; volume: number }[]>([]);

  // Content optimizer
  const [contentText, setContentText] = useState('');
  const [contentResult, setContentResult] = useState<{ wordCount: number; sentences: number; readability: string; keywordDensity: Record<string, number> } | null>(null);

  useEffect(() => {
    const stored = loadData();
    if (stored.analyses?.length || stored.keywords?.length) {
      setData(stored);
      if (stored.analyses.length) setCurrentAnalysis(stored.analyses[stored.analyses.length - 1]);
    } else {
      const seed = seedData();
      saveData(seed);
      setData(seed);
      setCurrentAnalysis(seed.analyses[0]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((d: SeoData) => { setData(d); saveData(d); }, []);

  // ── Actions ──
  const runAnalysis = async () => {
    if (!analyseUrl.trim()) return;
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const result = await analyzeWithAI(analyseUrl.trim());
      const updated = { ...data, analyses: [...data.analyses, result] };
      persist(updated);
      setCurrentAnalysis(result);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Erreur d\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw: TrackedKeyword = {
      id: uid(), keyword: newKeyword.trim().toLowerCase(),
      position: 0, previousPosition: 0, volume: 0,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    const updated = { ...data, keywords: [...data.keywords, kw] };
    persist(updated);
    setNewKeyword('');
  };

  const deleteKeyword = (id: string) => persist({ ...data, keywords: data.keywords.filter(k => k.id !== id) });

  const doResearch = async () => {
    if (!researchTopic.trim()) return;
    try {
      const results = await researchKeywordsWithAI(researchTopic.trim());
      setResearchResults(results);
    } catch {
      setResearchResults([]);
    }
  };

  const analyzeContent = () => {
    if (!contentText.trim()) return;
    const words = contentText.trim().split(/\s+/);
    const wordCount = words.length;
    const sentences = contentText.split(/[.!?]+/).filter(s => s.trim()).length;
    // simple keyword density
    const freq: Record<string, number> = {};
    words.forEach(w => {
      const key = w.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿç]/g, '');
      if (key.length > 3) freq[key] = (freq[key] ?? 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const density: Record<string, number> = {};
    sorted.forEach(([k, v]) => { density[k] = Math.round((v / wordCount) * 10000) / 100; });

    let readability = 'Facile';
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : wordCount;
    if (avgWordsPerSentence > 25) readability = 'Difficile';
    else if (avgWordsPerSentence > 18) readability = 'Moyen';

    setContentResult({ wordCount, sentences, readability, keywordDensity: density });
  };

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: CU.textSecondary }}>Chargement...</div>;

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{pageMeta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={CU.pageTitle}>{pageMeta.title}</h1>
              <HelpBubble text={pageMeta.helpText} />
            </div>
            <p style={CU.pageSubtitle}>{pageMeta.subtitle}</p>
          </div>
        </div>
      </div>
      <PageExplanation pageId="seo" text={pageMeta.helpText} />

      {/* Tabs */}
      <div style={tabBar()}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={tab === t.id ? CU.tabActive : CU.tab}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Analyse Tab ── */}
      {tab === 'analyse' && (
        <>
          {/* URL input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input value={analyseUrl} onChange={e => setAnalyseUrl(e.target.value)} placeholder="https://example.com" style={{ ...CU.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && runAnalysis()} />
            <button onClick={runAnalysis} disabled={analyzing} style={{ ...CU.btnPrimary, opacity: analyzing ? 0.6 : 1 }}>
              {analyzing ? '⏳ Analyse...' : '🔍 Analyser'}
            </button>
          </div>

          {currentAnalysis && (
            <>
              {/* Score gauge */}
              <div style={{ ...CU.card, padding: isMobile ? 16 : 24, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 8 }}>{currentAnalysis.url}</div>
                <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px', borderRadius: '50%', background: `conic-gradient(${scoreColor(currentAnalysis.score)} ${currentAnalysis.score * 3.6}deg, ${CU.border} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: CU.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ ...CU.statValue, color: scoreColor(currentAnalysis.score) }}>{currentAnalysis.score}</span>
                    <span style={{ fontSize: 10, color: CU.textSecondary }}>/100</span>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: scoreColor(currentAnalysis.score) }}>
                  {currentAnalysis.score >= 80 ? 'Excellent' : currentAnalysis.score >= 50 ? 'A ameliorer' : 'Critique'}
                </div>
              </div>

              {/* Factors checklist */}
              <div style={{ ...CU.card, padding: isMobile ? 12 : 16, marginBottom: 20 }}>
                <div style={CU.sectionTitle}>Facteurs SEO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {currentAnalysis.factors.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 8, borderRadius: 6, background: f.passed ? '#f0fdf4' : '#fef2f2' }}>
                      <span style={{ fontSize: 16 }}>{f.passed ? '✅' : '❌'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: f.passed ? '#166534' : '#991b1b' }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: CU.textSecondary }}>{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* History */}
          {data.analyses.length > 1 && (
            <div style={{ ...CU.card, padding: isMobile ? 12 : 16 }}>
              <div style={CU.sectionTitle}>Historique des analyses</div>
              <div style={{ marginTop: 8 }}>
                {data.analyses.slice().reverse().map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${CU.bgSecondary}`, cursor: 'pointer' }} onClick={() => setCurrentAnalysis(a)}>
                    <div style={{ fontSize: 12 }}>{a.url}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: CU.textMuted }}>{a.analyzedAt}</span>
                      <span style={{ fontWeight: 700, color: scoreColor(a.score) }}>{a.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Keywords Tab ── */}
      {tab === 'keywords' && (
        <>
          {/* Add keyword */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Ajouter un mot-cle a suivre" style={{ ...CU.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
            <button onClick={addKeyword} style={CU.btnPrimary}>➕ Suivre</button>
          </div>

          {/* Tracked keywords */}
          <div style={{ ...CU.card, padding: isMobile ? 12 : 16, marginBottom: 20 }}>
            <div style={CU.sectionTitle}>Mots-cles suivis</div>
            {data.keywords.length === 0 ? (
              <div style={{ color: CU.textSecondary, fontSize: 12, marginTop: 8 }}>Aucun mot-cle suivi</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${CU.border}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Mot-cle</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>Position</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>Evolution</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>Volume</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.keywords.map(kw => {
                    const diff = kw.previousPosition - kw.position;
                    return (
                      <tr key={kw.id} style={{ borderBottom: `1px solid ${CU.bgSecondary}` }}>
                        <td style={{ padding: '8px 4px', fontWeight: 500 }}>{kw.keyword}</td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <span style={{ fontWeight: 700, color: kw.position <= 10 ? CU.success : kw.position <= 30 ? CU.warning : CU.textSecondary }}>{kw.position}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          {diff > 0 && <span style={{ color: CU.success, fontWeight: 600 }}>↑{diff}</span>}
                          {diff < 0 && <span style={{ color: CU.danger, fontWeight: 600 }}>↓{Math.abs(diff)}</span>}
                          {diff === 0 && <span style={{ color: CU.textMuted }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 4px', color: CU.textSecondary }}>{kw.volume.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px 4px' }}>
                          <button onClick={() => deleteKeyword(kw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.danger, fontSize: 12 }}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Keyword research */}
          <div style={{ ...CU.card, padding: isMobile ? 12 : 16 }}>
            <div style={CU.sectionTitle}>Recherche de mots-cles</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12 }}>
              <input value={researchTopic} onChange={e => setResearchTopic(e.target.value)} placeholder="Entrez un sujet..." style={{ ...CU.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && doResearch()} />
              <button onClick={doResearch} style={CU.btnPrimary}>🔎 Rechercher</button>
            </div>
            {researchResults.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${CU.border}` }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px' }}>Suggestion</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Volume estime</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {researchResults.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${CU.bgSecondary}` }}>
                      <td style={{ padding: '6px 4px' }}>{r.keyword}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: CU.textSecondary }}>{r.volume.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>
                        <button onClick={() => { setNewKeyword(r.keyword); addKeyword(); }} style={CU.btnSmall}>➕ Suivre</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── Content Optimizer Tab ── */}
      {tab === 'contenu' && (
        <>
          <div style={{ ...CU.card, padding: isMobile ? 12 : 16, marginBottom: 20 }}>
            <div style={CU.sectionTitle}>Optimiseur de contenu</div>
            <p style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 12, marginTop: 8 }}>Collez votre texte ci-dessous pour obtenir une analyse de lisibilite et de densite de mots-cles.</p>
            <textarea value={contentText} onChange={e => setContentText(e.target.value)} rows={8} style={{ ...CU.textarea, marginBottom: 12 }} placeholder="Collez votre texte ici..." />
            <button onClick={analyzeContent} style={CU.btnPrimary}>📊 Analyser le contenu</button>
          </div>

          {contentResult && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div style={{ ...CU.card, padding: 16 }}>
                <div style={CU.sectionTitle}>Statistiques</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: CU.textSecondary }}>Nombre de mots</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.wordCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: CU.textSecondary }}>Phrases</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.sentences}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: CU.textSecondary }}>Lisibilite</span>
                    <span style={{ fontWeight: 600, color: contentResult.readability === 'Facile' ? CU.success : contentResult.readability === 'Moyen' ? CU.warning : CU.danger }}>
                      {contentResult.readability}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: CU.textSecondary }}>Mots/phrase (moy.)</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.sentences > 0 ? Math.round(contentResult.wordCount / contentResult.sentences) : '—'}</span>
                  </div>
                </div>
              </div>
              <div style={{ ...CU.card, padding: 16 }}>
                <div style={CU.sectionTitle}>Densite des mots-cles (top 10)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  {Object.entries(contentResult.keywordDensity).map(([word, pct]) => (
                    <div key={word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>{word}</span>
                      <span style={{ color: CU.textSecondary }}>{pct}%</span>
                    </div>
                  ))}
                  {Object.keys(contentResult.keywordDensity).length === 0 && (
                    <div style={{ color: CU.textMuted, fontSize: 12 }}>Pas assez de contenu</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <PageBlogSection pageId="seo" />
    </div>
  );
}
