// =============================================================================
// Freenzy.io — Formations Metier Pack 4
// 3 parcours x 6 modules x 3 lessons = 54 lessons
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. IA pour Fleuristes
// =============================================================================

export const parcoursFleuristeIA: FormationParcours = {
  id: 'fleuriste-ia',
  title: 'IA pour Fleuristes',
  emoji: '\u{1F490}',
  description: 'Optimisez votre activite de fleuriste avec l\'IA : compositions florales, commandes evenements, saisonnalite, livraison, reseaux sociaux et fidelisation client.',
  category: 'metier',
  subcategory: 'artisanat',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#A855F7',
  diplomaTitle: 'Fleuriste Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Fleuristes',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Compositions florales intelligentes
    {
      id: 'fleuriste-m1',
      title: 'Compositions florales intelligentes',
      emoji: '\u{1F338}',
      description: 'Creez des compositions harmonieuses et rentables avec l\'aide de l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m1-l1',
          title: 'L\'art floral assiste par intelligence artificielle',
          duration: '4 min',
          type: 'text',
          content: `La creation de compositions florales est un art subtil qui repose sur l'harmonie des couleurs, des textures et des volumes. Pourtant, meme les fleuristes experimentes peuvent manquer d'inspiration ou hesiter face a une demande atypique. L'IA devient votre assistant creatif au quotidien, capable de suggerer des associations originales tout en respectant les regles fondamentales de l'art floral. \u{1F338}

L'assistant Freenzy analyse les tendances actuelles en matiere de bouquets et compositions. Vous decrivez le contexte — "bouquet romantique pour anniversaire de mariage, budget 60 euros, saison printemps" — et l'IA propose plusieurs combinaisons de fleurs avec les quantites exactes, les couleurs dominantes et les feuillages d'accompagnement. Chaque suggestion inclut une estimation du cout matiere pour preserver votre marge.

L'IA prend en compte la compatibilite des fleurs entre elles. Certaines varietes liberent de l'ethylene qui fane prematurement les fleurs voisines. L'assistant connait ces incompatibilites et vous alerte : "Evitez de placer des narcisses avec des tulipes dans le meme vase, la seve des narcisses est toxique pour les autres fleurs coupees." Ce type de conseil evite les retours clients mecontents. \u{2705}

Vous pouvez aussi photographier une composition existante et demander a l'IA de la reproduire avec les fleurs disponibles en stock. Elle identifie les varietes, estime les quantites et propose des substitutions si certaines fleurs manquent. Un gain de temps considerable quand un client arrive avec une photo Pinterest en disant "je veux exactement ca". L'IA calcule egalement le prix de revient et vous suggere un prix de vente coherent avec votre positionnement. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m1-l2',
          title: 'Exercice : Creer une composition sur mesure',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez une composition florale assistee par IA.',
          exercisePrompt: `Un client entre dans votre boutique avec cette demande :
- Occasion : decoration de table pour un diner de fiancailles (8 personnes)
- Style souhaite : champetre chic
- Budget : 120 euros pour 2 centres de table
- Contrainte : la fiancee est allergique au lys
- Saison : debut octobre

Redigez le brief pour l'assistant Freenzy :
1. Decrivez le style et l'ambiance recherches
2. Listez les fleurs de saison adaptees (hors lys)
3. Precisez les dimensions souhaitees pour un centre de table
4. Indiquez votre objectif de marge sur cette commande.`,
          xpReward: 20,
        },
        {
          id: 'fleuriste-m1-l3',
          title: 'Quiz — Compositions florales IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la creation de compositions avec l\'IA.',
          quizQuestions: [
            {
              question: 'Pourquoi l\'IA verifie-t-elle la compatibilite des fleurs ?',
              options: [
                'Pour des raisons esthetiques uniquement',
                'Certaines fleurs liberent des substances nocives pour les autres',
                'Pour reduire le poids du bouquet',
                'Pour simplifier l\'emballage',
              ],
              correctIndex: 1,
              explanation: 'Certaines fleurs comme les narcisses liberent de l\'ethylene ou des seves toxiques qui fanent prematurement les fleurs voisines.',
            },
            {
              question: 'Que peut faire l\'IA a partir d\'une photo de composition ?',
              options: [
                'Rien, elle ne traite pas les images',
                'Identifier les varietes et proposer des substitutions',
                'Commander automatiquement les fleurs',
                'Imprimer un duplicata en plastique',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les varietes sur la photo, estime les quantites et propose des alternatives avec les fleurs en stock.',
            },
            {
              question: 'Quel element financier l\'IA integre-t-elle dans ses suggestions ?',
              options: [
                'Le salaire du fleuriste',
                'Le loyer de la boutique',
                'Le cout matiere et la marge',
                'Les impots annuels',
              ],
              correctIndex: 2,
              explanation: 'Chaque suggestion inclut une estimation du cout matiere pour que le fleuriste preserve sa marge commerciale.',
            },
            {
              question: 'Quel contexte faut-il donner a l\'IA pour une composition reussie ?',
              options: [
                'Juste la couleur preferee',
                'L\'occasion, le budget, la saison et le style',
                'Uniquement le prix maximum',
                'Le nom du destinataire',
              ],
              correctIndex: 1,
              explanation: 'Plus le contexte est riche (occasion, budget, saison, style), plus la suggestion de l\'IA sera pertinente et adaptee.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F338}',
      badgeName: 'Artiste Floral',
    },
    // Module 2 — Commandes evenements
    {
      id: 'fleuriste-m2',
      title: 'Gestion des commandes evenements',
      emoji: '\u{1F389}',
      description: 'Gerez efficacement les grosses commandes pour mariages, entreprises et ceremonies.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m2-l1',
          title: 'Piloter les commandes evenementielles avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Les commandes evenementielles representent souvent 40% du chiffre d'affaires d'un fleuriste, mais elles sont aussi les plus complexes a gerer. Un mariage avec 15 centres de table, une arche florale, des boutonnieres et un bouquet de mariee demande une logistique sans faille. L'IA transforme cette complexite en processus structure et fiable. \u{1F389}

L'assistant Freenzy vous aide des le premier rendez-vous client. Vous saisissez les elements cles : date, lieu, nombre d'invites, theme, budget global et preferences de fleurs. L'IA genere immediatement un devis detaille avec chaque element chiffre : "Arche florale : 280 euros (pivoines, roses David Austin, eucalyptus), 15 centres de table : 45 euros piece = 675 euros, bouquet mariee : 120 euros." Le client visualise la repartition de son budget en temps reel.

La gestion des delais est cruciale. L'IA cree un retroplanning automatique : commande aux grossistes 10 jours avant, reception et controle qualite 3 jours avant, preparation des compositions la veille, livraison et installation le jour J. Chaque etape declenchera un rappel pour ne rien oublier. Elle prend en compte les delais specifiques de certaines fleurs importees. \u{2705}

L'IA anticipe aussi les risques. Si vous commandez des pivoines en juillet, elle vous alertera : "Les pivoines sont hors saison en juillet, disponibilite incertaine. Alternatives suggerees : roses Juliet, dahlias, renoncules." Elle peut meme contacter vos fournisseurs habituels par email pour verifier la disponibilite et les tarifs, vous faisant gagner des heures de telephone.

Le suivi post-evenement est aussi gere. L'IA envoie automatiquement un message de remerciement au client 3 jours apres l'evenement, avec une demande d'avis Google et une offre de fidelite pour une prochaine commande. Ces petites attentions generent des recommandations et fidelisent votre clientele evenementielle. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m2-l2',
          title: 'Jeu : Retroplanning evenement',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes de preparation d\'un mariage floral.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'J-30', right: 'Premier rendez-vous et devis' },
              { left: 'J-10', right: 'Commande aux grossistes' },
              { left: 'J-3', right: 'Reception et controle qualite' },
              { left: 'J-1', right: 'Preparation des compositions' },
              { left: 'Jour J', right: 'Livraison et installation sur site' },
              { left: 'J+3', right: 'Message remerciement et avis Google' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'fleuriste-m2-l3',
          title: 'Quiz — Commandes evenements',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la gestion evenementielle.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du CA les evenements representent-ils souvent ?',
              options: ['10%', '25%', '40%', '60%'],
              correctIndex: 2,
              explanation: 'Les commandes evenementielles representent souvent 40% du chiffre d\'affaires d\'un fleuriste.',
            },
            {
              question: 'Combien de jours avant l\'evenement faut-il commander aux grossistes ?',
              options: ['2 jours', '5 jours', '10 jours', '30 jours'],
              correctIndex: 2,
              explanation: 'L\'IA recommande de passer les commandes grossistes 10 jours avant pour securiser la disponibilite des fleurs.',
            },
            {
              question: 'Que fait l\'IA si une fleur est hors saison ?',
              options: [
                'Elle annule la commande',
                'Elle propose des alternatives de saison',
                'Elle augmente le prix',
                'Elle ignore le probleme',
              ],
              correctIndex: 1,
              explanation: 'L\'IA alerte sur la disponibilite incertaine et suggere des alternatives de saison equivalentes en style.',
            },
            {
              question: 'Quel suivi post-evenement l\'IA automatise-t-elle ?',
              options: [
                'L\'envoi de la facture uniquement',
                'Un message de remerciement avec demande d\'avis',
                'L\'archivage des photos',
                'La commande de nouvelles fleurs',
              ],
              correctIndex: 1,
              explanation: 'L\'IA envoie un remerciement 3 jours apres avec demande d\'avis Google et offre de fidelite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F389}',
      badgeName: 'Expert Evenements',
    },
    // Module 3 — Saisonnalite et approvisionnement
    {
      id: 'fleuriste-m3',
      title: 'Saisonnalite et approvisionnement',
      emoji: '\u{1F33B}',
      description: 'Anticipez les saisons et optimisez vos commandes fournisseurs avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m3-l1',
          title: 'Maitriser la saisonnalite avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La saisonnalite est le plus grand defi du metier de fleuriste. Les prix fluctuent enormement selon les periodes : les roses rouges triplent de prix a la Saint-Valentin, les chrysanthemes sont surabondants a la Toussaint, et certaines varietes ne sont disponibles que quelques semaines par an. L'IA vous aide a transformer cette contrainte en avantage concurrentiel. \u{1F33B}

L'assistant Freenzy integre un calendrier floral complet couvrant plus de 200 varietes avec leurs periodes de disponibilite, leur origine geographique et leurs prix moyens mois par mois. Quand un client demande des pivoines en novembre, vous pouvez instantanement proposer des alternatives visuellement proches et disponibles : "Les renoncules offrent un aspect similaire aux pivoines et sont en pleine saison de novembre a mars, a un tiers du prix."

La gestion des commandes fournisseurs est optimisee par l'analyse predictive. L'IA etudie votre historique de ventes sur les 12 derniers mois et croise ces donnees avec le calendrier des fetes, la meteo prevue et les tendances locales. Elle genere une prevision de commande hebdomadaire : quantites par variete, fournisseur recommande et date optimale de commande pour chaque reference. \u{2705}

L'IA surveille aussi les cours du marche aux fleurs. Elle compare les prix de vos fournisseurs habituels avec ceux du marche de Rungis ou des importateurs hollandais et vous alerte quand une opportunite se presente : "Les tulipes hollandaises sont 30% moins cheres cette semaine chez votre fournisseur B." Cette veille tarifaire peut vous faire economiser 15 a 20% sur vos achats annuels.

La gestion de la perte est un enjeu majeur. En moyenne, un fleuriste jette 20% de son stock chaque semaine. L'IA reduit ce gaspillage en ajustant finement les quantites commandees selon les previsions de vente et en suggerant des promotions flash sur les fleurs qui arrivent en fin de vie. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m3-l2',
          title: 'Exercice : Planifier les commandes saisonnieres',
          duration: '3 min',
          type: 'exercise',
          content: 'Optimisez votre approvisionnement pour le mois de fevrier.',
          exercisePrompt: `Vous etes fleuriste et le mois de fevrier approche. Voici votre contexte :
- Saint-Valentin = 50% de votre CA mensuel
- Stock actuel : roses rouges (peu), tulipes (beaucoup), eucalyptus (moyen)
- 3 fournisseurs : local (cher, rapide), Rungis (moyen, 48h), Hollande (pas cher, 5 jours)
- Perte habituelle en fevrier : 25% du stock

Redigez le brief pour l'assistant Freenzy :
1. Estimez les quantites de roses necessaires pour la Saint-Valentin
2. Proposez un calendrier de commande multi-fournisseurs
3. Identifiez des alternatives moins cheres aux roses rouges
4. Proposez une strategie pour reduire la perte post-14 fevrier.`,
          xpReward: 20,
        },
        {
          id: 'fleuriste-m3-l3',
          title: 'Quiz — Saisonnalite',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la saisonnalite et l\'approvisionnement.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de stock un fleuriste jette-t-il en moyenne par semaine ?',
              options: ['5%', '10%', '20%', '35%'],
              correctIndex: 2,
              explanation: 'En moyenne, un fleuriste jette 20% de son stock chaque semaine, un gaspillage que l\'IA peut reduire significativement.',
            },
            {
              question: 'Combien de varietes le calendrier floral de l\'IA couvre-t-il ?',
              options: ['50', '100', '200+', '500'],
              correctIndex: 2,
              explanation: 'Le calendrier floral integre couvre plus de 200 varietes avec periodes de disponibilite, origines et prix moyens.',
            },
            {
              question: 'Combien peut-on economiser grace a la veille tarifaire IA ?',
              options: ['5%', '10%', '15 a 20%', '40%'],
              correctIndex: 2,
              explanation: 'La comparaison automatique des prix entre fournisseurs permet d\'economiser 15 a 20% sur les achats annuels.',
            },
            {
              question: 'Quelle alternative l\'IA suggere-t-elle aux pivoines en novembre ?',
              options: ['Des roses', 'Des renoncules', 'Des orchidees', 'Des tournesols'],
              correctIndex: 1,
              explanation: 'Les renoncules, visuellement proches des pivoines, sont en pleine saison de novembre a mars et coutent trois fois moins cher.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F33B}',
      badgeName: 'Maitre des Saisons',
    },
    // Module 4 — Livraison optimisee
    {
      id: 'fleuriste-m4',
      title: 'Livraison et logistique optimisees',
      emoji: '\u{1F69A}',
      description: 'Optimisez vos tournees de livraison et la chaine du froid avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m4-l1',
          title: 'Optimiser les livraisons florales avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La livraison est devenue un service incontournable pour les fleuristes. Depuis la pandemie, les commandes en ligne representent entre 25 et 35% du chiffre d'affaires des boutiques qui proposent ce service. Mais livrer des fleurs n'est pas comme livrer un colis : la fragilite des compositions, la chaine du froid et les contraintes horaires rendent la logistique particulierement delicate. L'IA simplifie tout cela. \u{1F69A}

L'assistant Freenzy optimise vos tournees de livraison en temps reel. Vous saisissez les adresses du jour et l'IA calcule l'itineraire optimal en tenant compte du trafic, des creneaux horaires demandes par les clients et du temps de preparation de chaque commande. Une tournee de 8 livraisons qui prenait 3 heures passe a 2 heures grace a l'optimisation des trajets.

La gestion de la chaine du froid est automatisee. L'IA vous rappelle quelles compositions doivent rester au frais jusqu'au dernier moment et calcule l'ordre de chargement du vehicule en consequence : les compositions les plus fragiles en dernier (livrees en premier). Elle tient compte de la temperature exterieure et vous alerte en cas de canicule. \u{2705}

Le suivi client est entierement automatise. Des que le livreur part, le destinataire recoit un SMS avec un creneau de livraison estime. A la livraison, le livreur prend une photo comme preuve et le client recoit une notification avec la photo de son bouquet livre. En cas d'absence, l'IA propose immediatement un nouveau creneau ou un point relais partenaire.

L'analyse des donnees de livraison vous aide a prendre de meilleures decisions. L'IA identifie les zones geographiques les plus rentables, les creneaux horaires les plus demandes et le taux de satisfaction par livreur. Ces metriques vous permettent d'ajuster vos zones de livraison et vos tarifs pour maximiser la rentabilite de ce service. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m4-l2',
          title: 'Jeu : Ordre de chargement',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque type de composition a sa contrainte de livraison.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Bouquet de roses', right: 'Maintenir entre 2 et 5 degres' },
              { left: 'Composition en mousse', right: 'Transporter a plat, ne pas incliner' },
              { left: 'Orchidee en pot', right: 'Proteger du courant d\'air' },
              { left: 'Couronne funeraire', right: 'Charger en premier, livrer en dernier' },
              { left: 'Centre de table bas', right: 'Caler pour eviter le glissement' },
              { left: 'Bouquet de mariee', right: 'Livrer en dernier, au plus pres de l\'heure' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'fleuriste-m4-l3',
          title: 'Quiz — Livraison florale',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la logistique de livraison.',
          quizQuestions: [
            {
              question: 'Quel gain de temps l\'optimisation IA apporte-t-elle sur une tournee de 8 livraisons ?',
              options: ['15 minutes', '30 minutes', '1 heure', '2 heures'],
              correctIndex: 2,
              explanation: 'Une tournee de 8 livraisons passe de 3 heures a 2 heures grace a l\'optimisation des trajets par l\'IA.',
            },
            {
              question: 'Que recoit le destinataire a la livraison ?',
              options: [
                'Un simple SMS de confirmation',
                'Une notification avec photo du bouquet livre',
                'Un appel du fleuriste',
                'Rien de particulier',
              ],
              correctIndex: 1,
              explanation: 'Le livreur prend une photo comme preuve et le client recoit une notification avec la photo de son bouquet.',
            },
            {
              question: 'Comment l\'IA gere-t-elle l\'ordre de chargement ?',
              options: [
                'Par ordre alphabetique des clients',
                'Les plus fragiles en dernier (livrees en premier)',
                'Par taille du bouquet',
                'Aleatoirement',
              ],
              correctIndex: 1,
              explanation: 'Les compositions les plus fragiles sont chargees en dernier pour etre livrees en premier et minimiser le temps en vehicule.',
            },
            {
              question: 'Quel pourcentage du CA la livraison represente-t-elle pour les boutiques equipees ?',
              options: ['5 a 10%', '15 a 20%', '25 a 35%', '50%+'],
              correctIndex: 2,
              explanation: 'Les commandes en ligne representent entre 25 et 35% du chiffre d\'affaires des boutiques proposant la livraison.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F69A}',
      badgeName: 'Logisticien Floral',
    },
    // Module 5 — Reseaux sociaux
    {
      id: 'fleuriste-m5',
      title: 'Reseaux sociaux pour fleuristes',
      emoji: '\u{1F4F1}',
      description: 'Developpez votre presence en ligne et attirez de nouveaux clients.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m5-l1',
          title: 'Developper sa visibilite en ligne avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le metier de fleuriste est profondement visuel, ce qui en fait l'un des secteurs les plus adaptes aux reseaux sociaux. Un beau bouquet photographie avec soin peut generer des dizaines de commandes. Pourtant, beaucoup de fleuristes n'ont ni le temps ni les competences pour alimenter regulierement leurs comptes. L'IA resout ce probleme en automatisant la creation de contenu. \u{1F4F1}

L'assistant Freenzy genere un calendrier editorial mensuel adapte a votre activite. Il prend en compte les fetes commerciales (Saint-Valentin, fete des meres, Toussaint), les saisons florales et les tendances du moment. Pour chaque publication, l'IA redige la legende, suggere les hashtags pertinents et recommande le meilleur horaire de publication selon votre audience.

La creation de contenu photo et video est simplifiee. L'IA vous guide pour photographier vos compositions avec les bons angles et la bonne lumiere naturelle. Elle peut aussi generer des visuels promotionnels : "Offre Saint-Valentin : bouquet Passion a 49 euros — livraison offerte." Le visuel est cree aux dimensions exactes pour Instagram, Facebook ou Google My Business. \u{2705}

La gestion des avis clients est automatisee. Apres chaque achat ou livraison, l'IA envoie une demande d'avis personnalisee. Pour les avis negatifs, elle vous alerte immediatement et vous propose un brouillon de reponse empathique et professionnelle. Les statistiques montrent qu'un fleuriste avec plus de 50 avis Google et une note superieure a 4.5 attire 3 fois plus de clients qu'un concurrent sans avis.

L'IA analyse aussi les performances de vos publications. Elle identifie les types de contenu qui generent le plus d'engagement — les coulisses de preparation fonctionnent souvent mieux que les photos de produits finis — et ajuste le calendrier editorial en consequence. Vous construisez ainsi une communaute fidele qui se transforme en clientele reguliere. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m5-l2',
          title: 'Exercice : Calendrier editorial floral',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez un plan de publications pour le mois de mai.',
          exercisePrompt: `Le mois de mai est crucial pour les fleuristes (fete des meres, muguet du 1er mai). Voici votre situation :
- Boutique de quartier avec 800 abonnes Instagram
- Vous faites 2 posts par semaine actuellement
- Votre meilleur post : une video de creation de bouquet (1200 vues)
- Fete des meres : votre plus grosse journee de l'annee

Redigez le brief pour l'assistant Freenzy :
1. Proposez un calendrier de 8 publications pour mai
2. Pour chaque post, indiquez le type (photo, video, story, reel)
3. Integrez au moins 2 contenus "coulisses"
4. Prevoyez une campagne specifique fete des meres (teasing, offre, rappel).`,
          xpReward: 20,
        },
        {
          id: 'fleuriste-m5-l3',
          title: 'Quiz — Reseaux sociaux fleuriste',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le marketing digital floral.',
          quizQuestions: [
            {
              question: 'Quel type de contenu genere le plus d\'engagement pour un fleuriste ?',
              options: [
                'Les photos de produits finis',
                'Les coulisses de preparation',
                'Les promotions en texte seul',
                'Les citations inspirantes',
              ],
              correctIndex: 1,
              explanation: 'Les coulisses de preparation generent souvent plus d\'engagement que les photos de produits finis car elles humanisent la marque.',
            },
            {
              question: 'Combien d\'avis Google faut-il viser pour attirer significativement plus de clients ?',
              options: ['10 avis', '25 avis', '50+ avis', '200 avis'],
              correctIndex: 2,
              explanation: 'Un fleuriste avec plus de 50 avis Google et une note superieure a 4.5 attire 3 fois plus de clients.',
            },
            {
              question: 'Que genere l\'IA pour chaque publication planifiee ?',
              options: [
                'Uniquement la photo',
                'La legende, les hashtags et l\'horaire optimal',
                'Juste les hashtags',
                'Un lien vers le site web',
              ],
              correctIndex: 1,
              explanation: 'L\'IA redige la legende complete, suggere les hashtags pertinents et recommande l\'horaire de publication optimal.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les avis negatifs ?',
              options: [
                'Elle les supprime automatiquement',
                'Elle alerte et propose un brouillon de reponse',
                'Elle les ignore',
                'Elle repond sans votre validation',
              ],
              correctIndex: 1,
              explanation: 'L\'IA alerte immediatement le fleuriste et propose un brouillon de reponse empathique et professionnelle pour validation.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4F1}',
      badgeName: 'Influenceur Floral',
    },
    // Module 6 — Fidelisation client
    {
      id: 'fleuriste-m6',
      title: 'Fidelisation et relation client',
      emoji: '\u{1F496}',
      description: 'Transformez vos clients occasionnels en ambassadeurs fideles.',
      duration: '10 min',
      lessons: [
        {
          id: 'fleuriste-m6-l1',
          title: 'Fideliser avec l\'intelligence artificielle',
          duration: '4 min',
          type: 'text',
          content: `Acquerir un nouveau client coute 5 fois plus cher que de fideliser un client existant. Pour un fleuriste, la fidelisation est d'autant plus strategique que les occasions d'achat se repetent tout au long de l'annee : anniversaires, fetes, remerciements, deuils. L'IA vous permet de ne jamais manquer une opportunite de recontacter vos clients au bon moment. \u{1F496}

L'assistant Freenzy cree un profil intelligent pour chaque client. Il memorise les preferences de fleurs, les dates importantes (anniversaire de mariage, fete des meres), le budget moyen et l'historique des achats. Deux semaines avant chaque date cle, l'IA envoie un rappel personnalise : "L'anniversaire de mariage de M. Dupont est dans 15 jours. L'annee derniere, il avait commande un bouquet de pivoines roses a 65 euros."

Le programme de fidelite est entierement automatise. Chaque achat genere des points convertibles en avantages : livraison gratuite, fleur en cadeau, remise sur la prochaine commande. L'IA segmente vos clients en categories — occasionnels, reguliers, VIP — et adapte les recompenses : les clients VIP recoivent des offres exclusives sur les nouvelles collections avant tout le monde. \u{2705}

Les campagnes de reactivation ciblent les clients dormants. Si un client habitue n'est pas revenu depuis 3 mois, l'IA lui envoie un message personnalise avec une offre incitative : "Votre derniere visite remonte au 15 janvier. Pour vous remercier de votre fidelite, profitez de -15% sur votre prochain bouquet." Le taux de reactivation moyen de ces campagnes atteint 22%.

L'IA genere aussi des rapports mensuels sur votre base client : nombre de nouveaux clients, taux de retention, panier moyen par segment, et clients a risque de depart. Ces metriques vous permettent d'ajuster votre strategie et d'investir votre energie la ou elle a le plus d'impact sur votre chiffre d'affaires. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'fleuriste-m6-l2',
          title: 'Exercice : Programme de fidelite floral',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez un programme de fidelite pour votre boutique.',
          exercisePrompt: `Votre boutique compte 400 clients dans sa base, dont :
- 50 clients VIP (achat mensuel, panier moyen 75 euros)
- 150 clients reguliers (1 achat tous les 2-3 mois, panier moyen 40 euros)
- 200 clients occasionnels (1-2 achats par an, panier moyen 30 euros)

Redigez le brief pour l'assistant Freenzy :
1. Definissez les paliers de votre programme de fidelite (points, avantages)
2. Proposez 3 actions automatisees pour fideliser les VIP
3. Imaginez une campagne de reactivation pour les 200 clients occasionnels
4. Identifiez les dates cles a exploiter sur les 6 prochains mois.`,
          xpReward: 20,
        },
        {
          id: 'fleuriste-m6-l3',
          title: 'Quiz — Fidelisation fleuriste',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la fidelisation client.',
          quizQuestions: [
            {
              question: 'Combien coute l\'acquisition d\'un nouveau client par rapport a la fidelisation ?',
              options: ['2 fois plus', '3 fois plus', '5 fois plus', '10 fois plus'],
              correctIndex: 2,
              explanation: 'Acquerir un nouveau client coute 5 fois plus cher que de fideliser un client existant.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle un rappel pour une date importante ?',
              options: ['La veille', '1 semaine avant', '2 semaines avant', '1 mois avant'],
              correctIndex: 2,
              explanation: 'L\'IA envoie un rappel personnalise 2 semaines avant chaque date cle du client.',
            },
            {
              question: 'Quel est le taux de reactivation moyen des campagnes IA ?',
              options: ['5%', '12%', '22%', '40%'],
              correctIndex: 2,
              explanation: 'Les campagnes de reactivation automatisees atteignent un taux de reactivation moyen de 22%.',
            },
            {
              question: 'En combien de segments l\'IA classe-t-elle les clients ?',
              options: ['2 (fidele / non fidele)', '3 (occasionnel, regulier, VIP)', '5 niveaux', '10 categories'],
              correctIndex: 1,
              explanation: 'L\'IA segmente les clients en 3 categories — occasionnels, reguliers, VIP — avec des recompenses adaptees.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F496}',
      badgeName: 'Fidalisateur Floral',
    },
  ],
};

// =============================================================================
// 2. IA pour Boulangers
// =============================================================================

export const parcoursBoulangerIA: FormationParcours = {
  id: 'boulanger-ia',
  title: 'IA pour Boulangers',
  emoji: '\u{1F35E}',
  description: 'Optimisez votre boulangerie avec l\'IA : gestion des stocks d\'ingredients, planning de production, tendances, reseaux sociaux, fidelisation et comptabilite.',
  category: 'metier',
  subcategory: 'artisanat',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F97316',
  diplomaTitle: 'Boulanger Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Boulangers',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Gestion stock ingredients
    {
      id: 'boulanger-m1',
      title: 'Gestion intelligente des stocks',
      emoji: '\u{1F33E}',
      description: 'Optimisez vos commandes de farine, levure et ingredients avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m1-l1',
          title: 'Gerer ses stocks d\'ingredients avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La gestion des stocks est le nerf de la guerre en boulangerie. Entre la farine qui represente 30% de vos couts matiere, la levure fraiche qui ne se conserve que 3 semaines, le beurre dont le prix varie de 20% selon la saison et les fruits secs pour vos viennoiseries speciales, maintenir le bon niveau de stock releve de l'equilibrisme permanent. L'IA transforme cette gestion en pilotage automatise. \u{1F33E}

L'assistant Freenzy connecte votre production quotidienne a vos stocks d'ingredients. Vous indiquez vos recettes — "baguette tradition : 350g farine T65, 7g levure, 7g sel, 245ml eau" — et l'IA calcule automatiquement la consommation journaliere en fonction de votre volume de production. Si vous produisez 200 baguettes par jour, elle sait que vous consommez 70 kg de farine T65 quotidiennement.

Le systeme d'alerte anticipe les ruptures. L'IA connait les delais de livraison de chaque fournisseur et declenche une commande suggeree avant que le stock ne devienne critique. "Stock farine T65 : 210 kg restants, soit 3 jours de production. Commande suggeree : 500 kg chez Moulin Dupont, livraison sous 48h." Vous validez en un clic et la commande part par email au fournisseur. \u{2705}

L'analyse des prix est un avantage concurrentiel majeur. L'IA compare les tarifs de vos fournisseurs et vous alerte sur les opportunites : "Le beurre AOP Charentes est 15% moins cher chez le fournisseur B ce mois-ci. Economie potentielle : 180 euros sur votre commande mensuelle." Elle prend aussi en compte la qualite : si un ingredient moins cher degrade vos recettes, elle le signale.

La reduction du gaspillage est mesurable. L'IA detecte les pertes recurrentes — "Vous jetez en moyenne 2 kg de levure fraiche par semaine, passez a des livraisons bi-hebdomadaires au lieu d'hebdomadaires" — et estime les economies realisables. En moyenne, les boulangeries utilisant l'IA reduisent leur gaspillage d'ingredients de 18%. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m1-l2',
          title: 'Jeu : Ingredients et conservation',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque ingredient a sa duree de conservation optimale.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Farine T65', right: '6 mois au sec' },
              { left: 'Levure fraiche', right: '3 semaines au frais' },
              { left: 'Beurre AOP', right: '2 mois entre 2 et 6 degres' },
              { left: 'Oeufs frais', right: '28 jours apres ponte' },
              { left: 'Chocolat de couverture', right: '12 mois a 18 degres' },
              { left: 'Levain liquide', right: '1 semaine au refrigerateur' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'boulanger-m1-l3',
          title: 'Quiz — Gestion des stocks',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion des stocks en boulangerie.',
          quizQuestions: [
            {
              question: 'Quel pourcentage des couts matiere la farine represente-t-elle ?',
              options: ['10%', '20%', '30%', '50%'],
              correctIndex: 2,
              explanation: 'La farine represente environ 30% des couts matiere en boulangerie, c\'est le poste le plus important.',
            },
            {
              question: 'De combien l\'IA reduit-elle le gaspillage d\'ingredients en moyenne ?',
              options: ['5%', '10%', '18%', '30%'],
              correctIndex: 2,
              explanation: 'Les boulangeries utilisant l\'IA reduisent leur gaspillage d\'ingredients de 18% en moyenne.',
            },
            {
              question: 'Que fait l\'IA quand le stock devient critique ?',
              options: [
                'Elle arrete la production',
                'Elle suggere une commande avec quantite et fournisseur',
                'Elle envoie un SMS au patron',
                'Elle augmente les prix de vente',
              ],
              correctIndex: 1,
              explanation: 'L\'IA declenche une commande suggeree avec quantite, fournisseur recommande et delai de livraison estime.',
            },
            {
              question: 'Quel critere l\'IA verifie-t-elle au-dela du prix des ingredients ?',
              options: [
                'La marque du fournisseur',
                'L\'impact sur la qualite des recettes',
                'La couleur de l\'emballage',
                'Le mode de livraison',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie que le changement d\'ingredient moins cher ne degrade pas la qualite des recettes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F33E}',
      badgeName: 'Maitre des Stocks',
    },
    // Module 2 — Planning de production
    {
      id: 'boulanger-m2',
      title: 'Planning de production intelligent',
      emoji: '\u{23F0}',
      description: 'Optimisez vos fournees et votre organisation quotidienne avec l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m2-l1',
          title: 'Planifier la production comme un chef',
          duration: '4 min',
          type: 'text',
          content: `Le planning de production est l'element central de la boulangerie. Chaque jour, il faut decider combien de baguettes, de pains speciaux, de croissants et de patisseries produire. Trop peu signifie des clients decus et du chiffre d'affaires perdu. Trop signifie du gaspillage et de la marge envolee. L'IA vous aide a trouver le juste equilibre chaque jour. \u{23F0}

L'assistant Freenzy analyse votre historique de ventes jour par jour, heure par heure. Il identifie les tendances : "Le lundi, vous vendez 15% de baguettes en moins mais 20% de viennoiseries en plus. Le samedi, les pains speciaux se vendent 40% mieux que la semaine." Ces donnees alimentent un modele predictif qui genere chaque soir le planning de production du lendemain avec des quantites precises par produit.

L'IA integre aussi les facteurs exterieurs. La meteo influence fortement les ventes : par temps froid, les brioches et pains au chocolat se vendent mieux; en ete, la demande de sandwichs et salades augmente. Le calendrier scolaire, les jours feries et les evenements locaux sont aussi pris en compte. "Dimanche prochain : marche aux puces dans le quartier, prevoir 30% de production supplementaire." \u{2705}

La gestion des fournees est optimisee pour le four. L'IA organise l'ordre de cuisson pour maximiser l'utilisation du four : les produits qui necessitent la meme temperature sont regroupes, les temps morts entre fournees sont minimises. Un boulanger qui fait 6 fournees par matinee peut souvent passer a 5 grace a cette optimisation, gagnant 45 minutes chaque matin.

Le suivi des invendus alimente un cercle vertueux. Chaque soir, vous saisissez les quantites restantes et l'IA affine ses previsions pour les jours suivants. En 3 mois d'utilisation, le taux d'invendus passe en moyenne de 12% a 5%, soit une economie directe sur la marge. L'IA peut aussi suggerer des partenariats avec des applications anti-gaspi pour valoriser les invendus restants. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m2-l2',
          title: 'Exercice : Planifier une journee de production',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez le planning de production d\'un samedi type.',
          exercisePrompt: `Vous etes boulanger et vous preparez le planning de samedi prochain. Voici vos donnees :
- Samedi moyen : 300 baguettes, 80 croissants, 50 pains au chocolat, 30 pains speciaux
- Ce samedi : brocante dans la rue (affluence +30%)
- Meteo prevue : 22 degres, ensoleille
- Votre four : capacite 40 baguettes ou 60 viennoiseries par fournee
- Horaires : debut 4h, ouverture boutique 7h

Redigez le brief pour l'assistant Freenzy :
1. Estimez les quantites ajustees pour ce samedi special
2. Proposez un ordre de fournees optimise (heure par heure)
3. Prevoyez une production supplementaire en cours de matinee si besoin
4. Definissez votre seuil d'invendus acceptable et votre plan anti-gaspi.`,
          xpReward: 20,
        },
        {
          id: 'boulanger-m2-l3',
          title: 'Quiz — Planning production',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la planification de production.',
          quizQuestions: [
            {
              question: 'De combien le taux d\'invendus diminue-t-il en 3 mois avec l\'IA ?',
              options: ['De 12% a 10%', 'De 12% a 8%', 'De 12% a 5%', 'De 12% a 0%'],
              correctIndex: 2,
              explanation: 'En 3 mois d\'utilisation, le taux d\'invendus passe en moyenne de 12% a 5% grace aux previsions affinee par l\'IA.',
            },
            {
              question: 'Quel facteur exterieur influence les ventes de viennoiseries ?',
              options: [
                'Le cours de la bourse',
                'La meteo (temps froid = plus de viennoiseries)',
                'L\'horoscope du jour',
                'La couleur de la vitrine',
              ],
              correctIndex: 1,
              explanation: 'Par temps froid, les brioches et pains au chocolat se vendent significativement mieux.',
            },
            {
              question: 'Combien de temps gagne un boulanger grace a l\'optimisation du four ?',
              options: ['10 minutes', '20 minutes', '45 minutes', '2 heures'],
              correctIndex: 2,
              explanation: 'En regroupant les produits a meme temperature, on passe de 6 a 5 fournees, soit 45 minutes gagnees chaque matin.',
            },
            {
              question: 'Quand l\'IA genere-t-elle le planning de production ?',
              options: [
                'Le matin a 4h',
                'Chaque soir pour le lendemain',
                'Une semaine a l\'avance',
                'En temps reel pendant la production',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere chaque soir le planning de production du lendemain avec des quantites precises par produit.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{23F0}',
      badgeName: 'Planificateur Expert',
    },
    // Module 3 — Tendances et innovation
    {
      id: 'boulanger-m3',
      title: 'Tendances et innovation produit',
      emoji: '\u{1F4A1}',
      description: 'Detectez les tendances et creez de nouveaux produits qui plaisent.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m3-l1',
          title: 'Innover en boulangerie avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le marche de la boulangerie evolue rapidement. Les consommateurs recherchent des produits sains, des farines alternatives, du sans gluten, des recettes veganes, des pains aux graines exotiques. Le boulanger qui reste sur ses classiques risque de voir sa clientele s'eroder au profit de concurrents plus innovants. L'IA vous aide a rester a la pointe des tendances sans perdre votre identite artisanale. \u{1F4A1}

L'assistant Freenzy surveille les tendances alimentaires en temps reel. Il analyse les recherches Google, les publications Instagram et les articles specialises pour identifier les produits montants. "Le pain au charbon vegetal gagne 45% de recherches ce trimestre. Le babka au chocolat explose sur Instagram avec 2 millions de posts. Les viennoiseries a la pistache sont la tendance numero 1 en patisserie cette saison."

La creation de nouvelles recettes est assistee. Vous indiquez vos contraintes — "Je veux creer un pain special avec du curcuma, compatible avec mon petrin actuel, poids final 400g, conservation 3 jours minimum" — et l'IA genere une recette detaillee avec les proportions, les temps de pousse, la temperature de cuisson et les ajustements necessaires pour votre four. Elle anticipe meme les questions des clients sur les allergenes. \u{2705}

Le test de marche est simplifie. Avant de lancer un nouveau produit, l'IA vous aide a creer un sondage sur vos reseaux sociaux ou aupres de vos clients en boutique. Elle analyse les retours et vous donne une estimation de la demande : "68% des repondants sont interesses par un pain aux graines de chia, lancement recommande." Elle calcule aussi le prix de vente optimal en fonction du cout de revient et du positionnement de votre boulangerie.

L'IA identifie egalement les opportunites de diversification rentables. En analysant vos ventes, elle peut suggerer : "Vos viennoiseries representent 45% de votre marge mais seulement 25% de vos references. Ajoutez 3 nouvelles viennoiseries pour augmenter votre marge de 12%." Ces recommandations data-driven completent votre intuition d'artisan. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m3-l2',
          title: 'Jeu : Tendances boulangerie 2026',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque tendance a son potentiel commercial.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Pain au levain naturel', right: 'Tendance forte et durable' },
              { left: 'Viennoiseries pistache', right: 'Buzz Instagram en pleine croissance' },
              { left: 'Pain sans gluten', right: 'Niche rentable a forte marge' },
              { left: 'Babka chocolat', right: 'Produit viral photogenique' },
              { left: 'Pain aux cereales anciennes', right: 'Clientele sante et bio' },
              { left: 'Croissant cube', right: 'Tendance ephemere a tester prudemment' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'boulanger-m3-l3',
          title: 'Quiz — Tendances boulangerie',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'innovation en boulangerie.',
          quizQuestions: [
            {
              question: 'Quel outil l\'IA utilise-t-elle pour detecter les tendances ?',
              options: [
                'Les catalogues fournisseurs uniquement',
                'Les recherches Google, Instagram et articles specialises',
                'Les recettes de grand-mere',
                'Les emissions de television',
              ],
              correctIndex: 1,
              explanation: 'L\'IA croise les recherches Google, les publications Instagram et les articles specialises pour identifier les tendances montantes.',
            },
            {
              question: 'Que propose l\'IA avant de lancer un nouveau produit ?',
              options: [
                'D\'acheter un nouveau four',
                'Un test de marche via sondage clients',
                'De copier le concurrent',
                'D\'attendre 6 mois',
              ],
              correctIndex: 1,
              explanation: 'L\'IA aide a creer un sondage clients et analyse les retours pour estimer la demande avant le lancement.',
            },
            {
              question: 'Quel pourcentage de la marge les viennoiseries representent-elles souvent ?',
              options: ['15%', '25%', '35%', '45%'],
              correctIndex: 3,
              explanation: 'Les viennoiseries representent souvent 45% de la marge d\'une boulangerie, ce qui en fait un levier de croissance prioritaire.',
            },
            {
              question: 'Que calcule l\'IA pour chaque nouvelle recette ?',
              options: [
                'Le nombre de calories uniquement',
                'Le prix de vente optimal base sur le cout de revient',
                'La couleur du produit',
                'Le poids exact au gramme pres',
              ],
              correctIndex: 1,
              explanation: 'L\'IA calcule le prix de vente optimal en fonction du cout de revient et du positionnement de la boulangerie.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4A1}',
      badgeName: 'Innovateur Boulanger',
    },
    // Module 4 — Reseaux sociaux
    {
      id: 'boulanger-m4',
      title: 'Reseaux sociaux pour boulangers',
      emoji: '\u{1F4F8}',
      description: 'Attirez de nouveaux clients avec une presence en ligne efficace.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m4-l1',
          title: 'Communiquer efficacement en ligne',
          duration: '4 min',
          type: 'text',
          content: `La boulangerie est un metier de proximite, mais les habitudes des consommateurs changent. Aujourd'hui, 70% des nouveaux clients decouvrent leur boulangerie sur Google Maps ou Instagram avant de pousser la porte. Une presence en ligne soignee n'est plus optionnelle, c'est une necessite commerciale. L'IA vous permet de gerer cette vitrine numerique sans y passer des heures. \u{1F4F8}

L'assistant Freenzy cree un calendrier de publications adapte au rythme de votre boulangerie. Chaque matin, il vous suggere un contenu a publier base sur votre production du jour : "Vous preparez des croissants aux amandes aujourd'hui ? Photographiez-en un avec un cafe, je genere la legende et les hashtags." La publication prend 2 minutes au lieu de 20.

Le contenu video est roi en boulangerie. Les videos de petrissage, de fournee et de decoupe generent un engagement 4 fois superieur aux photos statiques. L'IA vous guide pour filmer avec votre smartphone : angle, duree ideale (15 a 30 secondes pour un reel), moment cle a capturer. Elle ajoute ensuite la musique tendance et les sous-titres automatiquement. \u{2705}

La gestion de votre fiche Google My Business est automatisee. L'IA met a jour vos horaires pendant les vacances, publie les photos de vos nouveautes et repond aux avis clients. Un avis 5 etoiles recoit un remerciement personnalise. Un avis negatif declenche une alerte avec un brouillon de reponse professionnelle. Les statistiques montrent qu'une boulangerie avec 100+ avis et une note de 4.7 attire 45% de clients supplementaires.

L'IA mesure le retour sur investissement de vos efforts numeriques. Elle suit les visites sur votre profil, les appels generes, les demandes d'itineraire et correle ces donnees avec vos ventes. "La publication de mardi sur les pains speciaux a genere 23 visites profil et une hausse de 15% des ventes de pains speciaux le lendemain." Ces metriques concretent motivent a maintenir l'effort. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m4-l2',
          title: 'Exercice : Strategie Instagram boulangerie',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez votre strategie de contenu Instagram.',
          exercisePrompt: `Vous etes boulanger et vous souhaitez developper votre compte Instagram (actuellement 350 abonnes). Votre situation :
- Specialites : pain au levain, croissants pur beurre, patisseries du week-end
- Horaires : 4h-13h (vous etes fatigue l'apres-midi !)
- Materiel : iPhone recent, eclairage naturel le matin
- Objectif : atteindre 1000 abonnes en 3 mois

Redigez le brief pour l'assistant Freenzy :
1. Proposez 3 types de contenu recurrents (ex: "pain du jour", "coulisses 4h du mat")
2. Definissez la frequence de publication realiste
3. Identifiez les 10 hashtags les plus pertinents pour votre activite
4. Proposez une action pour convertir les abonnes en clients physiques.`,
          xpReward: 20,
        },
        {
          id: 'boulanger-m4-l3',
          title: 'Quiz — Reseaux sociaux boulanger',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le marketing digital en boulangerie.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de nouveaux clients decouvrent leur boulangerie en ligne ?',
              options: ['30%', '50%', '70%', '90%'],
              correctIndex: 2,
              explanation: '70% des nouveaux clients decouvrent leur boulangerie sur Google Maps ou Instagram avant de s\'y rendre.',
            },
            {
              question: 'Combien de fois plus d\'engagement les videos generent-elles par rapport aux photos ?',
              options: ['2 fois', '3 fois', '4 fois', '6 fois'],
              correctIndex: 2,
              explanation: 'Les videos de petrissage et de fournee generent un engagement 4 fois superieur aux photos statiques.',
            },
            {
              question: 'Quel impact a une boulangerie avec 100+ avis Google a 4.7 ?',
              options: [
                '+10% de clients',
                '+25% de clients',
                '+45% de clients',
                '+80% de clients',
              ],
              correctIndex: 2,
              explanation: 'Une boulangerie avec 100+ avis et une note de 4.7 attire 45% de clients supplementaires.',
            },
            {
              question: 'Quelle duree ideale l\'IA recommande-t-elle pour un reel boulangerie ?',
              options: ['5 a 10 secondes', '15 a 30 secondes', '1 a 2 minutes', '3 a 5 minutes'],
              correctIndex: 1,
              explanation: 'La duree ideale pour un reel boulangerie est de 15 a 30 secondes pour capter l\'attention sur les reseaux sociaux.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4F8}',
      badgeName: 'Boulanger Connecte',
    },
    // Module 5 — Fidelisation client
    {
      id: 'boulanger-m5',
      title: 'Fidelisation et carte de fidelite',
      emoji: '\u{2B50}',
      description: 'Creez un programme de fidelite qui fait revenir vos clients chaque jour.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m5-l1',
          title: 'Fideliser ses clients en boulangerie',
          duration: '4 min',
          type: 'text',
          content: `En boulangerie, la fidelite client est un enjeu quotidien. Un client satisfait vient en moyenne 4 fois par semaine et depense 5 euros par visite, soit plus de 1000 euros par an. Perdre un client fidele, c'est perdre l'equivalent d'un mois de chiffre d'affaires. L'IA vous aide a creer une experience qui transforme chaque passage en habitude durable. \u{2B50}

L'assistant Freenzy digitalise votre carte de fidelite. Fini les cartes en carton oubliees ou perdues : le client s'identifie par son numero de telephone ou un QR code. Chaque achat est enregistre automatiquement et les points s'accumulent. Le systeme est flexible : "10 baguettes achetees = 1 gratuite" ou "1 euro depense = 1 point, 100 points = 5 euros de reduction." L'IA vous recommande le modele le plus adapte a votre clientele.

La personnalisation est la cle. L'IA analyse les habitudes d'achat de chaque client et envoie des offres ciblees. "Madame Martin achete toujours un pain aux cereales le mercredi et un gateau le dimanche. Envoyez-lui une offre sur les tartes aux fruits le samedi soir." Ce niveau de personnalisation est impossible manuellement avec des centaines de clients, mais l'IA le fait automatiquement. \u{2705}

Les evenements de fidelisation creent du lien. L'IA suggere des operations ponctuelles : "Journee portes ouvertes fournil", "Atelier croissants pour enfants le mercredi", "Vente privee nouvelles creations pour clients VIP." Elle gere les invitations, les inscriptions et les rappels. Ces evenements transforment vos clients en communaute et generent du bouche-a-oreille, le canal d'acquisition le plus puissant pour une boulangerie de quartier.

Le programme de parrainage multiplie votre clientele. Un client satisfait qui recommande votre boulangerie recoit un bon de reduction, et le nouveau client aussi. L'IA suit les parrainages et mesure leur impact : en moyenne, chaque client parrain amene 2.3 nouveaux clients en 6 mois. Le cout d'acquisition par ce canal est 8 fois inferieur a la publicite traditionnelle. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m5-l2',
          title: 'Exercice : Programme de fidelite boulangerie',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez votre programme de fidelite digital.',
          exercisePrompt: `Votre boulangerie accueille 250 clients par jour. Vous voulez remplacer la carte papier par un systeme digital. Donnees :
- Panier moyen : 5.50 euros
- 40% de clients quotidiens, 35% hebdomadaires, 25% occasionnels
- Marge brute : 65% sur le pain, 72% sur les viennoiseries
- Vous avez deja un fichier de 600 numeros de telephone

Redigez le brief pour l'assistant Freenzy :
1. Choisissez un modele de fidelite (points, tampons digitaux, cashback)
2. Definissez les paliers de recompense
3. Proposez 2 offres personnalisees pour vos clients quotidiens
4. Imaginez un evenement de fidelisation pour le mois prochain.`,
          xpReward: 20,
        },
        {
          id: 'boulanger-m5-l3',
          title: 'Quiz — Fidelisation boulangerie',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la fidelisation en boulangerie.',
          quizQuestions: [
            {
              question: 'Combien un client fidele depense-t-il par an en boulangerie ?',
              options: ['200 euros', '500 euros', '1000+ euros', '2000 euros'],
              correctIndex: 2,
              explanation: 'Un client fidele vient 4 fois par semaine a 5 euros par visite, soit plus de 1000 euros par an.',
            },
            {
              question: 'Combien de nouveaux clients un parrain amene-t-il en moyenne en 6 mois ?',
              options: ['0.5', '1.2', '2.3', '5'],
              correctIndex: 2,
              explanation: 'En moyenne, chaque client parrain amene 2.3 nouveaux clients en 6 mois grace au programme de parrainage.',
            },
            {
              question: 'Comment l\'IA personnalise-t-elle les offres ?',
              options: [
                'Elle envoie la meme offre a tous',
                'Elle analyse les habitudes d\'achat de chaque client',
                'Elle choisit aleatoirement',
                'Elle copie les offres des concurrents',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les habitudes d\'achat de chaque client pour envoyer des offres ciblees au bon moment.',
            },
            {
              question: 'Quel canal d\'acquisition est le plus puissant pour une boulangerie de quartier ?',
              options: [
                'La publicite Facebook',
                'Les flyers distribues',
                'Le bouche-a-oreille',
                'La radio locale',
              ],
              correctIndex: 2,
              explanation: 'Le bouche-a-oreille reste le canal d\'acquisition le plus puissant, et les evenements de fidelisation le stimulent.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2B50}',
      badgeName: 'Fidalisateur Boulanger',
    },
    // Module 6 — Comptabilite simplifiee
    {
      id: 'boulanger-m6',
      title: 'Comptabilite et gestion financiere',
      emoji: '\u{1F4B0}',
      description: 'Simplifiez votre comptabilite et pilotez la rentabilite de votre boulangerie.',
      duration: '10 min',
      lessons: [
        {
          id: 'boulanger-m6-l1',
          title: 'Piloter ses finances avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La comptabilite est souvent la bete noire des boulangers artisans. Entre les tickets de caisse, les factures fournisseurs, la TVA a taux multiples (5.5% sur le pain, 10% sur la consommation sur place, 20% sur certains produits), les charges sociales et les declarations fiscales, la gestion financiere peut devenir un cauchemar. L'IA transforme cette contrainte en outil de pilotage accessible. \u{1F4B0}

L'assistant Freenzy categorise automatiquement vos depenses. Vous photographiez une facture fournisseur et l'IA extrait les informations : montant, TVA, categorie comptable, date d'echeance. Plus besoin de saisir manuellement chaque facture dans un tableur. En fin de mois, vous avez une vue claire de vos charges par categorie : matieres premieres, energie, salaires, loyer, entretien.

Le suivi de la marge par produit est un eclairage decisif. L'IA calcule le cout de revient reel de chaque produit en integrant tous les couts : ingredients, main-d'oeuvre (temps de preparation), energie (cuisson), emballage. Vous decouvrez parfois des surprises : "Votre pain de campagne a une marge de 72% mais vos eclairs au chocolat ne degagent que 35% a cause du temps de preparation." Ces donnees eclairent vos choix de gamme. \u{2705}

La tresorerie previsionnelle vous evite les mauvaises surprises. L'IA projette vos flux financiers sur les 3 prochains mois en tenant compte des variations saisonnieres, des echeances de charges et des investissements prevus. "Attention : solde prevu en semaine 12 a 2400 euros, en dessous de votre seuil de confort de 5000 euros. Suggestion : reporter l'achat du nouveau petrin au mois suivant."

Les declarations fiscales sont pre-remplies. L'IA genere automatiquement vos declarations de TVA mensuelles ou trimestrielles et prepare les elements pour votre expert-comptable. Le temps passe sur la comptabilite passe de 8 heures par mois a 2 heures, soit 6 heures liberees pour votre coeur de metier : faire du bon pain. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'boulanger-m6-l2',
          title: 'Jeu : TVA et produits de boulangerie',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque produit a son taux de TVA applicable.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Baguette tradition', right: 'TVA 5.5% (produit alimentaire)' },
              { left: 'Sandwich consomme sur place', right: 'TVA 10% (restauration)' },
              { left: 'Boisson en bouteille', right: 'TVA 20% (boisson)' },
              { left: 'Pain de campagne a emporter', right: 'TVA 5.5% (produit alimentaire)' },
              { left: 'Cafe servi au comptoir', right: 'TVA 10% (restauration)' },
              { left: 'Confiture artisanale', right: 'TVA 5.5% (produit alimentaire)' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'boulanger-m6-l3',
          title: 'Quiz — Comptabilite boulangerie',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion financiere en boulangerie.',
          quizQuestions: [
            {
              question: 'Combien de temps l\'IA fait-elle gagner sur la comptabilite mensuelle ?',
              options: ['1 heure', '3 heures', '6 heures', '10 heures'],
              correctIndex: 2,
              explanation: 'Le temps passe sur la comptabilite passe de 8 heures a 2 heures par mois, soit 6 heures liberees.',
            },
            {
              question: 'Quel taux de TVA s\'applique au pain a emporter ?',
              options: ['0%', '5.5%', '10%', '20%'],
              correctIndex: 1,
              explanation: 'Le pain et les produits de boulangerie a emporter sont soumis au taux reduit de TVA a 5.5%.',
            },
            {
              question: 'Que revele souvent l\'analyse de marge par produit ?',
              options: [
                'Tous les produits ont la meme marge',
                'Des ecarts importants entre produits simples et elabores',
                'La marge est toujours superieure a 80%',
                'Les charges ne comptent pas',
              ],
              correctIndex: 1,
              explanation: 'L\'analyse revele des ecarts significatifs : un pain peut avoir 72% de marge tandis qu\'un eclair n\'en degage que 35%.',
            },
            {
              question: 'Sur quelle periode l\'IA projette-t-elle la tresorerie ?',
              options: ['1 semaine', '1 mois', '3 mois', '1 an'],
              correctIndex: 2,
              explanation: 'L\'IA projette les flux financiers sur les 3 prochains mois pour anticiper les tensions de tresorerie.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Gestionnaire Avise',
    },
  ],
};

// =============================================================================
// 3. IA pour Garagistes
// =============================================================================

export const parcoursGaragisteIA: FormationParcours = {
  id: 'garagiste-ia',
  title: 'IA pour Garagistes',
  emoji: '\u{1F527}',
  description: 'Optimisez votre garage avec l\'IA : diagnostic vehicule, devis reparation, planning atelier, relation client, stock pieces et marketing.',
  category: 'metier',
  subcategory: 'automobile',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#78716C',
  diplomaTitle: 'Garagiste Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Garagistes',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Diagnostic vehicule
    {
      id: 'garagiste-m1',
      title: 'Diagnostic vehicule assiste par IA',
      emoji: '\u{1F50D}',
      description: 'Identifiez les pannes plus rapidement grace a l\'intelligence artificielle.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m1-l1',
          title: 'Le diagnostic intelligent en atelier',
          duration: '4 min',
          type: 'text',
          content: `Le diagnostic automobile est devenu un exercice de plus en plus complexe. Les vehicules modernes embarquent des dizaines de calculateurs, des centaines de capteurs et des milliers de codes defaut possibles. Un mecanicien experimenté peut passer des heures a chercher l'origine d'un probleme intermittent. L'IA accelere considerablement ce processus en croisant les symptomes avec une base de connaissances massive. \u{1F50D}

L'assistant Freenzy fonctionne comme un expert diagnostic disponible en permanence. Vous decrivez les symptomes — "Renault Clio 4 1.5 dCi, 120 000 km, demarrage difficile a froid, fumee blanche au demarrage, perte de puissance au-dessus de 3000 tr/min, code defaut P0299" — et l'IA analyse ces informations pour proposer un arbre de diagnostic hierarchise par probabilite.

Pour ce cas precis, l'IA repondrait : "Probabilite 75% : turbo defaillant (wastegate bloquee ou jeu axial excessif). Probabilite 15% : fuite au niveau de l'echangeur ou des durites de suralimentation. Probabilite 10% : capteur de pression de suralimentation HS. Verification recommandee dans cet ordre pour optimiser le temps de diagnostic." \u{2705}

L'IA connait les pannes recurrentes par modele et motorisation. Elle vous alerte sur les faiblesses connues : "Sur le moteur K9K 1.5 dCi, la vanne EGR s'encrasse frequemment apres 100 000 km. Verifiez egalement le debimetre d'air qui presente un taux de defaillance eleve sur cette motorisation." Ce savoir collectif, issu de millions de cas, complete votre experience personnelle.

Le suivi des mises a jour constructeur est automatise. L'IA vous informe des rappels en cours, des notes techniques et des evolutions de diagnostic pour chaque modele. Quand un client se presente avec un vehicule concerne par un rappel, vous pouvez l'informer immediatement et renforcer la confiance qu'il place dans votre expertise. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m1-l2',
          title: 'Exercice : Diagnostic assiste par IA',
          duration: '3 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour diagnostiquer une panne complexe.',
          exercisePrompt: `Un client arrive avec son vehicule en panne. Voici les informations :
- Vehicule : Peugeot 308 1.6 HDi 2018, 95 000 km
- Symptomes : voyant moteur allume, a-coups a l'acceleration, surconsommation de carburant (+2L/100km)
- Le client signale aussi une odeur inhabituelle a l'echappement
- Codes defaut releves : P0101, P2002

Redigez le brief pour l'assistant Freenzy :
1. Decrivez les symptomes de facon structuree
2. Interpretez les codes defaut (que signifient P0101 et P2002 ?)
3. Proposez un arbre de diagnostic par ordre de probabilite
4. Estimez le temps de diagnostic necessaire.`,
          xpReward: 20,
        },
        {
          id: 'garagiste-m1-l3',
          title: 'Quiz — Diagnostic vehicule IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le diagnostic assiste par IA.',
          quizQuestions: [
            {
              question: 'Comment l\'IA hierarchise-t-elle ses suggestions de diagnostic ?',
              options: [
                'Par ordre alphabetique',
                'Par probabilite de panne',
                'Par cout de reparation',
                'Par anciennete du vehicule',
              ],
              correctIndex: 1,
              explanation: 'L\'IA classe les hypotheses par probabilite pour optimiser le temps de diagnostic en verifiant d\'abord les causes les plus probables.',
            },
            {
              question: 'Quelle information specifique l\'IA fournit-elle par modele ?',
              options: [
                'Le prix d\'achat du vehicule',
                'Les pannes recurrentes et faiblesses connues',
                'Le nom du proprietaire precedent',
                'La cote Argus',
              ],
              correctIndex: 1,
              explanation: 'L\'IA connait les pannes recurrentes par modele et motorisation, issues de millions de cas repertories.',
            },
            {
              question: 'Que fait l\'IA concernant les rappels constructeur ?',
              options: [
                'Elle les ignore',
                'Elle informe automatiquement le garagiste des rappels en cours',
                'Elle contacte le constructeur',
                'Elle annule la reparation',
              ],
              correctIndex: 1,
              explanation: 'L\'IA informe le garagiste des rappels, notes techniques et evolutions de diagnostic pour chaque modele.',
            },
            {
              question: 'Combien de capteurs un vehicule moderne peut-il embarquer ?',
              options: ['Une dizaine', 'Une cinquantaine', 'Des centaines', 'Des milliers'],
              correctIndex: 2,
              explanation: 'Les vehicules modernes embarquent des centaines de capteurs connectes a des dizaines de calculateurs.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Diagnosticien Expert',
    },
    // Module 2 — Devis et facturation
    {
      id: 'garagiste-m2',
      title: 'Devis et facturation automatises',
      emoji: '\u{1F4C4}',
      description: 'Generez des devis precis et professionnels en quelques minutes.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m2-l1',
          title: 'Creer des devis professionnels avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le devis est le premier document que votre client voit, et il influence directement sa decision de vous confier sa voiture. Un devis detaille, clair et professionnel inspire confiance. Un devis griffonne sur un bout de papier fait fuir. L'IA vous permet de generer des devis impeccables en 3 minutes au lieu de 20, directement depuis votre smartphone ou votre ordinateur. \u{1F4C4}

L'assistant Freenzy integre les bases de donnees de pieces et de temps de main-d'oeuvre. Vous saisissez l'intervention — "Remplacement kit de distribution + pompe a eau, Volkswagen Golf 7 1.6 TDI 2017" — et l'IA genere un devis complet : reference des pieces, prix public, prix remise garage, temps de main-d'oeuvre baremeé et total TTC. Le client recoit un document professionnel avec votre logo et vos coordonnees.

La comparaison des fournisseurs est integree. L'IA affiche les prix de 3 a 5 fournisseurs pour chaque piece et vous recommande le meilleur rapport qualite-prix. "Kit distribution Gates : 189 euros chez Autodistribution, 175 euros chez Alliance Automotive, 195 euros chez le concessionnaire. Piece equivalente Dayco : 145 euros." Vous choisissez en connaissance de cause et optimisez vos marges. \u{2705}

La gestion des avenants est simplifiee. En cours de reparation, si vous decouvrez un probleme supplementaire, l'IA genere un avenant au devis initial avec les pieces et la main-d'oeuvre additionnelles. Le client recoit une notification par SMS avec le detail et peut accepter ou refuser directement depuis son telephone. Plus de malentendus sur les depassements de budget.

La facturation est automatique. Une fois l'intervention terminee, le devis se transforme en facture en un clic. L'IA ajoute les mentions legales obligatoires, calcule la TVA et archive le document. En fin de mois, elle genere un recapitulatif comptable avec le chiffre d'affaires par type d'intervention, la marge par categorie de pieces et le taux de conversion devis-facture. Ce dernier indicateur est precieux : s'il est inferieur a 60%, l'IA vous suggere des ajustements. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m2-l2',
          title: 'Jeu : Elements d\'un devis conforme',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque element a sa place dans un devis automobile.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Reference constructeur', right: 'Identification exacte de la piece' },
              { left: 'Temps bareme', right: 'Duree standard de l\'intervention' },
              { left: 'Taux horaire TTC', right: 'Prix de la main-d\'oeuvre' },
              { left: 'Mention "Devis gratuit"', right: 'Obligation legale' },
              { left: 'Duree de validite', right: 'Protection juridique du garage' },
              { left: 'Immatriculation vehicule', right: 'Identification du vehicule concerne' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'garagiste-m2-l3',
          title: 'Quiz — Devis et facturation',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les devis automobiles.',
          quizQuestions: [
            {
              question: 'Combien de temps faut-il pour generer un devis avec l\'IA ?',
              options: ['30 secondes', '3 minutes', '15 minutes', '30 minutes'],
              correctIndex: 1,
              explanation: 'L\'IA genere un devis complet et professionnel en 3 minutes au lieu de 20 minutes manuellement.',
            },
            {
              question: 'Combien de fournisseurs l\'IA compare-t-elle par piece ?',
              options: ['1 seul', '2', '3 a 5', '10+'],
              correctIndex: 2,
              explanation: 'L\'IA compare les prix de 3 a 5 fournisseurs pour chaque piece afin de recommander le meilleur rapport qualite-prix.',
            },
            {
              question: 'Comment le client valide-t-il un avenant en cours de reparation ?',
              options: [
                'Il doit se deplacer au garage',
                'Par telephone uniquement',
                'Par SMS avec acceptation directe',
                'Ce n\'est pas possible',
              ],
              correctIndex: 2,
              explanation: 'Le client recoit une notification SMS avec le detail de l\'avenant et peut accepter ou refuser depuis son telephone.',
            },
            {
              question: 'En dessous de quel taux de conversion devis-facture l\'IA alerte-t-elle ?',
              options: ['30%', '45%', '60%', '80%'],
              correctIndex: 2,
              explanation: 'Si le taux de conversion devis-facture est inferieur a 60%, l\'IA suggere des ajustements pour ameliorer la conversion.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C4}',
      badgeName: 'Expert Devis',
    },
    // Module 3 — Planning atelier
    {
      id: 'garagiste-m3',
      title: 'Planning atelier optimise',
      emoji: '\u{1F4C5}',
      description: 'Organisez votre atelier pour maximiser la productivite et les revenus.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m3-l1',
          title: 'Optimiser l\'organisation de l\'atelier',
          duration: '4 min',
          type: 'text',
          content: `Un atelier de reparation automobile fonctionne comme une usine miniature. Chaque pont elevateur, chaque poste de travail et chaque mecanicien doit etre utilise de maniere optimale pour maximiser le chiffre d'affaires. L'IA transforme la planification de votre atelier en vous aidant a remplir chaque creneau avec les bonnes interventions au bon moment. \u{1F4C5}

L'assistant Freenzy organise votre planning en tenant compte de multiples contraintes : duree estimee de chaque intervention, competences requises (tous les mecaniciens ne font pas la climatisation ou la geometrie), disponibilite des pieces, ponts disponibles et preferences horaires des clients. Un matin complexe qui prenait 30 minutes a organiser se planifie en 3 minutes.

La gestion des interventions longues et courtes est equilibree. L'IA intercale intelligemment les petites interventions (vidange 45 min, plaquettes de frein 1h) entre les grosses (distribution 4h, embrayage 5h). Resultat : aucun pont ne reste inoccupe pendant qu'un mecanicien attend une piece ou qu'une intervention longue monopolise un poste. Le taux d'occupation passe en moyenne de 65% a 85%. \u{2705}

Les rendez-vous en ligne changent la donne. L'IA publie vos creneaux disponibles sur votre site web et Google. Le client choisit lui-meme son creneau, decrit l'intervention souhaitee et recoit une confirmation instantanee. L'IA estime automatiquement la duree et affecte un mecanicien et un pont. Vous eliminez les allers-retours telephoniques et remplissez les creneaux qui resteraient vides autrement.

Le suivi en temps reel vous donne une vision claire de l'avancement. Quand un mecanicien termine une intervention en avance, l'IA propose immediatement une micro-intervention pour combler le temps libre : "Pont 2 libre pendant 45 minutes, une vidange en attente peut etre avancee." Cette reactivite maximise votre productivite quotidienne et donc votre chiffre d'affaires. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m3-l2',
          title: 'Exercice : Planifier une journee d\'atelier',
          duration: '3 min',
          type: 'exercise',
          content: 'Organisez le planning d\'une journee type.',
          exercisePrompt: `Votre garage dispose de 3 ponts et 3 mecaniciens. Voici les interventions prevues demain :
- Distribution + pompe a eau Golf 7 (4h, mecanicien senior uniquement)
- 2 vidanges (45 min chacune, tout mecanicien)
- Remplacement embrayage Clio 4 (5h, 2 mecaniciens necessaires)
- Diagnostic electronique BMW Serie 3 (1h30, mecanicien forme BMW)
- 3 montages pneus (30 min chacun, tout mecanicien)
- Geometrie apres remplacement rotules (1h, poste geometrie = pont 3)

Redigez le brief pour l'assistant Freenzy :
1. Affectez chaque intervention a un pont et un mecanicien
2. Proposez un planning heure par heure (8h-17h)
3. Identifiez les temps morts et proposez des interventions de remplissage
4. Prevoyez un creneau d'urgence pour un depannage imprevu.`,
          xpReward: 20,
        },
        {
          id: 'garagiste-m3-l3',
          title: 'Quiz — Planning atelier',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la planification d\'atelier.',
          quizQuestions: [
            {
              question: 'De combien le taux d\'occupation augmente-t-il avec l\'IA ?',
              options: ['De 65% a 70%', 'De 65% a 75%', 'De 65% a 85%', 'De 65% a 95%'],
              correctIndex: 2,
              explanation: 'Le taux d\'occupation des ponts passe en moyenne de 65% a 85% grace a l\'optimisation IA du planning.',
            },
            {
              question: 'Comment l\'IA gere-t-elle un mecanicien qui finit en avance ?',
              options: [
                'Il prend une pause',
                'Elle propose une micro-intervention pour combler le temps',
                'Elle renvoie le mecanicien chez lui',
                'Elle ne fait rien',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose immediatement une intervention compatible avec le temps libre pour maximiser la productivite.',
            },
            {
              question: 'Quel avantage les rendez-vous en ligne apportent-ils ?',
              options: [
                'Plus de paperasse',
                'Elimination des allers-retours telephoniques',
                'Des clients plus exigeants',
                'Une hausse des annulations',
              ],
              correctIndex: 1,
              explanation: 'Les rendez-vous en ligne eliminent les allers-retours telephoniques et remplissent les creneaux autrement vides.',
            },
            {
              question: 'Quelles contraintes l\'IA prend-elle en compte pour planifier ?',
              options: [
                'Uniquement la duree',
                'Duree, competences, pieces, ponts et preferences client',
                'Le prix de l\'intervention',
                'La marque du vehicule uniquement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA integre la duree, les competences requises, la disponibilite des pieces, les ponts et les preferences horaires.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Chef d\'Atelier',
    },
    // Module 4 — Relation client
    {
      id: 'garagiste-m4',
      title: 'Relation client et confiance',
      emoji: '\u{1F91D}',
      description: 'Renforcez la confiance de vos clients grace a une communication transparente.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m4-l1',
          title: 'Construire la confiance avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La relation client en garage automobile souffre d'un probleme de confiance historique. Selon une etude, 63% des automobilistes craignent de se faire surfacturer chez le garagiste. Cette mefiance est un frein commercial majeur. L'IA vous donne les outils pour construire une relation transparente qui transforme des clients mefiances en ambassadeurs fideles. \u{1F91D}

L'assistant Freenzy automatise la communication a chaque etape de l'intervention. Des la reception du vehicule, le client recoit un SMS de confirmation avec le detail du devis accepte. Pendant la reparation, il peut suivre l'avancement en temps reel : "Votre vehicule est en cours de diagnostic — Etape 2/4." A la fin, il recoit un compte rendu detaille avec photos avant-apres des pieces remplacees.

La transparence sur les prix renforce la confiance. L'IA genere des devis comparatifs que vous pouvez montrer au client : "Voici le prix de la piece d'origine constructeur (280 euros), de l'equipementier premium (195 euros) et de l'adaptable (140 euros). Je vous recommande l'equipementier premium qui offre la meme garantie 2 ans a moindre cout." Le client se sent conseille, pas pousse a la depense. \u{2705}

Le carnet d'entretien digital est un service a forte valeur ajoutee. L'IA enregistre chaque intervention realisee sur le vehicule et cree un historique complet accessible au client. Quand il revient ou quand il veut revendre son vehicule, il dispose d'un dossier complet. Ce service gratuit fidelise et differencie votre garage des concurrents.

Les rappels d'entretien preventif generent du chiffre d'affaires recurrent. L'IA suit le kilometrage estime de chaque vehicule et envoie des rappels personnalises : "Votre Peugeot 3008 approche des 60 000 km. Il est temps de prevoir la revision majeure (filtres + courroie accessoire). Prenez rendez-vous en ligne." Ces rappels respectueux et utiles generent en moyenne 2 visites supplementaires par client et par an. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m4-l2',
          title: 'Jeu : Etapes de communication client',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque moment cle a la communication appropriee.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Reception vehicule', right: 'SMS confirmation avec devis accepte' },
              { left: 'Pendant reparation', right: 'Suivi avancement en temps reel' },
              { left: 'Decouverte probleme supplementaire', right: 'Avenant avec photos et validation SMS' },
              { left: 'Fin d\'intervention', right: 'Compte rendu avec photos avant-apres' },
              { left: 'Restitution vehicule', right: 'Explication des travaux et facture detaillee' },
              { left: '6 mois apres', right: 'Rappel entretien preventif personnalise' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'garagiste-m4-l3',
          title: 'Quiz — Relation client garage',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la relation client en atelier.',
          quizQuestions: [
            {
              question: 'Quel pourcentage d\'automobilistes craignent la surfacturation ?',
              options: ['25%', '40%', '63%', '80%'],
              correctIndex: 2,
              explanation: 'Selon une etude, 63% des automobilistes craignent de se faire surfacturer chez le garagiste.',
            },
            {
              question: 'Combien de visites supplementaires les rappels preventifs generent-ils ?',
              options: ['0.5 par an', '1 par an', '2 par an', '4 par an'],
              correctIndex: 2,
              explanation: 'Les rappels d\'entretien preventif generent en moyenne 2 visites supplementaires par client et par an.',
            },
            {
              question: 'Quel service differencie votre garage des concurrents ?',
              options: [
                'Des prix plus bas',
                'Le carnet d\'entretien digital',
                'Un salon d\'attente luxueux',
                'Le lavage gratuit',
              ],
              correctIndex: 1,
              explanation: 'Le carnet d\'entretien digital cree un historique complet du vehicule, un service a forte valeur ajoutee pour le client.',
            },
            {
              question: 'Que recoit le client pendant la reparation ?',
              options: [
                'Aucune nouvelle',
                'Un suivi d\'avancement en temps reel',
                'Un appel toutes les heures',
                'Un email a la fin uniquement',
              ],
              correctIndex: 1,
              explanation: 'Le client peut suivre l\'avancement en temps reel par SMS : "Etape 2/4" avec le detail de chaque phase.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Conseiller de Confiance',
    },
    // Module 5 — Stock pieces
    {
      id: 'garagiste-m5',
      title: 'Gestion intelligente du stock pieces',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Optimisez votre stock de pieces detachees pour ne jamais manquer l\'essentiel.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m5-l1',
          title: 'Gerer son stock de pieces avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le stock de pieces detachees est un investissement considerable pour un garage. Trop de stock immobilise de la tresorerie; pas assez oblige a reporter des interventions et fait perdre des clients. L'IA vous aide a trouver l'equilibre parfait en analysant votre historique de consommation et en anticipant les besoins futurs. \u{2699}\u{FE0F}

L'assistant Freenzy categorise vos pieces en trois niveaux. Les pieces "critiques" (filtres a huile, plaquettes de frein, bougies) doivent toujours etre en stock car elles concernent les interventions les plus frequentes. Les pieces "courantes" (amortisseurs, kits de distribution) sont commandees a la demande avec un stock tampon. Les pieces "rares" (calculateurs, pieces specifiques) sont commandees uniquement sur devis accepte. Cette categorisation optimise votre investissement.

L'IA predit la consommation de chaque reference. En analysant 12 mois d'historique, elle identifie les tendances saisonnieres — "Les plaquettes de frein se vendent 30% de plus en septembre-octobre avec les premiers froids et les controles techniques de rentree" — et ajuste automatiquement les niveaux de reapprovisionnement. Plus de rupture sur les essentiels, moins d'invendus sur les accessoires. \u{2705}

La gestion multi-fournisseurs est centralisee. L'IA compare en permanence les prix, les delais et la qualite de vos fournisseurs. Elle genere des commandes groupees pour atteindre les seuils de franco de port et negocie les remises volume. "En regroupant vos commandes filtres et plaquettes chez Alliance Automotive, vous economisez 340 euros par mois en frais de port et obtenez 3% de remise supplementaire."

L'inventaire devient simple. L'IA suit les mouvements de stock en temps reel : chaque piece utilisee sur un devis est automatiquement deduite. En fin de mois, elle genere un etat des stocks valorise et identifie les pieces dormantes — presentes depuis plus de 6 mois sans mouvement — pour lesquelles elle suggere une action : retour fournisseur, promotion ou transfert vers un garage partenaire. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m5-l2',
          title: 'Exercice : Optimiser le stock du garage',
          duration: '3 min',
          type: 'exercise',
          content: 'Reorganisez votre stock de pieces detachees.',
          exercisePrompt: `Votre garage realise principalement des interventions sur des vehicules francais (Renault, Peugeot, Citroen). Voici votre situation :
- Stock actuel : 15 000 euros de pieces (dont 3 000 euros de pieces dormantes)
- 4 fournisseurs avec des delais de 24h a 72h
- Interventions les plus frequentes : vidanges (30%), freinage (25%), distribution (15%)
- 2 interventions reportees la semaine derniere par manque de pieces

Redigez le brief pour l'assistant Freenzy :
1. Categorisez vos pieces en critique / courant / rare
2. Definissez les niveaux de stock minimum pour les pieces critiques
3. Proposez une strategie pour les 3 000 euros de pieces dormantes
4. Optimisez vos commandes pour reduire les frais de port.`,
          xpReward: 20,
        },
        {
          id: 'garagiste-m5-l3',
          title: 'Quiz — Stock pieces garage',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion de stock automobile.',
          quizQuestions: [
            {
              question: 'En combien de niveaux l\'IA categorise-t-elle les pieces ?',
              options: ['2 niveaux', '3 niveaux', '5 niveaux', '10 niveaux'],
              correctIndex: 1,
              explanation: 'L\'IA categorise les pieces en 3 niveaux : critiques (toujours en stock), courantes (stock tampon) et rares (sur commande).',
            },
            {
              question: 'A partir de quand une piece est-elle consideree "dormante" ?',
              options: ['1 mois', '3 mois', '6 mois', '1 an'],
              correctIndex: 2,
              explanation: 'Une piece est consideree dormante si elle est presente en stock depuis plus de 6 mois sans aucun mouvement.',
            },
            {
              question: 'De combien les plaquettes de frein augmentent-elles en septembre-octobre ?',
              options: ['10%', '20%', '30%', '50%'],
              correctIndex: 2,
              explanation: 'Les plaquettes de frein se vendent 30% de plus en septembre-octobre avec les premiers froids et les controles techniques.',
            },
            {
              question: 'Quel avantage les commandes groupees apportent-elles ?',
              options: [
                'Plus de paperasse',
                'Franco de port et remises volume',
                'Des delais plus longs',
                'Moins de choix de pieces',
              ],
              correctIndex: 1,
              explanation: 'Les commandes groupees permettent d\'atteindre les seuils de franco de port et de beneficier de remises volume.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Gestionnaire Pieces',
    },
    // Module 6 — Marketing garage
    {
      id: 'garagiste-m6',
      title: 'Marketing et visibilite locale',
      emoji: '\u{1F4E3}',
      description: 'Attirez de nouveaux clients et developpez votre reputation locale.',
      duration: '10 min',
      lessons: [
        {
          id: 'garagiste-m6-l1',
          title: 'Developper la visibilite de son garage',
          duration: '4 min',
          type: 'text',
          content: `Le marketing d'un garage automobile repose principalement sur la visibilite locale. Quand un automobiliste cherche "garage reparation pres de chez moi", il faut que votre etablissement apparaisse dans les premiers resultats. L'IA vous aide a construire une presence numerique forte qui genere un flux constant de nouveaux clients sans budget publicitaire delirant. \u{1F4E3}

L'assistant Freenzy optimise votre fiche Google My Business, qui est votre vitrine numero un. Il complete toutes les informations (services proposes, marques traitees, horaires, photos de l'atelier), publie regulierement des actualites et repond aux avis clients. Une fiche Google complete et active apparait 70% plus souvent dans les resultats de recherche locale qu'une fiche incomplete.

Les avis clients sont votre meilleur outil marketing. L'IA envoie automatiquement une demande d'avis 24 heures apres chaque intervention, au moment ou le client est le plus satisfait. Le message est personnalise : "Bonjour M. Martin, comment s'est passee la revision de votre Megane ? Votre avis nous aide a nous ameliorer." Le taux de reponse de ces demandes personnalisees atteint 35%, contre 5% pour les demandes generiques. \u{2705}

Les offres saisonnieres generent du trafic. L'IA planifie des campagnes adaptees au calendrier automobile : "Pack climatisation a 89 euros en juin", "Forfait pneus hiver des octobre", "Offre controle technique a -20% en janvier." Chaque campagne est diffusee par SMS aux clients concernes et publiee sur vos reseaux sociaux avec un visuel professionnel genere automatiquement.

Le programme de parrainage est redoutablement efficace en automobile. Un client satisfait qui recommande votre garage a un collegue ou un voisin est votre meilleur commercial. L'IA gere le programme : le parrain recoit 30 euros de remise sur sa prochaine intervention, le filleul beneficie de 15% sur sa premiere visite. En moyenne, chaque parrain actif genere 1.8 nouveau client par an, avec un cout d'acquisition 6 fois inferieur a la publicite Google. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'garagiste-m6-l2',
          title: 'Exercice : Plan marketing local',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez votre strategie marketing locale.',
          exercisePrompt: `Votre garage independant est situe dans une ville de 30 000 habitants avec 3 concurrents directs. Vos donnees :
- 45 avis Google (note 4.3), le meilleur concurrent a 120 avis (note 4.6)
- Budget marketing : 300 euros/mois
- Base clients : 800 contacts avec telephone
- Specialite : vehicules francais + diagnostic toutes marques
- Pas de site web, juste une page Facebook avec 200 abonnes

Redigez le brief pour l'assistant Freenzy :
1. Proposez un plan pour atteindre 100 avis Google en 3 mois
2. Planifiez 4 offres saisonnieres pour les 6 prochains mois
3. Definissez votre programme de parrainage (montants, conditions)
4. Identifiez les 3 actions prioritaires pour depasser votre concurrent principal.`,
          xpReward: 20,
        },
        {
          id: 'garagiste-m6-l3',
          title: 'Quiz — Marketing garage',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le marketing automobile local.',
          quizQuestions: [
            {
              question: 'De combien une fiche Google complete apparait-elle plus souvent ?',
              options: ['20% plus', '40% plus', '70% plus', '100% plus'],
              correctIndex: 2,
              explanation: 'Une fiche Google My Business complete et active apparait 70% plus souvent dans les resultats de recherche locale.',
            },
            {
              question: 'Quel taux de reponse obtiennent les demandes d\'avis personnalisees ?',
              options: ['5%', '15%', '25%', '35%'],
              correctIndex: 3,
              explanation: 'Les demandes d\'avis personnalisees envoyees 24h apres l\'intervention atteignent un taux de reponse de 35%.',
            },
            {
              question: 'Combien de nouveaux clients un parrain actif genere-t-il par an ?',
              options: ['0.5', '1.0', '1.8', '3.5'],
              correctIndex: 2,
              explanation: 'En moyenne, chaque parrain actif genere 1.8 nouveau client par an grace au programme de parrainage.',
            },
            {
              question: 'Quand faut-il envoyer la demande d\'avis au client ?',
              options: [
                'Immediatement apres le paiement',
                '24 heures apres l\'intervention',
                '1 semaine apres',
                '1 mois apres',
              ],
              correctIndex: 1,
              explanation: 'La demande d\'avis est envoyee 24 heures apres l\'intervention, quand le client est le plus satisfait du service.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E3}',
      badgeName: 'Marketeur Auto',
    },
  ],
};
