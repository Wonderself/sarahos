// =============================================================================
// Freenzy.io — Formations Barrel File
// All parcours imported here appear in the /learn page automatically
// =============================================================================

import {
  FORMATION_CATEGORIES,
  parcoursPremiersPas,
  parcoursPromptEngineering,
} from './formation-data';

import {
  parcoursContenuPro,
  parcoursSecuriteRgpd,
  parcoursMaitriserAssistants,
  comingSoonParcours,
} from './formation-data-more';

// ─── Niv1 parcours ──────────────────────────────────────────
import { parcoursArtisansIA } from './formation-niv1-artisans';
import { parcoursAvatarIA, parcoursChatIA } from './formation-niv1-avatar-chat';
import { parcoursEcommerceIA, parcoursSanteIA } from './formation-niv1-ecommerce-sante';
import { parcoursAnalytics, parcoursFilmIA } from './formation-niv1-analytics-film';
import { parcoursAPIWebhooks, parcoursBusinessPlan } from './formation-niv1-api-business';

// ─── Niv2 parcours ──────────────────────────────────────────
import { parcoursPromptNiv2 } from './formation-niv2-prompt';
import { parcoursContentNiv2 } from './formation-niv2-contenu';
import { parcoursDroitIANiv2 } from './formation-niv2-droit';
import { parcoursOrchestrationNiv2 } from './formation-niv2-orchestration';

// ─── Niv3 parcours ──────────────────────────────────────────
import { parcoursPromptMaster, parcoursContentDirector } from './formation-niv3-prompt-contenu';
import { parcoursComplianceOfficer, parcoursSystemsArchitect } from './formation-niv3-droit-orchestration';

// ─── New formations — Metier ────────────────────────────────
import { parcoursPlombierIA, parcoursElectricienIA, parcoursAvocatIA, parcoursNotaireIA, parcoursDentisteIA } from './formation-new-metier-1';
import { parcoursKineIA, parcoursArchitecteIA, parcoursPhotographeIA, parcoursGraphisteIA, parcoursDeveloppeurIA } from './formation-new-metier-2';
import { parcoursComptableIA, parcoursImmoIA, parcoursCoiffeurIA } from './formation-new-metier-3';
import { parcoursFleuristeIA, parcoursBoulangerIA, parcoursGaragisteIA } from './formation-new-metier-4';

// ─── New formations — Business ──────────────────────────────
import { parcoursOpticienIA, parcoursNegociation, parcoursManagement } from './formation-new-business-2';

// ─── New formations — Productivité ──────────────────────────
import { parcoursGTD, parcoursPomodoroAvance, parcoursNotionMastery } from './formation-new-productivite-1';

// ─── New formations — Créativité ────────────────────────────
import { parcoursEcritureCreative, parcoursStorytelling, parcoursPodcast } from './formation-new-creativite-1';

// ─── New formations — Quotidien ─────────────────────────────
import { parcoursCuisineIA, parcoursJardinageIA, parcoursBricolageIA } from './formation-new-quotidien-1';

// ─── New formations — Tech ─────────────────────────────────
import { parcoursPythonIA, parcoursAPIRest, parcoursBDD, parcoursDockerIA } from './formation-new-tech-1';

// ─── New formations — Quotidien ─────────────────────────────
import { parcoursYogaMeditation, parcoursSportIA, parcoursParentaliteIA, parcoursDevPerso, parcoursEcologieIA } from './formation-new-quotidien-2';

import { generateDiplomaPDF } from './diploma-generator';

// Re-export interfaces
export type {
  QuizQuestion,
  FormationLesson,
  FormationModule,
  FormationParcours,
  FormationCategory,
} from './formation-data';

export type { DiplomaParams } from './diploma-generator';

// Re-export categories
export { FORMATION_CATEGORIES };

// Re-export diploma generator
export { generateDiplomaPDF };

// ---------------------------------------------------------------------------
// All available parcours (with modules)
// ---------------------------------------------------------------------------

