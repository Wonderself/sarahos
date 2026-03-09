// ═══════════════════════════════════════════════════
//   FREENZY.IO — User-Created Games (AI-generated)
//   Creation, storage, rating, community logic
// ═══════════════════════════════════════════════════

export interface GeneratedQuestion {
  question: string;
  choices: string[];
  answer: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
}

export interface UserGame {
  id: string;
  title: string;
  prompt: string;
  type: 'quiz' | 'enigma' | 'challenge';
  questions: GeneratedQuestion[];
  createdAt: string;
  published: boolean;
  authorName: string;
  authorId: string;
  ratings: number[];
  averageRating: number;
  playCount: number;
}

const USER_GAMES_KEY = 'fz_user_games';
const COMMUNITY_GAMES_KEY = 'fz_community_games';
const GAME_RATINGS_KEY = 'fz_game_ratings';

// ─── User's own games

export function loadUserGames(): UserGame[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USER_GAMES_KEY) ?? '[]');
  } catch { return []; }
}

export function saveUserGame(game: UserGame): void {
  const games = loadUserGames();
  const idx = games.findIndex(g => g.id === game.id);
  if (idx >= 0) games[idx] = game;
  else games.unshift(game);
  localStorage.setItem(USER_GAMES_KEY, JSON.stringify(games));
}

export function deleteUserGame(gameId: string): void {
  const games = loadUserGames().filter(g => g.id !== gameId);
  localStorage.setItem(USER_GAMES_KEY, JSON.stringify(games));
}

// ─── Community games (cached locally)

export function loadCommunityGames(): UserGame[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COMMUNITY_GAMES_KEY) ?? '[]');
  } catch { return []; }
}

export function saveCommunityGames(games: UserGame[]): void {
  localStorage.setItem(COMMUNITY_GAMES_KEY, JSON.stringify(games));
}

export function publishGame(gameId: string): boolean {
  const games = loadUserGames();
  const game = games.find(g => g.id === gameId);
  if (!game) return false;
  game.published = true;
  saveUserGame(game);

  // Add to community pool
  const community = loadCommunityGames();
  if (!community.find(g => g.id === gameId)) {
    community.unshift(game);
    saveCommunityGames(community);
  }
  return true;
}

// ─── Ratings

export function loadRatings(): Record<string, { rating: number; ratedAt: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(GAME_RATINGS_KEY) ?? '{}');
  } catch { return {}; }
}

export function rateGame(gameId: string, rating: number): void {
  // Validate rating bounds
  rating = Math.max(1, Math.min(5, Math.round(rating)));
  // Save user's rating
  const ratings = loadRatings();
  ratings[gameId] = { rating, ratedAt: new Date().toISOString() };
  localStorage.setItem(GAME_RATINGS_KEY, JSON.stringify(ratings));

  // Update community game average
  const community = loadCommunityGames();
  const game = community.find(g => g.id === gameId);
  if (game) {
    game.ratings.push(rating);
    game.averageRating = game.ratings.reduce((s, r) => s + r, 0) / game.ratings.length;
    saveCommunityGames(community);
  }
}

export function hasRated(gameId: string): boolean {
  return !!loadRatings()[gameId];
}

export function getRandomCommunityGame(): UserGame | null {
  const games = loadCommunityGames().filter(g => g.published && g.averageRating >= 3);
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}

// ─── AI prompt template

export function buildGamePrompt(userPrompt: string, type: 'quiz' | 'enigma' | 'challenge'): string {
  return `Tu es un créateur de jeux éducatifs. Génère un ${type === 'quiz' ? 'quiz' : type === 'enigma' ? 'jeu d\'énigmes' : 'défi'} basé sur cette demande :

"${userPrompt}"

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "title": "Titre du jeu",
  "questions": [
    {
      "question": "La question",
      "choices": ["A", "B", "C", "D"],
      "answer": "La bonne réponse (exactement un des choix)",
      "hint": "Un indice optionnel",
      "difficulty": 1
    }
  ]
}

Règles :
- Génère exactement 10 questions
- Difficulté : 1 (facile), 2 (moyen), 3 (difficile) — varie les niveaux
- 4 choix par question, une seule bonne réponse
- Tout en français
- Questions intéressantes et éducatives`;
}

export function generateGameId(): string {
  return `ug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
