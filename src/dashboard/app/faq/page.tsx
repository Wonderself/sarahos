'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { FAQ_CATEGORIES } from '../../lib/faq-data';

/* ═══════════════════════════════════════════════════════════
   FREENZY.IO — FAQ (100+ questions)
   ═══════════════════════════════════════════════════════════ */

const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSec: '#FAFAFA',
};

export default function FaqPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (activeCat === 'all' && !search) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .map(cat => ({
        ...cat,
        questions: cat.questions.filter(q => {
          if (activeCat !== 'all' && cat.id !== activeCat) return false;
          if (search) {
            const s = search.toLowerCase();
            return q.q.toLowerCase().includes(s) || q.a.toLowerCase().includes(s);
          }
          return true;
        }),
      }))
      .filter(cat => cat.questions.length > 0);
  }, [activeCat, search]);

  const totalCount = filteredCategories.reduce((s, c) => s + c.questions.length, 0);

  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56, minHeight: '100vh', background: C.bg }}>
        <section style={{ padding: '60px 24px 80px', maxWidth: 900, margin: '0 auto' }}>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 8, textAlign: 'center' }}>
            Questions fréquentes 💬
          </h1>
          <p style={{ fontSize: 16, color: C.secondary, textAlign: 'center', marginBottom: 32 }}>
            {totalCount} questions pour tout comprendre sur Freenzy.io
          </p>

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <input
              type="text"
              placeholder="🔍 Rechercher une question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            <button
              onClick={() => setActiveCat('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${activeCat === 'all' ? C.text : C.border}`,
                background: activeCat === 'all' ? C.text : C.bg,
                color: activeCat === 'all' ? '#fff' : C.secondary,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Toutes
            </button>
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1px solid ${activeCat === cat.id ? cat.color : C.border}`,
                  background: activeCat === cat.id ? cat.color : C.bg,
                  color: activeCat === cat.id ? '#fff' : C.secondary,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          {filteredCategories.map(cat => (
            <div key={cat.id} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 12 }}>
                {cat.icon} {cat.label}
              </h2>
              {cat.questions.map((faq, idx) => {
                const faqId = `${cat.id}-${idx}`;
                const isOpen = openId === faqId;
                return (
                  <div
                    key={faqId}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      marginBottom: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faqId)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: isOpen ? C.bgSec : C.bg,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                        fontSize: 14,
                        fontWeight: 500,
                        color: C.text,
                        minHeight: 44,
                      }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ fontSize: 18, marginLeft: 12, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: C.secondary,
                        background: C.bgSec,
                        borderTop: `1px solid ${C.border}`,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {totalCount === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>
              Aucune question trouvée pour &quot;{search}&quot;
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/" style={{ color: C.secondary, fontSize: 14, textDecoration: 'none' }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
