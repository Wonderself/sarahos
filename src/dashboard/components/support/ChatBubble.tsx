'use client';

import { useState } from 'react';

interface ChatBubbleProps {
  onClick: () => void;
  unreadCount: number;
}

export default function ChatBubble({ onClick, unreadCount }: ChatBubbleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Ouvrir le chat support"
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#1A1A1A',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'transform 0.15s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>💬</span>

      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: -4,
          right: -4,
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          background: '#DC2626',
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 5px',
          border: '2px solid #FFFFFF',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
