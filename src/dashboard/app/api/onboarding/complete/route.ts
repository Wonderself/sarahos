import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[onboarding/complete] Received quiz answers:', JSON.stringify({
      level: 'info',
      service: 'onboarding',
      action: 'quiz_complete',
      timestamp: new Date().toISOString(),
      answers: body.answers,
    }));

    return NextResponse.json({
      success: true,
      redirect: '/dashboard?welcome=true',
    });
  } catch (error) {
    console.error('[onboarding/complete] Error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
