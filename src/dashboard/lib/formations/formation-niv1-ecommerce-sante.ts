// =============================================================================
// Freenzy.io — Formation Niveau 1 : E-commerce IA + Sante IA
// 2 parcours x 6 modules x 3 lessons = 36 lessons, 1200 XP total
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// Parcours 1 — E-commerce IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursEcommerceIA: FormationParcours = {
  id: 'ecommerce-ia-niv1',
  title: 'E-commerce et IA',
  emoji: '\u{1F6D2}',
  description: 'Maitrisez l\'IA pour booster votre boutique en ligne : fiches produits SEO, SAV automatise, recuperation de paniers abandonnes, gestion des avis et analytics e-commerce.',
  category: 'metier',
  subcategory: 'ecommerce',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#10B981',
  diplomaTitle: 'E-commerce AI Expert',
  diplomaSubtitle: 'Certification Freenzy.io — E-commerce et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Fiches produits SEO
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m1',
      title: 'Fiches produits SEO',
      emoji: '\u{1F4E6}',
      description: 'Creez des fiches produits optimisees pour Google et pour vos clients.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m1-l1',
          title: 'Anatomie d\'une fiche produit parfaite',
          duration: '5 min',
          type: 'text',
          content: `Votre fiche produit, c'est votre vendeur numero 1 — elle travaille 24h/24 et elle doit convaincre en quelques secondes ! \u{1F3AF} Voyons ensemble les elements indispensables d'une fiche produit qui convertit ET qui remonte dans Google.

Le titre H1 est la premiere chose que Google et vos visiteurs voient. Il doit contenir le nom du produit, sa caracteristique principale et un mot-cle strategique. Par exemple, au lieu de "Chaussures running", ecrivez "Chaussures de running homme — amorties et legeres pour marathon". C'est precis, descriptif et optimise SEO. \u{1F4A1}

La meta-description (160 caracteres max) apparait dans les resultats Google. Elle doit donner envie de cliquer ! Incluez un benefice client + un appel a l'action : "Decouvrez nos chaussures running ultra-legeres. Livraison gratuite des 50 euros. Retours sous 30 jours."

Le corps de la description doit suivre une structure precise : un paragraphe d'accroche emotionnelle (le probleme que le produit resout), puis les bullet points des caracteristiques techniques (matiere, dimensions, poids, couleur), suivis des benefices utilisateur. Chaque bullet point = 1 feature + 1 benefice. \u{2705}

La section FAQ (3 a 5 questions) est un tresor SEO ! Google adore les FAQ car elles repondent directement aux questions des internautes. "Ce produit est-il compatible avec...?", "Quelle taille choisir ?", "Comment entretenir ce produit ?" — autant de requetes longue traine qui generent du trafic.

Visez minimum 300 mots par fiche. En dessous, Google considere le contenu comme "thin content" et vous penalise. Avec Freenzy, l'assistant Commercial genere tout ca en 30 secondes a partir d'une simple description de votre produit ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m1-l2',
          title: 'Exercice : Optimisez 3 fiches produits',
          duration: '5 min',
          type: 'exercise',
          content: 'Mettez en pratique les regles SEO sur vos fiches produits.',
          exercisePrompt: `Choisissez 3 produits de votre boutique (ou inventez-en 3). Pour chacun, redigez :

1. Un titre H1 optimise SEO (nom + caracteristique + mot-cle)
2. Une meta-description de 150-160 caracteres avec benefice + CTA
3. 5 bullet points (feature + benefice a chaque fois)
4. 3 questions FAQ avec reponses courtes

Conseil : utilisez l'assistant Commercial de Freenzy pour generer une premiere version, puis ajustez avec votre connaissance produit.

Criteres de reussite :
- Chaque titre contient au moins 1 mot-cle strategique
- Chaque meta-description fait entre 140 et 160 caracteres
- Les bullet points sont scannable (pas de pavés de texte)
- Les FAQ repondent a de vraies questions clients`,
          xpReward: 20,
        },
        {
          id: 'ecom-m1-l3',
          title: 'Quiz — Fiches produits SEO',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez que vous maitrisez les fondamentaux des fiches produits optimisees.',
          quizQuestions: [
            {
              question: 'Quelle longueur minimum recommandee pour une fiche produit SEO ?',
              options: ['50 mots', '150 mots', '300 mots', '1000 mots'],
              correctIndex: 2,
              explanation: 'Google considere le contenu en dessous de 300 mots comme du "thin content" et le penalise dans les resultats de recherche.',
            },
            {
              question: 'Que doit contenir le titre H1 d\'une fiche produit ?',
              options: [
                'Uniquement le nom du produit',
                'Le nom + une caracteristique + un mot-cle SEO',
                'Le prix et la disponibilite',
                'Le nom de la marque uniquement',
              ],
              correctIndex: 1,
              explanation: 'Un bon titre H1 combine le nom du produit, sa caracteristique principale et un mot-cle strategique pour optimiser le referencement.',
            },
            {
              question: 'Pourquoi ajouter une FAQ sur une fiche produit ?',
              options: [
                'Pour remplir la page',
                'Parce que Google aime les FAQ et ca genere du trafic longue traine',
                'Parce que c\'est obligatoire legalement',
                'Pour remplacer la description',
              ],
              correctIndex: 1,
              explanation: 'Les FAQ repondent directement aux requetes des internautes dans Google, ce qui genere du trafic via les mots-cles longue traine.',
            },
            {
              question: 'Quelle est la longueur ideale d\'une meta-description ?',
              options: ['50 caracteres', '100 caracteres', '150-160 caracteres', '300 caracteres'],
              correctIndex: 2,
              explanation: 'Google affiche environ 155-160 caracteres dans les resultats. Au-dela, le texte est tronque et perd en efficacite.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Fiche Produit Pro',
    },

    // -----------------------------------------------------------------------
    // Module 2 — SAV automatise
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m2',
      title: 'SAV automatise',
      emoji: '\u{1F916}',
      description: 'Automatisez votre service client avec un chatbot IA intelligent.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m2-l1',
          title: 'Mettre en place un chatbot SAV intelligent',
          duration: '4 min',
          type: 'text',
          content: `80% des questions clients sont toujours les memes : "Ou est ma commande ?", "Comment retourner un article ?", "Quels sont vos delais de livraison ?" — et votre equipe passe des heures a repondre la meme chose. Le chatbot IA va changer la donne ! \u{1F4AC}

Un chatbot SAV efficace repose sur 3 piliers. D'abord, la FAQ dynamique : vous alimentez l'IA avec vos questions frequentes (livraison, retours, tailles, paiement) et elle repond instantanement avec les bonnes informations. Plus besoin de chercher dans un document — le client obtient sa reponse en 5 secondes.

Ensuite, le protocole d'escalade est crucial. Le chatbot doit savoir quand il ne peut pas repondre et transferer vers un humain. Regle d'or : apres 2 tentatives infructueuses ou si le client exprime de la frustration, escalade automatique vers votre equipe avec le contexte complet de la conversation. \u{26A1}

Le protocole VARC est votre meilleur ami pour les reclamations : Valider l'emotion du client ("Je comprends votre frustration"), Analyser le probleme (poser les bonnes questions), Resoudre avec une solution concrete, Confirmer la satisfaction. L'IA applique ce protocole naturellement quand vous la formez correctement.

Enfin, le chatbot peut gerer proactivement : envoyer un message automatique quand une commande est expediee, prevenir d'un retard avant que le client ne s'inquiete, ou proposer un bon de reduction apres une mauvaise experience. C'est du SAV predictif ! \u{1F389}

Avec Freenzy, configurez votre chatbot en 10 minutes : importez vos FAQ, definissez vos regles d'escalade et laissez l'IA gerer. Resultat : 80% des demandes traitees automatiquement, temps de reponse divise par 50.`,
          xpReward: 15,
        },
        {
          id: 'ecom-m2-l2',
          title: 'Repondre aux reclamations comme un pro',
          duration: '4 min',
          type: 'text',
          content: `Une reclamation client bien geree, c'est un client fidele a vie. Mal geree, c'est un avis 1 etoile et 10 clients perdus. Voyons comment l'IA vous aide a transformer chaque reclamation en opportunite ! \u{1F4AA}

Premier reflexe : ne jamais nier le probleme. L'IA doit commencer par valider l'emotion : "Je suis desole pour ce desagrement, je comprends que c'est frustrant." Meme si le client a tort, sa frustration est reelle. Cette simple phrase reduit la tension de 60%.

