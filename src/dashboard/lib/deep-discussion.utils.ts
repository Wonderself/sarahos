// ─── Deep Discussions — Utilities ────────────────────────────────────────────

import type {
  DeepDiscussion, DiscussionCategory, DiscussionTemplate,
  KeyPoint, DiscussionObjective, EvolutionNote, TemplateSection, SensitivityAlert,
  ShareContent, SharePlatform,
} from './deep-discussion.types';
import { DISCUSSION_CATEGORIES } from './deep-discussion.types';
import { ALL_AGENTS, buildSystemPrompt } from './agent-config';
import type { AgentTypeId } from './agent-config';

export const MAX_DEEP_CONTEXT = 20;
export const DEEP_DISCUSSION_MODEL = 'claude-opus-4-6';

// ─── Tag Parsing ─────────────────────────────────────────────────────────────

const KEYPOINT_PATTERN = /\[KEYPOINT:([^\]]+)\]/g;
const OBJECTIVE_PATTERN = /\[OBJECTIVE:([^\]]+)\]/g;
const EVOLUTION_PATTERN = /\[EVOLUTION:([^\]]+)\]/g;
const SENSITIVITY_PATTERN = /\[SENSIBILITE:([^\]]+)\]/g;

function nextTagId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseDiscussionTags(
  text: string,
  messageIndex: number,
): {
  cleanContent: string;
  keyPoints: KeyPoint[];
  objectives: DiscussionObjective[];
  evolutionNotes: EvolutionNote[];
  sensitivityAlerts: SensitivityAlert[];
} {
  const keyPoints: KeyPoint[] = [];
  const objectives: DiscussionObjective[] = [];
  const evolutionNotes: EvolutionNote[] = [];
  const sensitivityAlerts: SensitivityAlert[] = [];
  const now = new Date().toISOString();

  KEYPOINT_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = KEYPOINT_PATTERN.exec(text)) !== null) {
    keyPoints.push({ id: nextTagId(), text: match[1].trim(), messageIndex, timestamp: now });
  }

  OBJECTIVE_PATTERN.lastIndex = 0;
  while ((match = OBJECTIVE_PATTERN.exec(text)) !== null) {
    objectives.push({ id: nextTagId(), text: match[1].trim(), achieved: false, timestamp: now });
  }

  EVOLUTION_PATTERN.lastIndex = 0;
  while ((match = EVOLUTION_PATTERN.exec(text)) !== null) {
    evolutionNotes.push({ id: nextTagId(), text: match[1].trim(), messageIndex, timestamp: now });
  }

  SENSITIVITY_PATTERN.lastIndex = 0;
  while ((match = SENSITIVITY_PATTERN.exec(text)) !== null) {
    sensitivityAlerts.push({ id: nextTagId(), topic: match[1].trim(), messageIndex, timestamp: now });
  }

  const cleanContent = text
    .replace(KEYPOINT_PATTERN, '')
    .replace(OBJECTIVE_PATTERN, '')
    .replace(EVOLUTION_PATTERN, '')
    .replace(SENSITIVITY_PATTERN, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanContent, keyPoints, objectives, evolutionNotes, sensitivityAlerts };
}

// ─── Follow-ups (same as chat page) ─────────────────────────────────────────

export function parseFollowUps(text: string): { cleanContent: string; questions: string[] } {
  const questions: string[] = [];
  const regex = /\[Q\d+:\s*(.+?)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    questions.push(match[1].trim());
  }
  const cleanContent = text.replace(/\[Q\d+:\s*.+?\]/g, '').trim();
  return { cleanContent, questions };
}

// ─── Agent Auto-Selection ────────────────────────────────────────────────────

export function buildAgentSelectionPrompt(userMessage: string): { role: string; content: string }[] {
  const agentList = ALL_AGENTS.map(a =>
    `- ${a.id}: ${a.name} (${a.role}) — ${a.capabilities.slice(0, 4).join(', ')}`,
  ).join('\n');

  const categoryList = DISCUSSION_CATEGORIES.map(c => `${c.id}: ${c.label}`).join(', ');

  return [
    {
      role: 'user',
      content: `Tu es un routeur intelligent. Analyse le sujet ci-dessous et détermine:
1. Quel agent est le plus qualifié pour mener une discussion approfondie sur ce sujet
2. La catégorie thématique
3. Un titre concis pour la discussion

AGENTS DISPONIBLES:
${agentList}

CATÉGORIES: ${categoryList}

SUJET DE L'UTILISATEUR:
"${userMessage}"

Réponds UNIQUEMENT en JSON valide (sans markdown):
{"agentId":"fz-xxx ou null si aucun ne correspond","reasoning":"explication courte","category":"philosophical","suggestedTitle":"Titre concis"}

Si aucun agent ne correspond parfaitement, mets agentId à null — un agent personnalisé sera créé.`,
    },
  ];
}

export interface AgentSelectionResult {
  agentId: string | null;
  reasoning: string;
  category: DiscussionCategory;
  suggestedTitle: string;
}

export function parseAgentSelectionResponse(response: string): AgentSelectionResult | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentId: parsed.agentId ?? null,
      reasoning: parsed.reasoning ?? '',
      category: parsed.category ?? 'philosophical',
      suggestedTitle: parsed.suggestedTitle ?? 'Discussion',
    };
  } catch {
    return null;
  }
}

// ─── Discussion System Prompt (Opus-grade) ───────────────────────────────────

