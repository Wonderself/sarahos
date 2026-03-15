'use client';

import React from 'react';

interface Activity {
  user: string;
  action: string;
  agent: string;
  timestamp: string;
}

interface TeamActivityFeedProps {
  activities: Activity[];
}

export default function TeamActivityFeed({ activities }: TeamActivityFeedProps) {
  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px' }}>
        📜 Activité de l&apos;équipe
      </h2>

      {activities.length === 0 ? (
        <div style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center', padding: '12px 0' }}>
          Aucune activité récente
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 0',
                borderBottom: idx < activities.length - 1 ? '1px solid #E5E5E5' : 'none',
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#1A1A1A',
                    flexShrink: 0,
                  }}
                />
                {idx < activities.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      background: '#E5E5E5',
                      marginTop: 4,
                    }}
                  />
                )}
              </div>

              {/* Content — never shows conversation content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600 }}>{activity.user}</span>{' '}
                  {activity.action}
                  {activity.agent && (
                    <>
                      {' '}via{' '}
                      <span
                        style={{
                          fontWeight: 500,
                          color: '#6B6B6B',
                          background: '#FAFAFA',
                          border: '1px solid #E5E5E5',
                          borderRadius: 3,
                          padding: '1px 6px',
                          fontSize: 12,
                        }}
                      >
                        {activity.agent}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 4 }}>
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}
