export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'in_app' | 'webhook';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: string;
  subject: string;
  body: string;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  externalId: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

export interface SendNotificationInput {
  userId: string;
  channel: NotificationChannel;
  type: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

/**
 * Known notification types.
 */
export const NOTIFICATION_TYPES = {
  LOW_BALANCE: 'low_balance',
  CAMPAIGN_APPROVED: 'campaign_approved',
  CAMPAIGN_REJECTED: 'campaign_rejected',
  POST_PUBLISHED: 'post_published',
  POST_FAILED: 'post_failed',
  DAILY_REPORT: 'daily_report',
  WEEKLY_REPORT: 'weekly_report',
  WELCOME: 'welcome',
  DEMO_EXPIRING: 'demo_expiring',
  API_KEY_REGENERATED: 'api_key_regenerated',
} as const;
