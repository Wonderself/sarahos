// =============================================================================
// Freenzy.io — Formation Niveau 1 : IA pour les Artisans
// 6 modules x 3 lessons = 18 lessons, 600 XP total, ~45min
// =============================================================================

import type { FormationParcours } from './formation-data';

export const parcoursArtisansIA: FormationParcours = {
  id: 'artisans-ia-niv1',
  title: 'IA pour les Artisans',
  emoji: '\u{1F6E0}\u{FE0F}',
  description: 'Apprenez a utiliser l\'IA pour gerer votre activite d\'artisan : devis en 3 minutes, relances automatiques, avis Google, facturation PDF et planning optimise.',
  category: 'metier',
  subcategory: 'artisans',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#D97706',
  diplomaTitle: 'Artisan Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Artisans',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Creer un devis en 3 minutes
    // -----------------------------------------------------------------------
    {
      id: 'art-m1',
      title: 'Creer un devis en 3 minutes',
      emoji: '\u{1F4DD}',
      description: 'Generez des devis professionnels en quelques clics grace a l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m1-l1',
          title: 'Pourquoi l\'IA change tout pour les devis',
          duration: '4 min',
          type: 'text',
          content: `En tant qu\'artisan, vous passez probablement des heures chaque semaine a rediger des devis. Entre les mesures sur chantier, le calcul des materiaux et la mise en forme, c\'est du temps que vous ne passez pas a travailler. Bonne nouvelle : l\'IA va diviser ce temps par 10 ! \u{1F389}

Avec Freenzy, vous decrivez simplement le travail a realiser en langage naturel. Par exemple : "Renovation salle de bain 8m2, remplacement baignoire par douche italienne, carrelage sol et murs, meuble vasque double." L\'IA comprend immediatement le contexte et genere un devis structure avec les postes de travail, les fournitures estimees et la main d\'oeuvre.

Le devis genere respecte les standards professionnels : mentions legales obligatoires, numero de devis sequentiel, TVA applicable selon votre regime, duree de validite et conditions de reglement. Vous n\'avez plus a vous soucier d\'oublier une mention — l\'IA les inclut systematiquement. \u{2705}

Mais attention, l\'IA ne remplace pas votre expertise ! Elle vous propose une base solide que vous ajustez selon votre connaissance du chantier. Vous modifiez les quantites, ajustez les prix unitaires selon vos fournisseurs et ajoutez des postes specifiques si necessaire. L\'IA apprend de vos corrections au fil du temps et devient de plus en plus precise.

Le gain de temps est considerable : la ou vous passiez 30 a 45 minutes par devis, vous tombez a 3 minutes maximum. Sur un mois avec 15 devis, c\'est plus de 10 heures recuperees — l\'equivalent d\'une journee et demie de travail en plus ! \u{1F4AA}

Pour demarrer, il suffit d\'ouvrir l\'assistant Commercial dans Freenzy et de decrire votre chantier. L\'assistant vous posera quelques questions complementaires si besoin (surface, type de materiaux, acces chantier) avant de generer le devis complet. Vous pourrez ensuite l\'exporter en PDF et l\'envoyer directement par email au client.`,
          xpReward: 15,
        },
        {
          id: 'art-m1-l2',
          title: 'Exercice : Mon premier devis IA',
          duration: '3 min',
          type: 'exercise',
          content: 'Generez votre premier devis avec l\'assistant IA.',
          exercisePrompt: `Imaginez que vous etes un artisan plombier et qu\'un client vous demande un devis pour :
- Installation d'un chauffe-eau thermodynamique 200L
- Depose de l'ancien cumulus electrique
- Raccordement eau chaude/froide + evacuation condensats
- Mise en service et reglages

Redigez la description que vous enverriez a l'assistant Commercial de Freenzy pour generer ce devis. Soyez precis sur :
1. Les details techniques (marque ou gamme souhaitee, emplacement)
2. Les contraintes (acces, distance raccordement)
3. Le delai souhaite

Puis identifiez 3 postes que vous devriez verifier/ajuster dans le devis genere par l'IA.`,
          xpReward: 20,
        },
        {
          id: 'art-m1-l3',
          title: 'Quiz — Devis intelligents',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la generation de devis avec l\'IA.',
          quizQuestions: [
            {
              question: 'Quel est le gain de temps moyen par devis avec l\'IA Freenzy ?',
              options: ['2 minutes', '10 minutes', '25-40 minutes', '1 heure'],
              correctIndex: 2,
              explanation: 'L\'IA reduit le temps de creation d\'un devis de 30-45 minutes a environ 3 minutes, soit un gain de 25 a 40 minutes par devis.',
            },
            {
              question: 'Que fait l\'IA automatiquement dans un devis ?',
              options: [
                'Elle fixe les prix sans votre accord',
                'Elle inclut les mentions legales obligatoires',
                'Elle envoie le devis directement au client',
                'Elle commande les materiaux',
              ],
              correctIndex: 1,
              explanation: 'L\'IA inclut systematiquement les mentions legales obligatoires (validite, conditions, TVA). Vous gardez le controle sur les prix et l\'envoi.',
            },
            {
              question: 'Quel assistant Freenzy utiliser pour generer un devis ?',
              options: ['Assistant Studio', 'Assistant Marketing', 'Assistant Commercial', 'Assistant Juridique'],
              correctIndex: 2,
              explanation: 'L\'assistant Commercial est specialise dans la generation de devis, propositions commerciales et documents de vente.',
            },
            {
              question: 'Faut-il toujours verifier le devis genere par l\'IA ?',
              options: [
                'Non, l\'IA est infaillible',
                'Oui, il faut ajuster prix et quantites selon votre expertise',
                'Non, sauf si le montant depasse 5000 euros',
                'Oui, mais uniquement les mentions legales',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose une base solide mais vous devez toujours verifier et ajuster les prix, quantites et postes selon votre connaissance du chantier et de vos fournisseurs.',
            },
            {
              question: 'Comment l\'IA s\'ameliore-t-elle au fil du temps ?',
              options: [
                'Elle ne s\'ameliore pas',
                'Elle copie les devis d\'autres artisans',
                'Elle apprend de vos corrections et ajustements',
                'Elle met a jour ses prix chaque jour',
              ],
              correctIndex: 2,
              explanation: 'L\'IA apprend de vos corrections successives pour proposer des devis de plus en plus adaptes a votre activite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Devis Express',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Relances automatiques J+3, J+7, J+14
    // -----------------------------------------------------------------------
    {
      id: 'art-m2',
      title: 'Relances automatiques J+3, J+7, J+14',
      emoji: '\u{1F504}',
      description: 'Ne perdez plus de clients : configurez des relances automatiques intelligentes.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m2-l1',
          title: 'Le systeme de relances intelligentes',
          duration: '4 min',
          type: 'text',
          content: `Saviez-vous que 60% des devis non relances sont perdus ? En tant qu\'artisan, vous envoyez un devis et vous attendez... mais le client est souvent occupe, il oublie, ou il compare avec d\'autres artisans. La relance est essentielle, et l\'IA la rend totalement automatique ! \u{1F504}

Le systeme de relances de Freenzy fonctionne en trois etapes. A J+3 (trois jours apres l\'envoi du devis), un premier message courtois est envoye : "Bonjour M. Dupont, j\'espere que vous avez bien recu notre devis pour la renovation de votre salle de bain. N\'hesitez pas si vous avez des questions." C\'est un simple rappel amical qui montre votre professionnalisme.

A J+7, le ton devient un peu plus engageant. L\'IA rappelle les points forts de votre offre et propose de planifier un appel ou une visite complementaire. "Je me permets de revenir vers vous concernant notre devis. Je reste disponible pour ajuster la proposition ou repondre a vos interrogations."

A J+14, c\'est la derniere relance. L\'IA mentionne la duree de validite du devis et cree un leger sentiment d\'urgence : "Pour information, notre devis reste valable jusqu\'au [date]. Souhaitez-vous que nous planifiions une date pour demarrer les travaux ?" \u{23F0}

L\'intelligence du systeme, c\'est qu\'il s\'adapte. Si le client repond a la premiere relance, les suivantes sont automatiquement annulees. Si le client demande un delai, la sequence est decalee. Et si le client decline, le devis est marque comme perdu dans votre suivi — pas de harcelement !

Vous pouvez personnaliser les messages, les delais et le canal (email, SMS ou WhatsApp). Certains artisans preferent relancer par SMS car le taux d\'ouverture est de 98% contre 20% pour les emails. L\'IA vous recommande le meilleur canal selon le profil du client.

Resultat concret : les artisans qui utilisent les relances automatiques convertissent en moyenne 35% de devis en plus. Sur un chiffre d\'affaires annuel, ca peut representer plusieurs milliers d\'euros supplementaires. \u{1F4B0}`,
          xpReward: 15,
        },
        {
          id: 'art-m2-l2',
          title: 'Exercice : Configurer mes relances',
          duration: '3 min',
          type: 'exercise',
          content: 'Parametrez votre sequence de relances personnalisee.',
          exercisePrompt: `Vous etes un artisan electricien et vous venez d'envoyer un devis de 3 200 euros pour la mise aux normes electriques d'un appartement.

Redigez les 3 messages de relance personnalises :

1. Message J+3 — Rappel amical (max 3 lignes)
2. Message J+7 — Mise en avant d'un avantage (garantie, certification, delai rapide)
3. Message J+14 — Derniere relance avec notion d'urgence

Pour chaque message, preciser :
- Le canal choisi (email, SMS ou WhatsApp) et pourquoi
- Le ton employe
- L'appel a l'action (ce que vous voulez que le client fasse)`,
          xpReward: 20,
        },
        {
          id: 'art-m2-l3',
          title: 'Quiz — Relances et suivi',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les relances automatiques.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de devis non relances est perdu en moyenne ?',
              options: ['20%', '40%', '60%', '80%'],
              correctIndex: 2,
              explanation: '60% des devis non relances finissent par etre perdus. La relance est cruciale pour ameliorer votre taux de conversion.',
            },
            {
              question: 'Que se passe-t-il si le client repond avant J+7 ?',
              options: [
                'Les relances suivantes sont envoyees quand meme',
                'Les relances suivantes sont automatiquement annulees',
                'Le systeme envoie un message de confirmation',
                'Rien, le systeme ne detecte pas les reponses',
              ],
              correctIndex: 1,
              explanation: 'Le systeme est intelligent : si le client repond, les relances suivantes sont automatiquement annulees pour eviter tout harcelement.',
            },
            {
              question: 'Quel canal a le meilleur taux d\'ouverture pour les relances ?',
              options: ['Email (20%)', 'Courrier postal (50%)', 'SMS (98%)', 'Reseaux sociaux (35%)'],
              correctIndex: 2,
              explanation: 'Le SMS a un taux d\'ouverture de 98%, largement superieur a l\'email (20%). C\'est souvent le meilleur canal pour relancer un client.',
            },
            {
              question: 'Quel est le gain moyen de conversion avec les relances automatiques ?',
              options: ['5% de devis en plus', '15% de devis en plus', '35% de devis en plus', '70% de devis en plus'],
              correctIndex: 2,
              explanation: 'Les artisans utilisant les relances automatiques convertissent en moyenne 35% de devis supplementaires.',
            },
            {
              question: 'A J+14, quel element l\'IA ajoute dans le message ?',
              options: [
                'Une promotion speciale',
                'La duree de validite du devis et un sentiment d\'urgence',
                'Les coordonnees d\'un concurrent',
                'Un rappel des mentions legales',
              ],
              correctIndex: 1,
              explanation: 'A J+14, l\'IA mentionne la duree de validite du devis pour creer un leger sentiment d\'urgence et inciter le client a prendre sa decision.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F504}',
      badgeName: 'Relanceur Pro',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Collecter des avis Google
    // -----------------------------------------------------------------------
    {
      id: 'art-m3',
      title: 'Collecter des avis Google',
      emoji: '\u{2B50}',
      description: 'Boostez votre reputation en ligne avec des avis clients automatises.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m3-l1',
          title: 'Les avis Google : votre meilleur commercial',
          duration: '4 min',
          type: 'text',
          content: `Les avis Google sont devenus le premier reflexe des clients qui cherchent un artisan. 93% des consommateurs lisent les avis en ligne avant de faire appel a un professionnel. Votre note Google est litteralement votre meilleur commercial — et il travaille 24h/24 ! \u{2B50}

Le probleme, c\'est que les clients satisfaits pensent rarement a laisser un avis spontanement. En revanche, un client mecontent le fera presque systematiquement. Resultat : sans strategie de collecte d\'avis, votre note ne reflete pas la realite de votre travail. C\'est la que l\'IA entre en jeu.

Avec Freenzy, vous automatisez la demande d\'avis apres chaque chantier termine. Le systeme envoie un message personnalise au client : "Bonjour M. Martin, merci pour votre confiance pour la renovation de votre cuisine. Si vous etes satisfait, un avis Google nous aiderait enormement." Le message inclut un lien direct vers votre fiche Google — le client n\'a qu\'a cliquer et noter. \u{1F4F1}

Le timing est crucial. L\'IA envoie la demande au moment optimal : generalement 24 a 48 heures apres la fin des travaux, quand le client est encore dans l\'euphorie de son nouveau chantier. Trop tot, il n\'a pas encore profite du resultat. Trop tard, l\'enthousiasme est retombe.

L\'IA personnalise aussi le message en fonction du chantier. Pour une salle de bain, elle mentionnera "votre nouvelle salle de bain". Pour un tableau electrique, "la mise en securite de votre installation". Cette personnalisation augmente significativement le taux de reponse.

Un artisan avec 50 avis et une note de 4.7 etoiles recevra naturellement plus de demandes qu\'un concurrent avec 5 avis et 4.2 etoiles. C\'est un cercle vertueux : plus d\'avis = plus de visibilite = plus de clients = plus d\'avis. Freenzy vous aide a lancer ce cercle vertueux des les premiers chantiers.

Objectif realiste : en demandant systematiquement, vous pouvez obtenir 3 a 5 nouveaux avis par mois. En 6 mois, votre fiche Google sera transformee ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'art-m3-l2',
          title: 'Exercice : Ma strategie d\'avis',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez votre strategie de collecte d\'avis Google.',
          exercisePrompt: `Vous venez de terminer 3 chantiers cette semaine :
1. Pose d'une cuisine complete chez un couple de retraites (budget 8 000 euros, tres satisfaits)
2. Depannage urgence fuite d'eau chez un jeune locataire (budget 180 euros, soulage)
3. Renovation complete d'une salle de bain pour une famille (budget 5 500 euros, quelques ajustements demandes)

Pour chaque client, redigez :
- Le message de demande d'avis personnalise (3-4 lignes max)
- Le canal choisi (SMS ou WhatsApp) et pourquoi
- Le delai d'envoi apres fin de chantier
- Ce que vous feriez si le client n'a pas repondu apres 5 jours`,
          xpReward: 20,
        },
        {
          id: 'art-m3-l3',
          title: 'Quiz — Avis et reputation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion des avis en ligne.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de consommateurs lit les avis avant de choisir un artisan ?',
              options: ['50%', '70%', '85%', '93%'],
              correctIndex: 3,
              explanation: '93% des consommateurs consultent les avis en ligne avant de faire appel a un professionnel. C\'est devenu un reflexe quasi systematique.',
            },
            {
              question: 'Quel est le moment ideal pour demander un avis apres un chantier ?',
              options: ['Pendant le chantier', '24 a 48 heures apres', '1 semaine apres', '1 mois apres'],
              correctIndex: 1,
              explanation: 'Le moment ideal est 24 a 48h apres la fin des travaux, quand le client est encore satisfait du resultat mais a eu le temps d\'en profiter.',
            },
            {
              question: 'Combien d\'avis par mois peut-on viser avec une demande systematique ?',
              options: ['1 avis', '3 a 5 avis', '10 a 15 avis', '20 avis ou plus'],
              correctIndex: 1,
              explanation: 'Avec une demande systematique et personnalisee, 3 a 5 nouveaux avis par mois est un objectif realiste pour un artisan.',
            },
            {
              question: 'Pourquoi personnaliser le message de demande d\'avis ?',
              options: [
                'C\'est obligatoire legalement',
                'Ca augmente significativement le taux de reponse',
                'Google le detecte et booste votre fiche',
                'Ca n\'a aucune importance',
              ],
              correctIndex: 1,
              explanation: 'Un message personnalise (mentionnant le chantier specifique) montre au client que vous vous souvenez de lui et augmente fortement le taux de reponse.',
            },
            {
              question: 'Quel element est essentiel dans le message de demande d\'avis ?',
              options: [
                'Un bon de reduction',
                'Un lien direct vers votre fiche Google',
                'Une facture jointe',
                'Votre numero de SIRET',
              ],
              correctIndex: 1,
              explanation: 'Le lien direct vers votre fiche Google est essentiel : il suffit au client de cliquer pour laisser son avis, sans chercher votre profil.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2B50}',
      badgeName: 'Reputation Star',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Facturation PDF professionnelle
    // -----------------------------------------------------------------------
    {
      id: 'art-m4',
      title: 'Facturation PDF professionnelle',
      emoji: '\u{1F4C4}',
      description: 'Generez des factures conformes en PDF directement depuis Freenzy.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m4-l1',
          title: 'Factures conformes en un clic',
          duration: '4 min',
          type: 'text',
          content: `La facturation est une obligation legale que beaucoup d\'artisans gerent encore avec des tableurs ou meme des modeles Word. Le risque ? Des oublis de mentions obligatoires, des erreurs de calcul de TVA, et surtout une image peu professionnelle aupres de vos clients. \u{1F4C4}

Avec Freenzy, la facturation devient un jeu d\'enfant. Lorsque votre devis est accepte et le chantier termine, l\'IA transforme automatiquement le devis en facture. Toutes les informations sont deja la : coordonnees client, description des travaux, montants, TVA. Vous n\'avez qu\'a valider et exporter en PDF.

Les mentions obligatoires sont toujours presentes : numero de facture sequentiel (F-2026-001, F-2026-002...), date d\'emission, identite du vendeur (SIRET, adresse, numero de TVA intracommunautaire si applicable), identite de l\'acheteur, description detaillee des prestations, montant HT, taux et montant de TVA, montant TTC, conditions de reglement et penalites de retard. \u{2705}

L\'IA gere automatiquement la numerotation sequentielle. Vous ne risquez plus de doublons ou de trous dans votre numerotation — ce qui est un motif de redressement fiscal. Elle calcule aussi la TVA selon votre regime : TVA classique a 20%, TVA intermediaire a 10% pour les travaux de renovation, ou franchise de TVA si vous etes en micro-entreprise.

Le PDF genere est au format professionnel avec votre logo, vos couleurs et une mise en page soignee. Vous pouvez l\'envoyer directement par email au client depuis Freenzy, avec un message d\'accompagnement redige par l\'IA : "Veuillez trouver ci-jointe la facture relative a notre intervention du [date]."

Un tableau de bord de facturation vous permet de suivre en temps reel : factures emises, factures payees, factures en retard et chiffre d\'affaires cumule. Vous avez une vision claire de votre tresorerie a tout moment. L\'IA vous alerte aussi quand une facture depasse les 30 jours de reglement pour que vous puissiez relancer rapidement.

Fini le stress de la comptabilite artisanale — tout est automatise, conforme et professionnel ! \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'art-m4-l2',
          title: 'Exercice : Transformer un devis en facture',
          duration: '3 min',
          type: 'exercise',
          content: 'Pratiquez la transformation d\'un devis accepte en facture.',
          exercisePrompt: `Un client a accepte votre devis pour les travaux suivants :
- Remplacement de 5 radiateurs (fourniture + pose) : 3 200 euros HT
- Installation d'un thermostat connecte : 450 euros HT
- Mise en service et reglages : 150 euros HT

Informations :
- Votre entreprise : "Chauffage Martin SARL", SIRET 123 456 789 00012
- TVA applicable : 10% (renovation habitation > 2 ans)
- Conditions : paiement a 30 jours, penalites de retard 3x taux legal
- Dernier numero de facture : F-2026-042

Redigez la facture complete avec :
1. Toutes les mentions obligatoires
2. Le calcul TVA correct (base HT, TVA 10%, TTC)
3. Le message d'accompagnement email`,
          xpReward: 20,
        },
        {
          id: 'art-m4-l3',
          title: 'Quiz — Facturation artisan',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en facturation.',
          quizQuestions: [
            {
              question: 'Quel taux de TVA s\'applique aux travaux de renovation dans un logement de plus de 2 ans ?',
              options: ['5.5%', '10%', '15%', '20%'],
              correctIndex: 1,
              explanation: 'Les travaux de renovation dans un logement de plus de 2 ans beneficient du taux intermediaire de TVA a 10%.',
            },
            {
              question: 'Pourquoi la numerotation sequentielle des factures est-elle importante ?',
              options: [
                'C\'est juste une convention pratique',
                'C\'est obligatoire et un trou peut entrainer un redressement fiscal',
                'Ca permet de trier les factures par date',
                'C\'est requis uniquement pour les entreprises de plus de 10 salaries',
              ],
              correctIndex: 1,
              explanation: 'La numerotation sequentielle sans trou est une obligation legale. Des anomalies peuvent etre un motif de redressement fiscal.',
            },
            {
              question: 'Que fait Freenzy automatiquement quand un devis est accepte ?',
              options: [
                'Il supprime le devis',
                'Il transforme le devis en facture avec toutes les infos',
                'Il envoie une notification au comptable',
                'Il archive le devis sans action',
              ],
              correctIndex: 1,
              explanation: 'Freenzy transforme automatiquement le devis accepte en facture, en reprenant toutes les informations et en ajoutant les mentions obligatoires de facturation.',
            },
            {
              question: 'Quelle alerte Freenzy envoie-t-il pour les factures ?',
              options: [
                'Alerte quand le client ouvre la facture',
                'Alerte quand la facture depasse 30 jours sans paiement',
                'Alerte chaque jour tant que la facture n\'est pas payee',
                'Aucune alerte, il faut verifier manuellement',
              ],
              correctIndex: 1,
              explanation: 'L\'IA vous alerte quand une facture depasse les 30 jours de reglement pour que vous puissiez relancer le client rapidement.',
            },
            {
              question: 'En micro-entreprise, que mentionne-t-on a la place de la TVA ?',
              options: [
                'TVA non applicable',
                'TVA a 0%',
                'TVA non applicable, article 293 B du CGI',
                'Exonere de TVA',
              ],
              correctIndex: 2,
              explanation: 'Les micro-entrepreneurs doivent indiquer "TVA non applicable, article 293 B du CGI" sur leurs factures.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C4}',
      badgeName: 'Facturation Pro',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Presence en ligne
    // -----------------------------------------------------------------------
    {
      id: 'art-m5',
      title: 'Presence en ligne pour artisans',
      emoji: '\u{1F310}',
      description: 'Creez et optimisez votre presence numerique sans competence technique.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m5-l1',
          title: 'Etre visible sur internet sans effort',
          duration: '4 min',
          type: 'text',
          content: `Aujourd\'hui, un artisan sans presence en ligne est presque invisible. 78% des clients cherchent un artisan sur internet avant de decrocher leur telephone. La bonne nouvelle ? Avec l\'IA, vous n\'avez pas besoin d\'etre un geek pour etre visible ! \u{1F310}

La premiere etape, c\'est votre fiche Google Business Profile (ex Google My Business). C\'est gratuit et c\'est souvent le premier contact qu\'un client aura avec vous. L\'IA Freenzy vous aide a optimiser chaque element de votre fiche : description d\'activite percutante, choix des categories pertinentes, horaires, zone d\'intervention et photos de vos realisations.

Les photos sont essentielles. Un artisan qui publie regulierement des photos de ses chantiers (avant/apres) recoit 2 a 3 fois plus de demandes de contact. Avec Freenzy Studio, vous pouvez meme ameliorer vos photos de chantier : ajustement automatique de la luminosite, recadrage et ajout de votre logo en filigrane. \u{1F4F8}

Ensuite, les reseaux sociaux. Non, vous n\'avez pas besoin d\'etre sur TikTok tous les jours ! Mais une page Facebook professionnelle avec vos realisations et quelques avis clients fait des merveilles. L\'IA redige vos posts pour vous : "Nouvelle realisation : renovation complete d\'une salle de bain en 5 jours. Douche a l\'italienne, carrelage grand format, meuble vasque sur mesure." Vous ajoutez la photo et vous publiez.

Freenzy peut aussi generer votre mini-site professionnel : une page simple avec vos coordonnees, vos services, vos realisations et un formulaire de contact. Pas besoin de webdesigner ni d\'hebergement complique — tout est gere automatiquement.

L\'assistant Communication de Freenzy planifie votre contenu en ligne : un post par semaine sur vos realisations, une actualite saisonniere (preparation chaudieres en automne, clim en printemps) et des conseils d\'entretien. En 15 minutes par semaine, votre presence en ligne est geree.

Pensez aussi aux annuaires professionnels : Pages Jaunes, Houzz, Habitatpresto. L\'IA redige votre profil pour chacun avec les bons mots-cles pour votre zone geographique. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'art-m5-l2',
          title: 'Exercice : Optimiser ma fiche Google',
          duration: '3 min',
          type: 'exercise',
          content: 'Optimisez votre fiche Google Business Profile avec l\'aide de l\'IA.',
          exercisePrompt: `Vous etes un artisan peintre-decorateur installe a Lyon (69003). Votre entreprise s'appelle "Couleurs & Finitions" et vous etes specialise en :
- Peinture interieure et exterieure
- Revetements muraux (papier peint, toile de verre)
- Decoration et conseil couleurs
- Ravalement de facades

Redigez pour votre fiche Google Business Profile :
1. La description d'activite (max 750 caracteres, avec mots-cles locaux)
2. Les 5 categories Google les plus pertinentes
3. 3 posts Google My Business pour les 3 prochaines semaines
4. La liste des 5 photos indispensables a publier en priorite`,
          xpReward: 20,
        },
        {
          id: 'art-m5-l3',
          title: 'Quiz — Visibilite en ligne',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la presence en ligne des artisans.',
          quizQuestions: [
            {
              question: 'Quel pourcentage de clients cherche un artisan en ligne ?',
              options: ['45%', '60%', '78%', '95%'],
              correctIndex: 2,
              explanation: '78% des clients cherchent un artisan sur internet avant tout. La presence en ligne est devenue incontournable pour trouver de nouveaux clients.',
            },
            {
              question: 'Quel type de photos genere le plus de contacts sur Google Business ?',
              options: [
                'Photos de votre atelier',
                'Photos avant/apres de vos chantiers',
                'Selfies sur les chantiers',
                'Photos de vos outils',
              ],
              correctIndex: 1,
              explanation: 'Les photos avant/apres de chantiers sont les plus efficaces : elles montrent concretement la qualite de votre travail et generent 2 a 3 fois plus de contacts.',
            },
            {
              question: 'Combien de temps par semaine faut-il consacrer a sa presence en ligne avec l\'IA ?',
              options: ['5 heures', '2 heures', '15 minutes', '0 minutes, tout est 100% automatique'],
              correctIndex: 2,
              explanation: 'Avec l\'IA qui redige vos posts et planifie votre contenu, 15 minutes par semaine suffisent pour maintenir une presence en ligne active.',
            },
            {
              question: 'Quel est le premier element a optimiser pour un artisan en ligne ?',
              options: [
                'Un site web complexe',
                'Un compte TikTok',
                'La fiche Google Business Profile',
                'Une page LinkedIn',
              ],
              correctIndex: 2,
              explanation: 'La fiche Google Business Profile est gratuite, visible en premier dans les resultats de recherche locale et facile a maintenir. C\'est la priorite numero 1.',
            },
            {
              question: 'Que peut generer Freenzy pour votre presence en ligne ?',
              options: [
                'Uniquement des posts Facebook',
                'Un mini-site, des posts, des descriptions et des profils annuaires',
                'Uniquement une fiche Google',
                'Un site e-commerce complet',
              ],
              correctIndex: 1,
              explanation: 'Freenzy genere un ensemble complet : mini-site professionnel, posts reseaux sociaux, descriptions optimisees et profils pour les annuaires professionnels.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F310}',
      badgeName: 'Artisan Connecte',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Planning et gestion du temps
    // -----------------------------------------------------------------------
    {
      id: 'art-m6',
      title: 'Planning et gestion du temps',
      emoji: '\u{1F4C5}',
      description: 'Optimisez votre planning de chantiers et gerez votre temps efficacement.',
      duration: '8 min',
      lessons: [
        {
          id: 'art-m6-l1',
          title: 'Un planning intelligent pour artisans',
          duration: '4 min',
          type: 'text',
          content: `Le planning est le nerf de la guerre pour un artisan. Entre les chantiers en cours, les nouveaux devis a honorer, les interventions urgentes et les livraisons de materiaux, gerer son emploi du temps releve souvent du casse-tete. L\'IA va vous simplifier la vie ! \u{1F4C5}

L\'assistant Calendrier de Freenzy centralise toute votre activite. Chaque chantier est un evenement avec sa duree estimee, son adresse, ses materiaux necessaires et son statut (planifie, en cours, termine). Vous visualisez votre semaine et votre mois d\'un coup d\'oeil, avec un code couleur par type de travaux.

L\'intelligence du systeme, c\'est l\'optimisation automatique des deplacements. Si vous avez trois interventions dans la meme journee, l\'IA les ordonne pour minimiser les kilometres parcourus. Elle tient compte des horaires d\'ouverture des fournisseurs si vous devez recuperer du materiel en route. Sur une semaine, ca peut representer 1 a 2 heures de trajet economisees ! \u{1F697}

La gestion des imprevu est aussi couverte. Quand un client appelle pour une urgence, l\'IA vous montre immediatement les creneaux disponibles et vous propose de decaler les taches les moins urgentes. Elle envoie automatiquement un message aux clients concernes : "Suite a une urgence, votre intervention est decalee au [nouvelle date]. Toutes nos excuses pour ce desagrement."

Le planning integre aussi les temps administratifs. L\'IA bloque automatiquement 2 a 3 heures par semaine pour vos taches de gestion : comptabilite, devis, relances. Sans ce temps reserve, l\'administratif s\'accumule et cree du stress. Avec Freenzy, c\'est planifie et respecte.

Les rappels sont automatiques : un SMS au client la veille de l\'intervention ("Nous vous confirmons notre passage demain entre 8h et 10h"), un rappel le matin pour vous avec la liste du materiel necessaire. Plus d\'oublis, plus de clients qui ne sont pas la a votre arrivee.

Enfin, le suivi du temps passe par chantier vous permet d\'affiner vos estimations futures. Si vous prevoyez 3 jours pour une salle de bain et qu\'il en faut systematiquement 4, l\'IA ajuste vos prochaines estimations. Votre rentabilite s\'ameliore naturellement. \u{1F4C8}`,
          xpReward: 15,
        },
        {
          id: 'art-m6-l2',
          title: 'Exercice : Organiser ma semaine',
          duration: '3 min',
          type: 'exercise',
          content: 'Organisez une semaine type avec l\'aide de l\'IA.',
          exercisePrompt: `Vous etes un artisan plaquiste-peintre. Voici vos engagements pour la semaine prochaine :

Chantiers en cours :
- Chantier A (Villeurbanne) : placo + peinture appartement, reste 3 jours de travail
- Chantier B (Lyon 3) : peinture cage d'escalier copro, 1 jour

Nouveaux devis acceptes :
- Chantier C (Lyon 7) : enduit + peinture 2 pieces, 2 jours (client flexible sur dates)
- Chantier D (Bron) : urgence degat des eaux, faux plafond a refaire, 1 jour (ASAP)

Contraintes :
- Livraison plaques Placo chez fournisseur (Lyon 8) mardi matin avant 11h
- RDV comptable mercredi 14h-15h (non deplacable)
- Vous travaillez du lundi au vendredi, 7h30-17h

Proposez :
1. Le planning jour par jour optimise (en expliquant vos choix)
2. L'ordre des chantiers pour minimiser les deplacements
3. Le creneau administratif recommande
4. Les messages automatiques a envoyer aux clients`,
          xpReward: 20,
        },
        {
          id: 'art-m6-l3',
          title: 'Quiz — Planning artisan',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la gestion du planning.',
          quizQuestions: [
            {
              question: 'Quel gain de temps l\'optimisation des deplacements peut-elle apporter par semaine ?',
              options: ['15 minutes', '30 minutes', '1 a 2 heures', '4 heures'],
              correctIndex: 2,
              explanation: 'L\'optimisation des deplacements par l\'IA peut faire economiser 1 a 2 heures de trajet par semaine en ordonnant intelligemment les interventions.',
            },
            {
              question: 'Combien de temps l\'IA reserve-t-elle pour les taches administratives ?',
              options: ['30 minutes par semaine', '1 heure par semaine', '2 a 3 heures par semaine', '1 heure par jour'],
              correctIndex: 2,
              explanation: 'L\'IA bloque automatiquement 2 a 3 heures par semaine pour la gestion administrative : comptabilite, devis et relances.',
            },
            {
              question: 'Que fait le systeme quand vous integrez une urgence dans votre planning ?',
              options: [
                'Il refuse si le planning est complet',
                'Il propose des creneaux et previent automatiquement les clients decales',
                'Il ajoute l\'urgence en heures supplementaires',
                'Il annule le chantier le moins rentable',
              ],
              correctIndex: 1,
              explanation: 'Le systeme propose des creneaux disponibles et envoie automatiquement un message aux clients dont l\'intervention est decalee.',
            },
            {
              question: 'A quoi sert le suivi du temps passe par chantier ?',
              options: [
                'A facturer au temps reel',
                'A affiner les estimations futures et ameliorer la rentabilite',
                'A surveiller la productivite des ouvriers',
                'A justifier les retards aupres des clients',
              ],
              correctIndex: 1,
              explanation: 'Le suivi du temps permet d\'ajuster vos estimations futures : si vos previsions sont systematiquement depasses, l\'IA corrige pour plus de precision.',
            },
            {
              question: 'Quel rappel est envoye automatiquement la veille d\'une intervention ?',
              options: [
                'Un rappel de paiement',
                'Un SMS au client confirmant l\'horaire de passage',
                'Un email avec le devis detaille',
                'Un rappel a votre fournisseur',
              ],
              correctIndex: 1,
              explanation: 'La veille de chaque intervention, un SMS est envoye au client pour confirmer le creneau horaire, evitant les absences et les malentendus.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Planificateur',
    },
  ],
};
