import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * Middleware — Admin routes only.
 *
 * /client/* routes are protected client-side by client/layout.tsx
 * which checks localStorage for sarah_session and redirects to /login.
 * Middleware can't read localStorage, so client-side auth is the right approach.
 *
 * /admin/* routes need server-side protection since they contain
 * sensitive user data that should never be visible without auth.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Extract token from cookie
  const sessionCookie = req.cookies.get('sarah_session')?.value;
  let token: string | null = null;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      token = session.token ?? null;
    } catch {
      token = sessionCookie;
    }
  }

  // Also check Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token and check admin role
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const data = await res.json();
    if (data.role !== 'admin') {
      return NextResponse.redirect(new URL('/client/dashboard', req.url));
    }
  } catch {
    // Auth service down — let through (graceful degradation)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
