export const dynamic = 'force-dynamic';
export const revalidate = 10;

const CODE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  background: 'var(--bg-tertiary)',
  padding: '2px 6px',
  borderRadius: 4,
};

const CODE_BLOCK_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  background: 'var(--bg-tertiary)',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  lineHeight: 1.7,
  overflowX: 'auto',
  whiteSpace: 'pre',
  border: '1px solid var(--border-primary)',
};

const STEP_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  padding: '10px 0',
  borderBottom: '1px solid var(--border-primary)',
  alignItems: 'flex-start',
};

const STEP_NUM_STYLE: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: 'var(--accent)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 800,
  flexShrink: 0,
};

const SECTIONS = [
  { id: 'architecture', icon: 'architecture', label: 'Architecture' },
  { id: 'add-page', icon: 'description', label: 'Ajouter une page' },
  { id: 'add-agent', icon: 'smart_toy', label: 'Ajouter un agent' },
  { id: 'pricing', icon: 'savings', label: 'Modifier le pricing' },
  { id: 'integrations', icon: 'power', label: 'Intégrations' },
  { id: 'deploy', icon: 'rocket_launch', label: 'Déploiement' },
  { id: 'troubleshooting', icon: 'build', label: 'Troubleshooting' },
  { id: 'evolutions', icon: 'calendar_month', label: 'Évolutions hebdo' },
];

