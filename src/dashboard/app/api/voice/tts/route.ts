import { NextRequest, NextResponse } from 'next/server';

const DEEPGRAM_API_KEY = process.env['DEEPGRAM_API_KEY'];

// Voice models per gender
const VOICE_MODELS = {
  F: 'aura-2-agathe-fr',    // French feminine voice
  M: 'aura-2-theron-en',    // Masculine voice (best available, EN fallback)
} as const;

export async function POST(req: NextRequest) {
  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
  }

  try {
    const { text, gender } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Truncate very long texts (Deepgram limit)
    const truncated = text.slice(0, 2000);
    const model = VOICE_MODELS[gender as keyof typeof VOICE_MODELS] || VOICE_MODELS.F;

    const res = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'text/plain',
        },
        body: truncated,
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: `Deepgram TTS error: ${errorData}` }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'TTS error' }, { status: 500 });
  }
}
