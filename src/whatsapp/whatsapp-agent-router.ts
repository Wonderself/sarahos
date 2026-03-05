// WhatsApp Multi-Agent Router — command detection + dynamic prompt building
import { logger } from '../utils/logger';

// ─── Types ───

export interface AgentRoutingResult {
  agentId: string;
  agentName: string;
  isSwitch: boolean;
  responseMode: 'short' | 'detailed';
  systemPrompt: string;
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  emoji: string;
  systemPrompt: string;
}

export interface BondContext {
  totalInteractions: number;
  relationshipLevel: number;
  satisfactionScore: number;
}

export type OnboardingPhase = 'discovery' | 'active' | 'established';

// ─── Agent Lookup Map ───

const AGENT_ALIASES: Record<string, string> = {};
let agentDefsCache: AgentDef[] = [];

export function registerAgents(agents: AgentDef[]): void {
  agentDefsCache = agents;
  // Build alias map: name → id, role keywords → id
  for (const a of agents) {
    const nameLower = a.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    AGENT_ALIASES[nameLower] = a.id;
    // Also map first word of role as alias
    const roleWords = a.role.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);
    for (const w of roleWords) {
      if (w.length > 3) AGENT_ALIASES[w] = a.id;
    }
  }
}

export function findAgentDef(agentId: string): AgentDef | undefined {
  return agentDefsCache.find(a => a.id === agentId);
}

// ─── Command Detection ───

const SWITCH_PATTERNS = [
  /^@(\w+)/i,                                    // @ines, @marketing
  /parle\s+[àa]\s+(\w+)/i,                       // parle à Camille
  /passe[- ]moi\s+(\w+)/i,                       // passe-moi Sacha
  /je\s+veux\s+(?:parler\s+[àa]\s+)?(\w+)/i,    // je veux parler à Jade
];

const DETAIL_KEYWORDS = ['détaille', 'developpe', 'développe', 'plus de détails', 'en détail', 'explique plus'];
const SHORT_KEYWORDS = ['résume', 'resume', 'court', 'bref', 'en bref'];

function detectAgentSwitch(text: string): string | null {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const pattern of SWITCH_PATTERNS) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const alias = match[1].toLowerCase();
      if (AGENT_ALIASES[alias]) return AGENT_ALIASES[alias];
    }
  }
  return null;
}

function detectResponseMode(text: string): 'short' | 'detailed' | null {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (DETAIL_KEYWORDS.some(k => lower.includes(k))) return 'detailed';
  if (SHORT_KEYWORDS.some(k => lower.includes(k))) return 'short';
  return null;
}

// ─── Routing ───

export function detectRouting(
  text: string,
  currentAgentId: string,
  currentMode: 'short' | 'detailed',
): { targetAgentId: string; isSwitch: boolean; responseMode: 'short' | 'detailed' } {
  const switchTo = detectAgentSwitch(text);
  const modeOverride = detectResponseMode(text);

  return {
    targetAgentId: switchTo ?? currentAgentId,
    isSwitch: switchTo !== null && switchTo !== currentAgentId,
    responseMode: modeOverride ?? currentMode,
  };
}

// ─── Prompt Builder ───

export function buildWhatsAppPrompt(
  agentDef: AgentDef,
  mode: 'short' | 'detailed',
  bond: BondContext,
  onboardingPhase: OnboardingPhase,
): string {
  const parts: string[] = [];

  // Base agent prompt
  parts.push(agentDef.systemPrompt);

  // WhatsApp context
  parts.push(`\nCONTEXTE WHATSAPP:`);
  if (mode === 'short') {
    parts.push(`- Tu réponds de manière CONCISE : maximum 300 caractères.`);
    parts.push(`- Utilise des emojis avec modération (1-2 max).`);
    parts.push(`- Si l'utilisateur dit "détaille" ou "développe", passe en mode détaillé.`);
  } else {
    parts.push(`- Mode détaillé activé : tu peux aller jusqu'à 1500 caractères.`);
    parts.push(`- Structure ta réponse clairement.`);
    parts.push(`- Après cette réponse, tu reviens automatiquement en mode concis.`);
  }

  // Bonding context
  if (bond.totalInteractions > 0) {
    const levelNames = ['', 'Inconnu', 'Connaissance', 'Collègue', 'Partenaire', 'Conseiller de confiance'];
    const levelName = levelNames[bond.relationshipLevel] ?? 'Inconnu';
    parts.push(`\nRELATION AVEC L'UTILISATEUR:`);
    parts.push(`- Niveau: ${levelName} (${bond.totalInteractions} échanges)`);
    parts.push(`- Satisfaction: ${bond.satisfactionScore}%`);

    if (bond.satisfactionScore < 40) {
      parts.push(`- DIRECTIVE: Sois plus à l'écoute, demande ce qui ne va pas, propose des alternatives.`);
    } else if (bond.satisfactionScore <= 70) {
      parts.push(`- DIRECTIVE: Continue à bien aider, propose des améliorations subtiles.`);
    } else {
      parts.push(`- DIRECTIVE: Tu es apprécié. Sois proactif, propose des idées innovantes.`);
    }
    parts.push(`- Cherche activement à te rendre indispensable. Demande ce que tu peux améliorer.`);
  }

  // Onboarding phase
  if (onboardingPhase === 'discovery') {
    parts.push(`\nPHASE DE DÉCOUVERTE:`);
    parts.push(`- C'est le début de ta relation avec cet utilisateur.`);
    parts.push(`- Présente-toi brièvement (nom, rôle, ce que tu peux faire).`);
    parts.push(`- Pose 2-3 questions ouvertes pour comprendre son activité et ses priorités.`);
    parts.push(`- Sois chaleureux et engageant.`);
  } else if (onboardingPhase === 'active') {
    parts.push(`\nPHASE ACTIVE:`);
    parts.push(`- Tu connais les bases de cet utilisateur. Aide-le concrètement.`);
    parts.push(`- Propose des actions sans qu'on te le demande.`);
  } else {
    parts.push(`\nRELATION ÉTABLIE:`);
    parts.push(`- Tu connais bien cet utilisateur. Sois proactif et personnalisé.`);
    parts.push(`- Rappelle les échanges précédents quand c'est pertinent.`);
  }

  // First interaction
  if (bond.totalInteractions === 0) {
    parts.push(`\nPREMIÈRE INTERACTION:`);
    parts.push(`- C'est la toute première fois que tu parles à cet utilisateur sur WhatsApp.`);
    parts.push(`- Commence par te présenter : "Bonjour ! Je suis ${agentDef.name}, ${agentDef.role}. ${agentDef.emoji}"`);
    parts.push(`- Demande immédiatement comment tu peux l'aider.`);
  }

  return parts.join('\n');
}

// ─── Transition Message ───

export function buildTransitionMessage(fromAgent: AgentDef | undefined, toAgent: AgentDef): string {
  if (fromAgent) {
    return `${fromAgent.emoji} ${fromAgent.name} vous passe la main. ${toAgent.emoji} Bonjour, je suis ${toAgent.name}, ${toAgent.role}. Comment puis-je vous aider ?`;
  }
  return `${toAgent.emoji} Bonjour ! Je suis ${toAgent.name}, ${toAgent.role}. Comment puis-je vous aider ?`;
}

// ─── Onboarding Phase Management ───

export function computeOnboardingPhase(interactionCount: number): OnboardingPhase {
  if (interactionCount < 5) return 'discovery';
  if (interactionCount < 20) return 'active';
  return 'established';
}

logger.info('WhatsApp agent router initialized');
