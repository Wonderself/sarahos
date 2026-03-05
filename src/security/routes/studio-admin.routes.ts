import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { dbClient } from '../../infra/database/db-client';
import { logger } from '../../utils/logger';
import type { AuthenticatedRequest } from '../auth.types';

const FAL_KEY = process.env['FAL_KEY'] ?? '';
const FAL_RUN = 'https://fal.run';
const FAL_QUEUE = 'https://queue.fal.run';

// Dimension presets (mirrors /api/photo for consistency)
const DIM: Record<string, { width: number; height: number }> = {
  square:          { width: 1024, height: 1024 },
  landscape:       { width: 1344, height: 768 },
  portrait:        { width: 768,  height: 1344 },
  'social-story':  { width: 768,  height: 1344 },
  'social-post':   { width: 1024, height: 1024 },
  banner:          { width: 1536, height: 512 },
  'youtube-thumb': { width: 1280, height: 720 },
  pinterest:       { width: 1000, height: 1500 },
  linkedin:        { width: 1200, height: 627 },
  'ig-portrait':   { width: 1080, height: 1350 },
};

// Style presets (mirrors /api/photo)
const STYLE: Record<string, string> = {
  realistic:        'photorealistic, high detail, 8k',
  illustration:     'digital illustration, clean lines, vibrant colors',
  'flat-design':    'flat design, minimal, geometric, vector style',
  watercolor:       'watercolor painting, soft edges, artistic',
  '3d-render':      '3D render, octane render, volumetric lighting',
  minimalist:       'minimalist, clean, simple composition, white space',
  cinematic:        'cinematic, dramatic lighting, film grain, movie still',
  portrait:         'professional portrait photography, studio lighting',
  bw:               'black and white photography, high contrast, monochrome',
  'film-grain':     'film photography, Kodak Portra 400, grain, warm faded tones',
  polaroid:         'instant polaroid photo, slightly saturated, warm golden light, retro',
  vintage:          'vintage sepia tones, aged film, faded colors, nostalgic',
  'oil-painting':   'oil painting, visible brush strokes, classical chiaroscuro',
  'pencil-sketch':  'pencil drawing, graphite, detailed hatching, paper texture',
  impressionist:    'impressionist painting, visible color touches, diffuse light, Monet style',
  surrealist:       'surrealist art, dreamlike, impossible geometry, Salvador Dali style',
  'pop-art':        'pop art, Andy Warhol style, halftone dots, neon vivid colors',
  'pixel-art':      'pixel art, 16-bit retro gaming, limited palette',
  comics:           'comic book style, bold ink outlines, action lines',
  'neon-cyberpunk': 'cyberpunk neon, pink and blue neon signs, holographic, futuristic',
  anime:            'anime style, Japanese animation, Studio Ghibli inspired',
  'movie-poster':   'movie poster style, dramatic lighting, cinematic composition',
  gothic:           'gothic atmosphere, dark, moonlight, fog, mysterious',
  'art-deco':       'art deco style, 1920s, gold and black geometric patterns',
  vaporwave:        'vaporwave aesthetic, Greek statue, palm trees, purple pink sunset',
  'food-photo':     'professional food photography, natural side lighting, magazine quality',
  architecture:     'real estate photography, bright interior, wide angle lens',
  'cartoon-avatar': 'modern 3D cartoon style, Pixar quality, soft studio lighting',
};

