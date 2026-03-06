import { NextRequest, NextResponse } from 'next/server';

const FAL_KEY = process.env['FAL_KEY'];
const DID_API_KEY = process.env['DID_API_KEY'];

// POST: create video generation
// - If sourceUrl provided + DID_API_KEY configured → D-ID talking head
// - Otherwise → fal.ai LTX Video (text-to-video)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both `script` (sent by video page) and `text` (legacy)
    const scriptText: string = ((body.script || body.text) as string | undefined ?? '').trim();
    const sourceUrl: string | undefined = body.sourceUrl as string | undefined;

    if (!scriptText) {
      return NextResponse.json({ error: 'Script or text is required' }, { status: 400 });
    }

    // ── D-ID: talking head (requires sourceUrl + API key) ──────────────────
    if (sourceUrl && DID_API_KEY) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30_000);
      const res = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          script: {
            type: 'text',
            input: scriptText.slice(0, 1000),
            provider: { type: 'microsoft', voice_id: 'fr-FR-DeniseNeural' },
          },
          config: { fluent: true, pad_audio: 0.5 },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `D-ID error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json({ id: `did_${data.id}`, status: data.status, provider: 'did' });
    }

    // ── fal.ai LTX Video: text-to-video ────────────────────────────────────
    if (!FAL_KEY) {
      return NextResponse.json({
        error: 'fal.ai API key not configured — add FAL_KEY to .env',
        configured: false,
      }, { status: 503 });
    }

    // Use fal.ai queue for async generation (LTX Video takes ~30-90s)
    const falCtrl = new AbortController();
    const falTimer = setTimeout(() => falCtrl.abort(), 30_000);
    const res = await fetch('https://queue.fal.run/fal-ai/ltx-video', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: scriptText.slice(0, 500),
        negative_prompt: 'blurry, low quality, watermark, distorted',
        num_frames: 97, // ~4 seconds at 24fps
        fps: 24,
        guidance_scale: 3,
        num_inference_steps: 40,
      }),
      signal: falCtrl.signal,
    });
    clearTimeout(falTimer);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `fal.ai error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      id: `fal_${data.request_id}`,
      status: 'processing',
      provider: 'fal-ai',
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Video generation error',
    }, { status: 500 });
  }
}

// GET: poll video generation status
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('id') ?? '';

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    // ── D-ID polling ───────────────────────────────────────────────────────
    if (videoId.startsWith('did_')) {
      if (!DID_API_KEY) {
        return NextResponse.json({ error: 'D-ID API key not configured' }, { status: 503 });
      }
      const talkId = videoId.slice(4);
      const res = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { 'Authorization': `Basic ${DID_API_KEY}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `D-ID error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json({
        id: videoId,
        status: data.status,
        resultUrl: data.result_url ?? null,
        provider: 'did',
      });
    }

    // ── fal.ai polling ─────────────────────────────────────────────────────
    if (videoId.startsWith('fal_')) {
      if (!FAL_KEY) {
        return NextResponse.json({ error: 'fal.ai API key not configured' }, { status: 503 });
      }
      const requestId = videoId.slice(4);
      const res = await fetch(
        `https://queue.fal.run/fal-ai/ltx-video/requests/${requestId}`,
        { headers: { 'Authorization': `Key ${FAL_KEY}` } },
      );

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `fal.ai error: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      // fal.ai queue statuses: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
      const falStatus = (data.status as string | undefined) ?? '';
      const resultUrl: string | null =
        (data.output?.video?.url as string | undefined) ??
        (data.video?.url as string | undefined) ??
        null;

      let status: string;
      if (falStatus === 'COMPLETED') status = 'done';
      else if (falStatus === 'FAILED') status = 'error';
      else status = 'processing';

      return NextResponse.json({ id: videoId, status, resultUrl, provider: 'fal-ai' });
    }

    return NextResponse.json({ error: 'Unknown video ID format' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Video poll error',
    }, { status: 500 });
  }
}
