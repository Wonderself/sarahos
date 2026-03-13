'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { loadHistory, ACTION_META, type ActionCategory, type ActionEvent, type TimelineFilter } from '../../../lib/action-history';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

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
    <div style={{ ...pageContainer(isMobile), maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta.emoji}</span>
          <h1 style={CU.pageTitle}>{meta.title}</h1>
          <HelpBubble text={meta.helpText} />
          <PageExplanation pageId="timeline" text={PAGE_META.timeline?.helpText} />
        </div>
        <p style={CU.pageSubtitle}>
          {meta.subtitle}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: CU.bgSecondary, border: `1px solid ${CU.border}`,
          borderRadius: 8, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la timeline..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: CU.text, fontSize: 14,
            }}
          />
          {search && (
            <span
              onClick={() => setSearch('')}
              style={{ fontSize: 18, color: CU.textMuted, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                ...CU.btnSmall,
                minHeight: 44,
                fontWeight: 700,
                background: active ? CU.accent : CU.bgSecondary,
                color: active ? '#fff' : CU.textMuted,
                border: active ? 'none' : `1px solid ${CU.border}`,
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
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 28 }}>
        <div style={{ ...CU.card, textAlign: 'center' as const }}>
          <div style={CU.statValue}>{events.length}</div>
          <div style={CU.statLabel}>ACTIONS</div>
        </div>
        <div style={{ ...CU.card, textAlign: 'center' as const }}>
          <div style={CU.statValue}>{dates.length}</div>
          <div style={CU.statLabel}>JOURS ACTIFS</div>
        </div>
        <div style={{ ...CU.card, textAlign: 'center' as const }}>
          <div style={CU.statValue}>
            {new Set(events.filter(e => e.agentId).map(e => e.agentId)).size}
          </div>
          <div style={CU.statLabel}>AGENTS UTILISÉS</div>
        </div>
      </div>

      {/* Timeline */}
      {dates.length === 0 ? (
        <div style={{
          ...CU.emptyState,
          background: CU.bgSecondary,
          borderRadius: 8,
          border: `1px solid ${CU.border}`,
        }}>
          <div style={CU.emptyEmoji}>🕐</div>
          <div style={CU.emptyTitle}>Aucune action enregistrée</div>
          <div style={CU.emptyDesc}>
            Vos actions apparaîtront ici au fur et à mesure
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 8, top: 0, bottom: 0, width: 2,
            background: CU.border,
          }} />

          {dates.map(date => (
            <div key={date} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{
                position: 'relative', marginBottom: 14,
                fontSize: 13, fontWeight: 700, color: CU.textSecondary,
                textTransform: 'capitalize',
              }}>
                <div style={{
                  position: 'absolute', left: -24, top: 2, width: 12, height: 12,
                  borderRadius: '50%', background: CU.accent, border: '2px solid #fff',
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
                      ...CU.card,
                      position: 'relative', marginBottom: 8,
                      display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 12,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                    }}
                  >
                    {/* Dot on timeline */}
                    <div style={{
                      position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: CU.textMuted, opacity: 0.6,
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: CU.bgSecondary, border: `1px solid ${CU.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {CATEGORY_EMOJI[event.type] ?? '📋'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: CU.text }}>{event.title}</div>
                      {event.description && (
                        <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 2 }}>{event.description}</div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ fontSize: 11, color: CU.textMuted, fontWeight: 600, flexShrink: 0 }}>
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
