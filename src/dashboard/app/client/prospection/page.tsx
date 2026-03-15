'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { useIsMobile } from '@/lib/use-media-query';
import { CU, pageContainer, headerRow, tabBar } from '@/lib/page-styles';

// ─── Types ───────────────────────────────────────────────────

interface Prospect {
  id: string;
  name: string;
  sector: string;
  address: string;
  city: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  siret: string | null;
  digitalScore: number;
  opportunities: string[];
  confidence: 'high' | 'medium' | 'low';
  savedAt?: string;
}

interface SearchParams {
  sector: string;
  city: string;
  radius: number;
  maxResults: number;
}

interface SearchResult {
  prospects: Prospect[];
  sector: string;
  city: string;
  timestamp: string;
}

type TabKey = 'search' | 'saved';

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];
const RESULTS_OPTIONS = [5, 10, 20, 50];

const LS_PROSPECTS = 'fz_prospects';
const LS_SEARCHES = 'fz_prospect_searches';

// ─── Helpers ─────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    const session = localStorage.getItem('fz_session');
    if (session) {
      const parsed: { token?: string } = JSON.parse(session);
      return parsed.token || '';
    }
  } catch { /* ignore */ }
  return '';
}

function loadSavedProspects(): Prospect[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_PROSPECTS);
    return raw ? JSON.parse(raw) as Prospect[] : [];
  } catch { return []; }
}

function saveSavedProspects(prospects: Prospect[]): void {
  localStorage.setItem(LS_PROSPECTS, JSON.stringify(prospects));
}

function loadSearchHistory(): SearchParams[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_SEARCHES);
    return raw ? JSON.parse(raw) as SearchParams[] : [];
  } catch { return []; }
}

function pushSearchHistory(params: SearchParams): void {
  const history = loadSearchHistory();
  history.unshift(params);
  if (history.length > 10) history.length = 10;
  localStorage.setItem(LS_SEARCHES, JSON.stringify(history));
}

function scoreColor(score: number): CSSProperties {
  if (score >= 70) return { background: '#F0FFF4', color: '#38A169' };
  if (score >= 40) return { background: '#FFFFF0', color: '#D69E2E' };
  return { background: '#FFF5F5', color: '#E53E3E' };
}

function confidenceLabel(c: Prospect['confidence']): string {
  if (c === 'high') return '\uD83D\uDFE2 \u00C9lev\u00E9e';
  if (c === 'medium') return '\uD83D\uDFE1 Moyenne';
  return '\uD83D\uDD34 Faible';
}

