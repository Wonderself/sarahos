// ─── Deep Discussions — Types ────────────────────────────────────────────────

export type DiscussionCategory =
  | 'philosophical' | 'religious' | 'cultural' | 'civilizational'
  | 'personal' | 'scientific' | 'economic' | 'geopolitical'
  | 'artistic' | 'ethical' | 'technological' | 'psychological'
  | 'sociological' | 'historical' | 'spiritual' | 'existential';

export const DISCUSSION_CATEGORIES: { id: DiscussionCategory; label: string; materialIcon: string }[] = [
  { id: 'philosophical', label: 'Philosophie', materialIcon: 'account_balance' },
  { id: 'religious', label: 'Religion', materialIcon: 'volunteer_activism' },
  { id: 'cultural', label: 'Culture', materialIcon: 'theater_comedy' },
  { id: 'civilizational', label: 'Civilisation', materialIcon: 'public' },
  { id: 'personal', label: 'Personnel', materialIcon: 'person' },
  { id: 'scientific', label: 'Science', materialIcon: 'science' },
  { id: 'economic', label: 'Économie', materialIcon: 'trending_up' },
  { id: 'geopolitical', label: 'Géopolitique', materialIcon: 'map' },
  { id: 'artistic', label: 'Art', materialIcon: 'palette' },
  { id: 'ethical', label: 'Éthique', materialIcon: 'balance' },
  { id: 'technological', label: 'Technologie', materialIcon: 'smart_toy' },
  { id: 'psychological', label: 'Psychologie', materialIcon: 'psychology' },
  { id: 'sociological', label: 'Sociologie', materialIcon: 'group' },
  { id: 'historical', label: 'Histoire', materialIcon: 'history_edu' },
  { id: 'spiritual', label: 'Spiritualité', materialIcon: 'auto_awesome' },
  { id: 'existential', label: 'Existentiel', materialIcon: 'all_inclusive' },
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
  materialIcon: string;
  tags?: string[];
}

// Transversal tags for template navigation
export const DISCUSSION_TAGS: { id: string; label: string; materialIcon: string }[] = [
  { id: 'debat', label: 'Débat', materialIcon: 'bolt' },
  { id: 'introspection', label: 'Introspection', materialIcon: 'person' },
  { id: 'societe', label: 'Société', materialIcon: 'account_balance' },
  { id: 'futur', label: 'Futur', materialIcon: 'rocket_launch' },
  { id: 'histoire', label: 'Histoire', materialIcon: 'history_edu' },
  { id: 'morale', label: 'Morale', materialIcon: 'balance' },
  { id: 'identite', label: 'Identité', materialIcon: 'theater_comedy' },
  { id: 'liberte', label: 'Liberté', materialIcon: 'volunteer_activism' },
  { id: 'pouvoir', label: 'Pouvoir', materialIcon: 'crown' },
  { id: 'amour', label: 'Amour', materialIcon: 'favorite' },
  { id: 'mort', label: 'Mort', materialIcon: 'wb_twilight' },
  { id: 'sens', label: 'Sens', materialIcon: 'all_inclusive' },
  { id: 'justice', label: 'Justice', materialIcon: 'account_balance' },
  { id: 'progres', label: 'Progrès', materialIcon: 'trending_up' },
  { id: 'nature-humaine', label: 'Nature humaine', materialIcon: 'biotech' },
  { id: 'foi', label: 'Foi', materialIcon: 'self_improvement' },
  { id: 'conscience', label: 'Conscience', materialIcon: 'lightbulb' },
];

export interface TemplateSection {
  id: string;
  title: string;
  materialIcon: string;
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
  materialIcon: string;
  color: string;
  maxLength: number;
}