export function buildDiscussionSystemPrompt(discussion: DeepDiscussion): string {
  const categoryInfo = DISCUSSION_CATEGORIES.find(c => c.id === discussion.category);
  const categoryLabel = categoryInfo?.label ?? discussion.category;

  // Base agent prompt if using existing agent
  let baseContext = '';
  const existingAgent = ALL_AGENTS.find(a => a.id === discussion.agentId);
  if (existingAgent) {
    baseContext = `\nTu t'appuies sur ton expertise de ${existingAgent.name} (${existingAgent.role}).`;
  }

  if (discussion.customSystemPrompt) {
    baseContext += `\n\nCONTEXTE PERSONNALISÉ:\n${discussion.customSystemPrompt}`;
  }

  // Accumulated context
  const keyPointsBlock = discussion.keyPoints.length > 0
    ? `\n\nPOINTS CLÉS DÉCOUVERTS:\n${discussion.keyPoints.map((kp, i) => `${i + 1}. ${kp.text}`).join('\n')}`
    : '';

  const objectivesBlock = discussion.objectives.length > 0
    ? `\n\nAXES D'EXPLORATION:\n${discussion.objectives.map(o => `- ${o.text}${o.achieved ? ' [done]' : ''}`).join('\n')}`
    : '';

  const evolutionBlock = discussion.evolutionNotes.length > 0
    ? `\n\nÉVOLUTION:\n${discussion.evolutionNotes.slice(-5).map(e => `→ ${e.text}`).join('\n')}`
    : '';

  const challengeBlock = discussion.challengeMode
    ? `\n\nMODE CHALLENGE: Joue l'avocat du diable. Contredis avec respect. Cherche les failles. Propose des contre-exemples percutants. Toujours dans le but de renforcer la pensée.`
    : '';

  return `Tu es un penseur profond et un maître de la conversation intellectuelle.${baseContext}

SUJET: "${discussion.title}"
CATÉGORIE: ${categoryLabel}
PROFONDEUR: ${discussion.depth} échanges

═══ PHASE DE DISCUSSION ═══
${discussion.depth <= 5
    ? `PHASE D'EXPLORATION (échanges 0-5) :
- Pose des questions ouvertes pour comprendre la position de l'interlocuteur
- Explore les prémisses et les présupposés
- Identifie les angles possibles
- Ton : curieux, accueillant, exploratoire`
    : discussion.depth <= 15
      ? `PHASE D'APPROFONDISSEMENT (échanges 6-15) :
- Challenge les idées avec respect
- Propose des contre-exemples concrets et des paradoxes
- Introduis des penseurs et références qui enrichissent le débat
- Ton : stimulant, exigeant intellectuellement, constructif`
      : `PHASE DE SYNTHÈSE (échanges 16+) :
- Relie les fils de la discussion entre eux
- Identifie les patterns et les insights récurrents
- Pousse vers des conclusions ou des ouvertures
- Propose des reformulations synthétiques de la pensée
- Ton : structurant, éclairant, visionnaire`}

═══ STYLE ═══
- Réponses COMPACTES (150-300 mots). Jamais de pavés. Chaque mot compte.
- Socratique : tu poses autant de questions que tu donnes de réponses.
- Tu reformules ce que l'interlocuteur a dit pour montrer que tu écoutes vraiment.
- Tu cites des penseurs, auteurs, ou références concrètes quand c'est pertinent.
- Tu ne conclus JAMAIS. Tu ouvres toujours de nouvelles portes.
- Tu fais des connexions inattendues entre domaines.
- Tu alternes entre : relancer, approfondir, challenger, synthétiser.

═══ SENSIBILITÉ ═══
Quand un sujet touche au personnel, au religieux, au trauma, aux croyances profondes :
- Inclus [SENSIBILITE:sujet concerné] dans ta réponse
- Ne pousse PAS. Demande si la personne souhaite explorer ce terrain.
- Formulation type : "On touche à quelque chose de profond ici. Tu veux qu'on continue dans cette direction, ou tu préfères qu'on prenne un autre angle ?"
- Jamais de jugement. Jamais de position tranchée sur religion/politique sauf si demandé.
- Respecte inconditionnellement les croyances et valeurs de l'interlocuteur.

═══ RELANCES ═══
- "Qu'entends-tu exactement par... ?"
- "Et si on retournait cette idée... ?"
- "Ça me fait penser à [penseur/concept]. Tu connais ?"
- "Il y a un angle qu'on n'a pas encore exploré..."
- "Si je te poussais dans tes retranchements sur ce point..."${challengeBlock}${keyPointsBlock}${objectivesBlock}${evolutionBlock}

═══ TAGS (inclure quand pertinent) ═══
[KEYPOINT:texte] — idée importante qui émerge (1-2 par réponse max)
[OBJECTIVE:texte] — nouvel axe d'exploration qui se dessine
[EVOLUTION:texte] — la discussion change de direction
[SENSIBILITE:sujet] — alerte quand on touche un sujet délicat

═══ QUESTIONS DE SUIVI (toujours 3, formulées comme des invitations) ═══
[Q1: question qui creuse le dernier point]
[Q2: question qui ouvre un angle inattendu]
[Q3: question plus personnelle ou introspective]`;
}

// ─── "Approfondir" Prompt ────────────────────────────────────────────────────

export function buildDeeperPrompt(discussion: DeepDiscussion): string {
  const recentKeyPoints = discussion.keyPoints.slice(-3);

  let prompt = 'Approfondis davantage. ';

  if (recentKeyPoints.length > 0) {
    prompt += `Nous avons découvert: ${recentKeyPoints.map(kp => `"${kp.text}"`).join(', ')}. `;
  }

  prompt += "Pousse la réflexion plus loin. Explore les angles qu'on n'a pas encore abordés. Fais des connexions inattendues.";

  return prompt;
}

// ─── Custom Agent Prompt ─────────────────────────────────────────────────────

export function buildCustomAgentPrompt(category: DiscussionCategory, title: string): string {
  const categoryInfo = DISCUSSION_CATEGORIES.find(c => c.id === category);
  const label = categoryInfo?.label ?? 'Général';

  return `Tu es un expert en ${label} et un penseur profond. Tu maîtrises ce domaine et ses connexions avec d'autres disciplines. Tu es passionné par "${title}". Tu rends les concepts complexes accessibles sans les simplifier.`;
}

// ─── Export Discussion as Markdown ───────────────────────────────────────────

export function exportDiscussionMarkdown(discussion: DeepDiscussion): string {
  const categoryInfo = DISCUSSION_CATEGORIES.find(c => c.id === discussion.category);
  const lines: string[] = [];

  lines.push(`# ${discussion.title}`);
  lines.push('');
  lines.push(`**Catégorie:** ${categoryInfo?.materialIcon ?? ''} ${categoryInfo?.label ?? discussion.category}`);
  lines.push(`**Agent:** ${discussion.agentEmoji} ${discussion.agentName}`);
  lines.push(`**Profondeur:** ${discussion.depth} échanges`);
  lines.push(`**Créée:** ${new Date(discussion.createdAt).toLocaleDateString('fr-FR')}`);
  lines.push(`**Dernière activité:** ${new Date(discussion.lastActivityAt).toLocaleDateString('fr-FR')}`);
  lines.push('');

  if (discussion.keyPoints.length > 0) {
    lines.push('## Points Clés');
    lines.push('');
    discussion.keyPoints.forEach((kp, i) => lines.push(`${i + 1}. ${kp.text}`));
    lines.push('');
  }

  if (discussion.objectives.length > 0) {
    lines.push('## Objectifs Explorés');
    lines.push('');
    discussion.objectives.forEach(o => lines.push(`- ${o.text}${o.achieved ? ' [done]' : ' (en cours)'}`));
    lines.push('');
  }

  if (discussion.evolutionNotes.length > 0) {
    lines.push('## Évolution');
    lines.push('');
    discussion.evolutionNotes.forEach(e => lines.push(`→ ${e.text}`));
    lines.push('');
  }

  lines.push('## Conversation');
  lines.push('');
  discussion.messages.forEach(msg => {
    const prefix = msg.role === 'user' ? '**Vous:**' : `**${discussion.agentName}:**`;
    lines.push(`${prefix} ${msg.content}`);
    lines.push('');
  });

  return lines.join('\n');
}

