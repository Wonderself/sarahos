'use client';

import { useState } from 'react';

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

const PARTNER_CATEGORIES = [
  {
    title: 'Production Video Professionnelle',
    subtitle: 'Nos partenaires specialistes en creation video',
    emoji: '🎬',
    partners: [
      {
        name: 'Lumieres Brothers',
        category: 'Films & Courts-metrages',
        description: 'Production de films et courts-metrages professionnels. Scenarisation, tournage, post-production et distribution. Ideal pour vos projets cinematographiques ambitieux.',
        emoji: '🎥',
        color: '#dc2626',
      },
      {
        name: 'RaiseUpFilms',
        category: 'Video Publicitaire',
        description: 'Creation de videos publicitaires haut de gamme. Spots TV, videos corporate, brand content et campagnes digitales. Du brief creatif a la livraison finale.',
        emoji: '📹',
        color: '#f97316',
      },
    ] as Partner[],
  },
  {
    title: 'Marketing & Business',
    subtitle: 'Accelerez votre croissance avec nos partenaires',
    emoji: '📈',
    partners: [
      {
        name: 'EYO Marketing',
        category: 'B2B2C Ultra-innovant',
        description: 'Solution marketing B2B2C de nouvelle generation. Automatisation, acquisition, fidélisation et analytics avances. Connectez-vous directement a la plateforme EYO.',
        emoji: '🚀',
        color: '#5b6cf7',
        url: 'https://eyo-app.com',
      },
    ] as Partner[],
  },
  {
    title: 'Edition & Publication',
    subtitle: 'Publiez vos oeuvres avec des professionnels',
    emoji: '📚',
    partners: [
      {
        name: 'Editez votre Livre',
        category: 'Maison d\'Edition',
        description: 'Publiez votre livre par une maison d\'edition professionnelle. Correction, mise en page, couverture, ISBN, distribution en librairies et en ligne. Accompagnement personnalise.',
        emoji: '📖',
        color: '#8b5cf6',
      },
    ] as Partner[],
  },
  {
    title: 'Formations',
    subtitle: 'Developpez vos competences avec nos partenaires',
    emoji: '🎓',
    partners: [
      {
        name: 'Formations IA & Business',
        category: 'Formation professionnelle',
        description: 'Formations en intelligence artificielle, marketing digital, management et developpement personnel. Programmes certifies adaptes a votre niveau.',
        emoji: '📘',
        color: '#0ea5e9',
        comingSoon: true,
      },
    ] as Partner[],
  },
  {
    title: 'Trading & Finance IA',
    subtitle: 'Optimisez vos investissements avec l\'IA',
    emoji: '📊',
    partners: [
      {
        name: 'Trading AI Partner',
        category: 'Finance & Trading',
        description: 'Solutions de trading algorithmique propulsees par l\'IA. Analyse de marches, signaux automatises et gestion de portefeuille intelligente.',
        emoji: '💹',
        color: '#10b981',
        comingSoon: true,
      },
    ] as Partner[],
  },
];

export default function PartnersPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: 8 }}>
          Nos Partenaires
        </h1>
        <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.6 }}>
          Decouvrez notre ecosysteme de partenaires de confiance. Des experts dans leur domaine pour completer les services de Freenzy.io.
        </p>
      </div>

      {PARTNER_CATEGORIES.map((cat, catIdx) => (
        <div key={cat.title} style={{ marginBottom: 20 }}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px', background: '#f5f5f7', borderRadius: 12,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: 24 }}>{cat.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f' }}>{cat.title}</div>
              <div style={{ fontSize: 12, color: '#86868b' }}>{cat.subtitle}</div>
            </div>
            <span style={{ fontSize: 14, color: '#86868b', transform: expandedCategory === catIdx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>&#9654;</span>
          </button>

          {expandedCategory === catIdx && (
            <div style={{ display: 'grid', gridTemplateColumns: cat.partners.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginTop: 12, paddingLeft: 8 }}>
              {cat.partners.map(partner => (
                <div key={partner.name} style={{
                  padding: '20px', borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.06)',
                  background: '#fff',
                  position: 'relative',
                }}>
                  {partner.comingSoon && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      background: '#fef3c7', color: '#92400e',
                    }}>A venir</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: partner.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {partner.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{partner.name}</div>
                      <div style={{ fontSize: 11, color: partner.color, fontWeight: 600 }}>{partner.category}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#86868b', lineHeight: 1.6, margin: '0 0 14px' }}>
                    {partner.description}
                  </p>
                  {partner.url && !partner.comingSoon && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: partner.color,
                        textDecoration: 'none',
                      }}
                    >
                      Visiter le site &#8594;
                    </a>
                  )}
                  {!partner.url && !partner.comingSoon && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#86868b' }}>
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
        background: '#f0f0ff', border: '1px solid #e0e0ff',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f', marginBottom: 6 }}>
          Devenir partenaire
        </div>
        <p style={{ fontSize: 12, color: '#86868b', lineHeight: 1.6, margin: 0 }}>
          Vous souhaitez rejoindre notre ecosysteme de partenaires ? Contactez-nous pour decouvrir les opportunites de collaboration et beneficier de la visibilite aupres de nos utilisateurs.
        </p>
      </div>
    </div>
  );
}