export default function GuidePage() {
  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <h1 className="page-title">Guide de Gestion</h1>
        <p className="page-subtitle">
          Tout ce qu&apos;il faut savoir pour gérer, évoluer et déployer Freenzy.io.
        </p>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-6 mb-24 bg-secondary rounded-md border" style={{ padding: '12px 16px' }}>
        {SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-sm font-semibold text-secondary rounded-full border-secondary"
            style={{
              padding: '6px 14px', background: 'var(--bg-primary)',
              border: '1px solid var(--border-secondary)', textDecoration: 'none',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{s.icon}</span> {s.label}
          </a>
        ))}
      </div>

      {/* ═══ 1. Architecture ═══ */}
      <section id="architecture" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>architecture</span> Architecture du projet</h2>
        <div className="card p-20">
          <div style={CODE_BLOCK_STYLE}>{`Freenzy.io Dashboard
├── src/dashboard/
│   ├── app/
│   │   ├── layout.tsx          → Sidebar admin (AdminShell)
│   │   ├── page.tsx            → Page d'accueil admin (Overview)
│   │   ├── globals.css         → Tous les styles CSS (~1000 classes)
│   │   ├── admin/              → Pages admin (server components)
│   │   ├── client/
│   │   │   ├── layout.tsx      → Sidebar client (session, credits, gamification)
│   │   │   └── [pages]/        → Pages client ('use client')
│   │   ├── system/             → Pages systeme (agents, events, approvals...)
│   │   ├── infra/              → Pages infra (health, memory, metrics...)
│   │   └── api/                → API routes (proxy vers backend port 3010)
│   ├── components/
│   │   ├── AdminShell.tsx      → Shell admin avec sidebar + health check
│   │   └── NavLink.tsx         → Composant lien actif sidebar
│   └── lib/
│       ├── agent-config.ts     → 34 agents IA, configs, system prompts (~2200 lignes)
│       ├── api-client.ts       → Client API serveur (backend)
│       ├── deep-discussion.*   → Deep Discussions (85+ templates, utils)
│       └── gamification.ts     → Moteur XP / niveaux / achievements
└── Backend Express 5 (port 3010)
    ├── 34 agents IA (22+12 L1 + 4 L2 + 4 L3)
    ├── PostgreSQL 16 + pgvector
    ├── Redis 7
    ├── fal.ai (photo + video)
    └── 80+ endpoints API`}</div>

          <div className="mt-16">
            <h3 className="text-base font-bold mb-8">Concepts clés</h3>
            <div className="flex flex-col gap-8">
              {[
                { label: 'Pages admin', desc: 'Composants serveur (server components). Pas de useState, pas de localStorage. Données chargées côté serveur via api-client.ts.' },
                { label: 'Pages client', desc: 'Composants client (\'use client\'). Utilisent useState, useEffect, localStorage. Authentification par token JWT stocké dans localStorage.' },
                { label: 'API routes', desc: 'Fichiers route.ts dans app/api/. Servent de proxy vers le backend Express (port 3010). Évitent les problèmes CORS.' },
                { label: 'Agent config', desc: 'Tout est dans lib/agent-config.ts (~2200 lignes) : 34 agents client (22 business + 12 personnels), leurs prompts, personnalités, expertises. Le backend gère 34 agents (22+12 L1 + 4 L2 + 4 L3). Les pages importent DEFAULT_AGENTS pour afficher les agents.' },
                { label: 'Stockage client', desc: 'localStorage avec préfixe fz_ : fz_session, fz_company_profile, fz_agent_configs, fz_chat_history, fz_gamification, etc.' },
                { label: 'Styles CSS', desc: 'Un seul fichier globals.css avec ~1000 classes réutilisables (.card, .btn, .grid-2, .badge, .section, etc.). Pas de Tailwind.' },
              ].map(c => (
                <div key={c.label} className="flex gap-8" style={{ alignItems: 'flex-start' }}>
                  <span style={{ ...CODE_STYLE, flexShrink: 0, fontWeight: 700 }}>{c.label}</span>
                  <span className="text-md text-secondary">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. Ajouter une page ═══ */}
      <section id="add-page" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>description</span> Ajouter une page</h2>
        <div className="card p-20">
          {[
            {
              step: 1,
              title: 'Choisir la section',
              content: (
                <div>
                  <div className="flex flex-wrap gap-8" style={{ marginTop: 4 }}>
                    {[
                      { section: 'admin/', desc: 'Pages de gestion (stats, users, billing)', icon: 'build' },
                      { section: 'client/', desc: 'Pages client interactives (chat, docs, équipe)', icon: 'person' },
                      { section: 'system/', desc: 'Pages système (agents, events, tâches)', icon: 'settings' },
                      { section: 'infra/', desc: 'Pages infrastructure (health, metrics, mémoire)', icon: 'desktop_windows' },
                    ].map(s => (
                      <div key={s.section} className="bg-tertiary rounded-sm border" style={{ flex: '1 1 200px', padding: '8px 12px' }}>
                        <div className="text-md font-bold"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>{s.icon}</span> {s.section}</div>
                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              step: 2,
              title: 'Choisir le type de page',
              content: (
                <div className="flex flex-col gap-8">
                  <div className="flex gap-8">
                    <div className="flex-1 rounded-sm" style={{ padding: '10px 14px', border: '2px solid var(--accent)', background: 'var(--accent-bg)' }}>
                      <div className="text-md font-bold" style={{ marginBottom: 4 }}>Page Admin (serveur)</div>
                      <div className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                        Données chargées côté serveur. Idéal pour les tableaux de bord, stats, listes. Pas d&apos;interactivité directe (pas de clics, formulaires).
                      </div>
                    </div>
                    <div className="flex-1 rounded-sm" style={{ padding: '10px 14px', border: '2px solid #f59e0b', background: '#f59e0b10' }}>
                      <div className="text-md font-bold" style={{ marginBottom: 4 }}>Page Client (interactive)</div>
                      <div className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                        Pour les pages interactives : formulaires, chat, boutons. Utilise le localStorage pour la session utilisateur.
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              step: 3,
              title: 'Créer le fichier de page',
              content: (
                <span>
                  Créer un fichier <strong>page.tsx</strong> dans le dossier de la section choisie. Par exemple pour une page &laquo; Rapports &raquo; admin, créer le fichier dans <strong>app/admin/rapports/page.tsx</strong>.
                </span>
              ),
            },
            {
              step: 4,
              title: 'Ajouter le lien dans la sidebar',
              content: (
                <div>
                  <div className="flex gap-8">
                    <div className="flex-1 bg-tertiary rounded-sm border" style={{ padding: '8px 12px' }}>
                      <div className="text-sm font-bold">Admin / System / Infra</div>
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        Ajouter le lien dans <strong>app/layout.tsx</strong>, tableau navSections
                      </div>
                    </div>
                    <div className="flex-1 bg-tertiary rounded-sm border" style={{ padding: '8px 12px' }}>
                      <div className="text-sm font-bold">Client</div>
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        Ajouter le lien dans <strong>app/client/layout.tsx</strong>, tableau NAV_SECTIONS
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              step: 5,
              title: 'Utiliser les composants CSS existants',
              content: (
                <div>
                  <span>Plus de 1 000 classes CSS prêtes à l&apos;emploi — pas besoin de CSS custom :</span>
                  <div className="flex flex-wrap gap-6 mt-8">
                    {[
                      { cls: 'card', desc: 'Conteneur avec bordure' },
                      { cls: 'grid-2 / grid-3', desc: 'Grilles responsives' },
                      { cls: 'section', desc: 'Espacement vertical' },
                      { cls: 'btn / btn-primary', desc: 'Boutons' },
                      { cls: 'badge', desc: 'Étiquettes' },
                      { cls: 'stat-card', desc: 'Cartes de statistiques' },
                      { cls: 'data-table', desc: 'Tableaux de données' },
                      { cls: 'alert', desc: 'Messages d\'info/erreur' },
                      { cls: 'tabs / tab', desc: 'Onglets' },
                    ].map(c => (
                      <span key={c.cls} className="text-xs bg-tertiary border" style={{
                        padding: '4px 10px', borderRadius: 6, display: 'inline-flex', gap: 4,
                      }}>
                        <strong>{c.cls}</strong>
                        <span className="text-muted">— {c.desc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              step: 6,
              title: 'Vérifier le build',
              content: (
                <span>
                  Lancer le build du dashboard pour vérifier qu&apos;il n&apos;y a aucune erreur. Résultat attendu : toutes les ~80 routes compilées sans erreur.
                </span>
              ),
            },
          ].map(s => (
            <div key={s.step} style={STEP_STYLE}>
              <div style={STEP_NUM_STYLE}>{s.step}</div>
              <div className="flex-1">
                <div className="text-base font-bold" style={{ marginBottom: 4 }}>{s.title}</div>
                <div className="text-md text-secondary leading-relaxed">{s.content}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 3. Ajouter un agent ═══ */}
      <section id="add-agent" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>smart_toy</span> Ajouter un agent</h2>
        <div className="card p-20">
          <div className="alert alert-info mb-16">
            Un seul fichier à modifier : <strong>lib/agent-config.ts</strong>. Le nouvel agent apparaîtra automatiquement partout dans l&apos;application.
          </div>

          {[
            {
              step: 1,
              title: 'Définir l\'identifiant',
              content: (
                <span>
                  Ajouter un nouvel identifiant unique dans la liste des types d&apos;agents (ex : <strong>fz-juridique</strong>, <strong>fz-finance</strong>).
                </span>
              ),
            },
            {
              step: 2,
              title: 'Remplir la fiche de l\'agent',
              content: (
                <div>
                  <span>Chaque agent nécessite ces informations :</span>
                  <div className="card table-responsive" style={{ padding: 0, overflow: 'hidden', marginTop: 8 }}>
                    <table className="data-table text-sm">
                      <tbody>
                        {[
                          ['Nom & Rôle', 'Ex : Maëva — Directrice Juridique'],
                          ['Tagline', 'Description courte affichée sur la carte (1 ligne)'],
                          ['Emoji & Couleur', 'Identité visuelle de l\'agent (emoji + couleur hex)'],
                          ['Modèle IA', 'Sonnet (rapide, économique) ou Opus (avancé, raisonnement)'],
                          ['Niveau', 'Business, Advanced, ou Enterprise'],
                          ['Coût indicatif', 'Nombre de crédits affiché (indicatif, le coût réel = tokens consommés)'],
                          ['Pitch de recrutement', 'Texte de présentation pour convaincre de recruter l\'agent'],
                          ['Capacités', 'Liste de 3 à 5 compétences clés'],
                          ['Domaines', 'Secteurs d\'activité compatibles'],
                        ].map(([label, desc]) => (
                          <tr key={label}>
                            <td className="font-semibold" style={{ whiteSpace: 'nowrap' }}>{label}</td>
                            <td className="text-secondary">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            },
            {
              step: 3,
              title: 'Propagation automatique',
              content: (
                <div>
                  <span>Le nouvel agent apparaît instantanément dans :</span>
                  <div className="flex flex-wrap gap-6 mt-8">
                    {[
                      { page: 'Chat', icon: 'chat', desc: 'Sélecteur d\'agents' },
                      { page: 'Réunions', icon: 'handshake', desc: 'Liste des participants' },
                      { page: 'Équipe', icon: 'group', desc: 'Fiche agent recrutement' },
                      { page: 'Agent Studio', icon: 'palette', desc: 'Personnalisation' },
                    ].map(p => (
                      <span key={p.page} className="text-sm bg-tertiary border items-center" style={{
                        padding: '6px 12px', borderRadius: 8, display: 'inline-flex', gap: 6,
                      }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{p.icon}</span>
                        <strong>{p.page}</strong>
                        <span className="text-xs text-muted">— {p.desc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ),
            },
          ].map(s => (
            <div key={s.step} style={STEP_STYLE}>
              <div style={STEP_NUM_STYLE}>{s.step}</div>
              <div className="flex-1">
                <div className="text-base font-bold" style={{ marginBottom: 4 }}>{s.title}</div>
                <div className="text-md text-secondary leading-relaxed">{s.content}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 4. Modifier le pricing ═══ */}
      <section id="pricing" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>savings</span> Modifier le pricing</h2>
        <div className="card p-20">
          <h3 className="text-base font-bold mb-12">Packs de crédits</h3>
          <p className="text-md text-secondary mb-8 leading-relaxed">
            Modifier les packs dans le fichier <strong>lib/agent-config.ts</strong> (tableau CREDIT_PACKS).
          </p>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>Pack</th>
                  <th>Crédits</th>
                  <th>Prix</th>
                  <th>Marge</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Starter</td>
                  <td>800</td>
                  <td>9 &euro;</td>
                  <td>20%</td>
                  <td className="text-muted">Pour les nouveaux clients</td>
                </tr>
                <tr style={{ background: 'var(--accent-bg)' }}>
                  <td className="font-semibold">Pro <span className="badge badge-info" style={{ fontSize: 9, marginLeft: 4 }}>Populaire</span></td>
                  <td>2 500</td>
                  <td>25 &euro;</td>
                  <td>15%</td>
                  <td className="text-muted">Pack recommandé</td>
                </tr>
                <tr>
                  <td className="font-semibold">Enterprise</td>
                  <td>10 000</td>
                  <td>99 &euro;</td>
                  <td>10%</td>
                  <td className="text-muted">Gros consommateurs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold mb-12 mt-16">Coût par token</h3>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table text-sm">
              <thead>
                <tr>
                  <th>Modèle</th>
                  <th>Input (par 1M tokens)</th>
                  <th>Output (par 1M tokens)</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Claude Sonnet</td>
                  <td>300 micro-credits</td>
                  <td>1 500 micro-credits</td>
                  <td className="text-muted">Agents L1 & L2 (rapide)</td>
                </tr>
                <tr>
                  <td className="font-semibold">Claude Opus</td>
                  <td>1 500 micro-credits</td>
                  <td>7 500 micro-credits</td>
                  <td className="text-muted">Agents L3 (raisonnement avancé)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted mt-8">
            Marge globale configurable via la variable d&apos;environnement <strong>TOKEN_MARGIN_PERCENT</strong> (défaut : 20%). Les prix sont dans <strong>src/billing/pricing.ts</strong>.
          </p>

          <h3 className="text-base font-bold mb-12 mt-16">Prix par agent</h3>
          <p className="text-md text-secondary leading-relaxed">
            Chaque agent affiche un <strong>coût indicatif</strong> en crédits sur sa carte (champ priceCredits). C&apos;est un indicateur de complexité — le coût réel est toujours calculé à partir des tokens réellement consommés.
          </p>
        </div>
      </section>

      {/* ═══ 5. Integrations ═══ */}
      <section id="integrations" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>power</span> Connecter une intégration</h2>
        <div className="alert alert-info mb-16">
          Pattern général : ajouter les variables .env → créer le service → créer la route API → connecter au frontend.
          <br />Voir la page <a href="/admin/roadmap" style={{ color: 'var(--accent)', fontWeight: 600 }}>Roadmap</a> pour la liste complète des intégrations.
        </div>

        <div className="flex flex-col gap-12">
          {[
            {
              name: 'Stripe (Paiements)',
              icon: 'credit_card',
              difficulty: 'Moyen',
              steps: [
                'Créer un compte sur stripe.com et récupérer les clés API',
                'Ajouter STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET dans .env',
                'Créer un endpoint /billing/checkout dans le backend Express',
                'Créer un webhook /billing/stripe-webhook pour les confirmations',
                'Mettre à jour le wallet utilisateur après paiement confirmé',
                'Remplacer l\'alerte placeholder dans /client/account par un vrai bouton Stripe Checkout',
              ],
            },
            {
              name: 'Twilio (SMS/WhatsApp)',
              icon: 'phone_iphone',
              difficulty: 'Moyen',
              steps: [
                'Créer un compte sur twilio.com',
                'Ajouter TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE dans .env',
                'Creer src/services/twilio.ts avec les fonctions sendSMS() et sendWhatsApp()',
                'Connecter au service de notifications existant (remplacer les stubs log-only)',
              ],
            },
            {
              name: 'ElevenLabs (Voix TTS)',
              icon: 'volume_up',
              difficulty: 'Facile',
              steps: [
                'Créer un compte sur elevenlabs.io et copier l\'API key',
                'Ajouter ELEVENLABS_API_KEY dans .env',
                'Créer src/services/tts.ts avec textToSpeech(text, voiceId)',
                'Connecter au pipeline avatar dans /infra/avatar',
              ],
            },
            {
              name: 'Resend (Email transactionnel)',
              icon: 'mail',
              difficulty: 'Facile',
              steps: [
                'Créer un compte sur resend.com',
                'Ajouter RESEND_API_KEY dans .env',
                'Le service d\'email est déjà codé dans le backend — activer l\'envoi réel en décommentant le code dans notification-service.ts',
              ],
            },
            {
              name: 'fal.ai (Photo & Video IA)',
              icon: 'palette',
              difficulty: 'Facile',
              steps: [
                'Déjà intégré — fal.ai Flux/schnell pour les photos (synchrone)',
                'fal.ai LTX Video pour les vidéos (async queue)',
                'Routes : /api/photo et /api/video dans le dashboard',
                'Coûts : 8 crédits (image), 12 crédits (HD), 20 crédits (vidéo)',
              ],
            },
          ].map(integ => (
            <div key={integ.name} className="card p-16">
              <div className="flex items-center gap-8 mb-8">
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{integ.icon}</span>
                <span className="text-base font-bold">{integ.name}</span>
                <span className="badge badge-info" style={{ fontSize: 10 }}>{integ.difficulty}</span>
              </div>
              <ol className="text-sm text-secondary" style={{ lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                {integ.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 6. Deploiement ═══ */}
      <section id="deploy" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span> Déploiement</h2>
        <div className="card p-20">
          <h3 className="text-base font-bold mb-12">Développement local</h3>
          <div className="flex flex-col gap-8">
            {[
              { action: 'Lancer le backend', commande: 'docker compose up -d', result: 'PostgreSQL + Redis + Backend sur le port 3010' },
              { action: 'Voir les logs', commande: 'docker compose logs -f backend', result: 'Logs en temps réel du serveur' },
              { action: 'Lancer le dashboard', commande: 'cd src/dashboard && npm run dev', result: 'Dashboard sur http://localhost:3001' },
            ].map(c => (
              <div key={c.action} className="flex gap-12 items-center bg-tertiary rounded-sm border" style={{ padding: '8px 12px' }}>
                <span className="text-md font-semibold" style={{ minWidth: 160 }}>{c.action}</span>
                <span className="text-sm text-mono text-accent flex-1">{c.commande}</span>
                <span className="text-xs text-muted">{c.result}</span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold mb-12 mt-16">Build de production</h3>
          <div className="flex gap-12">
            <div className="flex-1 bg-secondary rounded-sm border" style={{ padding: 14 }}>
              <div className="text-md font-bold mb-8">Backend</div>
              <div className="text-sm text-secondary" style={{ lineHeight: 1.8 }}>
                Compilation TypeScript + Exécution des tests<br />
                <strong>88+ suites, 700+ tests</strong> — tous passent<br />
                0 erreur TypeScript, 0 erreur lint
              </div>
            </div>
            <div className="flex-1 bg-secondary rounded-sm border" style={{ padding: 14 }}>
              <div className="text-md font-bold mb-8">Dashboard</div>
              <div className="text-sm text-secondary" style={{ lineHeight: 1.8 }}>
                Compilation Next.js (~80 routes)<br />
                <strong>80+ pages</strong> admin + client<br />
                Build optimisé pour la production
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold mb-12 mt-16">Checklist production</h3>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variable .env</th>
                  <th>Description</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ANTHROPIC_API_KEY', 'Clé API Anthropic (Claude)', 'Configuré', 'success'],
                  ['JWT_SECRET', 'Secret pour signer les tokens JWT', 'À changer en prod', 'danger'],
                  ['ENCRYPTION_KEY', 'Clé de chiffrement 32 bytes', 'À changer en prod', 'danger'],
                  ['DATABASE_URL', 'URL PostgreSQL', 'Configuré', 'success'],
                  ['REDIS_URL', 'URL Redis', 'Configuré', 'success'],
                  ['NODE_ENV', 'Passer à "production"', 'Actuellement dev', 'warning'],
                  ['CORS_ORIGINS', 'Domaines autorisés (https://votre-domaine.com)', 'À configurer', 'warning'],
                  ['RESEND_API_KEY', 'Clé API Resend (emails transactionnels)', 'Optionnel', 'info'],
                  ['STRIPE_SECRET_KEY', 'Clé Stripe (paiements en ligne)', 'Phase suivante', 'info'],
                ].map(([key, desc, status, color]) => (
                  <tr key={key}>
                    <td className="font-bold text-sm">{key}</td>
                    <td className="text-md">{desc}</td>
                    <td>
                      <span className={`badge badge-${color}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ 7. Troubleshooting ═══ */}
      <section id="troubleshooting" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>build</span> Troubleshooting</h2>
        <div className="flex flex-col gap-8">
          {[
            {
              prob: 'Backend inaccessible / erreur 500',
              cause: 'Docker pas lancé ou backend crash',
              sol: 'Relancer Docker Compose, puis vérifier les logs du backend pour identifier l\'erreur.',
              severity: 'danger',
            },
            {
              prob: 'Crédits insuffisants (erreur 402)',
              cause: 'Le wallet de l\'utilisateur est vide',
              sol: 'Aller dans la page Utilisateurs, sélectionner l\'utilisateur et lui ajouter des crédits. Ou utiliser l\'endpoint /billing/deposit.',
              severity: 'warning',
            },
            {
              prob: 'Un agent ne répond pas',
              cause: 'Clé API Anthropic manquante ou invalide',
              sol: 'Vérifier que ANTHROPIC_API_KEY est bien renseignée dans le fichier .env, puis redémarrer le backend.',
              severity: 'warning',
            },
            {
              prob: 'Page blanche / erreur hydration',
              cause: 'Utilisation de hooks React dans un composant serveur',
              sol: 'Si la page utilise useState, useEffect ou d\'autres hooks, ajouter la directive "use client" en haut du fichier.',
              severity: 'info',
            },
            {
              prob: 'Erreur de build TypeScript',
              cause: 'Import manquant ou type incorrect',
              sol: 'Lancer le type-checker pour voir les erreurs détaillées. Vérifier les imports et les types des props.',
              severity: 'info',
            },
            {
              prob: 'Session perdue / localStorage vide',
              cause: 'Données du navigateur effacées ou quota dépassé',
              sol: 'Vider le cache du navigateur et se reconnecter. Les données de session seront recréées.',
              severity: 'info',
            },
            {
              prob: 'Nouveau lien absent de la sidebar',
              cause: 'Le lien n\'a pas été ajouté au bon fichier de layout',
              sol: 'Pages admin/system/infra : modifier layout.tsx (navSections). Pages client : modifier client/layout.tsx (NAV_SECTIONS).',
              severity: 'info',
            },
            {
              prob: 'API retourne 401 Unauthorized',
              cause: 'Token JWT expiré (durée de vie : 24h)',
              sol: 'Se déconnecter puis se reconnecter pour obtenir un nouveau token d\'authentification.',
              severity: 'warning',
            },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 14, borderLeft: `3px solid var(--${item.severity === 'danger' ? 'danger' : item.severity === 'warning' ? 'warning' : 'info'})` }}>
              <div className="flex flex-between items-center" style={{ marginBottom: 6 }}>
                <span className="text-md font-bold">{item.prob}</span>
                <span className={`badge badge-${item.severity}`} style={{ fontSize: 10 }}>
                  {item.severity === 'danger' ? 'Critique' : item.severity === 'warning' ? 'Moyen' : 'Mineur'}
                </span>
              </div>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>
                Cause : {item.cause}
              </div>
              <div className="text-sm text-secondary" style={{ lineHeight: 1.5 }}>
                → {item.sol}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 8. Évolutions hebdo ═══ */}
      <section id="evolutions" className="section">
        <h2 className="section-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>calendar_month</span> Évolutions hebdomadaires</h2>
        <div className="card p-20">
          <div className="alert alert-info mb-16">
            <strong>Règle d&apos;or :</strong> Chaque évolution après la mise en ligne initiale doit être testée séparément par l&apos;admin avant d&apos;être déployée en production. Un cycle par semaine.
          </div>

          <h3 className="text-base font-bold mb-12">Processus hebdomadaire</h3>
          {[
            {
              step: 1,
              title: 'Lundi — Identifier l\'évolution de la semaine',
              content: (
                <div>
                  Choisir UNE seule amélioration à déployer cette semaine. Exemples :<br />
                  <div className="flex flex-wrap gap-6" style={{ marginTop: 6 }}>
                    {[
                      'Optimiser un system prompt',
                      'Ajouter un template de document',
                      'Ajuster un formulaire de stratégie',
                      'Améliorer la FAQ automatique',
                      'Corriger un bug signalé',
                      'Ajouter un preset de personnalité',
                    ].map(ex => (
                      <span key={ex} style={{ ...CODE_STYLE, fontSize: 11 }}>{ex}</span>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              step: 2,
              title: 'Mardi-Mercredi — Implémenter sur branche séparée',
              content: (
                <span>
                  Créer une branche Git : <code style={CODE_STYLE}>git checkout -b evolution/sem-XX</code><br />
                  Faire les modifications. Lancer <code style={CODE_STYLE}>npm run build</code> pour vérifier.
                </span>
              ),
            },
            {
              step: 3,
              title: 'Jeudi — Tester en admin',
              content: (
                <div>
                  Déployer la branche sur un environnement de test (ou tester en local).<br />
                  <strong>Checklist de test :</strong>
                  <ol style={{ fontSize: 12, paddingLeft: 20, marginTop: 4, lineHeight: 1.8 }}>
                    <li>La page / fonctionnalité modifiée fonctionne correctement</li>
                    <li>Les pages adjacentes ne sont pas cassées</li>
                    <li>Le chat fonctionne toujours (envoyer 2-3 messages)</li>
                    <li>Le build passe sans erreur (<code style={CODE_STYLE}>npm run build</code>)</li>
                    <li>La consommation de tokens est raisonnable (pas de régression)</li>
                  </ol>
                </div>
              ),
            },
            {
              step: 4,
              title: 'Vendredi — Déployer ou reporter',
              content: (
                <span>
                  Si tout est OK : fusionner dans main et déployer.<br />
                  Si un problème est détecté : reporter à la semaine suivante et corriger.
                  <br /><br />
                  <strong>Ne jamais déployer un vendredi soir.</strong> Toujours déployer en début de journée.
                </span>
              ),
            },
          ].map(s => (
            <div key={s.step} style={STEP_STYLE}>
              <div style={STEP_NUM_STYLE}>{s.step}</div>
              <div className="flex-1">
                <div className="text-base font-bold" style={{ marginBottom: 4 }}>{s.title}</div>
                <div className="text-md text-secondary leading-relaxed">{s.content}</div>
              </div>
            </div>
          ))}

          <h3 className="text-base font-bold mb-12 mt-24">Évolutions prioritaires recommandées</h3>
          <div className="flex flex-col gap-8">
            {[
              { priority: 1, label: 'Optimisation des system prompts', desc: 'Raccourcir les prompts sans perdre en qualité = moins de tokens input par message', impact: '-20% tokens/message' },
              { priority: 2, label: 'Enrichir les templates de documents', desc: 'Ajouter 2-3 nouveaux templates par mois (rapport, présentation, brief créatif)', impact: '+Valeur utilisateur' },
              { priority: 3, label: 'Améliorer la FAQ automatique', desc: 'Suggérer automatiquement de sauvegarder en FAQ les questions posées 3+ fois', impact: '-30% appels API récurrents' },
              { priority: 4, label: 'Ajouter le streaming de réponses (SSE)', desc: 'Les réponses s\'affichent mot par mot au lieu d\'attendre la réponse complète', impact: '+UX perçue' },
              { priority: 5, label: 'Connecter Stripe', desc: 'Remplacer les boutons "Contacter" par de vrais paiements', impact: '+Revenue' },
              { priority: 6, label: 'Ajouter des presets par secteur', desc: 'Templates de profil entreprise pré-configurés (restaurant, agence, startup, cabinet...)', impact: '+Onboarding rapide' },
            ].map(e => (
              <div key={e.priority} className="flex gap-8 bg-secondary rounded-sm border" style={{ padding: '8px 12px', alignItems: 'flex-start' }}>
                <span className="flex-center font-bold" style={{
                  width: 22, height: 22, borderRadius: 6, fontSize: 11,
                  background: e.priority <= 2 ? '#ef4444' : e.priority <= 4 ? '#f59e0b' : '#22c55e',
                  color: 'white', flexShrink: 0,
                }}>{e.priority}</span>
                <div className="flex-1">
                  <div className="text-md font-semibold">{e.label}</div>
                  <div className="text-xs text-muted">{e.desc}</div>
                </div>
                <span className="badge badge-info" style={{ fontSize: 10, flexShrink: 0 }}>{e.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-sm text-muted text-center mt-24" style={{
        padding: 16, borderTop: '1px solid var(--border-primary)',
      }}>
        Freenzy.io v0.17.0 — Phase 18 — Mars 2026
      </div>
    </div>
  );
}
