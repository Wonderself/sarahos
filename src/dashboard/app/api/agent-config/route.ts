import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const agentConfigs = new Map<string, Record<string, unknown>>();

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const configs = agentConfigs.get(userId);
  return NextResponse.json({ configs: configs ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token as string;
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const configs = body.configs as Record<string, unknown>;
  agentConfigs.set(userId, configs);

  try {
    await fetch(`${API_BASE}/memory/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        content: `Agent configs for user ${userId}: ${JSON.stringify(configs)}`,
        metadata: { type: 'agent_config', userId },
      }),
    });
  } catch { /* best effort */ }

  return NextResponse.json({ success: true });
}

async function getUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.userId ?? data.id ?? null;
  } catch {
    return null;
  }
}
