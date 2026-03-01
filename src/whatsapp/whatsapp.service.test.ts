// Mock config
jest.mock('../utils/config', () => ({
  config: {
    WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
    WHATSAPP_ACCESS_TOKEN: 'test-access-token',
    WHATSAPP_API_VERSION: 'v18.0',
    WHATSAPP_VERIFY_TOKEN: 'test-verify-token',
    WEBHOOK_BASE_URL: 'http://localhost:3010',
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { WhatsAppService } from './whatsapp.service';

describe('WhatsAppService', () => {
  let service: WhatsAppService;

  beforeEach(() => {
    service = new WhatsAppService();
    jest.restoreAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when phoneNumberId and accessToken are set', () => {
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe('sendTextMessage', () => {
    it('should send text message and return message ID', async () => {
      const mockResponse = {
        messages: [{ id: 'wamid.test123' }],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const messageId = await service.sendTextMessage({
        to: '+33612345678',
        text: 'Bonjour!',
      });

      expect(messageId).toBe('wamid.test123');
      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v18.0/test-phone-id/messages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"messaging_product":"whatsapp"'),
        }),
      );
    });

    it('should return null on API error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Invalid phone' } }),
      });

      const messageId = await service.sendTextMessage({
        to: '+invalid',
        text: 'test',
      });

      expect(messageId).toBeNull();
    });

    it('should return null on network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const messageId = await service.sendTextMessage({
        to: '+33612345678',
        text: 'test',
      });

      expect(messageId).toBeNull();
    });
  });

  describe('sendAudioMessage', () => {
    it('should send audio message with media ID', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ messages: [{ id: 'wamid.audio123' }] }),
      });

      const messageId = await service.sendAudioMessage({
        to: '+33612345678',
        mediaId: 'media-123',
      });

      expect(messageId).toBe('wamid.audio123');
    });
  });

  describe('downloadMedia', () => {
    it('should download media in two steps (get URL then download)', async () => {
      const mockBuffer = new ArrayBuffer(100);

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ url: 'https://media.whatsapp.com/file123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(mockBuffer),
        });

      const buffer = await service.downloadMedia('media-123');

      expect(buffer).not.toBeNull();
      expect(buffer!.length).toBe(100);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should return null if media URL fetch fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Not found' } }),
      });

      const buffer = await service.downloadMedia('invalid-id');
      expect(buffer).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should call mark as read endpoint', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await service.markAsRead('wamid.test123');

      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v18.0/test-phone-id/messages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"status":"read"'),
        }),
      );
    });
  });

  describe('uploadMedia', () => {
    it('should upload media and return media ID', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'media-uploaded-123' }),
      });

      const mediaId = await service.uploadMedia(Buffer.from('test-audio'), 'audio/mpeg');
      expect(mediaId).toBe('media-uploaded-123');
    });
  });
});
