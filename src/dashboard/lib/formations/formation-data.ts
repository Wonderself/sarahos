// =============================================================================
// Freenzy.io — Formation Data (Part 1)
// Parcours 1: Premiers pas avec Freenzy
// Parcours 2: Prompt Engineering
// =============================================================================

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FormationLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'exercise' | 'game';
  content: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  exercisePrompt?: string;
  gameType?: 'matching' | 'ordering' | 'fill-blanks' | 'flashcards';
  gameData?: Record<string, unknown>;
  xpReward?: number;
  xp?: number;
  questions?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface FormationModule {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  duration: string;
  lessons: FormationLesson[];
  passingScore?: number;
  xpReward?: number;
  xp?: number;
  badgeEmoji?: string;
  badgeName?: string;
}

export interface FormationParcours {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: string;
  subcategory: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  levelLabel: string;
  modules: FormationModule[];
  diplomaTitle: string;
  diplomaSubtitle: string;
  totalDuration: string;
  totalXP: number;
  color: string;
  available: boolean;
  comingSoon?: boolean;
}

export interface FormationCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  parcours: string[];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const FORMATION_CATEGORIES: FormationCategory[] = [
  { id: 'freenzy', title: 'Maitriser Freenzy', emoji: '\u{1F916}', description: 'Apprenez a utiliser la plateforme', parcours: ['premiers-pas', 'maitriser-assistants'] },
  { id: 'ia', title: 'Intelligence Artificielle', emoji: '\u{1F9E0}', description: 'Comprendre et utiliser l\'IA', parcours: ['prompt-engineering'] },
  { id: 'contenu', title: 'Creation de contenu', emoji: '\u{1F3A8}', description: 'Photos, videos, posts, branding', parcours: ['contenu-pro'] },
  { id: 'business', title: 'Business & Productivite', emoji: '\u{1F4BC}', description: 'Devis, factures, CRM, equipes', parcours: [] },
  { id: 'technique', title: 'Technique & Integrations', emoji: '\u{1F527}', description: 'API, Telegram, webhooks', parcours: ['api-integrations'] },
  { id: 'securite', title: 'Securite & Conformite', emoji: '\u{1F6E1}\u{FE0F}', description: 'RGPD, protection des donnees', parcours: ['securite-rgpd'] },
  { id: 'langues', title: 'Langues', emoji: '\u{1F30D}', description: 'Bientot disponible — style Duolingo', parcours: ['francais-anglais', 'francais-hebreu'] },
  { id: 'metier', title: 'Par metier', emoji: '\u{1F3AF}', description: 'Formations specifiques par profession', parcours: ['freenzy-artisans', 'freenzy-medecins', 'freenzy-agences', 'freenzy-ecommerce'] },
];

// ---------------------------------------------------------------------------
// PARCOURS 1 — Premiers pas avec Freenzy
// ---------------------------------------------------------------------------

