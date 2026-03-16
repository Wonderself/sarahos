// =============================================================================
// Freenzy.io — Formations Metier Pack 2
// 5 parcours x 6 modules x 3 lessons = 90 lessons
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. IA pour les Kines
// =============================================================================

export const parcoursKineIA: FormationParcours = {
  id: 'kine-ia',
  title: 'IA pour les Kines',
  emoji: '\u{1F9D1}\u{200D}\u{2695}\u{FE0F}',
  description: 'Optimisez votre cabinet de kinesitherapie avec l\'IA : planning patients, bilans automatises, exercices personnalises, facturation CPAM, communication et suivi de reeducation.',
  category: 'metier',
  subcategory: 'sante',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#0891B2',
  diplomaTitle: 'Kine Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Kinesitherapeutes',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Planning patients intelligent
    {
      id: 'kine-m1',
      title: 'Planning patients intelligent',
      emoji: '\u{1F4C5}',
      description: 'Organisez votre agenda de consultations avec l\'IA pour maximiser votre temps.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m1-l1',
          title: 'Revolutionner la gestion de votre agenda',
          duration: '4 min',
          type: 'text',
          content: `En tant que kinesitherapeute, votre agenda est le nerf de la guerre. Entre les seances de 30 minutes, les bilans qui prennent plus de temps, les annulations de derniere minute et les patients chroniques qui reviennent chaque semaine, gerer un planning optimal releve du casse-tete quotidien. L\'IA va transformer cette contrainte en avantage ! \u{1F4C5}

L\'assistant Freenzy analyse vos habitudes de planification et propose un agencement intelligent de vos journees. Il identifie les creneaux sous-utilises, regroupe les patients par pathologie similaire (ce qui vous evite de changer mentalement de registre toutes les 30 minutes) et reserve automatiquement des plages pour les urgences.

Concretement, vous indiquez vos contraintes : "Je prefere les bilans le matin, les seances de reeducation l\'apres-midi, et je veux garder 2 creneaux libres par jour pour les urgences." L\'IA optimise ensuite chaque journee en respectant ces regles. Elle gere aussi les recurrences : un patient qui vient 3 fois par semaine est automatiquement positionne aux memes creneaux. \u{2705}

Le systeme de rappels intelligents est particulierement precieux. L\'IA envoie un SMS de rappel 24h avant la seance, avec un message personnalise selon le patient. Pour les patients a risque d\'annulation (detectes par l\'historique), le rappel part 48h avant. Resultat : une reduction de 40% des rendez-vous non honores !

La gestion des listes d\'attente devient aussi automatique. Quand un patient annule, l\'IA contacte immediatement les patients en attente qui correspondent au creneau libere, en tenant compte de leur pathologie et de la duree de seance necessaire. Plus de trous dans votre planning ! \u{1F4AA}

Enfin, l\'IA vous fournit des statistiques hebdomadaires : taux de remplissage, nombre de seances par pathologie, heures les plus demandees. Ces donnees vous aident a ajuster vos horaires d\'ouverture et a identifier les opportunites de croissance pour votre cabinet.`,
          xpReward: 15,
        },
        {
          id: 'kine-m1-l2',
          title: 'Exercice : Optimiser mon agenda',
          duration: '3 min',
          type: 'exercise',
          content: 'Configurez votre planning intelligent avec l\'assistant IA.',
          exercisePrompt: `Vous etes kinesitherapeute et vous recevez 25 patients par jour. Voici votre situation actuelle :
- Horaires : 8h-12h et 14h-19h
- Bilans (45 min) : en moyenne 3 par semaine
- Seances classiques (30 min) : 20 par jour
- Annulations : environ 3 par jour
- Patients chroniques : 15 qui viennent 2-3 fois/semaine

Redigez le brief que vous donneriez a l\'assistant Freenzy pour optimiser votre planning :
1. Definissez vos regles de priorite (bilans, urgences, chroniques)
2. Indiquez vos preferences de regroupement par pathologie
3. Precisez votre politique de rappels et de liste d\'attente
4. Identifiez 2 optimisations que l\'IA pourrait apporter a votre organisation actuelle.`,
          xpReward: 20,
        },
        {
          id: 'kine-m1-l3',
          title: 'Quiz — Planning intelligent',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion de planning avec l\'IA.',
          quizQuestions: [
            {
              question: 'De combien l\'IA peut-elle reduire les rendez-vous non honores ?',
              options: ['10%', '25%', '40%', '60%'],
              correctIndex: 2,
              explanation: 'Grace aux rappels intelligents adaptes au profil de chaque patient, l\'IA reduit d\'environ 40% les rendez-vous non honores.',
            },
            {
              question: 'Comment l\'IA gere-t-elle les annulations de derniere minute ?',
              options: [
                'Elle annule simplement le creneau',
                'Elle contacte automatiquement les patients en liste d\'attente',
                'Elle envoie une facture au patient absent',
                'Elle deplace tous les rendez-vous suivants',
              ],
              correctIndex: 1,
              explanation: 'L\'IA contacte immediatement les patients en attente dont le profil correspond au creneau libere.',
            },
            {
              question: 'Pourquoi regrouper les patients par pathologie ?',
              options: [
                'Pour reduire le menage entre les seances',
                'Pour eviter les changements mentaux de registre',
                'Pour impressionner les patients',
                'Pour facturer plus cher',
              ],
              correctIndex: 1,
              explanation: 'Regrouper les pathologies similaires evite au praticien de changer constamment de registre mental, ce qui ameliore la qualite des soins.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle un rappel aux patients a risque d\'annulation ?',
              options: ['1h avant', '12h avant', '24h avant', '48h avant'],
              correctIndex: 3,
              explanation: 'Pour les patients identifies comme a risque d\'annulation, le rappel est envoye 48h avant au lieu de 24h, laissant plus de temps pour reorganiser.',
            },
            {
              question: 'Quelle donnee l\'IA fournit-elle en statistique hebdomadaire ?',
              options: [
                'Le chiffre d\'affaires des concurrents',
                'Le taux de remplissage et seances par pathologie',
                'Les notes des patients',
                'Le prix moyen du marche',
              ],
              correctIndex: 1,
              explanation: 'L\'IA fournit taux de remplissage, nombre de seances par pathologie et heures les plus demandees pour optimiser votre activite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Agenda Maitre',
    },
    // Module 2 — Bilans automatises
    {
      id: 'kine-m2',
      title: 'Bilans et comptes rendus automatises',
      emoji: '\u{1F4CB}',
      description: 'Generez vos bilans diagnostiques kinesitherapiques en quelques minutes.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m2-l1',
          title: 'Le bilan kinesitherapique assiste par IA',
          duration: '4 min',
          type: 'text',
          content: `Le bilan diagnostique kinesitherapique (BDK) est une obligation legale et un outil clinique essentiel. Pourtant, sa redaction est souvent fastidieuse : il faut decrire l\'examen clinique, les tests realises, les objectifs therapeutiques et le plan de traitement. Avec l\'IA, cette etape passe de 20 minutes a 3 minutes ! \u{1F4CB}

L\'assistant Freenzy vous guide dans un processus structure. Vous dictez ou saisissez vos observations cliniques en langage naturel : "Patient homme 45 ans, lombalgie chronique depuis 6 mois, irradiation membre inferieur droit, Lasegue positif a 40 degres, force musculaire L5 cotee a 3/5." L\'IA structure ces informations dans un BDK complet et professionnel.

Le bilan genere inclut toutes les sections reglementaires : motif de consultation, antecedents pertinents, examen morphostatique, bilan articulaire, bilan musculaire, bilan fonctionnel, bilan de la douleur (EVA), diagnostic kinesitherapique, objectifs a court et long terme, et programme de reeducation propose. \u{2705}

L\'IA connait les cotations NGAP et vous suggere les actes correspondants a votre bilan. Par exemple, pour une reeducation du rachis, elle propose automatiquement les codes AMK/AMC adaptes. Elle verifie aussi la coherence entre le diagnostic medical prescrit et votre plan de traitement.

Un avantage majeur : la comparaison entre bilans. Quand vous refaites un bilan intermediaire ou final, l\'IA compare automatiquement avec le bilan initial et met en evidence les progres : "Lasegue passe de 40 a 60 degres (+20), force L5 passee de 3/5 a 4/5." Vous objectivez ainsi les resultats de votre prise en charge, ce qui est precieux pour les demandes de prolongation aupres des medecins prescripteurs.

Les bilans sont exportables en PDF professionnel avec votre entete de cabinet, et peuvent etre envoyes directement par email au medecin traitant ou au specialiste. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'kine-m2-l2',
          title: 'Jeu : Associer tests et pathologies',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque test clinique a la pathologie correspondante.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Test de Lasegue', right: 'Sciatique / hernie discale' },
              { left: 'Test de Jobe', right: 'Tendinopathie supra-epineux' },
              { left: 'Tiroir anterieur', right: 'Rupture LCA du genou' },
              { left: 'Test de Phalen', right: 'Syndrome canal carpien' },
              { left: 'Test de Thompson', right: 'Rupture tendon d\'Achille' },
              { left: 'Signe de Tinel', right: 'Compression nerveuse' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'kine-m2-l3',
          title: 'Quiz — Bilans BDK',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les bilans assistes par IA.',
          quizQuestions: [
            {
              question: 'Combien de temps gagne-t-on sur un BDK avec l\'IA ?',
              options: ['5 minutes', '10 minutes', '17 minutes', '30 minutes'],
              correctIndex: 2,
              explanation: 'Le BDK passe de 20 minutes a 3 minutes de redaction, soit un gain de 17 minutes par bilan.',
            },
            {
              question: 'Que propose automatiquement l\'IA apres un bilan ?',
              options: [
                'Un arret de travail',
                'Les cotations NGAP adaptees',
                'Une ordonnance medicale',
                'Un certificat medical',
              ],
              correctIndex: 1,
              explanation: 'L\'IA suggere les codes AMK/AMC adaptes au bilan realise, en coherence avec la nomenclature NGAP.',
            },
            {
              question: 'Quel avantage offre la comparaison inter-bilans ?',
              options: [
                'Reduire le nombre de seances',
                'Objectiver les progres du patient',
                'Augmenter les tarifs',
                'Eviter les bilans intermediaires',
              ],
              correctIndex: 1,
              explanation: 'La comparaison automatique entre bilan initial et bilans suivants permet d\'objectiver les progres et de justifier les prolongations.',
            },
            {
              question: 'Sous quel format le bilan est-il exportable ?',
              options: ['Word uniquement', 'Excel', 'PDF professionnel', 'Image PNG'],
              correctIndex: 2,
              explanation: 'Les bilans sont exportes en PDF avec l\'entete du cabinet, prets a etre envoyes aux medecins.',
            },
            {
              question: 'Que verifie l\'IA dans le bilan ?',
              options: [
                'Le prix des seances',
                'La coherence diagnostic / plan de traitement',
                'La disponibilite du patient',
                'Le remboursement mutuelle',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie la coherence entre le diagnostic medical prescrit et le plan de traitement kinesitherapique propose.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Bilan Pro',
    },
    // Module 3 — Exercices personnalises
    {
      id: 'kine-m3',
      title: 'Programmes d\'exercices personnalises',
      emoji: '\u{1F3CB}\u{FE0F}',
      description: 'Creez des fiches d\'exercices sur mesure pour chaque patient.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m3-l1',
          title: 'Creer des fiches exercices sur mesure',
          duration: '4 min',
          type: 'text',
          content: `La prescription d\'exercices a domicile est un pilier de la reeducation. Mais combien de patients oublient les consignes des qu\'ils franchissent la porte du cabinet ? Avec l\'IA, vous creez des fiches d\'exercices claires, illustrees et parfaitement adaptees a chaque patient. \u{1F3CB}\u{FE0F}

L\'assistant Freenzy genere des programmes personnalises en fonction du bilan du patient. Vous indiquez : "Programme pour lombalgie chronique, stade subaigu, patient sedentaire, objectif renforcement gainage et etirements chaine posterieure." L\'IA propose un programme progressif sur 4 semaines avec des exercices adaptes au niveau du patient.

Chaque fiche d\'exercice comprend : le nom de l\'exercice, la position de depart detaillee, le mouvement a realiser etape par etape, le nombre de series et repetitions, le temps de repos, les erreurs a eviter et les variantes (simplifiee et avancee). Le langage est adapte au patient, sans jargon medical incomprehensible. \u{2705}

L\'IA gere aussi la progressivite. Semaine 1 : exercices simples et peu intenses pour creer l\'habitude. Semaine 2 : augmentation du nombre de repetitions. Semaine 3 : introduction d\'exercices plus complexes. Semaine 4 : consolidation avec resistance ajoutee. Cette progression respecte les principes physiologiques d\'adaptation tissulaire.

Le systeme de suivi patient est un vrai plus. Via un lien envoye par SMS, le patient peut cocher les exercices realises et noter sa douleur sur une echelle de 0 a 10 apres chaque seance. Vous recevez un resume avant la consultation suivante : "Le patient a realise 80% des exercices, douleur moyenne passee de 6/10 a 4/10." Ces donnees objectives enrichissent votre prise en charge.

Vous pouvez constituer une bibliotheque de programmes types par pathologie, puis les personnaliser rapidement pour chaque patient. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'kine-m3-l2',
          title: 'Exercice : Programme de reeducation',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez un programme d\'exercices personnalise.',
          exercisePrompt: `Vous prenez en charge une patiente de 55 ans :
- Prothese totale de genou droit (J+15 post-operatoire)
- Amplitude actuelle : flexion 70 degres, extension -5 degres
- Douleur EVA : 5/10 au mouvement
- Objectif : recuperer 90 degres de flexion en 3 semaines

Redigez le brief pour l\'assistant Freenzy afin de generer un programme d\'exercices a domicile :
1. Decrivez le profil patient et les contraintes post-operatoires
2. Precisez les objectifs chiffres (amplitude, douleur)
3. Indiquez la frequence souhaitee (exercices/jour)
4. Listez les contre-indications a respecter
5. Proposez un critere de progression entre les semaines.`,
          xpReward: 20,
        },
        {
          id: 'kine-m3-l3',
          title: 'Quiz — Exercices IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la creation de programmes.',
          quizQuestions: [
            {
              question: 'Que comprend chaque fiche d\'exercice generee par l\'IA ?',
              options: [
                'Juste le nom de l\'exercice',
                'Position, mouvement, series, repos, erreurs et variantes',
                'Un lien vers YouTube',
                'Uniquement un dessin',
              ],
              correctIndex: 1,
              explanation: 'Chaque fiche inclut position de depart, mouvement detaille, series/repetitions, repos, erreurs a eviter et variantes.',
            },
            {
              question: 'Comment le patient suit-il ses exercices a domicile ?',
              options: [
                'Il appelle le cabinet chaque jour',
                'Via un lien SMS pour cocher les exercices et noter sa douleur',
                'Il n\'y a pas de suivi',
                'Par courrier postal',
              ],
              correctIndex: 1,
              explanation: 'Le patient recoit un lien SMS pour cocher les exercices realises et noter sa douleur, fournissant un suivi objectif.',
            },
            {
              question: 'Sur combien de semaines l\'IA propose-t-elle un programme progressif ?',
              options: ['1 semaine', '2 semaines', '4 semaines', '8 semaines'],
              correctIndex: 2,
              explanation: 'L\'IA propose un programme progressif sur 4 semaines avec augmentation graduelle de l\'intensite et de la complexite.',
            },
            {
              question: 'Pourquoi le langage de la fiche est-il simplifie ?',
              options: [
                'Pour que l\'IA comprenne mieux',
                'Pour eviter le jargon medical incomprehensible pour le patient',
                'Pour reduire le nombre de pages',
                'Pour des raisons legales',
              ],
              correctIndex: 1,
              explanation: 'Le langage est adapte au patient, sans jargon medical, pour maximiser la comprehension et l\'observance des exercices.',
            },
            {
              question: 'Quel principe physiologique la progressivite respecte-t-elle ?',
              options: [
                'Le principe de precaution',
                'L\'adaptation tissulaire',
                'La fatigue musculaire',
                'La prescription medicale',
              ],
              correctIndex: 1,
              explanation: 'La progression respecte les principes d\'adaptation tissulaire : les tissus ont besoin de temps pour s\'adapter a des charges croissantes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3CB}\u{FE0F}',
      badgeName: 'Coach Exos',
    },
    // Module 4 — Facturation CPAM
    {
      id: 'kine-m4',
      title: 'Facturation CPAM simplifiee',
      emoji: '\u{1F4B3}',
      description: 'Automatisez votre facturation Sesam Vitale et vos teletrasmissions.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m4-l1',
          title: 'La facturation CPAM sans stress',
          duration: '4 min',
          type: 'text',
          content: `La facturation est la bete noire de nombreux kinesitherapeutes. Entre les codes NGAP qui changent, les ententes prealables, les depassements, les mutuelles et les rejets de teletransmission, c\'est un veritable labyrinthe administratif. L\'IA simplifie drastiquement ce processus ! \u{1F4B3}

L\'assistant Freenzy connait parfaitement la nomenclature NGAP applicable aux masseurs-kinesitherapeutes. Quand vous saisissez une seance, il propose automatiquement le code adapte : AMK 8 pour une seance de reeducation standard, AMK 9.5 pour une reeducation complexe, AMK 10 pour une reeducation vestibulaire, etc. Plus besoin de chercher dans les tableaux de cotation !

Le systeme de verification pre-teletransmission est particulierement utile. Avant d\'envoyer vos factures a la CPAM, l\'IA verifie : la coherence entre le code acte et la prescription medicale, le respect du nombre de seances autorisees, la validite de l\'ordonnance (moins de 6 mois pour les ALD), et la presence de toutes les informations obligatoires. \u{2705}

Pour les demandes d\'entente prealable, l\'IA genere automatiquement le formulaire avec les informations du bilan. Elle calcule le nombre de seances demandees en fonction de la pathologie et des recommandations HAS, et vous rappelle les delais de reponse. Si la CPAM ne repond pas dans les 15 jours, l\'IA vous notifie que l\'accord est tacite.

La gestion des tiers payant est aussi simplifiee. L\'IA identifie automatiquement la part Secu et la part mutuelle, genere les bordereaux de teletransmission et suit les paiements. En cas de rejet, elle analyse le motif et vous propose la correction : "Rejet 31 — numero de prescripteur invalide. Verifiez le RPPS du medecin prescripteur."

Enfin, l\'IA produit un tableau de bord financier mensuel : chiffre d\'affaires, nombre d\'actes par type, montant des rejets, delai moyen de paiement CPAM et mutuelles. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'kine-m4-l2',
          title: 'Jeu : Codes NGAP kine',
          duration: '3 min',
          type: 'game',
          content: 'Associez les actes a leur code de cotation.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Reeducation standard membre', right: 'AMK 8' },
              { left: 'Reeducation complexe', right: 'AMK 9.5' },
              { left: 'Reeducation vestibulaire', right: 'AMK 10' },
              { left: 'Bilan diagnostique', right: 'AMK 8.3' },
              { left: 'Drainage lymphatique', right: 'AMK 8' },
              { left: 'Reeducation respiratoire', right: 'AMK 8.5' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'kine-m4-l3',
          title: 'Quiz — Facturation CPAM',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la facturation automatisee.',
          quizQuestions: [
            {
              question: 'Que verifie l\'IA avant la teletransmission ?',
              options: [
                'Le solde du compte bancaire',
                'Coherence acte/prescription, nombre de seances, validite ordonnance',
                'La meteo du jour',
                'L\'adresse du patient',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie la coherence entre code acte et prescription, le nombre de seances autorisees et la validite de l\'ordonnance.',
            },
            {
              question: 'Apres combien de jours sans reponse l\'entente prealable est-elle tacitement acceptee ?',
              options: ['7 jours', '10 jours', '15 jours', '30 jours'],
              correctIndex: 2,
              explanation: 'Si la CPAM ne repond pas dans les 15 jours suivant la demande d\'entente prealable, l\'accord est considere comme tacite.',
            },
            {
              question: 'Que fait l\'IA en cas de rejet de teletransmission ?',
              options: [
                'Elle abandonne la facture',
                'Elle analyse le motif et propose la correction',
                'Elle appelle la CPAM',
                'Elle supprime le patient',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse le code de rejet et propose la correction specifique a appliquer pour renvoyer la facture.',
            },
            {
              question: 'Quelle duree de validite a une ordonnance ALD ?',
              options: ['3 mois', '6 mois', '1 an', 'Illimitee'],
              correctIndex: 1,
              explanation: 'Pour les patients en ALD, l\'ordonnance doit avoir moins de 6 mois pour etre valide lors de la facturation.',
            },
            {
              question: 'Quel tableau de bord l\'IA fournit-elle ?',
              options: [
                'Un classement des meilleurs patients',
                'CA, actes par type, rejets, delais de paiement',
                'Les horaires de la CPAM',
                'La liste des concurrents',
              ],
              correctIndex: 1,
              explanation: 'L\'IA produit un tableau de bord mensuel avec CA, nombre d\'actes, montant des rejets et delais de paiement.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B3}',
      badgeName: 'Factu Expert',
    },
    // Module 5 — Communication cabinet
    {
      id: 'kine-m5',
      title: 'Communication et visibilite du cabinet',
      emoji: '\u{1F4E2}',
      description: 'Developpez la presence en ligne de votre cabinet de kinesitherapie.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m5-l1',
          title: 'Developper la visibilite de son cabinet',
          duration: '4 min',
          type: 'text',
          content: `La communication est souvent le parent pauvre des cabinets de kinesitherapie. Pourtant, dans un contexte de plus en plus concurrentiel, se faire connaitre et fideliser ses patients est essentiel. L\'IA vous aide a developper votre presence en ligne sans y passer des heures ! \u{1F4E2}

Commencez par votre fiche Google My Business. L\'assistant Freenzy redige une description optimisee pour le referencement local : specialites, equipements, horaires, acces. Il genere aussi des reponses professionnelles aux avis Google — positifs comme negatifs. Pour un avis negatif, l\'IA propose une reponse empathique et constructive qui montre votre professionnalisme aux futurs patients qui liront.

Les reseaux sociaux sont un levier puissant mais chronophage. L\'IA genere un calendrier editorial mensuel avec des idees de posts adaptes a votre specialite : "Mardi : conseil posture au bureau", "Jeudi : exercice etirement en video", "Samedi : temoignage patient (anonymise)." Pour chaque idee, elle redige le texte du post avec les hashtags pertinents. \u{2705}

Le contenu educatif est votre meilleur outil marketing. L\'IA redige des articles de blog sur les pathologies que vous traitez : "5 exercices contre le mal de dos au bureau", "Comment prevenir les tendinites du sportif", "Reeducation apres entorse de cheville : les etapes cles." Ces articles ameliorent votre referencement Google et positionnent votre expertise.

La communication patient est aussi optimisee. L\'IA genere des newsletters mensuelles pour vos patients : conseils saisonniers, nouveaux services, informations pratiques. Elle cree des SMS de fidelisation : "Bonjour Marie, cela fait 3 mois depuis votre derniere seance. N\'hesitez pas a reprendre rendez-vous si besoin."

Pour les cabinets de groupe, l\'IA cree une page de presentation de chaque praticien avec ses specialites, sa formation et ses disponibilites. Resultat : les patients trouvent plus facilement le kine qui correspond a leur besoin. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'kine-m5-l2',
          title: 'Exercice : Strategie communication cabinet',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez votre plan de communication avec l\'IA.',
          exercisePrompt: `Votre cabinet de kinesitherapie comprend 3 praticiens avec ces specialites :
- Vous : reeducation du sport et traumatologie
- Collegue 1 : pediatrie et reeducation respiratoire
- Collegue 2 : reeducation vestibulaire et geriatrie

Le cabinet est installe depuis 2 ans mais n\'a aucune presence en ligne.

Redigez le brief pour l\'assistant Freenzy :
1. Decrivez le positionnement souhaite pour le cabinet
2. Proposez 4 themes d\'articles de blog (un par specialite + un general)
3. Imaginez un calendrier de posts pour une semaine type
4. Redigez un modele de reponse a un avis Google negatif : "Attente trop longue, 20 min de retard sur mon rdv."
5. Proposez une idee de newsletter mensuelle.`,
          xpReward: 20,
        },
        {
          id: 'kine-m5-l3',
          title: 'Quiz — Communication kine',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances en communication de cabinet.',
          quizQuestions: [
            {
              question: 'Quel outil est prioritaire pour la visibilite locale d\'un cabinet ?',
              options: ['Instagram', 'Google My Business', 'LinkedIn', 'TikTok'],
              correctIndex: 1,
              explanation: 'Google My Business est prioritaire car c\'est la premiere chose que voient les patients cherchant un kine a proximite.',
            },
            {
              question: 'Comment repondre a un avis negatif selon les bonnes pratiques ?',
              options: [
                'Ignorer l\'avis',
                'Repondre agressivement',
                'Reponse empathique et constructive',
                'Supprimer l\'avis',
              ],
              correctIndex: 2,
              explanation: 'Une reponse empathique et constructive montre votre professionnalisme aux futurs patients qui liront l\'echange.',
            },
            {
              question: 'Quel type de contenu ameliore le plus le referencement Google ?',
              options: [
                'Les photos du cabinet',
                'Les articles educatifs sur les pathologies',
                'Les tarifs',
                'Les horaires d\'ouverture',
              ],
              correctIndex: 1,
              explanation: 'Les articles educatifs enrichissent votre site en contenu pertinent, ameliorant significativement votre referencement naturel.',
            },
            {
              question: 'A quelle frequence envoyer une newsletter patient ?',
              options: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Annuelle'],
              correctIndex: 2,
              explanation: 'Une newsletter mensuelle est le bon rythme : assez frequent pour rester present, sans etre intrusif.',
            },
            {
              question: 'Que genere l\'IA pour les reseaux sociaux ?',
              options: [
                'Uniquement des photos',
                'Un calendrier editorial avec textes et hashtags',
                'Des publicites payantes',
                'Des faux avis',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere un calendrier editorial mensuel avec idees de posts, textes rediges et hashtags pertinents.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E2}',
      badgeName: 'Comm Expert',
    },
    // Module 6 — Suivi reeducation
    {
      id: 'kine-m6',
      title: 'Suivi de reeducation et resultats',
      emoji: '\u{1F4C8}',
      description: 'Mesurez et optimisez les resultats de vos prises en charge.',
      duration: '8 min',
      lessons: [
        {
          id: 'kine-m6-l1',
          title: 'Mesurer les resultats de la reeducation',
          duration: '4 min',
          type: 'text',
          content: `La kinesitherapie basee sur les preuves (EBP) exige de mesurer objectivement les resultats. Pourtant, dans la pratique quotidienne, ce suivi est souvent approximatif faute de temps. L\'IA transforme le suivi de reeducation en vous offrant des outils de mesure simples et automatises. \u{1F4C8}

L\'assistant Freenzy cree pour chaque patient un tableau de bord de suivi. A chaque seance, vous saisissez rapidement les mesures cles : amplitudes articulaires, force musculaire, EVA douleur, tests fonctionnels (Timed Up and Go, test 6 minutes, score DASH pour le membre superieur, score IKDC pour le genou, etc.). L\'IA enregistre et trace automatiquement les courbes d\'evolution.

Les graphiques generes sont parlants : vous voyez en un coup d\'oeil la progression de chaque parametre au fil des seances. L\'IA detecte aussi les stagnations : "Attention, l\'amplitude de flexion du genou stagne depuis 3 seances a 85 degres. Suggestions : techniques de gain d\'amplitude (postures, mobilisations specifiques), cryotherapie post-seance." \u{2705}

Le rapport de fin de prise en charge est genere automatiquement. Il inclut un resume des bilans initial et final, les graphiques d\'evolution, le nombre de seances realisees, les techniques utilisees et les recommandations pour la suite. Ce document professionnel est ideal pour communiquer avec le medecin prescripteur et justifier votre prise en charge.

L\'IA calcule aussi vos indicateurs de performance globaux : taux de reussite par pathologie, nombre moyen de seances pour atteindre les objectifs, satisfaction patient. Ces metriques vous permettent d\'identifier vos points forts et les axes d\'amelioration de votre pratique.

Pour les patients chroniques (lombalgiques, neurologiques), l\'IA propose des bilans de suivi a intervalles reguliers et alerte si les indicateurs se degradent apres la fin de la prise en charge initiale. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'kine-m6-l2',
          title: 'Jeu : Ordonner les etapes du suivi',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes du suivi de reeducation.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Bilan diagnostique initial (BDK)',
              'Definition des objectifs chiffres',
              'Seances avec mesures a chaque consultation',
              'Bilan intermediaire (comparaison)',
              'Ajustement du programme si stagnation',
              'Bilan final et rapport au medecin',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'kine-m6-l3',
          title: 'Quiz — Suivi reeducation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le suivi assiste par IA.',
          quizQuestions: [
            {
              question: 'Que detecte automatiquement l\'IA dans les courbes d\'evolution ?',
              options: [
                'Les erreurs de saisie uniquement',
                'Les stagnations et propose des solutions',
                'Les factures impayees',
                'Les absences du patient',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les phases de stagnation dans les mesures et suggere des techniques alternatives pour relancer la progression.',
            },
            {
              question: 'Quel score est utilise pour evaluer le membre superieur ?',
              options: ['IKDC', 'DASH', 'Timed Up and Go', 'EVA'],
              correctIndex: 1,
              explanation: 'Le score DASH (Disabilities of the Arm, Shoulder and Hand) est specifiquement concu pour evaluer le membre superieur.',
            },
            {
              question: 'Que contient le rapport de fin de prise en charge ?',
              options: [
                'Uniquement la facture',
                'Bilans, graphiques, seances, techniques et recommandations',
                'Un certificat medical',
                'La prescription du medecin',
              ],
              correctIndex: 1,
              explanation: 'Le rapport inclut un resume des bilans, graphiques d\'evolution, nombre de seances, techniques et recommandations.',
            },
            {
              question: 'Quel indicateur global l\'IA calcule-t-elle pour le praticien ?',
              options: [
                'Le classement entre kines',
                'Le taux de reussite par pathologie',
                'Le nombre de likes sur les reseaux',
                'Le prix moyen des seances',
              ],
              correctIndex: 1,
              explanation: 'L\'IA calcule le taux de reussite par pathologie, permettant d\'identifier ses points forts et axes d\'amelioration.',
            },
            {
              question: 'Que propose l\'IA pour les patients chroniques apres fin de prise en charge ?',
              options: [
                'Rien, le suivi est termine',
                'Des bilans periodiques et alerte si degradation',
                'Un abonnement payant',
                'Un transfert vers un autre kine',
              ],
              correctIndex: 1,
              explanation: 'Pour les chroniques, l\'IA propose des bilans a intervalles reguliers et alerte si les indicateurs se degradent.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C8}',
      badgeName: 'Suivi Pro',
    },
  ],
};

// =============================================================================
// 2. IA pour les Architectes
// =============================================================================

export const parcoursArchitecteIA: FormationParcours = {
  id: 'architecte-ia',
  title: 'IA pour les Architectes',
  emoji: '\u{1F3D7}\u{FE0F}',
  description: 'Integrez l\'IA dans votre pratique architecturale : cahiers des charges, estimations budgetaires, normes RT2020, presentations client, suivi de chantier et appels d\'offres.',
  category: 'metier',
  subcategory: 'architecture',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#4F46E5',
  diplomaTitle: 'Architecte Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Architectes',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Cahier des charges intelligent
    {
      id: 'archi-m1',
      title: 'Cahier des charges assiste par IA',
      emoji: '\u{1F4D0}',
      description: 'Generez des cahiers des charges complets et structures en un temps record.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m1-l1',
          title: 'Rediger un cahier des charges avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le cahier des charges est la pierre angulaire de tout projet architectural. Il definit les attentes du maitre d\'ouvrage, les contraintes techniques, le budget et le calendrier. Sa redaction est pourtant souvent chronophage : il faut compiler les echanges avec le client, verifier la reglementation et structurer le document. L\'IA accelere considerablement ce processus ! \u{1F4D0}

Avec l\'assistant Freenzy, vous partez d\'un brief client en langage naturel : "Maison individuelle 140m2, terrain 600m2 en pente, exposition sud, 4 chambres, garage double, budget 350K euros, commune classee PLU zone UB." L\'IA genere un cahier des charges structure comprenant : contexte du projet, programme fonctionnel detaille, contraintes urbanistiques identifiees, exigences techniques (RT2020, accessibilite), budget previsionnel decompose et planning previsionnel.

L\'IA consulte automatiquement les regles d\'urbanisme applicables a la zone mentionnee : coefficient d\'emprise au sol, hauteur maximale, reculs obligatoires, aspect exterieur impose. Elle integre ces contraintes dans le cahier des charges et alerte sur les incompatibilites eventuelles : "Attention : le PLU zone UB impose une hauteur maximale de 9m, verifiez la compatibilite avec un R+1+combles." \u{2705}

Le programme fonctionnel est detaille piece par piece avec les surfaces recommandees selon les standards : sejour 35-40m2, cuisine 12-15m2, chambre parentale 14-16m2 avec SDB, chambres enfants 10-12m2. L\'IA propose aussi des variantes pour optimiser le budget : "Variante A : garage integre (economie structure), Variante B : garage accole (plus de surface habitable)."

Chaque cahier des charges inclut une checklist de validation que vous parcourez avec le client avant de passer a l\'esquisse. L\'IA genere aussi un compte rendu de reunion formaté que vous envoyez au client pour validation ecrite, securisant ainsi la relation contractuelle. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'archi-m1-l2',
          title: 'Exercice : Brief client vers CDC',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez un brief client en cahier des charges structure.',
          exercisePrompt: `Un client vous contacte avec ce brief verbal :
"On veut agrandir notre maison des annees 70, environ 50m2 en plus. On a besoin d'une grande piece de vie ouverte, une suite parentale et un bureau pour le teletravail. Le terrain est plat, on a un budget de 120 000 euros. La maison est dans un lotissement avec un reglement."

Redigez le brief que vous donneriez a l\'assistant Freenzy pour generer le CDC :
1. Reformulez les besoins du client de maniere structuree
2. Listez les informations manquantes a demander au client
3. Identifiez les contraintes reglementaires probables (lotissement)
4. Proposez 2 options d\'implantation de l\'extension
5. Estimez si le budget est coherent avec le programme.`,
          xpReward: 20,
        },
        {
          id: 'archi-m1-l3',
          title: 'Quiz — Cahier des charges',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur la generation de CDC.',
          quizQuestions: [
            {
              question: 'Que verifie automatiquement l\'IA dans le PLU ?',
              options: [
                'Le prix du terrain',
                'Emprise au sol, hauteur, reculs et aspect exterieur',
                'Le nom du maire',
                'Le nombre de voisins',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie les regles d\'urbanisme : coefficient d\'emprise, hauteur maximale, reculs obligatoires et contraintes d\'aspect.',
            },
            {
              question: 'Que genere l\'IA apres une reunion client ?',
              options: [
                'Une facture',
                'Un compte rendu formate pour validation ecrite',
                'Un permis de construire',
                'Un plan d\'execution',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere un compte rendu structure que le client valide par ecrit, securisant la relation contractuelle.',
            },
            {
              question: 'Comment l\'IA aide-t-elle a optimiser le budget ?',
              options: [
                'Elle reduit les surfaces',
                'Elle propose des variantes avec analyse cout/benefice',
                'Elle supprime des pieces',
                'Elle negocie avec les entreprises',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des variantes (ex: garage integre vs accole) avec une analyse des impacts sur le budget et les surfaces.',
            },
            {
              question: 'Quelle surface l\'IA recommande-t-elle pour un sejour standard ?',
              options: ['20-25m2', '25-30m2', '35-40m2', '50-60m2'],
              correctIndex: 2,
              explanation: 'Selon les standards, l\'IA recommande 35 a 40m2 pour un sejour dans une maison individuelle de 140m2.',
            },
            {
              question: 'Que contient la checklist de validation du CDC ?',
              options: [
                'Les coordonnees du notaire',
                'Les points a valider avec le client avant l\'esquisse',
                'La liste des entreprises',
                'Les plans d\'execution',
              ],
              correctIndex: 1,
              explanation: 'La checklist recapitule tous les points du programme a valider avec le client avant de passer a la phase esquisse.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4D0}',
      badgeName: 'CDC Express',
    },
    // Module 2 — Estimations budgetaires
    {
      id: 'archi-m2',
      title: 'Estimations budgetaires precises',
      emoji: '\u{1F4B0}',
      description: 'Generez des estimations fiables avec l\'IA pour maitriser les couts.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m2-l1',
          title: 'L\'estimation budgetaire assistee par IA',
          duration: '4 min',
          type: 'text',
          content: `L\'estimation budgetaire est l\'un des exercices les plus delicats pour un architecte. Trop basse, vous perdez la confiance du client quand les devis tombent. Trop haute, vous risquez de perdre le projet. L\'IA vous aide a produire des estimations precises et argumentees, basees sur des donnees actualisees. \u{1F4B0}

L\'assistant Freenzy utilise des ratios de cout au m2 actualises par region et par type de construction. Pour une maison individuelle en Ile-de-France, il applique des fourchettes differentes selon la gamme : standard (1 800-2 200 euros/m2), milieu de gamme (2 200-2 800 euros/m2), haut de gamme (2 800-3 500 euros/m2). Ces ratios sont ajustes selon les specificites du projet.

L\'IA decompose l\'estimation par lots techniques : terrassement, gros oeuvre, charpente-couverture, menuiseries exterieures, electricite, plomberie, CVC (chauffage-ventilation-climatisation), platrerie, revetements sols et murs, menuiseries interieures, peinture, amenagements exterieurs. Pour chaque lot, elle fournit une fourchette basse et haute. \u{2705}

Les facteurs de correction sont automatiquement integres : majoration pour terrain en pente (+8-15%), sol argileux (+5-10%), zone sismique (+3-8%), acces chantier difficile (+5-12%). L\'IA demande ces informations si elles ne sont pas dans le brief initial et ajuste l\'estimation en consequence.

Le document genere inclut aussi les honoraires architecte (8-12% selon mission complete ou partielle), les frais annexes (etude de sol, bureau de controle, assurance DO, branchements reseaux) et une provision pour aleas (5-10%). Le client recoit ainsi une vision complete du budget global, pas seulement le cout de construction.

L\'IA propose enfin un comparatif avec des projets similaires realises dans la meme zone geographique, donnant au client des reperes concrets pour evaluer l\'estimation. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'archi-m2-l2',
          title: 'Jeu : Classer les lots par budget',
          duration: '3 min',
          type: 'game',
          content: 'Classez les lots du plus couteux au moins couteux.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Gros oeuvre (30-35% du budget)',
              'CVC et plomberie (12-15%)',
              'Menuiseries exterieures (8-12%)',
              'Electricite (7-10%)',
              'Revetements sols et murs (6-8%)',
              'Peinture et finitions (3-5%)',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'archi-m2-l3',
          title: 'Quiz — Estimations',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les estimations budgetaires.',
          quizQuestions: [
            {
              question: 'Quel est le ratio moyen au m2 pour une maison milieu de gamme en IDF ?',
              options: ['1 200-1 500 euros', '1 800-2 200 euros', '2 200-2 800 euros', '3 500-4 000 euros'],
              correctIndex: 2,
              explanation: 'En Ile-de-France, une construction milieu de gamme se situe entre 2 200 et 2 800 euros/m2.',
            },
            {
              question: 'Quelle majoration pour un terrain en pente ?',
              options: ['1-3%', '4-7%', '8-15%', '20-30%'],
              correctIndex: 2,
              explanation: 'Un terrain en pente entraine une majoration de 8 a 15% liee aux terrassements et fondations specifiques.',
            },
            {
              question: 'Quel pourcentage represente le gros oeuvre dans le budget total ?',
              options: ['15-20%', '20-25%', '30-35%', '40-50%'],
              correctIndex: 2,
              explanation: 'Le gros oeuvre (fondations, murs, dalles, structure) represente generalement 30 a 35% du budget construction.',
            },
            {
              question: 'Quel poste est souvent oublie dans les estimations ?',
              options: [
                'Le gros oeuvre',
                'L\'assurance dommages-ouvrage et frais annexes',
                'La peinture',
                'Les fenetres',
              ],
              correctIndex: 1,
              explanation: 'L\'assurance DO, l\'etude de sol, le bureau de controle et les branchements sont souvent oublies mais representent un cout significatif.',
            },
            {
              question: 'Quel pourcentage de provision pour aleas l\'IA recommande-t-elle ?',
              options: ['1-2%', '3-4%', '5-10%', '15-20%'],
              correctIndex: 2,
              explanation: 'L\'IA recommande une provision pour aleas de 5 a 10% du budget total pour couvrir les imprevu du chantier.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Budget Pro',
    },
    // Module 3 — Normes RT2020
    {
      id: 'archi-m3',
      title: 'Conformite RE2020 et normes',
      emoji: '\u{1F33F}',
      description: 'Maitrisez les exigences de la RE2020 avec l\'aide de l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m3-l1',
          title: 'La RE2020 decryptee par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La Reglementation Environnementale 2020 (RE2020) a remplace la RT2012 avec des exigences nettement renforcees. Pour les architectes, c\'est un defi technique majeur : il faut maitriser les indicateurs carbone, la performance energetique et le confort d\'ete. L\'IA vous aide a naviguer dans cette complexite reglementaire. \u{1F33F}

L\'assistant Freenzy integre les trois piliers de la RE2020 : la performance energetique (Bbio, Cep, Cep_nr), l\'impact carbone (Ic_construction, Ic_energie) et le confort d\'ete (DH — Degres-Heures d\'inconfort). Pour chaque projet, il verifie la conformite aux seuils applicables selon la date du permis de construire, car les seuils se durcissent progressivement jusqu\'en 2031.

Concretement, vous decrivez votre projet et l\'IA identifie les points de vigilance : "Maison individuelle zone H2a, le seuil Bbio est de 63 points. Avec votre orientation et votre ratio de baies vitrees de 22%, le Bbio estime est de 58 — conforme mais serrez. Recommandations : augmenter l\'isolation des combles de R=8 a R=10, ou reduire les baies nord." \u{2705}

L\'IA est particulierement utile pour l\'indicateur carbone Ic_construction. Elle evalue l\'impact des choix constructifs : "Plancher beton (450 kgCO2/m2) vs plancher bois (120 kgCO2/m2) — gain de 73% sur ce lot." Elle propose des alternatives bas carbone pour chaque lot et calcule l\'impact global sur l\'Ic_construction du projet.

Pour le confort d\'ete, l\'IA simule les Degres-Heures d\'inconfort en fonction de l\'orientation, des protections solaires, de l\'inertie thermique et de la ventilation naturelle. Elle recommande des solutions : brise-soleil, stores exterieurs, casquettes, ventilation traversante, materiaux a forte inertie.

L\'IA genere aussi la fiche descriptive RE2020 et le recapitulatif standardise d\'etude thermique, documents obligatoires pour le depot de permis de construire. Un gain de temps precieux dans le montage du dossier ! \u{1F3E0}`,
          xpReward: 15,
        },
        {
          id: 'archi-m3-l2',
          title: 'Jeu : Indicateurs RE2020',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque indicateur a sa signification.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Bbio', right: 'Besoin bioclimatique du batiment' },
              { left: 'Cep', right: 'Consommation energie primaire' },
              { left: 'Cep_nr', right: 'Consommation energie non renouvelable' },
              { left: 'Ic_construction', right: 'Impact carbone de la construction' },
              { left: 'Ic_energie', right: 'Impact carbone de l\'energie' },
              { left: 'DH', right: 'Degres-Heures d\'inconfort ete' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'archi-m3-l3',
          title: 'Quiz — RE2020',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur la RE2020.',
          quizQuestions: [
            {
              question: 'Quels sont les trois piliers de la RE2020 ?',
              options: [
                'Cout, delai, qualite',
                'Energie, carbone, confort d\'ete',
                'Isolation, chauffage, ventilation',
                'Structure, electricite, plomberie',
              ],
              correctIndex: 1,
              explanation: 'La RE2020 repose sur trois piliers : performance energetique, impact carbone et confort d\'ete.',
            },
            {
              question: 'Quel indicateur mesure le confort d\'ete ?',
              options: ['Bbio', 'Cep', 'DH (Degres-Heures)', 'Ic_construction'],
              correctIndex: 2,
              explanation: 'Les Degres-Heures (DH) d\'inconfort mesurent le nombre d\'heures ou la temperature interieure depasse le seuil de confort.',
            },
            {
              question: 'Quel gain carbone offre un plancher bois vs beton ?',
              options: ['20%', '40%', '60%', '73%'],
              correctIndex: 3,
              explanation: 'Un plancher bois (120 kgCO2/m2) offre un gain de 73% par rapport au beton (450 kgCO2/m2) sur l\'impact carbone.',
            },
            {
              question: 'Jusqu\'a quand les seuils RE2020 se durcissent-ils ?',
              options: ['2025', '2028', '2031', '2035'],
              correctIndex: 2,
              explanation: 'Les seuils RE2020 se durcissent progressivement par paliers jusqu\'en 2031, imposant des performances croissantes.',
            },
            {
              question: 'Quel document RE2020 est obligatoire pour le permis de construire ?',
              options: [
                'L\'etude de sol',
                'La fiche descriptive et le recapitulatif d\'etude thermique',
                'Le devis des entreprises',
                'Le plan de financement',
              ],
              correctIndex: 1,
              explanation: 'La fiche descriptive RE2020 et le recapitulatif standardise d\'etude thermique sont obligatoires au depot du PC.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F33F}',
      badgeName: 'RE2020 Expert',
    },
    // Module 4 — Presentation client
    {
      id: 'archi-m4',
      title: 'Presentations client percutantes',
      emoji: '\u{1F3A8}',
      description: 'Creez des presentations de projet qui convainquent vos clients.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m4-l1',
          title: 'Convaincre avec des presentations IA',
          duration: '4 min',
          type: 'text',
          content: `La presentation au client est le moment ou votre projet prend vie. C\'est aussi le moment ou vous devez convaincre — et justifier vos honoraires. L\'IA vous aide a creer des presentations percutantes qui mettent en valeur votre travail et facilitent la prise de decision du client. \u{1F3A8}

L\'assistant Freenzy structure votre presentation selon un schema eprouve : rappel du programme et des contraintes, parti architectural (pourquoi ces choix), plans commentes, perspectives et ambiances, chiffrage estimatif, et prochaines etapes. Chaque section est redigee avec un vocabulaire accessible au client non initie.

Pour les plans, l\'IA genere des legendes claires : "Le sejour de 38m2 s\'ouvre sur la terrasse sud par une baie coulissante de 3 metres. La cuisine ouverte de 14m2 offre un ilot central face au jardin." Ce commentaire narratif aide le client a se projeter la ou un plan cote le laisse perplexe. \u{2705}

L\'IA cree aussi des tableaux comparatifs lorsque vous presentez plusieurs options. Variante A vs Variante B : surfaces, budget, avantages et inconvenients de chacune, avec une recommandation argumentee. Le client dispose de tous les elements pour choisir en connaissance de cause.

Les textes d\'ambiance sont un outil puissant que l\'IA maitrise parfaitement : "Imaginez votre reveil : la lumiere matinale traverse les baies de la chambre parentale orientee est, inondant la piece d\'une douce clarte naturelle. Depuis le lit, vous apercevez la cime des arbres du jardin..." Ce storytelling emotionnel cree une connexion entre le client et le projet.

Enfin, l\'IA prepare les reponses aux questions frequentes des clients : "Pourquoi un toit plat plutot qu\'une toiture traditionnelle ?", "Est-ce que le bois est durable ?", "Combien coute l\'entretien annuel ?" Vous anticipez ainsi les objections et renforcez votre credibilite professionnelle. \u{1F4BC}`,
          xpReward: 15,
        },
        {
          id: 'archi-m4-l2',
          title: 'Exercice : Presentation projet renovation',
          duration: '3 min',
          type: 'exercise',
          content: 'Preparez une presentation client avec l\'IA.',
          exercisePrompt: `Vous presentez un projet de renovation d'un appartement haussmannien de 95m2 a Paris :
- Budget : 180 000 euros
- Programme : ouvrir cuisine sur sejour, creer une 3eme chambre, refaire SDB
- Contraintes : immeuble classe, syndic strict, parquet d'epoque a conserver

Redigez le brief pour l\'assistant Freenzy :
1. Structurez la presentation en 5 sections
2. Redigez le texte d\'ambiance pour le sejour ouvert sur la cuisine
3. Proposez un tableau comparatif pour 2 options d\'amenagement de la 3eme chambre
4. Listez 3 questions clients probables avec vos reponses
5. Decrivez comment presenter les contraintes de l\'immeuble classe comme des atouts.`,
          xpReward: 20,
        },
        {
          id: 'archi-m4-l3',
          title: 'Quiz — Presentations',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos competences en presentation client.',
          quizQuestions: [
            {
              question: 'Par quoi commencer une presentation de projet ?',
              options: [
                'Le budget',
                'Le rappel du programme et des contraintes',
                'Les perspectives 3D',
                'Le planning travaux',
              ],
              correctIndex: 1,
              explanation: 'Commencer par le rappel du programme montre que vous avez ecoute le client et assure la coherence du discours.',
            },
            {
              question: 'Pourquoi utiliser des textes d\'ambiance ?',
              options: [
                'Pour remplir la presentation',
                'Pour creer une connexion emotionnelle avec le projet',
                'Pour cacher les defauts',
                'Pour justifier le prix',
              ],
              correctIndex: 1,
              explanation: 'Le storytelling emotionnel aide le client a se projeter dans son futur espace, favorisant l\'adhesion au projet.',
            },
            {
              question: 'Comment presenter plusieurs variantes au client ?',
              options: [
                'En imposer une seule',
                'Avec un tableau comparatif et une recommandation argumentee',
                'Par tirage au sort',
                'En montrant uniquement la plus chere',
              ],
              correctIndex: 1,
              explanation: 'Un tableau comparatif avec surfaces, budgets, avantages/inconvenients permet au client de choisir en connaissance de cause.',
            },
            {
              question: 'A quoi sert de preparer les reponses aux questions frequentes ?',
              options: [
                'A eviter le dialogue',
                'A anticiper les objections et renforcer la credibilite',
                'A allonger la presentation',
                'A vendre des prestations supplementaires',
              ],
              correctIndex: 1,
              explanation: 'Anticiper les questions montre votre expertise et votre preparation, renforçant la confiance du client.',
            },
            {
              question: 'Quel vocabulaire utiliser dans une presentation client ?',
              options: [
                'Le jargon technique maximal',
                'Un vocabulaire accessible au non-initie',
                'De l\'anglais technique',
                'Des abreviations normatives',
              ],
              correctIndex: 1,
              explanation: 'Un vocabulaire accessible permet au client de comprendre et de s\'approprier le projet sans se sentir depassé.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3A8}',
      badgeName: 'Presentateur Pro',
    },
    // Module 5 — Suivi de chantier
    {
      id: 'archi-m5',
      title: 'Suivi de chantier intelligent',
      emoji: '\u{1F477}',
      description: 'Gerez vos chantiers efficacement avec des outils IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m5-l1',
          title: 'Le suivi de chantier augmente par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le suivi de chantier est une mission critique pour l\'architecte : il engage sa responsabilite et conditionne la qualite du projet realise. Mais entre les comptes rendus de reunion, les leves de reserves, le suivi du planning et la gestion des avenants, c\'est une tache extremement chronophage. L\'IA vous fait gagner un temps precieux ! \u{1F477}

L\'assistant Freenzy genere vos comptes rendus de chantier de maniere structuree. Pendant la visite, vous prenez des notes rapides (ou dictez) : "Lot peinture : retard 3 jours, sous-couche sejour pas faite. Lot elec : attente luminaires cuisine. Lot plomberie : OK, receveur douche pose." L\'IA transforme ces notes en un compte rendu professionnel avec la mise en forme standard.

Chaque compte rendu numerote les observations, les classe par lot, precise les responsabilites et les delais. L\'IA assure le suivi d\'une reunion a l\'autre : les observations non resolues sont automatiquement reportees avec la mention "Point deja signale le [date], relance n°[x]." Cette tracabilite est essentielle en cas de litige. \u{2705}

Le suivi du planning est aussi assiste. L\'IA compare l\'avancement reel constate en reunion avec le planning previsionnel. Elle identifie les retards, calcule leur impact sur la date de livraison et propose des solutions : "Le retard de 3 jours sur la peinture peut etre rattrape si le lot menuiseries interieures demarre en parallele — verifiez avec l\'entreprise."

Pour les operations de reception, l\'IA prepare la liste des reserves a partir de l\'historique des visites. Elle genere le PV de reception avec les reserves classees par lot et par gravite (bloquante, majeure, mineure). Elle calcule aussi la retenue de garantie et les penalites de retard applicables selon le marche signe.

La gestion documentaire est centralisee : plans, comptes rendus, courriers, photos de chantier — tout est indexe et retrouvable en un clic. \u{1F4C1}`,
          xpReward: 15,
        },
        {
          id: 'archi-m5-l2',
          title: 'Exercice : Compte rendu de chantier',
          duration: '3 min',
          type: 'exercise',
          content: 'Redigez un compte rendu de visite de chantier.',
          exercisePrompt: `Vous visitez un chantier de construction de maison individuelle (semaine 12/24). Voici vos notes brutes :

- Maconnerie terminee OK, mais fissure angle NE a surveiller
- Charpentier demarre lundi, bois livre vendredi dernier
- Electricien en retard de 5 jours, attend le passage de gaines dans la dalle (oubli)
- Plombier a modifie l'emplacement evacuation SDB sans validation — non conforme au plan
- Menuiseries exterieures livrees mais 2 fenetres aux mauvaises dimensions
- Client demande ajout d'une prise dans le garage (avenant)

Redigez le brief pour Freenzy afin de generer le CR de chantier :
1. Classez les observations par lot
2. Identifiez les actions correctives urgentes
3. Evaluez l'impact sur le planning global
4. Proposez la gestion de la demande d'avenant du client.`,
          xpReward: 20,
        },
        {
          id: 'archi-m5-l3',
          title: 'Quiz — Suivi chantier',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le suivi de chantier IA.',
          quizQuestions: [
            {
              question: 'Que fait l\'IA avec les observations non resolues entre deux reunions ?',
              options: [
                'Elle les supprime',
                'Elle les reporte avec mention de relance',
                'Elle envoie un huissier',
                'Elle les ignore',
              ],
              correctIndex: 1,
              explanation: 'Les observations non resolues sont automatiquement reportees avec la date initiale et le numero de relance.',
            },
            {
              question: 'Comment l\'IA classe-t-elle les reserves a la reception ?',
              options: [
                'Par ordre alphabetique',
                'Par lot et par gravite (bloquante, majeure, mineure)',
                'Par prix',
                'Par couleur',
              ],
              correctIndex: 1,
              explanation: 'Les reserves sont classees par lot technique et par niveau de gravite pour faciliter leur traitement.',
            },
            {
              question: 'Que calcule l\'IA a partir du planning ?',
              options: [
                'Le salaire des ouvriers',
                'L\'impact des retards sur la date de livraison',
                'Le cout du terrain',
                'Les honoraires du notaire',
              ],
              correctIndex: 1,
              explanation: 'L\'IA compare avancement reel et previsionnel pour evaluer l\'impact des retards sur la livraison.',
            },
            {
              question: 'Pourquoi la tracabilite des observations est-elle essentielle ?',
              options: [
                'Pour faire joli dans le dossier',
                'En cas de litige, elle prouve les alertes donnees',
                'Pour facturer plus d\'heures',
                'Pour le rapport annuel',
              ],
              correctIndex: 1,
              explanation: 'La tracabilite des observations horodatees est une preuve essentielle en cas de litige avec les entreprises.',
            },
            {
              question: 'Que genere l\'IA pour la reception du chantier ?',
              options: [
                'Un cheque',
                'Le PV de reception avec reserves, retenue de garantie et penalites',
                'Un permis de demolir',
                'Un contrat de maintenance',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere le PV de reception complet avec les reserves classees, la retenue de garantie et les penalites applicables.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F477}',
      badgeName: 'Chef Chantier',
    },
    // Module 6 — Appels d'offres
    {
      id: 'archi-m6',
      title: 'Repondre aux appels d\'offres',
      emoji: '\u{1F4E8}',
      description: 'Constituez des dossiers d\'appels d\'offres competitifs avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'archi-m6-l1',
          title: 'Gagner des marches avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Repondre a un appel d\'offres public ou prive est un investissement en temps considerable. La constitution du dossier, la note methodologique, les references, les CV de l\'equipe — tout doit etre irreprochable. L\'IA vous aide a produire des dossiers competitifs en un temps record. \u{1F4E8}

L\'assistant Freenzy commence par analyser le dossier de consultation (DCE). Il identifie les criteres de selection et leur ponderation : prix (40%), valeur technique (40%), delai (20%) par exemple. Il repere aussi les pieces administratives exigees et vous alerte sur les manquants : "Attestation d\'assurance decennale a joindre — verifiez la date de validite."

La note methodologique est souvent le document le plus decisif. L\'IA la structure selon les sous-criteres du reglement de consultation. Si le critere technique vaut 40% decompose en "comprehension du programme (15%)", "organisation de la mission (15%)" et "equipe dediee (10%)", elle organise votre reponse exactement dans cet ordre avec le bon niveau de detail pour chaque section. \u{2705}

L\'IA personnalise la note en fonction du contexte : elle integre les specificites du site, les contraintes mentionnees dans le programme et propose des reponses adaptees. Par exemple : "Le site etant en zone inondable, nous proposons un vide sanitaire de 80cm et des materiaux hydrofuges jusqu\'a 1m au-dessus du terrain naturel — detail non exige mais demontrant notre expertise."

Pour les references, l\'IA selectionne dans votre portfolio les projets les plus pertinents par rapport au marche. Pour un EHPAD, elle mettra en avant vos realisations en etablissements de sante plutot que vos maisons individuelles. Elle redige les fiches references avec les informations demandees : maitre d\'ouvrage, surface, montant, date, description.

L\'IA verifie enfin la completude du dossier avant envoi : toutes les pieces administratives, le respect du formalisme (paraphe, signature, nombre d\'exemplaires) et le respect de la date limite de depot. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'archi-m6-l2',
          title: 'Jeu : Etapes d\'un appel d\'offres',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes de reponse.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Analyser le DCE et les criteres de selection',
              'Verifier les pieces administratives a fournir',
              'Rediger la note methodologique structuree',
              'Selectionner les references pertinentes',
              'Constituer l\'equipe et les CV',
              'Verifier la completude et deposer avant la date limite',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'archi-m6-l3',
          title: 'Quiz — Appels d\'offres',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les appels d\'offres.',
          quizQuestions: [
            {
              question: 'Que fait l\'IA en premier avec le DCE ?',
              options: [
                'Elle redige directement la reponse',
                'Elle identifie les criteres de selection et leur ponderation',
                'Elle calcule le prix',
                'Elle contacte le maitre d\'ouvrage',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse d\'abord les criteres et leur poids pour structurer la reponse selon les attentes du jury.',
            },
            {
              question: 'Comment structurer la note methodologique ?',
              options: [
                'Par ordre chronologique du projet',
                'Selon les sous-criteres du reglement de consultation',
                'Par ordre alphabetique',
                'Librement, sans structure imposee',
              ],
              correctIndex: 1,
              explanation: 'La note doit suivre exactement les sous-criteres de notation pour faciliter l\'evaluation par le jury.',
            },
            {
              question: 'Comment l\'IA selectionne-t-elle les references ?',
              options: [
                'Les plus recentes uniquement',
                'Les plus grandes en surface',
                'Les plus pertinentes par rapport au marche',
                'Toutes les references disponibles',
              ],
              correctIndex: 2,
              explanation: 'L\'IA selectionne les references par pertinence : type de programme, echelle, contexte similaire au marche vise.',
            },
            {
              question: 'Que verifie l\'IA avant le depot du dossier ?',
              options: [
                'Le solde bancaire',
                'Completude, formalisme et respect de la date limite',
                'La meteo du jour',
                'Les tarifs des concurrents',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie que toutes les pieces sont presentes, le formalisme respecte et la date limite pas depassee.',
            },
            {
              question: 'Quel document est souvent le plus decisif dans un appel d\'offres ?',
              options: [
                'Le formulaire DC1',
                'L\'attestation d\'assurance',
                'La note methodologique',
                'Le Kbis',
              ],
              correctIndex: 2,
              explanation: 'La note methodologique est souvent le document le plus influence dans la notation technique de l\'offre.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E8}',
      badgeName: 'Marche Gagne',
    },
  ],
};

// =============================================================================
// 3. IA pour les Photographes
// =============================================================================

export const parcoursPhotographeIA: FormationParcours = {
  id: 'photographe-ia',
  title: 'IA pour les Photographes',
  emoji: '\u{1F4F7}',
  description: 'Boostez votre activite de photographe avec l\'IA : retouche intelligente, galeries client, tarification, marketing, booking et post-production automatisee.',
  category: 'metier',
  subcategory: 'creatif',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#EC4899',
  diplomaTitle: 'Photographe Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Photographes',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Retouche IA
    {
      id: 'photo-m1',
      title: 'Retouche photo assistee par IA',
      emoji: '\u{2728}',
      description: 'Accelerez votre workflow de retouche grace a l\'intelligence artificielle.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m1-l1',
          title: 'L\'IA au service de la retouche photo',
          duration: '4 min',
          type: 'text',
          content: `La retouche est l\'etape la plus chronophage du metier de photographe. Apres un mariage de 10 heures, vous vous retrouvez avec 3 000 photos a trier, selectionner et retoucher. Meme en ne gardant que 600 images, a 3 minutes par photo, c\'est 30 heures de post-production ! L\'IA va diviser ce temps par 5. \u{2728}

Le tri intelligent est la premiere revolution. L\'IA analyse chaque image selon des criteres techniques (nettete, exposition, bruit) et artistiques (composition, expression des visages, yeux ouverts/fermes). Elle attribue un score a chaque photo et pre-selectionne les meilleures. Vous n\'avez plus qu\'a valider ou ajuster cette selection, au lieu de parcourir 3 000 images une par une.

Pour la retouche elle-meme, l\'IA apprend votre style. Vous retouchez manuellement 20 photos representatives, et l\'IA cree un profil de retouche personnel : votre balance des blancs preferee, votre courbe de tons, votre niveau de contraste, votre traitement des hautes lumieres et des ombres. Elle applique ensuite ce profil a l\'ensemble du lot, avec des ajustements contextuels. \u{2705}

Les retouches de peau sont particulierement impressionnantes. L\'IA lisse les imperfections tout en preservant la texture naturelle — pas de "peau plastique." Elle corrige les rougeurs, attenue les cernes et unifie le teint, le tout de maniere subtile et professionnelle. Vous gardez le controle : un curseur permet d\'ajuster l\'intensite de chaque correction.

La correction d\'exposition selective est un autre gain majeur. L\'IA detecte les zones sous-exposees ou sur-exposees et les corrige localement : deboucher les ombres sous les arbres, recuperer un ciel brule, equilibrer un contre-jour. Ces corrections qui prenaient 5 minutes par photo se font automatiquement en lot.

L\'IA gere aussi le recadrage intelligent, en appliquant la regle des tiers et en detectant le point focal principal de chaque image. Resultat : un lot homogene et professionnel, pret en quelques heures au lieu de plusieurs jours. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'photo-m1-l2',
          title: 'Exercice : Workflow retouche mariage',
          duration: '3 min',
          type: 'exercise',
          content: 'Definissez votre workflow de retouche assiste par IA.',
          exercisePrompt: `Vous revenez d\'un mariage avec 2 800 photos. Le client attend sa galerie sous 3 semaines et veut 500 photos retouchees.

Redigez votre brief pour l\'assistant Freenzy :
1. Definissez les criteres de tri automatique (technique + artistique)
2. Decrivez votre style de retouche en 5 points cles (tons, couleurs, contraste, peau, ambiance)
3. Listez les etapes de votre workflow IA du tri a la livraison
4. Identifiez les photos qui necessitent une retouche manuelle (lesquelles et pourquoi)
5. Estimez le temps gagne par rapport a votre workflow actuel sans IA.`,
          xpReward: 20,
        },
        {
          id: 'photo-m1-l3',
          title: 'Quiz — Retouche IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la retouche assistee.',
          quizQuestions: [
            {
              question: 'Par combien l\'IA divise-t-elle le temps de post-production ?',
              options: ['Par 2', 'Par 3', 'Par 5', 'Par 10'],
              correctIndex: 2,
              explanation: 'L\'IA reduit le temps de post-production d\'un facteur 5 grace au tri, a la retouche en lot et aux corrections automatiques.',
            },
            {
              question: 'Comment l\'IA apprend-elle votre style de retouche ?',
              options: [
                'Elle copie un influenceur',
                'Vous retouchez 20 photos et elle cree un profil',
                'Elle utilise un style par defaut',
                'Elle demande votre couleur preferee',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse vos retouches manuelles sur un echantillon representatif pour creer un profil de retouche personnel.',
            },
            {
              question: 'Que preserve l\'IA lors du lissage de peau ?',
              options: [
                'Rien, elle lisse tout',
                'La texture naturelle de la peau',
                'Uniquement les rides',
                'Les tatouages',
              ],
              correctIndex: 1,
              explanation: 'L\'IA lisse les imperfections tout en preservant la texture naturelle pour eviter l\'effet "peau plastique."',
            },
            {
              question: 'Quel critere l\'IA utilise-t-elle pour le tri des photos ?',
              options: [
                'La taille du fichier',
                'L\'heure de prise de vue',
                'Nettete, exposition, composition et expressions',
                'Le format RAW ou JPEG',
              ],
              correctIndex: 2,
              explanation: 'L\'IA combine criteres techniques (nettete, exposition) et artistiques (composition, expressions) pour scorer chaque image.',
            },
            {
              question: 'Quelle regle l\'IA applique-t-elle pour le recadrage ?',
              options: [
                'Le nombre d\'or uniquement',
                'La regle des tiers avec detection du point focal',
                'Toujours au centre',
                'Un format carre systematique',
              ],
              correctIndex: 1,
              explanation: 'L\'IA applique la regle des tiers en detectant le point focal principal pour un recadrage harmonieux.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2728}',
      badgeName: 'Retouche Express',
    },
    // Module 2 — Galeries client
    {
      id: 'photo-m2',
      title: 'Galeries client professionnelles',
      emoji: '\u{1F5BC}\u{FE0F}',
      description: 'Creez des galeries en ligne elegantes pour vos clients.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m2-l1',
          title: 'Des galeries qui impressionnent',
          duration: '4 min',
          type: 'text',
          content: `La galerie en ligne est votre vitrine professionnelle et l\'outil de livraison pour vos clients. Une galerie bien presentee fait toute la difference : elle met en valeur votre travail, facilite la selection des tirages et encourage les ventes additionnelles. L\'IA vous aide a creer des galeries qui impressionnent ! \u{1F5BC}\u{FE0F}

L\'assistant Freenzy organise automatiquement vos photos en categories logiques. Pour un mariage, il detecte les moments cles : preparatifs, ceremonie, cocktail, soiree, couple, groupe. Il cree des sections avec des titres elegants et ordonne les photos chronologiquement au sein de chaque section. Le client navigue intuitivement dans sa journee.

La selection de la photo de couverture est automatisee. L\'IA identifie les 3-5 meilleures images du lot (scores techniques et artistiques les plus eleves) et vous les propose comme hero images. Elle suggere aussi un agencement visuel : mosaique pour les preparatifs, pleine page pour les photos de couple, carrousel pour les moments de groupe. \u{2705}

L\'IA redige les descriptions de chaque section avec un ton adapte a l\'evenement : "Les preparatifs — Ces instants d\'emotion et de complicite avant le grand moment. Regards dans le miroir, ajustements de derniere minute et premiers sourires du jour." Ce texte narratif enrichit l\'experience du client et donne du contexte a chaque serie.

Le systeme de favoris et de selection est simplifie. Le client marque ses photos preferees d\'un coeur, et l\'IA genere automatiquement un recapitulatif : "Marie et Thomas ont selectionne 45 photos dont 12 pour tirage. Suggestions d\'upsell : album 30x30 (38 photos), toile 60x40 (photo de couple ref. IMG_2847)."

La galerie est responsive, protegee par mot de passe, et integre un systeme de partage pour que les invites puissent acceder aux photos. L\'IA genere le lien de partage et le texte d\'accompagnement que vous envoyez aux maries. \u{1F48D}`,
          xpReward: 15,
        },
        {
          id: 'photo-m2-l2',
          title: 'Jeu : Organisation de galerie mariage',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les sections d\'une galerie mariage.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Preparatifs de la mariee',
              'Preparatifs du marie',
              'Ceremonie (entree, echange de voeux, sortie)',
              'Seance couple',
              'Photos de groupe',
              'Cocktail, soiree et fete',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'photo-m2-l3',
          title: 'Quiz — Galeries client',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur les galeries IA.',
          quizQuestions: [
            {
              question: 'Comment l\'IA organise-t-elle les photos d\'un mariage ?',
              options: [
                'Par nom de fichier',
                'Par moments cles detectes automatiquement',
                'De maniere aleatoire',
                'Par taille de fichier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les moments cles (preparatifs, ceremonie, couple, soiree) et organise les photos par categorie.',
            },
            {
              question: 'Que suggere l\'IA apres la selection du client ?',
              options: [
                'De tout supprimer',
                'Des produits d\'upsell adaptes (album, toile)',
                'De recommencer la seance',
                'Un autre photographe',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les photos selectionnees et suggere des produits adaptes : album, toile, tirages grand format.',
            },
            {
              question: 'Quel systeme de protection la galerie utilise-t-elle ?',
              options: [
                'Aucune protection',
                'Reconnaissance faciale',
                'Mot de passe',
                'Empreinte digitale',
              ],
              correctIndex: 2,
              explanation: 'La galerie est protegee par mot de passe pour garantir la confidentialite des photos du client.',
            },
            {
              question: 'Pourquoi ajouter des descriptions aux sections ?',
              options: [
                'Pour le referencement Google',
                'Pour enrichir l\'experience et donner du contexte',
                'C\'est obligatoire legalement',
                'Pour remplir la page',
              ],
              correctIndex: 1,
              explanation: 'Les descriptions narratives enrichissent l\'experience du client et donnent du contexte emotionnel a chaque serie.',
            },
            {
              question: 'Combien de hero images l\'IA propose-t-elle ?',
              options: ['1', '3 a 5', '10', '20'],
              correctIndex: 1,
              explanation: 'L\'IA identifie les 3 a 5 meilleures images du lot pour servir de photos de couverture.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F5BC}\u{FE0F}',
      badgeName: 'Galerie Pro',
    },
    // Module 3 — Tarification
    {
      id: 'photo-m3',
      title: 'Tarification et devis intelligents',
      emoji: '\u{1F4B5}',
      description: 'Definissez vos tarifs et generez des devis professionnels.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m3-l1',
          title: 'Fixer ses tarifs avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Fixer ses tarifs est l\'un des plus grands defis du photographe independant. Trop bas, vous ne couvrez pas vos charges et vous devaluez la profession. Trop haut, vous perdez des clients. L\'IA vous aide a trouver le juste prix et a presenter vos tarifs de maniere convaincante. \u{1F4B5}

L\'assistant Freenzy commence par calculer votre cout de revient horaire reel. Vous renseignez vos charges fixes (loyer studio, assurances, materiel amorti, logiciels, site web, comptable) et vos charges variables (deplacement, consommables, sous-traitance tirage). L\'IA divise par le nombre d\'heures facturables et ajoute votre marge souhaitee. Resultat : "Votre cout horaire reel est de 85 euros. Avec une marge de 30%, votre tarif horaire minimum est de 110 euros."

Pour chaque type de prestation, l\'IA genere une grille tarifaire structuree. Mariage : forfait decouverte (4h, 1 200 euros), forfait classique (8h, 2 200 euros), forfait premium (12h + album, 3 500 euros). Portrait corporate : seance 1h (350 euros), pack equipe 5 personnes (1 200 euros). Chaque forfait est detaille avec les livrables inclus. \u{2705}

L\'IA aide aussi a presenter vos tarifs de maniere psychologique. Elle utilise les techniques d\'ancrage : le forfait premium est presente en premier pour que le classique paraisse raisonnable. Les options sont formulees positivement : "Inclus : retouche professionnelle de 300 photos" plutot que "Non inclus au-dela de 300 photos."

Les devis generes par l\'IA sont professionnels et complets : description detaillee de la prestation, livrables, calendrier de livraison, conditions de paiement (acompte, solde), droits d\'utilisation des images (cedés ou non, usage precis), et conditions d\'annulation. Les mentions legales obligatoires sont incluses automatiquement.

L\'IA propose aussi des upsells intelligents a integrer dans le devis : "Ajouter un album 30x30 : +450 euros (au lieu de 550 si commande separee)." Ces offres groupees augmentent votre panier moyen tout en offrant un avantage au client. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'photo-m3-l2',
          title: 'Exercice : Creer ma grille tarifaire',
          duration: '3 min',
          type: 'exercise',
          content: 'Calculez vos tarifs et generez votre grille.',
          exercisePrompt: `Vous etes photographe specialise en portrait et mariage. Voici vos charges annuelles :
- Loyer studio : 800 euros/mois
- Materiel (amortissement) : 400 euros/mois
- Logiciels (Lightroom, site) : 100 euros/mois
- Assurance pro : 150 euros/mois
- Comptable : 200 euros/mois
- Divers (formation, deplacement) : 350 euros/mois
- Vous travaillez 220 jours/an, dont 150 jours facturables (6h facturables/jour)

Redigez le brief pour l\'assistant Freenzy :
1. Calculez votre cout horaire reel
2. Definissez votre marge souhaitee et votre tarif horaire
3. Creez 3 forfaits mariage (decouverte, classique, premium) avec details
4. Proposez 2 upsells pertinents
5. Redigez les clauses essentielles du devis (droits image, annulation).`,
          xpReward: 20,
        },
        {
          id: 'photo-m3-l3',
          title: 'Quiz — Tarification photo',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances en tarification.',
          quizQuestions: [
            {
              question: 'Que calcule l\'IA en premier pour fixer vos tarifs ?',
              options: [
                'Le prix des concurrents',
                'Votre cout de revient horaire reel',
                'Le budget du client',
                'Le prix du materiel',
              ],
              correctIndex: 1,
              explanation: 'L\'IA calcule d\'abord votre cout horaire reel (charges / heures facturables) pour definir un tarif plancher rentable.',
            },
            {
              question: 'Quelle technique psychologique l\'IA utilise-t-elle ?',
              options: [
                'La peur de manquer',
                'L\'ancrage (premium presente en premier)',
                'La culpabilisation',
                'La reduction immediate',
              ],
              correctIndex: 1,
              explanation: 'L\'ancrage consiste a presenter le forfait premium en premier pour que les options suivantes paraissent plus abordables.',
            },
            {
              question: 'Que doivent preciser les devis concernant les photos ?',
              options: [
                'Le nombre de likes esperes',
                'Les droits d\'utilisation des images (cedes ou non)',
                'La marque de l\'appareil',
                'Le poids des fichiers',
              ],
              correctIndex: 1,
              explanation: 'Les droits d\'utilisation (cession, usage precis, duree) sont essentiels et doivent figurer dans chaque devis.',
            },
            {
              question: 'Pourquoi proposer des upsells dans le devis ?',
              options: [
                'Pour forcer la vente',
                'Pour augmenter le panier moyen en offrant un avantage',
                'Pour compliquer le devis',
                'C\'est obligatoire legalement',
              ],
              correctIndex: 1,
              explanation: 'Les upsells offrent un avantage prix au client (remise groupee) tout en augmentant votre chiffre d\'affaires.',
            },
            {
              question: 'Quelle clause est essentielle dans un devis photo ?',
              options: [
                'La couleur du fond',
                'Les conditions d\'annulation et acompte',
                'Le menu du repas',
                'La meteo prevue',
              ],
              correctIndex: 1,
              explanation: 'Les conditions d\'annulation et le calendrier de paiement (acompte/solde) protegent le photographe et le client.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B5}',
      badgeName: 'Tarif Expert',
    },
    // Module 4 — Marketing photographe
    {
      id: 'photo-m4',
      title: 'Marketing et acquisition clients',
      emoji: '\u{1F4E3}',
      description: 'Developpez votre visibilite et attirez de nouveaux clients.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m4-l1',
          title: 'Se faire connaitre en tant que photographe',
          duration: '4 min',
          type: 'text',
          content: `Le bouche-a-oreille ne suffit plus pour remplir son agenda de photographe. Il faut une strategie marketing active, et l\'IA est votre meilleure alliee pour la deployer sans y passer des heures chaque semaine. \u{1F4E3}

Instagram est votre vitrine principale. L\'assistant Freenzy genere un calendrier de publication optimise : 4 a 5 posts par semaine, alternes entre photos recentes, coulisses, temoignages clients et conseils. Pour chaque post, l\'IA redige la legende avec un storytelling engageant et les hashtags pertinents. Elle analyse aussi les meilleures heures de publication en fonction de votre audience.

Le SEO local est crucial pour les photographes. L\'IA optimise votre fiche Google My Business avec les bons mots-cles : "photographe mariage Paris", "photographe corporate Ile-de-France", "seance photo nouveau-ne Boulogne." Elle redige aussi des articles de blog cibles : "Les 10 plus beaux lieux de mariage en Ile-de-France" — un contenu qui attire les futurs maries en recherche. \u{2705}

Le portfolio en ligne est votre meilleur outil de conversion. L\'IA vous aide a le structurer par categorie (mariage, portrait, corporate, evenementiel) et a rediger les textes de chaque section. Elle suggere quelles photos mettre en avant selon les tendances de recherche : si les mariages bohemes sont populaires, elle recommande de les placer en haut de page.

L\'email marketing est sous-utilise par les photographes. L\'IA cree des sequences automatisees : email de bienvenue apres inscription, email de suivi 3 mois apres une prestation ("Comment se portent vos photos ?"), email saisonnier ("Les seances de Noel approchent, reservez maintenant"). Chaque email est personnalise avec le prenom du contact.

Les partenariats sont aussi facilites. L\'IA identifie les prestataires complementaires dans votre zone (wedding planners, fleuristes, traiteurs, DJ) et redige des propositions de partenariat : echange de visibilite, recommandation mutuelle, shooting commun. \u{1F91D}`,
          xpReward: 15,
        },
        {
          id: 'photo-m4-l2',
          title: 'Jeu : Strategie marketing photographe',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque canal a son objectif principal.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Instagram', right: 'Vitrine visuelle et engagement' },
              { left: 'Google My Business', right: 'Visibilite locale et avis' },
              { left: 'Blog SEO', right: 'Trafic organique long terme' },
              { left: 'Email marketing', right: 'Fidelisation et reactivation' },
              { left: 'Partenariats', right: 'Recommandation et reseau' },
              { left: 'Portfolio', right: 'Conversion visiteur en client' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'photo-m4-l3',
          title: 'Quiz — Marketing photo',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en marketing photographe.',
          quizQuestions: [
            {
              question: 'Combien de posts Instagram par semaine l\'IA recommande-t-elle ?',
              options: ['1 a 2', '4 a 5', '7 (un par jour)', '14 (deux par jour)'],
              correctIndex: 1,
              explanation: 'L\'IA recommande 4 a 5 posts par semaine pour maintenir une presence reguliere sans saturer l\'audience.',
            },
            {
              question: 'Quel type de contenu blog attire les futurs maries ?',
              options: [
                'Les fiches techniques materiel',
                'Les guides de lieux de mariage dans la region',
                'Les tarifs detailles',
                'Les comparatifs objectifs',
              ],
              correctIndex: 1,
              explanation: 'Les guides de lieux de mariage attirent les couples en recherche active, un trafic qualifie et convertissant.',
            },
            {
              question: 'Quand envoyer un email de suivi post-prestation ?',
              options: ['Le lendemain', '1 semaine apres', '3 mois apres', '1 an apres'],
              correctIndex: 2,
              explanation: 'Un email a 3 mois ravive le souvenir positif et peut generer du bouche-a-oreille ou une nouvelle commande.',
            },
            {
              question: 'Comment l\'IA optimise-t-elle Google My Business ?',
              options: [
                'Avec des faux avis',
                'Avec les bons mots-cles locaux et une description optimisee',
                'En payant Google',
                'En supprimant les concurrents',
              ],
              correctIndex: 1,
              explanation: 'L\'IA utilise les mots-cles pertinents (type de photo + localite) et redige une description optimisee pour le SEO local.',
            },
            {
              question: 'Quel partenaire est le plus pertinent pour un photographe mariage ?',
              options: [
                'Un garagiste',
                'Un wedding planner ou fleuriste',
                'Un agent immobilier',
                'Un dentiste',
              ],
              correctIndex: 1,
              explanation: 'Les wedding planners et fleuristes partagent la meme clientele et sont les partenaires les plus pertinents.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E3}',
      badgeName: 'Marketing Photo',
    },
    // Module 5 — Booking et gestion clients
    {
      id: 'photo-m5',
      title: 'Booking et gestion clients',
      emoji: '\u{1F4C6}',
      description: 'Automatisez vos reservations et votre relation client.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m5-l1',
          title: 'Automatiser ses reservations',
          duration: '4 min',
          type: 'text',
          content: `Gerer les demandes de reservation, les echanges par email, les relances et les contrats prend un temps fou. L\'IA automatise tout ce processus pour que vous puissiez vous concentrer sur la creation. \u{1F4C6}

L\'assistant Freenzy gere votre formulaire de contact intelligent. Quand un prospect vous contacte, l\'IA analyse sa demande et repond avec un message personnalise en moins de 5 minutes (meme a 23h). Elle pose les questions qualifiantes : date de l\'evenement, lieu, nombre de convives, budget envisage, style souhaite. Ces informations sont centralisees dans une fiche client.

Le systeme de reservation en ligne est fluide. Le client voit vos disponibilites en temps reel, choisit sa date, selectionne un forfait et peut reserver directement. L\'IA envoie automatiquement : confirmation de reservation, contrat a signer electroniquement, lien de paiement pour l\'acompte. Plus besoin d\'envoyer 10 emails pour boucler une reservation ! \u{2705}

Le CRM photographe est concu pour votre metier. Chaque fiche client contient : les echanges (emails, messages), la prestation reservee, les paiements (acompte verse/solde du), la date et le lieu de l\'evenement, le brief creatif (style, references, moments importants), et le statut de livraison des photos. L\'IA vous alerte sur les actions a mener : "Contrat non signe — relance J+3", "Solde du avant le 15/04."

Les rappels automatiques sont precieux. J-7 : "Votre seance approche ! Quelques conseils : vetements unis, evitez les motifs..." J-1 : "Rdv demain a 14h, parc de Sceaux, entree principale. Meteo : ensoleille." J+1 : "Merci pour cette belle seance ! Votre galerie sera prete sous 2 semaines."

Le systeme de temoignages est aussi automatise. J+30 apres livraison, l\'IA envoie un email demandant un avis Google avec un lien direct. Si le client repond positivement, elle propose de partager son temoignage sur votre site. \u{2B50}`,
          xpReward: 15,
        },
        {
          id: 'photo-m5-l2',
          title: 'Exercice : Parcours client automatise',
          duration: '3 min',
          type: 'exercise',
          content: 'Configurez votre parcours client avec l\'IA.',
          exercisePrompt: `Vous voulez automatiser le parcours client de votre activite photo mariage. Actuellement tout est manuel (emails, contrats papier, acomptes par virement).

Redigez le brief pour l\'assistant Freenzy :
1. Definissez les 6 etapes du parcours client (du premier contact a la livraison)
2. Pour chaque etape, precisez l'email automatique a envoyer (objet + resume du contenu)
3. Listez les informations a collecter dans le formulaire de contact
4. Decrivez votre politique de paiement (acompte, solde, echéances)
5. Redigez le SMS de rappel J-1 pour une seance portrait en exterieur.`,
          xpReward: 20,
        },
        {
          id: 'photo-m5-l3',
          title: 'Quiz — Booking photo',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances en gestion de booking.',
          quizQuestions: [
            {
              question: 'En combien de temps l\'IA repond-elle a un prospect ?',
              options: ['24 heures', '12 heures', 'Moins de 5 minutes', '1 semaine'],
              correctIndex: 2,
              explanation: 'L\'IA repond en moins de 5 minutes avec un message personnalise, meme en dehors des heures de bureau.',
            },
            {
              question: 'Que contient la fiche CRM d\'un client photographe ?',
              options: [
                'Juste le nom et le telephone',
                'Echanges, prestation, paiements, brief creatif et statut livraison',
                'Uniquement les photos',
                'Le contrat seulement',
              ],
              correctIndex: 1,
              explanation: 'La fiche CRM centralise tous les echanges, la prestation, les paiements, le brief creatif et le suivi de livraison.',
            },
            {
              question: 'Quand l\'IA envoie-t-elle la demande d\'avis Google ?',
              options: ['Juste apres la seance', 'A la livraison', '30 jours apres la livraison', '1 an apres'],
              correctIndex: 2,
              explanation: 'J+30 apres livraison laisse le temps au client de profiter des photos et d\'etre dans un etat d\'esprit positif.',
            },
            {
              question: 'Quel avantage offre la signature electronique du contrat ?',
              options: [
                'C\'est moins cher',
                'Le client signe a distance et le contrat est stocke automatiquement',
                'C\'est plus joli',
                'Aucun avantage',
              ],
              correctIndex: 1,
              explanation: 'La signature electronique permet de signer a distance et stocke le contrat automatiquement dans le CRM.',
            },
            {
              question: 'Que contient le rappel J-7 envoye au client ?',
              options: [
                'La facture finale',
                'Des conseils pratiques pour la seance',
                'Une demande d\'annulation',
                'Les tarifs des options',
              ],
              correctIndex: 1,
              explanation: 'Le rappel J-7 inclut des conseils pratiques (vetements, preparation) pour que la seance se deroule au mieux.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4C6}',
      badgeName: 'Booking Master',
    },
    // Module 6 — Post-production et livraison
    {
      id: 'photo-m6',
      title: 'Post-production et livraison optimisees',
      emoji: '\u{1F4E6}',
      description: 'Optimisez votre chaine de post-production et de livraison.',
      duration: '8 min',
      lessons: [
        {
          id: 'photo-m6-l1',
          title: 'Une post-production fluide de A a Z',
          duration: '4 min',
          type: 'text',
          content: `La post-production ne se limite pas a la retouche. C\'est tout le processus qui va du dechargement des cartes memoire a la livraison finale au client. L\'IA optimise chaque etape de cette chaine pour eliminer les goulots d\'etranglement et accelerer vos livraisons. \u{1F4E6}

L\'import et le classement sont la premiere etape. L\'IA renomme automatiquement les fichiers selon votre convention (date_client_numero), cree l\'arborescence de dossiers (RAW, Selection, Retouches, Export, Livraison) et genere une sauvegarde immediate sur votre disque secondaire. Plus de risque de perte de fichiers et un classement impeccable des l\'import.

Le culling (tri-selection) assiste par IA est un gain de temps enorme. Sur 2 500 photos d\'un mariage, l\'IA pre-selectionne 600-700 images selon vos criteres. Elle identifie et elimine automatiquement les doublons (rafale), les photos floues, les yeux fermes, les photos mal exposees au-dela du rattrapable. Vous validez cette selection en 30 minutes au lieu de 3 heures. \u{2705}

L\'export multi-format est automatise. L\'IA genere simultanement : les fichiers haute resolution pour le tirage (TIFF 300dpi), les fichiers web pour la galerie en ligne (JPEG 2048px, 72dpi), les miniatures pour l\'apercu (800px), et les fichiers pour les reseaux sociaux (format carre 1080px + format story 1080x1920px). Un seul clic pour 4 formats !

La livraison est aussi optimisee. L\'IA uploade les photos sur votre galerie en ligne, genere le lien de telechargement, prepare l\'email de livraison avec un texte chaleureux et personnalise, et vous rappelle de poster un teaser sur Instagram ("3 photos publiables du mariage de Marie & Thomas, avec leur accord").

Pour les commandes de tirage, l\'IA verifie la resolution et le ratio de chaque photo selectionnee par le client. Si une photo est trop petite pour un tirage 60x40, elle alerte : "Resolution insuffisante pour ce format — suggerer 40x30 ou proposer un recadrage." \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'photo-m6-l2',
          title: 'Jeu : Etapes de post-production',
          duration: '3 min',
          type: 'game',
          content: 'Ordonnez les etapes de la post-production.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Import, renommage et sauvegarde',
              'Tri-selection (culling) assiste par IA',
              'Retouche en lot avec profil personnalise',
              'Export multi-format automatise',
              'Upload galerie et generation du lien',
              'Livraison et email personnalise au client',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'photo-m6-l3',
          title: 'Quiz — Post-production',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en post-production IA.',
          quizQuestions: [
            {
              question: 'Combien de formats d\'export l\'IA genere-t-elle simultanement ?',
              options: ['1', '2', '4', '8'],
              correctIndex: 2,
              explanation: 'L\'IA genere 4 formats : haute resolution tirage, web galerie, miniatures apercu et reseaux sociaux.',
            },
            {
              question: 'Que verifie l\'IA avant un tirage grand format ?',
              options: [
                'Le prix du papier',
                'La resolution et le ratio de la photo',
                'La disponibilite du labo',
                'La couleur du cadre',
              ],
              correctIndex: 1,
              explanation: 'L\'IA verifie que la resolution est suffisante pour le format de tirage demande et alerte si ce n\'est pas le cas.',
            },
            {
              question: 'Combien de temps gagne-t-on sur le culling avec l\'IA ?',
              options: ['15 minutes', '1 heure', '2h30', '5 heures'],
              correctIndex: 2,
              explanation: 'Le tri passe de 3 heures manuelles a 30 minutes de validation, soit un gain de 2h30.',
            },
            {
              question: 'Que fait l\'IA immediatement apres l\'import des photos ?',
              options: [
                'Elle les retouche',
                'Elle renomme, classe et sauvegarde sur un disque secondaire',
                'Elle les publie sur Instagram',
                'Elle les envoie au client',
              ],
              correctIndex: 1,
              explanation: 'L\'IA renomme selon votre convention, cree l\'arborescence et lance une sauvegarde immediate pour securiser les fichiers.',
            },
            {
              question: 'Que prepare l\'IA pour Instagram apres la livraison ?',
              options: [
                'Une publicite payante',
                'Un teaser avec des photos publiables (accord client obtenu)',
                'Un repost des photos du client',
                'Rien, Instagram n\'est pas utile',
              ],
              correctIndex: 1,
              explanation: 'L\'IA prepare un teaser avec quelques photos choisies, apres avoir verifie l\'accord du client pour la publication.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Livraison Pro',
    },
  ],
};

// =============================================================================
// 4. IA pour les Graphistes
// =============================================================================

export const parcoursGraphisteIA: FormationParcours = {
  id: 'graphiste-ia',
  title: 'IA pour les Graphistes',
  emoji: '\u{1F3A8}',
  description: 'Optimisez votre metier de graphiste avec l\'IA : briefs creatifs, propositions, revisions client, portfolio, facturation et veille tendances design.',
  category: 'metier',
  subcategory: 'creatif',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F59E0B',
  diplomaTitle: 'Graphiste Digital',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Graphistes',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Briefs creatifs
    {
      id: 'graph-m1',
      title: 'Analyser et structurer les briefs creatifs',
      emoji: '\u{1F4DD}',
      description: 'Transformez les demandes vagues des clients en briefs creatifs actionables.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m1-l1',
          title: 'Du brief flou au brief structure',
          duration: '4 min',
          type: 'text',
          content: `"Je veux un logo moderne, dynamique, qui fasse pro." Combien de fois avez-vous recu ce type de brief vague ? Le defi du graphiste est de transformer ces demandes floues en un cahier des charges creatif precis. L\'IA vous aide a poser les bonnes questions et a structurer le brief pour eviter les allers-retours interminables. \u{1F4DD}

L\'assistant Freenzy genere un questionnaire de brief adapte au type de projet. Pour un logo, il pose les questions essentielles : secteur d\'activite, valeurs de la marque (3 mots-cles), cible principale, logos apprecies (references visuelles), logos a eviter, couleurs imposees ou exclues, supports d\'utilisation (web, print, signalétique), et budget/delai. Chaque reponse est enregistree et structuree.

L\'IA analyse ensuite les reponses pour identifier les incoherences. Par exemple, si le client veut "un logo minimaliste mais avec beaucoup d\'elements", elle pointe la contradiction et propose des alternatives : "Un logo minimaliste avec un element graphique fort, ou un logo plus elabore avec une version simplifiee pour les petits formats." \u{2705}

Le brief structure genere par l\'IA contient : le contexte (qui est le client, son marche, ses concurrents), les objectifs du projet (repositionnement, lancement, rafraichissement), le territoire creatif (style, ambiance, references), les contraintes techniques (formats, charte existante, supports), le planning (jalons de validation) et le budget detaille.

L\'IA cree aussi un moodboard automatique a partir des mots-cles du brief. Elle selectionne des references visuelles coherentes — typographies, palettes, styles graphiques — que vous presentez au client pour valider la direction creative avant de commencer. Ce moodboard reduit drastiquement le risque de hors-sujet a la premiere presentation.

Enfin, l\'IA genere un document de validation du brief que le client signe. Ce document contractualise le perimetre du projet et les criteres de validation, limitant les demandes de modifications hors scope. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'graph-m1-l2',
          title: 'Exercice : Structurer un brief logo',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez une demande client en brief creatif.',
          exercisePrompt: `Un client vous envoie ce message :
"Salut, je monte une marque de cosmetiques bio pour homme, cible 25-40 ans urbains. J'ai besoin d'un logo + charte graphique. Je veux un truc classe mais pas trop classique, moderne quoi. Budget 2000-3000 euros, j'en ai besoin pour dans 3 semaines."

Redigez le brief pour l\'assistant Freenzy :
1. Listez les 8 questions complementaires a poser au client
2. Identifiez les contradictions potentielles dans la demande
3. Proposez 3 directions creatives possibles (avec mots-cles visuels)
4. Structurez le planning de 3 semaines (jalons de validation)
5. Decomposez le budget par livrable (logo, charte, declinaisons).`,
          xpReward: 20,
        },
        {
          id: 'graph-m1-l3',
          title: 'Quiz — Briefs creatifs',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les briefs creatifs IA.',
          quizQuestions: [
            {
              question: 'Pourquoi faire valider un moodboard avant de creer ?',
              options: [
                'Pour retarder le projet',
                'Pour reduire le risque de hors-sujet a la presentation',
                'Pour facturer une etape supplementaire',
                'C\'est obligatoire legalement',
              ],
              correctIndex: 1,
              explanation: 'Le moodboard valide la direction creative en amont, evitant les propositions hors-sujet et les allers-retours couteux.',
            },
            {
              question: 'Que detecte l\'IA dans les reponses du client ?',
              options: [
                'Les fautes d\'orthographe',
                'Les incoherences entre les attentes',
                'Le niveau de budget',
                'La nationalite du client',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les contradictions (ex: minimaliste mais charge) et propose des alternatives coherentes.',
            },
            {
              question: 'A quoi sert le document de validation du brief ?',
              options: [
                'A impressionner le client',
                'A contractualiser le perimetre et limiter les hors-scope',
                'A obtenir un acompte',
                'A choisir les couleurs',
              ],
              correctIndex: 1,
              explanation: 'Le document signe contractualise le perimetre du projet et les criteres, limitant les demandes hors scope.',
            },
            {
              question: 'Quelles informations le brief doit-il contenir ?',
              options: [
                'Juste le type de logo souhaite',
                'Contexte, objectifs, territoire creatif, contraintes, planning, budget',
                'Uniquement les couleurs',
                'Le CV du graphiste',
              ],
              correctIndex: 1,
              explanation: 'Un brief complet couvre contexte, objectifs, territoire creatif, contraintes techniques, planning et budget.',
            },
            {
              question: 'Pourquoi demander les logos que le client n\'aime PAS ?',
              options: [
                'Par curiosite',
                'Pour eviter des directions creatives qui seront refusees',
                'Pour les copier',
                'C\'est inutile',
              ],
              correctIndex: 1,
              explanation: 'Connaitre les contre-exemples evite de proposer des directions qui seront systematiquement refusees.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Brief Master',
    },
    // Module 2 — Propositions creatives
    {
      id: 'graph-m2',
      title: 'Propositions et presentations creatives',
      emoji: '\u{1F4A1}',
      description: 'Presentez vos creations de maniere convaincante et professionnelle.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m2-l1',
          title: 'Presenter ses creations avec impact',
          duration: '4 min',
          type: 'text',
          content: `Un bon design mal presente est un design refuse. La presentation de vos propositions creatives est aussi importante que les creations elles-memes. L\'IA vous aide a construire des presentations qui vendent vos idees et facilitent la validation par le client. \u{1F4A1}

L\'assistant Freenzy structure votre presentation selon un schema narratif eprouve. On commence par le rappel du brief (prouver que vous avez ecoute), puis la demarche creative (votre reflexion), les propositions (2 a 3 maximum), les declinaisons (mise en situation) et les prochaines etapes. Ce storytelling guide le client dans un parcours logique vers la decision.

Pour chaque proposition, l\'IA redige une argumentation de design : "La proposition A utilise une typographie geometrique sans serif qui evoque la modernite et la precision. Le vert sauge (#87AE73) a ete choisi pour sa connotation naturelle et premium, en coherence avec le positionnement bio haut de gamme." Cette justification valorise votre travail et montre que chaque choix est reflechi. \u{2705}

Les mises en situation (mockups) sont essentielles. L\'IA vous rappelle les supports pertinents selon le projet et redige les legendes : "Le logo sur carte de visite format 85x55mm — la lisibilite est assuree meme a petite taille grace a l\'epaisseur de trait optimisee." Ces mises en contexte aident le client a se projeter.

L\'IA prepare aussi les variantes de facon strategique. Plutot que 5 propositions qui diluent l\'attention, elle recommande 2 a 3 pistes avec une recommandation claire : "Notre recommandation : la proposition B, qui offre le meilleur equilibre entre modernite et lisibilite, tout en se differenciant fortement des concurrents identifies."

Pour la reunion de presentation, l\'IA genere un script de presentation avec les points cles a aborder, les reponses aux objections probables et les questions a poser au client pour affiner. Elle prepare aussi le compte rendu avec les retours et les actions a mener. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'graph-m2-l2',
          title: 'Jeu : Structure d\'une presentation design',
          duration: '3 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les elements d\'une presentation creative.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Rappel du brief et des objectifs',
              'Presentation de la demarche creative',
              'Proposition A avec argumentation design',
              'Proposition B avec argumentation design',
              'Mises en situation (mockups) sur les supports',
              'Recommandation et prochaines etapes',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'graph-m2-l3',
          title: 'Quiz — Presentations creatives',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos competences en presentation.',
          quizQuestions: [
            {
              question: 'Combien de propositions presenter idealement ?',
              options: ['1 seule', '2 a 3', '5 a 6', '10 variantes'],
              correctIndex: 1,
              explanation: 'Presenter 2 a 3 propositions donne du choix sans diluer l\'attention ni devaloriser votre travail.',
            },
            {
              question: 'Pourquoi argumenter chaque choix de design ?',
              options: [
                'Pour allonger la presentation',
                'Pour montrer que chaque choix est reflechi et justifie',
                'Pour impressionner avec du jargon',
                'C\'est une perte de temps',
              ],
              correctIndex: 1,
              explanation: 'L\'argumentation montre que chaque choix (typo, couleur, forme) est le resultat d\'une reflexion professionnelle.',
            },
            {
              question: 'Pourquoi inclure une recommandation ?',
              options: [
                'Pour imposer votre choix',
                'Pour guider la decision du client avec votre expertise',
                'Pour eviter le choix',
                'C\'est impoli',
              ],
              correctIndex: 1,
              explanation: 'La recommandation valorise votre expertise et aide le client a prendre une decision eclairee.',
            },
            {
              question: 'A quoi servent les mises en situation ?',
              options: [
                'A remplir la presentation',
                'A aider le client a se projeter sur les supports reels',
                'A montrer vos competences 3D',
                'A justifier le prix',
              ],
              correctIndex: 1,
              explanation: 'Les mockups montrent le rendu reel sur les supports d\'utilisation, aidant le client a visualiser le resultat final.',
            },
            {
              question: 'Par quoi doit commencer une presentation creative ?',
              options: [
                'Par les creations directement',
                'Par le rappel du brief pour prouver l\'ecoute',
                'Par le devis',
                'Par une blague',
              ],
              correctIndex: 1,
              explanation: 'Commencer par le rappel du brief montre que vous avez compris la demande et cree un contexte pour vos propositions.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4A1}',
      badgeName: 'Presentateur Creatif',
    },
    // Module 3 — Revisions client
    {
      id: 'graph-m3',
      title: 'Gerer les revisions client efficacement',
      emoji: '\u{1F504}',
      description: 'Cadrez et gerez les retours client sans perdre de temps.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m3-l1',
          title: 'Maitriser le cycle de revisions',
          duration: '4 min',
          type: 'text',
          content: `"On peut juste changer une petite chose ?" — cette phrase est le cauchemar de tout graphiste. Les revisions non cadrees peuvent transformer un projet de 2 semaines en calvaire de 2 mois. L\'IA vous aide a structurer le processus de revision pour rester rentable et garder une relation saine avec le client. \u{1F504}

L\'assistant Freenzy met en place un systeme de suivi des revisions des le depart. Le devis et le contrat generés par l\'IA incluent clairement : "2 tours de revisions inclus. Revisions supplementaires facturees 80 euros/heure." Cette clause, redigee de maniere positive ("2 tours inclus" plutot que "revisions limitees"), est acceptee naturellement par le client.

A chaque tour de revision, l\'IA centralise les retours du client dans un document structure. Au lieu de retours eparpilles dans 5 emails, 3 messages WhatsApp et 1 appel telephonique, tout est regroupe dans un tableau : element concerne, modification demandee, priorite, et statut (en cours, fait, refuse car hors scope). \u{2705}

L\'IA detecte aussi les retours contradictoires. Si le client a valide le bleu a la revision 1 et demande de changer pour du vert a la revision 2, elle le signale : "Le bleu (#2563EB) a ete valide lors du tour 1 (email du 12/03). Confirmer le changement vers le vert ? Ce changement de direction compte comme un tour supplementaire."

Pour les retours subjectifs ("je n\'aime pas, mais je ne sais pas quoi"), l\'IA propose un questionnaire guide : "Est-ce la couleur, la typographie, la disposition ou le style global ? Pouvez-vous montrer un exemple de ce que vous aimeriez ?" Ces questions transforment un retour flou en directive actionable.

Le systeme de validation par etape est crucial. L\'IA fait valider chaque element separement : logo OK, couleurs OK, typographie OK. Une fois valide, l\'element est "verrouille" — toute modification ulterieure est facturee comme revision supplementaire. Cette methode evite les remises en question globales en fin de projet. \u{1F512}`,
          xpReward: 15,
        },
        {
          id: 'graph-m3-l2',
          title: 'Exercice : Gerer un client difficile',
          duration: '3 min',
          type: 'exercise',
          content: 'Gerez une situation de revisions complexe.',
          exercisePrompt: `Vous etes au tour de revision 3 (2 inclus dans le devis) sur un projet de charte graphique. Le client envoie ce message :

"En fait, apres reflexion, on n'est plus surs du logo. La direction prefererait quelque chose de plus corporate, moins creatif. Aussi, le bleu qu'on avait valide ne plait plus a l'associe qui revient de vacances. Et on voudrait ajouter un depliant 3 volets au projet."

Redigez le brief pour l\'assistant Freenzy :
1. Identifiez ce qui releve de la revision (incluse ou non)
2. Ce qui releve du changement de direction (hors scope)
3. Ce qui est un ajout de prestation (depliant)
4. Redigez l'email diplomatique au client qui clarifie ces 3 points
5. Proposez un avenant au devis initial.`,
          xpReward: 20,
        },
        {
          id: 'graph-m3-l3',
          title: 'Quiz — Revisions client',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos competences en gestion de revisions.',
          quizQuestions: [
            {
              question: 'Comment formuler la clause de revisions dans le devis ?',
              options: [
                '"Revisions limitees a 2"',
                '"2 tours de revisions inclus"',
                '"Revisions illimitees"',
                '"Pas de revisions"',
              ],
              correctIndex: 1,
              explanation: 'La formulation positive "2 tours inclus" est mieux percue que "limitee a 2" et pose le cadre clairement.',
            },
            {
              question: 'Que faire face a des retours contradictoires ?',
              options: [
                'Les ignorer',
                'Signaler la contradiction en referençant la validation precedente',
                'Faire les deux versions',
                'Abandonner le projet',
              ],
              correctIndex: 1,
              explanation: 'Signaler la contradiction avec preuve (email de validation) clarifie la situation et protege le graphiste.',
            },
            {
              question: 'Comment transformer un retour subjectif en directive actionable ?',
              options: [
                'En devinant ce que le client veut',
                'Avec un questionnaire guide (couleur, typo, disposition, style)',
                'En proposant 10 nouvelles pistes',
                'En refusant le retour',
              ],
              correctIndex: 1,
              explanation: 'Un questionnaire cible aide le client a exprimer precisement ce qui ne lui convient pas.',
            },
            {
              question: 'A quoi sert la validation par etape ?',
              options: [
                'A ralentir le projet',
                'A verrouiller les elements valides et eviter les remises en question',
                'A facturer plus d\'heures',
                'A compliquer le processus',
              ],
              correctIndex: 1,
              explanation: 'La validation par etape verrouille les choix progressivement, evitant les remises en question globales en fin de projet.',
            },
            {
              question: 'Ou centraliser tous les retours client ?',
              options: [
                'Dans votre memoire',
                'Dans un document structure avec priorite et statut',
                'Sur des post-it',
                'Dans un groupe WhatsApp',
              ],
              correctIndex: 1,
              explanation: 'Un document structure centralise tous les retours avec element, modification, priorite et statut pour un suivi clair.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F504}',
      badgeName: 'Revision Pro',
    },
    // Module 4 — Portfolio
    {
      id: 'graph-m4',
      title: 'Portfolio et personal branding',
      emoji: '\u{1F4BC}',
      description: 'Construisez un portfolio qui convertit les visiteurs en clients.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m4-l1',
          title: 'Un portfolio qui vend',
          duration: '4 min',
          type: 'text',
          content: `Votre portfolio est votre commercial 24h/24. C\'est lui qui convainc (ou non) les prospects de vous contacter. Pourtant, beaucoup de graphistes ont un portfolio desorganise, pas a jour, ou qui ne met pas en valeur leur travail. L\'IA vous aide a construire un portfolio strategique qui convertit. \u{1F4BC}

L\'assistant Freenzy analyse votre cible client pour organiser le portfolio de maniere strategique. Si vous visez les startups tech, les projets d\'identite visuelle et de web design sont mis en avant. Si vous ciblez l\'industrie du luxe, les projets packaging et editorial passent en premier. L\'IA adapte l\'ordre et la selection des projets a votre marche cible.

Pour chaque projet presente, l\'IA structure un case study complet : le brief client (problematique), votre approche (demarche creative), le resultat (visuels) et l\'impact (resultats mesurables si disponibles : "+35% de taux de conversion apres refonte du packaging"). Ce format case study est bien plus convaincant qu\'une simple galerie de visuels. \u{2705}

L\'IA redige les textes d\'accompagnement en equilibrant jargon professionnel et accessibilite. Le client potentiel qui visite votre portfolio n\'est pas necessairement un expert en design — il doit comprendre votre valeur ajoutee sans se perdre dans la technique. "Nous avons opte pour une palette chromatique chaude qui evoque la convivialite, en phase avec le positionnement de ce restaurant familial."

La page "A propos" est aussi optimisee. L\'IA redige votre bio professionnelle en mettant en avant votre specialite, votre experience et votre approche. Elle suggere aussi les elements de confiance : certifications, clients notables, prix obtenus, articles dans la presse sectorielle.

Le SEO du portfolio est travaille. L\'IA genere les meta-descriptions, les alt-tags des images et les titres optimises pour que vos projets apparaissent dans les recherches Google : "creation logo startup Paris", "graphiste packaging cosmetiques." Ce trafic organique genere des demandes entrantes regulieres. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'graph-m4-l2',
          title: 'Jeu : Associer portfolio et cible',
          duration: '3 min',
          type: 'game',
          content: 'Associez le type de projet a mettre en avant selon la cible.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Startups tech', right: 'Identite visuelle + web design' },
              { left: 'Industrie du luxe', right: 'Packaging + editorial haut de gamme' },
              { left: 'Restauration', right: 'Menus + branding espace' },
              { left: 'E-commerce', right: 'Visuels produits + bannières web' },
              { left: 'Institutions', right: 'Rapports annuels + signaletique' },
              { left: 'Mode', right: 'Lookbooks + campagnes visuelles' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'graph-m4-l3',
          title: 'Quiz — Portfolio graphiste',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur le portfolio strategique.',
          quizQuestions: [
            {
              question: 'Quel format est plus convaincant qu\'une galerie de visuels ?',
              options: [
                'Un diaporama automatique',
                'Un case study avec brief, approche, resultat et impact',
                'Une grille Instagram',
                'Un PDF telechargeable',
              ],
              correctIndex: 1,
              explanation: 'Le case study raconte l\'histoire du projet et montre votre valeur ajoutee, bien au-dela d\'une simple image.',
            },
            {
              question: 'Comment organiser l\'ordre des projets ?',
              options: [
                'Chronologiquement',
                'Selon la cible client visee (projets pertinents en premier)',
                'Par taille de projet',
                'Alphabetiquement',
              ],
              correctIndex: 1,
              explanation: 'L\'ordre est strategique : les projets les plus pertinents pour votre cible doivent etre vus en premier.',
            },
            {
              question: 'Pourquoi inclure les resultats mesurables ?',
              options: [
                'Pour se vanter',
                'Pour prouver l\'impact concret de votre travail',
                'C\'est obligatoire',
                'Pour gonfler les chiffres',
              ],
              correctIndex: 1,
              explanation: 'Les resultats mesurables (+35% conversion, etc.) prouvent que votre design a un impact business reel.',
            },
            {
              question: 'Pourquoi travailler le SEO du portfolio ?',
              options: [
                'Pour plaire a Google',
                'Pour generer des demandes entrantes via les recherches',
                'Pour avoir plus de pages',
                'C\'est inutile pour un graphiste',
              ],
              correctIndex: 1,
              explanation: 'Le SEO genere du trafic organique qualifie, transformant votre portfolio en source de prospection passive.',
            },
            {
              question: 'Quel ton utiliser dans les textes du portfolio ?',
              options: [
                'Tres technique et jargonneux',
                'Equilibre entre professionnel et accessible',
                'Tres decontracte et familier',
                'Academique et formel',
              ],
              correctIndex: 1,
              explanation: 'L\'equilibre pro/accessible permet aux clients non-experts de comprendre votre valeur ajoutee.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4BC}',
      badgeName: 'Portfolio Pro',
    },
    // Module 5 — Facturation graphiste
    {
      id: 'graph-m5',
      title: 'Facturation et gestion financiere',
      emoji: '\u{1F4B3}',
      description: 'Gerez vos devis, factures et tresorerie avec l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m5-l1',
          title: 'La facturation du graphiste par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La facturation est souvent le point faible des creatifs. Entre les tarifs au forfait ou a l\'heure, les droits de cession, les acomptes et les relances, on perd un temps precieux. L\'IA simplifie toute votre gestion financiere pour que vous restiez concentre sur la creation. \u{1F4B3}

L\'assistant Freenzy genere vos devis en quelques minutes. Vous decrivez la prestation : "Creation logo + charte graphique (typo, couleurs, regles d\'usage) + declinaisons papeterie (carte de visite, papier entete, enveloppe)." L\'IA structure le devis avec un detail par livrable et les droits de cession associes : "Cession droits d\'exploitation usage commercial, tous supports, duree illimitee, territoire mondial."

La question des droits est souvent mal geree. L\'IA distingue clairement la prestation de creation (votre temps de travail) et la cession de droits (la valeur d\'exploitation de l\'oeuvre). Elle propose des formules adaptees : droits limites (usage web uniquement, 3 ans) a prix reduit, ou droits etendus (tous supports, illimite) a prix superieur. Le client choisit en connaissance de cause. \u{2705}

Les factures generees respectent toutes les mentions legales obligatoires : numero sequentiel, date, identite des parties, description detaillee, montant HT/TVA/TTC (ou mention "TVA non applicable — article 293B du CGI" pour les auto-entrepreneurs), conditions de paiement, penalites de retard. Plus de risque de facture non conforme !

Le suivi de tresorerie est automatise. L\'IA tient un tableau de bord : factures emises, factures payees, factures en retard, chiffre d\'affaires mensuel, charges deductibles, resultat net. Elle alerte sur les risques : "3 factures impayees totalisant 4 200 euros — relance recommandee." Elle genere les emails de relance adaptes au retard : courtois a J+7, ferme a J+30, mise en demeure a J+45.

Le suivi du temps par projet est aussi propose. L\'IA compare le temps reel passe avec le temps estime dans le devis, vous aidant a mieux estimer vos futurs projets. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'graph-m5-l2',
          title: 'Exercice : Devis charte graphique',
          duration: '3 min',
          type: 'exercise',
          content: 'Generez un devis complet avec cession de droits.',
          exercisePrompt: `Un client PME (50 salaries, CA 5M euros) vous demande :
- Refonte de logo (modernisation, meme esprit)
- Charte graphique complete (typo, couleurs, iconographie, regles)
- Kit papeterie (carte de visite, papier entete, signature email)
- Kit reseaux sociaux (templates LinkedIn, Instagram, banniere)

Redigez le brief pour l\'assistant Freenzy :
1. Decomposez le devis par livrable avec un prix pour chaque
2. Definissez les droits de cession adaptes a cette PME
3. Proposez 2 formules : droits standard (web + print interne) et droits etendus (tous supports)
4. Definissez le calendrier de paiement (acompte, jalons, solde)
5. Estimez le temps de travail pour chaque livrable.`,
          xpReward: 20,
        },
        {
          id: 'graph-m5-l3',
          title: 'Quiz — Facturation graphiste',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances en facturation.',
          quizQuestions: [
            {
              question: 'Que faut-il distinguer dans un devis graphiste ?',
              options: [
                'Le travail et les vacances',
                'La prestation de creation et la cession de droits',
                'Le brouillon et le final',
                'Le numerique et le papier',
              ],
              correctIndex: 1,
              explanation: 'La prestation (temps de travail) et la cession de droits (exploitation de l\'oeuvre) sont deux postes distincts.',
            },
            {
              question: 'Quelle mention est obligatoire pour un auto-entrepreneur ?',
              options: [
                'TVA 20%',
                '"TVA non applicable — article 293B du CGI"',
                'Numero de TVA intracommunautaire',
                'Rien de special',
              ],
              correctIndex: 1,
              explanation: 'Les auto-entrepreneurs non assujettis a la TVA doivent mentionner l\'article 293B du CGI sur chaque facture.',
            },
            {
              question: 'A quel moment envoyer une mise en demeure ?',
              options: ['J+7', 'J+15', 'J+30', 'J+45'],
              correctIndex: 3,
              explanation: 'La progression recommandee est : relance courtoise J+7, ferme J+30, mise en demeure J+45.',
            },
            {
              question: 'Pourquoi suivre le temps reel par projet ?',
              options: [
                'Pour facturer a l\'heure',
                'Pour mieux estimer les futurs projets',
                'Pour travailler plus vite',
                'C\'est obligatoire',
              ],
              correctIndex: 1,
              explanation: 'Comparer temps reel et estime permet d\'affiner vos estimations futures et d\'identifier les projets non rentables.',
            },
            {
              question: 'Que propose l\'IA pour les droits de cession ?',
              options: [
                'Toujours gratuits',
                'Des formules adaptees : droits limites ou etendus avec prix different',
                'Toujours au meme prix',
                'Pas de droits necessaires',
              ],
              correctIndex: 1,
              explanation: 'L\'IA propose des formules de cession adaptees (limitee/etendue) avec une tarification differenciee.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4B3}',
      badgeName: 'Facture Pro',
    },
    // Module 6 — Veille tendances
    {
      id: 'graph-m6',
      title: 'Veille tendances et inspiration',
      emoji: '\u{1F50D}',
      description: 'Restez a la pointe des tendances design grace a l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'graph-m6-l1',
          title: 'La veille design automatisee',
          duration: '4 min',
          type: 'text',
          content: `Le design evolue constamment. Les tendances de typographie, de couleur, d\'illustration et de mise en page changent chaque saison. Rester a jour est essentiel pour proposer des creations actuelles, mais la veille prend du temps. L\'IA transforme votre veille en processus automatise et intelligent. \u{1F50D}

L\'assistant Freenzy surveille les sources de reference pour vous : Behance, Dribbble, Awwwards, les blogs de design (It\'s Nice That, Brand New, Communication Arts) et les comptes Instagram influents. Chaque semaine, il vous envoie un digest des tendances emergentes avec des exemples visuels et une analyse concise.

Le rapport de tendances saisonnier est particulierement utile. L\'IA compile les mouvements observes et les synthetise : "Tendance printemps 2026 : retour du maximalisme colore, typographies serif en gras, degradees pastels, illustrations vectorielles organiques." Pour chaque tendance, elle donne des exemples d\'application dans differents secteurs pour vous inspirer. \u{2705}

L\'IA analyse aussi les tendances par secteur. Si vous travaillez beaucoup en restauration, elle suit specifiquement les evolutions du design dans ce domaine : "Les menus epures avec typo manuscrite sont remplaces par des compositions plus graphiques et colorees — influence food truck et street food." Cette veille sectorielle vous positionne comme expert aupres de vos clients.

La veille technique est aussi couverte. L\'IA surveille les mises a jour des logiciels (Adobe, Figma, Affinity), les nouvelles fonctionnalites, les plugins utiles et les formations disponibles. "Figma vient de lancer les variables de design — voici comment les utiliser pour creer des chartes graphiques adaptatives."

Enfin, l\'IA vous aide a integrer les tendances de maniere pertinente. Elle ne recommande pas de suivre aveuglement chaque mode, mais d\'identifier celles qui sont coherentes avec votre style et votre clientele. "La tendance brutaliste convient aux marques tech disruptives mais pas aux marques de luxe classiques." \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'graph-m6-l2',
          title: 'Jeu : Flashcards tendances design',
          duration: '3 min',
          type: 'game',
          content: 'Testez vos connaissances sur les tendances actuelles.',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'Brutalisme web', back: 'Style brut, typo grande, couleurs vives, anti-design, populaire en tech disruptive' },
              { front: 'Glassmorphisme', back: 'Effet verre depoli, transparence, flou d\'arriere-plan, utilise en UI/UX' },
              { front: 'Design inclusif', back: 'Accessible a tous (daltoniens, dyslexiques), contraste fort, hierarchie claire' },
              { front: 'Motion design', back: 'Animations micro-interactions, transitions fluides, storytelling anime' },
              { front: 'Design generatif', back: 'Visuels crees par algorithmes/IA, uniques a chaque iteration' },
              { front: 'Typographie variable', back: 'Polices avec axes modifiables (graisse, largeur, optique) en temps reel' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'graph-m6-l3',
          title: 'Quiz — Veille design',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en veille tendances.',
          quizQuestions: [
            {
              question: 'A quelle frequence l\'IA envoie-t-elle un digest de veille ?',
              options: ['Quotidien', 'Hebdomadaire', 'Mensuel', 'Trimestriel'],
              correctIndex: 1,
              explanation: 'Un digest hebdomadaire est le bon rythme : assez frequent pour rester informe, sans etre noyé d\'informations.',
            },
            {
              question: 'Faut-il suivre toutes les tendances ?',
              options: [
                'Oui, c\'est obligatoire',
                'Non, seulement celles coherentes avec son style et sa clientele',
                'Oui, pour etre moderne',
                'Non, les tendances sont inutiles',
              ],
              correctIndex: 1,
              explanation: 'Il faut identifier les tendances pertinentes pour son positionnement et sa clientele, pas suivre toutes les modes.',
            },
            {
              question: 'Quelle veille est souvent negligee par les graphistes ?',
              options: [
                'La veille visuelle',
                'La veille technique (logiciels, plugins, fonctionnalites)',
                'La veille couleur',
                'La veille typographique',
              ],
              correctIndex: 1,
              explanation: 'La veille technique (mises a jour logiciels, nouveaux outils, plugins) est souvent negligee alors qu\'elle impacte la productivite.',
            },
            {
              question: 'Pourquoi faire de la veille sectorielle ?',
              options: [
                'Par curiosite',
                'Pour se positionner comme expert aupres de ses clients',
                'Pour copier les concurrents',
                'C\'est une perte de temps',
              ],
              correctIndex: 1,
              explanation: 'La veille sectorielle vous positionne comme expert de votre domaine, renforçant la confiance de vos clients.',
            },
            {
              question: 'Quelles sources l\'IA surveille-t-elle pour la veille design ?',
              options: [
                'Uniquement Instagram',
                'Behance, Dribbble, Awwwards, blogs specialises',
                'Uniquement Google',
                'Les journaux papier',
              ],
              correctIndex: 1,
              explanation: 'L\'IA surveille les plateformes de reference : Behance, Dribbble, Awwwards et les blogs de design reconnus.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Veille Expert',
    },
  ],
};

// =============================================================================
// 5. IA pour les Developpeurs
// =============================================================================

export const parcoursDeveloppeurIA: FormationParcours = {
  id: 'developpeur-ia',
  title: 'IA pour les Developpeurs',
  emoji: '\u{1F4BB}',
  description: 'Decuplez votre productivite de developpeur avec l\'IA : code review, documentation, tests, debugging, architecture et veille technologique.',
  category: 'metier',
  subcategory: 'tech',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#10B981',
  diplomaTitle: 'Developpeur IA',
  diplomaSubtitle: 'Certification Freenzy.io — IA pour les Developpeurs',
  totalDuration: '45 min',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Code review IA
    {
      id: 'dev-m1',
      title: 'Code review assiste par IA',
      emoji: '\u{1F50D}',
      description: 'Ameliorez la qualite de votre code avec des reviews automatisees.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m1-l1',
          title: 'La code review augmentee par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `La code review est une pratique essentielle pour maintenir la qualite du code, mais elle est souvent baclee par manque de temps ou de disponibilite des collegues. L\'IA transforme la code review en un processus systematique, rapide et pedagogue qui attrape ce que l\'oeil humain manque. \u{1F50D}

L\'assistant Freenzy analyse votre code selon plusieurs axes : la lisibilite (nommage des variables, structure des fonctions, commentaires), la robustesse (gestion d\'erreurs, edge cases, null checks), la performance (complexite algorithmique, requetes N+1, fuites memoire potentielles), la securite (injections SQL, XSS, gestion des secrets) et le respect des conventions du projet.

Pour chaque observation, l\'IA fournit une explication pedagogique. Au lieu de simplement signaler "variable mal nommee", elle explique : "La variable 'd' en ligne 42 devrait s'appeler 'userCreationDate' pour expliciter son contenu. Un code lisible reduit le temps de maintenance de 40% — c\'est un investissement sur le long terme." Cette approche fait progresser le developpeur. \u{2705}

L\'IA detecte aussi les patterns problematiques recurrents. Si vous avez tendance a oublier les try-catch sur les appels API, elle le remarque et le signale globalement : "Sur vos 15 derniers commits, 8 appels API n\'ont pas de gestion d\'erreur. Considerez un wrapper generique pour centraliser le error handling." Ce feedback meta est extremement utile pour progresser.

Le systeme de severite est clair : critique (bloquant, risque de bug en production), majeur (a corriger avant merge), mineur (suggestion d\'amelioration), nitpick (style et preferences). Cette classification vous permet de prioriser les corrections et de ne pas bloquer une PR pour un point de style.

L\'IA s\'adapte aussi au langage et au framework. Elle connait les best practices TypeScript, les conventions React/Next.js, les patterns Express, les idiomes Python, etc. Ses recommandations sont contextuelles et actionnables, pas generiques. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'dev-m1-l2',
          title: 'Exercice : Review de code TypeScript',
          duration: '3 min',
          type: 'exercise',
          content: 'Pratiquez la code review assistee par IA.',
          exercisePrompt: `Voici un extrait de code TypeScript a reviewer :

\`\`\`typescript
async function getData(id: any) {
  const res = await fetch('/api/users/' + id);
  const data = res.json();
  let x = data.name;
  console.log(x);
  return x;
}

function process(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items[i].orders.length; j++) {
      if (items[i].orders[j].status == 'active') {
        items[i].orders[j].total = items[i].orders[j].price * items[i].orders[j].qty;
      }
    }
  }
  return items;
}
\`\`\`

Identifiez et classez les problemes (critique, majeur, mineur) :
1. Listez au moins 8 problemes dans ce code
2. Classez-les par severite
3. Proposez une version corrigee de chaque fonction
4. Expliquez pourquoi chaque correction est importante
5. Identifiez un pattern recurrent dans les erreurs de ce developpeur.`,
          xpReward: 20,
        },
        {
          id: 'dev-m1-l3',
          title: 'Quiz — Code review',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en code review IA.',
          quizQuestions: [
            {
              question: 'Quel niveau de severite est un risque de bug en production ?',
              options: ['Nitpick', 'Mineur', 'Majeur', 'Critique'],
              correctIndex: 3,
              explanation: 'Le niveau critique concerne les problemes qui peuvent causer un bug en production et doivent etre corriges immediatement.',
            },
            {
              question: 'De combien un code lisible reduit-il le temps de maintenance ?',
              options: ['10%', '20%', '40%', '60%'],
              correctIndex: 2,
              explanation: 'Un code bien nomme et structure reduit le temps de maintenance d\'environ 40% selon les etudes.',
            },
            {
              question: 'Que detecte l\'IA dans les patterns recurrents ?',
              options: [
                'Les fautes de frappe',
                'Les erreurs que le developpeur repete systematiquement',
                'Le nombre de lignes de code',
                'La vitesse de frappe',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les erreurs recurrentes (oubli de try-catch, mauvais nommage) pour un feedback constructif global.',
            },
            {
              question: 'Pourquoi l\'IA adapte-t-elle ses recommandations au framework ?',
              options: [
                'Par preference',
                'Pour donner des conseils contextuels et actionnables',
                'Pour paraitre experte',
                'C\'est inutile',
              ],
              correctIndex: 1,
              explanation: 'Les best practices varient selon le langage et le framework — des conseils contextuels sont plus utiles que des regles generiques.',
            },
            {
              question: 'Quel type d\'analyse l\'IA effectue-t-elle sur le code ?',
              options: [
                'Uniquement la syntaxe',
                'Lisibilite, robustesse, performance, securite et conventions',
                'Uniquement les bugs',
                'Uniquement le style',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse 5 axes : lisibilite, robustesse, performance, securite et respect des conventions du projet.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Review Expert',
    },
    // Module 2 — Documentation
    {
      id: 'dev-m2',
      title: 'Documentation automatisee',
      emoji: '\u{1F4D6}',
      description: 'Generez et maintenez une documentation de qualite sans effort.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m2-l1',
          title: 'Documenter son code avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `"Le code devrait se documenter lui-meme" — cette philosophie a ses limites. En realite, une bonne documentation fait gagner des heures a toute l\'equipe. Mais documenter est fastidieux, et la documentation devient vite obsolete. L\'IA resout ces deux problemes en generant et en maintenant la documentation automatiquement. \u{1F4D6}

L\'assistant Freenzy genere plusieurs niveaux de documentation. Le premier niveau est le JSDoc/TSDoc : pour chaque fonction, classe et interface, l\'IA genere les annotations avec description, parametres, type de retour et exemples d\'utilisation. Elle detecte les fonctions non documentees et propose les annotations adaptees en analysant le code.

Le deuxieme niveau est la documentation technique (README, guides d\'architecture). L\'IA analyse la structure du projet et genere un document d\'architecture : "Le projet utilise une architecture en couches : controllers (routes) → services (logique metier) → repositories (acces donnees). Les middlewares gerent l\'authentification JWT et la validation Zod." \u{2705}

Le troisieme niveau est la documentation API. L\'IA genere automatiquement la documentation OpenAPI/Swagger a partir de vos routes Express. Pour chaque endpoint : methode HTTP, URL, parametres, body attendu (schema Zod traduit en JSON Schema), reponses possibles (200, 400, 401, 500), et exemple de requete curl. Cette documentation est toujours a jour car generee depuis le code.

L\'IA detecte aussi les divergences entre le code et la documentation existante. "Attention : la fonction calculateTotal a ete modifiee (ajout du parametre discount) mais le JSDoc n\'a pas ete mis a jour." Ce controle de coherence evite la documentation trompeuse, pire que l\'absence de documentation.

Pour les projets d\'equipe, l\'IA genere des guides d\'onboarding : "Pour demarrer le projet : 1) Cloner le repo, 2) cp .env.example .env, 3) docker compose up, 4) npm install, 5) npm run dev. Le serveur demarre sur localhost:3000." Ce type de guide fait gagner une journee a chaque nouveau developpeur. \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'dev-m2-l2',
          title: 'Jeu : Types de documentation',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque type de documentation a son objectif.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'JSDoc / TSDoc', right: 'Documenter fonctions et interfaces' },
              { left: 'README.md', right: 'Presenter et demarrer le projet' },
              { left: 'OpenAPI / Swagger', right: 'Documenter les endpoints API' },
              { left: 'Guide d\'architecture', right: 'Expliquer la structure du code' },
              { left: 'Guide d\'onboarding', right: 'Integrer un nouveau developpeur' },
              { left: 'Changelog', right: 'Historique des modifications' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dev-m2-l3',
          title: 'Quiz — Documentation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en documentation automatisee.',
          quizQuestions: [
            {
              question: 'Quel est le pire scenario en documentation ?',
              options: [
                'Pas de documentation',
                'Une documentation obsolete et trompeuse',
                'Trop de documentation',
                'De la documentation en anglais',
              ],
              correctIndex: 1,
              explanation: 'Une documentation obsolete est pire que pas de documentation car elle induit en erreur les developpeurs.',
            },
            {
              question: 'Comment l\'IA genere-t-elle la doc API ?',
              options: [
                'Manuellement',
                'A partir des routes Express et schemas Zod',
                'En copiant la concurrence',
                'En demandant au developpeur',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les routes Express et traduit les schemas Zod en JSON Schema pour generer OpenAPI automatiquement.',
            },
            {
              question: 'Combien de temps un guide d\'onboarding fait-il gagner ?',
              options: ['1 heure', 'Une demi-journee', 'Une journee', 'Une semaine'],
              correctIndex: 2,
              explanation: 'Un bon guide d\'onboarding fait gagner environ une journee a chaque nouveau membre de l\'equipe.',
            },
            {
              question: 'Que detecte l\'IA sur la documentation existante ?',
              options: [
                'Les fautes d\'orthographe uniquement',
                'Les divergences entre le code et la documentation',
                'Le nombre de pages',
                'La qualite du formatage',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte quand le code a change mais la documentation n\'a pas suivi, evitant les informations trompeuses.',
            },
            {
              question: 'Combien de niveaux de documentation l\'IA genere-t-elle ?',
              options: ['1 (code)', '2 (code + API)', '3 (code, technique, API)', '5 niveaux'],
              correctIndex: 2,
              explanation: 'L\'IA genere 3 niveaux : JSDoc/TSDoc (code), documentation technique (architecture), et documentation API (OpenAPI).',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4D6}',
      badgeName: 'Doc Master',
    },
    // Module 3 — Tests automatises
    {
      id: 'dev-m3',
      title: 'Tests automatises avec l\'IA',
      emoji: '\u{2705}',
      description: 'Generez des suites de tests completes et maintenables.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m3-l1',
          title: 'Ecrire des tests avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Les tests sont souvent la premiere chose sacrifiee quand les deadlines approchent. Pourtant, chaque heure investie en tests en economise 10 en debugging. L\'IA transforme l\'ecriture de tests d\'une corvee en un processus rapide et methodique. \u{2705}

L\'assistant Freenzy analyse votre code et genere automatiquement les tests unitaires. Pour une fonction calculateDiscount(price, customerType, quantity), l\'IA genere les cas de test : cas nominal (client standard, quantite 1), cas limites (prix 0, quantite negative, prix tres eleve), cas par type de client (standard, premium, VIP), et cas d\'erreur (parametres invalides, types incorrects).

L\'IA utilise la technique de boundary testing systematiquement. Elle identifie les seuils dans votre code : si une remise s\'applique a partir de 10 articles, les tests couvrent 9 (juste avant), 10 (limite) et 11 (juste apres). Ces edge cases sont souvent les sources de bugs que les tests manuels oublient.

Pour les tests d\'integration, l\'IA genere les scenarios de bout en bout. Elle cree les fixtures de donnees realistes, configure les mocks pour les services externes (API tiers, base de donnees) et ecrit les assertions detaillees. "Test : creation d\'un utilisateur → verification email envoye → activation du compte → connexion → acces au dashboard." \u{1F3AF}

L\'IA mesure et ameliore votre couverture de tests. Elle identifie les branches non couvertes : "La branche else de la ligne 87 (cas ou le paiement echoue) n\'est pas testee. Voici un test pour ce cas." Elle priorise les zones critiques : les fonctions de paiement, d\'authentification et de gestion des droits doivent avoir 100% de couverture.

Le naming des tests suit les conventions BDD (Behavior-Driven Development) : "should return 20% discount when customer is VIP and quantity exceeds 10". Ce nommage descriptif sert de documentation vivante — en lisant les noms des tests, on comprend le comportement attendu du code.

L\'IA genere aussi les tests de regression quand vous corrigez un bug : elle cree un test qui reproduit le bug, verifie que le fix le resout, et l\'ajoute a la suite pour eviter toute regression future. \u{1F6E1}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'dev-m3-l2',
          title: 'Exercice : Suite de tests complete',
          duration: '3 min',
          type: 'exercise',
          content: 'Generez des tests pour une fonction metier.',
          exercisePrompt: `Voici une fonction a tester :

\`\`\`typescript
function calculateShipping(weight: number, country: string, express: boolean): number {
  if (weight <= 0) throw new Error('Weight must be positive');
  const baseRate = country === 'FR' ? 5.99 : country === 'EU' ? 9.99 : 19.99;
  const weightSurcharge = weight > 5 ? (weight - 5) * 2 : 0;
  const expressMultiplier = express ? 2.5 : 1;
  const total = (baseRate + weightSurcharge) * expressMultiplier;
  return Math.round(total * 100) / 100;
}
\`\`\`

Redigez le brief pour l\'assistant Freenzy :
1. Listez tous les cas de test (nominal, limites, erreurs) — au moins 10
2. Utilisez le naming BDD (should... when...)
3. Identifiez les boundary values a tester
4. Proposez un test de regression pour un bug potentiel
5. Estimez la couverture obtenue avec ces tests.`,
          xpReward: 20,
        },
        {
          id: 'dev-m3-l3',
          title: 'Quiz — Tests IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances en tests automatises.',
          quizQuestions: [
            {
              question: 'Combien d\'heures de debugging economise 1 heure de tests ?',
              options: ['2 heures', '5 heures', '10 heures', '20 heures'],
              correctIndex: 2,
              explanation: 'Chaque heure investie en tests permet d\'economiser environ 10 heures de debugging en production.',
            },
            {
              question: 'Qu\'est-ce que le boundary testing ?',
              options: [
                'Tester les limites du serveur',
                'Tester les valeurs aux seuils (juste avant, a la limite, juste apres)',
                'Tester les frontieres du reseau',
                'Tester les limites de memoire',
              ],
              correctIndex: 1,
              explanation: 'Le boundary testing verifie le comportement aux seuils : valeur juste avant, a la limite et juste apres un seuil.',
            },
            {
              question: 'Quelles zones doivent avoir 100% de couverture ?',
              options: [
                'Les pages d\'accueil',
                'Paiement, authentification et gestion des droits',
                'Les commentaires',
                'Les logs',
              ],
              correctIndex: 1,
              explanation: 'Les fonctions critiques (paiement, auth, droits) doivent etre entierement couvertes car un bug y est catastrophique.',
            },
            {
              question: 'A quoi sert le naming BDD des tests ?',
              options: [
                'A impressionner le chef de projet',
                'A servir de documentation vivante du comportement attendu',
                'A rallonger les noms de fichiers',
                'A trier les tests alphabetiquement',
              ],
              correctIndex: 1,
              explanation: 'Les noms BDD ("should return X when Y") documentent le comportement attendu et servent de specification lisible.',
            },
            {
              question: 'Que fait l\'IA quand vous corrigez un bug ?',
              options: [
                'Rien',
                'Elle cree un test de regression qui reproduit le bug',
                'Elle supprime le code bugge',
                'Elle signale le developpeur',
              ],
              correctIndex: 1,
              explanation: 'L\'IA cree un test qui reproduit le bug corrige, prevenant toute regression future sur ce cas.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{2705}',
      badgeName: 'Test Expert',
    },
    // Module 4 — Debugging
    {
      id: 'dev-m4',
      title: 'Debugging intelligent avec l\'IA',
      emoji: '\u{1F41B}',
      description: 'Trouvez et corrigez les bugs plus rapidement avec l\'aide de l\'IA.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m4-l1',
          title: 'Debugger avec l\'IA comme copilote',
          duration: '4 min',
          type: 'text',
          content: `Le debugging consomme en moyenne 50% du temps de developpement. Trouver la cause d\'un bug dans un codebase de 100 000 lignes peut prendre des heures, voire des jours. L\'IA accelere dramatiquement ce processus en analysant les logs, le code et le contexte pour identifier la cause racine. \u{1F41B}

L\'assistant Freenzy analyse les messages d\'erreur et les stack traces de maniere intelligente. Quand vous collez une erreur comme "TypeError: Cannot read properties of undefined (reading 'map')", l\'IA ne se contente pas de dire "une variable est undefined." Elle analyse le contexte : "La variable 'users' en ligne 42 de UserList.tsx est undefined. Cause probable : la requete API /api/users renvoie un objet au lieu d\'un tableau. Verifiez le format de reponse de votre endpoint."

L\'analyse de logs est un autre superpower. L\'IA parse des centaines de lignes de logs pour identifier le pattern du probleme : "L\'erreur survient uniquement quand deux requetes concurrentes modifient le meme enregistrement. Il s\'agit d\'un probleme de race condition — ajoutez un verrou optimiste (version field) ou un mutex." \u{2705}

L\'IA excelle aussi dans la reproduction des bugs intermittents. Elle analyse les conditions communes aux occurrences : "Le crash se produit uniquement avec des requetes contenant des caracteres Unicode dans le champ 'name'. Le probleme est dans la fonction sanitize() qui ne gere pas les caracteres multi-octets." Ces bugs insaisissables deviennent reproductibles.

Le debugging de performance est egalement couvert. L\'IA identifie les goulots d\'etranglement : "La requete SQL en ligne 156 de OrderService effectue un SELECT * avec 3 JOINs sans index. Temps moyen : 2.3s. Solution : ajouter un index composite sur (user_id, created_at) et selectionner uniquement les colonnes necessaires."

L\'IA propose toujours la correction et explique pourquoi elle fonctionne, transformant chaque bug en opportunite d\'apprentissage. Au fil du temps, vous reconnaissez les patterns et debuggez plus vite, meme sans IA. \u{1F4A1}`,
          xpReward: 15,
        },
        {
          id: 'dev-m4-l2',
          title: 'Jeu : Associer erreurs et causes',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque erreur a sa cause la plus probable.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'TypeError: Cannot read undefined', right: 'Variable non initialisee ou API retour inattendu' },
              { left: 'CORS error', right: 'Headers Access-Control manquants sur le serveur' },
              { left: 'Memory leak warning', right: 'Event listener ou subscription non nettoye' },
              { left: '429 Too Many Requests', right: 'Rate limit atteint sur l\'API' },
              { left: 'ECONNREFUSED', right: 'Service (DB, Redis) non demarre ou port incorrect' },
              { left: 'Deadlock detected', right: 'Deux transactions se bloquent mutuellement' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dev-m4-l3',
          title: 'Quiz — Debugging IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos competences en debugging assiste.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du temps de dev est consacre au debugging ?',
              options: ['10%', '25%', '50%', '75%'],
              correctIndex: 2,
              explanation: 'En moyenne, le debugging represente 50% du temps de developpement, d\'ou l\'importance de l\'optimiser.',
            },
            {
              question: 'Comment l\'IA analyse-t-elle les bugs intermittents ?',
              options: [
                'Elle les ignore',
                'Elle cherche les conditions communes aux occurrences',
                'Elle relance le serveur',
                'Elle attend qu\'ils se reproduisent',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les conditions communes (donnees, timing, charge) pour identifier le pattern des bugs intermittents.',
            },
            {
              question: 'Que recommande l\'IA pour un probleme de race condition ?',
              options: [
                'Ajouter un sleep',
                'Un verrou optimiste ou un mutex',
                'Desactiver la concurrence',
                'Ignorer le probleme',
              ],
              correctIndex: 1,
              explanation: 'Les race conditions se resolvent avec des verrous optimistes (version field) ou des mutex pour serialiser les acces.',
            },
            {
              question: 'Comment l\'IA debug-t-elle les problemes de performance ?',
              options: [
                'Elle ajoute plus de RAM',
                'Elle identifie les goulots (requetes lentes, index manquants)',
                'Elle supprime du code',
                'Elle change de langage',
              ],
              correctIndex: 1,
              explanation: 'L\'IA identifie les requetes lentes, les index manquants et les algorithmes non optimaux.',
            },
            {
              question: 'Pourquoi chaque bug est-il une "opportunite d\'apprentissage" ?',
              options: [
                'C\'est un slogan marketing',
                'L\'IA explique la cause et la solution, developpant vos reflexes',
                'Les bugs sont amusants',
                'On apprend en echouant',
              ],
              correctIndex: 1,
              explanation: 'En expliquant chaque cause racine et sa solution, l\'IA vous aide a reconnaitre les patterns pour debugger plus vite seul.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F41B}',
      badgeName: 'Bug Hunter',
    },
    // Module 5 — Architecture
    {
      id: 'dev-m5',
      title: 'Architecture logicielle avec l\'IA',
      emoji: '\u{1F3D7}\u{FE0F}',
      description: 'Concevez des architectures robustes et evolutives.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m5-l1',
          title: 'Penser l\'architecture avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `L\'architecture logicielle determine si votre application sera maintenable dans 2 ans ou si elle deviendra un monolithe ingeranble. L\'IA vous aide a prendre les bonnes decisions architecturales des le depart et a refactorer intelligemment quand le besoin evolue. \u{1F3D7}\u{FE0F}

L\'assistant Freenzy commence par analyser vos besoins fonctionnels et non fonctionnels. "Combien d\'utilisateurs simultanes attendez-vous ? Quelles sont les fonctionnalites critiques ? Quel est votre budget infrastructure ? Avez-vous une equipe de 2 ou de 20 ?" A partir de ces reponses, elle recommande une architecture adaptee — pas une usine a gaz pour un MVP de 3 personnes.

Pour un projet classique, l\'IA propose une architecture en couches bien separees : presentation (React/Next.js), application (services metier), domaine (entites et regles metier), infrastructure (base de donnees, API externes). Elle genere le squelette de dossiers, les interfaces entre couches et les exemples de code pour chaque niveau. \u{2705}

L\'IA detecte les code smells architecturaux dans un projet existant. "Votre controller UserController contient 800 lignes avec de la logique metier : il faut extraire un UserService. Votre repository effectue de la validation : c\'est le role du service. Votre composant React appelle directement la base de donnees : ajoutez une couche API." Ces observations guident le refactoring progressif.

Les patterns de design sont recommandes en contexte. "Vous avez 5 types de notifications (email, SMS, push, Slack, webhook) avec le meme comportement — le pattern Strategy est ideal ici. Voici l\'implementation." L\'IA ne plaque pas des patterns par dogme mais les propose quand le code en beneficierait reellement.

L\'IA aide aussi sur les decisions d\'infrastructure : "Pour votre charge actuelle (500 req/s), un monolithe bien structure suffit. Les microservices ajouteraient une complexite operationnelle non justifiee. Reconsiderez quand vous atteindrez 5 000 req/s." Ce pragmatisme evite la sur-architecture prematuree.

Le diagramme d\'architecture est genere automatiquement : composants, flux de donnees, dependances externes, avec des annotations expliquant chaque choix. \u{1F4CA}`,
          xpReward: 15,
        },
        {
          id: 'dev-m5-l2',
          title: 'Exercice : Concevoir une architecture',
          duration: '3 min',
          type: 'exercise',
          content: 'Definissez l\'architecture d\'un nouveau projet.',
          exercisePrompt: `Vous demarrez un nouveau projet SaaS B2B :
- Application de gestion de projets avec Gantt, kanban et time tracking
- Cible : PME de 10-100 employes
- Attendu : 200 entreprises clientes la premiere annee, ~5 000 utilisateurs
- Fonctionnalites temps reel : notifications, mise a jour du kanban en live
- Integrations : Slack, Google Calendar, Jira (import)
- Stack imposee : TypeScript, React, PostgreSQL

Redigez le brief pour l\'assistant Freenzy :
1. Proposez l'architecture globale (monolithe vs microservices) et justifiez
2. Definissez les couches applicatives avec leurs responsabilites
3. Choisissez la strategie temps reel (WebSocket, SSE, polling)
4. Proposez le schema de base de donnees simplifie (5-7 tables principales)
5. Identifiez les 3 risques techniques majeurs et les mitigations.`,
          xpReward: 20,
        },
        {
          id: 'dev-m5-l3',
          title: 'Quiz — Architecture',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances en architecture logicielle.',
          quizQuestions: [
            {
              question: 'Quand les microservices sont-ils justifies ?',
              options: [
                'Des le premier jour',
                'Quand la charge et l\'equipe le justifient (5000+ req/s)',
                'Jamais',
                'Pour tout projet de plus de 10 pages',
              ],
              correctIndex: 1,
              explanation: 'Les microservices ne se justifient que quand la charge ou la taille de l\'equipe le necessitent. Un monolithe bien structure est souvent preferable.',
            },
            {
              question: 'Que signale un controller de 800 lignes ?',
              options: [
                'Un bon developpeur productif',
                'Un code smell : la logique metier doit etre dans un service',
                'Un projet bien organise',
                'Un framework limite',
              ],
              correctIndex: 1,
              explanation: 'Un controller volumineux contient probablement de la logique metier qui devrait etre extraite dans un service dedie.',
            },
            {
              question: 'Quand appliquer un design pattern ?',
              options: [
                'Systematiquement sur tout le code',
                'Quand le code en beneficierait concretement',
                'Jamais, les patterns sont depassees',
                'Uniquement en entretien d\'embauche',
              ],
              correctIndex: 1,
              explanation: 'Les patterns doivent etre appliques quand ils resolvent un probleme reel, pas par dogme ou sur-ingenierie.',
            },
            {
              question: 'Que genere l\'IA pour l\'architecture ?',
              options: [
                'Du code complet',
                'Un diagramme avec composants, flux et annotations',
                'Une liste de technologies',
                'Un devis',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere un diagramme d\'architecture avec les composants, les flux de donnees et des annotations explicatives.',
            },
            {
              question: 'Quelles sont les 4 couches d\'une architecture classique ?',
              options: [
                'HTML, CSS, JS, API',
                'Presentation, application, domaine, infrastructure',
                'Frontend, backend, database, cache',
                'Dev, test, staging, prod',
              ],
              correctIndex: 1,
              explanation: 'L\'architecture en couches separees : presentation (UI), application (services), domaine (regles metier), infrastructure (DB, API).',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F3D7}\u{FE0F}',
      badgeName: 'Architecte Code',
    },
    // Module 6 — Veille techno
    {
      id: 'dev-m6',
      title: 'Veille technologique automatisee',
      emoji: '\u{1F4E1}',
      description: 'Restez a jour sur les technologies et les bonnes pratiques.',
      duration: '8 min',
      lessons: [
        {
          id: 'dev-m6-l1',
          title: 'La veille tech assistee par IA',
          duration: '4 min',
          type: 'text',
          content: `L\'ecosysteme technique evolue a une vitesse vertigineuse. Nouveaux frameworks, mises a jour majeures, failles de securite, changements de licence — il est impossible de tout suivre. L\'IA filtre le bruit et vous livre uniquement l\'information pertinente pour votre stack et vos projets. \u{1F4E1}

L\'assistant Freenzy surveille les sources cles pour votre stack. Si vous travaillez en TypeScript/React/Node, il suit : les releases de Node.js et React, le blog TypeScript, les RFC importantes, les advisories de securite npm, les articles techniques de reference (React blog, Vercel blog, etc.) et les discussions influentes sur GitHub et Hacker News.

Le digest hebdomadaire est personnalise et priorise. Niveau critique : "Faille de securite CVE-2026-XXXXX dans Express < 4.21.2 — mettez a jour immediatement." Niveau important : "React 19.1 publie — nouvelles API de cache server-side, pas de breaking changes." Niveau informatif : "Article interessant : comment Shopify a migre de Ruby vers Node.js pour ses webhooks." \u{2705}

L\'IA analyse l\'impact des mises a jour sur vos projets. Quand une nouvelle version majeure sort, elle compare les breaking changes avec votre code : "La mise a jour de Next.js 15 → 16 affecte 3 fichiers de votre projet : le format de getServerSideProps change. Voici le guide de migration pour votre codebase." Ce diagnostic cible vous evite de lire des changelogs de 200 lignes.

La veille securite est proactive. L\'IA scanne regulierement vos dependances (npm audit) et vous alerte sur les vulnerabilites : "La dependance lodash@4.17.20 a une faille de prototype pollution (severity: high). Solution : npm update lodash@4.17.21." Elle priorise les alertes par severite et par exposition dans votre code.

L\'IA cree aussi un radar technologique personnalise, inspire du ThoughtWorks Technology Radar. Elle classe les technologies en 4 anneaux : Adopt (utiliser en production), Trial (experimenter), Assess (evaluer), Hold (eviter). Ce radar evolue trimestriellement et vous donne une vision strategique de votre stack. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'dev-m6-l2',
          title: 'Jeu : Flashcards technologies',
          duration: '3 min',
          type: 'game',
          content: 'Testez vos connaissances sur les technologies actuelles.',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'Bun', back: 'Runtime JavaScript alternatif a Node.js, plus rapide, bundler integre' },
              { front: 'tRPC', back: 'API type-safe de bout en bout entre client et serveur TypeScript' },
              { front: 'Turbopack', back: 'Bundler Rust successeur de Webpack, integre dans Next.js' },
              { front: 'Zod', back: 'Bibliotheque de validation de schemas TypeScript-first' },
              { front: 'Edge Functions', back: 'Code execute au plus pres de l\'utilisateur (CDN-level)' },
              { front: 'Server Components', back: 'Composants React rendus cote serveur, sans JS client' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'dev-m6-l3',
          title: 'Quiz — Veille techno',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos pratiques de veille technologique.',
          quizQuestions: [
            {
              question: 'Quel niveau de priorite pour une faille de securite critique ?',
              options: ['Informatif', 'Important', 'Critique — mise a jour immediate', 'A evaluer plus tard'],
              correctIndex: 2,
              explanation: 'Les failles de securite critiques doivent etre traitees immediatement, avant tout autre travail de developpement.',
            },
            {
              question: 'A quelle frequence l\'IA envoie-t-elle un digest de veille ?',
              options: ['Quotidien', 'Hebdomadaire', 'Mensuel', 'Trimestriel'],
              correctIndex: 1,
              explanation: 'Un digest hebdomadaire est le bon equilibre : assez frequent pour reagir vite, sans noyer d\'informations.',
            },
            {
              question: 'Comment l\'IA evalue-t-elle l\'impact d\'une mise a jour ?',
              options: [
                'Elle lit le changelog',
                'Elle compare les breaking changes avec votre code',
                'Elle demande a l\'equipe',
                'Elle attend que ca casse',
              ],
              correctIndex: 1,
              explanation: 'L\'IA compare les breaking changes annonces avec votre codebase pour identifier les fichiers impactes.',
            },
            {
              question: 'Quels sont les 4 anneaux du radar technologique ?',
              options: [
                'Bon, moyen, mauvais, obsolete',
                'Adopt, Trial, Assess, Hold',
                'Frontend, backend, mobile, DevOps',
                'Junior, mid, senior, lead',
              ],
              correctIndex: 1,
              explanation: 'Le radar classe les technologies en Adopt (production), Trial (experimenter), Assess (evaluer) et Hold (eviter).',
            },
            {
              question: 'Que fait l\'IA avec npm audit ?',
              options: [
                'Elle supprime les paquets vulnerables',
                'Elle scanne les dependances et alerte avec la solution de mise a jour',
                'Elle bloque le deploiement',
                'Elle notifie npm',
              ],
              correctIndex: 1,
              explanation: 'L\'IA scanne regulierement les dependances, identifie les vulnerabilites et propose la commande de mise a jour.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F4E1}',
      badgeName: 'Veille Tech',
    },
  ],
};
