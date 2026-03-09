// ═══════════════════════════════════════════════════
//   FREENZY.IO — Action History / Timeline
//   Records all user actions across the platform
// ═══════════════════════════════════════════════════

export type ActionCategory = 'message' | 'document' | 'meeting' | 'game' | 'reward' | 'referral' | 'login' | 'agent' | 'system';

export interface ActionEvent {
  id: string;
  type: ActionCategory;
  title: string;
  description?: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface TimelineFilter {
  categories?: ActionCategory[];
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
  search?: string;
}

const STORAGE_KEY = 'fz_action_history';
const MAX_EVENTS = 500;

export const ACTION_META: Record<ActionCategory, { icon: string; color: string; label: string }> = {
  message: { icon: 'chat_bubble', color: '#3b82f6', label: 'Message' },
  document: { icon: 'description', color: '#8b5cf6', label: 'Document' },
  meeting: { icon: 'groups', color: '#f59e0b', label: 'Réunion' },
  game: { icon: 'sports_esports', color: '#22c55e', label: 'Jeu' },
  reward: { icon: 'card_giftcard', color: '#ec4899', label: 'Récompense' },
  referral: { icon: 'person_add', color: '#f97316', label: 'Parrainage' },
  login: { icon: 'login', color: '#64748b', label: 'Connexion' },
  agent: { icon: 'smart_toy', color: '#06b6d4', label: 'Agent' },
  system: { icon: 'settings', color: '#94a3b8', label: 'Système' },
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadHistory(filter?: TimelineFilter): ActionEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    let events: ActionEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

    if (filter) {
      if (filter.categories?.length) {
        events = events.filter(e => filter.categories!.includes(e.type));
      }
      if (filter.dateFrom) {
        events = events.filter(e => e.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        events = events.filter(e => e.timestamp <= filter.dateTo!);
      }
      if (filter.agentId) {
        events = events.filter(e => e.agentId === filter.agentId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        events = events.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
      }
    }

    return events;
  } catch { return []; }
}

export function recordAction(event: Omit<ActionEvent, 'id' | 'timestamp'>): ActionEvent {
  if (typeof window === 'undefined') return { ...event, id: '', timestamp: '' };

  const fullEvent: ActionEvent = {
    ...event,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  try {
    const events: ActionEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    events.unshift(fullEvent);
    // FIFO: keep max 500
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch { /* silent */ }

  return fullEvent;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getHistoryStats(): { total: number; byCategory: Record<ActionCategory, number>; lastAction?: ActionEvent } {
  const events = loadHistory();
  const byCategory: Record<string, number> = {};
  for (const e of events) {
    byCategory[e.type] = (byCategory[e.type] ?? 0) + 1;
  }
  return {
    total: events.length,
    byCategory: byCategory as Record<ActionCategory, number>,
    lastAction: events[0],
  };
}
