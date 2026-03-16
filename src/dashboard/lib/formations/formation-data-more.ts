import type { FormationParcours } from './formation-data';

/* ═══════════════════════════════════════════════════════════════
   PARCOURS 3 — Créer du contenu pro
   ═══════════════════════════════════════════════════════════════ */

export const parcoursContenuPro: FormationParcours = {
  id: 'contenu-pro',
  title: 'Créer du contenu pro',
  emoji: '✍️',
  description: 'Maîtrisez la création de contenu professionnel : posts LinkedIn, réseaux sociaux, emails marketing, avis Google et studios IA photo/vidéo.',
  category: 'competence',
  subcategory: 'contenu',
  level: 'debutant',
  levelLabel: 'Débutant',
  diplomaTitle: 'AI Content Creator',
  diplomaSubtitle: 'Création de contenu professionnel assistée par IA',
  totalDuration: '3h',
  totalXP: 1800,
  color: '#EC4899',
  available: true,
  comingSoon: false,
  modules: [
    /* ── M1 : Posts LinkedIn qui cartonnent ── */
    {
      id: 'contenu-pro-m1',
      title: 'Posts LinkedIn qui cartonnent',
      emoji: '💼',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m1-l1',
          type: 'text',
          title: 'L\'algorithme LinkedIn en 2026',
          duration: '10 min',
          xpReward: 50,
          content: `LinkedIn a profondément évolué ces dernières années. En 2026, l'algorithme privilégie trois facteurs clés : la pertinence du contenu par rapport à votre réseau, le taux d'engagement dans les premières heures et la régularité de publication.

Le « dwell time » (temps passé sur votre post) est devenu le signal numéro un. Un post que les gens lisent en entier vaut plus qu'un post qui reçoit des likes rapides. Cela signifie que les textes longs et structurés performent mieux que les phrases courtes suivies d'un lien externe.

Les trois formats qui fonctionnent le mieux sont : le hook + story + leçon, le carrousel éducatif et le post « coulisses ». Le format hook + story + leçon consiste à accrocher avec une phrase choc (« J'ai perdu 3 clients en une semaine. Voici ce que j'ai appris. »), puis raconter une histoire personnelle et terminer par un enseignement actionnable.

L'algorithme pénalise fortement les liens externes dans le corps du post — placez-les toujours en commentaire. Les hashtags sont limités à 3-5 maximum et doivent être spécifiques à votre niche plutôt que génériques (#Marketing est trop large, #MarketingB2BSaaS est meilleur).

Publiez entre 7h30 et 9h00 en semaine pour le marché francophone. Le mardi et le jeudi sont statistiquement les meilleurs jours. Engagez-vous sur 5 à 10 posts d'autres personnes avant de publier le vôtre : l'algorithme récompense l'activité sociale.

Enfin, les « pods d'engagement » (groupes qui se likent mutuellement) sont désormais détectés et pénalisés. Privilégiez l'engagement organique authentique : répondez à chaque commentaire dans l'heure qui suit votre publication pour maximiser la portée.`
        },
        {
          id: 'contenu-pro-m1-l2',
          type: 'exercise',
          title: 'Créez votre premier post LinkedIn',
          duration: '10 min',
          xpReward: 100,
          content: `Mettez en pratique le format hook + story + leçon appris dans la leçon précédente.`,
          exercisePrompt: 'Générez un post LinkedIn avec l\'assistant en utilisant le format hook + story + leçon. Choisissez un sujet lié à votre activité professionnelle. Le post doit faire entre 150 et 300 mots, contenir un hook accrocheur en première ligne, une anecdote personnelle au milieu et un enseignement clair à la fin. Ajoutez 3 hashtags pertinents.'
        },
        {
          id: 'contenu-pro-m1-l3',
          type: 'quiz',
          title: 'Quiz — LinkedIn best practices',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur les bonnes pratiques LinkedIn en 2026.',
          quizQuestions: [
            {
              question: 'Quel est le signal le plus important pour l\'algorithme LinkedIn en 2026 ?',
              options: ['Le nombre de likes', 'Le dwell time (temps de lecture)', 'Le nombre de commentaires', 'Le nombre de partages'],
              correctIndex: 1,
              explanation: 'Le dwell time est devenu le signal numéro un : un post lu en entier a plus de valeur qu\'un post qui reçoit des likes rapides sans être lu.'
            },
            {
              question: 'Où faut-il placer les liens externes dans un post LinkedIn ?',
              options: ['Au début du post', 'À la fin du post', 'En commentaire', 'Dans le titre'],
              correctIndex: 2,
              explanation: 'L\'algorithme pénalise les liens externes dans le corps du post. Il faut les placer en premier commentaire pour maximiser la portée.'
            },
            {
              question: 'Combien de hashtags sont recommandés par post ?',
              options: ['1 seul', '3 à 5', '10 à 15', 'Aucun'],
              correctIndex: 1,
              explanation: 'Entre 3 et 5 hashtags spécifiques à votre niche est le nombre optimal. Trop de hashtags est perçu comme du spam.'
            },
            {
              question: 'Quel est le meilleur créneau horaire pour publier sur LinkedIn (marché francophone) ?',
              options: ['Lundi 12h-14h', 'Mardi/Jeudi 7h30-9h00', 'Vendredi 17h-19h', 'Dimanche 10h-12h'],
              correctIndex: 1,
              explanation: 'Le mardi et le jeudi entre 7h30 et 9h00 sont statistiquement les meilleurs créneaux pour toucher le marché francophone.'
            }
          ]
        }
      ]
    },

    /* ── M2 : Réseaux sociaux visuels ── */
    {
      id: 'contenu-pro-m2',
      title: 'Réseaux sociaux visuels',
      emoji: '📸',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m2-l1',
          type: 'text',
          title: 'Stratégies Instagram, Facebook et TikTok',
          duration: '10 min',
          xpReward: 50,
          content: `Chaque réseau social visuel a ses propres codes et son propre algorithme. Comprendre ces différences est essentiel pour maximiser votre impact sans multiplier les efforts inutilement.

Instagram en 2026 privilégie les Reels courts (15-30 secondes) et les carrousels éducatifs. Le format photo unique perd du terrain sauf pour les marques lifestyle haut de gamme. L'algorithme favorise les comptes qui utilisent toutes les fonctionnalités : stories, reels, posts, lives. Les stories avec des stickers interactifs (sondages, questions) boostent votre visibilité de 25% en moyenne.

Facebook reste incontournable pour le B2C local et les communautés de niche. Les groupes Facebook sont votre meilleur atout : créez un groupe autour de votre expertise plutôt que de simplement publier sur votre page. Les vidéos natives (uploadées directement, pas via un lien YouTube) obtiennent 10 fois plus de portée. Les publications avec des images obtiennent 2,3 fois plus d'engagement que le texte seul.

TikTok n'est plus réservé aux adolescents. Le « Business TikTok » explose : tutoriels métier, coulisses d'entreprise, conseils rapides. L'algorithme TikTok est le plus méritocratique — même un compte avec 0 abonné peut devenir viral si le contenu est bon. Les 3 premières secondes sont décisives : si l'utilisateur ne s'arrête pas, votre vidéo est enterrée.

La stratégie cross-platform gagnante : créez un contenu long (vidéo YouTube ou article), puis découpez-le en micro-contenus adaptés à chaque plateforme. Un article de blog devient 5 posts LinkedIn, 3 carrousels Instagram, 2 TikToks et 10 stories.`
        },
        {
          id: 'contenu-pro-m2-l2',
          type: 'text',
          title: 'Hashtags et horaires de publication',
          duration: '8 min',
          xpReward: 50,
          content: `Les hashtags et les horaires de publication sont les deux leviers les plus sous-estimés du marketing social. Bien maîtrisés, ils peuvent doubler votre portée sans effort supplémentaire.

Pour les hashtags, appliquez la règle du 3-3-3 : 3 hashtags larges (plus de 1 million de posts), 3 hashtags moyens (100K à 1M) et 3 hashtags de niche (moins de 100K). Les hashtags de niche sont ceux où vous avez le plus de chances d'apparaître en « Top Posts ». Recherchez-les en tapant des mots-clés spécifiques à votre secteur.

Sur Instagram, placez vos hashtags dans le premier commentaire plutôt que dans la légende pour un rendu plus propre. Sur TikTok, intégrez les hashtags dans la description — 3 à 5 suffisent. Sur Facebook, les hashtags ont peu d'impact : limitez-vous à 1-2 maximum.

Les horaires optimaux varient par plateforme et par audience. En règle générale pour la France et la Belgique : Instagram performe entre 11h-13h et 19h-21h, Facebook entre 13h-16h, TikTok entre 19h-23h. Le week-end fonctionne bien pour le contenu lifestyle et divertissement.

Utilisez les statistiques natives de chaque plateforme (Instagram Insights, Facebook Analytics, TikTok Analytics) pour identifier VOS meilleurs horaires. Chaque audience est unique. Testez pendant 4 semaines, puis optimisez. Un calendrier éditorial hebdomadaire avec des créneaux fixes crée une habitude chez votre audience et simplifie votre organisation.`
        },
        {
          id: 'contenu-pro-m2-l3',
          type: 'quiz',
          title: 'Quiz — Réseaux sociaux visuels',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur les stratégies des réseaux sociaux visuels.',
          quizQuestions: [
            {
              question: 'Quel format Instagram obtient le plus de portée en 2026 ?',
              options: ['Les photos uniques', 'Les Reels courts (15-30s)', 'Les stories texte', 'Les IGTV longs'],
              correctIndex: 1,
              explanation: 'Les Reels courts de 15 à 30 secondes sont le format le plus poussé par l\'algorithme Instagram en 2026.'
            },
            {
              question: 'Quelle est la règle du 3-3-3 pour les hashtags ?',
              options: ['3 posts par jour, 3 hashtags, 3 stories', '3 hashtags larges, 3 moyens, 3 de niche', '3 plateformes, 3 formats, 3 horaires', '3 mots maximum par hashtag'],
              correctIndex: 1,
              explanation: 'La règle du 3-3-3 consiste à utiliser 3 hashtags larges (>1M), 3 moyens (100K-1M) et 3 de niche (<100K) pour optimiser la portée.'
            },
            {
              question: 'Sur quelle plateforme un compte avec 0 abonné peut-il devenir viral ?',
              options: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok'],
              correctIndex: 3,
              explanation: 'TikTok a l\'algorithme le plus méritocratique : il évalue le contenu indépendamment du nombre d\'abonnés du créateur.'
            },
            {
              question: 'Quel est le meilleur créneau pour publier sur TikTok en France ?',
              options: ['6h-8h', '11h-13h', '19h-23h', '14h-16h'],
              correctIndex: 2,
              explanation: 'TikTok performe entre 19h et 23h en France, quand les utilisateurs sont en mode détente et consommation de contenu.'
            }
          ]
        }
      ]
    },

    /* ── M3 : Emails marketing efficaces ── */
    {
      id: 'contenu-pro-m3',
      title: 'Emails marketing efficaces',
      emoji: '📧',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m3-l1',
          type: 'text',
          title: 'Objets, preheaders et CTA qui convertissent',
          duration: '10 min',
          xpReward: 50,
          content: `L'email marketing reste le canal avec le meilleur ROI en 2026 : pour 1€ investi, il rapporte en moyenne 42€. Mais 47% des destinataires ouvrent ou ignorent un email uniquement sur la base de l'objet. Maîtriser l'art de l'objet est donc crucial.

Un bon objet d'email respecte ces règles : moins de 50 caractères (idéalement 30-40), une promesse claire et spécifique, un sentiment d'urgence ou de curiosité sans être « clickbait ». Les chiffres fonctionnent bien (« 3 erreurs qui tuent vos ventes ») ainsi que les questions directes (« Avez-vous fait cette erreur ? »).

Le preheader (texte qui s'affiche après l'objet dans la boîte de réception) est votre deuxième chance de convaincre d'ouvrir. Ne le laissez jamais vide — par défaut, les clients email affichent les premiers mots du corps, souvent « Si vous ne voyez pas cet email... ». Utilisez le preheader pour compléter la promesse de l'objet.

Le CTA (Call-to-Action) doit être unique et visible. Un seul bouton par email, avec un verbe d'action à la première personne : « Je réserve ma place » fonctionne mieux que « Réserver ». Placez le CTA principal au-dessus de la ligne de flottaison (visible sans scroller) et répétez-le en fin d'email.

La structure gagnante d'un email marketing : accroche (1-2 phrases qui identifient un problème), développement (votre solution en 3-5 points), preuve sociale (témoignage ou chiffre), CTA clair. Évitez les emails de plus de 200 mots — vos lecteurs scannent, ils ne lisent pas.

Personnalisez au-delà du prénom : segmentez par comportement (a ouvert le dernier email, a cliqué, n'a pas ouvert depuis 30 jours) pour envoyer le bon message à la bonne personne.`
        },
        {
          id: 'contenu-pro-m3-l2',
          type: 'exercise',
          title: 'Créez une séquence de 3 emails',
          duration: '10 min',
          xpReward: 100,
          content: 'Mettez en pratique les techniques d\'email marketing apprises.',
          exercisePrompt: 'Créez une séquence de 3 emails avec l\'assistant IA. Email 1 (J+0) : bienvenue et présentation de votre offre. Email 2 (J+3) : étude de cas ou témoignage client. Email 3 (J+7) : offre spéciale avec urgence. Pour chaque email, rédigez : l\'objet (< 50 caractères), le preheader, le corps (< 200 mots) et le CTA.'
        },
        {
          id: 'contenu-pro-m3-l3',
          type: 'quiz',
          title: 'Quiz — Email marketing',
          duration: '10 min',
          xpReward: 150,
          content: 'Vérifiez vos connaissances en email marketing.',
          quizQuestions: [
            {
              question: 'Quel est le ROI moyen de l\'email marketing en 2026 ?',
              options: ['5€ pour 1€ investi', '15€ pour 1€ investi', '42€ pour 1€ investi', '100€ pour 1€ investi'],
              correctIndex: 2,
              explanation: 'L\'email marketing rapporte en moyenne 42€ pour chaque euro investi, ce qui en fait le canal digital avec le meilleur ROI.'
            },
            {
              question: 'Quelle longueur maximale est recommandée pour un objet d\'email ?',
              options: ['20 caractères', '30-50 caractères', '80 caractères', '120 caractères'],
              correctIndex: 1,
              explanation: 'Un objet de 30 à 50 caractères est optimal. Au-delà, il risque d\'être tronqué sur mobile.'
            },
            {
              question: 'Quel format de CTA fonctionne le mieux ?',
              options: ['« Cliquez ici »', '« En savoir plus »', '« Je réserve ma place »', '« Lien »'],
              correctIndex: 2,
              explanation: 'Un verbe d\'action à la première personne (« Je réserve ma place ») crée un engagement mental plus fort que les formulations impersonnelles.'
            }
          ]
        }
      ]
    },

    /* ── M4 : Répondre aux avis Google ── */
    {
      id: 'contenu-pro-m4',
      title: 'Répondre aux avis Google',
      emoji: '⭐',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m4-l1',
          type: 'text',
          title: 'Stratégie de réponse par note (1 à 5 étoiles)',
          duration: '10 min',
          xpReward: 50,
          content: `Les avis Google sont le premier facteur de décision pour 93% des consommateurs locaux. Répondre à chaque avis (positif ou négatif) améliore votre référencement local de 15% en moyenne et montre à vos prospects que vous êtes attentif.

Avis 5 étoiles : remerciez chaleureusement, mentionnez un détail spécifique de leur expérience pour montrer que vous avez lu, et invitez-les à revenir. Exemple : « Merci Marie ! Ravi que notre menu du jour vous ait plu. On vous attend pour découvrir notre nouvelle carte d'été ! »

Avis 4 étoiles : remerciez et demandez subtilement ce qui aurait pu rendre l'expérience parfaite. C'est une mine d'or pour l'amélioration continue. Exemple : « Merci pour ce retour positif ! Si vous avez une suggestion pour mériter la 5ème étoile, on est tout ouïe. »

Avis 3 étoiles : restez professionnel, reconnaissez les points positifs mentionnés et adressez les points négatifs avec une solution concrète. Proposez un contact direct (email ou téléphone) pour approfondir.

Avis 2 étoiles : empathie d'abord, excuses si justifié, solution concrète et invitation à redonner une chance. Ne soyez jamais défensif. Exemple : « Nous sommes désolés pour cette expérience. Nous avons pris des mesures correctives sur [point précis]. Contactez-nous au 01 XX XX XX XX pour qu'on puisse se rattraper. »

Avis 1 étoile : restez calme, ne vous justifiez jamais publiquement de manière agressive. Remerciez pour le retour, exprimez votre regret, proposez un contact privé. Si l'avis est faux ou diffamatoire, signalez-le à Google avec des preuves.

Règle d'or : répondez dans les 24 heures. Plus vous répondez vite, plus l'impact est positif sur votre image et votre référencement.`
        },
        {
          id: 'contenu-pro-m4-l2',
          type: 'exercise',
          title: 'Répondez à 3 avis fictifs',
          duration: '10 min',
          xpReward: 100,
          content: 'Entraînez-vous à répondre à des avis Google de différentes notes.',
          exercisePrompt: 'Répondez à ces 3 avis fictifs en utilisant l\'assistant IA et les stratégies apprises :\n\nAvis 1 (⭐⭐⭐⭐⭐) : « Super restaurant, le personnel est adorable et la cuisine excellente. On reviendra ! — Sophie »\n\nAvis 2 (⭐⭐⭐) : « Bonne cuisine mais le service était un peu lent. La terrasse est agréable par contre. — Marc »\n\nAvis 3 (⭐) : « Attente de 45 minutes pour une pizza froide. Personnel désagréable. Plus jamais. — Thomas »\n\nPour chaque réponse, appliquez la stratégie adaptée à la note.'
        },
        {
          id: 'contenu-pro-m4-l3',
          type: 'quiz',
          title: 'Quiz — Avis Google',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur la gestion des avis Google.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de consommateurs consulte les avis Google avant un achat local ?',
              options: ['50%', '72%', '93%', '100%'],
              correctIndex: 2,
              explanation: '93% des consommateurs locaux consultent les avis Google avant de choisir un commerce ou un prestataire.'
            },
            {
              question: 'Comment répondre à un avis 1 étoile ?',
              options: ['Ignorer l\'avis', 'Se justifier publiquement en détail', 'Rester calme, exprimer du regret et proposer un contact privé', 'Demander la suppression de l\'avis'],
              correctIndex: 2,
              explanation: 'Face à un avis très négatif, restez calme, montrez de l\'empathie et proposez de résoudre le problème en privé. La justification agressive est contre-productive.'
            },
            {
              question: 'Dans quel délai faut-il idéalement répondre à un avis ?',
              options: ['1 heure', '24 heures', '1 semaine', 'Pas de délai important'],
              correctIndex: 1,
              explanation: 'Répondre dans les 24 heures montre votre réactivité et a un impact positif sur votre image et votre référencement local.'
            },
            {
              question: 'Faut-il répondre aux avis 5 étoiles ?',
              options: ['Non, ce n\'est pas nécessaire', 'Oui, avec un merci personnalisé', 'Seulement si le client a écrit un long commentaire', 'Non, cela semble forcé'],
              correctIndex: 1,
              explanation: 'Répondre à tous les avis, y compris les positifs, améliore votre référencement et fidélise vos clients. Personnalisez chaque réponse.'
            }
          ]
        }
      ]
    },

    /* ── M5 : Studio photo IA ── */
    {
      id: 'contenu-pro-m5',
      title: 'Studio photo IA',
      emoji: '🖼️',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m5-l1',
          type: 'text',
          title: 'Flux/schnell et l\'art du prompt visuel',
          duration: '10 min',
          xpReward: 50,
          content: `Freenzy utilise le modèle Flux/schnell de fal.ai pour générer des images professionnelles en quelques secondes. Ce modèle excelle dans les rendus photoréalistes, les illustrations business et les visuels marketing.

Le prompt (la description textuelle de l'image souhaitée) est la clé d'une bonne génération. Un prompt efficace suit la structure : sujet + style + ambiance + détails techniques. Par exemple : « Photo professionnelle d'une femme souriante dans un bureau moderne, style corporate, lumière naturelle douce, arrière-plan flou bokeh, haute résolution ».

Les mots-clés qui améliorent la qualité : « professional photography », « high resolution », « soft lighting », « clean background », « 4K quality ». Pour un rendu business, ajoutez « corporate style », « modern office », « minimalist design ».

Évitez les prompts vagues comme « une belle image ». Plus vous êtes spécifique, meilleur sera le résultat. Décrivez les couleurs, la composition, l'éclairage et le cadrage souhaités.

Le coût est de 8 crédits par image standard et 12 crédits en HD. La génération est synchrone : vous recevez le résultat en 3 à 8 secondes. Vous pouvez générer autant d'images que vous voulez et ne garder que les meilleures.

Cas d'usage professionnels : photos de profil LinkedIn, visuels pour posts réseaux sociaux, illustrations d'articles de blog, images de produits sur fond blanc, bannières email marketing, photos d'équipe fictives pour maquettes de sites web.`
        },
        {
          id: 'contenu-pro-m5-l2',
          type: 'exercise',
          title: 'Générez une image professionnelle',
          duration: '10 min',
          xpReward: 100,
          content: 'Utilisez le studio photo IA pour créer un visuel professionnel.',
          exercisePrompt: 'Générez une image professionnelle avec le studio photo IA de Freenzy. Rédigez un prompt détaillé en suivant la structure : sujet + style + ambiance + détails techniques. Essayez de créer un visuel utilisable pour votre activité (photo de profil, bannière, illustration produit...). Comparez le résultat avec votre prompt et ajustez si nécessaire.'
        },
        {
          id: 'contenu-pro-m5-l3',
          type: 'quiz',
          title: 'Quiz — Studio photo IA',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur la génération d\'images IA.',
          quizQuestions: [
            {
              question: 'Quel modèle utilise Freenzy pour la génération d\'images ?',
              options: ['DALL-E 3', 'Midjourney v6', 'Flux/schnell de fal.ai', 'Stable Diffusion XL'],
              correctIndex: 2,
              explanation: 'Freenzy utilise le modèle Flux/schnell de fal.ai, qui excelle dans les rendus photoréalistes et les visuels business.'
            },
            {
              question: 'Quelle est la structure recommandée pour un prompt efficace ?',
              options: ['Un seul mot-clé', 'Sujet + style + ambiance + détails techniques', 'Le plus long possible', 'Uniquement des adjectifs'],
              correctIndex: 1,
              explanation: 'Un prompt efficace suit la structure sujet + style + ambiance + détails techniques pour guider précisément la génération.'
            },
            {
              question: 'Combien de crédits coûte une image standard ?',
              options: ['2 crédits', '5 crédits', '8 crédits', '20 crédits'],
              correctIndex: 2,
              explanation: 'Une image standard coûte 8 crédits et une image HD coûte 12 crédits.'
            }
          ]
        }
      ]
    },

    /* ── M6 : Studio vidéo IA ── */
    {
      id: 'contenu-pro-m6',
      title: 'Studio vidéo IA',
      emoji: '🎬',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'contenu-pro-m6-l1',
          type: 'text',
          title: 'Avatars D-ID et projets vidéo',
          duration: '10 min',
          xpReward: 50,
          content: `La vidéo est le format roi du marketing digital en 2026. Freenzy intègre deux technologies complémentaires pour vous permettre de créer des vidéos professionnelles sans caméra ni compétence technique.

D-ID est la technologie d'avatars parlants. Vous fournissez une photo (la vôtre ou celle générée par le studio photo) et un script texte, et D-ID crée une vidéo où l'avatar parle naturellement avec des mouvements de lèvres synchronisés et des expressions faciales réalistes. Idéal pour les vidéos de présentation, les tutoriels et les messages personnalisés.

LTX Video de fal.ai permet de générer des séquences vidéo à partir de descriptions textuelles. Vous décrivez la scène souhaitée et le modèle produit un clip de quelques secondes. Ces clips peuvent être assemblés pour créer des vidéos marketing complètes.

Le coût est de 20 crédits par vidéo. La génération est asynchrone : vous lancez la création et êtes notifié quand elle est prête (généralement 1 à 3 minutes). Vos vidéos sont sauvegardées dans votre bibliothèque vidéo pour un accès ultérieur.

Les projets vidéo vous permettent de regrouper plusieurs clips sous un même nom de projet, facilitant l'organisation de vos créations. Vous pouvez créer des séries de vidéos thématiques pour vos réseaux sociaux ou votre site web.`
        },
        {
          id: 'contenu-pro-m6-l2',
          type: 'text',
          title: 'Édition et publication de vidéos',
          duration: '8 min',
          xpReward: 50,
          content: `Une fois vos vidéos générées, il est important de les optimiser avant publication. Chaque plateforme a ses formats et durées idéales.

Pour Instagram Reels et TikTok, le format vertical (9:16) est obligatoire. La durée optimale est de 15 à 30 secondes. Ajoutez des sous-titres — 85% des vidéos sur les réseaux sociaux sont regardées sans le son. Placez votre message clé dans les 3 premières secondes.

Pour LinkedIn, le format carré (1:1) ou horizontal (16:9) fonctionne. Les vidéos de 30 secondes à 2 minutes performent le mieux. Le ton doit rester professionnel mais humain. Les vidéos avec un visage humain (votre avatar D-ID) obtiennent 30% plus d'engagement.

Pour votre site web, privilégiez les vidéos courtes en autoplay (sans son) pour les bannières et les pages produit. Les témoignages clients en avatar D-ID ajoutent une touche de crédibilité sans nécessiter de tournage.

La bibliothèque vidéo de Freenzy vous permet de télécharger vos vidéos dans le format de votre choix. Organisez vos créations par projet pour retrouver facilement vos assets et les réutiliser dans différents contextes marketing.`
        },
        {
          id: 'contenu-pro-m6-l3',
          type: 'quiz',
          title: 'Quiz — Studio vidéo IA',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur la création vidéo IA.',
          quizQuestions: [
            {
              question: 'Quelle technologie Freenzy utilise-t-elle pour les avatars parlants ?',
              options: ['Runway ML', 'D-ID', 'Synthesia', 'HeyGen'],
              correctIndex: 1,
              explanation: 'D-ID est la technologie d\'avatars parlants intégrée dans Freenzy, créant des vidéos avec lèvres synchronisées à partir d\'une photo et d\'un script.'
            },
            {
              question: 'Quel pourcentage de vidéos sur les réseaux sociaux sont regardées sans son ?',
              options: ['25%', '50%', '85%', '95%'],
              correctIndex: 2,
              explanation: '85% des vidéos sur les réseaux sociaux sont regardées sans le son, d\'où l\'importance des sous-titres.'
            },
            {
              question: 'Combien de crédits coûte une génération vidéo ?',
              options: ['8 crédits', '12 crédits', '15 crédits', '20 crédits'],
              correctIndex: 3,
              explanation: 'La génération vidéo coûte 20 crédits, que ce soit via D-ID ou LTX Video.'
            }
          ]
        }
      ]
    }
  ]
};

