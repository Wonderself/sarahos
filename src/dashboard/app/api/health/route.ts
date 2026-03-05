import { NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ status: 'error' }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
