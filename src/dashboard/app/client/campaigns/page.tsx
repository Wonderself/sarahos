'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | 'completed';
type CampaignObjective = 'awareness' | 'engagement' | 'conversion' | 'retention';
type Platform = 'linkedin' | 'instagram' | 'facebook' | 'twitter';

interface CampaignPost {
  id: string;
  text: string;
  platform: Platform;
  scheduled_at?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  platforms: Platform[];
  status: CampaignStatus;
  objective?: CampaignObjective;
  budget?: number;
  start_date?: string;
  end_date?: string;
  posts_count?: number;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Brouillon', submitted: 'En attente', approved: 'Approuvée',
  rejected: 'Refusée', active: 'Active', completed: 'Terminée',
};
const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: '#6b7280', submitted: '#f59e0b', approved: '#22c55e',
  rejected: '#ef4444', active: '#3b82f6', completed: '#06b6d4',
};
const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', twitter: 'X / Twitter',
};
const PLATFORM_EMOJIS: Record<Platform, string> = {
  linkedin: '💼', instagram: '📸', facebook: '👥', twitter: '🐦',
};
const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'Notoriété', engagement: 'Engagement', conversion: 'Conversion', retention: 'Rétention',
};
const PIPELINE: CampaignStatus[] = ['draft', 'submitted', 'approved', 'active', 'completed'];

