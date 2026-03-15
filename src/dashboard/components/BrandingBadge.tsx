'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { BrandingService } from '@/lib/branding';

// ─── Types ────────────────────────────────────────────────────

interface BrandingBadgeProps {
  size?: 'sm' | 'md';
}

// ─── Component ────────────────────────────────────────────────

export default function BrandingBadge({ size = 'sm' }: BrandingBadgeProps) {
  const router = useRouter();
  const [complete, setComplete] = useState<boolean | null>(null);

  useEffect(() => {
    setComplete(BrandingService.isComplete());
  }, []);

  // Don't render until hydrated
  if (complete === null) return null;

  const fontSize = size === 'sm' ? 11 : 13;
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize,
    fontWeight: 500,
    borderRadius: 12,
    padding,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    border: '1px solid',
  };

  if (complete) {
    const completeStyle: CSSProperties = {
      ...baseStyle,
      color: '#166534',
      background: '#F0FDF4',
      borderColor: '#BBF7D0',
      cursor: 'default',
    };
    return (
      <span style={completeStyle}>
        {'Branding applique'}
      </span>
    );
  }

  const incompleteStyle: CSSProperties = {
    ...baseStyle,
    color: '#92400E',
    background: '#FFFBEB',
    borderColor: '#FDE68A',
    cursor: 'pointer',
  };

  const handleClick = () => {
    router.push('/client/branding');
  };

  return (
    <span
      style={incompleteStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {'Branding incomplet'}
    </span>
  );
}
