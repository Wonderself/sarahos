import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * Verify the user token from the Authorization header.
 * Returns userId on success, or a NextResponse error on failure.
 */
export async function verifyApiToken(
  req: NextRequest,
): Promise<{ userId: string; role: string; tier: string } | NextResponse> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const data = await res.json();
    return { userId: data.userId ?? data.id, role: data.role, tier: data.tier };
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
}

/** Type guard: checks if verifyApiToken returned an error response */
export function isAuthError(result: { userId: string } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
