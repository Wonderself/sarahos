'use client';

import { useState, useEffect, useRef } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

async function apiCall<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiStatus {
  configured: boolean;
  status: 'ok' | 'error' | 'unreachable' | 'missing_key';
  latency: number | null;
  httpStatus?: number;
  error?: string;
}

interface ModelConfig {
  model_id: string;
  type: 'photo' | 'video';
  label: string;
  credits: number;
  enabled: boolean;
}

interface Generation {
  id: string;
  type: 'photo' | 'video';
  model: string;
  workflow: string;
  prompt: string;
  style: string | null;
  dimensions: string | null;
  result_url: string | null;
  status: string;
  cost: number;
  duration_ms: number | null;
  fal_request_id: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

// ── Style & dimension presets (mirrors backend) ───────────────────────────────

const STYLES = [
  'realistic', 'illustration', 'flat-design', 'watercolor', '3d-render',
  'minimalist', 'cinematic', 'portrait', 'bw', 'film-grain', 'polaroid',
  'vintage', 'oil-painting', 'pencil-sketch', 'impressionist', 'surrealist',
  'pop-art', 'pixel-art', 'comics', 'neon-cyberpunk', 'anime', 'movie-poster',
  'gothic', 'art-deco', 'vaporwave', 'food-photo', 'architecture', 'cartoon-avatar',
];

const DIMS = ['square', 'landscape', 'portrait', 'social-story', 'social-post', 'banner', 'youtube-thumb', 'pinterest', 'linkedin', 'ig-portrait'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtModel(m: string) {
  return m.replace('fal-ai/', '').replace('/v1.6/standard/text-to-video', '');
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudioAdminPage() {
  const [tab, setTab] = useState<'overview' | 'models' | 'history' | 'lab'>('overview');

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Studio fal.ai</h1>
          <p className="page-subtitle">Gestion des modèles, historique et génération directe</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="studio-tab-bar section">
        {(['overview', 'models', 'history', 'lab'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`studio-tab${tab === t ? ' active' : ''}`}
          >
            {t === 'overview' && <><span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle' }}>bar_chart</span> Apercu</>}
            {t === 'models' && <><span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle' }}>tune</span> Modeles</>}
            {t === 'history' && <><span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle' }}>assignment</span> Historique</>}
            {t === 'lab' && <><span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle' }}>science</span> Lab</>}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'models' && <ModelsTab />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'lab' && <LabTab />}
    </div>
  );
}

// ── Tab: Aperçu ───────────────────────────────────────────────────────────────

function OverviewTab() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setTesting(true);
    try {
      const s = await apiCall<ApiStatus>('/admin/studio/api-status');
      setStatus(s);
    } catch { /* empty */ }
    setTesting(false);
  }

  useEffect(() => {
    void loadStatus();
    apiCall<{ generations: Generation[]; total: number }>('/admin/studio/history?limit=10')
      .then(d => { setHistory(d.generations); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const photos = history.filter(g => g.type === 'photo').length;
  const videos = history.filter(g => g.type === 'video').length;
  const credits = history.reduce((s, g) => s + g.cost, 0);

  return (
    <div>
      {/* API Status */}
      <div className="card section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Statut fal.ai API</div>
            {status ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
                <span>
                  Clé :{' '}
                  <span style={{ color: status.configured ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {status.configured ? <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>check_circle</span> Configuree</> : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>error</span> Manquante</>}
                  </span>
                </span>
                <span>
                  Connexion :{' '}
                  <span style={{ color: status.status === 'ok' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {status.status === 'ok' ? <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>check_circle</span> OK</> : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>error</span> {status.status}</>}
                  </span>
                </span>
                {status.latency !== null && (
                  <span style={{ color: 'var(--text-muted)' }}>{status.latency}ms</span>
                )}
                {status.error && (
                  <span style={{ color: 'var(--danger)', fontSize: 11 }}>{status.error}</span>
                )}
              </div>
            ) : (
              <div className="skeleton" style={{ height: 18, width: 280, borderRadius: 4 }} />
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadStatus} disabled={testing}>
            {testing ? 'Test en cours...' : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>refresh</span> Tester la connexion</>}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Générations (affiché)</span>
          <span className="stat-value stat-value-sm">{history.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Photos</span>
          <span className="stat-value stat-value-sm text-accent">{photos}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Vidéos</span>
          <span className="stat-value stat-value-sm" style={{ color: '#1A1A1A' }}>{videos}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Crédits consommés</span>
          <span className="stat-value stat-value-sm text-warning">{credits}</span>
        </div>
      </div>

      {/* Recent */}
      <div className="section">
        <div className="section-title">10 dernières générations</div>
        {loading ? (
          <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 32 }}>palette</span></div>
            <div>Aucune génération. Utilisez le Lab pour tester.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Modèle</th>
                  <th className="hide-mobile">Prompt</th>
                  <th>Statut</th>
                  <th className="text-right hide-mobile">Crédits</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(g => (
                  <tr key={g.id}>
                    <td>
                      <span className={`badge ${g.type === 'photo' ? 'badge-info' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {g.type === 'photo' ? <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>image</span> : <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>movie</span>} {g.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtModel(g.model)}</td>
                    <td className="hide-mobile" style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.prompt?.slice(0, 60) ?? '—'}
                    </td>
                    <td>
                      <span className={`badge ${g.status === 'completed' ? 'badge-success' : g.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="text-right hide-mobile" style={{ fontSize: 12 }}>{g.cost} cr</td>
                    <td className="text-right" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(g.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Modèles ──────────────────────────────────────────────────────────────

function ModelsTab() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<ModelConfig>>>({});
  const [msg, setMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  useEffect(() => {
    apiCall<ModelConfig[]>('/admin/studio/config')
      .then(d => { setModels(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function patch(modelId: string, field: string, value: unknown) {
    setEdits(prev => ({ ...prev, [modelId]: { ...prev[modelId], [field]: value } }));
  }

  async function save(modelId: string) {
    setSaving(modelId);
    try {
      await apiCall(`/admin/studio/config/${encodeURIComponent(modelId)}`, 'PATCH', edits[modelId] ?? {});
      setModels(prev => prev.map(m => m.model_id === modelId ? { ...m, ...(edits[modelId] ?? {}) } as ModelConfig : m));
      setEdits(prev => { const n = { ...prev }; delete n[modelId]; return n; });
      setMsg({ id: modelId, ok: true, text: 'Sauvegarde' });
    } catch (e) {
      setMsg({ id: modelId, ok: false, text: e instanceof Error ? e.message : 'Erreur' });
    }
    setSaving(null);
    setTimeout(() => setMsg(null), 3000);
  }

  const photoModels = models.filter(m => m.type === 'photo');
  const videoModels = models.filter(m => m.type === 'video');

  if (loading) return <div className="skeleton" style={{ height: 300, margin: '24px 0', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div>
      {(['photo', 'video'] as const).map(type => (
        <div key={type} className="section">
          <div className="section-title">
            {type === 'photo' ? <><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>image</span> Modeles Photo</> : <><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>movie</span> Modeles Video</>}
          </div>
          <div className="card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modèle</th>
                  <th>Crédits</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(type === 'photo' ? photoModels : videoModels).map(m => {
                  const edit = edits[m.model_id] ?? {};
                  const currentEnabled = edit.enabled !== undefined ? edit.enabled : m.enabled;
                  const currentCredits = edit.credits !== undefined ? edit.credits : m.credits;
                  const isDirty = Object.keys(edits[m.model_id] ?? {}).length > 0;
                  return (
                    <tr key={m.model_id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{m.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                          {m.model_id}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={9999}
                          value={currentCredits}
                          onChange={e => patch(m.model_id, 'credits', Number(e.target.value))}
                          style={{ width: 72, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)', fontSize: 13 }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>cr</span>
                      </td>
                      <td>
                        <button
                          onClick={() => patch(m.model_id, 'enabled', !currentEnabled)}
                          className={`badge ${currentEnabled ? 'badge-success' : 'badge-neutral'}`}
                          style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                        >
                          {currentEnabled ? <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>check_circle</span> Active</> : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>pause_circle</span> Desactive</>}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => save(m.model_id)}
                            disabled={saving === m.model_id || !isDirty}
                          >
                            {saving === m.model_id ? '…' : 'Sauvegarder'}
                          </button>
                          {msg?.id === m.model_id && (
                            <span style={{ fontSize: 11, color: msg.ok ? 'var(--success)' : 'var(--danger)' }}>{msg.text}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Historique ───────────────────────────────────────────────────────────

function HistoryTab() {
  const [filter, setFilter] = useState<'' | 'photo' | 'video'>('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Generation | null>(null);
  const limit = 20;

  async function load(type: string, off: number) {
    setLoading(true);
    try {
      const d = await apiCall<{ generations: Generation[]; total: number }>(
        `/admin/studio/history?type=${type}&limit=${limit}&offset=${off}`,
      );
      setGenerations(d.generations);
      setTotal(d.total);
    } catch { /* empty */ }
    setLoading(false);
  }

  useEffect(() => { void load(filter, 0); setOffset(0); }, [filter]);

  async function deleteGen(id: string) {
    await apiCall(`/admin/studio/history/${id}`, 'DELETE');
    setGenerations(prev => prev.filter(g => g.id !== id));
    setTotal(t => t - 1);
  }

  const pages = Math.ceil(total / limit);
  const page = Math.floor(offset / limit);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['', 'photo', 'video'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`btn btn-xs ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
          >
            {t === '' ? 'Tous' : t === 'photo' ? <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>image</span> Photos</> : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>movie</span> Videos</>}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{total} générations</span>
        <button className="btn btn-ghost btn-xs" onClick={() => load(filter, offset)}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>refresh</span></button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      ) : generations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>assignment</span></div>
          <div>Aucune génération trouvée.</div>
        </div>
      ) : (
        <>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Modèle</th>
                  <th className="hide-mobile">Prompt</th>
                  <th className="hide-mobile">Source</th>
                  <th>Statut</th>
                  <th className="text-right hide-mobile">Crédits</th>
                  <th className="text-right">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {generations.map(g => (
                  <tr
                    key={g.id}
                    style={{ cursor: g.result_url ? 'pointer' : 'default' }}
                    onClick={() => g.result_url && setPreview(g)}
                  >
                    <td>
                      <span className={`badge ${g.type === 'photo' ? 'badge-info' : 'badge-neutral'}`}>
                        {g.type === 'photo' ? <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>image</span> : <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>movie</span>} {g.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtModel(g.model)}</td>
                    <td className="hide-mobile" style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.prompt?.slice(0, 60) ?? '—'}
                    </td>
                    <td className="hide-mobile" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {g.user_email ?? <span style={{ fontStyle: 'italic' }}>admin-test</span>}
                    </td>
                    <td>
                      <span className={`badge ${g.status === 'completed' ? 'badge-success' : g.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="text-right hide-mobile" style={{ fontSize: 12 }}>{g.cost} cr</td>
                    <td className="text-right" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {fmtDate(g.created_at)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => { if (confirm('Supprimer ?')) deleteGen(g.id); }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-xs" disabled={page === 0} onClick={() => { const o = offset - limit; setOffset(o); load(filter, o); }}>← Préc</button>
              <span style={{ fontSize: 12, alignSelf: 'center', color: 'var(--text-muted)' }}>Page {page + 1} / {pages}</span>
              <button className="btn btn-ghost btn-xs" disabled={page >= pages - 1} onClick={() => { const o = offset + limit; setOffset(o); load(filter, o); }}>Suiv →</button>
            </div>
          )}
        </>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 16, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>{preview.type === 'photo' ? '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>image</span> Photo' : '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>movie</span> Vidéo'} — {fmtModel(preview.model)}</span>
              <button className="btn btn-ghost btn-xs" onClick={() => setPreview(null)}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span></button>
            </div>
            {preview.type === 'photo' && preview.result_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.result_url} alt="generated" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
            )}
            {preview.type === 'video' && preview.result_url && (
              <video src={preview.result_url} controls style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
            )}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}><strong>Prompt :</strong> {preview.prompt}</div>
            {preview.style && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}><strong>Style :</strong> {preview.style}</div>}
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{preview.cost} crédits</span>
              {preview.duration_ms && <span>{preview.duration_ms}ms</span>}
              <span>{fmtDate(preview.created_at)}</span>
            </div>
            {preview.result_url && (
              <a href={preview.result_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" style={{ marginTop: 12 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>link</span> Ouvrir l'URL
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Lab ──────────────────────────────────────────────────────────────────

function LabTab() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    apiCall<ModelConfig[]>('/admin/studio/config')
      .then(d => { setModels(d); setPhotoLoaded(true); })
      .catch(() => setPhotoLoaded(true));
  }, []);

  const photoModels = models.filter(m => m.type === 'photo' && m.enabled);
  const videoModels = models.filter(m => m.type === 'video' && m.enabled);

  if (!photoLoaded) return <div className="skeleton" style={{ height: 300, margin: '24px 0', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div className="studio-lab-grid">
      <PhotoLab photoModels={photoModels} />
      <VideoLab videoModels={videoModels} />
    </div>
  );
}

// Photo Lab
function PhotoLab({ photoModels }: { photoModels: ModelConfig[] }) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('fal-ai/flux/schnell');
  const [style, setStyle] = useState('');
  const [dimensions, setDimensions] = useState('square');
  const [hd, setHd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; model: string; duration: number; credits: number; width: number; height: number } | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    if (!prompt.trim()) { setError('Prompt requis'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const d = await apiCall<typeof result>('/admin/studio/generate/photo', 'POST', { prompt, model, style: style || undefined, dimensions, hd });
      setResult(d);
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    setLoading(false);
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>image</span> Test Génération Photo</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prompt *</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A cat in Paris at sunset, cinematic..."
            rows={3}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', resize: 'vertical', fontSize: 13, fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Modèle</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-primary)', fontSize: 13 }}
            >
              {photoModels.map(m => (
                <option key={m.model_id} value={m.model_id}>{m.label} ({m.credits} cr)</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Format</label>
            <select
              value={dimensions}
              onChange={e => setDimensions(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-primary)', fontSize: 13 }}
            >
              {DIMS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Style artistique</label>
          <select
            value={style}
            onChange={e => setStyle(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-primary)', fontSize: 13 }}
          >
            <option value="">— Aucun style —</option>
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hd} onChange={e => setHd(e.target.checked)} />
          <span>Mode HD (Flux Dev, 28 steps — plus lent)</span>
        </label>

        {error && <div className="alert alert-danger" style={{ fontSize: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>warning</span> {error}</div>}

        <button className="btn btn-primary" onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>hourglass_empty</span> Génération en cours…' : '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>auto_awesome</span> Générer'}
        </button>
      </div>

      {/* Result */}
      {loading && (
        <div className="skeleton" style={{ height: 300, borderRadius: 8, marginTop: 16 }} />
      )}
      {result && (
        <div style={{ marginTop: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.imageUrl} alt="result" style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>{fmtModel(result.model)}</span>
            <span>{result.width}×{result.height}</span>
            <span>{result.duration}ms</span>
            <span>{result.credits} crédits</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a href={result.imageUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>link</span> URL</a>
            <button className="btn btn-ghost btn-xs" onClick={() => { navigator.clipboard.writeText(result?.imageUrl ?? ''); }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>assignment</span> Copier URL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Lab
function VideoLab({ videoModels }: { videoModels: ModelConfig[] }) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('fal-ai/ltx-video');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setPolling(false);
  }

  async function generate() {
    if (!prompt.trim()) { setError('Prompt requis'); return; }
    setLoading(true); setError(''); setVideoUrl(null); setRequestId(null); setStatus('Soumission…');
    try {
      const d = await apiCall<{ requestId: string; status: string; model: string; credits: number }>(
        '/admin/studio/generate/video', 'POST', { prompt, model },
      );
      setRequestId(d.requestId);
      setStatus(`En file (${d.credits} cr) — polling…`);
      setLoading(false);
      setPolling(true);

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const poll = await apiCall<{ status: string; videoUrl?: string; error?: string }>(
            `/admin/studio/generate/video/${d.requestId}?model=${encodeURIComponent(model)}`,
          );
          if (poll.status === 'completed' && poll.videoUrl) {
            setVideoUrl(poll.videoUrl);
            setStatus('Video generee !');
            stopPoll();
          } else if (poll.status === 'failed') {
            setError(poll.error ?? 'Génération échouée');
            setStatus('');
            stopPoll();
          } else {
            setStatus(`<span className="material-symbols-rounded" style={{ fontSize: 14 }}>hourglass_empty</span> ${poll.status}…`);
          }
        } catch { /* retry next tick */ }
      }, 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setLoading(false);
      setStatus('');
    }
  }

  // Cleanup on unmount
  useEffect(() => () => stopPoll(), []);

  return (
    <div className="card">
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>movie</span> Test Génération Vidéo</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prompt *</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A rocket launching from a launchpad at dawn..."
            rows={3}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', resize: 'vertical', fontSize: 13, fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Modèle</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-primary)', fontSize: 13 }}
          >
            {videoModels.map(m => (
              <option key={m.model_id} value={m.model_id}>{m.label} ({m.credits} cr)</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>bolt</span> LTX Video génère ~4s de vidéo (97 frames à 24fps). La génération prend 30–90s.
        </div>

        {error && <div className="alert alert-danger" style={{ fontSize: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>warning</span> {error}</div>}
        {status && !error && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{status}</div>}

        <button className="btn btn-primary" onClick={generate} disabled={loading || polling || !prompt.trim()}>
          {loading ? '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>hourglass_empty</span> Soumission…' : polling ? '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>hourglass_empty</span> Génération en cours…' : '<span className="material-symbols-rounded" style={{ fontSize: 14 }}>movie</span> Générer'}
        </button>
        {polling && (
          <button className="btn btn-ghost btn-xs" onClick={stopPoll}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>stop</span> Arrêter le polling</button>
        )}
      </div>

      {/* Result */}
      {polling && !videoUrl && (
        <div style={{ marginTop: 16 }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 8, marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Polling toutes les 3s — {requestId ? `id: ${requestId.slice(0, 16)}…` : ''}
          </div>
        </div>
      )}
      {videoUrl && (
        <div style={{ marginTop: 16 }}>
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={videoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>link</span> URL</a>
            <button className="btn btn-ghost btn-xs" onClick={() => { navigator.clipboard.writeText(videoUrl); }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>assignment</span> Copier URL</button>
          </div>
        </div>
      )}
    </div>
  );
}
