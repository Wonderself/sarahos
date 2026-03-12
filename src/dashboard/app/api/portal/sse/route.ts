import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * GET /api/portal/sse
 * Proxies the SSE notification stream from the backend.
 * Auth: cookie (fz-token) preferred, query param fallback for EventSource.
 */
export async function GET(req: NextRequest) {
  // Prefer cookie over query param (EventSource can't set headers, but cookies are sent automatically)
  const cookieToken = req.cookies.get('fz-token')?.value;
  const queryToken = req.nextUrl.searchParams.get('token');
  const token = cookieToken || queryToken;

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
