/**
 * Index des 20 Agents Freenzy.io
 * Catalogue complet + fonctions de recherche et recommandation
 */

// ─── Imports ───
import { agent01SecretaireMedicale } from './agent-01-secretaire-medicale';
import { agent02DevisPro } from './agent-02-devis-pro';
import { agent03ReputationAvis } from './agent-03-reputation-avis';
import { agent04ContentLinkedin } from './agent-04-content-linkedin';
import { agent05SavAuto } from './agent-05-sav-auto';
import { agent06Documents } from './agent-06-documents';
import { agent07Relances } from './agent-07-relances';
import { agent08Reporting } from './agent-08-reporting';
import { agent09SocialFood } from './agent-09-social-food';
import { agent10PaniersAbandonnes } from './agent-10-paniers-abandonnes';
import { agent11VeilleReglementaire } from './agent-11-veille-reglementaire';
import { agent12BriefingMatinal } from './agent-12-briefing-matinal';
import { agent13IntelligenceGatherer } from './agent-13-intelligence-gatherer';
import { agent14AmeliorationProduit } from './agent-14-amelioration-produit';
import { agent15FormationInterne } from './agent-15-formation-interne';
import { agent16ProgrammeFormation } from './agent-16-programme-formation';
import { agent17RdvPlanning } from './agent-17-rdv-planning';
import { agent18FichesProduits } from './agent-18-fiches-produits';
import { agent19EmailMarketing } from './agent-19-email-marketing';
import { agent20AnalyseConcurrentielle } from './agent-20-analyse-concurrentielle';

// ─── Re-export type ───
export type { AgentConfig } from './agent-01-secretaire-medicale';

// ─── User Profile type for recommendations ───
export interface UserProfile {
  profession: string;
  sub_profession?: string;
  goals: string[];
  ai_level: 'debutant' | 'curieux' | 'intermediaire' | 'expert';
  team_size?: number;
  has_website?: boolean;
  has_gmb?: boolean;
}

// ─── Catalogue complet ───
export const AGENTS_CATALOG = [
  agent01SecretaireMedicale,
  agent02DevisPro,
  agent03ReputationAvis,
  agent04ContentLinkedin,
  agent05SavAuto,
  agent06Documents,
  agent07Relances,
  agent08Reporting,
  agent09SocialFood,
  agent10PaniersAbandonnes,
  agent11VeilleReglementaire,
  agent12BriefingMatinal,
  agent13IntelligenceGatherer,
  agent14AmeliorationProduit,
  agent15FormationInterne,
  agent16ProgrammeFormation,
  agent17RdvPlanning,
  agent18FichesProduits,
  agent19EmailMarketing,
  agent20AnalyseConcurrentielle,
] as const;

// ─── Index par profil ───
export const AGENTS_BY_PROFILE: Record<string, string[]> = {
  sante: ['secretaire-medicale', 'reputation-google', 'documents-juridiques', 'relances-clients', 'rdv-planning', 'veille-reglementaire', 'briefing-matinal', 'email-marketing'],
  artisan: ['devis-pro-artisan', 'reputation-google', 'relances-clients', 'rdv-planning', 'briefing-matinal', 'email-marketing'],
  pme: ['reporting-analytics', 'documents-juridiques', 'relances-clients', 'sav-auto', 'formation-interne', 'veille-reglementaire', 'briefing-matinal', 'email-marketing', 'analyse-concurrentielle'],
  agence: ['content-linkedin', 'reporting-analytics', 'documents-juridiques', 'relances-clients', 'formation-interne', 'briefing-matinal', 'email-marketing', 'analyse-concurrentielle'],
  ecommerce: ['sav-auto', 'paniers-abandonnes', 'fiches-produits-seo', 'reporting-analytics', 'reputation-google', 'briefing-matinal', 'email-marketing', 'analyse-concurrentielle'],
  coach: ['content-linkedin', 'programme-formation', 'rdv-planning', 'relances-clients', 'briefing-matinal', 'email-marketing'],
  consultant: ['content-linkedin', 'programme-formation', 'documents-juridiques', 'relances-clients', 'briefing-matinal', 'email-marketing'],
  restaurant: ['social-media-food', 'reputation-google', 'relances-clients', 'briefing-matinal', 'email-marketing'],
  liberal: ['documents-juridiques', 'relances-clients', 'veille-reglementaire', 'rdv-planning', 'briefing-matinal', 'email-marketing'],
  immo: ['documents-juridiques', 'relances-clients', 'reputation-google', 'rdv-planning', 'briefing-matinal', 'email-marketing'],
  particulier: ['briefing-matinal', 'reputation-google'],
  admin: ['product-improvement', 'intelligence-gatherer', 'reporting-analytics'],
};

