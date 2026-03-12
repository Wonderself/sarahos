'use client';

import { useState } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

interface Partner {
  name: string;
  category: string;
  description: string;
  emoji: string;
  color: string;
  url?: string;
  logo?: string;
  comingSoon?: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  movie: '🎬',
  trending_up: '📈',
  library_books: '📚',
  school: '🎓',
  bar_chart: '📊',
};

const PARTNER_EMOJIS: Record<string, string> = {
  videocam: '📹',
  rocket_launch: '🚀',
  menu_book: '📖',
  trending_up: '📈',
};

const PARTNER_CATEGORIES = [
  {
    title: 'Production Video Professionnelle',
    subtitle: 'Nos partenaires specialistes en creation video',
    emoji: 'movie',
    partners: [
      {
        name: 'Lumieres Brothers',
        category: 'Films & Courts-metrages',
        description: 'Production de films et courts-metrages professionnels. Scenarisation, tournage, post-production et distribution. Ideal pour vos projets cinematographiques ambitieux.',
        emoji: 'videocam',
        color: '#1A1A1A',
      },
      {
        name: 'RaiseUpFilms',
        category: 'Video Publicitaire',
        description: 'Creation de videos publicitaires haut de gamme. Spots TV, videos corporate, brand content et campagnes digitales. Du brief creatif a la livraison finale.',
        emoji: 'videocam',
        color: '#6B6B6B',
      },
    ] as Partner[],
  },
  {
    title: 'Marketing & Business',
    subtitle: 'Accelerez votre croissance avec nos partenaires',
    emoji: 'trending_up',
    partners: [
      {
        name: 'EYO Marketing',
        category: 'B2B2C Ultra-innovant',
        description: 'Solution marketing B2B2C de nouvelle generation. Automatisation, acquisition, fidélisation et analytics avances. Connectez-vous directement a la plateforme EYO.',
        emoji: 'rocket_launch',
        color: '#1A1A1A',
        url: 'https://eyo-app.com',
      },
    ] as Partner[],
  },
  {
    title: 'Edition & Publication',
    subtitle: 'Publiez vos oeuvres avec des professionnels',
    emoji: 'library_books',
    partners: [
      {
        name: 'Editez votre Livre',
        category: 'Maison d\'Edition',
        description: 'Publiez votre livre par une maison d\'edition professionnelle. Correction, mise en page, couverture, ISBN, distribution en librairies et en ligne. Accompagnement personnalise.',
        emoji: 'menu_book',
        color: '#1A1A1A',
      },
    ] as Partner[],
  },
  {
    title: 'Formations',
    subtitle: 'Developpez vos competences avec nos partenaires',
    emoji: 'school',
    partners: [
      {
        name: 'Formations IA & Business',
        category: 'Formation professionnelle',
        description: 'Formations en intelligence artificielle, marketing digital, management et développement personnel. Programmes certifiés adaptés à votre niveau.',
        emoji: 'menu_book',
        color: '#9B9B9B',
        comingSoon: true,
      },
    ] as Partner[],
  },
  {
    title: 'Trading & Finance IA',
    subtitle: 'Optimisez vos investissements avec l\'IA',
    emoji: 'bar_chart',
    partners: [
      {
        name: 'Trading AI Partner',
        category: 'Finance & Trading',
        description: 'Solutions de trading algorithmique propulsees par l\'IA. Analyse de marches, signaux automatises et gestion de portefeuille intelligente.',
        emoji: 'trending_up',
        color: '#1A1A1A',
        comingSoon: true,
      },
    ] as Partner[],
  },
];

export default function PartnersPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.partners.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.partners.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.partners.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.partners.helpText} />
        </div>
        <p style={{ fontSize: 14, color: 'var(--fz-text-muted, #9B9B9B)', lineHeight: 1.6, marginTop: 12 }}>
          Decouvrez notre ecosysteme de partenaires de confiance. Des experts dans leur domaine pour completer les services de <span className="fz-logo-word">Freenzy.io</span>.
        </p>
      </div>
      <PageExplanation pageId="partners" text={PAGE_META.partners?.helpText} />

      {PARTNER_CATEGORIES.map((cat, catIdx) => (
        <div key={cat.title} style={{ marginBottom: 20 }}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px', background: 'var(--fz-bg-secondary, #F7F7F7)', borderRadius: 12,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: 24 }}>{CATEGORY_EMOJIS[cat.emoji] ?? cat.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)' }}>{cat.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)' }}>{cat.subtitle}</div>
            </div>
            <span style={{ fontSize: 14, color: 'var(--fz-text-muted, #9B9B9B)', transform: expandedCategory === catIdx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>{expandedCategory === catIdx ? '▼' : '▶'}</span>
          </button>

          {expandedCategory === catIdx && (
            <div style={{ display: 'grid', gridTemplateColumns: cat.partners.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginTop: 12, paddingLeft: 8 }}>
              {cat.partners.map(partner => (
                <div key={partner.name} style={{
                  padding: '20px', borderRadius: 12,
                  border: '1px solid var(--border-primary, #E5E5E5)',
                  background: 'var(--fz-bg, #fff)',
                  position: 'relative',
                }}>
                  {partner.comingSoon && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      background: '#F0F0F0', color: '#6B6B6B', border: '1px solid #E5E5E5',
                    }}>A venir</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: '#F0F0F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 20 }}>{PARTNER_EMOJIS[partner.emoji] ?? partner.emoji}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)' }}>{partner.name}</div>
                      <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>{partner.category}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)', lineHeight: 1.6, margin: '0 0 14px' }}>
                    {partner.description}
                  </p>
                  {partner.url && !partner.comingSoon && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: '#6B6B6B',
                        textDecoration: 'none',
                      }}
                    >
                      Visiter le site <span style={{ fontSize: 12 }}>&rarr;</span>
                    </a>
                  )}
                  {!partner.url && !partner.comingSoon && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-muted, #9B9B9B)' }}>
                      Contactez-nous pour en savoir plus
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Info box */}
      <div style={{
        marginTop: 32, padding: '20px 24px', borderRadius: 12,
        background: '#F7F7F7', border: '1px solid var(--border-primary, #E5E5E5)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)', marginBottom: 6 }}>
          Devenir partenaire
        </div>
        <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)', lineHeight: 1.6, margin: 0 }}>
          Vous souhaitez rejoindre notre ecosysteme de partenaires ? Contactez-nous pour decouvrir les opportunites de collaboration et beneficier de la visibilite aupres de nos utilisateurs.
        </p>
      </div>
    </div>
  );
}
