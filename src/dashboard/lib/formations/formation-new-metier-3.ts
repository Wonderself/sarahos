// =============================================================================
// Freenzy.io — Formations Metier Pack 3
// 3 parcours x 6 modules x 3 lessons = 54 lessons
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. IA pour Comptables
// =============================================================================

export const parcoursComptableIA: FormationParcours = {
  id: 'comptable-ia',
  title: 'IA pour Comptables',
  emoji: '\u{1F4CA}',
  description: 'Transformez votre cabinet comptable avec l\'IA : saisie automatisee, declarations fiscales, bilans financiers, reporting client, veille fiscale et audit intelligent.',
  category: 'metier',
  subcategory: 'finance',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#6366F1',
  diplomaTitle: 'Comptable Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Comptables',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Saisie comptable automatisee
    {
      id: 'compta-m1',
      title: 'Saisie comptable automatisee',
      emoji: '\u{1F4DD}',
      description: 'Automatisez la saisie des ecritures comptables grace a l\'IA et gagnez un temps considerable.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Saisie Express',
      lessons: [
        {
          id: 'compta-m1-l1',
          title: 'L\'IA au service de la saisie comptable',
          duration: '4 min',
          type: 'text' as const,
          content: `La saisie comptable represente souvent plus de 40% du temps de travail d\'un cabinet. Chaque facture, chaque releve bancaire, chaque note de frais doit etre saisie manuellement, verifiee, puis imputee au bon compte. C\'est un travail repetitif mais critique ou la moindre erreur peut avoir des consequences importantes lors du bilan ou d\'un controle fiscal.

L\'intelligence artificielle change completement la donne. Grace a la reconnaissance optique de caracteres (OCR) couplee a des algorithmes d\'apprentissage, l\'IA peut desormais lire une facture, en extraire automatiquement le montant HT, la TVA, le fournisseur, la date et le numero de facture. Elle propose ensuite l\'imputation comptable adaptee en se basant sur l\'historique des ecritures similaires. Plus votre cabinet l\'utilise, plus elle devient precise dans ses suggestions.

Avec Freenzy, vous importez simplement vos documents par lot. L\'assistant analyse chaque piece, detecte les doublons potentiels et signale les anomalies comme un montant inhabituellement eleve pour un fournisseur donne. Il gere aussi le lettrage automatique entre factures et reglements, une tache chronophage qui devient instantanee. Le taux de reconnaissance atteint 95% apres quelques semaines d\'utilisation.

L\'IA s\'adapte aux specificites de chaque dossier client. Un restaurant aura des imputations differentes d\'une entreprise de BTP. Le systeme apprend ces particularites et les applique automatiquement, vous laissant vous concentrer sur le conseil et l\'analyse plutot que sur la saisie pure. Votre valeur ajoutee en tant que comptable se deplace vers l\'expertise et la relation client.`,
          xpReward: 15,
        },
        {
          id: 'compta-m1-l2',
          title: 'Exercice : Configurer la saisie automatique',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Mettez en place un workflow de saisie automatisee pour un client type.',
          exercisePrompt: `Vous gerez la comptabilite d\'une PME de 20 salaries dans le secteur du commerce de detail. Le client vous envoie chaque mois environ 150 factures fournisseurs, 80 factures clients et 3 releves bancaires.

Redigez le brief pour configurer l\'assistant Freenzy :
1. Definissez les regles d\'imputation automatique pour les 5 principaux postes de depenses
2. Etablissez les seuils d\'alerte pour les montants inhabituels
3. Precisez le workflow de validation (automatique vs manuelle)
4. Indiquez comment gerer les cas ambigus (facture sans TVA, avoir, etc.)`,
          xpReward: 20,
        },
        {
          id: 'compta-m1-l3',
          title: 'Quiz — Saisie automatisee',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur la saisie comptable automatisee par IA.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du temps de travail la saisie represente-t-elle en cabinet ?',
              options: ['10%', '25%', '40%', '60%'],
              correctIndex: 2,
              explanation: 'La saisie comptable represente souvent plus de 40% du temps de travail d\'un cabinet, d\'ou l\'interet majeur de l\'automatiser.',
            },
            {
              question: 'Quelle technologie permet a l\'IA de lire les factures ?',
              options: ['Le GPS', 'L\'OCR couple a l\'apprentissage automatique', 'La blockchain', 'Le cloud computing'],
              correctIndex: 1,
              explanation: 'L\'OCR (reconnaissance optique de caracteres) couplee a l\'apprentissage automatique permet d\'extraire les donnees des factures.',
            },
            {
              question: 'Quel taux de reconnaissance atteint l\'IA apres quelques semaines ?',
              options: ['70%', '80%', '90%', '95%'],
              correctIndex: 3,
              explanation: 'Apres quelques semaines d\'utilisation et d\'apprentissage, le taux de reconnaissance atteint 95%.',
            },
            {
              question: 'Que fait l\'IA quand elle detecte un montant inhabituellement eleve ?',
              options: ['Elle refuse la facture', 'Elle signale l\'anomalie', 'Elle supprime l\'ecriture', 'Elle contacte le fournisseur'],
              correctIndex: 1,
              explanation: 'L\'IA signale les anomalies comme un montant inhabituellement eleve pour un fournisseur donne, sans bloquer le processus.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Declarations fiscales intelligentes
    {
      id: 'compta-m2',
      title: 'Declarations fiscales intelligentes',
      emoji: '\u{1F4C4}',
      description: 'Preparez et verifiez vos declarations fiscales avec l\'assistance de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C4}',
      badgeName: 'Fiscal Pro',
      lessons: [
        {
          id: 'compta-m2-l1',
          title: 'Automatiser les declarations fiscales',
          duration: '4 min',
          type: 'text' as const,
          content: `Les declarations fiscales constituent un enjeu majeur pour tout cabinet comptable. TVA mensuelle ou trimestrielle, IS, liasses fiscales, CFE, CVAE — le calendrier fiscal est charge et les erreurs peuvent couter tres cher a vos clients. L\'IA devient un assistant precieux pour securiser et accelerer ce processus.

L\'assistant Freenzy commence par centraliser toutes les echeances fiscales de vos clients dans un tableau de bord unifie. Chaque declaration est preparee automatiquement a partir des donnees comptables deja saisies. Pour la TVA par exemple, l\'IA calcule la TVA collectee, la TVA deductible, verifie la coherence des taux appliques et genere le formulaire pre-rempli. Vous n\'avez plus qu\'a valider avant envoi.

La vraie puissance de l\'IA reside dans la detection d\'anomalies. Avant chaque declaration, le systeme effectue une batterie de controles : coherence entre le chiffre d\'affaires declare et les factures emises, verification des prorata de deduction, controle des seuils de franchise, detection des inversions de comptes. Ces verifications qui prendraient des heures manuellement sont realisees en quelques secondes.

Pour les liasses fiscales, l\'IA pre-remplit chaque tableau a partir de la balance generale et signale les ecarts significatifs par rapport a l\'exercice precedent. Elle genere aussi des notes explicatives pour les variations importantes, facilitant le travail d\'analyse du commissaire aux comptes. Le systeme gere egalement les reports de deficits, les amortissements derogatoires et les provisions reglementees.

L\'IA vous alerte aussi sur les optimisations fiscales possibles : credits d\'impot recherche, suramortissement, exonerations de zone franche. Chaque suggestion est argumentee avec les references legales correspondantes, vous permettant de conseiller vos clients de maniere proactive.`,
          xpReward: 15,
        },
        {
          id: 'compta-m2-l2',
          title: 'Exercice : Preparer une declaration TVA',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Utilisez l\'IA pour preparer et verifier une declaration de TVA.',
          exercisePrompt: `Votre client est une SARL de conseil en informatique. Voici les donnees du trimestre :
- CA HT : 185 000 EUR (taux 20%)
- Achats HT : 42 000 EUR (taux 20%)
- Frais generaux HT : 15 000 EUR (mix 20% et 10%)
- Note de frais avec TVA a 10% : 3 200 EUR HT
- Un avoir fournisseur de 5 000 EUR HT

Redigez les instructions pour l\'assistant Freenzy :
1. Calculez la TVA collectee et deductible
2. Identifiez les points de vigilance a verifier
3. Listez les controles de coherence a effectuer avant envoi
4. Proposez un calendrier de rappel pour les prochaines echeances`,
          xpReward: 20,
        },
        {
          id: 'compta-m2-l3',
          title: 'Quiz — Declarations fiscales',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur l\'automatisation des declarations fiscales.',
          quizQuestions: [
            {
              question: 'Quel est le premier avantage de l\'IA pour les declarations fiscales ?',
              options: ['Supprimer le comptable', 'Detecter les anomalies avant envoi', 'Reduire les impots', 'Contacter les impots automatiquement'],
              correctIndex: 1,
              explanation: 'La detection d\'anomalies avant chaque declaration est le principal avantage, permettant de securiser le processus.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les echeances fiscales multiples ?',
              options: ['Elle les ignore', 'Elle les centralise dans un tableau de bord unifie', 'Elle envoie tout en meme temps', 'Elle contacte l\'administration'],
              correctIndex: 1,
              explanation: 'L\'IA centralise toutes les echeances dans un tableau de bord unifie pour une vision claire du calendrier fiscal.',
            },
            {
              question: 'Que genere l\'IA pour les variations importantes dans les liasses ?',
              options: ['Des factures correctives', 'Des notes explicatives', 'Des courriers aux impots', 'Des demandes de report'],
              correctIndex: 1,
              explanation: 'L\'IA genere des notes explicatives pour les variations significatives, facilitant le travail d\'analyse.',
            },
            {
              question: 'Quel type d\'optimisation fiscale l\'IA peut-elle suggerer ?',
              options: ['L\'evasion fiscale', 'Les credits d\'impot recherche', 'La fraude a la TVA', 'La dissimulation de revenus'],
              correctIndex: 1,
              explanation: 'L\'IA suggere des optimisations legales comme le credit d\'impot recherche, avec les references legales correspondantes.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Bilans et situations financieres
    {
      id: 'compta-m3',
      title: 'Bilans et situations financieres',
      emoji: '\u{1F4CA}',
      description: 'Generez des bilans et des situations intermediaires avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Bilan Master',
      lessons: [
        {
          id: 'compta-m3-l1',
          title: 'L\'IA pour des bilans plus rapides et fiables',
          duration: '4 min',
          type: 'text' as const,
          content: `La preparation du bilan annuel est le moment le plus intense de l\'annee pour un cabinet comptable. Revue des comptes, justification des soldes, calcul des provisions, ecritures d\'inventaire — chaque poste doit etre verifie et documente. L\'IA peut reduire ce processus de plusieurs jours a quelques heures tout en ameliorant la fiabilite.

L\'assistant Freenzy commence par un audit automatique de la balance generale. Il compare chaque compte avec les pieces justificatives associees et signale les ecarts. Les rapprochements bancaires sont effectues automatiquement, les factures non lettrees sont identifiees et les provisions pour creances douteuses sont calculees selon les regles definies pour chaque client.

Pour les ecritures d\'inventaire, l\'IA calcule automatiquement les amortissements selon les plans definis, les provisions pour conges payes, les charges a payer et les produits constates d\'avance. Elle detecte aussi les ecritures inhabituelles qui meriteraient une verification : un solde crediteur sur un compte de charge, un fournisseur avec un solde anormalement ancien, un compte de TVA dont le solde ne correspond pas a la derniere declaration.

Les situations intermediaires deviennent un jeu d\'enfant. Au lieu d\'attendre la cloture annuelle, vous pouvez generer une situation mensuelle ou trimestrielle en quelques clics. L\'IA extrapole les ecritures d\'inventaire manquantes et produit un bilan et un compte de resultat provisoires fiables a plus de 97%. Vos clients disposent ainsi d\'une vision en temps reel de leur sante financiere.

Le dossier de revision est aussi genere automatiquement. L\'IA produit les feuilles de travail pour chaque cycle comptable avec les justificatifs associes et les commentaires pertinents. Le collaborateur n\'a plus qu\'a valider et completer les points specifiques qui necessitent un jugement humain.`,
          xpReward: 15,
        },
        {
          id: 'compta-m3-l2',
          title: 'Jeu : Detecter les anomalies de bilan',
          duration: '3 min',
          type: 'game' as const,
          content: 'Identifiez les anomalies dans un bilan genere par l\'IA.',
          exercisePrompt: `Voici un extrait de balance generale d\'une entreprise de services (exercice clos au 31/12) :
- Compte 411 Clients : 125 000 EUR (dont 35 000 EUR date de plus de 6 mois)
- Compte 401 Fournisseurs : -5 000 EUR (solde debiteur)
- Compte 6811 Dotations amortissements : 0 EUR
- Compte 44566 TVA deductible : 18 500 EUR
- Compte 512 Banque : -2 300 EUR (ne correspond pas au releve : -1 800 EUR)

Pour chaque ligne, indiquez :
1. S\'il y a une anomalie ou non
2. Quelle verification vous demanderiez a l\'IA
3. Quelle ecriture corrective pourrait etre necessaire
4. Comment prevenir cette anomalie a l\'avenir`,
          xpReward: 20,
        },
        {
          id: 'compta-m3-l3',
          title: 'Quiz — Bilans financiers',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos acquis sur la preparation des bilans avec l\'IA.',
          quizQuestions: [
            {
              question: 'De combien l\'IA peut-elle reduire le temps de preparation du bilan ?',
              options: ['De 10%', 'De 25%', 'De plusieurs jours a quelques heures', 'Elle ne change rien'],
              correctIndex: 2,
              explanation: 'L\'IA peut reduire la preparation du bilan de plusieurs jours a quelques heures tout en ameliorant la fiabilite.',
            },
            {
              question: 'Quelle fiabilite atteignent les situations intermediaires generees par l\'IA ?',
              options: ['80%', '90%', '95%', '97%'],
              correctIndex: 3,
              explanation: 'Les situations intermediaires produites par l\'IA sont fiables a plus de 97% grace a l\'extrapolation des ecritures d\'inventaire.',
            },
            {
              question: 'Qu\'est-ce qu\'un solde crediteur sur un compte de charge signale par l\'IA ?',
              options: ['Un fonctionnement normal', 'Une anomalie a verifier', 'Une optimisation fiscale', 'Un amortissement'],
              correctIndex: 1,
              explanation: 'Un solde crediteur sur un compte de charge est inhabituel et merite une verification pour s\'assurer qu\'il n\'y a pas d\'erreur d\'imputation.',
            },
            {
              question: 'Que produit l\'IA pour le dossier de revision ?',
              options: ['Le rapport du commissaire aux comptes', 'Les feuilles de travail par cycle avec justificatifs', 'La liasse fiscale uniquement', 'Le rapport de gestion'],
              correctIndex: 1,
              explanation: 'L\'IA genere les feuilles de travail pour chaque cycle comptable avec justificatifs et commentaires pertinents.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Reporting client automatise
    {
      id: 'compta-m4',
      title: 'Reporting client automatise',
      emoji: '\u{1F4C8}',
      description: 'Generez des rapports financiers clairs et personnalises pour vos clients.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C8}',
      badgeName: 'Report Expert',
      lessons: [
        {
          id: 'compta-m4-l1',
          title: 'Des rapports clients qui font la difference',
          duration: '4 min',
          type: 'text' as const,
          content: `Le reporting client est devenu un element differenciateur majeur pour les cabinets comptables. Les chefs d\'entreprise ne veulent plus attendre le bilan annuel pour connaitre leur situation financiere. Ils attendent de leur expert-comptable des tableaux de bord clairs, des alertes proactives et des conseils actionables. L\'IA permet de repondre a cette attente sans exploser votre charge de travail.

L\'assistant Freenzy genere automatiquement des rapports mensuels personnalises pour chaque client. Le contenu s\'adapte au profil du dirigeant : un rapport synthetique avec graphiques pour le patron presse, un rapport detaille avec ratios financiers pour le directeur financier, un resume en langage simple pour l\'entrepreneur qui n\'est pas familier avec la comptabilite. Chaque rapport est envoye par email au format PDF avec un resume en deux lignes.

Les indicateurs cles sont calcules automatiquement : marge brute, tresorerie nette, BFR, delai moyen de paiement clients et fournisseurs, point mort, capacite d\'autofinancement. L\'IA compare ces indicateurs avec les mois precedents et avec les moyennes du secteur d\'activite. Elle genere des commentaires explicatifs pour chaque variation significative, permettant au client de comprendre immediatement sa situation.

Le systeme d\'alertes proactives est particulierement apprecie des clients. L\'IA detecte les tendances preoccupantes avant qu\'elles ne deviennent critiques : degradation de la tresorerie, allongement des delais de paiement, baisse de marge sur un produit specifique. Le comptable recoit une notification et peut contacter son client avec une recommandation concrete plutot que d\'attendre la prochaine echeance.

Vous pouvez aussi personnaliser les rapports avec les couleurs et le logo de votre cabinet, renforçant ainsi votre image professionnelle. L\'IA gere l\'historique complet des rapports envoyes et peut generer des comparatifs pluriannuels en un clic.`,
          xpReward: 15,
        },
        {
          id: 'compta-m4-l2',
          title: 'Exercice : Creer un reporting mensuel',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Concevez un rapport mensuel automatise pour un client.',
          exercisePrompt: `Votre client est une boulangerie artisanale qui realise 350 000 EUR de CA annuel avec 5 salaries. Le gerant est un artisan passione mais peu a l\'aise avec les chiffres.

Concevez le rapport mensuel ideal avec l\'assistant Freenzy :
1. Choisissez les 5 indicateurs cles les plus pertinents pour ce type de commerce
2. Definissez le format du rapport (graphiques, texte, emojis, comparatifs)
3. Etablissez 3 seuils d\'alerte adaptes a son activite
4. Redigez un exemple de commentaire automatique pour une baisse de marge de 3 points
5. Proposez un calendrier d\'envoi et le canal de communication ideal`,
          xpReward: 20,
        },
        {
          id: 'compta-m4-l3',
          title: 'Quiz — Reporting client',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur le reporting client automatise.',
          quizQuestions: [
            {
              question: 'Pourquoi personnaliser le format du rapport selon le profil du dirigeant ?',
              options: ['Pour justifier des honoraires plus eleves', 'Pour que le client comprenne et utilise reellement les informations', 'Pour impressionner la concurrence', 'Pour respecter une obligation legale'],
              correctIndex: 1,
              explanation: 'Un rapport adapte au profil du dirigeant est reellement lu et utilise, ce qui renforce la valeur perçue du cabinet.',
            },
            {
              question: 'Quel indicateur mesure le besoin de financement du cycle d\'exploitation ?',
              options: ['La marge brute', 'Le BFR', 'Le point mort', 'La CAF'],
              correctIndex: 1,
              explanation: 'Le BFR (Besoin en Fonds de Roulement) mesure le besoin de financement lie au decalage entre encaissements et decaissements.',
            },
            {
              question: 'Avec quoi l\'IA compare-t-elle les indicateurs du client ?',
              options: ['Avec des objectifs arbitraires', 'Avec les mois precedents et les moyennes sectorielles', 'Avec les concurrents directs', 'Avec les normes internationales'],
              correctIndex: 1,
              explanation: 'L\'IA compare avec l\'historique du client et les moyennes du secteur pour une analyse pertinente.',
            },
            {
              question: 'Quel est l\'avantage principal des alertes proactives ?',
              options: ['Facturer des interventions supplementaires', 'Detecter les tendances preoccupantes avant qu\'elles ne deviennent critiques', 'Envoyer plus d\'emails aux clients', 'Remplacer les rendez-vous en cabinet'],
              correctIndex: 1,
              explanation: 'Les alertes proactives permettent d\'anticiper les problemes et de conseiller le client avant qu\'il ne soit trop tard.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Veille fiscale et reglementaire
    {
      id: 'compta-m5',
      title: 'Veille fiscale et reglementaire',
      emoji: '\u{1F4F0}',
      description: 'Restez informe des evolutions fiscales et reglementaires grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4F0}',
      badgeName: 'Veilleur Fiscal',
      lessons: [
        {
          id: 'compta-m5-l1',
          title: 'Ne plus jamais rater une evolution fiscale',
          duration: '4 min',
          type: 'text' as const,
          content: `Le droit fiscal evolue en permanence. Chaque loi de finances apporte son lot de modifications, les rescrits fiscaux clarifient des situations particulieres, et la jurisprudence cree regulierement de nouvelles interpretations. Pour un cabinet comptable, rester a jour est a la fois essentiel et extremement chronophage. L\'IA transforme cette veille en processus automatise et intelligent.

L\'assistant Freenzy surveille en continu les sources officielles : Journal Officiel, Bulletin Officiel des Finances Publiques, decisions du Conseil d\'Etat, publications de l\'Ordre des experts-comptables. Chaque nouvelle publication est analysee et classee par theme et par impact potentiel sur vos dossiers clients. Vous recevez un resume quotidien des evolutions pertinentes, redige en langage clair et accompagne d\'exemples concrets.

Le systeme va plus loin qu\'une simple revue de presse. L\'IA croise chaque nouvelle mesure avec votre portefeuille de clients pour identifier ceux qui sont directement concernes. Par exemple, si un nouveau credit d\'impot est cree pour les entreprises investissant dans la transition ecologique, l\'IA identifie immediatement les clients eligibles et vous propose un modele de courrier pour les informer. Cette proactivite renforce considerablement la relation client.

La veille couvre aussi les obligations declaratives. Quand une nouvelle obligation entre en vigueur, l\'IA l\'ajoute automatiquement au calendrier fiscal de vos clients concernes et vous alerte suffisamment en avance pour preparer la premiere declaration. Plus de risque d\'oublier une echeance nouvellement creee ou une modification de date limite.

L\'IA constitue aussi une base de connaissances interrogeable. Vous pouvez lui poser des questions specifiques comme un cas de TVA sur marge pour un vehicule d\'occasion importe, et elle vous fournit la reponse avec les references legales, les rescrits applicables et la jurisprudence recente. Un gain de temps enorme par rapport a la recherche manuelle dans les bases documentaires.`,
          xpReward: 15,
        },
        {
          id: 'compta-m5-l2',
          title: 'Exercice : Configurer sa veille intelligente',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Parametrez votre systeme de veille fiscale automatisee.',
          exercisePrompt: `Votre cabinet gere 120 dossiers clients repartis ainsi : 60 TPE (artisans, commercants), 40 PME (services, industrie), 15 professions liberales, 5 associations.

Configurez votre veille fiscale intelligente avec Freenzy :
1. Definissez les 5 themes de veille prioritaires pour votre portefeuille
2. Choisissez la frequence et le format des alertes (quotidien, hebdo, par theme)
3. Etablissez les regles de croisement automatique avec vos dossiers clients
4. Redigez un exemple d\'alerte client pour un changement de seuil de TVA
5. Proposez un workflow de diffusion interne pour que tous les collaborateurs du cabinet soient informes`,
          xpReward: 20,
        },
        {
          id: 'compta-m5-l3',
          title: 'Quiz — Veille fiscale',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur la veille fiscale automatisee.',
          quizQuestions: [
            {
              question: 'Quelles sources l\'IA surveille-t-elle pour la veille fiscale ?',
              options: ['Uniquement les journaux economiques', 'Le Journal Officiel, le BOFiP, le Conseil d\'Etat, l\'Ordre', 'Wikipedia et les blogs comptables', 'Les reseaux sociaux uniquement'],
              correctIndex: 1,
              explanation: 'L\'IA surveille les sources officielles : JO, BOFiP, Conseil d\'Etat et publications de l\'Ordre des experts-comptables.',
            },
            {
              question: 'Que fait l\'IA quand un nouveau credit d\'impot est cree ?',
              options: ['Elle ne fait rien', 'Elle identifie les clients eligibles et propose un courrier', 'Elle inscrit automatiquement les clients', 'Elle contacte l\'administration fiscale'],
              correctIndex: 1,
              explanation: 'L\'IA croise la mesure avec le portefeuille clients, identifie les eligibles et propose un modele de communication.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les nouvelles obligations declaratives ?',
              options: ['Elle les ignore jusqu\'a la prochaine mise a jour', 'Elle les ajoute automatiquement au calendrier fiscal des clients concernes', 'Elle envoie une lettre aux impots', 'Elle supprime les anciennes obligations'],
              correctIndex: 1,
              explanation: 'L\'IA ajoute automatiquement les nouvelles obligations au calendrier et alerte suffisamment en avance.',
            },
            {
              question: 'Quel avantage offre la base de connaissances interrogeable de l\'IA ?',
              options: ['Remplacer l\'expert-comptable', 'Repondre a des questions fiscales precises avec references legales', 'Generer des factures automatiquement', 'Communiquer avec les impots'],
              correctIndex: 1,
              explanation: 'La base fournit des reponses avec references legales, rescrits et jurisprudence, bien plus vite qu\'une recherche manuelle.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Audit et controle interne
    {
      id: 'compta-m6',
      title: 'Audit et controle interne',
      emoji: '\u{1F50D}',
      description: 'Utilisez l\'IA pour renforcer vos procedures d\'audit et de controle interne.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Auditeur IA',
      lessons: [
        {
          id: 'compta-m6-l1',
          title: 'L\'audit intelligent par IA',
          duration: '4 min',
          type: 'text' as const,
          content: `L\'audit comptable traditionnel repose sur des sondages et des echantillons. Le reviseur ne peut pas verifier chaque ecriture, il selectionne donc des echantillons representatifs et extrapole ses conclusions. L\'IA change fondamentalement cette approche en permettant un audit exhaustif de toutes les ecritures, a un cout et une vitesse incomparables.

Avec Freenzy, l\'audit couvre 100% des transactions plutot que des echantillons. L\'IA applique des regles de controle sur chaque ecriture : respect du principe de partie double, coherence des dates, conformite des libelles, adequation du compte utilise. Elle detecte les ecritures passees en dehors des heures de bureau, les montants ronds suspects, les operations inhabituelles juste avant la cloture et les ecritures sans piece justificative associee.

L\'analyse des flux financiers est particulierement puissante. L\'IA cartographie les circuits de paiement, identifie les operations circulaires, repere les paiements fractionnes juste sous les seuils de controle et detecte les beneficiaires inhabituels. Ces analyses, impossibles a realiser manuellement sur des milliers de transactions, sont effectuees en quelques minutes.

Le controle interne beneficie aussi de l\'IA. Le systeme verifie en continu la separation des taches, signale quand un meme utilisateur saisit et valide une operation, et alerte sur les droits d\'acces anormalement etendus. Il produit un rapport de controle interne avec des recommandations classees par niveau de risque et des plans d\'action concrets.

Pour les missions de commissariat aux comptes, l\'IA prepare le dossier permanent et le dossier annuel avec les diligences standard pre-remplies. Elle genere les confirmations de tiers, les circularisations bancaires et les lettres d\'affirmation. Le commissaire aux comptes peut ainsi se concentrer sur les zones de risque plutot que sur la logistique administrative de la mission.`,
          xpReward: 15,
        },
        {
          id: 'compta-m6-l2',
          title: 'Jeu : L\'auditeur IA',
          duration: '3 min',
          type: 'game' as const,
          content: 'Menez un audit automatise et identifiez les anomalies.',
          exercisePrompt: `Vous realisez l\'audit d\'une entreprise de negoce (CA 2M EUR, 12 salaries). L\'IA a identifie les alertes suivantes :

1. 15 ecritures de caisse passees le dimanche (entreprise fermee le dimanche)
2. Un virement de 49 900 EUR vers un compte inconnu (seuil de controle a 50 000 EUR)
3. 3 factures fournisseurs avec des numeros sequentiels parfaits (001, 002, 003)
4. Augmentation de 180% des charges de sous-traitance au dernier trimestre
5. Ecart de 0,12 EUR sur le rapprochement bancaire du compte principal

Pour chaque alerte :
1. Evaluez le niveau de risque (faible, moyen, eleve, critique)
2. Expliquez pourquoi l\'IA a genere cette alerte
3. Definissez la procedure de verification a suivre
4. Indiquez la conclusion possible (erreur, fraude, faux positif)`,
          xpReward: 20,
        },
        {
          id: 'compta-m6-l3',
          title: 'Quiz — Audit et controle',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur l\'audit par IA.',
          quizQuestions: [
            {
              question: 'Quelle est la difference majeure entre l\'audit traditionnel et l\'audit par IA ?',
              options: ['L\'IA est moins fiable', 'L\'IA analyse 100% des transactions au lieu d\'echantillons', 'L\'IA ne peut pas detecter la fraude', 'L\'IA remplace le commissaire aux comptes'],
              correctIndex: 1,
              explanation: 'L\'IA permet un audit exhaustif de toutes les ecritures, la ou l\'audit traditionnel repose sur des echantillons.',
            },
            {
              question: 'Que signale l\'IA quand un paiement est juste sous un seuil de controle ?',
              options: ['C\'est normal', 'C\'est un fractionnement suspect', 'C\'est une erreur d\'arrondi', 'C\'est une optimisation'],
              correctIndex: 1,
              explanation: 'Un paiement juste sous le seuil de controle peut indiquer un fractionnement volontaire pour echapper aux verifications.',
            },
            {
              question: 'Quel principe de controle interne l\'IA verifie-t-elle en continu ?',
              options: ['Le principe de prudence', 'La separation des taches', 'Le principe de continuite', 'Le principe d\'importance relative'],
              correctIndex: 1,
              explanation: 'L\'IA verifie la separation des taches en signalant quand un meme utilisateur saisit et valide une operation.',
            },
            {
              question: 'En combien de temps l\'IA analyse-t-elle des milliers de transactions ?',
              options: ['Quelques jours', 'Quelques heures', 'Quelques minutes', 'Quelques semaines'],
              correctIndex: 2,
              explanation: 'L\'IA analyse des milliers de transactions en quelques minutes, ce qui serait impossible manuellement.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// =============================================================================
// 2. IA pour Agents Immobiliers
// =============================================================================

export const parcoursImmoIA: FormationParcours = {
  id: 'agent-immo-ia',
  title: 'IA pour Agents Immobiliers',
  emoji: '\u{1F3E0}',
  description: 'Boostez votre activite immobiliere avec l\'IA : annonces optimisees, estimation de prix, prospection, CRM intelligent, visites virtuelles et negociation assistee.',
  category: 'metier',
  subcategory: 'immobilier',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#EF4444',
  diplomaTitle: 'Agent Immo Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Agents Immobiliers',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Annonces immobilieres optimisees
    {
      id: 'immo-m1',
      title: 'Annonces immobilieres optimisees',
      emoji: '\u{1F4F2}',
      description: 'Redigez des annonces immobilieres percutantes et optimisees par l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4F2}',
      badgeName: 'Redacteur Immo',
      lessons: [
        {
          id: 'immo-m1-l1',
          title: 'Des annonces qui convertissent grace a l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `Dans l\'immobilier, l\'annonce est votre vitrine. C\'est le premier contact entre un bien et un acheteur potentiel. Pourtant, la plupart des annonces se ressemblent : des descriptions generiques, des photos mal cadrees et des informations incomplete. L\'IA peut transformer chacune de vos annonces en un outil de vente performant qui genere des appels qualifies.

L\'assistant Freenzy redige des descriptions uniques et engageantes a partir des caracteristiques du bien. Vous lui fournissez les donnees brutes — surface, nombre de pieces, etage, exposition, DPE, quartier — et il genere un texte qui met en valeur les points forts tout en restant factuel. L\'IA adapte le ton selon la cible : un studio etudiant ne se decrit pas comme une villa familiale. Elle integre les mots-cles les plus recherches sur les portails immobiliers pour maximiser la visibilite.

L\'optimisation des photos est un atout majeur. L\'IA analyse chaque photo et suggere des ameliorations : luminosite, cadrage, ordre de presentation. Elle peut meme generer des descriptions alternatives de chaque photo pour les portails qui le permettent. Pour les biens vides, elle propose des rendus de home staging virtuel qui aident les acheteurs a se projeter.

Le systeme genere aussi automatiquement les versions pour chaque portail immobilier. Chaque plateforme a ses propres contraintes de format, de longueur et de champs obligatoires. L\'IA adapte votre annonce pour SeLoger, LeBonCoin, Logic-Immo et Bien\'ici en un clic, sans que vous ayez a reformater manuellement chaque version.

L\'IA analyse enfin les performances de vos annonces : nombre de vues, taux de clics, nombre d\'appels generes. Elle identifie les annonces sous-performantes et propose des optimisations concretes. Un titre different, une premiere photo plus impactante ou un prix repositionne peuvent multiplier par trois le nombre de contacts recus.`,
          xpReward: 15,
        },
        {
          id: 'immo-m1-l2',
          title: 'Exercice : Rediger une annonce optimisee',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Creez une annonce immobiliere performante avec l\'IA.',
          exercisePrompt: `Voici les caracteristiques d\'un bien a vendre :
- Appartement T3, 68m2, 3eme etage avec ascenseur
- Quartier Bastille, Paris 11e
- 2 chambres, sejour lumineux, cuisine equipee
- Balcon 5m2 exposition sud, vue degagee
- DPE C, double vitrage, parquet ancien
- Cave et place de parking en sous-sol
- Copropriete bien entretenue, charges 180 EUR/mois
- Prix : 520 000 EUR

Avec l\'assistant Freenzy :
1. Redigez le titre accrocheur (max 80 caracteres)
2. Redigez la description complete (150-200 mots)
3. Identifiez les 5 mots-cles a integrer pour le referencement
4. Proposez l\'ordre ideal des photos (12 photos disponibles)
5. Suggerez une variante du titre pour les portails qui limitent a 50 caracteres`,
          xpReward: 20,
        },
        {
          id: 'immo-m1-l3',
          title: 'Quiz — Annonces immobilieres',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur l\'optimisation d\'annonces immobilieres.',
          quizQuestions: [
            {
              question: 'Pourquoi l\'IA adapte-t-elle le ton de l\'annonce selon la cible ?',
              options: ['Pour paraitre plus intelligent', 'Parce qu\'un studio etudiant ne se decrit pas comme une villa familiale', 'Pour respecter la loi', 'Pour augmenter le prix'],
              correctIndex: 1,
              explanation: 'Chaque type de bien a un public cible different, et le ton doit etre adapte pour parler efficacement a cette audience.',
            },
            {
              question: 'Que propose l\'IA pour les biens vides ?',
              options: ['De baisser le prix', 'Du home staging virtuel', 'De retirer les photos', 'D\'attendre un locataire'],
              correctIndex: 1,
              explanation: 'Le home staging virtuel aide les acheteurs a se projeter dans un bien vide en montrant des amenagements possibles.',
            },
            {
              question: 'Combien de fois plus de contacts une annonce optimisee peut-elle generer ?',
              options: ['1,5 fois', '2 fois', '3 fois', '5 fois'],
              correctIndex: 2,
              explanation: 'Un titre different, une premiere photo impactante ou un prix repositionne peuvent multiplier par trois les contacts recus.',
            },
            {
              question: 'Pourquoi l\'IA genere-t-elle plusieurs versions d\'une annonce ?',
              options: ['Pour tromper les acheteurs', 'Parce que chaque portail a ses propres contraintes de format', 'Pour publier des annonces differentes', 'Pour eviter les doublons'],
              correctIndex: 1,
              explanation: 'Chaque plateforme (SeLoger, LeBonCoin, etc.) a ses propres contraintes de format, longueur et champs obligatoires.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Estimation de prix par IA
    {
      id: 'immo-m2',
      title: 'Estimation de prix par IA',
      emoji: '\u{1F4B0}',
      description: 'Estimez la valeur des biens immobiliers avec precision grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Estimateur Pro',
      lessons: [
        {
          id: 'immo-m2-l1',
          title: 'L\'estimation immobiliere augmentee par l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `L\'estimation du prix d\'un bien est l\'acte fondateur de toute transaction immobiliere. Une estimation trop haute fait fuir les acheteurs et allonge les delais de vente. Une estimation trop basse fait perdre de l\'argent au vendeur et entame votre credibilite. L\'IA apporte une precision et une objectivite qui renforcent considerablement la qualite de vos estimations.

L\'assistant Freenzy analyse en temps reel les transactions recentes dans le secteur grace aux bases de donnees DVF (Demandes de Valeurs Foncieres) et aux donnees notariales. Il ne se contente pas de calculer un prix au metre carre moyen : il prend en compte des dizaines de criteres specifiques au bien — etage, exposition, vue, etat general, performance energetique, proximite des transports, commerces et ecoles. Le modele de calcul s\'affine continuellement avec chaque nouvelle transaction enregistree.

L\'analyse comparative est particulierement detaillee. L\'IA identifie les biens comparables vendus recemment et ajuste le prix en fonction des differences : un balcon ajoute entre 5 et 15% selon la ville, un dernier etage sans ascenseur decote de 10 a 20%, un DPE F ou G implique une decote de 10 a 15% depuis la loi Climat. Chaque ajustement est documente et justifie, ce qui vous donne des arguments solides face au vendeur.

L\'IA integre aussi les tendances du marche local. Elle analyse l\'evolution des prix sur les 6 derniers mois, le nombre de biens en vente dans le quartier, le delai moyen de vente et le taux de negociation. Ces donnees vous permettent de positionner le bien de maniere optimale : un marche porteur autorise un prix plus ambitieux, tandis qu\'un marche detourne impose un positionnement competitif.

Le rapport d\'estimation genere par l\'IA est un outil commercial puissant. Present sous forme de document PDF professionnel avec graphiques et comparatifs, il impressionne le vendeur par son serieux et renforce votre position d\'expert. Vous pouvez le personnaliser avec les couleurs de votre agence.`,
          xpReward: 15,
        },
        {
          id: 'immo-m2-l2',
          title: 'Exercice : Estimer un bien avec l\'IA',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Realisez une estimation immobiliere complete assistee par IA.',
          exercisePrompt: `Vous devez estimer un bien pour un proprietaire qui souhaite vendre :
- Maison individuelle, 120m2 habitable, terrain 450m2
- Commune de 15 000 habitants en peripherie de Lyon (15 min en voiture)
- 4 chambres, 2 salles de bain, garage double
- Construction 1985, toiture refaite en 2020
- DPE D, chauffage gaz, simple vitrage etage
- Piscine hors-sol, terrasse 25m2

Avec l\'assistant Freenzy :
1. Listez les criteres de valorisation et de decote de ce bien
2. Identifiez les donnees comparatives a rechercher (DVF, portails)
3. Proposez une fourchette de prix avec justification
4. Redigez 3 arguments pour defendre votre estimation face au proprietaire
5. Suggerez les travaux qui offriraient le meilleur retour sur investissement`,
          xpReward: 20,
        },
        {
          id: 'immo-m2-l3',
          title: 'Quiz — Estimation immobiliere',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur l\'estimation assistee par IA.',
          quizQuestions: [
            {
              question: 'Quelle base de donnees publique l\'IA utilise-t-elle pour les prix de vente ?',
              options: ['SeLoger', 'Les DVF (Demandes de Valeurs Foncieres)', 'LeBonCoin', 'Google Maps'],
              correctIndex: 1,
              explanation: 'Les DVF sont les donnees de transactions immobilieres publiees par la DGFiP, source la plus fiable pour les prix reels.',
            },
            {
              question: 'Quelle decote un DPE F ou G implique-t-il depuis la loi Climat ?',
              options: ['0 a 5%', '5 a 10%', '10 a 15%', '20 a 30%'],
              correctIndex: 2,
              explanation: 'Un DPE F ou G implique une decote de 10 a 15% depuis la loi Climat en raison des obligations de renovation energetique.',
            },
            {
              question: 'Pourquoi l\'IA analyse-t-elle les tendances du marche local ?',
              options: ['Pour predire les cours de la bourse', 'Pour positionner le bien de maniere optimale selon le contexte', 'Pour calculer les impots fonciers', 'Pour estimer les loyers'],
              correctIndex: 1,
              explanation: 'Les tendances locales permettent d\'adapter le positionnement prix : plus ambitieux en marche porteur, competitif en marche detourne.',
            },
            {
              question: 'Quel est l\'avantage du rapport d\'estimation PDF genere par l\'IA ?',
              options: ['Il est obligatoire legalement', 'Il renforce votre position d\'expert aupres du vendeur', 'Il remplace le diagnostic immobilier', 'Il est envoye aux banques automatiquement'],
              correctIndex: 1,
              explanation: 'Le rapport professionnel avec graphiques et comparatifs impressionne le vendeur et renforce votre credibilite d\'expert.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Prospection immobiliere intelligente
    {
      id: 'immo-m3',
      title: 'Prospection immobiliere intelligente',
      emoji: '\u{1F50E}',
      description: 'Trouvez de nouveaux mandats et acheteurs grace a la prospection automatisee par IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F50E}',
      badgeName: 'Prospecteur Pro',
      lessons: [
        {
          id: 'immo-m3-l1',
          title: 'Revolutionner la prospection immobiliere',
          duration: '4 min',
          type: 'text' as const,
          content: `La prospection est le nerf de la guerre pour tout agent immobilier. Sans mandats, pas de ventes. Mais la prospection traditionnelle — porte-a-porte, boitage, piges telephoniques — est chronophage et souvent decourageante avec un taux de conversion tres faible. L\'IA permet de cibler les bons prospects au bon moment, multipliant l\'efficacite de vos efforts commerciaux.

L\'assistant Freenzy analyse les signaux faibles qui indiquent une intention de vente. Les annonces de particuliers sur LeBonCoin, les changements de situation familiale detectes sur les reseaux sociaux, les successions recentes, les mutations professionnelles — chaque signal est capture et transforme en opportunite de contact. L\'IA classe les prospects par probabilite de passage a l\'acte et vous recommande les actions les plus pertinentes pour chacun.

La pige immobiliere est automatisee et intelligente. L\'IA surveille en continu les nouvelles annonces de particuliers sur tous les portails et vous alerte immediatement quand un bien correspond a votre zone de chalandise. Elle prepare un argumentaire personnalise pour chaque contact : estimation comparative du prix, analyse des points faibles de l\'annonce, proposition de services specifiques. Le premier appel est ainsi beaucoup plus impactant qu\'un demarchage generique.

Le boitage digital remplace les flyers papier. L\'IA genere des campagnes d\'emailing et de SMS ciblees par quartier, par type de bien ou par profil de proprietaire. Chaque message est personnalise avec des donnees locales : dernieres ventes dans la rue, evolution des prix du quartier, temps moyen de vente. Le taux de retour de ces campagnes intelligentes est cinq a sept fois superieur a celui du boitage papier traditionnel.

L\'IA optimise aussi votre presence locale en generant du contenu pertinent pour vos reseaux sociaux : analyses de marche par quartier, conseils de valorisation, actualites immobilieres locales. Cette strategie de contenu vous positionne comme l\'expert referent de votre secteur et genere des contacts entrants qualifies.`,
          xpReward: 15,
        },
        {
          id: 'immo-m3-l2',
          title: 'Jeu : Identifier les meilleurs prospects',
          duration: '3 min',
          type: 'game' as const,
          content: 'Analysez des profils et classez-les par potentiel de mandat.',
          exercisePrompt: `L\'IA a identifie 5 prospects dans votre secteur. Classez-les par ordre de priorite et justifiez votre approche pour chacun :

1. Mme Dupont, 72 ans, veuve depuis 6 mois, proprietaire d\'une maison 5 pieces (seule)
2. M. Martin, annonce PAP sur LeBonCoin depuis 3 mois, prix au-dessus du marche de 15%
3. Famille Petit, mutation professionnelle confirmee vers Bordeaux dans 4 mois
4. M. Leroy, investisseur, 3 appartements en location, un locataire parti il y a 2 mois
5. Mme Garcia, divorce en cours, maison en indivision avec son ex-conjoint

Pour chaque prospect :
1. Evaluez la probabilite de mandat (faible/moyenne/forte)
2. Definissez le meilleur canal de contact (telephone, email, courrier, visite)
3. Redigez la premiere phrase d\'accroche personnalisee
4. Identifiez le service specifique a proposer en priorite`,
          xpReward: 20,
        },
        {
          id: 'immo-m3-l3',
          title: 'Quiz — Prospection IA',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur la prospection immobiliere automatisee.',
          quizQuestions: [
            {
              question: 'Quels signaux l\'IA detecte-t-elle pour identifier les vendeurs potentiels ?',
              options: ['La meteo locale', 'Les annonces PAP, successions, mutations, changements familiaux', 'Les resultats sportifs', 'Les cours de la bourse'],
              correctIndex: 1,
              explanation: 'L\'IA analyse les signaux faibles comme les annonces de particuliers, successions, mutations et changements de situation familiale.',
            },
            {
              question: 'Combien de fois plus efficace est le boitage digital par rapport au papier ?',
              options: ['2 fois', '3 fois', '5 a 7 fois', '10 fois'],
              correctIndex: 2,
              explanation: 'Les campagnes digitales personnalisees ont un taux de retour 5 a 7 fois superieur au boitage papier traditionnel.',
            },
            {
              question: 'Que prepare l\'IA pour chaque contact de pige ?',
              options: ['Un contrat de vente', 'Un argumentaire personnalise avec estimation et analyse', 'Un cheque de caution', 'Un plan de financement'],
              correctIndex: 1,
              explanation: 'L\'IA prepare un argumentaire personnalise incluant estimation comparative, analyse des faiblesses de l\'annonce et proposition de services.',
            },
            {
              question: 'Quelle strategie l\'IA met-elle en place pour generer des contacts entrants ?',
              options: ['Des publicites televisees', 'Du contenu local sur les reseaux sociaux', 'Des panneaux publicitaires', 'Des appels a froid'],
              correctIndex: 1,
              explanation: 'La generation de contenu local pertinent sur les reseaux sociaux positionne l\'agent comme expert referent et attire des contacts qualifies.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — CRM immobilier intelligent
    {
      id: 'immo-m4',
      title: 'CRM immobilier intelligent',
      emoji: '\u{1F4CB}',
      description: 'Gerez votre portefeuille clients et biens avec un CRM propulse par l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'CRM Master',
      lessons: [
        {
          id: 'immo-m4-l1',
          title: 'Un CRM qui travaille pour vous',
          duration: '4 min',
          type: 'text' as const,
          content: `Un agent immobilier gere en permanence des dizaines de contacts, de biens et de transactions a differents stades d\'avancement. Sans un systeme performant, des opportunites passent entre les mailles du filet : un acheteur oublie, un rappel manque, un mandat qui expire sans avoir ete renouvel. L\'IA transforme le CRM en assistant proactif qui vous garantit de ne rien laisser tomber.

L\'assistant Freenzy organise automatiquement vos contacts en segments intelligents. Les acheteurs sont classes par budget, zone recherchee, criteres prioritaires et niveau de motivation. Les vendeurs sont suivis avec l\'historique complet de chaque interaction. L\'IA detecte les correlations entre acheteurs et biens disponibles et vous suggere les rapprochements les plus pertinents, bien au-dela d\'un simple filtre par prix et surface.

Le matching intelligent est la fonctionnalite la plus puissante. Quand un nouveau bien entre en portefeuille, l\'IA identifie instantanement les acheteurs potentiels et les classe par probabilite de match. Elle prend en compte non seulement les criteres declares mais aussi les criteres implicites deduits des visites precedentes. Un acheteur qui a visite trois appartements avec balcon sans le demander explicitement recevra en priorite les biens avec exterieur.

Le suivi relationnel est automatise mais personnalise. L\'IA programme les relances au bon moment avec le bon message. Un acheteur qui n\'a pas donne de nouvelles depuis deux semaines recoit un email avec les nouvelles parutions correspondant a ses criteres. Un vendeur dont le bien est en ligne depuis un mois recoit une analyse de marche actualisee avec des recommandations. Chaque communication semble personnelle alors qu\'elle est generee automatiquement.

Les tableaux de bord vous donnent une vision claire de votre activite : pipeline de ventes, taux de transformation par etape, delai moyen de transaction, chiffre d\'affaires previsionnel. L\'IA identifie les goulots d\'etranglement dans votre processus et propose des actions correctives concretes. Vous pilotez votre activite avec des donnees plutot qu\'avec l\'intuition.`,
          xpReward: 15,
        },
        {
          id: 'immo-m4-l2',
          title: 'Exercice : Configurer le matching IA',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Parametrez le matching intelligent entre acheteurs et biens.',
          exercisePrompt: `Vous avez 3 biens en portefeuille et 5 acheteurs actifs. Utilisez l\'assistant Freenzy pour optimiser les rapprochements.

Biens :
A. T3, 65m2, Paris 20e, 380 000 EUR, 2e etage sans ascenseur, calme
B. T4, 85m2, Montreuil, 420 000 EUR, RDC jardin, proche metro
C. T2, 42m2, Paris 11e, 310 000 EUR, 5e etage ascenseur, lumineux

Acheteurs :
1. Couple 30 ans, budget 400K, cherche T3 Paris Est, teletravail
2. Famille 2 enfants, budget 450K, ecoles importantes, jardin souhaite
3. Investisseur, budget 320K, cherche rendement locatif, petite surface
4. Celibataire 28 ans, budget 350K, proche vie nocturne, lumineux
5. Retraites, budget 420K, calme, sans escaliers, espace

Pour chaque combinaison acheteur-bien :
1. Attribuez un score de matching (0-100) avec justification
2. Identifiez les compromis que l\'acheteur devrait accepter
3. Redigez le message de proposition personnalise pour le meilleur match`,
          xpReward: 20,
        },
        {
          id: 'immo-m4-l3',
          title: 'Quiz — CRM immobilier',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur le CRM immobilier intelligent.',
          quizQuestions: [
            {
              question: 'Comment l\'IA detecte-t-elle les criteres implicites d\'un acheteur ?',
              options: ['En lui posant des questions', 'En analysant les visites precedentes et les preferences non declarees', 'En regardant son profil Facebook', 'En contactant son banquier'],
              correctIndex: 1,
              explanation: 'L\'IA deduit les criteres implicites en analysant les points communs des biens visites, meme non exprimes par l\'acheteur.',
            },
            {
              question: 'Quand l\'IA relance-t-elle un acheteur inactif ?',
              options: ['Jamais', 'Apres 2 semaines sans nouvelles, avec les nouvelles parutions', 'Chaque jour', 'Uniquement si le bien est vendu'],
              correctIndex: 1,
              explanation: 'Apres deux semaines d\'inactivite, l\'IA envoie un email personnalise avec les nouvelles parutions correspondant aux criteres.',
            },
            {
              question: 'Que fournit le tableau de bord de l\'IA a l\'agent ?',
              options: ['Les resultats du loto', 'Le pipeline de ventes et taux de transformation par etape', 'Les actualites immobilieres', 'Les comptes rendus de visite'],
              correctIndex: 1,
              explanation: 'Le tableau de bord donne une vision claire du pipeline, des taux de transformation, delais moyens et CA previsionnel.',
            },
            {
              question: 'Que propose l\'IA quand elle identifie un goulot d\'etranglement ?',
              options: ['De licencier des collaborateurs', 'Des actions correctives concretes', 'De baisser tous les prix', 'D\'arreter la prospection'],
              correctIndex: 1,
              explanation: 'L\'IA identifie les blocages dans le processus et propose des actions correctives basees sur les donnees.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Visites virtuelles et valorisation
    {
      id: 'immo-m5',
      title: 'Visites virtuelles et valorisation',
      emoji: '\u{1F3AC}',
      description: 'Creez des visites virtuelles et valorisez vos biens avec les outils IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AC}',
      badgeName: 'Visite Virtuelle',
      lessons: [
        {
          id: 'immo-m5-l1',
          title: 'Les visites virtuelles qui transforment l\'immobilier',
          duration: '4 min',
          type: 'text' as const,
          content: `Les visites physiques representent un cout important pour l\'agent immobilier : deplacement, temps de preparation, coordination des agendas, et souvent des visites improductives avec des acheteurs qui ne correspondent pas au bien. Les visites virtuelles propulsees par l\'IA changent la donne en permettant de qualifier les acheteurs avant meme le premier deplacement.

L\'assistant Freenzy vous accompagne dans la creation de visites virtuelles immersives. A partir de photos 360 degres prises avec votre smartphone et une optique adaptee, l\'IA assemble automatiquement un parcours de visite fluide et logique. Elle optimise chaque image, corrige la luminosite et ajoute des points d\'interet cliquables avec des informations sur les materiaux, les dimensions et les equipements de chaque piece.

Le home staging virtuel est un outil de valorisation extremement efficace. L\'IA peut meubler virtuellement un bien vide, moderniser une decoration datee ou montrer le potentiel d\'un espace apres travaux. Les acheteurs visualisent ainsi le bien dans sa version ideale, ce qui augmente significativement leur engagement emotionnel et accelere la prise de decision. Les biens avec home staging virtuel se vendent en moyenne 30% plus vite.

L\'IA genere aussi des plans 2D et 3D a partir des photos et des dimensions que vous fournissez. Ces plans sont integres a la visite virtuelle et permettent aux acheteurs de comprendre l\'agencement global du bien. Pour les projets de renovation, l\'IA peut meme proposer des variantes de redistribution des pieces avec estimation des couts de travaux.

L\'analyse comportementale des visiteurs virtuels vous fournit des insights precieux. L\'IA mesure le temps passe dans chaque piece, les zones les plus observees, les points d\'interet les plus cliques. Ces donnees vous permettent d\'adapter votre argumentaire lors de la visite physique : si un acheteur a passe trois minutes sur la terrasse en visite virtuelle, vous saurez mettre en avant cet espace lors du rendez-vous en personne.`,
          xpReward: 15,
        },
        {
          id: 'immo-m5-l2',
          title: 'Exercice : Creer une visite virtuelle',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Concevez une visite virtuelle optimisee pour un bien.',
          exercisePrompt: `Vous devez creer la visite virtuelle d\'un loft de 95m2 dans un ancien atelier industriel a Lyon.
Caracteristiques : hauteur sous plafond 4m, grandes verrieres, mezzanine, cuisine ouverte, 1 chambre en mezzanine, poutres metalliques apparentes, sol beton cire.

Avec l\'assistant Freenzy :
1. Definissez le parcours de visite ideal (ordre des pieces, points de vue)
2. Identifiez les 5 points d\'interet a mettre en avant avec descriptions
3. Proposez 3 options de home staging virtuel adaptees au bien
4. Listez les informations a afficher en overlay sur chaque piece
5. Decrivez le scenario de renovation que l\'IA pourrait proposer (ajout d\'une 2e chambre)`,
          xpReward: 20,
        },
        {
          id: 'immo-m5-l3',
          title: 'Quiz — Visites virtuelles',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur les visites virtuelles par IA.',
          quizQuestions: [
            {
              question: 'De combien le home staging virtuel accelere-t-il la vente en moyenne ?',
              options: ['10%', '20%', '30%', '50%'],
              correctIndex: 2,
              explanation: 'Les biens avec home staging virtuel se vendent en moyenne 30% plus vite grace a l\'engagement emotionnel des acheteurs.',
            },
            {
              question: 'Que mesure l\'analyse comportementale des visiteurs virtuels ?',
              options: ['Le prix qu\'ils sont prets a payer', 'Le temps passe dans chaque piece et les zones observees', 'Leur solvabilite', 'Leur adresse personnelle'],
              correctIndex: 1,
              explanation: 'L\'IA mesure le temps dans chaque piece, les zones observees et les points d\'interet cliques pour adapter l\'argumentaire.',
            },
            {
              question: 'Quel equipement suffit pour creer des photos 360 degres ?',
              options: ['Un drone professionnel', 'Un smartphone avec une optique adaptee', 'Un appareil photo reflex', 'Une camera de surveillance'],
              correctIndex: 1,
              explanation: 'Un smartphone equipe d\'une optique 360 adaptee suffit pour creer des visites virtuelles de qualite professionnelle.',
            },
            {
              question: 'Quel avantage principal offrent les visites virtuelles pour l\'agent ?',
              options: ['Eliminer toute visite physique', 'Qualifier les acheteurs avant le premier deplacement', 'Augmenter ses honoraires', 'Eviter de rencontrer les clients'],
              correctIndex: 1,
              explanation: 'Les visites virtuelles permettent de qualifier les acheteurs en amont, reduisant les visites physiques improductives.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Negociation assistee par IA
    {
      id: 'immo-m6',
      title: 'Negociation assistee par IA',
      emoji: '\u{1F91D}',
      description: 'Negociez efficacement avec l\'aide de l\'IA pour conclure vos transactions.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Negociateur Elite',
      lessons: [
        {
          id: 'immo-m6-l1',
          title: 'L\'IA comme coach de negociation immobiliere',
          duration: '4 min',
          type: 'text' as const,
          content: `La negociation est le moment de verite de toute transaction immobiliere. C\'est la ou se cristallisent les emotions, les attentes et les enjeux financiers. Un bon negociateur peut faire la difference entre une vente conclue et un dossier qui traine. L\'IA ne remplace pas l\'humain dans cette dimension relationnelle mais elle lui fournit des armes decisives pour negocier en position de force.

L\'assistant Freenzy prepare chaque negociation en analysant toutes les donnees disponibles. Cote vendeur : prix du marche, anciennete de la mise en vente, niveau de motivation, contraintes temporelles. Cote acheteur : budget reel, historique de recherche, biens visites, offres precedentes refusees. L\'IA synthetise ces informations en un brief de negociation avec la zone d\'accord probable et les leviers a actionner.

L\'analyse des offres est instantanee et multicritere. Quand un acheteur fait une offre, l\'IA ne se limite pas au prix. Elle analyse aussi les conditions suspensives, le delai de realisation, le type de financement et la solidite du dossier bancaire. Une offre a 95% du prix avec un financement acquis peut etre plus interessante qu\'une offre au prix avec un pret non encore accorde. L\'IA vous aide a presenter cette analyse au vendeur de maniere claire et objective.

La gestion des contre-offres est optimisee par simulation. L\'IA modelise differents scenarios de negociation et calcule la probabilite d\'acceptation pour chaque niveau de prix. Elle vous suggere le montant de contre-offre optimal qui maximise vos chances d\'aboutir tout en preservant les interets de votre client. Ces simulations sont basees sur l\'analyse de milliers de transactions similaires dans le secteur.

L\'IA vous assiste aussi apres l\'accord de principe. Elle genere automatiquement le compromis de vente pre-rempli, verifie la coherence de toutes les clauses, calcule les frais de notaire et les droits de mutation. Elle alerte sur les points de vigilance specifiques au dossier : servitudes, urbanisme, copropriete. Le suivi jusqu\'a la signature de l\'acte authentique est entierement automatise avec des rappels pour chaque etape cle.`,
          xpReward: 15,
        },
        {
          id: 'immo-m6-l2',
          title: 'Jeu : Simuler une negociation',
          duration: '3 min',
          type: 'game' as const,
          content: 'Simulez une negociation immobiliere complexe avec l\'IA.',
          exercisePrompt: `Voici le contexte de la negociation :
- Bien : Appartement T4, 92m2, Bordeaux centre, en vente a 385 000 EUR
- En vente depuis 2 mois, 12 visites realisees, 1 offre refusee a 350 000 EUR
- Vendeur : couple de retraites qui veut demenager en campagne, pas presse mais fatigue des visites
- Acheteur : famille avec 2 enfants, coup de coeur, budget max 370 000 EUR, pret accorde a 360 000 EUR + apport 40 000 EUR

L\'acheteur vous fait une offre a 355 000 EUR.

Avec l\'IA Freenzy, elaborez votre strategie :
1. Analysez les forces et faiblesses de chaque partie
2. Identifiez la zone d\'accord probable
3. Redigez le script de presentation de l\'offre au vendeur
4. Proposez une contre-offre optimale avec justification
5. Prevoyez les 2 objections possibles du vendeur et vos reponses`,
          xpReward: 20,
        },
        {
          id: 'immo-m6-l3',
          title: 'Quiz — Negociation immobiliere',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur la negociation assistee par IA.',
          quizQuestions: [
            {
              question: 'Que contient le brief de negociation genere par l\'IA ?',
              options: ['Uniquement le prix du bien', 'La zone d\'accord probable et les leviers a actionner', 'Le contrat de vente', 'Les coordonnees du notaire'],
              correctIndex: 1,
              explanation: 'Le brief synthetise toutes les donnees en une zone d\'accord probable et des leviers de negociation concrets.',
            },
            {
              question: 'Pourquoi une offre a 95% du prix peut-elle etre meilleure qu\'une offre au prix ?',
              options: ['Parce que c\'est moins cher', 'Si le financement est acquis versus un pret non accorde', 'Parce que le vendeur aime negocier', 'Ce n\'est jamais le cas'],
              correctIndex: 1,
              explanation: 'La solidite du financement, les conditions et les delais font partie de l\'analyse multicritere d\'une offre.',
            },
            {
              question: 'Sur quoi l\'IA base-t-elle ses simulations de contre-offre ?',
              options: ['Son intuition', 'L\'analyse de milliers de transactions similaires', 'Les avis des voisins', 'Les previsions meteo'],
              correctIndex: 1,
              explanation: 'Les simulations sont basees sur l\'analyse statistique de milliers de transactions similaires dans le meme secteur.',
            },
            {
              question: 'Que fait l\'IA apres l\'accord de principe entre vendeur et acheteur ?',
              options: ['Rien, son travail est termine', 'Elle genere le compromis et suit le dossier jusqu\'a l\'acte', 'Elle cherche un autre acheteur', 'Elle contacte la banque'],
              correctIndex: 1,
              explanation: 'L\'IA genere le compromis pre-rempli, verifie les clauses et automatise le suivi jusqu\'a la signature de l\'acte authentique.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// =============================================================================
// 3. IA pour Coiffeurs
// =============================================================================

export const parcoursCoiffeurIA: FormationParcours = {
  id: 'coiffeur-ia',
  title: 'IA pour Coiffeurs',
  emoji: '\u{1F487}',
  description: 'Modernisez votre salon de coiffure avec l\'IA : prise de RDV en ligne, fidelisation, reseaux sociaux, tendances, gestion de stock et formation continue.',
  category: 'metier',
  subcategory: 'beaute',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F472B6',
  diplomaTitle: 'Coiffeur Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Coiffeurs',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Prise de RDV en ligne intelligente
    {
      id: 'coiff-m1',
      title: 'Prise de RDV en ligne intelligente',
      emoji: '\u{1F4C5}',
      description: 'Optimisez la prise de rendez-vous de votre salon grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Agenda Pro',
      lessons: [
        {
          id: 'coiff-m1-l1',
          title: 'Un agenda qui se gere tout seul',
          duration: '4 min',
          type: 'text' as const,
          content: `La gestion de l\'agenda est l\'un des plus grands defis pour un salon de coiffure. Le telephone sonne en pleine coupe, les clients veulent des creneaux en soiree qui n\'existent pas, les no-shows representent un manque a gagner considerable et les periodes creuses du mardi matin restent desesperement vides. L\'IA peut transformer cette gestion chaotique en un systeme fluide et rentable.

L\'assistant Freenzy met en place un systeme de reservation en ligne accessible 24 heures sur 24. Les clients choisissent la prestation souhaitee, le coiffeur de leur choix et le creneau qui leur convient, directement depuis leur smartphone. L\'IA calcule automatiquement la duree necessaire en fonction de la prestation et de la longueur de cheveux indiquee : un balayage sur cheveux longs prend plus de temps qu\'un balayage sur carre. Plus d\'erreurs de planning dues a une estimation approximative de la duree.

Le systeme anti no-show est redoutablement efficace. L\'IA envoie un rappel par SMS 24 heures avant le rendez-vous avec un bouton de confirmation. Si le client ne confirme pas, un deuxieme rappel part 3 heures avant. Les clients qui ont un historique d\'annulations repetees sont automatiquement signales et peuvent se voir demander un acompte en ligne lors de la reservation. Resultat : une reduction de 60% des rendez-vous non honores.

L\'optimisation du planning est aussi intelligente. L\'IA identifie les creux recurrents et peut declencher des offres ciblees pour les remplir. Un mardi matin vide peut devenir un creneau attractif avec une remise de 15% proposee automatiquement aux clients dont l\'agenda le permet. Le systeme evite aussi les mauvais enchainements, comme placer une coloration technique juste avant la pause dejeuner quand le temps de pose risque de deborder.

L\'IA gere enfin les listes d\'attente intelligentes. Quand un client annule, elle contacte automatiquement les personnes en attente en tenant compte de la prestation prevue et du coiffeur demande. Le creneau libere est rempli en quelques minutes sans aucune intervention de votre part.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m1-l2',
          title: 'Exercice : Configurer la prise de RDV IA',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Mettez en place votre systeme de reservation intelligent.',
          exercisePrompt: `Votre salon emploie 3 coiffeurs et propose les prestations suivantes :
- Coupe femme : 35 EUR (45 min), Coupe homme : 22 EUR (25 min)
- Brushing : 25 EUR (30 min), Coloration : 55 EUR (1h30)
- Balayage/Meches : 75 EUR (2h), Lissage bresilien : 120 EUR (2h30)
- Coupe + Brushing : 55 EUR (1h15)

Horaires : Mardi-Samedi 9h-19h (pause 12h30-13h30)

Avec l\'assistant Freenzy :
1. Definissez les regles de duree selon le type de cheveux (courts/mi-longs/longs)
2. Etablissez la politique anti no-show (rappels, acompte, seuil d\'annulations)
3. Identifiez les creux habituels et proposez une strategie promotionnelle
4. Configurez les regles d\'enchainement des prestations (ex: pas de coloration avant la pause)
5. Decrivez le parcours client de la reservation en ligne en 5 etapes`,
          xpReward: 20,
        },
        {
          id: 'coiff-m1-l3',
          title: 'Quiz — Prise de RDV intelligente',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur la gestion de rendez-vous par IA.',
          quizQuestions: [
            {
              question: 'De combien l\'IA reduit-elle les no-shows en salon de coiffure ?',
              options: ['20%', '40%', '60%', '80%'],
              correctIndex: 2,
              explanation: 'Grace aux rappels SMS, confirmations et systeme d\'acompte, l\'IA reduit de 60% les rendez-vous non honores.',
            },
            {
              question: 'Comment l\'IA calcule-t-elle la duree d\'une prestation ?',
              options: ['Duree fixe pour tous', 'En fonction de la prestation et de la longueur de cheveux', 'Au hasard', 'Selon le prix'],
              correctIndex: 1,
              explanation: 'L\'IA adapte la duree en fonction de la prestation choisie et de la longueur de cheveux indiquee par le client.',
            },
            {
              question: 'Que fait l\'IA avec les creneaux vides recurrents ?',
              options: ['Elle les supprime', 'Elle declenche des offres ciblees pour les remplir', 'Elle ferme le salon', 'Elle ne fait rien'],
              correctIndex: 1,
              explanation: 'L\'IA identifie les creux recurrents et propose des offres promotionnelles ciblees pour les combler.',
            },
            {
              question: 'Comment fonctionne la liste d\'attente intelligente ?',
              options: ['Premier arrive premier servi', 'Elle contacte les personnes en attente selon la prestation et le coiffeur', 'Elle fait patienter tout le monde', 'Elle annule le creneau'],
              correctIndex: 1,
              explanation: 'L\'IA contacte automatiquement les personnes en attente en tenant compte de la prestation prevue et du coiffeur demande.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Fidelisation client
    {
      id: 'coiff-m2',
      title: 'Fidelisation client',
      emoji: '\u{2764}\u{FE0F}',
      description: 'Fidelisez vos clients avec des programmes personnalises par l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{2764}\u{FE0F}',
      badgeName: 'Fidelisation Star',
      lessons: [
        {
          id: 'coiff-m2-l1',
          title: 'Fideliser intelligemment avec l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `Acquerir un nouveau client coute cinq a sept fois plus cher que de fideliser un client existant. Pour un salon de coiffure, la fidelisation est donc un levier de rentabilite majeur. Pourtant, beaucoup de salons se contentent d\'une carte de fidelite basique — dix coupes achetees, la onzieme offerte — sans exploiter les donnees clients dont ils disposent. L\'IA permet de passer a une fidelisation veritablement personnalisee et proactive.

L\'assistant Freenzy construit un profil detaille de chaque client : frequence de visite, prestations habituelles, coiffeur prefere, produits achetes, budget moyen, preferences personnelles et meme les sujets de conversation notes par le coiffeur. Ces informations permettent une relation ultra-personnalisee. Quand Mme Martin arrive, le coiffeur sait qu\'elle prefere un cafe au lait, qu\'elle a un mariage dans trois semaines et qu\'elle avait adore son dernier balayage caramel.

Le programme de fidelite devient intelligent et individualise. Au lieu d\'une recompense generique, l\'IA propose des offres adaptees a chaque client. Une cliente fidele depuis trois ans recoit une remise sur sa coloration preferee. Un client qui n\'est pas venu depuis deux mois recoit un message personnalise avec une offre de retour. Un nouveau client recoit une offre de bienvenue pour une prestation complementaire a celle qu\'il a reservee.

L\'IA detecte les signaux d\'attrition avant qu\'il ne soit trop tard. Si un client habituellement mensuel n\'a pas pris rendez-vous depuis six semaines, le systeme declenche automatiquement une campagne de reconquete : message personnalise, offre speciale, suggestion de nouveau coiffeur si necessaire. Cette approche proactive recupere en moyenne 35% des clients sur le point de partir.

Les anniversaires, les changements de saison et les fetes deviennent autant d\'occasions de contact. L\'IA envoie un message personnalise pour chaque occasion avec une offre pertinente. Un message d\'anniversaire avec une remise de 20% genere un taux de conversion de 40%, bien superieur a n\'importe quelle publicite.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m2-l2',
          title: 'Exercice : Creer un programme de fidelite IA',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Concevez un programme de fidelite personnalise par l\'IA.',
          exercisePrompt: `Votre salon a 450 clients actifs repartis ainsi :
- 120 clients tres fideles (visite mensuelle, panier moyen 65 EUR)
- 200 clients reguliers (visite tous les 2 mois, panier moyen 45 EUR)
- 80 clients occasionnels (visite 2-3 fois/an, panier moyen 35 EUR)
- 50 nouveaux clients (1 seule visite dans les 3 derniers mois)

Avec l\'assistant Freenzy :
1. Definissez 4 niveaux de fidelite avec avantages croissants
2. Creez une offre personnalisee pour chaque segment
3. Redigez le message de reconquete pour un client absent depuis 2 mois
4. Proposez 3 occasions annuelles de contact avec offre associee
5. Calculez le ROI estime de votre programme (cout des remises vs revenus supplementaires)`,
          xpReward: 20,
        },
        {
          id: 'coiff-m2-l3',
          title: 'Quiz — Fidelisation client',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur la fidelisation par IA.',
          quizQuestions: [
            {
              question: 'Combien coute l\'acquisition d\'un nouveau client vs la fidelisation ?',
              options: ['Le meme prix', '2 fois plus', '5 a 7 fois plus', '10 fois plus'],
              correctIndex: 2,
              explanation: 'Acquerir un nouveau client coute 5 a 7 fois plus cher que de fideliser un client existant.',
            },
            {
              question: 'Quel pourcentage de clients en attrition l\'IA peut-elle recuperer ?',
              options: ['10%', '20%', '35%', '50%'],
              correctIndex: 2,
              explanation: 'L\'approche proactive de detection d\'attrition permet de recuperer en moyenne 35% des clients sur le point de partir.',
            },
            {
              question: 'Quel taux de conversion genere un message d\'anniversaire avec remise ?',
              options: ['10%', '20%', '30%', '40%'],
              correctIndex: 3,
              explanation: 'Un message d\'anniversaire personnalise avec une remise de 20% genere un taux de conversion de 40%.',
            },
            {
              question: 'Quelles donnees l\'IA utilise-t-elle pour personnaliser la relation client ?',
              options: ['Uniquement le nom du client', 'Frequence, prestations, preferences et notes du coiffeur', 'Le code postal', 'L\'age uniquement'],
              correctIndex: 1,
              explanation: 'L\'IA exploite toutes les donnees disponibles : frequence, prestations, produits, preferences et notes personnelles.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Reseaux sociaux pour salons
    {
      id: 'coiff-m3',
      title: 'Reseaux sociaux pour salons',
      emoji: '\u{1F4F1}',
      description: 'Developpez votre presence en ligne et attirez de nouveaux clients.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4F1}',
      badgeName: 'Social Media Pro',
      lessons: [
        {
          id: 'coiff-m3-l1',
          title: 'Instagram et TikTok au service de votre salon',
          duration: '4 min',
          type: 'text' as const,
          content: `Les reseaux sociaux sont devenus la vitrine incontournable des salons de coiffure. Instagram et TikTok sont les plateformes ou les tendances coiffure naissent et se propagent. Un salon avec une presence sociale forte attire naturellement de nouveaux clients, surtout dans la tranche des 18-35 ans. Mais publier regulierement du contenu de qualite demande du temps que vous n\'avez pas entre deux clients. L\'IA est la solution.

L\'assistant Freenzy genere un calendrier editorial mensuel adapte a votre salon. Il planifie les publications en alternant les formats : avant/apres d\'une coupe, tutoriel coiffure rapide, presentation de produit, temoignage client, coulisse du salon, conseil capillaire. Chaque publication est accompagnee d\'une legende engageante et des hashtags les plus performants du moment. Vous n\'avez plus qu\'a prendre la photo ou la video, l\'IA fait le reste.

La creation de contenu video est simplifiee a l\'extreme. L\'IA vous propose des scenarios de Reels et TikToks bases sur les tendances virales du moment adaptees a la coiffure. Elle genere les textes des voix off, suggere les musiques tendance et vous indique le meilleur moment pour publier selon votre audience. Un tutoriel de 30 secondes montrant une technique de coiffage peut atteindre des dizaines de milliers de vues et attirer des clients de toute la ville.

L\'IA gere aussi les interactions avec votre communaute. Elle repond automatiquement aux questions frequentes en messages prives — tarifs, disponibilites, adresse — et vous alerte uniquement pour les demandes specifiques necessitant votre intervention. Les commentaires sous vos publications recoivent une reponse rapide et personnalisee, ce qui booste l\'algorithme et augmente la visibilite de vos posts.

L\'analyse des performances vous guide dans votre strategie. L\'IA identifie les contenus qui generent le plus d\'engagement, les heures de publication optimales et les tendances emergentes a exploiter. Elle vous fournit un rapport hebdomadaire simple avec les metriques cles et des recommandations concretes pour la semaine suivante.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m3-l2',
          title: 'Exercice : Planifier un mois de contenu',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Creez un calendrier editorial pour votre salon.',
          exercisePrompt: `Votre salon "Atelier Capillaire" a 850 abonnes sur Instagram et 200 sur TikTok. Vous voulez atteindre 1500 et 500 en 3 mois.

Avec l\'assistant Freenzy :
1. Planifiez les 12 publications Instagram du mois prochain (3 par semaine) avec format et sujet
2. Proposez 4 idees de Reels/TikToks bases sur des tendances actuelles
3. Redigez 3 legendes type avec hashtags (avant/apres, tutoriel, coulisse)
4. Definissez la strategie de reponse aux messages prives (auto vs manuel)
5. Identifiez 2 collaborations locales (influenceurs, commercants) pour booster la visibilite`,
          xpReward: 20,
        },
        {
          id: 'coiff-m3-l3',
          title: 'Quiz — Reseaux sociaux',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur les reseaux sociaux pour salons.',
          quizQuestions: [
            {
              question: 'Quelles plateformes sont incontournables pour un salon de coiffure ?',
              options: ['LinkedIn et Twitter', 'Instagram et TikTok', 'Facebook et Pinterest', 'YouTube et Snapchat'],
              correctIndex: 1,
              explanation: 'Instagram et TikTok sont les plateformes ou les tendances coiffure naissent et se propagent, surtout chez les 18-35 ans.',
            },
            {
              question: 'Combien de formats differents l\'IA alterne-t-elle dans le calendrier ?',
              options: ['2 (photos et videos)', '4 (avant/apres, tuto, produit, temoignage)', '6 (avant/apres, tuto, produit, temoignage, coulisse, conseil)', '1 seul format'],
              correctIndex: 2,
              explanation: 'L\'IA alterne 6 formats : avant/apres, tutoriel, produit, temoignage, coulisse et conseil capillaire pour varier le contenu.',
            },
            {
              question: 'Pourquoi repondre rapidement aux commentaires est-il important ?',
              options: ['Par politesse uniquement', 'Cela booste l\'algorithme et augmente la visibilite', 'C\'est obligatoire legalement', 'Cela n\'a aucun impact'],
              correctIndex: 1,
              explanation: 'Les reponses rapides aux commentaires boostent l\'algorithme de la plateforme et augmentent la visibilite des publications.',
            },
            {
              question: 'Que fait l\'IA avec les messages prives frequents ?',
              options: ['Elle les ignore', 'Elle repond automatiquement aux questions courantes et alerte pour les specifiques', 'Elle bloque les expediteurs', 'Elle les transfère par email'],
              correctIndex: 1,
              explanation: 'L\'IA repond aux questions frequentes (tarifs, dispos, adresse) et alerte le coiffeur uniquement pour les demandes specifiques.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Tendances et conseil personnalise
    {
      id: 'coiff-m4',
      title: 'Tendances et conseil personnalise',
      emoji: '\u{2728}',
      description: 'Identifiez les tendances et proposez des conseils personnalises a chaque client.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{2728}',
      badgeName: 'Tendance Expert',
      lessons: [
        {
          id: 'coiff-m4-l1',
          title: 'Detecter et proposer les tendances avec l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `Les tendances coiffure evoluent a un rythme effrenee. Ce qui etait a la mode il y a six mois peut sembler depasse aujourd\'hui. Les clients arrivent au salon avec des photos trouvees sur Instagram ou Pinterest et attendent de leur coiffeur qu\'il soit a la pointe. Rester informe de toutes ces evolutions demande une veille constante que l\'IA peut automatiser et enrichir considerablement.

L\'assistant Freenzy analyse en continu les tendances mondiales de la coiffure. Il scrute les defiles de mode, les comptes des coiffeurs influents, les recherches populaires sur les reseaux sociaux et les publications des grandes marques. Il vous fournit chaque semaine un resume des tendances emergentes avec des visuels de reference, des techniques associees et une estimation de leur potentiel commercial pour votre clientele.

Le conseil personnalise est la fonctionnalite la plus impactante. Quand un client arrive avec une photo de la coupe souhaitee, l\'IA analyse la photo puis la compare avec les caracteristiques du client : forme du visage, type de cheveux, implantation, couleur naturelle. Elle genere ensuite une recommandation adaptee qui respecte l\'envie du client tout en tenant compte de la realite. Un carre plongeant ne rend pas pareil sur un visage rond que sur un visage ovale, et l\'IA vous aide a expliquer pourquoi une variante serait plus flatteuse.

L\'IA constitue aussi un book digital personnalise pour chaque client. A chaque visite, elle suggere deux ou trois nouvelles idees basees sur l\'historique du client, ses preferences et les tendances du moment. Ce service de conseil proactif impressionne les clients et justifie un positionnement tarifaire premium. Le client a le sentiment d\'avoir un styliste personnel qui pense a lui entre les visites.

La veille produits est aussi integree. L\'IA identifie les nouveaux produits capillaires pertinents pour votre salon, compare les formulations et les prix, et vous recommande ceux qui correspondent le mieux a votre clientele. Vous pouvez ainsi renouveler regulierement votre offre de produits en revente avec des articles tendance que vos clients ne trouveront pas en grande surface.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m4-l2',
          title: 'Jeu : Le conseiller tendance IA',
          duration: '3 min',
          type: 'game' as const,
          content: 'Proposez des coupes tendance adaptees a differents profils.',
          exercisePrompt: `L\'IA vous presente 4 clientes avec leurs demandes. Pour chacune, proposez une recommandation personnalisee :

1. Julie, 25 ans, visage ovale, cheveux fins et raides, blonde naturelle
   Demande : "Je veux le meme carre que Margot Robbie"

2. Fatima, 40 ans, visage rond, cheveux epais et ondules, brun fonce
   Demande : "Je veux quelque chose de moderne mais facile a coiffer"

3. Sophie, 55 ans, visage carre, cheveux mi-fins grisonnants
   Demande : "Je ne veux plus me teindre mais rester elegante"

4. Lea, 18 ans, visage en coeur, cheveux boucles chatains
   Demande : "Je veux une coupe TikTok, un truc qui fait des vues"

Pour chaque cliente :
1. Analysez la compatibilite entre la demande et le profil
2. Proposez la coupe/couleur ideale avec justification technique
3. Suggerez les produits de soin adaptes
4. Estimez le budget total (prestation + produits)`,
          xpReward: 20,
        },
        {
          id: 'coiff-m4-l3',
          title: 'Quiz — Tendances et conseil',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur les tendances et le conseil IA.',
          quizQuestions: [
            {
              question: 'Quelles sources l\'IA analyse-t-elle pour detecter les tendances ?',
              options: ['Uniquement les magazines', 'Defiles, influenceurs, reseaux sociaux et marques', 'Les avis Google', 'La television'],
              correctIndex: 1,
              explanation: 'L\'IA scrute les defiles, les comptes influents, les recherches populaires et les publications des grandes marques.',
            },
            {
              question: 'Que fait l\'IA quand un client montre une photo de coupe souhaitee ?',
              options: ['Elle la copie exactement', 'Elle analyse la photo et compare avec le profil du client pour adapter', 'Elle refuse la demande', 'Elle cherche le coiffeur sur la photo'],
              correctIndex: 1,
              explanation: 'L\'IA compare la coupe souhaitee avec les caracteristiques du client pour proposer une adaptation flatteuse et realiste.',
            },
            {
              question: 'Qu\'est-ce que le book digital personnalise ?',
              options: ['Un album photo du salon', 'Des suggestions basees sur l\'historique du client et les tendances', 'Un catalogue de prix', 'Un livre de formation'],
              correctIndex: 1,
              explanation: 'Le book digital propose des idees personnalisees basees sur l\'historique, les preferences et les tendances actuelles.',
            },
            {
              question: 'Pourquoi la veille produits est-elle importante pour un salon ?',
              options: ['Pour depenser plus', 'Pour proposer des produits tendance introuvables en grande surface', 'Pour avoir plus de stock', 'Pour faire plaisir aux commerciaux'],
              correctIndex: 1,
              explanation: 'Proposer des produits tendance exclusifs renforce le positionnement premium du salon et augmente les revenus complementaires.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Gestion de stock intelligente
    {
      id: 'coiff-m5',
      title: 'Gestion de stock intelligente',
      emoji: '\u{1F4E6}',
      description: 'Optimisez la gestion de vos produits et consommables avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Stock Master',
      lessons: [
        {
          id: 'coiff-m5-l1',
          title: 'Un stock toujours optimal grace a l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `La gestion du stock est un casse-tete quotidien pour les gerants de salon. Trop de stock immobilise de la tresorerie, pas assez de stock oblige a refuser des prestations ou a improviser avec des produits inadaptes. Entre les colorations qui periment, les shampoings en revente qui ne partent pas et la coloration tendance dont vous manquez toujours, l\'equilibre est difficile a trouver. L\'IA apporte une solution concrete et chiffree.

L\'assistant Freenzy analyse votre historique de consommation pour chaque produit et prevoit vos besoins avec precision. Il sait que vous consommez en moyenne 12 tubes de coloration chatain clair par mois mais que ce chiffre monte a 18 en septembre quand les clientes reviennent de vacances. Il anticipe les pics saisonniers et ajuste les commandes en consequence. Plus de rupture sur les colorations les plus demandees, plus de surplus sur celles qui bougent peu.

Le systeme de seuils intelligents est personnalise pour chaque produit. Un tube de coloration rare utilisee deux fois par mois a un seuil de reapprovisionnement a 2 unites, tandis qu\'un shampoing basique utilise quotidiennement a un seuil a 5 unites. L\'IA calcule ces seuils en fonction de vos delais de livraison fournisseur, de votre rythme de consommation et d\'une marge de securite adaptee. Quand un seuil est atteint, une commande est generee automatiquement ou soumise a votre validation.

L\'optimisation financiere est significative. L\'IA compare les prix entre fournisseurs, identifie les offres promotionnelles et regroupe les commandes pour atteindre les seuils de franco de port. Elle calcule aussi votre taux de perte sur les produits perimes et propose des actions correctives. Un salon moyen peut economiser entre 8 et 15% sur ses achats produits en suivant les recommandations de l\'IA.

Le suivi de la revente est aussi integre. L\'IA identifie les produits en rayon qui stagnent et suggere des actions : mise en avant, promotion, association avec une prestation ou retrait. Elle vous aide aussi a determiner les produits a introduire en fonction des tendances et des demandes de vos clients, maximisant ainsi la rentabilite de votre espace revente.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m5-l2',
          title: 'Exercice : Optimiser le stock du salon',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Configurez la gestion de stock intelligente de votre salon.',
          exercisePrompt: `Votre salon a un stock actuel valorise a 4 500 EUR. Voici la situation :
- 85 references de colorations (3 marques), consommation variable
- 20 references de shampoings/soins en revente
- 5 produits de styling en revente
- Budget achats mensuel : 800 EUR
- Delai livraison fournisseur principal : 3 jours ouvres
- Vous avez jete 350 EUR de produits perimes l\'an dernier

Avec l\'assistant Freenzy :
1. Identifiez les 10 references les plus critiques a surveiller
2. Definissez les seuils de reapprovisionnement pour 3 categories de produits
3. Proposez une strategie pour reduire les pertes de 50%
4. Calculez les economies possibles en regroupant les commandes
5. Suggerez 3 produits de revente a introduire bases sur les tendances`,
          xpReward: 20,
        },
        {
          id: 'coiff-m5-l3',
          title: 'Quiz — Gestion de stock',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Verifiez vos connaissances sur la gestion de stock par IA.',
          quizQuestions: [
            {
              question: 'Combien un salon peut-il economiser sur ses achats grace a l\'IA ?',
              options: ['1 a 3%', '5 a 8%', '8 a 15%', '20 a 30%'],
              correctIndex: 2,
              explanation: 'Un salon moyen peut economiser entre 8 et 15% sur ses achats produits en suivant les recommandations de l\'IA.',
            },
            {
              question: 'Comment l\'IA anticipe-t-elle les pics de consommation ?',
              options: ['Au hasard', 'En analysant l\'historique de consommation et les variations saisonnieres', 'En demandant aux clients', 'En copiant les concurrents'],
              correctIndex: 1,
              explanation: 'L\'IA analyse l\'historique pour detecter les patterns saisonniers et anticiper les besoins avec precision.',
            },
            {
              question: 'Que fait l\'IA avec les produits en revente qui stagnent ?',
              options: ['Elle les jette', 'Elle suggere mise en avant, promotion ou retrait', 'Elle augmente le prix', 'Elle ne fait rien'],
              correctIndex: 1,
              explanation: 'L\'IA propose des actions concretes pour les produits stagnants : mise en avant, promotion, association avec prestation ou retrait.',
            },
            {
              question: 'Comment l\'IA personnalise-t-elle les seuils de reapprovisionnement ?',
              options: ['Seuil identique pour tout', 'En fonction du rythme de consommation, delai fournisseur et marge de securite', 'Selon la taille du produit', 'Selon le prix uniquement'],
              correctIndex: 1,
              explanation: 'Les seuils sont calcules individuellement selon la consommation, les delais de livraison et une marge de securite adaptee.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Formation continue et montee en competences
    {
      id: 'coiff-m6',
      title: 'Formation continue et montee en competences',
      emoji: '\u{1F393}',
      description: 'Formez-vous et formez votre equipe aux nouvelles techniques avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F393}',
      badgeName: 'Formateur Pro',
      lessons: [
        {
          id: 'coiff-m6-l1',
          title: 'Se former en continu avec l\'assistance de l\'IA',
          duration: '4 min',
          type: 'text' as const,
          content: `Le metier de coiffeur evolue constamment. Nouvelles techniques de coloration, nouveaux produits, nouvelles attentes clients, nouvelles normes d\'hygiene — rester a jour est indispensable pour maintenir sa competitivite et la satisfaction de sa clientele. Mais les formations traditionnelles sont couteuses, chronophages et parfois eloignees des besoins reels du salon. L\'IA rend la formation continue accessible, personnalisee et directement applicable.

L\'assistant Freenzy cree des parcours de formation sur mesure pour chaque membre de l\'equipe. Un jeune diplome qui maitrise les coupes classiques mais manque d\'experience en coloration recevra un programme different de celui d\'un coiffeur experimente qui souhaite se perfectionner en techniques de balayage. L\'IA evalue le niveau de chaque collaborateur, identifie les lacunes et propose un plan de progression adapte avec des objectifs mesurables.

Les modules de formation sont courts et pratiques, conçus pour etre suivis entre deux clients. Des tutoriels video de cinq minutes sur une technique specifique, des quiz rapides pour valider les acquis, des fiches memo a consulter avant une prestation inhabituelle. L\'IA genere ces contenus en fonction des tendances actuelles et des demandes recurrentes de votre clientele. Si vos clientes demandent de plus en plus de colorations vegetales, un module dedie apparait automatiquement.

Le suivi de progression est motive par la gamification. Chaque collaborateur voit son evolution, gagne des badges de competence et peut se comparer aux objectifs fixes. Les managers disposent d\'un tableau de bord global montrant les forces et faiblesses de l\'equipe, ce qui facilite la planification des formations et la repartition des prestations selon les competences de chacun.

L\'IA facilite aussi le partage de connaissances au sein de l\'equipe. Quand un coiffeur decouvre une astuce ou perfectionne une technique, il peut la documenter en video avec l\'aide de l\'IA qui structure le tutoriel, ajoute des annotations et le rend disponible pour tous. Le savoir-faire du salon se capitalise au lieu de rester dans la tete de chaque individu.`,
          xpReward: 15,
        },
        {
          id: 'coiff-m6-l2',
          title: 'Exercice : Creer un plan de formation equipe',
          duration: '3 min',
          type: 'exercise' as const,
          content: 'Elaborez un plan de formation personnalise pour votre equipe.',
          exercisePrompt: `Votre equipe de 4 coiffeurs a les profils suivants :
- Sarah (gérante, 15 ans XP) : excellente en coupe, bonne en coloration, faible en digital
- Maxime (5 ans XP) : bon en coupe homme, moyen en coloration femme, interesse par le barbier
- Lea (2 ans XP, BP) : bonne base technique, manque de vitesse, motivee pour apprendre
- Yanis (apprenti, 1ere annee) : bases en cours d\'acquisition, tres a l\'aise avec le digital

Avec l\'assistant Freenzy :
1. Evaluez les competences de chaque collaborateur sur 5 axes (coupe F/H, coloration, technique, conseil, digital)
2. Creez un plan de formation trimestriel personnalise pour chacun
3. Identifiez 3 modules prioritaires a creer pour l\'equipe
4. Proposez un systeme de mentorat interne (qui forme qui sur quoi)
5. Definissez les indicateurs de progression et les objectifs a 3 mois`,
          xpReward: 20,
        },
        {
          id: 'coiff-m6-l3',
          title: 'Quiz — Formation continue',
          duration: '3 min',
          type: 'quiz' as const,
          content: 'Testez vos connaissances sur la formation assistee par IA.',
          quizQuestions: [
            {
              question: 'Comment l\'IA personnalise-t-elle les parcours de formation ?',
              options: ['Meme programme pour tous', 'En evaluant le niveau de chaque collaborateur et en identifiant les lacunes', 'En tirant au sort les modules', 'En copiant les formations existantes'],
              correctIndex: 1,
              explanation: 'L\'IA evalue individuellement chaque collaborateur, identifie ses lacunes et cree un programme adapte avec objectifs mesurables.',
            },
            {
              question: 'Quelle duree ont les modules de formation generes par l\'IA ?',
              options: ['2 heures minimum', '30 minutes', '5 minutes pour etre suivis entre deux clients', '1 journee entiere'],
              correctIndex: 2,
              explanation: 'Les modules sont courts (5 minutes) et pratiques, concus pour etre suivis entre deux clients sans perturber l\'activite.',
            },
            {
              question: 'Comment l\'IA detecte-t-elle les besoins de formation ?',
              options: ['Au hasard', 'En analysant les tendances et les demandes recurrentes des clients', 'En lisant les avis Google', 'En demandant au patron'],
              correctIndex: 1,
              explanation: 'L\'IA genere des contenus en fonction des tendances actuelles et des demandes recurrentes de la clientele du salon.',
            },
            {
              question: 'Comment le savoir-faire est-il capitalise dans le salon ?',
              options: ['Il ne l\'est pas', 'Par des tutoriels video documentes et structures par l\'IA', 'Par des notes papier', 'Par des reunions mensuelles uniquement'],
              correctIndex: 1,
              explanation: 'L\'IA aide a documenter les astuces en video, structure les tutoriels et les rend accessibles a toute l\'equipe.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};
