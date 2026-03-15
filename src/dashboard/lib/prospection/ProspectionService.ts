// Prospection Service — Freenzy.io Lead Generation
// Uses FREE sources only: API Recherche Entreprises (data.gouv.fr) + Claude Haiku for analysis

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProspectSearchParams {
  sector: string;        // "plombier", "restaurant", "avocat"
  city: string;          // "Lyon", "Paris 15e"
  radius?: number;       // km, default 20
  maxResults?: number;   // default 10, max 50
}

export interface Prospect {
  id: string;
  name: string;
  sector: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  email?: string;
  googleRating?: number;
  googleReviewCount?: number;
  siret?: string;
  digitalScore: number;  // 0-100 based on web presence
  opportunities: string[];
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProspectSearchResult {
  prospects: Prospect[];
  totalFound: number;
  searchParams: ProspectSearchParams;
  timestamp: string;
  sources: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateProspectId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `fz-prospect-${ts}-${rand}`;
}

// ── API Recherche Entreprises (data.gouv.fr — FREE, no API key) ─────────────

interface SireneEtablissement {
  siret?: string;
  nom?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  activite_principale?: string;
  libelle_activite_principale?: string;
  siege?: {
    siret?: string;
    adresse?: string;
    commune?: string;
    code_postal?: string;
    geo_adresse?: string;
    latitude?: number;
    longitude?: number;
  };
  nombre_etablissements?: number;
  tranche_effectif_salarie?: string;
  date_creation?: string;
  matching_etablissements?: Array<{
    siret?: string;
    adresse?: string;
    commune?: string;
    code_postal?: string;
    activite_principale?: string;
  }>;
}

interface SireneResponse {
  results?: SireneEtablissement[];
  total_results?: number;
}

async function searchSirene(
  sector: string,
  city: string,
  limit: number
): Promise<{ results: SireneEtablissement[]; total: number }> {
  try {
    const query = encodeURIComponent(sector);
    const commune = encodeURIComponent(city);
    const url = `https://api.recherche-entreprises.fabrique.social.gouv.fr/api/v1/search?query=${query}&commune=${commune}&limit=${limit}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'FreenzyBot/1.0' },
    });

    if (!res.ok) {
      return { results: [], total: 0 };
    }

    const json: SireneResponse = await res.json();
    return {
      results: Array.isArray(json.results) ? json.results : [],
      total: typeof json.total_results === 'number' ? json.total_results : 0,
    };
  } catch {
    return { results: [], total: 0 };
  }
}

// ── Digital Score Calculation ────────────────────────────────────────────────

function calculateDigitalScore(entry: SireneEtablissement): number {
  let score = 0;

  // Has a SIRET → registered business (+15)
  if (entry.siret || entry.siege?.siret) score += 15;

  // Has an address (+10)
  if (entry.siege?.adresse || entry.siege?.geo_adresse) score += 10;

  // Has geolocation (+5)
  if (entry.siege?.latitude && entry.siege?.longitude) score += 5;

  // Has NAF/activity code (+10)
  if (entry.activite_principale) score += 10;

  // Has employees info (+10)
  if (entry.tranche_effectif_salarie && entry.tranche_effectif_salarie !== 'NN') score += 10;

  // Multiple establishments = larger company (+10)
  if (entry.nombre_etablissements && entry.nombre_etablissements > 1) score += 10;

  // Older company = more established (+10)
  if (entry.date_creation) {
    const age = new Date().getFullYear() - new Date(entry.date_creation).getFullYear();
    if (age > 5) score += 10;
    else if (age > 2) score += 5;
  }

  // Base score for being found in registry (+20)
  score += 20;

  // Without website/Google data from this free source, cap at 80
  return Math.min(score, 80);
}

function determineConfidence(entry: SireneEtablissement): 'high' | 'medium' | 'low' {
  const hasSiret = !!(entry.siret || entry.siege?.siret);
  const hasAddress = !!(entry.siege?.adresse || entry.siege?.geo_adresse);
  const hasActivity = !!entry.activite_principale;

  if (hasSiret && hasAddress && hasActivity) return 'high';
  if (hasSiret || (hasAddress && hasActivity)) return 'medium';
  return 'low';
}

// ── AI Opportunities (Claude Haiku — quick analysis) ─────────────────────────

async function generateOpportunities(
  prospects: Prospect[],
  sector: string,
  city: string
): Promise<Map<string, string[]>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const opportunitiesMap = new Map<string, string[]>();

  if (!apiKey || prospects.length === 0) {
    // Fallback: generic opportunities based on sector
    for (const p of prospects) {
      opportunitiesMap.set(p.id, getDefaultOpportunities(sector));
    }
    return opportunitiesMap;
  }

  try {
    const summaries = prospects.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      sector: p.sector,
      city: p.city,
      siret: p.siret || 'N/A',
      digitalScore: p.digitalScore,
    }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `Tu es un expert en prospection commerciale pour Freenzy.io.
Pour chaque entreprise, donne 2-3 opportunites commerciales courtes (1 phrase chacune).
Retourne un JSON: { "opportunities": { "<id>": ["opp1", "opp2"] } }
Retourne UNIQUEMENT le JSON, sans markdown.`,
        messages: [
          {
            role: 'user',
            content: `Secteur: ${sector}, Ville: ${city}\nEntreprises:\n${JSON.stringify(summaries)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      for (const p of prospects) {
        opportunitiesMap.set(p.id, getDefaultOpportunities(sector));
      }
      return opportunitiesMap;
    }

    const json = await res.json();
    const text: string = json?.content?.[0]?.text || '';
    const parsed = JSON.parse(text);

    if (parsed.opportunities && typeof parsed.opportunities === 'object') {
      for (const p of prospects) {
        const opps = parsed.opportunities[p.id];
        if (Array.isArray(opps)) {
          opportunitiesMap.set(
            p.id,
            opps.filter((o: unknown): o is string => typeof o === 'string').slice(0, 3)
          );
        } else {
          opportunitiesMap.set(p.id, getDefaultOpportunities(sector));
        }
      }
    } else {
      for (const p of prospects) {
        opportunitiesMap.set(p.id, getDefaultOpportunities(sector));
      }
    }

    return opportunitiesMap;
  } catch {
    for (const p of prospects) {
      opportunitiesMap.set(p.id, getDefaultOpportunities(sector));
    }
    return opportunitiesMap;
  }
}

function getDefaultOpportunities(sector: string): string[] {
  return [
    `Proposer une solution de visibilite en ligne pour ${sector}`,
    'Automatiser la gestion des rendez-vous et du suivi client',
    'Mettre en place une strategie de communication digitale',
  ];
}

// ── Convert SIRENE result to Prospect ────────────────────────────────────────

function sireneToProspect(entry: SireneEtablissement, sector: string): Prospect {
  const name = entry.nom_complet || entry.nom_raison_sociale || entry.nom || 'Entreprise inconnue';
  const siret = entry.siege?.siret || entry.siret || undefined;
  const address = entry.siege?.geo_adresse || entry.siege?.adresse || '';
  const city = entry.siege?.commune || '';

  return {
    id: generateProspectId(),
    name,
    sector: entry.libelle_activite_principale || sector,
    address,
    city,
    phone: undefined,
    website: undefined,
    email: undefined,
    googleRating: undefined,
    googleReviewCount: undefined,
    siret,
    digitalScore: calculateDigitalScore(entry),
    opportunities: [],
    source: 'API Recherche Entreprises (data.gouv.fr)',
    confidence: determineConfidence(entry),
  };
}

// ── Main Search ──────────────────────────────────────────────────────────────

async function searchProspects(params: ProspectSearchParams): Promise<ProspectSearchResult> {
  const { sector, city, maxResults = 10 } = params;
  const limit = Math.min(Math.max(1, maxResults), 50);

  // Step 1: Search via API SIRENE
  const sireneData = await searchSirene(sector, city, limit);

  // Step 2: Convert to Prospect[] with digitalScore
  const prospects: Prospect[] = sireneData.results
    .slice(0, limit)
    .map((entry) => sireneToProspect(entry, sector));

  // Step 3: Generate opportunities via Claude Haiku (batch for efficiency)
  const opportunitiesMap = await generateOpportunities(prospects, sector, city);
  for (const prospect of prospects) {
    prospect.opportunities = opportunitiesMap.get(prospect.id) || getDefaultOpportunities(sector);
  }

  // Sort by digitalScore descending
  prospects.sort((a, b) => b.digitalScore - a.digitalScore);

  return {
    prospects,
    totalFound: sireneData.total,
    searchParams: params,
    timestamp: new Date().toISOString(),
    sources: ['API Recherche Entreprises (data.gouv.fr)', 'Claude Haiku (analyse opportunites)'],
  };
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(prospects: Prospect[]): string {
  const headers = 'Nom,Secteur,Adresse,Ville,Telephone,Site Web,Email,Note Google,Avis,SIRET,Score Digital,Opportunites';

  const escapeCSV = (value: string | undefined | number): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = prospects.map((p) =>
    [
      escapeCSV(p.name),
      escapeCSV(p.sector),
      escapeCSV(p.address),
      escapeCSV(p.city),
      escapeCSV(p.phone),
      escapeCSV(p.website),
      escapeCSV(p.email),
      escapeCSV(p.googleRating),
      escapeCSV(p.googleReviewCount),
      escapeCSV(p.siret),
      escapeCSV(p.digitalScore),
      escapeCSV(p.opportunities.join(' | ')),
    ].join(',')
  );

  return [headers, ...rows].join('\n');
}

// ── localStorage persistence ─────────────────────────────────────────────────

function saveToMemory(prospects: Prospect[]): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem('fz_prospects');
    const saved: Prospect[] = existing ? JSON.parse(existing) : [];

    // Dedup by SIRET (if available) or name+city
    const existingKeys = new Set(
      saved.map((p) => p.siret || `${p.name.toLowerCase()}|${p.city.toLowerCase()}`)
    );

    const newProspects = prospects.filter((p) => {
      const key = p.siret || `${p.name.toLowerCase()}|${p.city.toLowerCase()}`;
      return !existingKeys.has(key);
    });

    const merged = [...saved, ...newProspects];
    localStorage.setItem('fz_prospects', JSON.stringify(merged));
  } catch {
    // localStorage might be full or unavailable — silently fail
  }
}

// ── Export ────────────────────────────────────────────────────────────────────

export const ProspectionService = {
  searchProspects,
  exportCSV,
  saveToMemory,
};
