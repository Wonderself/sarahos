// Gamification engine - XP, levels, streaks, achievements
import { getAgentCount, getAllBonds } from './agent-bonding';

export interface GamificationState {
  level: number;
  xp: number;
  xpToNext: number;
  totalTokens: number;
  totalCost: number;
  totalMessages: number;
  totalMeetings: number;
  totalCustomizations: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  dailyStats: Record<string, { messages: number; tokens: number }>;
}

const XP_TABLE: Record<number, number> = {
  1: 100, 2: 250, 3: 500, 4: 1000, 5: 2000,
  6: 3500, 7: 5000, 8: 7500, 9: 10000, 10: 15000,
};

export function getDefaultState(): GamificationState {
  return {
    level: 1, xp: 0, xpToNext: 100,
    totalTokens: 0, totalCost: 0, totalMessages: 0, totalMeetings: 0, totalCustomizations: 0,
    streak: 0, lastActiveDate: '', achievements: [], dailyStats: {},
  };
}

export function loadGamification(): GamificationState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const stored = localStorage.getItem('fz_gamification');
    if (!stored) return getDefaultState();
    return { ...getDefaultState(), ...JSON.parse(stored) };
  } catch { return getDefaultState(); }
}

export function saveGamification(state: GamificationState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fz_gamification', JSON.stringify(state));
}

function checkLevelUp(state: GamificationState): GamificationState {
  while (state.xp >= state.xpToNext && state.level < 10) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = XP_TABLE[state.level] ?? 15000;
  }
  if (state.level >= 10) {
    state.xp = Math.min(state.xp, state.xpToNext);
  }
  return state;
}

function updateStreak(state: GamificationState): GamificationState {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (state.lastActiveDate === today) return state;
  if (state.lastActiveDate === yesterday) {
    state.streak += 1;
  } else if (state.lastActiveDate !== today) {
    state.streak = 1;
  }
  state.lastActiveDate = today;
  return state;
}

function updateDailyStats(state: GamificationState, tokens: number): GamificationState {
  const today = new Date().toISOString().split('T')[0];
  if (!state.dailyStats[today]) {
    state.dailyStats[today] = { messages: 0, tokens: 0 };
  }
  state.dailyStats[today].messages += 1;
  state.dailyStats[today].tokens += tokens;

  // Keep only last 30 days
  const keys = Object.keys(state.dailyStats).sort();
  if (keys.length > 30) {
    for (let i = 0; i < keys.length - 30; i++) {
      delete state.dailyStats[keys[i]];
    }
  }
  return state;
}

function checkAchievements(state: GamificationState): { state: GamificationState; newAchievements: string[] } {
  const newAchievements: string[] = [];
  const checks: [string, boolean][] = [
    ['first_message', state.totalMessages >= 1],
    ['10_messages', state.totalMessages >= 10],
    ['50_messages', state.totalMessages >= 50],
    ['100_messages', state.totalMessages >= 100],
    ['streak_3', state.streak >= 3],
    ['streak_7', state.streak >= 7],
    ['streak_30', state.streak >= 30],
    ['level_3', state.level >= 3],
    ['level_5', state.level >= 5],
    ['level_10', state.level >= 10],
    ['first_meeting', state.totalMeetings >= 1],
    ['5_meetings', state.totalMeetings >= 5],
    ['first_customize', state.totalCustomizations >= 1],
    // Bonding achievements
    ['bond_level_3', getAllBonds().some(b => b.relationshipLevel >= 3)],
    ['bond_level_5', getAllBonds().some(b => b.relationshipLevel >= 5)],
    ['agent_diversity', getAgentCount() >= 5],
    ['feedback_giver', getAllBonds().reduce((sum, b) => sum + b.feedbackCount, 0) >= 10],
  ];

  for (const [id, condition] of checks) {
    if (condition && !state.achievements.includes(id)) {
      state.achievements.push(id);
      newAchievements.push(id);
    }
  }

  return { state, newAchievements };
}

export interface XPEvent {
  type: 'message' | 'document' | 'meeting' | 'profile_complete' | 'recruit_agent' | 'customize_agent' | 'agent_bond_levelup' | 'agent_feedback' | 'game_played' | 'game_high_score';
  tokens?: number;
  cost?: number;
}

const XP_REWARDS: Record<string, number> = {
  message: 10,
  document: 25,
  meeting: 30,
  profile_complete: 50,
  recruit_agent: 20,
  customize_agent: 40,
  agent_bond_levelup: 30,
  agent_feedback: 5,
  game_played: 5,
  game_high_score: 15,
};

export function recordEvent(event: XPEvent): { state: GamificationState; leveledUp: boolean; newAchievements: string[] } {
  let state = loadGamification();
  const oldLevel = state.level;

  // Award XP
  state.xp += XP_REWARDS[event.type] ?? 10;

  // Update counters
  if (event.type === 'message') {
    state.totalMessages += 1;
    state.totalTokens += event.tokens ?? 0;
    state.totalCost += event.cost ?? 0;
    state = updateDailyStats(state, event.tokens ?? 0);
  } else if (event.type === 'meeting') {
    state.totalMeetings += 1;
  } else if (event.type === 'customize_agent') {
    state.totalCustomizations += 1;
  }

  // Update streak
  state = updateStreak(state);

  // Check level up
  state = checkLevelUp(state);

  // Check achievements
  const { state: updatedState, newAchievements } = checkAchievements(state);
  // Bonus XP for achievements
  for (const _ach of newAchievements) {
    updatedState.xp += 50;
  }
  const finalState = checkLevelUp(updatedState);

  saveGamification(finalState);

  return {
    state: finalState,
    leveledUp: finalState.level > oldLevel,
    newAchievements,
  };
}
