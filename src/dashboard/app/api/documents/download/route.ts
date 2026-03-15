/**
 * GET /api/documents/download?id=xxx
 * Placeholder for future server-side document storage with 7-day retention.
 * Currently returns 404 — documents are generated client-side.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get('id') || '';

  if (!id) {
    return NextResponse.json(
      { error: 'Parametre "id" requis.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: 'Document storage coming soon. Please use the generate endpoint.',
      id,
    },
    { status: 404 }
  );
}
