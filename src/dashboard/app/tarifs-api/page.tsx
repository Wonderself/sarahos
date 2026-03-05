import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tarifs API — Prix par action IA | Freenzy.io',
  description: 'Tableau complet des coûts par action IA sur Flashboard : chat, email, post social, document, appel répondeur, WhatsApp, TTS ElevenLabs, image DALL-E, vidéo Runway. Pay-as-you-go au prix officiel.',
  keywords: [
    'tarif API IA', 'prix action IA', 'coût répondeur IA', 'prix par token IA',
    'coût Claude Anthropic', 'prix GPT-4 entreprise', 'coût ElevenLabs TTS',
    'prix appel IA Twilio', 'coût image DALL-E', 'prix vidéo Runway',
    'calculateur crédit IA', 'combien coûte IA PME', 'tarif WhatsApp IA',
  ],
  openGraph: {
    title: 'Tarifs API Freenzy — Prix par action IA détaillés',
    description: 'Chat, email, post social, appel répondeur, WhatsApp, voix TTS, image, vidéo. Tous les prix IA au détail, payez uniquement ce que vous utilisez.',
    type: 'website',
    url: 'https://freenzy.io/tarifs-api',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Tarifs API Freenzy.io' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@freenzyio',
    title: 'Tarifs API — Prix IA par action | Freenzy.io',
    description: 'Chat 0.5cr · Email 1.1cr · Appel répondeur 5cr · WhatsApp 0.4cr · Vidéo 40cr. Pay-as-you-go sans abonnement.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://freenzy.io/tarifs-api' },
};

const ACTION_COSTS = [
  { icon: '💬', action: 'Chat avec agent IA', model: 'Claude Haiku', credits: 0.5, per50: '100 chats', color: '#22c55e' },
  { icon: '✉️', action: 'Email professionnel', model: 'Claude Sonnet', credits: 1.1, per50: '45 emails', color: '#6366f1' },
  { icon: '📱', action: 'Post réseaux sociaux', model: 'Claude Haiku', credits: 0.8, per50: '62 posts', color: '#3b82f6' },
  { icon: '📄', action: 'Document complet', model: 'Claude Sonnet', credits: 3.5, per50: '14 docs', color: '#6366f1' },
  { icon: '📞', action: 'Appel répondeur IA', model: 'Twilio + Haiku', credits: 5, per50: '10 appels', color: '#f97316' },
  { icon: '📤', action: 'Appel sortant IA', model: 'Twilio + Sonnet', credits: 16, per50: '3 appels', color: '#f97316' },
  { icon: '💬', action: 'WhatsApp Business IA', model: 'Claude Haiku', credits: 0.4, per50: '125 msgs', color: '#22c55e' },
  { icon: '🗣️', action: 'Message vocal TTS', model: 'ElevenLabs', credits: 4.5, per50: '11 msgs', color: '#f59e0b' },
  { icon: '🖼️', action: 'Image IA créée', model: 'DALL-E · Flux', credits: 7, per50: '7 images', color: '#9333ea' },
  { icon: '🎬', action: 'Clip vidéo 30s', model: 'Runway ML', credits: 40, per50: '1 clip', color: '#ec4899' },
  { icon: '🤝', action: 'Réunion IA structurée', model: 'Claude Opus', credits: 8, per50: '6 réunions', color: '#9333ea' },
];

const DEPOSIT_OPTIONS = [
  { eur: 5, credits: 500, label: '' },
  { eur: 20, credits: 2000, label: 'Populaire' },
  { eur: 50, credits: 5000, label: '' },
  { eur: 100, credits: 10000, label: 'Pro' },
];

const MODEL_PRICES = [
  { model: 'Claude Haiku', input: '$0.80', output: '$4.00', usage: 'FAQ, chat, posts réseaux, WhatsApp', color: '#22c55e' },
  { model: 'Claude Sonnet', input: '$3.00', output: '$15.00', usage: 'Emails, documents, analyses', color: '#6366f1' },
  { model: 'Claude Opus', input: '$15.00', output: '$75.00', usage: 'Stratégie, DG, décisions critiques', color: '#9333ea' },
  { model: 'ElevenLabs TTS', input: '€0.18', output: '/ 1 000 chars', usage: 'Voix naturelle, messages vocaux', color: '#f59e0b' },
  { model: 'Twilio Voice', input: '$0.014', output: '/ min', usage: 'Appels entrants & sortants', color: '#f97316' },
  { model: 'Runway ML Gen-3', input: '$0.05', output: '/ seconde vidéo', usage: 'Génération vidéo', color: '#ec4899' },
];

