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
      position: 'relative',
      height: 44,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
      borderBottom: '1px solid rgba(124,58,237,0.15)',
    }}>
      <AudienceSwitcher audience={audience} onChange={onChange} variant={variant} />
    </div>
  );
}
