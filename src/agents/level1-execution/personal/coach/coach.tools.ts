import type { CoachStreak, CoachGoal } from './coach.types';

/**
 * Badge thresholds for the streak system
 */
const BADGE_THRESHOLDS = {
  diamant: 365,
  or: 100,
  argent: 30,
  bronze: 7,
  none: 0,
} as const;

/**
 * Calculate streak based on last check-in date
 * If the user checked in yesterday, the streak continues.
 * If the user checked in today already, streak stays the same.
 * Otherwise, streak resets to 0 (but best is preserved).
 */
export function calculateStreak(
  streak: CoachStreak,
  checkinDate: string
): CoachStreak {
  const today = new Date(checkinDate);
  today.setHours(0, 0, 0, 0);

  const newStreak = { ...streak };

  if (!streak.lastCheckinDate) {
    // First ever check-in
    newStreak.current = 1;
    newStreak.totalCheckins = (streak.totalCheckins ?? 0) + 1;
    newStreak.lastCheckinDate = checkinDate;
    newStreak.best = Math.max(streak.best ?? 0, 1);
    newStreak.badge = getBadge(1);
    return newStreak;
  }

  const lastDate = new Date(streak.lastCheckinDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already checked in today — no change
    return newStreak;
  } else if (diffDays === 1) {
    // Consecutive day — streak continues
    newStreak.current = streak.current + 1;
  } else {
    // Missed day(s) — streak resets
    newStreak.current = 1;
  }

  newStreak.totalCheckins = (streak.totalCheckins ?? 0) + 1;
  newStreak.lastCheckinDate = checkinDate;
  newStreak.best = Math.max(streak.best ?? 0, newStreak.current);
  newStreak.badge = getBadge(newStreak.current);

  return newStreak;
}

/**
 * Get badge name based on streak count
 */
function getBadge(streak: number): CoachStreak['badge'] {
  if (streak >= BADGE_THRESHOLDS.diamant) return 'diamant';
  if (streak >= BADGE_THRESHOLDS.or) return 'or';
  if (streak >= BADGE_THRESHOLDS.argent) return 'argent';
  if (streak >= BADGE_THRESHOLDS.bronze) return 'bronze';
  return 'none';
}

/**
 * Format goal progress for display / LLM context
 */
export function formatGoalProgress(goals: CoachGoal[]): string {
  if (goals.length === 0) return 'Aucun objectif defini.';

  const lines: string[] = [];
  lines.push(`=== OBJECTIFS (${goals.length}) ===`);

  for (const goal of goals) {
    const statusIcon = goal.status === 'completed' ? '[OK]'
      : goal.status === 'abandoned' ? '[X]'
      : `[${goal.progress}%]`;

    lines.push(`${statusIcon} ${goal.title}`);
    lines.push(`    ${goal.description}`);
    lines.push(`    Deadline: ${goal.deadline} | Mesure: ${goal.mesure_succes}`);
    if (goal.status === 'active') {
      const progressBar = generateProgressBar(goal.progress);
      lines.push(`    Progres: ${progressBar} ${goal.progress}%`);
    }
    lines.push('');
  }

  const active = goals.filter((g) => g.status === 'active').length;
  const completed = goals.filter((g) => g.status === 'completed').length;
  lines.push(`Resume: ${active} actif(s), ${completed} termine(s), ${goals.length} total`);

  return lines.join('\n');
}

/**
 * Generate a simple text progress bar
 */
function generateProgressBar(progress: number): string {
  const filled = Math.round(progress / 10);
  const empty = 10 - filled;
  return '[' + '#'.repeat(filled) + '-'.repeat(empty) + ']';
}

/**
 * Generate a celebration message based on achievement type
 */
export function generateCelebration(streakDays: number, achievement?: string): string {
  if (streakDays >= 365) {
    return 'UN AN COMPLET ! Tu es une legende vivante de la constance !';
  }
  if (streakDays >= 100) {
    return '100 JOURS ! Triple chiffre ! Ta discipline est exemplaire !';
  }
  if (streakDays >= 30) {
    return '30 JOURS ! Un mois complet de regularite, chapeau !';
  }
  if (streakDays >= 7) {
    return '7 JOURS ! Premiere semaine complete, le plus dur est fait !';
  }
  if (achievement) {
    return `Bravo pour cet accomplissement : ${achievement} !`;
  }
  return 'Continue comme ca, chaque jour compte !';
}

/**
 * Milestone celebration messages for streak badges
 */
export const MILESTONE_MESSAGES: Record<string, string> = {
  bronze: 'Badge Bronze debloque ! 7 jours de suite — tu as pris le rythme !',
  argent: 'Badge Argent debloque ! 30 jours de suite — un mois de discipline, respect !',
  or: 'Badge Or debloque ! 100 jours de suite — tu fais partie de l\'elite !',
  diamant: 'Badge Diamant debloque ! 365 jours de suite — une annee entiere, legendaire !',
  first_checkin: 'Premier check-in ! Le voyage de mille lieues commence par un premier pas.',
  streak_lost: 'Le streak est casse, mais ton record est preserve. On recommence plus fort !',
  goal_completed: 'Objectif atteint ! Prends un moment pour apprecier ce que tu as accompli.',
  week_perfect: 'Semaine parfaite ! 7/7 check-ins. Tu es sur une lancee incroyable !',
};
