// Action parser — extracts [ACTION:...] proposals from agent responses

export interface ParsedActionProposal {
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueOffset: string | null; // "+3d", "+7d", "+14d", etc.
  dueDate: string | null;   // ISO date computed from offset
}

// Pattern: [ACTION:type|Title|Description|priority:X|due:+Yd]
const ACTION_PATTERN = /\[ACTION:([a-z_]+)\|([^|]+)\|([^|]*?)(?:\|priority:(\w+))?(?:\|due:(\+\d+[dhwm]))?\]/g;

function computeDueDate(offset: string): string {
  const now = new Date();
  const match = offset.match(/^\+(\d+)([dhwm])$/);
  if (!match) return now.toISOString();

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': now.setDate(now.getDate() + amount); break;
    case 'h': now.setHours(now.getHours() + amount); break;
    case 'w': now.setDate(now.getDate() + amount * 7); break;
    case 'm': now.setMonth(now.getMonth() + amount); break;
  }

  return now.toISOString();
}

export function parseActionProposals(text: string): {
  cleanContent: string;
  proposals: ParsedActionProposal[];
} {
  const proposals: ParsedActionProposal[] = [];

  // Reset regex lastIndex
  ACTION_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ACTION_PATTERN.exec(text)) !== null) {
    const type = match[1];
    const title = match[2].trim();
    const description = match[3].trim();
    const priority = (match[4] as ParsedActionProposal['priority']) || 'medium';
    const dueOffset = match[5] || null;

    proposals.push({
      type,
      title,
      description,
      priority,
      dueOffset,
      dueDate: dueOffset ? computeDueDate(dueOffset) : null,
    });
  }

  // Remove action tags from displayed content
  const cleanContent = text.replace(ACTION_PATTERN, '').replace(/\n{3,}/g, '\n\n').trim();

  return { cleanContent, proposals };
}

// ─── Priority Labels & Colors ───

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevée',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

// ─── Type Labels & Icons ───

export const ACTION_TYPE_LABELS: Record<string, string> = {
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

export const ACTION_TYPE_ICONS: Record<string, string> = {
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

export function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays <= 7) return `Dans ${diffDays} jours`;
  if (diffDays <= 30) return `Dans ${Math.ceil(diffDays / 7)} semaines`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