export default function TarifsAPIPage() {
  const cell = { padding: '12px 16px', fontSize: 13, borderBottom: '1px solid #f0f0f0' } as const;

  return (
    <main style={{ paddingTop: 80, paddingBottom: 80, background: '#f7f7f7', minHeight: '100vh' }}>

      {/* Back link */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 28px' }}>
        <Link href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Retour à l'accueil
        </Link>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Freenzy.io</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 10 }}>
            Tarifs API
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 560, lineHeight: 1.6 }}>
            Prix officiel des fournisseurs · 0% de commission · 0% de marge · Facturation au centime près.
          </p>
        </div>

        {/* Principe */}
        <div style={{ background: '#0a0a0f', borderRadius: 14, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Comment ça marche</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: '1 crédit', sub: '≈ €0.01', desc: 'Unité de base' },
              { n: '0%', sub: 'de marge', desc: 'Prix officiel fournisseur' },
              { n: '0%', sub: 'commission', desc: 'Prix officiel fournisseur' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#a5b4fc', letterSpacing: -1 }}>{item.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ce que vous pouvez faire avec 50 crédits (5€) */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e5e5e7' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f', marginBottom: 4 }}>
            Ce que vous pouvez faire avec 50 crédits (5€) :
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
            Toutes les actions disponibles dès l&apos;inscription
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e7' }}>
                  <th style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Action</th>
                  <th style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Modèle</th>
                  <th style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Crédits/action</th>
                  <th style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>
                    Avec 50 cr (5€)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACTION_COSTS.map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...cell }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.icon}</span>
                        <span style={{ color: '#1d1d1f' }}>{item.action}</span>
                      </span>
                    </td>
                    <td style={{ ...cell, color: '#6b7280' }}>{item.model}</td>
                    <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: item.color }}>{item.credits}</td>
                    <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: item.color }}>{item.per50}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prix officiels des modèles */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e5e5e7' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f', marginBottom: 4 }}>Prix officiels des fournisseurs</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
            Freenzy applique exactement ces tarifs · sans marge · sans commission
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e7' }}>
                  <th style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Modèle</th>
                  <th style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Prix input</th>
                  <th style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Prix output</th>
                  <th style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Usage type</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_PRICES.map((m, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...cell }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontWeight: 700, color: '#1d1d1f' }}>{m.model}</span>
                      </span>
                    </td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{m.input}</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{m.output}</td>
                    <td style={{ ...cell, color: '#6b7280', fontSize: 12 }}>{m.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af' }}>
            * Prix OpenAI, Anthropic, ElevenLabs, Twilio, Runway publiés sur leurs sites respectifs. Mis à jour automatiquement.
          </div>
        </div>

        {/* Recharges */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e5e5e7' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f', marginBottom: 4 }}>Options de recharge</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
            Prépaiement · Renouvellement automatique optionnel · Zéro engagement
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {DEPOSIT_OPTIONS.map((opt, i) => (
              <div key={i} style={{
                flex: '1 0 100px',
                background: opt.label ? 'rgba(99,102,241,0.05)' : '#fafafa',
                border: opt.label ? '2px solid rgba(99,102,241,0.25)' : '1px solid #e5e5e7',
                borderRadius: 12, padding: '16px 20px', textAlign: 'center', position: 'relative',
              }}>
                {opt.label && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366f1', color: '#fff',
                    fontSize: 10, fontWeight: 800, padding: '2px 9px', borderRadius: 40, whiteSpace: 'nowrap',
                  }}>
                    {opt.label}
                  </div>
                )}
                <div style={{ fontSize: 22, fontWeight: 900, color: opt.label ? '#6366f1' : '#1d1d1f' }}>{opt.eur}€</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{opt.credits.toLocaleString()} crédits</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>≈ 1 cr / {(opt.eur / opt.credits * 100).toFixed(1)}€</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '14px 16px', background: '#f7f7f7', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📞</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Ligne téléphonique IA (optionnel)</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Numéro dédié via Twilio · activable depuis le dashboard · +1€/mois</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 900, color: '#22c55e', whiteSpace: 'nowrap' }}>+1€/mois</div>
          </div>
        </div>

        {/* Parrainage */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e5e5e7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f', marginBottom: 4 }}>Programme de parrainage</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Programme de parrainage bientôt disponible. Votre code sera généré automatiquement à l&apos;inscription.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>Format de votre code</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1', fontFamily: 'monospace', letterSpacing: 2 }}>FZ-XXXXXX</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <Link href="/login?mode=register" style={{
            display: 'inline-block', padding: '14px 36px',
            background: '#6366f1', color: '#fff',
            borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none',
          }}>
            Commencer gratuitement
          </Link>
          <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>Sans carte bancaire · Prépaiement uniquement</div>
        </div>

      </div>
    </main>
  );
}