/* ═══════════════════════════════════════════════════════════════
   PARCOURS 4 — Sécurité & RGPD
   ═══════════════════════════════════════════════════════════════ */

export const parcoursSecuriteRgpd: FormationParcours = {
  id: 'securite-rgpd',
  title: 'Sécurité & RGPD',
  emoji: '🔒',
  description: 'Comprenez le RGPD, protégez vos données personnelles et celles de vos clients, et mettez en place les bonnes pratiques de sécurité numérique.',
  category: 'competence',
  subcategory: 'securite',
  level: 'debutant',
  levelLabel: 'Débutant',
  diplomaTitle: 'IA Security Certified',
  diplomaSubtitle: 'Sécurité des données et conformité RGPD',
  totalDuration: '3h',
  totalXP: 1800,
  color: '#EF4444',
  available: true,
  comingSoon: false,
  modules: [
    /* ── M1 : RGPD les bases ── */
    {
      id: 'securite-rgpd-m1',
      title: 'RGPD : les bases',
      emoji: '📜',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m1-l1',
          type: 'text',
          title: 'Droits, obligations et sanctions',
          duration: '10 min',
          xpReward: 50,
          content: `Le Règlement Général sur la Protection des Données (RGPD), en vigueur depuis mai 2018, est le cadre juridique européen qui régit la collecte et le traitement des données personnelles. Toute entreprise qui traite des données de résidents européens doit s'y conformer, quelle que soit sa taille ou sa localisation.

Les droits des personnes sont au cœur du RGPD. Chaque individu dispose de huit droits fondamentaux : le droit d'accès (savoir quelles données sont collectées), le droit de rectification (corriger des données erronées), le droit à l'effacement (« droit à l'oubli »), le droit à la portabilité (récupérer ses données dans un format lisible), le droit d'opposition (refuser un traitement), le droit à la limitation (geler un traitement), le droit de ne pas être soumis à une décision automatisée et le droit d'être informé.

Les obligations des entreprises comprennent : tenir un registre des traitements, désigner un DPO (Délégué à la Protection des Données) si nécessaire, réaliser des analyses d'impact (DPIA) pour les traitements à risque, notifier les violations de données à la CNIL dans les 72 heures et obtenir un consentement explicite pour chaque finalité de traitement.

Les sanctions sont dissuasives : jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires mondial annuel, selon le montant le plus élevé. En 2025, la CNIL a infligé plus de 400 millions d'euros d'amendes en France. Les PME ne sont pas épargnées : des entreprises de 5 salariés ont reçu des sanctions de 50 000 à 150 000 euros.

Le RGPD n'est pas qu'une contrainte — c'est un avantage concurrentiel. Les consommateurs font davantage confiance aux entreprises transparentes sur l'utilisation de leurs données.`
        },
        {
          id: 'securite-rgpd-m1-l2',
          type: 'text',
          title: 'Les principes clés du RGPD',
          duration: '8 min',
          xpReward: 50,
          content: `Le RGPD repose sur six principes fondamentaux que tout professionnel doit connaître et appliquer au quotidien.

1. Licéité, loyauté et transparence : vous devez avoir une base légale pour traiter des données (consentement, contrat, obligation légale, intérêt légitime...) et informer clairement les personnes de ce que vous faites avec leurs données.

2. Limitation des finalités : les données ne peuvent être collectées que pour des finalités déterminées, explicites et légitimes. Si vous collectez un email pour une newsletter, vous ne pouvez pas l'utiliser pour du démarchage téléphonique sans nouveau consentement.

3. Minimisation des données : ne collectez que les données strictement nécessaires. Si vous n'avez pas besoin de la date de naissance pour un formulaire de contact, ne la demandez pas.

4. Exactitude : les données doivent être exactes et tenues à jour. Mettez en place des processus de mise à jour réguliers et permettez aux utilisateurs de corriger leurs informations.

5. Limitation de conservation : les données ne doivent pas être conservées au-delà de la durée nécessaire à la finalité du traitement. Définissez des durées de conservation pour chaque type de données et mettez en place des purges automatiques.

6. Intégrité et confidentialité : vous devez garantir la sécurité des données par des mesures techniques (chiffrement, contrôle d'accès) et organisationnelles (formation des employés, politiques internes).

Le principe d'accountability (responsabilité) oblige l'entreprise à pouvoir démontrer à tout moment sa conformité. Documentez tout : registre des traitements, analyses d'impact, consentements collectés, incidents signalés.`
        },
        {
          id: 'securite-rgpd-m1-l3',
          type: 'quiz',
          title: 'Quiz — RGPD les bases',
          duration: '10 min',
          xpReward: 150,
          content: 'Évaluez votre compréhension des fondamentaux du RGPD.',
          quizQuestions: [
            {
              question: 'Depuis quand le RGPD est-il en vigueur ?',
              options: ['Janvier 2016', 'Mai 2018', 'Janvier 2020', 'Mai 2022'],
              correctIndex: 1,
              explanation: 'Le RGPD est entré en vigueur le 25 mai 2018, après une période de transition de deux ans depuis son adoption en 2016.'
            },
            {
              question: 'Quel est le montant maximal d\'une amende RGPD ?',
              options: ['1 million d\'euros', '10 millions d\'euros ou 2% du CA', '20 millions d\'euros ou 4% du CA mondial', '50 millions d\'euros'],
              correctIndex: 2,
              explanation: 'Les sanctions peuvent atteindre 20 millions d\'euros ou 4% du chiffre d\'affaires mondial annuel, selon le montant le plus élevé.'
            },
            {
              question: 'Dans quel délai faut-il notifier une violation de données à la CNIL ?',
              options: ['24 heures', '48 heures', '72 heures', '7 jours'],
              correctIndex: 2,
              explanation: 'Les violations de données personnelles doivent être notifiées à l\'autorité de contrôle (CNIL en France) dans les 72 heures suivant leur découverte.'
            },
            {
              question: 'Quel principe impose de ne collecter que les données strictement nécessaires ?',
              options: ['Transparence', 'Minimisation des données', 'Accountability', 'Portabilité'],
              correctIndex: 1,
              explanation: 'Le principe de minimisation des données impose de ne collecter que les données strictement nécessaires à la finalité du traitement.'
            },
            {
              question: 'Le RGPD s\'applique-t-il aux entreprises situées hors de l\'UE ?',
              options: ['Non, uniquement aux entreprises européennes', 'Oui, si elles traitent des données de résidents européens', 'Seulement si elles ont un bureau en Europe', 'Non, sauf accord bilatéral'],
              correctIndex: 1,
              explanation: 'Le RGPD s\'applique à toute entreprise qui traite des données de résidents européens, quelle que soit sa localisation géographique.'
            }
          ]
        }
      ]
    },

    /* ── M2 : IA et données personnelles ── */
    {
      id: 'securite-rgpd-m2',
      title: 'IA et données personnelles',
      emoji: '🤖',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m2-l1',
          type: 'text',
          title: 'Ce que l\'IA stocke — et ce qu\'elle ne stocke pas',
          duration: '10 min',
          xpReward: 50,
          content: `L'utilisation de l'intelligence artificielle soulève des questions légitimes sur le traitement des données personnelles. Comprendre ce qui est stocké, traité et partagé est essentiel pour utiliser l'IA en toute conformité.

Chez Freenzy, les conversations avec les assistants IA ne sont pas utilisées pour entraîner les modèles. Les données sont traitées pour fournir une réponse, puis le contexte de conversation est géré selon vos paramètres de rétention. Les données sont hébergées exclusivement en Europe (Hetzner) pour garantir la conformité RGPD.

Ce que l'IA traite temporairement : le texte de votre message, le contexte de la conversation en cours, les métadonnées de session (horodatage, identifiant utilisateur). Ce traitement est nécessaire pour fournir le service et repose sur la base légale de l'exécution du contrat.

Ce que Freenzy stocke de manière persistante : votre profil utilisateur (nom, email, rôle), l'historique de consommation de crédits, les préférences de configuration et les documents que vous choisissez explicitement de sauvegarder.

Ce que Freenzy ne stocke PAS : les données bancaires complètes (gérées par Stripe en PCI-DSS), les conversations téléphoniques en clair (chiffrées AES-256), les données biométriques, les mots de passe en clair (hashés bcrypt).

La purge automatique supprime les données de session de plus de 90 jours. Vous pouvez demander la suppression complète de vos données à tout moment via votre espace personnel ou par email, conformément au droit à l'effacement du RGPD.

Les logs sont anonymisés : les informations personnelles identifiables (PII) sont masquées dans les journaux techniques pour éviter toute fuite accidentelle.`
        },
        {
          id: 'securite-rgpd-m2-l2',
          type: 'quiz',
          title: 'Quiz — IA et données',
          duration: '10 min',
          xpReward: 100,
          content: 'Vérifiez votre compréhension du traitement des données par l\'IA.',
          quizQuestions: [
            {
              question: 'Où sont hébergées les données de Freenzy ?',
              options: ['Aux États-Unis (AWS)', 'En Europe (Hetzner)', 'En Asie (Alibaba Cloud)', 'Partout dans le monde (CDN)'],
              correctIndex: 1,
              explanation: 'Les données Freenzy sont hébergées exclusivement en Europe chez Hetzner pour garantir la conformité RGPD.'
            },
            {
              question: 'Les conversations IA sont-elles utilisées pour entraîner les modèles ?',
              options: ['Oui, systématiquement', 'Oui, sauf si vous refusez', 'Non, jamais chez Freenzy', 'Uniquement les conversations anonymisées'],
              correctIndex: 2,
              explanation: 'Chez Freenzy, les conversations avec les assistants IA ne sont jamais utilisées pour entraîner les modèles.'
            },
            {
              question: 'Après combien de jours les données de session sont-elles automatiquement purgées ?',
              options: ['30 jours', '60 jours', '90 jours', '365 jours'],
              correctIndex: 2,
              explanation: 'La purge automatique supprime les données de session de plus de 90 jours.'
            },
            {
              question: 'Comment les mots de passe sont-ils stockés ?',
              options: ['En clair dans la base de données', 'Chiffrés AES-256', 'Hashés avec bcrypt', 'Sur un fichier séparé'],
              correctIndex: 2,
              explanation: 'Les mots de passe sont hashés avec bcrypt, ce qui signifie qu\'ils ne sont jamais stockés en clair et ne peuvent pas être récupérés, seulement vérifiés.'
            }
          ]
        },
        {
          id: 'securite-rgpd-m2-l3',
          type: 'game',
          title: 'Jeu — Types de données et catégories RGPD',
          duration: '10 min',
          xpReward: 150,
          content: 'Associez chaque type de donnée à sa catégorie RGPD.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Adresse email professionnelle', right: 'Donnée d\'identification' },
              { left: 'Numéro de carte bancaire', right: 'Donnée financière sensible' },
              { left: 'Adresse IP de connexion', right: 'Donnée technique indirecte' },
              { left: 'Historique médical', right: 'Donnée de santé (sensible)' },
              { left: 'Opinion politique exprimée', right: 'Donnée sensible (art. 9)' },
              { left: 'Photo de profil', right: 'Donnée biométrique potentielle' }
            ]
          }
        }
      ]
    },

    /* ── M3 : Protéger son entreprise ── */
    {
      id: 'securite-rgpd-m3',
      title: 'Protéger son entreprise',
      emoji: '🛡️',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m3-l1',
          type: 'text',
          title: 'Mots de passe, 2FA et chiffrement',
          duration: '10 min',
          xpReward: 50,
          content: `La sécurité de votre entreprise commence par trois piliers fondamentaux : des mots de passe solides, l'authentification à deux facteurs et le chiffrement des données sensibles.

Les mots de passe restent la première ligne de défense. Un mot de passe fort en 2026 fait au minimum 12 caractères et mélange majuscules, minuscules, chiffres et caractères spéciaux. Mais la longueur prime sur la complexité : « MonChienAdore-LesPizza$2026 » est plus sûr que « Xk9#mQ ». Utilisez un gestionnaire de mots de passe (Bitwarden, 1Password) pour ne retenir qu'un seul mot de passe maître.

Ne réutilisez JAMAIS un mot de passe. Si un service est compromis (et ça arrive — vérifiez sur haveibeenpwned.com), tous vos comptes avec le même mot de passe sont exposés. Les gestionnaires de mots de passe génèrent et stockent des mots de passe uniques pour chaque service.

L'authentification à deux facteurs (2FA) ajoute une couche de sécurité cruciale. Même si votre mot de passe est volé, le pirate ne peut pas accéder à votre compte sans le second facteur. Freenzy intègre la 2FA TOTP (Time-based One-Time Password) : vous scannez un QR code avec une application comme Google Authenticator ou Authy, qui génère un code à 6 chiffres renouvelé toutes les 30 secondes.

Le chiffrement protège vos données en transit et au repos. Freenzy utilise AES-256, le standard militaire, pour chiffrer les données sensibles (conversations téléphoniques, documents confidentiels). En transit, toutes les communications utilisent TLS 1.3 (le cadenas dans votre navigateur).

Activez la 2FA sur TOUS vos comptes critiques : email, banque, réseaux sociaux, outils métier. C'est la mesure de sécurité la plus efficace par rapport à l'effort requis.`
        },
        {
          id: 'securite-rgpd-m3-l2',
          type: 'exercise',
          title: 'Activez la 2FA sur votre compte',
          duration: '10 min',
          xpReward: 100,
          content: 'Mettez en pratique la sécurisation de votre compte Freenzy.',
          exercisePrompt: 'Activez la 2FA sur votre compte Freenzy en suivant ces étapes :\n1. Allez dans les paramètres de sécurité de votre compte\n2. Cliquez sur « Activer la 2FA »\n3. Scannez le QR code avec Google Authenticator ou Authy\n4. Entrez le code à 6 chiffres pour confirmer\n5. Sauvegardez vos codes de récupération dans un endroit sûr\n\nSi vous n\'avez pas encore d\'application d\'authentification, installez Google Authenticator (gratuit) sur votre smartphone.'
        },
        {
          id: 'securite-rgpd-m3-l3',
          type: 'quiz',
          title: 'Quiz — Protection entreprise',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur la protection de votre entreprise.',
          quizQuestions: [
            {
              question: 'Quelle est la longueur minimale recommandée pour un mot de passe en 2026 ?',
              options: ['6 caractères', '8 caractères', '12 caractères', '20 caractères'],
              correctIndex: 2,
              explanation: 'Un mot de passe solide fait au minimum 12 caractères. La longueur est le facteur le plus important pour résister aux attaques par force brute.'
            },
            {
              question: 'Que signifie 2FA ?',
              options: ['Two-Factor Authentication', 'Two-File Access', 'Twice-Fired Alert', 'Two-Frequency Analysis'],
              correctIndex: 0,
              explanation: '2FA signifie Two-Factor Authentication (authentification à deux facteurs), une méthode qui requiert deux preuves d\'identité distinctes.'
            },
            {
              question: 'Quel standard de chiffrement utilise Freenzy ?',
              options: ['DES-56', 'AES-128', 'AES-256', 'RSA-1024'],
              correctIndex: 2,
              explanation: 'Freenzy utilise AES-256, le standard de chiffrement le plus robuste, utilisé notamment par les organisations militaires.'
            },
            {
              question: 'Pourquoi ne faut-il jamais réutiliser un mot de passe ?',
              options: ['C\'est interdit par la loi', 'Si un service est compromis, tous vos comptes le sont', 'Les navigateurs ne le permettent pas', 'Cela ralentit la connexion'],
              correctIndex: 1,
              explanation: 'Si un service est piraté et que vous utilisez le même mot de passe ailleurs, le pirate peut accéder à tous vos autres comptes par « credential stuffing ».'
            }
          ]
        }
      ]
    },

    /* ── M4 : Obligations légales ── */
    {
      id: 'securite-rgpd-m4',
      title: 'Obligations légales',
      emoji: '⚖️',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m4-l1',
          type: 'text',
          title: 'CGU, mentions légales et cookies',
          duration: '10 min',
          xpReward: 50,
          content: `Tout site web professionnel en Europe doit respecter un ensemble d'obligations légales. Le non-respect de ces obligations expose à des sanctions financières et nuit à la crédibilité de votre entreprise.

Les mentions légales sont obligatoires pour tout site web professionnel (loi LCEN en France). Elles doivent inclure : la raison sociale de l'entreprise, l'adresse du siège social, le numéro d'immatriculation (RCS, SIRET), le nom du directeur de publication, les coordonnées de l'hébergeur et un moyen de contact (email ou formulaire).

Les Conditions Générales d'Utilisation (CGU) définissent les règles d'utilisation de votre service. Bien qu'elles ne soient pas strictement obligatoires, elles sont indispensables pour vous protéger juridiquement. Elles doivent couvrir : l'objet du service, les conditions d'accès, la propriété intellectuelle, la responsabilité, les modalités de résiliation et la loi applicable.

Les Conditions Générales de Vente (CGV) sont obligatoires pour tout site de e-commerce. Elles doivent préciser : les prix, les modalités de paiement, les délais de livraison, le droit de rétractation (14 jours), les garanties légales et le service après-vente.

La politique de cookies est devenue un sujet majeur depuis les directives ePrivacy. Vous devez : informer l'utilisateur des cookies utilisés, obtenir un consentement explicite AVANT de déposer des cookies non essentiels, permettre un refus aussi simple que l'acceptation et conserver la preuve du consentement. Les cookies strictement nécessaires (authentification, panier) ne requièrent pas de consentement. Les cookies analytiques et publicitaires oui.

Utilisez une plateforme de gestion du consentement (CMP) comme Tarteaucitron ou Cookiebot pour automatiser la conformité.`
        },
        {
          id: 'securite-rgpd-m4-l2',
          type: 'text',
          title: 'Exigences de la CNIL',
          duration: '8 min',
          xpReward: 50,
          content: `La CNIL (Commission Nationale de l'Informatique et des Libertés) est l'autorité française de protection des données. Elle contrôle la conformité des entreprises et dispose de pouvoirs de sanction importants. Voici ses exigences principales.

Le registre des traitements est obligatoire pour toute entreprise de plus de 250 salariés, mais la CNIL le recommande fortement pour toutes les entreprises. Ce document recense tous les traitements de données personnelles : finalité, catégories de données, destinataires, durées de conservation et mesures de sécurité.

L'analyse d'impact (DPIA — Data Protection Impact Assessment) est obligatoire pour les traitements présentant un risque élevé pour les droits des personnes. C'est le cas de la vidéosurveillance, du profilage, du traitement de données sensibles à grande échelle ou de l'utilisation de nouvelles technologies comme l'IA.

La désignation d'un DPO (Délégué à la Protection des Données) est obligatoire pour les organismes publics, les entreprises dont l'activité principale implique un suivi régulier et systématique des personnes et les entreprises traitant des données sensibles à grande échelle. Même si vous n'êtes pas obligé, nommer un référent RGPD interne est une bonne pratique.

En cas de contrôle de la CNIL, vous devez pouvoir présenter : votre registre des traitements, vos analyses d'impact, les preuves de consentement, votre politique de sécurité, les contrats avec vos sous-traitants (clause RGPD) et la procédure de notification des violations.

La CNIL publie régulièrement des référentiels sectoriels (santé, RH, commerce...) qui détaillent les bonnes pratiques par domaine. Consultez-les sur cnil.fr.`
        },
        {
          id: 'securite-rgpd-m4-l3',
          type: 'quiz',
          title: 'Quiz — Obligations légales',
          duration: '10 min',
          xpReward: 150,
          content: 'Vérifiez vos connaissances sur les obligations légales du numérique.',
          quizQuestions: [
            {
              question: 'Les mentions légales sont-elles obligatoires sur un site web professionnel ?',
              options: ['Non, c\'est facultatif', 'Oui, pour tous les sites professionnels', 'Seulement pour les sites e-commerce', 'Seulement pour les entreprises de plus de 50 salariés'],
              correctIndex: 1,
              explanation: 'Les mentions légales sont obligatoires pour tout site web professionnel en vertu de la loi LCEN (Loi pour la Confiance dans l\'Économie Numérique).'
            },
            {
              question: 'Quel est le délai de rétractation légal pour un achat en ligne ?',
              options: ['7 jours', '14 jours', '30 jours', '60 jours'],
              correctIndex: 1,
              explanation: 'Le droit de rétractation pour un achat en ligne est de 14 jours à compter de la réception du produit, conformément à la directive européenne.'
            },
            {
              question: 'Quels cookies nécessitent un consentement explicite ?',
              options: ['Tous les cookies sans exception', 'Les cookies analytiques et publicitaires', 'Uniquement les cookies de réseaux sociaux', 'Aucun, le consentement n\'est plus requis'],
              correctIndex: 1,
              explanation: 'Les cookies strictement nécessaires (authentification, panier) ne requièrent pas de consentement. Les cookies analytiques, publicitaires et de réseaux sociaux nécessitent un consentement explicite.'
            },
            {
              question: 'Qu\'est-ce qu\'un DPO ?',
              options: ['Data Processing Officer', 'Digital Privacy Operator', 'Délégué à la Protection des Données', 'Director of Public Operations'],
              correctIndex: 2,
              explanation: 'Le DPO (Data Protection Officer) est le Délégué à la Protection des Données, chargé de veiller à la conformité RGPD de l\'organisation.'
            }
          ]
        }
      ]
    },

    /* ── M5 : Bonnes pratiques quotidiennes ── */
    {
      id: 'securite-rgpd-m5',
      title: 'Bonnes pratiques quotidiennes',
      emoji: '✅',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m5-l1',
          type: 'text',
          title: 'Sécurité email, partage de fichiers et cloud',
          duration: '10 min',
          xpReward: 50,
          content: `Les cyberattaques ciblent principalement les employés, pas les serveurs. 91% des violations de données commencent par un email de phishing. Les bonnes pratiques quotidiennes sont votre meilleure défense.

Sécurité email : ne cliquez jamais sur un lien dans un email inattendu. Vérifiez l'adresse de l'expéditeur (pas seulement le nom affiché — survolez pour voir l'adresse réelle). Les banques et administrations ne demandent jamais vos identifiants par email. En cas de doute, contactez l'expéditeur présumé par un autre canal (téléphone, site officiel).

Les emails contenant des pièces jointes .exe, .scr, .zip protégés par mot de passe ou .doc avec macros sont les plus dangereux. Configurez votre client email pour ne pas télécharger automatiquement les images (elles peuvent contenir des trackers). Utilisez un filtre anti-spam professionnel.

Partage de fichiers : ne partagez jamais de documents sensibles par email non chiffré. Utilisez des plateformes sécurisées avec des liens à expiration et des mots de passe. Vérifiez les permissions de partage : « tout le monde avec le lien » est rarement nécessaire — préférez « personnes spécifiques ».

Cloud et stockage : activez le chiffrement au repos sur tous vos services cloud. Configurez des sauvegardes automatiques (règle du 3-2-1 : 3 copies, 2 supports différents, 1 hors site). Auditez régulièrement les applications tierces connectées à vos comptes cloud — désactivez celles que vous n'utilisez plus.

Réseau : utilisez un VPN sur les réseaux Wi-Fi publics (hôtels, cafés, aéroports). Désactivez le Wi-Fi et le Bluetooth quand vous ne les utilisez pas. Mettez à jour vos appareils et logiciels dès qu'un correctif de sécurité est disponible.`
        },
        {
          id: 'securite-rgpd-m5-l2',
          type: 'game',
          title: 'Jeu — Classez les mesures de sécurité par priorité',
          duration: '10 min',
          xpReward: 100,
          content: 'Classez ces mesures de sécurité de la plus prioritaire à la moins prioritaire pour une PME.',
          gameType: 'ordering',
          gameData: {
            items: [
              { id: 'pwd', label: 'Activer la 2FA sur tous les comptes critiques', correctPosition: 1 },
              { id: 'backup', label: 'Mettre en place des sauvegardes automatiques', correctPosition: 2 },
              { id: 'update', label: 'Automatiser les mises à jour de sécurité', correctPosition: 3 },
              { id: 'train', label: 'Former les employés au phishing', correctPosition: 4 },
              { id: 'audit', label: 'Auditer les permissions des applications tierces', correctPosition: 5 },
              { id: 'vpn', label: 'Déployer un VPN pour les déplacements', correctPosition: 6 }
            ]
          }
        },
        {
          id: 'securite-rgpd-m5-l3',
          type: 'quiz',
          title: 'Quiz — Bonnes pratiques',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos réflexes de sécurité au quotidien.',
          quizQuestions: [
            {
              question: 'Quel pourcentage des violations de données commence par un email de phishing ?',
              options: ['45%', '68%', '91%', '99%'],
              correctIndex: 2,
              explanation: '91% des violations de données commencent par un email de phishing, ce qui en fait le vecteur d\'attaque numéro un.'
            },
            {
              question: 'Quelle est la règle de sauvegarde 3-2-1 ?',
              options: ['3 mots de passe, 2 emails, 1 téléphone', '3 copies, 2 supports différents, 1 hors site', '3 jours, 2 sauvegardes, 1 test', '3 serveurs, 2 clouds, 1 local'],
              correctIndex: 1,
              explanation: 'La règle 3-2-1 préconise 3 copies de vos données, sur 2 supports de stockage différents, dont 1 copie hors site (cloud ou local distant).'
            },
            {
              question: 'Que faire si vous recevez un email suspect de votre banque ?',
              options: ['Cliquer sur le lien pour vérifier', 'Répondre pour demander confirmation', 'Contacter la banque par un autre canal', 'Transférer l\'email à un collègue'],
              correctIndex: 2,
              explanation: 'Ne cliquez jamais sur un lien suspect. Contactez votre banque directement par téléphone ou via son site officiel pour vérifier la légitimité du message.'
            }
          ]
        }
      ]
    },

    /* ── M6 : Audit de sécurité ── */
    {
      id: 'securite-rgpd-m6',
      title: 'Audit de sécurité',
      emoji: '🔍',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'securite-rgpd-m6-l1',
          type: 'text',
          title: 'Checklist de sécurité complète',
          duration: '10 min',
          xpReward: 50,
          content: `Un audit de sécurité régulier est indispensable pour identifier les vulnérabilités avant qu'elles ne soient exploitées. Voici une checklist complète pour évaluer la sécurité de votre entreprise.

Authentification et accès : tous les comptes critiques ont-ils la 2FA activée ? Les mots de passe font-ils plus de 12 caractères et sont-ils uniques ? Les ex-employés ont-ils été désactivés de tous les systèmes ? Les droits d'accès suivent-ils le principe du moindre privilège (chaque personne n'a accès qu'à ce dont elle a besoin) ?

Données et stockage : les données sensibles sont-elles chiffrées au repos et en transit ? Les sauvegardes sont-elles effectuées automatiquement et testées régulièrement ? La durée de conservation est-elle définie et respectée pour chaque type de données ? Les purges automatiques sont-elles configurées ?

Réseau et infrastructure : les pare-feu sont-ils configurés et à jour ? Les certificats SSL/TLS sont-ils valides et renouvelés automatiquement ? Les logiciels et systèmes d'exploitation sont-ils à jour ? Un monitoring des intrusions est-il en place ?

Conformité RGPD : le registre des traitements est-il à jour ? Les consentements sont-ils collectés et stockés correctement ? La politique de confidentialité est-elle accessible et complète ? Une procédure de notification des violations est-elle documentée ?

Applications tierces : quelles applications ont accès à vos données ? Les permissions sont-elles justifiées et minimales ? Les contrats incluent-ils des clauses RGPD ? Les API keys sont-elles stockées de manière sécurisée (jamais dans le code source) ?

Facteur humain : les employés sont-ils formés aux risques de phishing ? Une politique de sécurité interne est-elle écrite et diffusée ? Des exercices de simulation d'attaque sont-ils réalisés ? Un canal de signalement des incidents existe-t-il ?`
        },
        {
          id: 'securite-rgpd-m6-l2',
          type: 'exercise',
          title: 'Faites votre propre audit de sécurité',
          duration: '10 min',
          xpReward: 100,
          content: 'Évaluez la sécurité de votre propre environnement numérique.',
          exercisePrompt: 'Réalisez un mini-audit de sécurité de votre environnement numérique avec l\'assistant IA. Répondez honnêtement à ces questions et l\'assistant vous donnera un score et des recommandations personnalisées :\n\n1. Utilisez-vous un gestionnaire de mots de passe ?\n2. La 2FA est-elle activée sur votre email principal ?\n3. Quand avez-vous changé vos mots de passe pour la dernière fois ?\n4. Avez-vous vérifié haveibeenpwned.com récemment ?\n5. Vos sauvegardes sont-elles automatiques ?\n6. Vos logiciels sont-ils à jour ?\n7. Utilisez-vous un VPN sur les Wi-Fi publics ?\n8. Vos employés sont-ils formés au phishing ?'
        },
        {
          id: 'securite-rgpd-m6-l3',
          type: 'quiz',
          title: 'Quiz — Audit de sécurité',
          duration: '10 min',
          xpReward: 150,
          content: 'Quiz final sur l\'audit de sécurité.',
          quizQuestions: [
            {
              question: 'Quel principe guide les droits d\'accès dans une entreprise sécurisée ?',
              options: ['Tout le monde a accès à tout', 'Le principe du moindre privilège', 'Les managers ont tous les accès', 'L\'accès est basé sur l\'ancienneté'],
              correctIndex: 1,
              explanation: 'Le principe du moindre privilège impose que chaque personne n\'ait accès qu\'aux données et systèmes strictement nécessaires à sa fonction.'
            },
            {
              question: 'Où ne faut-il JAMAIS stocker des clés API ?',
              options: ['Dans un gestionnaire de secrets', 'Dans des variables d\'environnement', 'Directement dans le code source', 'Dans un coffre-fort numérique'],
              correctIndex: 2,
              explanation: 'Les clés API ne doivent jamais être stockées dans le code source (risque de fuite via Git). Utilisez des variables d\'environnement ou un gestionnaire de secrets.'
            },
            {
              question: 'À quelle fréquence faut-il tester ses sauvegardes ?',
              options: ['Jamais, si elles sont automatiques', 'Une fois par an', 'Au moins une fois par trimestre', 'Seulement après un incident'],
              correctIndex: 2,
              explanation: 'Les sauvegardes doivent être testées au moins une fois par trimestre. Une sauvegarde non testée est potentiellement inutilisable le jour où vous en avez besoin.'
            },
            {
              question: 'Que faut-il faire quand un employé quitte l\'entreprise ?',
              options: ['Rien de spécial', 'Désactiver ses accès sous 30 jours', 'Désactiver immédiatement tous ses accès à tous les systèmes', 'Changer uniquement le mot de passe Wi-Fi'],
              correctIndex: 2,
              explanation: 'Les accès d\'un ex-employé doivent être désactivés immédiatement sur tous les systèmes pour éviter tout risque d\'accès non autorisé.'
            },
            {
              question: 'Quel est l\'intérêt d\'un exercice de simulation de phishing ?',
              options: ['Piéger les employés pour les sanctionner', 'Identifier les vulnérabilités humaines et former l\'équipe', 'Tester la bande passante réseau', 'Vérifier les pare-feu'],
              correctIndex: 1,
              explanation: 'Les simulations de phishing permettent d\'identifier les employés vulnérables et de les former de manière concrète, sans conséquence réelle.'
            }
          ]
        }
      ]
    }
  ]
};

