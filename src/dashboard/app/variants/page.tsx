'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

interface Variant {
  id: string;
  name: string;
  category: 'production' | 'design' | 'copy-test';
  route: string;
  emoji: string;
  score: number;
  summary: string;
}

const VARIANTS: Variant[] = [
  {
    id: 'main-v11',
    name: 'Landing Production',
    category: 'production',
    route: '/',
    emoji: '🚀',
    score: 71,
    summary: 'Version en production. Audience switcher, FAQ dynamiques, hero adaptatif, 13 sections complètes. Design Notion-style blanc + emojis.',
  },
  {
    id: 'gradient-wave',
    name: 'Gradient Wave',
    category: 'design',
    route: '/variants/gradient-wave',
    emoji: '🌊',
    score: 72,
    summary: 'Dégradés purple-cyan, glassmorphism. Style Linear/Vercel. Meilleur score design. Candidat pour A/B test.',
  },
  {
    id: 'roi-economie',
    name: 'ROI / Économies',
    category: 'copy-test',
    route: '/variants/copy-tests/roi-economie',
    emoji: '💰',
    score: 68,
    summary: 'Angle chiffres et économies. Comparaison coût IA vs salaire. Fort pour freelances sensibles au prix.',
  },
  {
    id: 'simplicite',
    name: 'Simplicité / Anti-tech',
    category: 'copy-test',
    route: '/variants/copy-tests/simplicite',
    emoji: '✨',
    score: 70,
    summary: 'Zéro complexité technique. "Envoyez un WhatsApp, votre IA fait le reste." Idéal pour cible non-tech.',
  },
  {
    id: 'probleme-solution',
    name: 'Problème → Solution',
    category: 'copy-test',
    route: '/variants/copy-tests/probleme-solution',
    emoji: '💡',
    score: 72,
    summary: 'Framework PAS. "Noyé dans l\'admin ? On a la solution." Meilleur score copy-test.',
  },
];

const CATEGORY_META: Record<Variant['category'], { label: string; color: string }> = {
  production: { label: 'PROD', color: '#22c55e' },
  design: { label: 'DESIGN', color: '#3b82f6' },
  'copy-test': { label: 'COPY', color: '#9333ea' },
};

function scoreColor(score: number) {
  if (score >= 65) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function VariantsRecapPage() {
  const [filter, setFilter] = useState<'all' | Variant['category']>('all');
  const filtered = filter === 'all' ? VARIANTS : VARIANTS.filter(v => v.category === filter);

  return (
    <>
      <PublicNav />
      <main style={{ minHeight: '100vh', background: '#fff', paddingTop: 56 }}>
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px 20px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
            📊 Variantes Landing
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 24 }}>
            {VARIANTS.length} variantes conservées pour tests A/B.
          </p>

          <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
            {(['all', 'production', 'design', 'copy-test'] as const).map(key => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E5E5',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: filter === key ? '#1A1A1A' : '#fff',
                  color: filter === key ? '#fff' : '#6B6B6B',
                }}
              >
                {key === 'all' ? `Toutes (${VARIANTS.length})` : CATEGORY_META[key].label}
              </button>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(v => {
              const cat = CATEGORY_META[v.category];
              return (
                <Link
                  key={v.id}
                  href={v.route}
                  target="_blank"
                  className="variant-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 8,
                    border: '1px solid #E5E5E5', background: '#fff',
                    textDecoration: 'none', color: '#1A1A1A',
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{v.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: `${cat.color}15`, color: cat.color,
                      }}>{cat.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.4, margin: 0 }}>{v.summary}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(v.score) }}>{v.score}</div>
                    <div style={{ fontSize: 10, color: '#9B9B9B' }}>/100</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
