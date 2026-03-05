import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * GET /api/portal/sse?token=<jwt>
 * Proxies the SSE notification stream from the backend.
 * Token is passed as a query param (EventSource cannot set custom headers).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || typeof token !== 'string' || token.length < 10) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${API_BASE}/portal/notifications/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      // @ts-expect-error — duplex is required for streaming in Node fetch
      duplex: 'half',
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Stream unavailable' }, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Stream connection failed' }, { status: 503 });
  }
}
