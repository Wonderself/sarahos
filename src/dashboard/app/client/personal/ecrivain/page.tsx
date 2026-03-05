'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType = 'roman' | 'scenario' | 'essai' | 'nouvelles' | 'autre';
type ProjectStatus = 'draft' | 'in_progress' | 'revision' | 'completed' | 'paused';
type ChapterStatus = 'draft' | 'revision' | 'final';

interface Project {
  id: string;
  title: string;
  type: ProjectType;
  genre?: string;
  status: ProjectStatus;
  current_word_count: number;
  word_count_goal?: number;
  synopsis?: string;
  created_at: string;
}

interface Chapter {
  id: string;
  project_id: string;
  title: string;
  content?: string;
  status: ChapterStatus;
  word_count: number;
  order_index: number;
  ai_notes?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ProjectType, string> = {
  roman: 'Roman', scenario: 'Scénario', essai: 'Essai', nouvelles: 'Nouvelles', autre: 'Autre',
};
const TYPE_ICONS: Record<ProjectType, string> = {
  roman: '📖', scenario: '🎬', essai: '📝', nouvelles: '✨', autre: '📄',
};
const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon', in_progress: 'En cours', revision: 'Révision', completed: 'Terminé', paused: 'Pause',
};
const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: '#6b7280', in_progress: '#3b82f6', revision: '#f59e0b', completed: '#22c55e', paused: '#a855f7',
};
const CHAPTER_STATUS_LABELS: Record<ChapterStatus, string> = { draft: 'Brouillon', revision: 'Révision', final: 'Final' };
const CHAPTER_STATUS_COLORS: Record<ChapterStatus, string> = { draft: '#6b7280', revision: '#f59e0b', final: '#22c55e' };

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

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

