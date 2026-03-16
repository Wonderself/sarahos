import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (cookie fz-token)
const PROTECTED_PREFIXES = ['/admin', '/system', '/infra', '/avatars', '/security', '/roadmap', '/client'];

// Allowed origins for CSRF check on API mutations
const ALLOWED_ORIGINS = [
  'https://freenzy.io',
  'https://app.freenzy.io',
  'https://api.freenzy.io',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security headers for all responses ─────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // ─── CSRF Origin check on API mutations ─────────────────────
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    // Allow requests with no origin (same-origin, server-to-server, curl)
    // Block requests from unknown origins
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 },
      );
    }
  }

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
    '/client/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|embed|api/health).*)',
  ],
};
