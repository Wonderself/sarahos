// =============================================================================
// Freenzy.io — Formation Niveau 2 : Prompt Engineering Avance
// 6 modules x 3 lessons = 18 lessons, 750 XP total, ~1h
// =============================================================================

import type { FormationParcours } from './formation-data';

export const parcoursPromptNiv2: FormationParcours = {
  id: 'prompt-engineering-niv2',
  title: 'Prompt Engineering Avance',
  emoji: '\u{1F9EA}',
  description: 'Passez au niveau superieur : prompt chaining, system prompts complexes, RAG, sampling, Extended Thinking et evaluation rigoureuse de vos prompts.',
  category: 'ia',
  subcategory: 'prompt-engineering',
  level: 'avance',
  levelLabel: 'Avance',
  color: '#F59E0B',
  diplomaTitle: 'Prompt Architect',
  diplomaSubtitle: 'Certification Freenzy.io — Prompt Engineering Avance',
  totalDuration: '1h',
  totalXP: 750,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Prompt chaining et workflows
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m1',
      title: 'Prompt chaining et workflows',
      emoji: '\u{1F517}',
      description: 'Apprends a enchainer plusieurs prompts pour creer des workflows IA puissants.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m1-l1',
          title: 'Enchainer les prompts : output devient input',
          duration: '4 min',
          type: 'text',
          content: `Tu maitrises deja les bases du prompting — c'est genial ! Maintenant, on va voir comment enchainer plusieurs prompts pour accomplir des taches complexes qu'un seul prompt ne peut pas gerer. C'est le concept de prompt chaining, et c'est un vrai game-changer.

L'idee est simple : la sortie d'un prompt devient l'entree du suivant. Tu construis une chaine ou chaque maillon transforme, enrichit ou filtre l'information. C'est exactement comme un pipeline de donnees, sauf qu'ici chaque etape est un appel a l'IA.

Prenons un exemple concret. Tu veux creer un article de blog optimise SEO a partir d'une simple idee. Etape 1 : tu demandes a l'IA de generer 10 angles possibles pour ton sujet. Etape 2 : tu lui donnes ces 10 angles et tu lui demandes de choisir le plus pertinent en justifiant. Etape 3 : tu prends l'angle choisi et tu demandes un plan detaille. Etape 4 : tu passes le plan et tu demandes la redaction complete. Chaque etape s'appuie sur la precedente, et le resultat final est bien meilleur que si tu avais tout demande d'un coup.

Pourquoi ca marche mieux ? Parce que les LLM excellent quand la tache est bien cadree. Un prompt qui dit "ecris-moi un article SEO complet sur le marketing digital" est trop vague — le modele doit deviner le ton, l'angle, la structure, la longueur. En decoupant, tu guides l'IA a chaque etape et tu peux corriger la trajectoire en cours de route.

Dans Freenzy, le prompt chaining est utilise partout en coulisses. Quand tu demandes a l'assistant Commercial de rediger une proposition, il enchaine en realite plusieurs etapes : analyse du contexte client, identification des besoins, structuration de l'offre, puis redaction finale. Tu vois le resultat fini, mais c'est un workflow de 3 a 5 prompts qui s'est execute.

Les regles d'or du chaining : chaque etape doit avoir un objectif clair et unique. La sortie d'une etape doit etre facilement exploitable par la suivante (pas de format ambigu). Et surtout, prevois des points de controle — des etapes ou tu valides avant de continuer. C'est ce qui differencie un workflow robuste d'une chaine fragile.`,
          xpReward: 30,
        },
        {
          id: 'pn2-m1-l2',
          title: 'Exercice : Workflow 3 etapes',
          duration: '3 min',
          type: 'exercise',
          exercisePrompt: `Cree un workflow de prompt chaining en 3 etapes pour transformer un retour client negatif en plan d'action concret.

Voici le retour client : "Votre service client met trop de temps a repondre, j'ai attendu 3 jours pour une simple question sur ma facture."

Pour chaque etape, ecris :
1. Le prompt exact que tu enverrais a l'IA
2. Le format de sortie attendu
3. Comment cette sortie sera utilisee par l'etape suivante

Etape 1 — Analyse : extraire les problemes specifiques mentionnes
Etape 2 — Diagnostic : identifier les causes racines probables
Etape 3 — Plan d'action : proposer 3 actions concretes avec delais

Assure-toi que chaque prompt reference explicitement la sortie de l'etape precedente.`,
          content: 'Mets en pratique le prompt chaining en construisant un workflow complet.',
          xpReward: 40,
        },
        {
          id: 'pn2-m1-l3',
          title: 'Quiz — Prompt chaining',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifie ta comprehension du prompt chaining et des workflows.',
          quizQuestions: [
            {
              question: 'Quel est le principe fondamental du prompt chaining ?',
              options: [
                'Envoyer le meme prompt plusieurs fois pour avoir de meilleures reponses',
                'La sortie d\'un prompt devient l\'entree du prompt suivant',
                'Utiliser plusieurs modeles IA en parallele',
                'Ecrire des prompts de plus en plus longs',
              ],
              correctIndex: 1,
              explanation: 'Le prompt chaining repose sur l\'enchainement sequentiel : chaque prompt recoit la sortie du precedent, creant une chaine de transformations progressives.',
            },
            {
              question: 'Pourquoi decouper une tache complexe en plusieurs prompts est-il plus efficace ?',
              options: [
                'Ca coute moins de credits',
                'Les LLM ont une meilleure precision quand la tache est bien cadree et specifique',
                'Le modele a plus de memoire avec des prompts courts',
                'Ca evite les erreurs de syntaxe',
              ],
              correctIndex: 1,
              explanation: 'Les LLM produisent de meilleurs resultats quand chaque etape a un objectif clair et unique. Un prompt trop large force le modele a faire trop de choix implicites.',
            },
            {
              question: 'Qu\'est-ce qu\'un "point de controle" dans un workflow de prompts ?',
              options: [
                'Un test unitaire automatise',
                'Une etape ou l\'utilisateur valide la sortie avant de continuer',
                'Un backup de la conversation',
                'Un calcul du nombre de tokens utilises',
              ],
              correctIndex: 1,
              explanation: 'Les points de controle permettent a l\'utilisateur de verifier la sortie intermediaire et de corriger la trajectoire si necessaire, evitant de propager une erreur dans toute la chaine.',
            },
            {
              question: 'Dans Freenzy, combien d\'etapes de prompt chaining utilise typiquement l\'assistant Commercial pour une proposition ?',
              options: [
                '1 seule etape',
                '2 etapes',
                '3 a 5 etapes',
                '10 etapes ou plus',
              ],
              correctIndex: 2,
              explanation: 'L\'assistant Commercial enchaine 3 a 5 prompts en coulisses : analyse du contexte, identification des besoins, structuration de l\'offre, puis redaction finale.',
            },
            {
              question: 'Quelle est la meilleure pratique pour le format de sortie entre deux etapes ?',
              options: [
                'Toujours utiliser du JSON',
                'Laisser l\'IA choisir le format',
                'Un format clair et facilement exploitable par l\'etape suivante',
                'Du texte libre sans structure',
              ],
              correctIndex: 2,
              explanation: 'Le format de sortie doit etre non ambigu et directement exploitable. Selon le cas, ca peut etre du JSON, une liste structuree ou un texte formate — l\'important est que l\'etape suivante puisse le consommer sans confusion.',
            },
          ],
          xpReward: 50,
        },
      ],
      passingScore: 60,
      xpReward: 120,
      badgeEmoji: '\u{1F517}',
      badgeName: 'Chaineur',
    },

    // -----------------------------------------------------------------------
    // Module 2 — System prompts complexes
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m2',
      title: 'System prompts complexes',
      emoji: '\u{1F3AD}',
      description: 'Maitrise les variables dynamiques, personas et contraintes dans les system prompts.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m2-l1',
          title: 'Variables dynamiques et personas',
          duration: '4 min',
          type: 'text',
          content: `Le system prompt, c'est la fondation de tout assistant IA. C'est le texte invisible que l'utilisateur ne voit pas, mais qui definit completement le comportement du modele. Et quand tu maitrises les system prompts complexes, tu peux creer des assistants vraiment sur-mesure.

Commencons par les variables dynamiques. Au lieu d'ecrire un system prompt statique, tu peux y injecter des informations contextuelles qui changent a chaque appel. Par exemple : "Tu es l'assistant de {{nom_entreprise}}, specialise en {{secteur}}. Le client s'appelle {{prenom_client}} et son dernier achat date du {{date_dernier_achat}}." A chaque conversation, ces variables sont remplacees par les vraies valeurs. Le modele recoit un prompt personnalise sans que tu aies a le reecrire.

Dans Freenzy, chaque agent utilise cette technique. L'assistant Juridique recoit dynamiquement le type d'entreprise, la juridiction applicable et les contrats en cours. L'assistant Marketing recoit le secteur, le ton de marque et les campagnes actives. C'est ce qui rend chaque agent pertinent et contextuel.

Les personas sont l'autre pilier. Un persona, c'est le "role" que tu fais jouer au modele. Mais un bon persona va bien au-dela de "Tu es un expert en marketing". Il definit le niveau de formalite (tutoiement ou vouvoiement), le vocabulaire autorise (technique, simplifie, jargon metier), les sujets hors-limites (ce que l'assistant ne doit jamais aborder), le format de reponse par defaut (listes, paragraphes, tableaux) et meme les reflexes a avoir (toujours demander confirmation avant une action irreversible, par exemple).

Un pattern puissant : la technique du "persona en couches". Tu definis d'abord l'identite de base ("Tu es un consultant financier senior"), puis tu ajoutes des contraintes ("Tu ne donnes jamais de conseil fiscal sans disclaimer"), puis des comportements conditionnels ("Si le client mentionne un montant > 50 000 euros, propose systematiquement un rendez-vous telephonique"). Chaque couche affine le comportement sans contredire les precedentes.

L'erreur classique ? Creer un persona trop rigide qui empeche le modele de s'adapter. Un bon system prompt donne un cadre, pas une cage. Il faut equilibrer structure et flexibilite pour que l'assistant reste naturel tout en respectant les regles.`,
          xpReward: 30,
        },
        {
          id: 'pn2-m2-l2',
          title: 'Templating et injection de contexte',
          duration: '3 min',
          type: 'text',
          content: `Maintenant qu'on a vu les variables et les personas, parlons du templating — l'art de construire des system prompts modulaires et reutilisables. C'est la difference entre un artisan qui reconstruit chaque meuble from scratch et un pro qui utilise des gabarits ajustables.

Le templating, c'est l'idee de creer des "blocs" de system prompt que tu assembles selon le contexte. Par exemple, tu peux avoir un bloc "identite" (qui definit le persona), un bloc "contraintes" (les regles a respecter), un bloc "format" (comment structurer les reponses), et un bloc "contexte dynamique" (les donnees specifiques a cette session). Tu composes le system prompt final en assemblant les blocs pertinents.

Voici un template type pour un assistant metier :

Section IDENTITE — qui tu es, ton expertise, ton ton. Section CONTEXTE — les donnees dynamiques injectees (profil client, historique, preferences). Section REGLES — ce que tu dois et ne dois pas faire. Section FORMAT — comment structurer tes reponses. Section EXEMPLES — des modeles de reponse attendue (few-shot statique).

L'injection de contexte va plus loin que les simples variables. Tu peux injecter des blocs entiers conditionnellement. Si le client a un abonnement premium, tu ajoutes un bloc qui debloque des fonctionnalites avancees. Si c'est un premier contact, tu ajoutes un bloc d'onboarding. Dans Freenzy, c'est exactement comme ca que les agents s'adaptent : le system prompt est construit dynamiquement a chaque appel selon le profil utilisateur, son historique et le contexte de la conversation.

Un piege courant : injecter trop de contexte. Chaque token du system prompt consomme de la fenetre de contexte. Si tu injectes 5 000 tokens de contexte, ca fait 5 000 tokens de moins pour la conversation. La regle : n'injecte que ce qui est pertinent pour la tache en cours. Un assistant qui doit repondre a une question sur une facture n'a pas besoin de connaitre l'historique complet des 200 derniers emails.

Le sweet spot ? Un system prompt de 500 a 1 500 tokens qui couvre l'identite, les regles essentielles et le contexte immediatement pertinent. Au-dela, tu surcharges le modele et tu risques de diluer les instructions importantes.`,
          xpReward: 25,
        },
        {
          id: 'pn2-m2-l3',
          title: 'Quiz — System prompts',
          duration: '3 min',
          type: 'quiz',
          content: 'Verifie ta comprehension des system prompts complexes.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'une variable dynamique dans un system prompt ?',
              options: [
                'Un parametre que l\'utilisateur modifie en temps reel',
                'Une valeur contextuelle injectee automatiquement a chaque appel (ex: {{nom_client}})',
                'Un bug dans le template',
                'Un compteur de tokens',
              ],
              correctIndex: 1,
              explanation: 'Les variables dynamiques comme {{nom_client}} ou {{secteur}} sont remplacees par les vraies valeurs a chaque appel, rendant le prompt contextuel sans le reecrire.',
            },
            {
              question: 'Qu\'est-ce que la technique du "persona en couches" ?',
              options: [
                'Utiliser plusieurs modeles IA en meme temps',
                'Definir identite de base, puis contraintes, puis comportements conditionnels',
                'Ecrire le prompt en plusieurs langues',
                'Decouper le prompt en questions-reponses',
              ],
              correctIndex: 1,
              explanation: 'Le persona en couches ajoute progressivement : identite de base > contraintes > comportements conditionnels. Chaque couche affine le comportement sans contredire les precedentes.',
            },
            {
              question: 'Quelle est la taille recommandee pour un system prompt efficace ?',
              options: [
                'Le plus court possible, moins de 50 tokens',
                '500 a 1 500 tokens',
                'Au moins 10 000 tokens pour etre complet',
                'La taille n\'a aucune importance',
              ],
              correctIndex: 1,
              explanation: 'Un system prompt de 500 a 1 500 tokens est le sweet spot : assez pour couvrir identite, regles et contexte pertinent, sans surcharger la fenetre de contexte.',
            },
            {
              question: 'Pourquoi ne faut-il pas injecter trop de contexte dans le system prompt ?',
              options: [
                'Ca rend le texte illisible',
                'Le modele refuse les prompts trop longs',
                'Ca consomme la fenetre de contexte et dilue les instructions importantes',
                'Ca augmente le temps de generation de 10x',
              ],
              correctIndex: 2,
              explanation: 'Chaque token du system prompt reduit la fenetre de contexte disponible pour la conversation, et trop d\'informations diluent les instructions cles — le modele risque de les "oublier".',
            },
          ],
          xpReward: 45,
        },
      ],
      passingScore: 60,
      xpReward: 100,
      badgeEmoji: '\u{1F3AD}',
      badgeName: 'Architecte System',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Few-shot avance et RAG
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m3',
      title: 'Few-shot avance et RAG',
      emoji: '\u{1F4DA}',
      description: 'Exemples dynamiques et Retrieval Augmented Generation pour des reponses ancrees dans tes donnees.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m3-l1',
          title: 'Exemples dynamiques et RAG',
          duration: '4 min',
          type: 'text',
          content: `Le few-shot, tu connais deja : tu donnes quelques exemples dans ton prompt pour montrer au modele ce que tu attends. Mais le few-shot avance, c'est un autre niveau. Au lieu d'exemples statiques codes en dur, tu selectionnes dynamiquement les exemples les plus pertinents pour chaque requete. C'est la que ca devient vraiment puissant.

Imagine que tu as une base de 500 emails de support avec les reponses ideales. Quand un nouveau ticket arrive, au lieu de toujours montrer les 3 memes exemples, tu cherches les 3 tickets les plus similaires dans ta base et tu les injectes comme exemples. Le modele recoit des exemples directement pertinents, et sa reponse est beaucoup plus adaptee.

Pour selectionner les bons exemples, tu utilises la recherche semantique : tu transformes chaque exemple en vecteur (embedding) et tu trouves les plus proches du nouveau cas. C'est exactement ce que fait pgvector dans Freenzy — la base PostgreSQL stocke les embeddings et peut faire des recherches de similarite en millisecondes.

Et ca nous amene au RAG — Retrieval Augmented Generation. C'est le pattern le plus important de l'IA en entreprise aujourd'hui. L'idee : au lieu de tout mettre dans le prompt, tu recuperes (retrieve) les informations pertinentes depuis une base de connaissances, puis tu les injectes dans le prompt pour que le modele genere (generate) une reponse ancree dans tes donnees reelles.

Le flow RAG classique : l'utilisateur pose une question. Tu transformes la question en vecteur. Tu cherches les documents les plus similaires dans ta base vectorielle. Tu injectes les extraits pertinents dans le prompt avec la question. Le modele genere une reponse basee sur ces documents.

Pourquoi c'est crucial ? Parce que les LLM ont une date de coupure (leurs connaissances s'arretent a un moment donne) et ils ne connaissent pas tes donnees privees. Le RAG resout ces deux problemes : le modele accede a tes donnees fraiches et privees, sans que tu aies besoin de le reentrainer.

Dans Freenzy, le RAG est utilise par plusieurs agents. L'assistant DG accede a l'historique des decisions strategiques. L'assistant Juridique consulte ta base de contrats. L'assistant RH recherche dans les policies internes. Tout ca se fait transparently — tu poses une question, et l'agent va chercher le contexte pertinent avant de repondre.

Le piege du RAG ? Recuperer trop de documents ou des documents non pertinents. Un bon systeme RAG recupere 3 a 5 extraits hautement pertinents, pas 20 documents vaguement lies. La qualite du retrieval est aussi importante que la qualite de la generation.`,
          xpReward: 30,
        },
        {
          id: 'pn2-m3-l2',
          title: 'Exercice : Construis un prompt RAG',
          duration: '3 min',
          type: 'exercise',
          exercisePrompt: `Tu dois construire un prompt RAG complet pour un assistant de support technique.

Contexte : tu geres un SaaS de facturation. Un client demande : "Comment exporter mes factures au format PDF groupees par trimestre ?"

Voici 3 extraits recuperes depuis ta base de connaissances :

EXTRAIT 1 (score: 0.92) : "L'export PDF est accessible depuis Factures > Actions > Exporter. Selectionnez les factures souhaitees avec les cases a cocher, puis cliquez sur 'Exporter en PDF'. Les factures sont compilees en un seul fichier PDF."

EXTRAIT 2 (score: 0.87) : "Le filtre par periode permet de selectionner les factures par trimestre (T1, T2, T3, T4) ou par plage de dates personnalisee. Accessible via le menu 'Filtrer' en haut de la liste."

EXTRAIT 3 (score: 0.71) : "Les exports sont limites a 100 factures par lot. Pour des volumes superieurs, utilisez l'API d'export en masse (endpoint /api/invoices/export)."

Ecris le prompt complet que tu enverrais au LLM, incluant :
1. Le system prompt (role + regles)
2. Le contexte injecte (les 3 extraits, avec indication du score de pertinence)
3. La question de l'utilisateur
4. Les instructions de format de reponse

Bonus : ajoute une instruction pour que le modele cite ses sources (quel extrait il utilise).`,
          content: 'Construis un prompt RAG complet a partir d\'extraits de base de connaissances.',
          xpReward: 40,
        },
        {
          id: 'pn2-m3-l3',
          title: 'Quiz — Few-shot et RAG',
          duration: '3 min',
          type: 'quiz',
          content: 'Teste tes connaissances sur le few-shot avance et le RAG.',
          quizQuestions: [
            {
              question: 'Quelle est la difference entre le few-shot statique et le few-shot dynamique ?',
              options: [
                'Le statique utilise 2 exemples, le dynamique en utilise 10',
                'Le statique a des exemples codes en dur, le dynamique selectionne les plus pertinents par recherche semantique',
                'Le dynamique change les exemples aleatoirement',
                'Il n\'y a pas de difference, c\'est la meme chose',
              ],
              correctIndex: 1,
              explanation: 'Le few-shot dynamique selectionne les exemples les plus similaires a la requete courante via la recherche semantique (embeddings), au lieu d\'utiliser toujours les memes exemples fixes.',
            },
            {
              question: 'Dans le pattern RAG, que signifie "Retrieval" ?',
              options: [
                'Reentrainer le modele sur de nouvelles donnees',
                'Recuperer les documents pertinents depuis une base de connaissances avant la generation',
                'Sauvegarder la reponse du modele',
                'Traduire la question en anglais',
              ],
              correctIndex: 1,
              explanation: 'Le "R" de RAG = Retrieval : on cherche et recupere les documents pertinents dans une base vectorielle avant de les injecter dans le prompt pour la generation.',
            },
            {
              question: 'Combien d\'extraits un bon systeme RAG devrait-il injecter dans le prompt ?',
              options: [
                'Tous les documents de la base',
                '1 seul, le plus pertinent',
                '3 a 5 extraits hautement pertinents',
                'Au moins 20 pour couvrir tous les cas',
              ],
              correctIndex: 2,
              explanation: '3 a 5 extraits hautement pertinents est le sweet spot. Trop peu risque de manquer une info cle. Trop dilue le contexte et peut confondre le modele.',
            },
            {
              question: 'Quelle technologie Freenzy utilise-t-il pour la recherche vectorielle dans le RAG ?',
              options: [
                'Elasticsearch',
                'pgvector (extension PostgreSQL)',
                'MongoDB Atlas Search',
                'Pinecone',
              ],
              correctIndex: 1,
              explanation: 'Freenzy utilise pgvector, l\'extension PostgreSQL qui stocke les embeddings et effectue des recherches de similarite directement dans la base de donnees principale.',
            },
          ],
          xpReward: 45,
        },
      ],
      passingScore: 60,
      xpReward: 115,
      badgeEmoji: '\u{1F4DA}',
      badgeName: 'RAG Master',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Temperature et sampling
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m4',
      title: 'Temperature et sampling',
      emoji: '\u{1F321}\u{FE0F}',
      description: 'Comprends les parametres de generation : temperature, top_p, top_k et comment ils influencent les reponses.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m4-l1',
          title: 'Temperature, top_p et top_k expliques',
          duration: '4 min',
          type: 'text',
          content: `On entre dans la partie technique — mais pas de panique, on va rester concret. Quand tu envoies un prompt a un LLM, le modele ne choisit pas "la" bonne reponse. Il calcule une probabilite pour chaque token (mot, ponctuation, espace) qui pourrait venir ensuite. Les parametres de sampling determinent comment il fait son choix parmi ces probabilites. Et ca change radicalement le resultat.

La temperature est le parametre le plus important. Elle controle le degre d'aleatoire dans le choix des tokens. Techniquement, elle "aplatit" ou "accentue" la distribution de probabilites.

Temperature 0 : le modele choisit toujours le token le plus probable. Les reponses sont deterministes (quasi identiques a chaque fois), factuelles, previsibles. Parfait pour l'extraction de donnees, la classification, les calculs.

Temperature 0.3-0.5 : un leger aleatoire. Les reponses restent coherentes mais avec des variations naturelles. Ideal pour le support client, la redaction professionnelle, les syntheses.

Temperature 0.7-0.8 : plus de creativite. Le modele explore des formulations et des idees moins evidentes. Bon pour le brainstorming, la creation de contenu, les slogans.

Temperature 1.0+ : maximum de creativite (et de risque). Les reponses peuvent etre surprenantes, originales... ou incoherentes. Reserve a la generation poetique, artistique, ou quand tu veux volontairement des resultats inattendus.

Le top_p (aussi appele nucleus sampling) est complementaire. Au lieu de fixer un niveau d'aleatoire, il dit au modele : "Choisis parmi les tokens dont la probabilite cumulee atteint ce seuil." Un top_p de 0.9 signifie que le modele considere les tokens les plus probables qui representent ensemble 90% de la probabilite totale. Ca exclut automatiquement les choix tres improbables.

Le top_k est plus simple : il limite le choix aux K tokens les plus probables. Un top_k de 40 signifie que le modele choisit parmi les 40 meilleurs candidats, point final. C'est un filtre brut mais efficace.

En pratique, tu n'as presque jamais besoin d'ajuster top_p et top_k manuellement. La temperature suffit dans 95% des cas. La regle : commence avec la temperature par defaut (generalement 0.7 ou 1.0 selon le modele), puis ajuste en fonction de tes resultats. Trop creatif ? Baisse la temperature. Trop repetitif ? Monte-la.

Dans Freenzy, chaque agent a une temperature predefinie adaptee a sa mission. L'agent Comptable tourne a 0.1 (precision maximale), l'agent Marketing a 0.7 (creativite equilibree), et l'agent Studio Creatif a 0.9 (maximum de creativite).`,
          xpReward: 30,
        },
        {
          id: 'pn2-m4-l2',
          title: 'Jeu : Classe les temperatures par cas d\'usage',
          duration: '3 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Classe ces cas d\'usage du plus faible au plus eleve en temperature ideale (de 0 a 1.0) :',
            items: [
              { id: 'temp-1', label: 'Extraction de donnees structurees depuis un PDF', correctPosition: 1 },
              { id: 'temp-2', label: 'Classification d\'emails (spam / pas spam)', correctPosition: 2 },
              { id: 'temp-3', label: 'Redaction d\'un email professionnel au client', correctPosition: 3 },
              { id: 'temp-4', label: 'Synthese d\'un rapport de reunion', correctPosition: 4 },
              { id: 'temp-5', label: 'Brainstorming de noms pour un nouveau produit', correctPosition: 5 },
              { id: 'temp-6', label: 'Ecriture d\'un poeme creatif', correctPosition: 6 },
            ],
            explanations: [
              'Extraction de donnees : temperature ~0 (precision maximale, zero creativite)',
              'Classification : temperature ~0.1 (decision factuelle, quasi-deterministe)',
              'Email professionnel : temperature ~0.4 (naturel mais cadre)',
              'Synthese de reunion : temperature ~0.5 (fidelite au contenu avec formulation fluide)',
              'Brainstorming : temperature ~0.8 (explorer des idees divergentes)',
              'Poesie creative : temperature ~1.0 (maximum d\'originalite et de surprise)',
            ],
          },
          content: 'Classe les cas d\'usage par temperature ideale, du plus bas au plus eleve.',
          xpReward: 35,
        },
        {
          id: 'pn2-m4-l3',
          title: 'Quiz — Temperature et sampling',
          duration: '3 min',
          type: 'quiz',
          content: 'Teste ta comprehension des parametres de generation.',
          quizQuestions: [
            {
              question: 'A temperature 0, que se passe-t-il ?',
              options: [
                'Le modele refuse de repondre',
                'Le modele choisit toujours le token le plus probable (quasi-deterministe)',
                'Les reponses sont plus creatives',
                'Le modele utilise moins de tokens',
              ],
              correctIndex: 1,
              explanation: 'A temperature 0, le modele selectionne systematiquement le token avec la plus haute probabilite, rendant les reponses quasi identiques a chaque appel.',
            },
            {
              question: 'Que fait le parametre top_p (nucleus sampling) ?',
              options: [
                'Il limite le nombre de tokens dans la reponse',
                'Il selectionne les tokens dont la probabilite cumulee atteint un seuil donne',
                'Il choisit un paragraphe aleatoire',
                'Il definit la vitesse de generation',
              ],
              correctIndex: 1,
              explanation: 'Le top_p filtre les tokens en ne gardant que ceux dont la probabilite cumulee atteint le seuil fixe (ex: 0.9 = 90%), excluant automatiquement les choix tres improbables.',
            },
            {
              question: 'Quelle temperature est ideale pour un agent comptable dans Freenzy ?',
              options: [
                '0.9 — pour explorer des solutions creatives',
                '0.5 — equilibre standard',
                '0.1 — precision maximale',
                '1.0 — diversite maximale',
              ],
              correctIndex: 2,
              explanation: 'Un agent comptable a besoin de precision maximale et de resultats reproductibles. Temperature 0.1 minimise l\'aleatoire tout en gardant un minimum de fluidite naturelle.',
            },
            {
              question: 'En pratique, combien de parametres de sampling faut-il generalement ajuster ?',
              options: [
                'Les 3 (temperature, top_p, top_k) systematiquement',
                'Seulement la temperature — ca suffit dans 95% des cas',
                'Aucun, les defauts sont toujours parfaits',
                'Uniquement top_k',
              ],
              correctIndex: 1,
              explanation: 'La temperature seule suffit dans 95% des cas. Top_p et top_k sont des outils d\'ajustement fin rarement necessaires en pratique courante.',
            },
          ],
          xpReward: 45,
        },
      ],
      passingScore: 60,
      xpReward: 110,
      badgeEmoji: '\u{1F321}\u{FE0F}',
      badgeName: 'Thermostat IA',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Extended Thinking
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m5',
      title: 'Extended Thinking',
      emoji: '\u{1F9D0}',
      description: 'Decouvre le mode de reflexion approfondie de Claude et quand l\'utiliser.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m5-l1',
          title: 'Quand et comment utiliser Extended Thinking',
          duration: '4 min',
          type: 'text',
          content: `L'Extended Thinking, c'est probablement la fonctionnalite la plus puissante et la moins connue des LLM modernes. C'est le mode ou le modele "reflechit a voix haute" avant de donner sa reponse finale. Et ca change completement la qualite des resultats sur les taches complexes.

Comment ca marche ? Quand Extended Thinking est active, le modele genere d'abord un bloc de reflexion interne — une sorte de brouillon mental ou il decompose le probleme, explore differentes approches, identifie les pieges et structure son raisonnement. Ce bloc peut faire des centaines ou des milliers de tokens. Ensuite seulement, il produit la reponse finale, qui beneficie de toute cette reflexion prealable.

C'est comparable a la difference entre un expert qui repond du tac au tac et un expert qui prend 5 minutes pour reflechir avant de parler. Les deux sont competents, mais le second produit une reponse plus nuancee, plus complete et plus fiable.

Dans Freenzy, l'Extended Thinking est utilise par les agents L3, notamment l'assistant DG (Directeur General). Quand tu lui demandes une analyse strategique — par exemple "Quels sont les risques de lancer ce produit sur le marche belge ?" — il active le mode reflexion approfondie. Tu verras un indicateur "Reflexion en cours..." pendant qu'il travaille, puis une reponse structuree et argumentee.

Quand l'utiliser ? Pour les analyses complexes qui necessitent de croiser plusieurs facteurs. Pour les problemes de logique ou de mathematiques ou une erreur de raisonnement est couteuse. Pour la planification strategique avec de multiples contraintes. Pour la revision critique d'un document important. Et pour toute situation ou tu preferes une reponse reflechie plutot que rapide.

Quand ne PAS l'utiliser ? Pour les questions simples et factuelles ("Quel est le SIREN de l'entreprise X ?"). Pour la redaction routiniere (emails standards, descriptions produit). Pour les taches de formatage ou de conversion. Et quand la vitesse de reponse est critique.

Le budget tokens est un concept cle. Tu peux definir combien de tokens le modele peut utiliser pour sa reflexion interne. Un budget de 5 000 tokens convient pour la plupart des analyses. Un budget de 10 000 a 20 000 tokens est reserve aux problemes vraiment complexes (strategie multi-marche, audit legal, analyse financiere detaillee). Plus le budget est eleve, plus la reflexion est approfondie — mais aussi plus la reponse prend du temps et consomme de credits.

Le piege classique : activer Extended Thinking pour tout. C'est comme prendre un camion pour aller chercher le pain. L'Extended Thinking est un outil puissant, mais il doit etre reserve aux situations qui le justifient. Dans Freenzy, le routage automatique (L1/L2/L3) gere ca pour toi — mais si tu construis tes propres workflows, garde cette regle en tete.`,
          xpReward: 30,
        },
        {
          id: 'pn2-m5-l2',
          title: 'Exercice : Avec et sans Extended Thinking',
          duration: '3 min',
          type: 'exercise',
          exercisePrompt: `Compare une reponse avec et sans Extended Thinking sur un probleme qui merite vraiment de la reflexion approfondie.

Voici la situation : Tu es le fondateur d'une startup SaaS B2B (facturation en ligne). Tu as 500 clients, 80% en France et 20% en Belgique. Ton concurrent principal vient de lever 10M euros et annonce un pricing agressif a -40%. Ton MRR actuel est de 45 000 euros.

Question strategique : "Comment reagir a cette baisse de prix concurrentielle sans sacrifier ma marge ?"

Etape 1 — Ecris un prompt SANS Extended Thinking. Formule une demande directe et observe le type de reponse que tu obtiendrais (reponse rapide, conseils generiques).

Etape 2 — Ecris un prompt AVEC Extended Thinking. Ajoute les instructions qui declenchent une reflexion approfondie :
- Demande explicitement d'analyser le probleme sous plusieurs angles
- Fournis les donnees chiffrees pertinentes
- Demande de considerer les risques de chaque option
- Specifie que tu veux un plan d'action priorise avec timeline

Etape 3 — Decris en 3-5 phrases les differences que tu attends entre les deux reponses.

Bonus : estime le budget tokens de reflexion ideal pour ce type de probleme.`,
          content: 'Compare la qualite des reponses avec et sans Extended Thinking sur un probleme strategique.',
          xpReward: 40,
        },
        {
          id: 'pn2-m5-l3',
          title: 'Quiz — Extended Thinking',
          duration: '3 min',
          type: 'quiz',
          content: 'Teste ta comprehension de l\'Extended Thinking.',
          quizQuestions: [
            {
              question: 'Que fait l\'Extended Thinking concretement ?',
              options: [
                'Il accelere la generation de texte',
                'Le modele genere un bloc de reflexion interne avant de produire la reponse finale',
                'Il augmente la fenetre de contexte',
                'Il connecte le modele a internet',
              ],
              correctIndex: 1,
              explanation: 'L\'Extended Thinking genere d\'abord un "brouillon mental" ou le modele decompose le probleme et structure son raisonnement, puis il produit une reponse finale enrichie par cette reflexion.',
            },
            {
              question: 'Quel agent Freenzy utilise l\'Extended Thinking en mode L3 ?',
              options: [
                'L\'assistant Marketing',
                'L\'assistant Comptable',
                'L\'assistant DG (Directeur General)',
                'Tous les agents sans exception',
              ],
              correctIndex: 2,
              explanation: 'L\'assistant DG (L3 Opus) utilise l\'Extended Thinking pour les analyses strategiques. Les agents L1 et L2 utilisent des modeles plus rapides pour les taches courantes.',
            },
            {
              question: 'Quel budget tokens de reflexion est adapte pour la plupart des analyses ?',
              options: [
                '100 tokens',
                '500 tokens',
                '5 000 tokens',
                '100 000 tokens',
              ],
              correctIndex: 2,
              explanation: 'Un budget de 5 000 tokens convient pour la majorite des analyses. Les budgets de 10 000 a 20 000 tokens sont reserves aux problemes vraiment complexes (strategie multi-marche, audit legal).',
            },
            {
              question: 'Dans quel cas ne faut-il PAS utiliser l\'Extended Thinking ?',
              options: [
                'Une analyse strategique multi-facteurs',
                'Une revision critique d\'un contrat',
                'Un simple email de confirmation de rendez-vous',
                'Un plan de lancement produit sur 3 marches',
              ],
              correctIndex: 2,
              explanation: 'Un email de confirmation est une tache simple et routiniere. L\'Extended Thinking serait du gaspillage de tokens et de temps. Il est reserve aux taches qui necessitent une reflexion approfondie.',
            },
          ],
          xpReward: 45,
        },
      ],
      passingScore: 60,
      xpReward: 115,
      badgeEmoji: '\u{1F9D0}',
      badgeName: 'Deep Thinker',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Evaluer ses prompts
    // -----------------------------------------------------------------------
    {
      id: 'pn2-m6',
      title: 'Evaluer ses prompts',
      emoji: '\u{1F4CA}',
      description: 'Metriques, benchmarking, iteration et A/B testing pour ameliorer systematiquement tes prompts.',
      duration: '10 min',
      lessons: [
        {
          id: 'pn2-m6-l1',
          title: 'Metriques, benchmarking et iteration',
          duration: '4 min',
          type: 'text',
          content: `Tu as appris a construire des prompts puissants — chaining, system prompts, RAG, temperature, Extended Thinking. Mais comment savoir si ton prompt est vraiment bon ? Comment l'ameliorer systematiquement plutot qu'au feeling ? Bienvenue dans le monde de l'evaluation de prompts.

Le probleme numero un du prompt engineering amateur : on teste un prompt 2-3 fois, ca semble marcher, et on passe a autre chose. Mais un prompt qui marche 3 fois sur 3 peut echouer 2 fois sur 10. Et en production, avec des centaines d'utilisateurs, ces 20% d'echec deviennent un vrai probleme.

La premiere etape, c'est de definir des metriques claires. Pour chaque prompt, tu dois pouvoir repondre a : "Comment est-ce que je mesure si la reponse est bonne ?" Ca depend du cas d'usage. Pour une classification (spam/pas spam), c'est la precision et le rappel. Pour une redaction, c'est la conformite au tone of voice, la longueur, et l'absence d'hallucination. Pour une extraction de donnees, c'est l'exactitude des valeurs extraites.

Le benchmarking, c'est l'art de tester systematiquement. Tu crees un jeu de test : 20 a 50 cas representatifs avec les entrees et les sorties attendues. Tu passes chaque cas dans ton prompt et tu notes le resultat selon tes metriques. Ca te donne un score de base — ton baseline. Chaque modification du prompt est ensuite evaluee sur le meme jeu de test. Si le score monte, tu gardes. Sinon, tu reviens en arriere.

L'iteration est le coeur du processus. Le cycle : observer les echecs, formuler une hypothese ("le prompt echoue quand l'email est en anglais"), modifier le prompt, retester. En moyenne, il faut 3 a 7 iterations pour passer d'un prompt "correct" a un prompt "excellent". La patience paie enormement.

Les erreurs a tracker en priorite : les hallucinations (le modele invente des faits), les refus injustifies (le modele refuse de repondre alors qu'il devrait), les problemes de format (JSON mal forme, longueur excessive), et les incoherences logiques. Chaque type d'erreur a des solutions specifiques — par exemple, les hallucinations se reduisent en ajoutant du contexte RAG et en demandant explicitement "reponds uniquement a partir des informations fournies".

Un outil simple mais puissant : le tableau de suivi. Pour chaque version de prompt, note la date, la modification apportee, le score sur le jeu de test, et les observations qualitatives. En quelques semaines, tu auras une vraie base de connaissances sur ce qui marche et ne marche pas pour ton cas d'usage specifique.`,
          xpReward: 30,
        },
        {
          id: 'pn2-m6-l2',
          title: 'A/B testing de prompts',
          duration: '3 min',
          type: 'text',
          content: `L'A/B testing de prompts, c'est appliquer la methode scientifique a tes prompts. Tu as deux versions — la version A (ton prompt actuel) et la version B (ta modification) — et tu les compares objectivement sur les memes donnees. Pas d'intuition, pas de "je trouve que B est mieux". Des chiffres.

Le setup est simple. Tu prends ton jeu de test (les 20-50 cas qu'on a vus dans la lecon precedente). Tu passes chaque cas dans la version A ET dans la version B. Tu notes les resultats selon tes metriques. Tu compares. Si B est significativement meilleur, tu l'adoptes. Sinon, tu gardes A et tu essaies une autre hypothese.

Le mot cle : "significativement". Si A obtient 82% et B obtient 84%, est-ce vraiment mieux ou juste du bruit statistique ? Avec 20 cas de test, une difference de 2% n'est pas significative. Il te faut soit plus de cas de test, soit une difference plus marquee. En pratique, vise une amelioration d'au moins 5 a 10% pour considerer qu'un changement est reel.

Les variables a tester en A/B sont nombreuses. Le phrasing : "Reponds en 3 points" vs "Structure ta reponse en exactement 3 sections". Le format demande : markdown vs JSON vs texte libre. La presence d'exemples : 0-shot vs 3-shot. La formulation du persona : expert formel vs coach bienveillant. L'ordre des instructions : contexte d'abord puis question, ou question d'abord puis contexte.

Un piege classique : tester trop de changements en meme temps. Si tu modifies le persona ET le format ET les exemples entre A et B, tu ne sais pas quel changement a cause l'amelioration (ou la regression). Teste une seule variable a la fois — c'est plus lent, mais tu comprends vraiment ce qui fonctionne.

Dans Freenzy, ce processus est ce qui rend les agents de plus en plus performants. Chaque agent a un system prompt qui a ete itere des dizaines de fois, teste sur des cas reels, et affine selon les retours. L'assistant Commercial, par exemple, est passe par 15 versions de system prompt avant d'atteindre son niveau actuel de pertinence.

Conseil final : garde un "journal de prompts". Note chaque version testee, les resultats, et tes apprentissages. C'est ton asset le plus precieux en prompt engineering — une base de connaissances personnelle sur ce qui fonctionne pour tes cas d'usage specifiques.`,
          xpReward: 25,
        },
        {
          id: 'pn2-m6-l3',
          title: 'Quiz — Evaluation de prompts',
          duration: '3 min',
          type: 'quiz',
          content: 'Teste ta comprehension de l\'evaluation et de l\'amelioration de prompts.',
          quizQuestions: [
            {
              question: 'Pourquoi tester un prompt 3 fois ne suffit-il pas ?',
              options: [
                'Parce que les LLM changent tous les jours',
                'Un prompt qui marche 3/3 peut echouer 2 fois sur 10 en production',
                'Parce qu\'il faut toujours tester au moins 100 fois',
                'Ca suffit en realite, c\'est une fausse croyance',
              ],
              correctIndex: 1,
              explanation: 'Les LLM sont probabilistes — un prompt qui semble parfait sur 3 essais peut avoir un taux d\'echec de 20% sur un echantillon plus large. Le benchmarking systematique (20-50 cas) revele ces faiblesses.',
            },
            {
              question: 'Quelle est la regle d\'or de l\'A/B testing de prompts ?',
              options: [
                'Toujours tester la version la plus longue',
                'Modifier une seule variable a la fois',
                'Utiliser un modele different pour chaque version',
                'Tester uniquement les cas ou A echoue',
              ],
              correctIndex: 1,
              explanation: 'Tester une seule variable a la fois (phrasing OU format OU exemples) permet d\'identifier precisement quel changement cause l\'amelioration ou la regression.',
            },
            {
              question: 'Combien d\'iterations faut-il en moyenne pour passer d\'un prompt "correct" a "excellent" ?',
              options: [
                '1 seule iteration bien pensee',
                '3 a 7 iterations',
                '20 a 50 iterations',
                'Plus de 100 iterations',
              ],
              correctIndex: 1,
              explanation: 'En moyenne, 3 a 7 iterations du cycle observer-hypothese-modifier-retester suffisent pour passer de "correct" a "excellent". La cle est d\'etre methodique, pas d\'iterer a l\'infini.',
            },
            {
              question: 'Quel type d\'erreur se reduit le mieux avec du contexte RAG ?',
              options: [
                'Les erreurs de format (JSON mal forme)',
                'Les hallucinations (le modele invente des faits)',
                'Les refus injustifies',
                'Les reponses trop longues',
              ],
              correctIndex: 1,
              explanation: 'Les hallucinations se reduisent en fournissant du contexte factuel via RAG et en ajoutant l\'instruction "reponds uniquement a partir des informations fournies". Le modele a alors des faits reels sur lesquels s\'appuyer.',
            },
            {
              question: 'Combien de versions de system prompt l\'assistant Commercial de Freenzy a-t-il traverse ?',
              options: [
                '2-3 versions',
                '5 versions',
                '15 versions',
                '50+ versions',
              ],
              correctIndex: 2,
              explanation: 'L\'assistant Commercial est passe par 15 iterations de son system prompt, chacune testee sur des cas reels et affinee selon les retours. C\'est le processus d\'amelioration continue en action.',
            },
          ],
          xpReward: 50,
        },
      ],
      passingScore: 60,
      xpReward: 105,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Evaluateur Pro',
    },
  ],
};