const availableParcours = [
  // Core (5)
  parcoursPremiersPas,
  parcoursPromptEngineering,
  parcoursContenuPro,
  parcoursSecuriteRgpd,
  parcoursMaitriserAssistants,
  // Niv1 (8)
  parcoursArtisansIA,
  parcoursAvatarIA,
  parcoursChatIA,
  parcoursEcommerceIA,
  parcoursSanteIA,
  parcoursAnalytics,
  parcoursFilmIA,
  parcoursAPIWebhooks,
  parcoursBusinessPlan,
  // Niv2 (4)
  parcoursPromptNiv2,
  parcoursContentNiv2,
  parcoursDroitIANiv2,
  parcoursOrchestrationNiv2,
  // Niv3 (4)
  parcoursPromptMaster,
  parcoursContentDirector,
  parcoursComplianceOfficer,
  parcoursSystemsArchitect,
  // New — Metier (10)
  parcoursPlombierIA,
  parcoursElectricienIA,
  parcoursAvocatIA,
  parcoursNotaireIA,
  parcoursDentisteIA,
  parcoursKineIA,
  parcoursArchitecteIA,
  parcoursPhotographeIA,
  parcoursGraphisteIA,
  parcoursDeveloppeurIA,
  // New — Tech (4)
  parcoursPythonIA,
  parcoursAPIRest,
  parcoursBDD,
  parcoursDockerIA,
  // New — Quotidien (5)
  parcoursYogaMeditation,
  parcoursSportIA,
  parcoursParentaliteIA,
  parcoursDevPerso,
  parcoursEcologieIA,
  // New — Metier batch 3-4 (6)
  parcoursComptableIA,
  parcoursImmoIA,
  parcoursCoiffeurIA,
  parcoursFleuristeIA,
  parcoursBoulangerIA,
  parcoursGaragisteIA,
  // New — Business (3)
  parcoursOpticienIA,
  parcoursNegociation,
  parcoursManagement,
  // New — Productivité (3)
  parcoursGTD,
  parcoursPomodoroAvance,
  parcoursNotionMastery,
  // New — Créativité (3)
  parcoursEcritureCreative,
  parcoursStorytelling,
  parcoursPodcast,
  // New — Quotidien batch 1 (3)
  parcoursCuisineIA,
  parcoursJardinageIA,
  parcoursBricolageIA,
];

// ---------------------------------------------------------------------------
// Combined array: available + coming soon
// ---------------------------------------------------------------------------

export const ALL_PARCOURS = [...availableParcours, ...comingSoonParcours];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getParcoursById(id: string) {
  return ALL_PARCOURS.find((p) => p.id === id);
}

export function getParcoursByCategory(catId: string) {
  return ALL_PARCOURS.filter((p) => p.category === catId);
}

export function getAvailableParcours() {
  return ALL_PARCOURS.filter((p) => p.available);
}

export function getComingSoonParcours() {
  return ALL_PARCOURS.filter((p) => p.comingSoon);
}

// ---------------------------------------------------------------------------
// Level system
// ---------------------------------------------------------------------------

interface LevelInfo {
  level: number;
  label: string;
  emoji: string;
  nextLevelXP: number;
  progress: number;
}

const LEVELS: { min: number; label: string; emoji: string }[] = [
  { min: 0, label: 'Débutant', emoji: '🌱' },
  { min: 200, label: 'Curieux', emoji: '🔍' },
  { min: 500, label: 'Intermédiaire', emoji: '📚' },
  { min: 1000, label: 'Avancé', emoji: '🚀' },
  { min: 2000, label: 'Expert', emoji: '⭐' },
  { min: 5000, label: 'Maître', emoji: '👑' },
];

export function calculateLevel(totalXP: number): LevelInfo {
  let currentIndex = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].min) {
      currentIndex = i;
      break;
    }
  }

  const current = LEVELS[currentIndex];
  const next = LEVELS[currentIndex + 1];

  if (!next) {
    // Max level
    return {
      level: currentIndex + 1,
      label: current.label,
      emoji: current.emoji,
      nextLevelXP: current.min,
      progress: 100,
    };
  }

  const range = next.min - current.min;
  const earned = totalXP - current.min;
  const progress = Math.min(100, Math.round((earned / range) * 100));

  return {
    level: currentIndex + 1,
    label: current.label,
    emoji: current.emoji,
    nextLevelXP: next.min,
    progress,
  };
}
