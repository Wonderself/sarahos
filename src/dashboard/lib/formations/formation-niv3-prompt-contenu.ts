// =============================================================================
// Freenzy.io — Formations Niveau 3 : Prompt Master + Content Director
// 2 parcours expert, 6 modules x 3 lessons chacun = 36 lessons, 2000 XP total
// =============================================================================

import type { FormationParcours } from './formation-data';

// =============================================================================
// Parcours 1 — Prompt Architect Master (Expert)
// =============================================================================

export const parcoursPromptMaster: FormationParcours = {
  id: 'prompt-master-niv3',
  title: 'Prompt Architect Master',
  emoji: '\u{1F3AF}',
  description: 'Le sommet du prompt engineering : frameworks avances, fine-tuning de prompts, evaluation automatisee, architectures multi-prompts, optimisation tokens/couts et cas d\'excellence reels.',
  category: 'ia',
  subcategory: 'prompt-engineering',
  level: 'expert',
  levelLabel: 'Expert',
  color: '#F59E0B',
  diplomaTitle: 'Prompt Architect Master',
  diplomaSubtitle: 'Certification Freenzy.io — Prompt Engineering Expert',
  totalDuration: '1h30',
  totalXP: 1000,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Frameworks de prompts avances
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m1',
      title: 'Frameworks de prompts avances',
      emoji: '\u{1F3D7}\uFE0F',
      description: 'Maitrise les frameworks professionnels utilises par les meilleurs prompt engineers au monde.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m1-l1',
          title: 'CRISP, RACE, RISEN : les frameworks qui changent tout',
          duration: '5 min',
          type: 'text',
          content: `Tu as deja un excellent niveau en prompting — bravo ! \u{1F389} Maintenant on passe aux frameworks utilises par les pros en entreprise. Ces methodes structurees transforment un bon prompt en prompt d'elite.

Commençons par CRISP : Contexte, Role, Instructions, Style, Public. C'est le framework le plus polyvalent. Tu definis d'abord le contexte metier precis, puis le role exact de l'IA (pas juste "tu es un expert" — on veut "tu es un directeur marketing B2B SaaS avec 15 ans d'experience dans le secteur fintech"). Les instructions sont numerotees et hierarchisees. Le style precise le ton et le format. Et le public cible influence tout le reste.

Ensuite RACE : Role, Action, Contexte, Execution. Plus compact, ideal pour les taches operationnelles. Tu definis qui est l'IA, ce qu'elle doit faire, dans quel cadre, et comment elle doit livrer le resultat. RACE excelle pour les prompts repetitifs qu'on va industrialiser.

RISEN va encore plus loin : Role, Instructions, Steps, End-goal, Narrowing. Le "Narrowing" est la cle — tu ajoutes des contraintes qui eliminent les reponses generiques. Par exemple : "Ne mentionne JAMAIS de concurrents par nom" ou "Chaque paragraphe doit contenir au moins une donnee chiffree verifiable".

La vraie puissance ? Combiner ces frameworks. Chez Freenzy, nos agents utilisent des prompts hybrides CRISP+RISEN : le contexte CRISP pour le cadrage, les steps RISEN pour l'execution, et le narrowing pour la qualite. C'est exactement cette approche qui permet a l'agent Commercial de produire des propositions commerciales quasi-finales en un seul appel.

Le secret des meilleurs prompt engineers : ils ne choisissent pas un framework au hasard. Ils matchent le framework a la complexite de la tache. RACE pour l'operationnel, CRISP pour la creation, RISEN pour l'analytique. \u{1F4A1}`,
          xpReward: 30,
        },
        {
          id: 'pm3-m1-l2',
          title: 'Exercice : Construis un prompt RISEN complet',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Tu dois creer un prompt RISEN complet pour la tache suivante : generer un audit SEO technique d'un site web e-commerce.

Remplis chaque composante du framework :

1. **Role** — Definis precisement qui est l'IA (experience, specialite, perspective)
2. **Instructions** — 3 a 5 instructions claires et numerotees
3. **Steps** — Les etapes exactes que l'IA doit suivre, dans l'ordre
4. **End-goal** — Le livrable final attendu (format, longueur, structure)
5. **Narrowing** — Au moins 3 contraintes qui eliminent les reponses generiques

Bonus : ajoute des exemples de "bonne reponse" vs "mauvaise reponse" pour calibrer l'IA.

Ton prompt doit etre directement utilisable — copier-coller dans Freenzy et obtenir un resultat professionnel.`,
          content: 'Mets en pratique le framework RISEN sur un cas reel d\'audit SEO.',
          xpReward: 40,
        },
        {
          id: 'pm3-m1-l3',
          title: 'Quiz — Frameworks de prompts',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta maitrise des frameworks de prompts avances.',
          quizQuestions: [
            {
              question: 'Dans le framework RISEN, que represente le "N" (Narrowing) ?',
              options: [
                'Le nombre de mots maximum de la reponse',
                'Des contraintes specifiques qui eliminent les reponses generiques',
                'La note minimale de qualite attendue',
                'Le nombre de prompts a enchainer',
              ],
              correctIndex: 1,
              explanation: 'Le Narrowing ajoute des contraintes precises (interdictions, obligations, formats) qui forcent l\'IA a sortir des reponses generiques et a produire un resultat cible et professionnel.',
            },
            {
              question: 'Quel framework est le plus adapte pour des taches operationnelles repetitives ?',
              options: [
                'RISEN (trop complexe pour du repetitif)',
                'CRISP (trop de composantes)',
                'RACE (compact et orienté action)',
                'Aucun framework n\'est adapte au repetitif',
              ],
              correctIndex: 2,
              explanation: 'RACE (Role, Action, Contexte, Execution) est le plus compact et le plus adapte aux prompts operationnels qu\'on va industrialiser et reutiliser frequemment.',
            },
            {
              question: 'Pourquoi definir "tu es un directeur marketing B2B SaaS fintech" est mieux que "tu es un expert marketing" ?',
              options: [
                'Ca utilise plus de tokens donc c\'est plus precis',
                'Le modele genere un vocabulaire, des references et des recommandations specifiques au secteur',
                'Ca n\'a aucune difference en pratique',
                'Ca evite les hallucinations completement',
              ],
              correctIndex: 1,
              explanation: 'Un role hyper-specifique active les connaissances du modele liees a ce secteur precis, produisant du vocabulaire metier, des KPI pertinents et des recommandations adaptees au contexte B2B SaaS.',
            },
            {
              question: 'Quelle combinaison de frameworks est utilisee par les agents Freenzy ?',
              options: [
                'RACE uniquement',
                'CRISP + RISEN hybride',
                'Un framework proprietaire secret',
                'Aucun framework, juste du prompt libre',
              ],
              correctIndex: 1,
              explanation: 'Les agents Freenzy utilisent une approche hybride CRISP+RISEN : le contexte CRISP pour le cadrage general, les steps RISEN pour l\'execution, et le narrowing pour garantir la qualite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F3D7}\uFE0F',
      badgeName: 'Framework Architect',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Fine-tuning de prompts
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m2',
      title: 'Fine-tuning de prompts',
      emoji: '\u{1F527}',
      description: 'Apprends a affiner iterativement tes prompts pour atteindre une qualite de sortie quasi parfaite.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m2-l1',
          title: 'L\'art de l\'iteration : du brouillon au prompt parfait',
          duration: '5 min',
          type: 'text',
          content: `Le fine-tuning de prompts, c'est l'art d'affiner iterativement un prompt jusqu'a obtenir exactement le resultat souhaite. Personne — meme les meilleurs — n'ecrit un prompt parfait du premier coup. La difference entre un debutant et un expert ? L'expert a une methode d'iteration systematique. \u{1F504}

La methode en 5 passes. Passe 1 : le brouillon. Tu ecris ton prompt avec les grandes lignes — role, tache, format attendu. Tu le testes et tu observes ce qui manque. Passe 2 : le cadrage. Tu ajoutes des contraintes pour eliminer les defauts observes. La reponse est trop longue ? Ajoute une limite. Trop vague ? Ajoute des exemples. Trop formelle ? Precise le ton. Passe 3 : les edge cases. Tu testes avec des inputs limites — que se passe-t-il avec une question ambigue ? Un input vide ? Un sujet sensible ? Tu ajoutes des garde-fous. Passe 4 : l'optimisation. Tu reduis le prompt au minimum necessaire — chaque mot doit justifier sa presence. Les instructions redondantes sont supprimees. Passe 5 : la validation. Tu testes 10 fois avec des inputs varies et tu mesures la constance.

Le piege classique : sur-specifier. Un prompt trop contraint produit des reponses rigides et artificielles. Il faut trouver le sweet spot entre liberte creative et cadrage precis. La regle : si 8 reponses sur 10 sont bonnes, ton prompt est pret. Viser 10/10 mene souvent a un prompt trop rigide qui echoue sur des cas imprevus.

Technique avancee : le "prompt diff". Tu gardes un historique de tes versions et tu notes exactement quel changement a produit quelle amelioration. Apres quelques mois, tu developpes une intuition qui accelere considerablement le processus. Chez Freenzy, chaque prompt d'agent a traverse en moyenne 12 iterations avant d'atteindre la production. \u{1F4CA}

Le fine-tuning n'est jamais termine — c'est un processus continu. Les meilleurs prompts evoluent avec les mises a jour des modeles et les retours utilisateurs.`,
          xpReward: 30,
        },
        {
          id: 'pm3-m2-l2',
          title: 'Exercice : Affine ce prompt en 3 iterations',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Voici un prompt brouillon mediocre :

"Ecris-moi un email professionnel pour relancer un client qui n'a pas repondu."

Ton travail : affine ce prompt en 3 iterations documentees.

**Iteration 1 — Cadrage** : Ajoute le role, le contexte metier, le ton et le format attendu.

**Iteration 2 — Edge cases** : Gere les cas limites — et si le client a deja ete relance 3 fois ? Et si c'est un gros compte ? Et si la derniere interaction etait negative ?

**Iteration 3 — Optimisation** : Reduis au minimum necessaire tout en gardant la qualite. Elimine toute instruction redondante.

Pour chaque iteration :
1. Ecris le prompt complet
2. Explique ce que tu as change et pourquoi
3. Evalue la qualite sur 10

L'objectif : passer d'un prompt 3/10 a un prompt 8+/10 en 3 etapes.`,
          content: 'Pratique l\'iteration systematique sur un prompt reel.',
          xpReward: 40,
        },
        {
          id: 'pm3-m2-l3',
          title: 'Quiz — Fine-tuning',
          duration: '5 min',
          type: 'quiz',
          content: 'Teste ta maitrise du fine-tuning de prompts.',
          quizQuestions: [
            {
              question: 'Combien d\'iterations en moyenne traverse un prompt d\'agent Freenzy avant la production ?',
              options: [
                '2 a 3 iterations',
                '5 a 7 iterations',
                '12 iterations en moyenne',
                '50 iterations ou plus',
              ],
              correctIndex: 2,
              explanation: 'Chaque prompt d\'agent Freenzy traverse en moyenne 12 iterations avant d\'atteindre la qualite requise pour la production. C\'est un processus serieux et methodique.',
            },
            {
              question: 'Qu\'est-ce que le piege de la sur-specification ?',
              options: [
                'Utiliser trop de tokens dans le prompt',
                'Un prompt trop contraint qui produit des reponses rigides et echoue sur les cas imprevus',
                'Donner trop d\'exemples au modele',
                'Utiliser plusieurs frameworks en meme temps',
              ],
              correctIndex: 1,
              explanation: 'La sur-specification mene a des prompts trop rigides. La regle : si 8 reponses sur 10 sont bonnes, ton prompt est pret. Viser la perfection absolue est contre-productif.',
            },
            {
              question: 'Qu\'est-ce que la technique du "prompt diff" ?',
              options: [
                'Comparer les reponses de deux modeles differents',
                'Garder un historique des versions et noter quel changement a produit quelle amelioration',
                'Utiliser git pour versionner ses prompts',
                'Calculer la difference de tokens entre deux prompts',
              ],
              correctIndex: 1,
              explanation: 'Le prompt diff consiste a documenter chaque changement et son impact. Apres quelques mois, tu developpes une intuition qui accelere considerablement le processus d\'affinage.',
            },
            {
              question: 'Dans la methode en 5 passes, a quoi sert la passe 3 (edge cases) ?',
              options: [
                'A reduire la taille du prompt',
                'A ajouter des exemples positifs',
                'A tester avec des inputs limites et ajouter des garde-fous',
                'A valider la constance des reponses',
              ],
              correctIndex: 2,
              explanation: 'La passe 3 teste les situations limites (input vide, question ambigue, sujet sensible) et ajoute des garde-fous pour que le prompt reste robuste dans tous les cas.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F527}',
      badgeName: 'Prompt Tuner',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Evaluation automatisee des prompts
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m3',
      title: 'Evaluation automatisee',
      emoji: '\u{1F4CB}',
      description: 'Mets en place des systemes d\'evaluation automatique pour mesurer et ameliorer la qualite de tes prompts.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m3-l1',
          title: 'LLM-as-a-judge et metriques de qualite',
          duration: '5 min',
          type: 'text',
          content: `Comment savoir objectivement si ton prompt est bon ? Pas avec ton intuition — avec des metriques automatisees. Bienvenue dans le monde de l'evaluation systematique des prompts. \u{1F4CA}

La technique phare : LLM-as-a-judge. Tu utilises un modele IA pour evaluer les sorties d'un autre modele (ou du meme). Tu definis une grille d'evaluation avec des criteres precis — pertinence (0-5), completude (0-5), clarte (0-5), respect des consignes (0-5) — et tu demandes au "juge" de noter chaque sortie. C'est exactement ce que font les equipes IA de Google, Anthropic et OpenAI en interne.

Concretement, tu crees un prompt d'evaluation : "Tu es un evaluateur expert. Voici la consigne originale : [consigne]. Voici la reponse produite : [reponse]. Note chaque critere de 0 a 5 avec justification." Tu lances ca sur 20 sorties differentes et tu obtiens un score moyen par critere. Un prompt avec un score moyen en dessous de 3.5 doit etre retravaille.

Les metriques complementaires. La constance : sur 10 appels identiques, les reponses sont-elles similaires en qualite ? L'adherence au format : le modele respecte-t-il toujours la structure demandee (JSON, tableau, bullet points) ? La completude : toutes les sous-taches sont-elles traitees ? Le taux de refus : combien de fois le modele refuse ou repond "je ne peux pas" ?

Technique avancee : les test suites. Tu crees un jeu de 10 a 20 inputs de reference avec les reponses attendues (ou au moins les criteres de qualite). A chaque modification du prompt, tu relances la suite complete. C'est du CI/CD pour prompts — et c'est exactement ce que Freenzy utilise pour valider les prompts des agents avant chaque mise a jour.

Un bon systeme d'evaluation transforme le prompt engineering d'un art en science. Tu passes de "je pense que c'est mieux" a "les metriques montrent une amelioration de 23% sur la completude". \u{1F680}`,
          xpReward: 30,
        },
        {
          id: 'pm3-m3-l2',
          title: 'Exercice : Cree ta grille d\'evaluation',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Tu dois creer un systeme d'evaluation automatisee complet pour un prompt qui genere des fiches produit e-commerce.

1. **Grille de notation** — Definis 5 criteres de qualite (nom, description, echelle 0-5, exemple de 0 et de 5)

2. **Prompt d'evaluation** — Ecris le prompt exact que tu enverras au "LLM juge" pour evaluer chaque fiche produit generee

3. **Test suite** — Cree 3 inputs de test avec des difficultes variees :
   - Un produit simple (t-shirt basique)
   - Un produit technique (SSD NVMe)
   - Un produit ambigu (coffret cadeau personnalisable)

4. **Seuils de qualite** — Definis le score minimum acceptable par critere et le score global minimum

5. **Process** — Decris en 3 etapes comment tu utiliserais ce systeme a chaque modification du prompt`,
          content: 'Construis un systeme d\'evaluation complet pour des fiches produit.',
          xpReward: 40,
        },
        {
          id: 'pm3-m3-l3',
          title: 'Quiz — Evaluation automatisee',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta comprehension de l\'evaluation automatisee des prompts.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que le "LLM-as-a-judge" ?',
              options: [
                'Un modele entraine specifiquement pour juger d\'autres modeles',
                'Utiliser un LLM pour evaluer les sorties d\'un autre LLM selon une grille de criteres',
                'Un benchmark standardise comme MMLU ou HumanEval',
                'Un systeme de vote entre plusieurs modeles',
              ],
              correctIndex: 1,
              explanation: 'LLM-as-a-judge consiste a utiliser un modele IA comme evaluateur avec une grille de criteres definis. C\'est la methode standard utilisee par les grandes entreprises IA pour evaluer la qualite des sorties.',
            },
            {
              question: 'Quel score moyen minimum indique qu\'un prompt doit etre retravaille ?',
              options: [
                'En dessous de 1.0',
                'En dessous de 2.5',
                'En dessous de 3.5',
                'En dessous de 4.5',
              ],
              correctIndex: 2,
              explanation: 'Un score moyen en dessous de 3.5 sur 5 indique que le prompt n\'atteint pas un niveau de qualite suffisant et doit etre retravaille.',
            },
            {
              question: 'Qu\'est-ce qu\'une "test suite" pour prompts ?',
              options: [
                'Un ensemble de prompts similaires',
                'Un jeu de 10-20 inputs de reference qu\'on relance a chaque modification pour valider la qualite',
                'Une collection de prompts d\'autres utilisateurs',
                'Un outil de benchmarking commercial',
              ],
              correctIndex: 1,
              explanation: 'Une test suite est un ensemble d\'inputs de reference avec des criteres de qualite definis. On la relance a chaque modification du prompt — c\'est du CI/CD applique aux prompts.',
            },
            {
              question: 'Quelle metrique mesure si le modele respecte toujours la structure demandee ?',
              options: [
                'La pertinence',
                'La constance',
                'L\'adherence au format',
                'Le taux de refus',
              ],
              correctIndex: 2,
              explanation: 'L\'adherence au format mesure si le modele respecte systematiquement la structure demandee (JSON, tableaux, bullet points, etc.). C\'est crucial pour les prompts destines a l\'automatisation.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'Eval Master',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Architectures multi-prompts
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m4',
      title: 'Architectures multi-prompts',
      emoji: '\u{1F3E2}',
      description: 'Conçois des architectures complexes ou plusieurs prompts collaborent pour accomplir des taches sophistiquees.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m4-l1',
          title: 'Orchestration, routing et delegation entre prompts',
          duration: '5 min',
          type: 'text',
          content: `On entre dans le territoire des architectes systeme. Les architectures multi-prompts, c'est quand tu conçois un systeme ou plusieurs prompts specialises collaborent — chacun avec son role, son modele et ses forces. C'est exactement comme ca que Freenzy fonctionne en coulisses. \u{1F3D7}\uFE0F

Le pattern Orchestrateur. Un prompt central recoit la requete de l'utilisateur et decide quel(s) prompt(s) specialise(s) appeler. Chez Freenzy, c'est notre systeme de routing L1/L2/L3. Le routeur analyse la complexite et delegue : Haiku pour les taches simples et rapides, Sonnet pour la redaction et l'analyse, Opus pour la strategie et la reflexion profonde. Le routeur ne fait JAMAIS le travail lui-meme — il delegue toujours.

Le pattern Fan-out/Fan-in. Tu envoies la meme requete a plusieurs prompts specialises en parallele, puis un prompt synthetiseur fusionne les resultats. Exemple : pour une analyse concurrentielle, tu lances 5 prompts en parallele (un par concurrent), puis un 6eme synthetise les resultats en tableau comparatif. Le gain de temps est enorme et la qualite est superieure a un seul prompt qui tente tout.

Le pattern Pipeline. Comme le chaining (niveau 2), mais avec des prompts qui utilisent des modeles differents selon l'etape. L'extraction de donnees brutes par Haiku (rapide, pas cher), l'analyse par Sonnet (precis), la recommandation strategique par Opus (profond). Chaque modele est utilise pour sa force specifique.

Le pattern Critique-Revision. Un prompt genere, un autre critique, puis le premier revise. Tu peux boucler 2-3 fois. C'est la methode la plus efficace pour atteindre une qualite editoriale — le critique identifie les faiblesses que le generateur ne voit pas. Freenzy utilise ce pattern pour la generation de propositions commerciales haut de gamme. \u{2705}

La cle : chaque prompt dans l'architecture doit avoir une responsabilite unique et clairement definie. Si un prompt fait deux choses, decoupe-le.`,
          xpReward: 30,
        },
        {
          id: 'pm3-m4-l2',
          title: 'Exercice : Concois une architecture multi-prompts',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Concois une architecture multi-prompts complete pour un systeme de generation de business plans.

L'utilisateur fournit : le nom de son entreprise, le secteur, et une description en 3 phrases.

Ton architecture doit inclure :

1. **Diagramme** — Dessine (en ASCII art) le flux entre les prompts avec les fleches
2. **Prompt Routeur** — Ecris le prompt qui analyse l'input et decide du parcours
3. **3 Prompts specialises** minimum — Pour chaque prompt :
   - Nom et role
   - Modele recommande (Haiku/Sonnet/Opus) et pourquoi
   - Input attendu et output produit
4. **Prompt Synthetiseur** — Le prompt qui assemble le business plan final
5. **Pattern utilise** — Identifie quel(s) pattern(s) tu combines (orchestrateur, fan-out, pipeline, critique-revision)

Contrainte : le cout total doit rester sous 50 credits Freenzy.`,
          content: 'Concois un systeme multi-prompts complet pour des business plans.',
          xpReward: 40,
        },
        {
          id: 'pm3-m4-l3',
          title: 'Quiz — Architectures multi-prompts',
          duration: '5 min',
          type: 'quiz',
          content: 'Teste ta maitrise des architectures multi-prompts.',
          quizQuestions: [
            {
              question: 'Dans le pattern Orchestrateur, que fait le prompt central ?',
              options: [
                'Il execute toutes les taches lui-meme',
                'Il analyse la requete et delegue aux prompts specialises sans faire le travail',
                'Il traduit la requete en code',
                'Il stocke les resultats en base de donnees',
              ],
              correctIndex: 1,
              explanation: 'Le prompt orchestrateur analyse et route — il ne fait JAMAIS le travail lui-meme. Il delegue toujours a des prompts specialises, comme un chef d\'orchestre qui ne joue d\'aucun instrument.',
            },
            {
              question: 'Quel pattern envoie la meme requete a plusieurs prompts en parallele ?',
              options: [
                'Pattern Pipeline',
                'Pattern Critique-Revision',
                'Pattern Fan-out/Fan-in',
                'Pattern Orchestrateur',
              ],
              correctIndex: 2,
              explanation: 'Le pattern Fan-out/Fan-in distribue la requete a plusieurs prompts specialises en parallele, puis un synthetiseur fusionne les resultats. Ideal pour les analyses multi-angles.',
            },
            {
              question: 'Dans le pattern Pipeline de Freenzy, quel modele est utilise pour l\'extraction de donnees brutes ?',
              options: [
                'Opus (le plus puissant)',
                'Sonnet (le plus equilibre)',
                'Haiku (rapide et economique)',
                'Un modele open-source externe',
              ],
              correctIndex: 2,
              explanation: 'Haiku est utilise pour l\'extraction de donnees brutes car c\'est rapide et peu couteux. Chaque modele est utilise pour sa force : Haiku (vitesse), Sonnet (precision), Opus (profondeur).',
            },
            {
              question: 'Quelle est la regle fondamentale d\'une architecture multi-prompts ?',
              options: [
                'Utiliser le meme modele pour tous les prompts',
                'Limiter a 3 prompts maximum',
                'Chaque prompt doit avoir une responsabilite unique et clairement definie',
                'Toujours boucler au moins 5 fois',
              ],
              correctIndex: 2,
              explanation: 'Le principe de responsabilite unique (Single Responsibility) s\'applique aussi aux prompts. Si un prompt fait deux choses, il faut le decouper en deux prompts specialises.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F3E2}',
      badgeName: 'System Architect',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Optimisation tokens et couts
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m5',
      title: 'Optimisation tokens et couts',
      emoji: '\u{1F4B0}',
      description: 'Reduis tes couts de 50 a 80% sans sacrifier la qualite grace a l\'optimisation avancee des tokens.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m5-l1',
          title: 'Prompt caching, batching et compression intelligente',
          duration: '5 min',
          type: 'text',
          content: `Les tokens, c'est de l'argent. Un prompt non optimise peut couter 3 a 5 fois plus cher qu'un prompt optimise pour le meme resultat. Dans ce module, tu vas apprendre a reduire drastiquement tes couts. \u{1F4B8}

Technique 1 : le prompt caching. Quand une partie de ton prompt ne change jamais (system prompt, instructions, exemples), tu peux utiliser le cache de l'API. Chez Freenzy, le prompt caching represente 89% d'economie sur les appels repetitifs. Le principe : les tokens caches coutent 10x moins cher que les tokens frais. Tu structures tes prompts pour maximiser la partie statique (en debut de prompt) et minimiser la partie dynamique.

Technique 2 : le batching. Au lieu d'envoyer 10 requetes separees de 500 tokens chacune, tu regroupes en 1-2 requetes de 2500 tokens. Le cout marginal par requete baisse, et tu elimines l'overhead de chaque appel. L'API batch d'Anthropic offre 50% de reduction par rapport aux appels individuels. Freenzy utilise BullMQ pour regrouper les taches similaires.

Technique 3 : la compression de contexte. Ton prompt contient-il vraiment des informations utiles a chaque token ? Souvent, on peut compresser le contexte sans perte de qualite. Au lieu de passer un document de 3000 mots, extrais d'abord les passages pertinents (avec un prompt Haiku rapide) et passe seulement ceux-la au prompt principal. Tu reduis le contexte de 80% et la qualite reste identique.

Technique 4 : le routing intelligent de modeles. Pas besoin d'Opus pour formater un JSON ou corriger une faute d'orthographe. Haiku coute 60x moins qu'Opus. La regle : commence toujours par le modele le moins cher, et monte en gamme seulement si la qualite est insuffisante.

Technique 5 : les instructions negatives coutent des tokens. "Ne fais PAS X, ne fais PAS Y, ne fais PAS Z" — 3 instructions negatives que tu peux souvent remplacer par 1 instruction positive bien formulee. "Reponds uniquement avec des donnees factuelles sourcees" est plus court et plus efficace que lister 5 interdictions. \u{1F4A1}`,
          xpReward: 30,
        },
        {
          id: 'pm3-m5-l2',
          title: 'Exercice : Optimise ce prompt couteux',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Voici un prompt non optimise qui coute environ 45 credits par appel. Ton objectif : le reduire a moins de 15 credits sans perte de qualite.

PROMPT ORIGINAL (2800 tokens) :
---
System: Tu es un assistant IA expert en analyse financiere. Tu as 20 ans d'experience en finance d'entreprise. Tu travailles pour une grande banque d'investissement. Tu es tres rigoureux et precis. Tu ne fais jamais d'erreur. Tu ne donnes jamais d'avis personnel. Tu ne fais pas de prediction. Tu n'inventes pas de donnees. Tu restes toujours factuel.

User: Voici le rapport financier complet de l'entreprise XYZ pour l'annee 2024 : [3 pages de texte complet du rapport]. Analyse ce rapport et donne-moi un resume des points cles. Identifie les forces, les faiblesses, les opportunites et les menaces. Propose des recommandations. Formatte le tout en Markdown avec des titres et des bullet points. Ajoute des emojis pour la lisibilite.
---

Applique les 5 techniques du cours :
1. Identifie la partie statique (cacheable) vs dynamique
2. Compresse le contexte du rapport (propose une etape de pre-extraction)
3. Choisis le bon modele pour chaque etape
4. Remplace les instructions negatives par des positives
5. Calcule l'economie estimee en pourcentage`,
          content: 'Optimise un prompt reel pour reduire les couts de 65%+.',
          xpReward: 40,
        },
        {
          id: 'pm3-m5-l3',
          title: 'Quiz — Optimisation tokens',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta maitrise de l\'optimisation des couts.',
          quizQuestions: [
            {
              question: 'Quel pourcentage d\'economie le prompt caching represente-t-il chez Freenzy ?',
              options: [
                '25%',
                '50%',
                '75%',
                '89%',
              ],
              correctIndex: 3,
              explanation: 'Le prompt caching represente 89% d\'economie sur les appels repetitifs chez Freenzy. Les tokens caches coutent environ 10x moins cher que les tokens frais.',
            },
            {
              question: 'Combien de fois moins cher est Haiku par rapport a Opus ?',
              options: [
                '5x moins cher',
                '20x moins cher',
                '60x moins cher',
                '100x moins cher',
              ],
              correctIndex: 2,
              explanation: 'Haiku coute environ 60x moins qu\'Opus. C\'est pourquoi le routing intelligent de modeles est crucial : on utilise le modele le moins cher qui produit la qualite requise.',
            },
            {
              question: 'Pourquoi les instructions negatives sont-elles problematiques ?',
              options: [
                'Elles sont ignorees par les LLM',
                'Elles coutent des tokens et une instruction positive est souvent plus courte et plus efficace',
                'Elles causent des hallucinations',
                'Elles sont interdites par l\'API',
              ],
              correctIndex: 1,
              explanation: 'Les instructions negatives consomment des tokens inutilement. "Reponds uniquement avec des faits sources" est plus court et plus efficace que 5 interdictions separees.',
            },
            {
              question: 'Quelle est la strategie de compression de contexte la plus efficace ?',
              options: [
                'Supprimer aleatoirement 50% du texte',
                'Resumer le texte manuellement avant de l\'envoyer',
                'Utiliser un prompt Haiku rapide pour extraire les passages pertinents, puis passer seulement ceux-la',
                'Limiter le contexte a 500 tokens maximum',
              ],
              correctIndex: 2,
              explanation: 'La pre-extraction par un modele rapide (Haiku) permet de reduire le contexte de 80% sans perte de qualite. Le prompt principal recoit seulement les informations pertinentes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Token Optimizer',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Cas d'excellence
    // -----------------------------------------------------------------------
    {
      id: 'pm3-m6',
      title: 'Cas d\'excellence',
      emoji: '\u{1F3C6}',
      description: 'Etudie des cas reels ou le prompt engineering expert a produit des resultats exceptionnels.',
      duration: '15 min',
      lessons: [
        {
          id: 'pm3-m6-l1',
          title: 'Etudes de cas : prompts qui ont transforme des entreprises',
          duration: '5 min',
          type: 'text',
          content: `Pour cloturer ce parcours expert, etudions des cas reels ou le prompt engineering avance a fait une difference massive. Ces exemples montrent concretement ce que tes nouvelles competences peuvent accomplir. \u{1F31F}

Cas 1 : L'agence marketing qui a divise ses couts par 4. Une agence de 15 personnes produisait manuellement 200 posts reseaux sociaux par mois. Avec un systeme multi-prompts (generateur + critique + reformulateur), ils produisent maintenant 800 posts par mois a qualite equivalente. La cle ? Un prompt generateur ultra-specifique par plateforme (LinkedIn ≠ Instagram ≠ Twitter) et un prompt critique calibre sur leur charte editoriale. Cout : 12 credits par post au lieu de 2h de travail humain.

Cas 2 : Le cabinet juridique et les contrats. Un cabinet analysait manuellement chaque contrat pour identifier les clauses a risque — 4h par contrat. Avec un pipeline Haiku (extraction des clauses) → Sonnet (analyse des risques) → Opus (recommandations strategiques), ils ont reduit a 15 minutes par contrat. Le prompt Opus utilise le framework RISEN avec un narrowing de 12 contraintes specifiques au droit français des affaires. Precision : 94%, validee sur 500 contrats.

Cas 3 : La startup e-commerce et les fiches produit. 5000 produits a decrire, budget serre. Un prompt unique generait des fiches generiques. Solution : un system prompt avec 3 exemples "gold standard" par categorie de produit, un prompt de variation pour eviter la repetition, et un evaluateur automatique (LLM-as-a-judge) qui rejette les fiches en dessous de 4/5. Resultat : 5000 fiches en 3 jours, taux de conversion +18% par rapport aux fiches manuelles precedentes.

Le point commun de ces reussites ? Aucune n'utilise un seul prompt magique. Toutes combinent architecture multi-prompts, evaluation automatisee, et optimisation des couts. C'est exactement ce que tu as appris dans ce parcours. Tu as maintenant les competences pour reproduire ces resultats. \u{1F680}

Felicitations — tu es officiellement un Prompt Architect Master ! \u{1F393}`,
          xpReward: 30,
        },
        {
          id: 'pm3-m6-l2',
          title: 'Exercice : Conçois ton propre cas d\'excellence',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `C'est ton projet final de Prompt Architect Master ! \u{1F393}

Choisis un secteur qui te passionne et conçois un systeme de prompts complet qui resout un vrai probleme business.

Ton livrable doit inclure :

1. **Probleme** — Le probleme business reel que tu resous (avec des chiffres : temps actuel, cout, frequence)

2. **Architecture** — Le systeme multi-prompts complet :
   - Nombre de prompts et role de chacun
   - Modeles utilises (Haiku/Sonnet/Opus) avec justification
   - Pattern(s) utilise(s) (orchestrateur, fan-out, pipeline, critique-revision)

3. **Prompt principal** — Ecris le prompt le plus important de ton architecture en utilisant un framework (CRISP, RACE ou RISEN)

4. **Evaluation** — Ta grille d'evaluation automatisee avec 4+ criteres

5. **Optimisation couts** — Cout estime par operation et techniques d'optimisation appliquees

6. **Resultats attendus** — Metriques de succes (temps gagne, cout reduit, qualite mesuree)

Sois aussi concret et detaille que possible — c'est un portfolio piece !`,
          content: 'Conçois un systeme de prompts complet pour un vrai probleme business.',
          xpReward: 50,
        },
        {
          id: 'pm3-m6-l3',
          title: 'Quiz final — Prompt Architect Master',
          duration: '5 min',
          type: 'quiz',
          content: 'L\'examen final pour obtenir ton diplome de Prompt Architect Master.',
          quizQuestions: [
            {
              question: 'Dans le cas du cabinet juridique, quel pipeline de modeles est utilise ?',
              options: [
                'Opus pour tout',
                'Haiku (extraction) → Sonnet (analyse) → Opus (recommandations)',
                'Sonnet pour tout',
                'Haiku pour tout avec prompt caching',
              ],
              correctIndex: 1,
              explanation: 'Le pipeline utilise chaque modele pour sa force : Haiku pour l\'extraction rapide, Sonnet pour l\'analyse precise, Opus pour les recommandations strategiques. C\'est le pattern Pipeline optimal.',
            },
            {
              question: 'Quel est le point commun de tous les cas d\'excellence etudies ?',
              options: [
                'Ils utilisent tous un seul prompt tres long',
                'Ils utilisent tous Opus exclusivement',
                'Ils combinent architecture multi-prompts, evaluation automatisee et optimisation des couts',
                'Ils n\'utilisent aucun framework',
              ],
              correctIndex: 2,
              explanation: 'Aucun cas d\'excellence ne repose sur un "prompt magique" unique. Tous combinent les trois piliers : architecture multi-prompts, evaluation automatisee, et optimisation des couts.',
            },
            {
              question: 'Dans le cas e-commerce, qu\'est-ce qui a permis un taux de conversion +18% ?',
              options: [
                'Des fiches plus longues',
                'Des exemples gold standard + variation + evaluation LLM-as-a-judge rejetant les fiches < 4/5',
                'Un modele plus recent',
                'Des fiches avec plus de mots-cles SEO',
              ],
              correctIndex: 1,
              explanation: 'La combinaison d\'exemples gold standard (few-shot), de variation (anti-repetition) et d\'evaluation automatique (rejet < 4/5) a produit des fiches superieures aux fiches manuelles precedentes.',
            },
            {
              question: 'Pour devenir un vrai Prompt Architect Master, quelle est la competence la plus importante ?',
              options: [
                'Connaitre tous les frameworks par coeur',
                'Savoir combiner frameworks, architectures, evaluation et optimisation selon le probleme specifique',
                'Ecrire les prompts les plus longs possibles',
                'Utiliser exclusivement Opus pour tout',
              ],
              correctIndex: 1,
              explanation: 'Le vrai Prompt Architect Master sait combiner les bons outils selon le probleme : le bon framework, la bonne architecture, la bonne methode d\'evaluation et les bonnes optimisations. C\'est la synthese de tout le parcours.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 80,
      xpReward: 100,
      badgeEmoji: '\u{1F3C6}',
      badgeName: 'Prompt Master',
    },
  ],
};

// =============================================================================
// Parcours 2 — Content Director (Expert)
// =============================================================================

export const parcoursContentDirector: FormationParcours = {
  id: 'content-director-niv3',
  title: 'Content Director',
  emoji: '\u{1F3AC}',
  description: 'Maitrise la direction de contenu a l\'echelle : content ops, data-driven content, video/multimedia, personal branding entreprise et deploiement international multilingue.',
  category: 'contenu',
  subcategory: 'content-creation',
  level: 'expert',
  levelLabel: 'Expert',
  color: '#EC4899',
  diplomaTitle: 'Content Director',
  diplomaSubtitle: 'Certification Freenzy.io — Direction de Contenu Expert',
  totalDuration: '1h30',
  totalXP: 1000,
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Strategie de contenu a l'echelle
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m1',
      title: 'Strategie de contenu a l\'echelle',
      emoji: '\u{1F4C8}',
      description: 'Passe de quelques contenus artisanaux a une machine a contenu industrielle sans perdre en qualite.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m1-l1',
          title: 'Du contenu artisanal a l\'usine a contenu intelligente',
          duration: '5 min',
          type: 'text',
          content: `Tu sais creer du bon contenu — maintenant, apprends a en creer 100x plus sans sacrifier la qualite. C'est le defi du Content Director : passer de l'artisanat au systeme industriel intelligent. \u{1F3ED}

Le piege classique du scale-up : tu recrutes plus de redacteurs, tu produis plus de contenu, mais la qualite baisse, le ton devient inconsistant, et tu perds ton identite de marque. L'approche Content Director est radicalement differente : tu construis un systeme, pas une equipe.

Pilier 1 : la matrice de contenu. Tu ne planifies plus contenu par contenu — tu crees une matrice croisant tes themes (5-8 piliers thematiques) avec tes formats (articles, posts, newsletters, videos, podcasts) et tes audiences (personas). Une matrice 6 themes x 5 formats x 3 personas = 90 contenus uniques planifiables. Avec une cadence d'un contenu par jour, tu as 3 mois de contenu planifie d'avance.

Pilier 2 : les templates replicables. Chaque format a un template detaille — structure, longueur, ton, CTA, mots-cles. Un article "tutoriel" suit toujours la meme structure : accroche probleme, solution etape par etape, FAQ, CTA. Un post LinkedIn "retour d'experience" : hook en 2 lignes, histoire en 5 paragraphes, leçon apprise, question d'engagement. Ces templates sont tes blueprints — ils garantissent la consistance meme a grande echelle.

Pilier 3 : le calendrier editorial intelligent. Pas un simple Google Sheet avec des dates — un systeme qui tient compte de la saisonnalite, des evenements sectoriels, des cycles d'achat de tes clients, et des performances passees. Si tes articles "guide pratique" performent 3x mieux en janvier (resolutions), ton calendrier le sait et planifie en consequence.

Pilier 4 : la delegation IA structuree. Chaque type de contenu a un prompt dedie, teste et valide. L'IA ne remplace pas la strategie — elle execute le plan que tu as conçu. Tu es l'architecte, l'IA est l'ouvrier qualifie. Avec Freenzy, tu peux deleguer a tes agents Content, SEO et Communication pour executer ton calendrier en pilote automatique. \u{1F4AA}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m1-l2',
          title: 'Exercice : Construis ta matrice de contenu',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Construis une matrice de contenu complete pour une entreprise fictive (ou la tienne).

1. **Choisis ton entreprise** — Secteur, taille, audience cible

2. **Definis 6 piliers thematiques** — Les grands sujets que tu couvres (ex: pour un SaaS B2B → productivite, automatisation, management, tech, culture d'entreprise, temoignages)

3. **Cree la matrice** — Tableau croisant :
   - 6 themes (lignes)
   - 5 formats : article blog, post LinkedIn, newsletter, video courte, podcast (colonnes)
   - Pour chaque cellule : un titre concret de contenu

4. **Calendrier mensuel** — Place 20 contenus de ta matrice sur un calendrier de 30 jours en respectant :
   - Max 1 contenu par jour
   - Alternance des formats
   - Pas deux contenus du meme theme la meme semaine

5. **Template** — Ecris le template detaille pour un de tes formats (structure, ton, longueur, CTA)`,
          content: 'Construis une matrice de contenu strategique complete.',
          xpReward: 40,
        },
        {
          id: 'cd3-m1-l3',
          title: 'Quiz — Strategie a l\'echelle',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta comprehension de la strategie de contenu a l\'echelle.',
          quizQuestions: [
            {
              question: 'Quelle est l\'approche du Content Director pour scaler le contenu ?',
              options: [
                'Recruter plus de redacteurs',
                'Construire un systeme (matrice, templates, calendrier, delegation IA)',
                'Publier plus souvent avec moins de qualite',
                'Externaliser a une agence',
              ],
              correctIndex: 1,
              explanation: 'Le Content Director construit un systeme complet plutot que de simplement ajouter des ressources humaines. Le systeme garantit la qualite et la consistance a grande echelle.',
            },
            {
              question: 'Combien de contenus uniques planifiables donne une matrice 6x5x3 ?',
              options: [
                '14 contenus',
                '30 contenus',
                '90 contenus',
                '150 contenus',
              ],
              correctIndex: 2,
              explanation: '6 themes x 5 formats x 3 personas = 90 contenus uniques planifiables. Avec un contenu par jour, cela represente 3 mois de contenu planifie d\'avance.',
            },
            {
              question: 'Quel est le role de l\'IA dans l\'approche Content Director ?',
              options: [
                'Remplacer completement le Content Director',
                'Definir la strategie de contenu',
                'Executer le plan conçu par le Content Director',
                'Uniquement corriger l\'orthographe',
              ],
              correctIndex: 2,
              explanation: 'L\'IA ne remplace pas la strategie — elle execute le plan. Le Content Director est l\'architecte, l\'IA est l\'ouvrier qualifie qui suit les templates et le calendrier.',
            },
            {
              question: 'Qu\'est-ce qui differencie un calendrier editorial "intelligent" d\'un simple planning ?',
              options: [
                'Il est plus joli visuellement',
                'Il tient compte de la saisonnalite, des evenements, des cycles d\'achat et des performances passees',
                'Il est automatiquement genere par l\'IA',
                'Il inclut les jours feries',
              ],
              correctIndex: 1,
              explanation: 'Un calendrier intelligent integre la saisonnalite, les evenements sectoriels, les cycles d\'achat clients et les donnees de performance passees pour optimiser le timing de chaque publication.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F4C8}',
      badgeName: 'Content Strategist',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Content Ops
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m2',
      title: 'Content Ops',
      emoji: '\u{2699}\uFE0F',
      description: 'Mets en place les processus, outils et workflows qui font tourner ta machine a contenu au quotidien.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m2-l1',
          title: 'Workflows de production : de l\'idee a la publication',
          duration: '5 min',
          type: 'text',
          content: `Content Ops, c'est l'equivalent du DevOps pour le contenu. C'est l'art de creer des processus de production fluides, reproductibles et mesurables. Sans Content Ops, meme la meilleure strategie reste un joli PowerPoint. \u{2699}\uFE0F

Le workflow type en 7 etapes. Etape 1 : Ideation. Les idees arrivent de partout — veille, equipe commerciale, support client, tendances. Elles atterrissent toutes dans un backlog centralise (pas dans la tete de quelqu'un). Etape 2 : Triage. Chaque semaine, tu priorises le backlog selon l'impact estime, l'effort requis et l'alignement strategique. Etape 3 : Brief. Chaque contenu valide reçoit un brief structure — objectif, audience, mots-cles, angle, references, deadline. Le brief est le contrat entre le strategiste et le createur. Etape 4 : Production. L'IA genere le premier jet a partir du brief et du template. Etape 5 : Edition. Relecture humaine — correction du ton, verification des faits, ajout de la touche personnelle. Etape 6 : Validation. Un second regard (pair ou manager) avant publication. Etape 7 : Publication et distribution.

Les outils du Content Ops. Un systeme de gestion du backlog (Notion, Trello, ou directement dans Freenzy). Un systeme de templates versionnes (chaque template a un numero de version et un changelog). Un pipeline d'automatisation : quand le statut passe a "valide", la publication est schedulee automatiquement. Des dashboards de suivi : combien de contenus en cours, en retard, publies cette semaine.

Le concept de "content debt". Comme la dette technique en dev, la dette de contenu s'accumule quand tu publies du contenu mediocre ou non-optimise. Un article de blog mal reference qui ne genere aucun trafic, c'est de la dette. Un post LinkedIn sans CTA qui ne genere aucun engagement, c'est de la dette. Le Content Ops inclut des sprints de "remboursement" : reediter, optimiser ou supprimer le contenu sous-performant.

Avec Freenzy, tu peux automatiser les etapes 1 (veille IA), 4 (production IA) et 7 (distribution multi-canal). Les etapes humaines (triage, edition, validation) restent critiques — c'est la ou tu apportes ta valeur de Content Director. \u{1F4CB}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m2-l2',
          title: 'Exercice : Conçois ton workflow Content Ops',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Conçois un workflow Content Ops complet pour une equipe de 3 personnes (1 Content Director + 2 createurs) qui produit 20 contenus par mois.

1. **Pipeline visuel** — Dessine (en ASCII art ou description) les 7 etapes avec les responsables de chaque etape

2. **Brief template** — Cree le template de brief complet qu'un createur recevra. Inclus tous les champs necessaires.

3. **Automatisations** — Liste 5 automatisations que tu mettrais en place avec Freenzy :
   - Declencheur → Action → Resultat

4. **Metriques** — Definis 5 KPI de ton Content Ops :
   - Nom du KPI
   - Comment le mesurer
   - Seuil d'alerte (quand faut-il agir ?)

5. **Sprint de dette** — Planifie un sprint mensuel de "remboursement de dette contenu" :
   - Criteres pour identifier le contenu en dette
   - Actions possibles (reediter, optimiser, supprimer)
   - Objectif du sprint (combien de pieces traitees)`,
          content: 'Conçois un workflow Content Ops complet et operationnel.',
          xpReward: 40,
        },
        {
          id: 'cd3-m2-l3',
          title: 'Quiz — Content Ops',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta maitrise du Content Ops.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce que le Content Ops ?',
              options: [
                'Un outil de gestion de contenu',
                'L\'equivalent du DevOps pour le contenu : processus de production fluides, reproductibles et mesurables',
                'La creation de contenu operationnel',
                'La gestion des droits d\'auteur',
              ],
              correctIndex: 1,
              explanation: 'Le Content Ops est l\'ensemble des processus, outils et workflows qui font tourner la machine a contenu au quotidien, comme le DevOps fait tourner le code en production.',
            },
            {
              question: 'Qu\'est-ce que la "dette de contenu" ?',
              options: [
                'Le budget non depense en creation de contenu',
                'Le contenu mediocre ou non-optimise qui ne performe pas et s\'accumule',
                'Les contenus planifies mais pas encore crees',
                'Le cout de l\'abonnement aux outils de contenu',
              ],
              correctIndex: 1,
              explanation: 'La dette de contenu s\'accumule quand on publie du contenu mediocre (mal reference, sans CTA, sans engagement). Comme la dette technique, il faut la "rembourser" regulierement.',
            },
            {
              question: 'Dans un workflow Content Ops, a quoi sert le brief ?',
              options: [
                'A facturer le client',
                'C\'est le contrat entre le strategiste et le createur — objectif, audience, angle, deadline',
                'A mesurer la performance du contenu',
                'A presenter le contenu au comite de direction',
              ],
              correctIndex: 1,
              explanation: 'Le brief est le contrat entre le strategiste et le createur. Il definit precisement ce qui est attendu : objectif, audience, mots-cles, angle, references et deadline.',
            },
            {
              question: 'Quelles etapes du workflow Freenzy peut automatiser ?',
              options: [
                'Toutes les 7 etapes',
                'La veille (ideation), la production et la distribution',
                'Uniquement la publication',
                'Aucune, tout est manuel',
              ],
              correctIndex: 1,
              explanation: 'Freenzy peut automatiser la veille IA (ideation), la production IA (premier jet) et la distribution multi-canal. Le triage, l\'edition et la validation restent humains.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{2699}\uFE0F',
      badgeName: 'Content Ops Pro',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Data-driven content
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m3',
      title: 'Data-driven content',
      emoji: '\u{1F4CA}',
      description: 'Utilise les donnees pour guider chaque decision de contenu — de l\'ideation a l\'optimisation.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m3-l1',
          title: 'Les donnees au coeur de ta strategie de contenu',
          duration: '5 min',
          type: 'text',
          content: `Le contenu pilote par les donnees, c'est la fin du "je publie ce qui me plait" et le debut du "je publie ce qui performe". Le Content Director expert ne devine pas — il mesure, analyse et decide avec des chiffres. \u{1F4CA}

Les 3 couches de donnees. Couche 1 : les donnees de decouverte. Qu'est-ce que ton audience cherche ? Google Search Console te montre les requetes exactes. Les volumes de recherche te donnent la demande. Les questions sur Reddit, Quora et les forums te revelent les vrais pain points. L'IA peut analyser des centaines de discussions en quelques minutes pour extraire les themes recurrents. C'est l'ideation data-driven : tu ne devines plus les sujets, tu les decouvres dans les donnees.

Couche 2 : les donnees de performance. Chaque contenu publie genere des metriques — vues, temps de lecture, taux de rebond, partages, clics CTA, conversions. Le Content Director expert cree un tableau de bord ou chaque contenu a un score composite. La formule varie selon tes objectifs : si tu vises l'acquisition, le score pondere le trafic organique. Si tu vises l'engagement, il pondere les partages et commentaires. Si tu vises la conversion, il pondere les clics CTA et les inscriptions.

Couche 3 : les donnees predictives. C'est ici que l'IA brille vraiment. En analysant tes performances passees, un modele peut predire quel type de contenu performera le mieux pour un sujet donne. "Les guides pratiques sur la productivite publiés le mardi a 9h generent 2.5x plus d'engagement que les articles d'opinion sur le meme sujet publies le vendredi." Ce type d'insight transforme completement ta planification.

L'approche "test & learn" systematique. Chaque mois, alloue 20% de ta production a des experimentations : nouveau format, nouveau sujet, nouveau ton, nouvelle heure de publication. Mesure rigoureusement. Garde ce qui marche, abandonne le reste. Apres 6 mois, ta strategie est optimisee par des centaines de data points reels — pas par l'intuition.

Avec Freenzy, tu peux demander a l'agent Analytique de compiler tes donnees et a l'agent Strategie de les interpreter. Data in, decisions out. \u{1F680}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m3-l2',
          title: 'Exercice : Analyse et optimise avec les donnees',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Voici les donnees de performance de 8 articles publies le mois dernier :

| # | Titre | Format | Theme | Vues | Temps lecture | Partages | Clics CTA | Conversions |
|---|-------|--------|-------|------|---------------|----------|-----------|-------------|
| 1 | "5 outils IA pour PME" | Guide | Tech | 3200 | 4min30 | 89 | 142 | 23 |
| 2 | "Mon avis sur ChatGPT" | Opinion | Tech | 1800 | 1min45 | 12 | 18 | 2 |
| 3 | "Automatiser sa compta" | Tutoriel | Finance | 2100 | 5min10 | 45 | 98 | 31 |
| 4 | "Tendances marketing 2026" | Liste | Marketing | 4500 | 2min20 | 156 | 67 | 8 |
| 5 | "Interview CEO startup" | Interview | Business | 890 | 6min | 34 | 12 | 1 |
| 6 | "Guide email marketing" | Guide | Marketing | 2800 | 4min50 | 67 | 189 | 42 |
| 7 | "IA et droit du travail" | Analyse | Juridique | 1200 | 3min30 | 23 | 34 | 5 |
| 8 | "Cas client : +300% leads" | Case study | Marketing | 1600 | 5min30 | 78 | 210 | 38 |

1. **Score composite** — Cree une formule de scoring et classe les 8 articles
2. **Insights** — Quels patterns observes-tu ? (format, theme, longueur, etc.)
3. **Recommandations** — Propose le plan des 8 prochains articles base sur les donnees
4. **Experimentations** — Propose 2 experimentations a tester le mois prochain
5. **Prompt IA** — Ecris le prompt Freenzy pour automatiser cette analyse chaque mois`,
          content: 'Analyse des donnees reelles de contenu et optimise la strategie.',
          xpReward: 40,
        },
        {
          id: 'cd3-m3-l3',
          title: 'Quiz — Data-driven content',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta maitrise du contenu pilote par les donnees.',
          quizQuestions: [
            {
              question: 'Quelles sont les 3 couches de donnees du content data-driven ?',
              options: [
                'Creation, publication, archivage',
                'Decouverte, performance, predictive',
                'SEO, reseaux sociaux, email',
                'Brouillon, edition, validation',
              ],
              correctIndex: 1,
              explanation: 'Les 3 couches sont : decouverte (ce que l\'audience cherche), performance (comment tes contenus performent), et predictive (ce qui performera selon les patterns passes).',
            },
            {
              question: 'Quel pourcentage de la production mensuelle devrait etre alloue aux experimentations ?',
              options: [
                '5%',
                '10%',
                '20%',
                '50%',
              ],
              correctIndex: 2,
              explanation: 'L\'approche test & learn recommande d\'allouer 20% de la production mensuelle a des experimentations (nouveau format, sujet, ton, horaire) pour optimiser continuellement.',
            },
            {
              question: 'Pourquoi un score composite est-il preferable aux vues seules ?',
              options: [
                'Les vues sont toujours fausses',
                'Le score composite pondere plusieurs metriques selon tes objectifs business reels',
                'C\'est plus simple a calculer',
                'Les vues ne sont pas disponibles',
              ],
              correctIndex: 1,
              explanation: 'Un score composite pondere les metriques selon tes objectifs : trafic organique si tu vises l\'acquisition, partages si engagement, clics CTA si conversion. Les vues seules ne racontent pas toute l\'histoire.',
            },
            {
              question: 'Comment l\'IA aide-t-elle dans la couche predictive ?',
              options: [
                'Elle ecrit les articles automatiquement',
                'Elle analyse les performances passees pour predire quel type de contenu performera le mieux',
                'Elle remplace Google Analytics',
                'Elle choisit les images des articles',
              ],
              correctIndex: 1,
              explanation: 'L\'IA analyse les patterns de performance passee pour predire le format, le sujet, le timing et le ton optimaux pour les futurs contenus. C\'est la planification predictive.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Data Content Pro',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Video et multimedia
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m4',
      title: 'Video et multimedia',
      emoji: '\u{1F3AC}',
      description: 'Maitrise la creation de contenu video et multimedia avec l\'IA — du script a la post-production.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m4-l1',
          title: 'Video IA : du script au montage en pilote automatique',
          duration: '5 min',
          type: 'text',
          content: `La video est le format roi — 80% du trafic internet en 2026. Et grace a l'IA, tu n'as plus besoin d'une equipe de production pour creer du contenu video professionnel. Voyons comment un Content Director utilise l'IA multimedia. \u{1F3AC}

Le pipeline video IA en 5 etapes. Etape 1 : le script. C'est la fondation — et c'est la ou l'IA est la plus utile immediatement. Un bon prompt genere un script structure : hook (5 secondes), probleme (15s), solution (60s), preuve (30s), CTA (10s). Le script inclut les indications visuelles ("montrer le dashboard", "insert graphique") et le timing exact. Astuce : demande a l'IA de rediger le script PUIS de le critiquer et l'ameliorer — le pattern Critique-Revision fait des merveilles ici.

Etape 2 : la voix. ElevenLabs ou Deepgram transforment ton script en voix-off professionnelle en 30 secondes. Tu peux cloner ta propre voix pour garder l'authenticite. Freenzy utilise ElevenLabs eleven_multilingual_v2 avec la voix George pour un rendu premium. La cle : un script bien ecrit = une voix-off naturelle.

Etape 3 : les visuels. Pour les videos courtes (Reels, TikTok, Shorts), Freenzy genere des images avec fal.ai Flux/schnell que tu assembles en diaporama anime. Pour les talking heads, D-ID cree un avatar anime a partir d'une simple photo. Pour les videos plus ambitieuses, Runway ML genere des clips video a partir de descriptions textuelles.

Etape 4 : l'assemblage. Les outils comme CapCut, Descript ou Opus Clip permettent un montage rapide. L'IA ajoute automatiquement les sous-titres (indispensables — 85% des videos sociales sont regardees sans son), les transitions et la musique de fond.

Etape 5 : la declinaison. Un contenu video long (5-10 min YouTube) se decline en 5+ contenus courts. L'IA identifie les meilleurs moments et les decoupe automatiquement. Un webinar d'1h peut generer 15-20 clips viraux. C'est le content repurposing automatise — le saint graal du Content Director.

Le budget ? Avec Freenzy, une video courte professionnelle coute environ 20 credits (image) + 15 credits (voix) = 35 credits. Comparez avec 500-2000 EUR pour une video traditionnelle. \u{1F4B0}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m4-l2',
          title: 'Exercice : Produis une video complete avec l\'IA',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Produis tous les elements d'une video courte (60 secondes) pour LinkedIn sur le theme : "3 façons d'utiliser l'IA pour gagner 2h par jour".

1. **Script complet** — Avec timecodes et indications visuelles :
   - Hook (0-5s) : accroche choc
   - Probleme (5-15s) : identification du pain point
   - Solution 1 (15-30s) : premiere astuce avec exemple
   - Solution 2 (30-42s) : deuxieme astuce avec exemple
   - Solution 3 (42-52s) : troisieme astuce avec exemple
   - CTA (52-60s) : appel a l'action

2. **Brief visuel** — Pour chaque segment, decris l'image ou le clip a generer (prompt fal.ai ou D-ID)

3. **Sous-titres** — Ecris les sous-titres qui apparaitront (texte exact, formatage)

4. **Declinaisons** — Propose 3 contenus supplementaires extraits de cette video :
   - 1 carousel Instagram (5 slides)
   - 1 post LinkedIn texte
   - 1 tweet thread (5 tweets)

5. **Couts** — Estime le cout total en credits Freenzy`,
          content: 'Produis une video courte complete avec tous ses elements IA.',
          xpReward: 40,
        },
        {
          id: 'cd3-m4-l3',
          title: 'Quiz — Video et multimedia',
          duration: '5 min',
          type: 'quiz',
          content: 'Teste ta maitrise de la creation video et multimedia avec l\'IA.',
          quizQuestions: [
            {
              question: 'Quel pourcentage du trafic internet est de la video en 2026 ?',
              options: [
                '40%',
                '60%',
                '80%',
                '95%',
              ],
              correctIndex: 2,
              explanation: 'La video represente environ 80% du trafic internet en 2026, ce qui en fait le format de contenu le plus consomme et le plus important strategiquement.',
            },
            {
              question: 'Quel pourcentage de videos sociales sont regardees sans le son ?',
              options: [
                '25%',
                '50%',
                '70%',
                '85%',
              ],
              correctIndex: 3,
              explanation: '85% des videos sur les reseaux sociaux sont regardees sans le son. C\'est pourquoi les sous-titres sont absolument indispensables pour toute video sociale.',
            },
            {
              question: 'Quel est le "saint graal" du Content Director en video ?',
              options: [
                'Creer la video virale parfaite',
                'Le content repurposing automatise — decliner un contenu long en multiples contenus courts',
                'Avoir le plus d\'abonnes YouTube',
                'Utiliser uniquement des avatars IA',
              ],
              correctIndex: 1,
              explanation: 'Le content repurposing automatise (un webinar d\'1h = 15-20 clips viraux, un long format = 5+ shorts) est le saint graal car il maximise le ROI de chaque piece de contenu creee.',
            },
            {
              question: 'Combien coute environ une video courte professionnelle avec Freenzy ?',
              options: [
                '5 credits',
                '35 credits',
                '200 credits',
                '1000 credits',
              ],
              correctIndex: 1,
              explanation: 'Une video courte avec Freenzy coute environ 35 credits (20 pour l\'image + 15 pour la voix), contre 500-2000 EUR pour une production video traditionnelle.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F3AC}',
      badgeName: 'Video Director',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Personal branding entreprise
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m5',
      title: 'Personal branding entreprise',
      emoji: '\u{1F451}',
      description: 'Construis une marque personnelle puissante pour ton entreprise et ses dirigeants avec l\'IA.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m5-l1',
          title: 'De l\'entreprise invisible a la marque incontournable',
          duration: '5 min',
          type: 'text',
          content: `Le personal branding entreprise, c'est transformer les dirigeants et experts de ton entreprise en voix reconnues de leur secteur. En 2026, les gens font confiance aux personnes, pas aux logos. Un CEO visible et credible vaut plus qu'une campagne publicitaire a 100K EUR. \u{1F451}

Le framework VOICE pour le personal branding. V — Values : quelles valeurs le dirigeant incarne ? Pas des valeurs corporate creuses ("innovation, excellence") mais des convictions fortes et polarisantes. "Je crois que 90% des reunions sont une perte de temps" est une prise de position memorable. O — Origin story : chaque personal brand a besoin d'une histoire d'origine. Comment le dirigeant en est arrive la ? Les echecs sont plus interessants que les succes. I — Insights : l'expertise unique que seul lui peut partager, basee sur son experience. Pas du contenu generique qu'on trouve partout. C — Consistency : le meme ton, les memes themes, la meme frequence, pendant des mois. Le branding se construit par la repetition. E — Engagement : repondre aux commentaires, poser des questions, citer d'autres voix du secteur. Le personal branding est un dialogue, pas un monologue.

La strategie "pilier + declinaison". Tu identifies 3 piliers thematiques pour chaque dirigeant. Pilier 1 : expertise technique (leur domaine de competence). Pilier 2 : vision de l'industrie (ou va le secteur). Pilier 3 : leadership et culture (comment ils gerent). Chaque semaine : 1 post pilier 1, 1 post pilier 2, 1 post pilier 3. En 3 mois, l'audience associe automatiquement le dirigeant a ces 3 themes.

L'IA comme ghostwriter intelligent. Tu briefes l'IA avec le VOICE du dirigeant, ses anecdotes passees, son ton prefere, ses opinions fortes. Ensuite, l'IA genere des brouillons de posts que le dirigeant personnalise en 5 minutes au lieu de 45. Le dirigeant garde le controle editorial — l'IA accelere le processus. Avec Freenzy, l'agent Communication excelle dans ce role de ghostwriter avec un prompt calibre sur le style de chaque dirigeant.

Attention au piege : le personal branding IA qui sonne faux. Si chaque post est generique et lisse, l'audience le detecte immediatement. La cle ? Toujours injecter des elements authentiques — anecdotes reelles, chiffres internes, opinions tranchees. \u{2728}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m5-l2',
          title: 'Exercice : Construis un personal branding complet',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Construis une strategie de personal branding complete pour un CEO de startup SaaS B2B (ou pour toi-meme).

1. **Framework VOICE** — Remplis chaque composante :
   - Values : 3 convictions fortes et polarisantes
   - Origin story : l'histoire en 5 phrases (avec un echec)
   - Insights : 3 expertises uniques qu'il peut partager
   - Consistency : ton, frequence, format de predilection
   - Engagement : strategie d'interaction (reponses, citations, questions)

2. **3 piliers thematiques** — Pour chaque pilier :
   - Nom et description
   - 5 idees de posts concrets
   - Le format ideal (texte, carrousel, video)

3. **Calendrier semaine type** — 5 publications sur 7 jours
   - Jour, heure, pilier, format, accroche

4. **Prompt ghostwriter** — Ecris le prompt Freenzy complet pour generer des posts LinkedIn dans le style du CEO. Inclus le VOICE, des exemples de ton, et des instructions de formatage.

5. **KPI** — 5 metriques pour mesurer le succes du personal branding a 3 mois`,
          content: 'Construis une strategie de personal branding avec le framework VOICE.',
          xpReward: 40,
        },
        {
          id: 'cd3-m5-l3',
          title: 'Quiz — Personal branding',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifie ta maitrise du personal branding entreprise.',
          quizQuestions: [
            {
              question: 'Que signifie le "N" dans... pardon, que signifie le "V" dans le framework VOICE ?',
              options: [
                'Volume (quantite de publications)',
                'Values (convictions fortes et polarisantes)',
                'Visibilite (presence sur tous les reseaux)',
                'Viralite (potentiel de partage)',
              ],
              correctIndex: 1,
              explanation: 'Le V de VOICE represente les Values — pas des valeurs corporate creuses, mais des convictions fortes et polarisantes qui rendent le personal brand memorable et differenciant.',
            },
            {
              question: 'Pourquoi les echecs sont-ils importants dans l\'Origin story ?',
              options: [
                'Pour faire pitie a l\'audience',
                'Parce que les echecs sont plus interessants que les succes et humanisent le dirigeant',
                'Pour montrer que l\'entreprise a survecu',
                'C\'est une obligation legale',
              ],
              correctIndex: 1,
              explanation: 'Les echecs humanisent le dirigeant et le rendent relatable. Une origin story authentique avec des moments difficiles cree plus de connexion qu\'un parcours parfait qui semble irreel.',
            },
            {
              question: 'Quel est le piege principal du personal branding IA ?',
              options: [
                'Ca coute trop cher',
                'Le contenu generique et lisse que l\'audience detecte immediatement comme artificiel',
                'Ca prend trop de temps',
                'L\'IA ne sait pas ecrire de posts LinkedIn',
              ],
              correctIndex: 1,
              explanation: 'Le plus grand piege est le contenu generique qui sonne faux. La solution : toujours injecter des elements authentiques (anecdotes reelles, chiffres internes, opinions tranchees) dans les brouillons IA.',
            },
            {
              question: 'Combien de piliers thematiques sont recommandes par dirigeant ?',
              options: [
                '1 seul pilier pour rester focus',
                '3 piliers (expertise, vision industrie, leadership)',
                '7 piliers pour couvrir tous les sujets',
                '10+ piliers pour la diversite',
              ],
              correctIndex: 1,
              explanation: 'La strategie "pilier + declinaison" recommande 3 piliers par dirigeant. En 3 mois de publication reguliere, l\'audience associe automatiquement le dirigeant a ces 3 themes.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 75,
      xpReward: 100,
      badgeEmoji: '\u{1F451}',
      badgeName: 'Brand Builder',
    },

    // -----------------------------------------------------------------------
    // Module 6 — International et multilingue
    // -----------------------------------------------------------------------
    {
      id: 'cd3-m6',
      title: 'International et multilingue',
      emoji: '\u{1F30D}',
      description: 'Deploie ta strategie de contenu a l\'international avec la localisation IA et l\'adaptation culturelle.',
      duration: '15 min',
      lessons: [
        {
          id: 'cd3-m6-l1',
          title: 'De la traduction a la localisation culturelle intelligente',
          duration: '5 min',
          type: 'text',
          content: `Scaler son contenu a l'international, ce n'est PAS juste traduire. C'est localiser — adapter le contenu a la culture, aux attentes et aux habitudes de chaque marche. Un Content Director expert sait que la traduction est 20% du travail ; l'adaptation culturelle est les 80% restants. \u{1F30D}

La difference entre traduction et localisation. Traduction : "Our product saves you 2 hours per day" → "Notre produit vous fait gagner 2 heures par jour." Localisation : en France, on mettra l'accent sur le confort de vie gagne. En Allemagne, sur l'efficacite et la fiabilite technique. Au Japon, sur l'harmonie d'equipe que ca permet. Le meme benefice, presente differemment selon la culture.

Le framework ATLAS pour la localisation IA. A — Audience locale : qui sont-ils ? Quels reseaux utilisent-ils ? (LinkedIn domine en France, Xing en Allemagne, LINE au Japon). T — Ton et registre : le vouvoiement est standard en France, le tutoiement est acceptable en Espagne. L'humour fonctionne au UK, pas en Allemagne. L — Legal et reglementaire : RGPD en Europe, PIPL en Chine, LGPD au Bresil. Chaque marche a ses regles de communication. A — Adaptation du format : les posts LinkedIn performants font 150 mots en France, 100 mots aux US. Les emails marketing ont des taux d'ouverture tres differents selon les pays. S — SEO local : les mots-cles ne se traduisent pas — ils se recherchent. "Logiciel de gestion" n'est pas "management software" traduit en français, c'est un mot-cle avec son propre volume.

Le workflow multilingue optimal avec l'IA. Etape 1 : cree le contenu "master" dans ta langue principale. Etape 2 : briefing culturel — un prompt IA analyse les specificites du marche cible. Etape 3 : localisation — pas une simple traduction, mais une reecriture adaptee culturellement. Etape 4 : review par un natif (10 minutes vs 2 heures de creation from scratch). Etape 5 : SEO local — adaptation des mots-cles, meta descriptions et titres.

Le ROI est spectaculaire : deployer dans 5 langues avec ce workflow coute 20% du prix d'une agence de traduction traditionnelle, et le resultat est souvent meilleur car culturellement adapte plutot que mecaniquement traduit.

Avec Freenzy, tu configures le marche cible et les agents adaptent automatiquement le ton, les references et le format. Le multilingual est natif grace aux modeles Claude qui excellent dans toutes les langues europeennes. \u{1F680}`,
          xpReward: 30,
        },
        {
          id: 'cd3-m6-l2',
          title: 'Exercice : Localise un contenu pour 3 marches',
          duration: '5 min',
          type: 'exercise',
          exercisePrompt: `Voici un post LinkedIn performant en français :

---
"J'ai automatise 80% de mes taches administratives avec l'IA.

Resultat : 2h de temps libre par jour.

Voici exactement comment j'ai fait (guide pas a pas) :

1. J'ai liste toutes mes taches repetitives (45 minutes)
2. J'ai identifie celles qu'une IA pouvait gerer (20 taches sur 35)
3. J'ai configure les agents Freenzy pour chaque tache (2h de setup)
4. Depuis 3 mois, je ne touche plus a ces taches

Le plus surprenant ? La qualite est meilleure qu'avant. L'IA ne fait pas de fautes d'inattention un vendredi a 17h.

Si tu veux essayer : commence par tes emails. C'est le quick win le plus impactant.

Qui d'autre a automatise une partie de son quotidien ? \u{1F447}"
---

Localise ce post pour 3 marches en utilisant le framework ATLAS :

1. **Marche US (anglais)** — Adapte le ton (plus direct), les references culturelles, le format
2. **Marche Allemagne (allemand)** — Adapte le registre (formel), l'accent sur l'efficacite, les donnees
3. **Marche Japon (japonais)** — Adapte l'approche (collective), le ton (humble), le format

Pour chaque marche :
- Le post localise complet
- 3 points d'adaptation culturelle que tu as faits et pourquoi
- Le mot-cle SEO local principal (pas une simple traduction)`,
          content: 'Localise un contenu LinkedIn pour 3 marches internationaux.',
          xpReward: 40,
        },
        {
          id: 'cd3-m6-l3',
          title: 'Quiz final — Content Director',
          duration: '5 min',
          type: 'quiz',
          content: 'L\'examen final pour obtenir ton diplome de Content Director.',
          quizQuestions: [
            {
              question: 'Quelle est la difference fondamentale entre traduction et localisation ?',
              options: [
                'La localisation est plus chere',
                'La traduction convertit les mots, la localisation adapte culturellement le contenu',
                'La localisation est automatisee, la traduction est manuelle',
                'Il n\'y a pas de difference',
              ],
              correctIndex: 1,
              explanation: 'La traduction convertit les mots d\'une langue a l\'autre. La localisation adapte le message a la culture, aux attentes et aux habitudes du marche cible. La traduction = 20% du travail, la localisation = 80%.',
            },
            {
              question: 'Dans le framework ATLAS, que signifie le "S" ?',
              options: [
                'Style (ton de la communication)',
                'SEO local (mots-cles recherches, pas traduits)',
                'Social media (choix des plateformes)',
                'Strategy (plan global)',
              ],
              correctIndex: 1,
              explanation: 'Le S d\'ATLAS signifie SEO local : les mots-cles ne se traduisent pas, ils se recherchent. Chaque marche a ses propres termes de recherche et volumes associes.',
            },
            {
              question: 'Quel est le ROI du workflow multilingue IA vs agence traditionnelle ?',
              options: [
                'Le meme cout',
                '50% du prix',
                '20% du prix avec souvent un meilleur resultat',
                '90% du prix',
              ],
              correctIndex: 2,
              explanation: 'Le deploiement dans 5 langues avec le workflow IA coute environ 20% du prix d\'une agence traditionnelle, avec souvent un meilleur resultat car culturellement adapte plutot que mecaniquement traduit.',
            },
            {
              question: 'Quelle est la competence la plus importante d\'un Content Director expert ?',
              options: [
                'Savoir ecrire vite',
                'Construire des systemes qui scalent le contenu sans perdre en qualite ni en authenticite',
                'Maitriser tous les reseaux sociaux',
                'Avoir le plus grand nombre de contenus publies',
              ],
              correctIndex: 1,
              explanation: 'Le Content Director expert construit des systemes (strategie, ops, data, multimedia, branding, international) qui permettent de scaler massivement sans sacrifier la qualite ni l\'authenticite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 80,
      xpReward: 100,
      badgeEmoji: '\u{1F30D}',
      badgeName: 'Global Content Director',
    },
  ],
};