export default function EcrivainPage() {
  const { showError, showSuccess } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [error, setError] = useState('');

  // Editor
  const [editorContent, setEditorContent] = useState('');
  const [editorWordCount, setEditorWordCount] = useState(0);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorSaved, setEditorSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', type: 'roman' as ProjectType, genre: '', word_count_goal: '', synopsis: '' });
  const [projectSaving, setProjectSaving] = useState(false);

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '' });
  const [chapterSaving, setChapterSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalCall<{ projects: Project[] }>('/personal/ecrivain/projects');
      setProjects(res.projects ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChapters = useCallback(async (projectId: string) => {
    setChaptersLoading(true);
    try {
      const res = await portalCall<{ chapters: Chapter[] }>(`/personal/ecrivain/projects/${projectId}/chapters`);
      const sorted = (res.chapters ?? []).sort((a, b) => a.order_index - b.order_index);
      setChapters(sorted);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur de chargement des chapitres'); }
    setChaptersLoading(false);
  }, [showError]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  function selectProject(p: Project) {
    setSelectedProject(p);
    setSelectedChapter(null);
    setEditorContent('');
    loadChapters(p.id);
  }

  function selectChapter(c: Chapter) {
    setSelectedChapter(c);
    setEditorContent(c.content ?? '');
    setEditorWordCount(countWords(c.content ?? ''));
    setEditorSaved(false);
  }

  // Auto-save debounce
  function handleEditorChange(value: string) {
    setEditorContent(value);
    setEditorWordCount(countWords(value));
    setEditorSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (selectedChapter) {
        autoSave(selectedChapter.id, value);
      }
    }, 800);
  }

  async function autoSave(chapterId: string, content: string) {
    setEditorSaving(true);
    try {
      await portalCall(`/personal/ecrivain/chapters/${chapterId}`, 'PATCH', {
        content,
        word_count: countWords(content),
      });
      setEditorSaved(true);
      setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, content, word_count: countWords(content) } : c));
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur de sauvegarde automatique'); }
    setEditorSaving(false);
  }

  async function handleAddProject() {
    if (!projectForm.title) return;
    setProjectSaving(true);
    try {
      await portalCall('/personal/ecrivain/projects', 'POST', {
        title: projectForm.title,
        type: projectForm.type,
        ...(projectForm.genre && { genre: projectForm.genre }),
        ...(projectForm.word_count_goal && { word_count_goal: parseInt(projectForm.word_count_goal) }),
        ...(projectForm.synopsis && { synopsis: projectForm.synopsis }),
      });
      setShowProjectModal(false);
      setProjectForm({ title: '', type: 'roman', genre: '', word_count_goal: '', synopsis: '' });
      showSuccess('Projet créé');
      await loadProjects();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la création'); }
    setProjectSaving(false);
  }

  async function handleAddChapter() {
    if (!chapterForm.title || !selectedProject) return;
    setChapterSaving(true);
    try {
      await portalCall(`/personal/ecrivain/projects/${selectedProject.id}/chapters`, 'POST', {
        title: chapterForm.title,
        order_index: chapters.length,
      });
      setShowChapterModal(false);
      setChapterForm({ title: '' });
      showSuccess('Chapitre ajouté');
      await loadChapters(selectedProject.id);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout'); }
    setChapterSaving(false);
  }

  async function handleDeleteChapter(id: string) {
    if (!confirm('Supprimer ce chapitre ?')) return;
    try {
      await portalCall(`/personal/ecrivain/chapters/${id}`, 'DELETE');
      setChapters(prev => prev.filter(c => c.id !== id));
      if (selectedChapter?.id === id) setSelectedChapter(null);
      showSuccess('Chapitre supprimé');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la suppression'); }
  }

  async function handleChapterStatusChange(id: string, status: ChapterStatus) {
    try {
      await portalCall(`/personal/ecrivain/chapters/${id}`, 'PATCH', { status });
      setChapters(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      if (selectedChapter?.id === id) setSelectedChapter(prev => prev ? { ...prev, status } : prev);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'); }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>✍️</div>
        <div className="text-md text-tertiary animate-pulse">Chargement de vos projets...</div>
      </div>
    );
  }

  // ── Editor view ──
  if (selectedProject && selectedChapter) {
    return (
      <div className="client-page-scrollable" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <button onClick={() => { setSelectedChapter(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13 }}>
            ← Retour
          </button>
          <span>|</span>
          <span>{TYPE_ICONS[selectedProject.type]} {selectedProject.title}</span>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedChapter.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
          {/* Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{selectedChapter.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {editorWordCount.toLocaleString('fr-FR')} mots
                </span>
                <span style={{ fontSize: 11, color: editorSaving ? '#f59e0b' : editorSaved ? '#22c55e' : 'var(--text-tertiary)' }}>
                  {editorSaving ? '⏳ Sauvegarde...' : editorSaved ? '✅ Sauvegardé' : ''}
                </span>
              </div>
            </div>
            <textarea
              value={editorContent}
              onChange={e => handleEditorChange(e.target.value)}
              placeholder="Commencez à écrire votre chapitre..."
              style={{
                width: '100%', minHeight: 520, padding: '16px 20px',
                background: 'var(--bg-secondary)', border: '1.5px solid var(--border-primary)',
                borderRadius: 12, fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)',
                resize: 'vertical', fontFamily: 'Georgia, serif', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-primary)'; }}
            />
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut du chapitre</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(Object.entries(CHAPTER_STATUS_LABELS) as [ChapterStatus, string][]).map(([s, l]) => (
                  <button
                    key={s}
                    onClick={() => handleChapterStatusChange(selectedChapter.id, s)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: selectedChapter.status === s ? `2px solid ${CHAPTER_STATUS_COLORS[s]}` : '1.5px solid var(--border-primary)',
                      background: selectedChapter.status === s ? CHAPTER_STATUS_COLORS[s] + '20' : 'var(--bg-secondary)',
                      color: selectedChapter.status === s ? CHAPTER_STATUS_COLORS[s] : 'var(--text-secondary)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {selectedChapter.ai_notes && (
              <div className="card" style={{ padding: 16, borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>🤖 Notes AI</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedChapter.ai_notes}</div>
              </div>
            )}

            <Link
              href={`/client/chat?agent=fz-ecrivain&context=${encodeURIComponent(`Chapitre: ${selectedChapter.title}\n${editorContent.slice(0, 500)}`)}`}
              className="btn btn-primary btn-sm"
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              ✍️ Continuer avec fz-écrivain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Project detail view (chapters list) ──
  if (selectedProject) {
    const totalWords = chapters.reduce((s, c) => s + c.word_count, 0);
    const goalWords = selectedProject.word_count_goal ?? 0;
    const pct = goalWords > 0 ? Math.min(100, Math.round((totalWords / goalWords) * 100)) : 0;

    return (
      <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13 }}>
            ← Mes projets
          </button>
        </div>

        {/* Project header */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{TYPE_ICONS[selectedProject.type]}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProject.title}</h2>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: STATUS_COLORS[selectedProject.status] + '20', color: STATUS_COLORS[selectedProject.status],
                }}>
                  {STATUS_LABELS[selectedProject.status]}
                </span>
              </div>
              {selectedProject.genre && <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Genre : {selectedProject.genre}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
                {totalWords.toLocaleString('fr-FR')} mots
              </div>
              {goalWords > 0 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>/ {goalWords.toLocaleString('fr-FR')} objectif</div>}
            </div>
          </div>
          {goalWords > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{pct}% de l&apos;objectif</div>
            </div>
          )}
          {selectedProject.synopsis && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
              &ldquo;{selectedProject.synopsis}&rdquo;
            </div>
          )}
        </div>

        {/* Chapters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Chapitres ({chapters.length})</h3>
          <button onClick={() => setShowChapterModal(true)} className="btn btn-primary btn-sm">+ Nouveau chapitre</button>
        </div>

        {chaptersLoading ? (
          <div className="text-center text-tertiary" style={{ padding: 40 }}>Chargement des chapitres...</div>
        ) : chapters.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucun chapitre</div>
            <button onClick={() => setShowChapterModal(true)} className="btn btn-primary btn-sm">Écrire le premier chapitre</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chapters.map((c, i) => (
              <div
                key={c.id}
                className="card"
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => selectChapter(c)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {c.word_count.toLocaleString('fr-FR')} mots
                    {c.content && c.content.length > 0 && (
                      <span style={{ marginLeft: 8, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        · {c.content.slice(0, 60).trim()}...
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                  background: CHAPTER_STATUS_COLORS[c.status] + '20', color: CHAPTER_STATUS_COLORS[c.status],
                }}>
                  {CHAPTER_STATUS_LABELS[c.status]}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteChapter(c.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, flexShrink: 0 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add Chapter Modal */}
        {showChapterModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📖 Nouveau chapitre</h3>
              <input className="input" placeholder="Titre du chapitre..." value={chapterForm.title} onChange={e => setChapterForm({ title: e.target.value })} autoFocus />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => setShowChapterModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
                <button onClick={handleAddChapter} className="btn btn-primary" style={{ flex: 1 }} disabled={chapterSaving}>
                  {chapterSaving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Projects list ──
  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 4 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
              ← Agents personnels
            </Link>
          </div>
          <h1 className="page-title">✍️ Atelier d&apos;écriture</h1>
          <p className="page-subtitle">Vos projets littéraires, scénarios et essais</p>
        </div>
        <button onClick={() => setShowProjectModal(true)} className="btn btn-primary">+ Nouveau projet</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✍️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Votre atelier vous attend</div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Démarrez un roman, un scénario, un essai... fz-écrivain vous accompagne à chaque étape.
          </div>
          <button onClick={() => setShowProjectModal(true)} className="btn btn-primary">
            ✍️ Créer mon premier projet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const pct = p.word_count_goal ? Math.min(100, Math.round((p.current_word_count / p.word_count_goal) * 100)) : 0;
            return (
              <div key={p.id} className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => selectProject(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 28 }}>{TYPE_ICONS[p.type]}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: STATUS_COLORS[p.status] + '20', color: STATUS_COLORS[p.status],
                  }}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                  {TYPE_LABELS[p.type]}{p.genre ? ` · ${p.genre}` : ''}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                  {p.current_word_count.toLocaleString('fr-FR')} mots
                  {p.word_count_goal ? <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}> / {p.word_count_goal.toLocaleString('fr-FR')}</span> : ''}
                </div>
                {p.word_count_goal && p.word_count_goal > 0 && (
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal New Project */}
      {showProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>✍️ Nouveau projet</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Titre</label>
                <input className="input" placeholder="Titre de votre projet..." value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="input" value={projectForm.type} onChange={e => setProjectForm(p => ({ ...p, type: e.target.value as ProjectType }))}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{TYPE_ICONS[k as ProjectType]} {v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Genre</label>
                  <input className="input" placeholder="Thriller, SF, Romance..." value={projectForm.genre} onChange={e => setProjectForm(p => ({ ...p, genre: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Objectif de mots</label>
                <input className="input" type="number" placeholder="80000" value={projectForm.word_count_goal} onChange={e => setProjectForm(p => ({ ...p, word_count_goal: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Synopsis (optionnel)</label>
                <textarea className="input" rows={3} placeholder="Résumé de votre projet..." value={projectForm.synopsis} onChange={e => setProjectForm(p => ({ ...p, synopsis: e.target.value }))} style={{ resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowProjectModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAddProject} className="btn btn-primary" style={{ flex: 1 }} disabled={projectSaving}>
                {projectSaving ? 'Création...' : 'Créer le projet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
