'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, tabBar } from '../../../lib/page-styles';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Traduction
//  Traduisez vos textes en 50+ langues avec l'IA
// ═══════════════════════════════════════════════════

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isFavorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'fz_translations';

const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect', flag: '🔍' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.code !== 'auto');

// Real translation via Claude AI
async function translateWithAI(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  if (!session.token) {
    throw new Error('Connectez-vous pour traduire avec l\'IA');
  }

  const srcLabel = LANGUAGES.find(l => l.code === sourceLang)?.label ?? sourceLang;
  const tgtLabel = LANGUAGES.find(l => l.code === targetLang)?.label ?? targetLang;

  const prompt = `Tu es un traducteur professionnel. Traduis le texte suivant${sourceLang !== 'auto' ? ` du ${srcLabel}` : ''} vers le ${tgtLabel}.

Règles :
- Traduis UNIQUEMENT le texte, sans ajouter de commentaires ni d'explications
- Préserve le formatage (retours à la ligne, listes, etc.)
- Adapte les nuances culturelles et idiomatiques
- Si le texte source est déjà dans la langue cible, améliore-le
- Ne mets PAS de guillemets autour de la traduction

Texte à traduire :
${text}`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: session.token,
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 2048,
      agentName: 'fz-traducteur',
    }),
  });

  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return data.content || data.message || data.text || '';
}

