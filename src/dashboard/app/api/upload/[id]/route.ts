import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

// DELETE — delete a user document
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

    const { id } = await params;
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Delete error' }, { status: 500 });
  }
}