function exportCSV(prospects: Prospect[]): void {
  const headers = 'Nom,Secteur,Adresse,Ville,T\u00E9l\u00E9phone,Site Web,Email,Note Google,Avis,SIRET,Score Digital,Opportunit\u00E9s\n';
  const rows = prospects.map(p =>
    `"${p.name}","${p.sector}","${p.address}","${p.city}","${p.phone || ''}","${p.website || ''}","${p.email || ''}","${p.googleRating || ''}","${p.googleReviewCount || ''}","${p.siret || ''}","${p.digitalScore}","${p.opportunities?.join('; ') || ''}"`
  ).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prospects-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────

export default function ProspectionPage() {
  const isMobile = useIsMobile();

  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>('search');

  // Form state
  const [sector, setSector] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(20);
  const [maxResults, setMaxResults] = useState(10);

  // Search state
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  // Saved prospects
  const [savedProspects, setSavedProspects] = useState<Prospect[]>([]);

  // Expanded cards
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Load saved prospects on mount
  useEffect(() => {
    setSavedProspects(loadSavedProspects());
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSearch = useCallback(async () => {
    if (!sector.trim() || !city.trim()) {
      setError('Veuillez remplir le secteur et la ville.');
      return;
    }
    setError('');
    setLoading(true);
    setSearchResult(null);

    const params: SearchParams = { sector: sector.trim(), city: city.trim(), radius, maxResults };
    pushSearchHistory(params);

    try {
      const res = await fetch('/api/prospection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Erreur serveur' })) as { error?: string };
        throw new Error(body.error || `Erreur ${res.status}`);
      }

      const data = await res.json() as { prospects: Prospect[] };
      setSearchResult({
        prospects: data.prospects,
        sector: params.sector,
        city: params.city,
        timestamp: new Date().toLocaleString('fr-FR'),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sector, city, radius, maxResults]);

  const handleExportResults = useCallback(async () => {
    if (!searchResult) return;
    try {
      const res = await fetch('/api/prospection/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ prospects: searchResult.prospects }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prospects-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch { /* fallback below */ }
    exportCSV(searchResult.prospects);
  }, [searchResult]);

  const handleSaveAll = useCallback(() => {
    if (!searchResult) return;
    const existing = loadSavedProspects();
    const existingIds = new Set(existing.map(p => p.id));
    const newOnes = searchResult.prospects
      .filter(p => !existingIds.has(p.id))
      .map(p => ({ ...p, savedAt: new Date().toISOString() }));
    const updated = [...newOnes, ...existing];
    saveSavedProspects(updated);
    setSavedProspects(updated);
  }, [searchResult]);

  const handleDeleteSaved = useCallback((id: string) => {
    const updated = savedProspects.filter(p => p.id !== id);
    saveSavedProspects(updated);
    setSavedProspects(updated);
  }, [savedProspects]);

  const handleNewSearch = useCallback(() => {
    setSector('');
    setCity('');
    setRadius(20);
    setMaxResults(10);
    setSearchResult(null);
    setError('');
    setExpandedIds(new Set());
  }, []);

  // ─── Styles ────────────────────────────────────────────────

  const formRow: CSSProperties = {
    display: 'flex',
    gap: 12,
    flexDirection: isMobile ? 'column' : 'row',
  };

  const fieldWrap: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const selectFull: CSSProperties = {
    ...CU.select,
    width: '100%',
  };

  const actionBar: CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  };

  const prospectCard: CSSProperties = {
    ...CU.card,
    marginBottom: 10,
  };

  const chipStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    background: CU.bgSecondary,
    fontSize: 11,
    color: CU.textSecondary,
    marginRight: 4,
    marginBottom: 4,
  };

  const scoreBadge = (score: number): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    ...scoreColor(score),
  });

  // ─── Render Prospect Card ─────────────────────────────────

  function renderProspect(p: Prospect, showDelete: boolean) {
    const isExpanded = expandedIds.has(p.id);

    return (
      <div key={p.id} style={prospectCard}>
        {/* Row 1: Name + score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: CU.text }}>{p.name}</span>
          <span style={scoreBadge(p.digitalScore)}>Score {p.digitalScore}/100</span>
        </div>

        {/* Row 2: Address */}
        <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 4 }}>
          {'\uD83D\uDCCD'} {p.address}, {p.city}
        </div>

        {/* Row 3: Contact info */}
        <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 4, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {p.phone && <span>{'\uD83D\uDCDE'} {p.phone}</span>}
          {p.website && (
            <a
              href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: CU.textSecondary, textDecoration: 'underline' }}
            >
              {'\uD83C\uDF10'} Site web
            </a>
          )}
          {p.email && <span>{'\uD83D\uDCE7'} {p.email}</span>}
        </div>

        {/* Row 4: Google rating */}
        {p.googleRating !== null && (
          <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 4 }}>
            {'\u2B50'} {p.googleRating}/5 ({p.googleReviewCount || 0} avis)
          </div>
        )}

        {/* Expandable content */}
        {isExpanded && (
          <>
            {/* SIRET */}
            {p.siret && (
              <div style={{ fontSize: 13, color: CU.textMuted, marginBottom: 4 }}>
                SIRET : {p.siret}
              </div>
            )}

            {/* Opportunities */}
            {p.opportunities.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: CU.textSecondary, fontWeight: 500 }}>Opportunit\u00E9s :</span>
                <div style={{ marginTop: 4 }}>
                  {p.opportunities.map((opp, i) => (
                    <span key={i} style={chipStyle}>{opp}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence */}
            <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 4 }}>
              Confiance : {confidenceLabel(p.confidence)}
            </div>
          </>
        )}

        {/* Toggle + Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <button
            onClick={() => toggleExpand(p.id)}
            style={{ ...CU.btnSmall, fontSize: 12 }}
          >
            {isExpanded ? 'Voir moins \u25B2' : 'Voir plus \u25BC'}
          </button>
          {showDelete && (
            <button
              onClick={() => handleDeleteSaved(p.id)}
              style={{ ...CU.btnSmall, color: CU.danger, borderColor: CU.danger }}
            >
              {'\uD83D\uDDD1\uFE0F'} Supprimer
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={headerRow()}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>{'\uD83D\uDD0D'}</span>
        <div>
          <h1 style={CU.pageTitle}>Prospection</h1>
          <p style={CU.pageSubtitle}>Trouvez des prospects qualifi\u00E9s dans votre secteur</p>
        </div>
      </div>

      {/* Credit badge */}
      <div style={{ marginBottom: 20, marginTop: 8 }}>
        <span style={{ ...CU.badge, background: '#FFFFF0', color: '#D69E2E' }}>
          {'\u26A1'} 2 cr\u00E9dits par recherche
        </span>
      </div>

      {/* Tabs */}
      <div style={tabBar()}>
        <button
          style={activeTab === 'search' ? CU.tabActive : CU.tab}
          onClick={() => setActiveTab('search')}
        >
          {'\uD83D\uDD0D'} Recherche
        </button>
        <button
          style={activeTab === 'saved' ? CU.tabActive : CU.tab}
          onClick={() => setActiveTab('saved')}
        >
          {'\uD83D\uDCBE'} Mes prospects ({savedProspects.length})
        </button>
      </div>

      {/* ═══ SEARCH TAB ═══ */}
      {activeTab === 'search' && (
        <>
          {/* Search Form */}
          <div style={{ ...CU.card, marginBottom: 20 }}>
            {/* Row 1: Sector + City */}
            <div style={{ ...formRow, marginBottom: 12 }}>
              <div style={fieldWrap}>
                <label style={CU.label}>Secteur</label>
                <input
                  type="text"
                  style={CU.input}
                  placeholder="Ex: plombier, restaurant, avocat..."
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                />
              </div>
              <div style={fieldWrap}>
                <label style={CU.label}>Ville</label>
                <input
                  type="text"
                  style={CU.input}
                  placeholder="Ex: Lyon, Paris 15e, Marseille..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                />
              </div>
            </div>

            {/* Row 2: Radius + Max results */}
            <div style={{ ...formRow, marginBottom: 16 }}>
              <div style={fieldWrap}>
                <label style={CU.label}>Rayon</label>
                <select
                  style={selectFull}
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                >
                  {RADIUS_OPTIONS.map(r => (
                    <option key={r} value={r}>{r} km</option>
                  ))}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={CU.label}>Nombre de r\u00E9sultats</label>
                <select
                  style={selectFull}
                  value={maxResults}
                  onChange={e => setMaxResults(Number(e.target.value))}
                >
                  {RESULTS_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Search button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                ...CU.btnPrimary,
                width: isMobile ? '100%' : 'auto',
                minHeight: 44,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'fz-spin 0.6s linear infinite',
                    }}
                  />
                  Recherche en cours...
                </>
              ) : (
                <>{'\uD83D\uDD0D'} Rechercher</>
              )}
            </button>

            {error && (
              <div style={{ marginTop: 10, fontSize: 13, color: CU.danger }}>{error}</div>
            )}
          </div>

          {/* Results */}
          {searchResult && searchResult.prospects.length > 0 && (
            <>
              {/* Stats bar */}
              <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 12 }}>
                {searchResult.prospects.length} r\u00E9sultat{searchResult.prospects.length > 1 ? 's' : ''} trouv\u00E9{searchResult.prospects.length > 1 ? 's' : ''}
                {' \u00B7 '}Secteur : {searchResult.sector}
                {' \u00B7 '}Ville : {searchResult.city}
                {' \u00B7 '}{searchResult.timestamp}
              </div>

              {/* Action bar */}
              <div style={actionBar}>
                <button style={CU.btnGhost} onClick={handleExportResults}>
                  {'\uD83D\uDCE5'} Exporter CSV
                </button>
                <button style={CU.btnGhost} onClick={handleSaveAll}>
                  {'\uD83D\uDCBE'} Sauvegarder
                </button>
                <button style={CU.btnGhost} onClick={handleNewSearch}>
                  {'\uD83D\uDD04'} Nouvelle recherche
                </button>
              </div>

              {/* Prospect cards */}
              {searchResult.prospects.map(p => renderProspect(p, false))}
            </>
          )}

          {/* No results */}
          {searchResult && searchResult.prospects.length === 0 && (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\uD83D\uDE45'}</div>
              <div style={CU.emptyTitle}>Aucun r\u00E9sultat trouv\u00E9</div>
              <div style={CU.emptyDesc}>
                Essayez un autre secteur ou une autre ville.
              </div>
              <button style={CU.btnPrimary} onClick={handleNewSearch}>
                {'\uD83D\uDD04'} Nouvelle recherche
              </button>
            </div>
          )}

          {/* No search yet */}
          {!searchResult && !loading && (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\uD83D\uDD0D'}</div>
              <div style={CU.emptyTitle}>Lancez votre premi\u00E8re recherche</div>
              <div style={CU.emptyDesc}>
                Renseignez un secteur et une ville pour d\u00E9couvrir des prospects qualifi\u00E9s pr\u00E8s de chez vous.
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ SAVED TAB ═══ */}
      {activeTab === 'saved' && (
        <>
          {savedProspects.length > 0 ? (
            <>
              <div style={actionBar}>
                <button style={CU.btnGhost} onClick={() => exportCSV(savedProspects)}>
                  {'\uD83D\uDCE5'} Exporter tout en CSV
                </button>
              </div>
              {savedProspects.map(p => renderProspect(p, true))}
            </>
          ) : (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>{'\uD83D\uDCBE'}</div>
              <div style={CU.emptyTitle}>Aucun prospect sauvegard\u00E9</div>
              <div style={CU.emptyDesc}>
                Lancez une recherche et sauvegardez les r\u00E9sultats.
              </div>
              <button style={CU.btnPrimary} onClick={() => setActiveTab('search')}>
                {'\uD83D\uDD0D'} Aller \u00E0 la recherche
              </button>
            </div>
          )}
        </>
      )}

      {/* Spinner keyframe (injected once) */}
      <style>{`
        @keyframes fz-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
