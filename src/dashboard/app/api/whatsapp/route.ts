import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '@/lib/api-auth';

const WHATSAPP_API_KEY = process.env['WHATSAPP_API_KEY'];
const WHATSAPP_PHONE_NUMBER_ID = process.env['WHATSAPP_PHONE_NUMBER_ID'];

// Send a WhatsApp message
export async function POST(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json({
      error: 'WhatsApp not configured',
      configured: false,
      message: 'WhatsApp integration will be available soon. Configure WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID in .env.local',
    }, { status: 503 });
  }

  try {
    const { to, message, type } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'to and message are required' }, { status: 400 });
    }

    // WhatsApp Cloud API
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: type || 'text',
          text: { body: message },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'WhatsApp error' }, { status: 500 });
  }
}

// Check WhatsApp configuration status
export async function GET() {
  return NextResponse.json({
    configured: !!(WHATSAPP_API_KEY && WHATSAPP_PHONE_NUMBER_ID),
    features: [
      'Send and receive messages',
      'Voice notes transcription (Deepgram)',
      'Agent interactions via WhatsApp',
      'Proactive notifications and reminders',
    ],
  });
}
