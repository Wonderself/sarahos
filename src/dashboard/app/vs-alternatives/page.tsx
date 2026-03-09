'use client';

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
    icon: 'payments',
    values: ['À la consommation', '20 $/mois fixe', '~50 $/mois fixe', '~2 000 \u20ac/mois'],
    freenzyBest: true,
  },
  {
    label: "Nombre d'agents / fonctions",
    icon: 'smart_toy',
    values: ['24 agents spécialisés', '1 assistant généraliste', 'Scénarios limités', 'Variable selon contrat'],
    freenzyBest: true,
  },
  {
    label: 'Personnalisation',
    icon: 'tune',
    values: ['\u2705 Complète', '\u274c Limitée', '\u274c Templates rigides', '\u2705 Sur devis'],
    freenzyBest: true,
  },
  {
    label: 'WhatsApp intégré',
    icon: 'chat',
    values: ['\u2705 Natif', '\u274c Non', '\u274c Via plugin payant', '\u274c Rarement'],
    freenzyBest: true,
  },
  {
    label: 'Voix naturelle',
    icon: 'record_voice_over',
    values: ['\u2705 ElevenLabs Premium', '\u274c Non', '\u274c Non', '\u274c Non'],
    freenzyBest: true,
  },
  {
    label: 'Génération documents',
    icon: 'description',
    values: ['\u2705 15+ modèles', '\u2705 Basique', '\u274c Non', '\u2705 Manuel'],
    freenzyBest: true,
  },
  {
    label: 'Commission',
    icon: 'percent',
    values: ['0% à vie*', 'N/A', 'N/A', '15-30%'],
    freenzyBest: true,
  },
  {
    label: 'Support',
    icon: 'headset_mic',
    values: ['\u2705 IA + humain', '\u274c Forum uniquement', '\u2705 Email', '\u2705 Dédié'],
    freenzyBest: true,
  },
  {
    label: 'Langue française native',
    icon: 'translate',
    values: ['\u2705 100% français', '\u274c Traduit', '\u274c Interface anglaise', '\u2705 Oui'],
    freenzyBest: true,
  },
];

const UNIQUE_FEATURES = [
  {
    icon: 'hub',
    title: '24 agents spécialisés coordonnés',
    description:
      'Pas un chatbot généraliste, mais 24 experts IA qui collaborent : commercial, juridique, RH, marketing, comptabilité et plus encore.',
  },
  {
    icon: 'call',
    title: 'Répondeur téléphonique IA',
    description:
      'Un vrai répondeur intelligent avec voix naturelle qui prend les appels, qualifie les demandes et envoie un compte-rendu par WhatsApp.',
  },
  {
    icon: 'wb_sunny',
    title: 'Briefing matinal personnalisé',
    description:
      'Chaque matin, un résumé intelligent de votre journée : rendez-vous, tâches prioritaires, alertes et opportunités détectées par vos agents.',
  },
  {
    icon: 'money_off',
    title: '0% commission à vie',
    description:
      'Pour les 5 000 premiers utilisateurs, aucune commission sur les transactions. Jamais. C\'est verrouillé à vie dans votre compte.',
  },
  {
    icon: 'cloud_off',
    title: 'Mode hors-ligne',
    description:
      'Accédez à vos documents, contacts et historiques même sans connexion. Vos données sont synchronisées dès le retour en ligne.',
  },
];

export default function VsAlternativesPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#ffffff' }}>
      <PublicNav />

      {/* Hero */}
      <section
        style={{
          padding: '120px 24px 80px',
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
            background: 'rgba(91,108,247,0.12)',
            border: '1px solid rgba(91,108,247,0.3)',
            borderRadius: 100,
            padding: '8px 20px',
            marginBottom: 32,
            fontSize: 14,
            color: '#5b6cf7',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            compare_arrows
          </span>
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

      {/* Comparison Table */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: 800,
            }}
          >
            <thead>
              <tr>
                <th
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
                  Fonctionnalité
                </th>
                {COMPETITORS.map((c) => (
                  <th
                    key={c.name}
                    style={{
                      textAlign: 'center',
                      padding: '16px 16px',
                      borderBottom: c.highlight
                        ? '2px solid #5b6cf7'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: c.highlight ? '#5b6cf7' : 'rgba(255,255,255,0.7)',
                      fontSize: 14,
                      fontWeight: c.highlight ? 700 : 500,
                      background: c.highlight ? 'rgba(91,108,247,0.06)' : 'transparent',
                      borderRadius: c.highlight ? '12px 12px 0 0' : 0,
                    }}
                  >
                    <div>{c.name}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: c.highlight ? '#5b6cf7' : 'rgba(255,255,255,0.4)',
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
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      className="material-symbols-rounded"
                      style={{ fontSize: 20, color: '#5b6cf7' }}
                    >
                      {row.icon}
                    </span>
                    {row.label}
                  </td>
                  {row.values.map((val, j) => (
                    <td
                      key={j}
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontSize: 13,
                        color:
                          j === 0
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.5)',
                        fontWeight: j === 0 ? 600 : 400,
                        background:
                          j === 0 ? 'rgba(91,108,247,0.06)' : 'transparent',
                        borderLeft:
                          j === 0
                            ? '1px solid rgba(91,108,247,0.15)'
                            : 'none',
                        borderRight:
                          j === 0
                            ? '1px solid rgba(91,108,247,0.15)'
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
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 16,
            textAlign: 'right',
          }}
        >
          * 0% commission pour les 5 000 premiers utilisateurs, verrouillé à vie.
        </p>
      </section>

      {/* 5 choses que seul Freenzy fait */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
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
          <span style={{ color: '#5b6cf7' }}>seul Freenzy</span> fait
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
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          {UNIQUE_FEATURES.map((feat, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 32,
                flex: '1 1 300px',
                maxWidth: 340,
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
                    background: 'rgba(91,108,247,0.12)',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#5b6cf7',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 24, color: '#5b6cf7' }}
                >
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
      <section style={{ padding: '0 24px 120px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '60px 40px',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 48,
              color: '#5b6cf7',
              marginBottom: 24,
              display: 'block',
            }}
          >
            rocket_launch
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
          <a
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#ffffff',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Essayer gratuitement — 50 crédits offerts
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
              arrow_forward
            </span>
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