/* ═══════════════════════════════════════════════════════════════
   PARCOURS 5 — Maîtriser les assistants
   ═══════════════════════════════════════════════════════════════ */

export const parcoursMaitriserAssistants: FormationParcours = {
  id: 'maitriser-assistants',
  title: 'Maîtriser les assistants',
  emoji: '🚀',
  description: 'Devenez un Power User Freenzy : exploitez les 100+ assistants, le studio créatif, les discussions profondes, l\'arcade et les automatisations.',
  category: 'competence',
  subcategory: 'freenzy',
  level: 'intermediaire',
  levelLabel: 'Intermédiaire',
  diplomaTitle: 'Freenzy Power User',
  diplomaSubtitle: 'Maîtrise avancée de la plateforme Freenzy',
  totalDuration: '3h',
  totalXP: 1800,
  color: '#8B5CF6',
  available: true,
  comingSoon: false,
  modules: [
    /* ── M1 : Les 12 assistants business ── */
    {
      id: 'maitriser-assistants-m1',
      title: 'Les 12 assistants business',
      emoji: '💼',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m1-l1',
          type: 'text',
          title: 'Vue d\'ensemble des assistants business',
          duration: '10 min',
          xpReward: 50,
          content: `Freenzy met à votre disposition 12 assistants business spécialisés, chacun expert dans un domaine précis de la gestion d'entreprise. Comprendre leurs forces vous permet de déléguer efficacement.

L'assistant Commercial (fz-commercial) gère votre pipeline de ventes : prospection, qualification de leads, suivi des opportunités et relances automatiques. Il rédige des propositions commerciales personnalisées et analyse vos taux de conversion.

L'assistant Marketing (fz-marketing) crée des stratégies multicanales, rédige du contenu optimisé SEO, planifie des campagnes publicitaires et analyse les performances de vos actions marketing.

L'assistant Communication (fz-communication) gère votre image de marque : communiqués de presse, réponses aux avis, gestion de crise, storytelling d'entreprise et relations presse.

L'assistant Comptabilité (fz-comptabilite) suit vos finances : facturation, suivi des paiements, rapprochements bancaires, préparation des déclarations et alertes de trésorerie.

L'assistant Juridique (fz-juridique) rédige et analyse des contrats, vérifie la conformité RGPD, répond aux questions légales courantes et prépare des CGU/CGV.

L'assistant RH (fz-rh) gère le recrutement, l'onboarding, les entretiens annuels, la gestion des congés et la veille sur le droit du travail.

L'assistant Répondeur (fz-repondeur) traite les appels entrants, qualifie les demandes, prend des messages structurés et transfère les urgences. Il fonctionne 24h/24 avec la voix George d'ElevenLabs.

Les assistants Logistique, Achats, Qualité, Stratégie et Direction générale complètent l'écosystème pour couvrir 100% des fonctions d'une entreprise moderne. Chaque assistant peut collaborer avec les autres pour des tâches transversales.`
        },
        {
          id: 'maitriser-assistants-m1-l2',
          type: 'text',
          title: 'Quand utiliser quel assistant',
          duration: '8 min',
          xpReward: 50,
          content: `Choisir le bon assistant pour la bonne tâche est la clé pour obtenir des résultats optimaux. Voici un guide de décision rapide par situation.

Vous recevez un appel d'un prospect → Assistant Répondeur (fz-repondeur) pour qualifier la demande, puis Assistant Commercial (fz-commercial) pour le suivi et la proposition.

Vous devez créer du contenu pour vos réseaux sociaux → Assistant Marketing (fz-marketing) pour la stratégie et le calendrier éditorial, puis le Studio Créatif pour les visuels.

Un client laisse un avis négatif → Assistant Communication (fz-communication) pour rédiger une réponse empathique et professionnelle adaptée au contexte.

Vous devez recruter un nouveau collaborateur → Assistant RH (fz-rh) pour rédiger l'offre d'emploi, filtrer les CV et préparer les questions d'entretien.

Vous avez une question sur un contrat → Assistant Juridique (fz-juridique) pour analyser les clauses, identifier les risques et proposer des modifications.

Vous préparez votre bilan trimestriel → Assistant Comptabilité (fz-comptabilite) pour les chiffres et l'analyse financière, puis Assistant Direction (fz-dg) pour la synthèse stratégique.

Le système de routage intelligent de Freenzy utilise trois niveaux de traitement : L1 (Haiku) pour les tâches rapides et répétitives, L2 (Sonnet) pour la rédaction et l'analyse approfondie, L3 (Opus) pour la stratégie et les décisions complexes avec Extended Thinking. Le bon niveau est sélectionné automatiquement selon la complexité de votre demande.

Astuce : vous pouvez mentionner plusieurs assistants dans une même conversation. Freenzy orchestre la collaboration entre eux de manière transparente.`
        },
        {
          id: 'maitriser-assistants-m1-l3',
          type: 'quiz',
          title: 'Quiz — Quel assistant pour quelle tâche ?',
          duration: '10 min',
          xpReward: 150,
          content: 'Associez chaque situation au bon assistant.',
          quizQuestions: [
            {
              question: 'Quel assistant utiliser pour rédiger une proposition commerciale ?',
              options: ['fz-marketing', 'fz-commercial', 'fz-communication', 'fz-juridique'],
              correctIndex: 1,
              explanation: 'L\'assistant Commercial (fz-commercial) est spécialisé dans la vente : prospection, propositions, suivi des opportunités et relances.'
            },
            {
              question: 'Quel assistant gère les appels entrants 24h/24 ?',
              options: ['fz-assistante', 'fz-communication', 'fz-repondeur', 'fz-commercial'],
              correctIndex: 2,
              explanation: 'L\'assistant Répondeur (fz-repondeur) traite les appels entrants en continu avec la voix George d\'ElevenLabs, qualifie les demandes et prend des messages.'
            },
            {
              question: 'Pour une analyse de conformité RGPD, quel assistant solliciter ?',
              options: ['fz-rh', 'fz-qualite', 'fz-juridique', 'fz-comptabilite'],
              correctIndex: 2,
              explanation: 'L\'assistant Juridique (fz-juridique) est compétent en conformité RGPD, analyse de contrats et questions légales courantes.'
            },
            {
              question: 'Quel niveau de traitement est utilisé pour les décisions stratégiques complexes ?',
              options: ['L1 — Haiku', 'L2 — Sonnet', 'L3 — Opus', 'L4 — GPT'],
              correctIndex: 2,
              explanation: 'Le niveau L3 utilise Opus avec Extended Thinking pour les tâches stratégiques et les décisions complexes nécessitant une réflexion approfondie.'
            },
            {
              question: 'Peut-on solliciter plusieurs assistants dans une même conversation ?',
              options: ['Non, un seul assistant par conversation', 'Oui, mais cela coûte le double de crédits', 'Oui, Freenzy orchestre la collaboration automatiquement', 'Seulement en mode premium'],
              correctIndex: 2,
              explanation: 'Freenzy orchestre la collaboration entre assistants de manière transparente. Vous pouvez mentionner plusieurs assistants dans une même conversation.'
            }
          ]
        }
      ]
    },

    /* ── M2 : Les 12 assistants personnels ── */
    {
      id: 'maitriser-assistants-m2',
      title: 'Les 12 assistants personnels',
      emoji: '👤',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m2-l1',
          type: 'text',
          title: 'Vue d\'ensemble des assistants personnels',
          duration: '10 min',
          xpReward: 50,
          content: `Au-delà des assistants business, Freenzy propose des assistants personnels conçus pour améliorer votre vie quotidienne, votre bien-être et votre développement personnel.

L'assistant Réveil Intelligent vous réveille chaque matin avec un briefing personnalisé : météo, actualités de votre secteur, rappels de la journée, citation motivante et musique adaptée à votre humeur. Il propose 8 modes de réveil et 18 rubriques personnalisables.

L'assistant Coach de Vie vous accompagne dans la définition et le suivi de vos objectifs personnels : santé, sport, alimentation, méditation, lectures. Il adapte ses conseils à votre profil et vos progrès.

L'assistant Nutrition élabore des plans alimentaires personnalisés selon vos objectifs (perte de poids, prise de masse, rééquilibrage), vos allergies et vos préférences culinaires. Il génère des listes de courses et des recettes détaillées.

L'assistant Fitness crée des programmes d'entraînement adaptés à votre niveau, votre équipement disponible et vos objectifs. Il s'ajuste en fonction de votre progression et de vos retours.

L'assistant Finances Personnelles suit votre budget, analyse vos dépenses, propose des optimisations et vous alerte en cas de dépassement. Il simplifie la gestion de votre patrimoine personnel.

L'assistant Voyage planifie vos voyages de A à Z : vols, hébergements, itinéraires, restaurants, activités culturelles. Il tient compte de votre budget, de vos centres d'intérêt et de la saison.

Les assistants Culture, Langues, Éducation, Relations, Productivité et Bien-être complètent cette suite personnelle pour couvrir tous les aspects de votre vie en dehors du travail. Chaque assistant apprend de vos interactions pour devenir de plus en plus pertinent.`
        },
        {
          id: 'maitriser-assistants-m2-l2',
          type: 'exercise',
          title: 'Testez 3 assistants personnels',
          duration: '10 min',
          xpReward: 100,
          content: 'Expérimentez avec les assistants personnels de Freenzy.',
          exercisePrompt: 'Testez 3 assistants personnels de Freenzy parmi ceux présentés dans la leçon :\n\n1. Demandez à l\'assistant Nutrition de créer un plan de repas pour une journée selon vos préférences\n2. Demandez à l\'assistant Voyage de planifier un week-end dans une ville de votre choix avec un budget de 500€\n3. Demandez à l\'assistant Coach de Vie de vous aider à définir 3 objectifs SMART pour le mois prochain\n\nComparez la qualité et la pertinence des réponses. Notez ce qui vous a surpris positivement et ce qui pourrait être amélioré.'
        },
        {
          id: 'maitriser-assistants-m2-l3',
          type: 'quiz',
          title: 'Quiz — Assistants personnels',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur les assistants personnels.',
          quizQuestions: [
            {
              question: 'Combien de modes de réveil propose l\'assistant Réveil Intelligent ?',
              options: ['3 modes', '5 modes', '8 modes', '12 modes'],
              correctIndex: 2,
              explanation: 'L\'assistant Réveil Intelligent propose 8 modes de réveil différents et 18 rubriques personnalisables pour votre briefing matinal.'
            },
            {
              question: 'Quel assistant vous aide à gérer votre budget personnel ?',
              options: ['fz-comptabilite', 'Finances Personnelles', 'Coach de Vie', 'Productivité'],
              correctIndex: 1,
              explanation: 'L\'assistant Finances Personnelles est dédié à votre budget personnel, tandis que fz-comptabilite est l\'assistant business pour la comptabilité d\'entreprise.'
            },
            {
              question: 'Les assistants personnels apprennent-ils de vos interactions ?',
              options: ['Non, chaque conversation repart de zéro', 'Oui, ils deviennent plus pertinents avec le temps', 'Seulement en mode premium', 'Seulement après 100 interactions'],
              correctIndex: 1,
              explanation: 'Chaque assistant apprend de vos interactions pour devenir de plus en plus pertinent et personnalisé dans ses réponses.'
            },
            {
              question: 'Quel assistant personnalise vos plans alimentaires ?',
              options: ['Coach de Vie', 'Fitness', 'Nutrition', 'Bien-être'],
              correctIndex: 2,
              explanation: 'L\'assistant Nutrition élabore des plans alimentaires personnalisés selon vos objectifs, allergies et préférences culinaires.'
            }
          ]
        }
      ]
    },

    /* ── M3 : Le studio créatif ── */
    {
      id: 'maitriser-assistants-m3',
      title: 'Le studio créatif',
      emoji: '🎨',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m3-l1',
          type: 'text',
          title: 'Photo et vidéo IA : fonctionnalités avancées',
          duration: '10 min',
          xpReward: 50,
          content: `Le Studio Créatif de Freenzy est un espace de création tout-en-un qui combine la génération d'images par IA (Flux/schnell), la création de vidéos (D-ID + LTX Video) et un système de gestion de projets créatifs.

En mode « Création libre », vous avez un contrôle total sur vos créations. Pour les images, vous rédigez un prompt détaillé et le modèle Flux/schnell génère un visuel en quelques secondes. Le coût est de 8 crédits en standard et 12 en HD. Vous pouvez itérer rapidement : générez, évaluez, ajustez le prompt, régénérez.

En mode « Demandes agents », les assistants IA eux-mêmes proposent des créations visuelles. Par exemple, l'assistant Marketing peut suggérer de créer un visuel pour un post LinkedIn, ou l'assistant Communication peut proposer une bannière pour votre newsletter. Ces demandes apparaissent dans votre file d'attente et vous validez avant génération.

La bibliothèque vidéo organise vos créations par projets. Chaque projet peut contenir plusieurs clips, des avatars D-ID et des séquences LTX Video. Le lecteur HTML5 intégré vous permet de prévisualiser vos vidéos sans les télécharger.

Les demandes d'agents enrichissent votre studio de manière proactive. Un badge de notification vous indique les demandes en attente. Trois demandes de démonstration sont automatiquement créées à votre première visite pour vous montrer le fonctionnement.

Fonctionnalités avancées : galerie photo avec filtres par date et par agent demandeur, panneau inférieur rétractable (max 36vh) pour la file d'attente, switch de mode intégré dans l'en-tête et export direct vers vos réseaux sociaux.`
        },
        {
          id: 'maitriser-assistants-m3-l2',
          type: 'exercise',
          title: 'Créez une photo et une vidéo',
          duration: '10 min',
          xpReward: 100,
          content: 'Expérimentez avec le studio créatif de Freenzy.',
          exercisePrompt: 'Utilisez le Studio Créatif de Freenzy pour réaliser deux créations :\n\n1. PHOTO : Générez une image professionnelle pour votre profil ou votre entreprise. Rédigez un prompt structuré (sujet + style + ambiance + qualité) et générez l\'image. Si le résultat ne convient pas, ajustez le prompt et réessayez.\n\n2. VIDÉO : Créez un avatar parlant avec D-ID. Uploadez une photo (ou utilisez celle que vous venez de générer) et rédigez un script de présentation de 30 secondes. Lancez la génération et attendez le résultat.\n\nComparez le coût en crédits et le temps de génération entre les deux formats.'
        },
        {
          id: 'maitriser-assistants-m3-l3',
          type: 'quiz',
          title: 'Quiz — Studio créatif',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur le studio créatif.',
          quizQuestions: [
            {
              question: 'Quels sont les deux modes du Studio Créatif ?',
              options: ['Mode jour / Mode nuit', 'Création libre / Demandes agents', 'Standard / Premium', 'Photo / Vidéo'],
              correctIndex: 1,
              explanation: 'Le Studio Créatif propose deux modes : « Création libre » pour un contrôle total, et « Demandes agents » pour les créations suggérées par les assistants IA.'
            },
            {
              question: 'Combien de demandes de démonstration sont créées à la première visite ?',
              options: ['1', '3', '5', '10'],
              correctIndex: 1,
              explanation: 'Trois demandes de démonstration sont automatiquement créées lors de votre première visite du studio pour illustrer le fonctionnement.'
            },
            {
              question: 'Quelle est la différence de coût entre une image standard et une image HD ?',
              options: ['Pas de différence', '4 crédits de plus (8 vs 12)', '10 crédits de plus', 'Le double (8 vs 16)'],
              correctIndex: 1,
              explanation: 'Une image standard coûte 8 crédits et une image HD coûte 12 crédits, soit 4 crédits de différence.'
            }
          ]
        }
      ]
    },

    /* ── M4 : Les discussions profondes ── */
    {
      id: 'maitriser-assistants-m4',
      title: 'Les discussions profondes',
      emoji: '🧠',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m4-l1',
          type: 'text',
          title: '85 templates et Extended Thinking',
          duration: '10 min',
          xpReward: 50,
          content: `Les Discussions Profondes sont une fonctionnalité unique de Freenzy qui vous permet d'explorer des sujets complexes avec le modèle IA le plus puissant : Claude Opus avec Extended Thinking.

Contrairement aux conversations classiques qui utilisent des modèles rapides (Haiku, Sonnet), les Discussions Profondes mobilisent Opus — le modèle le plus avancé — avec une capacité de réflexion étendue. L'IA « pense » avant de répondre, structurant sa réflexion en profondeur pour des réponses nuancées et complètes.

85 templates sont disponibles, organisés en 12 sections et 16 catégories. Vous trouverez des templates pour la philosophie, l'éthique, la stratégie d'entreprise, la créativité, la psychologie, la géopolitique, les sciences, la technologie et bien d'autres domaines. 17 tags transversaux permettent de filtrer les templates par thème.

Chaque discussion évolue en trois phases selon sa profondeur : exploration (messages 0-5) pour poser les bases du sujet, approfondissement (messages 6-15) pour creuser les nuances et les contre-arguments, et synthèse (à partir du message 16) pour converger vers des conclusions structurées.

Le mode Challenge active l'avocat du diable : l'IA conteste vos positions et vous pousse à affiner votre raisonnement. C'est un outil puissant pour préparer un pitch, un débat ou une décision stratégique.

Des alertes de sensibilité sont intégrées pour les sujets délicats (religion, politique, mort). L'IA adapte son ton et ses avertissements en conséquence.

Vous pouvez partager vos discussions sur Twitter, LinkedIn, Facebook, WhatsApp et par email. Le titre est éditable par double-clic. L'export en Markdown est disponible pour archiver vos meilleures discussions.`
        },
        {
          id: 'maitriser-assistants-m4-l2',
          type: 'exercise',
          title: 'Lancez une discussion profonde',
          duration: '10 min',
          xpReward: 100,
          content: 'Expérimentez les Discussions Profondes de Freenzy.',
          exercisePrompt: 'Lancez une Discussion Profonde sur Freenzy :\n\n1. Allez dans la section « Discussions Profondes »\n2. Parcourez les 85 templates et choisissez un sujet qui vous intéresse\n3. Utilisez les tags pour filtrer si nécessaire\n4. Lancez la discussion et échangez au moins 5 messages\n5. Activez le mode Challenge pour tester l\'avocat du diable\n6. Observez comment la profondeur de la discussion évolue (phase exploration → approfondissement)\n\nNotez la différence de qualité par rapport à une conversation classique avec un assistant standard.'
        },
        {
          id: 'maitriser-assistants-m4-l3',
          type: 'quiz',
          title: 'Quiz — Discussions profondes',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur les Discussions Profondes.',
          quizQuestions: [
            {
              question: 'Quel modèle IA est utilisé pour les Discussions Profondes ?',
              options: ['Claude Haiku', 'Claude Sonnet', 'Claude Opus avec Extended Thinking', 'GPT-4'],
              correctIndex: 2,
              explanation: 'Les Discussions Profondes utilisent Claude Opus avec Extended Thinking, le modèle le plus puissant, capable de réflexion structurée avant réponse.'
            },
            {
              question: 'Combien de templates sont disponibles ?',
              options: ['25', '50', '85', '120'],
              correctIndex: 2,
              explanation: '85 templates sont disponibles, organisés en 12 sections et 16 catégories avec 17 tags transversaux pour le filtrage.'
            },
            {
              question: 'Que fait le mode Challenge ?',
              options: ['Accélère les réponses', 'Active l\'avocat du diable pour contester vos positions', 'Limite les réponses à 100 mots', 'Ajoute des quiz automatiques'],
              correctIndex: 1,
              explanation: 'Le mode Challenge active l\'avocat du diable : l\'IA conteste vos positions pour vous pousser à affiner votre raisonnement.'
            },
            {
              question: 'À partir de quel message la phase de synthèse commence-t-elle ?',
              options: ['Message 5', 'Message 10', 'Message 16', 'Message 20'],
              correctIndex: 2,
              explanation: 'La phase de synthèse commence à partir du message 16, après les phases d\'exploration (0-5) et d\'approfondissement (6-15).'
            }
          ]
        }
      ]
    },

    /* ── M5 : L'arcade et la gamification ── */
    {
      id: 'maitriser-assistants-m5',
      title: 'L\'arcade et la gamification',
      emoji: '🎮',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m5-l1',
          type: 'text',
          title: 'Jeux, XP, badges et rewards',
          duration: '8 min',
          xpReward: 50,
          content: `Freenzy intègre un système de gamification complet qui rend l'utilisation de la plateforme ludique et addictive. L'arcade, les points d'expérience (XP), les badges et les rewards créent une boucle d'engagement vertueuse.

Les XP (Experience Points) sont gagnés à chaque action sur la plateforme : compléter une formation, utiliser un assistant, créer du contenu dans le studio, terminer une discussion profonde. Votre niveau augmente avec les XP accumulés, débloquant de nouvelles fonctionnalités et récompenses.

Les badges sont des reconnaissances visuelles de vos accomplissements. Il en existe plusieurs catégories : badges de progression (« Premier pas », « Explorateur », « Expert »), badges de spécialité (« Maître du contenu », « Guru SEO », « Analyste financier »), badges d'engagement (« 7 jours consécutifs », « 100 conversations ») et badges rares pour des accomplissements exceptionnels.

L'arcade propose des mini-jeux éducatifs qui renforcent vos compétences tout en vous divertissant : quiz chronométrés, défis de prompt writing, jeux de matching (associer le bon assistant à la bonne tâche) et challenges communautaires.

Les rewards (récompenses) convertissent vos XP en avantages concrets : crédits bonus, accès anticipé à de nouvelles fonctionnalités, templates premium gratuits et badges exclusifs. Le système de rewards chips affiche vos récompenses disponibles directement dans le dashboard.

La gamification n'est pas un gadget : elle augmente de 60% le taux de rétention des utilisateurs et de 40% le temps passé sur la plateforme, tout en améliorant la qualité d'apprentissage.`
        },
        {
          id: 'maitriser-assistants-m5-l2',
          type: 'game',
          title: 'Flashcards — Gamification Freenzy',
          duration: '12 min',
          xpReward: 100,
          content: 'Testez vos connaissances sur la gamification avec ces flashcards interactives.',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'Que sont les XP ?', back: 'Les Experience Points, gagnés à chaque action sur la plateforme (formations, assistants, studio, discussions).' },
              { front: 'Combien de catégories de badges existent ?', back: '4 catégories : progression, spécialité, engagement et badges rares.' },
              { front: 'Que propose l\'arcade ?', back: 'Des mini-jeux éducatifs : quiz chronométrés, défis de prompt writing, jeux de matching et challenges communautaires.' },
              { front: 'Que sont les rewards chips ?', back: 'Des puces de récompense affichées dans le dashboard qui montrent vos récompenses disponibles (crédits bonus, accès anticipé, templates premium).' },
              { front: 'De combien la gamification augmente-t-elle la rétention ?', back: 'La gamification augmente le taux de rétention de 60% et le temps passé sur la plateforme de 40%.' },
              { front: 'Comment débloquer de nouvelles fonctionnalités ?', back: 'En accumulant des XP qui font monter votre niveau, ce qui débloque progressivement de nouvelles fonctionnalités et récompenses.' },
              { front: 'Qu\'est-ce qu\'un badge rare ?', back: 'Un badge obtenu pour un accomplissement exceptionnel (ex : 365 jours consécutifs, top 1% des utilisateurs).' },
              { front: 'Les XP expirent-ils ?', back: 'Non, les XP sont cumulés définitivement. Votre progression est permanente.' }
            ]
          }
        },
        {
          id: 'maitriser-assistants-m5-l3',
          type: 'quiz',
          title: 'Quiz — Arcade et gamification',
          duration: '10 min',
          xpReward: 150,
          content: 'Quiz sur le système de gamification.',
          quizQuestions: [
            {
              question: 'Quelles actions permettent de gagner des XP ?',
              options: ['Uniquement les formations', 'Uniquement les conversations avec les assistants', 'Toutes les actions : formations, assistants, studio, discussions', 'Seulement les achats de crédits'],
              correctIndex: 2,
              explanation: 'Les XP sont gagnés à chaque action sur la plateforme : formations, utilisation d\'assistants, création dans le studio et discussions profondes.'
            },
            {
              question: 'Que peut-on obtenir avec les rewards ?',
              options: ['De l\'argent réel', 'Des crédits bonus, accès anticipé et templates premium', 'Des réductions sur l\'abonnement', 'Des cadeaux physiques'],
              correctIndex: 1,
              explanation: 'Les rewards convertissent vos XP en avantages : crédits bonus, accès anticipé aux nouvelles fonctionnalités, templates premium gratuits et badges exclusifs.'
            },
            {
              question: 'Quel est l\'impact de la gamification sur la rétention utilisateur ?',
              options: ['+10%', '+30%', '+60%', '+100%'],
              correctIndex: 2,
              explanation: 'La gamification augmente le taux de rétention de 60%, prouvant son efficacité pour maintenir l\'engagement des utilisateurs.'
            }
          ]
        }
      ]
    },

    /* ── M6 : Automatisations et crons ── */
    {
      id: 'maitriser-assistants-m6',
      title: 'Automatisations et crons',
      emoji: '⚙️',
      duration: '30 min',
      xpReward: 300,
      passingScore: 60,
      badgeEmoji: '🏆',
      badgeName: 'Module terminé',
      lessons: [
        {
          id: 'maitriser-assistants-m6-l1',
          type: 'text',
          title: 'Tâches planifiées, briefings et séquences email',
          duration: '10 min',
          xpReward: 50,
          content: `Les automatisations sont le cœur de la productivité sur Freenzy. Elles vous permettent de déléguer des tâches répétitives à vos assistants, qui s'exécutent automatiquement selon des plannings définis.

Les tâches CRON sont des actions programmées à des intervalles réguliers. Par exemple : un briefing matinal à 7h00 (votre assistant compile les actualités de votre secteur, vos rendez-vous du jour et vos priorités), un rapport de ventes hebdomadaire chaque lundi à 9h00, ou une veille concurrentielle quotidienne à 18h00.

Les séquences email automatisées sont un pilier du marketing automation. Freenzy propose trois séquences par défaut : un email de bienvenue (J+0) envoyé immédiatement après l'inscription, un email « Getting Started » (J+2) avec des conseils pour bien démarrer, et un email « Success Story » (J+5) avec un témoignage client inspirant. Ces séquences sont exécutées par un cron toutes les heures qui vérifie les envois en attente.

Les audits automatiques fonctionnent via le système Autopilot : des auditeurs vérifient régulièrement la santé du système (health), les performances business et la sécurité. Les résultats sont envoyés sous forme de rapports structurés.

Chaque automatisation peut être configurée via le dashboard admin : fréquence d'exécution, conditions de déclenchement, notifications de succès ou d'échec, et historique des exécutions. Les crons système incluent : audit quotidien (7h et 20h, heure de Paris), rappel de propositions en attente (toutes les 4 heures) et expiration des propositions périmées (toutes les heures).

L'assistant Direction Générale (fz-dg) orchestre les automatisations stratégiques et peut proposer de nouvelles tâches automatisées en fonction de l'évolution de votre activité.`
        },
        {
          id: 'maitriser-assistants-m6-l2',
          type: 'text',
          title: 'Workflows d\'approbation',
          duration: '8 min',
          xpReward: 50,
          content: `Le système Autopilot de Freenzy introduit un workflow d'approbation intelligent : les assistants proposent des actions, et vous validez avant exécution. Ce modèle garantit que l'IA reste un outil sous votre contrôle total.

Le processus fonctionne en quatre étapes : proposition (un assistant identifie une opportunité ou un problème et propose une action), validation (vous approuvez ou refusez via le dashboard ou WhatsApp), exécution (l'action est réalisée automatiquement après approbation) et rollback (possibilité d'annuler l'action si le résultat n'est pas satisfaisant).

11 types d'actions peuvent être proposés par les agents : activer ou désactiver une fonctionnalité, modifier la configuration d'un agent, envoyer une notification, créer un rapport, modifier un tarif, etc. Chaque proposition est documentée avec le contexte, la justification et l'impact estimé.

La validation peut se faire par deux canaux : le dashboard web (page dédiée avec tous les détails) ou WhatsApp (boutons interactifs : Approuver / Refuser / Plus d'infos). Les commandes texte WhatsApp incluent /ap list (lister les propositions), /ap approve [id], /ap deny [id] et /ap rollback [id].

Les propositions non traitées après un certain temps reçoivent un rappel automatique (toutes les 4 heures). Celles qui restent en attente trop longtemps expirent automatiquement (vérification toutes les heures) pour éviter l'accumulation.

Un audit trail complet enregistre chaque action : qui a proposé, qui a validé, quand, pourquoi et quel a été le résultat. Cette traçabilité est essentielle pour la gouvernance et la conformité.`
        },
        {
          id: 'maitriser-assistants-m6-l3',
          type: 'quiz',
          title: 'Quiz — Automatisations',
          duration: '10 min',
          xpReward: 150,
          content: 'Testez vos connaissances sur les automatisations Freenzy.',
          quizQuestions: [
            {
              question: 'À quelle fréquence le cron des séquences email s\'exécute-t-il ?',
              options: ['Toutes les minutes', 'Toutes les heures', 'Toutes les 6 heures', 'Une fois par jour'],
              correctIndex: 1,
              explanation: 'Le cron des séquences email s\'exécute toutes les heures pour vérifier les envois en attente et les traiter.'
            },
            {
              question: 'Combien de types d\'actions les agents peuvent-ils proposer via Autopilot ?',
              options: ['5', '8', '11', '15'],
              correctIndex: 2,
              explanation: '11 types d\'actions différents peuvent être proposés par les agents via le système Autopilot.'
            },
            {
              question: 'Par quels canaux peut-on valider une proposition Autopilot ?',
              options: ['Uniquement le dashboard', 'Dashboard et email', 'Dashboard et WhatsApp', 'Dashboard, email et SMS'],
              correctIndex: 2,
              explanation: 'Les propositions Autopilot peuvent être validées via le dashboard web ou via WhatsApp avec des boutons interactifs et des commandes texte.'
            },
            {
              question: 'Que se passe-t-il si une proposition reste trop longtemps en attente ?',
              options: ['Elle est automatiquement approuvée', 'Elle expire automatiquement', 'Elle est escaladée au DG', 'Rien, elle reste en attente indéfiniment'],
              correctIndex: 1,
              explanation: 'Les propositions non traitées expirent automatiquement grâce à un cron de vérification qui s\'exécute toutes les heures.'
            }
          ]
        }
      ]
    }
  ]
};

