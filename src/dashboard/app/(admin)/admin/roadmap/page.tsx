export const dynamic = 'force-dynamic';

interface Integration {
  name: string;
  description: string;
  status: 'active' | 'planned' | 'future';
  signupUrl?: string;
  envVars: string[];
  difficulty: 'Facile' | 'Moyen' | 'Complexe';
  category: string;
  icon: string;
}

const INTEGRATIONS: Integration[] = [
  // Active
  {
    name: 'Anthropic Claude API',
    description: 'Modèles Sonnet (rapide) et Opus (avancé) pour tous les agents IA',
    status: 'active',
    signupUrl: 'https://console.anthropic.com',
    envVars: ['ANTHROPIC_API_KEY'],
    difficulty: 'Facile',
    category: 'IA',
    icon: '🤖',
  },
  {
    name: 'PostgreSQL',
    description: 'Base de données relationnelle principale avec pgvector',
    status: 'active',
    envVars: ['DATABASE_URL'],
    difficulty: 'Facile',
    category: 'Infrastructure',
    icon: '🗄️',
  },
  {
    name: 'Redis',
    description: 'Cache et sessions temps réel',
    status: 'active',
    envVars: ['REDIS_URL'],
    difficulty: 'Facile',
    category: 'Infrastructure',
    icon: '⚡',
  },
  {
    name: 'Resend (Email)',
    description: 'Envoi d\'emails transactionnels (confirmation, reset password)',
    status: 'active',
    signupUrl: 'https://resend.com',
    envVars: ['RESEND_API_KEY', 'EMAIL_FROM'],
    difficulty: 'Facile',
    category: 'Notifications',
    icon: '📧',
  },
  {
    name: 'JWT Auth',
    description: 'Authentification et autorisation par tokens JWT',
    status: 'active',
    envVars: ['JWT_SECRET'],
    difficulty: 'Facile',
    category: 'Sécurité',
    icon: '🔐',
  },
  // Planned (next)
  {
    name: 'Stripe',
    description: 'Paiements en ligne pour les packs de crédits. Intégration checkout + webhooks.',
    status: 'planned',
    signupUrl: 'https://dashboard.stripe.com',
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PUBLISHABLE_KEY'],
    difficulty: 'Moyen',
    category: 'Paiement',
    icon: '💳',
  },
  {
    name: 'Twilio (SMS)',
    description: 'Envoi de SMS pour notifications et alertes clients',
    status: 'planned',
    signupUrl: 'https://console.twilio.com',
    envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    difficulty: 'Moyen',
    category: 'Notifications',
    icon: '📱',
  },
  {
    name: 'Twilio WhatsApp',
    description: 'Intégration WhatsApp Business pour communication client via l\'agent Répondeur',
    status: 'planned',
    signupUrl: 'https://console.twilio.com',
    envVars: ['TWILIO_WHATSAPP_FROM'],
    difficulty: 'Moyen',
    category: 'Notifications',
    icon: '💬',
  },
  // Future
  {
    name: 'ElevenLabs (TTS)',
    description: 'Synthèse vocale pour donner une voix à Sarah. Voix naturelle en français.',
    status: 'future',
    signupUrl: 'https://elevenlabs.io',
    envVars: ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'],
    difficulty: 'Facile',
    category: 'Avatar',
    icon: '🎙️',
  },
  {
    name: 'Deepgram (ASR)',
    description: 'Transcription vocale temps réel. Convertit la voix du client en texte pour le chat.',
    status: 'future',
    signupUrl: 'https://console.deepgram.com',
    envVars: ['DEEPGRAM_API_KEY'],
    difficulty: 'Facile',
    category: 'Avatar',
    icon: '🎧',
  },
  {
    name: 'D-ID (Avatar Video)',
    description: 'Avatar vidéo animé en temps réel. Sarah et Emmanuel en vidéo.',
    status: 'future',
    signupUrl: 'https://studio.d-id.com',
    envVars: ['DID_API_KEY'],
    difficulty: 'Moyen',
    category: 'Avatar',
    icon: '🎥',
  },
  {
    name: 'Google Calendar',
    description: 'Synchronisation agenda pour l\'agent Assistante. Planification automatique de réunions.',
    status: 'future',
    signupUrl: 'https://console.cloud.google.com',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
    difficulty: 'Complexe',
    category: 'Productivité',
    icon: '📅',
  },
  {
    name: 'Slack',
    description: 'Bot Slack pour interagir avec Sarah depuis un workspace Slack.',
    status: 'future',
    signupUrl: 'https://api.slack.com/apps',
    envVars: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
    difficulty: 'Moyen',
    category: 'Productivité',
    icon: '💼',
  },
  {
    name: 'Meta Business (Facebook/Instagram)',
    description: 'Publication automatique sur les réseaux sociaux par l\'agent Marketing.',
    status: 'future',
    signupUrl: 'https://business.facebook.com',
    envVars: ['META_ACCESS_TOKEN', 'META_APP_SECRET', 'META_PAGE_ID'],
    difficulty: 'Complexe',
    category: 'Marketing',
    icon: '📣',
  },
  {
    name: 'LinkedIn API',
    description: 'Publication de posts et articles LinkedIn automatisés.',
    status: 'future',
    signupUrl: 'https://www.linkedin.com/developers',
    envVars: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_ORG_ID'],
    difficulty: 'Complexe',
    category: 'Marketing',
    icon: '💼',
  },
  {
    name: 'Mistral / Llama (LLM Open Source)',
    description: 'Modèles IA open source pour réduire les coûts. Alternative à Anthropic pour les tâches simples.',
    status: 'future',
    signupUrl: 'https://mistral.ai',
    envVars: ['MISTRAL_API_KEY'],
    difficulty: 'Moyen',
    category: 'IA',
    icon: '🧠',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Actif', color: '#22c55e', bg: '#22c55e15' },
  planned: { label: 'Prochainement', color: '#f59e0b', bg: '#f59e0b15' },
  future: { label: 'Prévu', color: '#6366f1', bg: '#6366f115' },
};

const DIFFICULTY_CONFIG = {
  Facile: { color: '#22c55e' },
  Moyen: { color: '#f59e0b' },
  Complexe: { color: '#ef4444' },
};

export default function RoadmapPage() {
  const activeIntegrations = INTEGRATIONS.filter(i => i.status === 'active');
  const plannedIntegrations = INTEGRATIONS.filter(i => i.status === 'planned');
  const futureIntegrations = INTEGRATIONS.filter(i => i.status === 'future');

  function IntegrationCard({ integration }: { integration: Integration }) {
    const statusCfg = STATUS_CONFIG[integration.status];
    const diffCfg = DIFFICULTY_CONFIG[integration.difficulty];
    return (
      <div className="card card-lift p-20">
        <div className="flex flex-between mb-12" style={{ alignItems: 'flex-start' }}>
          <div className="flex gap-8 items-center">
            <span style={{ fontSize: 24 }}>{integration.icon}</span>
            <div>
              <div className="text-base font-bold">{integration.name}</div>
              <span style={{ fontSize: 10 }} className="text-muted">{integration.category}</span>
            </div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: statusCfg.bg, color: statusCfg.color,
          }}>
            {statusCfg.label}
          </span>
        </div>

        <div className="text-md text-secondary mb-12" style={{ lineHeight: 1.5 }}>
          {integration.description}
        </div>

        {integration.envVars.length > 0 && (
          <div className="mb-12">
            <div className="text-xs font-semibold text-muted" style={{ marginBottom: 4 }}>Variables .env requises :</div>
            <div className="flex flex-wrap gap-4">
              {integration.envVars.map(v => (
                <code key={v} className="text-xs text-mono bg-tertiary text-secondary" style={{ padding: '2px 6px', borderRadius: 4 }}>
                  {v}
                </code>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-between items-center">
          <span className="text-xs font-semibold" style={{ color: diffCfg.color }}>
            Difficulté : {integration.difficulty}
          </span>
          {integration.signupUrl && (
            <a
              href={integration.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent flex items-center gap-4"
              style={{ textDecoration: 'none' }}
            >
              S&apos;inscrire →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Roadmap & Intégrations</h1>
        <p className="page-subtitle">
          État des intégrations et prochaines étapes du projet SARAH OS
        </p>
      </div>

      {/* ═══ Progress bar ═══ */}
      <section className="section">
        <div className="card p-20">
          <div className="flex flex-between mb-8">
            <span className="text-md font-semibold">Progression globale</span>
            <span className="text-md text-accent font-bold">
              {activeIntegrations.length}/{INTEGRATIONS.length} intégrations actives
            </span>
          </div>
          <div className="progress-bar progress-bar-lg">
            <div className="progress-bar-fill" style={{
              width: `${Math.round(activeIntegrations.length / INTEGRATIONS.length * 100)}%`,
            }} />
          </div>
          <div className="flex gap-16 mt-12">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className="text-xs flex items-center gap-4">
                <span style={{ width: 8, height: 8, borderRadius: 4, background: cfg.color, display: 'inline-block' }} />
                {cfg.label}: {INTEGRATIONS.filter(i => i.status === key).length}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Active ═══ */}
      <section className="section">
        <h2 className="section-title" style={{ color: '#22c55e' }}>Intégrations actives</h2>
        <div className="grid-3 gap-12">
          {activeIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
        </div>
      </section>

      {/* ═══ Planned ═══ */}
      <section className="section">
        <h2 className="section-title" style={{ color: '#f59e0b' }}>Prochainement</h2>
        <p className="text-md text-tertiary mb-16">
          Ces intégrations sont prioritaires et seront implémentées dans les prochaines semaines.
        </p>
        <div className="grid-3 gap-12">
          {plannedIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
        </div>
      </section>

      {/* ═══ Future ═══ */}
      <section className="section">
        <h2 className="section-title" style={{ color: '#6366f1' }}>Prévu (moyen terme)</h2>
        <p className="text-md text-tertiary mb-16">
          Ces intégrations sont prévues pour enrichir les capacités de Sarah OS.
          Inscrivez-vous dès maintenant pour obtenir vos clés API.
        </p>
        <div className="grid-3 gap-12">
          {futureIntegrations.map(i => <IntegrationCard key={i.name} integration={i} />)}
        </div>
      </section>

      {/* ═══ Timeline ═══ */}
      <section className="section">
        <h2 className="section-title">Roadmap Produit</h2>
        <div className="card p-24">
          {[
            {
              phase: 'Phase actuelle',
              status: 'active' as const,
              items: ['Dashboard admin + client (34+ pages)', '15 agents IA (Sonnet L1/L2 + Opus L3)', 'Billing micro-crédits + marge 20%', 'Auth JWT + RBAC (4 rôles)', 'Chat, réunions, documents, briefings', 'Codes promo, campagnes, notifications', 'Streaming SSE + Extended Thinking'],
            },
            {
              phase: 'Phase suivante',
              status: 'planned' as const,
              items: ['Paiements Stripe (checkout + webhooks)', 'Notifications SMS/WhatsApp (Twilio)', 'Historique et export conversations', 'Améliorations UX et performance'],
            },
            {
              phase: 'Phase future',
              status: 'future' as const,
              items: ['Avatar vidéo Sarah/Emmanuel (D-ID)', 'Voix naturelle (ElevenLabs TTS)', 'Transcription vocale (Deepgram ASR)', 'Intégrations sociales (Meta, LinkedIn)', 'Synchronisation calendrier (Google)', 'Bot Slack', 'LLMs open source (Mistral, Llama)'],
            },
          ].map((p, i) => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <div key={i} className="pl-20" style={{
                borderLeft: `3px solid ${cfg.color}`,
                marginBottom: i < 2 ? 24 : 0, paddingBottom: i < 2 ? 24 : 0,
              }}>
                <div className="flex items-center gap-8 mb-8">
                  <span style={{
                    width: 12, height: 12, borderRadius: 6, background: cfg.color,
                    display: 'inline-block', marginLeft: -30,
                  }} />
                  <span style={{ fontSize: 15 }} className="font-bold">{p.phase}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    background: cfg.bg, color: cfg.color, fontWeight: 600,
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <ul className="text-md text-secondary" style={{ paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                  {p.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ Quick setup guide ═══ */}
      <section className="section">
        <h2 className="section-title">État de la configuration</h2>
        <div className="card p-20">
          <div className="flex flex-col gap-6">
            {[
              { name: 'Anthropic API Key', status: 'ok', desc: 'Clé API Claude configurée et fonctionnelle' },
              { name: 'PostgreSQL', status: 'ok', desc: 'Base de données principale avec pgvector' },
              { name: 'Redis', status: 'ok', desc: 'Cache et sessions temps réel' },
              { name: 'JWT Auth', status: 'ok', desc: 'Authentification par token avec 4 rôles' },
              { name: 'Email (Resend)', status: 'opt', desc: 'Optionnel — fonctionne en mode log si non configuré' },
              { name: 'Stripe (Paiements)', status: 'next', desc: 'Prochaine intégration — dépôts manuels en attendant' },
              { name: 'Twilio SMS/WhatsApp', status: 'next', desc: 'Prochaine intégration — notifications log-only en attendant' },
              { name: 'ElevenLabs / Deepgram / D-ID', status: 'future', desc: 'Pipeline avatar — prévu pour phase future' },
            ].map(item => (
              <div key={item.name} className="flex items-center gap-12 bg-secondary rounded-sm border" style={{ padding: '8px 14px' }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 5, flexShrink: 0,
                  background: item.status === 'ok' ? '#22c55e' : item.status === 'opt' ? '#f59e0b' : item.status === 'next' ? '#f59e0b' : '#6366f1',
                }} />
                <span className="text-md font-semibold" style={{ minWidth: 200 }}>{item.name}</span>
                <span className="text-sm text-secondary">{item.desc}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0,
                  background: item.status === 'ok' ? '#22c55e15' : item.status === 'opt' ? '#f59e0b15' : item.status === 'next' ? '#f59e0b15' : '#6366f115',
                  color: item.status === 'ok' ? '#22c55e' : item.status === 'opt' ? '#f59e0b' : item.status === 'next' ? '#f59e0b' : '#6366f1',
                }}>
                  {item.status === 'ok' ? 'Actif' : item.status === 'opt' ? 'Optionnel' : item.status === 'next' ? 'Prochainement' : 'Prévu'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
