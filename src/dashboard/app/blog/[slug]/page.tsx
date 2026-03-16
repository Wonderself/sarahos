'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { getArticleBySlug, getRelatedArticles, BLOG_CATEGORIES } from '@/lib/blog-data';

export default function BlogArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';
  const article = getArticleBySlug(slug);
  const related = article ? getRelatedArticles(slug, 3) : [];

  // Dynamic metadata for SEO
  useEffect(() => {
    if (!article) return;

    // Update page title
    document.title = `${article.title} — Freenzy.io Blog`;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', article.excerpt);

    // Update Open Graph tags
    const ogTags: Record<string, string> = {
      'og:title': article.title,
      'og:description': article.excerpt,
      'og:type': 'article',
      'og:url': `https://freenzy.io/blog/${article.slug}`,
    };

    for (const [property, content] of Object.entries(ogTags)) {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    }

    // Add JSON-LD structured data
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'blog-article-schema';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      author: { '@type': 'Person', name: article.author },
      datePublished: article.publishedAt,
      publisher: { '@type': 'Organization', name: 'Freenzy.io' },
    });
    document.head.appendChild(schemaScript);

    return () => {
      // Restore default title on unmount
      document.title = 'Blog — Guides IA, Tutoriels & Retours d\'Expérience | Freenzy.io';

      // Remove JSON-LD script
      const existingSchema = document.getElementById('blog-article-schema');
      if (existingSchema) existingSchema.remove();

      // Reset OG tags
      for (const property of Object.keys(ogTags)) {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) tag.remove();
      }
    };
  }, [article]);
  const accentGradient = 'linear-gradient(135deg, #7c3aed, #06b6d4)';

  if (!article) {
    return (
      <div style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
        <PublicNav />
        <div style={{ paddingTop: 160, textAlign: 'center', maxWidth: 600, margin: '0 auto', padding: '160px 24px 80px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 24 }}>article</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Article non trouv&eacute;</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Cet article n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;.</p>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
            Retour au blog
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const category = BLOG_CATEGORIES.find(c => c.id === article.category);

  // Parse simple markdown-like content
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} style={{ margin: '16px 0', paddingLeft: 0, listStyle: 'none' }}>
            {listItems.map((item, i) => (
              <li key={i} style={{ padding: '6px 0', color: 'rgba(255,255,255,0.75)', fontSize: 15.5, lineHeight: 1.65, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#7c3aed', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                  {item.match(/^\d+\./) ? item.match(/^\d+\./)?.[0] : '•'}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s*|^•\s*/, '')) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushList();
        continue;
      }

      if (line.startsWith('•') || line.match(/^\d+\.\s/)) {
        listItems.push(line);
        continue;
      }

      flushList();

      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <h3 key={`h-${i}`} style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8, color: '#fff' }}>
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      } else if (line.startsWith('✅')) {
        elements.push(
          <p key={`check-${i}`} style={{ color: '#22c55e', fontSize: 15, fontWeight: 600, margin: '4px 0' }}>
            {line}
          </p>
        );
      } else {
        elements.push(
          <p key={`p-${i}`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15.5, lineHeight: 1.75, margin: '12px 0' }}
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      }
    }
    flushList();
    return elements;
  };

  const formatInline = (text: string): string => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:700">$1</strong>');
  };

  return (
    <div style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Article Header */}
      <article style={{ paddingTop: 120, maxWidth: 780, margin: '0 auto', padding: '120px 24px 0' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{category?.label}</span>
        </nav>

        {/* Category + Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${article.color}15`, border: `1px solid ${article.color}30`, borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: article.color }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{category?.icon}</span>
            {category?.label}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            {article.readTime} min de lecture
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>

        {/* Excerpt */}
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 32 }}>
          {article.excerpt}
        </p>

        {/* Author + Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#fff' }}>person</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{article.author}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {article.authorRole} &middot; {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 60 }}>
          {renderContent(article.content)}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 48 }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 16, padding: '32px 28px', textAlign: 'center', marginBottom: 60,
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Prêt &agrave; passer &agrave; l&apos;action ?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, marginBottom: 20 }}>
            50 cr&eacute;dits offerts pour tester tous les agents IA. Aucune carte bancaire requise.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            Accéder à Freenzy
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              Articles similaires
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {related.map(rel => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '20px 18px', textDecoration: 'none', color: '#fff',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: rel.color }}>{rel.icon}</span>
                    <span style={{ fontSize: 11, color: rel.color, fontWeight: 600, textTransform: 'uppercase' }}>
                      {BLOG_CATEGORIES.find(c => c.id === rel.category)?.label}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>
                    {rel.title}
                  </h4>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    {rel.readTime} min &middot; {new Date(rel.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <PublicFooter />
    </div>
  );
}
