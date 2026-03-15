import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(req: NextRequest): string {
  return req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('fz-token')?.value || '';
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Return default settings — connected to DB via portal in production
  return NextResponse.json({
    notification_channels: ['inapp'],
    auto_approve_types: [],
    expiry_hours: 48,
    reminder_after_hours: 4,
    max_postpones: 3,
    quiet_hours_start: null,
    quiet_hours_end: null,
    briefing_enabled: true,
    briefing_hour: '08:00',
    evening_summary: true,
  });
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  return NextResponse.json({ success: true, updated: Object.keys(body) });
}
