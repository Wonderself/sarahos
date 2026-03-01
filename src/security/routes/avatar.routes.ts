import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody } from '../validation.middleware';
import {
  conversationStartSchema,
  conversationTurnSchema,
  conversationEndSchema,
  asrTranscribeSchema,
  ttsSynthesizeSchema,
  telephonyCallSchema,
  personaSwitchSchema,
} from '../validation.schemas';
import { conversationManager, asrService, ttsService, telephonyService, personaManager } from '../../avatar/services';
import { avatarRegistry } from '../../avatar/config/avatar-registry';

export function createAvatarRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  // Conversation endpoints
  router.post('/avatar/conversation/start', requireRole('operator', 'system'), validateBody(conversationStartSchema), async (req, res) => {
    const { sessionId, avatarBase, personaId, config } = req.body as {
      sessionId: string; avatarBase: 'sarah' | 'emmanuel'; personaId: string; config?: Record<string, unknown>;
    };
    const session = await conversationManager.startSession(sessionId, avatarBase, personaId, config);
    res.json(session);
  });

  router.post('/avatar/conversation/turn', requireRole('operator', 'system'), validateBody(conversationTurnSchema), async (req, res) => {
    const { sessionId, textInput } = req.body as { sessionId: string; textInput?: string };
    try {
      const result = await conversationManager.processTurn({ sessionId, textInput });
      res.json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/avatar/conversation/end', requireRole('operator', 'system'), validateBody(conversationEndSchema), async (req, res) => {
    const { sessionId } = req.body as { sessionId: string };
    await conversationManager.endSession(sessionId);
    res.json({ status: 'ended', sessionId });
  });

  router.get('/avatar/conversations/active', requireRole('operator', 'system'), (_req, res) => {
    res.json(conversationManager.getActiveSessions());
  });

  // ASR endpoint
  router.post('/avatar/asr/transcribe', requireRole('operator', 'system'), validateBody(asrTranscribeSchema), async (req, res) => {
    const { sessionId, text } = req.body as { sessionId: string; text: string };
    const result = await asrService.transcribe({
      sessionId,
      audioBuffer: Buffer.from(text),
      config: asrService.getConfigForAvatar('sarah'),
    });
    res.json(result);
  });

  // TTS endpoint
  router.post('/avatar/tts/synthesize', requireRole('operator', 'system'), validateBody(ttsSynthesizeSchema), async (req, res) => {
    const { sessionId, text } = req.body as { sessionId: string; text: string };
    const result = await ttsService.synthesize({
      sessionId,
      text,
      config: ttsService.buildConfigFromVoiceProfile({
        provider: 'telnyx', voiceId: 'sarah-fr-female-01', language: 'fr-FR', speed: 1.0, pitch: 1.0, style: 'warm-professional',
      }),
    });
    res.json({
      sessionId: result.sessionId,
      durationMs: result.durationMs,
      characterCount: result.characterCount,
      cached: result.cached,
    });
  });

  // Telephony endpoints
  router.post('/avatar/telephony/call', requireRole('operator', 'system'), validateBody(telephonyCallSchema), async (req, res) => {
    const { to, avatarBase, sessionId } = req.body as { to: string; avatarBase: 'sarah' | 'emmanuel'; sessionId: string };
    const call = await telephonyService.initiateOutboundCall({ to, avatarBase, sessionId });
    res.json(call);
  });

  router.post('/avatar/telephony/webhook', requireRole('operator', 'system'), async (req, res) => {
    const call = await telephonyService.handleIncomingCall(req.body);
    const twiml = telephonyService.generateTwiMLResponse(call.avatarBase, 'Bonjour, je suis Sarah. Comment puis-je vous aider ?');
    res.type('text/xml').send(twiml);
  });

  router.get('/avatar/telephony/calls', requireRole('operator', 'system'), (_req, res) => {
    res.json({ active: telephonyService.getActiveCalls(), history: telephonyService.getCallHistory() });
  });

  // Persona endpoints
  router.get('/avatar/personas', requireRole('operator', 'system'), (_req, res) => {
    res.json(personaManager.getAllPersonas());
  });

  router.post('/avatar/personas/switch', requireRole('operator', 'system'), validateBody(personaSwitchSchema), async (req, res) => {
    const result = await personaManager.switchPersona(req.body);
    res.json(result);
  });

  // Pipeline metrics
  router.get('/avatar/pipeline/metrics', requireRole('operator', 'system'), (_req, res) => {
    res.json(conversationManager.getMetrics());
  });

  // Avatar presets & clients
  router.get('/avatars/presets', requireRole('operator', 'system'), (_req, res) => {
    res.json(avatarRegistry.getAllPresets());
  });

  router.get('/avatars/clients', requireRole('operator', 'system'), (_req, res) => {
    res.json({
      total: avatarRegistry.getActiveClientCount(),
      byBase: {
        sarah: avatarRegistry.getClientConfigsByBase('sarah').length,
        emmanuel: avatarRegistry.getClientConfigsByBase('emmanuel').length,
      },
    });
  });

  return router;
}