Ensuite, l'IA categorise automatiquement la reclamation : retard livraison, produit defectueux, erreur commande, insatisfaction qualite. Chaque categorie a son protocole de resolution : renvoi, remboursement, avoir, geste commercial. Vous definissez les regles, l'IA les applique.

Les reponses doivent etre precises et actionnables : pas de "nous allons voir ce que nous pouvons faire" mais "voici ce que je fais maintenant pour resoudre votre probleme". Donnez un delai, un numero de suivi, une action concrete. \u{2705}

Astuce Freenzy : configurez des modeles de reponse par type de reclamation. L'IA les personalise automatiquement avec le nom du client, le numero de commande et les details specifiques. Resultat : des reponses professionnelles en 10 secondes au lieu de 10 minutes.

N'oubliez pas le suivi ! 48h apres la resolution, un message automatique "Tout est rentre dans l'ordre ?" montre au client que vous vous souciez vraiment de lui. C'est ca qui transforme un client mecontent en ambassadeur ! \u{1F31F}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m2-l3',
          title: 'Quiz — SAV automatise',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'automatisation du service client.',
          quizQuestions: [
            {
              question: 'Que signifie le protocole VARC ?',
              options: [
                'Vendre, Argumenter, Relancer, Conclure',
                'Valider, Analyser, Resoudre, Confirmer',
                'Verifier, Accepter, Repondre, Cloturer',
                'Viser, Adapter, Reagir, Communiquer',
              ],
              correctIndex: 1,
              explanation: 'VARC = Valider l\'emotion, Analyser le probleme, Resoudre avec une solution concrete, Confirmer la satisfaction du client.',
            },
            {
              question: 'Quand le chatbot doit-il escalader vers un humain ?',
              options: [
                'Jamais, il gere tout seul',
                'Apres chaque message client',
                'Apres 2 tentatives infructueuses ou si le client est frustre',
                'Uniquement si le client le demande explicitement',
              ],
              correctIndex: 2,
              explanation: 'L\'escalade doit se faire apres 2 tentatives sans succes ou a la detection de frustration, avec le contexte complet pour l\'agent humain.',
            },
            {
              question: 'Quel pourcentage de demandes SAV un chatbot IA peut-il traiter ?',
              options: ['20%', '50%', '80%', '100%'],
              correctIndex: 2,
              explanation: 'Un chatbot bien configure traite environ 80% des demandes (questions frequentes et procedures standard). Les 20% restants necessitent une intervention humaine.',
            },
            {
              question: 'Quelle est la premiere chose a faire face a une reclamation ?',
              options: [
                'Expliquer pourquoi le client a tort',
                'Valider l\'emotion du client',
                'Proposer un remboursement immediat',
                'Demander le numero de commande',
              ],
              correctIndex: 1,
              explanation: 'Valider l\'emotion ("Je comprends votre frustration") reduit la tension de 60% et ouvre la voie a une resolution constructive.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F916}',
      badgeName: 'SAV Automatise',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Paniers abandonnes
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m3',
      title: 'Paniers abandonnes',
      emoji: '\u{1F6D2}',
      description: 'Recuperez les ventes perdues avec des sequences email IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m3-l1',
          title: 'La sequence magique en 3 emails',
          duration: '5 min',
          type: 'text',
          content: `70% des paniers en ligne sont abandonnes. Sur 100 visiteurs qui ajoutent un produit au panier, 70 partent sans acheter. La bonne nouvelle ? Une sequence de 3 emails bien pensee peut en recuperer 15 a 20%. Faites le calcul sur votre CA mensuel — ca fait mal ! \u{1F4B0}

Email 1 — J+1h (le rappel doux) : Le client vient de partir, il est encore "chaud". L'email est simple et amical : "Vous avez oublie quelque chose ! \u{1F60A}" Montrez le produit avec sa photo, son prix, et un bouton direct vers le panier. Pas de pression, pas de promotion — juste un rappel. Taux d'ouverture moyen : 45%.

Email 2 — J+24h (la preuve sociale) : Le client a eu le temps de reflechir. C'est le moment d'ajouter de la valeur : avis clients, note moyenne, nombre de ventes, benefices cles du produit. "500 clients ont deja adopte ce produit — voici ce qu'ils en pensent." L'objectif : lever les objections. Taux d'ouverture : 35%.

Email 3 — J+72h (l'offre irresistible) : Dernier email, derniere chance. C'est ici que vous degainez votre meilleure offre : -10%, livraison gratuite, cadeau bonus, ou garantie etendue. Ajoutez un sentiment d'urgence : "Offre valable 24h" ou "Stock limite". Taux d'ouverture : 25%, mais taux de conversion le plus eleve ! \u{1F525}

Points cles pour maximiser les resultats : personnalisez chaque email avec le prenom et le produit exact, envoyez depuis une vraie adresse (pas de noreply@), testez vos objets d'email (A/B testing), et mesurez tout (taux d'ouverture, clics, conversions).

Avec Freenzy, l'assistant Marketing genere votre sequence complete en 2 minutes. Vous n'avez plus qu'a connecter votre outil d'emailing et laisser l'automatisation faire le travail ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m3-l2',
          title: 'Exercice : Creez votre sequence 3 emails',
          duration: '5 min',
          type: 'exercise',
          content: 'Redigez une sequence complete de recuperation de paniers abandonnes.',
          exercisePrompt: `Imaginez que vous vendez des cosmetiques bio en ligne. Un client a ajoute un "Serum anti-age a l'acide hyaluronique" a 45 euros dans son panier, puis est parti.

Redigez les 3 emails de la sequence :

Email 1 (J+1h) :
- Objet (max 50 caracteres, avec emoji)
- Corps : 3-4 lignes max, ton amical, bouton CTA

Email 2 (J+24h) :
- Objet (max 50 caracteres)
- Corps : inclure 2 avis clients fictifs + note moyenne + CTA

Email 3 (J+72h) :
- Objet (max 50 caracteres, urgence)
- Corps : offre speciale + deadline + CTA

Criteres de reussite :
- Chaque email a un objet different et percutant
- Progression logique : rappel → preuve sociale → offre
- Le CTA est clair et visible dans chaque email`,
          xpReward: 20,
        },
        {
          id: 'ecom-m3-l3',
          title: 'Quiz — Paniers abandonnes',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la recuperation de paniers abandonnes.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de paniers en ligne sont abandonnes en moyenne ?',
              options: ['30%', '50%', '70%', '90%'],
              correctIndex: 2,
              explanation: 'En moyenne, 70% des paniers sont abandonnes. C\'est un levier de croissance enorme pour tout e-commercant.',
            },
            {
              question: 'Quand envoyer le premier email de relance ?',
              options: ['Immediatement', '1 heure apres', '24 heures apres', '1 semaine apres'],
              correctIndex: 1,
              explanation: 'Le premier email doit partir 1h apres l\'abandon : le client est encore "chaud" et se souvient de son panier.',
            },
            {
              question: 'Que doit contenir le 3eme email de la sequence ?',
              options: [
                'Un simple rappel du panier',
                'Des avis clients',
                'Une offre speciale avec urgence',
                'Une demande de feedback',
              ],
              correctIndex: 2,
              explanation: 'Le 3eme email (J+72h) est le dernier essai : offre irresistible (reduction, livraison gratuite) + urgence ("valable 24h").',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F6D2}',
      badgeName: 'Recuperateur de Paniers',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Avis et reputation
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m4',
      title: 'Avis et reputation',
      emoji: '\u{2B50}',
      description: 'Gerez vos avis clients et protegez votre e-reputation.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m4-l1',
          title: 'Repondre aux avis selon la note',
          duration: '4 min',
          type: 'text',
          content: `Les avis clients sont le nerf de la guerre en e-commerce. 93% des consommateurs lisent les avis avant d'acheter, et 1 etoile de plus sur votre note moyenne peut augmenter vos ventes de 5 a 9%. Chaque avis merite une reponse — voici comment faire selon la note ! \u{2B50}

Avis 5 etoiles \u{2B50}\u{2B50}\u{2B50}\u{2B50}\u{2B50} : Remerciez chaleureusement, mentionnez le produit specifique et invitez a decouvrir un produit complementaire. "Merci Claire ! Ravi que le serum vous plaise. Vous adorerez aussi notre creme de jour qui complete parfaitement la routine !" C'est du cross-selling gratuit.

Avis 4 etoiles \u{2B50}\u{2B50}\u{2B50}\u{2B50} : Remerciez et demandez ce qui aurait merite la 5eme etoile. "Merci pour votre retour ! Qu'est-ce qui aurait rendu votre experience parfaite ?" Vous montrez que vous visez l'excellence et vous obtenez du feedback precieux.

Avis 3 etoiles \u{2B50}\u{2B50}\u{2B50} : Prenez au serieux, excusez-vous pour l'experience mitigee et proposez une solution. "Nous sommes desoles que le produit n'ait pas pleinement repondu a vos attentes. Notre equipe vous contacte pour trouver une solution."

Avis 2 etoiles \u{2B50}\u{2B50} : Reaction rapide obligatoire. Validez la deception, proposez un echange ou remboursement, et demandez a poursuivre en prive. Objectif : resoudre le probleme ET montrer aux futurs lecteurs que vous gerez les soucis.

Avis 1 etoile \u{2B50} : Ne reagissez JAMAIS a chaud ! Restez professionnel, presentez des excuses sinceres, proposez une resolution concrete et un contact direct. "Nous prenons votre retour tres au serieux. Notre responsable vous contacte sous 24h au [email]." \u{1F6A8}

Regle d'or : repondez a TOUS les avis dans les 24h. Avec Freenzy, l'IA redige vos reponses personnalisees en 10 secondes — vous n'avez qu'a valider et publier !`,
          xpReward: 15,
        },
        {
          id: 'ecom-m4-l2',
          title: 'Encourager les avis positifs',
          duration: '4 min',
          type: 'text',
          content: `Le probleme classique : vos clients satisfaits restent silencieux, mais les mecontents laissent systematiquement un avis. Resultat : une note qui ne reflete pas la realite. Comment inverser la tendance ? \u{1F4C8}

Le timing est crucial. Le meilleur moment pour demander un avis, c'est quand le client est au pic de satisfaction : juste apres la livraison (J+2 a J+5), apres une utilisation reussie, ou apres une interaction positive avec votre SAV. N'attendez pas 3 semaines — l'enthousiasme retombe vite !

La methode email est la plus efficace : un email court, personnel, avec un lien direct vers la page d'avis. "Bonjour [Prenom], votre [produit] est arrive il y a 3 jours. Tout vous plait ? Votre avis compte enormement pour nous et aide d'autres clients a faire leur choix \u{1F64F}" Taux de reponse : 5 a 15%.

Le SMS fonctionne encore mieux (taux d'ouverture 98% !) mais reservez-le aux clients VIP pour ne pas paraitre intrusif. Un simple "Satisfait de votre commande ? Laissez-nous un avis en 30 secondes : [lien]" suffit.

Gamifiez la collecte d'avis ! Offrez un petit incentive : -5% sur la prochaine commande, des points de fidelite, ou un acces a une vente privee. Attention : ne demandez JAMAIS un avis positif en echange — c'est contraire a l'ethique et aux regles des plateformes. Demandez simplement un avis honnete. \u{2705}

Automatisez tout avec Freenzy : l'assistant envoie automatiquement la demande d'avis au bon moment, personnalise le message et suit les resultats. Vous pouvez viser +50% d'avis en 3 mois sans effort quotidien ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m4-l3',
          title: 'Quiz — Avis et reputation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion des avis clients.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de consommateurs lisent les avis avant d\'acheter ?',
              options: ['50%', '70%', '93%', '100%'],
              correctIndex: 2,
              explanation: '93% des consommateurs consultent les avis en ligne avant de faire un achat. La gestion des avis est donc cruciale pour votre CA.',
            },
            {
              question: 'Comment repondre a un avis 1 etoile ?',
              options: [
                'Ne pas repondre pour ne pas attirer l\'attention',
                'Expliquer pourquoi le client a tort',
                'S\'excuser, proposer une resolution et un contact direct',
                'Supprimer l\'avis',
              ],
              correctIndex: 2,
              explanation: 'Face a un avis 1 etoile, restez professionnel : excuses sinceres, solution concrete et contact direct. Cela montre aux futurs clients que vous gerez les problemes.',
            },
            {
              question: 'Quel est le meilleur moment pour demander un avis ?',
              options: [
                'Avant la livraison',
                '2 a 5 jours apres reception',
                '1 mois apres l\'achat',
                'Le jour de l\'achat',
              ],
              correctIndex: 1,
              explanation: 'J+2 a J+5 apres livraison est le pic de satisfaction : le client a recu et teste le produit, son enthousiasme est au maximum.',
            },
            {
              question: 'Peut-on offrir une reduction en echange d\'un avis positif ?',
              options: [
                'Oui, c\'est la meilleure pratique',
                'Non, on peut incentiver un avis honnete mais pas un avis positif',
                'Oui, mais uniquement pour les avis 5 etoiles',
                'Non, c\'est illegal',
              ],
              correctIndex: 1,
              explanation: 'Vous pouvez offrir un incentive pour encourager un avis honnete, mais demander specifiquement un avis positif est contraire a l\'ethique et aux regles des plateformes.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{2B50}',
      badgeName: 'Gardien des Avis',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Marketing e-commerce
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m5',
      title: 'Marketing e-commerce',
      emoji: '\u{1F4E3}',
      description: 'Maitrisez les canaux marketing essentiels pour votre boutique en ligne.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m5-l1',
          title: 'Email, social et retargeting IA',
          duration: '5 min',
          type: 'text',
          content: `Le marketing e-commerce repose sur 3 piliers : l'email marketing, les reseaux sociaux et le retargeting. L'IA transforme chacun de ces canaux en machine a vendre automatique ! \u{1F4E7}

L'email marketing reste le canal le plus rentable : 1 euro investi = 42 euros de retour en moyenne. Avec l'IA, vous passez au niveau superieur. L'assistant Marketing de Freenzy segmente automatiquement vos clients (nouveaux, fideles, inactifs, VIP) et genere des emails personnalises pour chaque segment. Fini le "meme email pour tout le monde" !

Les reseaux sociaux sont votre vitrine gratuite. L'IA vous aide a creer du contenu regulier sans y passer des heures : posts produits avec descriptions accrocheuses, stories engageantes, reels/videos courtes. La cle, c'est la regularite — 3 a 5 posts par semaine minimum. L'IA planifie et redige votre calendrier editorial pour le mois entier. \u{1F4F1}

Le retargeting IA est le game-changer. Quand un visiteur consulte un produit sans acheter, l'IA declenche automatiquement des publicites ciblees sur Facebook, Instagram et Google. Mais pas n'importe comment : elle adapte le message selon le comportement (visite simple, ajout panier, comparaison) et le moment (J+1, J+3, J+7).

Strategie gagnante pour les promos : ne faites pas de promotions permanentes (ca tue votre marge et votre image). Privilegiez les evenements (Black Friday, anniversaire boutique, soldes), les offres flash (24-48h max) et les ventes privees pour vos meilleurs clients. L'IA calcule la remise optimale selon vos marges. \u{1F4B0}

La puissance de l'IA, c'est l'hyperpersonnalisation : chaque client recoit le bon message, sur le bon canal, au bon moment. Un client qui achete toujours le lundi matin recevra votre email le lundi a 8h. Un client sensible aux promos verra l'offre en premier. C'est du marketing chirurgical ! \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m5-l2',
          title: 'Exercice : Planifiez une campagne promo',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un plan marketing complet pour une promotion e-commerce.',
          exercisePrompt: `Vous lancez une vente flash "48h Folie" sur votre boutique en ligne de pret-a-porter. Objectif : +30% de CA sur 2 jours.

Creez votre plan marketing complet :

1. TEASING (J-3 a J-1) :
   - 1 email teasing (objet + 3 lignes)
   - 2 posts reseaux sociaux (texte + format : story/reel/post)

2. LANCEMENT (Jour J) :
   - 1 email d'ouverture (objet + corps 5 lignes + CTA)
   - 1 SMS d'alerte (max 160 caracteres)
   - Strategie retargeting (cible + message + budget suggere)

3. RELANCE (J+1) :
   - 1 email "derniere chance" (objet + 3 lignes)
   - 1 post social avec compte a rebours

4. POST-CAMPAGNE (J+3) :
   - Email de remerciement + offre fidelite

Criteres de reussite : coherence entre les canaux, progression dans l'urgence, CTA clair a chaque etape.`,
          xpReward: 20,
        },
        {
          id: 'ecom-m5-l3',
          title: 'Quiz — Marketing e-commerce',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en marketing e-commerce.',
          quizQuestions: [
            {
              question: 'Quel est le ROI moyen de l\'email marketing ?',
              options: ['1:5', '1:10', '1:42', '1:100'],
              correctIndex: 2,
              explanation: 'L\'email marketing offre en moyenne un retour de 42 euros pour 1 euro investi, ce qui en fait le canal le plus rentable du marketing digital.',
            },
            {
              question: 'Quelle frequence minimum de posts sur les reseaux sociaux ?',
              options: ['1 par mois', '1 par semaine', '3 a 5 par semaine', '3 par jour'],
              correctIndex: 2,
              explanation: '3 a 5 posts par semaine est le minimum pour maintenir la visibilite et l\'engagement. L\'IA peut planifier et rediger votre calendrier editorial.',
            },
            {
              question: 'Que fait le retargeting IA de maniere specifique ?',
              options: [
                'Il envoie le meme pub a tout le monde',
                'Il adapte le message selon le comportement et le timing',
                'Il bloque les visiteurs qui n\'acheent pas',
                'Il reduit automatiquement les prix',
              ],
              correctIndex: 1,
              explanation: 'Le retargeting IA adapte le message publicitaire selon le comportement du visiteur (visite, ajout panier, comparaison) et le timing optimal.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4E3}',
      badgeName: 'Marketeur E-commerce',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Analytics e-commerce
    // -----------------------------------------------------------------------
    {
      id: 'ecom-m6',
      title: 'Analytics e-commerce',
      emoji: '\u{1F4CA}',
      description: 'Pilotez votre boutique avec les bons indicateurs.',
      duration: '10 min',
      lessons: [
        {
          id: 'ecom-m6-l1',
          title: 'Les 4 KPI essentiels du e-commerce',
          duration: '5 min',
          type: 'text',
          content: `Piloter un e-commerce sans analytics, c'est conduire de nuit sans phares. 4 indicateurs cles suffisent pour prendre les bonnes decisions — et l'IA les surveille pour vous en temps reel ! \u{1F4CA}

Le Chiffre d'Affaires (CA) est evidemment le premier KPI a suivre. Mais ne regardez pas juste le total ! Decomposez-le : CA par canal (site, marketplace, social), par categorie produit, par segment client. L'IA detecte automatiquement les tendances : "Le CA des cosmetiques a augmente de 23% cette semaine grace a votre campagne Instagram." \u{1F4C8}

Le Panier Moyen represente le montant moyen depense par commande. Pour l'augmenter : proposez des bundles (lot de 3 pour le prix de 2.5), des seuils de livraison gratuite ("Plus que 12 euros pour la livraison offerte !"), du cross-selling ("Les clients qui achetent X achetent aussi Y"). L'IA identifie les meilleures combinaisons de produits pour maximiser le panier.

Le Taux de Conversion mesure le pourcentage de visiteurs qui achetent. En moyenne, il tourne autour de 2-3% en e-commerce. Chaque point de pourcentage supplementaire peut representer des milliers d'euros. L'IA analyse ou les visiteurs abandonnent (page produit, panier, paiement) et vous suggere des ameliorations precises.

La CLV (Customer Lifetime Value) est la valeur totale qu'un client vous apportera. Un client qui achete 3 fois par an pendant 5 ans a une CLV bien plus elevee qu'un one-shot. L'IA segmente vos clients par CLV et vous aide a investir plus sur les clients a forte valeur : programme fidelite, offres exclusives, service premium. \u{1F4B0}

Avec Freenzy, votre dashboard analytics centralise ces 4 KPI avec des alertes intelligentes : "Votre taux de conversion a chute de 15% — la page de paiement a un bug" ou "3 clients VIP n'ont pas commande depuis 2 mois — lancez une campagne de reactivation." C'est votre co-pilote data ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'ecom-m6-l2',
          title: 'Jeu : KPI et actions strategiques',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque KPI a l\'action strategique correspondante.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Panier moyen en baisse', right: 'Ajouter des bundles et du cross-selling' },
              { left: 'Taux de conversion faible', right: 'Optimiser la page produit et le tunnel d\'achat' },
              { left: 'CLV en recul', right: 'Lancer un programme de fidelite' },
              { left: 'CA stagnant', right: 'Diversifier les canaux d\'acquisition' },
              { left: 'Trafic eleve mais peu de ventes', right: 'Ameliorer la qualite du trafic (ciblage pub)' },
              { left: 'Taux de retour produit eleve', right: 'Ameliorer les fiches produits et les photos' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'ecom-m6-l3',
          title: 'Quiz — Analytics e-commerce',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les analytics e-commerce.',
          quizQuestions: [
            {
              question: 'Quel est le taux de conversion moyen en e-commerce ?',
              options: ['0.5%', '2-3%', '10%', '25%'],
              correctIndex: 1,
              explanation: 'Le taux de conversion moyen en e-commerce est de 2 a 3%. Chaque point supplementaire peut representer des milliers d\'euros de CA additionnel.',
            },
            {
              question: 'Que mesure la CLV ?',
              options: [
                'Le cout d\'acquisition d\'un client',
                'Le nombre de visites par client',
                'La valeur totale qu\'un client apportera sur sa duree de vie',
                'Le taux de satisfaction client',
              ],
              correctIndex: 2,
              explanation: 'La CLV (Customer Lifetime Value) mesure la valeur totale qu\'un client generera pour votre entreprise sur toute la duree de la relation commerciale.',
            },
            {
              question: 'Comment augmenter le panier moyen ?',
              options: [
                'Augmenter les prix de 50%',
                'Proposer bundles, cross-selling et seuils de livraison gratuite',
                'Reduire le nombre de produits',
                'Supprimer les petits articles',
              ],
              correctIndex: 1,
              explanation: 'Les bundles (lots), le cross-selling (produits complementaires) et les seuils de livraison gratuite sont les 3 leviers principaux pour augmenter le panier moyen.',
            },
            {
              question: 'Quelle alerte IA est la plus actionnable ?',
              options: [
                '"Votre site a eu 1000 visites hier"',
                '"Le taux de conversion a chute de 15% sur la page paiement"',
                '"Vous avez vendu 50 produits"',
                '"Le trafic vient de Google"',
              ],
              correctIndex: 1,
              explanation: 'Une alerte actionnable pointe un probleme precis avec une localisation claire. "Chute de 15% sur la page paiement" permet d\'agir immediatement.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Analyste E-commerce',
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 2 — Sante IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursSanteIA: FormationParcours = {
  id: 'sante-ia-niv1',
  title: 'IA pour la Sante',
  emoji: '\u{1FA7A}',
  description: 'Utilisez l\'IA pour optimiser votre cabinet medical ou paramedical : secretariat automatise, gestion des RDV, documents medicaux, RGPD sante et communication patients.',
  category: 'metier',
  subcategory: 'sante',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#3B82F6',
  diplomaTitle: 'Health AI Certified',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Professionnels de Sante',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Secretariat medical IA
    // -----------------------------------------------------------------------
    {
      id: 'sante-m1',
      title: 'Secretariat medical IA',
      emoji: '\u{1F4DE}',
      description: 'Automatisez l\'accueil patient et le tri des urgences avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m1-l1',
          title: 'Repondre aux patients 24h/24',
          duration: '4 min',
          type: 'text',
          content: `Vos patients appellent a toute heure, les urgences se melent aux questions simples, et votre secretaire est debordee. L'IA peut gerer 80% des demandes patients sans intervention humaine — et ca change tout pour votre cabinet ! \u{1F3E5}

Le secretariat IA fonctionne 24h/24, 7j/7. A 23h, un patient inquiet cherche a savoir si son symptome est urgent ? L'IA analyse sa demande et le trie automatiquement : urgence (redirige vers le 15 ou les urgences), semi-urgent (propose un RDV rapide des le lendemain matin), ou non-urgent (programme un RDV dans la semaine et rassure le patient).

Le tri des urgences suit un arbre de decision que vous configurez avec vos criteres medicaux. L'IA pose les bonnes questions : "Depuis combien de temps ?", "Avez-vous de la fievre ?", "Le symptome s'aggrave-t-il ?" En fonction des reponses, elle classe la demande et agit en consequence. Bien sur, elle ne pose JAMAIS de diagnostic — elle trie et oriente. \u{26A1}

Pour les demandes courantes (horaires, documents, renouvellement ordonnance, resultats d'examen), l'IA repond instantanement avec les informations a jour. Plus besoin de rappeler 10 fois pour savoir si les resultats de la prise de sang sont arrives !

Le gain pour votre cabinet est enorme : votre secretaire se concentre sur l'accueil physique et les taches complexes, les patients obtiennent une reponse immediate (meme le dimanche), et vous ne manquez plus jamais une demande urgente. Les cabinets qui adoptent un secretariat IA voient leur taux de satisfaction patient augmenter de 30% en moyenne ! \u{1F4C8}

Avec Freenzy, configurez votre secretariat IA en 15 minutes : importez vos FAQ patients, definissez vos criteres d'urgence et connectez votre agenda. L'IA fait le reste.`,
          xpReward: 15,
        },
        {
          id: 'sante-m1-l2',
          title: 'Le ton adapte au milieu medical',
          duration: '4 min',
          type: 'text',
          content: `Communiquer avec un patient, ce n'est pas comme repondre a un client e-commerce. Le ton doit etre empathique, rassurant et professionnel — toujours. L'IA doit maitriser ces nuances pour representer votre cabinet dignement. \u{1F49A}

Premiere regle : jamais de jargon medical dans les reponses aux patients. "Vous presentez une inflammation periapicale" devient "Vous avez une petite infection autour de la racine de la dent, rien de grave mais il faut la traiter." L'IA traduit automatiquement le medical en langage accessible.

Deuxieme regle : toujours rassurer AVANT d'informer. "Ne vous inquietez pas, c'est une situation que nous gerons regulierement. Voici ce que nous allons faire..." Le patient anxieux a besoin d'etre rassure avant de recevoir des informations pratiques. L'IA applique ce schema systematiquement. \u{1F91D}

Troisieme regle : la confidentialite dans chaque message. L'IA ne mentionne jamais le motif medical dans un SMS ou email dont l'objet serait visible. "Votre rendez-vous est confirme" plutot que "Votre rendez-vous pour le suivi diabete est confirme". Le secret medical commence dans la communication.

Quatrieme regle : l'empathie dans les moments difficiles. Quand un patient annonce un deces, une maladie grave ou une situation de detresse, l'IA detecte le contexte et adapte son ton : plus de formules d'accueil joyeuses, un ton sobre et compatissant, une proposition d'aide concrete.

Configurez le ton de votre IA en lui donnant des exemples de messages types de votre cabinet. Plus vous lui fournissez de modeles, plus elle s'adapte a votre style de communication. Le secret : commencer avec 10-15 messages types couvrant les situations les plus frequentes. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'sante-m1-l3',
          title: 'Quiz — Secretariat medical IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le secretariat medical automatise.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de demandes patients l\'IA peut-elle gerer automatiquement ?',
              options: ['20%', '50%', '80%', '100%'],
              correctIndex: 2,
              explanation: 'Un secretariat IA bien configure gere environ 80% des demandes courantes (horaires, RDV, documents, FAQ). Les 20% restants necessitent une intervention humaine.',
            },
            {
              question: 'L\'IA de secretariat medical peut-elle poser un diagnostic ?',
              options: [
                'Oui, pour les cas simples',
                'Non, jamais — elle trie et oriente uniquement',
                'Oui, si le medecin valide',
                'Oui, en cas d\'urgence',
              ],
              correctIndex: 1,
              explanation: 'L\'IA ne pose JAMAIS de diagnostic. Elle trie les demandes (urgent, semi-urgent, non-urgent) et oriente le patient vers la bonne ressource.',
            },
            {
              question: 'Quelle est la premiere regle de communication avec un patient ?',
              options: [
                'Utiliser le jargon medical pour paraitre professionnel',
                'Rassurer avant d\'informer',
                'Envoyer directement les resultats',
                'Toujours parler du diagnostic dans l\'email',
              ],
              correctIndex: 1,
              explanation: 'Un patient anxieux a besoin d\'etre rassure avant de recevoir des informations pratiques. "Ne vous inquietez pas" avant "voici ce que nous allons faire".',
            },
            {
              question: 'Pourquoi ne pas mentionner le motif medical dans l\'objet d\'un email ?',
              options: [
                'Parce que c\'est trop long',
                'Pour respecter le secret medical et la confidentialite',
                'Parce que ca n\'interesse pas le patient',
                'Pour eviter les spams',
              ],
              correctIndex: 1,
              explanation: 'L\'objet d\'un email peut etre visible par d\'autres personnes. Mentionner un motif medical violerait le secret medical. Restez generique : "Votre rendez-vous est confirme".',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4DE}',
      badgeName: 'Secretaire IA Medical',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Gestion des RDV
    // -----------------------------------------------------------------------
    {
      id: 'sante-m2',
      title: 'Gestion des RDV',
      emoji: '\u{1F4C5}',
      description: 'Optimisez vos rendez-vous avec confirmations, rappels et gestion des no-shows.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m2-l1',
          title: 'Confirmations, rappels 48h et no-shows',
          duration: '5 min',
          type: 'text',
          content: `Les rendez-vous manques coutent en moyenne 150 euros par creneau perdu en cabinet medical. Avec un taux de no-show de 10 a 15%, c'est des milliers d'euros qui s'envolent chaque mois. L'IA va reduire ce taux a moins de 3% ! \u{1F4C5}

Etape 1 — La confirmation immediate. Des qu'un patient prend RDV (en ligne, par telephone ou via l'IA), un SMS et/ou email de confirmation part automatiquement. Il contient : date, heure, nom du praticien, adresse, documents a apporter. Le patient a une trace ecrite et peut ajouter le RDV a son calendrier en un clic. \u{2705}

Etape 2 — Le rappel 48h avant. C'est le moment crucial ! L'IA envoie un SMS : "Bonjour [Prenom], rappel de votre RDV le [date] a [heure] avec Dr [Nom]. Confirmez en repondant OUI ou reportez en repondant NON." Le patient repond en 2 secondes. En cas de "NON", l'IA propose immediatement un nouveau creneau et libere l'ancien pour un autre patient. Win-win ! \u{1F4F1}

Etape 3 — Gestion des no-shows. Malgre les rappels, certains patients ne viennent pas. L'IA detecte le no-show 15 minutes apres l'heure du RDV et declenche automatiquement : un SMS bienveillant ("Nous avons remarque votre absence. Tout va bien ? Souhaitez-vous reprogrammer ?"), une note dans le dossier patient, et si c'est la 3eme absence, un message d'avertissement poli.

Bonus — La liste d'attente intelligente. Quand un patient annule, l'IA contacte automatiquement les patients en liste d'attente pour le meme creneau. Premier arrive, premier servi ! Le creneau est rempli en 10 minutes au lieu de rester vide.

Resultats constates : les cabinets passent de 12% de no-show a 2-3% en moyenne, soit une recuperation de 10 000 a 20 000 euros de CA annuel pour un cabinet classique. Et vos patients adorent la simplicite du systeme ! \u{1F4B0}`,
          xpReward: 15,
        },
        {
          id: 'sante-m2-l2',
          title: 'Exercice : Configurez vos rappels',
          duration: '4 min',
          type: 'exercise',
          content: 'Mettez en place votre systeme de rappels automatiques.',
          exercisePrompt: `Vous etes un kinesitherapeute avec 25 patients par jour. Votre taux de no-show actuel est de 12%.

Configurez votre systeme de rappels automatiques :

1. MESSAGE DE CONFIRMATION (envoye immediatement apres prise de RDV) :
   - Redigez le SMS (max 160 caracteres)
   - Redigez l'email (objet + 4 lignes incluant les documents a apporter)

2. RAPPEL 48H :
   - Redigez le SMS avec option de confirmation/report (max 160 caracteres)
   - Que se passe-t-il si le patient repond "NON" ?

3. GESTION NO-SHOW :
   - Redigez le SMS envoye 15 min apres l'absence (max 160 caracteres)
   - A partir de combien d'absences envoyez-vous un avertissement ?
   - Redigez le message d'avertissement (bienveillant mais ferme)

4. LISTE D'ATTENTE :
   - Redigez le SMS envoye aux patients en liste d'attente quand un creneau se libere

Objectif : reduire votre taux de no-show de 12% a moins de 3%.`,
          xpReward: 20,
        },
        {
          id: 'sante-m2-l3',
          title: 'Quiz — Gestion des RDV',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion intelligente des rendez-vous.',
          quizQuestions: [
            {
              question: 'Combien coute en moyenne un RDV manque en cabinet medical ?',
              options: ['20 euros', '50 euros', '150 euros', '500 euros'],
              correctIndex: 2,
              explanation: 'Un creneau vide coute en moyenne 150 euros au cabinet (honoraires + charges fixes). Sur un mois, ca represente des milliers d\'euros.',
            },
            {
              question: 'Quand envoyer le rappel de RDV pour maximiser la presence ?',
              options: ['1 semaine avant', '48 heures avant', '2 heures avant', 'La veille au soir'],
              correctIndex: 1,
              explanation: '48h est le timing optimal : assez tot pour permettre au patient de s\'organiser ou de reporter, mais assez proche pour qu\'il n\'oublie pas.',
            },
            {
              question: 'Quel taux de no-show peut-on atteindre avec un systeme de rappels IA ?',
              options: ['0%', '2-3%', '8-10%', '15%'],
              correctIndex: 1,
              explanation: 'Un systeme de rappels automatiques bien configure (confirmation + rappel 48h + gestion no-show) reduit le taux a 2-3% contre 10-15% sans systeme.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Maitre des RDV',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Documents medicaux
    // -----------------------------------------------------------------------
    {
      id: 'sante-m3',
      title: 'Documents medicaux',
      emoji: '\u{1F4CB}',
      description: 'Generez comptes-rendus, certificats et courriers medicaux avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m3-l1',
          title: 'Comptes-rendus, certificats et courriers',
          duration: '5 min',
          type: 'text',
          content: `La paperasse administrative mange 20 a 30% du temps d'un praticien. Comptes-rendus de consultation, certificats medicaux, courriers de correspondance entre confreres — c'est du temps que vous ne passez pas avec vos patients. L'IA va vous liberer ! \u{1F4CB}

Le compte-rendu de consultation est le document le plus frequent. Avec l'IA, vous dictez ou tapez vos notes brutes apres la consultation : "Patient 45 ans, douleur genou droit depuis 3 semaines, aggravee a la marche, pas de trauma, examen : epanchement modere, flexion limitee a 100 degres." L'IA structure automatiquement en format medical standard : motif, antecedents, examen clinique, conclusion, conduite a tenir.

Les certificats medicaux (sport, arret travail, aptitude) suivent des modeles tres precis. L'IA les genere en 10 secondes avec les mentions legales obligatoires, la date, l'identite du patient et votre tampon numerique. Vous n'avez qu'a verifier et signer. Fini les oublis de mentions obligatoires ! \u{2705}

Les courriers de correspondance (adressage vers un specialiste, retour au medecin traitant, demande d'avis) demandent un ton professionnel et une structure precise. L'IA redige le courrier complet : "Cher Confrere, je vous adresse M./Mme [patient] pour [motif]. Historique : [resume]. Examens realises : [liste]. Conclusion : [diagnostic ou suspicion]. Merci de votre avis eclaire."

La cle de la productivite : creez vos modeles de base (5 a 10 documents types) et l'IA les personnalise pour chaque patient. Un compte-rendu qui prend habituellement 10 minutes est genere en 30 secondes. Sur 20 patients par jour, c'est 3 heures recuperees ! \u{1F680}

Important : TOUJOURS relire le document genere avant signature. L'IA est un assistant, pas un remplacant. Votre responsabilite medicale s'applique a chaque document signe de votre nom.`,
          xpReward: 15,
        },
        {
          id: 'sante-m3-l2',
          title: 'Terminologie medicale et IA',
          duration: '4 min',
          type: 'text',
          content: `L'IA est impressionnante pour structurer des documents, mais elle doit maitriser la terminologie medicale pour etre fiable. Voyons comment configurer votre IA pour qu'elle parle "medecin" couramment ! \u{1FA7A}

Le vocabulaire medical est precis et ne tolere pas l'approximation. "Douleur epigastrique" n'est pas "mal au ventre", "dyspnee d'effort" n'est pas "essoufflement". Pour les documents professionnels (courriers entre confreres, comptes-rendus), l'IA doit utiliser la terminologie exacte. Fournissez-lui un glossaire de vos termes les plus utilises.

Les abreviations sont un piege classique. L'IA doit connaitre les votres : "ECG" (electrocardiogramme), "NFS" (numeration formule sanguine), "IRM" (imagerie par resonance magnetique). Creez une liste de vos 30 abreviations les plus courantes et integrez-la dans la configuration de votre assistant. \u{1F4DD}

La codification (CIM-10, CCAM, NGAP) est essentielle pour la facturation et les statistiques. L'IA peut suggerer les codes correspondant aux diagnostics et actes que vous saisissez. Par exemple, "entorse cheville droite" → S93.4 (entorse des ligaments du cou-de-pied). Un gain de temps enorme pour la cotation !

Pour les documents destines aux patients (certificats, explications), l'IA doit automatiquement traduire le jargon en langage simple. C'est la meme IA, mais avec deux modes : "professionnel" (entre confreres) et "patient" (vulgarise et rassurant). Vous basculez d'un mode a l'autre en un clic. \u{1F504}

Conseil pratique : au debut, relisez 100% des documents generes. Apres 2 semaines, l'IA sera tellement entrainee sur votre style que vous ne ferez plus que survoler. Les praticiens qui utilisent Freenzy rapportent 95% de precision des la 3eme semaine.`,
          xpReward: 15,
        },
        {
          id: 'sante-m3-l3',
          title: 'Quiz — Documents medicaux',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la generation de documents medicaux avec l\'IA.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du temps d\'un praticien est consomme par la paperasse ?',
              options: ['5-10%', '20-30%', '50%', '70%'],
              correctIndex: 1,
              explanation: 'Les taches administratives (comptes-rendus, certificats, courriers) consomment 20 a 30% du temps d\'un praticien — un temps precieux que l\'IA permet de recuperer.',
            },
            {
              question: 'Faut-il toujours relire un document medical genere par l\'IA ?',
              options: [
                'Non, l\'IA est fiable a 100%',
                'Oui, toujours — votre responsabilite medicale s\'applique',
                'Uniquement pour les ordonnances',
                'Non, apres la phase d\'entrainement',
              ],
              correctIndex: 1,
              explanation: 'TOUJOURS relire avant de signer. L\'IA est un assistant, pas un remplacant. Votre responsabilite medicale s\'applique a chaque document portant votre nom.',
            },
            {
              question: 'Pourquoi l\'IA a-t-elle besoin de deux modes de communication ?',
              options: [
                'Pour impressionner les patients',
                'Un mode "professionnel" entre confreres et un mode "patient" vulgarise',
                'Pour economiser des credits',
                'Parce que les courriers sont plus longs',
              ],
              correctIndex: 1,
              explanation: 'Entre confreres, la terminologie exacte est necessaire. Pour les patients, le jargon doit etre traduit en langage simple et rassurant.',
            },
            {
              question: 'Combien de temps pour generer un compte-rendu avec l\'IA ?',
              options: ['10 minutes', '5 minutes', '30 secondes', '1 heure'],
              correctIndex: 2,
              explanation: 'A partir de notes brutes, l\'IA structure un compte-rendu medical complet en environ 30 secondes, contre 10 minutes manuellement.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Redacteur Medical IA',
    },

    // -----------------------------------------------------------------------
    // Module 4 — RGPD sante
    // -----------------------------------------------------------------------
    {
      id: 'sante-m4',
      title: 'RGPD sante',
      emoji: '\u{1F512}',
      description: 'Protegez les donnees de sante de vos patients conformement a la reglementation.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m4-l1',
          title: 'Donnees de sante et hebergement HDS',
          duration: '5 min',
          type: 'text',
          content: `Les donnees de sante sont classees "sensibles" par le RGPD. Elles beneficient d'une protection renforcee et leur traitement est soumis a des regles strictes. En tant que professionnel de sante utilisant l'IA, vous DEVEZ maitriser ces regles ! \u{1F512}

Qu'est-ce qu'une donnee de sante ? Tout ce qui revele l'etat de sante d'une personne : pathologies, traitements, resultats d'examens, allergies, antecedents, mais aussi les RDV medicaux et les donnees biometriques. Meme un simple "M. Dupont a un RDV chez le cardiologue" est une donnee de sante. Le perimetre est tres large ! \u{26A0}\u{FE0F}

L'hebergement HDS (Hebergeur de Donnees de Sante) est OBLIGATOIRE en France pour toute entreprise qui stocke des donnees de sante pour le compte d'un tiers. Votre hebergeur doit etre certifie HDS par un organisme accredite. Pas de certification HDS = violation de la loi, sanctions potentielles jusqu'a 20 millions d'euros ou 4% du CA mondial.

Concretement, que verifier ? Votre logiciel de gestion de cabinet, votre plateforme de teleconsultation, votre outil de messagerie patient et votre solution d'IA doivent TOUS etre heberges chez un prestataire HDS. Si un seul maillon de la chaine n'est pas conforme, c'est toute la chaine qui est en infraction.

Le chiffrement est la deuxieme couche de protection. Les donnees doivent etre chiffrees au repos (sur les serveurs) ET en transit (lors des echanges). Cela signifie que meme si quelqu'un accede aux serveurs, les donnees sont illisibles sans la cle de dechiffrement. Standard minimum : AES-256.

Avec Freenzy, vos donnees sont hebergees en Europe (Hetzner, EU) avec chiffrement AES-256. Les donnees de sante transitant par l'IA sont traitees sans retention : une fois le document genere, les donnees brutes sont purgees. Zero donnee patient stockee dans les logs IA ! \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'sante-m4-l2',
          title: 'Secret medical et intelligence artificielle',
          duration: '4 min',
          type: 'text',
          content: `Le secret medical est un principe fondamental depuis Hippocrate. L'arrivee de l'IA pose de nouvelles questions : peut-on confier des donnees patient a une IA ? Comment garantir le secret medical a l'ere numerique ? Reponses claires et pratiques ! \u{1FA7A}

Le secret medical couvre TOUT ce qui est porte a la connaissance du professionnel de sante dans l'exercice de sa profession : diagnostic, traitement, vie privee, situation sociale. La violation est punie d'1 an d'emprisonnement et 15 000 euros d'amende. Avec l'IA, le risque de fuite est demultiplie si on ne prend pas les bonnes precautions.

Regle n1 : l'IA ne doit JAMAIS envoyer de donnees medicales a des serveurs non-securises. Quand vous utilisez l'IA pour rediger un compte-rendu, verifiez que le traitement se fait sur un serveur HDS ou en local. Pas de copier-coller de donnees patient dans ChatGPT ou tout outil non-medical ! \u{1F6A8}

Regle n2 : pseudonymisation. Quand c'est possible, remplacez les noms par des identifiants avant de soumettre a l'IA : "Patient 42, homme, 67 ans" au lieu de "M. Jean Dupont, ne le 15/03/1959." Freenzy fait ca automatiquement — les noms sont remplaces avant le traitement IA et restaures apres.

Regle n3 : acces restreint. Seuls les professionnels de sante habilites doivent pouvoir acceder aux donnees. L'IA doit integrer un systeme de droits d'acces : le medecin voit tout, la secretaire voit les RDV mais pas les diagnostics, le comptable voit les factures mais pas les dossiers medicaux.

Regle n4 : droit du patient. Le patient peut demander a tout moment l'acces a ses donnees, leur rectification ou leur suppression. Votre IA doit permettre de retrouver et exporter toutes les donnees d'un patient en quelques clics. C'est une obligation legale, pas une option ! \u{2696}\u{FE0F}

En resume : l'IA est un outil formidable pour les professionnels de sante, MAIS elle doit etre deployee dans un cadre strict de securite, de confidentialite et de conformite. Pas de raccourcis !`,
          xpReward: 15,
        },
        {
          id: 'sante-m4-l3',
          title: 'Quiz — RGPD sante',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la protection des donnees de sante.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que la certification HDS ?',
              options: [
                'Un label qualite pour les hopitaux',
                'Une certification obligatoire pour heberger des donnees de sante',
                'Un diplome de securite informatique',
                'Une norme ISO pour les logiciels medicaux',
              ],
              correctIndex: 1,
              explanation: 'HDS (Hebergeur de Donnees de Sante) est une certification obligatoire en France pour tout prestataire qui stocke des donnees de sante pour le compte d\'un tiers.',
            },
            {
              question: 'Peut-on copier-coller des donnees patient dans ChatGPT ?',
              options: [
                'Oui, c\'est pratique',
                'Oui, si on anonymise le nom',
                'Non, jamais — utiliser uniquement des outils medicaux certifies',
                'Oui, en mode prive',
              ],
              correctIndex: 2,
              explanation: 'Les outils grand public (ChatGPT, etc.) ne sont pas certifies HDS. Les donnees patient ne doivent JAMAIS y etre saisies, meme anonymisees partiellement.',
            },
            {
              question: 'Quelle est la sanction maximale pour violation du RGPD ?',
              options: [
                '1 000 euros',
                '100 000 euros',
                '20 millions d\'euros ou 4% du CA mondial',
                'Pas de sanction financiere',
              ],
              correctIndex: 2,
              explanation: 'Le RGPD prevoit des sanctions allant jusqu\'a 20 millions d\'euros ou 4% du chiffre d\'affaires mondial annuel, le montant le plus eleve etant retenu.',
            },
            {
              question: 'Qu\'est-ce que la pseudonymisation ?',
              options: [
                'Supprimer toutes les donnees',
                'Remplacer les noms par des identifiants avant traitement',
                'Chiffrer les mots de passe',
                'Anonymiser les factures',
              ],
              correctIndex: 1,
              explanation: 'La pseudonymisation consiste a remplacer les identifiants directs (nom, prenom) par des codes avant traitement. Les donnees restent liables a la personne via une table de correspondance securisee.',
            },
            {
              question: 'Le patient peut-il demander la suppression de ses donnees medicales ?',
              options: [
                'Non, les donnees medicales sont conservees a vie',
                'Oui, c\'est un droit RGPD (avec certaines exceptions legales)',
                'Uniquement apres 10 ans',
                'Non, seul le medecin decide',
              ],
              correctIndex: 1,
              explanation: 'Le RGPD accorde un droit a l\'effacement. En sante, certaines exceptions existent (duree legale de conservation du dossier medical) mais le principe du droit a la suppression s\'applique.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F512}',
      badgeName: 'Expert RGPD Sante',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Communication patients
    // -----------------------------------------------------------------------
    {
      id: 'sante-m5',
      title: 'Communication patients',
      emoji: '\u{1F4E9}',
      description: 'Communiquez efficacement avec vos patients par email, SMS et education therapeutique.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m5-l1',
          title: 'Emails, SMS et education therapeutique',
          duration: '5 min',
          type: 'text',
          content: `La communication patient ne s'arrete pas a la consultation. Les emails, SMS et contenus educatifs sont essentiels pour le suivi, l'observance et la relation de confiance. L'IA rend tout ca automatique et personnalise ! \u{1F4E9}

Les SMS sont le canal roi pour la communication medicale : taux d'ouverture de 98%, lu en moyenne dans les 3 minutes. Utilisez-les pour : rappels de RDV (48h avant), confirmations, resultats disponibles ("Vos resultats sont prets, connectez-vous a votre espace patient"), et suivi post-consultation ("Comment vous sentez-vous 48h apres votre intervention ?").

Les emails sont parfaits pour les contenus plus detailles : compte-rendu de consultation, ordonnances, documents preparatoires avant une intervention, et surtout l'education therapeutique. Un patient diabetique recoit automatiquement des conseils adaptes a son profil : alimentation, activite physique, surveillance glycemique. \u{1F4DA}

L'education therapeutique par IA est un game-changer. Au lieu d'expliquer les memes choses a chaque patient, l'IA envoie des sequences educatives personnalisees : "Semaine 1 — Comprendre votre traitement", "Semaine 2 — Les effets secondaires possibles", "Semaine 3 — L'alimentation adaptee." Le patient apprend a son rythme et revient en consultation mieux informe.

La personnalisation est la cle. L'IA adapte le contenu selon : l'age du patient (ton different pour un ado et une personne agee), la pathologie, le stade du traitement, les preferences de communication (SMS vs email), et meme la langue. Chaque patient recoit exactement l'information dont il a besoin, au bon moment. \u{1F3AF}

Attention aux regles : TOUJOURS obtenir le consentement du patient avant d'envoyer des communications (opt-in obligatoire RGPD), ne jamais mentionner de diagnostic dans un SMS, et proposer un desabonnement facile. Avec Freenzy, le consentement est enregistre automatiquement lors de l'inscription du patient.`,
          xpReward: 15,
        },
        {
          id: 'sante-m5-l2',
          title: 'Exercice : Redigez un email de suivi patient',
          duration: '4 min',
          type: 'exercise',
          content: 'Creez un email de suivi post-consultation adapte et empathique.',
          exercisePrompt: `Scenario : Vous etes medecin generaliste. Mme Dubois, 55 ans, est venue en consultation il y a 3 jours pour une hypertension nouvellement diagnostiquee. Vous lui avez prescrit un traitement antihypertenseur et des regles hygiano-dietetiques.

Redigez un email de suivi a J+3 :

1. OBJET (max 50 caracteres, sans mention du diagnostic)
2. CORPS DE L'EMAIL :
   - Salutation personnalisee et prise de nouvelles
   - Rappel bienveillant des consignes (sans etre condescendant)
   - 3 conseils pratiques pour la premiere semaine de traitement
   - Information sur les effets secondaires possibles (rassurant)
   - Invitation a contacter le cabinet si besoin
   - Rappel du prochain RDV de controle

Criteres de reussite :
- Ton empathique et rassurant (pas clinique ni froid)
- Aucune mention du diagnostic dans l'objet
- Informations pratiques et actionnables
- Maximum 200 mots (les patients ne lisent pas les pavés)
- Respecte le secret medical`,
          xpReward: 20,
        },
        {
          id: 'sante-m5-l3',
          title: 'Quiz — Communication patients',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la communication patient digitale.',
          quizQuestions: [
            {
              question: 'Quel est le taux d\'ouverture moyen d\'un SMS ?',
              options: ['50%', '75%', '98%', '100%'],
              correctIndex: 2,
              explanation: 'Les SMS ont un taux d\'ouverture de 98% et sont lus en moyenne dans les 3 minutes. C\'est le canal le plus efficace pour les communications medicales urgentes.',
            },
            {
              question: 'Peut-on mentionner un diagnostic dans un SMS ?',
              options: [
                'Oui, si le patient a donne son consentement',
                'Non, jamais — les SMS ne sont pas securises',
                'Oui, entre guillemets',
                'Uniquement en abreviation',
              ],
              correctIndex: 1,
              explanation: 'Les SMS ne sont pas chiffres et peuvent etre lus par un tiers. On ne mentionne jamais de diagnostic ou de donnee medicale dans un SMS.',
            },
            {
              question: 'Qu\'est-ce que l\'education therapeutique par IA ?',
              options: [
                'Remplacer le medecin par une IA',
                'Envoyer des sequences educatives personnalisees au patient',
                'Former les medecins a l\'IA',
                'Diagnostiquer a distance',
              ],
              correctIndex: 1,
              explanation: 'L\'education therapeutique par IA consiste a envoyer des contenus educatifs personnalises (alimentation, traitement, exercices) adaptes au profil et a la pathologie du patient.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F4E9}',
      badgeName: 'Communicant Medical',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Optimiser son cabinet
    // -----------------------------------------------------------------------
    {
      id: 'sante-m6',
      title: 'Optimiser son cabinet',
      emoji: '\u{1F3E5}',
      description: 'Pilotez votre cabinet avec les analytics, la satisfaction et la rentabilite.',
      duration: '10 min',
      lessons: [
        {
          id: 'sante-m6-l1',
          title: 'Analytics, satisfaction et rentabilite',
          duration: '5 min',
          type: 'text',
          content: `Gerer un cabinet medical sans indicateurs, c'est piloter a l'aveugle. L'IA vous donne une vision claire de votre activite et vous aide a prendre les bonnes decisions pour votre cabinet. \u{1F4CA}

Les analytics d'activite sont le premier pilier. Combien de patients par jour/semaine/mois ? Quels creneaux sont les plus demandes ? Quels types de consultations generent le plus de revenus ? L'IA compile ces donnees automatiquement et vous presente des tableaux de bord visuels. Exemple : "Vos lundis sont satures a 140% mais vos mercredis sont remplis a 65% — redistribuez 3 patients du lundi au mercredi." \u{1F4C8}

La satisfaction patient est le deuxieme pilier. L'IA envoie automatiquement un micro-questionnaire (3 questions max) apres chaque consultation : accueil, temps d'attente, qualite de la consultation. Les resultats s'agregent en un score NPS (Net Promoter Score). Un NPS au-dessus de 50 est excellent, en dessous de 30 il faut agir. L'IA vous alerte immediatement si un patient est insatisfait pour que vous puissiez reagir.

La rentabilite est le troisieme pilier. L'IA analyse vos couts (loyer, salaires, materiel, consommables) vs vos revenus par type d'acte. Vous decouvrez quels actes sont les plus rentables et lesquels sont sous-cotes. Exemple : "Vos teleconsultations ont une marge de 85% vs 45% pour les consultations physiques — augmentez votre offre teleconsultation." \u{1F4B0}

L'IA detecte aussi les opportunites : "15% de vos patients n'ont pas fait leur bilan annuel — lancez une campagne de rappel pour generer 20 consultations supplementaires ce mois." Ou : "Votre taux de remplissage chute de 30% pendant les vacances scolaires — proposez des creneaux teleconsultation pour compenser."

Le tableau de bord ideal affiche 5 indicateurs en temps reel : nombre de patients, taux de remplissage, score de satisfaction, CA mensuel et taux de no-show. Avec Freenzy, ces 5 KPI sont calcules automatiquement et consultables en un coup d'oeil depuis votre smartphone. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'sante-m6-l2',
          title: 'Jeu : Priorites du cabinet digital',
          duration: '4 min',
          type: 'game',
          content: 'Classez les actions dans l\'ordre de priorite pour digitaliser votre cabinet.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Securiser les donnees patients (RGPD + HDS)',
              'Mettre en place les rappels de RDV automatiques',
              'Deployer le secretariat IA 24h/24',
              'Automatiser la generation de documents medicaux',
              'Lancer l\'education therapeutique par email',
              'Installer le tableau de bord analytics',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
            explanation: 'La securite des donnees est toujours la priorite n1 (obligation legale). Ensuite, les rappels RDV (ROI immediat). Puis le secretariat IA (gain de temps quotidien). Les documents (productivite). L\'education therapeutique (valeur ajoutee). Et enfin les analytics (optimisation continue).',
          },
          xpReward: 20,
        },
        {
          id: 'sante-m6-l3',
          title: 'Quiz — Optimiser son cabinet',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'optimisation d\'un cabinet medical.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que le NPS (Net Promoter Score) ?',
              options: [
                'Le nombre de nouveaux patients par semaine',
                'Un indicateur de satisfaction patient base sur la recommandation',
                'Le chiffre d\'affaires mensuel',
                'Le taux de remplissage du cabinet',
              ],
              correctIndex: 1,
              explanation: 'Le NPS mesure la probabilite qu\'un patient recommande votre cabinet. Un score au-dessus de 50 est excellent, en dessous de 30 necesssite des actions correctives.',
            },
            {
              question: 'Combien d\'indicateurs doit afficher le tableau de bord ideal ?',
              options: ['1 seul (le CA)', '5 KPI cles', '20 indicateurs', '50 metriques'],
              correctIndex: 1,
              explanation: 'Le tableau de bord ideal affiche 5 KPI : patients, taux de remplissage, satisfaction, CA et taux de no-show. Trop d\'indicateurs = paralysie par l\'analyse.',
            },
            {
              question: 'Quel est le premier reflexe pour digitaliser un cabinet ?',
              options: [
                'Installer un chatbot',
                'Securiser les donnees patients (RGPD)',
                'Creer un site web',
                'Ouvrir des reseaux sociaux',
              ],
              correctIndex: 1,
              explanation: 'La securisation des donnees patients (conformite RGPD, hebergement HDS, chiffrement) est toujours la premiere etape — c\'est une obligation legale avant tout deploiement d\'outil numerique.',
            },
            {
              question: 'L\'IA peut-elle detecter des opportunites business pour votre cabinet ?',
              options: [
                'Non, elle gere uniquement les RDV',
                'Oui : bilans en retard, creneaux sous-remplis, patients a reactiver',
                'Uniquement si vous la programmez manuellement',
                'Non, c\'est le role du comptable',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse vos donnees et detecte automatiquement les opportunites : patients sans bilan annuel, creneaux vides a remplir, segments de patients a reactiver, etc.',
            },
          ],
          xpReward: 15,
        },
      ],
      passingScore: 75,
      xpReward: 50,
      badgeEmoji: '\u{1F3E5}',
      badgeName: 'Cabinet Optimise',
    },
  ],
};
