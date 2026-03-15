/**
 * Approval System — Service principal
 * Gère le cycle de vie complet : create → approve/reject/postpone/modify → execute
 */
import { spawn } from 'child_process';
import {
  ActionType,
  ApprovalStatus,
  ApprovalTarget,
  type ApprovalQueueItem,
  type ApprovalSettings,
  type CreateApprovalParams,
  type ApprovalResult,
} from './approval-types';
import { ApprovalNotifier } from './ApprovalNotifier';

// DB helper — uses psql directly
async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0 && err) reject(new Error(err.trim()));
      else resolve(out.trim());
    });
  });
}

async function dbQueryJSON<T>(sql: string): Promise<T | null> {
  try {
    const result = await dbQuery(`SELECT row_to_json(t) FROM (${sql}) t`);
    if (!result || result === '') return null;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

function generateId(): string {
  return `apv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const notifier = new ApprovalNotifier();

export class ApprovalService {
  /**
   * Create a new approval request
   */
  static async create(params: CreateApprovalParams): Promise<ApprovalResult> {
    try {
      const id = generateId();
      const target = params.target || ApprovalTarget.USER;
      const priority = params.priority || 'normal';
      const preview = params.preview_text || params.action_title;

      // Get user settings
      const settings = await this.getUserSettings(params.user_id);
      const expiryHours = settings?.expiry_hours || 48;
      const expiresAt = new Date(Date.now() + expiryHours * 3600000).toISOString();

      // Insert into approval_queue
      const payload = JSON.stringify(params.action_payload).replace(/'/g, "''");
      await dbQuery(`
        INSERT INTO approval_queue (id, user_id, agent_id, action_type, action_title, action_payload, target, status, priority, preview_text, created_at, expires_at, postpone_count, reminder_count, notification_sent_via)
        VALUES ('${id}', '${params.user_id}', '${params.agent_id}', '${params.action_type}', '${params.action_title.replace(/'/g, "''")}', '${payload}'::jsonb, '${target}', 'pending', '${priority}', '${preview.replace(/'/g, "''")}', NOW(), '${expiresAt}', 0, 0, '{}')
      `);

      // Check if auto-approve
      if (settings && settings.auto_approve_types.includes(params.action_type as ActionType)) {
        return this.approve(id, 'auto');
      }

      // Notify user
      const item = await this.getById(id);
      if (item && settings) {
        await notifier.notify(item, settings);
      }

      // Log
      await this.logAction(id, 'created', `Approval created: ${params.action_title}`);

      return { success: true, item: item || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Approve an action
   */
  static async approve(id: string, approvedBy = 'user'): Promise<ApprovalResult> {
    try {
      await dbQuery(`
        UPDATE approval_queue SET status = 'approved', approved_at = NOW(), approved_by = '${approvedBy}'
        WHERE id = '${id}' AND status IN ('pending', 'modified', 'postponed')
      `);

      const item = await this.getById(id);
      if (!item) return { success: false, error: 'Item not found' };

      // Execute the action
      const execResult = await this.executeAction(item);

      await this.logAction(id, 'approved', `Approved by ${approvedBy}`);

      return { success: true, action_executed: execResult, item };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Reject an action
   */
  static async reject(id: string, reason: string): Promise<ApprovalResult> {
    try {
      await dbQuery(`
        UPDATE approval_queue SET status = 'rejected', rejected_at = NOW(), rejection_reason = '${reason.replace(/'/g, "''")}'
        WHERE id = '${id}' AND status IN ('pending', 'modified', 'postponed')
      `);

      await this.logAction(id, 'rejected', `Rejected: ${reason}`);

      const item = await this.getById(id);
      return { success: true, item: item || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Postpone an action
   */
  static async postpone(id: string, until: Date): Promise<ApprovalResult> {
    try {
      const item = await this.getById(id);
      if (!item) return { success: false, error: 'Item not found' };

      const settings = await this.getUserSettings(item.user_id);
      const maxPostpones = settings?.max_postpones || 3;

      if (item.postpone_count >= maxPostpones) {
        return { success: false, error: `Maximum de ${maxPostpones} reports atteint` };
      }

      await dbQuery(`
        UPDATE approval_queue SET status = 'postponed', postpone_until = '${until.toISOString()}', postpone_count = postpone_count + 1, expires_at = '${until.toISOString()}'
        WHERE id = '${id}'
      `);

      const isLast = item.postpone_count + 1 >= maxPostpones;
      await this.logAction(id, 'postponed', `Postponed until ${until.toISOString()}${isLast ? ' (last postpone)' : ''}`);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Modify payload before approval
   */
  static async modify(id: string, newPayload: Record<string, unknown>): Promise<ApprovalResult> {
    try {
      const payload = JSON.stringify(newPayload).replace(/'/g, "''");
      await dbQuery(`
        UPDATE approval_queue SET modified_payload = '${payload}'::jsonb, status = 'modified'
        WHERE id = '${id}'
      `);

      await this.logAction(id, 'modified', 'Payload modified, pending re-approval');

      const item = await this.getById(id);
      return { success: true, item: item || undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Process expired items
   */
  static async processExpired(): Promise<number> {
    try {
      const result = await dbQuery(`
        UPDATE approval_queue SET status = 'expired'
        WHERE expires_at <= NOW() AND status IN ('pending', 'postponed')
        RETURNING id
      `);
      const count = result ? result.split('\n').filter(Boolean).length : 0;
      if (count > 0) {
        await this.logAction('system', 'expired', `${count} items expired`);
      }
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Send reminders for pending items
   */
  static async sendReminders(): Promise<number> {
    try {
      const items = await dbQuery(`
        SELECT id, user_id FROM approval_queue
        WHERE status = 'pending'
        AND (last_reminder_at IS NULL OR last_reminder_at < NOW() - INTERVAL '4 hours')
        AND created_at < NOW() - INTERVAL '2 hours'
      `);

      if (!items || items === '') return 0;

      const lines = items.split('\n').filter(Boolean);
      let sent = 0;

      for (const line of lines) {
        const [itemId, userId] = line.split('|');
        if (!itemId || !userId) continue;

        const item = await this.getById(itemId);
        const settings = await this.getUserSettings(userId);
        if (item && settings) {
          await notifier.notify(item, settings);
          await dbQuery(`
            UPDATE approval_queue SET reminder_count = reminder_count + 1, last_reminder_at = NOW()
            WHERE id = '${itemId}'
          `);
          sent++;
        }
      }

      return sent;
    } catch {
      return 0;
    }
  }

  /**
   * Execute an approved action
   */
  private static async executeAction(item: ApprovalQueueItem): Promise<boolean> {
    try {
      const payload = item.modified_payload || item.action_payload;

      // Log execution start
      await dbQuery(`UPDATE approval_queue SET executed_at = NOW() WHERE id = '${item.id}'`);

      switch (item.action_type) {
        case ActionType.SEND_EMAIL:
        case ActionType.SEND_SMS:
        case ActionType.SEND_WHATSAPP:
        case ActionType.POST_SOCIAL:
        case ActionType.GENERATE_DOCUMENT:
        case ActionType.GENERATE_INVOICE:
        case ActionType.PUBLISH_CONTENT:
        case ActionType.SCHEDULE_MEETING:
        case ActionType.AGENT_ACTION:
        case ActionType.CUSTOM:
          // Store result — actual execution delegated to the calling service
          await dbQuery(`
            UPDATE approval_queue SET execution_result = '${JSON.stringify({ status: 'delegated', payload }).replace(/'/g, "''")}'::jsonb
            WHERE id = '${item.id}'
          `);
          break;

        case ActionType.CREDIT_USER:
          const credits = (payload as Record<string, unknown>).amount || 0;
          await dbQuery(`UPDATE users SET credits = credits + ${credits} WHERE id = '${item.user_id}'`);
          break;

        case ActionType.TOGGLE_FEATURE:
          const feature = (payload as Record<string, unknown>).feature || '';
          const enabled = (payload as Record<string, unknown>).enabled ? 'true' : 'false';
          await dbQuery(`UPDATE user_profiles SET features = jsonb_set(COALESCE(features, '{}'), '{${feature}}', '${enabled}') WHERE user_id = '${item.user_id}'`);
          break;

        default:
          break;
      }

      return true;
    } catch (err) {
      await dbQuery(`
        UPDATE approval_queue SET status = 'failed', execution_result = '${JSON.stringify({ error: err instanceof Error ? err.message : String(err) }).replace(/'/g, "''")}'::jsonb
        WHERE id = '${item.id}'
      `);
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────

  static async getById(id: string): Promise<ApprovalQueueItem | null> {
    return dbQueryJSON<ApprovalQueueItem>(`SELECT * FROM approval_queue WHERE id = '${id}'`);
  }

  static async getUserSettings(userId: string): Promise<ApprovalSettings | null> {
    const settings = await dbQueryJSON<ApprovalSettings>(
      `SELECT * FROM user_approval_settings WHERE user_id = '${userId}'`
    );
    // Return defaults if no settings found
    if (!settings) {
      return {
        user_id: userId,
        notification_channels: ['inapp'],
        auto_approve_types: [],
        expiry_hours: 48,
        reminder_after_hours: 4,
        max_postpones: 3,
        quiet_hours_start: null,
        quiet_hours_end: null,
        telegram_chat_id: null,
        whatsapp_number: null,
      };
    }
    return settings;
  }

  private static async logAction(itemId: string, action: string, message: string): Promise<void> {
    try {
      await dbQuery(`
        INSERT INTO cron_logs (cron_name, status, message, created_at)
        VALUES ('approval_${action}', 'success', '${itemId}: ${message.replace(/'/g, "''")}', NOW())
      `);
    } catch { /* silent */ }
  }
}
