export const dynamic = 'force-dynamic';
export const revalidate = 10;

interface RouteEntry {
  path: string;
  label: string;
  icon: string;
  status: 'fonctionnel' | 'partiel' | 'stub';
  description: string;
  testInstructions: string[];
  dependencies?: string[];
}

interface RouteSection {
  title: string;
  icon: string;
  routes: RouteEntry[];
}

const ROUTE_SECTIONS: RouteSection[] = [
  {
    title: 'Pages Publiques',
    icon: '🌐',
    routes: [
      {
        path: '/',
        label: 'Overview (Admin Dashboard)',
        icon: '◎',
        status: 'fonctionnel',
        description: 'Page d\'accueil admin avec KPIs système, santé infra, stats billing.',
        testInstructions: [
          'Vérifier que les stats KPI s\'affichent (uptime, agents, billing)',
          'Vérifier le statut PostgreSQL et Redis',
          'Vérifier que les erreurs s\'affichent proprement si le backend est éteint',
        ],
        dependencies: ['Backend /health', 'Backend /billing/admin/stats'],
      },
      {
        path: '/login',
        label: 'Connexion',
        icon: '🔐',
        status: 'fonctionnel',
        description: 'Formulaire de login avec email/password. Redirige vers /client/dashboard.',
        testInstructions: [
          'Se connecter avec un compte existant',
          'Tester avec un mauvais mot de passe (erreur attendue)',
          'Vérifier la redirection vers /client/dashboard après login',
          'Vérifier le lien vers /register',
        ],
      },
      {
        path: '/register',
        label: 'Inscription',
        icon: '📝',
        status: 'fonctionnel',
        description: 'Formulaire d\'inscription avec email, nom, mot de passe.',
        testInstructions: [
          'Créer un nouveau compte',
          'Vérifier la validation des champs (email invalide, mot de passe court)',
          'Vérifier la redirection après inscription',
        ],
      },
      {
        path: '/plans',
        label: 'Plans & Tarifs',
        icon: '💎',
        status: 'fonctionnel',
        description: 'Packs de crédits (Starter 9 EUR, Pro 25 EUR, Enterprise 99 EUR), calculateur de tokens, FAQ.',
        testInstructions: [
          'Vérifier que les 3 packs s\'affichent avec les bons prix',
          'Vérifier le calculateur de tokens (estimations par action)',
          'Cliquer sur "Choisir" mène à /login ou /client/account',
        ],
      },
    ],
  },
  {
    title: 'Espace Client',
    icon: '💼',
    routes: [
      {
        path: '/client/dashboard',
        label: 'Accueil Client',
        icon: '🏠',
        status: 'fonctionnel',
        description: 'Dashboard client avec résumé agents, crédits, activité récente, gamification.',
        testInstructions: [
          'Vérifier l\'affichage des 6 agents avec icônes',
          'Vérifier le solde de crédits dans la sidebar',
          'Vérifier le niveau et XP de gamification',
          'Cliquer sur un agent ouvre le chat',
        ],
        dependencies: ['Backend /portal/wallet', '/portal/dashboard'],
      },
      {
        path: '/client/briefing',
        label: 'Briefing du jour',
        icon: '☀️',
        status: 'fonctionnel',
        description: 'Briefing quotidien avec tâches, minuteur focus (Pomodoro 25min), insights IA.',
        testInstructions: [
          'Vérifier l\'affichage de la date et salutation adaptée',
          'Ajouter une tâche avec une priorité',
          'Cocher une tâche (passe dans "Complétées")',
          'Lancer le minuteur focus',
          'Cliquer "Briefing IA" pour générer des insights (nécessite crédits)',
        ],
        dependencies: ['Backend /billing/llm (pour briefing IA)'],
      },
      {
        path: '/client/chat',
        label: 'Chat IA',
        icon: '💬',
        status: 'fonctionnel',
        description: 'Chat temps réel avec les 6 agents. Historique (50 max), questions de suivi [Q1/Q2/Q3], copier.',
        testInstructions: [
          'Envoyer un message à chaque agent',
          'Vérifier les questions de suivi [Q1/Q2/Q3] en bas de réponse',
          'Tester le bouton copier sur un message assistant',
          'Changer d\'agent en cours de conversation',
          'Ouvrir l\'historique, charger une ancienne conversation',
          'Vérifier le décompte de tokens et crédits par message',
        ],
        dependencies: ['Backend /billing/llm', 'Credits suffisants'],
      },
      {
        path: '/client/meeting',
        label: 'Réunion',
        icon: '🏛️',
        status: 'fonctionnel',
        description: 'Réunion multi-agents (2-5). 6 templates pré-configurés. Mode auto (2 tours de table).',
        testInstructions: [
          'Sélectionner 3 agents et un sujet',
          'Lancer la réunion en mode manuel (bouton "Tour suivant")',
          'Tester le mode auto (2 tours automatiques)',
          'Vérifier que chaque agent a un style différent',
          'Utiliser un template pré-configuré',
        ],
        dependencies: ['Backend /billing/llm'],
      },
      {
        path: '/client/documents',
        label: 'Documents',
        icon: '📄',
        status: 'fonctionnel',
        description: '8 templates (email, proposition, business plan, post social, CR réunion, fiche de poste, newsletter, contrat).',
        testInstructions: [
          'Choisir un template, remplir le formulaire',
          'Générer le document (nécessite crédits)',
          'Tester le bouton copier',
          'Tester l\'export .txt (télécharge un fichier)',
          'Vérifier l\'historique des documents générés',
          'Filtrer par catégorie',
        ],
        dependencies: ['Backend /billing/llm'],
      },
      {
        path: '/client/team',
        label: 'Équipe IA',
        icon: '👥',
        status: 'fonctionnel',
        description: 'Vue des 6 agents avec fiches, compétences, boutons "Discuter" et "Personnaliser".',
        testInstructions: [
          'Vérifier l\'affichage des 6 cartes agents',
          'Cliquer "Discuter" ouvre le chat avec le bon agent',
          'Vérifier les badges de personnalisation',
        ],
      },
      {
        path: '/client/agents/customize',
        label: 'Personnaliser les Agents',
        icon: '🎨',
        status: 'fonctionnel',
        description: 'Wizard 6 étapes : identité, personnalité (6 curseurs), expertise, instructions, contexte, aperçu & test.',
        testInstructions: [
          'Sélectionner un agent, modifier son nom et emoji',
          'Ajuster les curseurs de personnalité',
          'Ajouter des domaines d\'expertise',
          'Aller à l\'étape 6 : tester le prompt',
          'Sauvegarder et vérifier dans le chat que les changements persistent',
          'Tester l\'export/import de configuration JSON',
        ],
      },
      {
        path: '/client/strategy',
        label: 'Plan d\'Attaque',
        icon: '🎯',
        status: 'fonctionnel',
        description: 'Formulaire guidé par agent pour générer un plan d\'action personnalisé (marketing, finance, organisation...).',
        testInstructions: [
          'Remplir le formulaire marketing (réseaux, fréquence, ton, audience)',
          'Générer le plan d\'action (nécessite crédits)',
          'Vérifier le rendu du plan généré',
          'Tester copier, régénérer, modifier les réponses',
          'Changer d\'onglet agent et vérifier que les données sont sauvegardées',
          'Vérifier la sauvegarde automatique dans localStorage',
        ],
        dependencies: ['Backend /billing/llm'],
      },
      {
        path: '/client/onboarding',
        label: 'Mon Entreprise (Onboarding)',
        icon: '🏢',
        status: 'fonctionnel',
        description: 'Formulaire 7 étapes pour présenter son entreprise. Option analyse automatique par URL.',
        testInstructions: [
          'Tester l\'analyse automatique avec une URL de site web',
          'Parcourir les 7 étapes manuellement',
          'Vérifier la barre de progression',
          'Activer le mode compact et vérifier la différence',
          'Sauvegarder et vérifier la persistance des données',
        ],
        dependencies: ['Backend /billing/llm (pour analyse URL)'],
      },
      {
        path: '/client/account',
        label: 'Compte & Crédits',
        icon: '👤',
        status: 'fonctionnel',
        description: 'Informations du compte, solde wallet, historique d\'usage, packs de recharge.',
        testInstructions: [
          'Vérifier l\'affichage du solde',
          'Vérifier les stats d\'usage (appels, tokens)',
          'Vérifier l\'affichage des packs de crédits avec prix',
        ],
        dependencies: ['Backend /portal/wallet', '/portal/usage'],
      },
    ],
  },
  {
    title: 'Admin',
    icon: '⚙️',
    routes: [
      {
        path: '/admin/users',
        label: 'Utilisateurs',
        icon: '◉',
        status: 'fonctionnel',
        description: 'CRUD utilisateurs, rôles (admin/operator/viewer), tiers (guest/demo/free/paid), top consumers.',
        testInstructions: [
          'Vérifier l\'affichage de la liste des users',
          'Vérifier les stats (total, actifs, par tier/rôle)',
          'Vérifier les top consumers par API calls',
        ],
        dependencies: ['Backend /admin/users'],
      },
      {
        path: '/admin/billing',
        label: 'Facturation',
        icon: '◈',
        status: 'fonctionnel',
        description: 'KPIs facturation (revenu, coût Anthropic, marge, appels), usage par modèle, grille tarifaire.',
        testInstructions: [
          'Vérifier les 5 KPIs (revenu, coût, marge, appels, marge %)',
          'Vérifier le tableau "Usage par Modèle"',
          'Vérifier la grille tarifaire Sonnet/Opus',
        ],
        dependencies: ['Backend /billing/admin/stats', '/billing/pricing'],
      },
      {
        path: '/admin/financial',
        label: 'Finances',
        icon: '◆',
        status: 'partiel',
        description: 'Vue financière globale. Page basique, à enrichir.',
        testInstructions: ['Vérifier que la page s\'affiche sans erreur'],
        dependencies: ['Backend /billing/admin/stats'],
      },
      {
        path: '/admin/promo',
        label: 'Codes Promo',
        icon: '◇',
        status: 'fonctionnel',
        description: 'Gestion des codes promo (tier_upgrade, extend_demo, bonus_calls). Création et listing.',
        testInstructions: [
          'Vérifier la liste des codes promo existants',
          'Créer un nouveau code promo',
          'Vérifier les types disponibles',
        ],
        dependencies: ['Backend /admin/promo-codes'],
      },
      {
        path: '/admin/tokens',
        label: 'Tokens & Coûts',
        icon: '◈',
        status: 'fonctionnel',
        description: 'Guide d\'optimisation tokens : schéma facturation, tarifs, stratégies, comparaison Sonnet vs Opus.',
        testInstructions: [
          'Vérifier le schéma de facturation',
          'Vérifier le tableau des tarifs',
          'Vérifier les 6 stratégies d\'optimisation',
        ],
        dependencies: ['Backend /billing/pricing (optionnel)'],
      },
      {
        path: '/admin/roadmap',
        label: 'Roadmap',
        icon: '▹',
        status: 'fonctionnel',
        description: 'Carte des 16 intégrations (actives/planifiées/futures), timeline, guide de configuration .env.',
        testInstructions: [
          'Vérifier les 3 catégories d\'intégrations avec badges',
          'Vérifier la timeline (phases)',
          'Vérifier le guide de configuration .env',
        ],
      },
      {
        path: '/admin/control',
        label: 'Centre de Contrôle',
        icon: '◉',
        status: 'fonctionnel',
        description: 'Cette page ! Carte de toutes les routes avec statuts et guide de test.',
        testInstructions: ['Vous y êtes déjà !'],
      },
      {
        path: '/admin/guide',
        label: 'Guide',
        icon: '◈',
        status: 'fonctionnel',
        description: 'Guide complet de gestion : architecture, ajouter page/agent, pricing, déploiement, troubleshooting.',
        testInstructions: [
          'Parcourir les 7 sections',
          'Vérifier que les ancres de navigation fonctionnent',
          'Vérifier les exemples de code',
        ],
      },
    ],
  },
  {
    title: 'Système',
    icon: '🔧',
    routes: [
      {
        path: '/system/agents',
        label: 'Agents IA',
        icon: '●',
        status: 'fonctionnel',
        description: 'Liste des 15 agents système (L1/L2/L3) avec statuts, niveaux, actions.',
        testInstructions: [
          'Vérifier l\'affichage des agents par niveau (L1/L2/L3)',
          'Vérifier les statuts et actions disponibles',
        ],
        dependencies: ['Backend /agents'],
      },
      {
        path: '/system/events',
        label: 'Événements',
        icon: '○',
        status: 'fonctionnel',
        description: 'Flux d\'événements système en temps réel.',
        testInstructions: ['Vérifier l\'affichage des événements récents avec timestamps'],
        dependencies: ['Backend /events'],
      },
      {
        path: '/system/approvals',
        label: 'Approbations',
        icon: '◐',
        status: 'fonctionnel',
        description: 'File d\'approbation pour les actions agents nécessitant validation humaine.',
        testInstructions: ['Vérifier la liste des approbations en attente et traitées'],
        dependencies: ['Backend /approvals'],
      },
      {
        path: '/system/autonomy',
        label: 'Autonomie',
        icon: '◑',
        status: 'fonctionnel',
        description: 'Configuration des niveaux d\'autonomie des agents (low/medium/high/full).',
        testInstructions: ['Vérifier l\'affichage et la modification des niveaux d\'autonomie'],
        dependencies: ['Backend /autonomy'],
      },
      {
        path: '/system/tasks',
        label: 'Tâches',
        icon: '◒',
        status: 'fonctionnel',
        description: 'Tâches en cours, complétées et en attente des agents.',
        testInstructions: ['Vérifier l\'affichage des tâches par statut'],
        dependencies: ['Backend /tasks'],
      },
    ],
  },
  {
    title: 'Infrastructure',
    icon: '🖥️',
    routes: [
      {
        path: '/infra/health',
        label: 'Infrastructure',
        icon: '▬',
        status: 'fonctionnel',
        description: 'Santé du système : PostgreSQL, Redis, API backend, uptime.',
        testInstructions: [
          'Vérifier le statut vert pour chaque service',
          'Éteindre Redis ou PostgreSQL et vérifier la détection d\'erreur',
        ],
        dependencies: ['Backend /health'],
      },
      {
        path: '/infra/memory',
        label: 'Mémoire',
        icon: '▪',
        status: 'partiel',
        description: 'Gestion de la mémoire vectorielle (pgvector).',
        testInstructions: ['Vérifier que la page s\'affiche sans erreur'],
        dependencies: ['Backend /memory'],
      },
      {
        path: '/infra/metrics',
        label: 'Métriques',
        icon: '▫',
        status: 'partiel',
        description: 'Métriques de performance et monitoring.',
        testInstructions: ['Vérifier que la page s\'affiche sans erreur'],
      },
      {
        path: '/infra/avatar',
        label: 'Avatar Pipeline',
        icon: '▸',
        status: 'stub',
        description: 'Pipeline TTS/ASR/Video pour les avatars Sarah et Emmanuel. Stubs uniquement — en attente des APIs ElevenLabs, Deepgram, D-ID.',
        testInstructions: ['La page s\'affiche mais les fonctionnalités sont des placeholders'],
      },
    ],
  },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  fonctionnel: { label: 'Fonctionnel', className: 'badge badge-success' },
  partiel: { label: 'Partiel', className: 'badge badge-warning' },
  stub: { label: 'Stub', className: 'badge badge-danger' },
};

