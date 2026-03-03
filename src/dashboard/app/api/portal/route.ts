import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const ALLOWED_PATHS = ['/portal/wallet', '/portal/usage', '/portal/dashboard', '/portal/profile', '/portal/referrals', '/portal/active-agents'];

// POST handler (secure — token in body, not URL)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = body.path as string;
    const token = body.token as string;

    if (!path || !token) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    if (!ALLOWED_PATHS.includes(path)) return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });

    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}

// GET handler (kept for backward compat, also secured with whitelist)
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  const token = req.nextUrl.searchParams.get('token');

  if (!path || !token) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  if (!ALLOWED_PATHS.includes(path)) return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
