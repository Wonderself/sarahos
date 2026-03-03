import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { Notification, SendNotificationInput } from './notification.types';

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    channel: row['channel'] as Notification['channel'],
    type: row['type'] as string,
    subject: row['subject'] as string,
    body: row['body'] as string,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    status: row['status'] as Notification['status'],
    externalId: (row['external_id'] as string) ?? null,
    sentAt: row['sent_at'] ? new Date(row['sent_at'] as string) : null,
    deliveredAt: row['delivered_at'] ? new Date(row['delivered_at'] as string) : null,
    readAt: row['read_at'] ? new Date(row['read_at'] as string) : null,
    errorMessage: (row['error_message'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
  };
}

export class NotificationService {
  /**
   * Queue a notification for delivery.
   * In production, this would dispatch to the appropriate channel handler
   * (WhatsApp Business API, SendGrid, Twilio SMS, etc.)
   */
  async send(input: SendNotificationInput): Promise<Notification | null> {
    if (!dbClient.isConnected()) {
      logger.warn('NotificationService: DB not connected, notification dropped', { type: input.type, channel: input.channel });
      return null;
    }

    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO notifications (id, user_id, channel, type, subject, body, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, input.userId, input.channel, input.type, input.subject, input.body, JSON.stringify(input.metadata ?? {})],
    );

    const notification = result.rows[0] ? rowToNotification(result.rows[0] as Record<string, unknown>) : null;

    if (notification) {
      // Dispatch to channel handler
      await this.dispatch(notification);
    }

    return notification;
  }

  /**
   * Dispatch notification to the appropriate channel.
   * Currently logs only — real implementations will be added when
   * WhatsApp Business API, SendGrid, etc. are connected.
   */
  private async dispatch(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case 'whatsapp': {
        const { whatsAppRepository } = await import('../whatsapp/whatsapp.repository');
        const { whatsAppService } = await import('../whatsapp/whatsapp.service');

        const phoneLink = await whatsAppRepository.getPhoneLink(notification.userId);
        if (!phoneLink || !phoneLink.isVerified) {
          logger.warn('WhatsApp notification: no verified phone', {
            notificationId: notification.id,
            userId: notification.userId,
          });
          await this.markAsFailed(notification.id, 'No verified WhatsApp number');
          break;
        }

        if (!whatsAppService.isConfigured()) {
          logger.warn('WhatsApp notification: service not configured', { notificationId: notification.id });
          await this.markAsFailed(notification.id, 'WhatsApp not configured');
          break;
        }

        try {
          const waMessageId = await whatsAppService.sendTextMessage({
            to: phoneLink.phoneNumber,
            text: `*${notification.subject}*\n\n${notification.body}`,
          });

          if (waMessageId) {
            await this.markAsSent(notification.id, waMessageId);
          } else {
            await this.markAsFailed(notification.id, 'WhatsApp send failed');
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          logger.error('WhatsApp notification error', { notificationId: notification.id, error: msg });
          await this.markAsFailed(notification.id, msg);
        }
        break;
      }

      case 'email':
        logger.warn('Email channel not configured — notification stored but not delivered. Configure SendGrid/SES to enable.', {
          notificationId: notification.id,
          type: notification.type,
          userId: notification.userId,
        });
        await this.markAsFailed(notification.id, 'Email channel not configured');
        break;

      case 'sms':
        logger.warn('SMS channel not configured — notification stored but not delivered. Configure Twilio to enable.', {
          notificationId: notification.id,
          type: notification.type,
          userId: notification.userId,
        });
        await this.markAsFailed(notification.id, 'SMS channel not configured');
        break;

      case 'in_app':
        // In-app notifications are stored in DB, client polls or uses SSE
        await this.markAsSent(notification.id, notification.id);
        break;

      case 'webhook':
        logger.warn('Webhook channel not configured — notification stored but not delivered.', {
          notificationId: notification.id,
          type: notification.type,
          userId: notification.userId,
        });
        await this.markAsFailed(notification.id, 'Webhook channel not configured');
        break;
    }
  }

  async markAsFailed(id: string, errorMessage: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      `UPDATE notifications SET status = 'failed', error_message = $1 WHERE id = $2`,
      [errorMessage, id],
    );
  }

  async markAsSent(id: string, externalId: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      `UPDATE notifications SET status = 'sent', sent_at = NOW(), external_id = $1 WHERE id = $2`,
      [externalId, id],
    );
  }

  async markAsDelivered(id: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      `UPDATE notifications SET status = 'delivered', delivered_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  async markAsRead(id: string): Promise<void> {
    if (!dbClient.isConnected()) return;
    await dbClient.query(
      `UPDATE notifications SET status = 'read', read_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  async getByUser(userId: string, limit = 50): Promise<Notification[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit],
    );
    return result.rows.map((r) => rowToNotification(r as Record<string, unknown>));
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!dbClient.isConnected()) return 0;
    const result = await dbClient.query(
      `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND status != 'read'`,
      [userId],
    );
    return Number((result.rows[0] as Record<string, unknown>)['count']);
  }
}

export const notificationService = new NotificationService();
