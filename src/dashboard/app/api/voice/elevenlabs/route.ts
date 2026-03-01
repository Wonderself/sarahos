import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env['ELEVENLABS_API_KEY'];

export async function POST(req: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({
      error: 'ElevenLabs not yet configured',
      configured: false,
      message: 'Premium voice synthesis with ElevenLabs coming soon. Using Deepgram voices in the meantime.',
      fallback: '/api/voice/tts',
    }, { status: 503 });
  }

  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const voice = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah voice
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: `ElevenLabs error: ${errorData}` }, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'ElevenLabs error' }, { status: 500 });
  }
}

// Status check
export async function GET() {
  return NextResponse.json({
    configured: !!ELEVENLABS_API_KEY,
    provider: 'ElevenLabs',
    status: ELEVENLABS_API_KEY ? 'active' : 'coming_soon',
    message: ELEVENLABS_API_KEY
      ? 'Premium voice synthesis active'
      : 'Coming soon — Ultra-realistic voices with ElevenLabs. Currently using Deepgram.',
  });
}
