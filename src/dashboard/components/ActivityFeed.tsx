'use client';

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'agent' | 'payment';
  entity: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  pageSize?: number;
}

// ─── Constants ────────────────────────────────────────────

const TYPE_ICONS: Record<ActivityItem['type'], string> = {
  create: '\u2795',   // +
  update: '\u270f\ufe0f',   // pencil
  delete: '\ud83d\uddd1\ufe0f', // wastebasket
  login: '\ud83d\udd11',    // key
  agent: '\ud83e\udd16',    // robot
  payment: '\ud83d\udcb3',  // credit card
};

const TYPE_COLORS: Record<ActivityItem['type'], string> = {
  create: 'var(--success)',
  update: 'var(--accent)',
  delete: 'var(--danger)',
  login: 'var(--info)',
  agent: 'var(--purple)',
  payment: 'var(--warning)',
};

const TYPE_BG_COLORS: Record<ActivityItem['type'], string> = {
  create: 'var(--success-muted)',
  update: 'var(--accent-muted)',
  delete: 'var(--danger-muted)',
  login: 'var(--info-muted)',
  agent: 'var(--purple-muted)',
  payment: 'var(--warning-muted)',
};

// ─── Relative time ────────────────────────────────────────

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  if (isNaN(then)) return timestamp;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'il y a quelques secondes';
  if (minutes === 1) return 'il y a 1 min';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours === 1) return 'il y a 1 heure';
  if (hours < 24) return `il y a ${hours} heures`;
  if (days === 1) return 'il y a 1 jour';
  if (days < 7) return `il y a ${days} jours`;
  if (weeks === 1) return 'il y a 1 semaine';
  if (weeks < 5) return `il y a ${weeks} semaines`;
  if (months === 1) return 'il y a 1 mois';
  return `il y a ${months} mois`;
}

// ─── Component ────────────────────────────────────────────

export default function ActivityFeed({ items, pageSize = 10 }: ActivityFeedProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

  // Empty state
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>
          {'\ud83d\udcad'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          Aucune activite recente
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Timeline vertical line */}
      <div
        style={{
          position: 'absolute',
          left: 19,
          top: 6,
          bottom: hasMore ? 52 : 6,
          width: 2,
          background: 'var(--border-secondary)',
          borderRadius: 1,
        }}
      />

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: 14,
              padding: '12px 0',
              position: 'relative',
              opacity: 0,
              animation: `activityFadeIn 0.3s ease-out ${index * 0.04}s forwards`,
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: TYPE_BG_COLORS[item.type],
                border: `2px solid ${TYPE_COLORS[item.type]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {TYPE_ICONS[item.type]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.entity}
                </span>
                {item.user && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                    }}
                  >
                    par {item.user}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginTop: 2,
                }}
              >
                {item.description}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {relativeTime(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div style={{ textAlign: 'center', paddingTop: 12, position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 20px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              btn.style.background = 'var(--accent-muted)';
              btn.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              btn.style.background = 'var(--bg-secondary)';
              btn.style.color = 'var(--text-secondary)';
            }}
          >
            Voir plus
            <span style={{ fontSize: 11 }}>
              ({items.length - visibleCount} restant{items.length - visibleCount > 1 ? 's' : ''})
            </span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes activityFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
