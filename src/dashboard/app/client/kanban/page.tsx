'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'haute' | 'moyenne' | 'basse';

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  labels: string[];
  columnId: string;
  createdAt: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  order: number;
}

interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  createdAt: string;
}

interface KanbanData {
  boards: KanbanBoard[];
  activeBoardId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fz_kanban';

const PRIORITY_MAP: Record<Priority, { emoji: string; label: string; color: string }> = {
  haute: { emoji: '🔴', label: 'Haute', color: '#ef4444' },
  moyenne: { emoji: '🟡', label: 'Moyenne', color: '#f59e0b' },
  basse: { emoji: '🟢', label: 'Basse', color: '#22c55e' },
};

const LABELS: { name: string; color: string }[] = [
  { name: 'Bug', color: '#ef4444' },
  { name: 'Feature', color: '#3b82f6' },
  { name: 'Design', color: '#8b5cf6' },
  { name: 'Urgent', color: '#dc2626' },
  { name: 'Documentation', color: '#06b6d4' },
];

const ASSIGNEE_EMOJIS = ['👤', '👩‍💻', '👨‍💻', '🧑‍🎨', '👩‍💼', '👨‍💼', '🤖'];

const CU = {
  card: { border: '1px solid #E5E5E5' as const, borderRadius: 8, background: '#fff' },
  btn: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: '1px solid #E5E5E5' as const, background: '#fff' as const,
  },
  btnPrimary: {
    height: 36, padding: '0 14px', borderRadius: 8, fontWeight: 500 as const,
    fontSize: 13, cursor: 'pointer' as const, border: 'none' as const, background: '#1A1A1A', color: '#fff',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function loadData(): KanbanData {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as KanbanData;
    if (raw.boards?.length) return raw;
    return seedData();
  } catch { return seedData(); }
}
function saveData(data: KanbanData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'col-todo', title: 'À faire', order: 0 },
  { id: 'col-doing', title: 'En cours', order: 1 },
  { id: 'col-review', title: 'En review', order: 2 },
  { id: 'col-done', title: 'Terminé', order: 3 },
];

