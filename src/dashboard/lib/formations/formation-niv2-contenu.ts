import type { FormationParcours } from './formation-data';

/* =============================================================================
   PARCOURS NIV2 — Content Strategy Avancé
   6 modules × 3 leçons — 1h — 750 XP
   ============================================================================= */

export const parcoursContentNiv2: FormationParcours = {
  id: 'content-strategy-niv2',
  title: 'Content Strategy Avancé',
  emoji: '🎯',
  description: 'Passez au niveau supérieur en stratégie de contenu : éditorial multi-plateforme, calendrier automatisé, A/B testing, SEO avancé, branding visuel et analytics.',
  category: 'contenu',
  subcategory: 'strategy',
  level: 'avance',
  levelLabel: 'Avancé',
  diplomaTitle: 'Content Strategist',
  diplomaSubtitle: 'Stratégie de contenu multi-plateforme assistée par IA',
  totalDuration: '1h',
  totalXP: 750,
  color: '#EC4899',
  available: true,
  comingSoon: false,
  modules: [

    /* ══════════════════════════════════════════════════════════════════════════
       Module 1 — Stratégie éditoriale multi-plateforme
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m1',
      title: 'Stratégie éditoriale multi-plateforme',
      emoji: '🌐',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m1-l1',
          type: 'text',
          title: 'Cohérence cross-platform sans copier-coller',
          duration: '4 min',
          xpReward: 25,
          content: `Tu publies sur LinkedIn, Instagram, TikTok, ta newsletter et peut-être même un blog. Le piège classique ? Poster exactement la même chose partout — ou pire, poster des messages complètement incohérents qui donnent l'impression que 5 personnes différentes gèrent ta marque.

La cohérence cross-platform, ce n'est pas du copier-coller. C'est un fil rouge qui relie tous tes contenus : le même positionnement, les mêmes valeurs, le même ton — mais adaptés au format et aux codes de chaque plateforme. Pense à ça comme une chanson : la mélodie reste la même, mais l'arrangement change selon qu'on joue en acoustique ou en électro.

Commence par définir tes 3 à 5 piliers de contenu. Ce sont les grands thèmes sur lesquels tu prends la parole. Par exemple, un coach business pourrait avoir : mindset entrepreneurial, stratégies de croissance, coulisses de son quotidien, témoignages clients et outils recommandés. Chaque publication doit entrer dans l'un de ces piliers.

Ensuite, adapte le format au réseau. Un même pilier « stratégies de croissance » peut devenir un post texte long sur LinkedIn (format story + leçon), un carrousel éducatif sur Instagram (5-7 slides avec une astuce par slide), un TikTok de 30 secondes avec un conseil rapide face caméra, et un paragraphe approfondi dans ta newsletter hebdo.

La règle d'or : chaque plateforme doit apporter une valeur unique. Si ton audience te suit partout, elle ne doit jamais avoir l'impression de voir la même chose en boucle. LinkedIn pour la réflexion stratégique, Instagram pour le visuel inspirant, TikTok pour l'énergie et l'authenticité, la newsletter pour la profondeur. Tu gardes le même message, mais tu changes l'emballage.

Un outil pratique : crée un tableau de correspondance. Pour chaque idée de contenu, note comment elle se décline sur chaque plateforme. En 15 minutes de planification, tu génères une semaine de contenus cohérents mais jamais redondants. Avec Freenzy, tu peux demander à l'assistant de créer ces déclinaisons automatiquement à partir d'une seule idée source.`
        },
        {
          id: 'cs2-m1-l2',
          type: 'text',
          title: 'Tone of voice et charte éditoriale',
          duration: '3 min',
          xpReward: 25,
          content: `Le tone of voice, c'est la personnalité de ta marque quand elle parle. Et comme une vraie personnalité, elle doit rester stable — sinon tes lecteurs ne sauront jamais à quoi s'attendre.

Ta charte éditoriale est le document de référence qui garantit cette cohérence. Même si tu es seul à rédiger aujourd'hui, rédiger une charte te force à clarifier tes choix et te fait gagner un temps fou quand tu délègues ou que tu utilises l'IA pour générer du contenu.

Voici les éléments essentiels d'une charte éditoriale efficace. D'abord, le niveau de langage : tutoyement ou vouvoiement ? Vocabulaire technique ou vulgarisé ? Phrases courtes et punchy ou développées et nuancées ? Ensuite, la personnalité en 3-4 adjectifs : « direct, bienveillant, expert, un peu décalé » par exemple. Puis les mots et expressions signature — ceux que tu utilises souvent et qui deviennent ta marque de fabrique. Et enfin, les interdits : jargon trop corporate, anglicismes abusifs, humour douteux, sujets hors-limites.

Pour le tone of voice, utilise la matrice des 4 dimensions : formel vs décontracté, sérieux vs humoristique, respectueux vs irrévérencieux, enthousiaste vs factuel. Place ta marque sur chaque axe. Par exemple, Freenzy c'est : plutôt décontracté, sérieux sur le fond mais léger sur la forme, respectueux mais pas guindé, et clairement enthousiaste.

Un tip concret : demande à l'assistant Freenzy de rédiger le même message dans 3 tons différents. Compare et choisis celui qui « sonne » comme toi. Ensuite, utilise ce prompt comme référence pour toutes tes futures générations. Tu peux même sauvegarder ton tone of voice dans les paramètres de tes agents pour que chaque contenu généré respecte automatiquement ta charte.`
        },
        {
          id: 'cs2-m1-l3',
          type: 'quiz',
          title: 'Quiz — Stratégie éditoriale multi-plateforme',
          duration: '3 min',
          xpReward: 75,
          content: 'Vérifie ta maîtrise de la cohérence éditoriale cross-platform.',
          quizQuestions: [
            {
              question: 'Que signifie la cohérence cross-platform ?',
              options: ['Publier le même post sur toutes les plateformes', 'Garder le même message mais adapter le format à chaque réseau', 'Ne publier que sur une seule plateforme', 'Utiliser les mêmes hashtags partout'],
              correctIndex: 1,
              explanation: 'La cohérence cross-platform consiste à maintenir le même positionnement et ton tout en adaptant le format aux codes de chaque plateforme.'
            },
            {
              question: 'Combien de piliers de contenu sont recommandés ?',
              options: ['1 à 2', '3 à 5', '8 à 10', '15 ou plus'],
              correctIndex: 1,
              explanation: '3 à 5 piliers de contenu permettent de couvrir ton expertise sans t\'éparpiller et de rester cohérent dans ta communication.'
            },
            {
              question: 'Quel élément NE fait PAS partie d\'une charte éditoriale ?',
              options: ['Le niveau de langage (tu/vous)', 'La personnalité de marque en adjectifs', 'Le budget publicitaire mensuel', 'Les mots et expressions interdits'],
              correctIndex: 2,
              explanation: 'Le budget publicitaire relève de la stratégie média, pas de la charte éditoriale qui définit le ton, le style et les règles rédactionnelles.'
            },
            {
              question: 'Quelle est la matrice recommandée pour définir un tone of voice ?',
              options: ['Coût / portée / engagement / conversion', 'Formel/décontracté, sérieux/humoristique, respectueux/irrévérencieux, enthousiaste/factuel', 'Texte / image / vidéo / audio', 'Quotidien / hebdomadaire / mensuel / trimestriel'],
              correctIndex: 1,
              explanation: 'La matrice des 4 dimensions (formel vs décontracté, sérieux vs humoristique, respectueux vs irrévérencieux, enthousiaste vs factuel) permet de positionner précisément le ton de ta marque.'
            }
          ]
        }
      ]
    },

    /* ══════════════════════════════════════════════════════════════════════════
       Module 2 — Calendrier de contenu automatisé
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m2',
      title: 'Calendrier de contenu automatisé',
      emoji: '📅',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m2-l1',
          type: 'text',
          title: 'Planification mensuelle et batch creation',
          duration: '4 min',
          xpReward: 25,
          content: `Le plus grand ennemi de la régularité en contenu, c'est la page blanche du lundi matin. « Qu'est-ce que je poste aujourd'hui ? » — si tu te poses cette question, tu as déjà perdu. La solution : la planification mensuelle et le batch creation.

Le batch creation, c'est le fait de créer plusieurs contenus en une seule session au lieu de produire au jour le jour. L'idée est simple : tu bloques 2 à 4 heures par semaine (ou une journée par mois) pour créer tout ton contenu à l'avance. Ton cerveau reste en « mode créatif » au lieu de basculer entre création, publication, réponses aux commentaires et gestion quotidienne.

Voici la méthode en 4 étapes. Étape 1 : le brain dump mensuel. En début de mois, liste toutes les idées de contenu en vrac — actualités de ton secteur, questions fréquentes de tes clients, lancements prévus, dates clés (fêtes, événements, marronniers). Vise 30 à 40 idées brutes sans te censurer.

Étape 2 : le tri par pilier. Classe chaque idée dans l'un de tes piliers de contenu. Si un pilier est vide, génère des idées supplémentaires avec l'assistant Freenzy. Si un pilier déborde, garde les meilleures idées et archive le reste pour le mois suivant.

Étape 3 : le calendrier. Place tes contenus sur un calendrier en respectant un rythme réaliste. Mieux vaut 3 posts par semaine pendant 12 mois que 7 posts par semaine pendant 3 semaines puis silence radio. Alterne les formats (texte, carrousel, vidéo) et les piliers pour garder de la variété.

Étape 4 : la session batch. Crée tout d'un coup. Rédige les textes à la chaîne, prépare les visuels en lot, programme les publications. Avec Freenzy, tu peux générer les brouillons de tous tes posts en une session, puis les affiner et les programmer. Un mois de contenu en une après-midi, c'est tout à fait possible.

Le calendrier n'est pas gravé dans le marbre. Garde 20% de flexibilité pour l'actualité chaude et les opportunités spontanées. Mais les 80% planifiés te garantissent une présence régulière même pendant les périodes chargées.`
        },
        {
          id: 'cs2-m2-l2',
          type: 'exercise',
          title: 'Créez un calendrier 1 semaine avec l\'assistant',
          duration: '4 min',
          xpReward: 50,
          content: 'Mets en pratique la planification de contenu en créant un calendrier éditorial complet pour une semaine.',
          exercisePrompt: 'Utilise l\'assistant Freenzy pour créer un calendrier de contenu sur 7 jours. Définis d\'abord 3 piliers de contenu pour ton activité, puis génère un planning avec : la plateforme cible (LinkedIn, Instagram, ou les deux), le format (texte, carrousel, vidéo courte, story), le pilier de contenu concerné, le sujet précis et le meilleur horaire de publication. Tu dois avoir au minimum 1 publication par jour ouvré et 1 le week-end.'
        },
        {
          id: 'cs2-m2-l3',
          type: 'quiz',
          title: 'Quiz — Calendrier de contenu',
          duration: '3 min',
          xpReward: 50,
          content: 'Vérifie tes connaissances sur la planification et le batch creation.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que le batch creation ?',
              options: ['Publier en masse sur tous les réseaux en même temps', 'Créer plusieurs contenus en une seule session dédiée', 'Copier le contenu d\'autres créateurs', 'Automatiser la publication sans relecture'],
              correctIndex: 1,
              explanation: 'Le batch creation consiste à regrouper la création de contenu en sessions dédiées plutôt que de produire au jour le jour, pour rester en mode créatif.'
            },
            {
              question: 'Quelle est la première étape de la planification mensuelle ?',
              options: ['Programmer les publications', 'Créer les visuels', 'Faire un brain dump d\'idées', 'Analyser les statistiques du mois précédent'],
              correctIndex: 2,
              explanation: 'Le brain dump (liste d\'idées en vrac) est la première étape : on génère un maximum d\'idées avant de trier et planifier.'
            },
            {
              question: 'Quel pourcentage de flexibilité faut-il garder dans son calendrier ?',
              options: ['0% — tout doit être planifié', '20% pour l\'actualité chaude', '50% — moitié planifié, moitié spontané', '80% de spontané'],
              correctIndex: 1,
              explanation: 'Garder 20% de flexibilité permet de réagir à l\'actualité tout en maintenant 80% de régularité grâce à la planification.'
            },
            {
              question: 'Pourquoi vaut-il mieux 3 posts/semaine pendant 12 mois que 7 posts/semaine pendant 3 semaines ?',
              options: ['Parce que les algorithmes ne comptent que les 3 premiers posts', 'Parce que la régularité sur la durée bat l\'intensité ponctuelle', 'Parce que 7 posts c\'est trop pour n\'importe quel réseau', 'Parce que les abonnés se désabonnent si tu publies trop'],
              correctIndex: 1,
              explanation: 'La régularité est le facteur numéro un de croissance sur les réseaux. Les algorithmes et ton audience récompensent la constance bien plus que les pics d\'activité.'
            }
          ]
        }
      ]
    },

    /* ══════════════════════════════════════════════════════════════════════════
       Module 3 — A/B testing de contenu
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m3',
      title: 'A/B testing de contenu',
      emoji: '🧪',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m3-l1',
          type: 'text',
          title: 'Tester titres, visuels et horaires',
          duration: '4 min',
          xpReward: 25,
          content: `Le A/B testing n'est pas réservé aux pages web et aux campagnes publicitaires. C'est un outil puissant pour améliorer ton contenu organique — et la plupart des créateurs passent complètement à côté.

Le principe est simple : au lieu de deviner ce qui marche, tu testes. Tu crées deux versions d'un même contenu en changeant un seul élément, tu publies les deux, et tu compares les résultats. La version gagnante devient ton nouveau standard.

Commençons par les titres. Le titre (ou le hook, la première ligne) détermine si ton contenu sera lu ou ignoré. Pour tester, prends un même sujet et écris 2 à 3 accroches différentes. Publie la version A un mardi et la version B le mardi suivant, à la même heure. Compare les taux d'engagement. Quelques variations à tester : question vs affirmation (« Tu fais cette erreur ? » vs « L'erreur que tout le monde fait »), chiffre vs pas de chiffre (« 5 astuces pour... » vs « Les meilleures astuces pour... »), négatif vs positif (« Arrête de faire ça » vs « Fais plutôt ça »).

Pour les visuels, teste un élément à la fois : photo vs illustration, couleurs vives vs sobres, avec texte superposé vs sans texte, portrait vs paysage. Sur Instagram, la couleur dominante de ton visuel peut faire varier ton taux d'engagement de 20 à 40%.

Les horaires sont le test le plus facile à mettre en place. Publie le même type de contenu à des heures différentes pendant 4 semaines. Tu seras surpris : tes horaires optimaux ne sont probablement pas ceux que tu crois. Chaque audience a ses propres habitudes, et seul le test te donnera la réponse exacte.

Règle d'or du A/B testing : ne change qu'une variable à la fois. Si tu changes le titre ET le visuel ET l'horaire, tu ne sauras jamais ce qui a fait la différence. La patience et la rigueur sont tes meilleurs alliés.`
        },
        {
          id: 'cs2-m3-l2',
          type: 'text',
          title: 'Interpréter les résultats d\'un A/B test',
          duration: '3 min',
          xpReward: 25,
          content: `Faire un A/B test c'est bien, savoir lire les résultats c'est mieux. Beaucoup de créateurs testent, voient un chiffre plus élevé et concluent — sans se demander si la différence est réelle ou juste du bruit statistique.

Première règle : définis ton KPI principal AVANT le test. Qu'est-ce que tu cherches à optimiser ? Le taux d'engagement (likes + commentaires / impressions), la portée (nombre de personnes touchées), les clics vers ton site, ou les conversions (inscriptions, ventes) ? Chaque objectif peut donner un « gagnant » différent. Un post peut avoir un engagement énorme mais zéro clic — est-ce vraiment un succès si ton objectif est de générer du trafic ?

Deuxième règle : attends suffisamment de données. Sur les réseaux sociaux, un post touche l'essentiel de son audience dans les 24 à 48 premières heures. Attends au minimum 48h avant de tirer des conclusions. Et ne compare pas un post qui a 50 vues avec un qui en a 5000 — tu as besoin d'un volume minimum pour que la comparaison ait du sens.

Troisième règle : regarde les tendances, pas les cas isolés. Un seul test ne prouve rien. Si tes posts avec des chiffres dans le titre marchent mieux 4 fois sur 5, là tu tiens quelque chose. Si c'est 1 fois sur 2, c'est peut-être juste du hasard.

Quatrième règle : documente tout. Crée un tableur simple avec : date, plateforme, variable testée, version A, version B, résultats, conclusion. Au bout de 3 mois, tu auras une mine d'or de données sur ce qui fonctionne pour TON audience. Avec Freenzy, tu peux demander à l'assistant d'analyser tes résultats et de te suggérer les prochains tests prioritaires.

Enfin, n'oublie pas que les algorithmes évoluent. Un résultat valide aujourd'hui ne le sera peut-être plus dans 6 mois. Teste en continu, c'est un processus permanent.`
        },
        {
          id: 'cs2-m3-l3',
          type: 'quiz',
          title: 'Quiz — A/B testing de contenu',
          duration: '3 min',
          xpReward: 75,
          content: 'Teste tes connaissances sur le A/B testing appliqué au contenu.',
          quizQuestions: [
            {
              question: 'Quelle est la règle d\'or du A/B testing ?',
              options: ['Tester sur le plus de plateformes possible', 'Ne changer qu\'une seule variable à la fois', 'Toujours tester les horaires en premier', 'Publier les deux versions en même temps'],
              correctIndex: 1,
              explanation: 'Ne changer qu\'une variable à la fois permet d\'isoler ce qui fait la différence. Sinon, impossible de savoir quel changement a eu un impact.'
            },
            {
              question: 'Combien de temps faut-il attendre avant de conclure un A/B test sur les réseaux sociaux ?',
              options: ['1 heure', '6 heures', 'Au minimum 48 heures', '1 mois'],
              correctIndex: 2,
              explanation: 'Un post touche l\'essentiel de son audience dans les 24 à 48 premières heures. Il faut attendre au moins 48h pour avoir des données fiables.'
            },
            {
              question: 'Pourquoi faut-il définir son KPI principal AVANT le test ?',
              options: ['Pour impressionner son boss', 'Parce que chaque objectif peut donner un gagnant différent', 'Parce que c\'est obligatoire légalement', 'Pour pouvoir modifier le test en cours de route'],
              correctIndex: 1,
              explanation: 'Un post peut avoir un excellent engagement mais zéro conversion. Le KPI principal détermine ce qu\'on considère comme une « victoire ».'
            },
            {
              question: 'Combien de tests faut-il pour tirer une conclusion fiable ?',
              options: ['Un seul test suffit', 'Au moins 4-5 tests sur la même variable', 'Exactement 10 tests', 'Un test par plateforme'],
              correctIndex: 1,
              explanation: 'Un seul test ne prouve rien. Il faut observer une tendance sur 4-5 tests pour distinguer un vrai pattern du simple hasard.'
            }
          ]
        }
      ]
    },

    /* ══════════════════════════════════════════════════════════════════════════
       Module 4 — SEO avancé
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m4',
      title: 'SEO avancé',
      emoji: '🔍',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m4-l1',
          type: 'text',
          title: 'Clusters de mots-clés, linking interne et E-E-A-T',
          duration: '4 min',
          xpReward: 25,
          content: `Le SEO en 2026 ne se résume plus à placer des mots-clés dans un article. Google est devenu beaucoup plus intelligent et récompense l'expertise thématique, la structure de contenu et l'autorité réelle. Voici les trois piliers du SEO avancé.

Premier pilier : les clusters de mots-clés (ou topic clusters). Au lieu d'écrire des articles isolés, tu construis un écosystème de contenu. Le principe : une page pilier (article long et complet sur un sujet large) entourée de pages satellites (articles plus courts sur des sous-sujets spécifiques). Toutes les pages satellites pointent vers la page pilier, et la page pilier renvoie vers chaque satellite. Par exemple, si ta page pilier est « Marketing digital pour PME », tes satellites pourraient être « SEO local pour PME », « Email marketing pour débutants », « Publicité Facebook petit budget », etc.

Deuxième pilier : le linking interne stratégique. Chaque page de ton site doit être accessible en maximum 3 clics depuis la page d'accueil. Utilise des ancres de texte descriptives (pas « cliquez ici » mais « notre guide complet du SEO local ») et crée des liens contextuels entre tes articles. Le maillage interne distribue le « jus SEO » et aide Google à comprendre la structure thématique de ton site. Vérifie régulièrement les liens cassés — un lien mort, c'est une fuite de valeur.

Troisième pilier : E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness). Google veut savoir si l'auteur a une expérience réelle du sujet. Concrètement : affiche clairement l'auteur avec sa bio et ses qualifications, cite des sources fiables, mets à jour tes articles régulièrement (la date de dernière modification compte), et obtiens des backlinks depuis des sites reconnus dans ton domaine.

Le SEO avancé est un jeu de patience. Les résultats ne sont pas immédiats mais ils sont durables. Un article bien optimisé peut générer du trafic organique pendant des années. Avec Freenzy, tu peux demander à l'assistant d'analyser la structure de tes clusters et de te suggérer les articles satellites manquants dans ta stratégie.`
        },
        {
          id: 'cs2-m4-l2',
          type: 'exercise',
          title: 'Créez un cluster de 5 articles SEO',
          duration: '4 min',
          xpReward: 50,
          content: 'Mets en pratique la stratégie de topic clusters en créant une architecture de contenu SEO complète.',
          exercisePrompt: 'Utilise l\'assistant Freenzy pour créer un cluster SEO complet. Choisis un sujet principal lié à ton activité, puis génère : 1) Une page pilier avec son titre optimisé, sa meta description (155 caractères max) et un plan détaillé en 5-7 sections. 2) Cinq articles satellites avec pour chacun : le titre optimisé, le mot-clé principal, le mot-clé secondaire, la meta description et le lien vers la page pilier. 3) Le maillage interne entre les articles (quel satellite renvoie vers quel autre).'
        },
        {
          id: 'cs2-m4-l3',
          type: 'quiz',
          title: 'Quiz — SEO avancé',
          duration: '3 min',
          xpReward: 50,
          content: 'Vérifie ta maîtrise des concepts SEO avancés.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'un topic cluster en SEO ?',
              options: ['Un groupe de mots-clés synonymes', 'Une page pilier entourée de pages satellites liées thématiquement', 'Un ensemble de backlinks depuis le même domaine', 'Un plugin WordPress pour le SEO'],
              correctIndex: 1,
              explanation: 'Un topic cluster est une architecture de contenu avec une page pilier centrale et des pages satellites qui couvrent les sous-sujets, toutes liées entre elles.'
            },
            {
              question: 'Que signifie le premier E de E-E-A-T ?',
              options: ['Engagement', 'Experience', 'Efficiency', 'Earnings'],
              correctIndex: 1,
              explanation: 'Le premier E signifie Experience — Google veut savoir si l\'auteur a une expérience réelle et concrète du sujet traité.'
            },
            {
              question: 'En combien de clics maximum chaque page doit-elle être accessible depuis l\'accueil ?',
              options: ['1 clic', '3 clics', '5 clics', '10 clics'],
              correctIndex: 1,
              explanation: 'La règle des 3 clics est un principe fondamental de l\'architecture SEO : chaque page doit être accessible en maximum 3 clics depuis la page d\'accueil.'
            },
            {
              question: 'Quel type d\'ancre de lien faut-il privilégier pour le maillage interne ?',
              options: ['« Cliquez ici »', '« En savoir plus »', 'Une ancre descriptive du contenu cible', 'L\'URL brute de la page'],
              correctIndex: 2,
              explanation: 'Les ancres descriptives (ex: « notre guide complet du SEO local ») aident Google à comprendre le contenu de la page cible et renforcent la pertinence thématique.'
            },
            {
              question: 'Pourquoi la date de dernière modification est-elle importante en SEO ?',
              options: ['Parce que Google n\'indexe que les pages récentes', 'Parce que les articles mis à jour sont perçus comme plus fiables (E-E-A-T)', 'Parce que les utilisateurs filtrent par date', 'Elle n\'a aucune importance'],
              correctIndex: 1,
              explanation: 'Les mises à jour régulières renforcent le signal de Trustworthiness (fiabilité) dans E-E-A-T : un contenu entretenu est perçu comme plus digne de confiance.'
            }
          ]
        }
      ]
    },

    /* ══════════════════════════════════════════════════════════════════════════
       Module 5 — Branding visuel cross-platform
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m5',
      title: 'Branding visuel cross-platform',
      emoji: '🎨',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m5-l1',
          type: 'text',
          title: 'Cohérence visuelle et templates réutilisables',
          duration: '4 min',
          xpReward: 25,
          content: `Tu peux avoir le meilleur contenu du monde — si tes visuels changent de style à chaque publication, ton audience ne te reconnaîtra pas dans son feed. La cohérence visuelle est ce qui transforme un créateur de contenu en une marque mémorable.

L'identité visuelle de ta marque repose sur 4 éléments fondamentaux. Les couleurs : choisis 2 à 3 couleurs principales et 1 à 2 couleurs d'accent. Utilise-les systématiquement. Pense à Coca-Cola (rouge), Spotify (vert), LinkedIn (bleu) — la couleur est le premier signal de reconnaissance. Les typographies : 1 police pour les titres (avec du caractère) et 1 police pour le texte courant (lisible). Maximum 2 polices, jamais plus. Les éléments graphiques récurrents : un style d'illustration, un type de bordure, un pattern de fond, des icônes dans un style cohérent. Et enfin, le traitement photo : filtre, contraste, luminosité — tous tes visuels doivent avoir le même « grain ».

Les templates réutilisables sont ton arme secrète pour maintenir cette cohérence sans y passer des heures. Crée un template pour chaque type de contenu récurrent : post citation, carrousel éducatif, annonce produit, témoignage client, infographie, story promotionnelle. Chaque template respecte ta charte visuelle et ne nécessite que de changer le texte et éventuellement l'image.

Avec le Studio Freenzy, tu peux générer des visuels qui respectent automatiquement ta charte. Décris ton style une fois dans les paramètres de l'agent créatif, et chaque image générée suivra tes guidelines. Fini les heures passées à ajuster les couleurs à la main.

Un tip pro : crée un brand board — un document d'une page qui rassemble tes couleurs (codes hex), tes polices, ton logo dans ses différentes déclinaisons, des exemples de visuels approuvés et des exemples de ce qu'il ne faut PAS faire. Partage ce document avec toute personne qui crée du contenu pour ta marque.

La cohérence visuelle paie sur le long terme. Après 3 à 6 mois de publications visuellement cohérentes, ton audience commencera à reconnaître tes contenus avant même de lire ton nom. C'est l'effet « scroll-stopping » — on s'arrête parce qu'on reconnaît ta marque.`
        },
        {
          id: 'cs2-m5-l2',
          type: 'game',
          title: 'Jeu — Associe le format à sa plateforme',
          duration: '3 min',
          xpReward: 50,
          content: 'Associe chaque format visuel à la plateforme où il performe le mieux.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Carrousel éducatif (5-10 slides)', right: 'Instagram' },
              { left: 'Infographie verticale longue', right: 'Pinterest' },
              { left: 'Bannière professionnelle 1584×396', right: 'LinkedIn' },
              { left: 'Vidéo verticale 9:16 (15-60s)', right: 'TikTok' },
              { left: 'Story animée avec sondage interactif', right: 'Instagram Stories' },
              { left: 'Image avec texte overlay (1200×630)', right: 'Facebook' },
              { left: 'Miniature YouTube (1280×720)', right: 'YouTube' },
              { left: 'GIF réaction ou mème', right: 'Twitter/X' }
            ]
          }
        },
        {
          id: 'cs2-m5-l3',
          type: 'quiz',
          title: 'Quiz — Branding visuel',
          duration: '3 min',
          xpReward: 50,
          content: 'Teste tes connaissances sur le branding visuel cross-platform.',
          quizQuestions: [
            {
              question: 'Combien de couleurs principales recommande-t-on dans une identité visuelle ?',
              options: ['1 seule', '2 à 3', '5 à 7', '10 ou plus'],
              correctIndex: 1,
              explanation: '2 à 3 couleurs principales + 1 à 2 couleurs d\'accent suffisent pour une identité forte et reconnaissable sans surcharger.'
            },
            {
              question: 'Combien de polices de caractères maximum dans une charte visuelle ?',
              options: ['1 seule', '2 maximum', '4 à 5', 'Aucune limite'],
              correctIndex: 1,
              explanation: 'Maximum 2 polices : une pour les titres (avec du caractère) et une pour le texte courant (lisible). Plus de 2 polices crée un effet brouillon.'
            },
            {
              question: 'Qu\'est-ce qu\'un brand board ?',
              options: ['Un tableau de bord Analytics', 'Un document résumant toute l\'identité visuelle sur une page', 'Un outil de gestion de projet', 'Un type de publicité display'],
              correctIndex: 1,
              explanation: 'Le brand board est un document d\'une page qui rassemble couleurs, polices, logo, exemples de visuels approuvés et contre-exemples.'
            }
          ]
        }
      ]
    },

    /* ══════════════════════════════════════════════════════════════════════════
       Module 6 — Analytics contenu
       ══════════════════════════════════════════════════════════════════════════ */
    {
      id: 'cs2-m6',
      title: 'Analytics contenu',
      emoji: '📊',
      duration: '10 min',
      xpReward: 125,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'cs2-m6-l1',
          type: 'text',
          title: 'KPIs, engagement rate et conversion',
          duration: '4 min',
          xpReward: 25,
          content: `Créer du contenu sans mesurer les résultats, c'est comme conduire les yeux fermés. Les analytics te donnent les yeux — encore faut-il savoir quoi regarder. Parce que les plateformes te noient sous les chiffres, et la plupart ne servent à rien.

Commençons par les KPIs qui comptent vraiment. Le nombre d'abonnés ? C'est une vanity metric — un compteur qui fait plaisir à l'ego mais ne dit rien sur la santé de ta stratégie. Concentre-toi plutôt sur ces 5 indicateurs essentiels.

Le taux d'engagement est le roi des KPIs. Il se calcule ainsi : (likes + commentaires + partages + sauvegardes) divisé par le nombre d'impressions, multiplié par 100. Un bon taux d'engagement varie selon la plateforme : 3-6% sur Instagram, 2-4% sur LinkedIn, 1-3% sur Facebook, 5-10% sur TikTok. Si tu es au-dessus de ces fourchettes, tu fais un excellent travail. En dessous, ton contenu ne résonne pas avec ton audience.

Le taux de portée organique (reach / nombre d'abonnés × 100) indique combien de tes abonnés voient réellement tes publications. Ce chiffre a chuté partout ces dernières années : 5-10% sur Instagram, 2-5% sur Facebook, 10-15% sur LinkedIn. Si ta portée baisse, c'est un signal d'alarme.

Le taux de clic (CTR) mesure combien de personnes passent à l'action après avoir vu ton contenu. C'est le pont entre visibilité et conversion. Le taux de sauvegarde (sur Instagram) est devenu un signal majeur : une sauvegarde vaut plus qu'un like car elle indique que ton contenu a une valeur durable.

Et enfin, le coût par résultat si tu investis en publicité. Rapporte tes dépenses publicitaires au nombre de résultats concrets (leads, ventes, inscriptions) pour savoir si ton investissement est rentable.

Piège classique : comparer tes chiffres avec ceux d'un compte dans une niche différente. Les benchmarks varient énormément selon le secteur, la taille de l'audience et le type de contenu. Compare-toi à toi-même : la tendance mois après mois est plus importante que la valeur absolue.`
        },
        {
          id: 'cs2-m6-l2',
          type: 'text',
          title: 'Dashboards et reporting efficace',
          duration: '3 min',
          xpReward: 25,
          content: `Avoir les bons KPIs c'est la première étape. Mais si tu dois passer 2 heures chaque semaine à compiler des chiffres depuis 5 plateformes différentes, tu vas vite abandonner. La solution : un dashboard centralisé et un reporting automatisé.

Un bon dashboard contenu affiche 3 niveaux d'information. La vue d'ensemble (health check) : tes KPIs principaux en un coup d'oeil — engagement rate global, portée moyenne, croissance d'audience, meilleur post de la semaine. C'est ce que tu regardes en 30 secondes chaque matin. La vue par plateforme : chaque réseau avec ses métriques spécifiques, ses tendances sur 30 jours et ses top posts. C'est ta revue hebdomadaire de 15 minutes. La vue détaillée : l'analyse post par post avec les résultats des A/B tests, les horaires les plus performants et les sujets qui génèrent le plus d'engagement. C'est ta session mensuelle d'optimisation stratégique.

Pour le reporting, adopte le format « Insights + Actions ». Un rapport qui liste des chiffres sans analyse est inutile. Pour chaque métrique, réponds à trois questions : qu'est-ce qui s'est passé (le chiffre), pourquoi (l'analyse), et qu'est-ce qu'on fait ensuite (l'action). Par exemple : « Le taux d'engagement a chuté de 4,2% à 2,8% ce mois-ci (quoi). Les posts éducatifs ont bien marché mais les posts promotionnels ont tiré la moyenne vers le bas (pourquoi). Le mois prochain, on réduit les posts promo de 30% et on teste un format FAQ interactif (action). »

La fréquence de reporting dépend de ton volume de publication. Si tu publies quotidiennement, un check rapide chaque jour + un reporting hebdomadaire. Si tu publies 2-3 fois par semaine, un reporting bimensuel suffit. Dans tous les cas, un bilan mensuel approfondi est indispensable pour ajuster ta stratégie.

Avec Freenzy, tu peux importer tes statistiques et demander à l'assistant de générer un rapport d'analyse automatique. Il identifie les tendances, les anomalies et te propose des actions concrètes basées sur tes données. Un gain de temps considérable pour te concentrer sur la stratégie plutôt que sur la compilation de chiffres.`
        },
        {
          id: 'cs2-m6-l3',
          type: 'quiz',
          title: 'Quiz — Analytics contenu',
          duration: '3 min',
          xpReward: 75,
          content: 'Vérifie ta maîtrise des analytics et du reporting contenu.',
          quizQuestions: [
            {
              question: 'Comment calcule-t-on le taux d\'engagement ?',
              options: ['Nombre d\'abonnés / nombre de posts', '(Likes + commentaires + partages + sauvegardes) / impressions × 100', 'Nombre de vues / nombre de clics', 'Nombre de posts / nombre de jours'],
              correctIndex: 1,
              explanation: 'Le taux d\'engagement se calcule en divisant les interactions totales (likes, commentaires, partages, sauvegardes) par le nombre d\'impressions, multiplié par 100.'
            },
            {
              question: 'Pourquoi le nombre d\'abonnés est-il une « vanity metric » ?',
              options: ['Parce qu\'il est toujours faux', 'Parce qu\'il ne reflète pas l\'engagement réel ni l\'impact business', 'Parce que les plateformes le cachent', 'Parce qu\'il diminue toujours'],
              correctIndex: 1,
              explanation: 'Le nombre d\'abonnés ne dit rien sur la qualité de l\'audience, son engagement ou sa propension à acheter. Un compte avec 1000 abonnés engagés vaut mieux que 100K abonnés passifs.'
            },
            {
              question: 'Quel format de reporting est recommandé ?',
              options: ['Un simple tableur de chiffres bruts', 'Le format Insights + Actions (quoi, pourquoi, quoi faire)', 'Un PDF de 50 pages avec tous les graphiques possibles', 'Un email avec un seul chiffre clé'],
              correctIndex: 1,
              explanation: 'Le format Insights + Actions répond à trois questions pour chaque métrique : qu\'est-ce qui s\'est passé, pourquoi, et quelle action prendre. C\'est le format le plus actionnable.'
            },
            {
              question: 'Quel KPI est devenu un signal majeur sur Instagram en 2026 ?',
              options: ['Le nombre de likes', 'Le nombre de commentaires', 'Le taux de sauvegarde', 'Le nombre de followers gagnés'],
              correctIndex: 2,
              explanation: 'Les sauvegardes sont devenues un signal majeur car elles indiquent que le contenu a une valeur durable — l\'utilisateur veut y revenir plus tard.'
            },
            {
              question: 'À quelle fréquence faut-il faire un bilan stratégique approfondi ?',
              options: ['Quotidiennement', 'Hebdomadairement', 'Mensuellement', 'Annuellement'],
              correctIndex: 2,
              explanation: 'Un bilan mensuel approfondi est indispensable pour ajuster la stratégie de contenu. Les checks quotidiens et hebdomadaires servent au suivi opérationnel.'
            }
          ]
        }
      ]
    }
  ]
};
