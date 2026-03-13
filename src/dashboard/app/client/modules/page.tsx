'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

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
    <div style={{ padding: 32, textAlign: 'center', color: CU.textSecondary }}>
      Chargement des modules...
    </div>
  );

  return (
    <div style={pageContainer(isMobile)}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.modules.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.modules.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.modules.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.modules.helpText} />
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/client/modules/builder" style={{ ...CU.btnPrimary, textDecoration: 'none' }}>
              ➕ Créer un module
            </Link>
          </div>
        </div>
      </div>
      <PageExplanation pageId="modules" text={PAGE_META.modules?.helpText} />

      {/* ── Empty state ── */}
      {modules.length === 0 && (
        <div style={{ ...CU.emptyState, border: '2px dashed #E5E5E5', borderRadius: 8, background: CU.bg }}>
          <div style={CU.emptyEmoji}>📦</div>
          <div style={CU.emptyTitle}>Aucun module créé</div>
          <div style={CU.emptyDesc}>
            Créez votre premier module : un formulaire de collecte, une base CRM, un assistant IA dédié ou un tableau de bord personnalisé.
          </div>
          <Link href="/client/modules/builder" style={{ ...CU.btnPrimary, textDecoration: 'none' }}>
            ➕ Créer mon premier module
          </Link>
        </div>
      )}

      {/* ── Grid ── */}
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {modules.map(mod => {
            const typeInfo = TYPE_LABELS[mod.type] ?? { label: mod.type, emoji: '📦', color: CU.accent };
            return (
              <div key={mod.id} style={{ ...CU.card, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0, background: 'rgba(0,0,0,0.04)',
                  }}>
                    {mod.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: CU.text }}>
                      {mod.name}
                    </div>
                    {mod.description && (
                      <div style={{ fontSize: 12, color: CU.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={CU.badge}>
                    <span style={{ fontSize: 12 }}>{typeInfo.emoji}</span> {typeInfo.label}
                  </span>
                  {mod.is_published ? (
                    <span style={CU.badgeSuccess}>✅ Publié</span>
                  ) : (
                    <span style={CU.badge}>Brouillon</span>
                  )}
                  {mod.record_count > 0 && (
                    <span style={CU.badge}>
                      {mod.record_count} enregistrement{mod.record_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4, flexWrap: 'wrap' as const, gap: 6 }}>
                  <span style={{ fontSize: 11, color: CU.textSecondary }}>
                    Modifié {timeAgo(mod.updated_at)}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {/* Open */}
                    <Link
                      href={`/client/modules/${mod.slug}`}
                      style={{ ...CU.btnPrimary, height: 28, padding: '0 10px', fontSize: 12, textDecoration: 'none' }}
                    >
                      Ouvrir
                    </Link>
                    {/* Copy URL */}
                    {mod.public_access && (
                      <button
                        onClick={() => copyPublicUrl(mod)}
                        style={{ ...CU.btnSmall, background: 'transparent', border: 'none', color: CU.textSecondary }}
                        title="Copier l'URL publique"
                      >
                        {copyDone === mod.id ? '✅' : '🔗'}
                      </button>
                    )}
                    {/* Edit */}
                    <Link
                      href={`/client/modules/builder?edit=${mod.id}`}
                      style={{ ...CU.btnSmall, background: 'transparent', border: 'none', textDecoration: 'none', color: CU.textSecondary }}
                      title="Modifier"
                    >
                      ✏️
                    </Link>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(mod)}
                      disabled={deleting === mod.id}
                      style={{ ...CU.btnSmall, background: 'transparent', border: 'none', color: CU.danger }}
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
        <div style={CU.overlay}>
          <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 400, padding: isMobile ? 20 : 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: CU.text }}>Supprimer le module ?</h3>
            <p style={{ color: CU.textSecondary, marginBottom: 24 }}>
              Le module <strong>{confirmDelete.name}</strong> et tous ses enregistrements ({confirmDelete.record_count}) seront définitivement supprimés.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={CU.btnGhost}>Annuler</button>
              <button
                onClick={() => deleteModule(confirmDelete)}
                disabled={deleting === confirmDelete.id}
                style={CU.btnDanger}
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
