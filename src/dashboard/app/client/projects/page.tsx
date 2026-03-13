'use client';

import { useState, useEffect, useCallback } from 'react';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import AuthRequired from '../../../components/AuthRequired';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  creditsUsed?: number;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const isMobile = useIsMobile();
  const { showError, showSuccess } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Rename modal
  const [renameProject, setRenameProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  // Delete confirmation
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Activating
  const [activating, setActivating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalCall<{ projects: Project[] }>('/portal/projects');
      const list = res.projects ?? [];
      setProjects(list);
      const stored = localStorage.getItem('fz_active_project');
      const def = list.find(p => p.isDefault);
      setActiveProjectId(stored || def?.id || list[0]?.id || null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement des projets');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await portalCall('/portal/projects', 'POST', { name: form.name.trim(), description: form.description.trim() || undefined });
      showSuccess('Projet créé avec succès');
      setShowModal(false);
      setForm({ name: '', description: '' });
      await load();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(projectId: string) {
    setActivating(projectId);
    try {
      await portalCall(`/portal/projects/${projectId}/set-default`, 'POST');
      localStorage.setItem('fz_active_project', projectId);
      setActiveProjectId(projectId);
      setProjects(prev => prev.map(p => ({ ...p, isDefault: p.id === projectId })));
      showSuccess('Projet actif mis à jour');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de l\'activation');
    } finally {
      setActivating(null);
    }
  }

  async function handleRename() {
    if (!renameProject || !renameValue.trim()) return;
    setRenameSaving(true);
    try {
      await portalCall(`/portal/projects/${renameProject.id}`, 'PATCH', { name: renameValue.trim() });
      setProjects(prev => prev.map(p => p.id === renameProject.id ? { ...p, name: renameValue.trim() } : p));
      showSuccess('Projet renommé');
      setRenameProject(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors du renommage');
    } finally {
      setRenameSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await portalCall(`/portal/projects/${deleteProject.id}`, 'DELETE');
      setProjects(prev => prev.filter(p => p.id !== deleteProject.id));
      if (activeProjectId === deleteProject.id) {
        const remaining = projects.filter(p => p.id !== deleteProject.id);
        const newActive = remaining.find(p => p.isDefault) ?? remaining[0];
        if (newActive) { setActiveProjectId(newActive.id); localStorage.setItem('fz_active_project', newActive.id); }
      }
      showSuccess('Projet supprimé');
      setDeleteProject(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  const totalCredits = projects.reduce((s, p) => s + (p.creditsUsed ?? 0), 0);
  const meta = PAGE_META.projects;

  return (
    <AuthRequired pageName="Projets">
    <div style={pageContainer(isMobile)}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={headerRow()}>
              <span style={emojiIcon(24)}>{meta.emoji}</span>
              <h1 style={CU.pageTitle}>{meta.title}</h1>
              <HelpBubble text={meta.helpText} />
            </div>
            <p style={CU.pageSubtitle}>{meta.subtitle}</p>
          </div>
          <button
            onClick={() => { setForm({ name: '', description: '' }); setShowModal(true); }}
            style={CU.btnPrimary}
          >
            ➕ Nouveau projet
          </button>
        </div>
      </div>
      <PageExplanation pageId="projects" text={PAGE_META.projects?.helpText} />

      {/* Stats */}
      {projects.length > 0 && (
        <div style={{ ...cardGrid(isMobile, 3), marginBottom: 24 }}>
          {[
            { label: 'Total projets', value: String(projects.length), emoji: '📁' },
            { label: 'Projet actif', value: activeProject?.name ?? '—', emoji: '✅' },
            { label: 'Credits cumules', value: totalCredits > 0 ? `${totalCredits.toLocaleString('fr-FR')} cr.` : '—', emoji: '💳' },
          ].map(s => (
            <div key={s.label} style={{ ...CU.card, padding: '14px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ ...CU.statValue, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
              <div style={CU.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: CU.textMuted }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Aucun projet pour l'instant"
          description="Créez un projet pour organiser votre travail entre clients, produits ou services. Chaque projet dispose de ses propres assistants IA et données."
          actionLabel="+ Créer mon premier projet"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
          {projects.map(project => {
            const isActive = project.id === activeProjectId;
            return (
              <div
                key={project.id}
                style={{ ...CU.card, padding: 20, position: 'relative', border: isActive ? `2px solid ${CU.accent}` : `1px solid ${CU.border}` }}
              >
                {/* Active badge */}
                {isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12, ...CU.badgeSuccess, fontSize: 10, fontWeight: 700, background: CU.accent, color: '#fff' }}>
                    ✅ ACTIF
                  </div>
                )}
                {project.isDefault && !isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12, ...CU.badge, fontSize: 10, fontWeight: 600 }}>
                    ⭐ défaut
                  </div>
                )}

                {/* Name & description */}
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, paddingRight: isActive ? 60 : 16, color: CU.text }}>{project.name}</div>
                {project.description && (
                  <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </div>
                )}
                <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 16 }}>
                  Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!isActive && (
                    <button
                      onClick={() => handleSetDefault(project.id)}
                      disabled={activating === project.id}
                      style={{ ...CU.btnSmall, background: CU.accent, color: '#fff', border: 'none' }}
                    >
                      {activating === project.id ? 'Activation...' : <>✅ Activer</>}
                    </button>
                  )}
                  <button
                    onClick={() => { setRenameProject(project); setRenameValue(project.name); }}
                    style={CU.btnSmall}
                  >
                    ✏️ Renommer
                  </button>
                  {!project.isDefault && (
                    <button
                      onClick={() => setDeleteProject(project)}
                      style={{ ...CU.btnSmall, color: CU.danger }}
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={CU.overlay}
        >
          <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 440, padding: isMobile ? 20 : 28 }}>
            <h3 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 20 }}>📁 Nouveau projet</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={CU.label}>Nom du projet *</label>
              <input
                style={CU.input}
                placeholder="ex : Client Dupont, Produit X, Marketing..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) handleCreate(); }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={CU.label}>Description (optionnel)</label>
              <textarea
                style={CU.textarea}
                placeholder="Décrivez brièvement ce projet..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={CU.btnGhost}>Annuler</button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name.trim()}
                style={CU.btnPrimary}
              >
                {saving ? 'Création...' : 'Créer le projet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Modal ───────────────────────────────────────────────────── */}
      {renameProject && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setRenameProject(null); }}
          style={CU.overlay}
        >
          <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 400, padding: isMobile ? 20 : 28 }}>
            <h3 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 20 }}>✏️ Renommer le projet</h3>
            <input
              style={{ ...CU.input, marginBottom: 20 }}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && renameValue.trim()) handleRename(); }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setRenameProject(null)} style={CU.btnGhost}>Annuler</button>
              <button
                onClick={handleRename}
                disabled={renameSaving || !renameValue.trim()}
                style={CU.btnPrimary}
              >
                {renameSaving ? 'Sauvegarde...' : 'Renommer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deleteProject && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setDeleteProject(null); }}
          style={CU.overlay}
        >
          <div style={{ ...CU.modal, maxWidth: isMobile ? 'calc(100vw - 32px)' : 400, padding: isMobile ? 20 : 28 }}>
            <h3 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 12 }}>🗑️ Supprimer le projet</h3>
            <p style={{ color: CU.textSecondary, fontSize: 14, marginBottom: 20 }}>
              Êtes-vous sûr de vouloir supprimer <strong>&quot;{deleteProject.name}&quot;</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteProject(null)} style={CU.btnGhost}>Annuler</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={CU.btnDanger}
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthRequired>
  );
}