function seedData(): KanbanData {
  const boardId = 'board-1';
  const tasks: KanbanTask[] = [
    { id: uid(), title: 'Rédiger les specs du projet', description: 'Document détaillé des fonctionnalités attendues', priority: 'haute', assignee: '👩‍💻', dueDate: '2026-03-15', labels: ['Documentation'], columnId: 'col-todo', createdAt: '2026-03-10' },
    { id: uid(), title: 'Design de la landing page', description: 'Maquette Figma responsive', priority: 'haute', assignee: '🧑‍🎨', dueDate: '2026-03-16', labels: ['Design'], columnId: 'col-todo', createdAt: '2026-03-10' },
    { id: uid(), title: 'Configurer le CI/CD', description: 'GitHub Actions + tests auto', priority: 'moyenne', assignee: '👨‍💻', dueDate: '2026-03-18', labels: ['Feature'], columnId: 'col-doing', createdAt: '2026-03-08' },
    { id: uid(), title: 'API d\'authentification', description: 'JWT + refresh tokens', priority: 'haute', assignee: '👨‍💻', dueDate: '2026-03-17', labels: ['Feature'], columnId: 'col-doing', createdAt: '2026-03-07' },
    { id: uid(), title: 'Fix bouton de connexion', description: 'Le bouton ne répond pas sur mobile', priority: 'haute', assignee: '👩‍💻', dueDate: '2026-03-14', labels: ['Bug', 'Urgent'], columnId: 'col-review', createdAt: '2026-03-09' },
    { id: uid(), title: 'Tests unitaires module user', description: '', priority: 'moyenne', assignee: '👨‍💻', dueDate: '2026-03-20', labels: ['Feature'], columnId: 'col-review', createdAt: '2026-03-06' },
    { id: uid(), title: 'Setup du projet Next.js', description: 'Repo + structure + linting', priority: 'basse', assignee: '👨‍💻', dueDate: '2026-03-10', labels: ['Feature'], columnId: 'col-done', createdAt: '2026-03-01' },
    { id: uid(), title: 'Charte graphique', description: 'Couleurs, typo, logos', priority: 'basse', assignee: '🧑‍🎨', dueDate: '2026-03-08', labels: ['Design'], columnId: 'col-done', createdAt: '2026-03-02' },
  ];
  const board: KanbanBoard = { id: boardId, name: 'Mon Projet', columns: [...DEFAULT_COLUMNS], tasks, createdAt: '2026-03-01' };
  return { boards: [board], activeBoardId: boardId };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const isMobile = useIsMobile();
  const pageMeta = PAGE_META.kanban ?? { emoji: '📋', title: 'Kanban', subtitle: 'Gérez vos tâches', helpText: '' };

  const [data, setData] = useState<KanbanData>({ boards: [], activeBoardId: '' });
  const [loaded, setLoaded] = useState(false);

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('moyenne');
  const [taskAssignee, setTaskAssignee] = useState('👤');
  const [taskDue, setTaskDue] = useState('');
  const [taskLabels, setTaskLabels] = useState<string[]>([]);
  const [taskColumnId, setTaskColumnId] = useState('');

  // Board management
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  // Column management
  const [showColForm, setShowColForm] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [renameColId, setRenameColId] = useState<string | null>(null);
  const [renameColVal, setRenameColVal] = useState('');

  useEffect(() => {
    const d = loadData();
    saveData(d);
    setData(d);
    setLoaded(true);
  }, []);

  const persist = useCallback((d: KanbanData) => { setData(d); saveData(d); }, []);

  const board = data.boards.find(b => b.id === data.activeBoardId);
  const columns = board?.columns.sort((a, b) => a.order - b.order) ?? [];
  const tasks = board?.tasks ?? [];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
    fontSize: 13, background: '#fff', color: '#1A1A1A', outline: 'none',
  };

  // ── Board CRUD ──
  const createBoard = () => {
    if (!newBoardName.trim()) return;
    const nb: KanbanBoard = { id: uid(), name: newBoardName.trim(), columns: [...DEFAULT_COLUMNS], tasks: [], createdAt: new Date().toISOString().slice(0, 10) };
    const updated = { ...data, boards: [...data.boards, nb], activeBoardId: nb.id };
    persist(updated);
    setShowBoardForm(false);
    setNewBoardName('');
  };
  const deleteBoard = (id: string) => {
    const boards = data.boards.filter(b => b.id !== id);
    persist({ ...data, boards, activeBoardId: boards[0]?.id ?? '' });
  };

  // ── Column CRUD ──
  const addColumn = () => {
    if (!newColName.trim() || !board) return;
    const col: KanbanColumn = { id: uid(), title: newColName.trim(), order: board.columns.length };
    const updated = { ...data, boards: data.boards.map(b => b.id === board.id ? { ...b, columns: [...b.columns, col] } : b) };
    persist(updated);
    setShowColForm(false);
    setNewColName('');
  };
  const deleteColumn = (colId: string) => {
    if (!board) return;
    const updated = { ...data, boards: data.boards.map(b => b.id === board.id ? { ...b, columns: b.columns.filter(c => c.id !== colId), tasks: b.tasks.filter(t => t.columnId !== colId) } : b) };
    persist(updated);
  };
  const renameColumn = () => {
    if (!board || !renameColId || !renameColVal.trim()) return;
    const updated = { ...data, boards: data.boards.map(b => b.id === board.id ? { ...b, columns: b.columns.map(c => c.id === renameColId ? { ...c, title: renameColVal.trim() } : c) } : b) };
    persist(updated);
    setRenameColId(null);
  };

  // ── Task CRUD ──
  const resetTaskForm = () => { setEditTaskId(null); setTaskTitle(''); setTaskDesc(''); setTaskPriority('moyenne'); setTaskAssignee('👤'); setTaskDue(''); setTaskLabels([]); };
  const openNewTask = (colId: string) => { resetTaskForm(); setTaskColumnId(colId); setShowTaskForm(true); };
  const openEditTask = (t: KanbanTask) => { setEditTaskId(t.id); setTaskTitle(t.title); setTaskDesc(t.description); setTaskPriority(t.priority); setTaskAssignee(t.assignee); setTaskDue(t.dueDate); setTaskLabels([...t.labels]); setTaskColumnId(t.columnId); setShowTaskForm(true); };

  const saveTask = () => {
    if (!board || !taskTitle.trim()) return;
    const updated = { ...data };
    if (editTaskId) {
      updated.boards = updated.boards.map(b => b.id === board.id ? { ...b, tasks: b.tasks.map(t => t.id === editTaskId ? { ...t, title: taskTitle, description: taskDesc, priority: taskPriority, assignee: taskAssignee, dueDate: taskDue, labels: taskLabels, columnId: taskColumnId } : t) } : b);
    } else {
      const task: KanbanTask = { id: uid(), title: taskTitle, description: taskDesc, priority: taskPriority, assignee: taskAssignee, dueDate: taskDue, labels: taskLabels, columnId: taskColumnId, createdAt: new Date().toISOString().slice(0, 10) };
      updated.boards = updated.boards.map(b => b.id === board.id ? { ...b, tasks: [...b.tasks, task] } : b);
    }
    persist(updated);
    setShowTaskForm(false);
  };
  const deleteTask = (taskId: string) => {
    if (!board) return;
    persist({ ...data, boards: data.boards.map(b => b.id === board.id ? { ...b, tasks: b.tasks.filter(t => t.id !== taskId) } : b) });
  };
  const moveTask = (taskId: string, newColId: string) => {
    if (!board) return;
    persist({ ...data, boards: data.boards.map(b => b.id === board.id ? { ...b, tasks: b.tasks.map(t => t.id === taskId ? { ...t, columnId: newColId } : t) } : b) });
  };

  const toggleLabel = (label: string) => {
    setTaskLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  // Stats
  const totalTasks = tasks.length;
  const tasksByCol = columns.map(c => ({ name: c.title, count: tasks.filter(t => t.columnId === c.id).length }));

  // Filter tasks
  const filterTask = (t: KanbanTask) => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterLabel !== 'all' && !t.labels.includes(filterLabel)) return false;
    return true;
  };

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Chargement...</div>;

  return (
    <div className="client-page-scrollable">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{pageMeta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>
                <span className="fz-logo-word">{pageMeta.title}</span>
              </h1>
              <HelpBubble text={pageMeta.helpText} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{pageMeta.subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6B6B6B' }}>{totalTasks} tâches</span>
          {tasksByCol.map(c => (
            <span key={c.name} style={{ fontSize: 10, color: '#9B9B9B' }}>{c.name}: {c.count}</span>
          ))}
        </div>
      </div>
      <PageExplanation pageId="kanban" text={pageMeta.helpText} />

      {/* Board selector + management */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={data.activeBoardId} onChange={e => persist({ ...data, activeBoardId: e.target.value })}
          style={{ ...CU.btn, padding: '0 8px' }}>
          {data.boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button onClick={() => setShowBoardForm(true)} style={{ ...CU.btn, height: 32, fontSize: 11 }}>➕ Tableau</button>
        {data.boards.length > 1 && board && (
          <button onClick={() => deleteBoard(board.id)} style={{ ...CU.btn, height: 32, fontSize: 11, color: '#ef4444' }}>🗑️ Suppr. tableau</button>
        )}
        <button onClick={() => setShowColForm(true)} style={{ ...CU.btn, height: 32, fontSize: 11 }}>➕ Colonne</button>
        <div style={{ flex: 1 }} />
        {/* Filters */}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...CU.btn, height: 32, fontSize: 11, padding: '0 6px' }}>
          <option value="all">Priorité: Toutes</option>
          {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <select value={filterLabel} onChange={e => setFilterLabel(e.target.value)} style={{ ...CU.btn, height: 32, fontSize: 11, padding: '0 6px' }}>
          <option value="all">Label: Tous</option>
          {LABELS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
        </select>
      </div>

      {/* Board form */}
      {showBoardForm && (
        <div style={{ ...CU.card, padding: 16, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} placeholder="Nom du tableau" style={{ ...inputStyle, maxWidth: 250 }} />
          <button onClick={createBoard} style={CU.btnPrimary}>Créer</button>
          <button onClick={() => setShowBoardForm(false)} style={CU.btn}>Annuler</button>
        </div>
      )}

      {/* Column form */}
      {showColForm && (
        <div style={{ ...CU.card, padding: 16, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Nom de la colonne" style={{ ...inputStyle, maxWidth: 250 }} />
          <button onClick={addColumn} style={CU.btnPrimary}>Ajouter</button>
          <button onClick={() => setShowColForm(false)} style={CU.btn}>Annuler</button>
        </div>
      )}

      {/* Task form modal */}
      {showTaskForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowTaskForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: isMobile ? 16 : 24, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>{editTaskId ? 'Modifier' : 'Nouvelle'} tâche</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Titre</label><input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={inputStyle} /></div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Description</label><textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Priorité</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as Priority)} style={inputStyle}>
                    {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Échéance</label><input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6B6B6B' }}>Colonne</label>
                <select value={taskColumnId} onChange={e => setTaskColumnId(e.target.value)} style={inputStyle}>
                  {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B' }}>Assigné</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {ASSIGNEE_EMOJIS.map(e => (
                    <button key={e} onClick={() => setTaskAssignee(e)} style={{ width: 32, height: 32, borderRadius: 8, border: taskAssignee === e ? '2px solid #1A1A1A' : '1px solid #E5E5E5', background: '#fff', fontSize: 16, cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B6B6B' }}>Labels</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {LABELS.map(l => (
                    <button key={l.name} onClick={() => toggleLabel(l.name)}
                      style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: taskLabels.includes(l.name) ? `2px solid ${l.color}` : '1px solid #E5E5E5', background: taskLabels.includes(l.name) ? l.color + '20' : '#fff', color: l.color }}>
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowTaskForm(false)} style={CU.btn}>Annuler</button>
              <button onClick={saveTask} style={CU.btnPrimary}>{editTaskId ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename column inline */}
      {renameColId && (
        <div style={{ ...CU.card, padding: 12, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={renameColVal} onChange={e => setRenameColVal(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
          <button onClick={renameColumn} style={CU.btnPrimary}>OK</button>
          <button onClick={() => setRenameColId(null)} style={CU.btn}>Annuler</button>
        </div>
      )}

      {/* ── Kanban Board ── */}
      {!board ? (
        <div style={{ ...CU.card, padding: 40, textAlign: 'center', color: '#6B6B6B' }}>Aucun tableau. Créez-en un ci-dessus.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${columns.length}, 1fr)`, gap: 12, overflowX: isMobile ? 'auto' : undefined }}>
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.columnId === col.id && filterTask(t));
            return (
              <div key={col.id} style={{ minWidth: isMobile ? 260 : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '6px 8px', background: '#f8f8f8', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{col.title}</span>
                    <span style={{ fontSize: 11, color: '#9B9B9B' }}>({colTasks.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => openNewTask(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Ajouter une tâche">➕</button>
                    <button onClick={() => { setRenameColId(col.id); setRenameColVal(col.title); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }} title="Renommer">✏️</button>
                    <button onClick={() => deleteColumn(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }} title="Supprimer">🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(task => (
                    <div key={task.id} style={{ ...CU.card, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{task.title}</div>
                        <span style={{ fontSize: 16 }}>{task.assignee}</span>
                      </div>
                      {task.description && <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 6 }}>{task.description}</div>}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: PRIORITY_MAP[task.priority].color, fontWeight: 600 }}>{PRIORITY_MAP[task.priority].emoji} {PRIORITY_MAP[task.priority].label}</span>
                        {task.dueDate && <span style={{ fontSize: 10, color: '#9B9B9B' }}>📅 {task.dueDate}</span>}
                      </div>
                      {task.labels.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                          {task.labels.map(l => {
                            const labelDef = LABELS.find(lb => lb.name === l);
                            return <span key={l} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: (labelDef?.color ?? '#6B6B6B') + '18', color: labelDef?.color ?? '#6B6B6B', fontWeight: 600 }}>{l}</span>;
                          })}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <select value={task.columnId} onChange={e => moveTask(task.id, e.target.value)} style={{ ...CU.btn, height: 22, fontSize: 9, padding: '0 2px', flex: 1 }}>
                          {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <button onClick={() => openEditTask(task)} style={{ ...CU.btn, height: 22, fontSize: 9, padding: '0 4px' }}>✏️</button>
                        <button onClick={() => deleteTask(task.id)} style={{ ...CU.btn, height: 22, fontSize: 9, padding: '0 4px', color: '#ef4444' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div style={{ ...CU.card, padding: 16, textAlign: 'center', color: '#9B9B9B', fontSize: 11 }}>Vide</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
