// Intelligence Gatherer — Freenzy.io Onboarding
// Parallel search engine: Pappers + Google Places + Website + Competitors + AI Synthesis

interface IntelligenceInput {
  prenom: string;
  nom: string;
  company_name: string;
  rue: string;
  ville: string;
  cp: string;
  pays: string;
  site_web: string;
}

interface Concurrent {
  nom: string;
  rating: number;
  review_count: number;
}

interface Opportunite {
  titre: string;
  description: string;
  priorite: 'haute' | 'moyenne' | 'basse';
  agent_recommande: string;
}

interface IntelligenceResult {
  siret: string | null;
  siren: string | null;
  forme_juridique: string | null;
  date_creation: string | null;
  capital_social: number | null;
  naf_code: string | null;
  naf_label: string | null;
  gmb_rating: number | null;
  gmb_review_count: number | null;
  site_title: string | null;
  site_description: string | null;
  concurrents: Concurrent[];
  profession_detectee: string;
  sub_profession: string;
  activite_resume: string;
  maturite_digitale: string;
  opportunites: Opportunite[];
  agents_recommandes: string[];
  pain_point_principal: string;
  message_accueil: string;
}

export function getEmptyResult(): IntelligenceResult {
  return {
    siret: null,
    siren: null,
    forme_juridique: null,
    date_creation: null,
    capital_social: null,
    naf_code: null,
    naf_label: null,
    gmb_rating: null,
    gmb_review_count: null,
    site_title: null,
    site_description: null,
    concurrents: [],
    profession_detectee: '',
    sub_profession: '',
    activite_resume: '',
    maturite_digitale: 'inconnue',
    opportunites: [],
    agents_recommandes: ['fz-commercial', 'fz-marketing', 'fz-assistant'],
    pain_point_principal: '',
    message_accueil: '',
  };
}

// ── 1. Pappers (French company registry, free endpoint) ──────────────────────

interface PappersData {
  siret: string | null;
  siren: string | null;
  forme_juridique: string | null;
  date_creation: string | null;
  capital_social: number | null;
  naf_code: string | null;
  naf_label: string | null;
}

async function searchPappers(companyName: string, cp: string): Promise<PappersData> {
  const empty: PappersData = {
    siret: null, siren: null, forme_juridique: null,
    date_creation: null, capital_social: null, naf_code: null, naf_label: null,
  };

  try {
    const q = encodeURIComponent(companyName);
    const url = `https://api.pappers.fr/v2/recherche?q=${q}&code_postal=${encodeURIComponent(cp)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return empty;

    const json = await res.json();
    const results = json?.resultats || json?.results;
    if (!Array.isArray(results) || results.length === 0) return empty;

    const company = results[0];
    return {
      siret: company.siege?.siret || company.siret || null,
      siren: company.siren || null,
      forme_juridique: company.forme_juridique || company.nature_juridique || null,
      date_creation: company.date_creation || null,
      capital_social: typeof company.capital === 'number' ? company.capital : null,
      naf_code: company.siege?.code_naf || company.code_naf || null,
      naf_label: company.siege?.libelle_code_naf || company.libelle_code_naf || null,
    };
  } catch {
    return empty;
  }
}

// ── 2. Google Places (rating & reviews) ──────────────────────────────────────

interface GooglePlacesData {
  gmb_rating: number | null;
  gmb_review_count: number | null;
  place_id: string | null;
}

async function searchGooglePlaces(companyName: string, ville: string): Promise<GooglePlacesData> {
  const empty: GooglePlacesData = { gmb_rating: null, gmb_review_count: null, place_id: null };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return empty;

  try {
    const input = encodeURIComponent(`${companyName} ${ville}`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=rating,user_ratings_total,place_id&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return empty;

    const json = await res.json();
    const candidates = json?.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return empty;

    const place = candidates[0];
    return {
      gmb_rating: typeof place.rating === 'number' ? place.rating : null,
      gmb_review_count: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : null,
      place_id: place.place_id || null,
    };
  } catch {
    return empty;
  }
}

// ── 3. Website Analysis ─────────────────────────────────────────────────────

interface WebsiteData {
  site_title: string | null;
  site_description: string | null;
}

async function analyzeWebsite(siteWeb: string): Promise<WebsiteData> {
  const empty: WebsiteData = { site_title: null, site_description: null };

  if (!siteWeb) return empty;

  try {
    const res = await fetch(siteWeb, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'FreenzyBot/1.0' },
    });

    if (!res.ok) return empty;

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

    return {
      site_title: titleMatch ? titleMatch[1].trim().slice(0, 200) : null,
      site_description: descMatch ? descMatch[1].trim().slice(0, 500) : null,
    };
  } catch {
    return empty;
  }
}

// ── 4. Local Competitors ────────────────────────────────────────────────────

async function searchCompetitors(query: string, ville: string, excludeName: string): Promise<Concurrent[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const q = encodeURIComponent(`${query} ${ville}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return [];

    const json = await res.json();
    const results = json?.results;
    if (!Array.isArray(results)) return [];

    const excludeLower = excludeName.toLowerCase();

    return results
      .filter((r: Record<string, unknown>) => {
        const name = typeof r.name === 'string' ? r.name.toLowerCase() : '';
        return !name.includes(excludeLower);
      })
      .slice(0, 5)
      .map((r: Record<string, unknown>) => ({
        nom: typeof r.name === 'string' ? r.name : 'Inconnu',
        rating: typeof r.rating === 'number' ? r.rating : 0,
        review_count: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : 0,
      }));
  } catch {
    return [];
  }
}

