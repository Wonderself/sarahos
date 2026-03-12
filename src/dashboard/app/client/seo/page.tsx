'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

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
  { id: 'keywords', label: 'Mots-clés', emoji: '🎯' },
  { id: 'contenu', label: 'Optimiseur', emoji: '✍️' },
];

const CU = {
  card: { border: '1px solid #E5E5E5' as const, borderRadius: 8, background: '#fff' },
  btn: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: '1px solid #E5E5E5' as const, background: '#fff' as const,
  },
  btnPrimary: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: 'none' as const, background: '#1A1A1A', color: '#fff',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function loadData(): SeoData {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as SeoData; } catch { return { analyses: [], keywords: [] }; }
}
function saveData(data: SeoData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function simulateAnalysis(url: string): SeoAnalysis {
  const factors: SeoFactor[] = [
    { id: 'title', label: 'Titre de page', passed: Math.random() > 0.2, detail: 'Titre présent et de bonne longueur (50-60 caractères)' },
    { id: 'meta', label: 'Meta description', passed: Math.random() > 0.3, detail: 'Meta description entre 150 et 160 caractères' },
    { id: 'h1', label: 'H1 unique', passed: Math.random() > 0.25, detail: 'Un seul H1 par page, contenant le mot-clé principal' },
    { id: 'alt', label: 'Images avec alt text', passed: Math.random() > 0.4, detail: 'Toutes les images ont un attribut alt descriptif' },
    { id: 'https', label: 'HTTPS', passed: url.startsWith('https') || Math.random() > 0.1, detail: 'Connexion sécurisée SSL/TLS' },
    { id: 'mobile', label: 'Mobile-friendly', passed: Math.random() > 0.2, detail: 'Design responsive, viewport meta tag configuré' },
    { id: 'speed', label: 'Vitesse de chargement', passed: Math.random() > 0.35, detail: 'Temps de chargement < 3 secondes' },
    { id: 'links', label: 'Liens internes', passed: Math.random() > 0.3, detail: 'Maillage interne suffisant (5+ liens internes)' },
  ];
  const passedCount = factors.filter(f => f.passed).length;
  const score = Math.round((passedCount / factors.length) * 100);
  return { id: uid(), url, score, factors, analyzedAt: new Date().toISOString().slice(0, 10) };
}

function simulateKeywordResearch(topic: string): { keyword: string; volume: number }[] {
  const suffixes = [
    '', ' gratuit', ' en ligne', ' avis', ' prix', ' comparatif',
    ' tutoriel', ' débutant', ' 2026', ' meilleur',
  ];
  return suffixes.map(s => ({
    keyword: topic.toLowerCase() + s,
    volume: Math.floor(Math.random() * 10000) + 100,
  }));
}

function seedData(): SeoData {
  const analysis = simulateAnalysis('https://freenzy.io');
  // make it more realistic
  analysis.factors[0].passed = true;
  analysis.factors[1].passed = true;
  analysis.factors[4].passed = true;
  analysis.factors[5].passed = true;
  analysis.score = Math.round((analysis.factors.filter(f => f.passed).length / analysis.factors.length) * 100);

  const keywords: TrackedKeyword[] = [
    { id: uid(), keyword: 'assistant ia entreprise', position: 12, previousPosition: 18, volume: 2400, addedAt: '2026-03-01' },
    { id: uid(), keyword: 'automatisation business', position: 8, previousPosition: 8, volume: 5100, addedAt: '2026-03-01' },
    { id: uid(), keyword: 'chatbot français', position: 23, previousPosition: 19, volume: 3200, addedAt: '2026-03-05' },
    { id: uid(), keyword: 'crm ia gratuit', position: 5, previousPosition: 9, volume: 1800, addedAt: '2026-03-08' },
    { id: uid(), keyword: 'agent ia autonome', position: 31, previousPosition: 45, volume: 890, addedAt: '2026-03-10' },
  ];

  return { analyses: [analysis], keywords };
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeoPage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.seo ?? { emoji: '🔍', title: 'SEO Tracker', subtitle: 'Optimisez votre visibilité', helpText: '' };

  const [data, setData] = useState<SeoData>({ analyses: [], keywords: [] });
  const [tab, setTab] = useState<TabId>('analyse');
  const [loaded, setLoaded] = useState(false);

  // Analyse
  const [analyseUrl, setAnalyseUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
    fontSize: 13, background: '#fff', color: '#1A1A1A', outline: 'none',
  };

  // ── Actions ──
  const runAnalysis = () => {
    if (!analyseUrl.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = simulateAnalysis(analyseUrl.trim());
      const updated = { ...data, analyses: [...data.analyses, result] };
      persist(updated);
      setCurrentAnalysis(result);
      setAnalyzing(false);
    }, 1200);
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw: TrackedKeyword = {
      id: uid(), keyword: newKeyword.trim().toLowerCase(),
      position: Math.floor(Math.random() * 80) + 1,
      previousPosition: Math.floor(Math.random() * 80) + 1,
      volume: Math.floor(Math.random() * 5000) + 200,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    const updated = { ...data, keywords: [...data.keywords, kw] };
    persist(updated);
    setNewKeyword('');
  };

  const deleteKeyword = (id: string) => persist({ ...data, keywords: data.keywords.filter(k => k.id !== id) });

  const doResearch = () => {
    if (!researchTopic.trim()) return;
    setResearchResults(simulateKeywordResearch(researchTopic.trim()));
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

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Chargement...</div>;

  return (
    <div className="client-page-scrollable">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{pageMeta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>
                <span className="fz-logo-word">{pageMeta.title}</span>
              </h1>
              <HelpBubble text={pageMeta.helpText} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{pageMeta.subtitle}</p>
          </div>
        </div>
      </div>
      <PageExplanation pageId="seo" text={pageMeta.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E5E5E5' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...CU.btn, border: 'none', borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent', borderRadius: 0, background: 'transparent', color: tab === t.id ? '#1A1A1A' : '#6B6B6B', fontWeight: tab === t.id ? 600 : 400 }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Analyse Tab ── */}
      {tab === 'analyse' && (
        <>
          {/* URL input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input value={analyseUrl} onChange={e => setAnalyseUrl(e.target.value)} placeholder="https://example.com" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && runAnalysis()} />
            <button onClick={runAnalysis} disabled={analyzing} style={{ ...CU.btnPrimary, opacity: analyzing ? 0.6 : 1 }}>
              {analyzing ? '⏳ Analyse...' : '🔍 Analyser'}
            </button>
          </div>

          {currentAnalysis && (
            <>
              {/* Score gauge */}
              <div style={{ ...CU.card, padding: isMobile ? 16 : 24, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 8 }}>{currentAnalysis.url}</div>
                <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px', borderRadius: '50%', background: `conic-gradient(${scoreColor(currentAnalysis.score)} ${currentAnalysis.score * 3.6}deg, #E5E5E5 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: scoreColor(currentAnalysis.score) }}>{currentAnalysis.score}</span>
                    <span style={{ fontSize: 10, color: '#6B6B6B' }}>/100</span>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: scoreColor(currentAnalysis.score) }}>
                  {currentAnalysis.score >= 80 ? 'Excellent' : currentAnalysis.score >= 50 ? 'À améliorer' : 'Critique'}
                </div>
              </div>

              {/* Factors checklist */}
              <div style={{ ...CU.card, padding: isMobile ? 12 : 16, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Facteurs SEO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentAnalysis.factors.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 8, borderRadius: 6, background: f.passed ? '#f0fdf4' : '#fef2f2' }}>
                      <span style={{ fontSize: 16 }}>{f.passed ? '✅' : '❌'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: f.passed ? '#166534' : '#991b1b' }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>{f.detail}</div>
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
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Historique des analyses</div>
              {data.analyses.slice().reverse().map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => setCurrentAnalysis(a)}>
                  <div style={{ fontSize: 12 }}>{a.url}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#9B9B9B' }}>{a.analyzedAt}</span>
                    <span style={{ fontWeight: 700, color: scoreColor(a.score) }}>{a.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Keywords Tab ── */}
      {tab === 'keywords' && (
        <>
          {/* Add keyword */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Ajouter un mot-clé à suivre" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
            <button onClick={addKeyword} style={CU.btnPrimary}>➕ Suivre</button>
          </div>

          {/* Tracked keywords */}
          <div style={{ ...CU.card, padding: isMobile ? 12 : 16, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Mots-clés suivis</div>
            {data.keywords.length === 0 ? (
              <div style={{ color: '#6B6B6B', fontSize: 12 }}>Aucun mot-clé suivi</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Mot-clé</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>Position</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px' }}>Évolution</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>Volume</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.keywords.map(kw => {
                    const diff = kw.previousPosition - kw.position;
                    return (
                      <tr key={kw.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 500 }}>{kw.keyword}</td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <span style={{ fontWeight: 700, color: kw.position <= 10 ? '#22c55e' : kw.position <= 30 ? '#f59e0b' : '#6B6B6B' }}>{kw.position}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                          {diff > 0 && <span style={{ color: '#22c55e', fontWeight: 600 }}>↑{diff}</span>}
                          {diff < 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>↓{Math.abs(diff)}</span>}
                          {diff === 0 && <span style={{ color: '#9B9B9B' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 4px', color: '#6B6B6B' }}>{kw.volume.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px 4px' }}>
                          <button onClick={() => deleteKeyword(kw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>🗑️</button>
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
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recherche de mots-clés</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={researchTopic} onChange={e => setResearchTopic(e.target.value)} placeholder="Entrez un sujet..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && doResearch()} />
              <button onClick={doResearch} style={CU.btnPrimary}>🔎 Rechercher</button>
            </div>
            {researchResults.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px' }}>Suggestion</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Volume estimé</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {researchResults.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 4px' }}>{r.keyword}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: '#6B6B6B' }}>{r.volume.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>
                        <button onClick={() => { setNewKeyword(r.keyword); addKeyword(); }} style={{ ...CU.btn, height: 24, fontSize: 10 }}>➕ Suivre</button>
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
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Optimiseur de contenu</div>
            <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 12 }}>Collez votre texte ci-dessous pour obtenir une analyse de lisibilité et de densité de mots-clés.</p>
            <textarea value={contentText} onChange={e => setContentText(e.target.value)} rows={8} style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }} placeholder="Collez votre texte ici..." />
            <button onClick={analyzeContent} style={CU.btnPrimary}>📊 Analyser le contenu</button>
          </div>

          {contentResult && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div style={{ ...CU.card, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Statistiques</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B6B6B' }}>Nombre de mots</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.wordCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B6B6B' }}>Phrases</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.sentences}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B6B6B' }}>Lisibilité</span>
                    <span style={{ fontWeight: 600, color: contentResult.readability === 'Facile' ? '#22c55e' : contentResult.readability === 'Moyen' ? '#f59e0b' : '#ef4444' }}>
                      {contentResult.readability}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B6B6B' }}>Mots/phrase (moy.)</span>
                    <span style={{ fontWeight: 600 }}>{contentResult.sentences > 0 ? Math.round(contentResult.wordCount / contentResult.sentences) : '—'}</span>
                  </div>
                </div>
              </div>
              <div style={{ ...CU.card, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Densité des mots-clés (top 10)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(contentResult.keywordDensity).map(([word, pct]) => (
                    <div key={word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>{word}</span>
                      <span style={{ color: '#6B6B6B' }}>{pct}%</span>
                    </div>
                  ))}
                  {Object.keys(contentResult.keywordDensity).length === 0 && (
                    <div style={{ color: '#9B9B9B', fontSize: 12 }}>Pas assez de contenu</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