// ─── Template Sections (80+ discussions) ─────────────────────────────────────

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  // ─── 1. Les Grandes Questions ───
  {
    id: 'grandes-questions',
    title: 'Les Grandes Questions',
    materialIcon: 'all_inclusive',
    description: 'Les questions fondamentales que l\'humanité se pose depuis toujours',
    templates: [
      { id: 'libre-arbitre', title: 'Le libre arbitre existe-t-il ?', category: 'philosophical', starterPrompt: 'Le libre arbitre existe-t-il vraiment, ou sommes-nous entièrement déterminés par nos gènes, notre éducation et notre environnement ?', description: 'Déterminisme, liberté, responsabilité', materialIcon: 'casino', tags: ['debat', 'liberte', 'conscience'] },
      { id: 'sens-vie', title: 'Quel est le sens de la vie ?', category: 'existential', starterPrompt: 'La vie a-t-elle un sens intrinsèque, ou est-ce à chacun de créer le sien ? Et si le sens, c\'était justement la quête elle-même ?', description: 'Existentialisme, but, absurde', materialIcon: 'all_inclusive', tags: ['sens', 'introspection', 'identite'] },
      { id: 'conscience', title: 'Qu\'est-ce que la conscience ?', category: 'philosophical', starterPrompt: 'Qu\'est-ce qui fait que je suis "moi" ? La conscience est-elle un produit du cerveau, ou quelque chose de plus fondamental ?', description: 'Qualia, hard problem, dualisme', materialIcon: 'lightbulb', tags: ['conscience', 'identite', 'sens'] },
      { id: 'mort-apres', title: 'Que se passe-t-il après la mort ?', category: 'spiritual', starterPrompt: 'La mort est-elle une fin absolue, une transition, ou autre chose ? Comment les différentes cultures et philosophies abordent cette question ?', description: 'Mortalité, au-delà, acceptation', materialIcon: 'wb_twilight', tags: ['mort', 'foi', 'sens'] },
      { id: 'temps-nature', title: 'Le temps existe-t-il vraiment ?', category: 'scientific', starterPrompt: 'Le temps est-il une réalité physique fondamentale ou une construction de notre cerveau ? Pourquoi semble-t-il s\'écouler dans un seul sens ?', description: 'Physique, perception, relativité', materialIcon: 'hourglass_empty', tags: ['conscience', 'debat', 'sens'] },
      { id: 'realite', title: 'La réalité est-elle une illusion ?', category: 'philosophical', starterPrompt: 'Comment savoir si ce que nous percevons est la réalité ? Sommes-nous peut-être dans une simulation, un rêve, ou une construction mentale ?', description: 'Simulation, perception, Platon', materialIcon: 'person', tags: ['conscience', 'debat', 'sens'] },
      { id: 'infini', title: 'L\'infini est-il compréhensible ?', category: 'scientific', starterPrompt: 'L\'univers est-il infini ? Notre esprit peut-il vraiment concevoir l\'infini, ou est-ce au-delà de nos capacités cognitives ?', description: 'Mathématiques, cosmos, limites', materialIcon: 'nights_stay', tags: ['conscience', 'sens'] },
      { id: 'dieu-existe', title: 'Dieu existe-t-il ?', category: 'religious', starterPrompt: 'La question de l\'existence de Dieu : quels sont les arguments les plus forts de chaque côté ? Peut-on dépasser le débat croire/ne pas croire ?', description: 'Théisme, athéisme, agnosticisme', materialIcon: 'self_improvement', tags: ['foi', 'debat', 'sens'] },
    ],
  },

  // ─── 2. Philosophie & Pensée ───
  {
    id: 'philosophie',
    title: 'Philosophie & Pensée',
    materialIcon: 'account_balance',
    description: 'Explorer les fondements de la pensée humaine',
    templates: [
      { id: 'bonheur-def', title: 'Qu\'est-ce que le bonheur ?', category: 'philosophical', starterPrompt: 'Le bonheur est-il un état permanent atteignable, des moments fugaces, ou une attitude ? Les philosophes antiques avaient-ils raison ?', description: 'Eudémonie, hédonisme, sagesse', materialIcon: 'mood', tags: ['sens', 'introspection', 'nature-humaine'] },
      { id: 'verite-existe', title: 'La vérité existe-t-elle ?', category: 'philosophical', starterPrompt: 'Existe-t-il une vérité objective, ou tout est-il question de perspective ? Peut-on dire "c\'est vrai" de façon universelle ?', description: 'Relativisme, objectivité, logique', materialIcon: 'search', tags: ['debat', 'conscience', 'sens'] },
      { id: 'justice', title: 'Qu\'est-ce que la justice ?', category: 'ethical', starterPrompt: 'La justice est-elle universelle ou relative à chaque société ? Rawls, Aristote, les utilitaristes — qui a raison ?', description: 'Équité, droit, philosophie morale', materialIcon: 'balance', tags: ['justice', 'morale', 'societe'] },
      { id: 'bien-mal', title: 'Le bien et le mal existent-ils ?', category: 'ethical', starterPrompt: 'Le bien et le mal sont-ils des réalités objectives, des constructions sociales, ou des instincts biologiques ? Un acte peut-il être universellement mauvais ?', description: 'Morale, relativisme, nature humaine', materialIcon: 'contrast', tags: ['morale', 'debat', 'nature-humaine'] },
      { id: 'sagesse', title: 'La sagesse s\'apprend-elle ?', category: 'philosophical', starterPrompt: 'Peut-on devenir sage par l\'étude et la pratique, ou la sagesse vient-elle uniquement de l\'expérience et de la souffrance ?', description: 'Stoïcisme, bouddhisme, Socrate', materialIcon: 'elderly', tags: ['introspection', 'sens', 'nature-humaine'] },
      { id: 'liberte-vraie', title: 'Sommes-nous vraiment libres ?', category: 'philosophical', starterPrompt: 'Au-delà du libre arbitre : nos choix de vie, nos désirs, nos rêves — sont-ils vraiment les nôtres, ou le produit de notre conditionnement ?', description: 'Conditionnement, autonomie, choix', materialIcon: 'volunteer_activism', tags: ['liberte', 'identite', 'conscience'] },
      { id: 'langage-pensee', title: 'Le langage limite-t-il la pensée ?', category: 'philosophical', starterPrompt: 'Peut-on penser sans mots ? Notre langue maternelle façonne-t-elle notre vision du monde ? Que se passe-t-il quand on n\'a pas de mot pour un concept ?', description: 'Wittgenstein, Sapir-Whorf, cognition', materialIcon: 'chat', tags: ['conscience', 'identite'] },
    ],
  },

  // ─── 3. Science & Univers ───
  {
    id: 'science',
    title: 'Science & Univers',
    materialIcon: 'science',
    description: 'Les mystères de l\'univers et les frontières de la connaissance',
    templates: [
      { id: 'ia-conscience', title: 'L\'IA peut-elle être consciente ?', category: 'technological', starterPrompt: 'L\'intelligence artificielle pourra-t-elle un jour être véritablement consciente, ou restera-t-elle à jamais une simulation sophistiquée ?', description: 'Conscience artificielle, singularité', materialIcon: 'smart_toy', tags: ['conscience', 'futur', 'debat'] },
      { id: 'univers-origine', title: 'D\'où vient l\'univers ?', category: 'scientific', starterPrompt: 'Qu\'y avait-il avant le Big Bang ? L\'univers a-t-il une cause, ou est-il apparu de rien ? Le multivers est-il une hypothèse sérieuse ?', description: 'Cosmologie, Big Bang, multivers', materialIcon: 'nights_stay', tags: ['sens', 'foi'] },
      { id: 'vie-extra', title: 'Sommes-nous seuls dans l\'univers ?', category: 'scientific', starterPrompt: 'Avec des milliards de galaxies, la vie extraterrestre semble probable. Alors pourquoi le silence ? Le paradoxe de Fermi nous dit-il quelque chose d\'inquiétant ?', description: 'Fermi, SETI, vie extraterrestre', materialIcon: 'rocket', tags: ['sens', 'futur'] },
      { id: 'simulation', title: 'Vivons-nous dans une simulation ?', category: 'technological', starterPrompt: 'L\'argument de Bostrom est-il convaincant ? Si nous vivions dans une simulation, pourrions-nous le détecter ? Cela changerait-il quelque chose ?', description: 'Bostrom, matrice, réalité', materialIcon: 'desktop_windows', tags: ['conscience', 'debat', 'futur'] },
      { id: 'cerveau-mystere', title: 'Comprendrons-nous un jour le cerveau ?', category: 'scientific', starterPrompt: 'Le cerveau peut-il se comprendre lui-même ? Ou y a-t-il une limite fondamentale — comme un œil qui ne peut pas se voir ?', description: 'Neurosciences, conscience, limites', materialIcon: 'psychology', tags: ['conscience', 'nature-humaine'] },
      { id: 'quantique-realite', title: 'La physique quantique remet-elle tout en question ?', category: 'scientific', starterPrompt: 'Un photon peut être à deux endroits à la fois. L\'observation change le résultat. La réalité quantique défie le bon sens. Que nous dit-elle vraiment ?', description: 'Quantique, observation, réalité', materialIcon: 'science', tags: ['conscience', 'sens'] },
      { id: 'evolution-humaine', title: 'L\'humain continue-t-il d\'évoluer ?', category: 'scientific', starterPrompt: 'L\'évolution biologique se poursuit-elle chez l\'humain, ou la technologie a-t-elle pris le relais ? Vers quoi évoluons-nous ?', description: 'Évolution, transhumanisme, ADN', materialIcon: 'biotech', tags: ['futur', 'nature-humaine', 'progres'] },
    ],
  },

  // ─── 4. Société & Civilisation ───
  {
    id: 'societe',
    title: 'Société & Civilisation',
    materialIcon: 'public',
    description: 'Comment nous organisons-nous, et pourrait-on faire mieux ?',
    templates: [
      { id: 'democratie', title: 'La démocratie est-elle le meilleur système ?', category: 'geopolitical', starterPrompt: 'La démocratie est-elle réellement le meilleur système politique, ou existe-t-il des alternatives plus efficaces pour le bien commun ?', description: 'Gouvernance, liberté, efficacité', materialIcon: 'how_to_vote', tags: ['societe', 'liberte', 'pouvoir', 'debat'] },
      { id: 'inegalites', title: 'L\'inégalité est-elle inévitable ?', category: 'economic', starterPrompt: 'Les inégalités sont-elles un état naturel des sociétés humaines, ou un échec systémique ? Peut-on imaginer une société véritablement égalitaire ?', description: 'Égalité, justice sociale, économie', materialIcon: 'bar_chart', tags: ['justice', 'societe', 'debat'] },
      { id: 'education-repenser', title: 'Faut-il réinventer l\'éducation ?', category: 'sociological', starterPrompt: 'Le système éducatif prépare-t-il vraiment à la vie ? Devrait-on apprendre à penser plutôt qu\'à mémoriser ? Qu\'est-ce qu\'une éducation réussie ?', description: 'École, apprentissage, futur', materialIcon: 'menu_book', tags: ['societe', 'futur', 'progres'] },
      { id: 'prison-sens', title: 'La prison a-t-elle un sens ?', category: 'ethical', starterPrompt: 'La prison est-elle une solution ou un problème ? Punir, réhabiliter, protéger — quel devrait être le but du système pénal ?', description: 'Justice, réhabilitation, société', materialIcon: 'lock', tags: ['justice', 'morale', 'societe'] },
      { id: 'immigration', title: 'Les frontières sont-elles légitimes ?', category: 'geopolitical', starterPrompt: 'Les frontières sont-elles un droit naturel des nations ou une construction arbitraire ? L\'immigration est-elle un défi ou une richesse ?', description: 'Frontières, nations, migration', materialIcon: 'language', tags: ['societe', 'identite', 'debat'] },
      { id: 'tradition-modernite', title: 'Tradition ou modernité ?', category: 'cultural', starterPrompt: 'Faut-il préserver les traditions ou les dépasser ? Peut-on être moderne tout en honorant le passé ? Qu\'est-ce qu\'on perd en "progressant" ?', description: 'Culture, héritage, changement', materialIcon: 'bolt', tags: ['histoire', 'identite', 'progres'] },
      { id: 'utopie', title: 'L\'utopie est-elle possible ?', category: 'civilizational', starterPrompt: 'Une société parfaite est-elle concevable, ou toute utopie cache-t-elle une dystopie ? Les tentatives historiques nous enseignent quoi ?', description: 'Utopie, idéalisme, réalité', materialIcon: 'filter_drama', tags: ['societe', 'futur', 'histoire'] },
      { id: 'progres-illusion', title: 'Le progrès est-il une illusion ?', category: 'civilizational', starterPrompt: 'L\'humanité progresse-t-elle vraiment, ou déplace-t-elle ses problèmes ? Le progrès technologique est-il synonyme de progrès humain ?', description: 'Progrès, technologie, sens', materialIcon: 'trending_up', tags: ['progres', 'debat', 'sens'] },
    ],
  },

  // ─── 5. Relations & Émotions ───
  {
    id: 'relations',
    title: 'Relations & Émotions',
    materialIcon: 'favorite',
    description: 'Ce qui nous lie, nous blesse et nous fait grandir',
    templates: [
      { id: 'amour-def', title: 'Qu\'est-ce que l\'amour ?', category: 'personal', starterPrompt: 'L\'amour est-il un sentiment, un choix, une chimie cérébrale, ou tout ça à la fois ? Peut-on aimer plusieurs personnes ? L\'amour dure-t-il ?', description: 'Sentiment, choix, neurosciences', materialIcon: 'favorite', tags: ['amour', 'nature-humaine', 'introspection'] },
      { id: 'amitie-vraie', title: 'L\'amitié vraie existe-t-elle ?', category: 'personal', starterPrompt: 'Peut-on avoir des amis véritablement désintéressés ? L\'amitié survivre-t-elle toujours à la distance, au temps, aux changements de vie ?', description: 'Amitié, loyauté, évolution', materialIcon: 'handshake', tags: ['amour', 'introspection', 'nature-humaine'] },
      { id: 'solitude', title: 'La solitude est-elle un mal ?', category: 'psychological', starterPrompt: 'La solitude est-elle toujours négative, ou peut-elle être choisie et féconde ? Quelle est la différence entre être seul et se sentir seul ?', description: 'Solitude choisie, isolement, introspection', materialIcon: 'terrain', tags: ['introspection', 'identite', 'sens'] },
      { id: 'pardon', title: 'Faut-il toujours pardonner ?', category: 'ethical', starterPrompt: 'Le pardon est-il une force ou une faiblesse ? Y a-t-il des actes impardonnables ? Pardonner, est-ce oublier ?', description: 'Pardon, rancune, guérison', materialIcon: 'volunteer_activism', tags: ['morale', 'introspection', 'amour'] },
      { id: 'jalousie', title: 'La jalousie est-elle naturelle ?', category: 'psychological', starterPrompt: 'La jalousie est-elle un instinct de survie, une insécurité, ou un signal important ? Peut-on s\'en débarrasser ? Doit-on ?', description: 'Émotions, instinct, contrôle', materialIcon: 'favorite', tags: ['nature-humaine', 'amour', 'introspection'] },
      { id: 'confiance', title: 'Comment se construit la confiance ?', category: 'psychological', starterPrompt: 'La confiance se gagne-t-elle ou se donne-t-elle ? Une fois brisée, peut-elle se reconstruire ? Faut-il faire confiance par défaut ?', description: 'Confiance, trahison, vulnérabilité', materialIcon: 'volunteer_activism', tags: ['amour', 'introspection', 'nature-humaine'] },
      { id: 'famille-choisie', title: 'La famille se choisit-elle ?', category: 'personal', starterPrompt: 'Doit-on tout à sa famille biologique ? Peut-on se construire une famille choisie ? Les liens du sang sont-ils plus forts que les liens du cœur ?', description: 'Famille, liens, liberté', materialIcon: 'family_restroom', tags: ['identite', 'amour', 'liberte'] },
      { id: 'deuil', title: 'Comment traverser le deuil ?', category: 'personal', starterPrompt: 'Le deuil a-t-il des étapes universelles, ou chacun vit-il la perte différemment ? Peut-on "guérir" d\'un deuil, ou apprend-on simplement à vivre avec ?', description: 'Perte, résilience, mémoire', materialIcon: 'spa', tags: ['mort', 'introspection', 'amour'] },
    ],
  },

  // ─── 6. Développement Personnel ───
  {
    id: 'developpement',
    title: 'Développement Personnel',
    materialIcon: 'eco',
    description: 'Se comprendre, se dépasser, se transformer',
    templates: [
      { id: 'peurs', title: 'Nos peurs nous définissent-elles ?', category: 'psychological', starterPrompt: 'Nos peurs révèlent-elles qui nous sommes vraiment ? Faut-il les affronter, les accepter, ou les dépasser ? D\'où viennent-elles ?', description: 'Peur, courage, psychologie', materialIcon: 'mood_bad', tags: ['introspection', 'identite', 'nature-humaine'] },
      { id: 'echec-reussite', title: 'L\'échec est-il nécessaire ?', category: 'personal', starterPrompt: 'Peut-on réussir sans avoir échoué ? L\'échec forge-t-il vraiment le caractère, ou est-ce un discours de motivateur ?', description: 'Échec, résilience, apprentissage', materialIcon: 'trending_down', tags: ['introspection', 'sens', 'nature-humaine'] },
      { id: 'succes', title: 'Qu\'est-ce que réussir sa vie ?', category: 'existential', starterPrompt: 'Réussir sa vie, c\'est quoi ? L\'argent, la famille, l\'impact social, le bonheur intérieur ? Et si on se trompait complètement de critères ?', description: 'Réussite, valeurs, société', materialIcon: 'emoji_events', tags: ['sens', 'introspection', 'societe'] },
      { id: 'confiance-soi', title: 'D\'où vient la confiance en soi ?', category: 'psychological', starterPrompt: 'La confiance en soi est-elle innée ou construite ? Peut-on la développer à n\'importe quel âge ? Le doute de soi est-il toujours un ennemi ?', description: 'Estime, doute, construction', materialIcon: 'fitness_center', tags: ['introspection', 'identite'] },
      { id: 'procrastination', title: 'Pourquoi procrastine-t-on ?', category: 'psychological', starterPrompt: 'La procrastination est-elle de la paresse, de la peur, ou un signal que quelque chose ne va pas ? Et si c\'était parfois la bonne stratégie ?', description: 'Motivation, résistance, productivité', materialIcon: 'schedule', tags: ['introspection', 'nature-humaine'] },
      { id: 'reinvention', title: 'Peut-on se réinventer à tout âge ?', category: 'personal', starterPrompt: 'Est-il vraiment possible de changer fondamentalement qui on est ? Les gens changent-ils, ou montrent-ils simplement de nouvelles facettes ?', description: 'Changement, identité, courage', materialIcon: 'change_history', tags: ['identite', 'liberte', 'introspection'] },
      { id: 'discipline-liberte', title: 'La discipline libère-t-elle ?', category: 'philosophical', starterPrompt: 'La discipline est-elle l\'ennemie de la liberté, ou sa condition ? Les routines strictes mènent-elles à plus de créativité ?', description: 'Discipline, habitudes, liberté', materialIcon: 'target', tags: ['liberte', 'debat', 'introspection'] },
    ],
  },

  // ─── 7. Argent & Carrière ───
  {
    id: 'argent',
    title: 'Argent & Carrière',
    materialIcon: 'work',
    description: 'Le travail, l\'argent et ce qu\'ils disent de nous',
    templates: [
      { id: 'argent-bonheur', title: 'L\'argent fait-il le bonheur ?', category: 'economic', starterPrompt: 'L\'argent fait-il le bonheur ? À partir de quel seuil cesse-t-il d\'améliorer la vie ? La pauvreté est-elle toujours un obstacle au bonheur ?', description: 'Richesse, satisfaction, valeurs', materialIcon: 'savings', tags: ['debat', 'sens', 'societe'] },
      { id: 'passion-travail', title: 'Faut-il vivre de sa passion ?', category: 'personal', starterPrompt: 'Transformer sa passion en métier : rêve ou piège ? La passion survit-elle quand elle devient une obligation ?', description: 'Passion, travail, réalisme', materialIcon: 'local_fire_department', tags: ['sens', 'liberte', 'introspection'] },
      { id: 'entrepreneur', title: 'L\'entrepreneuriat est-il pour tout le monde ?', category: 'economic', starterPrompt: 'Devenir entrepreneur : liberté ou illusion ? La société glorifie-t-elle trop l\'entrepreneur au détriment du salarié ?', description: 'Entreprendre, risque, liberté', materialIcon: 'rocket_launch', tags: ['liberte', 'societe', 'debat'] },
      { id: 'travail-sens', title: 'Le travail a-t-il encore un sens ?', category: 'sociological', starterPrompt: 'Avec l\'IA, l\'automatisation et le remote, le travail est-il en train de perdre son sens ? Que serait une société sans "travail" ?', description: 'Sens, automatisation, futur', materialIcon: 'settings', tags: ['futur', 'sens', 'societe'] },
      { id: 'richesse-merite', title: 'Les riches méritent-ils leur fortune ?', category: 'ethical', starterPrompt: 'La richesse est-elle méritée, héritée, ou le fruit du hasard et du système ? Les milliardaires sont-ils des génies ou des profiteurs ?', description: 'Méritocratie, inégalités, éthique', materialIcon: 'account_balance', tags: ['justice', 'morale', 'debat'] },
      { id: 'retraite', title: 'Devrait-on repenser la retraite ?', category: 'sociological', starterPrompt: 'Le concept de retraite à 60-65 ans a-t-il encore du sens ? Et si on alternait travail et pause tout au long de la vie ?', description: 'Retraite, vieillissement, modèle', materialIcon: 'beach_access', tags: ['societe', 'futur', 'progres'] },
    ],
  },

  // ─── 8. Créativité & Art ───
  {
    id: 'art',
    title: 'Créativité & Art',
    materialIcon: 'palette',
    description: 'L\'expression, la beauté et le génie humain',
    templates: [
      { id: 'beaute', title: 'Qu\'est-ce que la beauté ?', category: 'artistic', starterPrompt: 'La beauté est-elle objective et universelle, ou purement subjective ? Pourquoi certaines choses nous émeuvent profondément ?', description: 'Esthétique, émotion, universalité', materialIcon: 'local_florist', tags: ['sens', 'conscience', 'nature-humaine'] },
      { id: 'genie', title: 'Le génie est-il inné ?', category: 'artistic', starterPrompt: 'Mozart, Léonard de Vinci, Einstein — étaient-ils prédestinés, ou le résultat d\'un travail acharné et de circonstances favorables ?', description: 'Talent, travail, excellence', materialIcon: 'auto_awesome', tags: ['nature-humaine', 'debat', 'identite'] },
      { id: 'art-ia', title: 'L\'art créé par IA est-il de l\'art ?', category: 'technological', starterPrompt: 'Si une IA crée une peinture qui émeut, est-ce de l\'art ? L\'intention de l\'artiste est-elle nécessaire ? Qu\'est-ce qui fait "l\'art" ?', description: 'IA créative, intention, émotion', materialIcon: 'image', tags: ['futur', 'debat', 'conscience'] },
      { id: 'musique-emotion', title: 'Pourquoi la musique nous touche ?', category: 'artistic', starterPrompt: 'Comment des vibrations dans l\'air peuvent-elles provoquer des larmes, des frissons, de la joie ? La musique est-elle un langage universel ?', description: 'Musique, neurosciences, émotion', materialIcon: 'music_note', tags: ['conscience', 'nature-humaine'] },
      { id: 'creativite-folie', title: 'Faut-il être un peu fou pour créer ?', category: 'psychological', starterPrompt: 'Y a-t-il un lien entre créativité et folie ? Les plus grands artistes étaient-ils tourmentés par nécessité ou par hasard ?', description: 'Créativité, psychologie, art', materialIcon: 'theater_comedy', tags: ['identite', 'nature-humaine', 'introspection'] },
      { id: 'ecriture-pouvoir', title: 'L\'écriture change-t-elle le monde ?', category: 'cultural', starterPrompt: 'Un livre peut-il changer le cours de l\'histoire ? Les mots ont-ils un vrai pouvoir, ou ne font-ils que refléter ce qui existe déjà ?', description: 'Littérature, influence, pouvoir', materialIcon: 'draw', tags: ['pouvoir', 'histoire', 'progres'] },
    ],
  },

  // ─── 9. Géopolitique & Histoire ───
  {
    id: 'geopolitique',
    title: 'Géopolitique & Histoire',
    materialIcon: 'map',
    description: 'Le monde tel qu\'il est, et comment il en est arrivé là',
    templates: [
      { id: 'guerres', title: 'Les guerres sont-elles inévitables ?', category: 'geopolitical', starterPrompt: 'L\'humanité peut-elle un jour vivre en paix, ou la guerre fait-elle partie de notre nature ? Les conflits ont-ils parfois été moteurs de progrès ?', description: 'Guerre, paix, nature humaine', materialIcon: 'swords', tags: ['nature-humaine', 'histoire', 'pouvoir'] },
      { id: 'colonialisme', title: 'Peut-on réparer le colonialisme ?', category: 'historical', starterPrompt: 'Les séquelles du colonialisme sont-elles réparables ? Que doivent les anciennes puissances coloniales ? Comment avancer ensemble ?', description: 'Colonialisme, réparation, mémoire', materialIcon: 'flag', tags: ['justice', 'histoire', 'pouvoir'] },
      { id: 'empire', title: 'Les empires sont-ils condamnés à tomber ?', category: 'historical', starterPrompt: 'Rome, la Chine impériale, les empires coloniaux — tous ont chuté. Les grandes puissances actuelles suivront-elles le même chemin ?', description: 'Empires, cycles, déclin', materialIcon: 'account_balance', tags: ['histoire', 'pouvoir', 'societe'] },
      { id: 'religion-pouvoir', title: 'Religion et pouvoir : un mariage inévitable ?', category: 'historical', starterPrompt: 'La religion a toujours été liée au pouvoir politique. La séparation Église-État est-elle une anomalie historique ? Est-elle tenable ?', description: 'Théocratie, laïcité, influence', materialIcon: 'crown', tags: ['foi', 'pouvoir', 'histoire'] },
      { id: 'revolutions', title: 'Les révolutions changent-elles vraiment les choses ?', category: 'historical', starterPrompt: 'Les révolutions améliorent-elles réellement la société, ou remplacent-elles simplement une élite par une autre ?', description: 'Révolution, changement, pouvoir', materialIcon: 'front_hand', tags: ['pouvoir', 'histoire', 'liberte'] },
      { id: 'histoire-repete', title: 'L\'histoire se répète-t-elle ?', category: 'historical', starterPrompt: 'L\'histoire est-elle cyclique ou linéaire ? Les civilisations sont-elles condamnées à répéter les mêmes erreurs ?', description: 'Cycles, leçons, patterns', materialIcon: 'sync', tags: ['histoire', 'sens', 'nature-humaine'] },
      { id: 'occident-declin', title: 'L\'Occident est-il en déclin ?', category: 'civilizational', starterPrompt: 'L\'Occident perd-il son influence ? Assistons-nous à un basculement du centre de gravité mondial vers l\'Asie ? Qu\'est-ce que cela signifie ?', description: 'Occident, Asie, transition', materialIcon: 'public', tags: ['histoire', 'pouvoir', 'societe'] },
    ],
  },

  // ─── 10. Technologie & Futur ───
  {
    id: 'technologie',
    title: 'Technologie & Futur',
    materialIcon: 'smart_toy',
    description: 'Vers quoi nous dirigeons-nous ?',
    templates: [
      { id: 'transhumanisme', title: 'Devrait-on "améliorer" l\'humain ?', category: 'technological', starterPrompt: 'Le transhumanisme promet de dépasser les limites du corps humain. Devrait-on modifier notre ADN, augmenter nos capacités ? Où est la limite ?', description: 'Transhumanisme, éthique, limites', materialIcon: 'smart_toy', tags: ['futur', 'morale', 'nature-humaine'] },
      { id: 'vie-virtuelle', title: 'Vivra-t-on un jour dans le virtuel ?', category: 'technological', starterPrompt: 'Si une réalité virtuelle est indiscernable de la réalité, pourquoi ne pas y vivre ? La "vraie" vie a-t-elle une valeur intrinsèque ?', description: 'VR, métavers, réalité, choix', materialIcon: 'visibility', tags: ['futur', 'conscience', 'sens'] },
      { id: 'surveillance', title: 'Vie privée ou sécurité ?', category: 'ethical', starterPrompt: 'Accepteriez-vous une surveillance totale si elle éliminait la criminalité ? Où est la frontière entre sécurité et liberté ?', description: 'Surveillance, liberté, vie privée', materialIcon: 'visibility', tags: ['liberte', 'societe', 'debat'] },
      { id: 'fin-travail', title: 'L\'IA va-t-elle remplacer le travail ?', category: 'economic', starterPrompt: 'Si l\'IA fait tout mieux que nous, que ferons-nous de nos journées ? Le revenu universel est-il inévitable ? Et notre sens de l\'utilité ?', description: 'Automatisation, emploi, sens', materialIcon: 'factory', tags: ['futur', 'societe', 'sens'] },
      { id: 'immortalite', title: 'L\'immortalité est-elle souhaitable ?', category: 'existential', starterPrompt: 'Si la science permettait de vivre éternellement, le voudriez-vous ? La mort donne-t-elle un sens à la vie ?', description: 'Immortalité, mort, sens', materialIcon: 'all_inclusive', tags: ['mort', 'sens', 'futur'] },
      { id: 'reseaux-cerveau', title: 'Les réseaux sociaux nous rendent-ils idiots ?', category: 'technological', starterPrompt: 'Les réseaux sociaux atrophient-ils notre capacité de réflexion profonde ? Ou démocratisent-ils le savoir et connectent-ils les gens ?', description: 'Attention, dopamine, connexion', materialIcon: 'phone_iphone', tags: ['societe', 'conscience', 'debat'] },
      { id: 'humain-obsolete', title: 'L\'humain devient-il obsolète ?', category: 'existential', starterPrompt: 'Avec l\'IA, la robotique, le génie génétique — l\'espèce humaine telle qu\'on la connaît a-t-elle un avenir ? Qu\'est-ce qui restera irremplaçable ?', description: 'IA, obsolescence, humanité', materialIcon: 'science', tags: ['futur', 'nature-humaine', 'sens'] },
    ],
  },

  // ─── 11. Spiritualité & Mystère ───
  {
    id: 'spiritualite',
    title: 'Spiritualité & Mystère',
    materialIcon: 'auto_awesome',
    description: 'Au-delà du visible, du mesurable et du rationnel',
    templates: [
      { id: 'ame', title: 'L\'âme existe-t-elle ?', category: 'spiritual', starterPrompt: 'L\'âme est-elle une réalité, une métaphore, ou un vestige de pensée religieuse ? La conscience peut-elle exister sans corps ?', description: 'Âme, conscience, matérialisme', materialIcon: 'star', tags: ['conscience', 'foi', 'sens'] },
      { id: 'karma', title: 'Le karma est-il réel ?', category: 'spiritual', starterPrompt: 'L\'idée que nos actions nous reviennent — superstition ou sagesse profonde ? Le karma fonctionne-t-il, même sans y croire ?', description: 'Karma, causalité, justice', materialIcon: 'all_inclusive', tags: ['foi', 'morale', 'justice'] },
      { id: 'priere', title: 'La prière a-t-elle un effet ?', category: 'religious', starterPrompt: 'La prière fonctionne-t-elle ? Est-ce une connexion avec le divin, une forme de méditation, un placebo, ou tout cela à la fois ?', description: 'Prière, foi, science, effet', materialIcon: 'self_improvement', tags: ['foi', 'conscience', 'debat'] },
      { id: 'reves', title: 'Que nous disent nos rêves ?', category: 'psychological', starterPrompt: 'Les rêves ont-ils un sens ou sont-ils du bruit neural ? Freud, Jung, les neurosciences — qui a raison ? Avez-vous déjà eu un rêve qui vous a changé ?', description: 'Rêves, inconscient, symboles', materialIcon: 'dark_mode', tags: ['conscience', 'introspection', 'nature-humaine'] },
      { id: 'synchronicites', title: 'Les coïncidences ont-elles un sens ?', category: 'spiritual', starterPrompt: 'Quand les coïncidences s\'accumulent, est-ce du hasard ou un signe ? Jung parlait de synchronicité. Peut-on être rationnel et ouvert à cette idée ?', description: 'Synchronicité, hasard, sens', materialIcon: 'link', tags: ['sens', 'foi', 'conscience'] },
      { id: 'nde', title: 'Les expériences de mort imminente prouvent-elles quelque chose ?', category: 'spiritual', starterPrompt: 'Le tunnel de lumière, la sortie du corps, les retrouvailles — les NDE sont-elles une preuve de l\'au-delà ou une explication neurologique ?', description: 'NDE, mort, conscience, cerveau', materialIcon: 'lightbulb', tags: ['mort', 'conscience', 'foi'] },
      { id: 'meditation', title: 'La méditation peut-elle tout changer ?', category: 'spiritual', starterPrompt: 'La méditation est-elle la clé du bien-être, ou juste une mode ? Les moines qui méditent depuis 30 ans savent-ils quelque chose que nous ignorons ?', description: 'Méditation, conscience, science', materialIcon: 'self_improvement', tags: ['conscience', 'introspection', 'sens'] },
    ],
  },

  // ─── 12. Dilemmes & Débats ───
  {
    id: 'dilemmes',
    title: 'Dilemmes & Débats',
    materialIcon: 'balance',
    description: 'Des questions sans réponse facile — et c\'est ce qui les rend passionnantes',
    templates: [
      { id: 'trolley', title: 'Le dilemme du tramway', category: 'ethical', starterPrompt: 'Tirerais-tu le levier pour sauver 5 personnes en en sacrifiant 1 ? Et si la personne sacrifiée était quelqu\'un que tu aimes ? Où est la limite morale ?', description: 'Utilitarisme, morale, choix', materialIcon: 'directions_railway', tags: ['morale', 'debat', 'justice'] },
      { id: 'mensonge-proteger', title: 'Peut-on mentir pour protéger ?', category: 'ethical', starterPrompt: 'Le mensonge est-il toujours condamnable ? Y a-t-il des situations où mentir est non seulement acceptable, mais moralement nécessaire ?', description: 'Mensonge, vérité, protection', materialIcon: 'mood', tags: ['morale', 'debat', 'amour'] },
      { id: 'liberte-securite', title: 'Liberté ou sécurité ?', category: 'ethical', starterPrompt: '"Ceux qui sacrifient la liberté pour la sécurité ne méritent ni l\'une ni l\'autre." Franklin avait-il raison, ou le monde a-t-il changé ?', description: 'Liberté, sécurité, compromis', materialIcon: 'lock', tags: ['liberte', 'debat', 'societe'] },
      { id: 'droits-animaux', title: 'Les animaux ont-ils des droits ?', category: 'ethical', starterPrompt: 'Manger de la viande est-il moralement défendable ? Les animaux souffrent-ils comme nous ? Où tracer la ligne entre l\'humain et l\'animal ?', description: 'Droits animaux, souffrance, morale', materialIcon: 'pets', tags: ['morale', 'debat', 'nature-humaine'] },
      { id: 'euthanasie', title: 'A-t-on le droit de choisir sa mort ?', category: 'ethical', starterPrompt: 'L\'euthanasie et le suicide assisté sont-ils un droit fondamental ou une pente glissante ? Qui devrait pouvoir décider de quand et comment mourir ?', description: 'Euthanasie, dignité, choix', materialIcon: 'wb_twilight', tags: ['mort', 'liberte', 'morale'] },
      { id: 'peine-mort', title: 'La peine de mort est-elle justifiable ?', category: 'ethical', starterPrompt: 'Certains crimes méritent-ils la mort ? La peine de mort est-elle une justice ou une vengeance institutionnalisée ?', description: 'Justice, punition, morale', materialIcon: 'bolt', tags: ['justice', 'morale', 'debat'] },
      { id: 'heritage-abolir', title: 'Devrait-on abolir l\'héritage ?', category: 'economic', starterPrompt: 'L\'héritage perpétue les inégalités. Mais le supprimer, n\'est-ce pas nier le droit de transmettre à ses enfants ? Où est l\'équilibre ?', description: 'Héritage, égalité, famille', materialIcon: 'home', tags: ['justice', 'societe', 'debat'] },
      { id: 'verite-blessante', title: 'Faut-il toujours dire la vérité ?', category: 'ethical', starterPrompt: 'La vérité est-elle toujours préférable au mensonge ? Quand la vérité blesse, le silence est-il de la lâcheté ou de la compassion ?', description: 'Vérité, compassion, courage', materialIcon: 'diamond', tags: ['morale', 'debat', 'introspection'] },
    ],
  },
];

