'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadHistory, ACTION_META, type ActionCategory, type ActionEvent, type TimelineFilter } from '../../../lib/action-history';
import { useIsMobile } from '../../../lib/use-media-query';

const CATEGORIES: ActionCategory[] = ['message', 'document', 'meeting', 'game', 'reward', 'referral', 'login', 'agent', 'system'];

function groupByDate(events: ActionEvent[]): Record<string, ActionEvent[]> {
  const groups: Record<string, ActionEvent[]> = {};
  for (const e of events) {
    const date = e.timestamp.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(e);
  }
  return groups;
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === yesterday) return 'Hier';
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function TimelinePage() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<TimelineFilter>({});
  const [activeCategories, setActiveCategories] = useState<ActionCategory[]>([]);
  const [search, setSearch] = useState('');

  const events = useMemo(() => {
    return loadHistory({
      ...filter,
      categories: activeCategories.length > 0 ? activeCategories : undefined,
      search: search || undefined,
    });
  }, [filter, activeCategories, search]);

  const grouped = useMemo(() => groupByDate(events), [events]);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleCategory = (cat: ActionCategory) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: isMobile ? 26 : 32, color: '#7c3aed' }}>timeline</span>
          Timeline
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
          Historique de toutes vos actions sur la plateforme
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'rgba(255,255,255,0.35)' }}>search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la timeline..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14,
            }}
          />
          {search && (
            <span
              className="material-symbols-rounded"
              onClick={() => setSearch('')}
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >close</span>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => {
          const meta = ACTION_META[cat];
          const active = activeCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: active ? meta.color : 'rgba(255,255,255,0.06)',
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 12, marginBottom: 28,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed' }}>{events.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 2 }}>ACTIONS</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{dates.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 2 }}>JOURS ACTIFS</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
            {new Set(events.filter(e => e.agentId).map(e => e.agentId)).size}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 2 }}>AGENTS UTILISÉS</div>
        </div>
      </div>

      {/* Timeline */}
      {dates.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.03)', borderRadius: 14,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', marginBottom: 12, display: 'block' }}>history</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Aucune action enregistrée</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            Vos actions apparaîtront ici au fur et à mesure
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 8, top: 0, bottom: 0, width: 2,
            background: 'rgba(255,255,255,0.08)',
          }} />

          {dates.map(date => (
            <div key={date} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{
                position: 'relative', marginBottom: 14,
                fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                textTransform: 'capitalize',
              }}>
                <div style={{
                  position: 'absolute', left: -24, top: 2, width: 12, height: 12,
                  borderRadius: '50%', background: '#7c3aed', border: '2px solid #0f0720',
                }} />
                {formatDate(date)}
              </div>

              {/* Events for this date */}
              {grouped[date].map(event => {
                const meta = ACTION_META[event.type];
                return (
                  <div
                    key={event.id}
                    style={{
                      position: 'relative', marginBottom: 8,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    {/* Dot on timeline */}
                    <div style={{
                      position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: meta.color, opacity: 0.6,
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${meta.color}15`, border: `1px solid ${meta.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18, color: meta.color }}>
                        {meta.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{event.title}</div>
                      {event.description && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{event.description}</div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, flexShrink: 0 }}>
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
