'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const COMPETITORS = [
  { name: 'Freenzy.io', price: 'Pay-as-you-go', highlight: true },
  { name: 'ChatGPT Plus', price: '20 $/mois', highlight: false },
  { name: 'Make / Zapier', price: '~50 $/mois', highlight: false },
  { name: 'Agence traditionnelle', price: '~2 000 \u20ac/mois', highlight: false },
];

interface ComparisonRow {
  label: string;
  icon: string;
  values: [string, string, string, string];
  freenzyBest: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: 'Prix mensuel',
    icon: '💳',
    values: ['À la consommation', '20 $/mois fixe', '~50 $/mois fixe', '~2 000 \u20ac/mois'],
    freenzyBest: true,
  },
  {
    label: "Nombre d'agents / fonctions",
    icon: '🤖',
    values: ['24 agents spécialisés', '1 assistant généraliste', 'Scénarios limités', 'Variable selon contrat'],
    freenzyBest: true,
  },
  {
    label: 'Personnalisation',
    icon: '🔧',
    values: ['\u2705 Complète', '\u274c Limitée', '\u274c Templates rigides', '\u2705 Sur devis'],
    freenzyBest: true,
  },
  {
    label: 'WhatsApp intégré',
    icon: '💬',
    values: ['\u2705 Natif', '\u274c Non', '\u274c Via plugin payant', '\u274c Rarement'],
    freenzyBest: true,
  },
  {
    label: 'Voix naturelle',
    icon: '🎙️',
    values: ['\u2705 ElevenLabs Premium', '\u274c Non', '\u274c Non', '\u274c Non'],
    freenzyBest: true,
  },
  {
    label: 'Génération documents',
    icon: '📄',
    values: ['\u2705 15+ modèles', '\u2705 Basique', '\u274c Non', '\u2705 Manuel'],
    freenzyBest: true,
  },
  {
    label: 'Commission',
    icon: '💰',
    values: ['0% à vie*', 'N/A', 'N/A', '15-30%'],
    freenzyBest: true,
  },
  {
    label: 'Support',
    icon: '🎧',
    values: ['\u2705 IA + humain', '\u274c Forum uniquement', '\u2705 Email', '\u2705 Dédié'],
    freenzyBest: true,
  },
  {
    label: 'Langue française native',
    icon: '🌐',
    values: ['\u2705 100% français', '\u274c Traduit', '\u274c Interface anglaise', '\u2705 Oui'],
    freenzyBest: true,
  },
];

const UNIQUE_FEATURES = [
  {
    icon: '🤖',
    title: '24 agents spécialisés coordonnés',
    description:
      'Pas un chatbot généraliste, mais 24 experts IA qui collaborent : commercial, juridique, RH, marketing, comptabilité et plus encore.',
  },
  {
    icon: '📞',
    title: 'Répondeur téléphonique IA',
    description:
      'Un vrai répondeur intelligent avec voix naturelle qui prend les appels, qualifie les demandes et envoie un compte-rendu par WhatsApp.',
  },
  {
    icon: '☀️',
    title: 'Briefing matinal personnalisé',
    description:
      'Chaque matin, un résumé intelligent de votre journée : rendez-vous, tâches prioritaires, alertes et opportunités détectées par vos agents.',
  },
  {
    icon: '💰',
    title: '0% commission à vie',
    description:
      'Pour les 5 000 premiers utilisateurs, aucune commission sur les transactions. Jamais. C\'est verrouillé à vie dans votre compte.',
  },
  {
    icon: '☁️',
    title: 'Mode hors-ligne',
    description:
      'Accédez à vos documents, contacts et historiques même sans connexion. Vos données sont synchronisées dès le retour en ligne.',
  },
];

