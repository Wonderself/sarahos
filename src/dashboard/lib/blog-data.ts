// blog-data.ts — Static blog articles for SEO and content marketing
// All keys use fz_ prefix per project convention

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;      // Markdown-like content with ** for bold
  category: BlogCategory;
  tags: string[];
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;      // minutes
  icon: string;          // material icon
  color: string;
  featured: boolean;
}

export type BlogCategory = 'guides' | 'cas-usage' | 'produit' | 'ia-business' | 'tutoriels' | 'communaute';

export const BLOG_CATEGORIES: { id: BlogCategory; label: string; icon: string; color: string }[] = [
  { id: 'guides', label: 'Guides', icon: 'menu_book', color: '#7c3aed' },
  { id: 'cas-usage', label: "Cas d'usage", icon: 'business_center', color: '#06b6d4' },
  { id: 'produit', label: 'Produit', icon: 'rocket_launch', color: '#f59e0b' },
  { id: 'ia-business', label: 'IA & Business', icon: 'psychology', color: '#ec4899' },
  { id: 'tutoriels', label: 'Tutoriels', icon: 'school', color: '#22c55e' },
  { id: 'communaute', label: 'Communauté', icon: 'groups', color: '#f97316' },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'repondeur-ia-pme-guide-complet',
    title: 'Répondeur IA pour PME : le guide complet 2026',
    excerpt: 'Comment mettre en place un répondeur téléphonique IA qui répond 24/7 avec une voix naturelle. Configuration, coûts et retour sur investissement.',
    content: `Le répondeur téléphonique IA est devenu un outil incontournable pour les PME françaises. En 2026, **68% des appels manqués** se transforment en clients perdus. Voici comment y remédier.

**Pourquoi un répondeur IA ?**

Un répondeur IA ne se contente pas de prendre des messages. Il **comprend** la demande du client, **qualifie** le besoin et peut même **prendre des rendez-vous** automatiquement.

**Les avantages concrets :**

• Disponibilité 24h/24, 7j/7 — même les weekends et jours fériés
• Voix naturelle française grâce à ElevenLabs
• Qualification automatique des appels (urgence, type de demande)
• Transcription et résumé envoyés par email en temps réel
• Coût moyen de 0.15€ par appel traité vs 2-5€ avec un secrétariat externe

**Comment configurer votre répondeur IA sur Freenzy ?**

1. Créez votre compte gratuit (50 crédits offerts)
2. Allez dans "Répondeur IA" depuis le dashboard
3. Personnalisez le message d'accueil et les consignes
4. Connectez votre numéro de téléphone (Twilio intégré)
5. Testez avec un appel d'essai

**Retour sur investissement**

Pour une PME recevant 30 appels/jour, le répondeur IA permet d'économiser **2 400€/mois** par rapport à un secrétariat traditionnel, tout en captant 100% des appels.`,
    category: 'guides',
    tags: ['répondeur IA', 'PME', 'téléphonie', 'automatisation', 'guide'],
    author: 'Équipe Freenzy',
    authorRole: 'Product Team',
    publishedAt: '2026-03-10',
    readTime: 8,
    icon: 'call',
    color: '#7c3aed',
    featured: true,
  },
  {
    slug: 'agents-ia-specialises-entreprise',
    title: '100 agents IA spécialisés : lequel choisir pour votre entreprise ?',
    excerpt: 'Marketing, finance, RH, juridique, commercial... Découvrez quel agent IA correspond à vos besoins et comment les combiner.',
    content: `Avec **100 agents IA spécialisés**, Freenzy couvre tous les métiers de l'entreprise. Mais par où commencer ?

**Les 5 agents les plus populaires**

1. **Assistante Exécutive** — Gestion d'agenda, emails, comptes-rendus. L'agent le plus utilisé.
2. **Directeur Commercial** — Qualification de leads, rédaction de devis, suivi CRM.
3. **Directrice Marketing** — Posts sociaux, newsletters, campagnes pub, analyse de marché.
4. **Répondeur IA** — Standard téléphonique 24/7, qualifie et route les appels.
5. **Agent Juridique** — Analyse de contrats, conformité RGPD, rédaction de clauses.

**Comment choisir ?**

Posez-vous 3 questions :
• Quelle tâche prend le plus de temps dans votre journée ?
• Où perdez-vous le plus de clients ou d'opportunités ?
• Quel processus est le plus répétitif ?

**L'approche multi-agents**

La vraie puissance de Freenzy est dans la **combinaison d'agents**. Par exemple :
• Le Répondeur IA qualifie l'appel
• L'Agent Commercial rédige le devis
• L'Assistante programme le rendez-vous
• Le Marketing envoie le suivi automatique

Tout cela sans intervention humaine.`,
    category: 'produit',
    tags: ['agents IA', 'multi-agents', 'entreprise', 'automatisation', 'productivité'],
    author: 'Équipe Freenzy',
    authorRole: 'Product Team',
    publishedAt: '2026-03-08',
    readTime: 6,
    icon: 'smart_toy',
    color: '#06b6d4',
    featured: true,
  },
  {
    slug: 'ia-restaurant-automatisation-complete',
    title: 'Restaurant : comment automatiser 80% de votre gestion avec l\'IA',
    excerpt: 'Réservations, menus, avis Google, réseaux sociaux... Comment un restaurant a divisé par 3 son temps administratif grâce à Freenzy.',
    content: `**Le cas du Bistrot Parisien** — un restaurant de 45 couverts qui a transformé sa gestion grâce à l'IA.

**Avant Freenzy :**
• 2h/jour au téléphone pour les réservations
• 15 avis Google sans réponse par semaine
• Zéro présence sur les réseaux sociaux
• Menus du jour envoyés manuellement par SMS

**Après Freenzy :**
• Répondeur IA prend les réservations 24/7
• Agent Social répond aux avis Google en < 2h
• 3 posts Instagram/semaine générés automatiquement
• Menu du jour dicté en 30 secondes, envoyé à toute la base clients

**Les résultats en 3 mois :**
• +35% de réservations (grâce aux appels capturés le soir/weekend)
• 4.7★ sur Google (vs 4.2 avant — réponses systématiques aux avis)
• +800 abonnés Instagram
• 6h/semaine économisées sur l'administratif

**Configuration en 15 minutes :**

1. Créez le répondeur avec les consignes spécifiques (horaires, carte, allergènes)
2. Connectez vos réseaux sociaux
3. Paramétrez les réponses automatiques aux avis
4. Lancez — l'IA s'occupe du reste`,
    category: 'cas-usage',
    tags: ['restaurant', 'réservation', 'avis Google', 'réseaux sociaux', 'cas usage'],
    author: 'Équipe Freenzy',
    authorRole: 'Success Team',
    publishedAt: '2026-03-05',
    readTime: 5,
    icon: 'restaurant',
    color: '#f59e0b',
    featured: false,
  },
  {
    slug: 'comparer-modeles-ia-2026',
    title: 'Claude vs GPT-4 vs Gemini vs Mistral : quel modèle IA choisir en 2026 ?',
    excerpt: 'Comparatif détaillé des meilleurs modèles IA disponibles sur Freenzy. Forces, faiblesses, coûts et cas d\'usage recommandés.',
    content: `En 2026, le choix du modèle IA impacte directement la qualité et le coût de vos résultats. **Freenzy intègre tous les modèles majeurs** au prix officiel, sans commission.

**Claude (Anthropic)**
• Forces : raisonnement, analyse longue, rédaction en français, sécurité
• Faiblesses : pas de génération d'images native
• Meilleur pour : contrats, stratégie, rédaction longue, code
• Coût sur Freenzy : 0.2 à 2 crédits/message

**GPT-4o (OpenAI)**
• Forces : polyvalent, multimodal, large base de connaissances
• Faiblesses : parfois verbeux, hallucinations occasionnelles
• Meilleur pour : tâches généralistes, traduction, résumés
• Coût sur Freenzy : 0.3 à 1.5 crédits/message

**Gemini 2.0 (Google)**
• Forces : données temps réel, intégration Google, multimodal
• Faiblesses : moins fort en raisonnement complexe
• Meilleur pour : recherche, actualités, analyse de données
• Coût sur Freenzy : 0.2 à 1 crédit/message

**Mistral Large (Mistral AI)**
• Forces : excellent en français, souveraineté européenne, rapport qualité/prix
• Faiblesses : moins de fonctionnalités avancées
• Meilleur pour : PME françaises, conformité RGPD, budget limité
• Coût sur Freenzy : 0.15 à 0.8 crédit/message

**Notre recommandation :** Utilisez Claude pour les tâches complexes et Mistral pour le quotidien. C'est la combinaison la plus efficace pour les PME françaises.`,
    category: 'ia-business',
    tags: ['modèles IA', 'Claude', 'GPT-4', 'Gemini', 'Mistral', 'comparatif'],
    author: 'Équipe Freenzy',
    authorRole: 'AI Team',
    publishedAt: '2026-03-01',
    readTime: 7,
    icon: 'psychology',
    color: '#ec4899',
    featured: true,
  },
  {
    slug: 'whatsapp-business-ia-guide',
    title: 'WhatsApp Business + IA : automatiser votre relation client',
    excerpt: 'Connectez WhatsApp Business à vos agents IA pour répondre instantanément à vos clients. Guide de configuration étape par étape.',
    content: `**92% des Français** utilisent WhatsApp. Si vos clients vous écrivent sur WhatsApp et que vous ne répondez pas en < 5 minutes, vous perdez **60% d'entre eux**.

**WhatsApp + Freenzy = Réponse instantanée 24/7**

Connectez votre numéro WhatsApp Business à Freenzy et laissez l'IA répondre intelligemment à chaque message.

**Ce que l'IA peut faire sur WhatsApp :**
• Répondre aux questions fréquentes (horaires, tarifs, disponibilités)
• Qualifier les demandes et router vers le bon agent
• Envoyer des documents (devis, catalogues, menus)
• Prendre des rendez-vous directement dans le chat
• Relancer les conversations abandonnées

**Configuration en 5 étapes :**

1. Rendez-vous sur freenzy.io/client/whatsapp
2. Scannez le QR code avec votre téléphone
3. Personnalisez les consignes de l'agent WhatsApp
4. Définissez les horaires d'intervention IA vs humain
5. Testez en vous envoyant un message

**Résultats constatés :**
• Temps de réponse moyen : < 30 secondes (vs 2h avant)
• Taux de satisfaction client : +45%
• Conversion des demandes entrantes : +28%`,
    category: 'tutoriels',
    tags: ['WhatsApp', 'relation client', 'automatisation', 'tutoriel', 'messagerie'],
    author: 'Équipe Freenzy',
    authorRole: 'Product Team',
    publishedAt: '2026-02-25',
    readTime: 5,
    icon: 'chat',
    color: '#22c55e',
    featured: false,
  },
  {
    slug: 'rgpd-ia-conformite-pme',
    title: 'IA et RGPD : comment rester conforme en tant que PME',
    excerpt: 'Utiliser l\'IA sans risque juridique. Les 7 règles essentielles de conformité RGPD pour les PME qui adoptent l\'IA.',
    content: `L'adoption de l'IA en entreprise pose des questions légitimes sur la **protection des données personnelles**. Voici les 7 règles essentielles.

**Règle 1 : Hébergement européen**
Vos données doivent rester en Europe. Freenzy héberge toutes les données sur des serveurs européens (Hetzner, Allemagne).

**Règle 2 : Pas d'entraînement sur vos données**
Vérifiez que le fournisseur d'IA ne s'entraîne pas sur vos conversations. Chez Freenzy, c'est garanti par contrat.

**Règle 3 : Droit à l'effacement**
Vos clients doivent pouvoir demander la suppression de leurs données. Freenzy implémente la purge automatique après 90 jours.

**Règle 4 : Transparence**
Informez vos clients qu'ils interagissent avec une IA (répondeur, chat, WhatsApp). C'est obligatoire depuis l'AI Act.

**Règle 5 : Minimisation des données**
Ne collectez que les données nécessaires. Les agents Freenzy sont configurés pour ne pas demander d'informations superflues.

**Règle 6 : Registre des traitements**
Documentez comment l'IA traite les données. Freenzy fournit un registre pré-rempli téléchargeable.

**Règle 7 : DPO ou référent RGPD**
Pour les PME de +250 salariés, un DPO est obligatoire. Pour les autres, désignez un référent.

**Checklist de conformité :**
✅ Hébergement EU — ✅ Pas d'entraînement — ✅ Purge auto 90j — ✅ Mention IA visible — ✅ Données minimales — ✅ Registre à jour — ✅ Référent désigné`,
    category: 'ia-business',
    tags: ['RGPD', 'conformité', 'protection données', 'PME', 'juridique', 'AI Act'],
    author: 'Équipe Freenzy',
    authorRole: 'Legal Team',
    publishedAt: '2026-02-20',
    readTime: 6,
    icon: 'shield',
    color: '#7c3aed',
    featured: false,
  },
  {
    slug: 'immobilier-ia-gestion-locative',
    title: 'Immobilier : l\'IA qui gère vos locataires et vos visites',
    excerpt: 'Comment une agence immobilière automatise la prise de rendez-vous, la qualification des dossiers et la gestion des urgences 24/7.',
    content: `**L'immobilier est l'un des secteurs où l'IA a le plus d'impact immédiat.** Appels entrants constants, demandes de visites, urgences locataires... tout peut être automatisé.

**Le cas de l'agence ImmoSud (Montpellier)**

• 12 agents gèrent 450 lots
• 80+ appels/jour (visites, urgences, questions)
• 2 secrétaires à temps plein pour gérer le flux

**Après déploiement Freenzy :**

• Répondeur IA trie les appels : visite, urgence, administratif
• Agent Commercial qualifie les dossiers locataires en 3 questions
• Agent Juridique génère les baux et avenants
• Alertes automatiques pour les urgences (dégâts des eaux, serrurerie)

**Résultats :**
• 1 secrétaire suffit désormais (l'autre a été redéployée sur le commercial)
• Temps de réponse urgences : 2 minutes (vs 45 minutes avant)
• +22% de visites confirmées (rappel automatique J-1)
• Satisfaction locataires : 4.5★ vs 3.8★ avant`,
    category: 'cas-usage',
    tags: ['immobilier', 'gestion locative', 'agence', 'automatisation', 'cas usage'],
    author: 'Équipe Freenzy',
    authorRole: 'Success Team',
    publishedAt: '2026-02-15',
    readTime: 5,
    icon: 'apartment',
    color: '#06b6d4',
    featured: false,
  },
  {
    slug: 'premiers-pas-freenzy-tutoriel',
    title: 'Premiers pas sur Freenzy : tutoriel complet pour débutants',
    excerpt: 'De l\'inscription à votre premier agent IA opérationnel en 10 minutes. Guide pas-à-pas avec captures d\'écran.',
    content: `Bienvenue sur Freenzy ! Ce guide vous accompagne de la création de compte jusqu'à votre premier agent IA opérationnel.

**Étape 1 : Inscription (2 minutes)**

Rendez-vous sur freenzy.io et cliquez "Commencer gratuitement". Vous recevez **50 crédits offerts** — suffisants pour tester tous les agents.

**Étape 2 : Découvrir le dashboard (1 minute)**

Votre dashboard Flashboard affiche :
• Vos agents actifs (à gauche)
• Le chat IA central
• Vos crédits restants (en haut)
• L'accès aux fonctionnalités (menu)

**Étape 3 : Choisir votre premier agent (2 minutes)**

Allez dans "Agents" et parcourez les 100 agents disponibles. Pour débuter, nous recommandons :
• **Assistante Exécutive** — pour tester les capacités conversationnelles
• **Répondeur IA** — si vous recevez beaucoup d'appels

**Étape 4 : Personnaliser l'agent (3 minutes)**

Cliquez sur un agent et personnalisez :
• Le nom de votre entreprise
• Votre secteur d'activité
• Les consignes spécifiques (horaires, services, tarifs)

**Étape 5 : Tester et déployer (2 minutes)**

Envoyez un message de test dans le chat. Vérifiez que l'agent comprend votre contexte. Quand vous êtes satisfait, connectez-le à vos canaux (téléphone, WhatsApp, email).

**Vous êtes prêt !** Votre premier agent IA est opérationnel en moins de 10 minutes.`,
    category: 'tutoriels',
    tags: ['tutoriel', 'débutant', 'onboarding', 'guide', 'premiers pas'],
    author: 'Équipe Freenzy',
    authorRole: 'Product Team',
    publishedAt: '2026-02-10',
    readTime: 4,
    icon: 'play_circle',
    color: '#f97316',
    featured: false,
  },
  {
    slug: 'ia-secretariat-telephonique-revolution',
    title: 'Secrétariat téléphonique IA : la révolution silencieuse des PME',
    excerpt: 'Pourquoi 43% des PME françaises auront adopté un secrétariat téléphonique IA d\'ici fin 2026. Analyse du marché et perspectives.',
    content: `Le secrétariat téléphonique traditionnel vit sa plus grande transformation depuis l'invention du répondeur. **L'IA change tout.**

**Le problème**

• 72% des PME françaises ratent des appels pendant les heures de pointe
• Le coût moyen d'un secrétariat externalisé : 350-800€/mois
• Temps de formation d'une nouvelle secrétaire : 2-4 semaines
• Turnover du secteur : 35%/an

**La solution IA**

Un secrétariat téléphonique IA comme Freenzy :
• Ne prend jamais de congés
• Parle 12 langues
• Se forme en 10 minutes (vs 2 semaines)
• Coûte 5-10x moins cher
• S'améliore avec chaque appel

**Les chiffres du marché**

• Le marché du secrétariat IA en France : 180M€ en 2025, prévu 520M€ en 2027
• Taux d'adoption PME : 18% en 2025, 43% prévu en 2026
• Satisfaction utilisateurs : 4.6/5 en moyenne

**Les freins qui disparaissent**

• "L'IA ne comprend pas le français" — Faux. Les modèles 2026 sont natifs en français.
• "Mes clients n'aimeront pas" — 78% des clients préfèrent une réponse IA immédiate à un rappel dans 2h.
• "C'est trop cher" — Faux. Dès 0.15€/appel traité.
• "C'est compliqué à installer" — 10 minutes sur Freenzy, zéro compétence technique requise.`,
    category: 'ia-business',
    tags: ['secrétariat', 'téléphonique', 'PME', 'marché', 'tendances', 'révolution'],
    author: 'Équipe Freenzy',
    authorRole: 'Market Research',
    publishedAt: '2026-02-05',
    readTime: 7,
    icon: 'trending_up',
    color: '#ec4899',
    featured: false,
  },
  {
    slug: 'communaute-freenzy-rejoindre',
    title: 'Rejoignez la communauté Freenzy : échangez entre entrepreneurs',
    excerpt: 'Partagez vos retours d\'expérience, posez vos questions et découvrez les meilleures pratiques de la communauté Freenzy.',
    content: `**Freenzy, ce n'est pas qu'un outil. C'est une communauté d'entrepreneurs** qui s'entraident pour tirer le meilleur parti de l'IA.

**Les espaces de la communauté**

• **Discussions profondes** — Explorez des sujets complexes avec l'IA et partagez vos découvertes
• **Team Chat** — Échangez en direct avec d'autres utilisateurs Freenzy
• **Marketplace** — Partagez et découvrez des templates d'agents créés par la communauté
• **Cas d'usage** — Témoignages et retours d'expérience de PME comme la vôtre

**Comment participer ?**

1. Connectez-vous à votre dashboard Freenzy
2. Accédez à "Discussions" dans le menu
3. Rejoignez les canaux qui vous intéressent
4. Partagez vos astuces et posez vos questions

**Les sujets les plus populaires**

• Comment configurer le répondeur IA pour mon secteur ?
• Quels agents combiner pour maximiser le ROI ?
• Retours d'expérience après 3 mois d'utilisation
• Tips pour rédiger les meilleures consignes d'agents
• Comment optimiser sa consommation de crédits

**Événements mensuels**

• Webinaire "Les meilleures pratiques Freenzy" — 1er jeudi du mois
• AMA (Ask Me Anything) avec l'équipe produit — 3ème mercredi
• Showcase communautaire — agents et templates du mois

Rejoignez-nous — c'est gratuit et inclus dans votre compte Freenzy !`,
    category: 'communaute',
    tags: ['communauté', 'forum', 'entraide', 'networking', 'événements'],
    author: 'Équipe Freenzy',
    authorRole: 'Community Team',
    publishedAt: '2026-02-01',
    readTime: 4,
    icon: 'groups',
    color: '#f97316',
    featured: false,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return BLOG_ARTICLES.filter(a => a.category === category);
}

export function getFeaturedArticles(): BlogArticle[] {
  return BLOG_ARTICLES.filter(a => a.featured);
}

export function getRelatedArticles(slug: string, limit: number = 3): BlogArticle[] {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return BLOG_ARTICLES
    .filter(a => a.slug !== slug)
    .map(a => ({
      article: a,
      score: a.tags.filter(t => article.tags.includes(t)).length + (a.category === article.category ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(a => a.article);
}
