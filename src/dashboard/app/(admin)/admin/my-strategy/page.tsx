'use client';

import { useState, useEffect } from 'react';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

interface Objective {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'haute' | 'moyenne' | 'basse';
  status: 'en_cours' | 'en_pause' | 'termine';
}

interface ActionItem {
  id: string;
  title: string;
  done: boolean;
  folderId: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const DEFAULT_FOLDERS = [
  { id: 'marketing', name: 'Marketing', icon: '📣', color: 'blue' },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'green' },
  { id: 'tech', name: 'Tech', icon: '💻', color: 'purple' },
  { id: 'commercial', name: 'Commercial', icon: '🤝', color: 'yellow' },
  { id: 'rh', name: 'RH', icon: '👥', color: 'pink' },
  { id: 'juridique', name: 'Juridique', icon: '⚖️', color: 'red' },
  { id: 'operations', name: 'Opérations', icon: '⚙️', color: 'orange' },
  { id: 'divers', name: 'Divers', icon: '📦', color: 'gray' },
];

const PRIORITY_COLORS = { haute: 'text-red-400', moyenne: 'text-yellow-400', basse: 'text-green-400' };
const STATUS_LABELS = { en_cours: 'En cours', en_pause: 'En pause', termine: 'Terminé' };

export default function MyStrategyPage() {
  const [tab, setTab] = useState<'objectives' | 'actions' | 'plan' | 'notes'>('objectives');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showNewObj, setShowNewObj] = useState(false);
  const [newObj, setNewObj] = useState<{ title: string; description: string; deadline: string; priority: 'haute' | 'moyenne' | 'basse' }>({ title: '', description: '', deadline: '', priority: 'moyenne' });
  const [newNote, setNewNote] = useState('');
  const [newAction, setNewAction] = useState({ title: '', folderId: 'marketing' });

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('fz_admin_strategy') ?? '{}');
      if (data.objectives) setObjectives(data.objectives);
      if (data.actions) setActions(data.actions);
      if (data.notes) setNotes(data.notes);
      if (data.generatedPlan) setGeneratedPlan(data.generatedPlan);
    } catch { /* */ }
  }, []);

  const save = (obj?: Objective[], act?: ActionItem[], nt?: Note[], plan?: string) => {
    const data = { objectives: obj ?? objectives, actions: act ?? actions, notes: nt ?? notes, generatedPlan: plan ?? generatedPlan };
    localStorage.setItem('fz_admin_strategy', JSON.stringify(data));
  };

  const addObjective = () => {
    if (!newObj.title) return;
    const o: Objective = { ...newObj, id: crypto.randomUUID(), status: 'en_cours' };
    const updated = [...objectives, o];
    setObjectives(updated);
    save(updated);
    setNewObj({ title: '', description: '', deadline: '', priority: 'moyenne' });
    setShowNewObj(false);
  };

  const toggleAction = (id: string) => {
    const updated = actions.map(a => a.id === id ? { ...a, done: !a.done } : a);
    setActions(updated);
    save(undefined, updated);
  };

  const addAction = () => {
    if (!newAction.title) return;
    const a: ActionItem = { id: crypto.randomUUID(), title: newAction.title, done: false, folderId: newAction.folderId };
    const updated = [...actions, a];
    setActions(updated);
    save(undefined, updated);
    setNewAction({ title: '', folderId: 'marketing' });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const n: Note = { id: crypto.randomUUID(), content: newNote, createdAt: new Date().toISOString() };
    const updated = [n, ...notes];
    setNotes(updated);
    save(undefined, undefined, updated);
    setNewNote('');
  };

  const generatePlan = async () => {
    setGenerating(true);
    const context = objectives.map(o => `- ${o.title} (${o.priority}, ${o.status}): ${o.description}`).join('\n');
    const actionsCtx = actions.map(a => `- [${a.done ? 'x' : ' '}] ${a.title} (${a.folderId})`).join('\n');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: getToken(),
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Tu es un directeur stratégique. Voici les objectifs:\n${context}\n\nActions en cours:\n${actionsCtx}\n\nGénère un plan d'attaque détaillé avec: 1) Priorités immédiates (cette semaine), 2) Actions à 30 jours, 3) Vision à 90 jours, 4) KPIs à suivre, 5) Risques identifiés.` }],
          maxTokens: 4096,
          agentName: 'fz-dg',
        }),
      });
      const data = await res.json() as { content?: string; response?: string };
      const plan = data.content ?? data.response ?? '';
      setGeneratedPlan(plan);
      save(undefined, undefined, undefined, plan);
    } catch { /* */ }
    setGenerating(false);
  };

  const TABS = [
    { id: 'objectives', label: 'Objectifs', count: objectives.length },
    { id: 'actions', label: 'Actions', count: actions.filter(a => !a.done).length },
    { id: 'plan', label: 'Plan IA', count: generatedPlan ? 1 : 0 },
    { id: 'notes', label: 'Notes', count: notes.length },
  ] as const;

  return (
    <div className="space-y-6 admin-page-scrollable">
      <div>
        <h1 className="text-2xl font-bold text-white">Plan d&apos;attaque</h1>
        <p className="text-gray-400 mt-1">Stratégie, objectifs, actions — pilotage IA</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {t.label} {t.count > 0 && <span className="ml-1 bg-gray-700 px-1.5 py-0.5 rounded text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Objectives */}
      {tab === 'objectives' && (
        <div className="space-y-3">
          <button onClick={() => setShowNewObj(!showNewObj)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            + Nouvel objectif
          </button>
          {showNewObj && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
              <input value={newObj.title} onChange={e => setNewObj({ ...newObj, title: e.target.value })} placeholder="Titre" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm" />
              <textarea value={newObj.description} onChange={e => setNewObj({ ...newObj, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm resize-none" />
              <div className="flex gap-3">
                <input type="date" value={newObj.deadline} onChange={e => setNewObj({ ...newObj, deadline: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm" />
                <select value={newObj.priority} onChange={e => setNewObj({ ...newObj, priority: e.target.value as 'haute' | 'moyenne' | 'basse' })} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm">
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
                <button onClick={addObjective} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Ajouter</button>
              </div>
            </div>
          )}
          {objectives.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700/50">Aucun objectif défini</div>
          ) : objectives.map(o => (
            <div key={o.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{o.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{o.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={PRIORITY_COLORS[o.priority]}>{o.priority}</span>
                  <span className="text-gray-500">{STATUS_LABELS[o.status]}</span>
                  {o.deadline && <span className="text-gray-600">{o.deadline}</span>}
                  <button onClick={() => { const upd = objectives.filter(x => x.id !== o.id); setObjectives(upd); save(upd); }} className="text-red-500 hover:text-red-400">Suppr</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions by folder */}
      {tab === 'actions' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <input value={newAction.title} onChange={e => setNewAction({ ...newAction, title: e.target.value })} placeholder="Nouvelle action..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm" />
            <select value={newAction.folderId} onChange={e => setNewAction({ ...newAction, folderId: e.target.value })} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm">
              {DEFAULT_FOLDERS.map(f => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}
            </select>
            <button onClick={addAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Ajouter</button>
          </div>
          {DEFAULT_FOLDERS.map(folder => {
            const folderActions = actions.filter(a => a.folderId === folder.id);
            if (folderActions.length === 0) return null;
            return (
              <div key={folder.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h3 className="text-white font-medium mb-2">{folder.icon} {folder.name} ({folderActions.filter(a => !a.done).length}/{folderActions.length})</h3>
                {folderActions.map(a => (
                  <div key={a.id} className="flex items-center gap-2 py-1">
                    <button onClick={() => toggleAction(a.id)} className={`w-5 h-5 rounded border ${a.done ? 'bg-green-600 border-green-600' : 'border-gray-600'} flex items-center justify-center text-xs text-white`}>
                      {a.done ? '✓' : ''}
                    </button>
                    <span className={`text-sm ${a.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{a.title}</span>
                    <button onClick={() => { const upd = actions.filter(x => x.id !== a.id); setActions(upd); save(undefined, upd); }} className="ml-auto text-red-500 text-xs hover:text-red-400">×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Plan */}
      {tab === 'plan' && (
        <div className="space-y-4">
          <button onClick={generatePlan} disabled={generating || objectives.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
            {generating ? 'Génération...' : 'Générer plan d\'attaque IA'}
          </button>
          {generatedPlan ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Plan stratégique IA</h3>
                <button onClick={() => navigator.clipboard.writeText(generatedPlan)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs">Copier</button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300">{generatedPlan}</div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700/50">
              {objectives.length === 0 ? 'Ajoutez des objectifs d\'abord' : 'Cliquez pour générer un plan stratégique'}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Nouvelle note..." rows={2} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none" />
            <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm self-end">Ajouter</button>
          </div>
          {notes.map(n => (
            <div key={n.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between">
              <div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{n.content}</p>
                <p className="text-gray-600 text-xs mt-2">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <button onClick={() => { const upd = notes.filter(x => x.id !== n.id); setNotes(upd); save(undefined, undefined, upd); }} className="text-red-500 text-xs hover:text-red-400 shrink-0 ml-3">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
