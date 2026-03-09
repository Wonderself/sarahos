// ═══════════════════════════════════════════════════
//   FREENZY.IO — Agent Favorites
//   Pin up to 5 agents for quick access
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_favorite_agents';
const MAX_FAVORITES = 5;

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

export function addFavorite(agentId: string): boolean {
  const favs = getFavorites();
  if (favs.includes(agentId)) return true;
  if (favs.length >= MAX_FAVORITES) return false;
  favs.push(agentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return true;
}

export function removeFavorite(agentId: string): void {
  const favs = getFavorites().filter(id => id !== agentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function toggleFavorite(agentId: string): boolean {
  if (isFavorite(agentId)) {
    removeFavorite(agentId);
    return false;
  }
  return addFavorite(agentId);
}

export function isFavorite(agentId: string): boolean {
  return getFavorites().includes(agentId);
}

export function reorderFavorites(newOrder: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder.slice(0, MAX_FAVORITES)));
}
