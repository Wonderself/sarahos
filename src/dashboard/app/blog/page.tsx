'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';
import { BLOG_ARTICLES, BLOG_CATEGORIES, getFeaturedArticles, type BlogCategory } from '@/lib/blog-data';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');
  const featured = getFeaturedArticles();
  const filtered = activeCategory === 'all'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter(a => a.category === activeCategory);

  const accentGradient = 'linear-gradient(135deg, #7c3aed, #06b6d4)';

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ paddingTop: 130, paddingBottom: 60, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 24, fontSize: 14, color: '#a78bfa' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>article</span>
            Blog &amp; Ressources
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px' }}>
            Guides, tutoriels &amp;{' '}
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>retours d&apos;exp&eacute;rience</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(255,255,255,0.65)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Tout pour tirer le meilleur parti de l&apos;IA dans votre entreprise. Guides pratiques, cas d&apos;usage r&eacute;els et conseils d&apos;experts.
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, marginBottom: 28 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 24, verticalAlign: 'middle', marginRight: 8, color: '#f59e0b' }}>star</span>
          Articles mis en avant
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {featured.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} style={cardStyle}>
              <div style={{ padding: '28px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${article.color}18`, border: `1px solid ${article.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: article.color }}>{article.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: article.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {BLOG_CATEGORIES.find(c => c.id === article.category)?.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {article.readTime} min de lecture
                    </div>
                  </div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35, marginBottom: 10 }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                  {article.excerpt}
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>
                  Lire &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeCategory === 'all' ? accentGradient : 'rgba(255,255,255,0.06)',
              color: activeCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
          >
            Tous ({BLOG_ARTICLES.length})
          </button>
          {BLOG_CATEGORIES.map(cat => {
            const count = BLOG_ARTICLES.filter(a => a.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: activeCategory === cat.id ? `${cat.color}25` : 'rgba(255,255,255,0.06)',
                  color: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.6)',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{cat.icon}</span>
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} style={cardStyle}>
              <div style={{ padding: '24px 22px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 20, color: article.color }}>{article.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: article.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {BLOG_CATEGORIES.find(c => c.id === article.category)?.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                    {article.readTime} min
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 8 }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, margin: 0 }}>
                  {article.excerpt}
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>Lire &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 20, padding: '48px 32px',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16, display: 'block' }}>mail</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Restez inform&eacute;
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Recevez nos guides, cas d&apos;usage et actualit&eacute;s IA directement dans votre boîte mail. Pas de spam, du contenu utile uniquement.
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: accentGradient, color: '#fff', padding: '14px 32px',
            borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none',
          }}>
            Cr&eacute;er un compte gratuit
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
