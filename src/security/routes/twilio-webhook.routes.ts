import { Router, type Request, type Response, type NextFunction } from 'express';
import twilio from 'twilio';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';

/**
 * Middleware to validate Twilio request signatures.
 * Skips validation in dev when TWILIO_AUTH_TOKEN is not configured.
 */
function validateTwilioSignature(req: Request, res: Response, next: NextFunction): void {
  const authToken = config.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    if (process.env['NODE_ENV'] === 'production') {
      logger.error('TWILIO_AUTH_TOKEN not set in production — rejecting webhook');
      res.status(503).send('Service Unavailable');
      return;
    }
    logger.warn('TWILIO_AUTH_TOKEN not set — skipping webhook signature validation (dev mode)');
    next();
    return;
  }

  const signature = req.headers['x-twilio-signature'] as string | undefined;
  if (!signature) {
    logger.warn('Missing X-Twilio-Signature header', { path: req.path, ip: req.ip });
    res.status(403).send('Forbidden');
    return;
  }

  const webhookUrl = config.TWILIO_WEBHOOK_URL
    ? `${config.TWILIO_WEBHOOK_URL}${req.originalUrl}`
    : `${req.protocol}://${req.get('host') ?? 'localhost'}${req.originalUrl}`;

  const isValid = twilio.validateRequest(authToken, signature, webhookUrl, req.body);
  if (!isValid) {
    logger.warn('Invalid Twilio webhook signature', { path: req.path, ip: req.ip });
    res.status(403).send('Forbidden');
    return;
  }

  next();
}

export function createTwilioWebhookRouter(): Router {
  const router = Router();

  // Apply signature validation only to Twilio webhook paths (not all routes)
  router.use('/webhooks/twilio', validateTwilioSignature);

  // Incoming voice call
  router.post('/webhooks/twilio/voice', (req, res) => {
    logger.info('Twilio voice webhook received', { from: req.body.From, to: req.body.To, callSid: req.body.CallSid });

    // Return TwiML greeting
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR" voice="Polly.Lea">Bonjour, bienvenue chez Freenzy.io. Comment puis-je vous aider ?</Say>
  <Gather input="speech" language="fr-FR" timeout="5" action="/webhooks/twilio/voice/gather">
    <Say language="fr-FR" voice="Polly.Lea">Dites quelque chose apres le bip.</Say>
  </Gather>
  <Say language="fr-FR" voice="Polly.Lea">Je n'ai rien entendu. Au revoir.</Say>
</Response>`);
  });

  // Voice gather result
  router.post('/webhooks/twilio/voice/gather', (req, res) => {
    const speechResult = req.body.SpeechResult;
    logger.info('Twilio voice gather result', { speechResult, callSid: req.body.CallSid });

    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR" voice="Polly.Lea">Merci pour votre message. Un agent vous recontactera bientot. Au revoir.</Say>
  <Hangup/>
</Response>`);
  });

  // Voice status callback
  router.post('/webhooks/twilio/voice/status', (req, res) => {
    logger.info('Twilio voice status', { callSid: req.body.CallSid, status: req.body.CallStatus });
    res.sendStatus(200);
  });

  // Incoming SMS
  router.post('/webhooks/twilio/sms', (req, res) => {
    logger.info('Twilio SMS received', { from: req.body.From, body: req.body.Body?.substring(0, 100) });

    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Merci pour votre message. Freenzy.io va le traiter et vous repondre bientot.</Message>
</Response>`);
  });

  // SMS delivery status
  router.post('/webhooks/twilio/sms/status', (req, res) => {
    logger.info('Twilio SMS status', { messageSid: req.body.MessageSid, status: req.body.MessageStatus });
    res.sendStatus(200);
  });

  return router;
}
