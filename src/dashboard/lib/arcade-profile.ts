// ═══════════════════════════════════════════════════
//   FREENZY.IO — Arcade Points System
//   100% gratuit, pure gamification d'engagement
// ═══════════════════════════════════════════════════

export interface ArcadeProfile {
  totalPoints: number;
  weeklyPoints: number;
  weekStartDate: string;
  level: number;
  title: string;
  streak: number;
  bestStreak: number;
  lastPlayedDate: string;
  badges: string[];
  unlockedColors: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  secret?: boolean;
}

export interface ArcadeLeaderboardEntry {
  name: string;
  points: number;
  level: number;
  title: string;
  badges: string[];
}

// ─── Storage keys
const PROFILE_KEY = 'fz_arcade_profile';
const LEADERBOARD_KEY = 'fz_arcade_leaderboard';
const PENDING_BADGES_KEY = 'fz_arcade_pending_badges';

// ─── Level thresholds
const LEVEL_THRESHOLDS: { maxLevel: number; minPoints: number; maxPoints: number; title: string }[] = [
  { maxLevel: 5, minPoints: 0, maxPoints: 500, title: 'Débutant' },
  { maxLevel: 10, minPoints: 501, maxPoints: 1500, title: 'Joueur' },
  { maxLevel: 15, minPoints: 1501, maxPoints: 3500, title: 'Habitué' },
  { maxLevel: 20, minPoints: 3501, maxPoints: 7000, title: 'Expert' },
  { maxLevel: 30, minPoints: 7001, maxPoints: 15000, title: 'Maître' },
  { maxLevel: 40, minPoints: 15001, maxPoints: 30000, title: 'Champion' },
  { maxLevel: 49, minPoints: 30001, maxPoints: 50000, title: 'Légende' },
  { maxLevel: 50, minPoints: 50001, maxPoints: Infinity, title: 'Immortel' },
];

// ─── Badge definitions
const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first_game', name: 'Premier Pas', description: 'Première partie jouée', icon: 'emoji_events', condition: 'Jouer une partie' },
  { id: 'perfect_memory', name: "Mémoire d'éléphant", description: 'Memory sans erreur', icon: 'psychology', condition: 'Terminer Memory sans erreur' },
  { id: 'speed_demon', name: 'Doigts de fée', description: 'Typing > 60 WPM', icon: 'speed', condition: 'Dépasser 60 WPM en Dactylo' },
  { id: 'puzzle_master', name: 'Maître du puzzle', description: 'Sudoku < 5 min', icon: 'extension', condition: 'Terminer un Sudoku en moins de 5 minutes' },
  { id: 'word_genius', name: 'Génie des mots', description: 'Wordle en 2 essais ou moins', icon: 'auto_stories', condition: 'Trouver le mot en 2 essais max' },
  { id: 'snake_50', name: 'Charmeur de serpent', description: 'Snake > 50 points', icon: 'pest_control', condition: 'Dépasser 50 points au Snake' },
  { id: 'tetris_master', name: 'Architecte', description: 'Tetris > 5000 points', icon: 'view_in_ar', condition: 'Dépasser 5000 points au Tetris' },
  { id: 'quiz_perfect', name: 'Cerveau', description: 'Quiz 100%', icon: 'neurology', condition: 'Score parfait au Quiz' },
  { id: 'mine_expert', name: 'Démineur', description: 'Démineur sans erreur', icon: 'bomb', condition: 'Terminer le Démineur sans exploser' },
  { id: 'daily_7', name: 'Assidu', description: '7 jours de streak', icon: 'local_fire_department', condition: 'Maintenir une série de 7 jours' },
  { id: 'daily_30', name: 'Légende quotidienne', description: '30 jours de streak', icon: 'whatshot', condition: 'Maintenir une série de 30 jours' },
  { id: 'all_rounder', name: 'Touche-à-tout', description: 'Joué aux 10 jeux', icon: 'sports_esports', condition: 'Jouer à chacun des 10 jeux' },
  { id: 'points_1000', name: 'Millionnaire', description: '1000 points totaux', icon: 'paid', condition: 'Accumuler 1000 points Arcade' },
  { id: 'points_10000', name: 'Magnat', description: '10000 points', icon: 'diamond', condition: 'Accumuler 10000 points Arcade' },
  { id: 'level_10', name: 'Rang bronze', description: 'Niveau 10 atteint', icon: 'military_tech', condition: 'Atteindre le niveau 10' },
  { id: 'level_25', name: 'Rang or', description: 'Niveau 25 atteint', icon: 'workspace_premium', condition: 'Atteindre le niveau 25' },
  { id: 'level_50', name: 'Immortel', description: 'Niveau max atteint', icon: 'auto_awesome', condition: 'Atteindre le niveau 50' },
  { id: 'high_2048', name: '2048 !', description: 'Atteindre la tuile 2048', icon: 'grid_view', condition: 'Former la tuile 2048' },
  { id: 'speed_sudoku', name: 'Éclair', description: 'Sudoku < 3 min', icon: 'bolt', condition: 'Terminer un Sudoku en moins de 3 minutes', secret: true },
  { id: 'comeback', name: 'Comeback', description: 'Rejouer après 7 jours d\'absence', icon: 'refresh', condition: 'Revenir après 7 jours sans jouer', secret: true },
];

