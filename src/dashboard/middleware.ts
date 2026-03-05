import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/client', '/system', '/infra', '/avatars', '/security', '/roadmap'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  // Check for auth token in cookie
  const token = request.cookies.get('fz-token')?.value;
  if (token) return NextResponse.next();

  // No cookie token found — redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/system/:path*',
    '/infra/:path*',
    '/avatars/:path*',
    '/security/:path*',
    '/roadmap/:path*',
  ],
};
