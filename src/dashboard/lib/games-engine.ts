// ═══════════════════════════════════════════════════
//   FREENZY.IO — Games Engine
//   Scoring, credits, leaderboard management
// ═══════════════════════════════════════════════════

export interface GameConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
  creditsPerPlay: number;
  highScoreBonus: number;
  color: string;
  category: 'classic' | 'puzzle' | 'speed' | 'daily';
}

export interface GameScore {
  bestScore: number;
  gamesPlayed: number;
  totalCreditsEarned: number;
  lastPlayed: string;
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
}

export interface DailyChallenge {
  lastDate: string;
  completed: boolean;
  streak: number;
  gameSlug: string;
}

// ─── Game catalog
export const GAME_CATALOG: GameConfig[] = [
  { slug: 'wordle', name: 'Motus', icon: 'spellcheck', description: 'Devinez le mot de 6 lettres en 6 essais', creditsPerPlay: 2, highScoreBonus: 5, color: '#22c55e', category: 'puzzle' },
  { slug: 'sudoku', name: 'Sudoku', icon: 'grid_on', description: 'Remplissez la grille 9×9 sans répétition', creditsPerPlay: 3, highScoreBonus: 8, color: '#3b82f6', category: 'puzzle' },
  { slug: 'snake', name: 'Snake', icon: 'route', description: 'Guidez le serpent et mangez les pommes', creditsPerPlay: 1, highScoreBonus: 5, color: '#16a34a', category: 'classic' },
  { slug: 'tetris', name: 'Tetris', icon: 'view_comfy_alt', description: 'Empilez les pièces et faites des lignes', creditsPerPlay: 2, highScoreBonus: 10, color: '#8b5cf6', category: 'classic' },
  { slug: 'quiz', name: 'Quiz IA', icon: 'quiz', description: '30 questions sur l\'IA et la tech', creditsPerPlay: 2, highScoreBonus: 5, color: '#f59e0b', category: 'puzzle' },
  { slug: 'memory', name: 'Memory', icon: 'psychology', description: 'Retrouvez les paires de cartes identiques', creditsPerPlay: 1, highScoreBonus: 3, color: '#ec4899', category: 'classic' },
  { slug: 'game2048', name: '2048', icon: 'calculate', description: 'Combinez les tuiles pour atteindre 2048', creditsPerPlay: 2, highScoreBonus: 8, color: '#f97316', category: 'puzzle' },
  { slug: 'minesweeper', name: 'Démineur', icon: 'crisis_alert', description: 'Trouvez toutes les mines sans exploser', creditsPerPlay: 2, highScoreBonus: 5, color: '#64748b', category: 'puzzle' },
  { slug: 'typing', name: 'Dactylo', icon: 'keyboard', description: 'Testez votre vitesse de frappe en français', creditsPerPlay: 1, highScoreBonus: 3, color: '#06b6d4', category: 'speed' },
  { slug: 'daily', name: 'Défi du jour', icon: 'today', description: 'Un nouveau défi chaque jour — ne brisez pas la série !', creditsPerPlay: 3, highScoreBonus: 5, color: '#ef4444', category: 'daily' },
];

// ─── Storage
const SCORES_KEY = 'fz_game_scores';
const LEADERBOARD_KEY = 'fz_game_leaderboard';
const DAILY_KEY = 'fz_daily_challenge';

export function loadScores(): Record<string, GameScore> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) ?? '{}');
  } catch { return {}; }
}

function saveScores(scores: Record<string, GameScore>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function loadLeaderboard(): Record<string, LeaderboardEntry[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? '{}');
  } catch { return {}; }
}

function saveLeaderboard(lb: Record<string, LeaderboardEntry[]>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
}

export function loadDaily(): DailyChallenge {
  if (typeof window === 'undefined') return { lastDate: '', completed: false, streak: 0, gameSlug: '' };
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY) ?? '{}') as DailyChallenge;
  } catch { return { lastDate: '', completed: false, streak: 0, gameSlug: '' }; }
}

function saveDaily(d: DailyChallenge) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DAILY_KEY, JSON.stringify(d));
}

// ─── Core functions

export function recordGameScore(slug: string, score: number, playerName: string = 'Joueur'): {
  credits: number;
  isNewBest: boolean;
  totalGames: number;
} {
  const scores = loadScores();
  const game = GAME_CATALOG.find(g => g.slug === slug);
  if (!game) return { credits: 0, isNewBest: false, totalGames: 0 };

  const prev = scores[slug] ?? { bestScore: 0, gamesPlayed: 0, totalCreditsEarned: 0, lastPlayed: '' };
  const isNewBest = score > prev.bestScore;
  let credits = game.creditsPerPlay;
  if (isNewBest && prev.gamesPlayed > 0) credits += game.highScoreBonus;

  scores[slug] = {
    bestScore: Math.max(prev.bestScore, score),
    gamesPlayed: prev.gamesPlayed + 1,
    totalCreditsEarned: prev.totalCreditsEarned + credits,
    lastPlayed: new Date().toISOString(),
  };
  saveScores(scores);

  // Update leaderboard (top 10)
  const lb = loadLeaderboard();
  if (!lb[slug]) lb[slug] = [];
  lb[slug].push({ playerName, score, date: new Date().toISOString() });
  lb[slug].sort((a, b) => b.score - a.score);
  lb[slug] = lb[slug].slice(0, 10);
  saveLeaderboard(lb);

  return { credits, isNewBest, totalGames: scores[slug].gamesPlayed };
}

export function completeDailyChallenge(): { streak: number; credits: number } {
  const daily = loadDaily();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (daily.lastDate === today) return { streak: daily.streak, credits: 0 };

  const newStreak = daily.lastDate === yesterday ? daily.streak + 1 : 1;
  const credits = 3 + (newStreak >= 7 ? 5 : 0);

  saveDaily({ lastDate: today, completed: true, streak: newStreak, gameSlug: getDailyGameSlug() });
  return { streak: newStreak, credits };
}

export function getDailyGameSlug(): string {
  const dayIndex = Math.floor(Date.now() / 86400000) % (GAME_CATALOG.length - 1); // Exclude daily itself
  const playableGames = GAME_CATALOG.filter(g => g.slug !== 'daily');
  return playableGames[dayIndex].slug;
}

export function getTotalGamesPlayed(): number {
  const scores = loadScores();
  return Object.values(scores).reduce((sum, s) => sum + s.gamesPlayed, 0);
}

export function getTotalCreditsFromGames(): number {
  const scores = loadScores();
  return Object.values(scores).reduce((sum, s) => sum + s.totalCreditsEarned, 0);
}
