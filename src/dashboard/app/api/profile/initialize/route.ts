import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[profile/initialize] Received profile data:', JSON.stringify({
      level: 'info',
      service: 'onboarding',
      action: 'profile_initialize',
      timestamp: new Date().toISOString(),
      business_info: body.business_info,
      user_profiles: body.user_profiles,
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[profile/initialize] Error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
