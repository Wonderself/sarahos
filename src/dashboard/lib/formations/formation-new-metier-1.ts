// =============================================================================
// Freenzy.io — Formations Metier Pack 1
// 5 parcours : Plombier, Electricien, Avocat, Notaire, Dentiste
// Chaque parcours : 6 modules x 3 lessons = 18 lessons, 600 XP
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. PLOMBIER IA
// =============================================================================

export const parcoursPlombierIA: FormationParcours = {
  id: 'plombier-ia',
  title: 'IA pour les Plombiers',
  emoji: '\u{1F6BF}',
  description: 'Optimisez votre activite de plombier avec l\'IA : devis rapides, planning interventions, gestion du stock de pieces, relation client, facturation et conformite aux normes sanitaires.',
  category: 'metier',
  subcategory: 'plomberie',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#2563EB',
  diplomaTitle: 'Plombier Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Plombiers',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Devis plomberie
    {
      id: 'plb-m1',
      title: 'Devis plomberie en quelques clics',
      emoji: '\u{1F4DD}',
      description: 'Generez des devis plomberie precis et professionnels grace a l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m1-l1',
          title: 'L\'IA au service de vos devis plomberie',
          duration: '4 min',
          type: 'text',
          content: `En tant que plombier, etablir un devis prend souvent plus de temps que l\'intervention elle-meme. Il faut lister les pieces, estimer la main d\'oeuvre, verifier les tarifs fournisseurs et mettre en forme le document. Avec l\'IA de Freenzy, vous reduisez ce temps a quelques minutes ! \u{1F680}

Concretement, vous decrivez l\'intervention en langage naturel : "Remplacement d'un groupe de securite sur chauffe-eau 200L, purge circuit, verification pression, test etancheite." L\'IA analyse votre description et genere automatiquement un devis structure avec les postes de travail detailles, les references de pieces courantes et les temps d\'intervention estimes.

Le systeme connait les tarifs moyens du marche pour les pieces de plomberie les plus courantes : robinetterie, raccords, joints, flexibles, siphons, groupes de securite, vannes. Il vous propose une base tarifaire que vous ajustez selon vos propres fournisseurs et votre marge. Au fil du temps, l\'IA memorise vos prix habituels et les applique directement. \u{1F4B0}

Les mentions legales sont generees automatiquement : assurance decennale, garantie sur les pieces et la main d\'oeuvre, conditions de paiement, delai de retractation pour les particuliers. Vous n\'oubliez plus jamais une mention obligatoire — un detail qui peut vous proteger en cas de litige.

Le devis est exporte en PDF professionnel avec votre logo, vos coordonnees et votre numero SIRET. Vous l\'envoyez directement par email ou WhatsApp au client depuis Freenzy. Le suivi est automatique : vous savez quand le client a ouvert le devis et vous pouvez programmer des relances intelligentes.

Un plombier qui fait en moyenne 20 devis par mois economise environ 15 heures par mois grace a l\'IA. C\'est presque deux journees completes que vous pouvez consacrer a vos chantiers ou a votre vie personnelle ! \u{1F389}`,
          xpReward: 15,
        },
        {
          id: 'plb-m1-l2',
          title: 'Exercice : Creer un devis plomberie',
          duration: '3 min',
          type: 'exercise',
          content: 'Redigez la description d\'une intervention pour generer un devis automatique.',
          exercisePrompt: `Un client vous appelle pour un probleme dans sa cuisine :
- Fuite sous l'evier (siphon a remplacer)
- Robinet mitigeur qui goutte (joints uses)
- Installation d'un lave-vaisselle (raccordement eau + evacuation)

Redigez la description detaillee que vous enverriez a l'assistant Commercial de Freenzy pour generer le devis. Incluez :
1. Le detail de chaque intervention avec les pieces necessaires
2. Les temps estimes par poste
3. Les eventuelles contraintes d'acces ou particularites
4. Le type de garantie a mentionner

Puis identifiez 2 postes ou l'IA pourrait sous-estimer le cout et expliquez pourquoi.`,
          xpReward: 20,
        },
        {
          id: 'plb-m1-l3',
          title: 'Quiz — Devis plomberie IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la generation de devis plomberie.',
          quizQuestions: [
            {
              question: 'Combien de temps un plombier economise-t-il en moyenne par mois avec les devis IA ?',
              options: ['2 heures', '5 heures', '15 heures', '30 heures'],
              correctIndex: 2,
              explanation: 'Avec 20 devis par mois et un gain de 40 minutes par devis, l\'economie est d\'environ 15 heures mensuelles.',
            },
            {
              question: 'Quelle mention legale l\'IA inclut-elle automatiquement pour un plombier ?',
              options: [
                'Le numero de telephone du fournisseur',
                'L\'assurance decennale et la garantie',
                'Les horaires d\'ouverture du bureau',
                'La liste des anciens clients',
              ],
              correctIndex: 1,
              explanation: 'L\'IA inclut systematiquement les mentions obligatoires comme l\'assurance decennale, la garantie pieces et main d\'oeuvre, et les conditions de retractation.',
            },
            {
              question: 'Comment l\'IA ameliore-t-elle ses estimations tarifaires au fil du temps ?',
              options: [
                'Elle consulte internet chaque jour',
                'Elle memorise vos corrections et prix habituels',
                'Elle contacte vos fournisseurs',
                'Elle copie les devis de vos concurrents',
              ],
              correctIndex: 1,
              explanation: 'L\'IA apprend de vos ajustements successifs et memorise vos prix habituels pour les appliquer dans les futurs devis.',
            },
            {
              question: 'Sous quel format le devis est-il exporte ?',
              options: ['Word uniquement', 'Excel', 'PDF professionnel avec logo', 'Image PNG'],
              correctIndex: 2,
              explanation: 'Le devis est exporte en PDF professionnel incluant votre logo, vos coordonnees et votre numero SIRET.',
            },
            {
              question: 'Que permet le suivi automatique du devis ?',
              options: [
                'Savoir quand le client a ouvert le devis',
                'Modifier le devis sans prevenir le client',
                'Augmenter automatiquement les prix',
                'Annuler l\'intervention',
              ],
              correctIndex: 0,
              explanation: 'Le suivi automatique vous indique quand le client a ouvert le devis et vous permet de programmer des relances intelligentes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Devis Express Plomberie',
    },

    // Module 2 — Planning interventions
    {
      id: 'plb-m2',
      title: 'Planning interventions optimise',
      emoji: '\u{1F4C5}',
      description: 'Organisez vos tournees et interventions pour maximiser votre temps productif.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m2-l1',
          title: 'Optimiser ses tournees avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le quotidien d\'un plombier, c\'est souvent trois a cinq interventions par jour dans des lieux differents. Sans optimisation, vous pouvez perdre plus d\'une heure par jour en deplacements inutiles. L\'IA de Freenzy reorganise votre planning pour minimiser les trajets et maximiser le temps sur chantier. \u{1F697}

Le systeme analyse vos interventions prevues et calcule l\'itineraire optimal. Il tient compte de la duree estimee de chaque intervention, des horaires souhaites par les clients, des creneaux d\'ouverture des fournisseurs si vous devez recuperer des pieces en route, et meme des conditions de circulation aux heures de pointe.

Quand un appel urgent arrive — une fuite, un degat des eaux — l\'IA recalcule instantanement votre planning. Elle identifie quelles interventions non urgentes peuvent etre decalees, propose de nouveaux creneaux aux clients concernes et leur envoie automatiquement un message de notification. Vous n\'avez qu\'a valider d\'un clic. \u{26A1}

Le planning distingue les types d\'interventions : depannage rapide (30min-1h), installation (2-4h), mise en service (1-2h), entretien annuel (1h). Chaque type a sa propre estimation de duree que l\'IA affine en fonction de votre historique. Si vos installations de chauffe-eau prennent systematiquement 3h30 au lieu des 3h prevues, l\'IA ajuste.

Les rappels clients sont automatiques : un SMS la veille avec le creneau confirme, un message le matin avec votre heure d\'arrivee estimee. Fini les clients absents ou surpris par votre passage ! Le taux de rendez-vous honores passe de 85% a plus de 97%.

Le planning integre aussi vos temps administratifs : commandes fournisseurs, comptabilite, devis. L\'IA reserve automatiquement des creneaux dedies pour que l\'administratif ne s\'accumule pas. Un plombier bien organise, c\'est un plombier serein et rentable. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'plb-m2-l2',
          title: 'Jeu : Optimiser une journee type',
          duration: '3 min',
          type: 'game',
          content: 'Ordonnez les interventions pour optimiser votre journee.',
          gameType: 'ordering',
          gameData: {
            instruction: 'Classez ces 5 interventions dans l\'ordre optimal pour minimiser les deplacements (depart et retour au depot Nord)',
            items: [
              'Depannage fuite — Centre-ville (urgence matin)',
              'Recuperer pieces chez fournisseur — Zone Sud (ferme a 12h)',
              'Installation chauffe-eau — Quartier Est (3h, client flexible)',
              'Entretien chaudiere — Quartier Nord (1h, RDV 8h30)',
              'Remplacement robinet — Zone Sud (45min, apres-midi OK)',
            ],
            correctOrder: [3, 0, 1, 4, 2],
          },
          xpReward: 20,
        },
        {
          id: 'plb-m2-l3',
          title: 'Quiz — Planning plombier',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur l\'optimisation du planning.',
          quizQuestions: [
            {
              question: 'Combien de temps un plombier peut-il perdre par jour sans optimisation de tournee ?',
              options: ['15 minutes', '30 minutes', 'Plus d\'une heure', '3 heures'],
              correctIndex: 2,
              explanation: 'Sans optimisation, les deplacements inutiles representent plus d\'une heure perdue par jour pour un plombier itinerant.',
            },
            {
              question: 'Que fait l\'IA quand un appel urgent arrive ?',
              options: [
                'Elle refuse la nouvelle intervention',
                'Elle recalcule le planning et previent les clients decales',
                'Elle annule toutes les interventions de la journee',
                'Elle transmet l\'appel a un confrere',
              ],
              correctIndex: 1,
              explanation: 'L\'IA recalcule le planning optimal, identifie les interventions deplacables et notifie automatiquement les clients concernes.',
            },
            {
              question: 'Quel est le taux de RDV honores avec les rappels automatiques ?',
              options: ['75%', '85%', '90%', 'Plus de 97%'],
              correctIndex: 3,
              explanation: 'Les rappels automatiques (SMS la veille + message le matin) font passer le taux de RDV honores a plus de 97%.',
            },
            {
              question: 'Comment l\'IA affine ses estimations de duree d\'intervention ?',
              options: [
                'Elle applique une duree fixe pour tout',
                'Elle analyse votre historique d\'interventions',
                'Elle demande au client combien de temps ca prendra',
                'Elle utilise les statistiques nationales',
              ],
              correctIndex: 1,
              explanation: 'L\'IA ajuste ses estimations en fonction de votre historique reel : si vos installations prennent systematiquement plus longtemps, elle corrige automatiquement.',
            },
            {
              question: 'Pourquoi l\'IA reserve des creneaux administratifs dans votre planning ?',
              options: [
                'Pour facturer plus cher',
                'Pour eviter que l\'administratif s\'accumule',
                'Pour limiter le nombre d\'interventions',
                'Pour vous forcer a prendre des pauses',
              ],
              correctIndex: 1,
              explanation: 'Les creneaux administratifs dedies evitent l\'accumulation de taches (devis, comptabilite, commandes) qui genere du stress et des retards.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Planificateur Plomberie',
    },

    // Module 3 — Stock pieces
    {
      id: 'plb-m3',
      title: 'Gestion intelligente du stock',
      emoji: '\u{1F4E6}',
      description: 'Ne tombez plus jamais en rupture de pieces grace au suivi IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m3-l1',
          title: 'Gerer son stock de pieces avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Combien de fois avez-vous du interrompre une intervention parce qu\'il vous manquait un joint, un raccord ou un flexible ? Chaque aller-retour chez le fournisseur, c\'est du temps perdu et un client mecontent. L\'IA de Freenzy vous aide a anticiper vos besoins et gerer votre stock intelligemment. \u{1F4E6}

Le principe est simple : vous enregistrez votre stock initial (les pieces que vous transportez dans votre camionnette et celles en reserve chez vous). A chaque devis ou facture, l\'IA decremente automatiquement les pieces utilisees. Quand un seuil minimum est atteint, vous recevez une alerte : "Stock bas : il ne reste que 2 joints fibre 20/27. Commande recommandee : lot de 10."

L\'IA analyse aussi vos tendances de consommation. Si vous utilisez beaucoup de flexibles inox en hiver (saison des pannes de chauffe-eau), elle vous recommande de renforcer votre stock des octobre. Si vous faites beaucoup de raccordements PER en ce moment, elle ajuste les quantites recommandees a la hausse. \u{1F4CA}

Le systeme integre les references de vos fournisseurs habituels. Quand vous commandez, l\'IA genere automatiquement le bon de commande avec les bonnes references, les quantites et le fournisseur le moins cher pour chaque piece. Vous pouvez meme comparer les prix entre fournisseurs en un clic.

La gestion du stock camionnette est particulierement utile. Avant chaque journee d\'interventions, l\'IA analyse votre planning et vous liste les pieces dont vous aurez probablement besoin. "Demain : 2 installations robinetterie + 1 remplacement siphon. Verifiez : mitigeurs (2), siphon evier (1), joints EPDM (lot), teflon." Plus d\'oublis !

Le cout des ruptures de stock est souvent sous-estime : un aller-retour fournisseur coute en moyenne 45 minutes et 15 euros d\'essence. Sur un mois, ca peut representer 300 euros et 8 heures perdues. L\'IA vous fait economiser les deux. \u{1F4B0}`,
          xpReward: 15,
        },
        {
          id: 'plb-m3-l2',
          title: 'Jeu : Associer pieces et interventions',
          duration: '3 min',
          type: 'game',
          content: 'Associez les pieces aux interventions correspondantes.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque intervention a la piece principale necessaire',
            pairs: [
              { left: 'Fuite sous evier', right: 'Siphon + joints' },
              { left: 'Chasse d\'eau qui coule', right: 'Mecanisme de chasse' },
              { left: 'Robinet qui goutte', right: 'Cartouche ceramique' },
              { left: 'Ballon d\'eau chaude HS', right: 'Groupe de securite' },
              { left: 'Radiateur froid en bas', right: 'Purgeur automatique' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'plb-m3-l3',
          title: 'Quiz — Gestion du stock',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la gestion de stock IA.',
          quizQuestions: [
            {
              question: 'Combien coute en moyenne un aller-retour fournisseur non planifie ?',
              options: ['15 minutes et 5 euros', '45 minutes et 15 euros', '2 heures et 50 euros', '10 minutes et 3 euros'],
              correctIndex: 1,
              explanation: 'Un aller-retour non planifie coute en moyenne 45 minutes et 15 euros d\'essence, un cout souvent sous-estime.',
            },
            {
              question: 'Comment l\'IA anticipe-t-elle les besoins saisonniers ?',
              options: [
                'Elle ne tient pas compte des saisons',
                'Elle analyse vos tendances de consommation passees',
                'Elle commande tout en grande quantite',
                'Elle suit la meteo en temps reel',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse vos consommations passees et detecte les tendances saisonnieres pour recommander des reapprovisionnements anticipes.',
            },
            {
              question: 'Que fait l\'IA la veille de vos interventions ?',
              options: [
                'Elle annule les interventions sans stock suffisant',
                'Elle liste les pieces necessaires a verifier dans votre camionnette',
                'Elle commande automatiquement chez le fournisseur',
                'Elle ne fait rien, c\'est a vous de verifier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse le planning du lendemain et vous liste les pieces dont vous aurez besoin pour eviter les oublis.',
            },
            {
              question: 'Comment le stock est-il decremente ?',
              options: [
                'Manuellement apres chaque intervention',
                'Automatiquement a chaque devis ou facture',
                'Une fois par semaine',
                'Uniquement sur demande',
              ],
              correctIndex: 1,
              explanation: 'A chaque devis ou facture emis, l\'IA decremente automatiquement les pieces utilisees du stock.',
            },
            {
              question: 'Quel avantage offre la comparaison fournisseurs integree ?',
              options: [
                'Commander toujours au meme fournisseur',
                'Comparer les prix entre fournisseurs en un clic',
                'Negocier automatiquement les prix',
                'Changer de fournisseur chaque mois',
              ],
              correctIndex: 1,
              explanation: 'Le systeme compare les prix entre vos fournisseurs habituels pour chaque reference, vous aidant a optimiser vos couts d\'achat.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Gestionnaire Stock',
    },

    // Module 4 — Relation client
    {
      id: 'plb-m4',
      title: 'Relation client au top',
      emoji: '\u{1F91D}',
      description: 'Fidilisez vos clients avec une communication professionnelle automatisee.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m4-l1',
          title: 'Automatiser sa relation client',
          duration: '4 min',
          type: 'text',
          content: `Un plombier qui communique bien avec ses clients se demarque de la concurrence. Mais entre les chantiers, les urgences et la fatigue, la communication passe souvent au second plan. L\'IA de Freenzy automatise les interactions cles pour que vous restiez professionnel sans effort supplementaire. \u{1F91D}

Premiere interaction cruciale : la prise de contact. Quand un client vous contacte, l\'IA genere automatiquement un accuse de reception : "Merci pour votre demande. Je reviens vers vous sous 2 heures avec une proposition." Le client sait que sa demande est prise en compte — c\'est rassurant et professionnel.

Apres chaque intervention, l\'IA envoie un message de suivi : "Les travaux chez vous sont termines. Si vous constatez le moindre souci dans les prochains jours, n\'hesitez pas a me contacter. Bonne soiree !" Ce petit geste fait une enorme difference dans la perception de votre service. \u{2B50}

Le systeme de rappels d\'entretien est particulierement puissant. L\'IA garde en memoire toutes vos interventions : date, type, equipement concerne. Elle genere automatiquement des rappels au bon moment : "Votre chaudiere a ete entretenue il y a 11 mois. Souhaitez-vous prendre rendez-vous pour l\'entretien annuel ?" C\'est du chiffre d\'affaires recurrent sans effort de prospection !

La gestion des avis Google est aussi automatisee. Apres une intervention reussie, l\'IA envoie un message poli au client avec un lien direct vers votre fiche Google : "Si vous etes satisfait de notre intervention, un avis Google nous aiderait beaucoup. Merci !" Les plombiers qui utilisent ce systeme voient leurs avis passer de 5-10 a plus de 50 en quelques mois.

L\'IA gere aussi les situations delicates : retard sur un chantier, report d\'intervention, augmentation de prix par rapport au devis initial. Elle vous propose des formulations diplomatiques qui preservent la relation. "Suite a la decouverte d\'une canalisation vetuste non visible initialement, un travail supplementaire est necessaire. Voici le complement de devis detaille." \u{1F4AC}

Enfin, le fichier client se construit automatiquement. Pour chaque client, l\'IA garde l\'historique complet : interventions passees, equipements installes, preferences de contact, notes. Quand un client rappelle, vous avez tout son historique en un clic.`,
          xpReward: 15,
        },
        {
          id: 'plb-m4-l2',
          title: 'Exercice : Rediger des messages clients',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez vos modeles de messages client automatises.',
          exercisePrompt: `Vous etes plombier et vous souhaitez configurer vos messages automatiques dans Freenzy. Redigez les 4 messages suivants :

1. Accuse de reception d'une demande de depannage urgent (le client a une fuite)
2. Confirmation de RDV pour le lendemain matin (creneau 8h-10h)
3. Message post-intervention (remplacement d'un cumulus electrique par un thermodynamique)
4. Demande d'avis Google (envoyee 3 jours apres l'intervention)

Pour chaque message :
- Maximum 4 lignes (concis et professionnel)
- Incluez un appel a l'action clair
- Choisissez le canal (SMS ou WhatsApp) et justifiez`,
          xpReward: 20,
        },
        {
          id: 'plb-m4-l3',
          title: 'Quiz — Relation client plombier',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la relation client automatisee.',
          quizQuestions: [
            {
              question: 'Quel est l\'interet principal du message post-intervention ?',
              options: [
                'Demander un paiement immediat',
                'Ameliorer la perception de votre service',
                'Proposer une nouvelle intervention',
                'Verifier que le client est chez lui',
              ],
              correctIndex: 1,
              explanation: 'Le message post-intervention montre votre professionnalisme et votre souci du client, ce qui ameliore considerablement sa perception de votre service.',
            },
            {
              question: 'Comment le systeme de rappels d\'entretien genere-t-il du chiffre d\'affaires ?',
              options: [
                'En augmentant les prix chaque annee',
                'En generant des rappels automatiques pour les entretiens recurrents',
                'En envoyant de la publicite',
                'En proposant des services inutiles',
              ],
              correctIndex: 1,
              explanation: 'Les rappels d\'entretien (chaudiere annuelle, adoucisseur, etc.) generent du chiffre d\'affaires recurrent sans effort de prospection.',
            },
            {
              question: 'Combien d\'avis Google un plombier peut-il obtenir avec le systeme automatise ?',
              options: ['5 a 10', '10 a 20', 'Plus de 50 en quelques mois', 'Plus de 500'],
              correctIndex: 2,
              explanation: 'En envoyant systematiquement une demande d\'avis apres chaque intervention reussie, les plombiers passent de 5-10 avis a plus de 50 en quelques mois.',
            },
            {
              question: 'Que contient le fichier client automatique ?',
              options: [
                'Uniquement le nom et le telephone',
                'L\'historique complet : interventions, equipements, preferences, notes',
                'Les donnees bancaires du client',
                'Les devis des concurrents',
              ],
              correctIndex: 1,
              explanation: 'Le fichier client regroupe tout l\'historique : interventions passees, equipements installes, preferences de contact et notes de suivi.',
            },
            {
              question: 'Comment l\'IA aide-t-elle dans les situations delicates (retard, supplement) ?',
              options: [
                'Elle refuse de communiquer',
                'Elle propose des formulations diplomatiques adaptees',
                'Elle ment au client',
                'Elle annule l\'intervention',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des formulations professionnelles et diplomatiques pour les situations delicates, preservant la relation client.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Relation Client Pro',
    },

    // Module 5 — Facturation
    {
      id: 'plb-m5',
      title: 'Facturation et comptabilite simplifiees',
      emoji: '\u{1F4B3}',
      description: 'Facturez rapidement et suivez votre tresorerie sans prise de tete.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m5-l1',
          title: 'Facturer en un clic avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La facturation est souvent la bete noire des plombiers. Apres une longue journee de chantier, la derniere chose que vous voulez faire, c\'est ouvrir votre logiciel de compta. Avec Freenzy, la facturation devient quasi-automatique ! \u{1F4B3}

Le principe est elegant : votre devis accepte se transforme en facture en un clic. L\'IA reprend les postes du devis, ajuste si necessaire les quantites reelles (vous avez utilise 3 metres de PER au lieu de 2,5 ? Modifiez et c\'est recalcule), et genere une facture conforme aux obligations legales en vigueur.

La numerotation est automatique et sequentielle, comme l\'exige la loi. Les mentions obligatoires sont toujours presentes : numero de facture, date, identite du client, detail des prestations, TVA, conditions de paiement, penalites de retard et indemnite forfaitaire de recouvrement. Vous etes en conformite sans y penser. \u{2705}

Le suivi des paiements est automatise. L\'IA sait quelles factures sont payees, en attente ou en retard. A J+30 (ou tout autre delai que vous configurez), une relance polie est envoyee automatiquement : "Sauf erreur de notre part, nous n\'avons pas encore recu le reglement de la facture n°2026-042. Pourriez-vous verifier ?" A J+45, le ton devient plus ferme. A J+60, l\'IA vous alerte pour passer en procedure de recouvrement.

Le tableau de bord financier vous donne une vision claire de votre activite : chiffre d\'affaires du mois, factures en attente, tresorerie previsionnelle, taux de recouvrement. Vous savez exactement ou vous en etes financierement, sans avoir besoin de votre comptable pour les informations basiques.

L\'export comptable est prevu : vous generez un fichier compatible avec les logiciels de comptabilite courants (format FEC) que votre expert-comptable peut importer directement. Fini les saisies manuelles en double et les erreurs de report. Votre comptable vous remerciera ! \u{1F4CA}

Enfin, l\'IA vous rappelle les echeances fiscales : declaration de TVA, acomptes d\'impots, cotisations sociales. Plus de penalites pour oubli de declaration.`,
          xpReward: 15,
        },
        {
          id: 'plb-m5-l2',
          title: 'Exercice : Transformer un devis en facture',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez un devis accepte en facture ajustee.',
          exercisePrompt: `Voici un devis accepte par votre client M. Martin :

Devis D-2026-089 — Renovation plomberie salle de bain
- Depose ancienne baignoire et evacuation : 280 euros HT
- Fourniture et pose receveur douche 90x120 : 650 euros HT
- Colonne de douche thermostatique : 320 euros HT
- Raccordements eau chaude/froide : 180 euros HT
- Etancheite et carrelage (sous-traitant) : 850 euros HT
Total HT : 2 280 euros — TVA 10% : 228 euros — TTC : 2 508 euros

Modifications reelles apres intervention :
- Le receveur choisi est un 80x120 (moins cher : 580 euros HT)
- Un flexible supplementaire a ete necessaire : +35 euros HT
- La colonne de douche choisie est identique au devis

Redigez :
1. La facture ajustee avec les montants corrects
2. Les mentions obligatoires a ne pas oublier
3. Le message d'accompagnement pour envoyer la facture au client`,
          xpReward: 20,
        },
        {
          id: 'plb-m5-l3',
          title: 'Quiz — Facturation plombier',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la facturation IA.',
          quizQuestions: [
            {
              question: 'Comment la facture est-elle generee dans Freenzy ?',
              options: [
                'En saisissant tout manuellement',
                'En transformant le devis accepte en un clic',
                'En photographiant un document papier',
                'En appelant le support technique',
              ],
              correctIndex: 1,
              explanation: 'Le devis accepte se transforme en facture en un clic, avec ajustement possible des quantites reelles.',
            },
            {
              question: 'A quel moment la premiere relance de paiement est-elle envoyee ?',
              options: ['Immediatement', 'A J+7', 'A J+30 (configurable)', 'A J+90'],
              correctIndex: 2,
              explanation: 'La premiere relance est envoyee a J+30 par defaut (delai configurable), avec un ton poli et professionnel.',
            },
            {
              question: 'Quel format d\'export est compatible avec les logiciels comptables ?',
              options: ['PDF uniquement', 'Format FEC', 'Format image', 'Format audio'],
              correctIndex: 1,
              explanation: 'L\'export au format FEC (Fichier des Ecritures Comptables) est directement importable par les logiciels de comptabilite et par votre expert-comptable.',
            },
            {
              question: 'Que rappelle l\'IA en plus de la facturation ?',
              options: [
                'Les anniversaires de vos clients',
                'Les echeances fiscales (TVA, cotisations)',
                'Les promotions fournisseurs',
                'Les matchs de football',
              ],
              correctIndex: 1,
              explanation: 'L\'IA rappelle les echeances fiscales importantes : declarations de TVA, acomptes d\'impots et cotisations sociales pour eviter les penalites.',
            },
            {
              question: 'Quelle mention est obligatoire sur une facture de plomberie ?',
              options: [
                'La couleur de la salle de bain',
                'Le numero sequentiel, la TVA et les penalites de retard',
                'Le nom du fournisseur de pieces',
                'La marque de votre camionnette',
              ],
              correctIndex: 1,
              explanation: 'Les mentions obligatoires incluent le numero sequentiel, le detail de la TVA, les conditions de paiement et les penalites de retard.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B3}',
      badgeName: 'Comptable Express',
    },

    // Module 6 — Normes sanitaires
    {
      id: 'plb-m6',
      title: 'Conformite normes sanitaires',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Restez a jour sur les normes DTU, reglementations sanitaires et certifications.',
      duration: '10 min',
      lessons: [
        {
          id: 'plb-m6-l1',
          title: 'L\'IA pour respecter les normes sanitaires',
          duration: '4 min',
          type: 'text',
          content: `Les normes sanitaires en plomberie evoluent regulierement : DTU 60.1 pour les canalisations, DTU 60.11 pour le reseau d\'eau chaude, normes ACS pour les materiaux en contact avec l\'eau potable, reglementation legionellose pour les ECS. Rester a jour est un defi permanent. L\'IA de Freenzy vous alerte et vous guide. \u{1F6E1}\u{FE0F}

Le systeme de veille normative surveille les evolutions reglementaires qui concernent votre activite. Quand un DTU est mis a jour ou qu\'une nouvelle obligation entre en vigueur, vous recevez un resume clair en langage simple : "Nouvelle obligation depuis le 1er janvier : les installations de production d\'eau chaude sanitaire collective doivent inclure un systeme anti-legionellose conforme a l\'arrete du..." Pas de jargon juridique inutile, juste ce que vous devez savoir et faire.

Lors de la creation d\'un devis, l\'IA verifie automatiquement la conformite des materiaux et equipements que vous proposez. Si vous mentionnez un tube PER pour un raccordement gaz, elle vous alerte immediatement : "Attention : le PER n\'est pas autorise pour le gaz. Utilisez du cuivre ou du PLT certifie." Ces verifications evitent des erreurs couteuses et potentiellement dangereuses. \u{26A0}\u{FE0F}

L\'IA genere aussi les attestations de conformite apres vos interventions. Pour une installation de chauffe-eau, elle produit un document attestant que l\'installation respecte les normes en vigueur : distance de securite, evacuation des produits de combustion, pression de service, temperature de consigne. Ce document protege vous et votre client en cas de sinistre.

Le carnet d\'entretien digital est un autre atout. Pour chaque installation, l\'IA garde un historique des interventions, des pieces changees et des controles effectues. Quand un assureur ou un expert demande le suivi d\'entretien d\'un equipement, vous fournissez un document complet et professionnel en quelques secondes.

Enfin, l\'IA vous aide a preparer vos certifications et qualifications : RGE, Qualibat, PG (Professionnel du Gaz). Elle vous rappelle les dates de renouvellement et vous aide a constituer les dossiers avec les pieces justificatives necessaires. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'plb-m6-l2',
          title: 'Jeu : Associer normes et situations',
          duration: '3 min',
          type: 'game',
          content: 'Associez les normes aux situations ou elles s\'appliquent.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque norme a la situation de plomberie correspondante',
            pairs: [
              { left: 'DTU 60.1', right: 'Canalisations d\'alimentation en eau' },
              { left: 'DTU 60.11', right: 'Reseaux d\'eau chaude sanitaire' },
              { left: 'Norme ACS', right: 'Materiaux en contact avec l\'eau potable' },
              { left: 'Arrete legionellose', right: 'Temperature ECS > 55 degres au stockage' },
              { left: 'Qualification RGE', right: 'Installation chauffe-eau thermodynamique' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'plb-m6-l3',
          title: 'Quiz — Normes et conformite',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les normes sanitaires.',
          quizQuestions: [
            {
              question: 'Que fait l\'IA quand vous mentionnez un materiau non conforme dans un devis ?',
              options: [
                'Elle l\'ignore',
                'Elle vous alerte immediatement avec une alternative conforme',
                'Elle supprime le devis',
                'Elle previent le client',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les materiaux non conformes et vous alerte en proposant des alternatives qui respectent les normes en vigueur.',
            },
            {
              question: 'A quoi sert le carnet d\'entretien digital ?',
              options: [
                'A augmenter vos prix',
                'A garder l\'historique des interventions et fournir un suivi aux assureurs',
                'A espionner les autres plombiers',
                'A remplacer votre assurance',
              ],
              correctIndex: 1,
              explanation: 'Le carnet d\'entretien digital conserve l\'historique complet des interventions et peut etre fourni aux assureurs ou experts en cas de besoin.',
            },
            {
              question: 'Comment l\'IA vous informe-t-elle des evolutions normatives ?',
              options: [
                'Elle ne suit pas les normes',
                'Elle envoie des resumes clairs en langage simple',
                'Elle vous inscrit a des formations obligatoires',
                'Elle modifie vos devis sans vous prevenir',
              ],
              correctIndex: 1,
              explanation: 'L\'IA surveille les evolutions reglementaires et vous envoie des resumes clairs, sans jargon juridique, avec les actions a mener.',
            },
            {
              question: 'Quelle qualification permet de beneficier des aides pour les chauffe-eau thermodynamiques ?',
              options: ['Qualibat seul', 'RGE (Reconnu Garant de l\'Environnement)', 'PG uniquement', 'Aucune qualification necessaire'],
              correctIndex: 1,
              explanation: 'La qualification RGE est necessaire pour que vos clients puissent beneficier des aides de l\'Etat (MaPrimeRenov\', CEE) lors de l\'installation d\'equipements performants.',
            },
            {
              question: 'Quel document l\'IA genere-t-elle apres une installation de chauffe-eau ?',
              options: [
                'Un simple recu de paiement',
                'Une attestation de conformite detaillee',
                'Un bon de garantie constructeur',
                'Rien, c\'est au client de verifier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere une attestation de conformite detaillant les normes respectees, les distances de securite et les parametres de l\'installation.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Expert Normes',
    },
  ],
};

// =============================================================================
// 2. ELECTRICIEN IA
// =============================================================================

export const parcoursElectricienIA: FormationParcours = {
  id: 'electricien-ia',
  title: 'IA pour les Electriciens',
  emoji: '\u{26A1}',
  description: 'Boostez votre activite d\'electricien avec l\'IA : devis conformes, verification NFC 15-100, diagnostic intelligent, planification, facturation et formation continue.',
  category: 'metier',
  subcategory: 'electricite',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#7C3AED',
  diplomaTitle: 'Electricien Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Electriciens',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Devis electricite
    {
      id: 'elec-m1',
      title: 'Devis electriques professionnels',
      emoji: '\u{1F4DD}',
      description: 'Generez des devis electriques detailles et conformes en quelques minutes.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m1-l1',
          title: 'Creer un devis electrique avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Etablir un devis electrique est complexe : il faut lister les points lumineux, les prises, les circuits specialises, le tableau electrique, le cablage et la main d\'oeuvre. Sans parler des normes NFC 15-100 a respecter pour chaque piece. L\'IA de Freenzy simplifie tout ce processus. \u{26A1}

Vous decrivez l\'installation en langage naturel : "Renovation electrique complete appartement T3, 65m2 : sejour, cuisine, 2 chambres, SDB, WC. Tableau 3 rangees, disjoncteur differentiel 30mA, 8 circuits eclairage, 12 prises standard, 5 circuits specialises (four, plaque, lave-linge, lave-vaisselle, seche-linge)." L\'IA genere un devis structure poste par poste.

Le systeme connait les prix moyens du marche pour l\'appareillage electrique courant : disjoncteurs, interrupteurs differentiels, prises, interrupteurs, boites d\'encastrement, gaines ICTA, cables R2V. Il vous propose une base que vous ajustez selon vos fournisseurs habituels (Rexel, Sonepar, CGE Distribution). \u{1F4B0}

L\'intelligence du systeme, c\'est la verification automatique de conformite NFC 15-100. Si vous oubliez un circuit specialise obligatoire en cuisine ou si le nombre de prises est insuffisant pour la surface d\'une piece, l\'IA vous alerte : "Attention : la norme NFC 15-100 impose minimum 6 prises pour un sejour de plus de 28m2. Votre devis n\'en comporte que 4."

Le devis inclut automatiquement les elements souvent oublies : mise a la terre, liaison equipotentielle salle de bain, protection parafoudre si obligatoire dans votre zone, gaines techniques. Ces details font la difference entre un devis amateur et un devis professionnel qui inspire confiance.

Les mentions obligatoires sont generees automatiquement : numero d\'assurance decennale, qualification (Qualifelec, IRVE), conditions de paiement, duree de validite. Le devis est exporte en PDF professionnel et envoye directement au client. \u{1F4CB}

Sur un mois avec 15 devis, vous economisez environ 12 heures de travail administratif — du temps que vous pouvez consacrer a vos chantiers ou a votre vie personnelle.`,
          xpReward: 15,
        },
        {
          id: 'elec-m1-l2',
          title: 'Exercice : Mon devis renovation electrique',
          duration: '3 min',
          type: 'exercise',
          content: 'Redigez la description d\'un chantier pour generer un devis IA.',
          exercisePrompt: `Un client vous demande un devis pour la mise en securite electrique d'une maison ancienne (annees 1970) :
- Remplacement du tableau electrique (fusibles porcelaine -> disjoncteurs)
- Mise aux normes du circuit salle de bain (liaison equipotentielle)
- Ajout de prises dans le sejour (actuellement 2 prises pour 35m2)
- Installation d'un circuit specialise pour une plaque induction
- Verification et remplacement de la prise de terre

Redigez la description detaillee pour l'assistant Commercial de Freenzy. Incluez :
1. Le detail technique de chaque poste
2. Les references normatives (NFC 15-100)
3. Les contraintes specifiques (maison ancienne, encastre ou apparent)
4. Les elements de securite a ne pas oublier

Identifiez 3 postes que l'IA pourrait sous-estimer et expliquez pourquoi.`,
          xpReward: 20,
        },
        {
          id: 'elec-m1-l3',
          title: 'Quiz — Devis electriques',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les devis electriques IA.',
          quizQuestions: [
            {
              question: 'Que verifie l\'IA automatiquement dans un devis electrique ?',
              options: [
                'Uniquement le prix total',
                'La conformite NFC 15-100 (nombre de prises, circuits specialises)',
                'La couleur des interrupteurs',
                'La marque du materiel',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie automatiquement la conformite NFC 15-100 : nombre de prises par piece, circuits specialises obligatoires, protections differentielles.',
            },
            {
              question: 'Combien de prises minimum la norme impose-t-elle dans un sejour de plus de 28m2 ?',
              options: ['3 prises', '4 prises', '6 prises', '10 prises'],
              correctIndex: 2,
              explanation: 'La norme NFC 15-100 impose un minimum de 6 prises pour un sejour de plus de 28m2.',
            },
            {
              question: 'Quel element l\'IA inclut-elle et que les electriciens oublient souvent ?',
              options: [
                'Le prix de l\'electricite',
                'La liaison equipotentielle salle de bain et le parafoudre',
                'Le contrat EDF',
                'La peinture des murs',
              ],
              correctIndex: 1,
              explanation: 'L\'IA inclut systematiquement les elements souvent oublies : liaison equipotentielle, parafoudre obligatoire selon zone, mise a la terre.',
            },
            {
              question: 'Combien d\'heures un electricien economise-t-il par mois avec les devis IA ?',
              options: ['2 heures', '5 heures', '12 heures', '30 heures'],
              correctIndex: 2,
              explanation: 'Avec 15 devis par mois, l\'economie est d\'environ 12 heures de travail administratif mensuel.',
            },
            {
              question: 'Quelle qualification professionnelle l\'IA mentionne-t-elle dans le devis ?',
              options: [
                'Aucune qualification',
                'Qualifelec et/ou IRVE',
                'Uniquement le SIRET',
                'Le diplome scolaire',
              ],
              correctIndex: 1,
              explanation: 'L\'IA inclut vos qualifications professionnelles (Qualifelec, IRVE pour bornes de recharge) qui renforcent la credibilite de votre devis.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Devis Electrique Pro',
    },

    // Module 2 — Conformite NFC 15-100
    {
      id: 'elec-m2',
      title: 'Conformite NFC 15-100 automatisee',
      emoji: '\u{2705}',
      description: 'Verifiez la conformite de vos installations grace aux check-lists IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m2-l1',
          title: 'L\'IA comme assistant de conformite',
          duration: '4 min',
          type: 'text',
          content: `La norme NFC 15-100 est le pilier de la securite electrique en France. Avec ses centaines de pages et ses mises a jour regulieres, aucun electricien ne peut la connaitre par coeur dans son integralite. L\'IA de Freenzy devient votre assistant de conformite permanent. \u{2705}

Pour chaque type de piece, l\'IA connait les exigences minimales : nombre de prises, hauteur d\'installation, volumes de securite (salle de bain), circuits obligatoires, sections de cable, protections differentielles. Quand vous planifiez une installation, elle genere une check-list complete adaptee au logement.

Prenons l\'exemple d\'une salle de bain. L\'IA vous rappelle les 4 volumes de securite (0, 1, 2 et hors volume), les types d\'appareillage autorises dans chaque volume, la necessite d\'une liaison equipotentielle locale et le type de protection differentielle exige (30 mA haute sensibilite). Si votre plan d\'installation place une prise dans le volume 1, l\'alerte est immediate. \u{26A0}\u{FE0F}

Pour une cuisine, le systeme verifie la presence des circuits specialises obligatoires : four (20A), plaque de cuisson (32A), lave-vaisselle (20A), lave-linge si present (20A). Il verifie aussi le nombre de prises du plan de travail (minimum 4 au-dessus du plan si la cuisine fait plus de 4m2) et leur positionnement par rapport aux points d\'eau.

L\'IA suit aussi les amendments et mises a jour de la norme. Quand l\'amendment A5 de la NFC 15-100 a modifie les regles sur les ETEL (Espace Technique Electrique du Logement), tous les electriciens utilisant Freenzy ont ete informes immediatement avec un resume des changements pratiques.

Le rapport de conformite genere par l\'IA est un document professionnel que vous remettez au client et qui peut servir de reference lors du controle Consuel. Il liste les points verifies, les normes applicables et atteste que l\'installation respecte les exigences en vigueur. C\'est un gage de serieux et de professionnalisme. \u{1F4CB}

Enfin, l\'IA vous aide a preparer vos visites Consuel en listant les documents et verifications necessaires avant l\'inspection.`,
          xpReward: 15,
        },
        {
          id: 'elec-m2-l2',
          title: 'Jeu : Volumes de securite salle de bain',
          duration: '3 min',
          type: 'game',
          content: 'Classez les equipements par volume autorise.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque equipement au volume de securite ou il est autorise en salle de bain',
            pairs: [
              { left: 'Chauffe-eau instantane', right: 'Volume 1 (avec protection 30mA)' },
              { left: 'Prise de courant rasoir', right: 'Volume 2 (transformateur de separation)' },
              { left: 'Eclairage TBT 12V', right: 'Volume 0 (IPX7)' },
              { left: 'Seche-serviettes', right: 'Volume 2 (classe II)' },
              { left: 'Interrupteur standard', right: 'Hors volume uniquement' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'elec-m2-l3',
          title: 'Quiz — NFC 15-100',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la conformite electrique.',
          quizQuestions: [
            {
              question: 'Combien de volumes de securite comporte une salle de bain selon la NFC 15-100 ?',
              options: ['2 volumes', '3 volumes', '4 volumes (0, 1, 2 et hors volume)', '5 volumes'],
              correctIndex: 2,
              explanation: 'La salle de bain comporte 4 zones : volume 0 (interieur baignoire/douche), volume 1 (au-dessus), volume 2 (60cm autour) et hors volume.',
            },
            {
              question: 'Quelle section de cable est necessaire pour un circuit plaque de cuisson ?',
              options: ['1,5 mm2', '2,5 mm2', '6 mm2 (32A)', '10 mm2'],
              correctIndex: 2,
              explanation: 'Un circuit plaque de cuisson necessite un cable de 6 mm2 protege par un disjoncteur 32A selon la NFC 15-100.',
            },
            {
              question: 'Qu\'est-ce que l\'ETEL ?',
              options: [
                'Un type de disjoncteur',
                'L\'Espace Technique Electrique du Logement',
                'Un organisme de certification',
                'Un cable special',
              ],
              correctIndex: 1,
              explanation: 'L\'ETEL (Espace Technique Electrique du Logement) est l\'espace dedie au tableau electrique et a l\'arrivee des courants forts et faibles.',
            },
            {
              question: 'Quel type de protection differentielle est exige en salle de bain ?',
              options: ['100 mA', '300 mA', '30 mA haute sensibilite', '500 mA'],
              correctIndex: 2,
              explanation: 'Tous les circuits de la salle de bain doivent etre proteges par un differentiel 30 mA haute sensibilite.',
            },
            {
              question: 'A quoi sert le rapport de conformite genere par l\'IA ?',
              options: [
                'A remplacer le Consuel',
                'A servir de reference lors du controle Consuel',
                'A vendre plus cher',
                'A eviter les inspections',
              ],
              correctIndex: 1,
              explanation: 'Le rapport de conformite est un document professionnel qui sert de reference lors du controle Consuel et atteste du respect des normes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2705}',
      badgeName: 'Expert NFC 15-100',
    },

    // Module 3 — Diagnostic intelligent
    {
      id: 'elec-m3',
      title: 'Diagnostic electrique intelligent',
      emoji: '\u{1F50D}',
      description: 'Utilisez l\'IA pour diagnostiquer les pannes electriques plus rapidement.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m3-l1',
          title: 'L\'IA comme aide au diagnostic',
          duration: '4 min',
          type: 'text',
          content: `Face a une panne electrique, l\'experience est votre meilleur atout. Mais meme les electriciens les plus experimentes peuvent gagner du temps avec un assistant IA qui connait tous les schemas de pannes courants et rares. Freenzy devient votre compagnon de diagnostic. \u{1F50D}

Le fonctionnement est simple : vous decrivez les symptomes au chat de l\'assistant. "Le differentiel 30mA saute regulierement, surtout quand il pleut. Ca concerne le circuit exterieur (eclairage jardin + prise terrasse)." L\'IA analyse les symptomes et propose un arbre de diagnostic hierarchise, du plus probable au moins probable.

Dans notre exemple, l\'IA proposerait : 1) Defaut d\'isolement sur un luminaire exterieur (infiltration d\'eau) — probabilite haute en cas de pluie. 2) Cable endommage dans un passage enterre — verifier l\'integrite de la gaine. 3) Prise exterieure non etanche (indice IP insuffisant). Chaque hypothese est accompagnee de la procedure de verification.

L\'IA connait les pannes les plus frequentes par type d\'installation. Pour un tableau electrique qui disjoncte, elle verifie d\'abord la surcharge (puissance souscrite vs consommation reelle), puis les courts-circuits, puis les defauts d\'isolement. Pour un eclairage qui clignote, elle distingue les causes : neutre mal serre, variateur incompatible avec LED, surtension reseau. \u{1F4A1}

Le systeme est particulierement utile pour les pannes intermittentes, les plus difficiles a diagnostiquer. Vous enregistrez les occurrences (date, heure, conditions meteo, appareils en marche) et l\'IA identifie des correlations invisibles a l\'oeil nu : "La panne survient principalement entre 18h et 20h, quand le four et le seche-linge fonctionnent simultanement. Probable surcharge du circuit dedie cuisine."

L\'IA vous aide aussi a rediger le rapport d\'intervention de maniere professionnelle : description du probleme, diagnostic effectue, solution mise en oeuvre, recommandations pour eviter la recurrence. Ce rapport est archive dans le dossier client pour reference future.

Attention : l\'IA est un outil d\'aide, pas un remplacant. Votre expertise terrain, vos mesures avec le multimetre et votre jugement professionnel restent indispensables. L\'IA accelere le processus, elle ne le remplace pas. \u{1F6E0}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'elec-m3-l2',
          title: 'Exercice : Diagnostiquer une panne',
          duration: '3 min',
          type: 'exercise',
          content: 'Utilisez la methode IA pour diagnostiquer une panne electrique.',
          exercisePrompt: `Un client vous appelle avec le probleme suivant :
"Depuis hier, la moitie de mon appartement n'a plus de courant. Le salon, la cuisine et l'entree fonctionnent, mais les 2 chambres et la salle de bain sont sans electricite. J'ai verifie le tableau : aucun disjoncteur n'a saute."

En utilisant la methode de diagnostic IA, redigez :
1. Les 3 hypotheses les plus probables (classees par probabilite)
2. Pour chaque hypothese, la procedure de verification
3. Les mesures a effectuer (multimetre, testeur de phase)
4. La question complementaire que vous poseriez au client pour affiner le diagnostic
5. Le rapport d'intervention type si la cause est un bornier de repartition deserre`,
          xpReward: 20,
        },
        {
          id: 'elec-m3-l3',
          title: 'Quiz — Diagnostic electrique',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos competences en diagnostic IA.',
          quizQuestions: [
            {
              question: 'Quelle est la premiere cause a verifier quand un differentiel saute quand il pleut ?',
              options: [
                'Un court-circuit dans le tableau',
                'Un defaut d\'isolement sur un equipement exterieur',
                'Une surtension du reseau',
                'Un probleme chez le voisin',
              ],
              correctIndex: 1,
              explanation: 'Quand un differentiel saute par temps de pluie, la cause la plus probable est un defaut d\'isolement sur un equipement exterieur (infiltration d\'eau).',
            },
            {
              question: 'Comment l\'IA aide-t-elle pour les pannes intermittentes ?',
              options: [
                'Elle ne peut pas aider pour ce type de panne',
                'Elle identifie des correlations entre occurrences (heure, meteo, appareils)',
                'Elle remplace le multimetre',
                'Elle appelle un autre electricien',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les occurrences (date, heure, conditions) pour identifier des correlations invisibles qui orientent le diagnostic.',
            },
            {
              question: 'L\'IA remplace-t-elle l\'expertise de l\'electricien ?',
              options: [
                'Oui, completement',
                'Non, elle accelere le processus mais ne remplace pas le jugement professionnel',
                'Oui, pour les pannes simples',
                'Non, elle est inutile',
              ],
              correctIndex: 1,
              explanation: 'L\'IA est un outil d\'aide au diagnostic qui accelere le processus. L\'expertise terrain et les mesures physiques restent indispensables.',
            },
            {
              question: 'Que contient le rapport d\'intervention genere par l\'IA ?',
              options: [
                'Uniquement le prix',
                'Description du probleme, diagnostic, solution et recommandations',
                'Juste la date et l\'heure',
                'Les coordonnees du fournisseur',
              ],
              correctIndex: 1,
              explanation: 'Le rapport inclut la description du probleme, le diagnostic effectue, la solution mise en oeuvre et les recommandations de prevention.',
            },
            {
              question: 'Pourquoi un eclairage LED peut-il clignoter ?',
              options: [
                'Parce que les LED clignotent toujours',
                'A cause d\'un variateur incompatible ou d\'un neutre mal serre',
                'Parce que la LED est trop puissante',
                'A cause d\'un fusible use',
              ],
              correctIndex: 1,
              explanation: 'Le clignotement LED est souvent cause par un variateur non compatible LED ou un neutre mal serre dans le boitier d\'encastrement.',
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

    // Module 4 — Planification chantiers
    {
      id: 'elec-m4',
      title: 'Planification de chantiers',
      emoji: '\u{1F4C5}',
      description: 'Organisez vos chantiers electriques avec une planification IA optimisee.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m4-l1',
          title: 'Planifier ses chantiers electriques',
          duration: '4 min',
          type: 'text',
          content: `Un chantier electrique mal planifie, c\'est des allers-retours inutiles, du materiel oublie et des delais qui explosent. L\'IA de Freenzy structure votre planification pour que chaque chantier se deroule sans accroc. \u{1F4C5}

Pour chaque chantier, l\'IA genere un retroplanning detaille. Prenons une renovation electrique complete d\'appartement : Jour 1 — reperage, tracage et saignees. Jour 2 — passage des gaines et tirage des cables. Jour 3 — pose de l\'appareillage et raccordements. Jour 4 — tableau electrique et mises en service. Jour 5 — tests, verifications et nettoyage. Chaque etape a sa duree estimee basee sur votre historique.

La liste de materiel est generee automatiquement a partir du devis. L\'IA calcule les longueurs de cable necessaires (avec 15% de marge), le nombre de boites d\'encastrement, les gaines ICTA, les attaches et les connecteurs. Vous commandez le materiel en une seule fois, au bon moment, avec les bonnes quantites. Fini les commandes en urgence le troisieme jour de chantier ! \u{1F4E6}

La coordination avec les autres corps de metier est facilitee. Si un plaquiste intervient apres vous, l\'IA vous rappelle de prendre les photos avant fermeture des cloisons (preuve du passage des gaines). Si vous intervenez apres le plaquiste, elle verifie que les boites d\'encastrement sont accessibles.

Le planning integre aussi les temps d\'attente incompressibles : sechage du platre apres rebouchage des saignees, delai de livraison du tableau sur mesure, disponibilite du Consuel pour l\'inspection. L\'IA calcule la date de fin realiste en tenant compte de tous ces facteurs.

Quand un chantier prend du retard — et ca arrive — l\'IA recalcule automatiquement l\'impact sur vos autres engagements. Elle vous alerte si un chevauchement se cree et propose des solutions : decaler un chantier moins urgent, prevoir des heures supplementaires ou faire appel a un collegue pour un renfort ponctuel.

Le suivi d\'avancement est visuel : chaque etape est cochee au fur et a mesure, avec un pourcentage de completion et une estimation du temps restant. Le client peut recevoir un rapport d\'avancement hebdomadaire automatique s\'il le souhaite. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'elec-m4-l2',
          title: 'Jeu : Ordonner les etapes d\'un chantier',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes d\'une renovation electrique.',
          gameType: 'ordering',
          gameData: {
            instruction: 'Classez les etapes d\'une renovation electrique complete dans l\'ordre chronologique correct',
            items: [
              'Reperage et tracage des circuits sur les murs',
              'Realisation des saignees et percages',
              'Passage des gaines ICTA et tirage des cables',
              'Pose des boites d\'encastrement et appareillage',
              'Cablage du tableau electrique et raccordements',
              'Tests d\'isolement, verifications et mise en service',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          xpReward: 20,
        },
        {
          id: 'elec-m4-l3',
          title: 'Quiz — Planification chantiers',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la planification IA.',
          quizQuestions: [
            {
              question: 'Quelle marge l\'IA ajoute-t-elle aux longueurs de cable calculees ?',
              options: ['5%', '10%', '15%', '25%'],
              correctIndex: 2,
              explanation: 'L\'IA ajoute une marge de 15% aux longueurs de cable calculees pour absorber les ecarts entre le plan et la realite du chantier.',
            },
            {
              question: 'Pourquoi l\'IA vous rappelle-t-elle de prendre des photos avant fermeture des cloisons ?',
              options: [
                'Pour les reseaux sociaux',
                'Pour prouver le passage des gaines en cas de litige',
                'Pour decorer votre site web',
                'Pour envoyer au fournisseur',
              ],
              correctIndex: 1,
              explanation: 'Les photos avant fermeture servent de preuve du cheminement des gaines et cables, utile en cas de litige ou d\'intervention future.',
            },
            {
              question: 'Que fait l\'IA quand un chantier prend du retard ?',
              options: [
                'Elle annule les autres chantiers',
                'Elle recalcule l\'impact et propose des solutions',
                'Elle ignore le retard',
                'Elle previent le Consuel',
              ],
              correctIndex: 1,
              explanation: 'L\'IA recalcule l\'impact du retard sur les autres engagements et propose des solutions : decalage, heures sup ou renfort.',
            },
            {
              question: 'Qu\'est-ce que le client peut recevoir automatiquement pendant les travaux ?',
              options: [
                'Des factures intermediaires uniquement',
                'Un rapport d\'avancement hebdomadaire',
                'Des photos personnelles',
                'La liste de vos autres clients',
              ],
              correctIndex: 1,
              explanation: 'Le client peut recevoir un rapport d\'avancement hebdomadaire automatique avec le pourcentage de completion et l\'estimation du temps restant.',
            },
            {
              question: 'Quel avantage offre la generation automatique de la liste de materiel ?',
              options: [
                'Commander en une seule fois avec les bonnes quantites',
                'Obtenir des reductions chez le fournisseur',
                'Eviter de payer le materiel',
                'Commander le materiel le moins cher uniquement',
              ],
              correctIndex: 0,
              explanation: 'La liste automatique permet de commander tout le materiel necessaire en une seule fois, evitant les commandes d\'urgence en cours de chantier.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Chef de Chantier',
    },

    // Module 5 — Facturation
    {
      id: 'elec-m5',
      title: 'Facturation et suivi financier',
      emoji: '\u{1F4B3}',
      description: 'Facturez vos chantiers et suivez votre tresorerie sans effort.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m5-l1',
          title: 'Facturation electrique automatisee',
          duration: '4 min',
          type: 'text',
          content: `La facturation en electricite a ses specificites : TVA a 10% pour la renovation (main d\'oeuvre + fournitures si le logement a plus de 2 ans), TVA a 20% pour le neuf, situations intermediaires pour les chantiers longs, et retenues de garantie sur les marches importants. L\'IA de Freenzy gere tout ca automatiquement. \u{1F4B3}

Le taux de TVA est calcule automatiquement en fonction du type de chantier. Vous indiquez si c\'est une renovation (logement de plus de 2 ans) ou du neuf, et l\'IA applique le bon taux. Pour les chantiers mixtes (renovation + extension neuve), elle separe les postes avec les TVA respectives. Fini les erreurs qui peuvent couter cher lors d\'un controle fiscal !

Pour les chantiers importants (plus de 5 000 euros), l\'IA vous propose un echeancier de facturation : acompte a la commande (30%), situation intermediaire a mi-chantier (40%), solde a la reception (30%). Chaque facture de situation est generee automatiquement avec le detail de l\'avancement et le cumul des paiements deja recus. \u{1F4CA}

Le suivi des paiements est complet. L\'IA sait quel client a paye, qui est en retard et de combien. Les relances sont automatiques et graduelles : un rappel amical a J+7, un deuxieme a J+15, un courrier plus formel a J+30. Vous configurez le ton et les delais selon vos preferences.

Le tableau de bord financier vous donne une vision claire : chiffre d\'affaires mensuel, marge par chantier, factures en attente, tresorerie previsionnelle sur 3 mois. Vous identifiez rapidement les chantiers les plus rentables et ceux ou vous perdez de l\'argent. Cette visibilite vous aide a mieux chiffrer vos prochains devis.

L\'attestation TVA a taux reduit (cerfa 13948) est generee automatiquement pour les chantiers de renovation. Le client n\'a plus qu\'a la signer. C\'est un detail administratif que beaucoup d\'electriciens oublient, avec le risque d\'un redressement fiscal.

L\'export comptable FEC est disponible en un clic pour votre expert-comptable. Les ecritures sont classees et documentees, ce qui reduit significativement le temps (et le cout) de la saisie comptable. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'elec-m5-l2',
          title: 'Exercice : Facturer un chantier complexe',
          duration: '3 min',
          type: 'exercise',
          content: 'Etablissez la facturation d\'un chantier en plusieurs etapes.',
          exercisePrompt: `Vous avez realise une renovation electrique complete d'un appartement (logement de 1985) :

Devis accepte : 8 500 euros HT
- Tableau electrique complet : 2 200 euros HT
- Cablage et appareillage : 3 800 euros HT
- Main d'oeuvre (5 jours) : 2 500 euros HT

Echeancier prevu :
- Acompte 30% a la commande (deja regle)
- Situation 40% a mi-chantier (travaux termines a 60%)
- Solde 30% a la reception

Questions :
1. Quel taux de TVA s'applique et pourquoi ?
2. Calculez le montant TTC de chaque facture
3. Redigez la facture de situation intermediaire avec le detail de l'avancement
4. Le client ne paie pas le solde a J+15 : redigez le premier message de relance`,
          xpReward: 20,
        },
        {
          id: 'elec-m5-l3',
          title: 'Quiz — Facturation electricien',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la facturation electrique.',
          quizQuestions: [
            {
              question: 'Quel taux de TVA s\'applique pour une renovation electrique dans un logement de plus de 2 ans ?',
              options: ['5,5%', '10%', '15%', '20%'],
              correctIndex: 1,
              explanation: 'La TVA a taux reduit de 10% s\'applique aux travaux de renovation dans les logements de plus de 2 ans (main d\'oeuvre et fournitures).',
            },
            {
              question: 'Quel document doit etre signe par le client pour beneficier de la TVA a 10% ?',
              options: [
                'Un bon de commande',
                'L\'attestation cerfa 13948',
                'Un mandat de prelevement',
                'Le devis uniquement',
              ],
              correctIndex: 1,
              explanation: 'L\'attestation cerfa 13948 doit etre signee par le client pour justifier l\'application du taux de TVA reduit a 10%.',
            },
            {
              question: 'Comment l\'IA gere-t-elle un chantier avec TVA mixte (renovation + neuf) ?',
              options: [
                'Elle applique 20% a tout',
                'Elle separe les postes avec les TVA respectives',
                'Elle applique 10% a tout',
                'Elle ne gere pas ce cas',
              ],
              correctIndex: 1,
              explanation: 'L\'IA separe automatiquement les postes renovation (TVA 10%) et neuf (TVA 20%) sur la meme facture.',
            },
            {
              question: 'Quel echeancier est propose pour un chantier de plus de 5 000 euros ?',
              options: [
                '100% a la fin',
                '50/50',
                '30% acompte, 40% mi-chantier, 30% solde',
                '25/25/25/25',
              ],
              correctIndex: 2,
              explanation: 'L\'echeancier recommande est : 30% d\'acompte, 40% a la situation intermediaire et 30% au solde final.',
            },
            {
              question: 'Quel format d\'export permet de transmettre les donnees a votre comptable ?',
              options: ['PDF uniquement', 'Format FEC', 'Fichier Word', 'Screenshot'],
              correctIndex: 1,
              explanation: 'Le format FEC (Fichier des Ecritures Comptables) est le standard pour l\'export comptable, directement importable par les logiciels de comptabilite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B3}',
      badgeName: 'Facturier Pro',
    },

    // Module 6 — Formation continue
    {
      id: 'elec-m6',
      title: 'Formation continue et veille',
      emoji: '\u{1F393}',
      description: 'Restez a jour sur les evolutions du metier et preparez vos certifications.',
      duration: '10 min',
      lessons: [
        {
          id: 'elec-m6-l1',
          title: 'L\'IA pour votre formation continue',
          duration: '4 min',
          type: 'text',
          content: `Le metier d\'electricien evolue rapidement : bornes de recharge IRVE, domotique KNX, panneaux photovoltaiques, batteries domestiques, objets connectes. Rester a jour est un avantage concurrentiel majeur. L\'IA de Freenzy vous accompagne dans votre formation continue. \u{1F393}

Le systeme de veille technologique analyse les nouvelles solutions du marche et vous envoie des resumes personnalises selon vos centres d\'interet. Si vous vous specialisez dans l\'IRVE (Infrastructure de Recharge pour Vehicules Electriques), l\'IA vous informe des nouveaux modeles de bornes, des evolutions reglementaires et des aides disponibles pour vos clients.

L\'IA vous aide a preparer vos certifications professionnelles. Pour la qualification IRVE par exemple, elle vous propose un programme de revision adapte : les differents niveaux (P1, P2, P3), les exigences techniques par niveau, les questions types de l\'examen et les points de vigilance. Vous pouvez vous entrainer avec des quiz generes par l\'IA avant de passer la certification. \u{1F4DA}

Les fiches techniques des nouveaux produits sont synthetisees par l\'IA. Au lieu de lire 30 pages de documentation constructeur, vous obtenez un resume de 2 pages avec les informations essentielles : specifications techniques, compatibilites, points d\'installation critiques et retours d\'experience d\'autres installateurs.

L\'IA identifie aussi les opportunites de marche emergentes dans votre zone geographique. "Dans votre departement, les demandes d\'installation de bornes IRVE ont augmente de 150% en 6 mois. Seulement 12 electriciens sont qualifies IRVE P2 dans un rayon de 30km. C\'est une opportunite de differenciation." Ce type d\'analyse strategique vous aide a orienter votre activite. \u{1F4C8}

La veille reglementaire est permanente : nouvelles obligations RE2020, evolution du DPE (Diagnostic de Performance Energetique), impact sur les installations electriques, nouvelles aides MaPrimeRenov\'. L\'IA vous resume les changements concrets pour votre activite quotidienne.

Enfin, l\'IA vous connecte aux formations financees par votre OPCO. Elle identifie les formations eligibles a votre budget CPF ou au plan de formation de votre entreprise, et vous aide a constituer le dossier d\'inscription.`,
          xpReward: 15,
        },
        {
          id: 'elec-m6-l2',
          title: 'Jeu : Les niveaux IRVE',
          duration: '3 min',
          type: 'game',
          content: 'Associez les niveaux IRVE aux types d\'installation.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque niveau de qualification IRVE au type d\'installation correspondant',
            pairs: [
              { left: 'IRVE P1', right: 'Borne jusqu\'a 22 kW sans configuration' },
              { left: 'IRVE P2', right: 'Borne jusqu\'a 22 kW avec configuration' },
              { left: 'IRVE P3', right: 'Borne rapide DC (> 22 kW)' },
              { left: 'Sans qualification', right: 'Prise renforcee type Green\'Up' },
              { left: 'Qualifelec mention IRVE', right: 'Reconnaissance officielle installateur' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'elec-m6-l3',
          title: 'Quiz — Formation continue',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la formation continue.',
          quizQuestions: [
            {
              question: 'Quelle specialisation est en forte croissance pour les electriciens ?',
              options: [
                'La pose de papier peint',
                'L\'installation de bornes de recharge IRVE',
                'La plomberie sanitaire',
                'La menuiserie',
              ],
              correctIndex: 1,
              explanation: 'L\'IRVE (bornes de recharge vehicules electriques) est en forte croissance avec +150% de demandes dans certains departements.',
            },
            {
              question: 'Comment l\'IA synthetise-t-elle les documentations constructeur ?',
              options: [
                'Elle ne lit pas les documentations',
                'Elle reduit 30 pages en un resume de 2 pages avec les points essentiels',
                'Elle traduit en anglais',
                'Elle copie les avis clients',
              ],
              correctIndex: 1,
              explanation: 'L\'IA synthetise les documentations techniques en resumes concis avec les specifications, compatibilites et points critiques d\'installation.',
            },
            {
              question: 'Quel avantage offre la veille geographique de l\'IA ?',
              options: [
                'Elle surveille vos concurrents',
                'Elle identifie les opportunites de marche dans votre zone',
                'Elle envoie de la publicite',
                'Elle vous deplace chez les clients',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les tendances de demande dans votre zone et identifie les opportunites de differenciation (ex: peu d\'electriciens IRVE dans votre secteur).',
            },
            {
              question: 'Comment l\'IA aide-t-elle pour les certifications ?',
              options: [
                'Elle passe l\'examen a votre place',
                'Elle propose des quiz de revision et identifie les points de vigilance',
                'Elle achete la certification',
                'Elle contacte l\'organisme certificateur',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des programmes de revision adaptes avec quiz d\'entrainement et identification des points de vigilance pour chaque certification.',
            },
            {
              question: 'Que peut faire l\'IA concernant les formations OPCO ?',
              options: [
                'Rien, c\'est a vous de chercher',
                'Identifier les formations eligibles et aider a constituer le dossier',
                'Financer la formation elle-meme',
                'Remplacer la formation en presentiel',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les formations eligibles a votre budget CPF ou OPCO et vous aide a constituer le dossier d\'inscription.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F393}',
      badgeName: 'Electricien Certifie',
    },
  ],
};

// =============================================================================
// 3. AVOCAT IA
// =============================================================================

export const parcoursAvocatIA: FormationParcours = {
  id: 'avocat-ia',
  title: 'IA pour les Avocats',
  emoji: '\u{2696}\u{FE0F}',
  description: 'Transformez votre pratique juridique avec l\'IA : recherche jurisprudence, redaction d\'actes, gestion de dossiers, facturation horaire, veille juridique et relation client.',
  category: 'metier',
  subcategory: 'droit',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#DC2626',
  diplomaTitle: 'Avocat Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Avocats',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Recherche jurisprudence
    {
      id: 'avo-m1',
      title: 'Recherche jurisprudence acceleree',
      emoji: '\u{1F50D}',
      description: 'Trouvez les decisions pertinentes en quelques minutes au lieu de quelques heures.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m1-l1',
          title: 'Revolutionner sa recherche juridique',
          duration: '4 min',
          type: 'text',
          content: `La recherche jurisprudentielle est le fondement du travail d\'avocat. Trouver les bonnes decisions, les bons arretes, les bons textes — c\'est ce qui fait la difference entre un dossier bien argumente et un dossier bancal. Mais cette recherche est chronophage : en moyenne, un avocat passe 3 a 5 heures par dossier rien qu\'en recherche. L\'IA de Freenzy reduit ce temps a 30 minutes. \u{1F50D}

Le principe est conversationnel. Vous decrivez votre problematique juridique en langage naturel : "Mon client a ete licencie pour faute grave suite a des propos tenus sur un reseau social prive. Il conteste le caractere grave de la faute. Je cherche la jurisprudence recente de la Cour de cassation sur les reseaux sociaux et le licenciement." L\'IA analyse votre requete et identifie les decisions pertinentes.

L\'IA ne se contente pas de lister des references. Elle synthetise chaque decision trouvee : faits pertinents, question de droit, solution retenue, portee de la decision. Vous evaluez en quelques secondes si la decision est utile a votre dossier, au lieu de lire 15 pages de motivation. \u{1F4DA}

Le systeme identifie aussi les revirements de jurisprudence. Si une position de la Cour de cassation a evolue sur votre sujet, l\'IA vous le signale : "Attention : la chambre sociale a inflechi sa position en 2025. L\'arret du 15 mars 2025 admet desormais que les propos tenus dans un groupe prive de moins de 10 personnes relevent de la correspondance privee."

La recherche croisee est un atout majeur. L\'IA combine jurisprudence, doctrine et textes legislatifs pour vous donner une vision complete. Elle cite les articles du Code du travail pertinents, les conventions collectives applicables et les circulaires ministerelles qui eclairent l\'interpretation.

Vous pouvez sauvegarder vos recherches dans le dossier du client. Chaque recherche est datee et referencee, ce qui constitue une trace de votre diligence professionnelle. En cas de contestation d\'honoraires, vous demontrez facilement le travail de recherche effectue.

L\'IA respecte les sources officielles : Legifrance, bases de donnees des cours d\'appel, CJUE pour le droit europeen. Elle mentionne systematiquement la reference complete de chaque decision citee. \u{2696}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'avo-m1-l2',
          title: 'Exercice : Recherche jurisprudentielle',
          duration: '3 min',
          type: 'exercise',
          content: 'Formulez une requete de recherche juridique pour l\'IA.',
          exercisePrompt: `Vous etes avocat en droit des affaires. Votre client, une SARL, a signe un bail commercial 3/6/9 il y a 4 ans. Le bailleur veut augmenter le loyer de 40% lors du renouvellement en invoquant une "modification notable des facteurs locaux de commercialite".

Redigez :
1. La requete de recherche en langage naturel pour l'assistant IA (soyez precis sur les criteres)
2. Les mots-cles juridiques essentiels a inclure
3. Les textes legislatifs que vous vous attendez a trouver (Code de commerce)
4. Les 3 questions de droit auxquelles la jurisprudence doit repondre
5. Comment vous organiseriez les resultats dans le dossier client`,
          xpReward: 20,
        },
        {
          id: 'avo-m1-l3',
          title: 'Quiz — Recherche juridique IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la recherche jurisprudentielle IA.',
          quizQuestions: [
            {
              question: 'Combien de temps un avocat passe-t-il en moyenne en recherche par dossier sans IA ?',
              options: ['30 minutes', '1 heure', '3 a 5 heures', '1 journee'],
              correctIndex: 2,
              explanation: 'En moyenne, un avocat consacre 3 a 5 heures de recherche par dossier, un temps que l\'IA reduit a environ 30 minutes.',
            },
            {
              question: 'Que fait l\'IA en plus de lister les references jurisprudentielles ?',
              options: [
                'Elle redige les conclusions a votre place',
                'Elle synthetise chaque decision (faits, question de droit, solution, portee)',
                'Elle contacte le juge',
                'Elle previent la partie adverse',
              ],
              correctIndex: 1,
              explanation: 'L\'IA synthetise chaque decision trouvee en identifiant les faits pertinents, la question de droit, la solution retenue et sa portee.',
            },
            {
              question: 'Pourquoi l\'IA signale-t-elle les revirements de jurisprudence ?',
              options: [
                'Par curiosite intellectuelle',
                'Pour eviter de citer une position juridique obsolete',
                'Pour critiquer les juges',
                'Pour impressionner le client',
              ],
              correctIndex: 1,
              explanation: 'Signaler les revirements evite de fonder une argumentation sur une position juridique qui a ete abandonnee ou inflechie par les juridictions.',
            },
            {
              question: 'Quelles sources l\'IA utilise-t-elle pour ses recherches ?',
              options: [
                'Wikipedia et blogs juridiques',
                'Legifrance, bases des cours d\'appel, CJUE',
                'Uniquement des forums en ligne',
                'Les reseaux sociaux de juristes',
              ],
              correctIndex: 1,
              explanation: 'L\'IA s\'appuie sur les sources officielles : Legifrance, les bases de donnees des cours d\'appel et la CJUE pour le droit europeen.',
            },
            {
              question: 'Quel interet y a-t-il a sauvegarder les recherches dans le dossier client ?',
              options: [
                'Aucun interet particulier',
                'Demontrer la diligence professionnelle en cas de contestation d\'honoraires',
                'Revendre les recherches a d\'autres avocats',
                'Envoyer les recherches au tribunal',
              ],
              correctIndex: 1,
              explanation: 'Les recherches datees et referencees constituent une trace de votre diligence, utile en cas de contestation d\'honoraires ou de responsabilite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Chercheur Juridique',
    },

    // Module 2 — Redaction actes
    {
      id: 'avo-m2',
      title: 'Redaction d\'actes assistee par IA',
      emoji: '\u{1F4DC}',
      description: 'Redigez contrats, conclusions et actes juridiques plus vite et plus proprement.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m2-l1',
          title: 'L\'IA pour la redaction juridique',
          duration: '4 min',
          type: 'text',
          content: `La redaction est le coeur du metier d\'avocat : conclusions, contrats, mises en demeure, protocoles d\'accord, statuts de societe. Chaque document doit etre juridiquement precis, bien structure et adapte au contexte specifique du client. L\'IA de Freenzy vous assiste a chaque etape de la redaction. \u{1F4DC}

Pour les conclusions, vous fournissez les elements du dossier et votre strategie. L\'IA genere un premier jet structure : rappel des faits, discussion juridique point par point, demandes au dispositif. Ce premier jet n\'est pas un document fini — c\'est une base solide que vous affinez avec votre expertise et votre connaissance intime du dossier.

Pour les contrats, l\'IA propose des clauses types adaptees au contexte. Un bail commercial ? Elle inclut les clauses obligatoires (duree, loyer, charges, destination, cession) et vous propose des clauses optionnelles pertinentes (clause d\'echelle mobile, clause recettes, clause de non-concurrence). Vous selectionnez, modifiez et personnalisez. \u{1F4DD}

Les mises en demeure sont generees en quelques minutes. Vous indiquez le destinataire, le fondement juridique, les faits et la demande. L\'IA redige un courrier professionnel avec le ton adequat — ferme mais juridiquement impeccable — et les references legales appropriees. Vous relisez, ajustez et envoyez.

L\'IA est particulierement utile pour les documents repetitifs mais sensibles. Statuts de SAS ? L\'IA genere un projet adapte a la configuration specifique (nombre d\'associes, apports, gouvernance) en incluant les clauses d\'agrement, les droits de preemption et les dispositions legales obligatoires. Chaque document est different, mais la structure de base est solide.

Le controle qualite est integre. L\'IA verifie la coherence interne du document (les montants, les dates, les noms sont-ils coherents tout au long du texte ?), signale les references legislatives obsoletes et alerte sur les clauses potentiellement abusives ou reputees non ecrites.

Attention cruciale : l\'IA est un assistant de redaction, pas un avocat. Chaque document doit etre relu, valide et adapte par vous. Votre responsabilite professionnelle reste entiere. L\'IA accelere le processus, mais ne remplace jamais votre jugement juridique. \u{2696}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'avo-m2-l2',
          title: 'Exercice : Rediger une mise en demeure',
          duration: '3 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour rediger une mise en demeure type.',
          exercisePrompt: `Vous representez M. Durand, proprietaire d'un local commercial loue a la SARL TECHNO PLUS. Le locataire n'a pas paye ses loyers depuis 3 mois (janvier, fevrier, mars 2026). Le bail prevoit un loyer mensuel de 2 800 euros HT.

Redigez la description a fournir a l'assistant IA pour generer la mise en demeure :
1. Les informations factuelles essentielles
2. Le fondement juridique (articles du Code civil et du Code de commerce)
3. Le ton souhaite (mesure ou ferme)
4. Les demandes precises (paiement, delai, consequences)
5. Les mentions a inclure imperativement (clause resolutoire du bail, interets de retard)

Puis identifiez 3 elements que vous devriez verifier dans le document genere avant envoi.`,
          xpReward: 20,
        },
        {
          id: 'avo-m2-l3',
          title: 'Quiz — Redaction juridique IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la redaction assistee.',
          quizQuestions: [
            {
              question: 'Quel est le role de l\'IA dans la redaction de conclusions ?',
              options: [
                'Remplacer l\'avocat completement',
                'Generer un premier jet structure a affiner',
                'Envoyer les conclusions directement au tribunal',
                'Corriger les fautes d\'orthographe uniquement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere un premier jet structure (faits, discussion, dispositif) que l\'avocat affine avec son expertise et sa connaissance du dossier.',
            },
            {
              question: 'Que verifie le controle qualite integre de l\'IA ?',
              options: [
                'Uniquement l\'orthographe',
                'La coherence interne, les references obsoletes et les clauses abusives',
                'Le prix des honoraires',
                'La mise en page uniquement',
              ],
              correctIndex: 1,
              explanation: 'Le controle qualite verifie la coherence (montants, dates, noms), signale les references obsoletes et alerte sur les clauses potentiellement abusives.',
            },
            {
              question: 'Pour quels types de contrats l\'IA propose-t-elle des clauses types ?',
              options: [
                'Uniquement les baux d\'habitation',
                'Tous types : baux commerciaux, statuts de societe, contrats commerciaux',
                'Uniquement les contrats de travail',
                'Aucun, les clauses doivent etre redigees manuellement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des clauses types pour tous types de contrats, adaptees au contexte specifique de chaque dossier.',
            },
            {
              question: 'L\'IA remplace-t-elle la responsabilite professionnelle de l\'avocat ?',
              options: [
                'Oui, l\'IA est responsable des erreurs',
                'Non, chaque document doit etre relu et valide par l\'avocat',
                'Oui, si l\'IA est certifiee',
                'Cela depend du type de document',
              ],
              correctIndex: 1,
              explanation: 'L\'IA est un assistant. La responsabilite professionnelle de l\'avocat reste entiere sur chaque document produit.',
            },
            {
              question: 'Quel avantage offre l\'IA pour les documents repetitifs (statuts, baux) ?',
              options: [
                'Elle copie des modeles d\'internet',
                'Elle genere des projets adaptes a la configuration specifique',
                'Elle evite de rediger ces documents',
                'Elle les sous-traite a un autre avocat',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere des projets adaptes a chaque configuration (nombre d\'associes, type de gouvernance, etc.) avec les clauses obligatoires et optionnelles pertinentes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DC}',
      badgeName: 'Redacteur Juridique',
    },

    // Module 3 — Gestion dossiers
    {
      id: 'avo-m3',
      title: 'Gestion de dossiers intelligente',
      emoji: '\u{1F4C1}',
      description: 'Organisez vos dossiers clients avec un suivi automatise et des alertes delais.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m3-l1',
          title: 'Organiser ses dossiers avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Un cabinet d\'avocat gere des dizaines, parfois des centaines de dossiers simultanement. Chaque dossier a ses echeances, ses pieces, ses interlocuteurs et son historique. Perdre le fil d\'un seul dossier peut avoir des consequences dramatiques : prescription, forclusion, radiation. L\'IA de Freenzy centralise et securise votre gestion de dossiers. \u{1F4C1}

Chaque dossier est structure automatiquement : identite du client, nature de l\'affaire, juridiction, adversaire et son conseil, timeline des echeances, pieces du dossier, historique des actes et diligences, temps passe et honoraires. L\'IA cree cette structure des l\'ouverture du dossier a partir des informations que vous fournissez.

Les alertes de delais sont le filet de securite le plus precieux. L\'IA calcule automatiquement les delais de procedure : delai d\'appel (1 mois), delai de pourvoi (2 mois), delai de prescription (variable selon la matiere), delais de signification. Vous recevez des alertes a J-30, J-15, J-7 et J-3 avant chaque echeance. Plus jamais de delai manque ! \u{23F0}

Le suivi des echanges est automatise. Chaque email, courrier ou appel lie au dossier est archive chronologiquement. L\'IA genere un resume de l\'echange et l\'ajoute a la timeline du dossier. Quand vous rouvrez un dossier apres plusieurs semaines, vous retrouvez instantanement le fil complet de l\'affaire.

La preparation des audiences est facilitee. Avant chaque date d\'audience, l\'IA genere un memo de preparation : rappel des faits, etat de la procedure, points a plaider, pieces a apporter, questions a anticiper de la part du juge. Ce memo vous fait gagner un temps precieux de preparation.

Le tableau de bord global vous donne une vue d\'ensemble de tous vos dossiers : ceux qui avancent bien, ceux qui necessitent une action urgente, ceux qui sont en attente. L\'IA identifie les dossiers dormants (aucune action depuis plus de 30 jours) et vous alerte : "Le dossier Dupont c/ SCI Les Acacias n\'a pas eu d\'activite depuis 45 jours. Action requise ?"

L\'archivage des dossiers clos est automatique. L\'IA genere un sommaire du dossier avec les pieces cles, la decision obtenue et les eventuelles suites a surveiller (delais de voies de recours). Le dossier est archive mais reste consultable a tout moment. \u{1F5C4}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'avo-m3-l2',
          title: 'Jeu : Les delais de procedure',
          duration: '3 min',
          type: 'game',
          content: 'Associez les delais aux voies de recours.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque voie de recours a son delai legal',
            pairs: [
              { left: 'Appel civil', right: '1 mois a compter de la signification' },
              { left: 'Pourvoi en cassation', right: '2 mois a compter de la signification' },
              { left: 'Opposition', right: '1 mois a compter de la signification' },
              { left: 'Recours en revision', right: '2 mois a compter de la decouverte' },
              { left: 'Tierce opposition', right: '30 ans (prescription de droit commun)' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'avo-m3-l3',
          title: 'Quiz — Gestion dossiers',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la gestion de dossiers IA.',
          quizQuestions: [
            {
              question: 'A quels moments l\'IA envoie-t-elle des alertes de delais ?',
              options: [
                'Uniquement le jour de l\'echeance',
                'A J-30, J-15, J-7 et J-3 avant l\'echeance',
                'Une seule fois, un mois avant',
                'Elle n\'envoie pas d\'alertes',
              ],
              correctIndex: 1,
              explanation: 'L\'IA envoie des alertes graduelles a J-30, J-15, J-7 et J-3 pour que vous ne manquiez jamais un delai de procedure.',
            },
            {
              question: 'Que genere l\'IA avant chaque audience ?',
              options: [
                'Un brouillon de plaidoirie',
                'Un memo de preparation (faits, procedure, points a plaider, pieces)',
                'Une demande de renvoi',
                'Un courrier a l\'adversaire',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere un memo de preparation incluant le rappel des faits, l\'etat de la procedure, les points a plaider et les pieces a apporter.',
            },
            {
              question: 'Qu\'est-ce qu\'un dossier dormant selon l\'IA ?',
              options: [
                'Un dossier archive',
                'Un dossier sans activite depuis plus de 30 jours',
                'Un dossier perdu',
                'Un dossier non paye',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie comme dormant tout dossier n\'ayant eu aucune activite depuis plus de 30 jours et vous alerte pour action.',
            },
            {
              question: 'Que contient l\'archivage d\'un dossier clos ?',
              options: [
                'Rien, le dossier est simplement supprime',
                'Un sommaire avec pieces cles, decision et suites a surveiller',
                'Uniquement la facture',
                'Les coordonnees du client',
              ],
              correctIndex: 1,
              explanation: 'L\'archivage inclut un sommaire complet, les pieces cles, la decision obtenue et les eventuels delais de voies de recours a surveiller.',
            },
            {
              question: 'Comment l\'IA archive-t-elle les echanges lies a un dossier ?',
              options: [
                'Elle ne les archive pas',
                'Elle genere un resume et l\'ajoute chronologiquement a la timeline',
                'Elle les imprime et les classe',
                'Elle les envoie par email au client',
              ],
              correctIndex: 1,
              explanation: 'Chaque echange (email, courrier, appel) est resume par l\'IA et ajoute chronologiquement a la timeline du dossier.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C1}',
      badgeName: 'Gestionnaire Dossiers',
    },

    // Module 4 — Facturation horaire
    {
      id: 'avo-m4',
      title: 'Facturation horaire automatisee',
      emoji: '\u{23F1}\u{FE0F}',
      description: 'Suivez votre temps et facturez vos honoraires sans effort.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m4-l1',
          title: 'Time tracking et facturation avocat',
          duration: '4 min',
          type: 'text',
          content: `La facturation horaire est le modele dominant en cabinet d\'avocat. Mais saisir ses temps est une corvee que beaucoup d\'avocats repoussent, ce qui entraine des oublis et une sous-facturation chronique. Des etudes montrent que les avocats perdent en moyenne 15% de leur temps facturable par oubli de saisie. L\'IA de Freenzy resout ce probleme. \u{23F1}\u{FE0F}

Le time tracking est semi-automatique. Quand vous travaillez sur un dossier dans Freenzy (recherche, redaction, email), le temps est enregistre automatiquement. Pour les taches hors plateforme (audience, rendez-vous, telephone), vous les saisissez en un clic avec une description en langage naturel : "1h30 audience TGI dossier Dupont" — l\'IA categorise, affecte au bon dossier et calcule le montant.

La granularite est configurable : par 6 minutes (standard barreau), par 15 minutes ou a la minute exacte. L\'IA arrondit automatiquement selon votre parametre. Elle detecte aussi les temps anormalement courts ou longs et vous demande confirmation : "Vous avez enregistre 8h de recherche sur le dossier Martin. Souhaitez-vous confirmer ou ajuster ?" \u{1F4CA}

La generation des factures d\'honoraires est automatique. L\'IA compile tous les temps saisis pour un dossier, les organise par categorie de diligences (recherche, redaction, audience, reunion, telephone) et genere une note d\'honoraires detaillee. Le client voit exactement pour quoi il paie — transparence qui reduit les contestations.

Le suivi de la rentabilite par dossier est eclairant. L\'IA compare le temps reel passe avec l\'estimation initiale et le montant des honoraires percus. Vous identifiez rapidement les dossiers deficitaires ou vous passez trop de temps par rapport aux honoraires convenus. Cette information est precieuse pour mieux chiffrer vos futurs dossiers.

Les conventions d\'honoraires sont generees automatiquement. L\'IA produit une convention conforme aux exigences deontologiques avec le taux horaire, l\'estimation du cout total, les modalites de reglement et la provision initiale. Le client signe electroniquement et la convention est archivee.

Le suivi des provisions et des paiements est automatise. L\'IA vous alerte quand une provision est epuisee : "La provision du dossier Durand (3 000 euros) est consommee a 90%. Demandez un complement de provision avant de poursuivre les diligences." \u{1F4B0}`,
          xpReward: 15,
        },
        {
          id: 'avo-m4-l2',
          title: 'Exercice : Generer une note d\'honoraires',
          duration: '3 min',
          type: 'exercise',
          content: 'Compilez les temps et generez une note d\'honoraires.',
          exercisePrompt: `Vous etes avocat en droit des societes, taux horaire 250 euros HT. Voici les diligences effectuees sur le dossier "Creation SAS INNOV TECH" ce mois :

- 12/03 : Rendez-vous client initial (1h30)
- 13/03 : Recherche specifites SAS (45min)
- 14/03 : Redaction statuts SAS (3h)
- 15/03 : Echanges email client - ajustements gouvernance (30min)
- 18/03 : Redaction pacte d'associes (2h)
- 19/03 : Relecture et corrections finales (1h)
- 20/03 : Envoi documents + appel notaire (20min)

Questions :
1. Calculez le temps total (arrondi aux 6 minutes pres)
2. Calculez le montant HT et TTC (TVA 20%)
3. Redigez la note d'honoraires detaillee par categorie de diligences
4. La provision initiale etait de 2 000 euros. Quel solde reste-t-il a facturer ?`,
          xpReward: 20,
        },
        {
          id: 'avo-m4-l3',
          title: 'Quiz — Facturation avocat',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la facturation horaire IA.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de temps facturable les avocats perdent-ils en moyenne par oubli de saisie ?',
              options: ['5%', '10%', '15%', '25%'],
              correctIndex: 2,
              explanation: 'Les etudes montrent que les avocats perdent en moyenne 15% de leur temps facturable par oubli de saisie des temps.',
            },
            {
              question: 'Quelle est la granularite standard de facturation au barreau ?',
              options: ['A la minute', 'Par 6 minutes', 'Par 15 minutes', 'Par heure'],
              correctIndex: 1,
              explanation: 'La granularite standard au barreau est de 6 minutes (un dixieme d\'heure), soit la plus petite unite de facturation courante.',
            },
            {
              question: 'Que detecte l\'IA dans les saisies de temps ?',
              options: [
                'Rien de special',
                'Les temps anormalement courts ou longs pour confirmation',
                'Les fautes d\'orthographe',
                'La productivite de l\'avocat',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les saisies anormales (trop courtes ou trop longues) et demande confirmation pour eviter les erreurs.',
            },
            {
              question: 'Que fait l\'IA quand une provision est presque epuisee ?',
              options: [
                'Elle arrete de travailler',
                'Elle alerte l\'avocat pour demander un complement',
                'Elle facture le client automatiquement',
                'Elle ignore la provision',
              ],
              correctIndex: 1,
              explanation: 'L\'IA alerte l\'avocat quand la provision est consommee a 90% pour qu\'il demande un complement avant de poursuivre les diligences.',
            },
            {
              question: 'Pourquoi le detail des diligences reduit-il les contestations ?',
              options: [
                'Parce que le client a peur de contester',
                'Parce que le client voit exactement pour quoi il paie (transparence)',
                'Parce que les montants sont plus faibles',
                'Parce que l\'IA ne fait pas d\'erreur',
              ],
              correctIndex: 1,
              explanation: 'La transparence du detail des diligences permet au client de comprendre la valeur du travail effectue, reduisant les contestations.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{23F1}\u{FE0F}',
      badgeName: 'Time Tracker Pro',
    },

    // Module 5 — Veille juridique
    {
      id: 'avo-m5',
      title: 'Veille juridique automatisee',
      emoji: '\u{1F4F0}',
      description: 'Restez informe des evolutions legislatives et jurisprudentielles en continu.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m5-l1',
          title: 'Une veille juridique permanente',
          duration: '4 min',
          type: 'text',
          content: `Le droit evolue en permanence : nouvelles lois, decrets d\'application, jurisprudence, circulaires. Un avocat doit rester a jour dans ses domaines de competence pour conseiller au mieux ses clients. Mais lire le Journal Officiel, les bulletins des cours d\'appel et la doctrine prend un temps considerable. L\'IA de Freenzy assure votre veille juridique en continu. \u{1F4F0}

Vous configurez vos domaines d\'interet : droit du travail, droit des societes, droit immobilier, droit penal, propriete intellectuelle — l\'IA surveille les sources pertinentes pour chaque domaine. Quand un texte important est publie ou qu\'une decision significative est rendue, vous recevez un resume synthetique dans votre fil d\'actualites.

Le resume n\'est pas un simple copier-coller. L\'IA analyse l\'impact concret du texte sur votre pratique : "Le decret du 15 mars 2026 modifie les seuils de competence du tribunal de commerce. Impact pour votre cabinet : les litiges commerciaux de moins de 15 000 euros relevent desormais du tribunal judiciaire. 3 de vos dossiers en cours sont potentiellement concernes." C\'est de l\'information actionnable. \u{1F4A1}

La veille jurisprudentielle est particulierement precieuse. L\'IA detecte les arrets qui pourraient impacter vos dossiers en cours. "La Cour de cassation vient de juger que la clause de non-concurrence sans contrepartie financiere est nulle (Cass. soc., 10 mars 2026, n°24-12.345). Votre dossier Martin c/ SAS Tech contient une clause similaire — a verifier."

Le systeme de veille alimente aussi votre strategie de communication. L\'IA vous propose des sujets d\'articles pour votre blog ou votre newsletter : "L\'arret du 10 mars sur la non-concurrence pourrait interesser vos clients RH. Souhaitez-vous que je redige un bref commentaire d\'arret pour votre newsletter ?" Votre visibilite professionnelle s\'en trouve renforcee.

Les alertes sont configurables par priorite. Les textes touchant directement vos dossiers en cours sont en alerte haute. Les evolutions generales de vos domaines sont en alerte normale. Et les textes de domaines connexes sont en veille basse — vous les consultez quand vous avez le temps.

L\'IA constitue aussi une base de connaissances personnalisee. Au fil du temps, elle comprend vos specialites, vos clients types et vos problematiques recurrentes. Sa veille devient de plus en plus pertinente et ciblee. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'avo-m5-l2',
          title: 'Jeu : Classer les sources juridiques',
          duration: '3 min',
          type: 'game',
          content: 'Classez les sources juridiques par hierarchie des normes.',
          gameType: 'ordering',
          gameData: {
            instruction: 'Classez ces sources juridiques de la plus haute autorite a la plus basse dans la hierarchie des normes',
            items: [
              'Constitution et bloc de constitutionnalite',
              'Traites et droit de l\'Union europeenne',
              'Lois organiques et ordinaires',
              'Ordonnances ratifiees',
              'Decrets et arretes',
              'Jurisprudence et circulaires',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          xpReward: 20,
        },
        {
          id: 'avo-m5-l3',
          title: 'Quiz — Veille juridique',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la veille juridique IA.',
          quizQuestions: [
            {
              question: 'Que fait l\'IA quand une decision impacte un de vos dossiers en cours ?',
              options: [
                'Elle ne fait rien',
                'Elle vous alerte specifiquement avec la reference du dossier concerne',
                'Elle modifie vos conclusions automatiquement',
                'Elle contacte le client directement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les decisions qui pourraient impacter vos dossiers en cours et vous alerte specifiquement avec la reference du dossier concerne.',
            },
            {
              question: 'Comment les alertes sont-elles classees ?',
              options: [
                'Par date uniquement',
                'Par priorite : haute (dossiers en cours), normale (domaines), basse (connexes)',
                'Par taille du texte',
                'Elles ne sont pas classees',
              ],
              correctIndex: 1,
              explanation: 'Les alertes sont classees en trois niveaux de priorite selon leur impact direct sur vos dossiers et vos domaines de competence.',
            },
            {
              question: 'Comment l\'IA aide-t-elle votre communication professionnelle ?',
              options: [
                'Elle publie sur vos reseaux sociaux sans votre accord',
                'Elle propose des sujets d\'articles pour votre newsletter',
                'Elle contacte les journalistes',
                'Elle ne s\'occupe pas de communication',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des sujets d\'articles et peut rediger des commentaires d\'arrets pour votre newsletter, renforçant votre visibilite professionnelle.',
            },
            {
              question: 'Qu\'est-ce qui rend la veille de plus en plus pertinente au fil du temps ?',
              options: [
                'Rien, elle reste identique',
                'L\'IA comprend progressivement vos specialites et problematiques recurrentes',
                'Elle copie la veille d\'autres avocats',
                'Elle elargit automatiquement vos domaines',
              ],
              correctIndex: 1,
              explanation: 'L\'IA constitue une base de connaissances personnalisee qui lui permet de cibler de mieux en mieux les informations pertinentes pour votre pratique.',
            },
            {
              question: 'Que contient un resume de veille IA ?',
              options: [
                'Le texte integral du Journal Officiel',
                'Un resume synthetique avec l\'impact concret sur votre pratique',
                'Juste le titre du texte',
                'Une traduction en anglais',
              ],
              correctIndex: 1,
              explanation: 'Chaque resume de veille inclut une synthese du texte ET son impact concret sur votre pratique avec les dossiers potentiellement concernes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4F0}',
      badgeName: 'Veilleur Juridique',
    },

    // Module 6 — Relation client
    {
      id: 'avo-m6',
      title: 'Relation client cabinet',
      emoji: '\u{1F91D}',
      description: 'Fidelisez vos clients et developpez votre cabinet grace a l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'avo-m6-l1',
          title: 'Developper sa clientele avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La relation client est un enjeu majeur pour les avocats. Attirer de nouveaux clients, les fideliser et obtenir des recommandations — tout cela demande du temps et une strategie. L\'IA de Freenzy automatise les taches repetitives et vous aide a vous concentrer sur l\'essentiel : le conseil juridique de qualite. \u{1F91D}

Le premier contact est critique. Quand un prospect vous contacte via votre site web ou par telephone, l\'IA genere un accuse de reception professionnel dans les minutes qui suivent : "Maitre [votre nom] a bien recu votre demande concernant [sujet]. Un premier rendez-vous vous sera propose sous 48 heures." Cette reactivite fait la difference quand le prospect contacte plusieurs avocats.

Le questionnaire de premier rendez-vous est genere automatiquement selon le domaine de droit. Pour un dossier de divorce, l\'IA envoie au client un formulaire prealable : date et lieu du mariage, regime matrimonial, enfants, patrimoine, revenus. Le client le remplit en ligne avant le rendez-vous. Vous gagnez 30 minutes de collecte d\'informations et le rendez-vous est immediatement productif. \u{1F4CB}

Apres chaque rendez-vous ou chaque etape significative du dossier, l\'IA envoie un compte-rendu synthetique au client : decisions prises, prochaines etapes, documents a fournir. Le client se sent informe et accompagne — c\'est la premiere source de satisfaction et de fidelisation.

Le systeme de recommandations est subtil. Quand un dossier se conclut favorablement, l\'IA envoie un message de remerciement et suggere delicatement : "Si vous etes satisfait de notre accompagnement, n\'hesitez pas a recommander notre cabinet a votre entourage. Le bouche-a-oreille reste la meilleure publicite pour un avocat."

L\'IA vous aide aussi a maintenir le lien avec vos anciens clients. Elle envoie des voeux de nouvel an, des informations juridiques personnalisees ("Nouvelle loi sur les baux d\'habitation — cela pourrait vous concerner en tant que proprietaire") et des rappels d\'echeances (fin de periode probatoire, renouvellement de bail). Ces attentions renforcent la fidelite et generent de nouveaux dossiers.

Le tableau de bord clientele vous montre vos sources de clients (recommandations, site web, annuaires), votre taux de conversion et la valeur moyenne par client. Vous ajustez votre strategie commerciale en consequence. \u{1F4C8}`,
          xpReward: 15,
        },
        {
          id: 'avo-m6-l2',
          title: 'Exercice : Parcours client complet',
          duration: '3 min',
          type: 'exercise',
          content: 'Definissez le parcours client automatise de votre cabinet.',
          exercisePrompt: `Vous etes avocat en droit du travail. Un salarie vous contacte car il pense etre victime de harcelement moral au travail.

Definissez le parcours client complet que l'IA doit automatiser :

1. Premier contact : redigez l'accuse de reception (3 lignes max)
2. Questionnaire prealable : listez les 8 questions essentielles a envoyer avant le RDV
3. Post-RDV : redigez le compte-rendu type avec les prochaines etapes
4. Suivi dossier : definissez les 4 moments cles ou un message automatique doit etre envoye
5. Cloture : redigez le message de fin de dossier (issue favorable) avec demande de recommandation

Pour chaque etape, precisez le canal (email, SMS, appel) et le delai.`,
          xpReward: 20,
        },
        {
          id: 'avo-m6-l3',
          title: 'Quiz — Relation client avocat',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la relation client cabinet.',
          quizQuestions: [
            {
              question: 'Combien de temps le questionnaire prealable fait-il gagner en rendez-vous ?',
              options: ['5 minutes', '15 minutes', '30 minutes', '1 heure'],
              correctIndex: 2,
              explanation: 'Le questionnaire rempli en ligne avant le rendez-vous fait gagner environ 30 minutes de collecte d\'informations, rendant le rendez-vous immediatement productif.',
            },
            {
              question: 'Quelle est la premiere source de satisfaction client pour un avocat ?',
              options: [
                'Les honoraires bas',
                'Se sentir informe et accompagne a chaque etape',
                'Gagner le proces a coup sur',
                'La decoration du cabinet',
              ],
              correctIndex: 1,
              explanation: 'Un client informe des avancees et des prochaines etapes se sent accompagne, ce qui est la premiere source de satisfaction et de fidelisation.',
            },
            {
              question: 'Comment l\'IA maintient-elle le lien avec les anciens clients ?',
              options: [
                'Elle les appelle tous les jours',
                'Elle envoie des voeux, des infos juridiques personnalisees et des rappels',
                'Elle leur propose des reductions',
                'Elle ne maintient pas de lien',
              ],
              correctIndex: 1,
              explanation: 'L\'IA maintient le lien via des voeux, des informations juridiques personnalisees et des rappels d\'echeances pour generer de nouveaux dossiers.',
            },
            {
              question: 'Quelle information le tableau de bord clientele fournit-il ?',
              options: [
                'Uniquement le nombre de clients',
                'Sources de clients, taux de conversion et valeur moyenne par client',
                'Le classement des meilleurs avocats',
                'Les tarifs des concurrents',
              ],
              correctIndex: 1,
              explanation: 'Le tableau de bord montre les sources d\'acquisition, le taux de conversion des prospects et la valeur moyenne par client pour ajuster votre strategie.',
            },
            {
              question: 'Pourquoi la reactivite au premier contact est-elle cruciale ?',
              options: [
                'Ce n\'est pas important',
                'Parce que le prospect contacte souvent plusieurs avocats simultanement',
                'Pour facturer plus vite',
                'Pour respecter un delai legal',
              ],
              correctIndex: 1,
              explanation: 'Les prospects contactent generalement plusieurs avocats. La reactivite (reponse en quelques minutes) vous demarque et augmente vos chances d\'etre choisi.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Developpeur Cabinet',
    },
  ],
};

// =============================================================================
// 4. NOTAIRE IA
// =============================================================================

export const parcoursNotaireIA: FormationParcours = {
  id: 'notaire-ia',
  title: 'IA pour les Notaires',
  emoji: '\u{1F3DB}\u{FE0F}',
  description: 'Modernisez votre etude notariale avec l\'IA : actes notaries, due diligence immobiliere, gestion patrimoniale, conformite, archivage et relation client.',
  category: 'metier',
  subcategory: 'notariat',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#059669',
  diplomaTitle: 'Notaire Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Notaires',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Actes notaries
    {
      id: 'not-m1',
      title: 'Redaction d\'actes assistee',
      emoji: '\u{1F4DC}',
      description: 'Accelerez la redaction de vos actes notaries tout en garantissant leur qualite.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m1-l1',
          title: 'L\'IA au service de la redaction d\'actes',
          duration: '4 min',
          type: 'text',
          content: `La redaction d\'actes notaries exige une precision absolue : chaque mot a une portee juridique, chaque clause engage les parties pour des decennies. Le notaire ne peut se permettre aucune erreur ni omission. L\'IA de Freenzy n\'ecrit pas vos actes a votre place — elle vous assiste pour les rediger plus vite et avec plus de securite. \u{1F4DC}

Pour un acte de vente immobiliere, l\'IA genere une trame complete a partir des elements que vous fournissez : identite des parties, designation du bien (references cadastrales, superficie, servitudes), prix et modalites de paiement, conditions suspensives. La trame respecte la structure standard et inclut les clauses obligatoires que vous adaptez ensuite.

Le systeme de verification est precieux. L\'IA detecte les incoherences internes : une superficie qui ne correspond pas au cadastre, un prix au m2 anormalement eleve ou bas pour le secteur, des references cadastrales incompletes, une servitude mentionnee dans l\'etat hypothecaire mais absente de l\'acte. Chaque alerte est une erreur potentielle evitee. \u{26A0}\u{FE0F}

Les clauses types sont proposees selon le contexte. Pour un bien en copropriete, l\'IA inclut automatiquement les references au reglement de copropriete, au carnet d\'entretien, aux proces-verbaux d\'AG et au diagnostic technique global. Pour un terrain a batir, elle ajoute les references au PLU, au permis de construire et aux normes d\'assainissement.

La personnalisation est poussee. L\'IA s\'adapte aux usages de votre etude : formulations preferees, structure des actes, clauses specifiques que vous inserez systematiquement. Au fil du temps, les trames generees correspondent de plus en plus a votre style de redaction.

Le gain de temps est significatif : la ou la redaction d\'un acte de vente standard prend 3 a 4 heures, la trame IA vous permet de le finaliser en 1h30. Sur un mois avec 15 actes de vente, c\'est plus de 35 heures economisees — pres d\'une semaine complete de travail ! \u{1F4AA}

L\'IA gere aussi les actes moins courants : donation-partage, SCI, viager, VEFA. Pour ces actes complexes, elle propose des check-lists de points de vigilance specifiques et vous alerte sur les pieges classiques.`,
          xpReward: 15,
        },
        {
          id: 'not-m1-l2',
          title: 'Exercice : Preparer un acte de vente',
          duration: '3 min',
          type: 'exercise',
          content: 'Rassemblez les elements pour generer une trame d\'acte.',
          exercisePrompt: `Vous etes notaire et vous preparez un acte de vente pour un appartement en copropriete :

Vendeur : M. et Mme BERNARD, maries sous le regime de la communaute legale
Acquereur : Mlle PETIT (celibataire, primo-accedante, PTZ)
Bien : Appartement T3, 68m2 Carrez, 2eme etage, copropriete de 24 lots, parking en sous-sol
Prix : 285 000 euros (dont 15 000 euros de mobilier)
Financement : PTZ 80 000 euros + pret bancaire 175 000 euros + apport 30 000 euros
Conditions suspensives : obtention du pret sous 45 jours

Redigez les elements a fournir a l'IA pour generer la trame, en incluant :
1. Les verifications prealables obligatoires (5 minimum)
2. Les documents a obtenir de la copropriete
3. Les diagnostics obligatoires a annexer
4. Les clauses specifiques au PTZ
5. Un point de vigilance lie au mobilier dans le prix`,
          xpReward: 20,
        },
        {
          id: 'not-m1-l3',
          title: 'Quiz — Redaction actes notaries',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la redaction assistee.',
          quizQuestions: [
            {
              question: 'Quel gain de temps la trame IA apporte-t-elle pour un acte de vente standard ?',
              options: ['30 minutes', '1 heure', '2 a 2h30', '4 heures'],
              correctIndex: 2,
              explanation: 'La redaction passe de 3-4 heures a environ 1h30, soit un gain de 2 a 2h30 par acte.',
            },
            {
              question: 'Que detecte le systeme de verification de l\'IA ?',
              options: [
                'Uniquement les fautes d\'orthographe',
                'Les incoherences : superficie, prix, references cadastrales, servitudes',
                'La signature des parties',
                'Le taux d\'interet du pret',
              ],
              correctIndex: 1,
              explanation: 'Le systeme detecte les incoherences internes : superficie vs cadastre, prix au m2 anormal, references incompletes, servitudes manquantes.',
            },
            {
              question: 'Comment l\'IA s\'adapte-t-elle aux usages de votre etude ?',
              options: [
                'Elle ne s\'adapte pas',
                'Elle memorise vos formulations, structures et clauses preferees',
                'Elle copie les actes d\'autres etudes',
                'Elle impose un format unique',
              ],
              correctIndex: 1,
              explanation: 'L\'IA s\'adapte a vos preferences redactionnelles au fil du temps pour generer des trames de plus en plus conformes a votre style.',
            },
            {
              question: 'Pour quels actes complexes l\'IA propose-t-elle des check-lists specifiques ?',
              options: [
                'Uniquement les ventes simples',
                'Donation-partage, SCI, viager, VEFA',
                'Uniquement les baux',
                'Les testaments uniquement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA gere les actes complexes (donation-partage, SCI, viager, VEFA) avec des check-lists de points de vigilance specifiques.',
            },
            {
              question: 'Quelles clauses l\'IA inclut-elle automatiquement pour un bien en copropriete ?',
              options: [
                'Aucune clause specifique',
                'Reglement de copropriete, carnet d\'entretien, PV d\'AG, DTG',
                'Uniquement le prix',
                'Les coordonnees du syndic',
              ],
              correctIndex: 1,
              explanation: 'Pour un bien en copropriete, l\'IA inclut les references au reglement, au carnet d\'entretien, aux PV d\'AG et au diagnostic technique global.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DC}',
      badgeName: 'Redacteur d\'Actes',
    },

    // Module 2 — Due diligence
    {
      id: 'not-m2',
      title: 'Due diligence immobiliere',
      emoji: '\u{1F50E}',
      description: 'Securisez vos transactions avec une verification complete assistee par IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m2-l1',
          title: 'La due diligence augmentee par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La due diligence est l\'etape la plus critique d\'une transaction immobiliere. Verifier la propriete, les servitudes, les hypotheques, l\'urbanisme, les diagnostics, la situation fiscale — un oubli peut engager votre responsabilite professionnelle. L\'IA de Freenzy systematise ces verifications pour ne rien laisser au hasard. \u{1F50E}

Le processus demarre des l\'ouverture du dossier. L\'IA genere une check-list de due diligence adaptee au type de bien (appartement, maison, terrain, local commercial, immeuble). Pour un appartement en copropriete, la liste comprend une trentaine de points de verification, de l\'etat hypothecaire aux charges de copropriete impayees.

La verification de l\'etat hypothecaire est assistee. L\'IA analyse les inscriptions et vous alerte sur les situations a risque : hypotheque non levee, privilege du preteur de deniers, saisie en cours, inscription provisoire de nantissement. Pour chaque alerte, elle vous indique la demarche a suivre : mainlevee a obtenir, attestation de solde, etc. \u{26A0}\u{FE0F}

L\'analyse urbanistique est automatisee. L\'IA verifie le zonage PLU, les servitudes d\'utilite publique, les alignements, les prescriptions architecturales (secteur ABF), les risques naturels (PPRN) et technologiques (PPRT). Pour un terrain a batir, elle synthetise les regles de constructibilite : CES, hauteur maximale, reculs, emprises au sol.

Les diagnostics immobiliers sont controles : l\'IA verifie la validite de chaque diagnostic (DPE, amiante, plomb, electricite, gaz, termites, ERP). Elle vous alerte si un diagnostic est expire ou manquant : "Le DPE date de 2015 — il doit etre refait (validite 10 ans, sauf si note F ou G : validite reduite a fin 2024)."

La situation de copropriete est analysee en profondeur : les 3 derniers PV d\'AG sont scanes pour les decisions votees, les travaux prevus, les litiges en cours. L\'IA vous signale les elements a porter a la connaissance de l\'acquereur : ravalement vote, procedure contre un coproprietaire, fonds travaux insuffisant.

Le rapport de due diligence final est un document structure que vous archivez dans le dossier. Il constitue la preuve de votre diligence en cas de mise en cause de votre responsabilite. \u{1F6E1}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'not-m2-l2',
          title: 'Jeu : Check-list due diligence',
          duration: '3 min',
          type: 'game',
          content: 'Associez les verifications aux categories de due diligence.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque verification a la categorie de due diligence correspondante',
            pairs: [
              { left: 'Etat hypothecaire', right: 'Verification de la propriete' },
              { left: 'Zonage PLU et COS', right: 'Analyse urbanistique' },
              { left: 'DPE et amiante', right: 'Diagnostics immobiliers' },
              { left: 'PV d\'AG et travaux votes', right: 'Situation de copropriete' },
              { left: 'Taxe fonciere et charges', right: 'Situation fiscale' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'not-m2-l3',
          title: 'Quiz — Due diligence',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la due diligence IA.',
          quizQuestions: [
            {
              question: 'Combien de points de verification l\'IA genere-t-elle pour un appartement en copropriete ?',
              options: ['5 points', '10 points', 'Une trentaine de points', '100 points'],
              correctIndex: 2,
              explanation: 'La check-list de due diligence pour un appartement en copropriete comprend une trentaine de points de verification.',
            },
            {
              question: 'Que verifie l\'IA dans l\'etat hypothecaire ?',
              options: [
                'Le prix de vente',
                'Les inscriptions a risque : hypotheque non levee, privilege, saisie',
                'La couleur du bien',
                'L\'annee de construction',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les inscriptions et alerte sur les situations a risque : hypotheques non levees, privileges, saisies, nantissements.',
            },
            {
              question: 'Quelle est la validite d\'un DPE standard ?',
              options: ['5 ans', '10 ans', '15 ans', 'Illimitee'],
              correctIndex: 1,
              explanation: 'Un DPE a une validite de 10 ans, sauf pour les notes F ou G dont la validite a ete reduite.',
            },
            {
              question: 'Pourquoi l\'IA analyse-t-elle les PV d\'AG de la copropriete ?',
              options: [
                'Par curiosite',
                'Pour identifier travaux votes, litiges et decisions a communiquer a l\'acquereur',
                'Pour evaluer le prix de vente',
                'Pour contacter le syndic',
              ],
              correctIndex: 1,
              explanation: 'Les PV d\'AG revelent les travaux votes, les litiges en cours et les decisions importantes a porter a la connaissance de l\'acquereur.',
            },
            {
              question: 'A quoi sert le rapport de due diligence final ?',
              options: [
                'A rien de special',
                'A prouver votre diligence en cas de mise en cause de responsabilite',
                'A negocier le prix',
                'A impressionner le client',
              ],
              correctIndex: 1,
              explanation: 'Le rapport de due diligence constitue la preuve documentee de votre diligence professionnelle en cas de mise en cause.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F50E}',
      badgeName: 'Expert Due Diligence',
    },

    // Module 3 — Gestion patrimoine
    {
      id: 'not-m3',
      title: 'Gestion patrimoniale assistee',
      emoji: '\u{1F3E0}',
      description: 'Conseillez vos clients en matiere patrimoniale avec des simulations IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m3-l1',
          title: 'Simulations patrimoniales avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le conseil patrimonial est une activite a forte valeur ajoutee pour les notaires. Mais les simulations complexes — droits de succession, plus-values, IFI, donation-partage — prennent un temps considerable. L\'IA de Freenzy accelere ces calculs et vous permet de presenter des scenarios clairs a vos clients. \u{1F3E0}

Pour une succession, l\'IA calcule instantanement les droits en fonction de la devolution legale ou testamentaire : actif net taxable, abattements applicables par heritier, bareme progressif, reduction pour charges de famille. Elle compare les scenarios : avec ou sans donation anterieure, avec ou sans demembrement, avec ou sans assurance-vie. Le client visualise l\'impact fiscal de chaque option. \u{1F4CA}

Les simulations de donation sont particulierement utiles. L\'IA calcule les droits pour differents montages : donation simple, donation-partage, donation avec reserve d\'usufruit, donation temporaire d\'usufruit. Elle tient compte des abattements reconstitues (15 ans) et des donations anterieures pour calculer le rapport fiscal. Le client comprend immediatement l\'interet d\'anticiper sa transmission.

Pour l\'IFI (Impot sur la Fortune Immobiliere), l\'IA evalue le patrimoine immobilier net taxable : biens detenus en direct, parts de SCI, usufruit, nue-propriete. Elle applique les decotes admises (residence principale 30%, bien loue 10-20%) et calcule l\'impot du. Elle simule aussi l\'impact d\'une reorganisation patrimoniale : creation de SCI, demembrement, cession.

Le conseil en regime matrimonial est facilite. L\'IA compare les consequences d\'un changement de regime : communaute legale vs separation de biens vs participation aux acquets. Pour chaque regime, elle simule les consequences en cas de divorce et en cas de deces. Le client prend une decision eclairee.

Les tableaux de synthese generes par l\'IA sont clairs et visuels. Chaque scenario est presente avec ses avantages et ses inconvenients, son cout fiscal et ses contraintes juridiques. Vous les presentez au client lors du rendez-vous de conseil — votre professionnalisme est renforce.

L\'IA maintient aussi un dossier patrimonial par client avec l\'historique de tous les actes passes a l\'etude et les simulations realisees. Ce dossier est la base d\'un suivi patrimonial dans la duree. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'not-m3-l2',
          title: 'Exercice : Simulation successorale',
          duration: '3 min',
          type: 'exercise',
          content: 'Realisez une simulation de droits de succession.',
          exercisePrompt: `Un client veuf de 72 ans vous consulte pour anticiper sa succession. Il a 3 enfants.

Patrimoine :
- Residence principale : valeur 450 000 euros
- Appartement locatif : 220 000 euros (credit restant 80 000 euros)
- Comptes bancaires et placements : 150 000 euros
- Assurance-vie souscrite il y a 12 ans : 200 000 euros (beneficiaires : les 3 enfants a parts egales)

Questions a traiter avec l'IA :
1. Calculez l'actif net taxable de la succession (hors assurance-vie)
2. Calculez les droits de succession par enfant sans optimisation
3. Proposez 2 strategies d'optimisation (donation, demembrement, etc.)
4. Simulez l'economie fiscale de chaque strategie
5. Identifiez les risques ou contraintes de chaque strategie`,
          xpReward: 20,
        },
        {
          id: 'not-m3-l3',
          title: 'Quiz — Gestion patrimoniale',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en gestion patrimoniale IA.',
          quizQuestions: [
            {
              question: 'Quelle decote s\'applique a la residence principale pour l\'IFI ?',
              options: ['10%', '20%', '30%', '50%'],
              correctIndex: 2,
              explanation: 'La residence principale beneficie d\'une decote de 30% pour le calcul de l\'IFI.',
            },
            {
              question: 'Tous les combien les abattements de donation sont-ils reconstitues ?',
              options: ['5 ans', '10 ans', '15 ans', '20 ans'],
              correctIndex: 2,
              explanation: 'Les abattements de donation sont reconstitues tous les 15 ans, ce qui permet de planifier des donations successives.',
            },
            {
              question: 'Que compare l\'IA pour une simulation de succession ?',
              options: [
                'Uniquement le montant total des droits',
                'Les scenarios avec/sans donation, demembrement, assurance-vie',
                'Les prix de l\'immobilier',
                'Les taux d\'interet bancaires',
              ],
              correctIndex: 1,
              explanation: 'L\'IA compare differents scenarios (avec/sans donation anterieure, demembrement, assurance-vie) pour identifier la strategie fiscalement optimale.',
            },
            {
              question: 'Quel est l\'avantage d\'un dossier patrimonial par client ?',
              options: [
                'Aucun avantage particulier',
                'Assurer un suivi patrimonial dans la duree avec historique complet',
                'Vendre des produits financiers',
                'Eviter les rendez-vous',
              ],
              correctIndex: 1,
              explanation: 'Le dossier patrimonial centralise l\'historique des actes et simulations, permettant un conseil evolutif et personnalise dans la duree.',
            },
            {
              question: 'Comment l\'IA presente-t-elle les scenarios au client ?',
              options: [
                'En texte brut uniquement',
                'Avec des tableaux de synthese visuels (avantages, inconvenients, cout fiscal)',
                'Par telephone',
                'Elle ne les presente pas, c\'est au notaire',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere des tableaux de synthese clairs avec avantages, inconvenients, cout fiscal et contraintes juridiques pour chaque scenario.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3E0}',
      badgeName: 'Conseiller Patrimonial',
    },

    // Module 4 — Conformite
    {
      id: 'not-m4',
      title: 'Conformite et obligations legales',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Restez conforme aux obligations reglementaires avec les alertes IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m4-l1',
          title: 'L\'IA pour la conformite notariale',
          duration: '4 min',
          type: 'text',
          content: `Les notaires sont soumis a des obligations reglementaires lourdes : lutte anti-blanchiment (LCB-FT), protection des donnees (RGPD), obligations declaratives (Tracfin, fichier immobilier), regles deontologiques. Un manquement peut entrainer des sanctions disciplinaires et penales. L\'IA de Freenzy vous aide a rester en conformite permanente. \u{1F6E1}\u{FE0F}

L\'obligation de vigilance LCB-FT est la plus sensible. Pour chaque client et chaque operation, l\'IA vous guide dans la verification d\'identite, l\'analyse du profil de risque et la detection des operations suspectes. Elle genere une fiche de vigilance structuree : identite verifiee, beneficiaire effectif identifie, source des fonds documentee, coherence de l\'operation avec le profil du client.

Les alertes anti-blanchiment sont automatiques. L\'IA detecte les indicateurs de risque : operation en especes au-dela des seuils, prix manifestement deconnecte de la valeur du bien, interposition de societes ecrans, client PPE (Personne Politiquement Exposee), pays a risque. Chaque alerte est documentee dans un registre interne que vous conservez pendant 5 ans. \u{26A0}\u{FE0F}

La declaration de soupcon a Tracfin est facilitee. Si vous decidez de declarer, l\'IA vous aide a structurer votre declaration : elements d\'identification, description de l\'operation suspecte, motifs du soupcon, pieces jointes. La declaration reste bien entendu votre decision et votre responsabilite professionnelle.

La conformite RGPD est integree dans les processus. L\'IA verifie que les consentements sont recueillis, que les durees de conservation sont respectees, que les droits des clients (acces, rectification, effacement) sont traites dans les delais. Le registre des traitements est genere automatiquement.

Les obligations declaratives sont suivies : publication au fichier immobilier (dans les 2 mois de l\'acte), enregistrement fiscal, declaration d\'intention d\'aliener en zone de preemption, notifications au syndic de copropriete. L\'IA vous rappelle chaque echeance et vous alerte en cas de retard.

La veille reglementaire vous tient informe des evolutions : nouveau decret, instruction de la Chambre, recommandation du CSN. L\'IA resume l\'impact pratique pour votre etude et les actions a mener. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'not-m4-l2',
          title: 'Jeu : Indicateurs de vigilance LCB-FT',
          duration: '3 min',
          type: 'game',
          content: 'Identifiez les situations necessitant une vigilance renforcee.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque situation au niveau de vigilance LCB-FT requis',
            pairs: [
              { left: 'Client PPE (Personne Politiquement Exposee)', right: 'Vigilance renforcee obligatoire' },
              { left: 'Vente entre particuliers francais residant en France', right: 'Vigilance standard' },
              { left: 'Achat via societe immatriculee aux iles Vierges', right: 'Vigilance renforcee + declaration de soupcon eventuelle' },
              { left: 'Prix de vente tres inferieur au marche sans justification', right: 'Vigilance renforcee' },
              { left: 'Client regulier de l\'etude, profil connu', right: 'Vigilance simplifiee possible' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'not-m4-l3',
          title: 'Quiz — Conformite notariale',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la conformite.',
          quizQuestions: [
            {
              question: 'Combien de temps les registres LCB-FT doivent-ils etre conserves ?',
              options: ['1 an', '3 ans', '5 ans', '10 ans'],
              correctIndex: 2,
              explanation: 'Les registres de vigilance LCB-FT doivent etre conserves pendant 5 ans apres la fin de la relation d\'affaires ou de l\'operation.',
            },
            {
              question: 'Que doit contenir la fiche de vigilance generee par l\'IA ?',
              options: [
                'Uniquement le nom du client',
                'Identite, beneficiaire effectif, source des fonds, coherence de l\'operation',
                'Le montant de la transaction uniquement',
                'Les coordonnees bancaires',
              ],
              correctIndex: 1,
              explanation: 'La fiche de vigilance inclut l\'identite verifiee, le beneficiaire effectif, la source des fonds et la coherence de l\'operation avec le profil du client.',
            },
            {
              question: 'Dans quel delai un acte doit-il etre publie au fichier immobilier ?',
              options: ['15 jours', '1 mois', '2 mois', '6 mois'],
              correctIndex: 2,
              explanation: 'La publication au fichier immobilier doit etre effectuee dans les 2 mois suivant la signature de l\'acte.',
            },
            {
              question: 'Qui prend la decision de declarer a Tracfin ?',
              options: [
                'L\'IA automatiquement',
                'Le notaire, sous sa responsabilite professionnelle',
                'Le client',
                'La Chambre des notaires',
              ],
              correctIndex: 1,
              explanation: 'La declaration de soupcon est une decision personnelle du notaire. L\'IA facilite la redaction mais ne prend jamais cette decision.',
            },
            {
              question: 'Que verifie l\'IA pour la conformite RGPD ?',
              options: [
                'Rien, le RGPD ne concerne pas les notaires',
                'Consentements, durees de conservation, traitement des droits des clients',
                'Uniquement les mots de passe',
                'La taille des fichiers',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie les consentements recueillis, le respect des durees de conservation et le traitement des droits des clients dans les delais.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Expert Conformite',
    },

    // Module 5 — Archivage
    {
      id: 'not-m5',
      title: 'Archivage et gestion documentaire',
      emoji: '\u{1F5C4}\u{FE0F}',
      description: 'Organisez et retrouvez vos minutes et documents avec un archivage IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m5-l1',
          title: 'L\'archivage intelligent pour notaires',
          duration: '4 min',
          type: 'text',
          content: `Le minutier d\'un notaire est un tresor documentaire qui s\'accumule sur des decennies. Retrouver un acte de 1998, une procuration de 2005 ou un contrat de mariage de 2010 peut prendre des heures dans des archives physiques mal organisees. L\'IA de Freenzy revolutionne votre archivage et votre gestion documentaire. \u{1F5C4}\u{FE0F}

Le principe est la numerisation intelligente. Chaque document scane est automatiquement analyse par l\'IA qui en extrait les metadonnees : type d\'acte, date, parties, bien concerne, references cadastrales, montants. Ces metadonnees alimentent un index de recherche puissant. Vous retrouvez n\'importe quel acte en quelques secondes avec une recherche en langage naturel : "Vente appartement rue de la Paix par famille Durand en 2019."

La classification est automatique. L\'IA classe les documents par type (ventes, successions, donations, baux, societes), par client, par bien et par date. Les documents lies sont regroupes : l\'acte de vente est associe aux diagnostics, a l\'etat hypothecaire, au compromis et a la procuration correspondants. Plus besoin de chercher dans plusieurs dossiers ! \u{1F4C2}

La gestion des delais de conservation est critique pour un notaire. Certains actes doivent etre conserves 75 ans (minutes), d\'autres 30 ans (documents annexes), d\'autres 5 ans (correspondances). L\'IA gere ces delais automatiquement et vous alerte quand un document peut etre detruit — ou quand il doit imperativement etre conserve.

La securite est maximale. Les documents numerises sont chiffres, sauvegardes sur plusieurs supports et accessibles uniquement avec les droits adequats. L\'IA trace chaque acces : qui a consulte quel document, quand et pourquoi. Cette tracabilite est exigee par les autorites de controle.

Les copies authentiques et les expeditions sont generees en quelques clics. Le client demande une copie d\'un acte de 2015 ? L\'IA le retrouve instantanement, vous le verifiez et vous generez la copie avec les mentions obligatoires. Le temps de reponse au client passe de plusieurs jours a quelques heures.

L\'interoperabilite avec les systemes existants (MICEN, Planete, teleactes) est assuree. Les actes electroniques sont archives avec leurs certificats de signature, garantissant leur integrite dans le temps. \u{1F512}`,
          xpReward: 15,
        },
        {
          id: 'not-m5-l2',
          title: 'Jeu : Durees de conservation',
          duration: '3 min',
          type: 'game',
          content: 'Associez les documents a leurs durees de conservation.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque type de document notarial a sa duree de conservation legale',
            pairs: [
              { left: 'Minutes (actes originaux)', right: '75 ans minimum' },
              { left: 'Documents annexes', right: '30 ans' },
              { left: 'Correspondances clients', right: '5 ans' },
              { left: 'Registres LCB-FT', right: '5 ans apres fin de relation' },
              { left: 'Comptabilite de l\'etude', right: '10 ans' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'not-m5-l3',
          title: 'Quiz — Archivage notarial',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'archivage IA.',
          quizQuestions: [
            {
              question: 'Comment l\'IA classe-t-elle les documents scannes automatiquement ?',
              options: [
                'Par taille de fichier',
                'Par extraction de metadonnees : type d\'acte, date, parties, bien',
                'Par couleur du document',
                'Par ordre alphabetique uniquement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse chaque document scane et en extrait les metadonnees (type, date, parties, bien, montants) pour alimenter l\'index de recherche.',
            },
            {
              question: 'Combien de temps les minutes notariales doivent-elles etre conservees ?',
              options: ['10 ans', '30 ans', '75 ans minimum', 'A vie'],
              correctIndex: 2,
              explanation: 'Les minutes (actes originaux) doivent etre conservees pendant 75 ans minimum, ce qui est une obligation specifique au notariat.',
            },
            {
              question: 'Comment la tracabilite des acces est-elle assuree ?',
              options: [
                'Elle n\'est pas assuree',
                'L\'IA trace chaque acces : qui, quand, quel document, pourquoi',
                'Par un registre papier',
                'Par un vigile a l\'entree des archives',
              ],
              correctIndex: 1,
              explanation: 'L\'IA trace automatiquement chaque acces aux documents : identite de la personne, date, document consulte et motif.',
            },
            {
              question: 'Quel est l\'avantage de la recherche en langage naturel ?',
              options: [
                'Aucun avantage',
                'Retrouver un acte en quelques secondes sans connaitre la reference exacte',
                'Rechercher dans les archives d\'autres etudes',
                'Traduire les actes en anglais',
              ],
              correctIndex: 1,
              explanation: 'La recherche en langage naturel permet de retrouver un acte en decrivant ce qu\'on cherche, sans avoir besoin de la reference exacte.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les documents lies ?',
              options: [
                'Elle ne fait pas de lien',
                'Elle regroupe les documents associes : acte, diagnostics, compromis, procuration',
                'Elle fusionne tous les documents en un seul',
                'Elle supprime les doublons',
              ],
              correctIndex: 1,
              explanation: 'L\'IA regroupe automatiquement les documents lies entre eux (acte + diagnostics + compromis + procuration) pour faciliter la consultation.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F5C4}\u{FE0F}',
      badgeName: 'Archiviste Digital',
    },

    // Module 6 — Relation client
    {
      id: 'not-m6',
      title: 'Relation client moderne',
      emoji: '\u{1F91D}',
      description: 'Offrez une experience client fluide et transparente dans votre etude.',
      duration: '10 min',
      lessons: [
        {
          id: 'not-m6-l1',
          title: 'Moderniser la relation client notariale',
          duration: '4 min',
          type: 'text',
          content: `L\'image du notaire est en pleine evolution. Les clients — surtout les plus jeunes — attendent une experience moderne, transparente et reactive. L\'IA de Freenzy vous aide a moderniser votre relation client sans perdre la solennite et la confiance qui font la force de la profession. \u{1F91D}

L\'espace client en ligne est le pilier de cette modernisation. Chaque client accede a un espace personnel securise ou il retrouve ses documents, suit l\'avancement de son dossier et communique avec l\'etude. L\'IA alimente cet espace automatiquement : quand une etape est franchie (signature du compromis, obtention du pret, reception des diagnostics), le client est notifie et le statut est mis a jour.

La transparence sur les frais est un point sensible. L\'IA genere une simulation detaillee des frais de notaire des la prise de contact : droits de mutation, taxe de publicite fonciere, contribution de securite immobiliere, emoluments du notaire, debours. Le client sait exactement ce qu\'il paiera — plus de surprise desagreable a la signature ! \u{1F4B0}

La prise de rendez-vous est automatisee. Le client choisit son creneau en ligne dans les disponibilites de l\'etude. L\'IA envoie les confirmations, les rappels et les documents a preparer avant le rendez-vous. Pour un achat immobilier, elle demande au client de fournir piece d\'identite, avis d\'imposition, justificatif de domicile et offre de pret avant le jour de la signature.

La communication est multicanale et intelligente. L\'IA determine le meilleur canal pour chaque type de message : email pour les documents et les syntheses, SMS pour les rappels de rendez-vous, notification push pour les mises a jour de dossier. Le client recoit l\'information au bon moment, par le bon canal.

Le suivi post-signature est automatise. Apres un achat immobilier, l\'IA rappelle au client les demarches a effectuer : changement d\'adresse, assurance habitation, taxe fonciere. Apres une succession, elle rappelle les etapes restantes : declarations fiscales, partage, cloture des comptes du defunt.

L\'enquete de satisfaction est envoyee automatiquement apres chaque affaire. Les retours sont analyses par l\'IA qui identifie les axes d\'amelioration : temps d\'attente, clarte des explications, disponibilite des collaborateurs. Votre etude s\'ameliore en continu. \u{2B50}`,
          xpReward: 15,
        },
        {
          id: 'not-m6-l2',
          title: 'Exercice : Parcours client achat immobilier',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez le parcours client automatise pour un achat immobilier.',
          exercisePrompt: `Concevez le parcours client automatise complet pour un achat immobilier dans votre etude, du premier contact a la remise des cles.

Detaillez les etapes suivantes :
1. Premier contact (prise en charge de la demande) — message et delai de reponse
2. Ouverture du dossier (documents a fournir) — check-list automatique
3. Compromis (preparation, signature, notifications) — actions IA
4. Periode entre compromis et acte (suivi conditions suspensives) — alertes et relances
5. Jour de la signature (preparation, logistique) — rappels et documents
6. Post-signature (demarches, suivi, satisfaction) — messages automatiques

Pour chaque etape :
- Le canal de communication (email, SMS, espace client)
- Le message type (2-3 lignes)
- L'action IA automatisee
- Le delai de declenchement`,
          xpReward: 20,
        },
        {
          id: 'not-m6-l3',
          title: 'Quiz — Relation client notaire',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la relation client moderne.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qui alimente automatiquement l\'espace client en ligne ?',
              options: [
                'Rien, c\'est au client de le consulter',
                'L\'IA met a jour le statut et notifie le client a chaque etape franchie',
                'Le client met a jour lui-meme',
                'L\'agent immobilier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA alimente automatiquement l\'espace client : chaque etape franchie declenche une notification et une mise a jour du statut du dossier.',
            },
            {
              question: 'Pourquoi la simulation de frais des le premier contact est-elle importante ?',
              options: [
                'Pour facturer plus',
                'Pour eviter les surprises desagreables a la signature',
                'Pour comparer avec d\'autres notaires',
                'Ce n\'est pas important',
              ],
              correctIndex: 1,
              explanation: 'La transparence des frais des le depart evite les surprises a la signature et renforce la confiance du client.',
            },
            {
              question: 'Que fait l\'IA apres la signature d\'un achat immobilier ?',
              options: [
                'Rien, le dossier est clos',
                'Elle rappelle les demarches post-achat : adresse, assurance, taxe fonciere',
                'Elle propose de vendre le bien',
                'Elle supprime le dossier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA guide le client dans les demarches post-signature : changement d\'adresse, assurance habitation, taxe fonciere.',
            },
            {
              question: 'Comment l\'IA determine-t-elle le bon canal de communication ?',
              options: [
                'Elle utilise toujours l\'email',
                'Elle adapte le canal au type de message : email, SMS ou notification',
                'Elle laisse le client choisir',
                'Elle n\'utilise que le courrier postal',
              ],
              correctIndex: 1,
              explanation: 'L\'IA choisit le canal optimal : email pour les documents, SMS pour les rappels, notification push pour les mises a jour de statut.',
            },
            {
              question: 'A quoi sert l\'enquete de satisfaction automatique ?',
              options: [
                'A rien de concret',
                'A identifier les axes d\'amelioration de l\'etude',
                'A obtenir des avis Google',
                'A faire de la publicite',
              ],
              correctIndex: 1,
              explanation: 'L\'enquete de satisfaction est analysee par l\'IA pour identifier les axes d\'amelioration concrets : temps d\'attente, clarte, disponibilite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Notaire Moderne',
    },
  ],
};

// =============================================================================
// 5. DENTISTE IA
// =============================================================================

export const parcoursDentisteIA: FormationParcours = {
  id: 'dentiste-ia',
  title: 'IA pour les Dentistes',
  emoji: '\u{1F9B7}',
  description: 'Optimisez votre cabinet dentaire avec l\'IA : planning RDV, dossiers patients, devis de soins, relances, communication cabinet et conformite reglementaire.',
  category: 'metier',
  subcategory: 'dentaire',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#D97706',
  diplomaTitle: 'Dentiste Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Dentistes',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Planning RDV
    {
      id: 'dent-m1',
      title: 'Planning RDV intelligent',
      emoji: '\u{1F4C5}',
      description: 'Optimisez votre agenda et reduisez les creneaux perdus grace a l\'IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m1-l1',
          title: 'Un agenda dentaire optimise par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le planning d\'un cabinet dentaire est un casse-tete permanent. Entre les consultations de controle (20 min), les soins conservateurs (30-45 min), les protheses (1h+), les urgences et les rendez-vous annules au dernier moment, l\'agenda ressemble souvent a un gruyere. L\'IA de Freenzy optimise votre planning pour maximiser votre temps productif. \u{1F4C5}

Le systeme de prise de rendez-vous en ligne est le premier atout. Les patients reservent directement sur votre site web ou via un lien envoye par SMS. L\'IA propose les creneaux disponibles adaptes au type de soin : elle ne propose pas un creneau de 20 minutes pour une pose de couronne qui en necessite 60. Le patient choisit parmi les creneaux pertinents et confirme instantanement.

La gestion des annulations est intelligente. Quand un patient annule, l\'IA identifie immediatement les patients en liste d\'attente dont le soin correspond au creneau libere. Elle leur envoie un SMS : "Un creneau s\'est libere demain a 14h30 pour votre detartrage. Souhaitez-vous en profiter ? Repondez OUI pour confirmer." Le taux de remplissage des creneaux liberes passe de 30% a plus de 75% ! \u{1F4F1}

Les rappels automatiques reduisent drastiquement le taux de no-show. Un SMS a J-2 ("Rappel : rendez-vous au cabinet dentaire du Dr Martin, mardi 18 mars a 9h30. Repondez ANNULER pour liberer votre creneau.") et un second a J-1 si pas de confirmation. Le taux de no-show passe de 12-15% a moins de 3%.

L\'optimisation de l\'agenda est strategique. L\'IA regroupe les soins longs le matin (quand la concentration est maximale) et les controles rapides en fin de journee. Elle reserve des creneaux d\'urgence (2 par jour en moyenne) pour eviter de bousculer le planning quand un patient appelle avec une rage de dents.

Le planning integre aussi les pauses necessaires entre les patients (sterilisation, preparation du fauteuil) et vos temps administratifs (comptabilite, commandes). L\'IA calcule le temps reel disponible et evite le surbook qui cree du retard en chaine.

Sur un mois, un cabinet dentaire qui utilise l\'IA gagne en moyenne 8 heures productives supplementaires grace a la reduction des creneaux vides et des no-shows. C\'est l\'equivalent de plus d\'une journee de consultations en plus ! \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'dent-m1-l2',
          title: 'Exercice : Optimiser mon agenda',
          duration: '3 min',
          type: 'exercise',
          content: 'Reorganisez un agenda dentaire avec les principes IA.',
          exercisePrompt: `Voici l'agenda de votre cabinet pour jeudi prochain (8h30-18h, pause dejeuner 12h30-14h) :

Rendez-vous confirmes :
- 8h30 : Mme Dupont — controle annuel (20min)
- 9h00 : M. Bernard — composite sur 36 (45min)
- 10h00 : Mme Chen — pose couronne definitive (1h)
- 11h30 : Enfant Lucas — scellement sillons (30min)
- 14h00 : M. Petit — detartrage (30min)
- 15h00 : (ANNULE ce matin — etait une extraction)
- 16h00 : Mme Faure — empreinte bridge (1h)
- 17h30 : URGENCE reservee

Patients en liste d'attente :
- M. Roux : extraction 46 (45min) — disponible toute la journee
- Mme Garnier : blanchiment (1h30) — uniquement apres-midi
- Enfant Marie : controle (20min) — mercredi ou jeudi

Questions :
1. Comment remplir le creneau de 15h annule ?
2. Y a-t-il d'autres creneaux vides a optimiser ?
3. Redigez le SMS a envoyer au patient de la liste d'attente
4. Le creneau d'urgence de 17h30 est-il bien place ? Justifiez.`,
          xpReward: 20,
        },
        {
          id: 'dent-m1-l3',
          title: 'Quiz — Planning dentaire',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le planning dentaire IA.',
          quizQuestions: [
            {
              question: 'Quel est le taux de no-show moyen sans rappels automatiques ?',
              options: ['3%', '5-7%', '12-15%', '25%'],
              correctIndex: 2,
              explanation: 'Sans rappels automatiques, le taux de no-show dans un cabinet dentaire est de 12 a 15% en moyenne.',
            },
            {
              question: 'A combien le taux de no-show descend-il avec les rappels SMS ?',
              options: ['Moins de 3%', '5%', '8%', '10%'],
              correctIndex: 0,
              explanation: 'Avec les rappels SMS a J-2 et J-1, le taux de no-show descend a moins de 3%.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les annulations de derniere minute ?',
              options: [
                'Elle laisse le creneau vide',
                'Elle contacte automatiquement les patients en liste d\'attente',
                'Elle annule la journee',
                'Elle rembourse le patient',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les patients en liste d\'attente dont le soin correspond au creneau libere et leur envoie un SMS de proposition.',
            },
            {
              question: 'Combien d\'heures productives supplementaires l\'IA apporte-t-elle par mois ?',
              options: ['2 heures', '4 heures', '8 heures', '20 heures'],
              correctIndex: 2,
              explanation: 'Un cabinet dentaire gagne en moyenne 8 heures productives par mois grace a la reduction des creneaux vides et des no-shows.',
            },
            {
              question: 'Pourquoi l\'IA regroupe-t-elle les soins longs le matin ?',
              options: [
                'Parce que les patients preferent le matin',
                'Parce que la concentration est maximale le matin',
                'Pour finir plus tot',
                'Par habitude',
              ],
              correctIndex: 1,
              explanation: 'Les soins longs et complexes sont places le matin quand la concentration du praticien est maximale, optimisant la qualite des soins.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Planificateur Dentaire',
    },

    // Module 2 — Dossiers patients
    {
      id: 'dent-m2',
      title: 'Dossiers patients numeriques',
      emoji: '\u{1F4CB}',
      description: 'Gerez vos dossiers patients de maniere structuree et conforme.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m2-l1',
          title: 'Le dossier patient intelligent',
          duration: '4 min',
          type: 'text',
          content: `Le dossier patient est la colonne vertebrale de votre pratique dentaire. Il doit etre complet, a jour et facilement accessible — mais aussi conforme au RGPD et au secret medical. L\'IA de Freenzy vous aide a maintenir des dossiers patients irreprochabless tout en gagnant du temps. \u{1F4CB}

A l\'arrivee d\'un nouveau patient, l\'IA genere automatiquement un formulaire medical prealable envoye par email ou SMS. Le patient le remplit depuis son telephone avant le rendez-vous : antecedents medicaux, allergies, traitements en cours, historique dentaire, mutuelle. Ces informations alimentent directement le dossier numerique — plus de formulaires papier a ressaisir !

Pendant la consultation, l\'IA assiste la saisie du bilan. Vous dictez vos observations en langage naturel : "Carie occlusale sur 36, amalgame debordant sur 46 a refaire, parodontite debutante secteur 3, absence de 35 et 45." L\'IA structure ces observations dans le schema dentaire avec le codage CCAM correct et met a jour l\'odontogramme automatiquement. \u{1F9B7}

L\'historique des soins est complet et chronologique. Pour chaque dent, vous voyez l\'ensemble des actes realises depuis le premier rendez-vous : date, type de soin, materiaux utilises, cliche radiographique associe. Quand un patient revient apres 3 ans, vous retrouvez instantanement tout son parcours de soins.

Les radiographies sont integrees au dossier et datees. L\'IA peut comparer des cliches pris a differentes dates et signaler les evolutions significatives : "La lesion periapicale sur 46 semble avoir progresse depuis le cliche de mars 2025. Envisager un traitement endodontique." Ce suivi radiographique est precieux pour documenter l\'evolution des pathologies.

Les alertes medicales sont automatiques. Si un patient a signale une allergie a la penicilline, l\'IA affiche une alerte des l\'ouverture de son dossier. Si un patient prend des anticoagulants, elle vous le rappelle avant toute extraction. Ces alertes evitent des incidents potentiellement graves.

Le dossier est conforme au RGPD : consentement eclaire signe electroniquement, acces restreint aux praticiens habilites, tracabilite des consultations, droit d\'acces du patient. L\'IA gere la duree de conservation legale (20 ans apres le dernier passage) et vous alerte pour l\'archivage. \u{1F512}`,
          xpReward: 15,
        },
        {
          id: 'dent-m2-l2',
          title: 'Jeu : Codage CCAM dentaire',
          duration: '3 min',
          type: 'game',
          content: 'Associez les actes dentaires a leurs codes CCAM.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque acte dentaire courant a sa description CCAM',
            pairs: [
              { left: 'HBMD001', right: 'Detartrage et polissage des dents' },
              { left: 'HBBD005', right: 'Obturation 1 face sur dent permanente' },
              { left: 'HBGD001', right: 'Avulsion d\'une dent permanente' },
              { left: 'HBLD043', right: 'Traitement endodontique molaire' },
              { left: 'HBLD036', right: 'Pose d\'une couronne dentaire' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dent-m2-l3',
          title: 'Quiz — Dossiers patients',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les dossiers patients IA.',
          quizQuestions: [
            {
              question: 'Combien de temps un dossier patient dentaire doit-il etre conserve ?',
              options: ['5 ans', '10 ans', '20 ans apres le dernier passage', '30 ans'],
              correctIndex: 2,
              explanation: 'La duree de conservation legale d\'un dossier patient est de 20 ans apres le dernier passage du patient.',
            },
            {
              question: 'Comment l\'IA structure-t-elle les observations dictees ?',
              options: [
                'Elle les copie telles quelles',
                'Elle les structure avec le codage CCAM et met a jour l\'odontogramme',
                'Elle les traduit en anglais',
                'Elle les envoie au patient',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse le langage naturel, identifie les actes avec leur codage CCAM et met a jour l\'odontogramme automatiquement.',
            },
            {
              question: 'Quand l\'alerte allergie s\'affiche-t-elle ?',
              options: [
                'Uniquement si vous la cherchez',
                'Des l\'ouverture du dossier du patient',
                'Uniquement lors de la prescription',
                'Elle ne s\'affiche pas automatiquement',
              ],
              correctIndex: 1,
              explanation: 'Les alertes medicales (allergies, anticoagulants, etc.) s\'affichent automatiquement des l\'ouverture du dossier du patient.',
            },
            {
              question: 'Quel avantage offre le formulaire medical prealable envoye au patient ?',
              options: [
                'Aucun avantage',
                'Le patient remplit ses antecedents avant le RDV, eliminant la ressaisie',
                'Le patient se soigne lui-meme',
                'Il remplace la consultation',
              ],
              correctIndex: 1,
              explanation: 'Le formulaire rempli en amont alimente directement le dossier numerique, eliminant la ressaisie et gagnant du temps de consultation.',
            },
            {
              question: 'Que peut signaler l\'IA en comparant des radiographies ?',
              options: [
                'La qualite de la radiographie',
                'Les evolutions significatives de lesions entre deux dates',
                'Le prix de la radiographie',
                'Le nom du radiologue',
              ],
              correctIndex: 1,
              explanation: 'L\'IA compare les cliches radiographiques pris a differentes dates et signale les evolutions significatives pour orienter le traitement.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Dossier Patient Pro',
    },

    // Module 3 — Devis soins
    {
      id: 'dent-m3',
      title: 'Devis et plans de traitement',
      emoji: '\u{1F4B0}',
      description: 'Generez des devis clairs et des plans de traitement complets pour vos patients.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m3-l1',
          title: 'Devis dentaires intelligents',
          duration: '4 min',
          type: 'text',
          content: `La presentation des devis est un moment delicat en cabinet dentaire. Le patient decouvre souvent des montants importants pour les soins prothétiques ou implantaires, et la part non remboursee peut etre source de stress. L\'IA de Freenzy vous aide a presenter des devis clairs, detailles et comprehensibles qui facilitent l\'acceptation par le patient. \u{1F4B0}

Le devis est genere automatiquement a partir du plan de traitement. Vous saisissez les actes necessaires et l\'IA produit un document conforme au modele reglementaire : description de l\'acte en langage patient (pas uniquement le code CCAM), base de remboursement Securite sociale, tarif pratique, reste a charge avant et apres mutuelle. Le patient comprend exactement ce qu\'il paie.

Le systeme integre les tarifs opposables et les plafonds du 100% Sante. L\'IA identifie automatiquement les actes eligibles au panier "reste a charge zero" : couronnes ceramiques sur dents visibles, bridges trois elements, protheses amovibles. Elle propose au patient les alternatives : "Pour votre couronne sur 14, vous avez le choix entre une couronne ceramique 100% Sante (reste a charge : 0 euros) et une couronne ceramo-metallique hors panier (reste a charge : 280 euros)." \u{2705}

La simulation mutuelle est un atout majeur. L\'IA calcule le remboursement de la mutuelle du patient (si elle est renseignee) et affiche le reste a charge reel. Le patient ne decouvre plus le montant a payer le jour de la pose — il le sait des le devis. La transparence facilite l\'acceptation.

Pour les plans de traitement complexes (rehabilitation complete, implants multiples), l\'IA propose un echeancier de soins et de paiements. "Phase 1 : extractions et cicatrisation (2 mois, cout : 400 euros). Phase 2 : pose des implants (4 mois, cout : 3 200 euros). Phase 3 : protheses sur implants (2 mois, cout : 2 800 euros)." Le patient visualise le parcours complet et peut budgetiser.

Le suivi des devis est automatique. L\'IA sait quels devis ont ete acceptes, refuses ou sont en attente. Pour les devis en attente depuis plus de 15 jours, elle propose d\'envoyer une relance douce : "Nous restons a votre disposition pour repondre a vos questions concernant le plan de traitement propose. N\'hesitez pas a nous contacter."

Le taux d\'acceptation des devis augmente en moyenne de 25% avec une presentation claire et transparente. \u{1F4C8}`,
          xpReward: 15,
        },
        {
          id: 'dent-m3-l2',
          title: 'Exercice : Presenter un devis implantaire',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez un devis dentaire complet avec alternatives.',
          exercisePrompt: `Un patient de 55 ans vous consulte pour remplacer la dent 36 (premiere molaire inferieure gauche) absente depuis 2 ans. Apres examen, les options sont :

Option A : Implant + couronne ceramo-metallique
- Implant : 1 200 euros (non rembourse SS)
- Pilier : 300 euros (non rembourse SS)
- Couronne sur implant : 600 euros (base SS : 107,50 euros, rembourse 70%)

Option B : Bridge 3 elements (35-36-37)
- 3 couronnes ceramiques : 3 x 500 euros = 1 500 euros
- Base SS bridge 3 elements : 279,50 euros, rembourse 70%
- Option 100% Sante disponible : bridge metal ceramique

Option C : Prothese amovible partielle
- Chassis metallique : 450 euros
- Base SS : 64,50 euros, rembourse 70%

Mutuelle du patient : 300% de la base SS

Redigez :
1. Le devis comparatif des 3 options avec reste a charge apres mutuelle
2. Les avantages et inconvenients de chaque option en langage patient
3. L'echeancier de soins et paiements pour l'option A
4. Le message de presentation au patient (ton rassurant et pedagogique)`,
          xpReward: 20,
        },
        {
          id: 'dent-m3-l3',
          title: 'Quiz — Devis dentaires',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les devis dentaires IA.',
          quizQuestions: [
            {
              question: 'De combien le taux d\'acceptation des devis augmente-t-il avec une presentation claire ?',
              options: ['5%', '10%', '25%', '50%'],
              correctIndex: 2,
              explanation: 'Une presentation claire et transparente des devis augmente le taux d\'acceptation de 25% en moyenne.',
            },
            {
              question: 'Qu\'est-ce que le panier "100% Sante" en dentaire ?',
              options: [
                'Des soins gratuits pour le dentiste',
                'Des actes prothétiques avec reste a charge zero pour le patient',
                'Une assurance speciale',
                'Un forfait illimite de soins',
              ],
              correctIndex: 1,
              explanation: 'Le 100% Sante propose des actes prothétiques (couronnes, bridges, protheses) avec un reste a charge nul pour le patient apres remboursement SS + mutuelle.',
            },
            {
              question: 'Pourquoi la simulation mutuelle est-elle un atout ?',
              options: [
                'Pour negocier avec la mutuelle',
                'Pour que le patient connaisse son reste a charge reel des le devis',
                'Pour augmenter les prix',
                'Pour choisir la mutuelle du patient',
              ],
              correctIndex: 1,
              explanation: 'La simulation mutuelle affiche le reste a charge reel du patient des le devis, evitant les mauvaises surprises et facilitant la decision.',
            },
            {
              question: 'Apres combien de jours l\'IA propose-t-elle de relancer un devis en attente ?',
              options: ['5 jours', '15 jours', '30 jours', '60 jours'],
              correctIndex: 1,
              explanation: 'L\'IA propose une relance douce apres 15 jours d\'attente pour les devis non encore acceptes ou refuses.',
            },
            {
              question: 'Que propose l\'IA pour les plans de traitement complexes ?',
              options: [
                'De tout faire en une seule seance',
                'Un echeancier de soins et de paiements phase par phase',
                'D\'envoyer le patient chez un specialiste',
                'De reduire le plan de traitement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA decoupepe les traitements complexes en phases avec echeancier de soins et de paiements, permettant au patient de budgetiser.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Devis Dentaire Pro',
    },

    // Module 4 — Relances patients
    {
      id: 'dent-m4',
      title: 'Relances et rappels patients',
      emoji: '\u{1F514}',
      description: 'Fidelisez vos patients avec des rappels de controle et de soins automatises.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m4-l1',
          title: 'Systeme de relances patients IA',
          duration: '4 min',
          type: 'text',
          content: `Un patient qui ne revient pas pour son controle annuel, c\'est du chiffre d\'affaires perdu et surtout un risque pour sa sante bucco-dentaire. En moyenne, 40% des patients ne reviennent pas spontanement pour leur controle semestriel ou annuel. L\'IA de Freenzy met en place un systeme de relances intelligent qui fidilise vos patients. \u{1F514}

Le rappel de controle est le plus simple et le plus efficace. L\'IA envoie automatiquement un SMS ou email 11 mois apres le dernier controle : "Il est temps de penser a votre bilan dentaire annuel ! Prenez rendez-vous en ligne sur [lien] ou appelez le cabinet au [numero]." Si le patient ne repond pas, une relance est envoyee 15 jours plus tard.

Les rappels de soins en cours sont cruciaux. Quand un patient commence un traitement mais ne prend pas le rendez-vous suivant, l\'IA le detecte et envoie un rappel : "Votre traitement sur la dent 26 n\'est pas encore termine. Il est important de finaliser les soins pour eviter toute complication. Prenez rendez-vous pour la prochaine seance." Ce rappel evite les abandons de traitement. \u{26A0}\u{FE0F}

Le suivi des devis non acceptes est automatise. Un patient a recu un devis pour un bridge mais n\'a pas donne suite depuis 3 semaines ? L\'IA envoie un message bienveillant : "Nous comprenons que les soins dentaires representent un investissement. N\'hesitez pas a nous contacter pour discuter des options de financement ou des alternatives disponibles."

Les rappels de detartrage sont programmes selon la frequence recommandee pour chaque patient. Pour un patient sans pathologie parodontale : tous les 12 mois. Pour un patient avec parodontite traitee : tous les 4 a 6 mois. L\'IA ajuste la frequence selon l\'historique du patient.

Le programme de prevention pour les enfants est particulierement utile. L\'IA rappelle les rendez-vous cles : premiere visite a 1 an, controles semestriels, scellement des sillons a 6 et 12 ans, surveillance de l\'eruption des dents de sagesse a 16-18 ans. Les parents apprecient ce suivi proactif.

Le canal de communication est adapte au profil du patient. Les patients de moins de 35 ans recoivent des SMS, les 35-60 ans des emails, et les patients ages des appels telephoniques automatises. L\'IA apprend les preferences de chaque patient au fil du temps.

Resultat mesurable : les cabinets qui utilisent les relances automatiques voient leur taux de retour patient augmenter de 35% et leur chiffre d\'affaires recurrent progresser de 20%. \u{1F4C8}`,
          xpReward: 15,
        },
        {
          id: 'dent-m4-l2',
          title: 'Jeu : Frequences de rappel',
          duration: '3 min',
          type: 'game',
          content: 'Associez les types de patients aux frequences de rappel appropriees.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque profil patient a la frequence de rappel recommandee',
            pairs: [
              { left: 'Patient sans pathologie', right: 'Controle annuel (12 mois)' },
              { left: 'Patient parodontite traitee', right: 'Maintenance tous les 4-6 mois' },
              { left: 'Enfant 6-12 ans', right: 'Controle semestriel + scellement sillons' },
              { left: 'Patient porteur de prothese', right: 'Controle et ajustement tous les 6 mois' },
              { left: 'Patient orthodontie', right: 'Rendez-vous mensuel de suivi' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dent-m4-l3',
          title: 'Quiz — Relances patients',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les relances patients.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de patients ne revient pas spontanement pour le controle annuel ?',
              options: ['10%', '20%', '40%', '60%'],
              correctIndex: 2,
              explanation: 'En moyenne, 40% des patients ne reviennent pas spontanement pour leur controle semestriel ou annuel sans relance.',
            },
            {
              question: 'De combien le taux de retour patient augmente-t-il avec les relances IA ?',
              options: ['10%', '20%', '35%', '50%'],
              correctIndex: 2,
              explanation: 'Les relances automatiques augmentent le taux de retour patient de 35% en moyenne.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle le rappel de controle annuel ?',
              options: ['6 mois apres', '9 mois apres', '11 mois apres le dernier controle', '13 mois apres'],
              correctIndex: 2,
              explanation: 'Le rappel est envoye 11 mois apres le dernier controle pour que le patient prenne rendez-vous au bon moment.',
            },
            {
              question: 'Comment l\'IA adapte-t-elle le canal de communication ?',
              options: [
                'Tout par email',
                'SMS pour les jeunes, email pour les 35-60 ans, appel pour les ages',
                'Tout par courrier postal',
                'Elle n\'adapte pas',
              ],
              correctIndex: 1,
              explanation: 'L\'IA adapte le canal au profil : SMS pour les moins de 35 ans, email pour les 35-60 ans, appel telephonique pour les patients ages.',
            },
            {
              question: 'Pourquoi le rappel de soins en cours est-il crucial ?',
              options: [
                'Pour facturer plus',
                'Pour eviter les abandons de traitement et les complications',
                'Pour remplir l\'agenda',
                'Par obligation legale',
              ],
              correctIndex: 1,
              explanation: 'Les rappels de soins en cours evitent les abandons de traitement qui peuvent entrainer des complications pour le patient.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F514}',
      badgeName: 'Expert Relances',
    },

    // Module 5 — Communication cabinet
    {
      id: 'dent-m5',
      title: 'Communication du cabinet',
      emoji: '\u{1F4E2}',
      description: 'Developpez la visibilite de votre cabinet avec des outils de communication IA.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m5-l1',
          title: 'Developper la communication de son cabinet',
          duration: '4 min',
          type: 'text',
          content: `La communication est longtemps restee un tabou pour les chirurgiens-dentistes. Mais depuis l\'assouplissement des regles deontologiques, les dentistes peuvent et doivent communiquer pour developper leur activite — dans le respect des regles de l\'Ordre. L\'IA de Freenzy vous aide a communiquer efficacement et en toute conformite. \u{1F4E2}

Votre fiche Google Business est votre vitrine numero un. L\'IA vous aide a l\'optimiser : description professionnelle, horaires a jour, photos du cabinet (salle d\'attente, fauteuil, equipe), reponses aux avis patients. Chaque avis negatif recoit une suggestion de reponse professionnelle et mesuree : "Nous sommes desoles que votre experience n\'ait pas ete a la hauteur de vos attentes. Nous vous invitons a nous contacter pour en discuter."

Le site web du cabinet est alimente par l\'IA. Elle genere des contenus educatifs adaptes a votre specialite : "Les 5 signes d\'une carie debutante", "Implant ou bridge : comment choisir ?", "Le detartrage : pourquoi c\'est important tous les ans". Ces articles informent vos patients et ameliorent votre referencement Google. \u{1F4F1}

Les reseaux sociaux professionnels sont geres intelligemment. L\'IA propose des publications adaptees : conseils d\'hygiene bucco-dentaire, presentation de nouveaux equipements, journees mondiales de la sante (journee mondiale de la sante bucco-dentaire le 20 mars), recrutement. Le calendrier editorial est genere automatiquement avec un post par semaine.

La newsletter patient est un outil de fidilisation puissant. L\'IA redige une newsletter trimestrielle avec les actualites du cabinet (nouveau praticien, nouveaux horaires, nouvel equipement), des conseils de sante dentaire et des rappels pratiques (fermetures exceptionnelles, teleservice Amelipro). Les patients se sentent lies a votre cabinet.

La gestion des avis Google est strategique. Apres chaque visite reussie, l\'IA envoie un lien direct pour deposer un avis. Pour les avis negatifs, elle analyse le contenu et propose une reponse adaptee en respectant le secret medical (ne jamais mentionner les soins du patient dans la reponse publique).

La conformite deontologique est integree. L\'IA verifie que vos communications respectent les regles de l\'Ordre : pas de publicite comparative, pas de promesse de resultat, pas de temoignages de patients identifies, mention des qualifications et diplomes uniquement veridiques. \u{2696}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'dent-m5-l2',
          title: 'Exercice : Strategie de communication',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez une strategie de communication pour votre cabinet.',
          exercisePrompt: `Vous venez d'ouvrir un cabinet dentaire dans un quartier residentiel avec beaucoup de familles. Vous souhaitez vous faire connaitre rapidement tout en respectant la deontologie.

Creez votre strategie de communication sur 3 mois :

Mois 1 — Lancement :
1. Redigez la description Google Business (max 150 mots, professionnelle)
2. Listez 4 articles educatifs a publier sur votre site web
3. Redigez le premier post reseaux sociaux (presentation du cabinet)

Mois 2 — Developpement :
4. Proposez 4 sujets de posts reseaux sociaux (un par semaine)
5. Redigez le contenu de votre premiere newsletter (300 mots)

Mois 3 — Fidelisation :
6. Definissez le processus de collecte d'avis Google
7. Redigez un modele de reponse a un avis negatif (patient mecontent du temps d'attente)

Pour chaque element, verifiez la conformite deontologique.`,
          xpReward: 20,
        },
        {
          id: 'dent-m5-l3',
          title: 'Quiz — Communication dentaire',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la communication cabinet.',
          quizQuestions: [
            {
              question: 'Quelle est la vitrine numero un d\'un cabinet dentaire en ligne ?',
              options: ['Instagram', 'La fiche Google Business', 'LinkedIn', 'Facebook'],
              correctIndex: 1,
              explanation: 'La fiche Google Business est la premiere chose que voient les patients potentiels lorsqu\'ils cherchent un dentiste dans leur quartier.',
            },
            {
              question: 'Que ne doit-on JAMAIS mentionner dans une reponse a un avis Google ?',
              options: [
                'Le nom du cabinet',
                'Les soins realises sur le patient (secret medical)',
                'Les horaires du cabinet',
                'Le numero de telephone',
              ],
              correctIndex: 1,
              explanation: 'Le secret medical est absolu : meme dans une reponse a un avis negatif, on ne doit jamais mentionner les soins ou la situation du patient.',
            },
            {
              question: 'A quelle frequence l\'IA propose-t-elle des publications reseaux sociaux ?',
              options: ['Tous les jours', 'Une par semaine', 'Une par mois', 'Une par an'],
              correctIndex: 1,
              explanation: 'L\'IA propose un calendrier editorial avec une publication par semaine, un rythme adapte a un cabinet dentaire.',
            },
            {
              question: 'Que verifie l\'IA pour la conformite deontologique ?',
              options: [
                'Uniquement l\'orthographe',
                'Pas de publicite comparative, pas de promesse de resultat, diplomes veridiques',
                'Le design des publications',
                'Le nombre de likes',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie le respect des regles de l\'Ordre : pas de publicite comparative, pas de promesse de resultat, qualifications veridiques.',
            },
            {
              question: 'Pourquoi les articles educatifs ameliorent-ils le referencement ?',
              options: [
                'Ils n\'ameliorent pas le referencement',
                'Le contenu pertinent ameliore le positionnement Google du site du cabinet',
                'Ils attirent des annonceurs',
                'Ils remplacent les avis patients',
              ],
              correctIndex: 1,
              explanation: 'Les articles educatifs pertinents (soins dentaires, prevention) ameliorent le referencement naturel Google de votre site web.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E2}',
      badgeName: 'Communicant Dentaire',
    },

    // Module 6 — Conformite
    {
      id: 'dent-m6',
      title: 'Conformite reglementaire',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Restez conforme aux obligations du cabinet : RGPD, Ordre, radioprotection.',
      duration: '10 min',
      lessons: [
        {
          id: 'dent-m6-l1',
          title: 'La conformite du cabinet dentaire',
          duration: '4 min',
          type: 'text',
          content: `Un cabinet dentaire est soumis a de nombreuses obligations reglementaires : RGPD pour les donnees patients, obligations ordinales, radioprotection, gestion des dechets d\'activite de soins (DASRI), maintenance des equipements, formation continue obligatoire. L\'IA de Freenzy centralise toutes ces obligations et vous alerte en temps voulu. \u{1F6E1}\u{FE0F}

La conformite RGPD est la premiere preoccupation. Le cabinet collecte des donnees de sante — la categorie la plus sensible selon le RGPD. L\'IA verifie que vous avez : un registre des traitements a jour, des consentements eclaires signes par chaque patient, un contrat avec votre hebergeur de donnees de sante (certifie HDS), une procedure de notification en cas de violation de donnees, et un DPO designe si necessaire.

Les obligations de radioprotection sont suivies automatiquement. L\'IA vous rappelle les controles periodiques obligatoires : controle qualite du panoramique (annuel), controle de l\'installation par un organisme agree (tous les 5 ans), formation radioprotection des patients (tous les 10 ans), dosimetrie du personnel expose. Chaque echeance est alertee 3 mois a l\'avance. \u{2622}\u{FE0F}

La gestion des DASRI (Dechets d\'Activite de Soins a Risque Infectieux) est tracee. L\'IA vous rappelle les collectes periodiques, verifie que les bordereaux de suivi sont archives (3 ans obligatoire) et genere le rapport annuel de production de dechets. Elle vous alerte aussi si votre contrat avec le prestataire de collecte arrive a echeance.

La maintenance des equipements medicaux est planifiee : autoclave (controle biologique hebdomadaire, maintenance annuelle), fauteuil (maintenance semestrielle), compresseur (vidange annuelle), aspirations chirurgicales (controle trimestriel). L\'IA genere un calendrier de maintenance et enregistre chaque intervention effectuee.

La formation continue obligatoire (DPC — Developpement Professionnel Continu) est suivie. L\'IA vous rappelle votre obligation triennale et vous propose des formations adaptees a vos besoins : nouvelles techniques, materiaux innovants, gestion du cabinet. Elle verifie que votre attestation DPC est a jour pour l\'Ordre.

Le registre de securite du cabinet est genere automatiquement : verification des extincteurs (annuelle), controle electrique (5 ans), affichage obligatoire, plan d\'evacuation, formation du personnel aux gestes de premiers secours. \u{1F4CB}

L\'IA constitue un veritable tableau de bord de conformite : vert (conforme), orange (echeance proche), rouge (non conforme). Vous visualisez en un instant l\'etat de toutes vos obligations et les actions a mener en priorite.`,
          xpReward: 15,
        },
        {
          id: 'dent-m6-l2',
          title: 'Jeu : Periodicites des controles obligatoires',
          duration: '3 min',
          type: 'game',
          content: 'Associez les controles a leurs periodicites.',
          gameType: 'matching',
          gameData: {
            instruction: 'Associez chaque controle obligatoire du cabinet a sa periodicite',
            pairs: [
              { left: 'Controle biologique autoclave', right: 'Hebdomadaire' },
              { left: 'Controle qualite panoramique', right: 'Annuel' },
              { left: 'Controle installation radiologie', right: 'Tous les 5 ans' },
              { left: 'Formation radioprotection patients', right: 'Tous les 10 ans' },
              { left: 'DPC (formation continue)', right: 'Obligation triennale' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dent-m6-l3',
          title: 'Quiz — Conformite cabinet dentaire',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la conformite reglementaire.',
          quizQuestions: [
            {
              question: 'Combien de temps les bordereaux DASRI doivent-ils etre archives ?',
              options: ['1 an', '3 ans', '5 ans', '10 ans'],
              correctIndex: 1,
              explanation: 'Les bordereaux de suivi des dechets DASRI doivent etre conserves pendant 3 ans.',
            },
            {
              question: 'Quelle certification l\'hebergeur de donnees de sante doit-il posseder ?',
              options: ['ISO 9001', 'HDS (Hebergeur de Donnees de Sante)', 'RGPD Label', 'CE Medical'],
              correctIndex: 1,
              explanation: 'L\'hebergeur de donnees de sante doit etre certifie HDS, une obligation specifique pour les donnees medicales.',
            },
            {
              question: 'A quelle frequence le controle de l\'installation de radiologie doit-il etre fait ?',
              options: ['Tous les ans', 'Tous les 3 ans', 'Tous les 5 ans', 'Tous les 10 ans'],
              correctIndex: 2,
              explanation: 'Le controle de l\'installation de radiologie par un organisme agree est obligatoire tous les 5 ans.',
            },
            {
              question: 'Que signifie le code couleur rouge dans le tableau de bord de conformite ?',
              options: [
                'Tout va bien',
                'Echeance proche',
                'Non conforme — action urgente requise',
                'Pas de donnees',
              ],
              correctIndex: 2,
              explanation: 'Le rouge indique une non-conformite necessitant une action urgente. Le vert = conforme, l\'orange = echeance proche.',
            },
            {
              question: 'Quelle obligation triennale l\'IA suit-elle pour les dentistes ?',
              options: [
                'Le renouvellement du bail',
                'Le DPC (Developpement Professionnel Continu)',
                'Le changement de materiel',
                'La visite medicale du personnel',
              ],
              correctIndex: 1,
              explanation: 'Le DPC est une obligation triennale : chaque dentiste doit justifier d\'actions de formation continue sur une periode de 3 ans.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Cabinet Conforme',
    },
  ],
};
