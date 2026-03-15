import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '../../../lib/referral/ReferralService';

function getTokenFromRequest(req: NextRequest): string {
  return req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('fz-token')?.value || '';
}

function getUserIdFromToken(token: string): string | null {
  if (!token) return null;
  try {
    // JWT payload is the second segment, base64url-encoded
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as Record<string, unknown>;
    return typeof payload['userId'] === 'string' ? payload['userId'] : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/referral — Returns user's referral code, stats, and share link.
 * Requires auth.
 */
export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const link = await ReferralService.getReferralLink(userId);
    const stats = await ReferralService.getStats(userId);
    const code = link.split('/r/')[1] || '';

    return NextResponse.json({
      code,
      link,
      stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/referral — Generates a referral code if the user doesn't have one yet.
 * Requires auth.
 */
export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const code = await ReferralService.generateCode(userId);
    const link = `https://freenzy.io/r/${code}`;
    const stats = await ReferralService.getStats(userId);

    return NextResponse.json({
      code,
      link,
      stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