// ─── Profile border colors by level
const BORDER_COLORS: { level: number; color: string }[] = [
  { level: 50, color: 'linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b, #22c55e, #3b82f6)' },
  { level: 40, color: '#22c55e' },
  { level: 30, color: '#f59e0b' },
  { level: 20, color: '#8b5cf6' },
  { level: 10, color: '#3b82f6' },
];

// ─── Helpers

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function defaultProfile(): ArcadeProfile {
  return {
    totalPoints: 0,
    weeklyPoints: 0,
    weekStartDate: getMonday(new Date()),
    level: 1,
    title: 'Débutant',
    streak: 0,
    bestStreak: 0,
    lastPlayedDate: '',
    badges: [],
    unlockedColors: [],
  };
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Exported functions

export function getArcadeProfile(): ArcadeProfile {
  const p = safeGet<ArcadeProfile>(PROFILE_KEY, defaultProfile());
  // Ensure all fields exist (migration safety)
  return { ...defaultProfile(), ...p };
}

function saveProfile(p: ArcadeProfile): void {
  safeSet(PROFILE_KEY, p);
}

export function getLevelInfo(points: number): { level: number; title: string; nextLevelPoints: number; progress: number } {
  let level = 1;
  let title = 'Débutant';

  for (const tier of LEVEL_THRESHOLDS) {
    if (points >= tier.minPoints) {
      const range = tier.maxPoints - tier.minPoints;
      const levelsInTier = tier.maxLevel - (tier === LEVEL_THRESHOLDS[0] ? 0 : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(tier) - 1].maxLevel);
      const pointsInTier = points - tier.minPoints;
      const pointsPerLevel = range / levelsInTier;
      const levelsEarned = Math.min(Math.floor(pointsInTier / pointsPerLevel), levelsInTier);
      const prevMax = tier === LEVEL_THRESHOLDS[0] ? 0 : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(tier) - 1].maxLevel;
      level = prevMax + levelsEarned + (tier === LEVEL_THRESHOLDS[0] ? 1 : 1);
      title = tier.title;
      if (level > 50) level = 50;
    }
  }

  // Calculate next level points
  let nextLevelPoints = 0;
  let progress = 0;
  if (level >= 50) {
    nextLevelPoints = 0;
    progress = 1;
  } else {
    // Find current tier
    let cumPoints = 0;
    for (const tier of LEVEL_THRESHOLDS) {
      const prevMax = tier === LEVEL_THRESHOLDS[0] ? 0 : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(tier) - 1].maxLevel;
      const levelsInTier = tier.maxLevel - prevMax;
      const range = tier.maxPoints === Infinity ? 100000 : tier.maxPoints - tier.minPoints;
      const pointsPerLevel = range / levelsInTier;

      if (level <= tier.maxLevel) {
        const levelInTier = level - prevMax;
        const currentLevelStart = tier.minPoints + (levelInTier - 1) * pointsPerLevel;
        const currentLevelEnd = tier.minPoints + levelInTier * pointsPerLevel;
        nextLevelPoints = Math.ceil(currentLevelEnd);
        const earned = points - currentLevelStart;
        progress = Math.max(0, Math.min(1, earned / pointsPerLevel));
        break;
      }
      cumPoints = tier.maxPoints;
    }
  }

  return { level, title, nextLevelPoints, progress };
}

export function awardPoints(amount: number, reason: string): { newTotal: number; leveledUp: boolean; newLevel: number; newTitle: string } {
  const p = getArcadeProfile();
  const oldLevel = p.level;

  p.totalPoints += amount;
  p.weeklyPoints += amount;

  const info = getLevelInfo(p.totalPoints);
  p.level = info.level;
  p.title = info.title;

  // Update unlocked colors
  for (const bc of BORDER_COLORS) {
    if (p.level >= bc.level && !p.unlockedColors.includes(bc.color)) {
      p.unlockedColors.push(bc.color);
    }
  }

  saveProfile(p);

  // Check level-based badges
  if (p.totalPoints >= 1000) checkAndAwardBadge('points_1000');
  if (p.totalPoints >= 10000) checkAndAwardBadge('points_10000');
  if (p.level >= 10) checkAndAwardBadge('level_10');
  if (p.level >= 25) checkAndAwardBadge('level_25');
  if (p.level >= 50) checkAndAwardBadge('level_50');

  return {
    newTotal: p.totalPoints,
    leveledUp: info.level > oldLevel,
    newLevel: info.level,
    newTitle: info.title,
  };
}

