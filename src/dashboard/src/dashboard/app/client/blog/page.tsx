'use client';

import { useState } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, cardGrid } from '../../../lib/page-styles';
import type { CSSProperties } from 'react';

/* ─── Types ─── */
interface Article {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
}

/* ─── Categories ─── */
const CATEGORIES = [
  'Tous',
  'IA Entreprise',
  'Marketing',
  'RH',
  'Juridique',
  'Productivité',
] as const;

type Category = (typeof CATEGORIES)[number];

/* ─── Articles ─── */
const ARTICLES: Article[] = [
  {
    title: "Comment l'IA transforme la gestion d'entreprise en 2026",
    slug: 'ia-gestion-entreprise',
    description:
      "Découvrez comment les entreprises utilisent l'intelligence artificielle pour automatiser leurs processus, prendre de meilleures décisions et gagner en productivité.",
    date: '2026-03-12',
    category: 'IA Entreprise',
    readTime: '7 min',
  },
  {
    title: 'Agents IA vs Chatbots : quelle différence pour votre entreprise ?',
    slug: 'agents-ia-vs-chatbots',
    description:
      "Les chatbots répondent à des questions. Les agents IA prennent des actions. Comprendre cette distinction est essentiel pour choisir la bonne solution pour votre activité.",
    date: '2026-03-10',
    category: 'IA Entreprise',
    readTime: '5 min',
  },
  {
    title: "L'assistant commercial IA : votre meilleur vendeur ne dort jamais",
    slug: 'assistant-commercial-ia',
    description:
      "Qualification de leads, relances automatiques, suivi pipeline : découvrez comment un assistant commercial IA peut transformer votre force de vente.",
    date: '2026-03-08',
    category: 'Marketing',
    readTime: '6 min',
  },
  {
    title: 'Marketing IA pour PME : guide pratique 2026',
    slug: 'marketing-ia-pme',
    description:
      "De la création de contenu à l'analyse des campagnes, voici comment les PME utilisent l'IA pour rivaliser avec les grandes entreprises en marketing digital.",
    date: '2026-03-05',
    category: 'Marketing',
    readTime: '8 min',
  },
  {
    title: 'Répondeur IA entreprise : ne perdez plus jamais un appel',
    slug: 'repondeur-ia-entreprise',
    description:
      "Un répondeur intelligent qui comprend les demandes, qualifie les appels et transmet les informations. Fini les opportunités manquées pendant vos réunions.",
    date: '2026-03-03',
    category: 'Productivité',
    readTime: '5 min',
  },
  {
    title: 'IA et RH : révolutionner le recrutement',
    slug: 'ia-rh-recrutement',
    description:
      "Tri de CV, pré-qualification, rédaction d'offres, onboarding : l'IA transforme chaque étape du recrutement pour les équipes RH modernes.",
    date: '2026-02-28',
    category: 'RH',
    readTime: '6 min',
  },
  {
    title: 'RGPD et IA : guide de conformité pour les PME',
    slug: 'rgpd-ia-conformite',
    description:
      "Utiliser l'IA tout en respectant le RGPD : consentement, minimisation des données, hébergement EU et bonnes pratiques pour rester en conformité.",
    date: '2026-02-25',
    category: 'Juridique',
    readTime: '7 min',
  },
  {
    title: 'Studio de création de contenu IA : le guide complet',
    slug: 'studio-creation-contenu',
    description:
      "Photos, vidéos, textes marketing : générez du contenu professionnel en quelques clics grâce aux outils de création IA intégrés dans Freenzy.",
    date: '2026-02-22',
    category: 'Marketing',
    readTime: '9 min',
  },
  {
    title: "Automatisation des tâches par l'IA : gagner 3h par jour",
    slug: 'automatisation-taches-ia',
    description:
      "Emails, facturation, relances, reporting : identifiez les tâches répétitives et laissez l'IA les exécuter pendant que vous vous concentrez sur l'essentiel.",
    date: '2026-02-18',
    category: 'Productivité',
    readTime: '6 min',
  },
  {
    title: 'Comparatif outils IA entreprise 2026',
    slug: 'comparatif-outils-ia',
    description:
      "Freenzy, ChatGPT Enterprise, Jasper, Copy.ai, Notion AI : comparaison détaillée des fonctionnalités, prix et cas d'usage pour choisir la meilleure solution.",
    date: '2026-02-15',
    category: 'IA Entreprise',
    readTime: '10 min',
  },
];

/* ─── Helpers ─── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function categoryColor(cat: string): string {
  switch (cat) {
    case 'IA Entreprise': return '#6366F1';
    case 'Marketing': return '#EC4899';
    case 'RH': return '#F59E0B';
    case 'Juridique': return '#10B981';
    case 'Productivité': return '#3B82F6';
    default: return CU.textSecondary;
  }
}

/* ─── Component ─── */
export default function BlogPage() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Tous');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Tous' || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={headerRow()}>
        <span style={{ fontSize: 22 }}>📚</span>
        <h1 style={CU.pageTitle}>Blog</h1>
      </div>
      <p style={{ ...CU.pageSubtitle, marginBottom: 20 }}>
        Guides pratiques et actualités IA pour les entreprises
      </p>

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...CU.input,
            maxWidth: isMobile ? '100%' : 400,
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
      }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 30,
                padding: '0 12px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : CU.textSecondary,
                background: isActive ? CU.accent : CU.bgSecondary,
                border: isActive ? 'none' : `1px solid ${CU.border}`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p style={{ fontSize: 12, color: CU.textMuted, marginBottom: 12 }}>
        {filtered.length} article{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Article grid */}
      <div style={cardGrid(isMobile, 2)}>
        {filtered.map((article) => {
          const isHovered = hoveredSlug === article.slug;
          return (
            <a
              key={article.slug}
              href={`/client/blog/${article.slug}`}
              onMouseEnter={() => setHoveredSlug(article.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{
                ...CU.cardHoverable,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                textDecoration: 'none',
                borderColor: isHovered ? '#C4C4C4' : CU.border,
                boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              } as CSSProperties}
            >
              {/* Category badge */}
              <span style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: 11,
                fontWeight: 600,
                color: categoryColor(article.category),
                background: `${categoryColor(article.category)}12`,
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                {article.category}
              </span>

              {/* Title */}
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: CU.text,
                margin: 0,
                lineHeight: 1.4,
              }}>
                {article.title}
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 13,
                color: CU.textMuted,
                margin: 0,
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {article.description}
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: 8,
                borderTop: `1px solid ${CU.border}`,
              }}>
                <span style={{ fontSize: 12, color: CU.textMuted }}>
                  {formatDate(article.date)} · {article.readTime}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: CU.text,
                }}>
                  Lire →
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: CU.textMuted,
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p style={{ fontSize: 14 }}>Aucun article trouvé pour cette recherche.</p>
        </div>
      )}
    </div>
  );
}
