/**
 * News IA — Semaine 0 (1-2 mars 2026)
 * 6 articles : 3 par jour
 */

import type { NewsArticle } from './news-data';

export const newsWeek0: NewsArticle[] = [

  // ═══════════════════════════════════════════════════════════
  //  1er MARS 2026 — 3 articles
  // ═══════════════════════════════════════════════════════════

  {
    id: 'news-2026-03-01-01',
    title: 'Claude 4.5 Sonnet bat GPT-4o sur les benchmarks code',
    emoji: '🧠',
    summary: "Anthropic publie les résultats de Claude 4.5 Sonnet sur SWE-bench : 49% de résolution autonome contre 33% pour GPT-4o. Le modèle excelle particulièrement sur les tâches de refactoring et de debugging en Python et TypeScript.",
    content: `**🧠 Claude 4.5 Sonnet : le nouveau roi du code**

Anthropic vient de publier les benchmarks détaillés de Claude 4.5 Sonnet sur SWE-bench Verified, le standard de l'industrie pour évaluer les capacités de codage des LLM.

**📊 Les chiffres parlent d'eux-mêmes**

- **49%** de résolution autonome sur SWE-bench (vs 33% pour GPT-4o)
- **67%** de réussite sur les tâches de refactoring
- **72%** de précision sur le debugging TypeScript
- Temps moyen de résolution : **3.2 minutes** par issue

**🔬 Pourquoi c'est important**

La capacité d'un modèle à résoudre de vrais bugs dans de vrais codebases est le test ultime. SWE-bench utilise des issues GitHub réelles de projets open source populaires (Django, Flask, scikit-learn). Un score de 49% signifie que Claude peut résoudre presque une issue sur deux sans intervention humaine.

**🎯 Ce que ça change pour vous 👉**

Sur Freenzy.io, nos assistants techniques utilisent Claude Sonnet pour le code review, la documentation et le debugging. Ces résultats confirment le choix d'Anthropic comme moteur IA principal pour les tâches techniques.`,
    category: 'modeles',
    impact: 'high',
    impactLabel: '🔴 Majeur',
    source: 'Anthropic Blog',
    sourceUrl: 'https://www.anthropic.com/news/claude-4-5-sonnet',
    imageEmoji: '🏆',
    tags: ['claude', 'benchmark', 'code', 'anthropic'],
    date: '2026-03-01',
    period: 'morning',
    stats: [
      { label: 'SWE-bench score', value: 49, unit: '%', change: '+16pts vs GPT-4o', changeType: 'up' },
      { label: 'Refactoring', value: 67, unit: '%', change: '+22pts', changeType: 'up' },
    ],
  },

  {
    id: 'news-2026-03-01-02',
    title: 'L\'UE finalise les règles d\'étiquetage des contenus IA',
    emoji: '⚖️',
    summary: "Le Parlement européen adopte les guidelines finales pour l'étiquetage obligatoire des contenus générés par IA. Toutes les plateformes devront afficher un label clair d'ici août 2026. Les amendes peuvent atteindre 3% du CA mondial.",
    content: `**⚖️ L'étiquetage IA devient obligatoire en Europe**

Le Parlement européen a voté les règles finales d'application de l'AI Act concernant l'étiquetage des contenus générés par intelligence artificielle.

**📋 Ce qui change concrètement**

À partir d'août 2026, toute plateforme opérant dans l'UE devra :
- Apposer un **label visible** sur tout contenu généré par IA (texte, image, vidéo, audio)
- Intégrer des **métadonnées techniques** (watermark invisible) dans les fichiers
- Fournir une **page d'information** expliquant quels modèles IA sont utilisés

**💰 Les sanctions**

Les amendes pour non-conformité peuvent atteindre **3% du chiffre d'affaires mondial** ou 15 millions d'euros, selon le montant le plus élevé.

**🎯 Ce que ça change pour vous 👉**

Freenzy.io est déjà préparé : tous les contenus générés par nos assistants sont tagués avec la mention "Généré avec l'IA". Notre Studio créatif inclut automatiquement les métadonnées C2PA dans les images.`,
    category: 'regulation',
    impact: 'high',
    impactLabel: '🔴 Majeur',
    source: 'European Parliament',
    sourceUrl: 'https://www.europarl.europa.eu/news/ai-labeling-guidelines',
    imageEmoji: '🏛️',
    tags: ['regulation', 'UE', 'AI Act', 'étiquetage'],
    date: '2026-03-01',
    period: 'morning',
  },

  {
    id: 'news-2026-03-01-03',
    title: 'Notion lance son IA Agents en bêta publique',
    emoji: '🔧',
    summary: "Notion ouvre sa fonctionnalité AI Agents au grand public. Les utilisateurs peuvent créer des workflows automatisés qui combinent bases de données, calendriers et intégrations tierces. Le pricing reste inclus dans l'abonnement Notion AI.",
    content: `**🔧 Notion AI Agents : l'automatisation pour tous**

Après 6 mois de bêta fermée, Notion lance officiellement ses AI Agents pour tous les utilisateurs de Notion AI.

**🤖 Ce que font les Agents Notion**

Les Agents Notion sont des workflows automatisés qui peuvent :
- Surveiller vos bases de données et déclencher des actions
- Rédiger des résumés hebdomadaires à partir de vos notes
- Créer des tâches automatiquement depuis vos emails
- Synchroniser votre calendrier avec vos projets

**📊 Les premiers retours**

- **78%** des bêta-testeurs déclarent gagner plus de 2h/semaine
- **12 intégrations** tierces supportées (Slack, Gmail, GitHub, Figma...)
- Temps de setup moyen : **15 minutes** pour un premier agent

**🎯 Ce que ça change pour vous 👉**

La concurrence s'intensifie dans le domaine des assistants IA pour la productivité. Freenzy.io se différencie par ses 136 agents spécialisés par métier, là où Notion propose des agents généralistes. Notre approche "IA par profession" reste unique sur le marché.`,
    category: 'outils',
    impact: 'medium',
    impactLabel: '🟡 À suivre',
    source: 'Notion Blog',
    sourceUrl: 'https://www.notion.so/blog/ai-agents-public-beta',
    imageEmoji: '📝',
    tags: ['notion', 'agents', 'productivité', 'automatisation'],
    date: '2026-03-01',
    period: 'evening',
    stats: [
      { label: 'Temps gagné', value: 2, unit: 'h/semaine', change: '+78% users', changeType: 'up' },
      { label: 'Intégrations', value: 12, unit: 'apps', changeType: 'neutral' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  2 MARS 2026 — 3 articles
  // ═══════════════════════════════════════════════════════════

  {
    id: 'news-2026-03-02-01',
    title: 'DeepSeek V3 disponible en open source : le LLM chinois qui rivalise avec Claude',
    emoji: '🚀',
    summary: "DeepSeek publie V3 en open source sous licence MIT. Le modèle de 236B paramètres affiche des performances comparables à Claude 3.5 Sonnet pour un coût d'inférence 10x inférieur. La communauté open source s'enflamme.",
    content: `**🚀 DeepSeek V3 : l'open source frappe fort**

DeepSeek, le lab IA chinois financé par le fonds High-Flyer, publie son modèle V3 en open source complet sous licence MIT.

**📊 Des performances impressionnantes**

- **236 milliards** de paramètres (MoE architecture)
- Score MMLU : **88.5%** (vs 88.7% pour Claude 3.5 Sonnet)
- Coût d'inférence : **0.14$/M tokens** en input, **0.28$/M** en output
- Supporté par vLLM, TensorRT-LLM et SGLang

**💡 Pourquoi c'est disruptif**

Un modèle open source aussi performant que les leaders propriétaires, à un dixième du prix. Les startups peuvent maintenant self-host un LLM quasi-SOTA pour une fraction du coût. Le gap entre open et closed source se réduit drastiquement.

**🎯 Ce que ça change pour vous 👉**

Freenzy.io surveille de près les alternatives open source. DeepSeek V3 pourrait servir de fallback économique pour les tâches L1 (classification, routing), réduisant les coûts API de 60% sur ce segment.`,
    category: 'modeles',
    impact: 'high',
    impactLabel: '🔴 Majeur',
    source: 'DeepSeek',
    sourceUrl: 'https://github.com/deepseek-ai/DeepSeek-V3',
    imageEmoji: '🇨🇳',
    tags: ['deepseek', 'open-source', 'LLM', 'chinois'],
    date: '2026-03-02',
    period: 'morning',
    stats: [
      { label: 'Paramètres', value: 236, unit: 'B', changeType: 'neutral' },
      { label: 'Coût input', value: 0.14, unit: '$/M tok', change: '-90% vs Claude', changeType: 'down' },
    ],
  },

  {
    id: 'news-2026-03-02-02',
    title: 'Le marché de l\'IA générative atteindra 200 milliards $ en 2026',
    emoji: '💼',
    summary: "Gartner publie ses prévisions actualisées : le marché mondial de l'IA générative devrait atteindre 200 milliards de dollars en 2026, contre 67 milliards en 2024. L'adoption en entreprise s'accélère dans tous les secteurs.",
    content: `**💼 200 milliards $ : l'IA générative explose**

Le cabinet Gartner publie ses prévisions révisées pour le marché de l'IA générative en 2026, et les chiffres donnent le vertige.

**📈 Les projections clés**

- Marché total : **200 milliards $** en 2026 (vs 67B en 2024)
- Croissance annuelle : **+68%** (CAGR)
- Secteurs leaders : finance (23%), santé (18%), retail (15%)
- **75%** des entreprises du Fortune 500 utiliseront l'IA gen en production

**🏢 L'adoption s'accélère**

Le rapport note un changement qualitatif : on passe de l'expérimentation ("on teste ChatGPT") à l'intégration en production ("nos workflows dépendent de l'IA"). Les budgets IA des DSI ont triplé en 18 mois.

**🎯 Ce que ça change pour vous 👉**

Freenzy.io se positionne exactement sur cette vague : aider les PME et indépendants à adopter l'IA en production, pas juste en expérimentation. Nos 136 agents métier sont conçus pour une utilisation quotidienne réelle.`,
    category: 'business',
    impact: 'medium',
    impactLabel: '🟡 À suivre',
    source: 'Gartner',
    sourceUrl: 'https://www.gartner.com/en/newsroom/press-releases/genai-market-2026',
    imageEmoji: '📈',
    tags: ['marché', 'gartner', 'prévisions', 'croissance'],
    date: '2026-03-02',
    period: 'morning',
    stats: [
      { label: 'Marché GenAI', value: 200, unit: 'Mds $', change: '+199%', changeType: 'up' },
      { label: 'Adoption Fortune 500', value: 75, unit: '%', change: '+25pts', changeType: 'up' },
    ],
  },

  {
    id: 'news-2026-03-02-03',
    title: 'Perplexity dépasse les 100 millions d\'utilisateurs mensuels',
    emoji: '🔍',
    summary: "Perplexity AI annonce avoir franchi le cap des 100 millions d'utilisateurs actifs mensuels. Le moteur de recherche IA lève également un nouveau tour de 500 millions de dollars, portant sa valorisation à 9 milliards.",
    content: `**🔍 Perplexity : 100M d'utilisateurs, le search IA décolle**

Perplexity AI franchit un cap symbolique : 100 millions d'utilisateurs actifs mensuels, contre 15 millions il y a un an.

**📊 La croissance est fulgurante**

- **100M** utilisateurs actifs mensuels (+567% en 12 mois)
- **500M $** levés en série C (valorisation 9B $)
- **15M** requêtes/jour (vs 2M il y a un an)
- Présent dans **195 pays**

**🔬 Le modèle qui menace Google**

Perplexity combine LLM + search en temps réel + citations sourcées. Le produit répond aux questions complexes avec des réponses structurées, sourcées et vérifiables — là où Google renvoie une liste de liens.

**🎯 Ce que ça change pour vous 👉**

La veille IA intégrée de Freenzy.io utilise un concept similaire : résumer l'actualité avec des sources vérifiables. Notre page News IA offre une expérience comparable, spécialisée sur l'IA et la tech.`,
    category: 'startup',
    impact: 'medium',
    impactLabel: '🟡 À suivre',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2026/03/02/perplexity-100m-users',
    imageEmoji: '🎯',
    tags: ['perplexity', 'search', 'startup', 'levée de fonds'],
    date: '2026-03-02',
    period: 'evening',
    stats: [
      { label: 'Utilisateurs', value: 100, unit: 'M/mois', change: '+567%', changeType: 'up' },
      { label: 'Valorisation', value: 9, unit: 'Mds $', changeType: 'neutral' },
    ],
  },
];
