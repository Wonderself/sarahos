// ===============================================================
// Ecrivain Agent — Type Definitions ("Mon Ecrivain")
// Persona: Charlotte — Assistante d'ecriture creative
// ===============================================================

// -- Types de taches --

export type EcrivainTaskType = 'outline' | 'write' | 'review' | 'characters' | 'progress';

// -- Types de projet --

export type ProjectType = 'roman' | 'nouvelle' | 'scenario' | 'essai' | 'poesie' | 'blog' | 'autre';
export type ProjectStatus = 'draft' | 'in_progress' | 'revision' | 'completed' | 'abandoned';
export type ChapterStatus = 'draft' | 'in_progress' | 'revised' | 'completed';

// -- Personnage --

export interface WritingCharacter {
  name: string;
  role: 'protagonist' | 'antagonist' | 'secondary' | 'background';
  description: string;
  arc: string;
  traits: string[];
}

// -- Projet d'ecriture --

export interface WritingProject {
  id: string;
  userId: string;
  title: string;
  genre: string | null;
  projectType: ProjectType;
  synopsis: string | null;
  targetWordCount: number;
  currentWordCount: number;
  status: ProjectStatus;
  characters: WritingCharacter[];
  styleNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -- Chapitre --

export interface WritingChapter {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string | null;
  content: string | null;
  wordCount: number;
  status: ChapterStatus;
  aiNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -- Statistiques de progression --

export interface ProjectProgress {
  projectId: string;
  title: string;
  targetWordCount: number;
  currentWordCount: number;
  percentComplete: number;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  draftChapters: number;
  averageWordsPerChapter: number;
  estimatedChaptersRemaining: number;
}

// -- Paliers de mots (milestones) --

export const WORD_COUNT_MILESTONES = [
  1000,
  5000,
  10000,
  20000,
  30000,
  40000,
  50000,
  60000,
  70000,
  80000,
  90000,
  100000,
];

// -- Payloads de taches --

export interface OutlinePayload {
  type: 'outline';
  userId: string;
  projectId?: string;
  title?: string;
  genre?: string;
  projectType?: ProjectType;
  synopsis?: string;
  chapterCount?: number;
}

export interface WritePayload {
  type: 'write';
  userId: string;
  projectId: string;
  chapterId?: string;
  chapterNumber?: number;
  instructions?: string;
  continuePrevious?: boolean;
}

export interface ReviewPayload {
  type: 'review';
  userId: string;
  projectId: string;
  chapterId?: string;
  focusAreas?: ('style' | 'coherence' | 'dialogue' | 'pacing' | 'characters')[];
}

export interface CharactersPayload {
  type: 'characters';
  userId: string;
  projectId: string;
  action: 'list' | 'create' | 'develop' | 'relationships';
  characterData?: Partial<WritingCharacter>;
}

export interface ProgressPayload {
  type: 'progress';
  userId: string;
  projectId: string;
  addWords?: number;
}