// ─── Index par tag ───
export const AGENTS_BY_TAG: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const agent of AGENTS_CATALOG) {
    for (const tag of agent.tags) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(agent.id);
    }
  }
  return map;
})();

// ─── Functions ───

/**
 * Get agent by ID
 */
export function getAgentById(id: string) {
  return AGENTS_CATALOG.find(a => a.id === id);
}

/**
 * Get agents relevant to a profession and goals
 */
export function getAgentsForProfile(
  profession: string,
  goals: string[] = [],
  limit = 5,
) {
  const profileKey = profession.toLowerCase().replace(/[éè]/g, 'e').replace(/[àâ]/g, 'a');
  const profileAgentIds = AGENTS_BY_PROFILE[profileKey] || AGENTS_BY_PROFILE['pme'] || [];

  // Score each agent
  const scored = AGENTS_CATALOG
    .filter(a => a.id !== 'product-improvement') // admin only
    .map(agent => {
      let score = 0;

      // Profile match
      if (profileAgentIds.includes(agent.id)) score += 10;
      if (agent.profils_cibles.includes(profileKey)) score += 8;

      // Goal match (check if any goal keyword appears in agent tags/description)
      for (const goal of goals) {
        const goalLower = goal.toLowerCase();
        if (agent.tags.some(t => goalLower.includes(t) || t.includes(goalLower))) score += 5;
        if (agent.description.toLowerCase().includes(goalLower)) score += 3;
      }

      // Boost universals
      if (agent.id === 'briefing-matinal') score += 2;
      if (agent.id === 'reputation-google') score += 1;

      return { agent, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => s.agent);
}

/**
 * Get recommended agents based on full user profile
 */
export function getRecommendedAgents(userProfile: UserProfile) {
  const { profession, goals, ai_level, team_size, has_website, has_gmb } = userProfile;

  const base = getAgentsForProfile(profession, goals, 10);

  // Adjust based on ai_level
  const filtered = base.filter(agent => {
    // Beginners: only haiku (simple) agents
    if (ai_level === 'debutant' && agent.model === 'claude-opus-4-6') return false;
    // Exclude formation-interne if solo
    if (agent.id === 'formation-interne' && (!team_size || team_size <= 1)) return false;
    return true;
  });

  // Add specific recommendations
  const result = [...filtered];

  // If no website → prioritize reputation
  if (!has_website && !result.find(a => a.id === 'reputation-google')) {
    const rep = getAgentById('reputation-google');
    if (rep) result.unshift(rep);
  }

  // If has GMB → boost reputation
  if (has_gmb) {
    const idx = result.findIndex(a => a.id === 'reputation-google');
    if (idx > 0) {
      const rep = result.splice(idx, 1)[0];
      if (rep) result.unshift(rep);
    }
  }

  return result.slice(0, 5);
}

// ─── Named re-exports ───
export {
  agent01SecretaireMedicale,
  agent02DevisPro,
  agent03ReputationAvis,
  agent04ContentLinkedin,
  agent05SavAuto,
  agent06Documents,
  agent07Relances,
  agent08Reporting,
  agent09SocialFood,
  agent10PaniersAbandonnes,
  agent11VeilleReglementaire,
  agent12BriefingMatinal,
  agent13IntelligenceGatherer,
  agent14AmeliorationProduit,
  agent15FormationInterne,
  agent16ProgrammeFormation,
  agent17RdvPlanning,
  agent18FichesProduits,
  agent19EmailMarketing,
  agent20AnalyseConcurrentielle,
};
