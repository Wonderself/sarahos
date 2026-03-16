// =============================================================================
// Freenzy.io — Formation Niv1: Avatar IA & Chat IA
// Parcours 1: Creer son Avatar IA
// Parcours 2: Maitriser le Chat IA
// =============================================================================

import type { FormationParcours } from './formation-data';

// ---------------------------------------------------------------------------
// PARCOURS 1 — Creer son Avatar IA
// ---------------------------------------------------------------------------

export const parcoursAvatarIA: FormationParcours = {
  id: 'avatar-ia-niv1',
  title: 'Creer son Avatar IA',
  emoji: '\u{1F9D1}\u{200D}\u{1F3A8}',
  description: 'Apprenez a creer, animer et publier votre propre avatar IA : visage, voix, animation et integration professionnelle.',
  category: 'contenu',
  subcategory: 'avatar',
  level: 'debutant',
  levelLabel: 'Debutant',
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Qu'est-ce qu'un avatar IA ?
    // -----------------------------------------------------------------------
    {
      id: 'av-m1',
      title: 'Qu\'est-ce qu\'un avatar IA ?',
      emoji: '\u{1F914}',
      description: 'Decouvrez le concept d\'avatar IA, ses usages et pourquoi c\'est un game-changer.',
      duration: '15 min',
      lessons: [
        {
          id: 'av-m1-l1',
          title: 'Introduction aux avatars IA',
          duration: '6 min',
          type: 'text',
          content: `Bienvenue dans cette formation sur les avatars IA ! \u{1F389} Un avatar IA, c'est une representation numerique de vous-meme (ou d'un personnage fictif) qui peut parler, bouger et interagir de maniere autonome grace a l'intelligence artificielle.

Imaginez un double numerique capable de presenter vos produits en video, d'accueillir les visiteurs de votre site web ou de repondre a vos clients en visio — sans que vous soyez physiquement present. C'est exactement ce que permet un avatar IA.

Les avatars IA sont utilises dans de nombreux domaines. En marketing, ils presentent des produits dans des videos publicitaires personnalisees. En formation, ils jouent le role de formateurs virtuels disponibles 24h/24. En service client, ils accueillent et orientent les visiteurs sur un site web. En communication interne, ils delivrent des messages video aux equipes sans mobiliser de camera.

La technologie derriere les avatars IA repose sur trois piliers fondamentaux. D'abord, la generation de visage : a partir d'une photo ou d'une description, l'IA cree un visage realiste. Ensuite, la synthese vocale : un moteur TTS (Text-to-Speech) comme ElevenLabs transforme du texte en voix naturelle. Enfin, l'animation faciale : un systeme comme D-ID synchronise les mouvements des levres et les expressions du visage avec la voix.

Sur Freenzy, tout est integre dans le Studio creatif. Vous n'avez besoin d'aucune competence technique : l'assistant vous guide etape par etape. En quelques minutes, vous obtenez une video avec votre avatar qui parle et bouge naturellement. \u{1F3AC}

Dans ce parcours, nous allons creer votre premier avatar ensemble, du visage jusqu'a la publication. Pret a donner vie a votre double numerique ?`,
          xpReward: 20,
        },
        {
          id: 'av-m1-l2',
          title: 'Cas d\'usage concrets',
          duration: '5 min',
          type: 'text',
          content: `Avant de passer a la creation, voyons des exemples concrets d'utilisation des avatars IA pour vous inspirer. \u{1F4A1}

Sophie, coach en developpement personnel, utilise son avatar pour creer des mini-formations video. Elle ecrit le script, son avatar le presente avec sa voix clonee, et elle publie une nouvelle video chaque semaine sans jamais allumer sa camera. Resultat : 3x plus de contenu avec 5x moins de temps.

Marc dirige une agence immobiliere. Son avatar accueille les visiteurs sur son site web et presente les biens en video. Chaque annonce est accompagnee d'une visite commentee par "Marc virtuel". Ses clients adorent l'experience personnalisee et son taux de contact a augmente de 40%.

Julie est formatrice en langues. Elle a cree des avatars de differentes nationalites pour ses cours. Chaque avatar parle dans sa langue avec l'accent authentique, rendant les cours plus immersifs et engageants. Ses eleves progressent plus vite car l'interaction semble naturelle.

Les possibilites sont vastes : presentations commerciales, messages de bienvenue personnalises, tutoriels produit, videos de recrutement, contenus pour les reseaux sociaux ou meme des assistants virtuels sur votre site. \u{1F310}

Le point commun ? Tous ces usages economisent du temps et permettent de scaler la creation de contenu video sans equipe de production. Vous gardez le controle creatif tout en automatisant l'execution.

A vous maintenant de trouver VOTRE cas d'usage ideal ! Reflechissez-y pendant le quiz qui suit. \u{1F3AF}`,
          xpReward: 20,
        },
        {
          id: 'av-m1-l3',
          title: 'Quiz : Les bases des avatars IA',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur les avatars IA et leurs usages.',
          quizQuestions: [
            {
              question: 'Quels sont les trois piliers technologiques d\'un avatar IA ?',
              options: [
                'Camera, micro, eclairage',
                'Generation de visage, synthese vocale, animation faciale',
                'Photoshop, Premiere Pro, After Effects',
                'Cloud, blockchain, 5G',
              ],
              correctIndex: 1,
              explanation: 'Un avatar IA repose sur la generation de visage, la synthese vocale (TTS) et l\'animation faciale qui synchronise levres et expressions.',
            },
            {
              question: 'Quel avantage principal offre un avatar IA pour la creation de contenu ?',
              options: [
                'Il remplace definitivement les humains',
                'Il permet de scaler la production video sans equipe',
                'Il ne coute rien du tout',
                'Il fonctionne uniquement hors ligne',
              ],
              correctIndex: 1,
              explanation: 'L\'avatar IA permet de multiplier les contenus video sans mobiliser camera, studio ou equipe de production.',
            },
            {
              question: 'Dans quel outil Freenzy sont integres les avatars ?',
              options: [
                'Le CRM',
                'Le Studio creatif',
                'Les parametres du compte',
                'L\'assistant juridique',
              ],
              correctIndex: 1,
              explanation: 'Le Studio creatif de Freenzy integre toute la chaine de creation d\'avatars IA : visage, voix et animation.',
            },
            {
              question: 'Quel est un cas d\'usage courant des avatars IA en marketing ?',
              options: [
                'Envoyer des fax automatiques',
                'Presenter des produits dans des videos publicitaires personnalisees',
                'Imprimer des flyers',
                'Organiser des reunions physiques',
              ],
              correctIndex: 1,
              explanation: 'Les avatars IA sont tres utilises pour creer des videos publicitaires personnalisees a grande echelle.',
            },
            {
              question: 'Faut-il des competences techniques pour creer un avatar sur Freenzy ?',
              options: [
                'Oui, il faut savoir coder en Python',
                'Oui, il faut maitriser After Effects',
                'Non, l\'assistant guide etape par etape',
                'Oui, il faut un diplome en IA',
              ],
              correctIndex: 2,
              explanation: 'Aucune competence technique n\'est requise. Freenzy guide l\'utilisateur a chaque etape de la creation.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 70,
      badgeEmoji: '\u{1F914}',
      badgeName: 'Curieux Avatar',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Creer votre visage
    // -----------------------------------------------------------------------
    {
      id: 'av-m2',
      title: 'Creer votre visage',
      emoji: '\u{1F5BC}\u{FE0F}',
      description: 'Generez un visage realiste a partir de votre photo ou d\'une description textuelle.',
      duration: '18 min',
      lessons: [
        {
          id: 'av-m2-l1',
          title: 'Generer un visage avec Flux',
          duration: '7 min',
          type: 'text',
          content: `Le visage est la base de votre avatar. Sur Freenzy, vous avez deux approches pour le creer, et toutes deux passent par le moteur Flux (fal.ai), un generateur d'images IA ultra-rapide. \u{26A1}

Premiere approche : a partir de votre photo. Uploadez un portrait (de face, bien eclaire, fond neutre de preference) et Freenzy genere une version "avatar" de votre visage. L'IA conserve vos traits distinctifs — forme du visage, couleur des yeux, coiffure — tout en lissant les imperfections pour un rendu professionnel.

Deuxieme approche : a partir d'une description textuelle. Vous decrivez le visage souhaite dans un prompt : "Femme, 35 ans, cheveux bruns mi-longs, sourire professionnel, fond blanc". Flux genere un visage correspondant en quelques secondes. Cette option est ideale si vous voulez un personnage fictif pour votre marque.

Pour obtenir un bon resultat, quelques conseils. Utilisez un prompt precis : mentionnez l'age approximatif, le genre, la coiffure, l'expression et le style vestimentaire. Preciser "photo de portrait professionnelle" ameliore nettement la qualite. Evitez les descriptions trop complexes au debut : commencez simple et affinez progressivement.

Le processus dans Freenzy est simple. Allez dans le Studio creatif, selectionnez "Creer un avatar", choisissez "A partir d'une photo" ou "A partir d'un prompt", et laissez l'IA travailler. Le resultat s'affiche en 5 a 15 secondes. Vous pouvez generer plusieurs variantes et choisir celle qui vous convient le mieux. \u{1F3A8}

Chaque generation coute 8 credits (image standard) ou 12 credits (image HD). Un investissement minime pour un resultat professionnel que vous reutiliserez dans toutes vos videos.

Conseil pro : gardez une coherence visuelle. Choisissez UN visage et utilisez-le partout pour construire la reconnaissance de votre marque personnelle. \u{2728}`,
          xpReward: 25,
        },
        {
          id: 'av-m2-l2',
          title: 'Exercice : Creer votre premier visage',
          duration: '6 min',
          type: 'exercise',
          content: 'Generez le visage de votre avatar en utilisant le Studio creatif.',
          exercisePrompt: 'Rendez-vous dans le Studio creatif (section Divertissement de la sidebar). Selectionnez "Creer un avatar" puis choisissez l\'option "A partir d\'un prompt". Ecrivez un prompt descriptif pour votre avatar professionnel (ex: "Homme 40 ans, costume bleu, sourire confiant, fond blanc"). Generez l\'image et sauvegardez-la dans votre galerie.',
          xpReward: 35,
        },
        {
          id: 'av-m2-l3',
          title: 'Quiz : Generation de visage',
          duration: '5 min',
          type: 'quiz',
          content: 'Verifiez vos connaissances sur la generation de visage pour avatars.',
          quizQuestions: [
            {
              question: 'Quel moteur IA utilise Freenzy pour generer les visages ?',
              options: ['DALL-E', 'Midjourney', 'Flux (fal.ai)', 'Stable Diffusion'],
              correctIndex: 2,
              explanation: 'Freenzy utilise le moteur Flux de fal.ai, un generateur d\'images IA ultra-rapide.',
            },
            {
              question: 'Combien coute une generation d\'image standard en credits ?',
              options: ['2 credits', '5 credits', '8 credits', '20 credits'],
              correctIndex: 2,
              explanation: 'Une generation d\'image standard coute 8 credits. La version HD coute 12 credits.',
            },
            {
              question: 'Quel type de photo est recommande pour creer un avatar a partir de son propre visage ?',
              options: [
                'Photo de groupe en soiree',
                'Portrait de face, bien eclaire, fond neutre',
                'Selfie avec filtre Snapchat',
                'Photo de profil de loin',
              ],
              correctIndex: 1,
              explanation: 'Un portrait de face, bien eclaire et sur fond neutre donne les meilleurs resultats pour la generation d\'avatar.',
            },
            {
              question: 'Combien de temps faut-il pour generer un visage avec Flux ?',
              options: ['1 a 2 minutes', '5 a 15 secondes', '30 minutes', '24 heures'],
              correctIndex: 1,
              explanation: 'Flux genere un visage en 5 a 15 secondes, ce qui en fait l\'un des moteurs les plus rapides du marche.',
            },
            {
              question: 'Pourquoi est-il conseille de garder le meme visage d\'avatar partout ?',
              options: [
                'Pour economiser des credits',
                'Pour construire la reconnaissance de marque',
                'C\'est une obligation legale',
                'Flux ne peut generer qu\'un seul visage',
              ],
              correctIndex: 1,
              explanation: 'Utiliser le meme visage d\'avatar partout renforce la coherence visuelle et la reconnaissance de votre marque personnelle.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F5BC}\u{FE0F}',
      badgeName: 'Portraitiste',
    },

    // -----------------------------------------------------------------------
    // Module 3 — La voix (ElevenLabs)
    // -----------------------------------------------------------------------
    {
      id: 'av-m3',
      title: 'La voix de votre avatar',
      emoji: '\u{1F399}\u{FE0F}',
      description: 'Donnez une voix naturelle et professionnelle a votre avatar avec ElevenLabs.',
      duration: '16 min',
      lessons: [
        {
          id: 'av-m3-l1',
          title: 'Synthese vocale avec ElevenLabs',
          duration: '7 min',
          type: 'text',
          content: `La voix est ce qui donne vie a votre avatar. Sans elle, ce n'est qu'une image statique. Avec elle, votre avatar devient un presentateur credible et engageant. \u{1F3A4}

Freenzy utilise ElevenLabs, le leader mondial de la synthese vocale IA. Le modele eleven_multilingual_v2 est capable de parler dans plus de 29 langues avec une qualite quasi-humaine. L'intonation, le rythme, les pauses et meme les micro-expressions vocales sont reproduits fidelement.

Vous avez plusieurs options pour la voix de votre avatar. Option 1 : choisir une voix dans la bibliotheque. Freenzy propose une selection de voix pre-configurees (dont la voix George en francais, particulierement naturelle). Ecoutez les echantillons et selectionnez celle qui correspond a l'image de votre marque.

Option 2 : cloner votre propre voix. C'est la fonctionnalite la plus impressionnante. Enregistrez quelques minutes de votre voix (un texte lu a voix haute, dans un environnement calme) et ElevenLabs cree un clone vocal fidele. Votre avatar parlera alors exactement comme vous — meme timbre, meme rythme, meme personnalite vocale.

Pour un bon clonage vocal, enregistrez au moins 3 minutes de parole continue. Parlez naturellement, comme dans une conversation. Evitez les bruits de fond et utilisez un micro correct (meme celui de vos ecouteurs fait l'affaire). Variez les intonations : questions, exclamations, phrases longues et courtes.

La voix generee est stockee dans votre profil et reutilisable pour toutes vos futures videos. Chaque generation TTS consomme des credits en fonction de la longueur du texte. Un texte de 200 mots coute environ 3 credits en voix standard. \u{1F4B0}

Le resultat est bluffant : meme vos proches auront du mal a distinguer la voix synthetique de votre vraie voix !`,
          xpReward: 25,
        },
        {
          id: 'av-m3-l2',
          title: 'Exercice : Tester la synthese vocale',
          duration: '5 min',
          type: 'exercise',
          content: 'Experimentez la synthese vocale en generant un echantillon audio.',
          exercisePrompt: 'Dans le Studio creatif, accedez a la section "Voix". Selectionnez la voix "George" dans la bibliotheque et entrez un texte de presentation de 3 phrases (ex: "Bonjour, je suis votre assistant virtuel. Je suis la pour vous accompagner dans vos projets. N\'hesitez pas a me poser vos questions."). Ecoutez le resultat et notez la qualite de l\'intonation.',
          xpReward: 30,
        },
        {
          id: 'av-m3-l3',
          title: 'Quiz : Maitrise vocale',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur la synthese vocale IA.',
          quizQuestions: [
            {
              question: 'Quel service de synthese vocale utilise Freenzy ?',
              options: ['Google TTS', 'Amazon Polly', 'ElevenLabs', 'Microsoft Azure TTS'],
              correctIndex: 2,
              explanation: 'Freenzy utilise ElevenLabs avec le modele eleven_multilingual_v2 pour une qualite vocale quasi-humaine.',
            },
            {
              question: 'Combien de langues le modele eleven_multilingual_v2 supporte-t-il ?',
              options: ['5 langues', '12 langues', 'Plus de 29 langues', 'Uniquement le francais'],
              correctIndex: 2,
              explanation: 'Le modele eleven_multilingual_v2 d\'ElevenLabs supporte plus de 29 langues avec une qualite naturelle.',
            },
            {
              question: 'Quelle duree minimale d\'enregistrement est recommandee pour cloner sa voix ?',
              options: ['10 secondes', '30 secondes', '3 minutes', '1 heure'],
              correctIndex: 2,
              explanation: 'Il est recommande d\'enregistrer au moins 3 minutes de parole continue pour obtenir un clonage vocal fidele.',
            },
            {
              question: 'Quel conseil est donne pour un bon enregistrement de clonage vocal ?',
              options: [
                'Parler tres vite pour couvrir plus de mots',
                'Enregistrer dans un environnement bruyant pour plus de realisme',
                'Parler naturellement et varier les intonations',
                'Chuchoter pour economiser sa voix',
              ],
              correctIndex: 2,
              explanation: 'Il faut parler naturellement, varier les intonations (questions, exclamations) et enregistrer dans un environnement calme.',
            },
            {
              question: 'Ou est stockee la voix generee apres le clonage ?',
              options: [
                'Sur une cle USB',
                'Dans votre profil Freenzy, reutilisable pour toutes les videos',
                'Elle est supprimee apres chaque utilisation',
                'Sur les serveurs d\'ElevenLabs uniquement',
              ],
              correctIndex: 1,
              explanation: 'La voix clonee est stockee dans votre profil Freenzy et peut etre reutilisee pour toutes vos futures videos.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F399}\u{FE0F}',
      badgeName: 'Voix d\'Or',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Animer votre avatar
    // -----------------------------------------------------------------------
    {
      id: 'av-m4',
      title: 'Animer votre avatar',
      emoji: '\u{1F3AC}',
      description: 'Synchronisez la voix avec le visage pour creer des videos animees.',
      duration: '17 min',
      lessons: [
        {
          id: 'av-m4-l1',
          title: 'Animation faciale avec D-ID',
          duration: '7 min',
          type: 'text',
          content: `C'est le moment magique : donner vie a votre avatar ! \u{2728} L'animation faciale est ce qui transforme une simple image en un presentateur video credible. Freenzy utilise D-ID, la reference mondiale en animation de visages par IA.

D-ID prend en entree deux elements : votre image de visage (generee au module 2) et votre piste audio (creee au module 3). Il analyse la parole — chaque syllabe, chaque phoneme — et synchronise en temps reel les mouvements des levres, les clignements des yeux, les micro-expressions du visage et meme les leger mouvements de tete.

Le resultat est une video ou votre avatar semble reellement parler. La synchronisation labiale est precise a la milliseconde, ce qui donne une impression naturelle meme sur des textes longs. Les expressions faciales ajoutent du realisme : sourcils qui se levent pour une question, sourire pour un point positif, regard concentre pour une explication technique.

Pour lancer une animation sur Freenzy, le processus est en trois etapes. Etape 1 : selectionnez votre visage d'avatar dans la galerie. Etape 2 : choisissez la voix et le texte a prononcer (ou importez un fichier audio). Etape 3 : cliquez sur "Generer la video". Le traitement prend generalement entre 30 secondes et 2 minutes selon la longueur du texte.

Quelques astuces pour un rendu optimal. Gardez vos videos courtes au debut — 30 secondes a 1 minute — pour maitriser le format avant de passer a des contenus plus longs. Utilisez des pauses dans votre texte (points de suspension ou virgules) pour donner un rythme naturel a la parole. Evitez les phrases trop longues sans ponctuation : l'avatar respire mieux avec des phrases courtes. \u{1F4AA}

Le cout d'une animation video est de 20 credits. C'est un investissement rentable quand on compare au cout d'une production video traditionnelle (cameraman, eclairage, montage). Votre avatar produit un resultat professionnel en quelques clics !`,
          xpReward: 25,
        },
        {
          id: 'av-m4-l2',
          title: 'Exercice : Creer votre premiere video avatar',
          duration: '6 min',
          type: 'exercise',
          content: 'Assemblez visage + voix pour creer votre premiere video animee.',
          exercisePrompt: 'Dans le Studio creatif, selectionnez "Video Avatar". Choisissez le visage genere au module 2 et la voix testee au module 3. Redigez un script court de 3-4 phrases pour vous presenter (nom, activite, proposition de valeur). Generez la video et visionnez le resultat. Evaluez la synchronisation labiale et le naturel de l\'animation.',
          xpReward: 35,
        },
        {
          id: 'av-m4-l3',
          title: 'Quiz : Animation d\'avatar',
          duration: '4 min',
          type: 'quiz',
          content: 'Evaluez votre comprehension de l\'animation faciale IA.',
          quizQuestions: [
            {
              question: 'Quel service utilise Freenzy pour l\'animation faciale ?',
              options: ['Runway ML', 'D-ID', 'Synthesia', 'HeyGen'],
              correctIndex: 1,
              explanation: 'Freenzy utilise D-ID, la reference mondiale en animation de visages par intelligence artificielle.',
            },
            {
              question: 'Quels sont les deux elements necessaires pour animer un avatar ?',
              options: [
                'Un texte et une couleur de fond',
                'Une image de visage et une piste audio',
                'Une camera et un micro',
                'Un logo et une musique de fond',
              ],
              correctIndex: 1,
              explanation: 'D-ID prend en entree une image de visage et une piste audio pour generer l\'animation video synchronisee.',
            },
            {
              question: 'Combien coute une generation de video avatar en credits ?',
              options: ['5 credits', '10 credits', '20 credits', '50 credits'],
              correctIndex: 2,
              explanation: 'Une animation video avatar coute 20 credits, ce qui reste bien inferieur au cout d\'une production video traditionnelle.',
            },
            {
              question: 'Quelle astuce ameliore le rythme de parole de l\'avatar ?',
              options: [
                'Ecrire tout en majuscules',
                'Utiliser des pauses (virgules, points de suspension) dans le texte',
                'Repeter chaque phrase deux fois',
                'Ecrire phonetiquement',
              ],
              correctIndex: 1,
              explanation: 'Les pauses dans le texte (ponctuation) donnent un rythme naturel a la parole de l\'avatar.',
            },
            {
              question: 'Combien de temps prend la generation d\'une video avatar ?',
              options: [
                'Instantane',
                '30 secondes a 2 minutes',
                '10 a 30 minutes',
                'Plusieurs heures',
              ],
              correctIndex: 1,
              explanation: 'La generation prend entre 30 secondes et 2 minutes selon la longueur du texte.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F3AC}',
      badgeName: 'Animateur',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Avatar pour l'entreprise
    // -----------------------------------------------------------------------
    {
      id: 'av-m5',
      title: 'Avatar pour l\'entreprise',
      emoji: '\u{1F3E2}',
      description: 'Utilisez votre avatar dans un contexte professionnel : branding, accueil, formation.',
      duration: '16 min',
      lessons: [
        {
          id: 'av-m5-l1',
          title: 'Strategies d\'avatar en entreprise',
          duration: '7 min',
          type: 'text',
          content: `Votre avatar est cree et fonctionne — felicitations ! \u{1F389} Maintenant, voyons comment l'exploiter strategiquement pour votre entreprise. Un avatar bien utilise peut devenir un veritable asset marketing et commercial.

Strategie 1 : le porte-parole de marque. Votre avatar devient le visage officiel de votre entreprise dans toutes les communications video. Presentations produit, messages LinkedIn, newsletters video, accueil sur le site web — il porte votre image de maniere coherente et professionnelle. L'avantage : vous creez du contenu regulier sans dependre de votre disponibilite physique.

Strategie 2 : l'accueil client automatise. Integrez votre avatar sur la page d'accueil de votre site ou dans votre chatbot. Il accueille les visiteurs par leur prenom (si connu), presente vos services et oriente vers la bonne page. Cette touche humaine augmente significativement le temps passe sur le site et le taux de conversion.

Strategie 3 : la formation interne. Creez des modules de formation presentes par votre avatar. Onboarding des nouveaux collaborateurs, formation produit pour l'equipe commerciale, mises a jour de procedures internes — tout peut etre presente en video sans mobiliser un formateur. Les videos sont consultables a tout moment et toujours a jour.

Strategie 4 : le contenu social a grande echelle. Produisez des series de videos courtes pour vos reseaux sociaux. Un conseil par jour, une actualite de votre secteur, un temoignage client — votre avatar debite du contenu pendant que vous vous concentrez sur votre coeur de metier. \u{1F4C8}

Pour maximiser l'impact, maintenez une charte visuelle stricte : meme visage, meme voix, meme style vestimentaire, meme fond. La repetition cree la familiarite, et la familiarite cree la confiance. Votre avatar doit etre aussi reconnaissable que votre logo.

Pensez aussi a adapter le ton selon le contexte : professionnel et pose pour le site web, dynamique et enthousiaste pour les reseaux sociaux, pedagogique et patient pour la formation.`,
          xpReward: 25,
        },
        {
          id: 'av-m5-l2',
          title: 'Exercice : Planifier sa strategie avatar',
          duration: '5 min',
          type: 'exercise',
          content: 'Definissez votre strategie d\'utilisation d\'avatar en contexte professionnel.',
          exercisePrompt: 'Demandez a l\'assistant Commercial (fz-commercial) de vous aider a definir une strategie avatar pour votre activite. Precisez votre secteur et vos objectifs. Identifiez 3 cas d\'usage prioritaires ou un avatar apporterait le plus de valeur. Pour chaque cas, notez le format (video courte, accueil, formation) et la frequence de publication visee.',
          xpReward: 30,
        },
        {
          id: 'av-m5-l3',
          title: 'Quiz : Avatar en entreprise',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez vos connaissances sur l\'utilisation professionnelle des avatars IA.',
          quizQuestions: [
            {
              question: 'Quel est l\'avantage principal d\'un avatar porte-parole de marque ?',
              options: [
                'Il remplace definitivement le dirigeant',
                'Il permet de creer du contenu regulier sans dependre de la disponibilite physique',
                'Il est gratuit',
                'Il ne necessite aucune strategie',
              ],
              correctIndex: 1,
              explanation: 'L\'avatar porte-parole permet de produire du contenu video regulier sans etre physiquement present a chaque tournage.',
            },
            {
              question: 'Pourquoi maintenir une charte visuelle stricte pour l\'avatar ?',
              options: [
                'Pour economiser de l\'espace de stockage',
                'Parce que c\'est obligatoire par la loi',
                'La repetition cree la familiarite et la confiance',
                'Pour eviter les bugs techniques',
              ],
              correctIndex: 2,
              explanation: 'La coherence visuelle (meme visage, voix, style) cree la familiarite qui genere la confiance aupres de votre audience.',
            },
            {
              question: 'Quel usage d\'avatar augmente le temps passe sur un site web ?',
              options: [
                'Un avatar cache dans le footer',
                'Un avatar d\'accueil qui presente les services',
                'Un avatar dans les mentions legales',
                'Un avatar uniquement visible sur mobile',
              ],
              correctIndex: 1,
              explanation: 'Un avatar d\'accueil qui accueille les visiteurs et presente les services ajoute une touche humaine qui augmente l\'engagement.',
            },
            {
              question: 'Comment adapter le ton de l\'avatar selon le contexte ?',
              options: [
                'Toujours le meme ton formel',
                'Professionnel pour le site, dynamique pour les reseaux, pedagogique pour la formation',
                'Toujours humoristique',
                'Le ton ne peut pas etre modifie',
              ],
              correctIndex: 1,
              explanation: 'Le ton doit s\'adapter : professionnel et pose pour le site, dynamique pour les reseaux sociaux, pedagogique pour la formation.',
            },
            {
              question: 'Quel est l\'avantage d\'utiliser un avatar pour la formation interne ?',
              options: [
                'Les videos sont consultables a tout moment et toujours a jour',
                'Les employes n\'ont plus besoin de travailler',
                'Cela remplace les ressources humaines',
                'C\'est uniquement utile pour les grandes entreprises',
              ],
              correctIndex: 0,
              explanation: 'Les formations video par avatar sont disponibles 24h/24, consultables a la demande et facilement mises a jour.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F3E2}',
      badgeName: 'Stratege Avatar',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Publier et integrer
    // -----------------------------------------------------------------------
    {
      id: 'av-m6',
      title: 'Publier et integrer',
      emoji: '\u{1F680}',
      description: 'Exportez, publiez et integrez vos videos avatar sur vos plateformes.',
      duration: '16 min',
      lessons: [
        {
          id: 'av-m6-l1',
          title: 'Export et distribution',
          duration: '7 min',
          type: 'text',
          content: `Votre video avatar est prete — il est temps de la partager avec le monde ! \u{1F30D} L'export et la distribution sont les etapes finales qui transforment votre creation en un veritable outil de communication.

Freenzy vous permet d'exporter vos videos dans plusieurs formats. Le format MP4 (1080p) est le standard universel qui fonctionne partout : reseaux sociaux, sites web, presentations, emails. Le format carre (1:1) est optimise pour Instagram et les feeds LinkedIn. Le format portrait (9:16) est parfait pour TikTok, Reels et Stories. Choisissez le format adapte a votre canal de diffusion avant d'exporter.

Pour la distribution sur les reseaux sociaux, quelques bonnes pratiques. Sur LinkedIn, privilegiez des videos de 1 a 2 minutes avec un message professionnel et un appel a l'action clair. Ajoutez des sous-titres car 85% des utilisateurs regardent sans le son. Sur Instagram, les Reels de 30 a 60 secondes en format portrait performent le mieux. Utilisez des hooks percutants dans les 3 premieres secondes.

Pour integrer l'avatar sur votre site web, Freenzy genere un code d'integration (embed) que vous copiez-collez dans votre page. L'avatar peut apparaitre en widget flottant (coin inferieur droit), en hero banner (pleine largeur en haut de page) ou en section dediee. Le widget flottant est le plus populaire : il attire l'attention sans etre intrusif. \u{1F4BB}

Pour l'integration email, exportez votre video en GIF anime (3-5 secondes) comme apercu cliquable. Le GIF s'affiche directement dans l'email et redirige vers la video complete sur votre site. Le taux de clic des emails avec GIF anime est en moyenne 26% superieur.

Enfin, pensez a organiser votre bibliotheque de videos. Nommez chaque video clairement (date + sujet + format), creez des dossiers par campagne ou par type de contenu, et supprimez les versions obsoletes. Une bibliotheque bien rangee accelere votre production future. \u{1F4C1}

Vous voila pret a deployer votre avatar partout ou votre audience se trouve !`,
          xpReward: 25,
        },
        {
          id: 'av-m6-l2',
          title: 'Exercice : Publier votre video',
          duration: '5 min',
          type: 'exercise',
          content: 'Exportez et preparez la publication de votre video avatar.',
          exercisePrompt: 'Exportez la video creee au module 4 en format MP4 1080p. Puis redigez un post LinkedIn de 3-4 lignes pour accompagner la video (hook accrocheur + contexte + appel a l\'action). Demandez a l\'assistant Communication (fz-communication) de vous aider a optimiser le texte du post. Sauvegardez le post et la video dans un dossier "Avatar - Campagne 1".',
          xpReward: 30,
        },
        {
          id: 'av-m6-l3',
          title: 'Quiz final : Publication et integration',
          duration: '4 min',
          type: 'quiz',
          content: 'Derniere evaluation avant d\'obtenir votre diplome Avatar Creator !',
          quizQuestions: [
            {
              question: 'Quel format video est optimise pour TikTok et Instagram Reels ?',
              options: ['16:9 paysage', '1:1 carre', '9:16 portrait', '4:3 classique'],
              correctIndex: 2,
              explanation: 'Le format portrait 9:16 est optimise pour TikTok, Instagram Reels et Stories.',
            },
            {
              question: 'Pourquoi ajouter des sous-titres aux videos LinkedIn ?',
              options: [
                'C\'est obligatoire sur LinkedIn',
                '85% des utilisateurs regardent sans le son',
                'Pour ameliorer le SEO de la video',
                'Les sous-titres sont generes automatiquement',
              ],
              correctIndex: 1,
              explanation: '85% des utilisateurs LinkedIn regardent les videos sans le son. Les sous-titres garantissent que votre message est compris.',
            },
            {
              question: 'Quel type d\'integration avatar est le plus populaire sur un site web ?',
              options: [
                'Hero banner pleine largeur',
                'Page dediee cachee',
                'Widget flottant en coin inferieur droit',
                'Pop-up en plein ecran',
              ],
              correctIndex: 2,
              explanation: 'Le widget flottant en coin inferieur droit est le plus populaire : il attire l\'attention sans etre intrusif.',
            },
            {
              question: 'Comment integrer un avatar dans un email ?',
              options: [
                'Coller la video directement dans le corps de l\'email',
                'Envoyer la video en piece jointe',
                'Utiliser un GIF anime comme apercu cliquable vers la video complete',
                'Les avatars ne fonctionnent pas dans les emails',
              ],
              correctIndex: 2,
              explanation: 'Un GIF anime de 3-5 secondes dans l\'email sert d\'apercu et redirige vers la video complete, augmentant le taux de clic de 26%.',
            },
            {
              question: 'Quelle bonne pratique d\'organisation est recommandee pour la bibliotheque de videos ?',
              options: [
                'Tout mettre dans un seul dossier',
                'Nommer clairement (date + sujet + format) et creer des dossiers par campagne',
                'Ne rien supprimer, meme les versions obsoletes',
                'Renommer les videos avec des numeros aleatoires',
              ],
              correctIndex: 1,
              explanation: 'Nommer clairement chaque video et organiser par campagne accelere la production future et evite les doublons.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F680}',
      badgeName: 'Distributeur',
    },
  ],
  diplomaTitle: 'Avatar Creator',
  diplomaSubtitle: 'Maitrise de la creation d\'avatars IA : visage, voix, animation et publication',
  totalDuration: '1h38',
  totalXP: 600,
  color: '#F472B6',
  available: true,
};

// ---------------------------------------------------------------------------
// PARCOURS 2 — Maitriser le Chat IA
// ---------------------------------------------------------------------------

export const parcoursChatIA: FormationParcours = {
  id: 'chat-ia-niv1',
  title: 'Maitriser le Chat IA',
  emoji: '\u{1F4AC}',
  description: 'Apprenez a utiliser le chat IA efficacement : conversations, memoire, personnalisation et astuces avancees.',
  category: 'ia',
  subcategory: 'chat',
  level: 'debutant',
  levelLabel: 'Debutant',
  modules: [
    // -----------------------------------------------------------------------
    // Module 1 — Les bases du chat IA
    // -----------------------------------------------------------------------
    {
      id: 'ch-m1',
      title: 'Les bases du chat IA',
      emoji: '\u{1F4AD}',
      description: 'Comprenez comment fonctionne un chat IA et ce qu\'il peut faire pour vous.',
      duration: '15 min',
      lessons: [
        {
          id: 'ch-m1-l1',
          title: 'Comment fonctionne un chat IA',
          duration: '6 min',
          type: 'text',
          content: `Bienvenue dans cette formation sur le chat IA ! \u{1F44B} Avant de foncer dans la pratique, prenons un instant pour comprendre comment fonctionne cette technologie qui change tout.

Un chat IA est un systeme de conversation base sur un grand modele de langage (LLM). Sur Freenzy, nous utilisons les modeles Claude d'Anthropic, parmi les plus avances au monde. Quand vous envoyez un message, le modele analyse votre texte, comprend votre intention et genere une reponse pertinente en temps reel.

Ce qui rend le chat IA impressionnant, c'est sa polyvalence. Il peut rediger un email professionnel, analyser un contrat juridique, creer un plan marketing, resoudre un probleme mathematique, expliquer un concept complexe ou simplement converser avec vous. Tout cela dans la meme interface, en quelques secondes.

Le chat IA n'est cependant pas magique. Il a des forces et des limites qu'il faut connaitre. Ses forces : comprehension du contexte, capacite a suivre des instructions complexes, creativite dans la redaction, analyse de textes longs et adaptation au ton demande. Ses limites : il peut occasionnellement se tromper (surtout sur les chiffres precis), il n'a pas acces a Internet en temps reel et ses connaissances ont une date de coupure. \u{26A0}\u{FE0F}

Sur Freenzy, le chat est enrichi par le systeme d'agents specialises. Chaque agent possede un "system prompt" qui lui donne une expertise specifique. L'agent Commercial connait les techniques de vente, l'agent Juridique maitrise le droit francais, l'agent Marketing sait rediger du contenu viral. Vous ne parlez pas a un chatbot generique — vous echangez avec un expert de domaine.

Le chat fonctionne en streaming : la reponse s'affiche mot par mot au fur et a mesure qu'elle est generee. Cela permet de commencer a lire avant meme que la reponse soit terminee. Si la direction ne vous convient pas, vous pouvez interrompre et reformuler.

Pret a maitriser cet outil puissant ? Passons a la pratique ! \u{1F4AA}`,
          xpReward: 20,
        },
        {
          id: 'ch-m1-l2',
          title: 'L\'interface de chat Freenzy',
          duration: '5 min',
          type: 'text',
          content: `Maintenant que vous comprenez le principe, decouvrons l'interface de chat de Freenzy en detail. \u{1F50D}

L'ecran de chat est divise en trois zones principales. En haut, la barre de conversation affiche le nom de l'agent avec lequel vous discutez, son emoji et un indicateur de statut (actif, en reflexion, en generation). Vous pouvez cliquer sur le nom de l'agent pour voir sa fiche complete et ses capacites.

Au centre, la zone de messages affiche votre conversation. Vos messages apparaissent a droite avec un fond leger, les reponses de l'agent apparaissent a gauche. Chaque message affiche un horodatage et un compteur de credits consommes. Les messages longs incluent un bouton "Copier" pour recuperer le texte d'un clic.

En bas, la zone de saisie vous permet de taper votre message. Elle s'agrandit automatiquement quand vous ecrivez un long texte. Le bouton "Envoyer" (ou la touche Entree) lance la generation. Shift+Entree permet de faire un retour a la ligne sans envoyer.

Quelques fonctionnalites pratiques a connaitre. Le bouton "Nouveau chat" en haut a droite demarre une conversation vierge — utile quand vous changez de sujet. L'historique de vos conversations est sauvegarde et accessible depuis la sidebar. Vous pouvez rechercher dans vos anciens messages par mot-cle.

Le selecteur d'agent vous permet de changer d'expert en cours de conversation. Commencez avec l'assistant General pour une question large, puis basculez vers l'assistant Juridique si la reponse necessite une expertise legale. Le contexte de la conversation est preserve lors du changement. \u{1F504}

Enfin, le mode "Deep Discussion" (accessible depuis la sidebar) offre une experience de conversation approfondie avec le modele le plus puissant (Claude Opus). C'est ideal pour les reflexions strategiques, philosophiques ou creatives qui necessitent un raisonnement avance.`,
          xpReward: 20,
        },
        {
          id: 'ch-m1-l3',
          title: 'Quiz : Les fondamentaux du chat IA',
          duration: '4 min',
          type: 'quiz',
          content: 'Verifiez que vous maitrisez les bases du chat IA.',
          quizQuestions: [
            {
              question: 'Quel type de modele IA propulse le chat Freenzy ?',
              options: [
                'Un moteur de recherche Google',
                'Un grand modele de langage (LLM) Claude d\'Anthropic',
                'Un chatbot base sur des regles pre-ecrites',
                'Un systeme de reconnaissance vocale',
              ],
              correctIndex: 1,
              explanation: 'Freenzy utilise les modeles Claude d\'Anthropic, des LLM parmi les plus avances au monde.',
            },
            {
              question: 'Que signifie le "streaming" dans le contexte du chat ?',
              options: [
                'La video en direct',
                'La reponse s\'affiche mot par mot en temps reel',
                'Le chat fonctionne uniquement en wifi',
                'Les messages sont diffuses en direct sur les reseaux sociaux',
              ],
              correctIndex: 1,
              explanation: 'Le streaming signifie que la reponse s\'affiche progressivement, mot par mot, au fur et a mesure de sa generation.',
            },
            {
              question: 'Quel raccourci permet de faire un retour a la ligne sans envoyer le message ?',
              options: ['Entree', 'Ctrl+Entree', 'Shift+Entree', 'Alt+Entree'],
              correctIndex: 2,
              explanation: 'Shift+Entree cree un retour a la ligne dans la zone de saisie. Entree seul envoie le message.',
            },
            {
              question: 'Quelle est une limitation connue des chats IA ?',
              options: [
                'Ils ne comprennent que l\'anglais',
                'Ils ne fonctionnent que la nuit',
                'Ils peuvent occasionnellement se tromper, surtout sur les chiffres precis',
                'Ils ne peuvent pas generer plus de 10 mots',
              ],
              correctIndex: 2,
              explanation: 'Les LLM peuvent parfois se tromper (hallucinations), particulierement sur les donnees chiffrees precises. Il est important de verifier les informations critiques.',
            },
            {
              question: 'Qu\'est-ce qui differencie les agents Freenzy d\'un chatbot generique ?',
              options: [
                'Rien, c\'est pareil',
                'Chaque agent possede un system prompt lui donnant une expertise specifique',
                'Les agents sont uniquement disponibles en version payante',
                'Les agents repondent uniquement par email',
              ],
              correctIndex: 1,
              explanation: 'Chaque agent Freenzy possede un system prompt specialise qui lui donne une expertise de domaine (commercial, juridique, marketing, etc.).',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 70,
      badgeEmoji: '\u{1F4AD}',
      badgeName: 'Initie Chat',
    },

    // -----------------------------------------------------------------------
    // Module 2 — Conversations efficaces
    // -----------------------------------------------------------------------
    {
      id: 'ch-m2',
      title: 'Conversations efficaces',
      emoji: '\u{1F3AF}',
      description: 'Apprenez a formuler vos messages pour obtenir les meilleures reponses.',
      duration: '17 min',
      lessons: [
        {
          id: 'ch-m2-l1',
          title: 'L\'art de bien demander',
          duration: '7 min',
          type: 'text',
          content: `La qualite de la reponse depend directement de la qualite de votre demande. C'est la regle d'or du chat IA : garbage in, garbage out — ou plutot, precision in, excellence out ! \u{1F3AF}

Le piege le plus courant est d'etre trop vague. "Ecris-moi un email" donnera un resultat generique. "Ecris un email de relance pour un prospect B2B qui n'a pas repondu a notre devis de 5 000 euros envoye il y a 10 jours, ton professionnel mais chaleureux, avec un appel a l'action clair" donnera un resultat exploitable immediatement.

Voici la methode CQFO pour formuler une bonne demande. C pour Contexte : donnez le cadre (qui etes-vous, quelle est la situation). Q pour Question/Objectif : soyez precis sur ce que vous attendez. F pour Format : indiquez le format souhaite (liste, paragraphe, tableau, email). O pour Ouverture : laissez de la place pour que l'IA apporte sa valeur ajoutee.

Exemples concrets. Mauvais : "Parle-moi du SEO." Bon : "Je suis proprietaire d'une boulangerie a Lyon. Donne-moi 5 actions SEO locales concretes que je peux mettre en place cette semaine, classees par impact decroissant, avec le temps estime pour chacune."

Mauvais : "Fais un post LinkedIn." Bon : "Redige un post LinkedIn de 200 mots max pour annoncer le lancement de mon service de coaching IA. Ton enthousiaste mais credible. Inclus un hook accrocheur, 3 benefices cles et un appel a l'action vers mon site web."

N'hesitez pas a preciser ce que vous ne voulez PAS : "Pas de jargon technique", "Pas de liste a puces, je veux un texte fluide", "Evite le ton corporate". Ces contraintes negatives affinent considerablement le resultat. \u{1F6AB}

Dernier conseil : si la premiere reponse n'est pas parfaite, ne recommencez pas de zero. Ajustez en disant "C'est bien mais rends le ton plus decontracte" ou "Raccourcis de moitie et ajoute des exemples". L'IA s'ameliore avec les retours iteratifs, c'est sa grande force.`,
          xpReward: 25,
        },
        {
          id: 'ch-m2-l2',
          title: 'Exercice : Reformuler pour ameliorer',
          duration: '6 min',
          type: 'exercise',
          content: 'Pratiquez la formulation de demandes precises et efficaces.',
          exercisePrompt: 'Lancez un chat avec l\'assistant General. Envoyez d\'abord une demande vague : "Aide-moi avec mon business." Observez la reponse generique. Puis reformulez avec la methode CQFO : precisez votre secteur, votre objectif specifique, le format souhaite et ce que vous attendez comme valeur ajoutee. Comparez les deux reponses et notez la difference de qualite.',
          xpReward: 35,
        },
        {
          id: 'ch-m2-l3',
          title: 'Quiz : Formuler de bonnes demandes',
          duration: '4 min',
          type: 'quiz',
          content: 'Evaluez votre capacite a formuler des demandes efficaces.',
          quizQuestions: [
            {
              question: 'Que signifie le C dans la methode CQFO ?',
              options: ['Creativite', 'Contexte', 'Comprehension', 'Conclusion'],
              correctIndex: 1,
              explanation: 'Le C signifie Contexte : donnez le cadre de votre demande (qui vous etes, quelle est la situation).',
            },
            {
              question: 'Quelle demande donnera la meilleure reponse ?',
              options: [
                '"Ecris un email"',
                '"Fais quelque chose de bien"',
                '"Ecris un email de relance B2B, ton professionnel, avec appel a l\'action"',
                '"Email"',
              ],
              correctIndex: 2,
              explanation: 'Plus la demande est precise (contexte, ton, objectif), meilleure sera la reponse de l\'IA.',
            },
            {
              question: 'Que faire si la premiere reponse n\'est pas parfaite ?',
              options: [
                'Recommencer une nouvelle conversation',
                'Ajuster avec des retours iteratifs (ton, longueur, style)',
                'Abandonner et ecrire soi-meme',
                'Changer de plateforme',
              ],
              correctIndex: 1,
              explanation: 'L\'IA s\'ameliore avec les retours iteratifs. Dites "rends le ton plus decontracte" ou "raccourcis de moitie" pour affiner.',
            },
            {
              question: 'A quoi servent les contraintes negatives ("Pas de jargon", "Evite le ton corporate") ?',
              options: [
                'Elles n\'ont aucun effet',
                'Elles embrouillent l\'IA',
                'Elles affinent considerablement le resultat',
                'Elles augmentent le cout en credits',
              ],
              correctIndex: 2,
              explanation: 'Les contraintes negatives eliminent les elements indesirables et affinent le resultat vers exactement ce que vous voulez.',
            },
            {
              question: 'Que signifie "garbage in, garbage out" dans le contexte du chat IA ?',
              options: [
                'L\'IA produit des dechets',
                'Il faut supprimer les vieux messages',
                'La qualite de la reponse depend de la qualite de la demande',
                'Le chat supprime automatiquement les mauvais messages',
              ],
              correctIndex: 2,
              explanation: 'Si vous formulez une demande vague, la reponse sera generique. Une demande precise produit une reponse de qualite.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F3AF}',
      badgeName: 'Communicateur',
    },

    // -----------------------------------------------------------------------
    // Module 3 — Multi-tours et memoire
    // -----------------------------------------------------------------------
    {
      id: 'ch-m3',
      title: 'Multi-tours et memoire',
      emoji: '\u{1F9E0}',
      description: 'Exploitez la memoire contextuelle pour des conversations riches et coherentes.',
      duration: '16 min',
      lessons: [
        {
          id: 'ch-m3-l1',
          title: 'La puissance du contexte',
          duration: '7 min',
          type: 'text',
          content: `L'un des super-pouvoirs du chat IA est sa memoire contextuelle : il se souvient de tout ce qui a ete dit dans la conversation en cours. C'est ce qu'on appelle le "multi-tours". \u{1F504}

Concretement, quand vous posez une question de suivi comme "Peux-tu developper le point 3 ?", l'IA sait exactement de quel point 3 vous parlez parce qu'elle a en memoire l'integralite de votre echange precedent. C'est ce qui rend la conversation naturelle et productive.

Pour exploiter au maximum cette memoire contextuelle, construisez vos conversations de maniere progressive. Commencez par poser le contexte general : "Je lance un e-commerce de bijoux artisanaux, cible femmes 25-45 ans, budget marketing de 500 euros/mois." Puis affinez progressivement : "Quels canaux privilegier ?", "Detaille la strategie Instagram", "Redige le plan de contenu du premier mois."

Cette approche en entonnoir est bien plus efficace que de tout demander d'un coup. L'IA construit une comprehension de plus en plus fine de votre situation a chaque echange, et ses reponses gagnent en pertinence et en personnalisation au fil de la conversation.

Attention a la notion de fenetre de contexte. \u{26A0}\u{FE0F} Chaque modele IA a une limite de memoire (mesuree en "tokens"). Pour Claude sur Freenzy, cette fenetre est tres large (200 000 tokens, soit environ 150 000 mots). En pratique, vous pouvez tenir des conversations tres longues sans que l'IA perde le fil. Mais sur des echanges extremement longs, les premiers messages peuvent perdre en influence.

Astuce pro : si votre conversation devient tres longue et que vous sentez que l'IA perd le contexte initial, faites un resume. Dites : "Recapitulons : nous travaillons sur X avec les contraintes Y et les decisions prises Z. Continuons a partir de la." Ce rappel reancre le contexte et relance la conversation sur de bonnes bases.

N'oubliez pas que chaque nouvelle conversation demarre avec une memoire vierge. Les informations d'un chat ne sont pas transferees a un autre. Si vous reprenez un sujet le lendemain, rappeler le contexte est essentiel.`,
          xpReward: 25,
        },
        {
          id: 'ch-m3-l2',
          title: 'Exercice : Conversation en entonnoir',
          duration: '5 min',
          type: 'exercise',
          content: 'Pratiquez la technique de conversation progressive.',
          exercisePrompt: 'Lancez un chat avec l\'assistant Marketing (fz-marketing). Message 1 : posez le contexte de votre activite en 2-3 phrases. Message 2 : demandez une analyse de votre cible. Message 3 : demandez de developper le point le plus pertinent. Message 4 : demandez un plan d\'action concret base sur toute la discussion. Observez comment la qualite des reponses augmente a chaque tour.',
          xpReward: 35,
        },
        {
          id: 'ch-m3-l3',
          title: 'Quiz : Memoire et contexte',
          duration: '4 min',
          type: 'quiz',
          content: 'Testez votre comprehension de la memoire contextuelle.',
          quizQuestions: [
            {
              question: 'Que signifie "multi-tours" dans le contexte du chat IA ?',
              options: [
                'L\'IA peut repondre plusieurs fois de suite',
                'L\'IA se souvient de toute la conversation en cours',
                'L\'IA peut parler a plusieurs utilisateurs en meme temps',
                'L\'IA fait plusieurs tentatives pour repondre',
              ],
              correctIndex: 1,
              explanation: 'Le multi-tours signifie que l\'IA conserve en memoire l\'integralite de la conversation et peut y faire reference.',
            },
            {
              question: 'Quelle est la technique de l\'entonnoir ?',
              options: [
                'Tout demander dans un seul message',
                'Commencer par le contexte general puis affiner progressivement',
                'Poser la meme question plusieurs fois',
                'Ecrire des messages de plus en plus courts',
              ],
              correctIndex: 1,
              explanation: 'La technique de l\'entonnoir consiste a poser le contexte general, puis affiner etape par etape pour obtenir des reponses de plus en plus precises.',
            },
            {
              question: 'Que faire si l\'IA semble perdre le contexte initial lors d\'une longue conversation ?',
              options: [
                'Recommencer completement',
                'Ecrire en majuscules pour attirer l\'attention',
                'Faire un resume recapitulatif pour reancrer le contexte',
                'Changer d\'agent',
              ],
              correctIndex: 2,
              explanation: 'Un resume recapitulatif (sujet, contraintes, decisions prises) reancre le contexte et relance la conversation efficacement.',
            },
            {
              question: 'Les informations d\'une conversation sont-elles transferees a une autre ?',
              options: [
                'Oui, toujours',
                'Oui, si c\'est le meme agent',
                'Non, chaque nouvelle conversation demarre avec une memoire vierge',
                'Oui, pendant 24 heures',
              ],
              correctIndex: 2,
              explanation: 'Chaque nouvelle conversation demarre avec une memoire vierge. Il faut rappeler le contexte si vous reprenez un sujet.',
            },
            {
              question: 'Quelle est approximativement la fenetre de contexte de Claude sur Freenzy ?',
              options: [
                '1 000 mots',
                '10 000 mots',
                '150 000 mots (200K tokens)',
                'Illimitee',
              ],
              correctIndex: 2,
              explanation: 'Claude dispose d\'une fenetre de 200 000 tokens (environ 150 000 mots), permettant des conversations tres longues.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F9E0}',
      badgeName: 'Memorisateur',
    },

    // -----------------------------------------------------------------------
    // Module 4 — Chat professionnel
    // -----------------------------------------------------------------------
    {
      id: 'ch-m4',
      title: 'Chat professionnel',
      emoji: '\u{1F4BC}',
      description: 'Utilisez le chat IA pour des taches business concretes.',
      duration: '17 min',
      lessons: [
        {
          id: 'ch-m4-l1',
          title: 'Cas d\'usage professionnels',
          duration: '7 min',
          type: 'text',
          content: `Le chat IA est un outil de productivite redoutable quand on sait l'utiliser dans un contexte professionnel. Voici les cas d'usage les plus courants et comment en tirer le maximum. \u{1F4BC}

Redaction d'emails. L'assistant redige des emails professionnels en quelques secondes : relances commerciales, reponses clients, communications internes, cold emails. Donnez le contexte, le ton souhaite et l'objectif — il fait le reste. Astuce : demandez-lui de generer 3 variantes pour choisir la meilleure.

Analyse de documents. Copiez-collez un contrat, un rapport ou un brief dans le chat et demandez une analyse. "Resume ce contrat en 10 points cles", "Identifie les clauses risquees", "Compare avec les standards du secteur". L'agent Juridique excelle dans cette tache pour les documents legaux.

Creation de contenu. Posts LinkedIn, articles de blog, scripts video, newsletters, communiques de presse — l'assistant genere du contenu sur mesure. Precisez toujours votre cible, le ton, la longueur et l'objectif. L'agent Marketing produit un contenu plus engageant, l'agent Communication un contenu plus institutionnel.

Brainstorming structure. Quand vous avez besoin d'idees, le chat est un partenaire ideal. "Donne-moi 20 idees de contenu pour mon restaurant sur Instagram", "Propose 5 noms pour mon nouveau service de coaching". Demandez ensuite d'evaluer chaque idee selon vos criteres (cout, impact, faisabilite). \u{1F4A1}

Preparation de reunions. Avant une reunion importante, demandez a l'assistant de preparer un ordre du jour structure, de lister les questions potentielles et de preparer des reponses aux objections previsibles. Apres la reunion, dictez vos notes et demandez un compte-rendu structure avec actions et responsables.

Chaque cas d'usage est optimise quand vous choisissez le bon agent. L'agent Commercial pour les emails de vente, le Juridique pour les contrats, le Marketing pour le contenu, le RH pour les offres d'emploi. L'expertise du system prompt fait une vraie difference par rapport a un assistant generique. \u{1F3AF}`,
          xpReward: 25,
        },
        {
          id: 'ch-m4-l2',
          title: 'Exercice : Email professionnel avance',
          duration: '6 min',
          type: 'exercise',
          content: 'Creez un email professionnel complet avec l\'aide du chat IA.',
          exercisePrompt: 'Avec l\'assistant Commercial (fz-commercial), redigez un email de relance pour un prospect qui n\'a pas repondu a votre proposition. Fournissez le contexte : montant du devis, service propose, delai depuis l\'envoi. Demandez 3 variantes (formelle, chaleureuse, directe). Choisissez la meilleure et demandez a l\'agent de l\'optimiser avec un objet d\'email accrocheur et un PS strategique.',
          xpReward: 35,
        },
        {
          id: 'ch-m4-l3',
          title: 'Quiz : Chat business',
          duration: '4 min',
          type: 'quiz',
          content: 'Evaluez votre maitrise du chat IA en contexte professionnel.',
          quizQuestions: [
            {
              question: 'Quel agent est le plus adapte pour analyser un contrat ?',
              options: [
                'L\'agent Marketing',
                'L\'agent Juridique',
                'L\'agent Commercial',
                'L\'agent RH',
              ],
              correctIndex: 1,
              explanation: 'L\'agent Juridique possede un system prompt specialise dans l\'analyse legale et l\'identification des clauses risquees.',
            },
            {
              question: 'Quelle astuce ameliore la redaction d\'emails par l\'IA ?',
              options: [
                'Demander un seul email generique',
                'Ne pas preciser le contexte pour laisser l\'IA libre',
                'Demander 3 variantes pour choisir la meilleure',
                'Ecrire l\'email soi-meme et demander juste la ponctuation',
              ],
              correctIndex: 2,
              explanation: 'Demander plusieurs variantes (formelle, chaleureuse, directe) permet de comparer et choisir le ton le plus adapte.',
            },
            {
              question: 'Que peut faire l\'IA pour preparer une reunion ?',
              options: [
                'Uniquement prendre des notes',
                'Preparer l\'ordre du jour, anticiper les questions et preparer les reponses aux objections',
                'Remplacer les participants',
                'Envoyer les invitations',
              ],
              correctIndex: 1,
              explanation: 'L\'IA prepare l\'ordre du jour structure, anticipe les questions et redige des reponses aux objections previsibles.',
            },
            {
              question: 'Pourquoi choisir un agent specialise plutot que l\'assistant general ?',
              options: [
                'C\'est moins cher en credits',
                'L\'assistant general ne fonctionne pas',
                'Le system prompt specialise apporte une expertise de domaine',
                'Les agents specialises sont plus rapides',
              ],
              correctIndex: 2,
              explanation: 'Chaque agent possede un system prompt qui lui confere une expertise specifique, produisant des resultats plus pertinents que l\'assistant generique.',
            },
            {
              question: 'Comment optimiser un brainstorming avec l\'IA ?',
              options: [
                'Demander une seule idee a la fois',
                'Demander beaucoup d\'idees puis evaluer selon ses criteres (cout, impact, faisabilite)',
                'Ne pas donner de contexte pour plus de creativite',
                'Copier les idees d\'un concurrent',
              ],
              correctIndex: 1,
              explanation: 'Demandez beaucoup d\'idees d\'abord, puis faites evaluer chacune selon vos criteres specifiques pour filtrer les meilleures.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 90,
      badgeEmoji: '\u{1F4BC}',
      badgeName: 'Pro du Chat',
    },

    // -----------------------------------------------------------------------
    // Module 5 — Personnaliser son assistant
    // -----------------------------------------------------------------------
    {
      id: 'ch-m5',
      title: 'Personnaliser son assistant',
      emoji: '\u{2699}\u{FE0F}',
      description: 'Adaptez les assistants a votre style et vos besoins specifiques.',
      duration: '16 min',
      lessons: [
        {
          id: 'ch-m5-l1',
          title: 'Adapter l\'assistant a vos besoins',
          duration: '7 min',
          type: 'text',
          content: `La personnalisation est ce qui transforme un bon assistant en VOTRE assistant. Sur Freenzy, vous avez plusieurs leviers pour adapter le chat a votre facon de travailler. \u{2699}\u{FE0F}

Premier levier : le message d'amorce. Au debut de chaque conversation, posez les bases : "Je suis Sophie, consultante en strategie digitale pour les PME. Mon ton est professionnel mais accessible. Je privilegie les exemples concrets et les plans d'action chiffres." Ce preambule calibre l'IA pour toute la conversation — plus besoin de repeter ces informations a chaque message.

Deuxieme levier : les instructions persistantes. Dans vos parametres Freenzy (section "Preferences IA"), vous pouvez definir des instructions qui s'appliqueront automatiquement a toutes vos conversations. Par exemple : "Toujours repondre en francais", "Utiliser le tutoiement", "Structurer les reponses avec des titres et des listes", "Limiter les reponses a 300 mots sauf demande contraire".

Troisieme levier : le choix du modele. Freenzy propose trois niveaux de modele. Haiku (L1) est ultra-rapide pour les taches simples (reformulation, traduction, questions factuelles). Sonnet (L2) est le meilleur rapport qualite-vitesse pour la redaction et l'analyse. Opus (L3) est le plus puissant pour la strategie et la reflexion profonde. Choisir le bon niveau optimise a la fois la qualite et votre consommation de credits. \u{1F4B0}

Quatrieme levier : les templates de conversation. Freenzy propose des templates pre-configures pour les taches recurrentes : "Rediger un email de relance", "Analyser un concurrent", "Creer un post LinkedIn". Chaque template pre-remplit le contexte et les instructions, vous n'avez plus qu'a personnaliser les details specifiques.

Cinquieme levier : les favoris. Marquez les assistants que vous utilisez le plus comme favoris — ils apparaitront en priorite dans votre sidebar pour un acces rapide. Vous pouvez egalement creer des raccourcis vers des conversations-types que vous relancez regulierement.

En combinant ces cinq leviers, vous creez un environnement de travail sur mesure qui comprend votre contexte, parle votre langage et repond exactement a vos attentes. C'est la difference entre utiliser un outil generique et avoir un assistant qui vous connait. \u{1F48E}`,
          xpReward: 25,
        },
        {
          id: 'ch-m5-l2',
          title: 'Exercice : Configurer ses preferences',
          duration: '5 min',
          type: 'exercise',
          content: 'Personnalisez vos preferences IA pour optimiser votre experience.',
          exercisePrompt: 'Rendez-vous dans les parametres de votre compte (section "Preferences IA"). Definissez vos instructions persistantes : votre role professionnel, le ton prefere, la langue, la longueur par defaut des reponses et 2-3 contraintes specifiques a votre activite. Puis lancez un chat avec l\'assistant General et verifiez que vos preferences sont prises en compte automatiquement.',
          xpReward: 30,
        },
        {
          id: 'ch-m5-l3',
          title: 'Quiz : Personnalisation',
          duration: '4 min',
          type: 'quiz',
          content: 'Verifiez votre maitrise des options de personnalisation.',
          quizQuestions: [
            {
              question: 'A quoi sert le message d\'amorce en debut de conversation ?',
              options: [
                'A saluer poliment l\'IA',
                'A calibrer le contexte et le ton pour toute la conversation',
                'A activer le mode premium',
                'A choisir la langue de l\'interface',
              ],
              correctIndex: 1,
              explanation: 'Le message d\'amorce pose les bases (role, ton, attentes) et calibre l\'IA pour l\'ensemble de la conversation.',
            },
            {
              question: 'Ou definit-on les instructions persistantes ?',
              options: [
                'Dans chaque message individuellement',
                'Dans les parametres, section "Preferences IA"',
                'En contactant le support',
                'C\'est impossible a configurer',
              ],
              correctIndex: 1,
              explanation: 'Les instructions persistantes se configurent dans les parametres du compte, section "Preferences IA".',
            },
            {
              question: 'Quel modele est recommande pour une reflexion strategique approfondie ?',
              options: [
                'Haiku (L1) — ultra-rapide',
                'Sonnet (L2) — equilibre',
                'Opus (L3) — le plus puissant',
                'Tous sont equivalents pour la strategie',
              ],
              correctIndex: 2,
              explanation: 'Opus (L3) est le modele le plus puissant, ideal pour la strategie, la reflexion profonde et les analyses complexes.',
            },
            {
              question: 'Quel est l\'avantage des templates de conversation ?',
              options: [
                'Ils sont obligatoires pour utiliser le chat',
                'Ils pre-remplissent le contexte et les instructions pour les taches recurrentes',
                'Ils sont uniquement disponibles en anglais',
                'Ils augmentent la vitesse de connexion',
              ],
              correctIndex: 1,
              explanation: 'Les templates pre-configurent le contexte pour les taches recurrentes (relance, analyse, post), ne laissant que les details specifiques a completer.',
            },
            {
              question: 'Combien de leviers de personnalisation sont presentes dans cette lecon ?',
              options: ['2', '3', '5', '10'],
              correctIndex: 2,
              explanation: 'Les 5 leviers sont : message d\'amorce, instructions persistantes, choix du modele, templates de conversation et favoris.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{2699}\u{FE0F}',
      badgeName: 'Configurateur',
    },

    // -----------------------------------------------------------------------
    // Module 6 — Astuces avancees
    // -----------------------------------------------------------------------
    {
      id: 'ch-m6',
      title: 'Astuces avancees',
      emoji: '\u{1F48E}',
      description: 'Techniques de pro pour exploiter le chat IA a son plein potentiel.',
      duration: '16 min',
      lessons: [
        {
          id: 'ch-m6-l1',
          title: 'Techniques de power user',
          duration: '7 min',
          type: 'text',
          content: `Vous maitrisez maintenant les bases et l'usage professionnel du chat IA. Place aux techniques avancees qui feront de vous un veritable power user ! \u{1F48E}

Technique 1 : le role-play. Demandez a l'IA de jouer un role specifique pour simuler des situations. "Tu es un investisseur exigeant. Je vais te pitcher mon projet en 2 minutes. Pose-moi les questions les plus difficiles apres." C'est un entrainement incroyable pour les presentations, les entretiens d'embauche ou les negociations.

Technique 2 : la chaine de pensee. Pour les problemes complexes, demandez a l'IA de raisonner etape par etape. "Analyse cette situation en procedant methodiquement : d'abord identifie les causes, puis les consequences, puis les solutions, et enfin ta recommandation." Cette approche produit des analyses beaucoup plus rigoureuses et structurees.

Technique 3 : le multi-perspective. Demandez a l'IA d'analyser un sujet sous differents angles. "Analyse cette decision du point de vue du client, du concurrent, de l'employe et de l'investisseur." Cette technique revele des angles morts que vous n'auriez pas vus seul et enrichit votre reflexion. \u{1F50D}

Technique 4 : le format impose. L'IA peut produire du contenu dans n'importe quel format. Tableau comparatif, FAQ, script video, thread Twitter, checklist, matrice SWOT, persona marketing, fiche produit. Nommez le format et l'IA s'y adapte. "Presente cette analyse sous forme de matrice SWOT en 4 quadrants."

Technique 5 : le batch processing. Au lieu de faire 10 demandes separees, regroupez. "Genere 5 objets d'email pour cette campagne, 5 hooks LinkedIn et 5 call-to-action, le tout dans un tableau avec une colonne par type." Vous gagnez du temps et des credits en une seule requete intelligente. \u{26A1}

Technique 6 : le feedback constructif. Quand la reponse est bonne mais pas parfaite, soyez precis dans vos retours. Au lieu de "Ce n'est pas bien", dites "Le deuxieme paragraphe est trop technique pour ma cible. Remplace le jargon par des analogies du quotidien et ajoute un exemple concret." Plus votre feedback est actionnable, meilleure sera la correction.

Bonus : les Deep Discussions de Freenzy utilisent le modele Opus avec Extended Thinking. C'est le mode ideal pour les questions strategiques, philosophiques ou creatives qui demandent un raisonnement profond. L'IA "reflechit" plus longtemps mais produit des analyses d'une qualite exceptionnelle.`,
          xpReward: 25,
        },
        {
          id: 'ch-m6-l2',
          title: 'Exercice : Role-play strategique',
          duration: '5 min',
          type: 'exercise',
          content: 'Pratiquez les techniques avancees avec un exercice de simulation.',
          exercisePrompt: 'Lancez un chat avec l\'assistant DG (fz-dg). Demandez-lui de jouer le role d\'un investisseur potentiel pour votre projet. Presentez votre idee en 3-4 phrases, puis repondez aux questions difficiles qu\'il vous pose. Apres 3 echanges, demandez-lui de sortir du role et d\'evaluer votre pitch avec des conseils d\'amelioration. Notez les 3 points les plus utiles.',
          xpReward: 35,
        },
        {
          id: 'ch-m6-l3',
          title: 'Quiz final : Techniques avancees',
          duration: '4 min',
          type: 'quiz',
          content: 'Derniere evaluation avant d\'obtenir votre diplome AI Conversationalist !',
          quizQuestions: [
            {
              question: 'A quoi sert la technique du role-play avec l\'IA ?',
              options: [
                'A jouer a des jeux video',
                'A simuler des situations (pitch, negociation, entretien) pour s\'entrainer',
                'A changer la voix de l\'assistant',
                'A creer un avatar',
              ],
              correctIndex: 1,
              explanation: 'Le role-play permet de simuler des situations reelles (investisseur, client difficile, recruteur) pour s\'entrainer sans risque.',
            },
            {
              question: 'Que produit la technique de la "chaine de pensee" ?',
              options: [
                'Une liste de liens internet',
                'Des analyses plus rigoureuses et structurees etape par etape',
                'Un chat plus rapide',
                'Une conversation plus courte',
              ],
              correctIndex: 1,
              explanation: 'Demander un raisonnement etape par etape (causes, consequences, solutions, recommandation) produit des analyses plus rigoureuses.',
            },
            {
              question: 'Quel est l\'avantage du batch processing ?',
              options: [
                'Ca augmente la qualite de chaque reponse',
                'Ca permet de regrouper plusieurs demandes en une seule requete, economisant temps et credits',
                'Ca debloque des fonctionnalites premium',
                'Ca accelere la connexion internet',
              ],
              correctIndex: 1,
              explanation: 'Le batch processing regroupe plusieurs demandes (emails, hooks, CTA) en une seule requete, economisant du temps et des credits.',
            },
            {
              question: 'Comment donner un feedback efficace a l\'IA ?',
              options: [
                'Dire simplement "Ce n\'est pas bien"',
                'Etre precis : identifier le probleme exact et indiquer la correction souhaitee',
                'Recommencer une nouvelle conversation',
                'Utiliser uniquement des emojis',
              ],
              correctIndex: 1,
              explanation: 'Un feedback actionnable ("le paragraphe 2 est trop technique, utilise des analogies") produit une correction precise et rapide.',
            },
            {
              question: 'Quel mode Freenzy utilise Extended Thinking pour des reflexions profondes ?',
              options: [
                'Le chat standard',
                'Les notifications push',
                'Les Deep Discussions (modele Opus)',
                'Le mode hors-ligne',
              ],
              correctIndex: 2,
              explanation: 'Les Deep Discussions utilisent le modele Opus avec Extended Thinking, ideal pour les questions strategiques et les raisonnements profonds.',
            },
          ],
          xpReward: 30,
        },
      ],
      passingScore: 60,
      xpReward: 85,
      badgeEmoji: '\u{1F48E}',
      badgeName: 'Power User',
    },
  ],
  diplomaTitle: 'AI Conversationalist',
  diplomaSubtitle: 'Maitrise du chat IA : conversations efficaces, contexte, personnalisation et techniques avancees',
  totalDuration: '1h37',
  totalXP: 600,
  color: '#06B6D4',
  available: true,
};
