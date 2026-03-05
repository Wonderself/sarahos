import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

// POST — proxy multipart upload to Express backend (supports ?action=preview)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const action = req.nextUrl.searchParams.get('action');
    const formData = await req.formData();

    // Preview mode: extract text without saving
    if (action === 'preview') {
      const res = await fetch(`${API_BASE}/documents/preview`, {
        method: 'POST',
        headers: { Authorization: token },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }

    // Normal upload
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload error' }, { status: 500 });
  }
}

// GET — list user documents (optional ?context= filter)
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const context = req.nextUrl.searchParams.get('context') ?? '';
    const url = `${API_BASE}/documents${context ? `?context=${context}` : ''}`;

    const res = await fetch(url, {
      headers: { Authorization: token },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Fetch error' }, { status: 500 });
  }
}
