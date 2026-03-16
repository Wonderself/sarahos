/**
 * POST /api/documents/generate
 * Generates a PDF document and returns it as a binary response.
 *
 * Body: { type: DocumentType, data: object, branding?: Branding }
 * Returns: application/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '../../../../lib/api-auth';

type DocumentType = 'devis' | 'facture' | 'contrat' | 'rapport' | 'attestation';

const VALID_TYPES: DocumentType[] = ['devis', 'facture', 'contrat', 'rapport', 'attestation'];

interface RequestBody {
  type: DocumentType;
  data: Record<string, unknown>;
  branding?: Record<string, unknown>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `Type invalide. Types acceptes: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json(
        { error: 'Le champ "data" est requis et doit etre un objet.' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid SSR issues with pdfmake
    const { DocumentService } = await import('@/lib/documents/DocumentGenerationService');

    const blob = await DocumentService.generatePDF({
      type: body.type,
      data: body.data,
      branding: body.branding as Parameters<typeof DocumentService.generatePDF>[0]['branding'],
    });

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${body.type}-${dateStr}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Erreur de generation: ${message}` },
      { status: 500 }
    );
  }
}
