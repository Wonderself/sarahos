import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * Verify the caller's JWT token from cookie or Authorization header.
 * Returns the user data if valid, or a NextResponse error if not.
 */
export async function verifyCallerAuth(req: NextRequest): Promise<
  | { authenticated: true; userId: string; role: string; token: string }
  | { authenticated: false; response: NextResponse }
> {
  // Try Authorization header first, then cookie
  const authHeader = req.headers.get('Authorization');
  const cookieToken = req.cookies.get('fz-token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    const data = await res.json();
    return {
      authenticated: true,
      userId: data.userId ?? data.id ?? '',
      role: data.role ?? 'viewer',
      token,
    };
  } catch {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      ),
    };
  }
}

/**
 * Require admin role — returns error response if not admin.
 */
export function requireAdmin(auth: { role: string }): NextResponse | null {
  if (auth.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Validate a URL to prevent SSRF attacks.
 * Only allows http/https protocols and blocks internal/private IPs.
 */
export function validateExternalUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block private/internal IPs and hostnames
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^0\./,
      /^169\.254\./,           // Link-local
      /^fc00:/i, /^fd/i,      // IPv6 private
      /^::1$/,                 // IPv6 loopback
      /^fe80:/i,               // IPv6 link-local
      // IPv4-mapped IPv6 (bypass for loopback/private)
      /^::ffff:127\./i,
      /^::ffff:10\./i,
      /^::ffff:172\.(1[6-9]|2[0-9]|3[01])\./i,
      /^::ffff:192\.168\./i,
      /^::ffff:0\./i,
      /\.local$/i,             // mDNS
      /\.internal$/i,
      /\.corp$/i,
      /^metadata\./i,          // Cloud metadata
      /^169\.254\.169\.254$/,  // AWS metadata
    ];

    if (blockedPatterns.some(p => p.test(hostname))) {
      return { valid: false, error: 'Internal URLs are not allowed' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
