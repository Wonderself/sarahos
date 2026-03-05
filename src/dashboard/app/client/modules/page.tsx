'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';

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

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  form: { label: 'Formulaire', icon: '📋', color: '#10b981' },
  crm: { label: 'Base CRM', icon: '📊', color: '#3b82f6' },
  agent: { label: 'Agent IA', icon: '🤖', color: '#8b5cf6' },
  dashboard: { label: 'Dashboard', icon: '📈', color: '#f59e0b' },
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
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
      Chargement des modules...
    </div>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>📦 Mes modules</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Créez des mini-applications intégrées à votre dashboard — formulaires, bases de données, agents IA, tableaux de bord.
          </p>
        </div>
        <Link href="/client/modules/builder" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          + Créer un module
        </Link>
      </div>

      {/* ── Empty state ── */}
      {modules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--bg-card)', borderRadius: 20, border: '2px dashed var(--border)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Aucun module créé</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Créez votre premier module : un formulaire de collecte, une base CRM, un agent IA dédié ou un tableau de bord personnalisé.
          </p>
          <Link href="/client/modules/builder" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            + Créer mon premier module
          </Link>
        </div>
      )}

      {/* ── Grid ── */}
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {modules.map(mod => {
            const typeInfo = TYPE_LABELS[mod.type] ?? { label: mod.type, icon: '📦', color: '#6366f1' };
            return (
              <div key={mod.id} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.2s' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0, background: `${mod.color}20`,
                  }}>
                    {mod.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mod.name}
                    </div>
                    {mod.description && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: `${typeInfo.color}20`, color: typeInfo.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  {mod.is_published ? (
                    <span style={{ background: '#10b98120', color: '#10b981', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>✅ Publié</span>
                  ) : (
                    <span style={{ background: '#6b728020', color: '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>Brouillon</span>
                  )}
                  {mod.record_count > 0 && (
                    <span style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {mod.record_count} enregistrement{mod.record_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
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
                        style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}
                        title="Copier l'URL publique"
                      >
                        {copyDone === mod.id ? '✅' : '🔗'}
                      </button>
                    )}
                    {/* Edit */}
                    <Link
                      href={`/client/modules/builder?edit=${mod.id}`}
                      style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', textDecoration: 'none', fontSize: 12, color: 'var(--text-secondary)' }}
                      title="Modifier"
                    >
                      ✏️
                    </Link>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(mod)}
                      disabled={deleting === mod.id}
                      style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}
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
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 32, width: 400, maxWidth: '90vw' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Supprimer le module ?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Le module <strong>{confirmDelete.name}</strong> et tous ses enregistrements ({confirmDelete.record_count}) seront définitivement supprimés.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn" style={{ background: 'var(--bg-secondary)' }}>Annuler</button>
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
