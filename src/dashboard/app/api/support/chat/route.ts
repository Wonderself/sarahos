import { NextRequest, NextResponse } from 'next/server';
import { chat } from '../../../../../lib/support-chat/SupportChatService';

// ─── Rate limit store (per session, in-memory) ────────────

interface RateBucket {
  count: number;
  windowStart: number;
}

const rateBuckets: Map<string, RateBucket> = new Map();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(sessionId);

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(sessionId, { count: 1, windowStart: now });
    return false;
  }

  bucket.count++;
  return bucket.count > RATE_LIMIT_MAX;
}

// ─── POST /api/support/chat ────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sessionId = typeof body['sessionId'] === 'string' ? body['sessionId'] : '';
  const message = typeof body['message'] === 'string' ? body['message'] : '';

  if (!sessionId || !message) {
    return NextResponse.json(
      { error: 'sessionId and message are required' },
      { status: 400 }
    );
  }

  if (sessionId.length > 100 || message.length > 2000) {
    return NextResponse.json(
      { error: 'sessionId max 100 chars, message max 2000 chars' },
      { status: 400 }
    );
  }

  // Rate limit check
  if (isRateLimited(sessionId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 20 messages per minute.' },
      { status: 429 }
    );
  }

  // Build context from optional fields
  const context: { page?: string; userAgent?: string; locale?: string } = {};
  if (typeof body['page'] === 'string') context.page = body['page'];
  const ua = req.headers.get('User-Agent');
  if (ua) context.userAgent = ua;
  const locale = req.headers.get('Accept-Language');
  if (locale) context.locale = locale;

  try {
    const stream = await chat(sessionId, message, context);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Chat service unavailable' },
      { status: 500 }
    );
  }
}