function seedDemoTranslations(): Translation[] {
  return [
    {
      id: 'demo-tr-1',
      sourceText: 'Bonjour, comment puis-je vous aider aujourd\'hui ?',
      translatedText: 'Hello, how can I help you today?',
      sourceLang: 'fr', targetLang: 'en', isFavorite: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-tr-2',
      sourceText: 'Thank you for your collaboration on this project.',
      translatedText: 'Merci pour votre collaboration sur ce projet.',
      sourceLang: 'en', targetLang: 'fr', isFavorite: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

export default function TraductionPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META.traduction;

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('fr');
  const [targetLang, setTargetLang] = useState('en');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [activeTab, setActiveTab] = useState<'translate' | 'history' | 'favorites'>('translate');
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [transError, setTransError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTranslations(JSON.parse(stored));
      } else {
        const demo = seedDemoTranslations();
        setTranslations(demo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      }
    } catch { /* */ }
  }, []);

  function save(list: Translation[]) {
    setTranslations(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* */ }
  }

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setTranslating(true);
    setTransError('');
    try {
      const result = await translateWithAI(sourceText, sourceLang, targetLang);
      setTranslatedText(result);
      const tr: Translation = {
        id: `tr-${Date.now()}`,
        sourceText, translatedText: result,
        sourceLang, targetLang,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
      save([tr, ...translations]);
    } catch (err) {
      setTransError(err instanceof Error ? err.message : 'Erreur de traduction');
    } finally {
      setTranslating(false);
    }
  }

  function handleSwap() {
    if (sourceLang === 'auto') return;
    const tmpLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmpLang);
    const tmpText = sourceText;
    setSourceText(translatedText);
    setTranslatedText('');
  }

  function handleCopy() {
    navigator.clipboard.writeText(translatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleFavorite(id: string) {
    save(translations.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  }

  function handleDelete(id: string) {
    save(translations.filter(t => t.id !== id));
  }

  function handleClearAll() {
    save([]);
    setSourceText('');
    setTranslatedText('');
  }

  const favorites = translations.filter(t => t.isFavorite);
  const charCount = sourceText.length;

  const TABS = [
    { id: 'translate' as const, label: 'Traduire', emoji: '🌐' },
    { id: 'history' as const, label: `Historique (${translations.length})`, emoji: '📜' },
    { id: 'favorites' as const, label: `Favoris (${favorites.length})`, emoji: '⭐' },
  ];

  function renderTranslationItem(tr: Translation) {
    const srcLang = LANGUAGES.find(l => l.code === tr.sourceLang);
    const tgtLang = LANGUAGES.find(l => l.code === tr.targetLang);
    return (
      <div key={tr.id} style={CU.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: CU.textSecondary }}>
            {srcLang?.flag} {srcLang?.label} → {tgtLang?.flag} {tgtLang?.label} — {new Date(tr.createdAt).toLocaleDateString('fr-FR')}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => toggleFavorite(tr.id)} style={{
              background: 'none', border: 'none', fontSize: 14, cursor: 'pointer',
            }}>{tr.isFavorite ? '⭐' : '☆'}</button>
            <button onClick={() => { setSourceText(tr.sourceText); setSourceLang(tr.sourceLang); setTargetLang(tr.targetLang); setTranslatedText(tr.translatedText); setActiveTab('translate'); }} style={CU.btnSmall}>
              🔄
            </button>
            <button onClick={() => handleDelete(tr.id)} style={{ ...CU.btnSmall, color: '#ef4444' }}>
              🗑️
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <div style={{ flex: 1, background: CU.bgSecondary, borderRadius: 8, padding: 10, fontSize: 13, color: CU.text }}>
            {tr.sourceText.length > 150 ? tr.sourceText.slice(0, 150) + '...' : tr.sourceText}
          </div>
          <div style={{ flex: 1, background: CU.bgSecondary, borderRadius: 8, padding: 10, fontSize: 13, color: CU.text }}>
            {tr.translatedText.length > 150 ? tr.translatedText.slice(0, 150) + '...' : tr.translatedText}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta?.emoji}</span>
          <h1 style={CU.pageTitle}>{meta?.title}</h1>
          <HelpBubble text={meta?.helpText || ''} />
        </div>
        <p style={CU.pageSubtitle}>{meta?.subtitle}</p>
      </div>
      <PageExplanation pageId="traduction" text={PAGE_META.traduction?.helpText} />

      {/* Tabs */}
      <div style={{ ...tabBar(), gap: 0, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? CU.tabActive : CU.tab}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
        {translations.length > 0 && (
          <button onClick={handleClearAll} style={{ ...CU.btnSmall, color: '#ef4444', border: '1px solid #ef4444' }}>
            🗑️ Tout effacer
          </button>
        )}
      </div>

      {/* Translate tab */}
      {activeTab === 'translate' && (
        <div>
          {/* Language selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} style={{ ...CU.select, flex: 1, minWidth: 120 }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            <button onClick={handleSwap} style={{
              ...CU.btnGhost,
              fontSize: 16,
              cursor: sourceLang === 'auto' ? 'not-allowed' : 'pointer',
              opacity: sourceLang === 'auto' ? 0.4 : 1,
              padding: '0 12px',
            }} disabled={sourceLang === 'auto'}>
              ↔
            </button>
            <select value={targetLang} onChange={e => setTargetLang(e.target.value)} style={{ ...CU.select, flex: 1, minWidth: 120 }}>
              {TARGET_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Text areas */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            <div style={{ flex: 1, ...CU.card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: CU.textSecondary }}>
                  {LANGUAGES.find(l => l.code === sourceLang)?.flag} Texte source
                </span>
                <span style={{ fontSize: 11, color: CU.textMuted }}>{charCount} caractères</span>
              </div>
              <textarea
                placeholder="Saisissez ou collez votre texte ici..."
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                rows={8}
                style={{ ...CU.textarea, fontSize: 14 }}
              />
            </div>

            <div style={{ flex: 1, ...CU.card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: CU.textSecondary }}>
                  {LANGUAGES.find(l => l.code === targetLang)?.flag} Traduction
                </span>
                {translatedText && (
                  <button onClick={handleCopy} style={CU.btnSmall}>
                    {copied ? '✅' : '📋 Copier'}
                  </button>
                )}
              </div>
              <div style={{
                width: '100%', minHeight: 180, padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${CU.border}`, background: CU.bg,
                color: CU.text, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6,
                boxSizing: 'border-box',
              }}>
                {translating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: CU.textMuted }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    Traduction en cours...
                  </div>
                ) : translatedText || (
                  <span style={{ color: CU.textMuted }}>La traduction apparaîtra ici...</span>
                )}
              </div>
            </div>
          </div>

          {/* Translate button */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={handleTranslate} disabled={translating || !sourceText.trim()} style={{
              ...CU.btnPrimary,
              flex: 1, height: 44, fontSize: 14, fontWeight: 700,
              background: !sourceText.trim() ? CU.border : CU.accent,
              cursor: !sourceText.trim() ? 'not-allowed' : 'pointer',
            }}>
              {translating ? '⏳ Traduction...' : '🌐 Traduire'}
            </button>
          </div>

          {transError && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: `1px solid ${CU.danger}`, fontSize: 12, color: CU.danger, marginTop: 8 }}>
              {transError}
            </div>
          )}
          <p style={{ fontSize: 11, color: CU.textMuted, marginTop: 8, textAlign: 'center' }}>
            Traduction par Claude IA · ~0.5 crédits par traduction
          </p>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {translations.length === 0 ? (
            <div style={{ ...CU.card, ...CU.emptyState }}>
              <span style={CU.emptyEmoji}>🌐</span>
              <div style={CU.emptyTitle}>Aucune traduction pour le moment</div>
            </div>
          ) : translations.map(renderTranslationItem)}
        </div>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favorites.length === 0 ? (
            <div style={{ ...CU.card, ...CU.emptyState }}>
              <span style={CU.emptyEmoji}>⭐</span>
              <div style={CU.emptyTitle}>Aucun favori pour le moment</div>
              <div style={CU.emptyDesc}>Cliquez sur l'étoile d'une traduction pour l'ajouter aux favoris</div>
            </div>
          ) : favorites.map(renderTranslationItem)}
        </div>
      )}
    </div>
  );
}
