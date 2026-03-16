'use client';

import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/lib/use-media-query';
import {
  NEWS_ARTICLES,
  NEWS_CATEGORIES,
  getNewsForDate,
  type NewsArticle,
  type NewsCategory,
  type NewsStats,
} from '@/lib/news-ai';

// ─── Constants ──────────────────────────────────────────────

const TODAY = '2026-03-16';
const DATE_DISPLAY = 'Dimanche 16 mars 2026';

const C = {
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  accent: '#1A1A1A',
  danger: '#DC2626',
  warning: '#F59E0B',
  success: '#059669',
};

const IMPACT_CONFIG = {
  high: { label: '🔴 Impact majeur', color: '#DC2626', bg: '#FEF2F2' },
  medium: { label: '🟡 À suivre', color: '#D97706', bg: '#FFFBEB' },
  low: { label: '🟢 Info', color: '#059669', bg: '#F0FDF4' },
};

// ─── Helpers ────────────────────────────────────────────────

function getCategoryConfig(id: NewsCategory) {
  return NEWS_CATEGORIES.find(c => c.id === id) || NEWS_CATEGORIES[0];
}

function getAllTags(articles: NewsArticle[]): { tag: string; count: number }[] {
  const map: Record<string, number> = {};
  articles.forEach(a => a.tags.forEach(t => { map[t] = (map[t] || 0) + 1; }));
  return Object.entries(map)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Stat Bar Component ─────────────────────────────────────

function StatBar({ stat, maxValue, color }: { stat: NewsStats; maxValue: number; color: string }) {
  const pct = Math.min((stat.value / maxValue) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 120, fontSize: 12, color: C.textSecondary, flexShrink: 0 }}>
        {stat.label}
      </div>
      <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, minWidth: 70, textAlign: 'right' }}>
        {stat.value} {stat.unit}
      </div>
      {stat.change && (
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: stat.changeType === 'up' ? C.success : stat.changeType === 'down' ? C.danger : C.textMuted,
          background: stat.changeType === 'up' ? '#F0FDF4' : stat.changeType === 'down' ? '#FEF2F2' : '#F9FAFB',
          padding: '2px 6px',
          borderRadius: 4,
          minWidth: 44,
          textAlign: 'center',
        }}>
          {stat.change}
        </div>
      )}
    </div>
  );
}

// ─── Stats Block ────────────────────────────────────────────

function StatsBlock({ stats, color }: { stats: NewsStats[]; color: string }) {
  const maxVal = Math.max(...stats.map(s => s.value));
  return (
    <div style={{ marginTop: 12, padding: 12, background: C.bgSecondary, borderRadius: 8, border: `1px solid ${C.border}` }}>
      {stats.map((s, i) => (
        <StatBar key={i} stat={s} maxValue={maxVal} color={color} />
      ))}
    </div>
  );
}

// ─── Article Card (Feed) ────────────────────────────────────

function ArticleCard({ article }: { article: NewsArticle }) {
  const [expanded, setExpanded] = useState(false);
  const cat = getCategoryConfig(article.category);
  const impact = IMPACT_CONFIG[article.impact];

  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      {/* Collapsed view */}
      <div style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'flex-start' }}>
        {/* Emoji illustration */}
        <div style={{
          fontSize: 40,
          lineHeight: 1,
          flexShrink: 0,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {article.imageEmoji}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: cat.color,
              background: `${cat.color}12`,
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              {cat.emoji} {cat.label}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: impact.color,
              background: impact.bg,
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              {impact.label}
            </span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: 4 }}>
            {article.emoji} {article.title}
          </div>

          <div style={{
            fontSize: 13,
            color: C.textSecondary,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 999 : 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {article.summary}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>
              {article.source}
            </span>
            <span style={{ fontSize: 11, color: C.textMuted }}>
              {article.period === 'morning' ? '☀️' : '🌙'} {article.date}
            </span>
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: 10,
                color: C.textMuted,
                background: C.bgSecondary,
                padding: '1px 6px',
                borderRadius: 3,
                border: `1px solid ${C.border}`,
              }}>
                #{tag}
              </span>
            ))}
            <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>
              {expanded ? '▲ Fermer' : '▼ Lire'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: '0 14px 14px 14px',
          borderTop: `1px solid ${C.border}`,
          marginTop: 0,
        }}>
          <div style={{
            borderLeft: `3px solid ${cat.color}`,
            paddingLeft: 16,
            marginTop: 14,
            fontSize: 14,
            color: C.text,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6, color: C.text }}>
                    {line.replace(/\*\*/g, '')}
                  </div>
                );
              }
              if (line.match(/^\*\*.*\*\*$/)) {
                return (
                  <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6, color: C.text }}>
                    {line.replace(/\*\*/g, '')}
                  </div>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }}>
                    {renderBold(line)}
                  </div>
                );
              }
              if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
              return <div key={i}>{renderBold(line)}</div>;
            })}
          </div>

          {article.stats && article.stats.length > 0 && (
            <StatsBlock stats={article.stats} color={cat.color} />
          )}

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                fontSize: 12,
                color: '#0EA5E9',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🔗 Source : {article.source}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/** Render **bold** within text */
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Hero Card (high impact) ────────────────────────────────

