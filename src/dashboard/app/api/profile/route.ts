import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(req: NextRequest): string {
  return req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('fz-token')?.value || '';
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Profile data served via /api/portal proxy in production
  return NextResponse.json({ message: 'Use /api/portal with path /portal/profile' });
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  return NextResponse.json({ message: 'Use /api/portal with path /portal/profile', received: Object.keys(body) });
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ message: 'Account deletion requested. Use /api/portal with path /portal/account/delete' });
}
