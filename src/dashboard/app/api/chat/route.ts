import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-20250514',
  'claude-opus-4-6',
];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  // Prefer header/cookie auth, fallback to body token for backward compat
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies.get('fz-token')?.value;
  const token = authHeader || cookieToken || (body.token as string);

  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const model = (body.model as string) ?? 'claude-sonnet-4-20250514';
  if (!ALLOWED_MODELS.includes(model)) {
    return NextResponse.json({ error: 'Modèle IA non autorisé' }, { status: 400 });
  }

  const maxTokens = Math.min(Math.max(Number(body.maxTokens ?? 4096), 1), 8192);

  try {
    const res = await fetch(`${API_BASE}/billing/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        maxTokens,
        temperature: body.temperature ?? 0.7,
        agentName: body.agentName ?? 'fz-assistante',
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
