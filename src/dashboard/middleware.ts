import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (cookie fz-token)
// NOTE: /client removed temporarily to fix access issues — re-add after OAuth setup
const PROTECTED_PREFIXES = ['/admin', '/system', '/infra', '/avatars', '/security', '/roadmap'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security headers for all responses ─────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // ─── Auth check for protected routes ────────────────────────
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (!isProtected) return response;

  // Check for auth token in cookie
  const token = request.cookies.get('fz-token')?.value;
  if (token) return response;

  // No cookie token found — redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/system/:path*',
    '/infra/:path*',
    '/avatars/:path*',
    '/security/:path*',
    '/roadmap/:path*',
    '/((?!_next/static|_next/image|favicon.ico|embed|api/health).*)',
  ],
};