// ── 5. AI Synthesis (Anthropic Haiku) ───────────────────────────────────────

interface AISynthesis {
  profession_detectee: string;
  sub_profession: string;
  activite_resume: string;
  maturite_digitale: string;
  opportunites: Opportunite[];
  agents_recommandes: string[];
  pain_point_principal: string;
  message_accueil: string;
}

function getDefaultSynthesis(input: IntelligenceInput): AISynthesis {
  return {
    profession_detectee: input.company_name,
    sub_profession: '',
    activite_resume: `${input.company_name} basé(e) à ${input.ville}`,
    maturite_digitale: input.site_web ? 'moyenne' : 'faible',
    opportunites: [
      {
        titre: 'Visibilité en ligne',
        description: 'Améliorer votre présence sur Google et les réseaux sociaux',
        priorite: 'haute',
        agent_recommande: 'fz-marketing',
      },
      {
        titre: 'Automatisation administrative',
        description: 'Gagner du temps sur la facturation et le suivi client',
        priorite: 'moyenne',
        agent_recommande: 'fz-assistant',
      },
    ],
    agents_recommandes: ['fz-commercial', 'fz-marketing', 'fz-assistant'],
    pain_point_principal: 'Manque de visibilité en ligne et gestion administrative chronophage',
    message_accueil: `Bienvenue ${input.prenom} ! Freenzy est prêt à booster ${input.company_name}.`,
  };
}

