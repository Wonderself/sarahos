'use client';

import AudienceSwitcher from './AudienceSwitcher';
import { AudienceType } from '../lib/audience-data';

interface AudienceStickyBarProps {
  audience: AudienceType | null;
  onChange: (value: AudienceType | null) => void;
  variant?: 'dark' | 'light';
}

export default function AudienceStickyBar({ audience, onChange, variant = 'dark' }: AudienceStickyBarProps) {
  const isDark = variant === 'dark';

  return (
    <div style={{
      position: 'fixed',
      top: 56,
      left: 0,
      right: 0,
      zIndex: 99,
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'rgba(10, 10, 15, 0.75)'
        : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      transition: 'background 0.35s',
    }}>
      <AudienceSwitcher audience={audience} onChange={onChange} variant={variant} />
    </div>
  );
}
