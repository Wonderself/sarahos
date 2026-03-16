// =============================================================================
// Freenzy.io — Formation Niv1: Analytics & Data + Film IA
// 2 parcours debutant, 6 modules x 3 lecons chacun, 600 XP chacun
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// PARCOURS 1 — Analytics & Data
// ---------------------------------------------------------------------------

export const parcoursAnalytics: FormationParcours = {
  id: 'analytics-data-niv1',
  title: 'Analytics & Data pour tous',
  emoji: '\u{1F4CA}',
  description: 'Apprenez a lire, comprendre et exploiter vos donnees pour prendre de meilleures decisions. Dashboards, rapports automatiques, analytics web/social, predictions et culture data-driven.',
  category: 'business',
  subcategory: 'analytics',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#2563EB',
  totalDuration: '3h',
  totalXP: 600,
  diplomaTitle: 'Data Explorer',
  diplomaSubtitle: 'Maitrise des fondamentaux de l\'analyse de donnees',
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Comprendre ses donnees
    // -----------------------------------------------------------------------
    {
      id: 'ad-m1',
      title: 'Comprendre ses donnees',
      emoji: '\u{1F50D}',
      description: 'Posez les bases : qu\'est-ce qu\'une donnee, ou la trouver et pourquoi elle compte.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m1-l1',
          title: 'Les donnees, c\'est quoi exactement ?',
          duration: '8 min',
          type: 'text',
          content: `Bienvenue dans votre premiere lecon analytics ! \u{1F389} Avant de plonger dans les graphiques et les tableaux de bord, il faut comprendre ce qu'on manipule : les donnees.

Une donnee, c'est tout simplement une information enregistree. Le nombre de visiteurs sur votre site hier ? C'est une donnee. Le montant de votre derniere facture ? Aussi. Le taux d'ouverture de votre newsletter ? Encore une donnee. Chaque interaction avec vos clients, chaque transaction, chaque clic genere des donnees.

On distingue generalement trois grandes familles. Les donnees quantitatives sont des chiffres : chiffre d'affaires, nombre de commandes, duree moyenne de visite. Elles se mesurent et se comparent facilement. Les donnees qualitatives decrivent des caracteristiques : avis clients, categories de produits, sources de trafic. Enfin, les donnees temporelles ajoutent la dimension du temps : evolution des ventes par mois, tendance du trafic sur 12 semaines.

Dans Freenzy, vos donnees proviennent de plusieurs sources. Le dashboard collecte automatiquement vos statistiques d'utilisation : credits consommes, assistants sollicites, documents generes. Si vous connectez vos outils externes (Google Analytics, reseaux sociaux, CRM), ces donnees s'ajoutent pour creer une vue d'ensemble.

Le point crucial a retenir : une donnee seule ne dit rien. C'est en la comparant, en la croisant avec d'autres et en la contextualisant qu'elle devient une information actionnable. "500 visiteurs" ne veut rien dire sans savoir si c'est en hausse ou en baisse, si ces visiteurs achetent ou repartent aussitot.

Dans les prochaines lecons, vous allez apprendre a transformer ces donnees brutes en decisions eclairees. C'est tout l'art de l'analytics ! \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'ad-m1-l2',
          title: 'Ou trouver ses donnees dans Freenzy',
          duration: '8 min',
          type: 'text',
          content: `Maintenant que vous savez ce qu'est une donnee, voyons ou les trouver concretement dans Freenzy \u{1F50E}

Le dashboard principal est votre premiere source. Des votre connexion, vous voyez un resume chiffre de votre activite : credits utilises cette semaine, nombre de conversations avec les assistants, documents generes. Ces indicateurs donnent le pouls de votre utilisation en un coup d'oeil.

La section Statistiques (accessible depuis la sidebar) va plus loin. Elle propose des graphiques d'evolution sur 7, 30 ou 90 jours. Vous y trouvez la repartition de vos credits par type d'action (conversation, generation d'image, creation de document), le nombre de taches completees par assistant, et votre courbe de productivite.

Les assistants eux-memes generent des donnees precieuses. Chaque conversation est archivee avec sa date, sa duree et le nombre de tokens consommes. L'assistant Analytics de Freenzy peut analyser ces historiques pour vous montrer vos patterns d'utilisation : a quelle heure etes-vous le plus productif ? Quel assistant utilisez-vous le plus ?

Pour les donnees externes, Freenzy propose des connecteurs. Google Analytics vous donne le trafic web. Les reseaux sociaux fournissent l'engagement de vos publications. Votre CRM apporte les donnees commerciales. L'objectif est de centraliser toutes ces sources dans un seul endroit.

Un conseil pratique : commencez par explorer les donnees deja presentes dans votre dashboard avant de connecter des sources externes. Vous serez surpris de la richesse d'informations deja disponible. \u{1F4A1} Dans la prochaine lecon, on teste vos connaissances avec un quiz !`,
          xpReward: 15,
        },
        {
          id: 'ad-m1-l3',
          title: 'Quiz : Les bases des donnees',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez que vous maitrisez les concepts fondamentaux des donnees.',
          quizQuestions: [
            {
              question: 'Quelle est la difference principale entre une donnee quantitative et qualitative ?',
              options: [
                'La quantitative est plus importante',
                'La quantitative est un chiffre, la qualitative decrit une caracteristique',
                'La qualitative est toujours textuelle',
                'Il n\'y a pas de difference',
              ],
              correctIndex: 1,
              explanation: 'Une donnee quantitative se mesure en chiffres (CA, nombre de visites) tandis qu\'une donnee qualitative decrit une caracteristique (categorie, avis, source).',
            },
            {
              question: 'Pourquoi une donnee seule "ne dit rien" ?',
              options: [
                'Parce qu\'elle est toujours fausse',
                'Parce qu\'il faut la comparer et la contextualiser pour qu\'elle devienne actionnable',
                'Parce qu\'elle est trop petite',
                'Parce qu\'il faut toujours un graphique',
              ],
              correctIndex: 1,
              explanation: '"500 visiteurs" ne signifie rien sans contexte : c\'est en comparant (vs semaine precedente) et en croisant (taux de conversion) qu\'on obtient une information utile.',
            },
            {
              question: 'Ou trouver un resume chiffre de votre activite dans Freenzy ?',
              options: [
                'Dans les parametres',
                'Sur le dashboard principal des la connexion',
                'Uniquement dans les rapports mensuels',
                'Dans la documentation',
              ],
              correctIndex: 1,
              explanation: 'Le dashboard principal affiche des votre connexion un resume chiffre : credits, conversations, documents generes.',
            },
            {
              question: 'Les donnees temporelles ajoutent quelle dimension ?',
              options: ['La couleur', 'Le volume', 'Le temps', 'La precision'],
              correctIndex: 2,
              explanation: 'Les donnees temporelles ajoutent la dimension du temps : evolution des ventes par mois, tendance du trafic sur 12 semaines, etc.',
            },
            {
              question: 'Quel est le meilleur conseil pour debuter en analytics dans Freenzy ?',
              options: [
                'Connecter immediatement toutes les sources externes',
                'Explorer d\'abord les donnees deja presentes dans le dashboard',
                'Attendre d\'avoir 1000 visiteurs',
                'Engager un data analyst',
              ],
              correctIndex: 1,
              explanation: 'Commencez par explorer les donnees deja disponibles dans votre dashboard avant de connecter des sources externes. La richesse est souvent deja la !',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Chercheur de donnees',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Creer des dashboards
    // -----------------------------------------------------------------------
    {
      id: 'ad-m2',
      title: 'Creer des dashboards efficaces',
      emoji: '\u{1F4CA}',
      description: 'Construisez des tableaux de bord clairs qui racontent une histoire avec vos donnees.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m2-l1',
          title: 'Les principes d\'un bon dashboard',
          duration: '8 min',
          type: 'text',
          content: `Un dashboard, c'est comme un cockpit d'avion \u{2708}\u{FE0F} : il doit afficher les bonnes informations au bon moment pour que le pilote (vous !) prenne les bonnes decisions.

Le premier principe est la hierarchie visuelle. Les indicateurs les plus importants doivent etre les plus visibles. Votre chiffre d'affaires du mois ? En grand, en haut. Le nombre de visiteurs uniques ? Juste en dessous. Les details sont accessibles mais ne polluent pas la vue principale. Un bon dashboard se lit en 5 secondes.

Le deuxieme principe est la coherence temporelle. Tous les chiffres affiches doivent couvrir la meme periode. Si votre CA est affiche sur 30 jours mais votre trafic sur 7 jours, la comparaison n'a aucun sens. Choisissez une periode de reference et tenez-vous-y.

Le troisieme principe est l'action. Chaque indicateur affiche doit repondre a la question : "et donc, je fais quoi ?" Si un chiffre ne debouche sur aucune decision possible, il n'a pas sa place sur le dashboard. Par exemple, afficher le nombre total de pages de votre site n'aide en rien. Afficher le taux de rebond de votre page d'accueil, oui, car vous pouvez agir dessus.

Dans Freenzy, l'assistant Analytics vous aide a construire des dashboards personnalises. Vous lui decrivez votre objectif ("je veux suivre la performance de mes ventes") et il vous propose une selection d'indicateurs pertinents avec la mise en forme adaptee.

Les types de visualisation les plus utiles : les KPI cards pour les chiffres cles (gros chiffre + tendance), les line charts pour les evolutions dans le temps, les bar charts pour les comparaisons entre categories, et les pie charts pour les repartitions (mais avec moderation, maximum 5 segments !).

Regle d'or : moins c'est plus. Un dashboard de 5 indicateurs bien choisis bat toujours un dashboard de 50 indicateurs illisibles. \u{2728}`,
          xpReward: 15,
        },
        {
          id: 'ad-m2-l2',
          title: 'Exercice : Votre premier dashboard',
          duration: '10 min',
          type: 'exercise',
          content: 'Concevez la structure de votre premier dashboard en identifiant vos indicateurs cles.',
          exercisePrompt: 'Imaginez que vous gerez une boutique en ligne. Listez les 5 indicateurs cles que vous placeriez sur votre dashboard principal. Pour chaque indicateur, precisez : le nom, le type de visualisation (KPI card, line chart, bar chart) et pourquoi il est important. Demandez a l\'assistant Analytics de Freenzy de valider votre selection.',
          xpReward: 25,
        },
        {
          id: 'ad-m2-l3',
          title: 'Quiz : Dashboards',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la creation de tableaux de bord.',
          quizQuestions: [
            {
              question: 'En combien de temps doit-on pouvoir lire un bon dashboard ?',
              options: ['1 minute', '5 secondes', '30 secondes', '10 minutes'],
              correctIndex: 1,
              explanation: 'Un bon dashboard se lit en 5 secondes grace a une hierarchie visuelle claire : les KPIs importants en grand, en haut.',
            },
            {
              question: 'Pourquoi la coherence temporelle est-elle importante ?',
              options: [
                'Pour que les couleurs soient harmonieuses',
                'Pour que tous les chiffres soient comparables sur la meme periode',
                'Pour que le dashboard se charge plus vite',
                'Pour respecter le RGPD',
              ],
              correctIndex: 1,
              explanation: 'Si le CA est sur 30 jours et le trafic sur 7 jours, la comparaison n\'a aucun sens. Tous les indicateurs doivent couvrir la meme periode.',
            },
            {
              question: 'Combien de segments maximum recommande-t-on dans un pie chart ?',
              options: ['2', '5', '10', '20'],
              correctIndex: 1,
              explanation: 'Au-dela de 5 segments, un pie chart devient illisible. Regroupez les petites categories dans "Autres" si necessaire.',
            },
            {
              question: 'Quel est le critere pour decider si un indicateur a sa place sur le dashboard ?',
              options: [
                'Il doit etre impressionnant',
                'Il doit deboucher sur une decision ou une action',
                'Il doit etre un pourcentage',
                'Il doit etre positif',
              ],
              correctIndex: 1,
              explanation: 'Chaque indicateur doit repondre a "et donc je fais quoi ?". S\'il ne debouche sur aucune action, il n\'a pas sa place sur le dashboard principal.',
            },
            {
              question: 'Un dashboard de 5 indicateurs bien choisis est-il meilleur qu\'un de 50 ?',
              options: [
                'Non, plus il y en a, mieux c\'est',
                'Oui, moins c\'est plus en analytics',
                'Ca depend du secteur',
                'Seulement pour les debutants',
              ],
              correctIndex: 1,
              explanation: 'Moins c\'est plus ! 5 indicateurs bien choisis et lisibles battent toujours 50 indicateurs qui noient l\'information.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 60,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Architecte de dashboards',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Rapports automatiques
    // -----------------------------------------------------------------------
    {
      id: 'ad-m3',
      title: 'Rapports automatiques',
      emoji: '\u{1F4DD}',
      description: 'Automatisez la generation de rapports pour gagner du temps chaque semaine.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m3-l1',
          title: 'Pourquoi automatiser ses rapports',
          duration: '8 min',
          type: 'text',
          content: `Combien d'heures passez-vous chaque semaine a compiler des chiffres dans un tableur, a copier-coller des captures d'ecran et a rediger un resume pour votre equipe ou vos clients ? \u{23F0} Si la reponse est "trop", cette lecon est faite pour vous.

Un rapport automatique, c'est un document qui se genere tout seul a intervalle regulier (quotidien, hebdomadaire, mensuel) en allant chercher les donnees la ou elles se trouvent. Plus de saisie manuelle, plus d'erreurs de copie, plus de retard dans l'envoi.

Les avantages sont considerables. D'abord, le gain de temps : un rapport qui prend 2 heures a compiler manuellement se genere en 30 secondes automatiquement. Ensuite, la fiabilite : un robot ne fait pas de faute de frappe, ne confond pas les colonnes et ne se trompe pas de formule. Enfin, la regularite : le rapport sort toujours a l'heure, meme si vous etes en vacances ou en reunion.

Dans Freenzy, l'assistant Analytics peut creer des rapports automatiques a partir de vos donnees. Vous definissez une fois la structure (quels indicateurs, quelle periode, quel format) et le systeme s'occupe du reste. Le rapport peut etre envoye par email, stocke dans vos documents ou publie sur un canal de communication.

Les formats disponibles incluent le rapport synthetique (1 page, chiffres cles + tendances), le rapport detaille (5-10 pages avec graphiques et analyses), et le rapport executif (3 bullet points pour les decideurs presses). Choisissez le format adapte a votre audience.

Un piege frequent : automatiser un mauvais rapport. Avant d'automatiser, assurez-vous que le contenu du rapport est pertinent et que quelqu'un le lit vraiment. Automatiser un rapport que personne ne consulte, c'est du gaspillage elegant. \u{1F609}`,
          xpReward: 15,
        },
        {
          id: 'ad-m3-l2',
          title: 'Configurer un rapport hebdomadaire',
          duration: '8 min',
          type: 'text',
          content: `Passons a la pratique : voici comment configurer un rapport hebdomadaire automatique dans Freenzy \u{1F6E0}\u{FE0F}

Etape 1 : definir l'objectif. Posez-vous la question : "Qui va lire ce rapport et quelle decision doit-il prendre ?" Un rapport pour votre equipe marketing n'aura pas le meme contenu qu'un rapport pour votre directeur financier. L'objectif determine tout le reste.

Etape 2 : choisir les indicateurs. Selectionnez 5 a 10 metriques maximum. Pour un rapport marketing typique : trafic web total, sources de trafic (organique, social, paid), taux de conversion, cout par acquisition, et engagement sur les reseaux sociaux. Chaque metrique doit inclure la valeur actuelle ET la comparaison avec la periode precedente.

Etape 3 : definir la structure. Un bon rapport hebdomadaire suit ce schema : un resume executif de 3 lignes en haut, les KPIs principaux avec fleches de tendance, un graphique d'evolution sur les 4 dernieres semaines, les faits marquants de la semaine (anomalies, pics, creux), et 2-3 recommandations d'actions.

Etape 4 : choisir la frequence et les destinataires. Tous les lundis a 8h pour que l'equipe commence la semaine avec les chiffres frais. Ajoutez les emails des destinataires et choisissez le format (PDF, email inline, ou lien vers le dashboard).

Etape 5 : tester et ajuster. Generez un premier rapport manuellement, relisez-le et demandez un feedback a vos destinataires. Ajustez les indicateurs ou la mise en forme si necessaire avant de lancer l'automatisation.

L'assistant Analytics de Freenzy vous guide a chaque etape. Decrivez-lui votre besoin en langage naturel et il vous propose une configuration optimale. Vous pouvez ensuite affiner les details. \u{1F4E9}`,
          xpReward: 15,
        },
        {
          id: 'ad-m3-l3',
          title: 'Quiz : Rapports automatiques',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur l\'automatisation des rapports.',
          quizQuestions: [
            {
              question: 'Quel est le principal avantage d\'un rapport automatique ?',
              options: [
                'Il est plus joli',
                'Gain de temps, fiabilite et regularite',
                'Il coute moins cher',
                'Il est plus long',
              ],
              correctIndex: 1,
              explanation: 'Les 3 avantages cles : gain de temps (2h -> 30s), fiabilite (zero erreur de copie) et regularite (envoi a l\'heure meme en vacances).',
            },
            {
              question: 'Combien d\'indicateurs maximum recommande-t-on dans un rapport hebdo ?',
              options: ['3', '5 a 10', '20 a 30', 'Le plus possible'],
              correctIndex: 1,
              explanation: '5 a 10 metriques maximum pour un rapport hebdomadaire lisible et actionnable.',
            },
            {
              question: 'Quel piege faut-il eviter avant d\'automatiser un rapport ?',
              options: [
                'Utiliser des graphiques',
                'Automatiser un rapport que personne ne lit',
                'Envoyer le rapport par email',
                'Inclure des comparaisons',
              ],
              correctIndex: 1,
              explanation: 'Avant d\'automatiser, verifiez que le rapport est pertinent et lu. Automatiser un rapport inutile = gaspillage elegant.',
            },
            {
              question: 'Quelle est la premiere etape pour configurer un rapport ?',
              options: [
                'Choisir les couleurs',
                'Definir l\'objectif et l\'audience',
                'Installer un plugin',
                'Creer un tableur',
              ],
              correctIndex: 1,
              explanation: 'L\'objectif et l\'audience determinent tout le reste : indicateurs, format, frequence et niveau de detail.',
            },
            {
              question: 'Un rapport executif contient typiquement combien d\'elements ?',
              options: ['3 bullet points', '10 pages', '50 graphiques', '1 seul chiffre'],
              correctIndex: 0,
              explanation: 'Le format executif est ultra-synthetique : 3 bullet points pour les decideurs presses qui n\'ont pas le temps de lire un rapport detaille.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Automatiseur',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Analytics web & social
    // -----------------------------------------------------------------------
    {
      id: 'ad-m4',
      title: 'Analytics web & social',
      emoji: '\u{1F310}',
      description: 'Mesurez votre presence en ligne : trafic web, engagement social et conversions.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m4-l1',
          title: 'Comprendre le trafic web',
          duration: '8 min',
          type: 'text',
          content: `Votre site web est votre vitrine numerique. Comprendre qui le visite, d'ou viennent les visiteurs et ce qu'ils y font est fondamental pour toute strategie digitale. \u{1F310}

Les metriques de base du trafic web sont au nombre de quatre. Les visiteurs uniques representent le nombre de personnes differentes qui visitent votre site sur une periode donnee. Les sessions comptent le nombre total de visites (une meme personne peut generer plusieurs sessions). Les pages vues mesurent combien de pages ont ete consultees au total. Et la duree moyenne de session indique combien de temps les visiteurs restent.

Les sources de trafic revelent comment les gens arrivent chez vous. Le trafic organique vient des moteurs de recherche (Google, Bing) — c'est gratuit et souvent le plus qualifie. Le trafic direct correspond aux personnes qui tapent directement votre URL. Le trafic referral vient de liens sur d'autres sites. Le trafic social provient des reseaux sociaux. Et le trafic paid vient de vos campagnes publicitaires.

Le taux de rebond est un indicateur crucial : il mesure le pourcentage de visiteurs qui quittent votre site apres avoir vu une seule page. Un taux de rebond eleve (au-dessus de 70%) sur une page d'accueil signale un probleme : contenu non pertinent, chargement trop lent, ou design peu engageant.

Le taux de conversion est le graal de l'analytics web. Il mesure le pourcentage de visiteurs qui accomplissent l'action souhaitee : achat, inscription, demande de devis, telechargement. Un site avec 10 000 visiteurs et 0.5% de conversion genere 50 conversions. Ameliorer ce taux de 0.5% a 1% double vos resultats sans augmenter le trafic.

L'assistant Analytics de Freenzy peut analyser ces metriques et vous donner des recommandations concretes pour ameliorer chaque indicateur. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'ad-m4-l2',
          title: 'Mesurer l\'engagement social',
          duration: '8 min',
          type: 'text',
          content: `Les reseaux sociaux sont devenus incontournables, mais comment savoir si vos efforts portent leurs fruits ? C'est la que les analytics social entrent en jeu. \u{1F4F1}

L'engagement est la metrique reine sur les reseaux sociaux. Il mesure les interactions avec votre contenu : likes, commentaires, partages, clics, sauvegardes. Un post avec beaucoup d'impressions mais peu d'engagement est un post que les gens voient mais qui ne les interesse pas. A l'inverse, un post avec peu d'impressions mais beaucoup d'engagement touche la bonne audience.

Le taux d'engagement se calcule simplement : (nombre total d'interactions / nombre d'impressions) x 100. Un bon taux varie selon la plateforme : sur Instagram, 3-6% est excellent. Sur LinkedIn, 2-4% est tres bon. Sur Twitter/X, 1-3% est au-dessus de la moyenne. Ces benchmarks vous aident a evaluer votre performance.

La portee (reach) mesure combien de personnes uniques ont vu votre contenu. Les impressions comptent le nombre total de fois ou votre contenu a ete affiche (une meme personne peut voir un post plusieurs fois). La portee est generalement plus pertinente car elle represente de vraies personnes atteintes.

Les metriques de croissance comptent aussi : evolution du nombre d'abonnes, taux de croissance mensuel, et surtout la qualite des abonnes. 1000 abonnes engages valent mieux que 10 000 abonnes fantomes.

Pour une analyse efficace, suivez la regle des 3 C. Le Contenu : quel type de post performe le mieux (photo, video, carrousel, texte) ? Le Calendrier : quels jours et heures generent le plus d'engagement ? La Communaute : qui sont vos abonnes les plus actifs et que commentent-ils ?

Freenzy peut aggreager les statistiques de tous vos reseaux en un seul dashboard pour une vue globale. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'ad-m4-l3',
          title: 'Quiz : Web & Social analytics',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances en analytics web et reseaux sociaux.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que le taux de rebond mesure ?',
              options: [
                'Le pourcentage de pages avec des erreurs',
                'Le pourcentage de visiteurs qui quittent apres une seule page',
                'La vitesse de chargement du site',
                'Le nombre de clics sur les boutons',
              ],
              correctIndex: 1,
              explanation: 'Le taux de rebond mesure le % de visiteurs qui quittent votre site apres avoir vu une seule page. Au-dessus de 70% sur une page d\'accueil, c\'est un signal d\'alarme.',
            },
            {
              question: 'Quel trafic est generalement le plus qualifie ?',
              options: ['Le trafic direct', 'Le trafic organique (SEO)', 'Le trafic social', 'Le trafic paid'],
              correctIndex: 1,
              explanation: 'Le trafic organique (moteurs de recherche) est souvent le plus qualifie car les visiteurs cherchent activement une reponse a leur besoin.',
            },
            {
              question: 'Quel est un bon taux d\'engagement sur Instagram ?',
              options: ['0.1-0.5%', '3-6%', '15-20%', '50%+'],
              correctIndex: 1,
              explanation: 'Sur Instagram, un taux d\'engagement de 3-6% est considere comme excellent. Les benchmarks varient selon la plateforme.',
            },
            {
              question: 'Quelle est la difference entre portee et impressions ?',
              options: [
                'C\'est la meme chose',
                'La portee = personnes uniques, les impressions = nombre total d\'affichages',
                'La portee est toujours superieure',
                'Les impressions ne comptent que les clics',
              ],
              correctIndex: 1,
              explanation: 'La portee compte les personnes uniques atteintes. Les impressions comptent le nombre total d\'affichages (une personne peut voir un post plusieurs fois).',
            },
            {
              question: 'Que signifie la regle des 3 C en analytics social ?',
              options: [
                'Cout, Conversion, Client',
                'Contenu, Calendrier, Communaute',
                'Clic, Commentaire, Conversion',
                'Creation, Curation, Communication',
              ],
              correctIndex: 1,
              explanation: 'Les 3 C : Contenu (quel type performe), Calendrier (quand publier), Communaute (qui sont vos abonnes actifs).',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F310}',
      badgeName: 'Analyste digital',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Predictions & tendances
    // -----------------------------------------------------------------------
    {
      id: 'ad-m5',
      title: 'Predictions & tendances',
      emoji: '\u{1F52E}',
      description: 'Utilisez vos donnees historiques pour anticiper l\'avenir et reperer les tendances.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m5-l1',
          title: 'L\'analytics predictive pour les non-techniciens',
          duration: '8 min',
          type: 'text',
          content: `L'analytics predictive, ca sonne complique, mais le concept est simple : utiliser le passe pour deviner l'avenir. \u{1F52E} Et bonne nouvelle, avec l'IA vous n'avez pas besoin d'etre data scientist pour en profiter.

L'idee de base repose sur les patterns. Si votre boutique en ligne vend 30% de plus chaque decembre depuis 3 ans, il y a de fortes chances que le prochain decembre suive la meme tendance. L'analytics predictive detecte automatiquement ces schemas recurrents dans vos donnees et projette la tendance dans le futur.

Il existe trois niveaux de prediction. Le premier est la tendance simple : vos ventes augmentent de 5% par mois ? On peut estimer le chiffre du mois prochain. Le deuxieme est la saisonnalite : votre activite suit des cycles (ete/hiver, debut/fin de mois, jours de semaine) ? Le modele en tient compte. Le troisieme est la regression multivariable : plusieurs facteurs influencent vos resultats (budget pub, meteo, actualite) ? L'IA croise toutes ces variables.

Dans Freenzy, l'assistant Analytics integre des capacites predictives accessibles en langage naturel. Vous pouvez lui demander : "Quel sera mon CA du mois prochain si je maintiens mes depenses publicitaires actuelles ?" ou "Quand vais-je atteindre les 1000 clients a ce rythme de croissance ?" Il analyse vos donnees historiques et vous donne une estimation avec un intervalle de confiance.

Un point crucial : une prediction n'est pas une certitude. C'est une estimation basee sur l'hypothese que les conditions passees se maintiennent. Un evenement imprevu (crise economique, buzz viral, panne technique) peut tout changer. Utilisez les predictions comme guide, pas comme verite absolue.

Les alertes predictives sont particulierement utiles : Freenzy peut vous prevenir si une metrique risque de chuter sous un seuil critique avant que ca n'arrive. \u{26A0}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'ad-m5-l2',
          title: 'Reperer les tendances dans ses donnees',
          duration: '8 min',
          type: 'text',
          content: `Detecter une tendance avant les autres, c'est un super-pouvoir en business. Voici comment entrainer votre oeil analytique. \u{1F440}

Une tendance est un mouvement directionnel qui se maintient dans le temps. Attention a ne pas confondre tendance et fluctuation. Si vos ventes augmentent un jour et baissent le lendemain, c'est du bruit normal. Si elles augmentent progressivement depuis 3 semaines, c'est une tendance.

La regle du "3 points" est votre meilleure amie : pour confirmer une tendance, il faut au minimum 3 points de donnees consecutifs dans la meme direction. Deux jours de hausse peuvent etre un hasard. Trois semaines de hausse, c'est probablement une tendance reelle.

Les moyennes mobiles lissent le bruit pour reveler la tendance sous-jacente. Plutot que de regarder les chiffres jour par jour (trop volatils), regardez la moyenne des 7 derniers jours. Si cette moyenne augmente regulierement, la tendance est haussiere meme si certains jours individuels sont en baisse.

Les anomalies meritent aussi votre attention. Un pic soudain de trafic un mardi sans raison apparente peut signaler un article viral, une mention sur un media ou un concurrent qui ferme. Investiguez toujours les anomalies : elles cachent souvent des opportunites ou des problemes.

Les comparaisons periode-sur-periode sont essentielles. Comparez cette semaine a la semaine derniere, ce mois au meme mois de l'annee precedente. Cela neutralise les effets saisonniers et revele la vraie croissance.

Freenzy peut automatiquement detecter les tendances et anomalies dans vos donnees et vous alerter. C'est comme avoir un analyste qui surveille vos metriques 24h/24. \u{1F4C8}`,
          xpReward: 15,
        },
        {
          id: 'ad-m5-l3',
          title: 'Quiz : Predictions & tendances',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez votre comprehension de l\'analytics predictive et de la detection de tendances.',
          quizQuestions: [
            {
              question: 'Combien de points de donnees minimum faut-il pour confirmer une tendance ?',
              options: ['1', '2', '3', '10'],
              correctIndex: 2,
              explanation: 'La regle du "3 points" : il faut au minimum 3 points consecutifs dans la meme direction pour confirmer une tendance.',
            },
            {
              question: 'Que fait une moyenne mobile ?',
              options: [
                'Elle calcule la moyenne de toutes les donnees',
                'Elle lisse le bruit pour reveler la tendance sous-jacente',
                'Elle predit le futur',
                'Elle supprime les donnees anciennes',
              ],
              correctIndex: 1,
              explanation: 'La moyenne mobile (ex: sur 7 jours) lisse les fluctuations quotidiennes pour reveler la direction generale de la tendance.',
            },
            {
              question: 'Pourquoi une prediction n\'est-elle pas une certitude ?',
              options: [
                'Parce que les ordinateurs font des erreurs',
                'Parce qu\'elle suppose que les conditions passees se maintiennent',
                'Parce qu\'elle est gratuite',
                'Parce qu\'elle n\'utilise pas assez de donnees',
              ],
              correctIndex: 1,
              explanation: 'Une prediction est basee sur l\'hypothese que les conditions passees se maintiennent. Un evenement imprevu peut tout changer.',
            },
            {
              question: 'Pourquoi comparer ce mois au meme mois de l\'annee derniere ?',
              options: [
                'Par nostalgie',
                'Pour neutraliser les effets saisonniers',
                'Parce que c\'est obligatoire',
                'Pour impressionner son boss',
              ],
              correctIndex: 1,
              explanation: 'La comparaison annee-sur-annee neutralise la saisonnalite (Noel, ete, rentree) et revele la vraie croissance.',
            },
            {
              question: 'Que faut-il faire quand on detecte une anomalie dans ses donnees ?',
              options: [
                'L\'ignorer, c\'est du bruit',
                'L\'investiguer car elle cache souvent une opportunite ou un probleme',
                'Supprimer la donnee',
                'Attendre qu\'elle se reproduise 10 fois',
              ],
              correctIndex: 1,
              explanation: 'Les anomalies cachent souvent des opportunites (article viral, mention media) ou des problemes (panne, bug). Investiguez toujours !',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F52E}',
      badgeName: 'Futuriste data',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Decisions data-driven
    // -----------------------------------------------------------------------
    {
      id: 'ad-m6',
      title: 'Decisions data-driven',
      emoji: '\u{1F3AF}',
      description: 'Transformez vos analyses en actions concretes et cultivez une culture de la donnee.',
      duration: '30 min',
      lessons: [
        {
          id: 'ad-m6-l1',
          title: 'De l\'analyse a l\'action',
          duration: '8 min',
          type: 'text',
          content: `Avoir de belles donnees et de jolis graphiques, c'est bien. Prendre de meilleures decisions grace a eux, c'est le but. \u{1F3AF} Bienvenue dans la lecon la plus importante de ce parcours.

Une decision data-driven suit un processus en 4 etapes. D'abord, observer : que disent les chiffres ? Mon taux de conversion a baisse de 15% cette semaine. Ensuite, comprendre : pourquoi ? En croisant les donnees, on decouvre que la baisse coincide avec un changement de design sur la page de paiement. Puis, decider : on revient a l'ancien design ou on optimise le nouveau ? Enfin, mesurer : apres l'action, les chiffres s'ameliorent-ils ?

Ce cycle Observation-Comprehension-Decision-Mesure est la colonne vertebrale de toute approche data-driven. Il remplace les decisions basees sur l'intuition ("je pense que...") par des decisions basees sur des faits ("les donnees montrent que...").

Attention au piege du "data-only". Les donnees eclairent la decision mais ne la remplacent pas. Parfois, votre experience metier, votre connaissance du marche ou votre intuition entrepreneuriale apportent un contexte que les chiffres seuls ne capturent pas. Le meilleur decideur combine donnees ET expertise.

Les A/B tests sont l'outil roi de la decision data-driven. Plutot que de debattre pendant des heures sur la couleur d'un bouton, testez les deux versions simultanement et laissez les donnees trancher. Freenzy peut vous aider a concevoir et analyser des tests simples.

Pour ancrer la culture data dans votre quotidien, commencez chaque journee par 5 minutes de lecture de vos KPIs. Avant chaque decision importante, demandez-vous : "Qu'est-ce que les donnees disent a ce sujet ?" Et apres chaque action, mesurez son impact. En quelques semaines, ce reflexe devient naturel. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'ad-m6-l2',
          title: 'Exercice : Votre premiere decision data-driven',
          duration: '10 min',
          type: 'exercise',
          content: 'Appliquez le cycle Observation-Comprehension-Decision-Mesure a un cas concret.',
          exercisePrompt: 'Scenario : votre newsletter a un taux d\'ouverture de 12% (la moyenne du secteur est 22%). Appliquez le cycle OCDM. 1) Observation : reformulez le probleme avec des chiffres. 2) Comprehension : listez 3 causes possibles. 3) Decision : proposez 2 actions concretes a tester. 4) Mesure : definissez comment vous saurez si ca a marche. Demandez a l\'assistant Analytics de valider votre raisonnement.',
          xpReward: 25,
        },
        {
          id: 'ad-m6-l3',
          title: 'Quiz final : Culture data-driven',
          duration: '5 min',
          type: 'quiz',
          content: 'Derniere etape : prouvez que vous etes pret a prendre des decisions basees sur les donnees.',
          quizQuestions: [
            {
              question: 'Quelles sont les 4 etapes du cycle de decision data-driven ?',
              options: [
                'Planifier, Faire, Verifier, Agir',
                'Observer, Comprendre, Decider, Mesurer',
                'Collecter, Stocker, Analyser, Publier',
                'Definir, Developper, Tester, Deployer',
              ],
              correctIndex: 1,
              explanation: 'Le cycle OCDM : Observer (que disent les chiffres), Comprendre (pourquoi), Decider (quelle action), Mesurer (quel impact).',
            },
            {
              question: 'Qu\'est-ce qu\'un A/B test ?',
              options: [
                'Un test de niveau A ou B',
                'Tester deux versions simultanement et laisser les donnees trancher',
                'Un test automatique qui dure 2 jours',
                'Un examen de certification analytics',
              ],
              correctIndex: 1,
              explanation: 'Un A/B test compare deux versions (A et B) d\'un element aupres de deux groupes d\'utilisateurs pour determiner laquelle performe le mieux.',
            },
            {
              question: 'Les donnees doivent-elles toujours remplacer l\'intuition ?',
              options: [
                'Oui, toujours',
                'Non, le meilleur decideur combine donnees ET expertise metier',
                'Non, l\'intuition est toujours superieure',
                'Seulement pour les grandes entreprises',
              ],
              correctIndex: 1,
              explanation: 'Le piege du "data-only" : les donnees eclairent mais ne remplacent pas l\'expertise. Le meilleur decideur combine les deux.',
            },
            {
              question: 'Comment ancrer la culture data au quotidien ?',
              options: [
                'Engager un data analyst',
                'Commencer chaque journee par 5 min de lecture des KPIs',
                'Acheter un logiciel couteux',
                'Faire un rapport mensuel',
              ],
              correctIndex: 1,
              explanation: '5 minutes de KPIs chaque matin, la question "que disent les donnees ?" avant chaque decision, et mesurer l\'impact apres chaque action.',
            },
            {
              question: 'Votre taux de conversion baisse de 15% apres un changement de design. Que faites-vous ?',
              options: [
                'Paniquer et tout changer',
                'Ignorer, ca reviendra tout seul',
                'Analyser la cause, decider d\'une action et mesurer le resultat',
                'Blamer l\'equipe design',
              ],
              correctIndex: 2,
              explanation: 'Appliquez le cycle OCDM : observer la baisse, comprendre la cause (changement design), decider (revenir ou optimiser), mesurer l\'impact.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 60,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Decideur eclaire',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 2 — Film & Video IA
// ---------------------------------------------------------------------------

export const parcoursFilmIA: FormationParcours = {
  id: 'film-ia-niv1',
  title: 'Creer des films avec l\'IA',
  emoji: '\u{1F3AC}',
  description: 'De l\'idee au film publie : apprenez a ecrire un scenario, creer un storyboard, generer des personnages, produire des videos, ajouter des voix off et monter le tout avec les outils IA.',
  category: 'contenu',
  subcategory: 'video',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#7C3AED',
  totalDuration: '3h',
  totalXP: 600,
  diplomaTitle: 'AI Filmmaker',
  diplomaSubtitle: 'Creation de films et videos avec l\'intelligence artificielle',
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — De l'idee au scenario
    // -----------------------------------------------------------------------
    {
      id: 'fi-m1',
      title: 'De l\'idee au scenario',
      emoji: '\u{1F4DD}',
      description: 'Transformez une idee vague en scenario structure grace a l\'IA.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m1-l1',
          title: 'Trouver et developper une idee',
          duration: '8 min',
          type: 'text',
          content: `Tout film commence par une idee. Et la bonne nouvelle, c'est que l'IA est un formidable partenaire de brainstorming. \u{1F4A1}

Une bonne idee de film repond a trois criteres. Elle doit etre specifique : "un homme qui voyage" est trop vague, "un chef cuisinier qui decouvre que son restaurant est hante" est specifique et intrigant. Elle doit etre emotionnelle : quelle emotion voulez-vous que le spectateur ressente ? Peur, joie, surprise, inspiration ? L'emotion guide tout le reste. Et elle doit etre faisable avec vos moyens IA actuels : une conversation entre deux personnages est plus simple a produire qu'une bataille spatiale.

Pour generer des idees, utilisez l'assistant Communication de Freenzy comme partenaire creatif. Decrivez-lui un theme, une ambiance ou un message et demandez-lui 10 concepts de films courts. Il va vous proposer des angles auxquels vous n'auriez pas pense. Selectionnez les 2-3 qui vous parlent et demandez-lui de les developper.

La technique du "What if" est redoutablement efficace. "Et si les animaux de compagnie pouvaient envoyer des emails ?" "Et si un stagiaire devenait PDG pendant une journee ?" "Et si votre IA d'entreprise tombait amoureuse du chatbot concurrent ?" Ces questions declenchent des scenarios originaux.

Pour structurer votre idee, utilisez le format logline : une phrase qui resume tout le film. Exemple : "Un freelance deborde decouvre que son assistant IA a secrement gere ses clients pendant 3 mois — et ils n'ont jamais ete aussi satisfaits." Si votre logline est claire et intrigante, votre idee tient la route.

Conservez un carnet d'idees (physique ou numerique). Les meilleures idees arrivent souvent au mauvais moment — sous la douche, dans le metro, a 3h du matin. Notez tout, vous trierez plus tard. \u{270D}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'fi-m1-l2',
          title: 'Ecrire un scenario avec l\'IA',
          duration: '8 min',
          type: 'text',
          content: `Votre idee est la, votre logline est ecrite. Maintenant, transformons tout ca en scenario. L'IA va accelerer le processus, mais vous restez le realisateur. \u{1F3AC}

Un scenario de court-metrage (2-5 minutes) suit une structure en 3 actes. L'acte 1 (Setup) presente le personnage principal, son monde et le probleme qui se pose. Ca dure environ 20% du film. L'acte 2 (Confrontation) est le coeur de l'histoire : le personnage essaie de resoudre le probleme, rencontre des obstacles, echoue puis trouve une solution. C'est 60% du film. L'acte 3 (Resolution) conclut l'histoire avec un denouement satisfaisant — ou un twist ! Les 20% restants.

Pour ecrire avec l'IA, procedez par etapes. D'abord, donnez votre logline a l'assistant et demandez-lui de developper la structure en 3 actes avec les scenes principales. Relisez et ajustez : ajoutez vos idees, supprimez ce qui ne vous plait pas. Ensuite, demandez-lui d'ecrire les dialogues scene par scene. Precisez le ton souhaite : humoristique, dramatique, mysterieux, inspirant.

Le format scenario standard comprend : le numero de scene, l'indication INT. (interieur) ou EXT. (exterieur), le lieu, le moment (JOUR/NUIT), la description de l'action et les dialogues avec le nom du personnage en majuscules.

Conseil pro : lisez votre scenario a voix haute. Les dialogues qui sonnent faux a l'oral doivent etre recrits. L'IA peut vous proposer 5 versions d'une meme replique — choisissez celle qui sonne le plus naturel.

Un scenario de 3 minutes = environ 300-400 mots. Ne surchargez pas : en video, chaque seconde compte. Privilegiez le montrer au dire. \u{2728}`,
          xpReward: 15,
        },
        {
          id: 'fi-m1-l3',
          title: 'Quiz : Scenario & storytelling',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances en ecriture de scenario pour l\'IA.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'une logline ?',
              options: [
                'Le generique de fin',
                'Une phrase qui resume tout le film',
                'Le titre du scenario',
                'La premiere replique du personnage principal',
              ],
              correctIndex: 1,
              explanation: 'La logline est une phrase unique qui capture l\'essence du film : personnage + situation + enjeu. Elle valide que l\'idee tient la route.',
            },
            {
              question: 'Quelle proportion du film represente l\'acte 2 (Confrontation) ?',
              options: ['20%', '40%', '60%', '80%'],
              correctIndex: 2,
              explanation: 'L\'acte 2 (Confrontation) represente environ 60% du film. C\'est le coeur de l\'histoire ou le personnage affronte les obstacles.',
            },
            {
              question: 'Combien de mots pour un scenario de 3 minutes ?',
              options: ['50-100', '300-400', '1000-1500', '3000+'],
              correctIndex: 1,
              explanation: 'Un scenario de 3 minutes contient environ 300-400 mots. En video, chaque seconde compte — ne surchargez pas.',
            },
            {
              question: 'Comment verifier que vos dialogues sonnent bien ?',
              options: [
                'Compter les mots',
                'Les lire a voix haute',
                'Les traduire en anglais',
                'Verifier l\'orthographe',
              ],
              correctIndex: 1,
              explanation: 'Lire les dialogues a voix haute revele immediatement les repliques qui sonnent faux. L\'IA peut proposer plusieurs versions alternatives.',
            },
            {
              question: 'Quelle est la meilleure approche pour ecrire un scenario avec l\'IA ?',
              options: [
                'Lui demander le scenario complet en une seule fois',
                'Proceder par etapes : structure, puis scenes, puis dialogues',
                'Copier un scenario existant et le modifier',
                'Laisser l\'IA decider de tout',
              ],
              correctIndex: 1,
              explanation: 'Procedez par etapes : d\'abord la structure en 3 actes, puis les scenes principales, puis les dialogues. Vous gardez le controle a chaque etape.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Scenariste IA',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Storyboard IA
    // -----------------------------------------------------------------------
    {
      id: 'fi-m2',
      title: 'Storyboard avec l\'IA',
      emoji: '\u{1F5BC}\u{FE0F}',
      description: 'Creez un storyboard visuel pour planifier chaque plan de votre film.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m2-l1',
          title: 'Qu\'est-ce qu\'un storyboard et pourquoi c\'est essentiel',
          duration: '8 min',
          type: 'text',
          content: `Le storyboard est le plan de bataille visuel de votre film. C'est une serie d'images (comme une BD) qui montre chaque plan du film avant de le produire. Hitchcock disait que son film etait "termine" une fois le storyboard acheve — le tournage n'etait que de l'execution. \u{1F3A8}

Pourquoi c'est essentiel ? D'abord, ca vous fait gagner un temps enorme en production. Chaque image generee par l'IA coute des credits et du temps. Si vous savez exactement ce que vous voulez avant de lancer la generation, vous evitez les essais-erreurs couteux. Ensuite, ca assure la coherence visuelle. Un film, c'est une succession de plans qui doivent avoir le meme style, les memes personnages, le meme eclairage. Le storyboard definit tout ca en amont.

Un storyboard contient pour chaque plan : un dessin ou image representant le cadrage, le type de plan (large, moyen, gros plan), la direction du regard ou du mouvement, une courte description de l'action, le dialogue eventuel, et des notes techniques (duree, transition, effet sonore).

Les types de plans principaux a connaitre : le plan large (establishing shot) montre le decor et situe la scene. Le plan moyen cadre le personnage de la taille aux genoux. Le gros plan se concentre sur le visage ou un detail important. Le plan de coupe montre un objet ou un detail pour ponctuer la narration.

Avec l'IA de Freenzy, vous pouvez generer les images du storyboard directement a partir de descriptions textuelles. Decrivez chaque plan et le Studio cree l'image correspondante. L'astuce est de rester coherent dans vos descriptions : meme style, meme personnage, meme ambiance lumineuse.

Un film de 3 minutes necessite environ 15-25 plans, donc 15-25 images de storyboard. Commencez par les plans cles (les moments forts) puis comblez les transitions. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'fi-m2-l2',
          title: 'Exercice : Creer un mini-storyboard',
          duration: '10 min',
          type: 'exercise',
          content: 'Creez un storyboard de 6 plans pour une scene simple en utilisant l\'IA.',
          exercisePrompt: 'Creez un storyboard de 6 plans pour la scene suivante : "Un freelance decouvre que son assistant IA a repondu a tous ses emails pendant son sommeil." Pour chaque plan, ecrivez : 1) Le type de plan (large, moyen, gros plan), 2) La description visuelle detaillee (personnage, decor, action), 3) Le dialogue eventuel, 4) La duree estimee. Utilisez le Studio Freenzy pour generer les images si vous le souhaitez.',
          xpReward: 25,
        },
        {
          id: 'fi-m2-l3',
          title: 'Quiz : Storyboard',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le storyboard et les plans cinematographiques.',
          quizQuestions: [
            {
              question: 'A quoi sert principalement un storyboard ?',
              options: [
                'A impressionner les investisseurs',
                'A planifier visuellement chaque plan avant la production',
                'A remplacer le scenario',
                'A dessiner les decors',
              ],
              correctIndex: 1,
              explanation: 'Le storyboard est le plan visuel du film : il montre chaque plan avant la production, ce qui fait gagner du temps et assure la coherence.',
            },
            {
              question: 'Quel type de plan montre le decor pour situer la scene ?',
              options: ['Le gros plan', 'Le plan moyen', 'Le plan large (establishing shot)', 'Le plan de coupe'],
              correctIndex: 2,
              explanation: 'Le plan large (establishing shot) montre le decor dans son ensemble pour situer la scene geographiquement.',
            },
            {
              question: 'Combien de plans environ pour un film de 3 minutes ?',
              options: ['5-8', '15-25', '50-100', '200+'],
              correctIndex: 1,
              explanation: 'Un film de 3 minutes necessite environ 15-25 plans, soit une moyenne de 7-12 secondes par plan.',
            },
            {
              question: 'Quelle est l\'astuce pour la coherence visuelle en generation IA ?',
              options: [
                'Utiliser des styles differents pour chaque plan',
                'Rester coherent dans les descriptions : meme style, personnage, ambiance',
                'Generer toutes les images en meme temps',
                'Ne pas utiliser de descriptions',
              ],
              correctIndex: 1,
              explanation: 'La coherence visuelle passe par des descriptions homogenes : meme style artistique, meme description du personnage, meme ambiance lumineuse a chaque plan.',
            },
            {
              question: 'Par quels plans commencer son storyboard ?',
              options: [
                'Le premier plan chronologiquement',
                'Les plans cles (moments forts) puis combler les transitions',
                'Les plans les plus faciles',
                'Le dernier plan',
              ],
              correctIndex: 1,
              explanation: 'Commencez par les plans cles (moments forts de l\'histoire) puis comblez les transitions entre ces moments.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 60,
      badgeEmoji: '\u{1F5BC}\u{FE0F}',
      badgeName: 'Storyboarder',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Avatars & personnages
    // -----------------------------------------------------------------------
    {
      id: 'fi-m3',
      title: 'Avatars & personnages IA',
      emoji: '\u{1F9D1}\u{200D}\u{1F3A8}',
      description: 'Creez des personnages coherents et des avatars expressifs pour vos videos.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m3-l1',
          title: 'Creer des personnages coherents',
          duration: '8 min',
          type: 'text',
          content: `Le defi numero un du film IA : obtenir un personnage qui se ressemble d'un plan a l'autre. Contrairement au cinema classique ou l'acteur est toujours le meme, l'IA regenere le personnage a chaque image. Voici comment maitriser ca. \u{1F3AD}

La fiche personnage est votre arme secrete. Avant de generer la moindre image, redigez une description ultra-precise de chaque personnage. Incluez : age, genre, morphologie, couleur de peau, coupe et couleur de cheveux, style vestimentaire, accessoires distinctifs (lunettes, cicatrice, tatouage, bijou), et expression par defaut. Plus la description est precise, plus l'IA produira des resultats coherents.

L'astuce du "seed prompt" consiste a creer un prompt de base que vous reutiliserez a chaque generation. Par exemple : "homme de 35 ans, cheveux noirs courts, barbe de 3 jours, chemise bleue a carreaux, lunettes rondes noires, expression serieuse." Ce prompt est copie au debut de chaque description de plan. L'IA s'appuie dessus comme reference.

Les accessoires distinctifs sont vos meilleurs allies pour la coherence. Un personnage avec un chapeau rouge vif, une echarpe jaune ou un tatouage visible sera plus facilement identifiable d'un plan a l'autre, meme si le visage varie legerement.

Pour les avatars parlants (talking heads), les services comme D-ID et HeyGen permettent d'animer une photo statique. Vous uploadez une image de reference de votre personnage et l'IA fait bouger les levres, les yeux et les expressions. Le resultat est un avatar video coherent puisqu'il part toujours de la meme image source.

Freenzy integre la generation d'avatars via le Studio. Generez d'abord une image de reference (portrait face, bonne qualite), puis utilisez-la comme base pour toutes les scenes avec ce personnage. Gardez cette image de reference precieusement — c'est l'identite visuelle de votre personnage. \u{2B50}`,
          xpReward: 15,
        },
        {
          id: 'fi-m3-l2',
          title: 'Types d\'avatars et cas d\'usage',
          duration: '8 min',
          type: 'text',
          content: `Il existe plusieurs types d'avatars IA, chacun adapte a un usage different. Voyons lesquels choisir selon votre projet. \u{1F4F9}

Les avatars photo-realistes imitent l'apparence humaine de maniere convaincante. Ils sont ideaux pour les videos corporate, les tutoriels, les presentations commerciales et les temoignages. L'avantage : ils inspirent confiance. L'inconvenient : ils peuvent tomber dans la "vallee de l'etrange" si l'animation n'est pas assez fluide.

Les avatars illustres ont un style cartoon, anime ou artistique. Parfaits pour les contenus educatifs, les explainer videos, les reseaux sociaux et les projets creatifs. L'avantage : le spectateur accepte plus facilement les imperfections car le style est assumement non-realiste. L'inconvenient : moins adaptes aux contextes formels.

Les avatars stylises combinent realisme et style artistique. Pensez aux personnages de Pixar ou aux illustrations haut de gamme. Ils conviennent a un large spectre de projets : branding, storytelling, publicite. C'est souvent le meilleur compromis.

Pour une video marketing de 60 secondes, un avatar photo-realiste en buste qui parle a la camera est le format le plus efficace. Le spectateur a l'impression d'un echange direct. Ajoutez des sous-titres et des elements graphiques pour renforcer le message.

Pour une histoire narrative (court-metrage, serie), privilegiez les avatars illustres ou stylises. Ils permettent plus de creativite dans les environnements et les actions, et la coherence visuelle est plus facile a maintenir.

Les multi-personnages ajoutent un defi : chaque personnage doit etre visuellement distinct. Variez les morphologies, les styles vestimentaires et les accessoires. Evitez deux personnages avec le meme type de cheveux et la meme silhouette — le spectateur doit les identifier instantanement. \u{1F3AC}`,
          xpReward: 15,
        },
        {
          id: 'fi-m3-l3',
          title: 'Quiz : Avatars & personnages',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la creation de personnages IA.',
          quizQuestions: [
            {
              question: 'Quelle est l\'astuce principale pour la coherence d\'un personnage IA ?',
              options: [
                'Generer 100 images et choisir les similaires',
                'Utiliser un "seed prompt" identique a chaque generation',
                'Toujours utiliser le meme logiciel',
                'Ne generer qu\'une seule image',
              ],
              correctIndex: 1,
              explanation: 'Le "seed prompt" est une description precise du personnage reutilisee a chaque generation. C\'est la cle de la coherence visuelle.',
            },
            {
              question: 'Pourquoi les accessoires distinctifs aident-ils a la coherence ?',
              options: [
                'Ils sont plus jolis',
                'Ils rendent le personnage identifiable meme si le visage varie legerement',
                'Ils coutent moins de credits',
                'L\'IA les genere mieux',
              ],
              correctIndex: 1,
              explanation: 'Un chapeau rouge, une echarpe jaune ou des lunettes distinctives rendent le personnage reconnaissable meme avec de legeres variations du visage.',
            },
            {
              question: 'Quel type d\'avatar convient le mieux a une video corporate ?',
              options: ['Illustre (cartoon)', 'Photo-realiste', 'Pixel art', 'Abstrait'],
              correctIndex: 1,
              explanation: 'Les avatars photo-realistes inspirent confiance et sont ideaux pour les contextes professionnels : videos corporate, tutoriels, presentations.',
            },
            {
              question: 'Comment fonctionne un service comme D-ID pour les avatars parlants ?',
              options: [
                'Il filme une personne reelle',
                'Il anime une photo statique (levres, yeux, expressions)',
                'Il cree un avatar 3D',
                'Il utilise la motion capture',
              ],
              correctIndex: 1,
              explanation: 'D-ID et HeyGen animent une photo statique de reference : ils font bouger les levres, les yeux et les expressions pour creer un avatar video.',
            },
            {
              question: 'Avec plusieurs personnages, que faut-il eviter ?',
              options: [
                'Les dialogues',
                'Deux personnages avec la meme silhouette et le meme style',
                'Les plans moyens',
                'Les scenes d\'interieur',
              ],
              correctIndex: 1,
              explanation: 'Chaque personnage doit etre visuellement distinct. Variez morphologies, vetements et accessoires pour que le spectateur les identifie instantanement.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F9D1}\u{200D}\u{1F3A8}',
      badgeName: 'Createur de personnages',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Generation video IA
    // -----------------------------------------------------------------------
    {
      id: 'fi-m4',
      title: 'Generation video IA',
      emoji: '\u{1F4F9}',
      description: 'Generez des sequences video avec les outils IA : Runway, LTX, D-ID et plus.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m4-l1',
          title: 'Les outils de generation video IA',
          duration: '8 min',
          type: 'text',
          content: `2026 est l'annee ou la generation video IA est devenue vraiment utilisable. Voyons les outils disponibles et comment les utiliser intelligemment. \u{1F680}

Runway ML est la reference pour la generation video a partir de texte ou d'image. Son modele Gen-3 Alpha produit des sequences de 5-10 secondes en qualite HD. Points forts : mouvements de camera realistes, bonne coherence visuelle, controle fin du mouvement. Limitation : les visages humains peuvent parfois etre instables sur les sequences longues.

LTX Video, integre dans Freenzy via fal.ai, est specialise dans les sequences courtes et rapides. Il excelle pour les plans de coupe, les transitions visuelles et les ambiances. Moins precis que Runway sur les personnages, il est plus rapide et economique pour les plans sans humains.

D-ID transforme une photo en video parlante. Vous uploadez un portrait, entrez le texte ou l'audio, et D-ID anime le visage. C'est l'outil ideal pour les scenes de dialogue ou les presentations. Combiné avec ElevenLabs pour la voix, le resultat est convaincant.

Pour un film complet, vous combinerez typiquement ces outils. Les plans larges de decors : LTX ou Runway. Les plans moyens avec personnages : Runway. Les gros plans avec dialogue : D-ID. Les plans de coupe et transitions : LTX. C'est comme un realisateur qui utilise differentes cameras.

Le workflow optimal suit cet ordre. D'abord, generez vos images de reference (personnages, decors) avec le generateur d'images. Ensuite, utilisez ces images comme point de depart pour la generation video (image-to-video). Enfin, ajoutez les animations de dialogue avec D-ID. Cette approche donne les meilleurs resultats car chaque etape s'appuie sur la precedente.

Conseil budget : generez d'abord en basse resolution pour valider le mouvement et le cadrage, puis regenerez en haute qualite uniquement les plans valides. Ca divise les couts par 3. \u{1F4B0}`,
          xpReward: 15,
        },
        {
          id: 'fi-m4-l2',
          title: 'Ecrire des prompts video efficaces',
          duration: '8 min',
          type: 'text',
          content: `La qualite de votre video IA depend directement de la qualite de votre prompt. Voici la methode pour ecrire des prompts qui donnent des resultats professionnels. \u{270D}\u{FE0F}

Un bon prompt video contient 5 elements dans cet ordre. Le sujet : qui ou quoi est dans le plan ? "Une femme de 30 ans en robe rouge." L'action : que se passe-t-il ? "Elle marche lentement dans un couloir sombre." L'environnement : ou est-on ? "Un long couloir d'hotel art deco avec moquette rouge." L'eclairage : quelle ambiance ? "Eclairage tamisé, lumiere chaude des appliques murales." Le mouvement de camera : comment filme-t-on ? "Camera tracking shot de face, leger mouvement vers l'arriere."

Les mouvements de camera a connaitre pour vos prompts : "static shot" (camera fixe), "pan left/right" (rotation horizontale), "tilt up/down" (rotation verticale), "zoom in/out" (rapprochement/eloignement), "tracking shot" (la camera suit le sujet), "drone shot" (vue aerienne), et "handheld" (camera a l'epaule, style documentaire).

Les erreurs frequentes a eviter. Le prompt trop long : au-dela de 100 mots, l'IA se perd et melange les elements. Restez concis et specifique. Le prompt contradictoire : "une scene joyeuse avec une ambiance sombre et inquietante" confondra l'IA. Le prompt trop abstrait : "une metaphore de la liberte" ne donne rien de bon — decrivez concretement ce que vous voulez voir a l'ecran.

La technique du "style reference" est puissante : ajoutez en fin de prompt une reference cinematographique. "Style Wes Anderson" evoque des cadrages symetriques et des couleurs pastel. "Style Blade Runner" evoque une ambiance neon et cyberpunk. L'IA connait ces references et adapte le rendu.

Gardez un document avec vos meilleurs prompts. Quand un prompt donne un excellent resultat, sauvegardez-le comme template. Vous pourrez le reutiliser et l'adapter pour des scenes similaires. \u{1F4BE}`,
          xpReward: 15,
        },
        {
          id: 'fi-m4-l3',
          title: 'Quiz : Generation video',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les outils et techniques de generation video IA.',
          quizQuestions: [
            {
              question: 'Quel outil est ideal pour les scenes de dialogue (talking head) ?',
              options: ['Runway ML', 'LTX Video', 'D-ID', 'Midjourney'],
              correctIndex: 2,
              explanation: 'D-ID anime une photo statique pour creer un personnage parlant. C\'est l\'outil ideal pour les dialogues et presentations.',
            },
            {
              question: 'Combien d\'elements contient un bon prompt video ?',
              options: ['2', '3', '5', '10'],
              correctIndex: 2,
              explanation: 'Un bon prompt video contient 5 elements : sujet, action, environnement, eclairage et mouvement de camera.',
            },
            {
              question: 'Quelle est la longueur maximale recommandee pour un prompt video ?',
              options: ['10 mots', '50 mots', '100 mots', '500 mots'],
              correctIndex: 2,
              explanation: 'Au-dela de 100 mots, l\'IA se perd et melange les elements. Restez concis et specifique.',
            },
            {
              question: 'Comment economiser sur les couts de generation video ?',
              options: [
                'Ne generer qu\'un seul plan',
                'Generer en basse resolution d\'abord, puis en HD les plans valides',
                'Utiliser uniquement du texte',
                'Generer tout en une seule fois',
              ],
              correctIndex: 1,
              explanation: 'Generez en basse resolution pour valider mouvement et cadrage, puis en haute qualite uniquement les plans valides. Ca divise les couts par 3.',
            },
            {
              question: 'Que signifie "tracking shot" dans un prompt video ?',
              options: [
                'La camera est fixe',
                'La camera fait un zoom',
                'La camera suit le sujet en mouvement',
                'La camera fait une rotation',
              ],
              correctIndex: 2,
              explanation: 'Le tracking shot est un mouvement ou la camera suit le sujet en deplacement. C\'est un mouvement dynamique et immersif.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4F9}',
      badgeName: 'Videaste IA',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Voix & narration
    // -----------------------------------------------------------------------
    {
      id: 'fi-m5',
      title: 'Voix off & narration IA',
      emoji: '\u{1F3A4}',
      description: 'Ajoutez des voix off professionnelles et des narrations grace au TTS IA.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m5-l1',
          title: 'Le text-to-speech professionnel',
          duration: '8 min',
          type: 'text',
          content: `La voix off est l'ame de votre film. Elle porte les emotions, guide le spectateur et donne vie aux personnages. Avec les outils TTS (text-to-speech) modernes, vous pouvez obtenir des voix quasi-humaines sans studio d'enregistrement. \u{1F3A4}

ElevenLabs est le leader du TTS IA en 2026. Son modele eleven_multilingual_v2 produit des voix naturelles en francais avec des emotions, des pauses et des intonations realistes. Freenzy l'utilise comme moteur vocal principal. Vous ecrivez le texte, choisissez une voix, et l'audio est genere en quelques secondes.

Le choix de la voix est crucial. Pour un narrateur omniscient, choisissez une voix posee, grave et rassurante. Pour un personnage jeune et dynamique, une voix plus aigue et rapide. Pour une ambiance mysterieuse, une voix basse et lente avec des pauses. Testez plusieurs voix avec un meme texte pour trouver celle qui colle le mieux a votre projet.

La preparation du texte fait toute la difference. Ecrivez votre texte comme il doit etre prononce, pas comme il doit etre lu. Ajoutez des indications de pause avec des virgules et des points. Utilisez les points de suspension pour les hesitations naturelles. Les points d'exclamation ajoutent de l'emphase. Les parentheses peuvent indiquer des apartés sur un ton plus bas.

Le rythme est essentiel en narration. Une voix off trop rapide perd le spectateur. Trop lente, elle l'ennuie. La regle : environ 150 mots par minute pour une narration confortable. Un texte de 450 mots = environ 3 minutes de voix off. Ajustez en fonction du rythme visuel de votre film.

Les emotions peuvent etre controlees avec des instructions specifiques dans ElevenLabs : "ton joyeux", "voix triste", "ton autoritaire". Vous pouvez aussi ajuster manuellement la stabilite et la clarte de la voix pour des resultats plus fins. \u{2728}`,
          xpReward: 15,
        },
        {
          id: 'fi-m5-l2',
          title: 'Synchroniser voix et video',
          duration: '8 min',
          type: 'text',
          content: `Avoir une belle voix et une belle video, c'est bien. Les synchroniser parfaitement, c'est ce qui fait la difference entre un film amateur et un film pro. \u{1F3AC}

La methode "voice-first" est la plus simple pour debuter. Enregistrez d'abord toute la voix off, puis montez les images dessus. L'avantage : le rythme du film est dicte par la narration, ce qui donne un resultat naturel. Chaque phrase correspond a un ou plusieurs plans visuels que vous choisissez apres.

La methode "video-first" est l'inverse : vous montez d'abord les images, puis adaptez la voix off a la duree de chaque sequence. Plus complexe mais necessaire quand le visuel est primordial (clips musicaux, demos produit, scenes d'action sans dialogue).

Pour les dialogues synchronises (lip-sync), D-ID fait le travail automatiquement : vous fournissez l'audio et l'image du personnage, et l'IA anime les levres en synchronisation. Le resultat est bluffant quand la photo de base est de bonne qualite (face, bouche visible, bonne resolution).

Les regles de timing a respecter. Laissez 0.5 seconde de silence au debut et a la fin de chaque clip audio — ca evite les coupes brutales. Les pauses entre les phrases doivent etre de 0.3 a 0.8 secondes selon l'intensite emotionnelle. Les transitions entre scenes meritent 1-2 secondes de silence pour laisser le spectateur absorber.

La musique de fond joue un role crucial. Elle ne doit jamais couvrir la voix off — reglez son volume a 15-20% du volume de la voix. Baissez-la pendant les dialogues et montez-la pendant les plans sans parole. Ce mixage fait toute la difference.

Freenzy peut generer des pistes audio completes : voix off + musique de fond + effets sonores, prets a etre combines avec votre video. \u{1F3B5}`,
          xpReward: 15,
        },
        {
          id: 'fi-m5-l3',
          title: 'Quiz : Voix & narration',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le TTS et la narration pour vos films IA.',
          quizQuestions: [
            {
              question: 'Combien de mots par minute pour une narration confortable ?',
              options: ['50', '100', '150', '250'],
              correctIndex: 2,
              explanation: 'Environ 150 mots par minute est le rythme ideal pour une narration confortable. Un texte de 450 mots = environ 3 minutes.',
            },
            {
              question: 'Quelle methode est recommandee pour les debutants ?',
              options: [
                'Video-first',
                'Voice-first (voix d\'abord, images ensuite)',
                'Tout en meme temps',
                'Sans voix',
              ],
              correctIndex: 1,
              explanation: 'La methode voice-first est plus simple : enregistrez la voix off, puis montez les images dessus. Le rythme est naturellement dicte par la narration.',
            },
            {
              question: 'A quel volume regler la musique de fond par rapport a la voix ?',
              options: ['50%', '80%', '15-20%', 'Meme volume'],
              correctIndex: 2,
              explanation: 'La musique de fond doit etre a 15-20% du volume de la voix pour ne pas la couvrir. Montez-la pendant les plans sans parole.',
            },
            {
              question: 'Combien de silence laisser au debut et a la fin de chaque clip audio ?',
              options: ['0 seconde', '0.5 seconde', '2 secondes', '5 secondes'],
              correctIndex: 1,
              explanation: 'Laissez 0.5 seconde de silence au debut et a la fin de chaque clip audio pour eviter les coupes brutales.',
            },
            {
              question: 'Quel outil synchronise automatiquement les levres avec l\'audio ?',
              options: ['ElevenLabs', 'Runway ML', 'D-ID', 'LTX Video'],
              correctIndex: 2,
              explanation: 'D-ID anime automatiquement les levres d\'une photo en synchronisation avec l\'audio fourni (lip-sync).',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F3A4}',
      badgeName: 'Voix de cinema',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Montage & publication
    // -----------------------------------------------------------------------
    {
      id: 'fi-m6',
      title: 'Montage & publication',
      emoji: '\u{1F3EC}',
      description: 'Montez vos sequences, ajoutez les finitions et publiez votre film au monde.',
      duration: '30 min',
      lessons: [
        {
          id: 'fi-m6-l1',
          title: 'Monter son film IA',
          duration: '8 min',
          type: 'text',
          content: `Le montage est l'etape ou votre film prend vie. Toutes les pieces du puzzle — video, voix, musique, effets — s'assemblent pour creer une experience fluide et captivante. \u{2702}\u{FE0F}

Le montage suit un principe simple : raconter l'histoire de la maniere la plus claire et la plus emotionnelle possible. Chaque coupe doit avoir une raison : changement de sujet, reaction d'un personnage, passage du temps, ou simplement maintenir l'attention du spectateur.

L'ordre de montage recommande est le suivant. D'abord, le montage brut (rough cut) : alignez tous vos plans dans l'ordre du scenario sans vous soucier des details. Visionnez l'ensemble pour verifier que l'histoire se comprend. Ensuite, le montage fin (fine cut) : ajustez la duree de chaque plan, synchronisez la voix, et affinez les transitions. Enfin, la post-production : ajoutez titres, sous-titres, effets visuels, correction colorimetrique et generique.

Les transitions entre plans sont cruciales. La coupe franche (cut) est la plus courante et la plus propre : on passe directement d'un plan a l'autre. Le fondu enchaine (dissolve) est plus doux et convient aux changements de scene ou aux ellipses temporelles. Le fondu au noir marque une fin de sequence ou un moment dramatique. Evitez les transitions fantaisistes (etoiles, spirales) sauf intention artistique assumee — elles font amateur.

Le rythme du montage depend du genre. Un thriller alterne plans courts (2-3 secondes) et plans longs pour creer de la tension. Une video explicative utilise des plans de 5-8 secondes pour laisser le temps de comprendre. Un clip publicitaire peut descendre a 1-2 secondes par plan pour l'energie et le dynamisme.

Pour le montage, des outils gratuits comme CapCut, DaVinci Resolve ou iMovie font parfaitement le travail. L'important n'est pas l'outil mais votre sens du rythme et de la narration. \u{1F3AC}`,
          xpReward: 15,
        },
        {
          id: 'fi-m6-l2',
          title: 'Publier et distribuer son film',
          duration: '8 min',
          type: 'text',
          content: `Votre film est monte, la musique est en place, les sous-titres sont incrustes. Il est temps de le partager avec le monde ! \u{1F30D} Mais publier au bon endroit, au bon format et au bon moment fait toute la difference.

Le format d'export depend de la plateforme cible. Pour YouTube : 1920x1080 (Full HD) ou 3840x2160 (4K), format MP4, codec H.264, 30 fps. Pour Instagram Reels et TikTok : 1080x1920 (vertical), meme codec, 30 fps. Pour LinkedIn : 1920x1080 (horizontal), duree max 10 minutes. Exportez toujours en qualite maximale — les plateformes recompresseront de toute facon.

Les sous-titres ne sont plus optionnels. 85% des videos sur les reseaux sociaux sont regardees sans le son. Si votre film n'a pas de sous-titres, vous perdez la majorite de votre audience. CapCut et Freenzy peuvent generer des sous-titres automatiquement a partir de votre voix off. Verifiez toujours les sous-titres generes — l'IA fait parfois des erreurs.

La miniature (thumbnail) est aussi importante que le film lui-meme. C'est elle qui decide si quelqu'un clique ou passe son chemin. Une bonne miniature contient un visage expressif, un texte court et percutant (3-5 mots max), et des couleurs contrastees. Generez-la avec le Studio Freenzy.

Le timing de publication compte. Sur YouTube, publiez entre 14h et 16h en semaine. Sur Instagram, entre 11h et 13h ou 19h et 21h. Sur LinkedIn, le mardi et jeudi matin entre 8h et 10h. Ces creneaux maximisent la visibilite initiale qui determine le succes algorithmique.

La description et les hashtags aident au referencement. Redigez une description de 2-3 lignes qui donne envie de regarder, ajoutez 5-10 hashtags pertinents, et incluez un appel a l'action ("Abonnez-vous pour plus de contenus IA !"). L'assistant Communication de Freenzy peut rediger tout ca pour vous.

Felicitations, vous etes officiellement un AI Filmmaker ! \u{1F389}\u{1F3AC}`,
          xpReward: 15,
        },
        {
          id: 'fi-m6-l3',
          title: 'Quiz final : Montage & publication',
          duration: '5 min',
          type: 'quiz',
          content: 'Derniere etape : validez vos connaissances en montage et publication.',
          quizQuestions: [
            {
              question: 'Quel est l\'ordre recommande pour le montage ?',
              options: [
                'Post-production, montage fin, montage brut',
                'Montage brut, montage fin, post-production',
                'Tout en meme temps',
                'Post-production uniquement',
              ],
              correctIndex: 1,
              explanation: 'D\'abord le rough cut (plans dans l\'ordre), puis le fine cut (ajustements), enfin la post-production (titres, couleurs, effets).',
            },
            {
              question: 'Quel pourcentage de videos sur les reseaux sociaux sont regardees sans le son ?',
              options: ['25%', '50%', '85%', '100%'],
              correctIndex: 2,
              explanation: '85% des videos sur les reseaux sociaux sont regardees sans le son. Les sous-titres sont donc essentiels.',
            },
            {
              question: 'Quelle resolution pour une video Instagram Reels ?',
              options: ['1920x1080 (horizontal)', '1080x1920 (vertical)', '1080x1080 (carre)', '720x480'],
              correctIndex: 1,
              explanation: 'Instagram Reels et TikTok utilisent le format vertical 1080x1920 (9:16) pour l\'experience mobile en plein ecran.',
            },
            {
              question: 'Quelle transition est la plus professionnelle pour la majorite des coupes ?',
              options: [
                'Le fondu enchaine',
                'La coupe franche (cut)',
                'La transition en etoile',
                'Le fondu au noir',
              ],
              correctIndex: 1,
              explanation: 'La coupe franche (cut) est la transition la plus courante et la plus propre. Les transitions fantaisistes font amateur sauf intention artistique assumee.',
            },
            {
              question: 'Combien de mots maximum sur une miniature YouTube ?',
              options: ['1', '3-5', '10-15', '20+'],
              correctIndex: 1,
              explanation: 'Une bonne miniature contient 3-5 mots maximum, percutants et lisibles meme en petit format sur mobile.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 60,
      badgeEmoji: '\u{1F3EC}',
      badgeName: 'AI Filmmaker',
    },
  ],
};
