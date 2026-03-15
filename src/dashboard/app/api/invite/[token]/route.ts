import { NextRequest, NextResponse } from 'next/server';

// GET: info about invitation (public, no auth needed)
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
  }

  // In production, query DB for invitation details
  // For now, return a stub that the frontend can work with
  return NextResponse.json({
    orgName: 'Équipe Demo',
    role: 'Membre',
    inviterName: 'Emmanuel S.',
    agentCount: 12,
    poolCredits: 50,
    expired: false,
  });
}

// POST: accept invitation (requires auth)
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const token = params.token;
  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  // In production: verify token, create organization_member, update invitation status
  return NextResponse.json({ success: true, message: 'Invitation acceptée' });
}