export default function ControlPage() {
  const allRoutes = ROUTE_SECTIONS.flatMap(s => s.routes);
  const totalFonctionnel = allRoutes.filter(r => r.status === 'fonctionnel').length;
  const totalPartiel = allRoutes.filter(r => r.status === 'partiel').length;
  const totalStub = allRoutes.filter(r => r.status === 'stub').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Centre de Contrôle</h1>
        <p className="page-subtitle">
          Carte complète de l&apos;application SARAH OS — Testez, explorez, comprenez chaque fonctionnalité.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 gap-12 mb-24">
        <div className="stat-card">
          <div className="stat-label">Total pages</div>
          <div className="stat-value">{allRoutes.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div className="stat-label">Fonctionnel</div>
          <div className="stat-value" style={{ color: '#22c55e' }}>{totalFonctionnel}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="stat-label">Partiel</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{totalPartiel}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="stat-label">Stub</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{totalStub}</div>
        </div>
      </div>

      {/* Alert */}
      <div className="alert alert-info mb-24">
        <strong>Comment utiliser cette page :</strong> Cliquez sur le nom d&apos;une page pour l&apos;ouvrir.
        Dépliez &laquo; Comment tester &raquo; pour voir les instructions de vérification manuelle.
        Les badges indiquent le statut actuel de chaque fonctionnalité.
      </div>

      {/* Route Sections */}
      {ROUTE_SECTIONS.map((section) => (
        <section key={section.title} className="section">
          <h2 className="section-title">
            <span style={{ marginRight: 8 }}>{section.icon}</span>
            {section.title}
            <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: 11, fontWeight: 500 }}>
              {section.routes.length} pages
            </span>
          </h2>

          <div className="flex flex-col" style={{ gap: 10 }}>
            {section.routes.map((route) => {
              const badge = STATUS_BADGES[route.status];
              return (
                <div key={route.path} className="card" style={{ padding: '16px 20px' }}>
                  <div className="flex items-center" style={{ gap: 10, marginBottom: 6 }}>
                    <span className="text-lg text-center" style={{ width: 24 }}>{route.icon}</span>
                    <a
                      href={route.path}
                      className="text-base font-bold text-accent"
                      style={{ textDecoration: 'none' }}
                    >
                      {route.label}
                    </a>
                    <span className={badge.className} style={{ fontSize: 10 }}>{badge.label}</span>
                    <span className="text-xs text-muted text-mono">
                      {route.path}
                    </span>
                  </div>

                  <div className="text-md text-secondary mb-8" style={{ paddingLeft: 34 }}>
                    {route.description}
                  </div>

                  {route.dependencies && route.dependencies.length > 0 && (
                    <div className="flex gap-4 flex-wrap mb-8" style={{ paddingLeft: 34 }}>
                      {route.dependencies.map(dep => (
                        <span key={dep} className="badge badge-neutral" style={{ fontSize: 10 }}>
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}

                  <details style={{ paddingLeft: 34 }}>
                    <summary className="text-sm font-semibold text-accent pointer" style={{ userSelect: 'none' }}>
                      Comment tester ({route.testInstructions.length} étapes)
                    </summary>
                    <ol className="text-sm text-secondary mt-8" style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                      {route.testInstructions.map((instr, i) => (
                        <li key={i}>{instr}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Footer */}
      <div className="text-sm text-muted text-center mt-24 border-secondary" style={{
        padding: 16, borderTop: '1px solid var(--border-primary)',
      }}>
        Dernière mise à jour : Mars 2026 — v0.10.0 — Phase 10
      </div>
    </div>
  );
}
