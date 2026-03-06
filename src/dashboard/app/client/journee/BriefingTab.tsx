'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { buildSystemPrompt } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';
import { useToast } from '../../../components/Toast';

interface TaskItem {
  id: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  done: boolean;
  aiSuggested: boolean;
}

interface InsightCard {
  icon: string;
  title: string;
  content: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

const PRIORITY_LABELS = {
  urgent: 'Urgent',
  high: 'Important',
  medium: 'Normal',
  low: 'Optionnel',
};

const BRIEFING_CACHE_KEY = 'fz_briefing_cache';

interface BriefingCache {
  date: string;
  insights: InsightCard[];
  greeting: string;
  generatedAt: string;
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

export default function BriefingTab() {
  const { showError, showSuccess } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }));
  const [focusTime, setFocusTime] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const focusRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    // Load saved tasks
    const saved = localStorage.getItem('fz_tasks');
    if (saved) try { setTasks(JSON.parse(saved)); } catch { /* */ }

    // Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');

    // Load briefing from cache or generate local insights
    loadBriefingWithCache();

    return () => { if (focusRef.current) clearInterval(focusRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadBriefingWithCache() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const cached: BriefingCache = JSON.parse(localStorage.getItem(BRIEFING_CACHE_KEY) ?? '{}');
      if (cached.date === today && cached.insights?.length) {
        if (cached.greeting) setGreeting(cached.greeting);
        setInsights(cached.insights);
        setGeneratedAt(cached.generatedAt || '');
        return;
      }
    } catch { /* */ }
    generateLocalInsights();
  }

  function generateLocalInsights() {
    const now = new Date();
    const day = now.getDay();
    const localInsights: InsightCard[] = [];

    if (day === 1) {
      localInsights.push({
        icon: 'target', title: 'Début de semaine',
        content: 'C\'est lundi ! Commencez par définir vos 3 objectifs clés de la semaine. Priorisez les tâches à fort impact.',
        type: 'info',
      });
    } else if (day === 5) {
      localInsights.push({
        icon: 'bar_chart', title: 'Bilan hebdomadaire',
        content: 'Vendredi ! Prenez 15 minutes pour faire le bilan de la semaine. Qu\'avez-vous accompli ? Que reporter ?',
        type: 'info',
      });
    }

    localInsights.push(
      {
        icon: 'lightbulb', title: 'Conseil productivité',
        content: 'Bloquez 90 minutes sans interruption pour votre tâche la plus importante. Le deep work multiplie votre efficacité par 3.',
        type: 'success',
      },
      {
        icon: 'trending_up', title: 'Tendance du jour',
        content: 'Les entreprises qui utilisent l\'IA pour automatiser leurs tâches répétitives gagnent en moyenne 6h par semaine.',
        type: 'info',
      },
    );

    setInsights(localInsights);
  }

  async function generateAIBriefing() {
    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    setAiLoading(true);
    try {
      const companyProfile = localStorage.getItem('fz_company_profile');
      const tasksSummary = tasks.filter(t => !t.done).map(t => `- [${t.priority}] ${t.title}`).join('\n');
      const customPrompt = buildSystemPrompt('fz-assistante');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [
            {
              role: 'user',
              content: `${customPrompt}\n\nGénère un briefing quotidien personnalisé.

Contexte entreprise: ${companyProfile ?? 'Non renseigné'}
Tâches en cours: ${tasksSummary || 'Aucune tâche'}
Date: ${currentDate}
Heure: ${new Date().getHours()}h

Réponds en JSON STRICT avec ce format:
{
  "greeting": "Message de salutation personnalisé (1 phrase)",
  "topPriority": "La chose la plus importante à faire aujourd'hui (1 phrase)",
  "insights": [
    {"icon": "emoji", "title": "titre court", "content": "conseil/insight (2 phrases max)", "type": "success|warning|info|danger"}
  ],
  "suggestedTasks": [
    {"title": "titre de la tâche", "priority": "urgent|high|medium|low", "category": "catégorie"}
  ],
  "motivationalQuote": "Citation motivante en français"
}`,
            },
          ],
          maxTokens: 1024,
          agentName: 'fz-assistante',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');

      const text = data.content ?? data.text ?? '';
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const newGreeting = parsed.greeting || greeting;
          const newInsights = parsed.insights || insights;
          const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

          if (parsed.greeting) setGreeting(newGreeting);
          if (parsed.insights) setInsights(newInsights);
          setGeneratedAt(now);

          // Save to cache
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({
            date: today,
            insights: newInsights,
            greeting: newGreeting,
            generatedAt: now,
          }));

          if (parsed.suggestedTasks?.length) {
            const newAiTasks: TaskItem[] = parsed.suggestedTasks.map((t: { title: string; priority: string; category: string }, i: number) => ({
              id: `ai-${Date.now()}-${i}`,
              title: t.title,
              priority: (t.priority || 'medium') as TaskItem['priority'],
              category: t.category || 'IA',
              done: false,
              aiSuggested: true,
            }));
            saveTasks([...tasks, ...newAiTasks]);
          }

          showSuccess('Briefing IA généré avec succès !');
        }
      } catch { /* parsing failed, keep existing insights */ }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Impossible de générer le briefing IA');
    } finally {
      setAiLoading(false);
    }
  }

  function refreshBriefing() {
    localStorage.removeItem(BRIEFING_CACHE_KEY);
    setGeneratedAt('');
    generateAIBriefing();
  }

  function saveTasks(t: TaskItem[]) {
    setTasks(t);
    localStorage.setItem('fz_tasks', JSON.stringify(t));
  }

  function addTask() {
    if (!newTask.trim()) return;
    saveTasks([...tasks, {
      id: `task-${Date.now()}`,
      title: newTask.trim(),
      priority: newPriority,
      category: 'Manuel',
      done: false,
      aiSuggested: false,
    }]);
    setNewTask('');
    setShowAddTask(false);
  }

  function toggleTask(id: string) {
    saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id));
  }

  function startFocus() {
    if (focusActive) {
      if (focusRef.current) clearInterval(focusRef.current);
      setFocusActive(false);
      setFocusTime(0);
      return;
    }
    const seconds = 25 * 60;
    setFocusTime(seconds);
    setFocusActive(true);
    focusRef.current = setInterval(() => {
      setFocusTime(prev => {
        if (prev <= 1) {
          if (focusRef.current) clearInterval(focusRef.current);
          setFocusActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);
  const urgentCount = pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const session = getSession();

  return (
    <div>
      {/* Header */}
      <div className="page-header flex-between flex-wrap gap-12" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title text-2xl">
            {greeting}{session.displayName ? `, ${session.displayName}` : ''} !
          </h2>
          <p className="page-subtitle">{currentDate}</p>
          {generatedAt && (
            <p className="text-xs text-accent" style={{ marginTop: 4 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>auto_awesome</span> Briefing généré à {generatedAt}
            </p>
          )}
        </div>
        <button
          onClick={refreshBriefing}
          disabled={aiLoading}
          className="btn btn-primary flex items-center gap-8"
        >
          {aiLoading ? (
            <span className="animate-pulse">Analyse en cours...</span>
          ) : (
            <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>{generatedAt ? 'refresh' : 'auto_awesome'}</span> {generatedAt ? 'Rafraîchir' : 'Briefing IA'}</>
          )}
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid-4 section">
        <div className="stat-card">
          <div className="stat-label">Tâches aujourd&apos;hui</div>
          <div className="stat-value">{pendingTasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Urgentes</div>
          <div className="stat-value" style={{ color: urgentCount > 0 ? '#ef4444' : 'var(--success)' }}>{urgentCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Complétées</div>
          <div className="stat-value">{doneTasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Progression</div>
          <div className="stat-value" style={{ color: completionRate >= 80 ? 'var(--success)' : completionRate >= 50 ? '#f59e0b' : 'var(--text-primary)' }}>
            {completionRate}%
          </div>
          <div className="progress-bar mt-8">
            <div className="progress-fill" style={{
              width: `${completionRate}%`,
              background: completionRate >= 80 ? 'var(--success)' : completionRate >= 50 ? '#f59e0b' : 'var(--accent)',
            }} />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="section">
          <div className="section-title">Insights du jour</div>
          <div className="grid-2 gap-12">
            {insights.map((insight, i) => (
              <div key={i} className="card" style={{
                borderLeft: `3px solid ${
                  insight.type === 'success' ? 'var(--success)'
                    : insight.type === 'warning' ? '#f59e0b'
                      : insight.type === 'danger' ? '#ef4444'
                        : 'var(--accent)'
                }`,
              }}>
                <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{insight.icon}</span></span>
                  <div>
                    <div className="text-base font-bold mb-4">{insight.title}</div>
                    <div className="text-md text-secondary" style={{ lineHeight: 1.6 }}>{insight.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="section">
        <div className="flex-between items-center mb-16">
          <div className="section-title" style={{ margin: 0 }}>Mes tâches</div>
          <div className="flex gap-8">
            <button
              onClick={startFocus}
              className={focusActive ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {focusActive
                ? <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>timer</span> {Math.floor(focusTime / 60)}:{String(focusTime % 60).padStart(2, '0')} — Stop</>
                : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>local_fire_department</span> Focus 25min</>}
            </button>
            <button onClick={() => setShowAddTask(!showAddTask)} className="btn btn-primary btn-sm">
              + Ajouter
            </button>
          </div>
        </div>

        {/* Add task form */}
        {showAddTask && (
          <div className="card flex gap-8 mb-16" style={{ alignItems: 'flex-end' }}>
            <div className="flex-1">
              <div className="flex gap-6 items-center mb-8">
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  className="input"
                  placeholder="Titre de la tâche..."
                  style={{ flex: 1 }}
                />
                <VoiceInput
                  onTranscript={(t) => setNewTask(prev => prev ? prev + ' ' + t : t)}
                  size="sm"
                />
              </div>
              <div className="flex gap-6">
                {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: newPriority === p ? PRIORITY_COLORS[p] + '22' : 'transparent',
                      border: `1px solid ${newPriority === p ? PRIORITY_COLORS[p] : 'var(--border-primary)'}`,
                      color: newPriority === p ? PRIORITY_COLORS[p] : 'var(--text-muted)',
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addTask} className="btn btn-primary btn-sm">Ajouter</button>
          </div>
        )}

        {/* Empty state */}
        {pendingTasks.length === 0 && doneTasks.length === 0 && (
          <div className="card text-center text-muted" style={{ padding: 32 }}>
            <div className="mb-12" style={{ fontSize: 40 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>assignment</span></div>
            <div className="font-semibold mb-4" style={{ fontSize: 15 }}>Aucune tâche</div>
            <div className="text-md">
              Ajoutez des tâches manuellement ou cliquez sur &quot;Briefing IA&quot; pour des suggestions.
            </div>
          </div>
        )}

        {/* Pending tasks sorted by priority */}
        {pendingTasks
          .sort((a, b) => {
            const order = { urgent: 0, high: 1, medium: 2, low: 3 };
            return order[a.priority] - order[b.priority];
          })
          .map(task => (
            <div key={task.id} className="flex items-center gap-12 bg-secondary rounded-md" style={{
              padding: '10px 14px', marginBottom: 4,
              borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
            }}>
              <button
                onClick={() => toggleTask(task.id)}
                style={{
                  width: 22, height: 22, borderRadius: 6, border: `2px solid ${PRIORITY_COLORS[task.priority]}`,
                  background: 'transparent', flexShrink: 0, cursor: 'pointer',
                }}
              />
              <div className="flex-1">
                <div className="text-base font-medium">{task.title}</div>
                <div className="flex gap-6 mt-4">
                  <span className="text-xs rounded-sm" style={{
                    padding: '2px 6px',
                    background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority],
                  }}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  {task.aiSuggested && (
                    <span className="text-xs rounded-sm" style={{
                      padding: '2px 6px', background: 'var(--accent-muted)', color: 'var(--accent)',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>auto_awesome</span> Suggestion IA
                    </span>
                  )}
                  {task.category !== 'Manuel' && (
                    <span className="text-xs rounded-sm" style={{
                      padding: '2px 6px', background: 'var(--bg-primary)', color: 'var(--text-muted)',
                    }}>
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
              </button>
            </div>
          ))}

        {/* Done tasks */}
        {doneTasks.length > 0 && (
          <div className="mt-16">
            <div className="text-sm text-muted font-semibold mb-8">Complétées ({doneTasks.length})</div>
            {doneTasks.map(task => (
              <div key={task.id} className="flex items-center gap-12 rounded-md" style={{
                padding: '6px 14px', marginBottom: 2, opacity: 0.5,
              }}>
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-center"
                  style={{
                    width: 22, height: 22, borderRadius: 6, border: '2px solid var(--success)',
                    background: 'var(--success)', flexShrink: 0, color: 'white', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 12 }}>check</span>
                </button>
                <div className="flex-1 text-md text-muted" style={{ textDecoration: 'line-through' }}>
                  {task.title}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-title">Actions rapides</div>
        <div className="grid-3" style={{ gap: 10 }}>
          {[
            { icon: 'chat', label: 'Demander conseil à Freenzy', href: '/client/chat' },
            { icon: 'group', label: 'Lancer une réunion', href: '/client/meeting' },
            { icon: 'description', label: 'Générer un document', href: '/client/documents' },
            { icon: 'bar_chart', label: 'Voir mon dashboard', href: '/client/dashboard' },
            { icon: 'palette', label: 'Personnaliser mes agents', href: '/client/agents/customize' },
            { icon: 'bolt', label: 'Gérer mon équipe', href: '/client/team' },
          ].map(action => (
            <Link key={action.label} href={action.href} className="card flex items-center gap-8 pointer p-12" style={{
              textDecoration: 'none', color: 'inherit',
            }}>
              <span style={{ fontSize: 22 }}><span className="material-symbols-rounded" style={{ fontSize: 22 }}>{action.icon}</span></span>
              <span className="text-md font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
