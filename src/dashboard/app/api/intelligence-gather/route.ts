import { NextRequest, NextResponse } from 'next/server';
import { intelligenceGather, getEmptyResult } from '@/lib/intelligence-gatherer';

// ─── Rate limit (5 requests/hour per IP) ─────────────────────
interface RateBucket {
  count: number;
  windowStart: number;
}

const rateBuckets: Map<string, RateBucket> = new Map();
const RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour
const RATE_LIMIT_MAX = 5;

// Cleanup every 10 minutes to prevent memory leak
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
    }
  };
  setInterval(cleanup, 600_000);
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  bucket.count++;
  return bucket.count > RATE_LIMIT_MAX;
}

// ─── POST /api/intelligence-gather ───────────────────────────

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Trop de requêtes. Réessayez dans 1 heure.' },
      { status: 429 },
    );
  }

  try {
    const input = await request.json();
    const result = await intelligenceGather(input);
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, data: getEmptyResult() }, { status: 200 });
  }
}
