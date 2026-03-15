'use client';

import { useState } from 'react';

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

const QUICK_REPLIES = [
  "C'est quoi Freenzy ?",
  "Combien ca coute ?",
  "C'est fait pour mon metier ?",
];

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: '12px 0',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
    }}>
      {QUICK_REPLIES.map((text, i) => (
        <button
          key={i}
          onClick={() => onSelect(text)}
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderRadius: 20,
            border: '1px solid #E5E5E5',
            background: hoveredIdx === i ? '#FAFAFA' : '#FFFFFF',
            color: '#1A1A1A',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s, border-color 0.15s',
            borderColor: hoveredIdx === i ? '#1A1A1A' : '#E5E5E5',
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
