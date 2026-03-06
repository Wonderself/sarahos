'use client';

import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

const VARIANTS = [
  {
    slug: 'original',
    name: 'Original',
    desc: 'La version actuelle — blue-violet, focus agents IA & productivité.',
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
  },
  {
    slug: 'neon-futuriste',
    name: 'Neon Futuriste',
    desc: 'Cyberpunk, néons vifs, messaging agressif — « On remplace tout ».',
    colors: ['#00f0ff', '#0a001a', '#ff00aa'],
  },
  {
    slug: 'minimal-luxe',
    name: 'Minimal Luxe',
    desc: 'Minimaliste premium, tons neutres chauds — « L\'app essentielle ».',
    colors: ['#c8a97e', '#faf8f5', '#1a1a1a'],
  },
  {
    slug: 'bold-disrupteur',
    name: 'Bold Disrupteur',
    desc: 'Couleurs vives, typographie massive — « Le nouveau Facebook ».',
    colors: ['#ff3b30', '#ffe600', '#1a1a2e'],
  },
  {
    slug: 'gradient-wave',
    name: 'Gradient Wave',
    desc: 'Dégradés fluides, esthétique glassmorphism — « Le futur est là ».',
    colors: ['#7c3aed', '#06b6d4', '#f43f5e'],
  },
];

export default function VariantsIndex() {
  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56, minHeight: '100vh', background: '#0a0a0f' }}>
        <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#5b6cf7', marginBottom: 12 }}>
              Landing Page Variants
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700, color: '#fff', letterSpacing: -2, marginBottom: 12,
            }}>
              5 versions de la landing page
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 48 }}>
              Même structure de blocs, styles et textes différents. Cliquez pour prévisualiser.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {VARIANTS.map((v) => (
                <Link
                  key={v.slug}
                  href={`/variants/${v.slug}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '28px 24px', textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {v.colors.map((c, i) => (
                      <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                    {v.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    {v.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
