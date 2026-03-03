import { NextRequest, NextResponse } from 'next/server';
import { verifyApiToken, isAuthError } from '../_auth';

const DID_API_KEY = process.env['DID_API_KEY'];

export async function POST(req: NextRequest) {
  const auth = await verifyApiToken(req);
  if (isAuthError(auth)) return auth;

  if (!DID_API_KEY) {
    return NextResponse.json({ error: 'D-ID API key not configured' }, { status: 500 });
  }

  try {
    const { text, sourceUrl } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create a talk video
    const res = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: sourceUrl || 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          input: text.slice(0, 1000),
          provider: { type: 'microsoft', voice_id: 'fr-FR-DeniseNeural' },
        },
        config: { fluent: true, pad_audio: 0.5 },
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: `D-ID error: ${errorData}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ id: data.id, status: data.status });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Video error' }, { status: 500 });
  }
}

// Poll video status
export async function GET(req: NextRequest) {
  const auth = await verifyApiToken(req);
  if (isAuthError(auth)) return auth;

  if (!DID_API_KEY) {
    return NextResponse.json({ error: 'D-ID API key not configured' }, { status: 500 });
  }

  const talkId = req.nextUrl.searchParams.get('id');
  if (!talkId) {
    return NextResponse.json({ error: 'Talk ID is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { 'Authorization': `Basic ${DID_API_KEY}` },
    });

    if (!res.ok) {
      const errorData = await res.text();
      return NextResponse.json({ error: `D-ID error: ${errorData}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      status: data.status,
      resultUrl: data.result_url || null,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Video poll error' }, { status: 500 });
  }
}
