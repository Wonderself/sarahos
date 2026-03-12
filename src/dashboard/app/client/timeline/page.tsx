'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadHistory, ACTION_META, type ActionCategory, type ActionEvent, type TimelineFilter } from '../../../lib/action-history';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

const CATEGORIES: ActionCategory[] = ['message', 'document', 'meeting', 'game', 'reward', 'referral', 'login', 'agent', 'system'];

const CATEGORY_EMOJI: Record<string, string> = {
  message: '💬',
  document: '📄',
  meeting: '👥',
  game: '🎮',
  reward: '🎁',
  referral: '👋',
  login: '🔑',
  agent: '🤖',
  system: '⚙️',
};

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

  const meta = PAGE_META.timeline;

  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--fz-text, #1A1A1A)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
        }}>
          <span style={{ fontSize: isMobile ? 26 : 32 }}>{meta.emoji}</span>
          {meta.title}
          <HelpBubble text={meta.helpText} />
        </h1>
        <p style={{ color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 14 }}>
          {meta.subtitle}
        </p>
      </div>
      <PageExplanation pageId="timeline" text={PAGE_META.timeline?.helpText} />

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la timeline..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--fz-text, #1A1A1A)', fontSize: 14,
            }}
          />
          {search && (
            <span
              onClick={() => setSearch('')}
              style={{ fontSize: 18, color: 'var(--fz-text-muted, #9B9B9B)', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</span>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => {
          const catMeta = ACTION_META[cat];
          const active = activeCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, minHeight: 44,
                background: active ? '#1A1A1A' : 'var(--fz-bg-secondary, #F7F7F7)',
                color: active ? '#fff' : 'var(--fz-text-muted, #9B9B9B)',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 14 }}>{CATEGORY_EMOJI[cat] ?? '📋'}</span>
              {catMeta.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 12, marginBottom: 28,
      }}>
        <div style={{
          background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A' }}>{events.length}</div>
          <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)', fontWeight: 600, marginTop: 2 }}>ACTIONS</div>
        </div>
        <div style={{
          background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A' }}>{dates.length}</div>
          <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)', fontWeight: 600, marginTop: 2 }}>JOURS ACTIFS</div>
        </div>
        <div style={{
          background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
          borderRadius: 12, padding: '14px', textAlign: 'center',
          
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A' }}>
            {new Set(events.filter(e => e.agentId).map(e => e.agentId)).size}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)', fontWeight: 600, marginTop: 2 }}>AGENTS UTILISÉS</div>
        </div>
      </div>

      {/* Timeline */}
      {dates.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--fz-bg-secondary, #F7F7F7)', borderRadius: 14,
          border: '1px solid var(--border-primary, #E5E5E5)',
        }}>
          <span style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>🕐</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text-secondary, #6B6B6B)', marginBottom: 6 }}>Aucune action enregistrée</div>
          <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #9B9B9B)' }}>
            Vos actions apparaîtront ici au fur et à mesure
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 8, top: 0, bottom: 0, width: 2,
            background: 'var(--fz-border, #E5E5E5)',
          }} />

          {dates.map(date => (
            <div key={date} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{
                position: 'relative', marginBottom: 14,
                fontSize: 13, fontWeight: 700, color: 'var(--fz-text-secondary, #6B6B6B)',
                textTransform: 'capitalize',
              }}>
                <div style={{
                  position: 'absolute', left: -24, top: 2, width: 12, height: 12,
                  borderRadius: '50%', background: '#1A1A1A', border: '2px solid #fff',
                }} />
                {formatDate(date)}
              </div>

              {/* Events for this date */}
              {grouped[date].map(event => {
                const catMeta = ACTION_META[event.type];
                return (
                  <div
                    key={event.id}
                    style={{
                      position: 'relative', marginBottom: 8,
                      background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                      borderRadius: 10, padding: '12px 14px',
                      display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 12,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                    }}
                  >
                    {/* Dot on timeline */}
                    <div style={{
                      position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#9B9B9B', opacity: 0.6,
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#F0F0F0', border: '1px solid #E5E5E5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {CATEGORY_EMOJI[event.type] ?? '📋'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fz-text, #1A1A1A)' }}>{event.title}</div>
                      {event.description && (
                        <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)', marginTop: 2 }}>{event.description}</div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)', fontWeight: 600, flexShrink: 0 }}>
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
