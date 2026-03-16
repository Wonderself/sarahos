// =============================================================================
// Freenzy.io — Formation Productivite 1
// 3 parcours x 6 modules x 3 lessons = 54 lessons, 1800 XP total
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// Parcours 1 — GTD avec l'IA
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursGTD: FormationParcours = {
  id: 'gtd-ia',
  title: 'GTD avec l\'IA',
  emoji: '\u{1F4E5}',
  description: 'Maitrisez la methode Getting Things Done augmentee par l\'intelligence artificielle : capture universelle, clarification intelligente, organisation dynamique, revues automatisees et engagement optimal.',
  category: 'productivite',
  subcategory: 'methodes',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#3B82F6',
  diplomaTitle: 'GTD avec l\'IA',
  diplomaSubtitle: 'Certification Freenzy.io — Getting Things Done et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Capture
    {
      id: 'gtd-m1',
      title: 'Capture universelle',
      emoji: '\u{1F4E5}',
      description: 'Apprenez a capturer absolument tout ce qui occupe votre esprit grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4E5}',
      badgeName: 'Capteur Expert',
      lessons: [
        {
          id: 'gtd-m1-l1',
          title: 'Le principe de capture totale',
          duration: '5 min',
          type: 'text',
          content: `La capture est la premiere etape de la methode GTD inventee par David Allen. Son principe est simple mais revolutionnaire : tout ce qui occupe votre attention doit etre externalise dans un systeme de confiance. Tant qu'une idee, une tache ou un engagement reste dans votre tete, il consomme de l'energie cognitive et genere du stress, meme inconsciemment.

L'IA transforme radicalement cette etape. Au lieu de noter manuellement chaque pensee, vous pouvez dicter vos idees a un assistant vocal, envoyer un message rapide a Freenzy, ou meme photographier un document que l'IA analysera et classera automatiquement. La friction de la capture disparait presque entierement.

Le principe cle est l'ubiquite : vous devez pouvoir capturer partout et a tout moment. Configurez un canal de capture principal — par exemple, un message WhatsApp a votre assistant Freenzy — et un canal secondaire (email, note vocale). L'important est que chaque pensee soit capturee en moins de 10 secondes.

Une erreur frequente est de vouloir organiser au moment de la capture. Resistez a cette tentation. La capture doit etre brute, rapide, sans jugement. Notez "appeler dentiste", "idee projet Martin", "acheter cadeau anniversaire Sophie" sans chercher a prioriser ou categoriser. L'organisation vient apres.

Avec Freenzy, demandez a l'IA de vous envoyer un rappel quotidien a 18h : "Avez-vous capture tout ce qui vous a traverse l'esprit aujourd'hui ?" Ce simple rituel augmente de 40% le taux de capture chez les debutants et reduit significativement la charge mentale residuelle.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m1-l2',
          title: 'Exercice : Videz votre esprit en 10 minutes',
          duration: '5 min',
          type: 'exercise',
          content: 'Realisez un "brain dump" complet avec l\'aide de l\'IA.',
          exercisePrompt: `Realisez un exercice de capture totale (brain dump) en suivant ces etapes :

1. Prenez 10 minutes sans interruption. Fermez toutes les distractions.
2. Ecrivez TOUT ce qui vous vient a l'esprit : taches, projets, idees, preoccupations, courses, appels a passer, emails a envoyer, decisions a prendre.
3. Ne filtrez rien, ne priorisez rien. Ecrivez chaque element sur une ligne separee.
4. Quand vous pensez avoir termine, attendez 2 minutes de plus — d'autres elements surgiront.
5. Comptez le nombre total d'elements captures.

Demandez ensuite a Freenzy de classer ces elements en categories (professionnel, personnel, en attente, un jour peut-etre).

Criteres de reussite :
- Minimum 20 elements captures
- Aucun element n'est une phrase longue (max 10 mots par element)
- Vous ressentez un soulagement mental apres l'exercice
- L'IA a reussi a categoriser au moins 80% des elements`,
          xpReward: 20,
        },
        {
          id: 'gtd-m1-l3',
          title: 'Quiz : Maitrisez la capture',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la capture GTD.',
          quizQuestions: [
            { question: 'Quel est le principe fondamental de la capture GTD ?', options: ['Prioriser immediatement chaque tache', 'Externaliser tout ce qui occupe l\'esprit', 'Ne noter que les taches urgentes', 'Organiser en categories des la capture'], correctIndex: 1, explanation: 'La capture GTD consiste a externaliser TOUT ce qui occupe votre attention dans un systeme de confiance, sans filtrer.' },
            { question: 'En combien de temps maximum doit-on capturer une pensee ?', options: ['1 minute', '30 secondes', '10 secondes', '5 minutes'], correctIndex: 2, explanation: 'La capture doit prendre moins de 10 secondes pour eliminer toute friction et garantir qu\'aucune idee n\'est perdue.' },
            { question: 'Que faut-il eviter pendant la phase de capture ?', options: ['Utiliser son telephone', 'Organiser ou prioriser', 'Ecrire des phrases courtes', 'Capturer les idees personnelles'], correctIndex: 1, explanation: 'Pendant la capture, il ne faut pas organiser ni prioriser. On capture brut, l\'organisation vient dans l\'etape suivante.' },
            { question: 'Comment l\'IA ameliore-t-elle la capture GTD ?', options: ['Elle remplace totalement l\'humain', 'Elle reduit la friction et automatise le classement', 'Elle decide quoi capturer', 'Elle supprime les taches inutiles'], correctIndex: 1, explanation: 'L\'IA reduit la friction de capture (dictee vocale, messages rapides) et automatise le classement ulterieur des elements.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Clarification
    {
      id: 'gtd-m2',
      title: 'Clarification intelligente',
      emoji: '\u{1F50D}',
      description: 'Transformez vos captures brutes en actions concretes avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Clarificateur',
      lessons: [
        {
          id: 'gtd-m2-l1',
          title: 'L\'art de clarifier avec l\'IA',
          duration: '5 min',
          type: 'text',
          content: `La clarification est l'etape ou la magie GTD opere vraiment. Chaque element capture doit passer par une question cruciale : "Est-ce actionnable ?" Si oui, quelle est la prochaine action physique concrete ? Si non, c'est soit une reference a archiver, soit un projet "un jour peut-etre", soit une poubelle.

L'IA excelle dans cette etape car elle peut analyser instantanement chaque element et poser les bonnes questions. Quand vous ecrivez "projet Martin", Freenzy peut demander : "S'agit-il d'un nouveau projet a demarrer ? Quelle serait la toute premiere action concrete ?" Cette interaction transforme un element vague en action precise : "Envoyer un email a Martin pour fixer un rendez-vous mardi."

La regle des deux minutes est fondamentale : si la prochaine action prend moins de deux minutes, faites-la immediatement. Ne la notez pas, ne la planifiez pas, executez-la. L'IA peut estimer la duree probable d'une tache et vous signaler celles qui sont candidates a la regle des deux minutes.

Un element qui n'est pas actionnable mais qui pourrait l'etre un jour va dans la liste "Un jour peut-etre". C'est votre reservoir d'idees futures. L'IA peut periodiquement revisiter cette liste et vous signaler les elements devenus pertinents en fonction de votre contexte actuel.

La clarification transforme aussi les projets complexes en sequences d'actions. "Organiser les vacances d'ete" n'est pas une action, c'est un projet. L'IA le decompose : choisir la destination, comparer les vols, reserver l'hebergement, planifier les activites. Chaque sous-element devient une action concrete avec un verbe d'action en debut de phrase.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m2-l2',
          title: 'Jeu : Classez les elements captures',
          duration: '5 min',
          type: 'game',
          content: 'Classez chaque element capture dans la bonne categorie GTD.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Appeler le plombier demain', right: 'Action immediate' },
              { left: 'Apprendre le japonais', right: 'Un jour peut-etre' },
              { left: 'Facture electricite payee', right: 'Poubelle / Archive' },
              { left: 'Preparer la reunion annuelle', right: 'Projet multi-actions' },
              { left: 'Repondre au SMS de Julie', right: 'Regle des 2 minutes' },
              { left: 'Numero de serie du frigo', right: 'Reference a archiver' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'gtd-m2-l3',
          title: 'Quiz : Clarification GTD',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise de la clarification GTD.',
          quizQuestions: [
            { question: 'Quelle est la premiere question a poser lors de la clarification ?', options: ['Est-ce urgent ?', 'Est-ce important ?', 'Est-ce actionnable ?', 'Est-ce delegable ?'], correctIndex: 2, explanation: 'La premiere question GTD est toujours "Est-ce actionnable ?" C\'est le point de depart de tout le processus de clarification.' },
            { question: 'Que dit la regle des deux minutes ?', options: ['Clarifier chaque element en 2 min max', 'Faire immediatement ce qui prend moins de 2 min', 'Reviser sa liste toutes les 2 min', 'Limiter chaque tache a 2 min'], correctIndex: 1, explanation: 'Si la prochaine action prend moins de 2 minutes, il faut l\'executer immediatement plutot que de la planifier.' },
            { question: 'Ou va un element non actionnable mais potentiellement interessant ?', options: ['A la poubelle', 'Dans les actions immediates', 'Dans la liste Un jour peut-etre', 'En delegation'], correctIndex: 2, explanation: 'Les elements non actionnables mais potentiellement utiles vont dans la liste "Un jour peut-etre" pour revision periodique.' },
            { question: 'Comment l\'IA aide-t-elle a clarifier "Organiser les vacances" ?', options: ['Elle reserve directement les billets', 'Elle decompose en sous-actions concretes', 'Elle supprime l\'element comme trop vague', 'Elle le reporte au mois prochain'], correctIndex: 1, explanation: 'L\'IA decompose les projets vagues en actions concretes avec un verbe d\'action : choisir, comparer, reserver, planifier.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Organisation
    {
      id: 'gtd-m3',
      title: 'Organisation dynamique',
      emoji: '\u{1F4C2}',
      description: 'Structurez vos actions dans un systeme de listes contextuelles piloté par l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4C2}',
      badgeName: 'Organisateur Pro',
      lessons: [
        {
          id: 'gtd-m3-l1',
          title: 'Les listes contextuelles GTD',
          duration: '5 min',
          type: 'text',
          content: `L'organisation GTD repose sur un concept puissant : les listes contextuelles. Contrairement aux to-do lists classiques qui melangent tout, GTD organise les actions par contexte d'execution. Un contexte, c'est l'endroit, l'outil ou la personne necessaire pour realiser l'action.

Les contextes classiques sont : @ordinateur, @telephone, @bureau, @maison, @courses, @en-deplacement, et les contextes personnels comme @avec-Marie ou @reunion-equipe. Quand vous etes devant votre ordinateur, vous consultez uniquement la liste @ordinateur. Fini le stress de voir 50 taches dont 40 sont impossibles dans votre contexte actuel.

L'IA revolutionne cette organisation. Freenzy analyse automatiquement chaque action clarifiee et lui attribue le bon contexte. "Appeler le dentiste" va dans @telephone. "Rediger le rapport Q3" va dans @ordinateur. "Acheter du lait" va dans @courses. Vous n'avez plus a trier manuellement.

Mais l'IA va plus loin : elle cree des contextes dynamiques bases sur votre agenda. Si vous avez une reunion avec Pierre a 14h, elle regroupe toutes les actions @avec-Pierre et vous les presente 10 minutes avant la reunion. Si vous partez en deplacement, elle active automatiquement la liste @en-deplacement.

Les projets ont leur propre liste avec un objectif clair et une prochaine action toujours definie. La regle d'or : un projet sans prochaine action est un projet mort. L'IA surveille vos projets et vous alerte quand l'un d'eux n'a plus d'action suivante definie. Elle suggere aussi des regroupements intelligents pour les projets lies entre eux.

Le systeme "En attente" est crucial : chaque fois que vous deleguez ou attendez une reponse, l'element va dans cette liste avec la date et la personne concernee. L'IA envoie des relances automatiques apres un delai configurable.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m3-l2',
          title: 'Exercice : Creez vos listes contextuelles',
          duration: '5 min',
          type: 'exercise',
          content: 'Organisez vos taches capturees dans des listes contextuelles personnalisees.',
          exercisePrompt: `A partir de votre brain dump de l'exercice precedent, creez vos listes contextuelles :

1. Identifiez 5 a 8 contextes pertinents pour votre vie (ex: @bureau, @maison, @telephone, @ordinateur, @courses, @avec-[nom])
2. Repartissez chaque action clarifiee dans le bon contexte
3. Creez une liste "Projets" pour les elements multi-actions (avec la prochaine action de chaque projet)
4. Creez une liste "En attente" pour tout ce qui depend de quelqu'un d'autre
5. Creez une liste "Un jour peut-etre" pour les idees futures

Demandez a Freenzy de valider votre organisation et de suggerer des contextes que vous auriez oublies.

Criteres de reussite :
- Chaque action est dans un seul contexte
- Chaque projet a une prochaine action definie
- La liste "En attente" inclut le nom de la personne et la date
- Aucune action n'est restee non classee`,
          xpReward: 20,
        },
        {
          id: 'gtd-m3-l3',
          title: 'Quiz : Organisation GTD',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'organisation GTD.',
          quizQuestions: [
            { question: 'Qu\'est-ce qu\'un contexte dans GTD ?', options: ['Une priorite (haute, moyenne, basse)', 'L\'endroit, l\'outil ou la personne necessaire pour agir', 'Une date limite', 'Un niveau d\'urgence'], correctIndex: 1, explanation: 'Un contexte GTD represente les conditions necessaires pour executer une action : lieu, outil disponible ou personne presente.' },
            { question: 'Que signifie un projet sans prochaine action definie ?', options: ['Il est termine', 'Il est en pause planifiee', 'C\'est un projet mort a reactiver', 'Il n\'a pas besoin d\'action'], correctIndex: 2, explanation: 'Dans GTD, un projet sans prochaine action definie est considere comme "mort" — il stagne et ne progresse pas.' },
            { question: 'Dans quelle liste va une tache deleguee a un collegue ?', options: ['@bureau', 'Projets', 'En attente', 'Un jour peut-etre'], correctIndex: 2, explanation: 'Toute action deleguee ou dependant d\'une reponse externe va dans la liste "En attente" avec la personne et la date.' },
            { question: 'Comment l\'IA ameliore-t-elle les contextes ?', options: ['Elle supprime les contextes inutiles', 'Elle cree des contextes dynamiques lies a l\'agenda', 'Elle limite le nombre de contextes a 3', 'Elle fusionne tous les contextes en un seul'], correctIndex: 1, explanation: 'L\'IA cree des contextes dynamiques bases sur votre agenda, regroupant les actions pertinentes avant chaque reunion ou deplacement.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Revision
    {
      id: 'gtd-m4',
      title: 'Revision hebdomadaire',
      emoji: '\u{1F504}',
      description: 'Mettez en place une revue hebdomadaire automatisee avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F504}',
      badgeName: 'Reviseur Assidu',
      lessons: [
        {
          id: 'gtd-m4-l1',
          title: 'La revue hebdomadaire : pilier du systeme',
          duration: '5 min',
          type: 'text',
          content: `La revue hebdomadaire est l'etape que David Allen considere comme la plus critique de tout le systeme GTD. Sans elle, vos listes deviennent obsoletes, votre confiance dans le systeme s'erode et vous retombez dans le chaos mental. C'est le moment ou vous prenez de la hauteur pour voir l'ensemble de vos engagements.

La revue classique suit un protocole precis en trois phases. Phase 1, la collecte : verifiez que toutes vos boites de reception sont vides (email, notes, messages, bureau physique). Phase 2, la mise a jour : parcourez chaque liste (actions, projets, en attente, un jour peut-etre) et mettez a jour le statut de chaque element. Phase 3, la vision : consultez vos objectifs a moyen et long terme pour verifier que vos actions quotidiennes sont alignees.

L'IA transforme cette revue de corvee en conversation productive. Freenzy peut preparer un rapport pre-revue automatique chaque vendredi : taches completees cette semaine, taches en retard, projets sans prochaine action, elements en attente depuis plus de 7 jours. Vous n'avez plus qu'a valider et ajuster.

Le moment ideal pour la revue est le vendredi apres-midi ou le dimanche soir. Bloquez 30 minutes dans votre agenda — c'est non negociable. Avec l'aide de l'IA, ce temps peut etre reduit a 15-20 minutes car le travail preparatoire est automatise.

La revue est aussi le moment de revisiter votre liste "Un jour peut-etre". L'IA peut vous signaler les elements qui sont restes plus de 3 mois sans etre actives et vous proposer de les supprimer ou de les transformer en projets actifs. Ce nettoyage regulier maintient votre systeme leger et pertinent. La confiance dans le systeme depend directement de la regularite de cette revue.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m4-l2',
          title: 'Jeu : Ordonnez les etapes de la revue',
          duration: '5 min',
          type: 'game',
          content: 'Remettez les etapes de la revue hebdomadaire GTD dans le bon ordre.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Vider toutes les boites de reception',
              'Parcourir la liste des actions en cours',
              'Mettre a jour la liste des projets',
              'Verifier les elements en attente',
              'Revisiter la liste Un jour peut-etre',
              'Aligner les actions avec les objectifs long terme',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'gtd-m4-l3',
          title: 'Quiz : La revue hebdomadaire',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez votre comprehension de la revue hebdomadaire GTD.',
          quizQuestions: [
            { question: 'Selon David Allen, quelle etape GTD est la plus critique ?', options: ['La capture', 'La clarification', 'La revue hebdomadaire', 'L\'execution'], correctIndex: 2, explanation: 'David Allen considere la revue hebdomadaire comme l\'etape la plus critique car elle maintient la fiabilite de tout le systeme.' },
            { question: 'Quelle est la premiere phase de la revue hebdomadaire ?', options: ['Mettre a jour les projets', 'Vider toutes les boites de reception', 'Definir les priorites de la semaine', 'Supprimer les taches terminees'], correctIndex: 1, explanation: 'La revue commence par la collecte : s\'assurer que toutes les boites de reception (email, notes, bureau) sont videes.' },
            { question: 'Combien de temps faut-il bloquer pour la revue avec l\'IA ?', options: ['5 minutes', '15-20 minutes', '1 heure', '2 heures'], correctIndex: 1, explanation: 'Avec l\'aide de l\'IA qui prepare un rapport automatique, la revue peut etre reduite a 15-20 minutes au lieu de 30-45 minutes.' },
            { question: 'Que faire des elements "Un jour peut-etre" inactifs depuis 3 mois ?', options: ['Les garder indefiniment', 'Les supprimer ou les activer', 'Les deleguer', 'Les ignorer'], correctIndex: 1, explanation: 'Les elements inactifs depuis plus de 3 mois doivent etre supprimes ou transformes en projets actifs pour garder le systeme leger.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Engagement
    {
      id: 'gtd-m5',
      title: 'Engagement et execution',
      emoji: '\u{1F3AF}',
      description: 'Choisissez la bonne action au bon moment grace aux recommandations de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Executeur Focus',
      lessons: [
        {
          id: 'gtd-m5-l1',
          title: 'Choisir la bonne action au bon moment',
          duration: '5 min',
          type: 'text',
          content: `L'engagement est le moment ou vous passez a l'action. Mais face a une longue liste de taches possibles, comment choisir la bonne ? David Allen propose quatre criteres de selection : le contexte, le temps disponible, l'energie disponible et la priorite. L'IA peut evaluer ces quatre criteres en temps reel pour vous recommander l'action optimale.

Le contexte est le premier filtre : si vous etes dans le metro, seules les actions @telephone ou @lecture sont pertinentes. Le temps disponible est le second filtre : si vous avez 10 minutes avant une reunion, l'IA ne vous proposera pas une tache de 2 heures. L'energie est le troisieme filtre, souvent neglige : apres un dejeuner copieux, privilegiez les taches mecaniques plutot que la reflexion strategique.

L'IA apprend vos rythmes energetiques. Apres quelques semaines d'utilisation, Freenzy sait que vous etes le plus creatif le matin entre 9h et 11h, le plus efficace pour les taches administratives entre 14h et 16h, et que votre energie chute vers 17h. Elle adapte ses recommandations en consequence.

La matrice Eisenhower (urgent/important) reste utile mais l'IA l'affine. Elle detecte les taches "faussement urgentes" qui pourraient attendre, et les taches "discretement importantes" que vous reportez depuis des semaines. Elle vous alerte quand un projet strategique n'a recu aucune attention depuis 10 jours.

Le concept de "prochaine action" est votre arme secrete contre la procrastination. Quand une tache vous semble insurmontable, c'est souvent parce qu'elle est mal definie. "Lancer le nouveau produit" paralyse. "Ecrire 3 bullet points sur le positionnement du produit" est faisable immediatement. L'IA decompose systematiquement les actions intimidantes en micro-etapes de 5 a 15 minutes que vous pouvez attaquer sans resistance.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m5-l2',
          title: 'Exercice : Planifiez votre journee ideale GTD',
          duration: '5 min',
          type: 'exercise',
          content: 'Construisez une journee type en utilisant les 4 criteres de selection GTD.',
          exercisePrompt: `Planifiez votre journee de demain en utilisant la methode GTD d'engagement :

1. Listez les creneaux horaires de votre journee (matin, debut d'apres-midi, fin d'apres-midi, soir)
2. Pour chaque creneau, identifiez votre contexte (bureau, deplacement, maison), votre niveau d'energie (haut, moyen, bas) et le temps disponible
3. Selectionnez 2-3 actions de vos listes contextuelles pour chaque creneau, en respectant les 4 criteres (contexte, temps, energie, priorite)
4. Identifiez votre "grenouille" du jour : la tache la plus importante que vous avez tendance a repousser
5. Placez la grenouille dans le creneau ou votre energie est maximale

Demandez a Freenzy d'analyser votre planning et de suggerer des ajustements.

Criteres de reussite :
- Chaque creneau a 2-3 actions adaptees au contexte et a l'energie
- La grenouille est placee au moment optimal
- Le planning est realiste (pas de surcharge)
- Au moins une action "importante mais non urgente" est incluse`,
          xpReward: 20,
        },
        {
          id: 'gtd-m5-l3',
          title: 'Quiz : Engagement GTD',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la phase d\'engagement GTD.',
          quizQuestions: [
            { question: 'Quels sont les 4 criteres de selection d\'action GTD ?', options: ['Urgence, importance, difficulte, duree', 'Contexte, temps, energie, priorite', 'Cout, benefice, risque, delai', 'Plaisir, utilite, rapidite, impact'], correctIndex: 1, explanation: 'Les 4 criteres GTD pour choisir une action sont : le contexte disponible, le temps disponible, l\'energie actuelle et la priorite.' },
            { question: 'Que fait l\'IA quand une tache vous semble insurmontable ?', options: ['Elle la supprime de la liste', 'Elle la decompose en micro-etapes de 5-15 min', 'Elle la reporte au mois suivant', 'Elle la delegue automatiquement'], correctIndex: 1, explanation: 'L\'IA decompose les taches intimidantes en micro-etapes faisables de 5 a 15 minutes pour vaincre la procrastination.' },
            { question: 'Qu\'est-ce qu\'une "grenouille" dans le contexte de la productivite ?', options: ['Une tache facile pour s\'echauffer', 'La tache la plus importante qu\'on tend a repousser', 'Un bug informatique a corriger', 'Une reunion inutile a annuler'], correctIndex: 1, explanation: 'La "grenouille" est la tache la plus importante et souvent la plus redoutee. Il faut la traiter quand l\'energie est au maximum.' },
            { question: 'Comment l\'IA apprend-elle vos rythmes energetiques ?', options: ['Vous remplissez un questionnaire', 'Elle analyse vos habitudes sur plusieurs semaines', 'Elle utilise un capteur biometrique', 'Elle impose un rythme standard'], correctIndex: 1, explanation: 'L\'IA observe vos patterns de productivite sur plusieurs semaines pour identifier vos pics et creux d\'energie naturels.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Automatisation
    {
      id: 'gtd-m6',
      title: 'Automatisation IA du workflow',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Automatisez les etapes repetitives de votre systeme GTD avec l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Automatiseur GTD',
      lessons: [
        {
          id: 'gtd-m6-l1',
          title: 'Automatiser GTD avec Freenzy',
          duration: '5 min',
          type: 'text',
          content: `L'automatisation est la couche finale qui transforme votre systeme GTD en machine de productivite autonome. L'IA ne remplace pas votre jugement, mais elle elimine toute la friction mecanique qui empeche beaucoup de gens de maintenir leur systeme GTD sur la duree.

La capture automatisee est le premier niveau. Configurez des regles simples : chaque email marque d'une etoile est automatiquement ajoute a votre inbox GTD. Chaque message WhatsApp envoye a Freenzy avec le prefixe "todo:" est capture et pre-clarifie. Les notes vocales sont transcrites et transformees en elements actionnables.

Le deuxieme niveau est le tri automatique. L'IA analyse chaque nouvel element et propose un contexte, une estimation de duree et un niveau de priorite. Vous n'avez qu'a valider d'un clic. En cas de doute, elle pose une question precise : "Cette tache necessite-t-elle un ordinateur ou peut-elle etre faite par telephone ?"

Le troisieme niveau concerne les suivis automatiques. Quand vous deleguez une tache, l'IA cree automatiquement un element "En attente" avec un rappel a J+3. Si aucune reponse n'est recue, elle vous propose d'envoyer une relance polie pre-redigee. Pour les projets recurrents, elle cree les prochaines actions avant meme que vous y pensiez.

Le rapport hebdomadaire automatique est le joyau du systeme. Chaque vendredi a 14h, Freenzy vous envoie un resume : taches completees, taux d'achevement par projet, elements bloques, suggestions pour la semaine suivante. Votre revue hebdomadaire devient une simple validation de 15 minutes au lieu d'un audit fastidieux d'une heure.

Commencez petit : automatisez d'abord la capture, puis le tri, puis les suivis. En un mois, votre systeme GTD fonctionnera avec une fluidite que David Allen lui-meme n'aurait pas imaginee.`,
          xpReward: 15,
        },
        {
          id: 'gtd-m6-l2',
          title: 'Jeu : Associez chaque automatisation a son niveau',
          duration: '5 min',
          type: 'game',
          content: 'Identifiez le niveau d\'automatisation de chaque fonctionnalite.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Email etoile → inbox GTD', right: 'Niveau 1 : Capture' },
              { left: 'Attribution automatique de contexte', right: 'Niveau 2 : Tri' },
              { left: 'Relance auto apres delegation J+3', right: 'Niveau 3 : Suivis' },
              { left: 'Note vocale → element actionnable', right: 'Niveau 1 : Capture' },
              { left: 'Rapport hebdomadaire auto le vendredi', right: 'Niveau 3 : Suivis' },
              { left: 'Estimation de duree par l\'IA', right: 'Niveau 2 : Tri' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'gtd-m6-l3',
          title: 'Quiz : Automatisation GTD',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur l\'automatisation du workflow GTD.',
          quizQuestions: [
            { question: 'Quel est le premier niveau d\'automatisation GTD a mettre en place ?', options: ['Les rapports hebdomadaires', 'La capture automatisee', 'Le tri automatique', 'Les relances de delegation'], correctIndex: 1, explanation: 'Il faut commencer par automatiser la capture (emails, messages, notes vocales) car c\'est la fondation du systeme.' },
            { question: 'Apres combien de jours l\'IA propose-t-elle une relance de delegation ?', options: ['1 jour', '3 jours', '7 jours', '14 jours'], correctIndex: 1, explanation: 'L\'IA cree un rappel a J+3 par defaut apres une delegation, delai optimal avant une relance polie.' },
            { question: 'Quand le rapport hebdomadaire automatique est-il envoye ?', options: ['Lundi matin', 'Mercredi midi', 'Vendredi 14h', 'Dimanche soir'], correctIndex: 2, explanation: 'Le rapport est envoye le vendredi a 14h pour preparer la revue hebdomadaire avant le week-end.' },
            { question: 'Quel est l\'objectif principal de l\'automatisation GTD ?', options: ['Remplacer completement l\'humain', 'Eliminer la friction mecanique du systeme', 'Reduire le nombre de taches', 'Supprimer la revue hebdomadaire'], correctIndex: 1, explanation: 'L\'automatisation elimine la friction mecanique pour que vous puissiez vous concentrer sur les decisions et l\'execution.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 2 — Pomodoro Avance
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursPomodoroAvance: FormationParcours = {
  id: 'pomodoro-avance',
  title: 'Pomodoro Avance',
  emoji: '\u{1F345}',
  description: 'Depassez la technique Pomodoro de base : variations strategiques, deep work, batching intelligent, outils IA et construction d\'habitudes durables pour une productivite maximale.',
  category: 'productivite',
  subcategory: 'methodes',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#EF4444',
  diplomaTitle: 'Pomodoro Avance',
  diplomaSubtitle: 'Certification Freenzy.io — Technique Pomodoro Avancee et Intelligence Artificielle',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Technique de base
    {
      id: 'pomo-m1',
      title: 'Technique de base',
      emoji: '\u{1F345}',
      description: 'Maitrisez les fondamentaux de la technique Pomodoro avant d\'aller plus loin.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F345}',
      badgeName: 'Premier Pomodoro',
      lessons: [
        {
          id: 'pomo-m1-l1',
          title: 'Les fondamentaux Pomodoro',
          duration: '5 min',
          type: 'text',
          content: `La technique Pomodoro, inventee par Francesco Cirillo dans les annees 1980, est l'une des methodes de gestion du temps les plus efficaces au monde. Son nom vient du minuteur de cuisine en forme de tomate qu'utilisait Cirillo pendant ses etudes. Le principe est elegant dans sa simplicite : travailler en blocs de 25 minutes de concentration totale, separes par des pauses de 5 minutes.

Un "pomodoro" est un cycle complet de 25 minutes de travail ininterrompu. Pendant ces 25 minutes, vous ne consultez pas vos emails, vous ne repondez pas au telephone, vous ne naviguez pas sur les reseaux sociaux. Toute interruption externe est notee sur une feuille et reportee. Toute interruption interne ("je devrais appeler le plombier") est egalement notee puis oubliee jusqu'a la pause.

Apres 4 pomodoros consecutifs (soit 2 heures de travail effectif), vous prenez une pause longue de 15 a 30 minutes. Cette pause est essentielle car votre cerveau a besoin de consolider les informations traitees. Profitez-en pour marcher, boire de l'eau, etirer votre corps.

L'efficacite de la methode repose sur un principe neuroscientifique : le cerveau humain ne peut maintenir une concentration intense que pendant 20 a 40 minutes. En imposant une limite de 25 minutes, vous travaillez avec votre biologie plutot que contre elle. La contrainte temporelle cree aussi un sentiment d'urgence benefique qui reduit la procrastination.

L'IA enrichit la methode en suivant vos statistiques : nombre de pomodoros par jour, taux d'interruption, types de taches les plus productives. Freenzy analyse ces donnees et vous aide a optimiser votre planning en placant les taches difficiles dans vos creneaux de haute energie.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m1-l2',
          title: 'Exercice : Votre premier Pomodoro assiste par IA',
          duration: '5 min',
          type: 'exercise',
          content: 'Realisez un pomodoro complet avec suivi IA.',
          exercisePrompt: `Realisez votre premier pomodoro assiste par l'IA en suivant ce protocole :

1. Choisissez UNE tache precise a accomplir (pas un projet vague, une action concrete)
2. Definissez un objectif mesurable pour ces 25 minutes (ex: "rediger 300 mots de mon article", "traiter 10 emails")
3. Demandez a Freenzy de lancer un timer de 25 minutes et de bloquer toute notification
4. Travaillez sans interruption. A chaque envie de distraction, notez-la sur un papier et revenez au travail
5. A la fin du pomodoro, evaluez : objectif atteint ? Nombre d'interruptions internes ? Niveau de focus (1-10) ?
6. Prenez 5 minutes de pause (levez-vous, etirez-vous, ne regardez pas d'ecran)

Criteres de reussite :
- La tache choisie est specifique et mesurable
- Vous avez tenu 25 minutes sans consulter votre telephone
- Vous avez note au moins une interruption interne geree
- Votre auto-evaluation est honnete et detaillee
- La pause de 5 minutes a ete respectee`,
          xpReward: 20,
        },
        {
          id: 'pomo-m1-l3',
          title: 'Quiz : Fondamentaux Pomodoro',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise des bases Pomodoro.',
          quizQuestions: [
            { question: 'Quelle est la duree standard d\'un pomodoro ?', options: ['15 minutes', '25 minutes', '45 minutes', '60 minutes'], correctIndex: 1, explanation: 'Un pomodoro standard dure 25 minutes de travail concentre, suivi d\'une pause de 5 minutes.' },
            { question: 'Apres combien de pomodoros prend-on une pause longue ?', options: ['2 pomodoros', '3 pomodoros', '4 pomodoros', '6 pomodoros'], correctIndex: 2, explanation: 'Apres 4 pomodoros consecutifs (2h de travail), on prend une pause longue de 15 a 30 minutes.' },
            { question: 'Que faire quand une pensee distrayante surgit pendant un pomodoro ?', options: ['Arreter et traiter immediatement', 'La noter et continuer a travailler', 'L\'ignorer completement', 'Redemarrer le pomodoro'], correctIndex: 1, explanation: 'On note l\'interruption interne sur un papier pour la traiter plus tard, puis on revient au travail sans rompre le pomodoro.' },
            { question: 'Pourquoi 25 minutes est-il un bon intervalle ?', options: ['C\'est un chiffre rond', 'Cela correspond a la capacite de concentration du cerveau', 'Francesco Cirillo l\'a choisi au hasard', 'C\'est impose par la minuterie de cuisine'], correctIndex: 1, explanation: 'Le cerveau humain maintient une concentration intense pendant 20-40 minutes. 25 minutes respecte cette limite biologique.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Variations
    {
      id: 'pomo-m2',
      title: 'Variations strategiques',
      emoji: '\u{1F504}',
      description: 'Explorez les variantes du Pomodoro adaptees a differents types de travail.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F504}',
      badgeName: 'Stratege Temporel',
      lessons: [
        {
          id: 'pomo-m2-l1',
          title: 'Au-dela du 25/5 classique',
          duration: '5 min',
          type: 'text',
          content: `Le format 25/5 est le point de depart, mais il ne convient pas a tous les types de travail ni a toutes les personnalites. Plusieurs variations ont ete developpees pour s'adapter a differents contextes, et l'IA peut vous aider a trouver celle qui vous correspond le mieux.

La variation 50/10 convient aux taches qui demandent une immersion profonde : programmation, redaction longue, design. Vous travaillez 50 minutes et prenez 10 minutes de pause. Cette variation respecte le cycle ultradian naturel du cerveau et permet d'atteindre un etat de flow plus profond. L'inconvenient est que la fatigue mentale est plus intense apres chaque bloc.

La variation 90/20 s'inspire directement des cycles de repos-activite de 90 minutes decouverts par le chercheur Nathaniel Kleitman. Vous travaillez 90 minutes (un cycle ultradian complet) puis prenez 20 minutes de pause reelle. C'est ideal pour le travail creatif ou strategique, mais demande un environnement sans interruption.

La micro-variation 15/3 est parfaite pour les journees fragmentees : entre deux reunions, dans les transports, pendant une attente. Quinze minutes de concentration maximale sur une micro-tache, puis 3 minutes de transition. L'IA peut identifier les micro-creneaux dans votre agenda et suggerer des micro-taches adaptees.

La variation progressive commence par des pomodoros courts (15 min) le matin pour s'echauffer, passe a 25 min en milieu de matinee, atteint 50 min en debut d'apres-midi (pic de concentration pour beaucoup), puis redescend a 25 min puis 15 min en fin de journee. Freenzy peut ajuster automatiquement les durees selon votre historique de productivite et votre energie mesuree.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m2-l2',
          title: 'Jeu : Associez la variation au contexte',
          duration: '5 min',
          type: 'game',
          content: 'Trouvez la meilleure variation Pomodoro pour chaque situation.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Session de programmation intense', right: '50/10 — Immersion profonde' },
              { left: 'Redaction d\'un business plan', right: '90/20 — Cycle ultradian' },
              { left: 'Traitement d\'emails entre reunions', right: '15/3 — Micro-pomodoro' },
              { left: 'Journee standard au bureau', right: '25/5 — Classique' },
              { left: 'Debut de matinee, energie montante', right: 'Progressive — Court vers long' },
              { left: 'Etude d\'un sujet complexe', right: '50/10 — Immersion profonde' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'pomo-m2-l3',
          title: 'Quiz : Variations Pomodoro',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les variantes Pomodoro.',
          quizQuestions: [
            { question: 'Quelle variation convient le mieux a la programmation ?', options: ['15/3', '25/5', '50/10', 'Pas de timer'], correctIndex: 2, explanation: 'La variation 50/10 permet une immersion profonde necessaire a la programmation, avec assez de temps pour atteindre le flow.' },
            { question: 'Sur quoi repose la variation 90/20 ?', options: ['Une etude de Francesco Cirillo', 'Les cycles ultradiens de Kleitman', 'La methode Eisenhower', 'Le time boxing agile'], correctIndex: 1, explanation: 'La variation 90/20 s\'inspire des cycles ultradiens de 90 minutes decouverts par le chercheur Nathaniel Kleitman.' },
            { question: 'Quand utiliser les micro-pomodoros de 15/3 ?', options: ['Pour le travail creatif', 'Entre deux reunions ou en deplacement', 'Pour les projets strategiques', 'Uniquement le matin'], correctIndex: 1, explanation: 'Les micro-pomodoros 15/3 sont parfaits pour exploiter les creneaux courts : entre reunions, dans les transports, pendant les attentes.' },
            { question: 'Comment fonctionne la variation progressive ?', options: ['Durees identiques toute la journee', 'Pomodoros courts le matin, longs l\'apres-midi, courts le soir', 'Uniquement des pomodoros de 50 min', 'Pas de pause entre les blocs'], correctIndex: 1, explanation: 'La variation progressive adapte la duree a l\'energie : courte le matin (echauffement), longue l\'apres-midi (pic), courte le soir (fatigue).' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Deep Work
    {
      id: 'pomo-m3',
      title: 'Deep Work et Pomodoro',
      emoji: '\u{1F9E0}',
      description: 'Combinez Pomodoro et Deep Work pour des sessions de concentration ultime.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F9E0}',
      badgeName: 'Deep Worker',
      lessons: [
        {
          id: 'pomo-m3-l1',
          title: 'Fusionner Pomodoro et Deep Work',
          duration: '5 min',
          type: 'text',
          content: `Le concept de Deep Work, popularise par Cal Newport, designe un travail cognitif intense realise dans un etat de concentration sans distraction. Combine avec la structure du Pomodoro, il cree un cadre redoutablement efficace pour produire un travail de haute qualite en un temps reduit.

La difference fondamentale entre un pomodoro ordinaire et un pomodoro "deep work" est l'intentionnalite. Avant chaque session, vous definissez non seulement la tache, mais aussi la profondeur cognitive requise. "Repondre a 10 emails" est du shallow work. "Concevoir l'architecture du nouveau module de facturation" est du deep work. L'IA classe automatiquement vos taches par profondeur cognitive.

Pour entrer en deep work, vous devez eliminer toute possibilite d'interruption. L'IA peut activer un mode "bunker" : notifications desactivees, statut "ne pas deranger" sur tous vos canaux, reponses automatiques programmees. Ce n'est pas une option, c'est une condition necessaire. Chaque interruption coute en moyenne 23 minutes de reconcentration selon les recherches de Gloria Mark a UC Irvine.

Le rituel d'entree est crucial. Avant chaque session deep work, prenez 2 minutes pour : fermer tous les onglets non necessaires, ecrire sur un papier votre objectif precis, inspirer profondement trois fois. Ce micro-rituel signale a votre cerveau que le mode concentration s'active. L'IA peut guider ce rituel avec un prompt vocal de 90 secondes.

Planifiez vos sessions deep work aux moments de haute energie. Pour la plupart des gens, c'est le matin entre 8h et 12h. Freenzy analyse votre historique de productivite pour identifier vos fenetres optimales. Reservez ces creneaux dans votre agenda comme des rendez-vous non negociables — c'est votre temps le plus precieux et il doit etre protege contre toutes les sollicitations.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m3-l2',
          title: 'Exercice : Session Deep Work de 50 minutes',
          duration: '5 min',
          type: 'exercise',
          content: 'Realisez une session Deep Work complete avec protocole IA.',
          exercisePrompt: `Realisez une session Deep Work de 50 minutes (2 pomodoros enchaines) avec ce protocole :

1. PREPARATION (5 min avant) :
   - Choisissez une tache de haute valeur cognitive (pas d'emails, pas d'administratif)
   - Ecrivez votre objectif precis sur papier : "A la fin de cette session, j'aurai..."
   - Fermez toutes les applications non necessaires, activez le mode avion
   - Demandez a Freenzy d'activer le mode "bunker" (reponses automatiques)

2. EXECUTION (50 min) :
   - Travaillez sans aucune interruption
   - Si une pensee parasite surgit, notez-la en un mot et revenez au travail
   - Ne verifiez pas l'heure — laissez le timer faire son travail

3. DEBRIEFING (5 min apres) :
   - Evaluez : objectif atteint a quel pourcentage ?
   - Combien d'interruptions internes notees ?
   - Quel a ete votre niveau de flow (1-10) ?
   - Qu'est-ce qui a le mieux fonctionne ? Que changeriez-vous ?

Criteres de reussite :
- La tache choisie est du "vrai" deep work (cognitive, pas mecanique)
- Zero consultation d'ecran externe pendant 50 minutes
- L'objectif est mesurable et au moins 70% atteint
- Le debriefing est complete et honnete`,
          xpReward: 20,
        },
        {
          id: 'pomo-m3-l3',
          title: 'Quiz : Deep Work',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez votre comprehension du Deep Work combine au Pomodoro.',
          quizQuestions: [
            { question: 'Combien de temps faut-il en moyenne pour se reconcentrer apres une interruption ?', options: ['5 minutes', '10 minutes', '23 minutes', '45 minutes'], correctIndex: 2, explanation: 'Selon les recherches de Gloria Mark (UC Irvine), il faut en moyenne 23 minutes pour retrouver sa concentration apres une interruption.' },
            { question: 'Quelle est la premiere etape du rituel d\'entree en deep work ?', options: ['Lancer le timer', 'Fermer les onglets et ecrire l\'objectif', 'Boire un cafe', 'Verifier ses emails une derniere fois'], correctIndex: 1, explanation: 'Le rituel commence par fermer les onglets inutiles et ecrire l\'objectif precis — cela signale au cerveau le passage en mode concentration.' },
            { question: 'Quelle tache est du deep work ?', options: ['Repondre a des emails', 'Concevoir une architecture logicielle', 'Trier des factures', 'Remplir un formulaire administratif'], correctIndex: 1, explanation: 'Le deep work implique un effort cognitif intense et creatif. Concevoir une architecture est du deep work, les emails sont du shallow work.' },
            { question: 'Quand planifier ses sessions deep work ?', options: ['Apres le dejeuner', 'En fin de journee', 'Aux moments de haute energie (souvent le matin)', 'Pendant les reunions calmes'], correctIndex: 2, explanation: 'Les sessions deep work doivent etre placees aux pics d\'energie, generalement le matin entre 8h et 12h pour la plupart des gens.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Batching
    {
      id: 'pomo-m4',
      title: 'Batching intelligent',
      emoji: '\u{1F4E6}',
      description: 'Regroupez les taches similaires pour maximiser votre efficacite et minimiser les couts de changement de contexte.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Maitre du Batching',
      lessons: [
        {
          id: 'pomo-m4-l1',
          title: 'Le batching : regrouper pour performer',
          duration: '5 min',
          type: 'text',
          content: `Le batching consiste a regrouper les taches de meme nature dans des blocs de temps dedies. Au lieu de traiter vos emails au fil de l'eau (une interruption toutes les 10 minutes), vous les traitez tous en un seul bloc de 30 minutes, trois fois par jour. Ce simple changement peut liberer jusqu'a 2 heures de temps productif quotidien.

Le cout cognitif du changement de contexte est enorme. Passer de la redaction a l'email, puis au telephone, puis retour a la redaction — chaque transition coute de l'energie mentale et du temps de reconcentration. Le batching elimine ces transitions en maintenant votre cerveau dans le meme mode operatoire pendant toute la duree du bloc.

Les categories de batching les plus efficaces sont : la communication (emails, messages, appels regroupes), la creation (redaction, design, strategie), l'administratif (factures, formulaires, classement), la formation (lecture, cours, veille) et les reunions (concentrees sur un ou deux jours maximum de la semaine).

L'IA rend le batching encore plus puissant. Freenzy analyse votre flux de taches et propose automatiquement des regroupements. Elle detecte que vous avez 5 emails a rediger, 3 appels a passer et 2 devis a envoyer, et suggere : "Bloc communication de 45 minutes a 14h — voulez-vous que je prepare les drafts d'emails pendant ce temps ?"

Le batching combine au Pomodoro cree une structure optimale : un bloc de batching de 50 minutes (2 pomodoros) dedie a un type de tache, suivi d'une pause de 10 minutes, puis un nouveau bloc pour un autre type. Votre journee devient une sequence de blocs thematiques efficaces plutot qu'un melange chaotique de micro-taches. L'IA optimise l'ordre des blocs en fonction de votre energie et de vos deadlines.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m4-l2',
          title: 'Jeu : Organisez les taches en lots',
          duration: '5 min',
          type: 'game',
          content: 'Regroupez les taches suivantes dans les bons lots de batching.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Repondre aux emails clients', right: 'Lot Communication' },
              { left: 'Rediger un article de blog', right: 'Lot Creation' },
              { left: 'Classer les factures du mois', right: 'Lot Administratif' },
              { left: 'Appeler 3 fournisseurs', right: 'Lot Communication' },
              { left: 'Suivre un cours en ligne', right: 'Lot Formation' },
              { left: 'Preparer une presentation', right: 'Lot Creation' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'pomo-m4-l3',
          title: 'Quiz : Batching intelligent',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur le batching.',
          quizQuestions: [
            { question: 'Combien de temps productif le batching peut-il liberer quotidiennement ?', options: ['15 minutes', '30 minutes', 'Jusqu\'a 2 heures', '4 heures'], correctIndex: 2, explanation: 'En eliminant les couts de changement de contexte, le batching peut liberer jusqu\'a 2 heures de temps productif par jour.' },
            { question: 'Quel est le principal probleme du traitement d\'emails au fil de l\'eau ?', options: ['On repond trop vite', 'Chaque email cree un changement de contexte couteux', 'Les emails sont moins bien rediges', 'On oublie de repondre'], correctIndex: 1, explanation: 'Traiter les emails au fil de l\'eau cree des interruptions constantes, chaque changement de contexte coutant du temps et de l\'energie cognitive.' },
            { question: 'Comment l\'IA optimise-t-elle le batching ?', options: ['Elle supprime les taches inutiles', 'Elle propose des regroupements et prepare les drafts', 'Elle fait le travail a votre place', 'Elle ajoute plus de taches aux lots'], correctIndex: 1, explanation: 'L\'IA analyse le flux de taches, propose des regroupements intelligents et peut preparer des ebauches pendant vos blocs de communication.' },
            { question: 'Quelle combinaison batching + Pomodoro est optimale ?', options: ['1 pomodoro par type de tache', '2 pomodoros (50 min) par bloc thematique', '4 pomodoros sans pause', 'Un seul type de tache toute la journee'], correctIndex: 1, explanation: 'Un bloc thematique de 50 minutes (2 pomodoros) par type de tache offre le meilleur equilibre entre immersion et recuperation.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Outils IA
    {
      id: 'pomo-m5',
      title: 'Outils IA pour le Pomodoro',
      emoji: '\u{1F916}',
      description: 'Exploitez les outils IA de Freenzy pour optimiser chaque aspect de vos sessions Pomodoro.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F916}',
      badgeName: 'Pomodoro Augmente',
      lessons: [
        {
          id: 'pomo-m5-l1',
          title: 'L\'IA comme coach Pomodoro',
          duration: '5 min',
          type: 'text',
          content: `L'IA transforme la technique Pomodoro d'un simple minuteur en un systeme de coaching personnalise. Freenzy ne se contente pas de decompter le temps : elle analyse vos patterns, anticipe vos baisses de concentration et ajuste votre rythme en temps reel pour maximiser votre productivite.

L'analyse des patterns est la premiere fonctionnalite cle. Apres deux semaines d'utilisation, l'IA identifie vos tendances : quels jours etes-vous le plus productif, a quelles heures atteignez-vous le plus de pomodoros completes, quels types de taches generent le plus d'interruptions. Ces donnees sont presentees dans un tableau de bord clair avec des recommandations actionnables.

La prediction de fatigue est la deuxieme fonctionnalite. L'IA detecte quand votre productivite commence a baisser — par exemple, quand vos pomodoros passent de 25 minutes completes a des abandons a 15 minutes. Elle propose alors une pause plus longue, un changement de type de tache ou meme l'arret de la journee de travail si la fatigue est trop avancee.

L'estimation intelligente des taches est la troisieme fonctionnalite. Pour chaque nouvelle tache, l'IA estime combien de pomodoros seront necessaires en se basant sur des taches similaires passees. "Rediger un article de 1500 mots" pourrait etre estime a 3 pomodoros, alors que "Preparer une presentation de 10 slides" en necessitera 4.

Enfin, l'IA genere des rapports de productivite hebdomadaires. Nombre total de pomodoros, repartition par categorie de tache, evolution semaine apres semaine, comparaison avec vos objectifs. Ces metriques objectives vous permettent d'ajuster votre methode avec des donnees reelles plutot que des impressions subjectives. Freenzy celebre aussi vos records et maintient votre motivation avec des badges et des streaks.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m5-l2',
          title: 'Exercice : Configurez votre coach IA Pomodoro',
          duration: '5 min',
          type: 'exercise',
          content: 'Parametrez votre assistant IA pour un accompagnement Pomodoro optimal.',
          exercisePrompt: `Configurez votre coach IA Pomodoro personnalise en suivant ces etapes :

1. PROFIL DE TRAVAIL :
   - Decrivez vos 3-4 types de taches principales (ex: redaction, code, communication, admin)
   - Pour chaque type, indiquez votre variation Pomodoro preferee (25/5, 50/10, 15/3)
   - Identifiez vos heures de haute et basse energie

2. OBJECTIFS :
   - Fixez un objectif quotidien de pomodoros (commencez modeste : 6-8 par jour)
   - Definissez un objectif hebdomadaire (ex: 30 pomodoros minimum)
   - Choisissez une metrique a ameliorer (taux de completion, nombre d'interruptions, deep work ratio)

3. RITUELS :
   - Creez votre rituel d'ouverture de journee (ex: revue des taches, 3 respirations, premier pomodoro)
   - Creez votre rituel de fermeture (ex: bilan du jour, preparation du lendemain)
   - Definissez votre signal de pause (alarme, musique, vibration)

4. ALERTES IA :
   - Quand l'IA doit-elle vous alerter ? (baisse de productivite, streak a celebrer, pause oubliee)

Demandez a Freenzy de valider votre configuration et de suggerer des ajustements.

Criteres de reussite :
- Le profil couvre tous vos types de taches avec la bonne variation
- Les objectifs sont realistes et mesurables
- Les rituels sont concrets et realisables en moins de 5 minutes
- Au moins 3 types d'alertes sont configures`,
          xpReward: 20,
        },
        {
          id: 'pomo-m5-l3',
          title: 'Quiz : Outils IA Pomodoro',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les outils IA pour le Pomodoro.',
          quizQuestions: [
            { question: 'Apres combien de temps l\'IA peut-elle identifier vos patterns de productivite ?', options: ['1 jour', '3 jours', '2 semaines', '3 mois'], correctIndex: 2, explanation: 'Il faut environ deux semaines d\'utilisation pour que l\'IA identifie des patterns fiables dans vos habitudes de travail.' },
            { question: 'Que detecte la fonctionnalite de prediction de fatigue ?', options: ['Votre rythme cardiaque', 'La baisse du nombre de pomodoros completes', 'Vos mouvements de souris', 'Le nombre de cafes bus'], correctIndex: 1, explanation: 'L\'IA detecte la fatigue quand vos pomodoros passent de completes (25 min) a abandonnes plus tot, signe de baisse de concentration.' },
            { question: 'Sur quoi se base l\'estimation intelligente des taches ?', options: ['La difficulte percue', 'Des taches similaires passees', 'Le titre de la tache uniquement', 'Un calcul aleatoire'], correctIndex: 1, explanation: 'L\'IA estime le nombre de pomodoros necessaires en analysant combien de temps des taches similaires ont pris dans le passe.' },
            { question: 'Quel est l\'objectif quotidien recommande pour debuter ?', options: ['2-3 pomodoros', '6-8 pomodoros', '12-15 pomodoros', '20 pomodoros'], correctIndex: 1, explanation: 'Commencer avec 6-8 pomodoros par jour est realiste et soutenable. Cela represente 2h30 a 3h20 de travail concentre effectif.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Habitudes
    {
      id: 'pomo-m6',
      title: 'Construire des habitudes durables',
      emoji: '\u{1F3C6}',
      description: 'Transformez le Pomodoro en habitude automatique grace a la science des habitudes et au renforcement IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3C6}',
      badgeName: 'Habitude Pomodoro',
      lessons: [
        {
          id: 'pomo-m6-l1',
          title: 'La science des habitudes appliquee au Pomodoro',
          duration: '5 min',
          type: 'text',
          content: `Toute habitude suit une boucle en quatre etapes decouverte par les neurosciences : le signal (cue), l'envie (craving), la reponse (response) et la recompense (reward). Pour ancrer le Pomodoro comme habitude automatique, vous devez optimiser chaque etape de cette boucle avec l'aide de l'IA.

Le signal doit etre clair et constant. Associez le debut de vos pomodoros a un declencheur specifique : apres votre premier cafe, en arrivant au bureau, apres avoir ouvert votre ordinateur. L'IA peut envoyer un rappel contextuel au bon moment : "Vous venez d'ouvrir votre laptop — pret pour votre premier pomodoro ?" Avec le temps, le simple fait d'ouvrir votre ordinateur declenchera automatiquement l'envie de lancer un pomodoro.

L'envie est alimentee par la dopamine d'anticipation. Le systeme de gamification de Freenzy exploite ce mecanisme : chaque pomodoro complete alimente votre streak, debloque des badges, fait monter votre niveau. L'IA celebre vos records ("Nouveau record : 8 pomodoros aujourd'hui !") et cree une competition positive avec vous-meme.

La reponse doit etre aussi simple que possible. Un seul clic pour lancer un pomodoro, pas de configuration a chaque fois. L'IA memorise vos preferences et pre-selectionne la duree, le type de tache et le mode (deep work ou shallow work) en fonction du moment de la journee et de votre historique.

La recompense clot la boucle. Outre les badges et le XP, l'IA propose des micro-recompenses personnalisees : "Vous avez complete 4 pomodoros — accordez-vous 10 minutes de YouTube sans culpabilite." Cette permission explicite de se recompenser renforce enormement la boucle habitude. Apres 21 jours consecutifs, le Pomodoro devient quasi-automatique. Apres 66 jours, c'est une habitude profondement ancree selon les recherches de Phillippa Lally.`,
          xpReward: 15,
        },
        {
          id: 'pomo-m6-l2',
          title: 'Jeu : La boucle des habitudes',
          duration: '5 min',
          type: 'game',
          content: 'Remettez les elements de la boucle d\'habitude dans le bon ordre.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Signal : ouvrir son ordinateur le matin',
              'Envie : anticipation du streak et des badges',
              'Reponse : lancer le pomodoro en un clic',
              'Recompense : badge debloque + pause meritee',
              'Repetition : meme signal le lendemain',
              'Automatisme : le comportement devient reflexe apres 66 jours',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'pomo-m6-l3',
          title: 'Quiz : Habitudes Pomodoro',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la construction d\'habitudes Pomodoro.',
          quizQuestions: [
            { question: 'Quelles sont les 4 etapes de la boucle d\'habitude ?', options: ['Plan, action, verification, ajustement', 'Signal, envie, reponse, recompense', 'Objectif, strategie, execution, bilan', 'Motivation, planification, action, repos'], correctIndex: 1, explanation: 'La boucle d\'habitude se compose de : signal (declencheur), envie (motivation), reponse (action) et recompense (satisfaction).' },
            { question: 'Combien de jours faut-il pour ancrer une habitude profonde ?', options: ['7 jours', '21 jours', '66 jours', '100 jours'], correctIndex: 2, explanation: 'Selon les recherches de Phillippa Lally, il faut en moyenne 66 jours pour qu\'un comportement devienne une habitude profondement ancree.' },
            { question: 'Pourquoi la gamification renforce-t-elle l\'habitude Pomodoro ?', options: ['Elle rend le travail plus facile', 'Elle cree de la dopamine d\'anticipation via les badges et streaks', 'Elle supprime le besoin de pauses', 'Elle rend les taches plus courtes'], correctIndex: 1, explanation: 'La gamification (badges, streaks, XP) genere de la dopamine d\'anticipation qui alimente l\'envie dans la boucle d\'habitude.' },
            { question: 'Quel est le meilleur type de signal pour demarrer un pomodoro ?', options: ['Une alarme aleatoire', 'Un declencheur contextuel constant (ex: ouvrir le laptop)', 'La pression d\'un manager', 'Un rappel hebdomadaire'], correctIndex: 1, explanation: 'Le signal doit etre clair, constant et contextuel. Associer le pomodoro a un geste quotidien (ouvrir le laptop) le rend automatique.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Parcours 3 — Notion Mastery
// 6 modules x 3 lessons = 18 lessons, 600 XP, ~1h
// ---------------------------------------------------------------------------

export const parcoursNotionMastery: FormationParcours = {
  id: 'notion-mastery',
  title: 'Notion Mastery',
  emoji: '\u{1F4D3}',
  description: 'Maitrisez Notion de A a Z : pages et blocs, bases de donnees avancees, templates, automatisations, wikis d\'equipe et integrations avec vos outils favoris, le tout augmente par l\'IA.',
  category: 'productivite',
  subcategory: 'outils',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#1A1A1A',
  diplomaTitle: 'Notion Mastery',
  diplomaSubtitle: 'Certification Freenzy.io — Notion Avance et Productivite IA',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Bases
    {
      id: 'notion-m1',
      title: 'Les bases de Notion',
      emoji: '\u{1F4D3}',
      description: 'Comprenez la philosophie et les fondamentaux de Notion : pages, blocs, navigation et organisation.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4D3}',
      badgeName: 'Notion Debutant',
      lessons: [
        {
          id: 'notion-m1-l1',
          title: 'Pages, blocs et navigation dans Notion',
          duration: '5 min',
          type: 'text',
          content: `Notion est un outil de productivite tout-en-un qui remplace a lui seul une dizaine d'applications. Notes, taches, bases de donnees, wikis, documents collaboratifs — tout vit dans un seul espace de travail. Sa flexibilite est sa force, mais elle peut aussi intimider les debutants. Comprendre les fondamentaux est la cle pour en faire un outil puissant plutot qu'un terrain vague numerique.

Tout dans Notion est une page. Une page peut contenir du texte, des images, des videos, des bases de donnees, et meme d'autres pages imbriquees. Cette structure arborescente vous permet de creer une hierarchie logique : un espace "Travail" contient des pages "Projets", "Notes de reunion" et "Documentation", chacune contenant ses propres sous-pages.

Les blocs sont les briques elementaires de Notion. Un paragraphe est un bloc, un titre est un bloc, une image est un bloc, une to-do list est un bloc. Vous pouvez deplacer, dupliquer, transformer et rearrange les blocs par simple glisser-deposer. Tapez "/" pour ouvrir le menu de blocs : texte, titre H1/H2/H3, liste a puces, checkbox, citation, separateur, et bien plus.

La barre laterale gauche est votre centre de navigation. Organisez-la en sections avec des pages parentes. L'astuce des pros : utilisez des emojis comme icones de page pour un reperage visuel instantane. Par exemple, un dossier pour chaque domaine de vie avec son emoji : travail avec un ordinateur, personnel avec une maison, projets avec une fusee.

L'IA de Freenzy peut analyser votre structure Notion et suggerer des ameliorations : pages orphelines a reclasser, hierarchies trop profondes a aplatir, nommage incoherent a standardiser. Elle peut aussi generer le contenu initial de vos pages a partir d'une simple description de votre besoin.`,
          xpReward: 15,
        },
        {
          id: 'notion-m1-l2',
          title: 'Exercice : Creez votre espace Notion personnel',
          duration: '5 min',
          type: 'exercise',
          content: 'Construisez la structure de base de votre espace Notion.',
          exercisePrompt: `Creez la structure de base de votre espace Notion personnel :

1. ARCHITECTURE : Definissez 4-5 pages parentes avec emojis :
   - Exemple : Travail, Personnel, Projets, Apprentissage, References
   - Chaque page parente a 2-3 sous-pages

2. PREMIERE PAGE : Creez une page "Dashboard" qui servira de page d'accueil :
   - Un titre avec emoji
   - 3 sections : "Aujourd'hui" (taches du jour), "En cours" (projets actifs), "Liens rapides" (pages favorites)
   - Utilisez des blocs callout pour les informations importantes

3. ORGANISATION : Appliquez les bonnes pratiques :
   - Nommage coherent (verbe + objet ou categorie + detail)
   - Maximum 3 niveaux de profondeur
   - Un emoji par page pour le reperage visuel

4. Demandez a Freenzy de critiquer votre architecture et de suggerer des ajustements.

Criteres de reussite :
- 4-5 pages parentes avec emojis coherents
- La page Dashboard contient au moins 3 types de blocs differents
- La hierarchie ne depasse pas 3 niveaux
- Le nommage est clair et coherent`,
          xpReward: 20,
        },
        {
          id: 'notion-m1-l3',
          title: 'Quiz : Les bases de Notion',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les fondamentaux de Notion.',
          quizQuestions: [
            { question: 'Quelle est l\'unite de base dans Notion ?', options: ['Le dossier', 'Le bloc', 'Le fichier', 'La cellule'], correctIndex: 1, explanation: 'Tout dans Notion est compose de blocs : paragraphes, titres, images, listes, bases de donnees. Les blocs sont les briques elementaires.' },
            { question: 'Comment ouvrir le menu de creation de blocs dans Notion ?', options: ['Clic droit', 'Touche Echap', 'Taper "/"', 'Appuyer sur +'], correctIndex: 2, explanation: 'Taper "/" dans Notion ouvre le menu complet de blocs disponibles : texte, titres, listes, bases de donnees, integrations, etc.' },
            { question: 'Quelle profondeur maximum de hierarchie est recommandee ?', options: ['1 niveau', '3 niveaux', '5 niveaux', '10 niveaux'], correctIndex: 1, explanation: 'Une hierarchie de maximum 3 niveaux de profondeur garde la navigation claire et evite de perdre des pages dans des sous-pages trop profondes.' },
            { question: 'Pourquoi utiliser des emojis comme icones de pages ?', options: ['Pour faire joli', 'Pour un reperage visuel instantane', 'C\'est obligatoire dans Notion', 'Pour economiser de l\'espace'], correctIndex: 1, explanation: 'Les emojis permettent un reperage visuel instantane dans la barre laterale, rendant la navigation beaucoup plus rapide.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 2 — Databases
    {
      id: 'notion-m2',
      title: 'Bases de donnees avancees',
      emoji: '\u{1F5C3}\u{FE0F}',
      description: 'Maitrisez les bases de donnees Notion : proprietes, vues, filtres, relations et rollups.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F5C3}\u{FE0F}',
      badgeName: 'Architecte de Donnees',
      lessons: [
        {
          id: 'notion-m2-l1',
          title: 'Maitriser les databases Notion',
          duration: '5 min',
          type: 'text',
          content: `Les bases de donnees sont la fonctionnalite la plus puissante de Notion. Elles transforment un simple outil de notes en un veritable systeme de gestion capable de remplacer des outils dedies comme Trello, Airtable ou meme un CRM leger. Comprendre les databases, c'est debloquer 80% du potentiel de Notion.

Une database Notion est un ensemble de pages structurees par des proprietes. Chaque ligne est une page a part entiere (avec son propre contenu), et chaque colonne est une propriete qui categorise cette page. Les types de proprietes incluent : texte, nombre, select (choix unique), multi-select, date, personne, checkbox, URL, email, telephone, fichier, relation et formule.

Les vues sont la vraie puissance des databases. Une meme base de donnees peut etre affichee en vue tableau (comme Excel), en vue kanban (comme Trello), en vue calendrier, en vue galerie, en vue liste ou en vue timeline. Vous creez autant de vues que necessaire, chacune avec ses propres filtres et tris. Exemple : une base "Taches" avec vue kanban par statut, vue calendrier par date d'echeance et vue tableau filtre sur les taches urgentes.

Les relations connectent deux bases de donnees entre elles. Une base "Projets" liee a une base "Taches" permet de voir toutes les taches d'un projet en un clic. Les rollups agregent les donnees des relations : nombre de taches par projet, pourcentage de taches terminees, date d'echeance la plus proche. C'est la que Notion devient un outil de pilotage en temps reel.

L'IA peut generer la structure de vos databases a partir d'une description en langage naturel. Dites a Freenzy : "Je veux un CRM pour suivre mes 50 prospects avec statut, derniere interaction et prochaine action" et elle cree la database complete avec les bonnes proprietes, vues et filtres en quelques secondes.`,
          xpReward: 15,
        },
        {
          id: 'notion-m2-l2',
          title: 'Jeu : Associez les proprietes aux usages',
          duration: '5 min',
          type: 'game',
          content: 'Trouvez le bon type de propriete Notion pour chaque besoin.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Priorite d\'une tache (haute/moyenne/basse)', right: 'Select (choix unique)' },
              { left: 'Tags multiples d\'un article', right: 'Multi-select' },
              { left: 'Date limite d\'un projet', right: 'Date' },
              { left: 'Responsable d\'une tache', right: 'Personne' },
              { left: 'Lier une tache a son projet', right: 'Relation' },
              { left: 'Nombre de taches terminees par projet', right: 'Rollup' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'notion-m2-l3',
          title: 'Quiz : Databases Notion',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise des bases de donnees Notion.',
          quizQuestions: [
            { question: 'Qu\'est-ce qu\'une "vue" dans une database Notion ?', options: ['Un duplicata de la database', 'Un affichage different de la meme database avec ses propres filtres', 'Un export PDF', 'Un lien partage'], correctIndex: 1, explanation: 'Une vue est un affichage different (tableau, kanban, calendrier, etc.) de la meme database, avec ses propres filtres et tris.' },
            { question: 'A quoi sert une propriete "Relation" ?', options: ['A creer un lien URL', 'A connecter deux databases entre elles', 'A calculer une formule', 'A ajouter une image'], correctIndex: 1, explanation: 'La propriete Relation connecte deux databases, par exemple lier des Taches a des Projets pour voir toutes les taches d\'un projet.' },
            { question: 'Qu\'est-ce qu\'un Rollup dans Notion ?', options: ['Un resume de page', 'Une agregation de donnees issues d\'une relation', 'Un type de vue', 'Un export automatique'], correctIndex: 1, explanation: 'Un Rollup agregue des donnees des pages liees via une Relation : compter, sommer, trouver le max/min, calculer un pourcentage.' },
            { question: 'Combien de vues peut-on creer sur une meme database ?', options: ['Maximum 3', 'Maximum 10', 'Autant que necessaire', 'Une seule par type'], correctIndex: 2, explanation: 'Vous pouvez creer autant de vues que vous le souhaitez sur une meme database, chacune avec ses propres parametres.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 3 — Templates
    {
      id: 'notion-m3',
      title: 'Templates et systemes',
      emoji: '\u{1F4CB}',
      description: 'Creez des templates puissants et des systemes reproductibles pour automatiser votre organisation.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Createur de Templates',
      lessons: [
        {
          id: 'notion-m3-l1',
          title: 'Creer des templates puissants',
          duration: '5 min',
          type: 'text',
          content: `Les templates Notion sont des modeles de pages pre-remplies que vous pouvez dupliquer en un clic. Ils eliminent le travail repetitif de creation et garantissent une coherence dans votre organisation. Un bon systeme de templates peut vous faire gagner des heures chaque semaine en supprimant le temps de mise en forme et de structuration.

Il existe deux types de templates : les templates de page et les templates de database. Un template de page est un modele complet (par exemple, un compte-rendu de reunion avec sections pre-definies). Un template de database est un modele qui s'applique automatiquement a chaque nouvelle entree dans une database (par exemple, chaque nouvelle tache cree avec un format standard incluant contexte, actions et criteres de reussite).

Pour creer un template de database, ouvrez votre database, cliquez sur la fleche a cote du bouton "Nouveau" et selectionnez "Nouveau template". Construisez la structure ideale avec tous les blocs necessaires : titres, checkboxes, callouts, sous-pages. Desormais, chaque nouvelle page creee dans cette database heritera de cette structure. Vous pouvez avoir plusieurs templates par database pour differents types d'entrees.

L'IA de Freenzy genere des templates sur mesure a partir de vos besoins. Decrivez simplement : "Je veux un template de brief client avec sections objectifs, budget, timeline, livrables et validation" et l'assistant cree un template complet avec les bons types de blocs, les bonnes proprietes et meme des exemples de contenu a remplacer.

Les systemes reproductibles combinent plusieurs templates lies entre eux. Un systeme de gestion de projet comprend : un template de projet (objectif, equipe, jalons), un template de tache (description, priorite, assignation), un template de compte-rendu hebdomadaire et un dashboard qui agreage tout. L'IA peut concevoir ces systemes complets en analysant vos processus existants et en proposant des ameliorations basees sur les meilleures pratiques.`,
          xpReward: 15,
        },
        {
          id: 'notion-m3-l2',
          title: 'Exercice : Creez un systeme de gestion de projets',
          duration: '5 min',
          type: 'exercise',
          content: 'Concevez un systeme complet de gestion de projets avec templates.',
          exercisePrompt: `Concevez un systeme de gestion de projets dans Notion avec 3 templates lies :

1. TEMPLATE PROJET :
   - Titre du projet + emoji
   - Sections : Objectif, Contexte, Equipe, Timeline, Budget, Risques, KPIs
   - Proprietes : Statut (select), Date debut/fin, Responsable, Priorite
   - Un espace pour les sous-taches (relation vers database Taches)

2. TEMPLATE TACHE :
   - Titre + description en 2 phrases max
   - Sections : Contexte, Actions a realiser, Criteres de reussite, Notes
   - Proprietes : Statut (A faire/En cours/Termine), Priorite, Assignee, Deadline, Projet (relation)
   - Checkbox pour validation

3. TEMPLATE COMPTE-RENDU HEBDOMADAIRE :
   - Semaine du [date] au [date]
   - Sections : Accomplissements, Blocages, Prochaines etapes, Decisions a prendre
   - Proprietes : Projet (relation), Date, Auteur

4. Decrivez comment ces 3 templates interagissent via les relations.

Demandez a Freenzy de generer le contenu de chaque template avec des exemples concrets.

Criteres de reussite :
- Les 3 templates sont coherents et lies par des relations
- Chaque template a au moins 4 sections et 3 proprietes
- Le systeme couvre le cycle complet : planification, execution, suivi
- Les exemples de contenu sont realistes`,
          xpReward: 20,
        },
        {
          id: 'notion-m3-l3',
          title: 'Quiz : Templates Notion',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez votre maitrise des templates Notion.',
          quizQuestions: [
            { question: 'Quelle est la difference entre un template de page et un template de database ?', options: ['Aucune difference', 'Le template de database s\'applique automatiquement a chaque nouvelle entree', 'Le template de page est plus puissant', 'Le template de database ne supporte pas les blocs'], correctIndex: 1, explanation: 'Un template de database s\'applique automatiquement a chaque nouvelle page creee dans cette database, assurant une structure coherente.' },
            { question: 'Combien de templates peut-on avoir par database ?', options: ['Un seul', 'Maximum 3', 'Plusieurs, pour differents types d\'entrees', 'Illimite mais deconseille'], correctIndex: 2, explanation: 'Vous pouvez creer plusieurs templates par database pour differents types d\'entrees (ex: tache simple, tache complexe, bug report).' },
            { question: 'Qu\'est-ce qu\'un systeme reproductible dans Notion ?', options: ['Un backup automatique', 'Plusieurs templates lies entre eux par des relations', 'Un export vers Excel', 'Une synchronisation avec Google'], correctIndex: 1, explanation: 'Un systeme reproductible combine plusieurs templates lies (projet, tache, CR) qui interagissent via des relations pour couvrir un processus complet.' },
            { question: 'Comment l\'IA aide-t-elle a creer des templates ?', options: ['Elle les telecharge depuis internet', 'Elle genere des templates sur mesure a partir de vos besoins decrits', 'Elle copie les templates d\'autres utilisateurs', 'Elle supprime les templates inutiles'], correctIndex: 1, explanation: 'L\'IA genere des templates personnalises a partir d\'une description en langage naturel de vos besoins et processus.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 4 — Automatisation
    {
      id: 'notion-m4',
      title: 'Automatisation dans Notion',
      emoji: '\u{26A1}',
      description: 'Automatisez vos workflows Notion avec les formules, boutons et integrations IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{26A1}',
      badgeName: 'Automatiseur Notion',
      lessons: [
        {
          id: 'notion-m4-l1',
          title: 'Automatiser ses workflows Notion',
          duration: '5 min',
          type: 'text',
          content: `L'automatisation dans Notion permet de reduire le travail manuel repetitif et de garder vos donnees a jour sans effort. Des formules aux boutons en passant par les integrations externes, Notion offre plusieurs niveaux d'automatisation accessibles meme aux non-developpeurs.

Les formules Notion sont le premier niveau d'automatisation. Elles calculent des valeurs automatiquement a partir d'autres proprietes. Exemples concrets : une formule qui affiche "En retard" si la date d'echeance est passee et le statut n'est pas "Termine". Une formule qui calcule le nombre de jours restants avant une deadline. Une formule qui concatene le nom du projet et le numero de la tache pour creer un identifiant unique. La syntaxe est accessible : if, concat, dateBetween, now sont les fonctions les plus utilisees.

Les boutons Notion (Database Automations) sont le deuxieme niveau. Vous pouvez creer des boutons qui executent des actions en un clic : creer une page dans une autre database, modifier des proprietes, ajouter des blocs de contenu. Par exemple, un bouton "Demarrer le sprint" qui cree automatiquement les taches du sprint dans votre database a partir d'un template pre-defini.

Les automations de database declenchent des actions quand une condition est remplie. Quand le statut d'une tache passe a "Termine", la date de completion est remplie automatiquement et une notification est envoyee au chef de projet. Quand une nouvelle entree est creee, elle est automatiquement assignee au membre de l'equipe avec le moins de taches en cours.

L'IA augmente ces automatisations. Freenzy peut analyser vos workflows actuels et identifier les etapes repetitives a automatiser. Elle peut aussi ecrire vos formules Notion a partir d'une description en francais : "Je veux une formule qui calcule le pourcentage d'avancement" — et l'IA produit la formule exacte prete a copier-coller dans votre propriete.`,
          xpReward: 15,
        },
        {
          id: 'notion-m4-l2',
          title: 'Exercice : Creez 3 automatisations utiles',
          duration: '5 min',
          type: 'exercise',
          content: 'Concevez trois automatisations pour votre espace Notion.',
          exercisePrompt: `Concevez 3 automatisations Notion qui vous feront gagner du temps :

1. FORMULE INTELLIGENTE :
   - Choisissez une database existante (taches, projets, contacts, etc.)
   - Decrivez en francais ce que la formule doit calculer (ex: "afficher Urgent si deadline < 3 jours et statut != Termine")
   - Demandez a Freenzy de generer la formule Notion correspondante
   - Verifiez que la formule fonctionne sur 3 cas de test

2. BOUTON D'ACTION :
   - Creez un bouton qui automatise une action repetitive
   - Exemples : "Nouvelle reunion" (cree une page CR avec date du jour), "Clore le projet" (change statut + ajoute date fin), "Dupliquer en tache" (cree une tache liee)
   - Decrivez les etapes que le bouton execute

3. AUTOMATION DE DATABASE :
   - Definissez un declencheur (creation, modification de propriete)
   - Definissez l'action automatique (modifier une propriete, envoyer une notif)
   - Exemple : "Quand statut = Termine, remplir Date_completion = Aujourd'hui"

Criteres de reussite :
- La formule est syntaxiquement correcte et testee
- Le bouton automatise une action qui prenait plus de 2 minutes manuellement
- L'automation de database elimine une etape manuelle recurrente
- Les 3 automatisations sont utiles dans votre contexte reel`,
          xpReward: 20,
        },
        {
          id: 'notion-m4-l3',
          title: 'Quiz : Automatisation Notion',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les automatisations Notion.',
          quizQuestions: [
            { question: 'Quelles sont les fonctions de formule les plus utilisees dans Notion ?', options: ['SUM, AVG, COUNT', 'if, concat, dateBetween, now', 'VLOOKUP, INDEX, MATCH', 'map, filter, reduce'], correctIndex: 1, explanation: 'Les fonctions les plus utilisees dans les formules Notion sont if (condition), concat (concatenation), dateBetween (calcul de dates) et now (date actuelle).' },
            { question: 'Que peut faire un bouton Notion ?', options: ['Uniquement ouvrir un lien', 'Creer des pages, modifier des proprietes, ajouter des blocs', 'Envoyer des emails automatiquement', 'Supprimer des databases entieres'], correctIndex: 1, explanation: 'Les boutons Notion executent des actions en un clic : creer des pages dans d\'autres databases, modifier des proprietes, ajouter des blocs de contenu.' },
            { question: 'Quand se declenche une automation de database ?', options: ['A heure fixe comme un cron', 'Quand une condition est remplie (creation, modification)', 'Uniquement manuellement', 'Au demarrage de Notion'], correctIndex: 1, explanation: 'Les automations de database se declenchent automatiquement quand une condition est remplie : creation d\'une entree, modification d\'une propriete.' },
            { question: 'Comment l\'IA aide-t-elle avec les formules Notion ?', options: ['Elle les execute plus vite', 'Elle les ecrit a partir d\'une description en francais', 'Elle les supprime si elles sont fausses', 'Elle les traduit en anglais'], correctIndex: 1, explanation: 'L\'IA peut ecrire des formules Notion complexes a partir d\'une simple description en langage naturel, prete a copier-coller.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 5 — Team Wikis
    {
      id: 'notion-m5',
      title: 'Team Wikis',
      emoji: '\u{1F4DA}',
      description: 'Construisez un wiki d\'equipe structure et maintenable pour centraliser la connaissance collective.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4DA}',
      badgeName: 'Wiki Master',
      lessons: [
        {
          id: 'notion-m5-l1',
          title: 'Construire un wiki d\'equipe efficace',
          duration: '5 min',
          type: 'text',
          content: `Un wiki d'equipe dans Notion centralise toute la connaissance collective : processus, procedures, FAQ, documentation technique, onboarding, et culture d'entreprise. Bien construit, il reduit de 60% le temps passe a chercher de l'information et accelere considerablement l'integration des nouveaux membres.

La structure ideale d'un wiki suit la regle des 3 clics : n'importe quelle information doit etre accessible en maximum 3 clics depuis la page d'accueil du wiki. Organisez votre wiki en sections thematiques : "Comment on fonctionne" (processus internes), "Nos outils" (guides d'utilisation), "Pour les nouveaux" (onboarding), "Nos produits" (documentation), "FAQ" (questions frequentes).

Chaque page du wiki suit un template standard : titre clair, date de derniere mise a jour, auteur/responsable, contenu structure avec sous-titres, et une section "Pages liees" en bas. Cette coherence de format permet a n'importe qui de naviguer et contribuer sans formation prealable. L'IA peut generer ce template et l'appliquer a toutes les pages existantes en une seule commande.

La maintenance est le defi numero un des wikis. Un wiki non maintenu est pire qu'aucun wiki car il contient des informations obsoletes. Mettez en place un systeme de revue : chaque page a un "responsable" qui la revise tous les trimestres. L'IA envoie des rappels automatiques et detecte les pages qui n'ont pas ete modifiees depuis plus de 90 jours.

La recherche est essentielle. Notion offre une recherche globale puissante, mais vous pouvez l'ameliorer avec des tags (propriete multi-select) et un index central. L'IA peut aussi repondre aux questions des collaborateurs en cherchant dans le wiki : "Comment fait-on pour demander des conges ?" — l'IA trouve la page pertinente et extrait la reponse directe. Cela transforme le wiki passif en assistant de connaissance actif disponible a toute heure.`,
          xpReward: 15,
        },
        {
          id: 'notion-m5-l2',
          title: 'Jeu : Classez les contenus dans le bon wiki',
          duration: '5 min',
          type: 'game',
          content: 'Associez chaque type de contenu a la bonne section du wiki.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Procedure de demande de conges', right: 'Comment on fonctionne' },
              { left: 'Guide d\'utilisation de Slack', right: 'Nos outils' },
              { left: 'Checklist du premier jour', right: 'Pour les nouveaux' },
              { left: 'Specifications de l\'API v2', right: 'Nos produits' },
              { left: 'Ou trouver les identifiants VPN ?', right: 'FAQ' },
              { left: 'Valeurs et culture d\'equipe', right: 'Pour les nouveaux' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'notion-m5-l3',
          title: 'Quiz : Team Wikis',
          duration: '3 min',
          type: 'quiz',
          content: 'Evaluez vos connaissances sur les wikis d\'equipe Notion.',
          quizQuestions: [
            { question: 'Quelle est la regle d\'accessibilite d\'un wiki bien structure ?', options: ['Tout en une seule page', 'Maximum 3 clics depuis l\'accueil', 'Pas plus de 10 pages', 'Un seul niveau de hierarchie'], correctIndex: 1, explanation: 'La regle des 3 clics garantit que n\'importe quelle information est accessible en maximum 3 clics depuis la page d\'accueil du wiki.' },
            { question: 'De combien la recherche d\'information est-elle reduite avec un bon wiki ?', options: ['10%', '30%', '60%', '90%'], correctIndex: 2, explanation: 'Un wiki bien construit reduit de 60% le temps passe a chercher de l\'information en centralisant toute la connaissance collective.' },
            { question: 'Quel est le defi principal d\'un wiki ?', options: ['La creation initiale', 'La maintenance et la mise a jour', 'Le design graphique', 'Le cout de Notion'], correctIndex: 1, explanation: 'La maintenance est le defi numero un : un wiki avec des informations obsoletes est pire qu\'aucun wiki car il induit en erreur.' },
            { question: 'A quelle frequence les pages du wiki doivent-elles etre revisees ?', options: ['Chaque semaine', 'Chaque mois', 'Chaque trimestre', 'Chaque annee'], correctIndex: 2, explanation: 'Une revue trimestrielle par le responsable de chaque page est le bon equilibre entre fraicheur du contenu et charge de travail.' },
          ],
          xpReward: 15,
        },
      ],
    },
    // Module 6 — Integrations
    {
      id: 'notion-m6',
      title: 'Integrations et API',
      emoji: '\u{1F517}',
      description: 'Connectez Notion a vos outils favoris et exploitez l\'API pour des workflows sur mesure.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F517}',
      badgeName: 'Integrateur Notion',
      lessons: [
        {
          id: 'notion-m6-l1',
          title: 'Connecter Notion a votre ecosysteme',
          duration: '5 min',
          type: 'text',
          content: `Notion devient exponentiellement plus puissant quand il est connecte a vos autres outils. Les integrations eliminent la double saisie, centralisent l'information et creent des workflows automatises entre applications. L'ecosysteme Notion compte plus de 100 integrations natives et des milliers de possibilites via des outils comme Zapier ou Make.

Les integrations natives les plus utiles incluent : Google Calendar (synchronisation bidirectionnelle des evenements), Slack (notifications et creation de pages depuis un message), GitHub (suivi des pull requests et issues), Google Drive (integration de fichiers), et Figma (preview des designs directement dans Notion). Chaque integration s'active en quelques clics depuis les parametres de votre espace de travail.

Zapier et Make sont des plateformes d'automatisation no-code qui connectent Notion a plus de 5000 applications. Un exemple puissant : quand un email arrive dans Gmail avec le sujet "Facture", Zapier cree automatiquement une entree dans votre database "Factures" Notion avec le montant, l'expediteur et la piece jointe. Quand un formulaire Typeform est soumis, les reponses sont ajoutees dans votre CRM Notion.

L'API Notion permet des integrations sur mesure pour les besoins specifiques. Les developpeurs peuvent creer des scripts qui lisent et ecrivent dans vos databases Notion par programmation. L'IA de Freenzy peut meme generer ces scripts pour vous : "Je veux un script qui recupere les taches en retard de ma database Notion et m'envoie un resume par email chaque lundi matin."

L'integration avec l'IA transforme Notion en assistant proactif. Freenzy peut lire vos databases Notion, analyser les tendances et generer des rapports automatiques. Elle peut remplir des pages a partir de sources externes, resumer de longs documents, et meme proposer des reorganisations de votre espace de travail en se basant sur vos habitudes d'utilisation et les meilleures pratiques du marche.`,
          xpReward: 15,
        },
        {
          id: 'notion-m6-l2',
          title: 'Exercice : Concevez 3 integrations pour votre workflow',
          duration: '5 min',
          type: 'exercise',
          content: 'Planifiez trois integrations concretes entre Notion et vos outils.',
          exercisePrompt: `Concevez 3 integrations entre Notion et vos outils existants :

1. INTEGRATION NATIVE :
   - Choisissez un outil que vous utilisez quotidiennement (Google Calendar, Slack, GitHub, etc.)
   - Decrivez l'integration : quelle donnee est synchronisee, dans quel sens, a quelle frequence
   - Identifiez le benefice concret (temps gagne, erreurs evitees, information centralisee)
   - Exemple : "Google Calendar <-> Notion : mes reunions apparaissent dans ma vue calendrier Notion, et mes deadlines Notion dans mon agenda Google"

2. AUTOMATION ZAPIER/MAKE :
   - Decrivez un workflow qui connecte 2-3 applications via Notion
   - Declencheur → Action(s)
   - Exemple : "Quand un client signe un devis (DocuSign), creer un projet dans Notion + envoyer un message Slack a l'equipe"

3. INTEGRATION IA :
   - Decrivez comment l'IA pourrait enrichir automatiquement vos databases Notion
   - Exemple : "Chaque lundi, l'IA analyse ma database Projets et genere un rapport de synthese dans une page Notion dediee"

Demandez a Freenzy d'evaluer la faisabilite et de suggerer des ameliorations.

Criteres de reussite :
- Les 3 integrations resolvent un probleme reel de votre quotidien
- Le flux de donnees est clairement decrit (source, destination, frequence)
- Le benefice est mesurable (temps, qualite, fiabilite)
- Au moins une integration utilise l'IA de Freenzy`,
          xpReward: 20,
        },
        {
          id: 'notion-m6-l3',
          title: 'Quiz : Integrations Notion',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les integrations Notion.',
          quizQuestions: [
            { question: 'Combien d\'integrations natives Notion propose-t-il environ ?', options: ['10', '50', 'Plus de 100', 'Plus de 1000'], correctIndex: 2, explanation: 'L\'ecosysteme Notion compte plus de 100 integrations natives avec des outils populaires comme Google, Slack, GitHub, Figma, etc.' },
            { question: 'A quoi servent Zapier et Make dans l\'ecosysteme Notion ?', options: ['A designer des pages Notion', 'A connecter Notion a 5000+ applications sans code', 'A sauvegarder Notion', 'A traduire les pages Notion'], correctIndex: 1, explanation: 'Zapier et Make sont des plateformes no-code qui permettent de connecter Notion a plus de 5000 applications avec des automatisations.' },
            { question: 'Qu\'est-ce que l\'API Notion permet de faire ?', options: ['Uniquement lire des donnees', 'Lire et ecrire dans les databases par programmation', 'Modifier l\'interface de Notion', 'Creer de nouveaux types de blocs'], correctIndex: 1, explanation: 'L\'API Notion permet de lire et ecrire dans les databases par programmation, offrant des integrations sur mesure illimitees.' },
            { question: 'Comment l\'IA peut-elle enrichir un espace Notion ?', options: ['En remplacant Notion par un autre outil', 'En analysant les databases et generant des rapports automatiques', 'En supprimant les pages inutilisees', 'En changeant les couleurs automatiquement'], correctIndex: 1, explanation: 'L\'IA peut analyser vos databases, generer des rapports, remplir des pages depuis des sources externes et proposer des reorganisations.' },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};
