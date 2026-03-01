import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token as string;

  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  try {
    const res = await fetch(`${API_BASE}/billing/llm`, {
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

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
