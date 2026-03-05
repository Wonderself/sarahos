// ─── Action Types — Conversation → Action Pipeline ───

export type ActionType =
  | 'task'
  | 'social_post'
  | 'calendar_event'
  | 'phone_call'
  | 'email'
  | 'document'
  | 'meeting'
  | 'campaign'
  | 'crm_entry'
  | 'strategy_update'
  | 'budget_action'
  | 'notification_setup'
  | 'follow_up'
  | 'custom';

export type ActionStatus = 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';

export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Action {
  id: string;
  userId: string;
  projectId: string | null;
  workspaceId: string | null;
  type: ActionType;
  title: string;
  description: string;
  status: ActionStatus;
  priority: ActionPriority;
  sourceAgent: string | null;
  sourceConversationId: string | null;
  sourceMessageIndex: number | null;
  assignedTo: string | null;
  dueDate: Date | null;
  reminderAt: Date | null;
  scheduledAt: Date | null;
  payload: Record<string, unknown>;
  completedAt: Date | null;
  result: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Type-Specific Payloads ───

export interface TaskPayload {
  checklist?: Array<{ text: string; done: boolean }>;
  labels?: string[];
}

export interface SocialPostPayload {
  platforms: string[];
  content: string;
  hashtags?: string[];
  mediaUrl?: string;
  scheduledTime?: string;
}

export interface CalendarEventPayload {
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  isOnline?: boolean;
}

export interface PhoneCallPayload {
  phoneNumber: string;
  contactName?: string;
  talkingPoints?: string[];
}

export interface EmailPayload {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
}

export interface DocumentPayload {
  documentType: string;
  content?: string;
  templateId?: string;
}

export interface MeetingPayload {
  participants: string[];
  agenda: string[];
  duration: number; // minutes
  isOnline?: boolean;
  link?: string;
}

export interface CampaignPayload {
  campaignName: string;
  channels: string[];
  targetAudience?: string;
  budget?: number;
}

export interface CrmEntryPayload {
  contactName: string;
  company?: string;
  notes: string;
  nextAction?: string;
}

// ─── Input Types ───

export interface CreateActionInput {
  type: ActionType;
  title: string;
  description?: string;
  priority?: ActionPriority;
  sourceAgent?: string;
  sourceConversationId?: string;
  sourceMessageIndex?: number;
  assignedTo?: string;
  dueDate?: string;
  reminderAt?: string;
  scheduledAt?: string;
  payload?: Record<string, unknown>;
  projectId?: string;
  workspaceId?: string;
}

export interface UpdateActionInput {
  title?: string;
  description?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  assignedTo?: string | null;
  dueDate?: string | null;
  reminderAt?: string | null;
  scheduledAt?: string | null;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export interface ActionFilters {
  status?: ActionStatus;
  type?: ActionType;
  priority?: ActionPriority;
  from?: string;
  to?: string;
  assignedTo?: string;
  workspaceId?: string;
  projectId?: string;
  limit?: number;
  offset?: number;
}

export interface ActionStats {
  total: number;
  proposed: number;
  accepted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  deferred: number;
  overdue: number;
}

export const VALID_ACTION_TYPES: ActionType[] = [
  'task', 'social_post', 'calendar_event', 'phone_call', 'email',
  'document', 'meeting', 'campaign', 'crm_entry', 'strategy_update',
  'budget_action', 'notification_setup', 'follow_up', 'custom',
];

export const VALID_STATUSES: ActionStatus[] = [
  'proposed', 'accepted', 'in_progress', 'completed', 'cancelled', 'deferred',
];

export const VALID_PRIORITIES: ActionPriority[] = ['low', 'medium', 'high', 'urgent'];

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  task: 'Tâche',
  social_post: 'Publication',
  calendar_event: 'Événement',
  phone_call: 'Appel',
  email: 'Email',
  document: 'Document',
  meeting: 'Réunion',
  campaign: 'Campagne',
  crm_entry: 'CRM',
  strategy_update: 'Stratégie',
  budget_action: 'Budget',
  notification_setup: 'Notification',
  follow_up: 'Suivi',
  custom: 'Personnalisé',
};

export const ACTION_TYPE_ICONS: Record<ActionType, string> = {
  task: '✅',
  social_post: '📱',
  calendar_event: '📅',
  phone_call: '📞',
  email: '✉️',
  document: '📄',
  meeting: '🤝',
  campaign: '📢',
  crm_entry: '👤',
  strategy_update: '🎯',
  budget_action: '💰',
  notification_setup: '🔔',
  follow_up: '🔄',
  custom: '⚡',
};
