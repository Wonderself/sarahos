import { NextRequest } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token as string;

  if (!token) {
    return new Response(JSON.stringify({ error: 'No auth token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${API_BASE}/billing/llm/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: body.model ?? 'claude-sonnet-4-20250514',
        messages: body.messages,
        maxTokens: body.maxTokens ?? 4096,
        temperature: body.temperature ?? 0.7,
        agentName: body.agentName ?? 'sarah-assistant',
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
