// POST /api/prospection/export — Export prospects as CSV

import { NextRequest, NextResponse } from 'next/server';
import { ProspectionService } from '@/lib/prospection/ProspectionService';
import type { Prospect } from '@/lib/prospection/ProspectionService';

// ── Validation ───────────────────────────────────────────────────────────────

function isValidProspect(item: Record<string, unknown>): item is Record<string, unknown> & Prospect {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.sector === 'string' &&
    typeof item.address === 'string' &&
    typeof item.city === 'string' &&
    typeof item.digitalScore === 'number' &&
    typeof item.source === 'string' &&
    (item.confidence === 'high' || item.confidence === 'medium' || item.confidence === 'low') &&
    Array.isArray(item.opportunities)
  );
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide. JSON attendu.' },
      { status: 400 }
    );
  }

  const rawProspects = body.prospects;
  if (!Array.isArray(rawProspects) || rawProspects.length === 0) {
    return NextResponse.json(
      { error: 'Le champ "prospects" doit etre un tableau non vide.' },
      { status: 400 }
    );
  }

  // Validate each prospect has required fields
  const prospects: Prospect[] = [];
  for (const item of rawProspects) {
    if (typeof item === 'object' && item !== null && isValidProspect(item as Record<string, unknown>)) {
      prospects.push(item as Prospect);
    }
  }

  if (prospects.length === 0) {
    return NextResponse.json(
      { error: 'Aucun prospect valide trouve dans les donnees fournies.' },
      { status: 400 }
    );
  }

  // Generate CSV
  const csv = ProspectionService.exportCSV(prospects);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `freenzy-prospects-${timestamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
