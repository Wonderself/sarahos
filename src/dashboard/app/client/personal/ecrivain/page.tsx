'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';
import HelpBubble from '../../../../components/HelpBubble';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';

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
  roman: '📖', scenario: '🎬', essai: '✍️', nouvelles: '✨', autre: '📄',
};
const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Brouillon', in_progress: 'En cours', revision: 'Révision', completed: 'Terminé', paused: 'Pause',
};
const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: '#6b7280', in_progress: '#3b82f6', revision: '#f59e0b', completed: '#22c55e', paused: '#06b6d4',
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
  const isMobile = useIsMobile();
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
      <div style={pageContainer(isMobile)}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: CU.textMuted, flexWrap: 'wrap' }}>
          <button onClick={() => { setSelectedChapter(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>
            ← Retour
          </button>
          <span>|</span>
          <span>{TYPE_ICONS[selectedProject.type]} {selectedProject.title}</span>
          <span>›</span>
          <span style={{ color: CU.text, fontWeight: 600 }}>{selectedChapter.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
          {/* Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: CU.text }}>{selectedChapter.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: CU.textMuted }}>
                  {editorWordCount.toLocaleString('fr-FR')} mots
                </span>
                <span style={{ fontSize: 11, color: editorSaving ? '#f59e0b' : editorSaved ? '#22c55e' : CU.textMuted }}>
                  {editorSaving ? <>⏳ Sauvegarde...</> : editorSaved ? <>✅ Sauvegardé</> : ''}
                </span>
              </div>
            </div>
            <textarea
              value={editorContent}
              onChange={e => handleEditorChange(e.target.value)}
              placeholder="Commencez à écrire votre chapitre..."
              style={{
                width: '100%', minHeight: 520, padding: '16px 20px',
                background: CU.bgSecondary, border: `1px solid ${CU.border}`,
                borderRadius: 8, fontSize: 15, lineHeight: 1.8, color: CU.text,
                resize: 'vertical', fontFamily: 'Georgia, serif', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = CU.accent; }}
              onBlur={e => { e.target.style.borderColor = CU.border; }}
            />
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ ...CU.card, padding: 16 }}>
              <div style={{ ...CU.label, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>Statut du chapitre</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(Object.entries(CHAPTER_STATUS_LABELS) as [ChapterStatus, string][]).map(([s, l]) => (
                  <button
                    key={s}
                    onClick={() => handleChapterStatusChange(selectedChapter.id, s)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: selectedChapter.status === s ? `2px solid ${CHAPTER_STATUS_COLORS[s]}` : `1px solid ${CU.border}`,
                      background: selectedChapter.status === s ? CHAPTER_STATUS_COLORS[s] + '20' : CU.bgSecondary,
                      color: selectedChapter.status === s ? CHAPTER_STATUS_COLORS[s] : CU.textSecondary,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {selectedChapter.ai_notes && (
              <div style={{ ...CU.card, padding: 16, borderLeft: `3px solid ${CU.accent}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: CU.accent }}>🤖 Notes AI</div>
                <div style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.6 }}>{selectedChapter.ai_notes}</div>
              </div>
            )}

            <Link
              href={`/client/chat?agent=fz-ecrivain&context=${encodeURIComponent(`Chapitre: ${selectedChapter.title}\n${editorContent.slice(0, 500)}`)}`}
              style={{ ...CU.btnPrimary, height: 32, fontSize: 12, textAlign: 'center' as const, textDecoration: 'none' }}
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
      <div style={pageContainer(isMobile)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 13 }}>
            ← Mes projets
          </button>
        </div>

        {/* Project header */}
        <div style={{ ...CU.card, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{TYPE_ICONS[selectedProject.type]}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: CU.text }}>{selectedProject.title}</h2>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: STATUS_COLORS[selectedProject.status] + '20', color: STATUS_COLORS[selectedProject.status],
                }}>
                  {STATUS_LABELS[selectedProject.status]}
                </span>
              </div>
              {selectedProject.genre && <div style={{ fontSize: 13, color: CU.textMuted }}>Genre : {selectedProject.genre}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: CU.accent }}>
                {totalWords.toLocaleString('fr-FR')} mots
              </div>
              {goalWords > 0 && <div style={{ fontSize: 12, color: CU.textMuted }}>/ {goalWords.toLocaleString('fr-FR')} objectif</div>}
            </div>
          </div>
          {goalWords > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, borderRadius: 3, background: CU.bgSecondary, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: CU.accent, borderRadius: 3, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 4 }}>{pct}% de l&apos;objectif</div>
            </div>
          )}
          {selectedProject.synopsis && (
            <div style={{ marginTop: 12, fontSize: 12, color: CU.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>
              &ldquo;{selectedProject.synopsis}&rdquo;
            </div>
          )}
        </div>

        {/* Chapters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Chapitres ({chapters.length})</h3>
          <button onClick={() => setShowChapterModal(true)} style={{ ...CU.btnPrimary, height: 32, fontSize: 12 }}>+ Nouveau chapitre</button>
        </div>

        {chaptersLoading ? (
          <div className="text-center text-tertiary" style={{ padding: 40 }}>Chargement des chapitres...</div>
        ) : chapters.length === 0 ? (
          <div style={{ ...CU.card, ...CU.emptyState }}>
            <div style={CU.emptyEmoji}>📖</div>
            <div style={CU.emptyTitle}>Aucun chapitre</div>
            <button onClick={() => setShowChapterModal(true)} style={{ ...CU.btnPrimary, height: 32, fontSize: 12 }}>Écrire le premier chapitre</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chapters.map((c, i) => (
              <div
                key={c.id}
                style={{ ...CU.cardHoverable, display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => selectChapter(c)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: CU.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 2 }}>
                    {c.word_count.toLocaleString('fr-FR')} mots
                    {c.content && c.content.length > 0 && (
                      <span style={{ marginLeft: 8, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: CU.textMuted, fontSize: 16, flexShrink: 0 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add Chapter Modal */}
        {showChapterModal && (
          <div style={CU.overlay}>
            <div style={{ ...CU.modal, maxWidth: 360 }}>
              <h3 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 16 }}>📖 Nouveau chapitre</h3>
              <input style={CU.input} placeholder="Titre du chapitre..." value={chapterForm.title} onChange={e => setChapterForm({ title: e.target.value })} autoFocus />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => setShowChapterModal(false)} style={{ ...CU.btnGhost, flex: 1 }}>Annuler</button>
                <button onClick={handleAddChapter} style={{ ...CU.btnPrimary, flex: 1 }} disabled={chapterSaving}>
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
    <div style={pageContainer(isMobile)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: CU.textMuted, textDecoration: 'none' }}>
              ← Agents personnels
            </Link>
          </div>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{PAGE_META.ecrivain.emoji}</span>
            <h1 style={CU.pageTitle}>{PAGE_META.ecrivain.title}</h1>
          </div>
          <p style={CU.pageSubtitle}>{PAGE_META.ecrivain.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <HelpBubble text={PAGE_META.ecrivain.helpText} />
          <button onClick={() => setShowProjectModal(true)} style={CU.btnPrimary}>+ Nouveau projet</button>
        </div>
      </div>
      <PageExplanation pageId="ecrivain" text={PAGE_META.ecrivain?.helpText} />

      {error && <div style={{ ...CU.card, background: '#FFF5F5', color: CU.danger, marginBottom: 20, fontSize: 13 }}>{error}</div>}

      {projects.length === 0 ? (
        <div style={{ ...CU.card, ...CU.emptyState }}>
          <div style={CU.emptyEmoji}>✍️</div>
          <div style={CU.emptyTitle}>Votre atelier vous attend</div>
          <div style={CU.emptyDesc}>
            Démarrez un roman, un scénario, un essai... fz-écrivain vous accompagne à chaque étape.
          </div>
          <button onClick={() => setShowProjectModal(true)} style={CU.btnPrimary}>
            ✍️ Créer mon premier projet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const pct = p.word_count_goal ? Math.min(100, Math.round((p.current_word_count / p.word_count_goal) * 100)) : 0;
            return (
              <div key={p.id} style={{ ...CU.cardHoverable, padding: '20px' }} onClick={() => selectProject(p)}>
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
                <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 10 }}>
                  {TYPE_LABELS[p.type]}{p.genre ? ` · ${p.genre}` : ''}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: CU.accent, marginBottom: 6 }}>
                  {p.current_word_count.toLocaleString('fr-FR')} mots
                  {p.word_count_goal ? <span style={{ fontWeight: 400, color: CU.textMuted }}> / {p.word_count_goal.toLocaleString('fr-FR')}</span> : ''}
                </div>
                {p.word_count_goal && p.word_count_goal > 0 && (
                  <div style={{ height: 4, borderRadius: 2, background: CU.bgSecondary, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: CU.accent, borderRadius: 2 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal New Project */}
      {showProjectModal && (
        <div style={CU.overlay}>
          <div style={{ ...CU.modal, maxWidth: 460 }}>
            <h3 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 20 }}>✍️ Nouveau projet</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={CU.label}>Titre</label>
                <input style={CU.input} placeholder="Titre de votre projet..." value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 12 }}>
                <div>
                  <label style={CU.label}>Type</label>
                  <select style={{ ...CU.select, width: '100%' }} value={projectForm.type} onChange={e => setProjectForm(p => ({ ...p, type: e.target.value as ProjectType }))}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{TYPE_ICONS[k as ProjectType]} {v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={CU.label}>Genre</label>
                  <input style={CU.input} placeholder="Thriller, SF, Romance..." value={projectForm.genre} onChange={e => setProjectForm(p => ({ ...p, genre: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={CU.label}>Objectif de mots</label>
                <input style={CU.input} type="number" placeholder="80000" value={projectForm.word_count_goal} onChange={e => setProjectForm(p => ({ ...p, word_count_goal: e.target.value }))} />
              </div>
              <div>
                <label style={CU.label}>Synopsis (optionnel)</label>
                <textarea style={{ ...CU.textarea, resize: 'none' as const }} rows={3} placeholder="Résumé de votre projet..." value={projectForm.synopsis} onChange={e => setProjectForm(p => ({ ...p, synopsis: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowProjectModal(false)} style={{ ...CU.btnGhost, flex: 1 }}>Annuler</button>
              <button onClick={handleAddProject} style={{ ...CU.btnPrimary, flex: 1 }} disabled={projectSaving}>
                {projectSaving ? 'Création...' : 'Créer le projet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
