export type DeconnexionTaskType = 'challenge' | 'activities' | 'mood' | 'progress';

export type ChallengeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DeconnexionChallenge {
  id: string;
  nom: string;
  niveau: ChallengeLevel;
  duree: string;
  regles: string[];
  tips: string[];
  activites_suggerees: string[];
  completed: boolean;
  completedAt?: string;
  startedAt?: string;
}

export interface OfflineActivity {
  nom: string;
  description: string;
  duree_estimee: string;
  materiel_necessaire: string[];
  niveau_energie_requis: 'low' | 'medium' | 'high';
  categorie: string;
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  type: 'before_disconnect' | 'after_disconnect' | 'general';
  mood: number;       // 1-10
  stress: number;     // 1-10
  sleep: number;      // 1-10
  notes: string;
  challengeId?: string;
}

export interface MoodComparison {
  before: { mood: number; stress: number; sleep: number };
  after: { mood: number; stress: number; sleep: number };
  delta: { mood: number; stress: number; sleep: number };
}

export interface DeconnexionBadge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface DeconnexionData {
  userId: string;
  challenges: DeconnexionChallenge[];
  moodEntries: MoodEntry[];
  badges: DeconnexionBadge[];
  totalTimeOfflineMinutes: number;
  currentLevel: ChallengeLevel;
}
