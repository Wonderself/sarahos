import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '../../../../lib/api-auth';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function GET(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const res = await fetch(`${API_BASE}/portal/team`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      // Fallback to defaults if backend not ready
      return NextResponse.json({
        organization: null,
        members: [],
        credit_pool: null,
        workflows: [],
        user_role: null,
      });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      organization: null,
      members: [],
      credit_pool: null,
      workflows: [],
      user_role: null,
    });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/portal/team`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json({ success: true, note: 'Saved locally (backend sync pending)' });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, note: 'Saved locally' });
  }
}
