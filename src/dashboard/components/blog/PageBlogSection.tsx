'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { PageArticle, PageBlogConfig } from '@/lib/page-blog/types';
import { PAGE_BLOG_CONFIGS } from '@/lib/page-blog/articles-data';
import { getArticlesForPage } from '@/lib/page-blog';
import { useIsMobile } from '@/lib/use-media-query';

// ─── Category emoji map ─────────────────────────────────────
const CATEGORY_EMOJIS: Record<string, string> = {
  'productivite': '\uD83D\uDE80',
  'ia': '\uD83E\uDD16',
  'chat': '\uD83D\uDCAC',
  'agents': '\uD83E\uDDD1\u200D\uD83D\uDCBB',
  'assistants': '\uD83E\uDDD1\u200D\uD83D\uDCBB',
  'studio': '\uD83C\uDFA8',
  'creatif': '\uD83C\uDFA8',
  'marketing': '\uD83D\uDCE3',
  'commercial': '\uD83D\uDCBC',
  'finance': '\uD83D\uDCB0',
  'juridique': '\u2696\uFE0F',
  'rh': '\uD83D\uDC65',
  'communication': '\uD83D\uDCE1',
  'strategie': '\uD83C\uDFAF',
  'automatisation': '\u2699\uFE0F',
  'documents': '\uD83D\uDCC4',
  'social': '\uD83D\uDCF1',
  'repondeur': '\uD83D\uDCDE',
  'reveil': '\u23F0',
  'restaurant': '\uD83C\uDF7D\uFE0F',
  'immobilier': '\uD83C\uDFE0',
  'cabinet': '\uD83C\uDFE5',
  'discussions': '\uD83D\uDCA1',
  'blog': '\uD83D\uDCDD',
  'arcade': '\uD83C\uDFAE',
  'entreprise': '\uD83C\uDFE2',
  'securite': '\uD83D\uDD12',
  'analytics': '\uD83D\uDCCA',
  'default': '\uD83D\uDCCC',
};

function getCategoryEmoji(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return CATEGORY_EMOJIS['default'];
}

// ─── Subheading emoji picker ────────────────────────────────
const SUBHEADING_EMOJIS = [
  '\uD83D\uDCA1', '\u2705', '\uD83D\uDD11', '\uD83C\uDFAF', '\uD83D\uDCCC',
  '\u26A1', '\uD83D\uDEE0\uFE0F', '\uD83D\uDCDD', '\uD83D\uDD0D', '\uD83D\uDCA0',
];

function getSubheadingEmoji(index: number): string {
  return SUBHEADING_EMOJIS[index % SUBHEADING_EMOJIS.length];
}

// ─── Props ──────────────────────────────────────────────────
interface PageBlogSectionProps {
  pageId: string;
  maxArticles?: number;
}

// ─── Simple markdown renderer ───────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let subheadingIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push(<br key={`br-${i}`} />);
      continue;
    }

    // Headers ### → subheading with emoji
    if (trimmed.startsWith('### ')) {
      const emoji = getSubheadingEmoji(subheadingIdx++);
      nodes.push(
        <h4 key={`h4-${i}`} style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '14px 0 8px' }}>
          {emoji} {trimmed.slice(4)}
        </h4>
      );
      continue;
    }
    // Headers ## → subheading with emoji
    if (trimmed.startsWith('## ')) {
      const emoji = getSubheadingEmoji(subheadingIdx++);
      nodes.push(
        <h3 key={`h3-${i}`} style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '14px 0 8px' }}>
          {emoji} {trimmed.slice(3)}
        </h3>
      );
      continue;
    }

    // Check if line is entirely bold: **something**
    const isBoldLine = /^\*\*[^*]+\*\*$/.test(trimmed);
    if (isBoldLine) {
      const emoji = getSubheadingEmoji(subheadingIdx++);
      const boldText = trimmed.slice(2, -2);
      nodes.push(
        <p key={`bh-${i}`} style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '14px 0 8px', lineHeight: 1.4 }}>
          {emoji} {boldText}
        </p>
      );
      continue;
    }

    // Bold inline: **text**
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    nodes.push(
      <p key={`p-${i}`} style={{ fontSize: 13, lineHeight: 1.7, color: '#1A1A1A', margin: '0 0 8px' }}>
        {rendered}
      </p>
    );
  }

  return nodes;
}