// ─── API helper ───────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const isMobile = useIsMobile();
  const { showError, showSuccess } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Create campaign modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', platforms: [] as Platform[], objective: 'awareness' as CampaignObjective,
    budget: '', start_date: '', end_date: '',
  });

  // Add post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSaving, setPostSaving] = useState(false);
  const [postForm, setPostForm] = useState({ text: '', platform: 'linkedin' as Platform, scheduled_at: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portalCall<{ campaigns: Campaign[] }>('/campaigns');
      setCampaigns(res.campaigns ?? []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  async function loadPosts(campaignId: string) {
    setPostsLoading(true);
    try {
      const res = await portalCall<{ posts: CampaignPost[] }>(`/campaigns/${campaignId}/posts`);
      setPosts(res.posts ?? []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement des posts');
    } finally {
      setPostsLoading(false);
    }
  }

  function selectCampaign(c: Campaign) {
    setSelectedCampaign(c);
    loadPosts(c.id);
  }

  async function handleCreate() {
    if (!form.name) return;
    setSaving(true);
    try {
      await portalCall('/campaigns', 'POST', {
        name: form.name,
        ...(form.description && { description: form.description }),
        platforms: form.platforms,
        objective: form.objective,
        ...(form.budget && !isNaN(parseFloat(form.budget)) && { budget: parseFloat(form.budget) }),
        ...(form.start_date && { start_date: form.start_date }),
        ...(form.end_date && { end_date: form.end_date }),
      });
      setShowModal(false);
      setForm({ name: '', description: '', platforms: [], objective: 'awareness', budget: '', start_date: '', end_date: '' });
      showSuccess('Campagne créée');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la création'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      await portalCall(`/campaigns/${id}`, 'DELETE');
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
      showSuccess('Campagne supprimée');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la suppression'); }
  }

  async function handleSubmit(id: string) {
    try {
      await portalCall(`/campaigns/${id}/submit`, 'POST');
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'submitted' } : c));
      if (selectedCampaign?.id === id) setSelectedCampaign(prev => prev ? { ...prev, status: 'submitted' } : prev);
      showSuccess('Campagne soumise pour approbation');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la soumission'); }
  }

  async function handleAddPost() {
    if (!postForm.text || !selectedCampaign) return;
    setPostSaving(true);
    try {
      await portalCall(`/campaigns/${selectedCampaign.id}/posts`, 'POST', {
        text: postForm.text,
        platform: postForm.platform,
        ...(postForm.scheduled_at && { scheduled_at: postForm.scheduled_at }),
      });
      setShowPostModal(false);
      setPostForm({ text: '', platform: 'linkedin', scheduled_at: '' });
      showSuccess('Post ajouté');
      await loadPosts(selectedCampaign.id);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout'); }
    setPostSaving(false);
  }

  function togglePlatform(p: Platform) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p],
    }));
  }

  // Stats
  const total = campaigns.length;
  const active = campaigns.filter(c => c.status === 'active').length;
  const pending = campaigns.filter(c => c.status === 'submitted').length;
  const totalPosts = campaigns.reduce((s, c) => s + (c.posts_count ?? 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📢</div>
        <div style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }} className="animate-pulse">Chargement des campagnes...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? 12 : undefined }}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.campaigns.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.campaigns.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.campaigns.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.campaigns.helpText} />
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
              style={{ fontSize: 13 }}
            >
              ➕ Nouvelle campagne
            </button>
          </div>
        </div>
      </div>
      <PageExplanation pageId="campaigns" text={PAGE_META.campaigns?.helpText} />

      {/* Stats */}
      {total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Campagnes', value: String(total), emoji: '📢', color: '#1A1A1A' },
            { label: 'Actives', value: String(active), emoji: '✅', color: '#1A1A1A' },
            { label: 'En attente', value: String(pending), emoji: '⏳', color: '#1A1A1A' },
            { label: 'Posts planifiés', value: String(totalPosts), emoji: '📅', color: '#1A1A1A' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 18px', background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, border: '1px solid #E5E5E5' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline status bar */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', padding: '4px 0' }}>
          {PIPELINE.map(status => {
            const count = campaigns.filter(c => c.status === status).length;
            return (
              <div key={status} style={{
                flex: 1, minWidth: isMobile ? 60 : 90, padding: '8px 10px', borderRadius: 10,
                background: count > 0 ? STATUS_COLORS[status] + '15' : 'var(--fz-bg-secondary, #F8FAFC)',
                border: `1px solid ${count > 0 ? STATUS_COLORS[status] + '40' : 'var(--fz-border, #E2E8F0)'}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: STATUS_COLORS[status] }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>{STATUS_LABELS[status]}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedCampaign ? (isMobile ? '1fr' : '1fr 360px') : '1fr', gap: 16 }}>

        {/* Campaign list */}
        <div>
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, border: '1px solid #E5E5E5' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--fz-text, #1E293B)' }}>Aucune campagne</div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 20 }}>
                Créez votre première campagne marketing pour commencer à planifier vos publications.
              </div>
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ fontSize: 13 }}>
                ➕ Créer une campagne
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {campaigns.map(c => (
                <div
                  key={c.id}
                  onClick={() => selectCampaign(c)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    background: 'var(--fz-bg, #FFFFFF)',
                    borderRadius: 8,
                    border: selectedCampaign?.id === c.id ? '1px solid var(--accent)' : 'none',
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fz-text, #1E293B)' }}>{c.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                          background: STATUS_COLORS[c.status] + '20', color: STATUS_COLORS[c.status],
                        }}>{STATUS_LABELS[c.status]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {c.platforms.map(p => (
                          <span key={p} style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 12 }}>{PLATFORM_EMOJIS[p]}</span> {PLATFORM_LABELS[p]}
                          </span>
                        ))}
                        {c.objective && (
                          <span style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>
                            · {OBJECTIVE_LABELS[c.objective]}
                          </span>
                        )}
                        {(c.start_date || c.end_date) && (
                          <span style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>
                            · {c.start_date && new Date(c.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {c.end_date && ` → ${new Date(c.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {(c.posts_count ?? 0) > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{c.posts_count} post{(c.posts_count ?? 0) > 1 ? 's' : ''}</span>
                      )}
                      {c.status === 'draft' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleSubmit(c.id); }}
                          className="btn btn-primary btn-xs"
                          style={{ fontSize: 11 }}
                        >
                          📤 Soumettre
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(c.id); }}
                        style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fz-text-muted, #94A3B8)', opacity: 0.6 }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {c.description && (
                    <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedCampaign && (
          <div style={{ padding: 20, alignSelf: 'start', position: 'sticky', top: 16, background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, border: '1px solid #E5E5E5' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: 'var(--fz-text, #1E293B)' }}>
                {selectedCampaign.name}
              </div>
              <button onClick={() => setSelectedCampaign(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--fz-text-muted, #94A3B8)', flexShrink: 0 }}>×</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: STATUS_COLORS[selectedCampaign.status] + '20', color: STATUS_COLORS[selectedCampaign.status],
              }}>{STATUS_LABELS[selectedCampaign.status]}</span>
              {selectedCampaign.objective && (
                <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>· {OBJECTIVE_LABELS[selectedCampaign.objective]}</span>
              )}
            </div>

            {selectedCampaign.description && (
              <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 14, lineHeight: 1.5 }}>{selectedCampaign.description}</p>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {selectedCampaign.platforms.map(p => (
                <span key={p} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text-secondary, #64748B)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 13 }}>{PLATFORM_EMOJIS[p]}</span> {PLATFORM_LABELS[p]}
                </span>
              ))}
            </div>

            {selectedCampaign.status === 'draft' && (
              <button
                onClick={() => handleSubmit(selectedCampaign.id)}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: 13, marginBottom: 14 }}
              >
                📤 Soumettre pour approbation
              </button>
            )}

            {/* Posts section */}
            <div style={{ borderTop: '1px solid var(--fz-border, #E2E8F0)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>Posts ({posts.length})</span>
                <button onClick={() => setShowPostModal(true)} className="btn btn-ghost btn-xs" style={{ fontSize: 11 }}>
                  ➕ Ajouter
                </button>
              </div>

              {postsLoading ? (
                <div className="animate-pulse" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0', color: 'var(--fz-text-muted, #94A3B8)' }}>Chargement...</div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--fz-text-muted, #94A3B8)', fontSize: 12 }}>
                  Aucun post pour cette campagne.<br />
                  <Link href="/client/social" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Créer du contenu →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {posts.map(post => (
                    <div key={post.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid #E5E5E5' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{PLATFORM_EMOJIS[post.platform]}</span> {PLATFORM_LABELS[post.platform]}
                        {post.scheduled_at && <span style={{ color: 'var(--fz-text-muted, #94A3B8)', marginLeft: 6 }}>· {new Date(post.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {post.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ width: '100%', maxWidth: isMobile ? '95vw' : 520, padding: isMobile ? 20 : 28, background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, border: '1px solid #E5E5E5' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--fz-text, #1E293B)' }}>Nouvelle campagne</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Nom *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Lancement produit printemps 2026" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Objectifs, contexte, public cible..." style={{ width: '100%', minHeight: 72, resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 6 }}>Plateformes *</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(Object.keys(PLATFORM_LABELS) as Platform[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: form.platforms.includes(p) ? '1.5px solid var(--accent)' : '1.5px solid var(--fz-border, #E2E8F0)',
                        background: form.platforms.includes(p) ? 'var(--accent)' : 'var(--fz-bg-secondary, #F8FAFC)',
                        color: form.platforms.includes(p) ? '#fff' : 'var(--fz-text, #1E293B)',
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{PLATFORM_EMOJIS[p]}</span> {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Objectif</label>
                  <select className="input" value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value as CampaignObjective }))} style={{ width: '100%' }}>
                    {(Object.keys(OBJECTIVE_LABELS) as CampaignObjective[]).map(o => (
                      <option key={o} value={o}>{OBJECTIVE_LABELS[o]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Budget (€)</label>
                  <input className="input" type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="0" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Date début</label>
                  <input className="input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Date fin</label>
                  <input className="input" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }}>Annuler</button>
              <button onClick={handleCreate} disabled={saving || !form.name} className="btn btn-primary" style={{ flex: 2, fontSize: 13 }}>
                {saving ? 'Création...' : 'Créer la campagne'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      {showPostModal && selectedCampaign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowPostModal(false); }}>
          <div style={{ width: '100%', maxWidth: isMobile ? '95vw' : 460, padding: isMobile ? 20 : 28, background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, border: '1px solid #E5E5E5' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--fz-text, #1E293B)' }}>Ajouter un post</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Plateforme</label>
                <select className="input" value={postForm.platform} onChange={e => setPostForm(p => ({ ...p, platform: e.target.value as Platform }))} style={{ width: '100%' }}>
                  {selectedCampaign.platforms.map(p => (
                    <option key={p} value={p}>{PLATFORM_EMOJIS[p]} {PLATFORM_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Contenu *</label>
                <textarea className="input" value={postForm.text} onChange={e => setPostForm(p => ({ ...p, text: e.target.value }))} placeholder="Rédigez votre post..." style={{ width: '100%', minHeight: 100, resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', display: 'block', marginBottom: 4 }}>Date de publication</label>
                <input className="input" type="datetime-local" value={postForm.scheduled_at} onChange={e => setPostForm(p => ({ ...p, scheduled_at: e.target.value }))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowPostModal(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }}>Annuler</button>
              <button onClick={handleAddPost} disabled={postSaving || !postForm.text} className="btn btn-primary" style={{ flex: 2, fontSize: 13 }}>
                {postSaving ? 'Ajout...' : 'Ajouter le post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
