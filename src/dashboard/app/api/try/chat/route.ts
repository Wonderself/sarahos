import { NextRequest, NextResponse } from 'next/server';

// ─── In-memory rate limiting ────────────────────────────────
const sessionMap = new Map<string, { count: number; lastAt: number }>();
const MAX_MESSAGES = 5;
const SESSION_TTL_MS = 3600_000; // 1 hour

// Cleanup stale sessions every 10 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, val] of sessionMap.entries()) {
      if (now - val.lastAt > SESSION_TTL_MS) sessionMap.delete(key);
    }
  };
  setInterval(cleanup, 600_000).unref?.();
}

// ─── System prompts per assistant ───────────────────────────
const SYSTEM_PROMPTS: Record<string, string> = {
  'fz-commercial': "Tu es un assistant commercial IA de Freenzy.io. Tu aides les prospects avec la prospection, les devis et la relance clients. Reponds de maniere concise, professionnelle et en francais. Tu es en mode demo, donc reste bref et utile.",
  'fz-marketing': "Tu es un assistant marketing IA de Freenzy.io. Tu aides avec la strategie digitale, les posts reseaux sociaux et les campagnes. Reponds de maniere concise et en francais. Mode demo, reste bref.",
  'fz-assistante': "Tu es une secretaire IA de Freenzy.io. Tu aides a gerer l'agenda, les emails et l'organisation quotidienne. Reponds de maniere concise et en francais. Mode demo, reste bref.",
  'fz-redacteur': "Tu es un redacteur IA de Freenzy.io. Tu aides a ecrire des articles, fiches produit et contenus web. Reponds de maniere concise et en francais. Mode demo, reste bref.",
};

const DEFAULT_PROMPT = "Tu es un assistant IA de Freenzy.io. Reponds de maniere concise et en francais. Mode demo.";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const assistantId = String(body.assistantId || '');
  const message = String(body.message || '').trim();
  const sessionToken = String(body.sessionToken || '');

  if (!assistantId || !message || !sessionToken) {
    return NextResponse.json({ error: 'Missing required fields: assistantId, message, sessionToken' }, { status: 400 });
  }

  // ─── Rate limiting ──────────────────────────────────────
  const session = sessionMap.get(sessionToken) ?? { count: 0, lastAt: Date.now() };

  if (session.count >= MAX_MESSAGES) {
    return NextResponse.json({
      limitReached: true,
      ctaUrl: '/login?mode=register',
      message: 'Limite atteinte. Creez votre compte pour continuer avec 50 credits offerts.',
    }, { status: 429 });
  }

  session.count += 1;
  session.lastAt = Date.now();
  sessionMap.set(sessionToken, session);

  // ─── Call Anthropic ─────────────────────────────────────
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const systemPrompt = SYSTEM_PROMPTS[assistantId] ?? DEFAULT_PROMPT;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return NextResponse.json({ error: `Anthropic error: ${anthropicRes.status}`, details: errText }, { status: 502 });
    }

    // Stream response as text/plain
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          let streamDone = false;
          while (!streamDone) {
            const { done, value } = await reader.read();
            streamDone = done;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  if (data === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(data) as Record<string, unknown>;
                    if (parsed.type === 'content_block_delta') {
                      const delta = parsed.delta as Record<string, unknown> | undefined;
                      if (delta?.text) {
                        controller.enqueue(encoder.encode(String(delta.text)));
                      }
                    }
                  } catch {
                    // Skip non-JSON lines
                  }
                }
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`[Erreur: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