export function checkAndAwardBadge(badgeId: string): { awarded: boolean; badge: Badge | null } {
  const p = getArcadeProfile();
  const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!badge) return { awarded: false, badge: null };
  if (p.badges.includes(badgeId)) return { awarded: false, badge };

  p.badges.push(badgeId);
  saveProfile(p);

  // Add to pending badges for popup
  const pending = safeGet<string[]>(PENDING_BADGES_KEY, []);
  pending.push(badgeId);
  safeSet(PENDING_BADGES_KEY, pending);

  return { awarded: true, badge };
}

export function updateStreak(): { streak: number; bonusPoints: number } {
  const p = getArcadeProfile();
  const today = new Date().toISOString().split('T')[0];

  if (p.lastPlayedDate === today) {
    return { streak: p.streak, bonusPoints: 0 };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let bonusPoints = 0;

  // Check for comeback badge (7+ days absence)
  if (p.lastPlayedDate) {
    const lastDate = new Date(p.lastPlayedDate);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    if (daysSince >= 7) {
      checkAndAwardBadge('comeback');
    }
  }

  if (p.lastPlayedDate === yesterday) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }

  p.lastPlayedDate = today;
  if (p.streak > p.bestStreak) p.bestStreak = p.streak;

  // Streak bonuses
  if (p.streak === 7) {
    bonusPoints = 100;
    awardPoints(100, 'streak_7');
    checkAndAwardBadge('daily_7');
  }
  if (p.streak === 30) {
    bonusPoints = 500;
    awardPoints(500, 'streak_30');
    checkAndAwardBadge('daily_30');
  }

  saveProfile(p);
  return { streak: p.streak, bonusPoints };
}

export function getLeaderboard(): ArcadeLeaderboardEntry[] {
  return safeGet<ArcadeLeaderboardEntry[]>(LEADERBOARD_KEY, []);
}

export function addToLeaderboard(name: string, points: number, level: number, title: string, badges: string[]): void {
  const lb = getLeaderboard();
  const existing = lb.findIndex(e => e.name === name);
  if (existing >= 0) {
    lb[existing] = { name, points, level, title, badges };
  } else {
    lb.push({ name, points, level, title, badges });
  }
  lb.sort((a, b) => b.points - a.points);
  const trimmed = lb.slice(0, 50);
  safeSet(LEADERBOARD_KEY, trimmed);
}

export function getBadgeDefinitions(): Badge[] {
  return [...BADGE_DEFINITIONS];
}

export function getProfileBorderColor(level: number): string | null {
  for (const bc of BORDER_COLORS) {
    if (level >= bc.level) return bc.color;
  }
  return null;
}

export function checkWeeklyReset(): void {
  const p = getArcadeProfile();
  const currentMonday = getMonday(new Date());
  if (p.weekStartDate !== currentMonday) {
    p.weeklyPoints = 0;
    p.weekStartDate = currentMonday;
    saveProfile(p);
  }
}

export function resetProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LEADERBOARD_KEY);
  localStorage.removeItem(PENDING_BADGES_KEY);
}

export function getPendingBadges(): Badge[] {
  const ids = safeGet<string[]>(PENDING_BADGES_KEY, []);
  return ids.map(id => BADGE_DEFINITIONS.find(b => b.id === id)).filter(Boolean) as Badge[];
}

export function clearPendingBadge(badgeId: string): void {
  const ids = safeGet<string[]>(PENDING_BADGES_KEY, []);
  const filtered = ids.filter(id => id !== badgeId);
  safeSet(PENDING_BADGES_KEY, filtered);
}

// ─── Session tracking for points earned this game
let sessionPoints = 0;
let sessionBadges: string[] = [];

export function resetSessionTracking(): void {
  sessionPoints = 0;
  sessionBadges = [];
}

export function addSessionPoints(amount: number): void {
  sessionPoints += amount;
}

export function addSessionBadge(badgeId: string): void {
  sessionBadges.push(badgeId);
}

export function getSessionPoints(): number {
  return sessionPoints;
}

export function getSessionBadges(): string[] {
  return [...sessionBadges];
}
