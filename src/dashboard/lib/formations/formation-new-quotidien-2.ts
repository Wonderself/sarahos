// =============================================================================
// Freenzy.io — Formation Quotidien 2
// 5 parcours x 6 modules x 3 lessons = 90 lessons, 3000 XP total
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// Parcours 1 — Yoga & Meditation IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursYogaMeditation: FormationParcours = {
  id: 'yoga-meditation-ia',
  title: 'Yoga & Meditation IA',
  emoji: '\u{1F9D8}',
  description: 'Decouvrez comment l\'IA peut transformer votre pratique du yoga et de la meditation : postures adaptees, respiration guidee, programmes personnalises et pleine conscience au quotidien.',
  category: 'quotidien',
  subcategory: 'bien-etre',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#7C3AED',
  diplomaTitle: 'Yoga & Meditation IA',
  diplomaSubtitle: 'Certification Freenzy.io — Yoga, Meditation et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Postures fondamentales
    {
      id: 'yoga-m1',
      title: 'Postures fondamentales',
      emoji: '\u{1F9D8}',
      description: 'Apprenez les postures de base du yoga avec l\'aide de l\'IA pour corriger votre alignement.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F9D8}',
      badgeName: 'Yogi Debutant',
      lessons: [
        {
          id: 'yoga-m1-l1',
          title: 'Les bases du yoga avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le yoga est une discipline millenaire qui unit le corps et l'esprit. Aujourd'hui, l'intelligence artificielle revolutionne son apprentissage en offrant un accompagnement personnalise accessible a tous, directement depuis chez vous.

Les cinq postures fondamentales que tout debutant doit maitriser sont : la posture de la montagne (Tadasana), le chien tete en bas (Adho Mukha Svanasana), le guerrier I (Virabhadrasana I), l'arbre (Vrksasana) et la posture de l'enfant (Balasana). Chacune travaille des groupes musculaires differents et developpe equilibre, force et souplesse.

Avec Freenzy, l'assistant bien-etre analyse votre niveau et vos objectifs pour creer une sequence adaptee. Vous lui indiquez vos eventuelles douleurs ou limitations physiques, et il ajuste chaque posture. Par exemple, si vous avez mal au dos, il remplacera certaines flexions avant par des variantes douces avec support.

L'alignement est la cle d'une pratique securitaire. Dans la posture de la montagne, vos pieds sont paralleles, vos epaules relachees, votre colonne etirée vers le ciel. Le chien tete en bas demande des mains ecartees largeur d'epaules, les doigts bien etales, le bassin pousse vers le haut. Le guerrier I aligne le genou avant au-dessus de la cheville, jamais au-dela.

L'IA peut generer des descriptions detaillees de chaque posture avec les erreurs courantes a eviter. Elle cree aussi des enchainements progressifs : vous commencez par tenir chaque posture 5 respirations, puis vous augmentez graduellement. En 4 semaines de pratique reguliere (15 minutes par jour), vous constaterez une amelioration notable de votre souplesse et de votre equilibre.

Conseil pratique : demandez a Freenzy de vous generer un programme sur 30 jours avec une progression douce. L'assistant adaptera la difficulte chaque semaine en fonction de vos retours.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m1-l2',
          title: 'Exercice : Creez votre sequence matinale',
          duration: '5 min',
          type: 'exercise',
          content: 'Concevez une sequence yoga de 10 minutes pour le matin.',
          exercisePrompt: `Creez votre propre sequence yoga matinale de 10 minutes en suivant ces etapes :

1. Choisissez 5 postures parmi les fondamentales (montagne, chien tete en bas, guerrier I, arbre, enfant, cobra, chat-vache, torsion assise)
2. Pour chaque posture, indiquez : le nom, la duree (en respirations), le benefice principal
3. Organisez-les dans un ordre logique (echauffement → effort → retour au calme)
4. Ajoutez une intention pour votre pratique (ex: "energie", "calme", "concentration")

Utilisez l'assistant Freenzy pour affiner votre sequence et obtenir des variantes adaptees a votre niveau.

Criteres de reussite :
- La sequence dure environ 10 minutes
- L'ordre est progressif (du doux vers l'intense, puis retour au calme)
- Chaque posture a un benefice identifie
- Une intention claire guide la sequence`,
          xpReward: 20,
        },
        {
          id: 'yoga-m1-l3',
          title: 'Quiz : Postures fondamentales',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les postures de base du yoga.',
          quizQuestions: [
            { question: 'Quel est le nom sanskrit de la posture de la montagne ?', options: ['Tadasana', 'Savasana', 'Balasana', 'Padmasana'], correctIndex: 0, explanation: 'Tadasana est la posture de la montagne, la base de toutes les postures debout.' },
            { question: 'Dans le chien tete en bas, ou doit pointer le bassin ?', options: ['Vers le sol', 'Vers le ciel', 'Vers l\'avant', 'Vers l\'arriere'], correctIndex: 1, explanation: 'Le bassin doit etre pousse vers le haut et l\'arriere pour allonger la colonne vertebrale.' },
            { question: 'Dans le guerrier I, le genou avant doit etre aligne au-dessus de...', options: ['Les orteils', 'La cheville', 'Le tibia', 'Le pied arriere'], correctIndex: 1, explanation: 'Le genou avant doit rester aligne au-dessus de la cheville pour proteger l\'articulation.' },
            { question: 'Quelle posture est recommandee pour se reposer entre les enchainements ?', options: ['Guerrier I', 'Posture de l\'enfant', 'Arbre', 'Montagne'], correctIndex: 1, explanation: 'Balasana (posture de l\'enfant) est la posture de repos par excellence, accessible a tous.' },
            { question: 'Combien de temps un debutant doit-il tenir chaque posture idealement ?', options: ['1 respiration', '5 respirations', '20 respirations', '2 minutes'], correctIndex: 1, explanation: 'Pour un debutant, tenir 5 respirations profondes par posture permet un travail efficace sans surcharge.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Respiration consciente
    {
      id: 'yoga-m2',
      title: 'Respiration consciente',
      emoji: '\u{1F32C}\u{FE0F}',
      description: 'Maitrisez les techniques de respiration (pranayama) avec un guide IA personnalise.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F32C}\u{FE0F}',
      badgeName: 'Souffle Maitrise',
      lessons: [
        {
          id: 'yoga-m2-l1',
          title: 'Pranayama : la science du souffle',
          duration: '5 min',
          type: 'text',
          content: `Le pranayama, ou science du souffle, est un pilier fondamental du yoga souvent sous-estime par les debutants. Pourtant, la respiration consciente est l'outil le plus puissant pour reguler votre stress, ameliorer votre concentration et transformer votre energie au quotidien.

La respiration abdominale est la base : inspirez par le nez en gonflant le ventre (le diaphragme descend), expirez lentement par le nez en rentrant le ventre. Pratiquez 5 minutes par jour et vous constaterez une reduction mesurable de votre niveau de cortisol (hormone du stress).

La respiration alternee (Nadi Shodhana) equilibre les hemispheres cerebraux. Bouchez la narine droite avec le pouce, inspirez par la gauche sur 4 temps, retenez 4 temps, bouchez la gauche avec l'annulaire, expirez par la droite sur 4 temps. Puis inversez. Un cycle complet de 10 repetitions calme le systeme nerveux en profondeur.

La respiration du feu (Kapalabhati) est une technique energisante : expirations courtes et rapides par le nez en contractant les abdominaux, l'inspiration se fait naturellement. Commencez par 20 cycles, puis augmentez progressivement. Attention : cette technique est deconseille aux femmes enceintes et aux personnes souffrant d'hypertension.

Avec Freenzy, vous pouvez demander un programme de pranayama adapte a votre objectif : gestion du stress, amelioration du sommeil, boost d'energie matinal ou preparation a la meditation. L'IA vous propose des sequences minutees avec des rappels et des progressions hebdomadaires.

Astuce : combinez la respiration 4-7-8 (inspirez 4 temps, retenez 7 temps, expirez 8 temps) avec votre routine du soir. Trois cycles suffisent pour preparer le corps au sommeil. Demandez a Freenzy de vous creer un minuteur vocal guide pour chaque technique.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m2-l2',
          title: 'Jeu : Associez respiration et bienfait',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque technique de respiration a son bienfait principal.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Respiration abdominale', right: 'Reduction du stress' },
              { left: 'Nadi Shodhana (alternee)', right: 'Equilibre cerebral' },
              { left: 'Kapalabhati (du feu)', right: 'Energie et reveil' },
              { left: 'Respiration 4-7-8', right: 'Preparation au sommeil' },
              { left: 'Respiration carree (4-4-4-4)', right: 'Concentration immediate' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'yoga-m2-l3',
          title: 'Quiz : Techniques de respiration',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le pranayama.',
          quizQuestions: [
            { question: 'Que signifie "pranayama" ?', options: ['Posture du corps', 'Science du souffle', 'Meditation profonde', 'Relaxation musculaire'], correctIndex: 1, explanation: 'Pranayama vient de "prana" (souffle vital) et "ayama" (controle/extension).' },
            { question: 'Dans la respiration abdominale, que se passe-t-il a l\'inspiration ?', options: ['Le ventre se creuse', 'Le ventre se gonfle', 'Les epaules montent', 'La poitrine se gonfle uniquement'], correctIndex: 1, explanation: 'A l\'inspiration, le diaphragme descend et le ventre se gonfle naturellement.' },
            { question: 'La technique Kapalabhati est deconseille pour...', options: ['Les sportifs', 'Les femmes enceintes', 'Les debutants en yoga', 'Les personnes agees'], correctIndex: 1, explanation: 'Kapalabhati est deconseille aux femmes enceintes et aux personnes souffrant d\'hypertension.' },
            { question: 'Quel est le rythme de la respiration 4-7-8 ?', options: ['Inspirer 4, retenir 7, expirer 8', 'Inspirer 4, expirer 7, retenir 8', 'Inspirer 8, retenir 7, expirer 4', 'Inspirer 7, retenir 4, expirer 8'], correctIndex: 0, explanation: 'La respiration 4-7-8 : inspirez sur 4 temps, retenez sur 7 temps, expirez sur 8 temps.' },
            { question: 'Combien de cycles de respiration 4-7-8 suffisent pour preparer le sommeil ?', options: ['1 cycle', '3 cycles', '10 cycles', '20 cycles'], correctIndex: 1, explanation: 'Trois cycles de respiration 4-7-8 suffisent pour activer le systeme parasympathique et preparer le sommeil.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Meditation guidee
    {
      id: 'yoga-m3',
      title: 'Meditation guidee par IA',
      emoji: '\u{1F54A}\u{FE0F}',
      description: 'Laissez l\'IA creer des meditations sur mesure selon votre humeur et vos besoins.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F54A}\u{FE0F}',
      badgeName: 'Esprit Serein',
      lessons: [
        {
          id: 'yoga-m3-l1',
          title: 'Meditation personnalisee avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La meditation guidee est l'une des applications les plus puissantes de l'IA dans le domaine du bien-etre. Contrairement aux applications generiques qui proposent les memes scripts a tout le monde, Freenzy genere des meditations uniques adaptees a votre etat emotionnel du moment.

Le principe est simple : vous indiquez votre humeur actuelle (stresse, fatigue, anxieux, neutre, energique), la duree souhaitee (5, 10, 15 ou 20 minutes) et votre objectif (calme, concentration, lacher-prise, gratitude, sommeil). L'IA compose alors un texte de meditation structure avec des pauses, des visualisations et des ancres sensorielles personnalisees.

Une meditation IA efficace suit une structure en 4 phases. Phase 1 — Installation (2 min) : position confortable, scan corporel rapide, quelques respirations profondes pour deconnecter du mental. Phase 2 — Ancrage (3 min) : focus sur un point d'attention (souffle, son, sensation), retour doux a chaque distraction. Phase 3 — Exploration (5-10 min) : visualisation guidee, body scan detaille, ou contemplation d'une intention. Phase 4 — Retour (2 min) : reactivation progressive des sens, mouvements doux, ouverture des yeux.

L'avantage de l'IA est sa capacite a varier les metaphores et les approches. Un jour, elle vous guidera dans une foret imaginaire ; le lendemain, sur une plage au lever du soleil. Cette variete maintient l'engagement et evite la lassitude qui pousse beaucoup de debutants a abandonner.

Demandez a Freenzy de generer un script de meditation en precisant le contexte : "Je suis stresse par une reunion importante demain, genere une meditation de 10 minutes pour lacher prise et retrouver confiance." L'IA integrera des elements specifiques a votre situation, rendant la pratique bien plus impactante qu'un enregistrement generique.

Conseil avance : combinez la meditation IA avec la synthese vocale Freenzy pour obtenir un audio personnalise que vous pouvez ecouter les yeux fermes.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m3-l2',
          title: 'Exercice : Generez votre premiere meditation',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un script de meditation personnalise avec l\'IA.',
          exercisePrompt: `Utilisez Freenzy pour generer votre premiere meditation guidee personnalisee :

1. Identifiez votre etat actuel (humeur, niveau d'energie, preoccupations)
2. Choisissez un objectif : calme, concentration, lacher-prise, gratitude ou sommeil
3. Selectionnez une duree : 5, 10 ou 15 minutes
4. Demandez a l'IA de generer un script structure en 4 phases (installation, ancrage, exploration, retour)
5. Relisez le script et notez ce qui resonne le plus avec vous

Criteres de reussite :
- Le script comporte les 4 phases distinctes
- Les visualisations sont specifiques et sensorielles (pas vagues)
- La duree estimee correspond a votre choix
- Le ton est doux et bienveillant`,
          xpReward: 20,
        },
        {
          id: 'yoga-m3-l3',
          title: 'Quiz : Meditation guidee',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la meditation guidee par IA.',
          quizQuestions: [
            { question: 'Combien de phases comporte une meditation guidee bien structuree ?', options: ['2 phases', '3 phases', '4 phases', '6 phases'], correctIndex: 2, explanation: 'Une meditation guidee suit 4 phases : installation, ancrage, exploration et retour.' },
            { question: 'Quel est l\'avantage principal de la meditation generee par IA ?', options: ['Elle est gratuite', 'Elle est personnalisee a votre etat', 'Elle dure plus longtemps', 'Elle remplace un therapeute'], correctIndex: 1, explanation: 'L\'IA adapte le contenu a votre humeur, vos besoins et votre contexte du moment.' },
            { question: 'Quelle est la duree recommandee pour un debutant en meditation ?', options: ['1 minute', '5 minutes', '30 minutes', '1 heure'], correctIndex: 1, explanation: '5 minutes est ideal pour debuter : assez pour ressentir les effets, pas assez pour decourager.' },
            { question: 'Que faire quand l\'esprit vagabonde pendant la meditation ?', options: ['S\'enerve et recommencer', 'Ramener doucement l\'attention', 'Arreter la meditation', 'Ouvrir les yeux'], correctIndex: 1, explanation: 'Les distractions sont normales. On ramene simplement l\'attention avec douceur, sans jugement.' },
            { question: 'Quel element enrichit une meditation IA par rapport a un script classique ?', options: ['Des exercices physiques', 'Des metaphores variees et adaptees', 'De la musique forte', 'Des consignes strictes'], correctIndex: 1, explanation: 'L\'IA varie les metaphores et les visualisations pour eviter la lassitude et maintenir l\'engagement.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Programmes personnalises
    {
      id: 'yoga-m4',
      title: 'Programmes personnalises',
      emoji: '\u{1F4CB}',
      description: 'Creez des programmes yoga-meditation sur mesure avec l\'IA selon vos objectifs.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Planificateur Zen',
      lessons: [
        {
          id: 'yoga-m4-l1',
          title: 'Construire un programme sur 30 jours',
          duration: '5 min',
          type: 'text',
          content: `Un programme de yoga-meditation structure sur 30 jours est la meilleure facon d'ancrer une habitude durable. L'IA excelle dans la creation de ces programmes car elle peut ajuster la progression en fonction de votre retour quotidien, chose qu'aucun livre ou DVD ne peut faire.

La semaine 1 est consacree a la decouverte : 10 minutes par jour, 5 postures simples, 3 minutes de respiration et 2 minutes de meditation silencieuse. L'objectif n'est pas la performance mais la regularite. Mieux vaut 10 minutes chaque jour que 1 heure le dimanche.

La semaine 2 introduit la progression : duree portee a 15 minutes, ajout de 2 nouvelles postures, introduction de la respiration alternee et meditation guidee de 5 minutes. Vous commencez a ressentir les premiers bienfaits : meilleur sommeil, moins de tensions cervicales, esprit plus clair le matin.

La semaine 3 approfondit : 20 minutes quotidiennes, enchainements fluides entre postures (vinyasa simplifie), pranayama de 5 minutes avec retention, meditation thematique (gratitude, intention, body scan). C'est le moment ou la pratique devient un rendez-vous attendu plutot qu'une corvee.

La semaine 4 consolide et autonomise : 20 a 25 minutes, vous choisissez vos sequences preferees, l'IA propose des variations pour maintenir l'interet, meditation de 7 a 10 minutes. Vous avez les bases pour continuer seul ou approfondir.

Avec Freenzy, demandez simplement : "Cree-moi un programme yoga-meditation de 30 jours pour debutant, objectif gestion du stress, disponible 15 minutes le matin." L'IA generera un planning jour par jour avec les postures, le pranayama et la meditation, en augmentant progressivement la difficulte. Elle peut meme ajouter des rappels et des messages de motivation personnalises.

Le secret de la reussite : ne sautez pas plus de 2 jours consecutifs. Apres 21 jours, l'habitude est en place.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m4-l2',
          title: 'Jeu : Ordonnez la progression ideale',
          duration: '4 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes d\'un programme yoga progressif.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Decouverte : 5 postures simples, 10 min/jour',
              'Progression : ajout de 2 postures, respiration alternee, 15 min/jour',
              'Approfondissement : enchainements fluides, meditation thematique, 20 min/jour',
              'Consolidation : choix libre des sequences, meditation longue, 25 min/jour',
              'Autonomie : pratique personnelle sans guide, ajustement intuitif',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'yoga-m4-l3',
          title: 'Quiz : Programmes personnalises',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la planification d\'un programme yoga.',
          quizQuestions: [
            { question: 'Quelle est la duree ideale pour un programme debutant ?', options: ['7 jours', '14 jours', '30 jours', '90 jours'], correctIndex: 2, explanation: '30 jours permettent d\'ancrer l\'habitude (21 jours minimum) tout en progressant significativement.' },
            { question: 'Quelle est la priorite en semaine 1 ?', options: ['La performance', 'La regularite', 'Les postures avancees', 'La meditation longue'], correctIndex: 1, explanation: 'En semaine 1, la regularite est prioritaire. 10 minutes chaque jour valent mieux qu\'1 heure sporadique.' },
            { question: 'Combien de jours consecutifs maximum peut-on sauter sans perdre l\'habitude ?', options: ['0 jour', '1 jour', '2 jours', '5 jours'], correctIndex: 2, explanation: 'Au-dela de 2 jours consecutifs, l\'habitude commence a se fragiliser.' },
            { question: 'En semaine 3, quel type de meditation est introduit ?', options: ['Meditation silencieuse', 'Meditation thematique', 'Meditation en marchant', 'Meditation transcendantale'], correctIndex: 1, explanation: 'La semaine 3 introduit les meditations thematiques (gratitude, intention, body scan) pour varier l\'experience.' },
            { question: 'Quel avantage unique l\'IA apporte dans la planification ?', options: ['Des postures inventees', 'Un ajustement quotidien base sur vos retours', 'Des cours en video live', 'Un certificat medical'], correctIndex: 1, explanation: 'L\'IA peut ajuster le programme chaque jour en fonction de vos retours, ce qu\'aucun support statique ne peut faire.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Pleine conscience
    {
      id: 'yoga-m5',
      title: 'Pleine conscience au quotidien',
      emoji: '\u{1F33F}',
      description: 'Integrez la pleine conscience dans chaque moment de votre journee avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F33F}',
      badgeName: 'Presence Totale',
      lessons: [
        {
          id: 'yoga-m5-l1',
          title: 'La pleine conscience pour les non-inities',
          duration: '5 min',
          type: 'text',
          content: `La pleine conscience, ou mindfulness, n'est pas reservee aux moines bouddhistes. C'est une competence pratique que toute personne peut developper pour reduire le stress, ameliorer sa concentration et augmenter son bien-etre general. L'IA rend cette pratique encore plus accessible en vous accompagnant tout au long de la journee.

La pleine conscience se resume en une phrase : etre pleinement present a ce que l'on fait, sans jugement. Quand vous mangez, vous mangez vraiment (gout, texture, temperature). Quand vous marchez, vous sentez vos pieds sur le sol, l'air sur votre peau. Quand vous ecoutez quelqu'un, vous ecoutez sans preparer votre reponse.

Les micro-pratiques sont la cle pour integrer la pleine conscience sans bouleverser votre emploi du temps. Le scan des 5 sens prend 30 secondes : nommez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goutez. Cet exercice ramene instantanement au present et coupe la boucle des pensees anxieuses.

La respiration consciente entre deux taches est un autre outil puissant : avant d'ouvrir un email, prenez 3 respirations profondes. Avant une reunion, 1 minute de presence. Avant de manger, observez votre assiette 10 secondes. Ces micro-pauses transforment une journee fragmentee en une suite de moments presents.

Avec Freenzy, programmez des rappels de pleine conscience tout au long de la journee. L'IA vous envoie des micro-exercices adaptes au moment : energisants le matin, focalisants en milieu de journee, apaisants le soir. Chaque rappel prend moins de 60 secondes mais l'effet cumulatif est considerable.

Les etudes scientifiques montrent qu'apres 8 semaines de pratique reguliere, la pleine conscience modifie structurellement le cerveau : epaississement du cortex prefrontal (decision, attention) et reduction de l'amygdale (peur, stress). Vous n'avez pas besoin de mediter 1 heure par jour — 5 a 10 micro-pratiques de 30 secondes produisent des resultats mesurables.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m5-l2',
          title: 'Exercice : Journal de pleine conscience',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez votre routine de pleine conscience quotidienne.',
          exercisePrompt: `Concevez votre programme de pleine conscience pour une journee type :

1. Matin (reveil) : choisissez un exercice de pleine conscience de 2 minutes
2. Trajet/deplacement : identifiez un moment pour pratiquer la marche consciente
3. Travail : planifiez 3 micro-pauses de 30 secondes (avant email, reunion, pause)
4. Repas : decrivez comment vous allez pratiquer l'alimentation consciente au dejeuner
5. Soir : choisissez un rituel de presence avant le coucher

Pour chaque moment, decrivez :
- L'exercice precis (scan 5 sens, respiration, observation...)
- La duree (30 sec a 5 min)
- Le declencheur (qu'est-ce qui vous rappellera de pratiquer ?)

Criteres de reussite :
- 5 moments de pleine conscience repartis sur la journee
- Duree totale inferieure a 15 minutes
- Chaque exercice est concret et realisable
- Les declencheurs sont lies a des habitudes existantes`,
          xpReward: 20,
        },
        {
          id: 'yoga-m5-l3',
          title: 'Quiz : Pleine conscience',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la pleine conscience.',
          quizQuestions: [
            { question: 'Qu\'est-ce que la pleine conscience en une phrase ?', options: ['Penser positivement', 'Etre present sans jugement', 'Mediter longtemps', 'Controler ses emotions'], correctIndex: 1, explanation: 'La pleine conscience est l\'attention portee au moment present, sans jugement.' },
            { question: 'Combien d\'elements comporte le scan des 5 sens ?', options: ['5 au total', '10 au total', '15 au total', '20 au total'], correctIndex: 2, explanation: '5 choses vues + 4 touchees + 3 entendues + 2 senties + 1 goutee = 15 elements.' },
            { question: 'Apres combien de semaines la pleine conscience modifie le cerveau ?', options: ['1 semaine', '4 semaines', '8 semaines', '6 mois'], correctIndex: 2, explanation: 'Les etudes montrent des modifications cerebrales mesurables apres 8 semaines de pratique reguliere.' },
            { question: 'Quelle est la duree minimale efficace pour une micro-pratique ?', options: ['30 secondes', '5 minutes', '15 minutes', '30 minutes'], correctIndex: 0, explanation: '30 secondes suffisent pour une micro-pratique efficace, comme le scan des 5 sens.' },
            { question: 'Quel est le meilleur declencheur pour une micro-pratique ?', options: ['Une alarme aleatoire', 'Une habitude existante', 'La motivation spontanee', 'Un cours en ligne'], correctIndex: 1, explanation: 'Associer la pratique a une habitude existante (avant un email, un repas) maximise la regularite.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Habitudes bien-etre
    {
      id: 'yoga-m6',
      title: 'Ancrer ses habitudes bien-etre',
      emoji: '\u{1F31E}',
      description: 'Utilisez l\'IA pour construire et maintenir des routines yoga-meditation durables.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F31E}',
      badgeName: 'Habitude Ancree',
      lessons: [
        {
          id: 'yoga-m6-l1',
          title: 'La science des habitudes bien-etre',
          duration: '5 min',
          type: 'text',
          content: `Pourquoi certaines personnes pratiquent le yoga depuis 20 ans tandis que d'autres abandonnent apres 2 semaines ? La reponse tient dans la science des habitudes. Comprendre les mecanismes de formation d'une habitude vous permettra d'ancrer durablement votre pratique yoga-meditation.

Une habitude repose sur une boucle en 3 etapes : le signal (declencheur), la routine (l'action) et la recompense (le benefice ressenti). Pour le yoga matinal, le signal pourrait etre le reveil qui sonne, la routine est votre sequence de 15 minutes, et la recompense est la sensation de calme et d'energie qui suit.

La regle des 2 minutes est fondamentale pour les debutants : rendez votre pratique si petite qu'il est impossible de dire non. Au lieu de "faire 30 minutes de yoga", commencez par "derouler mon tapis". C'est tout. Une fois le tapis deroule, vous ferez naturellement quelques postures. Apres quelques jours, les 2 minutes deviennent 5, puis 10, puis 15.

L'empilement d'habitudes est une technique puissante : attachez votre nouvelle habitude a une habitude existante. "Apres avoir bu mon cafe (habitude existante), je fais 5 minutes de yoga (nouvelle habitude)." Le cafe devient le signal automatique qui declenche la pratique sans effort de volonte.

Le suivi est essentiel pour la motivation. Avec Freenzy, l'IA trace votre progression : nombre de jours consecutifs, duree totale pratiquee, evolution de vos performances, badges gagnes. Ce suivi active le circuit de recompense du cerveau et renforce la boucle de l'habitude.

Les rechutes sont normales et font partie du processus. La regle "jamais 2 de suite" est votre filet de securite : si vous ratez un jour, pratiquez absolument le lendemain, meme 2 minutes. Rater un jour est humain. Rater deux jours est le debut de l'abandon. L'IA Freenzy detecte ces interruptions et vous envoie un rappel bienveillant pour vous remettre en selle.

Objectif final : apres 66 jours (la moyenne scientifique pour ancrer une habitude), votre pratique devient automatique. Vous n'aurez plus besoin de motivation.`,
          xpReward: 15,
        },
        {
          id: 'yoga-m6-l2',
          title: 'Jeu : Les piliers des habitudes',
          duration: '4 min',
          type: 'game',
          content: 'Completez les phrases cles sur la science des habitudes.',
          gameType: 'fill-blanks',
          gameData: {
            sentences: [
              { text: 'Une habitude repose sur 3 etapes : le ___, la routine et la recompense.', answer: 'signal' },
              { text: 'La regle des ___ minutes consiste a rendre la pratique tres petite pour debuter.', answer: '2' },
              { text: 'L\'empilement d\'habitudes consiste a attacher la nouvelle habitude a une habitude ___.', answer: 'existante' },
              { text: 'Selon la science, il faut en moyenne ___ jours pour ancrer une habitude.', answer: '66' },
              { text: 'La regle "jamais ___ de suite" protege contre l\'abandon.', answer: '2' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'yoga-m6-l3',
          title: 'Quiz : Habitudes bien-etre',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos acquis sur la science des habitudes.',
          quizQuestions: [
            { question: 'Quelles sont les 3 composantes de la boucle de l\'habitude ?', options: ['Motivation, action, resultat', 'Signal, routine, recompense', 'Objectif, effort, satisfaction', 'Declencheur, motivation, succes'], correctIndex: 1, explanation: 'Signal (declencheur), routine (action) et recompense (benefice) forment la boucle de l\'habitude.' },
            { question: 'Que preconise la regle des 2 minutes ?', options: ['Mediter 2 minutes', 'Rendre l\'action initiale ultra-petite', 'Faire 2 minutes d\'effort intense', 'Attendre 2 minutes avant de pratiquer'], correctIndex: 1, explanation: 'La regle des 2 minutes consiste a rendre l\'action si petite qu\'il est impossible de refuser (ex: derouler le tapis).' },
            { question: 'Combien de jours faut-il en moyenne pour ancrer une habitude ?', options: ['21 jours', '30 jours', '66 jours', '90 jours'], correctIndex: 2, explanation: 'Les etudes recentes montrent qu\'il faut en moyenne 66 jours (pas 21 comme on le croit souvent).' },
            { question: 'Qu\'est-ce que l\'empilement d\'habitudes ?', options: ['Pratiquer 3 habitudes en meme temps', 'Attacher une nouvelle habitude a une existante', 'Empiler des cours de yoga', 'Accumuler des badges'], correctIndex: 1, explanation: 'L\'empilement d\'habitudes lie la nouvelle pratique a un comportement deja automatique.' },
            { question: 'Que faire apres avoir rate un jour de pratique ?', options: ['Abandonner le programme', 'Doubler la duree le lendemain', 'Pratiquer absolument le jour suivant, meme 2 min', 'Recommencer le programme a zero'], correctIndex: 2, explanation: 'La regle "jamais 2 de suite" : ratez un jour si necessaire, mais pratiquez absolument le lendemain.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 2 — Sport & Fitness IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursSportIA: FormationParcours = {
  id: 'sport-ia',
  title: 'Sport & Fitness IA',
  emoji: '\u{1F3CB}\u{FE0F}',
  description: 'Optimisez votre entrainement sportif grace a l\'IA : programmes personnalises, nutrition adaptee, recuperation intelligente, tracking de performances et coaching motivationnel.',
  category: 'quotidien',
  subcategory: 'sport',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#EF4444',
  diplomaTitle: 'Sport & Fitness IA',
  diplomaSubtitle: 'Certification Freenzy.io — Sport, Fitness et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Programmes d'entrainement
    {
      id: 'sport-m1',
      title: 'Programmes d\'entrainement IA',
      emoji: '\u{1F4AA}',
      description: 'Creez des programmes d\'entrainement sur mesure avec l\'intelligence artificielle.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4AA}',
      badgeName: 'Coach Debutant',
      lessons: [
        {
          id: 'sport-m1-l1',
          title: 'Votre programme sportif personnalise',
          duration: '5 min',
          type: 'text',
          content: `L'epoque des programmes sportifs generiques photocopies est revolue. L'intelligence artificielle permet desormais de creer des programmes d'entrainement parfaitement adaptes a votre profil, vos objectifs et vos contraintes — le tout en quelques secondes.

Pour generer un programme efficace, l'IA a besoin de 5 informations cles. Votre objectif principal : perte de poids, prise de muscle, endurance, souplesse ou bien-etre general. Votre niveau actuel : sedentaire, debutant, intermediaire ou avance. Votre disponibilite : nombre de seances par semaine et duree par seance. Votre equipement : salle de sport complete, materiel maison (halteres, bandes elastiques) ou aucun equipement (poids du corps). Vos limitations : blessures, douleurs chroniques, restrictions medicales.

Un programme bien structure suit le principe de periodisation : phase d'adaptation (semaines 1-2), phase de progression (semaines 3-6), phase d'intensification (semaines 7-10) et phase de decharge (semaine 11-12). Chaque phase augmente progressivement le volume et l'intensite pour eviter les plateaux et les blessures.

La repartition hebdomadaire depend de votre frequence. Pour 3 seances : full body (tout le corps a chaque seance). Pour 4 seances : upper/lower split (haut du corps / bas du corps en alternance). Pour 5-6 seances : push/pull/legs (pousser / tirer / jambes). L'IA adapte automatiquement les exercices a votre split et veille a equilibrer les groupes musculaires.

Avec Freenzy, decrivez simplement votre situation : "Je suis debutant, j'ai 3 seances de 45 minutes par semaine, je m'entraine a la maison avec des halteres et une barre de traction, mon objectif est de prendre du muscle." L'IA genere un programme complet avec exercices, series, repetitions, temps de repos et progression semaine par semaine. Elle ajoute meme des videos explicatives pour chaque mouvement et des alternatives si un exercice vous pose probleme.`,
          xpReward: 15,
        },
        {
          id: 'sport-m1-l2',
          title: 'Exercice : Creez votre programme hebdomadaire',
          duration: '5 min',
          type: 'exercise',
          content: 'Generez un programme sportif personnalise avec l\'IA.',
          exercisePrompt: `Utilisez l'IA pour creer votre programme d'entrainement hebdomadaire :

1. Definissez votre profil : objectif, niveau, frequence, equipement, limitations
2. Demandez a l'IA de generer un programme sur 1 semaine
3. Pour chaque seance, verifiez que le programme inclut :
   - Echauffement (5-10 min)
   - Corps de seance (exercices, series, repetitions, repos)
   - Retour au calme (stretching 5 min)
4. Evaluez si le programme vous semble realisable et motivant

Criteres de reussite :
- Le programme correspond a votre nombre de seances disponibles
- Chaque seance a un echauffement et un retour au calme
- Les exercices sont adaptes a votre equipement
- La progression est prevue (augmentation des charges/repetitions)`,
          xpReward: 20,
        },
        {
          id: 'sport-m1-l3',
          title: 'Quiz : Programmes d\'entrainement',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la programmation sportive IA.',
          quizQuestions: [
            { question: 'Quel split est recommande pour 3 seances par semaine ?', options: ['Push/Pull/Legs', 'Full Body', 'Upper/Lower', 'Bro Split'], correctIndex: 1, explanation: 'Le Full Body (tout le corps) est ideal pour 3 seances car chaque muscle est travaille 3 fois par semaine.' },
            { question: 'Combien d\'informations cles l\'IA a-t-elle besoin pour un programme ?', options: ['3', '5', '7', '10'], correctIndex: 1, explanation: '5 informations : objectif, niveau, disponibilite, equipement et limitations.' },
            { question: 'Que signifie "periodisation" en entrainement ?', options: ['S\'entrainer tous les jours', 'Varier les phases d\'intensite dans le temps', 'Changer de sport chaque semaine', 'Faire des pauses regulieres'], correctIndex: 1, explanation: 'La periodisation organise l\'entrainement en phases progressives pour optimiser les resultats et eviter les plateaux.' },
            { question: 'Quelle est la duree recommandee pour un echauffement ?', options: ['1-2 minutes', '5-10 minutes', '15-20 minutes', '30 minutes'], correctIndex: 1, explanation: '5 a 10 minutes d\'echauffement preparent les articulations, muscles et systeme cardiovasculaire.' },
            { question: 'Quel split est adapte a 4 seances par semaine ?', options: ['Full Body', 'Upper/Lower', 'Push/Pull/Legs', 'Isolation'], correctIndex: 1, explanation: 'Le split Upper/Lower (haut/bas du corps en alternance) est ideal pour 4 seances hebdomadaires.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Nutrition sportive
    {
      id: 'sport-m2',
      title: 'Nutrition sportive IA',
      emoji: '\u{1F957}',
      description: 'Optimisez votre alimentation sportive avec des plans nutritionnels generes par IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F957}',
      badgeName: 'Nutrition Pro',
      lessons: [
        {
          id: 'sport-m2-l1',
          title: 'Les bases de la nutrition sportive',
          duration: '5 min',
          type: 'text',
          content: `L'entrainement ne represente que 30 pourcent de vos resultats. Les 70 pourcent restants viennent de la nutrition et du repos. L'IA revolutionne la nutrition sportive en generant des plans alimentaires personnalises qui tiennent compte de vos objectifs, allergies, preferences et budget.

Les macronutriments sont le fondement de toute nutrition sportive. Les proteines (1.6 a 2.2g par kg de poids de corps pour la prise de muscle) reparent et construisent les fibres musculaires. Les glucides (3 a 5g/kg pour activite moderee, 5 a 8g/kg pour activite intense) fournissent l'energie pour l'entrainement. Les lipides (0.8 a 1.2g/kg) soutiennent la production hormonale et l'absorption des vitamines.

Le timing nutritionnel optimise vos performances. Avant l'entrainement (1 a 2h avant) : un repas equilibre riche en glucides complexes et proteines legeres — par exemple, du riz complet avec du poulet et des legumes. Pendant l'entrainement (si plus de 60 min) : hydratation avec electrolytes, eventuellement une boisson glucidique. Apres l'entrainement (dans les 30 min) : la fenetre anabolique — proteines rapides (whey, yaourt grec) et glucides simples (banane, miel) pour lancer la recuperation.

L'hydratation est souvent negligee : visez 35ml d'eau par kg de poids de corps, plus 500ml supplementaires par heure d'exercice. Une deshydratation de seulement 2 pourcent reduit les performances de 10 a 20 pourcent.

Avec Freenzy, demandez un plan nutritionnel complet : "Je pese 75kg, je m'entraine 4 fois par semaine en musculation, objectif prise de muscle, budget 50 euros par semaine, je n'aime pas le poisson." L'IA calcule vos besoins caloriques, repartit les macros, propose des menus sur 7 jours avec liste de courses, et suggere des recettes simples et rapides. Elle adapte tout en fonction de vos jours d'entrainement (plus de glucides) et de repos (plus de lipides).

L'IA peut aussi analyser votre alimentation actuelle : photographiez votre assiette ou decrivez votre repas, et Freenzy estime les macros et suggere des ajustements.`,
          xpReward: 15,
        },
        {
          id: 'sport-m2-l2',
          title: 'Jeu : Associez nutriments et roles',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque macronutriment a son role principal.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Proteines', right: 'Reparation et construction musculaire' },
              { left: 'Glucides complexes', right: 'Energie durable pour l\'entrainement' },
              { left: 'Lipides', right: 'Production hormonale et vitamines' },
              { left: 'Eau + electrolytes', right: 'Hydratation et performance' },
              { left: 'Glucides simples post-effort', right: 'Recuperation rapide' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'sport-m2-l3',
          title: 'Quiz : Nutrition sportive',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos connaissances en nutrition sportive.',
          quizQuestions: [
            { question: 'Quel pourcentage des resultats sportifs depend de la nutrition ?', options: ['30%', '50%', '70%', '90%'], correctIndex: 2, explanation: 'La nutrition et le repos representent environ 70% des resultats, l\'entrainement 30%.' },
            { question: 'Quelle quantite de proteines pour la prise de muscle (par kg) ?', options: ['0.5 a 1g/kg', '1.6 a 2.2g/kg', '3 a 4g/kg', '5g/kg'], correctIndex: 1, explanation: '1.6 a 2.2g de proteines par kg de poids de corps est la fourchette optimale pour la prise de muscle.' },
            { question: 'Quand se situe la "fenetre anabolique" ?', options: ['Avant l\'entrainement', 'Pendant l\'entrainement', 'Dans les 30 min apres l\'effort', 'Le lendemain matin'], correctIndex: 2, explanation: 'La fenetre anabolique se situe dans les 30 minutes suivant l\'effort, moment ideal pour consommer proteines et glucides.' },
            { question: 'Une deshydratation de 2% reduit les performances de combien ?', options: ['2-5%', '10-20%', '30-40%', '50%'], correctIndex: 1, explanation: 'Seulement 2% de deshydratation suffit a reduire les performances de 10 a 20%.' },
            { question: 'Combien d\'eau par kg de poids de corps par jour (hors exercice) ?', options: ['15ml/kg', '25ml/kg', '35ml/kg', '50ml/kg'], correctIndex: 2, explanation: '35ml d\'eau par kg de poids de corps est la recommandation de base, supplementee pendant l\'effort.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Recuperation
    {
      id: 'sport-m3',
      title: 'Recuperation intelligente',
      emoji: '\u{1F6CF}\u{FE0F}',
      description: 'Optimisez votre recuperation entre les seances avec des protocoles IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F6CF}\u{FE0F}',
      badgeName: 'Recuperation Pro',
      lessons: [
        {
          id: 'sport-m3-l1',
          title: 'Les piliers de la recuperation',
          duration: '5 min',
          type: 'text',
          content: `La recuperation est la phase ou votre corps se renforce reellement. Pendant l'entrainement, vous creez des micro-lesions musculaires. C'est pendant le repos que ces fibres se reparent et deviennent plus fortes. Ignorer la recuperation, c'est annuler une grande partie de vos efforts.

Le sommeil est le pilier numero un. Pendant les phases de sommeil profond, votre corps libere l'hormone de croissance (GH) qui repare les tissus musculaires. Visez 7 a 9 heures par nuit, avec un horaire regulier. Les etudes montrent que dormir moins de 6 heures reduit la synthese proteique musculaire de 18 pourcent et augmente le risque de blessure de 60 pourcent.

Les etirements et la mobilite sont essentiels pour maintenir l'amplitude articulaire et prevenir les blessures. Apres chaque seance, consacrez 10 minutes aux etirements statiques (maintenus 30 secondes chacun) des muscles travailles. Les jours de repos, privilegiez la mobilite articulaire : cercles d'epaules, rotations de hanches, flexions de chevilles.

La recuperation active (marche, velo leger, natation douce) stimule la circulation sanguine sans creer de stress supplementaire. 20 a 30 minutes d'activite a faible intensite (frequence cardiaque inferieure a 120 bpm) accelerent l'elimination des dechets metaboliques et reduisent les courbatures.

L'auto-massage avec rouleau de mousse (foam roller) est un outil redoutable. Passez 1 a 2 minutes par groupe musculaire en roulant lentement sur les zones tendues. Evitez les articulations et les os. Cette technique reduit les courbatures de 50 pourcent selon les etudes recentes.

Avec Freenzy, l'IA analyse votre charge d'entrainement et genere un protocole de recuperation optimal. Elle detecte les signes de surentrainement (fatigue persistante, baisse de performance, irritabilite) et recommande des ajustements : jour de repos supplementaire, seance allegee, techniques de relaxation. L'IA peut aussi generer des routines d'etirement personnalisees et des protocoles de sommeil adaptes a votre chronotype.`,
          xpReward: 15,
        },
        {
          id: 'sport-m3-l2',
          title: 'Exercice : Protocole de recuperation',
          duration: '5 min',
          type: 'exercise',
          content: 'Concevez votre protocole de recuperation personnalise.',
          exercisePrompt: `Creez votre protocole de recuperation post-entrainement :

1. Retour au calme (5 min) : decrivez 3 exercices de transition
2. Etirements (10 min) : listez 6 etirements pour les principaux groupes musculaires (duree chacun)
3. Hydratation/Nutrition : detaillez ce que vous consommez dans les 30 min post-effort
4. Recuperation active (jour off) : planifiez une activite douce de 20-30 min
5. Sommeil : definissez votre routine pre-sommeil (heure, rituel, objectif d'heures)

Criteres de reussite :
- Le protocole est realisable au quotidien
- Les etirements ciblent les muscles effectivement travailles
- La nutrition post-effort inclut proteines et glucides
- Le sommeil est planifie avec un horaire regulier`,
          xpReward: 20,
        },
        {
          id: 'sport-m3-l3',
          title: 'Quiz : Recuperation sportive',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la recuperation.',
          quizQuestions: [
            { question: 'Quelle hormone est liberee pendant le sommeil profond pour reparer les muscles ?', options: ['Cortisol', 'Insuline', 'Hormone de croissance (GH)', 'Adrenaline'], correctIndex: 2, explanation: 'L\'hormone de croissance (GH) est liberee pendant le sommeil profond et joue un role cle dans la reparation musculaire.' },
            { question: 'Dormir moins de 6h augmente le risque de blessure de combien ?', options: ['10%', '30%', '60%', '80%'], correctIndex: 2, explanation: 'Les etudes montrent que dormir moins de 6 heures augmente le risque de blessure de 60%.' },
            { question: 'Combien de temps maintenir un etirement statique ?', options: ['5 secondes', '15 secondes', '30 secondes', '2 minutes'], correctIndex: 2, explanation: '30 secondes est la duree optimale pour un etirement statique, permettant au muscle de se relacher.' },
            { question: 'Le foam roller reduit les courbatures de combien ?', options: ['10%', '25%', '50%', '75%'], correctIndex: 2, explanation: 'Les etudes montrent que le foam rolling reduit les courbatures d\'environ 50%.' },
            { question: 'Quelle est la frequence cardiaque cible pour la recuperation active ?', options: ['Moins de 100 bpm', 'Moins de 120 bpm', 'Moins de 150 bpm', 'Moins de 170 bpm'], correctIndex: 1, explanation: 'La recuperation active se fait a faible intensite, frequence cardiaque inferieure a 120 bpm.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Tracking performances
    {
      id: 'sport-m4',
      title: 'Tracking de performances',
      emoji: '\u{1F4CA}',
      description: 'Suivez et analysez vos performances sportives avec des outils IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Data Athlete',
      lessons: [
        {
          id: 'sport-m4-l1',
          title: 'Mesurer pour progresser',
          duration: '5 min',
          type: 'text',
          content: `Ce qui ne se mesure pas ne s'ameliore pas. Le suivi de vos performances sportives est la difference entre progresser methodiquement et stagner indefiniment. L'IA transforme le tracking sportif en rendant l'analyse accessible a tous, pas seulement aux athletes professionnels.

Les metriques fondamentales a suivre dependent de votre objectif. Pour la musculation : charges soulevees, nombre de series et repetitions, volume total (charge x repetitions x series), progression mensuelle. Pour le cardio : distance, duree, frequence cardiaque moyenne, allure au kilometre, VO2max estimee. Pour la perte de poids : poids (hebdomadaire, pas quotidien), tour de taille, photos mensuelles (plus fiables que la balance).

Le carnet d'entrainement est votre outil de base. Pour chaque seance, notez : date, exercices realises, charges utilisees, series/repetitions effectuees (pas planifiees), sensations (energie, douleur, motivation sur une echelle de 1 a 10), duree totale et qualite du sommeil de la veille. Ces donnees permettent a l'IA d'identifier des patterns et d'optimiser votre programme.

L'IA excelle dans la detection de tendances invisibles a l'oeil nu. Elle peut reperer que vos performances baissent systematiquement le mercredi (fatigue milieu de semaine), que vos meilleures seances suivent une nuit de 8h+ de sommeil, ou que vous stagnez sur le developpe couche depuis 3 semaines (signal pour changer de strategie).

Avec Freenzy, dictez simplement votre seance apres l'entrainement : "Aujourd'hui squat 4x8 a 80kg, presse a cuisses 3x12 a 120kg, fentes 3x10 par jambe avec 12kg, mollets 4x15 au poids de corps. Sensation 7/10, sommeil 6h." L'IA enregistre, calcule le volume total, compare avec les seances precedentes et vous donne un feedback instantane sur votre progression.

Les rapports hebdomadaires et mensuels generes par l'IA synthetisent vos donnees en graphiques clairs : courbes de progression, repartition du volume par groupe musculaire, correlation sommeil-performance, et recommandations pour la semaine suivante.`,
          xpReward: 15,
        },
        {
          id: 'sport-m4-l2',
          title: 'Jeu : Ordonnez les etapes du tracking',
          duration: '4 min',
          type: 'game',
          content: 'Remettez dans l\'ordre le processus de tracking sportif.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Definir vos objectifs et les metriques cles',
              'Enregistrer chaque seance (exercices, charges, sensations)',
              'Analyser les tendances avec l\'IA (hebdomadaire)',
              'Ajuster le programme selon les donnees',
              'Evaluer les resultats mensuels et fixer de nouveaux objectifs',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'sport-m4-l3',
          title: 'Quiz : Tracking sportif',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le suivi de performances.',
          quizQuestions: [
            { question: 'A quelle frequence faut-il se peser pour un suivi fiable ?', options: ['Tous les jours', 'Toutes les semaines', 'Tous les mois', 'Tous les 3 mois'], correctIndex: 1, explanation: 'Le poids hebdomadaire evite les fluctuations quotidiennes (eau, alimentation) et donne une tendance fiable.' },
            { question: 'Comment calculer le volume d\'entrainement ?', options: ['Charge x repetitions', 'Charge x repetitions x series', 'Duree x intensite', 'Nombre d\'exercices x duree'], correctIndex: 1, explanation: 'Volume = charge x repetitions x series. C\'est la metrique cle pour mesurer la charge d\'entrainement.' },
            { question: 'Quel element noter en plus des charges et repetitions ?', options: ['La temperature', 'Les sensations et le sommeil', 'Le nombre de pas', 'La meteo'], correctIndex: 1, explanation: 'Les sensations (energie, douleur, motivation) et le sommeil sont des donnees essentielles pour l\'analyse IA.' },
            { question: 'Quelle mesure est plus fiable que la balance pour la composition corporelle ?', options: ['L\'IMC', 'Les photos mensuelles', 'Le nombre de calories', 'La frequence cardiaque'], correctIndex: 1, explanation: 'Les photos mensuelles montrent les changements de composition corporelle que la balance ne revele pas (perte de gras + gain de muscle).' },
            { question: 'A quoi sert un rapport mensuel IA ?', options: ['Comparer avec d\'autres sportifs', 'Synthetiser les tendances et recommander des ajustements', 'Calculer les calories brulees', 'Prescrire des complements'], correctIndex: 1, explanation: 'Le rapport mensuel synthetise vos donnees en tendances claires et fournit des recommandations actionables.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Motivation et mental
    {
      id: 'sport-m5',
      title: 'Motivation et mental',
      emoji: '\u{1F525}',
      description: 'Restez motive et renforcez votre mental sportif avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F525}',
      badgeName: 'Mental d\'Acier',
      lessons: [
        {
          id: 'sport-m5-l1',
          title: 'La psychologie de la motivation sportive',
          duration: '5 min',
          type: 'text',
          content: `La motivation est le facteur numero un qui determine le succes ou l'abandon d'un programme sportif. Les statistiques sont brutales : 80 pourcent des personnes qui commencent un programme sportif abandonnent dans les 3 premiers mois. L'IA peut inverser cette tendance en agissant sur les leviers psychologiques de la motivation.

Il existe deux types de motivation. La motivation extrinsèque vient de l'exterieur : compliments, apparence, competition, recompenses. Elle est puissante mais fragile — elle disparait quand la source externe s'arrete. La motivation intrinseque vient de l'interieur : plaisir de l'effort, satisfaction personnelle, sentiment de competence. C'est elle qui fait la difference a long terme.

La technique des micro-objectifs est redoutablement efficace. Au lieu de "perdre 10 kilos", fixez-vous "faire 3 seances cette semaine". Au lieu de "courir un marathon", visez "courir 5 minutes sans s'arreter". Chaque micro-objectif atteint libere de la dopamine (le neurotransmetteur du plaisir) et renforce votre identite de "personne sportive".

La visualisation mentale est utilisee par les athletes de haut niveau : imaginez-vous en train de realiser votre seance, ressentez l'effort, la satisfaction apres. Des etudes montrent que la visualisation active les memes circuits neuronaux que l'action reelle et ameliore les performances de 10 a 15 pourcent.

Le dialogue interieur positif remplace les pensees sabotantes. "Je suis nul" devient "Je progresse a chaque seance". "C'est trop dur" devient "C'est un defi que je peux relever". L'IA Freenzy peut generer des affirmations personnalisees basees sur vos objectifs et vos points forts.

Avec Freenzy, l'IA agit comme un coach motivationnel intelligent. Elle celebre vos progres, detecte les baisses de motivation (seances manquees, sensations en baisse), envoie des messages de soutien adaptes et propose des ajustements pour maintenir le plaisir. Elle peut aussi creer des defis hebdomadaires personnalises pour maintenir l'engagement : "Defi semaine 5 : ajouter 2.5kg sur chaque exercice principal."

Le secret ultime : ne comptez jamais sur la motivation seule. Creez des systemes. Preparez vos affaires la veille, bloquez vos creneaux dans l'agenda, trouvez un partenaire d'entrainement. La motivation lance le mouvement. Les systemes le maintiennent.`,
          xpReward: 15,
        },
        {
          id: 'sport-m5-l2',
          title: 'Exercice : Plan de motivation personnalise',
          duration: '5 min',
          type: 'exercise',
          content: 'Construisez votre systeme de motivation sportive.',
          exercisePrompt: `Creez votre plan de motivation sportive en 5 etapes :

1. Objectif principal : definissez votre grand objectif a 3 mois
2. Micro-objectifs : decomposez en 4 objectifs hebdomadaires concrets et mesurables
3. Systemes : listez 3 automatismes pour ne jamais manquer une seance (preparation vetements, creneau fixe, partenaire)
4. Dialogue interieur : ecrivez 3 affirmations positives personnalisees
5. Recompenses : definissez 4 recompenses progressives (1 par mois) pour celebrer vos progres

Criteres de reussite :
- L'objectif principal est specifique et mesurable
- Les micro-objectifs sont realisables cette semaine
- Les systemes sont concrets et automatisables
- Les affirmations sont positives et au present ("je suis", pas "je serai")`,
          xpReward: 20,
        },
        {
          id: 'sport-m5-l3',
          title: 'Quiz : Motivation sportive',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la motivation.',
          quizQuestions: [
            { question: 'Quel pourcentage des debutants abandonne dans les 3 premiers mois ?', options: ['40%', '60%', '80%', '95%'], correctIndex: 2, explanation: '80% des personnes qui commencent un programme sportif abandonnent dans les 3 premiers mois.' },
            { question: 'Quel type de motivation est le plus durable ?', options: ['Extrinsèque', 'Intrinseque', 'Sociale', 'Financiere'], correctIndex: 1, explanation: 'La motivation intrinseque (plaisir, satisfaction personnelle) est la plus durable car elle ne depend pas de facteurs externes.' },
            { question: 'De combien la visualisation mentale ameliore les performances ?', options: ['1-5%', '10-15%', '25-30%', '50%'], correctIndex: 1, explanation: 'La visualisation mentale ameliore les performances de 10 a 15% en activant les memes circuits neuronaux.' },
            { question: 'Qu\'est-ce qui maintient l\'effort quand la motivation baisse ?', options: ['Plus de motivation', 'Les systemes et automatismes', 'La culpabilite', 'Les complements alimentaires'], correctIndex: 1, explanation: 'Les systemes (creneaux fixes, preparation, partenaire) maintiennent l\'effort quand la motivation fluctue.' },
            { question: 'Quel neurotransmetteur est libere quand on atteint un micro-objectif ?', options: ['Serotonine', 'Cortisol', 'Dopamine', 'Melatonine'], correctIndex: 2, explanation: 'La dopamine, neurotransmetteur du plaisir et de la recompense, est liberee a chaque objectif atteint.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Coaching IA avance
    {
      id: 'sport-m6',
      title: 'Coaching IA avance',
      emoji: '\u{1F3AF}',
      description: 'Utilisez l\'IA comme coach sportif complet pour optimiser tous les aspects de votre entrainement.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Athlete IA',
      lessons: [
        {
          id: 'sport-m6-l1',
          title: 'L\'IA comme coach sportif complet',
          duration: '5 min',
          type: 'text',
          content: `Le coaching sportif professionnel coute entre 50 et 150 euros par seance. L'IA democratise cet accompagnement en offrant un coaching personnalise continu pour une fraction du cout. Voyons comment tirer le maximum de votre coach IA.

Un coach IA efficace intervient sur 5 dimensions simultanement. La programmation : il cree et ajuste vos programmes en fonction de votre progression reelle. La technique : il decrit les mouvements avec precision et signale les erreurs courantes a eviter. La nutrition : il adapte votre alimentation a votre charge d'entrainement du jour. La recuperation : il surveille vos signes de fatigue et ajuste le repos. Le mental : il renforce votre motivation et gere les plateaux.

Pour des interactions optimales avec votre coach IA, soyez specifique dans vos demandes. Au lieu de "donne-moi un exercice pour les bras", dites "je stagne au curl biceps a 15kg depuis 3 semaines, j'ai mal au coude gauche quand je monte au-dessus de 12kg, propose-moi une strategie de depassement avec des exercices alternatifs sans douleur." Plus votre prompt est precis, plus la reponse sera pertinente et actionable.

Les prompts avances pour le coaching sportif incluent : l'analyse de plateau ("je n'ai pas progresse au squat depuis 4 semaines, voici mes charges et volumes..."), la gestion de blessure ("j'ai une douleur au genou droit en flexion profonde, comment adapter mon programme ?"), l'optimisation du timing ("je ne peux m'entrainer que le matin a jeun, comment adapter ma nutrition ?"), la periodisation ("je prepare un semi-marathon dans 12 semaines, je pars de zero").

Freenzy integre toutes ces dimensions dans un assistant unifie. Vous pouvez lui parler comme a un coach humain : decrire votre seance, poser des questions, demander des ajustements, exprimer vos frustrations. L'IA memorise votre historique et affine ses recommandations au fil du temps. Plus vous interagissez, plus le coaching devient precis et personnalise.

Le futur du coaching IA : integration avec les montres connectees pour un suivi en temps reel, analyse video de vos mouvements pour corriger la technique, et programmes adaptatifs qui se modifient automatiquement apres chaque seance en fonction de vos performances.`,
          xpReward: 15,
        },
        {
          id: 'sport-m6-l2',
          title: 'Jeu : Les 5 dimensions du coaching IA',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque dimension du coaching a son action.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Programmation', right: 'Creer et ajuster les programmes' },
              { left: 'Technique', right: 'Decrire les mouvements et corriger les erreurs' },
              { left: 'Nutrition', right: 'Adapter l\'alimentation a la charge du jour' },
              { left: 'Recuperation', right: 'Surveiller la fatigue et ajuster le repos' },
              { left: 'Mental', right: 'Renforcer la motivation et gerer les plateaux' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'sport-m6-l3',
          title: 'Quiz : Coaching IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos acquis sur le coaching sportif IA.',
          quizQuestions: [
            { question: 'Combien de dimensions couvre un coach IA complet ?', options: ['3', '4', '5', '7'], correctIndex: 2, explanation: '5 dimensions : programmation, technique, nutrition, recuperation et mental.' },
            { question: 'Quelle est la cle pour obtenir de bonnes reponses du coach IA ?', options: ['Poser des questions courtes', 'Etre le plus specifique possible', 'Utiliser des termes techniques', 'Envoyer des photos'], correctIndex: 1, explanation: 'Plus votre demande est specifique (contexte, historique, contraintes), plus la reponse sera pertinente.' },
            { question: 'Combien coute un coaching humain professionnel par seance ?', options: ['10-20 euros', '20-40 euros', '50-150 euros', '200-500 euros'], correctIndex: 2, explanation: 'Un coach sportif professionnel facture entre 50 et 150 euros par seance en moyenne.' },
            { question: 'Comment le coach IA s\'ameliore-t-il dans le temps ?', options: ['Mise a jour logicielle', 'Memorisation de votre historique', 'Connexion a d\'autres coachs', 'Achat de modules premium'], correctIndex: 1, explanation: 'L\'IA memorise votre historique d\'interactions et affine ses recommandations au fil du temps.' },
            { question: 'Quel prompt est le plus efficace pour le coaching IA ?', options: ['"Aide-moi a progresser"', '"Donne-moi un programme"', '"Je stagne au squat 80kg depuis 3 sem, mal au genou, propose une strategie"', '"Quels exercices pour les jambes ?"'], correctIndex: 2, explanation: 'Un prompt specifique avec contexte, historique et contraintes genere des reponses bien plus pertinentes.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 3 — Parentalite IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursParentaliteIA: FormationParcours = {
  id: 'parentalite-ia',
  title: 'Parentalite IA',
  emoji: '\u{1F46A}',
  description: 'L\'IA au service des parents : organisation familiale, education positive, aide aux devoirs, activites creatives, communication bienveillante et bien-etre parental.',
  category: 'quotidien',
  subcategory: 'famille',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F472B6',
  diplomaTitle: 'Parentalite IA',
  diplomaSubtitle: 'Certification Freenzy.io — Parentalite et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Organisation familiale
    {
      id: 'parent-m1',
      title: 'Organisation familiale IA',
      emoji: '\u{1F4C5}',
      description: 'Gerez le planning familial, les repas et la logistique avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Parent Organise',
      lessons: [
        {
          id: 'parent-m1-l1',
          title: 'L\'IA organisatrice de famille',
          duration: '5 min',
          type: 'text',
          content: `Gerer une famille, c'est gerer une petite entreprise : planning, logistique, budget, repas, rendez-vous medicaux, activites extrascolaires, courses... L'IA peut transformer ce chaos quotidien en une organisation fluide et sereine.

Le planning familial centralise est la premiere etape. Avec Freenzy, creez un tableau de bord familial qui regroupe les emplois du temps de chaque membre : ecole, travail, activites, rendez-vous. L'IA detecte les conflits (deux activites au meme moment) et propose des solutions. Elle envoie des rappels automatiques : "Demain, rendez-vous dentiste de Lucas a 14h30 — prevoir de partir a 14h."

La planification des repas est l'un des plus grands gains de temps pour les parents. Demandez a l'IA de generer un menu hebdomadaire equilibre en tenant compte des gouts de chaque enfant, des allergies, du budget et du temps de preparation disponible. "Menu familial pour 4 personnes, 2 enfants (5 et 8 ans), budget 80 euros/semaine, pas de fruits de mer, maximum 30 min de preparation par repas." L'IA genere 7 diners, 7 dejeuners et la liste de courses complete.

La gestion des taches menageres peut etre gamifiee avec l'IA. Creez un tableau de responsabilites adapte a l'age de chaque enfant : ranger sa chambre (des 4 ans), mettre la table (des 6 ans), passer l'aspirateur (des 10 ans). L'IA propose un systeme de points et de recompenses pour motiver les enfants tout en leur apprenant la responsabilite.

Le budget familial beneficie aussi de l'IA. Listez vos depenses recurrentes et l'IA identifie les postes d'economie possibles, genere des alertes avant les echeances (assurance, abonnements) et projette vos depenses sur les mois a venir. Elle anticipe meme les depenses saisonnieres : rentree scolaire, vacances, anniversaires, Noel.

Astuce Freenzy : creez un prompt-template "reunion familiale du dimanche" ou l'IA genere un ordre du jour base sur les evenements de la semaine a venir, les decisions a prendre ensemble et les celebrations (bons resultats scolaires, reussites sportives).`,
          xpReward: 15,
        },
        {
          id: 'parent-m1-l2',
          title: 'Exercice : Creez votre tableau de bord familial',
          duration: '5 min',
          type: 'exercise',
          content: 'Organisez votre semaine familiale avec l\'IA.',
          exercisePrompt: `Concevez votre tableau de bord familial en utilisant l'IA :

1. Membres : listez chaque membre de la famille avec ses activites regulieres
2. Planning : demandez a l'IA de generer un planning hebdomadaire integre
3. Repas : generez un menu de 5 diners adapte a votre famille (gouts, allergies, budget)
4. Taches : creez un tableau de responsabilites adapte a l'age de chaque enfant
5. Budget : identifiez 3 postes de depenses a optimiser ce mois-ci

Criteres de reussite :
- Le planning integre les emplois du temps de tous les membres
- Le menu tient compte des contraintes alimentaires reelles
- Les taches sont adaptees a l'age de chaque enfant
- Au moins une piste d'economie concrete est identifiee`,
          xpReward: 20,
        },
        {
          id: 'parent-m1-l3',
          title: 'Quiz : Organisation familiale',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'organisation familiale IA.',
          quizQuestions: [
            { question: 'Quel est le premier outil a mettre en place pour une famille organisee ?', options: ['Un budget detaille', 'Un planning familial centralise', 'Une liste de courses', 'Un tableau de punitions'], correctIndex: 1, explanation: 'Le planning centralise est la base : il regroupe les emplois du temps de tous les membres et detecte les conflits.' },
            { question: 'A partir de quel age un enfant peut-il ranger sa chambre ?', options: ['2 ans', '4 ans', '8 ans', '12 ans'], correctIndex: 1, explanation: 'Des 4 ans, un enfant peut commencer a ranger ses jouets et sa chambre avec de l\'aide.' },
            { question: 'Que doit inclure un menu familial genere par IA ?', options: ['Uniquement les diners', 'Gouts, allergies, budget et temps de preparation', 'Seulement les plats sains', 'Les recettes les plus rapides'], correctIndex: 1, explanation: 'Un bon menu IA integre les gouts de chacun, les allergies, le budget et le temps de preparation disponible.' },
            { question: 'Comment motiver les enfants aux taches menageres ?', options: ['Les punir s\'ils refusent', 'Gamifier avec un systeme de points', 'Tout faire soi-meme', 'Attendre qu\'ils soient plus grands'], correctIndex: 1, explanation: 'Un systeme de points et recompenses motive les enfants tout en leur apprenant la responsabilite.' },
            { question: 'Quand l\'IA anticipe-t-elle les depenses saisonnieres ?', options: ['Jamais', 'Uniquement a Noel', 'Tout au long de l\'annee', 'Seulement a la rentree'], correctIndex: 2, explanation: 'L\'IA anticipe les depenses saisonnieres tout au long de l\'annee : rentree, vacances, anniversaires, Noel.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Education positive
    {
      id: 'parent-m2',
      title: 'Education positive avec l\'IA',
      emoji: '\u{2764}\u{FE0F}',
      description: 'Apprenez les principes de l\'education positive et utilisez l\'IA pour les appliquer.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{2764}\u{FE0F}',
      badgeName: 'Educateur Bienveillant',
      lessons: [
        {
          id: 'parent-m2-l1',
          title: 'Les piliers de l\'education positive',
          duration: '5 min',
          type: 'text',
          content: `L'education positive, aussi appelee parentalite bienveillante, est une approche validee par les neurosciences qui favorise le developpement harmonieux de l'enfant tout en maintenant un cadre clair. L'IA peut vous aider a l'appliquer au quotidien meme quand vous etes fatigue ou deborde.

Le premier pilier est l'empathie : se mettre a la place de l'enfant avant de reagir. Un enfant qui fait une colere n'est pas "mechant" — son cerveau prefrontal (centre de la regulation emotionnelle) n'est pas mature avant 25 ans. Quand votre enfant crie, l'IA peut vous suggerer des formulations empathiques : "Je vois que tu es tres en colere. C'est difficile quand on ne peut pas avoir ce qu'on veut. Viens, on va en parler."

Le deuxieme pilier est le cadre ferme mais bienveillant. Dire non avec empathie : "Je comprends que tu veuilles rester debout, mais ton corps a besoin de dormir pour grandir. On peut lire une histoire avant de dormir." L'IA Freenzy peut generer des dizaines de formulations adaptees a l'age de votre enfant et a la situation specifique.

Le troisieme pilier est l'encouragement plutot que la punition. Au lieu de "tu es puni parce que tu as tape ta soeur", essayez "dans notre famille, on ne tape pas. Comment te sentais-tu pour en arriver la ? Comment pourrais-tu reagir differemment la prochaine fois ?" L'IA vous propose des alternatives aux punitions : consequences naturelles, reparation, temps de pause volontaire.

Le quatrieme pilier est la valorisation des efforts plutot que des resultats. "Tu as beaucoup travaille sur ce dessin !" est plus constructif que "c'est beau" car cela developpe la perseverance plutot que la dependance aux compliments.

Avec Freenzy, gardez un journal parental ou vous notez les situations difficiles de la journee. L'IA analyse vos descriptions et propose des strategies adaptees. Exemple : "Mon fils de 7 ans refuse de faire ses devoirs tous les soirs." L'IA propose 5 approches concretes basees sur l'education positive, en tenant compte de l'age et du temperament de votre enfant.

La cle : l'education positive n'est pas la permissivite. C'est poser des limites avec respect et aider l'enfant a developper son autoregulation.`,
          xpReward: 15,
        },
        {
          id: 'parent-m2-l2',
          title: 'Jeu : Reformulez en positif',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque phrase negative a sa reformulation positive.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: '"Arrete de crier !"', right: '"Parle doucement, je t\'ecoute"' },
              { left: '"Tu es mechant"', right: '"Ce comportement n\'est pas acceptable"' },
              { left: '"C\'est nul ton dessin"', right: '"Raconte-moi ce que tu as dessine"' },
              { left: '"Tu es puni, va dans ta chambre"', right: '"On va prendre un temps de pause ensemble"' },
              { left: '"Depeche-toi !"', right: '"On part dans 5 minutes, que te reste-t-il a faire ?"' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'parent-m2-l3',
          title: 'Quiz : Education positive',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur l\'education positive.',
          quizQuestions: [
            { question: 'A quel age le cerveau prefrontal atteint sa maturite ?', options: ['7 ans', '12 ans', '18 ans', '25 ans'], correctIndex: 3, explanation: 'Le cortex prefrontal, centre de la regulation emotionnelle et de la prise de decision, mature vers 25 ans.' },
            { question: 'Quel est le premier pilier de l\'education positive ?', options: ['La discipline', 'L\'empathie', 'La recompense', 'L\'autorite'], correctIndex: 1, explanation: 'L\'empathie — se mettre a la place de l\'enfant — est le fondement de l\'education positive.' },
            { question: 'Que privilegier : les efforts ou les resultats ?', options: ['Les resultats uniquement', 'Les efforts', 'Ni l\'un ni l\'autre', 'Les deux egalement'], correctIndex: 1, explanation: 'Valoriser les efforts developpe la perseverance, tandis que valoriser les resultats cree une dependance aux compliments.' },
            { question: 'L\'education positive est-elle permissive ?', options: ['Oui, tout est permis', 'Non, elle pose des limites avec respect', 'Oui, on ne dit jamais non', 'Ca depend de l\'enfant'], correctIndex: 1, explanation: 'L\'education positive n\'est pas permissive : elle pose des limites claires tout en respectant l\'enfant.' },
            { question: 'Quelle alternative a la punition l\'education positive propose-t-elle ?', options: ['Ignorer le comportement', 'Consequences naturelles et reparation', 'Recompenser quand meme', 'Negocier a chaque fois'], correctIndex: 1, explanation: 'Les consequences naturelles et la reparation enseignent la responsabilite mieux que les punitions.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Aide aux devoirs
    {
      id: 'parent-m3',
      title: 'Aide aux devoirs avec l\'IA',
      emoji: '\u{1F4DA}',
      description: 'Utilisez l\'IA pour aider vos enfants dans leurs devoirs sans faire a leur place.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4DA}',
      badgeName: 'Tuteur Patient',
      lessons: [
        {
          id: 'parent-m3-l1',
          title: 'L\'IA tuteur : guider sans donner la reponse',
          duration: '5 min',
          type: 'text',
          content: `L'aide aux devoirs est l'un des moments les plus stressants pour les parents. L'IA offre une solution elegante : un tuteur patient qui guide l'enfant vers la reponse sans jamais la donner directement, tout en adaptant ses explications au niveau de comprehension de l'enfant.

Le principe fondamental est la methode socratique : poser des questions plutot que donner des reponses. Quand votre enfant bloque sur un probleme de maths, au lieu de dire "la reponse est 42", l'IA demande : "Qu'est-ce que tu connais deja ? Quel calcul pourrais-tu essayer en premier ? Est-ce que ce probleme ressemble a un autre que tu as deja resolu ?" Cette approche developpe la pensee critique et l'autonomie.

Pour utiliser Freenzy comme tuteur, formulez le prompt ainsi : "Mon fils de 10 ans bloque sur ce probleme de maths : [enonce]. Explique-lui etape par etape avec des mots simples, sans donner la reponse finale. Utilise des exemples concrets de la vie quotidienne." L'IA adapte automatiquement le vocabulaire et la complexite a l'age indique.

Les matieres ou l'IA excelle comme tuteur : les mathematiques (decomposition d'un probleme en etapes), le francais (regles de grammaire avec exemples), les sciences (explication de concepts avec analogies), l'histoire-geographie (contextualisation et chronologie), les langues etrangeres (exercices de conjugaison, vocabulaire, prononciation).

Pour les dissertations et redactions, l'IA aide a structurer la pensee sans ecrire a la place de l'enfant. "Mon enfant doit ecrire une redaction sur les saisons. Aide-le a trouver des idees en lui posant des questions : qu'observe-t-il au printemps ? Quels vetements porte-t-il en hiver ? Quels fruits mange-t-il en ete ?"

Attention aux limites : l'IA ne doit jamais remplacer l'effort de l'enfant. Le but est de debloquer, pas de faire le travail. Fixez une regle : l'enfant doit d'abord essayer seul pendant 10 minutes avant de demander de l'aide. L'IA intervient en second recours, apres la reflexion personnelle.

Bonus : l'IA peut creer des exercices supplementaires adaptes au programme scolaire de votre enfant pour renforcer les points faibles identifies.`,
          xpReward: 15,
        },
        {
          id: 'parent-m3-l2',
          title: 'Exercice : Promptez le tuteur IA',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez des prompts efficaces pour l\'aide aux devoirs.',
          exercisePrompt: `Redigez 3 prompts pour utiliser l'IA comme tuteur dans differentes matieres :

1. Mathematiques : un probleme sur lequel votre enfant bloque (indiquez age, niveau, enonce)
2. Francais : une regle de grammaire a expliquer simplement (indiquez la regle et l'age)
3. Sciences : un concept a vulgariser (indiquez le concept et l'age)

Pour chaque prompt, incluez :
- L'age et le niveau scolaire de l'enfant
- L'enonce precis ou le concept a travailler
- L'instruction "explique sans donner la reponse"
- Une demande d'exemples concrets du quotidien

Criteres de reussite :
- Chaque prompt contient l'age de l'enfant
- L'instruction de ne pas donner la reponse est presente
- Les exemples demandes sont adaptes au monde de l'enfant
- Le ton est bienveillant et encourageant`,
          xpReward: 20,
        },
        {
          id: 'parent-m3-l3',
          title: 'Quiz : Aide aux devoirs IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le tutorat IA.',
          quizQuestions: [
            { question: 'Quelle methode pedagogique l\'IA tuteur utilise-t-elle ?', options: ['Methode magistrale', 'Methode socratique', 'Methode Montessori', 'Methode repetitive'], correctIndex: 1, explanation: 'La methode socratique consiste a guider l\'enfant par des questions plutot que de donner les reponses.' },
            { question: 'Combien de temps l\'enfant doit-il essayer seul avant de demander l\'IA ?', options: ['0 minute', '5 minutes', '10 minutes', '30 minutes'], correctIndex: 2, explanation: '10 minutes d\'effort personnel avant d\'utiliser l\'IA preservent l\'apprentissage et l\'autonomie.' },
            { question: 'Que doit inclure un bon prompt pour le tuteur IA ?', options: ['Juste l\'enonce', 'Age, niveau, enonce et instruction de ne pas donner la reponse', 'La reponse attendue', 'Le nom du professeur'], correctIndex: 1, explanation: 'Un prompt efficace precise l\'age, le niveau, l\'enonce exact et l\'instruction de guider sans donner la reponse.' },
            { question: 'Pour les redactions, comment l\'IA aide-t-elle ?', options: ['Elle ecrit le texte', 'Elle corrige les fautes uniquement', 'Elle aide a structurer les idees par des questions', 'Elle donne un plan tout fait'], correctIndex: 2, explanation: 'L\'IA aide a structurer la pensee en posant des questions, sans ecrire a la place de l\'enfant.' },
            { question: 'L\'IA peut-elle creer des exercices supplementaires ?', options: ['Non, elle aide uniquement sur les devoirs donnes', 'Oui, adaptes au programme scolaire', 'Seulement en maths', 'Uniquement pour le college'], correctIndex: 1, explanation: 'L\'IA peut generer des exercices supplementaires adaptes au programme et au niveau de l\'enfant.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Activites creatives
    {
      id: 'parent-m4',
      title: 'Activites creatives en famille',
      emoji: '\u{1F3A8}',
      description: 'Generez des idees d\'activites creatives et educatives adaptees a l\'age de vos enfants.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3A8}',
      badgeName: 'Parent Creatif',
      lessons: [
        {
          id: 'parent-m4-l1',
          title: 'L\'IA generatrice d\'activites familiales',
          duration: '5 min',
          type: 'text',
          content: `"Maman, papa, on fait quoi ?" — cette question revient chaque weekend et chaque vacance. L'IA est votre arme secrete pour ne jamais etre a court d'idees. Elle genere des activites creatives, educatives et amusantes adaptees a l'age de vos enfants, a la meteo et au materiel dont vous disposez.

Les categories d'activites que l'IA peut generer sont infinies. Les activites manuelles : peinture, pate a modeler, origami, bricolage avec des materiaux recycles, creation de bijoux, couture simple, poterie a froid. Les jeux educatifs : chasses au tresor thematiques, experiences scientifiques maison, jeux de societe a imprimer, quiz personnalises. Les activites nature : herbier, observation d'insectes, jardinage, course d'orientation dans le parc.

Le prompt ideal pour generer des activites : "Mon enfant a 6 ans, il pleut dehors, on a du papier, des ciseaux, de la colle et des feutres. Propose 5 activites creatives de 30 minutes chacune avec les instructions etape par etape." L'IA genere des instructions detaillees, comme si vous aviez un animateur de centre de loisirs a domicile.

Les experiences scientifiques maison sont un tresor pedagogique. L'IA peut detailler des dizaines d'experiences avec des ingredients du quotidien : le volcan au bicarbonate (vinaigre + bicarbonate + colorant), la lampe a lave (huile + eau + pastille effervescente), le slime (colle PVA + borax), les cristaux de sel (eau saturee en sel + fil). Pour chaque experience, l'IA explique le principe scientifique de maniere adaptee a l'age.

Les activites intergenerationnelles renforcent les liens familiaux. L'IA peut creer des projets qui impliquent toute la famille : un album photo commente, un arbre genealogique illustre, un livre de recettes familiales, un spectacle de marionnettes avec histoire ecrite ensemble.

L'IA adapte la complexite selon l'age : activites sensorielles pour les 2-4 ans (peinture avec les doigts, pate a sel), construction et creation pour les 5-8 ans (Lego libre, dessin guide, bricolage), projets aboutis pour les 9-12 ans (stop motion, journal intime decore, maquette). Elle peut meme combiner les niveaux pour occuper des fratries d'ages differents avec la meme activite.`,
          xpReward: 15,
        },
        {
          id: 'parent-m4-l2',
          title: 'Jeu : Associez activites et ages',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque type d\'activite a la tranche d\'age adaptee.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Peinture avec les doigts', right: '2-4 ans' },
              { left: 'Origami simple', right: '5-8 ans' },
              { left: 'Experience du volcan', right: '6-10 ans' },
              { left: 'Stop motion video', right: '9-12 ans' },
              { left: 'Journal creatif decore', right: '10-14 ans' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'parent-m4-l3',
          title: 'Quiz : Activites creatives',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les activites familiales IA.',
          quizQuestions: [
            { question: 'Que faut-il preciser dans un prompt pour generer des activites ?', options: ['Juste l\'age', 'Age, meteo, materiel disponible et duree', 'Le budget uniquement', 'Le nombre d\'enfants'], correctIndex: 1, explanation: 'Un bon prompt inclut l\'age, la meteo (interieur/exterieur), le materiel disponible et la duree souhaitee.' },
            { question: 'Quel ingredient commun permet de faire un "volcan" maison ?', options: ['Sel et poivre', 'Vinaigre et bicarbonate', 'Sucre et levure', 'Farine et eau'], correctIndex: 1, explanation: 'Le vinaigre melange au bicarbonate de soude cree une reaction effervescente spectaculaire.' },
            { question: 'Les activites sensorielles sont adaptees a quelle tranche d\'age ?', options: ['0-2 ans', '2-4 ans', '5-8 ans', '9-12 ans'], correctIndex: 1, explanation: 'Les activites sensorielles (peinture doigts, pate a sel, textures) sont ideales pour les 2-4 ans.' },
            { question: 'Quel est l\'interet des activites intergenerationnelles ?', options: ['Occuper les grands-parents', 'Renforcer les liens familiaux', 'Economiser de l\'argent', 'Apprendre la cuisine'], correctIndex: 1, explanation: 'Les projets impliquant toute la famille (album photo, arbre genealogique) renforcent les liens et la memoire familiale.' },
            { question: 'Comment adapter une meme activite a des ages differents ?', options: ['C\'est impossible', 'L\'IA ajuste la complexite pour chaque age', 'On fait des groupes separes', 'Seul l\'aine participe'], correctIndex: 1, explanation: 'L\'IA peut proposer differents niveaux de complexite pour la meme activite, adaptee a chaque enfant.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Communication familiale
    {
      id: 'parent-m5',
      title: 'Communication familiale',
      emoji: '\u{1F4AC}',
      description: 'Ameliorez la communication au sein de votre famille grace aux outils IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4AC}',
      badgeName: 'Communicateur Familial',
      lessons: [
        {
          id: 'parent-m5-l1',
          title: 'L\'art de communiquer en famille',
          duration: '5 min',
          type: 'text',
          content: `La communication est le ciment de la famille. Pourtant, entre les ecrans, le stress du travail et la fatigue, les echanges de qualite se rarefient. L'IA peut vous aider a restaurer et enrichir la communication familiale au quotidien.

La Communication Non Violente (CNV) est un outil transformateur pour les familles. Elle suit 4 etapes : Observation (decrire les faits sans jugement), Sentiment (exprimer ce que l'on ressent), Besoin (identifier le besoin sous-jacent), Demande (formuler une demande concrete). Exemple : "Quand je vois des jouets partout dans le salon (observation), je me sens fatigue (sentiment) parce que j'ai besoin d'ordre pour me detendre (besoin). Est-ce que tu pourrais ranger tes jouets avant le diner (demande) ?"

L'IA Freenzy peut reformuler n'importe quelle phrase en mode CNV. Tapez votre reaction spontanee (souvent maladroite sous le stress) et l'IA la transforme : "Range ta chambre immediatement !" devient "Je vois que ta chambre est en desordre. J'ai besoin que les espaces communs soient ranges pour que tout le monde se sente bien. Tu peux ranger avant le gouter ?"

Les rituels de communication structurent les echanges familiaux. Le "temps des roses et des epines" au diner : chaque membre partage la meilleure chose (rose) et la plus difficile (epine) de sa journee. Le "conseil de famille" hebdomadaire : 20 minutes ou chacun peut exprimer un besoin ou proposer une idee. L'IA genere des questions d'amorce adaptees a l'age des enfants.

L'ecoute active est une competence que l'IA peut vous aider a developper. Reformuler ce que l'enfant dit montre que vous l'avez entendu : "Si je comprends bien, tu es triste parce que ton ami ne veut plus jouer avec toi. C'est ca ?" Cette simple technique reduit les conflits de 50 pourcent car l'enfant se sent compris.

Pour les conflits entre freres et soeurs, l'IA propose des techniques de mediation adaptees a l'age. Au lieu d'arbitrer (ce qui cree frustration chez le "perdant"), guidez les enfants vers une resolution autonome : "Vous voulez tous les deux la tablette. Comment pourriez-vous trouver une solution juste pour les deux ?" L'IA genere des scenarios de mediation et des compromis possibles.

Conseil Freenzy : creez un "dictionnaire des emotions" familial avec l'IA. Generez des cartes illustrees representant 30 emotions (joie, tristesse, colere, peur, fierte, jalousie...) pour aider vos enfants a nommer ce qu'ils ressentent.`,
          xpReward: 15,
        },
        {
          id: 'parent-m5-l2',
          title: 'Exercice : Pratiquez la CNV en famille',
          duration: '5 min',
          type: 'exercise',
          content: 'Reformulez des situations quotidiennes en Communication Non Violente.',
          exercisePrompt: `Pratiquez la Communication Non Violente sur 3 situations parentales courantes :

1. Situation 1 : Votre enfant refuse de faire ses devoirs
   - Ecrivez votre reaction spontanee (sans filtre)
   - Reformulez en CNV : Observation / Sentiment / Besoin / Demande

2. Situation 2 : Vos deux enfants se disputent pour un jouet
   - Ecrivez votre reaction spontanee
   - Reformulez en CNV et proposez une mediation

3. Situation 3 : Votre ado passe trop de temps sur son telephone
   - Ecrivez votre reaction spontanee
   - Reformulez en CNV avec une demande negociable

Criteres de reussite :
- Chaque reformulation contient les 4 etapes CNV
- Les observations sont factuelles (pas de jugements)
- Les sentiments sont exprimes au "je" (pas "tu me rends...")
- Les demandes sont concretes et realisables`,
          xpReward: 20,
        },
        {
          id: 'parent-m5-l3',
          title: 'Quiz : Communication familiale',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances en communication familiale.',
          quizQuestions: [
            { question: 'Quelles sont les 4 etapes de la CNV ?', options: ['Accuser, punir, pardonner, oublier', 'Observer, ressentir, identifier le besoin, demander', 'Ecouter, parler, negocier, accepter', 'Analyser, juger, corriger, valider'], correctIndex: 1, explanation: 'La CNV suit 4 etapes : Observation, Sentiment, Besoin, Demande — sans jugement ni accusation.' },
            { question: 'Qu\'est-ce que le "temps des roses et des epines" ?', options: ['Un jeu de cartes', 'Un rituel ou chacun partage le meilleur et le pire de sa journee', 'Un cours de jardinage', 'Une punition educative'], correctIndex: 1, explanation: 'Ce rituel du diner permet a chaque membre de partager sa rose (meilleur moment) et son epine (moment difficile).' },
            { question: 'L\'ecoute active reduit les conflits de combien ?', options: ['10%', '25%', '50%', '75%'], correctIndex: 2, explanation: 'L\'ecoute active (reformuler ce que l\'autre dit) reduit les conflits d\'environ 50% car chacun se sent compris.' },
            { question: 'Comment gerer un conflit entre freres et soeurs ?', options: ['Punir les deux', 'Donner raison a l\'aine', 'Guider vers une resolution autonome', 'Les separer toute la journee'], correctIndex: 2, explanation: 'Guider les enfants vers une resolution autonome developpe leurs competences sociales et evite la frustration.' },
            { question: 'A quoi sert un "dictionnaire des emotions" familial ?', options: ['A connaitre les emotions en anglais', 'A aider les enfants a nommer ce qu\'ils ressentent', 'A classer les emotions par importance', 'A interdire certaines emotions'], correctIndex: 1, explanation: 'Nommer ses emotions est la premiere etape pour les reguler. Un support visuel aide les enfants a identifier ce qu\'ils ressentent.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Bien-etre parental
    {
      id: 'parent-m6',
      title: 'Bien-etre parental',
      emoji: '\u{1F33B}',
      description: 'Prenez soin de vous en tant que parent avec l\'aide bienveillante de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F33B}',
      badgeName: 'Parent Epanoui',
      lessons: [
        {
          id: 'parent-m6-l1',
          title: 'Prendre soin de soi pour mieux prendre soin des autres',
          duration: '5 min',
          type: 'text',
          content: `Le burnout parental est une realite qui touche 5 a 8 pourcent des parents, avec des consequences sur toute la famille. Prendre soin de soi n'est pas de l'egoisme — c'est une necessite pour etre un parent present et bienveillant. L'IA peut vous aider a preserver votre equilibre.

Les signes d'alerte du burnout parental : epuisement emotionnel persistant (pas juste la fatigue d'une mauvaise nuit), detachement affectif envers les enfants ("je n'en peux plus"), perte de plaisir dans le role parental, sentiment d'incompetence chronique. Si vous reconnaissez ces signes, l'IA peut vous aider a mettre en place des strategies immediates, mais consulter un professionnel reste indispensable en cas de detresse.

La technique du "masque a oxygene" : comme dans l'avion, vous devez d'abord mettre votre propre masque avant d'aider les autres. Concretement, bloquez chaque semaine 2 a 3 creneaux de 30 minutes rien que pour vous. L'IA peut vous aider a organiser votre emploi du temps pour trouver ces creneaux et proposer des activites ressourcantes adaptees a vos gouts.

La gestion du stress parental passe par des outils concrets. La micro-meditation de 3 minutes quand les enfants sont a l'ecole ou en pause. Le journal de gratitude parental : chaque soir, notez 3 moments agreables avec vos enfants (meme minuscules). La respiration 4-7-8 quand la tension monte. L'IA genere des rappels et des exercices adaptes a votre journee.

Le couple parental (quand il y a un co-parent) a besoin d'attention reguliere. L'IA peut suggerer des sujets de discussion pour un "rendez-vous couple" hebdomadaire de 20 minutes : pas les enfants, pas la logistique, mais vos reves, vos souvenirs, vos projets a deux. Elle peut aussi generer des idees de sorties en duo adaptees a votre budget et vos gouts.

La communaute parentale est un soutien precieux. L'IA peut vous aider a identifier des groupes de parents locaux, des forums en ligne de confiance, ou simplement a formuler vos preoccupations pour en discuter avec d'autres parents. Partager ses difficultes reduit le sentiment d'isolement et normalise les hauts et les bas de la parentalite.

Rappelez-vous : un parent parfait n'existe pas. Un parent "suffisamment bon" (concept du pediatre Winnicott) est un parent qui repond aux besoins de l'enfant la plupart du temps, tout en acceptant ses propres imperfections. L'IA vous aide a etre ce parent-la, pas un parent ideal qui n'existe que dans les publicites.`,
          xpReward: 15,
        },
        {
          id: 'parent-m6-l2',
          title: 'Jeu : Les piliers du bien-etre parental',
          duration: '4 min',
          type: 'game',
          content: 'Completez les phrases cles du bien-etre parental.',
          gameType: 'fill-blanks',
          gameData: {
            sentences: [
              { text: 'Le burnout parental touche ___ a 8% des parents.', answer: '5' },
              { text: 'La technique du "masque a ___" rappelle de prendre soin de soi d\'abord.', answer: 'oxygene' },
              { text: 'Bloquez ___ a 3 creneaux de 30 minutes par semaine pour vous.', answer: '2' },
              { text: 'Le concept du parent "suffisamment ___" vient du pediatre Winnicott.', answer: 'bon' },
              { text: 'Le journal de ___ parental note 3 moments agreables chaque soir.', answer: 'gratitude' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'parent-m6-l3',
          title: 'Quiz : Bien-etre parental',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos acquis sur le bien-etre parental.',
          quizQuestions: [
            { question: 'Quel pourcentage de parents est touche par le burnout parental ?', options: ['1-2%', '5-8%', '15-20%', '30%'], correctIndex: 1, explanation: 'Le burnout parental touche 5 a 8% des parents selon les etudes.' },
            { question: 'Quel est le premier signe d\'alerte du burnout parental ?', options: ['Fatigue passagere', 'Epuisement emotionnel persistant', 'Manque de sommeil', 'Disputes conjugales'], correctIndex: 1, explanation: 'L\'epuisement emotionnel persistant (au-dela de la simple fatigue) est le premier signe d\'alerte.' },
            { question: 'Que signifie la metaphore du "masque a oxygene" ?', options: ['Porter un masque devant les enfants', 'Prendre soin de soi avant de pouvoir aider les autres', 'Respirer dans un sac en papier', 'Proteger les enfants de l\'air pollue'], correctIndex: 1, explanation: 'Comme dans l\'avion, il faut d\'abord prendre soin de soi pour etre capable de prendre soin des autres.' },
            { question: 'Qui a cree le concept du parent "suffisamment bon" ?', options: ['Freud', 'Montessori', 'Winnicott', 'Piaget'], correctIndex: 2, explanation: 'Le pediatre Donald Winnicott a developpe le concept du "good enough parent" (parent suffisamment bon).' },
            { question: 'Combien de temps minimum par semaine consacrer a soi-meme ?', options: ['10 minutes', '30 minutes', '1 a 1h30 (2-3 creneaux de 30 min)', '3 heures'], correctIndex: 2, explanation: 'Minimum 2 a 3 creneaux de 30 minutes par semaine rien que pour soi, non negociables.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 4 — Developpement Personnel IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursDevPerso: FormationParcours = {
  id: 'dev-perso-ia',
  title: 'Developpement Personnel IA',
  emoji: '\u{1F31F}',
  description: 'Transformez votre vie avec l\'IA : fixation d\'objectifs, creation d\'habitudes, journal intime intelligent, introspection guidee, confiance en soi et resilience.',
  category: 'quotidien',
  subcategory: 'developpement-personnel',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#0D9488',
  diplomaTitle: 'Developpement Personnel IA',
  diplomaSubtitle: 'Certification Freenzy.io — Developpement Personnel et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Fixer ses objectifs
    {
      id: 'devp-m1',
      title: 'Objectifs SMART avec l\'IA',
      emoji: '\u{1F3AF}',
      description: 'Definissez des objectifs clairs et atteignables grace a la methode SMART assistee par IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Visionnaire',
      lessons: [
        {
          id: 'devp-m1-l1',
          title: 'La methode SMART augmentee par l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La plupart des gens echouent a atteindre leurs objectifs non par manque de volonte, mais par manque de clarte. Un objectif flou comme "etre plus heureux" ou "gagner plus d'argent" est voue a l'echec car le cerveau ne sait pas quoi en faire. La methode SMART combinee a l'IA transforme vos reves vagues en plans d'action concrets.

SMART signifie Specifique (quoi exactement ?), Mesurable (comment saurai-je que c'est atteint ?), Atteignable (est-ce realiste ?), Relevant (est-ce important pour moi ?) et Temporel (quand ?). "Etre en forme" devient "courir 5 km en 30 minutes d'ici 3 mois en m'entrainant 3 fois par semaine." Le cerveau sait maintenant exactement quoi faire.

L'IA Freenzy excelle dans la transformation d'objectifs vagues en objectifs SMART. Dites simplement "je veux ameliorer ma sante" et l'IA vous pose des questions de clarification : "Quel aspect de votre sante ? Physique, mentale, nutritionnelle ? Quel est votre point de depart ? De combien de temps disposez-vous par semaine ? Avez-vous des contraintes ?" En 3 minutes de dialogue, votre objectif flou devient un plan structure.

La decomposition en sous-objectifs est la cle du passage a l'action. Un objectif a 6 mois se decompose en objectifs mensuels, puis hebdomadaires, puis en actions quotidiennes. L'IA cree cette cascade automatiquement : "Objectif 6 mois : parler anglais niveau B1. Mois 1 : maitriser 500 mots de base. Semaine 1 : apprendre 20 mots par jour pendant 15 minutes. Action du jour : utiliser l'application + 1 episode de serie en VO."

Le suivi et la revision reguliere sont essentiels. Chaque semaine, faites le point avec l'IA : "Voici ce que j'ai accompli, voici ou j'ai bloque." L'IA analyse votre progression, identifie les obstacles recurrents et propose des ajustements. Elle peut meme predire si votre rythme actuel vous permettra d'atteindre l'objectif dans les temps et suggerer des accelerations si necessaire.

L'exercice de la "vision board IA" : demandez a Freenzy de vous generer une description vivante de votre vie dans 1 an si vous atteignez tous vos objectifs. Cette visualisation detaillee active les circuits de motivation du cerveau et renforce votre engagement.`,
          xpReward: 15,
        },
        {
          id: 'devp-m1-l2',
          title: 'Exercice : Transformez 3 objectifs en SMART',
          duration: '5 min',
          type: 'exercise',
          content: 'Appliquez la methode SMART a vos propres objectifs.',
          exercisePrompt: `Prenez 3 objectifs personnels et transformez-les en objectifs SMART avec l'IA :

1. Objectif vague n1 : ecrivez un objectif tel que vous le formulez naturellement
   - Passez-le au filtre SMART (Specifique, Mesurable, Atteignable, Relevant, Temporel)
   - Decomposez en 3 sous-objectifs mensuels
   - Definissez l'action de demain (premiere etape concrete)

2. Objectif vague n2 : meme exercice
3. Objectif vague n3 : meme exercice

Criteres de reussite :
- Chaque objectif repond aux 5 criteres SMART
- Les sous-objectifs sont mesurables et dates
- L'action de demain est concrete et realisable en moins de 30 min
- Les objectifs sont importants pour VOUS (pas imposes)`,
          xpReward: 20,
        },
        {
          id: 'devp-m1-l3',
          title: 'Quiz : Objectifs SMART',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la methode SMART.',
          quizQuestions: [
            { question: 'Que signifie le "M" de SMART ?', options: ['Motivant', 'Mesurable', 'Materiel', 'Modeste'], correctIndex: 1, explanation: 'M = Mesurable : vous devez pouvoir quantifier votre progression et savoir quand l\'objectif est atteint.' },
            { question: 'Pourquoi les objectifs vagues echouent-ils ?', options: ['Manque de volonte', 'Le cerveau ne sait pas quoi en faire', 'Ils sont trop ambitieux', 'Le timing est mauvais'], correctIndex: 1, explanation: 'Un objectif flou ne donne aucune direction au cerveau. La specificite est essentielle pour passer a l\'action.' },
            { question: 'Quel est le premier reflexe pour rendre un objectif atteignable ?', options: ['Reduire l\'ambition', 'Le decomposer en sous-objectifs', 'Trouver un coach', 'Attendre le bon moment'], correctIndex: 1, explanation: 'Decomposer un grand objectif en sous-objectifs plus petits le rend atteignable et moins intimidant.' },
            { question: 'A quelle frequence reviser ses objectifs avec l\'IA ?', options: ['Tous les jours', 'Toutes les semaines', 'Tous les mois', 'Tous les ans'], correctIndex: 1, explanation: 'Une revision hebdomadaire permet d\'ajuster le cap rapidement et de maintenir la motivation.' },
            { question: 'A quoi sert une "vision board IA" ?', options: ['Decorer son bureau', 'Visualiser sa vie future pour renforcer la motivation', 'Comparer avec les autres', 'Planifier ses vacances'], correctIndex: 1, explanation: 'La vision board IA cree une description vivante de votre futur, activant les circuits de motivation cerebrale.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Habitudes positives
    {
      id: 'devp-m2',
      title: 'Habitudes positives',
      emoji: '\u{1F504}',
      description: 'Construisez des habitudes qui transforment votre quotidien avec le soutien de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F504}',
      badgeName: 'Architecte d\'Habitudes',
      lessons: [
        {
          id: 'devp-m2-l1',
          title: 'Creer des habitudes qui durent',
          duration: '5 min',
          type: 'text',
          content: `Vos habitudes determinent votre destin. James Clear, auteur de "Atomic Habits", l'exprime ainsi : "Vous ne vous elevez pas au niveau de vos objectifs, vous tombez au niveau de vos systemes." L'IA peut vous aider a construire des systemes d'habitudes robustes et durables.

La loi de l'atomicite : commencez ridiculement petit. Voulez-vous lire davantage ? Ne visez pas 30 pages par jour — visez 1 page. Voulez-vous mediter ? Ne visez pas 20 minutes — visez 60 secondes. L'objectif n'est pas la quantite mais la consistance. Une fois l'habitude ancree (apres environ 66 jours), vous augmenterez naturellement.

Le "habit stacking" (empilement d'habitudes) est la technique la plus efficace pour ancrer une nouvelle habitude. La formule : "Apres [habitude existante], je vais [nouvelle habitude]." Exemples : "Apres avoir verse mon cafe, je vais ecrire 3 choses dont je suis reconnaissant." "Apres m'etre brosse les dents le soir, je vais lire 1 page." L'habitude existante sert de declencheur automatique.

L'environnement est plus puissant que la volonte. Pour lire plus, posez un livre sur votre oreiller. Pour manger plus sainement, mettez les fruits en evidence et cachez les snacks. Pour faire du sport le matin, dormez dans vos vetements de sport. L'IA Freenzy peut analyser votre environnement et suggerer des modifications strategiques pour chaque habitude.

Le suivi visuel renforce la motivation. Le "dont break the chain" (ne brisez pas la chaine) est redoutablement efficace : marquez d'un X chaque jour ou vous pratiquez votre habitude. Apres 10 jours, la chaine visuelle devient une motivation en soi — vous ne voudrez pas la briser. L'IA peut creer des trackers personnalises et vous feliciter a chaque milestone.

Pour eliminer une mauvaise habitude, inversez les 4 lois : rendez le signal invisible (pas de telephone dans la chambre), rendez l'habitude difficile (supprimez les applications), rendez la recompense insatisfaisante (calculez le cout annuel de vos achats impulsifs). L'IA peut vous aider a identifier vos mauvaises habitudes cachees et concevoir un plan d'elimination progressif.

Le "habit scorecard" : listez toutes vos habitudes quotidiennes (du reveil au coucher) et marquez chacune + (positive), - (negative) ou = (neutre). Cette prise de conscience est le premier pas vers le changement.`,
          xpReward: 15,
        },
        {
          id: 'devp-m2-l2',
          title: 'Jeu : Les 4 lois des habitudes',
          duration: '4 min',
          type: 'game',
          content: 'Associez chaque loi a son application pratique.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Rendre le signal evident', right: 'Poser le livre sur l\'oreiller' },
              { left: 'Rendre l\'habitude attractive', right: 'Associer avec une activite plaisante' },
              { left: 'Rendre l\'action facile', right: 'Commencer par 1 page / 60 secondes' },
              { left: 'Rendre la recompense satisfaisante', right: 'Tracker visuel et celebrations' },
              { left: 'Habit stacking', right: 'Apres mon cafe, j\'ecris 3 gratitudes' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'devp-m2-l3',
          title: 'Quiz : Science des habitudes',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la formation d\'habitudes.',
          quizQuestions: [
            { question: 'Combien de jours faut-il en moyenne pour ancrer une habitude ?', options: ['21 jours', '30 jours', '66 jours', '100 jours'], correctIndex: 2, explanation: 'Les etudes scientifiques recentes montrent qu\'il faut en moyenne 66 jours pour ancrer une habitude.' },
            { question: 'Qu\'est-ce que le "habit stacking" ?', options: ['Empiler plusieurs habitudes en meme temps', 'Attacher une nouvelle habitude a une existante', 'Faire une habitude plus grande chaque jour', 'Remplacer une mauvaise habitude'], correctIndex: 1, explanation: 'Le habit stacking lie une nouvelle habitude a un comportement deja automatique comme declencheur.' },
            { question: 'Quelle est la "loi de l\'atomicite" ?', options: ['Viser grand des le debut', 'Commencer ridiculement petit', 'Tout changer en meme temps', 'Eliminer toutes les mauvaises habitudes'], correctIndex: 1, explanation: 'Commencer ridiculement petit (1 page, 60 secondes) ancre l\'habitude ; la quantite viendra naturellement.' },
            { question: 'Qu\'est-ce qui est plus puissant que la volonte ?', options: ['La motivation', 'L\'environnement', 'Les objectifs', 'Les recompenses'], correctIndex: 1, explanation: 'L\'environnement determine nos comportements bien plus que la volonte. Modifier l\'environnement est plus efficace.' },
            { question: 'Comment le "dont break the chain" motive ?', options: ['Par la peur de la punition', 'Par la chaine visuelle qu\'on ne veut pas briser', 'Par la competition avec les autres', 'Par les recompenses materielles'], correctIndex: 1, explanation: 'La chaine visuelle de jours consecutifs cree une motivation intrinseque — on ne veut pas briser la serie.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Journal intime IA
    {
      id: 'devp-m3',
      title: 'Journal intime intelligent',
      emoji: '\u{1F4D3}',
      description: 'Tenez un journal de reflexion augmente par l\'IA pour mieux vous connaitre.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4D3}',
      badgeName: 'Ecrivain Intime',
      lessons: [
        {
          id: 'devp-m3-l1',
          title: 'Le journaling augmente par l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le journaling (ecriture de journal) est l'un des outils de developpement personnel les plus puissants et les plus anciens. Marc Aurele, Benjamin Franklin, Frida Kahlo — les plus grands esprits tenaient un journal. L'IA le transforme en un outil encore plus profond en offrant des questions guidees, des analyses de tendances et des reflexions miroir.

Le journal matinal suit la methode des "Morning Pages" : 3 pages d'ecriture libre au reveil, sans filtre ni censure. Vous ecrivez tout ce qui traverse votre esprit — preoccupations, idees, frustrations, reves. L'IA peut analyser vos pages et identifier des themes recurrents, des emotions dominantes et des patterns invisibles a l'oeil nu.

Le journal du soir est plus structure. Les 3 questions essentielles : "Quelle a ete ma plus grande victoire aujourd'hui ?" (meme minuscule), "Qu'ai-je appris ?" (une lecon, une prise de conscience), "Que ferais-je differemment ?" (sans culpabilite, juste de la curiosite). L'IA Freenzy peut varier ces questions pour eviter la routine : questions sur vos emotions, vos relations, vos progres vers vos objectifs, vos gratitudes.

Le journal de gratitude a des effets scientifiquement prouves : noter 3 choses positives chaque jour pendant 21 jours augmente le niveau de bonheur de 25 pourcent et reduit les symptomes depressifs. L'IA vous aide a aller au-dela du superficiel : au lieu de "je suis reconnaissant pour ma famille", elle vous pousse a preciser "je suis reconnaissant pour le fou rire qu'on a eu avec les enfants pendant le diner, quand Lucas a raconte sa blague sur les dinosaures."

Le journal d'emotions est un outil therapeutique puissant. Nommez votre emotion dominante, donnez-lui une intensite (1 a 10), identifiez le declencheur et la reaction physique associee. Au fil des semaines, l'IA detecte des patterns : "Vous notez de l'anxiete a 7/10 chaque dimanche soir. Cela semble lie au stress anticipe du lundi. Voulez-vous explorer des strategies pour les dimanches soirs ?"

L'analyse IA de votre journal va au-dela de ce que vous percevez consciemment. Elle repere les mots qui reviennent, les sujets evites, les fluctuations d'humeur, les correlations entre evenements et emotions. Ces insights deviennent un miroir lucide de votre vie interieure.`,
          xpReward: 15,
        },
        {
          id: 'devp-m3-l2',
          title: 'Exercice : Votre premiere semaine de journal IA',
          duration: '5 min',
          type: 'exercise',
          content: 'Commencez votre pratique de journaling avec l\'IA.',
          exercisePrompt: `Lancez votre journal intelligent en completant ces 5 prompts :

1. Journal du matin : ecrivez librement pendant 5 minutes (ce qui vous traverse l'esprit)
2. Gratitude : 3 choses positives d'hier, en etant le plus specifique possible
3. Emotion dominante : nommez-la, intensite (1-10), declencheur, sensation physique
4. Reflexion guidee : "Si je pouvais changer une seule chose dans ma vie cette semaine, ce serait..."
5. Intention : formulez votre intention pour la journee en 1 phrase

Demandez ensuite a l'IA d'analyser vos 5 reponses et de vous donner :
- Le theme dominant qui emerge
- Une question de reflexion pour approfondir
- Un conseil personnalise pour la journee

Criteres de reussite :
- Les 5 sections sont completees honnetement
- Les gratitudes sont specifiques (pas generiques)
- L'emotion est nommee avec precision (pas juste "bien" ou "mal")
- L'intention est concrete et realisable`,
          xpReward: 20,
        },
        {
          id: 'devp-m3-l3',
          title: 'Quiz : Journaling intelligent',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le journal intime IA.',
          quizQuestions: [
            { question: 'Combien de pages recommandent les "Morning Pages" ?', options: ['1 page', '3 pages', '5 pages', '10 pages'], correctIndex: 1, explanation: 'La methode des Morning Pages recommande 3 pages d\'ecriture libre chaque matin au reveil.' },
            { question: 'Le journal de gratitude augmente le bonheur de combien apres 21 jours ?', options: ['5%', '10%', '25%', '50%'], correctIndex: 2, explanation: 'Les etudes montrent que noter 3 gratitudes par jour pendant 21 jours augmente le bonheur de 25%.' },
            { question: 'Quelles sont les 3 questions du journal du soir ?', options: ['Quoi, quand, comment', 'Victoire, lecon, amelioration', 'Objectif, obstacle, solution', 'Emotion, cause, action'], correctIndex: 1, explanation: 'Les 3 questions : ma plus grande victoire, ce que j\'ai appris, ce que je ferais differemment.' },
            { question: 'Que detecte l\'IA dans un journal d\'emotions ?', options: ['Les fautes d\'orthographe', 'Les patterns emotionnels recurrents', 'Les mensonges', 'Les objectifs non atteints'], correctIndex: 1, explanation: 'L\'IA identifie les patterns emotionnels, correlations et tendances que vous ne percevez pas consciemment.' },
            { question: 'Pourquoi les gratitudes doivent-elles etre specifiques ?', options: ['Pour ecrire plus de mots', 'Pour activer plus profondement le circuit de la recompense', 'Pour impressionner l\'IA', 'Pour ne pas repeter les memes chaque jour'], correctIndex: 1, explanation: 'Les gratitudes specifiques activent plus profondement les circuits cerebraux de la satisfaction que les generiques.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Introspection guidee
    {
      id: 'devp-m4',
      title: 'Introspection guidee',
      emoji: '\u{1F52E}',
      description: 'Explorez votre monde interieur avec des exercices d\'introspection assistes par IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F52E}',
      badgeName: 'Explorateur Interieur',
      lessons: [
        {
          id: 'devp-m4-l1',
          title: 'L\'IA comme miroir de soi',
          duration: '5 min',
          type: 'text',
          content: `L'introspection est l'art de se regarder de l'interieur avec honnetete et curiosite. Mais notre esprit a des angles morts, des biais et des mecanismes de defense qui nous empechent de nous voir clairement. L'IA agit comme un miroir bienveillant qui reflète ce que nous ne voyons pas seuls.

L'exercice des "5 pourquoi" est un outil d'introspection profonde. Partez d'une emotion ou d'un comportement et demandez "pourquoi ?" 5 fois de suite. "Je suis stresse." Pourquoi ? "J'ai trop de travail." Pourquoi ? "Je n'arrive pas a dire non." Pourquoi ? "J'ai peur de decevoir." Pourquoi ? "Je cherche l'approbation des autres." Pourquoi ? "Mon estime de soi depend du regard des autres." En 5 questions, vous passez du symptome a la racine.

L'IA Freenzy peut guider cet exercice avec finesse. Elle reformule vos reponses, pose des questions d'approfondissement et fait des liens entre differentes introspections. "Je remarque que dans 3 de vos dernieres reflexions, le theme de l'approbation revient. Souhaitez-vous explorer cela plus en profondeur ?"

L'exercice de la "lettre a soi" est profondement transformateur. Ecrivez une lettre a votre moi d'il y a 5 ans ou a votre moi dans 5 ans. L'IA peut vous guider : "Qu'avez-vous appris que vous auriez voulu savoir avant ? De quoi etes-vous le plus fier ? Quel conseil donneriez-vous ?" Ou pour le futur : "Qu'esperez-vous avoir accompli ? Quelles relations souhaitez-vous avoir ? Comment voulez-vous vous sentir ?"

Le test des valeurs identifie ce qui compte vraiment pour vous. L'IA presente 20 valeurs (liberte, securite, creativite, famille, aventure, justice, authenticite...) et vous guide pour les classer. Resultat : vos 5 valeurs fondamentales. Quand une decision s'aligne avec vos valeurs, vous ressentez de la coherence. Quand elle s'en eloigne, un malaise apparait. Connaitre ses valeurs, c'est avoir une boussole pour chaque choix de vie.

L'inventaire des croyances limitantes revele les "histoires" que vous vous racontez et qui vous freinent. "Je ne suis pas assez intelligent", "les gens comme moi ne reussissent pas", "il est trop tard pour changer". L'IA vous aide a identifier ces croyances, les questionner (sont-elles vraies ? toujours ? existe-t-il un contre-exemple ?) et les remplacer par des croyances plus constructives.`,
          xpReward: 15,
        },
        {
          id: 'devp-m4-l2',
          title: 'Jeu : Ordonnez une introspection',
          duration: '4 min',
          type: 'game',
          content: 'Remettez dans l\'ordre les etapes d\'une introspection guidee.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Identifier l\'emotion ou le comportement a explorer',
              'Appliquer les 5 pourquoi pour trouver la racine',
              'Identifier la croyance limitante sous-jacente',
              'Questionner la croyance (est-elle toujours vraie ?)',
              'Formuler une croyance alternative plus constructive',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'devp-m4-l3',
          title: 'Quiz : Introspection guidee',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur l\'introspection assistee par IA.',
          quizQuestions: [
            { question: 'A quoi sert l\'exercice des "5 pourquoi" ?', options: ['Poser des questions aux autres', 'Passer du symptome a la cause profonde', 'Trouver 5 raisons d\'etre heureux', 'Questionner 5 personnes'], correctIndex: 1, explanation: 'Les 5 pourquoi permettent de creuser au-dela du symptome pour trouver la cause racine d\'un comportement ou d\'une emotion.' },
            { question: 'Qu\'est-ce qu\'une croyance limitante ?', options: ['Une opinion politique', 'Une histoire qu\'on se raconte et qui nous freine', 'Un fait scientifique', 'Une valeur fondamentale'], correctIndex: 1, explanation: 'Une croyance limitante est une conviction souvent inconsciente qui restreint notre potentiel et nos choix.' },
            { question: 'Pourquoi connaitre ses valeurs est-il important ?', options: ['Pour impressionner les recruteurs', 'Pour avoir une boussole pour ses decisions', 'Pour se comparer aux autres', 'Pour ecrire un CV'], correctIndex: 1, explanation: 'Connaitre ses valeurs fondamentales guide les decisions et procure un sentiment de coherence interieure.' },
            { question: 'Comment l\'IA agit-elle dans l\'introspection ?', options: ['Elle donne des ordres', 'Elle agit comme un miroir bienveillant', 'Elle juge les reponses', 'Elle impose des solutions'], correctIndex: 1, explanation: 'L\'IA reflète ce que vous exprimez, fait des liens et pose des questions, sans jamais juger.' },
            { question: 'A quoi sert la "lettre a soi" ?', options: ['A s\'excuser', 'A prendre du recul sur son parcours et projeter son futur', 'A lister ses defauts', 'A planifier sa semaine'], correctIndex: 1, explanation: 'La lettre a soi (passe ou futur) offre une perspective unique sur son parcours et ses aspirations profondes.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Confiance en soi
    {
      id: 'devp-m5',
      title: 'Confiance en soi avec l\'IA',
      emoji: '\u{1F4AA}',
      description: 'Renforcez votre confiance en vous grace a des exercices et strategies IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4AA}',
      badgeName: 'Confiance Solide',
      lessons: [
        {
          id: 'devp-m5-l1',
          title: 'Construire une confiance durable',
          duration: '5 min',
          type: 'text',
          content: `La confiance en soi n'est pas un trait de caractere inne — c'est une competence qui se developpe avec des pratiques specifiques. L'IA est un allie ideal car elle offre un espace sans jugement pour explorer ses forces, travailler ses faiblesses et celebrer ses progres.

Le "portfolio de reussites" est le fondement de la confiance. La plupart des gens minimisent leurs accomplissements et amplifient leurs echecs. L'IA Freenzy vous aide a dresser une liste exhaustive de vos reussites : diplomes, projets menes a bien, defis surmontes, compliments recus, moments de courage. Relire cette liste dans les moments de doute est un antidote puissant contre le syndrome de l'imposteur.

Les affirmations positives fonctionnent a condition d'etre credibles. "Je suis le meilleur du monde" sonne faux et peut meme diminuer la confiance. Preferez les affirmations basees sur des preuves : "J'ai gere avec succes le projet X, donc je suis capable de gerer des projets complexes." L'IA peut generer des affirmations personnalisees basees sur vos reussites reelles.

La technique du "petit pas courageux quotidien" construit la confiance progressivement. Chaque jour, faites une chose qui vous met legerement hors de votre zone de confort : parler a un inconnu, donner votre avis en reunion, essayer un nouveau restaurant seul, publier un post sur les reseaux. L'accumulation de ces micro-victoires recable le cerveau et elargit votre zone de confort.

La posture physique influence la confiance mentale. Les etudes d'Amy Cuddy montrent que se tenir debout, epaules ouvertes, pendant 2 minutes augmente la testosterone (hormone de confiance) de 20 pourcent et reduit le cortisol (stress) de 25 pourcent. Avant un moment important, adoptez une "power pose" pendant 2 minutes. L'IA peut vous rappeler ces techniques avant vos rendez-vous stressants.

Le dialogue interieur est le levier le plus puissant. La voix critique dans votre tete ("tu vas echouer", "tu n'es pas assez bien") n'est pas la realite — c'est une habitude de pensee. L'IA vous aide a identifier cette voix, la nommer (certains l'appellent "le critique interieur"), et lui repondre factuellement. "Le critique dit que je vais echouer cette presentation. Les faits : j'ai reussi 9 presentations sur 10 cette annee."

La cle : la confiance vient de l'action, pas de la reflexion. Agissez d'abord, la confiance suivra.`,
          xpReward: 15,
        },
        {
          id: 'devp-m5-l2',
          title: 'Exercice : Votre portfolio de confiance',
          duration: '5 min',
          type: 'exercise',
          content: 'Construisez votre portfolio personnel de reussites.',
          exercisePrompt: `Creez votre portfolio de confiance avec l'aide de l'IA :

1. Reussites professionnelles : listez 5 accomplissements dans votre travail/etudes
2. Reussites personnelles : listez 5 defis surmontes dans votre vie personnelle
3. Qualites reconnues : 5 compliments que vous avez recus (de proches, collegues, amis)
4. Moments de courage : 3 fois ou vous avez agi malgre la peur
5. Affirmations personnalisees : redigez 3 affirmations basees sur vos reussites reelles

Demandez a l'IA de synthetiser votre portfolio en un "discours de confiance" de 5 lignes que vous pourrez relire dans les moments de doute.

Criteres de reussite :
- Au moins 15 elements au total (reussites + qualites + courage)
- Les affirmations sont basees sur des preuves reelles
- Le discours de synthese est motivant et credible
- Vous ressentez un boost d'energie en le relisant`,
          xpReward: 20,
        },
        {
          id: 'devp-m5-l3',
          title: 'Quiz : Confiance en soi',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la confiance en soi.',
          quizQuestions: [
            { question: 'La confiance en soi est-elle innee ?', options: ['Oui, on nait confiant ou pas', 'Non, c\'est une competence qui se developpe', 'Oui, elle depend des genes', 'Non, elle depend uniquement des parents'], correctIndex: 1, explanation: 'La confiance en soi est une competence qui se construit par des pratiques specifiques, pas un trait inne.' },
            { question: 'Combien de temps dure une "power pose" efficace ?', options: ['30 secondes', '2 minutes', '10 minutes', '30 minutes'], correctIndex: 1, explanation: '2 minutes de posture de pouvoir suffisent pour augmenter la testosterone et reduire le cortisol.' },
            { question: 'Qu\'est-ce que le syndrome de l\'imposteur ?', options: ['Se faire passer pour quelqu\'un d\'autre', 'Douter de ses competences malgre les preuves de reussite', 'Mentir sur son CV', 'Etre trop confiant'], correctIndex: 1, explanation: 'Le syndrome de l\'imposteur est le sentiment de ne pas meriter ses succes malgre les preuves objectives de competence.' },
            { question: 'Pourquoi les affirmations doivent-elles etre credibles ?', options: ['Pour impressionner les autres', 'Parce que le cerveau rejette les affirmations irrealistes', 'Pour les publier sur les reseaux', 'Pour obtenir un diplome'], correctIndex: 1, explanation: 'Le cerveau rejette les affirmations trop eloignees de la realite, ce qui peut diminuer la confiance au lieu de l\'augmenter.' },
            { question: 'D\'ou vient veritablement la confiance ?', options: ['De la reflexion', 'De l\'action', 'Des compliments', 'De la meditation'], correctIndex: 1, explanation: 'La confiance vient de l\'action : chaque petit pas courageux recable le cerveau et elargit la zone de confort.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Resilience
    {
      id: 'devp-m6',
      title: 'Resilience et rebond',
      emoji: '\u{1F3CB}\u{FE0F}',
      description: 'Developpez votre capacite a rebondir face aux epreuves avec le soutien de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3CB}\u{FE0F}',
      badgeName: 'Resilient',
      lessons: [
        {
          id: 'devp-m6-l1',
          title: 'L\'art de rebondir avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La resilience n'est pas l'absence de souffrance — c'est la capacite a traverser les epreuves et a en sortir renforce. Comme un muscle, la resilience se developpe avec l'entrainement. L'IA offre des outils puissants pour construire cette capacite jour apres jour.

Le modele ABC de la resilience explique comment nos pensees determinent nos reactions. A = Adversite (l'evenement negatif), B = Beliefs (nos croyances sur l'evenement), C = Consequences (nos emotions et actions). L'evenement ne determine pas notre reaction — ce sont nos croyances qui le font. Perdre un emploi (A) peut mener a "je suis un echec" (B) et donc a la depression (C), ou a "c'est une opportunite de changement" (B) et donc a de l'energie pour rebondir (C).

L'IA Freenzy vous aide a identifier et challenger vos croyances automatiques apres un evenement difficile. Decrivez la situation et l'IA vous pose les questions de restructuration cognitive : "Cette pensee est-elle un fait ou une interpretation ? Existe-t-il une autre facon de voir la situation ? Que diriez-vous a un ami dans la meme situation ? Dans un an, comment verrez-vous cet evenement ?"

La technique du "post-mortem positif" transforme les echecs en apprentissages. Apres un revers, notez : ce qui s'est passe (faits), ce que j'ai bien fait malgre tout, ce que j'ai appris, ce que je ferai differemment. L'IA structure cette reflexion et vous aide a extraire les lecons sans rumination toxique.

Le reseau de soutien est un pilier de la resilience. Les personnes resilientes ne sont pas solitaires — elles savent demander de l'aide. L'IA peut vous aider a cartographier votre reseau : qui appeler en cas de crise emotionnelle, de probleme pratique, de besoin de conseil ? Avoir cette carte sous la main accelere le rebond quand une epreuve survient.

La pratique de l'acceptation radicale est contre-intuitive mais liberatrice. Accepter ne signifie pas approuver — cela signifie arreter de lutter contre la realite. "Oui, j'ai perdu ce client. C'est douloureux. Je ne peux pas changer le passe. Que puis-je faire maintenant ?" L'IA vous guide dans cette transition de la resistance a l'action.

Le "stress inoculation" renforce votre resilience de maniere proactive. Exposez-vous volontairement a de petites doses de stress (douche froide, parler en public, dejeuner seul au restaurant) pour developper votre tolerance. L'IA cree des programmes de stress inoculation progressifs et personnalises.`,
          xpReward: 15,
        },
        {
          id: 'devp-m6-l2',
          title: 'Jeu : Le modele ABC de la resilience',
          duration: '4 min',
          type: 'game',
          content: 'Completez les elements du modele ABC.',
          gameType: 'fill-blanks',
          gameData: {
            sentences: [
              { text: 'A = ___ (l\'evenement negatif)', answer: 'Adversite' },
              { text: 'B = ___ (nos croyances sur l\'evenement)', answer: 'Beliefs' },
              { text: 'C = ___ (nos emotions et actions)', answer: 'Consequences' },
              { text: 'La resilience est la capacite a ___ face aux epreuves.', answer: 'rebondir' },
              { text: 'L\'acceptation radicale signifie arreter de ___ contre la realite.', answer: 'lutter' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'devp-m6-l3',
          title: 'Quiz : Resilience',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos acquis sur la resilience.',
          quizQuestions: [
            { question: 'Qu\'est-ce que la resilience ?', options: ['Ne jamais souffrir', 'Traverser les epreuves et en sortir renforce', 'Ignorer les problemes', 'Etre toujours positif'], correctIndex: 1, explanation: 'La resilience est la capacite a traverser les epreuves et a en ressortir renforce, pas l\'absence de souffrance.' },
            { question: 'Dans le modele ABC, qu\'est-ce qui determine nos reactions ?', options: ['L\'evenement lui-meme', 'Nos croyances sur l\'evenement', 'Les autres personnes', 'La chance'], correctIndex: 1, explanation: 'Ce sont nos croyances (B) sur l\'evenement qui determinent nos reactions, pas l\'evenement lui-meme.' },
            { question: 'Que signifie "acceptation radicale" ?', options: ['Tout approuver', 'Arreter de lutter contre la realite pour agir', 'Se resigner', 'Abandonner ses objectifs'], correctIndex: 1, explanation: 'L\'acceptation radicale n\'est pas de la resignation — c\'est arreter de lutter contre ce qui est pour se concentrer sur ce qui peut etre fait.' },
            { question: 'A quoi sert le "post-mortem positif" ?', options: ['A se punir apres un echec', 'A transformer un echec en apprentissage', 'A blamer les autres', 'A oublier l\'evenement'], correctIndex: 1, explanation: 'Le post-mortem positif extrait les lecons d\'un echec sans rumination, transformant le revers en croissance.' },
            { question: 'Qu\'est-ce que le "stress inoculation" ?', options: ['Eviter tout stress', 'S\'exposer volontairement a de petites doses de stress', 'Prendre des medicaments anti-stress', 'Ignorer le stress'], correctIndex: 1, explanation: 'Le stress inoculation consiste a s\'exposer progressivement a de petites doses de stress pour renforcer sa tolerance.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 5 — Ecologie IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursEcologieIA: FormationParcours = {
  id: 'ecologie-ia',
  title: 'Ecologie IA',
  emoji: '\u{1F33D}',
  description: 'Agissez pour la planete avec l\'IA : bilan carbone personnel, consommation responsable, energie, mobilite durable, alimentation ecologique et engagement citoyen.',
  category: 'quotidien',
  subcategory: 'ecologie',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#16A34A',
  diplomaTitle: 'Ecologie IA',
  diplomaSubtitle: 'Certification Freenzy.io — Ecologie et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Bilan carbone
    {
      id: 'eco-m1',
      title: 'Bilan carbone personnel',
      emoji: '\u{1F30D}',
      description: 'Calculez et comprenez votre empreinte carbone avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F30D}',
      badgeName: 'Ecoresponsable',
      lessons: [
        {
          id: 'eco-m1-l1',
          title: 'Comprendre son empreinte carbone',
          duration: '5 min',
          type: 'text',
          content: `Chaque Francais emet en moyenne 9 tonnes de CO2 equivalent par an. L'objectif pour limiter le rechauffement a 2 degres est de passer sous les 2 tonnes par personne d'ici 2050. C'est un defi colossal, mais l'IA peut vous aider a identifier exactement ou agir pour reduire votre impact.

L'empreinte carbone se decompose en 5 postes principaux. Le transport represente en moyenne 30 pourcent (voiture, avion, transports en commun). L'alimentation pese 25 pourcent (viande, produits importes, gaspillage). Le logement compte 20 pourcent (chauffage, electricite, construction). Les biens de consommation represented 15 pourcent (vetements, electronique, meubles). Les services publics et autres ajoutent 10 pourcent.

L'IA Freenzy calcule votre bilan carbone personnalise a partir de questions simples. Type de logement (appartement, maison, surface, isolation), mode de chauffage (gaz, electrique, bois, pompe a chaleur), kilometrage annuel en voiture (et type de vehicule), nombre de vols par an, habitudes alimentaires (omnivore, flexitarien, vegetarien, vegan), habitudes d'achat. En 5 minutes, vous obtenez une estimation precise de votre empreinte.

Le resultat est presente en categories visuelles avec un code couleur : vert (deja bon), orange (ameliorable), rouge (action prioritaire). L'IA identifie vos 3 plus gros postes d'emission et propose des actions concretes classees par impact et facilite. Par exemple : "Votre plus gros poste est la voiture (3.2 tonnes). Action a fort impact : covoiturer 2 jours par semaine reduirait vos emissions transport de 40 pourcent."

L'IA peut aussi simuler des scenarios : "Si je remplace mon chauffage gaz par une pompe a chaleur, combien de CO2 j'economise ?" "Si je mange vegetarien 3 jours par semaine ?" "Si je prends le train au lieu de l'avion pour mes vacances ?" Ces simulations permettent de prioriser les actions les plus impactantes pour VOTRE situation, pas des conseils generiques.

Conseil Freenzy : refaites votre bilan tous les 6 mois pour mesurer vos progres. L'IA compare automatiquement et celebre les reductions. Rien de plus motivant que voir sa courbe d'emissions descendre.`,
          xpReward: 15,
        },
        {
          id: 'eco-m1-l2',
          title: 'Exercice : Calculez votre empreinte',
          duration: '5 min',
          type: 'exercise',
          content: 'Estimez votre bilan carbone personnel avec l\'IA.',
          exercisePrompt: `Calculez votre empreinte carbone avec l'aide de l'IA en repondant a ces questions :

1. Transport : combien de km/an en voiture ? Quel type de vehicule ? Combien de vols/an ?
2. Logement : type (appart/maison), surface, mode de chauffage, isolation ?
3. Alimentation : omnivore/flexitarien/vegetarien ? Produits locaux ou importes ?
4. Consommation : frequence d'achat de vetements, electronique ? Achat neuf ou occasion ?
5. Energie : fournisseur vert ou classique ? Equipements economiques ?

Demandez a l'IA de :
- Estimer votre empreinte totale en tonnes CO2/an
- Identifier vos 3 premiers postes d'emission
- Proposer 3 actions concretes par ordre d'impact

Criteres de reussite :
- Les 5 postes sont estimes
- L'empreinte totale est chiffree
- Les actions proposees sont realisables pour VOTRE situation
- Un objectif de reduction a 6 mois est defini`,
          xpReward: 20,
        },
        {
          id: 'eco-m1-l3',
          title: 'Quiz : Bilan carbone',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'empreinte carbone.',
          quizQuestions: [
            { question: 'Quelle est l\'empreinte carbone moyenne d\'un Francais par an ?', options: ['3 tonnes', '6 tonnes', '9 tonnes', '15 tonnes'], correctIndex: 2, explanation: 'Un Francais emet en moyenne 9 tonnes de CO2 equivalent par an.' },
            { question: 'Quel est l\'objectif par personne pour limiter le rechauffement a 2 degres ?', options: ['Moins de 2 tonnes', 'Moins de 5 tonnes', 'Moins de 8 tonnes', 'Moins de 10 tonnes'], correctIndex: 0, explanation: 'L\'objectif est de passer sous 2 tonnes de CO2 par personne d\'ici 2050.' },
            { question: 'Quel est le premier poste d\'emission en France ?', options: ['L\'alimentation', 'Le logement', 'Le transport', 'Les vetements'], correctIndex: 2, explanation: 'Le transport represente environ 30% de l\'empreinte carbone moyenne, c\'est le premier poste.' },
            { question: 'Quelle part represente l\'alimentation dans l\'empreinte ?', options: ['10%', '25%', '40%', '50%'], correctIndex: 1, explanation: 'L\'alimentation represente environ 25% de l\'empreinte carbone moyenne.' },
            { question: 'A quelle frequence refaire son bilan carbone ?', options: ['Tous les mois', 'Tous les 6 mois', 'Tous les ans', 'Tous les 5 ans'], correctIndex: 1, explanation: 'Tous les 6 mois permet de mesurer les progres et d\'ajuster les actions.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Consommation responsable
    {
      id: 'eco-m2',
      title: 'Consommation responsable',
      emoji: '\u{267B}\u{FE0F}',
      description: 'Adoptez une consommation plus responsable grace aux conseils personnalises de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{267B}\u{FE0F}',
      badgeName: 'Consommateur Eclaire',
      lessons: [
        {
          id: 'eco-m2-l1',
          title: 'Consommer mieux avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La surconsommation est l'un des moteurs principaux de la crise ecologique. Mais consommer responsable ne signifie pas se priver — c'est consommer mieux, plus intelligemment, en faisant des choix informes. L'IA vous aide a naviguer dans la jungle des labels, des alternatives et des pièges marketing.

La regle des 5R guide une consommation responsable : Refuser (ce dont on n'a pas besoin), Reduire (les quantites), Reutiliser (reparer, detourner), Recycler (quand il n'y a pas d'alternative), Rendre a la terre (composter). L'IA applique ces 5R a chaque decision d'achat : "Ai-je vraiment besoin de ce produit ? Existe-t-il en occasion ? Puis-je l'emprunter ou le louer ?"

L'analyse de produit IA est un outil puissant. Decrivez un produit que vous envisagez d'acheter et l'IA vous informe sur : son empreinte carbone estimee, ses alternatives ecologiques, les labels fiables a rechercher, le cout reel sur sa duree de vie. Par exemple : "Je veux acheter un t-shirt en coton." L'IA repond : "Le coton conventionnel consomme 10 000 litres d'eau par t-shirt. Alternatives : coton bio (moins de pesticides), lin (moins d'eau), ou occasion (zero empreinte supplementaire)."

Le greenwashing est le piege numero un du consommateur responsable. Des termes comme "naturel", "eco-friendly" ou "vert" n'ont aucune valeur legale. L'IA Freenzy vous aide a identifier le greenwashing : labels officiels fiables (EU Ecolabel, FSC, Fairtrade, Bio AB) versus auto-declarations marketing. Elle peut analyser les emballages et les claims publicitaires.

L'economie circulaire offre des alternatives a l'achat neuf. L'IA peut vous suggerer : plateformes de seconde main (Vinted, Le Bon Coin, Back Market), repair cafes locaux pour reparer plutot que jeter, bibliotheques d'objets pour emprunter ce dont vous avez besoin temporairement, et recycleries pour donner ce que vous n'utilisez plus.

Le cout reel d'un produit depasse son prix d'achat. Un vetement pas cher qui dure 6 mois coute plus qu'un vetement de qualite qui dure 5 ans. L'IA calcule le "cout par utilisation" pour vous aider a faire des choix economiques ET ecologiques : prix d'achat divise par le nombre d'utilisations estimees.`,
          xpReward: 15,
        },
        {
          id: 'eco-m2-l2',
          title: 'Jeu : Vrai ou greenwashing ?',
          duration: '4 min',
          type: 'game',
          content: 'Identifiez les vrais labels ecologiques versus le greenwashing.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Label AB (Agriculture Biologique)', right: 'Label officiel fiable' },
              { left: '"100% naturel" sur l\'emballage', right: 'Greenwashing potentiel' },
              { left: 'FSC (Forest Stewardship Council)', right: 'Label officiel fiable' },
              { left: '"Eco-friendly" sans certification', right: 'Greenwashing potentiel' },
              { left: 'EU Ecolabel (fleur europeenne)', right: 'Label officiel fiable' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'eco-m2-l3',
          title: 'Quiz : Consommation responsable',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la consommation responsable.',
          quizQuestions: [
            { question: 'Quels sont les 5R de la consommation responsable ?', options: ['Reduire, Recycler, Reparer, Renouveler, Revendre', 'Refuser, Reduire, Reutiliser, Recycler, Rendre a la terre', 'Rechercher, Reflechir, Reduire, Recycler, Respecter', 'Rien, Rarement, Recyclage, Respect, Recompense'], correctIndex: 1, explanation: 'Les 5R : Refuser, Reduire, Reutiliser, Recycler, Rendre a la terre (composter).' },
            { question: 'Combien de litres d\'eau consomme un t-shirt en coton conventionnel ?', options: ['100 litres', '1 000 litres', '10 000 litres', '50 000 litres'], correctIndex: 2, explanation: 'Un t-shirt en coton conventionnel necessité environ 10 000 litres d\'eau pour sa production.' },
            { question: 'Quel terme n\'a AUCUNE valeur legale ?', options: ['Bio AB', 'Eco-friendly', 'FSC', 'EU Ecolabel'], correctIndex: 1, explanation: '"Eco-friendly" est un terme marketing sans definition legale ni controle, contrairement aux labels officiels.' },
            { question: 'Comment calculer le "cout par utilisation" ?', options: ['Prix x nombre d\'utilisations', 'Prix / nombre d\'utilisations', 'Prix - nombre d\'utilisations', 'Prix + livraison'], correctIndex: 1, explanation: 'Cout par utilisation = prix d\'achat divise par le nombre d\'utilisations estimees sur la duree de vie du produit.' },
            { question: 'Quelle est la meilleure option ecologique pour un besoin ponctuel ?', options: ['Acheter neuf en promo', 'Acheter d\'occasion', 'Emprunter ou louer', 'Commander en ligne'], correctIndex: 2, explanation: 'Pour un besoin ponctuel, emprunter ou louer a zero empreinte supplementaire, mieux que l\'achat meme d\'occasion.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Energie et logement
    {
      id: 'eco-m3',
      title: 'Energie et logement durable',
      emoji: '\u{26A1}',
      description: 'Reduisez votre consommation d\'energie et rendez votre logement plus ecologique.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{26A1}',
      badgeName: 'Eco-Energeticien',
      lessons: [
        {
          id: 'eco-m3-l1',
          title: 'Optimiser son energie avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le logement represente 20 pourcent de l'empreinte carbone et jusqu'a 30 pourcent du budget des menages. L'IA peut analyser votre consommation energetique et identifier des economies substantielles, souvent avec des gestes simples et des investissements qui se remboursent rapidement.

Le chauffage est le premier poste de depense energetique du logement (60 a 75 pourcent). Baisser le thermostat de 1 degre reduit la facture de 7 pourcent. L'IA peut calculer l'economie exacte pour votre logement : "Votre maison de 100m2 chauffee au gaz a 21 degres coute 1 400 euros/an. A 20 degres, vous economisez 98 euros/an. A 19 degres le soir, 180 euros/an supplementaires."

L'isolation est l'investissement le plus rentable. L'IA evalue les priorites d'isolation pour votre logement : toiture (30 pourcent des pertes), murs (25 pourcent), fenetres (15 pourcent), sol (10 pourcent). Elle calcule le cout des travaux, les aides disponibles (MaPrimeRenov, CEE, eco-PTZ) et le temps de retour sur investissement. Exemple : "Isoler vos combles pour 3 000 euros (apres aides) vous fera economiser 400 euros/an — rembourse en 7.5 ans."

Les ecogestes quotidiens ont un impact cumule significatif. Eteindre les appareils en veille (10 pourcent de la facture electricite), utiliser des LED partout (80 pourcent d'economie vs ampoules classiques), laver a 30 degres au lieu de 60 (40 pourcent d'economie par lavage), secher a l'air libre, couvrir les casseroles en cuisinant (4 fois moins d'energie). L'IA cree une checklist personnalisee d'ecogestes classes par impact.

Le choix du fournisseur d'energie verte peut reduire votre empreinte carbone liee a l'electricite de 90 pourcent. L'IA compare les offres vertes disponibles dans votre zone : prix, garanties d'origine, part reelle d'energie renouvelable, avis clients. Attention au greenwashing : certaines offres "vertes" ne font qu'acheter des certificats sans financer de nouvelles installations.

L'audit energetique IA synthetise toutes ces informations : votre consommation actuelle, les points d'amelioration par priorite, les investissements recommandes avec ROI, les aides financieres accessibles, et un plan d'action echelonne sur 1 a 3 ans.`,
          xpReward: 15,
        },
        {
          id: 'eco-m3-l2',
          title: 'Exercice : Audit energetique de votre logement',
          duration: '5 min',
          type: 'exercise',
          content: 'Analysez votre consommation d\'energie avec l\'IA.',
          exercisePrompt: `Realisez un mini-audit energetique de votre logement avec l'IA :

1. Description : type de logement, surface, annee de construction, mode de chauffage
2. Factures : montant annuel approximatif d'electricite et de chauffage
3. Isolation : etat actuel (combles, murs, fenetres — isole/pas isole/ne sait pas)
4. Ecogestes : listez 5 ecogestes que vous pratiquez deja et 5 que vous pourriez adopter
5. Investissements : demandez a l'IA de chiffrer les 3 investissements les plus rentables

Criteres de reussite :
- Le profil energetique de votre logement est complet
- Au moins 3 ecogestes faciles sont identifies pour adoption immediate
- Les investissements ont un ROI calcule (cout, economies/an, temps de retour)
- Les aides financieres applicables sont mentionnees`,
          xpReward: 20,
        },
        {
          id: 'eco-m3-l3',
          title: 'Quiz : Energie et logement',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'energie domestique.',
          quizQuestions: [
            { question: 'Baisser le thermostat de 1 degre reduit la facture de combien ?', options: ['2%', '7%', '15%', '25%'], correctIndex: 1, explanation: 'Reduire la temperature de 1 degre permet d\'economiser environ 7% sur la facture de chauffage.' },
            { question: 'Quel est le premier poste de deperdition thermique ?', options: ['Les fenetres', 'Les murs', 'La toiture', 'Le sol'], correctIndex: 2, explanation: 'La toiture represente environ 30% des pertes de chaleur, c\'est le premier poste a isoler.' },
            { question: 'Les appareils en veille representent combien de la facture electrique ?', options: ['2%', '5%', '10%', '20%'], correctIndex: 2, explanation: 'Les appareils en veille representent environ 10% de la facture d\'electricite d\'un menage.' },
            { question: 'Quelle temperature de lavage reduit la consommation de 40% ?', options: ['Laver a l\'eau froide', 'Laver a 30 degres au lieu de 60', 'Laver a 40 degres au lieu de 90', 'Laver a la main'], correctIndex: 1, explanation: 'Passer de 60 a 30 degres pour le lavage du linge reduit la consommation d\'energie de 40%.' },
            { question: 'Quel pourcentage du budget menage le logement represente-t-il ?', options: ['10%', '20%', '30%', '50%'], correctIndex: 2, explanation: 'Le logement (loyer/credit + energie) peut representer jusqu\'a 30% du budget des menages.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Mobilite durable
    {
      id: 'eco-m4',
      title: 'Mobilite durable',
      emoji: '\u{1F6B2}',
      description: 'Repensez vos deplacements pour reduire votre impact carbone avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F6B2}',
      badgeName: 'Mobilite Verte',
      lessons: [
        {
          id: 'eco-m4-l1',
          title: 'Se deplacer autrement avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le transport est le premier poste d'emission de CO2 des menages. Un trajet Paris-Nice en avion emet 250 kg de CO2 par passager, contre 3 kg en TGV — soit 80 fois plus. L'IA vous aide a repenser vos deplacements pour diviser par 2 a 5 votre empreinte transport sans sacrifier votre mobilite.

La voiture individuelle est la cible prioritaire. En France, un automobiliste parcourt en moyenne 12 000 km par an, emettant 2 tonnes de CO2. L'IA analyse vos trajets recurrents et identifie ceux qui peuvent basculer vers des alternatives : velo ou velo electrique pour les trajets de moins de 5 km (50 pourcent des trajets en voiture), transports en commun pour les trajets urbains, covoiturage pour les trajets periurbains.

Le covoiturage divise l'empreinte par le nombre de passagers. L'IA peut identifier vos voisins ou collegues ayant des trajets similaires, calculer les economies (carburant, peage, usure) et proposer un planning de covoiturage. Deux personnes qui covoiturent 5 jours par semaine sur 30 km economisent chacune environ 1 500 euros par an et 1 tonne de CO2.

Le velo electrique est la revolution de la mobilite urbaine. Rayon d'action de 30 a 60 km, cout d'utilisation quasi nul (3 centimes d'electricite aux 100 km), rapide (souvent plus que la voiture en centre-ville). L'IA calcule si le velo electrique est pertinent pour vos trajets : distance, denivele, meteo locale, infrastructure cyclable. Les aides a l'achat peuvent atteindre 900 euros (bonus ecologique + aide locale).

Le train bat l'avion en empreinte carbone et souvent en temps reel porte-a-porte sur les distances moyennes (moins de 700 km). Paris-Lyon : 2h en TGV centre-ville a centre-ville, contre 3h30 en avion (trajet aeroport + securite + embarquement). L'IA compare systematiquement les options train vs avion vs voiture pour chaque trajet : temps, cout, CO2, confort.

Le teletravail est l'option zero emission. Meme 1 jour de teletravail par semaine reduit l'empreinte transport de 20 pourcent. L'IA peut vous aider a negocier le teletravail avec votre employeur en chiffrant les benefices mutuels : gain de temps, reduction des couts, productivite, satisfaction.

Plan d'action IA : demandez a Freenzy d'analyser vos 10 trajets les plus frequents et de proposer une alternative bas carbone pour chacun, avec le calcul d'economie en euros et en CO2.`,
          xpReward: 15,
        },
        {
          id: 'eco-m4-l2',
          title: 'Jeu : Classez les modes de transport par emission',
          duration: '4 min',
          type: 'game',
          content: 'Classez les transports du moins au plus polluant.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Velo / marche : 0 g CO2/km',
              'TGV : 3 g CO2/km par passager',
              'Bus urbain : 68 g CO2/km par passager',
              'Voiture thermique (seul) : 180 g CO2/km',
              'Avion court-courrier : 250 g CO2/km par passager',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'eco-m4-l3',
          title: 'Quiz : Mobilite durable',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la mobilite durable.',
          quizQuestions: [
            { question: 'Combien de fois plus polluant est l\'avion vs le TGV (Paris-Nice) ?', options: ['5 fois', '20 fois', '80 fois', '200 fois'], correctIndex: 2, explanation: 'L\'avion emet environ 80 fois plus de CO2 que le TGV sur le meme trajet.' },
            { question: 'Quel pourcentage des trajets en voiture font moins de 5 km ?', options: ['10%', '30%', '50%', '70%'], correctIndex: 2, explanation: '50% des trajets en voiture font moins de 5 km — une distance facilement realisable en velo.' },
            { question: 'Combien economise le covoiturage domicile-travail par an ?', options: ['300 euros', '800 euros', '1 500 euros', '3 000 euros'], correctIndex: 2, explanation: 'Le covoiturage sur 30 km 5 jours/semaine permet d\'economiser environ 1 500 euros et 1 tonne de CO2 par an.' },
            { question: '1 jour de teletravail par semaine reduit l\'empreinte transport de combien ?', options: ['5%', '10%', '20%', '40%'], correctIndex: 2, explanation: '1 jour de teletravail sur 5 jours ouvrés reduit l\'empreinte transport de 20%.' },
            { question: 'Quel est le cout d\'electricite d\'un velo electrique aux 100 km ?', options: ['3 centimes', '30 centimes', '1 euro', '5 euros'], correctIndex: 0, explanation: 'Le velo electrique consomme environ 3 centimes d\'electricite aux 100 km, soit un cout quasi nul.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Alimentation durable
    {
      id: 'eco-m5',
      title: 'Alimentation durable',
      emoji: '\u{1F966}',
      description: 'Adoptez une alimentation plus ecologique sans sacrifier le plaisir.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F966}',
      badgeName: 'Gourmet Vert',
      lessons: [
        {
          id: 'eco-m5-l1',
          title: 'Manger bien pour la planete',
          duration: '5 min',
          type: 'text',
          content: `L'alimentation represente 25 pourcent de notre empreinte carbone. La bonne nouvelle : c'est le poste ou les changements sont les plus faciles et les plus rapides a mettre en oeuvre. Pas besoin de devenir vegan — des ajustements simples ont un impact enorme.

La viande est le premier levier. Un kilo de boeuf emet 27 kg de CO2 equivalent, contre 6 kg pour le poulet, 2 kg pour les oeufs et 0.7 kg pour les lentilles. Reduire la viande rouge a 1 fois par semaine (au lieu de 3-4) divise l'empreinte alimentaire de 30 pourcent. L'IA Freenzy propose des menus flexitariens delicieux : lundi sans viande, substitution par des legumineuses (lentilles, pois chiches, haricots), recettes de saison.

Le local et de saison est le deuxieme levier. Une tomate cultivee sous serre chauffee en hiver emet 4 fois plus de CO2 qu'une tomate d'ete cultivee en plein champ. L'IA connait la saisonnalite de chaque fruit et legume et vous propose des recettes adaptees au mois en cours. Elle peut aussi identifier les marches locaux, AMAP et producteurs proches de chez vous.

Le gaspillage alimentaire est un scandale ecologique : en France, chaque menage jette 30 kg de nourriture par an, dont 7 kg encore emballes. L'IA vous aide a lutter contre le gaspillage de 3 facons. La planification des repas : menus hebdomadaires bases sur ce que vous avez deja dans le frigo. La gestion des dates : rappels avant expiration des produits. Les recettes anti-gaspi : "J'ai 2 courgettes molles, 3 oeufs et du fromage rape, que puis-je cuisiner ?"

L'eau virtuelle est souvent ignoree. Produire 1 kg de boeuf consomme 15 000 litres d'eau, 1 kg de poulet 4 000 litres, 1 kg de riz 2 500 litres, 1 kg de pommes de terre 900 litres. L'IA peut calculer l'eau virtuelle de votre alimentation et proposer des substitutions a moindre consommation.

Le bio n'est pas toujours la priorite. Un produit bio importe par avion est pire qu'un produit conventionnel local. La hierarchie ecologique est : 1) local et de saison, 2) local et bio, 3) bio importe par bateau, 4) conventionnel local. L'IA vous aide a faire le bon arbitrage pour chaque produit.

Astuce Freenzy : chaque semaine, demandez un menu de 5 diners bas carbone bases sur les fruits et legumes de saison, en precisant vos gouts et votre budget. Vous mangerez mieux, moins cher, et avec un tiers d'empreinte en moins.`,
          xpReward: 15,
        },
        {
          id: 'eco-m5-l2',
          title: 'Exercice : Menu bas carbone de la semaine',
          duration: '5 min',
          type: 'exercise',
          content: 'Generez un menu ecologique personnalise.',
          exercisePrompt: `Creez votre menu bas carbone de la semaine avec l'IA :

1. Saison actuelle : quels fruits et legumes sont de saison ce mois-ci ?
2. Proteines : planifiez les sources de proteines sur 7 jours (max 2 repas viande rouge/semaine)
3. Menu 5 diners : generez 5 recettes utilisant des produits locaux et de saison
4. Anti-gaspi : identifiez 3 aliments dans votre frigo a utiliser en priorite
5. Liste de courses : generez la liste optimisee (sans gaspillage)

Criteres de reussite :
- Le menu utilise des produits de saison
- La viande rouge apparait au maximum 1-2 fois
- Au moins 2 repas incluent des legumineuses
- La liste de courses est optimisee (pas de doublons)
- Le budget est raisonnable`,
          xpReward: 20,
        },
        {
          id: 'eco-m5-l3',
          title: 'Quiz : Alimentation durable',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'alimentation ecologique.',
          quizQuestions: [
            { question: 'Combien de kg de CO2 emet 1 kg de boeuf ?', options: ['5 kg', '12 kg', '27 kg', '50 kg'], correctIndex: 2, explanation: '1 kg de boeuf emet environ 27 kg de CO2 equivalent, c\'est la proteine la plus emissive.' },
            { question: 'Reduire la viande rouge a 1 fois/semaine reduit l\'empreinte alimentaire de combien ?', options: ['10%', '20%', '30%', '50%'], correctIndex: 2, explanation: 'Passer de 3-4 fois a 1 fois par semaine de viande rouge reduit l\'empreinte alimentaire d\'environ 30%.' },
            { question: 'Combien de kg de nourriture un menage francais jette par an ?', options: ['5 kg', '15 kg', '30 kg', '60 kg'], correctIndex: 2, explanation: 'Un menage francais jette en moyenne 30 kg de nourriture par an, dont 7 kg encore emballes.' },
            { question: 'Quelle est la priorite ecologique n1 pour l\'alimentation ?', options: ['Bio importe', 'Local et de saison', 'Vegan industriel', 'Surgele bio'], correctIndex: 1, explanation: 'Local et de saison est toujours la priorite numero 1, devant le bio importe.' },
            { question: 'Combien de litres d\'eau pour produire 1 kg de boeuf ?', options: ['1 000 litres', '5 000 litres', '15 000 litres', '30 000 litres'], correctIndex: 2, explanation: 'La production d\'1 kg de boeuf necessite environ 15 000 litres d\'eau (eau virtuelle).' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Engagement citoyen
    {
      id: 'eco-m6',
      title: 'Engagement ecologique',
      emoji: '\u{270A}',
      description: 'Allez au-dela des gestes individuels et engagez-vous pour le climat avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{270A}',
      badgeName: 'Eco-Citoyen Engage',
      lessons: [
        {
          id: 'eco-m6-l1',
          title: 'S\'engager au-dela de l\'individuel',
          duration: '5 min',
          type: 'text',
          content: `Les gestes individuels sont necessaires mais insuffisants. Pour un impact reel sur le climat, l'engagement collectif et citoyen est indispensable. L'IA peut amplifier votre impact en vous aidant a mobiliser, communiquer et agir a plus grande echelle.

L'action locale est le point de depart le plus efficace. L'IA Freenzy peut identifier les associations ecologiques de votre commune, les projets citoyens en cours (jardins partages, repair cafes, clean walks), les consultations publiques ouvertes et les initiatives de transition ecologique locales. Rejoindre un groupe existant multiplie votre impact par 10 comparé a l'action individuelle.

La communication ecologique est un art que l'IA maitrise. Convaincre son entourage sans culpabiliser est un defi : "Tu prends l'avion ? C'est terrible pour la planete !" est contre-productif. L'IA vous aide a formuler des messages positifs et inspirants : partager vos propres experiences et economies, proposer des alternatives concretes, celebrer les petites victoires plutot que pointer les echecs.

L'engagement aupres des entreprises est un levier puissant. En tant que consommateur, vous pouvez influencer les pratiques des entreprises. L'IA vous aide a rediger des courriers constructifs aux marques que vous consommez : demander plus de transparence, questionner les pratiques d'emballage, suggerer des alternatives ecologiques. Les entreprises ecoutent quand les clients s'expriment.

Le vote et la participation citoyenne sont les leviers les plus puissants. L'IA peut analyser les programmes electoraux sous l'angle ecologique, decrypter les propositions environnementales des candidats, et identifier les enjeux locaux lies au climat (urbanisme, transport, energie). Elle peut aussi vous aider a participer aux consultations publiques en redigeant des contributions argumentees.

La sensibilisation de votre entourage passe par l'exemple et l'enthousiasme. Organisez un "defi ecolo" entre amis ou en famille : 1 mois sans supermarche, 1 semaine vegetarienne, 1 semaine sans voiture. L'IA cree le reglement, suit les progres de chaque participant et cree une saine emulation. Le jeu et le collectif sont bien plus motivants que la culpabilite.

Le pouvoir de l'argent : ou vous placez votre epargne compte autant que vos habitudes. L'IA peut analyser l'impact carbone de vos placements bancaires (certaines banques financent massivement les energies fossiles) et vous orienter vers des alternatives de finance responsable (label ISR, banques ethiques).`,
          xpReward: 15,
        },
        {
          id: 'eco-m6-l2',
          title: 'Jeu : Les niveaux d\'engagement ecologique',
          duration: '4 min',
          type: 'game',
          content: 'Classez les actions du plus simple au plus impactant.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Ecogestes individuels (tri, economies d\'energie)',
              'Changement de consommation (local, occasion, vegetarien)',
              'Engagement associatif local (clean walks, jardins partages)',
              'Influence sur les entreprises (courriers, boycott constructif)',
              'Participation citoyenne et politique (votes, consultations, finance responsable)',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'eco-m6-l3',
          title: 'Quiz : Engagement ecologique',
          duration: '3 min',
          type: 'quiz',
          content: 'Validez vos acquis sur l\'engagement ecologique.',
          quizQuestions: [
            { question: 'Pourquoi les gestes individuels sont-ils insuffisants ?', options: ['Ils sont inutiles', 'Le probleme est uniquement industriel', 'L\'impact collectif et systemique est necessaire en complement', 'Les individus ne polluent pas'], correctIndex: 2, explanation: 'Les gestes individuels sont necessaires mais doivent etre completes par l\'engagement collectif et politique pour un impact reel.' },
            { question: 'Comment convaincre son entourage sans culpabiliser ?', options: ['En montrant des documentaires choquants', 'En partageant ses experiences positives et economies', 'En critiquant leurs habitudes', 'En imposant ses choix'], correctIndex: 1, explanation: 'Partager ses propres experiences positives et les economies realisees est bien plus convaincant que la culpabilisation.' },
            { question: 'Rejoindre un groupe ecologique local multiplie l\'impact par combien ?', options: ['2 fois', '5 fois', '10 fois', '100 fois'], correctIndex: 2, explanation: 'L\'action collective multiplie l\'impact individuel par 10 en moyenne grace a la synergie et la visibilite.' },
            { question: 'Quel est le levier ecologique le plus puissant ?', options: ['Le tri des dechets', 'Le vote et la participation citoyenne', 'L\'alimentation bio', 'Le velo'], correctIndex: 1, explanation: 'Le vote et la participation citoyenne influencent les politiques publiques, le levier le plus puissant pour le changement systemique.' },
            { question: 'Pourquoi l\'epargne a-t-elle un impact ecologique ?', options: ['L\'argent pollue', 'Les banques financent des projets polluants ou vertueux avec votre argent', 'Les billets sont en papier', 'Les distributeurs consomment de l\'electricite'], correctIndex: 1, explanation: 'Votre epargne finance des projets via votre banque. Certaines banques financent massivement les fossiles, d\'autres l\'investissement responsable.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};
