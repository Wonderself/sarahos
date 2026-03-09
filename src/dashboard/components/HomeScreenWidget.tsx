'use client';

import { useState } from 'react';
import type { AgentTypeId } from '../lib/agent-config';

// ─── KPI Widget ───────────────────────────────────────────────────────────────

interface KpiWidgetProps {
  credits: number;
  messages: number;
  activeAgents: number;
  streak: number;
}

export function KpiWidget({ credits, messages, activeAgents, streak }: KpiWidgetProps) {
  const kpis = [
    { label: 'Crédits', value: credits, icon: 'toll', color: credits > 30 ? '#22c55e' : credits > 10 ? '#f59e0b' : '#ef4444' },
    { label: 'Messages', value: messages, icon: 'chat_bubble', color: '#818cf8' },
    { label: 'Agents actifs', value: activeAgents, icon: 'smart_toy', color: '#a78bfa' },
    { label: 'Streak', value: `${streak}j`, icon: 'local_fire_department', color: '#fb923c' },
  ];

  return (
    <div className="hs-widget" style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${k.color}1a`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: k.color }}>{k.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Briefing Widget ──────────────────────────────────────────────────────────

interface BriefingWidgetProps {
  briefing: string;
  loading: boolean;
  onLoad: () => void;
}

export function BriefingWidget({ briefing, loading, onLoad }: BriefingWidgetProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="hs-widget" style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#fbbf24' }}>wb_sunny</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Briefing du jour</span>
        </div>
        {!briefing && !loading && (
          <button
            onClick={onLoad}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
              padding: '4px 10px', color: '#c4b5fd', fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Charger
          </button>
        )}
      </div>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
          Génération en cours...
        </div>
      )}
      {briefing && (
        <div>
          <div style={{
            fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)',
            maxHeight: expanded ? 'none' : 48, overflow: 'hidden',
          }}>
            {briefing}
          </div>
          {briefing.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none', border: 'none', color: '#c4b5fd',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', marginTop: 4, padding: 0,
              }}
            >
              {expanded ? 'Réduire' : 'Voir plus'}
            </button>
          )}
        </div>
      )}
      {!briefing && !loading && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Appuyez sur &quot;Charger&quot; pour générer votre briefing IA
        </div>
      )}
    </div>
  );
}

// ─── Tasks Widget ─────────────────────────────────────────────────────────────

interface TaskItem { id: string; text: string; done: boolean; }

interface TasksWidgetProps {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
}

export function TasksWidget({ tasks, onToggle }: TasksWidgetProps) {
  const visible = tasks.slice(0, 4);
  const remaining = tasks.length - visible.length;

  return (
    <div className="hs-widget" style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#22d3ee' }}>checklist</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Tâches du jour</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
          {tasks.filter(t => t.done).length}/{tasks.length}
        </span>
      </div>
      {visible.length === 0 && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Aucune tâche</div>
      )}
      {visible.map(t => (
        <div
          key={t.id}
          onClick={() => onToggle(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span className="material-symbols-rounded" style={{
            fontSize: 18,
            color: t.done ? '#22c55e' : 'rgba(255,255,255,0.25)',
          }}>
            {t.done ? 'check_circle' : 'radio_button_unchecked'}
          </span>
          <span style={{
            fontSize: 12, color: t.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
            textDecoration: t.done ? 'line-through' : 'none',
          }}>
            {t.text}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          +{remaining} autre{remaining > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
