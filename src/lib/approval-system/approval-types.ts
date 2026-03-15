/**
 * Approval System — Types TypeScript stricts
 */

export enum ActionType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  SEND_WHATSAPP = 'send_whatsapp',
  POST_SOCIAL = 'post_social',
  GENERATE_DOCUMENT = 'generate_document',
  GENERATE_INVOICE = 'generate_invoice',
  PUBLISH_CONTENT = 'publish_content',
  UPDATE_PROFILE = 'update_profile',
  CREDIT_USER = 'credit_user',
  DEBIT_USER = 'debit_user',
  TOGGLE_FEATURE = 'toggle_feature',
  SCHEDULE_MEETING = 'schedule_meeting',
  ADMIN_ALERT = 'admin_alert',
  BROADCAST = 'broadcast',
  AGENT_ACTION = 'agent_action',
  CUSTOM = 'custom',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  POSTPONED = 'postponed',
  MODIFIED = 'modified',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ApprovalTarget {
  USER = 'user',
  EMMANUEL = 'emmanuel',
}

export interface ApprovalQueueItem {
  id: string;
  user_id: string;
  agent_id: string;
  action_type: ActionType;
  action_title: string;
  action_payload: Record<string, unknown>;
  modified_payload: Record<string, unknown> | null;
  target: ApprovalTarget;
  status: ApprovalStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  preview_text: string;
  created_at: Date;
  expires_at: Date;
  approved_at: Date | null;
  approved_by: string | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
  postpone_until: Date | null;
  postpone_count: number;
  reminder_count: number;
  last_reminder_at: Date | null;
  notification_sent_via: string[];
  executed_at: Date | null;
  execution_result: Record<string, unknown> | null;
}

export interface ApprovalSettings {
  user_id: string;
  notification_channels: ('email' | 'telegram' | 'whatsapp' | 'inapp')[];
  auto_approve_types: ActionType[];
  expiry_hours: number;
  reminder_after_hours: number;
  max_postpones: number;
  quiet_hours_start: string | null; // "22:00"
  quiet_hours_end: string | null;   // "07:00"
  telegram_chat_id: string | null;
  whatsapp_number: string | null;
}

export interface CreateApprovalParams {
  user_id: string;
  agent_id: string;
  action_type: ActionType;
  action_title: string;
  action_payload: Record<string, unknown>;
  target?: ApprovalTarget;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  preview_text?: string;
}

export interface ApprovalResult {
  success: boolean;
  action_executed?: boolean;
  error?: string;
  item?: ApprovalQueueItem;
}

export interface NotificationPayload {
  item: ApprovalQueueItem;
  channel: 'email' | 'telegram' | 'whatsapp' | 'inapp';
  user_email?: string;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  action_url: string;
}
