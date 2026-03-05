// ─── Deep Discussions — Types ────────────────────────────────────────────────

export type DiscussionCategory =
  | 'philosophical' | 'religious' | 'cultural' | 'civilizational'
  | 'personal' | 'scientific' | 'economic' | 'geopolitical'
  | 'artistic' | 'ethical' | 'technological' | 'psychological'
  | 'sociological' | 'historical' | 'spiritual' | 'existential';

export const DISCUSSION_CATEGORIES: { id: DiscussionCategory; label: string; emoji: string }[] = [
  { id: 'philosophical', label: 'Philosophie', emoji: '🏛️' },
  { id: 'religious', label: 'Religion', emoji: '🕊️' },
  { id: 'cultural', label: 'Culture', emoji: '🎭' },
  { id: 'civilizational', label: 'Civilisation', emoji: '🌍' },
  { id: 'personal', label: 'Personnel', emoji: '🪞' },
  { id: 'scientific', label: 'Science', emoji: '🔬' },
  { id: 'economic', label: 'Économie', emoji: '📈' },
  { id: 'geopolitical', label: 'Géopolitique', emoji: '🗺️' },
  { id: 'artistic', label: 'Art', emoji: '🎨' },
  { id: 'ethical', label: 'Éthique', emoji: '⚖️' },
  { id: 'technological', label: 'Technologie', emoji: '🤖' },
  { id: 'psychological', label: 'Psychologie', emoji: '🧠' },
  { id: 'sociological', label: 'Sociologie', emoji: '👥' },
  { id: 'historical', label: 'Histoire', emoji: '📜' },
  { id: 'spiritual', label: 'Spiritualité', emoji: '✨' },
  { id: 'existential', label: 'Existentiel', emoji: '♾️' },
];

export type DiscussionStatus = 'active' | 'paused' | 'completed';

export interface DiscussionMessage {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  timestamp: string;
}

export interface KeyPoint {
  id: string;
  text: string;
  messageIndex: number;
  timestamp: string;
}

export interface DiscussionObjective {
  id: string;
  text: string;
  achieved: boolean;
  timestamp: string;
}

export interface EvolutionNote {
  id: string;
  text: string;
  messageIndex: number;
  timestamp: string;
}

export interface DeepDiscussion {
  id: string;
  title: string;
  category: DiscussionCategory;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  customSystemPrompt?: string;
  messages: DiscussionMessage[];
  keyPoints: KeyPoint[];
  objectives: DiscussionObjective[];
  evolutionNotes: EvolutionNote[];
  status: DiscussionStatus;
  createdAt: string;
  lastActivityAt: string;
  depth: number;
  summary?: string;
  challengeMode: boolean;
  starred?: boolean;
  tags?: string[];
}

export interface DiscussionTemplate {
  id: string;
  title: string;
  category: DiscussionCategory;
  starterPrompt: string;
  description: string;
  emoji: string;
  tags?: string[];
}

// Transversal tags for template navigation
export const DISCUSSION_TAGS: { id: string; label: string; emoji: string }[] = [
  { id: 'debat', label: 'Débat', emoji: '⚡' },
  { id: 'introspection', label: 'Introspection', emoji: '🪞' },
  { id: 'societe', label: 'Société', emoji: '🏛️' },
  { id: 'futur', label: 'Futur', emoji: '🚀' },
  { id: 'histoire', label: 'Histoire', emoji: '📜' },
  { id: 'morale', label: 'Morale', emoji: '⚖️' },
  { id: 'identite', label: 'Identité', emoji: '🎭' },
  { id: 'liberte', label: 'Liberté', emoji: '🕊️' },
  { id: 'pouvoir', label: 'Pouvoir', emoji: '👑' },
  { id: 'amour', label: 'Amour', emoji: '❤️' },
  { id: 'mort', label: 'Mort', emoji: '🌅' },
  { id: 'sens', label: 'Sens', emoji: '♾️' },
  { id: 'justice', label: 'Justice', emoji: '🏛️' },
  { id: 'progres', label: 'Progrès', emoji: '📈' },
  { id: 'nature-humaine', label: 'Nature humaine', emoji: '🧬' },
  { id: 'foi', label: 'Foi', emoji: '🙏' },
  { id: 'conscience', label: 'Conscience', emoji: '💫' },
];

export interface TemplateSection {
  id: string;
  title: string;
  emoji: string;
  description: string;
  templates: DiscussionTemplate[];
}

export interface SensitivityAlert {
  id: string;
  topic: string;
  messageIndex: number;
  timestamp: string;
}

// ─── Social Sharing ──────────────────────────────────────────────────────────

export type ShareContentType = 'key_point' | 'message_quote' | 'discussion_summary';

export interface ShareContent {
  type: ShareContentType;
  title: string;
  text: string;
  discussionTitle: string;
  agentName: string;
  agentEmoji: string;
}

export interface SharePlatform {
  id: string;
  label: string;
  emoji: string;
  color: string;
  maxLength: number;
}
