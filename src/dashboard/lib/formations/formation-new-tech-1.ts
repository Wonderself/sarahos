// =============================================================================
// Freenzy.io — Formations Techniques IA (Pack 1)
// 5 parcours x 6 modules x 3 lessons = 90 lessons
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// PARCOURS 1 — Python + IA
// ---------------------------------------------------------------------------

export const parcoursPythonIA: FormationParcours = {
  id: 'python-ia',
  title: 'Python pour l\'IA',
  emoji: '\u{1F40D}',
  description: 'Maitrisez Python pour l\'intelligence artificielle : environnement, librairies data, API Claude, agents autonomes, automatisation et deploiement.',
  category: 'technique',
  subcategory: 'python-ia',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#3B82F6',
  diplomaTitle: 'Python IA Developer',
  diplomaSubtitle: 'Certification Freenzy.io — Python pour l\'Intelligence Artificielle',
  totalDuration: '1h30',
  totalXP: 900,
  available: true,
  modules: [
    {
      id: 'pia-m1',
      title: 'Environnement Python pour l\'IA',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Configurez un environnement Python professionnel pour le developpement IA.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m1-l1',
          title: 'Configurer son environnement Python IA',
          duration: '6 min',
          type: 'text',
          content: `Pour travailler efficacement avec l'IA en Python, un environnement bien configure est indispensable. Cette lecon vous guide pas a pas pour mettre en place un setup professionnel que vous utiliserez tout au long de cette formation.

Commencez par installer Python 3.11 ou superieur. Privilegiez la version officielle depuis python.org plutot que les distributions Anaconda — vous garderez un controle total sur vos dependances. Sur macOS, utilisez brew install python@3.12. Sur Linux, votre gestionnaire de paquets fera l'affaire. Sur Windows, cochez bien "Add Python to PATH" lors de l'installation.

L'etape suivante est cruciale : les environnements virtuels. Ne travaillez jamais dans l'environnement global. Creez un venv dedie pour chaque projet avec python -m venv .venv puis activez-le. Cela isole vos dependances et evite les conflits entre projets. Un fichier requirements.txt a la racine liste toutes vos dependances avec leurs versions exactes (pip freeze > requirements.txt).

Pour le developpement IA, installez ces librairies fondamentales : anthropic (SDK officiel Claude), openai (compatibilite), requests, python-dotenv (variables d'environnement), pydantic (validation de donnees). Ajoutez pandas et numpy pour le traitement de donnees, et jupyter pour l'experimentation interactive.

Configurez VS Code avec les extensions Python, Pylance et Jupyter. Activez le linting avec ruff (plus rapide que flake8) et le formatage avec black. Ajoutez un fichier pyproject.toml a la racine pour centraliser la configuration de ces outils.

La gestion des secrets est critique. Creez un fichier .env a la racine avec vos cles API (ANTHROPIC_API_KEY, etc.) et ajoutez .env a votre .gitignore. Utilisez python-dotenv pour charger ces variables. Ne commitez jamais vos cles dans Git — c'est la premiere regle de securite.

Enfin, initialisez Git dans votre projet et creez un .gitignore adapte au Python (.venv/, __pycache__/, *.pyc, .env). Votre structure de projet type : src/ pour le code, tests/ pour les tests, data/ pour les donnees, notebooks/ pour l'exploration.`,
          xpReward: 25,
        },
        {
          id: 'pia-m1-l2',
          title: 'Jeu : Les outils Python IA',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'venv', right: 'Isolation des dependances' },
              { left: 'pip freeze', right: 'Exporter les versions exactes' },
              { left: 'python-dotenv', right: 'Charger les variables .env' },
              { left: 'ruff', right: 'Linting rapide du code' },
              { left: 'black', right: 'Formatage automatique' },
              { left: 'pydantic', right: 'Validation de donnees' },
            ],
          },
          content: 'Associez chaque outil Python a sa fonction principale.',
          xpReward: 25,
        },
        {
          id: 'pia-m1-l3',
          title: 'Quiz — Environnement Python',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur la configuration d\'un environnement Python IA.',
          quizQuestions: [
            {
              question: 'Pourquoi utiliser un environnement virtuel (venv) pour chaque projet ?',
              options: [
                'Pour accelerer l\'execution du code',
                'Pour isoler les dependances et eviter les conflits entre projets',
                'Pour reduire la taille du projet',
                'Pour compiler le code Python en binaire',
              ],
              correctIndex: 1,
              explanation: 'Un venv isole les packages de chaque projet. Sans cela, deux projets utilisant des versions differentes d\'une meme librairie entreraient en conflit.',
            },
            {
              question: 'Ou faut-il stocker ses cles API (ANTHROPIC_API_KEY) ?',
              options: [
                'Dans le code source directement',
                'Dans un fichier .env non commite dans Git',
                'Dans le README du projet',
                'Dans les variables d\'environnement Windows uniquement',
              ],
              correctIndex: 1,
              explanation: 'Le fichier .env, ajoute au .gitignore, permet de garder les secrets hors du depot Git tout en les rendant facilement accessibles via python-dotenv.',
            },
            {
              question: 'Quel outil est recommande pour le linting Python moderne ?',
              options: [
                'pylint uniquement',
                'ruff (plus rapide que flake8)',
                'ESLint',
                'prettier',
              ],
              correctIndex: 1,
              explanation: 'Ruff est un linter Python ecrit en Rust, extremement rapide, qui remplace avantageusement flake8, isort et d\'autres outils.',
            },
            {
              question: 'Quelle commande genere le fichier requirements.txt avec les versions exactes ?',
              options: [
                'pip list > requirements.txt',
                'pip freeze > requirements.txt',
                'python -m pip export',
                'pip install --save',
              ],
              correctIndex: 1,
              explanation: 'pip freeze affiche toutes les dependances installees avec leurs versions exactes, au format compatible avec pip install -r requirements.txt.',
            },
            {
              question: 'Quelle version minimum de Python est recommandee pour le developpement IA ?',
              options: [
                'Python 2.7',
                'Python 3.6',
                'Python 3.11 ou superieur',
                'Python 4.0',
              ],
              correctIndex: 2,
              explanation: 'Python 3.11+ offre des performances ameliorees (jusqu\'a 60% plus rapide), un meilleur typage et la compatibilite avec toutes les librairies IA modernes.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Setup Master',
    },
    {
      id: 'pia-m2',
      title: 'Pandas et NumPy pour l\'IA',
      emoji: '\u{1F4CA}',
      description: 'Maitrisez le traitement de donnees avec Pandas et NumPy pour alimenter vos modeles IA.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m2-l1',
          title: 'Traitement de donnees avec Pandas et NumPy',
          duration: '6 min',
          type: 'text',
          content: `Pandas et NumPy sont les deux piliers du traitement de donnees en Python. Tout projet IA commence par la donnee, et ces librairies vous permettent de la charger, nettoyer, transformer et analyser avant de l'envoyer a un modele.

NumPy fournit le type ndarray — un tableau multidimensionnel ultra-performant. Contrairement aux listes Python, les operations sur les arrays NumPy sont vectorisees : au lieu de boucler element par element, le calcul s'execute en C en une seule operation. Exemple : np.array([1,2,3]) * 2 retourne array([2,4,6]) instantanement, meme sur des millions d'elements.

Pandas construit sur NumPy et ajoute le DataFrame — un tableau a deux dimensions avec des colonnes nommees, comme un tableur Excel mais en bien plus puissant. Chargez un CSV avec df = pd.read_csv('data.csv') et vous obtenez immediatement un DataFrame exploitable.

Les operations essentielles : df.head() pour voir les premieres lignes, df.describe() pour les statistiques, df.isnull().sum() pour compter les valeurs manquantes. Le filtrage est intuitif : df[df['age'] > 30] retourne uniquement les lignes ou l'age depasse 30. Le groupby permet l'agregation : df.groupby('categorie')['montant'].mean() calcule la moyenne par categorie.

Pour l'IA, la preparation des donnees est cruciale. Supprimez les doublons avec df.drop_duplicates(). Gerez les valeurs manquantes avec df.fillna(0) ou df.dropna(). Normalisez les colonnes numeriques pour que le modele traite chaque feature equitablement. Encodez les variables categorielles avec pd.get_dummies().

Un pattern courant en IA : charger vos donnees clients depuis un CSV, les nettoyer avec Pandas, calculer des features (anciennete, panier moyen, frequence), puis envoyer ces features a Claude pour une analyse personnalisee. Pandas transforme la donnee brute en information structuree que l'IA peut exploiter efficacement.

Conseil pratique : utilisez toujours df.dtypes pour verifier les types de colonnes apres le chargement. Un montant lu comme string au lieu de float causera des erreurs silencieuses dans vos calculs.`,
          xpReward: 25,
        },
        {
          id: 'pia-m2-l2',
          title: 'Exercice : Analyse de donnees clients',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Vous avez un fichier CSV "clients.csv" avec les colonnes : nom, email, date_inscription, nb_achats, montant_total, categorie.

Ecrivez un script Python complet qui :
1. Charge le CSV avec Pandas
2. Affiche les 5 premieres lignes et les statistiques descriptives
3. Supprime les lignes avec des valeurs manquantes
4. Calcule le panier moyen (montant_total / nb_achats)
5. Groupe les clients par categorie et affiche le panier moyen par categorie
6. Filtre les clients "premium" (panier moyen > 100 euros)
7. Exporte le resultat en JSON pour l'envoyer a Claude

Utilisez les bonnes pratiques : gestion des erreurs, verification des types, commentaires.`,
          content: 'Mettez en pratique Pandas pour une analyse de donnees clients reelle.',
          xpReward: 25,
        },
        {
          id: 'pia-m2-l3',
          title: 'Quiz — Pandas et NumPy',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le traitement de donnees Python.',
          quizQuestions: [
            {
              question: 'Quel est l\'avantage principal des arrays NumPy par rapport aux listes Python ?',
              options: [
                'Ils peuvent contenir des strings',
                'Les operations sont vectorisees et executees en C',
                'Ils sont plus faciles a ecrire',
                'Ils occupent plus de memoire',
              ],
              correctIndex: 1,
              explanation: 'Les operations vectorisees NumPy s\'executent en C natif, ce qui les rend des centaines de fois plus rapides que les boucles Python classiques sur de grands jeux de donnees.',
            },
            {
              question: 'Quelle methode Pandas permet de compter les valeurs manquantes par colonne ?',
              options: [
                'df.count()',
                'df.isnull().sum()',
                'df.missing()',
                'df.na_count()',
              ],
              correctIndex: 1,
              explanation: 'df.isnull() cree un masque booleen (True pour les valeurs manquantes), et .sum() additionne les True par colonne, donnant le compte exact.',
            },
            {
              question: 'Comment filtrer un DataFrame pour garder uniquement les lignes ou l\'age est superieur a 30 ?',
              options: [
                'df.filter(age > 30)',
                'df[df[\'age\'] > 30]',
                'df.where(\'age\', 30)',
                'df.select(age=30)',
              ],
              correctIndex: 1,
              explanation: 'La syntaxe df[condition] est le filtrage standard en Pandas. La condition df[\'age\'] > 30 cree un masque booleen applique au DataFrame.',
            },
            {
              question: 'Quelle methode supprime les lignes dupliquees dans un DataFrame ?',
              options: [
                'df.unique()',
                'df.remove_duplicates()',
                'df.drop_duplicates()',
                'df.deduplicate()',
              ],
              correctIndex: 2,
              explanation: 'df.drop_duplicates() supprime les lignes identiques. On peut specifier subset=[\'email\'] pour ne verifier les doublons que sur certaines colonnes.',
            },
            {
              question: 'Pourquoi verifier df.dtypes apres le chargement d\'un CSV ?',
              options: [
                'Pour connaitre le nombre de lignes',
                'Pour s\'assurer que les colonnes numeriques ne sont pas lues comme des strings',
                'Pour trier les colonnes',
                'Pour supprimer les colonnes inutiles',
              ],
              correctIndex: 1,
              explanation: 'Pandas peut mal inferer les types (montant lu comme string si une valeur contient une virgule). Verifier les dtypes evite des erreurs silencieuses dans les calculs.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Data Wrangler',
    },
    {
      id: 'pia-m3',
      title: 'API Claude avec Python',
      emoji: '\u{1F916}',
      description: 'Integrez l\'API Claude dans vos scripts Python pour creer des applications IA.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m3-l1',
          title: 'Appeler Claude depuis Python',
          duration: '6 min',
          type: 'text',
          content: `L'API Claude d'Anthropic est l'une des plus puissantes pour integrer l'IA dans vos applications Python. Le SDK officiel anthropic simplifie enormement les appels — voyons comment l'utiliser professionnellement.

Installez le SDK avec pip install anthropic. Configurez votre cle API dans le fichier .env : ANTHROPIC_API_KEY=sk-ant-xxx. Puis chargez-la avec python-dotenv. Le client se cree en une ligne : client = anthropic.Anthropic(). Le SDK lit automatiquement la variable d'environnement.

L'appel basique utilise client.messages.create(). Les parametres essentiels sont : model (le modele a utiliser), max_tokens (limite de la reponse), et messages (la conversation). Les messages suivent le format role/content : [{"role": "user", "content": "Votre question"}]. La reponse arrive dans response.content[0].text.

Trois modeles sont disponibles. Claude Haiku (claude-haiku-4-5-20251001) est ultrarapide et peu couteux — parfait pour la classification, l'extraction et les taches simples. Claude Sonnet (claude-sonnet-4-20250514) offre le meilleur equilibre performance/cout pour la redaction et l'analyse. Claude Opus (claude-opus-4-6) est le plus puissant, ideal pour le raisonnement complexe et la strategie.

Le system prompt definit le comportement de l'assistant. Ajoutez-le via le parametre system : client.messages.create(system="Tu es un expert en analyse financiere...", ...). Un bon system prompt cadre le ton, le format de reponse et les limites de l'agent.

Pour le streaming, utilisez client.messages.stream() dans un context manager. Cela permet d'afficher la reponse token par token, ce qui ameliore l'experience utilisateur. Le pattern : with client.messages.stream(...) as stream: for text in stream.text_stream: print(text, end="").

La gestion des erreurs est essentielle en production. Encapsulez vos appels dans des try/except pour attraper anthropic.APIError, anthropic.RateLimitError et anthropic.APITimeoutError. Implementez un retry avec backoff exponentiel pour les erreurs temporaires (429, 500, 529). Le SDK fournit aussi des retries automatiques configurables.`,
          xpReward: 25,
        },
        {
          id: 'pia-m3-l2',
          title: 'Jeu : Modeles Claude',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Classez les modeles Claude du plus rapide/economique au plus puissant/couteux',
            items: [
              'Claude Haiku — ultrarapide, taches simples',
              'Claude Sonnet — equilibre, redaction et analyse',
              'Claude Opus — raisonnement complexe, strategie',
            ],
            correctOrder: [0, 1, 2],
          },
          content: 'Classez les modeles Claude par niveau de puissance.',
          xpReward: 25,
        },
        {
          id: 'pia-m3-l3',
          title: 'Quiz — API Claude Python',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur l\'integration de Claude en Python.',
          quizQuestions: [
            {
              question: 'Comment le SDK anthropic charge-t-il la cle API par defaut ?',
              options: [
                'Il la demande interactivement',
                'Il lit la variable d\'environnement ANTHROPIC_API_KEY automatiquement',
                'Il la cherche dans un fichier config.json',
                'Il faut toujours la passer en parametre',
              ],
              correctIndex: 1,
              explanation: 'Le SDK anthropic lit automatiquement la variable d\'environnement ANTHROPIC_API_KEY. C\'est la methode recommandee, combinee avec python-dotenv pour le developpement local.',
            },
            {
              question: 'Quel modele Claude est recommande pour des taches de classification rapide ?',
              options: [
                'Claude Opus',
                'Claude Sonnet',
                'Claude Haiku',
                'Claude Extended',
              ],
              correctIndex: 2,
              explanation: 'Claude Haiku est le modele ultrarapide et economique, parfait pour la classification, l\'extraction de donnees et les taches simples a volume eleve.',
            },
            {
              question: 'Quel parametre definit le comportement global de l\'assistant dans l\'API Claude ?',
              options: [
                'persona',
                'system',
                'behavior',
                'instructions',
              ],
              correctIndex: 1,
              explanation: 'Le parametre system permet de definir un system prompt qui cadre le comportement, le ton et les limites de l\'assistant pour toute la conversation.',
            },
            {
              question: 'Comment activer le streaming des reponses avec le SDK Python ?',
              options: [
                'client.messages.create(stream=True)',
                'client.messages.stream() dans un context manager',
                'client.stream.messages()',
                'client.messages.create(mode="stream")',
              ],
              correctIndex: 1,
              explanation: 'La methode client.messages.stream() utilisee dans un with ... as stream permet de recevoir les tokens un par un via stream.text_stream.',
            },
            {
              question: 'Quelle erreur faut-il gerer en priorite pour les appels API en production ?',
              options: [
                'SyntaxError',
                'RateLimitError (429)',
                'ImportError',
                'FileNotFoundError',
              ],
              correctIndex: 1,
              explanation: 'Le RateLimitError (code 429) est l\'erreur la plus frequente en production. Il faut implementer un retry avec backoff exponentiel pour gerer les limites de debit.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F916}',
      badgeName: 'Claude Whisperer',
    },
    {
      id: 'pia-m4',
      title: 'Construire des agents IA',
      emoji: '\u{1F9E0}',
      description: 'Creez des agents autonomes capables de raisonner et d\'agir.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m4-l1',
          title: 'Architecture d\'un agent IA en Python',
          duration: '6 min',
          type: 'text',
          content: `Un agent IA est un programme qui recoit un objectif, raisonne sur les etapes necessaires, execute des actions et s'adapte en fonction des resultats. Contrairement a un simple appel API, un agent boucle jusqu'a atteindre son objectif. Voyons comment construire cette architecture en Python.

Le pattern fondamental est la boucle Perception-Decision-Action. L'agent percoit son environnement (donnees, resultats precedents), decide de la prochaine action (via un appel a Claude), execute cette action (appel API, lecture fichier, calcul), puis evalue le resultat. Si l'objectif n'est pas atteint, il reboucle.

En Python, definissez une classe Agent avec trois methodes principales : think() qui appelle Claude pour decider de la prochaine action, act() qui execute l'action decidee, et run() qui orchestre la boucle. La methode think() recoit l'historique des actions precedentes et le contexte actuel, et retourne soit une action a executer, soit "DONE" si l'objectif est atteint.

Les tools (outils) sont les capacites de votre agent. Definissez-les comme des fonctions Python que l'agent peut appeler : rechercher dans une base de donnees, envoyer un email, lire un fichier, faire un calcul. L'API Claude supporte nativement les tool_use — vous decrivez vos outils en JSON, et Claude choisit lequel utiliser et avec quels parametres.

La memoire est essentielle. Un agent sans memoire repete les memes erreurs. Implementez une liste de messages qui conserve tout l'historique de la conversation. Pour les agents longue duree, ajoutez une memoire resumee : periodiquement, demandez a Claude de resumer les actions passees pour compresser le contexte.

La gestion d'erreurs est critique dans un agent. Si un outil echoue, l'agent doit pouvoir le detecter, comprendre pourquoi (via le message d'erreur), et essayer une approche alternative. Ajoutez un compteur de tentatives (max 3 par action) et une limite globale d'iterations (max 20) pour eviter les boucles infinies.

Freenzy utilise cette architecture avec 136 agents specialises. Chaque agent a son system prompt, ses outils dedies et son niveau de modele (Haiku, Sonnet ou Opus). L'orchestrateur route la demande utilisateur vers le bon agent selon le domaine detecte.`,
          xpReward: 25,
        },
        {
          id: 'pia-m4-l2',
          title: 'Jeu : Composants d\'un agent',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre le cycle de fonctionnement d\'un agent IA',
            items: [
              'Perception — Recevoir les donnees et le contexte',
              'Decision — Appeler Claude pour choisir la prochaine action',
              'Action — Executer l\'outil choisi',
              'Evaluation — Verifier si l\'objectif est atteint',
              'Bouclage — Recommencer si necessaire',
            ],
            correctOrder: [0, 1, 2, 3, 4],
          },
          content: 'Ordonnez les etapes du cycle d\'un agent IA.',
          xpReward: 25,
        },
        {
          id: 'pia-m4-l3',
          title: 'Quiz — Agents IA',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre comprehension des agents IA.',
          quizQuestions: [
            {
              question: 'Quelle est la difference principale entre un appel API simple et un agent IA ?',
              options: [
                'Un agent utilise un modele plus puissant',
                'Un agent boucle et s\'adapte jusqu\'a atteindre son objectif',
                'Un agent est plus rapide',
                'Un agent n\'a pas besoin de prompt',
              ],
              correctIndex: 1,
              explanation: 'Un agent IA se distingue par sa capacite a boucler : il percoit, decide, agit, evalue, puis recommence jusqu\'a ce que l\'objectif soit atteint ou qu\'une limite soit atteinte.',
            },
            {
              question: 'Que sont les "tools" dans le contexte d\'un agent IA ?',
              options: [
                'Des librairies Python a installer',
                'Des fonctions que l\'agent peut appeler pour interagir avec l\'environnement',
                'Des modeles IA supplementaires',
                'Des fichiers de configuration',
              ],
              correctIndex: 1,
              explanation: 'Les tools sont des fonctions Python (recherche DB, envoi email, calcul, etc.) que l\'agent peut invoquer. Claude choisit l\'outil adapte et fournit les parametres via l\'API tool_use.',
            },
            {
              question: 'Pourquoi limiter le nombre d\'iterations d\'un agent ?',
              options: [
                'Pour reduire la consommation memoire',
                'Pour eviter les boucles infinies et les couts excessifs',
                'Pour accelerer l\'execution',
                'Pour simplifier le code',
              ],
              correctIndex: 1,
              explanation: 'Sans limite d\'iterations, un agent pourrait boucler indefiniment en cas de tache insoluble, engendrant des couts API importants et bloquant le systeme.',
            },
            {
              question: 'Comment un agent gere-t-il l\'echec d\'un outil ?',
              options: [
                'Il s\'arrete immediatement',
                'Il ignore l\'erreur et continue',
                'Il detecte l\'erreur, comprend la cause et essaie une approche alternative',
                'Il redemarre depuis le debut',
              ],
              correctIndex: 2,
              explanation: 'Un agent robuste capture l\'erreur, l\'ajoute au contexte, et demande a Claude une approche alternative. Le retry avec limite (max 3) evite la perseverance inutile.',
            },
            {
              question: 'Combien d\'agents specialises Freenzy utilise-t-il ?',
              options: [
                '10 agents',
                '50 agents',
                '136 agents',
                '500 agents',
              ],
              correctIndex: 2,
              explanation: 'Freenzy dispose de 136 agents specialises, chacun avec son system prompt, ses outils dedies et son niveau de modele (Haiku L1, Sonnet L2, Opus L3).',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F9E0}',
      badgeName: 'Agent Builder',
    },
    {
      id: 'pia-m5',
      title: 'Automatisation avec Python',
      emoji: '\u{26A1}',
      description: 'Automatisez les taches repetitives avec des scripts Python intelligents.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m5-l1',
          title: 'Scripts d\'automatisation IA',
          duration: '6 min',
          type: 'text',
          content: `L'automatisation est la ou Python et l'IA brillent ensemble. Au lieu de simplement automatiser des taches mecaniques comme un script bash, vous pouvez creer des automatisations intelligentes qui s'adaptent au contexte. Voyons les patterns les plus utiles.

Le premier pattern est le traitement par lot (batch processing). Vous avez 500 descriptions produits a ameliorer ? Chargez-les dans un DataFrame Pandas, puis bouclez en appelant Claude pour chaque description. Ajoutez un rate limiter (time.sleep entre les appels) et une barre de progression avec tqdm. Sauvegardez les resultats incrementalement pour ne pas tout perdre en cas d'erreur.

Le deuxieme pattern est le monitoring intelligent. Un script cron qui verifie vos metriques toutes les heures, detecte les anomalies et genere un rapport. Par exemple : charger les ventes du jour depuis une API, les comparer a la moyenne historique, et si l'ecart depasse 20%, demander a Claude d'analyser les causes possibles et envoyer une alerte par email.

Le troisieme pattern est le pipeline de contenu. Vous alimentez l'IA avec des donnees brutes (avis clients, articles concurrents, tendances Google) et elle produit du contenu structure : articles de blog, posts sociaux, newsletters. Le script orchestre tout : collecte des donnees, appel a Claude, formatage, et publication via les API des plateformes.

Pour la robustesse, implementez le pattern "checkpoint and resume". Sauvegardez l'etat de votre traitement dans un fichier JSON a chaque iteration. Si le script plante, il reprend la ou il s'est arrete au prochain lancement. C'est indispensable pour les traitements de longue duree.

La planification utilise cron (Linux/macOS) ou le Task Scheduler (Windows). Pour un setup plus avance, utilisez APScheduler en Python ou, mieux encore, un systeme de queue comme Celery ou BullMQ qui gere les retries, la concurrence et le monitoring.

Securisez vos scripts d'automatisation : loggez toutes les actions avec le module logging (pas de print), gerez les erreurs avec des try/except specifiques, et ajoutez des alertes en cas d'echec. Un script qui echoue silencieusement est pire qu'un script qui n'existe pas.`,
          xpReward: 25,
        },
        {
          id: 'pia-m5-l2',
          title: 'Exercice : Script de monitoring',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Creez un script Python d'automatisation qui :

1. Lit un fichier JSON "metriques.json" contenant : { "ventes_jour": 1500, "ventes_moyenne": 2000, "tickets_support": 45, "tickets_moyenne": 20 }
2. Compare chaque metrique a sa moyenne
3. Si un ecart > 20%, appelle Claude (via le SDK anthropic) pour analyser la cause probable
4. Genere un rapport structure avec :
   - Metriques normales (ecart < 20%)
   - Alertes avec l'analyse IA pour les anomalies
5. Sauvegarde le rapport dans "rapport_YYYYMMDD.json"
6. Affiche un resume dans la console

Incluez : gestion d'erreurs, logging avec le module logging, et un mecanisme de retry (max 2 tentatives par appel API).`,
          content: 'Creez un script de monitoring intelligent avec analyse IA.',
          xpReward: 25,
        },
        {
          id: 'pia-m5-l3',
          title: 'Quiz — Automatisation Python',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances en automatisation Python IA.',
          quizQuestions: [
            {
              question: 'Quel est l\'avantage d\'une automatisation IA par rapport a un script bash classique ?',
              options: [
                'Elle est plus rapide a executer',
                'Elle s\'adapte au contexte et peut prendre des decisions intelligentes',
                'Elle consomme moins de ressources',
                'Elle ne necessite pas de maintenance',
              ],
              correctIndex: 1,
              explanation: 'L\'IA ajoute une couche de comprehension contextuelle : au lieu de regles rigides, le script peut analyser, interpreter et s\'adapter a des situations imprevues.',
            },
            {
              question: 'Qu\'est-ce que le pattern "checkpoint and resume" ?',
              options: [
                'Redemarrer le script chaque heure',
                'Sauvegarder l\'etat du traitement pour reprendre en cas d\'interruption',
                'Verifier la connexion internet',
                'Creer des copies de sauvegarde du script',
              ],
              correctIndex: 1,
              explanation: 'Le checkpoint and resume sauvegarde la progression dans un fichier. Si le script plante apres 300 items sur 500, il reprend au 301e au prochain lancement.',
            },
            {
              question: 'Pourquoi ajouter un rate limiter (time.sleep) entre les appels API en batch ?',
              options: [
                'Pour economiser la memoire',
                'Pour eviter le rate limiting (erreur 429) de l\'API',
                'Pour ameliorer la qualite des reponses',
                'Pour reduire la taille des fichiers',
              ],
              correctIndex: 1,
              explanation: 'Les APIs ont des limites de debit. Sans pause entre les appels, vous declenchez des erreurs 429 (Too Many Requests) qui ralentissent plus que le rate limiting preventif.',
            },
            {
              question: 'Quel module Python est recommande pour le logging en production ?',
              options: [
                'print()',
                'Le module logging standard',
                'sys.stdout.write()',
                'pprint()',
              ],
              correctIndex: 1,
              explanation: 'Le module logging offre les niveaux (DEBUG, INFO, WARNING, ERROR), la rotation de fichiers, le formatage structure et l\'envoi vers des services externes — tout ce que print() ne fait pas.',
            },
            {
              question: 'Quelle librairie affiche une barre de progression pour les traitements par lot ?',
              options: [
                'progressbar',
                'tqdm',
                'alive-progress',
                'rich uniquement',
              ],
              correctIndex: 1,
              explanation: 'tqdm est la librairie standard pour les barres de progression en Python. Un simple for item in tqdm(items) affiche une barre avec ETA, vitesse et pourcentage.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{26A1}',
      badgeName: 'Automaticien',
    },
    {
      id: 'pia-m6',
      title: 'Deployer une app IA Python',
      emoji: '\u{1F680}',
      description: 'Mettez en production votre application IA Python de maniere professionnelle.',
      duration: '15 min',
      lessons: [
        {
          id: 'pia-m6-l1',
          title: 'Du script local a la production',
          duration: '6 min',
          type: 'text',
          content: `Votre script Python fonctionne en local — felicitations ! Mais le chemin vers la production demande de la rigueur. Cette lecon couvre les etapes essentielles pour deployer une application IA Python de maniere fiable et securisee.

Premiere etape : structurez votre code. Un script unique de 500 lignes est inmaintenable. Adoptez une structure modulaire : src/ contient vos modules Python (agent.py, tools.py, config.py), tests/ vos tests, et un fichier main.py comme point d'entree. Chaque module a une responsabilite unique. Ajoutez un fichier __init__.py dans chaque repertoire pour en faire un package.

Deuxieme etape : conteneurisez avec Docker. Creez un Dockerfile base sur python:3.12-slim. Copiez d'abord requirements.txt et installez les dependances (pour profiter du cache Docker), puis copiez le code. Utilisez un utilisateur non-root pour la securite. Le docker-compose.yml orchestre votre app avec ses services annexes (PostgreSQL, Redis).

Troisieme etape : les variables d'environnement. En production, les secrets ne viennent pas d'un fichier .env mais du systeme de deploiement (Coolify, Railway, AWS). Votre code doit lire os.environ sans dependre de dotenv. Validez la presence de chaque variable requise au demarrage avec une fonction check_config() qui arrete l'app si une variable manque.

Quatrieme etape : le monitoring. Ajoutez un endpoint /health qui verifie la connexion a la base de donnees, a Redis et a l'API Claude. Configurez des alertes sur les metriques cles : temps de reponse, taux d'erreur, utilisation memoire. Utilisez des logs structures JSON (pas de print) pour faciliter la recherche dans les outils de monitoring.

Cinquieme etape : la mise a jour sans interruption. Utilisez un deploiement blue-green ou rolling update via Docker Compose. La nouvelle version demarre et passe le health check avant que l'ancienne ne s'arrete. Cela garantit zero downtime pour vos utilisateurs.

Enfin, automatisez le deploiement avec un pipeline CI/CD. A chaque push sur main, les tests s'executent, l'image Docker est construite, et si tout passe, le deploiement s'effectue automatiquement. C'est le standard professionnel que nous detaillerons dans la formation CI/CD dediee.`,
          xpReward: 25,
        },
        {
          id: 'pia-m6-l2',
          title: 'Jeu : Etapes de deploiement',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre les etapes de deploiement d\'une app IA Python',
            items: [
              'Structurer le code en modules',
              'Ecrire les tests unitaires',
              'Creer le Dockerfile',
              'Configurer les variables d\'environnement',
              'Deployer avec Docker Compose',
              'Configurer le monitoring et les alertes',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          content: 'Ordonnez les etapes du deploiement d\'une application IA.',
          xpReward: 25,
        },
        {
          id: 'pia-m6-l3',
          title: 'Quiz — Deploiement Python IA',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances en deploiement d\'applications IA.',
          quizQuestions: [
            {
              question: 'Pourquoi copier requirements.txt avant le code dans un Dockerfile ?',
              options: [
                'Pour des raisons de securite',
                'Pour profiter du cache Docker et eviter de reinstaller les dependances a chaque modification de code',
                'Pour reduire la taille de l\'image',
                'C\'est obligatoire en Python',
              ],
              correctIndex: 1,
              explanation: 'Docker cache chaque layer. Si requirements.txt n\'a pas change, les dependances ne sont pas reinstallees, ce qui accelere enormement les builds iteratifs.',
            },
            {
              question: 'Que doit verifier un endpoint /health en production ?',
              options: [
                'Uniquement que le serveur repond',
                'La connexion a la DB, Redis et aux APIs externes',
                'Le nombre d\'utilisateurs connectes',
                'La version du code deploye',
              ],
              correctIndex: 1,
              explanation: 'Un health check complet verifie toutes les dependances critiques (DB, cache, APIs). Un serveur qui repond mais ne peut pas acceder a sa base de donnees n\'est pas vraiment healthy.',
            },
            {
              question: 'Pourquoi utiliser un utilisateur non-root dans le conteneur Docker ?',
              options: [
                'Pour economiser la memoire',
                'Pour limiter les dommages en cas de faille de securite',
                'Pour accelerer l\'execution',
                'Pour reduire la taille de l\'image',
              ],
              correctIndex: 1,
              explanation: 'Si un attaquant exploite une faille dans votre app, les privileges root lui donneraient un controle total sur le conteneur. Un utilisateur non-root limite l\'impact.',
            },
            {
              question: 'Qu\'est-ce qu\'un deploiement blue-green ?',
              options: [
                'Deployer sur deux clouds differents',
                'La nouvelle version demarre et est verifiee avant de remplacer l\'ancienne',
                'Deployer uniquement la nuit',
                'Utiliser deux langages de programmation',
              ],
              correctIndex: 1,
              explanation: 'Le blue-green maintient deux environnements. Le green (nouveau) demarre et passe les health checks avant que le trafic ne bascule. L\'ancien blue reste disponible pour un rollback rapide.',
            },
            {
              question: 'Comment les secrets doivent-ils etre geres en production ?',
              options: [
                'Dans un fichier .env commite dans Git',
                'En dur dans le code source',
                'Via les variables d\'environnement du systeme de deploiement',
                'Dans un fichier README',
              ],
              correctIndex: 2,
              explanation: 'En production, les secrets sont injectes par le systeme de deploiement (Coolify, AWS Secrets Manager, etc.), jamais depuis un fichier .env ou le code source.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F680}',
      badgeName: 'Ship It',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 2 — API REST Mastery
// ---------------------------------------------------------------------------

export const parcoursAPIRest: FormationParcours = {
  id: 'api-rest',
  title: 'API REST Mastery',
  emoji: '\u{1F310}',
  description: 'Concevez des APIs REST professionnelles : architecture, endpoints, authentification JWT, pagination, versioning et documentation OpenAPI.',
  category: 'technique',
  subcategory: 'api-rest',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#10B981',
  diplomaTitle: 'API REST Architect',
  diplomaSubtitle: 'Certification Freenzy.io — API REST Mastery',
  totalDuration: '1h30',
  totalXP: 900,
  available: true,
  modules: [
    {
      id: 'api-m1',
      title: 'Conception d\'une API REST',
      emoji: '\u{1F3D7}\u{FE0F}',
      description: 'Les principes fondamentaux pour concevoir une API REST propre et scalable.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m1-l1',
          title: 'Principes REST et bonnes pratiques',
          duration: '6 min',
          type: 'text',
          content: `REST (Representational State Transfer) est le standard dominant pour les APIs web. Comprendre ses principes fondamentaux est essentiel pour concevoir des APIs que d'autres developpeurs aimeront utiliser. Cette lecon pose les bases d'une architecture REST solide.

Le premier principe est l'orientation ressource. Une API REST expose des ressources (utilisateurs, produits, commandes) via des URLs previsibles. Chaque ressource a une URL unique : /api/users pour la collection, /api/users/123 pour un utilisateur specifique. Les URLs utilisent des noms au pluriel, jamais des verbes — c'est la methode HTTP qui definit l'action.

Les methodes HTTP ont chacune un role precis. GET lit une ressource (jamais d'effet de bord). POST cree une nouvelle ressource. PUT remplace integralement une ressource existante. PATCH modifie partiellement une ressource. DELETE supprime. Respecter ces conventions rend votre API intuitive pour tout developpeur qui la decouvre.

Les codes de statut HTTP communiquent le resultat. 200 OK pour un succes, 201 Created apres un POST reussi, 204 No Content apres un DELETE. 400 Bad Request pour une requete invalide, 401 Unauthorized sans authentification, 403 Forbidden sans les droits, 404 Not Found si la ressource n'existe pas. 500 Internal Server Error pour les erreurs cote serveur. N'inventez pas vos propres codes.

La structure de reponse doit etre coherente. Adoptez un format unique pour toutes vos reponses : { "data": ..., "meta": { "total": 100, "page": 1 } } pour les succes, et { "error": { "code": "VALIDATION_ERROR", "message": "..." } } pour les erreurs. La coherence permet aux clients de traiter toutes les reponses avec la meme logique.

L'architecture en couches separe les responsabilites. Le routeur recoit la requete et la dirige. Le controller valide les parametres et orchestre. Le service contient la logique metier. Le repository accede a la base de donnees. Cette separation facilite les tests, la maintenance et l'evolution de chaque couche independamment.

Chez Freenzy, l'API Express suit ces principes avec 21 routes structurees, une validation Zod sur toutes les entrees, et des reponses JSON coherentes avec codes HTTP standards.`,
          xpReward: 25,
        },
        {
          id: 'api-m1-l2',
          title: 'Jeu : Methodes HTTP',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'GET', right: 'Lire une ressource sans effet de bord' },
              { left: 'POST', right: 'Creer une nouvelle ressource' },
              { left: 'PUT', right: 'Remplacer integralement une ressource' },
              { left: 'PATCH', right: 'Modifier partiellement une ressource' },
              { left: 'DELETE', right: 'Supprimer une ressource' },
              { left: '201 Created', right: 'Reponse apres creation reussie' },
            ],
          },
          content: 'Associez chaque methode HTTP a son role.',
          xpReward: 25,
        },
        {
          id: 'api-m1-l3',
          title: 'Quiz — Conception REST',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les principes REST.',
          quizQuestions: [
            {
              question: 'Comment nommer correctement l\'endpoint pour recuperer tous les utilisateurs ?',
              options: [
                '/api/getUsers',
                '/api/users',
                '/api/user/list',
                '/api/fetch-all-users',
              ],
              correctIndex: 1,
              explanation: 'En REST, on utilise des noms de ressource au pluriel. L\'action est definie par la methode HTTP (GET), pas par le nom de l\'URL.',
            },
            {
              question: 'Quel code HTTP renvoyer apres la creation reussie d\'une ressource (POST) ?',
              options: [
                '200 OK',
                '201 Created',
                '204 No Content',
                '301 Moved Permanently',
              ],
              correctIndex: 1,
              explanation: '201 Created indique qu\'une nouvelle ressource a ete creee avec succes. La reponse devrait inclure la ressource creee et un header Location.',
            },
            {
              question: 'Quelle est la difference entre PUT et PATCH ?',
              options: [
                'PUT est plus rapide que PATCH',
                'PUT remplace integralement la ressource, PATCH modifie partiellement',
                'PATCH est deprecie en faveur de PUT',
                'Il n\'y a aucune difference',
              ],
              correctIndex: 1,
              explanation: 'PUT envoie la totalite de la ressource pour remplacement. PATCH envoie uniquement les champs a modifier, ce qui est plus leger pour les mises a jour partielles.',
            },
            {
              question: 'Pourquoi eviter les verbes dans les URLs REST ?',
              options: [
                'Les URLs ont une limite de caracteres',
                'La methode HTTP definit deja l\'action, les verbes seraient redondants',
                'Les verbes ne sont pas supportes par les navigateurs',
                'Pour des raisons de securite',
              ],
              correctIndex: 1,
              explanation: 'GET /api/users "lit les utilisateurs". Le verbe est dans la methode HTTP. Ajouter /api/getUsers est redondant et casse la convention REST.',
            },
            {
              question: 'Quel code HTTP utiliser quand un utilisateur n\'est pas authentifie ?',
              options: [
                '400 Bad Request',
                '401 Unauthorized',
                '403 Forbidden',
                '404 Not Found',
              ],
              correctIndex: 1,
              explanation: '401 signifie que l\'utilisateur n\'est pas identifie (pas de token ou token invalide). 403 signifie qu\'il est identifie mais n\'a pas les droits suffisants.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F3D7}\u{FE0F}',
      badgeName: 'API Architect',
    },
    {
      id: 'api-m2',
      title: 'Endpoints et routing avance',
      emoji: '\u{1F6E4}\u{FE0F}',
      description: 'Structurez vos endpoints avec des patterns de routing professionnels.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m2-l1',
          title: 'Patterns de routing avance',
          duration: '6 min',
          type: 'text',
          content: `Au-dela des CRUD basiques, une API REST mature utilise des patterns de routing avances pour gerer la complexite. Cette lecon couvre les techniques que les APIs professionnelles utilisent au quotidien.

Les ressources imbriquees modelisent les relations. Un utilisateur a des commandes ? L'endpoint est GET /api/users/123/orders. Une commande a des articles ? GET /api/users/123/orders/456/items. La regle : ne depassez jamais 3 niveaux d'imbrication. Au-dela, utilisez des filtres : GET /api/items?order_id=456 est plus lisible que 4 niveaux d'URL.

Les actions non-CRUD existent dans toute API reelle. Envoyer un email, valider une commande, exporter un rapport — ce ne sont pas des operations CRUD classiques. Deux approches : utiliser un sous-endpoint verbal (POST /api/orders/123/validate) ou un endpoint d'action (POST /api/actions/send-report). La premiere est preferee quand l'action porte sur une ressource specifique.

Le filtrage, le tri et la recherche utilisent les query parameters. GET /api/products?category=electronics&sort=-price&search=phone retourne les produits electroniques contenant "phone", tries par prix decroissant. Le prefixe "-" indique un tri descendant. Standardisez ces conventions dans votre documentation.

Les middleware Express structurent le traitement des requetes en couches. Un middleware d'authentification verifie le JWT avant chaque route protegee. Un middleware de validation (Zod) verifie le corps de la requete. Un middleware de logging enregistre chaque appel. Un middleware d'erreur centralise la gestion des erreurs. L'ordre des middleware est crucial.

Le pattern Controller-Service-Repository separe les responsabilites. Le controller (route handler) extrait et valide les parametres de la requete, appelle le service, et retourne la reponse HTTP. Le service contient la logique metier pure, sans dependance a Express. Le repository gere les requetes SQL. Cette separation permet de tester chaque couche independamment.

En Express 5, attention au typage des parametres. req.params['id'] retourne string | string[] | undefined. Wrappez toujours avec String(req.params['id'] || '') et validez le format avant usage. C'est un piege classique qui cause des crashes en production si on l'oublie.`,
          xpReward: 25,
        },
        {
          id: 'api-m2-l2',
          title: 'Exercice : Concevoir une API',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Concevez l'API REST complete pour une application de gestion de projets. Definissez :

1. Les ressources principales : projets, taches, membres, commentaires
2. Les endpoints CRUD pour chaque ressource (methode HTTP + URL + description)
3. Les relations (ressources imbriquees avec max 2 niveaux)
4. Les actions non-CRUD : assigner une tache, archiver un projet, exporter en PDF
5. Les query parameters pour : filtrage par statut, tri par date, recherche par titre
6. Les codes HTTP de retour pour chaque endpoint

Format attendu pour chaque endpoint :
[METHODE] /api/chemin — Description — Code(s) retour

Bonus : indiquez quels endpoints necessitent une authentification et quels roles (admin, membre, viewer) y ont acces.`,
          content: 'Concevez une API REST complete pour une app de gestion de projets.',
          xpReward: 25,
        },
        {
          id: 'api-m2-l3',
          title: 'Quiz — Routing avance',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise du routing REST avance.',
          quizQuestions: [
            {
              question: 'Quelle est la profondeur maximale recommandee pour les ressources imbriquees ?',
              options: [
                '1 niveau',
                '2 niveaux',
                '3 niveaux',
                'Pas de limite',
              ],
              correctIndex: 2,
              explanation: 'Au-dela de 3 niveaux, les URLs deviennent illisibles. Preferez les query parameters (GET /api/items?order_id=456) pour les relations profondes.',
            },
            {
              question: 'Comment trier les resultats par prix decroissant en REST ?',
              options: [
                '?sort=price_desc',
                '?sort=-price',
                '?order=price&direction=desc',
                '?sortBy=price&reverse=true',
              ],
              correctIndex: 1,
              explanation: 'Le prefixe "-" devant le nom du champ est la convention standard pour un tri descendant. C\'est concis et largement adopte.',
            },
            {
              question: 'Comment gerer l\'action "valider une commande" en REST ?',
              options: [
                'GET /api/orders/123/validate',
                'POST /api/orders/123/validate',
                'PUT /api/validate/orders/123',
                'VALIDATE /api/orders/123',
              ],
              correctIndex: 1,
              explanation: 'POST sur un sous-endpoint verbal (/validate) est l\'approche standard pour les actions non-CRUD sur une ressource specifique. GET serait incorrect car l\'action a un effet de bord.',
            },
            {
              question: 'En Express 5, que retourne req.params[\'id\'] ?',
              options: [
                'Toujours un string',
                'string | string[] | undefined',
                'Un nombre',
                'Un objet JSON',
              ],
              correctIndex: 1,
              explanation: 'Express 5 type les params comme string | string[] | undefined. Il faut wrapper avec String(req.params[\'id\'] || \'\') pour eviter les crashes sur undefined.',
            },
            {
              question: 'Quel est le role d\'un middleware d\'erreur centralise ?',
              options: [
                'Logger uniquement les erreurs',
                'Intercepter toutes les erreurs et renvoyer une reponse JSON coherente',
                'Relancer le serveur en cas d\'erreur',
                'Envoyer un email a l\'admin',
              ],
              correctIndex: 1,
              explanation: 'Un middleware d\'erreur centralise capture toutes les erreurs (throw ou next(error)) et retourne une reponse JSON avec le bon code HTTP, garantissant la coherence.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F6E4}\u{FE0F}',
      badgeName: 'Route Master',
    },
    {
      id: 'api-m3',
      title: 'Authentification JWT',
      emoji: '\u{1F512}',
      description: 'Implementez une authentification securisee par JSON Web Tokens.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m3-l1',
          title: 'JWT : theorie et implementation',
          duration: '6 min',
          type: 'text',
          content: `L'authentification JWT (JSON Web Token) est le standard pour securiser les APIs REST. Un JWT est un token signe qui contient des informations sur l'utilisateur, evitant de stocker les sessions cote serveur. Voyons comment l'implementer correctement.

Un JWT se compose de trois parties separees par des points : header.payload.signature. Le header indique l'algorithme de signature (HS256 ou RS256). Le payload contient les claims — des paires cle/valeur avec les informations utilisateur (userId, email, role). La signature garantit que le token n'a pas ete modifie.

Le flux d'authentification est simple. L'utilisateur envoie ses identifiants (POST /api/auth/login). Le serveur verifie le mot de passe (hash bcrypt), puis genere un JWT signe avec un secret. Le client stocke ce token et l'envoie dans le header Authorization: Bearer <token> a chaque requete. Le serveur verifie la signature et extrait les informations utilisateur.

Les claims standard incluent : sub (subject, l'ID utilisateur), iat (issued at, date de creation), exp (expiration, duree de vie). Ajoutez vos claims custom : role, email, organizationId. Attention : le payload est encode en base64, pas chiffre. Ne mettez jamais de donnees sensibles (mot de passe, numero de carte) dans le JWT.

La duree de vie est critique pour la securite. Un access token court (15-30 minutes) limite les degats si le token est vole. Un refresh token long (7-30 jours) permet de regenerer l'access token sans redemander le mot de passe. Stockez le refresh token en base de donnees pour pouvoir le revoquer. Le client appelle POST /api/auth/refresh avec le refresh token pour obtenir un nouvel access token.

Le middleware d'authentification Express verifie le JWT sur chaque route protegee. Il extrait le token du header Authorization, verifie la signature avec jwt.verify(), et attache l'utilisateur decode a req.user. Si le token est invalide ou expire, il retourne 401 Unauthorized.

Le RBAC (Role-Based Access Control) ajoute une couche d'autorisation. Apres l'authentification (qui es-tu ?), le RBAC verifie les droits (as-tu le droit ?). Un middleware requireRole(['admin']) verifie que req.user.role est dans la liste autorisee. Freenzy utilise 4 roles : admin, operator, viewer, system.`,
          xpReward: 25,
        },
        {
          id: 'api-m3-l2',
          title: 'Jeu : Anatomie d\'un JWT',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre le flux d\'authentification JWT',
            items: [
              'L\'utilisateur envoie email + mot de passe (POST /auth/login)',
              'Le serveur verifie le mot de passe avec bcrypt',
              'Le serveur genere un JWT signe avec le secret',
              'Le client stocke le token et l\'envoie dans le header Authorization',
              'Le middleware verifie la signature et extrait l\'utilisateur',
            ],
            correctOrder: [0, 1, 2, 3, 4],
          },
          content: 'Remettez dans l\'ordre les etapes de l\'authentification JWT.',
          xpReward: 25,
        },
        {
          id: 'api-m3-l3',
          title: 'Quiz — Authentification JWT',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur JWT et la securite API.',
          quizQuestions: [
            {
              question: 'Le payload d\'un JWT est-il chiffre ?',
              options: [
                'Oui, il est chiffre avec AES-256',
                'Non, il est seulement encode en base64 — lisible par tous',
                'Oui, avec la cle privee du serveur',
                'Ca depend de l\'algorithme utilise',
              ],
              correctIndex: 1,
              explanation: 'Le payload JWT est encode en base64, pas chiffre. N\'importe qui peut le decoder. La signature garantit l\'integrite, pas la confidentialite. N\'y mettez jamais de secrets.',
            },
            {
              question: 'Pourquoi utiliser un access token court (15-30 min) avec un refresh token long ?',
              options: [
                'Pour economiser la bande passante',
                'Pour limiter les degats si l\'access token est vole, tout en gardant l\'utilisateur connecte',
                'Pour eviter les problemes de cache',
                'C\'est une convention sans raison technique',
              ],
              correctIndex: 1,
              explanation: 'Un access token vole est exploitable jusqu\'a son expiration. En le gardant court, on limite la fenetre d\'attaque. Le refresh token permet de renouveler sans redemander le mot de passe.',
            },
            {
              question: 'Quelle est la difference entre authentification et autorisation (RBAC) ?',
              options: [
                'Ce sont des synonymes',
                'L\'authentification verifie l\'identite, l\'autorisation verifie les droits',
                'L\'autorisation est plus securisee',
                'L\'authentification utilise des tokens, l\'autorisation des cookies',
              ],
              correctIndex: 1,
              explanation: 'L\'authentification repond a "qui es-tu ?" (verification du JWT). L\'autorisation repond a "as-tu le droit ?" (verification du role). Les deux sont necessaires.',
            },
            {
              question: 'Ou stocker le refresh token cote serveur ?',
              options: [
                'Dans le JWT lui-meme',
                'En base de donnees pour pouvoir le revoquer',
                'Dans un cookie uniquement',
                'En memoire du serveur',
              ],
              correctIndex: 1,
              explanation: 'Stocker le refresh token en base de donnees permet de le revoquer (deconnexion forcee, changement de mot de passe). Un JWT seul ne peut pas etre revoque avant son expiration.',
            },
            {
              question: 'Combien de roles RBAC utilise Freenzy ?',
              options: [
                '2 (admin, user)',
                '3 (admin, editor, viewer)',
                '4 (admin, operator, viewer, system)',
                '5 (superadmin, admin, editor, viewer, guest)',
              ],
              correctIndex: 2,
              explanation: 'Freenzy utilise 4 roles : admin (acces total), operator (gestion courante), viewer (lecture seule), system (operations automatisees internes).',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F512}',
      badgeName: 'Auth Guardian',
    },
    {
      id: 'api-m4',
      title: 'Pagination et filtrage',
      emoji: '\u{1F4D1}',
      description: 'Implementez une pagination performante et un filtrage avance.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m4-l1',
          title: 'Pagination et filtrage performants',
          duration: '6 min',
          type: 'text',
          content: `Sans pagination, une API qui retourne 10 000 enregistrements d'un coup est inutilisable. La pagination, le filtrage et le tri sont essentiels pour des APIs performantes a grande echelle. Voyons les strategies et leurs compromis.

La pagination offset-based est la plus simple : GET /api/users?page=2&limit=20. Le serveur execute SELECT * FROM users LIMIT 20 OFFSET 20. La reponse inclut les metadonnees : { "data": [...], "meta": { "total": 500, "page": 2, "limit": 20, "totalPages": 25 } }. Le client peut ainsi afficher une navigation par page.

Le probleme de l'offset : sur les grandes tables, OFFSET 10000 est lent car PostgreSQL doit parcourir 10 000 lignes pour les ignorer. La pagination cursor-based resout ce probleme : GET /api/users?after=abc123&limit=20. Le curseur est un identifiant opaque (souvent l'ID ou un timestamp encode). Le serveur utilise WHERE id > cursor_id LIMIT 20, qui est toujours rapide grace a l'index.

Le filtrage utilise les query parameters avec des conventions claires. Egalite : ?status=active. Comparaison : ?price_min=10&price_max=100. Liste : ?category=tech,science. Recherche texte : ?search=keyword. Dates : ?created_after=2024-01-01. Documentez chaque filtre et ses valeurs acceptees.

Le tri suit la convention ?sort=field pour l'ascendant et ?sort=-field pour le descendant. Le tri multiple est possible : ?sort=-created_at,name trie par date decroissante puis par nom croissant. Limitez les champs triables aux colonnes indexees pour eviter les full table scans.

La selection de champs (sparse fieldsets) reduit la taille des reponses : GET /api/users?fields=id,name,email retourne uniquement ces trois champs au lieu de l'objet complet. C'est particulierement utile pour les clients mobiles avec une bande passante limitee.

Les headers de pagination enrichissent la reponse. X-Total-Count pour le nombre total, Link pour les URLs prev/next/first/last (standard RFC 5988). Ces headers permettent une navigation generique cote client sans parser le corps de la reponse.

En production, ajoutez toujours une limite maximale (ex: limit ne peut pas depasser 100). Un client malveillant ou buggue qui demande limit=999999 pourrait saturer votre serveur. Definissez un default (20) et un max (100) dans votre configuration.`,
          xpReward: 25,
        },
        {
          id: 'api-m4-l2',
          title: 'Jeu : Types de pagination',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Offset-based', right: 'Simple mais lent sur grandes tables' },
              { left: 'Cursor-based', right: 'Rapide grace a l\'index, pas de page jumping' },
              { left: 'X-Total-Count', right: 'Header avec le nombre total d\'elements' },
              { left: 'Sparse fieldsets', right: 'Selection des champs retournes' },
              { left: '?sort=-price', right: 'Tri par prix decroissant' },
              { left: 'limit max', right: 'Protection contre les requetes trop larges' },
            ],
          },
          content: 'Associez chaque concept de pagination a sa description.',
          xpReward: 25,
        },
        {
          id: 'api-m4-l3',
          title: 'Quiz — Pagination et filtrage',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise de la pagination REST.',
          quizQuestions: [
            {
              question: 'Pourquoi la pagination offset est-elle lente sur les grandes tables ?',
              options: [
                'Elle utilise trop de memoire',
                'PostgreSQL doit parcourir toutes les lignes jusqu\'a l\'offset avant de retourner les resultats',
                'Elle ne fonctionne pas avec les index',
                'Elle bloque les autres requetes',
              ],
              correctIndex: 1,
              explanation: 'OFFSET 10000 force PostgreSQL a lire et ignorer 10 000 lignes. Plus l\'offset est grand, plus la requete est lente, meme avec un index.',
            },
            {
              question: 'Quel avantage offre la pagination cursor-based ?',
              options: [
                'Elle permet le "page jumping" (aller directement a la page 50)',
                'Les performances sont constantes quelle que soit la position dans les donnees',
                'Elle est plus simple a implementer',
                'Elle fonctionne sans base de donnees',
              ],
              correctIndex: 1,
              explanation: 'WHERE id > cursor utilise l\'index B-tree et est toujours rapide, que vous soyez au debut ou a la fin des donnees. En contrepartie, on ne peut pas "sauter" a une page specifique.',
            },
            {
              question: 'Quelle limite maximale est recommandee pour le parametre limit ?',
              options: [
                'Pas de limite',
                'limit max 100 avec default 20',
                'limit max 10',
                'limit max 10000',
              ],
              correctIndex: 1,
              explanation: 'Un max de 100 protege le serveur tout en offrant de la flexibilite. Le default a 20 est un bon compromis pour la plupart des interfaces utilisateur.',
            },
            {
              question: 'A quoi sert le header Link dans les reponses paginee ?',
              options: [
                'A indiquer le type de contenu',
                'A fournir les URLs de navigation (prev, next, first, last)',
                'A securiser la connexion',
                'A compresser la reponse',
              ],
              correctIndex: 1,
              explanation: 'Le header Link (RFC 5988) fournit les URLs prev/next/first/last, permettant au client de naviguer sans construire les URLs manuellement.',
            },
            {
              question: 'Comment implementer un filtre "prix entre 10 et 100" en REST ?',
              options: [
                '?price=10-100',
                '?price_min=10&price_max=100',
                '?price=[10,100]',
                '?filter=price:10:100',
              ],
              correctIndex: 1,
              explanation: 'La convention price_min/price_max est la plus explicite et la plus facile a parser cote serveur. Chaque parametre est independant et peut etre utilise seul.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4D1}',
      badgeName: 'Pagination Pro',
    },
    {
      id: 'api-m5',
      title: 'Versioning d\'API',
      emoji: '\u{1F3F7}\u{FE0F}',
      description: 'Gerez l\'evolution de votre API sans casser les clients existants.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m5-l1',
          title: 'Strategies de versioning',
          duration: '6 min',
          type: 'text',
          content: `Votre API evolue, mais vos clients ne peuvent pas tous se mettre a jour en meme temps. Le versioning permet de faire evoluer l'API tout en maintenant la compatibilite avec les versions precedentes. C'est un sujet crucial en production.

La premiere strategie est le versioning par URL : /api/v1/users, /api/v2/users. C'est la methode la plus visible et la plus simple a comprendre. Le client choisit explicitement sa version. Les anciennes versions restent disponibles pendant une periode de deprecation. C'est l'approche la plus repandue (utilisee par Stripe, GitHub, Twilio).

La deuxieme strategie utilise le header Accept : Accept: application/vnd.myapi.v2+json. L'URL reste propre (/api/users), et la version est dans le header. Plus elegant mais moins visible — un developpeur qui copie une URL perd l'information de version. Moins utilisee en pratique.

La troisieme strategie est le query parameter : /api/users?version=2. Simple a tester dans un navigateur mais considere comme une mauvaise pratique car la version n'est pas une "option" — c'est un choix structurel. A eviter pour les APIs publiques.

Les breaking changes sont les modifications qui cassent les clients existants : supprimer un champ, renommer un champ, changer le type d'un champ, modifier la structure de la reponse. Ces changements necessitent une nouvelle version majeure. En revanche, ajouter un champ optionnel, ajouter un nouvel endpoint ou ajouter une valeur a un enum sont des changements non-breaking qui ne necessitent pas de nouvelle version.

La strategie de deprecation est essentielle. Annoncez la deprecation 6 mois a l'avance. Ajoutez un header Deprecation: true et Sunset: <date> aux reponses de l'ancienne version. Envoyez des emails aux developpeurs utilisant l'ancienne version. Loggez les appels a l'ancienne version pour suivre la migration. Ne coupez jamais une version sans preavis.

En interne, maintenez un fichier CHANGELOG.md qui documente chaque changement par version. Utilisez le semantic versioning : majeur (breaking changes), mineur (nouvelles fonctionnalites), patch (corrections). Les clients peuvent ainsi evaluer l'effort de mise a jour avant de migrer.

Freenzy utilise le versioning par URL (v1) avec une convention interne de non-breaking changes pour les mises a jour courantes. Les breaking changes sont reserves aux changements majeurs de l'architecture.`,
          xpReward: 25,
        },
        {
          id: 'api-m5-l2',
          title: 'Jeu : Breaking vs Non-breaking',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Supprimer un champ', right: 'Breaking change' },
              { left: 'Ajouter un champ optionnel', right: 'Non-breaking change' },
              { left: 'Renommer un champ', right: 'Breaking change' },
              { left: 'Ajouter un endpoint', right: 'Non-breaking change' },
              { left: 'Changer le type d\'un champ', right: 'Breaking change' },
              { left: 'Ajouter une valeur a un enum', right: 'Non-breaking change' },
            ],
          },
          content: 'Classez chaque modification en breaking ou non-breaking.',
          xpReward: 25,
        },
        {
          id: 'api-m5-l3',
          title: 'Quiz — Versioning API',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le versioning d\'API.',
          quizQuestions: [
            {
              question: 'Quelle strategie de versioning est la plus repandue ?',
              options: [
                'Header Accept',
                'Query parameter',
                'Versioning par URL (/api/v1/...)',
                'Pas de versioning',
              ],
              correctIndex: 2,
              explanation: 'Le versioning par URL est utilise par Stripe, GitHub, Twilio et la majorite des APIs publiques. Il est explicite, visible et simple a comprendre.',
            },
            {
              question: 'Lequel de ces changements n\'est PAS un breaking change ?',
              options: [
                'Supprimer le champ "email" de la reponse',
                'Ajouter un champ optionnel "phone" a la reponse',
                'Renommer "userName" en "username"',
                'Changer le type de "age" de number a string',
              ],
              correctIndex: 1,
              explanation: 'Ajouter un champ optionnel est non-breaking : les clients existants ignorent simplement le nouveau champ. Supprimer, renommer ou changer un type casse les clients.',
            },
            {
              question: 'Quel delai minimum de preavis pour deprecer une version d\'API ?',
              options: [
                '1 semaine',
                '1 mois',
                '6 mois',
                '2 ans',
              ],
              correctIndex: 2,
              explanation: '6 mois est le standard de l\'industrie pour donner aux developpeurs le temps de migrer. Des APIs critiques comme celles de Stripe donnent parfois 12 mois.',
            },
            {
              question: 'Quel header signale qu\'une version d\'API est depreciee ?',
              options: [
                'X-Deprecated: true',
                'Deprecation: true et Sunset: <date>',
                'Warning: deprecated',
                'Status: 299',
              ],
              correctIndex: 1,
              explanation: 'Les headers Deprecation et Sunset (RFC 8594) sont les standards pour signaler la deprecation et la date de fin de support d\'une API.',
            },
            {
              question: 'En semantic versioning, que signifie un changement de version majeure (v1 a v2) ?',
              options: [
                'De nouvelles fonctionnalites ont ete ajoutees',
                'Des bugs ont ete corriges',
                'Des breaking changes ont ete introduits',
                'Les performances ont ete ameliorees',
              ],
              correctIndex: 2,
              explanation: 'En semver, un increment majeur (v1 a v2) signale des breaking changes. Le mineur ajoute des fonctionnalites, le patch corrige des bugs — tous deux retro-compatibles.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F3F7}\u{FE0F}',
      badgeName: 'Version Control',
    },
    {
      id: 'api-m6',
      title: 'Documentation OpenAPI',
      emoji: '\u{1F4DD}',
      description: 'Documentez votre API avec OpenAPI/Swagger pour faciliter l\'adoption.',
      duration: '15 min',
      lessons: [
        {
          id: 'api-m6-l1',
          title: 'OpenAPI et Swagger',
          duration: '6 min',
          type: 'text',
          content: `Une API non documentee est une API inutilisable. OpenAPI (anciennement Swagger) est le standard pour decrire, documenter et tester les APIs REST. Un fichier OpenAPI bien ecrit remplace des heures d'echanges entre equipes. Voyons comment l'exploiter au maximum.

OpenAPI est une specification YAML ou JSON qui decrit exhaustivement votre API : les endpoints, les parametres, les schemas de requete et de reponse, l'authentification, les codes d'erreur. Un seul fichier openapi.yaml devient la source de verite pour toute votre API.

La structure d'un fichier OpenAPI commence par les metadonnees (titre, version, description), puis les servers (URL de base pour chaque environnement), les paths (chaque endpoint avec ses methodes), les components/schemas (les modeles de donnees reutilisables), et enfin les securitySchemes (JWT Bearer, API Key, etc.).

Les schemas definissent la forme de vos donnees avec JSON Schema. Un schema User : type object, properties { id: integer, email: string (format email), name: string (minLength 2), role: enum [admin, operator, viewer, system] }, required: [id, email, name]. Ces schemas sont reutilisables dans tout le document via les references : $ref: '#/components/schemas/User'.

Les exemples enrichissent la documentation. Pour chaque endpoint, ajoutez un example concret de requete et de reponse. Le developpeur qui decouvre votre API comprend immediatement le format attendu sans lire la specification complete. Swagger UI affiche ces exemples dans une interface interactive.

Swagger UI transforme votre fichier OpenAPI en une page web interactive. Les developpeurs peuvent lire la documentation, voir les schemas, tester les endpoints directement depuis le navigateur (bouton "Try it out"), et copier les commandes curl. C'est l'outil numero un pour l'adoption d'une API.

La generation de code est un bonus majeur. A partir de votre fichier OpenAPI, des outils comme openapi-generator creent automatiquement des SDKs client (TypeScript, Python, Java, etc.), des stubs serveur, et des tests. Le fichier OpenAPI devient ainsi le contrat entre le frontend et le backend, eliminant les erreurs d'integration.

Maintenez toujours votre documentation synchronisee avec le code. Utilisez des decorateurs ou des commentaires JSDoc pour generer le fichier OpenAPI automatiquement depuis le code source.`,
          xpReward: 25,
        },
        {
          id: 'api-m6-l2',
          title: 'Exercice : Documenter une API',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Ecrivez la specification OpenAPI (en YAML) pour un endpoint de gestion d'utilisateurs.

Documentez ces 3 endpoints :
1. GET /api/v1/users — Liste paginee (query params: page, limit, search, role)
2. POST /api/v1/users — Creer un utilisateur (body: email, name, role)
3. GET /api/v1/users/{id} — Recuperer un utilisateur par ID

Pour chaque endpoint, incluez :
- Description claire
- Parametres avec types et validation (required, format, enum, minLength)
- Schema de requete (POST)
- Schema de reponse (200, 201, 400, 401, 404)
- Exemples concrets
- Tag pour le regroupement (Users)
- SecurityScheme: Bearer JWT

Definissez les components/schemas reutilisables : User, UserCreate, PaginatedResponse, ErrorResponse.`,
          content: 'Redigez une specification OpenAPI complete pour une API utilisateurs.',
          xpReward: 25,
        },
        {
          id: 'api-m6-l3',
          title: 'Quiz — Documentation OpenAPI',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur OpenAPI et la documentation API.',
          quizQuestions: [
            {
              question: 'Quel est l\'ancien nom d\'OpenAPI ?',
              options: [
                'REST Spec',
                'Swagger',
                'RAML',
                'API Blueprint',
              ],
              correctIndex: 1,
              explanation: 'OpenAPI etait anciennement connu sous le nom de Swagger. Le nom a change en 2016 quand la specification a ete donnee a l\'OpenAPI Initiative sous Linux Foundation.',
            },
            {
              question: 'Comment referencer un schema reutilisable dans OpenAPI ?',
              options: [
                'include: User',
                '$ref: \'#/components/schemas/User\'',
                'schema: @User',
                'type: User',
              ],
              correctIndex: 1,
              explanation: 'La syntaxe $ref avec le chemin JSON Pointer permet de referencer des schemas definis dans components/schemas, evitant la duplication.',
            },
            {
              question: 'Que permet Swagger UI ?',
              options: [
                'Uniquement afficher la documentation',
                'Lire la doc, tester les endpoints interactivement et copier les commandes curl',
                'Deployer l\'API automatiquement',
                'Generer le code backend',
              ],
              correctIndex: 1,
              explanation: 'Swagger UI est une interface web interactive qui affiche la documentation, permet de tester les endpoints avec "Try it out", et fournit les commandes curl correspondantes.',
            },
            {
              question: 'Quel outil genere des SDKs client a partir d\'un fichier OpenAPI ?',
              options: [
                'swagger-ui',
                'openapi-generator',
                'postman',
                'redoc',
              ],
              correctIndex: 1,
              explanation: 'openapi-generator cree automatiquement des SDKs client (TypeScript, Python, Java, etc.), des stubs serveur et des tests a partir de la specification OpenAPI.',
            },
            {
              question: 'Pourquoi ajouter des exemples concrets dans la documentation OpenAPI ?',
              options: [
                'C\'est obligatoire selon la spec',
                'Pour que les developpeurs comprennent immediatement le format sans lire toute la specification',
                'Pour accelerer le chargement de Swagger UI',
                'Pour les tests automatises uniquement',
              ],
              correctIndex: 1,
              explanation: 'Les exemples concrets sont la premiere chose que les developpeurs regardent. Un bon exemple vaut mieux qu\'une longue description des schemas.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Doc Master',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 3 — Bases de donnees pour l'IA
// ---------------------------------------------------------------------------

export const parcoursBDD: FormationParcours = {
  id: 'bases-donnees-ia',
  title: 'Bases de donnees pour l\'IA',
  emoji: '\u{1F5C4}\u{FE0F}',
  description: 'Maitrisez les bases de donnees pour l\'IA : SQL avance, indexation, PostgreSQL, migrations, pgvector et optimisation des performances.',
  category: 'technique',
  subcategory: 'bases-donnees',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#8B5CF6',
  diplomaTitle: 'Database Engineer IA',
  diplomaSubtitle: 'Certification Freenzy.io — Bases de donnees pour l\'Intelligence Artificielle',
  totalDuration: '1h30',
  totalXP: 900,
  available: true,
  modules: [
    {
      id: 'bdd-m1',
      title: 'SQL avance',
      emoji: '\u{1F4CB}',
      description: 'Depassez les bases du SQL avec les requetes avancees et les fonctions analytiques.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m1-l1',
          title: 'Requetes SQL avancees',
          duration: '6 min',
          type: 'text',
          content: `Le SQL basique (SELECT, WHERE, JOIN) ne suffit pas en production. Les requetes avancees vous permettent d'extraire des insights complexes en une seule requete, sans post-traitement cote application. Maitrisez ces techniques et vous gagnerez en performance et en clarte.

Les CTEs (Common Table Expressions) structurent les requetes complexes en blocs nommees. Au lieu d'imbriquer 3 sous-requetes illisibles, vous ecrivez WITH active_users AS (SELECT ...), user_stats AS (SELECT ... FROM active_users) SELECT ... FROM user_stats. Chaque CTE est une etape logique, lisible et reutilisable dans la requete principale.

Les fonctions de fenetre (window functions) calculent des agregats sans regrouper les lignes. ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) attribue un numero a chaque ligne par utilisateur, permettant de recuperer "la derniere commande de chaque client" en une requete. RANK(), LAG(), LEAD(), SUM() OVER() sont tout aussi puissants.

Les jointures laterales (LATERAL JOIN) executent une sous-requete pour chaque ligne de la table principale. C'est l'equivalent SQL d'une boucle foreach : pour chaque utilisateur, recuperer ses 3 derniers achats. Sans LATERAL, cette requete necesiterait des sous-requetes correlees beaucoup moins performantes.

L'UPSERT (INSERT ... ON CONFLICT ... DO UPDATE) gere l'insertion ou la mise a jour en une seule operation atomique. Plus besoin de verifier si l'enregistrement existe avant d'inserer. INSERT INTO stats (user_id, count) VALUES (123, 1) ON CONFLICT (user_id) DO UPDATE SET count = stats.count + 1.

Les requetes recursives (WITH RECURSIVE) parcourent les structures arborescentes : hierarchie d'employes, categories imbriquees, threads de commentaires. La CTE recursive se reference elle-meme pour descendre dans l'arbre niveau par niveau.

EXPLAIN ANALYZE est votre meilleur ami pour comprendre les performances. Il affiche le plan d'execution de PostgreSQL : quels index sont utilises, combien de lignes sont parcourues, ou se trouvent les goulots d'etranglement. Executez EXPLAIN ANALYZE avant chaque requete complexe en production pour verifier qu'elle utilise bien les index prevus.`,
          xpReward: 25,
        },
        {
          id: 'bdd-m1-l2',
          title: 'Jeu : Concepts SQL avance',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'CTE (WITH)', right: 'Sous-requetes nommees et lisibles' },
              { left: 'Window function', right: 'Agregat sans regroupement des lignes' },
              { left: 'LATERAL JOIN', right: 'Sous-requete executee pour chaque ligne' },
              { left: 'UPSERT', right: 'INSERT ou UPDATE en une operation' },
              { left: 'WITH RECURSIVE', right: 'Parcours de structures arborescentes' },
              { left: 'EXPLAIN ANALYZE', right: 'Plan d\'execution et performances' },
            ],
          },
          content: 'Associez chaque concept SQL avance a sa description.',
          xpReward: 25,
        },
        {
          id: 'bdd-m1-l3',
          title: 'Quiz — SQL avance',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez votre maitrise du SQL avance.',
          quizQuestions: [
            {
              question: 'A quoi sert une CTE (Common Table Expression) ?',
              options: [
                'A creer une table temporaire persistante',
                'A structurer une requete complexe en blocs nommees et lisibles',
                'A chiffrer les donnees',
                'A creer un index',
              ],
              correctIndex: 1,
              explanation: 'Les CTEs (WITH ... AS) decomposent une requete complexe en etapes logiques nommees, rendant le SQL beaucoup plus lisible et maintenable.',
            },
            {
              question: 'Que fait ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) ?',
              options: [
                'Compte le nombre total de lignes',
                'Attribue un numero sequentiel a chaque ligne par utilisateur, la plus recente en premier',
                'Trie la table par date',
                'Supprime les doublons',
              ],
              correctIndex: 1,
              explanation: 'ROW_NUMBER() numerote chaque ligne dans sa partition (par user_id). ORDER BY DESC met la plus recente en position 1, permettant de filtrer WHERE rn = 1 pour la derniere.',
            },
            {
              question: 'Que fait l\'UPSERT (ON CONFLICT DO UPDATE) ?',
              options: [
                'Supprime puis recree l\'enregistrement',
                'Insere si l\'enregistrement n\'existe pas, met a jour s\'il existe — en une operation atomique',
                'Verrouille la table pendant l\'operation',
                'Cree un doublon avec un nouveau ID',
              ],
              correctIndex: 1,
              explanation: 'L\'UPSERT gere les deux cas (insertion et mise a jour) en une seule requete atomique, evitant les race conditions et simplifiant le code.',
            },
            {
              question: 'Quel outil affiche le plan d\'execution d\'une requete PostgreSQL ?',
              options: [
                'SELECT PLAN',
                'EXPLAIN ANALYZE',
                'SHOW EXECUTION',
                'DEBUG QUERY',
              ],
              correctIndex: 1,
              explanation: 'EXPLAIN ANALYZE execute la requete et affiche le plan reel : index utilises, nombre de lignes parcourues, temps par etape. C\'est indispensable pour l\'optimisation.',
            },
            {
              question: 'Quand utiliser un LATERAL JOIN ?',
              options: [
                'Pour joindre deux tables par cle etrangere',
                'Pour executer une sous-requete dependante pour chaque ligne de la table principale',
                'Pour fusionner deux tables identiques',
                'Pour creer une vue materialisee',
              ],
              correctIndex: 1,
              explanation: 'LATERAL JOIN permet a la sous-requete de referencer des colonnes de la ligne courante. Ideal pour "les N derniers elements de chaque groupe".',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4CB}',
      badgeName: 'SQL Expert',
    },
    {
      id: 'bdd-m2',
      title: 'Indexation et performances',
      emoji: '\u{26A1}',
      description: 'Optimisez les performances avec une strategie d\'indexation efficace.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m2-l1',
          title: 'Strategie d\'indexation PostgreSQL',
          duration: '6 min',
          type: 'text',
          content: `Un index bien place peut transformer une requete de 5 secondes en 5 millisecondes. Mais trop d'index ralentissent les ecritures. La strategie d'indexation est un equilibre entre performances de lecture et cout d'ecriture. Voyons comment trouver ce point optimal.

L'index B-tree est le type par defaut et le plus polyvalent. Il excelle pour les egalites (WHERE email = 'x'), les comparaisons (WHERE age > 30), le tri (ORDER BY created_at) et les prefixes de texte (WHERE name LIKE 'Jean%'). Creez un B-tree sur chaque colonne utilisee frequemment dans les clauses WHERE et ORDER BY.

L'index composite couvre plusieurs colonnes. CREATE INDEX idx_users_status_date ON users(status, created_at) est utilise pour WHERE status = 'active' ORDER BY created_at. L'ordre des colonnes est crucial : les colonnes d'egalite d'abord, puis les colonnes de tri ou de range. Un index (A, B) fonctionne pour les requetes sur A seul, mais PAS pour B seul.

L'index partiel ne couvre qu'un sous-ensemble des donnees. CREATE INDEX idx_active_users ON users(email) WHERE status = 'active'. Si seulement 10% des utilisateurs sont actifs, cet index est 10 fois plus petit et plus rapide qu'un index complet. Ideal pour les statuts, les flags booleans et les soft deletes.

L'index GIN (Generalized Inverted Index) est optimal pour les recherches full-text, les tableaux PostgreSQL et les colonnes JSONB. CREATE INDEX idx_tags ON articles USING GIN(tags). Il permet des requetes comme WHERE tags @> ARRAY['python', 'ia'] — trouver les articles tagges "python" ET "ia".

L'index unique enforce une contrainte d'unicite au niveau de la base de donnees. CREATE UNIQUE INDEX idx_email ON users(email). C'est la derniere ligne de defense contre les doublons, meme si votre code applicatif verifie aussi.

Pour diagnostiquer les index manquants, utilisez pg_stat_user_tables pour voir les sequential scans (seq_scan vs idx_scan). Si une table a beaucoup de seq_scan, il manque probablement un index. EXPLAIN ANALYZE sur les requetes lentes revele exactement quel index est necessaire.

Attention au sur-indexation. Chaque index ralentit les INSERT, UPDATE et DELETE car PostgreSQL doit maintenir l'index a jour. Regle pratique : un index qui n'est pas utilise par au moins une requete frequente doit etre supprime.`,
          xpReward: 25,
        },
        {
          id: 'bdd-m2-l2',
          title: 'Exercice : Plan d\'indexation',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Vous avez une table "orders" avec 2 millions de lignes et ces colonnes :
- id (serial, PK)
- user_id (integer, FK)
- status (varchar: 'pending', 'paid', 'shipped', 'delivered', 'cancelled')
- total_amount (decimal)
- created_at (timestamp)
- updated_at (timestamp)

Les requetes les plus frequentes sont :
1. SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
2. SELECT * FROM orders WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24h'
3. SELECT user_id, SUM(total_amount) FROM orders WHERE status = 'paid' GROUP BY user_id
4. SELECT * FROM orders WHERE id = ? (deja indexe par PK)

Pour chaque requete :
1. Proposez l'index optimal (type, colonnes, ordre, partiel si pertinent)
2. Ecrivez la commande CREATE INDEX
3. Expliquez pourquoi cet index est efficace
4. Estimez l'impact sur les performances

Bonus : identifiez un index a NE PAS creer et expliquez pourquoi.`,
          content: 'Concevez une strategie d\'indexation pour une table de commandes.',
          xpReward: 25,
        },
        {
          id: 'bdd-m2-l3',
          title: 'Quiz — Indexation',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur l\'indexation PostgreSQL.',
          quizQuestions: [
            {
              question: 'Dans un index composite (A, B), quelles requetes sont couvertes ?',
              options: [
                'Uniquement WHERE A = x AND B = y',
                'WHERE A = x, WHERE A = x AND B = y, mais PAS WHERE B = y seul',
                'Toutes les combinaisons de A et B',
                'Uniquement WHERE B = y',
              ],
              correctIndex: 1,
              explanation: 'Un index composite est utilisable de gauche a droite. (A, B) couvre A seul et A+B, mais pas B seul. L\'ordre des colonnes est donc crucial.',
            },
            {
              question: 'Quand utiliser un index partiel ?',
              options: [
                'Quand la table a beaucoup de colonnes',
                'Quand une condition WHERE ne concerne qu\'un petit pourcentage des lignes',
                'Quand la table est en lecture seule',
                'Quand on utilise des JOIN',
              ],
              correctIndex: 1,
              explanation: 'Un index partiel (WHERE status = \'active\') est ideal quand seul un petit sous-ensemble des lignes est concerne. L\'index est plus petit, plus rapide et occupe moins d\'espace disque.',
            },
            {
              question: 'Quel type d\'index est optimal pour les colonnes JSONB ?',
              options: [
                'B-tree',
                'GIN',
                'BRIN',
                'Hash',
              ],
              correctIndex: 1,
              explanation: 'GIN (Generalized Inverted Index) est concu pour les types complexes : JSONB, arrays, full-text search. Il permet des requetes sur les cles et valeurs du JSON.',
            },
            {
              question: 'Pourquoi eviter le sur-indexation ?',
              options: [
                'PostgreSQL a une limite de 10 index par table',
                'Chaque index ralentit les INSERT, UPDATE et DELETE',
                'Les index occupent trop de RAM',
                'Les index ne fonctionnent pas avec les transactions',
              ],
              correctIndex: 1,
              explanation: 'Chaque ecriture doit maintenir tous les index a jour. Plus il y a d\'index, plus les ecritures sont lentes. Un index inutilise est un cout sans benefice.',
            },
            {
              question: 'Comment detecter les index manquants dans PostgreSQL ?',
              options: [
                'pg_stat_user_tables montre le ratio seq_scan vs idx_scan',
                'SHOW MISSING INDEXES',
                'SELECT * FROM pg_indexes WHERE missing = true',
                'Les index manquants sont detectes automatiquement',
              ],
              correctIndex: 0,
              explanation: 'pg_stat_user_tables montre combien de sequential scans (lents) vs index scans (rapides) chaque table subit. Un ratio eleve de seq_scan indique un index manquant.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{26A1}',
      badgeName: 'Index Strategist',
    },
    {
      id: 'bdd-m3',
      title: 'PostgreSQL en production',
      emoji: '\u{1F418}',
      description: 'Configurez et administrez PostgreSQL pour un environnement de production.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m3-l1',
          title: 'PostgreSQL en production',
          duration: '6 min',
          type: 'text',
          content: `PostgreSQL est la base de donnees la plus robuste de l'ecosysteme open source. Mais une installation par defaut n'est pas optimisee pour la production. Cette lecon couvre les configurations essentielles pour un PostgreSQL performant et fiable.

Le fichier postgresql.conf contient les parametres de performance. Les plus importants : shared_buffers (25% de la RAM, ex: 4GB sur un serveur 16GB), effective_cache_size (75% de la RAM), work_mem (memoire par operation de tri, 256MB pour les requetes analytiques), maintenance_work_mem (pour VACUUM et CREATE INDEX, 1GB). Ces quatre parametres ont le plus d'impact sur les performances.

Le connection pooling est indispensable. PostgreSQL cree un processus par connexion (fork), ce qui limite le nombre de connexions simultanees. PgBouncer agit comme un proxy devant PostgreSQL : il maintient un pool de connexions reutilisables. Configurez max_connections a 200 dans PostgreSQL et laissez PgBouncer gerer les milliers de connexions entrantes.

La configuration WAL (Write-Ahead Logging) affecte la durabilite et les performances. wal_level = replica pour permettre la replication. max_wal_size = 2GB pour eviter les checkpoints trop frequents. checkpoint_completion_target = 0.9 pour etaler les ecritures. Ces parametres equilibrent performance et securite des donnees.

VACUUM est le ramasse-miettes de PostgreSQL. Chaque UPDATE et DELETE laisse des "dead tuples" — des lignes mortes qui occupent de l'espace. VACUUM les nettoie. AUTOVACUUM est active par defaut, mais surveillez ses logs. Une table tres ecrite (millions d'UPDATEs/jour) peut necessiter un VACUUM plus agressif.

Les backups en production utilisent pg_dump pour les sauvegardes logiques (exportation SQL) et pg_basebackup pour les sauvegardes physiques (copie binaire). Freenzy utilise pg_dump quotidien avec rotation 7 jours dans /root/backups/freenzy/. Testez regulierement la restoration — un backup non teste n'est pas un backup.

La supervision utilise pg_stat_activity pour les requetes en cours, pg_stat_user_tables pour les statistiques par table, et pg_stat_bgwriter pour les performances d'ecriture. Configurez des alertes sur les connexions actives, les requetes lentes (> 5s), l'espace disque et le lag de replication.

En Docker, attention a l'espace disque. Le cache Docker peut remplir le disque et crasher PostgreSQL. Freenzy a vecu cet incident. Configurez un monitoring disque et un nettoyage automatique (docker system prune).`,
          xpReward: 25,
        },
        {
          id: 'bdd-m3-l2',
          title: 'Jeu : Configuration PostgreSQL',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'shared_buffers', right: '25% de la RAM du serveur' },
              { left: 'PgBouncer', right: 'Connection pooling' },
              { left: 'VACUUM', right: 'Nettoyage des dead tuples' },
              { left: 'pg_dump', right: 'Sauvegarde logique SQL' },
              { left: 'pg_stat_activity', right: 'Requetes en cours d\'execution' },
              { left: 'WAL', right: 'Journal d\'ecriture anticipee' },
            ],
          },
          content: 'Associez chaque concept PostgreSQL a sa description.',
          xpReward: 25,
        },
        {
          id: 'bdd-m3-l3',
          title: 'Quiz — PostgreSQL production',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur PostgreSQL en production.',
          quizQuestions: [
            {
              question: 'Quelle valeur recommandee pour shared_buffers sur un serveur 16GB ?',
              options: [
                '128MB (valeur par defaut)',
                '4GB (25% de la RAM)',
                '16GB (100% de la RAM)',
                '64MB',
              ],
              correctIndex: 1,
              explanation: 'La regle standard est 25% de la RAM pour shared_buffers. Au-dela, le systeme de cache de l\'OS devient moins efficace. Sur 16GB, 4GB est optimal.',
            },
            {
              question: 'Pourquoi utiliser PgBouncer devant PostgreSQL ?',
              options: [
                'Pour chiffrer les connexions',
                'Pour gerer un pool de connexions reutilisables et eviter le cout du fork par connexion',
                'Pour sauvegarder les donnees',
                'Pour compresser les requetes',
              ],
              correctIndex: 1,
              explanation: 'PostgreSQL cree un processus par connexion (fork), ce qui est couteux. PgBouncer reutilise les connexions, permettant de supporter des milliers de clients avec peu de connexions PostgreSQL.',
            },
            {
              question: 'Que fait VACUUM dans PostgreSQL ?',
              options: [
                'Defragmente le disque',
                'Nettoie les dead tuples laisses par les UPDATE et DELETE',
                'Optimise les requetes SELECT',
                'Compresse les tables',
              ],
              correctIndex: 1,
              explanation: 'Chaque UPDATE/DELETE cree des dead tuples (lignes mortes). VACUUM les recupere et rend l\'espace reutilisable. AUTOVACUUM le fait automatiquement mais doit etre surveille.',
            },
            {
              question: 'Quel outil de sauvegarde exporte les donnees en format SQL ?',
              options: [
                'pg_basebackup',
                'pg_dump',
                'pg_restore',
                'pg_ctl',
              ],
              correctIndex: 1,
              explanation: 'pg_dump produit une sauvegarde logique (commandes SQL). pg_basebackup fait une copie binaire complete. Les deux sont complementaires — pg_dump est plus flexible pour la restauration partielle.',
            },
            {
              question: 'Quel incident lie a Docker peut crasher PostgreSQL ?',
              options: [
                'Trop de requetes simultanees',
                'Le cache Docker remplit le disque, PostgreSQL ne peut plus ecrire',
                'Docker limite la CPU',
                'Le reseau Docker tombe',
              ],
              correctIndex: 1,
              explanation: 'Le cache Docker (images, layers, volumes) peut remplir le disque. PostgreSQL a besoin d\'espace pour les WAL et les donnees. Sans espace, il crashe. Freenzy a vecu cet incident.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F418}',
      badgeName: 'PG Admin',
    },
    {
      id: 'bdd-m4',
      title: 'Migrations de base de donnees',
      emoji: '\u{1F4E6}',
      description: 'Gerez l\'evolution du schema de votre base de donnees avec des migrations.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m4-l1',
          title: 'Migrations : schema as code',
          duration: '6 min',
          type: 'text',
          content: `Les migrations transforment votre schema de base de donnees en code versionne. Au lieu de modifier les tables manuellement avec des commandes SQL ad-hoc, chaque changement est un fichier de migration numerote, reversible et commite dans Git. C'est le fondement d'un deploiement fiable.

Une migration est un fichier qui contient deux operations : "up" (appliquer le changement) et "down" (annuler le changement). Par exemple, la migration 001_create_users.sql contient CREATE TABLE users (...) en up et DROP TABLE users en down. Chaque migration a un numero sequentiel ou un timestamp qui garantit l'ordre d'execution.

Le principe est simple : la base de donnees de production doit toujours etre le resultat de l'application sequentielle de toutes les migrations. Un nouveau developpeur clone le repo, execute "migrate up" et obtient exactement le meme schema que la production. Plus de documentation perimee, plus de "tu as oublie d'ajouter cette colonne".

Les outils de migration (knex, prisma, typeorm, golang-migrate) gerent une table interne (souvent migration_history) qui enregistre les migrations deja appliquees. Quand vous executez "migrate up", seules les nouvelles migrations sont executees. C'est idempotent et sur.

Les bonnes pratiques pour les migrations : chaque migration fait un seul changement logique (pas 5 modifications dans un fichier). Les migrations sont immutables une fois commitees — ne modifiez jamais une migration deja appliquee en production. Si vous devez corriger, creez une nouvelle migration. Testez toujours le "down" pour verifier que le rollback fonctionne.

Les migrations dangereuses necessitent une attention particuliere. Supprimer une colonne est irreversible (les donnees sont perdues). Renommer une colonne peut casser l'application si le deploiement n'est pas synchronise. La strategie "expand-contract" resout ce probleme : d'abord ajouter la nouvelle colonne, migrer les donnees, mettre a jour le code, puis supprimer l'ancienne colonne dans une migration ulterieure.

Freenzy utilise 5 fichiers de migration dans src/db/migrations/ plus des scripts complementaires dans scripts/migrate-*.sql. Chaque changement de schema passe par une migration, jamais par une commande manuelle sur la production.`,
          xpReward: 25,
        },
        {
          id: 'bdd-m4-l2',
          title: 'Jeu : Ordre des migrations',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre le processus de migration de base de donnees',
            items: [
              'Creer le fichier de migration (up + down)',
              'Tester la migration en local',
              'Tester le rollback (down) en local',
              'Commiter la migration dans Git',
              'Appliquer en staging et verifier',
              'Appliquer en production',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          content: 'Ordonnez les etapes du processus de migration.',
          xpReward: 25,
        },
        {
          id: 'bdd-m4-l3',
          title: 'Quiz — Migrations',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur les migrations de base de donnees.',
          quizQuestions: [
            {
              question: 'Pourquoi ne jamais modifier une migration deja appliquee en production ?',
              options: [
                'Le fichier est en lecture seule',
                'Les autres environnements ont deja applique l\'ancienne version, creant une incoherence',
                'Git ne le permet pas',
                'Ca prendrait trop de temps',
              ],
              correctIndex: 1,
              explanation: 'Une migration deja appliquee est consideree comme terminee par le systeme. La modifier creerait un ecart entre les environnements. Creez une nouvelle migration corrective.',
            },
            {
              question: 'Qu\'est-ce que la strategie "expand-contract" ?',
              options: [
                'Augmenter puis reduire la taille de la table',
                'Ajouter d\'abord la nouvelle colonne, migrer les donnees, puis supprimer l\'ancienne',
                'Dupliquer la base de donnees',
                'Compresser les donnees avant migration',
              ],
              correctIndex: 1,
              explanation: 'Expand-contract evite les breaking changes : on ajoute le nouveau (expand), on migre les donnees et le code, puis on supprime l\'ancien (contract). Zero downtime.',
            },
            {
              question: 'Que contient la table migration_history ?',
              options: [
                'Les donnees sauvegardees',
                'La liste des migrations deja appliquees avec leurs dates',
                'Le schema actuel de la base',
                'Les requetes SQL executees',
              ],
              correctIndex: 1,
              explanation: 'migration_history enregistre chaque migration appliquee et sa date. Le systeme compare cette liste avec les fichiers disponibles pour savoir lesquels restent a executer.',
            },
            {
              question: 'Pourquoi tester le "down" (rollback) de chaque migration ?',
              options: [
                'C\'est obligatoire pour que le "up" fonctionne',
                'Pour pouvoir annuler rapidement un deploiement defectueux en production',
                'Pour accelerer les migrations',
                'Pour reduire la taille de la base',
              ],
              correctIndex: 1,
              explanation: 'Un rollback fonctionnel est votre filet de securite. Si une migration cause un probleme en production, "migrate down" annule le changement et retablit l\'etat precedent.',
            },
            {
              question: 'Combien de changements logiques par fichier de migration est recommande ?',
              options: [
                'Autant que possible pour reduire le nombre de fichiers',
                'Un seul changement logique par migration',
                'Exactement 3',
                'Ca depend de la taille de la table',
              ],
              correctIndex: 1,
              explanation: 'Un changement par migration facilite le debug, le rollback et la revue de code. Si un changement echoue, il est isole et n\'affecte pas les autres.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Migration Master',
    },
    {
      id: 'bdd-m5',
      title: 'pgvector et recherche semantique',
      emoji: '\u{1F9ED}',
      description: 'Utilisez pgvector pour la recherche semantique et la memoire RAG.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m5-l1',
          title: 'pgvector : la recherche semantique dans PostgreSQL',
          duration: '6 min',
          type: 'text',
          content: `pgvector est l'extension qui transforme PostgreSQL en base de donnees vectorielle. Au lieu de chercher par mots-cles exacts (WHERE title LIKE '%Python%'), vous pouvez chercher par sens semantique : "trouvez les articles similaires a celui-ci". C'est le fondement de la memoire RAG (Retrieval-Augmented Generation) pour l'IA.

Le principe : chaque texte est transforme en un vecteur d'embedding — un tableau de 1536 nombres decimaux qui represente le "sens" du texte dans un espace mathematique. Deux textes semantiquement proches ont des vecteurs proches. L'embedding est genere par un modele comme text-embedding-3-small d'OpenAI ou via l'API d'Anthropic.

L'installation de pgvector est simple : CREATE EXTENSION vector. Puis creez une colonne de type vector(1536) dans votre table : ALTER TABLE documents ADD COLUMN embedding vector(1536). Le nombre 1536 correspond a la dimension du modele d'embedding utilise.

La recherche par similarite utilise l'operateur <=> (distance cosinus). SELECT * FROM documents ORDER BY embedding <=> query_embedding LIMIT 10 retourne les 10 documents les plus proches semantiquement de votre requete. Pas besoin de mots-cles exacts — la recherche comprend le sens.

L'indexation vectorielle est essentielle pour les performances. Sans index, PostgreSQL compare le vecteur de requete a chaque vecteur de la table (scan lineaire). Avec un index IVFFlat ou HNSW, la recherche est logarithmique. CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops). HNSW est plus precis et recommande pour la plupart des cas.

Le pipeline RAG complet : l'utilisateur pose une question. Vous generez l'embedding de la question. Vous cherchez les K documents les plus proches avec pgvector. Vous envoyez ces documents comme contexte a Claude avec la question. Claude genere une reponse basee sur vos donnees specifiques, pas seulement sur son entrainement general.

Freenzy utilise pgvector pour la memoire RAG de ses agents. Chaque conversation, document et interaction est vectorise et stocke. Quand un utilisateur pose une question, les agents retrouvent le contexte pertinent dans l'historique, ce qui rend leurs reponses plus personnalisees et precises. La table utilise vector(1536) avec un index HNSW pour des recherches en quelques millisecondes.`,
          xpReward: 25,
        },
        {
          id: 'bdd-m5-l2',
          title: 'Exercice : Pipeline RAG',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Concevez un pipeline RAG complet pour un systeme de support client. Ecrivez :

1. Le schema SQL de la table "knowledge_base" avec :
   - id, title, content (texte original), embedding (vector 1536), category, created_at
   - L'index HNSW sur la colonne embedding

2. La requete SQL pour trouver les 5 articles les plus pertinents pour une question utilisateur :
   - Utiliser la distance cosinus (<=>)
   - Filtrer par categorie si fournie
   - Retourner id, title, content et le score de similarite

3. Le pseudo-code du pipeline complet :
   - Recevoir la question utilisateur
   - Generer l'embedding de la question
   - Chercher les 5 articles les plus proches
   - Construire le prompt pour Claude avec le contexte
   - Envoyer a Claude et retourner la reponse

4. Le prompt system pour Claude qui utilise le contexte RAG (indiquez ou inserer les articles retrouves et la question).`,
          content: 'Concevez un pipeline RAG complet avec pgvector.',
          xpReward: 25,
        },
        {
          id: 'bdd-m5-l3',
          title: 'Quiz — pgvector et RAG',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur pgvector et la recherche semantique.',
          quizQuestions: [
            {
              question: 'Qu\'est-ce qu\'un embedding dans le contexte de l\'IA ?',
              options: [
                'Un mot-cle extrait du texte',
                'Un vecteur de nombres representant le sens semantique d\'un texte',
                'Un hash du contenu',
                'Un identifiant unique du document',
              ],
              correctIndex: 1,
              explanation: 'Un embedding est un vecteur de 1536 nombres (pour text-embedding-3-small) qui capture le sens semantique du texte. Deux textes au sens proche ont des vecteurs proches.',
            },
            {
              question: 'Quel operateur pgvector utilise-t-on pour la distance cosinus ?',
              options: [
                '<>',
                '<=>',
                '@@',
                '~=',
              ],
              correctIndex: 1,
              explanation: 'L\'operateur <=> calcule la distance cosinus entre deux vecteurs. Plus la distance est petite, plus les textes sont semantiquement proches. C\'est la metrique la plus utilisee.',
            },
            {
              question: 'Quel type d\'index est recommande pour pgvector ?',
              options: [
                'B-tree',
                'GIN',
                'HNSW',
                'Hash',
              ],
              correctIndex: 2,
              explanation: 'HNSW (Hierarchical Navigable Small World) offre les meilleures performances et la meilleure precision pour la recherche vectorielle. Il est plus rapide que IVFFlat pour la plupart des cas.',
            },
            {
              question: 'Que signifie RAG ?',
              options: [
                'Random Access Generation',
                'Retrieval-Augmented Generation',
                'Recursive AI Gateway',
                'Real-time API Gateway',
              ],
              correctIndex: 1,
              explanation: 'RAG (Retrieval-Augmented Generation) consiste a retrouver des documents pertinents puis a les fournir comme contexte au LLM pour generer une reponse basee sur vos donnees specifiques.',
            },
            {
              question: 'Pourquoi la recherche vectorielle est-elle superieure a la recherche par mots-cles pour un support client ?',
              options: [
                'Elle est plus rapide',
                'Elle comprend le sens semantique et trouve des resultats meme sans mots-cles exacts',
                'Elle est plus simple a implementer',
                'Elle utilise moins de stockage',
              ],
              correctIndex: 1,
              explanation: 'Un client qui demande "ma commande n\'arrive pas" sera matche avec un article "Suivi des livraisons et retards" meme sans mots communs. La recherche par mots-cles aurait echoue.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F9ED}',
      badgeName: 'Vector Search Pro',
    },
    {
      id: 'bdd-m6',
      title: 'Optimisation des performances',
      emoji: '\u{1F3CE}\u{FE0F}',
      description: 'Techniques avancees pour optimiser les performances de votre base de donnees.',
      duration: '15 min',
      lessons: [
        {
          id: 'bdd-m6-l1',
          title: 'Optimisation avancee PostgreSQL',
          duration: '6 min',
          type: 'text',
          content: `Meme avec les bons index, une base de donnees peut devenir lente si l'architecture n'est pas optimisee. Cette lecon couvre les techniques avancees pour maintenir des performances elevees a grande echelle.

Le query planning commence par EXPLAIN ANALYZE. Lisez le plan d'execution de bas en haut. Les noeuds les plus couteux sont en bas. Cherchez les "Seq Scan" sur les grandes tables (index manquant), les "Hash Join" avec beaucoup de lignes (jointure inefficace), et les "Sort" sans index (tri couteux). Le temps reel (actual time) est plus fiable que le cout estime.

Le partitionnement divise une grande table en sous-tables basees sur un critere. CREATE TABLE events (...) PARTITION BY RANGE (created_at) puis une partition par mois. PostgreSQL ne scanne que les partitions pertinentes pour chaque requete. Une requete sur les evenements de mars ne touche pas les 11 autres mois. Ideal pour les tables de logs, d'evenements et de transactions.

Les vues materialisees pre-calculent des requetes couteuses. CREATE MATERIALIZED VIEW monthly_stats AS SELECT ... La vue stocke physiquement les resultats. Rafraichissez-la periodiquement avec REFRESH MATERIALIZED VIEW CONCURRENTLY (sans bloquer les lectures). Parfait pour les dashboards et les rapports qui ne necessitent pas des donnees en temps reel.

Le caching applicatif avec Redis reduit la charge sur PostgreSQL. Cachez les resultats des requetes frequentes et couteuses. Pattern cache-aside : verifier Redis, si absent executer la requete SQL, stocker dans Redis avec un TTL. Freenzy utilise Redis avec un TTL de 300 secondes et un maxmemory de 256MB en politique LRU.

La denormalisation controlee ameliore les performances de lecture au prix de la complexite d'ecriture. Au lieu de joindre 5 tables a chaque requete, stockez les donnees frequemment lues ensemble. Un champ "total_orders" dans la table users evite un COUNT(*) sur la table orders a chaque affichage de profil. Mettez a jour ce compteur via un trigger ou dans votre code applicatif.

Le connection pooling et la gestion des requetes longues sont essentiels. Configurez un statement_timeout (30 secondes) pour tuer les requetes qui s'eternisent. Utilisez pg_stat_activity pour identifier les requetes bloquantes. Optimisez les requetes N+1 (une requete par element d'une liste) en les remplacant par un seul IN (...) ou un JOIN.

En resume : mesurez avant d'optimiser (EXPLAIN ANALYZE), indexez les colonnes filtrees et triees, partitionnez les grandes tables, cachez les resultats frequents, et surveillez en continu.`,
          xpReward: 25,
        },
        {
          id: 'bdd-m6-l2',
          title: 'Jeu : Techniques d\'optimisation',
          duration: '4 min',
          type: 'game',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'EXPLAIN ANALYZE', back: 'Affiche le plan d\'execution reel avec les temps de chaque etape' },
              { front: 'Partitionnement', back: 'Diviser une table en sous-tables par critere (date, region) pour reduire les scans' },
              { front: 'Vue materialisee', back: 'Resultat de requete pre-calcule et stocke physiquement, rafraichi periodiquement' },
              { front: 'Cache Redis', back: 'Stockage en memoire des resultats frequents avec TTL pour reduire la charge SQL' },
              { front: 'Denormalisation', back: 'Stocker des donnees redondantes pour eviter des jointures couteuses en lecture' },
              { front: 'Requete N+1', back: 'Anti-pattern : une requete par element au lieu d\'un seul IN() ou JOIN' },
            ],
          },
          content: 'Revisez les techniques d\'optimisation avec des flashcards.',
          xpReward: 25,
        },
        {
          id: 'bdd-m6-l3',
          title: 'Quiz — Optimisation BDD',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances en optimisation de base de donnees.',
          quizQuestions: [
            {
              question: 'Quand utiliser le partitionnement de table ?',
              options: [
                'Quand la table a beaucoup de colonnes',
                'Quand la table est tres grande et les requetes filtrent systematiquement sur un critere (date, region)',
                'Quand la table est en lecture seule',
                'Pour toutes les tables sans exception',
              ],
              correctIndex: 1,
              explanation: 'Le partitionnement est utile quand les requetes ne concernent qu\'un sous-ensemble previsible des donnees. PostgreSQL ne scanne que les partitions pertinentes (partition pruning).',
            },
            {
              question: 'Quel est l\'avantage de REFRESH MATERIALIZED VIEW CONCURRENTLY ?',
              options: [
                'Il est plus rapide',
                'Il permet de rafraichir la vue sans bloquer les lectures en cours',
                'Il consomme moins de memoire',
                'Il met a jour en temps reel',
              ],
              correctIndex: 1,
              explanation: 'CONCURRENTLY cree la nouvelle version de la vue en parallele puis bascule, evitant de bloquer les SELECT pendant le rafraichissement. Necessite un index unique sur la vue.',
            },
            {
              question: 'Qu\'est-ce qu\'une requete N+1 ?',
              options: [
                'Une requete qui retourne N+1 resultats',
                'Un anti-pattern ou on execute 1 requete pour la liste puis N requetes pour les details de chaque element',
                'Une requete avec N+1 jointures',
                'Une requete paginee',
              ],
              correctIndex: 1,
              explanation: 'La requete N+1 est un anti-pattern classique : 1 SELECT pour les utilisateurs puis 1 SELECT par utilisateur pour ses commandes. Solution : un seul JOIN ou IN(...).',
            },
            {
              question: 'Quel TTL utilise Freenzy pour le cache Redis ?',
              options: [
                '60 secondes',
                '300 secondes (5 minutes)',
                '3600 secondes (1 heure)',
                'Pas de TTL',
              ],
              correctIndex: 1,
              explanation: 'Freenzy utilise un TTL de 300 secondes (5 minutes) avec Redis en politique LRU et un maxmemory de 256MB. C\'est un bon compromis entre fraicheur des donnees et performance.',
            },
            {
              question: 'Quelle est la premiere etape avant d\'optimiser une requete lente ?',
              options: [
                'Ajouter des index sur toutes les colonnes',
                'Executer EXPLAIN ANALYZE pour comprendre le plan d\'execution',
                'Augmenter la RAM du serveur',
                'Reecrire la requete en ORM',
              ],
              correctIndex: 1,
              explanation: 'Toujours mesurer avant d\'optimiser. EXPLAIN ANALYZE revele exactement ou le temps est passe : index manquant, jointure inefficace, tri couteux. Sans cette info, on optimise a l\'aveugle.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F3CE}\u{FE0F}',
      badgeName: 'Performance Guru',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 4 — Docker pour l'IA
// ---------------------------------------------------------------------------

export const parcoursDockerIA: FormationParcours = {
  id: 'docker-ia',
  title: 'Docker pour l\'IA',
  emoji: '\u{1F433}',
  description: 'Maitrisez Docker pour deployer vos applications IA : conteneurs, Dockerfile, Compose, volumes, reseaux et CI/CD.',
  category: 'technique',
  subcategory: 'docker',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#0EA5E9',
  diplomaTitle: 'Docker IA Specialist',
  diplomaSubtitle: 'Certification Freenzy.io — Docker pour l\'Intelligence Artificielle',
  totalDuration: '1h30',
  totalXP: 900,
  available: true,
  modules: [
    {
      id: 'dck-m1',
      title: 'Les fondamentaux des conteneurs',
      emoji: '\u{1F4E6}',
      description: 'Comprenez ce qu\'est un conteneur et pourquoi Docker a revolutionne le deploiement.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m1-l1',
          title: 'Conteneurs : concepts fondamentaux',
          duration: '6 min',
          type: 'text',
          content: `Docker a transforme la maniere dont nous deployons les applications. Au lieu de configurer chaque serveur manuellement, vous empaquetez votre application avec toutes ses dependances dans un conteneur portable. "Ca marche sur ma machine" n'est plus une excuse — si ca marche dans Docker, ca marche partout.

Un conteneur est un processus isole qui partage le noyau du systeme d'exploitation hote. Contrairement a une machine virtuelle qui embarque un OS complet (plusieurs Go), un conteneur ne contient que votre application et ses dependances (quelques Mo a quelques centaines de Mo). Il demarre en secondes, pas en minutes.

L'image Docker est le modele a partir duquel les conteneurs sont crees. C'est un fichier en lecture seule qui contient le systeme de fichiers, les dependances, le code et la configuration. Chaque image est construite en couches (layers) empilees. Si deux images partagent la meme couche de base (ex: python:3.12-slim), elle n'est stockee qu'une seule fois.

Le Docker Hub est le registre public ou vous trouvez des images pre-construites : postgres:16, redis:7, node:20, python:3.12. Utilisez toujours des tags specifiques (postgres:16.2) et jamais "latest" en production — "latest" peut changer et casser votre deploiement.

Les commandes essentielles : docker pull pour telecharger une image, docker run pour creer et demarrer un conteneur, docker ps pour lister les conteneurs actifs, docker logs pour voir les sorties, docker stop et docker rm pour arreter et supprimer. docker exec -it <container> bash ouvre un terminal dans un conteneur en cours d'execution.

L'isolation est la force de Docker. Chaque conteneur a son propre systeme de fichiers, son reseau et ses processus. Votre application Python 3.12 et votre PostgreSQL 16 tournent cote a cote sans conflit, meme si le serveur hote a une version differente de Python. Cette isolation simplifie enormement les mises a jour et les rollbacks.

Freenzy utilise Docker Compose pour orchestrer ses conteneurs : backend (1G), dashboard (512M), PostgreSQL (512M) et Redis (256M). Chaque service est isole, configure par des variables d'environnement, et deploye automatiquement via Coolify sur un serveur Hetzner.`,
          xpReward: 25,
        },
        {
          id: 'dck-m1-l2',
          title: 'Jeu : Vocabulaire Docker',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Image', right: 'Modele en lecture seule pour creer des conteneurs' },
              { left: 'Conteneur', right: 'Instance executable d\'une image' },
              { left: 'Layer', right: 'Couche du systeme de fichiers empilee' },
              { left: 'Docker Hub', right: 'Registre public d\'images' },
              { left: 'docker exec', right: 'Executer une commande dans un conteneur actif' },
              { left: 'Tag', right: 'Version specifique d\'une image' },
            ],
          },
          content: 'Associez chaque terme Docker a sa definition.',
          xpReward: 25,
        },
        {
          id: 'dck-m1-l3',
          title: 'Quiz — Fondamentaux Docker',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les concepts Docker.',
          quizQuestions: [
            {
              question: 'Quelle est la difference principale entre un conteneur et une machine virtuelle ?',
              options: [
                'Un conteneur est plus lent',
                'Un conteneur partage le noyau de l\'OS hote au lieu d\'embarquer un OS complet',
                'Un conteneur ne peut pas etre sauvegarde',
                'Une VM est plus legere',
              ],
              correctIndex: 1,
              explanation: 'Un conteneur partage le noyau Linux de l\'hote, ce qui le rend beaucoup plus leger (Mo vs Go) et rapide a demarrer (secondes vs minutes) qu\'une VM complete.',
            },
            {
              question: 'Pourquoi eviter le tag "latest" en production ?',
              options: [
                'Il est plus lent a telecharger',
                'Il peut changer a tout moment et casser votre deploiement',
                'Il n\'existe pas pour toutes les images',
                'Il est reserve aux tests',
              ],
              correctIndex: 1,
              explanation: 'Le tag "latest" pointe vers la derniere version publiee, qui peut changer sans prevenir. Utilisez des tags specifiques (postgres:16.2) pour des deploiements reproductibles.',
            },
            {
              question: 'Quelle commande ouvre un terminal dans un conteneur en cours d\'execution ?',
              options: [
                'docker connect <container>',
                'docker exec -it <container> bash',
                'docker terminal <container>',
                'docker ssh <container>',
              ],
              correctIndex: 1,
              explanation: 'docker exec execute une commande dans un conteneur actif. Les flags -it (interactive + tty) permettent d\'ouvrir un shell interactif avec bash.',
            },
            {
              question: 'Quel est l\'avantage du systeme de couches (layers) Docker ?',
              options: [
                'Il accelere l\'execution du conteneur',
                'Les couches communes entre images sont partagees, economisant l\'espace disque',
                'Il renforce la securite',
                'Il permet le multi-threading',
              ],
              correctIndex: 1,
              explanation: 'Si 5 images utilisent python:3.12-slim comme base, cette couche n\'est stockee qu\'une seule fois. Le cache de build reutilise aussi les couches inchangees.',
            },
            {
              question: 'Combien de conteneurs Docker utilise Freenzy en production ?',
              options: [
                '2 (backend + frontend)',
                '3 (backend + DB + cache)',
                '4 (backend, dashboard, PostgreSQL, Redis)',
                '6 ou plus',
              ],
              correctIndex: 2,
              explanation: 'Freenzy orchestre 4 conteneurs : le backend Express (1G), le dashboard Next.js (512M), PostgreSQL 16 (512M) et Redis 7 (256M), via Docker Compose.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4E6}',
      badgeName: 'Container Starter',
    },
    {
      id: 'dck-m2',
      title: 'Ecrire un Dockerfile',
      emoji: '\u{1F4DD}',
      description: 'Creez des images Docker optimisees pour vos applications IA.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m2-l1',
          title: 'Dockerfile : bonnes pratiques',
          duration: '6 min',
          type: 'text',
          content: `Le Dockerfile est la recette pour construire votre image Docker. Chaque instruction cree une couche (layer) dans l'image. Un Dockerfile bien ecrit produit des images legeres, rapides a construire et securisees. Voyons les bonnes pratiques essentielles.

Choisissez une image de base minimale. Preferez python:3.12-slim (150 Mo) a python:3.12 (1 Go). Les variantes -slim contiennent le strict necessaire. Pour des images encore plus legeres, alpine (5 Mo) est une option, mais attention aux incompatibilites avec certaines librairies C (numpy, psycopg2).

L'ordre des instructions impacte le cache. Docker cache chaque layer et reutilise le cache tant que l'instruction et le contexte n'ont pas change. Placez les instructions qui changent rarement en premier (installation des dependances systeme, copie du requirements.txt) et celles qui changent souvent en dernier (copie du code source). Ainsi, une modification de code ne reinstalle pas toutes les dependances.

Le pattern COPY + install est fondamental. D'abord COPY requirements.txt ., puis RUN pip install -r requirements.txt, puis COPY . . (le code). Si seul le code change, Docker reutilise la layer des dependances depuis le cache. Sans ce pattern, chaque modification de code relance l'installation complete.

Reduisez le nombre de layers en combinant les RUN. Au lieu de 3 RUN successifs, utilisez RUN apt-get update && apt-get install -y pkg1 pkg2 && rm -rf /var/lib/apt/lists/*. Le nettoyage dans le meme RUN reduit la taille de l'image.

Le multi-stage build separe la construction et l'execution. Le premier stage (builder) installe les outils de build et compile. Le deuxieme stage (runtime) copie uniquement les artefacts necessaires depuis le builder. Resultat : une image finale sans les outils de build, beaucoup plus legere et securisee.

Executez votre application en tant qu'utilisateur non-root. RUN useradd -m appuser puis USER appuser avant le CMD. Si un attaquant exploite une faille, il n'a pas les privileges root dans le conteneur.

Utilisez un .dockerignore pour exclure les fichiers inutiles du contexte de build : .git, node_modules, .env, __pycache__, *.pyc. Cela accelere le build et evite de copier des secrets dans l'image.`,
          xpReward: 25,
        },
        {
          id: 'dck-m2-l2',
          title: 'Exercice : Ecrire un Dockerfile',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Ecrivez un Dockerfile optimise pour une application Python IA avec ces contraintes :

1. Image de base : python:3.12-slim
2. Multi-stage build (builder + runtime)
3. Stage builder :
   - Installer les dependances systeme (build-essential, libpq-dev pour psycopg2)
   - Copier et installer requirements.txt
4. Stage runtime :
   - Copier uniquement les packages Python depuis le builder
   - Creer un utilisateur non-root
   - Copier le code source
   - Exposer le port 8000
   - Health check : curl http://localhost:8000/health
   - CMD : python main.py

5. Ecrivez le .dockerignore correspondant (au moins 8 patterns)

6. Estimez la taille finale de l'image et expliquez pourquoi le multi-stage la reduit.

Bonus : ajoutez des labels OCI (version, description, mainteneur).`,
          content: 'Creez un Dockerfile multi-stage optimise pour une app IA.',
          xpReward: 25,
        },
        {
          id: 'dck-m2-l3',
          title: 'Quiz — Dockerfile',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur les Dockerfiles.',
          quizQuestions: [
            {
              question: 'Pourquoi copier requirements.txt avant le code source dans un Dockerfile ?',
              options: [
                'C\'est obligatoire',
                'Pour profiter du cache Docker : si le code change mais pas les dependances, pip install est skippe',
                'Pour des raisons de securite',
                'Pour reduire la taille de l\'image',
              ],
              correctIndex: 1,
              explanation: 'Docker cache chaque layer. En copiant requirements.txt d\'abord, la layer pip install est en cache tant que les dependances ne changent pas, meme si le code change.',
            },
            {
              question: 'Quel est l\'avantage du multi-stage build ?',
              options: [
                'Il est plus rapide a construire',
                'L\'image finale ne contient que le runtime, pas les outils de build — elle est plus legere et securisee',
                'Il permet de builder en parallele',
                'Il supporte plus de langages',
              ],
              correctIndex: 1,
              explanation: 'Le multi-stage separe build et runtime. L\'image finale ne contient ni les compilateurs, ni les headers de developpement — seulement l\'application et ses dependances runtime.',
            },
            {
              question: 'Pourquoi nettoyer le cache apt dans le meme RUN que l\'install ?',
              options: [
                'Pour eviter les conflits',
                'Pour que le nettoyage soit dans la meme layer, reduisant la taille de l\'image',
                'Pour accelerer le build',
                'C\'est une convention sans impact technique',
              ],
              correctIndex: 1,
              explanation: 'Chaque RUN cree une layer. Si le nettoyage est dans un RUN separe, la layer precedente contient encore le cache. Le combiner dans un seul RUN reduit la taille finale.',
            },
            {
              question: 'Quelle image de base est recommandee pour les applications Python ?',
              options: [
                'python:3.12 (image complete)',
                'python:3.12-slim (image minimale)',
                'ubuntu:22.04',
                'alpine:3.18',
              ],
              correctIndex: 1,
              explanation: 'python:3.12-slim contient le strict necessaire (~150 Mo vs ~1 Go pour l\'image complete). Alpine est encore plus leger mais peut poser des problemes de compatibilite.',
            },
            {
              question: 'Pourquoi ajouter USER appuser dans le Dockerfile ?',
              options: [
                'Pour creer un compte utilisateur',
                'Pour executer l\'application en tant qu\'utilisateur non-root, limitant l\'impact d\'une faille de securite',
                'Pour personnaliser le nom du conteneur',
                'Pour accelerer le demarrage',
              ],
              correctIndex: 1,
              explanation: 'Executer en non-root limite les privileges. Si un attaquant exploite une faille, il ne peut pas acceder aux fichiers systeme ni modifier la configuration du conteneur.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4DD}',
      badgeName: 'Dockerfile Pro',
    },
    {
      id: 'dck-m3',
      title: 'Docker Compose',
      emoji: '\u{1F3B5}',
      description: 'Orchestrez plusieurs conteneurs avec Docker Compose.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m3-l1',
          title: 'Docker Compose : multi-conteneurs',
          duration: '6 min',
          type: 'text',
          content: `Docker Compose orchestre plusieurs conteneurs en un seul fichier docker-compose.yml. Au lieu de lancer chaque conteneur manuellement avec des commandes docker run complexes, vous decrivez toute votre stack dans un fichier YAML et un seul docker compose up demarre tout.

La structure du docker-compose.yml definit des services (conteneurs), des reseaux et des volumes. Chaque service a un nom, une image (ou un build context), des ports, des variables d'environnement, des volumes et des dependances. L'ensemble forme votre stack applicative complete.

Les variables d'environnement configurent chaque service. Deux approches : directement dans le YAML (environment: - DB_HOST=postgres) ou via un fichier .env reference (env_file: .env). La deuxieme est preferee pour les secrets. Docker Compose lit automatiquement un fichier .env a la racine du projet.

Les dependances entre services utilisent depends_on. Votre backend depend de PostgreSQL et Redis ? depends_on: [postgres, redis]. Attention : depends_on garantit l'ordre de demarrage mais pas que le service est pret. Utilisez un script wait-for-it.sh ou un health check pour attendre que PostgreSQL accepte les connexions.

Les health checks verifient que chaque service fonctionne correctement. healthcheck: test: ["CMD", "pg_isready", "-U", "freenzy"], interval: 10s, timeout: 5s, retries: 3. Docker redemarrera automatiquement un conteneur dont le health check echoue (avec restart: unless-stopped).

Le scaling horizontal lance plusieurs instances d'un service : docker compose up --scale backend=3. Combine avec un load balancer (Traefik), cela distribue le trafic entre 3 instances backend. Assurez-vous que votre application est stateless — pas de donnees en memoire locale.

Les profils Docker Compose separent les environnements. Un profil "dev" inclut un outil de debug et un hot-reload. Un profil "prod" inclut le monitoring et les contraintes de ressources. Activez un profil avec docker compose --profile dev up.

Freenzy utilise Docker Compose avec Coolify pour orchestrer 4 services : le backend Express, le dashboard Next.js, PostgreSQL 16 et Redis 7. Traefik sert de reverse proxy avec TLS automatique. Chaque service a des limites de memoire configurees pour eviter les OOM (Out of Memory).`,
          xpReward: 25,
        },
        {
          id: 'dck-m3-l2',
          title: 'Jeu : Compose vs Docker run',
          duration: '4 min',
          type: 'game',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'services:', back: 'Definit la liste des conteneurs a orchestrer' },
              { front: 'depends_on:', back: 'Ordre de demarrage entre services (pas de readiness)' },
              { front: 'volumes:', back: 'Monte un repertoire hote dans le conteneur' },
              { front: 'healthcheck:', back: 'Verifie periodiquement que le service fonctionne' },
              { front: 'restart: unless-stopped', back: 'Redemarre le conteneur sauf arret manuel' },
              { front: 'docker compose up -d', back: 'Demarre tous les services en arriere-plan' },
            ],
          },
          content: 'Revisez les concepts Docker Compose avec des flashcards.',
          xpReward: 25,
        },
        {
          id: 'dck-m3-l3',
          title: 'Quiz — Docker Compose',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur Docker Compose.',
          quizQuestions: [
            {
              question: 'Que garantit depends_on dans Docker Compose ?',
              options: [
                'Que le service dependant est pret a recevoir des connexions',
                'Uniquement l\'ordre de demarrage des conteneurs',
                'Que les donnees sont synchronisees entre services',
                'Que le service redemarrera en cas d\'erreur',
              ],
              correctIndex: 1,
              explanation: 'depends_on garantit que PostgreSQL demarre avant le backend, mais PAS qu\'il est pret. Utilisez un health check ou un script wait-for-it pour la readiness.',
            },
            {
              question: 'Ou Docker Compose cherche-t-il automatiquement les variables d\'environnement ?',
              options: [
                'Dans /etc/environment',
                'Dans un fichier .env a la racine du projet',
                'Dans les variables systeme uniquement',
                'Dans docker-compose.env',
              ],
              correctIndex: 1,
              explanation: 'Docker Compose lit automatiquement le fichier .env situe dans le meme repertoire que le docker-compose.yml pour substituer les variables ${VAR}.',
            },
            {
              question: 'Quelle commande lance 3 instances du service backend ?',
              options: [
                'docker compose run backend 3',
                'docker compose up --scale backend=3',
                'docker compose replicate backend 3',
                'docker compose start backend --count 3',
              ],
              correctIndex: 1,
              explanation: 'Le flag --scale backend=3 lance 3 replicas du service backend. Combine avec un load balancer, le trafic est distribue entre les 3 instances.',
            },
            {
              question: 'Que fait restart: unless-stopped ?',
              options: [
                'Ne redemarre jamais le conteneur',
                'Redemarre toujours, meme apres un arret manuel',
                'Redemarre automatiquement sauf si le conteneur a ete arrete manuellement',
                'Redemarre une seule fois',
              ],
              correctIndex: 2,
              explanation: 'unless-stopped redemarre le conteneur en cas de crash ou de reboot du serveur, mais pas si vous l\'avez arrete manuellement avec docker stop.',
            },
            {
              question: 'Pourquoi configurer des limites de memoire par conteneur ?',
              options: [
                'Pour accelerer les conteneurs',
                'Pour eviter qu\'un conteneur consomme toute la memoire et cause un OOM (Out of Memory) sur les autres',
                'Pour reduire les logs',
                'C\'est obligatoire dans Docker Compose',
              ],
              correctIndex: 1,
              explanation: 'Sans limite, un conteneur avec une fuite memoire peut consommer toute la RAM du serveur, provoquant un OOM killer qui tue des conteneurs critiques comme PostgreSQL.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F3B5}',
      badgeName: 'Compose Master',
    },
    {
      id: 'dck-m4',
      title: 'Volumes et persistance',
      emoji: '\u{1F4BE}',
      description: 'Gerez la persistance des donnees avec les volumes Docker.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m4-l1',
          title: 'Volumes Docker : la persistance',
          duration: '6 min',
          type: 'text',
          content: `Par defaut, les donnees d'un conteneur sont ephemeres : quand le conteneur est supprime, tout disparait. Les volumes Docker resolvent ce probleme en fournissant un stockage persistant, independant du cycle de vie du conteneur. C'est indispensable pour les bases de donnees, les fichiers uploades et les logs.

Les trois types de montage : les volumes nommes (docker volume create pgdata) sont geres par Docker et stockes dans /var/lib/docker/volumes/. Les bind mounts (./data:/app/data) mappent un repertoire hote directement. Les tmpfs mounts stockent en RAM (donnees temporaires sensibles qui ne doivent pas toucher le disque).

Pour PostgreSQL, un volume nomme est la meilleure option. Dans docker-compose.yml : volumes: - pgdata:/var/lib/postgresql/data. Les donnees survivent aux recreations de conteneur (docker compose down puis up). Meme une mise a jour de l'image PostgreSQL conserve les donnees.

Les bind mounts sont ideaux pour le developpement. Montez votre code source dans le conteneur : volumes: - ./src:/app/src. Les modifications en local sont immediatement visibles dans le conteneur sans rebuild. Combinez avec un hot-reload (nodemon, tsx watch) pour un workflow fluide.

La sauvegarde des volumes est critique. Un volume Docker n'est pas un backup. Pour sauvegarder PostgreSQL, utilisez pg_dump execute dans le conteneur : docker exec postgres pg_dump -U freenzy freenzy > backup.sql. Pour les fichiers, montez le volume dans un conteneur temporaire et copiez les donnees avec tar.

Les permissions sont un piege frequent. Le processus dans le conteneur peut avoir un UID different de l'utilisateur hote. Si votre app tourne en tant que UID 1000 dans le conteneur mais que le volume hote appartient a root, l'app ne pourra pas ecrire. Solution : utilisez le meme UID dans le Dockerfile (USER 1000) ou ajustez les permissions du repertoire hote.

Le nettoyage des volumes orphelins est important. docker volume ls montre tous les volumes. docker volume prune supprime les volumes non utilises par aucun conteneur. Attention : cette commande est irreversible ! Verifiez avec docker volume ls avant de pruner.

Freenzy sauvegarde ses donnees PostgreSQL via pg_dump quotidien dans /root/backups/freenzy/ avec rotation 7 jours. Le volume pgdata est le stockage principal, mais les backups SQL sont la securite ultime en cas de corruption du volume.`,
          xpReward: 25,
        },
        {
          id: 'dck-m4-l2',
          title: 'Jeu : Types de montage',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Volume nomme', right: 'Gere par Docker, ideal pour les bases de donnees' },
              { left: 'Bind mount', right: 'Mappe un repertoire hote, ideal pour le dev' },
              { left: 'tmpfs', right: 'Stockage en RAM, donnees temporaires sensibles' },
              { left: 'docker volume prune', right: 'Supprime les volumes orphelins' },
              { left: 'pg_dump', right: 'Sauvegarde logique de PostgreSQL' },
              { left: 'Permissions UID', right: 'Piege frequent entre conteneur et hote' },
            ],
          },
          content: 'Associez chaque concept de volume a sa description.',
          xpReward: 25,
        },
        {
          id: 'dck-m4-l3',
          title: 'Quiz — Volumes Docker',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les volumes Docker.',
          quizQuestions: [
            {
              question: 'Que se passe-t-il avec les donnees quand un conteneur est supprime sans volume ?',
              options: [
                'Les donnees sont sauvegardees automatiquement',
                'Les donnees sont perdues definitivement',
                'Les donnees sont archivees par Docker',
                'Les donnees restent dans le reseau Docker',
              ],
              correctIndex: 1,
              explanation: 'Sans volume, le systeme de fichiers du conteneur est ephemere. A la suppression du conteneur, toutes les donnees ecrites a l\'interieur sont perdues irreversiblement.',
            },
            {
              question: 'Quel type de montage est recommande pour PostgreSQL en production ?',
              options: [
                'Bind mount',
                'Volume nomme',
                'tmpfs',
                'Aucun montage',
              ],
              correctIndex: 1,
              explanation: 'Les volumes nommes sont geres par Docker, offrent de meilleures performances que les bind mounts sur certains OS, et survivent aux recreations de conteneur.',
            },
            {
              question: 'Pourquoi les permissions UID posent-elles probleme avec les bind mounts ?',
              options: [
                'Docker ne supporte pas les permissions',
                'L\'UID du processus dans le conteneur peut differer de celui du proprietaire des fichiers hote',
                'Les bind mounts sont en lecture seule',
                'Les permissions ne s\'appliquent pas dans Docker',
              ],
              correctIndex: 1,
              explanation: 'Si l\'app tourne en UID 1000 dans le conteneur mais que les fichiers hote appartiennent a root (UID 0), l\'app ne peut ni lire ni ecrire. Il faut aligner les UIDs.',
            },
            {
              question: 'Quelle commande est DANGEREUSE car irreversible ?',
              options: [
                'docker volume ls',
                'docker volume inspect',
                'docker volume prune',
                'docker volume create',
              ],
              correctIndex: 2,
              explanation: 'docker volume prune supprime definitivement tous les volumes non utilises. C\'est irreversible — les donnees sont perdues. Verifiez toujours avec docker volume ls avant.',
            },
            {
              question: 'A quelle frequence Freenzy sauvegarde-t-il PostgreSQL ?',
              options: [
                'Toutes les heures',
                'Quotidiennement avec rotation 7 jours',
                'Hebdomadairement',
                'Mensuellement',
              ],
              correctIndex: 1,
              explanation: 'Freenzy execute un pg_dump quotidien dans /root/backups/freenzy/ avec rotation 7 jours. C\'est le filet de securite en cas de corruption du volume Docker.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4BE}',
      badgeName: 'Data Keeper',
    },
    {
      id: 'dck-m5',
      title: 'Reseaux Docker',
      emoji: '\u{1F310}',
      description: 'Configurez les reseaux Docker pour la communication inter-conteneurs.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m5-l1',
          title: 'Reseaux Docker : communication inter-conteneurs',
          duration: '6 min',
          type: 'text',
          content: `Les conteneurs Docker sont isoles par defaut — ils ne peuvent pas communiquer entre eux sans configuration reseau. Les reseaux Docker permettent aux conteneurs de se parler de maniere securisee, en utilisant les noms de service comme noms d'hote DNS. Voyons comment ca fonctionne.

Docker Compose cree automatiquement un reseau pour votre stack. Tous les services definis dans le meme docker-compose.yml partagent ce reseau. Le backend peut acceder a PostgreSQL via postgres:5432 (nom du service comme hostname). Pas besoin de connaitre l'IP du conteneur — Docker resout les noms automatiquement.

Les trois types de reseaux Docker : bridge (par defaut, communication entre conteneurs sur le meme hote), host (le conteneur partage le reseau de l'hote, pas d'isolation), et overlay (communication entre conteneurs sur des hotes differents, pour Docker Swarm). En Docker Compose, bridge est le choix standard.

L'exposition des ports suit deux logiques. "ports: 3000:3000" expose le port sur l'hote (accessible depuis l'exterieur). "expose: 5432" rend le port accessible uniquement aux autres conteneurs du meme reseau. PostgreSQL n'a pas besoin d'etre accessible depuis l'exterieur — expose suffit. Seuls le reverse proxy (Traefik) et les services publics exposent des ports.

La segmentation reseau isole les services par securite. Creez un reseau "frontend" pour le reverse proxy et le dashboard, et un reseau "backend" pour le backend, PostgreSQL et Redis. Le dashboard communique avec le backend via le reseau frontend, mais ne peut pas acceder directement a PostgreSQL. C'est le principe du moindre privilege applique au reseau.

Le reverse proxy (Traefik, Nginx) est le point d'entree unique. Il recoit tout le trafic HTTP/HTTPS sur les ports 80/443, puis route vers le bon service interne en fonction du domaine. app.freenzy.io va vers le dashboard (port 3000 interne), api.freenzy.io va vers le backend (port 3000 interne). Traefik gere aussi le TLS automatique avec Let's Encrypt.

Le debugging reseau utilise docker network ls pour lister les reseaux, docker network inspect pour voir les conteneurs connectes, et docker exec curl pour tester la connectivite entre services. Si un service ne peut pas joindre un autre, verifiez qu'ils sont sur le meme reseau et que le port est correctement expose.`,
          xpReward: 25,
        },
        {
          id: 'dck-m5-l2',
          title: 'Exercice : Architecture reseau',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Concevez l'architecture reseau Docker Compose pour une application IA complete avec ces services :

1. Traefik (reverse proxy) — ports 80, 443, dashboard 8080
2. Frontend Next.js — accessible via app.example.com
3. Backend Express — accessible via api.example.com
4. PostgreSQL — port 5432 (interne uniquement)
5. Redis — port 6379 (interne uniquement)
6. Worker (traitement asynchrone) — pas de port expose

Concevez :
1. Deux reseaux : "public" (Traefik + Frontend + Backend) et "internal" (Backend + Worker + PostgreSQL + Redis)
2. Pour chaque service : indiquez les reseaux, les ports exposes vs internes, et les labels Traefik pour le routage
3. Expliquez pourquoi PostgreSQL et Redis ne doivent PAS etre sur le reseau public
4. Ecrivez le docker-compose.yml correspondant (section networks et configuration de chaque service)
5. Comment tester que le Frontend ne peut pas acceder directement a PostgreSQL ?`,
          content: 'Architecturez les reseaux Docker pour une application multi-services.',
          xpReward: 25,
        },
        {
          id: 'dck-m5-l3',
          title: 'Quiz — Reseaux Docker',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les reseaux Docker.',
          quizQuestions: [
            {
              question: 'Comment un conteneur accede-t-il a PostgreSQL dans Docker Compose ?',
              options: [
                'Par l\'IP du conteneur (172.x.x.x)',
                'Par le nom du service (postgres:5432) — Docker resout le DNS automatiquement',
                'Par localhost:5432',
                'Par l\'IP de l\'hote',
              ],
              correctIndex: 1,
              explanation: 'Docker Compose cree un DNS interne qui resout les noms de service en adresses IP. Le backend accede a PostgreSQL via postgres:5432, independamment de l\'IP reelle.',
            },
            {
              question: 'Quelle est la difference entre "ports" et "expose" ?',
              options: [
                'Il n\'y a aucune difference',
                '"ports" expose sur l\'hote (accessible externement), "expose" uniquement aux autres conteneurs du reseau',
                '"expose" est plus rapide',
                '"ports" est deprecie',
              ],
              correctIndex: 1,
              explanation: 'ports: 5432:5432 rend PostgreSQL accessible depuis l\'exterieur du serveur. expose: 5432 le rend accessible uniquement aux conteneurs du meme reseau Docker.',
            },
            {
              question: 'Pourquoi segmenter les reseaux Docker ?',
              options: [
                'Pour ameliorer les performances',
                'Pour appliquer le principe du moindre privilege — le frontend n\'a pas besoin d\'acceder a la DB',
                'Pour reduire la consommation memoire',
                'C\'est obligatoire dans Docker Compose',
              ],
              correctIndex: 1,
              explanation: 'La segmentation reseau isole les services par securite. Si le frontend est compromis, l\'attaquant ne peut pas acceder directement a PostgreSQL s\'ils sont sur des reseaux differents.',
            },
            {
              question: 'Quel role joue Traefik dans l\'architecture Docker de Freenzy ?',
              options: [
                'Base de donnees',
                'Reverse proxy avec routage par domaine et TLS automatique',
                'Serveur de fichiers',
                'Outil de monitoring',
              ],
              correctIndex: 1,
              explanation: 'Traefik recoit le trafic HTTP/HTTPS, route vers le bon service selon le domaine (app.freenzy.io vs api.freenzy.io) et gere les certificats TLS automatiquement via Let\'s Encrypt.',
            },
            {
              question: 'Quelle commande inspecte les conteneurs connectes a un reseau Docker ?',
              options: [
                'docker network ps',
                'docker network inspect <network>',
                'docker network list --containers',
                'docker ps --network',
              ],
              correctIndex: 1,
              explanation: 'docker network inspect affiche les details d\'un reseau, incluant tous les conteneurs connectes avec leurs adresses IP. Utile pour le debugging de connectivite.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F310}',
      badgeName: 'Network Architect',
    },
    {
      id: 'dck-m6',
      title: 'CI/CD avec Docker',
      emoji: '\u{1F504}',
      description: 'Integrez Docker dans votre pipeline CI/CD pour des deploiements automatises.',
      duration: '15 min',
      lessons: [
        {
          id: 'dck-m6-l1',
          title: 'Docker dans le pipeline CI/CD',
          duration: '6 min',
          type: 'text',
          content: `Docker et CI/CD forment un duo puissant. L'image Docker est l'artefact de deploiement : construite une seule fois, testee, puis deployee de maniere identique dans tous les environnements. Voyons comment integrer Docker dans un pipeline professionnel.

Le pipeline type comporte 5 etapes. Build : construire l'image Docker depuis le Dockerfile. Test : executer les tests dans l'image construite. Push : pousser l'image vers un registre Docker (Docker Hub, GitHub Container Registry, ECR). Deploy staging : deployer sur l'environnement de staging. Deploy production : deployer en production apres validation.

Le tagging des images suit une convention stricte. Chaque build produit deux tags : un tag unique (le SHA du commit Git ou un timestamp) et un tag "latest" pour la branche. Exemple : myapp:a1b2c3d et myapp:latest. En production, deployez toujours le tag unique — "latest" est ambigu. Le tag SHA permet de savoir exactement quel code est deploye.

Les tests dans Docker garantissent la reproductibilite. Lancez vos tests dans la meme image qui sera deployee. docker compose -f docker-compose.test.yml up --abort-on-container-exit execute les tests avec PostgreSQL et Redis identiques a la production. Si les tests passent dans ce conteneur, ils passeront en production.

Le registre Docker stocke vos images de maniere securisee. GitHub Container Registry (ghcr.io) est gratuit pour les projets GitHub et s'integre parfaitement avec GitHub Actions. Configurez l'authentification dans votre pipeline CI avec un token GITHUB_TOKEN qui a les permissions packages: write.

Le deploiement via webhook est le pattern utilise par Coolify et des plateformes similaires. Quand une nouvelle image est pushee sur le registre, un webhook notifie la plateforme de deploiement qui pull la nouvelle image et recree les conteneurs. C'est le flow utilise par Freenzy : push sur main declenche le build, puis Coolify detecte la mise a jour et redeploy.

Le rollback avec Docker est instantane. Si la nouvelle version a un bug, redeployez l'image precedente en changeant le tag. docker compose down puis docker compose up avec l'ancien tag. Les donnees sont preservees grace aux volumes. C'est un avantage majeur par rapport aux deploiements sans conteneur ou le rollback est souvent complexe et risque.`,
          xpReward: 25,
        },
        {
          id: 'dck-m6-l2',
          title: 'Jeu : Pipeline CI/CD Docker',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre les etapes du pipeline CI/CD Docker',
            items: [
              'Build — Construire l\'image Docker depuis le Dockerfile',
              'Test — Executer les tests dans l\'image construite',
              'Push — Pousser l\'image taggee vers le registre',
              'Deploy staging — Deployer et valider en staging',
              'Deploy production — Deployer en production',
              'Monitoring — Verifier les metriques post-deploiement',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          content: 'Ordonnez les etapes du pipeline CI/CD Docker.',
          xpReward: 25,
        },
        {
          id: 'dck-m6-l3',
          title: 'Quiz — CI/CD Docker',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur Docker en CI/CD.',
          quizQuestions: [
            {
              question: 'Pourquoi tagger les images avec le SHA du commit Git ?',
              options: [
                'Pour economiser de l\'espace',
                'Pour savoir exactement quel code est deploye et faciliter le rollback',
                'C\'est obligatoire pour Docker Hub',
                'Pour accelerer le build',
              ],
              correctIndex: 1,
              explanation: 'Le tag SHA lie l\'image au code source. En cas de probleme, vous savez exactement quel commit est deploye et pouvez rollback vers le SHA precedent sans ambiguite.',
            },
            {
              question: 'Pourquoi executer les tests dans le meme conteneur Docker que la production ?',
              options: [
                'Pour economiser des ressources',
                'Pour garantir que l\'environnement de test est identique a la production',
                'C\'est plus rapide',
                'Les tests ne fonctionnent pas en dehors de Docker',
              ],
              correctIndex: 1,
              explanation: 'Tester dans le meme conteneur elimine le "ca marche sur ma machine". Si les tests passent dans cette image, le meme code avec les memes dependances fonctionnera en production.',
            },
            {
              question: 'Comment Freenzy deploie-t-il automatiquement ?',
              options: [
                'Copie manuelle des fichiers sur le serveur',
                'Push sur main declenche le build, Coolify detecte la nouvelle image et redeploy',
                'Deploiement hebdomadaire planifie',
                'FTP vers le serveur',
              ],
              correctIndex: 1,
              explanation: 'Le flow Freenzy : push sur main declenche GitHub Actions (typecheck + tests + build), puis Coolify detecte la mise a jour de l\'image et redeploy automatiquement les conteneurs.',
            },
            {
              question: 'Comment effectuer un rollback rapide avec Docker ?',
              options: [
                'Redeployer le code precedent depuis Git',
                'Changer le tag de l\'image pour la version precedente et recreer les conteneurs',
                'Restaurer un backup de la base de donnees',
                'Redemarrer le serveur',
              ],
              correctIndex: 1,
              explanation: 'Le rollback Docker est instantane : changez le tag de l\'image pour le SHA precedent et recreez les conteneurs. Les donnees sont preservees dans les volumes.',
            },
            {
              question: 'Quel registre Docker est gratuit pour les projets GitHub ?',
              options: [
                'Docker Hub uniquement',
                'GitHub Container Registry (ghcr.io)',
                'AWS ECR',
                'Google Container Registry',
              ],
              correctIndex: 1,
              explanation: 'GitHub Container Registry (ghcr.io) est gratuit pour les projets GitHub, s\'integre nativement avec GitHub Actions et utilise le GITHUB_TOKEN pour l\'authentification.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F504}',
      badgeName: 'CI/CD Docker',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 5 — CI/CD moderne
// ---------------------------------------------------------------------------

export const parcoursCICD: FormationParcours = {
  id: 'cicd-ia',
  title: 'CI/CD moderne',
  emoji: '\u{1F504}',
  description: 'Maitrisez le CI/CD moderne : GitHub Actions, tests automatises, linting, deploiement continu, monitoring et strategies de rollback.',
  category: 'technique',
  subcategory: 'cicd',
  level: 'intermediaire',
  levelLabel: 'Intermediaire',
  color: '#F59E0B',
  diplomaTitle: 'CI/CD Engineer',
  diplomaSubtitle: 'Certification Freenzy.io — CI/CD moderne',
  totalDuration: '1h30',
  totalXP: 900,
  available: true,
  modules: [
    {
      id: 'ci-m1',
      title: 'GitHub Actions : les bases',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Configurez votre premier pipeline CI avec GitHub Actions.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m1-l1',
          title: 'GitHub Actions : votre premier workflow',
          duration: '6 min',
          type: 'text',
          content: `GitHub Actions est le systeme de CI/CD integre a GitHub. Chaque push, pull request ou evenement declenche automatiquement des workflows qui construisent, testent et deployent votre code. Plus besoin d'un serveur Jenkins separe — tout est dans votre repo.

Un workflow est un fichier YAML dans .github/workflows/. Il definit quand s'executer (on), sur quelle machine (runs-on), et quelles etapes suivre (steps). Le fichier ci.yml le plus simple : on push sur main, runs-on ubuntu-latest, steps : checkout du code, installation des dependances, execution des tests.

Les evenements declencheurs sont configurables. push declenche sur chaque commit. pull_request declenche quand une PR est ouverte ou mise a jour. schedule declenche a heures fixes (cron). workflow_dispatch permet le declenchement manuel depuis l'interface GitHub. Combinez-les : on: push: branches: [main, develop] pour ne CI que sur ces branches.

Les runners sont les machines qui executent vos workflows. ubuntu-latest est le plus courant (gratuit pour les repos publics, 2000 min/mois pour les repos prives). Vous pouvez aussi utiliser macos-latest ou windows-latest pour les tests multi-plateforme, ou configurer des self-hosted runners sur vos propres serveurs.

Les steps sont les actions individuelles. Chaque step utilise soit une action predefinie (uses: actions/checkout@v4 pour cloner le repo, uses: actions/setup-node@v4 pour installer Node.js), soit une commande shell (run: npm test). Les actions du marketplace couvrent des centaines de cas : deploiement, notifications, cache, etc.

Les secrets sont geres de maniere securisee. Ajoutez vos cles API (ANTHROPIC_API_KEY, DOCKER_TOKEN) dans Settings > Secrets and Variables > Actions. Utilisez-les dans le workflow avec \${{ secrets.ANTHROPIC_API_KEY }}. Ils ne sont jamais affiches dans les logs et ne sont pas accessibles dans les forks.

Le cache accelere les builds. L'action actions/cache met en cache node_modules ou le cache pip entre les executions. Sans cache, chaque build reinstalle toutes les dependances (2-5 minutes). Avec cache, l'installation est quasi-instantanee si les dependances n'ont pas change.

Freenzy utilise GitHub Actions dans .github/workflows/ci.yml : typecheck (npx tsc --noEmit), lint, tests (89 suites, 1535+ tests) et build Next.js sur chaque push main/develop.`,
          xpReward: 25,
        },
        {
          id: 'ci-m1-l2',
          title: 'Jeu : Concepts GitHub Actions',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'Workflow', right: 'Fichier YAML definissant le pipeline' },
              { left: 'Runner', right: 'Machine qui execute les etapes' },
              { left: 'Step', right: 'Action individuelle dans un job' },
              { left: 'Secret', right: 'Variable sensible chiffree' },
              { left: 'actions/cache', right: 'Mise en cache des dependances entre builds' },
              { left: 'on: push', right: 'Declencheur sur chaque commit' },
            ],
          },
          content: 'Associez chaque concept GitHub Actions a sa definition.',
          xpReward: 25,
        },
        {
          id: 'ci-m1-l3',
          title: 'Quiz — GitHub Actions bases',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les bases de GitHub Actions.',
          quizQuestions: [
            {
              question: 'Ou placer les fichiers de workflow GitHub Actions ?',
              options: [
                'A la racine du projet',
                'Dans .github/workflows/',
                'Dans .ci/pipelines/',
                'Dans src/workflows/',
              ],
              correctIndex: 1,
              explanation: 'GitHub Actions detecte automatiquement les fichiers YAML dans .github/workflows/. C\'est la convention obligatoire — tout autre emplacement est ignore.',
            },
            {
              question: 'Quel runner est le plus couramment utilise ?',
              options: [
                'windows-latest',
                'ubuntu-latest',
                'macos-latest',
                'self-hosted',
              ],
              correctIndex: 1,
              explanation: 'ubuntu-latest est le runner par defaut. Il est gratuit pour les repos publics, rapide a provisionner, et compatible avec la majorite des stacks techniques.',
            },
            {
              question: 'Comment acceder a un secret dans un workflow ?',
              options: [
                'process.env.SECRET',
                '\${{ secrets.NOM_DU_SECRET }}',
                '$SECRET',
                'echo $GITHUB_SECRET',
              ],
              correctIndex: 1,
              explanation: 'La syntaxe ${{ secrets.NOM }} injecte le secret de maniere securisee. Les secrets sont masques dans les logs et inaccessibles aux forks.',
            },
            {
              question: 'Pourquoi utiliser le cache dans les workflows ?',
              options: [
                'Pour reduire la taille du repo',
                'Pour eviter de reinstaller les dependances a chaque build, accelerant l\'execution',
                'Pour sauvegarder les artefacts de build',
                'C\'est obligatoire',
              ],
              correctIndex: 1,
              explanation: 'Le cache de node_modules ou du cache pip evite de re-telecharger et reinstaller toutes les dependances. Un build de 5 minutes peut passer a 1 minute avec le cache.',
            },
            {
              question: 'Combien de suites de tests Freenzy execute-t-il dans son pipeline CI ?',
              options: [
                '10 suites',
                '50 suites',
                '89 suites (1535+ tests)',
                '200 suites',
              ],
              correctIndex: 2,
              explanation: 'Le pipeline CI de Freenzy execute 89 suites de tests contenant plus de 1535 tests, en plus du typecheck TypeScript et du build Next.js.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Actions Starter',
    },
    {
      id: 'ci-m2',
      title: 'Tests automatises',
      emoji: '\u{1F9EA}',
      description: 'Integrez les tests automatises dans votre pipeline CI pour garantir la qualite.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m2-l1',
          title: 'Strategie de tests en CI',
          duration: '6 min',
          type: 'text',
          content: `Les tests automatises sont le gardien de votre pipeline CI. Sans tests, le CI se resume a "le code compile" — ce qui ne garantit rien sur la qualite. Une strategie de tests bien concue attrape les bugs avant qu'ils n'atteignent la production.

La pyramide de tests definit la repartition optimale. A la base : les tests unitaires (70%) — rapides, isoles, testent une seule fonction. Au milieu : les tests d'integration (20%) — verifient que les composants fonctionnent ensemble (API + base de donnees). Au sommet : les tests end-to-end (10%) — simulent le parcours utilisateur complet. Plus on monte, plus c'est lent et fragile.

Les tests unitaires avec Jest testent les fonctions pures et les modules isoles. Moquez les dependances externes (base de donnees, APIs) avec jest.mock(). Chaque test doit etre independant — pas de dependance entre les tests. Utilisez describe() pour grouper et it() pour nommer clairement : it('should return 401 when token is missing').

Les tests d'integration verifient les interactions entre composants. Lancez une vraie base de donnees PostgreSQL dans Docker (docker-compose.test.yml) et executez les tests contre elle. Testez vos endpoints API avec supertest : envoyez des requetes HTTP et verifiez les reponses (code, body, headers). Nettoyez la base entre chaque test avec une transaction rollback.

La couverture de code (code coverage) mesure quel pourcentage du code est execute par les tests. Jest genere un rapport avec --coverage. Visez 80%+ de couverture globale, mais ne tombez pas dans le piege du 100% — certains tests n'apportent aucune valeur. Privilegiez la couverture des chemins critiques (authentification, paiement, logique metier).

Les tests de regression attrapent les bugs reintroduits. Chaque bug corrige doit avoir un test qui echoue avant le fix et passe apres. Cela garantit que le meme bug ne reviendra jamais. C'est l'un des meilleurs retours sur investissement en testing.

Le parallellisme accelere l'execution des tests. Jest supporte --maxWorkers=4 pour executer 4 suites en parallele. Dans GitHub Actions, vous pouvez utiliser une matrix strategy pour repartir les tests sur plusieurs runners. Freenzy execute ses 89 suites en parallele pour maintenir un temps de CI raisonnable.`,
          xpReward: 25,
        },
        {
          id: 'ci-m2-l2',
          title: 'Exercice : Ecrire des tests CI',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Ecrivez une suite de tests pour un endpoint API REST de gestion d'utilisateurs avec Jest et supertest.

Endpoint : POST /api/users — Creer un utilisateur
Body : { email: string, name: string, role: 'admin' | 'viewer' }
Reponse success : 201 { data: { id, email, name, role, createdAt } }
Reponse erreur : 400 { error: { code: 'VALIDATION_ERROR', message: '...' } }

Ecrivez ces tests :
1. Test unitaire : fonction validateUserInput() qui verifie email, name, role
   - Email invalide → erreur
   - Name trop court (< 2 chars) → erreur
   - Role invalide → erreur
   - Donnees valides → success

2. Test d'integration : endpoint POST /api/users
   - Creer un utilisateur avec des donnees valides → 201
   - Email duplique → 409 Conflict
   - Body manquant → 400
   - Sans token JWT → 401
   - Avec role 'viewer' essayant de creer un admin → 403

3. Pour chaque test : describe, it, expect avec des noms clairs
4. Mock de la base de donnees pour les tests unitaires
5. Nettoyage entre les tests d'integration`,
          content: 'Ecrivez des tests unitaires et d\'integration pour une API REST.',
          xpReward: 25,
        },
        {
          id: 'ci-m2-l3',
          title: 'Quiz — Tests automatises',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur les tests en CI.',
          quizQuestions: [
            {
              question: 'Quelle est la repartition recommandee dans la pyramide de tests ?',
              options: [
                '100% tests unitaires',
                '70% unitaires, 20% integration, 10% end-to-end',
                '50% unitaires, 50% end-to-end',
                '30% unitaires, 70% end-to-end',
              ],
              correctIndex: 1,
              explanation: 'La pyramide classique : beaucoup de tests unitaires (rapides, fiables), moins d\'integration, et peu d\'E2E (lents, fragiles). Cela optimise le ratio cout/valeur.',
            },
            {
              question: 'Pourquoi mocker les dependances dans les tests unitaires ?',
              options: [
                'Pour accelerer la compilation',
                'Pour isoler le code teste et ne pas dependre de services externes (DB, API)',
                'Pour reduire la couverture de code',
                'C\'est obligatoire avec Jest',
              ],
              correctIndex: 1,
              explanation: 'Le mock isole la fonction testee. Si le test echoue, vous savez que le probleme est dans la fonction, pas dans la base de donnees ou l\'API externe.',
            },
            {
              question: 'Qu\'est-ce qu\'un test de regression ?',
              options: [
                'Un test qui verifie les performances',
                'Un test cree pour un bug specifique, garantissant qu\'il ne reviendra jamais',
                'Un test qui compare deux versions',
                'Un test execute uniquement en production',
              ],
              correctIndex: 1,
              explanation: 'Pour chaque bug corrige, on ecrit un test qui aurait detecte le bug. Ce test protege contre la reintroduction du meme probleme dans le futur.',
            },
            {
              question: 'Quel outil teste les endpoints API dans Node.js ?',
              options: [
                'Postman uniquement',
                'supertest',
                'curl',
                'axios',
              ],
              correctIndex: 1,
              explanation: 'supertest envoie des requetes HTTP a votre app Express et verifie les reponses directement dans les tests Jest. Pas besoin de demarrer le serveur manuellement.',
            },
            {
              question: 'Quel pourcentage de couverture de code est recommande ?',
              options: [
                '100% obligatoire',
                '80%+ sur les chemins critiques',
                '50% suffit',
                'La couverture n\'est pas importante',
              ],
              correctIndex: 1,
              explanation: 'Visez 80%+ en vous concentrant sur les chemins critiques (auth, paiement, logique metier). 100% n\'est ni realiste ni necessaire — certains tests n\'apportent aucune valeur.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F9EA}',
      badgeName: 'Test Engineer',
    },
    {
      id: 'ci-m3',
      title: 'Linting et qualite de code',
      emoji: '\u{1F50D}',
      description: 'Automatisez la qualite de code avec ESLint, Prettier et les pre-commit hooks.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m3-l1',
          title: 'Linting et formatage automatise',
          duration: '6 min',
          type: 'text',
          content: `Le linting et le formatage automatise eliminent les debats sur le style de code et attrapent les erreurs avant meme les tests. Integres dans le CI, ils garantissent une qualite constante sur toute la codebase, quel que soit le developpeur.

ESLint analyse votre code JavaScript/TypeScript et detecte les problemes : variables non utilisees, imports manquants, comparaisons dangereuses (== au lieu de ===), any implicites en TypeScript. Configurez-le dans .eslintrc.js avec les regles adaptees a votre projet. Les presets comme @typescript-eslint/recommended couvrent 80% des besoins.

Prettier formate automatiquement le code : indentation, guillemets, virgules, longueur de ligne. Il n'y a pas de configuration a debattre — Prettier impose un style unique. Integrez-le avec ESLint via eslint-config-prettier pour eviter les conflits. Le formatage est applique automatiquement au save dans VS Code.

TypeScript strict mode (tsconfig.json avec strict: true) est le linter le plus puissant. Il interdit les any implicites, force la verification de null/undefined, et detecte les erreurs de typage a la compilation. npx tsc --noEmit verifie tous les types sans produire de fichier de sortie. C'est la premiere etape du CI de Freenzy.

Les pre-commit hooks executent le linting avant chaque commit. Husky configure les Git hooks, et lint-staged execute ESLint et Prettier uniquement sur les fichiers modifies. Si le linting echoue, le commit est bloque. Cela evite de commiter du code non conforme et reduit le bruit dans les PRs.

Dans le pipeline CI, ajoutez une etape de lint : run: npm run lint. Si ESLint detecte une erreur, le pipeline echoue et la PR ne peut pas etre mergee. C'est un filtre automatique qui maintient la qualite sans intervention humaine.

Les metriques de qualite vont au-dela du linting. La complexite cyclomatique mesure le nombre de chemins dans une fonction (max recommande : 10). Le nombre de lignes par fichier (max : 300-500). Le couplage entre modules. Des outils comme SonarQube ou CodeClimate analysent ces metriques et bloquent les PRs qui degradent la qualite.

Freenzy utilise ESLint, Prettier, et TypeScript strict dans son pipeline. Le CI execute typecheck, lint, tests et build sur chaque push. Aucun code ne passe en production sans avoir franchi ces 4 portes.`,
          xpReward: 25,
        },
        {
          id: 'ci-m3-l2',
          title: 'Jeu : Outils de qualite',
          duration: '4 min',
          type: 'game',
          gameType: 'matching',
          gameData: {
            pairs: [
              { left: 'ESLint', right: 'Detecte les erreurs et applique les regles de code' },
              { left: 'Prettier', right: 'Formatage automatique du code' },
              { left: 'tsc --noEmit', right: 'Verification TypeScript sans compilation' },
              { left: 'Husky', right: 'Git hooks pour pre-commit' },
              { left: 'lint-staged', right: 'Lint uniquement les fichiers modifies' },
              { left: 'SonarQube', right: 'Analyse de metriques de qualite avancees' },
            ],
          },
          content: 'Associez chaque outil de qualite a sa fonction.',
          xpReward: 25,
        },
        {
          id: 'ci-m3-l3',
          title: 'Quiz — Linting et qualite',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le linting et la qualite de code.',
          quizQuestions: [
            {
              question: 'Quelle est la difference entre ESLint et Prettier ?',
              options: [
                'Ce sont des outils identiques',
                'ESLint detecte les erreurs logiques, Prettier formate le style du code',
                'Prettier est plus rapide',
                'ESLint formate, Prettier lint',
              ],
              correctIndex: 1,
              explanation: 'ESLint trouve les problemes de logique (variable non utilisee, erreur de typage). Prettier s\'occupe du formatage (indentation, guillemets). Ils sont complementaires.',
            },
            {
              question: 'Que fait tsc --noEmit ?',
              options: [
                'Compile TypeScript en JavaScript',
                'Verifie les types TypeScript sans produire de fichier de sortie',
                'Supprime les fichiers TypeScript',
                'Genere la documentation',
              ],
              correctIndex: 1,
              explanation: 'tsc --noEmit execute le type-checker TypeScript et signale les erreurs de typage, sans generer de fichiers .js. C\'est ideal pour le CI ou la compilation est faite par un autre outil.',
            },
            {
              question: 'Pourquoi utiliser lint-staged avec Husky ?',
              options: [
                'Pour linter tout le projet a chaque commit',
                'Pour linter uniquement les fichiers modifies, ce qui est rapide et non-bloquant',
                'Pour supprimer les fichiers non conformes',
                'C\'est obligatoire pour Git',
              ],
              correctIndex: 1,
              explanation: 'lint-staged n\'execute le linter que sur les fichiers stages (git add). C\'est beaucoup plus rapide que de linter tout le projet et ne bloque pas le developpeur inutilement.',
            },
            {
              question: 'Combien de portes de qualite le CI de Freenzy utilise-t-il ?',
              options: [
                '1 (tests)',
                '2 (lint + tests)',
                '4 (typecheck, lint, tests, build)',
                '6 ou plus',
              ],
              correctIndex: 2,
              explanation: 'Le CI Freenzy execute 4 etapes sequentielles : typecheck (tsc --noEmit), lint (ESLint), tests (89 suites), et build (Next.js 195 pages). Les 4 doivent passer.',
            },
            {
              question: 'Quelle complexite cyclomatique maximale est recommandee par fonction ?',
              options: [
                '5',
                '10',
                '50',
                'Pas de limite',
              ],
              correctIndex: 1,
              explanation: 'Une complexite cyclomatique > 10 indique une fonction trop complexe avec trop de branches. Refactorisez en sous-fonctions pour ameliorer la lisibilite et la testabilite.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Quality Guard',
    },
    {
      id: 'ci-m4',
      title: 'Deploiement continu',
      emoji: '\u{1F680}',
      description: 'Automatisez le deploiement de votre application vers la production.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m4-l1',
          title: 'Strategies de deploiement continu',
          duration: '6 min',
          type: 'text',
          content: `Le deploiement continu (CD) est l'etape finale du pipeline : apres que le CI a valide le code, le CD le deploy automatiquement en production. L'objectif est de reduire le temps entre un commit et sa mise en ligne, tout en minimisant les risques.

La distinction CI/CD est importante. L'integration continue (CI) verifie que le code est correct (tests, lint, build). La livraison continue (CD) prepare un artefact deployable. Le deploiement continu va plus loin : il deploy automatiquement en production sans intervention humaine. La plupart des equipes pratiquent la livraison continue avec un bouton de deploiement manuel pour la production.

Le deploiement blue-green maintient deux environnements identiques. L'un (blue) sert le trafic actuel. L'autre (green) recoit la nouvelle version. Quand le green est pret et valide (health checks), le trafic bascule instantanement. Si un probleme survient, on rebascule vers le blue en secondes. Zero downtime garanti.

Le deploiement canary expose la nouvelle version a un petit pourcentage des utilisateurs (5-10%). Si les metriques restent stables (taux d'erreur, latence, satisfaction), le pourcentage augmente progressivement jusqu'a 100%. Si une anomalie est detectee, le canary est retire. C'est plus progressif et moins risque que le blue-green.

Le rolling update remplace les instances une par une. Si vous avez 4 replicas, le rolling update remplace le premier, verifie sa sante, puis passe au deuxieme. A tout moment, au moins 3 replicas servent le trafic. C'est le mode par defaut de Docker Compose et Kubernetes.

Les feature flags permettent de deployer du code en production sans l'activer. Le code est present mais desactive par un flag (if featureFlags.newDashboard). Cela decouple le deploiement de l'activation. Vous deployez le lundi, testez en interne mardi, et activez pour tous les utilisateurs mercredi. En cas de probleme, desactivez le flag sans rollback.

Les environnements de staging reproduisent la production a l'identique. Chaque deploiement passe d'abord par le staging pour validation (tests de fumee, verification manuelle). Freenzy utilise Coolify sur Hetzner pour gerer les deploiements, avec Traefik comme reverse proxy qui route le trafic et gere les certificats TLS automatiquement.`,
          xpReward: 25,
        },
        {
          id: 'ci-m4-l2',
          title: 'Jeu : Strategies de deploiement',
          duration: '4 min',
          type: 'game',
          gameType: 'flashcards',
          gameData: {
            cards: [
              { front: 'Blue-Green', back: 'Deux environnements identiques, bascule instantanee du trafic' },
              { front: 'Canary', back: 'Exposition progressive (5% puis 100%) avec monitoring' },
              { front: 'Rolling Update', back: 'Remplacement des instances une par une' },
              { front: 'Feature Flag', back: 'Code deploye mais active/desactive par configuration' },
              { front: 'Staging', back: 'Environnement identique a la production pour validation' },
              { front: 'Zero Downtime', back: 'Deploiement sans interruption de service' },
            ],
          },
          content: 'Revisez les strategies de deploiement avec des flashcards.',
          xpReward: 25,
        },
        {
          id: 'ci-m4-l3',
          title: 'Quiz — Deploiement continu',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur le deploiement continu.',
          quizQuestions: [
            {
              question: 'Quelle est la difference entre livraison continue et deploiement continu ?',
              options: [
                'Ce sont des synonymes',
                'La livraison prepare un artefact deployable, le deploiement le met automatiquement en production',
                'Le deploiement est plus lent',
                'La livraison est uniquement pour le staging',
              ],
              correctIndex: 1,
              explanation: 'La livraison continue produit un artefact pret a deployer (image Docker, package). Le deploiement continu va un pas plus loin en le deployant automatiquement sans clic humain.',
            },
            {
              question: 'Quel avantage du deploiement canary par rapport au blue-green ?',
              options: [
                'Il est plus rapide',
                'Il expose progressivement, permettant de detecter les problemes sur un petit pourcentage d\'utilisateurs',
                'Il utilise moins de ressources',
                'Il ne necessite pas de monitoring',
              ],
              correctIndex: 1,
              explanation: 'Le canary est plus progressif : 5% puis 10% puis 50% puis 100%. Si un bug affecte seulement certains cas d\'usage, il sera detecte sur les premiers pourcentages.',
            },
            {
              question: 'Que permet un feature flag ?',
              options: [
                'Deployer plus rapidement',
                'Deployer du code en production sans l\'activer, decoupling deploiement et activation',
                'Compresser le code',
                'Generer la documentation',
              ],
              correctIndex: 1,
              explanation: 'Les feature flags decouplent le deploiement (le code est en production) de l\'activation (le code est utilise par les utilisateurs). Cela permet des activations et desactivations instantanees.',
            },
            {
              question: 'Pourquoi un environnement de staging est-il critique ?',
              options: [
                'Pour heberger la documentation',
                'Pour valider le deploiement dans un environnement identique a la production avant la mise en ligne',
                'Pour stocker les backups',
                'Pour executer les tests unitaires',
              ],
              correctIndex: 1,
              explanation: 'Le staging reproduit la production. Les tests de fumee et la verification manuelle sur staging attrapent les problemes que les tests automatises n\'ont pas detectes.',
            },
            {
              question: 'Quel outil Freenzy utilise-t-il pour le deploiement ?',
              options: [
                'Jenkins',
                'Coolify sur Hetzner avec Traefik',
                'AWS ECS',
                'Heroku',
              ],
              correctIndex: 1,
              explanation: 'Freenzy utilise Coolify (Docker Compose) deploye sur un serveur Hetzner en EU, avec Traefik comme reverse proxy pour le routage et les certificats TLS automatiques.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F680}',
      badgeName: 'Deploy Master',
    },
    {
      id: 'ci-m5',
      title: 'Monitoring et observabilite',
      emoji: '\u{1F4CA}',
      description: 'Surveillez vos deployements avec du monitoring et de l\'alerting.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m5-l1',
          title: 'Monitoring post-deploiement',
          duration: '6 min',
          type: 'text',
          content: `Deployer sans monitorer, c'est conduire de nuit sans phares. Le monitoring post-deploiement detecte les problemes avant que les utilisateurs ne les signalent. Les trois piliers de l'observabilite sont les metriques, les logs et les traces.

Les metriques quantifient la sante de votre systeme. Les metriques RED (Rate, Errors, Duration) couvrent l'essentiel : combien de requetes par seconde (debit), quel pourcentage echoue (taux d'erreur), et combien de temps elles prennent (latence). Ajoutez les metriques USE pour l'infrastructure : Utilisation (CPU, memoire), Saturation (queue de requetes), Erreurs systeme.

Les health checks sont la base du monitoring. Un endpoint /health qui retourne 200 si tout va bien, 503 si un composant est defaillant. Verifiez la connexion a PostgreSQL, Redis, et aux APIs externes. Freenzy execute un health check toutes les 5 minutes via un cron systeme. Coolify utilise ce health check pour decider de redemarrer un conteneur.

Les logs structures en JSON sont indispensables en production. Le format { "level": "error", "service": "backend", "action": "user_login", "userId": "123", "error": "invalid_password", "timestamp": "..." } permet de filtrer par service, par utilisateur, par niveau d'erreur. Contrairement aux logs textuels, les logs JSON sont parsables par les outils de monitoring (ELK, Loki, Datadog).

Les alertes transforment les metriques en actions. Configurez des seuils : si le taux d'erreur depasse 5% pendant 5 minutes, alerte critique. Si la latence P95 depasse 2 secondes, alerte warning. Si l'espace disque passe sous 20%, alerte critique. Les alertes arrivent par email, Slack, SMS ou WhatsApp selon la severite.

Les dashboards visualisent l'etat du systeme en temps reel. Grafana est le standard pour les dashboards de monitoring. Affichez les metriques RED, l'utilisation des ressources, le nombre de connexions a la base de donnees, et les deployements recents sur une timeline. Un bon dashboard permet de correler un pic d'erreurs avec un deploiement specifique.

Le post-mortem apres chaque incident documente ce qui s'est passe, pourquoi, comment ca a ete detecte, comment ca a ete resolu, et quelles actions preventives sont planifiees. Sans post-mortem, les memes incidents se repetent. Freenzy monitore l'espace disque Docker apres un incident ou le cache a rempli le disque et crashe PostgreSQL.`,
          xpReward: 25,
        },
        {
          id: 'ci-m5-l2',
          title: 'Exercice : Plan de monitoring',
          duration: '4 min',
          type: 'exercise',
          exercisePrompt: `Concevez le plan de monitoring complet pour une application IA deployee avec Docker Compose (backend, dashboard, PostgreSQL, Redis).

Pour chaque composant, definissez :

1. Backend Express :
   - 3 metriques RED a suivre (avec seuils d'alerte)
   - Format de log structure JSON (exemple concret)
   - Endpoint /health et ce qu'il verifie

2. PostgreSQL :
   - 3 metriques critiques (connexions, requetes lentes, espace disque)
   - Seuils d'alerte pour chaque metrique

3. Redis :
   - 3 metriques a surveiller (memoire, hit ratio, connexions)

4. Infrastructure Docker :
   - 3 metriques systeme (CPU, memoire, disque)
   - Comment detecter un conteneur crashe

5. Alerting :
   - Classez les alertes par severite (info, warning, critical)
   - Canal de notification par severite (email, Slack, SMS)

6. Dashboard Grafana :
   - 5 panneaux essentiels a afficher
   - Comment correler un deploiement avec un pic d'erreurs

Bonus : ecrivez un post-mortem template (5 sections).`,
          content: 'Concevez un plan de monitoring complet pour une stack Docker.',
          xpReward: 25,
        },
        {
          id: 'ci-m5-l3',
          title: 'Quiz — Monitoring',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur le monitoring et l\'observabilite.',
          quizQuestions: [
            {
              question: 'Que signifie l\'acronyme RED dans le monitoring ?',
              options: [
                'Read, Edit, Delete',
                'Rate, Errors, Duration',
                'Request, Endpoint, Database',
                'Response, Exception, Delay',
              ],
              correctIndex: 1,
              explanation: 'RED : Rate (requetes/seconde), Errors (pourcentage d\'erreurs), Duration (latence). Ces 3 metriques couvrent l\'essentiel de la sante d\'un service.',
            },
            {
              question: 'Pourquoi les logs JSON sont-ils preferes aux logs textuels ?',
              options: [
                'Ils sont plus petits',
                'Ils sont parsables par les outils de monitoring, permettant le filtrage par champ',
                'Ils sont plus lisibles pour les humains',
                'Ils sont obligatoires en Docker',
              ],
              correctIndex: 1,
              explanation: 'Les logs JSON { "level": "error", "service": "backend" } sont parsables automatiquement. On peut filtrer par service, par niveau, par utilisateur — impossible avec du texte libre.',
            },
            {
              question: 'A quelle frequence Freenzy execute-t-il ses health checks ?',
              options: [
                'Toutes les minutes',
                'Toutes les 5 minutes',
                'Toutes les 15 minutes',
                'Toutes les heures',
              ],
              correctIndex: 1,
              explanation: 'Le cron de health check s\'execute toutes les 5 minutes. C\'est un bon equilibre entre detection rapide et charge minimale sur le systeme.',
            },
            {
              question: 'Qu\'est-ce qu\'un post-mortem ?',
              options: [
                'Un rapport de deploiement',
                'Un document qui analyse un incident : causes, resolution et actions preventives',
                'Un test de regression',
                'Un backup de production',
              ],
              correctIndex: 1,
              explanation: 'Le post-mortem documente l\'incident sans blamer. Il identifie les causes racines et definit des actions preventives pour eviter la repetition. C\'est un outil d\'apprentissage.',
            },
            {
              question: 'Quel outil est le standard pour les dashboards de monitoring ?',
              options: [
                'Excel',
                'Grafana',
                'Notion',
                'Google Analytics',
              ],
              correctIndex: 1,
              explanation: 'Grafana est le standard open-source pour les dashboards de monitoring. Il se connecte a Prometheus, InfluxDB, Loki et d\'autres sources de donnees pour visualiser les metriques.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F4CA}',
      badgeName: 'Monitor Pro',
    },
    {
      id: 'ci-m6',
      title: 'Rollback et recovery',
      emoji: '\u{1F6E1}\u{FE0F}',
      description: 'Gerez les rollbacks et la recovery en cas de deploiement defaillant.',
      duration: '15 min',
      lessons: [
        {
          id: 'ci-m6-l1',
          title: 'Strategies de rollback',
          duration: '6 min',
          type: 'text',
          content: `Meme avec les meilleurs tests et le meilleur monitoring, un deploiement peut mal tourner. La capacite a revenir rapidement a un etat stable est la marque d'un systeme de production mature. Le rollback n'est pas un echec — c'est une procedure de securite essentielle.

Le rollback Docker est le plus simple. Chaque deploiement utilise une image taggee avec le SHA du commit. Pour rollback, changez le tag de l'image vers la version precedente : image: myapp:abc1234 redevient image: myapp:xyz5678, puis docker compose up -d. Les conteneurs sont recrees avec l'ancienne image en quelques secondes. Les donnees dans les volumes sont preservees.

Le rollback de base de donnees est plus delicat. Si votre deploiement incluait une migration SQL, le rollback doit aussi annuler la migration. C'est pourquoi chaque migration a un "down". Mais attention : si la migration a supprime une colonne ou des donnees, le down ne peut pas les restaurer. Ayez toujours un backup pg_dump avant chaque migration risquee.

Le rollback progressif utilise les feature flags. Si le probleme vient d'une fonctionnalite specifique, desactivez le flag au lieu de rollback tout le deploiement. C'est plus chirurgical et preserve les autres changements qui fonctionnent. Freenzy utilise la table agent_runtime_config pour activer/desactiver des fonctionnalites sans redeploiement.

Le runbook est le document qui decrit pas a pas la procedure de rollback. Pour chaque scenario (crash backend, migration echouee, corruption de donnees), le runbook liste les commandes exactes a executer, dans l'ordre, avec les verifications a chaque etape. Redigez-le a froid — en pleine panne, personne n'a le temps de reflechir.

Le Disaster Recovery va au-dela du rollback. En cas de perte du serveur, pouvez-vous reconstruire tout depuis zero ? La reponse depend de vos backups. Freenzy sauvegarde PostgreSQL quotidiennement dans /root/backups/freenzy/ avec rotation 7 jours. Le code est sur GitHub. Les secrets sont dans Coolify. Avec ces trois elements, la reconstruction complete prend moins d'une heure.

Le temps de recovery (RTO — Recovery Time Objective) et la perte acceptable (RPO — Recovery Point Objective) cadrent votre strategie. Un RPO de 24h signifie que vous acceptez de perdre au maximum 24h de donnees (backup quotidien). Un RTO de 1h signifie que le service doit etre retabli en moins d'une heure. Ces objectifs determinent la frequence des backups et la complexite du plan de recovery.`,
          xpReward: 25,
        },
        {
          id: 'ci-m6-l2',
          title: 'Jeu : Procedures de rollback',
          duration: '4 min',
          type: 'game',
          gameType: 'ordering',
          gameData: {
            instruction: 'Remettez dans l\'ordre la procedure de rollback en cas de deploiement defaillant',
            items: [
              'Detecter le probleme via le monitoring (alertes, metriques)',
              'Evaluer la severite (degradation partielle ou panne totale)',
              'Decider entre rollback complet, feature flag ou hotfix',
              'Executer le rollback (changer le tag Docker, annuler la migration)',
              'Verifier que le service est retabli (health check, metriques)',
              'Rediger le post-mortem avec les actions preventives',
            ],
            correctOrder: [0, 1, 2, 3, 4, 5],
          },
          content: 'Ordonnez les etapes de la procedure de rollback.',
          xpReward: 25,
        },
        {
          id: 'ci-m6-l3',
          title: 'Quiz — Rollback et recovery',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur les strategies de rollback.',
          quizQuestions: [
            {
              question: 'Comment effectuer un rollback Docker rapidement ?',
              options: [
                'Supprimer le conteneur et reinstaller depuis Git',
                'Changer le tag de l\'image vers la version precedente et recreer les conteneurs',
                'Redemarrer le serveur',
                'Restaurer un snapshot du disque',
              ],
              correctIndex: 1,
              explanation: 'Avec les tags SHA (myapp:abc1234), il suffit de pointer vers le tag precedent et docker compose up -d. Les conteneurs sont recrees en secondes avec l\'ancienne version.',
            },
            {
              question: 'Pourquoi avoir un backup pg_dump avant chaque migration risquee ?',
              options: [
                'C\'est une bonne pratique sans raison technique',
                'Parce que le "down" d\'une migration ne peut pas restaurer des donnees supprimees',
                'Pour accelerer la migration',
                'Pour reduire la taille de la base',
              ],
              correctIndex: 1,
              explanation: 'Si la migration supprime une colonne, le "down" peut la recreer mais pas recuperer les donnees perdues. Un backup pre-migration est le seul moyen de restaurer les donnees.',
            },
            {
              question: 'Qu\'est-ce qu\'un runbook ?',
              options: [
                'Un script de tests',
                'Un document detaillant les procedures pas a pas pour chaque scenario d\'incident',
                'Un fichier de configuration Docker',
                'Un rapport de monitoring',
              ],
              correctIndex: 1,
              explanation: 'Le runbook liste les commandes exactes pour chaque scenario (crash, migration echouee, etc.). En pleine panne, il elimine le besoin de reflechir sous pression.',
            },
            {
              question: 'Que signifie RPO (Recovery Point Objective) ?',
              options: [
                'Le temps pour retablir le service',
                'La perte de donnees maximale acceptable (ex: 24h = backup quotidien suffit)',
                'Le nombre de serveurs necessaires',
                'La frequence des deploiements',
              ],
              correctIndex: 1,
              explanation: 'RPO = combien de donnees pouvez-vous perdre ? Un RPO de 24h signifie qu\'un backup quotidien suffit. Un RPO de 1h necessite des backups WAL continus.',
            },
            {
              question: 'Quelle est l\'approche la plus chirurgicale pour annuler un changement defaillant ?',
              options: [
                'Rollback complet du deploiement',
                'Desactiver le feature flag de la fonctionnalite problematique',
                'Redemarrer tous les conteneurs',
                'Restaurer le backup de la base de donnees',
              ],
              correctIndex: 1,
              explanation: 'Le feature flag permet de desactiver uniquement la fonctionnalite problematique, sans affecter les autres changements du deploiement qui fonctionnent correctement.',
            },
          ],
          xpReward: 25,
        },
      ],
      passingScore: 60,
      xpReward: 150,
      badgeEmoji: '\u{1F6E1}\u{FE0F}',
      badgeName: 'Recovery Expert',
    },
  ],
};
