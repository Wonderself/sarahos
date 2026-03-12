import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '@/lib/api-auth';

const DEEPGRAM_API_KEY = process.env['DEEPGRAM_API_KEY'];

// 8 voice models — named voices for each agent personality
const VOICE_MODELS: Record<string, string> = {
  // French feminine voices
  'camille': 'aura-2-agathe-fr',       // FR féminin chaleureux (default)
  'claire': 'aura-2-luna-fr',          // FR féminin clair
  'sophie': 'aura-2-angelia-fr',       // FR féminin professionnel
  'emma': 'aura-2-athena-en',          // EN féminin international
  // French masculine voices
  'thomas': 'aura-2-orpheus-fr',       // FR masculin dynamique
  'marc': 'aura-2-arcas-fr',           // FR masculin posé
  'hugo': 'aura-2-helios-en',          // EN masculin tech
  'adam': 'aura-2-perseus-en',         // EN masculin international
};

// Fallback mapping: gender → default voice
const GENDER_DEFAULT: Record<string, string> = {
  'F': 'aura-2-agathe-fr',
  'M': 'aura-2-orpheus-fr',
};

export async function POST(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
  }

  try {
    const { text, gender, voice } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Truncate very long texts (Deepgram limit)
    const truncated = text.slice(0, 2000);
    // Priority: named voice > gender fallback > default feminine
    const model = (voice && VOICE_MODELS[voice]) || GENDER_DEFAULT[gender] || GENDER_DEFAULT['F'];

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
