import { NextRequest, NextResponse } from 'next/server';
import { verifyApiToken, isAuthError } from '../_auth';

// ─── Types ───

interface RepondeurConfig {
  active: boolean;
  greeting: string;
  voice: string;
  language: string;
  mode: string;
  scheduleFrom: string;
  scheduleTo: string;
  schedule24h: boolean;
  phoneNumber: string;
  escalationNumber: string;
}

interface RepondeurStats {
  callsToday: number;
  callsTotal: number;
  avgDuration: number;
  messagesTaken: number;
  resolutionRate: number;
}

interface CallRecord {
  id: string;
  date: string;
  caller: string;
  duration: number;
  status: 'resolved' | 'message' | 'escalated' | 'missed';
  transcript?: string;
}

// ─── In-memory storage (keyed by user token/userId) ───

const configStore = new Map<string, RepondeurConfig>();
const statsStore = new Map<string, RepondeurStats>();
const historyStore = new Map<string, CallRecord[]>();

const DEFAULT_CONFIG: RepondeurConfig = {
  active: false,
  greeting: "Bonjour, vous êtes bien chez [nom entreprise]. Je suis Camille, votre assistante. Comment puis-je vous aider ?",
  voice: 'aura-2-agathe-fr',
  language: 'fr',
  mode: 'auto',
  scheduleFrom: '08:00',
  scheduleTo: '20:00',
  schedule24h: false,
  phoneNumber: '',
  escalationNumber: '',
};

const DEFAULT_STATS: RepondeurStats = {
  callsToday: 0,
  callsTotal: 0,
  avgDuration: 0,
  messagesTaken: 0,
  resolutionRate: 0,
};

// ─── Simulated AI responses for test-call ───

const SIMULATED_RESPONSES = [
  "Bien sûr, je prends note de votre demande. Je la transmettrai à l'équipe concernée dans les plus brefs délais.",
  "Je comprends votre préoccupation. D'après les informations dont je dispose, votre dossier est en cours de traitement.",
  "Merci pour votre appel. J'ai bien enregistré votre message et un membre de l'équipe vous recontactera sous 24 heures.",
  "Absolument, je peux vous aider avec ça. Souhaitez-vous prendre rendez-vous ?",
];

// ─── Route Handler ───

export async function POST(req: NextRequest) {
  // Authenticate
  const auth = await verifyApiToken(req);
  if (isAuthError(auth)) return auth;

  const { userId } = auth;

  let body: { action: string; [key: string]: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action } = body;

  switch (action) {
    // ─── Get Config ───
    case 'get-config': {
      const config = configStore.get(userId) || { ...DEFAULT_CONFIG };
      return NextResponse.json({ success: true, config });
    }

    // ─── Save Config ───
    case 'save-config': {
      const data = body.config as Partial<RepondeurConfig> | undefined;
      if (!data) {
        return NextResponse.json({ error: 'Missing config data' }, { status: 400 });
      }
      const existing = configStore.get(userId) || { ...DEFAULT_CONFIG };
      const updated: RepondeurConfig = {
        ...existing,
        ...data,
        // Ensure phoneNumber stays read-only from client perspective
        phoneNumber: existing.phoneNumber,
      };
      configStore.set(userId, updated);
      return NextResponse.json({ success: true, config: updated });
    }

    // ─── Toggle Active ───
    case 'toggle': {
      const existing = configStore.get(userId) || { ...DEFAULT_CONFIG };
      existing.active = !existing.active;
      configStore.set(userId, existing);
      return NextResponse.json({ success: true, active: existing.active });
    }

    // ─── Get Stats ───
    case 'get-stats': {
      const stats = statsStore.get(userId) || { ...DEFAULT_STATS };
      return NextResponse.json({ success: true, stats });
    }

    // ─── Get History ───
    case 'get-history': {
      const history = historyStore.get(userId) || [];
      return NextResponse.json({ success: true, history });
    }

    // ─── Test Call (simulated) ───
    case 'test-call': {
      const callerMessage = (body.message as string) || '';
      const config = configStore.get(userId) || { ...DEFAULT_CONFIG };
      const response = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];

      return NextResponse.json({
        success: true,
        greeting: config.greeting,
        response,
        callerMessage,
        agent: 'sarah-repondeur',
        voice: config.voice,
        language: config.language,
      });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 },
      );
  }
}
