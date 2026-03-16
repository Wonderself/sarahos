// =============================================================================
// Freenzy.io — Formations Creativite Pack 1
// 3 parcours : Ecriture Creative, Storytelling, Podcast
// Chaque parcours : 6 modules x 3 lessons = 18 lessons, 600 XP
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// 1. ECRITURE CREATIVE IA
// =============================================================================

export const parcoursEcritureCreative: FormationParcours = {
  id: 'ecriture-creative',
  title: 'Ecriture Creative IA',
  emoji: '\u270D\uFE0F',
  description: 'Developpez votre plume avec l\'IA : trouvez votre style, creez des personnages memorables, maitrisez le dialogue, construisez des univers immersifs, co-ecrivez avec l\'IA et publiez vos oeuvres.',
  category: 'creativite',
  subcategory: 'ecriture',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#EC4899',
  diplomaTitle: 'Ecrivain Creatif IA',
  diplomaSubtitle: 'Certification Freenzy.io — Ecriture Creative IA',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Trouver son style
    {
      id: 'ec-m1',
      title: 'Trouver son style d\'ecriture',
      emoji: '\u{1F3A8}',
      description: 'Identifiez et developpez votre voix litteraire unique grace a l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F58B}\uFE0F',
      badgeName: 'Styliste Litteraire',
      lessons: [
        {
          id: 'ec-m1-l1',
          title: 'Decouvrir sa voix d\'ecrivain avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Chaque ecrivain possede une voix unique, une maniere personnelle d\'assembler les mots, de rythmer les phrases et de colorer un recit. Pourtant, identifier cette voix est souvent le defi le plus difficile pour un auteur debutant. L\'IA de Freenzy vous aide a explorer et affiner votre style en quelques etapes simples.

Commencez par soumettre un court texte que vous avez deja ecrit — un email, un journal intime, un debut de nouvelle. L\'IA analyse votre vocabulaire, la longueur moyenne de vos phrases, votre usage des figures de style et votre ton general. Elle produit un rapport de style qui met en evidence vos forces : peut-etre utilisez-vous naturellement des metaphores visuelles, ou bien votre ecriture est-elle rythmee par des phrases courtes et percutantes.

Ensuite, l\'IA vous propose des exercices cibles. Si votre style est trop uniforme, elle vous invite a ecrire un meme paragraphe dans trois registres differents : lyrique, minimaliste et humoristique. Vous decouvrez ainsi des facettes de votre ecriture que vous n\'aviez jamais explorees. L\'IA commente chaque version et identifie ce qui fonctionne le mieux.

L\'outil de references litteraires est particulierement precieux. Vous indiquez les auteurs que vous admirez — Camus, Duras, Pennac, Le Clezio — et l\'IA decortique leurs techniques stylistiques. Elle vous montre comment integrer certains procedes dans votre propre ecriture sans tomber dans l\'imitation. L\'objectif n\'est jamais de copier mais de nourrir votre creativite.

Au bout de quelques sessions, vous disposez d\'un profil stylistique personnel que l\'IA utilise pour vous guider dans tous vos projets d\'ecriture. C\'est votre empreinte litteraire numerique, un outil vivant qui evolue avec vous.`,
          xpReward: 15,
        },
        {
          id: 'ec-m1-l2',
          title: 'Exercice : Analyser votre style',
          duration: '3 min',
          type: 'exercise',
          content: 'Soumettez un texte personnel pour obtenir une analyse stylistique.',
          exercisePrompt: `Ecrivez un court texte (150-200 mots) sur le theme de votre choix parmi ces trois propositions :
- Un souvenir d'enfance marque par une odeur
- La description d'un lieu que vous connaissez par coeur
- Un moment ou vous avez change d'avis sur quelque chose

Puis repondez a ces questions :
1. Quelle emotion principale votre texte transmet-il ?
2. Vos phrases sont-elles plutot courtes ou longues ?
3. Utilisez-vous des metaphores ou des comparaisons ?
4. Quel auteur vous inspire inconsciemment dans ce texte ?

Enfin, reecrivez votre premier paragraphe dans un style completement oppose (si vous etiez lyrique, soyez minimaliste, et inversement).`,
          xpReward: 20,
        },
        {
          id: 'ec-m1-l3',
          title: 'Quiz — Trouver son style',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'identification du style litteraire.',
          quizQuestions: [
            {
              question: 'Que produit l\'IA apres avoir analyse un texte soumis par l\'utilisateur ?',
              options: ['Un nouveau texte reecrit', 'Un rapport de style detaille', 'Une note sur 20', 'Une liste de fautes'],
              correctIndex: 1,
              explanation: 'L\'IA genere un rapport de style mettant en evidence les forces, le vocabulaire, le rythme et le ton general du texte.',
            },
            {
              question: 'Pourquoi l\'IA propose-t-elle de reecrire un paragraphe dans trois registres differents ?',
              options: [
                'Pour corriger les erreurs grammaticales',
                'Pour trouver le registre le plus academique',
                'Pour explorer des facettes inexplorees de son ecriture',
                'Pour choisir le style le plus vendeur',
              ],
              correctIndex: 2,
              explanation: 'L\'exercice multi-registres permet de decouvrir des facettes de son ecriture que l\'on n\'avait jamais explorees.',
            },
            {
              question: 'Quel est l\'objectif de l\'analyse des auteurs de reference ?',
              options: [
                'Copier leur style exactement',
                'Integrer certains procedes sans imitation',
                'Ecrire une these sur leur oeuvre',
                'Comparer ses ventes aux leurs',
              ],
              correctIndex: 1,
              explanation: 'L\'objectif est de nourrir sa creativite en integrant des procedes stylistiques, jamais de copier un auteur.',
            },
            {
              question: 'Qu\'est-ce que le profil stylistique personnel genere par l\'IA ?',
              options: [
                'Un CV litteraire a envoyer aux editeurs',
                'Une empreinte litteraire numerique qui evolue avec l\'ecrivain',
                'Un test de personnalite standard',
                'Un classement par rapport aux autres utilisateurs',
              ],
              correctIndex: 1,
              explanation: 'Le profil stylistique est un outil vivant qui capture votre empreinte litteraire et evolue avec vos projets.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 2 — Creer des personnages
    {
      id: 'ec-m2',
      title: 'Creer des personnages memorables',
      emoji: '\u{1F9D1}\u200D\u{1F3A4}',
      description: 'Construisez des personnages complexes et attachants avec l\'aide de l\'IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AD}',
      badgeName: 'Createur de Personnages',
      lessons: [
        {
          id: 'ec-m2-l1',
          title: 'L\'art du personnage avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Un personnage reussi est bien plus qu\'une description physique et un nom. C\'est un etre avec des contradictions, des desirs enfouis, des blessures qui influencent chacune de ses decisions. L\'IA de Freenzy vous aide a construire des personnages d\'une profondeur remarquable grace a une methode structuree.

Le generateur de fiches personnages vous guide a travers sept dimensions essentielles. La dimension psychologique explore les motivations profondes, les peurs et les mecanismes de defense. La dimension sociale definit les relations, le statut et le reseau d\'influence du personnage. La dimension physique va au-dela de l\'apparence : comment le personnage occupe l\'espace, quels tics le trahissent, quelle est sa posture naturelle.

L\'IA vous aide aussi a creer l\'arc de transformation du personnage. Elle vous pose des questions strategiques : quelle croyance limitante votre personnage devra-t-il abandonner ? Quel evenement declencheur le forcera a changer ? Quel sacrifice sera necessaire ? Ces questions structurent le voyage emotionnel de votre personnage de la premiere a la derniere page.

Le testeur de coherence est un outil indispensable. Vous decrivez une scene et l\'IA verifie si les reactions de votre personnage sont coherentes avec sa fiche. Si votre personnage timide prend soudainement la parole devant 500 personnes sans raison, l\'IA le signale et propose des alternatives credibles.

Enfin, le dialogue-test vous permet de faire parler votre personnage. Vous lui posez des questions en interview fictive et l\'IA repond en restant fidele a la personnalite definie. C\'est un moyen puissant de verifier que votre personnage sonne juste avant de l\'integrer dans votre recit.`,
          xpReward: 15,
        },
        {
          id: 'ec-m2-l2',
          title: 'Jeu : Assembler un personnage',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque dimension a son element de personnage.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Dimension psychologique', right: 'Motivations et peurs profondes' },
              { left: 'Dimension sociale', right: 'Relations et reseau d\'influence' },
              { left: 'Dimension physique', right: 'Posture, tics et occupation de l\'espace' },
              { left: 'Arc de transformation', right: 'Croyance limitante a abandonner' },
              { left: 'Test de coherence', right: 'Verification des reactions du personnage' },
              { left: 'Dialogue-test', right: 'Interview fictive du personnage' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'ec-m2-l3',
          title: 'Quiz — Personnages',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la creation de personnages avec l\'IA.',
          quizQuestions: [
            {
              question: 'Combien de dimensions le generateur de fiches personnages explore-t-il ?',
              options: ['Trois', 'Cinq', 'Sept', 'Dix'],
              correctIndex: 2,
              explanation: 'Le generateur explore sept dimensions essentielles du personnage, incluant les aspects psychologique, social et physique.',
            },
            {
              question: 'Que verifie le testeur de coherence ?',
              options: [
                'L\'orthographe du nom du personnage',
                'La coherence des reactions avec la fiche personnage',
                'Le nombre de pages consacrees au personnage',
                'La popularite du personnage aupres des lecteurs',
              ],
              correctIndex: 1,
              explanation: 'Le testeur verifie que les reactions du personnage dans une scene sont coherentes avec sa personnalite definie.',
            },
            {
              question: 'Quelle question l\'IA pose-t-elle pour structurer l\'arc de transformation ?',
              options: [
                'Quel est le plat prefere du personnage ?',
                'Quelle croyance limitante devra-t-il abandonner ?',
                'Combien de freres et soeurs a-t-il ?',
                'Dans quelle ville habite-t-il ?',
              ],
              correctIndex: 1,
              explanation: 'L\'arc de transformation se construit autour de la croyance limitante que le personnage devra abandonner au fil du recit.',
            },
            {
              question: 'A quoi sert le dialogue-test ?',
              options: [
                'A corriger la grammaire des dialogues',
                'A verifier que le personnage sonne juste en interview fictive',
                'A traduire les dialogues en anglais',
                'A compter le nombre de repliques',
              ],
              correctIndex: 1,
              explanation: 'Le dialogue-test permet de poser des questions au personnage pour verifier que ses reponses sont fideles a sa personnalite.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 3 — Maitriser le dialogue
    {
      id: 'ec-m3',
      title: 'Maitriser le dialogue',
      emoji: '\u{1F4AC}',
      description: 'Ecrivez des dialogues vivants, naturels et porteurs de sens.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F5E3}\uFE0F',
      badgeName: 'Maitre du Dialogue',
      lessons: [
        {
          id: 'ec-m3-l1',
          title: 'Ecrire des dialogues vivants avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le dialogue est l\'un des outils les plus puissants de la narration. Un bon dialogue revele le caractere, fait avancer l\'intrigue et cree de la tension — le tout sans que le lecteur ait l\'impression qu\'on lui explique quoi que ce soit. L\'IA de Freenzy vous aide a ecrire des dialogues qui sonnent vrai.

La premiere regle d\'or est que chaque personnage doit avoir sa propre voix. Un adolescent de banlieue ne parle pas comme un professeur de philosophie. L\'IA analyse vos personnages et vous suggere un registre de langue, un vocabulaire specifique et des tics verbaux pour chacun. Elle peut meme simuler une conversation entre deux de vos personnages pour tester si leurs voix sont suffisamment differenciees.

Le sous-texte est la dimension cachee du dialogue. Ce que les personnages ne disent pas est souvent plus important que ce qu\'ils disent. L\'IA vous aide a identifier les moments ou un personnage devrait mentir, eluder ou changer de sujet. Elle vous propose des versions alternatives d\'une meme replique : la version directe, la version evasive et la version qui revele une emotion refoulee.

L\'equilibre entre dialogue et narration est crucial. Trop de dialogue transforme votre roman en script de theatre. Pas assez le rend statique. L\'IA analyse le ratio dialogue/narration de vos chapitres et vous recommande des ajustements. Elle vous montre ou inserer des pauses narratives — une description, une pensee interieure, un geste — pour rythmer l\'echange.

Les verbes de parole meritent une attention particuliere. "Dit-il" suffit dans 90% des cas. L\'IA vous alerte quand vous abusez des verbes expressifs comme "s\'exclama-t-il" ou "murmura-t-elle". Elle vous encourage a remplacer ces verbes par des actions qui accompagnent la parole : "Il posa sa tasse. 'Je sais tout.'" est plus cinematographique que "'Je sais tout !' s'exclama-t-il".`,
          xpReward: 15,
        },
        {
          id: 'ec-m3-l2',
          title: 'Exercice : Reecrire un dialogue plat',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez un dialogue fonctionnel en echange vivant et charge de sous-texte.',
          exercisePrompt: `Voici un dialogue plat entre deux collegues :

"Bonjour Marie, comment vas-tu ?"
"Bien, merci. Et toi ?"
"Ca va. Tu as fini le rapport ?"
"Oui, je l'ai envoye hier."
"Super, merci."

Reecrivez cette scene en respectant ces contraintes :
1. Marie cache un secret (elle veut demissionner)
2. Son collegue la soupçonne de quelque chose mais n'ose pas demander directement
3. Ajoutez des gestes, des pauses et des regards qui revelent le sous-texte
4. Differenciez nettement les voix des deux personnages
5. Le dialogue doit faire avancer une intrigue sans rien expliquer directement

Analysez ensuite : quels indices physiques avez-vous utilises pour suggerer la tension ?`,
          xpReward: 20,
        },
        {
          id: 'ec-m3-l3',
          title: 'Quiz — Le dialogue',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'ecriture de dialogues.',
          quizQuestions: [
            {
              question: 'Quelle est la premiere regle d\'or du dialogue selon la formation ?',
              options: [
                'Ecrire des phrases courtes',
                'Chaque personnage doit avoir sa propre voix',
                'Utiliser beaucoup de verbes expressifs',
                'Eviter les dialogues de plus de 10 repliques',
              ],
              correctIndex: 1,
              explanation: 'Chaque personnage doit avoir une voix distincte, avec un registre, un vocabulaire et des tics verbaux propres.',
            },
            {
              question: 'Qu\'est-ce que le sous-texte dans un dialogue ?',
              options: [
                'Les notes de bas de page',
                'Ce que les personnages ne disent pas mais qui est implicite',
                'Le resume du chapitre precedent',
                'Les didascalies comme au theatre',
              ],
              correctIndex: 1,
              explanation: 'Le sous-texte designe ce qui est communique implicitement, ce que les personnages taisent ou eludent.',
            },
            {
              question: 'Quel verbe de parole est recommande dans 90% des cas ?',
              options: ['"S\'exclama"', '"Murmura"', '"Dit"', '"Vocifera"'],
              correctIndex: 2,
              explanation: '"Dit" est neutre et suffisant dans la grande majorite des cas. Les verbes expressifs doivent rester rares.',
            },
            {
              question: 'Comment l\'IA aide-t-elle a equilibrer dialogue et narration ?',
              options: [
                'Elle supprime tous les passages narratifs',
                'Elle analyse le ratio et recommande des pauses narratives',
                'Elle transforme le texte en piece de theatre',
                'Elle ajoute des notes de musique entre les repliques',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse le ratio dialogue/narration et suggere d\'inserer des descriptions, pensees ou gestes pour rythmer l\'echange.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 4 — Worldbuilding
    {
      id: 'ec-m4',
      title: 'Worldbuilding : creer des univers',
      emoji: '\u{1F30D}',
      description: 'Construisez des mondes fictifs riches, coherents et immersifs.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3F0}',
      badgeName: 'Architecte de Mondes',
      lessons: [
        {
          id: 'ec-m4-l1',
          title: 'Construire un univers fictif avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le worldbuilding est l\'art de creer un univers fictif credible, qu\'il s\'agisse d\'un monde fantastique, d\'une societe futuriste ou d\'un village francais au XIXe siecle. L\'IA de Freenzy vous offre des outils pour batir des mondes d\'une richesse et d\'une coherence remarquables.

Le generateur de monde commence par les fondations. Vous choisissez un genre — fantasy, science-fiction, historique, contemporain — et l\'IA vous pose des questions sur les piliers de votre univers : la geographie, le systeme politique, l\'economie, les croyances, les technologies disponibles et les regles de la magie si elle existe. Chaque reponse enrichit une bible de monde que vous pouvez consulter et modifier a tout moment.

La coherence est le secret d\'un bon worldbuilding. Si votre monde n\'a pas de metal, il ne peut pas y avoir d\'epees. Si votre societe est matriarcale, cela influence la politique, l\'heritage et les noms de famille. L\'IA detecte les contradictions logiques dans votre univers et vous les signale avant qu\'elles ne deviennent des trous dans votre recit. Elle maintient un registre de toutes vos regles pour garantir que chaque detail reste coherent.

La cartographie narrative vous aide a visualiser votre monde. Vous decrivez les lieux importants et l\'IA genere des descriptions detaillees incluant la faune, la flore, le climat et la culture locale. Chaque lieu est lie aux autres par des routes commerciales, des rivalites politiques ou des mythes partages. Votre monde devient un reseau vivant plutot qu\'une collection de decors isoles.

L\'IA genere aussi des elements culturels qui donnent de la profondeur : proverbes locaux, plats typiques, fetes traditionnelles, chansons populaires. Ces details ne figureront peut-etre jamais dans votre roman, mais ils informent votre ecriture et donnent au lecteur le sentiment d\'un monde qui existe au-dela des pages.`,
          xpReward: 15,
        },
        {
          id: 'ec-m4-l2',
          title: 'Jeu : Ordonner la creation d\'un monde',
          duration: '3 min',
          type: 'game',
          content: 'Remettez les etapes du worldbuilding dans l\'ordre logique.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Choisir le genre et l\'epoque',
              'Definir la geographie et le climat',
              'Etablir le systeme politique et social',
              'Creer les regles de magie ou technologie',
              'Developper les cultures et traditions locales',
              'Verifier la coherence globale de l\'univers',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'ec-m4-l3',
          title: 'Quiz — Worldbuilding',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la construction d\'univers fictifs.',
          quizQuestions: [
            {
              question: 'Quel est le premier element a definir dans un worldbuilding ?',
              options: [
                'Les noms des personnages',
                'Le genre et les piliers fondamentaux de l\'univers',
                'La couverture du livre',
                'Le nombre de chapitres',
              ],
              correctIndex: 1,
              explanation: 'On commence par choisir le genre et definir les piliers : geographie, politique, economie, croyances et technologies.',
            },
            {
              question: 'Que fait l\'IA quand elle detecte une contradiction dans votre univers ?',
              options: [
                'Elle supprime l\'element contradictoire',
                'Elle le signale et propose des solutions coherentes',
                'Elle ignore le probleme',
                'Elle reecrit tout le chapitre',
              ],
              correctIndex: 1,
              explanation: 'L\'IA signale les contradictions logiques et vous aide a les resoudre avant qu\'elles ne fragilisent votre recit.',
            },
            {
              question: 'Pourquoi generer des proverbes et des fetes pour un monde fictif ?',
              options: [
                'Pour allonger le nombre de pages',
                'Pour donner de la profondeur et informer l\'ecriture',
                'Pour remplacer les dialogues',
                'Pour creer un guide touristique',
              ],
              correctIndex: 1,
              explanation: 'Ces details culturels donnent de la profondeur a l\'univers et informent l\'ecriture meme s\'ils ne figurent pas tous dans le texte final.',
            },
            {
              question: 'Qu\'est-ce que la cartographie narrative ?',
              options: [
                'Un GPS pour ecrivains',
                'Un outil qui relie les lieux par des routes, rivalites et mythes',
                'Une carte au tresor dans le roman',
                'Un plan du bureau de l\'auteur',
              ],
              correctIndex: 1,
              explanation: 'La cartographie narrative cree un reseau vivant de lieux lies par des relations commerciales, politiques et culturelles.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 5 — Co-ecriture IA
    {
      id: 'ec-m5',
      title: 'Co-ecriture avec l\'IA',
      emoji: '\u{1F91D}',
      description: 'Apprenez a collaborer efficacement avec l\'IA pour ecrire.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4BB}',
      badgeName: 'Co-Auteur IA',
      lessons: [
        {
          id: 'ec-m5-l1',
          title: 'La co-ecriture humain-IA en pratique',
          duration: '4 min',
          type: 'text',
          content: `La co-ecriture avec l\'IA n\'est pas de la triche. C\'est une nouvelle forme de collaboration creative ou l\'humain reste le directeur artistique et l\'IA agit comme un assistant polyvalent. Comprendre comment structurer cette collaboration est la cle pour produire des textes authentiques et de qualite.

Le premier principe est de toujours partir de votre intention creative. Avant de solliciter l\'IA, definissez clairement ce que vous voulez : une scene de tension entre deux amis, un monologue interieur melancolique, une description de foret en automne. Plus votre brief est precis, plus l\'IA vous fournira une matiere premiere exploitable. Un prompt vague comme "ecris-moi quelque chose de beau" donnera un resultat generique et inutilisable.

Le mode ping-pong est la methode de co-ecriture la plus productive. Vous ecrivez un paragraphe, l\'IA ecrit le suivant, vous corrigez et enrichissez, puis l\'IA continue. A chaque tour, vous ajustez le ton et la direction. Ce va-et-vient cree une dynamique creative ou l\'IA vous surprend avec des idees que vous n\'auriez pas eues seul et vous guidez l\'IA vers votre vision artistique.

L\'IA excelle dans certaines taches specifiques. Elle est remarquable pour generer des premieres ebauches que vous remodellerez, proposer des alternatives quand vous etes bloque, verifier la coherence temporelle de votre recit et reformuler un passage qui ne vous satisfait pas. En revanche, l\'IA ne remplace pas votre sensibilite, votre vecu et votre regard unique sur le monde — c\'est justement ce qui rend votre texte irremplacable.

Le controle de version est essentiel en co-ecriture. Freenzy garde l\'historique de toutes les versions generees. Vous pouvez revenir a une version anterieure si une direction ne vous convient plus. Certains auteurs gardent meme les "fausses pistes" de l\'IA comme materiau pour de futurs projets.`,
          xpReward: 15,
        },
        {
          id: 'ec-m5-l2',
          title: 'Exercice : Co-ecrire une scene',
          duration: '3 min',
          type: 'exercise',
          content: 'Pratiquez la co-ecriture en mode ping-pong avec l\'IA.',
          exercisePrompt: `Vous allez co-ecrire une scene courte avec l'IA en utilisant la methode ping-pong.

Contexte de la scene : un personnage retrouve un objet perdu depuis 20 ans dans une boite au grenier.

1. Ecrivez le premier paragraphe (3-4 phrases) qui pose le decor : le grenier, l'atmosphere, pourquoi le personnage est la.
2. Demandez a l'IA de continuer avec le moment de la decouverte de la boite.
3. Reprenez la main pour ecrire la reaction emotionnelle du personnage en ouvrant la boite.
4. Demandez a l'IA d'ecrire le dernier paragraphe : ce que le personnage fait de cet objet retrouve.

Apres l'exercice, identifiez :
- Les passages ou la contribution de l'IA vous a surpris positivement
- Les passages que vous avez du retravailler et pourquoi
- Ce que vous auriez ecrit differemment sans l'IA`,
          xpReward: 20,
        },
        {
          id: 'ec-m5-l3',
          title: 'Quiz — Co-ecriture IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la co-ecriture avec l\'IA.',
          quizQuestions: [
            {
              question: 'Quel est le premier principe de la co-ecriture avec l\'IA ?',
              options: [
                'Laisser l\'IA ecrire le texte entier',
                'Toujours partir de son intention creative',
                'Copier des textes existants comme modele',
                'Ecrire uniquement en anglais puis traduire',
              ],
              correctIndex: 1,
              explanation: 'Il faut toujours definir clairement son intention creative avant de solliciter l\'IA pour obtenir des resultats exploitables.',
            },
            {
              question: 'Qu\'est-ce que le mode ping-pong en co-ecriture ?',
              options: [
                'Un jeu video integre a l\'editeur',
                'L\'alternance de paragraphes entre l\'humain et l\'IA',
                'Une technique de correction orthographique',
                'Un format de publication en deux colonnes',
              ],
              correctIndex: 1,
              explanation: 'Le mode ping-pong consiste a alterner les paragraphes entre l\'auteur et l\'IA, chacun enrichissant le travail de l\'autre.',
            },
            {
              question: 'Dans quoi l\'IA excelle-t-elle en co-ecriture ?',
              options: [
                'Remplacer la sensibilite de l\'auteur',
                'Generer des premieres ebauches et proposer des alternatives',
                'Publier directement le texte',
                'Choisir le titre du livre',
              ],
              correctIndex: 1,
              explanation: 'L\'IA est remarquable pour generer des ebauches, debloquer l\'auteur et verifier la coherence du recit.',
            },
            {
              question: 'Pourquoi garder l\'historique des versions en co-ecriture ?',
              options: [
                'Pour prouver que l\'IA a travaille plus que l\'humain',
                'Pour revenir a une version anterieure et reutiliser les fausses pistes',
                'Pour calculer le temps passe',
                'Pour compter le nombre de mots generes',
              ],
              correctIndex: 1,
              explanation: 'L\'historique permet de revenir a des versions anterieures et de reutiliser les fausses pistes comme materiau creatif.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 6 — Publication
    {
      id: 'ec-m6',
      title: 'Publier son oeuvre',
      emoji: '\u{1F4D6}',
      description: 'De la relecture finale a la publication, les etapes pour partager votre creation.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3C6}',
      badgeName: 'Auteur Publie',
      lessons: [
        {
          id: 'ec-m6-l1',
          title: 'Le chemin vers la publication avec l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Vous avez ecrit votre texte, relu et corrige chaque chapitre, et vous etes satisfait du resultat. Il est temps de penser a la publication. L\'IA de Freenzy vous accompagne dans cette etape cruciale qui transforme un manuscrit en livre accessible aux lecteurs.

La relecture professionnelle assistee par IA est la premiere etape. L\'IA analyse votre texte sur plusieurs niveaux : orthographe et grammaire bien sur, mais aussi coherence narrative (un personnage qui change de couleur d\'yeux au chapitre 7), rythme (des chapitres trop longs ou trop courts), repetitions stylistiques et clarte des passages ambigus. Elle vous fournit un rapport chapitre par chapitre avec des suggestions priorisees par gravite.

Le synopsis et la lettre d\'accompagnement sont souvent les documents les plus difficiles a rediger pour un auteur. Comment resumer en une page un roman de 300 pages sans le trahir ? L\'IA vous aide a identifier les elements essentiels de votre intrigue et a les formuler de maniere accrocheuse. Elle genere plusieurs versions du synopsis — une version courte pour les salons, une version moyenne pour les editeurs et une version longue pour les dossiers de candidature.

Pour l\'autoedition, l\'IA vous guide dans le formatage technique : mise en page pour impression a la demande, conversion au format ePub pour les liseuses, creation de la page de titre et des mentions legales. Elle vous aide aussi a rediger la quatrieme de couverture, ce texte court qui doit donner envie de lire sans tout reveler.

La strategie de lancement est le dernier maillon. L\'IA vous propose un calendrier de communication : annonces sur les reseaux sociaux, extraits a partager, chroniqueurs a contacter, salons litteraires ou envoyer votre livre. Elle vous aide a rediger un communique de presse adapte a chaque type de media. Un bon lancement peut faire la difference entre un livre ignore et un succes d\'estime.`,
          xpReward: 15,
        },
        {
          id: 'ec-m6-l2',
          title: 'Exercice : Rediger un synopsis',
          duration: '3 min',
          type: 'exercise',
          content: 'Redigez un synopsis percutant pour un projet d\'ecriture.',
          exercisePrompt: `Choisissez un livre que vous connaissez bien (ou un projet personnel) et redigez :

1. Un synopsis court (3-4 phrases) pour un pitch en salon du livre
2. Un synopsis moyen (1 paragraphe de 100 mots) pour un editeur
3. Un texte de quatrieme de couverture (50-70 mots) qui donne envie sans spoiler

Regles :
- Le synopsis court doit contenir le protagoniste, l'enjeu et le conflit principal
- Le synopsis moyen doit ajouter le contexte, les personnages secondaires et l'arc narratif
- La quatrieme de couverture doit poser une question ou creer un suspense

Analysez ensuite : quelle version etait la plus difficile a ecrire et pourquoi ?`,
          xpReward: 20,
        },
        {
          id: 'ec-m6-l3',
          title: 'Quiz — Publication',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le processus de publication.',
          quizQuestions: [
            {
              question: 'Que verifie la relecture professionnelle de l\'IA au-dela de l\'orthographe ?',
              options: [
                'Le prix de vente du livre',
                'La coherence narrative, le rythme et les repetitions',
                'Le nombre de pages minimum',
                'La taille de la police de caracteres',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse la coherence narrative, le rythme des chapitres, les repetitions stylistiques et la clarte des passages.',
            },
            {
              question: 'Combien de versions de synopsis l\'IA propose-t-elle ?',
              options: ['Une seule version standard', 'Deux versions', 'Trois versions adaptees', 'Cinq versions'],
              correctIndex: 2,
              explanation: 'L\'IA genere trois versions : courte pour les salons, moyenne pour les editeurs et longue pour les dossiers de candidature.',
            },
            {
              question: 'Quel format est necessaire pour les liseuses electroniques ?',
              options: ['PDF', 'Word', 'ePub', 'PowerPoint'],
              correctIndex: 2,
              explanation: 'Le format ePub est le standard pour les liseuses electroniques comme Kindle ou Kobo.',
            },
            {
              question: 'Que comprend la strategie de lancement proposee par l\'IA ?',
              options: [
                'Uniquement la date de sortie',
                'Un calendrier de communication avec annonces, extraits et contacts presse',
                'L\'impression des exemplaires',
                'La traduction en 10 langues',
              ],
              correctIndex: 1,
              explanation: 'La strategie de lancement inclut un calendrier de communication, des extraits a partager, des chroniqueurs a contacter et un communique de presse.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// =============================================================================
// 2. STORYTELLING IA
// =============================================================================

export const parcoursStorytelling: FormationParcours = {
  id: 'storytelling-ia',
  title: 'Storytelling IA',
  emoji: '\u{1F4D6}',
  description: 'Maitrisez l\'art du storytelling avec l\'IA : construisez des arcs narratifs captivants, creez des heros attachants, gerez le conflit, suscitez l\'emotion, appliquez le storytelling au business et presentez avec impact.',
  category: 'creativite',
  subcategory: 'storytelling',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#8B5CF6',
  diplomaTitle: 'Storyteller IA',
  diplomaSubtitle: 'Certification Freenzy.io — Storytelling IA',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Arc narratif
    {
      id: 'st-m1',
      title: 'L\'arc narratif : structure d\'une histoire',
      emoji: '\u{1F4C8}',
      description: 'Comprenez les structures narratives classiques et modernes pour captiver votre audience.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Architecte Narratif',
      lessons: [
        {
          id: 'st-m1-l1',
          title: 'Les structures narratives fondamentales',
          duration: '4 min',
          type: 'text',
          content: `Toute grande histoire repose sur une structure. Que ce soit un film hollywoodien, un conte africain ou une publicite de 30 secondes, les mecanismes narratifs qui captivent l\'attention humaine sont universels. L\'IA de Freenzy vous aide a maitriser ces structures pour raconter des histoires qui marquent les esprits.

La structure en trois actes est le fondement de la narration occidentale. Le premier acte installe le monde ordinaire du heros et introduit l\'element perturbateur qui le force a agir. Le deuxieme acte — le plus long — confronte le heros a des obstacles croissants qui testent ses limites. Le troisieme acte apporte la resolution et montre comment le heros a ete transforme par son aventure. L\'IA de Freenzy vous aide a identifier ces trois actes dans n\'importe quel recit et a les appliquer a vos propres histoires.

Le voyage du heros de Joseph Campbell enrichit cette structure avec douze etapes archetypal : l\'appel a l\'aventure, le refus de l\'appel, la rencontre du mentor, le passage du seuil, les epreuves, l\'approche de la caverne, l\'epreuve supreme, la recompense, le retour et la resurrection. L\'IA vous guide a travers chaque etape en vous posant les bonnes questions : qui est le mentor de votre heros ? Quel est son seuil a franchir ? Quelle transformation interieure accompagne sa victoire exterieure ?

Au-dela des structures classiques, l\'IA connait des formats modernes : la structure en cercle de Dan Harmon, le recit non lineaire a la Tarantino, le format episodique des series. Elle vous recommande la structure la plus adaptee a votre projet et a votre audience. Un pitch startup utilisera une structure differente d\'un roman fantastique.

L\'IA genere aussi des courbes de tension pour visualiser le rythme emotionnel de votre histoire. Vous voyez immediatement si votre recit s\'essouffle au milieu ou si le climax arrive trop tot.`,
          xpReward: 15,
        },
        {
          id: 'st-m1-l2',
          title: 'Jeu : Identifier les etapes narratives',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque moment d\'une histoire celebre a son etape narrative.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Le monde ordinaire', right: 'Le heros vit sa routine quotidienne' },
              { left: 'L\'appel a l\'aventure', right: 'Un evenement bouleverse l\'equilibre' },
              { left: 'Le mentor', right: 'Un guide donne les outils pour reussir' },
              { left: 'Les epreuves', right: 'Des obstacles testent la determination' },
              { left: 'Le climax', right: 'L\'affrontement decisif avec l\'antagoniste' },
              { left: 'La transformation', right: 'Le heros revient change par l\'aventure' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'st-m1-l3',
          title: 'Quiz — Arc narratif',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les structures narratives.',
          quizQuestions: [
            {
              question: 'Combien d\'actes comprend la structure narrative classique ?',
              options: ['Deux', 'Trois', 'Cinq', 'Sept'],
              correctIndex: 1,
              explanation: 'La structure classique comprend trois actes : exposition, confrontation et resolution.',
            },
            {
              question: 'Qui a formalise le voyage du heros en douze etapes ?',
              options: ['Aristote', 'Shakespeare', 'Joseph Campbell', 'Steven Spielberg'],
              correctIndex: 2,
              explanation: 'Joseph Campbell a formalise le monomythe ou voyage du heros dans "Le Heros aux mille et un visages".',
            },
            {
              question: 'Quel outil l\'IA genere-t-elle pour visualiser le rythme emotionnel ?',
              options: [
                'Un graphique de ventes',
                'Une courbe de tension',
                'Un calendrier editorial',
                'Un organigramme',
              ],
              correctIndex: 1,
              explanation: 'L\'IA genere des courbes de tension qui permettent de visualiser les hauts et les bas emotionnels du recit.',
            },
            {
              question: 'Pourquoi l\'IA recommande-t-elle des structures differentes selon le projet ?',
              options: [
                'Pour vendre plus de formations',
                'Parce que chaque projet et audience necessite une approche adaptee',
                'Par hasard',
                'Pour compliquer le processus d\'ecriture',
              ],
              correctIndex: 1,
              explanation: 'Un pitch startup, un roman ou une serie necessitent des structures narratives differentes adaptees a leur format et audience.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 2 — Le heros
    {
      id: 'st-m2',
      title: 'Creer un heros attachant',
      emoji: '\u{1F9B8}',
      description: 'Concevez des protagonistes auxquels votre audience s\'identifie immediatement.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u2B50',
      badgeName: 'Createur de Heros',
      lessons: [
        {
          id: 'st-m2-l1',
          title: 'L\'anatomie d\'un heros captivant',
          duration: '4 min',
          type: 'text',
          content: `Un heros captivant n\'est pas forcement un personnage parfait. Au contraire, ce sont ses failles, ses doutes et ses contradictions qui le rendent humain et attachant. L\'IA de Freenzy vous aide a concevoir des protagonistes qui resonnent avec votre audience, qu\'il s\'agisse d\'un roman, d\'un pitch ou d\'une campagne marketing.

La vulnerabilite est la cle de l\'attachement. Un heros invincible ennuie. Un heros qui doute, qui a peur, qui fait des erreurs mais continue d\'avancer — celui-la captive. L\'IA vous aide a identifier la vulnerabilite specifique de votre heros : est-ce un syndrome de l\'imposteur ? Une peur de l\'abandon ? Un traumatisme d\'enfance ? Cette vulnerabilite doit etre liee au theme de votre histoire pour creer une resonance profonde.

Le desir et le besoin sont deux forces distinctes qui animent votre heros. Le desir est ce qu\'il croit vouloir : la richesse, la gloire, la vengeance. Le besoin est ce dont il a reellement besoin : l\'amour, la paix interieure, le pardon. Le parcours du heros consiste a realiser que son desir initial etait une illusion et que son vrai besoin etait ailleurs. L\'IA vous aide a articuler cette tension entre desir apparent et besoin profond.

La competence distinctive rend votre heros unique dans l\'univers de l\'histoire. Ce n\'est pas un superpouvoir — c\'est une qualite que seul ce personnage possede dans cette situation precise. Peut-etre est-ce sa capacite a ecouter, son obstination face a l\'echec ou son humour dans les moments sombres. L\'IA vous propose des competences distinctives en fonction du genre de votre histoire et de la personnalite de votre heros.

L\'empathie se construit dans les premieres minutes. Montrez votre heros en action positive — aidant quelqu\'un, faisant face a une injustice, sacrifiant quelque chose pour un proche — et votre audience sera de son cote pour tout le reste du recit.`,
          xpReward: 15,
        },
        {
          id: 'st-m2-l2',
          title: 'Exercice : Concevoir un heros',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez un heros complet pour un storytelling professionnel.',
          exercisePrompt: `Imaginez que vous devez raconter l'histoire de votre entreprise ou d'un projet personnel en format storytelling.

Creez votre heros (qui peut etre vous, votre client ideal, ou votre entreprise personnifiee) en definissant :

1. Son monde ordinaire : quelle etait sa situation avant le changement ?
2. Sa vulnerabilite principale : quelle faiblesse le rend humain ?
3. Son desir apparent : que croit-il vouloir au depart ?
4. Son besoin reel : de quoi a-t-il reellement besoin ?
5. Sa competence distinctive : quel talent unique possede-t-il ?
6. Le moment d'empathie : quelle scene montre sa bonte des les premieres secondes ?

Puis ecrivez un paragraphe de 5-6 phrases qui presente ce heros de maniere a ce que l'audience s'identifie immediatement.`,
          xpReward: 20,
        },
        {
          id: 'st-m2-l3',
          title: 'Quiz — Le heros',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la creation de heros.',
          quizQuestions: [
            {
              question: 'Quelle est la cle de l\'attachement a un heros selon la formation ?',
              options: ['Sa beaute physique', 'Sa vulnerabilite', 'Son intelligence', 'Sa richesse'],
              correctIndex: 1,
              explanation: 'La vulnerabilite — doutes, peurs, erreurs — rend le heros humain et attachant pour l\'audience.',
            },
            {
              question: 'Quelle est la difference entre le desir et le besoin du heros ?',
              options: [
                'Il n\'y a aucune difference',
                'Le desir est ce qu\'il croit vouloir, le besoin est ce dont il a reellement besoin',
                'Le desir est pour le debut, le besoin pour la fin',
                'Le desir est materiel, le besoin est financier',
              ],
              correctIndex: 1,
              explanation: 'Le desir est l\'objectif apparent (gloire, vengeance) tandis que le besoin est la necessite profonde (amour, paix interieure).',
            },
            {
              question: 'Comment construire l\'empathie dans les premieres minutes ?',
              options: [
                'En decrivant son apparence physique en detail',
                'En montrant le heros en action positive ou face a l\'injustice',
                'En listant ses diplomes et reussites',
                'En le comparant aux autres personnages',
              ],
              correctIndex: 1,
              explanation: 'Montrer le heros en action positive (aider quelqu\'un, affronter une injustice) cree immediatement l\'empathie.',
            },
            {
              question: 'Qu\'est-ce que la competence distinctive du heros ?',
              options: [
                'Un superpouvoir magique',
                'Une qualite unique que seul ce personnage possede dans cette situation',
                'Son diplome universitaire',
                'Sa connaissance des arts martiaux',
              ],
              correctIndex: 1,
              explanation: 'La competence distinctive est une qualite unique — ecoute, obstination, humour — specifique a ce personnage dans cette situation.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 3 — Le conflit
    {
      id: 'st-m3',
      title: 'Gerer le conflit narratif',
      emoji: '\u26A1',
      description: 'Creez des conflits captivants qui maintiennent la tension et l\'interet.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F525}',
      badgeName: 'Maitre du Conflit',
      lessons: [
        {
          id: 'st-m3-l1',
          title: 'Le conflit : moteur de toute histoire',
          duration: '4 min',
          type: 'text',
          content: `Sans conflit, il n\'y a pas d\'histoire. Le conflit est le moteur narratif qui pousse le heros a agir, qui cree la tension et qui maintient l\'attention de l\'audience. L\'IA de Freenzy vous aide a concevoir des conflits a plusieurs niveaux qui enrichissent votre storytelling, que ce soit pour un roman ou une presentation professionnelle.

Il existe quatre types fondamentaux de conflit. Le conflit externe oppose le heros a une force exterieure : un antagoniste, la nature, la societe ou la technologie. Le conflit interne met le heros face a lui-meme : ses peurs, ses valeurs contradictoires ou son passe. Le conflit relationnel nait des tensions entre personnages proches : amis, famille, collegues. Le conflit situationnel emerge des circonstances : un dilemme moral, un choix impossible, une course contre la montre.

Les meilleures histoires combinent plusieurs types de conflits. Un entrepreneur qui lance sa startup affronte un concurrent redoutable (externe), doute de ses capacites (interne), se dispute avec son associe (relationnel) et doit livrer avant une deadline impossible (situationnel). L\'IA vous aide a superposer ces couches de conflit pour creer une richesse narrative qui maintient l\'audience captivee.

L\'escalade est essentielle. Chaque obstacle doit etre plus difficile que le precedent. Si votre heros surmonte facilement chaque defi, la tension retombe. L\'IA analyse votre recit et verifie que la difficulte augmente progressivement. Elle vous suggere des complications inattendues qui relancent l\'interet juste au moment ou le lecteur pourrait decrocher.

La resolution du conflit doit etre satisfaisante sans etre previsible. L\'IA vous propose plusieurs denouements possibles et evalue leur impact emotionnel. Un bon denouement resout le conflit principal tout en laissant une question ouverte qui resonne dans l\'esprit de l\'audience longtemps apres la fin de l\'histoire.`,
          xpReward: 15,
        },
        {
          id: 'st-m3-l2',
          title: 'Jeu : Classer les types de conflit',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque situation a son type de conflit narratif.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Conflit externe', right: 'Le heros affronte un rival en competition' },
              { left: 'Conflit interne', right: 'Le heros doute de sa legitimite' },
              { left: 'Conflit relationnel', right: 'Deux associes s\'opposent sur la strategie' },
              { left: 'Conflit situationnel', right: 'Un choix impossible entre deux valeurs' },
              { left: 'Escalade', right: 'Chaque obstacle est plus difficile que le precedent' },
              { left: 'Resolution', right: 'Le denouement satisfaisant mais imprevisible' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'st-m3-l3',
          title: 'Quiz — Le conflit',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le conflit narratif.',
          quizQuestions: [
            {
              question: 'Combien de types fondamentaux de conflit la formation identifie-t-elle ?',
              options: ['Deux', 'Trois', 'Quatre', 'Six'],
              correctIndex: 2,
              explanation: 'Les quatre types sont : externe, interne, relationnel et situationnel.',
            },
            {
              question: 'Pourquoi faut-il combiner plusieurs types de conflits ?',
              options: [
                'Pour allonger l\'histoire',
                'Pour creer une richesse narrative qui maintient l\'audience captivee',
                'Pour confondre le lecteur',
                'Pour justifier un prix de vente plus eleve',
              ],
              correctIndex: 1,
              explanation: 'La superposition de conflits cree une richesse narrative multi-couches qui maintient l\'engagement de l\'audience.',
            },
            {
              question: 'Qu\'est-ce que l\'escalade dans un conflit narratif ?',
              options: [
                'Monter physiquement en altitude',
                'L\'augmentation progressive de la difficulte des obstacles',
                'Le nombre de personnages qui augmente',
                'L\'acceleration du rythme de lecture',
              ],
              correctIndex: 1,
              explanation: 'L\'escalade signifie que chaque obstacle est plus difficile que le precedent, maintenant la tension croissante.',
            },
            {
              question: 'Comment doit etre la resolution d\'un bon conflit ?',
              options: [
                'Previsible des le debut',
                'Satisfaisante sans etre previsible',
                'Laissee totalement ouverte',
                'Identique a celle d\'un film celebre',
              ],
              correctIndex: 1,
              explanation: 'Une bonne resolution est satisfaisante pour l\'audience tout en etant imprevisible, avec une question ouverte qui resonne.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 4 — L'emotion
    {
      id: 'st-m4',
      title: 'Susciter l\'emotion',
      emoji: '\u{1F62D}',
      description: 'Apprenez a provoquer des emotions authentiques chez votre audience.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F496}',
      badgeName: 'Alchimiste des Emotions',
      lessons: [
        {
          id: 'st-m4-l1',
          title: 'L\'emotion : le secret du storytelling memorable',
          duration: '4 min',
          type: 'text',
          content: `Les gens oublient les faits mais se souviennent des emotions. Une etude de Stanford a montre que les histoires sont 22 fois plus memorables que les statistiques seules. L\'IA de Freenzy vous aide a integrer des leviers emotionnels dans vos recits pour creer un impact durable sur votre audience.

Le principe du "show, don\'t tell" est la base de l\'emotion en narration. Ne dites pas "il etait triste". Montrez-le : "Il fixa la chaise vide en face de lui, celle ou elle s\'asseyait toujours pour le petit-dejeuner, et repoussa lentement sa tasse intacte." L\'IA analyse vos textes et identifie les passages ou vous dites une emotion au lieu de la montrer. Elle vous propose des reecritures sensorielles qui font vivre l\'emotion au lecteur.

Les cinq sens sont vos meilleurs allies pour declencher l\'emotion. Une odeur de pain chaud evoque l\'enfance et la securite. Le bruit d\'une porte qui claque evoque la colere ou la rupture. La texture rugueuse d\'une vieille lettre evoque la nostalgie. L\'IA vous aide a enrichir vos scenes avec des details sensoriels cibles qui activent la memoire emotionnelle de votre audience.

Le contraste emotionnel amplifie l\'impact. Un moment de joie intense juste avant une tragedie rend cette tragedie plus devastatrice. Un eclat de rire au milieu d\'une scene de tension relache la pression avant de la remonter plus haut. L\'IA analyse la cartographie emotionnelle de votre recit et vous montre ou inserer ces contrastes pour maximiser l\'impact.

L\'universalite de l\'emotion est un levier puissant. La peur de perdre un proche, la fierte d\'accomplir quelque chose de difficile, la honte d\'un echec public — ces emotions sont partagees par toute l\'humanite. L\'IA vous aide a ancrer votre recit dans ces emotions universelles, meme si le contexte est specifique. Un PDG qui parle de sa peur de licencier touche tout le monde parce que la culpabilite est universelle.`,
          xpReward: 15,
        },
        {
          id: 'st-m4-l2',
          title: 'Exercice : Reecrire avec emotion',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez un texte factuel en recit emotionnel.',
          exercisePrompt: `Voici un texte purement factuel :

"L'entreprise a ete creee en 2020. Elle a connu des difficultes financieres la premiere annee. Le fondateur a failli abandonner. Finalement, un gros client a signe et l'entreprise a survecu."

Reecrivez ce texte en 150-200 mots en appliquant :
1. Le principe "show, don't tell" — montrez les emotions au lieu de les nommer
2. Au moins trois details sensoriels (vue, son, toucher, odeur, gout)
3. Un contraste emotionnel (un moment de lumiere dans l'obscurite ou inversement)
4. Une emotion universelle dans laquelle tout le monde peut se reconnaitre

Puis analysez : quel detail sensoriel a ete le plus efficace selon vous et pourquoi ?`,
          xpReward: 20,
        },
        {
          id: 'st-m4-l3',
          title: 'Quiz — L\'emotion',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les leviers emotionnels.',
          quizQuestions: [
            {
              question: 'Combien de fois plus memorables sont les histoires par rapport aux statistiques selon l\'etude de Stanford ?',
              options: ['5 fois', '10 fois', '22 fois', '50 fois'],
              correctIndex: 2,
              explanation: 'L\'etude de Stanford a montre que les histoires sont 22 fois plus memorables que les statistiques seules.',
            },
            {
              question: 'Que signifie le principe "show, don\'t tell" ?',
              options: [
                'Toujours utiliser des images',
                'Montrer l\'emotion par des actions et details au lieu de la nommer',
                'Projeter des diapositives',
                'Parler fort pour etre entendu',
              ],
              correctIndex: 1,
              explanation: 'Il faut montrer l\'emotion a travers des actions, des gestes et des details sensoriels plutot que de simplement la nommer.',
            },
            {
              question: 'Pourquoi utiliser le contraste emotionnel dans un recit ?',
              options: [
                'Pour confondre l\'audience',
                'Pour amplifier l\'impact des emotions en les juxtaposant',
                'Pour montrer que l\'auteur est versatile',
                'Pour allonger le texte',
              ],
              correctIndex: 1,
              explanation: 'Le contraste emotionnel amplifie l\'impact : un moment de joie avant une tragedie rend celle-ci plus devastatrice.',
            },
            {
              question: 'Quel est l\'avantage des emotions universelles dans le storytelling ?',
              options: [
                'Elles sont plus faciles a ecrire',
                'Elles touchent tout le monde quelle que soit la situation specifique',
                'Elles prennent moins de mots',
                'Elles sont scientifiquement prouvees',
              ],
              correctIndex: 1,
              explanation: 'Les emotions universelles (peur, fierte, honte) touchent toute l\'humanite meme si le contexte du recit est specifique.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 5 — Business storytelling
    {
      id: 'st-m5',
      title: 'Storytelling pour le business',
      emoji: '\u{1F4BC}',
      description: 'Appliquez les techniques narratives au monde professionnel.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Business Storyteller',
      lessons: [
        {
          id: 'st-m5-l1',
          title: 'Le storytelling au service de l\'entreprise',
          duration: '4 min',
          type: 'text',
          content: `Le storytelling n\'est pas reserve aux romanciers. Les plus grandes entreprises du monde l\'utilisent pour vendre, recruter, lever des fonds et fideliser leurs clients. Apple ne vend pas des telephones — elle raconte l\'histoire de gens creatifs qui changent le monde. L\'IA de Freenzy vous aide a deployer ces memes techniques dans votre activite professionnelle.

Le pitch narratif remplace le pitch classique ennuyeux. Au lieu de commencer par "Notre entreprise propose une solution de...", commencez par une histoire : "Quand Marie a perdu sa meilleure employee parce qu\'elle n\'avait pas detecte son mal-etre, elle s\'est juree que plus jamais..." L\'IA vous aide a identifier dans votre parcours entrepreneurial les moments de tension, de doute et de victoire qui forment naturellement un arc narratif. Votre pitch devient une histoire que les investisseurs retiennent.

Le storytelling client est un levier de vente redoutable. Plutot que de lister les fonctionnalites de votre produit, racontez l\'histoire d\'un client avant et apres. L\'IA vous aide a structurer des etudes de cas en format narratif : la situation initiale douloureuse, la decouverte de votre solution, les doutes avant l\'achat, la transformation concrete et le resultat mesurable. Ce format transforme un temoignage banal en histoire convaincante.

Le storytelling de marque definit l\'identite profonde de votre entreprise. Pourquoi existez-vous ? Quelle injustice combattez-vous ? Quelle vision du monde portez-vous ? L\'IA vous guide pour articuler ces elements en un recit fondateur coherent qui irrigue toute votre communication : site web, reseaux sociaux, recrutement, relations presse.

Le storytelling interne est souvent neglige. Pourtant, les entreprises qui racontent leur propre histoire a leurs employes creent un sentiment d\'appartenance puissant. L\'IA vous aide a creer une timeline narrative de votre entreprise : les crises surmontees, les victoires celebrees, les valeurs forgees dans l\'adversite. Cette memoire collective motive les equipes bien plus qu\'un tableau de KPI.`,
          xpReward: 15,
        },
        {
          id: 'st-m5-l2',
          title: 'Exercice : Creer un pitch narratif',
          duration: '3 min',
          type: 'exercise',
          content: 'Transformez une presentation classique en pitch narratif captivant.',
          exercisePrompt: `Prenez un produit, un service ou un projet que vous connaissez bien et creez un pitch narratif en suivant cette structure :

1. LE HEROS (30 mots) : Presentez un client type avec un prenom et une situation concrete
2. LE PROBLEME (40 mots) : Decrivez sa douleur quotidienne avec un detail sensoriel
3. LA DECOUVERTE (30 mots) : Comment il/elle tombe sur votre solution
4. LE DOUTE (30 mots) : Pourquoi il/elle hesite avant de l'adopter
5. LA TRANSFORMATION (40 mots) : Le changement concret dans sa vie avec un resultat mesurable
6. LA MORALE (20 mots) : La lecon universelle que cette histoire enseigne

Total : environ 200 mots.

Puis repondez : en quoi ce pitch est-il plus memorable qu'une liste de fonctionnalites ?`,
          xpReward: 20,
        },
        {
          id: 'st-m5-l3',
          title: 'Quiz — Business storytelling',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le storytelling professionnel.',
          quizQuestions: [
            {
              question: 'Par quoi doit commencer un pitch narratif au lieu de "Notre entreprise propose..." ?',
              options: [
                'Par les chiffres de vente',
                'Par une histoire personnelle ou client',
                'Par la liste des fonctionnalites',
                'Par une citation celebre',
              ],
              correctIndex: 1,
              explanation: 'Un pitch narratif commence par une histoire — un moment de tension ou un probleme vecu — pour captiver l\'audience.',
            },
            {
              question: 'Quel est le format narratif recommande pour les etudes de cas clients ?',
              options: [
                'Situation douloureuse → decouverte → doutes → transformation → resultat',
                'Logo du client → temoignage → note sur 10',
                'Avant/apres en deux photos',
                'Liste de fonctionnalites utilisees',
              ],
              correctIndex: 0,
              explanation: 'Le format narratif complet inclut la douleur initiale, la decouverte, les doutes, la transformation et le resultat mesurable.',
            },
            {
              question: 'A quoi sert le storytelling interne dans une entreprise ?',
              options: [
                'A remplacer les reunions d\'equipe',
                'A creer un sentiment d\'appartenance par une memoire collective',
                'A ecrire le rapport annuel',
                'A former les nouveaux employes au produit',
              ],
              correctIndex: 1,
              explanation: 'Le storytelling interne cree un sentiment d\'appartenance en partageant les crises surmontees et les valeurs forgees ensemble.',
            },
            {
              question: 'Quelle entreprise est citee comme exemple de storytelling de marque ?',
              options: ['Google', 'Amazon', 'Apple', 'Microsoft'],
              correctIndex: 2,
              explanation: 'Apple est citee car elle ne vend pas des telephones mais raconte l\'histoire de gens creatifs qui changent le monde.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 6 — Presentation avec impact
    {
      id: 'st-m6',
      title: 'Presenter avec impact',
      emoji: '\u{1F3A4}',
      description: 'Transformez vos presentations en experiences narratives inoubliables.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AC}',
      badgeName: 'Presentateur d\'Impact',
      lessons: [
        {
          id: 'st-m6-l1',
          title: 'Transformer une presentation en experience narrative',
          duration: '4 min',
          type: 'text',
          content: `La plupart des presentations professionnelles sont oubliees avant meme que l\'audience ait quitte la salle. Trop de slides, trop de donnees, pas assez d\'histoire. L\'IA de Freenzy vous aide a transformer vos presentations en experiences narratives qui restent gravees dans les memoires.

La regle du un est fondamentale : une idee principale par presentation. Tout le reste est au service de cette idee unique. L\'IA vous aide a identifier votre message central et a eliminer tout ce qui ne le soutient pas directement. Si apres votre presentation quelqu\'un demande "c\'etait quoi le sujet ?", vous avez echoue. Si la reponse tient en une phrase, vous avez reussi.

L\'ouverture est votre moment le plus important. Vous avez 30 secondes pour captiver ou perdre votre audience. L\'IA vous propose cinq types d\'ouvertures narratives : la question provocante ("Et si votre entreprise disparaissait demain ?"), l\'anecdote personnelle, la statistique choquante contextualisee, la demonstration en direct et le silence strategique. Chaque type est adapte a un contexte et une audience specifiques.

La structure narrative d\'une presentation suit le meme schema qu\'une histoire : le monde actuel (probleme), la vision du monde ideal (solution), le chemin pour y arriver (plan d\'action) et l\'appel a l\'aventure (ce que l\'audience doit faire). L\'IA vous aide a reorganiser vos slides selon cette structure au lieu de la structure classique "a propos de nous / produit / prix / contact" qui endort tout le monde.

La cloture est votre derniere chance de marquer les esprits. L\'IA vous aide a creer des fins memorables : le retour a l\'anecdote d\'ouverture avec une resolution, un appel a l\'action emotionnel ou une phrase de conclusion qui resonne. Les meilleurs orateurs du monde — Steve Jobs, Brene Brown, Simon Sinek — terminent toujours par une phrase que l\'audience peut repeter mot pour mot en sortant de la salle.`,
          xpReward: 15,
        },
        {
          id: 'st-m6-l2',
          title: 'Exercice : Repenser une presentation',
          duration: '3 min',
          type: 'exercise',
          content: 'Restructurez une presentation existante en format narratif.',
          exercisePrompt: `Pensez a une presentation que vous avez faite ou vue recemment (reunion, cours, conference).

1. Identifiez le message central en UNE phrase (la regle du un)
2. Ecrivez une ouverture narrative de 3 phrases en utilisant l'un de ces formats :
   - Question provocante
   - Anecdote personnelle
   - Statistique choquante contextualisee
3. Restructurez le contenu en 4 actes narratifs :
   - Acte 1 : Le monde actuel (le probleme vecu)
   - Acte 2 : La vision ideale (a quoi ressemblerait le monde resolu)
   - Acte 3 : Le chemin (les 3 etapes pour y arriver)
   - Acte 4 : L'appel a l'aventure (ce que l'audience doit faire maintenant)
4. Ecrivez une phrase de cloture memorable que l'audience peut repeter

Comparez avec la version originale : qu'est-ce qui change dans l'impact ?`,
          xpReward: 20,
        },
        {
          id: 'st-m6-l3',
          title: 'Quiz — Presentation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les presentations narratives.',
          quizQuestions: [
            {
              question: 'Quelle est la "regle du un" pour une presentation ?',
              options: [
                'Une seule slide par sujet',
                'Une idee principale par presentation',
                'Un orateur par conference',
                'Une heure maximum',
              ],
              correctIndex: 1,
              explanation: 'La regle du un signifie qu\'une presentation doit avoir une seule idee centrale que tout le contenu soutient.',
            },
            {
              question: 'Combien de temps avez-vous pour captiver votre audience en ouverture ?',
              options: ['10 secondes', '30 secondes', '2 minutes', '5 minutes'],
              correctIndex: 1,
              explanation: 'Vous disposez d\'environ 30 secondes pour captiver ou perdre votre audience des l\'ouverture.',
            },
            {
              question: 'Quels sont les quatre actes d\'une presentation narrative ?',
              options: [
                'Introduction, developpement, conclusion, questions',
                'Monde actuel, vision ideale, chemin, appel a l\'aventure',
                'Titre, corps, resume, contacts',
                'Probleme, solution, prix, achat',
              ],
              correctIndex: 1,
              explanation: 'Les quatre actes sont : le monde actuel (probleme), la vision ideale (solution), le chemin (plan) et l\'appel a l\'aventure (action).',
            },
            {
              question: 'Que doit permettre une bonne phrase de cloture ?',
              options: [
                'Resumer toutes les slides',
                'Etre repetee mot pour mot par l\'audience en sortant',
                'Donner les coordonnees de l\'orateur',
                'Annoncer la prochaine presentation',
              ],
              correctIndex: 1,
              explanation: 'Une bonne cloture est une phrase memorable que l\'audience peut repeter en sortant, comme le font les meilleurs orateurs.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};

// =============================================================================
// 3. PODCAST IA
// =============================================================================

export const parcoursPodcast: FormationParcours = {
  id: 'podcast-ia',
  title: 'Podcast IA',
  emoji: '\u{1F3A7}',
  description: 'Lancez votre podcast avec l\'IA : definissez votre concept, choisissez votre equipement, enregistrez comme un pro, montez avec l\'IA, distribuez sur toutes les plateformes et monetisez votre audience.',
  category: 'creativite',
  subcategory: 'podcast',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F59E0B',
  diplomaTitle: 'Podcasteur IA',
  diplomaSubtitle: 'Certification Freenzy.io — Podcast IA',
  totalDuration: '1h',
  totalXP: 600,
  available: true,
  modules: [
    // Module 1 — Concept
    {
      id: 'pd-m1',
      title: 'Definir le concept de son podcast',
      emoji: '\u{1F4A1}',
      description: 'Trouvez votre niche, votre angle unique et votre format ideal.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Concepteur Podcast',
      lessons: [
        {
          id: 'pd-m1-l1',
          title: 'Trouver son concept de podcast unique',
          duration: '4 min',
          type: 'text',
          content: `Il existe plus de 4 millions de podcasts dans le monde. Pour que le votre se demarque, il ne suffit pas de choisir un sujet — il faut trouver un angle unique que personne d\'autre n\'occupe. L\'IA de Freenzy vous aide a definir un concept de podcast qui attire et fideline une audience specifique.

La recherche de niche commence par l\'intersection de trois cercles : ce qui vous passionne, ce que vous connaissez bien et ce que les gens recherchent. L\'IA analyse les tendances de recherche, les podcasts existants dans votre domaine et les lacunes du marche. Elle vous propose des niches inexplorees ou sous-exploitees : plutot que "un podcast sur la cuisine", pensez "recettes de grand-meres revisitees par l\'IA pour les etudiants fauches".

Le format est aussi important que le contenu. Interview, solo, co-anime, fiction, reportage, table ronde — chaque format a ses avantages et ses contraintes. L\'IA vous aide a choisir le format le plus adapte a votre personnalite et votre sujet. Si vous etes introverti, le format interview peut etre paradoxalement ideal car l\'invite fait 80% du travail. Si vous etes un expert, le format solo de 15 minutes vous positionne comme reference incontournable.

La frequence et la duree determinent votre contrat avec l\'auditeur. Un episode quotidien de 10 minutes cree une habitude matinale. Un episode hebdomadaire de 45 minutes permet une analyse approfondie. L\'IA analyse votre disponibilite reelle et votre volume de contenu potentiel pour recommander un rythme tenable sur le long terme — car la regularite est le premier facteur de succes d\'un podcast.

Le nom et l\'identite sonore sont votre carte de visite. L\'IA vous genere des propositions de noms memorables, vous aide a verifier leur disponibilite et vous conseille sur le jingle et l\'identite sonore qui marqueront les esprits. Un bon nom de podcast se retient en une ecoute et se recommande facilement de bouche a oreille.`,
          xpReward: 15,
        },
        {
          id: 'pd-m1-l2',
          title: 'Exercice : Definir son concept',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez le concept complet de votre futur podcast.',
          exercisePrompt: `Definissez le concept de votre podcast ideal en completant chaque element :

1. LES TROIS CERCLES
   - Ce qui vous passionne : (3 sujets)
   - Ce que vous connaissez bien : (3 domaines)
   - Ce que les gens cherchent : (3 besoins)
   - L'intersection : quelle niche unique emerge ?

2. LE FORMAT
   - Type choisi (interview/solo/co-anime/fiction) et pourquoi
   - Duree cible par episode et justification
   - Frequence (quotidien/hebdo/bimensuel) et pourquoi c'est tenable

3. L'IDENTITE
   - 3 propositions de noms (memorables, faciles a prononcer)
   - Le pitch en une phrase : "C'est le podcast qui..."
   - L'auditeur ideal : qui est-il, quand ecoute-t-il, que cherche-t-il ?

4. Expliquez en 2-3 phrases ce qui differencie votre concept de tout ce qui existe deja.`,
          xpReward: 20,
        },
        {
          id: 'pd-m1-l3',
          title: 'Quiz — Concept podcast',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la conception d\'un podcast.',
          quizQuestions: [
            {
              question: 'Quelle methode l\'IA utilise-t-elle pour trouver une niche de podcast ?',
              options: [
                'Copier les podcasts populaires',
                'L\'intersection de trois cercles : passion, expertise, demande',
                'Choisir au hasard un sujet tendance',
                'Demander a ses amis',
              ],
              correctIndex: 1,
              explanation: 'La methode des trois cercles croise ce qui vous passionne, votre expertise et ce que les gens recherchent.',
            },
            {
              question: 'Quel est le premier facteur de succes d\'un podcast ?',
              options: ['Un micro professionnel', 'La regularite de publication', 'Des invites celebres', 'Un studio d\'enregistrement'],
              correctIndex: 1,
              explanation: 'La regularite est le premier facteur de succes car elle cree une habitude chez l\'auditeur et fideline l\'audience.',
            },
            {
              question: 'Pourquoi le format interview peut-il convenir aux introvertis ?',
              options: [
                'Parce qu\'on peut enregistrer en silence',
                'Parce que l\'invite fait 80% du travail de parole',
                'Parce qu\'on n\'a pas besoin de micro',
                'Parce que c\'est plus court',
              ],
              correctIndex: 1,
              explanation: 'En format interview, l\'invite porte l\'essentiel de la conversation, ce qui reduit la pression sur l\'animateur introverti.',
            },
            {
              question: 'Combien de podcasts existent dans le monde selon la formation ?',
              options: ['500 000', '1 million', '4 millions', '10 millions'],
              correctIndex: 2,
              explanation: 'Il existe plus de 4 millions de podcasts dans le monde, d\'ou l\'importance de trouver un angle unique.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 2 — Equipement
    {
      id: 'pd-m2',
      title: 'Choisir son equipement',
      emoji: '\u{1F399}\uFE0F',
      description: 'Selectionnez le materiel adapte a votre budget et votre format.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F50A}',
      badgeName: 'Technicien Audio',
      lessons: [
        {
          id: 'pd-m2-l1',
          title: 'L\'equipement podcast de A a Z',
          duration: '4 min',
          type: 'text',
          content: `Beaucoup de futurs podcasteurs repoussent leur lancement en attendant d\'avoir le materiel parfait. La verite est que vous pouvez commencer avec un investissement minimal et ameliorer progressivement. L\'IA de Freenzy vous guide pour choisir exactement ce dont vous avez besoin a chaque etape de votre parcours.

Le micro est l\'investissement le plus important. Pour debuter, un micro USB comme le Blue Yeti ou le Rode NT-USB offre une excellente qualite sans necessite d\'interface audio. L\'IA vous recommande le micro adapte a votre environnement : si vous enregistrez dans une piece non traitee acoustiquement, un micro dynamique comme le Shure SM7B captera moins de bruit ambiant qu\'un micro a condensateur. Elle vous aide aussi a positionner correctement le micro pour une prise de son optimale.

Le traitement acoustique de votre espace est souvent neglige. Vous n\'avez pas besoin d\'un studio professionnel : des couvertures epaisses, des rideaux lourds et des coussins strategiquement places absorbent les reflexions sonores genantes. L\'IA analyse une photo de votre espace d\'enregistrement et vous indique ou placer des elements absorbants pour ameliorer significativement la qualite audio sans depenser un centime.

Le casque de monitoring vous permet d\'entendre ce que votre micro capte en temps reel. Un casque ferme comme le Sony MDR-7506 ou l\'Audio-Technica ATH-M50x est ideal car il isole du bruit exterieur et restitue fidelement le son. L\'IA vous alerte sur les problemes audio que vous devez detecter pendant l\'enregistrement : souffle, saturation, echo et bruits parasites.

Le logiciel d\'enregistrement peut etre entierement gratuit. Audacity pour l\'audio seul, OBS Studio pour la video, et des plateformes comme Riverside ou Zencastr pour les interviews a distance. L\'IA compare les fonctionnalites et vous recommande la solution la plus simple pour votre niveau technique actuel. L\'objectif est de reduire la friction technologique pour vous concentrer sur le contenu.`,
          xpReward: 15,
        },
        {
          id: 'pd-m2-l2',
          title: 'Jeu : Associer equipement et usage',
          duration: '3 min',
          type: 'game',
          content: 'Associez chaque equipement a son role dans la chaine podcast.',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Micro dynamique', right: 'Ideal en piece non traitee acoustiquement' },
              { left: 'Micro a condensateur', right: 'Capte les details dans un environnement calme' },
              { left: 'Casque ferme', right: 'Monitoring en temps reel sans fuite sonore' },
              { left: 'Interface audio', right: 'Connecte un micro XLR a l\'ordinateur' },
              { left: 'Traitement acoustique', right: 'Reduit les reflexions sonores de la piece' },
              { left: 'Logiciel DAW', right: 'Enregistre et edite les fichiers audio' },
            ],
          },
          xpReward: 20,
        },
        {
          id: 'pd-m2-l3',
          title: 'Quiz — Equipement',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'equipement podcast.',
          quizQuestions: [
            {
              question: 'Quel type de micro est recommande pour un environnement bruyant ?',
              options: ['Micro a condensateur', 'Micro dynamique', 'Micro cravate', 'Micro de conference'],
              correctIndex: 1,
              explanation: 'Le micro dynamique capte moins de bruit ambiant qu\'un micro a condensateur, ideal pour les pieces non traitees.',
            },
            {
              question: 'Comment traiter acoustiquement une piece sans budget ?',
              options: [
                'Installer des panneaux professionnels',
                'Placer des couvertures, rideaux et coussins strategiquement',
                'Enregistrer dans la salle de bain',
                'Augmenter le volume du micro',
              ],
              correctIndex: 1,
              explanation: 'Des couvertures epaisses, rideaux lourds et coussins absorbent efficacement les reflexions sonores sans cout.',
            },
            {
              question: 'Quel logiciel gratuit est cite pour l\'enregistrement audio ?',
              options: ['Pro Tools', 'Logic Pro', 'Audacity', 'Adobe Audition'],
              correctIndex: 2,
              explanation: 'Audacity est un logiciel gratuit et open source parfaitement adapte a l\'enregistrement et l\'edition podcast.',
            },
            {
              question: 'Pourquoi utiliser un casque ferme plutot qu\'ouvert en podcast ?',
              options: [
                'Il est moins cher',
                'Il isole du bruit exterieur et evite les fuites sonores',
                'Il a un meilleur design',
                'Il fonctionne sans fil',
              ],
              correctIndex: 1,
              explanation: 'Le casque ferme isole du bruit exterieur et empeche le son de fuir vers le micro pendant l\'enregistrement.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 3 — Enregistrement
    {
      id: 'pd-m3',
      title: 'Enregistrer comme un pro',
      emoji: '\u{1F534}',
      description: 'Maitrisez les techniques d\'enregistrement pour un son professionnel.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3B5}',
      badgeName: 'Expert Enregistrement',
      lessons: [
        {
          id: 'pd-m3-l1',
          title: 'Techniques d\'enregistrement podcast',
          duration: '4 min',
          type: 'text',
          content: `La qualite d\'un podcast se joue en grande partie pendant l\'enregistrement. Un bon enregistrement necessite peu de post-production, tandis qu\'un mauvais enregistrement ne sera jamais rattrape par le montage. L\'IA de Freenzy vous enseigne les techniques professionnelles accessibles a tous pour capturer un son impeccable.

La preparation avant l\'enregistrement est cruciale. Verifiez votre equipement 15 minutes avant : niveaux d\'entree du micro, casque de monitoring branche, logiciel ouvert et pret, espace de stockage suffisant. L\'IA vous fournit une checklist pre-enregistrement personnalisee selon votre setup. Elle vous rappelle aussi de couper les notifications du telephone, fermer les fenetres et signaler a votre entourage que vous enregistrez.

La technique vocale fait une enorme difference. Parlez a 15-20 centimetres du micro, legerement en biais pour eviter les plosives (les "p" et "b" qui saturent). Hydratez-vous bien avant — une voix seche craque et claque. Echauffez votre voix avec des exercices simples : bourdonnements, voyelles tenues, lecture a voix haute. L\'IA analyse un echantillon de votre voix et vous donne des conseils personnalises : parler plus lentement, varier les intonations ou baisser legerement le volume.

La gestion des niveaux audio est technique mais essentielle. Votre signal doit se situer entre -12 dB et -6 dB en moyenne, avec des pics qui ne depassent jamais 0 dB. L\'IA surveille vos niveaux en temps reel et vous alerte si vous etes trop fort (saturation) ou trop faible (bruit de fond visible). Elle vous apprend a utiliser le gain de votre micro ou de votre interface pour trouver le reglage optimal.

L\'enregistrement d\'interviews a distance presente des defis specifiques. La latence internet, les differences de qualite micro entre les intervenants et les coupures de connexion sont des risques reels. L\'IA vous recommande des plateformes qui enregistrent localement sur chaque machine puis synchronisent les pistes, garantissant ainsi une qualite studio meme avec une connexion mediocre.`,
          xpReward: 15,
        },
        {
          id: 'pd-m3-l2',
          title: 'Exercice : Checklist d\'enregistrement',
          duration: '3 min',
          type: 'exercise',
          content: 'Creez votre protocole d\'enregistrement personnalise.',
          exercisePrompt: `Creez votre checklist d'enregistrement personnalisee en trois phases :

PHASE 1 — 15 minutes avant (preparation)
- Listez 5 verifications techniques a faire (micro, logiciel, niveaux...)
- Listez 3 actions d'environnement (bruit, notifications, signalement...)
- Decrivez votre routine d'echauffement vocal en 3 etapes

PHASE 2 — Pendant l'enregistrement
- Quels indicateurs surveiller en temps reel ? (niveaux, temps, notes...)
- Comment gerez-vous une erreur de parole ? (reprise, marqueur, clap...)
- Quelle est votre strategie si un bruit exterieur interrompt l'enregistrement ?

PHASE 3 — Juste apres l'enregistrement
- 3 actions immediates pour securiser votre enregistrement
- Comment notez-vous les passages a corriger au montage ?

Bonus : identifiez le point faible de votre setup actuel et proposez une solution.`,
          xpReward: 20,
        },
        {
          id: 'pd-m3-l3',
          title: 'Quiz — Enregistrement',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les techniques d\'enregistrement.',
          quizQuestions: [
            {
              question: 'A quelle distance du micro faut-il parler idealement ?',
              options: ['2-5 centimetres', '15-20 centimetres', '50 centimetres', '1 metre'],
              correctIndex: 1,
              explanation: 'La distance ideale est de 15-20 centimetres, legerement en biais pour eviter les plosives.',
            },
            {
              question: 'Quel est le niveau audio moyen recommande pendant l\'enregistrement ?',
              options: ['Entre 0 dB et +6 dB', 'Entre -12 dB et -6 dB', 'Entre -24 dB et -18 dB', 'Exactement 0 dB'],
              correctIndex: 1,
              explanation: 'Le signal doit se situer entre -12 dB et -6 dB en moyenne, avec des pics ne depassant jamais 0 dB.',
            },
            {
              question: 'Pourquoi parler en biais par rapport au micro ?',
              options: [
                'Pour avoir un meilleur angle de camera',
                'Pour eviter les plosives qui saturent',
                'Pour etre plus confortable',
                'Pour parler plus fort',
              ],
              correctIndex: 1,
              explanation: 'Parler legerement en biais evite les plosives (sons "p" et "b") qui provoquent des saturations desagreables.',
            },
            {
              question: 'Quel probleme specifique posent les interviews a distance ?',
              options: [
                'Les invites ne parlent pas assez',
                'La latence, les differences de qualite micro et les coupures',
                'Le prix des appels telephoniques',
                'L\'impossibilite de voir l\'invite',
              ],
              correctIndex: 1,
              explanation: 'Les interviews a distance posent des defis de latence, de qualite micro heterogene et de coupures de connexion.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 4 — Montage IA
    {
      id: 'pd-m4',
      title: 'Montage podcast avec l\'IA',
      emoji: '\u2702\uFE0F',
      description: 'Utilisez l\'IA pour editer, nettoyer et produire vos episodes rapidement.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3B6}',
      badgeName: 'Monteur Audio IA',
      lessons: [
        {
          id: 'pd-m4-l1',
          title: 'Le montage podcast accelere par l\'IA',
          duration: '4 min',
          type: 'text',
          content: `Le montage est la tache qui consomme le plus de temps dans la production d\'un podcast. Pour une heure d\'enregistrement, comptez traditionnellement deux a quatre heures de montage. L\'IA reduit ce temps a 30 minutes en automatisant les taches les plus repetitives et les plus techniques.

La suppression des silences et hesitations est la premiere revolution. L\'IA detecte automatiquement les "euh", les "hum", les faux departs et les silences trop longs. Elle vous propose un montage en un clic qui elimine ces imperfections tout en conservant les pauses naturelles qui donnent du rythme a la parole. Vous validez chaque coupe dans une interface visuelle ou la forme d\'onde est annotee — un travail qui prenait une heure se fait en cinq minutes.

Le nettoyage audio avance par IA transforme un enregistrement amateur en son professionnel. L\'IA supprime le bruit de fond constant (ventilation, circulation), attenue les bruits ponctuels (sonnerie, aboiement, klaxon) et egalise les niveaux de volume entre les intervenants. Si votre invite parlait deux fois moins fort que vous, l\'IA equilibre les deux voix automatiquement pour un confort d\'ecoute optimal.

La transcription automatique est un sous-produit precieux du montage IA. L\'IA transcrit votre episode mot a mot et vous permet de monter le son en editant le texte — supprimez un paragraphe dans la transcription et l\'IA coupe le passage audio correspondant. C\'est la methode de montage la plus intuitive qui existe, meme pour quelqu\'un qui n\'a jamais ouvert un logiciel audio.

L\'ajout automatique de musique et d\'effets sonores finalise votre episode. L\'IA insere votre jingle d\'intro et d\'outro, ajoute des transitions musicales entre les segments et propose des ambiances sonores adaptees au ton de votre episode. Elle respecte les niveaux recommandes pour la musique de fond : suffisamment presente pour creer une atmosphere, jamais assez forte pour couvrir la voix.`,
          xpReward: 15,
        },
        {
          id: 'pd-m4-l2',
          title: 'Jeu : Ordonner le workflow de montage',
          duration: '3 min',
          type: 'game',
          content: 'Remettez les etapes de montage podcast dans l\'ordre optimal.',
          gameType: 'ordering',
          gameData: {
            items: [
              'Importer l\'enregistrement brut dans le logiciel',
              'Supprimer les silences et hesitations avec l\'IA',
              'Nettoyer le bruit de fond et egaliser les volumes',
              'Editer le contenu via la transcription',
              'Ajouter le jingle, les transitions et la musique',
              'Exporter le fichier final en format MP3 192 kbps',
            ],
          },
          xpReward: 20,
        },
        {
          id: 'pd-m4-l3',
          title: 'Quiz — Montage IA',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le montage podcast assiste par IA.',
          quizQuestions: [
            {
              question: 'Combien de temps de montage l\'IA permet-elle d\'economiser ?',
              options: [
                'De 4 heures a 2 heures',
                'De 4 heures a 30 minutes',
                'De 1 heure a 45 minutes',
                'Aucune economie significative',
              ],
              correctIndex: 1,
              explanation: 'L\'IA reduit le temps de montage de 2-4 heures a environ 30 minutes en automatisant les taches repetitives.',
            },
            {
              question: 'Comment fonctionne le montage par transcription ?',
              options: [
                'On dicte les instructions a l\'IA',
                'On supprime du texte dans la transcription et l\'audio correspondant est coupe',
                'On ecrit un nouveau script et l\'IA le lit',
                'On traduit l\'episode dans une autre langue',
              ],
              correctIndex: 1,
              explanation: 'Le montage par transcription permet d\'editer l\'audio en modifiant le texte — supprimer un paragraphe supprime le son correspondant.',
            },
            {
              question: 'Que fait l\'IA pour equilibrer les voix de deux intervenants ?',
              options: [
                'Elle demande a l\'invite de parler plus fort',
                'Elle egalise automatiquement les niveaux de volume',
                'Elle supprime la voix la plus faible',
                'Elle ajoute un echo a la voix la plus faible',
              ],
              correctIndex: 1,
              explanation: 'L\'IA detecte les differences de volume entre intervenants et egalise automatiquement les niveaux pour un confort d\'ecoute optimal.',
            },
            {
              question: 'Quel est le niveau recommande pour la musique de fond ?',
              options: [
                'Aussi fort que la voix',
                'Suffisamment presente pour l\'atmosphere mais sans couvrir la voix',
                'Inaudible',
                'Plus forte que la voix pour creer de l\'energie',
              ],
              correctIndex: 1,
              explanation: 'La musique de fond doit creer une atmosphere sans jamais couvrir la voix des intervenants.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 5 — Distribution
    {
      id: 'pd-m5',
      title: 'Distribuer son podcast',
      emoji: '\u{1F4E1}',
      description: 'Publiez votre podcast sur toutes les plateformes et construisez votre audience.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F310}',
      badgeName: 'Distributeur Podcast',
      lessons: [
        {
          id: 'pd-m5-l1',
          title: 'Publier et distribuer son podcast partout',
          duration: '4 min',
          type: 'text',
          content: `Votre episode est monte, mixe et pret a etre partage avec le monde. La distribution est l\'etape qui transforme un fichier audio sur votre ordinateur en contenu accessible a des millions d\'auditeurs potentiels. L\'IA de Freenzy vous guide pour maximiser votre visibilite sur toutes les plateformes.

L\'hebergeur podcast est votre base de lancement. C\'est un service qui stocke vos fichiers audio et genere un flux RSS — le standard technique que toutes les plateformes utilisent pour diffuser votre contenu. L\'IA compare les hebergeurs populaires (Ausha, Acast, Buzzsprout, Podbean) selon vos criteres : budget, statistiques, facilite d\'utilisation et fonctionnalites de monetisation. Elle vous guide dans la configuration initiale pour que votre flux RSS soit conforme aux exigences de chaque plateforme.

La soumission aux plateformes est un processus unique mais decisif. Apple Podcasts, Spotify, Google Podcasts, Deezer, Amazon Music — chaque plateforme a ses propres regles de soumission. L\'IA vous fournit un guide pas a pas pour chaque plateforme avec les specifications exactes : format de couverture, nombre de caracteres pour la description, categories et sous-categories disponibles. Une fois votre flux RSS accepte, les nouveaux episodes sont publies automatiquement partout.

Les metadonnees sont votre levier de decouverte. Le titre de l\'episode, la description, les mots-cles et les chapitres influencent directement votre visibilite dans les moteurs de recherche des plateformes. L\'IA genere des metadonnees optimisees pour chaque episode : un titre accrocheur avec les bons mots-cles, une description structuree avec un resume et des timestamps, et des tags pertinents pour le referencement.

La promotion croisee amplifie votre portee. L\'IA vous aide a creer des audiogrammes — ces courtes videos avec la forme d\'onde animee — pour Instagram et TikTok, des citations visuelles pour LinkedIn, des threads Twitter recapitulatifs et des newsletters pour vos abonnes. Chaque episode devient une dizaine de contenus adaptes a chaque plateforme sociale.`,
          xpReward: 15,
        },
        {
          id: 'pd-m5-l2',
          title: 'Exercice : Preparer la distribution',
          duration: '3 min',
          type: 'exercise',
          content: 'Preparez les elements de distribution pour un episode pilote.',
          exercisePrompt: `Imaginez que votre premier episode est pret. Preparez tous les elements de distribution :

1. METADONNEES DE L'EPISODE
   - Titre optimise (max 60 caracteres, avec mots-cles)
   - Description structuree (100 mots avec resume, points cles et timestamps)
   - 5 tags/mots-cles pertinents
   - Categorie et sous-categorie Apple Podcasts

2. PROMOTION CROISEE — redigez le texte pour :
   - Un post Instagram/TikTok (30 mots max, accrocheur)
   - Un post LinkedIn (50 mots, angle professionnel)
   - Un tweet/thread de 3 posts recapitulatifs

3. PLANNING DE PUBLICATION
   - Quel jour et quelle heure publier votre premier episode et pourquoi ?
   - Quels jours poster sur chaque reseau social (staggering) ?

4. Identifiez 3 podcasts complementaires au votre pour proposer de la promotion croisee.`,
          xpReward: 20,
        },
        {
          id: 'pd-m5-l3',
          title: 'Quiz — Distribution',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la distribution podcast.',
          quizQuestions: [
            {
              question: 'Quel standard technique utilisent les plateformes pour diffuser les podcasts ?',
              options: ['API REST', 'Flux RSS', 'WebSocket', 'FTP'],
              correctIndex: 1,
              explanation: 'Le flux RSS est le standard universel que toutes les plateformes utilisent pour recevoir et diffuser les episodes de podcast.',
            },
            {
              question: 'Qu\'est-ce qu\'un audiogramme dans le contexte podcast ?',
              options: [
                'Un test auditif medical',
                'Une courte video avec forme d\'onde animee pour les reseaux sociaux',
                'Un graphique de statistiques d\'ecoute',
                'Un format audio compresse',
              ],
              correctIndex: 1,
              explanation: 'Un audiogramme est une courte video avec la forme d\'onde animee, ideale pour promouvoir un episode sur Instagram ou TikTok.',
            },
            {
              question: 'Pourquoi les metadonnees sont-elles importantes ?',
              options: [
                'Elles ameliorent la qualite audio',
                'Elles influencent directement la visibilite dans les recherches',
                'Elles reduisent la taille du fichier',
                'Elles sont obligatoires par la loi',
              ],
              correctIndex: 1,
              explanation: 'Les metadonnees (titre, description, tags) influencent directement la decouverte de votre podcast dans les moteurs de recherche.',
            },
            {
              question: 'Combien de contenus differents un seul episode peut-il generer pour les reseaux sociaux ?',
              options: ['Un seul post', 'Trois contenus', 'Une dizaine de contenus', 'Un par plateforme uniquement'],
              correctIndex: 2,
              explanation: 'Chaque episode peut devenir une dizaine de contenus adaptes : audiogrammes, citations visuelles, threads, newsletters.',
            },
          ],
          xpReward: 15,
        },
      ],
    },

    // Module 6 — Monetisation
    {
      id: 'pd-m6',
      title: 'Monetiser son podcast',
      emoji: '\u{1F4B0}',
      description: 'Transformez votre audience en revenus avec les strategies de monetisation IA.',
      duration: '10 min',
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F451}',
      badgeName: 'Podcasteur Monetise',
      lessons: [
        {
          id: 'pd-m6-l1',
          title: 'Les strategies de monetisation podcast',
          duration: '4 min',
          type: 'text',
          content: `La monetisation d\'un podcast ne commence pas a 100 000 ecoutes. Avec les bonnes strategies, vous pouvez generer des revenus des vos premiers milliers d\'auditeurs fideles. L\'IA de Freenzy vous aide a identifier et deployer les modeles de monetisation les plus adaptes a votre podcast et votre audience.

Le sponsoring est le modele le plus connu. Les marques paient pour que vous mentionniez leur produit dans vos episodes. L\'IA vous aide a evaluer votre valeur : elle calcule votre CPM (cout pour mille ecoutes) en fonction de votre niche et de votre taux d\'engagement. Elle vous genere aussi un media kit professionnel avec vos statistiques, votre audience type et vos tarifs. Les podcasts de niche avec une audience fidele obtiennent souvent de meilleurs CPM que les podcasts generalistes avec plus d\'ecoutes.

Le contenu premium est un levier de revenus direct. Proposez des episodes bonus, des series exclusives ou un acces anticipe aux episodes via un abonnement mensuel. Des plateformes comme Patreon, Apple Podcasts Subscriptions ou Spotify for Podcasters facilitent la mise en place. L\'IA vous aide a definir les paliers d\'abonnement et le contenu exclusif qui justifie le prix sans cannibaliser votre contenu gratuit.

Les produits derives et services etendent votre marque au-dela de l\'audio. L\'IA analyse votre audience pour identifier les opportunites : formation en ligne, coaching, ebook, evenements en direct, merchandising. Si votre podcast parle de productivite, votre audience est probablement prete a acheter un template Notion ou une formation sur la gestion du temps. L\'IA vous aide a creer et promouvoir ces offres complementaires.

L\'affiliation est un modele discret mais efficace. Vous recommandez des outils ou services que vous utilisez reellement et vous recevez une commission sur chaque vente generee. L\'IA vous identifie les programmes d\'affiliation pertinents dans votre niche, vous aide a integrer les recommandations naturellement dans vos episodes et suit vos performances pour optimiser vos revenus. La cle est l\'authenticite — ne recommandez que ce que vous utilisez vraiment.`,
          xpReward: 15,
        },
        {
          id: 'pd-m6-l2',
          title: 'Exercice : Plan de monetisation',
          duration: '3 min',
          type: 'exercise',
          content: 'Elaborez votre strategie de monetisation podcast.',
          exercisePrompt: `Creez un plan de monetisation en trois phases pour votre podcast :

PHASE 1 — Lancement (0 a 1000 ecoutes/episode)
- Quelle source de revenus est realiste a ce stade ?
- Comment construire la confiance de votre audience pour preparer la monetisation ?
- Quel contenu gratuit pouvez-vous offrir pour fideliser ?

PHASE 2 — Croissance (1000 a 5000 ecoutes/episode)
- Quels modeles de monetisation activer ? (sponsoring, premium, affiliation...)
- Redigez un email type pour demarcher un sponsor dans votre niche
- Definissez 3 paliers d'abonnement premium avec le contenu exclusif de chacun

PHASE 3 — Maturite (5000+ ecoutes/episode)
- Quels produits derives ou services pouvez-vous proposer ?
- Comment diversifier vos sources de revenus pour ne pas dependre d'un seul modele ?
- Estimez un objectif de revenu mensuel et detaillez la repartition par source

Bonus : identifiez le piege de monetisation a eviter absolument dans votre niche.`,
          xpReward: 20,
        },
        {
          id: 'pd-m6-l3',
          title: 'Quiz — Monetisation',
          duration: '3 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la monetisation podcast.',
          quizQuestions: [
            {
              question: 'Que signifie CPM dans le contexte du sponsoring podcast ?',
              options: [
                'Contenu Par Minute',
                'Cout Pour Mille ecoutes',
                'Commission Par Mois',
                'Clic Par Message',
              ],
              correctIndex: 1,
              explanation: 'Le CPM (Cout Pour Mille) est le tarif que paie un sponsor pour 1000 ecoutes de son message publicitaire.',
            },
            {
              question: 'Pourquoi les podcasts de niche obtiennent-ils souvent de meilleurs CPM ?',
              options: [
                'Parce qu\'ils sont plus longs',
                'Parce que leur audience fidele et ciblee a plus de valeur pour les annonceurs',
                'Parce qu\'ils coutent moins cher a produire',
                'Parce qu\'ils ont plus d\'episodes',
              ],
              correctIndex: 1,
              explanation: 'Une audience de niche fidele et engagee a plus de valeur pour les annonceurs cibles que des ecoutes generalistes.',
            },
            {
              question: 'Quelle est la cle de l\'affiliation reussie en podcast ?',
              options: [
                'Recommander le plus de produits possible',
                'Ne recommander que des produits que l\'on utilise reellement',
                'Mentionner le lien d\'affiliation a chaque phrase',
                'Choisir les produits avec la commission la plus elevee',
              ],
              correctIndex: 1,
              explanation: 'L\'authenticite est essentielle : ne recommandez que des outils et services que vous utilisez vraiment pour maintenir la confiance.',
            },
            {
              question: 'A partir de combien d\'ecoutes peut-on commencer a monetiser ?',
              options: [
                '100 000 ecoutes minimum',
                'Des les premiers milliers d\'auditeurs fideles',
                '1 million de telechargements',
                'Uniquement apres 1 an de publication',
              ],
              correctIndex: 1,
              explanation: 'Avec les bonnes strategies, la monetisation est possible des les premiers milliers d\'auditeurs fideles et engages.',
            },
          ],
          xpReward: 15,
        },
      ],
    },
  ],
};
