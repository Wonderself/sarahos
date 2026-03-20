import type { FormationParcours } from './formation-data';

/* =============================================================================
   PARCOURS — Orchestration Multi-Agents (Niveau 2 — Avancé)
   6 modules × 3 leçons — 1h — 750 XP
   ============================================================================= */

export const parcoursOrchestrationNiv2: FormationParcours = {
  id: 'orchestration-niv2',
  title: 'Orchestration Multi-Agents',
  emoji: '🎛️',
  description: 'Maîtrisez l\'art de faire collaborer plusieurs assistants IA : chaînage, workflows d\'approbation, gestion d\'équipe, assistants custom, optimisation des coûts et cas d\'usage métier avancés.',
  category: 'freenzy',
  subcategory: 'orchestration',
  level: 'avance',
  levelLabel: 'Avancé',
  diplomaTitle: 'AI Orchestrator',
  diplomaSubtitle: 'Orchestration multi-agents et workflows avancés',
  totalDuration: '1h',
  totalXP: 750,
  color: '#8B5CF6',
  available: true,
  comingSoon: false,
  modules: [

    /* ═══════════════════════════════════════════════════════════════
       Module 1 — Chaîner plusieurs assistants
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m1',
      title: 'Chaîner plusieurs assistants',
      description: 'Créez des pipelines multi-agents pour automatiser vos processus.',
      emoji: '🔗',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m1-l1',
          type: 'text' as const,
          title: 'Pipelines d\'assistants : la puissance du chaînage',
          duration: '4 min',
          xpReward: 25,
          content: `L'un des super-pouvoirs de Freenzy, c'est de pouvoir connecter plusieurs assistants entre eux pour créer de véritables pipelines automatisés 🚀

Le principe est simple : la sortie (output) d'un assistant devient l'entrée (input) de l'assistant suivant. Imaginez une chaîne de production industrielle, mais pour l'information.

Prenons un exemple concret. Vous avez un prospect qui remplit un formulaire sur votre site. Voici ce qui peut se passer automatiquement :

1. L'assistant Commercial (fz-commercial) analyse le lead et qualifie son potentiel — il évalue le budget, le besoin, l'urgence et attribue un score de 1 à 10.

2. Le résultat est transmis à l'assistant Rédacteur (fz-redacteur) qui génère un email de réponse personnalisé en fonction du score — un email chaleureux pour un lead chaud, un email informatif pour un lead tiède.

3. L'assistant Email (fz-email) prend le texte rédigé et l'envoie au bon moment, en tenant compte du fuseau horaire du prospect et des statistiques d'ouverture optimales.

Tout ça se passe sans que vous leviez le petit doigt 💪

Dans Freenzy, chaque assistant expose ses capacités (capabilities) et ses modes de fonctionnement. Quand vous chaînez deux assistants, le système vérifie automatiquement que l'output du premier est compatible avec l'input du second. Si ce n'est pas le cas, un adaptateur intermédiaire reformate les données.

Les pipelines peuvent être linéaires (A → B → C) ou en éventail (A → B + C en parallèle → D qui fusionne les résultats). Par exemple, un brief marketing peut être envoyé simultanément à l'assistant Réseaux Sociaux et à l'assistant Email, puis les deux résultats sont consolidés par l'assistant Communication.

Le routage intelligent de Freenzy choisit automatiquement le bon modèle pour chaque étape : Haiku (L1) pour les tâches rapides d'exécution, Sonnet (L2) pour la rédaction et l'analyse, Opus (L3) pour les décisions stratégiques. Résultat : vous obtenez la qualité maximale au coût le plus bas possible.

Astuce pro : commencez par des chaînes courtes (2 assistants) avant de construire des pipelines complexes. Testez chaque maillon individuellement avant de les connecter — c'est la clé d'un pipeline fiable 🔑`
        },
        {
          id: 'orch-m1-l2',
          type: 'exercise' as const,
          title: 'Créez votre première chaîne multi-agents',
          duration: '3 min',
          xpReward: 50,
          content: 'Mettez en pratique le chaînage d\'assistants en créant un pipeline Commercial → Rédacteur → Email.',
          exercisePrompt: 'Créez une chaîne de 3 assistants dans Freenzy : 1) L\'assistant Commercial analyse un lead fictif (nom : Marie Dupont, entreprise : BioTech Lyon, budget : 15 000 €, besoin : automatiser le support client). 2) Le Rédacteur génère un email personnalisé basé sur l\'analyse. 3) L\'assistant Email prépare l\'envoi avec un objet accrocheur et un créneau optimal. Décrivez le résultat attendu à chaque étape de la chaîne.'
        },
        {
          id: 'orch-m1-l3',
          type: 'quiz' as const,
          title: 'Quiz — Chaînage d\'assistants',
          duration: '3 min',
          xpReward: 50,
          content: 'Vérifiez que vous maîtrisez les concepts de chaînage multi-agents.',
          quizQuestions: [
            {
              question: 'Dans un pipeline d\'assistants, que se passe-t-il entre deux maillons ?',
              options: [
                'L\'utilisateur doit copier-coller le résultat manuellement',
                'L\'output du premier devient automatiquement l\'input du second',
                'Les deux assistants travaillent en parallèle sans lien',
                'Le système attend une validation humaine à chaque étape'
              ],
              correctIndex: 1,
              explanation: 'Le chaînage est automatique : la sortie d\'un assistant est directement injectée comme entrée du suivant, sans intervention manuelle.'
            },
            {
              question: 'Quel type de pipeline envoie un brief à plusieurs assistants en parallèle ?',
              options: [
                'Pipeline linéaire',
                'Pipeline séquentiel',
                'Pipeline en éventail (fan-out)',
                'Pipeline récursif'
              ],
              correctIndex: 2,
              explanation: 'Le pipeline en éventail (fan-out) distribue un même input à plusieurs assistants en parallèle, puis un agrégateur consolide les résultats.'
            },
            {
              question: 'Quel modèle le routage intelligent choisit-il pour une tâche de rédaction ?',
              options: [
                'Haiku (L1) — exécution rapide',
                'Sonnet (L2) — rédaction et analyse',
                'Opus (L3) — stratégie avancée',
                'Le modèle est toujours le même'
              ],
              correctIndex: 1,
              explanation: 'Sonnet (L2) est le modèle idéal pour la rédaction et l\'analyse. Haiku gère les tâches simples, Opus les décisions stratégiques.'
            },
            {
              question: 'Quelle est la bonne pratique recommandée pour construire un pipeline fiable ?',
              options: [
                'Créer le pipeline complet d\'un coup et tester à la fin',
                'Utiliser uniquement Opus pour toutes les étapes',
                'Tester chaque maillon individuellement avant de les connecter',
                'Éviter les pipelines de plus de 2 assistants'
              ],
              correctIndex: 2,
              explanation: 'Tester chaque assistant individuellement avant de chaîner garantit que chaque maillon fonctionne correctement — c\'est la clé d\'un pipeline solide.'
            }
          ]
        }
      ]
    },

    /* ═══════════════════════════════════════════════════════════════
       Module 2 — Workflows d'approbation complexes
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m2',
      title: 'Workflows d\'approbation complexes',
      description: 'Configurez des workflows d\'approbation multi-niveaux avec escalade.',
      emoji: '✅',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m2-l1',
          type: 'text' as const,
          title: 'Approbations multi-niveaux et escalade',
          duration: '4 min',
          xpReward: 25,
          content: `Dans une entreprise, tout ne peut pas être exécuté automatiquement. Certaines actions nécessitent une validation humaine — c'est là qu'interviennent les workflows d'approbation 📋

Freenzy implémente un système d'approbation multi-niveaux inspiré des meilleures pratiques de gouvernance :

Niveau 1 — Exécution directe : les tâches à faible risque (consultation de données, génération de brouillon, recherche d'information) sont exécutées immédiatement par l'assistant sans validation.

Niveau 2 — Approbation simple : les actions à risque moyen (envoi d'email, publication sur les réseaux sociaux, modification de document) nécessitent la validation d'un opérateur. L'assistant prépare l'action, la soumet pour approbation, et l'exécute dès que le feu vert est donné.

Niveau 3 — Approbation hiérarchique : les actions sensibles (modification de facturation, accès aux données clients, changement de configuration) remontent au rôle admin. Deux approbateurs différents peuvent être requis pour les opérations critiques.

L'escalade automatique est un mécanisme clé 🔺 Si une demande d'approbation n'est pas traitée dans un délai configurable (par défaut 4 heures), elle remonte automatiquement au niveau supérieur. Plus besoin de relancer manuellement — le système s'en charge.

Le système de rôles RBAC de Freenzy (admin, operator, viewer, system) s'intègre nativement avec les workflows. Chaque rôle a des permissions précises : un viewer peut consulter les demandes en attente mais pas les approuver, un operator peut approuver les niveaux 1 et 2, seul un admin peut valider les actions de niveau 3.

Les notifications de demande d'approbation arrivent par trois canaux : dans le dashboard (badge sur l'icône), par email et via WhatsApp pour les actions urgentes. Vous ne manquerez jamais une demande critique 🔔

Chaque approbation ou refus est enregistré dans le journal d'audit avec horodatage, utilisateur et motif. Freenzy garantit une traçabilité complète pour la conformité RGPD et les audits internes.`
        },
        {
          id: 'orch-m2-l2',
          type: 'text' as const,
          title: 'Configurer les workflows dans Freenzy',
          duration: '3 min',
          xpReward: 25,
          content: `Configurer un workflow d'approbation dans Freenzy se fait en quelques clics depuis la section Autopilot du dashboard admin 🛠️

Étape 1 — Définir les déclencheurs : choisissez quel type d'action agent déclenche le workflow. Par exemple : « Quand l'assistant Commercial veut envoyer un devis supérieur à 5 000 € → workflow niveau 2 ».

Étape 2 — Assigner les approbateurs : désignez qui peut valider à chaque niveau. Vous pouvez créer des groupes d'approbateurs (ex : « équipe finance ») pour que n'importe quel membre du groupe puisse traiter la demande.

Étape 3 — Configurer les délais : définissez le timeout avant escalade. Recommandation : 2h pour les demandes business, 30 min pour les demandes urgentes, 24h pour les demandes administratives.

Étape 4 — Activer les notifications : choisissez les canaux de notification pour chaque niveau — dashboard seul, dashboard + email, ou dashboard + email + WhatsApp pour le niveau le plus critique.

Les workflows supportent aussi les conditions avancées. Vous pouvez créer des règles comme : « Si le montant est inférieur à 1 000 € ET que le client est déjà dans le CRM → approbation automatique ». Ces conditions évitent de surcharger les approbateurs avec des demandes de routine.

Le tableau de bord Autopilot affiche en temps réel : les demandes en attente (classées par urgence), les demandes traitées aujourd'hui, le temps moyen de traitement et les demandes expirées. C'est votre cockpit pour surveiller la gouvernance de vos agents 📊

Conseil pro : commencez avec des règles simples et affinez progressivement. Un workflow trop strict ralentit l'équipe, un workflow trop permissif crée des risques. Trouvez l'équilibre en analysant les métriques après 2 semaines d'utilisation.`
        },
        {
          id: 'orch-m2-l3',
          type: 'quiz' as const,
          title: 'Quiz — Workflows d\'approbation',
          duration: '3 min',
          xpReward: 75,
          content: 'Testez vos connaissances sur les workflows d\'approbation multi-niveaux.',
          quizQuestions: [
            {
              question: 'Quel rôle RBAC peut approuver une action de niveau 3 (sensible) ?',
              options: [
                'Viewer',
                'Operator',
                'Admin uniquement',
                'Tous les rôles'
              ],
              correctIndex: 2,
              explanation: 'Seul le rôle admin peut valider les actions de niveau 3 (sensibles). L\'operator gère les niveaux 1 et 2, le viewer ne peut que consulter.'
            },
            {
              question: 'Que se passe-t-il quand une demande d\'approbation dépasse le délai configuré ?',
              options: [
                'Elle est automatiquement refusée',
                'Elle est supprimée',
                'Elle escalade au niveau supérieur',
                'Elle est exécutée sans approbation'
              ],
              correctIndex: 2,
              explanation: 'L\'escalade automatique fait remonter la demande au niveau supérieur après expiration du délai, garantissant qu\'aucune demande ne reste bloquée.'
            },
            {
              question: 'Quel est le délai d\'escalade recommandé pour une demande business standard ?',
              options: [
                '15 minutes',
                '2 heures',
                '12 heures',
                '48 heures'
              ],
              correctIndex: 1,
              explanation: '2 heures est le délai recommandé pour les demandes business. 30 min pour l\'urgent, 24h pour l\'administratif.'
            },
            {
              question: 'Où consulte-t-on le tableau de bord des approbations en temps réel ?',
              options: [
                'Page Profil',
                'Page Crédits',
                'Section Autopilot du dashboard admin',
                'Page Assistants'
              ],
              correctIndex: 2,
              explanation: 'Le tableau de bord Autopilot dans l\'admin affiche les demandes en attente, traitées, temps moyen et demandes expirées.'
            }
          ]
        }
      ]
    },

    /* ═══════════════════════════════════════════════════════════════
       Module 3 — Gestion d'équipe avancée
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m3',
      title: 'Gestion d\'équipe avancée',
      description: 'Gérez les pools de crédits, quotas et analytics par équipe.',
      emoji: '👥',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m3-l1',
          type: 'text' as const,
          title: 'Pool de crédits, quotas et analytics équipe',
          duration: '4 min',
          xpReward: 25,
          content: `Quand votre équipe grandit, gérer les crédits IA individuellement devient un cauchemar. C'est pourquoi Freenzy propose un système de pool de crédits partagé et de quotas par membre 💰

Le pool de crédits est une enveloppe commune alimentée par l'administrateur. Au lieu de distribuer des crédits à chaque utilisateur individuellement, vous créez un pool central et définissez des règles d'accès :

Quotas journaliers : chaque membre a un plafond de crédits par jour (ex : 50 crédits/jour pour un junior, 200 pour un senior). Quand le quota est atteint, l'utilisateur reçoit un message clair et doit attendre le lendemain ou demander une augmentation temporaire.

Quotas par type d'action : vous pouvez limiter certaines actions coûteuses. Par exemple, autoriser 100 appels à Haiku (1 crédit chacun) mais seulement 10 appels à Opus (5 crédits chacun) par jour et par membre.

Alertes budgétaires : configurez des seuils (50 %, 75 %, 90 % du pool consommé) qui déclenchent des notifications automatiques à l'admin. Vous ne serez jamais surpris par une facture inattendue.

Le tableau analytics d'équipe est votre outil de pilotage 📊 Il affiche :

— La consommation par membre (qui utilise combien, pour quelles tâches)
— La consommation par assistant (quel agent coûte le plus)
— Les tendances hebdomadaires et mensuelles avec graphiques
— Le ROI estimé par action (temps économisé × taux horaire du collaborateur)

Ces métriques vous permettent d'identifier les gros consommateurs, les assistants sous-utilisés et les opportunités d'optimisation. Par exemple, si 80 % des crédits sont consommés par l'assistant Rédacteur, peut-être faut-il optimiser les prompts ou passer certaines tâches en batch.

Le système de rôles fonctionne aussi pour les quotas : un admin peut redistribuer les crédits en temps réel, un operator peut consulter la consommation de son équipe, un viewer voit uniquement sa propre consommation.

Rappel important : les crédits Freenzy n'expirent jamais ♾️ et les 5 000 premiers utilisateurs bénéficient de 0 % de commission à vie !`
        },
        {
          id: 'orch-m3-l2',
          type: 'exercise' as const,
          title: 'Configurez un pool crédits pour 5 membres',
          duration: '3 min',
          xpReward: 50,
          content: 'Exercice pratique : créez une configuration de pool de crédits réaliste pour une petite équipe.',
          exercisePrompt: 'Configurez un pool de crédits pour une agence de communication de 5 personnes : 1 directeur, 2 chefs de projet et 2 juniors. Le budget mensuel total est de 500 crédits. Définissez : le quota journalier par rôle, les limitations par type d\'action (Haiku/Sonnet/Opus), les seuils d\'alerte, et expliquez votre logique de répartition. Utilisez l\'assistant pour vous aider à calculer la répartition optimale.'
        },
        {
          id: 'orch-m3-l3',
          type: 'quiz' as const,
          title: 'Quiz — Gestion d\'équipe',
          duration: '3 min',
          xpReward: 50,
          content: 'Vérifiez vos connaissances sur la gestion d\'équipe et les pools de crédits.',
          quizQuestions: [
            {
              question: 'Que se passe-t-il quand un membre atteint son quota journalier de crédits ?',
              options: [
                'Son compte est bloqué définitivement',
                'Il reçoit un message et doit attendre le lendemain ou demander une augmentation',
                'Ses crédits personnels sont débités à la place',
                'Le quota du pool entier est augmenté automatiquement'
              ],
              correctIndex: 1,
              explanation: 'Le membre reçoit un message clair et peut soit attendre le reset du lendemain, soit demander une augmentation temporaire à l\'admin.'
            },
            {
              question: 'Quel indicateur du tableau analytics aide à optimiser les coûts ?',
              options: [
                'Le nombre de connexions par jour',
                'La consommation par assistant (quel agent coûte le plus)',
                'Le nombre de pages visitées',
                'La durée moyenne de session'
              ],
              correctIndex: 1,
              explanation: 'La consommation par assistant permet d\'identifier les agents les plus coûteux et d\'optimiser les prompts ou le routage de modèles en conséquence.'
            },
            {
              question: 'Les crédits Freenzy non utilisés en fin de mois sont-ils perdus ?',
              options: [
                'Oui, ils expirent chaque mois',
                'Oui, après 90 jours',
                'Non, les crédits n\'expirent jamais',
                'Cela dépend du plan choisi'
              ],
              correctIndex: 2,
              explanation: 'Les crédits Freenzy n\'expirent jamais — c\'est l\'un des avantages clés de la plateforme.'
            },
            {
              question: 'Quel rôle peut redistribuer les crédits dans le pool en temps réel ?',
              options: [
                'Viewer',
                'Operator',
                'Admin',
                'Tous les rôles'
              ],
              correctIndex: 2,
              explanation: 'Seul l\'admin peut redistribuer les crédits du pool. L\'operator consulte la conso de son équipe, le viewer voit uniquement la sienne.'
            }
          ]
        }
      ]
    },

    /* ═══════════════════════════════════════════════════════════════
       Module 4 — Assistants custom
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m4',
      title: 'Assistants custom',
      description: 'Créez des assistants personnalisés avec system prompt et mémoire.',
      emoji: '🧩',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m4-l1',
          type: 'text' as const,
          title: 'Créer un assistant avec un system prompt personnalisé',
          duration: '4 min',
          xpReward: 25,
          content: `Freenzy fournit plus de 100 assistants prêts à l'emploi, mais la vraie puissance réside dans votre capacité à créer des assistants sur mesure, parfaitement adaptés à votre métier 🧪

Un assistant custom, c'est un agent IA que vous configurez de A à Z :

Le System Prompt est le cœur de votre assistant. C'est un texte d'instructions que l'IA suit à chaque interaction. Pensez-y comme le « brief de poste » d'un nouvel employé. Un bon system prompt contient :

1. L'identité : qui est l'assistant, pour quelle entreprise il travaille, quel est son ton (formel, décontracté, technique).

2. Les compétences : quelles tâches il sait faire, quelles données il peut consulter, quels outils il utilise.

3. Les contraintes : ce qu'il ne doit PAS faire (par exemple, ne jamais donner de conseil médical, toujours renvoyer vers un humain pour les réclamations supérieures à 500 €).

4. Le format de sortie : comment il doit structurer ses réponses (paragraphes, listes, tableaux, JSON).

Exemple concret — un assistant « Support Client BioTech » :
« Tu es l'assistant support de BioTech Lyon. Tu parles en français, vouvoie les clients, et tu es spécialisé dans les compléments alimentaires bio. Tu as accès au catalogue produits 2026. Tu ne donnes jamais de conseil médical. Pour les retours de commande, tu appliques la politique de remboursement sous 30 jours. Si le client est mécontent, tu proposes systématiquement un bon de réduction de 10 %. »

Pour créer votre outil IA dans Freenzy, rendez-vous dans la section « Mes Outils » du dashboard. Cliquez sur « Créer un outil », donnez-lui un nom et un emoji, puis rédigez votre system prompt. Vous pouvez tester l'outil en temps réel avant de le déployer — chaque modification du prompt est instantanément reflétée dans les réponses.

Les assistants custom héritent automatiquement du système de routage intelligent : Freenzy choisit le meilleur modèle (Haiku, Sonnet ou Opus) selon la complexité de chaque requête, même pour vos agents personnalisés 🎯`
        },
        {
          id: 'orch-m4-l2',
          type: 'text' as const,
          title: 'Variables dynamiques, contexte métier et mémoire',
          duration: '3 min',
          xpReward: 25,
          content: `Un assistant custom statique, c'est bien. Un assistant qui s'adapte dynamiquement à chaque situation, c'est 10 fois mieux 🚀

Les variables dynamiques sont des placeholders dans votre system prompt qui sont remplacés automatiquement au moment de l'exécution :

{{user.name}} — le nom de l'utilisateur actuel
{{user.company}} — le nom de son entreprise
{{date.today}} — la date du jour
{{credits.remaining}} — les crédits restants
{{context.last_document}} — le dernier document généré

Exemple : « Bonjour {{user.name}}, vous travaillez chez {{user.company}}. Nous sommes le {{date.today}}. » devient « Bonjour Marie, vous travaillez chez BioTech Lyon. Nous sommes le 16 mars 2026. »

Le contexte métier va encore plus loin. Vous pouvez connecter votre assistant à des sources de données spécifiques :

— Votre catalogue produits (mis à jour automatiquement)
— Votre CRM (historique client accessible en temps réel)
— Vos documents internes (procédures, FAQ, grilles tarifaires)
— Vos métriques business (CA du mois, nombre de commandes, taux de satisfaction)

L'assistant utilise ces données pour contextualiser chaque réponse. Un client qui appelle pour la 3e fois en une semaine sera traité différemment d'un nouveau prospect — automatiquement.

La mémoire de l'assistant fonctionne sur deux niveaux 🧠 La mémoire de conversation (court terme) retient tout ce qui est dit dans l'échange en cours. La mémoire persistante (long terme), stockée via pgvector, permet à l'assistant de se souvenir des interactions passées et de construire un profil progressif de chaque interlocuteur.

Concrètement, après 5 échanges avec un client, votre assistant sait qu'il préfère les réponses courtes, qu'il a un abonnement premium et qu'il a eu un problème de livraison le mois dernier. Ce niveau de personnalisation est impossible à atteindre manuellement à grande échelle — mais trivial avec un assistant custom bien configuré ✨`
        },
        {
          id: 'orch-m4-l3',
          type: 'quiz' as const,
          title: 'Quiz — Assistants custom',
          duration: '3 min',
          xpReward: 75,
          content: 'Testez vos connaissances sur la création et la configuration d\'assistants personnalisés.',
          quizQuestions: [
            {
              question: 'Quels sont les 4 éléments essentiels d\'un bon system prompt ?',
              options: [
                'Nom, email, téléphone, adresse',
                'Identité, compétences, contraintes, format de sortie',
                'Modèle, température, tokens, fréquence',
                'Langue, fuseau horaire, devise, unités'
              ],
              correctIndex: 1,
              explanation: 'Un system prompt efficace définit l\'identité de l\'assistant, ses compétences, ses contraintes (ce qu\'il ne doit PAS faire) et le format de sortie attendu.'
            },
            {
              question: 'À quoi sert la variable {{user.company}} dans un system prompt ?',
              options: [
                'Elle affiche le logo de l\'entreprise',
                'Elle est remplacée automatiquement par le nom de l\'entreprise de l\'utilisateur',
                'Elle crée une nouvelle entreprise dans le CRM',
                'Elle envoie un email à l\'entreprise'
              ],
              correctIndex: 1,
              explanation: 'Les variables dynamiques comme {{user.company}} sont des placeholders remplacés automatiquement par les vraies données au moment de l\'exécution.'
            },
            {
              question: 'Quelle technologie Freenzy utilise-t-il pour la mémoire long terme des assistants ?',
              options: [
                'Un simple fichier texte',
                'Le cache du navigateur (localStorage)',
                'pgvector (base de données vectorielle)',
                'Des cookies de session'
              ],
              correctIndex: 2,
              explanation: 'pgvector, intégré à PostgreSQL, permet de stocker et rechercher des souvenirs sémantiquement proches — c\'est la mémoire RAG de Freenzy.'
            },
            {
              question: 'Un assistant custom utilise-t-il le routage intelligent automatiquement ?',
              options: [
                'Non, il faut choisir manuellement le modèle',
                'Oui, Freenzy choisit Haiku/Sonnet/Opus selon la complexité',
                'Non, les assistants custom utilisent toujours Opus',
                'Oui, mais uniquement si on active une option payante'
              ],
              correctIndex: 1,
              explanation: 'Les assistants custom héritent automatiquement du routage intelligent : Haiku pour l\'exécution rapide, Sonnet pour la rédaction, Opus pour la stratégie.'
            },
            {
              question: 'Que contient la mémoire persistante d\'un assistant après 5 échanges avec un client ?',
              options: [
                'Uniquement le dernier message envoyé',
                'Un profil progressif du client (préférences, historique, contexte)',
                'Les mots de passe du client',
                'Rien, la mémoire est réinitialisée à chaque session'
              ],
              correctIndex: 1,
              explanation: 'La mémoire persistante construit un profil progressif : préférences de communication, historique des interactions, contexte accumulé — pour une personnalisation automatique.'
            }
          ]
        }
      ]
    },

    /* ═══════════════════════════════════════════════════════════════
       Module 5 — Optimisation des coûts
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m5',
      title: 'Optimisation des coûts',
      description: 'Réduisez vos coûts IA avec le bon choix Haiku, Sonnet ou Opus.',
      emoji: '💎',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m5-l1',
          type: 'text' as const,
          title: 'Haiku vs Sonnet vs Opus : bien choisir son modèle',
          duration: '4 min',
          xpReward: 25,
          content: `L'optimisation des coûts IA commence par un principe simple : utiliser le bon modèle pour la bonne tâche. Freenzy vous donne accès à trois niveaux de puissance, et savoir quand utiliser chacun peut diviser votre facture par 5 💡

Haiku (L1) — Le sprinter 🏃
Coût : ~1 crédit par appel. Ultra-rapide (< 1 seconde). Parfait pour les tâches d'exécution simples : classification d'emails, extraction de données structurées, réponses FAQ, traduction de phrases courtes, formatage de texte. Si la tâche peut être décrite en une phrase, Haiku suffit probablement.

Sonnet (L2) — Le rédacteur 📝
Coût : ~3 crédits par appel. Excellent rapport qualité/prix. Idéal pour : rédaction de contenus (emails, posts, articles), analyse de documents, synthèse de réunions, création de devis personnalisés, support client complexe. C'est le modèle que vous utiliserez le plus souvent.

Opus (L3) — Le stratège 🧠
Coût : ~5 crédits par appel. Le plus puissant, avec Extended Thinking. Réservé aux décisions stratégiques : analyse de marché approfondie, planification business, négociation complexe, résolution de problèmes multi-dimensionnels, brainstorming créatif de haut niveau.

Le prompt caching est votre arme secrète pour réduire les coûts 🔥 Quand vous envoyez un system prompt identique à de multiples reprises (ce qui arrive souvent avec les assistants), Freenzy met en cache la partie fixe. Résultat : le deuxième appel et tous les suivants coûtent beaucoup moins cher, car seule la partie variable (votre message) est facturée en tokens d'entrée complets.

Le batch API est une autre technique puissante. Au lieu d'envoyer 50 requêtes individuelles, regroupez-les en un seul lot. Freenzy les traite ensemble avec un tarif réduit et un délai légèrement plus long (minutes au lieu de secondes). Parfait pour les tâches non urgentes : génération de 50 emails de relance, analyse de 100 CV, classification de 200 tickets support.

Règle d'or : commencez toujours par Haiku. Si le résultat n'est pas assez bon, montez à Sonnet. Réservez Opus pour les cas où la qualité de réflexion est critique. Cette approche « bottom-up » peut réduire vos coûts de 60 à 80 % sans perte de qualité perceptible 📉`
        },
        {
          id: 'orch-m5-l2',
          type: 'game' as const,
          title: 'Jeu — Classez les tâches par modèle optimal',
          duration: '3 min',
          xpReward: 50,
          content: 'Classez ces 8 tâches de la moins coûteuse (Haiku) à la plus coûteuse (Opus) en fonction du modèle optimal.',
          gameType: 'ordering',
          gameData: {
            items: [
              { id: 'classify', label: 'Classifier un email entrant (spam/prioritaire/normal)', correctPosition: 1 },
              { id: 'translate', label: 'Traduire une phrase courte en anglais', correctPosition: 2 },
              { id: 'faq', label: 'Répondre à une question FAQ avec réponse connue', correctPosition: 3 },
              { id: 'email', label: 'Rédiger un email de relance personnalisé', correctPosition: 4 },
              { id: 'summary', label: 'Synthétiser un rapport de 20 pages', correctPosition: 5 },
              { id: 'devis', label: 'Créer un devis complexe avec options et remises', correctPosition: 6 },
              { id: 'strategy', label: 'Analyser le marché et recommander un pivot stratégique', correctPosition: 7 },
              { id: 'negociation', label: 'Simuler une négociation multi-parties avec scénarios', correctPosition: 8 }
            ]
          }
        },
        {
          id: 'orch-m5-l3',
          type: 'quiz' as const,
          title: 'Quiz — Optimisation des coûts',
          duration: '3 min',
          xpReward: 50,
          content: 'Vérifiez que vous savez optimiser vos crédits IA comme un pro.',
          quizQuestions: [
            {
              question: 'Quelle approche permet de réduire les coûts de 60 à 80 % ?',
              options: [
                'Toujours utiliser Opus pour garantir la qualité',
                'L\'approche bottom-up : commencer par Haiku, monter si nécessaire',
                'Limiter le nombre de requêtes à 10 par jour',
                'Désactiver le routage intelligent'
              ],
              correctIndex: 1,
              explanation: 'L\'approche bottom-up (Haiku → Sonnet → Opus si nécessaire) utilise le modèle le moins cher qui donne un résultat satisfaisant.'
            },
            {
              question: 'Qu\'est-ce que le prompt caching permet d\'économiser ?',
              options: [
                'Le temps de réponse uniquement',
                'Les tokens d\'entrée sur la partie fixe du system prompt',
                'Les tokens de sortie',
                'La bande passante réseau'
              ],
              correctIndex: 1,
              explanation: 'Le prompt caching met en cache la partie fixe du system prompt. Les appels suivants ne facturent en tokens d\'entrée complets que la partie variable.'
            },
            {
              question: 'Pour quel type de tâche le batch API est-il le plus adapté ?',
              options: [
                'Un chat en temps réel avec un client',
                'Un appel téléphonique urgent',
                'La génération de 50 emails de relance non urgents',
                'La réponse à une question FAQ simple'
              ],
              correctIndex: 2,
              explanation: 'Le batch API regroupe des requêtes non urgentes en un lot traité à tarif réduit — parfait pour les tâches en masse qui peuvent attendre quelques minutes.'
            },
            {
              question: 'Quel modèle est recommandé pour une synthèse de réunion ?',
              options: [
                'Haiku (L1)',
                'Sonnet (L2)',
                'Opus (L3)',
                'Peu importe, ils donnent le même résultat'
              ],
              correctIndex: 1,
              explanation: 'Sonnet (L2) offre le meilleur rapport qualité/prix pour la rédaction et la synthèse. Haiku serait trop limité, Opus serait surdimensionné.'
            }
          ]
        }
      ]
    },

    /* ═══════════════════════════════════════════════════════════════
       Module 6 — Cas d'usage avancés par métier
       ═══════════════════════════════════════════════════════════════ */
    {
      id: 'orch-m6',
      title: 'Cas d\'usage avancés par métier',
      description: 'Découvrez des pipelines multi-agents concrets par secteur d\'activité.',
      emoji: '🏢',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'orch-m6-l1',
          type: 'text' as const,
          title: 'Artisan & Médecin : pipelines métier concrets',
          duration: '4 min',
          xpReward: 25,
          content: `Passons de la théorie à la pratique avec des cas d'usage concrets qui montrent toute la puissance de l'orchestration multi-agents dans des contextes métier réels 🔧

CAS 1 — L'artisan plombier : pipeline Devis → Relance → Facture

Imaginez Jean, plombier à Lyon. Un client l'appelle pour une fuite. Voici le pipeline qui se déclenche automatiquement :

Étape 1 : L'assistant Répondeur (fz-repondeur) prend l'appel, identifie le problème (fuite sous évier), la localisation et l'urgence. Il propose un créneau d'intervention disponible dans l'agenda de Jean.

Étape 2 : L'assistant Devis (fz-documents) génère automatiquement un devis détaillé : main-d'œuvre (1h30, 75 €), pièces (joint + flexible, 35 €), déplacement (25 €). Total : 135 € TTC. Le devis est envoyé par email et SMS au client.

Étape 3 : Si le client n'a pas répondu après 48h, l'assistant Relance envoie un SMS amical : « Bonjour M. Martin, avez-vous pu consulter notre devis ? N'hésitez pas si vous avez des questions. Jean, votre plombier. »

Étape 4 : Une fois l'intervention réalisée, Jean prend une photo du travail fini. L'assistant Facturation génère la facture conforme, l'envoie au client et met à jour la comptabilité.

Résultat : Jean n'a touché à aucun document. Il a juste fait son métier de plombier. Tout l'administratif s'est géré tout seul 🎉

CAS 2 — Le cabinet médical : pipeline Patient → Documentation → Rendez-vous

Le Dr. Sophie dirige un cabinet de dermatologie. Voici son pipeline quotidien :

Étape 1 : L'assistant Accueil qualifie les appels entrants : nouveau patient ou suivi, motif de consultation, degré d'urgence (éruption cutanée = urgent, contrôle annuel = non urgent).

Étape 2 : L'assistant Documentation prépare le dossier patient avant la consultation : antécédents récupérés, traitements en cours, résultats d'analyses récentes, notes des visites précédentes — tout est synthétisé en un résumé d'une page.

Étape 3 : L'assistant Rendez-vous optimise le planning en tenant compte de la durée estimée par type de consultation (15 min pour un suivi, 30 min pour une première visite, 45 min pour un acte technique) et des préférences horaires du patient.

Le Dr. Sophie arrive le matin avec un planning optimisé et des dossiers prêts. Elle passe 100 % de son temps à soigner, 0 % en admin. C'est exactement la promesse de l'orchestration multi-agents 💊`
        },
        {
          id: 'orch-m6-l2',
          type: 'text' as const,
          title: 'Agence : brief → contenu → reporting',
          duration: '3 min',
          xpReward: 25,
          content: `CAS 3 — L'agence de communication : pipeline Brief → Contenu → Reporting

Clara dirige une agence de 8 personnes qui gère 15 clients. Chaque mois, c'est la même course : produire du contenu pour chaque client, publier au bon moment, puis envoyer les rapports de performance. Avec Freenzy, tout est orchestré automatiquement 🎬

Étape 1 — Brief automatique : en début de mois, l'assistant Stratégie (fz-dg) analyse les résultats du mois précédent pour chaque client et génère un brief créatif personnalisé. Pour le client « Restaurant Le Jardin », le brief indique : « Posts à privilégier : plats de saison printemps, story coulisses cuisine, réel du chef. Hashtags recommandés : #GastronomieLyon #FaitMaison. Fréquence : 4 posts/semaine. »

Étape 2 — Production de contenu : le brief est distribué en parallèle à plusieurs assistants. L'assistant Rédacteur (fz-redacteur) écrit les textes des posts. L'assistant Studio (fz-studio) génère les visuels avec les bons formats (carré pour Instagram, 16:9 pour LinkedIn). L'assistant Social (fz-communication) planifie le calendrier de publication avec les créneaux optimaux.

Étape 3 — Publication et suivi : les posts sont publiés automatiquement aux horaires programmés. L'assistant Veille (fz-veille) surveille les métriques en temps réel : likes, commentaires, partages, taux d'engagement.

Étape 4 — Reporting client : en fin de mois, l'assistant Reporting compile toutes les données dans un rapport professionnel : métriques clés, comparaison M-1, meilleures publications, recommandations pour le mois suivant. Le rapport est envoyé automatiquement à chaque client avec un email personnalisé.

Ce pipeline transforme une agence de 8 personnes en une agence qui produit comme si elle en avait 30. Le temps libéré est réinvesti en stratégie, en relation client et en prospection — les tâches à forte valeur ajoutée que l'IA ne peut pas (encore) remplacer 🚀

L'orchestration multi-agents n'est pas juste une fonctionnalité technique. C'est un nouveau paradigme de travail où l'humain pilote et l'IA exécute. Et le plus beau ? Chaque pipeline que vous créez vous rend un peu plus libre de faire ce que vous aimez vraiment ❤️`
        },
        {
          id: 'orch-m6-l3',
          type: 'quiz' as const,
          title: 'Quiz — Cas d\'usage métier',
          duration: '3 min',
          xpReward: 75,
          content: 'Testez vos connaissances sur les pipelines multi-agents appliqués aux cas métier.',
          quizQuestions: [
            {
              question: 'Dans le pipeline de l\'artisan, quel assistant génère automatiquement le devis ?',
              options: [
                'fz-repondeur',
                'fz-documents',
                'fz-commercial',
                'fz-communication'
              ],
              correctIndex: 1,
              explanation: 'L\'assistant Documents (fz-documents) gère la génération de devis, factures et autres documents commerciaux à partir des données collectées.'
            },
            {
              question: 'Que prépare l\'assistant Documentation du cabinet médical avant chaque consultation ?',
              options: [
                'Un devis de consultation',
                'Une ordonnance pré-remplie',
                'Un résumé d\'une page avec antécédents, traitements et résultats d\'analyses',
                'Un email de confirmation au patient'
              ],
              correctIndex: 2,
              explanation: 'L\'assistant synthétise toutes les informations pertinentes du dossier patient en un résumé d\'une page pour que le médecin soit préparé à chaque consultation.'
            },
            {
              question: 'Dans le pipeline de l\'agence, combien d\'assistants travaillent en parallèle à l\'étape production de contenu ?',
              options: [
                '1 seul (le rédacteur)',
                '2 (rédacteur + studio)',
                '3 (rédacteur + studio + social)',
                '4 (rédacteur + studio + social + veille)'
              ],
              correctIndex: 2,
              explanation: 'À l\'étape 2, trois assistants travaillent en parallèle : le Rédacteur (textes), le Studio (visuels) et le Social (calendrier de publication).'
            },
            {
              question: 'Quel est le principal avantage de l\'orchestration multi-agents pour une agence ?',
              options: [
                'Remplacer tous les employés par de l\'IA',
                'Produire comme une équipe 3 fois plus grande et libérer du temps pour la stratégie',
                'Réduire le nombre de clients',
                'Éliminer le besoin de reporting'
              ],
              correctIndex: 1,
              explanation: 'L\'orchestration permet à une petite équipe de produire comme une grande, en libérant du temps pour la stratégie, la relation client et la prospection.'
            },
            {
              question: 'Quel assistant de l\'agence surveille les métriques après publication ?',
              options: [
                'fz-redacteur',
                'fz-studio',
                'fz-veille',
                'fz-dg'
              ],
              correctIndex: 2,
              explanation: 'L\'assistant Veille (fz-veille) surveille les métriques de performance en temps réel après chaque publication : likes, commentaires, partages, engagement.'
            }
          ]
        }
      ]
    }
  ]
};
