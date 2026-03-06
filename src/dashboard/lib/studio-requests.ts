// ═══════════════════════════════════════════════════════
// Freenzy.io — Studio: Agent Media Requests
// Allows agents to request photos/videos from the Studio
// ═══════════════════════════════════════════════════════

export interface StudioRequestSpec {
  style?: string;
  dimensions?: string;
  quantity?: number;
  format?: string;
  notes?: string;
}

export interface StudioRequest {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  type: 'photo' | 'video';
  title: string;
  description: string;
  specs: StudioRequestSpec;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  results: string[]; // fulfilled media URLs
  completedAt?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface VideoLibraryItem {
  id: string;
  url: string;
  script: string;
  workflow: string;
  provider: string;
  estimatedDuration?: number; // seconds
  createdAt: string;
  requestId?: string;
  projectName?: string;
}

const REQUESTS_KEY = 'fz_studio_requests';
const VIDEO_LIBRARY_KEY = 'fz_video_library';

// ── Requests CRUD ────────────────────────────────────────────────────────────

export function getRequests(): StudioRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getRequestsByType(type: 'photo' | 'video'): StudioRequest[] {
  return getRequests().filter(r => r.type === type);
}

export function getPendingRequests(type?: 'photo' | 'video'): StudioRequest[] {
  const all = getRequests();
  return all.filter(r =>
    (r.status === 'pending' || r.status === 'in-progress') &&
    (type === undefined || r.type === type)
  );
}

export function saveRequest(req: StudioRequest): void {
  try {
    const list = getRequests();
    const idx = list.findIndex(r => r.id === req.id);
    if (idx >= 0) list[idx] = req;
    else list.unshift(req);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  } catch { /* storage full */ }
}

export function createRequest(req: Omit<StudioRequest, 'id' | 'createdAt' | 'results' | 'status'>): StudioRequest {
  const full: StudioRequest = {
    ...req,
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending',
    results: [],
    createdAt: new Date().toISOString(),
  };
  saveRequest(full);
  return full;
}

export function startWorkOnRequest(id: string): void {
  const list = getRequests();
  const r = list.find(r => r.id === id);
  if (r && r.status === 'pending') {
    r.status = 'in-progress';
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  }
}

export function fulfillRequest(id: string, urls: string[]): void {
  const list = getRequests();
  const r = list.find(r => r.id === id);
  if (r) {
    r.status = 'completed';
    r.results = urls;
    r.completedAt = new Date().toISOString();
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  }
}

export function cancelRequest(id: string): void {
  const list = getRequests();
  const r = list.find(r => r.id === id);
  if (r) {
    r.status = 'cancelled';
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  }
}

export function deleteRequest(id: string): void {
  const list = getRequests().filter(r => r.id !== id);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

// ── Video Library CRUD ───────────────────────────────────────────────────────

export function getVideoLibrary(): VideoLibraryItem[] {
  try {
    const raw = localStorage.getItem(VIDEO_LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveVideoToLibrary(item: Omit<VideoLibraryItem, 'id' | 'createdAt'>): VideoLibraryItem {
  const full: VideoLibraryItem = {
    ...item,
    id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const list = getVideoLibrary();
    list.unshift(full);
    // Keep max 30 entries
    if (list.length > 30) list.length = 30;
    localStorage.setItem(VIDEO_LIBRARY_KEY, JSON.stringify(list));
  } catch { /* storage full */ }
  return full;
}

export function deleteVideoFromLibrary(id: string): void {
  const list = getVideoLibrary().filter(v => v.id !== id);
  localStorage.setItem(VIDEO_LIBRARY_KEY, JSON.stringify(list));
}

export function setVideoProject(id: string, projectName: string): void {
  const list = getVideoLibrary();
  const v = list.find(v => v.id === id);
  if (v) {
    v.projectName = projectName;
    localStorage.setItem(VIDEO_LIBRARY_KEY, JSON.stringify(list));
  }
}

// ── Demo seed ────────────────────────────────────────────────────────────────
// Inject example requests so users see the feature in action
// Only seeds once per browser session

export function seedDemoRequestsIfEmpty(): void {
  try {
    const already = sessionStorage.getItem('fz_studio_demo_seeded');
    if (already) return;
    const existing = getRequests();
    if (existing.length > 0) return; // already has data, don't seed
    sessionStorage.setItem('fz_studio_demo_seeded', '1');

    const demos: Omit<StudioRequest, 'id' | 'createdAt' | 'results' | 'status'>[] = [
      {
        agentId: 'fz-reseaux-sociaux',
        agentName: 'Agent Réseaux Sociaux',
        agentEmoji: 'phone_iphone',
        agentColor: '#e879f9',
        type: 'photo',
        title: '3 visuels Instagram — Lancement produit',
        description: 'Besoin de 3 visuels accrocheurs pour annoncer le lancement d\'une nouvelle offre Premium. Fond sombre élégant, éléments dorés, espace pour texte en overlay. Format carré 1080x1080.',
        specs: { style: 'minimalist', dimensions: 'social-post', quantity: 3 },
        priority: 'high',
      },
      {
        agentId: 'fz-commercial',
        agentName: 'Agent Commercial',
        agentEmoji: 'work',
        agentColor: '#3b82f6',
        type: 'photo',
        title: 'Bannière LinkedIn — Profil entreprise',
        description: 'Bannière professionnelle pour le profil LinkedIn de l\'entreprise. Dégradé bleu marine vers indigo, géométrie subtile, espace à droite pour le logo. Format 1200x627.',
        specs: { style: 'flat-design', dimensions: 'linkedin', quantity: 1 },
        priority: 'normal',
      },
      {
        agentId: 'fz-marketing',
        agentName: 'Agent Marketing',
        agentEmoji: 'campaign',
        agentColor: '#f59e0b',
        type: 'video',
        title: 'Vidéo présentation — Offre entreprise 60s',
        description: 'Script de présentation de 60 secondes pour la nouvelle offre entreprise. Ton professionnel et dynamique. À utiliser pour les campagnes LinkedIn et email.',
        specs: { format: 'landscape', quantity: 1 },
        priority: 'normal',
      },
    ];

    demos.forEach(d => createRequest(d));
  } catch { /* sessionStorage unavailable */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function formatRequestAge(createdAt: string): string {
  try {
    const diff = Date.now() - new Date(createdAt).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `il y a ${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h}h`;
    return `il y a ${Math.floor(h / 24)}j`;
  } catch { return ''; }
}

export const PRIORITY_LABELS: Record<string, string> = {
  high: 'Urgent',
  normal: 'Normal',
  low: 'Faible',
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  normal: '#f59e0b',
  low: '#6b7280',
};