function HeroCard({ article }: { article: NewsArticle }) {
  const [expanded, setExpanded] = useState(false);
  const cat = getCategoryConfig(article.category);

  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>
            {article.imageEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: cat.color,
                background: `${cat.color}12`,
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                {cat.emoji} {cat.label}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#DC2626',
                background: '#FEF2F2',
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                🔴 Impact majeur
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>
              {article.emoji} {article.title}
            </div>
            <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>
              {article.summary}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{article.source}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>
                {article.period === 'morning' ? '☀️' : '🌙'} {article.date}
              </span>
              <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 'auto' }}>
                {expanded ? '▲ Fermer' : '▼ Lire l\'article complet'}
              </span>
            </div>
          </div>
        </div>

        {article.stats && article.stats.length > 0 && !expanded && (
          <StatsBlock stats={article.stats} color={cat.color} />
        )}
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{
            borderLeft: `3px solid ${cat.color}`,
            paddingLeft: 16,
            marginTop: 14,
            fontSize: 14,
            color: C.text,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {article.content.split('\n').map((line, i) => {
              if (line.match(/^\*\*.*\*\*$/)) {
                return (
                  <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6 }}>
                    {line.replace(/\*\*/g, '')}
                  </div>
                );
              }
              if (line.startsWith('- ')) {
                return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }}>{renderBold(line)}</div>;
              }
              if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
              return <div key={i}>{renderBold(line)}</div>;
            })}
          </div>

          {article.stats && article.stats.length > 0 && (
            <StatsBlock stats={article.stats} color={cat.color} />
          )}

          <div style={{ marginTop: 12 }}>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 12, color: '#0EA5E9', textDecoration: 'none' }}
            >
              🔗 Source : {article.source}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────