export default function VsAlternativesPage() {
  return (
    <main aria-label="Comparaison Freenzy.io vs alternatives du marché" style={{ background: '#0f0720', minHeight: '100vh', color: '#ffffff' }}>
      <PublicNav />

      {/* Hero */}
      <section
        className="vs-hero"
        aria-label="Pourquoi choisir Freenzy.io face aux alternatives"
        style={{
          padding: 'clamp(100px, 14vw, 120px) 24px clamp(48px, 8vw, 80px)',
          textAlign: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 100,
            padding: '8px 20px',
            marginBottom: 32,
            fontSize: 14,
            color: '#7c3aed',
            fontWeight: 500,
          }}
        >
          <span role="img" aria-label="balance comparative" style={{ fontSize: 18 }}>⚖️</span>
          Comparaison concurrentielle
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-0.03em',
          }}
        >
          Pourquoi choisir{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Freenzy
          </span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          La seule plateforme qui combine 24 experts IA, 0% commission, et zéro abonnement.
        </p>
      </section>

      {/* sr-only SEO text */}
      <div className="sr-only" aria-hidden="false">
        <p>Comparaison complète entre Freenzy.io et les principales alternatives du marché : ChatGPT Plus (20$/mois, 1 assistant généraliste), Make et Zapier (~50$/mois, scénarios d&apos;automatisation limités), et les agences traditionnelles (~2000 euros/mois). Freenzy.io se distingue par ses 24 agents IA spécialisés coordonnés, son intégration WhatsApp native, la voix naturelle ElevenLabs, la génération de 15+ modèles de documents, 0% de commission à vie, et une interface 100% en français. Propulsé par Claude d&apos;Anthropic.</p>
      </div>

      {/* Comparison Table — desktop: scrollable table, mobile: stacked cards */}
      <section aria-label="Tableau comparatif Freenzy.io vs ChatGPT Plus vs Make/Zapier vs agences" style={{ padding: '0 24px clamp(48px, 8vw, 100px)', maxWidth: 1200, margin: '0 auto' }}>
        {/* Desktop table */}
        <div className="vs-table-desktop lp-table-scroll" style={{ borderRadius: 14 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: 700,
            }}
          >
            <caption className="sr-only">Comparaison fonctionnelle entre Freenzy.io, ChatGPT Plus, Make/Zapier et les agences traditionnelles — prix, agents, personnalisation, WhatsApp, voix, documents, commission, support, langue</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  style={{
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {'Fonctionnalité'}
                </th>
                {COMPETITORS.map((c) => (
                  <th
                    scope="col"
                    key={c.name}
                    style={{
                      textAlign: 'center',
                      padding: '16px 12px',
                      borderBottom: c.highlight
                        ? '2px solid #7c3aed'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: c.highlight ? '#7c3aed' : 'rgba(255,255,255,0.7)',
                      fontSize: 13,
                      fontWeight: c.highlight ? 700 : 500,
                      background: c.highlight ? 'rgba(124,58,237,0.06)' : 'transparent',
                      borderRadius: c.highlight ? '12px 12px 0 0' : 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div>{c.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: c.highlight ? '#7c3aed' : 'rgba(255,255,255,0.4)',
                        fontWeight: 400,
                        marginTop: 4,
                      }}
                    >
                      {c.price}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label}>
                  <td
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span role="img" aria-label={row.label} style={{ fontSize: 18 }}>
                        {row.icon}
                      </span>
                      {row.label}
                    </span>
                  </td>
                  {row.values.map((val, j) => (
                    <td
                      key={j}
                      style={{
                        textAlign: 'center',
                        padding: '14px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontSize: 13,
                        color:
                          j === 0
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.5)',
                        fontWeight: j === 0 ? 600 : 400,
                        background:
                          j === 0 ? 'rgba(124,58,237,0.06)' : 'transparent',
                        borderLeft:
                          j === 0
                            ? '1px solid rgba(124,58,237,0.15)'
                            : 'none',
                        borderRight:
                          j === 0
                            ? '1px solid rgba(124,58,237,0.15)'
                            : 'none',
                        borderRadius:
                          i === COMPARISON_ROWS.length - 1 && j === 0
                            ? '0 0 12px 12px'
                            : '0',
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — shown below 768px */}
        <div className="vs-cards-mobile">
          {COMPARISON_ROWS.map((row) => (
            <div key={row.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '16px',
              marginBottom: 10,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 12, fontSize: 14, fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
              }}>
                <span role="img" aria-label={row.label} style={{ fontSize: 18 }}>{row.icon}</span>
                {row.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {COMPETITORS.map((c, j) => (
                  <div key={c.name} style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: c.highlight ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${c.highlight ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600,
                      color: c.highlight ? '#7c3aed' : 'rgba(255,255,255,0.4)',
                      marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em',
                    }}>
                      {c.name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: c.highlight ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontWeight: c.highlight ? 600 : 400,
                      lineHeight: 1.4,
                    }}>
                      {row.values[j]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 16,
            textAlign: 'right',
          }}
        >
          {'* 0% commission pour les 5 000 premiers utilisateurs, verrouillé à vie.'}
        </p>
      </section>

      {/* 5 choses que seul Freenzy fait */}
      <section aria-label="5 fonctionnalités exclusives de Freenzy.io" style={{ padding: '0 24px clamp(48px, 8vw, 100px)', maxWidth: 1100, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          5 choses que{' '}
          <span style={{ color: '#7c3aed' }}>seul Freenzy</span> fait
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            marginBottom: 60,
            maxWidth: 600,
            margin: '0 auto 60px',
          }}
        >
          Des fonctionnalités exclusives qui n'existent nulle part ailleurs.
        </p>
        <div
          className="vs-features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {UNIQUE_FEATURES.map((feat, i) => (
            <div
              key={i}
              className="vs-feature-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 'clamp(20px, 4vw, 32px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(124,58,237,0.12)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#7c3aed',
                  }}
                >
                  {i + 1}
                </div>
                <span role="img" aria-label={feat.title} style={{ fontSize: 24 }}>
                  {feat.icon}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: '#ffffff',
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Inscription gratuite avec 50 crédits offerts" style={{ padding: '0 24px clamp(60px, 10vw, 120px)', textAlign: 'center' }}>
        <div
          className="vs-cta-box"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 'clamp(32px, 6vw, 60px) clamp(20px, 4vw, 40px)',
          }}
        >
          <span
            role="img"
            aria-label="fusée — démarrer"
            style={{
              fontSize: 48,
              marginBottom: 24,
              display: 'block',
            }}
          >
            🚀
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.3rem, 3vw, 2rem)',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Prêt à voir la différence ?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Rejoignez les premiers utilisateurs et bénéficiez de 50 crédits offerts
            pour tester tous les agents.
          </p>
          <Link
            href="/client/dashboard"
            title="Accedez au dashboard Freenzy.io gratuitement"
            className="vs-cta-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              minHeight: 48,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#ffffff',
              borderRadius: 12,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 600,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 28px rgba(124,58,237,0.3)',
            }}
          >
            {'Acceder a Freenzy — sans inscription'}
            <span style={{ fontSize: 20 }}>{'→'}</span>
          </Link>
        </div>
      </section>

      {/* Internal links SEO */}
      <nav aria-label="Pages associées" style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="sr-only"><h2>Liens utiles</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link href="/plans" title="Voir les tarifs détaillés et crédits IA de Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Tarifs et crédits
          </Link>
          <Link href="/claude" title="Découvrir la technologie Claude AI d'Anthropic utilisée par Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Technologie Claude AI
          </Link>
          <Link href="/whatsapp" title="Gérer votre entreprise par WhatsApp avec les agents IA Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Agents IA sur WhatsApp
          </Link>
          <Link href="/demo" title="Voir la démonstration de la plateforme Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Démonstration
          </Link>
        </div>
      </nav>

      <PublicFooter />
    </main>
  );
}