// Flat list of all templates (for search and random pick)
export const ALL_TEMPLATES: DiscussionTemplate[] = (() => {
  const seen = new Set<string>();
  return TEMPLATE_SECTIONS.flatMap(s => s.templates).filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
})();

// Get 3 "daily dilemmas" based on date seed
export function getDailyTemplates(): DiscussionTemplate[] {
  const seed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const num = parseInt(seed, 10);
  const shuffled = [...ALL_TEMPLATES].sort((a, b) => {
    const ha = hashStr(a.id + seed);
    const hb = hashStr(b.id + seed);
    return ha !== hb ? ha - hb : a.id.localeCompare(b.id);
  });
  return shuffled.slice(0, 3);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

// Legacy: keep DISCUSSION_TEMPLATES for backward compat
export const DISCUSSION_TEMPLATES = ALL_TEMPLATES;

// ─── Conclusion Prompt ──────────────────────────────────────────────────────

export function buildConclusionPrompt(discussion: DeepDiscussion): string {
  const kpList = discussion.keyPoints.length > 0
    ? '\nPoints clés découverts:\n' + discussion.keyPoints.map((kp, i) => `${i + 1}. ${kp.text}`).join('\n')
    : '';

  return `L'interlocuteur souhaite conclure cette discussion. Fais un bilan final structuré:

1. **Thèses explorées** — Les grandes idées qui ont émergé
2. **Points de convergence** — Ce sur quoi nous sommes tombés d'accord
3. **Tensions irrésolues** — Les questions qui restent ouvertes
4. **Évolution** — Comment la réflexion a évolué au fil de la discussion
5. **Ouverture** — Une dernière pensée ou question à méditer
${kpList}

Sois concis mais profond. Ce bilan doit capturer l'essence de ${discussion.depth} échanges.`;
}

// ─── Social Sharing ─────────────────────────────────────────────────────────

export const SHARE_PLATFORMS: SharePlatform[] = [
  { id: 'twitter', label: 'Twitter / X', materialIcon: 'share', color: '#1da1f2', maxLength: 280 },
  { id: 'linkedin', label: 'LinkedIn', materialIcon: 'work', color: '#0077b5', maxLength: 3000 },
  { id: 'facebook', label: 'Facebook', materialIcon: 'thumb_up', color: '#1877f2', maxLength: 63206 },
  { id: 'whatsapp', label: 'WhatsApp', materialIcon: 'chat', color: '#25D366', maxLength: 65536 },
  { id: 'email', label: 'Email', materialIcon: 'mail', color: '#666666', maxLength: 100000 },
];

export function formatShareContent(content: ShareContent, platformId: string): string {
  const platform = SHARE_PLATFORMS.find(p => p.id === platformId);
  const maxLen = platform?.maxLength ?? 280;
  const attribution = `\n\n— ${content.agentEmoji} ${content.agentName} · "${content.discussionTitle}"`;
  const hashtags = '\n#Freenzy #IA #DeepThinking';
  const base = content.text + attribution;

  if (base.length + hashtags.length <= maxLen) return base + hashtags;
  if (base.length <= maxLen) return base;
  return content.text.slice(0, maxLen - attribution.length - 4) + '...' + attribution;
}

export function buildShareUrl(content: ShareContent, platformId: string): string | null {
  const text = formatShareContent(content, platformId);
  const siteUrl = 'https://freenzy.io';

  switch (platformId) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${encodeURIComponent(text)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(text)}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + siteUrl)}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent(`Freenzy.io — ${content.discussionTitle}`)}&body=${encodeURIComponent(text + '\n\n' + siteUrl)}`;
    default:
      return null;
  }
}
