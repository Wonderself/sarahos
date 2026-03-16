import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '../../../lib/api-auth';
import { ReferralService } from '../../../lib/referral/ReferralService';

/**
 * GET /api/referral — Returns user's referral code, stats, and share link.
 * Requires auth (verified via backend /auth/me).
 */
export async function GET(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const link = await ReferralService.getReferralLink(auth.userId);
    const stats = await ReferralService.getStats(auth.userId);
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
 * Requires auth (verified via backend /auth/me).
 */
export async function POST(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const code = await ReferralService.generateCode(auth.userId);
    const link = `https://freenzy.io/r/${code}`;
    const stats = await ReferralService.getStats(auth.userId);

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