export const parcoursPremiersPas: FormationParcours = {
  id: 'premiers-pas',
  title: 'Premiers pas avec Freenzy',
  emoji: '\u{1F680}',
  description: 'Decouvrez la plateforme Freenzy de A a Z : navigation, assistants, documents, personnalisation, branding et collaboration en equipe.',
  category: 'freenzy',
  subcategory: 'prise-en-main',
  level: 'debutant',
  levelLabel: 'Debutant',
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Decouvrir le dashboard
    // -----------------------------------------------------------------------
    {
      id: 'pp-m1',
      title: 'Decouvrir le dashboard',
      emoji: '\u{1F5A5}\u{FE0F}',
      description: 'Prenez vos reperes dans l\'interface Freenzy : navigation, barre laterale, raccourcis.',
      duration: '15 min',
      lessons: [
        {
          id: 'pp-m1-l1',
          title: 'Navigation dans le dashboard',
          duration: '6 min',
          type: 'text',
          content: `Bienvenue dans le Flashboard, le tableau de bord central de Freenzy.io. Cette lecon vous guide a travers les elements principaux de l'interface pour que vous soyez immediatement operationnel.

Lorsque vous vous connectez, vous arrivez sur la page d'accueil du dashboard. En haut de l'ecran, vous trouverez la barre de navigation principale qui affiche le logo Freenzy.IO, un indicateur de credits restants et votre avatar utilisateur. Cliquer sur votre avatar ouvre un menu deroulant avec les options de profil, parametres et deconnexion.

La zone centrale du dashboard est votre espace de travail. Elle affiche par defaut un resume de votre activite recente : derniers documents generes, conversations en cours avec vos assistants, et notifications importantes. Chaque carte est cliquable et vous amene directement vers l'element concerne.

En bas de la page d'accueil, vous trouverez une section "Actions rapides" qui regroupe les taches les plus courantes : lancer une conversation, generer un document, creer un visuel ou consulter vos statistiques. Ces raccourcis sont personnalisables depuis les parametres.

La recherche globale est accessible via le raccourci clavier Cmd+K (ou Ctrl+K sur Windows). Elle permet de trouver instantanement un assistant, un document, une page ou un parametre. Commencez a taper et les resultats apparaissent en temps reel, classes par categorie.

Chaque page du dashboard suit une structure coherente : un titre en haut a gauche avec un emoji descriptif, une zone de contenu principale, et parfois une barre d'actions contextuelle. Cette uniformite vous permet de vous orienter rapidement, meme dans les sections que vous decouvrez pour la premiere fois.

Prenez quelques minutes pour explorer librement l'interface. Survolez les elements, cliquez sur les differentes sections de la barre laterale, et familiarisez-vous avec la disposition generale. Dans la prochaine lecon, nous detaillerons la barre laterale et son systeme d'emojis.`,
          xpReward: 20,
        },
        {
          id: 'pp-m1-l2',
          title: 'Barre laterale et emojis',
          duration: '5 min',
          type: 'text',
          content: `La barre laterale gauche (sidebar) est votre principal outil de navigation dans Freenzy. Elle est organisee en sections thematiques, chacune identifiee par un emoji qui permet de reperer visuellement sa fonction.

Voici les principales sections que vous trouverez :

Espace travail regroupe vos assistants favoris, vos conversations recentes et votre file d'attente de taches. C'est votre point de depart quotidien.

Services contient les outils metier : generation de documents (devis, factures, contrats), gestion de contacts et CRM simplifie. Chaque outil est accessible en un clic.

Divertissement donne acces au Studio creatif (photos et videos IA), a l'Arcade (mini-jeux gamifies) et aux recompenses. Cette section rend l'experience Freenzy plus engageante.

Moi est votre espace personnel : profil, preferences, branding, et historique d'activite. Vous y configurez tout ce qui vous est propre.

Discussions ouvre les Deep Discussions, des echanges approfondis avec l'IA sur des sujets complexes, philosophiques ou strategiques.

La sidebar est retractable : cliquez sur l'icone hamburger en haut pour la replier et gagner de l'espace sur l'ecran principal. Sur mobile, elle se transforme automatiquement en menu hamburger accessible depuis l'en-tete.

Chaque element de la sidebar affiche un compteur de notifications quand une action requiert votre attention. Par exemple, un badge rouge sur "Documents" indique qu'un devis attend votre validation.`,
          xpReward: 20,
        },
        {
          id: 'pp-m1-l3',
          title: 'Quiz : L\'interface Freenzy',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la navigation et l\'interface du dashboard Freenzy.',
          quizQuestions: [
            {
              question: 'Quel raccourci clavier ouvre la recherche globale dans le dashboard ?',
              options: ['Ctrl+F', 'Ctrl+K', 'Ctrl+S', 'Ctrl+G'],
              correctIndex: 1,
              explanation: 'La recherche globale s\'ouvre avec Cmd+K (Mac) ou Ctrl+K (Windows). Elle permet de trouver instantanement assistants, documents, pages et parametres.',
            },
            {
              question: 'Quelle section de la sidebar contient le Studio creatif ?',
              options: ['Espace travail', 'Services', 'Divertissement', 'Moi'],
              correctIndex: 2,
              explanation: 'Le Studio creatif se trouve dans la section Divertissement, aux cotes de l\'Arcade et des Recompenses.',
            },
            {
              question: 'Que se passe-t-il quand vous cliquez sur votre avatar en haut a droite ?',
              options: [
                'Rien, c\'est decoratif',
                'Un menu deroulant s\'ouvre avec profil, parametres et deconnexion',
                'Vous etes redirige vers la page d\'accueil',
                'La sidebar se replie',
              ],
              correctIndex: 1,
              explanation: 'L\'avatar ouvre un menu deroulant avec les options Profil, Parametres et Deconnexion.',
            },
            {
              question: 'Comment la sidebar se comporte-t-elle sur mobile ?',
              options: [
                'Elle reste toujours visible',
                'Elle disparait completement',
                'Elle se transforme en menu hamburger',
                'Elle s\'affiche en bas de l\'ecran',
              ],
              correctIndex: 2,
              explanation: 'Sur mobile, la sidebar se transforme en menu hamburger accessible depuis l\'en-tete pour optimiser l\'espace d\'affichage.',
            },
            {
              question: 'A quoi sert le badge rouge sur un element de la sidebar ?',
              options: [
                'Il indique une erreur systeme',
                'Il montre que la fonctionnalite est premium',
                'Il signale une notification ou une action en attente',
                'Il indique que la section est en maintenance',
              ],
              correctIndex: 2,
              explanation: 'Les badges rouges signalent des notifications : un document a valider, un message non lu ou une action qui requiert votre attention.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 70,
      badgeEmoji: '\u{1F5A5}\u{FE0F}',
      badgeName: 'Explorateur',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Votre premier assistant
    // -----------------------------------------------------------------------
    {
      id: 'pp-m2',
      title: 'Votre premier assistant',
      emoji: '\u{1F916}',
      description: 'Choisissez un assistant et lancez votre premiere conversation IA.',
      duration: '18 min',
      lessons: [
        {
          id: 'pp-m2-l1',
          title: 'Choisir un assistant',
          duration: '7 min',
          type: 'text',
          content: `Freenzy met a votre disposition plus de 100 assistants IA specialises, chacun concu pour un domaine precis. Comprendre comment les choisir est essentiel pour tirer le meilleur parti de la plateforme.

Les assistants sont organises en plusieurs categories. Les assistants "coeur" couvrent les fonctions essentielles de toute entreprise : commercial, marketing, comptabilite, juridique, ressources humaines et communication. Ils sont disponibles des votre inscription et ne necessitent aucune configuration prealable.

Les assistants "business" etendent les capacites vers des domaines plus specialises : gestion de projet, analyse de donnees, veille concurrentielle, strategie de pricing ou encore optimisation SEO. Ils sont particulierement utiles pour les entreprises en croissance qui cherchent a automatiser des taches avancees.

Les assistants "personnels" sont orientes vers votre vie quotidienne : coach sportif, conseiller nutrition, assistant de voyage, tuteur en langues ou encore coach de developpement personnel. Ils montrent la polyvalence de la plateforme au-dela du cadre professionnel.

Pour choisir le bon assistant, posez-vous trois questions simples. Premierement, quel est l'objectif de ma tache ? Rediger, analyser, planifier ou creer ? Deuxiemement, quel est le domaine concerne ? Commercial, juridique, creatif, technique ? Troisiemement, quel niveau de complexite ? Une question simple peut etre traitee par l'assistant general, tandis qu'une analyse strategique profitera d'un assistant specialise.

Chaque assistant affiche une fiche descriptive avec son nom, son role, ses capacites principales et des exemples de questions. Consultez cette fiche avant de demarrer pour vous assurer que l'assistant correspond a votre besoin.

Vous pouvez egalement utiliser la recherche pour trouver un assistant par mot-cle. Tapez "devis" et l'assistant Commercial apparaitra en premier resultat. Tapez "logo" et l'assistant Studio prendra le relais.

N'hesitez pas a tester plusieurs assistants pour une meme tache : vous decouvrirez que certains apportent des perspectives complementaires.`,
          xpReward: 25,
        },
        {
          id: 'pp-m2-l2',
          title: 'Exercice : Lancer une conversation',
          duration: '6 min',
          type: 'exercise',
          content: 'Mettez en pratique ce que vous avez appris en lancant votre premiere conversation avec un assistant IA.',
          exercisePrompt: 'Lancez une conversation avec l\'assistant Commercial (fz-commercial). Demandez-lui de vous presenter les 3 arguments cles pour vendre un service de consulting. Observez la structure de sa reponse et notez comment il organise les arguments.',
          xpReward: 35,
        },
        {
          id: 'pp-m2-l3',
          title: 'Quiz : Les assistants Freenzy',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez que vous comprenez le systeme d\'assistants et comment les utiliser efficacement.',
          quizQuestions: [
            {
              question: 'Combien d\'assistants IA sont disponibles dans Freenzy ?',
              options: ['25', '50', 'Plus de 100', 'Plus de 500'],
              correctIndex: 2,
              explanation: 'Freenzy propose plus de 100 assistants IA specialises, repartis en assistants coeur, business et personnels.',
            },
            {
              question: 'Quelle est la premiere question a se poser pour choisir un assistant ?',
              options: [
                'Quel est son prix en credits ?',
                'Quel est l\'objectif de ma tache ?',
                'Est-il disponible en anglais ?',
                'A-t-il de bonnes evaluations ?',
              ],
              correctIndex: 1,
              explanation: 'La premiere question est de definir l\'objectif : rediger, analyser, planifier ou creer. Cela oriente vers la bonne categorie d\'assistant.',
            },
            {
              question: 'Ou trouver la description detaillee d\'un assistant ?',
              options: [
                'Dans les parametres generaux',
                'Sur la fiche descriptive de l\'assistant',
                'Dans la documentation externe',
                'Il faut lui demander directement',
              ],
              correctIndex: 1,
              explanation: 'Chaque assistant possede une fiche descriptive avec son nom, son role, ses capacites et des exemples de questions.',
            },
            {
              question: 'Quel type d\'assistant est recommande pour une analyse strategique complexe ?',
              options: [
                'L\'assistant general',
                'Un assistant personnel',
                'Un assistant specialise dans le domaine concerne',
                'Peu importe, ils ont tous les memes capacites',
              ],
              correctIndex: 2,
              explanation: 'Les taches complexes beneficient d\'un assistant specialise qui dispose de prompts et de connaissances optimises pour son domaine.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F4AC}',
      badgeName: 'Communicateur',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Generer un document
    // -----------------------------------------------------------------------
    {
      id: 'pp-m3',
      title: 'Generer un document',
      emoji: '\u{1F4C4}',
      description: 'Creez devis, factures et contrats en quelques clics grace aux assistants.',
      duration: '16 min',
      lessons: [
        {
          id: 'pp-m3-l1',
          title: 'Types de documents disponibles',
          duration: '5 min',
          type: 'text',
          content: `Freenzy vous permet de generer des documents professionnels directement depuis le dashboard, sans avoir besoin de logiciel externe. Voici les principaux types disponibles.

Les devis sont le document le plus utilise. L'assistant Commercial peut generer un devis complet avec en-tete personnalise, lignes de prestations detaillees, conditions de paiement et mentions legales obligatoires. Vous fournissez les informations cles (client, prestations, tarifs) et l'IA structure le tout.

Les factures reprennent la meme logique avec les elements fiscaux supplementaires : numero de facture sequentiel, TVA applicable, conditions de reglement et coordonnees bancaires. Elles peuvent etre generees a partir d'un devis accepte en un clic.

Les contrats couvrent plusieurs modeles : contrat de prestation de services, conditions generales de vente (CGV), accord de confidentialite (NDA) et contrat de travail simplifie. L'assistant Juridique adapte le contenu au droit applicable et signale les clauses importantes.

Les rapports permettent de synthetiser des donnees ou des analyses : rapport d'activite, compte-rendu de reunion, audit interne ou bilan periodique. L'assistant formate automatiquement avec sommaire, sections numerotees et conclusion.

Les emails professionnels sont egalement generes comme documents : proposition commerciale, relance client, communication interne ou newsletter. L'assistant Communication adapte le ton et la structure selon le contexte.

Tous les documents sont exportables en PDF avec votre branding (logo, couleurs, typographie). L'historique complet est conserve dans la section Documents du dashboard, permettant de retrouver, dupliquer ou modifier un document a tout moment.`,
          xpReward: 20,
        },
        {
          id: 'pp-m3-l2',
          title: 'Exercice : Generer un devis',
          duration: '6 min',
          type: 'exercise',
          content: 'Pratiquez la generation de document en creant votre premier devis professionnel.',
          exercisePrompt: 'Generez un devis pour un client fictif : Entreprise "TechVision SARL", prestation de consulting digital (3 jours a 800 euros/jour), avec 20% de TVA. Utilisez l\'assistant Commercial et demandez-lui de structurer le devis avec en-tete, detail des prestations, total HT/TTC et conditions de paiement a 30 jours.',
          xpReward: 35,
        },
        {
          id: 'pp-m3-l3',
          title: 'Quiz : Generation de documents',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la generation de documents dans Freenzy.',
          quizQuestions: [
            {
              question: 'Quel assistant est le plus adapte pour generer un contrat de prestation ?',
              options: ['Assistant Commercial', 'Assistant Juridique', 'Assistant Communication', 'Assistant General'],
              correctIndex: 1,
              explanation: 'L\'assistant Juridique est specialise dans les documents legaux : contrats, CGV, NDA. Il adapte le contenu au droit applicable.',
            },
            {
              question: 'Comment generer une facture a partir d\'un devis existant ?',
              options: [
                'Il faut tout ressaisir manuellement',
                'En un clic depuis le devis accepte',
                'Ce n\'est pas possible dans Freenzy',
                'Il faut exporter en CSV puis reimporter',
              ],
              correctIndex: 1,
              explanation: 'Une facture peut etre generee en un clic a partir d\'un devis accepte, reprenant toutes les informations avec les elements fiscaux supplementaires.',
            },
            {
              question: 'Dans quel format les documents sont-ils exportables ?',
              options: ['Word uniquement', 'PDF avec votre branding', 'Excel uniquement', 'Texte brut'],
              correctIndex: 1,
              explanation: 'Tous les documents sont exportables en PDF avec votre branding personnalise : logo, couleurs et typographie.',
            },
            {
              question: 'Ou retrouver l\'historique de vos documents generes ?',
              options: [
                'Dans les parametres generaux',
                'Dans la section Documents du dashboard',
                'Dans l\'historique des conversations',
                'Les documents ne sont pas sauvegardes',
              ],
              correctIndex: 1,
              explanation: 'L\'historique complet est conserve dans la section Documents du dashboard, avec possibilite de retrouver, dupliquer ou modifier chaque document.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F4C4}',
      badgeName: 'Redacteur',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Personnaliser vos assistants
    // -----------------------------------------------------------------------
    {
      id: 'pp-m4',
      title: 'Personnaliser vos assistants',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Ajoutez des instructions personnalisees et gerez vos favoris.',
      duration: '14 min',
      lessons: [
        {
          id: 'pp-m4-l1',
          title: 'Instructions personnalisees',
          duration: '5 min',
          type: 'text',
          content: `Chaque assistant Freenzy peut etre personnalise avec des instructions specifiques a votre contexte. Cette fonctionnalite transforme un assistant generique en un outil adapte a votre entreprise.

Les instructions personnalisees sont des directives que vous ajoutez au comportement de base de l'assistant. Par exemple, vous pouvez indiquer a l'assistant Commercial de toujours mentionner votre garantie satisfaction 30 jours, ou a l'assistant Communication de toujours utiliser le vouvoiement dans les emails.

Pour ajouter des instructions, ouvrez la fiche de l'assistant et cliquez sur "Personnaliser". Un champ de texte vous permet de saisir vos directives. Soyez precis et concret : au lieu de "sois professionnel", ecrivez "utilise toujours le vouvoiement, mentionne le nom de l'entreprise dans la signature, et termine par une formule de politesse formelle".

Les instructions s'appliquent a TOUTES les conversations futures avec cet assistant. Elles ne modifient pas les conversations passees. Vous pouvez les modifier ou les supprimer a tout moment depuis la meme fiche.

Quelques bonnes pratiques pour des instructions efficaces : decrivez votre secteur d'activite en une phrase, listez les termes specifiques a votre metier, precisez le ton souhaite (formel, decontracte, technique), et mentionnez les informations a toujours inclure ou exclure.

Les instructions personnalisees sont stockees localement et synchronisees avec votre profil. Elles persistent entre les sessions et sont restaurees automatiquement quand vous vous reconnectez.`,
          xpReward: 20,
        },
        {
          id: 'pp-m4-l2',
          title: 'Systeme de favoris',
          duration: '5 min',
          type: 'text',
          content: `Le systeme de favoris de Freenzy vous permet d'organiser et d'acceder rapidement aux assistants que vous utilisez le plus frequemment. C'est un gain de temps significatif quand vous travaillez avec plusieurs assistants au quotidien.

Pour ajouter un assistant a vos favoris, cliquez sur l'icone etoile presente sur sa fiche ou directement dans la liste des assistants. L'assistant apparait immediatement dans votre section "Favoris" en haut de la sidebar, accessible en un clic sans avoir a naviguer dans les categories.

Vous pouvez reorganiser vos favoris par glisser-deposer pour placer les plus utilises en premier. L'ordre est sauvegarde automatiquement et persiste entre les sessions.

La section Favoris affiche egalement un indicateur d'activite recente : un point vert signifie que vous avez utilise cet assistant dans les dernieres 24 heures, un point gris indique une absence d'utilisation recente. Cela vous aide a identifier les assistants que vous pourriez sous-utiliser.

Il n'y a pas de limite au nombre de favoris, mais nous recommandons de garder entre 5 et 10 assistants pour maintenir un acces rapide et efficace. Si votre liste devient trop longue, pensez a retirer les assistants que vous n'utilisez plus regulierement.

Pour retirer un favori, cliquez a nouveau sur l'icone etoile. L'assistant reste disponible dans la liste complete, il disparait simplement de votre raccourci favori.

Astuce : combinez les favoris avec les instructions personnalisees pour creer votre equipe d'assistants sur mesure, prets a intervenir instantanement.`,
          xpReward: 20,
        },
        {
          id: 'pp-m4-l3',
          title: 'Quiz : Personnalisation',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez votre comprehension de la personnalisation des assistants et du systeme de favoris.',
          quizQuestions: [
            {
              question: 'Les instructions personnalisees s\'appliquent a quelles conversations ?',
              options: [
                'Uniquement a la conversation en cours',
                'A toutes les conversations futures avec cet assistant',
                'A tous les assistants en meme temps',
                'Uniquement aux conversations de la journee',
              ],
              correctIndex: 1,
              explanation: 'Les instructions personnalisees s\'appliquent a toutes les conversations futures avec cet assistant specifique, sans modifier les conversations passees.',
            },
            {
              question: 'Quelle est la meilleure facon de rediger une instruction personnalisee ?',
              options: [
                'Ecrire "sois professionnel"',
                'Donner des directives precises et concretes avec des exemples',
                'Copier-coller un long document',
                'Laisser le champ vide et corriger au cas par cas',
              ],
              correctIndex: 1,
              explanation: 'Les instructions doivent etre precises et concretes : specifier le ton, les termes a utiliser, les informations a inclure ou exclure.',
            },
            {
              question: 'Combien de favoris est-il recommande de garder pour un acces efficace ?',
              options: ['Maximum 3', 'Entre 5 et 10', 'Minimum 20', 'Aucune limite recommandee'],
              correctIndex: 1,
              explanation: 'Entre 5 et 10 favoris est recommande pour maintenir un acces rapide et efficace sans surcharger la section.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Personnaliseur',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Votre branding
    // -----------------------------------------------------------------------
    {
      id: 'pp-m5',
      title: 'Votre branding',
      emoji: '\u{1F3A8}',
      description: 'Configurez logo, couleurs et polices pour personnaliser tous vos documents.',
      duration: '16 min',
      lessons: [
        {
          id: 'pp-m5-l1',
          title: 'Importer votre logo',
          duration: '5 min',
          type: 'text',
          content: `Le branding est l'identite visuelle de votre entreprise dans Freenzy. Tout commence par votre logo, qui apparaitra sur chaque document genere : devis, factures, contrats et rapports.

Pour importer votre logo, rendez-vous dans la section "Moi" de la sidebar, puis "Branding". Cliquez sur la zone d'import et selectionnez votre fichier. Les formats acceptes sont PNG (recommande pour la transparence), JPG et SVG. La taille maximale est de 2 Mo et la resolution recommandee est de 500x500 pixels minimum.

Une fois importe, Freenzy affiche un apercu en temps reel de votre logo tel qu'il apparaitra sur un document. Vous pouvez ajuster la position (gauche, centre, droite) et la taille relative (petit, moyen, grand) directement depuis l'apercu.

Si vous n'avez pas encore de logo, Freenzy peut vous aider. L'assistant Studio est capable de generer des propositions de logo a partir d'une description de votre activite. Decrivez votre entreprise, votre secteur et l'ambiance souhaitee, et l'IA generera plusieurs variantes que vous pourrez affiner.

Conseils pour un rendu optimal : utilisez un logo avec fond transparent (PNG) pour une integration harmonieuse sur tous les documents. Evitez les logos trop detailles qui perdent en lisibilite quand ils sont reduits. Privilegiez des couleurs contrastees qui restent lisibles en impression noir et blanc.

Votre logo est stocke de maniere securisee et associe a votre compte. Il est automatiquement applique a tous les futurs documents sans intervention supplementaire de votre part.`,
          xpReward: 20,
        },
        {
          id: 'pp-m5-l2',
          title: 'Couleurs et typographie',
          duration: '5 min',
          type: 'text',
          content: `Au-dela du logo, Freenzy vous permet de definir une palette de couleurs et une typographie qui refletent l'identite de votre marque. Ces elements sont appliques automatiquement a tous vos documents et communications generes.

La palette de couleurs comprend trois elements principaux. La couleur primaire est utilisee pour les titres, en-tetes et elements d'accentuation. La couleur secondaire apparait dans les sous-titres, bordures et elements decoratifs. La couleur d'accent est reservee aux boutons d'action, liens et mises en valeur ponctuelles.

Pour definir vos couleurs, entrez directement le code hexadecimal (par exemple #0EA5E9) ou utilisez le selecteur de couleurs integre. Un apercu en direct vous montre le resultat sur un modele de document. Freenzy verifie automatiquement le contraste entre vos couleurs et le fond pour garantir une bonne lisibilite.

La typographie est configurable avec deux niveaux : la police des titres et la police du corps de texte. Freenzy propose une selection de polices professionnelles optimisees pour les documents d'affaires. Les plus populaires sont Inter (moderne et lisible), Lora (elegante avec empattements) et Fira Sans (technique et precise).

Si vous disposez deja d'une charte graphique, vous pouvez simplement entrer les references exactes et Freenzy les appliquera fidelement. L'assistant Branding peut meme analyser votre site web existant pour extraire automatiquement vos couleurs et polices, assurant une coherence parfaite.

Toutes ces preferences sont modifiables a tout moment. Les documents deja generes conservent leur apparence d'origine, mais les nouveaux documents utiliseront automatiquement vos parametres mis a jour.`,
          xpReward: 20,
        },
        {
          id: 'pp-m5-l3',
          title: 'Exercice : Configurez votre branding',
          duration: '6 min',
          type: 'exercise',
          content: 'Mettez en place l\'identite visuelle de votre entreprise dans Freenzy.',
          exercisePrompt: 'Rendez-vous dans la section Branding (Moi > Branding). Configurez les elements suivants : 1) Importez un logo (ou utilisez le generateur IA si vous n\'en avez pas). 2) Definissez votre couleur primaire et secondaire. 3) Choisissez une police pour les titres et le corps de texte. 4) Previsualez le resultat sur un modele de devis.',
          xpReward: 35,
        },
      ],
      passingScore: 60,
      xpReward: 75,
      badgeEmoji: '\u{1F3A8}',
      badgeName: 'Designer',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Inviter votre equipe
    // -----------------------------------------------------------------------
    {
      id: 'pp-m6',
      title: 'Inviter votre equipe',
      emoji: '\u{1F465}',
      description: 'Creez votre organisation et gerez les roles de vos collaborateurs.',
      duration: '16 min',
      lessons: [
        {
          id: 'pp-m6-l1',
          title: 'Creer votre organisation',
          duration: '5 min',
          type: 'text',
          content: `Freenzy est concu pour le travail en equipe. La fonctionnalite Organisation vous permet d'inviter des collaborateurs et de partager l'acces aux assistants et documents au sein d'un espace commun.

Pour creer votre organisation, rendez-vous dans les Parametres, puis "Organisation". Cliquez sur "Creer une organisation" et renseignez le nom de votre entreprise, votre secteur d'activite et le nombre approximatif de collaborateurs. Ces informations aident Freenzy a preconfigurer les assistants les plus pertinents pour votre equipe.

Une fois l'organisation creee, vous en devenez l'administrateur principal. Vous pouvez inviter des membres par email : chaque invite recoit un lien d'inscription qui l'associe automatiquement a votre organisation. L'invitation est valide 7 jours et peut etre renvoyee si necessaire.

Les membres de l'organisation partagent un pool de credits commun geree par l'administrateur. Vous pouvez definir des limites de consommation par membre pour controler les depenses. Un tableau de bord d'utilisation vous montre la consommation de chaque membre en temps reel.

L'organisation dispose egalement d'un espace documentaire partage. Les documents generes par un membre peuvent etre visibles par toute l'equipe (ou restreints selon les permissions). Cela facilite la collaboration sur les devis, contrats et rapports.

Chaque organisation peut configurer un branding commun applique a tous les documents generes par ses membres, assurant une coherence visuelle a l'echelle de l'entreprise.`,
          xpReward: 20,
        },
        {
          id: 'pp-m6-l2',
          title: 'Roles et permissions',
          duration: '6 min',
          type: 'text',
          content: `Freenzy utilise un systeme de controle d'acces base sur les roles (RBAC) avec quatre niveaux de permissions. Comprendre ces roles est essentiel pour securiser votre organisation tout en donnant a chaque collaborateur les acces dont il a besoin.

Le role Admin est le niveau le plus eleve. L'administrateur peut gerer les membres de l'organisation, configurer les assistants, acceder a tous les documents, modifier le branding, consulter les statistiques d'utilisation et gerer les credits. Il peut egalement creer d'autres administrateurs. Nous recommandons de limiter ce role aux dirigeants ou responsables IT.

Le role Operator (operateur) est concu pour les managers et chefs d'equipe. Un operateur peut utiliser tous les assistants, generer des documents, acceder aux documents partages de l'equipe et consulter les statistiques de son perimetre. Il ne peut pas gerer les membres, modifier le branding global ni acceder a la facturation.

Le role Viewer (lecteur) est adapte aux collaborateurs qui ont besoin de consulter sans modifier. Un viewer peut lire les documents partages, consulter les conversations archivees et acceder aux rapports. Il ne peut pas lancer de nouvelles conversations avec les assistants ni generer de documents. Ce role est utile pour les parties prenantes externes ou les stagiaires.

Le role System est un role technique reserve aux integrations API et aux automatisations. Il permet d'interagir avec Freenzy programmatiquement via des tokens d'acces securises. Ce role n'est pas attribuable manuellement, il est genere lors de la configuration d'une integration.

Pour modifier le role d'un membre, l'administrateur se rend dans Parametres > Organisation > Membres. Un menu deroulant a cote de chaque membre permet de changer son role instantanement. Le changement prend effet immediatement, sans deconnexion necessaire.

Bonne pratique : appliquez le principe du moindre privilege. Donnez a chaque collaborateur le niveau d'acces minimum necessaire a ses fonctions, et elevez les permissions au cas par cas plutot que de donner le role Admin a tous.`,
          xpReward: 25,
        },
        {
          id: 'pp-m6-l3',
          title: 'Quiz : Organisation et roles',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion d\'equipe et les permissions dans Freenzy.',
          quizQuestions: [
            {
              question: 'Combien de roles differents existent dans le systeme RBAC de Freenzy ?',
              options: ['2 (admin et utilisateur)', '3 (admin, editeur, lecteur)', '4 (admin, operator, viewer, system)', '5 (admin, manager, editeur, lecteur, invite)'],
              correctIndex: 2,
              explanation: 'Freenzy utilise 4 roles : Admin (gestion complete), Operator (utilisation avancee), Viewer (lecture seule) et System (integrations API).',
            },
            {
              question: 'Quel role est recommande pour un chef d\'equipe qui doit utiliser les assistants et consulter les stats ?',
              options: ['Admin', 'Operator', 'Viewer', 'System'],
              correctIndex: 1,
              explanation: 'Le role Operator est concu pour les managers : acces complet aux assistants et documents, consultation des statistiques, sans pouvoir gerer les membres ni la facturation.',
            },
            {
              question: 'Combien de temps une invitation par email est-elle valide ?',
              options: ['24 heures', '48 heures', '7 jours', '30 jours'],
              correctIndex: 2,
              explanation: 'Les invitations sont valides 7 jours et peuvent etre renvoyees si necessaire.',
            },
            {
              question: 'Quel principe de securite est recommande pour l\'attribution des roles ?',
              options: [
                'Donner le role Admin a tous pour simplifier',
                'Le principe du moindre privilege',
                'Alterner les roles chaque semaine',
                'Utiliser uniquement le role Viewer',
              ],
              correctIndex: 1,
              explanation: 'Le principe du moindre privilege recommande de donner a chaque collaborateur le niveau d\'acces minimum necessaire a ses fonctions.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 75,
      badgeEmoji: '\u{1F465}',
      badgeName: 'Leader',
    },
  ],
  diplomaTitle: 'Freenzy Certified User',
  diplomaSubtitle: 'A valide la formation Premiers pas avec Freenzy',
  totalDuration: '1h35',
  totalXP: 460,
  color: '#0EA5E9',
  available: true,
};

// ---------------------------------------------------------------------------
// PARCOURS 2 — Prompt Engineering
// ---------------------------------------------------------------------------

export const parcoursPromptEngineering: FormationParcours = {
  id: 'prompt-engineering',
  title: 'Prompt Engineering',
  emoji: '\u{1F9E0}',
  description: 'Maitrisez l\'art de communiquer avec l\'IA : techniques de prompting, methodes avancees et optimisation des resultats.',
  category: 'ia',
  subcategory: 'prompting',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Qu'est-ce qu'un LLM ?
    // -----------------------------------------------------------------------
    {
      id: 'pe-m1',
      title: 'Qu\'est-ce qu\'un LLM ?',
      emoji: '\u{1F4A1}',
      description: 'Comprenez le fonctionnement des grands modeles de langage qui alimentent Freenzy.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m1-l1',
          title: 'Comment fonctionnent les LLM',
          duration: '7 min',
          type: 'text',
          content: `Un LLM (Large Language Model, ou grand modele de langage) est le moteur qui alimente chaque assistant de Freenzy. Comprendre son fonctionnement, meme de maniere simplifiee, vous permettra de formuler des demandes bien plus efficaces.

Un LLM est un programme informatique entraine sur des milliards de textes : livres, articles, sites web, documentation technique, conversations. Pendant cet entrainement, le modele apprend les structures du langage, les relations entre les concepts, les styles d'ecriture et les conventions de chaque domaine. Il ne memorise pas les textes mot pour mot, mais developpe une comprehension statistique profonde du langage.

Quand vous posez une question a un assistant Freenzy, le LLM analyse votre texte pour comprendre votre intention, le contexte et les attentes implicites. Il genere ensuite une reponse mot par mot (en realite token par token), en choisissant a chaque etape la suite la plus pertinente et coherente. C'est un processus probabiliste : le modele evalue des milliers de continuations possibles et selectionne la plus appropriee.

Freenzy utilise les modeles Claude d'Anthropic, reconnus pour leur precision, leur securite et leur capacite a suivre des instructions complexes. Trois niveaux sont utilises selon la tache. Le niveau L1 (Haiku) est le plus rapide : il repond en quelques secondes aux questions simples et aux executions routinieres. Le niveau L2 (Sonnet) offre un equilibre entre vitesse et qualite pour la redaction et l'analyse. Le niveau L3 (Opus) est le plus puissant : il traite les taches strategiques complexes avec un mode de reflexion approfondie (Extended Thinking).

Un point essentiel : un LLM ne "pense" pas comme un humain. Il ne possede pas de conscience, de memoire persistante entre les conversations, ni d'opinions personnelles. Ses reponses sont des generalisations apprises. C'est pourquoi la qualite de votre demande (votre prompt) influence directement la qualite de la reponse.

Comprendre cette mecanique est la cle du prompt engineering : plus votre prompt est precis, structure et contextualise, plus le LLM dispose d'informations pour generer une reponse pertinente. C'est exactement ce que nous allons apprendre dans ce parcours.`,
          xpReward: 25,
        },
        {
          id: 'pe-m1-l2',
          title: 'Tokens et contexte',
          duration: '6 min',
          type: 'text',
          content: `Le concept de token est fondamental pour comprendre comment interagir efficacement avec un LLM. Un token n'est pas exactement un mot : c'est une unite de texte que le modele traite. En francais, un mot courant correspond generalement a un ou deux tokens, tandis qu'un mot long ou technique peut en representer trois ou quatre.

Par exemple, le mot "bonjour" est un seul token, "intelligence" est deux tokens, et "anticonstitutionnellement" pourrait en representer quatre ou cinq. Les chiffres, la ponctuation et les espaces sont egalement des tokens. En regle generale, un texte de 100 mots en francais represente environ 130 a 150 tokens.

La fenetre de contexte est la quantite totale de tokens que le modele peut traiter en une seule conversation. Imaginez-la comme la memoire de travail de l'assistant. Les modeles Claude utilises par Freenzy offrent des fenetres de contexte tres larges (jusqu'a 200 000 tokens), ce qui equivaut a environ 150 000 mots, soit l'equivalent d'un roman de 500 pages.

Cette fenetre inclut tout : votre prompt, l'historique de la conversation, les instructions systeme de l'assistant et la reponse generee. Plus votre conversation est longue, plus vous utilisez de contexte. Quand la fenetre est pleine, les elements les plus anciens peuvent etre tronques, ce qui explique pourquoi un assistant peut "oublier" le debut d'une tres longue conversation.

Impact pratique sur vos prompts : un prompt court mais precis est plus efficace qu'un prompt long et vague. Chaque mot inutile consomme des tokens sans ameliorer la reponse. A l'inverse, les details pertinents (contexte metier, exemples, format attendu) guident le modele vers une reponse de meilleure qualite.

Le cout en credits est egalement lie aux tokens : plus la reponse est longue, plus elle consomme de tokens, et donc de credits. C'est pourquoi demander une reponse concise quand c'est suffisant est une bonne pratique a la fois pour la qualite et pour votre budget.`,
          xpReward: 25,
        },
        {
          id: 'pe-m1-l3',
          title: 'Quiz : Fondamentaux des LLM',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre comprehension du fonctionnement des LLM et des tokens.',
          quizQuestions: [
            {
              question: 'Comment un LLM genere-t-il du texte ?',
              options: [
                'Il recherche la reponse dans une base de donnees',
                'Il genere du texte token par token en choisissant la suite la plus probable',
                'Il copie des passages de son entrainement',
                'Il utilise des regles grammaticales programmees manuellement',
              ],
              correctIndex: 1,
              explanation: 'Un LLM genere du texte token par token, en evaluant a chaque etape des milliers de continuations possibles et en selectionnant la plus pertinente.',
            },
            {
              question: 'Quel niveau de modele Claude est utilise pour les taches strategiques complexes dans Freenzy ?',
              options: ['L1 Haiku', 'L2 Sonnet', 'L3 Opus', 'Tous les niveaux sont equivalents'],
              correctIndex: 2,
              explanation: 'Le niveau L3 (Opus) est le plus puissant, utilise pour les taches strategiques complexes avec un mode de reflexion approfondie (Extended Thinking).',
            },
            {
              question: 'Qu\'est-ce qu\'un token ?',
              options: [
                'Un mot entier dans une phrase',
                'Une unite de texte traitee par le modele (pas forcement un mot)',
                'Un credit de consommation',
                'Un caractere unique',
              ],
              correctIndex: 1,
              explanation: 'Un token est une unite de texte que le modele traite. Un mot peut correspondre a un ou plusieurs tokens selon sa longueur et sa frequence.',
            },
            {
              question: 'Que se passe-t-il quand la fenetre de contexte est pleine ?',
              options: [
                'Le modele s\'arrete de repondre',
                'Les elements les plus anciens peuvent etre tronques',
                'La conversation reprend depuis le debut',
                'Le modele devient plus precis',
              ],
              correctIndex: 1,
              explanation: 'Quand la fenetre de contexte est pleine, les elements les plus anciens peuvent etre tronques, ce qui peut faire perdre le debut de la conversation.',
            },
            {
              question: 'Pourquoi un prompt court et precis est-il preferable a un prompt long et vague ?',
              options: [
                'Parce que les LLM ne comprennent que les phrases courtes',
                'Parce que chaque mot inutile consomme des tokens sans ameliorer la reponse',
                'Parce que les prompts longs causent des erreurs systeme',
                'Parce que les LLM ignorent les textes de plus de 50 mots',
              ],
              correctIndex: 1,
              explanation: 'Un prompt precis utilise les tokens efficacement : chaque mot apporte de l\'information utile au modele, ce qui ameliore la qualite de la reponse et reduit le cout en credits.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 80,
      badgeEmoji: '\u{1F4A1}',
      badgeName: 'Initie IA',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Ecrire un bon prompt
    // -----------------------------------------------------------------------
    {
      id: 'pe-m2',
      title: 'Ecrire un bon prompt',
      emoji: '\u{270D}\u{FE0F}',
      description: 'Apprenez la methode RICE et les principes d\'un prompt efficace.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m2-l1',
          title: 'La methode RICE',
          duration: '7 min',
          type: 'text',
          content: `La methode RICE est un cadre simple et memorable pour structurer vos prompts. Chaque lettre represente un element essentiel que votre prompt devrait contenir pour obtenir des resultats optimaux.

R comme Role : commencez par definir le role que l'IA doit adopter. "Tu es un expert en marketing digital specialise dans les reseaux sociaux" est bien plus efficace que de poser une question sans contexte. Le role active chez le modele les connaissances et le style associes a cette expertise.

I comme Instruction : formulez clairement ce que vous attendez. Utilisez des verbes d'action precis : "redige", "analyse", "compare", "resume", "genere". Evitez les formulations vagues comme "parle-moi de" ou "dis-moi quelque chose sur". Plus l'instruction est specifique, plus la reponse sera ciblee.

C comme Contexte : fournissez les informations necessaires pour que l'IA comprenne votre situation. Votre secteur d'activite, votre public cible, vos contraintes, votre objectif final. Le contexte est souvent l'element le plus neglige, alors qu'il fait la difference entre une reponse generique et une reponse sur mesure.

E comme Exemple ou format Espere : decrivez le format de sortie souhaite. "Presente le resultat sous forme de tableau avec 3 colonnes : argument, avantage, preuve." Ou "Redige un email de 150 mots maximum avec objet, corps et signature." Donner un exemple de resultat attendu est encore plus puissant : le modele s'en servira comme modele.

Illustration concrete. Prompt faible : "Aide-moi avec mon marketing." Prompt RICE : "Tu es un consultant en marketing digital (R). Redige 5 idees de posts LinkedIn (I) pour une startup SaaS B2B qui vend un outil de gestion de projet, cible les PME francaises de 10 a 50 employes (C). Chaque idee doit comporter un hook accrocheur, un corps de 3 lignes et un appel a l'action. Formate en liste numerotee (E)."

La difference de qualite entre ces deux prompts est spectaculaire. Le premier produira une reponse generique de 200 mots. Le second produira 5 idees actionnables, formatees exactement comme demande, adaptees a votre contexte precis.

Avec la pratique, la methode RICE deviendra un reflexe. Vous formulerez naturellement des prompts structures qui tirent le maximum de chaque assistant Freenzy.`,
          xpReward: 30,
        },
        {
          id: 'pe-m2-l2',
          title: 'Exercice : Reecrivez ce mauvais prompt',
          duration: '6 min',
          type: 'exercise',
          content: 'Appliquez la methode RICE pour transformer un prompt mediocre en prompt performant.',
          exercisePrompt: 'Voici un mauvais prompt : "Ecris-moi un truc pour vendre mes services." Reecrivez-le en utilisant la methode RICE. Definissez un role precis, une instruction claire avec un verbe d\'action, ajoutez du contexte (inventez un metier et un public cible), et specifiez le format de sortie attendu (type de document, longueur, structure). Comparez ensuite les deux reponses generees par l\'assistant.',
          xpReward: 40,
        },
        {
          id: 'pe-m2-l3',
          title: 'Quiz : Prompts efficaces',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez votre capacite a identifier et creer des prompts de qualite.',
          quizQuestions: [
            {
              question: 'Que signifie le "R" dans la methode RICE ?',
              options: ['Resultat', 'Role', 'Recherche', 'Revision'],
              correctIndex: 1,
              explanation: 'Le R de RICE signifie Role : definir le role que l\'IA doit adopter pour activer les connaissances et le style appropries.',
            },
            {
              question: 'Quel est l\'element le plus souvent neglige dans un prompt ?',
              options: ['L\'instruction', 'Le role', 'Le contexte', 'Le format de sortie'],
              correctIndex: 2,
              explanation: 'Le contexte est l\'element le plus neglige. Il fait pourtant la difference entre une reponse generique et une reponse sur mesure.',
            },
            {
              question: 'Lequel de ces prompts est le mieux formule ?',
              options: [
                '"Parle-moi du SEO"',
                '"Redige 5 conseils SEO pour un site e-commerce de mode, cible les debutants, sous forme de liste"',
                '"SEO aide"',
                '"Dis-moi tout ce que tu sais sur le referencement"',
              ],
              correctIndex: 1,
              explanation: 'Ce prompt contient une instruction precise (redige 5 conseils), un contexte (e-commerce de mode, debutants) et un format (liste). Il suit la methode RICE.',
            },
            {
              question: 'Pourquoi fournir un exemple de resultat attendu est-il efficace ?',
              options: [
                'Cela ralentit le modele pour plus de precision',
                'Le modele s\'en sert comme modele pour structurer sa reponse',
                'Cela oblige le modele a copier l\'exemple',
                'Cela n\'a aucun effet mesurable',
              ],
              correctIndex: 1,
              explanation: 'Un exemple de resultat attendu sert de modele que le LLM utilise pour structurer, formater et calibrer sa reponse selon vos attentes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{270D}\u{FE0F}',
      badgeName: 'Prompt Crafter',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Techniques avancees
    // -----------------------------------------------------------------------
    {
      id: 'pe-m3',
      title: 'Techniques avancees',
      emoji: '\u{1F52C}',
      description: 'Few-shot learning, chain-of-thought et system prompts pour des resultats professionnels.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m3-l1',
          title: 'Few-shot et chain-of-thought',
          duration: '7 min',
          type: 'text',
          content: `Au-dela de la methode RICE, deux techniques avancees peuvent transformer radicalement la qualite des reponses obtenues : le few-shot prompting et le chain-of-thought.

Le few-shot prompting consiste a fournir quelques exemples concrets avant de poser votre question. Au lieu de dire "classe ces avis clients en positif ou negatif", vous montrez d'abord deux ou trois exemples avec la classification attendue, puis vous soumettez les avis a traiter. Le modele apprend le pattern instantanement et l'applique avec une precision bien superieure.

Exemple concret : "Voici comment classifier des avis clients. Avis : 'Livraison rapide, produit conforme' → Positif. Avis : 'Commande jamais recue, aucune reponse du SAV' → Negatif. Avis : 'Correct mais rien d'exceptionnel' → Neutre. Maintenant, classe les 10 avis suivants selon ce schema."

Le nombre d'exemples ideal est generalement entre 2 et 5. Trop peu et le modele manque de reperes. Trop et vous gaspillez des tokens sans gain significatif. Trois exemples representant les cas principaux suffisent dans la majorite des situations.

Le chain-of-thought (chaine de raisonnement) demande au modele d'expliquer son raisonnement etape par etape avant de donner sa conclusion. Ajoutez simplement "Raisonne etape par etape" ou "Explique ton raisonnement" a votre prompt. Cette technique ameliore considerablement les performances sur les taches de logique, calcul, analyse comparative et prise de decision.

Pourquoi ca fonctionne ? En forcant le modele a expliciter son raisonnement, vous l'obligez a verifier chaque etape logique au lieu de sauter directement a une conclusion potentiellement erronee. C'est l'equivalent de montrer son travail en mathematiques : le processus force la rigueur.

Combinaison gagnante : utilisez le few-shot pour montrer le format et le chain-of-thought pour les taches analytiques. Par exemple : "Voici deux exemples d'analyse SWOT (exemples). Pour l'entreprise suivante, realise une analyse SWOT en expliquant ton raisonnement pour chaque point."

Ces techniques sont particulierement puissantes avec les assistants Freenzy specialises, car elles s'ajoutent aux instructions systeme deja optimisees de chaque agent.`,
          xpReward: 30,
        },
        {
          id: 'pe-m3-l2',
          title: 'System prompts et instructions',
          duration: '6 min',
          type: 'text',
          content: `Le system prompt est un texte invisible pour l'utilisateur final, mais qui cadre le comportement de l'IA pour toute la conversation. Dans Freenzy, chaque assistant possede un system prompt optimise qui definit son expertise, son ton, ses capacites et ses limites.

Comprendre les system prompts vous aide a mieux interagir avec les assistants, car vous saurez ce qui se passe "en coulisses". Quand vous lancez une conversation avec l'assistant Commercial, un system prompt lui dit essentiellement : "Tu es un expert commercial senior. Tu rediges des propositions, analyses des opportunites, et conseilles sur les techniques de vente. Tu utilises un ton professionnel mais accessible. Tu structures tes reponses avec des titres et des listes."

Les instructions personnalisees que vous ajoutez (vues dans le parcours precedent) sont fusionnees avec le system prompt. Elles s'ajoutent apres les instructions de base, ce qui signifie qu'elles peuvent affiner ou surcharger certains comportements. Par exemple, si le system prompt dit "utilise un ton professionnel" et que vous ajoutez "utilise un ton decontracte et tutoyant", votre instruction prevaudra.

Cette hierarchie est importante : le system prompt definit le cadre general, vos instructions personnalisees ajustent le comportement specifique a votre contexte, et votre prompt dans la conversation precise la tache immediate. Les trois niveaux se combinent pour produire la reponse finale.

Pour en tirer le meilleur parti dans vos prompts, evitez de repeter ce que le system prompt fait deja. Pas besoin de dire "tu es un expert commercial" a l'assistant Commercial — il le sait deja. Concentrez-vous sur les specificites de votre demande : le contexte unique, les contraintes particulieres, le format souhaite.

Quand un assistant ne se comporte pas comme attendu, c'est souvent qu'il manque de contexte dans votre prompt pour arbitrer entre les instructions generales de son system prompt et votre besoin specifique. Ajoutez des precisions pour lever l'ambiguite.`,
          xpReward: 25,
        },
        {
          id: 'pe-m3-l3',
          title: 'Quiz : Techniques avancees',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise du few-shot, chain-of-thought et des system prompts.',
          quizQuestions: [
            {
              question: 'Combien d\'exemples sont generalement suffisants en few-shot prompting ?',
              options: ['1 seul', '2 a 5', '10 a 20', 'Plus de 50'],
              correctIndex: 1,
              explanation: 'Entre 2 et 5 exemples est le nombre ideal. Ils fournissent assez de reperes sans gaspiller des tokens.',
            },
            {
              question: 'Quelle phrase active le chain-of-thought ?',
              options: [
                '"Reponds vite"',
                '"Raisonne etape par etape"',
                '"Donne juste la conclusion"',
                '"Utilise le mode expert"',
              ],
              correctIndex: 1,
              explanation: '"Raisonne etape par etape" ou "Explique ton raisonnement" force le modele a expliciter chaque etape logique avant de conclure.',
            },
            {
              question: 'Si vos instructions personnalisees contredisent le system prompt, que se passe-t-il ?',
              options: [
                'Le system prompt prime toujours',
                'Vos instructions personnalisees prevaudront',
                'Le modele genere une erreur',
                'Les deux sont ignores',
              ],
              correctIndex: 1,
              explanation: 'Les instructions personnalisees s\'ajoutent apres le system prompt et peuvent affiner ou surcharger certains comportements.',
            },
            {
              question: 'Pour quelle type de tache le chain-of-thought est-il le plus utile ?',
              options: [
                'Generer un slogan publicitaire',
                'Traduire un texte court',
                'Analyser un probleme logique ou une decision complexe',
                'Corriger l\'orthographe d\'un email',
              ],
              correctIndex: 2,
              explanation: 'Le chain-of-thought ameliore considerablement les taches de logique, calcul, analyse comparative et prise de decision en forcant un raisonnement rigoureux.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F52C}',
      badgeName: 'Technicien IA',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Eviter les erreurs
    // -----------------------------------------------------------------------
    {
      id: 'pe-m4',
      title: 'Eviter les erreurs',
      emoji: '\u{26A0}\u{FE0F}',
      description: 'Identifiez hallucinations, biais et limites pour utiliser l\'IA de maniere fiable.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m4-l1',
          title: 'Hallucinations et biais',
          duration: '7 min',
          type: 'text',
          content: `L'IA est un outil puissant, mais elle a des limites importantes que tout utilisateur doit connaitre. Les deux pieges principaux sont les hallucinations et les biais. Les comprendre vous permettra d'utiliser Freenzy de maniere fiable et responsable.

Les hallucinations sont des reponses qui semblent correctes et convaincantes, mais qui contiennent des informations inventees. Un LLM peut citer une etude qui n'existe pas, attribuer une citation a la mauvaise personne, ou inventer des statistiques avec une precision trompeuse ("selon une etude de Harvard en 2023, 73.2% des entreprises..."). Le modele ne "ment" pas intentionnellement : il genere la suite de texte la plus probable, et parfois la suite probable n'est pas factuelle.

Comment les detecter ? Mefiez-vous des chiffres tres precis non sourres, des citations d'etudes specifiques, des noms d'auteurs peu connus et des affirmations extraordinaires. Si une information est critique pour votre decision, verifiez-la toujours via une source independante.

Comment les prevenir dans vos prompts ? Ajoutez "Si tu n'es pas sur d'une information, dis-le explicitement" ou "Base-toi uniquement sur des faits verifiables et signale quand tu specules". Les modeles Claude utilises par Freenzy sont entraines pour etre honnetes sur leur incertitude, mais un rappel explicite renforce ce comportement.

Les biais sont des tendances systematiques dans les reponses, heritees des donnees d'entrainement. Un modele entraine majoritairement sur des textes occidentaux peut avoir des perspectives culturellement biaisees. Il peut reproduire des stereotypes professionnels (associer certains metiers a un genre) ou privilegier des solutions adaptees a un contexte americain plutot qu'europeen.

Comment les attenuer ? Specifiez votre contexte geographique et culturel dans vos prompts. Demandez explicitement de considerer des perspectives multiples. Si vous redigez pour un public specifique, mentionnez-le clairement.

Bonne pratique generale : considerez l'IA comme un assistant brillant mais faillible. Relisez toujours les reponses avec un oeil critique, surtout pour les documents officiels, les conseils juridiques et les chiffres financiers. L'IA accelere votre travail, mais la validation finale reste votre responsabilite.`,
          xpReward: 30,
        },
        {
          id: 'pe-m4-l2',
          title: 'Jeu : Identifiez les erreurs',
          duration: '6 min',
          type: 'game',
          content: 'Entrainez-vous a reperer les hallucinations et erreurs dans des reponses IA.',
          gameType: 'fill-blanks',
          gameData: {
            instructions: 'Chaque phrase ci-dessous contient une erreur generee par une IA. Identifiez le mot ou la partie incorrecte et corrigez-la.',
            sentences: [
              {
                text: 'Selon la loi francaise, une entreprise peut embaucher un stagiaire pour une duree maximale de ___ mois par an.',
                blank: '12',
                correct: '6',
                explanation: 'La duree maximale d\'un stage en France est de 6 mois par annee d\'enseignement (Article L124-5 du Code de l\'education).',
              },
              {
                text: 'Le RGPD a ete mis en application en ___, imposant de nouvelles regles de protection des donnees en Europe.',
                blank: '2016',
                correct: '2018',
                explanation: 'Le RGPD a ete adopte en 2016 mais mis en application le 25 mai 2018. C\'est une confusion frequente dans les reponses IA.',
              },
              {
                text: 'Pour etre juridiquement valable, un devis en France doit obligatoirement etre signe par ___.',
                blank: 'un notaire',
                correct: 'le client (acceptation)',
                explanation: 'Un devis n\'a pas besoin d\'un notaire. Il devient un engagement contractuel une fois signe et date par le client avec la mention "bon pour accord".',
              },
              {
                text: 'Le taux de TVA standard en France est de ___.',
                blank: '21%',
                correct: '20%',
                explanation: 'Le taux de TVA standard en France est de 20%. Le taux de 21% est celui de la Belgique ou des Pays-Bas. Une confusion frequente pour les IA.',
              },
              {
                text: 'Une SARL en France necessite un capital social minimum de ___.',
                blank: '7 500 euros',
                correct: '1 euro',
                explanation: 'Depuis la loi LME de 2008, le capital social minimum d\'une SARL est de 1 euro. Le seuil de 7 500 euros est l\'ancien minimum, souvent cite par erreur.',
              },
            ],
          },
          xpReward: 40,
        },
        {
          id: 'pe-m4-l3',
          title: 'Quiz : Limites de l\'IA',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez votre capacite a identifier les risques et limites des LLM.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'une hallucination dans le contexte des LLM ?',
              options: [
                'Un bug logiciel qui crash l\'application',
                'Une reponse convaincante mais contenant des informations inventees',
                'Un message d\'erreur affiche a l\'ecran',
                'Un ralentissement du modele',
              ],
              correctIndex: 1,
              explanation: 'Une hallucination est une reponse qui semble correcte et convaincante mais contient des faits, chiffres ou citations inventes par le modele.',
            },
            {
              question: 'Quelle phrase ajouter au prompt pour reduire les hallucinations ?',
              options: [
                '"Reponds plus vite"',
                '"Si tu n\'es pas sur, dis-le explicitement"',
                '"Utilise le mode precis"',
                '"Ecris en majuscules"',
              ],
              correctIndex: 1,
              explanation: 'Demander au modele de signaler son incertitude l\'encourage a etre honnete plutot que d\'inventer des informations pour paraitre confiant.',
            },
            {
              question: 'Pour quels types de contenus la verification humaine est-elle la plus critique ?',
              options: [
                'Les slogans publicitaires',
                'Les idees de brainstorming',
                'Les documents juridiques, chiffres financiers et conseils medicaux',
                'Les descriptions de produits generiques',
              ],
              correctIndex: 2,
              explanation: 'Les documents officiels, conseils juridiques et chiffres financiers necessitent une verification rigoureuse car une erreur peut avoir des consequences legales ou financieres.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 95,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Esprit Critique',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Prompts par metier
    // -----------------------------------------------------------------------
    {
      id: 'pe-m5',
      title: 'Prompts par metier',
      emoji: '\u{1F4BC}',
      description: 'Des templates de prompts adaptes a chaque profession.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m5-l1',
          title: 'Exemples par profession',
          duration: '7 min',
          type: 'text',
          content: `Chaque metier a des besoins specifiques en matiere de prompting. Voici des templates eprouves pour les professions les plus courantes, que vous pouvez adapter a votre contexte.

Artisans et commercants : "Tu es un assistant commercial pour un artisan [plombier/electricien/boulanger]. Redige un devis detaille pour [description du chantier/commande], incluant les materiaux, la main d'oeuvre et le delai d'execution. Le client est un particulier dans la region de [ville]. Applique le taux de TVA a [10%/20%] et mentionne la garantie decennale si applicable."

Professions liberales (avocats, experts-comptables) : "Tu es un expert en [droit des societes/fiscalite]. Mon client est une [type d'entreprise] de [secteur]. Analyse la situation suivante : [description]. Presente ton analyse en 3 parties : rappel du cadre legal, application au cas present, recommandations concretes. Signale les risques et les points de vigilance."

Professionnels de sante : "Tu es un assistant administratif pour un cabinet medical. Redige un modele de [courrier au medecin traitant/compte-rendu de consultation/formulaire de consentement] pour [specialite]. Le ton doit etre clinique et precis. Rappel : ne jamais fournir de diagnostic medical, uniquement de l'aide administrative et redactionnelle."

Commerciaux et marketeurs : "Tu es un directeur commercial avec 15 ans d'experience en B2B. Mon entreprise vend [produit/service] a [cible]. Notre avantage competitif est [differenciateur]. Redige un script d'appel de prospection de 2 minutes avec une accroche percutante, 3 questions de decouverte et une proposition de rendez-vous. Prevois 2 reponses aux objections classiques."

Restaurateurs et hotelliers : "Tu es un consultant en restauration. Mon etablissement est un [type de restaurant] avec [X] couverts a [ville]. Propose un menu du jour equilibre pour [saison] a un food cost de [30-35%]. Inclus entree, plat, dessert avec les allergenes principaux mentionnes."

E-commerçants : "Tu es un expert e-commerce specialise en [marketplace]. Redige une fiche produit optimisee SEO pour [produit]. Inclus un titre de 80 caracteres max, 5 bullet points cles, une description de 200 mots et 5 mots-cles pertinents. Le ton est [premium/accessible/technique] et la cible est [persona]."

L'element commun a tous ces templates : ils definissent un role expert, fournissent le contexte metier, precisent le format attendu et incluent les contraintes specifiques au domaine. Adaptez-les avec vos propres details pour des resultats immediatement actionnables.`,
          xpReward: 30,
        },
        {
          id: 'pe-m5-l2',
          title: 'Exercice : Creez votre prompt metier',
          duration: '6 min',
          type: 'exercise',
          content: 'Concevez un prompt personnalise adapte a votre activite professionnelle.',
          exercisePrompt: 'En vous inspirant des templates vus dans la lecon precedente, creez un prompt complet pour votre propre metier. Votre prompt doit contenir : 1) Un role expert precis. 2) Une instruction claire avec un verbe d\'action. 3) Le contexte de votre entreprise (secteur, taille, cible). 4) Le format de sortie attendu. 5) Au moins une contrainte specifique a votre domaine. Testez-le avec un assistant Freenzy et evaluez la qualite de la reponse.',
          xpReward: 40,
        },
        {
          id: 'pe-m5-l3',
          title: 'Quiz : Prompts metier',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre capacite a adapter les techniques de prompting a differents metiers.',
          quizQuestions: [
            {
              question: 'Pourquoi est-il important de specifier le taux de TVA dans un prompt pour artisan ?',
              options: [
                'Pour impressionner le client',
                'Parce que le taux varie selon le type de travaux (10% renovation, 20% neuf)',
                'Le taux est toujours le meme, c\'est inutile',
                'Pour eviter que l\'IA invente un taux fantaisiste',
              ],
              correctIndex: 1,
              explanation: 'Le taux de TVA varie : 10% pour les travaux de renovation dans un logement ancien, 20% pour le neuf. Specifier le taux evite une erreur potentiellement couteuse.',
            },
            {
              question: 'Quelle mention est essentielle dans un prompt pour un professionnel de sante ?',
              options: [
                '"Prescris le meilleur traitement"',
                '"Ne jamais fournir de diagnostic medical"',
                '"Ignore les aspects legaux"',
                '"Utilise des termes simplifies"',
              ],
              correctIndex: 1,
              explanation: 'Un assistant IA ne doit jamais fournir de diagnostic medical. Preciser cette limite dans le prompt garantit que l\'IA reste dans son role d\'aide administrative.',
            },
            {
              question: 'Quel element commun rend tous les templates metier efficaces ?',
              options: [
                'Ils sont tous tres courts',
                'Ils definissent un role expert, fournissent le contexte et precisent le format',
                'Ils utilisent tous le meme vocabulaire',
                'Ils demandent toujours un tableau en sortie',
              ],
              correctIndex: 1,
              explanation: 'Tous les templates efficaces partagent : un role expert, un contexte metier precis, un format de sortie attendu et des contraintes specifiques au domaine.',
            },
            {
              question: 'Pour un e-commercant, pourquoi mentionner le "persona" cible dans le prompt ?',
              options: [
                'Pour que l\'IA genere un avatar',
                'Pour adapter le ton, le vocabulaire et les arguments au public vise',
                'C\'est un terme technique sans utilite pratique',
                'Pour que l\'IA cree un profil fictif',
              ],
              correctIndex: 1,
              explanation: 'Le persona cible permet a l\'IA d\'adapter le ton (premium vs accessible), le vocabulaire (technique vs grand public) et les arguments de vente au public vise.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4BC}',
      badgeName: 'Prompt Pro',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Aller plus loin
    // -----------------------------------------------------------------------
    {
      id: 'pe-m6',
      title: 'Aller plus loin',
      emoji: '\u{1F680}',
      description: 'Extended Thinking, temperature et optimisation des tokens pour des usages experts.',
      duration: '18 min',
      lessons: [
        {
          id: 'pe-m6-l1',
          title: 'Extended Thinking et temperature',
          duration: '7 min',
          type: 'text',
          content: `Pour les utilisateurs avances, deux parametres permettent de pousser les capacites de l'IA encore plus loin : le mode Extended Thinking et la temperature.

Le mode Extended Thinking est une fonctionnalite exclusive du modele L3 Opus utilise par Freenzy. Quand il est active, le modele prend un temps de reflexion supplementaire avant de repondre. Concretement, il decompose le probleme en sous-etapes, evalue differentes approches, identifie les pieges potentiels et construit une reponse plus reflechie.

Ce mode est particulierement precieux pour les decisions strategiques ("Dois-je pivoter mon business model ?"), les analyses complexes ("Compare ces 5 options d'investissement"), les redactions longues et structurees ("Redige un business plan complet") et les taches de raisonnement multi-etapes. Le temps de reponse est plus long (15 a 60 secondes au lieu de 3 a 10), mais la qualite est significativement superieure.

Dans Freenzy, le mode Extended Thinking est active automatiquement pour les Deep Discussions et les analyses strategiques du niveau L3. Vous pouvez l'activer explicitement en prefixant votre message par "/think" ou en choisissant un assistant de niveau L3 (comme l'assistant DG).

La temperature est un parametre qui controle le degre de creativite et d'aleatoire dans les reponses. Une temperature basse (0.0 a 0.3) produit des reponses predictibles, factuelles et repetables — ideales pour les documents officiels, les analyses de donnees et les taches techniques. Une temperature elevee (0.7 a 1.0) genere des reponses plus variees, creatives et inattendues — parfaites pour le brainstorming, la redaction creative et l'exploration d'idees.

Dans Freenzy, la temperature est precalibree pour chaque assistant. L'assistant Juridique utilise une temperature basse pour la precision, l'assistant Marketing utilise une temperature plus elevee pour la creativite. Vous n'avez generalement pas besoin de la modifier manuellement, mais la comprendre vous aide a choisir le bon assistant pour chaque tache.

Le modele ideal pour chaque tache : Haiku (L1) pour les reponses rapides et executoires, Sonnet (L2) pour la redaction et l'analyse de qualite, Opus (L3) avec Extended Thinking pour la strategie et les decisions critiques. Choisir le bon niveau est un acte de prompt engineering en soi.`,
          xpReward: 30,
        },
        {
          id: 'pe-m6-l2',
          title: 'Optimisation des tokens',
          duration: '6 min',
          type: 'text',
          content: `Optimiser sa consommation de tokens est a la fois une question de qualite et d'economie. Un prompt bien optimise produit de meilleures reponses tout en consommant moins de credits. Voici les techniques cles.

Technique 1 — Soyez concis mais complet. Eliminez les mots superflus sans sacrifier le sens. "Je voudrais que tu puisses me donner s'il te plait une liste de" devient "Liste". Les formules de politesse n'ameliorent pas la reponse de l'IA. Soyez direct et precis.

Technique 2 — Limitez la longueur de la reponse. Ajoutez une contrainte de longueur : "en 100 mots maximum", "en 5 points", "en un paragraphe". Sans cette contrainte, l'IA a tendance a etre exhaustive, ce qui consomme plus de tokens et produit parfois un contenu dilue. Une reponse concise est souvent plus utile qu'un roman.

Technique 3 — Demandez le format minimal. Si vous avez besoin d'une liste de noms, demandez "uniquement les noms, sans explication". Si vous voulez un chiffre, demandez "reponds par le chiffre uniquement". Chaque mot dans la reponse coute des tokens.

Technique 4 — Reutilisez le contexte intelligemment. Si vous avez une longue conversation et que vous changez de sujet, commencez une nouvelle conversation plutot que de continuer dans le meme fil. L'historique consomme des tokens meme s'il n'est plus pertinent pour votre nouvelle question.

Technique 5 — Structurez en etapes. Pour une tache complexe, decoupez-la en sous-taches sequentielles. Au lieu de demander "Cree une strategie marketing complete", commencez par "Identifie 3 personas cibles", puis "Pour la persona 1, liste 5 canaux d'acquisition", etc. Chaque etape consomme moins de tokens et produit un resultat plus precis.

Impact concret : un utilisateur qui applique ces techniques consomme en moyenne 30 a 50% moins de credits pour des resultats equivalents ou superieurs. Sur un mois d'utilisation intensive, cela represente une economie significative.

Dernier conseil : le meilleur prompt est celui qui obtient le resultat souhaite du premier coup, sans necessite de reformulation. Investir 30 secondes de plus dans la redaction de votre prompt vous fait gagner des minutes de va-et-vient et des dizaines de tokens inutiles.`,
          xpReward: 25,
        },
        {
          id: 'pe-m6-l3',
          title: 'Quiz final : Prompt Engineering',
          duration: '5 min',
          type: 'quiz',
          content: 'Quiz final du parcours Prompt Engineering. Testez l\'ensemble de vos connaissances.',
          quizQuestions: [
            {
              question: 'Quand le mode Extended Thinking est-il le plus utile ?',
              options: [
                'Pour une question simple comme "Quelle heure est-il ?"',
                'Pour les decisions strategiques et les analyses complexes multi-etapes',
                'Pour generer un email de 3 lignes',
                'Pour corriger une faute d\'orthographe',
              ],
              correctIndex: 1,
              explanation: 'Le mode Extended Thinking est concu pour les taches complexes : decisions strategiques, analyses multi-etapes, business plans. Il prend plus de temps mais produit des reponses significativement meilleures.',
            },
            {
              question: 'Une temperature basse (0.0-0.3) produit des reponses qui sont :',
              options: [
                'Plus creatives et imprevisibles',
                'Plus factuelles, predictibles et repetables',
                'Plus longues',
                'Plus rapides a generer',
              ],
              correctIndex: 1,
              explanation: 'Une temperature basse favorise les reponses factuelles, predictibles et repetables, ideales pour les documents officiels et les analyses de donnees.',
            },
            {
              question: 'Quelle technique reduit la consommation de tokens de 30 a 50% ?',
              options: [
                'Ecrire les prompts en anglais',
                'Utiliser uniquement le modele Haiku',
                'Etre concis, limiter la longueur, structurer en etapes',
                'Poser une seule question par jour',
              ],
              correctIndex: 2,
              explanation: 'La combinaison de prompts concis, contraintes de longueur, format minimal et decoupage en etapes reduit la consommation de 30 a 50%.',
            },
            {
              question: 'Pourquoi commencer une nouvelle conversation quand on change de sujet ?',
              options: [
                'Pour organiser ses fichiers',
                'Parce que l\'historique non pertinent consomme des tokens inutilement',
                'Parce que l\'IA refuse de changer de sujet',
                'Pour obtenir un nouveau numero de conversation',
              ],
              correctIndex: 1,
              explanation: 'L\'historique de conversation consomme des tokens a chaque echange. Si le sujet change, cet historique n\'est plus pertinent mais continue a etre traite et facture.',
            },
            {
              question: 'Quel est le meilleur investissement en prompt engineering ?',
              options: [
                'Utiliser le modele le plus cher pour chaque tache',
                'Ecrire des prompts de 1000 mots',
                'Investir 30 secondes de plus dans un prompt precis pour eviter les reformulations',
                'Toujours demander la reponse la plus longue possible',
              ],
              correctIndex: 2,
              explanation: 'Un prompt bien redige du premier coup evite les reformulations, les va-et-vient et les tokens gaspilles. C\'est le meilleur retour sur investissement en prompt engineering.',
            },
          ],
          xpReward: 35,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F680}',
      badgeName: 'Prompt Master',
    },
  ],
  diplomaTitle: 'IA Practitioner',
  diplomaSubtitle: 'A valide la formation Prompt Engineering de Freenzy',
  totalDuration: '1h48',
  totalXP: 550,
  color: '#F59E0B',
  available: true,
};

// PARCOURS 3-5 + COMING SOON in formation-data-more.ts
