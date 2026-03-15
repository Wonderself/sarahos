import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(req: NextRequest): string {
  return req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('fz-token')?.value || '';
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Team settings — stub until backend connected
  return NextResponse.json({
    organization: null,
    members: [],
    credit_pool: null,
    workflows: [],
    user_role: null,
  });
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  return NextResponse.json({ success: true, updated: Object.keys(body) });
}
