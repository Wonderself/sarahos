import { NextRequest } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-20250514',
  'claude-opus-4-6',
];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response('{"error":"Invalid JSON"}', { status: 400, headers: { 'Content-Type': 'application/json' } }); }
  // Prefer header/cookie auth, fallback to body token for backward compat
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies.get('fz-token')?.value;
  const token = authHeader || cookieToken || (body.token as string);

  if (!token) {
    return new Response(JSON.stringify({ error: 'No auth token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const model = (body.model as string) ?? 'claude-sonnet-4-20250514';
  if (!ALLOWED_MODELS.includes(model)) {
    return new Response(JSON.stringify({ error: 'Modèle IA non autorisé' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const maxTokens = Math.min(Math.max(Number(body.maxTokens ?? 4096), 1), 8192);

  try {
    const res = await fetch(`${API_BASE}/billing/llm/stream`, {
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
        ...(body.thinking ? { thinking: body.thinking } : {}),
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      return new Response(errorData, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the SSE stream directly from backend
    const stream = res.body;
    if (!stream) {
      return new Response(JSON.stringify({ error: 'No stream body' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
