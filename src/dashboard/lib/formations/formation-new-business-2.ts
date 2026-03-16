// =============================================================================
// Freenzy.io — Formations Business Pack 2
// 3 parcours x 6 modules x 3 lessons = 54 lessons
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. IA pour Opticiens
// =============================================================================

export const parcoursOpticienIA: FormationParcours = {
  id: 'opticien-ia',
  title: 'IA pour Opticiens',
  emoji: '\u{1F453}',
  description: 'Modernisez votre magasin d\'optique avec l\'IA : lecture d\'ordonnances, gestion de stock montures, tiers payant automatise, conseil client personnalise, marketing local et fidelisation.',
  category: 'metier',
  subcategory: 'sante',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#14B8A6',
  diplomaTitle: 'Opticien Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Opticiens',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Lecture d'ordonnances
    {
      id: 'opticien-m1',
      title: 'Lecture d\'ordonnances intelligente',
      emoji: '\u{1F4CB}',
      description: 'Automatisez l\'analyse des ordonnances ophtalmologiques avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m1-l1',
          title: 'Decoder les ordonnances avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Chaque jour, un opticien recoit des dizaines d'ordonnances ophtalmologiques. Entre les ecritures parfois illisibles des medecins, les abbreviations techniques (OD, OG, Add, Cyl, Axe) et les corrections complexes, le risque d'erreur de saisie est reel. Une erreur sur un axe de cylindre ou une addition de presbytie peut entrainer un equipement inadapte et un client mecontent. L'IA transforme cette etape critique en processus fiable et rapide. \u{1F4CB}

L'assistant Freenzy utilise la reconnaissance optique de caracteres (OCR) combinee a un modele d'IA specialise en terminologie ophtalmologique. Vous photographiez l'ordonnance avec votre smartphone ou scanner de comptoir, et en quelques secondes l'IA extrait toutes les valeurs : sphere, cylindre, axe, addition, ecart pupillaire, et meme les mentions speciales comme les prismes ou les filtres therapeutiques.

Le systeme va plus loin qu'une simple lecture. Il detecte les incoherences potentielles : une addition de presbytie sur un patient de 25 ans, un cylindre anormalement eleve sans mention de keratocone, ou un ecart entre les deux yeux qui depasse les normes habituelles. Dans ces cas, l'IA vous alerte et vous suggere de verifier aupres du prescripteur avant de lancer la commande. \u{2705}

L'historique des ordonnances de chaque client est conserve. L'IA compare automatiquement la nouvelle prescription avec les precedentes et vous signale les evolutions significatives : augmentation rapide de la myopie, apparition d'un astigmatisme, progression de la presbytie. Ces informations vous permettent de conseiller le client de maniere eclairee et de l'orienter vers un controle ophtalmologique si necessaire.

Enfin, les donnees extraites alimentent directement votre logiciel de commande. Plus de ressaisie manuelle, plus de risque de transposition de chiffres. Le gain de temps est estime a 3 minutes par ordonnance, soit pres d'une heure par jour pour un magasin traitant 15 a 20 ordonnances quotidiennes. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m1-l2',
          title: 'Exercice : Analyser une ordonnance',
          duration: '3 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour analyser et verifier une ordonnance ophtalmologique.',
          exercisePrompt: `Vous recevez l'ordonnance suivante d'un patient de 52 ans :
- OD : Sphere -2.50 / Cylindre -0.75 / Axe 95 / Add +2.00
- OG : Sphere -3.00 / Cylindre -1.25 / Axe 80 / Add +2.00
- EP : 63 mm

Redigez le brief pour l'assistant Freenzy :
1. Identifiez le type de correction necessaire (unifocaux, progressifs, etc.)
2. Verifiez la coherence des valeurs (addition, cylindre, difference inter-oculaire)
3. Listez les questions que l'IA devrait poser avant de valider la commande
4. Proposez 2 types de verres adaptes a ce profil patient.`,
          xpReward: 20,
        },
        {
          id: 'opticien-m1-l3',
          title: 'Quiz — Ordonnances et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la lecture d\'ordonnances assistee par IA.',
          quizQuestions: [
            {
              question: 'Combien de temps l\'IA fait-elle gagner par ordonnance en moyenne ?',
              options: ['30 secondes', '1 minute', '3 minutes', '10 minutes'],
              correctIndex: 2,
              explanation: 'L\'IA fait gagner environ 3 minutes par ordonnance en eliminant la ressaisie manuelle et la verification des valeurs.',
            },
            {
              question: 'Que fait l\'IA quand elle detecte une addition de presbytie sur un patient de 25 ans ?',
              options: [
                'Elle refuse l\'ordonnance',
                'Elle alerte l\'opticien et suggere de verifier aupres du prescripteur',
                'Elle corrige automatiquement la valeur',
                'Elle ignore l\'anomalie',
              ],
              correctIndex: 1,
              explanation: 'L\'IA signale les incoherences et recommande une verification aupres du prescripteur, sans jamais modifier les valeurs elle-meme.',
            },
            {
              question: 'Quelle technologie l\'IA utilise-t-elle pour lire les ordonnances manuscrites ?',
              options: [
                'La dictee vocale',
                'L\'OCR combinee a un modele specialise en ophtalmologie',
                'Un simple scan PDF',
                'La saisie manuelle assistee',
              ],
              correctIndex: 1,
              explanation: 'L\'OCR (reconnaissance optique de caracteres) est combinee a un modele IA entraine sur la terminologie ophtalmologique.',
            },
            {
              question: 'Pourquoi l\'IA compare-t-elle les ordonnances successives d\'un patient ?',
              options: [
                'Pour facturer plus cher',
                'Pour detecter les evolutions significatives et orienter le conseil',
                'Pour supprimer les anciennes donnees',
                'Pour envoyer de la publicite',
              ],
              correctIndex: 1,
              explanation: 'La comparaison des prescriptions permet de detecter des evolutions rapides et de mieux conseiller le client.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Lecteur Expert',
    },

    // Module 2 — Gestion de stock montures
    {
      id: 'opticien-m2',
      title: 'Stock montures intelligent',
      emoji: '\u{1F453}',
      description: 'Optimisez votre inventaire de montures grace a l\'IA predictive.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m2-l1',
          title: 'Gestion predictive du stock montures',
          duration: '4 min',
          type: 'text',
          content: `La gestion du stock de montures est l'un des plus grands defis de l'opticien. Avec des centaines de references en magasin, des collections qui changent chaque saison, des tendances mode qui evoluent et des contraintes de tresorerie, il faut trouver l'equilibre parfait entre diversite de l'offre et rotation saine du stock. L'IA predictive revolutionne cette equation. \u{1F453}

L'assistant Freenzy analyse votre historique de ventes sur les 12 derniers mois et identifie des patterns invisibles a l'oeil nu. Par exemple, les montures rondes se vendent 40% mieux en septembre (rentree scolaire, nouveaux looks), les montures sport partent en mars-avril (preparation ete), et les modeles premium se vendent davantage la premiere quinzaine du mois (juste apres les salaires). Ces insights vous permettent d'anticiper les commandes.

Le systeme classe vos montures en quatre categories dynamiques : les stars (forte marge, forte rotation), les vaches a lait (marge moyenne, rotation reguliere), les dilemmes (forte marge, faible rotation) et les poids morts (faible marge, faible rotation). Pour chaque categorie, l'IA recommande une strategie : reapprovisionner en priorite les stars, maintenir les vaches a lait, tenter une mise en avant pour les dilemmes, et solder les poids morts. \u{1F4CA}

L'IA surveille aussi les tendances du marche en analysant les publications mode, les reseaux sociaux et les recherches en ligne. Si une forme de monture devient virale sur Instagram, vous etes alerte avant meme que vos clients ne la demandent. Vous pouvez ainsi passer commande chez vos fournisseurs avant la rupture de stock.

La gestion des reapprovisionnements devient semi-automatique. L'IA genere chaque semaine une proposition de commande basee sur les ventes recentes, les previsions saisonnieres et votre budget disponible. Vous validez ou ajustez en un clic, et la commande part directement chez le fournisseur. Le stock mort diminue, la tresorerie s'ameliore, et vos clients trouvent toujours la monture qu'ils cherchent. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m2-l2',
          title: 'Jeu : Classer les montures par strategie',
          duration: '3 min',
          type: 'game',
          content: 'Classez les montures dans les bonnes categories strategiques.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Ray-Ban Aviator (forte marge, 12 ventes/mois)', right: 'Star \u{2B50}' },
              { left: 'Monture basique (marge moyenne, 8 ventes/mois)', right: 'Vache a lait \u{1F404}' },
              { left: 'Monture designer (forte marge, 1 vente/mois)', right: 'Dilemme \u{2753}' },
              { left: 'Ancienne collection (faible marge, 0 vente/mois)', right: 'Poids mort \u{274C}' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'opticien-m2-l3',
          title: 'Quiz — Stock et IA predictive',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion de stock assistee par IA.',
          quizQuestions: [
            {
              question: 'Quelle strategie l\'IA recommande-t-elle pour les montures "poids morts" ?',
              options: ['Reapprovisionner en priorite', 'Les mettre en avant', 'Les solder', 'Les garder en reserve'],
              correctIndex: 2,
              explanation: 'Les montures a faible marge et faible rotation doivent etre soldees pour liberer de la tresorerie et de l\'espace.',
            },
            {
              question: 'Sur quelle periode l\'IA analyse-t-elle l\'historique de ventes ?',
              options: ['1 mois', '3 mois', '12 mois', '5 ans'],
              correctIndex: 2,
              explanation: 'L\'analyse porte sur 12 mois pour capturer les patterns saisonniers complets.',
            },
            {
              question: 'Comment l\'IA detecte-t-elle les tendances mode a venir ?',
              options: [
                'Elle interroge les fournisseurs',
                'Elle analyse les reseaux sociaux, publications mode et recherches en ligne',
                'Elle sonde les clients en magasin',
                'Elle attend les retours des salons professionnels',
              ],
              correctIndex: 1,
              explanation: 'L\'IA surveille les reseaux sociaux, les publications mode et les tendances de recherche pour anticiper la demande.',
            },
            {
              question: 'A quelle frequence l\'IA genere-t-elle une proposition de commande ?',
              options: ['Quotidiennement', 'Chaque semaine', 'Chaque mois', 'Chaque trimestre'],
              correctIndex: 1,
              explanation: 'Une proposition hebdomadaire permet de reagir rapidement aux variations de ventes tout en restant gerablement.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F453}',
      badgeName: 'Gestionnaire Stock',
    },

    // Module 3 — Tiers payant automatise
    {
      id: 'opticien-m3',
      title: 'Tiers payant automatise',
      emoji: '\u{1F4B3}',
      description: 'Simplifiez la gestion du tiers payant et des mutuelles avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m3-l1',
          title: 'Automatiser le tiers payant avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le tiers payant est le cauchemar administratif de tout opticien. Entre la Securite sociale (base AMO), les centaines de mutuelles (AMC) avec chacune leurs propres grilles de remboursement, les rejets de factures, les relances et les impayés, un opticien consacre en moyenne 2 heures par jour a la gestion administrative. L'IA va diviser ce temps par trois. \u{1F4B3}

L'assistant Freenzy commence par identifier automatiquement la mutuelle du client a partir de sa carte de tiers payant ou de son attestation. Il interroge les bases de donnees des organismes complementaires et recupere en temps reel les droits du patient : plafonds de remboursement par poste (monture, verres, options), reste a charge estime, et delais de carence eventuels. Plus besoin de chercher manuellement dans les tableaux de garanties.

Le calcul du devis devient instantane. Vous selectionnez la monture et les verres, et l'IA affiche immediatement la part Secu, la part mutuelle et le reste a charge client. Si le client depasse son plafond, l'IA propose des alternatives : changer de gamme de verres, opter pour une monture moins couteuse, ou fractionner l'equipement (lunettes de vue maintenant, solaires le mois prochain). Le client voit en transparence ce que chaque option lui coute reellement. \u{1F4CA}

La facturation electronique est geree de bout en bout. L'IA formate les factures selon les normes SESAM-Vitale, transmet les flux aux organismes payeurs et suit les retours de paiement. En cas de rejet, elle analyse automatiquement le motif (erreur de codification, droits expires, depassement de plafond) et vous propose la correction a appliquer.

Les relances sont automatisees avec intelligence. L'IA identifie les factures impayees depuis plus de 30 jours, genere les courriers de relance adaptes au type d'organisme, et escalade progressivement. Pour les cas complexes (contentieux, mutuelles en difficulte), elle vous alerte pour une intervention manuelle. Resultat : le taux de recouvrement passe de 85% a 97%. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m3-l2',
          title: 'Exercice : Calculer un devis tiers payant',
          duration: '3 min',
          type: 'exercise',
          content: 'Simulez un devis complet avec calcul tiers payant automatise.',
          exercisePrompt: `Un client se presente avec l'ordonnance suivante et sa carte mutuelle :
- Verres progressifs Essilor Varilux Comfort (tarif : 280€/verre)
- Monture Ray-Ban RB5228 (tarif : 145€)
- Mutuelle : niveau 3 (plafond monture 100€, plafond verres 200€/verre, base Secu incluse)
- Base Secu : 2.84€/verre + 2.84€ monture

Calculez avec l'assistant IA :
1. Le montant total de l'equipement
2. La part Securite sociale
3. La part mutuelle (en respectant les plafonds)
4. Le reste a charge client
5. Proposez une alternative si le client veut reduire son reste a charge.`,
          xpReward: 20,
        },
        {
          id: 'opticien-m3-l3',
          title: 'Quiz — Tiers payant et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'automatisation du tiers payant.',
          quizQuestions: [
            {
              question: 'Combien de temps un opticien consacre-t-il en moyenne par jour a l\'administratif sans IA ?',
              options: ['30 minutes', '1 heure', '2 heures', '4 heures'],
              correctIndex: 2,
              explanation: 'En moyenne, un opticien passe 2 heures par jour sur la gestion administrative du tiers payant.',
            },
            {
              question: 'Quel taux de recouvrement l\'IA permet-elle d\'atteindre ?',
              options: ['85%', '90%', '95%', '97%'],
              correctIndex: 3,
              explanation: 'Grace aux relances automatisees et au suivi intelligent, le taux de recouvrement passe de 85% a 97%.',
            },
            {
              question: 'Que fait l\'IA en cas de rejet de facture ?',
              options: [
                'Elle abandonne la facturation',
                'Elle analyse le motif et propose la correction',
                'Elle contacte directement la mutuelle',
                'Elle rembourse le client',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse automatiquement le motif du rejet et propose la correction appropriee.',
            },
            {
              question: 'Que propose l\'IA quand un client depasse son plafond mutuelle ?',
              options: [
                'Elle refuse la vente',
                'Elle propose des alternatives pour reduire le reste a charge',
                'Elle augmente le plafond',
                'Elle facture tout au client',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des alternatives concretes : gamme differente, monture moins couteuse, ou fractionnement de l\'equipement.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B3}',
      badgeName: 'Expert Tiers Payant',
    },

    // Module 4 — Conseil client personnalise
    {
      id: 'opticien-m4',
      title: 'Conseil client personnalise',
      emoji: '\u{1F5E3}\u{FE0F}',
      description: 'Offrez un conseil sur-mesure a chaque client grace a l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m4-l1',
          title: 'Le conseil client augmente par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le conseil client est le coeur du metier d'opticien. Au-dela de la vente de lunettes, vous etes un professionnel de sante qui guide ses clients vers le meilleur equipement pour leur vue et leur mode de vie. L'IA ne remplace pas cette expertise humaine — elle l'amplifie en vous donnant des informations precieuses que vous n'auriez pas autrement. \u{1F5E3}\u{FE0F}

Quand un client entre dans votre magasin, l'assistant Freenzy affiche instantanement sa fiche complete : historique d'achats, prescriptions precedentes, preferences de style (formes, couleurs, marques favorites), budget habituel et eventuelles reclamations passees. Vous n'avez plus a poser des questions que le client a deja repondues lors de visites precedentes. Cette memoire augmentee cree un sentiment de reconnaissance que le client apprecie enormement.

L'IA propose aussi un profil visagiste automatique. A partir d'une photo du client (prise avec son consentement), elle analyse la forme du visage, la couleur de peau et des cheveux, et suggere les formes et couleurs de montures les plus flatteuses. Le client peut visualiser les suggestions directement sur sa photo, creant une experience d'essayage virtuel ludique et efficace. \u{2728}

Pour les verres, l'IA genere des recommandations basees sur le mode de vie du client. Un etudiant qui passe 8 heures par jour devant un ecran se verra proposer un traitement anti-lumiere bleue. Un commercial qui conduit beaucoup recevra une suggestion de verres photochromiques. Un sportif sera oriente vers des montures incassables avec verres polarises. Chaque recommandation est argumentee et le client comprend pourquoi cette option lui correspond.

Le systeme gere egalement les objections courantes. Quand un client hesite sur le prix, l'IA vous suggere des arguments personnalises : cout journalier (ramene a 2 ans d'utilisation), comparaison avec ses depenses habituelles, ou avantages concrets par rapport a l'option moins chere. Vous restez authentique dans votre conseil tout en ayant les bons arguments au bon moment. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m4-l2',
          title: 'Jeu : Associer profil client et recommandation',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque profil de client a la recommandation IA appropriee.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Etudiant, 8h/jour sur ecran', right: 'Verres anti-lumiere bleue' },
              { left: 'Commercial, beaucoup de conduite', right: 'Verres photochromiques' },
              { left: 'Sportif, activites outdoor', right: 'Monture incassable + verres polarises' },
              { left: 'Presbyte, usage lecture + ecran', right: 'Verres progressifs derniere generation' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'opticien-m4-l3',
          title: 'Quiz — Conseil client et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le conseil client assiste par IA.',
          quizQuestions: [
            {
              question: 'Que fait l\'IA quand un client entre dans le magasin ?',
              options: [
                'Elle lui envoie un SMS de bienvenue',
                'Elle affiche sa fiche complete avec historique et preferences',
                'Elle lui propose un rendez-vous',
                'Elle active une alarme',
              ],
              correctIndex: 1,
              explanation: 'L\'IA affiche instantanement la fiche client complete pour permettre un conseil personnalise des les premieres secondes.',
            },
            {
              question: 'Sur quoi se base le profil visagiste automatique ?',
              options: [
                'Les preferences declarees du client',
                'La photo analysee : forme du visage, couleur de peau et cheveux',
                'Les tendances mode du moment',
                'Les ventes precedentes du magasin',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse la photo du client pour determiner les formes et couleurs de montures les plus adaptees a sa morphologie.',
            },
            {
              question: 'Comment l\'IA aide-t-elle face a un client qui hesite sur le prix ?',
              options: [
                'Elle propose un rabais automatique',
                'Elle suggere des arguments personnalises comme le cout journalier',
                'Elle appelle le manager',
                'Elle ignore l\'objection',
              ],
              correctIndex: 1,
              explanation: 'L\'IA fournit des arguments personnalises : cout journalier, comparaison avec les habitudes du client, avantages concrets.',
            },
            {
              question: 'Pourquoi la memoire augmentee est-elle importante pour le client ?',
              options: [
                'Elle permet de facturer plus',
                'Elle cree un sentiment de reconnaissance et evite les questions repetitives',
                'Elle remplace le vendeur',
                'Elle accelere le paiement',
              ],
              correctIndex: 1,
              explanation: 'Le client apprecie de ne pas repeter ses preferences et se sent reconnu, ce qui renforce la fidelite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F5E3}\u{FE0F}',
      badgeName: 'Conseiller Expert',
    },

    // Module 5 — Marketing local
    {
      id: 'opticien-m5',
      title: 'Marketing local avec l\'IA',
      emoji: '\u{1F4E2}',
      description: 'Attirez de nouveaux clients dans votre magasin grace au marketing IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m5-l1',
          title: 'Booster votre visibilite locale',
          duration: '4 min',
          type: 'text',
          content: `Pour un opticien, la zone de chalandise est locale : la majorite de vos clients vivent ou travaillent dans un rayon de 5 a 10 kilometres autour de votre magasin. Le marketing local est donc crucial, mais il est souvent mal exploite. L'IA va vous aider a capter l'attention des bonnes personnes, au bon moment, avec le bon message. \u{1F4E2}

L'assistant Freenzy commence par optimiser votre presence Google. Votre fiche Google Business Profile est analysee et enrichie automatiquement : photos professionnelles de votre magasin, description optimisee avec les bons mots-cles (opticien + nom de ville, lunettes pas cher + quartier), horaires toujours a jour, et reponses personnalisees aux avis clients. L'IA redige ces reponses en adaptant le ton : chaleureux pour un avis positif, empathique et constructif pour un avis negatif.

Les campagnes sur les reseaux sociaux sont generees automatiquement. L'IA cree un calendrier editorial mensuel avec des posts adaptes a votre activite : mise en avant des nouvelles collections, conseils sante visuelle (saviez-vous que 80% des informations arrivent par les yeux ?), coulisses du magasin, et promotions saisonnieres. Chaque post est optimise pour l'engagement avec des visuels generes par IA et des textes accrocheurs. \u{1F4F1}

Le ciblage publicitaire local est particulierement puissant. L'IA identifie les moments cles ou vos prospects sont les plus receptifs : rentree scolaire (controle de vue des enfants), changement de saison (solaires), debut d'annee (nouvelles resolutions sante). Elle cree des campagnes Google Ads et Facebook Ads geo-ciblees avec un budget optimise. Chaque euro investi est trace et l'IA ajuste les encheres en temps reel pour maximiser le retour.

L'IA genere aussi des partenariats locaux intelligents. Elle identifie les ophtalmologistes, pediatres, ecoles et entreprises de votre zone et vous propose des actions croisees : depistage gratuit dans une ecole, offre employee pour une entreprise voisine, ou carte de recommandation croisee avec un ophtalmologiste. Ces partenariats generent un flux de clients qualifies a cout quasi nul. \u{1F91D}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m5-l2',
          title: 'Exercice : Creer une campagne locale',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez une campagne marketing locale avec l\'IA.',
          exercisePrompt: `Vous etes opticien a Lyon 3eme, quartier Part-Dieu. La rentree scolaire approche (septembre).

Utilisez l'assistant Freenzy pour creer une campagne locale :
1. Redigez 3 posts reseaux sociaux differents (Facebook, Instagram, Google)
2. Definissez une offre rentree attractive (controle de vue enfants + equipement)
3. Identifiez 3 partenaires locaux potentiels et proposez une action croisee
4. Fixez un budget publicitaire pour 2 semaines et definissez les KPIs a suivre.`,
          xpReward: 20,
        },
        {
          id: 'opticien-m5-l3',
          title: 'Quiz — Marketing local',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le marketing local assiste par IA.',
          quizQuestions: [
            {
              question: 'Quel est le rayon de chalandise typique d\'un opticien ?',
              options: ['1 km', '5 a 10 km', '20 km', '50 km'],
              correctIndex: 1,
              explanation: 'La majorite des clients d\'un opticien vivent ou travaillent dans un rayon de 5 a 10 km autour du magasin.',
            },
            {
              question: 'Comment l\'IA repond-elle a un avis negatif sur Google ?',
              options: [
                'Elle supprime l\'avis',
                'Elle repond de maniere empathique et constructive',
                'Elle ignore l\'avis',
                'Elle signale l\'avis comme abusif',
              ],
              correctIndex: 1,
              explanation: 'L\'IA redige une reponse empathique et constructive qui montre au client (et aux prospects) que vous prenez les retours au serieux.',
            },
            {
              question: 'Quel type de partenariat local l\'IA suggere-t-elle ?',
              options: [
                'Des partenariats avec des opticiens concurrents',
                'Des actions croisees avec ophtalmologistes, ecoles et entreprises locales',
                'Des partenariats avec des marques internationales',
                'Des partenariats avec des influenceurs parisiens',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les partenaires locaux pertinents pour generer des flux de clients qualifies a moindre cout.',
            },
            {
              question: 'Comment l\'IA optimise-t-elle le budget publicitaire ?',
              options: [
                'Elle depense tout le premier jour',
                'Elle ajuste les encheres en temps reel selon les performances',
                'Elle divise le budget en parts egales',
                'Elle choisit uniquement la plateforme la moins chere',
              ],
              correctIndex: 1,
              explanation: 'L\'IA ajuste les encheres en temps reel pour maximiser le retour sur chaque euro investi.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E2}',
      badgeName: 'Marketeur Local',
    },

    // Module 6 — Fidelisation client
    {
      id: 'opticien-m6',
      title: 'Fidelisation intelligente',
      emoji: '\u{2764}\u{FE0F}',
      description: 'Construisez une fidelite durable avec vos clients grace a l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'opticien-m6-l1',
          title: 'Fideliser ses clients avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `En optique, le cycle d'achat est long : un client renouvelle ses lunettes en moyenne tous les 2 a 3 ans. Ce delai rend la fidelisation a la fois cruciale et complexe. Il faut maintenir le lien pendant des mois sans contact commercial, et faire en sorte que le client revienne naturellement chez vous plutot que chez un concurrent ou un site internet. L'IA transforme cette relation dormante en relation vivante et personnalisee. \u{2764}\u{FE0F}

L'assistant Freenzy met en place un programme de fidelite intelligent, bien au-dela de la simple carte a points. Chaque client recoit des communications personnalisees selon son profil et son historique. Un porteur de progressifs recevra des conseils d'adaptation, un parent sera informe des signes de trouble visuel chez l'enfant, un sportif decouvrira les nouveautes en verres polarises. Ces contenus ne sont jamais percus comme de la publicite mais comme un service utile.

Les rappels de renouvellement sont le nerf de la guerre. L'IA calcule la date optimale de relance pour chaque client : environ 22 mois apres le dernier achat (avant qu'il ne commence a chercher ailleurs), ou plus tot si la prescription a evolue significativement. Le message est personnalise et propose un bilan de vue gratuit — une offre irresistible qui genere 35% de taux de retour. \u{1F4C5}

L'IA met aussi en place des micro-attentions qui font la difference. Un SMS d'anniversaire avec une offre speciale, un message de suivi 2 semaines apres l'achat pour verifier l'adaptation aux nouveaux verres, ou une alerte quand une monture de la marque favorite du client arrive en magasin. Ces petites attentions creent un lien emotionnel fort et differenciant.

Le programme de parrainage est automatise. L'IA identifie vos clients les plus satisfaits (ceux qui ont laisse un avis positif ou qui ont un historique de fidelite long) et leur propose de parrainer un proche avec une offre avantageuse pour les deux parties. Le suivi est automatique : invitation envoyee, rappel, conversion, recompense creditee. Le cout d'acquisition d'un client parraine est 3 fois inferieur a celui d'un client publicitaire. \u{1F31F}`,
          xpReward: 15,
        },
        {
          id: 'opticien-m6-l2',
          title: 'Jeu : Chronologie de fidelisation',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes de fidelisation d\'un client opticien.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Achat des lunettes et configuration du profil client',
              'SMS de suivi a J+14 pour verifier l\'adaptation',
              'Newsletter personnalisee trimestrielle avec conseils sante',
              'SMS d\'anniversaire avec offre speciale',
              'Rappel de renouvellement a 22 mois',
              'Bilan de vue gratuit et nouvel equipement',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'opticien-m6-l3',
          title: 'Quiz — Fidelisation et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la fidelisation assistee par IA.',
          quizQuestions: [
            {
              question: 'Tous les combien un client renouvelle-t-il ses lunettes en moyenne ?',
              options: ['6 mois', '1 an', '2 a 3 ans', '5 ans'],
              correctIndex: 2,
              explanation: 'Le cycle de renouvellement moyen en optique est de 2 a 3 ans.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle le rappel de renouvellement ?',
              options: ['6 mois apres l\'achat', '12 mois apres', '22 mois apres', '36 mois apres'],
              correctIndex: 2,
              explanation: 'Le rappel est envoye vers 22 mois, avant que le client ne commence a chercher ailleurs.',
            },
            {
              question: 'Quel est le taux de retour genere par l\'offre de bilan gratuit ?',
              options: ['10%', '20%', '35%', '50%'],
              correctIndex: 2,
              explanation: 'Le bilan de vue gratuit genere un taux de retour de 35%, ce qui est remarquable dans le secteur.',
            },
            {
              question: 'Pourquoi le parrainage est-il si rentable pour un opticien ?',
              options: [
                'Parce que les clients parraines achetent plus cher',
                'Parce que le cout d\'acquisition est 3 fois inferieur a la publicite',
                'Parce que les parrains paient les lunettes du filleul',
                'Parce que les mutuelles remboursent le parrainage',
              ],
              correctIndex: 1,
              explanation: 'Un client acquis par parrainage coute 3 fois moins qu\'un client acquis par publicite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2764}\u{FE0F}',
      badgeName: 'Fidelisateur Pro',
    },
  ],
};

// =============================================================================
// 2. Negociation IA
// =============================================================================

export const parcoursNegociation: FormationParcours = {
  id: 'negociation-ia',
  title: 'Negociation assistee par l\'IA',
  emoji: '\u{1F91D}',
  description: 'Maitrisez l\'art de la negociation avec l\'IA : preparation strategique, techniques avancees, gestion des objections, closing, approche win-win et suivi post-negociation.',
  category: 'business',
  subcategory: 'vente',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#10B981',
  diplomaTitle: 'Negociateur IA',
  diplomaSubtitle: 'Certification Freenzy.io — Negociation assistee par l\'IA',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Preparation strategique
    {
      id: 'nego-m1',
      title: 'Preparation strategique',
      emoji: '\u{1F3AF}',
      description: 'Preparez vos negociations avec une analyse IA approfondie.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m1-l1',
          title: 'L\'IA, votre coach de preparation',
          duration: '4 min',
          type: 'text',
          content: `La preparation est responsable de 80% du succes d'une negociation. Pourtant, la plupart des professionnels arrivent sous-prepares : ils connaissent leur offre mais ignorent les enjeux reels de leur interlocuteur, ses alternatives, ses contraintes internes et ses leviers de decision. L'IA transforme cette preparation approximative en analyse strategique methodique et exhaustive. \u{1F3AF}

L'assistant Freenzy commence par un briefing structure. Vous lui decrivez le contexte : qui est votre interlocuteur, quel est l'enjeu, quelle est votre proposition et quel resultat ideal visez-vous. A partir de ces elements, l'IA genere un dossier de preparation complet. Elle recherche des informations publiques sur l'entreprise ou la personne (actualites recentes, resultats financiers, recrutements en cours, posts LinkedIn), et en deduit des hypotheses sur leurs priorites actuelles.

L'IA vous aide ensuite a definir votre BATNA (Best Alternative To Negotiated Agreement) — votre meilleure alternative si la negociation echoue. C'est le fondement de votre pouvoir de negociation. Si votre BATNA est forte (vous avez d'autres clients interesses), vous negociez en confiance. Si elle est faible, l'IA vous aide a la renforcer avant meme d'entrer en negociation, par exemple en relancant d'autres prospects. \u{1F4CA}

Le dossier inclut une cartographie des interets. L'IA distingue les positions (ce que l'autre partie demande) des interets sous-jacents (pourquoi elle le demande). Par exemple, un client qui demande un rabais de 20% n'a peut-etre pas un probleme de budget mais un besoin de montrer a sa hierarchie qu'il a negocie. L'IA vous propose des solutions creatives qui satisfont l'interet reel sans sacrifier votre marge.

Enfin, l'IA simule les scenarios possibles. Elle identifie les 3 issues les plus probables (accord rapide, negociation longue, blocage) et prepare pour chacune un plan d'action : arguments cles, concessions possibles, points de rupture. Vous entrez en negociation avec une feuille de route claire et la confiance de quelqu'un qui a anticipe chaque situation. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'nego-m1-l2',
          title: 'Exercice : Preparer un dossier de negociation',
          duration: '3 min',
          type: 'exercise',
          content: 'Construisez un dossier de preparation complet avec l\'IA.',
          exercisePrompt: `Vous devez negocier le renouvellement d'un contrat de prestation informatique avec un client historique (3 ans). Le client vous informe qu'un concurrent propose 15% moins cher.

Avec l'assistant Freenzy, preparez votre negociation :
1. Identifiez votre BATNA et evaluez sa force (de 1 a 10)
2. Listez 3 interets sous-jacents possibles du client (au-dela du prix)
3. Definissez votre zone d'accord possible (prix plancher, prix ideal, prix d'ouverture)
4. Preparez 3 concessions non-financieres que vous pourriez offrir
5. Identifiez le scenario le plus probable et votre plan d'action.`,
          xpReward: 20,
        },
        {
          id: 'nego-m1-l3',
          title: 'Quiz — Preparation strategique',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la preparation de negociation.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du succes d\'une negociation depend de la preparation ?',
              options: ['20%', '50%', '80%', '95%'],
              correctIndex: 2,
              explanation: 'La preparation represente environ 80% du succes d\'une negociation selon les experts.',
            },
            {
              question: 'Que signifie BATNA ?',
              options: [
                'Budget Allocated To Negotiation Actions',
                'Best Alternative To Negotiated Agreement',
                'Basic Agreement Template for New Accounts',
                'Bilateral Approach To Negotiation Analysis',
              ],
              correctIndex: 1,
              explanation: 'BATNA (Best Alternative To Negotiated Agreement) designe votre meilleure option si la negociation echoue.',
            },
            {
              question: 'Quelle est la difference entre position et interet ?',
              options: [
                'Il n\'y en a pas',
                'La position est ce qu\'on demande, l\'interet est pourquoi on le demande',
                'La position est ferme, l\'interet est flexible',
                'La position est publique, l\'interet est secret',
              ],
              correctIndex: 1,
              explanation: 'La position est la demande exprimee, l\'interet est la motivation reelle sous-jacente.',
            },
            {
              question: 'Combien de scenarios l\'IA simule-t-elle pour la negociation ?',
              options: ['1', '2', '3', '5'],
              correctIndex: 2,
              explanation: 'L\'IA identifie les 3 issues les plus probables : accord rapide, negociation longue, blocage.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Stratege',
    },

    // Module 2 — Techniques de negociation
    {
      id: 'nego-m2',
      title: 'Techniques de negociation',
      emoji: '\u{1F9E0}',
      description: 'Apprenez les techniques de negociation avancees avec l\'aide de l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m2-l1',
          title: 'Les techniques essentielles du negociateur',
          duration: '4 min',
          type: 'text',
          content: `Les meilleurs negociateurs ne sont pas ceux qui parlent le plus, mais ceux qui ecoutent le mieux et posent les bonnes questions. L'IA vous entraine a maitriser les techniques qui font la difference entre un accord mediocre et un accord excellent. Chaque technique est illustree par des scripts concrets que vous pouvez adapter a votre contexte. \u{1F9E0}

La technique de l'ancrage est fondamentale. Celui qui fait la premiere offre influence toute la negociation. L'IA vous aide a calculer votre ancre optimale : suffisamment ambitieuse pour laisser de la marge, mais realiste pour ne pas perdre en credibilite. Elle analyse les prix du marche, les budgets habituels de votre interlocuteur et la valeur percue de votre offre pour determiner le point d'ancrage ideal.

L'ecoute active augmentee par l'IA est un game-changer. Pendant une negociation en visio, l'assistant analyse en temps reel le langage de votre interlocuteur et detecte les signaux faibles : hesitations, mots repetitifs qui revelent une preoccupation, changements de ton qui indiquent un point sensible. Il vous affiche discretement des suggestions : "Il a mentionne 3 fois les delais — c'est probablement sa priorite reelle, pas le prix." \u{1F4AC}

La technique du silence est l'une des plus puissantes et des plus difficiles a maitriser. Apres avoir fait une proposition, taisez-vous. Le premier qui parle perd du terrain. L'IA vous entraine a cette discipline en chronometrant vos silences lors de simulations et en vous montrant comment l'autre partie comble le vide par des concessions ou des informations precieuses.

Le reframing (recadrage) est la technique qui transforme les blocages en opportunites. Quand l'autre partie dit "C'est trop cher", l'IA vous suggere des recadrages : "Si je comprends bien, vous cherchez a maximiser le retour sur investissement. Regardons ensemble le ROI sur 12 mois." Vous deplacez la conversation du cout vers la valeur, et le blocage se desamorce naturellement. L'IA vous propose plusieurs formulations adaptees au style de votre interlocuteur. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'nego-m2-l2',
          title: 'Jeu : Associer technique et situation',
          duration: '3 min',
          type: 'game',
          content: 'Identifiez la technique de negociation adaptee a chaque situation.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Vous faites la premiere offre pour influencer le cadre', right: 'Ancrage' },
              { left: 'Vous vous taisez apres votre proposition', right: 'Technique du silence' },
              { left: '"C\'est trop cher" → "Regardons le ROI sur 12 mois"', right: 'Reframing (recadrage)' },
              { left: 'Vous reprenez les mots de l\'autre pour verifier la comprehension', right: 'Ecoute active / Reformulation' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'nego-m2-l3',
          title: 'Quiz — Techniques de negociation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les techniques de negociation.',
          quizQuestions: [
            {
              question: 'Qui est avantage par la technique de l\'ancrage ?',
              options: [
                'Celui qui parle en dernier',
                'Celui qui fait la premiere offre',
                'Celui qui a le plus gros budget',
                'Celui qui negocie le plus vite',
              ],
              correctIndex: 1,
              explanation: 'Celui qui fait la premiere offre (l\'ancre) influence tout le cadre de la negociation.',
            },
            {
              question: 'Que detecte l\'IA pendant une negociation en visio ?',
              options: [
                'Les mensonges du visage',
                'Les hesitations, mots repetitifs et changements de ton',
                'Le salaire de l\'interlocuteur',
                'Les emails recus en arriere-plan',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les signaux faibles du langage pour identifier les preoccupations reelles.',
            },
            {
              question: 'Que se passe-t-il quand on utilise la technique du silence ?',
              options: [
                'L\'interlocuteur s\'en va',
                'L\'autre partie comble souvent le vide par des concessions ou informations',
                'La negociation s\'arrete definitivement',
                'Le silence est interprete comme un refus',
              ],
              correctIndex: 1,
              explanation: 'Le silence cree une pression psychologique qui pousse souvent l\'interlocuteur a faire des concessions.',
            },
            {
              question: 'A quoi sert le reframing ?',
              options: [
                'A changer de sujet de conversation',
                'A transformer un blocage en opportunite en reorientant la discussion',
                'A reformuler la meme offre differemment',
                'A annuler la negociation',
              ],
              correctIndex: 1,
              explanation: 'Le reframing deplace la conversation (par exemple du cout vers la valeur) pour desamorcer les blocages.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F9E0}',
      badgeName: 'Technicien Nego',
    },

    // Module 3 — Gestion des objections
    {
      id: 'nego-m3',
      title: 'Gestion des objections',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Transformez les objections en opportunites avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m3-l1',
          title: 'Transformer les objections en leviers',
          duration: '4 min',
          type: 'text',
          content: `Les objections ne sont pas des obstacles — ce sont des signaux d'interet. Un interlocuteur qui objecte est un interlocuteur engage dans la discussion. Le vrai danger, c'est celui qui ne dit rien et disparait ensuite. L'IA vous apprend a accueillir chaque objection comme une information precieuse et a la transformer en levier pour avancer vers l'accord. \u{1F6E1}\u{FE0F}

L'assistant Freenzy categorise les objections en quatre types. Les objections de prix ("C'est trop cher") sont les plus frequentes mais rarement les plus importantes — elles masquent souvent un doute sur la valeur. Les objections de timing ("Ce n'est pas le bon moment") revelent un probleme de priorite ou de budget trimestriel. Les objections de concurrence ("Votre concurrent propose mieux") testent votre confiance. Et les objections d'autorite ("Je dois en parler a mon directeur") signalent que vous ne negociez pas avec le bon decideur.

Pour chaque type, l'IA vous fournit un arsenal de reponses testees et efficaces. Face a "C'est trop cher", elle vous suggere : "Qu'est-ce qui vous ferait considerer cet investissement comme rentable ?" Cette question deplace la discussion du prix vers la valeur et vous revele les criteres reels de decision du client. L'IA a analyse des milliers de negociations pour identifier les formulations qui ouvrent la conversation plutot que de la fermer. \u{1F4AC}

La methode LAER est au coeur de l'approche : Listen (ecouter sans interrompre), Acknowledge (reformuler pour montrer la comprehension), Explore (poser des questions pour comprendre l'objection reelle), Respond (repondre de maniere ciblee). L'IA vous guide a travers chaque etape et vous empeche de sauter directement a la reponse — l'erreur la plus courante des negociateurs presses.

L'IA vous entraine aussi a distinguer les vraies objections des fausses. Une vraie objection persiste meme apres votre reponse — c'est un point reellement bloquant. Une fausse objection est un test : si vous repondez calmement et avec assurance, elle disparait. L'IA vous apprend a tester la nature d'une objection avec la question : "Si nous resolvions ce point, seriez-vous pret a avancer ?" La reponse vous dit tout sur la sincerite de l'objection. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'nego-m3-l2',
          title: 'Exercice : Repondre aux objections',
          duration: '3 min',
          type: 'exercise',
          content: 'Entrainez-vous a repondre aux objections avec la methode LAER.',
          exercisePrompt: `Un prospect vous dit : "Votre solution est interessante, mais c'est 30% plus cher que votre concurrent et je dois justifier chaque depense aupres de ma direction financiere."

Utilisez la methode LAER avec l'assistant Freenzy :
1. Listen : Reformulez l'objection telle que vous l'avez comprise
2. Acknowledge : Montrez que vous comprenez sa contrainte (validation directive financiere)
3. Explore : Posez 3 questions pour decouvrir les criteres reels de sa direction
4. Respond : Redigez une reponse qui transforme le surcoute en investissement justifiable
5. Verifiez : est-ce une vraie ou fausse objection ? Comment le tester ?`,
          xpReward: 20,
        },
        {
          id: 'nego-m3-l3',
          title: 'Quiz — Objections et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion des objections.',
          quizQuestions: [
            {
              question: 'Pourquoi une objection est-elle un signal positif ?',
              options: [
                'Parce que le client va bientot acheter',
                'Parce qu\'elle montre que l\'interlocuteur est engage dans la discussion',
                'Parce qu\'elle permet de baisser le prix',
                'Parce qu\'elle met fin a la negociation',
              ],
              correctIndex: 1,
              explanation: 'Un interlocuteur qui objecte est engage. Le vrai danger est celui qui ne dit rien et disparait.',
            },
            {
              question: 'Que signifie le "L" dans la methode LAER ?',
              options: ['Lead', 'Listen', 'Leverage', 'Learn'],
              correctIndex: 1,
              explanation: 'LAER commence par Listen : ecouter l\'objection sans interrompre.',
            },
            {
              question: 'Comment tester si une objection est reelle ou fausse ?',
              options: [
                'En ignorant l\'objection',
                'En demandant "Si nous resolvions ce point, seriez-vous pret a avancer ?"',
                'En baissant immediatement le prix',
                'En changeant de sujet',
              ],
              correctIndex: 1,
              explanation: 'Cette question test revele si l\'objection est un vrai bloqueur ou un simple test.',
            },
            {
              question: 'Que masque souvent une objection de prix ?',
              options: [
                'Un manque de budget reel',
                'Un doute sur la valeur de l\'offre',
                'Une preference pour un concurrent',
                'Un desir d\'arreter la negociation',
              ],
              correctIndex: 1,
              explanation: 'L\'objection de prix masque souvent un doute sur la valeur — deplacer la discussion vers le ROI la desamorce.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Anti-Objections',
    },

    // Module 4 — Closing
    {
      id: 'nego-m4',
      title: 'L\'art du closing',
      emoji: '\u{1F3C6}',
      description: 'Maitrisez les techniques de conclusion de negociation avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m4-l1',
          title: 'Conclure efficacement avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le closing est le moment de verite. Vous avez bien prepare, utilise les bonnes techniques, traite les objections — mais si vous ne savez pas conclure, tout ce travail est perdu. Beaucoup de negociateurs hesitent a ce moment crucial par peur du rejet ou par manque de signal clair. L'IA vous aide a detecter le bon moment et a choisir la bonne technique de closing. \u{1F3C6}

L'assistant Freenzy detecte les signaux d'achat pendant la negociation. Quand votre interlocuteur commence a poser des questions pratiques ("Quels sont vos delais de livraison ?", "Comment fonctionne la facturation ?", "Pouvez-vous commencer lundi ?"), il a mentalement deja accepte. L'IA repere ces signaux et vous suggere discretement : "Signal d'achat detecte — tentez un closing maintenant." Si vous laissez passer ce moment, de nouvelles objections peuvent surgir.

La technique du closing par alternative est la plus naturelle. Au lieu de demander "Est-ce que vous acceptez ?", vous proposez "Preferez-vous demarrer en janvier ou en fevrier ?" Les deux options impliquent un accord. L'IA genere ces alternatives en fonction du contexte : dates, formules, modalites de paiement. Le client a l'impression de choisir plutot que de subir une decision binaire. \u{1F4DD}

Le closing par recapitulation est ideal pour les negociations complexes. L'IA resume automatiquement les points d'accord : "Si je recapitule, nous sommes d'accord sur le perimetre, le budget, les delais et les conditions de paiement. Il ne reste plus qu'a formaliser." Cette technique fonctionne parce qu'elle montre le chemin parcouru ensemble et rend naturel le passage a l'etape suivante.

Parfois, la meilleure technique est la plus simple : demander directement. "Jean, on a couvert tous les sujets. Est-ce qu'on avance ensemble ?" L'IA vous encourage a oser cette question directe quand les signaux sont favorables. Et si la reponse est "pas encore", l'IA vous aide a identifier le dernier point bloquant : "Qu'est-ce qui vous manque pour prendre votre decision ?" Cette question ouvre souvent la derniere ligne droite vers l'accord. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'nego-m4-l2',
          title: 'Jeu : Identifier les signaux d\'achat',
          duration: '3 min',
          type: 'game',
          content: 'Identifiez les phrases qui sont des signaux d\'achat.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: '"Quels sont vos delais de livraison ?"', right: 'Signal d\'achat \u{2705}' },
              { left: '"Je dois en parler a mon directeur"', right: 'Objection d\'autorite \u{26A0}\u{FE0F}' },
              { left: '"Comment fonctionne la facturation ?"', right: 'Signal d\'achat \u{2705}' },
              { left: '"C\'est interessant mais on n\'a pas le budget"', right: 'Objection de budget \u{274C}' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'nego-m4-l3',
          title: 'Quiz — Closing et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les techniques de closing.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'un signal d\'achat ?',
              options: [
                'Un bon de commande signe',
                'Des questions pratiques sur la mise en oeuvre',
                'Un sourire de l\'interlocuteur',
                'Une demande de rabais',
              ],
              correctIndex: 1,
              explanation: 'Les questions pratiques (delais, facturation, demarrage) indiquent que l\'interlocuteur s\'est mentalement projete.',
            },
            {
              question: 'Comment fonctionne le closing par alternative ?',
              options: [
                'On propose "oui ou non"',
                'On propose deux options qui impliquent toutes deux un accord',
                'On donne le choix entre acheter et ne pas acheter',
                'On presente une seule option a prendre ou a laisser',
              ],
              correctIndex: 1,
              explanation: 'Les deux options impliquent un accord — le client choisit les modalites, pas le principe.',
            },
            {
              question: 'Que faire si le client dit "pas encore" apres une tentative de closing ?',
              options: [
                'Abandonner la negociation',
                'Proposer immediatement un rabais',
                'Demander "Qu\'est-ce qui vous manque pour prendre votre decision ?"',
                'Relancer la semaine suivante',
              ],
              correctIndex: 2,
              explanation: 'Cette question identifie le dernier point bloquant et ouvre la derniere ligne droite vers l\'accord.',
            },
            {
              question: 'Pourquoi le closing par recapitulation est-il efficace ?',
              options: [
                'Il met la pression sur l\'interlocuteur',
                'Il montre le chemin parcouru ensemble et rend naturel le passage a l\'action',
                'Il repete l\'offre pour convaincre',
                'Il fait gagner du temps',
              ],
              correctIndex: 1,
              explanation: 'La recapitulation valorise les accords trouves ensemble et rend la conclusion naturelle.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3C6}',
      badgeName: 'Closer Pro',
    },

    // Module 5 — Approche win-win
    {
      id: 'nego-m5',
      title: 'Negociation win-win',
      emoji: '\u{1F932}',
      description: 'Creez des accords gagnant-gagnant durables avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m5-l1',
          title: 'Creer de la valeur pour les deux parties',
          duration: '4 min',
          type: 'text',
          content: `La negociation win-win n'est pas une utopie naive — c'est la strategie la plus rentable a long terme. Un accord ou les deux parties se sentent gagnantes genere des relations durables, des recommandations spontanees et des renouvellements automatiques. A l'inverse, un accord arrache par la force cree du ressentiment et detruit la relation des la premiere difficulte. L'IA vous aide a construire systematiquement des accords gagnant-gagnant. \u{1F932}

Le principe fondamental est l'elargissement du gateau avant le partage. Dans une negociation classique, on se bat pour la plus grosse part d'un gateau fixe. Dans une negociation win-win, on commence par agrandir le gateau. L'IA identifie les elements de valeur que chaque partie peut apporter sans cout significatif pour elle mais avec une forte valeur pour l'autre. Par exemple, vous pouvez offrir une formation gratuite (cout marginal pour vous, forte valeur pour le client) en echange d'un engagement plus long.

L'assistant Freenzy utilise la matrice des interets croises. Il cartographie vos priorites et celles de votre interlocuteur sur deux axes : importance et flexibilite. Les points ou votre flexibilite est elevee mais l'importance pour l'autre est forte sont vos leviers de concession a fort impact. Inversement, les points importants pour vous mais flexibles pour l'autre sont vos gains faciles. L'IA identifie automatiquement ces echanges optimaux. \u{1F4CA}

La transparence strategique est un pilier du win-win. L'IA vous guide pour partager vos contraintes reelles (pas vos positions de negociation) sans vous affaiblir. "Notre marge sur ce produit ne nous permet pas de descendre en dessous de X, mais je peux vous offrir Y qui a une forte valeur pour vous." Cette honnetete selective cree la confiance sans vous rendre vulnerable.

L'IA genere aussi des options creatives que ni vous ni votre interlocuteur n'auriez imaginees seuls. En analysant les besoins des deux parties, elle propose des structures d'accord innovantes : paiement echelonne contre volume garanti, exclusivite geographique contre engagement de duree, partage de risque contre partage de gains. Ces solutions "hors cadre" sont souvent la cle des accords les plus satisfaisants pour tous. \u{1F31F}`,
          xpReward: 15,
        },
        {
          id: 'nego-m5-l2',
          title: 'Exercice : Construire un accord win-win',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez un accord gagnant-gagnant avec l\'IA.',
          exercisePrompt: `Situation : Vous vendez un logiciel SaaS a 500€/mois. Le client veut payer 350€/mois maximum. Vos priorites : marge et engagement long terme. Ses priorites : budget et support reactif.

Avec l'assistant Freenzy, construisez un accord win-win :
1. Identifiez 3 elements de valeur que vous pouvez offrir a faible cout pour vous
2. Identifiez 3 concessions que le client pourrait faire facilement
3. Utilisez la matrice des interets croises pour trouver 2 echanges optimaux
4. Redigez une proposition qui satisfait les deux parties
5. Calculez la valeur totale de l'accord pour chaque partie (vs la position initiale).`,
          xpReward: 20,
        },
        {
          id: 'nego-m5-l3',
          title: 'Quiz — Win-Win et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'approche win-win.',
          quizQuestions: [
            {
              question: 'Que signifie "elargir le gateau" en negociation ?',
              options: [
                'Augmenter le budget de la negociation',
                'Creer de la valeur supplementaire avant de la partager',
                'Inviter plus de personnes a la table',
                'Allonger la duree de la negociation',
              ],
              correctIndex: 1,
              explanation: 'Elargir le gateau signifie trouver des elements de valeur supplementaires pour que les deux parties gagnent plus.',
            },
            {
              question: 'Qu\'est-ce que la matrice des interets croises ?',
              options: [
                'Un tableau de prix comparatifs',
                'Une cartographie des priorites et flexibilites des deux parties',
                'Un outil de calcul de marge',
                'Un document contractuel',
              ],
              correctIndex: 1,
              explanation: 'La matrice croise les priorites et flexibilites pour identifier les echanges optimaux entre les parties.',
            },
            {
              question: 'En quoi consiste la transparence strategique ?',
              options: [
                'Reveler toutes ses informations',
                'Partager ses contraintes reelles sans s\'affaiblir',
                'Mentir de maniere credible',
                'Cacher ses objectifs',
              ],
              correctIndex: 1,
              explanation: 'La transparence strategique consiste a partager honnetement ses contraintes tout en preservant ses leviers.',
            },
            {
              question: 'Quel type de solution l\'IA genere-t-elle pour le win-win ?',
              options: [
                'Des remises commerciales',
                'Des structures d\'accord innovantes combinant les interets des deux parties',
                'Des ultimatums',
                'Des comparaisons avec la concurrence',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des structures creatives : paiement echelonne, exclusivite, partage de risque/gains.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F932}',
      badgeName: 'Win-Win Master',
    },

    // Module 6 — Suivi post-negociation
    {
      id: 'nego-m6',
      title: 'Suivi post-negociation',
      emoji: '\u{1F4E9}',
      description: 'Assurez le succes a long terme grace au suivi post-accord.',
      duration: '8 min',
      lessons: [
        {
          id: 'nego-m6-l1',
          title: 'Le suivi qui transforme un accord en relation',
          duration: '4 min',
          type: 'text',
          content: `La negociation ne se termine pas a la signature. Les meilleurs negociateurs savent que le suivi post-accord est ce qui transforme une transaction ponctuelle en relation durable et profitable. Pourtant, 70% des commerciaux negligent cette phase cruciale — ils passent au prospect suivant et laissent le client se debrouiller. L'IA automatise ce suivi pour que rien ne tombe entre les mailles du filet. \u{1F4E9}

L'assistant Freenzy genere automatiquement un compte-rendu de negociation structure dans les 24 heures suivant l'accord. Ce document reprend les points convenus, les engagements de chaque partie, les delais et les conditions particulières. Il est envoye aux deux parties pour validation, evitant les malentendus futurs. Ce simple document professionnel renforce la confiance et pose les bases d'une execution sans accroc.

Le suivi d'execution est programme automatiquement. L'IA cree un calendrier de jalons : date de livraison, date de premier bilan, date de revue trimestrielle. A chaque jalon, elle vous rappelle de contacter le client et vous genere un email ou message personnalise. "Bonjour Jean, cela fait un mois que nous avons demarre. Comment se passe la prise en main ? Y a-t-il des ajustements a faire ?" Ce suivi proactif detecte les problemes avant qu'ils ne deviennent des litiges. \u{1F4C5}

L'IA capitalise sur chaque negociation pour enrichir votre base de connaissances. Elle analyse ce qui a fonctionne (quels arguments ont ete decisifs, quelles concessions ont debloque la situation) et ce qui n'a pas fonctionne. Ces insights sont stockes et reutilises pour vos negociations futures. Au fil du temps, vous construisez un veritable playbook personnalise de negociation, nourri par l'IA et votre experience.

La gestion de la relation a long terme inclut aussi l'anticipation du renouvellement. L'IA suit les indicateurs de satisfaction du client (usage du produit, tickets de support, interactions) et vous alerte 3 mois avant la fin du contrat avec une recommandation : renouvellement standard, upsell possible, ou risque de churn a traiter. Vous abordez chaque renouvellement en position de force, avec des donnees concretes sur la valeur apportee au client. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'nego-m6-l2',
          title: 'Jeu : Chronologie du suivi post-nego',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes du suivi post-negociation.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Signature de l\'accord',
              'Envoi du compte-rendu de negociation sous 24h',
              'Suivi de prise en main a J+30',
              'Revue trimestrielle a M+3',
              'Analyse des indicateurs de satisfaction a M+9',
              'Anticipation du renouvellement a M-3',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'nego-m6-l3',
          title: 'Quiz — Suivi post-negociation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le suivi post-negociation.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de commerciaux negligent le suivi post-accord ?',
              options: ['30%', '50%', '70%', '90%'],
              correctIndex: 2,
              explanation: '70% des commerciaux negligent le suivi post-accord, ce qui est une erreur majeure.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle le compte-rendu de negociation ?',
              options: ['Immediatement', 'Dans les 24 heures', 'Dans la semaine', 'Au premier jalon'],
              correctIndex: 1,
              explanation: 'Le compte-rendu est genere et envoye sous 24 heures pour validation par les deux parties.',
            },
            {
              question: 'Combien de temps avant la fin du contrat l\'IA alerte-t-elle pour le renouvellement ?',
              options: ['1 mois', '2 mois', '3 mois', '6 mois'],
              correctIndex: 2,
              explanation: 'L\'IA alerte 3 mois avant la fin du contrat avec une recommandation basee sur les indicateurs de satisfaction.',
            },
            {
              question: 'Que capitalise l\'IA apres chaque negociation ?',
              options: [
                'Les coordonnees des participants',
                'Les arguments decisifs, concessions efficaces et erreurs a eviter',
                'Les photos de la reunion',
                'Les factures emises',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse ce qui a fonctionne et echoue pour construire un playbook de negociation personnalise.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E9}',
      badgeName: 'Suivi Expert',
    },
  ],
};

// =============================================================================
// 3. Management IA
// =============================================================================

export const parcoursManagement: FormationParcours = {
  id: 'management-ia',
  title: 'Management assiste par l\'IA',
  emoji: '\u{1F468}\u{200D}\u{1F4BC}',
  description: 'Devenez un manager augmente avec l\'IA : leadership moderne, delegation efficace, feedback constructif, reunions productives, KPIs intelligents et culture d\'equipe.',
  category: 'business',
  subcategory: 'management',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#2563EB',
  diplomaTitle: 'Manager IA',
  diplomaSubtitle: 'Certification Freenzy.io — Management assiste par l\'IA',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Leadership moderne
    {
      id: 'mgmt-m1',
      title: 'Leadership moderne avec l\'IA',
      emoji: '\u{1F451}',
      description: 'Developpez votre style de leadership avec l\'aide de l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m1-l1',
          title: 'Le leader augmente par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le leadership en 2026 ne ressemble plus a celui d'il y a dix ans. Les equipes sont distribuees, les talents volatils, les attentes des collaborateurs ont evolue et le rythme du changement s'accelere. Le manager d'aujourd'hui doit etre a la fois coach, stratege, communicant et facilitateur. L'IA ne remplace aucune de ces competences humaines — elle les amplifie en liberant du temps et en fournissant des insights impossibles a obtenir manuellement. \u{1F451}

L'assistant Freenzy analyse votre style de leadership a partir de vos interactions quotidiennes : emails envoyes, feedbacks donnes, decisions prises, temps passe en reunion versus en one-to-one. Il en deduit votre profil dominant (directif, participatif, delegatif ou coaching) et vous montre comment ce style impacte chaque membre de votre equipe differemment. Un collaborateur junior a besoin de directivite, un senior de delegation — l'IA vous aide a adapter votre posture en temps reel.

L'intelligence emotionnelle augmentee est l'un des apports les plus precieux. L'IA detecte les signaux faibles dans les communications de votre equipe : baisse de reactivite, ton inhabituel dans les messages, absences repetees. Elle vous alerte discretement : "Sophie a mis 3 fois plus de temps a repondre cette semaine et son ton est plus bref que d'habitude. Un point individuel pourrait etre utile." Vous intervenez avant que le mal-etre ne se transforme en demission. \u{1F4CA}

La prise de decision strategique est structuree par l'IA. Pour chaque decision importante, elle vous propose un framework : quel est l'enjeu, quelles sont les options, quels sont les criteres de choix, qui est impacte, et quel est le risque de chaque option. Elle ne decide pas a votre place, mais elle s'assure que vous n'avez rien oublie. Les managers qui utilisent ce processus structure prennent des decisions 40% plus rapides et 25% meilleures en termes de resultats.

L'IA vous aide aussi a developper votre vision et a la communiquer. Elle analyse les tendances de votre secteur, les mouvements de vos concurrents et les attentes de vos clients pour nourrir votre reflexion strategique. Elle vous aide ensuite a formuler cette vision en messages clairs et inspirants pour votre equipe. Un leader qui voit loin et communique bien est un leader que les talents suivent. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m1-l2',
          title: 'Exercice : Diagnostiquer son style de leadership',
          duration: '3 min',
          type: 'exercise',
          content: 'Analysez votre profil de leadership avec l\'IA.',
          exercisePrompt: `Avec l'assistant Freenzy, faites votre diagnostic de leadership :

1. Decrivez comment vous gerez typiquement ces 3 situations :
   a) Un collaborateur fait une erreur sur un livrable client
   b) Vous devez annoncer un changement de strategie a l'equipe
   c) Un conflit eclate entre deux membres de l'equipe

2. A partir de vos reponses, identifiez votre style dominant (directif, participatif, delegatif, coaching)
3. Listez 2 situations ou votre style est un atout et 2 ou il est une limite
4. Definissez 3 actions concretes pour enrichir votre palette de leadership.`,
          xpReward: 20,
        },
        {
          id: 'mgmt-m1-l3',
          title: 'Quiz — Leadership et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le leadership augmente.',
          quizQuestions: [
            {
              question: 'Quels sont les 4 styles de leadership identifies par l\'IA ?',
              options: [
                'Autoritaire, laxiste, absent, micromanager',
                'Directif, participatif, delegatif, coaching',
                'Technique, commercial, financier, humain',
                'Junior, intermediaire, senior, expert',
              ],
              correctIndex: 1,
              explanation: 'Les 4 styles sont directif, participatif, delegatif et coaching — chacun adapte a des situations differentes.',
            },
            {
              question: 'Que detecte l\'IA dans les communications de l\'equipe ?',
              options: [
                'Les fautes d\'orthographe',
                'Les signaux faibles de mal-etre : baisse de reactivite, ton inhabituel',
                'Les messages personnels',
                'Le nombre de mots par message',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les changements de comportement (reactivite, ton) qui peuvent indiquer un mal-etre.',
            },
            {
              question: 'De combien l\'IA ameliore-t-elle la prise de decision structuree ?',
              options: [
                '10% plus rapide',
                '25% plus rapide et 10% meilleure',
                '40% plus rapide et 25% meilleure',
                '80% plus rapide et 50% meilleure',
              ],
              correctIndex: 2,
              explanation: 'Les decisions prises avec un processus structure IA sont 40% plus rapides et 25% meilleures en resultats.',
            },
            {
              question: 'Pourquoi adapter son style de leadership selon le collaborateur ?',
              options: [
                'Pour eviter les conflits',
                'Parce qu\'un junior a besoin de directivite et un senior de delegation',
                'Pour montrer qu\'on est flexible',
                'Pour impressionner sa hierarchie',
              ],
              correctIndex: 1,
              explanation: 'Chaque collaborateur a des besoins differents : directivite pour les juniors, delegation pour les seniors.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F451}',
      badgeName: 'Leader Moderne',
    },

    // Module 2 — Delegation efficace
    {
      id: 'mgmt-m2',
      title: 'Delegation efficace',
      emoji: '\u{1F4E4}',
      description: 'Apprenez a deleguer efficacement avec le support de l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m2-l1',
          title: 'L\'art de deleguer avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La delegation est la competence numero un qui differencie un manager qui s'epuise d'un manager qui fait grandir son equipe. Pourtant, 60% des managers avouent avoir du mal a deleguer — par peur de perdre le controle, par manque de confiance envers leurs collaborateurs, ou simplement parce qu'ils pensent aller plus vite en faisant eux-memes. L'IA vous aide a surmonter ces freins et a deleguer de maniere structuree et sereine. \u{1F4E4}

L'assistant Freenzy commence par cartographier les competences de votre equipe. Pour chaque membre, il analyse les taches realisees, les resultats obtenus, les domaines d'expertise et les axes de progression. Cette matrice de competences vous montre instantanement qui est le mieux place pour chaque type de tache. Vous ne deleguez plus au hasard ou par habitude, mais de maniere strategique en fonction des forces de chacun.

Le framework de delegation RACI augmente par l'IA est votre meilleur allie. Pour chaque projet ou tache, l'IA vous aide a definir clairement qui est Responsable (fait le travail), qui est Accountable (valide le resultat), qui doit etre Consulte et qui doit etre Informe. Cette clarte elimine les zones grises qui causent 80% des problemes de delegation : "Je pensais que c'etait toi qui devais le faire." \u{1F4CB}

L'IA genere automatiquement des briefs de delegation structures. Quand vous decidez de confier une tache, elle vous aide a formuler : l'objectif (quoi), le contexte (pourquoi), les contraintes (delais, budget, qualite), le niveau d'autonomie (decision libre, proposition a valider, ou execution stricte), et les points de controle intermediaires. Un brief clair prend 5 minutes a rediger avec l'IA et fait gagner des heures de malentendus.

Le suivi est le maillon faible de la delegation classique. Trop de controle etouffe l'autonomie, pas assez mene a des surprises de derniere minute. L'IA propose un systeme de checkpoints adaptatifs : frequents au debut (pour rassurer les deux parties), puis espaces a mesure que la confiance s'installe. Elle vous envoie des rappels aux moments cles et collecte le statut aupres du collaborateur sans que vous ayez a micromanager. Vous gardez la visibilite sans briser la confiance. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m2-l2',
          title: 'Jeu : Construire une matrice RACI',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque role RACI a sa definition.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Fait le travail concretement', right: 'Responsible' },
              { left: 'Valide le resultat final', right: 'Accountable' },
              { left: 'Donne son avis avant la decision', right: 'Consulted' },
              { left: 'Est tenu au courant du resultat', right: 'Informed' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'mgmt-m2-l3',
          title: 'Quiz — Delegation et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la delegation assistee par IA.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de managers a du mal a deleguer ?',
              options: ['20%', '40%', '60%', '80%'],
              correctIndex: 2,
              explanation: '60% des managers avouent avoir du mal a deleguer efficacement.',
            },
            {
              question: 'Quel pourcentage des problemes de delegation vient du manque de clarte ?',
              options: ['20%', '50%', '80%', '95%'],
              correctIndex: 2,
              explanation: '80% des problemes de delegation sont causes par des zones grises dans les responsabilites.',
            },
            {
              question: 'Que contient un brief de delegation genere par l\'IA ?',
              options: [
                'Seulement la deadline',
                'L\'objectif, le contexte, les contraintes, le niveau d\'autonomie et les checkpoints',
                'Le salaire du collaborateur',
                'La liste de tous les projets en cours',
              ],
              correctIndex: 1,
              explanation: 'Un brief complet inclut objectif, contexte, contraintes, autonomie et points de controle.',
            },
            {
              question: 'Comment l\'IA adapte-t-elle la frequence des checkpoints ?',
              options: [
                'Toujours quotidiens',
                'Frequents au debut, puis espaces a mesure que la confiance s\'installe',
                'Uniquement a la fin du projet',
                'Jamais, pour ne pas micromanager',
              ],
              correctIndex: 1,
              explanation: 'Les checkpoints sont adaptatifs : frequents au debut pour rassurer, puis espaces avec la confiance.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E4}',
      badgeName: 'Delegateur Pro',
    },

    // Module 3 — Feedback constructif
    {
      id: 'mgmt-m3',
      title: 'Feedback constructif',
      emoji: '\u{1F4AC}',
      description: 'Maitrisez l\'art du feedback avec l\'IA comme coach.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m3-l1',
          title: 'Donner un feedback qui fait grandir',
          duration: '4 min',
          type: 'text',
          content: `Le feedback est l'outil de developpement le plus puissant d'un manager — et le plus redoute. 40% des managers evitent de donner du feedback negatif par peur de la reaction du collaborateur. Resultat : les problemes persistent, les talents stagnent et les meilleurs partent chercher ailleurs un manager qui les fait progresser. L'IA vous aide a structurer, formuler et delivrer des feedbacks qui font vraiment grandir vos collaborateurs. \u{1F4AC}

L'assistant Freenzy utilise le modele SBI (Situation, Behavior, Impact) comme base de tout feedback. Au lieu de dire "Tu n'es pas assez rigoureux" (jugement vague et blessant), l'IA vous aide a formuler : "Lors de la presentation client de mardi (Situation), le rapport contenait 3 erreurs de chiffres (Behavior), ce qui a reduit la credibilite de notre equipe aupres du client (Impact)." Ce format est factuel, specifique et actionnable — le collaborateur sait exactement quoi ameliorer.

L'IA va plus loin en analysant le profil du destinataire pour adapter le ton et l'approche. Un collaborateur analytique appreciera des donnees precises et des exemples concrets. Un collaborateur relationnel sera plus receptif si vous commencez par reconnaitre ses efforts. Un collaborateur ambitieux repondra mieux si le feedback est lie a son evolution de carriere. L'IA vous suggere l'angle d'attaque le plus efficace pour chaque personne. \u{1F3AF}

Le feedback positif est aussi important que le correctif — et souvent plus neglige. L'IA vous rappelle de celebrer les reussites et vous aide a formuler des reconnaissances specifiques. "Bravo pour le projet X" est generique. "Ta capacite a reorganiser le planning en urgence quand le client a change le scope a permis de livrer dans les temps — c'est exactement le type d'agilite dont l'equipe a besoin" est memorable et motivant.

Le timing est crucial. L'IA vous alerte quand un feedback est necessaire (dans les 48 heures suivant l'evenement) et quand il vaut mieux attendre (si les emotions sont trop vives, ou si le collaborateur traverse une periode difficile). Elle vous aide aussi a preparer les entretiens annuels en compilant tous les feedbacks donnes pendant l'annee, avec les progres constates. L'evaluation devient une synthese naturelle plutot qu'un exercice bureaucratique. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m3-l2',
          title: 'Exercice : Reformuler un feedback en SBI',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez des feedbacks vagues en feedbacks SBI structures.',
          exercisePrompt: `Avec l'assistant Freenzy, reformulez ces 3 feedbacks vagues en format SBI :

1. Feedback vague : "Tu es toujours en retard aux reunions"
   → Reformulez en Situation / Behavior / Impact

2. Feedback vague : "Ton travail n'est pas assez bon"
   → Reformulez en Situation / Behavior / Impact

3. Feedback vague : "Tu es super, continue comme ca"
   → Reformulez en feedback positif specifique et memorable

4. Pour chacun, indiquez le profil de collaborateur (analytique, relationnel, ambitieux) et adaptez le ton.`,
          xpReward: 20,
        },
        {
          id: 'mgmt-m3-l3',
          title: 'Quiz — Feedback et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le feedback constructif.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de managers evite de donner du feedback negatif ?',
              options: ['10%', '25%', '40%', '60%'],
              correctIndex: 2,
              explanation: '40% des managers evitent le feedback negatif par peur de la reaction.',
            },
            {
              question: 'Que signifie SBI dans le modele de feedback ?',
              options: [
                'Simple, Brief, Impactful',
                'Situation, Behavior, Impact',
                'Strategy, Budget, Implementation',
                'Specific, Balanced, Immediate',
              ],
              correctIndex: 1,
              explanation: 'SBI signifie Situation (quand), Behavior (quoi), Impact (quelle consequence).',
            },
            {
              question: 'Dans quel delai un feedback doit-il etre donne apres l\'evenement ?',
              options: ['Immediatement', 'Dans les 48 heures', 'A la fin du mois', 'Lors de l\'entretien annuel'],
              correctIndex: 1,
              explanation: 'Le feedback est optimal dans les 48 heures, quand les faits sont encore frais.',
            },
            {
              question: 'Pourquoi le feedback positif specifique est-il plus efficace que "Bravo" ?',
              options: [
                'Il est plus long',
                'Il precise le comportement a reproduire et sa valeur pour l\'equipe',
                'Il fait plus plaisir',
                'Il est obligatoire dans les entretiens',
              ],
              correctIndex: 1,
              explanation: 'Un feedback positif specifique indique exactement quel comportement est valorise et pourquoi.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4AC}',
      badgeName: 'Coach Feedback',
    },

    // Module 4 — Reunions productives
    {
      id: 'mgmt-m4',
      title: 'Reunions productives',
      emoji: '\u{1F4C5}',
      description: 'Transformez vos reunions en machines a decisions avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m4-l1',
          title: 'Des reunions qui produisent des resultats',
          duration: '4 min',
          type: 'text',
          content: `Les reunions sont le plus grand gaspillage de temps en entreprise. Un cadre passe en moyenne 23 heures par semaine en reunion, et 71% de ces reunions sont considerees comme improductives. Le cout est colossal : si on additionne les salaires horaires des participants, une reunion d'une heure a 8 personnes coute entre 400 et 1200 euros. L'IA va transformer vos reunions de rituels creux en sessions focalisees et productives. \u{1F4C5}

L'assistant Freenzy intervient avant, pendant et apres chaque reunion. Avant : il vous aide a definir si la reunion est vraiment necessaire. 30% des reunions pourraient etre remplacees par un email, un message Slack ou un document partage. L'IA analyse l'objectif declare et vous propose l'alternative la plus efficace. Si la reunion est indispensable, elle genere un ordre du jour structure avec un timing par sujet et le resultat attendu pour chaque point.

L'IA optimise aussi la liste des participants. Trop souvent, des personnes sont invitees "au cas ou" et passent une heure a ecouter des sujets qui ne les concernent pas. L'IA analyse chaque point de l'ordre du jour et vous indique qui doit etre present pour quel sujet. Certains participants n'assistent qu'a une partie de la reunion. Le temps de chacun est respecte et la dynamique de groupe s'ameliore avec des groupes plus petits et plus impliques. \u{1F4CA}

Pendant la reunion, l'IA prend des notes automatiquement. Elle identifie les decisions prises, les actions a mener, les responsables designes et les deadlines fixees. Elle detecte aussi les sujets qui derivent et vous suggere discretement de recadrer. A la fin, le compte-rendu est genere instantanement avec la liste des decisions et des actions — plus besoin de passer 30 minutes a rediger un CR que personne ne lira.

Le suivi post-reunion est automatise. L'IA envoie les actions a chaque responsable, programme des rappels aux deadlines, et prepare le point de suivi pour la reunion suivante. A l'ouverture de la prochaine reunion, le statut de chaque action est affiche. Les reunions deviennent des maillons d'une chaine de progression visible et mesurable, pas des evenements isoles qui se repetent sans resultat. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m4-l2',
          title: 'Jeu : Reunion necessaire ou email suffisant ?',
          duration: '3 min',
          type: 'game',
          content: 'Identifiez quelles situations necessitent une reunion.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Informer l\'equipe d\'un changement de process', right: 'Email / Slack suffit' },
              { left: 'Brainstormer sur la strategie Q3', right: 'Reunion necessaire' },
              { left: 'Partager le statut hebdomadaire du projet', right: 'Document partage suffit' },
              { left: 'Resoudre un conflit entre 2 equipes', right: 'Reunion necessaire' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'mgmt-m4-l3',
          title: 'Quiz — Reunions et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les reunions productives.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de reunions est considere comme improductif ?',
              options: ['30%', '50%', '71%', '90%'],
              correctIndex: 2,
              explanation: '71% des reunions sont jugees improductives par les participants.',
            },
            {
              question: 'Quel pourcentage de reunions pourrait etre remplace par un email ?',
              options: ['10%', '20%', '30%', '50%'],
              correctIndex: 2,
              explanation: '30% des reunions pourraient etre efficacement remplacees par un email, un message ou un document partage.',
            },
            {
              question: 'Que genere l\'IA automatiquement a la fin d\'une reunion ?',
              options: [
                'Un sondage de satisfaction',
                'Un compte-rendu avec decisions, actions, responsables et deadlines',
                'Un email de remerciement',
                'Une invitation pour la prochaine reunion',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere instantanement un CR structure avec les decisions et les actions assignees.',
            },
            {
              question: 'Comment l\'IA optimise-t-elle la liste des participants ?',
              options: [
                'Elle invite tout le monde',
                'Elle n\'invite que le manager',
                'Elle indique qui doit etre present pour chaque sujet',
                'Elle limite a 3 personnes maximum',
              ],
              correctIndex: 2,
              explanation: 'L\'IA analyse chaque point de l\'ordre du jour et indique les participants necessaires par sujet.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Meeting Master',
    },

    // Module 5 — KPIs intelligents
    {
      id: 'mgmt-m5',
      title: 'KPIs et tableaux de bord IA',
      emoji: '\u{1F4CA}',
      description: 'Pilotez votre equipe avec des KPIs intelligents generes par l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m5-l1',
          title: 'Des KPIs qui racontent une histoire',
          duration: '4 min',
          type: 'text',
          content: `La plupart des managers mesurent trop de choses ou mesurent les mauvaises choses. Le resultat est un tableau de bord de 50 indicateurs que personne ne regarde, ou pire, des decisions basees sur des metriques qui ne refletent pas la realite. L'IA vous aide a identifier les 5 a 7 KPIs qui comptent vraiment et a les transformer en levier de pilotage quotidien. \u{1F4CA}

L'assistant Freenzy commence par analyser vos objectifs strategiques et en deduit les indicateurs pertinents. Si votre objectif est la satisfaction client, mesurer le nombre de tickets fermes n'est pas suffisant — il faut aussi mesurer le temps de resolution, le taux de reouverture et le score NPS. L'IA construit une cascade d'indicateurs du strategique a l'operationnel, chacun relie aux autres de maniere logique.

Les KPIs predictifs sont la vraie revolution. Les KPIs classiques (CA du mois, nombre de ventes) sont des indicateurs retards — ils vous disent ce qui s'est deja passe. L'IA ajoute des indicateurs avances qui predisent l'avenir : taux de pipeline, nombre de propositions en cours, engagement des leads. Si votre pipeline baisse de 20% ce mois-ci, votre CA baissera dans 2 mois. L'IA vous alerte maintenant pour que vous agissiez avant que le probleme ne se materialise. \u{26A0}\u{FE0F}

Le tableau de bord personnalise est genere automatiquement. L'IA cree des visualisations adaptees a chaque type de KPI : tendances pour les metriques temporelles, gauges pour les objectifs en cours, heatmaps pour les comparaisons entre equipes. Chaque matin, vous recevez un briefing de 30 secondes : "Votre equipe est a 85% de l'objectif mensuel, le taux de satisfaction a augmente de 3 points, attention au delai de livraison qui depasse le seuil depuis 2 jours."

L'IA detecte aussi les correlations cachees entre vos KPIs. Elle peut decouvrir que les jours ou votre equipe fait plus de one-to-one, la productivite de la semaine suivante augmente de 15%. Ou que les mois ou le turnover est eleve, la satisfaction client baisse avec un decalage de 6 semaines. Ces insights vous permettent d'agir sur les causes profondes plutot que sur les symptomes, et de prendre des decisions veritablement eclairees par les donnees. \u{1F4A1}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m5-l2',
          title: 'Exercice : Construire un tableau de bord IA',
          duration: '3 min',
          type: 'exercise',
          content: 'Concevez un tableau de bord KPI intelligent pour votre equipe.',
          exercisePrompt: `Vous managez une equipe de 8 commerciaux avec un objectif de 500K€ de CA trimestriel.

Avec l'assistant Freenzy, construisez votre tableau de bord :
1. Definissez 3 KPIs retard (resultats passes) et 3 KPIs avance (predictifs)
2. Pour chaque KPI, indiquez : formule de calcul, seuil vert/orange/rouge, frequence de mesure
3. Identifiez 2 correlations potentielles entre vos KPIs
4. Redigez le briefing matinal ideal que l'IA devrait vous envoyer
5. Definissez une alerte automatique et l'action a declencher.`,
          xpReward: 20,
        },
        {
          id: 'mgmt-m5-l3',
          title: 'Quiz — KPIs et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les KPIs intelligents.',
          quizQuestions: [
            {
              question: 'Combien de KPIs un manager devrait-il suivre idealement ?',
              options: ['1 a 3', '5 a 7', '15 a 20', '50+'],
              correctIndex: 1,
              explanation: '5 a 7 KPIs bien choisis suffisent pour piloter efficacement une equipe.',
            },
            {
              question: 'Quelle est la difference entre un KPI retard et un KPI avance ?',
              options: [
                'Il n\'y en a pas',
                'Le retard mesure le passe, l\'avance predit l\'avenir',
                'Le retard est mensuel, l\'avance est quotidien',
                'Le retard est negatif, l\'avance est positif',
              ],
              correctIndex: 1,
              explanation: 'Les KPIs retard mesurent les resultats passes, les KPIs avance predisent les resultats futurs.',
            },
            {
              question: 'Que detecte l\'IA entre les differents KPIs ?',
              options: [
                'Les erreurs de calcul',
                'Les correlations cachees et les relations de cause a effet',
                'Les doublons',
                'Les KPIs inutiles',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie des correlations invisibles qui permettent d\'agir sur les causes profondes.',
            },
            {
              question: 'Que contient le briefing matinal genere par l\'IA ?',
              options: [
                'La meteo du jour',
                'Un resume de 30 secondes avec progression, points positifs et alertes',
                'La liste complete de tous les KPIs',
                'Les emails non lus',
              ],
              correctIndex: 1,
              explanation: 'Le briefing est un resume rapide et actionnable : progression, reussites et alertes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Data Manager',
    },

    // Module 6 — Culture d'equipe
    {
      id: 'mgmt-m6',
      title: 'Culture d\'equipe avec l\'IA',
      emoji: '\u{1F91D}',
      description: 'Construisez et maintenez une culture d\'equipe forte avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'mgmt-m6-l1',
          title: 'Batir une culture d\'equipe durable',
          duration: '4 min',
          type: 'text',
          content: `La culture d'equipe est ce qui fait qu'un groupe de personnes talentueuses devient une equipe performante — ou pas. Une culture forte attire les talents, retient les meilleurs, accelere l'execution et cree une resilience face aux crises. Pourtant, la plupart des managers laissent la culture se construire par defaut plutot que par intention. L'IA vous aide a definir, cultiver et mesurer deliberement la culture de votre equipe. \u{1F91D}

L'assistant Freenzy commence par un diagnostic culturel. Il analyse les comportements observables de votre equipe : comment les decisions sont prises (consensus ou autorite), comment les conflits sont geres (evitement ou confrontation constructive), comment les succes sont celebres, et comment les echecs sont traites. Ce diagnostic revele la culture reelle, souvent differente de la culture declaree. Savoir ou vous en etes est la premiere etape pour aller ou vous voulez.

L'IA vous aide a definir vos valeurs d'equipe — pas des mots creux sur un mur, mais des comportements concrets attendus au quotidien. Au lieu de "Excellence", l'IA vous propose : "Nous relisons chaque livrable avant de l'envoyer au client." Au lieu de "Collaboration", elle suggere : "Quand un collegue est en difficulte, nous proposons de l'aide sans attendre qu'il demande." Ces comportements observables et mesurables rendent les valeurs vivantes. \u{1F4CB}

Les rituels d'equipe sont les briques de la culture. L'IA vous propose et vous aide a mettre en place des rituels adaptes a votre contexte : un "stand-up mood" de 5 minutes le lundi matin ou chacun partage son etat d'esprit avec un emoji, un "Friday wins" ou l'equipe celebre les reussites de la semaine, un "learning lunch" mensuel ou un membre partage une competence. Chaque rituel est planifie, anime et suivi par l'IA.

L'IA mesure la sante culturelle de votre equipe avec un "pulse survey" automatise. Chaque semaine, elle envoie 3 questions anonymes rapides a vos collaborateurs : sentiment d'appartenance, charge de travail percue, et un theme tournant (reconnaissance, communication, autonomie). Les resultats sont agreges et vous voyez les tendances en temps reel. Si le sentiment d'appartenance baisse 3 semaines de suite, l'IA vous alerte et propose des actions correctives avant que le desengagement ne s'installe. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'mgmt-m6-l2',
          title: 'Exercice : Definir la culture de son equipe',
          duration: '3 min',
          type: 'exercise',
          content: 'Construisez les fondements culturels de votre equipe avec l\'IA.',
          exercisePrompt: `Avec l'assistant Freenzy, construisez la culture de votre equipe :

1. Decrivez votre equipe (taille, metier, contexte : presentiel/remote/hybride)
2. Identifiez 3 comportements actuels positifs a renforcer
3. Identifiez 2 comportements toxiques a eliminer
4. Redigez 3 valeurs d'equipe formulees en comportements concrets observables
5. Proposez 2 rituels d'equipe adaptes a votre contexte (incluant nom, frequence, duree, format)
6. Definissez 3 questions pour votre pulse survey hebdomadaire.`,
          xpReward: 20,
        },
        {
          id: 'mgmt-m6-l3',
          title: 'Quiz — Culture d\'equipe et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la culture d\'equipe.',
          quizQuestions: [
            {
              question: 'Pourquoi la culture reelle differe-t-elle souvent de la culture declaree ?',
              options: [
                'Parce que les managers mentent',
                'Parce que les valeurs affichees ne sont pas traduites en comportements concrets',
                'Parce que les employes ne lisent pas les valeurs',
                'Parce que la culture change chaque jour',
              ],
              correctIndex: 1,
              explanation: 'Sans traduction en comportements concrets, les valeurs declarees restent des mots creux.',
            },
            {
              question: 'Comment l\'IA formule-t-elle les valeurs d\'equipe ?',
              options: [
                'En mots inspirants et abstraits',
                'En comportements concrets, observables et mesurables',
                'En objectifs financiers',
                'En regles strictes avec sanctions',
              ],
              correctIndex: 1,
              explanation: 'L\'IA traduit les valeurs en comportements observables au quotidien pour les rendre vivantes.',
            },
            {
              question: 'A quelle frequence l\'IA envoie-t-elle le pulse survey ?',
              options: ['Quotidiennement', 'Chaque semaine', 'Chaque mois', 'Chaque trimestre'],
              correctIndex: 1,
              explanation: 'Un pulse survey hebdomadaire de 3 questions permet de detecter rapidement les baisses de moral.',
            },
            {
              question: 'Apres combien de semaines de baisse l\'IA alerte-t-elle le manager ?',
              options: ['1 semaine', '2 semaines', '3 semaines', '4 semaines'],
              correctIndex: 2,
              explanation: 'Apres 3 semaines consecutives de baisse, l\'IA alerte le manager et propose des actions correctives.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F91D}',
      badgeName: 'Culture Builder',
    },
  ],
};
