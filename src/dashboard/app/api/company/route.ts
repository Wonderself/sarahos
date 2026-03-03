import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

// Store company profiles in memory for now (will be DB-backed)
// Key: userId, Value: company profile
const profiles = new Map<string, Record<string, unknown>>();

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  // Decode userId from token
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const profile = profiles.get(userId);
  return NextResponse.json({ profile: profile ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token as string;
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  // Read-only profile retrieval (replaces GET with token in URL)
  if (body.action === 'get-profile') {
    const profile = profiles.get(userId);
    return NextResponse.json({ profile: profile ?? null });
  }

  // Quick analysis: fetch website and extract profile via LLM
  if (body.action === 'analyze-url') {
    return analyzeUrl(body.url as string, body.description as string | undefined, token);
  }

  const existing = profiles.get(userId) ?? {};
  const updated = { ...existing, ...body.profile, updatedAt: new Date().toISOString() };
  profiles.set(userId, updated);

  // Also store in backend memory if available
  try {
    await fetch(`${API_BASE}/memory/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        content: `Company Profile for user ${userId}: ${JSON.stringify(updated)}`,
        metadata: { type: 'company_profile', userId },
      }),
    });
  } catch { /* best effort */ }

  return NextResponse.json({ success: true, profile: updated });
}

function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') return false;
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('169.254.')) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return false;
    return true;
  } catch {
    return false;
  }
}

async function analyzeUrl(url: string, description: string | undefined, token: string) {
  if (!url) return NextResponse.json({ error: 'URL requise' }, { status: 400 });
  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: 'URL non autorisee. Utilisez une URL publique (https://).' }, { status: 400 });
  }

  // Fetch the website content
  let siteText = '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SarahOS/1.0; +https://sarah-os.com)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return NextResponse.json({ error: `Impossible d'acceder au site (${res.status})` }, { status: 400 });
    const html = await res.text();
    // Strip HTML tags and limit to 5000 chars
    siteText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);
  } catch (e) {
    const msg = e instanceof Error && e.name === 'AbortError' ? 'Le site met trop de temps a repondre' : 'Impossible d\'acceder au site';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (siteText.length < 50) {
    return NextResponse.json({ error: 'Contenu du site insuffisant pour l\'analyse' }, { status: 400 });
  }

  // Call the LLM to extract a company profile
  const prompt = `Tu es un assistant qui analyse des sites web d'entreprises. A partir du contenu suivant, extrais un profil d'entreprise en JSON.

CONTENU DU SITE (${url}):
${siteText}

${description ? `DESCRIPTION ADDITIONNELLE FOURNIE PAR L'UTILISATEUR:\n${description}\n` : ''}

Retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks) avec ces champs (laisse vide "" si l'information n'est pas disponible):
{
  "companyName": "",
  "industry": "",
  "employeeCount": "",
  "foundedYear": "",
  "website": "${url}",
  "location": "",
  "mission": "",
  "vision": "",
  "values": "",
  "uniqueValue": "",
  "targetAudience": "",
  "mainChallenges": "",
  "competitors": "",
  "strengths": "",
  "brandTone": "",
  "contentNeeds": "",
  "languages": []
}`;

  try {
    const llmRes = await fetch(`${API_BASE}/billing/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        agentId: 'sarah-assistante',
        message: prompt,
        systemPrompt: 'Tu extrais des informations d\'entreprise a partir de sites web. Reponds uniquement en JSON valide.',
      }),
    });

    if (!llmRes.ok) {
      const err = await llmRes.text();
      return NextResponse.json({ error: `Erreur LLM: ${err}` }, { status: 500 });
    }

    const llmData = await llmRes.json() as { response?: string; content?: string };
    const responseText = llmData.response ?? llmData.content ?? '';

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const profile = JSON.parse(jsonStr);
    return NextResponse.json({ success: true, profile });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof SyntaxError ? 'L\'IA n\'a pas pu analyser ce site correctement' : 'Erreur lors de l\'analyse',
    }, { status: 500 });
  }
}

async function getUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.userId ?? data.id ?? null;
  } catch {
    return null;
  }
}
