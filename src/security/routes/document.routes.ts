import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import { validateUuidParam } from '../validation.middleware';
import type { AuthenticatedRequest } from '../auth.types';
import { documentRepository } from '../../users/document.repository';
import { extractText, extractTextWithSections, estimateTokenCount, isAllowedMimeType, getFileTypeFromExtension, MAX_FILE_SIZE, MAX_USER_STORAGE } from '../../utils/text-extractor';
import { logger } from '../../utils/logger';

function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.userId ?? req.user?.sub ?? null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (isAllowedMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporte'));
    }
  },
});

export function createDocumentRouter(): Router {
  const router = Router();

  // ── Preview document (extract without saving) ──
  router.post('/documents/preview', verifyToken, upload.single('file'), asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'Aucun fichier fourni' }); return; }

    try {
      const result = await extractTextWithSections(file.buffer, file.mimetype, file.originalname);
      res.json({
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        sections: result.sections,
        totalTokens: result.totalTokens,
        summary: `${result.sections.length} section(s), ~${result.totalTokens} tokens`,
      });
    } catch (err) {
      logger.error('Document preview failed', { filename: file.originalname, error: (err as Error).message });
      res.status(500).json({ error: 'Erreur lors de l\'extraction du texte' });
    }
  }));

  // ── Upload document ──
  router.post('/documents/upload', verifyToken, upload.single('file'), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const file = req.file;
    if (!file) { res.status(400).json({ error: 'Aucun fichier fourni' }); return; }

    // Check storage limit
    const storage = await documentRepository.getStorageUsed(userId);
    if (storage.totalBytes + file.size > MAX_USER_STORAGE) {
      res.status(413).json({ error: 'Limite de stockage atteinte (50 Mo max)' });
      return;
    }

    const fileType = getFileTypeFromExtension(file.originalname);
    if (!fileType) {
      res.status(400).json({ error: 'Extension de fichier non reconnue' });
      return;
    }

    // Extract text — with optional section selection
    let contentText: string | null = null;
    let tokenEstimate = 0;
    try {
      const body = req.body as Record<string, string>;
      const selectedSections = body.selectedSections ? JSON.parse(body.selectedSections) as number[] : null;

      if (selectedSections) {
        // Extract with sections and keep only selected ones
        const result = await extractTextWithSections(file.buffer, file.mimetype, file.originalname);
        const kept = result.sections.filter((_, i) => selectedSections.includes(i));
        contentText = kept.map(s => s.content).join('\n\n');
        tokenEstimate = estimateTokenCount(contentText);
      } else {
        contentText = await extractText(file.buffer, file.mimetype, file.originalname);
        tokenEstimate = estimateTokenCount(contentText);
      }
    } catch (err) {
      logger.warn('Document text extraction failed', { filename: file.originalname, error: (err as Error).message });
    }

    const agentContext = (req.body as Record<string, string>).agentContext ?? 'general';

    const doc = await documentRepository.create({
      userId,
      agentContext,
      originalFilename: file.originalname,
      fileType,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      contentText,
      tokenEstimate,
    });

    if (!doc) {
      res.status(500).json({ error: 'Erreur lors de la sauvegarde du document' });
      return;
    }

    logger.info('Document uploaded', { userId, docId: doc.id, filename: file.originalname, tokens: tokenEstimate });
    res.status(201).json(doc);
  }));

  // ── List user documents ──
  router.get('/documents', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const context = (req.query as Record<string, string>).context;
    const docs = await documentRepository.getByUser(userId, context);
    const storage = await documentRepository.getStorageUsed(userId);

    res.json({ documents: docs, storage });
  }));

  // ── Storage stats (MUST be before /documents/:id to avoid route shadowing) ──
  router.get('/documents/storage', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const storage = await documentRepository.getStorageUsed(userId);
    res.json({ ...storage, maxBytes: MAX_USER_STORAGE });
  }));

  // ── Get single document ──
  router.get('/documents/:id', verifyToken, validateUuidParam('id'), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const doc = await documentRepository.getById(String(req.params['id']), userId);
    if (!doc) { res.status(404).json({ error: 'Document non trouve' }); return; }

    res.json(doc);
  }));

  // ── Delete document ──
  router.delete('/documents/:id', verifyToken, validateUuidParam('id'), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const deleted = await documentRepository.delete(String(req.params['id']), userId);
    if (!deleted) { res.status(404).json({ error: 'Document non trouve' }); return; }

    res.json({ success: true });
  }));

  return router;
}