// ─── Schema.org JSON-LD for expanded article ────────────────
function ArticleJsonLd({ article }: { article: PageArticle }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.imageUrl,
    datePublished: article.date,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Freenzy.io',
      url: 'https://freenzy.io',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Article Card ───────────────────────────────────────────
function ArticleCard({
  article,
  isExpanded,
  onToggle,
  isMobile,
  categoryEmoji,
}: {
  article: PageArticle;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  categoryEmoji: string;
}) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    borderColor: hovered ? '#C4C4C4' : '#E5E5E5',
    boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
    overflow: 'hidden',
  };

  const collapsedMobileStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  };

  const collapsedDesktopStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
  };

  return (
    <article
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Collapsed view */}
      <div
        onClick={onToggle}
        style={isMobile ? collapsedMobileStyle : collapsedDesktopStyle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        aria-expanded={isExpanded}
      >
        {/* Image */}
        {isMobile ? (
          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            loading="lazy"
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            loading="lazy"
            style={{
              width: 160,
              height: 100,
              borderRadius: 6,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        )}

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as CSSProperties}>
            {categoryEmoji} {article.title}
          </h3>

          {!isMobile && (
            <p style={{
              fontSize: 12,
              color: '#6B6B6B',
              margin: '4px 0 0',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as CSSProperties}>
              {article.excerpt}
            </p>
          )}

          <div style={{
            fontSize: 11,
            color: '#9B9B9B',
            marginTop: isMobile ? 4 : 6,
            lineHeight: 1.4,
          }}>
            <time dateTime={article.date}>
              {'\uD83D\uDCC5'} {article.date}
            </time>
            {' \u00B7 \u23F1 '}{article.readTime}
            {article.tags.length > 0 && (
              <>
                {' \u00B7 \uD83C\uDFF7\uFE0F '}
                {article.tags.slice(0, 2).join(', ')}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div style={{
          borderLeft: '3px solid #E5E5E5',
          marginLeft: 12,
          marginRight: 12,
          marginBottom: 12,
          padding: 16,
          borderTop: '1px solid #E5E5E5',
        }}>
          <ArticleJsonLd article={article} />

          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            loading="lazy"
            style={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
              borderRadius: 6,
              marginBottom: 14,
            }}
          />

          <div>
            {renderMarkdown(article.content)}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 14,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 500,
              color: '#6B6B6B',
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Fermer {'\u2715'}
          </button>
        </div>
      )}
    </article>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function PageBlogSection({ pageId, maxArticles = 10 }: PageBlogSectionProps) {
  const isMobile = useIsMobile();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  const config: PageBlogConfig | null = useMemo(
    () => getArticlesForPage(PAGE_BLOG_CONFIGS, pageId),
    [pageId],
  );

  const handleToggle = useCallback((articleId: string) => {
    setExpandedId((prev) => (prev === articleId ? null : articleId));
  }, []);

  const categoryEmoji = useMemo(() => {
    if (!config) return CATEGORY_EMOJIS['default'];
    return getCategoryEmoji(config.categoryTitle);
  }, [config]);

  // No articles → render nothing
  if (!config || config.articles.length === 0) {
    return null;
  }

  const visibleCount = showAll ? config.articles.length : Math.min(maxArticles, config.articles.length);
  const visibleArticles = config.articles.slice(0, visibleCount);
  const hasMore = config.articles.length > visibleCount;

  const gridStyle: CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: 8 }
    : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 };

  return (
    <section aria-label={`Articles : ${config.categoryTitle}`}>
      {/* Separator */}
      <div style={{ borderTop: '1px solid #E5E5E5', margin: '24px 0' }} />

      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {config.categoryEmoji} Articles : {config.categoryTitle}
        </h2>
        <p style={{
          fontSize: 11,
          color: '#9B9B9B',
          margin: '4px 0 0',
          lineHeight: 1.5,
        }}>
          Guides et conseils pour {config.categoryTitle.toLowerCase()}
        </p>
      </div>

      {/* Articles Grid */}
      <div style={gridStyle}>
        {visibleArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isExpanded={expandedId === article.id}
            onToggle={() => handleToggle(article.id)}
            isMobile={isMobile}
            categoryEmoji={categoryEmoji}
          />
        ))}
      </div>

      {/* Show more / View all */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#6B6B6B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Voir plus ({config.articles.length - visibleCount} articles restants)
          </button>
        )}

        <a
          href="/client/blog"
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: '#6B6B6B',
            textDecoration: linkHovered ? 'underline' : 'none',
            textUnderlineOffset: 3,
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Voir tous les articles {'\u2192'}
        </a>
      </div>
    </section>
  );
}
