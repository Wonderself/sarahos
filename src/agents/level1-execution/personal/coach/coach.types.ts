export type CoachTaskType = 'goals' | 'checkin' | 'review' | 'celebrate';

export interface CoachGoal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  mesure_succes: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
}

export interface CoachMilestone {
  goalId: string;
  title: string;
  deadline: string;
  completed: boolean;
  completedAt?: string;
}

export interface CoachStreak {
  current: number;
  best: number;
  lastCheckinDate: string | null;
  totalCheckins: number;
  badge: 'none' | 'bronze' | 'argent' | 'or' | 'diamant';
}

export interface CoachCheckin {
  date: string;
  accomplishments: string[];
  streakDay: number;
  microActions: string[];
}

export interface CoachData {
  userId: string;
  goals: CoachGoal[];
  milestones: CoachMilestone[];
  streak: CoachStreak;
  checkins: CoachCheckin[];
  weeklyScores: number[];
}
