import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const ALLOWED_EXACT_PATHS = new Set(['/portal/wallet', '/portal/usage', '/portal/dashboard', '/portal/profile', '/portal/active-agents', '/custom-creation/quotes', '/video-pro/quotes', '/documents', '/documents/storage', '/billing/wallet/auto-topup', '/portal/preferences', '/portal/company-profile', '/portal/gamification', '/portal/activity', '/portal/sessions', '/billing/invoices', '/portal/notifications/stream', '/portal/alarms', '/portal/projects', '/notifications', '/billing/usage', '/personal/config', '/campaigns', '/financial/summary', '/financial/costs', '/billing/pricing', '/avatar/personas', '/avatar/personas/switch', '/avatar/pipeline/health', '/portal/referrals', '/portal/agents/custom', '/portal/modules', '/portal/social/analyze', '/portal/social/competitor', '/portal/social/search']);

const ALLOWED_PREFIXES = ['/portal/user-data/', '/billing/invoices/', '/portal/alarms/', '/portal/projects/', '/personal/', '/notifications/', '/portal/sessions/', '/documents/', '/campaigns/', '/financial/', '/avatar/telephony/', '/avatar/pipeline/', '/avatars/', '/portal/agents/custom/', '/portal/modules/'];

function normalizePath(p: string): string {
  const clean = p.split('?')[0];
  const parts = clean.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const seg of parts) {
    if (seg === '..') resolved.pop();
    else if (seg !== '.') resolved.push(seg);
  }
  return '/' + resolved.join('/');
}

function isAllowedPath(path: string): boolean {
  const cleanPath = normalizePath(path);
  if (ALLOWED_EXACT_PATHS.has(cleanPath)) return true;
  return ALLOWED_PREFIXES.some(prefix => cleanPath.startsWith(prefix));
}

// POST handler (secure — token in body, not URL)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = body.path as string;
    const token = body.token as string;
    const method = (body.method as string)?.toUpperCase() ?? 'GET';
    const data = body.data ?? body.agents; // support legacy "agents" field

    if (!path || !token) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    if (!isAllowedPath(path)) return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });

    const fetchOptions: RequestInit = {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    };

    // For PATCH/POST/PUT, include the body data
    if (method !== 'GET' && data !== undefined) {
      fetchOptions.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_BASE}${path}`, fetchOptions);
    const responseData = await res.json();
    if (!res.ok) return NextResponse.json(responseData, { status: res.status });
    return NextResponse.json(responseData);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}

// GET handler (kept for backward compat, also secured with whitelist)
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  const token = req.nextUrl.searchParams.get('token');

  if (!path || !token) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  if (!isAllowedPath(path)) return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
