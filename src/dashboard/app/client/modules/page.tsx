'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserModule {
  id: string;
  name: string;
  slug: string;
  description?: string;
  emoji: string;
  color: string;
  type: 'form' | 'crm' | 'agent' | 'dashboard';
  is_published: boolean;
  public_access: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  form: { label: 'Formulaire', emoji: '📋', color: '#10b981' },
  crm: { label: 'Base CRM', emoji: '📊', color: '#3b82f6' },
  agent: { label: 'Assistant IA', emoji: '🤖', color: '#8b5cf6' },
  dashboard: { label: 'Dashboard', emoji: '📈', color: '#f59e0b' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = getSession();
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erreur ${res.status}`);
  }
  return res.json();
}

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60) return 'à l\'instant';
  if (d < 3600) return `il y a ${Math.floor(d / 60)} min`;
  if (d < 86400) return `il y a ${Math.floor(d / 3600)}h`;
  return `il y a ${Math.floor(d / 86400)}j`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModulesPage() {
  const isMobile = useIsMobile();
  const { showError, showSuccess } = useToast();
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserModule | null>(null);
  const [copyDone, setCopyDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await portalCall<{ modules: UserModule[] }>('/portal/modules');
      setModules(data.modules ?? []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  async function deleteModule(mod: UserModule) {
    setDeleting(mod.id);
    try {
      await portalCall(`/portal/modules/${mod.id}`, 'DELETE');
      showSuccess(`Module "${mod.name}" supprimé`);
      setModules(prev => prev.filter(m => m.id !== mod.id));
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  function copyPublicUrl(mod: UserModule) {
    const url = `${window.location.origin}/m/${mod.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyDone(mod.id);
      setTimeout(() => setCopyDone(null), 2000);
    });
  }

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--fz-text-secondary, #64748B)' }}>
      Chargement des modules...
    </div>
  );

  return (
    <div className="client-page-scrollable" style={{ padding: isMobile ? 12 : '24px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.modules.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.modules.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.modules.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.modules.helpText} />
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/client/modules/builder" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ➕ Créer un module
            </Link>
          </div>
        </div>
      </div>
      <PageExplanation pageId="modules" text={PAGE_META.modules?.helpText} />

      {/* ── Empty state ── */}
      {modules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--fz-bg, #FFFFFF)', borderRadius: 20, border: '2px dashed var(--fz-border, #E2E8F0)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--fz-text, #1E293B)' }}>Aucun module créé</h2>
          <p style={{ color: 'var(--fz-text-secondary, #64748B)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Créez votre premier module : un formulaire de collecte, une base CRM, un assistant IA dédié ou un tableau de bord personnalisé.
          </p>
          <Link href="/client/modules/builder" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            ➕ Créer mon premier module
          </Link>
        </div>
      )}

      {/* ── Grid ── */}
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {modules.map(mod => {
            const typeInfo = TYPE_LABELS[mod.type] ?? { label: mod.type, emoji: '📦', color: 'var(--fz-accent, #0EA5E9)' };
            return (
              <div key={mod.id} style={{ background: 'var(--fz-bg, #FFFFFF)', borderRadius: 16, padding: 20, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.2s' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0, background: `${mod.color}20`,
                  }}>
                    {mod.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fz-text, #1E293B)' }}>
                      {mod.name}
                    </div>
                    {mod.description && (
                      <div style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: `${typeInfo.color}20`, color: typeInfo.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    <span style={{ fontSize: 12 }}>{typeInfo.emoji}</span> {typeInfo.label}
                  </span>
                  {mod.is_published ? (
                    <span style={{ background: '#10b98120', color: '#10b981', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>✅ Publié</span>
                  ) : (
                    <span style={{ background: '#6b728020', color: '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>Brouillon</span>
                  )}
                  {mod.record_count > 0 && (
                    <span style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: 'var(--fz-text-secondary, #64748B)' }}>
                      {mod.record_count} enregistrement{mod.record_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--fz-text-secondary, #64748B)' }}>
                    Modifié {timeAgo(mod.updated_at)}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Open */}
                    <Link
                      href={`/client/modules/${mod.slug}`}
                      style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                    >
                      Ouvrir
                    </Link>
                    {/* Copy URL */}
                    {mod.public_access && (
                      <button
                        onClick={() => copyPublicUrl(mod)}
                        style={{ padding: '5px 10px', borderRadius: 8, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--fz-text-secondary, #64748B)' }}
                        title="Copier l'URL publique"
                      >
                        {copyDone === mod.id ? '✅' : '🔗'}
                      </button>
                    )}
                    {/* Edit */}
                    <Link
                      href={`/client/modules/builder?edit=${mod.id}`}
                      style={{ padding: '5px 10px', borderRadius: 8, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'transparent', textDecoration: 'none', fontSize: 12, color: 'var(--fz-text-secondary, #64748B)' }}
                      title="Modifier"
                    >
                      ✏️
                    </Link>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(mod)}
                      disabled={deleting === mod.id}
                      style={{ padding: '5px 10px', borderRadius: 8, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--fz-bg, #FFFFFF)', borderRadius: 20, padding: isMobile ? 20 : 32, width: isMobile ? '90vw' : 400, maxWidth: '90vw', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--fz-text, #1E293B)' }}>Supprimer le module ?</h3>
            <p style={{ color: 'var(--fz-text-secondary, #64748B)', marginBottom: 24 }}>
              Le module <strong>{confirmDelete.name}</strong> et tous ses enregistrements ({confirmDelete.record_count}) seront définitivement supprimés.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn" style={{ background: 'var(--fz-bg-secondary, #F8FAFC)' }}>Annuler</button>
              <button
                onClick={() => deleteModule(confirmDelete)}
                disabled={deleting === confirmDelete.id}
                style={{ padding: '8px 20px', borderRadius: 10, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                {deleting === confirmDelete.id ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
