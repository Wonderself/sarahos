'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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

// Simulated translation (wraps text with language tag — ready for DeepL/Anthropic API)
function simulateTranslation(text: string, targetLang: string): string {
  const lang = LANGUAGES.find(l => l.code === targetLang);
  const tag = lang ? lang.code.toUpperCase() : targetLang.toUpperCase();
  // Simple simulation — in production, call DeepL or Anthropic API
  const simulations: Record<string, (t: string) => string> = {
    en: (t) => `[EN] ${t}\n\n(Simulated translation — connect DeepL API for real translations)`,
    fr: (t) => `[FR] ${t}\n\n(Traduction simulée — connectez l'API DeepL pour de vraies traductions)`,
    es: (t) => `[ES] ${t}\n\n(Traducción simulada — conecte la API de DeepL para traducciones reales)`,
    de: (t) => `[DE] ${t}\n\n(Simulierte Übersetzung — DeepL-API für echte Übersetzungen verbinden)`,
    it: (t) => `[IT] ${t}\n\n(Traduzione simulata — collega l'API DeepL per traduzioni reali)`,
    pt: (t) => `[PT] ${t}\n\n(Tradução simulada — conecte a API DeepL para traduções reais)`,
    ar: (t) => `[AR] ${t}\n\n(ترجمة محاكاة — قم بتوصيل واجهة برمجة تطبيقات DeepL للحصول على ترجمات حقيقية)`,
    he: (t) => `[HE] ${t}\n\n(תרגום מדומה — חבר את ה-API של DeepL לתרגומים אמיתיים)`,
    zh: (t) => `[ZH] ${t}\n\n(模拟翻译 — 连接DeepL API以获得真实翻译)`,
    ja: (t) => `[JA] ${t}\n\n(シミュレーション翻訳 — 実際の翻訳にはDeepL APIを接続してください)`,
  };
  const fn = simulations[targetLang];
  return fn ? fn(text) : `[${tag}] ${text}`;
}

