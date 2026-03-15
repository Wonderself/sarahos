'use client';

import React from 'react';

interface MemberUsage {
  id: string;
  name: string;
  used: number;
}

interface CreditPoolWidgetProps {
  total: number;
  used: number;
  members: MemberUsage[];
}

export default function CreditPoolWidget({ total, used, members }: CreditPoolWidgetProps) {
  const remaining = total - used;
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  const isLow = remaining < total * 0.2;

  // Sort members by usage descending
  const sorted = [...members].sort((a, b) => b.used - a.used);

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
        💰 Pool de crédits
      </h2>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>
          {used.toLocaleString('fr-FR')} / {total.toLocaleString('fr-FR')} crédits
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isLow ? '#DC2626' : '#1A1A1A' }}>
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 8,
          borderRadius: 4,
          background: '#E5E5E5',
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(percent, 100)}%`,
            height: '100%',
            borderRadius: 4,
            background: isLow ? '#DC2626' : percent > 50 ? '#D69E2E' : '#38A169',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Low alert */}
      {isLow && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            background: '#FFF5F5',
            border: '1px solid #FECACA',
            fontSize: 12,
            color: '#DC2626',
            marginBottom: 16,
          }}
        >
          ⚠️ Moins de 20% de crédits restants ({remaining.toLocaleString('fr-FR')} crédits)
        </div>
      )}

      {/* Member breakdown */}
      {sorted.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 8 }}>
            Consommation par membre
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map((member) => {
              const memberPercent = total > 0 ? Math.round((member.used / total) * 100) : 0;
              return (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 4,
                    background: '#FAFAFA',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#1A1A1A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#9B9B9B', whiteSpace: 'nowrap' }}>
                    {member.used.toLocaleString('fr-FR')} ({memberPercent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
