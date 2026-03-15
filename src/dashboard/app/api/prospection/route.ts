// POST /api/prospection — Search for prospects
// GET  /api/prospection — Info endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ProspectionService } from '@/lib/prospection/ProspectionService';
import type { ProspectSearchParams } from '@/lib/prospection/ProspectionService';

// ── Rate Limiting (in-memory, per session) ──────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(sessionId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

function getSessionId(req: NextRequest): string {
  // Try cookie first, then fallback to IP-based identifier
  const token = req.cookies.get('fz-token')?.value;
  if (token) return `session-${token.slice(0, 16)}`;

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip-${ip}`;
}

// ── GET handler ──────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Use POST to search for prospects',
    usage: {
      method: 'POST',
      body: {
        sector: 'string (required) — e.g. "plombier", "restaurant"',
        city: 'string (required) — e.g. "Lyon", "Paris 15e"',
        radius: 'number (optional) — km, default 20',
        maxResults: 'number (optional) — default 10, max 50',
      },
    },
    rateLimit: `${RATE_LIMIT_MAX} searches per hour`,
  });
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit check
  const sessionId = getSessionId(req);
  if (!checkRateLimit(sessionId)) {
    return NextResponse.json(
      { error: 'Limite atteinte : maximum 10 recherches par heure.' },
      { status: 429 }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide. JSON attendu.' },
      { status: 400 }
    );
  }

  // Validate required fields
  const sector = typeof body.sector === 'string' ? body.sector.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';

  if (!sector) {
    return NextResponse.json(
      { error: 'Le champ "sector" est requis.' },
      { status: 400 }
    );
  }

  if (!city) {
    return NextResponse.json(
      { error: 'Le champ "city" est requis.' },
      { status: 400 }
    );
  }

  // Validate optional fields
  const radiusRaw = typeof body.radius === 'number' ? body.radius : 20;
  const radius = Math.max(1, Math.min(radiusRaw, 200));

  const maxResultsRaw = typeof body.maxResults === 'number' ? body.maxResults : 10;
  const maxResults = Math.max(1, Math.min(maxResultsRaw, 50));

  const params: ProspectSearchParams = {
    sector,
    city,
    radius,
    maxResults,
  };

  // Execute search
  try {
    const result = await ProspectionService.searchProspects(params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la recherche. Veuillez reessayer.' },
      { status: 500 }
    );
  }
}