function seedDemoTranslations(): Translation[] {
  return [
    {
      id: 'demo-tr-1',
      sourceText: 'Bonjour, comment puis-je vous aider aujourd\'hui ?',
      translatedText: '[EN] Hello, how can I help you today?\n\n(Simulated translation — connect DeepL API for real translations)',
      sourceLang: 'fr', targetLang: 'en', isFavorite: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-tr-2',
      sourceText: 'Thank you for your collaboration on this project.',
      translatedText: '[FR] Thank you for your collaboration on this project.\n\n(Traduction simulée — connectez l\'API DeepL pour de vraies traductions)',
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

  function handleTranslate() {
    if (!sourceText.trim()) return;
    setTranslating(true);
    // Simulate async translation
    setTimeout(() => {
      const result = simulateTranslation(sourceText, targetLang);
      setTranslatedText(result);
      const tr: Translation = {
        id: `tr-${Date.now()}`,
        sourceText, translatedText: result,
        sourceLang, targetLang,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
      save([tr, ...translations]);
      setTranslating(false);
    }, 600);
  }

  function handleSwap() {
    if (sourceLang === 'auto') return;
    const tmpLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmpLang);
    const tmpText = sourceText;
    setSourceText(translatedText.split('\n\n(')[0].replace(/^\[[A-Z]{2}\] /, ''));
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

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20,
    border: '1px solid var(--border-primary)',
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
    background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, flex: 1, minWidth: 120,
  };

  const TABS = [
    { id: 'translate' as const, label: 'Traduire', emoji: '🌐' },
    { id: 'history' as const, label: `Historique (${translations.length})`, emoji: '📜' },
    { id: 'favorites' as const, label: `Favoris (${favorites.length})`, emoji: '⭐' },
  ];

  function renderTranslationItem(tr: Translation) {
    const srcLang = LANGUAGES.find(l => l.code === tr.sourceLang);
    const tgtLang = LANGUAGES.find(l => l.code === tr.targetLang);
    return (
      <div key={tr.id} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {srcLang?.flag} {srcLang?.label} → {tgtLang?.flag} {tgtLang?.label} — {new Date(tr.createdAt).toLocaleDateString('fr-FR')}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => toggleFavorite(tr.id)} style={{
              background: 'none', border: 'none', fontSize: 14, cursor: 'pointer',
            }}>{tr.isFavorite ? '⭐' : '☆'}</button>
            <button onClick={() => { setSourceText(tr.sourceText); setSourceLang(tr.sourceLang); setTargetLang(tr.targetLang); setTranslatedText(tr.translatedText); setActiveTab('translate'); }} style={{
              padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-primary)',
              background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: 'var(--text-primary)',
            }}>🔄</button>
            <button onClick={() => handleDelete(tr.id)} style={{
              padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-primary)',
              background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: '#ef4444',
            }}>🗑️</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--text-primary)' }}>
            {tr.sourceText.length > 150 ? tr.sourceText.slice(0, 150) + '...' : tr.sourceText}
          </div>
          <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--text-primary)' }}>
            {tr.translatedText.length > 150 ? tr.translatedText.slice(0, 150) + '...' : tr.translatedText}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        }}>
          <span style={{ fontSize: isMobile ? 26 : 32 }}>{meta?.emoji}</span>
          {meta?.title}
          <HelpBubble text={meta?.helpText || ''} />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{meta?.subtitle}</p>
      </div>
      <PageExplanation pageId="traduction" text={PAGE_META.traduction?.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-primary)',
            background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-secondary)',
            color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            {tab.emoji} {tab.label}
          </button>
        ))}
        {translations.length > 0 && (
          <button onClick={handleClearAll} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444',
            background: 'transparent', color: '#ef4444',
            cursor: 'pointer', fontWeight: 600, fontSize: 13, marginLeft: 'auto',
          }}>
            🗑️ Tout effacer
          </button>
        )}
      </div>

      {/* Translate tab */}
      {activeTab === 'translate' && (
        <div>
          {/* Language selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} style={selectStyle}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            <button onClick={handleSwap} style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: 16, cursor: sourceLang === 'auto' ? 'not-allowed' : 'pointer',
              opacity: sourceLang === 'auto' ? 0.4 : 1,
            }} disabled={sourceLang === 'auto'}>
              ↔
            </button>
            <select value={targetLang} onChange={e => setTargetLang(e.target.value)} style={selectStyle}>
              {TARGET_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Text areas */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            <div style={{ flex: 1, ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {LANGUAGES.find(l => l.code === sourceLang)?.flag} Texte source
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{charCount} caractères</span>
              </div>
              <textarea
                placeholder="Saisissez ou collez votre texte ici..."
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                rows={8}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border-primary)', background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ flex: 1, ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {LANGUAGES.find(l => l.code === targetLang)?.flag} Traduction
                </span>
                {translatedText && (
                  <button onClick={handleCopy} style={{
                    padding: '2px 10px', borderRadius: 4, border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)', fontSize: 11, cursor: 'pointer', color: 'var(--text-primary)',
                  }}>
                    {copied ? '✅' : '📋 Copier'}
                  </button>
                )}
              </div>
              <div style={{
                width: '100%', minHeight: 180, padding: '10px 14px', borderRadius: 8,
                border: '1px solid var(--border-primary)', background: 'var(--bg-primary)',
                color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6,
              }}>
                {translating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    Traduction en cours...
                  </div>
                ) : translatedText || (
                  <span style={{ color: 'var(--text-secondary)' }}>La traduction apparaîtra ici...</span>
                )}
              </div>
            </div>
          </div>

          {/* Translate button */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={handleTranslate} disabled={translating || !sourceText.trim()} style={{
              flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none',
              background: !sourceText.trim() ? 'var(--border-primary)' : 'var(--accent)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: !sourceText.trim() ? 'not-allowed' : 'pointer',
            }}>
              {translating ? '⏳ Traduction...' : '🌐 Traduire'}
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>
            Traduction simulée — Connectez l'API DeepL ou Anthropic pour de vraies traductions
          </p>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {translations.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: 40 }}>🌐</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Aucune traduction pour le moment</p>
            </div>
          ) : translations.map(renderTranslationItem)}
        </div>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favorites.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: 40 }}>⭐</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Aucun favori pour le moment</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Cliquez sur l'étoile d'une traduction pour l'ajouter aux favoris</p>
            </div>
          ) : favorites.map(renderTranslationItem)}
        </div>
      )}
    </div>
  );
}
