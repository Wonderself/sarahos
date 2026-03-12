'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  showCount?: boolean;
  count?: number;
}

export default function StarRating({ value, onChange, size = 20, readonly = false, showCount = false, count = 0 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || Math.round(value));
        return (
          <span
            key={star}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
            style={{
              fontSize: size,
              color: filled ? '#9B9B9B' : 'rgba(255,255,255,0.15)',
              cursor: readonly ? 'default' : 'pointer',
              transition: 'color 0.15s, transform 0.15s',
              transform: hovered === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {filled ? '⭐' : '☆'}
          </span>
        );
      })}
      {showCount && count > 0 && (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
          ({count})
        </span>
      )}
    </div>
  );
}
