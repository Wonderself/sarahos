import { Router, type Request, type Response } from 'express';
import { logger } from '../utils/logger';
import { verifyWebhookSignature, handleWebhookEvent } from './stripe-webhooks';
import type { StripeEvent } from './stripe-webhooks';

const STRIPE_WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET'] ?? '';

/**
 * Express router for Stripe webhooks.
 *
 * IMPORTANT: This router must be mounted BEFORE express.json() middleware
 * because Stripe signature verification requires the raw request body.
 * Alternatively, mount it on a path that uses express.raw().
 */
export function createStripeWebhookRouter(): Router {
  const router = Router();

  // Use raw body parser — Stripe requires the exact raw payload for signature verification
  router.post(
    '/webhooks/stripe',
    // express.raw returns the body as a Buffer
    (req: Request, res: Response) => {
      // The body may already be parsed as raw if the top-level app uses express.raw for this path,
      // or we need to collect it manually.
      collectRawBody(req)
        .then(async (rawBody) => {
          const sig = req.headers['stripe-signature'] as string | undefined;

          if (!sig) {
            logger.warn('Stripe webhook: missing stripe-signature header');
            res.status(400).json({ error: 'Missing stripe-signature header' });
            return;
          }

          if (!STRIPE_WEBHOOK_SECRET) {
            logger.error(
              'Stripe webhook: STRIPE_WEBHOOK_SECRET not configured — cannot verify signature',
            );
            // In development, we can process without verification
            if (process.env['NODE_ENV'] === 'production') {
              res.status(500).json({ error: 'Webhook secret not configured' });
              return;
            }
            logger.warn('Stripe webhook: skipping signature verification (non-production)');
          } else {
            const isValid = verifyWebhookSignature(rawBody, sig, STRIPE_WEBHOOK_SECRET);
            if (!isValid) {
              logger.warn('Stripe webhook: invalid signature', {
                sigPrefix: sig.substring(0, 20),
              });
              res.status(400).json({ error: 'Invalid signature' });
              return;
            }
          }

          // Parse the event
          let event: StripeEvent;
          try {
            event = JSON.parse(rawBody) as StripeEvent;
          } catch {
            logger.warn('Stripe webhook: invalid JSON payload');
            res.status(400).json({ error: 'Invalid JSON payload' });
            return;
          }

          // Process the event
          const result = await handleWebhookEvent(event);

          logger.info('Stripe webhook processed', {
            eventId: event.id,
            type: event.type,
            handled: result.handled,
            action: result.action,
          });

          // Always return 200 to acknowledge receipt — Stripe will retry on non-2xx
          res.status(200).json({ received: true, handled: result.handled, action: result.action });
        })
        .catch((error) => {
          logger.error('Stripe webhook error', {
            error: error instanceof Error ? error.message : String(error),
          });
          // Return 200 anyway to prevent Stripe from retrying on transient errors
          // In production you may want 500 for certain error types so Stripe retries
          res.status(500).json({ error: 'Internal webhook processing error' });
        });
    },
  );

  return router;
}

/**
 * Collect the raw body from the request stream.
 * If the body has already been parsed (e.g. by express.raw()), return it directly.
 */
function collectRawBody(req: Request): Promise<string> {
  // If body is a Buffer (express.raw was used upstream)
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body.toString('utf8'));
  }

  // If body is already a string
  if (typeof req.body === 'string') {
    return Promise.resolve(req.body);
  }

  // If body was parsed as JSON by express.json(), re-serialize it.
  // This is not ideal for signature verification — in production, ensure
  // this route is mounted before express.json() or use express.raw().
  if (req.body && typeof req.body === 'object') {
    logger.warn(
      'Stripe webhook: body already parsed as JSON — signature verification may fail. ' +
        'Mount the stripe webhook route before express.json() middleware.',
    );
    return Promise.resolve(JSON.stringify(req.body));
  }

  // Collect from stream
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export const stripeWebhookRouter = createStripeWebhookRouter();
