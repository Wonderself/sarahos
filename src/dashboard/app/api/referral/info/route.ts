import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '../../../../lib/referral/ReferralService';

/**
 * GET /api/referral/info?code=XXXXXX — Public endpoint.
 * Returns anonymized referrer name + reward amount for the referral landing page.
 * No auth required.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code || code.length < 4 || code.length > 20) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
  }

  // Sanitize: only allow alphanumeric characters
  if (!/^[A-Za-z0-9]+$/.test(code)) {
    return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 });
  }

  try {
    const info = await ReferralService.getReferrerInfoByCode(code);
    if (!info) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }

    return NextResponse.json({
      referrerName: info.anonymizedName,
      rewardAmount: info.rewardAmount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