function Sidebar({ articles }: { articles: NewsArticle[] }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categoryCounts = useMemo(() => {
    const map: Partial<Record<NewsCategory, number>> = {};
    articles.forEach(a => { map[a.category] = (map[a.category] || 0) + 1; });
    return map;
  }, [articles]);

  const topTags = useMemo(() => getAllTags(articles).slice(0, 5), [articles]);

  function handleSubscribe() {
    if (!email.includes('@')) return;
    try {
      const subs = JSON.parse(localStorage.getItem('fz_news_subscriptions') || '[]');
      subs.push({ email, date: new Date().toISOString() });
      localStorage.setItem('fz_news_subscriptions', JSON.stringify(subs));
    } catch { /* ignore */ }
    setSubscribed(true);
  }

  return (
    <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Categories */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>
          🏷️ Categories
        </div>
        {NEWS_CATEGORIES.map(cat => (
          <div key={cat.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 13, color: C.text }}>
              {cat.emoji} {cat.label}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: cat.color,
              background: `${cat.color}12`,
              padding: '1px 7px',
              borderRadius: 10,
            }}>
              {categoryCounts[cat.id] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Tendances */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>
          📈 Tendances
        </div>
        {topTags.map((t, i) => (
          <div key={t.tag} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 0',
            borderBottom: i < topTags.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ fontSize: 12, color: C.textMuted, width: 16 }}>#{i + 1}</span>
            <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{t.tag}</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>{t.count} articles</span>
          </div>
        ))}
      </div>

      {/* Subscribe */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
          🔔 Recevoir le recap
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, lineHeight: 1.5 }}>
          Recevez l'essentiel de l'actu IA chaque matin dans votre boite mail.
        </div>
        {subscribed ? (
          <div style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>
            ✅ Inscription enregistree !
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: 13,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                outline: 'none',
                marginBottom: 8,
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleSubscribe}
              style={{
                width: '100%',
                padding: '8px 0',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                background: C.accent,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              S'abonner
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function NewsAIPage() {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<'morning' | 'evening'>('morning');
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all');

  // All articles for today
  const allTodayArticles = useMemo(() => getNewsForDate(TODAY), []);

  // Filtered by period
  const periodArticles = useMemo(
    () => allTodayArticles.filter(a => a.period === period),
    [allTodayArticles, period],
  );

  // High impact for hero section
  const heroArticles = useMemo(
    () => periodArticles.filter(a => a.impact === 'high'),
    [periodArticles],
  );

  // Articles with stats
  const statsArticles = useMemo(
    () => periodArticles.filter(a => a.stats && a.stats.length > 0),
    [periodArticles],
  );

  // Feed articles (filtered by category)
  const feedArticles = useMemo(
    () => categoryFilter === 'all'
      ? periodArticles
      : periodArticles.filter(a => a.category === categoryFilter),
    [periodArticles, categoryFilter],
  );

  return (
    <div style={{ padding: isMobile ? 16 : 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* ─── Header ──────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
              📰 News IA
            </h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>
              L'essentiel de l'actualite IA, 2 fois par jour
            </p>
          </div>
          <div style={{ fontSize: 13, color: C.textSecondary }}>
            📅 {DATE_DISPLAY}
          </div>
        </div>

        {/* Period toggle */}
        <div style={{
          display: 'inline-flex',
          background: C.bgSecondary,
          borderRadius: 8,
          padding: 3,
          marginTop: 12,
          border: `1px solid ${C.border}`,
        }}>
          {(['morning', 'evening'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: period === p ? 600 : 400,
                color: period === p ? '#fff' : C.textSecondary,
                background: period === p ? C.accent : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p === 'morning' ? '☀️ Matin' : '🌙 Soir'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Layout: Main + Sidebar ──────────────── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ─── Hero: High impact ───────────────── */}
          {heroArticles.length > 0 && (
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>
                🔴 A ne pas manquer
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {heroArticles.map(a => (
                  <HeroCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          {/* ─── Stats of the day ────────────────── */}
          {statsArticles.length > 0 && (
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>
                📊 Les chiffres du jour
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: 12,
              }}>
                {statsArticles.map(a => {
                  const cat = getCategoryConfig(a.category);
                  const maxVal = Math.max(...(a.stats || []).map(s => s.value));
                  return (
                    <div key={a.id} style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 14,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                        {a.emoji} {a.title}
                      </div>
                      {(a.stats || []).map((s, i) => (
                        <StatBar key={i} stat={s} maxValue={maxVal} color={cat.color} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── Feed ────────────────────────────── */}
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>
              📋 Fil d'actualite
            </h2>

            {/* Category filters */}
            <div style={{
              display: 'flex',
              gap: 6,
              marginBottom: 14,
              overflowX: 'auto',
              paddingBottom: 4,
            }}>
              <button
                onClick={() => setCategoryFilter('all')}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: categoryFilter === 'all' ? 600 : 400,
                  color: categoryFilter === 'all' ? '#fff' : C.textSecondary,
                  background: categoryFilter === 'all' ? C.accent : C.bgSecondary,
                  border: `1px solid ${categoryFilter === 'all' ? C.accent : C.border}`,
                  borderRadius: 20,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Tous ({periodArticles.length})
              </button>
              {NEWS_CATEGORIES.map(cat => {
                const count = periodArticles.filter(a => a.category === cat.id).length;
                if (count === 0) return null;
                const active = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : C.textSecondary,
                      background: active ? cat.color : C.bgSecondary,
                      border: `1px solid ${active ? cat.color : C.border}`,
                      borderRadius: 20,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {cat.emoji} {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Article list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {feedArticles.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
              {feedArticles.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 14 }}>
                  Aucun article dans cette categorie pour cette periode.
                </div>
              )}
            </div>
          </section>

          {/* ─── Bottom ──────────────────────────── */}
          <div style={{
            textAlign: 'center',
            padding: '20px 0',
            borderTop: `1px solid ${C.border}`,
            marginTop: 8,
          }}>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>
              📚 <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Archives</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>
              Cette veille est générée automatiquement par Freenzy.io
            </div>
          </div>
        </div>

        {/* ─── Sidebar (desktop only) ────────────── */}
        {!isMobile && <Sidebar articles={allTodayArticles} />}
      </div>
    </div>
  );
}
