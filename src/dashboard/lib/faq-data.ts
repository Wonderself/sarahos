// ═══════════════════════════════════════════════════════
// Freenzy.io — FAQ complète (100+ questions)
// Organisée par rubrique pour landing + SEO FAQPage
// Réponses longues et détaillées pour enrichir le SEO
// ═══════════════════════════════════════════════════════

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  questions: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  // ─── 1. GÉNÉRAL ──────────────────────────────────────
  {
    id: 'general',
    label: 'Général',
    icon: 'business',
    color: '#6366f1',
    questions: [
      {
        q: "C'est quoi Freenzy.io ?",
        a: "Freenzy.io est une plateforme d'intelligence artificielle tout-en-un conçue pour les PME, freelances et particuliers. Notre philosophie : Free & Easy — l'IA accessible à tous, sans complexité ni frais cachés. La plateforme met à votre disposition plus de 72 agents IA spécialisés, chacun dédié à un domaine précis de votre activité : commercial, marketing, RH, juridique, finance, communication, développement, vidéo, photo et bien d'autres. Contrairement à un chatbot générique, chaque agent possède son propre rôle, ses outils connectés, sa mémoire longue durée et ses instructions métier. C'est comme avoir une équipe complète qui travaille pour vous 24 heures sur 24, 7 jours sur 7, avec les meilleures intelligences artificielles du marché (Claude d'Anthropic, GPT d'OpenAI, Gemini de Google, et d'autres) comme moteur."
      },
      {
        q: "C'est vraiment gratuit ?",
        a: "Oui, et c'est le cœur de notre philosophie Free & Easy. L'accès à la plateforme Freenzy.io, au tableau de bord Flashboard et à l'ensemble des 72 agents IA est 100% gratuit. Il n'y a aucun abonnement mensuel ou annuel, aucun frais d'activation et aucune limite de temps. Vous ne payez que les tokens IA réellement consommés, facturés au prix officiel des fournisseurs (Anthropic, OpenAI, Google…) avec 0% de commission de notre part. Concrètement, si Claude Sonnet coûte 3$ par million de tokens chez Anthropic, c'est exactement ce que vous payez chez Freenzy.io. Pas un centime de plus. Cette transparence totale est ce qui nous différencie de toutes les autres plateformes IA du marché qui ajoutent des marges de 30 à 200% sur les prix officiels."
      },
      {
        q: "Quelle est la différence avec ChatGPT ou Claude ?",
        a: "ChatGPT (OpenAI) et Claude (Anthropic) sont des modèles d'intelligence artificielle généralistes — ils répondent à des questions dans une fenêtre de chat unique. Freenzy.io est fondamentalement différent : c'est une plateforme d'agents IA spécialisés qui orchestre ces modèles (et bien d'autres) pour exécuter de vraies tâches métier. Chaque agent a un rôle défini (Commercial, Marketing, RH, etc.), des instructions métier précises, des outils connectés (email, téléphone, WhatsApp, CRM…), une mémoire longue durée (grâce à pgvector et le RAG), et la capacité de collaborer avec les autres agents. C'est la différence entre un moteur isolé et une voiture complète avec chauffeur. Par exemple, quand un prospect appelle votre numéro, l'agent Répondeur décroche avec une voix naturelle (ElevenLabs), qualifie le lead, transmet les infos à l'agent Commercial qui prépare un devis, et l'agent Marketing planifie le nurturing — tout ça automatiquement, sans intervention humaine."
      },
      {
        q: "Faut-il des compétences techniques ?",
        a: "Absolument aucune compétence technique n'est requise pour utiliser Freenzy.io. C'est le principe même de notre approche Free & Easy : rendre l'intelligence artificielle accessible à tous, quel que soit votre niveau technique. Tout se fait en langage naturel depuis votre tableau de bord Flashboard. Vous parlez à vos agents comme à un collègue — en français, en anglais ou dans plus de 50 langues. Pas de code à écrire, pas de prompt engineering complexe, pas de configuration de serveur. L'interface est intuitive et guidée : en 5 minutes, vous créez votre compte, renseignez votre profil (secteur d'activité, ton de communication, objectifs) et vos agents sont immédiatement opérationnels. Si vous savez envoyer un email ou utiliser WhatsApp, vous savez utiliser Freenzy.io."
      },
      {
        q: "C'est pour qui ? PME, freelance, particulier ?",
        a: "Freenzy.io est conçu pour trois types d'utilisateurs. Premièrement, les PME et startups qui veulent automatiser leur activité sans recruter : les 12 agents Business (commercial, marketing, RH, finance, juridique, communication, dev, DG, vidéo, photo, répondeur, assistante) gèrent toute votre entreprise comme une équipe virtuelle complète. Deuxièmement, les freelances et indépendants qui ont besoin d'un assistant polyvalent : un seul abonnement (gratuit !) remplace un assistant administratif, un community manager, un comptable et un commercial. Troisièmement, les particuliers qui souhaitent optimiser leur vie personnelle : les 12 agents Perso s'occupent de votre budget familial, vos impôts, votre recherche immobilière, votre portfolio d'investissement, votre CV, votre coaching bien-être et bien plus. En complément, le marketplace propose 48 templates d'agents supplémentaires pour des cas d'usage spécifiques (immobilier, restauration, logistique, etc.)."
      },
      {
        q: "Puis-je tester avant de m'engager ?",
        a: "Bien sûr, et c'est même encouragé. L'inscription à Freenzy.io est totalement gratuite et ne requiert aucune carte bancaire. Dès votre inscription, vous accédez à l'intégralité de la plateforme : les 72 agents IA, le tableau de bord Flashboard complet, le Studio Créatif, le système WhatsApp et toutes les fonctionnalités sans exception. Vous pouvez explorer librement l'interface, configurer vos agents, tester le chat avec différents modèles IA et découvrir toutes les possibilités. Vous ne commencez à consommer des crédits que lorsque vous lancez réellement une action IA (génération de texte, appel téléphonique, création d'image, etc.). Il n'y a aucun engagement, aucune période d'essai limitée dans le temps et aucune surprise. C'est ça, l'esprit Free & Easy."
      },
      {
        q: "Combien de temps faut-il pour démarrer ?",
        a: "5 minutes chrono, pas une de plus. Le processus est volontairement simple et rapide, fidèle à notre philosophie Free & Easy. Étape 1 : créez votre compte avec votre email (30 secondes). Étape 2 : renseignez votre profil — secteur d'activité, nombre d'employés, style de communication préféré, objectifs principaux (2 minutes). Étape 3 : vos 72 agents IA sont automatiquement configurés et prêts à l'emploi avec des paramètres optimisés pour votre profil (instantané). Étape 4 : lancez votre première action — demandez à l'agent Commercial de rédiger un email de prospection, à l'agent Marketing de préparer un post LinkedIn, ou à l'agent RH de rédiger une offre d'emploi. Les agents apprennent votre contexte, vos préférences et votre historique au fur et à mesure des interactions grâce à leur mémoire longue durée (RAG avec pgvector)."
      },
      {
        q: "Freenzy.io fonctionne en quelle langue ?",
        a: "L'interface de Freenzy.io et du tableau de bord Flashboard est entièrement en français, conçue par une équipe française pour le marché francophone. Cependant, les agents IA sont véritablement multilingues : ils peuvent communiquer, rédiger et analyser du contenu dans plus de 50 langues, incluant l'anglais, l'espagnol, l'allemand, l'italien, le portugais, l'arabe, le chinois (simplifié et traditionnel), le japonais, le coréen, le russe, le néerlandais, le polonais, le turc, et bien d'autres. Cette capacité multilingue est particulièrement utile pour les entreprises qui travaillent à l'international : votre agent Commercial peut rédiger des emails en anglais, votre agent Marketing peut publier du contenu en espagnol, et votre agent Répondeur peut accueillir des appelants dans leur langue maternelle — le tout depuis la même interface en français."
      },
      {
        q: "Y a-t-il une application mobile ?",
        a: "Le tableau de bord Flashboard est développé avec Next.js 14 en responsive design et fonctionne parfaitement sur tous les appareils : smartphone, tablette et desktop. L'interface s'adapte automatiquement à la taille de votre écran avec une expérience optimisée pour chaque format. Sur mobile, vous avez accès à l'intégralité des fonctionnalités : chat avec les agents, consultation des rapports, gestion des crédits, Studio Créatif, etc. En complément, vous pouvez piloter vos agents directement depuis WhatsApp — envoyez un message à votre numéro Freenzy et vos agents exécutent vos demandes en temps réel. Une application mobile native (iOS et Android) avec notifications push est prévue dans notre roadmap pour offrir une expérience encore plus fluide."
      },
      {
        q: "Comment contacter le support ?",
        a: "Plusieurs canaux sont disponibles pour vous accompagner. Le chat intégré dans Flashboard vous permet de poser vos questions directement depuis votre tableau de bord — un agent support vous répond en temps réel pendant les heures ouvrées. Vous pouvez également nous contacter par email à support@freenzy.io pour les demandes détaillées, les problèmes techniques ou les suggestions d'amélioration. Pour une réponse rapide, WhatsApp est aussi disponible. Notre équipe s'engage à répondre sous 24h en jours ouvrés, et sous 4h pour les clients Enterprise. Nous proposons également une base de connaissance complète avec des tutoriels vidéo, des guides pas-à-pas et cette FAQ de plus de 100 questions qui couvre la quasi-totalité des cas d'usage."
      },
    ],
  },

  // ─── 2. AGENTS IA ────────────────────────────────────
  {
    id: 'agents',
    label: 'Agents IA',
    icon: 'smart_toy',
    color: '#22c55e',
    questions: [
      {
        q: "Combien d'agents IA sont disponibles ?",
        a: "Freenzy.io met à votre disposition plus de 72 agents IA spécialisés, répartis en trois catégories. Les 12 agents Business couvrent tous les départements d'une entreprise : Répondeur (accueil téléphonique IA 24/7), Assistante (gestion administrative), Commercial (prospection, devis, relance), Marketing (réseaux sociaux, contenu, SEO), RH (recrutement, offres d'emploi), Communication (relations presse, communiqués), Finance (comptabilité, facturation, reporting), Dev (code, debugging, documentation technique), Juridique (contrats, conformité, RGPD), DG (stratégie avec Extended Thinking), Vidéo (clips, avatars parlants) et Photo (visuels, illustrations). Les 12 agents Perso gèrent votre vie personnelle : Budget familial, Négociateur, Impôts, Comptable perso, Chasseur immobilier, Portfolio d'investissement, CV et lettre de motivation, Contradicteur (devil's advocate), Écrivain, Cinéaste, Coach bien-être et Déconnexion numérique. Enfin, le marketplace propose 48 templates supplémentaires pour des métiers spécifiques."
      },
      {
        q: "Quelle est la différence entre agents Business et Perso ?",
        a: "Les agents Business sont conçus pour gérer votre activité professionnelle de A à Z. Ils travaillent ensemble comme une équipe virtuelle coordonnée : le Répondeur qualifie les leads entrants, le Commercial prépare les propositions, le Marketing attire de nouveaux prospects, la Finance suit la trésorerie, les RH gèrent le recrutement, le Juridique vérifie la conformité, etc. Chaque agent Business a accès aux données de votre entreprise (profil, clients, historique) et collabore avec les autres via le bus d'événements interne. Les agents Perso, en revanche, sont dédiés à votre vie personnelle et familiale. L'agent Budget analyse vos dépenses et optimise votre épargne. L'agent Impôts prépare votre déclaration fiscale. Le Chasseur Immobilier surveille les annonces correspondant à vos critères. Le Coach Bien-être vous accompagne au quotidien. Les données personnelles sont strictement isolées des données professionnelles, garantissant une confidentialité totale."
      },
      {
        q: "Les agents travaillent-ils ensemble ?",
        a: "Oui, la collaboration inter-agents est l'une des forces majeures de Freenzy.io. Les agents communiquent entre eux via un bus d'événements temps réel (EventBus), ce qui permet des workflows automatisés puissants. Voici un exemple concret d'un parcours complet : un prospect appelle votre numéro → l'agent Répondeur décroche, présente votre entreprise avec une voix naturelle ElevenLabs, qualifie le besoin et prend rendez-vous → il transmet automatiquement la fiche lead à l'agent Commercial → celui-ci génère un email de confirmation et prépare un devis personnalisé → l'agent Finance enregistre l'opportunité dans le pipeline → l'agent Marketing planifie une séquence de nurturing par email → et l'agent DG intègre cette donnée dans son rapport stratégique hebdomadaire. Tout cela se produit automatiquement, sans aucune intervention humaine, en quelques secondes. Cette architecture multi-agents hiérarchique (3 niveaux : Exécution, Management, Direction) est ce qui distingue fondamentalement Freenzy.io d'un simple chatbot."
      },
      {
        q: "L'agent Répondeur répond vraiment aux appels ?",
        a: "Absolument. L'agent Répondeur est un véritable standard téléphonique IA qui fonctionne 24 heures sur 24, 7 jours sur 7, y compris les week-ends et jours fériés. Grâce à l'intégration Twilio, il dispose d'un numéro de téléphone dédié (local ou international, 40+ pays disponibles) sur lequel il reçoit tous les appels entrants. Lorsqu'un appel arrive, l'agent décroche instantanément avec une voix naturelle générée par ElevenLabs (modèle eleven_multilingual_v2), accueille l'appelant avec votre message personnalisé, identifie son besoin grâce à un script de qualification IA, répond aux questions fréquentes sur votre entreprise, propose un créneau de rendez-vous et envoie un résumé complet par WhatsApp avec les coordonnées du lead, le motif de l'appel et le RDV planifié. Résultat : vous ne manquez plus jamais un appel, même à 3h du matin. C'est comme avoir un(e) secrétaire ultra-compétent(e) qui ne dort jamais."
      },
      {
        q: "L'agent Commercial peut-il envoyer des emails ?",
        a: "Oui, l'agent Commercial est un véritable force de vente automatisée. Il est capable de rédiger et envoyer des emails professionnels de haute qualité : propositions commerciales personnalisées avec le profil du prospect, emails de prospection à froid adaptés au secteur d'activité, devis détaillés avec conditions de paiement, emails de relance intelligents (J+3, J+7, J+14 avec des messages différents à chaque fois), confirmations de rendez-vous, réponses aux demandes d'information et emails de remerciement post-réunion. L'agent adapte automatiquement le ton (formel, décontracté, expert), la longueur et le contenu en fonction du contexte et de votre historique avec le contact. Il gère également le suivi automatique : si un prospect n'a pas répondu sous 3 jours, une relance pertinente est envoyée. Tout l'historique est tracé et consultable dans votre Flashboard."
      },
      {
        q: "L'agent Marketing gère quels réseaux ?",
        a: "L'agent Marketing est un community manager IA complet qui gère les principales plateformes sociales : LinkedIn (posts professionnels, articles, networking), Twitter/X (threads, engagement, veille sectorielle), Instagram (légendes, hashtags, planification visuelle) et Facebook (publications, événements, communication de marque). Pour chaque plateforme, l'agent adapte automatiquement le format, le ton, la longueur et les hashtags selon les bonnes pratiques spécifiques à chaque réseau. Il génère un calendrier éditorial cohérent, rédige les publications en avance, optimise les horaires de publication pour maximiser l'engagement et analyse les performances (likes, partages, commentaires, portée). En collaboration avec l'agent Photo et l'agent Vidéo, il peut aussi produire les visuels et clips qui accompagnent vos publications. Le tout piloté depuis une seule interface Flashboard."
      },
      {
        q: "Puis-je personnaliser le comportement d'un agent ?",
        a: "Oui, chaque agent est entièrement personnalisable depuis les paramètres de votre Flashboard. Vous pouvez configurer : le ton de communication (formel, décontracté, expert, amical, technique…), la langue par défaut et les langues secondaires, les instructions spécifiques à votre métier et votre entreprise (description de vos services, politique tarifaire, valeurs, concurrents…), le modèle IA préféré (Haiku pour la rapidité, Sonnet pour l'équilibre, Opus pour les décisions complexes), les outils connectés (email, WhatsApp, CRM, calendrier…), les horaires d'activité (24/7 ou horaires bureau uniquement), les limites de dépenses quotidiennes en crédits, et les règles de notification (quand vous alerter, quand agir en autonomie). Cette flexibilité permet à chaque agent de devenir un expert de VOTRE entreprise, pas un assistant générique."
      },
      {
        q: "Qu'est-ce que le marketplace d'agents ?",
        a: "Le marketplace Freenzy.io est une bibliothèque de 48 templates d'agents pré-configurés pour des cas d'usage métier très spécifiques, au-delà des 24 agents inclus de base. Parmi les templates disponibles : Agent Immobilier (rédaction d'annonces, qualification d'acheteurs, visites virtuelles), Veille Juridique (alertes réglementaires, résumés de jurisprudence), Maître d'Hôtel IA (réservations par WhatsApp, gestion des tables, menus du jour), Suivi Logistique (tracking colis, alertes retard, relance transporteur), Coach Sportif (programmes personnalisés, suivi nutrition, motivation quotidienne), Agent E-commerce (fiches produits, réponses SAV, gestion de stock), Agent Tourisme (itinéraires, réservations, recommandations locales) et bien d'autres. 23 templates sont entièrement gratuits, 25 sont premium avec des fonctionnalités avancées. Chaque template peut être personnalisé après installation pour correspondre exactement à votre activité."
      },
      {
        q: "Les agents ont-ils une mémoire ?",
        a: "Oui, et c'est un avantage majeur de Freenzy.io par rapport aux chatbots classiques. Chaque agent dispose d'une mémoire contextuelle longue durée grâce à la technologie RAG (Retrieval-Augmented Generation) combinée à pgvector, une extension PostgreSQL spécialisée dans le stockage de vecteurs sémantiques. Concrètement, cela signifie que vos agents se souviennent de tout : vos préférences de communication, l'historique de toutes vos conversations, le contexte de votre entreprise (secteur, clients, produits, concurrents), les décisions passées et leurs résultats, les documents que vous avez partagés, et même le style de rédaction que vous préférez. Plus vous utilisez un agent, plus il devient pertinent et efficace. C'est un véritable apprentissage continu qui rend chaque interaction plus personnalisée et plus productive que la précédente."
      },
      {
        q: "Puis-je désactiver un agent ?",
        a: "Oui, absolument. Chaque agent peut être activé ou désactivé individuellement en un clic depuis votre tableau de bord Flashboard. Un agent désactivé ne consomme strictement aucun crédit et n'effectue aucune action. Vous pouvez par exemple désactiver l'agent RH si vous ne recrutez pas actuellement, ou désactiver l'agent Juridique pendant les vacances. La réactivation est instantanée et l'agent retrouve immédiatement toute sa mémoire et sa configuration. Vous pouvez également mettre un agent en mode « consultation uniquement » — il reste disponible pour répondre à vos questions mais n'effectue aucune action proactive (pas d'envoi d'email, pas d'appel, pas de publication). Cette granularité vous donne un contrôle total sur votre consommation de crédits et sur l'activité de votre équipe IA."
      },
      {
        q: "Comment l'agent DG fonctionne-t-il ?",
        a: "L'agent Direction Générale (DG) est le cerveau stratégique de votre équipe IA. Il utilise Claude Opus, le modèle le plus puissant d'Anthropic, avec la fonctionnalité Extended Thinking qui lui permet de « réfléchir » de manière approfondie avant de répondre. Contrairement aux autres agents qui utilisent Sonnet pour les tâches courantes, l'agent DG décompose les problèmes complexes, explore plusieurs scénarios, évalue les risques et opportunités, et fournit des recommandations stratégiques détaillées. Il synthétise automatiquement les rapports de tous les agents de l'équipe (activité commerciale, performance marketing, situation financière, actualités juridiques), identifie les tendances et les priorités, et propose des plans d'action concrets. Chaque semaine, il génère un briefing stratégique complet que vous recevez par email et WhatsApp. C'est l'équivalent d'un directeur de cabinet qui a une vision à 360° de votre activité."
      },
    ],
  },

  // ─── 3. TARIFICATION ─────────────────────────────────
  {
    id: 'pricing',
    label: 'Tarifs & Crédits',
    icon: 'savings',
    color: '#f59e0b',
    questions: [
      {
        q: "Comment fonctionne le système de crédits ?",
        a: "Freenzy.io utilise un système de micro-crédits transparent et équitable, fidèle à notre philosophie Free & Easy. Le principe est simple : 1 crédit ≈ 0,10€. Vous rechargez des crédits à l'avance via Stripe (paiement sécurisé PCI DSS) et chaque action IA déduit le coût exact au centime près. Le calcul est basé directement sur la tarification officielle des fournisseurs d'IA (Anthropic, OpenAI, Google, etc.) avec 0% de marge ajoutée par Freenzy.io. Chaque action est détaillée dans votre historique : vous voyez exactement quel modèle a été utilisé, combien de tokens ont été consommés et le coût associé. Pas de forfait, pas de palier, pas de date d'expiration. Vos crédits restent sur votre compte indéfiniment. C'est le modèle pay-as-you-go le plus transparent du marché IA."
      },
      {
        q: "Combien coûte un chat avec un agent ?",
        a: "Le coût d'un chat varie selon le modèle IA utilisé, et Freenzy.io choisit automatiquement le modèle optimal selon la complexité de votre demande. Pour les tâches simples et rapides (tri d'emails, réponse courte, classification), Claude Haiku est utilisé : environ 0,5 crédit par échange (0,05€), c'est le modèle le plus économique. Pour la rédaction, l'analyse et les tâches intermédiaires, Claude Sonnet prend le relais : environ 1,1 crédit par échange (0,11€). Pour les décisions stratégiques complexes nécessitant une réflexion approfondie, Claude Opus avec Extended Thinking est mobilisé : environ 5 crédits (0,50€). Vous pouvez également forcer l'utilisation d'un modèle spécifique (GPT-4o, Gemini Pro, Llama 4, Grok 3, Mistral…) depuis les paramètres. Le détail de chaque échange est visible en temps réel dans votre Flashboard avec le nombre exact de tokens consommés."
      },
      {
        q: "Combien coûte un email professionnel ?",
        a: "Un email professionnel complet rédigé par Claude Sonnet coûte environ 1,1 crédit (0,11€). Ce prix inclut la rédaction de l'objet optimisé, du corps de l'email avec mise en forme professionnelle, des appels à l'action pertinents et, le cas échéant, des pièces jointes générées (devis, propositions, documents). Pour un email simple de confirmation ou de suivi, le coût descend à environ 0,5 crédit avec Haiku. Pour un email stratégique complexe (proposition commerciale détaillée, réponse à un appel d'offres), le coût peut monter à 2-3 crédits si Opus est sollicité. À titre de comparaison, une agence de communication facture entre 50€ et 200€ pour la rédaction d'un email marketing professionnel. Avec Freenzy.io, vous obtenez un résultat de qualité comparable pour 100 à 1000 fois moins cher."
      },
      {
        q: "Combien coûte un appel au répondeur ?",
        a: "Un appel traité par l'agent Répondeur IA coûte environ 5 crédits (0,50€). Ce tarif tout compris couvre : la réception de l'appel via Twilio (frais télécom inclus), l'accueil vocal avec une voix naturelle ElevenLabs (modèle eleven_multilingual_v2), la transcription intelligente de la conversation en temps réel, la qualification du lead par l'IA (besoin, budget, urgence, coordonnées), la prise de rendez-vous dans votre calendrier, et l'envoi d'un résumé structuré par WhatsApp avec toutes les informations pertinentes. Pour comparaison, un service de secrétariat téléphonique externalisé coûte entre 1,50€ et 5€ par appel, sans l'intelligence de qualification ni l'envoi WhatsApp instantané. Le Répondeur Freenzy.io est disponible 24/7, ne prend jamais de pause et ne rate jamais un appel."
      },
      {
        q: "Combien coûte la génération d'une image ?",
        a: "La génération d'images via le Studio Créatif de Freenzy.io est proposée à deux niveaux de qualité. En qualité standard (1024x1024 pixels), une image IA générée par Flux (fal.ai) coûte 8 crédits (0,80€). C'est idéal pour les visuels de réseaux sociaux, les illustrations de blog et les maquettes rapides. En qualité HD (jusqu'à 2048x2048 pixels), le tarif est de 12 crédits (1,20€), parfait pour les visuels marketing print, les couvertures et les présentations. Toutes les images générées sont libres de droits pour un usage commercial — vous en êtes le propriétaire exclusif. À titre de comparaison, acheter une image stock de qualité sur Shutterstock ou Adobe Stock coûte entre 3€ et 30€, et commander une illustration personnalisée à un graphiste freelance revient entre 50€ et 500€. Le Studio Créatif Freenzy.io offre des résultats personnalisés à une fraction du coût."
      },
      {
        q: "Combien coûte un clip vidéo ?",
        a: "La production vidéo IA dans le Studio Créatif propose plusieurs options. Un clip vidéo de 5 à 30 secondes généré par LTX Video (fal.ai) ou Runway ML coûte environ 20 crédits (2€). Un avatar parlant (un visage réaliste qui lit votre texte avec une voix naturelle) via D-ID coûte environ 15 crédits (1,50€) pour 30 secondes. Ces clips sont idéaux pour les stories Instagram, les publicités courtes, les tutoriels produit, les témoignages virtuels et les présentations commerciales. Pour comparaison, faire produire un clip vidéo de 30 secondes par une agence vidéo coûte entre 500€ et 5000€, et même un monteur freelance facture minimum 100-200€. Avec Freenzy.io, vous obtenez un résultat professionnel en quelques minutes pour quelques euros seulement."
      },
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Non, il n'y en a aucun. C'est notre engagement fondamental et le pilier de notre modèle Free & Easy. Zéro commission sur les tokens IA (vous payez le prix officiel des fournisseurs, pas un centime de plus). Zéro abonnement mensuel ou annuel. Zéro frais d'activation ou de mise en service. Zéro frais de maintenance ou de mise à jour. Zéro frais de support. Zéro minimum de consommation. Zéro engagement de durée. Le détail de chaque action est visible dans votre historique de crédits en temps réel : modèle utilisé, nombre de tokens, coût exact. Vous pouvez exporter l'intégralité de votre historique de dépenses en CSV pour votre comptabilité. Cette transparence absolue est ce qui nous différencie : quand d'autres plateformes ajoutent 50 à 200% de marge sur les prix officiels des IA, nous prenons 0%."
      },
      {
        q: "Quel est le montant minimum de recharge ?",
        a: "La recharge minimum est de 5€, soit 50 crédits. Cela suffit pour découvrir la plateforme et réaliser une centaine de tâches simples. Des packs de crédits sont disponibles pour tous les budgets : 10€ (100 crédits), 25€ (250 crédits), 50€ (500 crédits) et 100€ (1000 crédits). Les packs plus importants offrent un bonus de crédits supplémentaires en remerciement de votre confiance. Le paiement est sécurisé par Stripe, certifié PCI DSS niveau 1 (le plus haut niveau de sécurité), et accepte les cartes bancaires Visa, Mastercard, American Express, ainsi que Apple Pay et Google Pay. Pour les entreprises, le paiement par virement SEPA et la facturation sur devis sont également disponibles sur le plan Enterprise."
      },
      {
        q: "Que peut-on faire avec 50 crédits (5€) ?",
        a: "Avec 50 crédits (5€), vous pouvez réaliser un volume impressionnant de tâches IA. Voici des exemples concrets : environ 100 conversations chat avec Haiku (réponses rapides, tri, classification) ; 45 emails professionnels complets rédigés par Sonnet (prospection, relance, propositions) ; 62 publications réseaux sociaux (posts LinkedIn, tweets, légendes Instagram) ; 10 appels traités par le Répondeur IA (accueil, qualification, résumé WhatsApp) ; 125 messages WhatsApp intelligents ; 7 images IA en qualité standard (visuels marketing, illustrations) ; 6 réunions structurées avec analyse Opus (compte-rendu, actions, stratégie) ; 2 clips vidéo de 30 secondes ; ou encore 50 analyses de documents. Bien sûr, vous pouvez combiner ces actions selon vos besoins. 50 crédits, c'est largement suffisant pour une semaine complète d'activité pour un freelance ou une petite PME."
      },
      {
        q: "Les crédits expirent-ils ?",
        a: "Non, jamais. C'est un point essentiel de notre engagement Free & Easy. Vos crédits Freenzy.io n'ont aucune date d'expiration. Une fois achetés, ils restent sur votre compte indéfiniment, que vous les utilisiez en une journée, un mois ou un an. Il n'y a pas de limite de temps, pas de « use it or lose it », pas de reset mensuel. Vos crédits sont à vous, point final. C'est un avantage majeur par rapport aux abonnements mensuels classiques où vous perdez les fonctionnalités inutilisées à la fin du mois. Avec Freenzy.io, vous rechargez quand vous voulez, vous utilisez à votre rythme, et votre solde ne diminue que lorsque vous lancez effectivement une action IA."
      },
      {
        q: "Puis-je voir le détail de mes dépenses ?",
        a: "Oui, la transparence est au cœur de notre système de crédits. Votre tableau de bord Flashboard affiche en temps réel : votre solde de crédits actuel, l'historique complet de chaque action IA avec le détail (agent utilisé, modèle IA, nombre de tokens en entrée et sortie, coût exact en crédits et en euros), des graphiques de consommation par agent (pour identifier quel agent consomme le plus), des graphiques par période (jour, semaine, mois) pour suivre vos tendances, un résumé des dépenses par catégorie (chat, email, téléphone, image, vidéo), et des projections basées sur votre usage moyen. L'ensemble est exportable en CSV et PDF pour votre comptabilité. Les administrateurs d'équipe ont en plus une vue consolidée de la consommation de tous les membres."
      },
      {
        q: "Proposez-vous des tarifs entreprise ?",
        a: "Oui. Le plan Enterprise de Freenzy.io est conçu pour les entreprises de plus de 10 utilisateurs avec des besoins avancés. Il inclut : des tarifs dégressifs sur les crédits (jusqu'à -30% selon le volume), un account manager dédié pour vous accompagner, des fonctionnalités avancées de sécurité (SSO SAML/OIDC, 2FA obligatoire, IP whitelist), des audit logs détaillés pour la conformité, un SLA garanti de 99,9% de disponibilité, un support prioritaire avec temps de réponse garanti sous 4h, l'isolation des données par équipe et par projet (Multi-Projects), le déploiement on-premise optionnel pour les entreprises qui veulent héberger sur leur propre infrastructure, et la possibilité de créer des agents sur mesure développés par notre équipe. Contactez-nous via le formulaire Enterprise ou à enterprise@freenzy.io pour un devis personnalisé adapté à vos besoins."
      },
    ],
  },

  // ─── 4. TECHNOLOGIES ─────────────────────────────────
  {
    id: 'tech',
    label: 'Technologies',
    icon: 'bolt',
    color: '#3b82f6',
    questions: [
      {
        q: "Quels modèles IA sont disponibles ?",
        a: "Freenzy.io agrège les meilleurs modèles d'intelligence artificielle du monde dans une seule plateforme. Claude d'Anthropic : Haiku (rapide et économique), Sonnet (équilibré, idéal pour la rédaction), Opus 4 avec Extended Thinking (le plus puissant pour les tâches stratégiques complexes). GPT d'OpenAI : GPT-4o (multimodal rapide), o3 (raisonnement avancé), GPT-4.5 (dernière génération). Gemini de Google : Flash (ultra-rapide), Pro (équilibré), Ultra (performance maximale). Llama de Meta : Llama 4 open source, excellent rapport qualité-prix. Grok de xAI : raisonnement en temps réel avec données actualisées. Mistral : IA française souveraine, conforme aux exigences européennes. Et tous les futurs modèles dès leur sortie — notre architecture est conçue pour intégrer de nouveaux modèles en quelques heures. Chaque modèle est facturé au prix officiel du fournisseur, sans aucune marge ajoutée."
      },
      {
        q: "Comment le bon modèle est-il choisi ?",
        a: "Freenzy.io intègre un système intelligent de routage automatique des modèles IA. Chaque agent choisit automatiquement le modèle optimal en fonction de la nature et de la complexité de la tâche demandée. Pour les tâches rapides nécessitant peu de réflexion (tri d'emails, réponses courtes, classification de données, extraction d'information), Claude Haiku est utilisé : c'est le plus rapide et le plus économique. Pour la rédaction de contenu, l'analyse de documents, la création d'emails professionnels et les tâches intermédiaires, Claude Sonnet prend le relais avec un excellent équilibre qualité-coût. Pour les décisions stratégiques complexes, l'analyse approfondie de situations business et la résolution de problèmes multi-factoriels, Claude Opus avec Extended Thinking est mobilisé — il prend le temps de « réfléchir » et d'explorer plusieurs approches avant de répondre. Vous pouvez également forcer l'utilisation d'un modèle spécifique depuis les paramètres de chaque agent si vous avez une préférence."
      },
      {
        q: "Qu'est-ce que l'Extended Thinking ?",
        a: "L'Extended Thinking est une fonctionnalité avancée de Claude Opus qui permet au modèle de déployer un processus de raisonnement approfondi avant de fournir sa réponse. Contrairement aux modèles standard qui répondent en un seul passage, l'Extended Thinking décompose les problèmes complexes en étapes logiques, explore plusieurs approches et scénarios, évalue les avantages et inconvénients de chaque option, anticipe les risques et les conséquences, et synthétise le tout en une recommandation argumentée et structurée. Cette technologie est utilisée par l'agent Direction Générale (DG) pour les décisions stratégiques, par l'agent Juridique pour l'analyse de contrats complexes, et par l'agent Finance pour les projections financières. Le coût est plus élevé qu'un chat standard (environ 5 crédits) car le modèle consomme significativement plus de tokens, mais la qualité de raisonnement est incomparablement supérieure — comparable à celle d'un consultant senior."
      },
      {
        q: "Quelle voix utilisent les agents vocaux ?",
        a: "Les agents vocaux de Freenzy.io utilisent la technologie text-to-speech (TTS) la plus avancée du marché : ElevenLabs avec le modèle eleven_multilingual_v2. Cette technologie produit une voix d'une qualité remarquable, quasiment indistinguable d'une voix humaine, avec des intonations naturelles, des pauses appropriées et une prosodie fluide. La voix supporte plus de 11 langues nativement (français, anglais, espagnol, allemand, italien, etc.) avec un accent naturel dans chaque langue. Le Répondeur IA et le Réveil Intelligent utilisent cette technologie pour offrir une expérience d'appel téléphonique véritablement professionnelle. La voix peut être personnalisée : choix parmi plusieurs voix (masculine, féminine, tonalité différente), vitesse de parole ajustable, et possibilité de cloner une voix spécifique (fonctionnalité Enterprise). Les appelants sont souvent surpris par la qualité naturelle de la conversation."
      },
      {
        q: "Comment fonctionne la téléphonie ?",
        a: "L'intégration téléphonique de Freenzy.io repose sur Twilio, le leader mondial de la communication cloud. Voici comment ça fonctionne en détail : vous obtenez un numéro de téléphone dédié (local français, international, ou numéro vert selon vos besoins, disponible dans 40+ pays). Lorsqu'un appel arrive, Twilio le route vers l'agent Répondeur IA qui décroche instantanément. L'agent accueille l'appelant avec une voix naturelle ElevenLabs, transcrit la conversation en temps réel grâce à la reconnaissance vocale IA, répond intelligemment aux questions, qualifie le lead selon vos critères, propose un créneau de rendez-vous et enregistre toutes les informations. En fin d'appel, un résumé structuré est envoyé par WhatsApp et/ou email avec les coordonnées du contact, le motif de l'appel, le niveau d'urgence et le rendez-vous planifié. L'agent peut également passer des appels sortants pour des confirmations de RDV, des relances, des enquêtes de satisfaction ou des campagnes de phoning automatisées."
      },
      {
        q: "Qu'est-ce que le RAG / mémoire longue ?",
        a: "RAG signifie Retrieval-Augmented Generation, une technique avancée d'intelligence artificielle qui combine la recherche d'information avec la génération de texte. Dans Freenzy.io, le RAG fonctionne grâce à pgvector, une extension de PostgreSQL 16 spécialisée dans le stockage et la recherche de vecteurs sémantiques. Concrètement, chaque information que vous partagez avec vos agents (conversations, documents, préférences, historique d'actions, contexte d'entreprise) est convertie en vecteurs numériques (embeddings) et stockée dans une base de données dédiée. Lorsqu'un agent doit répondre à une question ou exécuter une tâche, il interroge cette base pour retrouver les informations les plus pertinentes et les intègre dans son contexte de réflexion. Résultat : vos agents se souviennent de tout — vos clients, votre politique tarifaire, vos préférences de communication, les décisions passées — et deviennent de plus en plus pertinents avec le temps."
      },
      {
        q: "Le Studio Créatif utilise quoi ?",
        a: "Le Studio Créatif de Freenzy.io intègre les technologies de génération de contenu visuel les plus performantes du marché. Pour les images : Flux (via fal.ai) pour les générations rapides et de haute qualité en mode synchrone — résultat en 5 à 15 secondes. DALL-E (OpenAI) comme alternative pour certains styles spécifiques. Pour les vidéos : LTX Video (via fal.ai) pour les clips vidéo génératifs de 5 à 30 secondes, traités en file d'attente asynchrone. Runway ML pour les vidéos de qualité cinématographique. Pour les avatars parlants : D-ID transforme un visage (réel ou généré) en un avatar vidéo qui lit votre texte avec une voix naturelle — idéal pour les tutoriels, les présentations et les témoignages. Toutes ces technologies sont intégrées directement dans votre Flashboard avec une interface unifiée : vous décrivez ce que vous voulez en langage naturel et le Studio s'occupe du reste."
      },
      {
        q: "Le système est-il en temps réel ?",
        a: "Oui, Freenzy.io est conçu pour fonctionner en temps réel grâce à plusieurs technologies complémentaires. Les réponses des agents sont diffusées en streaming via Server-Sent Events (SSE) — vous voyez le texte apparaître mot par mot comme si l'agent écrivait en direct, sans attendre la réponse complète. Les notifications (nouveau lead qualifié, email envoyé, rapport généré, alerte importante) arrivent instantanément sur votre tableau de bord Flashboard et sur WhatsApp. Le bus d'événements interne (EventBus) permet aux agents de communiquer entre eux en temps réel — quand le Répondeur qualifie un lead, le Commercial reçoit l'information instantanément. Redis 7 est utilisé comme cache temps réel pour les sessions, les notifications et les données fréquemment consultées, garantissant des temps de réponse inférieurs à 100ms. L'ensemble de l'architecture est optimisée pour la réactivité : votre équipe IA travaille aussi vite que vous pensez."
      },
      {
        q: "Quelles API sont utilisées ?",
        a: "Freenzy.io orchestre un écosystème technologique complet de plus de 10 API et services spécialisés. Intelligence artificielle : Anthropic SDK (Claude Haiku, Sonnet, Opus), OpenAI API (GPT-4o, o3, GPT-4.5), Google Gemini API (Flash, Pro, Ultra), Meta Llama, xAI Grok, Mistral AI. Voix et téléphonie : ElevenLabs API (text-to-speech eleven_multilingual_v2 avec voix premium), Twilio SDK (appels vocaux entrants/sortants, SMS, WhatsApp Business API). Création visuelle : fal.ai (Flux pour les images, LTX Video pour les vidéos), D-ID (avatars parlants). Paiement : Stripe API (transactions sécurisées PCI DSS niveau 1, gestion des abonnements Enterprise). Infrastructure : PostgreSQL 16 + pgvector (base de données relationnelle + mémoire vectorielle RAG), Redis 7 (cache temps réel, sessions, pub/sub). Toutes ces intégrations sont transparentes : vous interagissez en langage naturel, les agents gèrent la complexité technique en arrière-plan."
      },
      {
        q: "Freenzy.io tourne sur quelle infra ?",
        a: "L'infrastructure de Freenzy.io est conçue pour la performance, la sécurité et la conformité européenne. Serveurs hébergés dans l'Union Européenne (conformité RGPD stricte — vos données ne quittent jamais l'UE). Stack technique : Node.js 20+ avec TypeScript en mode strict pour la robustesse du code, Express.js pour l'API REST, Next.js 14 pour le tableau de bord Flashboard. Base de données : PostgreSQL 16 avec l'extension pgvector pour la mémoire longue durée (RAG) et les recherches sémantiques. Cache et sessions : Redis 7 pour les performances temps réel (sessions, notifications, cache). Conteneurisation : Docker et Docker Compose pour le déploiement reproductible et la scalabilité. L'architecture est conçue pour la haute disponibilité (HA) et peut scale horizontalement pour supporter des milliers d'utilisateurs simultanés. Pour les clients Enterprise, le déploiement on-premise (sur votre propre infrastructure) est également possible."
      },
    ],
  },

  // ─── 5. SÉCURITÉ & RGPD ──────────────────────────────
  {
    id: 'security',
    label: 'Sécurité & RGPD',
    icon: 'lock',
    color: '#dc2626',
    questions: [
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "La sécurité de vos données est notre priorité absolue. Freenzy.io implémente plusieurs niveaux de protection : chiffrement en transit avec TLS 1.3 (le protocole le plus récent et le plus sécurisé) pour toutes les communications entre votre navigateur et nos serveurs. Chiffrement au repos avec AES-256 pour toutes les données stockées en base (conversations, documents, informations personnelles). Authentification sécurisée par JWT (JSON Web Token) avec RBAC (Role-Based Access Control) et support de la 2FA (authentification à deux facteurs) via TOTP. Serveurs hébergés exclusivement dans l'Union Européenne pour la conformité RGPD. Audit logs complets traçant chaque connexion et chaque action. Rate limiting et protection DDoS sur toutes les API. Secrets et clés API gérés de manière sécurisée avec rotation régulière. Tests de pénétration et audits de sécurité réguliers. Notre équipe suit les recommandations OWASP Top 10 et les meilleures pratiques de l'industrie en matière de cybersécurité."
      },
      {
        q: "Êtes-vous conformes RGPD ?",
        a: "Oui, Freenzy.io est entièrement conforme au Règlement Général sur la Protection des Données (RGPD / GDPR). Notre conformité repose sur plusieurs piliers : hébergement exclusif des données dans l'Union Européenne (serveurs localisés en France et en Allemagne). Collecte minimale des données — nous ne collectons que les informations strictement nécessaires au fonctionnement du service. Droit d'accès — vous pouvez consulter l'intégralité de vos données personnelles à tout moment depuis les paramètres de votre compte. Droit de rectification — modifiez vos informations directement dans votre profil. Droit à l'effacement (droit à l'oubli) — demandez la suppression complète et irréversible de toutes vos données sous 72h. Droit à la portabilité — exportez l'intégralité de vos données en format standard (JSON, CSV). Vos données ne sont jamais vendues, partagées ou utilisées pour entraîner des modèles IA. Un registre des traitements est maintenu conformément aux exigences de la CNIL."
      },
      {
        q: "Mes données servent-elles à entraîner l'IA ?",
        a: "Non, absolument jamais. C'est un point fondamental de notre politique de confidentialité et un engagement contractuel. Ni Freenzy.io, ni aucun des fournisseurs d'IA que nous utilisons (Anthropic pour Claude, OpenAI pour GPT, Google pour Gemini) n'utilise vos données, vos conversations ou vos documents pour entraîner, affiner ou améliorer leurs modèles d'intelligence artificielle. Cet engagement est garanti par les conditions d'utilisation des API professionnelles de chaque fournisseur (Anthropic API Terms, OpenAI Business Terms, Google Cloud Terms). Vos interactions avec les agents Freenzy.io sont traitées en temps réel, stockées de manière chiffrée dans votre espace privé pour la mémoire des agents (RAG), et ne sont accessibles qu'à vous et aux personnes que vous autorisez. Vos données vous appartiennent, point final."
      },
      {
        q: "Comment fonctionne l'authentification ?",
        a: "Freenzy.io implémente un système d'authentification robuste et multicouche. L'authentification principale utilise JWT (JSON Web Token) : lors de la connexion, un token sécurisé est généré et signé avec une clé cryptographique forte. Ce token contient votre identité et votre rôle (RBAC) et expire automatiquement après une durée définie. Le contrôle d'accès par rôle (RBAC) définit 4 niveaux de permissions : admin (accès complet, gestion des utilisateurs, configuration), operator (exécution d'actions, utilisation des agents), viewer (consultation uniquement, rapports en lecture seule) et system (accès automatisé pour les agents et les processus internes). Pour une sécurité renforcée, la 2FA (authentification à deux facteurs) est disponible via TOTP (Time-based One-Time Password), compatible avec toutes les applications d'authentification (Google Authenticator, Authy, 1Password, etc.). Les sessions sont gérées via Redis avec expiration automatique et détection des connexions suspectes."
      },
      {
        q: "Puis-je supprimer mes données ?",
        a: "Oui, conformément au droit à l'oubli garanti par le RGPD (article 17). Depuis les paramètres de votre compte Flashboard, vous pouvez demander la suppression complète et irréversible de toutes vos données personnelles. Cette demande déclenche un processus systématique qui supprime : votre profil utilisateur et vos informations personnelles, l'historique complet de toutes vos conversations avec les agents, tous les documents, images et vidéos générés, votre historique de crédits et de transactions (anonymisé pour les obligations comptables), la mémoire longue durée de vos agents (vecteurs RAG), et toutes les données associées (notifications, rapports, paramètres). Le processus est exécuté sous 72 heures maximum conformément au RGPD. Un email de confirmation vous est envoyé une fois la suppression effectuée. Attention : cette opération est irréversible — toutes les données et tous les crédits restants sont définitivement perdus."
      },
      {
        q: "Les conversations sont-elles privées ?",
        a: "Oui, absolument. La confidentialité de vos conversations est une priorité architecturale, pas un simple ajout. Chaque utilisateur dispose d'un espace complètement isolé dans la base de données (isolation au niveau applicatif et au niveau PostgreSQL). Vos conversations, documents, configurations et données sont strictement privés et ne sont accessibles qu'à vous et aux membres de votre équipe que vous avez explicitement autorisés. Aucun employé de Freenzy.io n'a accès à vos conversations sans votre autorisation écrite explicite. Même notre équipe de support technique ne peut pas lire le contenu de vos échanges avec les agents — ils peuvent uniquement voir les métadonnées (dates, volumes) pour résoudre des problèmes techniques. En mode Multi-Projects, les données sont également isolées entre vos différents projets, garantissant un cloisonnement complet."
      },
      {
        q: "Comment les paiements sont-ils sécurisés ?",
        a: "Les paiements sur Freenzy.io sont traités par Stripe, le leader mondial du paiement en ligne, certifié PCI DSS niveau 1 — c'est le plus haut niveau de sécurité des données de paiement dans l'industrie. Concrètement, cela signifie que Freenzy.io ne stocke jamais, ne transmet jamais et n'a jamais accès à vos données bancaires (numéro de carte, CVV, date d'expiration). Toute la transaction est gérée directement par Stripe dans un environnement sécurisé et audité. Les paiements sont protégés par le protocole 3D Secure 2 (authentification forte) et bénéficient de la détection de fraude en temps réel de Stripe (Radar). Moyens de paiement acceptés : Visa, Mastercard, American Express, Apple Pay, Google Pay. Pour les entreprises : virement SEPA et facturation sur bon de commande. Chaque transaction génère un reçu détaillé accessible dans votre historique Flashboard."
      },
      {
        q: "Y a-t-il un audit log ?",
        a: "Oui, Freenzy.io implémente un système d'audit logging complet, essentiel pour la sécurité, la conformité RGPD et la gouvernance d'entreprise. Chaque action est enregistrée avec un horodatage précis, l'identité de l'utilisateur, l'adresse IP et le détail de l'opération. Les événements tracés incluent : les connexions et déconnexions (avec détection des tentatives échouées), chaque action exécutée par un agent IA (email envoyé, appel passé, document généré), les modifications de configuration (paramètres des agents, permissions, profil), les recharges de crédits et l'historique des dépenses, les invitations et modifications de rôles des membres d'équipe, les exports et suppressions de données. L'historique complet est consultable par les administrateurs depuis le tableau de bord Flashboard avec des filtres avancés (par utilisateur, par agent, par date, par type d'action). Pour les clients Enterprise, des audit logs enrichis sont disponibles avec export vers des outils SIEM (Splunk, Datadog, etc.)."
      },
      {
        q: "Proposez-vous le SSO ?",
        a: "Oui, le Single Sign-On (SSO) est disponible pour les entreprises via le plan Enterprise de Freenzy.io. Notre implémentation SSO supporte les deux standards majeurs du marché : SAML 2.0 (Security Assertion Markup Language), compatible avec les fournisseurs d'identité les plus courants (Okta, Azure Active Directory, Google Workspace, OneLogin, Ping Identity, Auth0, etc.), et OpenID Connect (OIDC), le standard moderne d'authentification basé sur OAuth 2.0. Le SSO permet à vos collaborateurs de se connecter à Freenzy.io avec les mêmes identifiants que leur environnement de travail habituel, sans créer de nouveau mot de passe. Cela renforce la sécurité (moins de mots de passe à gérer, politique de mots de passe centralisée, désactivation immédiate lors du départ d'un collaborateur) et améliore l'expérience utilisateur. La configuration du SSO est prise en charge par notre équipe Enterprise dédiée."
      },
      {
        q: "Comment signaler une vulnérabilité ?",
        a: "Freenzy.io prend la sécurité très au sérieux et encourage la divulgation responsable des vulnérabilités. Si vous découvrez une faille de sécurité, veuillez nous contacter immédiatement par email à security@freenzy.io avec une description détaillée de la vulnérabilité, les étapes pour la reproduire et, si possible, une preuve de concept. Notre équipe de sécurité s'engage à accuser réception de votre signalement sous 24 heures, à évaluer la criticité de la vulnérabilité sous 48 heures, et à déployer un correctif en fonction de la sévérité (critique : sous 24h, haute : sous 72h, moyenne : sous 7 jours). Nous pratiquons une politique de divulgation responsable et ne poursuivons jamais les chercheurs en sécurité qui signalent des vulnérabilités de bonne foi. Un programme de bug bounty est en cours de mise en place pour récompenser les contributeurs qui améliorent la sécurité de notre plateforme."
      },
    ],
  },

  // ─── 6. WHATSAPP & TÉLÉPHONIE ─────────────────────────
  {
    id: 'whatsapp',
    label: 'WhatsApp & Téléphonie',
    icon: 'phone_iphone',
    color: '#25D366',
    questions: [
      {
        q: "Comment fonctionne WhatsApp avec Freenzy.io ?",
        a: "L'intégration WhatsApp de Freenzy.io transforme la messagerie la plus populaire du monde en un véritable canal de pilotage de vos agents IA. Le fonctionnement est bidirectionnel : d'un côté, vos agents vous envoient proactivement des résumés, alertes et rapports directement sur WhatsApp (lead qualifié par le Répondeur, rapport commercial hebdomadaire, alerte finance, notification de tâche accomplie). De l'autre côté, vous pouvez donner des instructions à vos agents par simple message WhatsApp — « Rédige un email de relance pour le prospect Dupont », « Publie un post LinkedIn sur notre nouveau produit », « Quel est mon solde de crédits ? ». L'agent approprié reçoit votre demande, l'exécute et vous répond sur WhatsApp. C'est comme avoir votre équipe IA dans votre poche, accessible 24h/24 depuis l'application que vous utilisez déjà tous les jours. L'intégration utilise l'API WhatsApp Business via Twilio pour une fiabilité maximale."
      },
      {
        q: "Faut-il un numéro WhatsApp Business ?",
        a: "Non, aucune configuration technique n'est requise de votre côté — c'est ça, l'esprit Free & Easy. Freenzy.io utilise l'API WhatsApp Business via Twilio en arrière-plan. Vous recevez les messages de vos agents sur votre numéro WhatsApp personnel, celui que vous utilisez tous les jours. Pas besoin de créer un compte WhatsApp Business séparé, pas besoin de vérifier un numéro professionnel, pas besoin d'installer une application supplémentaire. Lors de la configuration de votre compte Freenzy.io, vous renseignez simplement votre numéro de téléphone et vous commencez à recevoir les notifications et résumés de vos agents. Si vous souhaitez un numéro WhatsApp Business dédié pour votre entreprise (séparé de votre numéro personnel), cette option est également disponible via notre intégration Twilio."
      },
      {
        q: "Le Répondeur répond-il 24/7 ?",
        a: "Oui, absolument. Votre agent Répondeur IA est actif 24 heures sur 24, 7 jours sur 7, 365 jours par an, y compris les week-ends, les jours fériés, la nuit de Noël et le 1er janvier. Il ne dort jamais, ne tombe jamais malade, ne prend jamais de vacances et n'a jamais besoin de pause café. Chaque appel entrant est traité instantanément, sans file d'attente ni musique d'attente. L'agent décroche en moins d'une seconde, accueille l'appelant avec votre message personnalisé dans une voix naturelle (ElevenLabs), identifie son besoin, répond aux questions fréquentes sur votre activité, qualifie le lead, prend rendez-vous et vous envoie un résumé complet par WhatsApp. Résultat : vous ne manquez plus jamais un seul appel, même ceux qui arrivent à 3h du matin ou pendant vos vacances. Pour les entreprises qui préfèrent limiter les heures de l'agent, un planning personnalisé est configurable depuis Flashboard."
      },
      {
        q: "Puis-je avoir un numéro de téléphone dédié ?",
        a: "Oui. Grâce à l'intégration Twilio, Freenzy.io vous fournit un numéro de téléphone dédié exclusivement à votre agent Répondeur IA. Vous avez le choix parmi une large sélection de numéros : numéros locaux français (fixes en 01, 02, 03, 04, 05 selon la région de votre choix, ou mobiles en 06/07), numéros internationaux dans plus de 40 pays (États-Unis, Royaume-Uni, Allemagne, Espagne, Italie, Suisse, Belgique, Canada, Australie, etc.), numéros verts (gratuits pour l'appelant) pour les lignes de service client, et numéros courts pour les campagnes marketing. Le numéro est activé en quelques minutes et peut être transféré vers un autre opérateur si vous quittez Freenzy.io. Vous pouvez également rediriger vos appels existants vers votre numéro Freenzy pour bénéficier du Répondeur IA sans changer votre numéro de téléphone actuel."
      },
      {
        q: "L'agent peut-il passer des appels sortants ?",
        a: "Oui, l'agent Répondeur peut également passer des appels sortants de manière proactive. Cette fonctionnalité est particulièrement utile pour plusieurs cas d'usage professionnels : confirmations de rendez-vous automatiques (appeler le client 24h avant pour confirmer sa présence), relances de prospects (rappeler un lead qui n'a pas donné suite sous 48h avec un message personnalisé), enquêtes de satisfaction post-achat (recueillir le feedback client par téléphone avec questions structurées), campagnes de phoning ciblées (prospecter une liste de contacts avec un script IA adapté à chaque profil), rappels de paiement (contacter les clients en retard de manière professionnelle et bienveillante). L'agent utilise la même voix naturelle ElevenLabs que pour les appels entrants, avec un script IA intelligent qui s'adapte aux réponses de l'interlocuteur en temps réel. Chaque appel est transcrit, résumé et archivé dans votre Flashboard."
      },
      {
        q: "Les SMS sont-ils supportés ?",
        a: "Oui, Freenzy.io supporte l'envoi et la réception de SMS via l'intégration Twilio. Les SMS sont un canal complémentaire essentiel pour plusieurs raisons : ils atteignent 100% des téléphones mobiles (pas besoin de smartphone ni d'application), ils ont un taux d'ouverture de 98% (contre 20% pour les emails), et ils sont lus en moyenne dans les 3 minutes suivant la réception. Vos agents utilisent les SMS pour : les confirmations de rendez-vous (rappel automatique J-1 et H-2), les alertes urgentes qui nécessitent une attention immédiate, les codes de vérification et liens sécurisés, les notifications pour les contacts qui n'ont pas WhatsApp, les campagnes marketing ciblées avec opt-in. Les SMS sont envoyés depuis votre numéro dédié Twilio et le coût est inclus dans les crédits de l'action (environ 0,5 crédit par SMS en France, variable selon le pays de destination)."
      },
      {
        q: "Comment sont gérés les appels manqués ?",
        a: "Avec le Répondeur IA de Freenzy.io, le concept d'appel manqué n'existe plus. Chaque appel entrant est traité instantanément, sans file d'attente, sans musique d'attente et sans répondeur automatique classique. L'agent décroche en moins d'une seconde, quelle que soit l'heure du jour ou de la nuit. Même dans le cas rare où l'appelant raccroche très rapidement (avant que la conversation ne soit complète), l'agent enregistre tout de même les informations disponibles : numéro de l'appelant, durée de l'appel, transcription partielle de la conversation, et envoie un résumé par WhatsApp avec le numéro pour permettre un rappel rapide. L'agent peut également être configuré pour rappeler automatiquement les appels écourtés après un délai paramétrable (par exemple, rappeler 5 minutes après si l'appel a duré moins de 10 secondes). Votre taux de conversion de leads téléphoniques passe ainsi de la moyenne de 50-60% à quasiment 100%."
      },
      {
        q: "Puis-je personnaliser le message d'accueil ?",
        a: "Oui, l'intégralité du comportement de votre agent Répondeur est personnalisable depuis votre tableau de bord Flashboard. Vous pouvez configurer : le message d'accueil (par exemple : « Bonjour et bienvenue chez [Votre Entreprise], je suis votre assistante virtuelle, comment puis-je vous aider ? »), le ton de la conversation (professionnel, chaleureux, expert, décontracté…), le script de qualification (quelles questions poser pour identifier le besoin : nom, société, objet de l'appel, budget, délai, urgence…), les réponses aux questions fréquentes (horaires d'ouverture, adresse, tarifs, services proposés…), les instructions de prise de RDV (créneaux disponibles, durée des rendez-vous, lien de calendrier), le message de fin d'appel, et les règles de transfert (dans quels cas transférer l'appel à un humain). Toutes ces configurations se font en langage naturel — pas de code, pas d'arbre décisionnel complexe."
      },
      {
        q: "Les appels sont-ils enregistrés ?",
        a: "La transcription textuelle complète de chaque appel est systématiquement conservée et consultable dans votre Flashboard. C'est le résumé structuré de la conversation : qui a dit quoi, les informations clés extraites (nom du contact, besoin, coordonnées), la qualification du lead et les actions prises (RDV planifié, email envoyé). Concernant l'enregistrement audio des appels, la situation dépend de la réglementation locale et de vos paramètres. En France, le Code des postes et des communications électroniques exige le consentement explicite de l'appelant pour l'enregistrement audio. Si vous activez cette option, l'agent informe l'appelant en début de conversation (« Cet appel est susceptible d'être enregistré à des fins de qualité… ») et demande son accord. Les enregistrements audio, lorsqu'ils existent, sont stockés de manière chiffrée et soumis aux mêmes règles de confidentialité et de RGPD que toutes vos autres données."
      },
      {
        q: "Combien coûte un appel entrant ?",
        a: "Un appel entrant traité par l'agent Répondeur IA coûte environ 5 crédits (0,50€). Ce tarif tout-en-un inclut l'ensemble de la chaîne de traitement : les frais de communication Twilio (réception de l'appel sur votre numéro dédié), la synthèse vocale ElevenLabs pour la voix naturelle de l'agent (modèle eleven_multilingual_v2 premium), la transcription IA en temps réel de la conversation, l'analyse et la qualification du lead par le modèle IA (identification du besoin, scoring, extraction des informations clés), la prise de rendez-vous dans votre calendrier si applicable, et l'envoi du résumé structuré par WhatsApp et/ou email. Pour mettre ce coût en perspective : un service de secrétariat téléphonique externalisé facture entre 1,50€ et 5€ par appel reçu, sans intelligence de qualification ni envoi WhatsApp instantané. Un standard téléphonique humain 24/7 coûte entre 1000€ et 3000€ par mois. Le Répondeur Freenzy.io offre un service supérieur à une fraction du coût."
      },
    ],
  },

  // ─── 7. STUDIO CRÉATIF ────────────────────────────────
  {
    id: 'studio',
    label: 'Studio Créatif',
    icon: 'palette',
    color: '#ec4899',
    questions: [
      {
        q: "Qu'est-ce que le Studio Créatif ?",
        a: "Le Studio Créatif est l'espace de création visuelle intégré directement dans votre tableau de bord Flashboard. C'est un atelier de production de contenu multimédia alimenté par les technologies IA les plus avancées : Flux (fal.ai) et DALL-E pour les images, LTX Video et Runway ML pour les clips vidéo, D-ID pour les avatars parlants. Depuis une interface unique et intuitive, vous pouvez générer des photos IA photoréalistes, des visuels marketing percutants, des illustrations créatives, des bannières web, des posts pour les réseaux sociaux, des clips vidéo de 5 à 30 secondes et des avatars parlants qui présentent votre contenu avec une voix naturelle. Tout se fait en langage naturel : décrivez simplement ce que vous imaginez et le Studio produit le résultat en quelques secondes. C'est comme avoir un directeur artistique, un photographe et un vidéaste dans votre équipe — disponibles 24/7 et à une fraction du coût traditionnel."
      },
      {
        q: "Quels types d'images peut-on créer ?",
        a: "Le Studio Créatif de Freenzy.io peut générer une variété quasi illimitée d'images IA de haute qualité. Voici les principaux cas d'usage : visuels marketing (publicités, bannières, affiches promotionnelles), photos produit (mise en situation, packshots sur fond blanc, lifestyle), illustrations de blog et d'articles (images d'en-tête, infographies simplifiées), posts réseaux sociaux (carrousels Instagram, visuels LinkedIn, images Twitter), portraits et avatars (profils professionnels, personnages de marque), paysages et décors (immobilier, tourisme, événementiel), logos et identité visuelle (explorations créatives, déclinaisons), supports de présentation (slides, couvertures de rapport), mockups et maquettes (interface, packaging, PLV), illustrations artistiques (style aquarelle, peinture, 3D, pixel art, etc.). Vous décrivez votre vision en langage naturel et le modèle Flux (fal.ai) génère l'image en 5 à 15 secondes. Vous pouvez régénérer, modifier le prompt et créer des variations jusqu'à obtenir le résultat parfait."
      },
      {
        q: "Quels formats vidéo sont disponibles ?",
        a: "Le Studio Créatif propose deux types de production vidéo IA complémentaires. Premièrement, les clips vidéo génératifs via LTX Video (fal.ai) et Runway ML : des vidéos de 5 à 30 secondes créées à partir d'une description textuelle ou d'une image de référence. Idéal pour les stories Instagram, les teasers produit, les transitions créatives, les ambiances visuelles et les publicités courtes. Formats de sortie : MP4 (H.264) et WebM, résolution jusqu'à 1080p, avec différents ratios (16:9, 9:16 pour mobile, 1:1 pour les réseaux). Deuxièmement, les avatars parlants via D-ID : un visage (réel ou généré par IA) est animé pour « lire » votre texte avec des mouvements de lèvres synchronisés et des expressions naturelles, accompagné d'une voix ElevenLabs premium. Parfait pour les tutoriels, les présentations commerciales, les messages personnalisés aux clients, les FAQ vidéo et les témoignages. La génération est asynchrone (file d'attente) pour les formats longs et les vidéos sont accessibles dans votre vidéothèque organisée par projet."
      },
      {
        q: "Puis-je utiliser les créations commercialement ?",
        a: "Oui, vous êtes le propriétaire exclusif de toutes les images et vidéos générées via le Studio Créatif de Freenzy.io. Vous disposez de tous les droits commerciaux sur vos créations : publication sur vos réseaux sociaux et site web, utilisation dans des supports marketing et publicitaires (affiches, flyers, brochures, publicités en ligne), intégration dans des produits ou services commerciaux, impression sur des supports physiques (packaging, merchandising, PLV), diffusion dans des présentations commerciales et des propositions clients. Il n'y a aucune restriction d'usage, aucune attribution requise et aucune redevance. Les images et vidéos sont libres de droits et vous pouvez les modifier, les recadrer et les adapter comme vous le souhaitez. Cette politique de propriété totale est conforme aux conditions d'utilisation des API fal.ai, OpenAI DALL-E et D-ID que nous utilisons."
      },
      {
        q: "Quelle est la résolution des images ?",
        a: "Le Studio Créatif de Freenzy.io propose deux niveaux de résolution pour s'adapter à tous vos besoins. En qualité standard (8 crédits) : résolution de 1024x1024 pixels, parfaite pour les publications sur les réseaux sociaux (LinkedIn, Instagram, Twitter), les illustrations de blog, les visuels d'email marketing et les présentations PowerPoint. Cette résolution est optimale pour l'affichage sur écran et offre un excellent rapport qualité-coût. En qualité HD (12 crédits) : résolution jusqu'à 2048x2048 pixels, idéale pour les supports print haute qualité (affiches, flyers, brochures), les bannières grand format, les visuels pour sites web en plein écran et les projets nécessitant un zoom détaillé. Les images peuvent être générées dans différents ratios : 1:1 (carré), 16:9 (paysage), 9:16 (portrait/mobile), 4:3 et 3:2. Le redimensionnement et le recadrage sont disponibles directement dans l'interface du Studio."
      },
      {
        q: "L'agent Photo génère-t-il aussi les visuels ?",
        a: "Oui, l'agent Photo/Visuel est un agent IA spécialisé qui travaille en étroite collaboration avec le Studio Créatif et les autres agents de votre équipe. Son rôle va au-delà de la simple génération d'images : il comprend le contexte de votre marque, votre charte graphique, votre positionnement et génère des visuels cohérents avec votre identité. Concrètement, lorsque l'agent Marketing planifie un post LinkedIn, il peut automatiquement demander à l'agent Photo de créer le visuel d'accompagnement adapté au format et au message. L'agent Communication peut lui demander un visuel pour un communiqué de presse. L'agent Commercial peut demander une illustration pour une proposition commerciale. L'agent Photo gère sa propre file de demandes (visible dans la section « Demandes agents » du Studio) et produit les visuels de manière autonome en respectant vos directives créatives. C'est un directeur artistique IA qui ne dort jamais et qui connaît parfaitement votre marque."
      },
      {
        q: "Combien de temps prend la génération ?",
        a: "Les temps de génération du Studio Créatif de Freenzy.io sont conçus pour la productivité. Pour une image IA (Flux/fal.ai) : 5 à 15 secondes en mode synchrone — le résultat apparaît directement dans l'interface, quasi instantanément. Pour une image HD haute résolution : 10 à 25 secondes. Pour un clip vidéo de 5 à 30 secondes (LTX Video/Runway ML) : 30 à 90 secondes en file d'attente asynchrone — vous pouvez continuer à travailler sur autre chose pendant la génération et vous êtes notifié quand le clip est prêt. Pour un avatar parlant D-ID (30 secondes de vidéo) : 1 à 2 minutes en file asynchrone. Tous les contenus générés sont automatiquement sauvegardés dans votre galerie (images) ou vidéothèque (vidéos), organisées par date, par agent demandeur et par projet. Vous pouvez lancer plusieurs générations en parallèle : la file d'attente gère les priorités automatiquement."
      },
      {
        q: "Puis-je modifier une image générée ?",
        a: "Actuellement, le Studio Créatif propose plusieurs options pour affiner vos créations. La régénération avec prompt modifié : vous ajustez votre description et le modèle produit une nouvelle version. C'est la méthode la plus efficace pour itérer rapidement. Les variations : à partir d'une image qui vous plaît, le modèle génère des versions alternatives en conservant le style et la composition générale. Le changement de style : appliquer un style artistique différent (photoréaliste, illustration, aquarelle, 3D, minimaliste…) à un même concept. Le changement de résolution : passer de standard à HD ou modifier le ratio (carré, paysage, portrait). L'édition pixel par pixel (inpainting/outpainting — modifier une zone spécifique de l'image tout en conservant le reste) est dans notre roadmap et sera disponible prochainement. En attendant, vous pouvez exporter vos images et les retoucher dans votre outil d'édition préféré (Canva, Photoshop, Figma…)."
      },
      {
        q: "Les agents peuvent-ils demander des créations ?",
        a: "Oui, c'est l'une des fonctionnalités les plus puissantes du Studio Créatif : la création collaborative inter-agents. Les agents de votre équipe peuvent automatiquement soumettre des demandes de création visuelle au Studio, en coordination avec l'agent Photo/Visuel. Exemples concrets : l'agent Marketing planifie un post LinkedIn → il demande au Studio de générer un visuel d'illustration adapté au sujet et au format. L'agent Commercial prépare une proposition → il demande un visuel de couverture professionnel. L'agent Communication rédige un communiqué → il demande un visuel de presse. L'agent RH publie une offre d'emploi → il demande un visuel « We're Hiring » aux couleurs de l'entreprise. Chaque demande d'agent est visible dans la section « Demandes agents » du Studio avec le statut (en attente, en cours, terminée), le résultat, et la possibilité de régénérer si le visuel ne convient pas. Tout est tracé et organisé dans une file de demandes dédiée."
      },
      {
        q: "Comment organiser mes créations ?",
        a: "Le Studio Créatif de Freenzy.io intègre un système d'organisation complet pour gérer efficacement toutes vos créations. La galerie photo affiche toutes vos images générées avec des filtres par date, par résolution, par agent demandeur (création libre vs demande d'agent) et par projet. Vous pouvez ajouter des tags, des favoris et des descriptions pour retrouver facilement vos visuels. La vidéothèque organise vos clips vidéo et avatars parlants avec un regroupement par « projets vidéo » : vous créez un projet (par exemple « Campagne produit Q2 ») et regroupez tous les clips associés. Un lecteur HTML5 intégré permet de prévisualiser directement dans l'interface. L'historique des demandes agents affiche chronologiquement toutes les créations demandées automatiquement par vos agents IA, avec le contexte de la demande. Tous les contenus sont exportables en haute qualité et les métadonnées (prompt, paramètres, coût) sont conservées pour référence."
      },
    ],
  },

  // ─── 8. CRÉATION SUR MESURE ───────────────────────────
  {
    id: 'custom',
    label: 'Sur mesure',
    icon: 'build',
    color: '#8b5cf6',
    questions: [
      {
        q: "Puis-je créer mes propres agents ?",
        a: "Oui, et c'est l'une des forces de Freenzy.io. Depuis votre tableau de bord Flashboard, vous pouvez créer un agent IA entièrement personnalisé en quelques minutes, sans aucune compétence technique. Le processus est guidé : vous choisissez un nom pour votre agent, définissez son rôle et sa mission (par exemple : « Agent de support client spécialisé dans les retours produit »), rédigez ses instructions en langage naturel (comment il doit se comporter, quel ton utiliser, quelles informations demander), sélectionnez le modèle IA par défaut (Haiku pour les tâches rapides, Sonnet pour la rédaction, Opus pour l'analyse complexe), connectez les outils nécessaires (email, WhatsApp, calendrier, CRM…), et configurez ses paramètres avancés (horaires d'activité, limite de crédits, règles de notification). Votre agent personnalisé bénéficie de la même infrastructure que les agents intégrés : mémoire longue durée (RAG), collaboration inter-agents et accès à tous les modèles IA du marché."
      },
      {
        q: "Qu'est-ce qu'un module sur mesure ?",
        a: "Un module sur mesure est une solution IA complète créée spécifiquement pour votre métier ou votre cas d'usage unique. Il va au-delà d'un simple agent personnalisé : c'est un ensemble coordonné comprenant un ou plusieurs agents spécialisés, des workflows automatisés, des intégrations sur mesure avec vos outils existants, et une configuration optimisée pour votre activité. Par exemple : un Module Immobilier complet inclurait un agent qui rédige automatiquement les annonces à partir des caractéristiques du bien, un agent qui qualifie les demandes entrantes par téléphone et WhatsApp, un agent qui planifie les visites et envoie les confirmations, et un dashboard personnalisé avec les KPIs pertinents (nombre de visites, taux de conversion, délai moyen de vente). Autre exemple : un Module Restaurant avec un agent qui gère les réservations par WhatsApp, confirme par SMS, adapte le plan de salle et envoie les menus du jour aux clients fidèles."
      },
      {
        q: "Pouvez-vous créer un agent pour moi ?",
        a: "Absolument. Si votre besoin est spécifique ou complexe, notre équipe d'experts Freenzy.io peut concevoir, configurer et déployer des agents sur mesure directement dans votre espace. Le processus est simple : vous nous décrivez votre besoin (par téléphone, email ou chat), notre équipe analyse votre cas d'usage et propose une architecture de solution sous 48h (agents nécessaires, workflows, intégrations, estimation de coûts d'utilisation). Après validation, nous développons et testons l'agent dans un environnement de staging, puis nous le déployons dans votre Flashboard avec une phase de rodage supervisé. Nous assurons également une formation à l'utilisation et un suivi post-déploiement pendant 2 semaines. Exemples de réalisations : agent de prise de commande vocale pour une chaîne de restauration rapide, agent de tri de candidatures pour un cabinet de recrutement, agent de veille réglementaire pour un cabinet d'avocats, agent de suivi de chantier pour une entreprise BTP."
      },
      {
        q: "Combien coûte un agent sur mesure ?",
        a: "La création d'un agent personnalisé simple en self-service (via l'interface Flashboard) est entièrement gratuite — c'est inclus dans votre compte Freenzy.io. Vous ne payez que les crédits consommés lorsque l'agent exécute des actions IA. Pour les agents sur mesure développés par notre équipe (Module sur mesure), le tarif dépend de la complexité du projet : un agent simple avec des instructions personnalisées et des intégrations standard peut être configuré gratuitement ou pour un forfait de mise en service modique. Un module complet avec plusieurs agents coordonnés, des workflows complexes et des intégrations sur mesure fait l'objet d'un devis personnalisé. Contactez-nous à custom@freenzy.io ou via le formulaire dans Flashboard avec la description de votre besoin, et nous vous proposons une solution avec un devis détaillé sous 48h. Pour les clients Enterprise, le développement d'agents sur mesure est inclus dans l'accompagnement dédié."
      },
      {
        q: "Quels outils puis-je connecter ?",
        a: "Freenzy.io propose un écosystème d'intégrations riche et en constante expansion. Les intégrations natives disponibles incluent : Email (envoi et réception via SMTP/IMAP, compatible Gmail, Outlook, ProtonMail), WhatsApp Business (messages bidirectionnels via Twilio), SMS (envoi et réception via Twilio), Téléphonie (appels entrants et sortants via Twilio), Calendrier (synchronisation des rendez-vous), CRM (Salesforce, HubSpot, Pipedrive via API), Google Sheets (lecture et écriture de données tabulaires), Notion (synchronisation de bases de données et pages), Slack (notifications et commandes dans vos channels), Stripe (suivi des paiements et facturation), et les API REST externes (connexion à n'importe quel service disposant d'une API). Pour les clients Enterprise, nous développons des connecteurs personnalisés vers vos outils métier spécifiques (ERP, logiciel de caisse, solution de gestion propriétaire, etc.). Les webhooks entrants et sortants sont également disponibles pour les intégrations avancées."
      },
      {
        q: "Les workflows multi-agents sont-ils possibles ?",
        a: "Oui, les workflows multi-agents sont l'une des fonctionnalités les plus puissantes de Freenzy.io et ce qui le distingue des chatbots traditionnels. Vous pouvez créer des chaînes d'actions automatisées où plusieurs agents collaborent en séquence ou en parallèle. Voici un exemple complet de workflow : un lead appelle votre numéro → le Répondeur IA qualifie le besoin en 2 minutes (budget, délai, type de projet) et planifie un RDV → les informations sont automatiquement transmises au Commercial qui génère un email de confirmation personnalisé + un devis préliminaire → la Finance enregistre l'opportunité dans le pipeline avec le montant estimé → le Marketing ajoute le contact dans la séquence de nurturing par email (J+1, J+3, J+7) → l'agent DG intègre cette donnée dans son rapport stratégique hebdomadaire. Tout cela se produit en moins de 60 secondes, sans aucune intervention humaine. Vous pouvez créer vos propres workflows depuis l'interface Flashboard en définissant les déclencheurs et les actions de chaque agent."
      },
      {
        q: "Puis-je partager un agent avec mon équipe ?",
        a: "Oui, la collaboration d'équipe est pleinement supportée dans Freenzy.io. Les agents personnalisés que vous créez peuvent être partagés avec les membres de votre équipe selon différents niveaux d'accès. Un agent partagé en mode « utilisation » permet à vos collaborateurs de converser avec l'agent et de déclencher des actions, en utilisant leurs propres crédits. Un agent partagé en mode « configuration » permet à certains membres de modifier les paramètres, les instructions et les intégrations de l'agent. Chaque membre interagit avec l'agent dans son propre contexte : les conversations et les données sont isolées entre les utilisateurs (sauf si vous configurez un espace partagé). L'agent conserve une mémoire commune (le contexte de l'entreprise, les procédures) et une mémoire individuelle par utilisateur (préférences personnelles, historique de conversation). La gestion des accès utilise le système RBAC (admin, operator, viewer) pour un contrôle granulaire."
      },
      {
        q: "Existe-t-il des exemples de modules ?",
        a: "Oui, voici une sélection de modules sur mesure que nous avons développés ou que vous pouvez créer : Agent Immobilier — rédaction automatique d'annonces attractives à partir de la fiche du bien, qualification téléphonique des acheteurs potentiels, planification des visites et suivi post-visite. Veille Juridique — surveillance automatique des nouvelles réglementations et jurisprudences, alertes par email et WhatsApp, résumés synthétiques des textes importants pour votre secteur. Maître d'Hôtel IA — gestion des réservations par WhatsApp et téléphone, confirmation automatique par SMS, envoi du menu du jour aux clients fidèles, suivi des préférences alimentaires. Suivi Logistique — tracking en temps réel des colis, alertes retard, relance automatique des transporteurs, notification client proactive. Coach Sportif — programmes d'entraînement personnalisés, suivi nutrition, messages de motivation quotidiens, adaptation selon les résultats. Agent SAV E-commerce — tri et réponse automatique aux demandes clients, gestion des retours, FAQ dynamique, escalade vers un humain si nécessaire."
      },
      {
        q: "Puis-je vendre mes agents sur le marketplace ?",
        a: "Le programme créateur de Freenzy.io est en cours de développement et sera bientôt disponible. Il permettra à tous les utilisateurs de publier leurs agents personnalisés sur le marketplace Freenzy.io et de les monétiser. Le fonctionnement prévu est le suivant : vous créez un agent performant et bien configuré pour un cas d'usage spécifique, vous le packagez en « template » avec une description, des captures d'écran et un prix (gratuit ou premium), vous le soumettez à notre équipe de revue qualité, et une fois validé, il est publié sur le marketplace accessible à tous les utilisateurs. Lorsqu'un utilisateur installe votre template, vous touchez une commission sur le prix de vente (les détails du partage de revenus seront annoncés avec le lancement du programme). C'est une opportunité unique de monétiser votre expertise métier : un consultant RH peut créer un agent de recrutement, un expert-comptable un agent fiscal, un community manager un agent social media — et les vendre à des milliers d'utilisateurs."
      },
      {
        q: "Les agents sur mesure ont-ils accès à tous les modèles ?",
        a: "Oui, absolument. Vos agents personnalisés bénéficient exactement des mêmes capacités techniques que les agents intégrés à Freenzy.io. Ils ont accès à l'intégralité des modèles IA disponibles sur la plateforme : Claude d'Anthropic (Haiku, Sonnet, Opus avec Extended Thinking), GPT d'OpenAI (GPT-4o, o3, GPT-4.5), Gemini de Google (Flash, Pro, Ultra), Llama de Meta (Llama 4), Grok de xAI, Mistral, et tous les futurs modèles ajoutés à la plateforme. Vous choisissez le modèle par défaut de votre agent lors de la création, et l'agent peut automatiquement basculer vers un modèle plus puissant si la complexité de la tâche l'exige (par exemple, passer de Sonnet à Opus pour une analyse stratégique). Vos agents personnalisés ont également accès à tous les outils de la plateforme : voix ElevenLabs, téléphonie Twilio, Studio Créatif (images et vidéos), mémoire RAG, et toutes les intégrations. Aucune limitation technique par rapport aux agents natifs."
      },
    ],
  },

  // ─── 9. FLASHBOARD (TABLEAU DE BORD) ──────────────────
  {
    id: 'dashboard',
    label: 'Flashboard',
    icon: 'bar_chart',
    color: '#f97316',
    questions: [
      {
        q: "Qu'est-ce que Flashboard ?",
        a: "Flashboard est le tableau de bord intelligent qui constitue le cœur de l'expérience Freenzy.io. C'est votre centre de commande centralisé pour piloter l'ensemble de vos 72+ agents IA depuis une interface unique, élégante et intuitive. Flashboard vous permet de : communiquer avec chaque agent en langage naturel via un chat en temps réel (streaming), surveiller l'activité de tous vos agents en direct (flux d'événements temps réel via SSE), consulter les rapports et analyses générés automatiquement, gérer vos crédits et suivre votre consommation avec des graphiques détaillés, accéder au Studio Créatif pour la génération d'images et de vidéos, configurer les paramètres de chaque agent (ton, modèle IA, outils, horaires), inviter et gérer les membres de votre équipe avec des rôles et permissions, et exporter toutes vos données en PDF, CSV et JSON. L'interface est construite avec Next.js 14 pour des performances optimales, et supporte le mode sombre pour le confort de travail."
      },
      {
        q: "Flashboard est-il responsive ?",
        a: "Oui, Flashboard est conçu avec une approche mobile-first et fonctionne parfaitement sur tous les types d'écrans. Sur desktop (>1024px) : interface complète avec barre latérale de navigation, panneaux multiples et vue détaillée — idéale pour le travail quotidien intensif. Sur tablette (768-1024px) : interface adaptée avec barre latérale rétractable et mise en page optimisée pour l'écran tactile — parfait pour les réunions et les déplacements. Sur smartphone (<768px) : interface compacte avec navigation par onglets, interactions tactiles optimisées (zones de clic ≥44px), et tous les agents accessibles dans une vue simplifiée — l'essentiel au bout de vos doigts. Chaque composant de Flashboard (chat, rapports, Studio, paramètres, crédits) est optimisé pour chaque format d'écran. L'expérience est fluide grâce au framework Next.js 14 avec le rendu côté serveur (SSR) et la navigation instantanée (client-side routing)."
      },
      {
        q: "Puis-je voir l'activité de mes agents en temps réel ?",
        a: "Oui, c'est l'une des fonctionnalités phares de Flashboard. Le flux d'activité en direct (Activity Feed) affiche en temps réel chaque action exécutée par vos agents IA grâce à la technologie Server-Sent Events (SSE). Vous voyez défiler les événements au fur et à mesure qu'ils se produisent : appels traités par le Répondeur (avec le résumé), emails envoyés par le Commercial (avec l'objet et le destinataire), posts publiés par le Marketing (avec un aperçu), documents générés (devis, rapports, contrats), images et vidéos créées par le Studio, alertes et notifications importantes, et les échanges entre agents lorsqu'ils collaborent sur une tâche. Chaque événement est cliquable pour voir le détail complet. Des filtres permettent d'afficher uniquement les événements d'un agent spécifique, d'un type d'action ou d'une période donnée. C'est comme avoir une salle de contrôle d'où vous supervisez toute votre équipe IA en un coup d'œil."
      },
      {
        q: "Comment fonctionne le chat avec les agents ?",
        a: "Le chat Flashboard offre une expérience de conversation fluide et naturelle avec chacun de vos agents IA. L'interface ressemble à une messagerie moderne : vous tapez votre demande en langage naturel (français ou toute autre langue supportée) et l'agent répond en temps réel avec un effet de streaming — le texte apparaît mot par mot, comme si l'agent écrivait devant vous. Vous pouvez joindre des fichiers (PDF, Word, Excel, images) pour que l'agent les analyse, partager des liens web, demander des modifications en cours de conversation et lancer des actions concrètes directement depuis le chat (« Envoie cet email à jean@example.com », « Publie ce post sur LinkedIn maintenant »). Chaque conversation est sauvegardée et consultable dans l'historique. L'agent se souvient de vos conversations précédentes grâce à sa mémoire RAG, ce qui rend chaque échange plus contextualisé et pertinent que le précédent. Vous pouvez basculer entre les différents agents via la barre latérale sans perdre le fil de vos conversations."
      },
      {
        q: "Puis-je inviter mon équipe ?",
        a: "Oui, Flashboard est conçu pour le travail collaboratif. Vous pouvez inviter autant de collaborateurs que nécessaire avec des niveaux d'accès différents grâce au système RBAC (Role-Based Access Control). Le rôle Admin donne un accès complet : gestion des agents, configuration, invitations, facturation et audit logs. Le rôle Operator permet d'utiliser tous les agents et de lancer des actions, mais sans accès à la configuration ni à la facturation. Le rôle Viewer est en consultation uniquement : accès aux rapports, à l'historique et aux résultats, mais sans possibilité d'action. Chaque membre dispose de son propre espace de conversation avec les agents et utilise ses propres crédits (ou un pool de crédits partagé en mode Enterprise). Les données sensibles (conversations personnelles, paramètres de compte) sont isolées entre les membres. L'invitation se fait par email depuis les paramètres Flashboard — le collaborateur reçoit un lien d'activation sécurisé."
      },
      {
        q: "Le mode sombre est-il disponible ?",
        a: "Oui, Flashboard propose un mode sombre intégré, activable en un seul clic depuis la barre latérale. Le mode sombre a été conçu avec soin pour offrir un confort visuel optimal, en particulier lors des longues sessions de travail et dans les environnements peu éclairés. Les couleurs sont soigneusement calibrées pour garantir un contraste suffisant (conforme aux normes WCAG AA d'accessibilité) tout en réduisant la fatigue oculaire. L'ensemble de l'interface s'adapte : le tableau de bord, les chats avec les agents, le Studio Créatif, les paramètres, les graphiques et tous les composants sont optimisés pour le mode sombre. La préférence est sauvegardée dans votre profil et appliquée automatiquement à chaque connexion. Le mode sombre respecte également les préférences système : si votre navigateur ou votre OS est configuré en mode sombre, Flashboard peut s'adapter automatiquement."
      },
      {
        q: "Puis-je exporter mes données ?",
        a: "Oui, l'exportation complète de vos données est un droit fondamental garanti par le RGPD (droit à la portabilité) et une fonctionnalité native de Flashboard. Vous pouvez exporter : vos conversations avec les agents en PDF ou JSON (avec les métadonnées : date, modèle utilisé, coût), les rapports et analyses en PDF formaté (prêts à imprimer ou à partager), l'historique de crédits et de dépenses en CSV (importable dans Excel ou Google Sheets pour votre comptabilité), les images et vidéos générées par le Studio en haute résolution, les documents produits par les agents (emails, devis, contrats, articles) en format d'origine, et l'export complet de votre compte (toutes les données) en JSON structuré. Les exports sont disponibles depuis chaque section de Flashboard (bouton d'export dédié) et depuis les paramètres de votre compte pour l'export global. Les administrateurs d'équipe peuvent également exporter les données consolidées de tous les membres."
      },
      {
        q: "Comment fonctionne le briefing matinal ?",
        a: "Le Réveil Intelligent est l'un des services les plus appréciés de Freenzy.io. Chaque matin, à l'heure de votre choix, vous recevez un briefing personnalisé qui synthétise tout ce que vous devez savoir pour commencer votre journée. Le briefing inclut : la météo de votre ville avec les prévisions de la journée, votre agenda du jour (rendez-vous, deadlines, événements), les actualités de votre secteur d'activité (analysées et résumées par l'IA), les KPIs de la veille (performance commerciale, marketing, financière si applicable), les actions des agents pendant la nuit (leads qualifiés, emails importants reçus, tâches accomplies), les priorités et recommandations pour la journée suggérées par l'agent DG. Ce briefing est disponible en version audio (voix naturelle ElevenLabs, écoutable pendant votre trajet ou votre petit-déjeuner), en version texte sur WhatsApp, et en version détaillée dans votre Flashboard. Le Réveil propose 8 modes différents et 18 rubriques personnalisables selon vos centres d'intérêt."
      },
      {
        q: "Y a-t-il des raccourcis clavier ?",
        a: "Oui, Flashboard intègre des raccourcis clavier pour accélérer votre navigation et votre productivité. Le raccourci principal est Cmd+K (Mac) ou Ctrl+K (Windows/Linux) qui ouvre la Recherche Globale (Global Search) : une barre de recherche universelle qui vous permet de trouver instantanément un agent, une conversation, un document, un paramètre ou une action depuis n'importe quelle page de Flashboard. C'est l'outil de productivité ultime — tapez quelques lettres et accédez directement à ce que vous cherchez. Les autres raccourcis de navigation sont affichés dans la barre latérale pour un accès rapide aux sections principales (Dashboard, Agents, Studio, Paramètres, Crédits). Le système de raccourcis est inspiré des meilleures pratiques de productivité (Cmd+K de VS Code, Spotlight de macOS, Ctrl+K de Notion) pour une expérience familière et efficace."
      },
      {
        q: "Puis-je personnaliser le tableau de bord ?",
        a: "Oui, Flashboard offre plusieurs niveaux de personnalisation pour s'adapter à votre façon de travailler. La page d'accueil (Dashboard) est configurable : vous choisissez quels widgets afficher en priorité (activité récente, solde de crédits, agents les plus actifs, métriques clés, dernières créations du Studio, rappels et notifications). La barre latérale de navigation peut être réorganisée pour mettre en avant les sections que vous utilisez le plus fréquemment. Chaque agent peut être « épinglé » en favori pour un accès rapide depuis le dashboard. Les graphiques de consommation et de performance sont personnalisables en termes de période (jour, semaine, mois, trimestre) et de type de visualisation. Le mode d'affichage (clair/sombre) est mémorisé. Les notifications sont configurables agent par agent (push, email, WhatsApp, aucune). Pour les clients Enterprise, des tableaux de bord personnalisés avec des KPIs métier spécifiques peuvent être développés sur demande."
      },
    ],
  },

  // ─── 10. ENTREPRISE & ÉQUIPE ──────────────────────────
  {
    id: 'enterprise',
    label: 'Entreprise',
    icon: 'account_balance',
    color: '#9333ea',
    questions: [
      {
        q: "Freenzy.io convient-il aux grandes entreprises ?",
        a: "Oui, Freenzy.io propose un plan Enterprise spécifiquement conçu pour les besoins des grandes organisations. Ce plan inclut des fonctionnalités avancées de sécurité et de gouvernance : SSO (Single Sign-On) via SAML 2.0 et OpenID Connect pour une authentification centralisée, 2FA obligatoire pour tous les utilisateurs, IP whitelist pour restreindre l'accès, audit logs détaillés exportables vers des SIEM (Splunk, Datadog), et chiffrement de bout en bout. Côté opérationnel : un SLA garanti de 99,9% de disponibilité, un account manager dédié, un support prioritaire avec temps de réponse garanti sous 4h, des tarifs dégressifs significatifs sur les crédits (jusqu'à -30% selon le volume), l'isolation complète des données par équipe et par projet (Multi-Projects), la possibilité de créer des agents sur mesure développés par notre équipe, et le déploiement on-premise optionnel pour un contrôle total de l'infrastructure. L'onboarding Enterprise inclut une formation personnalisée pour vos équipes."
      },
      {
        q: "Combien d'utilisateurs peut-on avoir ?",
        a: "Il n'y a aucune limite au nombre d'utilisateurs sur Freenzy.io, quel que soit votre plan. C'est cohérent avec notre philosophie Free & Easy : pas de barrière artificielle à l'adoption. Sur le plan standard (gratuit), vous pouvez inviter autant de collaborateurs que nécessaire — chaque membre crée son compte et utilise ses propres crédits. Le système RBAC (admin, operator, viewer) vous permet de contrôler les accès et les permissions de chaque membre. Le plan Enterprise ajoute des fonctionnalités de gestion avancée pour les grandes équipes : groupes d'utilisateurs, politiques de permissions granulaires (accès par agent, par fonctionnalité, par projet), pool de crédits partagé avec limites par utilisateur, rapports de consommation par département, onboarding automatisé pour les nouveaux arrivants et offboarding sécurisé (désactivation immédiate des accès) pour les départs. Notre infrastructure (PostgreSQL 16, Redis 7, Node.js 20+) est conçue pour supporter des milliers d'utilisateurs simultanés."
      },
      {
        q: "Les données sont-elles isolées entre les équipes ?",
        a: "Oui, l'isolation des données est un principe architectural fondamental de Freenzy.io. Le système Multi-Projects garantit un cloisonnement complet à plusieurs niveaux. Au niveau utilisateur : chaque membre a son propre espace de conversation, sa mémoire d'agent personnelle et son historique privé. Au niveau projet : vous pouvez créer des projets distincts (par exemple : « Startup A », « Startup B » pour un incubateur) avec des agents, des données, une configuration et des crédits totalement isolés — aucune donnée ne fuit d'un projet à l'autre. Au niveau équipe : dans le plan Enterprise, les départements d'une même organisation peuvent avoir des espaces séparés avec des agents configurés différemment et des permissions spécifiques. L'isolation est implémentée au niveau applicatif ET au niveau de la base de données PostgreSQL, avec des politiques de sécurité row-level qui empêchent techniquement tout accès croisé, même en cas de bug applicatif. Les audit logs tracent chaque accès aux données pour la conformité."
      },
      {
        q: "Proposez-vous un SLA ?",
        a: "Oui, un SLA (Service Level Agreement) est proposé pour les clients du plan Enterprise de Freenzy.io. Notre SLA standard garantit une disponibilité de 99,9% sur une base mensuelle, soit un maximum de 43 minutes d'indisponibilité par mois. Ce SLA couvre l'accès au tableau de bord Flashboard, le fonctionnement des agents IA, les intégrations de téléphonie (Twilio) et de messagerie (WhatsApp), et le Studio Créatif. Le SLA inclut : une supervision proactive 24/7 de l'infrastructure avec des alertes automatiques, un support prioritaire avec un temps de première réponse garanti sous 4 heures (sous 1 heure pour les incidents critiques), une communication transparente en cas d'incident (page de statut publique), un post-mortem détaillé après chaque incident significatif, et des crédits de compensation automatiques si le SLA n'est pas respecté. Pour les clients ayant des exigences encore plus strictes, un SLA renforcé (99,95% ou 99,99%) est négociable avec un contrat personnalisé."
      },
      {
        q: "Le déploiement on-premise est-il possible ?",
        a: "Oui, le déploiement on-premise (ou sur cloud privé) est disponible pour les clients du plan Enterprise de Freenzy.io. Cette option est conçue pour les organisations qui ont des exigences strictes en matière de souveraineté des données, de conformité réglementaire (secteur bancaire, santé, défense) ou de politique de sécurité interne. Le déploiement utilise Docker et Docker Compose pour une installation reproductible sur votre infrastructure : que ce soit un cloud privé (AWS, Azure, GCP, OVH, Scaleway), des serveurs physiques dans votre datacenter, ou une infrastructure hybride. L'ensemble de la stack est conteneurisé : l'application Node.js/TypeScript (backend + API), le dashboard Next.js 14, PostgreSQL 16 avec pgvector, Redis 7, et tous les services auxiliaires. Vous gardez un contrôle total sur vos données, votre réseau et vos politiques de sécurité. Notre équipe assure l'installation initiale, la formation de votre équipe technique, et un support de maintenance continu."
      },
      {
        q: "Comment gérer les permissions ?",
        a: "Freenzy.io implémente un système RBAC (Role-Based Access Control) avec 4 rôles prédéfinis, chacun offrant un niveau d'accès adapté à un profil d'utilisateur spécifique. Le rôle Admin offre un accès complet à toutes les fonctionnalités : gestion des agents, configuration de la plateforme, invitation et gestion des membres, accès à la facturation et aux audit logs, et la possibilité de supprimer des données. Le rôle Operator permet d'utiliser tous les agents, de lancer des actions (emails, appels, publications, créations), d'accéder au Studio Créatif et de consulter les rapports, mais sans accès à la configuration avancée ni à la facturation. Le rôle Viewer offre un accès en consultation uniquement : lecture des rapports, consultation de l'historique des actions, visualisation des créations, mais sans possibilité de déclencher des actions ou de modifier des paramètres. Le rôle System est réservé à l'automatisation : accès API pour les processus internes et les agents autonomes. Les permissions sont configurables par agent et par fonctionnalité pour un contrôle granulaire."
      },
      {
        q: "Freenzy.io s'intègre-t-il à nos outils existants ?",
        a: "Oui, l'intégration avec votre écosystème d'outils existant est une priorité de Freenzy.io. Plusieurs niveaux d'intégration sont disponibles. Les intégrations natives (prêtes à l'emploi) : email (Gmail, Outlook, SMTP/IMAP), WhatsApp Business, SMS, téléphonie (Twilio), Stripe (paiement), Google Sheets et Google Calendar. Les intégrations API : Freenzy.io expose une API REST complète et documentée qui permet à n'importe quel outil de communiquer avec vos agents — envoi de tâches, récupération de résultats, consultation de données. Les webhooks : Freenzy.io peut envoyer des notifications HTTP à vos outils en temps réel (nouveau lead qualifié → webhook vers votre CRM, email envoyé → webhook vers votre outil de tracking). Les intégrations tierces : Slack (notifications dans vos channels), Teams (notifications), Notion (synchronisation de pages et bases), Salesforce, HubSpot, Pipedrive (CRM). Pour les clients Enterprise : des connecteurs sur mesure vers vos outils métier spécifiques (ERP, logiciel de caisse, solution propriétaire) sont développés par notre équipe."
      },
      {
        q: "Y a-t-il un programme de parrainage ?",
        a: "Le programme de parrainage Freenzy.io est actuellement en cours de développement et sera lancé très prochainement. Il sera conçu dans l'esprit Free & Easy pour récompenser généreusement les utilisateurs qui recommandent la plateforme à leur réseau. Le programme prévu inclura : un bonus de crédits pour le parrain à chaque filleul qui crée un compte et effectue sa première recharge, un bonus de bienvenue supplémentaire pour le filleul (en plus du bonus d'inscription standard), un système de paliers avec des avantages croissants selon le nombre de filleuls actifs, un tableau de bord de parrainage dans Flashboard avec le suivi de vos invitations et de vos gains, et potentiellement des récompenses spéciales pour les meilleurs ambassadeurs (accès prioritaire aux nouvelles fonctionnalités, badges, etc.). En attendant le lancement officiel, n'hésitez pas à recommander Freenzy.io autour de vous — quand le programme sera actif, les parrainages antérieurs seront rétroactivement comptabilisés."
      },
      {
        q: "Proposez-vous de la formation ?",
        a: "Oui, Freenzy.io propose plusieurs niveaux de formation et d'accompagnement pour garantir une adoption réussie de la plateforme. Pour tous les utilisateurs (gratuit) : une base de connaissance en ligne complète avec des tutoriels vidéo, des guides pas-à-pas, des cas d'usage par métier, et cette FAQ de 100+ questions qui couvre la quasi-totalité des sujets. Des webinaires mensuels de découverte sont également organisés pour présenter les nouvelles fonctionnalités. Pour les clients Enterprise et les modules sur mesure : un onboarding personnalisé avec un consultant dédié qui configure la plateforme selon vos besoins spécifiques, une formation des équipes en visioconférence (2-4 heures selon la taille de l'équipe), une documentation dédiée adaptée à votre contexte d'utilisation, un support prioritaire pendant les 2 premières semaines (period de rodage supervisé), et des sessions de suivi trimestrielles pour optimiser l'utilisation et découvrir les nouvelles fonctionnalités. Notre objectif est que chaque utilisateur tire le maximum de valeur de Freenzy.io, quel que soit son niveau technique."
      },
      {
        q: "Comment obtenir un devis entreprise ?",
        a: "Obtenir un devis Enterprise personnalisé est simple et rapide. Trois canaux sont à votre disposition : le formulaire Enterprise sur la page Tarifs de notre site (renseignez votre entreprise, le nombre d'utilisateurs estimé, vos besoins spécifiques et nous vous contactons sous 24h), un email direct à enterprise@freenzy.io avec une description de votre projet et de vos besoins, ou le chat Flashboard depuis votre tableau de bord — demandez simplement « Je souhaite un devis Enterprise » et votre demande sera transmise à notre équipe commerciale. Le processus se déroule généralement en 3 étapes : un premier échange téléphonique de 30 minutes pour comprendre votre contexte et vos besoins (nombre d'utilisateurs, agents souhaités, intégrations, exigences de sécurité), la préparation d'un devis détaillé sous 48h avec les tarifs dégressifs, les options incluses et les services d'accompagnement, et enfin la mise en place avec un onboarding personnalisé. Nous nous adaptons à votre processus d'achat : bon de commande, contrat-cadre, conformité achats, etc."
      },
    ],
  },
];

// Helper: flatten all questions for SEO schema
export function getAllFaqItems(): FaqItem[] {
  return FAQ_CATEGORIES.flatMap(cat => cat.questions);
}

// Total count
export const TOTAL_FAQ_COUNT = FAQ_CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0);