async function synthesizeWithAI(
  input: IntelligenceInput,
  pappers: PappersData,
  places: GooglePlacesData,
  website: WebsiteData,
  concurrents: Concurrent[]
): Promise<AISynthesis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return getDefaultSynthesis(input);

  try {
    const context = JSON.stringify({
      user: { prenom: input.prenom, nom: input.nom, company: input.company_name, ville: input.ville, cp: input.cp, pays: input.pays },
      pappers: { naf_code: pappers.naf_code, naf_label: pappers.naf_label, forme_juridique: pappers.forme_juridique, date_creation: pappers.date_creation },
      google: { rating: places.gmb_rating, reviews: places.gmb_review_count },
      website: { title: website.site_title, description: website.site_description, has_website: !!input.site_web },
      concurrents: concurrents.slice(0, 3),
    });

    const systemPrompt = `Tu es un analyste business pour Freenzy.io, une plateforme IA pour entrepreneurs.
Analyse les données fournies et retourne un JSON strictement conforme à cette structure :
{
  "profession_detectee": "string (ex: Plombier, Avocat, Restaurant)",
  "sub_profession": "string (ex: Plomberie chauffagiste, Droit des affaires)",
  "activite_resume": "string (1-2 phrases résumant l'activité)",
  "maturite_digitale": "forte|moyenne|faible",
  "opportunites": [{"titre":"string","description":"string","priorite":"haute|moyenne|basse","agent_recommande":"fz-xxx"}],
  "agents_recommandes": ["fz-xxx", ...],
  "pain_point_principal": "string",
  "message_accueil": "string (message personnalisé de bienvenue)"
}
Les agents disponibles : fz-commercial, fz-marketing, fz-comptable, fz-juridique, fz-rh, fz-assistant, fz-social-media, fz-seo, fz-crm, fz-support-client.
Retourne UNIQUEMENT le JSON, sans markdown.`;

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
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Voici les données collectées pour ce nouveau client :\n${context}` },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return getDefaultSynthesis(input);

    const json = await res.json();
    const text = json?.content?.[0]?.text || '';

    const parsed = JSON.parse(text);

    return {
      profession_detectee: typeof parsed.profession_detectee === 'string' ? parsed.profession_detectee : input.company_name,
      sub_profession: typeof parsed.sub_profession === 'string' ? parsed.sub_profession : '',
      activite_resume: typeof parsed.activite_resume === 'string' ? parsed.activite_resume : `${input.company_name} à ${input.ville}`,
      maturite_digitale: ['forte', 'moyenne', 'faible'].includes(parsed.maturite_digitale) ? parsed.maturite_digitale : 'inconnue',
      opportunites: Array.isArray(parsed.opportunites) ? parsed.opportunites.map((o: Record<string, unknown>) => ({
        titre: String(o.titre || ''),
        description: String(o.description || ''),
        priorite: ['haute', 'moyenne', 'basse'].includes(String(o.priorite)) ? String(o.priorite) as 'haute' | 'moyenne' | 'basse' : 'moyenne',
        agent_recommande: String(o.agent_recommande || 'fz-assistant'),
      })) : [],
      agents_recommandes: Array.isArray(parsed.agents_recommandes)
        ? parsed.agents_recommandes.filter((a: unknown) => typeof a === 'string')
        : ['fz-commercial', 'fz-marketing', 'fz-assistant'],
      pain_point_principal: typeof parsed.pain_point_principal === 'string' ? parsed.pain_point_principal : '',
      message_accueil: typeof parsed.message_accueil === 'string' ? parsed.message_accueil : `Bienvenue ${input.prenom} !`,
    };
  } catch {
    return getDefaultSynthesis(input);
  }
}

// ── Main Intelligence Gatherer ──────────────────────────────────────────────

export async function intelligenceGather(input: IntelligenceInput): Promise<IntelligenceResult> {
  // Global 20s timeout wrapper
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Global timeout')), 20000);
  });

  try {
    const result = await Promise.race([
      runGathering(input),
      timeoutPromise,
    ]);
    return result;
  } catch {
    // On global timeout, return empty result
    return getEmptyResult();
  }
}

async function runGathering(input: IntelligenceInput): Promise<IntelligenceResult> {
  // Run all 5 searches in parallel
  const [pappersResult, placesResult, websiteResult] = await Promise.allSettled([
    searchPappers(input.company_name, input.cp),
    searchGooglePlaces(input.company_name, input.ville),
    analyzeWebsite(input.site_web),
  ]);

  const pappers: PappersData = pappersResult.status === 'fulfilled'
    ? pappersResult.value
    : { siret: null, siren: null, forme_juridique: null, date_creation: null, capital_social: null, naf_code: null, naf_label: null };

  const places: GooglePlacesData = placesResult.status === 'fulfilled'
    ? placesResult.value
    : { gmb_rating: null, gmb_review_count: null, place_id: null };

  const website: WebsiteData = websiteResult.status === 'fulfilled'
    ? websiteResult.value
    : { site_title: null, site_description: null };

  // Competitors search depends on NAF label for better query
  const competitorQuery = pappers.naf_label || input.company_name;
  const concurrents = await searchCompetitors(competitorQuery, input.ville, input.company_name)
    .catch(() => [] as Concurrent[]);

  // AI synthesis with all gathered data
  const synthesis = await synthesizeWithAI(input, pappers, places, website, concurrents)
    .catch(() => getDefaultSynthesis(input));

  return {
    siret: pappers.siret,
    siren: pappers.siren,
    forme_juridique: pappers.forme_juridique,
    date_creation: pappers.date_creation,
    capital_social: pappers.capital_social,
    naf_code: pappers.naf_code,
    naf_label: pappers.naf_label,
    gmb_rating: places.gmb_rating,
    gmb_review_count: places.gmb_review_count,
    site_title: website.site_title,
    site_description: website.site_description,
    concurrents,
    profession_detectee: synthesis.profession_detectee,
    sub_profession: synthesis.sub_profession,
    activite_resume: synthesis.activite_resume,
    maturite_digitale: synthesis.maturite_digitale,
    opportunites: synthesis.opportunites,
    agents_recommandes: synthesis.agents_recommandes,
    pain_point_principal: synthesis.pain_point_principal,
    message_accueil: synthesis.message_accueil,
  };
}
