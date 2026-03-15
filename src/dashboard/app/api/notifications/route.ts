import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(req: NextRequest): string {
  return req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('fz-token')?.value || '';
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // In-app notifications — stub until backend is connected
  return NextResponse.json({
    notifications: [],
    unread_count: 0,
  });
}
