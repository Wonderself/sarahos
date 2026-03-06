import { NextRequest, NextResponse } from 'next/server';

const DEEPGRAM_API_KEY = process.env['DEEPGRAM_API_KEY'];

export async function POST(req: NextRequest) {
  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;
    const language = (formData.get('language') as string) || 'fr';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Limit file size to 25MB to prevent memory exhaustion
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 413 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const res = await fetch(
      `https://api.deepgram.com/v1/listen?model=nova-2&language=${language}&smart_format=true&punctuate=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': audioFile.type || 'audio/webm',
        },
        body: audioBuffer,
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: `Deepgram error: ${errorData}` }, { status: res.status });
    }

    const data = await res.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    return NextResponse.json({ transcript, confidence });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'STT error' }, { status: 500 });
  }
}
