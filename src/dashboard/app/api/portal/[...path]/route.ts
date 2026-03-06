import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const ALLOWED_PREFIXES = [
  '/portal/actions',
  '/portal/workspaces',
  '/portal/wallet',
  '/portal/usage',
  '/portal/dashboard',
  '/portal/profile',
  '/portal/active-agents',
  '/portal/preferences',
  '/portal/company-profile',
  '/portal/gamification',
  '/portal/activity',
  '/portal/sessions',
  '/portal/notifications',
  '/portal/alarms',
  '/portal/projects',
  '/portal/referrals',
  '/portal/agents',
  '/portal/modules',
  '/portal/user-data',
  '/custom-creation',
  '/video-pro',
  '/documents',
  '/billing',
  '/notifications',
  '/personal',
  '/campaigns',
  '/financial',
  '/avatar',
  '/avatars',
];

function isAllowedPath(backendPath: string): boolean {
  const raw = backendPath.split('?')[0];
  // Resolve .. and . to prevent path traversal
  const parts = raw.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const seg of parts) {
    if (seg === '..') resolved.pop();
    else if (seg !== '.') resolved.push(seg);
  }
  const clean = '/' + resolved.join('/');
  return ALLOWED_PREFIXES.some(prefix => clean.startsWith(prefix));
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const subPath = '/' + params.path.join('/');
  const backendPath = `/portal${subPath}`;

  if (!isAllowedPath(backendPath)) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
  }

  const url = new URL(req.url);
  const qs = url.search;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}${backendPath}${qs}`, fetchOptions);

    // Handle 204 No Content or empty responses
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `Backend returned ${res.status}` },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Backend error' },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await ctx.params);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await ctx.params);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await ctx.params);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await ctx.params);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await ctx.params);
}
