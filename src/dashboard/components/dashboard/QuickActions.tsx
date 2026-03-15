'use client';

import React from 'react';

interface Action {
  label: string;
  icon: string;
  href: string;
}

interface QuickActionsProps {
  actions: Action[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 14px' }}>
        ⚡ Actions rapides
      </h2>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {actions.map((action, idx) => (
          <ActionButton key={idx} action={action} />
        ))}
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: Action }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={action.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 6,
        border: '1px solid #E5E5E5',
        background: hovered ? '#FAFAFA' : '#FFFFFF',
        color: '#1A1A1A',
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 16 }}>{action.icon}</span>
      {action.label}
    </a>
  );
}
