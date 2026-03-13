'use client';

import { useState } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';

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
  const isMobile = useIsMobile();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.partners.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.partners.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.partners.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.partners.helpText} />
        </div>
        <p style={{ fontSize: 14, color: CU.textMuted, lineHeight: 1.6, marginTop: 12 }}>
          Decouvrez notre ecosysteme de partenaires de confiance. Des experts dans leur domaine pour completer les services de <span className="fz-logo-word">Freenzy.io</span>.
        </p>
      </div>
      <PageExplanation pageId="partners" text={PAGE_META.partners?.helpText} />

      {PARTNER_CATEGORIES.map((cat, catIdx) => (
        <div key={cat.title} style={{ marginBottom: 20 }}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
            style={{
              ...CU.card,
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px', background: CU.bgSecondary,
              cursor: 'pointer', textAlign: 'left' as const,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: 24 }}>{CATEGORY_EMOJIS[cat.emoji] ?? cat.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: CU.text }}>{cat.title}</div>
              <div style={{ fontSize: 12, color: CU.textMuted }}>{cat.subtitle}</div>
            </div>
            <span style={{ fontSize: 14, color: CU.textMuted, transform: expandedCategory === catIdx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>{expandedCategory === catIdx ? '▼' : '▶'}</span>
          </button>

          {expandedCategory === catIdx && (
            <div style={{ display: 'grid', gridTemplateColumns: cat.partners.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 12, marginTop: 12, paddingLeft: 8 }}>
              {cat.partners.map(partner => (
                <div key={partner.name} style={{
                  ...CU.card,
                  padding: 20,
                  position: 'relative' as const,
                }}>
                  {partner.comingSoon && (
                    <span style={{
                      position: 'absolute' as const, top: 12, right: 12,
                      ...CU.badge,
                      fontSize: 10, padding: '3px 8px',
                    }}>A venir</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: CU.accentLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 20 }}>{PARTNER_EMOJIS[partner.emoji] ?? partner.emoji}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{partner.name}</div>
                      <div style={{ fontSize: 11, color: CU.textSecondary, fontWeight: 600 }}>{partner.category}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.6, margin: '0 0 14px' }}>
                    {partner.description}
                  </p>
                  {partner.url && !partner.comingSoon && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: CU.textSecondary,
                        textDecoration: 'none',
                      }}
                    >
                      Visiter le site <span style={{ fontSize: 12 }}>&rarr;</span>
                    </a>
                  )}
                  {!partner.url && !partner.comingSoon && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: CU.textMuted }}>
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
        ...CU.card,
        marginTop: 32, padding: '20px 24px',
        background: CU.bgSecondary,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: CU.text, marginBottom: 6 }}>
          Devenir partenaire
        </div>
        <p style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.6, margin: 0 }}>
          Vous souhaitez rejoindre notre ecosysteme de partenaires ? Contactez-nous pour decouvrir les opportunites de collaboration et beneficier de la visibilite aupres de nos utilisateurs.
        </p>
      </div>
    </div>
  );
}
