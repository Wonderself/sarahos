import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '@/lib/api-auth';

const ELEVENLABS_API_KEY = process.env['ELEVENLABS_API_KEY'];
const DEEPGRAM_API_KEY = process.env['DEEPGRAM_API_KEY'];

// ElevenLabs voice presets
const VOICE_PRESETS: Record<string, { id: string; name: string; gender: string }> = {
  sarah:     { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female' },
  rachel:    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female' },
  charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female' },
  adam:      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male' },
  antoni:    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male' },
  emmanuel:  { id: 'VR6AewLTigWG4xSOukaG', name: 'Emmanuel', gender: 'male' },
  george:    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male' },
};

// Model presets
const MODELS = {
  multilingual: 'eleven_multilingual_v2',  // High quality, supports 29 languages
  flash: 'eleven_flash_v2_5',              // Fast, low-latency (for real-time)
} as const;

async function fallbackToDeepgram(text: string, gender?: string): Promise<NextResponse> {
  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'No TTS provider available' }, { status: 503 });
  }

  const model = gender === 'male' ? 'aura-2-theron-en' : 'aura-2-agathe-fr';
  const res = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}`, 'Content-Type': 'text/plain' },
    body: text.slice(0, 2000),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Deepgram fallback failed' }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'X-TTS-Provider': 'deepgram-fallback',
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await req.json();
    const {
      text, voiceId, model_id, stability, similarity_boost, gender,
      style, use_speaker_boost, language_code, output_format, fast_mode,
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // If no ElevenLabs key, fallback to Deepgram
    if (!ELEVENLABS_API_KEY) {
      return fallbackToDeepgram(text, gender);
    }

    // Resolve voice: preset name, direct ID, or default
    let voice = voiceId || 'EXAVITQu4vr4xnSDxMaL';
    if (voiceId && VOICE_PRESETS[voiceId]) {
      voice = VOICE_PRESETS[voiceId].id;
    } else if (gender === 'male') {
      voice = VOICE_PRESETS['adam'].id;
    }

    // Choose model: fast mode for real-time, multilingual v2 for quality
    const selectedModel = model_id || (fast_mode ? MODELS.flash : MODELS.multilingual);

    // Build output format query param
    const format = output_format || 'mp3_44100_128';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=${format}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: selectedModel,
        voice_settings: {
          stability: stability ?? 0.5,
          similarity_boost: similarity_boost ?? 0.75,
          style: style ?? 0.0,
          use_speaker_boost: use_speaker_boost ?? true,
        },
        ...(language_code ? { language_code } : {}),
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown');
      // ElevenLabs API error — fall back to Deepgram
      return fallbackToDeepgram(text, gender);
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'X-TTS-Provider': 'elevenlabs',
        'X-TTS-Model': selectedModel,
        'X-TTS-Voice': voice,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'ElevenLabs error' }, { status: 500 });
  }
}

// Status + voice list
export async function GET() {
  return NextResponse.json({
    configured: !!ELEVENLABS_API_KEY,
    provider: 'ElevenLabs',
    status: ELEVENLABS_API_KEY ? 'active' : 'fallback_deepgram',
    hasFallback: !!DEEPGRAM_API_KEY,
    message: ELEVENLABS_API_KEY
      ? 'Premium voice synthesis active (Multilingual v2)'
      : 'ElevenLabs voices available — using Deepgram fallback until API key configured.',
    models: MODELS,
    defaultModel: MODELS.multilingual,
    voices: Object.entries(VOICE_PRESETS).map(([key, v]) => ({
      key, name: v.name, gender: v.gender,
    })),
    supportedOutputFormats: ['mp3_44100_128', 'mp3_22050_32', 'pcm_16000', 'pcm_24000', 'ulaw_8000'],
    supportedLanguages: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'he', 'ja', 'ko', 'zh', 'nl', 'pl', 'ru', 'sv', 'tr'],
  });
}
