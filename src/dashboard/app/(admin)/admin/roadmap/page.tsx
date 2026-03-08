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
    icon: 'smart_toy',
  },
  {
    name: 'PostgreSQL',
    description: 'Base de données relationnelle principale avec pgvector',
    status: 'active',
    envVars: ['DATABASE_URL'],
    difficulty: 'Facile',
    category: 'Infrastructure',
    icon: 'database',
  },
  {
    name: 'Redis',
    description: 'Cache et sessions temps réel',
    status: 'active',
    envVars: ['REDIS_URL'],
    difficulty: 'Facile',
    category: 'Infrastructure',
    icon: 'bolt',
  },
  {
    name: 'Resend (Email)',
    description: 'Envoi d\'emails transactionnels (confirmation, reset password)',
    status: 'active',
    signupUrl: 'https://resend.com',
    envVars: ['RESEND_API_KEY', 'EMAIL_FROM'],
    difficulty: 'Facile',
    category: 'Notifications',
    icon: 'mail',
  },
  {
    name: 'JWT Auth',
    description: 'Authentification et autorisation par tokens JWT',
    status: 'active',
    envVars: ['JWT_SECRET'],
    difficulty: 'Facile',
    category: 'Sécurité',
    icon: 'lock',
  },
  {
    name: 'Twilio (SMS + Voice)',
    description: 'SMS, appels vocaux, répondeur IA, WebRTC. SDK réel intégré avec dégradation gracieuse.',
    status: 'active',
    signupUrl: 'https://console.twilio.com',
    envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
    difficulty: 'Moyen',
    category: 'Téléphonie',
    icon: 'phone_iphone',
  },
  {
    name: 'Twilio WhatsApp',
    description: 'WhatsApp Business intégré : liaison téléphone, conversations, messages vocaux, répondeur.',
    status: 'active',
    signupUrl: 'https://console.twilio.com',
    envVars: ['TWILIO_WHATSAPP_FROM'],
    difficulty: 'Moyen',
    category: 'Messagerie',
    icon: 'chat',
  },
  {
    name: 'ElevenLabs (TTS)',
    description: 'Synthèse vocale premium (eleven_multilingual_v2). 7 voix françaises, Visio Agents, répondeur vocal.',
    status: 'active',
    signupUrl: 'https://elevenlabs.io',
    envVars: ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'],
    difficulty: 'Facile',
    category: 'Voix',
    icon: 'mic',
  },
  {
    name: 'fal.ai (Photo & Video IA)',
    description: 'Génération de photos (Flux/schnell) et vidéos (LTX Video) par IA. Studio créatif intégré.',
    status: 'active',
    signupUrl: 'https://fal.ai',
    envVars: ['FAL_KEY'],
    difficulty: 'Facile',
    category: 'Création',
    icon: 'palette',
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
    icon: 'credit_card',
  },
  // Future
  {
    name: 'Deepgram (ASR)',
    description: 'Transcription vocale temps réel. Convertit la voix du client en texte pour le chat.',
    status: 'future',
    signupUrl: 'https://console.deepgram.com',
    envVars: ['DEEPGRAM_API_KEY'],
    difficulty: 'Facile',
    category: 'Avatar',
    icon: 'headphones',
  },
  {
    name: 'D-ID (Avatar Video)',
    description: 'Avatar vidéo animé en temps réel. Maëva et Emmanuel en vidéo.',
    status: 'future',
    signupUrl: 'https://studio.d-id.com',
    envVars: ['DID_API_KEY'],
    difficulty: 'Moyen',
    category: 'Avatar',
    icon: 'videocam',
  },
  {
    name: 'Google Calendar',
    description: 'Synchronisation agenda pour l\'agent Assistante. Planification automatique de réunions.',
    status: 'future',
    signupUrl: 'https://console.cloud.google.com',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
    difficulty: 'Complexe',
    category: 'Productivité',
    icon: 'calendar_month',
  },
  {
    name: 'Slack',
    description: 'Bot Slack pour interagir avec Freenzy depuis un workspace Slack.',
    status: 'future',
    signupUrl: 'https://api.slack.com/apps',
    envVars: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
    difficulty: 'Moyen',
    category: 'Productivité',
    icon: 'work',
  },
  {
    name: 'Meta Business (Facebook/Instagram)',
    description: 'Publication automatique sur les réseaux sociaux par l\'agent Marketing.',
    status: 'future',
    signupUrl: 'https://business.facebook.com',
    envVars: ['META_ACCESS_TOKEN', 'META_APP_SECRET', 'META_PAGE_ID'],
    difficulty: 'Complexe',
    category: 'Marketing',
    icon: 'campaign',
  },
  {
    name: 'LinkedIn API',
    description: 'Publication de posts et articles LinkedIn automatisés.',
    status: 'future',
    signupUrl: 'https://www.linkedin.com/developers',
    envVars: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_ORG_ID'],
    difficulty: 'Complexe',
    category: 'Marketing',
    icon: 'work',
  },
  {
    name: 'Mistral / Llama (LLM Open Source)',
    description: 'Modèles IA open source pour réduire les coûts. Alternative à Anthropic pour les tâches simples.',
    status: 'future',
    signupUrl: 'https://mistral.ai',
    envVars: ['MISTRAL_API_KEY'],
    difficulty: 'Moyen',
    category: 'IA',
    icon: 'psychology',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Actif', color: '#22c55e', bg: '#22c55e15' },
  planned: { label: 'Prochainement', color: '#f59e0b', bg: '#f59e0b15' },
  future: { label: 'Prévu', color: '#5b6cf7', bg: '#5b6cf715' },
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
            <span className="material-symbols-rounded" style={{ fontSize: 24 }}>{integration.icon}</span>
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
    <div className="admin-page-scrollable">
      <div className="page-header">
        <h1 className="page-title">Roadmap & Intégrations</h1>
        <p className="page-subtitle">
          État des intégrations et prochaines étapes du projet Freenzy.io
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
        <h2 className="section-title" style={{ color: '#5b6cf7' }}>Prévu (moyen terme)</h2>
        <p className="text-md text-tertiary mb-16">
          Ces intégrations sont prévues pour enrichir les capacités de Freenzy.io.
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
              phase: 'Phase actuelle (v0.17.0 — Phase 18)',
              status: 'active' as const,
              items: [
                'Dashboard admin + client (80+ pages)',
                '34 agents IA (22+12 L1, 4 L2, 4 L3)',
                'Deep Discussions (85+ templates, Opus, tags, partage social)',
                'Studio créatif fal.ai (photo + vidéo IA)',
                'Admin Dashboard refondu (charts, diagnostics, 2FA, GlobalSearch)',
                'Billing micro-crédits + marge 20% + auto-recharge',
                'Auth JWT + RBAC + 2FA TOTP + sessions + reset password',
                'Twilio SDK intégré (SMS, Voice, WhatsApp, répondeur IA)',
                'ElevenLabs TTS (7 voix, Visio Agents, répondeur vocal)',
                'Streaming SSE + Extended Thinking Opus',
                'Multi-projets avec isolation complète',
                'Réveil intelligent (appel IA matinal programmable)',
                'Marketplace agents (48 templates)',
              ],
            },
            {
              phase: 'Phase suivante (Phase 19)',
              status: 'planned' as const,
              items: [
                'Paiements Stripe (checkout + webhooks + abonnements)',
                'Factures PDF automatiques',
                'Deepgram ASR (transcription temps réel)',
                'Améliorations UX et performance',
              ],
            },
            {
              phase: 'Phase future (Phases 20-21+)',
              status: 'future' as const,
              items: [
                'Avatar vidéo D-ID Streaming (Sarah/Emmanuel)',
                'Intégrations sociales (Meta Business, LinkedIn, X)',
                'Synchronisation calendrier (Google Calendar)',
                'Bot Slack',
                'LLMs open source (Mistral, Llama)',
                'Application mobile',
              ],
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
              { name: 'Anthropic API Key', status: 'ok', desc: 'Claude Sonnet (L1/L2) + Opus avec Extended Thinking (L3)' },
              { name: 'PostgreSQL + pgvector', status: 'ok', desc: '28+ tables, embeddings vectoriels, audit complet' },
              { name: 'Redis', status: 'ok', desc: 'Cache, sessions temps réel, streaming SSE' },
              { name: 'JWT Auth + RBAC + 2FA', status: 'ok', desc: '4 rôles, sessions, reset password, TOTP 2FA' },
              { name: 'Twilio (SMS + Voice + WhatsApp)', status: 'ok', desc: 'SDK réel intégré, répondeur IA, appels entrants/sortants' },
              { name: 'ElevenLabs TTS', status: 'ok', desc: '7 voix françaises, Visio Agents, eleven_multilingual_v2' },
              { name: 'fal.ai (Photo & Video)', status: 'ok', desc: 'Studio créatif — Flux/schnell (photo) + LTX Video (vidéo)' },
              { name: 'Email (Resend)', status: 'opt', desc: 'Optionnel — fonctionne en mode log si non configuré' },
              { name: 'Stripe (Paiements)', status: 'next', desc: 'Prochaine intégration — dépôts manuels en attendant' },
              { name: 'Deepgram / D-ID', status: 'future', desc: 'ASR temps réel et avatar vidéo — prévu pour phase future' },
            ].map(item => (
              <div key={item.name} className="flex items-center gap-12 bg-secondary rounded-sm border" style={{ padding: '8px 14px' }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 5, flexShrink: 0,
                  background: item.status === 'ok' ? '#22c55e' : item.status === 'opt' ? '#f59e0b' : item.status === 'next' ? '#f59e0b' : '#5b6cf7',
                }} />
                <span className="text-md font-semibold" style={{ minWidth: 200 }}>{item.name}</span>
                <span className="text-sm text-secondary">{item.desc}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0,
                  background: item.status === 'ok' ? '#22c55e15' : item.status === 'opt' ? '#f59e0b15' : item.status === 'next' ? '#f59e0b15' : '#5b6cf715',
                  color: item.status === 'ok' ? '#22c55e' : item.status === 'opt' ? '#f59e0b' : item.status === 'next' ? '#f59e0b' : '#5b6cf7',
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
