import express from 'express';
import request from 'supertest';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    WHATSAPP_VERIFY_TOKEN: 'test-verify-token',
    WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
    WHATSAPP_ACCESS_TOKEN: 'test-token',
    WHATSAPP_API_VERSION: 'v18.0',
    WEBHOOK_BASE_URL: 'http://localhost:3010',
  },
}));

jest.mock('../../whatsapp/whatsapp-pipeline.service', () => ({
  whatsAppPipeline: {
    processIncomingMessage: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../whatsapp/whatsapp.repository', () => ({
  whatsAppRepository: {
    updateMessageStatus: jest.fn().mockResolvedValue(undefined),
  },
}));

import { createWhatsAppWebhookRouter } from './whatsapp-webhook.routes';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(createWhatsAppWebhookRouter());
  return app;
}

describe('WhatsApp Webhook Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /webhook/whatsapp — Verification', () => {
    it('should verify webhook with correct token', async () => {
      const response = await request(app)
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-verify-token',
          'hub.challenge': 'challenge-string-123',
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe('challenge-string-123');
    });

    it('should reject webhook with wrong token', async () => {
      const response = await request(app)
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'challenge-123',
        });

      expect(response.status).toBe(403);
    });

    it('should reject webhook with wrong mode', async () => {
      const response = await request(app)
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'unsubscribe',
          'hub.verify_token': 'test-verify-token',
          'hub.challenge': 'challenge-123',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /webhook/whatsapp — Messages', () => {
    it('should respond 200 immediately for valid payload', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: '123',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15551234567', phone_number_id: 'test-phone-id' },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '33612345678' }],
              messages: [{
                from: '33612345678',
                id: 'wamid.test123',
                timestamp: '1234567890',
                type: 'text',
                text: { body: 'Bonjour' },
              }],
            },
            field: 'messages',
          }],
        }],
      };

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send(payload);

      expect(response.status).toBe(200);
    });

    it('should respond 200 for non-whatsapp object', async () => {
      const response = await request(app)
        .post('/webhook/whatsapp')
        .send({ object: 'other' });

      expect(response.status).toBe(200);
    });

    it('should handle status updates', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: '123',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15551234567', phone_number_id: 'test-phone-id' },
              statuses: [{
                id: 'wamid.status123',
                status: 'delivered',
                timestamp: '1234567890',
                recipient_id: '33612345678',
              }],
            },
            field: 'messages',
          }],
        }],
      };

      const response = await request(app)
        .post('/webhook/whatsapp')
        .send(payload);

      expect(response.status).toBe(200);
    });
  });
});
