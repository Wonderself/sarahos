import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'] ?? '';
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
const REDIRECT_URI = process.env['NEXT_PUBLIC_URL'] ? `${process.env['NEXT_PUBLIC_URL']}/api/auth/google` : 'http://localhost:3001/api/auth/google';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to Google consent screen
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  // Step 2: Exchange code for tokens
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', req.url));
    }

    const tokens = await tokenRes.json();

    // Step 3: Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Step 4: Forward to backend for account creation/login
    const backendRes = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleUser.email,
        displayName: googleUser.name,
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
      }),
    });

    if (!backendRes.ok) {
      // Fallback: backend doesn't support Google yet — try normal register/login
      return NextResponse.redirect(new URL('/login?error=google_backend_pending&email=' + encodeURIComponent(googleUser.email), req.url));
    }

    const data = await backendRes.json();

    // Set auth cookie
    const response = NextResponse.redirect(new URL('/client/dashboard', req.url));
    response.cookies.set('fz-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=google_error', req.url));
  }
}
