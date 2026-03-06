'use client';

import { useState, useEffect, useCallback } from 'react';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../../../components/Toast';

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

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 48px' }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>folder</span> <span className="fz-logo-word">Projets</span></h1>
            <p className="page-subtitle">Organisez votre travail par projet pour isoler les <span className="fz-logo-word">agents</span>, données et dépenses.</p>
          </div>
          <button
            onClick={() => { setForm({ name: '', description: '' }); setShowModal(true); }}
            className="btn btn-primary"
          >
            + Nouveau projet
          </button>
        </div>
      </div>

      {/* Stats */}
      {projects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total projets', value: String(projects.length), icon: 'folder', color: 'var(--accent)' },
            { label: 'Projet actif', value: activeProject?.name ?? '—', icon: 'check_circle', color: '#22c55e' },
            { label: 'Crédits cumulés', value: totalCredits > 0 ? `${totalCredits.toLocaleString('fr-FR')} cr.` : '—', icon: 'credit_card', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>{s.icon}</span></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-tertiary animate-pulse" style={{ textAlign: 'center', padding: '60px 0' }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Aucun projet pour l'instant"
          description="Créez un projet pour organiser votre travail entre clients, produits ou services. Chaque projet dispose de ses propres agents IA et données."
          actionLabel="+ Créer mon premier projet"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(project => {
            const isActive = project.id === activeProjectId;
            return (
              <div
                key={project.id}
                className="card"
                style={{ padding: 20, position: 'relative', borderColor: isActive ? 'var(--accent)' : undefined, borderWidth: isActive ? 2 : 1 }}
              >
                {/* Active badge */}
                {isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                    ● ACTIF
                  </div>
                )}
                {project.isDefault && !isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderRadius: 99, fontSize: 10, fontWeight: 600, padding: '2px 8px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 10 }}>star</span> défaut
                  </div>
                )}

                {/* Name & description */}
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, paddingRight: isActive ? 60 : 16 }}>{project.name}</div>
                {project.description && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                  Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!isActive && (
                    <button
                      onClick={() => handleSetDefault(project.id)}
                      disabled={activating === project.id}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      {activating === project.id ? 'Activation...' : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>check</span> Activer</>}
                    </button>
                  )}
                  <button
                    onClick={() => { setRenameProject(project); setRenameValue(project.name); }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12 }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 12 }}>edit</span> Renommer
                  </button>
                  {!project.isDefault && (
                    <button
                      onClick={() => setDeleteProject(project)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, color: '#ef4444' }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 12 }}>delete</span> Supprimer
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>folder</span> Nouveau projet</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nom du projet *</label>
              <input
                className="input"
                style={{ width: '100%' }}
                placeholder="ex : Client Dupont, Produit X, Marketing..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) handleCreate(); }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (optionnel)</label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                placeholder="Décrivez brièvement ce projet..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name.trim()}
                className="btn btn-primary"
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>edit</span> Renommer le projet</h3>
            <input
              className="input"
              style={{ width: '100%', marginBottom: 20 }}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && renameValue.trim()) handleRename(); }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setRenameProject(null)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={handleRename}
                disabled={renameSaving || !renameValue.trim()}
                className="btn btn-primary"
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>delete</span> Supprimer le projet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Êtes-vous sûr de vouloir supprimer <strong>"{deleteProject.name}"</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteProject(null)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
