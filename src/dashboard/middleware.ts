import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const PROTECTED_PATHS = ['/client'];
const ADMIN_PATHS = ['/admin'];
const PUBLIC_PATHS = ['/login', '/plans', '/api/', '/_next/', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next();
  }

  // Check if path needs protection
  const needsAuth = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const needsAdmin = ADMIN_PATHS.some(p => pathname.startsWith(p));

  if (!needsAuth && !needsAdmin) {
    return NextResponse.next();
  }

  // Extract token from cookie or sarah_session
  const sessionCookie = req.cookies.get('sarah_session')?.value;
  let token: string | null = null;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      token = session.token ?? null;
    } catch {
      token = sessionCookie; // Direct token value
    }
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token server-side
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (needsAdmin) {
      const data = await res.json();
      if (data.role !== 'admin') {
        return NextResponse.redirect(new URL('/client/dashboard', req.url));
      }
    }
  } catch {
    // Auth service down — let through (graceful degradation)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/admin/:path*'],
};
