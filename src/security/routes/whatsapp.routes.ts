import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import {
  linkPhoneSchema,
  verifyPhoneSchema,
  whatsAppSettingsSchema,
} from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

export function createWhatsAppRouter(): Router {
  const router = Router();

  // ── Client Endpoints ──

  /**
   * POST /whatsapp/link-phone — Link a WhatsApp phone number to the user account.
   * Sends a verification code via WhatsApp.
   */
  router.post('/whatsapp/link-phone', verifyToken, validateBody(linkPhoneSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { phoneNumber } = req.body as { phoneNumber: string };

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const { whatsAppService } = await import('../../whatsapp/whatsapp.service');

    const link = await whatsAppRepository.linkPhone(userId, phoneNumber);

    // Send verification code via WhatsApp (or template)
    if (link.verificationCode && whatsAppService.isConfigured()) {
      await whatsAppService.sendTextMessage({
        to: phoneNumber,
        text: `Votre code de verification SARAH OS : ${link.verificationCode}\n\nCe code expire dans 10 minutes.`,
      });
    }

    res.status(201).json({
      message: 'Verification code sent to your WhatsApp',
      phoneNumber: link.phoneNumber,
      isVerified: link.isVerified,
      whatsappConfigured: whatsAppService.isConfigured(),
    });
  }));

  /**
   * POST /whatsapp/verify-phone — Verify the phone number with the 6-digit code.
   */
  router.post('/whatsapp/verify-phone', verifyToken, validateBody(verifyPhoneSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { code } = req.body as { code: string };

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const { whatsAppService } = await import('../../whatsapp/whatsapp.service');

    const verified = await whatsAppRepository.verifyPhone(userId, code);

    if (verified) {
      // Send welcome message
      const link = await whatsAppRepository.getPhoneLink(userId);
      if (link && whatsAppService.isConfigured()) {
        await whatsAppService.sendTextMessage({
          to: link.phoneNumber,
          text: `Bienvenue sur SARAH OS ! 🎉\n\nVotre numero WhatsApp est maintenant lie a votre compte. Vous pouvez commencer a me parler directement ici.\n\nEnvoyez "Bonjour" pour commencer !`,
        });
      }
    }

    res.json({
      verified,
      message: verified
        ? 'Phone number verified successfully'
        : 'Invalid or expired verification code',
    });
  }));

  /**
   * GET /whatsapp/status — Get WhatsApp link status for current user.
   */
  router.get('/whatsapp/status', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const { whatsAppService } = await import('../../whatsapp/whatsapp.service');

    const link = await whatsAppRepository.getPhoneLink(userId);
    const activeConv = link?.isVerified
      ? await whatsAppRepository.getActiveConversation(userId)
      : null;

    res.json({
      linked: !!link,
      phoneNumber: link?.phoneNumber ?? null,
      isVerified: link?.isVerified ?? false,
      preferredAgent: link?.preferredAgent ?? 'sarah',
      preferredLanguage: link?.preferredLanguage ?? 'fr-FR',
      enableVoiceResponses: link?.enableVoiceResponses ?? false,
      lastMessageAt: link?.lastMessageAt ?? null,
      activeConversation: activeConv ? {
        id: activeConv.id,
        messageCount: activeConv.messageCount,
        windowEnd: activeConv.windowEnd,
      } : null,
      whatsappConfigured: whatsAppService.isConfigured(),
    });
  }));

  /**
   * POST /whatsapp/settings — Update WhatsApp preferences.
   */
  router.post('/whatsapp/settings', verifyToken, validateBody(whatsAppSettingsSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const updated = await whatsAppRepository.updatePhoneSettings(userId, req.body);

    if (!updated) {
      res.status(404).json({ error: 'No WhatsApp phone linked' });
      return;
    }

    res.json({
      message: 'Settings updated',
      preferredAgent: updated.preferredAgent,
      preferredLanguage: updated.preferredLanguage,
      enableVoiceResponses: updated.enableVoiceResponses,
    });
  }));

  /**
   * DELETE /whatsapp/unlink-phone — Remove WhatsApp phone link.
   */
  router.delete('/whatsapp/unlink-phone', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    await whatsAppRepository.unlinkPhone(userId);
    res.json({ message: 'WhatsApp phone unlinked' });
  }));

  /**
   * GET /whatsapp/conversations — List user's WhatsApp conversations.
   */
  router.get('/whatsapp/conversations', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const limit = Math.min(Number(req.query['limit'] ?? 20), 100);
    const offset = Number(req.query['offset'] ?? 0);

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const conversations = await whatsAppRepository.listConversations(userId, limit, offset);
    res.json({ conversations });
  }));

  /**
   * GET /whatsapp/conversations/:id/messages — Get messages for a conversation.
   */
  router.get('/whatsapp/conversations/:id/messages', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const conversationId = req.params['id'] as string;
    const limit = Math.min(Number(req.query['limit'] ?? 50), 200);

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const messages = await whatsAppRepository.getConversationMessages(conversationId, limit);
    res.json({ messages });
  }));

  // ── Admin Endpoints ──

  /**
   * GET /whatsapp/admin/stats — Get platform WhatsApp statistics.
   */
  router.get('/whatsapp/admin/stats', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }

    const { whatsAppRepository } = await import('../../whatsapp/whatsapp.repository');
    const { whatsAppService } = await import('../../whatsapp/whatsapp.service');

    const stats = await whatsAppRepository.getStats();
    res.json({
      ...stats,
      whatsappConfigured: whatsAppService.isConfigured(),
    });
  }));

  return router;
}
