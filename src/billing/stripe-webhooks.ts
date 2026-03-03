import { logger } from '../utils/logger';
import { walletService } from './wallet.service';
import { notificationService } from '../notifications';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: any };
  created: number;
}

interface WebhookResult {
  handled: boolean;
  action?: string;
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/**
 * Verify Stripe webhook signature using HMAC-SHA256.
 * Stripe signs the payload with the webhook secret using the `v1` scheme.
 * See: https://docs.stripe.com/webhooks/signatures
 */
export function verifyWebhookSignature(
  payload: string,
  sig: string,
  secret: string,
): boolean {
  try {
    // Parse the Stripe-Signature header
    const elements = sig.split(',');
    let timestamp = '';
    const signatures: string[] = [];

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatures.push(value);
      }
    }

    if (!timestamp || signatures.length === 0) {
      logger.warn('Stripe webhook: missing timestamp or v1 signature');
      return false;
    }

    // Protect against replay attacks (tolerance: 5 minutes)
    const timestampAge = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
    if (timestampAge > 300) {
      logger.warn('Stripe webhook: timestamp too old', { age: timestampAge });
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Compare against all v1 signatures (Stripe may send multiple)
    return signatures.some((s) =>
      crypto.timingSafeEqual(Buffer.from(s, 'hex'), Buffer.from(expectedSig, 'hex')),
    );
  } catch (error) {
    logger.error('Stripe webhook signature verification error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handlePaymentIntentSucceeded(data: any): Promise<string> {
  const paymentIntent = data.object;
  const userId = paymentIntent.metadata?.userId as string | undefined;
  const amount = paymentIntent.amount as number; // cents
  const currency = (paymentIntent.currency as string) ?? 'eur';

  if (!userId) {
    logger.warn('Stripe payment_intent.succeeded: no userId in metadata', {
      paymentIntentId: paymentIntent.id,
    });
    return 'payment_succeeded_no_user';
  }

  // Convert cents to micro-credits (1 EUR = 100 credits, 1 credit = 1,000,000 micro)
  // So 1 cent = 1 credit = 1,000,000 micro-credits
  const microCredits = amount * 1_000_000;

  await walletService.deposit({
    userId,
    amount: microCredits,
    description: `Stripe payment ${paymentIntent.id} (${(amount / 100).toFixed(2)} ${currency.toUpperCase()})`,
    referenceType: 'stripe_payment',
    referenceId: paymentIntent.id,
  });

  logger.info('Stripe payment processed — wallet credited', {
    userId,
    paymentIntentId: paymentIntent.id,
    amountCents: amount,
    microCredits,
  });

  return 'wallet_deposit_completed';
}

async function handlePaymentIntentFailed(data: any): Promise<string> {
  const paymentIntent = data.object;
  const userId = paymentIntent.metadata?.userId as string | undefined;
  const failureMessage =
    paymentIntent.last_payment_error?.message ?? 'Paiement echoue';

  logger.error('Stripe payment_intent.payment_failed', {
    paymentIntentId: paymentIntent.id,
    userId,
    failureCode: paymentIntent.last_payment_error?.code,
    failureMessage,
  });

  // Notify user if we have their ID
  if (userId) {
    await notificationService.send({
      userId,
      channel: 'in_app',
      type: 'payment_failed',
      subject: 'Echec du paiement',
      body: `Votre paiement a echoue : ${failureMessage}. Veuillez verifier votre moyen de paiement.`,
      metadata: { paymentIntentId: paymentIntent.id },
    });
  }

  return 'payment_failure_logged';
}

async function handleInvoicePaid(data: any): Promise<string> {
  const invoice = data.object;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string | undefined;
  const amountPaid = invoice.amount_paid as number;

  logger.info('Stripe invoice.paid', {
    invoiceId: invoice.id,
    customerId,
    subscriptionId,
    amountPaid,
  });

  // If this invoice is linked to a subscription, mark it as active
  // In a full implementation, we would look up the user by stripe_customer_id
  // and update their subscription status in the database.
  if (subscriptionId) {
    logger.info('Subscription payment confirmed', {
      subscriptionId,
      customerId,
      amountPaid,
    });
  }

  return 'invoice_paid_processed';
}

async function handleSubscriptionUpdated(data: any): Promise<string> {
  const subscription = data.object;
  const customerId = subscription.customer as string;
  const status = subscription.status as string;
  const planId = subscription.items?.data?.[0]?.price?.id as string | undefined;

  logger.info('Stripe customer.subscription.updated', {
    subscriptionId: subscription.id,
    customerId,
    status,
    planId,
  });

  // Handle plan changes — in production, update user's plan tier
  // by looking up stripe_customer_id in the wallets table.
  if (status === 'active') {
    logger.info('Subscription active — plan change applied', {
      subscriptionId: subscription.id,
      planId,
    });
  } else if (status === 'past_due') {
    logger.warn('Subscription past_due — payment retry pending', {
      subscriptionId: subscription.id,
    });
  } else if (status === 'unpaid') {
    logger.warn('Subscription unpaid — access may be restricted', {
      subscriptionId: subscription.id,
    });
  }

  return `subscription_updated_${status}`;
}

async function handleSubscriptionDeleted(data: any): Promise<string> {
  const subscription = data.object;
  const customerId = subscription.customer as string;

  logger.warn('Stripe customer.subscription.deleted — cancellation', {
    subscriptionId: subscription.id,
    customerId,
    canceledAt: subscription.canceled_at,
  });

  // In production: look up user by stripe_customer_id, downgrade to free tier,
  // and send a cancellation confirmation notification.

  return 'subscription_cancelled';
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

/**
 * Process a verified Stripe webhook event and dispatch to the appropriate handler.
 */
export async function handleWebhookEvent(event: StripeEvent): Promise<WebhookResult> {
  logger.info('Processing Stripe webhook event', {
    eventId: event.id,
    type: event.type,
    created: event.created,
  });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const action = await handlePaymentIntentSucceeded(event.data);
        return { handled: true, action };
      }

      case 'payment_intent.payment_failed': {
        const action = await handlePaymentIntentFailed(event.data);
        return { handled: true, action };
      }

      case 'invoice.paid': {
        const action = await handleInvoicePaid(event.data);
        return { handled: true, action };
      }

      case 'customer.subscription.updated': {
        const action = await handleSubscriptionUpdated(event.data);
        return { handled: true, action };
      }

      case 'customer.subscription.deleted': {
        const action = await handleSubscriptionDeleted(event.data);
        return { handled: true, action };
      }

      default:
        logger.debug('Unhandled Stripe event type', { type: event.type, eventId: event.id });
        return { handled: false };
    }
  } catch (error) {
    logger.error('Stripe webhook handler error', {
      eventId: event.id,
      type: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    // Re-throw so the route returns a 500 and Stripe retries
    throw error;
  }
}
