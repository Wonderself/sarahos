import { Router } from 'express';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';
import type { WhatsAppWebhookPayload } from '../../whatsapp/whatsapp.types';

export function createWhatsAppWebhookRouter(): Router {
  const router = Router();

  /**
   * GET /webhook/whatsapp — Meta webhook verification.
   * Meta sends: hub.mode=subscribe, hub.verify_token=<token>, hub.challenge=<challenge>
   * Must respond with hub.challenge if verify_token matches.
   * PUBLIC — no auth required.
   */
  router.get('/webhook/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'] as string | undefined;
    const token = req.query['hub.verify_token'] as string | undefined;
    const challenge = req.query['hub.challenge'] as string | undefined;

    if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      logger.warn('WhatsApp webhook verification failed', {
        mode,
        tokenMatch: token === config.WHATSAPP_VERIFY_TOKEN,
      });
      res.sendStatus(403);
    }
  });

  /**
   * POST /webhook/whatsapp — Incoming messages from Meta.
   * Must respond 200 within 5 seconds or Meta retries.
   * Processing happens asynchronously.
   * PUBLIC — no auth required.
   */
  router.post('/webhook/whatsapp', (req, res) => {
    // Immediately respond 200 to Meta
    res.sendStatus(200);

    const payload = req.body as WhatsAppWebhookPayload;
    if (payload.object !== 'whatsapp_business_account') return;

    // Process asynchronously
    processWebhookPayload(payload).catch((err) => {
      logger.error('WhatsApp webhook processing error', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  return router;
}

async function processWebhookPayload(payload: WhatsAppWebhookPayload): Promise<void> {
  const { whatsAppPipeline } = await import('../../whatsapp/whatsapp-pipeline.service');
  const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;
      const value = change.value;

      // Process incoming messages
      if (value.messages) {
        for (const message of value.messages) {
          const contactName = value.contacts?.[0]?.profile?.name ?? 'Unknown';
          try {
            await whatsAppPipeline.processIncomingMessage(message, contactName);
          } catch (err) {
            logger.error('WhatsApp message processing error', {
              messageId: message.id,
              from: message.from,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }

      // Process status updates (sent, delivered, read, failed)
      if (value.statuses) {
        for (const status of value.statuses) {
          try {
            await whatsAppRepository.updateMessageStatus(status.id, status.status);
          } catch (err) {
            logger.warn('WhatsApp status update error', {
              messageId: status.id,
              status: status.status,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }
    }
  }
}
