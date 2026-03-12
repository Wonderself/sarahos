import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

// ─── Smart Speaker Rotation ───

function selectNextSpeaker(agents: Array<{id: string; name: string; role: string}>, previousMessages: Array<{speaker: string; content: string}>): typeof agents[number] {
  // First turn: always DG (fz-dg) if present
  if (previousMessages.length === 0) {
    const dg = agents.find(a => a.id === 'fz-dg');
    if (dg) return dg;
    return agents[0];
  }

  const lastSpeaker = previousMessages[previousMessages.length - 1]?.speaker;

  // Keyword-to-role scoring map
  const roleKeywords: Record<string, string[]> = {
    'fz-finance': ['budget', 'coût', 'cout', 'marge', 'trésorerie', 'rentabilité', 'chiffre', 'financ', 'prix', 'investiss', 'dépense'],
    'fz-dev': ['tech', 'api', 'code', 'développ', 'infra', 'serveur', 'bug', 'architecture', 'logiciel', 'sécurité'],
    'fz-commercial': ['vente', 'client', 'prospect', 'pipeline', 'deal', 'contrat commercial', 'négoci', 'marché'],
    'fz-marketing': ['marque', 'campagne', 'seo', 'visibilité', 'audience', 'contenu', 'réseaux sociaux', 'communication digitale'],
    'fz-rh': ['recrutement', 'talent', 'formation', 'équipe', 'salaire', 'embauche', 'collaborat', 'ressources humaines'],
    'fz-juridique': ['contrat', 'rgpd', 'juridique', 'légal', 'conformité', 'droit', 'propriété intellectuelle', 'litige'],
    'fz-communication': ['presse', 'image', 'réputation', 'média', 'communiqué', 'événement', 'crise', 'relation publique'],
    'fz-assistante': ['planning', 'agenda', 'organisation', 'tâche', 'email', 'suivi', 'rapport', 'logistique'],
    'fz-repondeur': ['appel', 'message', 'faq', 'support', 'ticket', 'réclamation', 'réponse', 'accueil'],
    'fz-dg': ['stratégie', 'vision', 'croissance', 'décision', 'leadership', 'expansion', 'levée de fonds', 'direction'],
  };

  const lastContent = (previousMessages[previousMessages.length - 1]?.content || '').toLowerCase();

  const scores = agents.map(agent => {
    let score = 0;

    // Cannot speak twice in a row
    if (agent.name === lastSpeaker) return { agent, score: -999 };

    // Keyword relevance scoring
    const keywords = roleKeywords[agent.id] || [];
    for (const kw of keywords) {
      if (lastContent.includes(kw)) score += 3;
    }

    // Recency penalty: agents who spoke in last 3 messages get penalized
    const recent = previousMessages.slice(-3);
    for (const msg of recent) {
      if (msg.speaker === agent.name) score -= 3;
    }

    // Random factor for variety
    score += Math.random() * 2;

    return { agent, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].agent;
}

// ─── POST Handler ───

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  // Prefer header/cookie auth, fallback to body token for backward compat
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies.get('fz-token')?.value;
  const token = authHeader || cookieToken || (body.token as string);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const { topic, agentId, agentName, agentRole, previousMessages: prevMsgs, agents, companyContext, userDirection } = body;
  const previousMessages = (prevMsgs as Array<{ speaker: string; content: string }>) ?? [];

  // Smart rotation when selectNextSpeaker exists, fallback to cyclic
  if (!agents || !Array.isArray(agents) || agents.length === 0) {
    return NextResponse.json({ error: 'agents array is required' }, { status: 400 });
  }
  const currentAgent = selectNextSpeaker
    ? selectNextSpeaker(agents, previousMessages)
    : agents[previousMessages.length % agents.length];

  const otherAgents = agents
    .filter((a: { id: string; name: string; role: string }) => a.id !== currentAgent.id)
    .map((a: { id: string; name: string; role: string }) => `${a.name} (${a.role})`)
    .join(', ');

  const systemPrompt = `${currentAgent.systemPrompt}

Tu es en reunion avec: ${otherAgents}.
Sujet de la reunion: ${topic}

Contexte de l'entreprise:
${companyContext}

REGLES DE LA REUNION:
- Parle en 2-4 phrases maximum, sois concis
- Rebondis sur ce que les autres ont dit
- Apporte TON expertise specifique (${currentAgent.role})
- Propose des actions concretes quand c'est pertinent
- Si tu n'as rien de nouveau a ajouter, propose une conclusion ou un plan d'action
- Parle naturellement, comme dans une vraie reunion`;

  const messages = [
    { role: 'user' as const, content: systemPrompt },
    { role: 'assistant' as const, content: `Je suis ${currentAgent.name}, ${currentAgent.role}. Je participe a cette reunion.` },
  ];

  // Build conversation history for context
  const history = previousMessages.map((m: { speaker: string; content: string }) => `${m.speaker}: ${m.content}`).join('\n');

  if (history) {
    messages.push({ role: 'user' as const, content: `Voici ce qui a ete dit jusqu'ici dans la reunion:\n\n${history}\n\nC'est a ton tour de parler. Reagis et apporte ton point de vue de ${currentAgent.role}.` });
  } else {
    messages.push({ role: 'user' as const, content: `La reunion commence. Le sujet est: "${topic}". Ouvre la discussion avec ton point de vue de ${currentAgent.role}.` });
  }

  // Inject user direction if provided
  if (userDirection) {
    messages.push({ role: 'user' as const, content: `Le participant donne cette orientation : "${userDirection}"` });
  }

  try {
    const res = await fetch(`${API_BASE}/billing/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages,
        maxTokens: 512,
        temperature: 0.8,
        agentName: currentAgent.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    return NextResponse.json({
      speaker: currentAgent.name,
      speakerRole: currentAgent.role,
      speakerId: currentAgent.id,
      content: data.content ?? data.text ?? '',
      tokens: data.totalTokens ?? 0,
      cost: data.billedCredits ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
