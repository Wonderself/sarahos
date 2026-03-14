'use client';

import React, { useState, ReactNode } from 'react';

interface ProfileCardProps {
  title: string;
  icon: string;
  children: ReactNode;
  variant?: 'white' | 'blue' | 'amber';
  onHide?: () => void;
}

const variantStyles: Record<string, { bg: string; border: string }> = {
  white: { bg: '#FFFFFF', border: '#E5E5E5' },
  blue: { bg: '#EFF6FF', border: '#BFDBFE' },
  amber: { bg: '#FFFBEB', border: '#FDE68A' },
};

export default function ProfileCard({ title, icon, children, variant = 'white', onHide }: ProfileCardProps) {
  const [hidden, setHidden] = useState(false);
  const style = variantStyles[variant];

  if (hidden) {
    return (
      <div
        style={{
          background: '#FAFAFA',
          border: '1px solid #E5E5E5',
          borderRadius: 12,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: 16,
        }}
        onClick={() => setHidden(false)}
      >
        <span style={{ fontSize: 14, color: '#9B9B9B' }}>
          {icon} Section masquee — <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Afficher</span>
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{title}</span>
        </div>
        {onHide && (
          <button
            onClick={() => {
              setHidden(true);
              onHide();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: '#9B9B9B',
              padding: '2px 8px',
            }}
          >
            Masquer
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
