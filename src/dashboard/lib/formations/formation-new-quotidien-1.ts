// =============================================================================
// Freenzy.io — Formation Quotidien 1
// 3 parcours x 6 modules x 3 lessons = 54 lessons, 1800 XP total
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// Parcours 1 — Cuisine IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursCuisineIA: FormationParcours = {
  id: 'cuisine-ia',
  title: 'Cuisine IA',
  emoji: '\u{1F373}',
  description: 'Apprenez a exploiter l\'intelligence artificielle pour revolutionner votre cuisine : recettes personnalisees, meal planning intelligent, listes de courses optimisees, techniques culinaires, nutrition equilibree et anti-gaspillage alimentaire.',
  category: 'quotidien',
  subcategory: 'cuisine',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F97316',
  diplomaTitle: 'Cuisine IA',
  diplomaSubtitle: 'Certification Freenzy.io — Cuisine et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Recettes personnalisees
    {
      id: 'cuisine-m1',
      title: 'Recettes personnalisees',
      emoji: '\u{1F4D6}',
      description: 'Generez des recettes sur mesure adaptees a vos gouts, allergies et ingredients disponibles grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4D6}',
      badgeName: 'Chef Debutant',
      lessons: [
        {
          id: 'cuisine-m1-l1',
          title: 'L\'IA au service de vos recettes',
          duration: '5 min',
          type: 'text',
          content: `La cuisine est un art qui se reinvente grace a l'intelligence artificielle. Fini les heures passees a chercher la recette parfaite dans des livres ou sur des sites encombres de publicites : avec un assistant IA, vous obtenez des recettes personnalisees en quelques secondes, adaptees precisement a vos besoins.

Le principe est simple mais puissant : vous indiquez a l'IA vos contraintes (allergies, regime alimentaire, ingredients disponibles dans votre frigo) et vos preferences (cuisine italienne, plats rapides, recettes vegetariennes). L'assistant genere alors une recette complete avec les quantites exactes, les etapes detaillees et meme des suggestions de presentation.

L'un des atouts majeurs de Freenzy en cuisine est sa capacite a s'adapter en temps reel. Vous n'avez pas d'oeufs ? L'IA propose un substitut (compote de pommes, graines de lin, yaourt). Vous etes intolerant au gluten ? Toutes les farines sont automatiquement remplacees par des alternatives sans gluten comme la farine de riz ou de sarrasin.

Pour obtenir les meilleurs resultats, soyez precis dans vos demandes. Indiquez le nombre de convives, le temps de preparation souhaite, votre niveau en cuisine et les ustensiles dont vous disposez. Par exemple : "Recette pour 4 personnes, sans lactose, prete en 30 minutes, avec du poulet et des legumes de saison."

L'IA apprend aussi de vos retours. Notez vos recettes favorites, signalez celles qui ne vous ont pas plu, et l'assistant affinera ses suggestions au fil du temps. En quelques semaines, vous disposerez d'un repertoire culinaire entierement personnalise, comme un chef personnel qui connait parfaitement vos gouts.

Conseil pratique : commencez par demander des variantes de vos plats preferes. C'est la meilleure facon de decouvrir la puissance de la personnalisation IA en cuisine.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m1-l2',
          title: 'Exercice : Generez votre recette ideale',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un prompt pour obtenir une recette parfaitement adaptee a vos contraintes.',
          exercisePrompt: `Redigez un prompt detaille pour generer votre recette ideale en incluant :

1. Le type de plat (entree, plat principal, dessert)
2. Le nombre de convives et le temps de preparation maximum
3. Au moins 3 ingredients que vous avez dans votre frigo/placard
4. Une contrainte alimentaire (allergie, regime, preference)
5. Le style de cuisine souhaite (francais, italien, asiatique, etc.)
6. Votre niveau en cuisine (debutant, intermediaire, avance)

Soumettez ensuite votre prompt a l'assistant Freenzy et evaluez la pertinence de la recette proposee.

Criteres de reussite :
- Le prompt contient toutes les 6 informations demandees
- La recette generee respecte vos contraintes
- Les etapes sont claires et realisables
- Vous avez identifie au moins une amelioration possible du prompt`,
          xpReward: 20,
        },
        {
          id: 'cuisine-m1-l3',
          title: 'Quiz : Recettes personnalisees avec l\'IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la generation de recettes avec l\'IA.',
          quizQuestions: [
            { question: 'Quel element est le plus important a preciser pour obtenir une recette IA pertinente ?', options: ['La couleur du plat', 'Les contraintes alimentaires et ingredients disponibles', 'Le prix du restaurant', 'La marque des ustensiles'], correctIndex: 1, explanation: 'Les contraintes alimentaires et les ingredients disponibles sont essentiels pour que l\'IA genere une recette realisable et adaptee.' },
            { question: 'Quel substitut l\'IA peut-elle proposer pour remplacer les oeufs dans une recette ?', options: ['De l\'eau gazeuse', 'De la compote de pommes', 'Du vinaigre pur', 'Du sel fin'], correctIndex: 1, explanation: 'La compote de pommes est un substitut classique aux oeufs en patisserie, tout comme les graines de lin ou le yaourt.' },
            { question: 'Pourquoi est-il utile de noter vos recettes generees par l\'IA ?', options: ['Pour impressionner vos amis', 'Pour que l\'IA affine ses suggestions futures', 'Pour publier un livre de cuisine', 'Pour calculer les calories'], correctIndex: 1, explanation: 'Les retours permettent a l\'assistant d\'apprendre vos preferences et d\'ameliorer la pertinence des recettes proposees.' },
            { question: 'Combien d\'informations cles un bon prompt de recette doit-il contenir au minimum ?', options: ['1 seule', '2 ou 3', 'Au moins 4 a 6', 'Plus de 10'], correctIndex: 2, explanation: 'Un prompt efficace inclut le type de plat, le nombre de convives, les ingredients, les contraintes, le style et le niveau — soit 4 a 6 informations cles.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Meal planning intelligent
    {
      id: 'cuisine-m2',
      title: 'Meal planning intelligent',
      emoji: '\u{1F4C5}',
      description: 'Planifiez vos repas de la semaine avec l\'IA pour gagner du temps, manger equilibre et reduire le stress quotidien.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C5}',
      badgeName: 'Planificateur Culinaire',
      lessons: [
        {
          id: 'cuisine-m2-l1',
          title: 'Planifier ses repas avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La planification des repas est l'une des habitudes les plus impactantes pour votre quotidien. Elle reduit le stress du "qu'est-ce qu'on mange ce soir ?", diminue le gaspillage alimentaire de 30 a 50% et vous fait economiser en moyenne 200 euros par mois en evitant les achats impulsifs.

Avec Freenzy, la planification devient un jeu d'enfant. Vous indiquez vos contraintes hebdomadaires (soirs ou vous rentrez tard, dejeuners au bureau, diner avec des invites le samedi) et l'IA genere un planning complet du lundi au dimanche. Chaque repas est equilibre, varie et tient compte de vos preferences alimentaires.

Le meal planning intelligent va plus loin qu'un simple calendrier de recettes. L'IA optimise la reutilisation des ingredients : si vous cuisinez un poulet roti le dimanche, les restes deviennent une salade cesar le lundi et un bouillon maison le mardi. Cette approche en cascade reduit considerablement le gaspillage et le temps de preparation.

L'assistant prend aussi en compte la saisonnalite des produits. En hiver, il privilegiera les soupes, gratins et plats mijotes. En ete, les salades composees, les grillades et les fruits frais. Cette adaptation saisonniere garantit des repas plus savoureux car les ingredients sont au pic de leur maturite, et souvent moins chers car disponibles en abondance.

Pour demarrer, demandez a Freenzy un planning sur 5 jours seulement. Precisez le nombre de repas quotidiens (petit-dejeuner inclus ou non), le budget approximatif et le temps de preparation maximum par repas. L'IA generera un plan coherent que vous pourrez ajuster selon vos envies.

Astuce avancee : demandez un planning avec un "jour de batch cooking" le dimanche, ou vous preparez les bases de plusieurs repas de la semaine en une seule session de cuisine.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m2-l2',
          title: 'Exercice : Votre planning repas hebdomadaire',
          duration: '5 min',
          type: 'exercise',
          content: 'Concevez un planning de repas pour une semaine complete avec l\'aide de l\'IA.',
          exercisePrompt: `Creez votre planning de repas pour une semaine en suivant cette methode :

1. Definissez vos contraintes : budget hebdomadaire, temps de preparation par repas, nombre de personnes
2. Listez vos 5 plats preferes et 3 ingredients que vous voulez utiliser cette semaine
3. Demandez a Freenzy de generer un planning lundi-dimanche (dejeuner + diner)
4. Verifiez que le planning reutilise au moins 2 ingredients dans plusieurs recettes
5. Identifiez un jour de "batch cooking" pour preparer des bases a l'avance

Criteres de reussite :
- 14 repas planifies (7 dejeuners + 7 diners)
- Au moins 2 ingredients reutilises dans plusieurs plats
- Variete des types de cuisine (pas le meme plat deux fois)
- Un jour de preparation a l'avance identifie`,
          xpReward: 20,
        },
        {
          id: 'cuisine-m2-l3',
          title: 'Quiz : Meal planning IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la planification de repas avec l\'IA.',
          quizQuestions: [
            { question: 'De combien le meal planning peut-il reduire le gaspillage alimentaire ?', options: ['5 a 10%', '10 a 20%', '30 a 50%', '80 a 90%'], correctIndex: 2, explanation: 'La planification des repas permet de reduire le gaspillage alimentaire de 30 a 50% en achetant uniquement ce qui est necessaire.' },
            { question: 'Qu\'est-ce que le batch cooking ?', options: ['Cuisiner uniquement des plats surgeles', 'Preparer les bases de plusieurs repas en une seule session', 'Commander des plats en gros sur internet', 'Manger la meme chose toute la semaine'], correctIndex: 1, explanation: 'Le batch cooking consiste a preparer en une session les bases de plusieurs repas de la semaine pour gagner du temps.' },
            { question: 'Pourquoi l\'IA privilegie-t-elle les ingredients de saison ?', options: ['Ils sont plus colores', 'Ils sont plus savoureux et souvent moins chers', 'Ils sont plus rares', 'Ils se conservent moins bien'], correctIndex: 1, explanation: 'Les ingredients de saison sont au pic de leur maturite donc plus savoureux, et leur abondance les rend generalement moins chers.' },
            { question: 'Quel est l\'avantage de la reutilisation des ingredients dans le planning ?', options: ['Manger la meme chose tous les jours', 'Reduire le gaspillage et le temps de preparation', 'Augmenter le budget courses', 'Simplifier la vaisselle'], correctIndex: 1, explanation: 'Reutiliser les ingredients (ex: poulet roti → salade → bouillon) reduit le gaspillage et optimise le temps en cuisine.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Liste de courses IA
    {
      id: 'cuisine-m3',
      title: 'Liste de courses IA',
      emoji: '\u{1F6D2}',
      description: 'Generez des listes de courses intelligentes, optimisees par rayon et par budget, directement depuis vos menus.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F6D2}',
      badgeName: 'Acheteur Malin',
      lessons: [
        {
          id: 'cuisine-m3-l1',
          title: 'Generer une liste de courses optimisee',
          duration: '5 min',
          type: 'text',
          content: `Faire ses courses peut etre une corvee chronophage et couteuse si l'on n'est pas organise. L'intelligence artificielle transforme cette tache en un processus fluide et optimise qui vous fait gagner du temps et de l'argent a chaque passage en magasin.

Le principe est elegant : a partir de votre planning de repas hebdomadaire, l'IA genere automatiquement une liste de courses complete. Elle additionne les quantites necessaires pour chaque ingredient (si deux recettes demandent des oignons, elle calcule le total), verifie ce que vous avez deja en stock et organise la liste par rayon de supermarche.

L'organisation par rayon est un gain de temps considerable. Au lieu de faire des allers-retours dans le magasin, vous suivez un parcours lineaire : fruits et legumes, boucherie, cremerie, epicerie seche, surgeles. Freenzy connait la disposition typique des supermarches et ordonne votre liste en consequence.

L'optimisation budgetaire est un autre atout majeur. Indiquez votre budget hebdomadaire et l'IA ajuste les recettes en consequence. Elle peut suggerer des alternatives moins couteuses (cuisses de poulet au lieu de filets, legumineuses au lieu de viande pour certains repas) tout en maintenant l'equilibre nutritionnel. Elle identifie aussi les produits de saison, generalement 20 a 40% moins chers que les produits hors saison.

L'IA detecte egalement les doublons et les quantites excessives. Si votre planning demande 100g de parmesan pour une recette et 50g pour une autre, la liste indiquera un seul achat de 150g au lieu de deux achats separes. Pour les produits frais a duree de conservation limitee, elle ajuste les quantites au plus juste.

Conseil pratique : partagez votre liste generee avec les membres de votre foyer via un simple copier-coller. Chacun peut alors completer ses propres besoins avant la course finale.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m3-l2',
          title: 'Exercice : Liste de courses intelligente',
          duration: '5 min',
          type: 'game',
          content: 'Associez chaque fonctionnalite a son benefice pour maitriser la liste de courses IA.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Organisation par rayon', right: 'Parcours lineaire en magasin' },
              { left: 'Calcul des quantites', right: 'Pas de doublons ni de surplus' },
              { left: 'Budget automatique', right: 'Alternatives moins couteuses' },
              { left: 'Detection saisonniere', right: 'Produits 20-40% moins chers' },
              { left: 'Consolidation ingredients', right: 'Un seul achat au lieu de plusieurs' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'cuisine-m3-l3',
          title: 'Quiz : Liste de courses IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la generation de listes de courses avec l\'IA.',
          quizQuestions: [
            { question: 'Pourquoi l\'IA organise-t-elle la liste de courses par rayon ?', options: ['Pour faire plus joli', 'Pour suivre un parcours lineaire et gagner du temps', 'Pour acheter plus de produits', 'Pour eviter les promotions'], correctIndex: 1, explanation: 'L\'organisation par rayon permet de suivre un parcours lineaire dans le magasin et d\'eviter les allers-retours inutiles.' },
            { question: 'Comment l\'IA gere-t-elle les ingredients communs a plusieurs recettes ?', options: ['Elle les ignore', 'Elle les met en double', 'Elle additionne les quantites en un seul achat', 'Elle les supprime'], correctIndex: 2, explanation: 'L\'IA consolide les ingredients identiques en additionnant les quantites necessaires pour toutes les recettes de la semaine.' },
            { question: 'De combien les produits de saison sont-ils generalement moins chers ?', options: ['5 a 10%', '20 a 40%', '50 a 70%', '80 a 90%'], correctIndex: 1, explanation: 'Les produits de saison sont generalement 20 a 40% moins chers car ils sont disponibles en abondance sur le marche.' },
            { question: 'Que fait l\'IA si votre budget est depasse ?', options: ['Elle supprime des repas', 'Elle propose des alternatives moins couteuses', 'Elle ignore le budget', 'Elle ajoute des surgeles'], correctIndex: 1, explanation: 'L\'IA suggere des alternatives plus economiques (legumineuses au lieu de viande, produits de saison) tout en maintenant l\'equilibre nutritionnel.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Techniques culinaires
    {
      id: 'cuisine-m4',
      title: 'Techniques culinaires',
      emoji: '\u{1F525}',
      description: 'Maitrisez les techniques de cuisine essentielles avec un coach IA qui vous guide etape par etape.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F525}',
      badgeName: 'Technicien du Gout',
      lessons: [
        {
          id: 'cuisine-m4-l1',
          title: 'Maitriser les techniques avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Les techniques culinaires sont le socle de toute cuisine reussie. Qu'il s'agisse de saisir une viande, emincer un oignon ou realiser une sauce, chaque geste a son importance. L'intelligence artificielle devient ici un veritable professeur de cuisine personnel, disponible 24 heures sur 24.

Les cinq techniques fondamentales que tout cuisinier amateur doit maitriser sont : la decoupe (emincer, ciseler, brunoise), la cuisson (sauter, braiser, rotir, pocher), l'assaisonnement (equilibre sel-acide-gras-sucre), les sauces de base (bechamel, vinaigrette, reduction) et les temperatures (repos de la viande, point de fumee des huiles). Chacune peut etre apprise progressivement avec les conseils de l'IA.

Avec Freenzy, vous pouvez demander des explications detaillees sur n'importe quelle technique. L'assistant decrit chaque etape avec precision : "Pour emincer un oignon, coupez-le en deux dans le sens de la hauteur, posez la face plate sur la planche, faites des incisions horizontales sans aller jusqu'au bout, puis des incisions verticales, et enfin tranchez perpendiculairement."

L'IA excelle aussi dans le depannage en temps reel. Votre sauce est trop liquide ? Demandez a Freenzy comment l'epaissir (roux, fecule, reduction). Votre gateau n'a pas leve ? L'assistant diagnostique les causes possibles (levure perimee, temperature du four, surmelange de la pate) et propose des solutions pour la prochaine fois.

Un avantage unique de l'IA est sa capacite a adapter les explications a votre niveau. Un debutant recevra des instructions simples avec des reperes visuels ("la viande est prete quand elle est doree comme une croute de pain"). Un cuisinier avance obtiendra des precisions techniques (temperature interne de 63 degres pour un magret saignant a coeur).

Astuce : demandez a Freenzy de vous creer un programme d'apprentissage sur 4 semaines, une technique par semaine, avec des exercices pratiques quotidiens de 15 minutes.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m4-l2',
          title: 'Exercice : Diagnostiquez un probleme de cuisson',
          duration: '5 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour diagnostiquer et resoudre un probleme culinaire.',
          exercisePrompt: `Choisissez un probleme culinaire que vous avez deja rencontre (ou inventez-en un) et utilisez Freenzy pour le diagnostiquer :

1. Decrivez le probleme en detail (ex: "Mon gateau au chocolat retombe systematiquement apres la cuisson")
2. Indiquez la recette suivie et les etapes realisees
3. Demandez a l'IA d'identifier les causes possibles (listez-en au moins 3)
4. Pour chaque cause, notez la solution proposee par l'assistant
5. Identifiez quelle cause est la plus probable dans votre cas

Criteres de reussite :
- Le probleme est decrit avec precision
- Au moins 3 causes identifiees par l'IA
- Une solution concrete pour chaque cause
- Une conclusion sur la cause la plus probable`,
          xpReward: 20,
        },
        {
          id: 'cuisine-m4-l3',
          title: 'Quiz : Techniques culinaires',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les techniques culinaires assistees par l\'IA.',
          quizQuestions: [
            { question: 'Quelles sont les cinq techniques culinaires fondamentales ?', options: ['Decoupe, cuisson, assaisonnement, sauces, temperatures', 'Achats, stockage, preparation, service, vaisselle', 'Entree, plat, dessert, fromage, cafe', 'Mixage, filtrage, centrifugation, decantation, distillation'], correctIndex: 0, explanation: 'Les cinq techniques fondamentales sont la decoupe, la cuisson, l\'assaisonnement, les sauces de base et la maitrise des temperatures.' },
            { question: 'Comment l\'IA adapte-t-elle ses explications selon le niveau du cuisinier ?', options: ['Elle ne s\'adapte pas', 'Reperes visuels simples pour debutants, precisions techniques pour avances', 'Elle utilise uniquement des videos', 'Elle donne toujours les memes instructions'], correctIndex: 1, explanation: 'L\'IA adapte son langage : reperes visuels pour les debutants (dore comme une croute de pain) et precisions techniques pour les avances (63 degres a coeur).' },
            { question: 'Que faire si votre sauce est trop liquide selon l\'IA ?', options: ['Ajouter de l\'eau', 'Utiliser un roux, de la fecule ou reduire', 'Mettre au congelateur', 'Recommencer entierement'], correctIndex: 1, explanation: 'L\'IA propose plusieurs solutions : ajouter un roux (beurre+farine), diluer de la fecule ou reduire la sauce par evaporation.' },
            { question: 'Quelle est la temperature interne recommandee pour un magret saignant ?', options: ['45 degres', '53 degres', '63 degres', '75 degres'], correctIndex: 2, explanation: 'Un magret de canard saignant a coeur atteint une temperature interne d\'environ 63 degres Celsius.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Nutrition equilibree
    {
      id: 'cuisine-m5',
      title: 'Nutrition equilibree',
      emoji: '\u{1F34E}',
      description: 'Utilisez l\'IA pour equilibrer vos repas, comprendre les macronutriments et atteindre vos objectifs de sante.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F34E}',
      badgeName: 'Nutritionniste IA',
      lessons: [
        {
          id: 'cuisine-m5-l1',
          title: 'Equilibrer ses repas avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La nutrition est un domaine ou l'intelligence artificielle apporte une valeur considerable. Calculer les macronutriments, equilibrer les repas sur une semaine et adapter son alimentation a ses objectifs de sante sont des taches complexes que l'IA simplifie radicalement.

Les trois macronutriments essentiels sont les proteines (construction musculaire et reparation cellulaire), les glucides (energie principale du corps et du cerveau) et les lipides (hormones, absorption des vitamines, protection des organes). Un repas equilibre contient idealement 25 a 30% de proteines, 45 a 55% de glucides et 25 a 30% de lipides. L'IA calcule ces proportions automatiquement pour chaque recette.

Freenzy va au-dela des simples calculs. L'assistant analyse votre alimentation sur une semaine entiere et identifie les carences potentielles. Manquez-vous de fer ? Il suggerera d'integrer plus de lentilles, de boeuf ou d'epinards. Votre apport en omega-3 est insuffisant ? Il proposera des recettes a base de poisson gras, de noix ou de graines de lin.

L'IA personnalise aussi vos besoins selon vos objectifs. Pour une perte de poids saine, elle calcule un deficit calorique modere (300 a 500 kcal/jour) tout en maintenant un apport proteique suffisant pour preserver la masse musculaire. Pour un sportif, elle augmente les glucides complexes autour des entrainements et les proteines en phase de recuperation.

Les micronutriments ne sont pas oublies. L'assistant verifie que vos menus couvrent les apports recommandes en vitamines (A, B, C, D, E, K) et mineraux (fer, calcium, magnesium, zinc). Si une carence est detectee, il ne se contente pas de la signaler : il modifie concretement votre planning de repas pour la corriger naturellement.

Important : l'IA ne remplace pas un nutritionniste ou un medecin pour les problemes de sante serieux. Elle est un outil d'accompagnement au quotidien pour manger mieux sans se prendre la tete.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m5-l2',
          title: 'Exercice : Analysez votre journee alimentaire',
          duration: '5 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour analyser l\'equilibre nutritionnel de vos repas quotidiens.',
          exercisePrompt: `Analysez une journee alimentaire typique avec l'aide de Freenzy :

1. Notez tout ce que vous avez mange hier (petit-dejeuner, dejeuner, gouter, diner, snacks)
2. Soumettez cette liste a l'assistant IA et demandez une analyse nutritionnelle
3. Identifiez les macronutriments dominants et manquants
4. Repererez les carences en micronutriments eventuelles
5. Demandez a l'IA de proposer 3 ameliorations concretes pour equilibrer vos repas

Criteres de reussite :
- Tous les repas et snacks de la journee sont listes
- Les proportions proteines/glucides/lipides sont evaluees
- Au moins une carence en micronutriment est identifiee
- 3 ameliorations concretes et realisables sont proposees`,
          xpReward: 20,
        },
        {
          id: 'cuisine-m5-l3',
          title: 'Quiz : Nutrition et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la nutrition assistee par l\'IA.',
          quizQuestions: [
            { question: 'Quels sont les trois macronutriments essentiels ?', options: ['Vitamines, mineraux, fibres', 'Proteines, glucides, lipides', 'Calcium, fer, zinc', 'Eau, sel, sucre'], correctIndex: 1, explanation: 'Les trois macronutriments sont les proteines, les glucides et les lipides. Les vitamines et mineraux sont des micronutriments.' },
            { question: 'Quelle proportion de proteines un repas equilibre doit-il contenir ?', options: ['5 a 10%', '15 a 20%', '25 a 30%', '50 a 60%'], correctIndex: 2, explanation: 'Un repas equilibre contient idealement 25 a 30% de proteines, 45 a 55% de glucides et 25 a 30% de lipides.' },
            { question: 'Quel deficit calorique l\'IA recommande-t-elle pour une perte de poids saine ?', options: ['100 kcal/jour', '300 a 500 kcal/jour', '1000 kcal/jour', '2000 kcal/jour'], correctIndex: 1, explanation: 'Un deficit modere de 300 a 500 kcal/jour permet une perte de poids progressive et durable sans effets nefastes sur la sante.' },
            { question: 'Que fait l\'IA si elle detecte une carence en micronutriments ?', options: ['Elle prescrit des complements', 'Elle modifie le planning de repas pour corriger naturellement', 'Elle ne fait rien', 'Elle supprime des repas'], correctIndex: 1, explanation: 'L\'IA modifie concretement le planning de repas pour combler les carences par l\'alimentation, sans prescrire de complements.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Anti-gaspillage alimentaire
    {
      id: 'cuisine-m6',
      title: 'Anti-gaspillage alimentaire',
      emoji: '\u{267B}\u{FE0F}',
      description: 'Luttez contre le gaspillage alimentaire grace a l\'IA : gestion des restes, conservation, et recettes zero-dechet.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{267B}\u{FE0F}',
      badgeName: 'Zero Dechet Culinaire',
      lessons: [
        {
          id: 'cuisine-m6-l1',
          title: 'L\'IA contre le gaspillage alimentaire',
          duration: '5 min',
          type: 'text',
          content: `Le gaspillage alimentaire est un probleme majeur : en France, chaque foyer jette en moyenne 30 kilos de nourriture par an, dont 7 kilos encore emballes. L'intelligence artificielle offre des solutions concretes pour reduire drastiquement ce gachis tout en faisant des economies substantielles.

La premiere strategie est la cuisine des restes. Photographiez ou listez les ingredients qui trainent dans votre frigo et demandez a Freenzy de generer une recette a partir de ces restes. L'IA est particulierement douee pour transformer un fond de legumes, un reste de riz et un bout de fromage en un gratin savoureux ou une poele creative. Plus besoin de jeter ce qui semble inutilisable.

La gestion des dates de peremption est un autre levier puissant. Indiquez a l'assistant les produits qui approchent de leur date limite et il reorganise votre planning de repas pour les integrer en priorite. Cette approche FIFO (First In, First Out) est utilisee par les restaurants professionnels et l'IA la rend accessible a tous les foyers.

Les techniques de conservation prolongent considerablement la duree de vie des aliments. L'IA vous enseigne quels fruits et legumes stocker ensemble ou separer (les pommes accelerent le murissement des bananes), les temperatures optimales de refrigeration par type d'aliment, et les methodes de conservation comme la congelation, le marinage ou la lacto-fermentation.

La cuisine zero-dechet va encore plus loin. Les epluchures de legumes deviennent des chips au four ou des bouillons. Les fanes de carottes et de radis se transforment en pesto. Le pain rassis devient du pain perdu ou de la chapelure. L'IA connait des dizaines de recettes pour chaque type de "dechet" alimentaire.

Objectif realiste : en appliquant ces strategies pendant un mois avec l'aide de Freenzy, vous pouvez reduire votre gaspillage de 50% et economiser entre 50 et 100 euros. Un impact positif pour votre portefeuille et pour la planete.`,
          xpReward: 15,
        },
        {
          id: 'cuisine-m6-l2',
          title: 'Exercice : Recette anti-gaspillage',
          duration: '5 min',
          type: 'game',
          content: 'Classez les actions anti-gaspillage de la plus impactante a la moins impactante.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Planifier ses repas a l\'avance',
              'Cuisiner les restes en priorite',
              'Verifier les dates de peremption regulierement',
              'Apprendre les techniques de conservation',
              'Transformer les epluchures en recettes',
            ],
            correctOrder: [0, 1, 2, 3, 4],
          },
          xpReward: 20,
        },
        {
          id: 'cuisine-m6-l3',
          title: 'Quiz : Anti-gaspillage IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la lutte anti-gaspillage avec l\'IA.',
          quizQuestions: [
            { question: 'Combien de kilos de nourriture un foyer francais jette-t-il en moyenne par an ?', options: ['5 kilos', '15 kilos', '30 kilos', '60 kilos'], correctIndex: 2, explanation: 'En France, chaque foyer jette en moyenne 30 kilos de nourriture par an, dont 7 kilos encore emballes.' },
            { question: 'Que signifie la methode FIFO en cuisine ?', options: ['Fast In, Fast Out', 'First In, First Out — utiliser les produits les plus anciens en premier', 'Freeze It, Forget It, Order more', 'Fresh Ingredients For Ovens'], correctIndex: 1, explanation: 'FIFO (First In, First Out) signifie utiliser en priorite les produits achetes en premier, comme le font les restaurants professionnels.' },
            { question: 'Quel fruit accelere le murissement des bananes s\'il est stocke a cote ?', options: ['L\'orange', 'Le citron', 'La pomme', 'La fraise'], correctIndex: 2, explanation: 'Les pommes degagent de l\'ethylene, un gaz qui accelere le murissement des fruits voisins comme les bananes.' },
            { question: 'Combien peut-on economiser en un mois avec des strategies anti-gaspillage IA ?', options: ['5 a 10 euros', '20 a 30 euros', '50 a 100 euros', '200 a 300 euros'], correctIndex: 2, explanation: 'En appliquant les strategies anti-gaspillage avec l\'aide de l\'IA pendant un mois, on peut economiser entre 50 et 100 euros.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 2 — Jardinage IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursJardinageIA: FormationParcours = {
  id: 'jardinage-ia',
  title: 'Jardinage IA',
  emoji: '\u{1F331}',
  description: 'Exploitez l\'intelligence artificielle pour planifier votre jardin, identifier les plantes, maitriser la saisonnalite, optimiser l\'arrosage, decouvrir la permaculture et creer un potager connecte.',
  category: 'quotidien',
  subcategory: 'jardinage',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#22C55E',
  diplomaTitle: 'Jardinage IA',
  diplomaSubtitle: 'Certification Freenzy.io — Jardinage et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Planification du jardin
    {
      id: 'jardinage-m1',
      title: 'Planification du jardin',
      emoji: '\u{1F5FA}\u{FE0F}',
      description: 'Planifiez l\'amenagement de votre jardin ou balcon avec l\'aide de l\'IA selon votre espace, climat et objectifs.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F5FA}\u{FE0F}',
      badgeName: 'Architecte Vert',
      lessons: [
        {
          id: 'jardinage-m1-l1',
          title: 'Planifier son jardin avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Que vous disposiez d'un grand jardin, d'un petit balcon ou d'un simple rebord de fenetre, l'intelligence artificielle vous aide a planifier un espace vert productif et harmonieux. La planification est l'etape la plus importante : un jardin bien concu demande 50% moins d'entretien qu'un jardin improvise.

La premiere etape consiste a decrire votre espace a l'IA. Indiquez la surface disponible (meme approximative), l'orientation (nord, sud, est, ouest), l'ensoleillement quotidien (ombre, mi-ombre, plein soleil), le type de sol (argileux, sableux, limoneux) et votre zone climatique. Freenzy utilise ces informations pour recommander les plantes les mieux adaptees.

L'IA excelle dans la planification spatiale. Elle organise votre jardin en zones logiques : un coin aromatiques pres de la cuisine, les tomates et courgettes dans la zone la plus ensoleillee, les salades a mi-ombre pour eviter qu'elles ne montent en graines trop vite. Pour un balcon, elle optimise l'espace vertical avec des jardinieres suspendues et des treillis.

Le compagnonnage des plantes est un concept fondamental que l'IA maitrise parfaitement. Certaines plantes se renforcent mutuellement : les tomates adorent le basilic (qui repousse les pucerons), les carottes s'entendent bien avec les poireaux (chacun eloigne les parasites de l'autre), et les capucines attirent les pucerons loin de vos legumes. A l'inverse, ne plantez jamais les tomates pres des pommes de terre (memes maladies).

Freenzy peut aussi generer un calendrier de plantation precis, mois par mois, adapte a votre region. Vous savez exactement quand semer, repiquer, pailler et recolter chaque variete. Ce calendrier tient compte des dates de gel, de la duree du jour et des temperatures moyennes de votre zone.

Conseil : commencez petit. Demandez a l'IA un plan pour 5 plantes maximum la premiere annee. Vous agrandirez progressivement en fonction de vos succes et de votre temps disponible.`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m1-l2',
          title: 'Exercice : Concevez votre plan de jardin',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un plan de jardin personnalise avec l\'aide de l\'IA.',
          exercisePrompt: `Concevez un plan de jardin ou de balcon personnalise avec Freenzy :

1. Decrivez votre espace (surface, orientation, ensoleillement, type de sol ou contenant)
2. Indiquez vos objectifs (potager, fleurs, aromatiques, ou mixte)
3. Precisez votre temps disponible par semaine pour l'entretien
4. Demandez a l'IA de generer un plan avec 5 a 8 plantes adaptees
5. Verifiez les associations de compagnonnage (quelles plantes voisines)

Criteres de reussite :
- L'espace est decrit avec au moins 4 caracteristiques
- Le plan contient 5 a 8 plantes avec leur emplacement
- Les associations de compagnonnage sont respectees
- Un calendrier de plantation est inclus`,
          xpReward: 20,
        },
        {
          id: 'jardinage-m1-l3',
          title: 'Quiz : Planification du jardin',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la planification de jardin avec l\'IA.',
          quizQuestions: [
            { question: 'Combien d\'entretien en moins demande un jardin bien planifie ?', options: ['10%', '25%', '50%', '75%'], correctIndex: 2, explanation: 'Un jardin bien concu demande environ 50% moins d\'entretien qu\'un jardin improvise grace a un placement optimal des plantes.' },
            { question: 'Quelle plante aromatique repousse les pucerons des tomates ?', options: ['Le thym', 'Le basilic', 'Le romarin', 'La ciboulette'], correctIndex: 1, explanation: 'Le basilic est un excellent compagnon de la tomate : il repousse les pucerons et ameliore meme le gout des fruits selon certains jardiniers.' },
            { question: 'Pourquoi ne faut-il pas planter les tomates pres des pommes de terre ?', options: ['Elles se volent la lumiere', 'Elles partagent les memes maladies', 'Elles ont besoin du meme sol', 'Elles poussent trop vite'], correctIndex: 1, explanation: 'Les tomates et les pommes de terre appartiennent a la meme famille (solanacees) et sont sensibles aux memes maladies, notamment le mildiou.' },
            { question: 'Ou faut-il placer les salades dans un jardin ?', options: ['En plein soleil', 'A mi-ombre', 'A l\'ombre totale', 'Pres des tomates uniquement'], correctIndex: 1, explanation: 'Les salades preferent la mi-ombre, surtout en ete. Un ensoleillement excessif les fait monter en graines prematurement.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Saisonnalite
    {
      id: 'jardinage-m2',
      title: 'Saisonnalite et calendrier',
      emoji: '\u{1F343}',
      description: 'Maitrisez le calendrier du jardinier avec l\'IA pour semer, planter et recolter au bon moment.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F343}',
      badgeName: 'Maitre des Saisons',
      lessons: [
        {
          id: 'jardinage-m2-l1',
          title: 'Le calendrier du jardinier IA',
          duration: '5 min',
          type: 'text',
          content: `Le respect des saisons est le secret numero un d'un jardin productif. Chaque plante a une fenetre optimale de semis, de repiquage et de recolte. L'intelligence artificielle transforme ces connaissances complexes en un calendrier personnalise clair et actionnable.

Le cycle annuel du jardinier se decompose en quatre phases. Au printemps (mars-mai), c'est le temps des semis en interieur puis des repiquages progressifs apres les Saints de Glace (11-13 mai en France). En ete (juin-aout), l'entretien domine : arrosage, desherbage, taille et recolte des legumes d'ete (tomates, courgettes, haricots). L'automne (septembre-novembre) est consacre aux recoltes tardives, aux semis de cultures d'hiver et a la preparation du sol. L'hiver (decembre-fevrier) permet de planifier, commander les graines et proteger les plantes fragiles.

Freenzy genere un calendrier specifique a votre region. En zone mediterraneenne, les semis commencent des fevrier et les gelees sont rares. En zone continentale, il faut souvent attendre fin mai pour les plantes geleives. L'IA ajuste automatiquement les dates en fonction de votre code postal ou de votre zone USDA (echelle internationale de rusticite).

La rotation des cultures est un concept essentiel que l'IA planifie pour vous. On ne plante jamais la meme famille de legumes au meme endroit deux annees consecutives. Les solanacees (tomates, poivrons) suivent les legumineuses (haricots, pois) qui ont enrichi le sol en azote. Les cucurbitacees (courgettes, courges) profitent d'un sol enrichi au compost. L'IA memorise votre historique de plantation et genere automatiquement la rotation ideale.

L'assistant peut aussi vous alerter des periodes critiques. Il vous previent quand semer vos tomates en interieur (6 a 8 semaines avant le dernier gel), quand pailler vos fraisiers (avant les premieres gelees) ou quand tailler vos rosiers (fin fevrier, quand les forsythias fleurissent — un indicateur naturel fiable).

Astuce : demandez a Freenzy un recapitulatif mensuel de toutes les taches a faire dans votre jardin. Un seul prompt par mois suffit pour ne rien oublier.`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m2-l2',
          title: 'Exercice : Votre calendrier de semis',
          duration: '5 min',
          type: 'game',
          content: 'Associez chaque legume a sa periode de semis optimale.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Tomates (semis interieur)', right: 'Fevrier-Mars' },
              { left: 'Haricots verts (pleine terre)', right: 'Mai-Juin' },
              { left: 'Radis (pleine terre)', right: 'Mars-Septembre' },
              { left: 'Mache (pleine terre)', right: 'Aout-Octobre' },
              { left: 'Ail (plantation)', right: 'Octobre-Novembre' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'jardinage-m2-l3',
          title: 'Quiz : Saisonnalite au jardin',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur le calendrier du jardinier.',
          quizQuestions: [
            { question: 'Quand ont lieu les Saints de Glace en France ?', options: ['1er-3 mars', '11-13 mai', '21-23 juin', '1er-3 septembre'], correctIndex: 1, explanation: 'Les Saints de Glace (11-13 mai) marquent traditionnellement la fin des risques de gelees tardives en France.' },
            { question: 'Pourquoi pratique-t-on la rotation des cultures ?', options: ['Pour decorer le jardin differemment', 'Pour eviter l\'epuisement du sol et les maladies', 'Pour utiliser plus de graines', 'Pour arroser moins souvent'], correctIndex: 1, explanation: 'La rotation evite l\'epuisement des memes nutriments dans le sol et rompt le cycle des maladies et parasites specifiques a chaque famille.' },
            { question: 'Quelle famille de plantes enrichit naturellement le sol en azote ?', options: ['Les solanacees (tomates)', 'Les cucurbitacees (courgettes)', 'Les legumineuses (haricots, pois)', 'Les alliacees (ail, oignon)'], correctIndex: 2, explanation: 'Les legumineuses fixent l\'azote atmospherique dans le sol grace a des bacteries symbiotiques sur leurs racines.' },
            { question: 'Combien de semaines avant le dernier gel faut-il semer les tomates en interieur ?', options: ['2 semaines', '4 semaines', '6 a 8 semaines', '12 semaines'], correctIndex: 2, explanation: 'Les tomates se sement en interieur 6 a 8 semaines avant le dernier gel prevu pour obtenir des plants assez robustes au repiquage.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Identification des plantes
    {
      id: 'jardinage-m3',
      title: 'Identification des plantes',
      emoji: '\u{1F33F}',
      description: 'Apprenez a identifier les plantes, diagnostiquer les maladies et reconnaitre les adventices avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F33F}',
      badgeName: 'Botaniste Numerique',
      lessons: [
        {
          id: 'jardinage-m3-l1',
          title: 'Identifier les plantes avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `L'identification des plantes est une competence fondamentale pour tout jardinier. Savoir reconnaitre ce qui pousse dans votre jardin — plantes cultivees, adventices, fleurs sauvages — vous permet de prendre les bonnes decisions d'entretien. L'intelligence artificielle rend cette identification accessible a tous, meme sans aucune connaissance botanique prealable.

Le moyen le plus simple d'identifier une plante avec Freenzy est de la decrire. Indiquez la forme des feuilles (rondes, allongees, dentees, lobees), la couleur et la forme des fleurs, la hauteur de la plante, le type de tige (ligneuse, herbacee) et l'endroit ou elle pousse (ombre, soleil, sol humide). L'IA croise ces criteres pour proposer une identification avec un degre de confiance.

Au-dela de l'identification, l'IA diagnostique les maladies. Des taches jaunes sur les feuilles de vos rosiers ? C'est probablement la maladie des taches noires (marssonina). Un feutrage blanc sur vos courgettes ? L'oidium, un champignon favorise par les ecarts de temperature jour-nuit. Des galeries dans vos feuilles de tomates ? La mineuse, une larve de mouche. Pour chaque diagnostic, Freenzy propose un traitement adapte, en privilegiant les solutions naturelles.

La reconnaissance des adventices (communement appelees "mauvaises herbes") est egalement cruciale. Certaines sont en realite benefiques : le trefle enrichit le sol en azote, la consoude produit un excellent engrais liquide, et le pissenlit attire les pollinisateurs. L'IA vous aide a distinguer les adventices utiles de celles qui concurrencent veritablement vos cultures.

L'assistant connait aussi les plantes toxiques courantes dans les jardins francais. Il peut vous alerter si vous avez du muguet (toxique par ingestion), de la digitale (dangereuse pour le coeur) ou du datura (hallucinogene et potentiellement mortel). Cette information est vitale si vous avez des enfants ou des animaux domestiques.

Conseil : constituez un herbier numerique avec Freenzy. Decrivez chaque plante de votre jardin et l'IA creera une fiche complete avec les soins specifiques, les maladies a surveiller et le calendrier d'entretien.`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m3-l2',
          title: 'Exercice : Diagnostiquez une maladie vegetale',
          duration: '5 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour diagnostiquer un probleme sur une plante.',
          exercisePrompt: `Choisissez une plante de votre jardin ou une plante d'interieur et pratiquez un diagnostic IA :

1. Decrivez la plante (espece si connue, taille, age approximatif)
2. Decrivez les symptomes observes (feuilles jaunies, taches, insectes, croissance lente, etc.)
3. Indiquez les conditions de culture (emplacement, arrosage, ensoleillement, dernier rempotage)
4. Soumettez ces informations a Freenzy et notez le diagnostic propose
5. Appliquez le traitement recommande et planifiez un suivi

Si aucune plante n'est malade, decrivez un scenario fictif realiste.

Criteres de reussite :
- La plante et ses symptomes sont decrits en detail
- Les conditions de culture sont precisees
- Le diagnostic de l'IA est note avec son explication
- Un plan de traitement concret est etabli`,
          xpReward: 20,
        },
        {
          id: 'jardinage-m3-l3',
          title: 'Quiz : Identification et diagnostic',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'identification des plantes et le diagnostic IA.',
          quizQuestions: [
            { question: 'Quel champignon cause un feutrage blanc sur les courgettes ?', options: ['Le mildiou', 'L\'oidium', 'La rouille', 'La fumagine'], correctIndex: 1, explanation: 'L\'oidium est un champignon qui forme un feutrage blanc poudreux sur les feuilles, favorise par les ecarts de temperature.' },
            { question: 'Quelle adventice enrichit naturellement le sol en azote ?', options: ['Le liseron', 'Le chiendent', 'Le trefle', 'L\'ortie'], correctIndex: 2, explanation: 'Le trefle est une legumineuse qui fixe l\'azote atmospherique dans le sol grace a ses nodules racinaires.' },
            { question: 'Quelle plante de jardin courante est potentiellement mortelle par ingestion ?', options: ['Le basilic', 'La lavande', 'Le datura', 'Le tournesol'], correctIndex: 2, explanation: 'Le datura contient des alcaloides tropaniques (atropine, scopolamine) qui peuvent etre mortels par ingestion.' },
            { question: 'Quels criteres l\'IA utilise-t-elle pour identifier une plante a partir d\'une description ?', options: ['Uniquement la couleur', 'Forme des feuilles, fleurs, hauteur, tige et habitat', 'Le prix en jardinerie', 'Uniquement la saison'], correctIndex: 1, explanation: 'L\'IA croise plusieurs criteres morphologiques (feuilles, fleurs, hauteur, tige) et ecologiques (habitat) pour proposer une identification.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Arrosage intelligent
    {
      id: 'jardinage-m4',
      title: 'Arrosage intelligent',
      emoji: '\u{1F4A7}',
      description: 'Optimisez l\'arrosage de votre jardin avec l\'IA pour economiser l\'eau tout en gardant des plantes en pleine sante.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4A7}',
      badgeName: 'Gardien de l\'Eau',
      lessons: [
        {
          id: 'jardinage-m4-l1',
          title: 'Optimiser l\'arrosage avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `L'arrosage est responsable de 50 a 70% de la consommation d'eau domestique en ete. Pourtant, la majorite des jardiniers arrosent trop ou mal, entrainant un gaspillage d'eau considerable et parfois des problemes racinaires (pourriture). L'intelligence artificielle optimise chaque goutte d'eau pour des plantes en meilleure sante avec moins de ressources.

Le principe fondamental est d'arroser profondement mais moins frequemment. Un arrosage superficiel quotidien encourage les racines a rester en surface, rendant les plantes fragiles et dependantes. Un arrosage abondant tous les 3 a 5 jours force les racines a plonger en profondeur pour chercher l'eau, creant des plantes robustes et resistantes a la secheresse.

Freenzy calcule les besoins en eau specifiques de chaque plante en fonction de plusieurs parametres : l'espece (un basilic a besoin de plus d'eau qu'un romarin), le type de sol (l'argile retient l'eau, le sable la draine vite), la temperature et l'ensoleillement. L'IA peut generer un programme d'arrosage hebdomadaire personnalise pour chaque zone de votre jardin.

L'heure d'arrosage compte enormement. Arroser le matin tot (avant 9h) est ideal : l'evaporation est minimale et les feuilles ont le temps de secher avant la nuit, ce qui previent les maladies fongiques. Arroser en plein soleil de midi gaspille jusqu'a 60% de l'eau par evaporation. Arroser le soir est acceptable mais favorise les champignons si les feuilles restent humides toute la nuit.

Le paillage est le meilleur allie de l'arrosage intelligent. Une couche de 5 a 10 centimetres de paillis (paille, broyat de bois, tonte sechee) reduit l'evaporation de 50 a 70%. L'IA vous recommande le type de paillis adapte a chaque culture et vous indique quand le renouveler.

Les systemes de goutte-a-goutte representent la methode la plus efficace. Ils delivrent l'eau directement aux racines avec 90% d'efficacite (contre 50% pour l'arrosage par aspersion). Freenzy peut vous aider a concevoir un systeme simple avec un minuteur et des tuyaux percés adapte a la taille de votre jardin.`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m4-l2',
          title: 'Exercice : Programme d\'arrosage personnalise',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un programme d\'arrosage optimise pour votre jardin avec l\'IA.',
          exercisePrompt: `Concevez un programme d'arrosage intelligent avec Freenzy :

1. Listez 5 plantes de votre jardin ou balcon avec leur emplacement
2. Pour chaque plante, demandez a l'IA ses besoins en eau specifiques
3. Indiquez votre type de sol et l'exposition de chaque zone
4. Demandez a Freenzy de generer un planning d'arrosage hebdomadaire
5. Identifiez les economies d'eau possibles (paillage, goutte-a-goutte, horaire)

Criteres de reussite :
- 5 plantes listees avec leurs besoins en eau
- Un planning hebdomadaire avec jours et horaires precis
- Au moins 2 strategies d'economie d'eau identifiees
- Le type de sol et l'exposition sont pris en compte`,
          xpReward: 20,
        },
        {
          id: 'jardinage-m4-l3',
          title: 'Quiz : Arrosage intelligent',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'arrosage optimise par l\'IA.',
          quizQuestions: [
            { question: 'Quel pourcentage de l\'eau domestique l\'arrosage represente-t-il en ete ?', options: ['10 a 20%', '30 a 40%', '50 a 70%', '80 a 90%'], correctIndex: 2, explanation: 'L\'arrosage represente 50 a 70% de la consommation d\'eau domestique en ete, d\'ou l\'importance de l\'optimiser.' },
            { question: 'Pourquoi vaut-il mieux arroser le matin tot ?', options: ['Les plantes dorment encore', 'L\'evaporation est minimale et les feuilles sechent avant la nuit', 'L\'eau est plus froide', 'Les insectes sont absents'], correctIndex: 1, explanation: 'Le matin tot, l\'evaporation est faible et les feuilles ont le temps de secher, ce qui previent les maladies fongiques nocturnes.' },
            { question: 'De combien le paillage reduit-il l\'evaporation ?', options: ['10 a 20%', '30 a 40%', '50 a 70%', '80 a 90%'], correctIndex: 2, explanation: 'Une couche de 5 a 10 cm de paillis reduit l\'evaporation de 50 a 70%, reduisant considerablement les besoins en arrosage.' },
            { question: 'Quelle methode d\'arrosage est la plus efficace ?', options: ['L\'aspersion', 'L\'arrosoir manuel', 'Le goutte-a-goutte (90% d\'efficacite)', 'Le tuyau d\'arrosage'], correctIndex: 2, explanation: 'Le goutte-a-goutte delivre l\'eau directement aux racines avec 90% d\'efficacite, contre 50% pour l\'aspersion.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Permaculture
    {
      id: 'jardinage-m5',
      title: 'Permaculture',
      emoji: '\u{1F33B}',
      description: 'Decouvrez les principes de la permaculture et comment l\'IA vous aide a creer un ecosysteme autonome et productif.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F33B}',
      badgeName: 'Permaculteur IA',
      lessons: [
        {
          id: 'jardinage-m5-l1',
          title: 'La permaculture assistee par l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La permaculture est bien plus qu'une technique de jardinage : c'est une philosophie de conception qui s'inspire des ecosystemes naturels pour creer des espaces productifs, resilients et autonomes. L'intelligence artificielle amplifie cette approche en analysant les interactions complexes entre plantes, sol, eau et biodiversite.

Les trois principes fondamentaux de la permaculture sont : prendre soin de la terre, prendre soin des humains et partager equitablement les surplus. En pratique, cela se traduit par un jardin qui produit de la nourriture tout en regenerant le sol, qui demande de moins en moins de travail au fil des annees et qui accueille la biodiversite au lieu de la combattre.

Le design en permaculture s'organise en zones concentriques. La zone 0 est votre maison. La zone 1 (la plus proche) accueille les plantes quotidiennes : herbes aromatiques, salades, fraises. La zone 2 contient le potager principal. La zone 3 les arbres fruitiers. La zone 4 les espaces semi-sauvages. La zone 5 est laissee a la nature. L'IA vous aide a placer chaque element dans la zone optimale selon la frequence d'utilisation.

La creation d'une butte de permaculture (butte lasagne) est un projet ideal pour debuter. On empile des couches de matieres organiques : carton au fond (anti-adventices), bois mort et branches (reservoir d'eau), feuilles mortes (carbone), compost et fumier (azote), puis une couche de terre et de paillis. L'IA calcule les proportions ideales selon la surface de votre butte et les materiaux disponibles.

L'IA aide aussi a concevoir des guildes — des associations de plantes qui forment un mini-ecosysteme. La guilde du pommier en est un exemple classique : au pied de l'arbre, on plante du trefle (fixe l'azote), de la consoude (remonte les mineraux profonds), des narcisses (repoussent les campagnols) et du thym (attire les pollinisateurs). Chaque plante remplit une fonction specifique.

La permaculture reduit l'arrosage de 80% par rapport a un jardin conventionnel grace au paillage permanent, aux buttes et a la couverture vegetale continue. L'IA optimise ces systemes en tenant compte de votre climat specifique.`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m5-l2',
          title: 'Exercice : Concevez une butte de permaculture',
          duration: '5 min',
          type: 'game',
          content: 'Remettez les couches d\'une butte de permaculture dans le bon ordre, du bas vers le haut.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Carton (anti-adventices)',
              'Bois mort et branches (reservoir d\'eau)',
              'Feuilles mortes (carbone)',
              'Compost et fumier (azote)',
              'Terre vegetale et paillis',
            ],
            correctOrder: [0, 1, 2, 3, 4],
          },
          xpReward: 20,
        },
        {
          id: 'jardinage-m5-l3',
          title: 'Quiz : Permaculture',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la permaculture assistee par l\'IA.',
          quizQuestions: [
            { question: 'Quels sont les trois principes fondamentaux de la permaculture ?', options: ['Produire, vendre, investir', 'Prendre soin de la terre, des humains, partager les surplus', 'Semer, recolter, stocker', 'Arroser, tailler, fertiliser'], correctIndex: 1, explanation: 'Les trois ethiques de la permaculture sont : prendre soin de la terre, prendre soin des humains et partager equitablement les surplus.' },
            { question: 'Que contient la zone 1 en permaculture ?', options: ['Les arbres fruitiers', 'Les espaces sauvages', 'Les plantes d\'usage quotidien (aromatiques, salades)', 'Le composteur uniquement'], correctIndex: 2, explanation: 'La zone 1, la plus proche de la maison, accueille les plantes utilisees quotidiennement pour minimiser les deplacements.' },
            { question: 'De combien la permaculture reduit-elle l\'arrosage par rapport au jardinage conventionnel ?', options: ['20%', '40%', '60%', '80%'], correctIndex: 3, explanation: 'Grace au paillage permanent, aux buttes et a la couverture vegetale, la permaculture reduit l\'arrosage d\'environ 80%.' },
            { question: 'Quel est le role du trefle dans une guilde de pommier ?', options: ['Repousser les campagnols', 'Fixer l\'azote dans le sol', 'Attirer les pollinisateurs', 'Remonter les mineraux profonds'], correctIndex: 1, explanation: 'Le trefle est une legumineuse qui fixe l\'azote atmospherique dans le sol, nourrissant naturellement le pommier.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Potager connecte
    {
      id: 'jardinage-m6',
      title: 'Potager connecte',
      emoji: '\u{1F4F1}',
      description: 'Decouvrez comment connecter votre potager avec des capteurs et l\'IA pour un suivi automatise.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4F1}',
      badgeName: 'Jardinier Connecte',
      lessons: [
        {
          id: 'jardinage-m6-l1',
          title: 'Le potager connecte avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le potager connecte represente l'avenir du jardinage domestique. En combinant des capteurs simples et abordables avec l'intelligence artificielle, vous pouvez surveiller et optimiser votre jardin a distance, recevoir des alertes en temps reel et automatiser les taches repetitives.

Les capteurs de base pour un potager connecte sont accessibles et faciles a installer. Un capteur d'humidite du sol (entre 10 et 30 euros) vous indique en temps reel si vos plantes ont besoin d'eau. Un capteur de temperature et d'humidite aerienne (environ 15 euros) surveille les conditions climatiques. Un luxmetre (capteur de lumiere) mesure l'ensoleillement reel de chaque zone. Ces donnees alimentent l'IA pour des recommandations ultra-precises.

Meme sans capteurs physiques, Freenzy peut simuler un potager connecte. L'assistant utilise les donnees meteo de votre localisation (temperature, precipitations, ensoleillement, vent) pour estimer les besoins de vos plantes. Vous recevez des recommandations quotidiennes : "Aujourd'hui 28 degres prevu, arrosez les tomates ce soir" ou "Gel annonce cette nuit, protegez les courgettes avec un voile d'hivernage."

Les stations meteo connectees (comme Netatmo ou Davis) apportent un niveau de precision supplementaire. Elles mesurent la pluie tombee, la vitesse du vent, la pression atmospherique et la temperature au sol. L'IA integre ces mesures pour ajuster l'arrosage au millilitre pres. Si 15 mm de pluie sont tombes, elle annule l'arrosage prevu.

L'automatisation complete est possible avec des electovannes connectees et un programmateur WiFi. L'IA pilote l'arrosage automatiquement en fonction des donnees des capteurs, de la meteo et des besoins specifiques de chaque plante. Vous pouvez partir en vacances deux semaines sans inquietude : votre jardin se gere tout seul.

Le journal de bord numerique est un outil precieux. Notez vos observations (dates de semis, recoltes, problemes) dans Freenzy et l'IA analyse vos donnees sur plusieurs saisons. Elle identifie des patterns : "Vos tomates cerises produisent 30% de plus quand vous les plantez apres le 20 mai" ou "Votre sol s'asseche deux fois plus vite en zone est."`,
          xpReward: 15,
        },
        {
          id: 'jardinage-m6-l2',
          title: 'Exercice : Configurez votre suivi connecte',
          duration: '5 min',
          type: 'exercise',
          content: 'Planifiez la mise en place d\'un suivi intelligent de votre potager.',
          exercisePrompt: `Concevez votre systeme de suivi de potager connecte avec Freenzy :

1. Listez les plantes que vous souhaitez surveiller (5 minimum)
2. Identifiez les donnees a mesurer pour chaque plante (humidite, temperature, lumiere)
3. Choisissez votre approche : capteurs physiques OU suivi meteo IA (sans materiel)
4. Demandez a Freenzy de generer un tableau de bord avec les seuils d'alerte par plante
5. Definissez un protocole d'intervention pour chaque type d'alerte

Criteres de reussite :
- 5 plantes identifiees avec leurs parametres critiques
- Les seuils d'alerte sont definis (ex: humidite < 30% → arroser)
- Un protocole d'intervention existe pour chaque alerte
- L'approche choisie est realiste par rapport a votre budget`,
          xpReward: 20,
        },
        {
          id: 'jardinage-m6-l3',
          title: 'Quiz : Potager connecte',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le potager connecte et l\'IA.',
          quizQuestions: [
            { question: 'Combien coute environ un capteur d\'humidite du sol basique ?', options: ['1 a 5 euros', '10 a 30 euros', '100 a 200 euros', '500 euros et plus'], correctIndex: 1, explanation: 'Un capteur d\'humidite du sol basique coute entre 10 et 30 euros, le rendant accessible a tout jardinier amateur.' },
            { question: 'Que fait l\'IA quand 15 mm de pluie sont tombes sur votre jardin ?', options: ['Elle arrose quand meme', 'Elle double l\'arrosage', 'Elle annule l\'arrosage prevu', 'Elle ne fait rien'], correctIndex: 2, explanation: 'L\'IA annule l\'arrosage prevu quand les precipitations naturelles ont deja couvert les besoins des plantes.' },
            { question: 'Meme sans capteurs physiques, que peut utiliser Freenzy pour le suivi ?', options: ['Rien du tout', 'Les donnees meteo de votre localisation', 'Des photos satellite', 'Un drone'], correctIndex: 1, explanation: 'Freenzy utilise les donnees meteo (temperature, precipitations, ensoleillement) de votre localisation pour estimer les besoins des plantes.' },
            { question: 'Quel est l\'avantage principal d\'un journal de bord numerique du jardin ?', options: ['Imprimer de belles photos', 'Analyser les patterns sur plusieurs saisons', 'Partager sur les reseaux sociaux', 'Calculer les impots fonciers'], correctIndex: 1, explanation: 'Le journal numerique permet a l\'IA d\'analyser vos donnees sur plusieurs saisons et d\'identifier des tendances pour optimiser vos futures cultures.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 3 — Bricolage IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursBricolageIA: FormationParcours = {
  id: 'bricolage-ia',
  title: 'Bricolage IA',
  emoji: '\u{1F528}',
  description: 'Apprenez a utiliser l\'intelligence artificielle pour vos projets de bricolage : planification, tutoriels pas-a-pas, choix des outils, securite, gestion de budget et decoration interieure.',
  category: 'quotidien',
  subcategory: 'bricolage',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#A16207',
  diplomaTitle: 'Bricolage IA',
  diplomaSubtitle: 'Certification Freenzy.io — Bricolage et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Projets maison
    {
      id: 'bricolage-m1',
      title: 'Projets maison',
      emoji: '\u{1F3E0}',
      description: 'Planifiez et lancez vos projets de bricolage avec l\'aide de l\'IA : de l\'idee a la realisation.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3E0}',
      badgeName: 'Bricoleur Debutant',
      lessons: [
        {
          id: 'bricolage-m1-l1',
          title: 'Planifier un projet bricolage avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le bricolage est une competence liberatrice : savoir reparer, construire et amenager soi-meme vous fait economiser des centaines d'euros par an et vous donne une immense satisfaction personnelle. L'intelligence artificielle rend le bricolage accessible a tous, meme aux debutants complets, en vous guidant etape par etape.

Le premier reflexe du bricoleur intelligent est de bien planifier avant de demarrer. Avec Freenzy, decrivez votre projet en detail : "Je veux installer une etagere murale de 120 cm dans mon salon, mur en platre sur briques, pour supporter des livres (environ 30 kg)." L'IA analyse votre demande et genere un plan complet : liste des materiaux, outils necessaires, etapes detaillees et estimation du temps.

La planification IA couvre des projets de toutes envergures. Pour les petits travaux (fixer un tableau, changer un joint, deboucher un siphon), l'assistant fournit des instructions rapides et precises. Pour les projets moyens (peindre une piece, monter un meuble complexe, poser du carrelage), il detaille chaque phase avec les temps de sechage et les precautions. Pour les gros projets (renover une salle de bain, amenager des combles), il etablit un retroplanning sur plusieurs week-ends.

L'IA vous aide aussi a evaluer la faisabilite. Certains travaux necessitent des competences specifiques ou des habilitations : l'electricite (norme NF C 15-100), la plomberie (risque de fuite), ou les travaux structurels (murs porteurs). Freenzy vous indique clairement ce que vous pouvez faire vous-meme et ce qui requiert un professionnel.

Le diagnostic de problemes est un autre atout majeur. Votre porte grince ? L'IA diagnostique la cause (gonds desaxes, dilatation du bois, cadre deforme) et propose la solution adaptee. Un mur se fissure ? Elle distingue les fissures cosmetiques (enduit qui travaille) des fissures structurelles (fondations, mur porteur) qui necessitent un expert.

Conseil : photographiez votre projet sous plusieurs angles et decrivez-le a Freenzy avec les dimensions exactes. Plus votre description est precise, plus les instructions de l'IA seront pertinentes et securisees.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m1-l2',
          title: 'Exercice : Planifiez votre premier projet',
          duration: '5 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour planifier un projet de bricolage de A a Z.',
          exercisePrompt: `Planifiez un projet de bricolage avec l'aide de Freenzy :

1. Choisissez un projet concret (etagere, peinture d'une piece, reparation, meuble, etc.)
2. Decrivez le contexte : piece, dimensions, type de mur/sol, contraintes
3. Demandez a l'IA la liste complete des materiaux et outils necessaires
4. Obtenez un plan etape par etape avec les temps estimes
5. Identifiez les points de vigilance et les erreurs courantes a eviter

Criteres de reussite :
- Le projet est clairement defini avec dimensions et contexte
- La liste des materiaux est complete avec les quantites
- Les etapes sont detaillees et ordonnees logiquement
- Au moins 2 points de vigilance sont identifies`,
          xpReward: 20,
        },
        {
          id: 'bricolage-m1-l3',
          title: 'Quiz : Projets bricolage IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la planification de projets bricolage avec l\'IA.',
          quizQuestions: [
            { question: 'Quel est le premier reflexe du bricoleur intelligent ?', options: ['Acheter tous les outils possibles', 'Bien planifier avant de demarrer', 'Regarder des videos YouTube', 'Demander a un voisin'], correctIndex: 1, explanation: 'La planification est l\'etape la plus importante : elle evite les erreurs couteuses et les allers-retours inutiles en magasin.' },
            { question: 'Quelle norme regit les travaux electriques en France ?', options: ['ISO 9001', 'NF C 15-100', 'CE 2024', 'RT 2012'], correctIndex: 1, explanation: 'La norme NF C 15-100 regit les installations electriques basse tension en France. Les travaux electriques doivent la respecter.' },
            { question: 'Que doit faire l\'IA face a un projet impliquant un mur porteur ?', options: ['Donner des instructions de demolition', 'Recommander de faire appel a un professionnel', 'Ignorer le probleme', 'Proposer de le peindre'], correctIndex: 1, explanation: 'Les travaux sur murs porteurs sont structurels et dangereux. L\'IA doit toujours recommander un professionnel qualifie pour ce type d\'intervention.' },
            { question: 'Pourquoi est-il important de decrire precisement son projet a l\'IA ?', options: ['Pour impressionner l\'IA', 'Pour obtenir des instructions pertinentes et securisees', 'Pour que ca aille plus vite', 'Ce n\'est pas important'], correctIndex: 1, explanation: 'Plus la description est precise (dimensions, type de mur, contraintes), plus les instructions de l\'IA seront pertinentes, completes et securisees.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Tutoriels pas-a-pas
    {
      id: 'bricolage-m2',
      title: 'Tutoriels pas-a-pas',
      emoji: '\u{1F4CB}',
      description: 'Generez des tutoriels detailles et personnalises pour chaque projet avec l\'assistance de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Tutoriel Master',
      lessons: [
        {
          id: 'bricolage-m2-l1',
          title: 'Des tutoriels sur mesure avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Les tutoriels de bricolage generiques ont un defaut majeur : ils ne tiennent pas compte de votre situation specifique. La taille de votre piece, le type de mur, vos outils disponibles et votre niveau d'experience sont uniques. L'intelligence artificielle genere des tutoriels parfaitement adaptes a votre contexte, ce qui reduit considerablement les risques d'erreur.

La cle d'un bon tutoriel IA est la qualite du brief initial. Indiquez a Freenzy non seulement ce que vous voulez faire, mais aussi ce dont vous disposez. Par exemple : "Je veux poser une tringle a rideau. Mon mur est en beton, j'ai une perceuse a percussion, des chevilles de 6 mm et un niveau a bulle. La fenetre fait 140 cm de large." Avec ces informations, l'IA genere un tutoriel precis et adapte.

Chaque tutoriel IA se decompose en phases claires. La preparation (rassembler les outils, proteger les surfaces, prendre les mesures), la realisation (etapes numerotees avec des reperes visuels et des points de controle) et la finition (nettoyage, verification du resultat, rangement). L'IA insere des avertissements de securite aux etapes critiques : "Portez des lunettes de protection avant de percer le beton."

L'adaptabilite en temps reel est l'avantage decisif de l'IA. Si en cours de projet vous rencontrez un imprévu (un tuyau cache dans le mur, un defaut dans le materiau, un outil qui casse), vous pouvez interroger Freenzy immediatement. L'assistant ajuste le tutoriel a la volee et propose des solutions alternatives.

Les tutoriels IA incluent aussi les temps de sechage et d'attente, souvent negliges par les debutants. La peinture necessite un sechage entre les couches (2 a 4 heures en general). Le joint silicone met 24 heures a polymeriser completement. L'enduit de rebouchage doit secher avant le poncage (temps variable selon l'epaisseur). L'IA integre ces delais dans le retroplanning global.

Astuce avancee : demandez a Freenzy de generer une checklist imprimable avant de commencer. Cochez chaque etape au fur et a mesure pour ne rien oublier et garder une trace de votre progression.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m2-l2',
          title: 'Exercice : Generez un tutoriel personnalise',
          duration: '5 min',
          type: 'exercise',
          content: 'Creez un tutoriel de bricolage adapte a votre contexte avec l\'IA.',
          exercisePrompt: `Generez un tutoriel de bricolage personnalise avec Freenzy :

1. Choisissez une tache de bricolage courante (poser une etagere, peindre un mur, changer un robinet, etc.)
2. Decrivez votre contexte complet : type de mur/surface, outils disponibles, dimensions, niveau d'experience
3. Demandez un tutoriel etape par etape avec temps estimes
4. Verifiez que les avertissements de securite sont presents
5. Demandez une version "checklist" imprimable

Criteres de reussite :
- Le contexte est decrit avec au moins 5 details specifiques
- Le tutoriel comporte au moins 8 etapes numerotees
- Les temps de sechage/attente sont mentionnes si applicable
- Au moins 2 avertissements de securite sont inclus`,
          xpReward: 20,
        },
        {
          id: 'bricolage-m2-l3',
          title: 'Quiz : Tutoriels IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la generation de tutoriels avec l\'IA.',
          quizQuestions: [
            { question: 'Quel est le defaut principal des tutoriels de bricolage generiques ?', options: ['Ils sont trop courts', 'Ils ne tiennent pas compte de votre situation specifique', 'Ils sont gratuits', 'Ils utilisent trop de photos'], correctIndex: 1, explanation: 'Les tutoriels generiques ne prennent pas en compte vos murs, outils, dimensions et niveau, ce qui peut mener a des erreurs.' },
            { question: 'Quelles sont les trois phases d\'un bon tutoriel IA ?', options: ['Acheter, construire, demolir', 'Preparation, realisation, finition', 'Lire, comprendre, oublier', 'Mesurer, couper, clouer'], correctIndex: 1, explanation: 'Un tutoriel IA bien structure comprend la preparation (outils, mesures), la realisation (etapes detaillees) et la finition (verification, nettoyage).' },
            { question: 'Combien de temps un joint silicone met-il a polymeriser completement ?', options: ['1 heure', '6 heures', '24 heures', '72 heures'], correctIndex: 2, explanation: 'Le joint silicone necessite environ 24 heures pour polymeriser completement. Il ne faut pas le mouiller avant ce delai.' },
            { question: 'Que faire si vous rencontrez un imprevu en cours de projet ?', options: ['Abandonner le projet', 'Interroger l\'IA qui ajuste le tutoriel en temps reel', 'Continuer sans changer de plan', 'Appeler un ami'], correctIndex: 1, explanation: 'L\'IA peut ajuster le tutoriel en temps reel face aux imprevus et proposer des solutions alternatives adaptees.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Choix des outils
    {
      id: 'bricolage-m3',
      title: 'Choix des outils',
      emoji: '\u{1F527}',
      description: 'Apprenez a choisir, utiliser et entretenir vos outils de bricolage avec les conseils de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F527}',
      badgeName: 'Expert Outillage',
      lessons: [
        {
          id: 'bricolage-m3-l1',
          title: 'Bien choisir ses outils avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Les bons outils font le bon bricoleur. Mais face a l'offre plethorique en magasin — des centaines de references pour chaque categorie — comment choisir sans se ruiner ni acheter du materiel inadequat ? L'intelligence artificielle vous guide vers les outils reellement necessaires et adaptes a votre usage.

La boite a outils de base du bricoleur comprend une dizaine d'outils indispensables : un marteau (300g pour les travaux courants), un jeu de tournevis (plats et cruciformes, ou mieux un tournevis a embouts interchangeables), une pince multiprise, un metre ruban (5 metres minimum), un niveau a bulle (au moins 60 cm), un cutter, une cle a molette, une scie a main polyvalente, du papier de verre (grains 80, 120 et 240) et un jeu de cles Allen.

L'IA vous aide a eviter les achats inutiles. Decrivez vos projets prevus et Freenzy determine les outils necessaires et suffisants. Pour accrocher des tableaux sur du platre, une perceuse basique de 500W suffit. Pour du beton, il faut une perceuse a percussion d'au moins 750W. Pour des travaux frequents et varies, une visseuse-perceuse sans fil de 18V est le meilleur investissement rapport qualite-prix.

La question du budget est centrale. L'IA distingue trois niveaux de gamme : l'entree de gamme (Brico Depot, Silverline) convient pour un usage occasionnel. Le milieu de gamme (Bosch vert, Ryobi, Dexter) offre un excellent rapport qualite-prix pour le bricoleur regulier. Le haut de gamme (Bosch bleu, Makita, DeWalt) est reserve aux utilisateurs intensifs et aux professionnels. Freenzy recommande le niveau adapte a votre frequence d'utilisation.

L'entretien des outils prolonge considerablement leur duree de vie. L'IA vous rappelle de huiler les parties metalliques pour eviter la rouille, de recharger vos batteries lithium-ion regulierement (meme sans usage), de nettoyer les lames de scie apres chaque utilisation et de verifier l'etat des embouts de tournevis (un embout use abime les vis).

Conseil : demandez a Freenzy un comparatif entre deux modeles precis. L'IA analysera les specifications, les avis et le rapport qualite-prix pour vous aider a choisir.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m3-l2',
          title: 'Exercice : Composez votre boite a outils ideale',
          duration: '5 min',
          type: 'game',
          content: 'Associez chaque outil a son usage principal.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Perceuse a percussion', right: 'Percer dans le beton et la brique' },
              { left: 'Niveau a bulle', right: 'Verifier l\'horizontalite et la verticalite' },
              { left: 'Pince multiprise', right: 'Serrer et desserrer des ecrous et tuyaux' },
              { left: 'Cle a molette', right: 'Serrer des boulons de differentes tailles' },
              { left: 'Papier de verre grain 80', right: 'Poncer grossierement le bois brut' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'bricolage-m3-l3',
          title: 'Quiz : Outillage et IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le choix d\'outils avec l\'IA.',
          quizQuestions: [
            { question: 'Quelle puissance minimale faut-il pour une perceuse destinee a percer du beton ?', options: ['300W', '500W', '750W a percussion', '1500W'], correctIndex: 2, explanation: 'Pour percer dans le beton, il faut une perceuse a percussion d\'au moins 750W. Une perceuse simple ne suffit pas.' },
            { question: 'Quel outil polyvalent est le meilleur investissement pour un bricoleur regulier ?', options: ['Une scie circulaire', 'Une visseuse-perceuse sans fil 18V', 'Une defonceuse', 'Un compresseur'], correctIndex: 1, explanation: 'La visseuse-perceuse sans fil 18V est l\'outil le plus polyvalent : elle visse, devisse, perce le bois et certains materiaux tendres.' },
            { question: 'Pourquoi faut-il recharger les batteries lithium-ion meme sans usage ?', options: ['Pour les tester', 'Pour eviter la decharge profonde qui les endommage', 'Pour les recalibrer', 'Ce n\'est pas necessaire'], correctIndex: 1, explanation: 'Les batteries lithium-ion se dechargent lentement meme au repos. Une decharge profonde peut les endommager definitivement.' },
            { question: 'Quelle gamme d\'outils convient le mieux au bricoleur occasionnel ?', options: ['Haut de gamme (Makita, DeWalt)', 'Milieu de gamme (Bosch vert, Ryobi)', 'Entree de gamme (usage occasionnel)', 'Outillage professionnel uniquement'], correctIndex: 2, explanation: 'L\'entree de gamme offre un prix accessible pour un usage occasionnel. Investir dans du haut de gamme n\'est pas justifie pour quelques utilisations par an.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Securite
    {
      id: 'bricolage-m4',
      title: 'Securite au bricolage',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Maitrisez les regles de securite essentielles pour bricoler en toute serenite avec les rappels de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Bricoleur Prudent',
      lessons: [
        {
          id: 'bricolage-m4-l1',
          title: 'La securite assistee par l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Chaque annee en France, plus de 300 000 personnes se blessent en bricolant. Les coupures, les chutes, les projections dans les yeux et les electrocutions representent les accidents les plus frequents. L'intelligence artificielle joue un role crucial en integrant des alertes de securite a chaque etape de vos projets.

Les equipements de protection individuelle (EPI) sont la premiere ligne de defense. Pour tout travail de percage ou de coupe, des lunettes de protection sont obligatoires (les eclats de beton ou de metal peuvent causer des lesions oculaires graves). Les gants de travail protegent vos mains lors de la manipulation de materiaux rugueux ou de lames. Un masque anti-poussiere FFP2 est indispensable pour le poncage, la decoupe de platre ou tout travail generant de la poussiere fine.

L'electricite est le domaine le plus dangereux du bricolage domestique. La regle d'or absolue : coupez TOUJOURS le disjoncteur correspondant au circuit avant toute intervention electrique, puis verifiez l'absence de tension avec un testeur (VAT). Ne vous fiez jamais a l'interrupteur seul. L'IA vous rappelle systematiquement cette precaution et vous guide pour identifier le bon disjoncteur dans votre tableau electrique.

La securite chimique est souvent negligee. Les peintures, colles, solvants et decapants emettent des COV (composes organiques volatils) nocifs pour la sante. Travaillez toujours dans un espace bien ventile, portez un masque a cartouche pour les produits les plus agressifs (decapant chimique, resine epoxy) et lisez attentivement les fiches de donnees de securite. L'IA vous alerte sur les dangers specifiques de chaque produit.

Les travaux en hauteur causent des chutes graves chaque annee. Un escabeau doit etre en bon etat, sur un sol stable et plat, et jamais utilise au-dela de l'avant-derniere marche. Pour les travaux a plus de 3 metres, un echafaudage est obligatoire. L'IA vous indique le materiel de securite adapte a la hauteur de votre intervention.

Freenzy genere automatiquement une liste d'EPI pour chaque projet. Avant de commencer, l'assistant vous demande : "Avez-vous vos lunettes de protection, vos gants et votre masque ?" Cette verification systematique previent la majorite des accidents domestiques.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m4-l2',
          title: 'Exercice : Audit de securite de votre atelier',
          duration: '5 min',
          type: 'exercise',
          content: 'Evaluez la securite de votre espace de bricolage avec l\'aide de l\'IA.',
          exercisePrompt: `Realisez un audit de securite de votre espace de bricolage avec Freenzy :

1. Decrivez votre espace de travail (garage, appartement, balcon, etc.)
2. Listez les EPI dont vous disposez actuellement
3. Identifiez les risques specifiques a votre espace (electricite, ventilation, hauteur, rangement)
4. Demandez a l'IA de generer un rapport de securite avec les points conformes et non conformes
5. Etablissez une liste d'achats prioritaires pour combler les manques

Criteres de reussite :
- L'espace est decrit avec ses caracteristiques de securite
- Les EPI existants sont listes
- Au moins 3 risques specifiques sont identifies
- Un plan d'action avec priorites est etabli`,
          xpReward: 20,
        },
        {
          id: 'bricolage-m4-l3',
          title: 'Quiz : Securite bricolage',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la securite au bricolage.',
          quizQuestions: [
            { question: 'Combien de personnes se blessent en bricolant chaque annee en France ?', options: ['50 000', '150 000', '300 000', '1 million'], correctIndex: 2, explanation: 'Plus de 300 000 personnes se blessent chaque annee en France lors d\'activites de bricolage, soulignant l\'importance de la securite.' },
            { question: 'Que faut-il TOUJOURS faire avant une intervention electrique ?', options: ['Mettre des gants', 'Couper le disjoncteur et verifier l\'absence de tension', 'Fermer les fenetres', 'Prevenir un voisin'], correctIndex: 1, explanation: 'Il faut TOUJOURS couper le disjoncteur correspondant puis verifier l\'absence de tension avec un testeur avant toute intervention electrique.' },
            { question: 'Quel type de masque est necessaire pour le poncage ?', options: ['Masque chirurgical', 'Masque FFP2 anti-poussiere', 'Masque en tissu', 'Aucun masque n\'est necessaire'], correctIndex: 1, explanation: 'Un masque FFP2 anti-poussiere filtre les particules fines generees par le poncage, qui peuvent endommager les poumons a long terme.' },
            { question: 'Jusqu\'a quelle marche peut-on utiliser un escabeau ?', options: ['La derniere marche', 'L\'avant-derniere marche', 'N\'importe quelle marche', 'Les trois premieres uniquement'], correctIndex: 1, explanation: 'On ne doit jamais monter au-dela de l\'avant-derniere marche d\'un escabeau pour maintenir un centre de gravite stable et eviter les chutes.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Budget et achats
    {
      id: 'bricolage-m5',
      title: 'Budget et achats',
      emoji: '\u{1F4B0}',
      description: 'Gerez le budget de vos projets bricolage avec l\'IA : estimations, comparatifs et optimisation des couts.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Budget Maitrise',
      lessons: [
        {
          id: 'bricolage-m5-l1',
          title: 'Gerer son budget bricolage avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `Le budget est souvent le frein principal des projets de bricolage. Entre les materiaux, les outils et les imprevus, les couts peuvent vite s'envoler. L'intelligence artificielle vous aide a estimer, optimiser et controler vos depenses pour bricoler malin sans sacrifier la qualite.

L'estimation de cout est la premiere etape. Decrivez votre projet a Freenzy avec les dimensions exactes et l'IA calcule les quantites de materiaux necessaires. Pour peindre une piece de 12 metres carres au sol avec 2,5 metres de hauteur sous plafond, il faut environ 10 litres de peinture (deux couches) plus 2 litres de sous-couche. L'IA ajoute systematiquement 10% de marge pour les pertes et les retouches.

La comparaison des enseignes est un levier d'economie majeur. Les prix peuvent varier de 30 a 50% entre les magasins de bricolage pour un meme produit. L'IA vous recommande de comparer au moins trois enseignes (Leroy Merlin, Castorama, Brico Depot, Mr Bricolage) et de verifier les promotions en cours. Elle vous rappelle aussi que les grandes surfaces de bricolage pratiquent la politique du prix le plus bas sur demande.

Les alternatives economes sont un domaine ou l'IA excelle. Au lieu d'acheter du bois neuf pour vos etageres, pourquoi ne pas utiliser des palettes recyclees (souvent gratuites) ? Au lieu d'une peinture de marque a 40 euros le pot, la peinture de distributeur a 15 euros offre souvent des performances equivalentes pour les pieces peu sollicitees. L'IA distingue les postes ou economiser sans risque de ceux ou la qualite est non-negociable (fixations, electricite, etancheite).

La location d'outils est une strategie intelligente pour les equipements couteux a usage ponctuel. Une ponceuse a bande, une scie sauteuse professionnelle ou un nettoyeur haute pression se louent entre 20 et 50 euros la journee dans la plupart des enseignes. L'IA calcule le seuil de rentabilite : en dessous de 3 utilisations par an, la location est plus avantageuse que l'achat.

Freenzy peut aussi generer un tableau de suivi budgetaire avec les depenses prevues, reelles et l'ecart. Vous gardez ainsi le controle total sur vos finances tout au long du projet.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m5-l2',
          title: 'Exercice : Estimez le cout de votre projet',
          duration: '5 min',
          type: 'exercise',
          content: 'Utilisez l\'IA pour estimer et optimiser le budget d\'un projet de bricolage.',
          exercisePrompt: `Estimez le budget d'un projet de bricolage avec Freenzy :

1. Decrivez un projet concret avec ses dimensions precises
2. Demandez a l'IA une estimation detaillee des couts (materiaux + outils + consommables)
3. Identifiez au moins 2 postes ou vous pouvez economiser sans sacrifier la qualite
4. Comparez l'option "tout acheter" vs "louer les outils speciaux"
5. Ajoutez 10% de marge pour les imprevus et calculez le budget total

Criteres de reussite :
- L'estimation est detaillee poste par poste
- Les quantites de materiaux sont calculees avec 10% de marge
- Au moins 2 economies identifiees
- Le comparatif achat vs location est realise pour au moins 1 outil`,
          xpReward: 20,
        },
        {
          id: 'bricolage-m5-l3',
          title: 'Quiz : Budget bricolage',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la gestion budgetaire en bricolage.',
          quizQuestions: [
            { question: 'Quelle marge de securite l\'IA ajoute-t-elle aux quantites de materiaux ?', options: ['0%', '5%', '10%', '25%'], correctIndex: 2, explanation: 'L\'IA ajoute systematiquement 10% de marge aux quantites calculees pour couvrir les pertes, les erreurs de coupe et les retouches.' },
            { question: 'De combien les prix peuvent-ils varier entre les enseignes de bricolage ?', options: ['5 a 10%', '10 a 20%', '30 a 50%', '100%'], correctIndex: 2, explanation: 'Les prix peuvent varier de 30 a 50% entre les enseignes pour un meme produit, d\'ou l\'importance de comparer.' },
            { question: 'A partir de combien d\'utilisations par an l\'achat d\'un outil devient-il plus rentable que la location ?', options: ['1 utilisation', '3 utilisations', '10 utilisations', '20 utilisations'], correctIndex: 1, explanation: 'En general, au-dela de 3 utilisations par an, l\'achat d\'un outil devient plus rentable que la location repetee.' },
            { question: 'Sur quel poste ne faut-il JAMAIS economiser ?', options: ['La peinture decorative', 'Les fixations et l\'electricite', 'Les pinceaux', 'Le papier de verre'], correctIndex: 1, explanation: 'Les fixations (chevilles, vis portantes) et l\'electricite sont des postes de securite ou la qualite est non-negociable.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Decoration interieure
    {
      id: 'bricolage-m6',
      title: 'Decoration interieure',
      emoji: '\u{1F3A8}',
      description: 'Transformez votre interieur avec l\'aide de l\'IA : couleurs, agencement, tendances et projets deco DIY.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3A8}',
      badgeName: 'Decorateur IA',
      lessons: [
        {
          id: 'bricolage-m6-l1',
          title: 'Decorer son interieur avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La decoration interieure n'est plus reservee aux professionnels ni aux gros budgets. L'intelligence artificielle democratise le design d'interieur en vous aidant a choisir les bonnes couleurs, agencer vos meubles et creer une ambiance harmonieuse dans chaque piece de votre logement.

Le choix des couleurs est souvent le premier blocage. L'IA maitrise la theorie des couleurs et vous guide avec precision. Les couleurs chaudes (rouge, orange, jaune) energisent une piece mais la rapetissent visuellement. Les couleurs froides (bleu, vert, violet) apaisent et agrandissent l'espace. Les neutres (blanc, gris, beige) sont des valeurs sures qui se marient avec tout. Freenzy vous propose des palettes harmonieuses basees sur votre couleur preferee.

La regle du 60-30-10 est un classique du design que l'IA applique systematiquement. 60% de la piece dans une couleur dominante (murs et grandes surfaces), 30% dans une couleur secondaire (rideaux, tapis, gros meubles) et 10% dans une couleur d'accent (coussins, objets deco, cadres). Cette proportion garantit un equilibre visuel agreable et professionnel.

L'agencement des meubles influence enormement la perception d'une piece. L'IA optimise la circulation (au moins 70 cm de passage), cree des zones fonctionnelles distinctes (coin lecture, espace repas, zone de travail) et exploite les points focaux naturels (cheminee, grande fenetre, vue). Pour un salon, elle recommande d'orienter le canape face au point focal principal et de creer un "U" conversationnel avec les fauteuils.

Les projets deco DIY (Do It Yourself) combinent bricolage et decoration a moindre cout. L'IA genere des idees creatives adaptees a votre niveau : customiser un meuble IKEA avec de la peinture et des poignees vintage, creer un mur de cadres avec la technique du gabarit papier, fabriquer des etageres avec des tuyaux de cuivre, ou realiser un mur d'accent avec du lambris bois.

L'eclairage est le facteur le plus sous-estime en decoration. L'IA vous enseigne la regle des trois sources lumineuses par piece : un eclairage general (plafonnier ou suspension), un eclairage fonctionnel (lampe de bureau, liseuse) et un eclairage d'ambiance (guirlande, bougie, LED indirect). Cette stratification cree une atmosphere chaleureuse et modulable.`,
          xpReward: 15,
        },
        {
          id: 'bricolage-m6-l2',
          title: 'Exercice : Relookez une piece avec l\'IA',
          duration: '5 min',
          type: 'game',
          content: 'Associez chaque regle de decoration a son application pratique.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Regle 60-30-10', right: 'Proportions couleur dominante, secondaire, accent' },
              { left: '70 cm de passage minimum', right: 'Circulation fluide entre les meubles' },
              { left: 'Couleurs froides', right: 'Agrandissent visuellement la piece' },
              { left: 'Trois sources lumineuses', right: 'General, fonctionnel et ambiance' },
              { left: 'Point focal', right: 'Element central qui attire le regard (cheminee, fenetre)' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'bricolage-m6-l3',
          title: 'Quiz : Decoration interieure IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la decoration interieure assistee par l\'IA.',
          quizQuestions: [
            { question: 'Quelle est la regle de proportion des couleurs en decoration ?', options: ['50-30-20', '60-30-10', '70-20-10', '80-15-5'], correctIndex: 1, explanation: 'La regle 60-30-10 repartit les couleurs : 60% dominante (murs), 30% secondaire (textiles, meubles), 10% accent (objets deco).' },
            { question: 'Quel effet les couleurs froides ont-elles sur une piece ?', options: ['Elles la rapetissent', 'Elles l\'agrandissent visuellement', 'Elles l\'assombrissent', 'Elles la rechauffent'], correctIndex: 1, explanation: 'Les couleurs froides (bleu, vert, violet) creent une impression de profondeur et agrandissent visuellement l\'espace.' },
            { question: 'Quelle largeur minimale de passage faut-il entre les meubles ?', options: ['30 cm', '50 cm', '70 cm', '100 cm'], correctIndex: 2, explanation: 'Un passage d\'au moins 70 cm entre les meubles garantit une circulation confortable et fluide dans la piece.' },
            { question: 'Combien de sources lumineuses recommande-t-on par piece ?', options: ['Une seule', 'Deux', 'Trois (general, fonctionnel, ambiance)', 'Cinq'], correctIndex: 2, explanation: 'La regle des trois sources lumineuses (general, fonctionnel, ambiance) cree une atmosphere chaleureuse et modulable.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};