export function createStudioAdminRouter(): Router {
  const router = Router();

  // All studio admin routes require auth + admin role
  router.use(verifyToken);

  // ── GET /admin/studio/api-status ─────────────────────────────────────────
  router.get('/admin/studio/api-status', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    if (!FAL_KEY) {
      res.json({ configured: false, status: 'missing_key', latency: null });
      return;
    }
    const start = Date.now();
    try {
      const r = await fetch(`${FAL_RUN}/fal-ai/flux/schnell`, {
        method: 'POST',
        headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'ping',
          image_size: { width: 256, height: 256 },
          num_inference_steps: 1,
          num_images: 1,
          enable_safety_checker: false,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const latency = Date.now() - start;
      res.json({ configured: true, status: r.ok ? 'ok' : 'error', latency, httpStatus: r.status });
    } catch (e) {
      res.json({
        configured: true,
        status: 'unreachable',
        latency: Date.now() - start,
        error: e instanceof Error ? e.message : 'timeout',
      });
    }
  });

  // ── GET /admin/studio/config ─────────────────────────────────────────────
  router.get('/admin/studio/config', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const { rows } = await dbClient.query<{
        model_id: string; type: string; label: string; credits: number; enabled: boolean;
      }>('SELECT * FROM studio_model_config ORDER BY type, label');
      res.json(rows);
    } catch (e) {
      logger.error('studio config fetch error', { error: e });
      res.status(500).json({ error: 'DB error' });
    }
  });

  // ── PATCH /admin/studio/config/:modelId ──────────────────────────────────
  router.patch('/admin/studio/config/:modelId', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const modelId = decodeURIComponent(String(req.params['modelId']));
    const { enabled, credits, label } = req.body as { enabled?: boolean; credits?: number; label?: string };
    if (credits !== undefined && (typeof credits !== 'number' || credits < 0 || credits > 9999)) {
      res.status(400).json({ error: 'credits must be 0–9999' });
      return;
    }
    try {
      const result = await dbClient.query(
        `UPDATE studio_model_config
         SET enabled    = COALESCE($1, enabled),
             credits    = COALESCE($2, credits),
             label      = COALESCE($3, label),
             updated_at = NOW(),
             updated_by = $4
         WHERE model_id = $5`,
        [enabled ?? null, credits ?? null, label ?? null, req.user?.userId ?? null, modelId],
      );
      if (result.rowCount === 0) { res.status(404).json({ error: 'Model not found' }); return; }
      res.json({ ok: true });
    } catch (e) {
      logger.error('studio config update error', { error: e });
      res.status(500).json({ error: 'DB error' });
    }
  });

  // ── GET /admin/studio/history ────────────────────────────────────────────
  router.get('/admin/studio/history', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const type = String(req.query['type'] ?? '');
    const limit = Math.min(Number(req.query['limit'] ?? 20), 200);
    const offset = Number(req.query['offset'] ?? 0);
    try {
      const { rows } = await dbClient.query(
        `SELECT sg.id, sg.type, sg.workflow, sg.provider, sg.cost_credits,
                sg.status, sg.metadata, sg.created_at,
                u.email AS user_email, u.display_name AS user_name
         FROM studio_generations sg
         LEFT JOIN users u ON sg.user_id = u.id
         WHERE ($1 = '' OR sg.type = $1)
         ORDER BY sg.created_at DESC
         LIMIT $2 OFFSET $3`,
        [type, limit, offset],
      );
      const countResult = await dbClient.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM studio_generations WHERE ($1 = '' OR type = $1)`,
        [type],
      );
      res.json({ generations: rows, total: Number(countResult.rows[0]?.total ?? 0), limit, offset });
    } catch (e) {
      logger.error('studio history fetch error', { error: e });
      res.status(500).json({ error: 'DB error' });
    }
  });

  // ── POST /admin/studio/generate/photo ────────────────────────────────────
  router.post('/admin/studio/generate/photo', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    if (!FAL_KEY) { res.status(503).json({ error: 'FAL_KEY not configured' }); return; }

    const { prompt, model = 'fal-ai/flux/schnell', style, dimensions, negativePrompt, hd } = req.body as {
      prompt?: string; model?: string; style?: string; dimensions?: string;
      negativePrompt?: string; hd?: boolean;
    };
    if (!prompt?.trim()) { res.status(400).json({ error: 'prompt is required' }); return; }

    const falModel = hd ? 'fal-ai/flux/dev' : (model || 'fal-ai/flux/schnell');
    const dims = DIM[dimensions ?? 'square'] ?? DIM['square']!;
    const styleText = style ? STYLE[style] : undefined;
    const enhancedPrompt = styleText ? `${prompt}, ${styleText}` : prompt;
    const fullPrompt = negativePrompt ? `${enhancedPrompt}. Avoid: ${negativePrompt}` : enhancedPrompt;
    const inferenceSteps = hd ? 28 : 4;

    // Determine credits from DB config, fall back to defaults
    let credits = hd ? 12 : 8;
    try {
      const r = await dbClient.query<{ credits: number }>(
        'SELECT credits FROM studio_model_config WHERE model_id = $1', [falModel],
      );
      if (r.rows[0]) credits = Number(r.rows[0].credits);
    } catch { /* use defaults */ }

    const start = Date.now();
    try {
      const r = await fetch(`${FAL_RUN}/${falModel}`, {
        method: 'POST',
        headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: { width: dims.width, height: dims.height },
          num_inference_steps: inferenceSteps,
          num_images: 1,
          enable_safety_checker: false,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!r.ok) {
        const errText = await r.text();
        res.status(r.status).json({ error: `fal.ai error: ${errText}` });
        return;
      }

      const data = await r.json() as { images?: Array<{ url: string }>; error?: string };
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) { res.status(500).json({ error: 'No image returned by fal.ai' }); return; }

      const duration = Date.now() - start;

      // Track in DB (non-blocking)
      dbClient.query(
        `INSERT INTO studio_generations
          (user_id, type, model, workflow, prompt, style, dimensions, result_url, status, cost, duration_ms, meta)
         VALUES ($1, 'photo', $2, 'admin-test', $3, $4, $5, $6, 'completed', $7, $8, $9)`,
        [req.user?.userId ?? null, falModel, prompt, style ?? null, dimensions ?? null, imageUrl, credits, duration, JSON.stringify({ adminTest: true })],
      ).catch(err => logger.warn('studio photo tracking failed', { error: err }));

      res.json({ imageUrl, model: falModel, duration, credits, width: dims.width, height: dims.height });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Generation failed' });
    }
  });

  // ── POST /admin/studio/generate/video ────────────────────────────────────
  router.post('/admin/studio/generate/video', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    if (!FAL_KEY) { res.status(503).json({ error: 'FAL_KEY not configured' }); return; }

    const { prompt, model = 'fal-ai/ltx-video' } = req.body as { prompt?: string; model?: string };
    if (!prompt?.trim()) { res.status(400).json({ error: 'prompt is required' }); return; }

    let credits = 20;
    try {
      const r = await dbClient.query<{ credits: number }>(
        'SELECT credits FROM studio_model_config WHERE model_id = $1', [model],
      );
      if (r.rows[0]) credits = Number(r.rows[0].credits);
    } catch { /* use defaults */ }

    try {
      const r = await fetch(`${FAL_QUEUE}/${model}`, {
        method: 'POST',
        headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.slice(0, 500),
          negative_prompt: 'blurry, low quality, watermark, distorted',
          num_frames: 97,
          fps: 24,
          guidance_scale: 3,
          num_inference_steps: 40,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!r.ok) {
        const errText = await r.text();
        res.status(r.status).json({ error: `fal.ai queue error: ${errText}` });
        return;
      }

      const data = await r.json() as { request_id?: string; error?: string };
      if (!data.request_id) { res.status(500).json({ error: 'No request_id from fal.ai queue' }); return; }

      // Track in DB as pending (non-blocking)
      dbClient.query(
        `INSERT INTO studio_generations
          (user_id, type, model, workflow, prompt, status, cost, fal_request_id, meta)
         VALUES ($1, 'video', $2, 'admin-test', $3, 'pending', $4, $5, $6)`,
        [req.user?.userId ?? null, model, prompt, credits, data.request_id, JSON.stringify({ adminTest: true })],
      ).catch(err => logger.warn('studio video tracking failed', { error: err }));

      res.json({ requestId: data.request_id, status: 'processing', model, credits });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Queue submission failed' });
    }
  });

  // ── GET /admin/studio/generate/video/:requestId ──────────────────────────
  router.get('/admin/studio/generate/video/:requestId', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    if (!FAL_KEY) { res.status(503).json({ error: 'FAL_KEY not configured' }); return; }

    const requestId = String(req.params['requestId']);
    const model = String(req.query['model'] ?? 'fal-ai/ltx-video');

    try {
      const r = await fetch(`${FAL_QUEUE}/${model}/requests/${requestId}`, {
        headers: { Authorization: `Key ${FAL_KEY}` },
        signal: AbortSignal.timeout(15000),
      });

      if (!r.ok) {
        const errText = await r.text();
        res.status(r.status).json({ error: `fal.ai poll error: ${errText}` });
        return;
      }

      const data = await r.json() as {
        status?: string;
        output?: { video?: { url: string } };
        video?: { url: string };
        error?: string;
      };

      const falStatus = (data.status ?? '').toUpperCase();
      const videoUrl: string | null = data.output?.video?.url ?? data.video?.url ?? null;

      if (falStatus === 'COMPLETED' && videoUrl) {
        dbClient.query(
          `UPDATE studio_generations SET status = 'completed', result_url = $1 WHERE fal_request_id = $2`,
          [videoUrl, requestId],
        ).catch(() => { /* non-blocking */ });
        res.json({ status: 'completed', videoUrl });
        return;
      }

      if (falStatus === 'FAILED') {
        dbClient.query(
          `UPDATE studio_generations SET status = 'failed' WHERE fal_request_id = $1`,
          [requestId],
        ).catch(() => { /* non-blocking */ });
        res.json({ status: 'failed', error: data.error ?? 'Generation failed' });
        return;
      }

      res.json({ status: 'processing' });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Poll failed' });
    }
  });

  // ── DELETE /admin/studio/history/:id ─────────────────────────────────────
  router.delete('/admin/studio/history/:id', requireRole('admin'), async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      await dbClient.query('DELETE FROM studio_generations WHERE id = $1', [String(req.params['id'])]);
      res.json({ ok: true });
    } catch (e) {
      logger.error('studio history delete error', { error: e });
      res.status(500).json({ error: 'DB error' });
    }
  });

  return router;
}
