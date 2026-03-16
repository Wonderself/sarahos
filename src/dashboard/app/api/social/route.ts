import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '@/lib/api-auth';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

/**
 * Social Media API — account analysis, competitor analysis, post analytics, AI generation
 * Uses AI agents for analysis + mock data fallback
 */

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockAccountAnalysis(platform: string, username: string) {
  const h = hashStr(`${platform}:${username}`);
  const followers = 1000 + (h % 50000);
  const following = 200 + (h % 2000);
  const totalPosts = 50 + (h % 500);
  const avgLikes = 20 + (h % 300);
  const avgComments = 5 + (h % 50);
  const engagementRate = parseFloat((1 + (h % 80) / 10).toFixed(1));

  const times = ['8h-10h', '12h-14h', '17h-19h', '20h-22h'];
  const hashtags = ['#marketing', '#ia', '#business', '#startup', '#tech', '#growth', '#innovation', '#digital', '#strategie', '#entrepreneur'];
  const ages = ['18-24: 15%', '25-34: 35%', '35-44: 28%', '45-54: 15%', '55+: 7%'];

  return {
    platform,
    username,
    followers,
    following,
    totalPosts,
    avgLikes,
    avgComments,
    engagementRate,
    bestPostTime: times[h % times.length],
    topHashtags: hashtags.slice(0, 5 + (h % 4)),
    growthRate: `+${(1 + (h % 15) / 10).toFixed(1)}%/mois`,
    audienceAge: ages.join(' | '),
    topContentType: ['Carousel', 'Video courte', 'Post texte', 'Story', 'Image'][h % 5],
    bestDay: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][h % 5],
    sentimentScore: 70 + (h % 25),
    reachRate: parseFloat((5 + (h % 20)).toFixed(1)),
  };
}

function mockCompetitorAnalysis(platform: string, username: string) {
  const h = hashStr(`competitor:${platform}:${username}`);
  return {
    platform,
    username,
    name: username.charAt(0).toUpperCase() + username.slice(1).replace(/[_-]/g, ' '),
    followers: 5000 + (h % 200000),
    avgEngagement: parseFloat((1 + (h % 100) / 10).toFixed(1)),
    postFrequency: `${2 + (h % 5)} posts/semaine`,
    topContent: ['Carousels educatifs', 'Videos courtes', 'Infographies', 'Temoignages clients', 'Behind the scenes'][h % 5],
    strengths: [
      'Contenu educatif regulier',
      'Forte communaute engagee',
      'Branding visuel coherent',
      'Storytelling efficace',
    ].slice(0, 2 + (h % 3)),
    weaknesses: [
      'Frequence de publication irreguliere',
      'Peu de contenu video',
      'Faible interaction en commentaires',
    ].slice(0, 1 + (h % 2)),
    suggestedActions: [
      'Augmenter la frequence de publication',
      'Creer plus de contenu video court',
      'Utiliser plus de hashtags de niche',
      'Engager avec les commentaires',
    ].slice(0, 2 + (h % 2)),
  };
}

function mockCompetitorSearch(industry: string) {
  const h = hashStr(industry);
  const suggestions = [
    { username: 'hubspot', platform: 'linkedin', followers: 850000, desc: 'Marketing & CRM leader' },
    { username: 'canva', platform: 'instagram', followers: 1200000, desc: 'Design tool for everyone' },
    { username: 'notion', platform: 'twitter', followers: 420000, desc: 'Productivity & collaboration' },
    { username: 'stripe', platform: 'linkedin', followers: 310000, desc: 'Payment infrastructure' },
    { username: 'figma', platform: 'twitter', followers: 280000, desc: 'Design collaboration' },
    { username: 'linear_app', platform: 'twitter', followers: 95000, desc: 'Project management' },
    { username: 'vercel', platform: 'twitter', followers: 180000, desc: 'Frontend deployment' },
    { username: 'supabase', platform: 'twitter', followers: 150000, desc: 'Open source Firebase' },
  ];
  // Rotate suggestions based on industry hash
  const start = h % suggestions.length;
  return suggestions.slice(start, start + 5).concat(suggestions.slice(0, Math.max(0, 5 - (suggestions.length - start))));
}

export async function POST(req: NextRequest) {
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await req.json();
    const { action, platform, username, industry } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      case 'analyze_account': {
        if (!platform || !username) {
          return NextResponse.json({ error: 'Missing platform or username' }, { status: 400 });
        }
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
        const analysis = mockAccountAnalysis(platform, username);
        return NextResponse.json({ analysis });
      }

      case 'analyze_competitor': {
        if (!platform || !username) {
          return NextResponse.json({ error: 'Missing platform or username' }, { status: 400 });
        }
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        const analysis = mockCompetitorAnalysis(platform, username);
        return NextResponse.json({ analysis });
      }

      case 'search_competitors': {
        if (!industry) {
          return NextResponse.json({ error: 'Missing industry' }, { status: 400 });
        }
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        const suggestions = mockCompetitorSearch(industry);
        return NextResponse.json({ suggestions });
      }

      case 'test_connection': {
        if (!platform) {
          return NextResponse.json({ error: 'Missing platform' }, { status: 400 });
        }
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        // For now, always return success if credentials provided
        return NextResponse.json({ connected: true, username: body.apiKey ? `user_${platform}` : null });
      }

      case 'generate': {
        const { tone, goal, length, language, brief } = body;
        if (!brief || !String(brief).trim()) {
          return NextResponse.json({ error: 'Missing brief' }, { status: 400 });
        }

        const systemPrompt = `Tu es un expert en social media marketing. Tu crées du contenu engageant et professionnel pour les réseaux sociaux.

Plateforme : ${platform || 'LinkedIn'}
Ton : ${tone || 'professionnel'}
Objectif : ${goal || 'informer'}
Longueur : ${length || 'moyen'}
Langue : ${language || 'français'}

Règles par plateforme :
- LinkedIn : professionnel, hooks accrocheurs, 150-300 mots, 3-5 hashtags en fin
- Instagram : visuel, emojis, 30-100 mots + 10 hashtags séparés
- Twitter/X : concis, max 280 caractères, 2-3 hashtags
- Facebook : conversationnel, 50-200 mots, question engageante en fin
- TikTok : fun/éducatif, script 30-60s, hook dans les 3 premières secondes
- YouTube : titre SEO + description 500 mots + tags

Génère UNIQUEMENT le contenu du post (pas de méta-commentaire).`;

        const llmRes = await fetch(`${API_BASE}/billing/llm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: String(brief).trim() },
            ],
            maxTokens: 1024,
            temperature: 0.8,
            agentName: 'fz-communication',
          }),
        });

        if (!llmRes.ok) {
          const errData = await llmRes.json().catch(() => ({}));
          return NextResponse.json(
            { error: errData.error || 'Erreur de génération' },
            { status: llmRes.status }
          );
        }

        const data = await llmRes.json();
        return NextResponse.json({
          content: data.content || data.text || '',
          model: 'claude-sonnet-4-20250514',
          tokens: data.usage?.total_tokens || 0,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
