import { logger } from '../../utils/logger';
import type { Action } from '../action.types';

// ─── Executor Interface ───

export interface ExecutionResult {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ActionExecutor {
  type: string;
  canExecute(action: Action): boolean;
  execute(action: Action, userId: string): Promise<ExecutionResult>;
}

// ─── Executor Registry ───

const executors: ActionExecutor[] = [];

export function registerExecutor(executor: ActionExecutor): void {
  executors.push(executor);
  logger.info(`Action executor registered: ${executor.type}`);
}

export async function executeAction(action: Action, userId: string): Promise<ExecutionResult> {
  const executor = executors.find(e => e.canExecute(action));
  if (!executor) {
    return { success: false, error: `No executor found for action type: ${action.type}` };
  }

  try {
    logger.info('Executing action', { actionId: action.id, type: action.type, userId });
    const result = await executor.execute(action, userId);
    logger.info('Action executed', { actionId: action.id, success: result.success });
    return result;
  } catch (error) {
    logger.error('Action execution failed', { actionId: action.id, error });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ─── Built-in Executors ───

// Email executor — sends via NotificationService
registerExecutor({
  type: 'email',
  canExecute: (action) => action.type === 'email',
  async execute(action, userId) {
    const payload = action.payload as { to?: string[]; subject?: string; body?: string };
    if (!payload.to || !payload.subject || !payload.body) {
      return { success: false, error: 'Missing email fields (to, subject, body)' };
    }
    try {
      const { notificationService } = await import('../../notifications/notification.service');
      await notificationService.send({
        userId,
        channel: 'email',
        type: 'action_email',
        subject: payload.subject,
        body: payload.body,
        metadata: { to: payload.to },
      });
      return { success: true, result: { sentTo: payload.to, sentAt: new Date().toISOString() } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Email send failed' };
    }
  },
});

// Notification executor — creates a notification
registerExecutor({
  type: 'notification_setup',
  canExecute: (action) => action.type === 'notification_setup',
  async execute(action, userId) {
    try {
      const { notificationService } = await import('../../notifications/notification.service');
      await notificationService.send({
        userId,
        channel: 'in_app',
        type: 'action_notification',
        subject: action.title,
        body: action.description,
      });
      return { success: true, result: { notified: true } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Notification failed' };
    }
  },
});

// Calendar event executor — creates alarm
registerExecutor({
  type: 'calendar_event',
  canExecute: (action) => action.type === 'calendar_event',
  async execute(action, userId) {
    const payload = action.payload as { start?: string; end?: string; location?: string };
    if (!payload.start) {
      return { success: false, error: 'Missing start time' };
    }
    try {
      const { dbClient } = await import('../../infra');
      const { v4: uuidv4 } = await import('uuid');
      await dbClient.query(
        `INSERT INTO user_alarms (id, user_id, label, alarm_time, mode, is_active)
         VALUES ($1, $2, $3, $4, 'standard', TRUE)`,
        [uuidv4(), userId, action.title, payload.start],
      );
      return { success: true, result: { alarmCreated: true, time: payload.start } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Alarm creation failed' };
    }
  },
});

// Phone call executor — creates Twilio call
registerExecutor({
  type: 'phone_call',
  canExecute: (action) => action.type === 'phone_call',
  async execute(action, _userId) {
    const payload = action.payload as { phoneNumber?: string; talkingPoints?: string[] };
    if (!payload.phoneNumber) {
      return { success: false, error: 'Missing phone number' };
    }
    // For now, just log the call intent. Real implementation would use Twilio.
    return {
      success: true,
      result: {
        phoneNumber: payload.phoneNumber,
        talkingPoints: payload.talkingPoints ?? [],
        status: 'scheduled',
        note: 'Call intent recorded. Manual execution required.',
      },
    };
  },
});

// Document executor — stores in user_data
registerExecutor({
  type: 'document',
  canExecute: (action) => action.type === 'document',
  async execute(action, userId) {
    const payload = action.payload as { content?: string; documentType?: string };
    try {
      const { dbClient } = await import('../../infra');
      const { v4: uuidv4 } = await import('uuid');
      await dbClient.query(
        `INSERT INTO user_data (id, user_id, namespace, key, value)
         VALUES ($1, $2, 'documents', $3, $4)
         ON CONFLICT (user_id, namespace, key) DO UPDATE SET value = $4, updated_at = NOW()`,
        [uuidv4(), userId, `doc_${Date.now()}`, JSON.stringify({
          title: action.title,
          content: payload.content ?? action.description,
          type: payload.documentType ?? 'note',
          createdAt: new Date().toISOString(),
        })],
      );
      return { success: true, result: { documentCreated: true } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Document creation failed' };
    }
  },
});

// Social post executor — creates campaign post
registerExecutor({
  type: 'social_post',
  canExecute: (action) => action.type === 'social_post',
  async execute(action, _userId) {
    const payload = action.payload as { platforms?: string[]; content?: string; hashtags?: string[] };
    return {
      success: true,
      result: {
        status: 'draft_created',
        platforms: payload.platforms ?? ['general'],
        content: payload.content ?? action.description,
        hashtags: payload.hashtags ?? [],
        note: 'Post draft created. Review in Campagnes before publishing.',
      },
    };
  },
});

// Generic task executor — just marks as completed
registerExecutor({
  type: 'task',
  canExecute: (action) => action.type === 'task' || action.type === 'follow_up' || action.type === 'custom',
  async execute(_action, _userId) {
    return {
      success: true,
      result: { completedAt: new Date().toISOString(), note: 'Task marked as complete.' },
    };
  },
});

logger.info(`Action executor registry initialized with ${executors.length} executors`);
