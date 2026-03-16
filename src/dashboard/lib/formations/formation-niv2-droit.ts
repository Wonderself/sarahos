import type { FormationParcours } from './formation-data';

/* =============================================================================
   PARCOURS NIV.2 — Droit de l'IA : Guide Complet
   Tout le cadre juridique de l'IA : IA Act, droits d'auteur, deepfakes,
   RGPD avance, contrats et jurisprudence.
   6 modules x 3 lecons = 18 lecons | 1h | 750 XP
   ============================================================================= */

export const parcoursDroitIANiv2: FormationParcours = {
  id: 'droit-ia-niv2',
  title: 'Droit de l\'IA — Guide Complet',
  emoji: '\u2696\uFE0F',
  description: 'Maitrisez tout le cadre juridique de l\'IA : IA Act europeen, droits d\'auteur sur les contenus generes, deepfakes, RGPD avance, contrats et jurisprudence reelle. Indispensable pour utiliser l\'IA sans risques legaux.',
  category: 'securite',
  subcategory: 'droit-ia',
  level: 'avance',
  levelLabel: 'Avance',
  diplomaTitle: 'IA Legal Expert',
  diplomaSubtitle: 'Cadre juridique complet de l\'intelligence artificielle',
  totalDuration: '1h',
  totalXP: 750,
  color: '#EF4444',
  available: true,
  comingSoon: false,
  modules: [

    /* =====================================================================
       MODULE 1 — IA Act europeen en pratique
       ===================================================================== */
    {
      id: 'droit-ia-m1',
      title: 'IA Act europeen en pratique',
      emoji: '\uD83C\uDDEA\uD83C\uDDFA',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m1-l1',
          type: 'text' as const,
          title: 'Classification des risques et obligations par niveau',
          duration: '4 min',
          xp: 30,
          content: `L'IA Act est LE texte de reference en Europe depuis son adoption definitive en 2024. Si vous utilisez de l'IA dans votre activite, il vous concerne directement \u2014 et il est beaucoup plus simple a comprendre qu'on ne le pense \uD83D\uDE09

\uD83D\uDCCA Le systeme de classification par risques

L'IA Act classe tous les systemes d'IA en 4 niveaux de risque. Chaque niveau entraine des obligations differentes :

Risque inacceptable (interdit) \u274C : C'est le niveau le plus strict. Sont completement interdits : le scoring social a la chinoise, la manipulation subliminale, la reconnaissance faciale en temps reel dans l'espace public (sauf exceptions policieres tres encadrees), et l'exploitation des vulnerabilites (cibler des personnes agees ou des enfants). Si vous faites ca, c'est jusqu'a 35 millions d'euros d'amende ou 7% du CA mondial.

Haut risque \u26A0\uFE0F : Concerne les systemes IA utilises dans le recrutement, l'education, la sante, la justice, le credit bancaire, les infrastructures critiques. Obligations lourdes : documentation technique, evaluation de conformite, controle humain obligatoire, logging des decisions, enregistrement dans la base EU.

Risque limite \uD83D\uDFE1 : Les chatbots, les deepfakes, les contenus generes par IA. Obligation principale : la transparence. Vous devez informer l'utilisateur qu'il interagit avec une IA ou que le contenu a ete genere par IA. C'est le niveau qui concerne la majorite des utilisateurs de Freenzy.

Risque minimal \u2705 : Filtres anti-spam, jeux video, IA dans les appareils electromenagers. Aucune obligation specifique, juste le droit commun.

\uD83D\uDCC5 Calendrier d'application

L'IA Act s'applique progressivement : les interdictions sont en vigueur depuis fevrier 2025, les obligations de transparence depuis aout 2025, et les regles sur le haut risque s'appliquent a partir d'aout 2026. Les PME ont un delai supplementaire d'un an pour certaines obligations. Les « sandboxes reglementaires » permettent de tester des systemes IA innovants dans un cadre supervise avant mise sur le marche.`
        },
        {
          id: 'droit-ia-m1-l2',
          type: 'text' as const,
          title: 'Ce que ca change concretement pour les PME',
          duration: '3 min',
          xp: 25,
          content: `OK, l'IA Act c'est bien joli, mais concretement, qu'est-ce que ca change pour VOUS si vous etes une PME, un freelance ou un entrepreneur ? \uD83E\uDD14

\uD83D\uDCBC Impact reel au quotidien

La bonne nouvelle : la plupart des usages courants de l'IA (chatbots, generation de texte, creation d'images, automatisation d'emails) tombent dans la categorie « risque limite » ou « risque minimal ». Vous n'avez pas besoin de monter un dossier de 200 pages.

Ce que vous DEVEZ faire \uD83D\uDC47

1. Transparence obligatoire : Si vous utilisez un chatbot IA pour repondre a vos clients (par exemple via Freenzy), vous devez informer vos clients qu'ils parlent a une IA. Un simple message « Cet assistant est alimente par l'IA » suffit. Freenzy le fait automatiquement pour vous \u2705

2. Etiquetage des contenus generes : Si vous publiez des images ou des textes generes par IA, ils doivent etre identifies comme tels. Sur les reseaux sociaux, ajoutez une mention « Image generee par IA ». Pour les articles, une note en bas de page est recommandee.

3. Pas de manipulation : Vos prompts et vos systemes ne doivent pas etre concus pour tromper ou manipuler les utilisateurs. Pas de faux avis, pas de faux temoignages, pas de deep fakes de personnalites sans consentement.

4. Conservation des logs : Gardez une trace de vos interactions avec l'IA pendant au moins 6 mois. Freenzy conserve automatiquement l'historique de vos conversations \u2014 vous etes deja conforme.

Ce que vous n'avez PAS besoin de faire (si vous etes en risque limite) : pas d'audit de conformite, pas de certification, pas de DPO specifique IA, pas de sandbox reglementaire. Respirez \uD83D\uDE0C

\u26A0\uFE0F Attention cependant : si vous utilisez l'IA pour le recrutement, le scoring de clients, ou des decisions automatisees impactant des personnes, vous basculez en « haut risque » et les obligations sont beaucoup plus lourdes. Dans ce cas, consultez un avocat specialise.`
        },
        {
          id: 'droit-ia-m1-l3',
          type: 'quiz' as const,
          title: 'Quiz — IA Act europeen',
          duration: '3 min',
          xp: 70,
          content: 'Verifiez que vous maitrisez les bases de l\'IA Act europeen.',
          questions: [
            {
              question: 'Quel est le montant maximum d\'amende pour un systeme IA a risque inacceptable ?',
              options: ['10 millions d\'euros', '20 millions d\'euros', '35 millions d\'euros ou 7% du CA mondial', '50 millions d\'euros'],
              correctIndex: 2,
              explanation: 'L\'IA Act prevoit jusqu\'a 35 millions d\'euros ou 7% du chiffre d\'affaires mondial pour les infractions les plus graves (systemes IA interdits).'
            },
            {
              question: 'Dans quelle categorie de risque tombe un chatbot IA comme ceux de Freenzy ?',
              options: ['Risque inacceptable', 'Haut risque', 'Risque limite', 'Risque minimal'],
              correctIndex: 2,
              explanation: 'Les chatbots IA sont classes en « risque limite ». L\'obligation principale est la transparence : informer l\'utilisateur qu\'il interagit avec une IA.'
            },
            {
              question: 'Quelle est l\'obligation principale pour les systemes IA a risque limite ?',
              options: ['Certification obligatoire', 'Audit annuel', 'Transparence (informer l\'utilisateur)', 'Controle humain permanent'],
              correctIndex: 2,
              explanation: 'La transparence est l\'obligation cle du risque limite : l\'utilisateur doit savoir qu\'il interagit avec une IA ou que le contenu est genere par IA.'
            },
            {
              question: 'Depuis quand les interdictions de l\'IA Act sont-elles en vigueur ?',
              options: ['Aout 2024', 'Fevrier 2025', 'Aout 2025', 'Fevrier 2026'],
              correctIndex: 1,
              explanation: 'Les interdictions (risque inacceptable) sont en vigueur depuis fevrier 2025. Les obligations de transparence suivent en aout 2025, et le haut risque en aout 2026.'
            },
            {
              question: 'Un systeme IA utilise pour le recrutement est classe dans quel niveau de risque ?',
              options: ['Risque minimal', 'Risque limite', 'Haut risque', 'Risque inacceptable'],
              correctIndex: 2,
              explanation: 'Le recrutement fait partie des domaines classes « haut risque » par l\'IA Act, avec des obligations renforcees (documentation, controle humain, audit).'
            }
          ]
        }
      ]
    },

    /* =====================================================================
       MODULE 2 — Droit d'auteur et IA
       ===================================================================== */
    {
      id: 'droit-ia-m2',
      title: 'Droit d\'auteur et IA',
      emoji: '\u00A9\uFE0F',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m2-l1',
          type: 'text' as const,
          title: 'Qui est l\'auteur d\'un contenu IA ?',
          duration: '4 min',
          xp: 30,
          content: `C'est LA question a 1 million d'euros \uD83D\uDCB0 : quand une IA genere un texte, une image, de la musique ou du code... qui est l'auteur ? Qui detient les droits ? Qui peut l'exploiter commercialement ?

\uD83D\uDCDD Textes generes par IA

En droit francais et europeen, le droit d'auteur protege les \u0153uvres de l'esprit qui portent l'empreinte de la personnalite de leur auteur. Or, une IA n'a pas de personnalite juridique. Resultat : un texte genere a 100% par IA, sans intervention creative humaine, n'est PAS protege par le droit d'auteur. N'importe qui peut le copier.

En revanche, si vous utilisez l'IA comme un outil et que vous apportez une contribution creative significative (choix du sujet, structuration, reformulation, selection...), le texte final PEUT etre protege. Vous etes alors considere comme l'auteur. La cle, c'est la « direction creative humaine ».

\uD83C\uDFA8 Images generees par IA

Meme logique pour les images. Le US Copyright Office a refuse d'enregistrer les images de « Zarya of the Dawn » generees par Midjourney, tout en acceptant le copyright sur la selection et l'arrangement des images dans le livre. En Europe, la position est similaire : l'image brute generee par IA seule n'est probablement pas protegeable.

Cependant, si vous creez un prompt tres detaille, faites de multiples iterations, retouchez l'image, l'integrez dans une composition originale \u2014 votre contribution creative peut justifier une protection. C'est du cas par cas, et la jurisprudence est encore en construction.

\uD83C\uDFB5 Musique et audio IA

La musique generee par IA pose les memes questions, avec une couche supplementaire : les modeles sont souvent entraines sur de la musique protegee. Si la sortie ressemble trop a une oeuvre existante, vous risquez une contrefacon meme sans l'avoir voulu. Les labels Universal, Sony et Warner ont deja attaque plusieurs services de musique IA.

\uD83D\uDCBB Code genere par IA

Le code est traite comme une oeuvre litteraire en droit d'auteur. GitHub Copilot a fait l'objet d'un class action aux USA pour avoir reproduit du code sous licence open-source sans respecter les termes. En pratique, le code genere par IA peut etre utilise, mais verifiez qu'il ne reproduit pas mot pour mot du code sous licence restrictive (GPL notamment).

\u2696\uFE0F La regle d'or : plus votre contribution creative est importante, plus vos droits sont solides. Utilisez l'IA comme un outil, pas comme un auteur \u2014 et documentez votre processus creatif.`
        },
        {
          id: 'droit-ia-m2-l2',
          type: 'text' as const,
          title: 'Images IA : Flux, DALL-E, Midjourney — droits et limites',
          duration: '4 min',
          xp: 30,
          content: `Vous adorez generer des images avec l'IA ? Nous aussi \uD83C\uDFA8 Mais avant de les utiliser dans vos supports commerciaux, il y a des regles a connaitre. Chaque plateforme a ses propres conditions, et les pieges sont reels.

\uD83D\uDD25 Flux (fal.ai) — Ce qu'utilise Freenzy

Flux (le modele de Black Forest Labs utilise par Freenzy via fal.ai) a des conditions assez permissives. Les images generees peuvent etre utilisees a des fins commerciales. Vous avez une licence d'utilisation large. Attention cependant : le modele Flux/schnell (rapide) et Flux/dev ont des licences differentes. Schnell est sous licence Apache 2.0 (tres permissive), tandis que dev est sous licence non-commerciale. Freenzy utilise schnell, donc vous etes tranquille pour l'usage commercial \u2705

\uD83C\uDF08 DALL-E (OpenAI)

OpenAI accorde les droits commerciaux sur toutes les images generees par DALL-E 3, y compris pour les utilisateurs gratuits depuis janvier 2024. Vous pouvez vendre, imprimer, utiliser en publicite. Limite importante : vous ne pouvez pas pretendre que l'image est une photo reelle, et vous devez respecter les politiques d'usage (pas de violence, pas de contenu sexuel, pas d'usurpation d'identite).

\uD83C\uDF0C Midjourney

Midjourney accorde une licence commerciale aux abonnes payants. Les utilisateurs du plan gratuit (quand il existe) n'ont PAS de droits commerciaux. Attention au « ownership » : Midjourney conserve une licence d'utilisation sur vos creations (ils peuvent les afficher dans leur galerie publique). Si vous etes une entreprise avec plus de 1M$ de revenus annuels, vous devez souscrire au plan Pro ou Mega.

\uD83D\uDEA8 Les pieges communs a eviter

1. Droit a l'image : Meme si l'IA genere un visage « fictif », s'il ressemble a une personne reelle identifiable, vous pouvez avoir des problemes. Evitez de generer des visages realistes de personnes existantes.

2. Marques et logos : Les modeles IA peuvent generer des images contenant des logos ou marques reconnaissables. Verifiez toujours qu'aucune marque protegee n'apparait dans vos images.

3. Style d'artiste : Generer « dans le style de [artiste vivant] » est juridiquement risque. Plusieurs artistes ont lance des poursuites (Karla Ortiz, Sarah Andersen...). Preferez des descriptions stylistiques generiques.

4. Datasets d'entrainement : Certains modeles ont ete entraines sur des images protegees par le droit d'auteur. C'est le debat au coeur de Getty vs Stability AI. En tant qu'utilisateur final, votre risque est limite, mais il n'est pas nul.

\uD83D\uDCA1 Conseil pratique : gardez toujours une trace de vos prompts et de la plateforme utilisee. En cas de litige, pouvoir prouver votre processus de creation est un atout majeur.`
        },
        {
          id: 'droit-ia-m2-l3',
          type: 'quiz' as const,
          title: 'Quiz — Droit d\'auteur et IA',
          duration: '2 min',
          xp: 65,
          content: 'Testez vos connaissances sur le droit d\'auteur applique aux contenus generes par IA.',
          questions: [
            {
              question: 'Un texte genere a 100% par IA sans intervention humaine est-il protege par le droit d\'auteur en Europe ?',
              options: ['Oui, automatiquement', 'Oui, si on declare l\'IA comme auteur', 'Non, il n\'est pas protegeable', 'Ca depend du pays'],
              correctIndex: 2,
              explanation: 'En droit europeen, le droit d\'auteur exige une empreinte de la personnalite de l\'auteur. Une IA n\'ayant pas de personnalite juridique, un contenu 100% IA n\'est pas protege.'
            },
            {
              question: 'Quel modele d\'image IA utilise par Freenzy a une licence Apache 2.0 (commerciale) ?',
              options: ['DALL-E 3', 'Midjourney v6', 'Flux/schnell', 'Stable Diffusion XL'],
              correctIndex: 2,
              explanation: 'Flux/schnell est sous licence Apache 2.0, tres permissive et compatible avec l\'usage commercial. C\'est le modele utilise par Freenzy via fal.ai.'
            },
            {
              question: 'Generer une image « dans le style de [artiste vivant] » est juridiquement...',
              options: ['Totalement legal', 'Risque — plusieurs artistes ont lance des poursuites', 'Interdit par l\'IA Act', 'Autorise si on cite l\'artiste'],
              correctIndex: 1,
              explanation: 'Plusieurs artistes (Karla Ortiz, Sarah Andersen...) ont lance des poursuites contre des services IA pour appropriation de leur style. C\'est un terrain juridiquement risque.'
            },
            {
              question: 'Quelle est la « regle d\'or » pour proteger un contenu genere avec l\'IA ?',
              options: ['Deposer le contenu a l\'INPI', 'Apporter une contribution creative humaine significative', 'Utiliser un modele open-source', 'Publier en premier'],
              correctIndex: 1,
              explanation: 'Plus votre contribution creative est importante (direction artistique, selection, retouche), plus vos droits d\'auteur sont solides sur le resultat final.'
            },
            {
              question: 'Les utilisateurs gratuits de Midjourney ont-ils des droits commerciaux sur leurs images ?',
              options: ['Oui, les memes que les payants', 'Oui, mais limites', 'Non, pas de droits commerciaux', 'Seulement pour un usage personnel'],
              correctIndex: 2,
              explanation: 'Midjourney n\'accorde les droits commerciaux qu\'aux abonnes payants. Les utilisateurs du plan gratuit n\'ont pas de licence commerciale.'
            }
          ]
        }
      ]
    },

    /* =====================================================================
       MODULE 3 — Video IA et deepfakes
       ===================================================================== */
    {
      id: 'droit-ia-m3',
      title: 'Video IA et deepfakes',
      emoji: '\uD83C\uDFAC',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m3-l1',
          type: 'text' as const,
          title: 'Cadre legal des videos IA, avatars et voix synthetiques',
          duration: '4 min',
          xp: 30,
          content: `La video generee par IA explose : Runway, Sora, Kling, LTX Video... et avec D-ID ou HeyGen, on peut creer des avatars parlants ultra-realistes. Mais le cadre legal est strict, et les sanctions sont lourdes \uD83C\uDFAC

\uD83E\uDDD1\u200D\uD83D\uDCBB Avatars IA et droit a l'image

Creer un avatar numerique a partir de votre propre visage et voix ? Aucun probleme, c'est votre droit. Mais creer un avatar a partir du visage ou de la voix d'une AUTRE personne sans son consentement explicite ? C'est une violation du droit a l'image, punissable d'un an d'emprisonnement et 45 000 euros d'amende en France (article 226-1 du Code penal).

Le consentement doit etre : ecrit, specifique (pour quel usage), limite dans le temps, et revocable. Un simple « oui oral » ne suffit pas. Si vous creez des avatars pour votre entreprise avec les visages de vos collaborateurs, faites signer une autorisation en bonne et due forme.

\uD83C\uDF99\uFE0F Voix synthetiques et clonage vocal

Le clonage vocal est l'un des sujets les plus sensibles. En France, la voix est un attribut de la personnalite, protege au meme titre que l'image. Cloner la voix de quelqu'un sans autorisation, c'est illegal, meme pour un usage « inoffensif ».

ElevenLabs (utilise par Freenzy pour le TTS) impose d'ailleurs des conditions strictes : vous devez avoir le consentement explicite de la personne dont vous clonez la voix, et vous devez pouvoir le prouver. L'utilisation de voix de celebrites est interdite sauf accord ecrit.

En 2024, la FTC americaine a lance des actions contre des entreprises utilisant des voix clonees de celebrites dans des publicites. La tendance est clairement au durcissement.

\uD83C\uDFA5 Videos generees : obligations de transparence

L'IA Act classe les videos generees par IA dans le « risque limite » avec obligation de transparence. Concretement, si vous publiez une video generee ou modifiee par IA, vous DEVEZ le mentionner de maniere visible. Pas en petit caractere cache : de maniere « claire, distincte et lisible ».

Pour les videos commerciales (publicites, presentations), la recommandation est d'inclure un watermark ou une mention « Contenu genere par IA » au debut de la video. Les plateformes (YouTube, TikTok, Instagram) ont d'ailleurs toutes ajoute des labels « AI-generated content » obligatoires depuis 2024.

\u2696\uFE0F En resume : votre visage, votre voix = votre droit. Le visage/voix d'autrui = consentement ecrit obligatoire. Et tout contenu video IA = transparence obligatoire.`
        },
        {
          id: 'droit-ia-m3-l2',
          type: 'text' as const,
          title: 'Deepfakes : ce qui est interdit, ce qui est autorise',
          duration: '3 min',
          xp: 25,
          content: `Les deepfakes fascinent et inquietent a la fois. Faisons le point sur ce qui est legal et ce qui peut vous envoyer devant un tribunal \uD83D\uDC68\u200D\u2696\uFE0F

\u274C Ce qui est INTERDIT

1. Deepfake pornographique : Creer ou diffuser un deepfake a caractere sexuel d'une personne sans son consentement est un delit en France depuis la loi SREN de 2024. Peine : jusqu'a 2 ans de prison et 60 000 euros d'amende. Si la victime est mineure, les peines sont doublees.

2. Deepfake pour fraude : Utiliser un deepfake pour usurper l'identite de quelqu'un (appel video, message vocal) a des fins de fraude est puni au titre de l'escroquerie (5 ans, 375 000 euros) et de l'usurpation d'identite (1 an, 15 000 euros).

3. Manipulation electorale : Les deepfakes de candidats politiques visant a manipuler une election sont interdits par l'IA Act et les legislations nationales. La France a renforce ce cadre avant les elections europeennes de 2024.

4. Harcelement : Utiliser des deepfakes pour harceler une personne constitue un delit de harcelement aggrave.

\u2705 Ce qui est AUTORISE (sous conditions)

1. Parodie et satire : Les deepfakes parodiques sont proteges par la liberte d'expression, a condition que le caractere humoristique soit evident et qu'il n'y ait pas de volonte de nuire. Les emissions comme « Les Guignols » version IA sont legales.

2. Art et creation : Les deepfakes artistiques sont autorises dans un cadre creatif, avec mention qu'il s'agit d'une creation IA. Plusieurs artistes contemporains utilisent cette technique legalement.

3. Education et recherche : Utiliser des deepfakes dans un contexte educatif (demonstration, formation comme celle-ci !) est autorise.

4. Usage personnel prive : Creer un deepfake pour un usage strictement prive, sans diffusion, est tolere.

\uD83D\uDEA8 Sanctions recentes

En 2024-2025, les premieres condamnations sont tombees en France : un homme condamne a 18 mois de prison pour des deepfakes pornographiques non consentis, une entreprise sanctionnee de 150 000 euros pour un deepfake publicitaire utilisant l'image d'une celebrite sans autorisation. L'IA Act prevoit des amendes allant jusqu'a 15 millions d'euros pour non-respect des obligations de transparence sur les deepfakes.

\uD83D\uDCA1 Regle simple : si ca implique le visage ou la voix d'une vraie personne, il faut son consentement ecrit. Si c'est pour tromper, c'est interdit. Si c'est transparent et creatif, c'est possible.`
        },
        {
          id: 'droit-ia-m3-l3',
          type: 'quiz' as const,
          title: 'Quiz — Video IA et deepfakes',
          duration: '3 min',
          xp: 70,
          content: 'Verifiez que vous connaissez le cadre legal des videos IA et des deepfakes.',
          questions: [
            {
              question: 'Creer un avatar IA avec le visage d\'un collegue sans son consentement ecrit est...',
              options: ['Legal si c\'est pour l\'entreprise', 'Legal si on ne le diffuse pas publiquement', 'Illegal — violation du droit a l\'image', 'Legal si on le previent a l\'oral'],
              correctIndex: 2,
              explanation: 'Le droit a l\'image exige un consentement ecrit, specifique et limite dans le temps. Un simple accord oral ne suffit pas.'
            },
            {
              question: 'Quelle est la peine maximale pour un deepfake pornographique non consenti en France ?',
              options: ['Amende de 10 000 euros', '6 mois de prison', '2 ans de prison et 60 000 euros d\'amende', '5 ans de prison'],
              correctIndex: 2,
              explanation: 'La loi SREN de 2024 punit la creation ou diffusion de deepfakes pornographiques non consentis de 2 ans de prison et 60 000 euros d\'amende.'
            },
            {
              question: 'Un deepfake parodique est-il legal ?',
              options: ['Non, tous les deepfakes sont interdits', 'Oui, si le caractere humoristique est evident et sans volonte de nuire', 'Seulement a la television', 'Oui, sans aucune condition'],
              correctIndex: 1,
              explanation: 'La parodie et la satire sont protegees par la liberte d\'expression, a condition que le caractere humoristique soit clair et qu\'il n\'y ait pas de volonte de nuire.'
            },
            {
              question: 'Que doit-on faire obligatoirement quand on publie une video generee par IA ?',
              options: ['Rien de special', 'Deposer un copyright', 'Mentionner de maniere visible que c\'est genere par IA', 'Obtenir une autorisation du gouvernement'],
              correctIndex: 2,
              explanation: 'L\'IA Act impose une obligation de transparence : les videos generees par IA doivent etre clairement identifiees comme telles lors de leur publication.'
            }
          ]
        }
      ]
    },

    /* =====================================================================
       MODULE 4 — RGPD avance : DPO pratique
       ===================================================================== */
    {
      id: 'droit-ia-m4',
      title: 'RGPD avance : DPO pratique',
      emoji: '\uD83D\uDD12',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m4-l1',
          type: 'text' as const,
          title: 'Registre de traitement et AIPD',
          duration: '4 min',
          xp: 30,
          content: `Vous connaissez les bases du RGPD ? Parfait. Maintenant, on passe au niveau superieur : les outils concrets du DPO (Delegue a la Protection des Donnees) \uD83D\uDD12

\uD83D\uDCCB Le registre des activites de traitement

C'est LE document central de votre conformite RGPD. L'article 30 du RGPD impose a toute organisation de tenir un registre listant tous les traitements de donnees personnelles. Et oui, utiliser l'IA pour traiter des donnees clients, c'est un traitement \uD83D\uDE09

Votre registre doit contenir, pour chaque traitement :
- La finalite (pourquoi vous traitez ces donnees)
- Les categories de donnees concernees (noms, emails, historique d'achat...)
- Les destinataires (qui y a acces, y compris les sous-traitants IA)
- Les transferts hors UE (attention si votre IA tourne sur des serveurs US !)
- Les durees de conservation
- Les mesures de securite

Quand vous utilisez Freenzy, vos donnees sont hebergees en EU (Hetzner) \u2014 c'est un point de conformite important. Mais si vous connectez d'autres outils IA (ChatGPT, Claude directement, etc.), verifiez ou sont stockees les donnees.

\uD83D\uDCCA L'AIPD (Analyse d'Impact relative a la Protection des Donnees)

L'AIPD (ou DPIA en anglais) est obligatoire quand un traitement est « susceptible d'engendrer un risque eleve pour les droits et libertes des personnes ». L'utilisation de l'IA pour des decisions automatisees affectant des individus declenche quasi-systematiquement cette obligation.

Une AIPD doit contenir :
1. Description du traitement : quelles donnees, quelle IA, quel objectif
2. Necessite et proportionnalite : pourquoi l'IA est necessaire, et pourquoi ces donnees specifiques
3. Risques identifies : biais algorithmiques, fuites de donnees, decisions erronees
4. Mesures d'attenuation : anonymisation, controle humain, droit d'opposition

La CNIL a publie un guide specifique « IA et AIPD » en 2024 avec des modeles prets a l'emploi. Pour une PME, une AIPD peut se faire en quelques heures si vous utilisez ces modeles.

\u26A0\uFE0F Cas declencheurs d'AIPD lies a l'IA :
- Profilage de clients avec scoring automatique
- Analyse de CV par IA pour le recrutement
- Surveillance des employes par IA
- Traitement de donnees de sante par IA
- Chatbot collectant des donnees sensibles

\uD83D\uDCA1 Astuce : meme si votre usage IA ne declenche pas formellement une AIPD, en realiser une volontairement montre votre bonne foi en cas de controle CNIL. C'est un investissement de quelques heures qui peut vous eviter des milliers d'euros d'amende.`
        },
        {
          id: 'droit-ia-m4-l2',
          type: 'exercise' as const,
          title: 'Exercice — Analyse d\'impact de votre usage IA',
          duration: '4 min',
          xp: 50,
          content: 'Mettez en pratique la theorie : realisez une mini-AIPD sur votre propre usage de l\'IA.',
          exercisePrompt: `Realisez une analyse d'impact simplifiee (mini-AIPD) de votre utilisation de l'IA dans votre activite professionnelle. Suivez ce plan :

1. Decrivez votre usage principal de l'IA (quel outil, quelles donnees, quel objectif)
2. Identifiez les categories de donnees personnelles traitees
3. Listez 3 risques potentiels pour les personnes concernees
4. Proposez une mesure d'attenuation pour chaque risque
5. Evaluez le niveau de risque global (faible, moyen, eleve)

L'assistant vous guidera etape par etape et vous donnera un feedback personnalise sur votre analyse.`
        },
        {
          id: 'droit-ia-m4-l3',
          type: 'quiz' as const,
          title: 'Quiz — RGPD et IA',
          duration: '2 min',
          xp: 45,
          content: 'Testez vos connaissances RGPD avancees appliquees a l\'IA.',
          questions: [
            {
              question: 'Le registre des activites de traitement est impose par quel article du RGPD ?',
              options: ['Article 5', 'Article 13', 'Article 30', 'Article 83'],
              correctIndex: 2,
              explanation: 'L\'article 30 du RGPD impose a tout responsable de traitement de tenir un registre listant l\'ensemble des traitements de donnees personnelles.'
            },
            {
              question: 'Quand une AIPD est-elle obligatoire en lien avec l\'IA ?',
              options: ['Pour tout usage d\'IA', 'Quand le traitement presente un risque eleve pour les personnes', 'Seulement pour les entreprises de plus de 250 salaries', 'Jamais, c\'est facultatif'],
              correctIndex: 1,
              explanation: 'L\'AIPD est obligatoire quand un traitement est susceptible d\'engendrer un risque eleve pour les droits et libertes des personnes, ce qui inclut les decisions automatisees par IA.'
            },
            {
              question: 'Ou sont hebergees les donnees Freenzy ?',
              options: ['AWS USA', 'Google Cloud Japon', 'Hetzner EU', 'Azure France'],
              correctIndex: 2,
              explanation: 'Les donnees Freenzy sont hebergees chez Hetzner en Europe, assurant la conformite RGPD sur la localisation des donnees.'
            },
            {
              question: 'Quel element n\'est PAS requis dans un registre de traitement ?',
              options: ['La finalite du traitement', 'Les categories de donnees', 'Le chiffre d\'affaires de l\'entreprise', 'Les durees de conservation'],
              correctIndex: 2,
              explanation: 'Le registre doit contenir la finalite, les categories de donnees, les destinataires, les transferts et les mesures de securite. Le chiffre d\'affaires n\'en fait pas partie.'
            }
          ]
        }
      ]
    },

    /* =====================================================================
       MODULE 5 — Contrats et IA
       ===================================================================== */
    {
      id: 'droit-ia-m5',
      title: 'Contrats et IA',
      emoji: '\uD83D\uDCDD',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m5-l1',
          type: 'text' as const,
          title: 'Clauses IA dans les contrats : responsabilite et sous-traitance',
          duration: '4 min',
          xp: 30,
          content: `Quand vous utilisez l'IA dans un cadre professionnel, vos contrats doivent le refleter. Que ce soit avec vos clients, vos fournisseurs ou vos prestataires \u2014 l'IA change la donne contractuelle \uD83D\uDCDD

\uD83E\uDD1D Clauses IA essentielles dans vos contrats clients

1. Clause de transparence IA : Informez vos clients que vous utilisez l'IA dans la realisation de vos prestations. « Le prestataire pourra utiliser des outils d'intelligence artificielle pour assister la realisation des livrables. Le controle qualite final est assure par un intervenant humain. » Simple, clair, honnete.

2. Clause de propriete intellectuelle : Precisez qui detient les droits sur les contenus generes avec l'IA. Recommandation : « Les livrables produits a l'aide d'outils IA sont la propriete du client des leur livraison. Le prestataire ne conserve aucun droit d'exploitation. » Attention : si le contenu IA n'est pas protegeable par le droit d'auteur (voir Module 2), cette clause a une portee limitee.

3. Clause de confidentialite IA : Precisez que les donnees du client ne seront pas utilisees pour entrainer des modeles IA. « Les donnees confiees par le client ne sont jamais transmises a des modeles IA d'entrainement. Les outils IA utilises fonctionnent avec des API qui ne conservent pas les donnees au-dela de la session. »

4. Clause de responsabilite : L'IA peut generer des erreurs. Limitez votre responsabilite : « Les contenus generes par IA sont systematiquement verifies par un humain. Le prestataire ne saurait etre tenu responsable des imprecisions inherentes aux technologies d'IA generative. »

\uD83D\uDD17 Sous-traitance et RGPD

Si vous utilisez des API IA (OpenAI, Anthropic, ElevenLabs...), ces fournisseurs sont vos sous-traitants au sens du RGPD. Vous devez :
- Verifier qu'ils ont un DPA (Data Processing Agreement) — tous les grands fournisseurs en proposent un
- S'assurer qu'ils ne conservent pas les donnees au-dela du necessaire
- Verifier les transferts hors UE et les garanties associees (clauses contractuelles types)

Anthropic (utilise par Freenzy) a un DPA solide et ne conserve pas les donnees des appels API pour l'entrainement. C'est un critere de choix important.

\u26A0\uFE0F Erreur courante : beaucoup d'entreprises utilisent des IA en mode « gratuit » (ChatGPT free tier, Gemini...) pour traiter des donnees clients. Probleme : les versions gratuites utilisent souvent les donnees pour l'entrainement. Utilisez TOUJOURS les versions API ou business qui garantissent la non-utilisation des donnees.`
        },
        {
          id: 'droit-ia-m5-l2',
          type: 'text' as const,
          title: 'CGU et mentions legales quand on utilise l\'IA',
          duration: '3 min',
          xp: 25,
          content: `Vos CGU et mentions legales doivent etre a jour si vous utilisez l'IA dans vos services. C'est pas la partie la plus fun, mais c'est indispensable \uD83D\uDE05

\uD83D\uDCC4 Mettre a jour vos CGU

Si votre site ou service utilise de l'IA (chatbot, generation de contenu, recommandations...), vos CGU doivent mentionner :

1. L'utilisation de l'IA : « Notre service utilise des technologies d'intelligence artificielle pour [decrire l'usage]. Ces technologies assistent nos equipes mais ne remplacent pas le jugement humain. »

2. Les limites de l'IA : « Les contenus generes par intelligence artificielle peuvent contenir des inexactitudes. Nous recommandons de verifier les informations importantes aupres de sources officielles. »

3. Les donnees et l'IA : « Les donnees personnelles collectees ne sont pas utilisees pour entrainer des modeles d'intelligence artificielle. Nos outils IA fonctionnent via des API securisees conformes au RGPD. »

4. Le droit d'opposition : « Conformement au RGPD, vous disposez d'un droit d'opposition au traitement automatise de vos donnees. Contactez-nous a [email] pour exercer ce droit. »

\uD83D\uDCCB Mentions legales specifiques IA

Depuis l'IA Act, les mentions legales doivent aussi inclure :
- L'identification des systemes IA utilises (nom, fournisseur)
- Le niveau de risque au sens de l'IA Act
- Les coordonnees d'un point de contact pour les questions liees a l'IA

Pour un site e-commerce utilisant un chatbot IA, ca donne : « Ce site utilise un assistant conversationnel alimente par [Freenzy.io / Anthropic Claude]. Ce systeme est classe "risque limite" au sens du Reglement IA europeen. Pour toute question relative a l'utilisation de l'IA : [email]. »

\uD83D\uDCA1 Checklist rapide pour etre conforme

\u2705 CGU mentionnent l'utilisation de l'IA
\u2705 Limites de l'IA clairement indiquees
\u2705 Donnees non utilisees pour l'entrainement
\u2705 Droit d'opposition mentionne
\u2705 Mentions legales identifient les systemes IA
\u2705 Point de contact IA indique
\u2705 Politique de confidentialite a jour

Si vous cochez tout ca, vous etes dans les regles. Et surtout, vous inspirez confiance a vos clients \u2014 la transparence est toujours un avantage competitif \uD83D\uDC4D`
        },
        {
          id: 'droit-ia-m5-l3',
          type: 'quiz' as const,
          title: 'Quiz — Contrats et IA',
          duration: '3 min',
          xp: 70,
          content: 'Verifiez vos connaissances sur les aspects contractuels de l\'utilisation de l\'IA.',
          questions: [
            {
              question: 'Quand vous utilisez une API IA pour traiter des donnees clients, le fournisseur IA est considere comme...',
              options: ['Un responsable de traitement', 'Un sous-traitant au sens du RGPD', 'Un tiers non concerne', 'Un co-responsable'],
              correctIndex: 1,
              explanation: 'Les fournisseurs d\'API IA sont des sous-traitants au sens du RGPD. Vous devez verifier leur DPA et les garanties de protection des donnees.'
            },
            {
              question: 'Pourquoi est-il risque d\'utiliser ChatGPT en version gratuite pour des donnees clients ?',
              options: ['C\'est plus lent', 'Les reponses sont moins bonnes', 'Les donnees peuvent etre utilisees pour l\'entrainement', 'Il n\'y a aucun risque'],
              correctIndex: 2,
              explanation: 'Les versions gratuites de nombreux outils IA utilisent les donnees pour entrainer leurs modeles. Les versions API/business offrent des garanties de non-utilisation.'
            },
            {
              question: 'Que doivent mentionner vos CGU si vous utilisez un chatbot IA ?',
              options: ['Rien de special', 'Le prix de l\'IA utilisee', 'L\'utilisation de l\'IA, ses limites et le droit d\'opposition', 'Le code source de l\'IA'],
              correctIndex: 2,
              explanation: 'Les CGU doivent informer sur l\'utilisation de l\'IA, ses limites (possibles inexactitudes), et le droit d\'opposition au traitement automatise (RGPD).'
            },
            {
              question: 'Quelle clause est recommandee pour la propriete intellectuelle des livrables IA ?',
              options: ['L\'IA est proprietaire des contenus', 'Le prestataire garde tous les droits', 'Les livrables sont la propriete du client des livraison', 'Aucune clause n\'est necessaire'],
              correctIndex: 2,
              explanation: 'Il est recommande de prevoir que les livrables produits avec l\'IA sont la propriete du client des leur livraison, pour eviter toute ambiguite.'
            }
          ]
        }
      ]
    },

    /* =====================================================================
       MODULE 6 — Cas pratiques et jurisprudence
       ===================================================================== */
    {
      id: 'droit-ia-m6',
      title: 'Cas pratiques et jurisprudence',
      emoji: '\uD83D\uDCDA',
      duration: '10 min',
      xp: 125,
      lessons: [
        {
          id: 'droit-ia-m6-l1',
          type: 'text' as const,
          title: '5 cas reels qui font jurisprudence',
          duration: '4 min',
          xp: 30,
          content: `Rien de mieux que des cas concrets pour comprendre le droit de l'IA. Voici 5 affaires majeures qui dessinent le cadre juridique actuel \uD83D\uDCDA

\uD83D\uDCF8 1. Getty Images vs Stability AI (2023-en cours)

L'affaire la plus emblematique du droit d'auteur IA. Getty Images a attaque Stability AI (createur de Stable Diffusion) pour avoir utilise 12 millions de photos Getty pour entrainer son modele SANS autorisation ni licence. Getty reclame des dommages colossaux. L'enjeu : les donnees d'entrainement sont-elles soumises au droit d'auteur ? La decision fera jurisprudence mondiale.

Impact pour vous : si vous utilisez des generateurs d'images, verifiez que le modele a ete entraine sur des donnees licites ou sous licence permissive.

\uD83D\uDCF0 2. New York Times vs OpenAI (2023-en cours)

Le NYT a attaque OpenAI et Microsoft pour contrefacon, demontrant que ChatGPT peut reproduire des articles du NYT quasi mot pour mot. OpenAI invoque le « fair use ». C'est le test ultime : l'entrainement d'une IA sur du contenu protege est-il du fair use ?

Impact pour vous : ne comptez pas sur l'IA pour generer du contenu journalistique exact. Verifiez et reformulez toujours.

\uD83C\uDDEB\uD83C\uDDF7 3. CNIL vs Clearview AI (20 millions d'euros, 2022)

La CNIL a inflige une amende de 20 millions d'euros a Clearview AI pour collecte illegale de photos faciales sur Internet pour alimenter sa base de reconnaissance faciale. Clearview avait scrape des milliards de photos publiques sans consentement.

Impact pour vous : les photos publiques ne sont PAS libres de droits. Le scraping de donnees personnelles pour l'IA est illegal en Europe.

\uD83C\uDDEE\uD83C\uDDF9 4. Garante italiano vs OpenAI (ChatGPT banni, 2023)

L'autorite italienne a temporairement banni ChatGPT en Italie pour non-conformite RGPD : absence de base legale, pas de controle d'age, pas de droit d'opposition effectif. OpenAI a du implementer des changements (verification d'age, politique de confidentialite, opt-out) pour etre readmis.

Impact pour vous : meme les geants doivent se conformer au RGPD. Votre conformite est non-negociable, quelle que soit votre taille.

\uD83C\uDFA8 5. Artistes vs Midjourney, Stability AI, DeviantArt (class action, 2023-en cours)

Des artistes (Karla Ortiz, Sarah Andersen, Kelly McKernan) ont lance un recours collectif contre trois services d'IA generative, accusant l'utilisation non autorisee de leurs oeuvres pour l'entrainement. L'affaire pose la question du « style » : peut-on proteger un style artistique ?

Impact pour vous : evitez de generer des images « dans le style de [artiste specifique] ». Utilisez des descriptions stylistiques generiques.

\uD83C\uDF0D Tendance globale : les tribunaux du monde entier convergent vers un cadre ou l'entrainement sur des donnees protegees sans licence est de plus en plus risque juridiquement. Les modeles entraines sur des donnees consenties ou sous licence (comme Flux/schnell) deviennent un avantage competitif.`
        },
        {
          id: 'droit-ia-m6-l2',
          type: 'game' as const,
          title: 'Jeu — Matching : situation vs risque juridique',
          duration: '3 min',
          xp: 40,
          content: 'Associez chaque situation a son risque juridique principal. Glissez-deposez pour faire les paires !',
          gameType: 'matching' as const,
          gameData: {
            pairs: [
              {
                left: 'Publier une image IA sans mention « genere par IA »',
                right: 'Non-respect de l\'obligation de transparence (IA Act)'
              },
              {
                left: 'Utiliser ChatGPT gratuit pour traiter des donnees clients',
                right: 'Transfert de donnees hors UE + entrainement non consenti (RGPD)'
              },
              {
                left: 'Creer un deepfake d\'un concurrent pour le ridiculiser',
                right: 'Atteinte au droit a l\'image + diffamation'
              },
              {
                left: 'Generer une image « dans le style de Banksy » pour une pub',
                right: 'Risque de contrefacon / parasitisme commercial'
              },
              {
                left: 'Utiliser un scoring IA pour trier des CV sans AIPD',
                right: 'Manquement a l\'obligation d\'analyse d\'impact (RGPD art. 35)'
              },
              {
                left: 'Cloner la voix d\'un employe pour un standard telephonique sans autorisation',
                right: 'Atteinte aux attributs de la personnalite (droit a la voix)'
              }
            ]
          }
        },
        {
          id: 'droit-ia-m6-l3',
          type: 'quiz' as const,
          title: 'Quiz final — Jurisprudence IA',
          duration: '3 min',
          xp: 55,
          content: 'Derniere ligne droite ! Testez vos connaissances sur les cas reels et la jurisprudence IA.',
          questions: [
            {
              question: 'Quel montant d\'amende la CNIL a-t-elle inflige a Clearview AI ?',
              options: ['1 million d\'euros', '5 millions d\'euros', '20 millions d\'euros', '50 millions d\'euros'],
              correctIndex: 2,
              explanation: 'La CNIL a inflige 20 millions d\'euros a Clearview AI en 2022 pour collecte illegale de photos faciales sur Internet pour la reconnaissance faciale.'
            },
            {
              question: 'Pourquoi ChatGPT a-t-il ete temporairement banni en Italie ?',
              options: ['Pour des raisons politiques', 'Pour non-conformite RGPD', 'A cause d\'un bug technique', 'Pour concurrence deloyale'],
              correctIndex: 1,
              explanation: 'L\'autorite italienne (Garante) a banni ChatGPT pour absence de base legale RGPD, defaut de controle d\'age et absence de droit d\'opposition effectif.'
            },
            {
              question: 'Dans l\'affaire Getty vs Stability AI, quel est l\'enjeu principal ?',
              options: ['Le prix des photos', 'La qualite des images generees', 'L\'utilisation de donnees protegees pour l\'entrainement IA', 'La concurrence entre les deux entreprises'],
              correctIndex: 2,
              explanation: 'L\'enjeu central est de savoir si l\'utilisation de 12 millions de photos protegees pour entrainer un modele IA constitue une contrefacon.'
            },
            {
              question: 'Les artistes qui attaquent Midjourney reprochent principalement...',
              options: ['Des bugs dans les images', 'L\'utilisation non autorisee de leurs oeuvres pour l\'entrainement', 'Le prix trop bas du service', 'La lenteur de generation'],
              correctIndex: 1,
              explanation: 'Le recours collectif accuse Midjourney, Stability AI et DeviantArt d\'avoir utilise des oeuvres d\'artistes sans autorisation pour entrainer leurs modeles.'
            },
            {
              question: 'Quelle tendance globale se degage de ces affaires ?',
              options: ['L\'IA sera bientot completement interdite', 'L\'entrainement sur des donnees protegees sans licence est de plus en plus risque', 'Les tribunaux sont favorables aux entreprises IA', 'Le droit d\'auteur ne s\'applique pas a l\'IA'],
              correctIndex: 1,
              explanation: 'Les tribunaux convergent vers un durcissement : l\'entrainement sur des donnees protegees sans licence est de plus en plus contestable juridiquement.'
            }
          ]
        }
      ]
    }
  ]
};
