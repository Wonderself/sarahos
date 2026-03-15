'use client';

import { useState } from 'react';

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  onPrefill?: (text: string) => void;
}

const QUICK_REPLIES = [
  "C'est quoi Freenzy ?",
  "Combien ca coute ?",
  "C'est fait pour mon metier ?",
];

interface QuickAction {
  emoji: string;
  label: string;
  prefill: string;
  mode: 'prefill' | 'direct';
}

const QUICK_ACTIONS: QuickAction[] = [
  { emoji: '\uD83D\uDCC4', label: 'Nouveau devis', prefill: 'Génère un devis pour...', mode: 'prefill' },
  { emoji: '\u2709\uFE0F', label: 'Répondre à un avis', prefill: 'Rédige une réponse pour cet avis Google...', mode: 'prefill' },
  { emoji: '\uD83D\uDCAC', label: 'Support', prefill: '', mode: 'direct' },
  { emoji: '\uD83D\uDD0D', label: 'Trouver une page', prefill: 'Où est la page...', mode: 'prefill' },
];

export default function QuickReplies({ onSelect, onPrefill }: QuickRepliesProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  return (
    <div>
      {/* Quick reply suggestions */}
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

      {/* Quick action buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 8,
        paddingTop: 8,
      }}>
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              if (action.mode === 'direct') {
                // Support mode: just focus input, no prefill
                onPrefill?.('');
              } else {
                onPrefill?.(action.prefill);
              }
            }}
            onMouseEnter={() => setHoveredAction(i)}
            onMouseLeave={() => setHoveredAction(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #E5E5E5',
              background: hoveredAction === i ? '#FAFAFA' : '#FFFFFF',
              color: '#1A1A1A',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              borderColor: hoveredAction === i ? '#1A1A1A' : '#E5E5E5',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{action.emoji}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
