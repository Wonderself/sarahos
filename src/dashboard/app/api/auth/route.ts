import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('fz-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24h
    path: '/',
  });
}

function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete('fz-token');
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const action = body.action as string;

  try {
    // ── Register ──
    if (action === 'register') {
      // Auto-generate apiKey for client registration
      const autoApiKey = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email,
          displayName: body.displayName,
          password: body.password,
          apiKey: autoApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });

      const response = NextResponse.json({
        ...data,
        email: data.email ?? body.email,
        displayName: data.displayName ?? body.displayName,
      });
      if (data.token) setAuthCookie(response, data.token);
      return response;
    }

    // ── Login ──
    if (action === 'login') {
      // Login by API key
      if (body.apiKey) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: body.apiKey }),
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });

        // Fetch user details
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const meData = meRes.ok ? await meRes.json() : {};

        const response = NextResponse.json({
          ...data,
          role: data.role ?? meData.role,
          email: meData.sub ?? '',
          displayName: meData.displayName ?? meData.sub ?? '',
          userId: data.userId ?? meData.userId,
          tier: data.tier ?? meData.tier,
        });
        if (data.token) setAuthCookie(response, data.token);
        return response;
      }

      // Login by email + password (forwarded to backend)
      if (body.email && body.password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: body.email, password: body.password }),
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });

        const response = NextResponse.json({
          ...data,
          role: data.role,
          email: data.email ?? body.email,
          displayName: data.displayName ?? '',
          userId: data.userId,
          tier: data.tier,
        });
        if (data.token) setAuthCookie(response, data.token);
        return response;
      }

      return NextResponse.json({ error: 'Cle API ou email + mot de passe requis' }, { status: 400 });
    }

    // ── Forgot Password ──
    if (action === 'forgot-password') {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // ── Reset Password ──
    if (action === 'reset-password') {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: body.token, password: body.password }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // ── Logout ──
    if (action === 'logout') {
      const response = NextResponse.json({ message: 'Logged out' });
      clearAuthCookie(response);
      return response;
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}

// ── Confirm Email (GET proxy) ──
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/auth/confirm-email?token=${encodeURIComponent(token)}`);
    if (res.redirected) {
      // Validate redirect URL to prevent open redirect
      try {
        const redirectUrl = new URL(res.url);
        const allowedOrigins = [new URL(req.url).origin, new URL(API_BASE).origin];
        if (allowedOrigins.includes(redirectUrl.origin)) {
          return NextResponse.redirect(res.url);
        }
      } catch { /* invalid URL, fall through */ }
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
