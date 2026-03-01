import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function POST(req: NextRequest) {
  const body = await req.json();
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

      return NextResponse.json({
        ...data,
        email: data.email ?? body.email,
        displayName: data.displayName ?? body.displayName,
      });
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

        return NextResponse.json({
          ...data,
          email: meData.sub ?? '',
          displayName: meData.displayName ?? meData.sub ?? '',
          userId: data.userId ?? meData.userId,
          tier: data.tier ?? meData.tier,
        });
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

        return NextResponse.json({
          ...data,
          email: data.email ?? body.email,
          displayName: data.displayName ?? '',
          userId: data.userId,
          tier: data.tier,
          apiKey: data.apiKey,
        });
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
      return NextResponse.redirect(res.url);
    }
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
