import { NextRequest, NextResponse } from 'next/server';
import { createTicket, notifyTelegram } from '../../../../lib/support-chat/SupportChatService';

// ─── POST /api/support/ticket ──────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body['email'] === 'string' ? body['email'].trim() : '';
  const subject = typeof body['subject'] === 'string' ? body['subject'].trim() : '';
  const sessionId = typeof body['sessionId'] === 'string' ? body['sessionId'] : '';

  // Validate required fields
  if (!email || !subject || !sessionId) {
    return NextResponse.json(
      { error: 'email, subject, and sessionId are required' },
      { status: 400 }
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  if (subject.length > 500) {
    return NextResponse.json(
      { error: 'Subject must be 500 characters or less' },
      { status: 400 }
    );
  }

  if (sessionId.length > 100) {
    return NextResponse.json(
      { error: 'sessionId max 100 chars' },
      { status: 400 }
    );
  }

  // Optional: authenticated user
  const authHeader = req.headers.get('Authorization');
  const cookieToken = req.cookies.get('fz-token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;
  let userId: string | undefined;

  if (token) {
    const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
    try {
      const authRes = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (authRes.ok) {
        const authData: Record<string, unknown> = await authRes.json();
        const resolvedId = authData['userId'] ?? authData['id'];
        if (typeof resolvedId === 'string') {
          userId = resolvedId;
        }
      }
    } catch {
      // Auth check is optional for tickets
    }
  }

  try {
    const ticketId = await createTicket(sessionId, email, subject, userId);

    // Notify Emmanuel via Telegram (fire and forget)
    notifyTelegram(ticketId, email, subject).catch(() => {
      /* Telegram notification is best-effort */
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Votre ticket a été créé. Nous vous répondrons dans les plus brefs délais.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create ticket. Please try again.' },
      { status: 500 }
    );
  }
}
