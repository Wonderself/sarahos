// Agent Bonding System — relationship tracking between users and agents

export interface AgentBond {
  agentId: string;
  totalInteractions: number;
  lastInteractionAt: string;
  streak: number;
  lastStreakDate: string;
  relationshipLevel: number;     // 1-5
  satisfactionScore: number;     // 0-100
  feedbackCount: number;
  positiveFeedbackCount: number;
}

export interface BondingState {
  bonds: Record<string, AgentBond>;
  version: number;
}

const STORAGE_KEY = 'fz_agent_bonding';

const LEVEL_THRESHOLDS = [0, 5, 20, 50, 100]; // interactions needed for each level
export const LEVEL_NAMES = [
  'Inconnu',            // 0 (unused, levels start at 1)
  'Inconnu',            // 1
  'Connaissance',       // 2
  'Collègue',           // 3
  'Partenaire',         // 4
  'Conseiller de confiance', // 5
];
export const LEVEL_ICONS = ['', 'person', 'handshake', 'work', 'star', 'diamond'];

function getDefaultBond(agentId: string): AgentBond {
  return {
    agentId,
    totalInteractions: 0,
    lastInteractionAt: '',
    streak: 0,
    lastStreakDate: '',
    relationshipLevel: 1,
    satisfactionScore: 50,
    feedbackCount: 0,
    positiveFeedbackCount: 0,
  };
}

function getDefaultState(): BondingState {
  return { bonds: {}, version: 1 };
}

export function loadBonding(): BondingState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    return { ...getDefaultState(), ...JSON.parse(stored) };
  } catch { return getDefaultState(); }
}

export function saveBonding(state: BondingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function computeLevel(interactions: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (interactions >= LEVEL_THRESHOLDS[i]) return Math.min(i + 1, 5);
  }
  return 1;
}

export function recordAgentInteraction(agentId: string): { bond: AgentBond; leveledUp: boolean } {
  const state = loadBonding();
  const bond = state.bonds[agentId] ?? getDefaultBond(agentId);
  const oldLevel = bond.relationshipLevel;

  bond.totalInteractions += 1;
  bond.lastInteractionAt = new Date().toISOString();

  // Streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (bond.lastStreakDate === today) {
    // same day, no change
  } else if (bond.lastStreakDate === yesterday) {
    bond.streak += 1;
  } else {
    bond.streak = 1;
  }
  bond.lastStreakDate = today;

  // Level
  bond.relationshipLevel = computeLevel(bond.totalInteractions);

  state.bonds[agentId] = bond;
  saveBonding(state);

  return { bond, leveledUp: bond.relationshipLevel > oldLevel };
}

export function recordFeedback(agentId: string, positive: boolean): AgentBond {
  const state = loadBonding();
  const bond = state.bonds[agentId] ?? getDefaultBond(agentId);

  bond.feedbackCount += 1;
  if (positive) bond.positiveFeedbackCount += 1;

  // Recalculate satisfaction as % positive
  bond.satisfactionScore = bond.feedbackCount > 0
    ? Math.round((bond.positiveFeedbackCount / bond.feedbackCount) * 100)
    : 50;

  state.bonds[agentId] = bond;
  saveBonding(state);
  return bond;
}

export function getBond(agentId: string): AgentBond {
  const state = loadBonding();
  return state.bonds[agentId] ?? getDefaultBond(agentId);
}

export function getTopAgents(limit = 3): AgentBond[] {
  const state = loadBonding();
  return Object.values(state.bonds)
    .sort((a, b) => b.totalInteractions - a.totalInteractions)
    .slice(0, limit);
}

export function shouldAgentReachOut(agentId: string): boolean {
  const bond = getBond(agentId);
  if (bond.relationshipLevel < 3) return false; // only Collègue+
  if (!bond.lastInteractionAt) return false;
  const daysSince = (Date.now() - new Date(bond.lastInteractionAt).getTime()) / 86400000;
  return daysSince >= 3;
}

export function getAllBonds(): AgentBond[] {
  const state = loadBonding();
  return Object.values(state.bonds);
}

export function getAgentCount(): number {
  const state = loadBonding();
  return Object.keys(state.bonds).length;
}

/** Build a system prompt block describing the relationship context */
export function buildBondingPromptBlock(bond: AgentBond): string {
  const levelName = LEVEL_NAMES[bond.relationshipLevel] ?? 'Inconnu';

  let directive: string;
  if (bond.satisfactionScore < 40) {
    directive = "Sois plus à l'écoute, demande ce qui ne va pas, propose des alternatives. L'utilisateur semble insatisfait.";
  } else if (bond.satisfactionScore <= 70) {
    directive = "Continue à bien aider, propose des améliorations subtiles. Demande régulièrement si tu peux faire mieux.";
  } else {
    directive = "Tu es apprécié. Sois plus proactif, propose des idées innovantes. Montre que tu te souviens des échanges précédents.";
  }

  return `
RELATION AVEC L'UTILISATEUR:
- Niveau: ${levelName}
- Interactions: ${bond.totalInteractions} échanges
- Satisfaction: ${bond.satisfactionScore}%
- DIRECTIVE: Tu dois activement chercher à aider l'utilisateur et te rendre indispensable.
  ${directive}
  Pose des questions sur ce que tu peux améliorer. Propose des idées sans qu'on te le demande.
  Sois chaleureux mais professionnel.
  Si l'utilisateur semble frustré, demande directement "Qu'est-ce que je peux faire mieux pour toi ?"`.trim();
}
