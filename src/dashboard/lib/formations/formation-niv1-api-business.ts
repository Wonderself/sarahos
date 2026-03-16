// =============================================================================
// Freenzy.io — Formation Niveau 1
// Parcours: API & Webhooks + Business Plan
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// PARCOURS 1 — API & Webhooks pour debutants
// ---------------------------------------------------------------------------

export const parcoursAPIWebhooks: FormationParcours = {
  id: 'api-webhooks-niv1',
  title: 'API & Webhooks pour debutants',
  emoji: '\u{1F50C}',
  description: 'Comprenez les API, les webhooks et apprenez a connecter vos outils favoris sans ecrire une seule ligne de code. De Telegram a WhatsApp en passant par Zapier et Make.',
  category: 'technique',
  subcategory: 'api-integrations',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#F97316',
  totalDuration: '6h',
  totalXP: 600,
  diplomaTitle: 'API Explorer',
  diplomaSubtitle: 'Vous maitrisez les bases des API, webhooks et integrations no-code',
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — C'est quoi une API ?
    // -----------------------------------------------------------------------
    {
      id: 'aw-m1',
      title: 'C\'est quoi une API ?',
      emoji: '\u{1F374}',
      description: 'Comprendre le concept d\'API avec des analogies simples, decouvrir REST et le format JSON.',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m1-l1',
          title: 'L\'analogie du restaurant',
          duration: '8 min',
          type: 'text',
          content: `Bienvenue dans cette premiere lecon ! \u{1F44B} On va demystifier ensemble un mot qui fait peur a beaucoup de gens : API. Promis, apres cette lecon, vous verrez que c'est un concept tout simple.

Imaginez que vous etes au restaurant. Vous etes assis a votre table (c'est vous, l'utilisateur). En cuisine, il y a le chef et toute son equipe (c'est le serveur informatique qui detient les donnees et les fonctionnalites). Le probleme ? Vous ne pouvez pas entrer en cuisine pour vous servir directement. Ce serait le bazar total ! \u{1F468}\u{200D}\u{1F373}

C'est la que le serveur entre en jeu. Le serveur prend votre commande, la transmet en cuisine dans un format que le chef comprend, puis revient avec votre plat. Ce serveur, dans le monde informatique, c'est l'API ! API signifie "Application Programming Interface" — en francais, "Interface de Programmation d'Applications".

L'API est donc un intermediaire qui permet a deux logiciels de communiquer entre eux selon des regles precises. Quand vous consultez la meteo sur votre telephone, l'application envoie une requete a l'API du service meteo, qui repond avec les donnees de temperature, vent et previsions. Votre app affiche ensuite ces infos joliment. \u{26C5}

Pourquoi les API sont-elles si importantes ? Parce qu'elles permettent a des systemes completement differents de collaborer. Votre site e-commerce peut utiliser l'API de Stripe pour les paiements, l'API de La Poste pour le suivi des colis, et l'API de Mailchimp pour les emails marketing. Chaque service fait ce qu'il sait faire de mieux, et les API les connectent.

Dans le contexte de Freenzy, chaque fonctionnalite — envoyer un SMS via Twilio, generer une image via fal.ai, analyser un texte via Claude — passe par une API. Comprendre ce mecanisme vous donnera une vision claire de comment tout s'imbrique.

Un dernier point essentiel : une API a des "endpoints" (points d'acces), comme un restaurant a differents plats au menu. Chaque endpoint correspond a une action precise : obtenir des donnees, en envoyer, modifier quelque chose ou supprimer un element. On verra ca en detail dans la lecon suivante ! \u{1F680}`,
          xpReward: 15,
        },
        {
          id: 'aw-m1-l2',
          title: 'REST et le format JSON',
          duration: '9 min',
          type: 'text',
          content: `Maintenant que vous savez ce qu'est une API, parlons du standard le plus repandu : REST. Et de son format de donnees prefere : JSON. \u{1F4E6}

REST signifie "Representational State Transfer". Derriere ce nom complique se cache une idee simple : on accede aux ressources (donnees) via des URLs, et on utilise des "verbes" HTTP pour dire ce qu'on veut faire. Les quatre verbes principaux sont GET (lire), POST (creer), PUT (modifier) et DELETE (supprimer).

Prenons un exemple concret. Imaginons une API de gestion de contacts :
- GET /contacts → recuperer la liste de tous les contacts
- GET /contacts/42 → recuperer le contact numero 42
- POST /contacts → creer un nouveau contact
- PUT /contacts/42 → modifier le contact 42
- DELETE /contacts/42 → supprimer le contact 42

C'est logique et previsible, non ? C'est toute la beaute de REST : une fois que vous comprenez le schema, vous pouvez deviner les endpoints de n'importe quelle API. \u{1F4A1}

Maintenant, parlons de JSON (JavaScript Object Notation). C'est le format dans lequel les API envoient et recoivent les donnees. JSON ressemble a ceci : {"nom": "Marie", "email": "marie@exemple.fr", "age": 32}. C'est lisible par un humain ET par un ordinateur. Chaque donnee est une paire cle-valeur, separee par des virgules, le tout entre accolades.

JSON peut contenir des listes aussi : {"contacts": [{"nom": "Marie"}, {"nom": "Pierre"}]}. Les crochets indiquent une liste (un tableau), les accolades un objet. C'est tout ce qu'il faut retenir.

Quand vous envoyez une requete a une API REST, vous recevez generalement une reponse JSON accompagnee d'un "code de statut". Les plus courants : 200 (tout va bien \u{2705}), 201 (creation reussie), 400 (votre requete est mal formulee), 401 (pas autorise) et 404 (ressource introuvable). Ces codes sont universels — ils fonctionnent pareil chez Google, Stripe ou Freenzy.

Vous n'avez pas besoin de memoriser tout ca par coeur. L'important est de comprendre le principe : une URL + un verbe + du JSON = une communication API. C'est la base de tout ce qu'on va construire dans les modules suivants ! \u{1F3D7}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'aw-m1-l3',
          title: 'Quiz : Les fondamentaux des API',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez que vous avez bien compris les concepts d\'API, REST et JSON avant de passer a la suite.',
          quizQuestions: [
            {
              question: 'Dans l\'analogie du restaurant, que represente l\'API ?',
              options: ['Le chef en cuisine', 'Le client a table', 'Le serveur qui transmet les commandes', 'Le menu sur la table'],
              correctIndex: 2,
              explanation: 'L\'API joue le role du serveur : elle transmet les requetes de l\'utilisateur (le client) au serveur informatique (la cuisine) et renvoie la reponse.',
            },
            {
              question: 'Quel verbe HTTP utilise-t-on pour CREER une nouvelle ressource ?',
              options: ['GET', 'POST', 'PUT', 'DELETE'],
              correctIndex: 1,
              explanation: 'POST est le verbe HTTP pour creer une nouvelle ressource. GET lit, PUT modifie et DELETE supprime.',
            },
            {
              question: 'Que signifie le code de statut 404 ?',
              options: ['Requete reussie', 'Non autorise', 'Ressource introuvable', 'Erreur serveur'],
              correctIndex: 2,
              explanation: 'Le code 404 signifie que la ressource demandee n\'a pas ete trouvee. C\'est le fameux "Page not found" que vous avez surement deja vu !',
            },
            {
              question: 'Quel format de donnees est le plus utilise avec les API REST ?',
              options: ['XML', 'CSV', 'JSON', 'HTML'],
              correctIndex: 2,
              explanation: 'JSON (JavaScript Object Notation) est le format standard pour les API REST. Il est lisible par les humains et facile a traiter par les machines.',
            },
            {
              question: 'Comment s\'appelle un point d\'acces specifique d\'une API ?',
              options: ['Un plugin', 'Un endpoint', 'Un widget', 'Un token'],
              correctIndex: 1,
              explanation: 'Un endpoint est un point d\'acces specifique d\'une API, associe a une URL et un verbe HTTP (par exemple GET /contacts).',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F374}',
      badgeName: 'Maitre d\'hotel API',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Connecter Telegram
    // -----------------------------------------------------------------------
    {
      id: 'aw-m2',
      title: 'Connecter Telegram',
      emoji: '\u{2708}\u{FE0F}',
      description: 'Creer un bot Telegram avec BotFather et le connecter a votre systeme via un token.',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m2-l1',
          title: 'Creer un bot avec BotFather',
          duration: '8 min',
          type: 'text',
          content: `Place a la pratique ! \u{1F389} Dans cette lecon, vous allez creer votre propre bot Telegram. C'est souvent la premiere integration que font les debutants, et pour cause : c'est simple, gratuit et tres satisfaisant.

Telegram est une application de messagerie qui offre une API incroyablement puissante pour creer des bots. Un bot Telegram peut recevoir des messages, repondre automatiquement, envoyer des notifications, et meme afficher des boutons interactifs. Chez Freenzy, le bot Telegram admin permet de gerer la plateforme directement depuis son telephone ! \u{1F4F1}

Pour creer un bot, tout passe par BotFather — c'est le bot officiel de Telegram qui gere la creation d'autres bots (oui, un bot pour creer des bots, on adore la meta-recursion \u{1F604}). Voici les etapes :

Etape 1 : Ouvrez Telegram et cherchez @BotFather dans la barre de recherche. Verifiez le badge bleu de verification pour etre sur d'avoir le vrai BotFather.

Etape 2 : Envoyez la commande /newbot. BotFather vous demandera d'abord un nom d'affichage pour votre bot (par exemple "Mon Assistant Freenzy"). Puis un nom d'utilisateur unique qui doit obligatoirement se terminer par "bot" (par exemple "mon_assistant_freenzy_bot").

Etape 3 : BotFather vous repond avec un message contenant votre token d'API. Ce token ressemble a quelque chose comme 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ. C'est votre cle secrete pour controler le bot. Gardez-la precieusement ! \u{1F511}

Etape 4 : Vous pouvez personnaliser votre bot avec les commandes /setdescription (texte d'accueil), /setabouttext (a propos) et /setuserpic (photo de profil).

Important : ne partagez JAMAIS votre token publiquement. Si quelqu'un l'obtient, il pourra controler votre bot. En cas de fuite, utilisez /revoke chez BotFather pour generer un nouveau token et invalider l'ancien.

Votre bot est maintenant cree ! \u{1F389} Mais pour l'instant, il ne fait rien — il attend des instructions. Dans la prochaine lecon, on va comprendre comment le token permet la communication entre votre code et Telegram.`,
          xpReward: 15,
        },
        {
          id: 'aw-m2-l2',
          title: 'Le token et l\'authentification',
          duration: '8 min',
          type: 'text',
          content: `Vous avez votre token Telegram en main. Mais a quoi sert-il exactement, et comment l'utiliser de maniere securisee ? C'est ce qu'on va voir. \u{1F510}

Le token est comme un badge d'acces a un batiment. Sans lui, impossible d'entrer. Avec lui, vous avez les pleins pouvoirs sur votre bot. Concretement, le token s'insere dans chaque requete que vous envoyez a l'API Telegram.

L'URL de base de l'API Telegram suit ce schema : https://api.telegram.org/bot{VOTRE_TOKEN}/{METHODE}. Par exemple, pour envoyer un message, vous appelleriez : https://api.telegram.org/bot123456:ABC.../sendMessage. Simple et direct.

Le concept d'authentification par token est universel dans le monde des API. Presque tous les services que vous utiliserez (Stripe, OpenAI, Twilio, fal.ai) fonctionnent de la meme maniere : vous obtenez une cle API (un token) et vous l'incluez dans vos requetes pour prouver votre identite.

Il existe deux facons principales de transmettre un token. La premiere, comme Telegram, directement dans l'URL. La deuxieme, plus courante et plus securisee, dans un "header" (en-tete) de la requete, generalement sous la forme "Authorization: Bearer votre_token". C'est la methode utilisee par Freenzy, Stripe et la majorite des API modernes. \u{1F6E1}\u{FE0F}

Les bonnes pratiques de securite pour vos tokens :

Premierement, stockez vos tokens dans des variables d'environnement (fichiers .env), jamais en dur dans le code. Si votre code est sur GitHub, un token en clair serait visible par tout le monde.

Deuxiemement, utilisez des tokens differents pour le developpement et la production. La plupart des services proposent un "mode test" avec des tokens separes.

Troisiemement, renouvelez regulierement vos tokens, surtout si une personne ayant eu acces quitte l'equipe.

Quatriemement, limitez les permissions quand c'est possible. Certains services permettent de creer des tokens avec des droits restreints (lecture seule, acces a un seul projet, etc.).

Chez Freenzy, tous les tokens (Anthropic, Twilio, ElevenLabs, fal.ai) sont stockes dans un fichier .env chiffre, jamais dans le code source. C'est une regle d'or : votre token ne doit jamais apparaitre dans un commit Git. \u{26A0}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'aw-m2-l3',
          title: 'Quiz : Telegram et tokens',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la creation de bots Telegram et la gestion des tokens.',
          quizQuestions: [
            {
              question: 'Comment s\'appelle le bot officiel pour creer des bots Telegram ?',
              options: ['@TelegramAdmin', '@BotCreator', '@BotFather', '@TelegramAPI'],
              correctIndex: 2,
              explanation: '@BotFather est le bot officiel de Telegram pour creer et gerer d\'autres bots. Cherchez le badge bleu de verification.',
            },
            {
              question: 'Quelle contrainte a le nom d\'utilisateur d\'un bot Telegram ?',
              options: ['Doit contenir un chiffre', 'Doit se terminer par "bot"', 'Doit commencer par une majuscule', 'Doit faire moins de 5 caracteres'],
              correctIndex: 1,
              explanation: 'Le nom d\'utilisateur d\'un bot Telegram doit obligatoirement se terminer par "bot" (par exemple "mon_assistant_bot").',
            },
            {
              question: 'Ou faut-il stocker un token API pour la securite ?',
              options: ['Dans le code source directement', 'Dans un fichier .env (variable d\'environnement)', 'Dans un commentaire du code', 'Dans le README du projet'],
              correctIndex: 1,
              explanation: 'Les tokens doivent etre stockes dans des variables d\'environnement (.env) et jamais dans le code source pour eviter les fuites.',
            },
            {
              question: 'Que faire si votre token Telegram est compromis ?',
              options: ['Rien, il se renouvelle automatiquement', 'Utiliser /revoke chez BotFather pour generer un nouveau token', 'Supprimer le bot et en creer un nouveau', 'Changer le mot de passe de votre compte Telegram'],
              correctIndex: 1,
              explanation: 'La commande /revoke chez BotFather invalide l\'ancien token et en genere un nouveau instantanement.',
            },
            {
              question: 'Quelle methode d\'authentification est la plus securisee pour les API ?',
              options: ['Token dans l\'URL', 'Token dans le header Authorization: Bearer', 'Token dans un cookie', 'Pas de token du tout'],
              correctIndex: 1,
              explanation: 'Le header "Authorization: Bearer" est la methode standard et la plus securisee. Le token dans l\'URL peut apparaitre dans les logs et l\'historique du navigateur.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{2708}\u{FE0F}',
      badgeName: 'Bot Builder',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Les Webhooks
    // -----------------------------------------------------------------------
    {
      id: 'aw-m3',
      title: 'Les Webhooks',
      emoji: '\u{1F514}',
      description: 'Comprendre la difference entre polling et webhooks, et les bases de la securite webhook.',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m3-l1',
          title: 'Push vs Pull : comprendre les webhooks',
          duration: '9 min',
          type: 'text',
          content: `Jusqu'ici, on a parle de requetes que VOUS envoyez vers une API. Mais que se passe-t-il quand c'est le SERVICE qui veut vous prevenir de quelque chose ? C'est la qu'entrent en scene les webhooks ! \u{1F514}

Imaginons un scenario concret : vous avez une boutique en ligne et un client vient de payer. Stripe traite le paiement. Comment votre site est-il informe que le paiement est reussi ?

Premiere approche : le "polling" (pull). Votre serveur demande a Stripe toutes les 5 secondes : "Y a-t-il un nouveau paiement ? Et maintenant ? Et la ?" C'est comme un enfant qui demande "On est arrives ?" toutes les deux minutes en voiture. Ca fonctionne, mais c'est inefficace, gourmand en ressources et pas instantane. \u{1F697}

Deuxieme approche : le webhook (push). Vous dites a Stripe : "Quand un paiement arrive, envoie une notification a cette URL : https://monsite.com/webhooks/stripe." Stripe envoie alors automatiquement les details du paiement des qu'il est confirme. Pas de delai, pas de requetes inutiles. C'est comme si le GPS annoncait proactivement "Vous arrivez dans 2 minutes."

Un webhook est donc une URL sur votre serveur que vous communiquez a un service externe, et ce service envoie des requetes HTTP POST a cette URL quand un evenement se produit. On appelle aussi ca un "callback URL" ou une "notification URL".

Les webhooks sont partout dans l'ecosysteme Freenzy :
- Twilio envoie un webhook quand un SMS arrive ou quand un appel est recu \u{1F4DE}
- Stripe envoie un webhook quand un paiement reussit ou echoue \u{1F4B3}
- WhatsApp Cloud API envoie un webhook quand un message est recu \u{1F4AC}
- GitHub envoie un webhook quand du code est pousse sur le depot \u{1F4BB}

Le flux est toujours le meme : (1) vous configurez une URL de webhook dans le service, (2) un evenement se produit, (3) le service envoie un POST avec les details en JSON a votre URL, (4) votre serveur traite les donnees et repond avec un code 200 pour confirmer la reception.

Point crucial : votre serveur doit repondre rapidement (en general sous 5 secondes). Si le service ne recoit pas de reponse 200, il considere que la livraison a echoue et reessaie. La plupart des services font 3 a 5 tentatives avant d'abandonner. C'est pour ca qu'on traite les webhooks de maniere asynchrone — on accuse reception d'abord, on traite ensuite. \u{26A1}`,
          xpReward: 15,
        },
        {
          id: 'aw-m3-l2',
          title: 'Securiser ses webhooks',
          duration: '9 min',
          type: 'text',
          content: `Les webhooks sont puissants, mais ils posent un probleme de securite important : comment savoir si la requete vient vraiment de Stripe et pas d'un imposteur ? \u{1F575}\u{FE0F}

Imaginez : votre URL de webhook est https://monsite.com/webhooks/stripe. Si quelqu'un decouvre cette URL, il pourrait envoyer de fausses notifications de paiement pour obtenir des services gratuits. Ce serait catastrophique ! C'est pourquoi la verification des webhooks est absolument essentielle.

La methode la plus courante est la signature HMAC (Hash-based Message Authentication Code). Voici comment ca marche, etape par etape :

Le service (Stripe, Twilio, etc.) possede un "webhook secret" qu'il partage avec vous lors de la configuration. Quand il envoie un webhook, il calcule une signature en combinant le contenu du message avec ce secret via un algorithme de hachage (generalement SHA-256). Cette signature est ajoutee dans un header de la requete.

De votre cote, quand vous recevez le webhook, vous recalculez la signature avec le meme secret et le meme algorithme. Si votre signature correspond a celle du header, le message est authentique. Sinon, c'est un faux — vous le rejetez avec un code 403.

Chez Freenzy, cette verification est obligatoire pour les webhooks Twilio. Le code verifie systematiquement la signature HMAC de chaque requete entrante. Si la signature ne correspond pas, la requete est rejetee. Zero tolerance. \u{1F6E1}\u{FE0F}

Autres bonnes pratiques de securite pour vos webhooks :

Utilisez toujours HTTPS pour vos URLs de webhook. Les donnees transitent sur Internet — sans chiffrement, elles pourraient etre interceptees par un tiers.

Implementez l'idempotence. Un service peut envoyer le meme webhook plusieurs fois (en cas de timeout reseau). Votre code doit detecter les doublons et ne pas traiter deux fois le meme evenement. Utilisez un identifiant unique dans le payload pour ca.

Filtrez les evenements. La plupart des services vous permettent de choisir quels types d'evenements declenchent un webhook. N'ecoutez que ceux dont vous avez besoin — ca reduit la surface d'attaque.

Enfin, loguez tout. Chaque webhook recu doit etre enregistre avec son timestamp, son type, sa signature et son statut de traitement. En cas de probleme, ces logs sont votre meilleur outil de diagnostic. \u{1F4CB}`,
          xpReward: 15,
        },
        {
          id: 'aw-m3-l3',
          title: 'Quiz : Webhooks et securite',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les webhooks, le push vs pull et la securisation.',
          quizQuestions: [
            {
              question: 'Quelle est la difference principale entre polling et webhook ?',
              options: [
                'Le polling est gratuit, le webhook est payant',
                'Le polling interroge regulierement le service, le webhook recoit une notification automatique',
                'Le webhook est plus lent que le polling',
                'Il n\'y a aucune difference fonctionnelle',
              ],
              correctIndex: 1,
              explanation: 'Le polling envoie des requetes repetees pour verifier les changements, tandis que le webhook recoit une notification instantanee quand un evenement se produit.',
            },
            {
              question: 'Quel code HTTP votre serveur doit-il renvoyer pour confirmer la reception d\'un webhook ?',
              options: ['100', '200', '301', '404'],
              correctIndex: 1,
              explanation: 'Un code 200 confirme au service que le webhook a bien ete recu. Sans ce code, le service tentera de renvoyer le webhook.',
            },
            {
              question: 'A quoi sert la signature HMAC sur un webhook ?',
              options: [
                'A chiffrer les donnees pour le transport',
                'A compresser le payload JSON',
                'A verifier que le webhook vient bien du service attendu',
                'A accelerer le traitement du webhook',
              ],
              correctIndex: 2,
              explanation: 'La signature HMAC permet de verifier l\'authenticite du webhook. Vous recalculez la signature et la comparez a celle fournie pour confirmer l\'origine.',
            },
            {
              question: 'Pourquoi l\'idempotence est-elle importante pour les webhooks ?',
              options: [
                'Pour rendre les webhooks plus rapides',
                'Pour eviter de traiter deux fois le meme evenement en cas de renvoi',
                'Pour limiter le nombre de webhooks recus par jour',
                'Pour chiffrer les donnees',
              ],
              correctIndex: 1,
              explanation: 'Un service peut renvoyer le meme webhook si le premier n\'a pas ete confirme a temps. L\'idempotence garantit qu\'un traitement en double n\'a pas d\'effet indesirable.',
            },
            {
              question: 'Quel protocole est obligatoire pour les URLs de webhook en production ?',
              options: ['HTTP', 'HTTPS', 'FTP', 'WebSocket'],
              correctIndex: 1,
              explanation: 'HTTPS est obligatoire pour chiffrer les donnees en transit. La plupart des services refusent les URLs HTTP pour les webhooks en production.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F514}',
      badgeName: 'Webhook Watcher',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Automatiser avec Zapier et Make
    // -----------------------------------------------------------------------
    {
      id: 'aw-m4',
      title: 'Automatiser avec Zapier et Make',
      emoji: '\u{26A1}',
      description: 'Creer des automatisations no-code en connectant des services via Zapier et Make (ex-Integromat).',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m4-l1',
          title: 'Zapier : votre premiere automatisation',
          duration: '9 min',
          type: 'text',
          content: `Bonne nouvelle : vous n'avez PAS besoin de savoir coder pour utiliser des API ! \u{1F389} Des outils comme Zapier et Make vous permettent de connecter des centaines de services entre eux via une interface visuelle. C'est ce qu'on appelle le "no-code".

Zapier est le plus connu de ces outils. Son concept est simple : un "Zap" (automatisation) est compose d'un "Trigger" (declencheur) et d'une ou plusieurs "Actions". Par exemple : "Quand je recois un email avec piece jointe (trigger), sauvegarder la piece jointe dans Google Drive (action 1) et m'envoyer une notification Slack (action 2)."

Pour creer votre premier Zap, rendez-vous sur zapier.com et creez un compte gratuit. Le plan gratuit offre 100 taches par mois avec des Zaps a 2 etapes — largement suffisant pour debuter. \u{1F4B0}

Voici un Zap concret et utile : recevoir une notification Telegram quand un formulaire est rempli.

Etape 1 — Trigger : Choisissez "Google Forms" comme application declencheur, et selectionnez l'evenement "New Form Response". Connectez votre compte Google et selectionnez le formulaire a surveiller.

Etape 2 — Action : Choisissez "Telegram Bot API" comme application d'action. L'evenement sera "Send Message". Connectez votre bot Telegram (avec le token obtenu dans le module precedent !). Configurez le message avec les champs du formulaire : "Nouveau formulaire recu ! Nom : {nom}, Email : {email}."

Etape 3 — Test : Zapier vous permet de tester chaque etape. Remplissez votre formulaire Google, verifiez que Zapier detecte la reponse, puis verifiez que le message arrive bien sur Telegram.

Etape 4 — Activation : Si le test fonctionne, activez votre Zap. Il tournera automatiquement en arriere-plan 24h/24.

Les Zaps les plus populaires dans un contexte business :
- Nouveau lead dans un formulaire → ajout au CRM + email de bienvenue \u{1F4E7}
- Nouveau paiement Stripe → message Slack + mise a jour du tableur
- Mention sur les reseaux sociaux → notification + archivage
- Nouveau fichier dans Dropbox → traitement automatique + notification equipe

Zapier prend en charge plus de 6000 applications. Si un service a une API, il y a de fortes chances qu'il soit sur Zapier. Et si ce n'est pas le cas, vous pouvez utiliser le module "Webhooks by Zapier" pour vous connecter a n'importe quelle API via des webhooks — exactement ce qu'on a appris dans le module precedent ! \u{1F50C}`,
          xpReward: 15,
        },
        {
          id: 'aw-m4-l2',
          title: 'Make : scenarios visuels avances',
          duration: '9 min',
          type: 'text',
          content: `Make (anciennement Integromat) est l'alternative avancee a Zapier. La ou Zapier est lineaire (trigger → action → action), Make propose une interface visuelle en "mind map" qui permet des scenarios bien plus complexes : branches conditionnelles, boucles, gestion d'erreurs et traitement de donnees avance. \u{1F3A8}

La grande force de Make est sa flexibilite. Vous pouvez creer des scenarios avec des "routeurs" qui envoient les donnees vers differents chemins selon des conditions. Par exemple : "Si le montant du devis est superieur a 5000 euros, envoyer a la direction pour validation. Sinon, valider automatiquement et envoyer au client."

Pour commencer avec Make, creez un compte sur make.com. Le plan gratuit offre 1000 operations par mois — genereux pour un debutant. L'interface est un canvas ou vous placez des modules (des ronds) et les reliez par des lignes.

Creons un scenario pratique : automatiser le suivi des prospects.

Module 1 — Trigger : "Watch New Rows" sur Google Sheets. Chaque fois qu'une ligne est ajoutee a votre tableau de prospects, le scenario se declenche.

Module 2 — Routeur : On cree deux branches. Branche A : si la colonne "source" contient "site web". Branche B : si la source est "salon professionnel".

Module 3A — Pour les prospects web : envoyer un email automatique avec un lien vers une demo en ligne.

Module 3B — Pour les prospects salon : envoyer un email personnalise avec un rappel de la rencontre et une proposition de rendez-vous.

Module 4 — Dans les deux cas : ajouter le prospect dans votre CRM (HubSpot, Pipedrive, etc.) avec le bon tag de source. \u{1F4CA}

Make excelle aussi dans le traitement de donnees. Vous pouvez transformer du JSON, parser du texte avec des regex, faire des calculs, formater des dates — tout ca visuellement, sans code. Le module "JSON" de Make est particulierement utile pour travailler avec des API qui ne sont pas nativement supportees.

Zapier ou Make ? Voici un guide rapide :
- Zapier si vous voulez la simplicite et que vos automatisations sont lineaires (A → B → C)
- Make si vous avez besoin de logique conditionnelle, de boucles ou de transformer des donnees \u{1F527}
- Les deux offrent un plan gratuit suffisant pour debuter
- Les deux supportent les webhooks pour se connecter a n'importe quelle API

Conseil pro : commencez par Zapier pour vos premieres automatisations, puis migrez vers Make quand vos besoins se complexifient. Les deux outils sont complementaires et beaucoup de pros utilisent les deux ! \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'aw-m4-l3',
          title: 'Quiz : Automatisation no-code',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez que vous maitrisez les bases de l\'automatisation avec Zapier et Make.',
          quizQuestions: [
            {
              question: 'Comment s\'appelle une automatisation dans Zapier ?',
              options: ['Un scenario', 'Un Zap', 'Un workflow', 'Un pipeline'],
              correctIndex: 1,
              explanation: 'Dans Zapier, une automatisation s\'appelle un "Zap", compose d\'un Trigger (declencheur) et d\'une ou plusieurs Actions.',
            },
            {
              question: 'Quel est l\'avantage principal de Make par rapport a Zapier ?',
              options: [
                'Make est gratuit, Zapier est payant',
                'Make permet des scenarios avec branches conditionnelles et boucles',
                'Make supporte plus d\'applications',
                'Make est plus rapide a executer',
              ],
              correctIndex: 1,
              explanation: 'Make propose une interface visuelle en "mind map" avec routeurs, branches conditionnelles et boucles, la ou Zapier reste lineaire.',
            },
            {
              question: 'Combien d\'applications Zapier supporte-t-il environ ?',
              options: ['500', '1 000', '3 000', 'Plus de 6 000'],
              correctIndex: 3,
              explanation: 'Zapier supporte plus de 6 000 applications, ce qui en fait la plateforme d\'automatisation avec le plus grand catalogue d\'integrations.',
            },
            {
              question: 'Que permet le module "Webhooks by Zapier" ?',
              options: [
                'D\'envoyer des emails',
                'De se connecter a n\'importe quelle API via des webhooks',
                'De creer des pages web',
                'De stocker des fichiers',
              ],
              correctIndex: 1,
              explanation: 'Le module "Webhooks by Zapier" permet de se connecter a n\'importe quelle API en envoyant ou recevant des webhooks, meme si l\'application n\'est pas nativement supportee.',
            },
            {
              question: 'Dans Make, a quoi sert un "routeur" ?',
              options: [
                'A connecter Make a Internet',
                'A diriger les donnees vers differents chemins selon des conditions',
                'A accelerer le traitement',
                'A proteger les donnees personnelles',
              ],
              correctIndex: 1,
              explanation: 'Un routeur dans Make permet de creer des branches conditionnelles : les donnees suivent un chemin different selon les criteres que vous definissez.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{26A1}',
      badgeName: 'Automator',
    },

    // -----------------------------------------------------------------------
    // Module 5 — WhatsApp Business API
    // -----------------------------------------------------------------------
    {
      id: 'aw-m5',
      title: 'WhatsApp Business API',
      emoji: '\u{1F4AC}',
      description: 'Decouvrir WhatsApp Business API, les templates de messages et l\'integration avec votre systeme.',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m5-l1',
          title: 'WhatsApp Business vs Cloud API',
          duration: '9 min',
          type: 'text',
          content: `WhatsApp est utilise par plus de 2 milliards de personnes dans le monde. Pouvoir envoyer des messages automatises a vos clients via WhatsApp, c'est un game changer pour votre business ! \u{1F4AC} Mais il y a plusieurs versions de WhatsApp, et il faut comprendre les differences.

WhatsApp classique, c'est l'application que tout le monde utilise. Pas d'API, pas d'automatisation possible. C'est fait pour les conversations personnelles entre humains.

WhatsApp Business (l'app gratuite) ajoute un profil professionnel, un catalogue de produits, des reponses rapides et des etiquettes pour organiser vos conversations. C'est bien pour un petit commerce avec quelques dizaines de clients, mais tout reste manuel. Pas de connexion avec vos outils. \u{1F3EA}

WhatsApp Business API (aussi appelee Cloud API depuis 2022), c'est le niveau superieur. C'est une API programmatique qui permet d'envoyer et de recevoir des messages automatiquement, de connecter WhatsApp a votre CRM, votre chatbot ou votre systeme de support. C'est ce que Freenzy utilise ! \u{1F680}

Pour acceder a la Cloud API, vous passez par Meta (Facebook). Voici le processus :

1. Creez un compte Meta Business Suite sur business.facebook.com
2. Ajoutez un numero de telephone dedie (un numero qui n'est PAS deja lie a un compte WhatsApp)
3. Verifiez votre entreprise aupres de Meta (documents juridiques requis)
4. Obtenez votre token d'acces permanent et l'ID de votre numero

La Cloud API fonctionne avec un systeme de "conversations" facturees par Meta. Une conversation de 24 heures coute entre 0,005 et 0,08 euros selon le pays et le type (marketing, utilitaire, service ou authentification). Les 1000 premieres conversations de service par mois sont gratuites. \u{1F4B0}

Point important : vous ne pouvez PAS envoyer de messages a n'importe qui. L'utilisateur doit avoir donne son consentement (opt-in) avant de recevoir des messages de votre entreprise. C'est la politique anti-spam de WhatsApp et c'est non negociable.

Pour les messages inities par votre entreprise (hors fenetre de 24h), vous devez utiliser des "templates" pre-approuves par Meta. On en parlera dans la prochaine lecon. Pour les messages en reponse a un client (dans la fenetre de 24h apres son dernier message), vous pouvez envoyer librement sans template. \u{2705}`,
          xpReward: 15,
        },
        {
          id: 'aw-m5-l2',
          title: 'Templates et messages automatises',
          duration: '9 min',
          type: 'text',
          content: `Les templates de messages sont au coeur de WhatsApp Business API. Ce sont des modeles pre-approuves par Meta que vous pouvez utiliser pour contacter vos clients en dehors de la fenetre de conversation de 24 heures. \u{1F4DD}

Pourquoi des templates ? WhatsApp veut proteger ses utilisateurs contre le spam. Chaque template doit etre soumis a Meta pour validation avant utilisation. Le processus de validation prend generalement entre quelques minutes et 24 heures. Meta verifie que le message n'est pas trompeur, qu'il respecte les politiques de la plateforme et qu'il a une utilite reelle pour le destinataire.

Il existe quatre categories de templates :

Marketing : promotions, offres speciales, lancements de produits. "Bonjour {nom} ! Notre nouvelle collection printemps est arrivee. Decouvrez-la avec -20% jusqu'a dimanche. Repondez STOP pour ne plus recevoir ces messages."

Utilitaire : confirmations de commande, mises a jour de livraison, rappels de rendez-vous. "Votre commande #{numero} a ete expediee ! Suivez-la ici : {lien_suivi}. Livraison estimee : {date}."

Authentification : codes de verification, 2FA. "{code} est votre code de verification Freenzy. Ne le partagez avec personne. Valable 10 minutes."

Service : reponses a des demandes client, support. Ces conversations sont initiees par le client, donc pas besoin de template tant que vous repondez dans les 24h. \u{1F4DE}

Pour creer un template performant, suivez ces regles :

Personnalisez avec des variables. Les variables sont notees {1}, {2}, {3} dans le template et remplacees dynamiquement lors de l'envoi. "Bonjour {1}, votre rendez-vous du {2} a {3} est confirme."

Incluez toujours un moyen de se desinscrire pour les messages marketing. C'est obligatoire et ethique.

Soyez concis et direct. WhatsApp n'est pas un email — les messages courts ont un taux d'ouverture bien superieur.

Utilisez les boutons interactifs. Les templates peuvent inclure des boutons d'action rapide ("Confirmer", "Annuler", "Voir les details") ou des boutons URL. Les taux de clic sur les boutons WhatsApp sont tres superieurs aux liens texte classiques. \u{1F4C8}

Chez Freenzy, les templates WhatsApp sont utilises pour les notifications d'agents, les rappels de taches et les alertes systeme. Le bot WhatsApp de Freenzy permet meme aux administrateurs de gerer la plateforme directement depuis WhatsApp : valider des propositions d'agents, consulter les statistiques ou lancer des actions. C'est la puissance de l'API en action ! \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'aw-m5-l3',
          title: 'Quiz : WhatsApp Business API',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur WhatsApp Business API, les templates et les regles.',
          quizQuestions: [
            {
              question: 'Combien coute une conversation de service sur WhatsApp Cloud API (1000 premieres/mois) ?',
              options: ['0,10 EUR par message', '1 EUR par conversation', 'C\'est gratuit', '0,50 EUR par jour'],
              correctIndex: 2,
              explanation: 'Les 1000 premieres conversations de service par mois sont gratuites sur WhatsApp Cloud API. Au-dela, le cout varie par pays.',
            },
            {
              question: 'Quand devez-vous utiliser un template pour envoyer un message WhatsApp ?',
              options: [
                'Toujours, meme pour repondre a un client',
                'Uniquement pour les messages inities par l\'entreprise hors fenetre de 24h',
                'Jamais, les templates sont optionnels',
                'Uniquement le week-end',
              ],
              correctIndex: 1,
              explanation: 'Les templates sont requis pour les messages inities par l\'entreprise en dehors de la fenetre de 24h apres le dernier message du client.',
            },
            {
              question: 'Quelle est la condition prealable pour envoyer des messages WhatsApp a un client ?',
              options: [
                'Avoir son numero de telephone suffit',
                'Le client doit avoir donne son consentement (opt-in)',
                'Il faut etre ami avec le client sur Facebook',
                'Il faut payer une licence par contact',
              ],
              correctIndex: 1,
              explanation: 'L\'opt-in est obligatoire : le client doit avoir consenti a recevoir des messages de votre entreprise avant tout envoi.',
            },
            {
              question: 'Combien de categories de templates WhatsApp existe-t-il ?',
              options: ['2', '3', '4', '6'],
              correctIndex: 2,
              explanation: 'Il existe 4 categories : Marketing, Utilitaire, Authentification et Service.',
            },
            {
              question: 'Quel element augmente significativement le taux de clic dans un template WhatsApp ?',
              options: [
                'Ecrire en majuscules',
                'Ajouter des emojis partout',
                'Inclure des boutons interactifs (CTA)',
                'Envoyer le message a 8h du matin',
              ],
              correctIndex: 2,
              explanation: 'Les boutons interactifs (Confirmer, Voir details, etc.) ont un taux de clic tres superieur aux simples liens texte dans les messages WhatsApp.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4AC}',
      badgeName: 'WhatsApp Pro',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Integrations Email et CRM
    // -----------------------------------------------------------------------
    {
      id: 'aw-m6',
      title: 'Integrations Email et CRM',
      emoji: '\u{1F4E7}',
      description: 'Connecter un service d\'email transactionnel et un CRM via API pour automatiser la relation client.',
      duration: '55 min',
      lessons: [
        {
          id: 'aw-m6-l1',
          title: 'Emails transactionnels vs marketing',
          duration: '9 min',
          type: 'text',
          content: `L'email reste le canal de communication numero 1 en entreprise. Mais saviez-vous qu'il existe deux types d'emails completement differents d'un point de vue technique ? Comprendre cette distinction est essentiel avant de brancher une API email. \u{1F4E8}

Les emails transactionnels sont declenches par une action de l'utilisateur. Quand quelqu'un s'inscrit sur votre site, il recoit un email de bienvenue. Quand il passe commande, il recoit une confirmation. Quand il reinitialise son mot de passe, il recoit un lien. Ces emails sont envoyes un par un, en temps reel, et ont un taux d'ouverture de 80-90% car le destinataire les attend. \u{2705}

Les emails marketing sont envoyes en masse a une liste de contacts : newsletter hebdomadaire, promotion du Black Friday, annonce de nouveau produit. Ils sont planifies a l'avance et ont un taux d'ouverture moyen de 20-25%. Ces emails sont soumis a des reglementations strictes (RGPD en Europe, CAN-SPAM aux USA) et doivent toujours inclure un lien de desinscription.

Pourquoi cette distinction est-elle importante pour les API ? Parce que les services ne sont pas les memes. Pour les emails transactionnels, on utilise des services comme SendGrid, Mailgun, Amazon SES ou Postmark. Ils sont optimises pour la delivrabilite instantanee et les gros volumes unitaires. Pour les emails marketing, on utilise Mailchimp, Brevo (ex-Sendinblue), ConvertKit ou ActiveCampaign. Ils offrent des editeurs visuels, de la segmentation et des analytics.

L'API d'un service email transactionnel est generalement simple. Voici le principe avec SendGrid :

Vous envoyez un POST a https://api.sendgrid.com/v3/mail/send avec votre token d'API dans le header et un JSON contenant l'expediteur, le destinataire, le sujet et le contenu HTML. La reponse vous confirme l'acceptation du message ou signale une erreur.

Chez Freenzy, les emails sont utilises a plusieurs niveaux : email de bienvenue personnalise selon le profil utilisateur (11 variantes !), sequence automatique J+0/J+2/J+5 pour l'onboarding, et notifications transactionnelles pour les evenements importants (paiement, invitation equipe, alerte securite). \u{1F4EC}

Un piege courant : ne melangez JAMAIS vos emails transactionnels et marketing sur le meme domaine d'envoi. Si vos emails marketing sont marques comme spam (ca arrive), ca affectera la delivrabilite de vos emails transactionnels. Utilisez des sous-domaines separes : mail.monsite.com pour le transactionnel, news.monsite.com pour le marketing.`,
          xpReward: 15,
        },
        {
          id: 'aw-m6-l2',
          title: 'Connecter un CRM via API',
          duration: '9 min',
          type: 'text',
          content: `Un CRM (Customer Relationship Management) est l'outil central pour gerer vos contacts, vos prospects et vos clients. Le connecter a vos autres outils via API transforme votre workflow en machine automatisee. \u{1F3AF}

Les CRM les plus populaires avec des API robustes sont HubSpot (gratuit pour les fonctions de base), Pipedrive (oriente vente), Salesforce (pour les grandes entreprises) et Notion (utilise comme CRM leger par beaucoup de startups). Chacun offre une API REST avec documentation complete.

Prenons HubSpot comme exemple concret. L'API HubSpot permet de :
- Creer un contact : POST /crm/v3/objects/contacts avec les proprietes {email, firstname, lastname, phone}
- Lire un contact : GET /crm/v3/objects/contacts/{id}
- Mettre a jour un contact : PATCH /crm/v3/objects/contacts/{id}
- Creer un deal (opportunite) : POST /crm/v3/objects/deals
- Associer un contact a un deal : PUT /crm/v3/objects/contacts/{id}/associations/deals/{dealId}

L'authentification se fait par token OAuth2 ou cle API privee dans le header "Authorization: Bearer {token}". Le concept est identique a ce qu'on a vu avec Telegram et les webhooks.

Voici un scenario d'integration concret qui combine tout ce qu'on a appris :

1. Un prospect remplit un formulaire sur votre site (webhook declenche)
2. Zapier/Make recoit le webhook et cree le contact dans HubSpot via API \u{1F4CB}
3. HubSpot declenche un workflow qui envoie un email de bienvenue via SendGrid
4. Le prospect repond a l'email → le CRM met a jour le statut du contact
5. Votre bot WhatsApp envoie une notification a l'equipe commerciale
6. Le commercial contacte le prospect et enregistre le resultat dans le CRM

Tout ce pipeline fonctionne automatiquement, 24h/24, sans intervention manuelle. C'est la puissance des API combinees avec les webhooks et le no-code ! \u{1F525}

Les bonnes pratiques pour une integration CRM reussie :

Definissez vos "proprietes" (champs) CRM avant de commencer. Quelles informations voulez-vous stocker ? Source du lead, date de premier contact, secteur d'activite, score de qualification ? Plus votre structure est claire des le depart, plus vos automatisations seront efficaces.

Synchronisez dans les deux sens. Ne vous contentez pas de pousser des donnees VERS le CRM. Configurez aussi des webhooks DEPUIS le CRM pour que vos autres outils soient informes des changements (nouveau deal, changement de statut, tache assignee).

Gerez les doublons. Avant de creer un contact, verifiez toujours s'il existe deja (recherche par email). Sinon vous aurez des fiches en double et des donnees incoherentes. La plupart des API CRM offrent un endpoint de recherche : GET /contacts?email=test@exemple.fr. \u{26A0}\u{FE0F}`,
          xpReward: 15,
        },
        {
          id: 'aw-m6-l3',
          title: 'Quiz : Email et CRM',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur les integrations email et CRM pour conclure ce parcours.',
          quizQuestions: [
            {
              question: 'Quel est le taux d\'ouverture moyen d\'un email transactionnel ?',
              options: ['20-25%', '40-50%', '60-70%', '80-90%'],
              correctIndex: 3,
              explanation: 'Les emails transactionnels ont un taux d\'ouverture de 80-90% car ils sont attendus par le destinataire (confirmation, mot de passe, etc.).',
            },
            {
              question: 'Pourquoi ne faut-il pas melanger emails transactionnels et marketing sur le meme domaine ?',
              options: [
                'C\'est interdit par la loi',
                'Les emails marketing marques comme spam affecteraient la delivrabilite des transactionnels',
                'Les APIs ne le permettent pas techniquement',
                'Ca couterait trop cher',
              ],
              correctIndex: 1,
              explanation: 'Si vos emails marketing sont signales comme spam, la reputation de votre domaine baisse et vos emails transactionnels risquent aussi d\'atterrir en spam.',
            },
            {
              question: 'Quel verbe HTTP utilise-t-on pour creer un contact dans un CRM via API ?',
              options: ['GET', 'POST', 'DELETE', 'PATCH'],
              correctIndex: 1,
              explanation: 'POST est le verbe HTTP standard pour creer une nouvelle ressource (un contact, un deal, etc.) dans une API REST.',
            },
            {
              question: 'Quelle etape est essentielle avant de creer un contact dans le CRM ?',
              options: [
                'Envoyer un email au contact',
                'Verifier s\'il existe deja (anti-doublon)',
                'Demander l\'autorisation a l\'administrateur',
                'Attendre 24 heures',
              ],
              correctIndex: 1,
              explanation: 'Toujours verifier l\'existence d\'un contact (par email) avant d\'en creer un nouveau pour eviter les doublons et les incoherences de donnees.',
            },
            {
              question: 'Quel CRM propose un plan gratuit avec API incluse ?',
              options: ['Salesforce', 'HubSpot', 'Pipedrive', 'Aucun, les CRM sont tous payants'],
              correctIndex: 1,
              explanation: 'HubSpot propose un plan gratuit genereux qui inclut l\'acces a l\'API CRM, ce qui en fait un excellent choix pour debuter.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4E7}',
      badgeName: 'Integration Master',
    },
  ],
};

// ---------------------------------------------------------------------------
// PARCOURS 2 — Business Plan avec l'IA
// ---------------------------------------------------------------------------

export const parcoursBusinessPlan: FormationParcours = {
  id: 'business-plan-niv1',
  title: 'Business Plan avec l\'IA',
  emoji: '\u{1F4BC}',
  description: 'Construisez un business plan solide de A a Z : etude de marche, business model, pricing, finances, pitch deck et strategie go-to-market, assiste par l\'IA.',
  category: 'business',
  subcategory: 'strategie',
  level: 'debutant',
  levelLabel: 'Debutant',
  color: '#059669',
  totalDuration: '6h',
  totalXP: 600,
  diplomaTitle: 'Business Strategist',
  diplomaSubtitle: 'Vous savez construire un business plan complet avec l\'aide de l\'IA',
  available: true,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Etude de marche IA
    // -----------------------------------------------------------------------
    {
      id: 'bp-m1',
      title: 'Etude de marche assistee par l\'IA',
      emoji: '\u{1F50D}',
      description: 'Utiliser l\'IA pour analyser un marche, identifier les tendances et comprendre la concurrence.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m1-l1',
          title: 'Analyser un marche avec l\'IA',
          duration: '9 min',
          type: 'text',
          content: `Bienvenue dans ce parcours qui va transformer votre idee en projet structure ! \u{1F680} On commence par l'etape la plus importante et souvent la plus negligee : l'etude de marche. Bonne nouvelle, l'IA va vous faire gagner un temps considerable.

Une etude de marche repond a quatre questions fondamentales : Quel est le probleme que vous resolvez ? Qui a ce probleme (votre cible) ? Comment le resolvez-vous mieux que les alternatives existantes ? Combien les gens sont-ils prets a payer pour votre solution ?

Traditionnellement, une etude de marche prend des semaines et coute des milliers d'euros en cabinet de conseil. Avec l'IA, vous pouvez obtenir une premiere analyse solide en quelques heures. Voici comment. \u{1F4A1}

Etape 1 — Definir votre marche. Demandez a l'IA : "Analyse le marche de [votre secteur] en France en 2026. Donne-moi la taille du marche en euros, le taux de croissance annuel, les principaux acteurs, les tendances emergentes et les segments les plus porteurs." L'IA va synthetiser des donnees provenant de multiples sources pour vous donner une vue d'ensemble structuree.

Etape 2 — Identifier votre persona. Demandez : "Cree un persona detaille pour un utilisateur type de [votre produit]. Inclus les donnees demographiques, les frustrations quotidiennes, les objectifs, le parcours d'achat typique et les criteres de decision." L'IA genere un portrait-robot base sur les patterns de marche connus. \u{1F464}

Etape 3 — Cartographier la concurrence. Demandez : "Liste les 10 principaux concurrents de [votre produit] avec pour chacun : positionnement, prix, forces, faiblesses et part de marche estimee. Presente le resultat sous forme de tableau comparatif." C'est un travail qui prendrait des jours manuellement.

Attention cependant : l'IA est un outil d'analyse, pas un oracle. Les donnees chiffrees qu'elle fournit sont des estimations basees sur des tendances generales, pas des statistiques officielles. Utilisez-les comme point de depart, puis validez les chiffres cles avec des sources officielles (INSEE, Statista, rapports sectoriels).

L'IA excelle pour une tache souvent negligee : l'analyse des tendances emergentes. Demandez-lui d'identifier les signaux faibles dans votre secteur — les nouvelles technologies, les changements reglementaires, les evolutions sociologiques qui pourraient impacter votre marche dans les 2 a 5 prochaines annees. Cette vision prospective est un atout majeur dans un business plan. \u{1F52E}

Conseil : documentez chaque prompt et chaque reponse. Vous constituerez ainsi une base de connaissances sur votre marche que vous pourrez enrichir progressivement.`,
          xpReward: 15,
        },
        {
          id: 'bp-m1-l2',
          title: 'Valider son idee avec des donnees',
          duration: '9 min',
          type: 'text',
          content: `Avoir une bonne idee, c'est bien. Avoir des donnees qui prouvent que les gens veulent payer pour cette idee, c'est mieux. \u{1F4CA} Cette lecon vous apprend a valider votre concept avant d'investir du temps et de l'argent.

La validation de marche repose sur un principe simple : confronter votre hypothese a la realite le plus tot possible. Trop d'entrepreneurs passent des mois a developper un produit que personne ne veut. C'est ce qu'on appelle le "build trap" — construire quelque chose sans s'assurer qu'il existe une demande.

Methode 1 — L'analyse de la demande en ligne. Utilisez Google Trends pour verifier que les gens cherchent des solutions a votre probleme. Demandez a l'IA : "Analyse les tendances Google pour [mots-cles de votre secteur] sur les 5 dernieres annees. La demande est-elle en croissance, stable ou en declin ?" Completez avec Ubersuggest ou AnswerThePublic pour decouvrir les questions que les gens posent autour de votre thematique. \u{1F4C8}

Methode 2 — L'analyse des avis concurrents. C'est une mine d'or souvent ignoree. Recuperez les avis clients de vos concurrents (Google, Trustpilot, App Store) et demandez a l'IA : "Analyse ces 50 avis et identifie les 5 frustrations les plus recurrentes, les fonctionnalites les plus appreciees et les besoins non satisfaits." Les lacunes de vos concurrents sont vos opportunites.

Methode 3 — Le sondage rapide. Creez un questionnaire de 5-7 questions maximum avec Google Forms ou Typeform. Demandez a l'IA de vous aider a formuler des questions non orientees. Diffusez-le aupres de 30 a 50 personnes de votre cible. L'objectif n'est pas la representativite statistique mais la detection de patterns : si 80% des repondants mentionnent la meme frustration, c'est un signal fort. \u{1F4DD}

Methode 4 — Le test de la landing page. Creez une page simple presentant votre produit (meme s'il n'existe pas encore) avec un bouton "M'inscrire" ou "Commander". Envoyez du trafic dessus (reseaux sociaux, publicite a petit budget). Le taux de conversion vous dira si votre proposition de valeur attire. Un taux superieur a 5% sur une landing page froide est un excellent signal.

L'IA peut vous assister a chaque etape : rediger le sondage, analyser les reponses, creer le texte de la landing page, interpreter les metriques. C'est votre copilote strategique.

Le critere ultime de validation ? Les gens sortent-ils leur carte bancaire ? Un "j'adore ton idee !" de la part de 100 personnes vaut moins qu'un seul pre-paiement. Si possible, proposez une pre-vente ou un crowdfunding pour valider la demande avec de l'argent reel. C'est le test de verite absolu. \u{1F4B3}`,
          xpReward: 15,
        },
        {
          id: 'bp-m1-l3',
          title: 'Quiz : Etude de marche',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos acquis sur l\'etude de marche et la validation d\'idee assistees par l\'IA.',
          quizQuestions: [
            {
              question: 'Quelles sont les 4 questions fondamentales d\'une etude de marche ?',
              options: [
                'Qui, Quoi, Ou, Quand',
                'Probleme, Cible, Avantage concurrentiel, Willingness to pay',
                'Produit, Prix, Place, Promotion',
                'Forces, Faiblesses, Opportunites, Menaces',
              ],
              correctIndex: 1,
              explanation: 'Une etude de marche doit repondre a : Quel probleme ? Qui a ce probleme ? Comment le resoudre mieux ? Combien les gens paieront-ils ?',
            },
            {
              question: 'Quel est le "build trap" ?',
              options: [
                'Un bug informatique courant',
                'Construire un produit sans verifier qu\'il existe une demande',
                'Un piege fiscal pour les startups',
                'Un outil de gestion de projet',
              ],
              correctIndex: 1,
              explanation: 'Le "build trap" consiste a passer des mois a developper un produit sans s\'assurer que les gens en veulent et sont prets a payer.',
            },
            {
              question: 'Quel taux de conversion sur une landing page froide est considere comme un bon signal ?',
              options: ['0,1%', '1%', 'Plus de 5%', 'Plus de 50%'],
              correctIndex: 2,
              explanation: 'Un taux de conversion superieur a 5% sur une landing page avec du trafic froid (inconnu) est un excellent indicateur d\'interet pour votre produit.',
            },
            {
              question: 'Quel est le test ultime de validation d\'une idee business ?',
              options: [
                'Les likes sur les reseaux sociaux',
                'L\'avis de votre famille',
                'Les pre-paiements ou pre-commandes',
                'Le nombre de visites sur votre site',
              ],
              correctIndex: 2,
              explanation: 'Le test ultime est l\'argent reel. Un pre-paiement prouve que les gens veulent votre produit assez pour sortir leur carte bancaire.',
            },
            {
              question: 'Pourquoi analyser les avis clients des concurrents est-il utile ?',
              options: [
                'Pour copier leurs produits',
                'Pour identifier les frustrations non resolues qui sont vos opportunites',
                'Pour savoir combien ils gagnent',
                'Pour les contacter et proposer un partenariat',
              ],
              correctIndex: 1,
              explanation: 'Les avis negatifs des concurrents revelent les besoins non satisfaits du marche — ce sont vos opportunites de differenciation.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F50D}',
      badgeName: 'Market Analyst',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Business Model Canvas
    // -----------------------------------------------------------------------
    {
      id: 'bp-m2',
      title: 'Business Model Canvas',
      emoji: '\u{1F5FA}\u{FE0F}',
      description: 'Structurer votre modele economique sur une seule page avec le framework Business Model Canvas.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m2-l1',
          title: 'Les 9 blocs du Canvas',
          duration: '9 min',
          type: 'text',
          content: `Le Business Model Canvas (BMC) est l'outil de reference pour decrire un modele economique sur une seule page. Cree par Alexander Osterwalder, il decoupe votre business en 9 blocs interconnectes. C'est comme une carte de votre entreprise vue d'avion. \u{1F5FA}\u{FE0F}

Bloc 1 — Segments de clients : A qui vendez-vous ? Definissez vos personas avec precision. Un meme produit peut s'adresser a plusieurs segments (freelances, PME, grandes entreprises) avec des besoins differents. L'IA peut vous aider a affiner vos segments en analysant les donnees demographiques et comportementales.

Bloc 2 — Proposition de valeur : Quel probleme resolvez-vous et pourquoi votre solution est-elle meilleure ? C'est le coeur de votre Canvas. Formulez-la en une phrase : "Nous aidons [cible] a [benefice] grace a [votre solution unique]." Chez Freenzy par exemple : "Nous aidons les entrepreneurs a automatiser leur entreprise grace a une equipe d'agents IA disponible 24/7." \u{1F4A1}

Bloc 3 — Canaux de distribution : Comment vos clients decouvrent-ils et achetent-ils votre produit ? Site web, reseaux sociaux, marketplace, bouche-a-oreille, partenariats ? Listez chaque point de contact, du premier clic a l'achat.

Bloc 4 — Relations clients : Quel type de relation entretenez-vous ? Self-service (l'utilisateur se debrouille seul), assistance personnalisee, communaute, co-creation ? La plupart des SaaS combinent self-service + support par chat + communaute.

Bloc 5 — Sources de revenus : Comment gagnez-vous de l'argent ? Abonnement mensuel, freemium, commission, vente unique, licence, publicite ? Preciser le modele ET les montants.

Bloc 6 — Ressources cles : De quoi avez-vous absolument besoin pour fonctionner ? Technologie (serveurs, API, code), humaines (developpeurs, commerciaux), financieres (tresorerie), intellectuelles (brevets, marque).

Bloc 7 — Activites cles : Quelles sont les actions essentielles que vous devez realiser ? Developpement produit, acquisition clients, support, operations techniques. Concentrez-vous sur les 3-4 activites vraiment critiques. \u{1F3AF}

Bloc 8 — Partenaires cles : Avec qui collaborez-vous ? Fournisseurs technologiques (AWS, Anthropic, Stripe), partenaires de distribution, prestataires specialises. Identifiez les dependances critiques.

Bloc 9 — Structure de couts : Quels sont vos principaux postes de depenses ? Couts fixes (serveurs, salaires, loyers) vs couts variables (API, marketing, commissions). Identifiez les 3 premiers postes pour savoir ou agir en priorite.

L'IA est un allie formidable pour remplir votre Canvas. Demandez-lui : "Pour un [type de business], remplis les 9 blocs du Business Model Canvas avec des exemples concrets." Puis affinez chaque bloc en profondeur. Le Canvas n'est pas un document statique — revisitez-le chaque trimestre. \u{1F504}`,
          xpReward: 15,
        },
        {
          id: 'bp-m2-l2',
          title: 'Exercice : Remplir son Canvas avec l\'IA',
          duration: '10 min',
          type: 'exercise',
          content: 'Utilisez un assistant IA Freenzy pour remplir les 9 blocs de votre Business Model Canvas.',
          exercisePrompt: 'Ouvrez une conversation avec l\'assistant fz-commercial ou fz-dg. Decrivez votre idee de business en 2-3 phrases, puis demandez-lui de remplir les 9 blocs du Business Model Canvas avec des recommandations concretes et chiffrees. Evaluez les suggestions : quelles sont les plus pertinentes ? Quelles necesitent d\'etre ajustees a votre contexte specifique ?',
          xpReward: 30,
        },
        {
          id: 'bp-m2-l3',
          title: 'Quiz : Business Model Canvas',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez que vous maitrisez les 9 blocs du Business Model Canvas.',
          quizQuestions: [
            {
              question: 'Combien de blocs compose le Business Model Canvas ?',
              options: ['5', '7', '9', '12'],
              correctIndex: 2,
              explanation: 'Le Business Model Canvas d\'Alexander Osterwalder comporte 9 blocs interconnectes qui decrivent l\'ensemble du modele economique.',
            },
            {
              question: 'Quel bloc est considere comme le coeur du Canvas ?',
              options: ['Segments de clients', 'Proposition de valeur', 'Sources de revenus', 'Canaux de distribution'],
              correctIndex: 1,
              explanation: 'La Proposition de valeur est le coeur du Canvas : elle explique pourquoi les clients choisissent votre solution plutot qu\'une autre.',
            },
            {
              question: 'Quelle est la difference entre couts fixes et couts variables ?',
              options: [
                'Les couts fixes sont plus chers',
                'Les couts fixes ne changent pas avec le volume, les variables oui',
                'Les couts variables sont les salaires',
                'Il n\'y a pas de difference',
              ],
              correctIndex: 1,
              explanation: 'Les couts fixes (loyer, salaires) restent constants quel que soit le volume d\'activite. Les couts variables (API, commissions) evoluent proportionnellement.',
            },
            {
              question: 'A quelle frequence faut-il revisiter son Business Model Canvas ?',
              options: ['Jamais, une fois suffit', 'Chaque trimestre', 'Tous les 5 ans', 'Chaque jour'],
              correctIndex: 1,
              explanation: 'Le Canvas est un outil vivant qui doit etre revisite regulierement, idealement chaque trimestre, pour s\'adapter aux evolutions du marche.',
            },
            {
              question: 'Qui a cree le framework Business Model Canvas ?',
              options: ['Eric Ries', 'Steve Jobs', 'Alexander Osterwalder', 'Peter Thiel'],
              correctIndex: 2,
              explanation: 'Le Business Model Canvas a ete cree par Alexander Osterwalder et Yves Pigneur, presente dans le livre "Business Model Generation" (2010).',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 65,
      badgeEmoji: '\u{1F5FA}\u{FE0F}',
      badgeName: 'Canvas Architect',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Strategie de Pricing
    // -----------------------------------------------------------------------
    {
      id: 'bp-m3',
      title: 'Strategie de Pricing',
      emoji: '\u{1F4B0}',
      description: 'Definir le bon prix pour votre produit ou service en utilisant differentes strategies de tarification.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m3-l1',
          title: 'Les modeles de pricing',
          duration: '9 min',
          type: 'text',
          content: `Le prix est le levier le plus puissant de votre business. Une augmentation de prix de 1% a souvent plus d'impact sur les profits qu'une augmentation de 1% des ventes. Pourtant, beaucoup d'entrepreneurs choisissent leur prix "au feeling". On va faire mieux que ca ! \u{1F4B0}

Il existe plusieurs modeles de pricing, chacun adapte a des situations differentes :

Le prix au cout + marge : Vous calculez votre cout de revient et ajoutez une marge. Si votre produit vous coute 10 euros a produire, vous le vendez 15 euros (marge de 50%). C'est simple et securisant, mais ca ignore completement ce que le client est pret a payer. Si votre produit vaut 50 euros aux yeux du client, vous laissez 35 euros sur la table. \u{274C}

Le prix base sur la valeur : Vous fixez le prix selon la valeur percue par le client, pas selon vos couts. Si votre logiciel fait gagner 1000 euros par mois a un client, le vendre 200 euros/mois est une evidence pour lui. C'est la methode la plus rentable mais elle demande une bonne connaissance de votre cible. \u{2705}

Le freemium : Une version gratuite attirant les utilisateurs + une version payante avec des fonctionnalites avancees. Freenzy utilise ce modele : 50 credits offerts a l'inscription, 0% commission pour les 5000 premiers utilisateurs. Le defi est de trouver le bon curseur entre gratuit (assez pour convaincre) et payant (assez pour justifier l'abonnement).

L'abonnement (SaaS) : Paiement recurrent mensuel ou annuel. L'avantage est la previsibilite des revenus. Le defi est le "churn" (taux de desabonnement). Un SaaS sain vise un churn mensuel inferieur a 5%. \u{1F4C9}

Le prix par paliers (tiered pricing) : Plusieurs offres a des prix differents. Typiquement : Starter (19 euros/mois), Pro (49 euros/mois), Enterprise (sur devis). La regle des 3 offres est puissante : la majorite des clients choisissent l'offre du milieu.

La commission : Vous prenez un pourcentage sur chaque transaction. Stripe prend 1,4% + 0,25 euros par paiement. C'est tres aligne avec le succes du client car vous ne gagnez que quand il gagne.

Le pay-per-use : L'utilisateur paie uniquement ce qu'il consomme. C'est le modele des credits Freenzy : chaque action IA a un cout en credits. Le client ne paie jamais pour ce qu'il n'utilise pas.

Comment choisir ? Demandez a l'IA : "Pour un [type de business] ciblant [persona], quel modele de pricing recommandes-tu ? Compare les avantages et risques de chaque option." L'IA vous aidera a evaluer chaque modele dans votre contexte specifique. \u{1F914}`,
          xpReward: 15,
        },
        {
          id: 'bp-m3-l2',
          title: 'Fixer son prix : methode pas a pas',
          duration: '9 min',
          type: 'text',
          content: `Maintenant qu'on connait les modeles, passons a la methode concrete pour fixer VOTRE prix. Suivez ces 6 etapes et vous aurez un prix defensible et optimise. \u{1F3AF}

Etape 1 — Calculez votre cout de revient plancher. Listez TOUS vos couts pour servir un client : hebergement, API, support, infrastructure, marketing d'acquisition. Divisez par le nombre de clients attendus. C'est votre prix plancher absolu — en dessous, vous perdez de l'argent a chaque client. Pour un SaaS, visez une marge brute de 70-80%.

Etape 2 — Analysez les prix des concurrents. Faites un tableau avec les 5-10 concurrents principaux : leur prix, ce qui est inclus, les limitations. Demandez a l'IA de vous aider : "Analyse les grilles tarifaires de [concurrent 1, 2, 3] et identifie les points communs, les anomalies et les opportunites de positionnement." \u{1F4CA}

Etape 3 — Estimez la valeur percue. Combien votre solution fait-elle gagner ou economiser au client ? Si votre outil remplace un employe a 3000 euros/mois, le vendre 300 euros/mois est un deal evident (ROI de 10x). La regle d'or : votre prix doit representer 1/10eme de la valeur creee.

Etape 4 — Segmentez vos offres. Creez 3 paliers clairement differencies :
- Starter : pour les individus ou tres petites equipes, prix d'appel attractif
- Pro : pour les PME, meilleur rapport qualite-prix (c'est celui que vous VOULEZ vendre)
- Enterprise : pour les grandes structures, prix premium avec services dedies

L'astuce psychologique : l'offre Pro doit sembler etre un "deal" compare a l'Enterprise, et l'offre Starter doit paraitre limitee pour inciter l'upgrade. \u{1F9E0}

Etape 5 — Testez avec des vrais clients. Montrez vos 3 offres a 20 prospects et observez leurs reactions. Le "Van Westendorp Price Sensitivity Meter" pose 4 questions : A quel prix c'est trop cher ? Trop bon marche (suspect) ? Cher mais acceptable ? Une bonne affaire ? L'intersection des courbes donne votre prix optimal.

Etape 6 — Iterez rapidement. Votre premier prix ne sera pas parfait. Testez pendant 30 jours, mesurez le taux de conversion et le churn, puis ajustez. Le A/B testing de prix est delicat (deux clients ne doivent pas voir des prix differents) mais vous pouvez tester sequentiellement : prix A pendant 2 semaines, prix B pendant 2 semaines.

Une erreur classique : sous-evaluer son prix par peur de ne pas vendre. Les entrepreneurs debutants fixent presque toujours un prix trop bas. Si personne ne dit jamais "c'est trop cher", votre prix est probablement trop bas. Visez un taux de refus de 20-30% sur le prix — c'est signe que vous etes dans la bonne zone. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'bp-m3-l3',
          title: 'Quiz : Pricing',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les strategies de pricing et la fixation de prix.',
          quizQuestions: [
            {
              question: 'Quel est le modele de pricing le plus rentable en general ?',
              options: ['Prix au cout + marge', 'Prix base sur la valeur percue', 'Prix le plus bas du marche', 'Prix identique aux concurrents'],
              correctIndex: 1,
              explanation: 'Le prix base sur la valeur percue est le plus rentable car il capture la valeur reelle que le client accorde a votre solution, souvent bien superieure au cout de revient.',
            },
            {
              question: 'Quelle marge brute doit viser un SaaS ?',
              options: ['20-30%', '40-50%', '70-80%', '95-100%'],
              correctIndex: 2,
              explanation: 'Un SaaS sain vise une marge brute de 70-80%. Les couts variables (serveurs, API) doivent rester faibles par rapport au prix de vente.',
            },
            {
              question: 'Pourquoi la "regle des 3 offres" fonctionne-t-elle ?',
              options: [
                'Parce que 3 est un chiffre magique',
                'La majorite des clients choisissent l\'offre du milieu, qui est celle que vous voulez vendre',
                'Parce qu\'il y a 3 types de clients',
                'Pour simplifier la facturation',
              ],
              correctIndex: 1,
              explanation: 'L\'effet d\'ancrage pousse la majorite des clients vers l\'offre du milieu : le Starter semble trop limite, l\'Enterprise trop cher, le Pro semble etre le meilleur rapport qualite-prix.',
            },
            {
              question: 'Quel ratio prix/valeur creee est recommande ?',
              options: ['Le prix doit egal la valeur', '1/3 de la valeur', '1/10 de la valeur', '2x la valeur'],
              correctIndex: 2,
              explanation: 'La regle d\'or est que votre prix doit representer environ 1/10eme de la valeur creee pour le client, offrant un ROI de 10x irresistible.',
            },
            {
              question: 'Quel taux de refus sur le prix indique que vous etes dans la bonne zone ?',
              options: ['0% — personne ne refuse', '5-10%', '20-30%', '50% ou plus'],
              correctIndex: 2,
              explanation: 'Un taux de refus de 20-30% est signe d\'un prix bien calibre. Si personne ne refuse, votre prix est probablement trop bas.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4B0}',
      badgeName: 'Pricing Strategist',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Projections financieres
    // -----------------------------------------------------------------------
    {
      id: 'bp-m4',
      title: 'Projections financieres',
      emoji: '\u{1F4C8}',
      description: 'Construire des projections financieres realistes sur 3 ans avec l\'aide de l\'IA.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m4-l1',
          title: 'Les 3 tableaux financiers essentiels',
          duration: '9 min',
          type: 'text',
          content: `Les projections financieres, ca fait peur a beaucoup d'entrepreneurs. "Je ne suis pas comptable !" Rassurez-vous : vous n'avez pas besoin de l'etre. Il vous faut comprendre 3 tableaux et l'IA peut vous aider a les remplir. \u{1F4CA}

Tableau 1 — Le compte de resultat previsionnel. C'est le tableau le plus important. Il repond a la question : "Mon business sera-t-il rentable ?" En haut, vos revenus (chiffre d'affaires). En bas, vos depenses. La difference, c'est votre resultat net (benefice ou perte).

Structure type pour un SaaS :
- Revenus : nombre de clients x prix moyen mensuel x 12 mois
- Cout des ventes (COGS) : serveurs, API, support technique
- Marge brute = Revenus - COGS (viser 70-80%)
- Depenses operationnelles : salaires, marketing, loyer, outils
- Resultat operationnel = Marge brute - Depenses operationnelles
- Resultat net = Resultat operationnel - impots

Tableau 2 — Le plan de tresorerie (cash flow). C'est le tableau de survie. Beaucoup d'entreprises rentables font faillite par manque de tresorerie. Le plan de tresorerie suit vos entrees et sorties d'argent REELLES mois par mois. Un client peut signer un contrat en janvier mais payer en mars — votre compte de resultat montre un revenu en janvier, mais votre tresorerie ne le voit qu'en mars. \u{26A0}\u{FE0F}

La regle d'or : ayez toujours 3 a 6 mois de depenses en tresorerie d'avance. C'est votre filet de securite. Si vos depenses mensuelles sont de 5000 euros, gardez 15 000 a 30 000 euros en reserve.

Tableau 3 — Le bilan previsionnel. C'est une photo de votre patrimoine a un instant T. D'un cote, vos actifs (ce que vous possedez : cash, materiel, creances clients). De l'autre, vos passifs (ce que vous devez : emprunts, dettes fournisseurs, capital social). Les actifs doivent toujours etre egaux aux passifs — c'est la regle fondamentale de la comptabilite.

Pour les startups early-stage, le compte de resultat et le plan de tresorerie sont les plus critiques. Le bilan devient important quand vous cherchez des financements ou des investisseurs.

Demandez a l'IA : "Cree un compte de resultat previsionnel sur 3 ans pour un SaaS B2B avec un prix moyen de [X] euros/mois, un cout d'acquisition client de [Y] euros, et une croissance mensuelle de [Z]%." L'IA vous generera un tableau structure que vous pourrez ensuite ajuster et affiner. \u{1F4BB}

Un conseil crucial : faites TOUJOURS 3 scenarios. Le scenario optimiste (tout se passe bien), le scenario realiste (base case) et le scenario pessimiste (les choses prennent du retard). Un investisseur qui voit 3 scenarios vous trouvera credible. Un entrepreneur qui ne presente que le scenario rose vous semblera naif.`,
          xpReward: 15,
        },
        {
          id: 'bp-m4-l2',
          title: 'Les metriques cles a suivre',
          duration: '9 min',
          type: 'text',
          content: `Un business plan sans metriques, c'est comme conduire sans tableau de bord. Vous avancez, mais vous ne savez pas a quelle vitesse, combien de carburant il reste ni si le moteur surchauffe. \u{1F3CE}\u{FE0F} Voici les metriques essentielles a integrer dans vos projections financieres.

MRR (Monthly Recurring Revenue) : Le revenu recurrent mensuel. C'est LA metrique reine pour un SaaS. Si vous avez 100 clients a 49 euros/mois, votre MRR est de 4900 euros. L'ARR (Annual Recurring Revenue) c'est le MRR x 12 = 58 800 euros. Les investisseurs regardent la CROISSANCE du MRR : +10% par mois est excellent, +5% est bon, -% est un probleme.

CAC (Customer Acquisition Cost) : Combien vous coutent l'acquisition d'un client. Prenez l'ensemble de vos depenses marketing et commerciales sur un mois, divisez par le nombre de nouveaux clients acquis ce mois-la. Si vous depensez 5000 euros en marketing et obtenez 50 clients, votre CAC est de 100 euros. \u{1F4B8}

LTV (Customer Lifetime Value) : La valeur totale qu'un client vous rapporte sur toute la duree de la relation. Formule simplifiee : LTV = prix mensuel x duree moyenne en mois. Si un client paie 49 euros/mois et reste en moyenne 18 mois, sa LTV est de 882 euros.

Le ratio LTV/CAC est critique. Il doit etre superieur a 3 pour un business viable. Si votre LTV est de 882 euros et votre CAC de 100 euros, votre ratio est de 8,8 — excellent ! En dessous de 3, vous depensez trop pour acquerir des clients qui ne rapportent pas assez. \u{2705}

Churn Rate : Le taux de desabonnement mensuel. Si vous commencez le mois avec 100 clients et en perdez 5, votre churn est de 5%. Un SaaS B2B sain vise un churn inferieur a 3%/mois (soit un churn annuel d'environ 30%). Le "negative churn" (les clients existants depensent plus que les clients perdus) est le Saint Graal.

Burn Rate : Combien vous depensez par mois. Si vos depenses mensuelles sont de 8000 euros et vos revenus de 3000 euros, votre burn rate net est de 5000 euros. Votre "runway" (piste d'atterrissage) est votre tresorerie divisee par le burn rate. 30 000 euros en banque / 5000 de burn = 6 mois de runway. \u{23F0}

Break-even : Le point de rentabilite. C'est le moment ou vos revenus couvrent vos depenses. Pour le calculer : couts fixes mensuels / (prix moyen - cout variable par client). Si vos couts fixes sont de 6000 euros/mois, votre prix de 49 euros et votre cout variable de 9 euros, il vous faut 6000 / 40 = 150 clients pour atteindre le break-even.

L'IA peut calculer toutes ces metriques a partir de vos hypotheses. Demandez-lui : "Avec un prix de [X] euros/mois, un CAC de [Y] euros, un churn de [Z]%/mois et des couts fixes de [W] euros/mois, calcule mon LTV, LTV/CAC, break-even et runway avec [K] euros de tresorerie." Vous obtiendrez un diagnostic financier complet en quelques secondes. \u{1F9EE}`,
          xpReward: 15,
        },
        {
          id: 'bp-m4-l3',
          title: 'Quiz : Finances',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les projections financieres et les metriques cles.',
          quizQuestions: [
            {
              question: 'Quel ratio LTV/CAC minimum indique un business viable ?',
              options: ['Superieur a 1', 'Superieur a 3', 'Superieur a 10', 'Superieur a 50'],
              correctIndex: 1,
              explanation: 'Un ratio LTV/CAC superieur a 3 est le minimum pour un business viable. En dessous, le cout d\'acquisition est trop eleve par rapport a la valeur client.',
            },
            {
              question: 'Que mesure le "burn rate" ?',
              options: [
                'La vitesse de croissance des ventes',
                'Le montant depense par mois au-dela des revenus',
                'Le taux de satisfaction client',
                'La performance des employes',
              ],
              correctIndex: 1,
              explanation: 'Le burn rate mesure combien l\'entreprise depense (brule) par mois au-dela de ses revenus. C\'est crucial pour calculer le runway (duree avant rupture de tresorerie).',
            },
            {
              question: 'Pourquoi faire 3 scenarios (optimiste, realiste, pessimiste) ?',
              options: [
                'Pour impressionner les banquiers',
                'Pour montrer que vous etes credible et prepare a differentes situations',
                'C\'est une obligation legale',
                'Pour choisir le plus beau graphique',
              ],
              correctIndex: 1,
              explanation: 'Les 3 scenarios montrent aux investisseurs que vous etes realiste et prepare. Un seul scenario optimiste est percu comme naif.',
            },
            {
              question: 'Quel tableau financier repond a la question "Mon business sera-t-il rentable ?"',
              options: ['Le bilan', 'Le plan de tresorerie', 'Le compte de resultat', 'Le budget marketing'],
              correctIndex: 2,
              explanation: 'Le compte de resultat previsionnel montre vos revenus moins vos depenses = votre resultat net (profit ou perte).',
            },
            {
              question: 'Quelle marge brute doit viser un SaaS ?',
              options: ['30-40%', '50-60%', '70-80%', '90-95%'],
              correctIndex: 2,
              explanation: 'Un SaaS doit viser 70-80% de marge brute. Les couts variables (serveurs, API) doivent rester faibles pour maximiser la rentabilite.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F4C8}',
      badgeName: 'Financial Planner',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Pitch Deck
    // -----------------------------------------------------------------------
    {
      id: 'bp-m5',
      title: 'Pitch Deck',
      emoji: '\u{1F3AC}',
      description: 'Construire un pitch deck percutant pour convaincre investisseurs, partenaires ou clients.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m5-l1',
          title: 'Les 12 slides essentielles',
          duration: '9 min',
          type: 'text',
          content: `Un pitch deck, c'est la presentation visuelle de votre business plan. C'est l'outil pour convaincre : investisseurs, partenaires, premiers clients, futurs employes. Un bon pitch deck raconte une histoire en 12 slides maximum. Ni plus, ni moins. \u{1F3AC}

Slide 1 — Couverture : Nom du projet, logo, tagline en une phrase, vos coordonnees. C'est la premiere impression — soignez le design. Pas de surcharge, du blanc, une typographie propre.

Slide 2 — Le probleme : Decrivez la douleur de votre cible en termes concrets et chiffres. "80% des PME francaises passent plus de 10h/semaine sur des taches administratives repetitives." Rendez le probleme visceral — l'auditoire doit hocher la tete en pensant "oui, c'est exactement ca."

Slide 3 — La solution : Votre produit en une phrase + une capture d'ecran ou mockup. "Freenzy automatise ces taches avec une equipe de 100+ agents IA disponible 24/7, pour 10x moins cher qu'un assistant humain." Soyez concret et visuel. \u{1F4A1}

Slide 4 — La demo / Comment ca marche : 3-4 etapes visuelles montrant le parcours utilisateur. Des screenshots, un schema ou une courte video. Le public doit comprendre en 30 secondes comment votre produit fonctionne.

Slide 5 — Le marche : Taille du marche (TAM, SAM, SOM). TAM = marche total adressable. SAM = segment que vous pouvez raisonnablement atteindre. SOM = votre objectif a court terme. Exemple : TAM = 50 milliards (IA enterprise monde), SAM = 2 milliards (PME francophones), SOM = 20 millions (5000 premiers clients). \u{1F30D}

Slide 6 — Le business model : Comment gagnez-vous de l'argent ? Prix, modele (freemium, SaaS, commission), LTV, CAC. Un tableau simple avec vos 3 offres suffit.

Slide 7 — La traction : C'est la slide la plus importante pour les investisseurs. Montrez ce que vous avez deja accompli : nombre d'utilisateurs, revenus, croissance mensuelle, NPS, partenariats signes. Meme petits, les chiffres reels impressionnent plus que les projections. \u{1F4C8}

Slide 8 — La concurrence : Un graphique en quadrant (matrice 2x2) positionnant vos concurrents sur 2 axes pertinents. Vous etes dans le coin superieur droit, evidemment. Montrez que vous connaissez le paysage et que votre positionnement est unique.

Slide 9 — L'avantage competitif : Pourquoi vous et pas un concurrent ? Technologie proprietaire, brevets, equipe unique, data moat, effets de reseau ? Soyez honnete et specifique.

Slide 10 — L'equipe : Photos, noms, titres et accomplissements cles. Les investisseurs investissent dans les gens autant que dans les idees.

Slide 11 — Les projections : Graphique de revenus sur 3 ans (3 scenarios). Montrez le break-even et la trajectoire de croissance.

Slide 12 — La demande : Combien levez-vous et pour quoi ? "Nous levons 500K euros pour recruter 3 developpeurs et atteindre 1000 clients en 12 mois." Soyez precis sur l'usage des fonds. \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'bp-m5-l2',
          title: 'Storytelling et delivery',
          duration: '9 min',
          type: 'text',
          content: `Un bon pitch deck avec une mauvaise presentation, c'est comme un restaurant 3 etoiles avec un serveur desagreable. Le contenu est crucial, mais la facon dont vous le presentez l'est tout autant. \u{1F399}\u{FE0F}

La structure narrative. Votre pitch doit raconter une histoire en 3 actes :

Acte 1 — Le conflit (slides 1-3) : "Il y a un enorme probleme qui touche des millions de personnes/entreprises. Les solutions actuelles ne fonctionnent pas. C'est frustrant, couteux et inacceptable." Creez de la tension. L'auditoire doit ressentir l'urgence du probleme avant de decouvrir votre solution.

Acte 2 — La solution et la preuve (slides 4-9) : "Nous avons cree quelque chose qui resout ce probleme de maniere elegante. Voici comment ca marche, voici le marche, voici nos resultats." C'est le moment de briller — montrez votre produit, vos chiffres, votre equipe. Chaque slide doit renforcer la credibilite.

Acte 3 — L'avenir (slides 10-12) : "Rejoignez-nous dans cette aventure. Voici ou nous allons, voici ce dont nous avons besoin pour y arriver." Terminez sur une note ambitieuse mais credible. \u{1F680}

Les regles de presentation orale :

La regle du 10-20-30 de Guy Kawasaki : 10 slides maximum pour le contenu cle, 20 minutes maximum de presentation, police minimum de 30 points (force la concision sur les slides).

Une idee par slide. Si vous avez besoin de plus de 20 mots sur une slide, c'est que vous en dites trop. Les slides sont un support visuel, pas un teleprompter. Le detail est dans votre discours oral, pas sur l'ecran. \u{1F4DD}

Commencez par un hook. Les 30 premieres secondes determinent l'attention pour le reste du pitch. "L'annee derniere, les PME francaises ont perdu 12 milliards d'euros en taches manuelles que l'IA pourrait automatiser" est plus percutant que "Bonjour, je suis Jean et je vais vous presenter mon projet."

Preparez-vous aux questions. Les investisseurs posent toujours les memes : "Pourquoi maintenant ?", "Que se passe-t-il si Google fait la meme chose ?", "Comment vous protegez-vous de la concurrence ?", "Quel est votre unfair advantage ?". Preparez des reponses claires et honnetes. Dire "je ne sais pas mais voici comment je vais le decouvrir" est toujours mieux que bluffer.

Le timing. Repetez votre pitch au chronometre. 5 minutes pour un pitch concours, 15-20 minutes pour un pitch investisseur, 3 minutes pour un elevator pitch. Repetez au moins 20 fois avant le jour J. Les meilleurs pitchs semblent naturels PARCE QU'ils sont ultra-prepares.

L'IA peut vous aider a preparer votre pitch. Demandez-lui de jouer le role d'un investisseur et de vous poser des questions difficiles. Demandez-lui de critiquer votre script. Demandez-lui de reformuler vos phrases pour plus d'impact. C'est votre coach de pitch gratuit et disponible 24/7 ! \u{1F3AF}`,
          xpReward: 15,
        },
        {
          id: 'bp-m5-l3',
          title: 'Quiz : Pitch Deck',
          duration: '5 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la construction et la presentation d\'un pitch deck.',
          quizQuestions: [
            {
              question: 'Quelle est la slide la plus importante pour un investisseur ?',
              options: ['La couverture', 'La traction (chiffres reels)', 'Le marche', 'L\'equipe'],
              correctIndex: 1,
              explanation: 'La traction montre des resultats concrets (utilisateurs, revenus, croissance). Les investisseurs preferent des petits chiffres reels a de grandes projections non prouvees.',
            },
            {
              question: 'Que signifie SAM dans l\'analyse de marche ?',
              options: [
                'Le marche total mondial',
                'Le segment de marche que vous pouvez raisonnablement atteindre',
                'Votre objectif de ventes annuel',
                'Le marche de vos concurrents directs',
              ],
              correctIndex: 1,
              explanation: 'SAM (Serviceable Available Market) est la portion du TAM (marche total) que vous pouvez raisonnablement cibler avec votre positionnement et vos ressources.',
            },
            {
              question: 'Combien de fois faut-il repeter son pitch avant le jour J ?',
              options: ['2-3 fois', '5 fois', 'Au moins 20 fois', 'Pas besoin, l\'improvisation est meilleure'],
              correctIndex: 2,
              explanation: 'Un minimum de 20 repetitions est recommande. Les meilleurs pitchs paraissent naturels precisement parce qu\'ils sont intensivement repetes.',
            },
            {
              question: 'Quelle est la regle du 10-20-30 de Guy Kawasaki ?',
              options: [
                '10 clients, 20 euros, 30 jours',
                '10 slides, 20 minutes, police 30 points',
                '10 pages, 20 chapitres, 30 graphiques',
                '10 investisseurs, 20 meetings, 30% equity',
              ],
              correctIndex: 1,
              explanation: 'La regle 10-20-30 : maximum 10 slides de contenu cle, 20 minutes de presentation et police minimum de 30 points pour forcer la concision.',
            },
            {
              question: 'Comment doit se structurer la narrative d\'un pitch ?',
              options: [
                'Solution → Probleme → Demande',
                'Equipe → Produit → Finances',
                'Probleme (conflit) → Solution (preuve) → Avenir (demande)',
                'Marche → Concurrence → Prix',
              ],
              correctIndex: 2,
              explanation: 'Un pitch raconte une histoire en 3 actes : le conflit (probleme), la resolution (solution + preuves), et l\'avenir (demande de financement/partenariat).',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F3AC}',
      badgeName: 'Pitch Master',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Go-to-Market
    // -----------------------------------------------------------------------
    {
      id: 'bp-m6',
      title: 'Strategie Go-to-Market',
      emoji: '\u{1F680}',
      description: 'Definir votre strategie de lancement : canaux d\'acquisition, premiers clients et plan d\'action.',
      duration: '55 min',
      lessons: [
        {
          id: 'bp-m6-l1',
          title: 'Strategie d\'acquisition des premiers clients',
          duration: '9 min',
          type: 'text',
          content: `Vous avez votre etude de marche, votre business model, votre pricing et votre pitch deck. Maintenant, la question qui tue : comment trouver vos 100 premiers clients ? \u{1F3AF} C'est la strategie Go-to-Market (GTM), et c'est souvent la partie la plus sous-estimee d'un business plan.

Les 100 premiers clients sont les plus difficiles et les plus importants. Ils valident votre produit, vous donnent des feedbacks, et deviennent vos ambassadeurs. La strategie pour les trouver est radicalement differente de celle pour passer de 1000 a 10000 clients.

Canal 1 — Le reseau personnel (les 10 premiers clients). Vos premiers clients seront des gens qui vous connaissent et vous font confiance. Famille, amis, anciens collegues, contacts LinkedIn. Ce n'est pas du "piston" — c'est du pragmatisme. Offrez-leur un acces gratuit ou un tarif early adopter en echange de feedbacks honnetes. \u{1F91D}

Canal 2 — Les communautes en ligne (clients 10-50). Identifiez les forums, groupes Facebook, serveurs Discord, subreddits et communautes Slack ou se trouvent vos cibles. Participez genuinement aux discussions AVANT de parler de votre produit. Apportez de la valeur, puis mentionnez naturellement votre solution quand c'est pertinent. Le spam communautaire est contre-productif — soyez un membre utile d'abord.

Canal 3 — Le contenu (clients 50-100). Le content marketing est le meilleur canal a moyen terme pour un SaaS. Blog, videos YouTube, posts LinkedIn, newsletter. L'IA vous aide a produire du contenu de qualite a un rythme soutenu. Chez Freenzy, le blog publie un article par jour, genere par IA et valide par un humain. \u{270D}\u{FE0F}

Canal 4 — Les partenariats strategiques. Trouvez des entreprises complementaires (pas concurrentes) qui touchent votre meme cible. Un outil de facturation peut s'associer avec un outil CRM : chacun recommande l'autre a ses clients. C'est du win-win sans cout marketing.

Canal 5 — Le referral (parrainage). Vos clients satisfaits sont votre meilleure force de vente. Mettez en place un programme de parrainage des le debut. Freenzy offre 20 credits au parrain ET au filleul — un systeme qui s'auto-alimente. Le referral a le meilleur ratio cout/efficacite de tous les canaux d'acquisition. \u{1F4E3}

Canal 6 — La publicite payante (acceleration). Google Ads, Facebook Ads, LinkedIn Ads. A utiliser APRES avoir valide votre product-market fit avec les canaux organiques. Sinon, vous brulez de l'argent pour envoyer du trafic vers un produit qui ne convertit pas encore. Commencez petit (50-100 euros/jour), mesurez le CAC, optimisez, puis scalez.

La regle d'or du GTM : concentrez-vous sur 2-3 canaux maximum au debut. Mieux vaut maitriser 2 canaux que d'etre mediocre sur 6. Identifiez vos 2 meilleurs canaux (en testant pendant 30 jours) et investissez-y massivement. \u{1F4AA}`,
          xpReward: 15,
        },
        {
          id: 'bp-m6-l2',
          title: 'Plan d\'action 90 jours',
          duration: '9 min',
          type: 'text',
          content: `La strategie sans execution ne vaut rien. Ce qui separe les projets qui reussissent de ceux qui restent des idees, c'est un plan d'action concret avec des deadlines. Voici comment structurer vos 90 premiers jours de lancement. \u{1F4C5}

Semaines 1-2 : La preparation. Finalisez votre MVP (Minimum Viable Product) — la version la plus simple de votre produit qui delivre de la valeur. Configurez vos outils d'analytics (Google Analytics, Mixpanel ou PostHog) pour mesurer chaque action. Creez vos comptes sur les reseaux sociaux et plateformes cibles. Preparez 10 articles de blog ou posts LinkedIn en avance. L'objectif : etre pret a accueillir vos premiers utilisateurs sans improvisation.

Semaines 3-4 : Le soft launch. Invitez votre cercle proche (50-100 personnes) a tester le produit. Offrez un acces gratuit ou un tarif "founding member" irreversible. Collectez les feedbacks obsessivement : chaque bug, chaque confusion, chaque suggestion. Corrigez les problemes critiques immediatement. C'est la phase la plus intense et la plus riche en apprentissages. \u{1F527}

Semaines 5-6 : L'iteration. Analysez les donnees du soft launch. Quelles fonctionnalites sont les plus utilisees ? Ou les utilisateurs bloquent-ils ? Quel est le taux d'activation (% des inscrits qui effectuent l'action cle) ? Ameliorez le produit en fonction des donnees — pas de vos intuitions. A/B testez votre page d'accueil et votre onboarding.

Semaines 7-8 : L'ouverture publique. Lancez votre produit publiquement sur Product Hunt, Hacker News, et les communautes cibles. Publiez votre premier article de blog "pilier" (guide complet de 2000+ mots sur un probleme que votre cible rencontre). Activez votre programme de parrainage. Contactez 5 micro-influenceurs de votre niche pour un test gratuit en echange d'un avis. \u{1F4E2}

Semaines 9-10 : L'acceleration. Lancez vos premieres campagnes publicitaires a petit budget (30-50 euros/jour). Testez 3-4 messages differents et 3-4 audiences. Coupez rapidement ce qui ne fonctionne pas, doublez ce qui marche. Commencez a contacter des partenaires potentiels pour des collaborations.

Semaines 11-12 : L'optimisation. Analysez vos metriques completes : CAC, LTV, churn, taux de conversion, NPS. Identifiez votre canal d'acquisition le plus performant et concentrez vos ressources dessus. Preparez votre roadmap produit pour le trimestre suivant. Redigez votre premier rapport mensuel pour vous (et vos eventuels investisseurs). \u{1F4CA}

A chaque etape, l'IA est votre allie. Demandez-lui de rediger vos emails de prospection, d'analyser les feedbacks utilisateurs, de generer des idees de contenu, de challenger vos hypotheses. L'agent fz-commercial de Freenzy peut vous aider a preparer vos argumentaires de vente, et l'agent fz-marketing peut generer votre calendrier editorial.

Le piege a eviter : la paralysie de la perfection. Votre produit ne sera jamais parfait au lancement. Mieux vaut un produit imparfait lance qu'un produit parfait jamais sorti. La phrase de Reid Hoffman (fondateur de LinkedIn) resume tout : "Si vous n'avez pas honte de la premiere version de votre produit, vous l'avez lance trop tard." \u{1F525}`,
          xpReward: 15,
        },
        {
          id: 'bp-m6-l3',
          title: 'Quiz : Go-to-Market',
          duration: '5 min',
          type: 'quiz',
          content: 'Validez vos connaissances sur la strategie Go-to-Market pour conclure ce parcours.',
          quizQuestions: [
            {
              question: 'Sur combien de canaux d\'acquisition faut-il se concentrer au debut ?',
              options: ['1 seul', '2-3 maximum', '5-6 minimum', 'Tous en meme temps'],
              correctIndex: 1,
              explanation: 'Mieux vaut maitriser 2-3 canaux que d\'etre mediocre sur 6. Identifiez vos meilleurs canaux en testant, puis concentrez vos ressources dessus.',
            },
            {
              question: 'Quand faut-il lancer de la publicite payante ?',
              options: [
                'Des le premier jour',
                'Apres avoir valide le product-market fit avec les canaux organiques',
                'Jamais, c\'est trop cher',
                'Uniquement si vous avez leve des fonds',
              ],
              correctIndex: 1,
              explanation: 'La publicite payante doit etre lancee APRES validation du product-market fit. Sinon, vous payez pour envoyer du trafic vers un produit qui ne convertit pas.',
            },
            {
              question: 'Que signifie MVP ?',
              options: [
                'Maximum Viable Product',
                'Minimum Viable Product',
                'Most Valuable Product',
                'Market Value Proposition',
              ],
              correctIndex: 1,
              explanation: 'MVP = Minimum Viable Product. C\'est la version la plus simple de votre produit qui delivre de la valeur au client.',
            },
            {
              question: 'Quel canal a le meilleur ratio cout/efficacite pour l\'acquisition client ?',
              options: ['Google Ads', 'Facebook Ads', 'Le referral (parrainage)', 'Les salons professionnels'],
              correctIndex: 2,
              explanation: 'Le parrainage (referral) a le meilleur ratio car les clients satisfaits recommandent gratuitement. Le cout est uniquement la recompense offerte.',
            },
            {
              question: 'Qui a dit "Si vous n\'avez pas honte de la premiere version de votre produit, vous l\'avez lance trop tard" ?',
              options: ['Steve Jobs', 'Elon Musk', 'Reid Hoffman (LinkedIn)', 'Mark Zuckerberg'],
              correctIndex: 2,
              explanation: 'Reid Hoffman, co-fondateur de LinkedIn, est l\'auteur de cette citation celebre qui encourage le lancement rapide plutot que la recherche de perfection.',
            },
          ],
          xpReward: 20,
        },
      ],
      passingScore: 60,
      xpReward: 50,
      badgeEmoji: '\u{1F680}',
      badgeName: 'Go-to-Market Strategist',
    },
  ],
};