/* ═══════════════════════════════════════════════════════════════
   10 PARCOURS COMING SOON
   ═══════════════════════════════════════════════════════════════ */

export const comingSoonParcours: FormationParcours[] = [
  {
    id: 'freenzy-artisans',
    title: 'Freenzy pour les artisans',
    emoji: '🔧',
    description: 'Devis, relances, avis Google — tout pour les artisans',
    category: 'metier',
    subcategory: 'artisan',
    level: 'debutant',
    levelLabel: 'Débutant',
    modules: [],
    diplomaTitle: 'Artisan Digital',
    diplomaSubtitle: 'Transformation digitale pour artisans',
    totalDuration: '1h',
    totalXP: 600,
    color: '#D97706',
    available: false,
    comingSoon: true,
  },
  {
    id: 'freenzy-medecins',
    title: 'Freenzy pour les médecins',
    emoji: '🩺',
    description: 'Gestion de cabinet, prise de RDV, suivi patients et conformité santé',
    category: 'metier',
    subcategory: 'sante',
    level: 'debutant',
    levelLabel: 'Débutant',
    modules: [],
    diplomaTitle: 'Praticien Digital',
    diplomaSubtitle: 'IA au service de la santé',
    totalDuration: '1h30',
    totalXP: 900,
    color: '#059669',
    available: false,
    comingSoon: true,
  },
  {
    id: 'freenzy-agences',
    title: 'Freenzy pour les agences',
    emoji: '🏢',
    description: 'Gestion multi-clients, reporting automatisé et production de contenu à grande échelle',
    category: 'metier',
    subcategory: 'agence',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    modules: [],
    diplomaTitle: 'Agency Power User',
    diplomaSubtitle: 'Productivité agence avec IA',
    totalDuration: '2h',
    totalXP: 1200,
    color: '#6366F1',
    available: false,
    comingSoon: true,
  },
  {
    id: 'freenzy-ecommerce',
    title: 'Freenzy pour le e-commerce',
    emoji: '🛒',
    description: 'Fiches produit, SEO, service client et automatisation des ventes en ligne',
    category: 'metier',
    subcategory: 'ecommerce',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    modules: [],
    diplomaTitle: 'E-Commerce AI Specialist',
    diplomaSubtitle: 'Vente en ligne assistée par IA',
    totalDuration: '2h',
    totalXP: 1200,
    color: '#F59E0B',
    available: false,
    comingSoon: true,
  },
  {
    id: 'api-integrations',
    title: 'Intégrations API avancées',
    emoji: '🔌',
    description: 'Connectez Freenzy à vos outils : Zapier, Make, webhooks et API REST',
    category: 'technique',
    subcategory: 'api',
    level: 'avance',
    levelLabel: 'Avancé',
    modules: [],
    diplomaTitle: 'API Integration Expert',
    diplomaSubtitle: 'Intégrations techniques avancées',
    totalDuration: '3h',
    totalXP: 1800,
    color: '#0EA5E9',
    available: false,
    comingSoon: true,
  },
  {
    id: 'film-ia',
    title: 'Réaliser un court-métrage IA',
    emoji: '🎬',
    description: 'Scénario, storyboard, génération vidéo et montage — créez un film avec l\'IA',
    category: 'creatif',
    subcategory: 'video',
    level: 'avance',
    levelLabel: 'Avancé',
    modules: [],
    diplomaTitle: 'AI Film Director',
    diplomaSubtitle: 'Réalisation de films assistée par IA',
    totalDuration: '4h',
    totalXP: 2400,
    color: '#A855F7',
    available: false,
    comingSoon: true,
  },
  {
    id: 'avatar-ia',
    title: 'Créer son avatar IA',
    emoji: '🧑‍💻',
    description: 'Concevez un avatar parlant professionnel avec D-ID et ElevenLabs',
    category: 'creatif',
    subcategory: 'avatar',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    modules: [],
    diplomaTitle: 'AI Avatar Creator',
    diplomaSubtitle: 'Création d\'avatars numériques',
    totalDuration: '1h30',
    totalXP: 900,
    color: '#EC4899',
    available: false,
    comingSoon: true,
  },
  {
    id: 'automatiser-business',
    title: 'Automatiser son business',
    emoji: '🤖',
    description: 'Crons, workflows, séquences email et Autopilot — zéro tâche manuelle',
    category: 'competence',
    subcategory: 'automation',
    level: 'avance',
    levelLabel: 'Avancé',
    modules: [],
    diplomaTitle: 'Business Automation Expert',
    diplomaSubtitle: 'Automatisation complète de l\'entreprise',
    totalDuration: '3h',
    totalXP: 1800,
    color: '#14B8A6',
    available: false,
    comingSoon: true,
  },
  {
    id: 'francais-anglais',
    title: 'Business English avec l\'IA',
    emoji: '🇬🇧',
    description: 'Améliorez votre anglais professionnel avec un coach IA personnalisé',
    category: 'langue',
    subcategory: 'anglais',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    modules: [],
    diplomaTitle: 'Business English Certified',
    diplomaSubtitle: 'Anglais professionnel assisté par IA',
    totalDuration: '5h',
    totalXP: 3000,
    color: '#1D4ED8',
    available: false,
    comingSoon: true,
  },
  {
    id: 'francais-hebreu',
    title: 'Hébreu des affaires avec l\'IA',
    emoji: '🇮🇱',
    description: 'Apprenez l\'hébreu professionnel pour le marché israélien avec un tuteur IA',
    category: 'langue',
    subcategory: 'hebreu',
    level: 'debutant',
    levelLabel: 'Débutant',
    modules: [],
    diplomaTitle: 'Business Hebrew Certified',
    diplomaSubtitle: 'Hébreu professionnel assisté par IA',
    totalDuration: '5h',
    totalXP: 3000,
    color: '#2563EB',
    available: false,
    comingSoon: true,
  },
];
