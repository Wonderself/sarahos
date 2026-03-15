// =============================================================================
// Freenzy.io — Formations Barrel File
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
  parcoursPremiersPas,
  parcoursPromptEngineering,
  parcoursContenuPro,
  parcoursSecuriteRgpd,
  parcoursMaitriserAssistants,
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
