import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '../../../../lib/api-auth';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

export async function GET(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Backend doesn't have this document — graceful degradation
      return NextResponse.json(
        { error: 'Document non trouvé. Les documents sont stockés localement pour le moment.' },
        { status: 404 },
      );
    }

    // Forward the document (could be PDF, HTML, etc.)
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const disposition = res.headers.get('content-disposition') || `attachment; filename="document-${id}.pdf"`;
    const blob = await res.arrayBuffer();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Service de stockage non disponible. Les documents sont stockés localement.' },
      { status: 503 },
    );
  }
}
