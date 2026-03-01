// Mock dependencies
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
    WHATSAPP_ACCESS_TOKEN: 'test-access-token',
    WHATSAPP_API_VERSION: 'v18.0',
    WHATSAPP_VERIFY_TOKEN: 'test-verify',
    WEBHOOK_BASE_URL: 'http://localhost:3010',
  },
}));

jest.mock('./whatsapp.service', () => ({
  whatsAppService: {
    isConfigured: jest.fn().mockReturnValue(true),
    sendTextMessage: jest.fn().mockResolvedValue('wamid.response123'),
    sendAudioMessage: jest.fn().mockResolvedValue('wamid.audio123'),
    downloadMedia: jest.fn().mockResolvedValue(Buffer.from('audio-data')),
    uploadMedia: jest.fn().mockResolvedValue('media-uploaded-123'),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    sendTemplateMessage: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('./whatsapp.repository', () => ({
  whatsAppRepository: {
    findUserByPhone: jest.fn(),
    getActiveConversation: jest.fn(),
    createConversation: jest.fn(),
    createMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    updateConversationStats: jest.fn(),
    updateLastMessage: jest.fn(),
    getRecentMessagesForContext: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../billing/llm-proxy.service', () => ({
  llmProxyService: {
    processRequest: jest.fn().mockResolvedValue({
      content: 'Bonjour ! Je suis Sarah.',
      model: 'claude-sonnet-4-20250514',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      costCredits: 1000,
      billedCredits: 1000,
      durationMs: 500,
    }),
  },
}));

jest.mock('../billing/wallet.service', () => ({
  walletService: {
    hasBalance: jest.fn().mockResolvedValue(true),
    withdraw: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../avatar/services/asr/asr.service', () => ({
  asrService: {
    transcribe: jest.fn().mockResolvedValue({
      sessionId: 'test',
      provider: 'deepgram',
      transcript: 'Bonjour, comment ca va ?',
      confidence: 0.95,
      language: 'fr-FR',
      durationMs: 3000,
      latencyMs: 200,
    }),
  },
}));

jest.mock('../avatar/services/tts/tts.service', () => ({
  ttsService: {
    synthesize: jest.fn().mockResolvedValue({
      sessionId: 'test',
      provider: 'deepgram',
      audioBuffer: Buffer.from('tts-audio'),
      durationMs: 2000,
      characterCount: 50,
      latencyMs: 150,
      cached: false,
    }),
  },
}));

jest.mock('../billing/pricing', () => ({
  calculateSTTCost: jest.fn().mockReturnValue(50000),
  calculateTTSCost: jest.fn().mockReturnValue(30000),
}));

import { WhatsAppPipelineService } from './whatsapp-pipeline.service';
import { whatsAppService } from './whatsapp.service';
import { whatsAppRepository } from './whatsapp.repository';
import { walletService } from '../billing/wallet.service';
import type { IncomingWhatsAppMessage } from './whatsapp.types';

describe('WhatsAppPipelineService', () => {
  let pipeline: WhatsAppPipelineService;

  const textMessage: IncomingWhatsAppMessage = {
    from: '33612345678',
    id: 'wamid.incoming123',
    timestamp: '1234567890',
    type: 'text',
    text: { body: 'Bonjour Sarah !' },
  };

  const audioMessage: IncomingWhatsAppMessage = {
    from: '33612345678',
    id: 'wamid.audio456',
    timestamp: '1234567890',
    type: 'audio',
    audio: { id: 'audio-media-id', mime_type: 'audio/ogg' },
  };

  beforeEach(() => {
    pipeline = new WhatsAppPipelineService();
    jest.clearAllMocks();
  });

  describe('processIncomingMessage — text', () => {
    it('should process text message from registered user', async () => {
      jest.mocked(whatsAppRepository.findUserByPhone).mockResolvedValue({
        id: 'link-1',
        userId: 'user-1',
        phoneNumber: '+33612345678',
        phoneNumberNormalized: '33612345678',
        isVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
        verificationAttempts: 0,
        preferredAgent: 'sarah',
        preferredLanguage: 'fr-FR',
        enableVoiceResponses: false,
        isActive: true,
        lastMessageAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.mocked(whatsAppRepository.getActiveConversation).mockResolvedValue(null);
      jest.mocked(whatsAppRepository.createConversation).mockResolvedValue({
        id: 'conv-1',
        userId: 'user-1',
        phoneNumber: '+33612345678',
        waConversationId: null,
        status: 'active',
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 86400000),
        messageCount: 0,
        totalTokens: 0,
        totalBilledCredits: 0,
        agentName: 'sarah',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await pipeline.processIncomingMessage(textMessage, 'Test User');

      // Should save inbound message
      expect(whatsAppRepository.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'inbound',
          messageType: 'text',
          content: 'Bonjour Sarah !',
        }),
      );

      // Should send response
      expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '33612345678',
          text: 'Bonjour ! Je suis Sarah.',
        }),
      );

      // Should update stats
      expect(whatsAppRepository.updateConversationStats).toHaveBeenCalled();
      expect(whatsAppRepository.updateLastMessage).toHaveBeenCalledWith('user-1');
    });

    it('should handle unregistered user', async () => {
      jest.mocked(whatsAppRepository.findUserByPhone).mockResolvedValue(null);

      await pipeline.processIncomingMessage(textMessage, 'Unknown');

      // Should send registration message
      expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '33612345678',
          text: expect.stringContaining('inscrivez-vous'),
        }),
      );
    });

    it('should handle insufficient balance', async () => {
      jest.mocked(whatsAppRepository.findUserByPhone).mockResolvedValue({
        id: 'link-1',
        userId: 'user-1',
        phoneNumber: '+33612345678',
        phoneNumberNormalized: '33612345678',
        isVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
        verificationAttempts: 0,
        preferredAgent: 'sarah',
        preferredLanguage: 'fr-FR',
        enableVoiceResponses: false,
        isActive: true,
        lastMessageAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.mocked(whatsAppRepository.getActiveConversation).mockResolvedValue({
        id: 'conv-1', userId: 'user-1', phoneNumber: '+33612345678',
        waConversationId: null, status: 'active',
        windowStart: new Date(), windowEnd: new Date(Date.now() + 86400000),
        messageCount: 0, totalTokens: 0, totalBilledCredits: 0,
        agentName: 'sarah', metadata: {},
        createdAt: new Date(), updatedAt: new Date(),
      });

      jest.mocked(walletService.hasBalance).mockResolvedValue(false);

      await pipeline.processIncomingMessage(textMessage, 'Test');

      expect(whatsAppService.sendTextMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('solde'),
        }),
      );
    });
  });

  describe('processIncomingMessage — audio', () => {
    it('should process voice note from registered user', async () => {
      jest.mocked(walletService.hasBalance).mockResolvedValue(true);
      jest.mocked(whatsAppRepository.findUserByPhone).mockResolvedValue({
        id: 'link-1', userId: 'user-1', phoneNumber: '+33612345678',
        phoneNumberNormalized: '33612345678', isVerified: true,
        verificationCode: null, verificationExpiresAt: null, verificationAttempts: 0,
        preferredAgent: 'sarah', preferredLanguage: 'fr-FR', enableVoiceResponses: false,
        isActive: true, lastMessageAt: null, createdAt: new Date(), updatedAt: new Date(),
      });

      jest.mocked(whatsAppRepository.getActiveConversation).mockResolvedValue({
        id: 'conv-1', userId: 'user-1', phoneNumber: '+33612345678',
        waConversationId: null, status: 'active',
        windowStart: new Date(), windowEnd: new Date(Date.now() + 86400000),
        messageCount: 0, totalTokens: 0, totalBilledCredits: 0,
        agentName: 'sarah', metadata: {},
        createdAt: new Date(), updatedAt: new Date(),
      });

      await pipeline.processIncomingMessage(audioMessage, 'Test User');

      // Should download media
      expect(whatsAppService.downloadMedia).toHaveBeenCalledWith('audio-media-id');

      // Should save inbound audio message with transcription
      expect(whatsAppRepository.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'inbound',
          messageType: 'audio',
          transcription: 'Bonjour, comment ca va ?',
        }),
      );

      // Should send text response
      expect(whatsAppService.sendTextMessage).toHaveBeenCalled();
    });
  });
});
